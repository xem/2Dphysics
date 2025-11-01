class DrawUtils{
    static drawPoint(position, radius, color){
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI*2, true);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    static strokePoint(position, radius, color){
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI*2, true);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }

    static drawLine(startPosition, endPosition, color){
        ctx.beginPath();
        ctx.moveTo(startPosition.x, startPosition.y);
        ctx.lineTo(endPosition.x, endPosition.y);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }

    static drawRect(start, size, color){
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.rect(start.x,start.y,size.x,size.y);
        ctx.stroke();
        ctx.closePath();
    }

    static drawText(position, size, color, text){
        ctx.font = size+"px Arial";
        ctx.fillStyle = color;
        ctx.fillText(text, position.x, position.y);
    }

    static drawArrow(startPosition, arrowheadPosition, color){
        this.drawLine(startPosition,arrowheadPosition, color);

        let direction = Sub(arrowheadPosition, startPosition);
        direction.Normalize();
        let arrowheadCenter = Sub(arrowheadPosition, Scale(direction,10));

        let directionToLeftArrowhead = direction.GetNormal();
        let leftArrowheadPosition = Add(arrowheadCenter, Scale(directionToLeftArrowhead, 5));
        this.drawLine(leftArrowheadPosition, arrowheadPosition, color);

        let directionToRightArrowhead = Scale(direction.GetNormal(),-1);
        let rightArrowheadPosition = Add(arrowheadCenter, Scale(directionToRightArrowhead, 5));
        this.drawLine(rightArrowheadPosition, arrowheadPosition, color);

    }
}