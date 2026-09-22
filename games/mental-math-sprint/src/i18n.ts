import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  menu: string;
  wellDone: string;
  playAgain: string;
  backToMenu: string;
  footer: string;
  easy: string;
  medium: string;
  hard: string;

  modeQuiz: string;
  relaxed: string;
  normal: string;
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
    title: 'Mental Math Sprint',
    tagline: 'Race the clock, match problems to answers,\nor sort them by value — three ways to train.',
    menu: '☰ Menu',
    wellDone: 'Sprint finished! ⚡',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: '💡 This sprint leans on the ×11, ×5 and other shortcuts\nfrom Math Tricks Lab — learn them there, then race here.',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',

    modeQuiz: 'Sprint',
    relaxed: 'Relaxed · 12s per question',
    normal: 'Normal · 7s per question',
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
    title: 'Mental Math Sprint',
    tagline: 'Race tegen de klok, koppel sommen aan\nantwoorden of sorteer op waarde.',
    menu: '☰ Menu',
    wellDone: 'Sprint voltooid! ⚡',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: '💡 Deze sprint leunt op de ×11, ×5 en andere trucjes\nuit Math Tricks Lab — leer ze daar, race dan hier.',
    easy: 'Makkelijk',
    medium: 'Gemiddeld',
    hard: 'Moeilijk',

    modeQuiz: 'Sprint',
    relaxed: 'Relaxed · 12s per vraag',
    normal: 'Normaal · 7s per vraag',
    round: (i, total) => `Ronde ${i} / ${total}`,
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
    title: 'Mental Math Sprint',
    tagline: 'Renne gegen die Uhr, ordne Aufgaben ihren\nAntworten zu oder sortiere nach Wert.',
    menu: '☰ Menü',
    wellDone: 'Sprint beendet! ⚡',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: '💡 Dieser Sprint nutzt die ×11-, ×5- und andere Tricks\naus Math Tricks Lab — lerne sie dort, dann sprinte hier.',
    easy: 'Leicht',
    medium: 'Mittel',
    hard: 'Schwer',

    modeQuiz: 'Sprint',
    relaxed: 'Entspannt · 12s pro Frage',
    normal: 'Normal · 7s pro Frage',
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
    title: 'Mental Math Sprint',
    tagline: 'Corre contra el reloj, empareja problemas con\nrespuestas u ordénalos por valor.',
    menu: '☰ Menú',
    wellDone: '¡Sprint terminado! ⚡',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: '💡 Este sprint usa los trucos ×11, ×5 y otros\nde Math Tricks Lab — apréndelos allí y compite aquí.',
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',

    modeQuiz: 'Sprint',
    relaxed: 'Relajado · 12s por pregunta',
    normal: 'Normal · 7s por pregunta',
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
    title: 'Mental Math Sprint',
    tagline: 'Cours contre la montre, associe des calculs à\nleurs réponses ou trie-les par valeur.',
    menu: '☰ Menu',
    wellDone: 'Sprint terminé ! ⚡',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: '💡 Ce sprint s’appuie sur les astuces ×11, ×5 et d’autres\nde Math Tricks Lab — apprends-les là-bas, puis fonce ici.',
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',

    modeQuiz: 'Sprint',
    relaxed: 'Détendu · 12s par question',
    normal: 'Normal · 7s par question',
    round: (i, total) => `Manche ${i} / ${total}`,
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
