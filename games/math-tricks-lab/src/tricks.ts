import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { buildNumericChoices } from './choices';
import { getLang } from './systems/Locale';

export interface Trick {
  id: string;
  icon: string;
  title: () => string;
  summary: () => string;
  steps: () => string[];
  example: { problem: string; work: () => string[]; answer: string };
  totalQuestions: number;
  generateQuestion: () => QuizQuestion;
  generateMatchItems: (pairs: number) => MatchItem[];
  generateSequenceRound: (count: number) => SequenceItem[];
  /** Only the line-multiplication trick uses this, to draw its diagram on the Learn screen. */
  hasDiagram?: boolean;
}

// Localized text per trick, resolved through the small `pick()` helper
// below — mirrors the meaningFor()-style selector used throughout the
// other games' data files, just scoped to one object instead of a per-item
// interface since each trick has a fixed handful of these fields.
interface TrickText {
  title: Record<string, string>;
  summary: Record<string, string>;
  steps: Record<string, string[]>;
  exampleWork: Record<string, string[]>;
}

function pick<T>(dict: Record<string, T>): T {
  return dict[getLang()] ?? dict.en;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Shared by every trick's Match/Sequence generators: keep drawing fresh
// problems until `count` of them land on genuinely distinct answers, so a
// Match board never has two cards claiming the same answer and a Sequence
// round never has a tie to break arbitrarily.
function distinctBy<T>(count: number, make: () => T, keyOf: (t: T) => number | string): T[] {
  const used = new Set<number | string>();
  const out: T[] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 40) {
    attempts++;
    const item = make();
    const key = keyOf(item);
    if (used.has(key)) continue;
    used.add(key);
    out.push(item);
  }
  return out;
}

const NINE_TRICK: TrickText = {
  title: { en: '×9 Finger Trick', nl: '×9 Vingertruc', de: '×9 Finger-Trick', es: 'Truco de los dedos ×9', fr: 'Astuce des doigts ×9', ar: 'حيلة الأصابع ×9' },
  summary: {
    en: 'Any number 1–10 times 9 — read the digits off two rules.',
    nl: 'Elk getal 1–10 keer 9 — lees de cijfers af met twee regels.',
    de: 'Jede Zahl von 1–10 mal 9 — lies die Ziffern mit zwei Regeln ab.',
    es: 'Cualquier número del 1 al 10 por 9 — lee las cifras con dos reglas.',
    fr: "N'importe quel nombre de 1 à 10 multiplié par 9 — lis les chiffres grâce à deux règles.",
    ar: 'أي رقم من 1 إلى 10 مضروب في 9 — اقرأ الأرقام باستخدام قاعدتين.',
  },
  steps: {
    en: ['For n × 9 (n from 1 to 10):', 'Tens digit of the answer = n − 1', 'Ones digit of the answer = 9 − (tens digit)', 'The two digits always add up to 9.'],
    nl: ['Voor n × 9 (n van 1 tot 10):', 'Tiental van het antwoord = n − 1', 'Eenheid van het antwoord = 9 − (tiental)', 'De twee cijfers tellen altijd op tot 9.'],
    de: ['Für n × 9 (n von 1 bis 10):', 'Zehnerstelle der Antwort = n − 1', 'Einerstelle der Antwort = 9 − (Zehnerstelle)', 'Die beiden Ziffern ergeben immer zusammen 9.'],
    es: ['Para n × 9 (n de 1 a 10):', 'La cifra de las decenas de la respuesta = n − 1', 'La cifra de las unidades de la respuesta = 9 − (cifra de las decenas)', 'Las dos cifras siempre suman 9.'],
    fr: ['Pour n × 9 (n de 1 à 10) :', 'Chiffre des dizaines de la réponse = n − 1', 'Chiffre des unités de la réponse = 9 − (chiffre des dizaines)', 'Les deux chiffres totalisent toujours 9.'],
    ar: ['لـ n × 9 (حيث n من 1 إلى 10):', 'رقم العشرات في الجواب = n − 1', 'رقم الآحاد في الجواب = 9 − (رقم العشرات)', 'مجموع الرقمين دائمًا يساوي 9.'],
  },
  exampleWork: {
    en: ['tens = 7 − 1 = 6', 'ones = 9 − 6 = 3'],
    nl: ['tiental = 7 − 1 = 6', 'eenheid = 9 − 6 = 3'],
    de: ['Zehner = 7 − 1 = 6', 'Einer = 9 − 6 = 3'],
    es: ['decenas = 7 − 1 = 6', 'unidades = 9 − 6 = 3'],
    fr: ['dizaines = 7 − 1 = 6', 'unités = 9 − 6 = 3'],
    ar: ['العشرات = 7 − 1 = 6', 'الآحاد = 9 − 6 = 3'],
  },
};

function nineTrickSub(n: number, tens: number): string {
  const ones = 9 - tens;
  switch (getLang()) {
    case 'nl': return `Truc: tiental = ${n} − 1 = ${tens}, eenheid = 9 − ${tens} = ${ones}`;
    case 'de': return `Trick: Zehner = ${n} − 1 = ${tens}, Einer = 9 − ${tens} = ${ones}`;
    case 'es': return `Truco: decenas = ${n} − 1 = ${tens}, unidades = 9 − ${tens} = ${ones}`;
    case 'fr': return `Astuce : dizaines = ${n} − 1 = ${tens}, unités = 9 − ${tens} = ${ones}`;
    case 'ar': return `الحيلة: العشرات = ${n} − 1 = ${tens}، الآحاد = 9 − ${tens} = ${ones}`;
    default: return `Trick: tens = ${n} − 1 = ${tens}, ones = 9 − ${tens} = ${ones}`;
  }
}

const ELEVEN_TRICK: TrickText = {
  title: { en: '×11 Trick', nl: '×11 Truc', de: '×11 Trick', es: 'Truco del ×11', fr: 'Astuce du ×11', ar: 'حيلة ×11' },
  summary: {
    en: 'Multiply any 2-digit number by 11 in your head.',
    nl: 'Vermenigvuldig elk 2-cijferig getal met 11 in je hoofd.',
    de: 'Multipliziere jede zweistellige Zahl im Kopf mit 11.',
    es: 'Multiplica cualquier número de 2 dígitos por 11 mentalmente.',
    fr: "Multiplie n'importe quel nombre à 2 chiffres par 11 de tête.",
    ar: 'اضرب أي رقم من رقمين في 11 ذهنيًا.',
  },
  steps: {
    en: ['For a 2-digit number "ab" × 11:', 'Add the two digits: a + b', 'Put that sum between a and b', 'If a + b ≥ 10, carry the 1 into the first digit'],
    nl: ['Voor een 2-cijferig getal "ab" × 11:', 'Tel de twee cijfers op: a + b', 'Plaats die som tussen a en b', 'Als a + b ≥ 10, draag de 1 over naar het eerste cijfer'],
    de: ['Für eine zweistellige Zahl "ab" × 11:', 'Addiere die beiden Ziffern: a + b', 'Setze diese Summe zwischen a und b', 'Wenn a + b ≥ 10 ist, trage die 1 in die erste Ziffer über'],
    es: ['Para un número de 2 dígitos "ab" × 11:', 'Suma las dos cifras: a + b', 'Coloca esa suma entre a y b', 'Si a + b ≥ 10, lleva el 1 a la primera cifra'],
    fr: ['Pour un nombre à 2 chiffres "ab" × 11 :', 'Additionne les deux chiffres : a + b', 'Place cette somme entre a et b', 'Si a + b ≥ 10, reporte le 1 sur le premier chiffre'],
    ar: ['لرقم من رقمين "ab" × 11:', 'اجمع الرقمين: a + b', 'ضع هذا المجموع بين a و b', 'إذا كان a + b ≥ 10، انقل الـ 1 إلى الرقم الأول'],
  },
  exampleWork: {
    en: ['3 + 4 = 7', 'Insert between: 3, 7, 4'],
    nl: ['3 + 4 = 7', 'Plaats ertussen: 3, 7, 4'],
    de: ['3 + 4 = 7', 'Dazwischen einfügen: 3, 7, 4'],
    es: ['3 + 4 = 7', 'Insertar entre: 3, 7, 4'],
    fr: ['3 + 4 = 7', 'Insérer entre : 3, 7, 4'],
    ar: ['3 + 4 = 7', 'ضعه بينهما: 3, 7, 4'],
  },
};

function elevenTrickSub(a: number, b: number): string {
  const sum = a + b;
  switch (getLang()) {
    case 'nl': return `Truc: ${a} + ${b} = ${sum} → plaats het tussen ${a} en ${b}`;
    case 'de': return `Trick: ${a} + ${b} = ${sum} → zwischen ${a} und ${b} setzen`;
    case 'es': return `Truco: ${a} + ${b} = ${sum} → colócalo entre ${a} y ${b}`;
    case 'fr': return `Astuce : ${a} + ${b} = ${sum} → place-le entre ${a} et ${b}`;
    case 'ar': return `الحيلة: ${a} + ${b} = ${sum} ← ضعه بين ${a} و ${b}`;
    default: return `Trick: ${a} + ${b} = ${sum} → put it between ${a} and ${b}`;
  }
}

const SQUARE_FIVE_TRICK: TrickText = {
  title: { en: 'Squares Ending in 5', nl: 'Kwadraten die eindigen op 5', de: 'Quadratzahlen, die auf 5 enden', es: 'Cuadrados que terminan en 5', fr: 'Carrés se terminant par 5', ar: 'مربعات تنتهي بـ 5' },
  summary: {
    en: 'Square any number ending in 5 in two quick steps.',
    nl: 'Kwadrateer elk getal dat eindigt op 5 in twee snelle stappen.',
    de: 'Quadriere jede Zahl, die auf 5 endet, in zwei schnellen Schritten.',
    es: 'Eleva al cuadrado cualquier número que termine en 5 en dos pasos rápidos.',
    fr: "Élève au carré n'importe quel nombre se terminant par 5 en deux étapes rapides.",
    ar: 'ربّع أي رقم ينتهي بـ 5 في خطوتين سريعتين.',
  },
  steps: {
    en: ['For a number "n5" (tens digit n, ones digit 5):', 'Multiply n × (n + 1)', 'Write 25 right after that result'],
    nl: ['Voor een getal "n5" (tiental n, eenheid 5):', 'Vermenigvuldig n × (n + 1)', 'Schrijf 25 direct na dat resultaat'],
    de: ['Für eine Zahl "n5" (Zehnerziffer n, Einerziffer 5):', 'Multipliziere n × (n + 1)', 'Schreibe 25 direkt hinter dieses Ergebnis'],
    es: ['Para un número "n5" (cifra de las decenas n, cifra de las unidades 5):', 'Multiplica n × (n + 1)', 'Escribe 25 justo después de ese resultado'],
    fr: ['Pour un nombre "n5" (chiffre des dizaines n, chiffre des unités 5) :', 'Multiplie n × (n + 1)', 'Écris 25 juste après ce résultat'],
    ar: ['لرقم "n5" (رقم العشرات n، رقم الآحاد 5):', 'اضرب n × (n + 1)', 'اكتب 25 مباشرة بعد تلك النتيجة'],
  },
  exampleWork: {
    en: ['3 × 4 = 12', 'Append 25'],
    nl: ['3 × 4 = 12', 'Voeg 25 toe'],
    de: ['3 × 4 = 12', '25 anhängen'],
    es: ['3 × 4 = 12', 'Añade 25'],
    fr: ['3 × 4 = 12', 'Ajoute 25'],
    ar: ['3 × 4 = 12', 'أضف 25'],
  },
};

function squareFiveSub(t: number): string {
  const product = t * (t + 1);
  switch (getLang()) {
    case 'nl': return `Truc: ${t} × ${t + 1} = ${product}, voeg dan 25 toe`;
    case 'de': return `Trick: ${t} × ${t + 1} = ${product}, dann 25 anhängen`;
    case 'es': return `Truco: ${t} × ${t + 1} = ${product}, luego añade 25`;
    case 'fr': return `Astuce : ${t} × ${t + 1} = ${product}, puis ajoute 25`;
    case 'ar': return `الحيلة: ${t} × ${t + 1} = ${product}، ثم أضف 25`;
    default: return `Trick: ${t} × ${t + 1} = ${product}, then append 25`;
  }
}

const FIVE_TRICK: TrickText = {
  title: { en: '×5 Double-Halve Trick', nl: '×5 Verdubbel-Halveer Truc', de: '×5 Verdoppeln-Halbieren-Trick', es: 'Truco del ×5 doblar y partir', fr: 'Astuce du ×5 doubler-diviser', ar: 'حيلة ×5 (×10 ثم ÷2)' },
  summary: {
    en: 'Multiplying by 5 is just ×10 then ÷2.',
    nl: 'Vermenigvuldigen met 5 is gewoon ×10 en dan ÷2.',
    de: 'Multiplizieren mit 5 ist einfach ×10 und dann ÷2.',
    es: 'Multiplicar por 5 es simplemente ×10 y luego ÷2.',
    fr: "Multiplier par 5, c'est simplement ×10 puis ÷2.",
    ar: 'الضرب في 5 هو ببساطة ×10 ثم ÷2.',
  },
  steps: {
    en: ['For n × 5:', 'Multiply n by 10 instead (just add a zero)', 'Then divide that result by 2'],
    nl: ['Voor n × 5:', 'Vermenigvuldig n in plaats daarvan met 10 (voeg gewoon een nul toe)', 'Deel dat resultaat vervolgens door 2'],
    de: ['Für n × 5:', 'Multipliziere n stattdessen mit 10 (füge einfach eine Null hinzu)', 'Teile dieses Ergebnis dann durch 2'],
    es: ['Para n × 5:', 'Multiplica n por 10 en su lugar (solo añade un cero)', 'Luego divide ese resultado entre 2'],
    fr: ['Pour n × 5 :', 'Multiplie plutôt n par 10 (ajoute simplement un zéro)', 'Divise ensuite ce résultat par 2'],
    ar: ['لـ n × 5:', 'اضرب n في 10 بدلاً من ذلك (فقط أضف صفرًا)', 'ثم اقسم تلك النتيجة على 2'],
  },
  exampleWork: {
    en: ['46 × 10 = 460', '460 ÷ 2 = 230'],
    nl: ['46 × 10 = 460', '460 ÷ 2 = 230'],
    de: ['46 × 10 = 460', '460 ÷ 2 = 230'],
    es: ['46 × 10 = 460', '460 ÷ 2 = 230'],
    fr: ['46 × 10 = 460', '460 ÷ 2 = 230'],
    ar: ['46 × 10 = 460', '460 ÷ 2 = 230'],
  },
};

function fiveTrickSub(n: number): string {
  const tenTimes = n * 10;
  switch (getLang()) {
    case 'nl': return `Truc: ${n} × 10 = ${tenTimes}, deel dan door 2`;
    case 'de': return `Trick: ${n} × 10 = ${tenTimes}, dann ÷ 2`;
    case 'es': return `Truco: ${n} × 10 = ${tenTimes}, luego ÷ 2`;
    case 'fr': return `Astuce : ${n} × 10 = ${tenTimes}, puis ÷ 2`;
    case 'ar': return `الحيلة: ${n} × 10 = ${tenTimes}، ثم ÷ 2`;
    default: return `Trick: ${n} × 10 = ${tenTimes}, then ÷ 2`;
  }
}

const LINE_MULT_TRICK: TrickText = {
  title: { en: 'Chinese Line Multiplication', nl: 'Chinese Lijnvermenigvuldiging', de: 'Chinesische Linienmultiplikation', es: 'Multiplicación china con líneas', fr: 'Multiplication chinoise par lignes', ar: 'الضرب الصيني بالخطوط' },
  summary: {
    en: 'Multiply two 2-digit numbers by drawing and counting crossing lines.',
    nl: 'Vermenigvuldig twee 2-cijferige getallen door kruisende lijnen te tekenen en te tellen.',
    de: 'Multipliziere zwei zweistellige Zahlen, indem du sich kreuzende Linien zeichnest und zählst.',
    es: 'Multiplica dos números de 2 dígitos dibujando y contando líneas que se cruzan.',
    fr: 'Multiplie deux nombres à 2 chiffres en traçant et en comptant des lignes qui se croisent.',
    ar: 'اضرب رقمين من رقمين برسم خطوط متقاطعة وعدّها.',
  },
  steps: {
    en: ['Draw one set of lines for each digit of the first number,', 'crossing a second set of lines for each digit of the second number.', 'Count the intersection dots in three groups: left (hundreds),', 'middle (tens), right (ones) — that gives you the answer digits.'],
    nl: ['Teken een set lijnen voor elk cijfer van het eerste getal,', 'die een tweede set lijnen kruisen voor elk cijfer van het tweede getal.', 'Tel de kruispunten in drie groepen: links (honderdtallen),', 'midden (tiental), rechts (eenheid) — dat geeft je de cijfers van het antwoord.'],
    de: ['Zeichne für jede Ziffer der ersten Zahl eine Reihe Linien,', 'die eine zweite Reihe Linien für jede Ziffer der zweiten Zahl kreuzen.', 'Zähle die Kreuzungspunkte in drei Gruppen: links (Hunderter),', 'Mitte (Zehner), rechts (Einer) — das ergibt die Ziffern der Antwort.'],
    es: ['Dibuja un conjunto de líneas para cada cifra del primer número,', 'que crucen un segundo conjunto de líneas para cada cifra del segundo número.', 'Cuenta los puntos de intersección en tres grupos: izquierda (centenas),', 'medio (decenas), derecha (unidades) — eso te da las cifras de la respuesta.'],
    fr: ['Trace un ensemble de lignes pour chaque chiffre du premier nombre,', 'qui croisent un second ensemble de lignes pour chaque chiffre du second nombre.', "Compte les points d'intersection en trois groupes : gauche (centaines),", 'milieu (dizaines), droite (unités) — cela te donne les chiffres de la réponse.'],
    ar: ['ارسم مجموعة خطوط لكل رقم من الرقم الأول،', 'تتقاطع مع مجموعة ثانية من الخطوط لكل رقم من الرقم الثاني.', 'عدّ نقاط التقاطع في ثلاث مجموعات: اليسار (المئات)،', 'الوسط (العشرات)، اليمين (الآحاد) — وهذا يعطيك أرقام الإجابة.'],
  },
  exampleWork: {
    en: ['Hundreds: 1 × 3 = 3', 'Tens: 1 × 2 + 2 × 3 = 8', 'Ones: 2 × 2 = 4'],
    nl: ['Honderdtallen: 1 × 3 = 3', 'Tiental: 1 × 2 + 2 × 3 = 8', 'Eenheid: 2 × 2 = 4'],
    de: ['Hunderter: 1 × 3 = 3', 'Zehner: 1 × 2 + 2 × 3 = 8', 'Einer: 2 × 2 = 4'],
    es: ['Centenas: 1 × 3 = 3', 'Decenas: 1 × 2 + 2 × 3 = 8', 'Unidades: 2 × 2 = 4'],
    fr: ['Centaines : 1 × 3 = 3', 'Dizaines : 1 × 2 + 2 × 3 = 8', 'Unités : 2 × 2 = 4'],
    ar: ['المئات: 1 × 3 = 3', 'العشرات: 1 × 2 + 2 × 3 = 8', 'الآحاد: 2 × 2 = 4'],
  },
};

function lineMultSub(): string {
  switch (getLang()) {
    case 'nl': return 'Truc: tel kruisende lijnen per plaatswaarde — honderdtallen, tiental, eenheid';
    case 'de': return 'Trick: zähle sich kreuzende Linien nach Stellenwert — Hunderter, Zehner, Einer';
    case 'es': return 'Truco: cuenta las líneas que se cruzan por valor posicional — centenas, decenas, unidades';
    case 'fr': return 'Astuce : compte les lignes qui se croisent par valeur de position — centaines, dizaines, unités';
    case 'ar': return 'الحيلة: عدّ الخطوط المتقاطعة حسب القيمة المكانية — المئات، العشرات، الآحاد';
    default: return 'Trick: count crossing lines by place value — hundreds, tens, ones';
  }
}

export const TRICKS: Trick[] = [
  {
    id: 'nine-trick',
    icon: '✋',
    title: () => pick(NINE_TRICK.title),
    summary: () => pick(NINE_TRICK.summary),
    steps: () => pick(NINE_TRICK.steps),
    example: { problem: '7 × 9', work: () => pick(NINE_TRICK.exampleWork), answer: '63' },
    totalQuestions: 8,
    generateQuestion: (): QuizQuestion => {
      const n = randInt(2, 10);
      const correct = n * 9;
      const tens = n - 1;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        correct + 9, correct - 9, correct + 1, correct - 1, (tens + 1) * 10 + (9 - tens),
      ]);
      return {
        prompt: `${n} × 9 = ?`,
        sub: nineTrickSub(n, tens),
        choices,
        correctIndex,
      };
    },
    generateMatchItems: (pairs) => {
      const probs = distinctBy(pairs, () => {
        const n = randInt(2, 10);
        return { n, correct: n * 9 };
      }, (p) => p.correct);
      return probs.map((p, i) => ({ id: i, sideA: `${p.n} × 9`, sideB: String(p.correct) }));
    },
    generateSequenceRound: (count) => {
      const probs = distinctBy(count, () => {
        const n = randInt(2, 10);
        return { n, correct: n * 9 };
      }, (p) => p.correct).sort((a, b) => a.correct - b.correct);
      return probs.map((p, i) => ({ id: i, label: `${p.n} × 9` }));
    },
  },
  {
    id: 'eleven-trick',
    icon: '➕',
    title: () => pick(ELEVEN_TRICK.title),
    summary: () => pick(ELEVEN_TRICK.summary),
    steps: () => pick(ELEVEN_TRICK.steps),
    example: { problem: '34 × 11', work: () => pick(ELEVEN_TRICK.exampleWork), answer: '374' },
    totalQuestions: 8,
    generateQuestion: (): QuizQuestion => {
      const n = randInt(10, 99);
      const a = Math.floor(n / 10);
      const b = n % 10;
      const correct = n * 11;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        a * 100 + b, // forgot to add the digits
        correct + 10,
        correct - 10,
        n * 10 + n, // digit-slip variant
      ]);
      return {
        prompt: `${n} × 11 = ?`,
        sub: elevenTrickSub(a, b),
        choices,
        correctIndex,
      };
    },
    generateMatchItems: (pairs) => {
      const probs = distinctBy(pairs, () => {
        const n = randInt(10, 99);
        return { n, correct: n * 11 };
      }, (p) => p.correct);
      return probs.map((p, i) => ({ id: i, sideA: `${p.n} × 11`, sideB: String(p.correct) }));
    },
    generateSequenceRound: (count) => {
      const probs = distinctBy(count, () => {
        const n = randInt(10, 99);
        return { n, correct: n * 11 };
      }, (p) => p.correct).sort((a, b) => a.correct - b.correct);
      return probs.map((p, i) => ({ id: i, label: `${p.n} × 11` }));
    },
  },
  {
    id: 'square-five',
    icon: '5️⃣',
    title: () => pick(SQUARE_FIVE_TRICK.title),
    summary: () => pick(SQUARE_FIVE_TRICK.summary),
    steps: () => pick(SQUARE_FIVE_TRICK.steps),
    example: { problem: '35²', work: () => pick(SQUARE_FIVE_TRICK.exampleWork), answer: '1225' },
    totalQuestions: 8,
    generateQuestion: (): QuizQuestion => {
      const t = randInt(1, 9);
      const num = t * 10 + 5;
      const correct = num * num;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        t * (t + 1) * 100 + 50, // wrong tail
        (t + 1) * (t + 2) * 100 + 25, // off-by-one tens step
        correct + 100,
        correct - 100,
      ]);
      return {
        prompt: `${num}² = ?`,
        sub: squareFiveSub(t),
        choices,
        correctIndex,
      };
    },
    generateMatchItems: (pairs) => {
      const probs = distinctBy(pairs, () => {
        const t = randInt(1, 9);
        const num = t * 10 + 5;
        return { num, correct: num * num };
      }, (p) => p.correct);
      return probs.map((p, i) => ({ id: i, sideA: `${p.num}²`, sideB: String(p.correct) }));
    },
    generateSequenceRound: (count) => {
      const probs = distinctBy(count, () => {
        const t = randInt(1, 9);
        const num = t * 10 + 5;
        return { num, correct: num * num };
      }, (p) => p.correct).sort((a, b) => a.correct - b.correct);
      return probs.map((p, i) => ({ id: i, label: `${p.num}²` }));
    },
  },
  {
    id: 'five-trick',
    icon: '➗',
    title: () => pick(FIVE_TRICK.title),
    summary: () => pick(FIVE_TRICK.summary),
    steps: () => pick(FIVE_TRICK.steps),
    example: { problem: '46 × 5', work: () => pick(FIVE_TRICK.exampleWork), answer: '230' },
    totalQuestions: 8,
    generateQuestion: (): QuizQuestion => {
      const n = randInt(2, 98);
      const correct = n * 5;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        n * 10, // forgot to halve
        correct + 5,
        correct - 5,
        Math.round(n * 10 / 2) + 10,
      ]);
      return {
        prompt: `${n} × 5 = ?`,
        sub: fiveTrickSub(n),
        choices,
        correctIndex,
      };
    },
    generateMatchItems: (pairs) => {
      const probs = distinctBy(pairs, () => {
        const n = randInt(2, 98);
        return { n, correct: n * 5 };
      }, (p) => p.correct);
      return probs.map((p, i) => ({ id: i, sideA: `${p.n} × 5`, sideB: String(p.correct) }));
    },
    generateSequenceRound: (count) => {
      const probs = distinctBy(count, () => {
        const n = randInt(2, 98);
        return { n, correct: n * 5 };
      }, (p) => p.correct).sort((a, b) => a.correct - b.correct);
      return probs.map((p, i) => ({ id: i, label: `${p.n} × 5` }));
    },
  },
  {
    id: 'line-multiplication',
    icon: '📏',
    title: () => pick(LINE_MULT_TRICK.title),
    summary: () => pick(LINE_MULT_TRICK.summary),
    steps: () => pick(LINE_MULT_TRICK.steps),
    example: { problem: '12 × 32', work: () => pick(LINE_MULT_TRICK.exampleWork), answer: '384' },
    totalQuestions: 8,
    hasDiagram: true,
    generateQuestion: (): QuizQuestion => {
      // Digits kept small (1–4) so every place-value sum stays under 10 —
      // exactly what makes the line-counting method work without carrying.
      const da = randInt(1, 4);
      const ua = randInt(1, 4);
      const db = randInt(1, 4);
      const ub = randInt(1, 4);
      const a = da * 10 + ua;
      const b = db * 10 + ub;
      const correct = a * b;
      const { choices, correctIndex } = buildNumericChoices(correct, [
        da * db * 100 + ua * ub, // skipped the cross terms entirely
        correct + 10,
        correct - 10,
        (da * db) * 100 + (da * ub + ua * db + 1) * 10 + ua * ub,
      ]);
      return {
        prompt: `${a} × ${b} = ?`,
        sub: lineMultSub(),
        choices,
        correctIndex,
      };
    },
    generateMatchItems: (pairs) => {
      const probs = distinctBy(pairs, () => {
        const a = randInt(1, 4) * 10 + randInt(1, 4);
        const b = randInt(1, 4) * 10 + randInt(1, 4);
        return { a, b, correct: a * b };
      }, (p) => p.correct);
      return probs.map((p, i) => ({ id: i, sideA: `${p.a} × ${p.b}`, sideB: String(p.correct) }));
    },
    generateSequenceRound: (count) => {
      const probs = distinctBy(count, () => {
        const a = randInt(1, 4) * 10 + randInt(1, 4);
        const b = randInt(1, 4) * 10 + randInt(1, 4);
        return { a, b, correct: a * b };
      }, (p) => p.correct).sort((x, y) => x.correct - y.correct);
      return probs.map((p, i) => ({ id: i, label: `${p.a} × ${p.b}` }));
    },
  },
];
