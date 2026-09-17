export const COLORS = {
  bg: 0x0a1a1f,
  panel: 0x163540,
  panelLight: 0x1e4550,
  accent: 0x4fb8e0,
  accentLight: 0xc2ecf7,
  text: '#eaf7fb',
  textMuted: '#9fc9d9',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x1b3d4a,
  cardBack: 0x163540,
  cardFront: 0x1e4550,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
