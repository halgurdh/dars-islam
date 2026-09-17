import type { QuizQuestion } from '@shared/quiz-kit';

export interface Difficulty {
  id: string;
  totalQuestions: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', totalQuestions: 8 },
  { id: 'medium', totalQuestions: 8 },
  { id: 'hard', totalQuestions: 8 },
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

function buildChoices(correct: number, candidates: number[]): { choices: string[]; correctIndex: number } {
  const set = new Set<number>([correct]);
  for (const v of shuffle(candidates)) {
    if (set.size >= 4) break;
    if (!set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size * 3 + 1);
  const arr = shuffle([...set]);
  return { choices: arr.map(String), correctIndex: arr.indexOf(correct) };
}

// Easy: one-step equations — x + a = b, x - a = b.
function easyQuestion(): QuizQuestion {
  const a = randInt(1, 15);
  if (Math.random() < 0.5) {
    const x = randInt(1, 20);
    const b = a + x;
    const { choices, correctIndex } = buildChoices(x, [x + 1, x - 1, b, a]);
    return { prompt: `Solve for x: x + ${a} = ${b}`, choices, correctIndex };
  }
  const x = randInt(a + 1, a + 20);
  const b = x - a;
  const { choices, correctIndex } = buildChoices(x, [x + 1, x - 1, b, a]);
  return { prompt: `Solve for x: x - ${a} = ${b}`, choices, correctIndex };
}

// Medium: two-step equations (ax + b = c) and combining like terms.
function mediumQuestion(): QuizQuestion {
  if (Math.random() < 0.5) {
    const a = randInt(2, 9);
    const x = randInt(1, 10);
    const b = randInt(1, 20);
    const c = a * x + b;
    const { choices, correctIndex } = buildChoices(x, [x + 1, x - 1, c, a]);
    return { prompt: `Solve for x: ${a}x + ${b} = ${c}`, choices, correctIndex };
  }
  const c1 = randInt(2, 9);
  const c2 = randInt(2, 9);
  const sum = c1 + c2;
  const { choices, correctIndex } = buildChoices(sum, [c1 * c2, sum + 1, sum - 1]);
  return {
    prompt: `Simplify: ${c1}x + ${c2}x`,
    sub: 'Combine the like terms.',
    choices: choices.map((n) => `${n}x`),
    correctIndex,
  };
}

// Hard: variables on both sides, and evaluating expressions by substitution.
function hardQuestion(): QuizQuestion {
  if (Math.random() < 0.5) {
    const x = randInt(1, 10);
    const a = randInt(3, 7);
    const c = randInt(1, a - 1);
    const b = randInt(1, 15);
    const d = b + (a - c) * x;
    const { choices, correctIndex } = buildChoices(x, [x + 1, x - 1, b, d]);
    return { prompt: `Solve for x: ${a}x + ${b} = ${c}x + ${d}`, choices, correctIndex };
  }
  const x = randInt(2, 10);
  const a = randInt(2, 8);
  const b = randInt(1, 15);
  const correct = a * x + b;
  const { choices, correctIndex } = buildChoices(correct, [a * x, correct + a, correct - b, x + a + b]);
  return { prompt: `If x = ${x}, what is ${a}x + ${b}?`, choices, correctIndex };
}

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  if (difficulty.id === 'easy') return easyQuestion();
  if (difficulty.id === 'medium') return mediumQuestion();
  return hardQuestion();
}
