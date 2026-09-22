import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  shapes: string;
  colors: string;
  mixed: string;
  menu: string;
  wellDone: string;
  playAgain: string;
  backToMenu: string;
  footer: string;
  tierEasy: string;
  tierMedium: string;
  tierHard: string;

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
    title: 'Shapes & Colors',
    tagline: 'Learn your shapes and colors\nby playing simple matching games.',
    shapes: 'Shapes',
    colors: 'Colors',
    mixed: 'Mixed',
    menu: '☰ Menu',
    wellDone: 'Great job! 🎨',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Tap the picture that matches the question.',
    tierEasy: 'Easy',
    tierMedium: 'Medium',
    tierHard: 'Hard',

    modeQuiz: 'Quiz',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correct`,

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}`,
    nextLevelHint: 'Next round starting…',

    modeSequence: 'Brightness Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the colors from darkest to lightest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    title: 'Shapes & Colors',
    tagline: 'Leer vormen en kleuren\nmet simpele spelletjes.',
    shapes: 'Vormen',
    colors: 'Kleuren',
    mixed: 'Gemengd',
    menu: '☰ Menu',
    wellDone: 'Goed gedaan! 🎨',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Tik op het plaatje dat bij de vraag past.',
    tierEasy: 'Makkelijk',
    tierMedium: 'Gemiddeld',
    tierHard: 'Moeilijk',

    modeQuiz: 'Quiz',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} goed`,

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}`,
    nextLevelHint: 'Volgende ronde begint…',

    modeSequence: 'Helderheid Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de kleuren van donker naar licht aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Shapes & Colors',
    tagline: 'Lerne Formen und Farben\nmit einfachen Spielen.',
    shapes: 'Formen',
    colors: 'Farben',
    mixed: 'Gemischt',
    menu: '☰ Menü',
    wellDone: 'Gut gemacht! 🎨',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Tippe auf das Bild, das zur Frage passt.',
    tierEasy: 'Leicht',
    tierMedium: 'Mittel',
    tierHard: 'Schwer',

    modeQuiz: 'Quiz',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} richtig`,

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}`,
    nextLevelHint: 'Nächste Runde startet…',

    modeSequence: 'Helligkeit Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Farben von dunkel nach hell an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    title: 'Shapes & Colors',
    tagline: 'Aprende formas y colores\ncon juegos sencillos.',
    shapes: 'Formas',
    colors: 'Colores',
    mixed: 'Mixto',
    menu: '☰ Menú',
    wellDone: '¡Muy bien! 🎨',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Toca la imagen que coincide con la pregunta.',
    tierEasy: 'Fácil',
    tierMedium: 'Medio',
    tierHard: 'Difícil',

    modeQuiz: 'Quiz',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correctas`,

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeSequence: 'Orden de Brillo',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los colores del más oscuro al más claro',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    title: 'Shapes & Colors',
    tagline: 'Apprends les formes et les couleurs\navec des jeux simples.',
    shapes: 'Formes',
    colors: 'Couleurs',
    mixed: 'Mixte',
    menu: '☰ Menu',
    wellDone: 'Bravo ! 🎨',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Touche l’image qui correspond à la question.',
    tierEasy: 'Facile',
    tierMedium: 'Moyen',
    tierHard: 'Difficile',

    modeQuiz: 'Quiz',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correctes`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}`,
    nextLevelHint: 'La manche suivante commence…',

    modeSequence: 'Tri de Luminosité',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les couleurs du plus foncé au plus clair',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
  ar: {
    title: 'Shapes & Colors',
    tagline: 'تعلّم الأشكال والألوان\nمن خلال ألعاب مطابقة بسيطة.',
    shapes: 'الأشكال',
    colors: 'الألوان',
    mixed: 'مختلط',
    menu: '☰ القائمة',
    wellDone: 'أحسنت! 🎨',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'اضغط على الصورة التي تطابق السؤال.',
    tierEasy: 'سهل',
    tierMedium: 'متوسط',
    tierHard: 'صعب',

    modeQuiz: 'اختبار',
    round: (i, total) => `الجولة ${i} / ${total}`,
    score: (n) => `النتيجة: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} إجابات صحيحة`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeSequence: 'ترتيب السطوع',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الألوان من الأغمق إلى الأفتح',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,
  },
};

export const t = createI18n(STRINGS, getLang);
