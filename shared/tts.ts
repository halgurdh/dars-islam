// Shared pronunciation policy layer, built on shared/piper-tts.ts. Every
// game's own Sfx.ts owns its tone SFX and mute state, and delegates actual
// speech here — one copy of "which voice for which language" and the
// Arabic-script guard, instead of one per game.

import { isPiperVoiceCached, prewarmVoice, speakWithPiper, stopPiper, type PiperVoiceId } from './piper-tts';

// Speech-synthesis language tags per UI mode. `arabic` and `ar` are the same
// tag under two keys: call sites that always want Arabic-script pronunciation
// regardless of UI language use `.arabic`; call sites that index by the
// current LangMode (which now includes 'ar' as a UI language) use `[lang]`.
export const SPEECH_LANG = {
  arabic: 'ar-SA',
  en: 'en-US',
  nl: 'nl-NL',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  ar: 'ar-SA',
} as const;

// Pronunciation always uses this free, modern neural voice per language —
// deliberately NOT the OS/browser's built-in speechSynthesis voices. Those
// vary wildly by device (Windows in particular ships 20-year-old SAPI
// voices like "Microsoft David" that sound dated next to Arabic/Dutch
// going through Piper), so using Piper uniformly for all three languages
// keeps quality consistent and predictable for every visitor, not just
// "whatever happens to be installed". Single-speaker models only — a
// multi-speaker model's speaker slot 0 is an unverifiable roll of the dice.
const PIPER_VOICE: Record<string, PiperVoiceId> = {
  'ar-SA': 'ar_JO-kareem-medium', // Modern Standard Arabic — the only Piper Arabic voice
  'en-US': 'en_US-lessac-high', // well-regarded, single-speaker, high quality tier
  // nl_NL's own voices are documented-broken in Piper (community reports:
  // "garbled", "not in Dutch") and the one working alternative (pim) isn't
  // hosted on the mirror this library pulls from. nl_BE (Belgian Dutch) is
  // the community-recommended working voice — different regional accent,
  // but correct, intelligible Dutch, which matters more here than accent.
  'nl-NL': 'nl_BE-nathalie-medium',
  'de-DE': 'de_DE-thorsten-high', // single-speaker, high quality tier — matches en_US
  'es-ES': 'es_ES-sharvard-medium', // best available single-speaker es_ES voice
  'fr-FR': 'fr_FR-siwis-medium', // well-regarded, widely-used single-speaker French voice
};

const ARABIC_SCRIPT = /[؀-ۿ]/;

// Defensive guard: the Arabic voice must only ever read actual Arabic
// script, and Latin-script text (transliterations/meanings) must never be
// handed to it — reading Latin letters with an Arabic voice engine doesn't
// "pronounce" them, it produces nonsense. Kept as an explicit check here
// (not just correct call sites) so a future bug upstream fails silent
// instead of mispronouncing.
function scriptMatchesLang(text: string, lang: string): boolean {
  const isArabicLang = lang.toLowerCase().startsWith('ar');
  const isArabicText = ARABIC_SCRIPT.test(text);
  return isArabicLang === isArabicText;
}

// True if this language is pronounceable at all (it always is, for the
// three languages every game here uses).
export function hasVoice(lang: string): boolean {
  return lang in PIPER_VOICE;
}

// True when speaking this language will trigger a first-time model
// download — lets the UI show a "downloading…" hint instead of just going
// quiet for a few seconds.
export async function needsDownload(lang: string): Promise<boolean> {
  const voiceId = PIPER_VOICE[lang];
  if (!voiceId) return false;
  return !(await isPiperVoiceCached(voiceId));
}

// Every call is a deliberate "speak this now" — always stops whatever is
// currently playing first. Callers are responsible for checking their own
// mute state before calling. Pronunciation via free, client-side neural TTS
// (Piper/ONNX Runtime Web) — no API keys, no server, no per-request cost.
export async function speak(text: string, lang: string): Promise<boolean> {
  if (!scriptMatchesLang(text, lang)) return false;

  const voiceId = PIPER_VOICE[lang];
  if (!voiceId) return false;

  stopSpeaking();
  try {
    await speakWithPiper(text, voiceId);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  stopPiper();
}

// Fire-and-forget: starts downloading this language's voice model in the
// background (e.g. as soon as a menu screen loads) instead of waiting for
// the visitor's first "Hear it" tap. Silently ignored if it fails — the
// normal speak() path still works, just with the usual first-time delay.
export function prewarm(lang: string): void {
  const voiceId = PIPER_VOICE[lang];
  if (!voiceId) return;
  void prewarmVoice(voiceId).catch(() => {});
}
