import{G as p}from"./certificates-DyPrvBPs.js";import{t as c}from"./sync-CsgRh07u.js";function s(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}let i=!1;function d(){if(i||document.getElementById("report-card-styles"))return;i=!0;const e=document.createElement("style");e.id="report-card-styles",e.textContent=`
    .report-card { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px; }
    .report-card__row { display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 6px 10px; border-radius: 8px; background: rgba(127,127,127,0.08); font-size: 0.82rem; }
    .report-card__game { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .report-card__tier { white-space: nowrap; font-weight: 700; opacity: 0.9; }
  `,document.head.appendChild(e)}function m(e){return d(),`<div class="report-card">${p.map(o=>{const n=e[o.id]??0,t=c(n);return`<div class="report-card__row">
      <span class="report-card__game">${o.icon} ${s(o.title)}</span>
      <span class="report-card__tier">${t.icon} ${s(t.label)}</span>
    </div>`}).join("")}</div>`}function f(e){const r={};for(const t of p){const a=c(e[t.id]??0).label;r[a]=(r[a]??0)+1}const n=["Platinum","Gold","Silver","Bronze"].filter(t=>r[t]).map(t=>`${r[t]} ${t}`);return n.length?n.join(" · "):"Just getting started"}export{m as r,f as s};
