import Phaser from 'phaser';
import { playClick } from '../sfx';

export class SplashScene extends Phaser.Scene {
  constructor() {
    super('Splash');
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Dark background with a subtle vignette overlay
    this.add.rectangle(cx, cy, width, height, 0x080b08);
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.8, 0.8, 0, 0);
    vignette.fillRect(0, 0, width, height);

    // Background image (dimmed)
    const bg = this.add.image(cx, cy, 'background')
      .setDisplaySize(width, height)
      .setAlpha(0)
      .setTint(0x334433);

    // Subtitle
    const subtitle = this.add.text(cx, cy + 60, 'A Board Game Adventure', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#a8c8a8',
      alpha: 0,
    }).setOrigin(0.5).setAlpha(0);

    // Main title
    const title = this.add.text(cx, cy - 20, 'BOARD RUSH', {
      fontFamily: 'Georgia, serif',
      fontSize: '80px',
      color: '#f2cc1a',
      stroke: '#7a5c00',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 12, fill: true },
      alpha: 0,
    }).setOrigin(0.5).setAlpha(0).setScale(0.6);

    // Press any key hint
    const hint = this.add.text(cx, cy + 160, 'Press any key or click to start', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5).setAlpha(0);

    // Golden divider line
    const line = this.add.graphics().setAlpha(0);
    line.lineStyle(2, 0xf2cc1a, 0.6);
    line.lineBetween(cx - 220, cy + 100, cx + 220, cy + 100);

    // Animate sequence
    this.tweens.add({ targets: bg, alpha: 0.18, duration: 1200, ease: 'Sine.easeIn' });

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 900,
      ease: 'Back.easeOut',
      delay: 300,
    });

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 700,
      ease: 'Sine.easeIn',
      delay: 900,
    });

    this.tweens.add({
      targets: line,
      alpha: 1,
      duration: 600,
      delay: 1100,
    });

    this.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 600,
      delay: 1500,
      onComplete: () => {
        // Pulse the hint
        this.tweens.add({
          targets: hint,
          alpha: 0.3,
          yoyo: true,
          repeat: -1,
          duration: 900,
          ease: 'Sine.easeInOut',
        });
        this.enableInput();
      },
    });
  }

  private enableInput(): void {
    const advance = () => { playClick(); this.fadeToGame(); };

    this.input.keyboard?.once('keydown', advance);
    this.input.once('pointerdown', advance);
  }

  private fadeToGame(): void {
    // Prevent double-firing
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game');
    });
  }
}
