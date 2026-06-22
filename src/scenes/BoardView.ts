import Phaser from 'phaser';
import { type BoardSquare, SQUARE_COLORS, SQUARE_ICONS } from '../game/data/board';

/**
 * Renders the board ring and exposes square-centre coordinates so tokens
 * can be placed. Pure view: it reads board data, never mutates state.
 */
export class BoardView {
  readonly centres: Phaser.Math.Vector2[] = [];
  private scene: Phaser.Scene;

  // Board occupies the left region of the 1280×800 canvas.
  private readonly left = 30;
  private readonly top = 60;
  private readonly right = 790;
  private readonly bottom = 750;
  private readonly sq = 72;

  constructor(scene: Phaser.Scene, board: BoardSquare[]) {
    this.scene = scene;
    this.computeCentres(board.length);
    this.draw(board);
  }

  private computeCentres(count: number): void {
    const perSide = count / 4;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    for (let i = 0; i < count; i++) {
      const side = Math.floor(i / perSide);
      const pos = i % perSide;
      const t = perSide === 1 ? 0 : pos / (perSide - 1);
      let x: number, y: number;
      switch (side) {
        case 0: // bottom, left→right
          x = lerp(this.left, this.right - this.sq, t) + this.sq / 2;
          y = this.bottom - this.sq / 2;
          break;
        case 1: // right, bottom→top
          x = this.right - this.sq / 2;
          y = lerp(this.bottom - this.sq, this.top, t) + this.sq / 2;
          break;
        case 2: // top, right→left
          x = lerp(this.right - this.sq, this.left, t) + this.sq / 2;
          y = this.top + this.sq / 2;
          break;
        default: // left, top→bottom
          x = this.left + this.sq / 2;
          y = lerp(this.top, this.bottom - this.sq, t) + this.sq / 2;
      }
      this.centres.push(new Phaser.Math.Vector2(x, y));
    }
  }

  private draw(board: BoardSquare[]): void {
    const g = this.scene.add.graphics();

    // Felt backdrop
    g.fillStyle(0x10160f, 1);
    g.fillRect(this.left - 6, this.top - 6, this.right - this.left + 12, this.bottom - this.top + 12);
    g.fillStyle(0x0a120a, 1);
    g.fillRect(this.left + this.sq + 4, this.top + this.sq + 4,
      this.right - this.left - this.sq * 2 - 8, this.bottom - this.top - this.sq * 2 - 8);

    // Centre title
    const cx = (this.left + this.right) / 2;
    const cy = (this.top + this.bottom) / 2;
    this.scene.add.text(cx, cy - 16, 'BOARD RUSH', {
      fontFamily: 'Georgia, serif', fontSize: '34px', color: '#f2cc1a', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.scene.add.text(cx, cy + 18, 'Board · Cards · Combat', {
      fontFamily: 'sans-serif', fontSize: '15px', color: '#8fbf6f',
    }).setOrigin(0.5);

    // Squares
    board.forEach((square, i) => {
      const c = this.centres[i];
      const color = SQUARE_COLORS[square.type];
      g.fillStyle(color, 1);
      g.fillRoundedRect(c.x - this.sq / 2, c.y - this.sq / 2, this.sq, this.sq, 6);
      g.lineStyle(1.5, 0x000000, 0.4);
      g.strokeRoundedRect(c.x - this.sq / 2, c.y - this.sq / 2, this.sq, this.sq, 6);

      this.scene.add.text(c.x, c.y - 6, SQUARE_ICONS[square.type], {
        fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5);
      this.scene.add.text(c.x, c.y + 14, square.label, {
        fontFamily: 'sans-serif', fontSize: '8px', color: '#ffffff',
        align: 'center', wordWrap: { width: this.sq - 6 },
      }).setOrigin(0.5);
      this.scene.add.text(c.x - this.sq / 2 + 4, c.y - this.sq / 2 + 3, `${i}`, {
        fontFamily: 'sans-serif', fontSize: '9px', color: 'rgba(255,255,255,0.5)',
      });
    });
  }
}
