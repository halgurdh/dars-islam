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
  const {
    buttonId = 'install-toggle',
  } = options;

  const button = document.getElementById(buttonId);
  if (!button) return;

  let deferredPrompt = null;
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;

  const updateVisibility = () => {
    button.hidden = isStandalone() || !deferredPrompt;
  };

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    updateVisibility();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateVisibility();
  });

  button.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      deferredPrompt = null;
      updateVisibility();
    }
  });

  updateVisibility();
}

