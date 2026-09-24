import{G as p}from"./certificates-2VlBhSsR.js";import{e as s,t as c}from"./report-api-C__JXzvV.js";let i=!1;function d(){if(i||document.getElementById("report-card-styles"))return;i=!0;const r=document.createElement("style");r.id="report-card-styles",r.textContent=`
    .report-card { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px; }
    .report-card__row { display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 6px 10px; border-radius: 8px; background: rgba(127,127,127,0.08); font-size: 0.82rem; }
    .report-card__game { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .report-card__tier { white-space: nowrap; font-weight: 700; opacity: 0.9; }
  `,document.head.appendChild(r)}function u(r){return d(),`<div class="report-card">${p.map(o=>{const a=r[o.id]??0,e=c(a);return`<div class="report-card__row">
      <span class="report-card__game">${o.icon} ${s(o.title)}</span>
      <span class="report-card__tier">${e.icon} ${s(e.label)}</span>
    </div>`}).join("")}</div>`}function f(r){const t={};for(const e of p){const n=c(r[e.id]??0).label;t[n]=(t[n]??0)+1}const a=["Platinum","Gold","Silver","Bronze"].filter(e=>t[e]).map(e=>`${t[e]} ${e}`);return a.length?a.join(" · "):"Just getting started"}export{u as r,f as s};
