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
    title: 'World Geography',
    tagline: 'Match each country\nto its capital city.',
    easy: 'Easy · 6 pairs',
    medium: 'Medium · 8 pairs',
    hard: 'Hard · 10 pairs',
    menu: '☰ Menu',
    moves: (n) => `Moves: ${n}`,
    wellDone: 'World explorer! 🌍',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} capitals learned overall`,
    nextLevelHint: 'Next round starting…',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    footer: 'Picture a map in your head — it helps more than you think.',
  },
  nl: {
    title: 'World Geography',
    tagline: 'Koppel elk land aan\nzijn hoofdstad.',
    easy: 'Makkelijk · 6 paren',
    medium: 'Gemiddeld · 8 paren',
    hard: 'Moeilijk · 10 paren',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Wereldontdekker! 🌍',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} hoofdsteden in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    footer: 'Stel je de kaart voor in je hoofd — dat helpt meer dan je denkt.',
  },
  de: {
    title: 'World Geography',
    tagline: 'Ordne jedem Land\nseine Hauptstadt zu.',
    easy: 'Leicht · 6 Paare',
    medium: 'Mittel · 8 Paare',
    hard: 'Schwer · 10 Paare',
    menu: '☰ Menü',
    moves: (n) => `Züge: ${n}`,
    wellDone: 'Weltentdecker! 🌍',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Hauptstädte insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    footer: 'Stell dir die Karte im Kopf vor — das hilft mehr, als du denkst.',
  },
  es: {
    title: 'World Geography',
    tagline: 'Une cada país\ncon su capital.',
    easy: 'Fácil · 6 pares',
    medium: 'Medio · 8 pares',
    hard: 'Difícil · 10 pares',
    menu: '☰ Menú',
    moves: (n) => `Movimientos: ${n}`,
    wellDone: '¡Explorador del mundo! 🌍',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} capitales aprendidas en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    footer: 'Imagina el mapa en tu mente — ayuda más de lo que crees.',
  },
  fr: {
    title: 'World Geography',
    tagline: 'Associe chaque pays\nà sa capitale.',
    easy: 'Facile · 6 paires',
    medium: 'Moyen · 8 paires',
    hard: 'Difficile · 10 paires',
    menu: '☰ Menu',
    moves: (n) => `Coups : ${n}`,
    wellDone: 'Explorateur du monde ! 🌍',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} capitales apprises au total`,
    nextLevelHint: 'La manche suivante commence…',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    footer: 'Imagine la carte dans ta tête — ça aide plus que tu ne le penses.',
  },
};

export const t = createI18n(STRINGS, getLang);
