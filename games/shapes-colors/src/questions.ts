import type { QuizQuestion } from '@shared/quiz-kit';

export interface Difficulty {
  id: string;
  totalQuestions: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'shapes', totalQuestions: 8 },
  { id: 'colors', totalQuestions: 8 },
  { id: 'mixed', totalQuestions: 10 },
];

interface Named { name: string; emoji: string; }

const SHAPES: Named[] = [
  { name: 'Circle', emoji: '⚪' },
  { name: 'Square', emoji: '⬛' },
  { name: 'Triangle', emoji: '🔺' },
  { name: 'Star', emoji: '⭐' },
  { name: 'Heart', emoji: '❤️' },
  { name: 'Diamond', emoji: '🔷' },
];

const HUES: Named[] = [
  { name: 'Red', emoji: '🔴' },
  { name: 'Orange', emoji: '🟠' },
  { name: 'Yellow', emoji: '🟡' },
  { name: 'Green', emoji: '🟢' },
  { name: 'Blue', emoji: '🔵' },
  { name: 'Purple', emoji: '🟣' },
  { name: 'Brown', emoji: '🟤' },
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

function pickChoices(pool: Named[], correct: Named): { choices: string[]; correctIndex: number } {
  const others = shuffle(pool.filter((n) => n.name !== correct.name)).slice(0, 3);
  const arr = shuffle([correct, ...others]);
  return { choices: arr.map((n) => n.name), correctIndex: arr.findIndex((n) => n.name === correct.name) };
}

function shapeQuestion(): QuizQuestion {
  const shape = SHAPES[randInt(0, SHAPES.length - 1)];
  const { choices, correctIndex } = pickChoices(SHAPES, shape);
  return { prompt: shape.emoji, sub: 'What shape is this?', choices, correctIndex };
}

function colorQuestion(): QuizQuestion {
  const hue = HUES[randInt(0, HUES.length - 1)];
  const { choices, correctIndex } = pickChoices(HUES, hue);
  return { prompt: hue.emoji, sub: 'What color is this?', choices, correctIndex };
}

function oddOneOutQuestion(): QuizQuestion {
  const sameHue = HUES[randInt(0, HUES.length - 1)];
  const otherHues = shuffle(HUES.filter((h) => h.name !== sameHue.name));
  // Represent 3 same-color choices with color dots, and 1 different-color dot as the odd one.
  const choices = shuffle([sameHue.emoji, sameHue.emoji, sameHue.emoji, otherHues[0].emoji]);
  // Only one entry is the different color; find its index (dedupe-safe since emoji are unique per hue).
  const correctIndex = choices.indexOf(otherHues[0].emoji);
  return { prompt: '🔎', sub: 'Which one is a different color?', choices, correctIndex };
}

export function generateQuestion(difficulty: Difficulty, index: number): QuizQuestion {
  if (difficulty.id === 'shapes') return shapeQuestion();
  if (difficulty.id === 'colors') return colorQuestion();
  // mixed: rotate through all three question styles
  const kind = index % 3;
  if (kind === 0) return shapeQuestion();
  if (kind === 1) return colorQuestion();
  return oddOneOutQuestion();
}
