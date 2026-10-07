/**
 * Long reads (D131): how a very long migrated body is *displayed*. Not one
 * word of it changes — this only repairs the markup the text arrived in and
 * adds a way to find your place.
 *
 * Some WordPress pages are whole articles pasted from Word or a PDF:
 * /conditions/cancer-support/ is 20,000 words under four headings. The paste
 * left three kinds of damage, all in the markup, none in the words:
 *
 *   - sentences broken across two paragraphs ("…to form a new</p><p>metastatic
 *     cancer.") — rejoined when the first ends without punctuation and the next
 *     starts in lower case;
 *   - section titles typed as plain paragraphs ("PHASE I: Detoxification") —
 *     given a heading tag at the next level down, text unchanged;
 *   - footnote numbers run into the text ("adhesion.9") — set as superscripts.
 *
 * Every heading gets an id so the page can carry a contents list. The
 * reference list is repaired on every body, long or not (`repairReferences`,
 * run from lib/prose.ts; tracker K2). `longReadFor` decides whether a page
 * qualifies: at least LONG_READ_WORDS words and LONG_READ_SECTIONS headings
 * to list.
 */

/** A page this long, with at least this many headings to list, gets the
 *  treatment — so sibling pages of similar length look alike (tracker N9). */
export const LONG_READ_WORDS = 1000;
export const LONG_READ_SECTIONS = 6;

/** `main`: a numbered section; the others nest beneath the one before. */
export interface TocItem { id: string; text: string; level: 2 | 3 | 4; main: boolean; caps: boolean }
/** `sections`: how many main sections the list has. */
export interface LongRead { html: string; toc: TocItem[]; sections: number }

const NAMED: Record<string, string> = {
  amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…',
};
/** Text of an HTML fragment, entities decoded — Astro writes "&" as "&#x26;". */
const strip = (s: string) =>
  s.replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ').trim();
const wordCount = (s: string) => strip(s).split(' ').filter(Boolean).length;
/** Mostly capitals: "DIETARY PROTOCOLS for CANCER…". Displayed as a small-caps label. */
const isCaps = (t: string) => {
  const letters = t.replace(/[^A-Za-z]/g, '');
  return letters.length > 6 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.6;
};
/** A journal reference: volume(issue) after a semicolon, or a DOI. */
const CITATION = /;\s*\d+\s*\(\d+\)|\bdoi:\s*10\./i;
/** Ends a sentence, a quote, or a footnote run: "…growth.” 55", "…cancer.10". */
const ENDS = /[.!?:;”"’)\]][\d,\-–]*$/;

// Top-level blocks of a body. Tables and lists are opaque: nothing inside them
// is rejoined, promoted or superscripted.
type Block = { tag: string; html: string };
function blocks(html: string): Block[] {
  const out: Block[] = [];
  const re = /<(p|h[1-6]|table|ul|ol|blockquote|figure|details|div|section)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let last = 0;
  for (const m of html.matchAll(re)) {
    if (m.index! > last) out.push({ tag: '', html: html.slice(last, m.index) });
    out.push({ tag: m[1].toLowerCase(), html: m[0] });
    last = m.index! + m[0].length;
  }
  if (last < html.length) out.push({ tag: '', html: html.slice(last) });
  return out;
}
const inner = (b: Block) => b.html.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '');
const plainPara = (b: Block) => b.tag === 'p' && !/<(?!\/?(strong|b|em|i)\b)[a-z]/i.test(inner(b));
/** The whole line in bold: "<strong>What is Photobiomodulation?</strong>". */
const allBold = (b: Block) =>
  /<(strong|b)\b/i.test(inner(b)) && !strip(inner(b).replace(/<(strong|b)\b[^>]*>[\s\S]*?<\/\1>/gi, ''));

/** Superscript footnote numbers in the text between tags, never inside one. */
function footnotes(html: string): string {
  return html.replace(/(>[^<]*)/g, (seg) =>
    seg.replace(/([A-Za-z)\]”"’%])([.,])(\d{1,3}(?:[-–,]\d{1,3})*)(?=[\s]|$)/g, '$1$2<sup class="fn">$3</sup>'));
}

/** "References" (or "CITATIONS") on its own line over numbered entries: a
 *  heading over a compact list. Run on every body, long or not (tracker K2):
 *  it only sets the list as what it is, so a short page needs it as much. */
const REFS_LABEL = /^(references|citations)$/i;
export function repairReferences(html: string): string {
  if (!/references|citations/i.test(html)) return html;
  const bs = blocks(html);
  const out: string[] = [];
  let level = 1;          // the last real heading's level
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    const h = /^h([1-6])$/.exec(b.tag);
    if (h) level = +h[1];
    const t = plainPara(b) ? strip(inner(b)) : '';
    const next = bs.slice(i + 1).find((x) => x.tag);
    if (REFS_LABEL.test(t) && next && /^\d+\.\s/.test(strip(inner(next)))) {
      let k = i + 1;
      const refs: string[] = [];
      while (k < bs.length && (!bs[k].tag || (bs[k].tag === 'p' && /^\d+\.\s/.test(strip(inner(bs[k])))))) {
        refs.push(bs[k].html); k++;
      }
      const rl = Math.min(Math.max(level, 2) + 1, 3); // listed in the contents, even under an h3
      out.push(`<h${rl} class="lr-subhead lr-refs-head${isCaps(t) ? ' is-caps' : ''}">${inner(b)}</h${rl}>`);
      out.push(`<div class="lr-refs">${refs.join('')}</div>`);
      i = k - 1;
      continue;
    }
    out.push(b.html);
  }
  return out.join('');
}

export function longRead(html: string): LongRead {
  const bs = blocks(repairReferences(html));   // already done when lib/prose.ts ran

  // 1. Rejoin sentences split across paragraphs.
  for (let i = 0; i < bs.length - 1; i++) {
    const a = bs[i];
    let j = i + 1;
    while (j < bs.length && bs[j].tag === '' && !bs[j].html.trim()) j++;
    const b = bs[j];
    if (!b || a.tag !== 'p' || b.tag !== 'p') continue;
    const at = strip(inner(a)), bt = strip(inner(b));
    if (at && bt && !ENDS.test(at) && /^[a-z]/.test(bt)) {
      a.html = a.html.replace(/<\/p>$/, ' ' + inner(b).trimStart() + '</p>');
      bs.splice(i + 1, j - i);
      i--; // the merged paragraph may continue into the next one too
    }
  }

  // 2. Headings typed as paragraphs.
  const out: string[] = [];
  let level = 1;          // the last real heading's level
  const promoted = new Set<Block>();
  const nextTagged = (i: number) => { for (let k = i + 1; k < bs.length; k++) if (bs[k].tag) return k; return -1; };
  const lineText = (x: Block) => (plainPara(x) ? strip(inner(x)) : '');
  // A question set in capitals or in bold is a title too, mark and all ("DO I
  // HAVE ONE of the NINE COMMON SYMPTOMS of INSOMNIA?") (tracker N9).
  const candidate = (i: number) => {
    const t = i >= 0 ? lineText(bs[i]) : '';
    const ends = ENDS.test(t) && !(/\?$/.test(t) && (isCaps(t) || allBold(bs[i])));
    return t.length >= 3 && t.length <= 70 && !ends && !/,$/.test(t) && /^[A-Z"“]/.test(t);
  };
  const longPara = (i: number) => i >= 0 && bs[i].tag === 'p' && wordCount(bs[i].html) >= 25;
  const titleAt = (i: number) => {
    if (!candidate(i)) return false;
    const n = nextTagged(i);
    return longPara(n) || (candidate(n) && longPara(nextTagged(n)));
  };
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    const h = /^h([1-6])$/.exec(b.tag);
    if (h) { level = +h[1]; out.push(b.html); continue; }
    const t = plainPara(b) ? strip(inner(b)) : '';
    const prev = [...bs.slice(0, i)].reverse().find((x) => x.tag);

    // A title is a short plain line that opens a long paragraph, directly or
    // through one more title ("Chemotherapy Support" / "REASON ONE. …"). A
    // run of short lines is a list, not a heading, so the line before must not
    // be an unpromoted short one. A line repeating the heading just above it
    // stays as it is.
    const looksLikeTitle = titleAt(i) && !(prev && prev === bs[i - 1] && /^h\d$/.test(prev.tag) && strip(inner(prev)).toLowerCase() === t.toLowerCase()) &&
      !(prev && plainPara(prev) && strip(inner(prev)).length <= 70 && !promoted.has(prev));
    if (looksLikeTitle) {
      promoted.add(b);
      const lv = Math.min(Math.max(level, 2) + 1, 4);
      out.push(`<h${lv} class="lr-subhead${isCaps(t) ? ' is-caps' : ''}">${inner(b)}</h${lv}>`);
      continue;
    }
    out.push(b.tag === 'p' ? footnotes(b.html) : b.html);
  }

  // 3. Ids and the contents list (tracker N9). The h2s are the main sections,
  // with the h3s nested under them; a page with at most one h2 is built from
  // its h3s instead, with the h4s nested. Headings inside a collapsed answer
  // stay out of the list: a link to one would land on nothing visible. So do
  // journal lines a post set as headings ("Basic Clin Neurosci. 2015
  // Jan;6(1):14-20."): a list of them helps no one find their place. Main
  // sections are numbered (`lr-sec`) when there are two or more, and the
  // first one takes no rule above it when no text comes before it (`lr-first`).
  // Sections whose titles carry their own numbers ("1. Remove Toxic
  // Obstacles") take no second one: "02" over "1." reads as a mistake
  // (`lr-own`, tracker K2).
  const body = out.join('');
  const HEAD = /<(\/?)details\b[^>]*>|<h([2-4])(\s[^>]*)?>([\s\S]*?)<\/h\2>/gi;
  const levels: number[] = [], hidden: boolean[] = [], texts: string[] = [];
  let depth = 0;
  for (const m of body.matchAll(HEAD)) {
    if (!m[2]) { depth = Math.max(0, depth + (m[1] ? -1 : 1)); continue; }
    levels.push(+m[2]);
    texts.push(strip(m[4]));
    hidden.push(depth > 0 || CITATION.test(texts.at(-1)!));
  }
  const top = levels.filter((lv, k) => lv === 2 && !hidden[k]).length >= 2 ? 2 : 3;
  const sections = levels.filter((lv, k) => lv <= top && !hidden[k]).length;
  const ownNumbers = texts.some((t, k) => levels[k] <= top && !hidden[k] && /^\d+[.)]\s/.test(t));
  const withClass = (attrs: string, cls: string) => !cls ? attrs
    : /(^|\s)class="/.test(attrs) ? attrs.replace(/(^|\s)class="/, `$1class="${cls} `) : `${attrs} class="${cls}"`;

  const toc: TocItem[] = [];
  const used = new Set<string>();
  let k = 0;
  const joined = body.replace(HEAD, (m, _close, lv, attrs = '', inner: string, at: number) => {
    if (!lv) return m;
    const text = strip(inner);
    let id = text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section';
    for (let n = 2; used.has(id); n++) id = `${id.replace(/-\d+$/, '')}-${n}`;
    used.add(id);
    const shown = !hidden[k++];
    const main = shown && +lv <= top;
    const first = main && !toc.some((t) => t.main) && !strip(body.slice(0, at));
    if (shown && +lv <= top + 1) toc.push({ id, text, level: +lv as 2 | 3 | 4, main, caps: isCaps(text) });
    const cls = [main && sections >= 2 && 'lr-sec', main && ownNumbers && 'lr-own', first && 'lr-first'].filter(Boolean).join(' ');
    return `<h${lv}${withClass(attrs, cls)} id="${id}">${inner}</h${lv}>`;
  });
  return { html: joined, toc, sections };
}

/** "About 90 minutes", from the page's word count at an unhurried 225 wpm. */
export function readingTime(words: number): string {
  const min = words / 225;
  const n = min > 30 ? Math.round(min / 5) * 5 : Math.max(1, Math.round(min));
  return `${n} min read`;
}

/** The long-read version of a body, or null when the page is too short or has
 *  too few sections for a contents list to help. */
export function longReadFor(html: string, words: number): LongRead | null {
  if (words < LONG_READ_WORDS) return null;
  const lr = longRead(html);
  return lr.toc.length >= LONG_READ_SECTIONS ? lr : null;
}
