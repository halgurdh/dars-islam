import { ArcadeStore } from './arcade-store';
import { PlayerProgress } from './player-progress';
import { BADGES } from './badges';
import { sync } from './sync';
import { getSupabase } from './supabase-client';
import { t, getLang, setLang, detectDefaultLang } from './progress-bar-i18n';
import { renderLanguagePickerDom } from './language-picker-dom';

interface LeaderboardEntry { display_name: string; xp: number; level: number; }

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

/**
 * Floating level/streak/badges widget + leaderboard, for any game or the
 * wrapper hub. Deliberately separate from ArcadeBar (coins/shop/ads) —
 * these are learning-progress games, not the coin economy.
 */
export class ProgressBar {
  private root: HTMLElement;
  private modal: HTMLElement | null = null;
  private collapsed = false;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private authUnsub: (() => void) | null = null;

  constructor() {
    this.injectStyles();
    this.root = document.createElement('div');
    this.root.className = 'pb-root';
    document.body.appendChild(this.root);

    PlayerProgress.registerSyncCallback(() => sync.scheduleSync());
    this.authUnsub = sync.onAuthChange(() => { if (!this.modal) this.renderBar(); });
    sync.init().then(() => this.renderBar()).catch(() => {});
    void detectDefaultLang().then(() => { if (!this.modal) this.renderBar(); });
    this.renderBar();
  }

  destroy(): void {
    this.authUnsub?.();
    this.authUnsub = null;
    if (this.hideTimer !== null) { clearTimeout(this.hideTimer); this.hideTimer = null; }
    this.closeModal();
    this.root.remove();
  }

  /** Opens the sign-in (magic link) modal directly — used by the wrapper's header sign-in button. */
  openSignIn(): void {
    this.openAuth();
  }

  /** Call right after a round completes to show XP/streak/badge feedback and refresh the bar. */
  showCompletionToast(result: {
    xpAwarded: number; level: number; leveledUp: boolean; dailyStreak: number; streakExtended: boolean;
    newBadges: { icon: string; name: string }[];
  }): void {
    this.renderBar();
    const lines = [`+${result.xpAwarded} XP`];
    if (result.leveledUp) lines.push(t().toastLevelUp(result.level));
    if (result.streakExtended && result.dailyStreak > 1) lines.push(t().toastStreak(result.dailyStreak));
    result.newBadges.forEach((b) => lines.push(`${b.icon} ${t().toastNewBadge(b.name)}`));

    const toast = document.createElement('div');
    toast.className = 'pb-toast';
    toast.innerHTML = lines.map((l) => `<div>${l}</div>`).join('');
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('pb-toast--in'));
    setTimeout(() => {
      toast.classList.remove('pb-toast--in');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  private resetHideTimer(): void {
    if (this.hideTimer !== null) clearTimeout(this.hideTimer);
    if (!this.collapsed) {
      this.hideTimer = setTimeout(() => { this.collapsed = true; this.renderBar(); }, 10_000);
    }
  }

  private renderBar(): void {
    const state = PlayerProgress.getState();
    const chevron = this.collapsed
      ? `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="7,4 13,10 7,16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="13,4 7,10 13,16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    this.root.innerHTML = `
      <div class="pb-bar">
        <button class="pb-toggle" id="pbToggle" title="${this.collapsed ? t().showProgress : t().hideProgress}">${chevron}</button>
        ${this.collapsed ? '' : `
          <button class="pb-btn pb-level" id="pbOpen">⭐ ${t().lvl(state.level)}</button>
          ${state.dailyStreak > 0 ? `<span class="pb-streak">🔥 ${state.dailyStreak}</span>` : ''}
        `}
      </div>`;

    this.resetHideTimer();
    this.root.querySelector('#pbToggle')!.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      this.renderBar();
    });
    this.root.querySelector('#pbOpen')?.addEventListener('click', () => this.openPanel());
  }

  private openModal(html: string): HTMLElement {
    this.closeModal();
    const m = document.createElement('div');
    m.className = 'pb-modal';
    m.innerHTML = html;
    document.body.appendChild(m);
    this.modal = m;
    return m;
  }

  private closeModal(): void {
    this.modal?.remove();
    this.modal = null;
    this.renderBar();
  }

  private openPanel(tab: 'progress' | 'leaderboard' = 'progress'): void {
    const state = PlayerProgress.getState();
    const pct = Math.round((state.xpIntoLevel / Math.max(1, state.xpForNextLevel)) * 100);
    const owned = new Set(state.badges.map((b) => b.name));
    const name = ArcadeStore.getPlayerName() ?? '';

    const badgeGrid = BADGES.map((b) => {
      const unlocked = owned.has(b.name);
      return `<div class="pb-badge ${unlocked ? '' : 'pb-badge--locked'}" title="${b.description}">
        <span class="pb-badge-icon">${b.icon}</span>
        <span class="pb-badge-name">${b.name}</span>
      </div>`;
    }).join('');

    const siteRoot = typeof __SITE_BASE_PATH__ !== 'undefined' ? __SITE_BASE_PATH__ : '/';
    const m = this.openModal(`
      <div class="pb-panel">
        <div class="pb-tabs">
          <button class="pb-tab ${tab === 'progress' ? 'pb-tab--on' : ''}" id="pbTabProgress">${t().tabProgress}</button>
          <button class="pb-tab ${tab === 'leaderboard' ? 'pb-tab--on' : ''}" id="pbTabBoard">${t().tabLeaderboard}</button>
          <button class="pb-close" id="pbClose">✕</button>
        </div>
        <div id="pbLangPicker" style="margin:2px 0 10px"></div>
        <div id="pbTabContent">
          ${tab === 'progress' ? `
            <div class="pb-level-row">
              <span class="pb-level-big">⭐ ${t().lvl(state.level)}</span>
              <span class="pb-streak-big">🔥 ${t().dayStreak(state.dailyStreak)}</span>
            </div>
            <div class="pb-xp-bar"><div class="pb-xp-fill" style="width:${pct}%"></div></div>
            <p class="pb-sub">${t().xpToLevel(state.xpIntoLevel, state.xpForNextLevel, state.level + 1, state.totalRounds)}</p>
            <div class="pb-badges-grid">${badgeGrid}</div>
            <div class="pb-name-row">
              <input id="pbName" type="text" maxlength="24"
                placeholder="${sync.role === 'student' ? t().namePlaceholderStudent : t().namePlaceholderDefault}"
                value="${escapeHtml(name)}" />
              <button id="pbNameSave">${t().save}</button>
            </div>
            ${sync.isLoggedIn
              ? `<p class="pb-sub">${sync.email ? t().syncedAs(sync.email) : t().synced}</p>`
              : `<button id="pbSignIn" style="margin-top:8px">${t().signInToSave}</button>`}
            <div class="pb-links">
              <a href="${siteRoot}dashboard/">${t().linkDashboard}</a>
              ${sync.isTeacher ? `<a href="${siteRoot}teacher/">${t().linkTeacher}</a>` : ''}
              ${sync.isParent ? `<a href="${siteRoot}parent/">${t().linkParent}</a>` : ''}
            </div>
          ` : `<div id="pbBoardList" class="pb-board-list"><p class="pb-sub">${t().loading}</p></div>`}
        </div>
      </div>`);

    const renderLangRow = () => {
      const container = m.querySelector('#pbLangPicker') as HTMLElement | null;
      if (!container) return;
      renderLanguagePickerDom(container, getLang(), (lang) => {
        setLang(lang);
        this.openPanel(tab);
      });
    };
    renderLangRow();

    m.querySelector('#pbClose')!.addEventListener('click', () => this.closeModal());
    m.querySelector('#pbTabProgress')!.addEventListener('click', () => this.openPanel('progress'));
    m.querySelector('#pbTabBoard')!.addEventListener('click', () => this.openPanel('leaderboard'));
    m.querySelector('#pbSignIn')?.addEventListener('click', () => this.openAuth());
    m.querySelector('#pbNameSave')?.addEventListener('click', () => {
      const input = m.querySelector('#pbName') as HTMLInputElement;
      ArcadeStore.setPlayerName(input.value.trim().slice(0, 24));
      sync.scheduleSync();
    });

    if (tab === 'leaderboard') void this.loadLeaderboard(m);
  }

  private async loadLeaderboard(panel: HTMLElement): Promise<void> {
    const list = panel.querySelector('#pbBoardList');
    if (!list) return;
    try {
      const supabase = getSupabase();
      const { data: entries, error } = await supabase.rpc('public_leaderboard');
      if (error) throw error;
      if (!entries?.length) {
        list.innerHTML = `<p class="pb-sub">${t().noEntriesYet}</p>`;
        return;
      }
      list.innerHTML = (entries as LeaderboardEntry[]).map((e, i) => `
        <div class="pb-board-row">
          <span class="pb-board-rank">#${i + 1}</span>
          <span class="pb-board-name">${escapeHtml(e.display_name)}</span>
          <span class="pb-board-level">${t().lvl(e.level)}</span>
          <span class="pb-board-xp">${e.xp} XP</span>
        </div>`).join('');
    } catch {
      list.innerHTML = `<p class="pb-sub">${t().leaderboardError}</p>`;
    }
  }

  private openAuth(): void {
    // Same site root for the wrapper AND every game (each build gets the
    // same VITE_BASE_PATH baked in via injectBasePath()'s `define`, unlike
    // import.meta.env.BASE_URL which differs per game) — used so "Teacher
    // Dashboard"/"Parent Dashboard" links work correctly from inside a
    // game page, not just from the wrapper hub.
    const siteRoot = typeof __SITE_BASE_PATH__ !== 'undefined' ? __SITE_BASE_PATH__ : '/';
    const s = t();
    const m = this.openModal(`
      <div class="pb-panel" style="max-width:320px">
        <h2>${s.syncProgressTitle}</h2>
        <div id="pbLangPicker" style="margin:8px 0"></div>
        <p class="pb-sub">${s.syncProgressBody}</p>
        <input id="pbEmail" type="email" placeholder="${s.emailPlaceholder}"
          style="width:100%;box-sizing:border-box;margin-top:8px" autocomplete="email" />
        <div id="pbMsg" style="min-height:16px;font-size:12px;margin:6px 0;color:#f60"></div>
        <button id="pbSend">${s.sendMagicLink}</button>
        <button id="pbBack" style="opacity:0.65;margin-top:6px">${s.back}</button>
        <p class="pb-sub" style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08)">
          ${s.registerTeacherIntro} <strong>${s.registerTeacherStrong}</strong>?
          <a href="${siteRoot}teacher/">${s.registerTeacherLink}</a> ${s.registerTeacherOutro}<br>
          ${s.registerParentIntro} <strong>${s.registerParentStrong}</strong>?
          <a href="${siteRoot}parent/">${s.registerParentLink}</a>.
        </p>
      </div>`);

    const langContainer = m.querySelector('#pbLangPicker') as HTMLElement | null;
    if (langContainer) {
      renderLanguagePickerDom(langContainer, getLang(), (lang) => {
        setLang(lang);
        this.openAuth();
      });
    }

    const emailEl = m.querySelector('#pbEmail') as HTMLInputElement;
    const msgEl   = m.querySelector('#pbMsg')   as HTMLElement;
    const sendBtn = m.querySelector('#pbSend')  as HTMLButtonElement;

    m.querySelector('#pbBack')!.addEventListener('click', () => this.openPanel());
    sendBtn.addEventListener('click', async () => {
      const email = emailEl.value.trim();
      if (!email) { msgEl.textContent = t().enterEmailFirst; return; }
      sendBtn.disabled = true; msgEl.textContent = t().sending;
      try {
        await sync.signIn(email);
        m.innerHTML = `
          <div class="pb-panel" style="max-width:320px">
            <h2>${t().checkEmailTitle}</h2>
            <p class="pb-sub">${t().linkSentTo(escapeHtml(email))}</p>
            <button id="pbDone" style="margin-top:14px">${t().back}</button>
          </div>`;
        m.querySelector('#pbDone')!.addEventListener('click', () => this.closeModal());
      } catch {
        sendBtn.disabled = false;
        msgEl.style.color = '#e54040';
        msgEl.textContent = t().sendFailed;
      }
    });
  }

  private injectStyles(): void {
    if (document.getElementById('progress-bar-styles')) return;
    const s = document.createElement('style');
    s.id = 'progress-bar-styles';
    s.textContent = `
      .pb-root { position:fixed;
        top: calc(max(var(--control-offset, 1rem), var(--safe-top, 0px)) + (var(--control-size, 48px) + 0.55rem) * 1.55);
        left: calc(max(var(--control-offset, 1rem), var(--safe-left, 0px)));
        z-index:9000; font-family:'Segoe UI',system-ui,sans-serif; pointer-events:auto; }
      .pb-bar { display:flex; align-items:center; gap:8px;
        background:rgba(0,0,0,0.75); border:1px solid rgba(255,255,255,0.15);
        border-radius:14px; padding:8px 10px; backdrop-filter:blur(10px); }
      .pb-btn { background:rgba(255,255,255,0.1); color:#fff;
        border:1px solid rgba(255,255,255,0.18); border-radius:12px;
        padding:6px 11px; font-size:13px; cursor:pointer; white-space:nowrap; }
      .pb-btn:hover { background:rgba(255,255,255,0.22); }
      .pb-level { font-weight:700; color:#ffd700; }
      .pb-streak { font-weight:700; color:#ff9d42; font-size:14px; }
      .pb-toggle { background:rgba(255,255,255,0.08); color:#fff;
        border:1px solid rgba(255,255,255,0.18); border-radius:10px;
        width:30px; height:30px; display:flex; align-items:center; justify-content:center;
        cursor:pointer; padding:0; flex-shrink:0; }
      .pb-toggle:hover { background:rgba(255,255,255,0.2); }
      .pb-toggle svg { display:block; }
      @media (max-width: 900px) {
        .pb-root {
          top: calc(max(var(--control-offset, 0.75rem), var(--safe-top, 0px)) + (var(--control-size, 44px) + 0.55rem) * 1.55);
          left: calc(max(var(--control-offset, 0.75rem), var(--safe-left, 0px)));
        }
        .pb-bar { padding:6px 8px; gap:6px; border-radius:10px; }
        .pb-btn { font-size:12px; padding:5px 8px; border-radius:7px; }
        .pb-toggle { width:28px; height:28px; }
      }

      .pb-modal { position:fixed; inset:0; background:rgba(0,0,0,0.8);
        display:flex; align-items:center; justify-content:center;
        z-index:9001; font-family:'Segoe UI',system-ui,sans-serif; padding:16px; box-sizing:border-box; }
      .pb-panel { background:#1a1a2e; border:1px solid rgba(255,255,255,0.14);
        border-radius:12px; padding:20px 22px; width:100%; max-width:440px; color:#eee;
        max-height:88vh; overflow-y:auto; box-sizing:border-box; }
      .pb-panel h2 { margin:0 0 8px; font-size:21px; }
      .pb-sub { opacity:0.75; font-size:13px; margin:6px 0; }
      .pb-panel input { background:rgba(255,255,255,0.07); color:#eee;
        border:1px solid rgba(255,255,255,0.18); border-radius:6px;
        padding:8px 10px; font-size:14px; width:100%; box-sizing:border-box; }
      .pb-panel button { background:rgba(255,255,255,0.11); color:#fff;
        border:1px solid rgba(255,255,255,0.18); border-radius:6px;
        padding:9px 16px; font-size:14px; cursor:pointer; width:100%;
        margin-top:4px; }
      .pb-panel button:hover:not(:disabled) { background:rgba(255,255,255,0.22); }
      .pb-panel button:disabled { opacity:0.4; cursor:default; }

      .pb-tabs { display:flex; align-items:center; gap:6px; margin-bottom:10px; }
      .pb-tab { flex:1; width:auto; margin:0; font-size:13px; padding:7px 6px; }
      .pb-tab--on { background:rgba(255,215,0,0.18); border-color:#ffd700; color:#ffd700; }
      .pb-close { flex:0 0 auto; width:30px !important; padding:6px !important; }

      .pb-level-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
      .pb-level-big { font-size:18px; font-weight:800; color:#ffd700; }
      .pb-streak-big { font-size:14px; font-weight:700; color:#ff9d42; }
      .pb-xp-bar { width:100%; height:10px; background:rgba(255,255,255,0.1);
        border-radius:5px; overflow:hidden; margin-top:10px; }
      .pb-xp-fill { height:100%; background:linear-gradient(90deg,#ffb347,#ffd700); border-radius:5px; transition:width 0.4s ease; }

      .pb-badges-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(84px,1fr));
        gap:8px; margin:12px 0; max-height:220px; overflow-y:auto; }
      .pb-badge { display:flex; flex-direction:column; align-items:center; gap:2px;
        background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12);
        border-radius:8px; padding:8px 4px; text-align:center; }
      .pb-badge--locked { opacity:0.32; filter:grayscale(1); }
      .pb-badge-icon { font-size:20px; }
      .pb-badge-name { font-size:9px; font-weight:600; line-height:1.2; }

      .pb-name-row { display:flex; gap:6px; margin-top:6px; }
      .pb-name-row input { flex:1; }
      .pb-name-row button { width:auto; flex:0 0 auto; }

      .pb-links { display:flex; gap:12px; margin-top:10px; flex-wrap:wrap; }
      .pb-links a { font-size:12px; color:#ffd700; text-decoration:none; opacity:0.85; }
      .pb-links a:hover { opacity:1; text-decoration:underline; }

      .pb-board-list { display:flex; flex-direction:column; gap:4px; max-height:320px; overflow-y:auto; }
      .pb-board-row { display:flex; align-items:center; gap:8px; padding:7px 8px;
        background:rgba(255,255,255,0.05); border-radius:8px; font-size:13px; }
      .pb-board-rank { font-weight:800; color:#ffd700; width:28px; flex-shrink:0; }
      .pb-board-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .pb-board-level { opacity:0.75; font-size:12px; }
      .pb-board-xp { font-weight:700; }

      .pb-toast { position:fixed; top:20%; left:50%; transform:translate(-50%,-10px);
        background:rgba(20,15,10,0.92); color:#ffd700; border:1px solid rgba(255,215,0,0.4);
        border-radius:12px; padding:12px 20px; font-family:'Segoe UI',system-ui,sans-serif;
        font-size:15px; font-weight:700; text-align:center; z-index:9500;
        opacity:0; transition:opacity 0.3s ease, transform 0.3s ease; pointer-events:none; }
      .pb-toast--in { opacity:1; transform:translate(-50%,0); }
      .pb-toast div { margin:2px 0; }
    `;
    document.head.appendChild(s);
  }
}
