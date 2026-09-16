export const COLORS = {
  bg: 0x0b1708,
  panel: 0x1c3d16,
  panelLight: 0x2a5a1e,
  accent: 0x6bcf4f,
  accentLight: 0xd6f7c2,
  text: '#eefbea',
  textMuted: '#a9c49f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x244a1b,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
