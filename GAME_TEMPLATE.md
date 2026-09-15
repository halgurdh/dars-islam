# Game Template Guide

This template shows how to create a new game with the shared theme and minimal CSS duplication.

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
    <!-- Exit button (optional, if your game is full-screen) -->
    <a href="/" class="game-exit">← Exit Game</a>

    <!-- Your game container -->
    <div id="game"></div>

    <!-- Game script -->
    <script type="module" src="./src/main.ts"></script>
    <!-- Shared fullscreen/orientation helpers (must come after HTML) -->
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

## Theming

The site uses a single fixed dark theme — there is no light-mode toggle. Use the CSS variables below so your game's chrome matches the rest of the site.

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
6. Done! Theme variables are inherited automatically

**Result:** New game with zero CSS duplication, theme built-in, minimal setup.
