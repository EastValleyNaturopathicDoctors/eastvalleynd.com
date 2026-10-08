/**
 * The clinic's five-star Google reviews (src/data/google-reviews.json, from the
 * clinic's Oct 2026 export: text verbatim, the reviewer's first name and last
 * initial, the month posted, the review's own Google link) and the helpers the
 * reviews page and the practitioner pages share.
 */
import all from '@/data/google-reviews.json';

export type Review = { id: string; name: string; date: string; text: string; link: string };

/** Left off the site by the clinic's choice (Oct 2026): reviews that promise
 *  quick scheduling (next-day visits, getting in fast). New-patient waits run
 *  from two weeks to six months, so the site makes no claim about them. */
const HIDDEN = new Set([
  '8d58c42b2c', // "I've been able to get next-day appointments multiple times"
  'dd5e6479d0', // "relatively easy to schedule an appointment with"
  'b588869449', // "We were able to get an appointment quickly"
]);

/** Newest first. */
export const reviews = (all as Review[]).filter((r) => !HIDDEN.has(r.id));
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

/**
 * What a review talks about, for the reviews page's filter: services and
 * conditions, never doctors (the clinic's call, Oct 2026: no steering patients
 * toward one practitioner). Each topic is the words a patient would use; the
 * patterns skip the common false hits checked against the export ("a caring
 * heart", "exhausted all options", "no pain or bruising" at a blood draw,
 * "when I was a teenager"). A topic shows as a filter once it has 5 reviews.
 */
export const TOPICS: { key: string; label: string; re: RegExp }[] = [
  { key: 'hormones', label: 'Hormones & thyroid',
    re: /\bhormon\w*|\bmenopaus\w*|perimenopaus\w*|\btestosterone\b|\bestrogen\b|\bprogesterone\b|\bbhrt\b|hot flash|\bthyroid\w*|\bhashimoto\w*|\bpms\b/i },
  { key: 'gut', label: 'Gut health',
    re: /\bgut\b|\bdigest\w*|\bibs\b|\bsibo\b|\bbloat\w*|\bstomach\b|\bcandida\b|\bleaky\b|\bcolitis\b|\bcrohn\w*|\bintestin\w*/i },
  { key: 'lyme-mold', label: 'Lyme & mold', re: /\blyme\b|\bmold\b|\bmould\b|\bmycotoxin\w*/i },
  { key: 'fatigue', label: 'Fatigue & energy', re: /\bfatigue\w*|\benergy\b|adrenal exhaustion/i },
  { key: 'brain', label: 'Brain & mood',
    re: /\bneurofeedback\b|\bneuro feedback\b|\bbrain\b|\bconcussion\w*|\bmemory\b|\balzheimer\w*|\bdementia\b|\bqeeg\b|\badhd\b|\bautis\w*|\bpandas\b|\banxi\w*|\bdepress\w*|\bmood\b|\bpanic\b/i },
  { key: 'pain', label: 'Pain & injury',
    re: /(?<!\bno )\bpain(s|ful)?\b|\bprp\b|\bprolo\w*|\binjur\w*|\bjoints?\b|\bknees?\b|\bshoulders?\b|\barthritis\b|\bmicrocurrent\b|\bplantar\b|\bsciatica\b/i },
  { key: 'iv', label: 'IV therapy', re: /\bivs?\b|\binfusion\w*|\bdrips?\b|\bnad\b|\bmyers\b/i },
  { key: 'labs', label: 'Lab testing',
    re: /\blabs?\b|\blab work\b|\bblood ?work\b|\bblood tests?\b|\btesting\b|\bblood draws?\b|\bphlebotom\w*/i },
  { key: 'allergies-skin', label: 'Allergies & skin',
    re: /\ballerg\w*|\beczema\b|\basthma\b|\bskin\b|\brash\w*|\bhives\b|\bmcas\b|\bacne\b/i },
  { key: 'family', label: 'Kids & family',
    re: /\bsons?\b|\bdaughters?\b|\bkids?\b|\bchild(ren)?\b|\btoddler\b|\bbaby\b/i },
];
export const topicsIn = (text: string): string[] => TOPICS.filter((t) => t.re.test(text)).map((t) => t.key);
