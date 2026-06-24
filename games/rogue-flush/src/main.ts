import Phaser from 'phaser';
import { BootScene }   from './scenes/BootScene';
import { SplashScene } from './scenes/SplashScene';
import { MenuScene }   from './scenes/MenuScene';
import { LobbyScene }  from './scenes/LobbyScene';
import { PlayScene }   from './scenes/PlayScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#1a0505',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, SplashScene, MenuScene, LobbyScene, PlayScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
