class CollisionManifold{
    constructor (depth, normal, penetrationPoint){
        this.depth = depth;
        this.normal = normal;
        this.penetrationPoint = penetrationPoint;
        this.rigiA = null;
        this.rigiB = null;
    }

    resolveCollision(){

        if(this.rigiA.isKinematic && this.rigiB.isKinematic){
            return;
        }


        let penetrationToCentroidA = Sub(this.penetrationPoint, this.rigiA.shape.centroid);
        let penetrationToCentroidB = Sub(this.penetrationPoint, this.rigiB.shape.centroid);

        let angularVelocityPenetrationCentroidA = new Vector2(-1 * this.rigiA.angularVelocity * penetrationToCentroidA.y, this.rigiA.angularVelocity * penetrationToCentroidA.x);
        let angularVelocityPenetrationCentroidB = new Vector2(-1 * this.rigiB.angularVelocity * penetrationToCentroidB.y, this.rigiB.angularVelocity * penetrationToCentroidB.x);

        let velocityA = Add(this.rigiA.velocity, angularVelocityPenetrationCentroidA);
        let velocityB = Add(this.rigiB.velocity, angularVelocityPenetrationCentroidB); 

        let relativeVelocity = Sub(velocityB, velocityA);
        let relativeVelocityAlongNormal =  relativeVelocity.Dot(this.normal);

        if(relativeVelocityAlongNormal > 0){
            return;
        }

        let e = (2*this.rigiA.material.restitution*this.rigiB.material.restitution) / (this.rigiA.material.restitution+this.rigiB.material.restitution);
        let pToCentroidCrossNormalA = penetrationToCentroidA.Cross(this.normal);
        let pToCentroidCrossNormalB = penetrationToCentroidB.Cross(this.normal);
        let invMassSum = this.rigiA.invMass + this.rigiB.invMass;

        let rigiAInvInertia = this.rigiA.invInertia;
        let rigiBInvInertia = this.rigiB.invInertia;

        let crossNSum = pToCentroidCrossNormalA * pToCentroidCrossNormalA * rigiAInvInertia + pToCentroidCrossNormalB * pToCentroidCrossNormalB * rigiBInvInertia;

        let j = -(1+e)*relativeVelocityAlongNormal
        j /= (invMassSum + crossNSum);

        let impulseVector = Scale(this.normal, j);
        let impulseVectorRigiA = Scale(impulseVector, this.rigiA.invMass*-1);
        let impulseVectorRigiB = Scale(impulseVector, this.rigiB.invMass);

        this.rigiA.velocity = Add(this.rigiA.velocity, impulseVectorRigiA);
        this.rigiB.velocity = Add(this.rigiB.velocity, impulseVectorRigiB);

        this.rigiA.angularVelocity += -pToCentroidCrossNormalA * j * rigiAInvInertia;
        this.rigiB.angularVelocity += pToCentroidCrossNormalB * j * rigiBInvInertia;



        // frictional impulse
        let velocityInNormalDirection = Scale(this.normal, relativeVelocity.Dot(this.normal));
        let tangent = Sub(relativeVelocity, velocityInNormalDirection);
        tangent = Scale(tangent, -1);

        let friction = (2*this.rigiA.material.friction*this.rigiB.material.friction) / (this.rigiA.material.friction+this.rigiB.material.friction);
        if(tangent.x > 0.00001 || tangent.y > 0.00001){
            tangent.Normalize();
        }

        let pToCentroidCrossTangentA = penetrationToCentroidA.Cross(tangent);
        let pToCentroidCrossTangentB = penetrationToCentroidB.Cross(tangent);
        let crossSumTangent = pToCentroidCrossTangentA*pToCentroidCrossTangentA*rigiAInvInertia + pToCentroidCrossTangentB*pToCentroidCrossTangentB*rigiBInvInertia;
        let fritionalImpulse = -(1+e)*relativeVelocity.Dot(tangent) * friction;
        fritionalImpulse /= (invMassSum+crossSumTangent);

        if(fritionalImpulse > j){
            fritionalImpulse = j;
        }

        let fritionalImpulseVector = Scale(tangent, fritionalImpulse);
        this.rigiA.velocity = Sub(this.rigiA.velocity, Scale(fritionalImpulseVector, this.rigiA.invMass));
        this.rigiB.velocity = Add(this.rigiB.velocity, Scale(fritionalImpulseVector, this.rigiB.invMass));

        this.rigiA.angularVelocity += -pToCentroidCrossTangentA * fritionalImpulse * rigiAInvInertia;
        this.rigiB.angularVelocity += pToCentroidCrossTangentB * fritionalImpulse * rigiBInvInertia;
    }

    positionalCorrection(){
        let correctionPercentage = 0.2;
        let amountToCorrect = this.depth / (this.rigiA.invMass+this.rigiB.invMass) * correctionPercentage;
        let correctionVector = Scale(this.normal,amountToCorrect);

        let rigiAMovement = Scale(correctionVector, this.rigiA.invMass * -1);
        let rigiBMovement = Scale(correctionVector, this.rigiB.invMass);

        if(!this.rigiA.isKinematic){
            this.rigiA.getShape().move(rigiAMovement);
        }
        if(!this.rigiB.isKinematic){
            this.rigiB.getShape().move(rigiBMovement);
        }
    }

    draw(ctx){
        let startPoint = Add(this.penetrationPoint, Scale(this.normal, this.depth*-1));

        DrawUtils.drawArrow(startPoint, this.penetrationPoint, "blue");
        DrawUtils.drawPoint(this.penetrationPoint, 3,"gray");

        console.log("draw");
    }
}