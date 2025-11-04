class BoundingBox{
    constructor(){
        this.topLeft = new Vector2(0,0);
        this.bottomRight = new Vector2(0,0);
        this.isColliding = false;
    }

    intersect(otherBoundingBox){
        let leftX = this.topLeft.x;
        let rightX = this.bottomRight.x;
        let topY = this.topLeft.y;
        let bottomY = this.bottomRight.y;

        let otherLeftX = otherBoundingBox.topLeft.x;
        let otherRightX = otherBoundingBox.bottomRight.x;
        let otherTopY = otherBoundingBox.topLeft.y;
        let otherBottomY = otherBoundingBox.bottomRight.y;


        let intersectX = otherRightX > leftX && otherLeftX < rightX;
        let intersectY = otherTopY < bottomY && otherBottomY > topY;

        return intersectX && intersectY;
    } 

    draw(){
        console.log(this.isColliding);
        ctx.beginPath();
        if(this.isColliding){
            ctx.strokeStyle = "red";
        }else{
            ctx.strokeStyle = "grey";
        }
        let width = this.bottomRight.x - this.topLeft.x;
        let height = this.bottomRight.y - this.topLeft.y;
        ctx.rect(this.topLeft.x, this.topLeft.y, width, height);
        ctx.stroke();
        ctx.strokeStyle = "black";
    }
}