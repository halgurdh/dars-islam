import { getLang } from './systems/Locale';

export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Each item teaches ONE full everyday sentence/expression in ONE specific
// language (fixed, not translated): `phrase`/`lang` never change. `meaning`
// DOES vary by UI language — real "from your language to the phrase's
// language" practice, changeable just by switching UI language (the
// in-canvas picker reaches gameplay directly). The one exception: when the
// UI language equals the item's own taught language, meaningFor() falls
// back to English rather than showing the phrase next to itself.
export interface PhraseItem {
  id: number;
  phrase: string;
  lang: 'nl' | 'de' | 'es' | 'fr' | 'ar';
  meaningEn: string;
  meaningNl: string;
  meaningDe: string;
  meaningEs: string;
  meaningFr: string;
  meaningAr: string;
  /** Rough "learn this first" order — greetings/essentials first, used by Sequence mode. */
  rank: number;
}

export const PHRASES: PhraseItem[] = [
  { id: 1, phrase: 'Hoe gaat het met je?', lang: 'nl', meaningEn: 'How are you?', meaningNl: 'Hoe gaat het met je?', meaningDe: 'Wie geht es dir?', meaningEs: '¿Cómo estás?', meaningFr: 'Comment ça va ?', meaningAr: 'كيف حالك؟', rank: 1 },
  { id: 2, phrase: 'Wie heißt du?', lang: 'de', meaningEn: 'What is your name?', meaningNl: 'Hoe heet je?', meaningDe: 'Wie heißt du?', meaningEs: '¿Cómo te llamas?', meaningFr: "Comment tu t'appelles ?", meaningAr: 'ما اسمك؟', rank: 2 },
  { id: 3, phrase: '¿Dónde está el baño?', lang: 'es', meaningEn: 'Where is the bathroom?', meaningNl: 'Waar is het toilet?', meaningDe: 'Wo ist die Toilette?', meaningEs: '¿Dónde está el baño?', meaningFr: 'Où sont les toilettes ?', meaningAr: 'أين الحمام؟', rank: 3 },
  { id: 4, phrase: 'أنا لا أفهم', lang: 'ar', meaningEn: "I don't understand", meaningNl: 'Ik begrijp het niet', meaningDe: 'Ich verstehe nicht', meaningEs: 'No entiendo', meaningFr: 'Je ne comprends pas', meaningAr: 'أنا لا أفهم', rank: 4 },
  { id: 5, phrase: "Pouvez-vous m'aider ?", lang: 'fr', meaningEn: 'Can you help me?', meaningNl: 'Kun je me helpen?', meaningDe: 'Kannst du mir helfen?', meaningEs: '¿Puedes ayudarme?', meaningFr: "Pouvez-vous m'aider ?", meaningAr: 'هل يمكنك مساعدتي؟', rank: 5 },
  { id: 6, phrase: 'Tot ziens!', lang: 'nl', meaningEn: 'See you later!', meaningNl: 'Tot ziens!', meaningDe: 'Bis später!', meaningEs: '¡Hasta luego!', meaningFr: 'À plus tard !', meaningAr: 'أراك لاحقًا!', rank: 6 },
  { id: 7, phrase: 'Wie viel kostet das?', lang: 'de', meaningEn: 'How much does this cost?', meaningNl: 'Hoeveel kost dit?', meaningDe: 'Wie viel kostet das?', meaningEs: '¿Cuánto cuesta esto?', meaningFr: 'Combien ça coûte ?', meaningAr: 'كم يكلف هذا؟', rank: 7 },
  { id: 8, phrase: '¿Qué hora es?', lang: 'es', meaningEn: 'What time is it?', meaningNl: 'Hoe laat is het?', meaningDe: 'Wie spät ist es?', meaningEs: '¿Qué hora es?', meaningFr: 'Quelle heure est-il ?', meaningAr: 'كم الساعة؟', rank: 8 },
  { id: 9, phrase: 'Je suis perdu', lang: 'fr', meaningEn: 'I am lost', meaningNl: 'Ik ben verdwaald', meaningDe: 'Ich habe mich verlaufen', meaningEs: 'Estoy perdido', meaningFr: 'Je suis perdu', meaningAr: 'أنا تائه', rank: 9 },
  { id: 10, phrase: 'أين الفندق؟', lang: 'ar', meaningEn: 'Where is the hotel?', meaningNl: 'Waar is het hotel?', meaningDe: 'Wo ist das Hotel?', meaningEs: '¿Dónde está el hotel?', meaningFr: "Où est l'hôtel ?", meaningAr: 'أين الفندق؟', rank: 10 },
  { id: 11, phrase: 'Ik heb honger', lang: 'nl', meaningEn: 'I am hungry', meaningNl: 'Ik heb honger', meaningDe: 'Ich habe Hunger', meaningEs: 'Tengo hambre', meaningFr: "J'ai faim", meaningAr: 'أنا جائع', rank: 11 },
  { id: 12, phrase: 'Guten Appetit!', lang: 'de', meaningEn: 'Enjoy your meal!', meaningNl: 'Eet smakelijk!', meaningDe: 'Guten Appetit!', meaningEs: '¡Buen provecho!', meaningFr: 'Bon appétit !', meaningAr: 'بالهناء والشفاء!', rank: 12 },
  { id: 13, phrase: 'Mucho gusto', lang: 'es', meaningEn: 'Nice to meet you', meaningNl: 'Aangenaam', meaningDe: 'Freut mich', meaningEs: 'Mucho gusto', meaningFr: 'Enchanté', meaningAr: 'تشرفت بمعرفتك', rank: 13 },
  { id: 14, phrase: 'Félicitations !', lang: 'fr', meaningEn: 'Congratulations!', meaningNl: 'Gefeliciteerd!', meaningDe: 'Herzlichen Glückwunsch!', meaningEs: '¡Felicidades!', meaningFr: 'Félicitations !', meaningAr: 'مبروك!', rank: 14 },
  { id: 15, phrase: 'مع السلامة', lang: 'ar', meaningEn: 'Goodbye', meaningNl: 'Tot ziens', meaningDe: 'Auf Wiedersehen', meaningEs: 'Adiós', meaningFr: 'Au revoir', meaningAr: 'مع السلامة', rank: 15 },
  { id: 16, phrase: 'Waar is het station?', lang: 'nl', meaningEn: 'Where is the station?', meaningNl: 'Waar is het station?', meaningDe: 'Wo ist der Bahnhof?', meaningEs: '¿Dónde está la estación?', meaningFr: 'Où est la gare ?', meaningAr: 'أين المحطة؟', rank: 16 },
  { id: 17, phrase: 'Ich brauche Hilfe', lang: 'de', meaningEn: 'I need help', meaningNl: 'Ik heb hulp nodig', meaningDe: 'Ich brauche Hilfe', meaningEs: 'Necesito ayuda', meaningFr: "J'ai besoin d'aide", meaningAr: 'أحتاج إلى مساعدة', rank: 17 },
  { id: 18, phrase: '¿Cuánto cuesta esto?', lang: 'es', meaningEn: 'How much does this cost?', meaningNl: 'Hoeveel kost dit?', meaningDe: 'Wie viel kostet das?', meaningEs: '¿Cuánto cuesta esto?', meaningFr: 'Combien ça coûte ?', meaningAr: 'كم يكلف هذا؟', rank: 18 },
];

export function meaningFor(item: PhraseItem): string {
  const lang = getLang();
  if (lang === item.lang) return item.meaningEn;
  switch (lang) {
    case 'nl': return item.meaningNl;
    case 'de': return item.meaningDe;
    case 'es': return item.meaningEs;
    case 'fr': return item.meaningFr;
    case 'ar': return item.meaningAr;
    default: return item.meaningEn;
  }
}
