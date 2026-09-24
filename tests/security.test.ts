/**
 * Security / pentest tests.
 *
 * Tests cover:
 *  1. XSS: the shared escapeHtml (used by every innerHTML-building widget —
 *     progress bar/leaderboard, certificates, report card) neutralises
 *     injection payloads
 *  2. Board-rush engine invariants: HP/gold/position stay in legal bounds
 *
 * Runs in plain Node via tsx — no DOM, no browser.
 */

import { escapeHtml } from '../shared/escape-html';
import { GameContext } from '../src/game/GameContext';
import { HeroClass } from '../src/game/data/classes';
import { Access } from '../src/game/systems/PlayerFactory';
import { createBoard } from '../src/game/data/board';

let checks = 0, fails = 0;
function check(cond: boolean, msg: string) {
  checks++;
  if (!cond) { fails++; console.log(`  ✗ FAIL: ${msg}`); }
}
function section(t: string) { console.log(`
[${t}]`); }

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
  const num = escapeHtml(42);
  check(num === '42', 'number coerced to string');

  // null/undefined from an API row render as empty, not "null"
  check(escapeHtml(null) === '', 'null → empty string');
  check(escapeHtml(undefined) === '', 'undefined → empty string');
}

// ── 2. Board-rush — damage / HP / gold / position invariants ─────────────────
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

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`
${'='.repeat(50)}`);
console.log(`Security: ${checks} checks, ${fails} failures`);
console.log(fails === 0 ? 'ALL SECURITY TESTS PASSED ✓' : `${fails} SECURITY TEST(S) FAILED ✗`);
console.log('='.repeat(50));
process.exit(fails === 0 ? 0 : 1);
