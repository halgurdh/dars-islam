export const COLORS = {
  bg: 0x170a11,
  panel: 0x3d1628,
  panelLight: 0x5a1e3a,
  accent: 0xe04f95,
  accentLight: 0xf7c2da,
  text: '#fbeaf2',
  textMuted: '#c49fb0',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x4a1b32,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
