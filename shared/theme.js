export function initFullscreen(options = {}) {
  const {
    targetId = 'game',
    buttonId = 'fullscreen-toggle',
  } = options;

  const html = document.documentElement;
  const target = document.getElementById(targetId) ?? html;
  const button = document.getElementById(buttonId);
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;
  const isCoarsePointer = () => window.matchMedia('(pointer: coarse)').matches;
  const supportsFullscreen = () =>
    Boolean(
      html.requestFullscreen ||
      html.webkitRequestFullscreen ||
      document.exitFullscreen ||
      document.webkitExitFullscreen
    );

  if (!supportsFullscreen()) {
    button?.setAttribute('hidden', 'hidden');
    return;
  }

  const getFullscreenElement = () =>
    document.fullscreenElement || document.webkitFullscreenElement || null;

  const updateButton = () => {
    if (!button) return;
    const active = Boolean(getFullscreenElement());
    button.hidden = isStandalone();
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    button.textContent = active ? '×' : '⛶';
  };

  const requestFullscreen = async () => {
    const element = target ?? html;
    if (getFullscreenElement() || isStandalone()) return false;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen({ navigationUI: 'hide' });
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else {
        return false;
      }

      if (screen.orientation?.lock && window.matchMedia('(orientation: landscape)').matches) {
        try {
          await screen.orientation.lock('landscape');
        } catch {
          // Orientation lock is best-effort only.
        }
      }
      return true;
    } catch {
      return false;
    } finally {
      updateButton();
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } finally {
      updateButton();
    }
  };

  if (button) {
    button.addEventListener('click', async () => {
      if (getFullscreenElement()) {
        await exitFullscreen();
      } else {
        await requestFullscreen();
      }
    });
  }

  if (isCoarsePointer() && !isStandalone()) {
    const autoEnter = async () => {
      await requestFullscreen();
    };
    target?.addEventListener('pointerup', autoEnter, { once: true, passive: true });
  }

  document.addEventListener('fullscreenchange', updateButton);
  document.addEventListener('webkitfullscreenchange', updateButton);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateButton, { once: true });
  } else {
    updateButton();
  }
}

/**
 * Lock screen orientation for games.
 * - Works on Android (Chrome/Edge/Samsung) when installed as PWA or in fullscreen.
 * - iOS ignores the lock API but respects the manifest orientation on install.
 * - Retries after the first user gesture (required by some browsers).
 *
 * @param {'landscape' | 'portrait'} orientation
 */
export function initOrientationLock(orientation = 'landscape') {
  const type = orientation === 'landscape' ? 'landscape' : 'portrait';

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  // ── Non-iOS: use Screen Orientation API ─────────────────────────────────────
  async function lock() {
    try { await screen.orientation.lock(type); } catch { /* unsupported — ignore */ }
  }

  if (!isIOS()) {
    lock();
    document.addEventListener('pointerdown', lock, { once: true, capture: true });
  }

  // ── iOS: show "rotate phone" overlay when wrong orientation ─────────────────
  if (!isIOS()) return;

  const OVERLAY_ID = 'orientation-overlay';

  const wrongOrientation = () =>
    orientation === 'landscape'
      ? window.innerWidth < window.innerHeight   // portrait when landscape needed
      : window.innerWidth > window.innerHeight;  // landscape when portrait needed

  function injectOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;

    const el = document.createElement('div');
    el.id = OVERLAY_ID;
    el.style.cssText = `
      position:fixed; inset:0; z-index:99999;
      background:rgba(10,10,18,0.97);
      display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:24px;
      font-family:'Segoe UI',system-ui,sans-serif; color:#fff;
      pointer-events:none;
    `;

    const arrow = orientation === 'landscape' ? `
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
        style="animation:rotateHint 1.8s ease-in-out infinite">
        <!-- Phone outline -->
        <rect x="28" y="8" width="24" height="40" rx="4" stroke="#a78bfa" stroke-width="2.5" fill="none"/>
        <line x1="28" y1="16" x2="52" y2="16" stroke="#a78bfa" stroke-width="2"/>
        <circle cx="40" cy="44" r="2" fill="#a78bfa"/>
        <!-- Rotation arrow -->
        <path d="M18 52 A28 28 0 0 0 62 52" stroke="#f2cc1a" stroke-width="2.5" fill="none"
          stroke-linecap="round" stroke-dasharray="6 4"/>
        <polyline points="58,46 62,52 56,54" stroke="#f2cc1a" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>` : `
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
        style="animation:rotateHint 1.8s ease-in-out infinite">
        <!-- Phone outline (landscape) -->
        <rect x="8" y="28" width="40" height="24" rx="4" stroke="#a78bfa" stroke-width="2.5" fill="none"/>
        <line x1="16" y1="28" x2="16" y2="52" stroke="#a78bfa" stroke-width="2"/>
        <circle cx="44" cy="40" r="2" fill="#a78bfa"/>
        <!-- Rotation arrow -->
        <path d="M52 18 A28 28 0 0 1 52 62" stroke="#f2cc1a" stroke-width="2.5" fill="none"
          stroke-linecap="round" stroke-dasharray="6 4"/>
        <polyline points="46,58 52,62 54,56" stroke="#f2cc1a" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`;

    el.innerHTML = `
      <style>
        @keyframes rotateHint {
          0%,100% { transform: rotate(0deg);   opacity: 1;   }
          40%      { transform: rotate(${orientation === 'landscape' ? '90deg' : '-90deg'}); opacity: 0.7; }
          60%      { transform: rotate(${orientation === 'landscape' ? '90deg' : '-90deg'}); opacity: 0.7; }
        }
      </style>
      ${arrow}
      <p style="font-size:16px;font-weight:600;margin:0;letter-spacing:0.02em">
        ${orientation === 'landscape' ? 'Rotate your phone sideways' : 'Turn your phone upright'}
      </p>
      <p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0">
        This game plays best in ${orientation} mode
      </p>`;

    document.body.appendChild(el);
  }

  function removeOverlay() {
    document.getElementById(OVERLAY_ID)?.remove();
  }

  function check() {
    wrongOrientation() ? injectOverlay() : removeOverlay();
  }

  check();
  window.addEventListener('resize', check);
  window.addEventListener('orientationchange', () => setTimeout(check, 120));
}
