export const COLORS = {
  bg: 0x1a0f1a,
  panel: 0x351a35,
  panelLight: 0x452245,
  accent: 0xe04fd0,
  accentLight: 0xf7c2ef,
  text: '#fbeafa',
  textMuted: '#d99fcf',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x301730,
  cardBack: 0x351a35,
  cardFront: 0x452245,
  placedBg: 0x452245,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
