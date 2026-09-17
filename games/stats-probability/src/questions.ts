import type { QuizQuestion } from '@shared/quiz-kit';

export interface Difficulty {
  id: string;
  totalQuestions: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', totalQuestions: 8 },
  { id: 'medium', totalQuestions: 8 },
  { id: 'hard', totalQuestions: 10 },
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
    if (v >= 0 && !set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size + 1);
  const arr = shuffle([...set]);
  return { choices: arr.map(String), correctIndex: arr.indexOf(correct) };
}

function buildStringChoices(correct: string, pool: string[]): { choices: string[]; correctIndex: number } {
  const set = new Set<string>([correct]);
  for (const v of shuffle(pool)) {
    if (set.size >= 4) break;
    if (!set.has(v)) set.add(v);
  }
  const arr = shuffle([...set]);
  return { choices: arr, correctIndex: arr.indexOf(correct) };
}

// Easy: mean, median and mode of a small dataset.
function easyQuestion(): QuizQuestion {
  const size = randInt(4, 5);
  // A couple of repeats guaranteed so "mode" is always meaningful.
  const base = Array.from({ length: size - 1 }, () => randInt(1, 9));
  const repeat = base[randInt(0, base.length - 1)];
  const nums = shuffle([...base, repeat]);
  const kind = randInt(0, 2);

  if (kind === 0) {
    const sum = nums.reduce((a, b) => a + b, 0);
    const correct = Math.round(sum / nums.length);
    const { choices, correctIndex } = buildChoices(correct, [correct + 1, correct - 1, Math.max(...nums), Math.min(...nums)]);
    return { prompt: `Numbers: ${nums.join(', ')}`, sub: 'What is the mean (average)?', choices, correctIndex };
  }
  if (kind === 1) {
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const correct = sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
    const { choices, correctIndex } = buildChoices(correct, [sorted[0], sorted[sorted.length - 1], correct + 1, correct - 1]);
    return { prompt: `Numbers: ${nums.join(', ')}`, sub: 'What is the median (middle value)?', choices, correctIndex };
  }
  const counts = new Map<number, number>();
  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
  const correct = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const others = [...new Set(nums)].filter((n) => n !== correct);
  const { choices, correctIndex } = buildChoices(correct, others);
  return { prompt: `Numbers: ${nums.join(', ')}`, sub: 'What is the mode (most frequent value)?', choices, correctIndex };
}

// Medium: range, and reading a simple described tally/bar chart.
const FRUITS = ['apples', 'bananas', 'oranges', 'grapes'];

function mediumQuestion(): QuizQuestion {
  if (Math.random() < 0.5) {
    const nums = Array.from({ length: 5 }, () => randInt(2, 20));
    const correct = Math.max(...nums) - Math.min(...nums);
    const { choices, correctIndex } = buildChoices(correct, [Math.max(...nums), Math.min(...nums), correct + 2, correct - 2]);
    return { prompt: `Numbers: ${nums.join(', ')}`, sub: 'What is the range (biggest minus smallest)?', choices, correctIndex };
  }
  const counts = FRUITS.map(() => randInt(2, 10));
  const lines = FRUITS.map((f, i) => `${f}: ${counts[i]}`).join('  •  ');
  const kind = randInt(0, 1);
  if (kind === 0) {
    const maxIdx = counts.indexOf(Math.max(...counts));
    const { choices, correctIndex } = buildStringChoices(FRUITS[maxIdx], FRUITS.filter((_, i) => i !== maxIdx));
    return { prompt: lines, sub: 'Which fruit was picked the most?', choices, correctIndex };
  }
  const total = counts.reduce((a, b) => a + b, 0);
  const { choices, correctIndex } = buildChoices(total, [total + 3, total - 3, Math.max(...counts), total + 6]);
  return { prompt: lines, sub: 'How many pieces of fruit were picked in total?', choices, correctIndex };
}

// Hard: reading a data set more closely — spotting outliers and totaling values.
function hardQuestion(): QuizQuestion {
  if (Math.random() < 0.5) {
    const cluster = randInt(4, 10);
    const nums = Array.from({ length: 4 }, () => cluster + randInt(-1, 1));
    const outlier = cluster + randInt(20, 30) * (Math.random() < 0.5 ? 1 : -1);
    const withOutlier = shuffle([...nums, outlier]);
    const { choices, correctIndex } = buildChoices(outlier, nums);
    return { prompt: `Data: ${withOutlier.join(', ')}`, sub: 'Which number is the outlier (very different from the rest)?', choices, correctIndex };
  }
  const games = randInt(3, 5);
  const scores = Array.from({ length: games }, () => randInt(5, 20));
  const correct = scores.reduce((a, b) => a + b, 0);
  const { choices, correctIndex } = buildChoices(correct, [correct + 3, correct - 3, Math.max(...scores), correct + 6]);
  return { prompt: `A team scored these points in ${games} games: ${scores.join(', ')}.`, sub: 'What was their total score?', choices, correctIndex };
}

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  if (difficulty.id === 'easy') return easyQuestion();
  if (difficulty.id === 'medium') return mediumQuestion();
  return hardQuestion();
}
