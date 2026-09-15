// Shared language-state mechanism — the SAME code every game used to
// duplicate in its own Locale.ts (get/set/toggle/detect), now written once.
// A factory, not a singleton: each game still needs its own localStorage
// key so switching language in one game doesn't affect another — same
// per-game-namespacing reasoning as Progress/Sfx's own keys.
export type LangMode = 'en' | 'nl' | 'de' | 'es' | 'fr';

// The order toggleLang() cycles through.
const CYCLE: LangMode[] = ['en', 'nl', 'de', 'es', 'fr'];

export interface Locale {
  getLang(): LangMode;
  setLang(lang: LangMode): void;
  toggleLang(): LangMode;
  detectDefaultLang(): Promise<void>;
}

export function createLocale(namespace: string): Locale {
  const LANG_KEY = `${namespace}:lang`;
  let currentLang: LangMode = (localStorage.getItem(LANG_KEY) as LangMode | null) ?? 'en';

  function getLang(): LangMode {
    return currentLang;
  }

  function setLang(lang: LangMode): void {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
  }

  function toggleLang(): LangMode {
    const idx = CYCLE.indexOf(currentLang);
    setLang(CYCLE[(idx + 1) % CYCLE.length]);
    return currentLang;
  }

  // Free, key-less IP lookup — resolves the visitor's country and defaults
  // to the locally-relevant language on their very first visit. Only runs
  // once: if the user already has a stored preference (manual pick, or a
  // previous successful detection) this is a no-op. Network failures are
  // swallowed silently and simply retried on the next visit.
  async function detectDefaultLang(): Promise<void> {
    if (localStorage.getItem(LANG_KEY)) return;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch('https://ipapi.co/country/', { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return;
      const code = (await res.text()).trim().toUpperCase();
      if (localStorage.getItem(LANG_KEY)) return; // user picked one while we were waiting
      setLang(countryToLang(code));
    } catch {
      // Offline, blocked, or rate-limited — keep the English default for now.
    }
  }

  return { getLang, setLang, toggleLang, detectDefaultLang };
}

function countryToLang(code: string): LangMode {
  if (code === 'NL') return 'nl';
  if (code === 'DE' || code === 'AT') return 'de';
  if (code === 'FR') return 'fr';
  if (['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE'].includes(code)) return 'es';
  return 'en';
}
