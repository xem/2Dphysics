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
