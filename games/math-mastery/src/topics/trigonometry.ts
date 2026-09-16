import type { QuizQuestion } from '@shared/quiz-kit';
import { buildStringChoices, randInt } from '../choices';

export const TOTAL_QUESTIONS = 10;

type Fn = 'sin' | 'cos' | 'tan';

// Exact values at the "special" angles — no calculator, no decimals, just
// the values worth memorizing.
const TABLES: Record<Fn, Record<number, string>> = {
  sin: { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1' },
  cos: { 0: '1', 30: '√3/2', 45: '√2/2', 60: '1/2', 90: '0' },
  tan: { 0: '0', 30: '√3/3', 45: '1', 60: '√3' }, // tan 90° is undefined — excluded
};

function referenceLine(fn: Fn): string {
  const entries = Object.entries(TABLES[fn]);
  return `${fn}: ` + entries.map(([angle, val]) => `${angle}°=${val}`).join(', ');
}

export function generateQuestion(): QuizQuestion {
  const fns: Fn[] = ['sin', 'cos', 'tan'];
  const fn = fns[randInt(0, 2)];
  const table = TABLES[fn];
  const angles = Object.keys(table).map(Number);
  const angle = angles[randInt(0, angles.length - 1)];
  const correct = table[angle];

  const pool = angles.filter((a) => a !== angle).map((a) => table[a]);
  const { choices, correctIndex } = buildStringChoices(correct, pool);

  return {
    prompt: `${fn} ${angle}° = ?`,
    sub: referenceLine(fn),
    choices,
    correctIndex,
  };
}
