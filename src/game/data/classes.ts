/** The four playable hero classes. */
export enum HeroClass {
  Warrior = 'Warrior',
  Mage = 'Mage',
  Rogue = 'Rogue',
  Cleric = 'Cleric',
}

export interface ClassDefinition {
  cls: HeroClass;
  maxHP: number;
  attack: number;
  defense: number;
  magic: number;
  description: string;
  /** Which colour folder + piece sprite represents this class. */
  pieceColor: 'red' | 'blue' | 'green' | 'purple';
  pieceSprite: string; // filename stem, e.g. "pieceRed_single05"
  /** UI accent colour (hex). */
  color: number;
}

export const CLASS_DEFS: Record<HeroClass, ClassDefinition> = {
  [HeroClass.Warrior]: {
    cls: HeroClass.Warrior,
    maxHP: 30,
    attack: 6,
    defense: 4,
    magic: 1,
    description: 'High HP & attack. Blocks the first enemy hit each combat.',
    pieceColor: 'red',
    pieceSprite: 'pieceRed_single05',
    color: 0xe54040,
  },
  [HeroClass.Mage]: {
    cls: HeroClass.Mage,
    maxHP: 20,
    attack: 2,
    defense: 1,
    magic: 8,
    description: 'Low HP, devastating spells. Draws an extra card each turn.',
    pieceColor: 'blue',
    pieceSprite: 'pieceBlue_single00',
    color: 0x4d7dff,
  },
  [HeroClass.Rogue]: {
    cls: HeroClass.Rogue,
    maxHP: 22,
    attack: 4,
    defense: 2,
    magic: 3,
    description: 'Steals gold. Black-suit card effects (♠♣) are doubled.',
    pieceColor: 'green',
    pieceSprite: 'pieceGreen_single04',
    color: 0x35d957,
  },
  [HeroClass.Cleric]: {
    cls: HeroClass.Cleric,
    maxHP: 25,
    attack: 3,
    defense: 3,
    magic: 5,
    description: 'Heals 3 HP after every move. Heart cards are empowered.',
    pieceColor: 'purple',
    pieceSprite: 'piecePurple_single06',
    color: 0xc060e0,
  },
};
