import { Card, Rank, cardLabel } from './Card';
import { createDeck } from './Deck';
import { canPlay, isQuartet, isTransparent, getValidGroups } from './Rules';

export enum GamePhase {
  Setup = 'setup',
  Play  = 'play',
  End   = 'end',
}

export type GameSource = 'hand' | 'faceup' | 'facedown' | 'done';

export interface PlayerState {
  id:           number;
  name:         string;
  isHuman:      boolean;
  hand:         Card[];
  faceUp:       (Card | null)[];   // 3 slots
  faceDown:     (Card | null)[];   // 3 slots (hidden)
  hasFinished:  boolean;
  isShithead:   boolean;
}

export interface PlayResult {
  type:            'played' | 'burned' | 'quartet' | 'took_pile' | 'cant_flip';
  cards:           Card[];
  playerId:        number;
  nextPlayerId:    number;
  message:         string;
  burnedPile:      boolean;
  drewCount:       number;
  skippedIds:      number[];
  under7After:     boolean;
  playerFinished:  boolean;
  gameOver:        boolean;
  winner?:         number;
  shithead?:       number;
}

export class KarmaGame {
  players:       PlayerState[];
  deck:          Card[];
  pile:          Card[];
  burned:        Card[];
  phase:         GamePhase;
  currentPlayer: number;
  under7:        boolean;
  setupsDone:    Set<number>;

  /** humanIds: which player indices are human (default: [0] = solo). */
  constructor(playerCount: number, humanIds: number[] = [0]) {
    const names = ['You', 'Dealer', 'North', 'East'];
    this.players = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: names[i] ?? `Player ${i + 1}`,
      isHuman: humanIds.includes(i),
      hand: [],
      faceUp: [null, null, null],
      faceDown: [null, null, null],
      hasFinished: false,
      isShithead: false,
    }));
    this.deck = createDeck(true);
    this.pile = [];
    this.burned = [];
    this.phase = GamePhase.Setup;
    this.currentPlayer = 0;
    this.under7 = false;

    this.setupsDone = new Set();

    this._deal();
  }

  // ─── Names ─────────────────────────────────────────────────────────────────

  setPlayerName(id: number, name: string) {
    if (this.players[id]) this.players[id].name = name;
  }

  // ─── Deal ──────────────────────────────────────────────────────────────────

  private _deal() {
    for (const p of this.players) {
      for (let i = 0; i < 3; i++) p.faceDown[i] = this.deck.pop()!;
    }
    for (const p of this.players) {
      for (let i = 0; i < 6; i++) p.hand.push(this.deck.pop()!);
    }
  }

  // ─── Setup ─────────────────────────────────────────────────────────────────

  /** Any human player selects 3 cards from their 6-card setup hand. */
  playerSetup(playerId: number, selectedIds: string[]): boolean {
    const p = this.players[playerId];
    if (!p || this.setupsDone.has(playerId)) return false;
    const selected = p.hand.filter(c => selectedIds.includes(c.id));
    if (selected.length !== 3) return false;
    for (let i = 0; i < 3; i++) p.faceUp[i] = selected[i];
    p.hand = p.hand.filter(c => !selectedIds.includes(c.id));
    this.setupsDone.add(playerId);
    return true;
  }

  /** Convenience alias for solo mode (player 0). */
  humanSetup(selectedIds: string[]): boolean {
    return this.playerSetup(0, selectedIds);
  }

  allSetupsReady(): boolean {
    return this.players.every(p => this.setupsDone.has(p.id));
  }

  private _aiSetup(playerId: number) {
    const p = this.players[playerId];
    const sorted = [...p.hand].sort((a, b) => a.rank - b.rank);
    const mid  = sorted.filter(c => c.rank >= Rank.Four && c.rank <= Rank.Nine);
    const rest = sorted.filter(c => c.rank < Rank.Four  || c.rank > Rank.Nine);
    const pick = [...mid, ...rest].slice(0, 3);
    const pickIds = pick.map(c => c.id);
    for (let i = 0; i < 3; i++) p.faceUp[i] = pick[i];
    p.hand = p.hand.filter(c => !pickIds.includes(c.id));
    this.setupsDone.add(playerId);
  }

  startGame() {
    // Auto-setup any AI players that haven't set up yet
    for (const p of this.players) {
      if (!p.isHuman && !this.setupsDone.has(p.id)) this._aiSetup(p.id);
    }

    this.phase = GamePhase.Play;

    const first = this.deck.pop()!;
    this.pile.push(first);
    if (first.rank === Rank.Ten) { this.burned.push(...this.pile); this.pile = []; }
    if (first.rank === Rank.Seven) this.under7 = true;

    this.currentPlayer = 0;
  }

  // ─── Queries ───────────────────────────────────────────────────────────────

  getSource(playerId: number): GameSource {
    const p = this.players[playerId];
    if (p.hasFinished) return 'done';
    if (p.hand.length > 0) return 'hand';
    if (p.faceUp.some(c => c !== null)) return 'faceup';
    if (p.faceDown.some(c => c !== null)) return 'facedown';
    return 'done';
  }

  totalCards(playerId: number): number {
    const p = this.players[playerId];
    return p.hand.length +
      p.faceUp.filter(c => c !== null).length +
      p.faceDown.filter(c => c !== null).length;
  }

  hasValidPlay(playerId: number): boolean {
    const source = this.getSource(playerId);
    if (source === 'done') return false;
    if (source === 'facedown') return true;
    const p = this.players[playerId];
    const hand = source === 'hand'
      ? p.hand
      : p.faceUp.filter((c): c is Card => c !== null);
    return getValidGroups(hand, this.pile, this.under7).length > 0;
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  playCards(cardIds: string[]): PlayResult {
    const p = this.players[this.currentPlayer];
    const source = this.getSource(this.currentPlayer);

    if (source === 'hand') {
      const cards = p.hand.filter(c => cardIds.includes(c.id));
      if (cards.length === 0 || !canPlay(cards, this.pile, this.under7)) return this._takePile();
      p.hand = p.hand.filter(c => !cardIds.includes(c.id));
      return this._resolve(p, cards, source);
    }

    if (source === 'faceup') {
      const card = p.faceUp.find(c => c && cardIds.includes(c.id));
      if (!card || !canPlay([card], this.pile, this.under7)) return this._takePile();
      p.faceUp[p.faceUp.indexOf(card)] = null;
      return this._resolve(p, [card], source);
    }

    return this._takePile();
  }

  flipFaceDown(slotIndex: number): PlayResult {
    const p = this.players[this.currentPlayer];
    const card = p.faceDown[slotIndex];
    if (!card) return this._takePile();
    p.faceDown[slotIndex] = null;

    if (!canPlay([card], this.pile, this.under7)) {
      p.hand.push(...this.pile, card);
      this.pile = [];
      this.under7 = false;
      const next = this._nextPlayer(this.currentPlayer);
      this.currentPlayer = next;
      return {
        type: 'cant_flip', cards: [card], playerId: p.id, nextPlayerId: next,
        message: `${p.name} flips ${cardLabel(card)} — can't play it and must take the pile! 😬`,
        burnedPile: false, drewCount: 0, skippedIds: [],
        under7After: false, playerFinished: false, gameOver: false,
      };
    }
    return this._resolve(p, [card], 'facedown');
  }

  takePile(): PlayResult { return this._takePile(); }

  // ─── Internals ─────────────────────────────────────────────────────────────

  private _takePile(): PlayResult {
    const p = this.players[this.currentPlayer];
    p.hand.push(...this.pile);
    this.pile = [];
    this.under7 = false;
    const next = this._nextPlayer(this.currentPlayer);
    this.currentPlayer = next;
    return {
      type: 'took_pile', cards: [], playerId: p.id, nextPlayerId: next,
      message: `${p.name} can't play and takes the pile!`,
      burnedPile: false, drewCount: 0, skippedIds: [],
      under7After: false, playerFinished: false, gameOver: false,
    };
  }

  private _resolve(p: PlayerState, cards: Card[], source: GameSource): PlayResult {
    const rank = cards[0].rank;
    this.pile.push(...cards);

    let drewCount = 0;
    if (source === 'hand') {
      while (p.hand.length < 3 && this.deck.length > 0) {
        p.hand.push(this.deck.pop()!);
        drewCount++;
      }
    }

    const isEmpty = p.hand.length === 0 &&
      p.faceUp.every(c => c === null) && p.faceDown.every(c => c === null);
    if (isEmpty) p.hasFinished = true;

    const active = this.players.filter(pl => !pl.hasFinished);
    if (active.length <= 1) {
      const shithead = active[0];
      if (shithead) shithead.isShithead = true;
      this.phase = GamePhase.End;
      return {
        type: 'played', cards, playerId: p.id, nextPlayerId: p.id,
        message: `${p.name} wins! 🎉${shithead ? `  ${shithead.name} is the Karma! 💀` : ''}`,
        burnedPile: false, drewCount, skippedIds: [], under7After: false,
        playerFinished: true, gameOver: true,
        winner: p.id, shithead: shithead?.id,
      };
    }

    if (rank === Rank.Ten) {
      this.burned.push(...this.pile); this.pile = []; this.under7 = false;
      return {
        type: 'burned', cards, playerId: p.id, nextPlayerId: p.id,
        message: `${p.name} plays 10 — BURN! 🔥 Go again!`,
        burnedPile: true, drewCount, skippedIds: [], under7After: false,
        playerFinished: isEmpty, gameOver: false,
      };
    }

    if (isQuartet(this.pile)) {
      this.burned.push(...this.pile); this.pile = []; this.under7 = false;
      return {
        type: 'quartet', cards, playerId: p.id, nextPlayerId: p.id,
        message: `${p.name} makes FOUR OF A KIND! 🃏 Go again!`,
        burnedPile: true, drewCount, skippedIds: [], under7After: false,
        playerFinished: isEmpty, gameOver: false,
      };
    }

    if (rank === Rank.Seven) { this.under7 = true; }
    else if (!isTransparent(rank)) { this.under7 = false; }

    const skipCount = rank === Rank.Eight ? cards.length : 0;
    const skippedIds: number[] = [];
    let next = this.currentPlayer;
    for (let s = 0; s <= skipCount; s++) {
      const candidate = this._nextPlayer(next);
      if (s < skipCount) skippedIds.push(candidate);
      next = candidate;
    }
    this.currentPlayer = next;

    const skipMsg  = skippedIds.length ? ` (${skippedIds.map(id => this.players[id].name).join(', ')} skipped)` : '';
    const u7msg    = this.under7 ? ' ⬇️ Next player must play UNDER 7!' : '';
    const cardNames = cards.map(c => cardLabel(c)).join(' + ');

    return {
      type: 'played', cards, playerId: p.id, nextPlayerId: next,
      message: `${p.name} speelt ${cardNames}${skipMsg}${u7msg}`,
      burnedPile: false, drewCount, skippedIds,
      under7After: this.under7, playerFinished: isEmpty, gameOver: false,
    };
  }

  private _nextPlayer(from: number): number {
    const n = this.players.length;
    let next = (from + 1) % n;
    let tries = 0;
    while (this.players[next].hasFinished && tries++ < n) next = (next + 1) % n;
    return next;
  }
}
