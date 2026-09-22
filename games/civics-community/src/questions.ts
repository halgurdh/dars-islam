export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Term ↔ definition, with a "scope" rank — how many people the idea
// concerns, from a single person up to a whole nation — so Scope Sort tests
// real civics understanding instead of an alphabetical sort.
export interface CivicsTerm {
  id: number;
  term: string;
  meaning: string;
  scope: number;
}

export const TERMS: CivicsTerm[] = [
  { id: 1, term: 'Citizen', meaning: 'A member of a community', scope: 1 },
  { id: 2, term: 'Vote', meaning: 'Choosing a leader', scope: 2 },
  { id: 3, term: 'Ballot', meaning: 'A paper used to vote', scope: 3 },
  { id: 4, term: 'Rights', meaning: 'Freedoms everyone has', scope: 4 },
  { id: 5, term: 'Community', meaning: 'People living in the same area', scope: 5 },
  { id: 6, term: 'Mayor', meaning: 'Leader of a city', scope: 6 },
  { id: 7, term: 'Tax', meaning: 'Money paid to the government', scope: 7 },
  { id: 8, term: 'Law', meaning: 'A rule everyone must follow', scope: 8 },
  { id: 9, term: 'Constitution', meaning: "A country's basic laws", scope: 9 },
  { id: 10, term: 'Democracy', meaning: 'Rule by the people', scope: 10 },
];
