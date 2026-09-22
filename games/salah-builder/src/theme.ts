export const COLORS = {
  bg: 0x1c0e13,
  panel: 0x3d1620,
  panelLight: 0x54202f,
  accent: 0xe04f6a,
  accentLight: 0xf7c2cd,
  text: '#faeef1',
  textMuted: '#cc9fa9',
  slotEmpty: 0x240b11,
  slotFilled: 0x4a1f2b,
  tile: 0x3d1620,
  tileWrong: 0x7a2f3a,
  correct: 0x3d8f4f,
  wrong: 0x7a2f3a,
  choiceBg: 0x3d1620,
  cardBack: 0x3d1620,
  cardFront: 0x54202f,
  placedBg: 0x54202f,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
