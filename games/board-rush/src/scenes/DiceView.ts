import Phaser from 'phaser';

/** Animated 2-dice roll using the PNG dice assets. */
export class DiceView {
  private scene: Phaser.Scene;
  private d1: Phaser.GameObjects.Image;
  private d2: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.d1 = scene.add.image(x - 40, y, 'dieWhite1').setScale(0.85).setDepth(50).setVisible(false);
    this.d2 = scene.add.image(x + 40, y, 'dieRed1').setScale(0.85).setDepth(50).setVisible(false);
    this.label = scene.add.text(x, y + 48, '', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#f2cc1a', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(50);
  }

  roll(d1: number, d2: number): void {
    this.d1.setVisible(true);
    this.d2.setVisible(true);
    this.label.setText('');

    let flicks = 0;
    const timer = this.scene.time.addEvent({
      delay: 70,
      repeat: 7,
      callback: () => {
        flicks++;
        this.d1.setTexture(`dieWhite${Phaser.Math.Between(1, 6)}`);
        this.d2.setTexture(`dieRed${Phaser.Math.Between(1, 6)}`);
        if (timer.getRepeatCount() === 0) {
          this.d1.setTexture(`dieWhite${d1}`);
          this.d2.setTexture(`dieRed${d2}`);
          this.label.setText(`= ${d1 + d2}`);
          this.scene.time.delayedCall(1600, () => {
            this.d1.setVisible(false);
            this.d2.setVisible(false);
            this.label.setText('');
          });
        }
      },
    });
  }
}
