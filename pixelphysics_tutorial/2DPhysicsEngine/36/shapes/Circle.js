class Circle extends Shape{
    constructor(position, radius){
        super([new Vector2(position.x, position.y), new Vector2(position.x + radius, position.y)]);
        this.position = position;
        this.radius = radius;
        this.setCentroid(position);
    }

    calculateInertia(mass){
        return mass * this.radius * this.radius * 0.5;
    }

    calculateBoundingBox(){
        this.boundingBox.topLeft.x = this.position.x - this.radius;
        this.boundingBox.topLeft.y = this.position.y - this.radius;
        this.boundingBox.bottomRight.x = this.position.x + this.radius;
        this.boundingBox.bottomRight.y = this.position.y + this.radius;
    }

    getRadius(){
        return this.radius;
    }

    isPointInside(pos){
        let distanceToCenter = Sub(this.centroid, pos).Length2();
        return this.radius * this.radius > distanceToCenter;
    }

    draw(ctx){
        super.draw(ctx);
        DrawUtils.strokePoint(this.position, this.radius, this.color);
    }
}