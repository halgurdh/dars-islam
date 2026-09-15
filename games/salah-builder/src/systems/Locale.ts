export type LangMode = 'en' | 'nl';

const LANG_KEY = 'salah-builder:lang';

let currentLang: LangMode = (localStorage.getItem(LANG_KEY) as LangMode | null) ?? 'en';

export function getLang(): LangMode {
  return currentLang;
}

export function setLang(lang: LangMode): void {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
}

export function toggleLang(): LangMode {
  setLang(currentLang === 'en' ? 'nl' : 'en');
  return currentLang;
}

// Free, key-less IP lookup — resolves the visitor's country and defaults
// Dutch (NL) visitors to the Dutch pairing on their very first visit.
// Only runs once: if the user already has a stored preference (manual pick,
// or a previous successful detection) this is a no-op. Network failures are
// swallowed silently and simply retried on the next visit.
export async function detectDefaultLang(): Promise<void> {
  if (localStorage.getItem(LANG_KEY)) return;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://ipapi.co/country/', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return;
    const code = (await res.text()).trim().toUpperCase();
    if (localStorage.getItem(LANG_KEY)) return; // user picked one while we were waiting
    setLang(code === 'NL' ? 'nl' : 'en');
  } catch {
    // Offline, blocked, or rate-limited — keep the English default for now.
  }
}
