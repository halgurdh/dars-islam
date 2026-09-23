import{P as d,s as r,A as b,B as g,g as x}from"./sync-CsgRh07u.js";function c(l){return l.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}class m{constructor(){this.modal=null,this.collapsed=!1,this.hideTimer=null,this.authUnsub=null,this.injectStyles(),this.root=document.createElement("div"),this.root.className="pb-root",document.body.appendChild(this.root),d.registerSyncCallback(()=>r.scheduleSync()),this.authUnsub=r.onAuthChange(()=>{this.modal||this.renderBar()}),r.init().then(()=>this.renderBar()).catch(()=>{}),this.renderBar()}destroy(){this.authUnsub?.(),this.authUnsub=null,this.hideTimer!==null&&(clearTimeout(this.hideTimer),this.hideTimer=null),this.closeModal(),this.root.remove()}openSignIn(){this.openAuth()}showCompletionToast(e){this.renderBar();const t=[`+${e.xpAwarded} XP`];e.leveledUp&&t.push(`🎉 Level ${e.level}!`),e.streakExtended&&e.dailyStreak>1&&t.push(`🔥 ${e.dailyStreak}-day streak`),e.newBadges.forEach(o=>t.push(`${o.icon} New badge: ${o.name}`));const a=document.createElement("div");a.className="pb-toast",a.innerHTML=t.map(o=>`<div>${o}</div>`).join(""),document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add("pb-toast--in")),setTimeout(()=>{a.classList.remove("pb-toast--in"),setTimeout(()=>a.remove(),300)},3200)}resetHideTimer(){this.hideTimer!==null&&clearTimeout(this.hideTimer),this.collapsed||(this.hideTimer=setTimeout(()=>{this.collapsed=!0,this.renderBar()},1e4))}renderBar(){const e=d.getState(),t=this.collapsed?'<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="7,4 13,10 7,16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':'<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="13,4 7,10 13,16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';this.root.innerHTML=`
      <div class="pb-bar">
        <button class="pb-toggle" id="pbToggle" title="${this.collapsed?"Show progress":"Hide progress"}">${t}</button>
        ${this.collapsed?"":`
          <button class="pb-btn pb-level" id="pbOpen">⭐ Lvl ${e.level}</button>
          ${e.dailyStreak>0?`<span class="pb-streak">🔥 ${e.dailyStreak}</span>`:""}
        `}
      </div>`,this.resetHideTimer(),this.root.querySelector("#pbToggle").addEventListener("click",()=>{this.collapsed=!this.collapsed,this.renderBar()}),this.root.querySelector("#pbOpen")?.addEventListener("click",()=>this.openPanel())}openModal(e){this.closeModal();const t=document.createElement("div");return t.className="pb-modal",t.innerHTML=e,document.body.appendChild(t),this.modal=t,t}closeModal(){this.modal?.remove(),this.modal=null,this.renderBar()}openPanel(e="progress"){const t=d.getState(),a=Math.round(t.xpIntoLevel/Math.max(1,t.xpForNextLevel)*100),o=new Set(t.badges.map(n=>n.name)),s=b.getPlayerName()??"",p=g.map(n=>`<div class="pb-badge ${o.has(n.name)?"":"pb-badge--locked"}" title="${n.description}">
        <span class="pb-badge-icon">${n.icon}</span>
        <span class="pb-badge-name">${n.name}</span>
      </div>`).join(""),i=this.openModal(`
      <div class="pb-panel">
        <div class="pb-tabs">
          <button class="pb-tab ${e==="progress"?"pb-tab--on":""}" id="pbTabProgress">📈 Progress</button>
          <button class="pb-tab ${e==="leaderboard"?"pb-tab--on":""}" id="pbTabBoard">🏆 Leaderboard</button>
          <button class="pb-close" id="pbClose">✕</button>
        </div>
        <div id="pbTabContent">
          ${e==="progress"?`
            <div class="pb-level-row">
              <span class="pb-level-big">⭐ Level ${t.level}</span>
              <span class="pb-streak-big">🔥 ${t.dailyStreak}-day streak</span>
            </div>
            <div class="pb-xp-bar"><div class="pb-xp-fill" style="width:${a}%"></div></div>
            <p class="pb-sub">${t.xpIntoLevel} / ${t.xpForNextLevel} XP to level ${t.level+1} · ${t.totalRounds} rounds played</p>
            <div class="pb-badges-grid">${p}</div>
            <div class="pb-name-row">
              <input id="pbName" type="text" maxlength="24"
                placeholder="${r.role==="student"?"Your name (visible to your teacher)":"Your name on the leaderboard"}"
                value="${c(s)}" />
              <button id="pbNameSave">Save</button>
            </div>
            ${r.isLoggedIn?`<p class="pb-sub">☁ Synced${r.email?` as ${r.email}`:""}</p>`:'<button id="pbSignIn" style="margin-top:8px">☁ Sign in to save & join leaderboard</button>'}
            <div class="pb-links">
              <a href="/dashboard/">📊 My Dashboard</a>
              ${r.isTeacher?'<a href="/teacher/">🏫 Teacher Dashboard</a>':""}
              ${r.isParent?'<a href="/parent/">👪 Parent Dashboard</a>':""}
            </div>
          `:'<div id="pbBoardList" class="pb-board-list"><p class="pb-sub">Loading…</p></div>'}
        </div>
      </div>`);i.querySelector("#pbClose").addEventListener("click",()=>this.closeModal()),i.querySelector("#pbTabProgress").addEventListener("click",()=>this.openPanel("progress")),i.querySelector("#pbTabBoard").addEventListener("click",()=>this.openPanel("leaderboard")),i.querySelector("#pbSignIn")?.addEventListener("click",()=>this.openAuth()),i.querySelector("#pbNameSave")?.addEventListener("click",()=>{const n=i.querySelector("#pbName");b.setPlayerName(n.value.trim().slice(0,24)),r.scheduleSync()}),e==="leaderboard"&&this.loadLeaderboard(i)}async loadLeaderboard(e){const t=e.querySelector("#pbBoardList");if(t)try{const a=x(),{data:o,error:s}=await a.rpc("public_leaderboard");if(s)throw s;if(!o?.length){t.innerHTML='<p class="pb-sub">No entries yet — sign in and play to be the first!</p>';return}t.innerHTML=o.map((p,i)=>`
        <div class="pb-board-row">
          <span class="pb-board-rank">#${i+1}</span>
          <span class="pb-board-name">${c(p.display_name)}</span>
          <span class="pb-board-level">Lvl ${p.level}</span>
          <span class="pb-board-xp">${p.xp} XP</span>
        </div>`).join("")}catch{t.innerHTML='<p class="pb-sub">Couldn’t load the leaderboard — try again later.</p>'}}openAuth(){const e=this.openModal(`
      <div class="pb-panel" style="max-width:320px">
        <h2>☁ Sync Progress</h2>
        <p class="pb-sub">Enter your email — we'll send a magic link. No password needed.</p>
        <input id="pbEmail" type="email" placeholder="you@example.com"
          style="width:100%;box-sizing:border-box;margin-top:8px" autocomplete="email" />
        <div id="pbMsg" style="min-height:16px;font-size:12px;margin:6px 0;color:#f60"></div>
        <button id="pbSend">Send Magic Link</button>
        <button id="pbBack" style="opacity:0.65;margin-top:6px">← Back</button>
      </div>`),t=e.querySelector("#pbEmail"),a=e.querySelector("#pbMsg"),o=e.querySelector("#pbSend");e.querySelector("#pbBack").addEventListener("click",()=>this.openPanel()),o.addEventListener("click",async()=>{const s=t.value.trim();if(!s){a.textContent="Please enter your email.";return}o.disabled=!0,a.textContent="Sending…";try{await r.signIn(s),e.innerHTML=`
          <div class="pb-panel" style="max-width:320px">
            <h2>✉ Check your email!</h2>
            <p class="pb-sub">Link sent to <strong>${s}</strong>. Click it to sign in.</p>
            <button id="pbDone" style="margin-top:14px">← Back</button>
          </div>`,e.querySelector("#pbDone").addEventListener("click",()=>this.closeModal())}catch{o.disabled=!1,a.style.color="#e54040",a.textContent="Could not send — try again."}})}injectStyles(){if(document.getElementById("progress-bar-styles"))return;const e=document.createElement("style");e.id="progress-bar-styles",e.textContent=`
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
    `,document.head.appendChild(e)}}export{m as P};
