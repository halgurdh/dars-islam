import type { MatchItem } from '@shared/match-kit';

export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 4 },
  { id: 'medium', pairs: 6 },
  { id: 'hard', pairs: 8 },
];

// Singular ↔ sound plural — only words that genuinely take the regular
// sound plural (masculine ون, feminine ات), same accuracy rule as before.
export const ITEMS: MatchItem[] = [
  { id: 1, sideA: 'معلم', sideB: 'معلمون' },
  { id: 2, sideA: 'مهندس', sideB: 'مهندسون' },
  { id: 3, sideA: 'مسلم', sideB: 'مسلمون' },
  { id: 4, sideA: 'كاتب', sideB: 'كاتبون' },
  { id: 5, sideA: 'معلمة', sideB: 'معلمات' },
  { id: 6, sideA: 'طالبة', sideB: 'طالبات' },
  { id: 7, sideA: 'مسلمة', sideB: 'مسلمات' },
  { id: 8, sideA: 'سيارة', sideB: 'سيارات' },
];
