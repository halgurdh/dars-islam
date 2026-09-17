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

// Greeting ↔ language.
export const ITEMS: MatchItem[] = [
  { id: 1, sideA: 'Hola', sideB: 'Spanish' },
  { id: 2, sideA: 'Bonjour', sideB: 'French' },
  { id: 3, sideA: 'Konnichiwa', sideB: 'Japanese' },
  { id: 4, sideA: 'Guten Tag', sideB: 'German' },
  { id: 5, sideA: 'Ciao', sideB: 'Italian' },
  { id: 6, sideA: 'Namaste', sideB: 'Hindi' },
  { id: 7, sideA: 'Merhaba', sideB: 'Turkish' },
  { id: 8, sideA: 'Shalom', sideB: 'Hebrew' },
  { id: 9, sideA: 'Ni Hao', sideB: 'Chinese' },
  { id: 10, sideA: 'Olá', sideB: 'Portuguese' },
];
