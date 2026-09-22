export const COLORS = {
  bg: 0x0a0f1f,
  panel: 0x161f3d,
  panelLight: 0x1e2a4a,
  accent: 0x7c93e0,
  accentLight: 0xd6def7,
  text: '#eaeefb',
  textMuted: '#9fabd9',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x1b2540,
  placedBg: 0x2e4a5a,
  cardBack: 0x161f3d,
  cardFront: 0x1e2a4a,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
