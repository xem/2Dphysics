class Simulation{
	constructor(){
		this.testCircle = new Circle(new Vector2(100,100),50.0);
		this.testRect = new Rectangle(new Vector2(400,400),500,250);
	}
	
	update(dt){
		//## checking if mouse input is still working##
		//console.log("MousePos x:"+mousePos.x + " y: "+mousePos.y);
		//console.log("button-left pressed: "+ mouseDownLeft+" - button-right pressed: "+mouseDownRight);
	}
	
	
	draw(ctx){
		this.testCircle.draw(ctx);
		this.testRect.draw(ctx);
	}	
	
	onKeyboardPressed(evt){
		
	}
}