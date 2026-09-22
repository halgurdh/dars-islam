export const COLORS = {
  bg: 0x081416,
  panel: 0x163538,
  panelLight: 0x1e4a50,
  accent: 0x4fc9d9,
  accentLight: 0xc2eff7,
  text: '#eafaf3',
  textMuted: '#9fccb8',
  slotEmpty: 0x0a1f22,
  slotFilled: 0x1e4a50,
  tile: 0x163538,
  tileWrong: 0x7a2f3a,
  correct: 0x3d8f4f,
  wrong: 0x7a2f3a,
  choiceBg: 0x163538,
  cardBack: 0x163538,
  cardFront: 0x1e4a50,
  placedBg: 0x1e4a50,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
