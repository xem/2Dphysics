class Simulation{
	constructor(){
		
	}
	
	update(dt){
		//## checking if mouse input is working##
		console.log("MousePos x:"+mousePos[0] + " y: "+mousePos[1]);
		console.log("button-left pressed: "+ mouseDownLeft+" - button-right pressed: "+mouseDownRight);
	}
	
	
	draw(ctx){
		// Check if drawing is still working as intended		
		ctx.beginPath();
		ctx.rect(20, 40, 50, 50);
		ctx.fillStyle = "#FF0000";
		ctx.fill();
		ctx.closePath();	
	}	
	
	onKeyboardPressed(evt){
		//## checking if key input is working##
		console.log("Keyboard pressed: "+evt.keyCode);
	}
}