import Phaser from 'phaser';
import { Entity } from '@src/core/ecs/Entity';
import { Access } from '@src/game/systems/PlayerFactory';
import { CLASS_DEFS } from '@src/game/data/classes';

/** Renders and animates player tokens on the board. */
export class TokenView {
  private scene: Phaser.Scene;
  private centres: Phaser.Math.Vector2[];
  private sprites = new Map<number, Phaser.GameObjects.Image>();

  // Offsets so co-located tokens don't fully overlap.
  private static offsets = [
    new Phaser.Math.Vector2(-14, -14),
    new Phaser.Math.Vector2(14, -14),
    new Phaser.Math.Vector2(-14, 14),
    new Phaser.Math.Vector2(14, 14),
  ];

  constructor(scene: Phaser.Scene, centres: Phaser.Math.Vector2[]) {
    this.scene = scene;
    this.centres = centres;
  }

  spawn(players: Entity[]): void {
    players.forEach((p) => {
      const id = Access.id(p);
      const def = CLASS_DEFS[id.cls];
      const off = TokenView.offsets[id.index] ?? new Phaser.Math.Vector2(0, 0);
      const c = this.centres[Access.pos(p).square].clone().add(off);
      const img = this.scene.add.image(c.x, c.y, def.pieceSprite).setScale(0.6).setDepth(10);
      this.sprites.set(id.index, img);
    });
  }

  moveTo(playerIndex: number, square: number): void {
    const img = this.sprites.get(playerIndex);
    if (!img) return;
    const off = TokenView.offsets[playerIndex] ?? new Phaser.Math.Vector2(0, 0);
    const c = this.centres[square].clone().add(off);
    this.scene.tweens.add({
      targets: img,
      x: c.x,
      y: c.y,
      duration: 380,
      ease: 'Back.Out',
    });
  }

  clear(): void {
    this.sprites.forEach((s) => s.destroy());
    this.sprites.clear();
  }
}
