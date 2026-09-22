export const COLORS = {
  bg: 0x140d1c,
  panel: 0x2a163d,
  panelLight: 0x3a2054,
  accent: 0xa87ce0,
  accentLight: 0xe6d6f7,
  text: '#f3edfa',
  textMuted: '#b8a3cc',
  slotEmpty: 0x1c1027,
  slotFilled: 0x3e2a5c,
  tile: 0x2a163d,
  tileWrong: 0x7a2f3a,
  correct: 0x3d8f4f,
  wrong: 0x7a2f3a,
  choiceBg: 0x2a163d,
  cardBack: 0x2a163d,
  cardFront: 0x3a2054,
  placedBg: 0x3a2054,
};

export const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
export const LATIN_FONT = "'Segoe UI', system-ui, sans-serif";

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}
