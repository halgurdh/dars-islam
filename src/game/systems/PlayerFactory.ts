import { Entity } from '../../core/ecs/Entity';
import { HeroClass, CLASS_DEFS } from '../data/classes';
import {
  makeIdentity, makeHealth, makeWallet, makeStats,
  makeHand, makePosition, makeStatus, makeClassAbility, C,
  type IdentityComponent, type HealthComponent, type WalletComponent,
  type StatsComponent, type HandComponent, type PositionComponent,
  type StatusComponent, type ClassAbilityComponent,
} from '../components/components';

/** Builds a fully-composed player entity for a class. */
export function createPlayer(index: number, name: string, cls: HeroClass): Entity {
  const def = CLASS_DEFS[cls];
  return new Entity()
    .tag('player')
    .add(makeIdentity(name, cls, index))
    .add(makeHealth(def.maxHP))
    .add(makeWallet(50))
    .add(makeStats(def.attack, def.defense, def.magic))
    .add(makeHand())
    .add(makePosition(0))
    .add(makeStatus())
    .add(makeClassAbility());
}

/** Typed accessors — convenience wrappers over Entity.require. */
export const Access = {
  id: (e: Entity) => e.require<IdentityComponent>(C.Identity),
  hp: (e: Entity) => e.require<HealthComponent>(C.Health),
  wallet: (e: Entity) => e.require<WalletComponent>(C.Wallet),
  stats: (e: Entity) => e.require<StatsComponent>(C.Stats),
  hand: (e: Entity) => e.require<HandComponent>(C.Hand),
  pos: (e: Entity) => e.require<PositionComponent>(C.Position),
  status: (e: Entity) => e.require<StatusComponent>(C.Status),
  ability: (e: Entity) => e.require<ClassAbilityComponent>(C.ClassAbility),
};

export const isAlive = (e: Entity) => Access.hp(e).hp > 0;
export const effectiveAttack = (e: Entity) => {
  const s = Access.stats(e);
  return s.attack + s.bonusAttack;
};
