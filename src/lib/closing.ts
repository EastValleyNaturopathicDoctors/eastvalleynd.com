/**
 * How a migrated body ends, when it ends by asking the reader to book
 * (tracker C10). Two closings repeat what the page draws around them:
 *
 *   - "button": a heading over the copy's own request button, as every shot
 *     page ends ("Request an Appointment for Injection Therapy"). The sidebar
 *     card offers the same button beside it, so where that card is on screen
 *     the block is marked `closing-ask` for SidebarCTA's wide-screen rule to
 *     hide; on a phone it stays, drawn as C8's outline button.
 *   - "lead": a "Ready to Get Started?" heading over a sentence that points
 *     "below" — at the booking band. Nothing is marked; the layout closes the
 *     gap so the band reads as that section's action.
 *
 * The words are never touched: the button case only gains a class.
 */
export type ClosingAsk = 'button' | 'lead';

/** Empty paragraphs WordPress left around a button (Vitamin D's shot page). */
const EMPTY = String.raw`(?:\s|<p>\s*<\/p>)*`;
const REQUEST_BLOCK = new RegExp(
  String.raw`<h2\b([^>]*)>((?:(?!<\/h2>)[\s\S])*)<\/h2>` + EMPTY +
  String.raw`<p class="cta-inline-btn">(\s*<a\b[^>]*\bhref="\/new-patient-appointment-request\/"[^>]*>(?:(?!<\/p>)[\s\S])*)<\/p>` +
  EMPTY + '$',
);
const LEAD = /<h2\b[^>]*>\s*Ready to Get Started\?\s*<\/h2>\s*<p>(?:(?!<\/p>)[\s\S])*\bbelow\b(?:(?!<\/p>)[\s\S])*<\/p>\s*$/;

/** The body with a closing request block marked, and which closing it has. */
export function closingAsk(html: string): { html: string; ask?: ClosingAsk } {
  const m = html.match(REQUEST_BLOCK);
  if (m) {
    const h2 = /\bclass="/.test(m[1])
      ? `<h2${m[1].replace(/\bclass="/, 'class="closing-ask ')}>`
      : `<h2 class="closing-ask"${m[1]}>`;
    const block = m[0]
      .replace(/^<h2\b[^>]*>/, h2)
      .replace('<p class="cta-inline-btn">', '<p class="cta-inline-btn closing-ask">');
    return { html: html.slice(0, m.index) + block, ask: 'button' };
  }
  return LEAD.test(html) ? { html, ask: 'lead' } : { html };
}
