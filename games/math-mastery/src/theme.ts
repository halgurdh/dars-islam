export const COLORS = {
  bg: 0x170b08,
  panel: 0x3d1f16,
  panelLight: 0x5a2e1e,
  accent: 0xe0574f,
  accentLight: 0xf7c2ba,
  text: '#fbeeeb',
  textMuted: '#c4a89f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x4a2318,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
