export interface RFMember {
  peerId: string;
  name: string;
  isHost: boolean;
  score?: number;
  ante?: number;
  blind?: number;
  status?: 'lobby' | 'playing' | 'waiting' | 'lost';
}

export type RFEvent =
  | { type: 'game:start' }
  | { type: 'player:blind-result'; peerId: string; won: boolean; score: number; ante: number; blind: number }
  | { type: 'host:next-blind'; ante: number; blind: number }
  | { type: 'host:game-over' };
