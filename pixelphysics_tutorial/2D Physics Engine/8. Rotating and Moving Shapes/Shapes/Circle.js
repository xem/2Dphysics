class Circle extends Shape{
	
	constructor(position, radius){
		super([new Vector2(position.x,position.y), new Vector2(position.x + radius, position.y)])
		this.position = position;
		this.radius = radius;
		this.setCentroid(position);
	}
	
	draw(ctx){
		super.draw(ctx);
		// drawing the actual circle
		DrawUtils.strokePoint(this.position, this.radius, "black");
	}
}