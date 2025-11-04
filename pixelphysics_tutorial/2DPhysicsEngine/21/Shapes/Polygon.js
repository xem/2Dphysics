class Polygon extends Shape{
	constructor(vertices){
		super(vertices);
		let centroid = MathHelper.calcCentroid(vertices);
		this.setCentroid(centroid);
		
		
		this.normals = MathHelper.calcNormals(vertices);
	}
	
	rotate(radiansDelta){
		super.rotate(radiansDelta);
		this.normals = MathHelper.calcNormals(this.vertices);
	}
	
	draw(ctx){
		super.draw(ctx);
		// drawing the centroid
		DrawUtils.drawPoint(this.centroid, 5, "black");
		
		// drawing normals
		/*
		for(let i=0;i<this.vertices.length;i++){
			let direction = Sub(this.vertices[MathHelper.Index(i+1,this.vertices.length)], this.vertices[i]);
			let center = Add(this.vertices[i],Scale(direction, 0.5));
			DrawUtils.drawLine(center,Add(center, Scale(this.normals[i],15)),"green");
		}
		*/
	}
}