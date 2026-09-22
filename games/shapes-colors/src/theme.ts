export const COLORS = {
  bg: 0x081619,
  panel: 0x163540,
  panelLight: 0x1e4a58,
  accent: 0x4fb8e0,
  accentLight: 0xc2ecf7,
  text: '#eaf7fb',
  textMuted: '#9fc0c9',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x1b4551,
  cardBack: 0x163540,
  cardFront: 0x1e4a58,
  placedBg: 0x1e4a58,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
