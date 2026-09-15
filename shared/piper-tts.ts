// Free, client-side neural TTS fallback for when the device has no matching
// OS voice for a language (this happens a lot for Arabic/Dutch on Windows).
// Runs entirely in the browser via WebAssembly (Piper/ONNX Runtime Web, MIT
// licensed) — no server, no API key, no per-request cost. The voice model
// (~25-70MB) is fetched once from Hugging Face's public model CDN and then
// cached by the library in the browser's private filesystem (OPFS), so
// repeat use after the first is instant and fully offline.
//
// Heavy, so it's dynamically imported only the first time it's actually
// needed — a visitor who never taps "Hear it" never downloads any of this.
//
// Shared across every game (not per-game) so there's exactly one copy to
// patch — import.meta.env.BASE_URL below still resolves correctly per
// *importing* game at build time, so each game's own /ort/ wasm path (see
// serveOnnxWasm in shared/game-vite-plugins.ts) keeps working unchanged.

export type PiperVoiceId = 'ar_JO-kareem-medium' | 'nl_BE-nathalie-medium' | 'en_US-lessac-high';

type PiperModule = typeof import('@mintplex-labs/piper-tts-web');

let modulePromise: Promise<PiperModule> | null = null;
function loadModule(): Promise<PiperModule> {
  if (!modulePromise) {
    modulePromise = import('@mintplex-labs/piper-tts-web');
  }
  return modulePromise;
}

// The library keeps a single global TtsSession keyed by voice — switching
// languages means forcing it to reload the right model instead of silently
// reusing whichever one loaded first. See TtsSession in the library: its
// constructor returns the existing singleton (with the OLD model already
// loaded) unless we clear it ourselves first.
let loadedVoiceId: PiperVoiceId | null = null;

// Piper hands back a Blob to play manually (no built-in queue like
// speechSynthesis has) — tracked so a new request can stop it first instead
// of overlapping into a garbled mess. speak() in shared/tts.ts always calls
// stopPiper() before starting anything new, so this only ever holds at most
// one clip.
let currentAudio: HTMLAudioElement | null = null;

export type PiperProgress = { loaded: number; total: number };

export function stopPiper(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

// Core synthesis — used both by the (now build-time-only) audio generator
// script and, historically, by live in-browser playback. Returns a raw WAV
// blob; does not play anything.
export async function synthesize(
  text: string,
  voiceId: PiperVoiceId,
  onProgress?: (p: PiperProgress) => void
): Promise<Blob> {
  const piper = await loadModule();

  if (loadedVoiceId !== voiceId) {
    piper.TtsSession._instance = null;
    loadedVoiceId = voiceId;
  }

  // Piper's own convenience predict() has no way to override wasmPaths, so
  // the session is built directly — see the comment above serveOnnxWasm in
  // shared/game-vite-plugins.ts for why the library's default (cdnjs) path
  // is broken.
  const base = `${import.meta.env.BASE_URL}ort/`;
  const session = await piper.TtsSession.create({
    voiceId,
    progress: (progress) => onProgress?.({ loaded: progress.loaded, total: progress.total }),
    wasmPaths: {
      onnxWasm: base,
      piperData: piper.WASM_BASE + '.data',
      piperWasm: piper.WASM_BASE + '.wasm',
    },
  });
  return session.predict(text);
}

export async function speakWithPiper(
  text: string,
  voiceId: PiperVoiceId,
  onProgress?: (p: PiperProgress) => void
): Promise<void> {
  const wav = await synthesize(text, voiceId, onProgress);

  const url = URL.createObjectURL(wav);
  const audio = new Audio(url);
  currentAudio = audio;
  await new Promise<void>((resolve) => {
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    void audio.play().catch(() => resolve());
  });
  if (currentAudio === audio) currentAudio = null;
  URL.revokeObjectURL(url);
}

// True once this voice's model is already cached locally (instant, no
// download) — lets the UI decide whether to show a "downloading…" hint.
export async function isPiperVoiceCached(voiceId: PiperVoiceId): Promise<boolean> {
  try {
    const piper = await loadModule();
    const stored = await piper.stored();
    return stored.some((id) => id === voiceId);
  } catch {
    return false;
  }
}
