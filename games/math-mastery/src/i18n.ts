import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  practice: (n: number) => string;
  back: string;
  prevPage: string;
  next: string;
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

  sqrtTrick: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Math Mastery',
    tagline: 'The advanced set: multi-digit multiplication,\nsquare roots, fractions and trigonometry.',
    practice: (n) => `▶ Practice (${n} rounds)`,
    back: '← Topics',
    prevPage: '‹',
    next: 'Next →',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Mastery! 🎓',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Pick a topic below to start a 10-round set.',

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

    sqrtTrick: 'Trick: find the two perfect squares it sits between',
  },
  nl: {
    title: 'Math Mastery',
    tagline: 'De gevorderde set: vermenigvuldigen met meerdere cijfers,\nvierkantswortels, breuken en goniometrie.',
    practice: (n) => `▶ Oefenen (${n} rondes)`,
    back: '← Onderwerpen',
    prevPage: '‹',
    next: 'Volgende →',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Meesterschap! 🎓',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Kies hieronder een onderwerp voor een reeks van 10 rondes.',

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

    sqrtTrick: 'Truc: vind de twee kwadraten waar het tussenin ligt',
  },
  de: {
    title: 'Math Mastery',
    tagline: 'Die fortgeschrittene Reihe: mehrstellige Multiplikation,\nQuadratwurzeln, Brüche und Trigonometrie.',
    practice: (n) => `▶ Üben (${n} Runden)`,
    back: '← Themen',
    prevPage: '‹',
    next: 'Weiter →',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Meisterschaft! 🎓',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Wähle unten ein Thema für 10 Runden.',

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

    sqrtTrick: 'Trick: finde die zwei Quadratzahlen, zwischen denen es liegt',
  },
  es: {
    title: 'Math Mastery',
    tagline: 'El set avanzado: multiplicación de varias cifras,\nraíces cuadradas, fracciones y trigonometría.',
    practice: (n) => `▶ Practicar (${n} rondas)`,
    back: '← Temas',
    prevPage: '‹',
    next: 'Siguiente →',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Maestría! 🎓',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Elige un tema abajo para empezar una ronda de 10.',

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

    sqrtTrick: 'Truco: encuentra los dos cuadrados perfectos entre los que está',
  },
  fr: {
    title: 'Math Mastery',
    tagline: 'La série avancée : multiplication à plusieurs chiffres,\nracines carrées, fractions et trigonométrie.',
    practice: (n) => `▶ S’entraîner (${n} manches)`,
    back: '← Sujets',
    prevPage: '‹',
    next: 'Suivant →',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Maîtrise ! 🎓',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Choisis un sujet ci-dessous pour commencer une série de 10 manches.',

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

    sqrtTrick: 'Astuce : trouve les deux carrés parfaits entre lesquels il se situe',
  },
  ar: {
    title: 'Math Mastery',
    tagline: 'المجموعة المتقدمة: الضرب متعدد الأرقام،\nالجذور التربيعية، الكسور، وحساب المثلثات.',
    practice: (n) => `▶ تدرّب (${n} جولات)`,
    back: '← المواضيع',
    prevPage: '‹',
    next: 'التالي →',
    round: (i, total) => `الجولة ${i} / ${total}`,
    score: (n) => `النتيجة: ${n}`,
    menu: '☰ القائمة',
    wellDone: 'إتقان! 🎓',
    roundSummary: (score, total) => `${score} / ${total} صحيحة`,
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة للقائمة',
    footer: 'اختر موضوعًا أدناه لبدء مجموعة من 10 جولات.',

    modeLearn: '📖 تعلّم',
    modeQuiz: '❓ اختبار',
    modeMatch: '🃏 طابق',
    modeSequence: '🔢 ترتيب',
    startLearn: '▶ ابدأ الدرس',
    startQuiz: '▶ ابدأ الاختبار',
    startMatch: '▶ ابدأ المطابقة',
    startSequence: '▶ ابدأ الترتيب',

    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على المسائل من أصغر إجابة إلى أكبرها',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    sqrtTrick: 'حيلة: ابحث عن المربعين الكاملين اللذين يقع بينهما',
  },
};

export const t = createI18n(STRINGS, getLang);
