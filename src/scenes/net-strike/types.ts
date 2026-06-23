export type BattleState = 'BATTLE_INTRO' | 'REALTIME_COMBAT' | 'CUSTOM_SCREEN' | 'GAME_OVER' | 'VICTORY';
export type GridOwner = 'player' | 'enemy';
export type TileState = 'NORMAL' | 'FLASHING_WARNING' | 'STOLEN';
export type ChipId = 'cannon' | 'wide-sword' | 'area-grab';

export interface GridCoord {
  col: number;
  row: number;
}

export interface ChipDefinition {
  id: ChipId;
  name: string;
  damage: number;
  color: number;
  accent: number;
  description: string;
}
