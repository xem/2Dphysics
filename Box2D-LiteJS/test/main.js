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

// You can copy and paste this code below into CodePen or JSFiddle
// CodePen demo here @ https://codepen.io/Daboo/pen/RwNrXbL

// HTML
// <canvas id="box2dlitecanvas"></canvas>

// JavaScript

let canvas = document.getElementById("box2dlitecanvas");
let context = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 300;

//////////////////////////////////////////////////////////////////////////////////////
// MathUtils.js

const k_pi = 3.14159265358979323846264;

function clamp(a, low, high) { return Math.max(low, Math.min(a, high)); }

// 2D VECTOR OBJECT
function Vec2(x=0, y=0) { this.x = x; this.y = y; }
// INSTANCE METHODS
Vec2.prototype.set = function set(x, y) { this.x = x; this.y = y; };
Vec2.prototype.add = function add(v) { this.x += v.x; this.y += v.y; };
Vec2.prototype.sub = function sub(v) { this.x -= v.x; this.y -= v.y; };
Vec2.prototype.mul = function mul(s) { this.x *= s; this.y *= s; };
// STATIC METHODS
Vec2.add = function add(vA, vB) { return new Vec2(vA.x + vB.x, vA.y + vB.y); };
Vec2.sub = function sub(vA, vB) { return new Vec2(vA.x - vB.x, vA.y - vB.y); };
Vec2.mulVV = function mulVV(vA, vB) { return new Vec2(vA.x * vB.x, vA.y * vB.y); };
Vec2.mulSV = function mulSV(s, v) { return new Vec2(s * v.x, s * v.y); };
Vec2.abs = function abs(v) { return new Vec2(Math.abs(v.x), Math.abs(v.y)); };
Vec2.neg = function neg(v) { return new Vec2(-v.x, -v.y); };
Vec2.length = function length(v) { return Math.sqrt(v.x * v.x + v.y * v.y); };
Vec2.dot = function dot(vA, vB) { return vA.x * vB.x + vA.y * vB.y; };
Vec2.crossVV = function crossVV(vA, vB) { return vA.x * vB.y - vA.y * vB.x; };
Vec2.crossVS = function crossVS(v, s) { return new Vec2(s * v.y, -s * v.x); };
Vec2.crossSV = function crossSV(s, v) { return new Vec2(-s * v.y, s * v.x); };

// 2x2 Matrix
function Mat22(aOvA, vB) {
  this.col1 = new Vec2();
  this.col2 = new Vec2();
  if (typeof aOvA === "number" && vB === undefined) {
    let c = Math.cos(aOvA), s = Math.sin(aOvA);
    this.col1.set( c, s); // |cosθ -sinθ|
    this.col2.set(-s, c); // |sinθ  conθ|
  } else if (typeof aOvA === "object" && typeof vB === "object") {
    this.col1 = aOvA; // |col1.x  col2.x|
    this.col2 = vB;   // |col1.y  col2.y|
  }
}
// STATIC METHODS
Mat22.add = function add(mA, mB) {
  return new Mat22(Vec2.add(mA.col1, mB.col1), Vec2.add(mA.col2, mB.col2));
};

Mat22.mulMV = function mulMV(m, v) {
  return new Vec2(m.col1.x * v.x + m.col2.x * v.y, m.col1.y * v.x + m.col2.y * v.y);
};

Mat22.mulMM = function mulMM(mA, mB) {
  return new Mat22(Mat22.mulMV(mA, mB.col1), Mat22.mulMV(mA, mB.col2));
};

Mat22.abs = function abs(m) {
  return new Mat22(Vec2.abs(m.col1), Vec2.abs(m.col2));
};

Mat22.transpose = function transpose(m) {
  return new Mat22(new Vec2(m.col1.x, m.col2.x), new Vec2(m.col1.y, m.col2.y));
};

Mat22.invert = function invert(m) {
  let a = m.col1.x, b = m.col2.x, c = m.col1.y, d = m.col2.y;
  let B = new Mat22();     // adjugate matrix
  let det = a * d - b * c; // determinant
  // one divided by the determinant, multiplied by adjugate matrix
  det = 1 / det;
  B.col1.x = det *  d; B.col2.x = det * -b;
  B.col1.y = det * -c; B.col2.y = det *  a;
  return B;
};

/////////////////////////////////////////////////////////////////////////////////////
// Arbiter.js

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

//////////////////////////////////////////////////////////////////////////////////////
// Body.js

function Body() {
  this.position = new Vec2();
  this.rotation = 0;

  this.velocity = new Vec2();
  this.angularVelocity = 0;

  this.force = new Vec2();
  this.torque = 0;

  this.width = new Vec2();

  this.friction = 0.2;
  this.mass = Number.MAX_VALUE;
  this.invMass = 0;
  this.I = Number.MAX_VALUE;
  this.invI = 0;

  this.id = 0;
}
// INSTANCE METHODS
// set(Vec2 w, Number m)
// w: width, m: mass
Body.prototype.set = function set(w, m) {
  this.width = w;
  this.mass = m;

  if (this.mass < Number.MAX_VALUE) {
    this.invMass = 1 / this.mass;
    this.I = this.mass * (this.width.x * this.width.x + this.width.y * this.width.y) / 12;
    this.invI = 1 / this.I;
  } else {
    this.invMass = 0;
    this.I = Number.MAX_VALUE;
    this.invI = 0;
  }
};

// addForce(Vec2 f)
// f: force
Body.prototype.addForce = function addForce(f) {
  this.force.add(f);
};

Body.prototype.render = function render(ctx) {
  let R = new Mat22(this.rotation);    // Mat22
  let x = this.position;               // Vec2
  let h = Vec2.mulSV(0.5, this.width); // Vec2
  
  // linear and rotational position of vertices
  let v1 = Vec2.add(x, Mat22.mulMV(R, new Vec2(-h.x, -h.y))); // Vec2
  let v2 = Vec2.add(x, Mat22.mulMV(R, new Vec2( h.x, -h.y))); // Vec2
  let v3 = Vec2.add(x, Mat22.mulMV(R, new Vec2( h.x,  h.y))); // Vec2
  let v4 = Vec2.add(x, Mat22.mulMV(R, new Vec2(-h.x,  h.y))); // Vec2
  // orientation line
  let o = Vec2.add(x, Mat22.mulMV(R, new Vec2(h.x,  0))); // Vec2
  
  // draw centroid of rectangle
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, 2, 0, 2 * Math.PI);
  ctx.stroke();
  // draw shape
  ctx.beginPath();
  ctx.moveTo(v1.x, v1.y);
  ctx.lineTo(v2.x, v2.y);
  ctx.lineTo(v3.x, v3.y);
  ctx.lineTo(v4.x, v4.y);
  ctx.lineTo(v1.x, v1.y);
  ctx.stroke();
  // draw orientation line
  ctx.beginPath();
  ctx.moveTo(x.x, x.y);
  ctx.lineTo(o.x, o.y);
  ctx.stroke();
};

//////////////////////////////////////////////////////////////////////////////////////
// Collide.js

// Box vertex and edge numbering:
//
//        ^ y
//        |
//        e1
//   v2 ------ v1
//    |        |
// e2 |        | e4  --> x
//    |        |
//   v3 ------ v4
//        e3

let Axis = {
  FACE_A_X: 0,
  FACE_A_Y: 1,
  FACE_B_X: 2,
  FACE_B_Y: 3
};

let EdgeNumbers = {
  NO_EDGE: 0,
  EDGE1: 1,
  EDGE2: 2,
  EDGE3: 3,
  EDGE4: 4
};

function ClipVertex() {
  this.v = new Vec2();
  this.fp = new FeaturePair();
}

// Number clipSegmentToLine(ClipVertex vOut[2], ClipVertex vIn[2], const Vec2& normal, float offset, char clipEdge)
function clipSegmentToLine(vOut, vIn, normal, offset, clipEdge) {
  // Start with no output points
  let numOut = 0;

  // Calculate the distance of end points to the line
  let distance0 = Vec2.dot(normal, vIn[0].v) - offset;
  let distance1 = Vec2.dot(normal, vIn[1].v) - offset;

  // If the points are behind the plane
  if (distance0 <= 0) { vOut[numOut] = vIn[0]; numOut++; }
  if (distance1 <= 0) { vOut[numOut] = vIn[1]; numOut++; }

  // If the points are on different sides of the plane
  if (distance0 * distance1 < 0) {
    // Find intersection point of edge and plane
    let interp = distance0 / (distance0 - distance1);

    vOut[numOut] = new ClipVertex();

    vOut[numOut].v = Vec2.add(vIn[0].v, Vec2.mulSV(interp , Vec2.sub(vIn[1].v, vIn[0].v)));

    if (distance0 > 0) {
      vOut[numOut].fp = vIn[0].fp;
      vOut[numOut].fp.e.inEdge1 = clipEdge;
      vOut[numOut].fp.e.inEdge2 = EdgeNumbers.NO_EDGE;
    } else {
      vOut[numOut].fp = vIn[1].fp;
      vOut[numOut].fp.e.outEdge1 = clipEdge;
      vOut[numOut].fp.e.outEdge2 = EdgeNumbers.NO_EDGE;
    }

    numOut++;
  }

  return numOut;
}

// static void computeIncidentEdge(ClipVertex c[2], const Vec2& h, const Vec2& pos, const Mat22& Rot, const Vec2& normal)
function computeIncidentEdge(c, h, pos, Rot, normal) {
  // The normal is from the reference box.
  // Convert it to the incident boxe's frame and flip sign.
  let RotT = Mat22.transpose(Rot);             // Mat22
  let n = Vec2.neg(Mat22.mulMV(RotT, normal)); // Vec2
  let nAbs = Vec2.abs(n);                      // Vec2

  c[0] = new ClipVertex();
  c[1] = new ClipVertex();

  if (nAbs.x > nAbs.y) {
    if (Math.sign(n.x) > 0) {
      c[0].v.set(h.x, -h.y);
      c[0].fp.e.inEdge2 = EdgeNumbers.EDGE3;
      c[0].fp.e.outEdge2 = EdgeNumbers.EDGE4;

      c[1].v.set(h.x, h.y);
      c[1].fp.e.inEdge2 = EdgeNumbers.EDGE4;
      c[1].fp.e.outEdge2 = EdgeNumbers.EDGE1;
    } else {
      c[0].v.set(-h.x, h.y);
      c[0].fp.e.inEdge2 = EdgeNumbers.EDGE1;
      c[0].fp.e.outEdge2 = EdgeNumbers.EDGE2;

      c[1].v.set(-h.x, -h.y);
      c[1].fp.e.inEdge2 = EdgeNumbers.EDGE2;
      c[1].fp.e.outEdge2 = EdgeNumbers.EDGE3;
    }
  } else {
    if (Math.sign(n.y) > 0) {
      c[0].v.set(h.x, h.y);
      c[0].fp.e.inEdge2 = EdgeNumbers.EDGE4;
      c[0].fp.e.outEdge2 = EdgeNumbers.EDGE1;

      c[1].v.set(-h.x, h.y);
      c[1].fp.e.inEdge2 = EdgeNumbers.EDGE1;
      c[1].fp.e.outEdge2 = EdgeNumbers.EDGE2;
    } else {
      c[0].v.set(-h.x, -h.y);
      c[0].fp.e.inEdge2 = EdgeNumbers.EDGE2;
      c[0].fp.e.outEdge2 = EdgeNumbers.EDGE3;

      c[1].v.set(h.x, -h.y);
      c[1].fp.e.inEdge2 = EdgeNumbers.EDGE3;
      c[1].fp.e.outEdge2 = EdgeNumbers.EDGE4;
    }
  }

  c[0].v = Vec2.add(pos, Mat22.mulMV(Rot, c[0].v));
  c[1].v = Vec2.add(pos, Mat22.mulMV(Rot, c[1].v));
}

// int collide(Contact* contacts, Body* bodyA, Body* bodyB)
function collide(contacts, bodyA, bodyB) {
  // Setup
  let hA = Vec2.mulSV(0.5, bodyA.width); // half the width of bodyA
  let hB = Vec2.mulSV(0.5, bodyB.width); // half the width of bodyB

  let posA = bodyA.position;
  let posB = bodyB.position;

  let RotA = new Mat22(bodyA.rotation);
  let RotB = new Mat22(bodyB.rotation);

  let RotAT = Mat22.transpose(RotA);
  let RotBT = Mat22.transpose(RotB);

  let dp = Vec2.sub(posB, posA);   // Vec2
  let dA = Mat22.mulMV(RotAT, dp); // Vec2
  let dB = Mat22.mulMV(RotBT, dp); // Vec2

  let C = Mat22.mulMM(RotAT, RotB);
  let absC = Mat22.abs(C);
  let absCT = Mat22.transpose(absC);

  // Box A faces
  let faceA = Vec2.sub(Vec2.sub(Vec2.abs(dA), hA), Mat22.mulMV(absC, hB));
  if (faceA.x > 0 || faceA.y > 0) {
    return 0;
  }

  // Box B faces
  let faceB = Vec2.sub(Vec2.sub(Vec2.abs(dB), Mat22.mulMV(absCT, hA)), hB);
  if (faceB.x > 0 || faceB.y > 0) {
    return 0;
  }

  // Find best axis
  let axis;       // Axis enum
  let separation; // number
  let normal;     // Vec2

  // Box A faces
  axis = Axis.FACE_A_X;
  separation = faceA.x;
  normal = dA.x > 0 ? RotA.col1 : Vec2.neg(RotA.col1);

  const RELATIVE_TOL = 0.95;
  const ABSOLUTE_TOL = 0.01;

  if (faceA.y > RELATIVE_TOL * separation + ABSOLUTE_TOL * hA.y) {
    axis = Axis.FACE_A_Y;
    separation = faceA.y;
    normal = dA.y > 0 ? RotA.col2 : Vec2.neg(RotA.col2);
  }

  // Box B faces
  if (faceB.x > RELATIVE_TOL * separation + ABSOLUTE_TOL * hB.x) {
    axis = Axis.FACE_B_X;
    separation = faceB.x;
    normal = dB.x > 0 ? RotB.col1 : Vec2.neg(RotB.col1);
  }

  if (faceB.y > RELATIVE_TOL * separation + ABSOLUTE_TOL * hB.y) {
    axis = Axis.FACE_B_Y;
    separation = faceB.y;
    normal = dB.y > 0 ? RotB.col2 : Vec2.neg(RotB.col2);
  }

  // Setup clipping plane data based on the separating axis
  let frontNormal;       // Vec2
  let sideNormal;        // Vec2
  let incidentEdge = []; // ClipVertex[2]
  let front;             // Number
  let negSide;           // Number
  let posSide;           // Number
  let negEdge;           // EdgeNumber
  let posEdge;           // EdgeNumber

  // Compute the clipping lines and the line segment to be clipped.
  switch (axis) {
    case Axis.FACE_A_X: {
      frontNormal = normal;
      front = Vec2.dot(posA, frontNormal) + hA.x;
      sideNormal = RotA.col2;
      let side = Vec2.dot(posA, sideNormal);
      negSide = -side + hA.y;
      posSide =  side + hA.y;
      negEdge = EdgeNumbers.EDGE3;
      posEdge = EdgeNumbers.EDGE1;
      computeIncidentEdge(incidentEdge, hB, posB, RotB, frontNormal);
    }
      break;

    case Axis.FACE_A_Y: {
      frontNormal = normal;
      front = Vec2.dot(posA, frontNormal) + hA.y;
      sideNormal = RotA.col1;
      let side = Vec2.dot(posA, sideNormal);
      negSide = -side + hA.x;
      posSide =  side + hA.x;
      negEdge = EdgeNumbers.EDGE2;
      posEdge = EdgeNumbers.EDGE4;
      computeIncidentEdge(incidentEdge, hB, posB, RotB, frontNormal);
    }
      break;

    case Axis.FACE_B_X: {
      frontNormal = Vec2.neg(normal);
      front = Vec2.dot(posB, frontNormal) + hB.x;
      sideNormal = RotB.col2;
      let side = Vec2.dot(posB, sideNormal);
      negSide = -side + hB.y;
      posSide =  side + hB.y;
      negEdge = EdgeNumbers.EDGE3;
      posEdge = EdgeNumbers.EDGE1;
      computeIncidentEdge(incidentEdge, hA, posA, RotA, frontNormal);
    }
      break;

    case Axis.FACE_B_Y: {
      frontNormal = Vec2.neg(normal);
      front = Vec2.dot(posB, frontNormal) + hB.y;
      sideNormal = RotB.col1;
      let side = Vec2.dot(posB, sideNormal);
      negSide = -side + hB.x;
      posSide =  side + hB.x;
      negEdge = EdgeNumbers.EDGE2;
      posEdge = EdgeNumbers.EDGE4;
      computeIncidentEdge(incidentEdge, hA, posA, RotA, frontNormal);
    }
      break;
  }

  // clip other face with 5 box planes (1 face plane, 4 edge planes)

  let clipPoints1 = []; // ClipVertex[2]
  let clipPoints2 = []; // ClipVertex[2]
  let np;               // Number

  // Clip to box side 1
  np = clipSegmentToLine(clipPoints1, incidentEdge, Vec2.neg(sideNormal), negSide, negEdge);

  if (np < 2) { return 0; }

  // Clip to negative box side 1
  np = clipSegmentToLine(clipPoints2, clipPoints1,  sideNormal, posSide, posEdge);

  if (np < 2) { return 0; }

  // Now clipPoints2 contains the clipping points.
  // Due to roundoff, it is possible that clipping removes all points.

  let numContacts = 0;

  for (let i = 0; i < 2; ++i) {
    let separation = Vec2.dot(frontNormal, clipPoints2[i].v) - front;

    if (separation <= 0) {
      contacts[numContacts] = new Contact();

      contacts[numContacts].separation = separation;
      contacts[numContacts].normal = normal;
      // slide contact point onto reference face (easy to cull)
      contacts[numContacts].position = Vec2.sub(clipPoints2[i].v, Vec2.mulSV(separation, frontNormal));
      contacts[numContacts].feature = clipPoints2[i].fp;
      if (axis === Axis.FACE_B_X || axis === Axis.FACE_B_Y) {
        contacts[numContacts].feature.flip();
      }

      let fpEdge = contacts[numContacts].feature.e;
      contacts[numContacts].feature.value = fpEdge.inEdge1 + ":" + fpEdge.outEdge1 + ":" +
        fpEdge.inEdge2 + ":" + fpEdge.outEdge2;
      numContacts++;
    }
  }

  return numContacts;
}

//////////////////////////////////////////////////////////////////////////////////////
// Joint.js

function Joint() {
  this.M = new Mat22();
  this.localAnchor1 = new Vec2();
  this.localAnchor2 = new Vec2();
  this.r1 = new Vec2();
  this.r2 = new Vec2();
  this.bias = new Vec2();
  this.P = new Vec2(); // accumulated impulse
  this.world = undefined;
  this.body1 = undefined;
  this.body2 = undefined;
  this.biasFactor = 0.2;
  this.softness = 0;
}

// Set(Body* body1, Body* body2, const Vec2& anchor);
Joint.prototype.set = function set(w, b1, b2, anchor) {
  this.world = w;
  this.body1 = b1;
  this.body2 = b2;

  let Rot1 = new Mat22(this.body1.rotation);
  let Rot2 = new Mat22(this.body2.rotation);
  let Rot1T = Mat22.transpose(Rot1);
  let Rot2T = Mat22.transpose(Rot2);

  this.localAnchor1 = Mat22.mulMV(Rot1T, Vec2.sub(anchor, this.body1.position));
  this.localAnchor2 = Mat22.mulMV(Rot2T, Vec2.sub(anchor, this.body2.position));
};

// void PreStep(float inv_dt);
Joint.prototype.preStep = function preStep(inv_dt) {
  // Pre-compute anchors, mass matrix, and bias.
  let Rot1 = new Mat22(this.body1.rotation);
  let Rot2 = new Mat22(this.body2.rotation);

  this.r1 = Mat22.mulMV(Rot1, this.localAnchor1);
  this.r2 = Mat22.mulMV(Rot2, this.localAnchor2);

  // inverse mass matrix
  let K1 = new Mat22();
  K1.col1.x = this.body1.invMass + this.body2.invMass;
  K1.col1.y = 0;                                       // | col1.x col2.x |
  K1.col2.x = 0;                                       // | col1.y col2.y |
  K1.col2.y = this.body1.invMass + this.body2.invMass;

  // body1 rotational mass matrix i.e. moment of inertia
  let K2 = new Mat22();
  K2.col1.x =  this.body1.invI * this.r1.y * this.r1.y;
  K2.col1.y = -this.body1.invI * this.r1.x * this.r1.y; // | col1.x col2.x |
  K2.col2.x = -this.body1.invI * this.r1.x * this.r1.y; // | col1.y col2.y |
  K2.col2.y =  this.body1.invI * this.r1.x * this.r1.x;

  // body2 rotational mass matrix i.e. moment of inertia
  let K3 = new Mat22();
  K3.col1.x =  this.body2.invI * this.r2.y * this.r2.y;
  K3.col1.y = -this.body2.invI * this.r2.x * this.r2.y; // | col1.x col2.x |
  K3.col2.x = -this.body2.invI * this.r2.x * this.r2.y; // | col1.y col2.y |
  K3.col2.y =  this.body2.invI * this.r2.x * this.r2.x;

  let K = Mat22.add(Mat22.add(K1, K2), K3 );
  K.col1.x += this.softness;
  K.col2.y += this.softness;

  this.M = Mat22.invert(K);

  let p1 = Vec2.add(this.body1.position, this.r1);
  let p2 = Vec2.add(this.body2.position, this.r2);
  let dp = Vec2.sub(p2, p1);

  if (this.world.positionCorrection) {
    this.bias = Vec2.mulSV(-this.biasFactor, Vec2.mulSV(inv_dt, dp));
  } else {
    this.bias.set(0, 0);
  }

  if (this.world.warmStarting) {
    // Apply accumulated impulse.
    this.body1.velocity.sub(Vec2.mulSV(this.body1.invMass, this.P));
    this.body1.angularVelocity -= this.body1.invI * Vec2.crossVV(this.r1, this.P);

    this.body2.velocity.add(Vec2.mulSV(this.body2.invMass, this.P));
    this.body2.angularVelocity += this.body2.invI * Vec2.crossVV(this.r2, this.P);
  } else {
    this.P.set(0, 0);
  }
};

// void ApplyImpulse();
Joint.prototype.applyImpulse = function applyImpulse() {
  let dv = Vec2.sub(
    Vec2.sub(Vec2.add(this.body2.velocity, Vec2.crossSV(this.body2.angularVelocity, this.r2)), this.body1.velocity),
    Vec2.crossSV(this.body1.angularVelocity, this.r1)
  );

  let impulse = new Vec2();

  impulse = Mat22.mulMV(this.M, Vec2.sub(Vec2.sub(this.bias, dv), Vec2.mulSV(this.softness, this.P)));

  this.body1.velocity.sub(Vec2.mulSV(this.body1.invMass, impulse));
  this.body1.angularVelocity -= this.body1.invI * Vec2.crossVV(this.r1, impulse);

  this.body2.velocity.add(Vec2.mulSV(this.body2.invMass, impulse));
  this.body2.angularVelocity += this.body2.invI * Vec2.crossVV(this.r2, impulse);

  this.P.add(impulse);
};

Joint.prototype.render = function render(ctx) {
  let b1 = this.body1;
  let b2 = this.body2;

  let R1 = new Mat22(b1.rotation);
  let R2 = new Mat22(b2.rotation);
  
  let x1 = b1.position;
  let p1 = Vec2.add(x1, Mat22.mulMV(R1, this.localAnchor1));

  let x2 = b2.position;
  let p2 = Vec2.add(x2, Mat22.mulMV(R2, this.localAnchor2));
  
  ctx.beginPath();
  ctx.moveTo(x1.x, x1.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(x2.x, x2.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
};

//////////////////////////////////////////////////////////////////////////////////////
// World.js

function World(gravity, iterations) {
  this.bodyIdSeed = 0;
  this.bodies = [];
  this.joints = [];
  this.arbiters = [];
  this.gravity = gravity || new Vec2(0, 9.807); // Vec2 9.807 m/s²
  this.iterations = iterations || 10;
  this.accumulateImpulses = true;
  this.warmStarting = true;
  this.positionCorrection = true;
}

//void Add(Body* body);
World.prototype.addBody = function addBody(b) {
  this.bodyIdSeed++;
  b.id = this.bodyIdSeed;
  this.bodies.push(b);
};

//void Add(Joint* joint);
World.prototype.addJoint = function addJoint(j) {
  this.joints.push(j);
};

//void Clear();
World.prototype.clear = function clear() {
  this.bodies = [];
  this.joints = [];
  this.arbiters = [];
};

//void BroadPhase();
World.prototype.broadPhase = function broadPhase() {
  // O(n^2) broad-phase
  for (let i = 0; i < this.bodies.length - 1; ++i) {

    let bi = this.bodies[i];

    for (let j = i + 1; j < this.bodies.length; ++j) {

      let bj = this.bodies[j];

      if (bi.invMass === 0 && bj.invMass === 0) {
        continue;
      }

      let newArb = new Arbiter(this, bi, bj);
      let newArbKey = new ArbiterKey(bi, bj);

      let iter = -1;

      for (let a = 0; a < this.arbiters.length; ++a) {
        if (this.arbiters[a].first.value === newArbKey.value) {
          iter = a;
          break;
        }
      }

      if (newArb.numContacts > 0) {
        if (iter === -1) {
          this.arbiters.push(new ArbiterPair(newArbKey, newArb));
        } else {
          this.arbiters[iter].second.update(newArb.contacts, newArb.numContacts);
        }
      } else if (newArb.numContacts === 0 && iter > -1) {
        this.arbiters.splice(iter, 1); // get rid of arbiter with no contacts
      }
    } // end of inner loop
  } // end of outter loop
};

//void Step(float dt);
World.prototype.step = function step(dt) {
  let inv_dt = dt > 0 ? 1 / dt : 0;

  // Determine overlapping bodies and update contact points.
  this.broadPhase();

  // Integrate forces.
  for (let i = 0; i < this.bodies.length; ++i) {
    let b = this.bodies[i];

    if (b.invMass == 0) {
      continue;
    }

    b.velocity.add(Vec2.mulSV(dt, (Vec2.add(this.gravity, Vec2.mulSV(b.invMass, b.force)))));
    b.angularVelocity += dt * b.invI * b.torque;
  }

  // Perform pre-steps.
  for (let arb = 0; arb < this.arbiters.length; ++arb) {
    this.arbiters[arb].second.preStep(inv_dt);
  }

  for (let i = 0; i < this.joints.length; ++i) {
    this.joints[i].preStep(inv_dt);	
  }

  // Perform iterations
  for (let i = 0; i < this.iterations; ++i) {
    // apply arbiter impulse
    for (let arb = 0; arb < this.arbiters.length; ++arb) {
      this.arbiters[arb].second.applyImpulse();
    }

    // apply joint impulse
    for (let j = 0; j < this.joints.length; ++j) {
      this.joints[j].applyImpulse();
    }
  }

  // Integrate Velocities
  for (let i = 0; i < this.bodies.length; ++i) {
    let b = this.bodies[i];

    b.position.add(Vec2.mulSV(dt, b.velocity));
    b.rotation += dt * b.angularVelocity;

    b.force.set(0, 0);
    b.torque = 0;
  }
};

World.prototype.render = function render(can, ctx) {
  ctx.clearRect(0,0,can.width,can.height);
  
  for (let i = 0; i < this.bodies.length; ++i) {
    this.bodies[i].render(ctx);
  }
  
  let arbitersLen = this.arbiters.length ? this.arbiters.length : 0;
  for (let i = 0; i < arbitersLen; ++i) {
    let arbiter = this.arbiters[i].second;
    let contactsLen = arbiter.contacts.length ? arbiter.contacts.length : 0;
    for (let j = 0; j < contactsLen; ++j) {
      let contact = arbiter.contacts[j];
      contact.render(ctx);
    }
  }
  
  let jointsLen = this.joints.length ? this.joints.length : 0;
  for (let i = 0; i < jointsLen; ++i) {
    this.joints[i].render(ctx);
  }
};

//////////////////////////////////////////////////////////////////////////////////////
// TEST LINES

let dt = 1 / 30;
let world = new World(new Vec2(0, 40), 20);


// STRESS TEST WITH JOINT
let floor = new Body();
floor.set(new Vec2(498, 20), Number.MAX_VALUE);
floor.position.set(250, 288);
world.addBody(floor);

let box;
let boxPos = new Vec2(170, -150);
let boxesPerRow = 10;
let boxesPerCol = 10;
let boxOffset = 16;
for (let i = 0; i < boxesPerRow; i++) {
  for (let j = 0; j < boxesPerCol; j++) {
    box = new Body();
    box.set(new Vec2(12, 12), 5);
    box.position.set(boxPos.x + i * boxOffset, boxPos.y + j * boxOffset);
    box.velocity.y = -50 + j;
    world.addBody(box);
  }
}

let support = new Body();
support.set(new Vec2(25, 25), Number.MAX_VALUE);
support.position.set(350, 50);
world.addBody(support);

let pendulum = new Body();
pendulum.set(new Vec2(50, 50), 900);
pendulum.position.set(505, 40);
world.addBody(pendulum);

let joint = new Joint();
joint.set(world, support, pendulum, support.position);
world.addJoint(joint);

function main() {
  world.step(dt);
  world.render(canvas, context);
  requestAnimationFrame(main);
}
main();
