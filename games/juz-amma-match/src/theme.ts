export const COLORS = {
  bg: 0x141208,
  panel: 0x3d3816,
  panelLight: 0x5a521e,
  accent: 0xd9c94f,
  accentLight: 0xf7f0c2,
  text: '#f5f2e9',
  textMuted: '#a9c4bd',
  cardBack: 0x332f16,
  cardFront: 0x494322,
  matched: 0x6b632f,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
