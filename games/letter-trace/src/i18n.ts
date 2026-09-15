import { getLang } from './systems/Locale';

interface Strings {
  subtitle: string;
  tagline: string;
  alphabetArabic: string;
  alphabetEnglish: string;
  itemsLearned: (n: number, total: number) => string;
  start: string;
  soundOn: string;
  soundOff: string;
  langToggle: string;
  footer: string;
  menu: string;
  accuracy: (n: number) => string;
  coverage: (n: number) => string;
  hear: string;
  reset: string;
  wellDone: string;
  itemComplete: string;
  roundSummary: (items: number, total: number) => string;
  nextLevelHint: string;
  playAgain: string;
}

const STRINGS: Record<'en' | 'nl', Strings> = {
  en: {
    subtitle: 'Letter Trace',
    tagline: 'Practice handwriting by tracing each letter\nwith your finger or mouse.',
    alphabetArabic: '🔤 Arabic',
    alphabetEnglish: '🔤 English',
    itemsLearned: (n, total) => `${n} / ${total} letters traced`,
    start: 'Start',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    accuracy: (n) => `Accuracy: ${n}%`,
    coverage: (n) => `Coverage: ${n}%`,
    hear: '🔊 Hear it',
    reset: '↻ Reset / Try Again',
    wellDone: 'Well done! 🌿',
    itemComplete: 'Nicely traced!',
    roundSummary: (items, total) => `${items} letters traced this round\n${total} learned overall`,
    nextLevelHint: 'Next letter starting…',
    playAgain: '↻ Practice Again',
  },
  nl: {
    subtitle: 'Letter Trace',
    tagline: 'Oefen met schrijven door elke letter\nmet je vinger of muis na te trekken.',
    alphabetArabic: '🔤 Arabisch',
    alphabetEnglish: '🔤 Engels',
    itemsLearned: (n, total) => `${n} / ${total} letters getraced`,
    start: 'Start',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    accuracy: (n) => `Nauwkeurigheid: ${n}%`,
    coverage: (n) => `Dekking: ${n}%`,
    hear: '🔊 Uitspraak',
    reset: '↻ Reset / Opnieuw',
    wellDone: 'Goed gedaan! 🌿',
    itemComplete: 'Mooi getraced!',
    roundSummary: (items, total) => `${items} letters getraced deze ronde\n${total} in totaal geleerd`,
    nextLevelHint: 'Volgende letter begint…',
    playAgain: '↻ Nog een keer',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
