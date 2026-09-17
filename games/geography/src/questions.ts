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

// Country ↔ capital.
export const ITEMS: MatchItem[] = [
  { id: 1, sideA: 'France', sideB: 'Paris' },
  { id: 2, sideA: 'Japan', sideB: 'Tokyo' },
  { id: 3, sideA: 'Egypt', sideB: 'Cairo' },
  { id: 4, sideA: 'Italy', sideB: 'Rome' },
  { id: 5, sideA: 'Canada', sideB: 'Ottawa' },
  { id: 6, sideA: 'Australia', sideB: 'Canberra' },
  { id: 7, sideA: 'Brazil', sideB: 'Brasília' },
  { id: 8, sideA: 'Germany', sideB: 'Berlin' },
  { id: 9, sideA: 'Spain', sideB: 'Madrid' },
  { id: 10, sideA: 'Mexico', sideB: 'Mexico City' },
];
