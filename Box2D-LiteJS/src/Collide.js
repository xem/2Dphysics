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
