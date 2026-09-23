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

// A single, widely-agreed chronological backbone of broad world history —
// every round below is a hand-picked subset, so "correct order" is always
// just the relative order these ids already have here. `era` is the same
// widely-cited approximate dating used in general textbooks, shared with
// the Match and Quiz modes below — it's a date/number, so it's never
// translated.
export interface HistoryEvent {
  id: number;
  labelEn: string; labelNl: string; labelDe: string; labelEs: string; labelFr: string; labelAr: string;
  era: string;
}

export const EVENTS: HistoryEvent[] = [
  { id: 1, labelEn: 'Invention of writing (cuneiform)', labelNl: 'Uitvinding van het schrift (spijkerschrift)', labelDe: 'Erfindung der Schrift (Keilschrift)', labelEs: 'Invención de la escritura (cuneiforme)', labelFr: "Invention de l'écriture (cunéiforme)", labelAr: 'اختراع الكتابة (المسمارية)', era: '~3200 BCE' },
  { id: 2, labelEn: 'The Egyptian pyramids are built', labelNl: 'De Egyptische piramides worden gebouwd', labelDe: 'Die ägyptischen Pyramiden werden gebaut', labelEs: 'Se construyen las pirámides egipcias', labelFr: 'Les pyramides égyptiennes sont construites', labelAr: 'بناء الأهرامات المصرية', era: '~2600 BCE' },
  { id: 3, labelEn: 'Ancient Greek city-states flourish', labelNl: 'Oud-Griekse stadstaten bloeien', labelDe: 'Antike griechische Stadtstaaten blühen auf', labelEs: 'Florecen las ciudades-estado griegas', labelFr: 'Les cités-États grecques prospèrent', labelAr: 'ازدهار المدن اليونانية القديمة', era: '~500 BCE' },
  { id: 4, labelEn: 'The Roman Empire rises', labelNl: 'Het Romeinse Rijk komt op', labelDe: 'Das Römische Reich entsteht', labelEs: 'Surge el Imperio Romano', labelFr: "L'Empire romain s'élève", labelAr: 'نشوء الإمبراطورية الرومانية', era: '~27 BCE' },
  { id: 5, labelEn: 'The Roman Empire falls', labelNl: 'Het Romeinse Rijk valt', labelDe: 'Das Römische Reich fällt', labelEs: 'Cae el Imperio Romano', labelFr: "L'Empire romain s'effondre", labelAr: 'سقوط الإمبراطورية الرومانية', era: '476 CE' },
  { id: 6, labelEn: 'The Middle Ages in Europe', labelNl: 'De Middeleeuwen in Europa', labelDe: 'Das Mittelalter in Europa', labelEs: 'La Edad Media en Europa', labelFr: 'Le Moyen Âge en Europe', labelAr: 'العصور الوسطى في أوروبا', era: '500–1500 CE' },
  { id: 7, labelEn: 'The Renaissance begins', labelNl: 'De Renaissance begint', labelDe: 'Die Renaissance beginnt', labelEs: 'Comienza el Renacimiento', labelFr: 'La Renaissance commence', labelAr: 'بداية عصر النهضة', era: '~1400 CE' },
  { id: 8, labelEn: 'Columbus reaches the Americas', labelNl: 'Columbus bereikt Amerika', labelDe: 'Kolumbus erreicht Amerika', labelEs: 'Colón llega a América', labelFr: 'Christophe Colomb atteint les Amériques', labelAr: 'وصول كولومبوس إلى الأمريكتين', era: '1492 CE' },
  { id: 9, labelEn: 'The Industrial Revolution begins', labelNl: 'De Industriële Revolutie begint', labelDe: 'Die industrielle Revolution beginnt', labelEs: 'Comienza la Revolución Industrial', labelFr: 'La révolution industrielle commence', labelAr: 'بداية الثورة الصناعية', era: '~1760 CE' },
  { id: 10, labelEn: 'World War I', labelNl: 'De Eerste Wereldoorlog', labelDe: 'Der Erste Weltkrieg', labelEs: 'La Primera Guerra Mundial', labelFr: 'La Première Guerre mondiale', labelAr: 'الحرب العالمية الأولى', era: '1914–1918' },
  { id: 11, labelEn: 'World War II', labelNl: 'De Tweede Wereldoorlog', labelDe: 'Der Zweite Weltkrieg', labelEs: 'La Segunda Guerra Mundial', labelFr: 'La Seconde Guerre mondiale', labelAr: 'الحرب العالمية الثانية', era: '1939–1945' },
  { id: 12, labelEn: 'The first Moon landing', labelNl: 'De eerste maanlanding', labelDe: 'Die erste Mondlandung', labelEs: 'El primer alunizaje', labelFr: 'Le premier alunissage', labelAr: 'أول هبوط على القمر', era: '1969' },
];

export function labelFor(item: HistoryEvent): string {
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
    pick([1, 3, 9, 12]),
    pick([2, 5, 8, 11]),
    pick([1, 4, 7, 10]),
  ],
  medium: [
    pick([1, 2, 3, 4, 5]),
    pick([5, 6, 7, 8, 9]),
    pick([8, 9, 10, 11, 12]),
  ],
  hard: [
    pick([1, 2, 3, 4, 5, 6]),
    pick([4, 5, 6, 7, 8, 9]),
    pick([7, 8, 9, 10, 11, 12]),
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
