class Simulation{
	constructor(){
		this.rigidBodys = [];
		this.gravity = new Vector2(0,5000);
		this.rigidBodys.push(new Rigidbody(new Rectangle(new Vector2(600,600), 200,100),10));
		this.rigidBodys.push(new Rigidbody(new Rectangle(new Vector2(200,600), 100,200),10));
		this.rigidBodys.push(new Rigidbody(new Circle(new Vector2(600,300),50.0),10));
		this.rigidBodys[0].shape.rotate(1.3);
/*
		let rigiBounce = new Rigidbody(new Circle(new Vector2(300,100),100.0),10);
		rigiBounce.material.bounce = 0.5;
		this.rigidBodys.push(rigiBounce);
		this.rigidBodys.push(new Rigidbody(new Circle(new Vector2(1000,100),75.0),10));*/

	}
	
	update(dt){
		
		for(let i=0; i<this.rigidBodys.length;i++){
			this.rigidBodys[i].update(dt);
		}
		
		for(let i=0; i<this.rigidBodys.length;i++){
			for(let j=0; j<this.rigidBodys.length;j++){
				if(i != j){
					let rigiA = this.rigidBodys[i];
					let rigiB = this.rigidBodys[j];
					let collisionManifold = CollisionDetection.checkCollisions(rigiA,rigiB);
					if(collisionManifold != null){
						collisionManifold.positionalCorrection();
						collisionManifold.resolveCollision();
					}
				}
			}
		}
	}
	
	
	draw(ctx){
		for(let i=0; i<this.rigidBodys.length;i++){
			this.rigidBodys[i].getShape().draw(ctx);
		}
	}	
	
	onKeyboardPressed(evt){
		let force = 5000;
		
		switch(evt.key){
			case "d": this.rigidBodys[0].addForce(new Vector2(force,0));	break;	
			case "a": this.rigidBodys[0].addForce(new Vector2(-force,0));	break;	
			case "s": this.rigidBodys[0].addForce(new Vector2(0,force));	break;	
			case "w": this.rigidBodys[0].addForce(new Vector2(0,-force));	break;	
			//case "r": this.rigidBodys[0].rotate(0.05);	break;	
			//case "q": this.rigidBodys[0].rotate(-0.05);	break;	
			
			case "ArrowRight": this.rigidBodys[1].addForce(new Vector2(force,0));	break;
			case "ArrowLeft": this.rigidBodys[1].addForce(new Vector2(-force,0));	break;	
			case "ArrowDown": this.rigidBodys[1].addForce(new Vector2(0,force));	break;	
			case "ArrowUp": this.rigidBodys[1].addForce(new Vector2(0,-force));	break;	
			//case ".": this.rigidBodys[1].rotate(0.05);		break;	
			//case ",": this.rigidBodys[1].rotate(-0.05);	break;	
		}
	}
}