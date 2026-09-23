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
  { id: 'hard', totalQuestions: 8 },
];

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
const COMPOSITES = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28];

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function buildChoices(correct: number, candidates: number[]): { choices: string[]; correctIndex: number } {
  const set = new Set<number>([correct]);
  for (const v of shuffle(candidates)) {
    if (set.size >= 4) break;
    if (v > 0 && !set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size * 2 + 1);
  const arr = shuffle([...set]);
  return { choices: arr.map(String), correctIndex: arr.indexOf(correct) };
}

// Easy: identifying primes and multiples.
function easyQuestion(): QuizQuestion {
  if (Math.random() < 0.5) {
    const prime = pick(PRIMES.slice(0, 6));
    const wrongPool = shuffle(COMPOSITES).slice(0, 3);
    const options = shuffle([prime, ...wrongPool]);
    return { prompt: t().askPrime, choices: options.map(String), correctIndex: options.indexOf(prime) };
  }
  const n = randInt(2, 9);
  const k = randInt(2, 9);
  const correct = n * k;
  const wrongPool = [correct + 1, correct - 1, correct + n === correct ? correct + n + 1 : n * (k + 2) + 1].filter((v) => v % n !== 0);
  while (wrongPool.length < 3) wrongPool.push(correct + wrongPool.length + 2);
  const { choices, correctIndex } = buildChoices(correct, wrongPool);
  return { prompt: t().askMultiple(n), choices, correctIndex };
}

// Medium: greatest common factor and least common multiple.
function mediumQuestion(): QuizQuestion {
  if (Math.random() < 0.5) {
    const a = randInt(4, 30);
    const b = randInt(4, 30);
    const correct = gcd(a, b);
    const { choices, correctIndex } = buildChoices(correct, [a, b, correct + 2, Math.max(1, correct - 1)]);
    return { prompt: t().askGcf(a, b), choices, correctIndex };
  }
  const a = randInt(2, 12);
  const b = randInt(2, 12);
  const correct = lcm(a, b);
  const { choices, correctIndex } = buildChoices(correct, [a * b, correct + a, correct - b > 0 ? correct - b : correct + 5]);
  return { prompt: t().askLcm(a, b), choices, correctIndex };
}

// Hard: number patterns (arithmetic sequences) and remainders.
function hardQuestion(): QuizQuestion {
  if (Math.random() < 0.5) {
    const start = randInt(1, 20);
    const diff = randInt(2, 9);
    const terms = [start, start + diff, start + 2 * diff, start + 3 * diff];
    const correct = start + 4 * diff;
    const { choices, correctIndex } = buildChoices(correct, [correct + diff, correct - diff, correct + 1]);
    return { prompt: t().askNextInPattern(terms.join(', ')), choices, correctIndex };
  }
  const b = randInt(3, 9);
  const a = randInt(b * 3, b * 8) + randInt(1, b - 1);
  const correct = a % b;
  const { choices, correctIndex } = buildChoices(correct, [b, correct + 1, Math.max(0, correct - 1)]);
  return { prompt: t().askRemainder(a, b), choices, correctIndex };
}

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  if (difficulty.id === 'easy') return easyQuestion();
  if (difficulty.id === 'medium') return mediumQuestion();
  return hardQuestion();
}

// Match and Sequence need a compact label/value pair per difficulty — the
// "which is prime" Quiz variant answers with a word choice, not a
// computed number, so easy sticks to the multiplication variant here.
interface NumberTheoryProblem {
  label: string;
  value: number;
}

function easyProblem(): NumberTheoryProblem {
  const n = randInt(2, 9);
  const k = randInt(2, 9);
  return { label: `${n} × ${k}`, value: n * k };
}

function mediumProblem(): NumberTheoryProblem {
  if (Math.random() < 0.5) {
    const a = randInt(4, 30);
    const b = randInt(4, 30);
    return { label: `GCF of ${a}, ${b}`, value: gcd(a, b) };
  }
  const a = randInt(2, 12);
  const b = randInt(2, 12);
  return { label: `LCM of ${a}, ${b}`, value: lcm(a, b) };
}

function hardProblem(): NumberTheoryProblem {
  if (Math.random() < 0.5) {
    const start = randInt(1, 20);
    const diff = randInt(2, 9);
    const terms = [start, start + diff, start + 2 * diff, start + 3 * diff];
    return { label: `${terms.join(', ')}, ?`, value: start + 4 * diff };
  }
  const b = randInt(3, 9);
  const a = randInt(b * 3, b * 8) + randInt(1, b - 1);
  return { label: `${a} ÷ ${b} remainder`, value: a % b };
}

function problemFor(difficulty: Difficulty): NumberTheoryProblem {
  if (difficulty.id === 'easy') return easyProblem();
  if (difficulty.id === 'medium') return mediumProblem();
  return hardProblem();
}

function distinctProblems(difficulty: Difficulty, count: number): NumberTheoryProblem[] {
  const used = new Set<number>();
  const out: NumberTheoryProblem[] = [];
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
