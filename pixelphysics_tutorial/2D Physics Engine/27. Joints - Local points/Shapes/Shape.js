class Shape{
	constructor(vertices){
		this.vertices = vertices;
		this.color = "black";
		this.boundingBox = new BoundingBox();
		this.anchorPoints = new Map();
		
		// Abstract class - avoids creation of a Shape object
		if(new.target === Shape){ 
			throw new TypeError("Cannot construct Abstract instances directly of class 'Shape'");
		}	
	}
	
	setCentroid(position){
		this.centroid = position;
	}
	
	setColor(color){
		this.color = color;
	}
	
	getCentroid(){
		return this.centroid.Cpy();
	}
	
	createAnchor(localAnchorPos){
		this.anchorPoints.set(this.anchorPoints.size, Add(this.centroid,localAnchorPos));
		let id = this.anchorPoints.size-1;
		console.log("Created anchor with id ["+id+"]");
		return id;
	}
	

	
	removeAnchor(anchorIndex){
		let removed = this.anchorPoints.delete(anchorIndex);
		if(!removed){
			console.log("Anchor with id ["+anchorIndex+"] not found");
		}
		return removed;
	}

	draw(ctx){
		// drawing all edges
		for(let i=1;i<this.vertices.length;i++){
			DrawUtils.drawLine(this.vertices[i-1],this.vertices[i],this.color);
		}
		DrawUtils.drawLine(this.vertices[this.vertices.length-1],this.vertices[0],this.color);
		
		for (const [key, value] of this.anchorPoints.entries()) {
		  DrawUtils.drawPoint(value, 5, "green");
		}	
		
		// drawing the centroid
		//DrawUtils.drawPoint(this.centroid, 5, this.color);

		//this.boundingBox.draw();
	}
	
	calculateBoundingBox(){
		let topLeft = new Vector2(Number.MAX_VALUE,Number.MAX_VALUE);
		let bottomRight = new Vector2(Number.MIN_VALUE, Number.MIN_VALUE);
		for(let i=0; i<this.vertices.length;i++){
			let x = this.vertices[i].x;
			let y = this.vertices[i].y;
			if(x < topLeft.x){
				topLeft.x = x;
			}
			if(x > bottomRight.x){
				bottomRight.x = x;
			}
			if(y < topLeft.y){
				topLeft.y = y;
			}
			if(y > bottomRight.y){
				bottomRight.y = y;
			}
		}
		this.boundingBox.topLeft = topLeft;
		this.boundingBox.bottomRight = bottomRight;
	}

	move(delta){
		for(let i=0; i<this.vertices.length;i++){
			this.vertices[i].Add(delta);
		}
		this.centroid.Add(delta);
		this.boundingBox.topLeft.Add(delta);
		this.boundingBox.bottomRight.Add(delta);
		
		for (const [anchorKey, anchorPos] of this.anchorPoints.entries()) {
			this.anchorPoints.set(anchorKey, Add(anchorPos, delta))
		}	
	}
	
	rotate(radiansDelta){
		for(let i=0; i<this.vertices.length;i++){
			let rotated = MathHelper.rotateAroundPoint(this.vertices[i],this.centroid, radiansDelta);
			this.vertices[i] = rotated;
		}
		this.calculateBoundingBox();
		
		for (const [anchorKey, anchorPos] of this.anchorPoints.entries()) {
			let rotated = MathHelper.rotateAroundPoint(anchorPos,this.centroid, radiansDelta);
			this.anchorPoints.set(anchorKey, rotated);
		}		
	}
}

