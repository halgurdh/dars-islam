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
    title: 'Geometry Essentials',
    tagline: 'Area, perimeter, angles and\nthe Pythagorean theorem.',
    easy: 'Easy · Area & Perimeter',
    medium: 'Medium · Triangles & Circles',
    hard: 'Hard · Pythagorean Theorem',
    menu: '☰ Menu',
    wellDone: 'Well shaped! 📐',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Sketch it on paper if it helps — geometry rewards a quick drawing.',

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
    title: 'Geometry Essentials',
    tagline: 'Oppervlakte, omtrek, hoeken en\nde stelling van Pythagoras.',
    easy: 'Makkelijk · Oppervlakte & Omtrek',
    medium: 'Gemiddeld · Driehoeken & Cirkels',
    hard: 'Moeilijk · Stelling van Pythagoras',
    menu: '☰ Menu',
    wellDone: 'Goed gevormd! 📐',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Teken het op papier als dat helpt — meetkunde is makkelijker met een schets.',

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
    title: 'Geometry Essentials',
    tagline: 'Fläche, Umfang, Winkel und\nder Satz des Pythagoras.',
    easy: 'Leicht · Fläche & Umfang',
    medium: 'Mittel · Dreiecke & Kreise',
    hard: 'Schwer · Satz des Pythagoras',
    menu: '☰ Menü',
    wellDone: 'Gut geformt! 📐',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Zeichne es auf Papier, wenn es hilft — eine Skizze macht Geometrie leichter.',

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
    title: 'Geometry Essentials',
    tagline: 'Área, perímetro, ángulos y\nel teorema de Pitágoras.',
    easy: 'Fácil · Área y perímetro',
    medium: 'Medio · Triángulos y círculos',
    hard: 'Difícil · Teorema de Pitágoras',
    menu: '☰ Menú',
    wellDone: '¡Bien formado! 📐',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Dibújalo en papel si te ayuda — un boceto facilita la geometría.',

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
    title: 'Geometry Essentials',
    tagline: 'Aire, périmètre, angles et\nle théorème de Pythagore.',
    easy: 'Facile · Aire et périmètre',
    medium: 'Moyen · Triangles et cercles',
    hard: 'Difficile · Théorème de Pythagore',
    menu: '☰ Menu',
    wellDone: 'Bien formé ! 📐',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Dessine-le sur papier si ça aide — un croquis facilite la géométrie.',

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
