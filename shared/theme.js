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

(function initTheme() {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  if (!themeToggle) {
    console.warn('theme-toggle button not found in DOM');
    return;
  }

  // Load saved theme or default to 'dark'
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  // Toggle theme on click
  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
})();
