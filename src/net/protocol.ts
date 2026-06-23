import type { HeroClass } from '../game/data/classes';
import type { Card } from '../game/data/cards';
import type { CombatState } from '../game/GameContext';

export interface RoomMember {
  peerId:  string;
  name:    string;
  isHost:  boolean;
  cls?:    HeroClass;
}

export type RoomEvent =
  | { type: 'class-pick:start' }
  | { type: 'game:start'; picks: { name: string; cls: HeroClass }[] }
  | { type: 'snapshot'; snap: GameSnap }
  | { type: 'action'; name: string; payload?: unknown };

export type EventTarget = 'all' | 'host' | 'guests';

export type ClientNetMsg =
  | { type: 'create_room'; game: string; name: string }
  | { type: 'join_room'; game: string; roomCode: string; name: string }
  | { type: 'leave_room' }
  | { type: 'member_update'; patch: Partial<Pick<RoomMember, 'name' | 'cls'>> }
  | { type: 'room_event'; target: EventTarget; event: RoomEvent };

export type ServerNetMsg =
  | { type: 'welcome'; clientId: string }
  | { type: 'room_created'; roomCode: string; members: RoomMember[] }
  | { type: 'room_joined'; roomCode: string; members: RoomMember[] }
  | { type: 'roster'; members: RoomMember[] }
  | { type: 'room_event'; from: string; event: RoomEvent }
  | { type: 'room_closed'; reason: string }
  | { type: 'error'; code: string; message: string };

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
