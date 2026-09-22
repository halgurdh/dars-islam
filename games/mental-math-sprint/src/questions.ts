import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';

export const TOTAL_QUESTIONS = 15;

export interface SpeedMode {
  id: string;
  timeLimitMs: number;
}

export const SPEED_MODES: SpeedMode[] = [
  { id: 'relaxed', timeLimitMs: 12_000 },
  { id: 'normal', timeLimitMs: 7_000 },
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

function buildChoices(correct: number): { choices: string[]; correctIndex: number } {
  const spread = Math.max(2, Math.round(Math.abs(correct) * 0.1));
  const set = new Set<number>([correct]);
  const deltas = shuffle([spread, -spread, spread * 2, -spread * 2, 1, -1, 10, -10]);
  for (const d of deltas) {
    if (set.size >= 4) break;
    const v = correct + d;
    if (v >= 0 && !set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size);
  const arr = shuffle([...set]);
  return { choices: arr.map(String), correctIndex: arr.indexOf(correct) };
}

// Difficulty escalates across the run: rounds 0-4 warm up, 5-9 raise the
// stakes, 10-14 lean on the tricks the other games teach (×11, ×5, ÷, %).
function tierForIndex(i: number): 1 | 2 | 3 {
  if (i < 5) return 1;
  if (i < 10) return 2;
  return 3;
}

export function tier1(): QuizQuestion {
  const ops: ('+' | '−' | '×')[] = ['+', '−', '×'];
  const op = ops[randInt(0, 2)];
  if (op === '×') {
    const a = randInt(1, 10);
    const b = randInt(1, 10);
    const correct = a * b;
    const { choices, correctIndex } = buildChoices(correct);
    return { prompt: `${a} × ${b} = ?`, choices, correctIndex };
  }
  const a = randInt(1, 20);
  const b = op === '+' ? randInt(1, 20 - a > 0 ? 20 - a : 1) : randInt(0, a);
  const correct = op === '+' ? a + b : a - b;
  const { choices, correctIndex } = buildChoices(correct);
  return { prompt: `${a} ${op} ${b} = ?`, choices, correctIndex };
}

export function tier2(): QuizQuestion {
  const ops: ('+' | '−' | '×' | '÷')[] = ['+', '−', '×', '÷'];
  const op = ops[randInt(0, 3)];
  if (op === '×') {
    const a = randInt(2, 12);
    const b = randInt(2, 12);
    const correct = a * b;
    const { choices, correctIndex } = buildChoices(correct);
    return { prompt: `${a} × ${b} = ?`, choices, correctIndex };
  }
  if (op === '÷') {
    const d = randInt(2, 12);
    const q = randInt(2, 12);
    const correct = q;
    const { choices, correctIndex } = buildChoices(correct);
    return { prompt: `${d * q} ÷ ${d} = ?`, choices, correctIndex };
  }
  const a = randInt(10, 89);
  const b = op === '+' ? randInt(1, 99 - a) : randInt(1, a);
  const correct = op === '+' ? a + b : a - b;
  const { choices, correctIndex } = buildChoices(correct);
  return { prompt: `${a} ${op} ${b} = ?`, choices, correctIndex };
}

export function tier3(): QuizQuestion {
  const kind = randInt(0, 3);
  if (kind === 0) {
    // ×11 trick territory
    const n = randInt(10, 88);
    const correct = n * 11;
    const { choices, correctIndex } = buildChoices(correct);
    return { prompt: `${n} × 11 = ?`, choices, correctIndex };
  }
  if (kind === 1) {
    // ×5 trick territory
    const n = randInt(12, 96);
    const correct = n * 5;
    const { choices, correctIndex } = buildChoices(correct);
    return { prompt: `${n} × 5 = ?`, choices, correctIndex };
  }
  if (kind === 2) {
    const d = randInt(4, 12);
    const q = randInt(6, 15);
    const correct = q;
    const { choices, correctIndex } = buildChoices(correct);
    return { prompt: `${d * q} ÷ ${d} = ?`, choices, correctIndex };
  }
  const percent = [10, 20, 25, 50][randInt(0, 3)];
  const base = randInt(2, 40) * 10;
  const correct = (base * percent) / 100;
  const { choices, correctIndex } = buildChoices(correct);
  return { prompt: `${percent}% of ${base} = ?`, choices, correctIndex };
}

export function generateQuestion(index: number): QuizQuestion {
  const tier = tierForIndex(index);
  if (tier === 1) return tier1();
  if (tier === 2) return tier2();
  return tier3();
}

// Match and Sequence reuse the same tier generators as the timed Sprint —
// distinct answers only, so Match never shows two pairs with the same
// value, and Sequence has an unambiguous order to solve for.
function distinctFromGenerator(gen: () => QuizQuestion, count: number): { prompt: string; answer: string }[] {
  const used = new Set<string>();
  const out: { prompt: string; answer: string }[] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 50) {
    attempts++;
    const q = gen();
    const answer = q.choices[q.correctIndex];
    if (used.has(answer)) continue;
    used.add(answer);
    out.push({ prompt: q.prompt.replace(/\s*=\s*\?$/, ''), answer });
  }
  return out;
}

export function generateMatchItems(gen: () => QuizQuestion, pairs: number): MatchItem[] {
  return distinctFromGenerator(gen, pairs).map((p, i) => ({ id: i, sideA: p.prompt, sideB: p.answer }));
}

export function generateSequenceRound(gen: () => QuizQuestion, count: number): SequenceItem[] {
  const problems = distinctFromGenerator(gen, count).sort((a, b) => Number(a.answer) - Number(b.answer));
  return problems.map((p, i) => ({ id: i, label: p.prompt }));
}
