export const COLORS = {
  bg: 0x170f08,
  panel: 0x3d2a16,
  panelLight: 0x5a3e1e,
  accent: 0xe0954f,
  accentLight: 0xf7dcc2,
  text: '#fbf1e8',
  textMuted: '#c4ab8f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x4a331b,
  cardBack: 0x3d2a16,
  cardFront: 0x5a3e1e,
  placedBg: 0x5a3e1e,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
