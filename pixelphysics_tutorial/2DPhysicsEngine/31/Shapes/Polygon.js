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
	
	calculateInertia(mass){
		let inertia = 0;
		let massPerTriangleFace = mass / this.vertices.length;
		for(let i=0; i<this.vertices.length;i++){
			let centerToVertice0 = Sub(this.vertices[i],this.centroid);
			let indexVertice1 = MathHelper.Index(i+1, this.vertices.length);
			let centerToVertice1 = Sub(this.vertices[indexVertice1], this.centroid);
			let inertiaTriangle = massPerTriangleFace * (centerToVertice0.Length2() + centerToVertice1.Length2() + centerToVertice0.Dot(centerToVertice1)) / 6;
			inertia += inertiaTriangle;
		}
		return inertia;
	}

	draw(ctx){
		super.draw(ctx);
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