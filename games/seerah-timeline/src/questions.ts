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

// A single, widely-agreed chronological backbone of the Seerah — every round
// below is a hand-picked subset of this master list, so "correct order" is
// never ambiguous: it's always the relative order these ids already have
// here, no matter which subset a round pulls.
const MASTER: SequenceItem[] = [
  { id: 1, label: 'Born in Makkah' },
  { id: 3, label: 'Marries Khadijah' },
  { id: 4, label: 'First revelation in the Cave of Hira' },
  { id: 5, label: 'Preaches privately to family' },
  { id: 6, label: 'Begins preaching publicly' },
  { id: 7, label: 'Faces persecution in Makkah' },
  { id: 8, label: 'Some followers migrate to Abyssinia' },
  { id: 9, label: 'The Hijra to Madinah' },
  { id: 10, label: 'Builds the mosque in Madinah' },
  { id: 11, label: 'The Battle of Badr' },
  { id: 12, label: 'The Battle of Uhud' },
  { id: 13, label: 'The Battle of the Trench' },
  { id: 14, label: 'The Treaty of Hudaybiyyah' },
  { id: 15, label: 'The Conquest of Makkah' },
  { id: 16, label: 'The Farewell Pilgrimage' },
  { id: 17, label: 'Passes away in Madinah' },
];

function pick(ids: number[]): SequenceItem[] {
  return ids.map((id) => MASTER.find((m) => m.id === id)!);
}

const ROUNDS: Record<string, SequenceItem[][]> = {
  easy: [
    pick([1, 4, 9, 17]),
    pick([1, 3, 4, 9]),
    pick([4, 9, 11, 15]),
  ],
  medium: [
    pick([1, 4, 6, 9, 17]),
    pick([4, 7, 8, 9, 11]),
    pick([9, 10, 11, 13, 15]),
  ],
  hard: [
    pick([9, 10, 11, 12, 13, 15]),
    pick([1, 3, 4, 5, 6, 9]),
    pick([11, 12, 13, 14, 15, 16]),
  ],
};

export function generateRound(difficulty: Difficulty, index: number): SequenceItem[] {
  const rounds = ROUNDS[difficulty.id];
  return rounds[index % rounds.length];
}
