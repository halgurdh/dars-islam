import type { QuizQuestion } from '@shared/quiz-kit';

export interface Difficulty {
  id: string;
  totalQuestions: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'shapes', totalQuestions: 8 },
  { id: 'numbers', totalQuestions: 8 },
  { id: 'odd-one-out', totalQuestions: 8 },
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

const SYMBOLS = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];

// A repeating 2- or 3-symbol cycle, e.g. A B A B A ? -> B.
function shapePatternQuestion(): QuizQuestion {
  const cycleLen = randInt(0, 1) === 0 ? 2 : 3;
  const cycle = shuffle(SYMBOLS).slice(0, cycleLen);
  const shown = 5;
  const seq = Array.from({ length: shown }, (_, i) => cycle[i % cycleLen]);
  const correct = cycle[shown % cycleLen];
  const distractors = shuffle(SYMBOLS.filter((s) => s !== correct)).slice(0, 3);
  const options = shuffle([correct, ...distractors]);
  return {
    prompt: `${seq.join(' ')}  ?`,
    sub: 'What comes next?',
    choices: options,
    correctIndex: options.indexOf(correct),
  };
}

function numberSequenceQuestion(): QuizQuestion {
  const step = [1, 2, 3, 5, 10][randInt(0, 4)];
  const start = randInt(1, 10);
  const seq = [start, start + step, start + step * 2, start + step * 3];
  const correct = start + step * 4;
  const set = new Set<number>([correct]);
  for (const d of shuffle([step, -step, 1, -1, 2, -2])) {
    if (set.size >= 4) break;
    const v = correct + d;
    if (v > 0 && !set.has(v)) set.add(v);
  }
  const arr = shuffle([...set]);
  return {
    prompt: `${seq.join(', ')}, ?`,
    sub: 'What comes next?',
    choices: arr.map(String),
    correctIndex: arr.indexOf(correct),
  };
}

interface Category { name: string; items: string[]; }
const CATEGORIES: Category[] = [
  { name: 'fruit', items: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉'] },
  { name: 'animal', items: ['🐶', '🐱', '🐘', '🐢', '🐦', '🐟'] },
  { name: 'vehicle', items: ['🚗', '🚌', '🚲', '✈️', '🚂', '⛵'] },
  { name: 'weather', items: ['☀️', '🌧️', '❄️', '⛅', '🌈', '⚡'] },
];

function oddOneOutQuestion(): QuizQuestion {
  const [mainCat, otherCat] = shuffle(CATEGORIES).slice(0, 2);
  const mainItems = shuffle(mainCat.items).slice(0, 3);
  const oddItem = shuffle(otherCat.items)[0];
  const choices = shuffle([...mainItems, oddItem]);
  return {
    prompt: '🔎',
    sub: 'Which one doesn’t belong?',
    choices,
    correctIndex: choices.indexOf(oddItem),
  };
}

export function generateQuestion(difficulty: Difficulty, index: number): QuizQuestion {
  if (difficulty.id === 'shapes') return shapePatternQuestion();
  if (difficulty.id === 'numbers') return numberSequenceQuestion();
  void index;
  return oddOneOutQuestion();
}
