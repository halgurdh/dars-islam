import type { SequenceItem } from '@shared/sequence-kit';

export interface Difficulty {
  id: string;
  totalRounds: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', totalRounds: 3 },
  { id: 'medium', totalRounds: 3 },
  { id: 'hard', totalRounds: 3 },
];

// A single, widely-agreed chronological backbone of broad world history —
// every round below is a hand-picked subset, so "correct order" is always
// just the relative order these ids already have here. `era` is the same
// widely-cited approximate dating used in general textbooks, shared with
// the Match and Quiz modes below.
export interface HistoryEvent {
  id: number;
  label: string;
  era: string;
}

export const EVENTS: HistoryEvent[] = [
  { id: 1, label: 'Invention of writing (cuneiform)', era: '~3200 BCE' },
  { id: 2, label: 'The Egyptian pyramids are built', era: '~2600 BCE' },
  { id: 3, label: 'Ancient Greek city-states flourish', era: '~500 BCE' },
  { id: 4, label: 'The Roman Empire rises', era: '~27 BCE' },
  { id: 5, label: 'The Roman Empire falls', era: '476 CE' },
  { id: 6, label: 'The Middle Ages in Europe', era: '500–1500 CE' },
  { id: 7, label: 'The Renaissance begins', era: '~1400 CE' },
  { id: 8, label: 'Columbus reaches the Americas', era: '1492 CE' },
  { id: 9, label: 'The Industrial Revolution begins', era: '~1760 CE' },
  { id: 10, label: 'World War I', era: '1914–1918' },
  { id: 11, label: 'World War II', era: '1939–1945' },
  { id: 12, label: 'The first Moon landing', era: '1969' },
];

const MASTER: SequenceItem[] = EVENTS.map(({ id, label }) => ({ id, label }));

function pick(ids: number[]): SequenceItem[] {
  return ids.map((id) => MASTER.find((m) => m.id === id)!);
}

const ROUNDS: Record<string, SequenceItem[][]> = {
  easy: [
    pick([1, 3, 9, 12]),
    pick([2, 5, 8, 11]),
    pick([1, 4, 7, 10]),
  ],
  medium: [
    pick([1, 2, 3, 4, 5]),
    pick([5, 6, 7, 8, 9]),
    pick([8, 9, 10, 11, 12]),
  ],
  hard: [
    pick([1, 2, 3, 4, 5, 6]),
    pick([4, 5, 6, 7, 8, 9]),
    pick([7, 8, 9, 10, 11, 12]),
  ],
};

export function generateRound(difficulty: Difficulty, index: number): SequenceItem[] {
  const rounds = ROUNDS[difficulty.id];
  return rounds[index % rounds.length];
}
