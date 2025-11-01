class Joint{
    constructor(jointConnection){
        this.jointConnection = jointConnection;
        this.rigiA = this.jointConnection.rigidBodyA;
        this.rigiB = this.jointConnection.rigidBodyB;
        this.anchorAId = this.jointConnection.anchorAId;
        this.anchorBId = this.jointConnection.anchorBId;


        if(new.target === Joint){
            throw new TypeError("Cannot construct Abstract instances directly of class 'Joint'");
        }
    }

    getAnchorAPos(){
        return this.rigiA.getShape().getAnchorPos(this.anchorAId);
    }

    getAnchorBPos(){
        return this.rigiB.getShape().getAnchorPos(this.anchorBId);
    }

    updateConnectionA(){}
    updateConnectionB(){}

    draw(){
        this.jointConnection.draw();
    }
}