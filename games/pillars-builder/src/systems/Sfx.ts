// Minimal, self-contained sound-effect engine.
// No music, no audio files — just a couple of short synthesized tones,
// quiet by default, and a persistent mute toggle. Actual pronunciation is
// delegated to @shared/tts (shared across every game); this file only owns
// this game's own tone design and mute state.

import {
  hasVoice as sharedHasVoice,
  needsDownload as sharedNeedsDownload,
  prewarm as sharedPrewarm,
  speak as sharedSpeak,
  stopSpeaking as sharedStopSpeaking,
} from '@shared/tts';

const MUTE_KEY = 'pillars-builder:muted';

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

  tap(): void {
    this.tone(420, 80, 0.05);
  }

  correct(): void {
    this.tone(660, 90, 0.05);
  }

  wrong(): void {
    this.tone(220, 90, 0.04);
  }

  solved(): void {
    this.tone(660, 100, 0.06);
    setTimeout(() => this.tone(880, 120, 0.06), 90);
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

  hasVoice(lang: string): boolean {
    return !this.muted && sharedHasVoice(lang);
  }

  async needsDownload(lang: string): Promise<boolean> {
    return sharedNeedsDownload(lang);
  }

  // Every call is a deliberate "speak this now" — always stops whatever is
  // currently playing first.
  async speak(text: string, lang: string): Promise<boolean> {
    if (this.muted) return false;
    return sharedSpeak(text, lang);
  }

  stopSpeaking(): void {
    sharedStopSpeaking();
  }

  // Fire-and-forget model download, started early (e.g. on menu load) so
  // the first real "Hear it" tap doesn't pay the download wait.
  prewarm(lang: string): void {
    if (!this.muted) sharedPrewarm(lang);
  }
}

export const sfx = new SfxEngine();
