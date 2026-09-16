import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  subtitle: string;
  tagline: string;
  surahsLearned: (n: number, total: number) => string;
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

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Learn short surahs from Juz’ Amma\nby matching each name to its meaning.',
    surahsLearned: (n, total) => `${n} / ${total} surahs learned`,
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
      `${pairs} surahs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} surahs learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
  },
  nl: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Leer korte surahs uit Juz’ Amma\ndoor elke naam aan de betekenis te koppelen.',
    surahsLearned: (n, total) => `${n} / ${total} surahs geleerd`,
    easy: 'Makkelijk · 6 paren',
    medium: 'Gemiddeld · 8 paren',
    hard: 'Moeilijk · 10 paren',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} surahs gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} surahs in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
  },
  de: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Lerne kurze Suren aus Juz’ Amma,\nindem du jeden Namen mit seiner Bedeutung verbindest.',
    surahsLearned: (n, total) => `${n} / ${total} Suren gelernt`,
    easy: 'Leicht · 6 Paare',
    medium: 'Mittel · 8 Paare',
    hard: 'Schwer · 10 Paare',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    moves: (n) => `Züge: ${n}`,
    wellDone: 'Gut gemacht! 🌿',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Suren zugeordnet in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Suren insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',
    hear: '🔊 Anhören',
  },
  es: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Aprende suras cortas de Juz’ Amma\nasociando cada nombre con su significado.',
    surahsLearned: (n, total) => `${n} / ${total} suras aprendidas`,
    easy: 'Fácil · 6 pares',
    medium: 'Medio · 8 pares',
    hard: 'Difícil · 10 pares',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    moves: (n) => `Movimientos: ${n}`,
    wellDone: '¡Bien hecho! 🌿',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} suras emparejadas en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} suras aprendidas en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',
    hear: '🔊 Escuchar',
  },
  fr: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Apprends de courtes sourates du Juz’ Amma\nen associant chaque nom à sa signification.',
    surahsLearned: (n, total) => `${n} / ${total} sourates apprises`,
    easy: 'Facile · 6 paires',
    medium: 'Moyen · 8 paires',
    hard: 'Difficile · 10 paires',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    moves: (n) => `Coups : ${n}`,
    wellDone: 'Bien joué ! 🌿',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} sourates associées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} sourates apprises au total`,
    nextLevelHint: 'Le niveau suivant commence…',
    hear: '🔊 Écouter',
  },
};

export const t = createI18n(STRINGS, getLang);
