import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';

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
    if (v >= 0 && !set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size + 1);
  const arr = shuffle([...set]);
  return { choices: arr.map((c) => `$${c}`), correctIndex: arr.indexOf(correct) };
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

const NEEDS = ['Food', 'Water', 'A place to live', 'Medicine'];
const WANTS = ['A new toy', 'Candy', 'A video game', 'A second dessert'];

// Easy: needs vs. wants, and simple money addition/change-making.
function easyQuestion(): QuizQuestion {
  const kind = randInt(0, 1);
  if (kind === 0) {
    const wantAsAnswer = Math.random() < 0.5;
    const correct = wantAsAnswer ? WANTS[randInt(0, WANTS.length - 1)] : NEEDS[randInt(0, NEEDS.length - 1)];
    const wrongPool = wantAsAnswer ? NEEDS : WANTS;
    const { choices, correctIndex } = buildStringChoices(correct, wrongPool);
    return {
      prompt: wantAsAnswer ? 'Which one is a want (nice to have, not necessary)?' : 'Which one is a need (something you must have)?',
      choices,
      correctIndex,
    };
  }
  const haveA = [1, 2, 5, 10][randInt(0, 3)];
  const haveB = [1, 2, 5][randInt(0, 2)];
  const correct = haveA + haveB;
  const { choices, correctIndex } = buildChoices(correct, [correct + 1, correct - 1, haveA * haveB, haveA]);
  return { prompt: `You have $${haveA} and get $${haveB} more.`, sub: 'How much do you have now?', choices, correctIndex };
}

// Medium: percentages and discounts on a price.
function mediumQuestion(): QuizQuestion {
  // Multiples of 20 so every percent option below (10/20/25/50%) always
  // divides out to a whole dollar amount — no awkward "$1.20" results.
  const price = [20, 40, 60, 80, 100, 120, 140][randInt(0, 6)];
  const percent = [10, 20, 25, 50][randInt(0, 3)];
  const kind = randInt(0, 1);
  if (kind === 0) {
    const correct = (price * percent) / 100;
    const { choices, correctIndex } = buildChoices(correct, [price - correct, correct + 2, correct - 2, price]);
    return { prompt: `What is ${percent}% of $${price}?`, choices, correctIndex };
  }
  const discount = (price * percent) / 100;
  const correct = price - discount;
  const { choices, correctIndex } = buildChoices(correct, [discount, correct + 2, correct - 2, price]);
  return { prompt: `A toy costs $${price} and is ${percent}% off.`, sub: 'What is the sale price?', choices, correctIndex };
}

// Hard: zakat on savings — the standard simplified rule taught to
// beginners is 2.5% of savings held for a full lunar year (above the
// nisab threshold). Amounts are chosen so 2.5% always comes out whole.
function hardQuestion(): QuizQuestion {
  const base = randInt(2, 50) * 40; // multiples of 40 make 2.5% a whole number
  const correct = (base * 2.5) / 100;
  const { choices, correctIndex } = buildChoices(correct, [correct * 2, Math.round(correct / 2), correct + 5, (base * 5) / 100]);
  return {
    prompt: `Someone has saved $${base} for a full year.`,
    sub: 'Zakat on savings is 2.5%. How much zakat do they owe?',
    choices,
    correctIndex,
  };
}

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  if (difficulty.id === 'easy') return easyQuestion();
  if (difficulty.id === 'medium') return mediumQuestion();
  return hardQuestion();
}

// Match and Sequence need a purely numeric problem/value pair per
// difficulty (the Quiz's easy tier also asks needs-vs-wants questions,
// whose answers are words, not amounts — not sortable alongside dollars).
interface MoneyProblem {
  label: string;
  value: number;
}

function moneyProblem(difficulty: Difficulty): MoneyProblem {
  if (difficulty.id === 'easy') {
    const haveA = [1, 2, 5, 10][randInt(0, 3)];
    const haveB = [1, 2, 5][randInt(0, 2)];
    return { label: `$${haveA} + $${haveB}`, value: haveA + haveB };
  }
  if (difficulty.id === 'medium') {
    const price = [20, 40, 60, 80, 100, 120, 140][randInt(0, 6)];
    const percent = [10, 20, 25, 50][randInt(0, 3)];
    return { label: `${percent}% of $${price}`, value: (price * percent) / 100 };
  }
  const base = randInt(2, 50) * 40; // multiples of 40 make 2.5% a whole number
  return { label: `$${base} saved a year`, value: (base * 2.5) / 100 };
}

function distinctMoneyProblems(difficulty: Difficulty, count: number): MoneyProblem[] {
  const used = new Set<number>();
  const out: MoneyProblem[] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 50) {
    attempts++;
    const p = moneyProblem(difficulty);
    if (used.has(p.value)) continue;
    used.add(p.value);
    out.push(p);
  }
  return out;
}

export function generateMatchItems(difficulty: Difficulty, pairs: number): MatchItem[] {
  return distinctMoneyProblems(difficulty, pairs).map((p, i) => ({ id: i, sideA: p.label, sideB: `$${p.value}` }));
}

// Sorting problems by their answer is the whole challenge — you have to
// actually work out each amount to know where it belongs in the order.
export function generateSequenceRound(difficulty: Difficulty, count: number): SequenceItem[] {
  const problems = distinctMoneyProblems(difficulty, count).sort((a, b) => a.value - b.value);
  return problems.map((p, i) => ({ id: i, label: p.label }));
}

// This game's "items" are procedurally generated math problems, not a
// fixed vocabulary list — so True/False and Fill-in-the-Blank are adapted
// here (rather than reusing shared/quiz-variants.ts's item-list-based
// helpers) to work on a generated {label, value} problem instead. Listen &
// Identify and Flashcard Review are skipped for this game: there's no
// Arabic audio to identify and no deck of fixed terms to review, so both
// would be a forced fit for a procedural math format (see MenuScene.ts).

/** Pairs a generated money problem with either its real answer (true) or a
 *  deliberately wrong one (false), as a raw {equation, isTrue} fact — the
 *  caller applies its own localized phrasing before turning it into a
 *  QuizQuestion via shared/quiz-variants.ts's toTrueFalseQuestion(). */
export function generateTrueFalseStatement(difficulty: Difficulty): { equation: string; isTrue: boolean } {
  const problem = moneyProblem(difficulty);
  const isTrue = Math.random() < 0.5;
  let statedValue = problem.value;
  if (!isTrue) {
    const delta = randInt(1, Math.max(2, Math.round(problem.value * 0.2)));
    statedValue = Math.random() < 0.5 ? problem.value + delta : Math.max(0, problem.value - delta);
    if (statedValue === problem.value) statedValue += 1;
  }
  return { equation: `${problem.label} = $${statedValue}`, isTrue };
}

const DIGIT_POOL = '0123456789';

/** Masks one digit of a generated problem's numeric answer (e.g. 25 →
 *  "2_", correct "5") — the digit equivalent of quiz-variants.ts's
 *  letter-blanking, since this game's answers are numbers, not words. */
function blankOneDigit(value: number): { prompt: string; correctDigit: string } {
  const str = String(value);
  const idx = randInt(0, str.length - 1);
  const correctDigit = str[idx];
  return { prompt: str.slice(0, idx) + '_' + str.slice(idx + 1), correctDigit };
}

function buildDigitChoices(correctDigit: string): { choices: string[]; correctIndex: number } {
  const set = new Set<string>([correctDigit]);
  while (set.size < 4) set.add(DIGIT_POOL[randInt(0, DIGIT_POOL.length - 1)]);
  const arr = shuffle([...set]);
  return { choices: arr, correctIndex: arr.indexOf(correctDigit) };
}

export function generateFillBlankQuestion(difficulty: Difficulty): QuizQuestion {
  const problem = moneyProblem(difficulty);
  const blanked = blankOneDigit(problem.value);
  const { choices, correctIndex } = buildDigitChoices(blanked.correctDigit);
  return { prompt: `${problem.label} = $${blanked.prompt}`, choices, correctIndex };
}
