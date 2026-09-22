import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  menu: string;
  wellDone: string;
  playAgain: string;
  backToMenu: string;
  footer: string;

  modeQuiz: string;
  round: (i: number, total: number) => string;
  score: (n: number) => string;
  roundSummary: (score: number, total: number) => string;

  modeMatch: string;
  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string) => string;
  nextLevelHint: string;

  modeSequence: string;
  mistakes: (n: number) => string;
  instruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Algebra Basics',
    tagline: 'Solving equations, expressions\nand simplifying algebra.',
    easy: 'Easy · One-Step Equations',
    medium: 'Medium · Two-Step & Like Terms',
    hard: 'Hard · Both Sides & Substitution',
    menu: '☰ Menu',
    wellDone: 'x marks the spot! 📐',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Do the same thing to both sides — that rule solves almost everything here.',

    modeQuiz: 'Quiz',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correct`,

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}`,
    nextLevelHint: 'Next round starting…',

    modeSequence: 'Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the problems from smallest to largest answer',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    title: 'Algebra Basics',
    tagline: 'Vergelijkingen oplossen, expressies\nen algebra vereenvoudigen.',
    easy: 'Makkelijk · Één-Staps Vergelijkingen',
    medium: 'Gemiddeld · Twee Stappen & Gelijksoortige Termen',
    hard: 'Moeilijk · Beide Kanten & Invullen',
    menu: '☰ Menu',
    wellDone: 'x is gevonden! 📐',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Doe hetzelfde aan beide kanten — die regel lost hier bijna alles op.',

    modeQuiz: 'Quiz',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} goed`,

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}`,
    nextLevelHint: 'Volgende ronde begint…',

    modeSequence: 'Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de opgaven van kleinste naar grootste antwoord aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Algebra Basics',
    tagline: 'Gleichungen lösen, Terme und\nvereinfachte Algebra.',
    easy: 'Leicht · Einschrittige Gleichungen',
    medium: 'Mittel · Zweischrittig & Gleiche Terme',
    hard: 'Schwer · Beide Seiten & Einsetzen',
    menu: '☰ Menü',
    wellDone: 'x gefunden! 📐',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Mach auf beiden Seiten dasselbe — diese Regel löst hier fast alles.',

    modeQuiz: 'Quiz',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} richtig`,

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}`,
    nextLevelHint: 'Nächste Runde startet…',

    modeSequence: 'Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Aufgaben vom kleinsten zum größten Ergebnis an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    title: 'Algebra Basics',
    tagline: 'Resolver ecuaciones, expresiones\ny simplificar álgebra.',
    easy: 'Fácil · Ecuaciones de un paso',
    medium: 'Medio · Dos pasos y términos semejantes',
    hard: 'Difícil · Ambos lados y sustitución',
    menu: '☰ Menú',
    wellDone: '¡Encontraste la x! 📐',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Haz lo mismo a ambos lados — esa regla resuelve casi todo aquí.',

    modeQuiz: 'Quiz',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correctas`,

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeSequence: 'Ordenar',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los problemas de menor a mayor resultado',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    title: 'Algebra Basics',
    tagline: 'Résoudre des équations, des expressions\net simplifier l\'algèbre.',
    easy: 'Facile · Équations à une étape',
    medium: 'Moyen · Deux étapes et termes semblables',
    hard: 'Difficile · Des deux côtés et substitution',
    menu: '☰ Menu',
    wellDone: 'x est trouvé ! 📐',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Fais la même chose des deux côtés — cette règle résout presque tout ici.',

    modeQuiz: 'Quiz',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correctes`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}`,
    nextLevelHint: 'La manche suivante commence…',

    modeSequence: 'Trier',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les problèmes du plus petit au plus grand résultat',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
};

export const t = createI18n(STRINGS, getLang);
