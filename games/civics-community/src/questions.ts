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

// Term ↔ definition, with a "scope" rank — how many people the idea
// concerns, from a single person up to a whole nation — so Scope Sort tests
// real civics understanding instead of an alphabetical sort.
export interface CivicsTerm {
  id: number;
  termEn: string; termNl: string; termDe: string; termEs: string; termFr: string; termAr: string;
  meaningEn: string; meaningNl: string; meaningDe: string; meaningEs: string; meaningFr: string; meaningAr: string;
  scope: number;
}

export const TERMS: CivicsTerm[] = [
  { id: 1, termEn: 'Citizen', termNl: 'Burger', termDe: 'Bürger', termEs: 'Ciudadano', termFr: 'Citoyen', termAr: 'مواطن',
    meaningEn: 'A member of a community', meaningNl: 'Een lid van een gemeenschap', meaningDe: 'Ein Mitglied einer Gemeinschaft', meaningEs: 'Un miembro de una comunidad', meaningFr: "Un membre d'une communauté", meaningAr: 'عضو في مجتمع', scope: 1 },
  { id: 2, termEn: 'Vote', termNl: 'Stemmen', termDe: 'Wählen', termEs: 'Votar', termFr: 'Voter', termAr: 'تصويت',
    meaningEn: 'Choosing a leader', meaningNl: 'Een leider kiezen', meaningDe: 'Einen Anführer auswählen', meaningEs: 'Elegir a un líder', meaningFr: 'Choisir un dirigeant', meaningAr: 'اختيار قائد', scope: 2 },
  { id: 3, termEn: 'Ballot', termNl: 'Stembiljet', termDe: 'Stimmzettel', termEs: 'Papeleta', termFr: 'Bulletin de vote', termAr: 'ورقة اقتراع',
    meaningEn: 'A paper used to vote', meaningNl: 'Een papier om mee te stemmen', meaningDe: 'Ein Papier zum Abstimmen', meaningEs: 'Un papel usado para votar', meaningFr: 'Un papier utilisé pour voter', meaningAr: 'ورقة تُستخدم للتصويت', scope: 3 },
  { id: 4, termEn: 'Rights', termNl: 'Rechten', termDe: 'Rechte', termEs: 'Derechos', termFr: 'Droits', termAr: 'حقوق',
    meaningEn: 'Freedoms everyone has', meaningNl: 'Vrijheden die iedereen heeft', meaningDe: 'Freiheiten, die jeder hat', meaningEs: 'Libertades que todos tienen', meaningFr: 'Libertés que tout le monde possède', meaningAr: 'حريات يملكها الجميع', scope: 4 },
  { id: 5, termEn: 'Community', termNl: 'Gemeenschap', termDe: 'Gemeinschaft', termEs: 'Comunidad', termFr: 'Communauté', termAr: 'مجتمع',
    meaningEn: 'People living in the same area', meaningNl: 'Mensen die in hetzelfde gebied wonen', meaningDe: 'Menschen, die im selben Gebiet leben', meaningEs: 'Personas que viven en la misma zona', meaningFr: 'Des personnes vivant dans la même zone', meaningAr: 'أشخاص يعيشون في نفس المنطقة', scope: 5 },
  { id: 6, termEn: 'Mayor', termNl: 'Burgemeester', termDe: 'Bürgermeister', termEs: 'Alcalde', termFr: 'Maire', termAr: 'عمدة',
    meaningEn: 'Leader of a city', meaningNl: 'Leider van een stad', meaningDe: 'Leiter einer Stadt', meaningEs: 'Líder de una ciudad', meaningFr: "Dirigeant d'une ville", meaningAr: 'قائد المدينة', scope: 6 },
  { id: 7, termEn: 'Tax', termNl: 'Belasting', termDe: 'Steuer', termEs: 'Impuesto', termFr: 'Impôt', termAr: 'ضريبة',
    meaningEn: 'Money paid to the government', meaningNl: 'Geld betaald aan de overheid', meaningDe: 'Geld, das an die Regierung gezahlt wird', meaningEs: 'Dinero pagado al gobierno', meaningFr: 'Argent payé au gouvernement', meaningAr: 'أموال تُدفع للحكومة', scope: 7 },
  { id: 8, termEn: 'Law', termNl: 'Wet', termDe: 'Gesetz', termEs: 'Ley', termFr: 'Loi', termAr: 'قانون',
    meaningEn: 'A rule everyone must follow', meaningNl: 'Een regel die iedereen moet volgen', meaningDe: 'Eine Regel, der jeder folgen muss', meaningEs: 'Una regla que todos deben seguir', meaningFr: 'Une règle que tout le monde doit suivre', meaningAr: 'قاعدة يجب على الجميع اتباعها', scope: 8 },
  { id: 9, termEn: 'Constitution', termNl: 'Grondwet', termDe: 'Verfassung', termEs: 'Constitución', termFr: 'Constitution', termAr: 'دستور',
    meaningEn: "A country's basic laws", meaningNl: 'De basiswetten van een land', meaningDe: 'Die Grundgesetze eines Landes', meaningEs: 'Las leyes básicas de un país', meaningFr: "Les lois fondamentales d'un pays", meaningAr: 'القوانين الأساسية للبلد', scope: 9 },
  { id: 10, termEn: 'Democracy', termNl: 'Democratie', termDe: 'Demokratie', termEs: 'Democracia', termFr: 'Démocratie', termAr: 'ديمقراطية',
    meaningEn: 'Rule by the people', meaningNl: 'Bestuur door het volk', meaningDe: 'Herrschaft durch das Volk', meaningEs: 'Gobierno del pueblo', meaningFr: 'Le pouvoir du peuple', meaningAr: 'حكم الشعب', scope: 10 },
];

export function termFor(item: CivicsTerm): string {
  switch (getLang()) {
    case 'nl': return item.termNl;
    case 'de': return item.termDe;
    case 'es': return item.termEs;
    case 'fr': return item.termFr;
    case 'ar': return item.termAr;
    default: return item.termEn;
  }
}

export function meaningFor(item: CivicsTerm): string {
  switch (getLang()) {
    case 'nl': return item.meaningNl;
    case 'de': return item.meaningDe;
    case 'es': return item.meaningEs;
    case 'fr': return item.meaningFr;
    case 'ar': return item.meaningAr;
    default: return item.meaningEn;
  }
}
