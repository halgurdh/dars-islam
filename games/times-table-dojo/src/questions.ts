import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';

export interface Difficulty {
  id: string;
  totalQuestions: number;
  maxTable: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', totalQuestions: 10, maxTable: 5 },
  { id: 'medium', totalQuestions: 10, maxTable: 9 },
  { id: 'hard', totalQuestions: 12, maxTable: 12 },
];

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Distractors mirror real multiplication mistakes: off by one row/column of
// the table, or a small arithmetic slip — not just random noise.
function buildChoices(a: number, b: number): { choices: string[]; correctIndex: number } {
  const correct = a * b;
  const candidates = shuffle([
    a * (b - 1),
    a * (b + 1),
    (a - 1) * b,
    (a + 1) * b,
    correct + 1,
    correct - 1,
    correct + a,
    correct - a,
  ]);

  const set = new Set<number>([correct]);
  for (const v of candidates) {
    if (set.size >= 4) break;
    if (v > 0 && !set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size * 2);

  const arr = shuffle([...set]);
  return { choices: arr.map(String), correctIndex: arr.indexOf(correct) };
}

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  const a = randInt(1, difficulty.maxTable);
  const b = randInt(1, difficulty.maxTable);
  const { choices, correctIndex } = buildChoices(a, b);
  return {
    prompt: `${a} × ${b} = ?`,
    choices,
    correctIndex,
  };
}

// Distinct products, so Match never shows two different card pairs with the
// same answer (which would look like a second valid match).
function distinctProblems(count: number, maxTable: number): { a: number; b: number; product: number }[] {
  const used = new Set<number>();
  const problems: { a: number; b: number; product: number }[] = [];
  while (problems.length < count) {
    const a = randInt(1, maxTable);
    const b = randInt(1, maxTable);
    const product = a * b;
    if (used.has(product)) continue;
    used.add(product);
    problems.push({ a, b, product });
  }
  return problems;
}

export function generateMatchItems(pairs: number, maxTable: number): MatchItem[] {
  return distinctProblems(pairs, maxTable).map((p, i) => ({
    id: i,
    sideA: `${p.a} × ${p.b}`,
    sideB: String(p.product),
  }));
}

// Sorting problems by their answer is the whole challenge — you have to
// actually multiply each one out to know where it belongs in the order.
export function generateSequenceRound(count: number, maxTable: number): SequenceItem[] {
  const problems = distinctProblems(count, maxTable).sort((a, b) => a.product - b.product);
  return problems.map((p, i) => ({ id: i, label: `${p.a} × ${p.b}` }));
}
