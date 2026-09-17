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

// The 8 planets in order of distance from the sun — every round is a
// hand-picked subset, so the correct order is always just the relative
// order these ids already have here.
const MASTER: SequenceItem[] = [
  { id: 1, label: 'Mercury' },
  { id: 2, label: 'Venus' },
  { id: 3, label: 'Earth' },
  { id: 4, label: 'Mars' },
  { id: 5, label: 'Jupiter' },
  { id: 6, label: 'Saturn' },
  { id: 7, label: 'Uranus' },
  { id: 8, label: 'Neptune' },
];

function pick(ids: number[]): SequenceItem[] {
  return ids.map((id) => MASTER.find((m) => m.id === id)!);
}

const ROUNDS: Record<string, SequenceItem[][]> = {
  easy: [
    pick([1, 3, 5, 8]),
    pick([1, 2, 4, 6]),
    pick([2, 3, 5, 7]),
  ],
  medium: [
    pick([1, 2, 3, 4, 5]),
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
