import { GameContext } from '../game/GameContext';
import { Access } from '../game/systems/PlayerFactory';
import type { GameSnap, SnapPlayer } from './protocol';

export function serialize(ctx: GameContext, phase: string, log: string[]): GameSnap {
  return {
    phase,
    round:        ctx.round,
    currentIndex: ctx.currentIndex,
    potGold:      ctx.potGold,
    winnerId:     ctx.winnerId,
    combat:       ctx.combat ? { ...ctx.combat } : null,
    log:          log.slice(0, 40),
    players: ctx.players.map((p): SnapPlayer => {
      const id = Access.id(p);
      const hp = Access.hp(p);
      const w  = Access.wallet(p);
      const st = Access.stats(p);
      const h  = Access.hand(p);
      const po = Access.pos(p);
      const s  = Access.status(p);
      const ab = Access.ability(p);
      return {
        name: id.name, cls: id.cls, index: id.index,
        hp: hp.hp, maxHP: hp.maxHP,
        gold: w.gold,
        attack: st.attack, defense: st.defense, magic: st.magic,
        bonusAttack: st.bonusAttack,
        attackUpgrades: st.attackUpgrades, defenseUpgrades: st.defenseUpgrades,
        cards: [...h.cards],
        square: po.square,
        skipNextTurn: s.skipNextTurn, shield: s.shield,
        warriorBlockAvailable: ab.warriorBlockAvailable,
      };
    }),
  };
}

/** Rebuild a GameContext from a snapshot for guest-side rendering. */
export function reconstitute(snap: GameSnap): GameContext {
  const ctx = new GameContext();
  ctx.init(snap.players.map(sp => ({ name: sp.name, cls: sp.cls })));

  snap.players.forEach((sp, i) => {
    const p  = ctx.players[i];
    const hp = Access.hp(p);
    hp.hp = sp.hp; hp.maxHP = sp.maxHP;

    Access.wallet(p).gold = sp.gold;

    const st = Access.stats(p);
    st.attack = sp.attack; st.defense = sp.defense; st.magic = sp.magic;
    st.bonusAttack = sp.bonusAttack;
    st.attackUpgrades = sp.attackUpgrades; st.defenseUpgrades = sp.defenseUpgrades;

    Access.hand(p).cards   = [...sp.cards];
    Access.pos(p).square   = sp.square;

    const s = Access.status(p);
    s.skipNextTurn = sp.skipNextTurn; s.shield = sp.shield;

    Access.ability(p).warriorBlockAvailable = sp.warriorBlockAvailable;
  });

  ctx.currentIndex = snap.currentIndex;
  ctx.round        = snap.round;
  ctx.potGold      = snap.potGold;
  ctx.winnerId     = snap.winnerId;
  ctx.combat       = snap.combat ? { ...snap.combat } : null;

  return ctx;
}
