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
