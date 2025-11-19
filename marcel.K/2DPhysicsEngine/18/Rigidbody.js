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
		this.log();
		this.integrate(deltaTime);
	}
	
	integrate(deltaTime){
		//semi implicit Euler
		//this.semiImplicitEuler(deltaTime);
		//this.forwardEuler(deltaTime);
		//this.midPointMethod(deltaTime);
		this.rungeKutta4(deltaTime);
		
		this.forceAccumulator = new Vector2(0,0);
	}
	
	semiImplicitEuler(deltaTime){
		let acceleration = Scale(this.forceAccumulator, this.invMass);
		this.velocity = Add(this.velocity,Scale(acceleration, deltaTime));
		let deltaPosition = Scale(this.velocity, deltaTime);
		this.shape.move(deltaPosition);
	}
	
	// maybe not show
	forwardEuler(deltaTime){
		let acceleration = Scale(this.forceAccumulator,this.invMass);
		let deltaPosition = Scale(this.velocity, deltaTime);
		this.shape.move(deltaPosition);
		this.velocity = Add(this.velocity, Scale(acceleration, deltaTime));		
	}
	
	// maybe not show
	midPointMethod(deltaTime){
		let acceleration = Scale(this.forceAccumulator, this.invMass);
		let halfAcceleration = Scale(acceleration, 0.5);
		this.velocity = Add(this.velocity, Scale(halfAcceleration, deltaTime));
		let deltaPosition = Scale(this.velocity, deltaTime);
		this.shape.move(deltaPosition);
		this.velocity = Add(this.velocity, Scale(halfAcceleration, deltaTime));
	}
	
	rungeKutta4(deltaTime) {
		let k1, k2, k3, k4;

		// Function to compute acceleration
		const computeAcceleration = (force, invMass) => Scale(force, invMass);

		// Compute k1
		let acceleration = computeAcceleration(this.forceAccumulator, this.invMass);
		k1 = Scale(acceleration, deltaTime);

		// Compute k2
		let tempForce = Add(this.forceAccumulator, Scale(k1, 0.5));
		acceleration = computeAcceleration(tempForce, this.invMass);
		k2 = Scale(acceleration, deltaTime);

		// Compute k3
		tempForce = Add(this.forceAccumulator, Scale(k2, 0.5));
		acceleration = computeAcceleration(tempForce, this.invMass);
		k3 = Scale(acceleration, deltaTime);

		// Compute k4
		tempForce = Add(this.forceAccumulator, k3);
		acceleration = computeAcceleration(tempForce, this.invMass);
		k4 = Scale(acceleration, deltaTime);

		// Combine to get the new velocity
		let deltaVelocity = Scale(Add(Add(k1, Scale(k2, 2)), Add(Scale(k3, 2), k4)), 1 / 6.0);
		this.velocity = Add(this.velocity, deltaVelocity);

		// Update position based on the new velocity
		let deltaPosition = Scale(this.velocity, deltaTime);
		this.shape.move(deltaPosition);
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