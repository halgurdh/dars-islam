import Phaser from 'phaser';
import { BootScene }   from './scenes/BootScene';
import { SplashScene } from './scenes/SplashScene';
import { MenuScene }   from './scenes/MenuScene';
import { GameScene }   from './scenes/GameScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0a1a10',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'app',
  },
  input: {
    activePointers: 3,
  },
  scene: [BootScene, SplashScene, MenuScene, GameScene],
});
