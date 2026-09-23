import type { LangMode } from './locale';

// Bridges the ProgressBar widget's language picker (a persistent DOM
// overlay, visible during live gameplay in every game) to whichever
// gameplay scene is currently active, so picking a language mid-round
// updates that scene's own content language too — not just the widget's
// own independent UI text. A simple module-level slot, not a queue: only
// one Quiz/Match/Sequence scene is ever active at a time, and each scene
// registers itself in create() and unregisters on shutdown.
interface ActiveGameLocaleHooks {
  setLang: (lang: LangMode) => void;
  /** Re-renders chrome text (round/score/moves/mistakes/menu-button labels)
   *  in the new language WITHOUT touching in-progress question/board state. */
  refreshChrome: () => void;
}

let active: ActiveGameLocaleHooks | null = null;

export function registerActiveGameLocale(hooks: ActiveGameLocaleHooks): void {
  active = hooks;
}

export function unregisterActiveGameLocale(hooks: ActiveGameLocaleHooks): void {
  // Only clear if we're still the currently-registered scene — guards
  // against a stale async unregister call clobbering a newer scene that
  // already registered itself (e.g. rapid scene transitions).
  if (active === hooks) active = null;
}

/** Called by the ProgressBar's language picker. No-op outside active gameplay. */
export function notifyActiveGameLanguageChange(lang: LangMode): void {
  if (!active) return;
  active.setLang(lang);
  active.refreshChrome();
}
