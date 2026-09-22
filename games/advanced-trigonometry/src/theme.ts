export const COLORS = {
  bg: 0x1a0f0a,
  panel: 0x352010,
  panelLight: 0x452a16,
  accent: 0xe0854f,
  accentLight: 0xf7d9c2,
  text: '#fbf1ea',
  textMuted: '#d9b19f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x301c0d,
  cardBack: 0x352010,
  cardFront: 0x452a16,
  placedBg: 0x452a16,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
