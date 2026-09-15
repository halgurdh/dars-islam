// Piper's Arabic voice reads the definite article "ال" fused straight into
// the root with no break (e.g. الْجَبَّار comes out as one run-on word),
// but every name in this list is transliterated with a hyphen there
// (Al-Jabbar, Ar-Rahman, ...) precisely because a speaker pauses briefly
// after it. This inserts that pause — as an Arabic comma, which espeak's
// phonemizer (Piper's backend) renders as a short break — right after the
// article, for speech only. The displayed Arabic text is never touched.
const DIACRITIC = '[ً-ْٰ]';
// Matches the "ال" article at the start of a word, optionally preceded by
// an attached "و" (wa-, "and") or "ذُو" (dhu-, "possessor of") proclitic —
// covers every name in the list, including the two that aren't simple
// Al-Root forms (Malik-ul-Mulk, Dhul-Jalali wal-Ikram).
const PROCLITIC_AND_ARTICLE = new RegExp(
  `^(?:ذُو|و${DIACRITIC}?)?ا${DIACRITIC}?ل${DIACRITIC}?`
);

export function toArabicSpeechText(arabic: string): string {
  return arabic
    .split(' ')
    .map((word) => {
      const match = word.match(PROCLITIC_AND_ARTICLE);
      const rawPrefix = match?.[0];
      if (!rawPrefix) return word;
      const rest = word.slice(rawPrefix.length);
      if (!rest) return word;
      // Drop the sukūn (no-vowel mark) from the article itself — stranded
      // right before a pause, Piper reads it as an audible sound instead of
      // silence. The pause already does the job the sukūn was marking.
      const prefix = rawPrefix.replace(/ْ/g, '');
      return `${prefix}، ${rest}`;
    })
    .join(' ');
}
