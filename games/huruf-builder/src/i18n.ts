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
    subtitle: 'Huruf Builder',
    tagline: 'Learn the Arabic alphabet\nby spelling each letter’s name.',
    itemsLearned: (n, total) => `${n} / ${total} letters learned`,
    easy: 'Easy · 6 letters',
    medium: 'Medium · 10 letters',
    hard: 'Hard · 16 letters',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} letters spelled in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} letters learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
    modeArabic: '🔤 Arabic',
    modeToTranslation: '✍️ AR → EN',
    modeToArabic: '🔤 EN → AR',
    typeAnswerPlaceholder: 'Type the meaning…',
    checkAnswer: 'Check',
  },
  nl: {
    subtitle: 'Huruf Builder',
    tagline: 'Leer het Arabische alfabet\ndoor de naam van elke letter te spellen.',
    itemsLearned: (n, total) => `${n} / ${total} letters geleerd`,
    easy: 'Makkelijk · 6 letters',
    medium: 'Gemiddeld · 10 letters',
    hard: 'Moeilijk · 16 letters',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} letters gespeld in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} letters in totaal geleerd`,
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
