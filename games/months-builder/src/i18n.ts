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
  modeArabic: string;
  modeToTranslation: string;
  modeToArabic: string;
  typeAnswerPlaceholder: string;
  checkAnswer: string;
}

const STRINGS: Record<'en' | 'nl', Strings> = {
  en: {
    subtitle: 'Months Builder',
    tagline: 'Learn the 12 Islamic months\nby spelling each one.',
    itemsLearned: (n, total) => `${n} / ${total} months learned`,
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
      `${items} months spelled in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} months learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
    modeArabic: '🔤 Arabic',
    modeToTranslation: '✍️ AR → EN',
    modeToArabic: '🔤 EN → AR',
    typeAnswerPlaceholder: 'Type the meaning…',
    checkAnswer: 'Check',
  },
  nl: {
    subtitle: 'Months Builder',
    tagline: 'Leer de 12 islamitische maanden\ndoor elke maand te spellen.',
    itemsLearned: (n, total) => `${n} / ${total} maanden geleerd`,
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
      `${items} maanden gespeld in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} maanden in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → NL',
    modeToArabic: '🔤 NL → AR',
    typeAnswerPlaceholder: 'Typ de betekenis…',
    checkAnswer: 'Controleer',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
