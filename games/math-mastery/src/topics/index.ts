import type { QuizQuestion } from '@shared/quiz-kit';
import * as multiplication from './multiplication';
import * as squareRoots from './squareRoots';
import * as fractions from './fractions';
import * as trigonometry from './trigonometry';

export interface LearnPage {
  heading: string;
  body: string[];
  example?: { problem: string; work: string[]; answer: string };
  diagram?: 'lines' | 'triangle';
  /** For a 'lines' diagram: the exact digits of the example it illustrates, so the
   *  diagram always matches a real worked problem instead of an arbitrary one. */
  diagramDigits?: { da: number; ua: number; db: number; ub: number };
  diagramCaption?: string;
}

export interface Topic {
  id: string;
  icon: string;
  title: string;
  summary: string;
  pages: LearnPage[];
  totalQuestions: number;
  generateQuestion: (index: number) => QuizQuestion;
}

export const TOPICS: Topic[] = [
  {
    id: 'multiplication',
    icon: '✖️',
    title: 'Multi-Digit Multiplication',
    summary: '2-digit and 3-digit numbers — no shortcuts, just solid technique.',
    pages: [
      {
        heading: 'Why it works',
        body: [
          'Multiplication distributes over addition — that’s the whole secret.',
          '234 is really 200 + 30 + 4. Multiplying by 6 means multiplying each piece by 6, then adding:',
          '(200 × 6) + (30 × 6) + (4 × 6) = 1200 + 180 + 24 = 1404.',
          'Long multiplication is just a fast, organized way to do exactly that — one place value at a time, for either number.',
        ],
      },
      {
        heading: 'One-digit multiplier',
        body: [
          'When you’re multiplying by a single digit, there’s only one row:',
          'Multiply the top number by that digit, right to left, carrying as you go.',
        ],
        example: {
          problem: '234 × 6',
          work: ['6 × 4 = 24 (write 4, carry 2)', '6 × 3 = 18 + 2 = 20 (write 0, carry 2)', '6 × 2 = 12 + 2 = 14'],
          answer: '1404',
        },
      },
      {
        heading: 'Two-digit multiplier',
        body: [
          'When the bottom number has more than one digit, you get one full row PER digit — each row shifted one more place left than the last — then you add every row together.',
          '23 × 12 means: multiply 23 by the ones digit (2), then by the tens digit (1) shifted left, then add.',
        ],
        example: {
          problem: '23 × 12',
          work: ['Row 1: 23 × 2 = 46', 'Row 2: 23 × 1 = 23, shift left → 230', 'Add: 46 + 230'],
          answer: '276',
        },
      },
      {
        heading: 'See it visually',
        body: ['The crossing-lines trick shows the exact same 23 × 12 from the last page, just organized by place value instead of by row.'],
        diagram: 'lines',
        diagramDigits: { da: 1, ua: 2, db: 2, ub: 3 },
        diagramCaption: '12 × 23 = 276 — hundreds 1×2=2, tens 1×3+2×2=7, ones 2×3=6. Same answer as 23 × 12 on the last page.',
      },
    ],
    totalQuestions: multiplication.TOTAL_QUESTIONS,
    generateQuestion: multiplication.generateQuestion,
  },
  {
    id: 'square-roots',
    icon: '√',
    title: 'Square Roots',
    summary: 'Exact roots of perfect squares, then estimate the rest.',
    pages: [
      {
        heading: 'Why it works',
        body: [
          'A square root asks: what number, multiplied by itself, gives this?',
          'Squaring only ever gets bigger as the number gets bigger — 7² = 49 and 8² = 64, and nothing in between skips around.',
          'So any number between 49 and 64 must have a root between 7 and 8. That’s the entire reason "which two perfect squares does it sit between" works.',
        ],
      },
      {
        heading: 'The method',
        body: [
          'Memorize the perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100...',
          'For an exact root, find which perfect square matches the number.',
          'For a number that isn’t a perfect square, find the two perfect squares it sits between — the answer is between their roots.',
        ],
      },
      {
        heading: 'Worked example',
        body: [],
        example: {
          problem: '√50 ≈ ?',
          work: ['49 = 7² and 64 = 8²', '50 is just above 49, so √50 is just above 7'],
          answer: '7',
        },
      },
    ],
    totalQuestions: squareRoots.TOTAL_QUESTIONS,
    generateQuestion: squareRoots.generateQuestion,
  },
  {
    id: 'fractions',
    icon: '½',
    title: 'Fractions',
    summary: 'Add, subtract, multiply and divide fractions.',
    pages: [
      {
        heading: 'Why it works',
        body: [
          'A fraction’s denominator is its "unit size" — 1/4 and 1/6 are pieces of different sizes, so you can’t add them directly, any more than you can add 3 apples + 2 oranges and call it 5 of one thing.',
          'A common denominator rescales both fractions into the SAME size piece, so the tops finally count the same thing.',
          'Multiplying scales both the top and bottom at once — that’s why you just multiply straight across. Dividing asks "how many of these fit?", and flipping-then-multiplying is the shortcut for that question.',
        ],
      },
      {
        heading: 'The method',
        body: [
          'Add/subtract: find a common denominator, then add/subtract the tops.',
          'Multiply: multiply the tops together and the bottoms together.',
          'Divide: flip the second fraction, then multiply.',
          'Always simplify your answer by dividing top and bottom by their GCD.',
        ],
      },
      {
        heading: 'Worked example',
        body: [],
        example: {
          problem: '1/4 + 1/6',
          work: ['Common denominator: 12', '1/4 = 3/12, 1/6 = 2/12', '3/12 + 2/12 = 5/12'],
          answer: '5/12',
        },
      },
    ],
    totalQuestions: fractions.TOTAL_QUESTIONS,
    generateQuestion: fractions.generateQuestion,
  },
  {
    id: 'trigonometry',
    icon: '📐',
    title: 'Trigonometry',
    summary: 'sin, cos and tan at the special angles: 0°, 30°, 45°, 60°, 90°.',
    pages: [
      {
        heading: 'Why it works',
        body: [
          'sin, cos and tan are just ratios between two sides of a right triangle — they stay the same no matter how big or small the triangle is, as long as the angle θ stays the same.',
          'Split an equilateral triangle exactly in half and you get a 30-60-90 triangle with sides in the ratio 1 : √3 : 2 — that’s where the 30° and 60° values come from.',
          'Split a square along its diagonal and you get a 45-45-90 triangle with sides 1 : 1 : √2 — that’s where the 45° values come from.',
        ],
      },
      {
        heading: 'The method',
        body: [
          'Label the sides relative to angle θ: Opposite (across from θ), Adjacent (next to θ), Hypotenuse (longest side).',
          'Remember it with SOH-CAH-TOA:',
          'sin θ = Opp/Hyp,  cos θ = Adj/Hyp,  tan θ = Opp/Adj',
        ],
        diagram: 'triangle',
      },
      {
        heading: 'Worked example',
        body: ['At 30°, the side opposite θ is exactly half the hypotenuse — no calculator needed.'],
        example: {
          problem: 'sin 30°',
          work: ['Opposite = half the Hypotenuse'],
          answer: '1/2',
        },
      },
    ],
    totalQuestions: trigonometry.TOTAL_QUESTIONS,
    generateQuestion: trigonometry.generateQuestion,
  },
];
