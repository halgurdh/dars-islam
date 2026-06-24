import Phaser from 'phaser';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.add.rectangle(cx, cy, width, height, 0x04070d, 0.96);

    const glow = this.add.graphics();
    glow.fillStyle(0x8affc1, 0.08).fillCircle(cx, cy - 30, 280);
    glow.fillStyle(0xff6f9b, 0.06).fillCircle(cx, cy + 90, 190);

    const title = this.add.text(cx, cy - 76, 'CORE DESTROYED', {
      fontFamily: 'Segoe UI',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#f7fbff',
      stroke: '#07111f',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setScale(0.82);

    const subtitle = this.add.text(cx, cy + 8, 'The final boss has collapsed into static.', {
      fontFamily: 'Segoe UI',
      fontSize: '26px',
      color: '#b5dff4',
    }).setOrigin(0.5).setAlpha(0);

    const hint = this.add.text(cx, cy + 108, 'Press ENTER or click to return to the grid.', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#8ac8e8',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 700, ease: 'Back.easeOut' });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 420, delay: 260 });
    this.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 420,
      delay: 520,
      onComplete: () => {
        this.tweens.add({ targets: hint, alpha: 0.35, duration: 760, yoyo: true, repeat: -1 });
      },
    });

    const exit = () => this.scene.start('WorldExplorationScene');
    this.input.keyboard?.once('keydown-ENTER', exit);
    this.input.once('pointerdown', exit);
  }
}
