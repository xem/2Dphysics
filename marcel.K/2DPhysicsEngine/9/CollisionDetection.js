class CollisionDetection{
	
	static circleVsCircle(shapeCircleA, shapeCircleB){
		let centroidA = shapeCircleA.getCentroid()
		let centroidB = shapeCircleB.getCentroid()
		
		let direction = Sub(centroidB, centroidA);
		let circleARadius = shapeCircleA.getRadius();
		let circleBRadius = shapeCircleB.getRadius();
		
		
		if(direction.Length() < circleARadius+circleBRadius){
			return true;
		}else{
			return false;
		}
	}
	
}