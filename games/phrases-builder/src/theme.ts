export const COLORS = {
  bg: 0x0d1f18,
  panel: 0x163d2e,
  panelLight: 0x1f5441,
  accent: 0x4fd9a0,
  accentLight: 0xcdf7e6,
  text: '#eafaf3',
  textMuted: '#9fccb8',
  slotEmpty: 0x0f2419,
  slotFilled: 0x1f5441,
  tile: 0x163d2e,
  tileWrong: 0x7a2f3a,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
