import type { EventMap } from '../core/events/EventBus';
import type { Card } from './data/cards';

/** All gameplay events. UI subscribes; logic emits. */
export interface GameEvents extends EventMap {
  [key: string]: unknown;
  'log': { text: string };
  'state:changed': { from: string | null; to: string };
  'dice:rolled': { d1: number; d2: number; total: number };
  'player:moved': { playerId: number; from: number; to: number };
  'player:damaged': { playerId: number; amount: number };
  'player:healed': { playerId: number; amount: number };
  'player:died': { playerId: number };
  'card:drawn': { playerId: number; card: Card };
  'card:played': { playerId: number; card: Card };
  'turn:started': { playerId: number; round: number };
  'combat:started': { enemyName: string };
  'combat:round': { text: string };
  'combat:ended': { won: boolean };
  'hud:refresh': Record<string, never>;
  'game:over': { winnerId: number };
}
