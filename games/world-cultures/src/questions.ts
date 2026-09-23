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

// Greeting ↔ language, with approximate total speakers (millions, L1+L2)
// so Speaker Sort tests real "which language is spoken by more people?"
// intuition instead of an alphabetical sort. The greeting word itself is
// the foreign word being taught, so it's never translated — only the
// language *name* is.
export interface Greeting {
  id: number;
  greeting: string;
  languageEn: string; languageNl: string; languageDe: string; languageEs: string; languageFr: string; languageAr: string;
  speakersMillions: number;
}

export const GREETINGS: Greeting[] = [
  { id: 1, greeting: 'Hola', languageEn: 'Spanish', languageNl: 'Spaans', languageDe: 'Spanisch', languageEs: 'Español', languageFr: 'Espagnol', languageAr: 'الإسبانية', speakersMillions: 560 },
  { id: 2, greeting: 'Bonjour', languageEn: 'French', languageNl: 'Frans', languageDe: 'Französisch', languageEs: 'Francés', languageFr: 'Français', languageAr: 'الفرنسية', speakersMillions: 280 },
  { id: 3, greeting: 'Konnichiwa', languageEn: 'Japanese', languageNl: 'Japans', languageDe: 'Japanisch', languageEs: 'Japonés', languageFr: 'Japonais', languageAr: 'اليابانية', speakersMillions: 125 },
  { id: 4, greeting: 'Guten Tag', languageEn: 'German', languageNl: 'Duits', languageDe: 'Deutsch', languageEs: 'Alemán', languageFr: 'Allemand', languageAr: 'الألمانية', speakersMillions: 135 },
  { id: 5, greeting: 'Ciao', languageEn: 'Italian', languageNl: 'Italiaans', languageDe: 'Italienisch', languageEs: 'Italiano', languageFr: 'Italien', languageAr: 'الإيطالية', speakersMillions: 65 },
  { id: 6, greeting: 'Namaste', languageEn: 'Hindi', languageNl: 'Hindi', languageDe: 'Hindi', languageEs: 'Hindi', languageFr: 'Hindi', languageAr: 'الهندية', speakersMillions: 600 },
  { id: 7, greeting: 'Merhaba', languageEn: 'Turkish', languageNl: 'Turks', languageDe: 'Türkisch', languageEs: 'Turco', languageFr: 'Turc', languageAr: 'التركية', speakersMillions: 80 },
  { id: 8, greeting: 'Shalom', languageEn: 'Hebrew', languageNl: 'Hebreeuws', languageDe: 'Hebräisch', languageEs: 'Hebreo', languageFr: 'Hébreu', languageAr: 'العبرية', speakersMillions: 9 },
  { id: 9, greeting: 'Ni Hao', languageEn: 'Chinese', languageNl: 'Chinees', languageDe: 'Chinesisch', languageEs: 'Chino', languageFr: 'Chinois', languageAr: 'الصينية', speakersMillions: 1100 },
  { id: 10, greeting: 'Olá', languageEn: 'Portuguese', languageNl: 'Portugees', languageDe: 'Portugiesisch', languageEs: 'Portugués', languageFr: 'Portugais', languageAr: 'البرتغالية', speakersMillions: 260 },
];

export function languageFor(item: Greeting): string {
  switch (getLang()) {
    case 'nl': return item.languageNl;
    case 'de': return item.languageDe;
    case 'es': return item.languageEs;
    case 'fr': return item.languageFr;
    case 'ar': return item.languageAr;
    default: return item.languageEn;
  }
}
