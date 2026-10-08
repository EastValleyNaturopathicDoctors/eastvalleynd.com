/**
 * The clinic's five-star Google reviews (src/data/google-reviews.json, from the
 * clinic's Oct 2026 export: text verbatim, the reviewer's first name and last
 * initial, the month posted, the review's own Google link) and the helpers the
 * reviews page and the practitioner pages share.
 */
import all from '@/data/google-reviews.json';

export type Review = { id: string; name: string; date: string; text: string; link: string };

/** Newest first. */
export const reviews = all as Review[];
const byId = new Map(reviews.map((r) => [r.id, r]));

/** Reviews by id, in the order given; an unknown id is a build error, not a gap. */
export function reviewsById(ids: string[]): Review[] {
  return ids.map((id) => {
    const r = byId.get(id);
    if (!r) throw new Error(`[reviews] no review with id ${id} in src/data/google-reviews.json`);
    return r;
  });
}

/** "2026-10" -> "October 2026". */
export const monthName = (ym: string): string =>
  new Date(`${ym}-01T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Who a review names, for the reviews page's filter: the doctor's slug for
 *  every doctor whose name (or a nickname or misspelling) it uses. */
const NAMES: [string, RegExp][] = [
  ['jason-porter', /\bporter\b|dr\.?\s*jason\b/i],
  ['jennifer-nevels', /\bnevel+s?\b|\bneville\b|dr\.?\s*jen(n|nifer)?\b/i],
  ['laura-badalamenti-schwartz', /\bsc?hwar?t?z\b|\bswartz\b|\bbadal[a-z]*|dr\.?\s*laura\b|\b(dr|doc)\.?\s*b\b/i],
  ['casey-seenauth', /\bseen[a-z]{1,5}\b|dr\.?\s*casey\b/i],
];
export const namedIn = (text: string): string[] => NAMES.filter(([, re]) => re.test(text)).map(([slug]) => slug);
