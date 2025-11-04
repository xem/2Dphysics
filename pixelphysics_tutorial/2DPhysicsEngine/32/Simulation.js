class Simulation{
	constructor(worldSize){
		this.worldSize = worldSize;
		this.rigidBodies = [];
		this.joints = [];
		
		this.gravity = new Vector2(0,100);

		this.grid = new HashGrid(50);
		//this.grid = new SpatialGrid(50);
		this.grid.initialize(this.worldSize, this.rigidBodies);
		this.createBoundary();


		let rect = new Rectangle(new Vector2(200,400), 200,100);
		let rectRigidBody = new Rigidbody(rect,-1);
		this.rigidBodies.push(rectRigidBody);
		
		
		let circle = new Circle(new Vector2(500,300),60.0);
		let circleRigidBody = new Rigidbody(circle,1);
		this.rigidBodies.push(circleRigidBody);

		let circle2 = new Circle(new Vector2(310,100),60.0);
		let circleRigidBody2 = new Rigidbody(circle2,1);
		this.rigidBodies.push(circleRigidBody2);

		//this.createStressTestPyramid();

		console.log(this.rigidBodies.length+" bodies instantiated!");
		
		//let jointConnection = new JointConnection(rectRigidBody,anchorRectId, circleRigidBody,anchorCircleId);
		//this.joints.push(new ReverseForceJoint(jointConnection,2,300));
		
		this.selectedRigidBody = null;
		this.selectedPosition = null;
		this.selectedAnchorId = null;
		
		/*
		this.rigidBodies[6].collisionLayer = CollisionLayer.Layer1;
		this.rigidBodies[5].collisionLayer = CollisionLayer.Layer2;
		this.rigidBodies[5].collisionMask = CollisionMask.Mask1;
		*/
		this.rigidBodies[6].addNonCollidingRigi(this.rigidBodies[5]);
	}
	
	createStressTestPyramid(){
		let boxSize = 15;
		let iterations = 50;
		let topOffset = this.worldSize.y - iterations * boxSize;
		for(let i=0;i<iterations;i++){
			
			for(let j=iterations; j >= iterations-i; j--){
				let x = boxSize*i + j*(boxSize/2);
				let y = boxSize*j;
				this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(x,y+topOffset), boxSize, boxSize),1));
				//this.rigidBodies.push(new Rigidbody(new Circle(new Vector2(x,y+topOffset), boxSize/2),0.1));
			}
		}
	}

	createBoundary(){
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x/2,-50), this.worldSize.x,100),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x/2,this.worldSize.y+50), this.worldSize.x,100),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(-50,this.worldSize.y/2), 100,this.worldSize.y),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x+50,this.worldSize.y/2), 100,this.worldSize.y),0));
	}

	handleMouseObjectInteraction(){
		if(mouseDownLeft){
			let id = this.grid.getGridIdFromPos(mousePos);
			let nearBodies = this.grid.getContentOfCell(id);
			for(let i=0; i<nearBodies.length;i++){
				let mouseInside = nearBodies[i].shape.isPointInside(mousePos);
				if(mouseInside && this.selectedRigidBody == null){
					this.selectedRigidBody = nearBodies[i];
					this.selectedPosition = mousePos.Cpy();
					// to local pos
					let localPos = Sub(mousePos,nearBodies[i].shape.centroid);
					this.selectedAnchorId = nearBodies[i].shape.createAnchor(localPos);
				}
			}
		}else{
			if(this.selectedRigidBody != null){
				this.selectedRigidBody.shape.removeAnchor(this.selectedAnchorId);
				this.selectedRigidBody = null;
			}
			
			this.selectedAnchorId = null;
			this.selectedPosition = null;
			
		}
		if(this.selectedRigidBody && this.selectedPosition){
			let start = this.selectedRigidBody.shape.getAnchorPos(this.selectedAnchorId);
			let force = Sub(mousePos,start);
			this.selectedRigidBody.addForceAtPoint(start,force);
			DrawUtils.drawLine(start, mousePos, "black");			
		}
	}

	handleJoints(){
		for(let i=0; i<this.joints.length;i++){
			//console.log(this.joints[i].jointConnection.anchorA);
			this.joints[i].draw();
			this.joints[i].updateConnectionA();
			this.joints[i].updateConnectionB();
		}
	}

	update(dt){

		this.handleMouseObjectInteraction();
		
		this.handleJoints();
		
		for(let i=0; i<this.rigidBodies.length;i++){
			this.rigidBodies[i].update(0.025);
			this.rigidBodies[i].shape.boundingBox.isColliding = false;

			// apply gravity
			let gravitationalForce = Scale(this.gravity, this.rigidBodies[i].mass);
			this.rigidBodies[i].addForce(gravitationalForce);
		}

		this.grid.refreshGrid();
		for(let solverIterations=0; solverIterations < 5; solverIterations++){
			
			for(let i=0; i<this.rigidBodies.length;i++){
				let rigiA = this.rigidBodies[i];

				let neigbourRigies = this.grid.getNeighbourRigis(i,rigiA);
				//console.log(neigbourRigies);

				for(let j=0; j<neigbourRigies.length;j++){
					let rigiB = neigbourRigies[j];
	
					if(rigiA != rigiB && rigiA.canCollide(rigiB)){

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
	}
	
	
	draw(ctx){
		for(let i=0; i<this.rigidBodies.length;i++){
			this.rigidBodies[i].getShape().draw(ctx);
		}

		this.grid.draw();
	}	
	
	onKeyboardPressed(evt){
		let force = 50000;
		
		switch(evt.key){
			case "d": this.rigidBodies[this.rigidBodies.length-2].addForce(new Vector2(force,0));	break;	
			case "a": this.rigidBodies[this.rigidBodies.length-2].addForce(new Vector2(-force,0));	break;	
			case "s": this.rigidBodies[this.rigidBodies.length-2].addForce(new Vector2(0,force));	break;	
			case "w": this.rigidBodies[this.rigidBodies.length-2].addForce(new Vector2(0,-force));	break;	
			
			case "ArrowRight": this.rigidBodies[this.rigidBodies.length-1].addForce(new Vector2(force,0));	break;
			case "ArrowLeft": this.rigidBodies[this.rigidBodies.length-1].addForce(new Vector2(-force,0));	break;	
			case "ArrowDown": this.rigidBodies[this.rigidBodies.length-1].addForce(new Vector2(0,force));	break;	
			case "ArrowUp": this.rigidBodies[this.rigidBodies.length-1].addForce(new Vector2(0,-force));	break;	
			case ".": this.rigidBodies[this.rigidBodies.length-1].angularVelocity += 1;break;	
			case ",": this.rigidBodies[this.rigidBodies.length-1].angularVelocity -= 1;break;	
		}
		
		if(evt.key == "Enter"){
			this.rigidBodies[6].removeNonCollidingRigi(this.rigidBodies[5]);
		}
	}
}