import { System } from '../../core/ecs/World';
import { Entity } from '../../core/ecs/Entity';
import { Access } from './PlayerFactory';
import { HeroClass } from '../data/classes';

/**
 * Resolves all HP changes: damage (with defense + shield mitigation),
 * healing (capped at max), and the Warrior's per-combat block.
 */
export class CombatSystem extends System {
  /**
   * Apply raw damage to an entity, factoring defense then shield.
   * @returns the HP actually lost.
   */
  damage(target: Entity, raw: number): number {
    const hp = Access.hp(target);
    const status = Access.status(target);
    const stats = Access.stats(target);

    let dmg = raw - stats.defense;
    if (dmg < 1) dmg = 1; // always at least 1

    if (status.shield > 0) {
      const blocked = Math.min(status.shield, dmg);
      status.shield -= blocked;
      dmg -= blocked;
    }

    hp.hp = Math.max(0, hp.hp - dmg);
    return dmg;
  }

  heal(target: Entity, amount: number): void {
    const hp = Access.hp(target);
    hp.hp = Math.min(hp.maxHP, hp.hp + amount);
  }

  addShield(target: Entity, amount: number): void {
    Access.status(target).shield += amount;
  }

  /** Reset the Warrior block at the start of each combat. */
  beginCombat(player: Entity): void {
    Access.ability(player).warriorBlockAvailable = true;
  }

  /**
   * Enemy hits player; Warriors negate the first hit of a combat.
   * @returns the HP lost (0 if blocked).
   */
  enemyHit(player: Entity, raw: number): { dmg: number; blocked: boolean } {
    const id = Access.id(player);
    const ability = Access.ability(player);
    if (id.cls === HeroClass.Warrior && ability.warriorBlockAvailable) {
      ability.warriorBlockAvailable = false;
      return { dmg: 0, blocked: true };
    }
    return { dmg: this.damage(player, raw), blocked: false };
  }
}
