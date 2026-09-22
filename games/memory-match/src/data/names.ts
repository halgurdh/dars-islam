import { getLang } from '../systems/Locale';

export interface NamedItem {
  id: number;
  icon: string;
  nameEn: string;
  nameNl: string;
  nameDe: string;
  nameEs: string;
  nameFr: string;
  /** Approximate real-world size in meters — used to order items by "which is bigger?" for the Size Sort mode. */
  size: number;
}

// Everyday objects and animals — no Arabic/Islamic content, this is the
// generic sibling of Asma Match: match the picture to its name. Sizes are
// deliberately spread across wildly different scales (a fruit up to the
// Sun) so Size Sort tests real-world intuition, not a memorized sequence.
export const MATCH_ITEMS: NamedItem[] = [
  { id: 1, icon: '🐶', nameEn: 'Dog', nameNl: 'Hond', nameDe: 'Hund', nameEs: 'Perro', nameFr: 'Chien', size: 0.6 },
  { id: 2, icon: '🐱', nameEn: 'Cat', nameNl: 'Kat', nameDe: 'Katze', nameEs: 'Gato', nameFr: 'Chat', size: 0.45 },
  { id: 3, icon: '🐟', nameEn: 'Fish', nameNl: 'Vis', nameDe: 'Fisch', nameEs: 'Pez', nameFr: 'Poisson', size: 0.25 },
  { id: 4, icon: '🐦', nameEn: 'Bird', nameNl: 'Vogel', nameDe: 'Vogel', nameEs: 'Pájaro', nameFr: 'Oiseau', size: 0.3 },
  { id: 5, icon: '🐘', nameEn: 'Elephant', nameNl: 'Olifant', nameDe: 'Elefant', nameEs: 'Elefante', nameFr: 'Éléphant', size: 6.5 },
  { id: 6, icon: '🦁', nameEn: 'Lion', nameNl: 'Leeuw', nameDe: 'Löwe', nameEs: 'León', nameFr: 'Lion', size: 2.5 },
  { id: 7, icon: '⭐', nameEn: 'Star', nameNl: 'Ster', nameDe: 'Stern', nameEs: 'Estrella', nameFr: 'Étoile', size: 0.1 },
  { id: 8, icon: '☀️', nameEn: 'Sun', nameNl: 'Zon', nameDe: 'Sonne', nameEs: 'Sol', nameFr: 'Soleil', size: 1_391_000_000 },
  { id: 9, icon: '🌙', nameEn: 'Moon', nameNl: 'Maan', nameDe: 'Mond', nameEs: 'Luna', nameFr: 'Lune', size: 3_474_800 },
  { id: 10, icon: '🌳', nameEn: 'Tree', nameNl: 'Boom', nameDe: 'Baum', nameEs: 'Árbol', nameFr: 'Arbre', size: 20 },
  { id: 11, icon: '🍎', nameEn: 'Apple', nameNl: 'Appel', nameDe: 'Apfel', nameEs: 'Manzana', nameFr: 'Pomme', size: 0.08 },
  { id: 12, icon: '🚗', nameEn: 'Car', nameNl: 'Auto', nameDe: 'Auto', nameEs: 'Coche', nameFr: 'Voiture', size: 4.5 },
];

export function nameFor(item: NamedItem): string {
  switch (getLang()) {
    case 'nl': return item.nameNl;
    case 'de': return item.nameDe;
    case 'es': return item.nameEs;
    case 'fr': return item.nameFr;
    default: return item.nameEn;
  }
}
