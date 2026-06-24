export type BattleState = 'BATTLE_INTRO' | 'REALTIME_COMBAT' | 'CUSTOM_MENU' | 'GAME_OVER' | 'VICTORY';
export type GridOwner = 'player' | 'enemy';
export type TileState = 'NORMAL' | 'FLASHING_WARNING' | 'STOLEN' | 'CRACKED' | 'BROKEN' | 'HIDDEN';
export type ChipId = 'cannon' | 'wide-sword' | 'area-grab' | 'recovery';
export type ChipCode = 'A' | 'B' | 'C' | '*';
export type ChipIconShape = 'circle' | 'diamond' | 'triangle' | 'square';

export interface GridCoord {
  col: number;
  row: number;
}

export interface ChipDefinition {
  id: ChipId;
  name: string;
  damage: number;
  effectValue: number;
  effectLabel: string;
  color: number;
  accent: number;
  code: ChipCode;
  allowedCodes: ChipCode[];
  iconShape: ChipIconShape;
  description: string;
}

export interface CustomMenuHost {
  getCustomHand(): ChipDefinition[];
  loadChips(selectedChips: ChipDefinition[]): void;
  exitCustomMenu(confirmed: boolean): void;
}
