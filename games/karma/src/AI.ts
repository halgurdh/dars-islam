import { Card, Rank } from './Card';
import { KarmaGame, GameSource } from './KarmaGame';
import { canPlay, effectiveTop, getValidGroups } from './Rules';

export type AIDecision =
  | { action: 'play'; cardIds: string[] }
  | { action: 'flip'; slotIndex: number }
  | { action: 'take' };

export function aiDecide(game: KarmaGame, playerId: number): AIDecision {
  const player = game.players[playerId];
  const source: GameSource = game.getSource(playerId);

  if (source === 'done') return { action: 'take' };

  // Blind flip — pick first available slot
  if (source === 'facedown') {
    const slot = player.faceDown.findIndex(c => c !== null);
    return slot >= 0 ? { action: 'flip', slotIndex: slot } : { action: 'take' };
  }

  const hand: Card[] = source === 'hand'
    ? player.hand
    : player.faceUp.filter((c): c is Card => c !== null);

  const groups = getValidGroups(hand, game.pile, game.under7);
  if (groups.length === 0) return { action: 'take' };

  // --- Strategy ---
  const top = effectiveTop(game.pile);

  // 1. Complete a quartet if possible
  if (top) {
    const pileRunCount = game.pile.filter(c => c.rank === top.rank).length;
    for (const group of groups) {
      if (group[0].rank === top.rank && pileRunCount + group.length >= 4) {
        const ids = source === 'hand' ? group.map(c => c.id) : [group[0].id];
        return { action: 'play', cardIds: ids };
      }
    }
  }

  // 2. Burn (10) if pile is big or top card is high
  const burn = groups.find(g => g[0].rank === Rank.Ten);
  if (burn && (game.pile.length >= 5 || (top && top.rank >= Rank.King))) {
    const ids = source === 'hand' ? burn.map(c => c.id) : [burn[0].id];
    return { action: 'play', cardIds: ids };
  }

  // 3. Avoid playing 2 / 3 / Joker unless nothing else available
  const sorted = [...groups].sort((a, b) => a[0].rank - b[0].rank);
  const nonSpecial = sorted.filter(
    g => g[0].rank !== Rank.Two && g[0].rank !== Rank.Three && g[0].rank !== Rank.Joker,
  );
  const chosen = nonSpecial.length > 0 ? nonSpecial[0] : sorted[0];

  // 4. For face-up source: one card at a time
  if (source === 'faceup') return { action: 'play', cardIds: [chosen[0].id] };

  // 5. Play all cards of chosen rank (helps complete quartet)
  return { action: 'play', cardIds: chosen.map(c => c.id) };
}

// Sanity-check that the AI decision is still valid (state may have changed)
export function validateAIDecision(game: KarmaGame, playerId: number, decision: AIDecision): boolean {
  if (decision.action === 'take') return true;
  if (decision.action === 'flip') {
    const c = game.players[playerId].faceDown[decision.slotIndex];
    return c !== null;
  }
  const source = game.getSource(playerId);
  const p = game.players[playerId];
  const hand = source === 'hand'
    ? p.hand
    : p.faceUp.filter((c): c is Card => c !== null);
  const cards = hand.filter(c => decision.cardIds.includes(c.id));
  return cards.length > 0 && canPlay(cards, game.pile, game.under7);
}
