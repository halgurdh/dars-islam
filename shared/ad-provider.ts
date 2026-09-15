/**
 * Custom brand ad system — no ad network needed.
 *
 * Each entry is a paying sponsor shown in the rewarded ad slot.
 * Brands pay you a flat monthly fee; you control everything.
 *
 * To add a brand: append to BRAND_ADS below.
 * Clicks are tracked via UTM params — brands see referrals in their own analytics.
 *
 * Revenue model: charge €200–500/month per brand slot.
 */

export interface BrandAd {
  name:    string;
  tagline: string;
  url:     string;
  bg:      string;   // CSS background (color or gradient)
  fg:      string;   // accent / CTA color
}

export const BRAND_ADS: BrandAd[] = [
  {
    name:    'CDG Brands',
    tagline: 'The Ultimate Brand Builders Toolkit',
    url:     'https://cdgbrands.com',
    bg:      'linear-gradient(135deg,#0f0f1a,#1a1a2e)',
    fg:      '#a78bfa',
  }
  // Add more sponsors here ↓
];

let _lastIndex = -1;

function pickBrand(): BrandAd {
  if (BRAND_ADS.length === 0) return _fallback;
  if (BRAND_ADS.length === 1) return BRAND_ADS[0];
  let idx: number;
  do { idx = Math.floor(Math.random() * BRAND_ADS.length); } while (idx === _lastIndex);
  _lastIndex = idx;
  return BRAND_ADS[idx];
}

const _fallback: BrandAd = {
  name:    'Minitoon Games',
  tagline: 'Casual games everyone loves',
  url:     'https://minitoon.games',
  bg:      'linear-gradient(135deg,#0c0f0a,#1a2a14)',
  fg:      '#f2cc1a',
};

/** Renders a brand sponsor card into `container`. */
export function injectAd(container: HTMLElement): void {
  const brand  = pickBrand();
  const utmUrl = `${brand.url}?utm_source=minitoon&utm_medium=rewarded_ad&utm_campaign=game`;
  const host   = new URL(brand.url).hostname;

  container.style.cssText = `
    width:300px; height:250px; border-radius:10px; overflow:hidden;
    background:${brand.bg}; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:12px;
    font-family:'Segoe UI',system-ui,sans-serif; padding:24px; box-sizing:border-box;
    border:1px solid rgba(255,255,255,0.08);
  `;

  container.innerHTML = `
    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;
      color:${brand.fg};opacity:0.7;font-weight:600">SPONSORED</div>
    <div style="font-size:26px;font-weight:900;color:#fff;text-align:center;
      line-height:1.15;letter-spacing:-0.5px">${brand.name}</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.65);text-align:center;
      line-height:1.4">${brand.tagline}</div>
    <a href="${utmUrl}" target="_blank" rel="noopener noreferrer"
      style="margin-top:4px;display:inline-block;padding:9px 22px;
        background:${brand.fg};color:#000;font-size:13px;font-weight:700;
        border-radius:6px;text-decoration:none;pointer-events:auto">
      Visit ${host} →
    </a>
    <div style="font-size:10px;color:rgba(255,255,255,0.3)">${host}</div>
  `;
}
