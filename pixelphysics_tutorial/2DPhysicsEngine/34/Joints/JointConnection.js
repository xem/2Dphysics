class JointConnection{
	constructor(rigidBodyA, anchorAId, rigidBodyB, anchorBId){
		this.rigidBodyA = rigidBodyA;
		this.anchorAId = anchorAId;
		this.rigidBodyB = rigidBodyB;
		this.anchorBId = anchorBId;
		this.color = "orange"
	}
	
	getAnchorAPos(){
		return this.rigidBodyA.shape.getAnchorPos(this.anchorAId);
	}
	
	getAnchorBPos(){
		return this.rigidBodyB.shape.getAnchorPos(this.anchorBId);
	}
	
	draw(){
		let start = this.rigidBodyA.shape.getAnchorPos(this.anchorAId);
		let end = this.rigidBodyB.shape.getAnchorPos(this.anchorBId);
		DrawUtils.drawLine(start, end, this.color);
	}
}