import type { Component } from '../../core/ecs/Entity';
import { HeroClass } from '../data/classes';
import type { Card } from '../data/cards';

/** Component type keys (string constants prevent typos). */
export const C = {
  Identity: 'identity',
  Health: 'health',
  Wallet: 'wallet',
  Stats: 'stats',
  Hand: 'hand',
  Position: 'position',
  Status: 'status',
  ClassAbility: 'classAbility',
} as const;

export interface IdentityComponent extends Component {
  type: typeof C.Identity;
  name: string;
  cls: HeroClass;
  index: number;
}

export interface HealthComponent extends Component {
  type: typeof C.Health;
  hp: number;
  maxHP: number;
}

export interface WalletComponent extends Component {
  type: typeof C.Wallet;
  gold: number;
}

export interface StatsComponent extends Component {
  type: typeof C.Stats;
  attack: number;
  defense: number;
  magic: number;
  bonusAttack: number;     // temporary, reset each move
  attackUpgrades: number;  // market purchases
  defenseUpgrades: number;
}

export interface HandComponent extends Component {
  type: typeof C.Hand;
  cards: Card[];
}

export interface PositionComponent extends Component {
  type: typeof C.Position;
  square: number;
}

export interface StatusComponent extends Component {
  type: typeof C.Status;
  skipNextTurn: boolean;
  shield: number;
}

export interface ClassAbilityComponent extends Component {
  type: typeof C.ClassAbility;
  /** Internal flag: has the Warrior used their per-combat block yet? */
  warriorBlockAvailable: boolean;
}

// ── Factory helpers ────────────────────────────────────────────────────────

export const makeIdentity = (name: string, cls: HeroClass, index: number): IdentityComponent =>
  ({ type: C.Identity, name, cls, index });

export const makeHealth = (maxHP: number): HealthComponent =>
  ({ type: C.Health, hp: maxHP, maxHP });

export const makeWallet = (gold: number): WalletComponent =>
  ({ type: C.Wallet, gold });

export const makeStats = (attack: number, defense: number, magic: number): StatsComponent =>
  ({ type: C.Stats, attack, defense, magic, bonusAttack: 0, attackUpgrades: 0, defenseUpgrades: 0 });

export const makeHand = (): HandComponent =>
  ({ type: C.Hand, cards: [] });

export const makePosition = (square = 0): PositionComponent =>
  ({ type: C.Position, square });

export const makeStatus = (): StatusComponent =>
  ({ type: C.Status, skipNextTurn: false, shield: 0 });

export const makeClassAbility = (): ClassAbilityComponent =>
  ({ type: C.ClassAbility, warriorBlockAvailable: true });
