import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

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

const STRINGS: Record<LangMode, Strings> = {
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
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} namen gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} namen in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
  },
  de: {
    subtitle: 'Asma Match',
    tagline: 'Lerne die 99 Schönen Namen Allahs,\nindem du jeden Namen mit seiner Bedeutung verbindest.',
    namesLearned: (n, total) => `${n} / ${total} Namen gelernt`,
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
      `${pairs} Namen zugeordnet in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Namen insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',
    hear: '🔊 Anhören',
  },
  es: {
    subtitle: 'Asma Match',
    tagline: 'Aprende los 99 Hermosos Nombres de Allah\nasociando cada nombre con su significado.',
    namesLearned: (n, total) => `${n} / ${total} nombres aprendidos`,
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
      `${pairs} nombres emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} nombres aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',
    hear: '🔊 Escuchar',
  },
  fr: {
    subtitle: 'Asma Match',
    tagline: 'Apprenez les 99 Plus Beaux Noms d\'Allah\nen associant chaque nom à sa signification.',
    namesLearned: (n, total) => `${n} / ${total} noms appris`,
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
      `${pairs} noms associés en ${moves} coups\nTemps : ${time}\n${learned} / ${total} noms appris au total`,
    nextLevelHint: 'Le niveau suivant commence…',
    hear: '🔊 Écouter',
  },
};

export const t = createI18n(STRINGS, getLang);
