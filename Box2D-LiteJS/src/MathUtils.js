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
