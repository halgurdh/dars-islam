import Phaser from 'phaser';
import { BootScene } from '../../../src/scenes/rogue-flush/scenes/BootScene';
import { MenuScene } from '../../../src/scenes/rogue-flush/scenes/MenuScene';
import { LobbyScene } from '../../../src/scenes/rogue-flush/scenes/LobbyScene';
import { PlayScene } from '../../../src/scenes/rogue-flush/scenes/PlayScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 720,
  height: 1280,
  backgroundColor: '#1a0505',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, LobbyScene, PlayScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
