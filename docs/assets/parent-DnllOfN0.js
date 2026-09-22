import"./theme-BRE4rC8K.js";import{g as d,s as p,B as _,i as h}from"./sync-SUIhl4Uv.js";import{p as f,G as g,S as v}from"./certificates-Qf-mpwmR.js";import{P as b}from"./progress-bar-DJY7ZKPz.js";import{r as k}from"./report-card-K-076QiF.js";const m={async linkChild(e){const n=d(),{error:t}=await n.rpc("link_parent",{p_family_code:e});if(t)throw t},async myChildren(){const e=d(),{data:n,error:t}=await e.rpc("my_children");if(t)throw t;return n??[]},async getControls(e){const n=d(),{data:t,error:a}=await n.from("parental_controls").select("student_id, daily_time_limit_minutes, blocked_game_ids").eq("student_id",e).maybeSingle();if(a)throw a;return t??{student_id:e,daily_time_limit_minutes:null,blocked_game_ids:[]}},async setControls(e,n){const t=d(),{data:{user:a}}=await t.auth.getUser(),{error:o}=await t.from("parental_controls").upsert({student_id:e,daily_time_limit_minutes:n.daily_time_limit_minutes,blocked_game_ids:n.blocked_game_ids,updated_by:a?.id??null});if(o)throw o}};function C(e){return e?Math.floor((Date.now()-new Date(e+"T00:00:00").getTime())/864e5):1/0}const $=new b,l=document.getElementById("app");let c=null;function s(e){return String(e).replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n])}function w(){l.innerHTML=`
          <div class="card">
            <h2>Sign In Required</h2>
            <p class="sub">Sign in with the same email you'll use for darsislam.Games to link your child's account.</p>
            <button id="parentSignIn" style="margin-top:10px">☁ Sign in</button>
          </div>`,document.getElementById("parentSignIn").addEventListener("click",()=>$.openSignIn())}function L(){return`
          <div class="card">
            <h2>Link a Child</h2>
            <p class="sub">Ask your child to open "My Dashboard" and share their Family Code.</p>
            <form id="linkForm" class="row" style="margin-top:10px">
              <input id="familyCode" type="text" maxlength="6" placeholder="Family code (e.g. AB12CD)" style="text-transform:uppercase" />
              <button type="submit">Link</button>
            </form>
            <p class="form-msg" id="linkMsg"></p>
          </div>`}function S(){document.getElementById("linkForm").addEventListener("submit",async e=>{e.preventDefault();const n=document.getElementById("familyCode").value.trim(),t=document.getElementById("linkMsg");if(n){t.className="form-msg",t.textContent="Linking…";try{await m.linkChild(n),t.className="form-msg form-msg--ok",t.textContent="Linked! Loading…",setTimeout(y,600)}catch{t.className="form-msg form-msg--error",t.textContent="Could not link — check the code and try again."}}})}async function x(e){const n=await m.getControls(e.student_id).catch(()=>({daily_time_limit_minutes:null,blocked_game_ids:[]})),t=new Set(n.blocked_game_ids??[]),a=g.map(o=>`
          <label>
            <input type="checkbox" value="${o.id}" ${t.has(o.id)?"checked":""} />
            ${o.icon} ${s(o.title)}
          </label>`).join("");return`
          <div class="card">
            <h2>Screen Time &amp; Content Limits</h2>
            <form id="controlsForm">
              <label class="sub">Daily time limit (minutes, blank = no limit)</label>
              <div class="row" style="margin-top:6px">
                <input id="timeLimit" type="number" min="1" placeholder="e.g. 60" value="${n.daily_time_limit_minutes??""}" style="max-width:140px" />
              </div>
              <p class="sub" style="margin-top:14px">Blocked games:</p>
              <div class="games-checklist" id="gamesChecklist">${a}</div>
              <button type="submit" style="margin-top:12px">Save Controls</button>
              <p class="form-msg" id="controlsMsg"></p>
            </form>
          </div>`}function E(e){document.getElementById("controlsForm").addEventListener("submit",async n=>{n.preventDefault();const t=document.getElementById("controlsMsg"),a=document.getElementById("timeLimit").value.trim(),o=a?Math.max(1,parseInt(a,10)):null,r=[...document.querySelectorAll("#gamesChecklist input:checked")].map(i=>i.value);t.className="form-msg",t.textContent="Saving…";try{await m.setControls(e,{daily_time_limit_minutes:o,blocked_game_ids:r}),t.className="form-msg form-msg--ok",t.textContent="Saved!"}catch{t.className="form-msg form-msg--error",t.textContent="Could not save — try again."}})}function I(e){const n=new Set(e.badges??[]),t=_.filter(i=>n.has(i.id)).map(i=>`
          <div class="badge" title="${s(i.description)}">
            <span class="badge-icon">${i.icon}</span>
            <span class="badge-name">${s(i.name)}</span>
          </div>`).join("")||'<p class="sub">No badges yet.</p>',a=C(e.last_played_date)>=3,o=e.attendance_pct===null||e.attendance_pct===void 0?null:e.attendance_pct,r=g.filter(i=>h(e.game_round_counts?.[i.id]??0));return`
          <div class="card">
            <h2>${s(e.display_name||"Your child")}'s Progress</h2>
            <p class="sub">${s(e.class_name)} · ${s(e.school_name)}</p>
            <p>⭐ Level ${e.level} · 🔥 ${e.daily_streak}-day streak (best ${e.best_daily_streak}) · ${e.xp} XP</p>
            ${o!==null?`<p class="sub">🗓️ Attendance: ${o}%</p>`:""}
            ${a?`<p class="sub">👋 Hasn't played in a few days — might enjoy a nudge to jump back in.</p>`:""}
            <div class="badges-grid" style="margin-top:10px">${t}</div>
            <h2 style="margin-top:16px">Report Card</h2>
            <p class="sub" style="margin-top:0">A lenient, per-game read on practice — there's no failing grade.</p>
            ${k(e.game_round_counts??{})}
            ${r.length?`
              <div class="row" style="margin-top:12px">
                ${r.map(i=>`<button class="ghost" data-cert-game="${i.id}" data-cert-title="${s(i.title)}" data-cert-name="${s(e.display_name||"Student")}">🏅 ${s(i.title)} certificate</button>`).join("")}
              </div>`:""}
          </div>
          <div class="card" id="announcementsCard" hidden></div>`}async function B(e){const n=document.getElementById("announcementsCard");if(n)try{const t=await v.listAnnouncements(e.class_id);if(!t.length){n.hidden=!0;return}n.hidden=!1,n.innerHTML=`
            <h2>📣 From ${s(e.class_name)}'s Teacher</h2>
            ${t.map(a=>`<p style="margin:0 0 8px"><strong>${new Date(a.created_at).toLocaleDateString()}:</strong> ${s(a.message)}</p>`).join("")}`}catch{n.hidden=!0}}async function u(e){const n=e.find(a=>a.student_id===c)??e[0];c=n.student_id;const t=document.getElementById("childDetail");t.innerHTML=`<div class="two-col"><div>${I(n)}</div><div id="controlsHost"></div></div>`,document.getElementById("controlsHost").innerHTML=await x(n),E(n.student_id),document.querySelectorAll("[data-cert-game]").forEach(a=>{a.addEventListener("click",()=>{f({studentName:a.dataset.certName,achievement:`Gold-level practice in ${a.dataset.certTitle}`})})}),B(n)}async function y(){if(!p.isLoggedIn){w();return}let e;try{e=await m.myChildren()}catch{l.innerHTML='<div class="card"><p class="form-msg form-msg--error">Could not load your linked children.</p></div>';return}if(l.innerHTML=L(),S(),e.length===0)return;const n=e.map(t=>`
          <div class="child-tile ${t.student_id===c?"active":""}" data-id="${t.student_id}">
            <strong>${s(t.display_name||"Student")}</strong>
            <span>${s(t.class_name)} · Level ${t.level}</span>
          </div>`).join("");l.innerHTML+=`
          <div class="card">
            <h2>Your Children</h2>
            <div class="child-grid" id="childGrid">${n}</div>
          </div>
          <div id="childDetail"></div>`,document.querySelectorAll(".child-tile").forEach(t=>t.addEventListener("click",()=>{c=t.dataset.id,u(e)})),await u(e)}(async()=>{try{await p.init()}catch{}y()})();
