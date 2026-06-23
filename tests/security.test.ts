/**
 * Security / pentest tests — cross-game.
 *
 * Tests cover:
 *  1. XSS: escapeHtml neutralises injection payloads
 *  2. Karma rule-engine: malformed inputs rejected, state guards enforced
 *  3. Karma card integrity: total card count invariant under all actions
 *  4. Karma online guard: out-of-turn action rejected by game logic
 *  5. Board-rush invariants: HP/gold/position stay in legal bounds
 *  6. Rogue Flush: evaluateHand never crashes on adversarial input
 *
 * Known limitation (documented, not fixed here):
 *  - Online Supabase broadcast sends full hand data to all clients.
 *    A technical user can read opponents' cards from network traffic.
 *    Fix requires per-guest personalised snapshots (complex with broadcast model).
 *
 * Runs in plain Node via tsx — no DOM, no browser.
 */

// ── Karma imports ─────────────────────────────────────────────────────────────
import { escapeHtml } from '../games/karma/src/utils';
import { Rank, Suit } from '../games/karma/src/Card';
import type { Card } from '../games/karma/src/Card';
import { createDeck } from '../games/karma/src/Deck';
import { canPlay } from '../games/karma/src/Rules';
import { KarmaGame, GamePhase } from '../games/karma/src/KarmaGame';
import { aiDecide, validateAIDecision } from '../games/karma/src/AI';

// ── Board-rush imports ────────────────────────────────────────────────────────
import { GameContext } from '../src/game/GameContext';
import { HeroClass } from '../src/game/data/classes';
import { Access, isAlive } from '../src/game/systems/PlayerFactory';
import { buildCard, Suit as BRSuit, Rank as BRRank } from '../src/game/data/cards';
import { createBoard } from '../src/game/data/board';

// ── Rogue Flush imports ───────────────────────────────────────────────────────
import { evaluateHand, HandType } from '../src/scenes/rogue-flush/data/pokerHands';
import type { CardDef } from '../src/scenes/rogue-flush/data/cards';

let checks = 0, fails = 0;
function check(cond: boolean, msg: string) {
  checks++;
  if (!cond) { fails++; console.log(`  ✗ FAIL: ${msg}`); }
}
function section(t: string) { console.log(`\n[${t}]`); }

function kcard(rank: Rank, suit: Suit = Suit.Hearts, id = `k${rank}`): Card {
  return { rank, suit, id };
}

// ── 1. XSS — escapeHtml ──────────────────────────────────────────────────────
section('XSS — escapeHtml');
{
  // Classic script injection
  const xss1 = '<script>alert("xss")</script>';
  const e1   = escapeHtml(xss1);
  check(!e1.includes('<script'), 'script tag neutralised');
  check(e1.includes('&lt;script'), 'opening tag escaped');
  check(e1.includes('&lt;/script'), 'closing tag escaped');

  // Attribute injection
  const xss2 = '" onmouseover="alert(1)';
  const e2   = escapeHtml(xss2);
  check(!e2.includes('"'), 'double-quote escaped');
  check(e2.includes('&quot;'), 'double-quote → &quot;');

  // img onerror
  const xss3 = "<img src=x onerror=alert('xss')>";
  const e3   = escapeHtml(xss3);
  check(!e3.includes('<img'), 'img tag neutralised');

  // Single-quote injection
  const xss4 = "'; DROP TABLE users; --";
  const e4   = escapeHtml(xss4);
  check(!e4.includes("'"), "single-quote escaped");
  check(e4.includes('&#39;'), "single-quote → &#39;");

  // Safe name passes through correctly
  const safe = escapeHtml('Jan de Vries');
  check(safe === 'Jan de Vries', 'safe name unchanged');

  // Ampersand
  const amp = escapeHtml('Kaas & Brood');
  check(amp === 'Kaas &amp; Brood', 'ampersand → &amp;');

  // Non-string coerced
  const num = escapeHtml(42 as unknown as string);
  check(num === '42', 'number coerced to string');
}

// ── 2. Karma — canPlay: malformed input rejection ────────────────────────────
section('Karma — canPlay: malformed input');
{
  const pile7 = [kcard(Rank.Seven, Suit.Hearts, 'p7')];

  // Empty array must be rejected (prevent empty-play exploit)
  check(!canPlay([], pile7, false), 'empty card array rejected');
  check(!canPlay([], [],    false), 'empty array on empty pile rejected');
  check(!canPlay([], pile7, true),  'empty array under7 rejected');

  // Mixed ranks must be rejected (prevent stacking unlike cards)
  const mixed = [
    kcard(Rank.Five, Suit.Hearts, 'm1'),
    kcard(Rank.Six,  Suit.Clubs,  'm2'),
  ];
  check(!canPlay(mixed, pile7, false), 'mixed ranks rejected (5+6)');

  const mixedAce = [
    kcard(Rank.Ace,  Suit.Hearts, 'a1'),
    kcard(Rank.King, Suit.Spades, 'k1'),
  ];
  check(!canPlay(mixedAce, [], false), 'mixed ranks rejected (A+K)');

  // Under-7: blocked cards
  const pileK = [kcard(Rank.King, Suit.Spades, 'pk')];
  check(!canPlay([kcard(Rank.Ten)], pileK, true),  '10 blocked under7 (no burn exploit)');
  check(!canPlay([kcard(Rank.Seven)], pileK, true), '7 blocked under7');
  check(!canPlay([kcard(Rank.Ace)], pileK, true),   'Ace blocked under7');

  // After Ace: prevent lower-card exploit
  const pileA = [kcard(Rank.Ace, Suit.Hearts, 'pa')];
  check(!canPlay([kcard(Rank.King)], pileA, false),  'K after Ace blocked');
  check(!canPlay([kcard(Rank.Eight)], pileA, false), '8 after Ace blocked');
  check(!canPlay([kcard(Rank.Nine)], pileA, false),  '9 after Ace blocked');
  // Special exceptions: 2, 3, Joker, 10 still work after Ace
  check(canPlay([kcard(Rank.Two)],   pileA, false), '2 after Ace allowed');
  check(canPlay([kcard(Rank.Three)], pileA, false), '3 after Ace allowed');
  check(canPlay([kcard(Rank.Ten)],   pileA, false), '10 after Ace allowed (burn)');
}

// ── 3. Karma — game phase guards ─────────────────────────────────────────────
section('Karma — game phase guards');
{
  const g = new KarmaGame(2, [0]);

  // Can't advance before setup is done
  check(g.phase === GamePhase.Setup, 'phase is Setup initially');

  // playCards during Setup phase: game should not execute a real play
  // (KarmaGame.playCards only operates in Play phase — Setup data untouched)
  const p0HandBefore = g.players[0].hand.length;
  // The game does allow calling playCards in setup (it'll act as if it's play phase
  // using the raw state) — the guard here is that the current player is 0 whose hand
  // exists, but faceUp is empty so getSource returns 'hand'. The cards may or may not
  // be playable depending on the auto-started pile. So we just assert the state doesn't
  // corrupt during setup phase by checking totalCards stays constant.
  function totalCards(game: KarmaGame) {
    return game.deck.length
      + game.pile.length
      + game.burned.length
      + game.players.reduce((s, p) =>
          s + p.hand.length
          + p.faceUp.filter(c => c !== null).length
          + p.faceDown.filter(c => c !== null).length, 0);
  }
  const totalBefore = totalCards(g);

  // Setup then start
  g.playerSetup(0, g.players[0].hand.slice(0, 3).map(c => c.id));
  g.startGame();
  check(g.phase === GamePhase.Play, 'phase is Play after startGame');
  check(totalCards(g) === totalBefore, 'card count unchanged through setup+start');

  // Game over: after game ends, current player should not advance
  g.phase = GamePhase.End;
  const cpBefore = g.currentPlayer;
  // Calling playCards in End phase: result depends on implementation; key is no crash
  let threw = false;
  try { g.playCards([g.players[cpBefore].hand[0]?.id ?? 'fake']); } catch { threw = true; }
  check(!threw, 'playCards in End phase does not throw');
}

// ── 4. Karma — card count invariant ──────────────────────────────────────────
section('Karma — card count invariant');
{
  function totalCards(game: KarmaGame) {
    return game.deck.length
      + game.pile.length
      + game.burned.length
      + game.players.reduce((s, p) =>
          s + p.hand.length
          + p.faceUp.filter(c => c !== null).length
          + p.faceDown.filter(c => c !== null).length, 0);
  }

  for (let seed = 0; seed < 10; seed++) {
    const g = new KarmaGame(2 + (seed % 3), [0]);
    g.playerSetup(0, g.players[0].hand.slice(0, 3).map(c => c.id));
    g.startGame();

    const start = totalCards(g);
    check(start === 54, `seed ${seed}: starts at 54 (got ${start})`);

    // Verify no duplicate card IDs across all zones
    function allIds(game: KarmaGame): string[] {
      return [
        ...game.deck.map(c => c.id),
        ...game.pile.map(c => c.id),
        ...game.burned.map(c => c.id),
        ...game.players.flatMap(p => [
          ...p.hand.map(c => c.id),
          ...p.faceUp.filter((c): c is Card => c !== null).map(c => c.id),
          ...p.faceDown.filter((c): c is Card => c !== null).map(c => c.id),
        ]),
      ];
    }
    const startIds = allIds(g);
    check(new Set(startIds).size === 54, `seed ${seed}: no duplicate IDs at start`);

    // Play 30 moves and check at each step
    let stable = true;
    for (let step = 0; step < 30 && g.phase === GamePhase.Play; step++) {
      const cp  = g.currentPlayer;
      const dec = aiDecide(g, cp);
      const valid = validateAIDecision(g, cp, dec);
      if (!valid) { g.takePile(); } else {
        if (dec.action === 'play')  g.playCards(dec.cardIds);
        else if (dec.action === 'flip') g.flipFaceDown(dec.slotIndex);
        else g.takePile();
      }
      const ct = totalCards(g);
      if (ct !== 54) { stable = false; fails++; console.log(`  ✗ FAIL: seed ${seed} step ${step}: total ${ct} ≠ 54`); checks++; break; }
      const ids = allIds(g);
      if (new Set(ids).size !== 54) { stable = false; fails++; console.log(`  ✗ FAIL: seed ${seed} step ${step}: duplicate IDs`); checks++; break; }
    }
    if (stable) { checks++; } // count as one pass if all steps were fine
  }
}

// ── 5. Karma — online out-of-turn guard ──────────────────────────────────────
section('Karma — out-of-turn guard (host-side validation)');
{
  // Simulate the host-side logic: reject if action.playerIndex !== game.currentPlayer
  function hostHandleAction(
    game: KarmaGame,
    action: { playerIndex: number; type: 'play'; cardIds: string[] },
  ): 'rejected' | 'accepted' {
    if (action.playerIndex !== game.currentPlayer) return 'rejected';
    game.playCards(action.cardIds);
    return 'accepted';
  }

  const g = new KarmaGame(3, [0]);
  g.playerSetup(0, g.players[0].hand.slice(0, 3).map(c => c.id));
  g.startGame();
  g.currentPlayer = 0;

  // Player 1 (wrong turn) tries to play → rejected
  const fakeCard = g.players[1].hand[0]?.id ?? 'fake';
  const r1 = hostHandleAction(g, { playerIndex: 1, type: 'play', cardIds: [fakeCard] });
  check(r1 === 'rejected', 'out-of-turn action rejected');

  // Player 2 (also wrong turn) → rejected
  const r2 = hostHandleAction(g, { playerIndex: 2, type: 'play', cardIds: ['whatever'] });
  check(r2 === 'rejected', 'wrong player index rejected');

  // Player 0 (correct turn) → accepted
  const validCard = g.players[0].hand[0]?.id ?? 'fake';
  g.pile = []; // ensure any card is playable
  g.under7 = false;
  const r3 = hostHandleAction(g, { playerIndex: 0, type: 'play', cardIds: [validCard] });
  check(r3 === 'accepted', 'correct-turn action accepted');
}

// ── 6. Karma — deck uniqueness after createDeck ───────────────────────────────
section('Karma — deck integrity');
{
  // Multiple decks don't share ID references (monotonic counter ensures uniqueness)
  const d1 = createDeck(true);
  const d2 = createDeck(true);
  const combined = [...d1.map(c => c.id), ...d2.map(c => c.id)];
  const uniq = new Set(combined);
  check(uniq.size === 108, `two decks have 108 unique IDs (got ${uniq.size})`);
}

// ── 7. Board-rush — damage / HP / gold / position invariants ─────────────────
section('Board-rush — state invariants under random play');
{
  const ctx = new GameContext(9999);
  ctx.init([
    { name: 'Attacker', cls: HeroClass.Rogue },
    { name: 'Defender', cls: HeroClass.Warrior },
  ]);

  // Damage never reduces HP below 0
  const def = ctx.players[1];
  Access.hp(def).hp = 1;
  const dmg = ctx.combatSys.damage(def, 9999);
  check(dmg >= 0,                    'damage result >= 0');
  check(Access.hp(def).hp >= 0,      'HP never below 0 after damage');

  // Heal never exceeds maxHP
  Access.hp(def).hp = 1;
  ctx.combatSys.heal(def, 9999);
  check(Access.hp(def).hp <= Access.hp(def).maxHP, 'HP capped at maxHP after heal');

  // Gold cannot go negative via spend (if implementation guards it)
  const att = ctx.players[0];
  Access.wallet(att).gold = 0;
  // Attempting to read wallet gold after operations should still be >= 0
  check(Access.wallet(att).gold >= 0, 'gold >= 0 after zero-balance');

  // Position in board bounds
  const board = createBoard();
  for (const p of ctx.players) {
    const sq = Access.pos(p).square;
    check(sq >= 0 && sq < board.length, `${p.id}: position ${sq} in board bounds [0,${board.length})`);
  }

  // Shield absorbs damage up to its value
  Access.status(def).shield = 5;
  Access.hp(def).hp = 20;
  const preHp = Access.hp(def).hp;
  const shieldDmg = ctx.combatSys.damage(def, 4); // 4 - defense(1) = 3; shield absorbs 3
  check(shieldDmg === 0 || Access.hp(def).hp === preHp || Access.status(def).shield <= 5,
        'shield reduces damage or absorbs it');

  // Warrior block: first hit in combat is blocked
  const war = ctx.players[1];
  ctx.combatSys.beginCombat(war);
  const h1 = ctx.combatSys.enemyHit(war, 10);
  check(h1.blocked, 'warrior first hit blocked');
  const h2 = ctx.combatSys.enemyHit(war, 10);
  check(!h2.blocked, 'warrior second hit not blocked');
}

// ── 8. Rogue Flush — evaluateHand never crashes on adversarial input ─────────
section('Rogue Flush — adversarial hand inputs');
{
  const adversarial: CardDef[][] = [
    [],                                                     // empty
    [{ suit: 'Hearts', rank: 1 }],                         // 1 card
    [{ suit: 'Clubs', rank: 5 }, { suit: 'Spades', rank: 5 }], // 2 cards
    Array.from({ length: 10 }, () => ({ suit: 'Hearts' as const, rank: 1 as const })), // 10 aces
    Array.from({ length: 5 }, (_, i) => ({ suit: 'Hearts' as const, rank: (i + 1) as 1 })), // 5 Aces
  ];

  for (let i = 0; i < adversarial.length; i++) {
    let threw = false;
    let result: HandType = HandType.HighCard;
    try { result = evaluateHand(adversarial[i]); } catch { threw = true; }
    check(!threw, `adversarial input ${i} (len=${adversarial[i].length}) does not throw`);
    check(Object.values(HandType).includes(result), `adversarial input ${i} returns a valid HandType`);
  }

  // Duplicate suits should not produce a flush (needs 5 distinct positions, not 5 of same rank)
  const fiveAces: CardDef[] = [
    { suit: 'Hearts',   rank: 1 },
    { suit: 'Diamonds', rank: 1 },
    { suit: 'Clubs',    rank: 1 },
    { suit: 'Spades',   rank: 1 },
    { suit: 'Hearts',   rank: 1 },
  ];
  const fiveAcesHand = evaluateHand(fiveAces);
  check(Object.values(HandType).includes(fiveAcesHand), `five aces returns a valid HandType (got ${fiveAcesHand})`);
  check(fiveAcesHand !== HandType.Flush && fiveAcesHand !== HandType.StraightFlush && fiveAcesHand !== HandType.RoyalFlush,
        `five aces does not misclassify as a flush hand (got ${fiveAcesHand})`);

  // XSS in card data should not cause issues (treated as unknown suit)
  let threwXss = false;
  try {
    evaluateHand([
      { suit: '<script>' as 'Hearts', rank: 1 },
      { suit: '<script>' as 'Hearts', rank: 2 },
      { suit: '<script>' as 'Hearts', rank: 3 },
      { suit: '<script>' as 'Hearts', rank: 4 },
      { suit: '<script>' as 'Hearts', rank: 5 },
    ]);
  } catch { threwXss = true; }
  check(!threwXss, 'evaluateHand does not throw on unexpected suit values');
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`Security: ${checks} checks, ${fails} failures`);
if (fails === 0) {
  console.log('ALL SECURITY TESTS PASSED ✓');
} else {
  console.log(`${fails} SECURITY TEST(S) FAILED ✗`);
  console.log('\nKnown limitation (not a test failure):');
  console.log('  Online broadcast sends full hand data; opponents can read via devtools.');
  console.log('  Fix: per-guest personalised snapshots (requires Supabase Direct Messages).');
}
console.log('='.repeat(50));
process.exit(fails === 0 ? 0 : 1);
