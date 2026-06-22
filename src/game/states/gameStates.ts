import type { State } from '../../core/fsm/StateMachine';
import type { GameContext } from '../GameContext';
import { S } from './stateNames';
import { Access, isAlive, effectiveAttack } from '../systems/PlayerFactory';
import { HeroClass } from '../data/classes';
import { SquareType } from '../data/board';
import {
  CardEffect, isBlackSuit, suitSymbol, rankLabel,
} from '../data/cards';

type GS = State<GameContext>;

// ─────────────────────────────────────────────────────────────────────────
// ClassSelect — waits for the UI to send 'players:chosen'
// ─────────────────────────────────────────────────────────────────────────
export const ClassSelectState: GS = {
  name: S.ClassSelect,
  onEnter(ctx) {
    ctx.bus.emit('hud:refresh', {});
  },
  onEvent(ctx, m, event, payload) {
    if (event === 'players:chosen') {
      const picks = payload as { name: string; cls: HeroClass }[];
      ctx.init(picks);
      ctx.log('=== REALM QUEST BEGINS ===');
      const id = Access.id(ctx.current);
      ctx.bus.emit('turn:started', { playerId: id.index, round: ctx.round });
      m.transition(S.Roll);
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Roll — waits for 'roll' event, rolls 2d6, moves, then resolves square
// ─────────────────────────────────────────────────────────────────────────
export const RollState: GS = {
  name: S.Roll,
  onEnter(ctx) {
    ctx.bus.emit('hud:refresh', {});
  },
  onEvent(ctx, m, event) {
    if (event !== 'roll') return;
    const d1 = ctx.rng.d6();
    const d2 = ctx.rng.d6();
    const steps = d1 + d2;
    ctx.bus.emit('dice:rolled', { d1, d2, total: steps });

    const player = ctx.current;
    const pos = Access.pos(player);
    const from = pos.square;
    const to = (from + steps) % ctx.board.length;

    // Passed Realm Gate?
    if (to < from || steps >= ctx.board.length) {
      Access.wallet(player).gold += 20;
      ctx.log(`${Access.id(player).name} passed the Realm Gate (+20 gold).`);
    }
    pos.square = to;

    // Cleric heals on move; reset temp bonus attack
    if (Access.id(player).cls === HeroClass.Cleric) ctx.combatSys.heal(player, 3);
    Access.stats(player).bonusAttack = 0;

    ctx.bus.emit('player:moved', { playerId: Access.id(player).index, from, to });
    ctx.log(`${Access.id(player).name} rolled ${d1}+${d2}=${steps} → ${ctx.board[to].label}`);
    m.transition(S.SquareEffect);
  },
};

// ─────────────────────────────────────────────────────────────────────────
// SquareEffect — applies the landing square, may redirect to Combat/Market
// ─────────────────────────────────────────────────────────────────────────
export const SquareEffectState: GS = {
  name: S.SquareEffect,
  onEnter(ctx, m) {
    const player = ctx.current;
    const sq = ctx.board[Access.pos(player).square];
    const name = Access.id(player).name;

    switch (sq.type) {
      case SquareType.Start:
        Access.wallet(player).gold += sq.value;
        ctx.log(`${name} rests at the Realm Gate (+${sq.value} gold).`);
        break;
      case SquareType.DrawCard: {
        const n = Math.max(1, sq.value);
        for (let i = 0; i < n; i++) {
          const c = ctx.deckSys.deal(player);
          if (c) ctx.bus.emit('card:drawn', { playerId: Access.id(player).index, card: c });
        }
        ctx.log(`${name} drew ${n} card(s).`);
        break;
      }
      case SquareType.Shrine:
        ctx.combatSys.heal(player, sq.value);
        ctx.bus.emit('player:healed', { playerId: Access.id(player).index, amount: sq.value });
        ctx.log(`${name} healed ${sq.value} HP.`);
        break;
      case SquareType.Treasure:
        Access.wallet(player).gold += sq.value;
        ctx.log(`${name} found treasure (+${sq.value} gold).`);
        break;
      case SquareType.Curse: {
        const dmg = ctx.combatSys.damage(player, sq.value + Access.stats(player).defense);
        Access.wallet(player).gold = Math.max(0, Access.wallet(player).gold - 5);
        ctx.log(`${name} is cursed (-${dmg} HP, -5 gold).`);
        break;
      }
      case SquareType.Dungeon:
        Access.status(player).skipNextTurn = true;
        if (sq.value > 0) ctx.combatSys.damage(player, sq.value + Access.stats(player).defense);
        ctx.log(`${name} is trapped (skip next turn${sq.value > 0 ? `, -${sq.value} HP` : ''}).`);
        break;
      case SquareType.Teleport: {
        const dest = ctx.rng.int(0, ctx.board.length - 1);
        Access.pos(player).square = dest;
        ctx.bus.emit('player:moved', { playerId: Access.id(player).index, from: Access.pos(player).square, to: dest });
        ctx.log(`${name} warped to ${ctx.board[dest].label}.`);
        break;
      }
      case SquareType.ClassBonus:
        applyClassBonus(ctx, sq.affinity!, sq.value);
        break;
      case SquareType.Combat:
        startCombat(ctx, sq.label, sq.value);
        m.transition(S.Combat);
        return;
      case SquareType.Market:
        ctx.log(`${name} enters the market.`);
        m.transition(S.Market);
        return;
    }

    if (ctx.checkWin()) { m.transition(S.GameOver); return; }
    m.transition(S.CardPlay);
  },
};

function applyClassBonus(ctx: GameContext, affinity: HeroClass, value: number): void {
  const player = ctx.current;
  const name = Access.id(player).name;
  if (Access.id(player).cls !== affinity) {
    ctx.log(`${name} finds nothing here (bonus is for ${affinity}s).`);
    return;
  }
  switch (affinity) {
    case HeroClass.Warrior:
      Access.stats(player).bonusAttack = value;
      ctx.log(`${name} (Warrior) gains +${value} attack this round.`);
      break;
    case HeroClass.Mage:
      ctx.deckSys.dealMany(player, value);
      ctx.log(`${name} (Mage) draws ${value} cards.`);
      break;
    case HeroClass.Rogue: {
      const stolen = Math.min(value, ctx.potGold);
      Access.wallet(player).gold += stolen;
      ctx.potGold -= stolen;
      ctx.log(`${name} (Rogue) steals ${stolen} gold from the pot.`);
      break;
    }
    case HeroClass.Cleric:
      for (const p of ctx.players) if (isAlive(p)) ctx.combatSys.heal(p, value);
      ctx.log(`${name} (Cleric) heals all players for ${value} HP.`);
      break;
  }
}


function startCombat(ctx: GameContext, label: string, value: number): void {
  const scale = Math.floor(ctx.round / 3);
  ctx.combat = {
    enemyName: label,
    enemyHP: value + scale * 2,
    enemyAttack: Math.max(2, Math.floor(value / 2) + scale),
    enemyDefense: 1 + scale,
    resolved: false,
  };
  ctx.combatSys.beginCombat(ctx.current);
  ctx.bus.emit('combat:started', { enemyName: label });
}

// ─────────────────────────────────────────────────────────────────────────
// Combat — 'attack' runs a round; 'flee' costs HP and exits
// ─────────────────────────────────────────────────────────────────────────
export const CombatState: GS = {
  name: S.Combat,
  onEnter(ctx) {
    ctx.bus.emit('hud:refresh', {});
  },
  onEvent(ctx, m, event) {
    if (!ctx.combat) { m.transition(S.CardPlay); return; }
    const player = ctx.current;

    if (event === 'flee') {
      ctx.combatSys.damage(player, 5 + Access.stats(player).defense);
      ctx.combat = null;
      ctx.log(`${Access.id(player).name} flees (-5 HP).`);
      ctx.bus.emit('combat:ended', { won: false });
      if (ctx.checkWin()) { m.transition(S.GameOver); return; }
      m.transition(S.CardPlay);
      return;
    }

    if (event !== 'attack') return;
    const c = ctx.combat;

    // Player strikes
    const pAtk = Math.max(1, effectiveAttack(player) - c.enemyDefense + ctx.rng.int(0, 3));
    c.enemyHP -= pAtk;
    let text = `${Access.id(player).name} hits ${c.enemyName} for ${pAtk}. Enemy HP: ${Math.max(0, c.enemyHP)}. `;

    if (c.enemyHP <= 0) {
      const reward = 10 + ctx.rng.int(0, 10);
      Access.wallet(player).gold += reward;
      ctx.combatSys.heal(player, 2);
      text += `${c.enemyName} defeated! +${reward} gold.`;
      c.resolved = true;
      ctx.combat = null;
      ctx.bus.emit('combat:round', { text });
      ctx.bus.emit('combat:ended', { won: true });
      ctx.log(text);
      if (ctx.checkWin()) { m.transition(S.GameOver); return; }
      m.transition(S.CardPlay);
      return;
    }

    // Enemy retaliates
    const { dmg, blocked } = ctx.combatSys.enemyHit(player, c.enemyAttack + ctx.rng.int(0, 2));
    text += blocked
      ? `Warrior's shield absorbs the blow!`
      : `${c.enemyName} retaliates for ${dmg}. ${Access.id(player).name} HP: ${Access.hp(player).hp}.`;

    ctx.bus.emit('combat:round', { text });
    ctx.bus.emit('hud:refresh', {});
    ctx.log(text);

    if (!isAlive(player)) {
      ctx.bus.emit('player:died', { playerId: Access.id(player).index });
      ctx.combat = null;
      if (ctx.checkWin()) { m.transition(S.GameOver); return; }
      m.transition(S.EndTurn);
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Market — 'buy' purchases; 'leave' exits to CardPlay
// ─────────────────────────────────────────────────────────────────────────
export const MarketState: GS = {
  name: S.Market,
  onEnter(ctx) {
    ctx.bus.emit('hud:refresh', {});
  },
  onEvent(ctx, m, event, payload) {
    if (event === 'buy') {
      const item = payload as string;
      ctx.log(`[Market] ${buy(ctx, item)}`);
      ctx.bus.emit('hud:refresh', {});
    } else if (event === 'leave') {
      m.transition(S.CardPlay);
    }
  },
};

function buy(ctx: GameContext, item: string): string {
  const player = ctx.current;
  const w = Access.wallet(player);
  const s = Access.stats(player);
  if (item === 'attack') {
    const cost = 15 + s.attackUpgrades * 10;
    if (w.gold < cost) return 'Not enough gold!';
    w.gold -= cost; s.attack += 2; s.attackUpgrades++;
    return `Attack +2 (-${cost} gold).`;
  }
  if (item === 'defense') {
    const cost = 15 + s.defenseUpgrades * 10;
    if (w.gold < cost) return 'Not enough gold!';
    w.gold -= cost; s.defense += 2; s.defenseUpgrades++;
    return `Defense +2 (-${cost} gold).`;
  }
  if (item === 'potion') {
    if (w.gold < 10) return 'Not enough gold!';
    w.gold -= 10; ctx.combatSys.heal(player, 10);
    return 'Potion: +10 HP (-10 gold).';
  }
  return 'Unknown item.';
}

// ─────────────────────────────────────────────────────────────────────────
// CardPlay — 'playCard'(index) applies a card; 'endTurn' advances
// ─────────────────────────────────────────────────────────────────────────
export const CardPlayState: GS = {
  name: S.CardPlay,
  onEnter(ctx) {
    ctx.bus.emit('hud:refresh', {});
  },
  onEvent(ctx, m, event, payload) {
    if (event === 'playCard') {
      const idx = payload as number;
      playCard(ctx, idx);
      ctx.bus.emit('hud:refresh', {});
      if (ctx.checkWin()) { m.transition(S.GameOver); return; }
    } else if (event === 'endTurn') {
      m.transition(S.EndTurn);
    }
  },
};

export function playCard(ctx: GameContext, handIndex: number): string {
  const player = ctx.current;
  const hand = Access.hand(player).cards;
  if (handIndex < 0 || handIndex >= hand.length) return 'Invalid card.';
  const card = hand.splice(handIndex, 1)[0];
  ctx.deckSys.discardCard(card);

  const mult = Access.id(player).cls === HeroClass.Rogue && isBlackSuit(card.suit) ? 2 : 1;
  const v = card.value * mult;
  const opponent = ctx.players.find((p) => p !== player && isAlive(p)) ?? null;
  const name = Access.id(player).name;
  let log = `${name} plays ${rankLabel(card.rank)}${suitSymbol(card.suit)} — ${card.flavor} `;

  switch (card.effect) {
    case CardEffect.Attack:
      if (opponent) {
        const dealt = ctx.combatSys.damage(opponent, v + effectiveAttack(player) - 3);
        log += `Deals ${dealt} to ${Access.id(opponent).name}.`;
        if (!isAlive(opponent)) ctx.bus.emit('player:died', { playerId: Access.id(opponent).index });
      }
      break;
    case CardEffect.Heal:
      ctx.combatSys.heal(player, v);
      log += `Restores ${v} HP.`;
      break;
    case CardEffect.GainGold:
      Access.wallet(player).gold += v;
      log += `Gains ${v} gold.`;
      break;
    case CardEffect.LoseGold:
      Access.wallet(player).gold = Math.max(0, Access.wallet(player).gold - v);
      log += `Loses ${v} gold.`;
      break;
    case CardEffect.DrawCards:
      ctx.deckSys.dealMany(player, v);
      log += `Draws ${v} card(s).`;
      break;
    case CardEffect.SkipTurn:
      if (opponent) { Access.status(opponent).skipNextTurn = true; log += `${Access.id(opponent).name} skips a turn.`; }
      break;
    case CardEffect.Shield:
      ctx.combatSys.addShield(player, v);
      log += `Shield +${v}.`;
      break;
    case CardEffect.Curse:
      if (opponent) {
        const dealt = ctx.combatSys.damage(opponent, v + Access.stats(opponent).defense);
        log += `${Access.id(opponent).name} loses ${dealt} HP.`;
        if (!isAlive(opponent)) ctx.bus.emit('player:died', { playerId: Access.id(opponent).index });
      }
      break;
    case CardEffect.TeleportForward:
      Access.pos(player).square = (Access.pos(player).square + v) % ctx.board.length;
      log += `Advances ${v} spaces.`;
      break;
    case CardEffect.TeleportBack:
      Access.pos(player).square = (Access.pos(player).square - v + ctx.board.length) % ctx.board.length;
      log += `Retreats ${v} spaces.`;
      break;
  }

  ctx.bus.emit('card:played', { playerId: Access.id(player).index, card });
  ctx.log(log);
  return log;
}

// ─────────────────────────────────────────────────────────────────────────
// EndTurn — Mage draws a bonus card, advance to next living player
// ─────────────────────────────────────────────────────────────────────────
export const EndTurnState: GS = {
  name: S.EndTurn,
  onEnter(ctx, m) {
    const player = ctx.current;
    if (Access.id(player).cls === HeroClass.Mage && isAlive(player)) {
      ctx.deckSys.deal(player);
    }

    if (!ctx.advanceTurn()) {
      ctx.checkWin();
      m.transition(S.GameOver);
      return;
    }

    // Handle skip-turn
    let guard = 0;
    while (Access.status(ctx.current).skipNextTurn && guard < ctx.players.length + 1) {
      Access.status(ctx.current).skipNextTurn = false;
      ctx.log(`${Access.id(ctx.current).name} is stunned and loses their turn!`);
      if (!ctx.advanceTurn()) { ctx.checkWin(); m.transition(S.GameOver); return; }
      guard++;
    }

    ctx.bus.emit('turn:started', { playerId: Access.id(ctx.current).index, round: ctx.round });
    ctx.log(`--- ${Access.id(ctx.current).name}'s turn (Round ${ctx.round}) ---`);
    m.transition(S.Roll);
  },
};

// ─────────────────────────────────────────────────────────────────────────
// GameOver
// ─────────────────────────────────────────────────────────────────────────
export const GameOverState: GS = {
  name: S.GameOver,
  onEnter(ctx) {
    if (ctx.winnerId !== null) {
      ctx.bus.emit('game:over', { winnerId: ctx.winnerId });
      const w = ctx.players[ctx.winnerId];
      ctx.log(`🏆 ${Access.id(w).name} (${Access.id(w).cls}) wins!`);
    }
  },
  onEvent(_ctx, m, event) {
    if (event === 'restart') {
      // The scene rebuilds context; here we just return to selection.
      m.transition(S.ClassSelect);
    }
  },
};

/** Register every state on a machine in one call. */
export function registerAllStates(m: import('../../core/fsm/StateMachine').StateMachine<GameContext>): void {
  m.add(ClassSelectState)
    .add(RollState)
    .add(MovingState)
    .add(SquareEffectState)
    .add(CombatState)
    .add(MarketState)
    .add(CardPlayState)
    .add(EndTurnState)
    .add(GameOverState);
}

// Moving is a thin animation-gate state used by the Phaser layer; in pure
// logic we skip straight through it, so it simply forwards to SquareEffect.
export const MovingState: GS = {
  name: S.Moving,
  onEnter(_ctx, m) {
    m.transition(S.SquareEffect);
  },
};
