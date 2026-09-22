export const COLORS = {
  bg: 0x170817,
  panel: 0x3d163d,
  panelLight: 0x5a1e5a,
  accent: 0xd94fd9,
  accentLight: 0xf7c2f7,
  text: '#f9ecf9',
  textMuted: '#c0a0c0',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x4a1b4a,
  cardBack: 0x5a1e5a,
  cardFront: 0x3d163d,
  placedBg: 0x3d163d,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
