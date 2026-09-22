import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { buildStringChoices, randInt } from '../choices';

export const TOTAL_QUESTIONS = 10;

interface Frac { n: number; d: number; }

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function reduce(n: number, d: number): Frac {
  if (n === 0) return { n: 0, d: 1 };
  const sign = d < 0 ? -1 : 1;
  n *= sign;
  d *= sign;
  const g = gcd(Math.abs(n), d);
  return { n: n / g, d: d / g };
}

function fmt(f: Frac): string {
  return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}`;
}

function randFrac(maxDen: number): Frac {
  const d = randInt(2, maxDen);
  const n = randInt(1, d - 1);
  return { n, d };
}

export function generateQuestion(index: number): QuizQuestion {
  const maxDen = index < 5 ? 8 : 12;
  const ops: ('+' | '−' | '×' | '÷')[] = ['+', '−', '×', '÷'];
  const op = ops[randInt(0, 3)];

  let f1 = randFrac(maxDen);
  let f2 = randFrac(maxDen);

  let rawN: number;
  let rawD: number;
  let wrongDenomN = 0;
  let wrongDenomD = 0;

  if (op === '+' || op === '−') {
    if (op === '−' && f1.n / f1.d < f2.n / f2.d) [f1, f2] = [f2, f1];
    const lcd = (f1.d * f2.d) / gcd(f1.d, f2.d);
    const scaled1 = f1.n * (lcd / f1.d);
    const scaled2 = f2.n * (lcd / f2.d);
    rawN = op === '+' ? scaled1 + scaled2 : scaled1 - scaled2;
    rawD = lcd;
    wrongDenomN = op === '+' ? f1.n + f2.n : f1.n - f2.n;
    wrongDenomD = f1.d + f2.d;
  } else if (op === '×') {
    rawN = f1.n * f2.n;
    rawD = f1.d * f2.d;
  } else {
    rawN = f1.n * f2.d;
    rawD = f1.d * f2.n;
  }

  const correctFrac = reduce(rawN, rawD);
  const correct = fmt(correctFrac);

  const pool = [
    fmt({ n: rawN, d: rawD }), // unreduced — the classic "forgot to simplify" slip
    fmt({ n: correctFrac.n + 1, d: correctFrac.d }),
    fmt({ n: Math.max(0, correctFrac.n - 1), d: correctFrac.d }),
    fmt({ n: correctFrac.n, d: correctFrac.d + 1 }),
  ];
  if (op === '+' || op === '−') {
    pool.push(fmt(reduce(wrongDenomN, wrongDenomD))); // added/subtracted denominators directly
  } else if (op === '÷') {
    pool.push(fmt(reduce(f1.n * f2.n, f1.d * f2.d))); // multiplied instead of flipping
  }

  const { choices, correctIndex } = buildStringChoices(correct, pool);
  return {
    prompt: `${f1.n}/${f1.d} ${op} ${f2.n}/${f2.d} = ?`,
    choices,
    correctIndex,
  };
}

interface FracProblem { f1: Frac; f2: Frac; op: '+' | '−' | '×' | '÷'; correct: Frac; }

function randomProblem(maxDen: number): FracProblem {
  const ops: ('+' | '−' | '×' | '÷')[] = ['+', '−', '×', '÷'];
  const op = ops[randInt(0, 3)];
  let f1 = randFrac(maxDen);
  let f2 = randFrac(maxDen);
  let rawN: number;
  let rawD: number;

  if (op === '+' || op === '−') {
    if (op === '−' && f1.n / f1.d < f2.n / f2.d) [f1, f2] = [f2, f1];
    const lcd = (f1.d * f2.d) / gcd(f1.d, f2.d);
    const scaled1 = f1.n * (lcd / f1.d);
    const scaled2 = f2.n * (lcd / f2.d);
    rawN = op === '+' ? scaled1 + scaled2 : scaled1 - scaled2;
    rawD = lcd;
  } else if (op === '×') {
    rawN = f1.n * f2.n;
    rawD = f1.d * f2.d;
  } else {
    rawN = f1.n * f2.d;
    rawD = f1.d * f2.n;
  }

  return { f1, f2, op, correct: reduce(rawN, rawD) };
}

// Distinct-*value* problems, same reasoning as the other topics: the
// ordering/pairing is only fair if every entry resolves to a different
// answer, so a player can't guess from ties.
function distinctProblems(count: number, maxDen: number): (FracProblem & { key: string })[] {
  const used = new Set<string>();
  const out: (FracProblem & { key: string })[] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 60) {
    attempts++;
    const p = randomProblem(maxDen);
    const key = fmt(p.correct);
    if (used.has(key)) continue;
    used.add(key);
    out.push({ ...p, key });
  }
  return out;
}

export function generateMatchItems(pairs: number): MatchItem[] {
  return distinctProblems(pairs, 8).map((p, i) => ({
    id: i,
    sideA: `${p.f1.n}/${p.f1.d} ${p.op} ${p.f2.n}/${p.f2.d}`,
    sideB: p.key,
  }));
}

export function generateSequenceRound(count: number): SequenceItem[] {
  const problems = distinctProblems(count, 10)
    .map((p) => ({ ...p, value: p.correct.n / p.correct.d }))
    .sort((a, b) => a.value - b.value);
  return problems.map((p, i) => ({ id: i, label: `${p.f1.n}/${p.f1.d} ${p.op} ${p.f2.n}/${p.f2.d}` }));
}
