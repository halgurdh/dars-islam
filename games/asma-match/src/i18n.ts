import { getLang } from './systems/Locale';

interface Strings {
  subtitle: string;
  tagline: string;
  namesLearned: (n: number, total: number) => string;
  easy: string;
  medium: string;
  hard: string;
  soundOn: string;
  soundOff: string;
  langToggle: string;
  footer: string;
  menu: string;
  moves: (n: number) => string;
  wellDone: string;
  roundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;
  hear: string;
}

const STRINGS: Record<'en' | 'nl', Strings> = {
  en: {
    subtitle: 'Asma Match',
    tagline: 'Learn the 99 Beautiful Names of Allah\nby matching each name to its meaning.',
    namesLearned: (n, total) => `${n} / ${total} names learned`,
    easy: 'Easy · 6 pairs',
    medium: 'Medium · 8 pairs',
    hard: 'Hard · 10 pairs',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    moves: (n) => `Moves: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} names matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} names learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
  },
  nl: {
    subtitle: 'Asma Match',
    tagline: 'Leer de 99 Mooie Namen van Allah\ndoor elke naam aan de betekenis te koppelen.',
    namesLearned: (n, total) => `${n} / ${total} namen geleerd`,
    easy: 'Makkelijk · 6 paren',
    medium: 'Gemiddeld · 8 paren',
    hard: 'Moeilijk · 10 paren',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} namen gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} namen in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
  },
};

export function t(): Strings {
  return STRINGS[getLang()];
}
