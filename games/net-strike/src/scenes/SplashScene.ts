import Phaser from 'phaser';
import { musicManager } from '../../../../src/music';
import { playSplash } from '../../../../src/sfx';

export class SplashScene extends Phaser.Scene {
  private done = false;

  constructor() {
    super('NetStrikeSplash');
  }

  create(): void {
    this.done = false;
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.add.rectangle(cx, cy, width, height, 0x07111f);

    // Subtle cyber grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a3a5c, 0.25);
    for (let x = 0; x <= width; x += 80) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 60) grid.lineBetween(0, y, width, y);

    // Ambient glow
    const glow = this.add.graphics();
    glow.fillStyle(0x2ca9ff, 0.04).fillCircle(cx, cy, 520);
    glow.fillStyle(0xff4a81, 0.03).fillCircle(cx * 0.25, cy * 1.6, 280);

    const title = this.add.text(cx, cy - 55, 'NET STRIKE', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '92px',
      fontStyle: 'bold',
      color: '#7ce8ff',
      stroke: '#07111f',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#2ca9ff', blur: 48, fill: true },
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    const subtitle = this.add.text(cx, cy + 36, 'Cyber Grid Combat', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '24px',
      color: '#8db7dd',
    }).setOrigin(0.5).setAlpha(0);

    const line = this.add.graphics().setAlpha(0);
    line.lineStyle(1, 0x2ca9ff, 0.5).lineBetween(cx - 220, cy + 76, cx + 220, cy + 76);

    const hint = this.add.text(cx, cy + 108, 'Press any key or click to start', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '17px',
      color: '#4a7a9b',
    }).setOrigin(0.5).setAlpha(0);

    const logo = this.add.image(width - 16, height - 16, 'ns-splash-logo')
      .setOrigin(1, 1).setDisplaySize(108, 108).setAlpha(0);

    this.tweens.add({ targets: title,    alpha: 1, scale: 1, duration: 900, ease: 'Back.easeOut', delay: 200 });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 600, delay: 700 });
    this.tweens.add({ targets: line,     alpha: 1, duration: 500, delay: 900 });
    this.tweens.add({ targets: logo,     alpha: 0.75, duration: 700, delay: 300 });
    this.tweens.add({
      targets: hint, alpha: 1, duration: 500, delay: 1400,
      onComplete: () => {
        this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 820, ease: 'Sine.easeInOut' });
      },
    });

    this.time.delayedCall(4000, () => this.advance());
    this.input.keyboard?.once('keydown', () => this.advance());
    this.input.once('pointerdown', () => this.advance());

    try {
      const hasSplash = !!(this.cache?.audio?.exists?.('splash'));
      if (this.sound && hasSplash) {
        this.sound.play('splash', { volume: 0.7 });
      } else {
        playSplash();
      }
    } catch {
      playSplash();
    }
  }

  private advance(): void {
    if (this.done) return;
    this.done = true;
    musicManager.init();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('BattleScene'));
  }
}
