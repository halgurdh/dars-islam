import type { QuizQuestion } from '@shared/quiz-kit';
import { buildNumericChoices, randInt } from '../choices';

export const TOTAL_QUESTIONS = 10;

// Escalates within a single run: warm up on 2-digit×2-digit, then a
// 3-digit×1-digit stretch, then the hardest combination, 3-digit×2-digit.
function pickFactors(index: number): { a: number; b: number } {
  if (index < 4) return { a: randInt(10, 99), b: randInt(10, 99) };
  if (index < 8) return { a: randInt(100, 999), b: randInt(2, 9) };
  return { a: randInt(100, 999), b: randInt(10, 99) };
}

export function generateQuestion(index: number): QuizQuestion {
  const { a, b } = pickFactors(index);
  const correct = a * b;
  const { choices, correctIndex } = buildNumericChoices(correct, [
    a * (b - 1),
    a * (b + 1),
    correct + a,
    correct - a,
    correct + 10,
    correct - 10,
    correct + 100,
    correct - 100,
  ]);
  return { prompt: `${a} × ${b} = ?`, choices, correctIndex };
}
