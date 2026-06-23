import { type CardDef, buildFullDeck, shuffle } from '../data/cards';

export class Deck {
  private drawPile: CardDef[];
  private discardPile: CardDef[] = [];

  constructor() {
    this.drawPile = shuffle(buildFullDeck());
  }

  /** Draw up to n cards. Reshuffles the discard pile if draw runs dry. */
  draw(n: number): CardDef[] {
    const drawn: CardDef[] = [];
    for (let i = 0; i < n; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        this.drawPile = shuffle(this.discardPile.splice(0));
      }
      drawn.push(this.drawPile.pop()!);
    }
    return drawn;
  }

  discard(cards: CardDef[]): void {
    this.discardPile.push(...cards);
  }

  get remaining(): number { return this.drawPile.length; }
  get discarded(): number { return this.discardPile.length; }
}
