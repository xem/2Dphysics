class HashGrid extends SpatialGrid{
    constructor(cellSize){
        super(cellSize);
        this.hashMap = new Map();
		this.rigidBodiesToCells = [];
		this.hashMapSize = 10000;
		this.p1Prime = 125311;
		this.p2Prime = 588667;
    }


    initialize(worldSize, rigidBodies){
        this.worldSize = worldSize;
        this.rigidBodies = rigidBodies;
    }

    clearGrid(){
        this.hashMap.clear();
		
		this.rigidBodiesToCells = [];
        for(let i=0; i<this.rigidBodies.length; i++){
            this.rigidBodiesToCells[i] = [];
        }
    }

	cellIndexToHash(x, y){
		let hash = (x * this.p1Prime ^ y * this.p2Prime) % this.hashMapSize
		return hash;
	}
	
	getGridIdFromPos(pos){
		let x = parseInt(pos.x / this.cellSize);
		let y = parseInt(pos.y / this.cellSize);
		return this.cellIndexToHash(x,y);
	}
	
	getContentOfCell(id){
		let content = this.hashMap.get(id);
		
		if(content == null) return [];
		else return content 
	}
    
    mapBodiesToCell(){
		for(let i=0; i<this.rigidBodies.length; i++){

            let boundingBox = this.rigidBodies[i].shape.boundingBox;
            let left = boundingBox.topLeft.x;
            let right = boundingBox.bottomRight.x;
            let top = boundingBox.topLeft.y;
            let bottom = boundingBox.bottomRight.y;

            let leftCellIdx = MathHelper.Clamp(parseInt(left / this.cellSize),0,1000);
            let rightCellIdx = MathHelper.Clamp(parseInt(right / this.cellSize),0,1000);
            let topCellIdx = MathHelper.Clamp(parseInt(top / this.cellSize),0,1000);
            let bottomCellIdx = MathHelper.Clamp(parseInt(bottom / this.cellSize),0,1000);


            for(let x=leftCellIdx; x <= rightCellIdx; x++){
                for(let y=topCellIdx; y<=bottomCellIdx; y++){
					let hash = this.cellIndexToHash(x,y);
					let entries = this.hashMap.get(hash);
					if(entries == null){
						let newArray = [this.rigidBodies[i]];
						this.hashMap.set(hash, newArray);
					}else{
						entries.push(this.rigidBodies[i]);
					}
					this.rigidBodiesToCells[i].push(hash);
                }
            }
        }
    }

    getNeighbourRigis(rigiIndex, rigidbody){
        let occupiedCells = this.rigidBodiesToCells[rigiIndex];
        let neighbourRigidbodies = [];

        for(let i=0; i<occupiedCells.length; i++){
            let cellHash = occupiedCells[i];
            let rigisInCell = this.hashMap.get(cellHash);
            for(let j=0;j<rigisInCell.length;j++){
                let rigiInCell = rigisInCell[j];
                if(rigidbody != rigiInCell){
                    neighbourRigidbodies.push(rigiInCell);
                }
            }
        }
        return neighbourRigidbodies;
    }
	
	draw(){
		
		
		
    }
}