export const COLORS = {
  bg: 0x081716,
  panel: 0x163d38,
  panelLight: 0x1e5a50,
  accent: 0x4fe0c9,
  accentLight: 0xc2f7ef,
  text: '#eafbf7',
  textMuted: '#9fc4bd',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x1b4a44,
  cardBack: 0x163d38,
  cardFront: 0x1e5a50,
  placedBg: 0x1e5a50,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
