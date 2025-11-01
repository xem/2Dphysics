class Polygon extends Shape{
    constructor(vertices){
        super(vertices);
        let centroid = MathHelper.calcCentroid(vertices);
        this.setCentroid(centroid);
        this.normals = MathHelper.calcNormals(vertices);
    }

    calculateInertia(mass){
        let inertia = 0;
        let massPerTriangleFace = mass / this.vertices.length;
        for(let i=0; i<this.vertices.length;i++){
            let centerToVertice0 = Sub(this.vertices[i],this.centroid);
            let indexVertice1 = MathHelper.Index(i+1, this.vertices.length);
            let centerTovertice1 = Sub(this.vertices[indexVertice1], this.centroid);
            let inertiaTriangle = massPerTriangleFace * (centerToVertice0.Length2() + centerTovertice1.Length2() + centerToVertice0.Dot(centerTovertice1)) / 6;
            inertia += inertiaTriangle;
        }
        return inertia;
    }

    rotate(radiansDelta){
        super.rotate(radiansDelta);
        this.normals = MathHelper.calcNormals(this.vertices);
    }

    draw(ctx){
        super.draw(ctx);

        for(let i=0; i<this.normals.length; i++){
            let direction = Sub(this.vertices[MathHelper.Index(i+1, this.vertices.length)], this.vertices[i]);
            let center = Add(this.vertices[i], Scale(direction,0.5));
            let end = Add(center, Scale(this.normals[i], 15));

            //DrawUtils.drawLine(center, end, "green");
        }
    }
}