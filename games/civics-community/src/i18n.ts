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
    title: 'Civics & Community',
    tagline: 'Match each civics term\nto its meaning.',
    easy: 'Easy · 6 pairs',
    medium: 'Medium · 8 pairs',
    hard: 'Hard · 10 pairs',
    menu: '☰ Menu',
    moves: (n) => `Moves: ${n}`,
    wellDone: 'Great citizen! 🏛️',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} terms learned overall`,
    nextLevelHint: 'Next round starting…',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    footer: 'Think about your own neighborhood — these words show up there too.',
  },
  nl: {
    title: 'Civics & Community',
    tagline: 'Koppel elke term aan\nzijn betekenis.',
    easy: 'Makkelijk · 6 paren',
    medium: 'Gemiddeld · 8 paren',
    hard: 'Moeilijk · 10 paren',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Geweldige burger! 🏛️',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} termen in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    footer: 'Denk aan je eigen buurt — deze woorden kom je daar ook tegen.',
  },
  de: {
    title: 'Civics & Community',
    tagline: 'Ordne jedem Begriff\nseine Bedeutung zu.',
    easy: 'Leicht · 6 Paare',
    medium: 'Mittel · 8 Paare',
    hard: 'Schwer · 10 Paare',
    menu: '☰ Menü',
    moves: (n) => `Züge: ${n}`,
    wellDone: 'Toller Bürger! 🏛️',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Begriffe insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    footer: 'Denk an deine eigene Nachbarschaft — diese Begriffe begegnen dir dort auch.',
  },
  es: {
    title: 'Civics & Community',
    tagline: 'Une cada término cívico\ncon su significado.',
    easy: 'Fácil · 6 pares',
    medium: 'Medio · 8 pares',
    hard: 'Difícil · 10 pares',
    menu: '☰ Menú',
    moves: (n) => `Movimientos: ${n}`,
    wellDone: '¡Gran ciudadano! 🏛️',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} términos aprendidos en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    footer: 'Piensa en tu propio barrio — estas palabras también aparecen allí.',
  },
  fr: {
    title: 'Civics & Community',
    tagline: 'Associe chaque terme civique\nà sa signification.',
    easy: 'Facile · 6 paires',
    medium: 'Moyen · 8 paires',
    hard: 'Difficile · 10 paires',
    menu: '☰ Menu',
    moves: (n) => `Coups : ${n}`,
    wellDone: 'Excellent citoyen ! 🏛️',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} termes appris au total`,
    nextLevelHint: 'La manche suivante commence…',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    footer: 'Pense à ton propre quartier — ces mots y apparaissent aussi.',
  },
};

export const t = createI18n(STRINGS, getLang);
