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
    title: 'Arabic Grammar Basics',
    tagline: 'Match each word\nto its plural form.',
    easy: 'Easy · 4 pairs',
    medium: 'Medium · 6 pairs',
    hard: 'Hard · 8 pairs',
    menu: '☰ Menu',
    moves: (n) => `Moves: ${n}`,
    wellDone: 'Excellent, ما شاء الله! 📖',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} words learned overall`,
    nextLevelHint: 'Next round starting…',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    footer: 'Say the words out loud — grammar sticks better when you hear it.',
  },
  nl: {
    title: 'Arabic Grammar Basics',
    tagline: 'Koppel elk woord aan\nzijn meervoudsvorm.',
    easy: 'Makkelijk · 4 paren',
    medium: 'Gemiddeld · 6 paren',
    hard: 'Moeilijk · 8 paren',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Uitstekend, ما شاء الله! 📖',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} woorden in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    footer: 'Zeg de woorden hardop — grammatica blijft beter hangen als je het hoort.',
  },
  de: {
    title: 'Arabic Grammar Basics',
    tagline: 'Ordne jedem Wort\nseine Pluralform zu.',
    easy: 'Leicht · 4 Paare',
    medium: 'Mittel · 6 Paare',
    hard: 'Schwer · 8 Paare',
    menu: '☰ Menü',
    moves: (n) => `Züge: ${n}`,
    wellDone: 'Ausgezeichnet, ما شاء الله! 📖',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Wörter insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    footer: 'Sprich die Wörter laut aus — Grammatik bleibt besser hängen, wenn man sie hört.',
  },
  es: {
    title: 'Arabic Grammar Basics',
    tagline: 'Une cada palabra\ncon su forma plural.',
    easy: 'Fácil · 4 pares',
    medium: 'Medio · 6 pares',
    hard: 'Difícil · 8 pares',
    menu: '☰ Menú',
    moves: (n) => `Movimientos: ${n}`,
    wellDone: '¡Excelente, ما شاء الله! 📖',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} palabras aprendidas en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    footer: 'Di las palabras en voz alta — la gramática se aprende mejor al oírla.',
  },
  fr: {
    title: 'Arabic Grammar Basics',
    tagline: 'Associe chaque mot\nà sa forme plurielle.',
    easy: 'Facile · 4 paires',
    medium: 'Moyen · 6 paires',
    hard: 'Difficile · 8 paires',
    menu: '☰ Menu',
    moves: (n) => `Coups : ${n}`,
    wellDone: 'Excellent, ما شاء الله ! 📖',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} mots appris au total`,
    nextLevelHint: 'La manche suivante commence…',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    footer: 'Prononce les mots à voix haute — la grammaire s\'ancre mieux en l\'entendant.',
  },
};

export const t = createI18n(STRINGS, getLang);
