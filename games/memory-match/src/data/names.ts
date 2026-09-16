export interface MatchItem {
  id: number;
  icon: string;
  nameEn: string;
  nameNl: string;
  nameDe: string;
  nameEs: string;
  nameFr: string;
}

// Everyday objects and animals — no Arabic/Islamic content, this is the
// generic sibling of Asma Match: match the picture to its name.
export const MATCH_ITEMS: MatchItem[] = [
  { id: 1, icon: '🐶', nameEn: 'Dog', nameNl: 'Hond', nameDe: 'Hund', nameEs: 'Perro', nameFr: 'Chien' },
  { id: 2, icon: '🐱', nameEn: 'Cat', nameNl: 'Kat', nameDe: 'Katze', nameEs: 'Gato', nameFr: 'Chat' },
  { id: 3, icon: '🐟', nameEn: 'Fish', nameNl: 'Vis', nameDe: 'Fisch', nameEs: 'Pez', nameFr: 'Poisson' },
  { id: 4, icon: '🐦', nameEn: 'Bird', nameNl: 'Vogel', nameDe: 'Vogel', nameEs: 'Pájaro', nameFr: 'Oiseau' },
  { id: 5, icon: '🐘', nameEn: 'Elephant', nameNl: 'Olifant', nameDe: 'Elefant', nameEs: 'Elefante', nameFr: 'Éléphant' },
  { id: 6, icon: '🦁', nameEn: 'Lion', nameNl: 'Leeuw', nameDe: 'Löwe', nameEs: 'León', nameFr: 'Lion' },
  { id: 7, icon: '⭐', nameEn: 'Star', nameNl: 'Ster', nameDe: 'Stern', nameEs: 'Estrella', nameFr: 'Étoile' },
  { id: 8, icon: '☀️', nameEn: 'Sun', nameNl: 'Zon', nameDe: 'Sonne', nameEs: 'Sol', nameFr: 'Soleil' },
  { id: 9, icon: '🌙', nameEn: 'Moon', nameNl: 'Maan', nameDe: 'Mond', nameEs: 'Luna', nameFr: 'Lune' },
  { id: 10, icon: '🌳', nameEn: 'Tree', nameNl: 'Boom', nameDe: 'Baum', nameEs: 'Árbol', nameFr: 'Arbre' },
  { id: 11, icon: '🍎', nameEn: 'Apple', nameNl: 'Appel', nameDe: 'Apfel', nameEs: 'Manzana', nameFr: 'Pomme' },
  { id: 12, icon: '🚗', nameEn: 'Car', nameNl: 'Auto', nameDe: 'Auto', nameEs: 'Coche', nameFr: 'Voiture' },
];
