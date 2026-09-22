export const COLORS = {
  bg: 0x0e1708,
  panel: 0x2a3d16,
  panelLight: 0x3d5a1e,
  accent: 0x7ae04f,
  accentLight: 0xdcf7c2,
  text: '#f2fbea',
  textMuted: '#b0c49f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x274a1b,
  cardBack: 0x2a3d16,
  cardFront: 0x3d5a1e,
  placedBg: 0x3d5a1e,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
