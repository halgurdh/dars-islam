import"./theme-BRE4rC8K.js";import{s as f}from"./sync-SUIhl4Uv.js";import{S as i,a as w,G as y}from"./certificates-Qf-mpwmR.js";import{P as $}from"./progress-bar-DJY7ZKPz.js";import{s as g}from"./report-card-K-076QiF.js";const S={school:"🏫 School",mosque:"🕌 Mosque",homeschool:"🏡 Homeschool",other:"📚 Other"};function C(a){return a?Math.floor((Date.now()-new Date(a+"T00:00:00").getTime())/864e5):1/0}function E(a,e){const t=e.map(l=>l.map(d=>`"${String(d??"").replace(/"/g,'""')}"`).join(",")).join(`\r
`),n=new Blob([t],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(n),s=document.createElement("a");s.href=o,s.download=a,document.body.appendChild(s),s.click(),s.remove(),URL.revokeObjectURL(o)}const B=new $,m=document.getElementById("app");function r(a){return String(a).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function p(a){const e=new URLSearchParams(window.location.search);Object.entries(a).forEach(([t,n])=>n===null?e.delete(t):e.set(t,n)),window.history.pushState({},"",`${window.location.pathname}?${e.toString()}`),u()}function L(){m.innerHTML=`
          <div class="card">
            <h2>Sign In Required</h2>
            <p class="sub">Sign in with the same email you use for dars-islam to create or manage a school.</p>
            <button id="teacherSignIn" style="margin-top:10px">☁ Sign in</button>
          </div>`,document.getElementById("teacherSignIn").addEventListener("click",()=>B.openSignIn())}function _(){m.innerHTML=`
          <div class="two-col">
            <div class="card">
              <h2>Create a School</h2>
              <p class="sub">You'll get an invite code to share with other teachers.</p>
              <form id="createSchoolForm" class="row" style="margin-top:10px">
                <input id="schoolName" type="text" maxlength="120" placeholder="School name" />
                <button type="submit">Create</button>
              </form>
              <p class="form-msg" id="createSchoolMsg"></p>
            </div>
            <div class="card">
              <h2>Join a School</h2>
              <p class="sub">Have an invite code from a colleague?</p>
              <form id="joinSchoolForm" class="row" style="margin-top:10px">
                <input id="schoolCode" type="text" maxlength="8" placeholder="Invite code" style="text-transform:uppercase" />
                <button type="submit">Join</button>
              </form>
              <p class="form-msg" id="joinSchoolMsg"></p>
            </div>
          </div>`,document.getElementById("createSchoolForm").addEventListener("submit",async a=>{a.preventDefault();const e=document.getElementById("schoolName").value.trim(),t=document.getElementById("createSchoolMsg");if(e){t.className="form-msg",t.textContent="Creating…";try{const n=await i.createSchool(e);p({school:n.id,class:null})}catch{t.className="form-msg form-msg--error",t.textContent="Could not create the school."}}}),document.getElementById("joinSchoolForm").addEventListener("submit",async a=>{a.preventDefault();const e=document.getElementById("schoolCode").value.trim(),t=document.getElementById("joinSchoolMsg");if(e){t.className="form-msg",t.textContent="Joining…";try{const n=await i.joinSchool(e);p({school:n.id,class:null})}catch{t.className="form-msg form-msg--error",t.textContent="Invite code not found."}}})}function I(a,e){return a.length<2?"":`<select id="schoolSwitch">${a.map(n=>`<option value="${n.id}" ${n.id===e.id?"selected":""}>${r(n.name)}</option>`).join("")}</select>`}async function A(a,e){m.innerHTML=`
          <div class="card">
            <div class="row" style="justify-content:space-between">
              <h2 style="margin:0">${r(e.name)}</h2>
              ${I(a,e)}
            </div>
            <p class="sub">Invite other teachers with code <span class="code-chip">${e.invite_code}</span></p>
            <form id="createClassForm" class="row" style="margin-top:14px">
              <input id="className" type="text" maxlength="80" placeholder="New class name (e.g. Grade 4B)" />
              <button type="submit">Create Class</button>
            </form>
            <p class="form-msg" id="createClassMsg"></p>
            <div class="class-grid" id="classGrid"></div>
          </div>
          <div class="card" id="orgSettingsCard"><p class="sub">Loading settings…</p></div>
          <div class="two-col" id="schoolStats"></div>`,document.getElementById("schoolSwitch")?.addEventListener("change",t=>p({school:t.target.value,class:null})),i.getSchoolProfile(e.id).then(t=>{const n=Object.entries(S).map(([o,s])=>`<option value="${o}" ${t.org_type===o?"selected":""}>${s}</option>`).join("");document.getElementById("orgSettingsCard").innerHTML=`
            <h2>⚙️ Organization Settings</h2>
            <p class="sub">Label your organization and greet students who join — a mosque, homeschool co-op, or club works exactly like a school here.</p>
            <div class="row" style="margin-top:10px">
              <select id="orgType">${n}</select>
            </div>
            <textarea id="welcomeMessage" maxlength="300" placeholder="Optional welcome message shown to students when they join (e.g. 'Welcome to Al-Noor Mosque weekend classes!')"
              style="width:100%;box-sizing:border-box;margin-top:10px;min-height:64px;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;padding:9px 12px;font-size:0.88rem;font-family:inherit;">${r(t.welcome_message??"")}</textarea>
            <button id="saveOrgSettings" style="margin-top:10px">Save</button>
            <p class="form-msg" id="orgSettingsMsg"></p>`,document.getElementById("saveOrgSettings").addEventListener("click",async()=>{const o=document.getElementById("orgSettingsMsg");o.className="form-msg",o.textContent="Saving…";try{await i.updateSchoolProfile(e.id,document.getElementById("orgType").value,document.getElementById("welcomeMessage").value),o.className="form-msg form-msg--ok",o.textContent="Saved."}catch{o.className="form-msg form-msg--error",o.textContent="Could not save — try again."}})}).catch(()=>{document.getElementById("orgSettingsCard").innerHTML=""}),document.getElementById("classGrid").innerHTML=e.classes.length?e.classes.map(t=>`
              <a class="class-tile" href="?school=${e.id}&class=${t.id}" data-class="${t.id}">
                <strong>${r(t.name)}</strong>
                <span>Code <span class="code-chip">${t.join_code}</span></span>
                <span>${t.student_count} student${t.student_count===1?"":"s"} · avg ${t.avg_xp} XP</span>
              </a>`).join(""):'<p class="sub">No classes yet — create one above.</p>',m.querySelectorAll(".class-tile").forEach(t=>t.addEventListener("click",n=>{n.preventDefault(),p({school:e.id,class:t.dataset.class})})),document.getElementById("createClassForm").addEventListener("submit",async t=>{t.preventDefault();const n=document.getElementById("className").value.trim(),o=document.getElementById("createClassMsg");if(n){o.className="form-msg",o.textContent="Creating…";try{await i.createClass(e.id,n),u()}catch{o.className="form-msg form-msg--error",o.textContent="Could not create the class."}}});try{const t=await i.schoolDashboard(e.id),n=(o,s)=>o.length?o.map((l,d)=>`<tr class="${s}"><td>#${d+1}</td><td>${r(l.display_name)}</td><td>${r(l.class_name??"")}</td><td>${l.xp} XP</td></tr>`).join(""):'<tr><td colspan="4" class="sub">No students yet</td></tr>';document.getElementById("schoolStats").innerHTML=`
            <div class="card">
              <h2>🏆 Top Students (School-Wide)</h2>
              <table><thead><tr><th>#</th><th>Name</th><th>Class</th><th>XP</th></tr></thead>
                <tbody>${n(t.top_students,"top-row")}</tbody></table>
            </div>
            <div class="card">
              <h2>🌱 Could Use a Nudge</h2>
              <table><thead><tr><th>#</th><th>Name</th><th>Class</th><th>XP</th></tr></thead>
                <tbody>${n(t.bottom_students,"bottom-row")}</tbody></table>
            </div>`}catch{}}async function k(a){const e=await i.listAssignedGames(a).catch(()=>[]),t=Object.fromEntries(e.map(c=>[c.game_id,c.due_date])),n=new Set(e.map(c=>c.game_id)),o=y.filter(c=>n.has(c.id)),s=y.filter(c=>!n.has(c.id)),l=o.length?o.map(c=>`
              <div class="code-chip" data-game-id="${c.id}" style="margin:0 6px 6px 0;display:inline-flex;align-items:center;gap:6px;">
                <span>${c.icon} ${r(c.title)}</span>
                <input type="date" class="due-date-input" value="${t[c.id]??""}" title="Due date (optional — a reminder, not a penalty)" style="font-size:11px;padding:2px 4px;" />
              </div>`).join(""):'<p class="sub">No games assigned yet.</p>',d=s.map(c=>`
          <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;color:var(--text-secondary);">
            <input type="checkbox" value="${c.id}" /> ${c.icon} ${r(c.title)}
          </label>`).join("");return`
          <div class="card">
            <h2>📌 Assigned Games</h2>
            <div>${l}</div>
            ${o.length?'<p class="sub" style="margin-top:4px">Optional due date shown as a reminder chip to students — nothing is locked or penalized.</p>':""}
            ${s.length?`
              <p class="sub" style="margin-top:14px">Assign more:</p>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;max-height:220px;overflow-y:auto;margin-top:6px;">
                ${d}
              </div>
              <button id="assignGamesBtn" style="margin-top:12px">Assign Selected</button>
              <p class="form-msg" id="assignGamesMsg"></p>
            `:'<p class="sub" style="margin-top:10px">All games are assigned.</p>'}
          </div>`}function N(a){document.querySelectorAll(".code-chip[data-game-id] .due-date-input").forEach(e=>{e.addEventListener("change",async()=>{const t=e.closest("[data-game-id]").getAttribute("data-game-id");try{await i.setAssignmentDueDate(a,t,e.value||null)}catch{}})}),document.getElementById("assignGamesBtn")?.addEventListener("click",async()=>{const e=document.getElementById("assignGamesMsg"),t=[...document.querySelectorAll("#app input[type=checkbox]:checked")].map(n=>n.value);if(t.length!==0){e.className="form-msg",e.textContent="Assigning…";try{await Promise.all(t.map(n=>i.assignGame(a,n))),u()}catch{e.className="form-msg form-msg--error",e.textContent="Could not assign — try again."}}})}function M(a){return`
          <div class="card">
            <h2>📣 Class Announcements</h2>
            <div>${a.length?a.map(t=>`
              <div class="row" style="justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <div><p style="margin:0;font-size:0.88rem;">${r(t.message)}</p><p class="sub" style="margin:2px 0 0">${new Date(t.created_at).toLocaleDateString()}</p></div>
                <button class="ghost" data-delete-announcement="${t.id}" style="padding:4px 8px;font-size:0.75rem;">✕</button>
              </div>`).join(""):'<p class="sub">No announcements yet.</p>'}</div>
            <form id="postAnnouncementForm" class="row" style="margin-top:12px">
              <input id="announcementText" type="text" maxlength="500" placeholder="Homework, reminders, anything for the class…" />
              <button type="submit">Post</button>
            </form>
            <p class="form-msg" id="announcementMsg"></p>
          </div>`}function j(a){document.getElementById("postAnnouncementForm")?.addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("announcementText"),n=document.getElementById("announcementMsg");if(t.value.trim()){n.className="form-msg",n.textContent="Posting…";try{await i.postAnnouncement(a,t.value),t.value="",v(a)}catch{n.className="form-msg form-msg--error",n.textContent="Could not post — try again."}}}),document.querySelectorAll("[data-delete-announcement]").forEach(e=>{e.addEventListener("click",async()=>{try{await i.deleteAnnouncement(e.dataset.deleteAnnouncement),v(a)}catch{}})})}async function T(a,e){const t=new Date().toISOString().slice(0,10),n=await i.classAttendance(a,t).catch(()=>({}));return`
          <div class="card">
            <h2>🗓️ Attendance — Today</h2>
            <p class="sub">Check who's present for today's session. Unchecked = absent for this date only.</p>
            <div style="margin-top:8px">${e.students.map(s=>`
          <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;padding:4px 0;">
            <input type="checkbox" value="${s.student_id}" ${n[s.student_id]!==!1?"checked":""} />
            ${r(s.display_name)}
          </label>`).join("")||'<p class="sub">No students yet.</p>'}</div>
            ${e.students.length?'<button id="saveAttendanceBtn" style="margin-top:10px">Save Attendance</button><p class="form-msg" id="attendanceMsg"></p>':""}
          </div>`}function H(a){document.getElementById("saveAttendanceBtn")?.addEventListener("click",async e=>{const n=[...e.target.closest(".card").querySelectorAll("input[type=checkbox]:checked")].map(s=>s.value),o=document.getElementById("attendanceMsg");o.className="form-msg",o.textContent="Saving…";try{await i.markAttendance(a,new Date().toISOString().slice(0,10),n),o.className="form-msg form-msg--ok",o.textContent="Saved."}catch{o.className="form-msg form-msg--error",o.textContent="Could not save — try again."}})}let h=null,b=null;async function v(a){const e=h.classes.find(t=>t.id===a);e&&await x(b,h,e)}async function x(a,e,t){h=e,b=a,m.innerHTML='<div class="card"><p class="sub">Loading roster…</p></div>';try{const n=await i.classRoster(t.id),o=n.students.map((s,l)=>{const d=l<3?"top-row":l>=n.students.length-3&&n.students.length>3?"bottom-row":"",c=C(s.last_played_date)>=3;return`<tr class="${d}">
              <td>#${l+1}</td>
              <td>${c?`<span title="Hasn't played in a few days — might be worth a friendly nudge">👋</span> `:""}${r(s.display_name)}</td>
              <td>Lvl ${s.level}</td>
              <td>🔥 ${s.daily_streak}</td>
              <td>${s.badge_count} 🏅</td>
              <td>${s.xp} XP</td>
              <td style="white-space:nowrap;font-size:0.78rem;">${r(g(s.game_round_counts))}</td>
              <td>${s.attendance_pct===null?"—":s.attendance_pct+"%"}</td>
              <td><input type="text" class="teacher-note-input" data-student="${s.student_id}" value="${r(s.teacher_note??"")}" maxlength="500" placeholder="Private note…" style="width:120px;font-size:0.78rem;background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:6px;padding:4px 6px;" /></td>
            </tr>`}).join("")||'<tr><td colspan="9" class="sub">No students have joined yet.</td></tr>';m.innerHTML=`
            <div class="card">
              <button class="ghost" id="backToSchool">← Back to ${r(e.name)}</button>
              <div class="row" style="justify-content:space-between; margin-top:12px">
                <h2 style="margin:0">${r(n.class.name)}</h2>
                <span class="sub">Share code <span class="code-chip">${n.class.join_code}</span></span>
              </div>
              <p class="sub">${n.students.length} students · class average ${n.avg_xp} XP</p>
              <div style="overflow-x:auto">
                <table>
                  <thead><tr><th>#</th><th>Name</th><th>Level</th><th>Streak</th><th>Badges</th><th>XP</th><th>Report card</th><th>Attend.</th><th>Note</th></tr></thead>
                  <tbody>${o}</tbody>
                </table>
              </div>
              <div class="row" style="margin-top:12px">
                <button class="ghost" id="exportCsvBtn">⬇ Export CSV</button>
                <button class="ghost" id="printReportBtn">🖨 Print Class Report</button>
                <button class="ghost" id="printCertsBtn">🏅 Print Term Certificates</button>
              </div>
            </div>
            <div id="announcementsHost"></div>
            <div id="attendanceHost"></div>
            <div id="assignGamesHost"></div>`,document.getElementById("backToSchool").addEventListener("click",()=>p({school:e.id,class:null})),document.querySelectorAll(".teacher-note-input").forEach(s=>{s.addEventListener("change",async()=>{try{await i.setTeacherNote(s.dataset.student,s.value)}catch{}})}),document.getElementById("exportCsvBtn").addEventListener("click",()=>{const l=[["#","Name","Level","Streak","Badges","XP","Report card","Attendance %"],...n.students.map((d,c)=>[c+1,d.display_name,d.level,d.daily_streak,d.badge_count,d.xp,g(d.game_round_counts),d.attendance_pct===null?"":d.attendance_pct])];E(`${n.class.name.replace(/[^a-z0-9]+/gi,"-")}-roster.csv`,l)}),document.getElementById("printReportBtn").addEventListener("click",()=>{const s=window.open("","_blank","width=900,height=700");if(!s)return;const l=`<h1>${r(n.class.name)}</h1><p>${n.students.length} students · class average ${n.avg_xp} XP · ${new Date().toLocaleDateString()}</p>
              <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-family:sans-serif">
                <tr><th>Name</th><th>Level</th><th>XP</th><th>Report card</th><th>Attendance</th></tr>
                ${n.students.map(d=>`<tr><td>${r(d.display_name)}</td><td>${d.level}</td><td>${d.xp}</td><td>${r(g(d.game_round_counts))}</td><td>${d.attendance_pct===null?"—":d.attendance_pct+"%"}</td></tr>`).join("")}
              </table>`;s.document.write(`<!doctype html><html><head><title>${r(n.class.name)} report</title></head><body>${l}</body></html>`),s.document.close(),s.focus(),setTimeout(()=>s.print(),300)}),document.getElementById("printCertsBtn").addEventListener("click",()=>{w(n.students,"Successful Completion of Term",n.class.name)}),document.getElementById("announcementsHost").innerHTML=M(await i.listAnnouncements(t.id).catch(()=>[])),j(t.id),document.getElementById("attendanceHost").innerHTML=await T(t.id,n),H(t.id),document.getElementById("assignGamesHost").innerHTML=await k(t.id),N(t.id)}catch{m.innerHTML=`<div class="card"><p class="form-msg form-msg--error">Could not load this class's roster.</p></div>`}}async function u(){if(!f.isLoggedIn){L();return}let a;try{({schools:a}=await i.listSchools())}catch{m.innerHTML='<div class="card"><p class="form-msg form-msg--error">Could not load your schools.</p></div>';return}if(a.length===0){_();return}const e=new URLSearchParams(window.location.search),t=a.find(s=>s.id===e.get("school"))??a[0],n=e.get("class"),o=n?t.classes.find(s=>s.id===n):null;o?await x(a,t,o):await A(a,t)}window.addEventListener("popstate",u);(async()=>{try{await f.init()}catch{}u()})();
