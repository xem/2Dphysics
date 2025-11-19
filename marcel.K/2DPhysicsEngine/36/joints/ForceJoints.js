class ForceJoint extends Joint{
    constructor(connection, strength){
        super(connection);
        this.strength = strength;
    }

    updateConnectionA(){
        if(this.rigiA.isKinematic) return;

        let anchorAPos = this.getAnchorAPos();
        let anchorBPos = this.getAnchorBPos();
        let direction = Sub(anchorBPos, anchorAPos);
        direction.Normalize();

        let forceHalving = this.rigiB.isKinematic ? 1 : 0.5;
        this.rigiA.addForceAtPoint(anchorBPos, Scale(direction, this.strength * forceHalving));
    }

    updateConnectionB(){
        if(this.rigiB.isKinematic) return;

        let anchorAPos = this.getAnchorAPos();
        let anchorBPos = this.getAnchorBPos();
        let direction = Sub(anchorAPos, anchorBPos);
        direction.Normalize();

        let forceHalving = this.rigiB.isKinematic ? 1 : 0.5;
        this.rigiB.addForceAtPoint(anchorAPos, Scale(direction, this.strength * forceHalving));
    }
}