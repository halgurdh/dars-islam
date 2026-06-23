import type { Card } from '../Card';

export interface KarmaRoomMember {
  peerId:   string;
  name:     string;
  isHost:   boolean;
}

// Actions sent by any player → host
export type KarmaAction =
  | { type: 'setup';  playerIndex: number; selectedIds: string[] }
  | { type: 'play';   playerIndex: number; cardIds: string[] }
  | { type: 'flip';   playerIndex: number; slotIndex: number }
  | { type: 'take';   playerIndex: number };

// Events sent over the Supabase channel
export type KarmaRoomEvent =
  | { type: 'game:start'; snap: KarmaSnap }
  | { type: 'snapshot';   snap: KarmaSnap }
  | { type: 'action';     action: KarmaAction };

// ─── Snapshot ─────────────────────────────────────────────────────────────────
// Contains full game state visible to every client.
// face-down card values are NEVER sent (only the count).

export interface KarmaSnapPlayer {
  id:            number;
  name:          string;
  hand:          Card[];          // all cards; clients show their own as faces, others as backs
  faceUp:        (Card | null)[]; // visible to everyone
  faceDownCount: number;          // how many face-down slots remain (hidden)
  hasFinished:   boolean;
}

export interface KarmaSnap {
  phase:         'setup' | 'play' | 'end';
  currentPlayer: number;
  deckCount:     number;
  pile:          Card[];
  under7:        boolean;
  players:       KarmaSnapPlayer[];
  lastMessage:   string;
  winner?:       number;
  shithead?:     number;
}
