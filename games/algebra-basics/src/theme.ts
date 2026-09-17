export const COLORS = {
  bg: 0x1a1a0f,
  panel: 0x35331a,
  panelLight: 0x454022,
  accent: 0xd9c94f,
  accentLight: 0xf7f0c2,
  text: '#fbfaea',
  textMuted: '#d9d29f',
  correct: 0x3d8f4f,
  wrong: 0xb04a4a,
  choiceBg: 0x302e17,
};

export const FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
