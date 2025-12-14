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
class b2RigidBody {
  constructor(id, pos, rot, width, mass, invMass, invI) {

    this.id = id;
    this.width = width;

    this.position = pos;
    this.rotation = rot;
    this.velocity = new b2Vec2(0, 0);
    this.angularVelocity = 0;
    this.force = new b2Vec2(0, 0);
    this.torque = 0;

    this.vertexCount = 4;
    this.vertices = new Array(this.vertexCount);
    this.normals = new Array(this.vertexCount);
    for (let i = 0; i < this.vertexCount; i++) {
      this.vertices[i] = new b2Vec2(0, 0);
      this.normals[i] = new b2Vec2(0, 0);
    }
    this.transformShape();

    this.mass = mass;
    this.invMass = invMass;
    this.invI = invI;
    this.friction = 0.2;
    this.restitution = 0.0;
  }

  localPosition(worldPt) {
    const r_u0 = worldPt.u0 - this.position.u0;
    const r_u1 = worldPt.u1 - this.position.u1;

    const q_s = Math.sin(-this.rotation);
    const q_c = Math.cos(-this.rotation);

    let v_u0 = q_c * r_u0 - q_s * r_u1;
    let v_u1 = q_s * r_u0 + q_c * r_u1;

    return new b2Vec2(v_u0, v_u1);
  }

  worldPosition(localPt) {
    const q_s = Math.sin(this.rotation);
    const q_c = Math.cos(this.rotation);

    let v_u0 = q_c * localPt.u0 - q_s * localPt.u1 + this.position.u0;
    let v_u1 = q_s * localPt.u0 + q_c * localPt.u1 + this.position.u1;

    return new b2Vec2(v_u0, v_u1);
  }

  relativeVelocity(pt) {
    const r_u0 = pt.u0 - this.position.u0;
    const r_u1 = pt.u1 - this.position.u1;

    const av = this.angularVelocity;
    const v_u0 = this.velocity.u0 - av * r_u1;
    const v_u1 = this.velocity.u1 + av * r_u0;
    return new b2Vec2(v_u0, v_u1);
  }

  applyForce(F) {
    this.force.u0 += F.u0;
    this.force.u1 += F.u1;
  }

  applyImpulse(pt, P) {
    const r_u0 = pt.u0 - this.position.u0;
    const r_u1 = pt.u1 - this.position.u1;

    this.velocity.u0 += this.invMass * P.u0;
    this.velocity.u1 += this.invMass * P.u1;
    this.angularVelocity += this.invI * (r_u0 * P.u1 - r_u1 * P.u0);
  }

  integrateForces(dt) {
    this.velocity.u0 += dt * this.invMass * this.force.u0;
    this.velocity.u1 += dt * this.invMass * this.force.u1;
    this.angularVelocity += dt * this.invI * this.torque;
    this.force.u0 = 0;
    this.force.u1 = 0;
    this.torque = 0;
  }

  integrateVelocities(dt) {
    this.position.u0 += dt * this.velocity.u0;
    this.position.u1 += dt * this.velocity.u1;
    this.rotation += dt * this.angularVelocity;
    this.transformShape();
  }

  transformShape() {

    const p = this.position;
    const q_s = Math.sin(this.rotation);
    const q_c = Math.cos(this.rotation);

    const cx = 0.5 * this.width.u0;
    const cy = 0.5 * this.width.u1;
    const shape = [
      { u0: -cx, u1: -cy },
      { u0:  cx, u1: -cy },
      { u0:  cx, u1:  cy },
      { u0: -cx, u1:  cy }
    ];

    shape.forEach(function(v, i) {
      let u0 = q_c * v.u0 - q_s * v.u1 + p.u0;
      let u1 = q_s * v.u0 + q_c * v.u1 + p.u1;
      this.vertices[i].set(u0, u1);
    }, this);

    const normals = [
      { u0:  0, u1: -1 },
      { u0:  1, u1:  0 },
      { u0:  0, u1:  1 },
      { u0: -1, u1:  0 }
    ];

    normals.forEach(function(n, i) {
      let u0 = q_c * n.u0 - q_s * n.u1;
      let u1 = q_s * n.u0 + q_c * n.u1;
      this.normals[i].set(u0, u1);
    }, this);
  }
}
