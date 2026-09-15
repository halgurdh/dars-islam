export const COLORS = {
  bg: 0x1c1108,
  panel: 0x3d2a16,
  panelLight: 0x54391f,
  accent: 0xe08a4f,
  accentLight: 0xf7d9c2,
  text: '#faf1e6',
  textMuted: '#ccae94',
  slotEmpty: 0x241708,
  slotFilled: 0x4a3018,
  tile: 0x3d2a16,
  tileWrong: 0x7a2f3a,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
