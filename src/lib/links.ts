/**
 * Links inside a migrated body (tracker L3): tidied at build time, words
 * untouched. The WordPress copy carried links that pass the broken-link check
 * but still misbehave:
 *
 *   - links through an old address that only redirects (eight on
 *     /neurofeedback/) — pointed straight at the final page, using the rules
 *     in public/_redirects (read here, never edited: it is generated);
 *   - internal pages that open in a new tab — opened in the same tab;
 *   - empty links (`href=""`, which just reload the page), links to the page
 *     they sit on, and homepage links on the clinic's name mid-sentence —
 *     the link goes, the words stay;
 *   - an `<a>` with no address whose text is an email address — made a
 *     mailto link; any other address-less `<a>` is unwrapped like an empty one.
 *   - links to a placeholder page (tracker N1) — pointed at the finished
 *     page on the same topic (src/data/stub-fallbacks.ts), or unwrapped.
 *   - links to a page that repeats another (tracker R2) — pointed at the page
 *     kept (src/data/duplicate-pages.ts).
 *   - phone numbers written as plain text — made tel links, the number shown
 *     exactly as written (tracker P2; linkPhones below).
 *
 * Each rule is one entry in FIXES, run in order on every link, so a new rule
 * is one more function. The permanent fix
 * belongs in the content pipeline; this keeps the built pages right until then.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { site } from '@/data/site';
import { stubFallbacks } from '@/data/stub-fallbacks';
import { isStub, isSame, keeperOf } from '@/lib/nav';

/** One `<a>` from the body. `attrs` keep their order; null = valueless attribute. */
export interface Link {
  attrs: [string, string | null][];
  inner: string;
  /** Visible text, tags stripped and whitespace collapsed. */
  text: string;
}
/** What a rule sees besides the link: the route of the page it sits on. */
export interface LinkContext { route: string }
/** A rule edits the link in place, or returns 'unwrap' to keep only its words. */
export type LinkFix = (link: Link, ctx: LinkContext) => 'unwrap' | void;

const attr = (l: Link, name: string) => l.attrs.find(([n]) => n === name)?.[1];
const setAttr = (l: Link, name: string, value: string) => {
  const a = l.attrs.find(([n]) => n === name);
  if (a) a[1] = value; else l.attrs.push([name, value]);
};
const dropAttr = (l: Link, name: string) => { l.attrs = l.attrs.filter(([n]) => n !== name); };

/** An own-site address as a root-relative one ("https://www.eastvalleynd.com/x/" → "/x/"). */
const OWN = /^https?:\/\/(?:www\.)?eastvalleynd\.com(?=[/?#]|$)/i;
/** Path, query and fragment of an internal href, or null for anything external. */
function internal(href: string) {
  const h = href.replace(OWN, (m) => (href.length === m.length ? '/' : ''));
  if (!h.startsWith('/') || h.startsWith('//')) return null;
  const m = h.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/)!;
  return { path: m[1] || '/', query: m[2] ?? '', hash: m[3] ?? '' };
}

/** public/_redirects as source → destination, parsed once per build. */
let redirectMap: Map<string, string> | undefined;
function redirects() {
  if (redirectMap) return redirectMap;
  redirectMap = new Map();
  const file = readFileSync(path.join(process.cwd(), 'public/_redirects'), 'utf8');
  for (const line of file.split('\n')) {
    const [from, to] = line.trim().split(/\s+/);
    if (from?.startsWith('/') && to) redirectMap.set(from, to);
  }
  return redirectMap;
}
/** Where a path finally lands, following chained rules (none today) a few hops. */
function settle(p: string) {
  const map = redirects();
  for (let i = 0; i < 5 && map.has(p); i++) p = map.get(p)!;
  return p;
}

const EMAIL = /^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/;
/** A page, not a document: documents may keep their new tab. */
const isPage = (p: string) => !/\.(?!html?$)[a-z0-9]{2,5}$/i.test(p);

export const FIXES: LinkFix[] = [
  // No address at all: an email becomes a mailto link, anything else is text.
  (l) => {
    if (attr(l, 'href') !== undefined) return;
    if (!EMAIL.test(l.text)) return attr(l, 'id') || attr(l, 'name') ? undefined : 'unwrap';
    l.attrs = l.attrs.filter(([n]) => n !== 'target' && n !== 'rel');
    setAttr(l, 'href', `mailto:${l.text}`);
  },
  // An empty address only reloads the page.
  (l) => {
    const href = attr(l, 'href');
    if (href !== undefined && ['', '#'].includes((href ?? '').trim())) return 'unwrap';
  },
  // Old addresses straight to their final page; internal pages in the same tab.
  (l) => {
    const href = attr(l, 'href');
    const to = href ? internal(href) : null;
    if (!to) return;
    const dest = settle(to.path);
    if (dest !== to.path) setAttr(l, 'href', dest + to.query + to.hash);
    if (!isPage(dest) || !attr(l, 'target')) return;
    dropAttr(l, 'target');
    const rel = (attr(l, 'rel') ?? '').split(/\s+/).filter((r) => r && r !== 'noopener' && r !== 'noreferrer');
    if (rel.length) setAttr(l, 'rel', rel.join(' ')); else dropAttr(l, 'rel');
  },
  // A duplicate page: the page it repeats. Same body, so a #section still lands.
  (l) => {
    const to = internal(attr(l, 'href') ?? '');
    if (!to) return;
    const dest = keeperOf(to.path);
    if (dest !== to.path) setAttr(l, 'href', dest + to.query + to.hash);
  },
  // A placeholder page: its stand-in, or just the words when it has none.
  // Before the self-link rule, so a stand-in that is this very page goes too.
  (l) => {
    const to = internal(attr(l, 'href') ?? '');
    if (!to || !isStub(to.path)) return;
    const dest = Object.entries(stubFallbacks).find(([from]) => isSame(from, to.path))?.[1];
    if (!dest) return 'unwrap';
    setAttr(l, 'href', dest + to.query);   // its #section belonged to the placeholder
  },
  // A link to the page it sits on, or to the homepage on the clinic's name.
  (l, { route }) => {
    const to = internal(attr(l, 'href') ?? '');
    if (!to || to.hash) return;
    if (to.path === route && !to.query) return 'unwrap';
    if (to.path === '/' && (l.text.includes(site.name) || l.text === site.short)) return 'unwrap';
  },
];

/** A US number as the copy writes it: "(480) 906-2534" or "480-906-2534". */
const PHONE = /\(\d{3}\)\s?\d{3}-\d{4}\b|\b\d{3}[-.]\d{3}[-.]\d{4}\b/g;

/**
 * Plain-text phone numbers as tel links (tracker P2): a phone can dial them,
 * the words stay as written. Only text between tags is touched, never an
 * attribute or a number that already sits inside a link.
 */
export function linkPhones(html: string): string {
  return html.split(/(<a\b[\s\S]*?<\/a>|<[^>]*>)/i).map((part, i) =>
    i % 2 ? part : part.replace(PHONE, (n) => `<a href="tel:${n.replace(/\D/g, '')}">${n}</a>`),
  ).join('');
}

/**
 * The body with FIXES applied to every `<a>`, then its plain-text phone
 * numbers linked. `route` is the page's own path ("/neurofeedback/"). Links no
 * rule touched are left byte for byte.
 */
export function cleanLinks(html: string, route: string, fixes: LinkFix[] = FIXES): string {
  if (!html) return html;
  const ctx = { route };
  return linkPhones(html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (whole, rawAttrs: string, inner: string) => {
    const attrs: Link['attrs'] = [...rawAttrs.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)]
      .map((m) => [m[1].toLowerCase(), m[2] ?? null]);
    const link: Link = { attrs, inner, text: inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() };
    const before = JSON.stringify(link.attrs);
    for (const fix of fixes) if (fix(link, ctx) === 'unwrap') return inner;
    if (JSON.stringify(link.attrs) === before) return whole;
    const out = link.attrs.map(([n, v]) => (v === null ? ` ${n}` : ` ${n}="${v}"`)).join('');
    return `<a${out}>${inner}</a>`;
  }));
}
