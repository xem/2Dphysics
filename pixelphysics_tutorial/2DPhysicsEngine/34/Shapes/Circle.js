class Circle extends Shape{
	
	constructor(position, radius){
		super([new Vector2(position.x,position.y), new Vector2(position.x + radius, position.y)])
		this.position = position;
		this.radius = radius;
		this.setCentroid(position);
	}
	
	getRadius(){
		return this.radius;
	}
	
	calculateInertia(mass){
		return 0.5 * mass * this.radius * this.radius;
	}

	calculateBoundingBox(){
		this.boundingBox.topLeft.x = this.position.x - this.radius;
		this.boundingBox.topLeft.y = this.position.y - this.radius;
		this.boundingBox.bottomRight.x = this.position.x + this.radius;
		this.boundingBox.bottomRight.y = this.position.y + this.radius;
	}

	isPointInside(pos){
		let distanceToCenter = Sub(this.centroid, pos).Length();	
		return this.radius > distanceToCenter;
	}

	draw(ctx){
		super.draw(ctx);
		// drawing the actual circle
		DrawUtils.strokePoint(this.position, this.radius, this.color);
	}
}