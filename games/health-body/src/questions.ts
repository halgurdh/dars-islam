export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Body part ↔ function, with an approximate average adult weight (grams) so
// Weight Sort tests real "which is heavier?" intuition — most people don't
// guess that skin outweighs the brain, or muscles outweigh the skeleton.
export interface BodyPart {
  id: number;
  part: string;
  fn: string;
  weightGrams: number;
}

export const BODY_PARTS: BodyPart[] = [
  { id: 1, part: 'Heart', fn: 'Pumps blood', weightGrams: 300 },
  { id: 2, part: 'Lungs', fn: 'Help you breathe', weightGrams: 1090 },
  { id: 3, part: 'Brain', fn: 'Controls the body', weightGrams: 1400 },
  { id: 4, part: 'Stomach', fn: 'Digests food', weightGrams: 150 },
  { id: 5, part: 'Skin', fn: 'Protects the body', weightGrams: 3600 },
  { id: 6, part: 'Muscles', fn: 'Help you move', weightGrams: 28_000 },
  { id: 7, part: 'Bones', fn: 'Support the body', weightGrams: 10_000 },
  { id: 8, part: 'Kidneys', fn: 'Filter the blood', weightGrams: 290 },
  { id: 9, part: 'Eyes', fn: 'Help you see', weightGrams: 14 },
  { id: 10, part: 'Ears', fn: 'Help you hear', weightGrams: 30 },
];
