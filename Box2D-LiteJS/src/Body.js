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
