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

interface Item {
  prompt: string;
  answer: string;
  wrong: [string, string, string];
  sub?: string;
}

// Easy: right-triangle vocabulary and the SOH-CAH-TOA definitions.
const EASY_ITEMS: Item[] = [
  { prompt: 'In a right triangle, the side opposite the right angle is called the:', answer: 'Hypotenuse', wrong: ['Opposite side', 'Adjacent side', 'Base'] },
  { prompt: 'Which trig ratio is defined as opposite / hypotenuse?', answer: 'Sine', wrong: ['Cosine', 'Tangent', 'Secant'] },
  { prompt: 'Which trig ratio is defined as adjacent / hypotenuse?', answer: 'Cosine', wrong: ['Sine', 'Tangent', 'Cotangent'] },
  { prompt: 'Which trig ratio is defined as opposite / adjacent?', answer: 'Tangent', wrong: ['Sine', 'Cosine', 'Secant'] },
  { prompt: 'What is the sum of the three angles in any triangle?', answer: '180°', wrong: ['90°', '270°', '360°'] },
  { prompt: 'In a right triangle, how many angles measure 90°?', answer: '1', wrong: ['2', '3', '0'] },
  { prompt: 'What do we call the longest side of a right triangle?', answer: 'The hypotenuse', wrong: ['The opposite side', 'The adjacent side', 'The base'] },
  { prompt: 'What is the mnemonic used to remember sine, cosine and tangent ratios?', answer: 'SOH-CAH-TOA', wrong: ['PEMDAS', 'FOIL', 'BODMAS'] },
];

// Medium: exact ratios for the common special angles (30°, 45°, 60°, 90°).
const MEDIUM_ITEMS: Item[] = [
  { prompt: 'What is sin(30°)?', answer: '1/2', wrong: ['√2/2', '√3/2', '1'] },
  { prompt: 'What is cos(60°)?', answer: '1/2', wrong: ['√2/2', '√3/2', '0'] },
  { prompt: 'What is sin(45°)?', answer: '√2/2', wrong: ['1/2', '√3/2', '1'] },
  { prompt: 'What is cos(45°)?', answer: '√2/2', wrong: ['1/2', '√3/2', '0'] },
  { prompt: 'What is tan(45°)?', answer: '1', wrong: ['0', '√3', '1/2'] },
  { prompt: 'What is sin(90°)?', answer: '1', wrong: ['0', '1/2', '√2/2'] },
  { prompt: 'What is cos(0°)?', answer: '1', wrong: ['0', '1/2', '√2/2'] },
  { prompt: 'What is sin(60°)?', answer: '√3/2', wrong: ['1/2', '√2/2', '1'] },
];

// Hard: radians, the Pythagorean identity, and applied ratio problems.
const HARD_ITEMS: Item[] = [
  { prompt: 'What is 180° in radians?', answer: 'π', wrong: ['π/2', '2π', 'π/4'] },
  { prompt: 'What is 90° in radians?', answer: 'π/2', wrong: ['π', 'π/4', 'π/3'] },
  { prompt: 'What is 45° in radians?', answer: 'π/4', wrong: ['π/2', 'π/3', 'π/6'] },
  { prompt: 'What is 60° in radians?', answer: 'π/3', wrong: ['π/6', 'π/4', 'π/2'] },
  { prompt: 'According to the Pythagorean identity, sin²(θ) + cos²(θ) = ?', answer: '1', wrong: ['0', 'tan²(θ)', '2'] },
  { prompt: 'In a 3-4-5 right triangle, if sin(θ) = 3/5, what is cos(θ)?', answer: '4/5', wrong: ['3/5', '3/4', '5/4'] },
  { prompt: "A ladder leans against a wall at a 60° angle with the ground. Which ratio relates the angle, the ladder's length (hypotenuse), and the height on the wall (opposite)?", answer: 'Sine', wrong: ['Cosine', 'Tangent', 'Secant'] },
  { prompt: 'How many radians are in a full circle (360°)?', answer: '2π', wrong: ['π', 'π/2', '4π'] },
];

const BANKS: Record<string, Item[]> = { easy: EASY_ITEMS, medium: MEDIUM_ITEMS, hard: HARD_ITEMS };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(item: Item): QuizQuestion {
  const options = shuffle([item.answer, ...item.wrong]);
  return {
    prompt: item.prompt,
    sub: item.sub,
    choices: options,
    correctIndex: options.indexOf(item.answer),
  };
}

export function makeRunGenerator(difficulty: Difficulty): (index: number) => QuizQuestion {
  let pool: Item[] = [];
  return (index: number) => {
    if (index === 0) pool = shuffle(BANKS[difficulty.id]).slice(0, difficulty.totalQuestions);
    return buildQuestion(pool[index]);
  };
}
