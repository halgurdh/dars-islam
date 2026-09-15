export const COLORS = {
  bg: 0x0d1c21,
  panel: 0x16333d,
  panelLight: 0x1f4854,
  accent: 0x4fa8d9,
  accentLight: 0xcde8f7,
  text: '#eaf5fa',
  textMuted: '#9fbfcc',
  slotEmpty: 0x0f2027,
  slotFilled: 0x1f4854,
  tile: 0x16333d,
  tileWrong: 0x7a2f3a,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
