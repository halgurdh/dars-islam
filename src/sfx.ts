// Preload the click sound once; clone on each play so rapid presses overlap.
const _click = new Audio('assets/soundfx/button04a.mp3');
_click.preload = 'auto';

export function playClick(): void {
  const clone = _click.cloneNode() as HTMLAudioElement;
  clone.volume = 0.7;
  clone.play().catch(() => { /* autoplay blocked — silently ignore */ });
}
