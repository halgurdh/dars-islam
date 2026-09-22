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
// order these ids already have here. `fact` is a well-known one-line
// distinguishing feature, shared with the Match and Quiz modes below.
export interface Planet {
  id: number;
  name: string;
  fact: string;
}

export const PLANETS: Planet[] = [
  { id: 1, name: 'Mercury', fact: 'The smallest planet' },
  { id: 2, name: 'Venus', fact: 'The hottest planet' },
  { id: 3, name: 'Earth', fact: 'The only planet known to have life' },
  { id: 4, name: 'Mars', fact: 'Known as the Red Planet' },
  { id: 5, name: 'Jupiter', fact: 'The largest planet' },
  { id: 6, name: 'Saturn', fact: 'Famous for its wide rings' },
  { id: 7, name: 'Uranus', fact: 'Spins on its side' },
  { id: 8, name: 'Neptune', fact: 'The windiest planet' },
];

const MASTER: SequenceItem[] = PLANETS.map(({ id, name }) => ({ id, label: name }));

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
