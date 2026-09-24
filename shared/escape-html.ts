// The one HTML-escaper for every DOM widget that builds markup with
// innerHTML from user- or server-supplied text (player names, class names,
// report fields). Coerces non-strings instead of throwing, since API rows
// can carry numbers/null where a string is expected.
export function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
