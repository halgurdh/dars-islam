import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  menu: string;
  playAgain: string;
  wellDone: string;
  footer: string;

  modeMatch: string;
  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;

  modeQuiz: string;
  round: (i: number, total: number) => string;
  score: (n: number) => string;
  quizRoundSummary: (score: number, total: number) => string;

  modeSequence: string;
  mistakes: (n: number) => string;
  instruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Civics & Community',
    tagline: 'Match civics terms, answer quizzes, or sort\nby scope — three ways to learn how communities work.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Great citizen! 🏛️',
    footer: 'Think about your own neighborhood — these words show up there too.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} terms learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Scope Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap them from one person to a whole country',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    title: 'Civics & Community',
    tagline: 'Koppel termen, beantwoord quizvragen of\nsorteer op reikwijdte.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Geweldige burger! 🏛️',
    footer: 'Denk aan je eigen buurt — deze woorden kom je daar ook tegen.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} termen in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Reikwijdte Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik ze aan van één persoon tot een heel land',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Civics & Community',
    tagline: 'Ordne Begriffe zu, beantworte Quizfragen\noder sortiere nach Reichweite.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Toller Bürger! 🏛️',
    footer: 'Denk an deine eigene Nachbarschaft — diese Begriffe begegnen dir dort auch.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Begriffe insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Reichweite Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe sie von einer Person bis zu einem ganzen Land an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    title: 'Civics & Community',
    tagline: 'Empareja términos cívicos, responde preguntas\no ordena por alcance.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Gran ciudadano! 🏛️',
    footer: 'Piensa en tu propio barrio — estas palabras también aparecen allí.',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} términos aprendidos en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Pregunta ${i}/${total}`,
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden por Alcance',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Tócalos desde una persona hasta un país entero',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    title: 'Civics & Community',
    tagline: 'Associe des termes civiques, réponds à un quiz\nou trie par portée.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Excellent citoyen ! 🏛️',
    footer: 'Pense à ton propre quartier — ces mots y apparaissent aussi.',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} termes appris au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Tri par Portée',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: "Touche-les d'une seule personne jusqu'à tout un pays",
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
};

export const t = createI18n(STRINGS, getLang);
