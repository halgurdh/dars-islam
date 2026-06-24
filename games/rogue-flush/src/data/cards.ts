export type Suit = 'Clubs' | 'Diamonds' | 'Hearts' | 'Spades';

/** 1 = Ace, 11 = Jack, 12 = Queen, 13 = King */
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export const RANK_LABELS: Record<Rank, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  Clubs: '♣', Diamonds: '♦', Hearts: '♥', Spades: '♠',
};

export const SUIT_COLORS: Record<Suit, number> = {
  Clubs: 0x222222,
  Diamonds: 0xcc2200,
  Hearts: 0xcc2200,
  Spades: 0x222222,
};

export const SUITS: Suit[] = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/** Chip value contributed by each card when it scores. Balatro rules: 2-9 face value, 10/J/Q/K = 10, A = 11. */
export function cardChips(rank: Rank): number {
  if (rank === 1) return 11;
  if (rank >= 10) return 10;
  return rank;
}

/** Key used to look up the card face texture in Phaser's cache. Matches board-rush asset filenames. */
export function cardImageKey(suit: Suit, rank: Rank): string {
  return `card${suit}${RANK_LABELS[rank]}`;
}

export interface CardDef {
  suit: Suit;
  rank: Rank;
}

/** Returns an ordered 52-card deck definition. */
export function buildFullDeck(): CardDef[] {
  const deck: CardDef[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle (mutates in place, returns array). */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
