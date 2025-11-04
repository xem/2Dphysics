class Vector2{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    Normalize(){
        length = this.Length();
        this.x /= length;
        this.y /= length;
    }

    Length2(){
        return this.x*this.x+this.y*this.y;
    }

    Length(){
        return Math.sqrt(this.Length2());
    }

    GetNormal(){
        return new Vector2(this.y, -this.x);
    }

    Dot(vec){
        return this.x*vec.x + this.y*vec.y;
    }

    Cpy(){
        return new Vector2(this.x, this.y);
    }

    Add(vec){
        this.x += vec.x;
        this.y += vec.y;
    }

    Sub(vec){
        this.x -= vec.x;
        this.y -= vec.y;
    }

    Scale(scalar){
        this.x *= scalar;
        this.y *= scalar;
    }

    Cross(vec){
        return this.x*vec.y - this.y*vec.x;
    }

    Log(){
        console.log("x: "+this.x +" - y: "+this.y);
    }
}


function Add(vecA, vecB){
    return new Vector2(vecA.x + vecB.x, vecA.y + vecB.y);
}

function Sub(vecA, vecB){
    return new Vector2(vecA.x - vecB.x, vecA.y - vecB.y);
}

function Scale(vecA, scale){
    return new Vector2(vecA.x * scale, vecA.y * scale);
}