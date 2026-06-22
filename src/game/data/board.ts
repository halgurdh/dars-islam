import { HeroClass } from './classes';

export enum SquareType {
  Start = 'Start',
  DrawCard = 'DrawCard',
  Combat = 'Combat',
  Shrine = 'Shrine',
  Market = 'Market',
  Curse = 'Curse',
  Treasure = 'Treasure',
  Dungeon = 'Dungeon',
  Teleport = 'Teleport',
  ClassBonus = 'ClassBonus',
}

export interface BoardSquare {
  type: SquareType;
  label: string;
  description: string;
  value: number;
  affinity?: HeroClass;
}

/** The 28-square ring (divisible by 4 so the renderer lays out 4 equal sides). */
export function createBoard(): BoardSquare[] {
  return [
    { type: SquareType.Start, label: 'BOARD GATE', description: 'Collect 20 gold each time you pass!', value: 20 },
    { type: SquareType.DrawCard, label: 'Arcane Archive', description: 'Draw a card from the board deck.', value: 1 },
    { type: SquareType.Combat, label: 'Goblin Camp', description: 'A goblin attacks!', value: 4 },
    { type: SquareType.Shrine, label: 'Healing Shrine', description: 'Restore 5 HP.', value: 5 },
    { type: SquareType.Market, label: 'Bazaar', description: 'Spend gold on upgrades.', value: 0 },
    { type: SquareType.DrawCard, label: 'Mage Tower', description: 'Draw 2 cards.', value: 2 },
    { type: SquareType.ClassBonus, label: "Warrior's Keep", description: 'Warriors gain +4 attack this round.', value: 4, affinity: HeroClass.Warrior },
    { type: SquareType.Curse, label: 'Cursed Swamp', description: 'Lose 3 HP and 5 gold.', value: 3 },
    { type: SquareType.Treasure, label: 'Dragon Hoard', description: 'Gain 25 gold!', value: 25 },
    { type: SquareType.Combat, label: 'Bandit Road', description: 'Bandits ambush you!', value: 6 },
    { type: SquareType.ClassBonus, label: 'Spellweave', description: 'Mages draw 3 cards.', value: 3, affinity: HeroClass.Mage },
    { type: SquareType.DrawCard, label: "Oracle's Den", description: 'Draw a card.', value: 1 },
    { type: SquareType.Dungeon, label: 'Dark Dungeon', description: 'Lose a turn and take 4 damage.', value: 4 },
    { type: SquareType.Shrine, label: 'Sacred Spring', description: 'Restore 8 HP.', value: 8 },
    { type: SquareType.Teleport, label: 'Rift Portal', description: 'Warp to a random square!', value: 0 },
    { type: SquareType.ClassBonus, label: 'Shadow Path', description: 'Rogues steal 10 gold from the pot.', value: 10, affinity: HeroClass.Rogue },
    { type: SquareType.Market, label: 'Alchemist', description: 'Buy a shield or potion.', value: 0 },
    { type: SquareType.Combat, label: 'Troll Bridge', description: 'Fight the troll!', value: 8 },
    { type: SquareType.DrawCard, label: 'Enchanted Wood', description: 'Draw a card.', value: 1 },
    { type: SquareType.Curse, label: "Witch's Hex", description: 'Lose 6 HP.', value: 6 },
    { type: SquareType.ClassBonus, label: 'Holy Altar', description: 'Clerics heal all players for 4.', value: 4, affinity: HeroClass.Cleric },
    { type: SquareType.Treasure, label: 'Lost Vault', description: 'Gain 20 gold!', value: 20 },
    { type: SquareType.Dungeon, label: 'Spider Lair', description: 'Skip your next turn.', value: 0 },
    { type: SquareType.DrawCard, label: 'Astral Plane', description: 'Draw 2 cards.', value: 2 },
    { type: SquareType.Combat, label: 'Undead Legion', description: 'Undead rise!', value: 8 },
    { type: SquareType.Market, label: 'Royal Armoury', description: 'Upgrade your gear.', value: 0 },
    { type: SquareType.Shrine, label: 'Phoenix Flame', description: 'Restore 6 HP.', value: 6 },
    { type: SquareType.Teleport, label: 'Chaos Nexus', description: 'Random warp!', value: 0 },
  ];
}

export const SQUARE_COLORS: Record<SquareType, number> = {
  [SquareType.Start]: 0xf2cc1a,
  [SquareType.DrawCard]: 0x4073e6,
  [SquareType.Combat]: 0xbf2626,
  [SquareType.Shrine]: 0x26b373,
  [SquareType.Market]: 0xb38019,
  [SquareType.Curse]: 0x731a8c,
  [SquareType.Treasure]: 0xe6a60d,
  [SquareType.Dungeon]: 0x332640,
  [SquareType.Teleport]: 0x1ab3cc,
  [SquareType.ClassBonus]: 0x4d9933,
};

export const SQUARE_ICONS: Record<SquareType, string> = {
  [SquareType.Start]: '★',
  [SquareType.DrawCard]: '♠',
  [SquareType.Combat]: '⚔',
  [SquareType.Shrine]: '✚',
  [SquareType.Market]: '$',
  [SquareType.Curse]: '☠',
  [SquareType.Treasure]: '◆',
  [SquareType.Dungeon]: '⛓',
  [SquareType.Teleport]: '✦',
  [SquareType.ClassBonus]: '☆',
};
