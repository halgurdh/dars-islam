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
  country: string;
  capital: string;
  areaKm2: number;
}

export const COUNTRIES: Country[] = [
  { id: 1, country: 'France', capital: 'Paris', areaKm2: 551_695 },
  { id: 2, country: 'Japan', capital: 'Tokyo', areaKm2: 377_975 },
  { id: 3, country: 'Egypt', capital: 'Cairo', areaKm2: 1_002_450 },
  { id: 4, country: 'Italy', capital: 'Rome', areaKm2: 301_340 },
  { id: 5, country: 'Canada', capital: 'Ottawa', areaKm2: 9_984_670 },
  { id: 6, country: 'Australia', capital: 'Canberra', areaKm2: 7_692_024 },
  { id: 7, country: 'Brazil', capital: 'Brasília', areaKm2: 8_515_767 },
  { id: 8, country: 'Germany', capital: 'Berlin', areaKm2: 357_022 },
  { id: 9, country: 'Spain', capital: 'Madrid', areaKm2: 505_990 },
  { id: 10, country: 'Mexico', capital: 'Mexico City', areaKm2: 1_964_375 },
];
