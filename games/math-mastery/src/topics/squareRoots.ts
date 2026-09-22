import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { buildNumericChoices, randInt, shuffle } from '../choices';

export const TOTAL_QUESTIONS = 10;

function isPerfectSquare(n: number): boolean {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

export function generateQuestion(index: number): QuizQuestion {
  // First half: exact roots of perfect squares. Second half: estimate the
  // root of a number that isn't one — genuinely harder, since it asks for
  // number sense (nearest perfect squares) rather than a memorized fact.
  if (index < 5) {
    const n = randInt(2, 20);
    const num = n * n;
    const { choices, correctIndex } = buildNumericChoices(n, [n + 1, n - 1, n + 2, n - 2, n + 3]);
    return { prompt: `√${num} = ?`, choices, correctIndex };
  }

  let num = randInt(2, 399);
  while (isPerfectSquare(num)) num = randInt(2, 399);
  const correct = Math.round(Math.sqrt(num));
  const { choices, correctIndex } = buildNumericChoices(correct, [
    correct + 1,
    correct - 1,
    correct + 2,
    correct - 2,
  ]);
  return {
    prompt: `√${num} ≈ ?`,
    sub: 'Trick: find the two perfect squares it sits between',
    choices,
    correctIndex,
  };
}

// Exact roots only (2..25) — unambiguous pairs for Match, and an ordering
// for Sequence that still requires knowing the actual root, not a shortcut.
const ROOT_RANGE = Array.from({ length: 24 }, (_, i) => i + 2);

export function generateMatchItems(pairs: number): MatchItem[] {
  return shuffle(ROOT_RANGE)
    .slice(0, pairs)
    .map((n) => ({ id: n, sideA: `√${n * n}`, sideB: String(n) }));
}

export function generateSequenceRound(count: number): SequenceItem[] {
  const ns = shuffle(ROOT_RANGE).slice(0, count).sort((a, b) => a - b);
  return ns.map((n, i) => ({ id: i, label: `√${n * n}` }));
}
