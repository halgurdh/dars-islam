/**
 * Pure-logic verification. Runs in plain Node via tsx/esbuild — no Phaser,
 * no DOM. Exercises the FSM, ECS components, systems and full simulated
 * games, then asserts invariants.
 */
import { StateMachine } from '../src/core/fsm/StateMachine';
import { GameContext } from '../src/game/GameContext';
import { registerAllStates, playCard } from '../src/game/states/gameStates';
import { S } from '../src/game/states/stateNames';
import { HeroClass, CLASS_DEFS } from '../src/game/data/classes';
import { fullDeck, buildCard, Suit, Rank, CardEffect, cardAsset } from '../src/game/data/cards';
import { createBoard, SquareType } from '../src/game/data/board';
import { createPlayer, Access, isAlive } from '../src/game/systems/PlayerFactory';
import { Entity, _resetEntityIds } from '../src/core/ecs/Entity';
import { World } from '../src/core/ecs/World';
import { EventBus } from '../src/core/events/EventBus';

let checks = 0, fails = 0;
function check(cond: boolean, msg: string) {
  checks++;
  if (!cond) { fails++; console.log(`  ✗ FAIL: ${msg}`); }
}
function section(t: string) { console.log(`\n[${t}]`); }

// ── 1. FSM core ─────────────────────────────────────────────────────────
section('FSM core');
{
  interface Ctx { v: number }
  const ctx: Ctx = { v: 0 };
  const m = new StateMachine<Ctx>(ctx);
  let entered = '';
  m.add({ name: 'a', onEnter: (c) => { c.v = 1; entered = 'a'; }, onEvent: (_c, mm, e) => { if (e === 'go') mm.transition('b'); } });
  m.add({ name: 'b', onEnter: (c) => { c.v = 2; entered = 'b'; } });
  m.start('a');
  check(m.is('a'), 'starts in a');
  check(ctx.v === 1, 'onEnter ran for a');
  m.send('go');
  check(m.is('b'), 'transitioned to b on event');
  check(entered === 'b' && ctx.v === 2, 'onEnter ran for b');
  let threw = false;
  try { m.transition('nope'); } catch { threw = true; }
  check(threw, 'unknown state throws');
}

// ── 2. ECS ──────────────────────────────────────────────────────────────
section('ECS');
{
  _resetEntityIds();
  const w = new World();
  const e = w.createEntity().tag('player').add({ type: 'foo' } as any);
  check(e.has('foo'), 'entity has component');
  check(e.hasTag('player'), 'entity has tag');
  check(w.byTag('player').length === 1, 'world finds by tag');
  check(w.first('foo') === e, 'world.first finds component owner');
  let threw = false;
  try { e.require('missing'); } catch { threw = true; }
  check(threw, 'require throws on missing component');
}

// ── 3. Event bus ──────────────────────────────────────────────────────────
section('Event bus');
{
  const bus = new EventBus<{ ping: { n: number } }>();
  let sum = 0;
  const off = bus.on('ping', (p) => { sum += p.n; });
  bus.emit('ping', { n: 5 });
  bus.emit('ping', { n: 3 });
  check(sum === 8, 'handler receives all emits');
  off();
  bus.emit('ping', { n: 100 });
  check(sum === 8, 'unsubscribe works');
  let onceCount = 0;
  bus.once('ping', () => onceCount++);
  bus.emit('ping', { n: 1 });
  bus.emit('ping', { n: 1 });
  check(onceCount === 1, 'once fires exactly once');
}

// ── 4. Card data ──────────────────────────────────────────────────────────
section('Card data');
{
  const deck = fullDeck();
  check(deck.length === 52, `deck has 52 (got ${deck.length})`);
  const uniq = new Set(deck.map((c) => `${c.suit}-${c.rank}`));
  check(uniq.size === 52, 'all cards unique');
  check(cardAsset(buildCard(Suit.Hearts, Rank.Ten)) === 'cardHearts10.png', '10 asset name');
  check(cardAsset(buildCard(Suit.Clubs, Rank.Jack)) === 'cardClubsJ.png', 'Jack asset name');
  check(buildCard(Suit.Spades, Rank.Ace).effect === CardEffect.Curse, 'A♠ = Curse');
  check(buildCard(Suit.Hearts, Rank.Ace).effect === CardEffect.Shield, 'A♥ = Shield');
  check(buildCard(Suit.Diamonds, Rank.Ace).value === 20, 'A♦ = +20 gold');
  check(buildCard(Suit.Clubs, Rank.Ace).effect === CardEffect.TeleportForward, 'A♣ = teleport');
  deck.forEach((c) => check(!!c.flavor, `${c.suit} ${c.rank} has flavor`));
}

// ── 5. Board ────────────────────────────────────────────────────────────────
section('Board');
{
  const b = createBoard();
  check(b.length === 28, `28 squares (got ${b.length})`);
  check(b.length % 4 === 0, 'divisible by 4');
  check(b[0].type === SquareType.Start, 'square 0 is Start');
  const affinities = new Set(b.filter((s) => s.affinity).map((s) => s.affinity));
  check(affinities.size === 4, 'all 4 classes have bonus squares');
}

// ── 6. Player factory + components ─────────────────────────────────────────
section('Player components');
{
  const w = createPlayer(0, 'W', HeroClass.Warrior);
  check(Access.hp(w).hp === 30, 'warrior 30 HP');
  check(Access.wallet(w).gold === 50, 'starts 50 gold');
  check(isAlive(w), 'starts alive');

  const ctx = new GameContext(1);
  ctx.init([{ name: 'W', cls: HeroClass.Warrior }, { name: 'M', cls: HeroClass.Mage }]);

  // Damage mitigation
  const dmg = ctx.combatSys.damage(ctx.players[1], 10); // mage def 1 → 9
  check(dmg === 9, `mage takes 10-1=9 (got ${dmg})`);

  // Min 1 damage
  const tank = createPlayer(9, 'T', HeroClass.Warrior);
  Access.stats(tank).defense = 100;
  check(ctx.combatSys.damage(tank, 5) === 1, 'minimum 1 damage');

  // Shield absorbs
  const m = ctx.players[1];
  Access.status(m).shield = 10;
  const before = Access.hp(m).hp;
  const sd = ctx.combatSys.damage(m, 5); // 5-1=4, shield absorbs all 4
  check(sd === 0 && Access.status(m).shield === 6, `shield absorbs (dmg ${sd}, shield ${Access.status(m).shield})`);
  check(Access.hp(m).hp === before, 'HP unchanged when fully shielded');

  // Heal cap
  Access.hp(w).hp = 5;
  ctx.combatSys.heal(w, 100);
  check(Access.hp(w).hp === 30, 'heal capped at max');

  // Warrior block
  ctx.combatSys.beginCombat(w);
  const h1 = ctx.combatSys.enemyHit(w, 10);
  check(h1.blocked, 'warrior blocks first hit');
  const h2 = ctx.combatSys.enemyHit(w, 10);
  check(!h2.blocked, 'warrior does not block second hit');
}

// ── 7. Deck system ──────────────────────────────────────────────────────────
section('Deck system');
{
  const ctx = new GameContext(2);
  ctx.init([{ name: 'A', cls: HeroClass.Warrior }, { name: 'B', cls: HeroClass.Mage }]);
  check(ctx.deckSys.deckSize === 52, 'deck full at start');
  const p = ctx.players[0];
  // Draw 50, discard them all, then draw 10 more — forces a reshuffle of the discard pile.
  for (let i = 0; i < 50; i++) ctx.deckSys.deal(p);
  const drawn = Access.hand(p).cards.splice(0, 50);
  drawn.forEach((c) => ctx.deckSys.discardCard(c));
  check(ctx.deckSys.deckSize === 2 && ctx.deckSys.discardSize === 50, 'deck low, discard full before reshuffle');
  for (let i = 0; i < 10; i++) ctx.deckSys.deal(p); // 2 left + reshuffle 50 → 8 more
  check(Access.hand(p).cards.length === 10, `reshuffles discard to keep dealing (got ${Access.hand(p).cards.length})`);
}

// ── 8. Card play effects ────────────────────────────────────────────────────
section('Card play');
{
  const ctx = new GameContext(3);
  ctx.init([{ name: 'A', cls: HeroClass.Warrior }, { name: 'B', cls: HeroClass.Mage }]);
  const p = ctx.current, opp = ctx.players[1];

  Access.hand(p).cards = [buildCard(Suit.Hearts, Rank.Five)];
  Access.hp(p).hp = 10;
  playCard(ctx, 0);
  check(Access.hp(p).hp === 15, `heal card works (got ${Access.hp(p).hp})`);

  Access.hand(p).cards = [buildCard(Suit.Diamonds, Rank.Ace)];
  const g = Access.wallet(p).gold;
  playCard(ctx, 0);
  check(Access.wallet(p).gold === g + 20, 'gold card +20');

  Access.hand(p).cards = [buildCard(Suit.Clubs, Rank.Ace)];
  const pos = Access.pos(p).square;
  playCard(ctx, 0);
  check(Access.pos(p).square === (pos + 6) % ctx.board.length, 'teleport +6');

  Access.hand(p).cards = [buildCard(Suit.Spades, Rank.Nine)];
  Access.stats(opp).defense = 0;
  const oh = Access.hp(opp).hp;
  playCard(ctx, 0);
  check(Access.hp(opp).hp < oh, 'attack damages opponent');

  // Rogue doubling
  const rctx = new GameContext(4);
  rctx.init([{ name: 'R', cls: HeroClass.Rogue }, { name: 'V', cls: HeroClass.Warrior }]);
  const v = rctx.players[1];
  Access.stats(v).defense = 0;
  Access.hand(rctx.current).cards = [buildCard(Suit.Spades, Rank.Five)]; // val 6 → 12
  const vh = Access.hp(v).hp;
  playCard(rctx, 0);
  check(vh - Access.hp(v).hp >= 12, `rogue doubles black suit (lost ${vh - Access.hp(v).hp})`);

  check(playCard(ctx, 99).includes('Invalid'), 'invalid index handled');
}

// ── 9. Full FSM playthroughs ────────────────────────────────────────────────
section('Full FSM playthroughs');
{
  let completed = 0, maxSteps = 0;
  const classes = [HeroClass.Warrior, HeroClass.Mage, HeroClass.Rogue, HeroClass.Cleric];

  for (let game = 0; game < 60; game++) {
    const ctx = new GameContext(game + 100);
    const m = new StateMachine<GameContext>(ctx);
    registerAllStates(m);

    const n = 2 + (game % 3);
    const picks = Array.from({ length: n }, (_, i) => ({ name: `P${i}`, cls: classes[i % 4] }));

    m.start(S.ClassSelect);
    m.send('players:chosen', picks);

    let steps = 0;
    const rng = ctx.rng;
    while (!m.is(S.GameOver) && steps < 5000) {
      steps++;
      if (m.is(S.Roll)) {
        m.send('roll');
      } else if (m.is(S.Combat)) {
        // fight or occasionally flee
        if (rng.next() < 0.85) m.send('attack');
        else m.send('flee');
      } else if (m.is(S.Market)) {
        if (rng.next() < 0.5) m.send('buy', rng.next() < 0.5 ? 'attack' : 'potion');
        else m.send('leave');
      } else if (m.is(S.CardPlay)) {
        const hand = Access.hand(ctx.current).cards;
        if (hand.length > 0 && rng.next() < 0.6) m.send('playCard', rng.int(0, hand.length - 1));
        else m.send('endTurn');
      } else {
        // Moving / SquareEffect / EndTurn auto-advance via onEnter; nudge if stuck
        m.send('noop');
        // these states transition in onEnter, so if we're here we've stalled — break safeguard
        if (m.is(S.Moving) || m.is(S.SquareEffect) || m.is(S.EndTurn)) break;
      }
    }

    if (m.is(S.GameOver)) completed++;
    maxSteps = Math.max(maxSteps, steps);

    // Invariants
    for (const p of ctx.players) {
      check(Access.hp(p).hp >= 0, `g${game}: HP >= 0`);
      check(Access.hp(p).hp <= Access.hp(p).maxHP, `g${game}: HP <= max`);
      check(Access.wallet(p).gold >= 0, `g${game}: gold >= 0`);
      const sq = Access.pos(p).square;
      check(sq >= 0 && sq < ctx.board.length, `g${game}: pos in range`);
    }
  }
  check(completed >= 50, `most games reach a winner (${completed}/60)`);
  console.log(`  → ${completed}/60 games completed, max ${maxSteps} steps`);
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`${checks} checks, ${fails} failures`);
console.log(fails === 0 ? 'ALL TESTS PASSED ✓' : `${fails} TEST(S) FAILED ✗`);
console.log('='.repeat(50));
process.exit(fails === 0 ? 0 : 1);
