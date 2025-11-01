class Simulation{
    constructor(worldSize){
        this.gravity = new Vector2(0, 5000);
        this.worldSize = worldSize
        this.rigidBodies = [];
        this.joints = [];

        this.gravity = new Vector2(0,100);

        this.grid = new HashGrid(30);
        this.grid.initialize(this.worldSize, this.rigidBodies);

        this.createBoundary();


        let rect = new Rectangle(new Vector2(400,200), 200, 100);
        let anchorRectId = rect.createAnchor(new Vector2(75,0));
        let rectRigidBody = new Rigidbody(rect, 0);
        this.rigidBodies.push(rectRigidBody);

        let rect2 = new Rectangle(new Vector2(600,200), 300, 25);
        let anchorRect2Id = rect2.createAnchor(new Vector2(-125,0));
        let rect2RigidBody = new Rigidbody(rect2, 1);
        this.rigidBodies.push(rect2RigidBody);

        let circle = new Circle(new Vector2(400,300),60.0);
        let anchorCircleId = circle.createAnchor(new Vector2(-60,0));
        let circleRigidBody = new Rigidbody(circle,1)
        this.rigidBodies.push(circleRigidBody);

        rectRigidBody.setCollisionGroups(CollisionGroups.GROUP1);
        rect2RigidBody.setCollisionGroups(CollisionGroups.GROUP2);
        circleRigidBody.setCollisionGroups(CollisionGroups.GROUP3);

        // seeting group names
        CollisionGroups.GROUP1.name = "Kinematic Objects";
        CollisionGroups.GROUP2.name = "Non Kinematic Rectangles";
        CollisionGroups.GROUP3.name = "Non Kinematic Circle Objects";

        this.disableCollisionBetweenGroups(CollisionGroups.GROUP1, CollisionGroups.GROUP2);
        this.enableCollisionBetweenGroups(CollisionGroups.GROUP1, CollisionGroups.GROUP3);

        //this.createStressTestPyramid();

        console.log(this.rigidBodies.length+" bodies instantiated");

        let jointConnection = new JointConnection(rectRigidBody, anchorRectId, rect2RigidBody, anchorRect2Id);
        this.joints.push(new HingeJoint(jointConnection));

        let jointConnection2 = new JointConnection(rectRigidBody, anchorRectId, circleRigidBody,anchorCircleId);
        this.joints.push(new HingeJoint(jointConnection2));

        this.selectedRigidBody = null;
        this.selectedPosition = null;
        this.selectedAnchorId = null;
    }

    canCollide(groupA, groupB){

        return (CollisionMatrix[groupA] & groupB) !== 0;
    }

    enableCollisionBetweenGroups(groupA, groupB){
        CollisionMatrix[groupA.id] |= groupB.id;
        CollisionMatrix[groupB.id] |= groupA.id;
    }

    disableCollisionBetweenGroups(groupA, groupB){
        CollisionMatrix[groupA.id] &= ~groupB.id;
        CollisionMatrix[groupB.id] &= ~groupA.id;
    }

    createStressTestPyramid(){
        let boxSize = 15;
        let iterations = 50;
        let topOffset = this.worldSize.y - iterations * boxSize;

        for(let i=0; i<iterations; i++){
            for(let j=iterations; j>= iterations-i; j--){
                let x = boxSize*i + j*(boxSize/2)
                let y = boxSize*j;
                this.rigidBodies.push(new Rigidbody(new Circle(new Vector2(x, y+topOffset), boxSize/2),1));
            }
        }
    }

    createBoundary(){
        this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x/2,-50), this.worldSize.x, 100),0));
        this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x/2, this.worldSize.y+50), this.worldSize.x, 100),0));
        this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(-50,this.worldSize.y/2), 100, this.worldSize.y),0));
        this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x+50,this.worldSize.y/2), 100, this.worldSize.y),0));
    }
    
    handleMouseObjectInteraction(){
        if(mouseDownLeft){
            let id = this.grid.getGridIdFromPosition(mousePos);
            let nearBodies = this.grid.getContentOfCell(id);
            for(let i=0; i<nearBodies.length;i++){
                let mouseInside = nearBodies[i].shape.isPointInside(mousePos);
                if(mouseInside && this.selectedRigidBody == null){
                    this.selectedRigidBody = nearBodies[i];
                    this.selectedPosition = mousePos.Cpy();
                    // to local position
                    let localPos = Sub(mousePos, nearBodies[i].getShape().centroid);
                    this.selectedAnchorId = nearBodies[i].getShape().createAnchor(localPos);
                }
            }
        }else{
            if(this.selectedRigidBody != null){
                this.selectedRigidBody.getShape().removeAnchor(this.selectedAnchorId);
                this.selectedRigidBody = null;
            }
            this.selectedAnchorId = null;
            this.selectedPosition = null;
        }

        if(this.selectedRigidBody && this.selectedPosition){
            let anchorPos = this.selectedRigidBody.getShape().getAnchorPos(this.selectedAnchorId);
            let force = Sub(mousePos, anchorPos);
            this.selectedRigidBody.addForceAtPoint(anchorPos, force);
            DrawUtils.drawLine(anchorPos, mousePos, "black");
        }
    }

    handleJoints(){
        for(let i=0; i<this.joints.length; i++){
            this.joints[i].draw();
            this.joints[i].updateConnectionA();
            this.joints[i].updateConnectionB();
        }
    }

    update(deltaTime){

        this.handleMouseObjectInteraction();

        this.handleJoints();

        for(let i=0; i<this.rigidBodies.length;i++){
            this.rigidBodies[i].update(deltaTime);
            this.rigidBodies[i].getShape().boundingBox.isColliding = false;

            // F = gravity * mass
            let gravitaionalForce = Scale(this.gravity, this.rigidBodies[i].mass)
            this.rigidBodies[i].addForce(gravitaionalForce);
        }

        this.grid.refreshGrid();

        for(let solverIterations = 0; solverIterations < 5; solverIterations++){
            for(let i=0; i<this.rigidBodies.length;i++){
                let rigiA = this.rigidBodies[i];
                let neighbourRigidbodies = this.grid.getNeighbourRigis(i, rigiA);

				for(let j=0; j<neighbourRigidbodies.length;j++){
					let rigiB = neighbourRigidbodies[j];
                    
                    if(this.canCollide(rigiA.collisionGroup, rigiB.collisionGroup)){
                        let isColliding = rigiA.shape.boundingBox.intersect(rigiB.shape.boundingBox);
                        if(!isColliding) continue;
                        rigiA.shape.boundingBox.isColliding = isColliding;
                        rigiB.shape.boundingBox.isColliding = isColliding;
                        
                        let collisionManifold = CollisionDetection.checkCollisions(rigiA,rigiB);
    
                        if(collisionManifold != null){
                            collisionManifold.resolveCollision();
                            collisionManifold.positionalCorrection();
                        }
                    }
				}
            }
        }


        //this.rigidBodies[0].log();
    }


    draw(ctx){
        for(let i=0; i<this.rigidBodies.length;i++){   
            this.rigidBodies[i].getShape().draw(ctx);
        }

        this.grid.draw();
    }

    onKeyboardPressed(evt){
        this.force = 5000;
        let length = this.rigidBodies.length

        switch(evt.key){
            case "d": this.rigidBodies[length-2].addForce(new Vector2(this.force,0)); break;
            case "a": this.rigidBodies[length-2].addForce(new Vector2(-this.force,0)); break;
            case "s": this.rigidBodies[length-2].addForce(new Vector2(0,this.force)); break;
            case "w": this.rigidBodies[length-2].addForce(new Vector2(0,-this.force)); break;
            //case "e": this.rigidBodies[0].rotate(0.05); break;
            //case "q": this.rigidBodies[0].rotate(-0.05); break;

            case "ArrowRight":  this.rigidBodies[length-1].addForce(new Vector2(this.force,0)); break;
            case "ArrowLeft":   this.rigidBodies[length-1].addForce(new Vector2(-this.force,0)); break;
            case "ArrowDown":   this.rigidBodies[length-1].addForce(new Vector2(0,this.force)); break;
            case "ArrowUp":     this.rigidBodies[length-1].addForce(new Vector2(0,-this.force)); break;
            //case ".":           this.rigidBodies[1].rotate(0.05); break;
            //case ",":           this.rigidBodies[1].rotate(-0.05); break;
        }

    }
}