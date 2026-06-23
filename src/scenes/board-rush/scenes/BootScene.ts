import Phaser from 'phaser';
import { assetManifest } from '../views/assets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Loading bar
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 400, 24, 0x222222);
    const bar = this.add.rectangle(width / 2 - 198, height / 2, 4, 18, 0xf2cc1a).setOrigin(0, 0.5);
    const label = this.add.text(width / 2, height / 2 - 40, 'Loading Board Rush…', {
      fontFamily: 'sans-serif', fontSize: '20px', color: '#f2cc1a',
    }).setOrigin(0.5);

    this.load.on('progress', (p: number) => {
      bar.width = 396 * p;
    });
    this.load.on('complete', () => {
      barBg.destroy(); bar.destroy(); label.destroy();
    });

    for (const { key, path } of assetManifest()) {
      this.load.image(key, path);
    }
    this.load.image('splash-logo', 'assets/splash.png');
    // Preload splash audio so it's available on the Splash scene
    this.load.audio('splash', 'assets/splash.mp3');
  }

  create(): void {
    this.scene.start('Splash');
  }
}
