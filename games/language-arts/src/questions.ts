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

// Word ↔ synonym.
export const ITEMS: MatchItem[] = [
  { id: 1, sideA: 'Happy', sideB: 'Joyful' },
  { id: 2, sideA: 'Big', sideB: 'Huge' },
  { id: 3, sideA: 'Fast', sideB: 'Quick' },
  { id: 4, sideA: 'Smart', sideB: 'Clever' },
  { id: 5, sideA: 'Sad', sideB: 'Unhappy' },
  { id: 6, sideA: 'Small', sideB: 'Tiny' },
  { id: 7, sideA: 'Begin', sideB: 'Start' },
  { id: 8, sideA: 'End', sideB: 'Finish' },
  { id: 9, sideA: 'Cold', sideB: 'Chilly' },
  { id: 10, sideA: 'Loud', sideB: 'Noisy' },
];
