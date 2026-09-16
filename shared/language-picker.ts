import Phaser from 'phaser';
import type { LangMode } from './locale';

const ORDER: LangMode[] = ['en', 'nl', 'de', 'es', 'fr'];

// Windows doesn't ship flag-emoji glyphs (🇳🇱 etc. render as bare two-letter
// codes there, unlike macOS/iOS/Android) — so flags are drawn as plain
// colored stripes instead of relying on emoji font support. English gets a
// simple "EN" badge rather than an approximated Union Jack.
function drawFlag(g: Phaser.GameObjects.Graphics, lang: LangMode, cx: number, cy: number, w: number, h: number): void {
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const third = w / 3;

  switch (lang) {
    case 'nl': // red / white / blue, horizontal
      g.fillStyle(0xae1c28, 1); g.fillRect(x0, y0, w, h / 3);
      g.fillStyle(0xffffff, 1); g.fillRect(x0, y0 + h / 3, w, h / 3);
      g.fillStyle(0x21468b, 1); g.fillRect(x0, y0 + (2 * h) / 3, w, h / 3);
      break;
    case 'de': // black / red / gold, horizontal
      g.fillStyle(0x000000, 1); g.fillRect(x0, y0, w, h / 3);
      g.fillStyle(0xdd0000, 1); g.fillRect(x0, y0 + h / 3, w, h / 3);
      g.fillStyle(0xffce00, 1); g.fillRect(x0, y0 + (2 * h) / 3, w, h / 3);
      break;
    case 'es': // red / yellow (double) / red, horizontal
      g.fillStyle(0xaa151b, 1); g.fillRect(x0, y0, w, h / 4);
      g.fillStyle(0xf1bf00, 1); g.fillRect(x0, y0 + h / 4, w, h / 2);
      g.fillStyle(0xaa151b, 1); g.fillRect(x0, y0 + (3 * h) / 4, w, h / 4);
      break;
    case 'fr': // blue / white / red, vertical
      g.fillStyle(0x0055a4, 1); g.fillRect(x0, y0, third, h);
      g.fillStyle(0xffffff, 1); g.fillRect(x0 + third, y0, third, h);
      g.fillStyle(0xef4135, 1); g.fillRect(x0 + 2 * third, y0, third, h);
      break;
    default: // en
      g.fillStyle(0x1b3a6b, 1);
      g.fillRoundedRect(x0, y0, w, h, 4);
  }
}

/**
 * A row of flag buttons for picking the language directly — replaces the
 * old single "toggle to next language" button every game used to duplicate.
 * Stateless: callers re-render (usually via scene.restart()) after onSelect
 * fires, so the newly-active flag just gets its highlight on the next draw.
 */
export function createLanguagePicker(
  scene: Phaser.Scene,
  x: number,
  y: number,
  activeColor: number,
  currentLang: LangMode,
  onSelect: (lang: LangMode) => void
): void {
  const flagW = 40;
  const flagH = 28;
  const gap = 50;
  const startX = x - ((ORDER.length - 1) * gap) / 2;

  ORDER.forEach((lang, i) => {
    const bx = startX + i * gap;
    const active = currentLang === lang;

    const g = scene.add.graphics();
    drawFlag(g, lang, bx, y, flagW, flagH);
    g.lineStyle(active ? 3 : 1, active ? activeColor : 0xffffff, active ? 1 : 0.25);
    g.strokeRect(bx - flagW / 2, y - flagH / 2, flagW, flagH);

    if (lang === 'en') {
      scene.add.text(bx, y, 'EN', {
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5);
    }

    const hit = scene.add.rectangle(bx, y, flagW + 10, flagH + 10, 0x000000, 0);
    hit.setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => onSelect(lang));
  });
}
