export const COLORS = {
  bg: 0x1f1508,
  panel: 0x3a2712,
  panelLight: 0x4a3218,
  accent: 0xf0a850,
  accentLight: 0xffe0b0,
  text: '#fff6e8',
  textMuted: '#e0c090',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x2a1c0d,
  cardBack: 0x3a2712,
  cardFront: 0x4a3218,
  placedBg: 0x4a3218,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
