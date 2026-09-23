// DOM equivalent of shared/language-picker.ts's Phaser flag row — same 6
// languages, same flag-color choices, for the one game (letter-trace) that
// renders its menu as plain HTML/CSS instead of a Phaser canvas.
import type { LangMode } from './locale';

const ORDER: LangMode[] = ['en', 'nl', 'de', 'es', 'fr', 'ar'];

// Matches shared/language-picker.ts's stripe colors exactly, expressed as
// CSS gradients instead of Phaser Graphics fills.
const FLAG_BACKGROUND: Record<LangMode, string> = {
  nl: 'linear-gradient(#ae1c28 33%, #fff 33% 66%, #21468b 66%)',
  de: 'linear-gradient(#000 33%, #dd0000 33% 66%, #ffce00 66%)',
  es: 'linear-gradient(#aa151b 25%, #f1bf00 25% 75%, #aa151b 75%)',
  fr: 'linear-gradient(90deg, #0055a4 33%, #fff 33% 66%, #ef4135 66%)',
  ar: '#0f7a5c',
  en: '#1b3a6b',
};
const FLAG_LABEL: Partial<Record<LangMode, string>> = { en: 'EN', ar: 'AR' };

/** Renders a row of 6 flag buttons into `container` — replaces any single "cycle language" toggle button. */
export function renderLanguagePickerDom(
  container: HTMLElement,
  currentLang: LangMode,
  onSelect: (lang: LangMode) => void
): void {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.gap = '8px';
  container.style.justifyContent = 'center';
  container.style.flexWrap = 'wrap';

  for (const lang of ORDER) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = FLAG_LABEL[lang] ?? '';
    btn.setAttribute('aria-label', lang);
    const active = lang === currentLang;
    btn.style.cssText = `
      width:40px;height:28px;border-radius:4px;cursor:pointer;
      background:${FLAG_BACKGROUND[lang]};
      border:${active ? '3px solid #fff' : '1px solid rgba(255,255,255,0.25)'};
      color:#fff;font-size:11px;font-weight:800;font-family:'Segoe UI',system-ui,sans-serif;
      padding:0;
    `;
    btn.addEventListener('click', () => onSelect(lang));
    container.appendChild(btn);
  }
}
