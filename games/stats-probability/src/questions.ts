import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { t } from './i18n';

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
    return { prompt: t().numbersPrompt(nums.join(', ')), sub: t().askMean, choices, correctIndex };
  }
  if (kind === 1) {
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const correct = sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
    const { choices, correctIndex } = buildChoices(correct, [sorted[0], sorted[sorted.length - 1], correct + 1, correct - 1]);
    return { prompt: t().numbersPrompt(nums.join(', ')), sub: t().askMedian, choices, correctIndex };
  }
  const counts = new Map<number, number>();
  for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
  const correct = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const others = [...new Set(nums)].filter((n) => n !== correct);
  const { choices, correctIndex } = buildChoices(correct, others);
  return { prompt: t().numbersPrompt(nums.join(', ')), sub: t().askMode, choices, correctIndex };
}

// Medium: range, and reading a simple described tally/bar chart.
function mediumQuestion(): QuizQuestion {
  const fruits = t().fruitNames;
  if (Math.random() < 0.5) {
    const nums = Array.from({ length: 5 }, () => randInt(2, 20));
    const correct = Math.max(...nums) - Math.min(...nums);
    const { choices, correctIndex } = buildChoices(correct, [Math.max(...nums), Math.min(...nums), correct + 2, correct - 2]);
    return { prompt: t().numbersPrompt(nums.join(', ')), sub: t().askRange, choices, correctIndex };
  }
  const counts = fruits.map(() => randInt(2, 10));
  const lines = fruits.map((f, i) => `${f}: ${counts[i]}`).join('  •  ');
  const kind = randInt(0, 1);
  if (kind === 0) {
    const maxIdx = counts.indexOf(Math.max(...counts));
    const { choices, correctIndex } = buildStringChoices(fruits[maxIdx], fruits.filter((_, i) => i !== maxIdx));
    return { prompt: lines, sub: t().askMostPicked, choices, correctIndex };
  }
  const total = counts.reduce((a, b) => a + b, 0);
  const { choices, correctIndex } = buildChoices(total, [total + 3, total - 3, Math.max(...counts), total + 6]);
  return { prompt: lines, sub: t().askTotalFruit, choices, correctIndex };
}

// Hard: reading a data set more closely — spotting outliers and totaling values.
function hardQuestion(): QuizQuestion {
  if (Math.random() < 0.5) {
    const cluster = randInt(4, 10);
    const nums = Array.from({ length: 4 }, () => cluster + randInt(-1, 1));
    const outlier = cluster + randInt(20, 30) * (Math.random() < 0.5 ? 1 : -1);
    const withOutlier = shuffle([...nums, outlier]);
    const { choices, correctIndex } = buildChoices(outlier, nums);
    return { prompt: t().dataPrompt(withOutlier.join(', ')), sub: t().askOutlier, choices, correctIndex };
  }
  const games = randInt(3, 5);
  const scores = Array.from({ length: games }, () => randInt(5, 20));
  const correct = scores.reduce((a, b) => a + b, 0);
  const { choices, correctIndex } = buildChoices(correct, [correct + 3, correct - 3, Math.max(...scores), correct + 6]);
  return { prompt: t().teamScorePrompt(games, scores.join(', ')), sub: t().askTotalScore, choices, correctIndex };
}

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  if (difficulty.id === 'easy') return easyQuestion();
  if (difficulty.id === 'medium') return mediumQuestion();
  return hardQuestion();
}

// Match and Sequence need a single consistent numeric format per
// difficulty — one calculation type from each tier's quiz variants.
interface StatsProblem {
  label: string;
  value: number;
}

function easyProblem(): StatsProblem {
  const size = randInt(4, 5);
  const nums = Array.from({ length: size }, () => randInt(1, 9));
  const sum = nums.reduce((a, b) => a + b, 0);
  return { label: t().meanLabel(nums.join(', ')), value: Math.round(sum / nums.length) };
}

function mediumProblem(): StatsProblem {
  const nums = Array.from({ length: 5 }, () => randInt(2, 20));
  return { label: t().rangeLabel(nums.join(', ')), value: Math.max(...nums) - Math.min(...nums) };
}

function hardProblem(): StatsProblem {
  const games = randInt(3, 5);
  const scores = Array.from({ length: games }, () => randInt(5, 20));
  return { label: t().scoresLabel(games, scores.join(', ')), value: scores.reduce((a, b) => a + b, 0) };
}

function problemFor(difficulty: Difficulty): StatsProblem {
  if (difficulty.id === 'easy') return easyProblem();
  if (difficulty.id === 'medium') return mediumProblem();
  return hardProblem();
}

function distinctProblems(difficulty: Difficulty, count: number): StatsProblem[] {
  const used = new Set<number>();
  const out: StatsProblem[] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 50) {
    attempts++;
    const p = problemFor(difficulty);
    if (used.has(p.value)) continue;
    used.add(p.value);
    out.push(p);
  }
  return out;
}

export function generateMatchItems(difficulty: Difficulty, pairs: number): MatchItem[] {
  return distinctProblems(difficulty, pairs).map((p, i) => ({ id: i, sideA: p.label, sideB: String(p.value) }));
}

// Sorting problems by their answer is the whole challenge — you have to
// actually work each one out to know where it belongs in the order.
export function generateSequenceRound(difficulty: Difficulty, count: number): SequenceItem[] {
  const problems = distinctProblems(difficulty, count).sort((a, b) => a.value - b.value);
  return problems.map((p, i) => ({ id: i, label: p.label }));
}
