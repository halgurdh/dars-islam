import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  howItWorks: string;
  example: string;
  practice: (n: number) => string;
  back: string;
  round: (i: number, total: number) => string;
  score: (n: number) => string;
  menu: string;
  wellDone: string;
  roundSummary: (score: number, total: number) => string;
  playAgain: string;
  backToMenu: string;
  footer: string;

  modeLearn: string;
  modeQuiz: string;
  modeMatch: string;
  modeSequence: string;
  startLearn: string;
  startQuiz: string;
  startMatch: string;
  startSequence: string;

  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;

  mistakes: (n: number) => string;
  instruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Math Tricks Lab',
    tagline: 'Learn classic mental-math shortcuts,\nthen drill them for speed.',
    howItWorks: 'How it works',
    example: 'Worked example',
    practice: (n) => `▶ Practice (${n} rounds)`,
    back: '← Tricks',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Trick mastered! 🧠',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Tricks',
    footer: 'Pick a trick to learn it, then practice until it’s automatic.',

    modeLearn: '📖 Learn',
    modeQuiz: '❓ Quiz',
    modeMatch: '🃏 Match',
    modeSequence: '🔢 Order',
    startLearn: '▶ Start Lesson',
    startQuiz: '▶ Start Quiz',
    startMatch: '▶ Start Match',
    startSequence: '▶ Start Order',

    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}`,
    nextLevelHint: 'Next round starting…',

    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the problems from smallest to largest answer',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    title: 'Math Tricks Lab',
    tagline: 'Leer klassieke rekentrucjes,\nen oefen ze dan tot je ze razendsnel kent.',
    howItWorks: 'Hoe het werkt',
    example: 'Uitgewerkt voorbeeld',
    practice: (n) => `▶ Oefenen (${n} rondes)`,
    back: '← Trucjes',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Trucje onder de knie! 🧠',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar trucjes',
    footer: 'Kies een trucje om te leren, oefen dan tot het automatisch gaat.',

    modeLearn: '📖 Leren',
    modeQuiz: '❓ Quiz',
    modeMatch: '🃏 Memory',
    modeSequence: '🔢 Volgorde',
    startLearn: '▶ Start Les',
    startQuiz: '▶ Start Quiz',
    startMatch: '▶ Start Memory',
    startSequence: '▶ Start Volgorde',

    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paren gevonden in ${moves} zetten\nTijd: ${time}`,
    nextLevelHint: 'Volgende ronde begint…',

    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de sommen aan van kleinste naar grootste antwoord',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Math Tricks Lab',
    tagline: 'Lerne klassische Kopfrechen-Tricks,\nund übe sie dann für mehr Tempo.',
    howItWorks: 'So funktioniert es',
    example: 'Rechenbeispiel',
    practice: (n) => `▶ Üben (${n} Runden)`,
    back: '← Tricks',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Trick gemeistert! 🧠',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zu Tricks',
    footer: 'Wähle einen Trick zum Lernen, dann üben, bis er automatisch geht.',

    modeLearn: '📖 Lernen',
    modeQuiz: '❓ Quiz',
    modeMatch: '🃏 Memory',
    modeSequence: '🔢 Reihenfolge',
    startLearn: '▶ Lektion starten',
    startQuiz: '▶ Quiz starten',
    startMatch: '▶ Memory starten',
    startSequence: '▶ Reihenfolge starten',

    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} Paare in ${moves} Zügen gefunden\nZeit: ${time}`,
    nextLevelHint: 'Nächste Runde startet…',

    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Aufgaben vom kleinsten zum größten Ergebnis an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    title: 'Math Tricks Lab',
    tagline: 'Aprende trucos clásicos de cálculo mental,\ny practícalos hasta dominarlos.',
    howItWorks: 'Cómo funciona',
    example: 'Ejemplo resuelto',
    practice: (n) => `▶ Practicar (${n} rondas)`,
    back: '← Trucos',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Truco dominado! 🧠',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver a trucos',
    footer: 'Elige un truco para aprenderlo, luego practica hasta que sea automático.',

    modeLearn: '📖 Aprender',
    modeQuiz: '❓ Quiz',
    modeMatch: '🃏 Memoria',
    modeSequence: '🔢 Orden',
    startLearn: '▶ Empezar Lección',
    startQuiz: '▶ Empezar Quiz',
    startMatch: '▶ Empezar Memoria',
    startSequence: '▶ Empezar Orden',

    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} pares encontrados en ${moves} movimientos\nTiempo: ${time}`,
    nextLevelHint: 'La siguiente ronda comienza…',

    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los problemas del resultado más pequeño al más grande',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    title: 'Math Tricks Lab',
    tagline: 'Apprends des astuces classiques de calcul mental,\npuis entraîne-toi jusqu’à la vitesse de l’éclair.',
    howItWorks: 'Comment ça marche',
    example: 'Exemple résolu',
    practice: (n) => `▶ S’entraîner (${n} manches)`,
    back: '← Astuces',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Astuce maîtrisée ! 🧠',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour aux astuces',
    footer: 'Choisis une astuce à apprendre, puis entraîne-toi jusqu’à l’automatisme.',

    modeLearn: '📖 Apprendre',
    modeQuiz: '❓ Quiz',
    modeMatch: '🃏 Memory',
    modeSequence: '🔢 Ordre',
    startLearn: '▶ Démarrer la leçon',
    startQuiz: '▶ Démarrer le quiz',
    startMatch: '▶ Démarrer le memory',
    startSequence: '▶ Démarrer l’ordre',

    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}`,
    nextLevelHint: 'La manche suivante commence…',

    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les problèmes du plus petit au plus grand résultat',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
};

export const t = createI18n(STRINGS, getLang);
