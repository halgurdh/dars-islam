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

// The general order of wudu (ablution), taught the same way across schools
// of thought — every round is a hand-picked subset, so the correct order is
// always just the relative order these ids already have here. `term` is the
// common Arabic-transliteration name for each step, shared with the Match
// and Quiz modes — it's a transliteration, not translated per language.
export interface WuduStep {
  id: number;
  labelEn: string; labelNl: string; labelDe: string; labelEs: string; labelFr: string; labelAr: string;
  term: string;
}

export const STEPS: WuduStep[] = [
  { id: 1, labelEn: 'Make the intention', labelNl: 'De intentie maken', labelDe: 'Die Absicht fassen', labelEs: 'Hacer la intención', labelFr: "Faire l'intention", labelAr: 'عقد النية', term: 'Niyyah' },
  { id: 2, labelEn: 'Wash the hands three times', labelNl: 'De handen drie keer wassen', labelDe: 'Die Hände dreimal waschen', labelEs: 'Lavarse las manos tres veces', labelFr: 'Se laver les mains trois fois', labelAr: 'غسل اليدين ثلاث مرات', term: 'Ghusl al-Yadayn' },
  { id: 3, labelEn: 'Rinse the mouth', labelNl: 'De mond spoelen', labelDe: 'Den Mund ausspülen', labelEs: 'Enjuagarse la boca', labelFr: 'Se rincer la bouche', labelAr: 'المضمضة', term: 'Madmadah' },
  { id: 4, labelEn: 'Sniff water and blow it out', labelNl: 'Water opsnuiven en uitblazen', labelDe: 'Wasser einziehen und ausstoßen', labelEs: 'Aspirar agua y expulsarla', labelFr: "Aspirer de l'eau et l'expulser", labelAr: 'الاستنشاق والاستنثار', term: 'Istinshaq' },
  { id: 5, labelEn: 'Wash the face three times', labelNl: 'Het gezicht drie keer wassen', labelDe: 'Das Gesicht dreimal waschen', labelEs: 'Lavarse la cara tres veces', labelFr: 'Se laver le visage trois fois', labelAr: 'غسل الوجه ثلاث مرات', term: 'Ghusl al-Wajh' },
  { id: 6, labelEn: 'Wash the arms to the elbows', labelNl: 'De armen tot de ellebogen wassen', labelDe: 'Die Arme bis zu den Ellbogen waschen', labelEs: 'Lavarse los brazos hasta los codos', labelFr: "Se laver les bras jusqu'aux coudes", labelAr: 'غسل اليدين إلى المرفقين', term: 'Ghusl al-Yadayn ila al-Mirafiq' },
  { id: 7, labelEn: 'Wipe over the head', labelNl: 'Over het hoofd wrijven', labelDe: 'Über den Kopf wischen', labelEs: 'Pasar la mano húmeda por la cabeza', labelFr: 'Essuyer la tête', labelAr: 'مسح الرأس', term: "Mash al-Ra's" },
  { id: 8, labelEn: 'Wash the feet to the ankles', labelNl: 'De voeten tot de enkels wassen', labelDe: 'Die Füße bis zu den Knöcheln waschen', labelEs: 'Lavarse los pies hasta los tobillos', labelFr: "Se laver les pieds jusqu'aux chevilles", labelAr: 'غسل الرجلين إلى الكعبين', term: 'Ghusl al-Rijlayn' },
];

export function labelFor(step: WuduStep): string {
  switch (getLang()) {
    case 'nl': return step.labelNl;
    case 'de': return step.labelDe;
    case 'es': return step.labelEs;
    case 'fr': return step.labelFr;
    case 'ar': return step.labelAr;
    default: return step.labelEn;
  }
}

const STEPS_BY_ID = new Map(STEPS.map((s) => [s.id, s]));

function pick(ids: number[]): number[] {
  return ids;
}

const ROUNDS: Record<string, number[][]> = {
  easy: [
    pick([1, 2, 5, 8]),
    pick([1, 5, 6, 8]),
    pick([2, 3, 5, 8]),
  ],
  medium: [
    pick([1, 2, 3, 5, 8]),
    pick([2, 3, 4, 5, 6]),
    pick([4, 5, 6, 7, 8]),
  ],
  hard: [
    pick([1, 2, 3, 4, 5, 6]),
    pick([2, 3, 4, 5, 6, 7]),
    pick([3, 4, 5, 6, 7, 8]),
  ],
};

export function generateRound(difficulty: Difficulty, index: number): SequenceItem[] {
  const rounds = ROUNDS[difficulty.id];
  const ids = rounds[index % rounds.length];
  return ids.map((id) => {
    const step = STEPS_BY_ID.get(id)!;
    return { id: step.id, label: labelFor(step) };
  });
}
