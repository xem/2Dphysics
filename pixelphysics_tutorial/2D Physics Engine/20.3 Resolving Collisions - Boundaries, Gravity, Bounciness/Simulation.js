class Simulation{
	constructor(worldSize){
		this.worldSize = worldSize;
		this.rigidBodies = [];
		this.gravity = new Vector2(0,100);

		this.createBoundary();

		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(200,600), 200,100),100));
		this.rigidBodies.push(new Rigidbody(new Circle(new Vector2(900,300),50.0),10));
	}
	

	createBoundary(){
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x/2,-50), this.worldSize.x,100),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x/2,this.worldSize.y+50), this.worldSize.x,100),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(-50,this.worldSize.y/2), 100,this.worldSize.y),0));
		this.rigidBodies.push(new Rigidbody(new Rectangle(new Vector2(this.worldSize.x+50,this.worldSize.y/2), 100,this.worldSize.y),0));
	}

	update(dt){
		
		for(let i=0; i<this.rigidBodies.length;i++){
			this.rigidBodies[i].update(dt);

			// apply gravity
			let gravitationalForce = Scale(this.gravity, this.rigidBodies[i].mass);
			this.rigidBodies[i].addForce(gravitationalForce);
		}
		
		for(let i=0; i<this.rigidBodies.length;i++){
			for(let j=0; j<this.rigidBodies.length;j++){
				if(i != j){
					let rigiA = this.rigidBodies[i];
					let rigiB = this.rigidBodies[j];
					let collisionManifold = CollisionDetection.checkCollisions(rigiA,rigiB);
					if(collisionManifold != null){
						collisionManifold.resolveCollision();
						collisionManifold.positionalCorrection();
					}
				}
			}
		}
	}
	
	
	draw(ctx){
		for(let i=0; i<this.rigidBodies.length;i++){
			this.rigidBodies[i].getShape().draw(ctx);
		}
	}	
	
	onKeyboardPressed(evt){
		let force = 5000;
		
		switch(evt.key){
			case "d": this.rigidBodies[this.rigidBodies.length-2].addForce(new Vector2(force,0));	break;	
			case "a": this.rigidBodies[this.rigidBodies.length-2].addForce(new Vector2(-force,0));	break;	
			case "s": this.rigidBodies[this.rigidBodies.length-2].addForce(new Vector2(0,force));	break;	
			case "w": this.rigidBodies[this.rigidBodies.length-2].addForce(new Vector2(0,-force));	break;	
			//case "r": this.rigidBodys[0].rotate(0.05);	break;	
			//case "q": this.rigidBodys[0].rotate(-0.05);	break;	
			
			case "ArrowRight": this.rigidBodies[this.rigidBodies.length-1].addForce(new Vector2(force,0));	break;
			case "ArrowLeft": this.rigidBodies[this.rigidBodies.length-1].addForce(new Vector2(-force,0));	break;	
			case "ArrowDown": this.rigidBodies[this.rigidBodies.length-1].addForce(new Vector2(0,force));	break;	
			case "ArrowUp": this.rigidBodies[this.rigidBodies.length-1].addForce(new Vector2(0,-force));	break;	
			//case ".": this.rigidBodys[1].rotate(0.05);		break;	
			//case ",": this.rigidBodys[1].rotate(-0.05);	break;	
		}
	}
}