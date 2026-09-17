import type { MatchItem } from '@shared/match-kit';

export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Body part ↔ function.
export const ITEMS: MatchItem[] = [
  { id: 1, sideA: 'Heart', sideB: 'Pumps blood' },
  { id: 2, sideA: 'Lungs', sideB: 'Help you breathe' },
  { id: 3, sideA: 'Brain', sideB: 'Controls the body' },
  { id: 4, sideA: 'Stomach', sideB: 'Digests food' },
  { id: 5, sideA: 'Skin', sideB: 'Protects the body' },
  { id: 6, sideA: 'Muscles', sideB: 'Help you move' },
  { id: 7, sideA: 'Bones', sideB: 'Support the body' },
  { id: 8, sideA: 'Kidneys', sideB: 'Filter the blood' },
  { id: 9, sideA: 'Eyes', sideB: 'Help you see' },
  { id: 10, sideA: 'Ears', sideB: 'Help you hear' },
];
