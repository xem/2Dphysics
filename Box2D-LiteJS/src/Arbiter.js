/*
* Copyright (c) 2006-2009 Erin Catto http://www.gphysics.com
*
* Permission to use, copy, modify, distribute and sell this software
* and its documentation for any purpose is hereby granted without fee,
* provided that the above copyright notice appear in all copies.
* Erin Catto makes no representations about the suitability 
* of this software for any purpose.  
* It is provided "as is" without express or implied warranty.
*
*
* Ported from C to JavaScript by David Logue, 2020
*  ____  _               _   _           _       _
* / ___|| | _____      _| | | | __ _  __| | ___ | | _____ _ __
* \___ \| |/ _ \ \ /\ / / |_| |/ _` |/ _` |/ _ \| |/ / _ \ '_ \
*  ___) | | (_) \ V  V /|  _  | (_| | (_| | (_) |   <  __/ | | |
* |____/|_|\___/ \_/\_/ |_| |_|\__,_|\__,_|\___/|_|\_\___|_| |_|
*/

function Edges() {
  this.inEdge1 = EdgeNumbers.NO_EDGE;  // enum EdgeNumbers
  this.outEdge1 = EdgeNumbers.NO_EDGE;
  this.inEdge2 = EdgeNumbers.NO_EDGE;
  this.outEdge2 = EdgeNumbers.NO_EDGE;
}

function FeaturePair() {
  this.e = new Edges();
  this.value = 0;
}
// INSTANCE METHOD
FeaturePair.prototype.flip = function flip() {
  let tempIn = this.e.inEdge1;
  this.e.inEdge1 = this.e.inEdge2;
  this.e.inEdge2 = tempIn;

  let tempOut = this.e.outEdge1;
  this.e.outEdge1 = this.e.outEdge2;
  this.e.outEdge2 = tempOut;
};

function Contact() {
  this.position = new Vec2();
  this.normal = new Vec2();
  this.r1 = new Vec2();
  this.r2 = new Vec2();
  this.separation = 0;
  this.Pn = 0;	// accumulated normal impulse
  this.Pt = 0;	// accumulated tangent impulse
  this.Pnb = 0;	// accumulated normal impulse for position bias
  this.massNormal = 0;
  this.massTangent = 0;
  this.bias = 0;
  this.feature = new FeaturePair();
}

Contact.prototype.render = function render(ctx) {
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, 2, 0, 2 * Math.PI);
  ctx.stroke();
};

function ArbiterKey(bodyA, bodyB) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  this.value = bodyA.id + ":" + bodyB.id;
}

// Arbiter(Body* b1, Body* b2)
function Arbiter(w, b1, b2) {
  this.world = w;

  if (b1.id < b2.id) {
    this.body1 = b1;
    this.body2 = b2;
  } else {
    this.body1 = b2;
    this.body2 = b1;
  }

  this.contacts = []; // [MAX_POINTS=2];
  this.numContacts = collide(this.contacts, this.body1, this.body2);

  // Combined friction
  this.friction = Math.sqrt(this.body1.friction * this.body2.friction);
}

// Update(Contact* newContacts, int numNewContacts)
Arbiter.prototype.update = function(newContacts, numNewContacts) {
  let mergedContacts = []; // length <= 2 contacts

  for (let i = 0; i < numNewContacts; ++i) {
    let cNew = newContacts[i];
    let k = -1;

    for (let j = 0; j < this.numContacts; ++j) {
      let cOld = this.contacts[j];

      if (cNew.feature.value === cOld.feature.value) {
        k = j;
        break;
      }
    } // end of inner j loop

    if (k > -1) {
      let cOld = this.contacts[k];

      if (this.world.warmStarting) {
        cNew.Pn = cOld.Pn;
        cNew.Pt = cOld.Pt;
        cNew.Pnb = cOld.Pnb;
      } else {
        cNew.Pn = 0;
        cNew.Pt = 0;
        cNew.Pnb = 0;
      }

      mergedContacts[i] = cNew;
    } else {
      mergedContacts[i] = newContacts[i];
    }
  } // end of outter i loop

  this.contacts = mergedContacts;
  this.numContacts = numNewContacts;
};

// PreStep(float inv_dt)
Arbiter.prototype.preStep = function preStep(inv_dt) {
  const k_allowedPenetration = 0.01; // aka "slop"
  let k_biasFactor = this.world.positionCorrection ? 0.2 : 0;

  for (let i = 0; i < this.numContacts; ++i) {

    let c = this.contacts[i];

    let r1 = Vec2.sub(c.position, this.body1.position);
    let r2 = Vec2.sub(c.position, this.body2.position);

    // Precompute normal mass, tangent mass, and bias.
    let rn1 = Vec2.dot(r1, c.normal);
    let rn2 = Vec2.dot(r2, c.normal);
    let kNormal = this.body1.invMass + this.body2.invMass;
    kNormal += this.body1.invI * (Vec2.dot(r1, r1) - rn1 * rn1) + 
      this.body2.invI * (Vec2.dot(r2, r2) - rn2 * rn2);
    c.massNormal = 1 / kNormal;

    let tangent = Vec2.crossVS(c.normal, 1);
    let rt1 = Vec2.dot(r1, tangent);
    let rt2 = Vec2.dot(r2, tangent);
    let kTangent = this.body1.invMass + this.body2.invMass;
    kTangent += this.body1.invI * (Vec2.dot(r1, r1) - rt1 * rt1) + 
      this.body2.invI * (Vec2.dot(r2, r2) - rt2 * rt2);
    c.massTangent = 1 /  kTangent;

    c.bias = -k_biasFactor * inv_dt * Math.min(0, c.separation + k_allowedPenetration);

    if (this.world.accumulateImpulses) {
      // Apply normal + friction impulse
      let P = Vec2.add(Vec2.mulSV(c.Pn, c.normal), Vec2.mulSV(c.Pt, tangent));

      this.body1.velocity.sub(Vec2.mulSV(this.body1.invMass, P));
      this.body1.angularVelocity -= this.body1.invI * Vec2.crossVV(r1, P);

      this.body2.velocity.add(Vec2.mulSV(this.body2.invMass, P));
      this.body2.angularVelocity += this.body2.invI * Vec2.crossVV(r2, P);
    }
  }
};

// ApplyImpulse()
Arbiter.prototype.applyImpulse = function applyImpulse() {
  let b1 = this.body1;
  let b2 = this.body2;

  for (let i = 0; i < this.numContacts; ++i) {
    let c = this.contacts[i];
    c.r1 = Vec2.sub(c.position, b1.position);
    c.r2 = Vec2.sub(c.position, b2.position);

    // Relative velocity at contact
    let dv = Vec2.sub(
      Vec2.sub(Vec2.add(b2.velocity, Vec2.crossSV(b2.angularVelocity, c.r2)), b1.velocity),
      Vec2.crossSV(b1.angularVelocity, c.r1)
    );

    // Compute normal impulse
    let vn = Vec2.dot(dv, c.normal);

    let dPn = c.massNormal * (-vn + c.bias);

    if (this.world.accumulateImpulses) {
      // Clamp the accumulated impulse
      let Pn0 = c.Pn;
      c.Pn = Math.max(Pn0 + dPn, 0);
      dPn = c.Pn - Pn0;
    } else {
      dPn = Math.max(dPn, 0);
    }

    // Apply contact impulse
    let Pn = Vec2.mulSV(dPn, c.normal);

    b1.velocity.sub(Vec2.mulSV(b1.invMass, Pn));
    b1.angularVelocity -= b1.invI * Vec2.crossVV(c.r1, Pn);

    b2.velocity.add(Vec2.mulSV(b2.invMass, Pn));
    b2.angularVelocity += b2.invI * Vec2.crossVV(c.r2, Pn);

    // Relative velocity at contact
    dv = Vec2.sub(
      Vec2.sub(Vec2.add(b2.velocity, Vec2.crossSV(b2.angularVelocity, c.r2)), b1.velocity),
      Vec2.crossSV(b1.angularVelocity, c.r1)
    );

    let tangent = Vec2.crossVS(c.normal, 1);
    let vt = Vec2.dot(dv, tangent);
    let dPt = c.massTangent * (-vt);

    if (this.world.accumulateImpulses) {
      // Compute friction impulse
      let maxPt = this.friction * c.Pn;

      // Clamp friction
      let oldTangentImpulse = c.Pt;
      c.Pt = clamp(oldTangentImpulse + dPt, -maxPt, maxPt);
      dPt = c.Pt - oldTangentImpulse;
    } else {
      let maxPt = this.friction * dPn;
      dPt = clamp(dPt, -maxPt, maxPt);
    }

    // Apply contact impulse
    let Pt = Vec2.mulSV(dPt, tangent);

    b1.velocity.sub(Vec2.mulSV(b1.invMass, Pt));
    b1.angularVelocity -= b1.invI * Vec2.crossVV(c.r1, Pt);

    b2.velocity.add(Vec2.mulSV(b2.invMass, Pt));
    b2.angularVelocity += b2.invI * Vec2.crossVV(c.r2, Pt);
  }
};

// key value pair
// Arbiter and ArbiterKey
function ArbiterPair(arbitKey, arbiter) {
  this.first = arbitKey;
  this.second = arbiter;
}
