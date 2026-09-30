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
 * A "References" paragraph followed by numbered entries becomes a heading over
 * a compact list, and every heading gets an id so the page can carry a
 * contents list. `longReadFor` decides whether a page qualifies: at least
 * LONG_READ_WORDS words and LONG_READ_SECTIONS headings to list.
 */

/** A page this long, with at least this many sections, gets the treatment. */
export const LONG_READ_WORDS = 1500;
export const LONG_READ_SECTIONS = 5;

export interface TocItem { id: string; text: string; level: 2 | 3; caps: boolean }
export interface LongRead { html: string; toc: TocItem[] }

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

/** Superscript footnote numbers in the text between tags, never inside one. */
function footnotes(html: string): string {
  return html.replace(/(>[^<]*)/g, (seg) =>
    seg.replace(/([A-Za-z)\]”"’%])([.,])(\d{1,3}(?:[-–,]\d{1,3})*)(?=[\s]|$)/g, '$1$2<sup class="fn">$3</sup>'));
}

export function longRead(html: string): LongRead {
  const bs = blocks(html);

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

  // 2. Headings typed as paragraphs, and the reference list.
  const out: string[] = [];
  let level = 1;          // the last real heading's level
  const promoted = new Set<Block>();
  const nextTagged = (i: number) => { for (let k = i + 1; k < bs.length; k++) if (bs[k].tag) return k; return -1; };
  const lineText = (x: Block) => (plainPara(x) ? strip(inner(x)) : '');
  const candidate = (i: number) => {
    const t = i >= 0 ? lineText(bs[i]) : '';
    return t.length >= 3 && t.length <= 70 && !ENDS.test(t) && !/,$/.test(t) && /^[A-Z"“]/.test(t);
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
    const next = bs.slice(i + 1).find((x) => x.tag);
    const prev = [...bs.slice(0, i)].reverse().find((x) => x.tag);

    if (/^references$/i.test(t) && next && /^\d+\.\s/.test(strip(inner(next)))) {
      let k = i + 1;
      const refs: string[] = [];
      while (k < bs.length && (!bs[k].tag || (bs[k].tag === 'p' && /^\d+\.\s/.test(strip(inner(bs[k])))))) {
        refs.push(bs[k].html); k++;
      }
      const rl = Math.min(Math.max(level, 2) + 1, 3); // listed in the contents, even under an h3
      out.push(`<h${rl} class="lr-subhead lr-refs-head">${inner(b)}</h${rl}>`);
      out.push(`<div class="lr-refs">${refs.join('')}</div>`);
      i = k - 1;
      continue;
    }

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

  // 3. Ids and the contents list: h2 and h3. Deeper headings stay in the text.
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const joined = out.join('').replace(/<h([2-4])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (_m, lv, attrs = '', body) => {
    const text = strip(body);
    let id = text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section';
    for (let n = 2; used.has(id); n++) id = `${id.replace(/-\d+$/, '')}-${n}`;
    used.add(id);
    if (+lv <= 3) toc.push({ id, text, level: +lv as 2 | 3, caps: isCaps(text) });
    return `<h${lv}${attrs} id="${id}">${body}</h${lv}>`;
  });
  return { html: joined, toc };
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
