import { System } from '../../core/ecs/World';
import { Entity } from '../../core/ecs/Entity';
import { Access } from './PlayerFactory';
import { fullDeck, type Card } from '../data/cards';
import type { RNG } from '../util/RNG';

/**
 * Owns the shared draw pile and discard pile, and deals cards into
 * players' hands. Auto-reshuffles the discard when the deck runs dry.
 */
export class DeckSystem extends System {
  private deck: Card[] = [];
  private discard: Card[] = [];
  private rng: RNG;

  constructor(rng: RNG) {
    super();
    this.rng = rng;
  }

  get deckSize(): number { return this.deck.length; }
  get discardSize(): number { return this.discard.length; }

  reset(): void {
    this.deck = fullDeck();
    this.discard = [];
    this.shuffle(this.deck);
  }

  /** Draw one card into a player's hand. */
  deal(player: Entity): Card | null {
    if (this.deck.length === 0) {
      // Recycle discard
      this.deck = this.discard;
      this.discard = [];
      this.shuffle(this.deck);
    }
    if (this.deck.length === 0) return null;
    const card = this.deck.pop()!;
    Access.hand(player).cards.push(card);
    return card;
  }

  dealMany(player: Entity, n: number): void {
    for (let i = 0; i < n; i++) this.deal(player);
  }

  /** Move a played card to the discard pile. */
  discardCard(card: Card): void {
    this.discard.push(card);
  }

  private shuffle(arr: Card[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.rng.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
