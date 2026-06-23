# Game Template Guide

This template shows how to create a new game with light/dark theme support and minimal CSS duplication.

## Quick Setup (Copy-Paste)

### 1. Create Game Directory
```bash
mkdir -p games/my-game/src
cd games/my-game
```

### 2. Copy Template Files
```bash
# From games/board-rush/
cp games/board-rush/package.json games/my-game/
cp games/board-rush/tsconfig.json games/my-game/
cp games/board-rush/vite.config.ts games/my-game/
```

### 3. Update package.json
Change the `name` field to your game name:
```json
{
  "name": "my-game",
  "version": "1.0.0",
  ...
}
```

### 4. Minimal index.html (with shared theme)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>My Game</title>
    <!-- Shared theme CSS -->
    <link rel="stylesheet" href="../../shared/theme.css" />
    <!-- Your game CSS -->
    <link rel="stylesheet" href="style.css" />
    <style>
      #game {
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
      }
    </style>
  </head>
  <body>
    <!-- Theme toggle (optional, if your game has UI) -->
    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark/light mode">
      <!-- Eye open (dark mode) -->
      <svg class="theme-icon theme-icon--dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <!-- Eye closed (light mode) -->
      <svg class="theme-icon theme-icon--light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    </button>

    <!-- Exit button (optional, if your game is full-screen) -->
    <a href="/" class="game-exit">← Exit Game</a>

    <!-- Your game container -->
    <div id="game"></div>

    <!-- Game script -->
    <script type="module" src="./src/main.ts"></script>
    <!-- Shared theme toggle (must come after HTML) -->
    <script src="../../shared/theme.js"></script>
  </body>
</html>
```

### 5. Minimal style.css (game-specific only)
```css
/* Import theme variables (already in theme.css, but you can reference them) */
/* Example: use var(--accent), var(--bg-primary), etc. */

/* Your game-specific styles here */
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Example: responsive adjustments */
@media (max-width: 768px) {
  /* mobile styles */
}
```

### 6. vite.config.ts
Update the `GAME_BASE` to your game path:
```typescript
const GAME_BASE = '/games/my-game/';
```

### 7. Create src/main.ts
Add your game logic here (Phaser, Canvas, etc.)

## CSS Variable Reference

All theme variables are defined in `shared/theme.css` and available to your game:

```css
/* Colors */
--bg-primary        /* Main background */
--bg-secondary      /* Secondary background (cards, modals) */
--text-primary      /* Primary text color */
--text-secondary    /* Secondary text (descriptions, muted) */
--text-tertiary     /* Tertiary text */
--text-muted        /* Very muted text (footnotes) */

/* UI */
--accent            /* Primary accent color (#ff6b35) */
--accent-light      /* Light accent color (#ff6b8a) */
--border-color      /* Border color */
--border-color-hover /* Border color on hover */

/* Shadows */
--shadow-sm         /* Small shadow (2px) */
--shadow-md         /* Medium shadow (8px) */
--shadow-lg         /* Large shadow (12px) */
```

## Light/Dark Mode

Users can toggle light/dark mode by clicking the theme button. Your styles automatically adapt via CSS variables.

Example:
```css
.my-element {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.my-element:hover {
  border-color: var(--border-color-hover);
}
```

## Summary

1. Copy package.json, tsconfig.json, vite.config.ts from board-rush
2. Create index.html with shared theme.css import + theme.js script
3. Create style.css with only game-specific styles
4. Create src/main.ts with your game logic
5. Update vite.config.ts with your game's base path
6. Done! Theme toggle works automatically, light/dark mode inherited

**Result:** New game with zero CSS duplication, theme built-in, minimal setup.
