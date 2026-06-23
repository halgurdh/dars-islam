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

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

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

