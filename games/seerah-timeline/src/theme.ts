export const COLORS = {
  bg: 0x1f160a,
  panel: 0x3d2e16,
  panelLight: 0x4a3a1e,
  accent: 0xe0a94f,
  accentLight: 0xf7e3c2,
  text: '#fbf5ea',
  textMuted: '#d9c39f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x332813,
  placedBg: 0x4a5a2e,
  cardBack: 0x2e2410,
  cardFront: 0x4a3a1e,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
