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

	static polygonVsPolygon(shapePolygonA, shapePolygonB){
		let resultingContact = null;
		
		let contactPolyA = this.getContactPoint(shapePolygonA, shapePolygonB);
		if(contactPolyA == null) 
			return null;

		
		let contactPolyB = this.getContactPoint(shapePolygonB, shapePolygonA);
		if(contactPolyB == null)
			return null;
	
		
		console.log(contactPolyA.depth +" <? "+contactPolyB.depth);
		if(contactPolyA.depth < contactPolyB.depth){
			
			//let minus = Scale(contactPolyA.normal, contactPolyA.depth);
			//resultingContact = new CollisionManifold(null,null,contactPolyA.depth, contactPolyA.normal, 
			//	Sub(contactPolyA.penetrationPoint,minus));
				
			resultingContact = new CollisionManifold(contactPolyA.depth, contactPolyA.normal,contactPolyA.penetrationPoint);
		}else{
			resultingContact = new CollisionManifold(contactPolyB.depth, Scale(contactPolyB.normal,-1), contactPolyB.penetrationPoint);
		}
		return resultingContact;
		
	}
		
	static getContactPoint(shapePolygonA, shapePolygonB){
		let contact = null;
		let minimumPenetration = Number.MAX_VALUE;
		
		for(let i=0; i<shapePolygonA.normals.length;i++){
			let pointOnEdge = shapePolygonA.vertices[i];
			let normalOnEdge = shapePolygonA.normals[i];
			
			let supportPoint = this.findSupportPoint(normalOnEdge, pointOnEdge, shapePolygonB.vertices);
			if(supportPoint == null)
				return null;
			
			if(supportPoint.penetrationDepth < minimumPenetration){
				minimumPenetration = supportPoint.penetrationDepth;
				contact = new CollisionManifold(minimumPenetration,
					normalOnEdge, supportPoint.vertex);
			}
			
		}
		return contact;
	}
	
	static findSupportPoint(normalOnEdge, pointOnEdge, otherPolygonVertices){
		let currentDeepestPenetration = 0;
		let supportPoint = null;
		
		for(let i=0; i < otherPolygonVertices.length; i++){
			let vertice = otherPolygonVertices[i];
			let verticeToPointEdge = Sub(vertice,pointOnEdge);
			let penetrationDepth = verticeToPointEdge.Dot(Scale(normalOnEdge, -1));
			
			if(penetrationDepth > currentDeepestPenetration){
				currentDeepestPenetration = penetrationDepth;
				supportPoint = new SupportPoint(vertice, currentDeepestPenetration);
			}
		}
		return supportPoint;
	}
}

class SupportPoint{
	constructor(vertex, penetrationDepth){
		this.vertex = vertex;
		this.penetrationDepth = penetrationDepth;
	}
}