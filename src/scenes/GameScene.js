import 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor (){
        super('Game');
    }

    preload(){
        this.load.image('logo', 'assets/logo.png');
    }

    create(){
        var logo = this.add.image(400, 150, 'logo');
    }

}