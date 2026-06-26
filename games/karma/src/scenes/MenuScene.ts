import Phaser from 'phaser';
import { playClick } from '../../../../src/sfx';
import { ArcadeBar } from '@shared/arcade-bar';

export class MenuScene extends Phaser.Scene {
  private done = false;
  private arcadeBar!: ArcadeBar;

  constructor() { super('KarmaMenu'); }

  create(): void {
    this.done = false;
    this.arcadeBar = new ArcadeBar();
    this.events.once('shutdown', () => this.arcadeBar.destroy());
    const { width: W, height: H } = this.scale;
    const cx = W / 2;

    this.add.rectangle(cx, H / 2, W, H, 0x061510);
    this.add.ellipse(cx, H * 0.44, W * 0.95, H * 0.72, 0x0d2218, 0.55);
    this.add.ellipse(cx, H * 0.44, W * 0.65, H * 0.50, 0x122d1e, 0.35);

    // Title
    const title = this.add.text(cx, H * 0.28, 'KARMA', {
      fontFamily: 'Georgia, serif',
      fontSize: '90px',
      color: '#00e082',
      stroke: '#001a0d',
      strokeThickness: 9,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff99', blur: 40, fill: true },
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    const sub = this.add.text(cx, H * 0.28 + 72, 'Dutch Shithead Card Game', {
      fontFamily: 'Georgia, serif', fontSize: '21px', color: '#55997a',
    }).setOrigin(0.5).setAlpha(0);

    // Logo
    const logo = this.add.image(W - 16, H - 16, 'karma-splash-logo')
      .setOrigin(1, 1).setDisplaySize(100, 100).setAlpha(0);

    // Buttons
    const soloBtn   = this._makeBtn(cx, H * 0.50, 280, 64, '▶ Solo (vs AI)',   0x007a44);
    const local2Btn = this._makeBtn(cx, H * 0.60, 280, 56, '👥 Local 2P',       0x1a4a66);
    const local3Btn = this._makeBtn(cx, H * 0.69, 280, 56, '👥 Local 3P',       0x1a4a66);
    const local4Btn = this._makeBtn(cx, H * 0.78, 280, 56, '👥 Local 4P',       0x1a4a66);

    // Enter animations
    this.tweens.add({ targets: title,           alpha: 1, scale: 1, duration: 850, ease: 'Back.easeOut', delay: 100 });
    this.tweens.add({ targets: sub,             alpha: 1, duration: 600, delay: 700 });
    this.tweens.add({ targets: logo,            alpha: 0.65, duration: 700, delay: 300 });
    this.tweens.add({ targets: soloBtn.cont,   alpha: 1, duration: 500, ease: 'Back.easeOut', delay: 900 });
    this.tweens.add({ targets: local2Btn.cont, alpha: 1, duration: 500, ease: 'Back.easeOut', delay: 1050 });
    this.tweens.add({ targets: local3Btn.cont, alpha: 1, duration: 500, ease: 'Back.easeOut', delay: 1150 });
    this.tweens.add({ targets: local4Btn.cont, alpha: 1, duration: 500, ease: 'Back.easeOut', delay: 1250 });

    // Solo pulse
    this.tweens.add({
      targets: soloBtn.cont, scaleX: 1.03, scaleY: 1.03,
      yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut', delay: 1700,
    });

    soloBtn.bg.on('pointerdown',   () => this.startGame('solo'));
    local2Btn.bg.on('pointerdown', () => this.startGame('local-2p'));
    local3Btn.bg.on('pointerdown', () => this.startGame('local-3p'));
    local4Btn.bg.on('pointerdown', () => this.startGame('local-4p'));
  }

  private startGame(mode: string): void {
    if (this.done) return;
    this.done = true;
    playClick();
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('KarmaGame', { mode }));
  }

  private _makeBtn(x: number, y: number, bw: number, bh: number, label: string, color: number) {
    const cont = this.add.container(x, y).setAlpha(0).setDepth(10);
    const shadow = this.add.rectangle(3, 5, bw, bh, 0x000000, 0.4).setOrigin(0.5);
    const bg = this.add.rectangle(0, 0, bw, bh, color)
      .setStrokeStyle(2, 0x00cc77).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);
    cont.add([shadow, bg, text]);
    const hc = Math.min(color + 0x1a2a22, 0xffffff);
    bg.on('pointerover',  () => bg.setFillStyle(hc));
    bg.on('pointerout',   () => bg.setFillStyle(color));
    bg.on('pointerdown',  () => { this.tweens.add({ targets: cont, y: y + 3, duration: 60 }); });
    bg.on('pointerup',    () => { this.tweens.add({ targets: cont, y, duration: 60 }); });
    return { cont, bg };
  }
}
