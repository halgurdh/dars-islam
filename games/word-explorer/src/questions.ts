export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Each item teaches ONE word/phrase in ONE specific language (fixed, not
// translated — like world-cultures' `greeting` field). The meaning is
// deliberately kept English-only rather than translated into the site's 6
// UI languages: since the taught languages (nl/de/es/fr/ar) are the SAME
// set as the site's own UI languages, translating "meaning" too would mean
// a player whose UI is already set to, say, German would see the exact
// same word on both sides of a German-teaching item. Keeping meaning fixed
// in English sidesteps that collision regardless of UI language.
export interface VocabItem {
  id: number;
  word: string;
  lang: 'nl' | 'de' | 'es' | 'fr' | 'ar';
  meaning: string;
  /** Rough "learn this first" order — greetings/essentials first, used by Sequence mode. */
  rank: number;
}

export const VOCAB: VocabItem[] = [
  { id: 1, word: 'Hallo', lang: 'nl', meaning: 'Hello', rank: 1 },
  { id: 2, word: 'Danke', lang: 'de', meaning: 'Thank you', rank: 2 },
  { id: 3, word: 'Por favor', lang: 'es', meaning: 'Please', rank: 3 },
  { id: 4, word: 'نعم', lang: 'ar', meaning: 'Yes', rank: 4 },
  { id: 5, word: 'Nee', lang: 'nl', meaning: 'No', rank: 5 },
  { id: 6, word: 'Au revoir', lang: 'fr', meaning: 'Goodbye', rank: 6 },
  { id: 7, word: 'Eins', lang: 'de', meaning: 'One', rank: 7 },
  { id: 8, word: 'Dos', lang: 'es', meaning: 'Two', rank: 8 },
  { id: 9, word: 'Trois', lang: 'fr', meaning: 'Three', rank: 9 },
  { id: 10, word: 'Wasser', lang: 'de', meaning: 'Water', rank: 10 },
  { id: 11, word: 'Madre', lang: 'es', meaning: 'Mother', rank: 11 },
  { id: 12, word: 'Vader', lang: 'nl', meaning: 'Father', rank: 12 },
  { id: 13, word: 'Vriend', lang: 'nl', meaning: 'Friend', rank: 13 },
  { id: 14, word: 'Bonjour', lang: 'fr', meaning: 'Good morning', rank: 14 },
  { id: 15, word: 'أحبك', lang: 'ar', meaning: 'I love you', rank: 15 },
  { id: 16, word: 'مبروك', lang: 'ar', meaning: 'Congratulations', rank: 16 },
];
