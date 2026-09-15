export const COLORS = {
  bg: 0x0e1730,
  panel: 0x16223d,
  panelLight: 0x1f3157,
  accent: 0x5fb3d9,
  accentLight: 0xcdeaf7,
  text: '#eef4fa',
  textMuted: '#9fb3cc',
  slotEmpty: 0x1a2847,
  slotFilled: 0x24406e,
  tile: 0x1f3157,
  tileWrong: 0x7a2f3a,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
