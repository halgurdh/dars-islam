import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { buildNumericChoices, randInt } from '../choices';

export const TOTAL_QUESTIONS = 10;

// Escalates within a single run: warm up on 2-digit×2-digit, then a
// 3-digit×1-digit stretch, then the hardest combination, 3-digit×2-digit.
function pickFactors(index: number): { a: number; b: number } {
  if (index < 4) return { a: randInt(10, 99), b: randInt(10, 99) };
  if (index < 8) return { a: randInt(100, 999), b: randInt(2, 9) };
  return { a: randInt(100, 999), b: randInt(10, 99) };
}

export function generateQuestion(index: number): QuizQuestion {
  const { a, b } = pickFactors(index);
  const correct = a * b;
  const { choices, correctIndex } = buildNumericChoices(correct, [
    a * (b - 1),
    a * (b + 1),
    correct + a,
    correct - a,
    correct + 10,
    correct - 10,
    correct + 100,
    correct - 100,
  ]);
  return { prompt: `${a} × ${b} = ?`, choices, correctIndex };
}

// Match/Sequence both need problems with genuinely distinct products (so no
// two cards/cards ever claim the same answer), generated on the fly rather
// than baked into a static list — same "compute it to know where it goes"
// requirement as the Quiz mode, just without the multiple-choice scaffolding.
function distinctProblems(count: number): { a: number; b: number; correct: number }[] {
  const used = new Set<number>();
  const out: { a: number; b: number; correct: number }[] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 50) {
    attempts++;
    const a = randInt(12, 99);
    const b = randInt(2, 12);
    const correct = a * b;
    if (used.has(correct)) continue;
    used.add(correct);
    out.push({ a, b, correct });
  }
  return out;
}

export function generateMatchItems(pairs: number): MatchItem[] {
  return distinctProblems(pairs).map(({ a, b, correct }) => ({
    id: correct,
    sideA: `${a} × ${b}`,
    sideB: String(correct),
  }));
}

export function generateSequenceRound(count: number): SequenceItem[] {
  const problems = distinctProblems(count).sort((x, y) => x.correct - y.correct);
  return problems.map((p, i) => ({ id: i, label: `${p.a} × ${p.b}` }));
}
