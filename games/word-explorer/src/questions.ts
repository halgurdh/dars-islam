import { getLang } from './systems/Locale';

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
// translated — like world-cultures' `greeting` field): `word`/`lang` never
// change. `meaning` DOES now vary by UI language — real "from your language
// to the word's language" practice, changeable just by switching UI
// language (the in-canvas picker reaches gameplay directly). The one
// exception: when the UI language equals the item's own taught language
// (e.g. UI=Dutch, word is Dutch), meaningFor() falls back to English rather
// than showing the word next to itself.
export interface VocabItem {
  id: number;
  word: string;
  lang: 'nl' | 'de' | 'es' | 'fr' | 'ar';
  meaningEn: string;
  meaningNl: string;
  meaningDe: string;
  meaningEs: string;
  meaningFr: string;
  meaningAr: string;
  /** Rough "learn this first" order — greetings/essentials first, used by Sequence mode. */
  rank: number;
}

export const VOCAB: VocabItem[] = [
  { id: 1, word: 'Hallo', lang: 'nl', meaningEn: 'Hello', meaningNl: 'Hallo', meaningDe: 'Hallo', meaningEs: 'Hola', meaningFr: 'Bonjour', meaningAr: 'مرحبا', rank: 1 },
  { id: 2, word: 'Danke', lang: 'de', meaningEn: 'Thank you', meaningNl: 'Dank je', meaningDe: 'Danke', meaningEs: 'Gracias', meaningFr: 'Merci', meaningAr: 'شكرا', rank: 2 },
  { id: 3, word: 'Por favor', lang: 'es', meaningEn: 'Please', meaningNl: 'Alsjeblieft', meaningDe: 'Bitte', meaningEs: 'Por favor', meaningFr: "S'il vous plaît", meaningAr: 'من فضلك', rank: 3 },
  { id: 4, word: 'نعم', lang: 'ar', meaningEn: 'Yes', meaningNl: 'Ja', meaningDe: 'Ja', meaningEs: 'Sí', meaningFr: 'Oui', meaningAr: 'نعم', rank: 4 },
  { id: 5, word: 'Nee', lang: 'nl', meaningEn: 'No', meaningNl: 'Nee', meaningDe: 'Nein', meaningEs: 'No', meaningFr: 'Non', meaningAr: 'لا', rank: 5 },
  { id: 6, word: 'Au revoir', lang: 'fr', meaningEn: 'Goodbye', meaningNl: 'Tot ziens', meaningDe: 'Auf Wiedersehen', meaningEs: 'Adiós', meaningFr: 'Au revoir', meaningAr: 'مع السلامة', rank: 6 },
  { id: 7, word: 'Eins', lang: 'de', meaningEn: 'One', meaningNl: 'Een', meaningDe: 'Eins', meaningEs: 'Uno', meaningFr: 'Un', meaningAr: 'واحد', rank: 7 },
  { id: 8, word: 'Dos', lang: 'es', meaningEn: 'Two', meaningNl: 'Twee', meaningDe: 'Zwei', meaningEs: 'Dos', meaningFr: 'Deux', meaningAr: 'اثنان', rank: 8 },
  { id: 9, word: 'Trois', lang: 'fr', meaningEn: 'Three', meaningNl: 'Drie', meaningDe: 'Drei', meaningEs: 'Tres', meaningFr: 'Trois', meaningAr: 'ثلاثة', rank: 9 },
  { id: 10, word: 'Wasser', lang: 'de', meaningEn: 'Water', meaningNl: 'Water', meaningDe: 'Wasser', meaningEs: 'Agua', meaningFr: 'Eau', meaningAr: 'ماء', rank: 10 },
  { id: 11, word: 'Madre', lang: 'es', meaningEn: 'Mother', meaningNl: 'Moeder', meaningDe: 'Mutter', meaningEs: 'Madre', meaningFr: 'Mère', meaningAr: 'أم', rank: 11 },
  { id: 12, word: 'Vader', lang: 'nl', meaningEn: 'Father', meaningNl: 'Vader', meaningDe: 'Vater', meaningEs: 'Padre', meaningFr: 'Père', meaningAr: 'أب', rank: 12 },
  { id: 13, word: 'Vriend', lang: 'nl', meaningEn: 'Friend', meaningNl: 'Vriend', meaningDe: 'Freund', meaningEs: 'Amigo', meaningFr: 'Ami', meaningAr: 'صديق', rank: 13 },
  { id: 14, word: 'Bonjour', lang: 'fr', meaningEn: 'Good morning', meaningNl: 'Goedemorgen', meaningDe: 'Guten Morgen', meaningEs: 'Buenos días', meaningFr: 'Bonjour', meaningAr: 'صباح الخير', rank: 14 },
  { id: 15, word: 'أحبك', lang: 'ar', meaningEn: 'I love you', meaningNl: 'Ik hou van je', meaningDe: 'Ich liebe dich', meaningEs: 'Te quiero', meaningFr: "Je t'aime", meaningAr: 'أحبك', rank: 15 },
  { id: 16, word: 'مبروك', lang: 'ar', meaningEn: 'Congratulations', meaningNl: 'Gefeliciteerd', meaningDe: 'Herzlichen Glückwunsch', meaningEs: 'Felicidades', meaningFr: 'Félicitations', meaningAr: 'مبروك', rank: 16 },
];

export function meaningFor(item: VocabItem): string {
  const lang = getLang();
  if (lang === item.lang) return item.meaningEn;
  switch (lang) {
    case 'nl': return item.meaningNl;
    case 'de': return item.meaningDe;
    case 'es': return item.meaningEs;
    case 'fr': return item.meaningFr;
    case 'ar': return item.meaningAr;
    default: return item.meaningEn;
  }
}
