class ForceJoint extends Joint{
	constructor(connection, strength){
		super(connection);
		this.strength = strength;
	}
	
	updateConnectionA(){
		if(this.rigiA.isKinematic) return;
		
		let anchorAPos = this.getAnchorAPos();
		let anchorBPos = this.getAnchorBPos();
		
		let forceHalving = this.rigiB.isKinematic ? 1 : 0.5;
		let direction = Sub(anchorBPos, anchorAPos);
		this.rigiA.addForceAtPoint(anchorBPos, Scale(direction, this.strength*forceHalving));	
	}
	
	updateConnectionB(){
		if(this.rigiB.isKinematic) return;
		
		let anchorAPos = this.getAnchorAPos();
		let anchorBPos = this.getAnchorBPos();
		
		let forceHalving = this.rigiA.isKinematic ? 1 : 0.5;
		let direction = Sub(anchorAPos, anchorBPos);
		this.rigiB.addForceAtPoint(anchorAPos, Scale(direction, this.strength*forceHalving));
	}
}