class CollisionDetection{


    static checkCollisions(rigiA, rigiB){
        let collisionManifold = null;
        let shapeA = rigiA.shape;
        let shapeB = rigiB.shape;

        if(shapeA instanceof Circle && shapeB instanceof Circle){
            collisionManifold = this.circleVsCircle(shapeA, shapeB);
        }else if(shapeA instanceof Polygon && shapeB instanceof Polygon){
            collisionManifold = this.polygonVsPolygon(shapeA, shapeB);
        }else if(shapeA instanceof Circle && shapeB instanceof Polygon){
            collisionManifold = this.circleVsPolygon(shapeA, shapeB);
        }


        if(collisionManifold != null){
            collisionManifold.rigiA = rigiA;
            collisionManifold.rigiB = rigiB;
        }


        return collisionManifold;
    }


    static circleVsCircle(shapeCircleA, shapeCircleB){
        let centroidA = shapeCircleA.getCentroid();
        let centroidB = shapeCircleB.getCentroid();


        let direction = Sub(centroidB, centroidA);
        let circleARadius = shapeCircleA.getRadius();
        let circleBRadius = shapeCircleB.getRadius();

        let sumRadius = circleARadius + circleBRadius;

        

        if(direction.Length2() < sumRadius*sumRadius){

            let directionLength = direction.Length();
            let penetrationNormal = Scale(direction, 1 / directionLength);
            let penetrationDepth = directionLength - sumRadius;
            let penetrationPoint = Add(centroidA, Scale(penetrationNormal, circleARadius));

            return new CollisionManifold(penetrationDepth * -1, penetrationNormal, penetrationPoint);
        }else{
            return null;
        }

        /*
        if(direction.Length() < circleARadius + circleBRadius){
            return true;
        }else{
            return false;
        }
        */

    }

    static polygonVsPolygon(shapePolygonA, shapePolygonB){

        let resultingContact = null;

        let contactPolyA = this.getContactPoint(shapePolygonA, shapePolygonB);
        if(contactPolyA == null){
            return null;
        }

        let contactPolyB = this.getContactPoint(shapePolygonB, shapePolygonA);
        if(contactPolyB == null){
            return null;
        }

        if(contactPolyA.depth < contactPolyB.depth){
            resultingContact = new CollisionManifold(contactPolyA.depth, contactPolyA.normal,contactPolyA.penetrationPoint);
        }else{
            resultingContact = new CollisionManifold(contactPolyB.depth, Scale(contactPolyB.normal,-1),contactPolyB.penetrationPoint);
        }
        return resultingContact;
    }

    static getContactPoint(shapePolygonA, shapePolygonB){
        let contact = null;
        let minimumPenetrationDepth = Number.MAX_VALUE;

        for(let i=0; i<shapePolygonA.normals.length;i++){
            let pointOnEdge = shapePolygonA.vertices[i];
            let normalOnEdge = shapePolygonA.normals[i];

            let supportPoint = this.findSupportPoint(normalOnEdge, pointOnEdge, shapePolygonB.vertices);
            if(supportPoint == null){
                return null;
            }

            if(supportPoint.penetrationDepth < minimumPenetrationDepth){
                minimumPenetrationDepth = supportPoint.penetrationDepth;
                contact = new CollisionManifold(minimumPenetrationDepth, normalOnEdge, supportPoint.vertex);
            }
        }
        return contact;
    }

    static findSupportPoint(normalOnEdge, pointOnEdge, otherPolygonVertices){
        let currentDeepestPenetration = 0;
        let supportPoint = null;

        for(let i=0; i<otherPolygonVertices.length; i++){
            let vertice = otherPolygonVertices[i];
            let verticeToPointEdge = Sub(vertice, pointOnEdge);
            let penetrationDepth = verticeToPointEdge.Dot(Scale(normalOnEdge,-1));

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
        }else {
            return this.circleVsPolygonCorners(shapeCircle, shapePolygon);
        }
    }

    static circleVsPolygonEdges(shapeCircle, shapePolygon){
        let verticesLength = shapePolygon.vertices.length;
        let circleCentroid = shapeCircle.centroid;
        let nearestEdgeVertex = null;
        let nearestEdgeNormal = null;

        for(let i=0; i<verticesLength; i++){
            let currVertex = shapePolygon.vertices[i];
            let currNormal = shapePolygon.normals[i];
            let nextVertex = shapePolygon.vertices[MathHelper.Index(i+1, verticesLength)];

            let vertToCircle = Sub(circleCentroid, currVertex);
            let dirToNext = Sub(nextVertex, currVertex);
            let dirToNextLength = dirToNext.Length();
            dirToNext.Normalize();

            let circleDirToNextProjection = vertToCircle.Dot(dirToNext);
            let circleDirToNormalProjection = vertToCircle.Dot(currNormal);
            if(circleDirToNextProjection > 0 && circleDirToNextProjection < dirToNextLength && circleDirToNormalProjection >= 0){
                nearestEdgeNormal = currNormal;
                nearestEdgeVertex = currVertex;
            }
        }

        if(nearestEdgeNormal == null || nearestEdgeNormal == null){
            return null;
        }

        let vertexToCircle = Sub(circleCentroid, nearestEdgeVertex);
        let projectionToEdgeNormal = nearestEdgeNormal.Dot(vertexToCircle);
        if(projectionToEdgeNormal - shapeCircle.radius < 0){
            let penetrationDepth = projectionToEdgeNormal - shapeCircle.radius;
            let penetrationPoint = Add(circleCentroid, Scale(nearestEdgeNormal, shapeCircle.radius * -1));
            return new CollisionManifold(penetrationDepth * -1, Scale(nearestEdgeNormal, -1), penetrationPoint);
        }
        return null;
    }

    static circleVsPolygonCorners(shapeCircle, shapePolygon){
        let verticesLength = shapePolygon.vertices.length;
        for(let i=0; i<verticesLength; i++){
            let currVertex = shapePolygon.vertices[i];
            let dirToCentroidCircle = Sub(currVertex, shapeCircle.centroid);
            if(dirToCentroidCircle.Length2() < shapeCircle.radius*shapeCircle.radius){
                let penetrationDepth = shapeCircle.radius - dirToCentroidCircle.Length();
                dirToCentroidCircle.Normalize();
                return new CollisionManifold(penetrationDepth, dirToCentroidCircle, currVertex);
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