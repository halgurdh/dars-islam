export const COLORS = {
  bg: 0x1a0f0f,
  panel: 0x3d1f1a,
  panelLight: 0x4a2620,
  accent: 0xe0704f,
  accentLight: 0xf7d4c2,
  text: '#fbf0ea',
  textMuted: '#d9a89f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x33201b,
  cardBack: 0x3d1f1a,
  cardFront: 0x4a2620,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
