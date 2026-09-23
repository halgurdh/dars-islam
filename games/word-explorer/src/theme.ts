export const COLORS = {
  bg: 0x0a1a20,
  panel: 0x14323d,
  panelLight: 0x1c4550,
  accent: 0x4fd6e0,
  accentLight: 0xc8f5f7,
  text: '#eafdff',
  textMuted: '#9fd9df',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x0f2530,
  cardBack: 0x14323d,
  cardFront: 0x1c4550,
  placedBg: 0x1c4550,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
