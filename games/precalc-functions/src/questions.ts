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

// Easy: what a function is, function notation, domain and range.
const EASY_ITEMS: Item[] = [
  { prompt: 'What do we call a rule that assigns exactly one output to each input?', answer: 'A function', wrong: ['A variable', 'An equation', 'A constant'] },
  { prompt: 'In function notation f(x), what does "f(3)" mean?', answer: 'Evaluate the function at x = 3', wrong: ['Multiply f by 3', 'Add 3 to f', 'The 3rd function'] },
  { prompt: 'If f(x) = x + 2, what is f(5)?', answer: '7', wrong: ['5', '10', '3'] },
  { prompt: 'If f(x) = 2x, what is f(4)?', answer: '8', wrong: ['6', '4', '2'] },
  { prompt: 'What is the domain of a function?', answer: 'The set of all possible input (x) values', wrong: ['The set of all output (y) values', 'The highest point on the graph', 'The slope of the line'] },
  { prompt: 'What is the range of a function?', answer: 'The set of all possible output (y) values', wrong: ['The set of all input (x) values', 'The lowest point on the graph', 'The y-intercept'] },
  { prompt: 'What do we call the point where a graph crosses the x-axis?', answer: 'An x-intercept (root)', wrong: ['A y-intercept', 'An asymptote', 'A vertex'] },
  { prompt: 'If f(x) = x², what is f(3)?', answer: '9', wrong: ['6', '3', '12'] },
];

// Medium: linear and quadratic function properties, and simple composition.
const MEDIUM_ITEMS: Item[] = [
  { prompt: 'What is the slope of the line y = 3x + 2?', answer: '3', wrong: ['2', '5', '1/3'] },
  { prompt: 'What is the y-intercept of the line y = 3x + 2?', answer: '2', wrong: ['3', '0', '5'] },
  { prompt: 'What shape does the graph of a quadratic function f(x) = x² make?', answer: 'A parabola', wrong: ['A straight line', 'A circle', 'A hyperbola'] },
  { prompt: 'What are the zeros (roots) of f(x) = x² - 4?', answer: 'x = 2 and x = -2', wrong: ['x = 4 and x = -4', 'x = 0 only', 'x = 2 only'] },
  { prompt: 'What is the vertex of the parabola y = x²?', answer: '(0, 0)', wrong: ['(1, 1)', '(0, 1)', '(-1, 0)'] },
  { prompt: 'If g(x) = 2x - 1, what is g(3)?', answer: '5', wrong: ['4', '6', '2'] },
  { prompt: 'What do we call a function whose graph is a straight line?', answer: 'A linear function', wrong: ['A quadratic function', 'An exponential function', 'A cubic function'] },
  { prompt: 'If f(x) = x + 1 and g(x) = 2x, what is f(g(3))?', answer: '7', wrong: ['6', '8', '9'] },
];

// Hard: composite and inverse functions, and exponential basics.
const HARD_ITEMS: Item[] = [
  { prompt: 'If f(x) = x + 3 and g(x) = x - 3, what is f(g(x)) for any x?', answer: 'x', wrong: ['x + 6', 'x - 6', '2x'] },
  { prompt: 'What do we call two functions that "undo" each other, like f(x) = x + 3 and g(x) = x - 3?', answer: 'Inverse functions', wrong: ['Composite functions', 'Linear functions', 'Parallel functions'] },
  { prompt: 'If f(x) = 2^x, what is f(3)?', answer: '8', wrong: ['6', '9', '16'] },
  { prompt: 'What is the domain restriction on the function f(x) = 1/x?', answer: 'x cannot equal 0', wrong: ['x cannot equal 1', 'x cannot be negative', 'There is no restriction'] },
  { prompt: 'If f(x) = x² and g(x) = x + 1, what is f(g(2))?', answer: '9', wrong: ['5', '4', '6'] },
  { prompt: "What is the general shape of an exponential growth function's graph?", answer: 'It increases slowly then rises sharply', wrong: ['It is a straight line', 'It is a perfect circle', 'It decreases forever'] },
  { prompt: 'If f(x) = 3x - 1, what is the inverse function f⁻¹(x)?', answer: '(x + 1)/3', wrong: ['(x - 1)/3', '3x + 1', 'x/3 - 1'] },
  { prompt: 'What does it mean if a function is "one-to-one"?', answer: 'Each output corresponds to exactly one input', wrong: ['Each input has multiple outputs', 'The function has no domain', 'The function is always increasing by 1'] },
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
