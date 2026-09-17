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
  { id: 1, sideA: 'Law', sideB: 'A rule everyone must follow' },
  { id: 2, sideA: 'Vote', sideB: 'Choosing a leader' },
  { id: 3, sideA: 'Citizen', sideB: 'A member of a community' },
  { id: 4, sideA: 'Mayor', sideB: 'Leader of a city' },
  { id: 5, sideA: 'Tax', sideB: 'Money paid to the government' },
  { id: 6, sideA: 'Democracy', sideB: 'Rule by the people' },
  { id: 7, sideA: 'Constitution', sideB: "A country's basic laws" },
  { id: 8, sideA: 'Ballot', sideB: 'A paper used to vote' },
  { id: 9, sideA: 'Rights', sideB: 'Freedoms everyone has' },
  { id: 10, sideA: 'Community', sideB: 'People living in the same area' },
];
