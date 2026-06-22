import { musicManager } from './music';

// Preload the click sound once; clone on each play so rapid presses overlap.
const _click = new Audio('assets/soundfx/button04a.mp3');
_click.preload = 'auto';

export function playClick(): void {
  musicManager.init(); // idempotent — starts music on first user gesture
  const clone = _click.cloneNode() as HTMLAudioElement;
  clone.volume = 0.5;
  clone.play().catch(() => { /* autoplay blocked — silently ignore */ });
}

const _dice = new Audio('assets/soundfx/dices4.mp3');
_dice.preload = 'auto';

export function playDice(): void {
  const clone = _dice.cloneNode() as HTMLAudioElement;
  clone.volume = 0.7;
  clone.play().catch(() => { /* autoplay blocked — silently ignore */ });
}

export function playSplash(): void {
  const audio = new Audio('assets/splash.mp3');
  audio.volume = 0.7;
  audio.muted = true;
  audio.play().then(() => { audio.muted = false; }).catch(() => {});
}