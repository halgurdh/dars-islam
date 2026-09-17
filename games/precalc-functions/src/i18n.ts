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
    title: 'Pre-Calc Functions',
    tagline: 'Function notation, graphs,\ncomposition and inverses.',
    easy: 'Easy · Notation & Domain',
    medium: 'Medium · Linear & Quadratic',
    hard: 'Hard · Composition & Inverses',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Function master! 📈',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Work from the inside out for composed functions — f(g(x)) means do g first.',
  },
  nl: {
    title: 'Pre-Calc Functions',
    tagline: 'Functienotatie, grafieken,\nsamenstelling en inverse functies.',
    easy: 'Makkelijk · Notatie & Domein',
    medium: 'Gemiddeld · Lineair & Kwadratisch',
    hard: 'Moeilijk · Samenstelling & Inverse',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Functiemeester! 📈',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Werk van binnen naar buiten bij samengestelde functies — f(g(x)) betekent eerst g.',
  },
  de: {
    title: 'Pre-Calc Functions',
    tagline: 'Funktionsschreibweise, Graphen,\nVerkettung und Umkehrfunktionen.',
    easy: 'Leicht · Schreibweise & Definitionsbereich',
    medium: 'Mittel · Linear & Quadratisch',
    hard: 'Schwer · Verkettung & Umkehrfunktion',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Funktionsmeister! 📈',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Arbeite bei verketteten Funktionen von innen nach außen — f(g(x)) heißt zuerst g.',
  },
  es: {
    title: 'Pre-Calc Functions',
    tagline: 'Notación de funciones, gráficos,\ncomposición e inversas.',
    easy: 'Fácil · Notación y dominio',
    medium: 'Medio · Lineal y cuadrática',
    hard: 'Difícil · Composición e inversas',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Maestro de funciones! 📈',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'En funciones compuestas trabaja de adentro hacia afuera — f(g(x)) es primero g.',
  },
  fr: {
    title: 'Pre-Calc Functions',
    tagline: 'Notation des fonctions, graphiques,\ncomposition et réciproques.',
    easy: 'Facile · Notation et domaine',
    medium: 'Moyen · Linéaire et quadratique',
    hard: 'Difficile · Composition et réciproques',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Maître des fonctions ! 📈',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: "Pour les fonctions composées, va de l'intérieur vers l'extérieur — f(g(x)) veut dire g d'abord.",
  },
};

export const t = createI18n(STRINGS, getLang);
