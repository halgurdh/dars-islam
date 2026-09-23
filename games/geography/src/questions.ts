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

// Country ↔ capital, with approximate land area (km²) so Size Sort can test
// real "which country is bigger?" intuition instead of an alphabetical sort.
export interface Country {
  id: number;
  countryEn: string; countryNl: string; countryDe: string; countryEs: string; countryFr: string; countryAr: string;
  capitalEn: string; capitalNl: string; capitalDe: string; capitalEs: string; capitalFr: string; capitalAr: string;
  areaKm2: number;
}

export const COUNTRIES: Country[] = [
  { id: 1, countryEn: 'France', countryNl: 'Frankrijk', countryDe: 'Frankreich', countryEs: 'Francia', countryFr: 'France', countryAr: 'فرنسا',
    capitalEn: 'Paris', capitalNl: 'Parijs', capitalDe: 'Paris', capitalEs: 'París', capitalFr: 'Paris', capitalAr: 'باريس', areaKm2: 551_695 },
  { id: 2, countryEn: 'Japan', countryNl: 'Japan', countryDe: 'Japan', countryEs: 'Japón', countryFr: 'Japon', countryAr: 'اليابان',
    capitalEn: 'Tokyo', capitalNl: 'Tokio', capitalDe: 'Tokio', capitalEs: 'Tokio', capitalFr: 'Tokyo', capitalAr: 'طوكيو', areaKm2: 377_975 },
  { id: 3, countryEn: 'Egypt', countryNl: 'Egypte', countryDe: 'Ägypten', countryEs: 'Egipto', countryFr: 'Égypte', countryAr: 'مصر',
    capitalEn: 'Cairo', capitalNl: 'Caïro', capitalDe: 'Kairo', capitalEs: 'El Cairo', capitalFr: 'Le Caire', capitalAr: 'القاهرة', areaKm2: 1_002_450 },
  { id: 4, countryEn: 'Italy', countryNl: 'Italië', countryDe: 'Italien', countryEs: 'Italia', countryFr: 'Italie', countryAr: 'إيطاليا',
    capitalEn: 'Rome', capitalNl: 'Rome', capitalDe: 'Rom', capitalEs: 'Roma', capitalFr: 'Rome', capitalAr: 'روما', areaKm2: 301_340 },
  { id: 5, countryEn: 'Canada', countryNl: 'Canada', countryDe: 'Kanada', countryEs: 'Canadá', countryFr: 'Canada', countryAr: 'كندا',
    capitalEn: 'Ottawa', capitalNl: 'Ottawa', capitalDe: 'Ottawa', capitalEs: 'Ottawa', capitalFr: 'Ottawa', capitalAr: 'أوتاوا', areaKm2: 9_984_670 },
  { id: 6, countryEn: 'Australia', countryNl: 'Australië', countryDe: 'Australien', countryEs: 'Australia', countryFr: 'Australie', countryAr: 'أستراليا',
    capitalEn: 'Canberra', capitalNl: 'Canberra', capitalDe: 'Canberra', capitalEs: 'Canberra', capitalFr: 'Canberra', capitalAr: 'كانبرا', areaKm2: 7_692_024 },
  { id: 7, countryEn: 'Brazil', countryNl: 'Brazilië', countryDe: 'Brasilien', countryEs: 'Brasil', countryFr: 'Brésil', countryAr: 'البرازيل',
    capitalEn: 'Brasília', capitalNl: 'Brasilia', capitalDe: 'Brasília', capitalEs: 'Brasilia', capitalFr: 'Brasilia', capitalAr: 'برازيليا', areaKm2: 8_515_767 },
  { id: 8, countryEn: 'Germany', countryNl: 'Duitsland', countryDe: 'Deutschland', countryEs: 'Alemania', countryFr: 'Allemagne', countryAr: 'ألمانيا',
    capitalEn: 'Berlin', capitalNl: 'Berlijn', capitalDe: 'Berlin', capitalEs: 'Berlín', capitalFr: 'Berlin', capitalAr: 'برلين', areaKm2: 357_022 },
  { id: 9, countryEn: 'Spain', countryNl: 'Spanje', countryDe: 'Spanien', countryEs: 'España', countryFr: 'Espagne', countryAr: 'إسبانيا',
    capitalEn: 'Madrid', capitalNl: 'Madrid', capitalDe: 'Madrid', capitalEs: 'Madrid', capitalFr: 'Madrid', capitalAr: 'مدريد', areaKm2: 505_990 },
  { id: 10, countryEn: 'Mexico', countryNl: 'Mexico', countryDe: 'Mexiko', countryEs: 'México', countryFr: 'Mexique', countryAr: 'المكسيك',
    capitalEn: 'Mexico City', capitalNl: 'Mexico-Stad', capitalDe: 'Mexiko-Stadt', capitalEs: 'Ciudad de México', capitalFr: 'Mexico', capitalAr: 'مدينة مكسيكو', areaKm2: 1_964_375 },
];

export function countryFor(item: Country): string {
  switch (getLang()) {
    case 'nl': return item.countryNl;
    case 'de': return item.countryDe;
    case 'es': return item.countryEs;
    case 'fr': return item.countryFr;
    case 'ar': return item.countryAr;
    default: return item.countryEn;
  }
}

export function capitalFor(item: Country): string {
  switch (getLang()) {
    case 'nl': return item.capitalNl;
    case 'de': return item.capitalDe;
    case 'es': return item.capitalEs;
    case 'fr': return item.capitalFr;
    case 'ar': return item.capitalAr;
    default: return item.capitalEn;
  }
}
