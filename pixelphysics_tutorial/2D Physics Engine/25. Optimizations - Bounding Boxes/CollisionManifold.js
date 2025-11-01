class CollisionManifold{
	constructor(depth,normal,penetrationPoint){
		this.depth = depth;
		this.normal = normal;
		this.penetrationPoint = penetrationPoint;		
		this.rigiA = null;
		this.rigiB = null;
	}
	
	
	resolveCollision(){

		if(this.rigiA.isKinematic && this.rigiB.isKinematic) return;

		let penetrationToCentroidA = Sub(this.penetrationPoint,this.rigiA.shape.centroid);
		let penetrationToCentroidB = Sub(this.penetrationPoint,this.rigiB.shape.centroid);
			
		let angularVelocityPenetrationCentroidA = new Vector2(-1 * this.rigiA.angularVelocity * penetrationToCentroidA.y,this.rigiA.angularVelocity * penetrationToCentroidA.x)
		let angularVelocityPenetrationCentroidB = new Vector2(-1 * this.rigiB.angularVelocity * penetrationToCentroidB.y,this.rigiB.angularVelocity * penetrationToCentroidB.x)

		let relativeVelocityA = Add(this.rigiA.velocity,angularVelocityPenetrationCentroidA);
		let relativeVelocityB = Add(this.rigiB.velocity,angularVelocityPenetrationCentroidB);
							
		let relativeVel = Sub(relativeVelocityB,relativeVelocityA);	
		let velocityInNormal = relativeVel.Dot(this.normal);			

		if(velocityInNormal > 0) return;
		
		let e = Math.min(this.rigiA.material.bounce,this.rigiB.material.bounce);	
		let pToCentroidCrossNormalA = penetrationToCentroidA.Cross(this.normal);
		let pToCentroidCrossNormalB = penetrationToCentroidB.Cross(this.normal);
		
		let invMassSum = this.rigiA.invMass + this.rigiB.invMass;
		

		let rigiAInvInertia = this.rigiA.invInertia;
		let rigiBInvInertia = this.rigiB.invInertia;
		let crossNSum  = pToCentroidCrossNormalA*pToCentroidCrossNormalA * rigiAInvInertia + pToCentroidCrossNormalB*pToCentroidCrossNormalB * rigiBInvInertia;

		let j = -(1+e)*velocityInNormal;
		j /= (invMassSum + crossNSum);

		let impulseVector = Scale(this.normal,j);
		
		this.rigiA.velocity = Sub(this.rigiA.velocity,Scale(impulseVector,this.rigiA.invMass));
		this.rigiB.velocity = Add(this.rigiB.velocity,Scale(impulseVector,this.rigiB.invMass));		
		this.rigiA.angularVelocity += -pToCentroidCrossNormalA * j * rigiAInvInertia;		
		this.rigiB.angularVelocity += pToCentroidCrossNormalB * j * rigiBInvInertia;	


		// Frictional impulse
		let velocityInNormalDirection = Scale(this.normal, relativeVel.Dot(this.normal));
		let tangent = Sub(relativeVel, velocityInNormalDirection);
		tangent = Scale(tangent, -1);
		let minFriction = Math.min(this.rigiA.material.friction, this.rigiB.material.friction);
		if(tangent.x > 0.00001 || tangent.y > 0.00001){
			tangent.Normalize();		
			DrawUtils.drawArrow(this.rigiA.shape.centroid,Add(this.rigiA.shape.centroid, Scale(tangent,40)),"blue");
		}
		
		let pToCentroidCrossTangentA = penetrationToCentroidA.Cross(tangent);
		let pToCentroidCrossTangentB = penetrationToCentroidB.Cross(tangent);

		let crossSumTangent = pToCentroidCrossTangentA*pToCentroidCrossTangentA * rigiAInvInertia + pToCentroidCrossTangentB*pToCentroidCrossTangentB * rigiBInvInertia;
		let frictionalImpulse = -(1+e)*relativeVel.Dot(tangent) * minFriction;
		frictionalImpulse /= (invMassSum + crossSumTangent);
		if(frictionalImpulse > j){
			frictionalImpulse = j;
		}

		let frictionalImpulseVector = Scale(tangent, frictionalImpulse);
		
		this.rigiA.velocity = Sub(this.rigiA.velocity,Scale(frictionalImpulseVector,this.rigiA.invMass));
		this.rigiB.velocity = Add(this.rigiB.velocity,Scale(frictionalImpulseVector,this.rigiB.invMass));		

		
		this.rigiA.angularVelocity += -pToCentroidCrossTangentA * frictionalImpulse * rigiAInvInertia;		
		this.rigiB.angularVelocity += pToCentroidCrossTangentB * frictionalImpulse * rigiBInvInertia;
	}
	
	// also for later use
	positionalCorrection(){

		let correctionPercentage = 0.7;
		let amountToCorrect = this.depth / (this.rigiA.invMass + this.rigiB.invMass) * correctionPercentage;
		let correctionVector = Scale(this.normal, amountToCorrect);

		let rigiAMovement = Scale(correctionVector, this.rigiA.invMass*-1);
		let rigiBMovement = Scale(correctionVector, this.rigiB.invMass);


		if(!this.rigiA.isKinematic){
			this.rigiA.shape.move(rigiAMovement);
		}
		if(!this.rigiB.isKinematic){
			this.rigiB.shape.move(rigiBMovement);
		}
	}
	
	draw(){
		let startPoint = Add(this.penetrationPoint, Scale(this.normal,this.depth*-1));
		DrawUtils.drawArrow(startPoint,this.penetrationPoint,"blue");
		DrawUtils.drawPoint(this.penetrationPoint,3,"gray");
	}
}