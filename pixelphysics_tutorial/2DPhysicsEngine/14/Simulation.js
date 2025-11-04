class Simulation{
	constructor(){
		
		this.shapes = new Array();
		
		//this.testCircleA = new Circle(new Vector2(100,100),50.0);
		//this.testCircleB = new Circle(new Vector2(600,600),100.0);
		
		this.shapes.push(new Rectangle(new Vector2(300,400),400,250));
		this.shapes.push(new Circle(new Vector2(600,300),100.0));
		this.shapes.push(new Rectangle(new Vector2(600,400),150,150));
		//this.shapes.push(new Rectangle(new Vector2(500,600),400,100));
		
		// for drawing collisions
		this.collisionManifold = null;
	}
	
	update(dt){
		//## checking if mouse input is still working##
		//console.log("MousePos x:"+mousePos.x + " y: "+mousePos.y);
		//console.log("button-left pressed: "+ mouseDownLeft+" - button-right pressed: "+mouseDownRight);
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
		}	
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