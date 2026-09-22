export const COLORS = {
  bg: 0x081715,
  panel: 0x163d3a,
  panelLight: 0x1e5a55,
  accent: 0x4fd9d0,
  accentLight: 0xc2f7f2,
  text: '#ecfaf9',
  textMuted: '#9fc4c0',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x1b4a46,
  cardBack: 0x163d3a,
  cardFront: 0x1e5a55,
  placedBg: 0x1e5a55,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
