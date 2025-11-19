class SpringJoint extends Joint{
	constructor(connection, springConstant, restLength){
		super(connection);
		this.springConstant = springConstant;
		this.restLength = restLength;
	}
	
	updateConnectionA(){
		if(this.rigiA.isKinematic) return;
		
		
		let anchorAPos = this.getAnchorAPos();
		let anchorBPos = this.getAnchorBPos();
		
		let direction = Sub(anchorBPos,anchorAPos);
		let distance = direction.Length();
		let restDistance = distance - this.restLength;
		
		let forceHalving = this.rigiB.isKinematic ? 1 : 0.5;
		let forceMagnitude = restDistance * this.restLength * this.springConstant * forceHalving;
		
		direction.Normalize();
		let force = Scale(direction, forceMagnitude);
		this.rigiA.addForceAtPoint(anchorAPos, force);
		
		if(restDistance < -5) this.jointConnection.color = "blue";
		else if(restDistance > 5) this.jointConnection.color = "red";
		else this.jointConnection.color = "orange";
		
	}
	
	updateConnectionB(){
		if(this.rigiB.isKinematic) return;
		
		let anchorAPos = this.getAnchorAPos();
		let anchorBPos = this.getAnchorBPos();
		
		let direction = Sub(anchorAPos, anchorBPos);
		let distance = direction.Length();
		let restDistance = distance - this.restLength;

		let forceHalving = this.rigiA.isKinematic ? 1 : 0.5;
		let forceMagnitude = restDistance * this.restLength * this.springConstant * forceHalving;
		
		direction.Normalize();
		let force = Scale(direction, forceMagnitude);
		this.rigiB.addForceAtPoint(anchorBPos, force);	
		
		if(restDistance < -5) this.jointConnection.color = "blue";
		else if(restDistance > 5) this.jointConnection.color = "red";
		else this.jointConnection.color = "orange";
	}
}