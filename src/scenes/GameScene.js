import 'phaser';
import map from '../config/map';

export default class GameScene extends Phaser.Scene {
    constructor (){
        super('Game');
    }

    init(){
        this.map = map.map(function (arr){
            return arr.slice();
        });
    }

    create(){
       this.createMap(); 
       this.createPath();
       this.createCursor();
    }

    createCursor(){
        this.cursor = this.add.image(32, 32, 'cursor');
        this.cursor.setScale(2);
        this.cursor.alpha = 0;

        this.input.on('pointermove', function (pointer){
            console.log(pointer);
            var i = Math.floor(pointer.y / 64);
            var j = Math.floor(pointer.x / 64);

            if (this.canPlaceTurret(i, j)){
                this.cursor.setPosition(j * 64 + 32, i * 64 + 32);
                this.cursor.alpha = 0.8;
            } else {
                this.cursor.alpha = 0;
            }
        }.bind(this));
    }

    canPlaceTurret(i, j){
        return this.map[i][j] === 0;
    }

    createPath(){
        this.graphics = this.add.graphics();

        // Path
        this.path = this.add.path(96, -32);
        this.path.lineTo(96, 164);
        this.path.lineTo(480, 164);
        this.path.lineTo(480, 544);

        // Visualize the path
        this.graphics.lineStyle(3, 0xffffff, 1);
        this.path.draw(this.graphics);
    }

    createMap(){
        // create our map
        this.bgMap = this.make.tilemap({ key: 'level1'});
        // add tile set
        this.tiles = this.bgMap.addTilesetImage('terrainTiles_default');
        // background layer
        this.backgroundLayer = this.bgMap.createStaticLayer('Background', this.tiles, 0, 0);
        // add our base
        this.add.image(480, 480, 'base');
    }

}