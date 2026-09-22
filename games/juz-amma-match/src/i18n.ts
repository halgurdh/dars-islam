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
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Flip cards, answer quizzes, or recall the\nmemorization order — three ways to learn each surah.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Well done! 🌿',
    hear: '🔊 Hear it',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} surahs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} surahs learned overall`,
    nextLevelHint: 'Next level starting…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Question ${i}/${total}`,
    quizScore: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Order',
    sequenceMistakes: (n) => `Mistakes: ${n}`,
    sequenceInstruction: 'Tap the surahs in the order you memorize them',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Draai kaarten om, beantwoord quizvragen of\nleer de memorisatievolgorde — drie manieren om te leren.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Goed gedaan! 🌿',
    hear: '🔊 Uitspraak',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} surahs gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} surahs in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Vraag ${i}/${total}`,
    quizScore: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Volgorde',
    sequenceMistakes: (n) => `Fouten: ${n}`,
    sequenceInstruction: 'Tik de surahs in de memorisatievolgorde aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Karten umdrehen, Quizfragen beantworten oder\ndie Merkreihenfolge lernen — drei Lernwege.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Gut gemacht! 🌿',
    hear: '🔊 Anhören',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Suren zugeordnet in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Suren insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Frage ${i}/${total}`,
    quizScore: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Reihenfolge',
    sequenceMistakes: (n) => `Fehler: ${n}`,
    sequenceInstruction: 'Tippe die Suren in der Merkreihenfolge an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Voltea cartas, responde preguntas o aprende\nel orden de memorización — tres formas de aprender.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Bien hecho! 🌿',
    hear: '🔊 Escuchar',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} suras emparejadas en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} suras aprendidas en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Pregunta ${i}/${total}`,
    quizScore: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden',
    sequenceMistakes: (n) => `Errores: ${n}`,
    sequenceInstruction: 'Toca las suras en el orden de memorización',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'Retourne des cartes, réponds à un quiz ou\napprends l’ordre de mémorisation — trois façons d’apprendre.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Bien joué ! 🌿',
    hear: '🔊 Écouter',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} sourates associées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} sourates apprises au total`,
    nextLevelHint: 'Le niveau suivant commence…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Question ${i}/${total}`,
    quizScore: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Ordre',
    sequenceMistakes: (n) => `Erreurs : ${n}`,
    sequenceInstruction: 'Touche les sourates dans l’ordre de mémorisation',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
  ar: {
    subtitle: 'Quran Juz Amma Match',
    tagline: 'اقلب البطاقات، أجب عن الأسئلة، أو تذكّر\nترتيب الحفظ — ثلاث طرق لتعلّم كل سورة.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    footer: 'لا توجد موسيقى. المؤثرات الصوتية بسيطة واختيارية.',
    menu: '☰ القائمة',
    playAgain: 'العب مجددًا',
    wellDone: 'أحسنت! 🌿',
    hear: '🔊 استمع',

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `تمت مطابقة ${pairs} من السور في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} سورة تم تعلمها إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',

    modeQuiz: 'اختبار',
    quizRound: (i, total) => `السؤال ${i}/${total}`,
    quizScore: (n) => `النتيجة: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeSequence: 'الترتيب',
    sequenceMistakes: (n) => `الأخطاء: ${n}`,
    sequenceInstruction: 'اضغط على السور بالترتيب الذي تحفظها به',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولة مثالية`,
  },
};

export const t = createI18n(STRINGS, getLang);
