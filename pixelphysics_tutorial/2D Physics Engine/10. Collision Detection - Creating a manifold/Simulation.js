class Simulation{
	constructor(){
		this.testCircleA = new Circle(new Vector2(100,100),50.0);
		this.testCircleB = new Circle(new Vector2(300,300),150.0);
		
		
		this.testRect = new Rectangle(new Vector2(400,400),500,250);
	}
	
	update(dt){
		//## checking if mouse input is still working##
		//console.log("MousePos x:"+mousePos.x + " y: "+mousePos.y);
		//console.log("button-left pressed: "+ mouseDownLeft+" - button-right pressed: "+mouseDownRight);
		
		
		
		let result = CollisionDetection.circleVsCircle(this.testCircleA,this.testCircleB);
		if(result){
			this.testCircleA.setColor("red");
			this.testCircleB.setColor("red");			
		}else{
			this.testCircleA.setColor("black");
			this.testCircleB.setColor("black");			
		}
		console.log(result);
		
		
	}
	
	
	draw(ctx){
		this.testCircleA.draw(ctx);
		this.testCircleB.draw(ctx);
	}	
	
	onKeyboardPressed(evt){
		this.moveSpeed = 5;
		
		switch(evt.key){
			case "d": this.testCircleB.move(new Vector2(this.moveSpeed,0));	break;	
			case "a": this.testCircleB.move(new Vector2(-this.moveSpeed,0));	break;	
			case "s": this.testCircleB.move(new Vector2(0,this.moveSpeed));	break;	
			case "w": this.testCircleB.move(new Vector2(0,-this.moveSpeed));	break;	
			case "r": this.testCircleB.rotate(0.05);	break;	
			case "q": this.testCircleB.rotate(-0.05);	break;	
			
			case "ArrowRight": this.testCircleA.move(new Vector2(this.moveSpeed,0));	break;
			case "ArrowLeft": this.testCircleA.move(new Vector2(-this.moveSpeed,0));	break;	
			case "ArrowDown": this.testCircleA.move(new Vector2(0,this.moveSpeed));	break;	
			case "ArrowUp": this.testCircleA.move(new Vector2(0,-this.moveSpeed));	break;	
			case ".": this.testCircleA.rotate(0.05);		break;	
			case ",": this.testCircleA.rotate(-0.05);	break;	
		}
	}
}