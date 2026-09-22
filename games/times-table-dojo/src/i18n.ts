import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  round: (i: number, total: number) => string;
  menu: string;
  wellDone: string;
  playAgain: string;
  backToMenu: string;
  footer: string;

  modeQuiz: string;
  score: (n: number) => string;
  roundSummary: (score: number, total: number) => string;

  modeMatch: string;
  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;

  modeSequence: string;
  mistakes: (n: number) => string;
  instruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Times Table Dojo',
    tagline: 'Master the multiplication tables\nfrom 1 to 12.',
    easy: 'Easy · tables 1–5',
    medium: 'Medium · tables 1–9',
    hard: 'Hard · tables 1–12',
    round: (i, total) => `Round ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Dojo cleared! 🥋',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: '💡 Tip: ×2 is just doubling, ×10 adds a zero.\nFor ×9 and ×11 shortcuts, see Math Tricks Lab!',

    modeQuiz: 'Quiz',
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
    title: 'Times Table Dojo',
    tagline: 'Beheers de tafels van vermenigvuldiging\nvan 1 tot 12.',
    easy: 'Makkelijk · tafels 1–5',
    medium: 'Gemiddeld · tafels 1–9',
    hard: 'Moeilijk · tafels 1–12',
    round: (i, total) => `Ronde ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Dojo voltooid! 🥋',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: '💡 Tip: ×2 is verdubbelen, ×10 is een nul erbij.\nVoor ×9 en ×11 trucjes, zie Math Tricks Lab!',

    modeQuiz: 'Quiz',
    score: (n) => `Score: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} goed`,

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}`,
    nextLevelHint: 'Volgende ronde begint…',

    modeSequence: 'Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de sommen van kleinste naar grootste antwoord aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Times Table Dojo',
    tagline: 'Beherrsche die Einmaleins-Reihen\nvon 1 bis 12.',
    easy: 'Leicht · Reihen 1–5',
    medium: 'Mittel · Reihen 1–9',
    hard: 'Schwer · Reihen 1–12',
    round: (i, total) => `Runde ${i} / ${total}`,
    menu: '☰ Menü',
    wellDone: 'Dojo gemeistert! 🥋',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: '💡 Tipp: ×2 ist verdoppeln, ×10 fügt eine Null an.\nFür ×9 und ×11 Tricks, siehe Math Tricks Lab!',

    modeQuiz: 'Quiz',
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
    title: 'Times Table Dojo',
    tagline: 'Domina las tablas de multiplicar\ndel 1 al 12.',
    easy: 'Fácil · tablas 1–5',
    medium: 'Medio · tablas 1–9',
    hard: 'Difícil · tablas 1–12',
    round: (i, total) => `Ronda ${i} / ${total}`,
    menu: '☰ Menú',
    wellDone: '¡Dojo completado! 🥋',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: '💡 Consejo: ×2 es duplicar, ×10 añade un cero.\nPara trucos de ×9 y ×11, ¡visita Math Tricks Lab!',

    modeQuiz: 'Quiz',
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
    title: 'Times Table Dojo',
    tagline: 'Maîtrise les tables de multiplication\nde 1 à 12.',
    easy: 'Facile · tables 1–5',
    medium: 'Moyen · tables 1–9',
    hard: 'Difficile · tables 1–12',
    round: (i, total) => `Manche ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Dojo terminé ! 🥋',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: '💡 Astuce : ×2 double, ×10 ajoute un zéro.\nPour les astuces ×9 et ×11, va voir Math Tricks Lab !',

    modeQuiz: 'Quiz',
    score: (n) => `Score : ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correctes`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}`,
    nextLevelHint: 'La manche suivante commence…',

    modeSequence: 'Trier',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les calculs du plus petit au plus grand résultat',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
};

export const t = createI18n(STRINGS, getLang);
