class Vector2{
	constructor(x,y){
		this.x=x;
		this.y=y;
	}
	// change length of the vector to one
	Normalize(){
		length = this.Length();
		this.x /= length;
		this.y /= length;
	}

	// returning the length of the vector
	Length(){
		return Math.sqrt(this.x*this.x+this.y*this.y);
	}
	
	// returning the squared length of the vector - avoids squareroot -> less performance intensive
	Length2(){
		return this.x*this.x+this.y*this.y;
	}
	
	// returning the orthonormal vector of the class vector
	GetNormal(){
		return new Vector2(this.y,-this.x);
	}
	
	// returning the dot product with an other vector
	Dot(vec){
		return this.x*vec.x+this.y*vec.y;
	}
	
	// returning a copied vector of this class
	Cpy(){
		return new Vector2(this.x,this.y);
	}
	
	// Adding a vector to the class vector
	Add(vec){
		this.x += vec.x;
		this.y += vec.y;
	}
	
	// Substracting a vector from the class vector
	Sub(vec){
		this.x -= vec.x;
		this.y -= vec.y;
	}
	
	// Scaling this vector by a scalar value
	Scale(scalar){
		this.x *= scalar;
		this.y *= scalar;
	}
}

// global functions of adding, substracting and scaling 
function Add(vecA, vecB){
	return new Vector2(vecA.x + vecB.x, vecA.y+vecB.y);
}

function Sub(vecA, vecB){
	return new Vector2(vecA.x - vecB.x, vecA.y-vecB.y);
}

function Scale(vecA, scale){
	return new Vector2(vecA.x*scale, vecA.y*scale);
}