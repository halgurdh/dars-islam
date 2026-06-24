import { type CardDef, type Rank } from './cards';

export enum HandType {
  HighCard      = 'High Card',
  Pair          = 'Pair',
  TwoPair       = 'Two Pair',
  ThreeOfAKind  = 'Three of a Kind',
  Straight      = 'Straight',
  Flush         = 'Flush',
  FullHouse     = 'Full House',
  FourOfAKind   = 'Four of a Kind',
  StraightFlush = 'Straight Flush',
  RoyalFlush    = 'Royal Flush',
}

export interface HandBase {
  chips: number;
  mult: number;
}

export const HAND_BASE: Record<HandType, HandBase> = {
  [HandType.HighCard]:      { chips: 5,   mult: 1 },
  [HandType.Pair]:          { chips: 10,  mult: 2 },
  [HandType.TwoPair]:       { chips: 20,  mult: 2 },
  [HandType.ThreeOfAKind]:  { chips: 30,  mult: 3 },
  [HandType.Straight]:      { chips: 30,  mult: 4 },
  [HandType.Flush]:         { chips: 35,  mult: 4 },
  [HandType.FullHouse]:     { chips: 40,  mult: 4 },
  [HandType.FourOfAKind]:   { chips: 60,  mult: 7 },
  [HandType.StraightFlush]: { chips: 100, mult: 8 },
  [HandType.RoyalFlush]:    { chips: 100, mult: 8 },
};

function rankCounts(cards: CardDef[]): Map<Rank, number> {
  const map = new Map<Rank, number>();
  for (const c of cards) map.set(c.rank, (map.get(c.rank) ?? 0) + 1);
  return map;
}

function isStraightRanks(ranks: Rank[]): boolean {
  const unique = [...new Set(ranks)].sort((a, b) => a - b);
  if (unique.length !== 5) return false;
  // Normal straight: top - bottom == 4
  if (unique[4] - unique[0] === 4) return true;
  // Ace-high broadway: A, T, J, Q, K → [1, 10, 11, 12, 13]
  if (unique[0] === 1 && unique[1] === 10) return true;
  return false;
}

export function evaluateHand(cards: CardDef[]): HandType {
  if (cards.length < 1) return HandType.HighCard;

  const counts = rankCounts(cards);
  const buckets = [...counts.values()].sort((a, b) => b - a);
  const ranks = cards.map(c => c.rank);
  const suits = cards.map(c => c.suit);

  const isFlush   = cards.length >= 5 && suits.every(s => s === suits[0]);
  const isStraight = cards.length >= 5 && isStraightRanks(ranks);

  // Royal: A-T-J-Q-K flush
  const isRoyal = isFlush && isStraight && ranks.includes(1) && ranks.includes(13);

  if (isRoyal)                              return HandType.RoyalFlush;
  if (isStraight && isFlush)                return HandType.StraightFlush;
  if (buckets[0] === 4)                     return HandType.FourOfAKind;
  if (buckets[0] === 3 && buckets[1] === 2) return HandType.FullHouse;
  if (isFlush)                              return HandType.Flush;
  if (isStraight)                           return HandType.Straight;
  if (buckets[0] === 3)                     return HandType.ThreeOfAKind;
  if (buckets[0] === 2 && buckets[1] === 2) return HandType.TwoPair;
  if (buckets[0] === 2)                     return HandType.Pair;
  return HandType.HighCard;
}

/**
 * Returns which cards in the played set "score" (contribute chip value).
 * Cards that form the hand pattern are scoring; kickers are not for non-flush hands.
 */
export function scoringCards(cards: CardDef[], handType: HandType): CardDef[] {
  const counts = rankCounts(cards);

  switch (handType) {
    case HandType.RoyalFlush:
    case HandType.StraightFlush:
    case HandType.Flush:
    case HandType.Straight:
    case HandType.FullHouse:
    case HandType.HighCard:
      return cards;

    case HandType.FourOfAKind: {
      const fourRank = [...counts.entries()].find(([, c]) => c === 4)?.[0];
      return cards.filter(c => c.rank === fourRank);
    }
    case HandType.ThreeOfAKind: {
      const triRank = [...counts.entries()].find(([, c]) => c === 3)?.[0];
      return cards.filter(c => c.rank === triRank);
    }
    case HandType.TwoPair: {
      const pairRanks = [...counts.entries()].filter(([, c]) => c === 2).map(([r]) => r);
      return cards.filter(c => pairRanks.includes(c.rank));
    }
    case HandType.Pair: {
      const pairRank = [...counts.entries()].find(([, c]) => c === 2)?.[0];
      return cards.filter(c => c.rank === pairRank);
    }
    default:
      return cards;
  }
}

/** Total score for a played hand: (handBaseChips + sum(scoringCardChips)) × mult */
export function calculateScore(
  cards: CardDef[],
  handType: HandType,
  cardChipsFn: (rank: Rank) => number,
): number {
  const base = HAND_BASE[handType];
  const scoring = scoringCards(cards, handType);
  const totalChips = base.chips + scoring.reduce((sum, c) => sum + cardChipsFn(c.rank), 0);
  return totalChips * base.mult;
}
