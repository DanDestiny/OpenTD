import 'phaser';
import map from '../config/map';
import Enemy from '../objects/enemy';
import Turret from '../objects/turret';
import Bullet from '../objects/bullet';
import levelConfig from '../config/levelConfig';

export default class GameScene extends Phaser.Scene {
    constructor (){
        super('Game');
    }

    init(){
        this.map = map.map(function (arr){
            return arr.slice();
        });
        this.round = 1;
        this.nextEnemy = 0;
        this.score = 0;
        this.baseHealth = levelConfig.initial.baseHealth;
        this.availableTurrets = levelConfig.initial.numOfTurrets;
        this.roundStarted = false;
        this.remainingEnemies = (levelConfig.initial.numOfEnemies + this.round * levelConfig.incremental.numOfEnemies);

        this.events.emit('displayUI');
        this.events.emit('updateHealth', this.baseHealth);
        this.events.emit('updateScore', this.score);
        this.events.emit('updateTurrets', this.availableTurrets);
        this.events.emit('updateEnemies', this.remainingEnemies);

        // grab reference to UI Scene
        this.uiScene = this.scene.get('UI');
    }

    create(){
        this.events.emit('startRound', this.round);

        this.uiScene.events.on('roundReady', function () {
            this.roundStarted = true;
        }.bind(this));

        this.createMap(); 
        this.createPath();
        this.createCursor();
        this.createGroups();
    }

    update(time, delta){
        // Debug Show Mouse Position
        console.log('X: ' + this.game.input.mousePointer.x);
        console.log('Y: ' + this.game.input.mousePointer.y);

        // Check time for next enemy
        if (time > this.nextEnemy && this.roundStarted && this.enemies.countActive(true) < this.remainingEnemies){
            var enemy = this.enemies.getFirstDead();
            if (!enemy){
                enemy = new Enemy(this, 0, 0, this.path);
                this.enemies.add(enemy);
            }

            if (enemy){
                enemy.setActive(true);
                enemy.setVisible(true);

                // Set enemy to start of path
                enemy.startOnPath(this.round);

                this.nextEnemy = time + (2000 / this.round) + 300;
            }
        }
    }

    increaseRound(){
        this.roundStarted = false;
        this.round++;

        this.updateTurrets(levelConfig.incremental.numOfTurrets);
        this.updateEnemies(levelConfig.initial.numOfEnemies + this.round * levelConfig.incremental.numOfEnemies);
        this.events.emit('startRound', this.round);
    }
    
    updateEnemies(numberOfEnemies){
        this.remainingEnemies += numberOfEnemies;
        this.events.emit('updateEnemies', this.remainingEnemies);
        if (this.remainingEnemies <= 0){
            this.increaseRound();
        }
    }

    updateScore(score){
        this.score += score;
        this.events.emit('updateScore', this.score);
    }

    updateHealth(health){
        this.baseHealth -= health;
        this.events.emit('updateHealth', this.baseHealth);

        if (this.baseHealth <= 0){
            this.events.emit('hideUI');
            this.scene.start('Title');
        }
    }

    updateTurrets(numOfTurrets){
        this.availableTurrets += numOfTurrets;
        this.events.emit('updateTurrets', this.availableTurrets);
    }

    createGroups(){
        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        this.turrets = this.add.group({ classType: Turret, runChildUpdate: true});
        this.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

        this.physics.add.overlap(this.enemies, this.bullets, this.damageEnemy.bind(this));
        this.input.on('pointerdown', this.placeTurret.bind(this));
    }

    createCursor(){
        this.cursor = this.add.image(32, 32, 'cursor');
        this.cursor.setScale(2);
        this.cursor.alpha = 0;

        this.input.on('pointermove', function (pointer){
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
        console.log(i, j)
        return this.map[i][j] === 0 && this.availableTurrets > 0;
    }

    createPath(){
        this.graphics = this.add.graphics();

        // Path
        this.path = this.add.path(160, -32);
        this.path.lineTo(160, 480);
        this.path.lineTo(612, 480);
        this.path.lineTo(612, 100);
        this.path.lineTo(735, 100);
        this.path.lineTo(735, 420);
        this.path.lineTo(860, 420);
        this.path.lineTo(860, 340);

        //DEBUG Visualize the path
        this.graphics.lineStyle(3, 0xffffff, 1);
        this.path.draw(this.graphics);
    }

    createMap(){
        // create our map
        this.bgMap = this.make.tilemap({ key: 'area1_level1'});
        // add tile set
        this.tiles = this.bgMap.addTilesetImage('Area1_TileSet');
        // background layer
        this.backgroundLayer = this.bgMap.createStaticLayer('Base0', this.tiles, 0, 0);
        this.backgroundLayer = this.bgMap.createStaticLayer('Base1', this.tiles, 0, 0);
        this.backgroundLayer = this.bgMap.createStaticLayer('Buildings', this.tiles, 0, 0);
        // add our base
        //this.add.image(480, 480, 'base');
    }

    getEnemy(x, y, dist){
        var enemyUnits = this.enemies.getChildren();
        for(var i = 0; i < enemyUnits.length; i++){
            if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y,
                enemyUnits[i].x, enemyUnits[i].y) <= dist){
                    return enemyUnits[i];
            }
        }
        return false;
    }

    addBullet(x, y, angle){
        var bullet = this.bullets.getFirstDead();
        if (!bullet){
            bullet = new Bullet(this, 0, 0);
            this.bullets.add(bullet);
        }
        bullet.fire(x, y, angle);
    }

    placeTurret(pointer){
        var i = Math.floor(pointer.y / 64);
        var j = Math.floor(pointer.x / 64);

        if (this.canPlaceTurret(i, j)){
            var turret = this.turrets.getFirstDead();
            if (!turret){
                turret = new Turret(this, 0, 0, this.map);
                this.turrets.add(turret);
            }
            turret.setActive(true);
            turret.setVisible(true);
            turret.place(i, j);

            // DEBUG
            // this.graphics = this.add.graphics();
            // this.graphics.lineStyle(3, 0xffffff, 1);
            // this.graphics.alpha = 0.3;
            // this.graphics.beginPath();
            // this.graphics.arc(turret.x, turret.y, 100);
            // this.graphics.closePath();
            // this.graphics.strokeCircle(turret.x, turret.y, 100);

            this.updateTurrets(-1);
        }
    }

    damageEnemy(enemy, bullet){
        if (enemy.active === true && bullet.active === true){
            bullet.setActive(false);
            bullet.setVisible(false);

            enemy.recieveDamage(levelConfig.initial.bulletDamage);
        }
    }

}