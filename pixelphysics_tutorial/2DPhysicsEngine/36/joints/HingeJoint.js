class HingeJoint extends Joint{
    constructor(connection){
        super(connection);

        console.log(this.jointConnection);
		let anchorAPos = this.getAnchorAPos();

		let anchorBPos = this.getAnchorBPos();
        this.initialLength = Sub(anchorAPos, anchorBPos).Length();

        this.rigiARestitution = this.rigiA.material.restitution;
        this.rigiBRestitution = this.rigiB.material.restitution;
        this.rigiAFriction = this.rigiA.material.friction;
        this.rigiBFriction = this.rigiB.material.friction;

        this.jointIterations = 20;
    }

    updateConnectionA(){
        this.setMaterialZero();

        for(let i=0; i<this.jointIterations; i++){
            let anchorAPos = this.getAnchorAPos();
            let anchorBPos = this.getAnchorBPos();

            let anchorDir = Sub(anchorAPos, anchorBPos);
            let distance = anchorDir.Length();
            if(distance < 0.0000001){
                break;
            }

            anchorDir.Normalize();
            let normal = anchorDir.Cpy();
            let contact = new CollisionManifold(0,normal, anchorBPos);
            contact.rigiA = this.rigiA;
            contact.rigiB = this.rigiB;

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

        for(let i=0; i<this.jointIterations; i++){
            let anchorAPos = this.getAnchorAPos();
            let anchorBPos = this.getAnchorBPos();

            let anchorDir = Sub(anchorBPos, anchorAPos);
            let distance = anchorDir.Length();
            if(distance < 0.0000001){
                break;
            }

            anchorDir.Normalize();
            let normal = anchorDir.Cpy();
            let contact = new CollisionManifold(0,normal, anchorBPos);
            contact.rigiA = this.rigiA;
            contact.rigiB = this.rigiB;

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
        this.rigiA.material.restitution = this.rigiARestitution;
        this.rigiB.material.restitution = this.rigiBRestitution;
        this.rigiA.material.friction = this.rigiAFriction;
        this.rigiB.material.friction = this.rigiBFriction;
    }

    setMaterialZero(){
        this.rigiA.material.restitution = 0.0001;
        this.rigiB.material.restitution = 0.0001;
        this.rigiA.material.friction = 0.0001;
        this.rigiB.material.friction = 0.0001;
    }
}