class Shape{
	constructor(vertices){
		this.vertices = vertices;
		
		// Abstract class - avoids creation of a Shape object
		if(new.target === Shape){ 
			throw new TypeError("Cannot construct Abstract instances directly of class 'Shape'");
		}	
	}
	
	setCentroid(position){
		this.centroid = position;
	}
	
	draw(ctx){
		// drawing all edges
		for(let i=1;i<this.vertices.length;i++){
			DrawUtils.drawLine(this.vertices[i-1],this.vertices[i],"black");
		}
		DrawUtils.drawLine(this.vertices[this.vertices.length-1],this.vertices[0],"black");
		
		// drawing the centroid
		DrawUtils.drawPoint(this.centroid, 5, "black");
	}
	
	move(delta){
		for(let i=0; i<this.vertices.length;i++){
			this.vertices[i].Add(delta);
		}
		this.centroid.Add(delta);
	}
	
	rotate(radiansDelta){
		for(let i=0; i<this.vertices.length;i++){
			let rotated = MathHelper.rotateAroundPoint(this.vertices[i],this.centroid, radiansDelta);
			this.vertices[i] = rotated;
		}
	}
}

