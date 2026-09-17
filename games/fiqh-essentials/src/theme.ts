export const COLORS = {
  bg: 0x0f1a1a,
  panel: 0x1a3535,
  panelLight: 0x224545,
  accent: 0x4fd9c4,
  accentLight: 0xc2f7ef,
  text: '#eafbf9',
  textMuted: '#9fd9cf',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x173030,
  placedBg: 0x2e5a45,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
