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
    if (v > 0 && !set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size * 2 + 1);
  const arr = shuffle([...set]);
  return { choices: arr.map(String), correctIndex: arr.indexOf(correct) };
}

// Easy: rectangle area & perimeter.
function easyQuestion(): QuizQuestion {
  const w = randInt(3, 12);
  const h = randInt(3, 12);
  if (Math.random() < 0.5) {
    const correct = w * h;
    const { choices, correctIndex } = buildChoices(correct, [w + h, correct + w, correct - h, 2 * (w + h)]);
    return { prompt: `A rectangle is ${w} × ${h}.`, sub: 'What is its area?', choices, correctIndex };
  }
  const correct = 2 * (w + h);
  const { choices, correctIndex } = buildChoices(correct, [w * h, w + h, correct + 2, correct - 4]);
  return { prompt: `A rectangle is ${w} × ${h}.`, sub: 'What is its perimeter?', choices, correctIndex };
}

// Medium: triangle area, circle area/circumference (π ≈ 3.14), and the
// "angles in a triangle sum to 180°" rule.
function mediumQuestion(): QuizQuestion {
  const kind = randInt(0, 2);
  if (kind === 0) {
    const b = randInt(4, 16);
    const h = [4, 6, 8, 10, 12][randInt(0, 4)];
    const correct = (b * h) / 2;
    const { choices, correctIndex } = buildChoices(correct, [b * h, correct + b, correct - h, correct + 5]);
    return { prompt: `A triangle has base ${b} and height ${h}.`, sub: 'Area = ½ × base × height. What is its area?', choices, correctIndex };
  }
  if (kind === 1) {
    const r = randInt(2, 10);
    const correct = Math.round(3.14 * r * r);
    const { choices, correctIndex } = buildChoices(correct, [Math.round(2 * 3.14 * r), correct + r, correct - r, correct + 10]);
    return { prompt: `A circle has radius ${r}.`, sub: 'Area ≈ π × r² (use π ≈ 3.14). What is its area?', choices, correctIndex };
  }
  const a = randInt(30, 100);
  const b = randInt(30, 150 - a > 30 ? 150 - a : 31);
  const correct = 180 - a - b;
  const { choices, correctIndex } = buildChoices(correct, [180 - a, 180 - b, correct + 10, correct - 10]);
  return { prompt: `A triangle has angles ${a}° and ${b}°.`, sub: 'Angles in a triangle add up to 180°. What is the third angle?', choices, correctIndex };
}

// Hard: Pythagorean theorem, using clean integer triples so the answer is
// always a whole number.
const TRIPLES: [number, number, number][] = [
  [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [20, 21, 29], [10, 24, 26],
];

function hardQuestion(): QuizQuestion {
  const [a, b, c] = TRIPLES[randInt(0, TRIPLES.length - 1)];
  const askHypotenuse = Math.random() < 0.5;
  if (askHypotenuse) {
    const { choices, correctIndex } = buildChoices(c, [c + 1, c - 1, a + b, c + 3]);
    return { prompt: `A right triangle has legs ${a} and ${b}.`, sub: 'Use a² + b² = c². What is the hypotenuse?', choices, correctIndex };
  }
  const { choices, correctIndex } = buildChoices(a, [a + 1, a - 1, b, c - b]);
  return { prompt: `A right triangle has one leg ${b} and hypotenuse ${c}.`, sub: 'Use a² + b² = c². What is the missing leg?', choices, correctIndex };
}

export function generateQuestion(difficulty: Difficulty): QuizQuestion {
  if (difficulty.id === 'easy') return easyQuestion();
  if (difficulty.id === 'medium') return mediumQuestion();
  return hardQuestion();
}
