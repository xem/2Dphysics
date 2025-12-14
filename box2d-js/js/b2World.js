// MIT License

// Copyright (c) 2019 Erin Catto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// ----------------------------------------------------------------------------
class b2World {
  constructor() {
    this.dynamicBodies = [];
    this.staticBodies = [];
    this.joints = [];
    this.manifolds = new Map();
  }

  addDynamicBody(obj) {
    const width = obj.width;
    const invMass = 1.0 / obj.mass;
    const invI = invMass * 12.0 / (width.u0 * width.u0 + width.u1 * width.u1);
    let body = new b2RigidBody(obj.id, obj.pos, obj.rot, obj.width, obj.mass, invMass, invI);
    this.dynamicBodies.push(body);
    return body;
  }

  addStaticBody(obj) {
    let body = new b2RigidBody(obj.id, obj.pos, obj.rot, obj.width, 0, 0, 0);
    this.staticBodies.push(body);
    return body;
  }

  addJoint(obj) {
    let joint = new b2Joint(obj.b1, obj.b2, obj.anchor);
    this.joints.push(joint);
    return joint;
  }

  step(dt) {
    const inv_dt = 1.0 / dt;

    this.collisionDetection();
    this.dynamicBodies.forEach(body => body.applyForce(new b2Vec2(0, -10 * body.mass)));
    this.dynamicBodies.forEach(body => body.integrateForces(dt));
    this.manifolds.forEach(manifold => manifold.preStep(inv_dt))
    this.joints.forEach(joint => joint.preStep(inv_dt))
    for (let i = 0; i < 6; ++i) {
      this.manifolds.forEach(manifold => manifold.applyImpulse())
      this.joints.forEach(joint => joint.applyImpulse())
    }
    this.dynamicBodies.forEach(body => body.integrateVelocities(dt));
  }

  collisionDetection() {

    let manifolds = new Map();

    // dynamic vs. dynamic
    for (let i = 0; i < this.dynamicBodies.length; ++i) {
      for (let j = i + 1; j < this.dynamicBodies.length; ++j) {
        this.collide(manifolds, this.dynamicBodies[i], this.dynamicBodies[j]);
      }
    }

    // dynamic vs. static
    for (let i = 0; i < this.dynamicBodies.length; ++i) {
      for (let j = 0; j < this.staticBodies.length; ++j) {
        this.collide(manifolds, this.dynamicBodies[i], this.staticBodies[j]);
      }
    }

    this.manifolds = manifolds;
  }

  collide(manifolds, bodyA, bodyB) {

    let new_m = b2CollidePoly(bodyA, bodyB);
    if (new_m != null) {
      const key = bodyA.id + ":" + bodyB.id;
      const old_m = this.manifolds.get(key);
      if (old_m != null) {
        new_m.update(old_m);
      }
      manifolds.set(key, new_m);
    }
  }
}

// ----------------------------------------------------------------------------
function initWorld()
{
  return new b2World();
}
