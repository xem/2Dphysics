class Rigidbody{
	constructor(shape, mass){
		this.shape = shape;
		this.mass = mass;
		this.invMass = 0;
		if(mass > 0){
			this.invMass = 1.0 / mass;
		}
		
		this.forceAccumulator = new Vector2(0,0);
		this.velocity = new Vector2(0,0);
		
	}
	
	addForce(force){
		this.forceAccumulator.Add(force);
	}
	
	addVelocity(velocity){
		this.velocity.Add(velocity);
	}
	
	setVelocity(velocity){
		this.velocity = velocity.Cpy();
	}
	
	update(deltaTime){
		this.integrate(deltaTime);
	}
	
	integrate(deltaTime){
		
	}
	
	getShape(){
		return this.shape;
	}
	
	log(){
		console.log(
		"Force: x = "+this.forceAccumulator.x + " y = "+this.forceAccumulator.y+
		"\nVelocity: x = "+this.velocity.x+" y = "+this.velocity.y);
	}

}