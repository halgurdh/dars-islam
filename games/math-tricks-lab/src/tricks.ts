import type { QuizQuestion } from '@shared/quiz-kit';
import { buildNumericChoices } from './choices';

export interface Trick {
  id: string;
  icon: string;
  title: string;
  summary: string;
  steps: string[];
  example: { problem: string; work: string[]; answer: string };
  totalQuestions: number;
  generateQuestion: () => QuizQuestion;
  /** Only the line-multiplication trick uses this, to draw its diagram on the Learn screen. */
  hasDiagram?: boolean;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export const TRICKS: Trick[] = [
  {
    id: 'nine-trick',
    icon: '✋',
    title: '×9 Finger Trick',
    summary: 'Any number 1–10 times 9 — read the digits off two rules.',
    steps: [
      'For n × 9 (n from 1 to 10):',
      'Tens digit of the answer = n − 1',
      'Ones digit of the answer = 9 − (tens digit)',
      'The two digits always add up to 9.',
    ],
    example: { problem: '7 × 9', work: ['tens = 7 − 1 = 6', 'ones = 9 − 6 = 3'], answer: '63' },
    totalQuestions: 8,
    generateQuestion: (): QuizQuestion => {
      const n = randInt(2, 10);
      const correct = n * 9;
      const tens = n - 1;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        correct + 9, correct - 9, correct + 1, correct - 1, (tens + 1) * 10 + (9 - tens),
      ]);
      return {
        prompt: `${n} × 9 = ?`,
        sub: `Trick: tens = ${n} − 1 = ${tens}, ones = 9 − ${tens} = ${9 - tens}`,
        choices,
        correctIndex,
      };
    },
  },
  {
    id: 'eleven-trick',
    icon: '➕',
    title: '×11 Trick',
    summary: 'Multiply any 2-digit number by 11 in your head.',
    steps: [
      'For a 2-digit number "ab" × 11:',
      'Add the two digits: a + b',
      'Put that sum between a and b',
      'If a + b ≥ 10, carry the 1 into the first digit',
    ],
    example: { problem: '34 × 11', work: ['3 + 4 = 7', 'Insert between: 3, 7, 4'], answer: '374' },
    totalQuestions: 8,
    generateQuestion: (): QuizQuestion => {
      const n = randInt(10, 99);
      const a = Math.floor(n / 10);
      const b = n % 10;
      const correct = n * 11;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        a * 100 + b, // forgot to add the digits
        correct + 10,
        correct - 10,
        n * 10 + n, // digit-slip variant
      ]);
      return {
        prompt: `${n} × 11 = ?`,
        sub: `Trick: ${a} + ${b} = ${a + b} → put it between ${a} and ${b}`,
        choices,
        correctIndex,
      };
    },
  },
  {
    id: 'square-five',
    icon: '5️⃣',
    title: 'Squares Ending in 5',
    summary: 'Square any number ending in 5 in two quick steps.',
    steps: [
      'For a number "n5" (tens digit n, ones digit 5):',
      'Multiply n × (n + 1)',
      'Write 25 right after that result',
    ],
    example: { problem: '35²', work: ['3 × 4 = 12', 'Append 25'], answer: '1225' },
    totalQuestions: 8,
    generateQuestion: (): QuizQuestion => {
      const t = randInt(1, 9);
      const num = t * 10 + 5;
      const correct = num * num;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        t * (t + 1) * 100 + 50, // wrong tail
        (t + 1) * (t + 2) * 100 + 25, // off-by-one tens step
        correct + 100,
        correct - 100,
      ]);
      return {
        prompt: `${num}² = ?`,
        sub: `Trick: ${t} × ${t + 1} = ${t * (t + 1)}, then append 25`,
        choices,
        correctIndex,
      };
    },
  },
  {
    id: 'five-trick',
    icon: '➗',
    title: '×5 Double-Halve Trick',
    summary: 'Multiplying by 5 is just ×10 then ÷2.',
    steps: [
      'For n × 5:',
      'Multiply n by 10 instead (just add a zero)',
      'Then divide that result by 2',
    ],
    example: { problem: '46 × 5', work: ['46 × 10 = 460', '460 ÷ 2 = 230'], answer: '230' },
    totalQuestions: 8,
    generateQuestion: (): QuizQuestion => {
      const n = randInt(2, 98);
      const correct = n * 5;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        n * 10, // forgot to halve
        correct + 5,
        correct - 5,
        Math.round(n * 10 / 2) + 10,
      ]);
      return {
        prompt: `${n} × 5 = ?`,
        sub: `Trick: ${n} × 10 = ${n * 10}, then ÷ 2`,
        choices,
        correctIndex,
      };
    },
  },
  {
    id: 'line-multiplication',
    icon: '📏',
    title: 'Chinese Line Multiplication',
    summary: 'Multiply two 2-digit numbers by drawing and counting crossing lines.',
    steps: [
      'Draw one set of lines for each digit of the first number,',
      'crossing a second set of lines for each digit of the second number.',
      'Count the intersection dots in three groups: left (hundreds),',
      'middle (tens), right (ones) — that gives you the answer digits.',
    ],
    example: {
      problem: '12 × 32',
      work: ['Hundreds: 1 × 3 = 3', 'Tens: 1 × 2 + 2 × 3 = 8', 'Ones: 2 × 2 = 4'],
      answer: '384',
    },
    totalQuestions: 8,
    hasDiagram: true,
    generateQuestion: (): QuizQuestion => {
      // Digits kept small (1–4) so every place-value sum stays under 10 —
      // exactly what makes the line-counting method work without carrying.
      const da = randInt(1, 4);
      const ua = randInt(1, 4);
      const db = randInt(1, 4);
      const ub = randInt(1, 4);
      const a = da * 10 + ua;
      const b = db * 10 + ub;
      const correct = a * b;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        da * db * 100 + ua * ub, // skipped the cross terms entirely
        correct + 10,
        correct - 10,
        (da * db) * 100 + (da * ub + ua * db + 1) * 10 + ua * ub,
      ]);
      return {
        prompt: `${a} × ${b} = ?`,
        sub: `Trick: count crossing lines by place value — hundreds, tens, ones`,
        choices,
        correctIndex,
      };
    },
  },
];
