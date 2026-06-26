import Phaser from 'phaser';
import { musicManager } from '@src/music';
import { playSplash } from '@src/sfx';

const W = 1280, H = 720, CX = W / 2, CY = H / 2;

export class SplashScene extends Phaser.Scene {
  private done = false;

  constructor() { super('RFSplash'); }

  create(): void {
    this.done = false;

    this.add.rectangle(CX, CY, W, H, 0x0a1a0a);

    // Subtle felt layers
    this.add.ellipse(CX, CY, W * 0.95, H * 0.80, 0x0d2010, 0.45);
    this.add.ellipse(CX, CY, W * 0.62, H * 0.56, 0x122818, 0.35);

    // Grid overlay
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a3a1a, 0.14);
    for (let x = 0; x <= W; x += 80) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 60) grid.lineBetween(0, y, W, y);

    const title = this.add.text(CX, CY - 60, 'ROGUE FLUSH', {
      fontFamily: 'Georgia, serif',
      fontSize: '100px',
      color: '#ff3322',
      stroke: '#7a0000',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff2200', blur: 52, fill: true },
    }).setOrigin(0.5).setAlpha(0).setScale(0.55);

    const subtitle = this.add.text(CX, CY + 40, 'Poker Deckbuilder', {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#cc8866',
    }).setOrigin(0.5).setAlpha(0);

    const line = this.add.graphics().setAlpha(0);
    line.lineStyle(1, 0xcc2200, 0.5);
    line.lineBetween(CX - 260, CY + 78, CX + 260, CY + 78);

    const hint = this.add.text(CX, CY + 108, 'Tap to continue', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#664433',
    }).setOrigin(0.5).setAlpha(0);

    const logo = this.add.image(W - 28, H - 24, 'splash-logo')
      .setOrigin(1, 1).setDisplaySize(220, 220).setAlpha(0);

    this.tweens.add({ targets: title,    alpha: 1, scale: 1, duration: 880, ease: 'Back.easeOut', delay: 160 });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 580, delay: 720 });
    this.tweens.add({ targets: line,     alpha: 1, duration: 480, delay: 920 });
    this.tweens.add({ targets: logo,     alpha: 0.7, duration: 680, delay: 280 });
    this.tweens.add({
      targets: hint, alpha: 1, duration: 480, delay: 1300,
      onComplete: () => {
        this.tweens.add({ targets: hint, alpha: 0.28, yoyo: true, repeat: -1, duration: 830, ease: 'Sine.easeInOut' });
      },
    });

    this.time.delayedCall(3000, () => this.advance());
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
    this.cameras.main.fadeOut(480, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Menu'));
  }
}
