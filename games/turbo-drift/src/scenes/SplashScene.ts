import Phaser from 'phaser';
import { turboMusic } from '../systems/MusicStateMachine';

export class SplashScene extends Phaser.Scene {
  private done = false;

  constructor() {
    super('Splash');
  }

  create(): void {
    console.info('[Turbo Drift][Splash] create');
    this.done = false;
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.add.rectangle(cx, cy, width, height, 0x07080f);

    const road = this.add.graphics();
    road.fillStyle(0x161a25, 1);
    road.beginPath();
    road.moveTo(cx - 520, height);
    road.lineTo(cx - 130, cy + 72);
    road.lineTo(cx + 130, cy + 72);
    road.lineTo(cx + 520, height);
    road.closePath();
    road.fillPath();

    road.lineStyle(4, 0xffe066, 0.7);
    for (let i = 0; i < 7; i += 1) {
      const y = cy + 118 + i * 82;
      const scale = 1 + i * 0.22;
      road.lineBetween(cx - 18 * scale, y, cx + 18 * scale, y + 34 * scale);
    }

    const title = this.add.text(cx, cy - 74, 'TURBO DRIFT', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '92px',
      fontStyle: 'bold',
      color: '#ff6b35',
      stroke: '#07080f',
      strokeThickness: 9,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff00ff', blur: 34, fill: true },
    }).setOrigin(0.5).setAlpha(0).setScale(0.6);

    const subtitle = this.add.text(cx, cy + 18, 'Low-poly neon garage racing', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '25px',
      color: '#d7f9ff',
      stroke: '#07080f',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    const car = this.add.graphics({ x: cx, y: cy + 112 });
    car.fillStyle(0xff6b35, 1).fillRoundedRect(-82, -24, 164, 48, 8);
    car.fillStyle(0x8a351f, 1).fillRoundedRect(-42, -50, 86, 35, 8);
    car.fillStyle(0x101219, 1).fillCircle(-56, 28, 22).fillCircle(56, 28, 22);
    car.fillStyle(0xff00ff, 1).fillRect(-66, 14, 132, 5);
    car.setAlpha(0);

    const hint = this.add.text(cx, cy + 190, 'Click or press any key', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#7f8ea3',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 900, ease: 'Back.easeOut' });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 500, delay: 500 });
    this.tweens.add({ targets: car, alpha: 1, x: cx + 34, duration: 700, delay: 850, ease: 'Cubic.easeOut' });
    this.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 400,
      delay: 1300,
      onComplete: () => {
        this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 760 });
      },
    });

    this.time.delayedCall(4000, () => this.advance(false));
    this.input.keyboard?.once('keydown', () => this.advance(true));
    this.input.once('pointerdown', () => this.advance(true));
  }

  private advance(userInitiated: boolean): void {
    if (this.done) {
      return;
    }
    this.done = true;
    console.info('[Turbo Drift][Splash] advance', { userInitiated });
    if (userInitiated) {
      if (this.cache.audio.exists('splash')) {
        this.sound.play('splash', { volume: 0.65 });
      }
      void turboMusic.init();
    }
    turboMusic.transitionTo('garage');
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Garage'));
  }
}
