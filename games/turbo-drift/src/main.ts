import Phaser from 'phaser';
import { enable3d } from '@enable3d/phaser-extension';
import { BootScene } from './scenes/BootScene';
import { SplashScene } from './scenes/SplashScene';
import { GarageScene } from './scenes/GarageScene';
import { RaceScene } from './scenes/RaceScene';
import { WORLD } from './constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'game',
  width: WORLD.width,
  height: WORLD.height,
  backgroundColor: '#07080f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, SplashScene, GarageScene, RaceScene],
};

const physicsBasePath = `${import.meta.env.BASE_URL}lib`.replace(/\/$/, '');

enable3d(() => new Phaser.Game(config)).withPhysics(physicsBasePath);
