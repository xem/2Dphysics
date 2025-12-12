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
