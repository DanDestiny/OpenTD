import 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor (){
        super({key: 'UI', active: true});
    }

    init(){
        // Grab ref to Game scene
        this.gameScene = this.scene.get('Game');
    }

    create(){
        this.setupUIElements();
        this.setupEvents();
    }


    setupUIElements(){
        this.scoreText = this.add.text( 5, 5, 'Score: 0', { fontSize: '16px', fill: '#000'});
        this.healthText = this.add.text( 10, 490, 'BaseHealth: 0', { fontSize: '16px', fill: '#000'});
        this.turretsText = this.add.text( 440, 5, 'Available Turrets: 0', { fontSize: '16px', fill: '#000'});
        this.roundTimeText = this.add.text( 180, 5, 'Round Starts In: 10', { fontSize: '16px', fill: '#000'});
        this.enemiesText = this.add.text( 10, 470, 'Enemies Left: 0', { fontSize: '16px', fill: '#000'});
        this.roundText = this.add.text( 0, 0, 'Round: 0', { fontSize: '32px', fill: '#000'});
        
        // Center round text
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        Phaser.Display.Align.In.Center(
            this.roundText,
            this.add.zone(width / 2, height / 2, width, height)
        );
        
        this.hideUIElements(); 
    }

    hideUIElements(){
        this.scoreText.alpha = 0;
        this.healthText.alpha = 0;
        this.turretsText.alpha = 0;
        this.roundTimeText.alpha = 0;
        this.roundText.alpha = 0;
        this.enemiesText.alpha = 0;
    }

    setupEvents(){
        this.gameScene.events.on('displayUI', function (){
            this.scoreText.alpha = 1;
            this.healthText.alpha = 1;
            this.turretsText.alpha = 1;
            this.enemiesText.alpha = 1;
        }.bind(this));

        this.gameScene.events.on('updateScore', function (score){
            this.scoreText.setText('Score: ' + score);
        }.bind(this));

        this.gameScene.events.on('updateHealth', function (health){
            this.healthText.setText('BaseHealth: ' + health);
        }.bind(this));

        this.gameScene.events.on('updateTurrets', function (turrets){
            this.turretsText.setText('Available Turrets: ' + turrets);
        }.bind(this));

        this.gameScene.events.on('hideUI', function (){
            this.hideUIElements();
        }.bind(this));

        this.gameScene.events.on('updateEnemies', function (enemies){
            this.enemiesText.setText('Enemies Left: ' + enemies);
        }.bind(this));

        this.gameScene.events.on('startRound', function (round){
            this.roundText.setText('Round: ' + round);
            this.roundText.alpha = 1;

            // fade level text
            this.add.tween({
                targets: this.roundText,
                ease: 'Sine.easeInOut',
                duration: 1000,
                delay: 2000,
                alpha: {
                    getStart: function () { return 1; },
                    getEnd: function () { return 0; },
                },
                onComplete: function (){
                    this.roundTimeText.setText('Round Start In: 10');
                    this.roundTimeText.alpha = 1;
                    var timedEvent = this.time.addEvent({
                        delay: 1000,
                        callbackScope: this,
                        repeat: 9,
                        callback: function () {
                            this.roundTimeText.setText('Round Starts In: ' + timedEvent.repeatCount);
                            if (timedEvent.repeatCount === 0){
                                this.events.emit('roundReady');
                                this.roundTimeText.alpha = 0;
                            }
                        }
                    });
                }.bind(this)
            })
        }.bind(this));
    }
}