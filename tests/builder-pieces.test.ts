/**
 * Pure-logic verification for shared/builder-pieces.ts's multiple-choice
 * helpers — pickAnswerOptions() and pickRoundFormat(). Runs in plain Node
 * via tsx, no DOM/Phaser involved.
 */
import { pickAnswerOptions, pickRoundFormat } from '../shared/builder-pieces';

let checks = 0, fails = 0;
function check(cond: boolean, msg: string) {
  checks++;
  if (!cond) { fails++; console.log(`  ✗ FAIL: ${msg}`); }
}
function section(t: string) { console.log(`\n[${t}]`); }

section('pickAnswerOptions — normal pool');
{
  const options = pickAnswerOptions('Salah', ['Zakat', 'Sawm', 'Hajj', 'Shahada'], 4);
  check(options.length === 4, 'returns the requested count when the pool is large enough');
  check(options.includes('Salah'), 'always includes the correct answer');
  check(new Set(options).size === options.length, 'no duplicate options');
}

section('pickAnswerOptions — small pool (Pillars-sized: 5 items total)');
{
  // Only 4 "other" answers exist, so a request for 4 options can supply at
  // most 4 total (correct + 3 distractors) — must degrade, not throw/repeat.
  const otherAnswers = ['Zakat', 'Sawm', 'Hajj', 'Shahada'];
  const options = pickAnswerOptions('Salah', otherAnswers, 6);
  check(options.length === 5, 'caps at correct + all available distractors, no repeats');
  check(options.includes('Salah'), 'still includes the correct answer');
  check(new Set(options).size === 5, 'still no duplicates when degrading');
}

section('pickAnswerOptions — no other answers at all');
{
  const options = pickAnswerOptions('OnlyOne', [], 4);
  check(options.length === 1 && options[0] === 'OnlyOne', 'falls back to just the correct answer, does not crash');
}

section('pickAnswerOptions — excludes the correct answer if it appears in the pool');
{
  const options = pickAnswerOptions('Hajj', ['Hajj', 'Zakat', 'Sawm', 'Shahada'], 4);
  check(options.filter((o) => o === 'Hajj').length === 1, 'the correct answer is never duplicated even if present in otherAnswers');
}

section('pickRoundFormat');
{
  const seen = new Set<string>();
  for (let i = 0; i < 200; i++) seen.add(pickRoundFormat(true));
  check(seen.has('build') && seen.has('multipleChoice') && seen.has('listening'), 'all three formats appear over enough draws when listening is allowed');
  check(seen.size === 3, 'never returns anything outside the three known formats');

  const seenNoListen = new Set<string>();
  for (let i = 0; i < 100; i++) seenNoListen.add(pickRoundFormat(false));
  check(!seenNoListen.has('listening'), 'excludes listening when no voice is available');
  check(seenNoListen.has('build') && seenNoListen.has('multipleChoice'), 'still varies between the other two formats');
}

console.log(`\n${checks - fails}/${checks} checks passed.`);
if (fails > 0) process.exit(1);
