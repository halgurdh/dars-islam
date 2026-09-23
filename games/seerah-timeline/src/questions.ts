import type { SequenceItem } from '@shared/sequence-kit';
import { getLang } from './systems/Locale';

export interface Difficulty {
  id: string;
  totalRounds: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', totalRounds: 3 },
  { id: 'medium', totalRounds: 3 },
  { id: 'hard', totalRounds: 3 },
];

// A single, widely-agreed chronological backbone of the Seerah — every round
// below is a hand-picked subset of this master list, so "correct order" is
// never ambiguous: it's always the relative order these ids already have
// here, no matter which subset a round pulls. `era` is the same widely-cited
// approximate CE dating used in general Seerah texts, shared with the Match
// and Quiz modes below — it's a date/number, so it's never translated.
export interface SeerahEvent {
  id: number;
  labelEn: string; labelNl: string; labelDe: string; labelEs: string; labelFr: string; labelAr: string;
  era: string;
}

export const EVENTS: SeerahEvent[] = [
  { id: 1, labelEn: 'Born in Makkah', labelNl: 'Geboren in Mekka', labelDe: 'Geboren in Mekka', labelEs: 'Nace en La Meca', labelFr: 'Naît à La Mecque', labelAr: 'وُلِد في مكة', era: '570 CE' },
  { id: 3, labelEn: 'Marries Khadijah', labelNl: 'Trouwt met Khadijah', labelDe: 'Heiratet Khadidscha', labelEs: 'Se casa con Jadiya', labelFr: 'Épouse Khadija', labelAr: 'يتزوج خديجة', era: '~595 CE' },
  { id: 4, labelEn: 'First revelation in the Cave of Hira', labelNl: 'Eerste openbaring in de grot van Hira', labelDe: 'Erste Offenbarung in der Höhle Hira', labelEs: 'Primera revelación en la cueva de Hira', labelFr: 'Première révélation dans la grotte de Hira', labelAr: 'أول وحي في غار حراء', era: '610 CE' },
  { id: 5, labelEn: 'Preaches privately to family', labelNl: 'Predikt privé aan familie', labelDe: 'Predigt zunächst privat der Familie', labelEs: 'Predica en privado a su familia', labelFr: 'Prêche en privé à sa famille', labelAr: 'يدعو أهله سرًا', era: '~611 CE' },
  { id: 6, labelEn: 'Begins preaching publicly', labelNl: 'Begint publiekelijk te prediken', labelDe: 'Beginnt öffentlich zu predigen', labelEs: 'Comienza a predicar públicamente', labelFr: 'Commence à prêcher publiquement', labelAr: 'يبدأ الدعوة علانية', era: '613 CE' },
  { id: 7, labelEn: 'Faces persecution in Makkah', labelNl: 'Wordt vervolgd in Mekka', labelDe: 'Wird in Mekka verfolgt', labelEs: 'Enfrenta persecución en La Meca', labelFr: 'Fait face à la persécution à La Mecque', labelAr: 'يواجه الاضطهاد في مكة', era: '~615 CE' },
  { id: 8, labelEn: 'Some followers migrate to Abyssinia', labelNl: 'Sommige volgelingen migreren naar Abessinië', labelDe: 'Einige Anhänger wandern nach Abessinien aus', labelEs: 'Algunos seguidores emigran a Abisinia', labelFr: 'Certains disciples émigrent en Abyssinie', labelAr: 'هجرة بعض الأتباع إلى الحبشة', era: '615 CE' },
  { id: 9, labelEn: 'The Hijra to Madinah', labelNl: 'De Hijra naar Medina', labelDe: 'Die Hijra nach Medina', labelEs: 'La Hégira a Medina', labelFr: "L'Hégire vers Médine", labelAr: 'الهجرة إلى المدينة', era: '622 CE' },
  { id: 10, labelEn: 'Builds the mosque in Madinah', labelNl: 'Bouwt de moskee in Medina', labelDe: 'Baut die Moschee in Medina', labelEs: 'Construye la mezquita en Medina', labelFr: 'Construit la mosquée à Médine', labelAr: 'بناء المسجد في المدينة', era: '622 CE' },
  { id: 11, labelEn: 'The Battle of Badr', labelNl: 'De Slag om Badr', labelDe: 'Die Schlacht von Badr', labelEs: 'La batalla de Badr', labelFr: 'La bataille de Badr', labelAr: 'غزوة بدر', era: '624 CE' },
  { id: 12, labelEn: 'The Battle of Uhud', labelNl: 'De Slag om Uhud', labelDe: 'Die Schlacht von Uhud', labelEs: 'La batalla de Uhud', labelFr: "La bataille d'Uhud", labelAr: 'غزوة أحد', era: '625 CE' },
  { id: 13, labelEn: 'The Battle of the Trench', labelNl: 'De Slag om de Loopgraaf', labelDe: 'Die Schlacht am Graben', labelEs: 'La batalla de la Trinchera', labelFr: 'La bataille du Fossé', labelAr: 'غزوة الخندق', era: '627 CE' },
  { id: 14, labelEn: 'The Treaty of Hudaybiyyah', labelNl: 'Het Verdrag van Hudaybiyyah', labelDe: 'Der Vertrag von Hudaybiyya', labelEs: 'El Tratado de Hudaybiyyah', labelFr: 'Le traité de Hudaybiyya', labelAr: 'صلح الحديبية', era: '628 CE' },
  { id: 15, labelEn: 'The Conquest of Makkah', labelNl: 'De Verovering van Mekka', labelDe: 'Die Eroberung Mekkas', labelEs: 'La conquista de La Meca', labelFr: 'La conquête de La Mecque', labelAr: 'فتح مكة', era: '630 CE' },
  { id: 16, labelEn: 'The Farewell Pilgrimage', labelNl: 'De Afscheidsbedevaart', labelDe: 'Die Abschiedspilgerfahrt', labelEs: 'La Peregrinación de Despedida', labelFr: "Le pèlerinage d'adieu", labelAr: 'حجة الوداع', era: '632 CE' },
  { id: 17, labelEn: 'Passes away in Madinah', labelNl: 'Overlijdt in Medina', labelDe: 'Stirbt in Medina', labelEs: 'Fallece en Medina', labelFr: 'Décède à Médine', labelAr: 'تُوفي في المدينة', era: '632 CE' },
];

export function labelFor(item: SeerahEvent): string {
  switch (getLang()) {
    case 'nl': return item.labelNl;
    case 'de': return item.labelDe;
    case 'es': return item.labelEs;
    case 'fr': return item.labelFr;
    case 'ar': return item.labelAr;
    default: return item.labelEn;
  }
}

const EVENTS_BY_ID = new Map(EVENTS.map((e) => [e.id, e]));

function pick(ids: number[]): number[] {
  return ids;
}

const ROUNDS: Record<string, number[][]> = {
  easy: [
    pick([1, 4, 9, 17]),
    pick([1, 3, 4, 9]),
    pick([4, 9, 11, 15]),
  ],
  medium: [
    pick([1, 4, 6, 9, 17]),
    pick([4, 7, 8, 9, 11]),
    pick([9, 10, 11, 13, 15]),
  ],
  hard: [
    pick([9, 10, 11, 12, 13, 15]),
    pick([1, 3, 4, 5, 6, 9]),
    pick([11, 12, 13, 14, 15, 16]),
  ],
};

export function generateRound(difficulty: Difficulty, index: number): SequenceItem[] {
  const rounds = ROUNDS[difficulty.id];
  const ids = rounds[index % rounds.length];
  return ids.map((id) => {
    const event = EVENTS_BY_ID.get(id)!;
    return { id: event.id, label: labelFor(event) };
  });
}
