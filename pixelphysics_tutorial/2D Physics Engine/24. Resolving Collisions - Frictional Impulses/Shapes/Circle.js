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

	draw(ctx){
		super.draw(ctx);
		// drawing the actual circle
		DrawUtils.strokePoint(this.position, this.radius, this.color);
	}
}