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

  rectanglePrompt: (w: number, h: number) => string;
  askArea: string;
  askPerimeter: string;
  trianglePrompt: (b: number, h: number) => string;
  askTriangleArea: string;
  circlePrompt: (r: number) => string;
  askCircleArea: string;
  anglesPrompt: (a: number, b: number) => string;
  askThirdAngle: string;
  legsPrompt: (a: number, b: number) => string;
  askHypotenuse: string;
  legHypotenusePrompt: (b: number, c: number) => string;
  askMissingLeg: string;

  rectangleAreaLabel: (w: number, h: number) => string;
  rectanglePerimeterLabel: (w: number, h: number) => string;
  triangleAreaLabel: (b: number, h: number) => string;
  circleAreaLabel: (r: number) => string;
  thirdAngleLabel: (a: number, b: number) => string;
  hypotenuseLabel: (a: number, b: number) => string;
  otherLegLabel: (b: number, c: number) => string;
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

    rectanglePrompt: (w, h) => `A rectangle is ${w} × ${h}.`,
    askArea: 'What is its area?',
    askPerimeter: 'What is its perimeter?',
    trianglePrompt: (b, h) => `A triangle has base ${b} and height ${h}.`,
    askTriangleArea: 'Area = ½ × base × height. What is its area?',
    circlePrompt: (r) => `A circle has radius ${r}.`,
    askCircleArea: 'Area ≈ π × r² (use π ≈ 3.14). What is its area?',
    anglesPrompt: (a, b) => `A triangle has angles ${a}° and ${b}°.`,
    askThirdAngle: 'Angles in a triangle add up to 180°. What is the third angle?',
    legsPrompt: (a, b) => `A right triangle has legs ${a} and ${b}.`,
    askHypotenuse: 'Use a² + b² = c². What is the hypotenuse?',
    legHypotenusePrompt: (b, c) => `A right triangle has one leg ${b} and hypotenuse ${c}.`,
    askMissingLeg: 'Use a² + b² = c². What is the missing leg?',

    rectangleAreaLabel: (w, h) => `${w} × ${h} rectangle — area`,
    rectanglePerimeterLabel: (w, h) => `${w} × ${h} rectangle — perimeter`,
    triangleAreaLabel: (b, h) => `Triangle base ${b}, height ${h} — area`,
    circleAreaLabel: (r) => `Circle radius ${r} — area`,
    thirdAngleLabel: (a, b) => `Triangle angles ${a}°, ${b}° — third angle`,
    hypotenuseLabel: (a, b) => `Right triangle legs ${a}, ${b} — hypotenuse`,
    otherLegLabel: (b, c) => `Right triangle leg ${b}, hypotenuse ${c} — other leg`,
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

    rectanglePrompt: (w, h) => `Een rechthoek is ${w} × ${h}.`,
    askArea: 'Wat is de oppervlakte?',
    askPerimeter: 'Wat is de omtrek?',
    trianglePrompt: (b, h) => `Een driehoek heeft basis ${b} en hoogte ${h}.`,
    askTriangleArea: 'Oppervlakte = ½ × basis × hoogte. Wat is de oppervlakte?',
    circlePrompt: (r) => `Een cirkel heeft straal ${r}.`,
    askCircleArea: 'Oppervlakte ≈ π × r² (gebruik π ≈ 3,14). Wat is de oppervlakte?',
    anglesPrompt: (a, b) => `Een driehoek heeft hoeken ${a}° en ${b}°.`,
    askThirdAngle: 'De hoeken van een driehoek tellen op tot 180°. Wat is de derde hoek?',
    legsPrompt: (a, b) => `Een rechthoekige driehoek heeft rechthoekszijden ${a} en ${b}.`,
    askHypotenuse: 'Gebruik a² + b² = c². Wat is de schuine zijde?',
    legHypotenusePrompt: (b, c) => `Een rechthoekige driehoek heeft één rechthoekszijde ${b} en schuine zijde ${c}.`,
    askMissingLeg: 'Gebruik a² + b² = c². Wat is de ontbrekende zijde?',

    rectangleAreaLabel: (w, h) => `Rechthoek ${w} × ${h} — oppervlakte`,
    rectanglePerimeterLabel: (w, h) => `Rechthoek ${w} × ${h} — omtrek`,
    triangleAreaLabel: (b, h) => `Driehoek basis ${b}, hoogte ${h} — oppervlakte`,
    circleAreaLabel: (r) => `Cirkel straal ${r} — oppervlakte`,
    thirdAngleLabel: (a, b) => `Driehoek hoeken ${a}°, ${b}° — derde hoek`,
    hypotenuseLabel: (a, b) => `Rechthoekige driehoek zijden ${a}, ${b} — schuine zijde`,
    otherLegLabel: (b, c) => `Rechthoekige driehoek zijde ${b}, schuine zijde ${c} — andere zijde`,
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

    rectanglePrompt: (w, h) => `Ein Rechteck ist ${w} × ${h}.`,
    askArea: 'Wie groß ist die Fläche?',
    askPerimeter: 'Wie groß ist der Umfang?',
    trianglePrompt: (b, h) => `Ein Dreieck hat die Grundseite ${b} und die Höhe ${h}.`,
    askTriangleArea: 'Fläche = ½ × Grundseite × Höhe. Wie groß ist die Fläche?',
    circlePrompt: (r) => `Ein Kreis hat den Radius ${r}.`,
    askCircleArea: 'Fläche ≈ π × r² (verwende π ≈ 3,14). Wie groß ist die Fläche?',
    anglesPrompt: (a, b) => `Ein Dreieck hat die Winkel ${a}° und ${b}°.`,
    askThirdAngle: 'Die Winkel eines Dreiecks ergeben zusammen 180°. Wie groß ist der dritte Winkel?',
    legsPrompt: (a, b) => `Ein rechtwinkliges Dreieck hat die Katheten ${a} und ${b}.`,
    askHypotenuse: 'Verwende a² + b² = c². Wie lang ist die Hypotenuse?',
    legHypotenusePrompt: (b, c) => `Ein rechtwinkliges Dreieck hat eine Kathete ${b} und die Hypotenuse ${c}.`,
    askMissingLeg: 'Verwende a² + b² = c². Wie lang ist die fehlende Kathete?',

    rectangleAreaLabel: (w, h) => `Rechteck ${w} × ${h} — Fläche`,
    rectanglePerimeterLabel: (w, h) => `Rechteck ${w} × ${h} — Umfang`,
    triangleAreaLabel: (b, h) => `Dreieck Grundseite ${b}, Höhe ${h} — Fläche`,
    circleAreaLabel: (r) => `Kreis Radius ${r} — Fläche`,
    thirdAngleLabel: (a, b) => `Dreieck Winkel ${a}°, ${b}° — dritter Winkel`,
    hypotenuseLabel: (a, b) => `Rechtwinkliges Dreieck Katheten ${a}, ${b} — Hypotenuse`,
    otherLegLabel: (b, c) => `Rechtwinkliges Dreieck Kathete ${b}, Hypotenuse ${c} — andere Kathete`,
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

    rectanglePrompt: (w, h) => `Un rectángulo es de ${w} × ${h}.`,
    askArea: '¿Cuál es su área?',
    askPerimeter: '¿Cuál es su perímetro?',
    trianglePrompt: (b, h) => `Un triángulo tiene base ${b} y altura ${h}.`,
    askTriangleArea: 'Área = ½ × base × altura. ¿Cuál es su área?',
    circlePrompt: (r) => `Un círculo tiene radio ${r}.`,
    askCircleArea: 'Área ≈ π × r² (usa π ≈ 3,14). ¿Cuál es su área?',
    anglesPrompt: (a, b) => `Un triángulo tiene ángulos de ${a}° y ${b}°.`,
    askThirdAngle: 'Los ángulos de un triángulo suman 180°. ¿Cuál es el tercer ángulo?',
    legsPrompt: (a, b) => `Un triángulo rectángulo tiene catetos ${a} y ${b}.`,
    askHypotenuse: 'Usa a² + b² = c². ¿Cuál es la hipotenusa?',
    legHypotenusePrompt: (b, c) => `Un triángulo rectángulo tiene un cateto de ${b} y una hipotenusa de ${c}.`,
    askMissingLeg: 'Usa a² + b² = c². ¿Cuál es el cateto que falta?',

    rectangleAreaLabel: (w, h) => `Rectángulo ${w} × ${h} — área`,
    rectanglePerimeterLabel: (w, h) => `Rectángulo ${w} × ${h} — perímetro`,
    triangleAreaLabel: (b, h) => `Triángulo base ${b}, altura ${h} — área`,
    circleAreaLabel: (r) => `Círculo radio ${r} — área`,
    thirdAngleLabel: (a, b) => `Triángulo ángulos ${a}°, ${b}° — tercer ángulo`,
    hypotenuseLabel: (a, b) => `Triángulo rectángulo catetos ${a}, ${b} — hipotenusa`,
    otherLegLabel: (b, c) => `Triángulo rectángulo cateto ${b}, hipotenusa ${c} — otro cateto`,
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

    rectanglePrompt: (w, h) => `Un rectangle est de ${w} × ${h}.`,
    askArea: 'Quelle est son aire ?',
    askPerimeter: 'Quel est son périmètre ?',
    trianglePrompt: (b, h) => `Un triangle a une base de ${b} et une hauteur de ${h}.`,
    askTriangleArea: 'Aire = ½ × base × hauteur. Quelle est son aire ?',
    circlePrompt: (r) => `Un cercle a un rayon de ${r}.`,
    askCircleArea: 'Aire ≈ π × r² (utilise π ≈ 3,14). Quelle est son aire ?',
    anglesPrompt: (a, b) => `Un triangle a des angles de ${a}° et ${b}°.`,
    askThirdAngle: "Les angles d'un triangle totalisent 180°. Quel est le troisième angle ?",
    legsPrompt: (a, b) => `Un triangle rectangle a des côtés de ${a} et ${b}.`,
    askHypotenuse: "Utilise a² + b² = c². Quelle est l'hypoténuse ?",
    legHypotenusePrompt: (b, c) => `Un triangle rectangle a un côté de ${b} et une hypoténuse de ${c}.`,
    askMissingLeg: 'Utilise a² + b² = c². Quel est le côté manquant ?',

    rectangleAreaLabel: (w, h) => `Rectangle ${w} × ${h} — aire`,
    rectanglePerimeterLabel: (w, h) => `Rectangle ${w} × ${h} — périmètre`,
    triangleAreaLabel: (b, h) => `Triangle base ${b}, hauteur ${h} — aire`,
    circleAreaLabel: (r) => `Cercle rayon ${r} — aire`,
    thirdAngleLabel: (a, b) => `Triangle angles ${a}°, ${b}° — troisième angle`,
    hypotenuseLabel: (a, b) => `Triangle rectangle côtés ${a}, ${b} — hypoténuse`,
    otherLegLabel: (b, c) => `Triangle rectangle côté ${b}, hypoténuse ${c} — autre côté`,
  },
  ar: {
    title: 'Geometry Essentials',
    tagline: 'المساحة، المحيط، الزوايا و\nنظرية فيثاغورس.',
    easy: 'سهل · المساحة والمحيط',
    medium: 'متوسط · المثلثات والدوائر',
    hard: 'صعب · نظرية فيثاغورس',
    menu: '☰ القائمة',
    wellDone: 'شكل ممتاز! 📐',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'ارسمها على ورقة إن ساعدك ذلك — رسمة سريعة تسهّل الهندسة.',

    modeQuiz: 'اختبار',
    round: (i, total) => `الجولة ${i} / ${total}`,
    score: (n) => `النتيجة: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} زوج تمت مطابقته في ${moves} حركة\nالوقت: ${time}`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeSequence: 'الترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على المسائل من الأصغر إلى الأكبر إجابةً',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولة مثالية`,

    rectanglePrompt: (w, h) => `مستطيل أبعاده ${w} × ${h}.`,
    askArea: 'ما مساحته؟',
    askPerimeter: 'ما محيطه؟',
    trianglePrompt: (b, h) => `مثلث قاعدته ${b} وارتفاعه ${h}.`,
    askTriangleArea: 'المساحة = ½ × القاعدة × الارتفاع. ما مساحته؟',
    circlePrompt: (r) => `دائرة نصف قطرها ${r}.`,
    askCircleArea: 'المساحة ≈ π × نق² (استخدم π ≈ 3.14). ما مساحته؟',
    anglesPrompt: (a, b) => `مثلث زواياه ${a}° و ${b}°.`,
    askThirdAngle: 'مجموع زوايا المثلث 180°. ما الزاوية الثالثة؟',
    legsPrompt: (a, b) => `مثلث قائم الزاوية ضلعاه ${a} و ${b}.`,
    askHypotenuse: 'استخدم أ² + ب² = جـ². ما هو الوتر؟',
    legHypotenusePrompt: (b, c) => `مثلث قائم الزاوية أحد ضلعيه ${b} ووتره ${c}.`,
    askMissingLeg: 'استخدم أ² + ب² = جـ². ما الضلع الناقص؟',

    rectangleAreaLabel: (w, h) => `مستطيل ${w} × ${h} — المساحة`,
    rectanglePerimeterLabel: (w, h) => `مستطيل ${w} × ${h} — المحيط`,
    triangleAreaLabel: (b, h) => `مثلث قاعدته ${b}، ارتفاعه ${h} — المساحة`,
    circleAreaLabel: (r) => `دائرة نصف قطرها ${r} — المساحة`,
    thirdAngleLabel: (a, b) => `مثلث زواياه ${a}°، ${b}° — الزاوية الثالثة`,
    hypotenuseLabel: (a, b) => `مثلث قائم أضلاعه ${a}، ${b} — الوتر`,
    otherLegLabel: (b, c) => `مثلث قائم ضلعه ${b}، وتره ${c} — الضلع الآخر`,
  },
};

export const t = createI18n(STRINGS, getLang);
