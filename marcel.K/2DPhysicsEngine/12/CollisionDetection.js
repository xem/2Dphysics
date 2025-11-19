class CollisionDetection{
	static circleVsCircle(shapeCircleA, shapeCircleB){
		let centroidA = shapeCircleA.getCentroid()
		let centroidB = shapeCircleB.getCentroid()
		
		let direction = Sub(centroidB, centroidA);
		let circleARadius = shapeCircleA.getRadius();
		let circleBRadius = shapeCircleB.getRadius();
		
		
		let dirLength = direction.Length()
		let depth = dirLength - (circleARadius+circleBRadius);
		if(depth < 0){
			let normal = Scale(direction, 1.0/dirLength);
			let penetrationPoint = Add(centroidA,Scale(normal, circleARadius));
			
			return new CollisionManifold(depth*-1, normal, penetrationPoint);
		}else{
			return null;
		}
	}
}