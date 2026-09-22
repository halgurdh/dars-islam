// Printable certificates — browser print dialog, no PDF library (matches
// this project's "static site, no heavy deps" constraint). Used for both
// automatic individual milestones (feature #5) and teacher-triggered,
// class-wide term-completion certificates (feature #10).
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

const CERT_STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; background: #f4f1ea; }
  .cert { page-break-after: always; width: 900px; max-width: 100%; margin: 24px auto; padding: 56px;
    background: #fffdf8; border: 10px double #b8925a; text-align: center; color: #3a2e1f; }
  .cert:last-child { page-break-after: auto; }
  .cert__icon { font-size: 48px; margin-bottom: 8px; }
  .cert__title { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #a9793b; margin: 0 0 24px; }
  .cert__name { font-size: 40px; margin: 0 0 18px; color: #2c2213; }
  .cert__line { font-size: 18px; margin: 0 0 32px; line-height: 1.5; }
  .cert__achievement { font-weight: bold; color: #a9793b; }
  .cert__footer { display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; color: #6b5a42; }
  @media print { body { background: #fff; } .cert { margin: 0; border-width: 8px; } }
`;

function certificateHtml(studentName: string, achievement: string, subtitle: string | undefined, date: string): string {
  return `
    <div class="cert">
      <div class="cert__icon">🏅</div>
      <p class="cert__title">Certificate of Achievement</p>
      <h1 class="cert__name">${escapeHtml(studentName)}</h1>
      <p class="cert__line">has earned <span class="cert__achievement">${escapeHtml(achievement)}</span>${subtitle ? `<br><span style="font-size:14px;color:#6b5a42">${escapeHtml(subtitle)}</span>` : ''}</p>
      <div class="cert__footer"><span>darsislam Games</span><span>${escapeHtml(date)}</span></div>
    </div>`;
}

function openAndPrint(bodyHtml: string): void {
  const win = window.open('', '_blank', 'width=980,height=720');
  if (!win) return; // popup blocked — nothing more we can do without user action
  win.document.write(`<!doctype html><html><head><title>Certificate</title><style>${CERT_STYLES}</style></head><body>${bodyHtml}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

export interface CertificateInfo { studentName: string; achievement: string; subtitle?: string; }

function today(): string {
  return new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/** One certificate, e.g. for an individual milestone (Gold tier reached, new level). */
export function printCertificate(info: CertificateInfo): void {
  openAndPrint(certificateHtml(info.studentName, info.achievement, info.subtitle, today()));
}

/** One certificate per student, each on its own page — for a teacher's bulk end-of-term print. */
export function printClassCertificates(students: { display_name: string }[], achievement: string, subtitle?: string): void {
  const date = today();
  const html = students.map((s) => certificateHtml(s.display_name || 'Student', achievement, subtitle, date)).join('');
  openAndPrint(html);
}
