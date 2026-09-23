export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Each item teaches ONE full everyday sentence/expression in ONE specific
// language (fixed, not translated — same reasoning as word-explorer's
// `word` field: the taught languages are the same set as the site's own UI
// languages, so translating `meaning` too could collide with a player's own
// UI language). This is word-explorer's sibling game: full phrases a
// traveler or learner would actually say, not single vocabulary words.
export interface PhraseItem {
  id: number;
  phrase: string;
  lang: 'nl' | 'de' | 'es' | 'fr' | 'ar';
  meaning: string;
  /** Rough "learn this first" order — greetings/essentials first, used by Sequence mode. */
  rank: number;
}

export const PHRASES: PhraseItem[] = [
  { id: 1, phrase: 'Hoe gaat het met je?', lang: 'nl', meaning: 'How are you?', rank: 1 },
  { id: 2, phrase: 'Wie heißt du?', lang: 'de', meaning: 'What is your name?', rank: 2 },
  { id: 3, phrase: '¿Dónde está el baño?', lang: 'es', meaning: 'Where is the bathroom?', rank: 3 },
  { id: 4, phrase: 'أنا لا أفهم', lang: 'ar', meaning: "I don't understand", rank: 4 },
  { id: 5, phrase: "Pouvez-vous m'aider ?", lang: 'fr', meaning: 'Can you help me?', rank: 5 },
  { id: 6, phrase: 'Tot ziens!', lang: 'nl', meaning: 'See you later!', rank: 6 },
  { id: 7, phrase: 'Wie viel kostet das?', lang: 'de', meaning: 'How much does this cost?', rank: 7 },
  { id: 8, phrase: '¿Qué hora es?', lang: 'es', meaning: 'What time is it?', rank: 8 },
  { id: 9, phrase: 'Je suis perdu', lang: 'fr', meaning: 'I am lost', rank: 9 },
  { id: 10, phrase: 'أين الفندق؟', lang: 'ar', meaning: 'Where is the hotel?', rank: 10 },
  { id: 11, phrase: 'Ik heb honger', lang: 'nl', meaning: 'I am hungry', rank: 11 },
  { id: 12, phrase: 'Guten Appetit!', lang: 'de', meaning: 'Enjoy your meal!', rank: 12 },
  { id: 13, phrase: 'Mucho gusto', lang: 'es', meaning: 'Nice to meet you', rank: 13 },
  { id: 14, phrase: 'Félicitations !', lang: 'fr', meaning: 'Congratulations!', rank: 14 },
  { id: 15, phrase: 'مع السلامة', lang: 'ar', meaning: 'Goodbye', rank: 15 },
  { id: 16, phrase: 'Waar is het station?', lang: 'nl', meaning: 'Where is the station?', rank: 16 },
  { id: 17, phrase: 'Ich brauche Hilfe', lang: 'de', meaning: 'I need help', rank: 17 },
  { id: 18, phrase: '¿Cuánto cuesta esto?', lang: 'es', meaning: 'How much does this cost?', rank: 18 },
];
