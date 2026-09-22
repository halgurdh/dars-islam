export const COLORS = {
  bg: 0x0d2b26,
  panel: 0x16413a,
  panelLight: 0x1e5a4f,
  accent: 0xe0a84c,
  accentLight: 0xf5d69e,
  text: '#f5f2e9',
  textMuted: '#a9c4bd',
  cardBack: 0x1b4332,
  cardFront: 0x244c40,
  matched: 0x2f6b4f,
  correct: 0x5fa678,
  wrong: 0xc0503a,
  choiceBg: 0x1e5a4f,
  placedBg: 0x2f6b4f,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
