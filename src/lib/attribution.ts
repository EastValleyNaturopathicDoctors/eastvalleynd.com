/**
 * How a visitor found the site, sent with the appointment and contact forms
 * (Nov 2026), the way the old WordPress forms carried Source, Medium and
 * Campaign.
 *
 * The clinic's links are tagged with UTM parameters, e.g. the Google Business
 * Profile's website link:
 *   /?utm_campaign=gmb&utm_medium=organic&utm_source=google&utm_term=mesa-website
 * Visitors land on one page and fill in the form on another, so the tags are
 * kept in the browser (localStorage, 90 days) from the visit that carried
 * them. A newer tagged visit replaces them (the last campaign that brought the
 * person wins); an untagged visit from another site is kept only when nothing
 * is stored, so a later Google search doesn't erase the campaign.
 *
 * Nothing leaves the browser except with a form the visitor sends; the privacy
 * page says so. Storage can be blocked (private windows, strict settings):
 * then the form simply goes without it.
 */
const KEY = 'evnd-attribution';
const DAYS = 90;
export const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'] as const;

export type Attribution = Partial<Record<(typeof PARAMS)[number] | 'landing_page' | 'referrer' | 'first_seen', string>>;

const cap = (s: string) => s.slice(0, 200);

function load(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Attribution & { at?: number };
    if (!a.at || Date.now() - a.at > DAYS * 864e5) { localStorage.removeItem(KEY); return null; }
    delete a.at;
    return a;
  } catch {
    return null;
  }
}

function save(a: Attribution) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...a, at: Date.now() })); } catch {}
}

/** Runs on every page: remembers the tags of a tagged visit. */
export function capture() {
  const q = new URLSearchParams(location.search);
  const tags: Attribution = {};
  for (const p of PARAMS) { const v = q.get(p)?.trim(); if (v) tags[p] = cap(v); }
  let ref = '';
  try {
    const r = new URL(document.referrer);
    if (r.host !== location.host) ref = cap(r.origin + r.pathname);
  } catch {}
  const visit: Attribution = {
    ...tags,
    landing_page: cap(location.pathname + location.search),
    ...(ref ? { referrer: ref } : {}),
    first_seen: new Date().toISOString().slice(0, 10),
  };
  if (Object.keys(tags).length) save(visit);
  else if (ref && !load()) save(visit);
}

/** What to send with a form: the stored visit, or else this page's own tags. */
export function attribution(): Attribution {
  const stored = load();
  if (stored) return stored;
  const q = new URLSearchParams(location.search);
  const now: Attribution = {};
  for (const p of PARAMS) { const v = q.get(p)?.trim(); if (v) now[p] = cap(v); }
  return now;
}
