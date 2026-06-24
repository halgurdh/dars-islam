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
  private readonly hiddenOwners = new Set<GridOwner>();

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
    if (this.getTileOwner(coord.col) !== owner) {
      return false;
    }
    return this.getTileState(coord) !== 'BROKEN';
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

  getPlayerTiles(): GridCoord[] {
    return Array.from({ length: 3 * this.rows }, (_, index) => ({
      col: Math.floor(index / this.rows),
      row: index % this.rows,
    }));
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
    const previousStates = new Map<string, TileState>();
    coords.forEach((coord) => {
      previousStates.set(`${coord.col},${coord.row}`, this.getTileState(coord));
    });
    coords.forEach((coord) => this.setTileState(coord, 'FLASHING_WARNING'));
    this.scene.time.delayedCall(duration, () => {
      coords.forEach((coord) => {
        if (this.getTileState(coord) === 'FLASHING_WARNING') {
          const previous = previousStates.get(`${coord.col},${coord.row}`);
          this.setTileState(coord, previous && previous !== 'FLASHING_WARNING' ? previous : this.getResetState(coord));
        }
      });
      onComplete?.();
    });
  }

  setTileState(coord: GridCoord, state: TileState): void {
    const tile = this.tiles[this.indexOf(coord)];
    tile.state = state;
    this.redrawTile(coord);
  }

  getTileState(coord: GridCoord): TileState {
    return this.tiles[this.indexOf(coord)].state;
  }

  isTileBroken(coord: GridCoord): boolean {
    return this.getTileState(coord) === 'BROKEN';
  }

  setOwnerVisibility(owner: GridOwner, visible: boolean): void {
    if (visible) {
      this.hiddenOwners.delete(owner);
    } else {
      this.hiddenOwners.add(owner);
    }
    this.refreshAllTiles();
  }

  isSameCoord(a: GridCoord, b: GridCoord): boolean {
    return a.col === b.col && a.row === b.row;
  }

  private refreshAllTiles(): void {
    for (let col = 0; col < this.cols; col += 1) {
      for (let row = 0; row < this.rows; row += 1) {
        const isStolen = this.stolenColumn === col && col >= 3;
        const coord = { col, row };
        const current = this.getTileState(coord);
        if (current === 'BROKEN' || current === 'CRACKED') {
          this.redrawTile(coord);
          continue;
        }
        this.setTileState(coord, isStolen ? 'STOLEN' : this.getResetState(coord));
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
    const isCracked = tile.state === 'CRACKED';
    const isBroken = tile.state === 'BROKEN';
    const isHidden = tile.state === 'HIDDEN' || this.hiddenOwners.has(owner);
    const fill = isHidden
      ? 0x07111f
      : isBroken
        ? 0x02050a
        : isWarning
          ? 0xa60d24
          : isCracked
            ? 0x6a4b15
            : owner === 'player' ? 0x0a77f7 : 0xd81f51;
    const border = isHidden
      ? 0x0b1a2c
      : isBroken
        ? 0x355269
        : isWarning
          ? 0xff6d8a
          : isCracked
            ? 0xffd16e
            : owner === 'player' ? 0x81daff : 0xff99b8;
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
      .fillStyle(glow, isHidden ? 0.04 : isWarning ? 0.18 : isBroken ? 0.08 : 0.1)
      .fillPoints([
        new Phaser.Geom.Point(-8, -6),
        new Phaser.Geom.Point(this.tileWidth + 8, -6),
        new Phaser.Geom.Point(this.tileWidth + this.skew + 10, this.tileHeight + 8),
        new Phaser.Geom.Point(this.skew - 8, this.tileHeight + 8),
      ], true);

    tile.face.clear()
      .fillStyle(fill, isHidden ? 0.16 : isBroken ? 0.52 : isStolen ? 0.9 : 0.78)
      .fillPoints([
        new Phaser.Geom.Point(0, 0),
        new Phaser.Geom.Point(this.tileWidth, 0),
        new Phaser.Geom.Point(this.tileWidth + this.skew, this.tileHeight),
        new Phaser.Geom.Point(this.skew, this.tileHeight),
      ], true);

    tile.detail.clear().lineStyle(2, 0xffffff, isHidden ? 0.02 : 0.08);
    if (isBroken) {
      tile.detail.fillStyle(0x0f2238, 0.55).fillEllipse(this.tileWidth * 0.54, this.tileHeight * 0.56, this.tileWidth * 0.62, this.tileHeight * 0.42);
    } else {
      for (let i = 0; i < 3; i += 1) {
        const offset = 14 + i * 24;
        tile.detail.beginPath();
        tile.detail.moveTo(offset, 8);
        tile.detail.lineTo(offset + this.skew, this.tileHeight - 8);
        tile.detail.strokePath();
      }
      if (isCracked) {
        tile.detail.lineStyle(3, 0xfff1b3, 0.6);
        tile.detail.beginPath();
        tile.detail.moveTo(22, 14);
        tile.detail.lineTo(52, 34);
        tile.detail.lineTo(38, 56);
        tile.detail.lineTo(76, 80);
        tile.detail.strokePath();
      }
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

  private getResetState(coord: GridCoord): TileState {
    const owner = this.getTileOwner(coord.col);
    if (this.hiddenOwners.has(owner)) {
      return 'HIDDEN';
    }
    if (owner === 'player' && this.stolenColumn === coord.col) {
      return 'STOLEN';
    }
    return 'NORMAL';
  }
}
