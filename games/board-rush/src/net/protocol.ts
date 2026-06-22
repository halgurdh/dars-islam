import type { HeroClass } from '../game/data/classes';
import type { Card } from '../game/data/cards';
import type { CombatState } from '../game/GameContext';

export interface RoomMember {
  peerId:  string;
  name:    string;
  isHost:  boolean;
  cls?:    HeroClass;
}

export type NetMsg =
  | { type: 'hello';            name: string }
  | { type: 'roster';           members: RoomMember[] }
  | { type: 'class-pick:start' }
  | { type: 'class:picked';     cls: HeroClass }
  | { type: 'game:start' }
  | { type: 'snapshot';         snap: GameSnap }
  | { type: 'action';           name: string; payload?: unknown };

export interface SnapPlayer {
  name:                  string;
  cls:                   HeroClass;
  index:                 number;
  hp:                    number;
  maxHP:                 number;
  gold:                  number;
  attack:                number;
  defense:               number;
  magic:                 number;
  bonusAttack:           number;
  attackUpgrades:        number;
  defenseUpgrades:       number;
  cards:                 Card[];
  square:                number;
  skipNextTurn:          boolean;
  shield:                number;
  warriorBlockAvailable: boolean;
}

export interface GameSnap {
  phase:        string;
  round:        number;
  currentIndex: number;
  potGold:      number;
  winnerId:     number | null;
  combat:       CombatState | null;
  players:      SnapPlayer[];
  log:          string[];
}
