/**
 * Integration smoke test: drives the StateMachine + GameContext exactly
 * the way the HUD buttons do (machine.send with the same event names and
 * payloads), and asserts the event bus fires the signals the Phaser
 * views rely on. This exercises the real wiring between the presentation
 * API and the logic core without needing a browser/WebGL.
 */
import { GameContext } from '../src/game/GameContext';
import { StateMachine } from '../src/core/fsm/StateMachine';
import { registerAllStates } from '../src/game/states/gameStates';
import { S } from '../src/game/states/stateNames';
import { HeroClass } from '../src/game/data/classes';
import { Access, isAlive } from '../src/game/systems/PlayerFactory';

let checks = 0, fails = 0;
const check = (c: boolean, m: string) => { checks++; if (!c) { fails++; console.log(`  ✗ ${m}`); } };

console.log('[Integration: HUD-driven playthrough]');

const ctx = new GameContext(777);
const machine = new StateMachine<GameContext>(ctx);
registerAllStates(machine);

// Track every event the Phaser views subscribe to.
const seen = new Set<string>();
for (const ev of ['log', 'state:changed', 'dice:rolled', 'player:moved', 'turn:started',
  'combat:started', 'combat:ended', 'card:drawn', 'card:played', 'hud:refresh', 'game:over'] as const) {
  ctx.bus.on(ev, () => seen.add(ev));
}
machine.onTransition = (from, to) => ctx.bus.emit('state:changed', { from, to });

// 1. Class select exactly as HUD does it
machine.start(S.ClassSelect);
check(machine.is(S.ClassSelect), 'starts at ClassSelect');
machine.send('players:chosen', [
  { name: 'Player 1', cls: HeroClass.Warrior },
  { name: 'Player 2', cls: HeroClass.Mage },
  { name: 'Player 3', cls: HeroClass.Rogue },
]);
check(ctx.players.length === 3, '3 players created');
check(machine.is(S.Roll), 'advanced to Roll after class select');

// 2. Drive turns exactly as the buttons would, to completion.
let steps = 0;
while (!machine.is(S.GameOver) && steps < 4000) {
  steps++;
  const phase = machine.currentName;
  if (phase === S.Roll) {
    machine.send('roll');                       // 🎲 Roll Dice button
  } else if (phase === S.Combat) {
    machine.send('attack');                     // ⚔ Attack button
  } else if (phase === S.Market) {
    machine.send('buy', 'potion');              // market button
    machine.send('leave');                      // Leave Market button
  } else if (phase === S.CardPlay) {
    const hand = Access.hand(ctx.current).cards;
    if (hand.length > 0) machine.send('playCard', 0); // clicking a card
    machine.send('endTurn');                    // ⏩ End Turn button
  } else {
    break; // auto-transition states should never leave us stuck here
  }
}

check(machine.is(S.GameOver), `reached GameOver (${steps} steps)`);
check(ctx.winnerId !== null, 'a winner was recorded');
const survivors = ctx.players.filter(isAlive).length;
check(survivors >= 1, 'at least one survivor');

// 3. The Phaser views depend on these events having fired at least once.
for (const ev of ['log', 'state:changed', 'dice:rolled', 'player:moved', 'turn:started', 'hud:refresh', 'game:over']) {
  check(seen.has(ev), `event "${ev}" fired during play`);
}

// 4. Restart path (Play Again button) returns to ClassSelect cleanly.
machine.send('restart');
check(machine.is(S.ClassSelect), 'restart returns to ClassSelect');

console.log(`\n${checks} checks, ${fails} failures`);
console.log(fails === 0 ? 'INTEGRATION PASSED ✓' : 'INTEGRATION FAILED ✗');
process.exit(fails === 0 ? 0 : 1);
