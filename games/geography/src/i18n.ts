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
    title: 'World Geography',
    tagline: 'Match countries to capitals, answer quizzes, or\nsort by land area — three ways to learn geography.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'World explorer! 🌍',
    footer: 'Picture a map in your head — it helps more than you think.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} capitals learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Size Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the countries smallest to largest by area',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    title: 'World Geography',
    tagline: 'Koppel landen aan hoofdsteden, beantwoord\nquizvragen of sorteer op oppervlakte.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Wereldontdekker! 🌍',
    footer: 'Stel je de kaart voor in je hoofd — dat helpt meer dan je denkt.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} hoofdsteden in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Grootte Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de landen van klein naar groot aan qua oppervlakte',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'World Geography',
    tagline: 'Ordne Ländern ihre Hauptstadt zu, beantworte\nQuizfragen oder sortiere nach Fläche.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Weltentdecker! 🌍',
    footer: 'Stell dir die Karte im Kopf vor — das hilft mehr, als du denkst.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Hauptstädte insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Größe Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Länder von klein nach groß nach Fläche an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    title: 'World Geography',
    tagline: 'Empareja países con capitales, responde\npreguntas u ordena por superficie.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Explorador del mundo! 🌍',
    footer: 'Imagina el mapa en tu mente — ayuda más de lo que crees.',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} capitales aprendidas en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Pregunta ${i}/${total}`,
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden por Tamaño',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los países de menor a mayor superficie',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    title: 'World Geography',
    tagline: 'Associe pays et capitales, réponds à un quiz\nou trie par superficie.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Explorateur du monde ! 🌍',
    footer: 'Imagine la carte dans ta tête — ça aide plus que tu ne le penses.',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} capitales apprises au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Tri par Taille',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les pays du plus petit au plus grand par superficie',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
};

export const t = createI18n(STRINGS, getLang);
