import 'phaser';
import levelConfig from '../config/levelConfig';

export default class Enemy extends Phaser.GameObjects.Image {
    constructor(scene, x, y, path){
        super(scene, x, y, 'enemy');

        this.scene = scene;
        this.path = path;
        this.hp = 0;
        this.enemySpeed = 0;
        this.follower = {t: 0, vec: new Phaser.Math.Vector2()};

        // Add enemy to scene
        this.scene.add.existing(this);
    }

    update(time, delta){
        // move the t point along the path
        this.follower.t += this.enemySpeed * delta;
        // Get x and y given of t point
        this.path.getPoint(this.follower.t, this.follower.vec);

        // Check for rotation
        if (this.follower.vec.y > this.y && this.follower.vec.y !== this.y) this.angle = 0;
        if (this.follower.vec.x > this.x && this.follower.vec.x !== this.x) this.angle = -90;

        // Set the new position
        this.setPosition(this.follower.vec.x, this.follower.vec.y);

        // If we reached end of path
        if (this.follower.t >= 1){
            this.setActive(false);
            this.setVisible(false);
            
            this.scene.updateHealth(1);
        }
    }

    startOnPath(round){
        // Reset health
        this.hp = levelConfig.initial.enemyhealth + round * levelConfig.incremental.enemyhealth;
        // Reset Speed
        this.enemySpeed = levelConfig.initial.enemySpeed * levelConfig.incremental.enemySpeed * round;

        // Set t parameter to the start of path
        this.follower.t = 0;

        // Get x and y given of t point
        this.path.getPoint(this.follower.t, this.follower.vec);

        // Set the new position
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
    }

    recieveDamage(damage){
        this.hp -= damage;

        //hp check
        if (this.hp <= 0){
            this.setActive(false);
            this.setVisible(false);
            // TODO: Update Score
            this.scene.updateScore(10);
            this.scene.updateEnemies(-1);
        }
    }
}