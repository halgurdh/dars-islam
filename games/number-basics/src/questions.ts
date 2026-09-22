import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';

export interface Difficulty {
  id: string;
  totalQuestions: number;
  make: () => { a: number; b: number; op: '+' | '−' };
}

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

function buildChoices(correct: number): { choices: string[]; correctIndex: number } {
  const set = new Set<number>([correct]);
  const deltas = shuffle([1, -1, 2, -2, 3, -3, 10, -10, 5, -5]);
  for (const d of deltas) {
    if (set.size >= 4) break;
    const v = correct + d;
    if (v >= 0 && !set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size);
  const arr = shuffle([...set]);
  return { choices: arr.map(String), correctIndex: arr.indexOf(correct) };
}

export const DIFFICULTIES: Difficulty[] = [
  {
    id: 'easy',
    totalQuestions: 10,
    make: () => {
      const a = randInt(0, 9);
      const b = randInt(0, 10 - a);
      return { a, b, op: '+' };
    },
  },
  {
    id: 'medium',
    totalQuestions: 10,
    make: () => {
      const op: '+' | '−' = Math.random() < 0.5 ? '+' : '−';
      if (op === '+') {
        const a = randInt(0, 20);
        const b = randInt(0, 20 - a);
        return { a, b, op };
      }
      const a = randInt(0, 20);
      const b = randInt(0, a);
      return { a, b, op };
    },
  },
  {
    id: 'hard',
    totalQuestions: 12,
    make: () => {
      const op: '+' | '−' = Math.random() < 0.5 ? '+' : '−';
      if (op === '+') {
        const a = randInt(10, 89);
        const b = randInt(0, 100 - a);
        return { a, b, op };
      }
      const a = randInt(10, 99);
      const b = randInt(0, a);
      return { a, b, op };
    },
  },
];

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  const { a, b, op } = difficulty.make();
  const correct = op === '+' ? a + b : a - b;
  const { choices, correctIndex } = buildChoices(correct);
  return {
    prompt: `${a} ${op} ${b} = ?`,
    choices,
    correctIndex,
  };
}

// Distinct answers, so Match never shows two different card pairs that
// happen to land on the same total (which would look like a valid match).
function distinctProblems(difficulty: Difficulty, count: number): { a: number; b: number; op: '+' | '−'; value: number }[] {
  const used = new Set<number>();
  const problems: { a: number; b: number; op: '+' | '−'; value: number }[] = [];
  let attempts = 0;
  while (problems.length < count && attempts < count * 50) {
    attempts++;
    const { a, b, op } = difficulty.make();
    const value = op === '+' ? a + b : a - b;
    if (used.has(value)) continue;
    used.add(value);
    problems.push({ a, b, op, value });
  }
  return problems;
}

export function generateMatchItems(difficulty: Difficulty, pairs: number): MatchItem[] {
  return distinctProblems(difficulty, pairs).map((p, i) => ({
    id: i,
    sideA: `${p.a} ${p.op} ${p.b}`,
    sideB: String(p.value),
  }));
}

// Sorting problems by their answer is the whole challenge — you have to
// actually solve each one to know where it belongs in the order.
export function generateSequenceRound(difficulty: Difficulty, count: number): SequenceItem[] {
  const problems = distinctProblems(difficulty, count).sort((a, b) => a.value - b.value);
  return problems.map((p, i) => ({ id: i, label: `${p.a} ${p.op} ${p.b}` }));
}
