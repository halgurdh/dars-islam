// Lenient text-answer checking for the "type the translation" practice
// mode. Case/punctuation/whitespace differences shouldn't fail an answer
// that's otherwise correct — e.g. "In the name of Allah." and "in the name
// of allah" both count.
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ');
}

export function isCorrectAnswer(typed: string, target: string): boolean {
  const t = normalizeAnswer(typed);
  return t.length > 0 && t === normalizeAnswer(target);
}
