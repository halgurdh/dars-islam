export type TurboMusicState =
  | 'garage'
  | 'cruise'
  | 'drift'
  | 'finish'
  | 'shutdown';

const GAINS: Record<TurboMusicState, [number, number, number]> = {
  garage: [0.42, 0.0, 0.0],
  cruise: [0.68, 0.0, 0.0],
  drift: [0.68, 0.55, 0.42],
  finish: [0.68, 0.68, 0.0],
  shutdown: [0.0, 0.0, 0.0],
};

const LAYER_FILES = ['music/bg1.mp3', 'music/bg2.mp3', 'music/bg3.mp3'];
const FADE_SECONDS = 1.6;

class TurboMusicStateMachine {
  private state: TurboMusicState = 'garage';
  private audioContext: AudioContext | null = null;
  private gains: GainNode[] = [];
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initialized) {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }
      this.applyState();
      return;
    }

    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = this.loadAndStart();
    await this.initPromise;
  }

  transitionTo(next: TurboMusicState): void {
    this.state = next;
    if (this.initialized) {
      this.applyState();
    }
  }

  private async loadAndStart(): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      if (this.audioContext.state === 'suspended') {
        // Self-register an unlock handler so music resumes on first user gesture.
        const unlock = () => { void this.audioContext?.resume(); };
        document.addEventListener('pointerdown', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true, passive: true });
      }

      const buffers = await Promise.all(
        LAYER_FILES.map(async (path) => {
          const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
          if (!response.ok) {
            throw new Error(`Missing music layer: ${path}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          return this.audioContext!.decodeAudioData(arrayBuffer);
        }),
      );

      const initial = GAINS[this.state];
      buffers.forEach((buffer, index) => {
        const source = this.audioContext!.createBufferSource();
        const gain = this.audioContext!.createGain();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        gain.connect(this.audioContext!.destination);
        gain.gain.value = initial[index] ?? 0;
        source.start(0);
        this.gains.push(gain);
      });

      this.initialized = true;
      this.applyState();
    } catch (error) {
      console.warn('[Turbo Drift Music] Disabled after init failure.', error);
    } finally {
      this.initPromise = null;
    }
  }

  private applyState(): void {
    if (!this.audioContext || this.gains.length === 0) {
      return;
    }

    const targets = GAINS[this.state];
    const now = this.audioContext.currentTime;
    this.gains.forEach((gain, index) => {
      const target = targets[index] ?? 0;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(target, now + FADE_SECONDS);
    });
  }
}

export const turboMusic = new TurboMusicStateMachine();
