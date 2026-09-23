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

// The 8 planets in order of distance from the sun — every round is a
// hand-picked subset, so the correct order is always just the relative
// order these ids already have here. `fact` is a well-known one-line
// distinguishing feature, shared with the Match and Quiz modes below.
export interface Planet {
  id: number;
  nameEn: string; nameNl: string; nameDe: string; nameEs: string; nameFr: string; nameAr: string;
  factEn: string; factNl: string; factDe: string; factEs: string; factFr: string; factAr: string;
}

export const PLANETS: Planet[] = [
  { id: 1, nameEn: 'Mercury', nameNl: 'Mercurius', nameDe: 'Merkur', nameEs: 'Mercurio', nameFr: 'Mercure', nameAr: 'عطارد',
    factEn: 'The smallest planet', factNl: 'De kleinste planeet', factDe: 'Der kleinste Planet', factEs: 'El planeta más pequeño', factFr: 'La plus petite planète', factAr: 'أصغر كوكب' },
  { id: 2, nameEn: 'Venus', nameNl: 'Venus', nameDe: 'Venus', nameEs: 'Venus', nameFr: 'Vénus', nameAr: 'الزهرة',
    factEn: 'The hottest planet', factNl: 'De heetste planeet', factDe: 'Der heißeste Planet', factEs: 'El planeta más caliente', factFr: 'La planète la plus chaude', factAr: 'أكثر الكواكب حرارة' },
  { id: 3, nameEn: 'Earth', nameNl: 'Aarde', nameDe: 'Erde', nameEs: 'Tierra', nameFr: 'Terre', nameAr: 'الأرض',
    factEn: 'The only planet known to have life', factNl: 'De enige planeet waarvan bekend is dat er leven is', factDe: 'Der einzige Planet, auf dem bekanntermaßen Leben existiert', factEs: 'El único planeta conocido con vida', factFr: 'La seule planète connue abritant la vie', factAr: 'الكوكب الوحيد المعروف بوجود حياة عليه' },
  { id: 4, nameEn: 'Mars', nameNl: 'Mars', nameDe: 'Mars', nameEs: 'Marte', nameFr: 'Mars', nameAr: 'المريخ',
    factEn: 'Known as the Red Planet', factNl: 'Bekend als de Rode Planeet', factDe: 'Bekannt als der Rote Planet', factEs: 'Conocido como el Planeta Rojo', factFr: 'Connue sous le nom de Planète Rouge', factAr: 'يُعرف بالكوكب الأحمر' },
  { id: 5, nameEn: 'Jupiter', nameNl: 'Jupiter', nameDe: 'Jupiter', nameEs: 'Júpiter', nameFr: 'Jupiter', nameAr: 'المشتري',
    factEn: 'The largest planet', factNl: 'De grootste planeet', factDe: 'Der größte Planet', factEs: 'El planeta más grande', factFr: 'La plus grande planète', factAr: 'أكبر كوكب' },
  { id: 6, nameEn: 'Saturn', nameNl: 'Saturnus', nameDe: 'Saturn', nameEs: 'Saturno', nameFr: 'Saturne', nameAr: 'زحل',
    factEn: 'Famous for its wide rings', factNl: 'Beroemd om zijn brede ringen', factDe: 'Berühmt für seine breiten Ringe', factEs: 'Famoso por sus amplios anillos', factFr: 'Célèbre pour ses larges anneaux', factAr: 'مشهور بحلقاته الواسعة' },
  { id: 7, nameEn: 'Uranus', nameNl: 'Uranus', nameDe: 'Uranus', nameEs: 'Urano', nameFr: 'Uranus', nameAr: 'أورانوس',
    factEn: 'Spins on its side', factNl: 'Draait op zijn zij', factDe: 'Rotiert auf der Seite', factEs: 'Gira de lado', factFr: 'Tourne sur le côté', factAr: 'يدور على جانبه' },
  { id: 8, nameEn: 'Neptune', nameNl: 'Neptunus', nameDe: 'Neptun', nameEs: 'Neptuno', nameFr: 'Neptune', nameAr: 'نبتون',
    factEn: 'The windiest planet', factNl: 'De winderigste planeet', factDe: 'Der windigste Planet', factEs: 'El planeta con más viento', factFr: 'La planète la plus venteuse', factAr: 'أكثر الكواكب رياحًا' },
];

export function nameFor(item: Planet): string {
  switch (getLang()) {
    case 'nl': return item.nameNl;
    case 'de': return item.nameDe;
    case 'es': return item.nameEs;
    case 'fr': return item.nameFr;
    case 'ar': return item.nameAr;
    default: return item.nameEn;
  }
}

export function factFor(item: Planet): string {
  switch (getLang()) {
    case 'nl': return item.factNl;
    case 'de': return item.factDe;
    case 'es': return item.factEs;
    case 'fr': return item.factFr;
    case 'ar': return item.factAr;
    default: return item.factEn;
  }
}

const PLANETS_BY_ID = new Map(PLANETS.map((p) => [p.id, p]));

function pick(ids: number[]): number[] {
  return ids;
}

const ROUNDS: Record<string, number[][]> = {
  easy: [
    pick([1, 3, 5, 8]),
    pick([1, 2, 4, 6]),
    pick([2, 3, 5, 7]),
  ],
  medium: [
    pick([1, 2, 3, 4, 5]),
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
    const planet = PLANETS_BY_ID.get(id)!;
    return { id: planet.id, label: nameFor(planet) };
  });
}
