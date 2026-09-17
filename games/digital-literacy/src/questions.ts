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

// Term ↔ definition.
export const ITEMS: MatchItem[] = [
  { id: 1, sideA: 'Password', sideB: 'A secret code to protect an account' },
  { id: 2, sideA: 'Virus', sideB: 'Harmful software' },
  { id: 3, sideA: 'Router', sideB: 'Connects devices to the internet' },
  { id: 4, sideA: 'URL', sideB: "A website's address" },
  { id: 5, sideA: 'Firewall', sideB: 'Blocks unwanted access' },
  { id: 6, sideA: 'Browser', sideB: 'Used to view websites' },
  { id: 7, sideA: 'Download', sideB: 'Save a file from the internet' },
  { id: 8, sideA: 'Cloud', sideB: 'Online storage' },
  { id: 9, sideA: 'Cyberbullying', sideB: 'Being mean to others online' },
  { id: 10, sideA: 'Wi-Fi', sideB: 'Wireless internet connection' },
];
