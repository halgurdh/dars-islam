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

// Body part ↔ function, with an approximate average adult weight (grams) so
// Weight Sort tests real "which is heavier?" intuition — most people don't
// guess that skin outweighs the brain, or muscles outweigh the skeleton.
export interface BodyPart {
  id: number;
  partEn: string; partNl: string; partDe: string; partEs: string; partFr: string; partAr: string;
  fnEn: string; fnNl: string; fnDe: string; fnEs: string; fnFr: string; fnAr: string;
  weightGrams: number;
}

export const BODY_PARTS: BodyPart[] = [
  { id: 1, partEn: 'Heart', partNl: 'Hart', partDe: 'Herz', partEs: 'Corazón', partFr: 'Cœur', partAr: 'القلب',
    fnEn: 'Pumps blood', fnNl: 'Pompt bloed rond', fnDe: 'Pumpt Blut', fnEs: 'Bombea la sangre', fnFr: 'Pompe le sang', fnAr: 'يضخ الدم', weightGrams: 300 },
  { id: 2, partEn: 'Lungs', partNl: 'Longen', partDe: 'Lunge', partEs: 'Pulmones', partFr: 'Poumons', partAr: 'الرئتان',
    fnEn: 'Help you breathe', fnNl: 'Helpen je ademen', fnDe: 'Hilft dir beim Atmen', fnEs: 'Te ayudan a respirar', fnFr: "T'aident à respirer", fnAr: 'تساعدانك على التنفس', weightGrams: 1090 },
  { id: 3, partEn: 'Brain', partNl: 'Hersenen', partDe: 'Gehirn', partEs: 'Cerebro', partFr: 'Cerveau', partAr: 'الدماغ',
    fnEn: 'Controls the body', fnNl: 'Bestuurt het lichaam', fnDe: 'Steuert den Körper', fnEs: 'Controla el cuerpo', fnFr: 'Contrôle le corps', fnAr: 'يتحكم في الجسم', weightGrams: 1400 },
  { id: 4, partEn: 'Stomach', partNl: 'Maag', partDe: 'Magen', partEs: 'Estómago', partFr: 'Estomac', partAr: 'المعدة',
    fnEn: 'Digests food', fnNl: 'Verteert voedsel', fnDe: 'Verdaut Nahrung', fnEs: 'Digiere los alimentos', fnFr: 'Digère la nourriture', fnAr: 'تهضم الطعام', weightGrams: 150 },
  { id: 5, partEn: 'Skin', partNl: 'Huid', partDe: 'Haut', partEs: 'Piel', partFr: 'Peau', partAr: 'الجلد',
    fnEn: 'Protects the body', fnNl: 'Beschermt het lichaam', fnDe: 'Schützt den Körper', fnEs: 'Protege el cuerpo', fnFr: 'Protège le corps', fnAr: 'يحمي الجسم', weightGrams: 3600 },
  { id: 6, partEn: 'Muscles', partNl: 'Spieren', partDe: 'Muskeln', partEs: 'Músculos', partFr: 'Muscles', partAr: 'العضلات',
    fnEn: 'Help you move', fnNl: 'Helpen je bewegen', fnDe: 'Helfen dir, dich zu bewegen', fnEs: 'Te ayudan a moverte', fnFr: "T'aident à bouger", fnAr: 'تساعدك على الحركة', weightGrams: 28_000 },
  { id: 7, partEn: 'Bones', partNl: 'Botten', partDe: 'Knochen', partEs: 'Huesos', partFr: 'Os', partAr: 'العظام',
    fnEn: 'Support the body', fnNl: 'Ondersteunen het lichaam', fnDe: 'Stützen den Körper', fnEs: 'Sostienen el cuerpo', fnFr: 'Soutiennent le corps', fnAr: 'تدعم الجسم', weightGrams: 10_000 },
  { id: 8, partEn: 'Kidneys', partNl: 'Nieren', partDe: 'Nieren', partEs: 'Riñones', partFr: 'Reins', partAr: 'الكليتان',
    fnEn: 'Filter the blood', fnNl: 'Filteren het bloed', fnDe: 'Filtern das Blut', fnEs: 'Filtran la sangre', fnFr: 'Filtrent le sang', fnAr: 'تُصفّيان الدم', weightGrams: 290 },
  { id: 9, partEn: 'Eyes', partNl: 'Ogen', partDe: 'Augen', partEs: 'Ojos', partFr: 'Yeux', partAr: 'العينان',
    fnEn: 'Help you see', fnNl: 'Helpen je zien', fnDe: 'Helfen dir zu sehen', fnEs: 'Te ayudan a ver', fnFr: "T'aident à voir", fnAr: 'تساعدانك على الرؤية', weightGrams: 14 },
  { id: 10, partEn: 'Ears', partNl: 'Oren', partDe: 'Ohren', partEs: 'Oídos', partFr: 'Oreilles', partAr: 'الأذنان',
    fnEn: 'Help you hear', fnNl: 'Helpen je horen', fnDe: 'Helfen dir zu hören', fnEs: 'Te ayudan a oír', fnFr: "T'aident à entendre", fnAr: 'تساعدانك على السمع', weightGrams: 30 },
];

export function partFor(item: BodyPart): string {
  switch (getLang()) {
    case 'nl': return item.partNl;
    case 'de': return item.partDe;
    case 'es': return item.partEs;
    case 'fr': return item.partFr;
    case 'ar': return item.partAr;
    default: return item.partEn;
  }
}

export function fnFor(item: BodyPart): string {
  switch (getLang()) {
    case 'nl': return item.fnNl;
    case 'de': return item.fnDe;
    case 'es': return item.fnEs;
    case 'fr': return item.fnFr;
    case 'ar': return item.fnAr;
    default: return item.fnEn;
  }
}
