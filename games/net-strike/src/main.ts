import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { SplashScene } from './scenes/SplashScene';
import { BattleScene } from './scenes/BattleScene';
import { CustomMenuScene } from './scenes/CustomMenuScene';
import { WorldExplorationScene } from './scenes/WorldExplorationScene';
import { FinalBossBattleScene } from './scenes/FinalBossBattleScene';
import { VictoryScene } from './scenes/VictoryScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#07111f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, SplashScene, WorldExplorationScene, BattleScene, FinalBossBattleScene, CustomMenuScene, VictoryScene],
};

new Phaser.Game(config);
