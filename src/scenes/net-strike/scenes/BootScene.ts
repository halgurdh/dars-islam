import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('NetStrikeBoot');
  }

  create(): void {
    this.makeDotTexture('net-strike-dot', 8, 0xffffff);
    this.makeOrbTexture('net-strike-bullet', 18, 0xffe066);
    this.makeOrbTexture('net-strike-cannon', 28, 0xffb347);
    this.scene.start('NetStrikeBattle');
  }

  private makeDotTexture(key: string, size: number, color: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1).fillCircle(size / 2, size / 2, size / 2);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  private makeOrbTexture(key: string, size: number, color: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1).fillCircle(size / 2, size / 2, size / 2);
    graphics.lineStyle(2, 0xffffff, 0.8).strokeCircle(size / 2, size / 2, size / 2 - 2);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }
}
