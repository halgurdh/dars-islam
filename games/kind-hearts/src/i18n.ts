import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  start: string;
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

  trueFalseStatement: (prompt: string, answer: string) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Kind Hearts',
    tagline: 'Simple lessons in kindness,\nsharing and understanding feelings.',
    start: '▶ Start (10 questions)',
    menu: '☰ Menu',
    wellDone: 'Kind heart! 💛',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'There’s always a kind choice — can you spot it?',

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
    instruction: 'Tap the answers shortest to longest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    trueFalseStatement: (prompt, answer) => `${prompt} → ${answer}`,
  },
  nl: {
    title: 'Kind Hearts',
    tagline: 'Simpele lessen over vriendelijkheid,\ndelen en gevoelens begrijpen.',
    start: '▶ Start (10 vragen)',
    menu: '☰ Menu',
    wellDone: 'Wat aardig! 💛',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Er is altijd een vriendelijke keuze — kun je die vinden?',

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
    instruction: 'Tik de antwoorden van kort naar lang aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    trueFalseStatement: (prompt, answer) => `${prompt} → ${answer}`,
  },
  de: {
    title: 'Kind Hearts',
    tagline: 'Einfache Lektionen über Freundlichkeit,\nTeilen und Gefühle verstehen.',
    start: '▶ Start (10 Fragen)',
    menu: '☰ Menü',
    wellDone: 'Wie freundlich! 💛',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Es gibt immer eine freundliche Wahl — findest du sie?',

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
    instruction: 'Tippe die Antworten von kurz nach lang an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    trueFalseStatement: (prompt, answer) => `${prompt} → ${answer}`,
  },
  es: {
    title: 'Kind Hearts',
    tagline: 'Lecciones sencillas sobre bondad,\ncompartir y entender los sentimientos.',
    start: '▶ Empezar (10 preguntas)',
    menu: '☰ Menú',
    wellDone: '¡Qué amable! 💛',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Siempre hay una opción amable — ¿puedes encontrarla?',

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
    instruction: 'Toca las respuestas de más corta a más larga',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    trueFalseStatement: (prompt, answer) => `${prompt} → ${answer}`,
  },
  fr: {
    title: 'Kind Hearts',
    tagline: 'De petites leçons sur la gentillesse,\nle partage et les émotions.',
    start: '▶ Commencer (10 questions)',
    menu: '☰ Menu',
    wellDone: 'Quel bon cœur ! 💛',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Il y a toujours un choix gentil — peux-tu le trouver ?',

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
    instruction: 'Touche les réponses de la plus courte à la plus longue',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    trueFalseStatement: (prompt, answer) => `${prompt} → ${answer}`,
  },
  ar: {
    title: 'Kind Hearts',
    tagline: 'دروس بسيطة عن اللطف،\nالمشاركة، وفهم المشاعر.',
    start: '▶ ابدأ (10 أسئلة)',
    menu: '☰ القائمة',
    wellDone: 'قلب طيب! 💛',
    playAgain: '↻ العب مجددًا',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'هناك دائمًا خيار لطيف — هل يمكنك اكتشافه؟',

    modeQuiz: 'اختبار',
    round: (i, total) => `الجولة ${i} / ${total}`,
    score: (n) => `النتيجة: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `تمت مطابقة ${pairs} من الأزواج في ${moves} حركة\nالوقت: ${time}`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeSequence: 'ترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الإجابات من الأقصر إلى الأطول',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولة مثالية`,

    trueFalseStatement: (prompt, answer) => `${prompt} ← ${answer}`,
  },
};

export const t = createI18n(STRINGS, getLang);
