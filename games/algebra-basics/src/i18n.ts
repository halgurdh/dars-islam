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
    title: 'Algebra Basics',
    tagline: 'Solving equations, expressions\nand simplifying algebra.',
    easy: 'Easy · One-Step Equations',
    medium: 'Medium · Two-Step & Like Terms',
    hard: 'Hard · Both Sides & Substitution',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'x marks the spot! 📐',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Do the same thing to both sides — that rule solves almost everything here.',
  },
  nl: {
    title: 'Algebra Basics',
    tagline: 'Vergelijkingen oplossen, expressies\nen algebra vereenvoudigen.',
    easy: 'Makkelijk · Één-Staps Vergelijkingen',
    medium: 'Gemiddeld · Twee Stappen & Gelijksoortige Termen',
    hard: 'Moeilijk · Beide Kanten & Invullen',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'x is gevonden! 📐',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Doe hetzelfde aan beide kanten — die regel lost hier bijna alles op.',
  },
  de: {
    title: 'Algebra Basics',
    tagline: 'Gleichungen lösen, Terme und\nvereinfachte Algebra.',
    easy: 'Leicht · Einschrittige Gleichungen',
    medium: 'Mittel · Zweischrittig & Gleiche Terme',
    hard: 'Schwer · Beide Seiten & Einsetzen',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'x gefunden! 📐',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Mach auf beiden Seiten dasselbe — diese Regel löst hier fast alles.',
  },
  es: {
    title: 'Algebra Basics',
    tagline: 'Resolver ecuaciones, expresiones\ny simplificar álgebra.',
    easy: 'Fácil · Ecuaciones de un paso',
    medium: 'Medio · Dos pasos y términos semejantes',
    hard: 'Difícil · Ambos lados y sustitución',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Encontraste la x! 📐',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Haz lo mismo a ambos lados — esa regla resuelve casi todo aquí.',
  },
  fr: {
    title: 'Algebra Basics',
    tagline: 'Résoudre des équations, des expressions\net simplifier l\'algèbre.',
    easy: 'Facile · Équations à une étape',
    medium: 'Moyen · Deux étapes et termes semblables',
    hard: 'Difficile · Des deux côtés et substitution',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'x est trouvé ! 📐',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Fais la même chose des deux côtés — cette règle résout presque tout ici.',
  },
};

export const t = createI18n(STRINGS, getLang);
