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
  tierEasy: string;
  tierMedium: string;
  tierHard: string;

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
    title: 'Pre-Calc Functions',
    tagline: 'Function notation, graphs,\ncomposition and inverses.',
    easy: 'Easy · Notation & Domain',
    medium: 'Medium · Linear & Quadratic',
    hard: 'Hard · Composition & Inverses',
    menu: '☰ Menu',
    wellDone: 'Function master! 📈',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Work from the inside out for composed functions — f(g(x)) means do g first.',
    tierEasy: 'Easy',
    tierMedium: 'Medium',
    tierHard: 'Hard',

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
    instruction: 'Tap the functions from smallest to largest result',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    title: 'Pre-Calc Functions',
    tagline: 'Functienotatie, grafieken,\nsamenstelling en inverse functies.',
    easy: 'Makkelijk · Notatie & Domein',
    medium: 'Gemiddeld · Lineair & Kwadratisch',
    hard: 'Moeilijk · Samenstelling & Inverse',
    menu: '☰ Menu',
    wellDone: 'Functiemeester! 📈',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Werk van binnen naar buiten bij samengestelde functies — f(g(x)) betekent eerst g.',
    tierEasy: 'Makkelijk',
    tierMedium: 'Gemiddeld',
    tierHard: 'Moeilijk',

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
    instruction: 'Tik de functies van kleinste naar grootste resultaat aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Pre-Calc Functions',
    tagline: 'Funktionsschreibweise, Graphen,\nVerkettung und Umkehrfunktionen.',
    easy: 'Leicht · Schreibweise & Definitionsbereich',
    medium: 'Mittel · Linear & Quadratisch',
    hard: 'Schwer · Verkettung & Umkehrfunktion',
    menu: '☰ Menü',
    wellDone: 'Funktionsmeister! 📈',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Arbeite bei verketteten Funktionen von innen nach außen — f(g(x)) heißt zuerst g.',
    tierEasy: 'Leicht',
    tierMedium: 'Mittel',
    tierHard: 'Schwer',

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
    instruction: 'Tippe die Funktionen vom kleinsten zum größten Ergebnis an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    title: 'Pre-Calc Functions',
    tagline: 'Notación de funciones, gráficos,\ncomposición e inversas.',
    easy: 'Fácil · Notación y dominio',
    medium: 'Medio · Lineal y cuadrática',
    hard: 'Difícil · Composición e inversas',
    menu: '☰ Menú',
    wellDone: '¡Maestro de funciones! 📈',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'En funciones compuestas trabaja de adentro hacia afuera — f(g(x)) es primero g.',
    tierEasy: 'Fácil',
    tierMedium: 'Medio',
    tierHard: 'Difícil',

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
    instruction: 'Toca las funciones de menor a mayor resultado',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    title: 'Pre-Calc Functions',
    tagline: 'Notation des fonctions, graphiques,\ncomposition et réciproques.',
    easy: 'Facile · Notation et domaine',
    medium: 'Moyen · Linéaire et quadratique',
    hard: 'Difficile · Composition et réciproques',
    menu: '☰ Menu',
    wellDone: 'Maître des fonctions ! 📈',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: "Pour les fonctions composées, va de l'intérieur vers l'extérieur — f(g(x)) veut dire g d'abord.",
    tierEasy: 'Facile',
    tierMedium: 'Moyen',
    tierHard: 'Difficile',

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
    instruction: 'Touche les fonctions du plus petit au plus grand résultat',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
};

export const t = createI18n(STRINGS, getLang);
