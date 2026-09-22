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
// here, no matter which subset a round pulls. `era` is the same widely-cited
// approximate CE dating used in general Seerah texts, shared with the Match
// and Quiz modes below.
export interface SeerahEvent {
  id: number;
  label: string;
  era: string;
}

export const EVENTS: SeerahEvent[] = [
  { id: 1, label: 'Born in Makkah', era: '570 CE' },
  { id: 3, label: 'Marries Khadijah', era: '~595 CE' },
  { id: 4, label: 'First revelation in the Cave of Hira', era: '610 CE' },
  { id: 5, label: 'Preaches privately to family', era: '~611 CE' },
  { id: 6, label: 'Begins preaching publicly', era: '613 CE' },
  { id: 7, label: 'Faces persecution in Makkah', era: '~615 CE' },
  { id: 8, label: 'Some followers migrate to Abyssinia', era: '615 CE' },
  { id: 9, label: 'The Hijra to Madinah', era: '622 CE' },
  { id: 10, label: 'Builds the mosque in Madinah', era: '622 CE' },
  { id: 11, label: 'The Battle of Badr', era: '624 CE' },
  { id: 12, label: 'The Battle of Uhud', era: '625 CE' },
  { id: 13, label: 'The Battle of the Trench', era: '627 CE' },
  { id: 14, label: 'The Treaty of Hudaybiyyah', era: '628 CE' },
  { id: 15, label: 'The Conquest of Makkah', era: '630 CE' },
  { id: 16, label: 'The Farewell Pilgrimage', era: '632 CE' },
  { id: 17, label: 'Passes away in Madinah', era: '632 CE' },
];

const MASTER: SequenceItem[] = EVENTS.map(({ id, label }) => ({ id, label }));

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
