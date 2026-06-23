export enum Suit {
  Clubs = 'Clubs',
  Diamonds = 'Diamonds',
  Hearts = 'Hearts',
  Spades = 'Spades',
}

export enum Rank {
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
  Jack = 11,
  Queen = 12,
  King = 13,
  Ace = 14,
  Joker = 15,
}

export interface Card {
  suit: Suit | null;
  rank: Rank;
  id: string;
}

export function cardImgSrc(card: Card): string {
  if (card.rank === Rank.Joker) return 'assets/cards/cardJoker.png';
  const r = card.rank;
  const rankStr =
    r <= 10 ? String(r) :
    r === Rank.Jack ? 'J' :
    r === Rank.Queen ? 'Q' :
    r === Rank.King ? 'K' : 'A';
  return `assets/cards/card${card.suit}${rankStr}.png`;
}

export function rankLabel(rank: Rank): string {
  if (rank === Rank.Joker) return 'Jo';
  if (rank <= 10) return String(rank);
  return rank === Rank.Jack ? 'J' : rank === Rank.Queen ? 'Q' : rank === Rank.King ? 'K' : 'A';
}

export function rankName(rank: Rank): string {
  const names: Record<number, string> = {
    2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six',
    7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
    11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace', 15: 'Joker',
  };
  return names[rank] ?? String(rank);
}

export function suitSymbol(suit: Suit | null): string {
  if (!suit) return '🃏';
  const map: Record<Suit, string> = {
    [Suit.Hearts]: '♥',
    [Suit.Diamonds]: '♦',
    [Suit.Clubs]: '♣',
    [Suit.Spades]: '♠',
  };
  return map[suit];
}

export function cardLabel(card: Card): string {
  if (card.rank === Rank.Joker) return 'Joker';
  return `${rankLabel(card.rank)}${suitSymbol(card.suit)}`;
}

export const CARD_BACK = 'assets/cards/cardBack_blue2.png';
