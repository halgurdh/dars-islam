import { getLang } from './systems/Locale';

interface Strings {
  subtitle: string;
  tagline: string;
  itemsLearned: (n: number, total: number) => string;
  easy: string;
  medium: string;
  hard: string;
  soundOn: string;
  soundOff: string;
  langToggle: string;
  footer: string;
  menu: string;
  mistakes: (n: number) => string;
  wellDone: string;
  roundSummary: (items: number, mistakes: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;
  hear: string;
}

const STRINGS: Record<'en' | 'nl', Strings> = {
  en: {
    subtitle: 'Phrases Builder',
    tagline: 'Learn everyday Islamic phrases\nby building each one, word by word.',
    itemsLearned: (n, total) => `${n} / ${total} phrases learned`,
    easy: 'Easy · 4 phrases',
    medium: 'Medium · 7 phrases',
    hard: 'Hard · 10 phrases',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} phrases built in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} phrases learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
  },
  nl: {
    subtitle: 'Phrases Builder',
    tagline: 'Leer alledaagse islamitische uitdrukkingen\ndoor elke zin woord voor woord op te bouwen.',
    itemsLearned: (n, total) => `${n} / ${total} uitdrukkingen geleerd`,
    easy: 'Makkelijk · 4 uitdrukkingen',
    medium: 'Gemiddeld · 7 uitdrukkingen',
    hard: 'Moeilijk · 10 uitdrukkingen',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} uitdrukkingen gebouwd in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} uitdrukkingen in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
