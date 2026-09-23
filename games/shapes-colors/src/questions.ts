import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import { getLang } from './systems/Locale';
import { t } from './i18n';

export interface Difficulty {
  id: string;
  totalQuestions: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'shapes', totalQuestions: 8 },
  { id: 'colors', totalQuestions: 8 },
  { id: 'mixed', totalQuestions: 10 },
];

interface Named {
  nameEn: string; nameNl: string; nameDe: string; nameEs: string; nameFr: string; nameAr: string;
  emoji: string;
  brightness?: number;
}

function nameFor(item: Named): string {
  switch (getLang()) {
    case 'nl': return item.nameNl;
    case 'de': return item.nameDe;
    case 'es': return item.nameEs;
    case 'fr': return item.nameFr;
    case 'ar': return item.nameAr;
    default: return item.nameEn;
  }
}

const SHAPES: Named[] = [
  { nameEn: 'Circle', nameNl: 'Cirkel', nameDe: 'Kreis', nameEs: 'Círculo', nameFr: 'Cercle', nameAr: 'دائرة', emoji: '⚪' },
  { nameEn: 'Square', nameNl: 'Vierkant', nameDe: 'Quadrat', nameEs: 'Cuadrado', nameFr: 'Carré', nameAr: 'مربع', emoji: '⬛' },
  { nameEn: 'Triangle', nameNl: 'Driehoek', nameDe: 'Dreieck', nameEs: 'Triángulo', nameFr: 'Triangle', nameAr: 'مثلث', emoji: '🔺' },
  { nameEn: 'Star', nameNl: 'Ster', nameDe: 'Stern', nameEs: 'Estrella', nameFr: 'Étoile', nameAr: 'نجمة', emoji: '⭐' },
  { nameEn: 'Heart', nameNl: 'Hart', nameDe: 'Herz', nameEs: 'Corazón', nameFr: 'Cœur', nameAr: 'قلب', emoji: '❤️' },
  { nameEn: 'Diamond', nameNl: 'Ruit', nameDe: 'Raute', nameEs: 'Rombo', nameFr: 'Losange', nameAr: 'معين', emoji: '🔷' },
];

// brightness = perceived luminance (0.299R + 0.587G + 0.114B) of each
// dot's typical color, darkest to lightest — used by Sequence mode so
// ordering tests real "which looks lighter?" judgment instead of reciting
// the rainbow (ROYGBIV is just as rote-memorizable as the alphabet).
const HUES: Named[] = [
  { nameEn: 'Red', nameNl: 'Rood', nameDe: 'Rot', nameEs: 'Rojo', nameFr: 'Rouge', nameAr: 'أحمر', emoji: '🔴', brightness: 75 },
  { nameEn: 'Orange', nameNl: 'Oranje', nameDe: 'Orange', nameEs: 'Naranja', nameFr: 'Orange', nameAr: 'برتقالي', emoji: '🟠', brightness: 164 },
  { nameEn: 'Yellow', nameNl: 'Geel', nameDe: 'Gelb', nameEs: 'Amarillo', nameFr: 'Jaune', nameAr: 'أصفر', emoji: '🟡', brightness: 196 },
  { nameEn: 'Green', nameNl: 'Groen', nameDe: 'Grün', nameEs: 'Verde', nameFr: 'Vert', nameAr: 'أخضر', emoji: '🟢', brightness: 162 },
  { nameEn: 'Blue', nameNl: 'Blauw', nameDe: 'Blau', nameEs: 'Azul', nameFr: 'Bleu', nameAr: 'أزرق', emoji: '🔵', brightness: 101 },
  { nameEn: 'Purple', nameNl: 'Paars', nameDe: 'Lila', nameEs: 'Morado', nameFr: 'Violet', nameAr: 'بنفسجي', emoji: '🟣', brightness: 126 },
  { nameEn: 'Brown', nameNl: 'Bruin', nameDe: 'Braun', nameEs: 'Marrón', nameFr: 'Marron', nameAr: 'بني', emoji: '🟤', brightness: 107 },
];

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickChoices(pool: Named[], correct: Named): { choices: string[]; correctIndex: number } {
  const others = shuffle(pool.filter((n) => n.nameEn !== correct.nameEn)).slice(0, 3);
  const arr = shuffle([correct, ...others]);
  return { choices: arr.map((n) => nameFor(n)), correctIndex: arr.findIndex((n) => n.nameEn === correct.nameEn) };
}

function shapeQuestion(): QuizQuestion {
  const shape = SHAPES[randInt(0, SHAPES.length - 1)];
  const { choices, correctIndex } = pickChoices(SHAPES, shape);
  return { prompt: shape.emoji, sub: t().promptShape, choices, correctIndex };
}

function colorQuestion(): QuizQuestion {
  const hue = HUES[randInt(0, HUES.length - 1)];
  const { choices, correctIndex } = pickChoices(HUES, hue);
  return { prompt: hue.emoji, sub: t().promptColor, choices, correctIndex };
}

function oddOneOutQuestion(): QuizQuestion {
  const sameHue = HUES[randInt(0, HUES.length - 1)];
  const otherHues = shuffle(HUES.filter((h) => h.nameEn !== sameHue.nameEn));
  // Represent 3 same-color choices with color dots, and 1 different-color dot as the odd one.
  const choices = shuffle([sameHue.emoji, sameHue.emoji, sameHue.emoji, otherHues[0].emoji]);
  // Only one entry is the different color; find its index (dedupe-safe since emoji are unique per hue).
  const correctIndex = choices.indexOf(otherHues[0].emoji);
  return { prompt: '🔎', sub: t().promptOddColor, choices, correctIndex };
}

export function generateQuestion(difficulty: Difficulty, index: number): QuizQuestion {
  if (difficulty.id === 'shapes') return shapeQuestion();
  if (difficulty.id === 'colors') return colorQuestion();
  // mixed: rotate through all three question styles
  const kind = index % 3;
  if (kind === 0) return shapeQuestion();
  if (kind === 1) return colorQuestion();
  return oddOneOutQuestion();
}

// Match: every shape and color is already a unique emoji/name pair, so no
// distinct-value dedup is needed — just shuffle the combined pool.
const MATCH_POOL: Named[] = [...SHAPES, ...HUES];

export function generateMatchItems(pairs: number): MatchItem[] {
  return shuffle(MATCH_POOL).slice(0, Math.min(pairs, MATCH_POOL.length)).map((n, i) => ({
    id: i,
    sideA: n.emoji,
    sideB: nameFor(n),
  }));
}

export function generateSequenceRound(count: number): SequenceItem[] {
  const n = Math.min(count, HUES.length);
  const picked = shuffle(HUES).slice(0, n).sort((a, b) => (a.brightness ?? 0) - (b.brightness ?? 0));
  return picked.map((h, i) => ({ id: i, label: `${h.emoji} ${nameFor(h)}` }));
}
