import type { QuizQuestion } from '@shared/quiz-kit';

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
