import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { toTrueFalseQuestion, fillBlankWordQuestion } from '@shared/quiz-variants';
import { getLang } from './systems/Locale';
import { t } from './i18n';

export const TOTAL_QUESTIONS = 10;

interface Item {
  promptEn: string; promptNl: string; promptDe: string; promptEs: string; promptFr: string; promptAr: string;
  answerEn: string; answerNl: string; answerDe: string; answerEs: string; answerFr: string; answerAr: string;
  wrongEn: [string, string, string]; wrongNl: [string, string, string]; wrongDe: [string, string, string];
  wrongEs: [string, string, string]; wrongFr: [string, string, string]; wrongAr: [string, string, string];
}

const ITEMS: Item[] = [
  { promptEn: 'How does this face feel? 😢', promptNl: 'Hoe voelt dit gezicht? 😢', promptDe: 'Wie fühlt sich dieses Gesicht? 😢', promptEs: '¿Cómo se siente esta cara? 😢', promptFr: 'Comment se sent ce visage ? 😢', promptAr: 'كيف يشعر هذا الوجه؟ 😢',
    answerEn: 'Sad', answerNl: 'Verdrietig', answerDe: 'Traurig', answerEs: 'Triste', answerFr: 'Triste', answerAr: 'حزين',
    wrongEn: ['Happy', 'Excited', 'Silly'], wrongNl: ['Blij', 'Opgewonden', 'Gek'], wrongDe: ['Fröhlich', 'Aufgeregt', 'Albern'],
    wrongEs: ['Feliz', 'Emocionado', 'Tonto'], wrongFr: ['Content', 'Excité', 'Rigolo'], wrongAr: ['سعيد', 'متحمس', 'مضحك'] },
  { promptEn: 'How does this face feel? 😊', promptNl: 'Hoe voelt dit gezicht? 😊', promptDe: 'Wie fühlt sich dieses Gesicht? 😊', promptEs: '¿Cómo se siente esta cara? 😊', promptFr: 'Comment se sent ce visage ? 😊', promptAr: 'كيف يشعر هذا الوجه؟ 😊',
    answerEn: 'Happy', answerNl: 'Blij', answerDe: 'Fröhlich', answerEs: 'Feliz', answerFr: 'Content', answerAr: 'سعيد',
    wrongEn: ['Sad', 'Scared', 'Angry'], wrongNl: ['Verdrietig', 'Bang', 'Boos'], wrongDe: ['Traurig', 'Ängstlich', 'Wütend'],
    wrongEs: ['Triste', 'Asustado', 'Enojado'], wrongFr: ['Triste', 'Effrayé', 'Fâché'], wrongAr: ['حزين', 'خائف', 'غاضب'] },
  { promptEn: 'How does this face feel? 😠', promptNl: 'Hoe voelt dit gezicht? 😠', promptDe: 'Wie fühlt sich dieses Gesicht? 😠', promptEs: '¿Cómo se siente esta cara? 😠', promptFr: 'Comment se sent ce visage ? 😠', promptAr: 'كيف يشعر هذا الوجه؟ 😠',
    answerEn: 'Angry', answerNl: 'Boos', answerDe: 'Wütend', answerEs: 'Enojado', answerFr: 'Fâché', answerAr: 'غاضب',
    wrongEn: ['Happy', 'Sleepy', 'Calm'], wrongNl: ['Blij', 'Slaperig', 'Rustig'], wrongDe: ['Fröhlich', 'Müde', 'Ruhig'],
    wrongEs: ['Feliz', 'Somnoliento', 'Tranquilo'], wrongFr: ['Content', 'Endormi', 'Calme'], wrongAr: ['سعيد', 'نعسان', 'هادئ'] },
  { promptEn: 'How does this face feel? 😨', promptNl: 'Hoe voelt dit gezicht? 😨', promptDe: 'Wie fühlt sich dieses Gesicht? 😨', promptEs: '¿Cómo se siente esta cara? 😨', promptFr: 'Comment se sent ce visage ? 😨', promptAr: 'كيف يشعر هذا الوجه؟ 😨',
    answerEn: 'Scared', answerNl: 'Bang', answerDe: 'Ängstlich', answerEs: 'Asustado', answerFr: 'Effrayé', answerAr: 'خائف',
    wrongEn: ['Excited', 'Calm', 'Proud'], wrongNl: ['Opgewonden', 'Rustig', 'Trots'], wrongDe: ['Aufgeregt', 'Ruhig', 'Stolz'],
    wrongEs: ['Emocionado', 'Tranquilo', 'Orgulloso'], wrongFr: ['Excité', 'Calme', 'Fier'], wrongAr: ['متحمس', 'هادئ', 'فخور'] },
  { promptEn: 'How does this face feel? 😴', promptNl: 'Hoe voelt dit gezicht? 😴', promptDe: 'Wie fühlt sich dieses Gesicht? 😴', promptEs: '¿Cómo se siente esta cara? 😴', promptFr: 'Comment se sent ce visage ? 😴', promptAr: 'كيف يشعر هذا الوجه؟ 😴',
    answerEn: 'Tired', answerNl: 'Moe', answerDe: 'Müde', answerEs: 'Cansado', answerFr: 'Fatigué', answerAr: 'متعب',
    wrongEn: ['Angry', 'Surprised', 'Happy'], wrongNl: ['Boos', 'Verrast', 'Blij'], wrongDe: ['Wütend', 'Überrascht', 'Fröhlich'],
    wrongEs: ['Enojado', 'Sorprendido', 'Feliz'], wrongFr: ['Fâché', 'Surpris', 'Content'], wrongAr: ['غاضب', 'متفاجئ', 'سعيد'] },
  { promptEn: 'How does this face feel? 😲', promptNl: 'Hoe voelt dit gezicht? 😲', promptDe: 'Wie fühlt sich dieses Gesicht? 😲', promptEs: '¿Cómo se siente esta cara? 😲', promptFr: 'Comment se sent ce visage ? 😲', promptAr: 'كيف يشعر هذا الوجه؟ 😲',
    answerEn: 'Surprised', answerNl: 'Verrast', answerDe: 'Überrascht', answerEs: 'Sorprendido', answerFr: 'Surpris', answerAr: 'متفاجئ',
    wrongEn: ['Bored', 'Calm', 'Tired'], wrongNl: ['Verveeld', 'Rustig', 'Moe'], wrongDe: ['Gelangweilt', 'Ruhig', 'Müde'],
    wrongEs: ['Aburrido', 'Tranquilo', 'Cansado'], wrongFr: ['Ennuyé', 'Calme', 'Fatigué'], wrongAr: ['ملل', 'هادئ', 'متعب'] },
  { promptEn: 'Your friend is crying.\nWhat’s kind?', promptNl: 'Je vriend huilt.\nWat is lief?', promptDe: 'Dein Freund weint.\nWas ist lieb?', promptEs: 'Tu amigo está llorando.\n¿Qué es amable?', promptFr: 'Ton ami pleure.\nQue faire gentiment ?', promptAr: 'صديقك يبكي.\nما هو التصرف اللطيف؟',
    answerEn: 'Comfort them', answerNl: 'Troost hen', answerDe: 'Tröste ihn/sie', answerEs: 'Consolarlo', answerFr: 'Le/La réconforter', answerAr: 'واسِه',
    wrongEn: ['Laugh', 'Walk away', 'Take a toy'], wrongNl: ['Lachen', 'Weglopen', 'Een speeltje afpakken'], wrongDe: ['Lachen', 'Weggehen', 'Ein Spielzeug wegnehmen'],
    wrongEs: ['Reírse', 'Alejarse', 'Quitarle un juguete'], wrongFr: ['Rire', "S'en aller", 'Prendre un jouet'], wrongAr: ['الضحك', 'الابتعاد', 'أخذ لعبة'] },
  { promptEn: 'A friend shares their snack.\nWhat do you say?', promptNl: 'Een vriend deelt zijn snack.\nWat zeg je?', promptDe: 'Ein Freund teilt seinen Snack.\nWas sagst du?', promptEs: 'Un amigo comparte su merienda.\n¿Qué dices?', promptFr: 'Un ami partage son goûter.\nQue dis-tu ?', promptAr: 'صديق يشارك وجبته الخفيفة معك.\nماذا تقول؟',
    answerEn: 'Thank you', answerNl: 'Dank je wel', answerDe: 'Danke', answerEs: 'Gracias', answerFr: 'Merci', answerAr: 'شكرًا لك',
    wrongEn: ['Nothing', 'Give it back', 'Ask for more'], wrongNl: ['Niets', 'Geef het terug', 'Vraag om meer'], wrongDe: ['Nichts', 'Gib es zurück', 'Frag nach mehr'],
    wrongEs: ['Nada', 'Devuélvelo', 'Pide más'], wrongFr: ['Rien', 'Le rendre', 'Demander plus'], wrongAr: ['لا شيء', 'أعده له', 'اطلب المزيد'] },
  { promptEn: 'Someone else has the toy\nyou want. What do you do?', promptNl: 'Iemand anders heeft het speeltje\ndat jij wilt. Wat doe je?', promptDe: 'Jemand anderes hat das Spielzeug,\ndas du willst. Was tust du?', promptEs: 'Otra persona tiene el juguete\nque quieres. ¿Qué haces?', promptFr: "Quelqu'un d'autre a le jouet\nque tu veux. Que fais-tu ?", promptAr: 'شخص آخر يملك اللعبة\nالتي تريدها. ماذا تفعل؟',
    answerEn: 'Ask and wait', answerNl: 'Vragen en wachten', answerDe: 'Fragen und warten', answerEs: 'Pedirlo y esperar', answerFr: 'Demander et attendre', answerAr: 'اسأل وانتظر',
    wrongEn: ['Grab it', 'Cry loudly', 'Push them'], wrongNl: ['Afpakken', 'Hard huilen', 'Ze duwen'], wrongDe: ['Es greifen', 'Laut weinen', 'Sie schubsen'],
    wrongEs: ['Agarrarlo', 'Llorar fuerte', 'Empujarlo'], wrongFr: ['Le prendre de force', 'Pleurer fort', 'Le/La pousser'], wrongAr: ['أخذها بالقوة', 'البكاء بصوت عالٍ', 'دفعه'] },
  { promptEn: 'Someone helps you.\nWhat do you say?', promptNl: 'Iemand helpt je.\nWat zeg je?', promptDe: 'Jemand hilft dir.\nWas sagst du?', promptEs: 'Alguien te ayuda.\n¿Qué dices?', promptFr: "Quelqu'un t'aide.\nQue dis-tu ?", promptAr: 'شخص ما يساعدك.\nماذا تقول؟',
    answerEn: 'Thank you', answerNl: 'Dank je wel', answerDe: 'Danke', answerEs: 'Gracias', answerFr: 'Merci', answerAr: 'شكرًا لك',
    wrongEn: ['Go away', 'Nothing', 'That’s mine'], wrongNl: ['Ga weg', 'Niets', 'Dat is van mij'], wrongDe: ['Geh weg', 'Nichts', 'Das ist meins'],
    wrongEs: ['Vete', 'Nada', 'Eso es mío'], wrongFr: ["Va-t'en", 'Rien', "C'est à moi"], wrongAr: ['ابتعد', 'لا شيء', 'هذا لي'] },
  { promptEn: 'Your sibling is scared\nof the dark. What’s kind?', promptNl: 'Je broertje of zusje is bang\nin het donker. Wat is lief?', promptDe: 'Dein Geschwister hat Angst\nvor der Dunkelheit. Was ist lieb?', promptEs: 'Tu hermano/a tiene miedo\nde la oscuridad. ¿Qué es amable?', promptFr: 'Ton frère/ta sœur a peur\ndu noir. Que faire gentiment ?', promptAr: 'أخوك أو أختك خائف\nمن الظلام. ما هو التصرف اللطيف؟',
    answerEn: 'Comfort them', answerNl: 'Troost hen', answerDe: 'Tröste ihn/sie', answerEs: 'Consolarlo', answerFr: 'Le/La réconforter', answerAr: 'واسِه',
    wrongEn: ['Laugh', 'Ignore them', 'Tell them off'], wrongNl: ['Lachen', 'Negeren', 'Ze berispen'], wrongDe: ['Lachen', 'Ignorieren', 'Ausschimpfen'],
    wrongEs: ['Reírse', 'Ignorarlo', 'Regañarlo'], wrongFr: ['Rire', "L'ignorer", 'Le/La gronder'], wrongAr: ['الضحك', 'تجاهله', 'توبيخه'] },
  { promptEn: 'You broke a toy\nby accident. What’s kind?', promptNl: 'Je hebt per ongeluk\neen speeltje kapot gemaakt. Wat is lief?', promptDe: 'Du hast aus Versehen\nein Spielzeug kaputtgemacht. Was ist lieb?', promptEs: 'Rompiste un juguete\npor accidente. ¿Qué es amable?', promptFr: 'Tu as cassé un jouet\npar accident. Que faire gentiment ?', promptAr: 'كسرت لعبة\nبالخطأ. ما هو التصرف اللطيف؟',
    answerEn: 'Say sorry', answerNl: 'Sorry zeggen', answerDe: 'Entschuldigen', answerEs: 'Pedir perdón', answerFr: 'Dire pardon', answerAr: 'قل آسف',
    wrongEn: ['Hide it', 'Blame someone', 'Run away'], wrongNl: ['Verstoppen', 'Iemand de schuld geven', 'Wegrennen'], wrongDe: ['Verstecken', 'Jemandem die Schuld geben', 'Weglaufen'],
    wrongEs: ['Esconderlo', 'Culpar a alguien', 'Huir'], wrongFr: ['Le cacher', "Accuser quelqu'un", "S'enfuir"], wrongAr: ['إخفاؤها', 'اتهام أحد', 'الهروب'] },
  { promptEn: 'It’s time to share toys.\nWhat do you do?', promptNl: 'Het is tijd om speeltjes te delen.\nWat doe je?', promptDe: 'Es ist Zeit, Spielzeug zu teilen.\nWas tust du?', promptEs: 'Es hora de compartir los juguetes.\n¿Qué haces?', promptFr: "C'est l'heure de partager les jouets.\nQue fais-tu ?", promptAr: 'حان وقت مشاركة الألعاب.\nماذا تفعل؟',
    answerEn: 'Take turns', answerNl: 'Om de beurt spelen', answerDe: 'Abwechseln', answerEs: 'Turnarse', answerFr: 'Chacun son tour', answerAr: 'التناوب',
    wrongEn: ['Keep them all', 'Hide them', 'Say no'], wrongNl: ['Ze allemaal houden', 'Ze verstoppen', 'Nee zeggen'], wrongDe: ['Alles behalten', 'Verstecken', 'Nein sagen'],
    wrongEs: ['Quedárselos todos', 'Esconderlos', 'Decir que no'], wrongFr: ['Tout garder', 'Les cacher', 'Dire non'], wrongAr: ['الاحتفاظ بها كلها', 'إخفاؤها', 'قول لا'] },
  { promptEn: 'A classmate sits alone.\nWhat’s kind?', promptNl: 'Een klasgenoot zit alleen.\nWat is lief?', promptDe: 'Ein Klassenkamerad sitzt allein.\nWas ist lieb?', promptEs: 'Un compañero está sentado solo.\n¿Qué es amable?', promptFr: 'Un camarade de classe est assis seul.\nQue faire gentiment ?', promptAr: 'زميل في الصف يجلس وحيدًا.\nما هو التصرف اللطيف؟',
    answerEn: 'Invite them', answerNl: 'Nodig hen uit', answerDe: 'Ihn/Sie einladen', answerEs: 'Invitarlo', answerFr: "L'inviter", answerAr: 'ادعُه للانضمام',
    wrongEn: ['Ignore them', 'Laugh', 'Walk past'], wrongNl: ['Negeren', 'Lachen', 'Voorbijlopen'], wrongDe: ['Ignorieren', 'Lachen', 'Vorbeigehen'],
    wrongEs: ['Ignorarlo', 'Reírse', 'Pasar de largo'], wrongFr: ["L'ignorer", 'Rire', 'Passer devant'], wrongAr: ['تجاهله', 'الضحك', 'المرور من دون الالتفات'] },
  { promptEn: 'Someone drops their books.\nWhat do you do?', promptNl: 'Iemand laat zijn boeken vallen.\nWat doe je?', promptDe: 'Jemand lässt seine Bücher fallen.\nWas tust du?', promptEs: 'Alguien deja caer sus libros.\n¿Qué haces?', promptFr: 'Quelqu’un fait tomber ses livres.\nQue fais-tu ?', promptAr: 'شخص ما يُسقط كتبه.\nماذا تفعل؟',
    answerEn: 'Help them up', answerNl: 'Help ze oprapen', answerDe: 'Ihm/Ihr beim Aufheben helfen', answerEs: 'Ayudarlo a recogerlos', answerFr: "L'aider à les ramasser", answerAr: 'ساعده على التقاطها',
    wrongEn: ['Walk past', 'Laugh', 'Step on them'], wrongNl: ['Voorbijlopen', 'Lachen', 'Erop stappen'], wrongDe: ['Vorbeigehen', 'Lachen', 'Darauf treten'],
    wrongEs: ['Pasar de largo', 'Reírse', 'Pisarlos'], wrongFr: ['Passer devant', 'Rire', 'Marcher dessus'], wrongAr: ['المرور من دون التفات', 'الضحك', 'الدوس عليها'] },
  { promptEn: 'How should you greet a friend?', promptNl: 'Hoe begroet je een vriend?', promptDe: 'Wie sollst du einen Freund begrüßen?', promptEs: '¿Cómo debes saludar a un amigo?', promptFr: 'Comment saluer un ami ?', promptAr: 'كيف تُحيي صديقًا؟',
    answerEn: 'Smile & say hi', answerNl: 'Glimlachen en hallo zeggen', answerDe: 'Lächeln und Hallo sagen', answerEs: 'Sonreír y decir hola', answerFr: 'Sourire et dire bonjour', answerAr: 'ابتسم وقل مرحبًا',
    wrongEn: ['Ignore them', 'Frown', 'Walk away'], wrongNl: ['Negeren', 'Fronsen', 'Weglopen'], wrongDe: ['Ignorieren', 'Stirnrunzeln', 'Weggehen'],
    wrongEs: ['Ignorarlo', 'Fruncir el ceño', 'Alejarse'], wrongFr: ["L'ignorer", 'Froncer les sourcils', "S'en aller"], wrongAr: ['تجاهله', 'العبوس', 'الابتعاد'] },
  { promptEn: 'What should you do\nbefore you eat?', promptNl: 'Wat moet je doen\nvoordat je eet?', promptDe: 'Was solltest du tun,\nbevor du isst?', promptEs: '¿Qué debes hacer\nantes de comer?', promptFr: 'Que faut-il faire\navant de manger ?', promptAr: 'ماذا يجب أن تفعل\nقبل الأكل؟',
    answerEn: 'Wash hands', answerNl: 'Handen wassen', answerDe: 'Hände waschen', answerEs: 'Lavarse las manos', answerFr: 'Se laver les mains', answerAr: 'غسل اليدين',
    wrongEn: ['Nothing', 'Run around', 'Yell'], wrongNl: ['Niets', 'Rondrennen', 'Schreeuwen'], wrongDe: ['Nichts', 'Herumrennen', 'Schreien'],
    wrongEs: ['Nada', 'Correr por ahí', 'Gritar'], wrongFr: ['Rien', 'Courir partout', 'Crier'], wrongAr: ['لا شيء', 'الجري', 'الصراخ'] },
  { promptEn: 'A friend got a new toy.\nWhat do you say?', promptNl: 'Een vriend heeft een nieuw speeltje.\nWat zeg je?', promptDe: 'Ein Freund hat ein neues Spielzeug.\nWas sagst du?', promptEs: 'Un amigo tiene un juguete nuevo.\n¿Qué dices?', promptFr: 'Un ami a un nouveau jouet.\nQue dis-tu ?', promptAr: 'حصل صديق على لعبة جديدة.\nماذا تقول؟',
    answerEn: 'I’m happy for you!', answerNl: 'Ik ben blij voor je!', answerDe: 'Ich freue mich für dich!', answerEs: '¡Me alegro por ti!', answerFr: 'Je suis content pour toi !', answerAr: 'أنا سعيد من أجلك!',
    wrongEn: ['That’s silly', 'I don’t care', 'Give it to me'], wrongNl: ['Dat is raar', 'Het kan me niet schelen', 'Geef het aan mij'], wrongDe: ['Das ist albern', 'Ist mir egal', 'Gib es mir'],
    wrongEs: ['Qué tontería', 'No me importa', 'Dámelo'], wrongFr: ["C'est bête", "Je m'en fiche", 'Donne-le-moi'], wrongAr: ['هذا سخيف', 'لا يهمني', 'أعطنيها'] },
  { promptEn: 'You made a mistake\non your work.', promptNl: 'Je hebt een fout gemaakt\nin je werk.', promptDe: 'Du hast einen Fehler\nbei deiner Arbeit gemacht.', promptEs: 'Cometiste un error\nen tu trabajo.', promptFr: 'Tu as fait une erreur\ndans ton travail.', promptAr: 'ارتكبت خطأ\nفي عملك.',
    answerEn: 'Try again', answerNl: 'Probeer het opnieuw', answerDe: 'Nochmal versuchen', answerEs: 'Intentar de nuevo', answerFr: 'Réessayer', answerAr: 'حاول مرة أخرى',
    wrongEn: ['Give up', 'Cry all day', 'Blame others'], wrongNl: ['Opgeven', 'De hele dag huilen', 'Anderen de schuld geven'], wrongDe: ['Aufgeben', 'Den ganzen Tag weinen', 'Anderen die Schuld geben'],
    wrongEs: ['Rendirse', 'Llorar todo el día', 'Culpar a otros'], wrongFr: ['Abandonner', 'Pleurer toute la journée', 'Accuser les autres'], wrongAr: ['الاستسلام', 'البكاء طوال اليوم', 'لوم الآخرين'] },
  { promptEn: 'What’s a kind way\nto ask for something?', promptNl: 'Wat is een lieve manier\nom iets te vragen?', promptDe: 'Was ist eine liebe Art,\num etwas zu bitten?', promptEs: '¿Cuál es una forma amable\nde pedir algo?', promptFr: 'Quelle est une façon gentille\nde demander quelque chose ?', promptAr: 'ما هي الطريقة اللطيفة\nلطلب شيء ما؟',
    answerEn: 'Please, may I?', answerNl: 'Mag ik alsjeblieft?', answerDe: 'Bitte, darf ich?', answerEs: 'Por favor, ¿puedo?', answerFr: "S'il te plaît, je peux ?", answerAr: 'من فضلك، هل يمكنني؟',
    wrongEn: ['Give me that!', 'Now!', 'Grab it'], wrongNl: ['Geef me dat!', 'Nu!', 'Pakken'], wrongDe: ['Gib mir das!', 'Jetzt!', 'Es greifen'],
    wrongEs: ['¡Dame eso!', '¡Ahora!', 'Agarrarlo'], wrongFr: ['Donne-moi ça !', 'Maintenant !', 'Le prendre de force'], wrongAr: ['أعطني ذلك!', 'الآن!', 'أخذه بالقوة'] },
];

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

/**
 * Returns a generator that reshuffles its item pool every time a run
 * restarts at question 0 — including "Play Again", which reuses this same
 * closure instance, so replaying doesn't just repeat the same 10 items.
 */
export function makeRunGenerator(): (index: number) => QuizQuestion {
  let pool: Item[] = [];
  return (index: number) => {
    if (index === 0) pool = shuffle(ITEMS).slice(0, TOTAL_QUESTIONS);
    return buildQuestion(pool[index]);
  };
}

// Match: a few scenarios share an answer ("Comfort them", "Thank you"
// appear twice) — deduped by answer so no two cards show identical text.
export function generateMatchItems(pairs: number): MatchItem[] {
  const seen = new Set<string>();
  const unique = shuffle(ITEMS).filter((item) => {
    const answer = answerFor(item);
    if (seen.has(answer)) return false;
    seen.add(answer);
    return true;
  });
  return unique.slice(0, Math.min(pairs, unique.length)).map((item, i) => ({
    id: i,
    sideA: promptFor(item).replace(/\n/g, ' '),
    sideB: answerFor(item),
  }));
}

// Sequence: these answers have no natural magnitude (an emotion isn't
// "bigger" than a kindness) — ordering by answer length is the one honest
// orderable property, deduped so no two cards tie on length.
export function generateSequenceRound(count: number): SequenceItem[] {
  const seen = new Set<number>();
  const unique = shuffle(ITEMS).filter((item) => {
    const len = answerFor(item).length;
    if (seen.has(len)) return false;
    seen.add(len);
    return true;
  });
  const n = Math.min(count, unique.length);
  return unique
    .slice(0, n)
    .sort((a, b) => answerFor(a).length - answerFor(b).length)
    .map((item, i) => ({ id: i, label: answerFor(item) }));
}

// True/False: uses wrongFor()'s hand-picked, scenario-plausible distractors
// as the "false" answer instead of a generic random mismatch — a random
// unrelated item's answer would rarely feel like a believable response to
// this scenario, but these curated wrong answers were written to be.
export function generateTrueFalseQuestion(): QuizQuestion {
  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
  const isTrue = Math.random() < 0.5;
  const shown = isTrue ? answerFor(item) : wrongFor(item)[Math.floor(Math.random() * 3)];
  return toTrueFalseQuestion(
    { statement: t().trueFalseStatement(promptFor(item).replace(/\n/g, ' '), shown), isTrue });
}

export function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(ITEMS, answerFor, promptFor);
}

// Synthetic ids from array index — ITEMS never reorders at runtime, so
// index is stable across a session even though the source data has no id.
export function generateFlashcardDeck(): FlashcardItem[] {
  return ITEMS.map((item, i) => ({ id: i, primary: promptFor(item), meaning: answerFor(item) }));
}
