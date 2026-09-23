import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { getLang } from './systems/Locale';

export interface Difficulty {
  id: string;
  totalQuestions: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', totalQuestions: 8 },
  { id: 'medium', totalQuestions: 8 },
  { id: 'hard', totalQuestions: 8 },
];

interface Item {
  promptEn: string; promptNl: string; promptDe: string; promptEs: string; promptFr: string; promptAr: string;
  answerEn: string; answerNl: string; answerDe: string; answerEs: string; answerFr: string; answerAr: string;
  wrongEn: [string, string, string]; wrongNl: [string, string, string]; wrongDe: [string, string, string];
  wrongEs: [string, string, string]; wrongFr: [string, string, string]; wrongAr: [string, string, string];
}

// Helper for medium/hard items whose answer/wrong choices are pure math
// notation (fractions, radicals, π) — identical across every language, so
// this just repeats the one value across all 6 language fields instead of
// hand-duplicating it per item below.
function notation(answer: string, wrong: [string, string, string]) {
  return {
    answerEn: answer, answerNl: answer, answerDe: answer, answerEs: answer, answerFr: answer, answerAr: answer,
    wrongEn: wrong, wrongNl: wrong, wrongDe: wrong, wrongEs: wrong, wrongFr: wrong, wrongAr: wrong,
  };
}

// Easy: right-triangle vocabulary and the SOH-CAH-TOA definitions.
const EASY_ITEMS: Item[] = [
  { promptEn: 'In a right triangle, the side opposite the right angle is called the:', promptNl: 'In een rechthoekige driehoek heet de zijde tegenover de rechte hoek de:', promptDe: 'In einem rechtwinkligen Dreieck nennt man die Seite gegenüber dem rechten Winkel die:', promptEs: 'En un triángulo rectángulo, el lado opuesto al ángulo recto se llama:', promptFr: "Dans un triangle rectangle, le côté opposé à l'angle droit s'appelle :", promptAr: 'في المثلث القائم الزاوية، يُسمى الضلع المقابل للزاوية القائمة بـ:',
    answerEn: 'Hypotenuse', answerNl: 'Schuine zijde', answerDe: 'Hypotenuse', answerEs: 'Hipotenusa', answerFr: 'Hypoténuse', answerAr: 'الوتر',
    wrongEn: ['Opposite side', 'Adjacent side', 'Base'], wrongNl: ['Overstaande zijde', 'Aanliggende zijde', 'Basis'], wrongDe: ['Gegenkathete', 'Ankathete', 'Basis'],
    wrongEs: ['Cateto opuesto', 'Cateto adyacente', 'Base'], wrongFr: ['Côté opposé', 'Côté adjacent', 'Base'], wrongAr: ['الضلع المقابل', 'الضلع المجاور', 'القاعدة'] },
  { promptEn: 'Which trig ratio is defined as opposite / hypotenuse?', promptNl: 'Welke trigonometrische verhouding is gedefinieerd als overstaande zijde / schuine zijde?', promptDe: 'Welches trigonometrische Verhältnis ist definiert als Gegenkathete / Hypotenuse?', promptEs: '¿Qué razón trigonométrica se define como opuesto / hipotenusa?', promptFr: 'Quel rapport trigonométrique est défini comme opposé / hypoténuse ?', promptAr: 'أي نسبة مثلثية تُعرَّف بأنها المقابل ÷ الوتر؟',
    answerEn: 'Sine', answerNl: 'Sinus', answerDe: 'Sinus', answerEs: 'Seno', answerFr: 'Sinus', answerAr: 'الجيب',
    wrongEn: ['Cosine', 'Tangent', 'Secant'], wrongNl: ['Cosinus', 'Tangens', 'Secans'], wrongDe: ['Kosinus', 'Tangens', 'Sekans'],
    wrongEs: ['Coseno', 'Tangente', 'Secante'], wrongFr: ['Cosinus', 'Tangente', 'Sécante'], wrongAr: ['جيب التمام', 'الظل', 'القاطع'] },
  { promptEn: 'Which trig ratio is defined as adjacent / hypotenuse?', promptNl: 'Welke trigonometrische verhouding is gedefinieerd als aanliggende zijde / schuine zijde?', promptDe: 'Welches trigonometrische Verhältnis ist definiert als Ankathete / Hypotenuse?', promptEs: '¿Qué razón trigonométrica se define como adyacente / hipotenusa?', promptFr: 'Quel rapport trigonométrique est défini comme adjacent / hypoténuse ?', promptAr: 'أي نسبة مثلثية تُعرَّف بأنها المجاور ÷ الوتر؟',
    answerEn: 'Cosine', answerNl: 'Cosinus', answerDe: 'Kosinus', answerEs: 'Coseno', answerFr: 'Cosinus', answerAr: 'جيب التمام',
    wrongEn: ['Sine', 'Tangent', 'Cotangent'], wrongNl: ['Sinus', 'Tangens', 'Cotangens'], wrongDe: ['Sinus', 'Tangens', 'Kotangens'],
    wrongEs: ['Seno', 'Tangente', 'Cotangente'], wrongFr: ['Sinus', 'Tangente', 'Cotangente'], wrongAr: ['الجيب', 'الظل', 'ظل التمام'] },
  { promptEn: 'Which trig ratio is defined as opposite / adjacent?', promptNl: 'Welke trigonometrische verhouding is gedefinieerd als overstaande zijde / aanliggende zijde?', promptDe: 'Welches trigonometrische Verhältnis ist definiert als Gegenkathete / Ankathete?', promptEs: '¿Qué razón trigonométrica se define como opuesto / adyacente?', promptFr: 'Quel rapport trigonométrique est défini comme opposé / adjacent ?', promptAr: 'أي نسبة مثلثية تُعرَّف بأنها المقابل ÷ المجاور؟',
    answerEn: 'Tangent', answerNl: 'Tangens', answerDe: 'Tangens', answerEs: 'Tangente', answerFr: 'Tangente', answerAr: 'الظل',
    wrongEn: ['Sine', 'Cosine', 'Secant'], wrongNl: ['Sinus', 'Cosinus', 'Secans'], wrongDe: ['Sinus', 'Kosinus', 'Sekans'],
    wrongEs: ['Seno', 'Coseno', 'Secante'], wrongFr: ['Sinus', 'Cosinus', 'Sécante'], wrongAr: ['الجيب', 'جيب التمام', 'القاطع'] },
  { promptEn: 'What is the sum of the three angles in any triangle?', promptNl: 'Wat is de som van de drie hoeken in elke driehoek?', promptDe: 'Wie groß ist die Summe der drei Winkel in jedem Dreieck?', promptEs: '¿Cuál es la suma de los tres ángulos de cualquier triángulo?', promptFr: 'Quelle est la somme des trois angles de tout triangle ?', promptAr: 'ما مجموع الزوايا الثلاث في أي مثلث؟',
    ...notation('180°', ['90°', '270°', '360°']) },
  { promptEn: 'In a right triangle, how many angles measure 90°?', promptNl: 'Hoeveel hoeken meten 90° in een rechthoekige driehoek?', promptDe: 'Wie viele Winkel in einem rechtwinkligen Dreieck messen 90°?', promptEs: '¿Cuántos ángulos miden 90° en un triángulo rectángulo?', promptFr: "Combien d'angles mesurent 90° dans un triangle rectangle ?", promptAr: 'كم عدد الزوايا التي تساوي 90° في المثلث القائم الزاوية؟',
    ...notation('1', ['2', '3', '0']) },
  { promptEn: 'What do we call the longest side of a right triangle?', promptNl: 'Hoe noemen we de langste zijde van een rechthoekige driehoek?', promptDe: 'Wie nennen wir die längste Seite eines rechtwinkligen Dreiecks?', promptEs: '¿Cómo llamamos al lado más largo de un triángulo rectángulo?', promptFr: "Comment appelle-t-on le côté le plus long d'un triangle rectangle ?", promptAr: 'ماذا نسمي أطول ضلع في المثلث القائم الزاوية؟',
    answerEn: 'The hypotenuse', answerNl: 'De schuine zijde', answerDe: 'Die Hypotenuse', answerEs: 'La hipotenusa', answerFr: "L'hypoténuse", answerAr: 'الوتر',
    wrongEn: ['The opposite side', 'The adjacent side', 'The base'], wrongNl: ['De overstaande zijde', 'De aanliggende zijde', 'De basis'], wrongDe: ['Die Gegenkathete', 'Die Ankathete', 'Die Basis'],
    wrongEs: ['El cateto opuesto', 'El cateto adyacente', 'La base'], wrongFr: ['Le côté opposé', 'Le côté adjacent', 'La base'], wrongAr: ['الضلع المقابل', 'الضلع المجاور', 'القاعدة'] },
  { promptEn: 'What is the mnemonic used to remember sine, cosine and tangent ratios?', promptNl: 'Wat is het geheugensteuntje om de verhoudingen van sinus, cosinus en tangens te onthouden?', promptDe: 'Was ist der Merkspruch, um die Verhältnisse von Sinus, Kosinus und Tangens zu merken?', promptEs: '¿Cuál es la regla mnemotécnica para recordar las razones de seno, coseno y tangente?', promptFr: 'Quel est le moyen mnémotechnique pour retenir les rapports sinus, cosinus et tangente ?', promptAr: 'ما هي القاعدة المستخدمة لتذكر نسب الجيب وجيب التمام والظل؟',
    ...notation('SOH-CAH-TOA', ['PEMDAS', 'FOIL', 'BODMAS']) },
];

// Medium: exact ratios for the common special angles (30°, 45°, 60°, 90°).
// The trig-function notation (sin/cos/tan) is kept as-is across languages —
// only the surrounding question phrasing is translated.
const MEDIUM_ITEMS: Item[] = [
  { promptEn: 'What is sin(30°)?', promptNl: 'Wat is sin(30°)?', promptDe: 'Was ist sin(30°)?', promptEs: '¿Cuánto es sin(30°)?', promptFr: 'Que vaut sin(30°) ?', promptAr: 'ما قيمة sin(30°)؟',
    ...notation('1/2', ['√2/2', '√3/2', '1']) },
  { promptEn: 'What is cos(60°)?', promptNl: 'Wat is cos(60°)?', promptDe: 'Was ist cos(60°)?', promptEs: '¿Cuánto es cos(60°)?', promptFr: 'Que vaut cos(60°) ?', promptAr: 'ما قيمة cos(60°)؟',
    ...notation('1/2', ['√2/2', '√3/2', '0']) },
  { promptEn: 'What is sin(45°)?', promptNl: 'Wat is sin(45°)?', promptDe: 'Was ist sin(45°)?', promptEs: '¿Cuánto es sin(45°)?', promptFr: 'Que vaut sin(45°) ?', promptAr: 'ما قيمة sin(45°)؟',
    ...notation('√2/2', ['1/2', '√3/2', '1']) },
  { promptEn: 'What is cos(45°)?', promptNl: 'Wat is cos(45°)?', promptDe: 'Was ist cos(45°)?', promptEs: '¿Cuánto es cos(45°)?', promptFr: 'Que vaut cos(45°) ?', promptAr: 'ما قيمة cos(45°)؟',
    ...notation('√2/2', ['1/2', '√3/2', '0']) },
  { promptEn: 'What is tan(45°)?', promptNl: 'Wat is tan(45°)?', promptDe: 'Was ist tan(45°)?', promptEs: '¿Cuánto es tan(45°)?', promptFr: 'Que vaut tan(45°) ?', promptAr: 'ما قيمة tan(45°)؟',
    ...notation('1', ['0', '√3', '1/2']) },
  { promptEn: 'What is sin(90°)?', promptNl: 'Wat is sin(90°)?', promptDe: 'Was ist sin(90°)?', promptEs: '¿Cuánto es sin(90°)?', promptFr: 'Que vaut sin(90°) ?', promptAr: 'ما قيمة sin(90°)؟',
    ...notation('1', ['0', '1/2', '√2/2']) },
  { promptEn: 'What is cos(0°)?', promptNl: 'Wat is cos(0°)?', promptDe: 'Was ist cos(0°)?', promptEs: '¿Cuánto es cos(0°)?', promptFr: 'Que vaut cos(0°) ?', promptAr: 'ما قيمة cos(0°)؟',
    ...notation('1', ['0', '1/2', '√2/2']) },
  { promptEn: 'What is sin(60°)?', promptNl: 'Wat is sin(60°)?', promptDe: 'Was ist sin(60°)?', promptEs: '¿Cuánto es sin(60°)?', promptFr: 'Que vaut sin(60°) ?', promptAr: 'ما قيمة sin(60°)؟',
    ...notation('√3/2', ['1/2', '√2/2', '1']) },
];

// Hard: radians, the Pythagorean identity, and applied ratio problems.
const HARD_ITEMS: Item[] = [
  { promptEn: 'What is 180° in radians?', promptNl: 'Wat is 180° in radialen?', promptDe: 'Was ist 180° im Bogenmaß?', promptEs: '¿Cuánto es 180° en radianes?', promptFr: 'Que vaut 180° en radians ?', promptAr: 'كم يساوي 180° بالراديان؟',
    ...notation('π', ['π/2', '2π', 'π/4']) },
  { promptEn: 'What is 90° in radians?', promptNl: 'Wat is 90° in radialen?', promptDe: 'Was ist 90° im Bogenmaß?', promptEs: '¿Cuánto es 90° en radianes?', promptFr: 'Que vaut 90° en radians ?', promptAr: 'كم يساوي 90° بالراديان؟',
    ...notation('π/2', ['π', 'π/4', 'π/3']) },
  { promptEn: 'What is 45° in radians?', promptNl: 'Wat is 45° in radialen?', promptDe: 'Was ist 45° im Bogenmaß?', promptEs: '¿Cuánto es 45° en radianes?', promptFr: 'Que vaut 45° en radians ?', promptAr: 'كم يساوي 45° بالراديان؟',
    ...notation('π/4', ['π/2', 'π/3', 'π/6']) },
  { promptEn: 'What is 60° in radians?', promptNl: 'Wat is 60° in radialen?', promptDe: 'Was ist 60° im Bogenmaß?', promptEs: '¿Cuánto es 60° en radianes?', promptFr: 'Que vaut 60° en radians ?', promptAr: 'كم يساوي 60° بالراديان؟',
    ...notation('π/3', ['π/6', 'π/4', 'π/2']) },
  { promptEn: 'According to the Pythagorean identity, sin²(θ) + cos²(θ) = ?', promptNl: 'Volgens de Pythagorische identiteit, sin²(θ) + cos²(θ) = ?', promptDe: 'Gemäß der pythagoreischen Identität, sin²(θ) + cos²(θ) = ?', promptEs: 'Según la identidad pitagórica, sin²(θ) + cos²(θ) = ?', promptFr: "Selon l'identité pythagoricienne, sin²(θ) + cos²(θ) = ?", promptAr: 'وفقًا لمتطابقة فيثاغورس، sin²(θ) + cos²(θ) = ؟',
    ...notation('1', ['0', 'tan²(θ)', '2']) },
  { promptEn: 'In a 3-4-5 right triangle, if sin(θ) = 3/5, what is cos(θ)?', promptNl: 'In een rechthoekige 3-4-5-driehoek, als sin(θ) = 3/5, wat is cos(θ)?', promptDe: 'In einem rechtwinkligen 3-4-5-Dreieck, wenn sin(θ) = 3/5 ist, was ist cos(θ)?', promptEs: 'En un triángulo rectángulo 3-4-5, si sin(θ) = 3/5, ¿cuánto es cos(θ)?', promptFr: 'Dans un triangle rectangle 3-4-5, si sin(θ) = 3/5, que vaut cos(θ) ?', promptAr: 'في مثلث قائم الزاوية أضلاعه 3-4-5، إذا كان sin(θ) = 3/5، فما قيمة cos(θ)؟',
    ...notation('4/5', ['3/5', '3/4', '5/4']) },
  { promptEn: "A ladder leans against a wall at a 60° angle with the ground. Which ratio relates the angle, the ladder's length (hypotenuse), and the height on the wall (opposite)?",
    promptNl: 'Een ladder leunt tegen een muur met een hoek van 60° met de grond. Welke verhouding koppelt de hoek, de lengte van de ladder (schuine zijde) en de hoogte op de muur (overstaande zijde)?',
    promptDe: 'Eine Leiter lehnt in einem 60°-Winkel zum Boden an einer Wand. Welches Verhältnis verbindet den Winkel, die Länge der Leiter (Hypotenuse) und die Höhe an der Wand (Gegenkathete)?',
    promptEs: 'Una escalera se apoya contra una pared formando un ángulo de 60° con el suelo. ¿Qué razón relaciona el ángulo, la longitud de la escalera (hipotenusa) y la altura en la pared (opuesto)?',
    promptFr: "Une échelle est appuyée contre un mur en formant un angle de 60° avec le sol. Quel rapport relie l'angle, la longueur de l'échelle (hypoténuse) et la hauteur sur le mur (opposé) ?",
    promptAr: 'يستند سلّم إلى حائط بزاوية 60° مع الأرض. أي نسبة تربط بين الزاوية وطول السلم (الوتر) والارتفاع على الحائط (المقابل)؟',
    answerEn: 'Sine', answerNl: 'Sinus', answerDe: 'Sinus', answerEs: 'Seno', answerFr: 'Sinus', answerAr: 'الجيب',
    wrongEn: ['Cosine', 'Tangent', 'Secant'], wrongNl: ['Cosinus', 'Tangens', 'Secans'], wrongDe: ['Kosinus', 'Tangens', 'Sekans'],
    wrongEs: ['Coseno', 'Tangente', 'Secante'], wrongFr: ['Cosinus', 'Tangente', 'Sécante'], wrongAr: ['جيب التمام', 'الظل', 'القاطع'] },
  { promptEn: 'How many radians are in a full circle (360°)?', promptNl: 'Hoeveel radialen zitten er in een volledige cirkel (360°)?', promptDe: 'Wie viele Radianten hat ein vollständiger Kreis (360°)?', promptEs: '¿Cuántos radianes hay en un círculo completo (360°)?', promptFr: 'Combien y a-t-il de radians dans un cercle complet (360°) ?', promptAr: 'كم عدد الراديانات في دائرة كاملة (360°)؟',
    ...notation('2π', ['π', 'π/2', '4π']) },
];

const BANKS: Record<string, Item[]> = { easy: EASY_ITEMS, medium: MEDIUM_ITEMS, hard: HARD_ITEMS };

function promptFor(item: Item): string {
  switch (getLang()) {
    case 'nl': return item.promptNl;
    case 'de': return item.promptDe;
    case 'es': return item.promptEs;
    case 'fr': return item.promptFr;
    case 'ar': return item.promptAr;
    default: return item.promptEn;
  }
}

function answerFor(item: Item): string {
  switch (getLang()) {
    case 'nl': return item.answerNl;
    case 'de': return item.answerDe;
    case 'es': return item.answerEs;
    case 'fr': return item.answerFr;
    case 'ar': return item.answerAr;
    default: return item.answerEn;
  }
}

function wrongFor(item: Item): [string, string, string] {
  switch (getLang()) {
    case 'nl': return item.wrongNl;
    case 'de': return item.wrongDe;
    case 'es': return item.wrongEs;
    case 'fr': return item.wrongFr;
    case 'ar': return item.wrongAr;
    default: return item.wrongEn;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(item: Item): QuizQuestion {
  const answer = answerFor(item);
  const options = shuffle([answer, ...wrongFor(item)]);
  return {
    prompt: promptFor(item),
    choices: options,
    correctIndex: options.indexOf(answer),
  };
}

export function makeRunGenerator(difficulty: Difficulty): (index: number) => QuizQuestion {
  let pool: Item[] = [];
  return (index: number) => {
    if (index === 0) pool = shuffle(BANKS[difficulty.id]).slice(0, difficulty.totalQuestions);
    return buildQuestion(pool[index]);
  };
}

// Match: same fact banks as the Quiz, deduped by answer text first — the
// special-angle bank in particular has real repeats (sin 30° and cos 60°
// both equal 1/2), which would otherwise put two non-matching cards on the
// board showing the identical answer.
export function generateMatchItems(difficulty: Difficulty, pairs: number): MatchItem[] {
  const seen = new Set<string>();
  const unique = shuffle(BANKS[difficulty.id]).filter((item) => {
    const answer = answerFor(item);
    if (seen.has(answer)) return false;
    seen.add(answer);
    return true;
  });
  return unique.slice(0, Math.min(pairs, unique.length)).map((item, i) => ({
    id: i,
    sideA: promptFor(item),
    sideB: answerFor(item),
  }));
}

// Sequence: a hand-picked set of distinct trig values (no two special
// angles here evaluate to the same number) so ordering them smallest to
// largest is a genuine "which is bigger?" trig-magnitude test. Labels are
// pure math notation, so they're never translated.
const TRIG_VALUES: { label: string; value: number }[] = [
  { label: 'sin(0°)', value: 0 },
  { label: 'sin(30°)', value: 0.5 },
  { label: 'tan(30°)', value: 1 / Math.sqrt(3) },
  { label: 'sin(45°)', value: Math.SQRT1_2 },
  { label: 'sin(60°)', value: Math.sqrt(3) / 2 },
  { label: 'tan(45°)', value: 1 },
  { label: 'tan(60°)', value: Math.sqrt(3) },
];

export function generateSequenceRound(count: number): SequenceItem[] {
  const n = Math.min(count, TRIG_VALUES.length);
  return shuffle(TRIG_VALUES)
    .slice(0, n)
    .sort((a, b) => a.value - b.value)
    .map((v, i) => ({ id: i, label: v.label }));
}
