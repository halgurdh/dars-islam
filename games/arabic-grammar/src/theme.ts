export const COLORS = {
  bg: 0x120817,
  panel: 0x32163d,
  panelLight: 0x481e5a,
  accent: 0x9d4fe0,
  accentLight: 0xe0c2f7,
  text: '#f7eafb',
  textMuted: '#bfa0c4',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x3d1b4a,
  cardBack: 0x32163d,
  cardFront: 0x481e5a,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";
export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
