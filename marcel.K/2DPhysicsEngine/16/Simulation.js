class Simulation{
	constructor(){
		this.rigidBodys = [];
		this.rigidBodys.push(new Rigidbody(new Circle(new Vector2(600,300),100.0),10));
		this.rigidBodys.push(new Rigidbody(new Circle(new Vector2(300,300),100.0),10));

	}
	
	update(dt){
		for(let i=0; i<this.rigidBodys.length;i++){
			this.rigidBodys[i].update(dt);
		}
		this.rigidBodys[0].log();
	}
	
	
	draw(ctx){
		for(let i=0; i<this.rigidBodys.length;i++){
			this.rigidBodys[i].getShape().draw(ctx);
		}
	}	
	
	onKeyboardPressed(evt){
		let force = 10;
		
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