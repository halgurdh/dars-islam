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

// Word ↔ synonym — a real synonym pair chosen independently in each
// language (not a literal translation of the English pair), so the game
// stays "match the synonym" in whichever language is selected instead of
// "translate this English word."
export interface SynonymPair {
  id: number;
  wordAEn: string; wordANl: string; wordADe: string; wordAEs: string; wordAFr: string; wordAAr: string;
  wordBEn: string; wordBNl: string; wordBDe: string; wordBEs: string; wordBFr: string; wordBAr: string;
}

export const ITEMS: SynonymPair[] = [
  { id: 1, wordAEn: 'Happy', wordANl: 'Blij', wordADe: 'Glücklich', wordAEs: 'Feliz', wordAFr: 'Heureux', wordAAr: 'سعيد',
    wordBEn: 'Joyful', wordBNl: 'Vrolijk', wordBDe: 'Froh', wordBEs: 'Alegre', wordBFr: 'Joyeux', wordBAr: 'مسرور' },
  { id: 2, wordAEn: 'Big', wordANl: 'Groot', wordADe: 'Groß', wordAEs: 'Grande', wordAFr: 'Grand', wordAAr: 'كبير',
    wordBEn: 'Huge', wordBNl: 'Enorm', wordBDe: 'Riesig', wordBEs: 'Enorme', wordBFr: 'Énorme', wordBAr: 'ضخم' },
  { id: 3, wordAEn: 'Fast', wordANl: 'Snel', wordADe: 'Schnell', wordAEs: 'Rápido', wordAFr: 'Rapide', wordAAr: 'سريع',
    wordBEn: 'Quick', wordBNl: 'Vlug', wordBDe: 'Flink', wordBEs: 'Veloz', wordBFr: 'Prompt', wordBAr: 'عاجل' },
  { id: 4, wordAEn: 'Smart', wordANl: 'Slim', wordADe: 'Klug', wordAEs: 'Inteligente', wordAFr: 'Intelligent', wordAAr: 'ذكي',
    wordBEn: 'Clever', wordBNl: 'Pienter', wordBDe: 'Schlau', wordBEs: 'Astuto', wordBFr: 'Astucieux', wordBAr: 'بارع' },
  { id: 5, wordAEn: 'Sad', wordANl: 'Verdrietig', wordADe: 'Traurig', wordAEs: 'Triste', wordAFr: 'Triste', wordAAr: 'حزين',
    wordBEn: 'Unhappy', wordBNl: 'Bedroefd', wordBDe: 'Betrübt', wordBEs: 'Apenado', wordBFr: 'Peiné', wordBAr: 'مغموم' },
  { id: 6, wordAEn: 'Small', wordANl: 'Klein', wordADe: 'Klein', wordAEs: 'Pequeño', wordAFr: 'Petit', wordAAr: 'صغير',
    wordBEn: 'Tiny', wordBNl: 'Piepklein', wordBDe: 'Winzig', wordBEs: 'Diminuto', wordBFr: 'Minuscule', wordBAr: 'ضئيل' },
  { id: 7, wordAEn: 'Begin', wordANl: 'Begin', wordADe: 'Anfang', wordAEs: 'Comienzo', wordAFr: 'Début', wordAAr: 'بداية',
    wordBEn: 'Start', wordBNl: 'Aanvang', wordBDe: 'Beginn', wordBEs: 'Inicio', wordBFr: 'Commencement', wordBAr: 'انطلاق' },
  { id: 8, wordAEn: 'End', wordANl: 'Einde', wordADe: 'Ende', wordAEs: 'Fin', wordAFr: 'Fin', wordAAr: 'نهاية',
    wordBEn: 'Finish', wordBNl: 'Slot', wordBDe: 'Schluss', wordBEs: 'Final', wordBFr: 'Achèvement', wordBAr: 'ختام' },
  { id: 9, wordAEn: 'Cold', wordANl: 'Koud', wordADe: 'Kalt', wordAEs: 'Frío', wordAFr: 'Froid', wordAAr: 'بارد',
    wordBEn: 'Chilly', wordBNl: 'Kil', wordBDe: 'Kühl', wordBEs: 'Fresco', wordBFr: 'Frais', wordBAr: 'قارس' },
  { id: 10, wordAEn: 'Loud', wordANl: 'Luid', wordADe: 'Laut', wordAEs: 'Ruidoso', wordAFr: 'Bruyant', wordAAr: 'صاخب',
    wordBEn: 'Noisy', wordBNl: 'Lawaaierig', wordBDe: 'Lärmend', wordBEs: 'Estridente', wordBFr: 'Sonore', wordBAr: 'مدوٍ' },
];

export function wordAFor(item: SynonymPair): string {
  switch (getLang()) {
    case 'nl': return item.wordANl;
    case 'de': return item.wordADe;
    case 'es': return item.wordAEs;
    case 'fr': return item.wordAFr;
    case 'ar': return item.wordAAr;
    default: return item.wordAEn;
  }
}

export function wordBFor(item: SynonymPair): string {
  switch (getLang()) {
    case 'nl': return item.wordBNl;
    case 'de': return item.wordBDe;
    case 'es': return item.wordBEs;
    case 'fr': return item.wordBFr;
    case 'ar': return item.wordBAr;
    default: return item.wordBEn;
  }
}
