class HingeJoint extends Joint{
	constructor(connection){
		super(connection);
		
		this.rigiA = this.jointConnection.rigidBodyA;
		this.rigiB = this.jointConnection.rigidBodyB;
		
		let anchorAPos = this.jointConnection.getAnchorAPos();
		let anchorBPos = this.jointConnection.getAnchorBPos();
		
		this.initialLength = Sub(anchorAPos,anchorBPos).Length();
		
		this.rigiABounce = this.rigiA.material.bounce;
		this.rigiBBounce = this.rigiB.material.bounce;
		this.rigiAFriction = this.rigiA.material.friction;
		this.rigiBFriction = this.rigiB.material.friction;
		
		this.jointIterations = 20;
		
	}
	
	
	updateConnectionA(){
		this.setMaterialZero();	

		
		for(let i=0; i<this.jointIterations;i++){
			let anchorAPos = this.jointConnection.getAnchorAPos();
			let anchorBPos = this.jointConnection.getAnchorBPos();
			
			let anchorDir = Sub(anchorBPos, anchorAPos);
			let distance = anchorDir.Length();
			if(distance<0.00001) break;
			
			anchorDir.Normalize();
			let normal = anchorDir.Cpy();

			let contact = new CollisionManifold(0, normal, anchorBPos);
			contact.rigiA = this.rigiB;
			contact.rigiB = this.rigiA;
			contact.flipNormalEnabled = false;
			
			if(distance > this.initialLength){
				contact.depth = distance - this.initialLength;
			}else{
				contact.depth = this.initialLength - distance;
				contact.normal.Scale(-1);
			}
			contact.positionalCorrection();
			contact.resolveCollision();			
		}	
		this.restoreMaterial();
	}
	
	updateConnectionB(){
		this.setMaterialZero();
		
		for(let i=0;i<this.jointIterations;i++){
			let anchorAPos = this.jointConnection.getAnchorAPos();
			let anchorBPos = this.jointConnection.getAnchorBPos();
			
			let anchorDir = Sub(anchorBPos, anchorAPos);
			let distance = anchorDir.Length();
			if(distance<0.00001) break;
			
			anchorDir.Normalize();
			let normal = anchorDir.Cpy();
					
			let contact = new CollisionManifold(0, normal, anchorBPos);
			contact.rigiA = this.rigiA;
			contact.rigiB = this.rigiB;
			contact.flipNormalEnabled = false;		
			
			if(distance > this.initialLength){
				contact.depth = distance - this.initialLength;
			}else{
				contact.depth = this.initialLength - distance;
				contact.normal.Scale(-1);
			}	
			contact.positionalCorrection();			
			contact.resolveCollision();		
		}	
		this.restoreMaterial();
	}
	
	restoreMaterial(){
		this.rigiA.material.bounce = this.rigiABounce;
		this.rigiA.material.friction = this.rigiAFriction;
		this.rigiB.material.bounce = this.rigiBBounce;
		this.rigiB.material.friction = this.rigiBFriction;
	}
	
	setMaterialZero(){
		this.rigiA.material.bounce = 0;
		this.rigiA.material.friction = 0;
		this.rigiB.material.bounce = 0;
		this.rigiB.material.friction = 0;
	}
}