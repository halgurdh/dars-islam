export const COLORS = {
  bg: 0x170d08,
  panel: 0x3d2416,
  panelLight: 0x5a3a1e,
  accent: 0xe0764f,
  accentLight: 0xf7d4c2,
  text: '#f5f2e9',
  textMuted: '#a9c4bd',
  cardBack: 0x33201b,
  cardFront: 0x493422,
  matched: 0x6b4a2f,
  correct: 0x5fa678,
  wrong: 0xc0503a,
  choiceBg: 0x5a3a1e,
  placedBg: 0x6b4a2f,
};

export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
