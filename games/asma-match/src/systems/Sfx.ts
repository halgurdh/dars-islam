// Minimal, self-contained sound-effect engine.
// No music, no audio files — just a couple of short synthesized tones,
// quiet by default, and a persistent mute toggle.

import { isPiperVoiceCached, speakWithPiper, stopPiper, type PiperVoiceId } from './PiperTts';

const MUTE_KEY = 'asma-match:muted';

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

class SfxEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = localStorage.getItem(MUTE_KEY) === '1';

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(freq: number, durationMs: number, volume: number): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.02);
  }

  flip(): void {
    this.tone(420, 80, 0.05);
  }

  match(): void {
    this.tone(660, 100, 0.06);
    setTimeout(() => this.tone(880, 120, 0.06), 90);
  }

  mismatch(): void {
    this.tone(220, 90, 0.04);
  }

  complete(): void {
    this.tone(523, 100, 0.06);
    setTimeout(() => this.tone(659, 100, 0.06), 100);
    setTimeout(() => this.tone(784, 160, 0.06), 200);
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    if (muted) this.stopSpeaking();
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // True if this language is pronounceable at all (it always is, for the
  // three languages this game actually uses).
  hasVoice(lang: string): boolean {
    return !this.muted && lang in PIPER_VOICE;
  }

  // True when speaking this language will trigger a first-time model
  // download — lets the UI show a "downloading…" hint instead of just
  // going quiet for a few seconds.
  async needsDownload(lang: string): Promise<boolean> {
    const voiceId = PIPER_VOICE[lang];
    if (!voiceId) return false;
    return !(await isPiperVoiceCached(voiceId));
  }

  // Every call is a deliberate "speak this now" — always stops whatever is
  // currently playing first. Pronunciation via free, client-side neural TTS
  // (Piper/ONNX Runtime Web) — no API keys, no server, no per-request cost.
  async speak(text: string, lang: string): Promise<boolean> {
    if (this.muted) return false;
    if (!scriptMatchesLang(text, lang)) return false;

    const voiceId = PIPER_VOICE[lang];
    if (!voiceId) return false;

    this.stopSpeaking();
    try {
      await speakWithPiper(text, voiceId);
      return true;
    } catch {
      return false;
    }
  }

  stopSpeaking(): void {
    stopPiper();
  }
}

export const sfx = new SfxEngine();
