export const COLORS = {
  bg: 0x0f1a14,
  panel: 0x1a3524,
  panelLight: 0x234530,
  accent: 0x4fd97a,
  accentLight: 0xc2f7d9,
  text: '#eafbf0',
  textMuted: '#9fd9b8',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x17301f,
  cardBack: 0x1a3524,
  cardFront: 0x234530,
  placedBg: 0x234530,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
