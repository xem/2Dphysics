class JointConnection{
    constructor(rigidBodyA, anchorAId, rigidBodyB, anchorBId){
        this.rigidBodyA = rigidBodyA;
        this.anchorAId = anchorAId;
        this.rigidBodyB = rigidBodyB;
        this.anchorBId = anchorBId;
        this.color = "orange";
    }

    draw(){
        let start = this.rigidBodyA.getShape().getAnchorPos(this.anchorAId);
        let end = this.rigidBodyB.getShape().getAnchorPos(this.anchorBId);
        DrawUtils.drawLine(start, end, this.color);
    }

}