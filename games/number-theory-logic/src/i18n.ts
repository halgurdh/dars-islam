import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
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
    title: 'Number Theory & Logic',
    tagline: 'Primes, factors, multiples\nand number patterns.',
    easy: 'Easy · Primes & Multiples',
    medium: 'Medium · GCF & LCM',
    hard: 'Hard · Patterns & Remainders',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Logical thinker! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'List the factors out on paper — patterns jump out once you see them all.',
  },
  nl: {
    title: 'Number Theory & Logic',
    tagline: 'Priemgetallen, factoren, veelvouden\nen getalpatronen.',
    easy: 'Makkelijk · Priemgetallen & Veelvouden',
    medium: 'Gemiddeld · GGD & KGV',
    hard: 'Moeilijk · Patronen & Restwaarden',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Logisch denker! 🔢',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Schrijf de factoren op papier — patronen vallen op als je ze allemaal ziet.',
  },
  de: {
    title: 'Number Theory & Logic',
    tagline: 'Primzahlen, Faktoren, Vielfache\nund Zahlenmuster.',
    easy: 'Leicht · Primzahlen & Vielfache',
    medium: 'Mittel · ggT & kgV',
    hard: 'Schwer · Muster & Reste',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Logisches Denken! 🔢',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Schreib die Faktoren auf — Muster fallen auf, wenn du sie alle siehst.',
  },
  es: {
    title: 'Number Theory & Logic',
    tagline: 'Números primos, factores, múltiplos\ny patrones numéricos.',
    easy: 'Fácil · Primos y múltiplos',
    medium: 'Medio · MCD y MCM',
    hard: 'Difícil · Patrones y restos',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Pensador lógico! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Escribe los factores en papel — los patrones se ven mejor todos juntos.',
  },
  fr: {
    title: 'Number Theory & Logic',
    tagline: 'Nombres premiers, facteurs, multiples\net motifs numériques.',
    easy: 'Facile · Premiers et multiples',
    medium: 'Moyen · PGCD et PPCM',
    hard: 'Difficile · Motifs et restes',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Esprit logique ! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Écris les facteurs sur papier — les motifs sautent aux yeux une fois réunis.',
  },
};

export const t = createI18n(STRINGS, getLang);
