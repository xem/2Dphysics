class CollisionManifold{
	constructor(depth,normal,penetrationPoint){
		this.depth = depth;
		this.normal = normal;
		this.penetrationPoint = penetrationPoint;		
		this.rigiA = null;
		this.rigiB = null;
	}
	
	
	resolveCollision(){
		/*
		let direction = Sub(this.rigiA.shape.centroid,this.rigiB.shape.centroid);
		if(direction.Dot(this.normal) > 0){
			this.normal = Scale(this.normal, -1);
			console.log("Flip");
		}
		*/
		let relativeVelocity = Sub(this.rigiB.velocity,this.rigiA.velocity);
		let relativeVelocityAlongNormal = relativeVelocity.Dot(this.normal);
		console.log("Velocity along normal:"+relativeVelocityAlongNormal );
		if(relativeVelocityAlongNormal > 0) return;
		if(this.rigiA.isKinematic && this.rigiB.isKinematic) return;

		let invMassSum = this.rigiA.invMass + this.rigiB.invMass;

		let e = 1;
		let j = -(1+e)*relativeVelocityAlongNormal;
		j = j / invMassSum;

		let impulseVector = Scale(this.normal,j);
		let impulseVectorRigiA = Scale(impulseVector,this.rigiA.invMass*-1);
		let impulseVectorRigiB = Scale(impulseVector,this.rigiB.invMass);

		this.rigiA.velocity = Add(this.rigiA.velocity, impulseVectorRigiA);
		this.rigiB.velocity = Add(this.rigiB.velocity, impulseVectorRigiB);
	}
	
	// also for later use
	positionalCorrection(){
		
	}
	
	draw(ctx){
		let startPoint = Add(this.penetrationPoint, Scale(this.normal,this.depth*-1));
		
		//startPoint.Log();
		
		//DrawUtils.drawArrow(this.penetrationPoint,Add(this.penetrationPoint,Scale(this.normal,this.depth)),"blue");
		
		DrawUtils.drawArrow(startPoint,this.penetrationPoint,"blue");
		DrawUtils.drawPoint(this.penetrationPoint,3,"gray");
	}
}