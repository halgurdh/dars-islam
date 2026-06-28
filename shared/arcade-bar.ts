import { ArcadeStore } from './arcade-store';
import { injectAd } from './ad-provider';
import { sync } from './sync';

const AD_REWARD_COINS = 50;
const AD_DURATION_SEC = 30;

type CardBackTier = 'free' | 'coins' | 'premium';
interface CardBackDef { key: string; label: string; price: number; tier: CardBackTier; }

const CARD_BACKS: CardBackDef[] = [
  { key: 'cardBack_blue1',  label: 'Blue I',       price: 0,   tier: 'free' },
  { key: 'cardBack_blue2',  label: 'Classic Blue', price: 100, tier: 'coins' },
  { key: 'cardBack_blue3',  label: 'Blue III',     price: 100, tier: 'coins' },
  { key: 'cardBack_blue4',  label: 'Blue IV',      price: 150, tier: 'coins' },
  { key: 'cardBack_blue5',  label: 'Blue V',       price: 200, tier: 'coins' },
  { key: 'cardBack_green1', label: 'Forest I',     price: 200, tier: 'coins' },
  { key: 'cardBack_green2', label: 'Forest II',    price: 200, tier: 'coins' },
  { key: 'cardBack_green3', label: 'Forest III',   price: 250, tier: 'coins' },
  { key: 'cardBack_green4', label: 'Forest IV',    price: 300, tier: 'coins' },
  { key: 'cardBack_green5', label: 'Forest V',     price: 350, tier: 'coins' },
  { key: 'cardBack_red1',   label: 'Dragon I',     price: 0,   tier: 'premium' },
  { key: 'cardBack_red2',   label: 'Dragon II',    price: 0,   tier: 'premium' },
  { key: 'cardBack_red3',   label: 'Dragon III',   price: 0,   tier: 'premium' },
  { key: 'cardBack_red4',   label: 'Dragon IV',    price: 0,   tier: 'premium' },
  { key: 'cardBack_red5',   label: 'Dragon V',     price: 0,   tier: 'premium' },
];

/**
 * Floating coin-bar + shop/ad/auth panel for any game.
 * Renders as a fixed DOM overlay over the Phaser canvas.
 * Use `destroy()` when navigating away from the menu scene.
 */
export class ArcadeBar {
  private root: HTMLElement;
  private modal: HTMLElement | null = null;
  private adInterval: ReturnType<typeof setInterval> | null = null;
  private authUnsub: (() => void) | null = null;
  private collapsed = false;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.injectStyles();
    this.root = document.createElement('div');
    this.root.className = 'arcade-bar-root';
    document.body.appendChild(this.root);

    ArcadeStore.registerSyncCallback(() => sync.scheduleSync());
    this.authUnsub = sync.onAuthChange(() => { if (!this.modal) this.renderBar(); });
    sync.init().then(() => this.renderBar());
    this.renderBar();
  }

  /** True while a shop / ad / auth modal is covering the screen. */
  get hasModalOpen(): boolean { return this.modal !== null; }

  destroy(): void {
    this.authUnsub?.();
    this.authUnsub = null;
    if (this.hideTimer !== null) { clearTimeout(this.hideTimer); this.hideTimer = null; }
    this.closeModal();
    this.root.remove();
  }

  private resetHideTimer(): void {
    if (this.hideTimer !== null) clearTimeout(this.hideTimer);
    if (!this.collapsed) {
      this.hideTimer = setTimeout(() => { this.collapsed = true; this.renderBar(); }, 10_000);
    }
  }

  // ── Bar ───────────────────────────────────────────────────────────────────

  private renderBar(): void {
    const coins  = ArcadeStore.getCoins();
    const canAd  = ArcadeStore.canWatchAd();
    const coolMs = ArcadeStore.adCooldownRemaining();
    const coolMin = Math.ceil(coolMs / 60_000);
    const chevron = this.collapsed
      ? `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="7,4 13,10 7,16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="13,4 7,10 13,16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    this.root.innerHTML = `
      <div class="ab-bar">
        <button class="ab-toggle" id="abToggle" title="${this.collapsed ? 'Show bar' : 'Hide bar'}">${chevron}</button>
        ${this.collapsed ? '' : `
          <span class="ab-coins">🪙 ${coins}</span>
          <button class="ab-btn" id="abShop">🛒 Shop</button>
          <button class="ab-btn ${canAd ? '' : 'ab-cool'}" id="abAd" ${canAd ? '' : 'disabled'}>
            📺 ${canAd ? `+${AD_REWARD_COINS}🪙` : `${coolMin}m`}
          </button>
          ${sync.isLoggedIn
            ? `<span class="ab-email">☁ ${sync.email?.split('@')[0] ?? ''}</span>
               <button class="ab-btn ab-btn-sm" id="abSignOut">Sign out</button>`
            : `<button class="ab-btn ab-btn-auth" id="abSignIn">☁ Sign in</button>`}
        `}
      </div>`;

    this.resetHideTimer();
    this.root.querySelector('#abToggle')!.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      this.renderBar();
    });
    if (!this.collapsed) {
      this.root.querySelector('#abShop')!.addEventListener('click', () => this.openShop());
      const adBtn = this.root.querySelector('#abAd') as HTMLButtonElement | null;
      if (adBtn && canAd) adBtn.addEventListener('click', () => this.openAd());
      this.root.querySelector('#abSignIn')?.addEventListener('click', () => this.openAuth());
      this.root.querySelector('#abSignOut')?.addEventListener('click', async () => {
        await sync.signOut(); this.renderBar();
      });
    }
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────

  private openModal(html: string): HTMLElement {
    this.closeModal();
    const m = document.createElement('div');
    m.className = 'arcade-bar-modal';
    m.innerHTML = html;
    document.body.appendChild(m);
    this.modal = m;
    return m;
  }

  private closeModal(): void {
    if (this.adInterval !== null) { clearInterval(this.adInterval); this.adInterval = null; }
    this.modal?.remove();
    this.modal = null;
    this.renderBar();
  }

  // ── Shop ──────────────────────────────────────────────────────────────────

  private openShop(): void {
    const coins   = ArcadeStore.getCoins();
    const owned   = ArcadeStore.getOwnedCardBacks();
    const active  = ArcadeStore.getCardBack();
    const premium = ArcadeStore.getPremium();
    const base    = import.meta.env.BASE_URL ?? '/';

    const cards = CARD_BACKS.map((cb) => {
      const isOwned      = owned.includes(cb.key);
      const isActive     = cb.key === active;
      const isPremLocked = cb.tier === 'premium' && !premium.active && !isOwned;
      const canAfford    = cb.tier === 'coins' && coins >= cb.price && !isOwned;
      const imgPath      = `${base}assets/cards/${cb.key}.png`;

      let badge = '', action = '';
      if (isActive)         { badge  = '<span class="ab-badge ab-badge--active">✓ Active</span>'; }
      else if (isOwned || cb.tier === 'free') { action = `<button class="ab-shop-sel" data-key="${cb.key}">Select</button>`; }
      else if (isPremLocked){ badge  = '<span class="ab-badge ab-badge--prem">👑 Premium</span>'; }
      else                  { action = `<button class="ab-shop-buy ${canAfford ? '' : 'ab-cool'}" data-key="${cb.key}" data-price="${cb.price}" ${canAfford ? '' : 'disabled'}>🪙 ${cb.price}</button>`; }

      return `<div class="ab-shop-card ${isActive ? 'ab-shop-card--on' : ''}">
        <img class="ab-shop-img" src="${imgPath}" alt="${cb.label}" />
        <div class="ab-shop-lbl">${cb.label}</div>
        ${badge}${action}
      </div>`;
    }).join('');

    const m = this.openModal(`
      <div class="ab-panel ab-shop-panel">
        <div class="ab-shop-hdr"><h2>🛒 Card Back Shop</h2><span class="ab-coins">🪙 ${coins}</span></div>
        <p class="ab-sub">Earn coins by watching ads</p>
        <div class="ab-shop-grid">${cards}</div>
        <button id="abShopBack" style="margin-top:14px">← Back</button>
      </div>`);

    m.querySelector('#abShopBack')!.addEventListener('click', () => this.closeModal());
    m.querySelectorAll('.ab-shop-sel').forEach((btn) => {
      (btn as HTMLButtonElement).addEventListener('click', () => {
        ArcadeStore.setCardBack((btn as HTMLElement).dataset.key!);
        this.openShop();
      });
    });
    m.querySelectorAll('.ab-shop-buy').forEach((btn) => {
      (btn as HTMLButtonElement).addEventListener('click', () => {
        const key   = (btn as HTMLElement).dataset.key!;
        const price = parseInt((btn as HTMLElement).dataset.price ?? '0', 10);
        if (!ArcadeStore.spendCoins(price)) return;
        ArcadeStore.unlockCardBack(key);
        ArcadeStore.setCardBack(key);
        this.openShop();
      });
    });
  }

  // ── Rewarded ad ───────────────────────────────────────────────────────────

  private openAd(): void {
    if (ArcadeStore.getPremium().active) {
      ArcadeStore.addCoins(AD_REWARD_COINS);
      ArcadeStore.setLastAdTime(Date.now());
      this.closeModal();
      return;
    }

    let remaining = AD_DURATION_SEC;
    const m = this.openModal(`
      <div class="ab-panel" style="max-width:320px">
        <div id="abAdSlot" class="ab-ad-screen"></div>
        <div class="ab-ad-info">
          <div class="ab-ad-timer" id="abAdTimer">${remaining}</div>
          <p>Watch to earn <strong>🪙 ${AD_REWARD_COINS}</strong></p>
          <div class="ab-progress-bar"><div class="ab-progress-fill" id="abAdFill" style="width:0%"></div></div>
        </div>
        <button id="abAdSkip" disabled style="margin-top:14px;opacity:0.4">Skip (${remaining}s)</button>
      </div>`);

    const adEl  = m.querySelector('#abAdSlot')  as HTMLElement;
    const timer = m.querySelector('#abAdTimer') as HTMLElement;
    const fill  = m.querySelector('#abAdFill')  as HTMLElement;
    const skip  = m.querySelector('#abAdSkip')  as HTMLButtonElement;

    if (adEl) injectAd(adEl);

    this.adInterval = setInterval(() => {
      remaining--;
      const pct = ((AD_DURATION_SEC - remaining) / AD_DURATION_SEC) * 100;
      if (timer) timer.textContent = String(remaining);
      if (fill)  fill.style.width  = `${pct}%`;
      if (skip)  skip.textContent  = remaining > 0 ? `Skip (${remaining}s)` : `✓ Claim 🪙 ${AD_REWARD_COINS}`;
      if (remaining <= 0) {
        clearInterval(this.adInterval!); this.adInterval = null;
        if (skip) { skip.disabled = false; skip.style.opacity = '1'; }
      }
    }, 1000);

    skip.addEventListener('click', () => {
      if (remaining > 0) return;
      if (this.adInterval !== null) { clearInterval(this.adInterval); this.adInterval = null; }
      ArcadeStore.addCoins(AD_REWARD_COINS);
      ArcadeStore.setLastAdTime(Date.now());
      this.closeModal();
    });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  private openAuth(): void {
    const m = this.openModal(`
      <div class="ab-panel" style="max-width:320px">
        <h2>☁ Sync Progress</h2>
        <p class="ab-sub">Enter your email — we'll send a magic link. No password needed.</p>
        <input id="abEmail" type="email" placeholder="you@example.com"
          style="width:100%;box-sizing:border-box;margin-top:8px" autocomplete="email" />
        <div id="abMsg" style="min-height:16px;font-size:12px;margin:6px 0;color:#f60"></div>
        <button id="abSend">Send Magic Link</button>
        <button id="abBack" style="opacity:0.65;margin-top:6px">← Play as Guest</button>
      </div>`);

    const emailEl = m.querySelector('#abEmail') as HTMLInputElement;
    const msgEl   = m.querySelector('#abMsg')   as HTMLElement;
    const sendBtn = m.querySelector('#abSend')  as HTMLButtonElement;

    m.querySelector('#abBack')!.addEventListener('click', () => this.closeModal());
    sendBtn.addEventListener('click', async () => {
      const email = emailEl.value.trim();
      if (!email) { msgEl.textContent = 'Please enter your email.'; return; }
      sendBtn.disabled = true; msgEl.textContent = 'Sending…';
      try {
        await sync.signIn(email);
        m.innerHTML = `
          <div class="ab-panel" style="max-width:320px">
            <h2>✉ Check your email!</h2>
            <p class="ab-sub">Link sent to <strong>${email}</strong>. Click it to sign in.</p>
            <button id="abDone" style="margin-top:14px">← Back</button>
          </div>`;
        m.querySelector('#abDone')!.addEventListener('click', () => this.closeModal());
      } catch {
        sendBtn.disabled = false;
        msgEl.style.color = '#e54040';
        msgEl.textContent = 'Could not send — try again.';
      }
    });
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  private injectStyles(): void {
    if (document.getElementById('arcade-bar-styles')) return;
    const s = document.createElement('style');
    s.id = 'arcade-bar-styles';
    s.textContent = `
      .arcade-bar-root { position:fixed;
        top: calc(max(var(--control-offset, 1rem), var(--safe-top, 0px)) + (var(--control-size, 48px) + 0.55rem) * 1.55);
        right: calc(max(var(--control-offset, 1rem), var(--safe-right, 0px)) + var(--control-size, 48px) + 0.9rem);
        z-index:9000; font-family:'Segoe UI',system-ui,sans-serif; pointer-events:auto;
        max-width:min(calc(100vw - max(var(--control-offset, 1rem), var(--safe-left, 0px)) - max(var(--control-offset, 1rem), var(--safe-right, 0px)) - var(--control-size, 48px) - 6rem), 720px); }
      .ab-bar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end;
        background:rgba(0,0,0,0.75); border:1px solid rgba(255,255,255,0.15);
        border-radius:14px; padding:8px 12px; backdrop-filter:blur(10px); }
      .ab-coins { font-weight:700; color:#ffd700; font-size:16px; }
      .ab-email { font-size:13px; color:#aaa; max-width:140px;
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .ab-btn { background:rgba(255,255,255,0.1); color:#fff;
        border:1px solid rgba(255,255,255,0.18); border-radius:12px;
        padding:6px 11px; font-size:13px; cursor:pointer; white-space:nowrap;
        transition:background 0.12s; }
      .ab-btn:hover:not(:disabled) { background:rgba(255,255,255,0.22); }
      @media (max-width: 1600px) {
        .arcade-bar-root { max-width:min(calc(100vw - max(var(--control-offset, 1rem), var(--safe-left, 0px)) - max(var(--control-offset, 1rem), var(--safe-right, 0px)) - var(--control-size, 48px) - 4.5rem), 560px); }
      }
      @media (max-width: 900px) {
        .arcade-bar-root {
          top: calc(max(var(--control-offset, 0.75rem), var(--safe-top, 0px)) + (var(--control-size, 44px) + 0.55rem) * 1.55);
          right: calc(max(var(--control-offset, 0.75rem), var(--safe-right, 0px)) + var(--control-size, 44px) + 0.7rem);
          max-width:min(calc(100vw - max(var(--control-offset, 0.75rem), var(--safe-left, 0px)) - max(var(--control-offset, 0.75rem), var(--safe-right, 0px)) - var(--control-size, 44px) - 3.6rem), 320px);
        }
        .ab-bar { padding:6px 9px; gap:7px; border-radius:10px; }
        .ab-coins { font-size:14px; }
        .ab-email { font-size:11px; max-width:90px; }
        .ab-btn { font-size:12px; padding:5px 8px; border-radius:7px; }
        .ab-btn-auth,.ab-btn-sm { font-size:12px; }
        .ab-toggle { width:28px; height:28px; }
      }
      .ab-btn:disabled { opacity:0.4; cursor:default; }
      .ab-cool { opacity:0.45; }
      .ab-btn-auth,.ab-btn-sm { font-size:12px; }
      .ab-toggle { background:rgba(255,255,255,0.08); color:#fff;
        border:1px solid rgba(255,255,255,0.18); border-radius:10px;
        width:30px; height:30px; display:flex; align-items:center; justify-content:center;
        cursor:pointer; padding:0; flex-shrink:0; transition:background 0.12s; }
      .ab-toggle:hover { background:rgba(255,255,255,0.2); }
      .ab-toggle svg { display:block; }

      .arcade-bar-modal { position:fixed; inset:0; background:rgba(0,0,0,0.8);
        display:flex; align-items:center; justify-content:center;
        z-index:9001; font-family:'Segoe UI',system-ui,sans-serif; padding:16px; box-sizing:border-box; }
      .ab-panel { background:#1a1a2e; border:1px solid rgba(255,255,255,0.14);
        border-radius:12px; padding:24px 28px; width:100%; color:#eee;
        max-height:90vh; overflow-y:auto; box-sizing:border-box; }
      .ab-panel h2 { margin:0 0 8px; font-size:21px; }
      .ab-sub { opacity:0.75; font-size:13px; margin:2px 0 10px; }
      .ab-panel button { background:rgba(255,255,255,0.11); color:#fff;
        border:1px solid rgba(255,255,255,0.18); border-radius:6px;
        padding:9px 16px; font-size:14px; cursor:pointer; width:100%;
        margin-top:4px; transition:background 0.12s; }
      .ab-panel button:hover:not(:disabled) { background:rgba(255,255,255,0.22); }
      .ab-panel button:disabled { opacity:0.4; cursor:default; }
      .ab-panel input { background:rgba(255,255,255,0.07); color:#eee;
        border:1px solid rgba(255,255,255,0.18); border-radius:6px;
        padding:8px 10px; font-size:14px; width:100%; box-sizing:border-box; }

      .ab-shop-panel { max-width:600px; }
      .ab-shop-hdr { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:2px; }
      .ab-shop-hdr h2 { margin:0; }
      .ab-shop-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(96px,1fr));
        gap:10px; margin-top:12px; max-height:52vh; overflow-y:auto; }
      .ab-shop-card { display:flex; flex-direction:column; align-items:center; gap:4px;
        background:rgba(255,255,255,0.05); border:2px solid rgba(255,255,255,0.1);
        border-radius:8px; padding:10px 6px 8px; }
      .ab-shop-card--on { border-color:#ffd700; }
      .ab-shop-img { width:50px; height:65px; object-fit:contain; border-radius:4px; }
      .ab-shop-lbl { font-size:10px; font-weight:600; text-align:center; }
      .ab-badge { font-size:9px; padding:2px 5px; border-radius:10px; font-weight:600; }
      .ab-badge--active { background:rgba(255,215,0,0.18); color:#ffd700; }
      .ab-badge--prem { background:linear-gradient(135deg,#b8860b,#ffd700); color:#1a1200; }
      .ab-shop-sel,.ab-shop-buy { font-size:10px!important; padding:3px 8px!important;
        margin-top:2px!important; min-height:unset!important; width:100%!important; }

      .ab-ad-screen { background:#111; border-radius:8px; min-height:90px;
        display:flex; align-items:center; justify-content:center;
        border:1px solid #333; margin-bottom:12px; overflow:hidden; }
      .ab-ad-info { display:flex; flex-direction:column; align-items:center; gap:4px; }
      .ab-ad-timer { font-size:40px; font-weight:900; color:#ffd700; line-height:1; }
      .ab-progress-bar { width:200px; height:5px; background:rgba(255,255,255,0.1);
        border-radius:3px; overflow:hidden; margin-top:6px; }
      .ab-progress-fill { height:100%; background:#ffd700; border-radius:3px; transition:width 0.9s linear; }
    `;
    document.head.appendChild(s);
  }
}

