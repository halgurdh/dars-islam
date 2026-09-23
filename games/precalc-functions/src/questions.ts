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

// Helper for items whose answer/wrong choices are pure math notation
// (numbers, coordinates, expressions) — identical across every language.
function notation(answer: string, wrong: [string, string, string]) {
  return {
    answerEn: answer, answerNl: answer, answerDe: answer, answerEs: answer, answerFr: answer, answerAr: answer,
    wrongEn: wrong, wrongNl: wrong, wrongDe: wrong, wrongEs: wrong, wrongFr: wrong, wrongAr: wrong,
  };
}

// Easy: what a function is, function notation, domain and range.
const EASY_ITEMS: Item[] = [
  { promptEn: 'What do we call a rule that assigns exactly one output to each input?', promptNl: 'Hoe noemen we een regel die aan elke invoer precies één uitvoer toekent?', promptDe: 'Wie nennen wir eine Regel, die jeder Eingabe genau eine Ausgabe zuordnet?', promptEs: '¿Cómo llamamos a una regla que asigna exactamente una salida a cada entrada?', promptFr: 'Comment appelle-t-on une règle qui associe exactement une sortie à chaque entrée ?', promptAr: 'ماذا نسمي القاعدة التي تُعطي مُخرجًا واحدًا فقط لكل مُدخل؟',
    answerEn: 'A function', answerNl: 'Een functie', answerDe: 'Eine Funktion', answerEs: 'Una función', answerFr: 'Une fonction', answerAr: 'دالة',
    wrongEn: ['A variable', 'An equation', 'A constant'], wrongNl: ['Een variabele', 'Een vergelijking', 'Een constante'], wrongDe: ['Eine Variable', 'Eine Gleichung', 'Eine Konstante'],
    wrongEs: ['Una variable', 'Una ecuación', 'Una constante'], wrongFr: ['Une variable', 'Une équation', 'Une constante'], wrongAr: ['متغير', 'معادلة', 'ثابت'] },
  { promptEn: 'In function notation f(x), what does "f(3)" mean?', promptNl: 'Wat betekent "f(3)" in de functienotatie f(x)?', promptDe: 'Was bedeutet "f(3)" in der Funktionsschreibweise f(x)?', promptEs: 'En la notación de función f(x), ¿qué significa "f(3)"?', promptFr: 'Dans la notation fonctionnelle f(x), que signifie « f(3) » ?', promptAr: 'في تدوين الدالة f(x)، ماذا تعني "f(3)"؟',
    answerEn: 'Evaluate the function at x = 3', answerNl: 'Bereken de functie bij x = 3', answerDe: 'Die Funktion bei x = 3 auswerten', answerEs: 'Evaluar la función en x = 3', answerFr: 'Évaluer la fonction en x = 3', answerAr: 'حساب قيمة الدالة عند x = 3',
    wrongEn: ['Multiply f by 3', 'Add 3 to f', 'The 3rd function'], wrongNl: ['Vermenigvuldig f met 3', 'Tel 3 op bij f', 'De 3e functie'], wrongDe: ['f mit 3 multiplizieren', '3 zu f addieren', 'Die 3. Funktion'],
    wrongEs: ['Multiplicar f por 3', 'Sumar 3 a f', 'La 3.ª función'], wrongFr: ['Multiplier f par 3', 'Ajouter 3 à f', 'La 3e fonction'], wrongAr: ['ضرب f في 3', 'إضافة 3 إلى f', 'الدالة الثالثة'] },
  { promptEn: 'If f(x) = x + 2, what is f(5)?', promptNl: 'Als f(x) = x + 2, wat is f(5)?', promptDe: 'Wenn f(x) = x + 2 ist, was ist f(5)?', promptEs: 'Si f(x) = x + 2, ¿cuánto es f(5)?', promptFr: 'Si f(x) = x + 2, que vaut f(5) ?', promptAr: 'إذا كانت f(x) = x + 2، فما قيمة f(5)؟',
    ...notation('7', ['5', '10', '3']) },
  { promptEn: 'If f(x) = 2x, what is f(4)?', promptNl: 'Als f(x) = 2x, wat is f(4)?', promptDe: 'Wenn f(x) = 2x ist, was ist f(4)?', promptEs: 'Si f(x) = 2x, ¿cuánto es f(4)?', promptFr: 'Si f(x) = 2x, que vaut f(4) ?', promptAr: 'إذا كانت f(x) = 2x، فما قيمة f(4)؟',
    ...notation('8', ['6', '4', '2']) },
  { promptEn: 'What is the domain of a function?', promptNl: 'Wat is het domein van een functie?', promptDe: 'Was ist der Definitionsbereich einer Funktion?', promptEs: '¿Qué es el dominio de una función?', promptFr: "Qu'est-ce que le domaine d'une fonction ?", promptAr: 'ما هو مجال الدالة؟',
    answerEn: 'The set of all possible input (x) values', answerNl: 'De verzameling van alle mogelijke invoerwaarden (x)', answerDe: 'Die Menge aller möglichen Eingabewerte (x)', answerEs: 'El conjunto de todos los posibles valores de entrada (x)', answerFr: "L'ensemble de toutes les valeurs d'entrée possibles (x)", answerAr: 'مجموعة جميع القيم المدخلة الممكنة (x)',
    wrongEn: ['The set of all output (y) values', 'The highest point on the graph', 'The slope of the line'], wrongNl: ['De verzameling van alle uitvoerwaarden (y)', 'Het hoogste punt van de grafiek', 'De helling van de lijn'], wrongDe: ['Die Menge aller Ausgabewerte (y)', 'Der höchste Punkt des Graphen', 'Die Steigung der Linie'],
    wrongEs: ['El conjunto de todos los valores de salida (y)', 'El punto más alto de la gráfica', 'La pendiente de la recta'], wrongFr: ["L'ensemble de toutes les valeurs de sortie (y)", 'Le point le plus haut du graphique', 'La pente de la droite'], wrongAr: ['مجموعة جميع القيم المخرجة (y)', 'أعلى نقطة في الرسم البياني', 'ميل الخط'] },
  { promptEn: 'What is the range of a function?', promptNl: 'Wat is het bereik van een functie?', promptDe: 'Was ist der Wertebereich einer Funktion?', promptEs: '¿Qué es el rango de una función?', promptFr: "Qu'est-ce que l'image d'une fonction ?", promptAr: 'ما هو مدى الدالة؟',
    answerEn: 'The set of all possible output (y) values', answerNl: 'De verzameling van alle mogelijke uitvoerwaarden (y)', answerDe: 'Die Menge aller möglichen Ausgabewerte (y)', answerEs: 'El conjunto de todos los posibles valores de salida (y)', answerFr: "L'ensemble de toutes les valeurs de sortie possibles (y)", answerAr: 'مجموعة جميع القيم المخرجة الممكنة (y)',
    wrongEn: ['The set of all input (x) values', 'The lowest point on the graph', 'The y-intercept'], wrongNl: ['De verzameling van alle invoerwaarden (x)', 'Het laagste punt van de grafiek', 'Het snijpunt met de y-as'], wrongDe: ['Die Menge aller Eingabewerte (x)', 'Der niedrigste Punkt des Graphen', 'Der y-Achsenabschnitt'],
    wrongEs: ['El conjunto de todos los valores de entrada (x)', 'El punto más bajo de la gráfica', 'La intersección con el eje y'], wrongFr: ["L'ensemble de toutes les valeurs d'entrée (x)", 'Le point le plus bas du graphique', "L'ordonnée à l'origine"], wrongAr: ['مجموعة جميع القيم المدخلة (x)', 'أدنى نقطة في الرسم البياني', 'نقطة تقاطع y'] },
  { promptEn: 'What do we call the point where a graph crosses the x-axis?', promptNl: 'Hoe noemen we het punt waar een grafiek de x-as kruist?', promptDe: 'Wie nennen wir den Punkt, an dem ein Graph die x-Achse schneidet?', promptEs: '¿Cómo llamamos al punto donde una gráfica cruza el eje x?', promptFr: "Comment appelle-t-on le point où un graphique croise l'axe des x ?", promptAr: 'ماذا نسمي النقطة التي يقطع فيها الرسم البياني محور السينات؟',
    answerEn: 'An x-intercept (root)', answerNl: 'Een x-snijpunt (nulpunt)', answerDe: 'Eine Nullstelle (x-Achsenabschnitt)', answerEs: 'Una intersección con el eje x (raíz)', answerFr: 'Un zéro (racine)', answerAr: 'نقطة تقاطع x (جذر)',
    wrongEn: ['A y-intercept', 'An asymptote', 'A vertex'], wrongNl: ['Een y-snijpunt', 'Een asymptoot', 'Een top'], wrongDe: ['Ein y-Achsenabschnitt', 'Eine Asymptote', 'Ein Scheitelpunkt'],
    wrongEs: ['Una intersección con el eje y', 'Una asíntota', 'Un vértice'], wrongFr: ["Une ordonnée à l'origine", 'Une asymptote', 'Un sommet'], wrongAr: ['نقطة تقاطع y', 'خط مقارب', 'رأس'] },
  { promptEn: 'If f(x) = x², what is f(3)?', promptNl: 'Als f(x) = x², wat is f(3)?', promptDe: 'Wenn f(x) = x² ist, was ist f(3)?', promptEs: 'Si f(x) = x², ¿cuánto es f(3)?', promptFr: 'Si f(x) = x², que vaut f(3) ?', promptAr: 'إذا كانت f(x) = x²، فما قيمة f(3)؟',
    ...notation('9', ['6', '3', '12']) },
];

// Medium: linear and quadratic function properties, and simple composition.
const MEDIUM_ITEMS: Item[] = [
  { promptEn: 'What is the slope of the line y = 3x + 2?', promptNl: 'Wat is de helling van de lijn y = 3x + 2?', promptDe: 'Wie groß ist die Steigung der Linie y = 3x + 2?', promptEs: '¿Cuál es la pendiente de la recta y = 3x + 2?', promptFr: 'Quelle est la pente de la droite y = 3x + 2 ?', promptAr: 'ما هو ميل الخط y = 3x + 2؟',
    ...notation('3', ['2', '5', '1/3']) },
  { promptEn: 'What is the y-intercept of the line y = 3x + 2?', promptNl: 'Wat is het snijpunt met de y-as van de lijn y = 3x + 2?', promptDe: 'Was ist der y-Achsenabschnitt der Linie y = 3x + 2?', promptEs: '¿Cuál es la intersección con el eje y de la recta y = 3x + 2?', promptFr: "Quelle est l'ordonnée à l'origine de la droite y = 3x + 2 ?", promptAr: 'ما هي نقطة تقاطع y للخط y = 3x + 2؟',
    ...notation('2', ['3', '0', '5']) },
  { promptEn: 'What shape does the graph of a quadratic function f(x) = x² make?', promptNl: 'Welke vorm heeft de grafiek van een kwadratische functie f(x) = x²?', promptDe: 'Welche Form hat der Graph einer quadratischen Funktion f(x) = x²?', promptEs: '¿Qué forma tiene la gráfica de una función cuadrática f(x) = x²?', promptFr: "Quelle forme prend le graphique d'une fonction quadratique f(x) = x² ?", promptAr: 'ما هو شكل الرسم البياني للدالة التربيعية f(x) = x²؟',
    answerEn: 'A parabola', answerNl: 'Een parabool', answerDe: 'Eine Parabel', answerEs: 'Una parábola', answerFr: 'Une parabole', answerAr: 'قطع مكافئ',
    wrongEn: ['A straight line', 'A circle', 'A hyperbola'], wrongNl: ['Een rechte lijn', 'Een cirkel', 'Een hyperbool'], wrongDe: ['Eine gerade Linie', 'Ein Kreis', 'Eine Hyperbel'],
    wrongEs: ['Una línea recta', 'Un círculo', 'Una hipérbola'], wrongFr: ['Une droite', 'Un cercle', 'Une hyperbole'], wrongAr: ['خط مستقيم', 'دائرة', 'قطع زائد'] },
  { promptEn: 'What are the zeros (roots) of f(x) = x² - 4?', promptNl: 'Wat zijn de nulpunten (wortels) van f(x) = x² - 4?', promptDe: 'Was sind die Nullstellen von f(x) = x² - 4?', promptEs: '¿Cuáles son los ceros (raíces) de f(x) = x² - 4?', promptFr: 'Quels sont les zéros (racines) de f(x) = x² - 4 ?', promptAr: 'ما هي أصفار (جذور) f(x) = x² - 4؟',
    ...notation('x = 2 and x = -2', ['x = 4 and x = -4', 'x = 0 only', 'x = 2 only']) },
  { promptEn: 'What is the vertex of the parabola y = x²?', promptNl: 'Wat is de top van de parabool y = x²?', promptDe: 'Was ist der Scheitelpunkt der Parabel y = x²?', promptEs: '¿Cuál es el vértice de la parábola y = x²?', promptFr: 'Quel est le sommet de la parabole y = x² ?', promptAr: 'ما هو رأس القطع المكافئ y = x²؟',
    ...notation('(0, 0)', ['(1, 1)', '(0, 1)', '(-1, 0)']) },
  { promptEn: 'If g(x) = 2x - 1, what is g(3)?', promptNl: 'Als g(x) = 2x - 1, wat is g(3)?', promptDe: 'Wenn g(x) = 2x - 1 ist, was ist g(3)?', promptEs: 'Si g(x) = 2x - 1, ¿cuánto es g(3)?', promptFr: 'Si g(x) = 2x - 1, que vaut g(3) ?', promptAr: 'إذا كانت g(x) = 2x - 1، فما قيمة g(3)؟',
    ...notation('5', ['4', '6', '2']) },
  { promptEn: 'What do we call a function whose graph is a straight line?', promptNl: 'Hoe noemen we een functie waarvan de grafiek een rechte lijn is?', promptDe: 'Wie nennen wir eine Funktion, deren Graph eine gerade Linie ist?', promptEs: '¿Cómo llamamos a una función cuya gráfica es una línea recta?', promptFr: 'Comment appelle-t-on une fonction dont le graphique est une droite ?', promptAr: 'ماذا نسمي الدالة التي يكون رسمها البياني خطًا مستقيمًا؟',
    answerEn: 'A linear function', answerNl: 'Een lineaire functie', answerDe: 'Eine lineare Funktion', answerEs: 'Una función lineal', answerFr: 'Une fonction linéaire', answerAr: 'دالة خطية',
    wrongEn: ['A quadratic function', 'An exponential function', 'A cubic function'], wrongNl: ['Een kwadratische functie', 'Een exponentiële functie', 'Een kubische functie'], wrongDe: ['Eine quadratische Funktion', 'Eine Exponentialfunktion', 'Eine kubische Funktion'],
    wrongEs: ['Una función cuadrática', 'Una función exponencial', 'Una función cúbica'], wrongFr: ['Une fonction quadratique', 'Une fonction exponentielle', 'Une fonction cubique'], wrongAr: ['دالة تربيعية', 'دالة أسية', 'دالة تكعيبية'] },
  { promptEn: 'If f(x) = x + 1 and g(x) = 2x, what is f(g(3))?', promptNl: 'Als f(x) = x + 1 en g(x) = 2x, wat is f(g(3))?', promptDe: 'Wenn f(x) = x + 1 und g(x) = 2x ist, was ist f(g(3))?', promptEs: 'Si f(x) = x + 1 y g(x) = 2x, ¿cuánto es f(g(3))?', promptFr: 'Si f(x) = x + 1 et g(x) = 2x, que vaut f(g(3)) ?', promptAr: 'إذا كانت f(x) = x + 1 و g(x) = 2x، فما قيمة f(g(3))؟',
    ...notation('7', ['6', '8', '9']) },
];

// Hard: composite and inverse functions, and exponential basics.
const HARD_ITEMS: Item[] = [
  { promptEn: 'If f(x) = x + 3 and g(x) = x - 3, what is f(g(x)) for any x?', promptNl: 'Als f(x) = x + 3 en g(x) = x - 3, wat is f(g(x)) voor elke x?', promptDe: 'Wenn f(x) = x + 3 und g(x) = x - 3 ist, was ist f(g(x)) für jedes x?', promptEs: 'Si f(x) = x + 3 y g(x) = x - 3, ¿cuánto es f(g(x)) para cualquier x?', promptFr: 'Si f(x) = x + 3 et g(x) = x - 3, que vaut f(g(x)) pour tout x ?', promptAr: 'إذا كانت f(x) = x + 3 و g(x) = x - 3، فما قيمة f(g(x)) لأي x؟',
    ...notation('x', ['x + 6', 'x - 6', '2x']) },
  { promptEn: 'What do we call two functions that "undo" each other, like f(x) = x + 3 and g(x) = x - 3?', promptNl: 'Hoe noemen we twee functies die elkaars tegengestelde zijn, zoals f(x) = x + 3 en g(x) = x - 3?', promptDe: 'Wie nennen wir zwei Funktionen, die sich gegenseitig „aufheben", wie f(x) = x + 3 und g(x) = x - 3?', promptEs: '¿Cómo llamamos a dos funciones que se "deshacen" mutuamente, como f(x) = x + 3 y g(x) = x - 3?', promptFr: 'Comment appelle-t-on deux fonctions qui « s\'annulent » mutuellement, comme f(x) = x + 3 et g(x) = x - 3 ?', promptAr: 'ماذا نسمي دالتين "تُلغي" إحداهما الأخرى، مثل f(x) = x + 3 و g(x) = x - 3؟',
    answerEn: 'Inverse functions', answerNl: 'Inverse functies', answerDe: 'Umkehrfunktionen', answerEs: 'Funciones inversas', answerFr: 'Fonctions réciproques', answerAr: 'دوال عكسية',
    wrongEn: ['Composite functions', 'Linear functions', 'Parallel functions'], wrongNl: ['Samengestelde functies', 'Lineaire functies', 'Parallelle functies'], wrongDe: ['Verkettete Funktionen', 'Lineare Funktionen', 'Parallele Funktionen'],
    wrongEs: ['Funciones compuestas', 'Funciones lineales', 'Funciones paralelas'], wrongFr: ['Fonctions composées', 'Fonctions linéaires', 'Fonctions parallèles'], wrongAr: ['دوال مركبة', 'دوال خطية', 'دوال متوازية'] },
  { promptEn: 'If f(x) = 2^x, what is f(3)?', promptNl: 'Als f(x) = 2^x, wat is f(3)?', promptDe: 'Wenn f(x) = 2^x ist, was ist f(3)?', promptEs: 'Si f(x) = 2^x, ¿cuánto es f(3)?', promptFr: 'Si f(x) = 2^x, que vaut f(3) ?', promptAr: 'إذا كانت f(x) = 2^x، فما قيمة f(3)؟',
    ...notation('8', ['6', '9', '16']) },
  { promptEn: 'What is the domain restriction on the function f(x) = 1/x?', promptNl: 'Wat is de domeinbeperking van de functie f(x) = 1/x?', promptDe: 'Welche Definitionsbereich-Einschränkung hat die Funktion f(x) = 1/x?', promptEs: '¿Cuál es la restricción del dominio de la función f(x) = 1/x?', promptFr: 'Quelle est la restriction de domaine de la fonction f(x) = 1/x ?', promptAr: 'ما هو قيد المجال على الدالة f(x) = 1/x؟',
    answerEn: 'x cannot equal 0', answerNl: 'x mag niet gelijk zijn aan 0', answerDe: 'x darf nicht 0 sein', answerEs: 'x no puede ser igual a 0', answerFr: 'x ne peut pas être égal à 0', answerAr: 'لا يمكن أن تساوي x صفرًا',
    wrongEn: ['x cannot equal 1', 'x cannot be negative', 'There is no restriction'], wrongNl: ['x mag niet gelijk zijn aan 1', 'x mag niet negatief zijn', 'Er is geen beperking'], wrongDe: ['x darf nicht 1 sein', 'x darf nicht negativ sein', 'Es gibt keine Einschränkung'],
    wrongEs: ['x no puede ser igual a 1', 'x no puede ser negativo', 'No hay restricción'], wrongFr: ["x ne peut pas être égal à 1", 'x ne peut pas être négatif', "Il n'y a pas de restriction"], wrongAr: ['لا يمكن أن تساوي x واحدًا', 'لا يمكن أن تكون x سالبة', 'لا يوجد قيد'] },
  { promptEn: 'If f(x) = x² and g(x) = x + 1, what is f(g(2))?', promptNl: 'Als f(x) = x² en g(x) = x + 1, wat is f(g(2))?', promptDe: 'Wenn f(x) = x² und g(x) = x + 1 ist, was ist f(g(2))?', promptEs: 'Si f(x) = x² y g(x) = x + 1, ¿cuánto es f(g(2))?', promptFr: 'Si f(x) = x² et g(x) = x + 1, que vaut f(g(2)) ?', promptAr: 'إذا كانت f(x) = x² و g(x) = x + 1، فما قيمة f(g(2))؟',
    ...notation('9', ['5', '4', '6']) },
  { promptEn: "What is the general shape of an exponential growth function's graph?", promptNl: 'Wat is de algemene vorm van de grafiek van een exponentiële groeifunctie?', promptDe: 'Welche allgemeine Form hat der Graph einer exponentiellen Wachstumsfunktion?', promptEs: '¿Cuál es la forma general de la gráfica de una función de crecimiento exponencial?', promptFr: "Quelle est la forme générale du graphique d'une fonction de croissance exponentielle ?", promptAr: 'ما هو الشكل العام للرسم البياني لدالة النمو الأسي؟',
    answerEn: 'It increases slowly then rises sharply', answerNl: 'Hij stijgt langzaam en gaat dan sterk omhoog', answerDe: 'Er steigt zunächst langsam und dann steil an', answerEs: 'Aumenta lentamente y luego sube bruscamente', answerFr: 'Elle augmente lentement puis monte fortement', answerAr: 'يزداد ببطء ثم يرتفع بشكل حاد',
    wrongEn: ['It is a straight line', 'It is a perfect circle', 'It decreases forever'], wrongNl: ['Het is een rechte lijn', 'Het is een perfecte cirkel', 'Hij daalt voor altijd'], wrongDe: ['Es ist eine gerade Linie', 'Es ist ein perfekter Kreis', 'Er fällt für immer'],
    wrongEs: ['Es una línea recta', 'Es un círculo perfecto', 'Disminuye para siempre'], wrongFr: ['C\'est une droite', 'C\'est un cercle parfait', 'Elle diminue indéfiniment'], wrongAr: ['إنه خط مستقيم', 'إنها دائرة تامة', 'ينخفض إلى الأبد'] },
  { promptEn: 'If f(x) = 3x - 1, what is the inverse function f⁻¹(x)?', promptNl: 'Als f(x) = 3x - 1, wat is de inverse functie f⁻¹(x)?', promptDe: 'Wenn f(x) = 3x - 1 ist, was ist die Umkehrfunktion f⁻¹(x)?', promptEs: 'Si f(x) = 3x - 1, ¿cuál es la función inversa f⁻¹(x)?', promptFr: 'Si f(x) = 3x - 1, quelle est la fonction réciproque f⁻¹(x) ?', promptAr: 'إذا كانت f(x) = 3x - 1، فما هي الدالة العكسية f⁻¹(x)؟',
    ...notation('(x + 1)/3', ['(x - 1)/3', '3x + 1', 'x/3 - 1']) },
  { promptEn: 'What does it mean if a function is "one-to-one"?', promptNl: 'Wat betekent het als een functie "één-op-één" is?', promptDe: 'Was bedeutet es, wenn eine Funktion „eineindeutig" ist?', promptEs: '¿Qué significa que una función sea "uno a uno"?', promptFr: 'Que signifie une fonction « bijective » (un à un) ?', promptAr: 'ماذا يعني أن تكون الدالة "واحد لواحد"؟',
    answerEn: 'Each output corresponds to exactly one input', answerNl: 'Elke uitvoer komt overeen met precies één invoer', answerDe: 'Jede Ausgabe entspricht genau einer Eingabe', answerEs: 'Cada salida corresponde a exactamente una entrada', answerFr: 'Chaque sortie correspond à exactement une entrée', answerAr: 'كل مُخرج يقابل مُدخلاً واحدًا فقط',
    wrongEn: ['Each input has multiple outputs', 'The function has no domain', 'The function is always increasing by 1'], wrongNl: ['Elke invoer heeft meerdere uitvoerwaarden', 'De functie heeft geen domein', 'De functie neemt altijd met 1 toe'], wrongDe: ['Jede Eingabe hat mehrere Ausgaben', 'Die Funktion hat keinen Definitionsbereich', 'Die Funktion steigt immer um 1'],
    wrongEs: ['Cada entrada tiene múltiples salidas', 'La función no tiene dominio', 'La función siempre aumenta en 1'], wrongFr: ['Chaque entrée a plusieurs sorties', "La fonction n'a pas de domaine", 'La fonction augmente toujours de 1'], wrongAr: ['كل مُدخل له عدة مخرجات', 'الدالة ليس لها مجال', 'الدالة تزداد دائمًا بمقدار 1'] },
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

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

// Match and Sequence use "evaluate f(x)" problems instead of the Quiz
// banks — those banks mix vocabulary ("A parabola", "Inverse functions")
// with numbers, which isn't sortable as one set. Evaluating a function is
// exactly what several Quiz items already test, just generated freely here.
// Labels are pure math notation, so they're never translated.
const FN_TEMPLATES: ((x: number) => { label: string; value: number })[] = [
  (x) => ({ label: `f(x) = x + 3, f(${x})`, value: x + 3 }),
  (x) => ({ label: `f(x) = 2x, f(${x})`, value: 2 * x }),
  (x) => ({ label: `f(x) = 3x - 1, f(${x})`, value: 3 * x - 1 }),
  (x) => ({ label: `f(x) = x², f(${x})`, value: x * x }),
];

function distinctFnProblems(count: number): { label: string; value: number }[] {
  const used = new Set<number>();
  const out: { label: string; value: number }[] = [];
  let attempts = 0;
  while (out.length < count && attempts < count * 50) {
    attempts++;
    const template = FN_TEMPLATES[randInt(0, FN_TEMPLATES.length - 1)];
    const p = template(randInt(1, 10));
    if (used.has(p.value)) continue;
    used.add(p.value);
    out.push(p);
  }
  return out;
}

export function generateMatchItems(pairs: number): MatchItem[] {
  return distinctFnProblems(pairs).map((p, i) => ({ id: i, sideA: p.label, sideB: String(p.value) }));
}

// Sorting problems by their answer is the whole challenge — you have to
// actually evaluate each function to know where it belongs in the order.
export function generateSequenceRound(count: number): SequenceItem[] {
  const problems = distinctFnProblems(count).sort((a, b) => a.value - b.value);
  return problems.map((p, i) => ({ id: i, label: p.label }));
}
