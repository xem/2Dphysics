class Simulation{
	constructor(){
		
		this.shapes = new Array();
		this.shapes.push(new Circle(new Vector2(600,300),100.0));
		this.shapes.push(new Circle(new Vector2(300,300),100.0));
		// for drawing collisions
		this.collisionManifold = null;
	}
	
	update(dt){

		


		/*
		for(let i=0; i < this.shapes.length;i++){
			for(let j=0; j < this.shapes.length;j++){
				if(i === j) continue;	
					
				let objectA = this.shapes[i];
				let objectB = this.shapes[j];
			
						
				let result = CollisionDetection.checkCollisions(objectA,objectB);
				console.log(result);
				
				if(result){
					objectA.setColor("red");
					objectB.setColor("red");	
					this.collisionManifold = result;		
					
					//console.log(result);

					let push = Scale(result.normal,result.depth*0.5);
					objectB.move(push);
					push = Scale(result.normal,result.depth*-0.5);
					objectA.move(push);
				}else{
					objectA.setColor("black");
					objectB.setColor("black");	
					this.collisionManifold = null;					
				}
				
			}
		}	*/
	}
	
	
	draw(ctx){
		for(let i=0; i<this.shapes.length;i++){
			this.shapes[i].draw(ctx);
		}
		
		if(this.collisionManifold){
			this.collisionManifold.draw(ctx);
			//,,console.log("draw");
		}
	}	
	
	onKeyboardPressed(evt){
		this.moveSpeed = 5;
		
		switch(evt.key){
			case "d": this.shapes[0].move(new Vector2(this.moveSpeed,0));	break;	
			case "a": this.shapes[0].move(new Vector2(-this.moveSpeed,0));	break;	
			case "s": this.shapes[0].move(new Vector2(0,this.moveSpeed));	break;	
			case "w": this.shapes[0].move(new Vector2(0,-this.moveSpeed));	break;	
			case "r": this.shapes[0].rotate(0.05);	break;	
			case "q": this.shapes[0].rotate(-0.05);	break;	
			
			case "ArrowRight": this.shapes[1].move(new Vector2(this.moveSpeed,0));	break;
			case "ArrowLeft": this.shapes[1].move(new Vector2(-this.moveSpeed,0));	break;	
			case "ArrowDown": this.shapes[1].move(new Vector2(0,this.moveSpeed));	break;	
			case "ArrowUp": this.shapes[1].move(new Vector2(0,-this.moveSpeed));	break;	
			case ".": this.shapes[1].rotate(0.05);		break;	
			case ",": this.shapes[1].rotate(-0.05);	break;	
		}
	}
}