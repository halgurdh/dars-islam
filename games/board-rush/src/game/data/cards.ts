/** Standard playing-card suits, mapped to fantasy themes. */
export enum Suit {
  Clubs = 'Clubs',     // movement
  Diamonds = 'Diamonds', // economy
  Hearts = 'Hearts',   // healing / buff
  Spades = 'Spades',   // dark / combat
}

export enum Rank {
  Ace = 1, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King,
}

export enum CardEffect {
  Attack = 'Attack',
  Heal = 'Heal',
  GainGold = 'GainGold',
  LoseGold = 'LoseGold',
  DrawCards = 'DrawCards',
  SkipTurn = 'SkipTurn',
  Shield = 'Shield',
  Curse = 'Curse',
  TeleportForward = 'TeleportForward',
  TeleportBack = 'TeleportBack',
}

export interface Card {
  suit: Suit;
  rank: Rank;
  effect: CardEffect;
  value: number;
  flavor: string;
}

const RANK_STR: Record<Rank, string> = {
  [Rank.Ace]: 'A', [Rank.Two]: '2', [Rank.Three]: '3', [Rank.Four]: '4',
  [Rank.Five]: '5', [Rank.Six]: '6', [Rank.Seven]: '7', [Rank.Eight]: '8',
  [Rank.Nine]: '9', [Rank.Ten]: '10', [Rank.Jack]: 'J', [Rank.Queen]: 'Q',
  [Rank.King]: 'K',
};

/** Asset filename for a card face, e.g. "cardHearts10.png". */
export function cardAsset(card: Card): string {
  return `card${card.suit}${RANK_STR[card.rank]}.png`;
}

export function suitSymbol(suit: Suit): string {
  return { [Suit.Clubs]: '♣', [Suit.Diamonds]: '♦', [Suit.Hearts]: '♥', [Suit.Spades]: '♠' }[suit];
}

export function rankLabel(rank: Rank): string {
  return RANK_STR[rank];
}

export function effectSummary(card: Card): string {
  switch (card.effect) {
    case CardEffect.Attack: return `Deal ${card.value} damage`;
    case CardEffect.Heal: return `Restore ${card.value} HP`;
    case CardEffect.GainGold: return `Gain ${card.value} gold`;
    case CardEffect.LoseGold: return `Lose ${card.value} gold`;
    case CardEffect.DrawCards: return `Draw ${card.value} card(s)`;
    case CardEffect.SkipTurn: return `Opponent skips a turn`;
    case CardEffect.Shield: return `Block ${card.value} damage`;
    case CardEffect.Curse: return `Opponent loses ${card.value} HP`;
    case CardEffect.TeleportForward: return `Advance ${card.value} spaces`;
    case CardEffect.TeleportBack: return `Move back ${card.value} spaces`;
  }
}

/** Build a single card's effect + flavour from suit & rank. */
export function buildCard(suit: Suit, rank: Rank): Card {
  const r = rank as number;
  switch (suit) {
    case Suit.Spades:
      return {
        suit, rank,
        effect: rank === Rank.Ace ? CardEffect.Curse : r >= 11 ? CardEffect.SkipTurn : CardEffect.Attack,
        value: rank === Rank.Ace ? 5 : r >= 11 ? 0 : r + 1,
        flavor:
          rank === Rank.Ace ? 'Dark omen — a curse falls on your foe.' :
          rank === Rank.King ? 'The Dark King commands: your enemy rests.' :
          rank === Rank.Queen ? 'Shadow Queen freezes the opponent.' :
          rank === Rank.Jack ? 'The Black Knight stuns your target.' :
          `A blade strikes for ${r + 1} damage.`,
      };
    case Suit.Hearts:
      return {
        suit, rank,
        effect: rank === Rank.Ace ? CardEffect.Shield : r >= 11 ? CardEffect.DrawCards : CardEffect.Heal,
        value: rank === Rank.Ace ? 8 : rank === Rank.King ? 3 : rank === Rank.Queen ? 2 : rank === Rank.Jack ? 1 : r,
        flavor:
          rank === Rank.Ace ? "Heart's Ward — a divine shield surrounds you." :
          rank === Rank.King ? 'The Healing King restores your party.' :
          rank === Rank.Queen ? 'Queen of Grace channels the light.' :
          rank === Rank.Jack ? 'A young cleric offers a prayer.' :
          `A pulse of life restores ${r} HP.`,
      };
    case Suit.Diamonds:
      return {
        suit, rank,
        effect:
          rank === Rank.Ace || rank === Rank.King ? CardEffect.GainGold :
          rank === Rank.Queen || rank === Rank.Jack ? CardEffect.LoseGold :
          r <= 5 ? CardEffect.GainGold : CardEffect.LoseGold,
        value: rank === Rank.Ace ? 20 : rank === Rank.King ? 15 : rank === Rank.Queen ? 10 : rank === Rank.Jack ? 5 : r * 2,
        flavor:
          rank === Rank.Ace ? 'Diamond jackpot! The vault is yours.' :
          rank === Rank.King ? 'The Merchant King pays his tithe.' :
          rank === Rank.Queen ? 'A tax collector arrives. Pay up.' :
          rank === Rank.Jack ? 'The toll road claims its fee.' :
          r <= 5 ? `A gem worth ${r * 2} gold.` : `A merchant dispute costs ${r * 2} gold.`,
      };
    case Suit.Clubs:
      return {
        suit, rank,
        effect:
          rank === Rank.Ace || rank === Rank.King ? CardEffect.TeleportForward :
          rank === Rank.Queen || rank === Rank.Jack ? CardEffect.TeleportBack :
          r <= 6 ? CardEffect.TeleportForward : CardEffect.DrawCards,
        value: rank === Rank.Ace ? 6 : rank === Rank.King ? 4 : rank === Rank.Queen ? 3 : rank === Rank.Jack ? 2 : r <= 6 ? Math.floor(r / 2) + 1 : 1,
        flavor:
          rank === Rank.Ace ? 'Arcane rift — leap 6 spaces forward!' :
          rank === Rank.King ? "The Warlord's march — advance 4 spaces." :
          rank === Rank.Queen ? 'A banshee wail drags you back 3 spaces.' :
          rank === Rank.Jack ? 'You trip — back 2 spaces.' :
          r <= 6 ? `A forest shortcut! Move ahead ${Math.floor(r / 2) + 1}.` : 'An ancient tome — draw a card.',
      };
  }
}

/** A full, ordered 52-card deck. */
export function fullDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades]) {
    for (let rank = Rank.Ace; rank <= Rank.King; rank++) {
      deck.push(buildCard(suit, rank as Rank));
    }
  }
  return deck;
}

export function isBlackSuit(suit: Suit): boolean {
  return suit === Suit.Spades || suit === Suit.Clubs;
}
