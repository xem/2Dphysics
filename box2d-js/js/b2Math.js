class b2Vec2 {
  constructor(u0, u1) {
    this.u0 = u0;
    this.u1 = u1;
  }

  set(u0, u1) {
    this.u0 = u0;
    this.u1 = u1;
  }

  copy() {
    return new b2Vec2(this.u0, this.u1);
  }

  neg() {
    return new b2Vec2(-this.u0, -this.u1);
  }

  perpendicular() {
    return new b2Vec2(this.u1, -this.u0);
  }

  length() {
    return Math.sqrt(this.u0 * this.u0 + this.u1 * this.u1);
  }

  normalize() {
    const l = this.length();
    if (l < Number.MIN_VALUE) {
      return copy();
    }

    const invLength = 1.0 / length;
    const u0 = invLength * this.u0;
    const u1 = invLength * this.u1;
    return new b2Vec2(u0, u1);
  }
}

class b2Mat22 {
  constructor(v0, v1) {
    this.v0 = v0.copy();
    this.v1 = v1.copy();
  }

  set(m) {
    this.v0.set(m.v0);
    this.v1.set(m.v1);
  }

  copy() {
    return new b2Mat22(this.v0, this.v1);
  }
}

function b2Dot(a, b) {
  return a.u0 * b.u0 + a.u1 * b.u1;
}

function b2Cross(a, b) {
  return a.u0 * b.u1 - a.u1 * b.u0;
}

function b2AddVV(a, b) {
  let u0 = a.u0 + b.u0;
  let u1 = a.u1 + b.u1;
  return new b2Vec2(u0, u1);
}

function b2SubVV(a, b) {
  let u0 = a.u0 - b.u0;
  let u1 = a.u1 - b.u1;
  return new b2Vec2(u0, u1);
}

// ----------------------------------------------------------------------------
function b2Interp(v0, v1, t)
{
  let u0 = v0.u0 + t * (v1.u0 - v0.u0);
  let u1 = v0.u1 + t * (v1.u1 - v0.u1);
  return new b2Vec2(u0, u1);
}

// ----------------------------------------------------------------------------
function b2Distance(n, v, x)
{
  let u0 = n.u0 * (x.u0 - v.u0);
  let u1 = n.u1 * (x.u1 - v.u1);
  return u0 + u1;
}

// ----------------------------------------------------------------------------
function b2Inverse(a, b, c, d) {
  const det = a * d - b * c;

  const invDet = 1.0 / det;
  let c1 = new b2Vec2(invDet * d, -invDet * c);
  let c2 = new b2Vec2(-invDet * b, invDet * a);
  return new b2Mat22(c1, c2);
}
