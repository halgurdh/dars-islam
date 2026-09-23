import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { t } from './i18n';

export interface Difficulty {
  id: string;
  totalQuestions: number;
  max: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', totalQuestions: 8, max: 5 },
  { id: 'medium', totalQuestions: 8, max: 10 },
  { id: 'hard', totalQuestions: 10, max: 20 },
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

const ICONS = ['⭐', '🍎', '🟢', '🔵', '🐚', '🌸'];

function dots(n: number, icon: string): string {
  return Array.from({ length: n }, () => icon).join(' ');
}

function numberChoices(correct: number, max: number): { choices: string[]; correctIndex: number } {
  const set = new Set<number>([correct]);
  const deltas = shuffle([1, -1, 2, -2, 3, -3]);
  for (const d of deltas) {
    if (set.size >= 4) break;
    const v = correct + d;
    if (v >= 0 && v <= max + 3 && !set.has(v)) set.add(v);
  }
  while (set.size < 4) set.add(correct + set.size);
  const arr = shuffle([...set]);
  return { choices: arr.map(String), correctIndex: arr.indexOf(correct) };
}

// "Count the icons" (easy half) then "which group shows this number" (harder
// half, reversed direction — number recognition instead of counting).
export function generateQuestion(difficulty: Difficulty, index: number): QuizQuestion {
  const icon = ICONS[randInt(0, ICONS.length - 1)];
  const reversed = index >= Math.ceil(difficulty.totalQuestions / 2);

  if (!reversed) {
    const n = randInt(1, difficulty.max);
    const { choices, correctIndex } = numberChoices(n, difficulty.max);
    return { prompt: dots(n, icon), sub: t().promptHowMany, choices, correctIndex };
  }

  // Capped independently of difficulty: answer buttons render on one line
  // with no wrapping, so the dot-groups shown as choices must stay small
  // enough to fit — the harder tiers test bigger numbers via the "count the
  // dots" direction instead, which does wrap.
  const reversedMax = Math.min(difficulty.max, 6);
  const n = randInt(1, reversedMax);
  const wrongCounts = shuffle(
    Array.from({ length: reversedMax }, (_, i) => i + 1).filter((v) => v !== n)
  ).slice(0, 3);
  const options = shuffle([n, ...wrongCounts]);
  return {
    prompt: `${n}`,
    sub: t().promptTapGroup,
    choices: options.map((c) => dots(c, icon)),
    correctIndex: options.indexOf(n),
  };
}

function pickDistinctNumbers(max: number, count: number): number[] {
  return shuffle(Array.from({ length: max }, (_, i) => i + 1)).slice(0, Math.min(count, max));
}

export function generateMatchItems(difficulty: Difficulty, pairs: number): MatchItem[] {
  return pickDistinctNumbers(difficulty.max, pairs).map((n, i) => ({
    id: i,
    sideA: dots(n, ICONS[randInt(0, ICONS.length - 1)]),
    sideB: String(n),
  }));
}

// Ordering the dot-groups by count is the whole challenge — you have to
// actually count each group to know where it belongs.
export function generateSequenceRound(difficulty: Difficulty, count: number): SequenceItem[] {
  const icon = ICONS[randInt(0, ICONS.length - 1)];
  const nums = pickDistinctNumbers(difficulty.max, count).sort((a, b) => a - b);
  return nums.map((n, i) => ({ id: i, label: dots(n, icon) }));
}
