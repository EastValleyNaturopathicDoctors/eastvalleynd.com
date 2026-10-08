/**
 * Article text (tracker K2): small markup repairs run on every migrated body,
 * long or short. Not one word changes; each fixes how a piece of the WordPress
 * markup *looks*, so sibling pages read alike:
 *
 *   - a list whose only item is another list ("<ol><li><ol>…") drew an empty
 *     bullet, or a doubled "1. 1.", ahead of the real entries — the inner list
 *     takes its place;
 *   - one-line paragraphs opened with "·" (/conditions/diabetes/) — a real
 *     list, with only the dot gone;
 *   - a plain list under the next heading after a checklist, as on three of
 *     the tDCS pages ("Enhance … Regeneration" checked, "Improve Overall
 *     Function" not) — checked like its neighbour;
 *   - eight or more short items — marked `wp-shortlist`, which BodyHtml sets in
 *     columns, so FSM's 52 conditions are not one 2,000px column on a phone;
 *     once a page has one, its other short lists of six or more follow, so
 *     two neighbouring lists are not one in columns and one not (K11);
 *   - "Learn more" in a link's words never breaks between the two (K11);
 *   - an item that holds no words (/conditions/asthma/ ends on "<ul><li>
 *     </li></ul>") drew a lone bullet; it goes, and so does a list left with
 *     no items (K11);
 *   - the reference list (lib/longread.ts `repairReferences`).
 *
 * Heading promotion and the other long-read repairs stay with long pages. The
 * permanent fix belongs in the content pipeline (extract/wpclean.py).
 */
import { repairReferences } from '@/lib/longread';

/** Index just past the tag that closes the `tag` opened at `from`, or -1. */
function closeOf(html: string, from: number, tag: string): number {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = from;
  let depth = 0;
  for (let m; (m = re.exec(html)); ) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  return -1;
}
/** Visible length of an item: tags dropped, an entity counted as one letter. */
const textLength = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&#?\w+;/g, 'x').replace(/\s+/g, ' ').trim().length;
const items = (list: string) => list.match(/<li\b/gi)?.length ?? 0;
const itemTexts = (list: string) => [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1]);

/** "<ol><li><ol>…</ol></li></ol>" → the inner list. */
function unwrapLoneLists(html: string): string {
  const OPEN = /<(ul|ol)\b[^>]*>\s*<li\b[^>]*>\s*<(ul|ol)\b[^>]*>/gi;
  for (let m; (m = OPEN.exec(html)); ) {
    const innerAt = m.index + m[0].lastIndexOf('<');
    const innerEnd = closeOf(html, innerAt, m[2]);
    if (innerEnd < 0) continue;
    const tail = new RegExp(`\\s*</li>\\s*</${m[1]}>`, 'iy');
    tail.lastIndex = innerEnd;
    if (!tail.test(html)) continue;
    html = html.slice(0, m.index) + html.slice(innerAt, innerEnd) + html.slice(tail.lastIndex);
    OPEN.lastIndex = m.index;
  }
  return html;
}

/** Two or more "<p>· …</p>" in a row → one list, the dots dropped. */
function dotLists(html: string): string {
  const DOT = '(?:·|&middot;|&#xB7;|&#183;)';
  const run = new RegExp(`(?:<p>\\s*${DOT}(?:(?!</p>)[\\s\\S])*</p>\\s*){2,}`, 'gi');
  const item = new RegExp(`<p>\\s*${DOT}\\s*([\\s\\S]*?)</p>`, 'gi');
  return html.replace(run, (block) => {
    const lis = [...block.matchAll(item)].map((m) => `<li>${m[1].trim()}</li>`);
    return `<ul>\n${lis.join('\n')}\n</ul>\n`;
  });
}

/** A plain list of short items straight after a checklist and the heading that
 *  follows it is the same kind of list: checked too. */
function siblingChecklists(html: string): string {
  const NEXT = /<ul class="wp-checklist">(?:(?!<\/ul>)[\s\S])*<\/ul>\s*<(h[2-4])\b[^>]*>(?:(?!<\/h)[\s\S])*<\/\1>\s*<ul>/gi;
  for (let m; (m = NEXT.exec(html)); ) {
    const at = m.index + m[0].length - '<ul>'.length;
    const end = closeOf(html, at, 'ul');
    const list = end < 0 ? '' : html.slice(at, end);
    const plain = list && !/<(ul|ol|p|div|a|img)\b/i.test(list.slice(4)) &&
      itemTexts(list).every((t) => textLength(t) <= 60);
    if (!plain) continue;
    html = html.slice(0, at) + '<ul class="wp-checklist">' + html.slice(at + 4);
    NEXT.lastIndex = at;   // it may lead into one more
  }
  return html;
}

/** At least this many items, none longer than this, read better in columns.
 *  On a page that has such a list, its sibling lists of short items do too
 *  from SHORT_SIBLINGS items (/conditions/womens-health/: 8 and 7). */
const SHORT_ITEMS = 8;
const SHORT_SIBLINGS = 6;
const SHORT_LENGTH = 40;
function shortLists(html: string): string {
  const OPEN = /<ul( class="wp-checklist")?>/gi;
  // Item counts of the flat lists of short items, in page order.
  const counts: number[] = [];
  for (const m of html.matchAll(OPEN)) {
    const end = closeOf(html, m.index!, 'ul');
    const list = end < 0 ? '' : html.slice(m.index, end);
    const flat = !!list && !/<(ul|ol|p|div|img|table|figure)\b/i.test(list.slice(m[0].length));
    counts.push(flat && itemTexts(list).every((t) => textLength(t) <= SHORT_LENGTH) ? items(list) : 0);
  }
  const least = counts.some((n) => n >= SHORT_ITEMS) ? SHORT_SIBLINGS : SHORT_ITEMS;
  let k = 0;
  return html.replace(OPEN, (open, checked) =>
    counts[k++] >= least ? `<ul class="${checked ? 'wp-checklist ' : ''}wp-shortlist">` : open);
}

/** "<li> </li>" → nothing; a list with no items left → nothing. */
function emptyItems(html: string): string {
  return html
    .replace(/<li\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/li>\s*/gi, '')
    .replace(/<(ul|ol)\b[^>]*>\s*<\/\1>\s*/gi, '');
}

/** "Learn More" in a link's words: the two stay on one line (U+00A0). */
function keepLearnMore(html: string): string {
  return html.replace(/(<a\b[^>]*>)([\s\S]*?)(<\/a>)/gi, (_, open, words: string, close) =>
    open + words.replace(/(^|>)([^<]+)/g, (_m, gt, text: string) =>
      gt + text.replace(/\b(learn)\s+(more)\b/gi, '$1\u00A0$2')) + close);
}

export function tidyProse(html: string): string {
  return keepLearnMore(repairReferences(shortLists(siblingChecklists(dotLists(unwrapLoneLists(emptyItems(html)))))));
}
