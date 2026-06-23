import { Card, Rank } from './Card';

// Walk pile from top, skip transparent (3, Joker) to find effective top value
export function effectiveTop(pile: Card[]): Card | null {
  for (let i = pile.length - 1; i >= 0; i--) {
    const r = pile[i].rank;
    if (r !== Rank.Three && r !== Rank.Joker) return pile[i];
  }
  return null;
}

// Count how many consecutive cards of the same rank sit at the top of the pile
export function topRunLength(pile: Card[]): number {
  if (pile.length === 0) return 0;
  const topRank = pile[pile.length - 1].rank;
  let n = 0;
  for (let i = pile.length - 1; i >= 0 && pile[i].rank === topRank; i--) n++;
  return n;
}

export function isQuartet(pile: Card[]): boolean {
  return topRunLength(pile) >= 4;
}

export function isTransparent(rank: Rank): boolean {
  return rank === Rank.Three || rank === Rank.Joker;
}

/**
 * Can this group of same-rank cards be played onto the current pile?
 *
 * Special rules:
 *  2 / 3 / Joker  — always playable
 *  7 active       — must play < 7 (4/5/6 or 2/3/Joker); 10 not allowed
 *  10             — burns pile (always when no under-7); not allowed under 7
 *  Ace on pile    — only Ace can follow (2, 3, 10, Joker handled above)
 */
export function canPlay(cards: Card[], pile: Card[], under7: boolean): boolean {
  if (cards.length === 0) return false;
  const rank = cards[0].rank;
  if (!cards.every(c => c.rank === rank)) return false;

  // Always playable specials
  if (rank === Rank.Two || rank === Rank.Three || rank === Rank.Joker) return true;

  if (under7) {
    // Only 4, 5, 6 allowed (2/3/Joker handled above; 10 blocked)
    return rank >= Rank.Four && rank <= Rank.Six;
  }

  // 10 burns when not under-7
  if (rank === Rank.Ten) return true;

  const top = effectiveTop(pile);
  if (top === null) return true; // empty / all-transparent pile

  // After Ace: only another Ace (2/3/10/Joker already handled)
  if (top.rank === Rank.Ace) return rank === Rank.Ace;

  return rank >= top.rank;
}

// Return all unique-rank groups from `hand` that are currently playable
export function getValidGroups(hand: Card[], pile: Card[], under7: boolean): Card[][] {
  const byRank = new Map<number, Card[]>();
  for (const c of hand) {
    if (!byRank.has(c.rank)) byRank.set(c.rank, []);
    byRank.get(c.rank)!.push(c);
  }
  const groups: Card[][] = [];
  for (const [, cards] of byRank) {
    if (canPlay([cards[0]], pile, under7)) groups.push(cards);
  }
  return groups;
}
