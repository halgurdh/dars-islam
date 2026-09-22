import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { buildStringChoices, randInt, shuffle } from '../choices';

export const TOTAL_QUESTIONS = 10;

type Fn = 'sin' | 'cos' | 'tan';

// Exact values at the "special" angles — no calculator, no decimals, just
// the values worth memorizing.
const TABLES: Record<Fn, Record<number, string>> = {
  sin: { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1' },
  cos: { 0: '1', 30: '√3/2', 45: '√2/2', 60: '1/2', 90: '0' },
  tan: { 0: '0', 30: '√3/3', 45: '1', 60: '√3' }, // tan 90° is undefined — excluded
};

// The real decimal magnitude behind each exact value — used only to ORDER
// Sequence rounds by actual size (e.g. sin 45° > cos 60°), never shown to
// the player. Several entries share a value (sin 30° = cos 60° = 1/2), so
// both Match and Sequence dedupe by it before picking a round.
const DECIMAL: Record<Fn, Record<number, number>> = {
  sin: { 0: 0, 30: 0.5, 45: Math.SQRT2 / 2, 60: Math.sqrt(3) / 2, 90: 1 },
  cos: { 0: 1, 30: Math.sqrt(3) / 2, 45: Math.SQRT2 / 2, 60: 0.5, 90: 0 },
  tan: { 0: 0, 30: Math.sqrt(3) / 3, 45: 1, 60: Math.sqrt(3) },
};

interface TrigEntry { fn: Fn; angle: number; label: string; text: string; value: number; }

function allEntries(): TrigEntry[] {
  const out: TrigEntry[] = [];
  (Object.keys(TABLES) as Fn[]).forEach((fn) => {
    Object.entries(TABLES[fn]).forEach(([angleStr, text]) => {
      const angle = Number(angleStr);
      out.push({ fn, angle, label: `${fn} ${angle}°`, text, value: DECIMAL[fn][angle] });
    });
  });
  return out;
}

function dedupedEntries(): TrigEntry[] {
  const seen = new Set<string>();
  return allEntries().filter((e) => {
    if (seen.has(e.text)) return false;
    seen.add(e.text);
    return true;
  });
}

function referenceLine(fn: Fn): string {
  const entries = Object.entries(TABLES[fn]);
  return `${fn}: ` + entries.map(([angle, val]) => `${angle}°=${val}`).join(', ');
}

export function generateQuestion(): QuizQuestion {
  const fns: Fn[] = ['sin', 'cos', 'tan'];
  const fn = fns[randInt(0, 2)];
  const table = TABLES[fn];
  const angles = Object.keys(table).map(Number);
  const angle = angles[randInt(0, angles.length - 1)];
  const correct = table[angle];

  const pool = angles.filter((a) => a !== angle).map((a) => table[a]);
  const { choices, correctIndex } = buildStringChoices(correct, pool);

  return {
    prompt: `${fn} ${angle}° = ?`,
    sub: referenceLine(fn),
    choices,
    correctIndex,
  };
}

export function generateMatchItems(pairs: number): MatchItem[] {
  return shuffle(dedupedEntries())
    .slice(0, pairs)
    .map((e, i) => ({ id: i, sideA: e.label, sideB: e.text }));
}

// Ordered by real magnitude (sin 45° > cos 60°, etc.) — the label shows
// only the function/angle, so placing it correctly requires actually
// knowing the value, not just reading it off the card.
export function generateSequenceRound(count: number): SequenceItem[] {
  const picked = shuffle(dedupedEntries()).slice(0, count).sort((a, b) => a.value - b.value);
  return picked.map((e, i) => ({ id: i, label: e.label }));
}
