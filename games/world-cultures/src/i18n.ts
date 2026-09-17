import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  menu: string;
  moves: (n: number) => string;
  wellDone: string;
  roundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;
  soundOn: string;
  soundOff: string;
  footer: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'World Cultures',
    tagline: 'Match each greeting\nto its language.',
    easy: 'Easy · 6 pairs',
    medium: 'Medium · 8 pairs',
    hard: 'Hard · 10 pairs',
    menu: '☰ Menu',
    moves: (n) => `Moves: ${n}`,
    wellDone: 'Global citizen! 🌐',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} greetings learned overall`,
    nextLevelHint: 'Next round starting…',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    footer: 'Try saying each greeting out loud — every culture has something worth learning.',
  },
  nl: {
    title: 'World Cultures',
    tagline: 'Koppel elke begroeting aan\nzijn taal.',
    easy: 'Makkelijk · 6 paren',
    medium: 'Gemiddeld · 8 paren',
    hard: 'Moeilijk · 10 paren',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Wereldburger! 🌐',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} begroetingen in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    footer: 'Zeg elke begroeting hardop — elke cultuur heeft iets waardevols om te leren.',
  },
  de: {
    title: 'World Cultures',
    tagline: 'Ordne jedem Gruß\nseine Sprache zu.',
    easy: 'Leicht · 6 Paare',
    medium: 'Mittel · 8 Paare',
    hard: 'Schwer · 10 Paare',
    menu: '☰ Menü',
    moves: (n) => `Züge: ${n}`,
    wellDone: 'Weltbürger! 🌐',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Grüße insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    footer: 'Sprich jeden Gruß laut aus — jede Kultur hat etwas Wertvolles zu bieten.',
  },
  es: {
    title: 'World Cultures',
    tagline: 'Une cada saludo\ncon su idioma.',
    easy: 'Fácil · 6 pares',
    medium: 'Medio · 8 pares',
    hard: 'Difícil · 10 pares',
    menu: '☰ Menú',
    moves: (n) => `Movimientos: ${n}`,
    wellDone: '¡Ciudadano del mundo! 🌐',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} saludos aprendidos en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    footer: 'Di cada saludo en voz alta — cada cultura tiene algo valioso que enseñar.',
  },
  fr: {
    title: 'World Cultures',
    tagline: 'Associe chaque salutation\nà sa langue.',
    easy: 'Facile · 6 paires',
    medium: 'Moyen · 8 paires',
    hard: 'Difficile · 10 paires',
    menu: '☰ Menu',
    moves: (n) => `Coups : ${n}`,
    wellDone: 'Citoyen du monde ! 🌐',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} salutations apprises au total`,
    nextLevelHint: 'La manche suivante commence…',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    footer: 'Prononce chaque salutation à voix haute — chaque culture a quelque chose à offrir.',
  },
};

export const t = createI18n(STRINGS, getLang);
