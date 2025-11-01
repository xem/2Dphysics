class Polygon extends Shape{
	constructor(vertices){
		super(vertices);
		let centroid = MathHelper.calcCentroid(vertices);
		this.setCentroid(centroid);
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
}