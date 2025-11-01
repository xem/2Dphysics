class Shape{
    constructor(vertices){
        this.vertices = vertices;
        this.color = "black";
        this.boundingBox = new BoundingBox();
        this.anchorPoints = new Map();

        if(new.target === Shape){
            throw new TypeError("Cannot construct abstract instances directly of class 'Shape'");
        }

        this.orientation = 0;
    }

    setCentroid(position){
        this.centroid = position;
    }

    getCentroid(){
        return this.centroid;
    }

    setColor(color){
        this.color = color;
    }

    createAnchor(localAnchorPos){
        let id = this.anchorPoints.size;
        this.anchorPoints.set(id, Add(this.centroid,localAnchorPos));
        console.log("Created anchor with id ["+id+"]");
        return id;
    }

    removeAnchor(anchorIndex){
        let removed = this.anchorPoints.delete(anchorIndex);
        if(!removed){
            console.log("Anchor with id ["+anchorIndex+"] not found!");
        }
        return removed;
    }

    getAnchorPos(id){
        return this.anchorPoints.get(id);
    }

    isPointInside(pos){
        let isInside = false;
        for(let i=0; i<this.vertices.length;i++){
            let vertex = this.vertices[i];
            let normal = this.normals[i];
            let vertToPoint = Sub(pos, vertex);
            let dot = vertToPoint.Dot(normal);

            if(dot > 0){
                return false;
            }else{
                isInside = true;
            }
        }

        return isInside;
    }

    calculateBoundingBox(){
        let topLeft = new Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
        let bottomRight = new Vector2(Number.MIN_VALUE, Number.MIN_VALUE);

        for(let i=0; i<this.vertices.length;i++){
            let x = this.vertices[i].x;
            let y = this.vertices[i].y;

            if(x < topLeft.x){
                topLeft.x = x;
            }
            if(y < topLeft.y){
                topLeft.y = y;
            }

            if(x > bottomRight.x){
                bottomRight.x = x;
            }

            if(y > bottomRight.y){
                bottomRight.y = y;
            }
        }

        this.boundingBox.topLeft = topLeft;
        this.boundingBox.bottomRight = bottomRight;
    }

    draw(ctx){
        for(let i=1; i < this.vertices.length; i++){
            DrawUtils.drawLine(this.vertices[i-1], this.vertices[i], this.color);
        }
        DrawUtils.drawLine(this.vertices[this.vertices.length-1], this.vertices[0],this.color);

        for(const [key, value] of this.anchorPoints.entries()){
            DrawUtils.drawPoint(value, 5 ,"green");
        }
    }

    move(delta){
        for(let i=0; i<this.vertices.length;i++){
            this.vertices[i].Add(delta);
        }
        this.centroid.Add(delta);

        this.boundingBox.topLeft.Add(delta);
        this.boundingBox.bottomRight.Add(delta);

        for(const [key, anchorPos] of this.anchorPoints.entries()){
            this.anchorPoints.set(key, Add(anchorPos, delta));
        }
    }

    rotate(radiansDelta){
        for(let i=0; i<this.vertices.length;i++){
            let rotatedVertices = MathHelper.rotateAroundPoint(this.vertices[i], this.centroid, radiansDelta);
            this.vertices[i] = rotatedVertices;
        }

        this.calculateBoundingBox();

        for(const [key, anchorPos] of this.anchorPoints.entries()){
            let rotated = MathHelper.rotateAroundPoint(anchorPos, this.centroid, radiansDelta);
            this.anchorPoints.set(key, rotated);
        }

        this.orientation += radiansDelta;
    }
}