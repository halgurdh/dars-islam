import{d as r,r as m,s,g as d}from"./Locale-CIm9FfwC.js";import{t as g}from"./legal-i18n-D7TfsKrf.js";const c='<a href="mailto:halgurdh@gmail.com">halgurdh@gmail.com</a>',l="/dars-islam/";function n(){const e=g();document.getElementById("backLink").textContent=e.backToGames,document.getElementById("pageTitle").textContent=e.termsTitle;const t=`<a href="${l}privacy">${e.privacyTitle}</a>`,i=[...e.termsSections,{heading:e.contactHeading,bodyHtml:`<p>${e.termsContactBody.replace("{{MAILTO}}",c)}</p>`}];document.getElementById("sections").innerHTML=i.map(o=>`
          <section>
            <h2>${o.heading}</h2>
            ${o.bodyHtml.replace("{{PRIVACY_LINK}}",t).replace("{{MAILTO}}",c)}
          </section>`).join("")}function a(){const e=document.getElementById("langPicker");e&&m(e,d(),t=>{s(t),a(),n()})}a();n();r().then(()=>{a(),n()});
