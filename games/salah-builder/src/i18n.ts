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
    subtitle: 'Salah Builder',
    tagline: 'Learn the steps of the daily prayer\nby spelling each one.',
    itemsLearned: (n, total) => `${n} / ${total} steps learned`,
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} steps spelled in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} steps learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
  },
  nl: {
    subtitle: 'Salah Builder',
    tagline: 'Leer de stappen van het gebed\ndoor elke stap te spellen.',
    itemsLearned: (n, total) => `${n} / ${total} stappen geleerd`,
    easy: 'Makkelijk',
    medium: 'Gemiddeld',
    hard: 'Moeilijk',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} stappen gespeld in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} stappen in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
