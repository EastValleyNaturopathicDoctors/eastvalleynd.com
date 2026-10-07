/**
 * Links back into a hub page's entry list (tracker P1). The Brain
 * Regeneration Clinic lists twenty conditions and therapies, each an h3 and a
 * paragraph ending in "Learn More" that no longer goes anywhere. For a route
 * in src/data/hub-links.ts this links each listed entry's heading, and the
 * first "Learn more…" phrase in the text under it, to the entry's page. The
 * phrase runs to the end of its sentence ("Learn more about our broader
 * detoxification services"), so the link always covers words already there.
 *
 * Runs before the link clean-up (src/lib/links.ts), so the new links get the
 * same treatment as the copy's own. The permanent fix belongs in the content
 * pipeline; this keeps the built page right until then.
 */
import { hubLinks } from '@/data/hub-links';

/** A heading reduced to its letters and digits: "Alzheimer&#39;s" = "Alzheimer's". */
const key = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&[#\w]+;/g, '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

export const hasHubLinks = (route: string): boolean => route in hubLinks;

/** The body with each mapped entry linked. Routes with no entry come back untouched. */
export function linkHubEntries(html: string, route: string): string {
  const map = hubLinks[route];
  if (!html || !map) return html;
  const targets = new Map(Object.entries(map).map(([h, href]) => [key(h), href]));
  const done = new Set<string>();
  // An entry: its h3, then everything up to the next heading.
  const out = html.replace(/<h3(\s[^>]*)?>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h[1-6][\s>]|$)/gi,
    (whole, attrs = '', inner: string, rest: string) => {
      const k = key(inner);
      const href = targets.get(k);
      if (!href || /<a\b/i.test(inner)) return whole;
      done.add(k);
      // Words the copy already links keep their own link.
      const text = /<a\b[^>]*>\s*Learn more/i.test(rest) ? rest : rest.replace(/(^|>|[.!?]\s+)(Learn more\b[^.<]*?)(?=\s*[.<])/i,
        (_m, lead: string, words: string) => `${lead}<a href="${href}">${words}</a>`);
      return `<h3${attrs}><a class="hub-link" href="${href}">${inner}</a></h3>${text}`;
    });
  // A heading reworded upstream would silently lose its link; say so in the build log.
  const missing = Object.keys(map).filter((h) => !done.has(key(h)));
  if (missing.length) console.warn(`[hublinks] ${route}: no entry found for ${missing.join(', ')}`);
  return out;
}
