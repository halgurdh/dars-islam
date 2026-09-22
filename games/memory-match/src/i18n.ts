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
    subtitle: 'Memory Match',
    tagline: 'Flip cards, answer quizzes, or sort by size —\nthree ways to learn each name.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Well done! 🎉',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} items learned overall`,
    nextLevelHint: 'Next level starting…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Question ${i}/${total}`,
    quizScore: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Size Sort',
    sequenceMistakes: (n) => `Mistakes: ${n}`,
    sequenceInstruction: 'Tap them smallest to largest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    subtitle: 'Memory Match',
    tagline: 'Draai kaarten om, beantwoord quizvragen of\nsorteer op grootte — drie manieren om te leren.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Goed gedaan! 🎉',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} items in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Vraag ${i}/${total}`,
    quizScore: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Grootte Sorteren',
    sequenceMistakes: (n) => `Fouten: ${n}`,
    sequenceInstruction: 'Tik ze van klein naar groot aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    subtitle: 'Memory Match',
    tagline: 'Karten umdrehen, Quizfragen beantworten oder\nnach Größe sortieren — drei Lernwege.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Gut gemacht! 🎉',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Dinge insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Frage ${i}/${total}`,
    quizScore: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Größe Sortieren',
    sequenceMistakes: (n) => `Fehler: ${n}`,
    sequenceInstruction: 'Tippe sie von klein nach groß an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    subtitle: 'Memory Match',
    tagline: 'Voltea cartas, responde preguntas u ordena\npor tamaño — tres formas de aprender.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Bien hecho! 🎉',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} elementos aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Pregunta ${i}/${total}`,
    quizScore: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden por Tamaño',
    sequenceMistakes: (n) => `Errores: ${n}`,
    sequenceInstruction: 'Tócalos de menor a mayor',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    subtitle: 'Memory Match',
    tagline: 'Retourne des cartes, réponds à un quiz ou\ntrie par taille — trois façons d’apprendre.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Bien joué ! 🎉',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} éléments appris au total`,
    nextLevelHint: 'Le niveau suivant commence…',

    modeQuiz: 'Quiz',
    quizRound: (i, total) => `Question ${i}/${total}`,
    quizScore: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Tri par Taille',
    sequenceMistakes: (n) => `Erreurs : ${n}`,
    sequenceInstruction: 'Touche-les du plus petit au plus grand',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
  ar: {
    subtitle: 'Memory Match',
    tagline: 'اقلب البطاقات، أجب عن الأسئلة، أو رتّب حسب الحجم —\nثلاث طرق لتعلّم كل اسم.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    footer: 'بدون موسيقى. المؤثرات الصوتية قليلة واختيارية.',
    menu: '☰ القائمة',
    playAgain: 'العب مرة أخرى',
    wellDone: 'أحسنت! 🎉',

    modeMatch: 'طابق',
    moves: (n) => `الحركات: ${n}`,
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} عنصرًا تم تعلمها إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',

    modeQuiz: 'اختبار',
    quizRound: (i, total) => `السؤال ${i}/${total}`,
    quizScore: (n) => `النتيجة: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} صحيحة`,

    modeSequence: 'ترتيب الحجم',
    sequenceMistakes: (n) => `الأخطاء: ${n}`,
    sequenceInstruction: 'اضغط عليها من الأصغر إلى الأكبر',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,
  },
};

export const t = createI18n(STRINGS, getLang);
