// The binding mechanism every game's i18n.ts duplicated (a STRINGS record
// keyed by language + a t() getter), not the content — the actual
// translated strings are inherently per-game and stay in each game's own
// i18n.ts.
import type { LangMode } from './locale';

export function createI18n<T>(strings: Record<LangMode, T>, getLang: () => LangMode): () => T {
  return () => strings[getLang()];
}
