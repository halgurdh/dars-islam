import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  subtitle: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  footer: string;
  menu: string;
  playAgain: string;
  wellDone: string;
  hear: string;

  modeMatch: string;
  moves: (n: number) => string;
  roundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;

  modeQuiz: string;
  quizRound: (i: number, total: number) => string;
  quizScore: (n: number) => string;
  quizRoundSummary: (score: number, total: number) => string;

  modeSequence: string;
  sequenceMistakes: (n: number) => string;
  sequenceInstruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;

  modeListen: string;
  listenReplay: string;

  modeFlashcard: string;
  flashcardProgress: (i: number, total: number) => string;
  flashcardKnowIt: string;
  flashcardStillLearning: string;
  flashcardRoundSummary: (known: number, total: number) => string;

  modeTrueFalse: string;
  trueLabel: string;
  falseLabel: string;
  trueFalseStatement: (name: string, meaning: string) => string;

  modeFillBlank: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Asma Match',
    tagline: 'Flip cards, answer quizzes, or recall the\ntraditional order — three ways to learn the 99 Names.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    footer: 'No music. Sound effects are minimal and optional. This list follows the commonly circulated, traditional enumeration of the 99 Names.',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Well done! 🌿',
    hear: '🔊 Hear it',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} names matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} names learned overall`,
    nextLevelHint: 'Next level starting…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Question ${i}/${total}`,
    quizScore: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Order',
    sequenceMistakes: (n) => `Mistakes: ${n}`,
    sequenceInstruction: 'Tap the Names in their traditional order',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    modeListen: '🔊 Listen',
    listenReplay: '🔊 Tap to hear again',

    modeFlashcard: '🗂️ Review',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ I know it',
    flashcardStillLearning: '↻ Still learning',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marked as known`,

    modeTrueFalse: '✓✗ True/False',
    trueLabel: 'True',
    falseLabel: 'False',
    trueFalseStatement: (name, meaning) => `${name} means "${meaning}"`,

    modeFillBlank: '✏️ Fill in the Blank',
  },
  nl: {
    subtitle: 'Asma Match',
    tagline: 'Draai kaarten om, beantwoord quizvragen of\nleer de traditionele volgorde — drie manieren om te leren.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel. Deze lijst volgt de gangbare, traditionele opsomming van de 99 Namen.',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Goed gedaan! 🌿',
    hear: '🔊 Uitspraak',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} namen gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} namen in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Vraag ${i}/${total}`,
    quizScore: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Volgorde',
    sequenceMistakes: (n) => `Fouten: ${n}`,
    sequenceInstruction: 'Tik de Namen in de traditionele volgorde aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    modeListen: '🔊 Luisteren',
    listenReplay: '🔊 Tik om opnieuw te horen',

    modeFlashcard: '🗂️ Herhalen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Ik ken dit',
    flashcardStillLearning: '↻ Nog aan het leren',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als gekend gemarkeerd`,

    modeTrueFalse: '✓✗ Waar/Niet waar',
    trueLabel: 'Waar',
    falseLabel: 'Niet waar',
    trueFalseStatement: (name, meaning) => `${name} betekent "${meaning}"`,

    modeFillBlank: '✏️ Vul de Letter In',
  },
  de: {
    subtitle: 'Asma Match',
    tagline: 'Karten umdrehen, Quizfragen beantworten oder\ndie traditionelle Reihenfolge lernen — drei Lernwege.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional. Diese Liste folgt der gängigen, traditionellen Aufzählung der 99 Namen.',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Gut gemacht! 🌿',
    hear: '🔊 Anhören',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Namen zugeordnet in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Namen insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Frage ${i}/${total}`,
    quizScore: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Reihenfolge',
    sequenceMistakes: (n) => `Fehler: ${n}`,
    sequenceInstruction: 'Tippe die Namen in der traditionellen Reihenfolge an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    modeListen: '🔊 Hören',
    listenReplay: '🔊 Tippen zum erneuten Hören',

    modeFlashcard: '🗂️ Wiederholen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Ich kenne es',
    flashcardStillLearning: '↻ Noch am Lernen',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als bekannt markiert`,

    modeTrueFalse: '✓✗ Wahr/Falsch',
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    trueFalseStatement: (name, meaning) => `${name} bedeutet „${meaning}“`,

    modeFillBlank: '✏️ Buchstabe Einsetzen',
  },
  es: {
    subtitle: 'Asma Match',
    tagline: 'Voltea cartas, responde preguntas o aprende\nel orden tradicional — tres formas de aprender.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales. Esta lista sigue la enumeración tradicional y comúnmente difundida de los 99 Nombres.',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Bien hecho! 🌿',
    hear: '🔊 Escuchar',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} nombres emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} nombres aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Pregunta ${i}/${total}`,
    quizScore: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden',
    sequenceMistakes: (n) => `Errores: ${n}`,
    sequenceInstruction: 'Toca los Nombres en su orden tradicional',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    modeListen: '🔊 Escuchar',
    listenReplay: '🔊 Toca para escuchar de nuevo',

    modeFlashcard: '🗂️ Repasar',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Lo sé',
    flashcardStillLearning: '↻ Aún aprendiendo',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marcados como conocidos`,

    modeTrueFalse: '✓✗ Verdadero/Falso',
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    trueFalseStatement: (name, meaning) => `${name} significa "${meaning}"`,

    modeFillBlank: '✏️ Completa la Letra',
  },
  fr: {
    subtitle: 'Asma Match',
    tagline: 'Retourne des cartes, réponds à un quiz ou\napprends l’ordre traditionnel — trois façons d’apprendre.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    footer: "Pas de musique. Les effets sonores sont minimes et facultatifs. Cette liste suit l'énumération traditionnelle et couramment répandue des 99 Noms.",
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Bien joué ! 🌿',
    hear: '🔊 Écouter',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} noms associés en ${moves} coups\nTemps : ${time}\n${learned} / ${total} noms appris au total`,
    nextLevelHint: 'Le niveau suivant commence…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Question ${i}/${total}`,
    quizScore: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Ordre',
    sequenceMistakes: (n) => `Erreurs : ${n}`,
    sequenceInstruction: 'Touche les Noms dans leur ordre traditionnel',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    modeListen: '🔊 Écouter',
    listenReplay: '🔊 Touche pour réécouter',

    modeFlashcard: '🗂️ Réviser',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Je le sais',
    flashcardStillLearning: '↻ Encore en apprentissage',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marqués comme connus`,

    modeTrueFalse: '✓✗ Vrai/Faux',
    trueLabel: 'Vrai',
    falseLabel: 'Faux',
    trueFalseStatement: (name, meaning) => `${name} signifie « ${meaning} »`,

    modeFillBlank: '✏️ Complète la Lettre',
  },
  ar: {
    subtitle: 'Asma Match',
    tagline: 'اقلب البطاقات، أجب عن أسئلة الاختبار، أو تذكّر\nالترتيب التقليدي — ثلاث طرق لتعلم الأسماء الحسنى.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    footer: 'بدون موسيقى. المؤثرات الصوتية بسيطة واختيارية. تتبع هذه القائمة الترتيب التقليدي الشائع للأسماء الحسنى.',
    menu: '☰ القائمة',
    playAgain: 'العب مرة أخرى',
    wellDone: 'أحسنت! 🌿',
    hear: '🔊 استمع',

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} اسمًا تمت مطابقته في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} اسمًا تم تعلمها إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',

    modeQuiz: 'اختبار',
    quizRound: (i, total) => `السؤال ${i}/${total}`,
    quizScore: (n) => `النقاط: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} صحيحة`,

    modeSequence: 'الترتيب',
    sequenceMistakes: (n) => `الأخطاء: ${n}`,
    sequenceInstruction: 'اضغط على الأسماء بترتيبها التقليدي',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    modeListen: '🔊 استماع',
    listenReplay: '🔊 اضغط للاستماع مرة أخرى',

    modeFlashcard: '🗂️ مراجعة',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ أعرف هذا',
    flashcardStillLearning: '↻ ما زلت أتعلم',
    flashcardRoundSummary: (known, total) => `${known} / ${total} مُعلَّمة كمعروفة`,

    modeTrueFalse: '✓✗ صح/خطأ',
    trueLabel: 'صح',
    falseLabel: 'خطأ',
    trueFalseStatement: (name, meaning) => `${name} تعني "${meaning}"`,

    modeFillBlank: '✏️ أكمل الحرف',
  },
};

export const t = createI18n(STRINGS, getLang);
