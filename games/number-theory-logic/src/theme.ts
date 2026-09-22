export const COLORS = {
  bg: 0x0f171a,
  panel: 0x1a3038,
  panelLight: 0x224048,
  accent: 0x4fc9e0,
  accentLight: 0xc2eff7,
  text: '#eafafb',
  textMuted: '#9fd0d9',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x172b32,
  cardBack: 0x1a3038,
  cardFront: 0x224048,
  placedBg: 0x224048,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
