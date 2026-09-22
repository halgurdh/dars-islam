export const COLORS = {
  bg: 0x08170e,
  panel: 0x163d20,
  panelLight: 0x1e5a2c,
  accent: 0x4fd97a,
  accentLight: 0xc2f7d9,
  text: '#f0f9f2',
  textMuted: '#a9c4b0',
  correct: 0x2f8f52,
  wrong: 0xb04a4a,
  choiceBg: 0x1b4a29,
  cardBack: 0x163d20,
  cardFront: 0x1e5a2c,
  placedBg: 0x1e5a2c,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
