class Rigidbody{
    constructor(shape, mass = 1){
        this.shape = shape;
        this.mass = mass;
        this.isKinematic = false;

        if(mass > 0.00001){
            this.invMass = 1 / mass;
        }else{
            this.mass = 0;
            this.invMass = 0;
            this.isKinematic = true;
        }

        this.forceAccumulator = new Vector2(0,0);
        this.torqueAccumulator = 0;
        this.velocity = new Vector2(0,0);
        this.angularVelocity = 0;

        this.material = new Material();

        this.inertia = this.shape.calculateInertia(this.mass);
        if(this.inertia > 0.00001){
            this.invInertia = 1.0 / this.inertia;
        }else{
            this.invInertia = 0;
        }

        this.collisionGroup = CollisionGroups.GROUP0.id;
    }


    setCollisionGroups(group){
        this.collisionGroup = group.id;
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
        return this.velocity;
    }

    getAngularVelocity(){
        return this.angularVelocity;
    }

    update(deltaTime){
        this.integrate(deltaTime);

        this.velocity.Scale(0.999)
        this.angularVelocity *= 0.999;
        this.forceAccumulator = new Vector2(0,0);
        this.torqueAccumulator = 0;
    }

    addForceAtPoint(atPoint, force){
        let direction = Sub(atPoint, this.shape.centroid);
        this.forceAccumulator.Add(force);
        this.torqueAccumulator += direction.Cross(force);
    }

    integrate(deltaTime){
        //this.semiImplicitEuler(deltaTime);
        //this.forwardEuler(deltaTime);
        //this.midPointMethod(deltaTime);
        this.rungeKutta4(deltaTime);
    }

    semiImplicitEuler(deltaTime){
        let acceleration = Scale(this.forceAccumulator, this.invMass);
        this.velocity = Add(this.velocity, Scale(acceleration, deltaTime));
        let deltaPosition = Scale(this.velocity, deltaTime);
        this.shape.move(deltaPosition);

        let rotationalAcceleration = this.torqueAccumulator * this.invInertia;
        this.angularVelocity += rotationalAcceleration * deltaTime;
        let deltaRotation = this.angularVelocity * deltaTime;
        this.shape.rotate(deltaRotation);
    }

    forwardEuler(deltaTime){
        let acceleration = Scale(this.forceAccumulator, this.invMass);
        let deltaPosition = Scale(this.velocity, deltaTime);
        this.shape.move(deltaPosition);
        this.velocity = Add(this.velocity, Scale(acceleration, deltaTime));

        let rotationalAcceleration = this.torqueAccumulator * this.invInertia;
        let deltaRotation = this.angularVelocity * deltaTime;
        this.shape.rotate(deltaRotation);
        this.angularVelocity += rotationalAcceleration * deltaTime;
    }

    midPointMethod(deltaTime){
        let acceleration = Scale(this.forceAccumulator, this.invMass);
        let halfAcceleration = Scale(acceleration, 0.5);
        this.velocity = Add(this.velocity, Scale(halfAcceleration, deltaTime));
        let deltaPosition = Scale(this.velocity, deltaTime);
        this.shape.move(deltaPosition);
        this.velocity = Add(this.velocity, Scale(halfAcceleration, deltaTime));

        let rotationalAcceleration = this.torqueAccumulator * this.invInertia;
        let halfAngularVelocity = this.angularVelocity + rotationalAcceleration * (deltaTime * 0.5);
        let deltaRotation = halfAngularVelocity * deltaTime;
        this.shape.rotate(deltaRotation);
        this.angularVelocity += rotationalAcceleration * (deltaTime * 0.5);

    }

    rungeKutta4(deltaTime){
        let k1, k2, k3, k4;

        const computeAcceleration = (force, invMass) => Scale(force, invMass);

        // compute k1
        let acceleration = computeAcceleration(this.forceAccumulator, this.invMass);
        k1 = Scale(acceleration, deltaTime);

        // compute k2
        let tempForce = Add(this.forceAccumulator, Scale(k1, 0.5));
        acceleration = computeAcceleration(tempForce, this.invMass);
        k2 = Scale(acceleration, deltaTime);

        // compute k3
        tempForce = Add(this.forceAccumulator, Scale(k2, 0.5));
        acceleration = computeAcceleration(tempForce, this.invMass);
        k3 = Scale(acceleration, deltaTime);

        // compute k4
        tempForce = Add(this.forceAccumulator, Scale(k3, 0.5));
        acceleration = computeAcceleration(tempForce, this.invMass);
        k4 = Scale(acceleration, deltaTime);    

        // combine to get the new velocity
        // ((k2 x 2) + k1) + (k3 x 2) + k4) / 6
        // (k1 + 2xk2 + 2xk3 + k4) / 6
        let deltaVelocity = Scale(Add(Add(k1, Scale(k2, 2)), Add(Scale(k3, 2), k4)), 1 / 6.0);
        this.velocity = Add(this.velocity, deltaVelocity);

        let deltaPosition = Scale(this.velocity, deltaTime);
        this.shape.move(deltaPosition);


        // rotational integration
        // k1
        const computeRotationalAcceleration = (torque, invInertia) => torque * invInertia;
        let rotationalAcceleration = computeRotationalAcceleration(this.torqueAccumulator, this.invInertia);
        k1 = rotationalAcceleration * deltaTime;

        // k2
        let tempTorque = this.torqueAccumulator + k1 * 0.5;
        rotationalAcceleration = computeRotationalAcceleration(tempTorque, this.invInertia);
        k2 = rotationalAcceleration * deltaTime;

        // k3
        tempTorque = this.torqueAccumulator + k2 * 0.5;
        rotationalAcceleration = computeRotationalAcceleration(tempTorque, this.invInertia);
        k3 = rotationalAcceleration * deltaTime;

        // k4
        tempTorque = this.torqueAccumulator + k3 * 0.5;
        rotationalAcceleration = computeRotationalAcceleration(tempTorque, this.invInertia);
        k4 = rotationalAcceleration * deltaTime;

        let deltaAngularVelocity = (k1 + 2*k2 + 2*k3 + k4) / 6;
        this.angularVelocity += deltaAngularVelocity;

        let deltaRotation = this.angularVelocity * deltaTime;
        this.shape.rotate(deltaRotation);
    }




    getShape(){
        return this.shape;
    }

    log(){
        console.log(
            "Force: x = "+this.forceAccumulator.x+" y = "+this.forceAccumulator.y + 
            "\nVelocity: x = "+this.velocity.x+" y = "+this.velocity.y
        )
    }


}