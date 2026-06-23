import { musicManager } from './music';

function makeAudio(src: string): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null;
  const audio = new Audio(src);
  audio.preload = 'auto';
  return audio;
}

// Preload browser sounds once; in Node tests these stay null.
const _click = makeAudio('assets/soundfx/button04a.mp3');

export function playClick(): void {
  if (!_click) return;
  musicManager.init(); // idempotent — starts music on first user gesture
  const clone = _click.cloneNode() as HTMLAudioElement;
  clone.volume = 0.5;
  clone.play().catch(() => { /* autoplay blocked — silently ignore */ });
}

const _dice = makeAudio('assets/soundfx/dices4.mp3');

export function playDice(): void {
  if (!_dice) return;
  const clone = _dice.cloneNode() as HTMLAudioElement;
  clone.volume = 0.7;
  clone.play().catch(() => { /* autoplay blocked — silently ignore */ });
}

const splashUrl = new URL('../shared/splash.mp3', import.meta.url).href;

export function playSplash(): void {
  if (typeof Audio === 'undefined') return;
  const audio = new Audio(splashUrl);
  audio.volume = 0.7;
  audio.muted = true;
  audio.play().then(() => { audio.muted = false; }).catch(() => {});
}
