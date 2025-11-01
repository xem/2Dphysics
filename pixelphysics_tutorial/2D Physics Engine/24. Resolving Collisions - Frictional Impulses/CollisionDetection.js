class CollisionDetection{
	
	
	static checkCollisions(rigiA, rigiB){
		let shapeA = rigiA.shape;
		let shapeB = rigiB.shape;
		
		let collisionManifold = null;
		
		if(shapeA instanceof Circle && shapeB instanceof Circle){
			collisionManifold = this.circleVsCircle(shapeA, shapeB);
		}else if(shapeA instanceof Polygon && shapeB instanceof Polygon){
			collisionManifold = this.polygonVsPolygon(shapeA, shapeB);
		}else if(shapeA instanceof Circle && shapeB instanceof Polygon){
			collisionManifold = this.circleVsPolygon(shapeA,shapeB);
		}

		if(collisionManifold != null){
			collisionManifold.rigiA = rigiA;
			collisionManifold.rigiB = rigiB;
		}
		return collisionManifold;
	}
	
	
	static circleVsCircle(shapeA, shapeB){
		let shapeCircleA = shapeA;
		let shapeCircleB = shapeB;
		
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

	static polygonVsPolygon(shapeA, shapeB){
		let shapePolygonA = shapeA;
		let shapePolygonB = shapeB;	
		let resultingContact = null;
		
		let contactPolyA = this.getContactPoint(shapePolygonA, shapePolygonB);
		if(contactPolyA == null) 
			return null;

		
		let contactPolyB = this.getContactPoint(shapePolygonB, shapePolygonA);
		if(contactPolyB == null)
			return null;
	
		
		if(contactPolyA.depth < contactPolyB.depth){
			resultingContact = new CollisionManifold(contactPolyA.depth*-1, contactPolyA.normal,contactPolyA.penetrationPoint);
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
	
	static circleVsPolygon(shapeA, shapeB){
		let shapeCircle = shapeA;
		let shapePolygon = shapeB;	
		
		let contact = this.circleVsPolygonEdges(shapeCircle, shapePolygon);
		if(contact){
			return contact;
		} 
		else return this.circleVsPolygonCorners(shapeCircle, shapePolygon);	

	}
	
	static circleVsPolygonEdges(shapeCircle, shapePolygon){
		let verticesLength = shapePolygon.vertices.length;
		let circleCentroid = shapeCircle.centroid;
		let nearestEdgeVertex = null;
		let nearestEdgeNormal = null;
		console.log("\n\n");
		for(let i=0; i<verticesLength;i++){
			let currVertex = shapePolygon.vertices[i];
			let currNormal = shapePolygon.normals[i];
			let nextVertex = shapePolygon.vertices[MathHelper.Index(i+1,verticesLength)];

			let vertToCircle = Sub(circleCentroid, currVertex);
			let dirToNext = Sub(nextVertex,currVertex);
			let dirToNextLength = dirToNext.Length();
			dirToNext.Normalize();

			let circleDirToNextProjection = vertToCircle.Dot(dirToNext);
			let circleDirToNormalProjection = vertToCircle.Dot(currNormal);
			if(circleDirToNormalProjection>=0 && circleDirToNextProjection > 0 && circleDirToNextProjection < dirToNextLength){
				nearestEdgeNormal = currNormal;
				nearestEdgeVertex = currVertex;
			}
		}

		if(nearestEdgeNormal == null || nearestEdgeVertex == null){
			return null;
		}

		let vertexToCircle = Sub(circleCentroid, nearestEdgeVertex);
		let projectionToEdgeNormal = nearestEdgeNormal.Dot(vertexToCircle);
		if(projectionToEdgeNormal - shapeCircle.radius < 0){
			let penetration = projectionToEdgeNormal - shapeCircle.radius;
			let penetrationPoint = Add(circleCentroid,Scale(nearestEdgeNormal,shapeCircle.radius*-1));
			return new CollisionManifold(penetration*-1,Scale(nearestEdgeNormal,-1),penetrationPoint );
		}

		return null;

		console.log("\n\n");
	}
	
	static circleVsPolygonCorners(shapeCircle, shapePolygon){
		let verticesLength = shapePolygon.vertices.length;
		for(let i=0; i<verticesLength;i++){
			let currVertex = shapePolygon.vertices[i];
			let dirToCentroidCircle = Sub(currVertex, shapeCircle.centroid);
			if(dirToCentroidCircle.Length2() < shapeCircle.radius*shapeCircle.radius){
				let penetration = shapeCircle.radius - dirToCentroidCircle.Length();
				dirToCentroidCircle.Normalize();
				return new CollisionManifold(penetration, Scale(dirToCentroidCircle,1),currVertex );
			}
		}
		return null;
	}
}

class SupportPoint{
	constructor(vertex, penetrationDepth){
		this.vertex = vertex;
		this.penetrationDepth = penetrationDepth;
	}
}