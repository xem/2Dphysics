class SpatialGrid{
    constructor(cellSize){
        this.cellSize = cellSize;
        this.cells = [];
        this.rigidBodiesToCells = [];
    }

    initialize(worldSize, rigidBodies){
        this.worldSize = worldSize;
        this.rigidBodies = rigidBodies;

        this.cellCountX = parseInt(this.worldSize.x / this.cellSize);
        this.cellCountY = parseInt(this.worldSize.y / this.cellSize);

        if(this.cellSize * this.cellCountX < this.worldSize.x){
            this.cellCountX++;
        }
        if(this.cellSize * this.cellCountY < this.worldSize.y){
            this.cellCountY++;
        }

        for(let i=0; i<this.cellCountX*this.cellCountY; i++){
            this.cells[i] = [];
        }

        console.log(this.cells.length+" cells instantiated!");
    }

    refreshGrid(){
        this.clearGrid();
        this.mapBodiesToCell();
    }

    

    mapBodiesToCell(){
        for(let i=0; i<this.rigidBodies.length;i++){
            let boundingBox = this.rigidBodies[i].getShape().boundingBox;
            let left = boundingBox.topLeft.x;
            let right = boundingBox.bottomRight.x;
            let top = boundingBox.topLeft.y;
            let bottom = boundingBox.bottomRight.y;

            let leftCellIdx = MathHelper.clamp(parseInt(left / this.cellSize), 0, this.cellCountX - 1);
            let rightCellIdx =  MathHelper.clamp(parseInt(right / this.cellSize),0, this.cellCountX -1);
            let topCellIdx =  MathHelper.clamp(parseInt(top / this.cellSize),0, this.cellCountY -1);
            let bottomCellIdx =  MathHelper.clamp(parseInt(bottom / this.cellSize), 0, this.cellCountY - 1);

            for(let x = leftCellIdx; x <= rightCellIdx; x++){
                for(let y = topCellIdx; y <= bottomCellIdx; y++){
                    let cellIdx = x + y * this.cellCountX;
                    this.cells[cellIdx].push(this.rigidBodies[i]);
                    this.rigidBodiesToCells[i].push(cellIdx);

                    let position = new Vector2(x * this.cellSize + 5, y * this.cellSize + 5);
                    DrawUtils.drawRect(position, new Vector2(this.cellSize - 5, this.cellSize-5), "black");
                }
            }
        }
    }

    getContentOfCell(id){
        return this.cells[id];
    }

    getGridIdFromPosition(pos){
        let x = parseInt(pos.x / this.cellSize);
        let y = parseInt(pos.y / this.cellSize);
        return x + y * this.cellCountX;
    }

    clearGrid(){
        for(let i=0; i<this.cellCountX*this.cellCountY;i++){
            this.cells[i] = [];
        }
        this.rigidBodiesToCells = [];
        for(let i=0; i<this.rigidBodies.length;i++){
            this.rigidBodiesToCells[i] = [];
        }
    }

    getNeighbourRigis(rigiIndex, rigidbody){
        let occupiedCells = this.rigidBodiesToCells[rigiIndex];
       
        let neighbourRigidbodies = [];

        for(let i=0; i < occupiedCells.length; i++){
            let occupiedCellIdx = occupiedCells[i];
            let cell = this.cells[occupiedCellIdx];
            for(let j=0; j<cell.length;j++){
                let rigiInCell = cell[j];
                if(rigidbody != rigiInCell){
                    neighbourRigidbodies.push(rigiInCell);
                }
            }
        }

        return neighbourRigidbodies;
    }

    draw(){

        for(let x=0; x<this.cellCountX; x++){
            for(let y=0; y<this.cellCountY; y++){
                let position = new Vector2(x * this.cellSize + 5, y * this.cellSize + 5);
                DrawUtils.drawRect(position, new Vector2(this.cellSize - 5, this.cellSize-5), "grey");
            }
        }
    }

}