import { Card, Rank, Suit } from './Card';

let _nextId = 0;

function makeCard(suit: Suit | null, rank: Rank): Card {
  return { suit, rank, id: `c${_nextId++}` };
}

export function createDeck(jokers = true): Card[] {
  const suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
  const ranks = [
    Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six,
    Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten,
    Rank.Jack, Rank.Queen, Rank.King, Rank.Ace,
  ] as Rank[];

  const cards: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      cards.push(makeCard(suit, rank));
    }
  }
  if (jokers) {
    cards.push(makeCard(null, Rank.Joker));
    cards.push(makeCard(null, Rank.Joker));
  }

  return shuffle(cards);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
