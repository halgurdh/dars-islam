export const COLORS = {
  bg: 0x14100a,
  panel: 0x3d3220,
  panelLight: 0x5a4a2e,
  accent: 0xc9954f,
  accentLight: 0xf0ddc2,
  text: '#fbf5ea',
  textMuted: '#c4b49f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x4a3b22,
  placedBg: 0x3d5a2e,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
