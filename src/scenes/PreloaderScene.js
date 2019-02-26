import 'phaser';

export default class PreloaderScene extends Phaser.Scene {
    constructor (){
        super('Preloader');
    }

    init(){
        this.readyCount = 0;
    }

    preload(){
        //time event
        this.timedEvent = this.time.delayedCall(2000, this.ready, [], this);
        this.createPreholder();
        this.loadAssets();
    }

    createPreholder(){
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;

        // add logo image
        this.add.image(width / 2, height / 2 - 100, 'logo');

        // display progress bar
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        // Loading Text
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // Percent Text
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Loading Assets Text
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '...',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        // Update Progress Bar
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBox.fillStyle(0xffffff, 1);
            progressBox.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        });

        // Update file asset text
        this.load.on('fileprogress', function(file){
            assetText.setText('Loading Asset: ' + file.key);
        });

        // remove progress bar on complete
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            assetText.destroy();
            loadingText.destroy();
            percentText.destroy();
            this.ready();
        }.bind(this));

    }

    loadAssets(){
        //Load assets needed in game
        this.load.image('bullet', '/assets/level/bulletDark2_outline.png');
        this.load.image('tower', '/assets/level/tank_bigRed.png');
        this.load.image('enemy', '/assets/level/tank_sand.png');
        this.load.image('base', '/assets/level/tankBody_darkLarge_outline.png');
        this.load.image('title', '/assets/ui/title.png');
        this.load.image('cursor', '/assets/ui/cursor.png');
        this.load.image('button1', '/assets/ui/blue_button02.png');
        this.load.image('button2', '/assets/ui/blue_button03.png');

        // Tilemap
        this.load.tilemapTiledJSON('level1', '/assets/level/level1.json');
        this.load.spritesheet('terrainTiles_default', '/assets/level/terrainTiles_default.png', {frameWidth: 64, frameHeight: 64});

    }

    ready(){
        this.readyCount++;
        if (this.readyCount === 2){
            this.scene.start('Title');
        }
    }

}