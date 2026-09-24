import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { toTrueFalseQuestion, fillBlankWordQuestion } from '@shared/quiz-variants';
import { getLang } from './systems/Locale';
import { t } from './i18n';

export const TOTAL_QUESTIONS = 10;

interface Fact {
  promptEn: string; promptNl: string; promptDe: string; promptEs: string; promptFr: string; promptAr: string;
  answerEn: string; answerNl: string; answerDe: string; answerEs: string; answerFr: string; answerAr: string;
  wrongEn: [string, string, string]; wrongNl: [string, string, string]; wrongDe: [string, string, string];
  wrongEs: [string, string, string]; wrongFr: [string, string, string]; wrongAr: [string, string, string];
  subEn?: string; subNl?: string; subDe?: string; subEs?: string; subFr?: string; subAr?: string;
}

const FACTS: Fact[] = [
  { promptEn: 'Which animal says "Moo"?', promptNl: 'Welk dier zegt "Boe"?', promptDe: 'Welches Tier macht "Muh"?', promptEs: '¿Qué animal dice "Muu"?', promptFr: 'Quel animal fait "Meuh" ?', promptAr: 'أي حيوان يقول "خوار"؟',
    answerEn: 'Cow', answerNl: 'Koe', answerDe: 'Kuh', answerEs: 'Vaca', answerFr: 'Vache', answerAr: 'بقرة',
    wrongEn: ['Dog', 'Cat', 'Duck'], wrongNl: ['Hond', 'Kat', 'Eend'], wrongDe: ['Hund', 'Katze', 'Ente'],
    wrongEs: ['Perro', 'Gato', 'Pato'], wrongFr: ['Chien', 'Chat', 'Canard'], wrongAr: ['كلب', 'قطة', 'بطة'] },
  { promptEn: 'What do bees collect from flowers?', promptNl: 'Wat verzamelen bijen van bloemen?', promptDe: 'Was sammeln Bienen von Blumen?', promptEs: '¿Qué recolectan las abejas de las flores?', promptFr: 'Que récoltent les abeilles sur les fleurs ?', promptAr: 'ماذا يجمع النحل من الزهور؟',
    answerEn: 'Nectar', answerNl: 'Nectar', answerDe: 'Nektar', answerEs: 'Néctar', answerFr: 'Le nectar', answerAr: 'الرحيق',
    wrongEn: ['Water', 'Leaves', 'Rocks'], wrongNl: ['Water', 'Bladeren', 'Stenen'], wrongDe: ['Wasser', 'Blätter', 'Steine'],
    wrongEs: ['Agua', 'Hojas', 'Piedras'], wrongFr: ["De l'eau", 'Des feuilles', 'Des pierres'], wrongAr: ['الماء', 'الأوراق', 'الصخور'] },
  { promptEn: 'What do plants need to grow?', promptNl: 'Wat hebben planten nodig om te groeien?', promptDe: 'Was brauchen Pflanzen zum Wachsen?', promptEs: '¿Qué necesitan las plantas para crecer?', promptFr: 'De quoi les plantes ont-elles besoin pour pousser ?', promptAr: 'ماذا تحتاج النباتات لتنمو؟',
    answerEn: 'Sun & water', answerNl: 'Zon & water', answerDe: 'Sonne & Wasser', answerEs: 'Sol y agua', answerFr: 'Soleil et eau', answerAr: 'الشمس والماء',
    wrongEn: ['Candy', 'Rocks', 'Ice'], wrongNl: ['Snoep', 'Stenen', 'IJs'], wrongDe: ['Süßigkeiten', 'Steine', 'Eis'],
    wrongEs: ['Dulces', 'Piedras', 'Hielo'], wrongFr: ['Des bonbons', 'Des pierres', 'De la glace'], wrongAr: ['الحلوى', 'الصخور', 'الثلج'] },
  { promptEn: 'What gives us light and heat in the day?', promptNl: 'Wat geeft ons overdag licht en warmte?', promptDe: 'Was gibt uns tagsüber Licht und Wärme?', promptEs: '¿Qué nos da luz y calor durante el día?', promptFr: "Qu'est-ce qui nous donne de la lumière et de la chaleur le jour ?", promptAr: 'ما الذي يمنحنا الضوء والحرارة في النهار؟',
    answerEn: 'The Sun', answerNl: 'De zon', answerDe: 'Die Sonne', answerEs: 'El Sol', answerFr: 'Le Soleil', answerAr: 'الشمس',
    wrongEn: ['The Moon', 'Stars', 'Clouds'], wrongNl: ['De maan', 'Sterren', 'Wolken'], wrongDe: ['Der Mond', 'Sterne', 'Wolken'],
    wrongEs: ['La Luna', 'Las estrellas', 'Las nubes'], wrongFr: ['La Lune', 'Les étoiles', 'Les nuages'], wrongAr: ['القمر', 'النجوم', 'الغيوم'] },
  { promptEn: 'What do we call frozen rain?', promptNl: 'Hoe noemen we bevroren regen?', promptDe: 'Wie nennen wir gefrorenen Regen?', promptEs: '¿Cómo llamamos a la lluvia congelada?', promptFr: 'Comment appelle-t-on la pluie gelée ?', promptAr: 'ماذا نسمي المطر المتجمد؟',
    answerEn: 'Snow', answerNl: 'Sneeuw', answerDe: 'Schnee', answerEs: 'Nieve', answerFr: 'La neige', answerAr: 'الثلج',
    wrongEn: ['Fog', 'Wind', 'Steam'], wrongNl: ['Mist', 'Wind', 'Stoom'], wrongDe: ['Nebel', 'Wind', 'Dampf'],
    wrongEs: ['Niebla', 'Viento', 'Vapor'], wrongFr: ['Le brouillard', 'Le vent', 'La vapeur'], wrongAr: ['الضباب', 'الرياح', 'البخار'] },
  { promptEn: 'Which part of your body do you see with?', promptNl: 'Met welk lichaamsdeel zie je?', promptDe: 'Mit welchem Körperteil siehst du?', promptEs: '¿Con qué parte del cuerpo ves?', promptFr: 'Avec quelle partie du corps vois-tu ?', promptAr: 'بأي جزء من جسمك ترى؟',
    answerEn: 'Eyes', answerNl: 'Ogen', answerDe: 'Augen', answerEs: 'Los ojos', answerFr: 'Les yeux', answerAr: 'العينان',
    wrongEn: ['Ears', 'Nose', 'Feet'], wrongNl: ['Oren', 'Neus', 'Voeten'], wrongDe: ['Ohren', 'Nase', 'Füße'],
    wrongEs: ['Los oídos', 'La nariz', 'Los pies'], wrongFr: ['Les oreilles', 'Le nez', 'Les pieds'], wrongAr: ['الأذنان', 'الأنف', 'القدمان'] },
  { promptEn: 'What do fish use to breathe underwater?', promptNl: 'Waarmee ademen vissen onder water?', promptDe: 'Womit atmen Fische unter Wasser?', promptEs: '¿Con qué respiran los peces bajo el agua?', promptFr: "Avec quoi les poissons respirent-ils sous l'eau ?", promptAr: 'بماذا تتنفس الأسماك تحت الماء؟',
    answerEn: 'Gills', answerNl: 'Kieuwen', answerDe: 'Kiemen', answerEs: 'Branquias', answerFr: 'Les branchies', answerAr: 'الخياشيم',
    wrongEn: ['Lungs', 'Nose', 'Mouth'], wrongNl: ['Longen', 'Neus', 'Mond'], wrongDe: ['Lungen', 'Nase', 'Mund'],
    wrongEs: ['Pulmones', 'Nariz', 'Boca'], wrongFr: ['Les poumons', 'Le nez', 'La bouche'], wrongAr: ['الرئتان', 'الأنف', 'الفم'] },
  { promptEn: 'How many legs does a spider have?', promptNl: 'Hoeveel poten heeft een spin?', promptDe: 'Wie viele Beine hat eine Spinne?', promptEs: '¿Cuántas patas tiene una araña?', promptFr: 'Combien de pattes a une araignée ?', promptAr: 'كم عدد أرجل العنكبوت؟',
    answerEn: '8', answerNl: '8', answerDe: '8', answerEs: '8', answerFr: '8', answerAr: '8',
    wrongEn: ['6', '4', '2'], wrongNl: ['6', '4', '2'], wrongDe: ['6', '4', '2'], wrongEs: ['6', '4', '2'], wrongFr: ['6', '4', '2'], wrongAr: ['6', '4', '2'] },
  { promptEn: 'What do caterpillars turn into?', promptNl: 'Waarin veranderen rupsen?', promptDe: 'Wozu werden Raupen?', promptEs: '¿En qué se convierten las orugas?', promptFr: 'En quoi les chenilles se transforment-elles ?', promptAr: 'إلى ماذا تتحول اليرقات؟',
    answerEn: 'Butterflies', answerNl: 'Vlinders', answerDe: 'Schmetterlinge', answerEs: 'Mariposas', answerFr: 'Papillons', answerAr: 'فراشات',
    wrongEn: ['Birds', 'Bees', 'Frogs'], wrongNl: ['Vogels', 'Bijen', 'Kikkers'], wrongDe: ['Vögel', 'Bienen', 'Frösche'],
    wrongEs: ['Pájaros', 'Abejas', 'Ranas'], wrongFr: ['Oiseaux', 'Abeilles', 'Grenouilles'], wrongAr: ['طيور', 'نحل', 'ضفادع'] },
  { promptEn: 'What is a baby dog called?', promptNl: 'Hoe noem je een baby hond?', promptDe: 'Wie nennt man ein Hundebaby?', promptEs: '¿Cómo se llama un bebé perro?', promptFr: 'Comment appelle-t-on un bébé chien ?', promptAr: 'ماذا يُسمى صغير الكلب؟',
    answerEn: 'Puppy', answerNl: 'Puppy', answerDe: 'Welpe', answerEs: 'Cachorro', answerFr: 'Chiot', answerAr: 'جرو',
    wrongEn: ['Kitten', 'Cub', 'Chick'], wrongNl: ['Kitten', 'Welp', 'Kuiken'], wrongDe: ['Kätzchen', 'Jungtier', 'Küken'],
    wrongEs: ['Gatito', 'Cría', 'Polluelo'], wrongFr: ['Chaton', 'Petit', 'Poussin'], wrongAr: ['هريرة', 'شبل', 'كتكوت'] },
  { promptEn: 'What season is the coldest?', promptNl: 'Welk seizoen is het koudst?', promptDe: 'Welche Jahreszeit ist am kältesten?', promptEs: '¿Qué estación es la más fría?', promptFr: 'Quelle est la saison la plus froide ?', promptAr: 'ما هو أبرد فصل؟',
    answerEn: 'Winter', answerNl: 'Winter', answerDe: 'Winter', answerEs: 'Invierno', answerFr: 'Hiver', answerAr: 'الشتاء',
    wrongEn: ['Summer', 'Spring', 'Fall'], wrongNl: ['Zomer', 'Lente', 'Herfst'], wrongDe: ['Sommer', 'Frühling', 'Herbst'],
    wrongEs: ['Verano', 'Primavera', 'Otoño'], wrongFr: ['Été', 'Printemps', 'Automne'], wrongAr: ['الصيف', 'الربيع', 'الخريف'],
    subEn: 'Trees lose their leaves before winter comes.', subNl: 'Bomen verliezen hun bladeren voordat de winter komt.', subDe: 'Bäume verlieren ihre Blätter, bevor der Winter kommt.',
    subEs: 'Los árboles pierden sus hojas antes de que llegue el invierno.', subFr: "Les arbres perdent leurs feuilles avant l'arrivée de l'hiver.", subAr: 'تفقد الأشجار أوراقها قبل حلول الشتاء.' },
  { promptEn: 'Which sense do you use to hear?', promptNl: 'Welke zintuig gebruik je om te horen?', promptDe: 'Welchen Sinn benutzt du zum Hören?', promptEs: '¿Qué sentido usas para oír?', promptFr: 'Quel sens utilises-tu pour entendre ?', promptAr: 'أي حاسة تستخدمها للسمع؟',
    answerEn: 'Ears', answerNl: 'Oren', answerDe: 'Ohren', answerEs: 'Los oídos', answerFr: 'Les oreilles', answerAr: 'الأذنان',
    wrongEn: ['Eyes', 'Nose', 'Skin'], wrongNl: ['Ogen', 'Neus', 'Huid'], wrongDe: ['Augen', 'Nase', 'Haut'],
    wrongEs: ['Los ojos', 'La nariz', 'La piel'], wrongFr: ['Les yeux', 'Le nez', 'La peau'], wrongAr: ['العينان', 'الأنف', 'الجلد'] },
  { promptEn: 'What color is the sky on a clear day?', promptNl: 'Welke kleur heeft de lucht op een heldere dag?', promptDe: 'Welche Farbe hat der Himmel an einem klaren Tag?', promptEs: '¿De qué color es el cielo en un día despejado?', promptFr: 'De quelle couleur est le ciel par temps clair ?', promptAr: 'ما لون السماء في يوم صافٍ؟',
    answerEn: 'Blue', answerNl: 'Blauw', answerDe: 'Blau', answerEs: 'Azul', answerFr: 'Bleu', answerAr: 'أزرق',
    wrongEn: ['Green', 'Red', 'Purple'], wrongNl: ['Groen', 'Rood', 'Paars'], wrongDe: ['Grün', 'Rot', 'Lila'],
    wrongEs: ['Verde', 'Rojo', 'Morado'], wrongFr: ['Vert', 'Rouge', 'Violet'], wrongAr: ['أخضر', 'أحمر', 'بنفسجي'] },
  { promptEn: 'What is a baby cat called?', promptNl: 'Hoe noem je een baby kat?', promptDe: 'Wie nennt man ein Katzenbaby?', promptEs: '¿Cómo se llama un bebé gato?', promptFr: 'Comment appelle-t-on un bébé chat ?', promptAr: 'ماذا يُسمى صغير القطة؟',
    answerEn: 'Kitten', answerNl: 'Kitten', answerDe: 'Kätzchen', answerEs: 'Gatito', answerFr: 'Chaton', answerAr: 'هريرة',
    wrongEn: ['Puppy', 'Cub', 'Chick'], wrongNl: ['Puppy', 'Welp', 'Kuiken'], wrongDe: ['Welpe', 'Jungtier', 'Küken'],
    wrongEs: ['Cachorro', 'Cría', 'Polluelo'], wrongFr: ['Chiot', 'Petit', 'Poussin'], wrongAr: ['جرو', 'شبل', 'كتكوت'] },
  { promptEn: 'Which part of a plant is usually underground?', promptNl: 'Welk deel van een plant zit meestal onder de grond?', promptDe: 'Welcher Teil einer Pflanze ist normalerweise unter der Erde?', promptEs: '¿Qué parte de una planta suele estar bajo tierra?', promptFr: "Quelle partie d'une plante est généralement sous terre ?", promptAr: 'أي جزء من النبات يكون عادةً تحت الأرض؟',
    answerEn: 'Roots', answerNl: 'Wortels', answerDe: 'Wurzeln', answerEs: 'Las raíces', answerFr: 'Les racines', answerAr: 'الجذور',
    wrongEn: ['Leaves', 'Flowers', 'Petals'], wrongNl: ['Bladeren', 'Bloemen', 'Bloemblaadjes'], wrongDe: ['Blätter', 'Blüten', 'Blütenblätter'],
    wrongEs: ['Las hojas', 'Las flores', 'Los pétalos'], wrongFr: ['Les feuilles', 'Les fleurs', 'Les pétales'], wrongAr: ['الأوراق', 'الأزهار', 'البتلات'] },
  { promptEn: 'What happens to water when it gets very cold?', promptNl: 'Wat gebeurt er met water als het heel koud wordt?', promptDe: 'Was passiert mit Wasser, wenn es sehr kalt wird?', promptEs: '¿Qué le pasa al agua cuando hace mucho frío?', promptFr: "Que se passe-t-il avec l'eau quand il fait très froid ?", promptAr: 'ماذا يحدث للماء عندما يصبح شديد البرودة؟',
    answerEn: 'Freezes', answerNl: 'Het bevriest', answerDe: 'Es gefriert', answerEs: 'Se congela', answerFr: 'Elle gèle', answerAr: 'يتجمد',
    wrongEn: ['Boils', 'Vanishes', 'Turns pink'], wrongNl: ['Het kookt', 'Het verdwijnt', 'Het wordt roze'], wrongDe: ['Es kocht', 'Es verschwindet', 'Es wird rosa'],
    wrongEs: ['Hierve', 'Desaparece', 'Se vuelve rosa'], wrongFr: ['Elle bout', 'Elle disparaît', 'Elle devient rose'], wrongAr: ['يغلي', 'يختفي', 'يصبح ورديًا'] },
  { promptEn: 'What happens to water when it gets very hot?', promptNl: 'Wat gebeurt er met water als het heel heet wordt?', promptDe: 'Was passiert mit Wasser, wenn es sehr heiß wird?', promptEs: '¿Qué le pasa al agua cuando hace mucho calor?', promptFr: "Que se passe-t-il avec l'eau quand il fait très chaud ?", promptAr: 'ماذا يحدث للماء عندما يصبح شديد الحرارة؟',
    answerEn: 'Boils', answerNl: 'Het kookt', answerDe: 'Es kocht', answerEs: 'Hierve', answerFr: 'Elle bout', answerAr: 'يغلي',
    wrongEn: ['Freezes', 'Turns solid', 'Turns blue'], wrongNl: ['Het bevriest', 'Het wordt vast', 'Het wordt blauw'], wrongDe: ['Es gefriert', 'Es wird fest', 'Es wird blau'],
    wrongEs: ['Se congela', 'Se vuelve sólida', 'Se vuelve azul'], wrongFr: ['Elle gèle', 'Elle devient solide', 'Elle devient bleue'], wrongAr: ['يتجمد', 'يصبح صلبًا', 'يصبح أزرقًا'] },
  { promptEn: 'Which of these animals can fly?', promptNl: 'Welk van deze dieren kan vliegen?', promptDe: 'Welches dieser Tiere kann fliegen?', promptEs: '¿Cuál de estos animales puede volar?', promptFr: 'Lequel de ces animaux peut voler ?', promptAr: 'أي من هذه الحيوانات يستطيع الطيران؟',
    answerEn: 'Bird', answerNl: 'Vogel', answerDe: 'Vogel', answerEs: 'Pájaro', answerFr: 'Oiseau', answerAr: 'طائر',
    wrongEn: ['Elephant', 'Fish', 'Turtle'], wrongNl: ['Olifant', 'Vis', 'Schildpad'], wrongDe: ['Elefant', 'Fisch', 'Schildkröte'],
    wrongEs: ['Elefante', 'Pez', 'Tortuga'], wrongFr: ['Éléphant', 'Poisson', 'Tortue'], wrongAr: ['فيل', 'سمكة', 'سلحفاة'] },
  { promptEn: 'How many colors are in a rainbow?', promptNl: 'Hoeveel kleuren heeft een regenboog?', promptDe: 'Wie viele Farben hat ein Regenbogen?', promptEs: '¿Cuántos colores tiene un arcoíris?', promptFr: 'Combien de couleurs y a-t-il dans un arc-en-ciel ?', promptAr: 'كم عدد ألوان قوس القزح؟',
    answerEn: '7', answerNl: '7', answerDe: '7', answerEs: '7', answerFr: '7', answerAr: '7',
    wrongEn: ['3', '5', '10'], wrongNl: ['3', '5', '10'], wrongDe: ['3', '5', '10'], wrongEs: ['3', '5', '10'], wrongFr: ['3', '5', '10'], wrongAr: ['3', '5', '10'] },
  { promptEn: 'What do we call baby cows?', promptNl: 'Hoe noemen we baby koeien?', promptDe: 'Wie nennen wir Baby-Kühe?', promptEs: '¿Cómo llamamos a los bebés vaca?', promptFr: 'Comment appelle-t-on les bébés vaches ?', promptAr: 'ماذا نسمي صغار الأبقار؟',
    answerEn: 'Calves', answerNl: 'Kalveren', answerDe: 'Kälber', answerEs: 'Terneros', answerFr: 'Veaux', answerAr: 'عجول',
    wrongEn: ['Cubs', 'Foals', 'Kids'], wrongNl: ['Welpen', 'Veulens', 'Geitjes'], wrongDe: ['Jungtiere', 'Fohlen', 'Zicklein'],
    wrongEs: ['Cachorros', 'Potros', 'Cabritos'], wrongFr: ['Petits', 'Poulains', 'Chevreaux'], wrongAr: ['أشبال', 'مهور', 'جِداء'] },
  { promptEn: 'What season comes right after winter?', promptNl: 'Welk seizoen komt direct na de winter?', promptDe: 'Welche Jahreszeit kommt direkt nach dem Winter?', promptEs: '¿Qué estación viene justo después del invierno?', promptFr: "Quelle saison vient juste après l'hiver ?", promptAr: 'أي فصل يأتي مباشرة بعد الشتاء؟',
    answerEn: 'Spring', answerNl: 'Lente', answerDe: 'Frühling', answerEs: 'Primavera', answerFr: 'Printemps', answerAr: 'الربيع',
    wrongEn: ['Summer', 'Fall', 'Winter again'], wrongNl: ['Zomer', 'Herfst', 'Weer winter'], wrongDe: ['Sommer', 'Herbst', 'Wieder Winter'],
    wrongEs: ['Verano', 'Otoño', 'Invierno de nuevo'], wrongFr: ['Été', 'Automne', "L'hiver à nouveau"], wrongAr: ['الصيف', 'الخريف', 'الشتاء مرة أخرى'] },
  { promptEn: 'Which animal has a very long neck?', promptNl: 'Welk dier heeft een heel lange nek?', promptDe: 'Welches Tier hat einen sehr langen Hals?', promptEs: '¿Qué animal tiene un cuello muy largo?', promptFr: 'Quel animal a un très long cou ?', promptAr: 'أي حيوان له رقبة طويلة جدًا؟',
    answerEn: 'Giraffe', answerNl: 'Giraffe', answerDe: 'Giraffe', answerEs: 'Jirafa', answerFr: 'Girafe', answerAr: 'زرافة',
    wrongEn: ['Elephant', 'Lion', 'Zebra'], wrongNl: ['Olifant', 'Leeuw', 'Zebra'], wrongDe: ['Elefant', 'Löwe', 'Zebra'],
    wrongEs: ['Elefante', 'León', 'Cebra'], wrongFr: ['Éléphant', 'Lion', 'Zèbre'], wrongAr: ['فيل', 'أسد', 'حمار وحشي'] },
  { promptEn: 'What do we call it when the sun goes down and it gets dark?', promptNl: 'Hoe noemen we het als de zon ondergaat en het donker wordt?', promptDe: 'Wie nennen wir es, wenn die Sonne untergeht und es dunkel wird?', promptEs: '¿Cómo llamamos a cuando el sol se pone y oscurece?', promptFr: "Comment appelle-t-on le moment où le soleil se couche et qu'il fait sombre ?", promptAr: 'ماذا نسمي غروب الشمس وحلول الظلام؟',
    answerEn: 'Night', answerNl: 'Nacht', answerDe: 'Nacht', answerEs: 'Noche', answerFr: 'La nuit', answerAr: 'الليل',
    wrongEn: ['Morning', 'Noon', 'Sunrise'], wrongNl: ['Ochtend', 'Middag', 'Zonsopgang'], wrongDe: ['Morgen', 'Mittag', 'Sonnenaufgang'],
    wrongEs: ['Mañana', 'Mediodía', 'Amanecer'], wrongFr: ['Le matin', 'Midi', 'Le lever du soleil'], wrongAr: ['الصباح', 'الظهر', 'شروق الشمس'] },
  { promptEn: 'What do you call frozen water you can skate on?', promptNl: 'Hoe noem je bevroren water waarop je kunt schaatsen?', promptDe: 'Wie nennt man gefrorenes Wasser, auf dem man Schlittschuh laufen kann?', promptEs: '¿Cómo llamas al agua congelada sobre la que puedes patinar?', promptFr: "Comment appelle-t-on l'eau gelée sur laquelle on peut patiner ?", promptAr: 'ماذا تسمي الماء المتجمد الذي يمكنك التزلج عليه؟',
    answerEn: 'Ice', answerNl: 'IJs', answerDe: 'Eis', answerEs: 'Hielo', answerFr: 'La glace', answerAr: 'الجليد',
    wrongEn: ['Snow', 'Steam', 'Fog'], wrongNl: ['Sneeuw', 'Stoom', 'Mist'], wrongDe: ['Schnee', 'Dampf', 'Nebel'],
    wrongEs: ['Nieve', 'Vapor', 'Niebla'], wrongFr: ['La neige', 'La vapeur', 'Le brouillard'], wrongAr: ['الثلج', 'البخار', 'الضباب'] },
  { promptEn: 'Which of these is a fruit?', promptNl: 'Welke van deze is een fruit?', promptDe: 'Welches davon ist eine Frucht?', promptEs: '¿Cuál de estos es una fruta?', promptFr: 'Lequel de ceux-ci est un fruit ?', promptAr: 'أي من هذه فاكهة؟',
    answerEn: 'Apple', answerNl: 'Appel', answerDe: 'Apfel', answerEs: 'Manzana', answerFr: 'Pomme', answerAr: 'تفاحة',
    wrongEn: ['Carrot', 'Potato', 'Broccoli'], wrongNl: ['Wortel', 'Aardappel', 'Broccoli'], wrongDe: ['Karotte', 'Kartoffel', 'Brokkoli'],
    wrongEs: ['Zanahoria', 'Papa', 'Brócoli'], wrongFr: ['Carotte', 'Pomme de terre', 'Brocoli'], wrongAr: ['جزرة', 'بطاطا', 'بروكلي'] },
  { promptEn: 'What do bees make in their hive?', promptNl: 'Wat maken bijen in hun bijenkorf?', promptDe: 'Was stellen Bienen in ihrem Bienenstock her?', promptEs: '¿Qué hacen las abejas en su colmena?', promptFr: 'Que fabriquent les abeilles dans leur ruche ?', promptAr: 'ماذا ينتج النحل في خليته؟',
    answerEn: 'Honey', answerNl: 'Honing', answerDe: 'Honig', answerEs: 'Miel', answerFr: 'Du miel', answerAr: 'العسل',
    wrongEn: ['Milk', 'Bread', 'Juice'], wrongNl: ['Melk', 'Brood', 'Sap'], wrongDe: ['Milch', 'Brot', 'Saft'],
    wrongEs: ['Leche', 'Pan', 'Jugo'], wrongFr: ['Du lait', 'Du pain', 'Du jus'], wrongAr: ['الحليب', 'الخبز', 'العصير'] },
  { promptEn: 'How many days are in one week?', promptNl: 'Hoeveel dagen zitten er in een week?', promptDe: 'Wie viele Tage hat eine Woche?', promptEs: '¿Cuántos días tiene una semana?', promptFr: 'Combien de jours y a-t-il dans une semaine ?', promptAr: 'كم عدد أيام الأسبوع؟',
    answerEn: '7', answerNl: '7', answerDe: '7', answerEs: '7', answerFr: '7', answerAr: '7',
    wrongEn: ['5', '10', '30'], wrongNl: ['5', '10', '30'], wrongDe: ['5', '10', '30'], wrongEs: ['5', '10', '30'], wrongFr: ['5', '10', '30'], wrongAr: ['5', '10', '30'] },
  { promptEn: 'What do plants make using sunlight?', promptNl: 'Wat maken planten met behulp van zonlicht?', promptDe: 'Was stellen Pflanzen mithilfe von Sonnenlicht her?', promptEs: '¿Qué producen las plantas usando la luz solar?', promptFr: 'Que fabriquent les plantes grâce à la lumière du soleil ?', promptAr: 'ماذا تصنع النباتات باستخدام ضوء الشمس؟',
    answerEn: 'Food', answerNl: 'Voedsel', answerDe: 'Nahrung', answerEs: 'Alimento', answerFr: 'De la nourriture', answerAr: 'الغذاء',
    wrongEn: ['Rain', 'Wind', 'Sand'], wrongNl: ['Regen', 'Wind', 'Zand'], wrongDe: ['Regen', 'Wind', 'Sand'],
    wrongEs: ['Lluvia', 'Viento', 'Arena'], wrongFr: ['De la pluie', 'Du vent', 'Du sable'], wrongAr: ['المطر', 'الرياح', 'الرمل'] },
];

function promptFor(fact: Fact): string {
  switch (getLang()) {
    case 'nl': return fact.promptNl;
    case 'de': return fact.promptDe;
    case 'es': return fact.promptEs;
    case 'fr': return fact.promptFr;
    case 'ar': return fact.promptAr;
    default: return fact.promptEn;
  }
}

function answerFor(fact: Fact): string {
  switch (getLang()) {
    case 'nl': return fact.answerNl;
    case 'de': return fact.answerDe;
    case 'es': return fact.answerEs;
    case 'fr': return fact.answerFr;
    case 'ar': return fact.answerAr;
    default: return fact.answerEn;
  }
}

function wrongFor(fact: Fact): [string, string, string] {
  switch (getLang()) {
    case 'nl': return fact.wrongNl;
    case 'de': return fact.wrongDe;
    case 'es': return fact.wrongEs;
    case 'fr': return fact.wrongFr;
    case 'ar': return fact.wrongAr;
    default: return fact.wrongEn;
  }
}

function subFor(fact: Fact): string | undefined {
  switch (getLang()) {
    case 'nl': return fact.subNl;
    case 'de': return fact.subDe;
    case 'es': return fact.subEs;
    case 'fr': return fact.subFr;
    case 'ar': return fact.subAr;
    default: return fact.subEn;
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

function buildQuestion(fact: Fact): QuizQuestion {
  const answer = answerFor(fact);
  const options = shuffle([answer, ...wrongFor(fact)]);
  return {
    prompt: promptFor(fact),
    sub: subFor(fact),
    choices: options,
    correctIndex: options.indexOf(answer),
  };
}

/**
 * Returns a generator that reshuffles its fact pool every time a run
 * restarts at question 0 — including "Play Again", which reuses this same
 * closure instance, so replaying doesn't just repeat the same 10 facts.
 */
export function makeRunGenerator(): (index: number) => QuizQuestion {
  let pool: Fact[] = [];
  return (index: number) => {
    if (index === 0) pool = shuffle(FACTS).slice(0, TOTAL_QUESTIONS);
    return buildQuestion(pool[index]);
  };
}

// Match: a couple of facts share an answer (both "7 days in a week" and
// "7 colors in a rainbow") — deduped by answer so no two cards tie.
export function generateMatchItems(pairs: number): MatchItem[] {
  const seen = new Set<string>();
  const unique = shuffle(FACTS).filter((fact) => {
    const answer = answerFor(fact);
    if (seen.has(answer)) return false;
    seen.add(answer);
    return true;
  });
  return unique.slice(0, Math.min(pairs, unique.length)).map((fact, i) => ({
    id: i,
    sideA: promptFor(fact),
    sideB: answerFor(fact),
  }));
}

// Sequence: these facts span totally different topics with no shared
// magnitude — ordering by answer length is the one honest orderable
// property, deduped so no two cards tie on length.
export function generateSequenceRound(count: number): SequenceItem[] {
  const seen = new Set<number>();
  const unique = shuffle(FACTS).filter((fact) => {
    const len = answerFor(fact).length;
    if (seen.has(len)) return false;
    seen.add(len);
    return true;
  });
  const n = Math.min(count, unique.length);
  return unique
    .slice(0, n)
    .sort((a, b) => answerFor(a).length - answerFor(b).length)
    .map((fact, i) => ({ id: i, label: answerFor(fact) }));
}

// True/False: uses wrongFor()'s hand-picked distractors as the "false"
// answer instead of a generic random mismatch — a random unrelated fact's
// answer would rarely feel like a believable answer to this question, but
// these curated wrong answers were written to be.
export function generateTrueFalseQuestion(): QuizQuestion {
  const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
  const isTrue = Math.random() < 0.5;
  const shown = isTrue ? answerFor(fact) : wrongFor(fact)[Math.floor(Math.random() * 3)];
  return toTrueFalseQuestion(
    { statement: t().trueFalseStatement(promptFor(fact).replace(/\n/g, ' '), shown), isTrue });
}

export function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(FACTS, answerFor, promptFor);
}

// Synthetic ids from array index — FACTS never reorders at runtime, so
// index is stable across a session even though the source data has no id.
export function generateFlashcardDeck(): FlashcardItem[] {
  return FACTS.map((fact, i) => ({ id: i, primary: promptFor(fact), meaning: answerFor(fact) }));
}
