class Joint{
	constructor(jointConnection){
		this.jointConnection = jointConnection;
		this.rigiA = this.jointConnection.rigidBodyA;
		this.anchorAId = this.jointConnection.anchorAId;
		
		this.rigiB = this.jointConnection.rigidBodyB;
		this.anchorBId = this.jointConnection.anchorBId;
		
		
		// Abstract class - avoids creation of a Joint object
		if(new.target === Joint){ 
			throw new TypeError("Cannot construct Abstract instances directly of class 'Joint'");
		}	
	}	
	
	getAnchorAPos(){
		return this.rigiA.shape.getAnchorPos(this.anchorAId);
	}
	
	getAnchorBPos(){
		return this.rigiB.shape.getAnchorPos(this.anchorBId);
	}
	
	updateConnectionA(){}
	updateConnectionB(){}
	draw(){
		this.jointConnection.draw();
	}
}		