export const COLORS = {
  bg: 0x170b0f,
  panel: 0x3d1c26,
  panelLight: 0x5a2a38,
  accent: 0xe06b8a,
  accentLight: 0xf7d0dc,
  text: '#fbeef1',
  textMuted: '#c49fac',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x4a2530,
  cardBack: 0x3d1c26,
  cardFront: 0x5a2a38,
  placedBg: 0x5a2a38,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
