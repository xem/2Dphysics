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
class b2Joint {
  constructor(body1, body2, anchor) {
    this.body1 = body1;
    this.body2 = body2;

    this.localAnchor1 = body1.localPosition(anchor);
    this.localAnchor2 = body2.localPosition(anchor);

    this.P = new b2Vec2(0, 0);
  }

  preStep(inv_dt) {

    const b1 = this.body1;
    const b2 = this.body2;

    // Pre-compute anchors, mass matrix, and bias.
    this.r1 = b1.worldPosition(this.localAnchor1);
    this.r2 = b2.worldPosition(this.localAnchor2);
    const r1 = b2SubVV(this.r1, b1.position);
    const r2 = b2SubVV(this.r2, b2.position);

    const invMass = b1.invMass + b2.invMass;
    const invI1 = b1.invI;
    const invI2 = b2.invI;

    const k00 = invI1 * r1.u1 * r1.u1 + invI2 * r2.u1 * r2.u1 + invMass;
    const k01 = invI1 * r1.u0 * r1.u1 + invI2 * r2.u0 * r2.u1;
    const k11 = invI1 * r1.u0 * r1.u0 + invI2 * r2.u0 * r2.u0 + invMass;

    this.M = b2Inverse(k00, -k01, -k01, k11);
    const dp = b2SubVV(this.r2, this.r1);

    const k_biasFactor = 0.2;
    const bias_u0 = -k_biasFactor * inv_dt * (this.r2.u0 - this.r1.u0);
    const bias_u1 = -k_biasFactor * inv_dt * (this.r2.u1 - this.r1.u1);
    this.bias = new b2Vec2(bias_u0, bias_u1);

    // Apply accumulated impulse.
    b1.applyImpulse(this.r1, this.P.neg());
    b2.applyImpulse(this.r2, this.P);
  }

  applyImpulse() {
    const b1 = this.body1;
    const b2 = this.body2;

    const dv = b2SubVV(
      b2.relativeVelocity(this.r2), 
      b1.relativeVelocity(this.r1));

    const d = b2SubVV(this.bias, dv);
    const P_u0 = b2Dot(this.M.v0, d);
    const P_u1 = b2Dot(this.M.v1, d);
    const P = new b2Vec2(P_u0, P_u1);

    b1.applyImpulse(this.r1, P.neg());
    b2.applyImpulse(this.r2, P);

    this.P.set(
      this.P.u0 + P.u0,
      this.P.u1 + P.u1);
  }
}
