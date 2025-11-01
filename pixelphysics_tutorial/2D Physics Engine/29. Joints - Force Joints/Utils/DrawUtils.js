class DrawUtils{
	
	static drawPoint(position, radius, color){
		ctx.fillStyle = color; 
		ctx.beginPath(); 
		ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true); 
		ctx.fill(); 
		ctx.closePath();
	}
	
	static strokePoint(position, radius, color){
		ctx.strokeStyle = color;
		ctx.beginPath(); 
		ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true); 
		ctx.stroke();
		ctx.closePath();
	}
	
	static drawLine(startPosition, endPosition, color){
		ctx.strokeStyle = color;
		ctx.beginPath(); 
		ctx.moveTo(startPosition.x, startPosition.y);
		ctx.lineTo(endPosition.x, endPosition.y);
		ctx.stroke();
		ctx.closePath();
	}

	static drawRect(start, size, color){
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.rect(start.x, start.y, size.x, size.y);
		ctx.stroke();
	}
	
	static drawText(position, size, color, text){
		ctx.font = size+"px Arial";
		ctx.fillStyle = color;
		ctx.fillText(text, position.x, position.y);
	}
	
	static drawArrow(startPosition, arrowheadPosition, color){
		// first draw a regular line to the head
		this.drawLine(startPosition, arrowheadPosition, color);
		
		// then the arrowhead
		
		// This calculation can be very confusing.
		// I recommend to draw the steps listed below on a piece of paper.
		// You can also uncomment the drawLine fuctions to get a better understanding 
		
		let direction = Sub(arrowheadPosition,startPosition);
		let directionCopy = direction.Cpy();
		direction.Normalize();
		let length = direction.Length();
		let arrowheadCenter = Sub(arrowheadPosition, Scale(direction,10));
		//this.drawPoint(arrowheadCenter,2,"black");
		
		let leftArrowhead = direction.GetNormal();
		leftArrowhead.Scale(5);
		//this.drawLine(leftArrowhead, arrowheadCenter, "black");
		this.drawLine(Add(leftArrowhead,arrowheadCenter), arrowheadPosition, color);
		
		let rightArrowHead = Sub(arrowheadCenter,leftArrowhead);
		this.drawLine(rightArrowHead, arrowheadPosition, color);
		
	}
}