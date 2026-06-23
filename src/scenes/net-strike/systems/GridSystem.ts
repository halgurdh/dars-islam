import Phaser from 'phaser';
import type { GridCoord, GridOwner, TileState } from '../types';

interface TileVisual {
  container: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Graphics;
  face: Phaser.GameObjects.Graphics;
  border: Phaser.GameObjects.Graphics;
  detail: Phaser.GameObjects.Graphics;
  glow: Phaser.GameObjects.Graphics;
  owner: GridOwner;
  state: TileState;
}

export class GridSystem {
  readonly rows = 3;
  readonly cols = 6;
  private readonly scene: Phaser.Scene;
  private readonly originX: number;
  private readonly originY: number;
  private readonly tileWidth: number;
  private readonly tileHeight: number;
  private readonly skew: number;
  private readonly tiles: TileVisual[] = [];
  private stolenColumn: number | null = null;

  constructor(scene: Phaser.Scene, originX: number, originY: number, tileWidth: number, tileHeight: number, skew: number) {
    this.scene = scene;
    this.originX = originX;
    this.originY = originY;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.skew = skew;
  }

  create(): void {
    for (let col = 0; col < this.cols; col += 1) {
      for (let row = 0; row < this.rows; row += 1) {
        const position = this.getTilePosition({ col, row });
        const owner: GridOwner = col < 3 ? 'player' : 'enemy';
        const shadow = this.scene.add.graphics();
        const face = this.scene.add.graphics();
        const border = this.scene.add.graphics();
        const detail = this.scene.add.graphics();
        const glow = this.scene.add.graphics();
        const container = this.scene.add.container(position.x, position.y, [shadow, glow, face, detail, border]);
        container.alpha = 0;
        container.y += 180;
        container.setDepth(100 + row * 10 + col);
        this.tiles.push({ container, shadow, face, border, detail, glow, owner, state: 'NORMAL' });
        this.redrawTile({ col, row });
      }
    }
  }

  playIntro(onComplete: () => void): void {
    const sorted = this.tiles.slice().sort((a, b) => a.container.x - b.container.x + (a.container.y - b.container.y) * 0.1);
    sorted.forEach((tile, index) => {
      this.scene.tweens.add({
        targets: tile.container,
        alpha: 1,
        y: tile.container.y - 180,
        duration: 420,
        delay: index * 35,
        ease: 'Cubic.easeOut',
      });
    });
    this.scene.time.delayedCall(900, onComplete);
  }

  getTilePosition(coord: GridCoord): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      this.originX + coord.col * this.tileWidth + coord.row * this.skew,
      this.originY + coord.row * this.tileHeight,
    );
  }

  getCharacterPosition(coord: GridCoord): Phaser.Math.Vector2 {
    const tile = this.getTilePosition(coord);
    return new Phaser.Math.Vector2(tile.x + this.tileWidth * 0.46, tile.y + this.tileHeight * 0.42);
  }

  canOccupy(owner: GridOwner, coord: GridCoord): boolean {
    if (coord.col < 0 || coord.col >= this.cols || coord.row < 0 || coord.row >= this.rows) {
      return false;
    }
    return this.getTileOwner(coord.col) === owner;
  }

  getTileOwner(col: number): GridOwner {
    if (this.stolenColumn !== null && col === this.stolenColumn) {
      return 'player';
    }
    return col < 3 ? 'player' : 'enemy';
  }

  getForwardColumn(owner: GridOwner, coord: GridCoord): number {
    return owner === 'player' ? coord.col + 1 : coord.col - 1;
  }

  getImpactColumn(owner: GridOwner, coord: GridCoord): number | null {
    const col = this.getForwardColumn(owner, coord);
    if (col < 0 || col >= this.cols) {
      return null;
    }
    return col;
  }

  getCenterLineY(row: number): number {
    return this.getCharacterPosition({ col: 0, row }).y;
  }

  getColumnX(col: number): number {
    return this.getCharacterPosition({ col, row: 1 }).x;
  }

  getRowTiles(row: number): GridCoord[] {
    return Array.from({ length: this.cols }, (_, col) => ({ col, row }));
  }

  getColumnTiles(col: number): GridCoord[] {
    return Array.from({ length: this.rows }, (_, row) => ({ col, row }));
  }

  stealEnemyColumn(): number | null {
    const target = this.stolenColumn ?? 3;
    if (this.getTileOwner(target) === 'player') {
      return null;
    }
    this.stolenColumn = target;
    this.refreshAllTiles();
    return target;
  }

  restoreStolenColumn(): void {
    if (this.stolenColumn === null) {
      return;
    }
    this.stolenColumn = null;
    this.refreshAllTiles();
  }

  flashWarning(coords: GridCoord[], duration = 600, onComplete?: () => void): void {
    coords.forEach((coord) => this.setTileState(coord, 'FLASHING_WARNING'));
    this.scene.time.delayedCall(duration, () => {
      coords.forEach((coord) => this.setTileState(coord, this.getTileOwner(coord.col) === 'player' && this.stolenColumn === coord.col ? 'STOLEN' : 'NORMAL'));
      onComplete?.();
    });
  }

  setTileState(coord: GridCoord, state: TileState): void {
    const tile = this.tiles[this.indexOf(coord)];
    tile.state = state;
    this.redrawTile(coord);
  }

  isSameCoord(a: GridCoord, b: GridCoord): boolean {
    return a.col === b.col && a.row === b.row;
  }

  private refreshAllTiles(): void {
    for (let col = 0; col < this.cols; col += 1) {
      for (let row = 0; row < this.rows; row += 1) {
        const isStolen = this.stolenColumn === col && col >= 3;
        this.setTileState({ col, row }, isStolen ? 'STOLEN' : 'NORMAL');
      }
    }
  }

  private indexOf(coord: GridCoord): number {
    return coord.col * this.rows + coord.row;
  }

  private redrawTile(coord: GridCoord): void {
    const tile = this.tiles[this.indexOf(coord)];
    const points = [
      0, 0,
      this.tileWidth, 0,
      this.tileWidth + this.skew, this.tileHeight,
      this.skew, this.tileHeight,
    ];
    const owner = this.getTileOwner(coord.col);
    const isWarning = tile.state === 'FLASHING_WARNING';
    const isStolen = tile.state === 'STOLEN' || (owner === 'player' && coord.col >= 3 && this.stolenColumn === coord.col);
    const fill = isWarning ? 0xa60d24 : owner === 'player' ? 0x0a77f7 : 0xd81f51;
    const border = isWarning ? 0xff6d8a : owner === 'player' ? 0x81daff : 0xff99b8;
    const glow = isStolen ? 0xf4c95d : border;

    tile.shadow.clear()
      .fillStyle(0x000000, 0.26)
      .fillPoints([
        new Phaser.Geom.Point(6, 16),
        new Phaser.Geom.Point(this.tileWidth + 6, 16),
        new Phaser.Geom.Point(this.tileWidth + this.skew + 6, this.tileHeight + 16),
        new Phaser.Geom.Point(this.skew + 6, this.tileHeight + 16),
      ], true);

    tile.glow.clear()
      .fillStyle(glow, isWarning ? 0.18 : 0.1)
      .fillPoints([
        new Phaser.Geom.Point(-8, -6),
        new Phaser.Geom.Point(this.tileWidth + 8, -6),
        new Phaser.Geom.Point(this.tileWidth + this.skew + 10, this.tileHeight + 8),
        new Phaser.Geom.Point(this.skew - 8, this.tileHeight + 8),
      ], true);

    tile.face.clear()
      .fillStyle(fill, isStolen ? 0.9 : 0.78)
      .fillPoints([
        new Phaser.Geom.Point(0, 0),
        new Phaser.Geom.Point(this.tileWidth, 0),
        new Phaser.Geom.Point(this.tileWidth + this.skew, this.tileHeight),
        new Phaser.Geom.Point(this.skew, this.tileHeight),
      ], true);

    tile.detail.clear().lineStyle(2, 0xffffff, 0.08);
    for (let i = 0; i < 3; i += 1) {
      const offset = 14 + i * 24;
      tile.detail.beginPath();
      tile.detail.moveTo(offset, 8);
      tile.detail.lineTo(offset + this.skew, this.tileHeight - 8);
      tile.detail.strokePath();
    }

    tile.border.clear()
      .lineStyle(isWarning ? 4 : 3, border, isWarning ? 1 : 0.95)
      .strokePoints([
        new Phaser.Geom.Point(...points.slice(0, 2)),
        new Phaser.Geom.Point(...points.slice(2, 4)),
        new Phaser.Geom.Point(...points.slice(4, 6)),
        new Phaser.Geom.Point(...points.slice(6, 8)),
      ], true, true);

    tile.owner = owner;
  }
}
