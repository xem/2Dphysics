class ReverseForceJoint extends Joint{
	constructor(connection, strength, maxAffectDistance){
		super(connection);
		this.strength = strength;
		this.maxAffectDistance = maxAffectDistance;
	}
	
	updateConnectionA(){
		if(this.rigiA.isKinematic) return;
		
		let anchorAPos = this.getAnchorAPos();
		let anchorBPos = this.getAnchorBPos();
		
		let direction = Sub(anchorBPos, anchorAPos);
		let distance = direction.Length();
		direction.Normalize();
		let forceMagnitude = Math.max(0, this.maxAffectDistance - distance);

		let forceHalving = this.rigiB.isKinematic ? 1 : 0.5;
		this.rigiA.addForceAtPoint(anchorBPos, Scale(direction, forceMagnitude*this.strength*forceHalving*-1));	
		
		if(distance < this.maxAffectDistance) this.jointConnection.color = "blue";
		else this.jointConnection.color = "orange";
	}
	
	updateConnectionB(){
		if(this.rigiB.isKinematic) return;
		
		let anchorAPos = this.getAnchorAPos();
		let anchorBPos = this.getAnchorBPos();
		
		let direction = Sub(anchorAPos, anchorBPos);
		let distance = direction.Length();
		direction.Normalize();
		let forceMagnitude = Math.max(0, this.maxAffectDistance - distance);

		let forceHalving = this.rigiB.isKinematic ? 1 : 0.5;
		this.rigiB.addForceAtPoint(anchorAPos, Scale(direction, forceMagnitude*this.strength*forceHalving*-1));	
		
		if(distance < this.maxAffectDistance) this.jointConnection.color = "blue";
		else this.jointConnection.color = "orange";
	}
}