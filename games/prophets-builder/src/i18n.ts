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
    subtitle: 'Prophets Builder',
    tagline: 'Learn the Prophets\nby spelling each name.',
    itemsLearned: (n, total) => `${n} / ${total} prophets learned`,
    easy: 'Easy · 8 prophets',
    medium: 'Medium · 15 prophets',
    hard: 'Hard · 25 prophets',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} prophets spelled in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} prophets learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
    modeArabic: '🔤 Arabic',
    modeToTranslation: '✍️ AR → EN',
    modeToArabic: '🔤 EN → AR',
    typeAnswerPlaceholder: 'Type the meaning…',
    checkAnswer: 'Check',
  },
  nl: {
    subtitle: 'Prophets Builder',
    tagline: 'Leer de profeten\ndoor elke naam te spellen.',
    itemsLearned: (n, total) => `${n} / ${total} profeten geleerd`,
    easy: 'Makkelijk · 8 profeten',
    medium: 'Gemiddeld · 15 profeten',
    hard: 'Moeilijk · 25 profeten',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} profeten gespeld in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} profeten in totaal geleerd`,
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
