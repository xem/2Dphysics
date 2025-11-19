class Rigidbody{
	constructor(shape, mass = 1){
		this.shape = shape;
		this.mass = mass;
		this.isKinematic = false;
		if(mass > 0.000001){
			this.invMass = 1.0 / mass;
		}else{
			this.invMass = 0;
			this.isKinematic = true;
		}
		
		this.forceAccumulator = new Vector2(0,0);
		this.velocity = new Vector2(0,0);
		this.angularVelocity = 0;
		this.material = new Material();
		this.inertia = this.shape.calculateInertia(this.mass);
		if(this.inertia > 0.00001){
			this.invInertia = 1 / this.inertia;
		}else{
			this.invInertia = 0;
		}
		
		

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
	
	getVelocity(){
		return this.velocity.Cpy();
	}
	

	getAngularVelocity(){
		return this.angularVelocity;
	}

	getCenter(){
		return this.shape.centroid.Cpy();
	}
	
	update(deltaTime){
		//this.log();
		this.integrate(deltaTime);
	}
	
	integrate(deltaTime){
		//semi implicit Euler
		this.semiImplicitEuler(deltaTime);
		//this.forwardEuler(deltaTime);
		//this.midPointMethod(deltaTime);
		
		this.velocity.Scale(0.999);
		this.angularVelocity *= 0.999;
		//this.velocity.Log();

		this.forceAccumulator = new Vector2(0,0);
	}
	
	semiImplicitEuler(deltaTime){
		let acceleration = Scale(this.forceAccumulator, this.invMass);
		this.velocity = Add(this.velocity,Scale(acceleration, deltaTime));
		let deltaPosition = Scale(this.velocity, deltaTime);
		this.shape.move(deltaPosition);

		let deltaRotation = this.angularVelocity * deltaTime;
		//console.log(deltaRotation);
		this.shape.rotate(deltaRotation);
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
	
	
	
	getShape(){
		return this.shape;
	}
	
	log(){
		console.log(
		"Force: x = "+this.forceAccumulator.x + " y = "+this.forceAccumulator.y+
		"\nVelocity: x = "+this.velocity.x+" y = "+this.velocity.y);
	}

}