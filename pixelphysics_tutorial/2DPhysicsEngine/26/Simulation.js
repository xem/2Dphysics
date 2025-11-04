class Simulation{
	constructor(worldSize){
		this.worldSize = worldSize;
		this.rigidBodies = [];
		this.gravity = new Vector2(0,100);

		this.grid = new SpatialGrid(50);
		this.grid.initialize(this.worldSize, this.rigidBodies);

		this.createBoundary();

		
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(200,700), 200,100),100));
		//this.rigidBodies.push(new Rigidbody(new Circle(new Vector2(500,300),60.0),1));
		//this.rigidBodies.push(new Rigidbody(new Circle(new Vector2(600,300),30.0),1));

		this.createStressTestPyramid();

		console.log(this.rigidBodies.length+" bodies instantiated!");
	}
	
	createStressTestPyramid(){
		let boxSize = 15;
		let iterations = 50;
		let topOffset = this.worldSize.y - iterations * boxSize;
		for(let i=0;i<iterations;i++){
			
			for(let j=iterations; j >= iterations-i; j--){
				let x = boxSize*i + j*(boxSize/2);
				let y = boxSize*j;
				//this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(x,y+topOffset), boxSize, boxSize),1));
				this.rigidBodies.push(new Rigidbody(new Circle(new Vector2(x,y+topOffset), boxSize/2),1));
			}
		}
	}

	createBoundary(){
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x/2,-50), this.worldSize.x,99),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x/2,this.worldSize.y+50), this.worldSize.x,99),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(-51,this.worldSize.y/2), 100,this.worldSize.y),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x+51,this.worldSize.y/2), 100,this.worldSize.y),0));
	}

	update(dt){
		
		for(let i=0; i<this.rigidBodies.length;i++){
			this.rigidBodies[i].update(0.01);
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
	
					if(rigiA != rigiB){

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

		//this.grid.draw();
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
	}
}