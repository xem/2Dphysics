class MathHelper{
	
	// this implementation is based of the wikipedia article
	// https://en.wikipedia.org/wiki/Polygon at "Polygon"	
	static calcCentroid(vertices){
		// calculating the centroid
		let A = this.calcArea(vertices);
		let length = vertices.length;
		let Cx = 0;
		let Cy = 0;
		
		// calculating Cx
		for(let i=0;i<length;i++){
			let i_next = this.Index(i+1,length);
			Cx += (vertices[i].x+vertices[i_next].x) * 
				(vertices[i].x*vertices[i_next].y - vertices[i_next].x*vertices[i].y);
			
		}
		Cx /= (6*A);
		
		// calculating Cy
		for(let i=0;i<length;i++){
			let i_next = this.Index(i+1,length);
			Cy += (vertices[i].y+vertices[i_next].y) * 
				(vertices[i].x*vertices[i_next].y - vertices[i_next].x*vertices[i].y);
		
		}
		Cy /= (6*A);
			
		return new Vector2(Cx,Cy);
	}
	
	static calcArea(vertices){
		// first calculating A as in section "Area" of https://en.wikipedia.org/wiki/Polygon
		let A = 0;
		let length = vertices.length;
		
		for(let i=0;i<vertices.length;i++){
			let i_next = this.Index(i+1,length);
			
			A += 	vertices[i].x*vertices[i_next].y  			
					- vertices[i_next].x*vertices[i].y
		}
		return A/2;
	}
	
	// circular index -> usefull in loops when you can get out of bounds -> if so, it just returns index 0..1..2..3 again
	// idx is the current index in the loop (example: i), arraySize is the size of the array (.length)
	static Index(idx, arraySize){
		return (idx+arraySize) % arraySize;
	}
	
	
	static rotateAroundPoint(toRotateVertice, point, radians){
		let rotated = new Vector2(0,0);

		// Direction
		let dir = Sub(toRotateVertice, point);
		
		rotated.x = dir.x * Math.cos(radians) - dir.y * Math.sin(radians);
		rotated.y = dir.x * Math.sin(radians) + dir.y * Math.cos(radians);

		rotated.Add(point);
		return rotated;		
	}
}