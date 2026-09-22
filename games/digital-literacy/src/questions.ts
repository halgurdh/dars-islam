export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Term ↔ definition, with a "layer" rank from the internet's physical
// hardware up to online human behavior — so Layer Sort tests a real mental
// model of how the internet is built, not an alphabetical sort.
export interface TechTerm {
  id: number;
  term: string;
  meaning: string;
  layer: number;
}

export const TERMS: TechTerm[] = [
  { id: 1, term: 'Wi-Fi', meaning: 'Wireless internet connection', layer: 1 },
  { id: 2, term: 'Router', meaning: 'Connects devices to the internet', layer: 2 },
  { id: 3, term: 'Firewall', meaning: 'Blocks unwanted access', layer: 3 },
  { id: 4, term: 'Browser', meaning: 'Used to view websites', layer: 4 },
  { id: 5, term: 'URL', meaning: "A website's address", layer: 5 },
  { id: 6, term: 'Download', meaning: 'Save a file from the internet', layer: 6 },
  { id: 7, term: 'Cloud', meaning: 'Online storage', layer: 7 },
  { id: 8, term: 'Password', meaning: 'A secret code to protect an account', layer: 8 },
  { id: 9, term: 'Virus', meaning: 'Harmful software', layer: 9 },
  { id: 10, term: 'Cyberbullying', meaning: 'Being mean to others online', layer: 10 },
];
