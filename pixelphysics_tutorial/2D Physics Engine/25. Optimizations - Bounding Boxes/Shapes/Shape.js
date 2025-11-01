class Shape{
	constructor(vertices){
		this.vertices = vertices;
		this.color = "black";
		this.boundingBox = new BoundingBox();
		
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

	draw(ctx){
		// drawing all edges
		for(let i=1;i<this.vertices.length;i++){
			DrawUtils.drawLine(this.vertices[i-1],this.vertices[i],this.color);
		}
		DrawUtils.drawLine(this.vertices[this.vertices.length-1],this.vertices[0],this.color);
		
		// drawing the centroid
		DrawUtils.drawPoint(this.centroid, 5, this.color);

		this.boundingBox.draw();
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
	}
	
	rotate(radiansDelta){
		for(let i=0; i<this.vertices.length;i++){
			let rotated = MathHelper.rotateAroundPoint(this.vertices[i],this.centroid, radiansDelta);
			this.vertices[i] = rotated;
		}
		this.calculateBoundingBox();
	}
}

