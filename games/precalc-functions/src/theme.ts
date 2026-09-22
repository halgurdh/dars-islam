export const COLORS = {
  bg: 0x0a1a17,
  panel: 0x10352c,
  panelLight: 0x16453a,
  accent: 0x4fe0b8,
  accentLight: 0xc2f7e9,
  text: '#eafbf6',
  textMuted: '#9fd9c7',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x0d3026,
  cardBack: 0x10352c,
  cardFront: 0x16453a,
  placedBg: 0x16453a,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
