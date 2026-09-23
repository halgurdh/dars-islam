import{d as i,r as d,s as r,g as m}from"./Locale-CIm9FfwC.js";import{t as g}from"./legal-i18n-D7TfsKrf.js";const c='<a href="mailto:halgurdh@gmail.com">halgurdh@gmail.com</a>';function n(){const e=g();document.getElementById("backLink").textContent=e.backToGames,document.getElementById("pageTitle").textContent=e.privacyTitle,document.getElementById("pageUpdated").textContent=e.privacyLastUpdated;const t=[...e.privacySections,{heading:e.contactHeading,bodyHtml:`<p>${e.privacyContactBody.replace("{{MAILTO}}",c)}</p>`}];document.getElementById("sections").innerHTML=t.map(o=>`
          <section>
            <h2>${o.heading}</h2>
            ${o.bodyHtml.replace("{{MAILTO}}",c)}
          </section>`).join("")}function a(){const e=document.getElementById("langPicker");e&&d(e,m(),t=>{r(t),a(),n()})}a();n();i().then(()=>{a(),n()});
