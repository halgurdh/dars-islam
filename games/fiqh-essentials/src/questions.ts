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

// The general order of wudu (ablution), taught the same way across schools
// of thought — every round is a hand-picked subset, so the correct order is
// always just the relative order these ids already have here.
const MASTER: SequenceItem[] = [
  { id: 1, label: 'Make the intention' },
  { id: 2, label: 'Wash the hands three times' },
  { id: 3, label: 'Rinse the mouth' },
  { id: 4, label: 'Sniff water and blow it out' },
  { id: 5, label: 'Wash the face three times' },
  { id: 6, label: 'Wash the arms to the elbows' },
  { id: 7, label: 'Wipe over the head' },
  { id: 8, label: 'Wash the feet to the ankles' },
];

function pick(ids: number[]): SequenceItem[] {
  return ids.map((id) => MASTER.find((m) => m.id === id)!);
}

const ROUNDS: Record<string, SequenceItem[][]> = {
  easy: [
    pick([1, 2, 5, 8]),
    pick([1, 5, 6, 8]),
    pick([2, 3, 5, 8]),
  ],
  medium: [
    pick([1, 2, 3, 5, 8]),
    pick([2, 3, 4, 5, 6]),
    pick([4, 5, 6, 7, 8]),
  ],
  hard: [
    pick([1, 2, 3, 4, 5, 6]),
    pick([2, 3, 4, 5, 6, 7]),
    pick([3, 4, 5, 6, 7, 8]),
  ],
};

export function generateRound(difficulty: Difficulty, index: number): SequenceItem[] {
  const rounds = ROUNDS[difficulty.id];
  return rounds[index % rounds.length];
}
