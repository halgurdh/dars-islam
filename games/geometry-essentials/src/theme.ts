export const COLORS = {
  bg: 0x08131a,
  panel: 0x16324a,
  panelLight: 0x1e4560,
  accent: 0x4f9de0,
  accentLight: 0xc2e0f7,
  text: '#eaf3fb',
  textMuted: '#9fb8c9',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x1b3d54,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
