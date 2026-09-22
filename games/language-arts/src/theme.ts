export const COLORS = {
  bg: 0x1a0f1f,
  panel: 0x2e1638,
  panelLight: 0x3d1e4a,
  accent: 0xc94fe0,
  accentLight: 0xf0c2f7,
  text: '#f7eafb',
  textMuted: '#c9a0d9',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x2b1533,
  cardBack: 0x2e1638,
  cardFront: 0x3d1e4a,
  placedBg: 0x3d1e4a,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
