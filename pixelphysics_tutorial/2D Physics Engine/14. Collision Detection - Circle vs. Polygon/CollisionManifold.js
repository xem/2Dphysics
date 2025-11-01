class CollisionManifold{
	constructor(depth,normal,penetrationPoint){
		this.depth = depth;
		this.normal = normal;
		this.penetrationPoint = penetrationPoint;		
	}
	
	//we need this method later
	resolveCollision(){
		
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