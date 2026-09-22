export const COLORS = {
  bg: 0x0f0f1a,
  panel: 0x1a1a35,
  panelLight: 0x222245,
  accent: 0x6b7ae0,
  accentLight: 0xd0d6f7,
  text: '#eeeefb',
  textMuted: '#a9afd9',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x171730,
  cardBack: 0x1a1a35,
  cardFront: 0x222245,
  placedBg: 0x222245,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
