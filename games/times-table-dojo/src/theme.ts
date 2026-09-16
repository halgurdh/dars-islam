export const COLORS = {
  bg: 0x171208,
  panel: 0x3d3016,
  panelLight: 0x5a481e,
  accent: 0xe0b34f,
  accentLight: 0xf7e3c2,
  text: '#faf5eb',
  textMuted: '#c4b8a0',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x4a3a1b,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
