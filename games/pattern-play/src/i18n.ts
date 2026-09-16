import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  shapes: string;
  numbers: string;
  oddOneOut: string;
  round: (i: number, total: number) => string;
  score: (n: number) => string;
  menu: string;
  wellDone: string;
  roundSummary: (score: number, total: number) => string;
  playAgain: string;
  backToMenu: string;
  footer: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Pattern Play',
    tagline: 'Spot the pattern and figure out\nwhat comes next.',
    shapes: 'Shape Patterns',
    numbers: 'Number Patterns',
    oddOneOut: 'Odd One Out',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Pattern spotted! 🧩',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Look for what repeats, then guess what comes next.',
  },
  nl: {
    title: 'Pattern Play',
    tagline: 'Ontdek het patroon en\nraad wat er hierna komt.',
    shapes: 'Vormpatronen',
    numbers: 'Getalpatronen',
    oddOneOut: 'Wat hoort er niet bij?',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Patroon gevonden! 🧩',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Zoek wat zich herhaalt en raad wat erna komt.',
  },
  de: {
    title: 'Pattern Play',
    tagline: 'Erkenne das Muster und\nfinde heraus, was als Nächstes kommt.',
    shapes: 'Formmuster',
    numbers: 'Zahlenmuster',
    oddOneOut: 'Was passt nicht?',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Muster erkannt! 🧩',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Suche, was sich wiederholt, und rate, was als Nächstes kommt.',
  },
  es: {
    title: 'Pattern Play',
    tagline: 'Descubre el patrón y\nadivina qué viene después.',
    shapes: 'Patrones de formas',
    numbers: 'Patrones de números',
    oddOneOut: '¿Cuál no encaja?',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Patrón encontrado! 🧩',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Busca lo que se repite y adivina qué sigue.',
  },
  fr: {
    title: 'Pattern Play',
    tagline: 'Repère le motif et\ndevine ce qui vient après.',
    shapes: 'Motifs de formes',
    numbers: 'Suites de nombres',
    oddOneOut: 'L’intrus',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Motif trouvé ! 🧩',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Cherche ce qui se répète, puis devine ce qui vient après.',
  },
};

export const t = createI18n(STRINGS, getLang);
