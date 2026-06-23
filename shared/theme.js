/**
 * Shared Theme Toggle Script
 * 
 * Usage:
 * 1. Add <button id="theme-toggle" class="theme-toggle"> with SVG icons to your HTML
 * 2. Include this script: <script src="../../shared/theme.js"><\/script>
 * 3. Import shared/theme.css in your CSS
 * 
 * The toggle will automatically persist theme preference to localStorage.
 */

export function initTheme() {
  const html = document.documentElement;

  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  const savedTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(savedTheme || systemTheme);

  const attachToggle = () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
      console.warn('theme-toggle button not found in DOM');
      return;
    }

    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachToggle);
  } else {
    attachToggle();
  }
}

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

export function initInstallPrompt(options = {}) {
  const { buttonId = 'install-toggle', delayMs = 8000 } = options;

  const button = document.getElementById(buttonId);

  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;

  const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  const isFirefox = () => /firefox/i.test(navigator.userAgent);

  // Browsers that need manual "Add to Home Screen" instructions (no API)
  const needsManualInstall = () => isIOS() || isFirefox();

  const wasDismissed = () => {
    const t = localStorage.getItem('installDismissedAt');
    return t && Date.now() - Number(t) < 7 * 24 * 60 * 60 * 1000; // 7 days
  };

  // ── Popup ────────────────────────────────────────────────────────────────────
  function createPopup() {
    if (document.getElementById('install-popup')) return;

    const popup = document.createElement('div');
    popup.id = 'install-popup';
    popup.style.cssText = `
      position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
      z-index:9999; width:min(340px,90vw);
      background:#1a1a2e; border:1px solid rgba(255,255,255,0.12);
      border-radius:16px; padding:20px 20px 16px;
      box-shadow:0 8px 40px rgba(0,0,0,0.6);
      font-family:'Segoe UI',system-ui,sans-serif; color:#fff;
      animation:installSlideUp 0.35s ease;
    `;

    const manualSteps = isIOS()
      ? `<ol style="margin:10px 0 0;padding-left:18px;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7">
          <li>Tap the <strong style="color:#fff">Share</strong> button <span style="font-size:16px">⎙</span> in Safari</li>
          <li>Scroll down → tap <strong style="color:#fff">Add to Home Screen</strong></li>
          <li>Tap <strong style="color:#fff">Add</strong></li>
        </ol>`
      : isFirefox()
      ? `<ol style="margin:10px 0 0;padding-left:18px;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7">
          <li>Tap the <strong style="color:#fff">menu</strong> button <span style="font-size:16px">⋮</span> in Firefox</li>
          <li>Tap <strong style="color:#fff">Install</strong> or <strong style="color:#fff">Add to Home Screen</strong></li>
          <li>Tap <strong style="color:#fff">Add</strong></li>
        </ol>`
      : '';

    popup.innerHTML = `
      <style>@keyframes installSlideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <span style="font-size:28px">📲</span>
        <div>
          <div style="font-weight:700;font-size:15px">Install Board Rush</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:2px">Play offline · No app store needed</div>
        </div>
      </div>
      ${manualSteps}
      <div style="display:flex;gap:8px;margin-top:14px">
        ${!needsManualInstall() ? `<button id="install-popup-yes" style="flex:1;padding:10px;border:none;border-radius:8px;background:#ff6b35;color:#fff;font-weight:700;font-size:14px;cursor:pointer">Install now</button>` : ''}
        <button id="install-popup-no" style="flex:1;padding:10px;border:1px solid rgba(255,255,255,0.15);border-radius:8px;background:transparent;color:rgba(255,255,255,0.6);font-size:13px;cursor:pointer">${needsManualInstall() ? 'Got it' : 'Not now'}</button>
      </div>`;

    document.body.appendChild(popup);

    document.getElementById('install-popup-yes')?.addEventListener('click', async () => {
      closePopup();
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } finally { deferredPrompt = null; }
      }
    });

    document.getElementById('install-popup-no')?.addEventListener('click', () => {
      closePopup();
      localStorage.setItem('installDismissedAt', String(Date.now()));
    });
  }

  function closePopup() {
    document.getElementById('install-popup')?.remove();
    if (button) button.hidden = true;
  }

  function maybeShow() {
    if (isStandalone() || wasDismissed()) return;
    if (!deferredPrompt && !needsManualInstall()) return;
    createPopup();
  }

  // ── Corner button (fallback / re-trigger) ────────────────────────────────────
  if (button) {
    const syncBtn = () => {
      button.hidden = isStandalone() || (!deferredPrompt && !isIOS()) || wasDismissed();
    };

    button.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } finally { deferredPrompt = null; syncBtn(); }
        return;
      }
      if (needsManualInstall()) createPopup();
    });

    syncBtn();
  }

  // ── Events ───────────────────────────────────────────────────────────────────
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (button) button.hidden = isStandalone() || wasDismissed();
    setTimeout(maybeShow, delayMs);
  });

  window.addEventListener('appinstalled', closePopup);

  // iOS / Firefox: no beforeinstallprompt event — fire after delay directly
  if (needsManualInstall() && !isStandalone()) {
    setTimeout(maybeShow, delayMs);
  }
}

