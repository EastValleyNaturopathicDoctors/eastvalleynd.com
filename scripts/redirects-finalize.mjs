/**
 * Finishes dist/_redirects and dist/sitemap.xml after the build (Nov 2026),
 * so the content pipeline (extract/build_redirects.py, which writes
 * public/_redirects and public/sitemap.xml) can't undo any of it:
 *
 * 1. Hand-kept fixes (OVERRIDES): old addresses the pipeline sends to a
 *    placeholder page, or to /blog/ when a renamed post exists, and a few it
 *    misses (a capitalised link, old addresses that 404).
 * 2. Every redirect to a page that names another page as its canonical goes
 *    to that page instead; a redirect to another redirect's source goes
 *    straight to the end of the chain.
 * 3. The slashless twin of each source: the pipeline's rules match only
 *    "/old-page/", and Cloudflare matches redirects exactly, so "/old-page"
 *    (as Google and other sites often link it) was a 404. Skipped where a real
 *    page or file answers that path.
 * 4. sitemap.xml drops pages that are noindex or canonical to another page.
 *
 * It warns, without failing, about any redirect still landing on a missing
 * or noindex page, so a pipeline run that adds one is noticed. It fails the
 * build if the file passes Cloudflare's 2,000 static redirects.
 *
 * Runs from `npm run build` (postbuild), after stray-copies and before the
 * search index (which compares the index with the sitemap).
 */
import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';
const LIMIT = 2000;

/** source -> destination. A source the pipeline already has is repointed. */
const OVERRIDES = {
  // Placeholder pages the pipeline points at (all noindex): the live page
  // that covers the same ground.
  '/foundations/': '/about/',
  '/foundations-diet/': '/about/',
  '/foundations-exercise/': '/about/',
  '/foundations-for-exercise/': '/about/',
  '/foundations-immunity/': '/about/',
  '/foundations-inflammation/': '/about/',
  '/foundations-metabolic/': '/about/',
  '/foundations-methylation/': '/about/',
  '/foundations-nutrients/': '/about/',
  '/foundations/foundations-genetics/': '/about/',
  '/foundations/foundations-infections/': '/about/',
  '/foundations/healthyhome/': '/about/',
  '/exercise/': '/about/',
  '/how-to-feel-amazing-in-menopause-audiobook-chapter-1/': '/conditions/womens-health/menopause/',
  '/how-to-feel-amazing-in-menopause-audiobook-chapter-2/': '/conditions/womens-health/menopause/',
  '/how-to-feel-amazing-in-menopause-audiobook-chapter-3/': '/conditions/womens-health/menopause/',
  '/how-to-feel-amazing-in-menopause-audiobook-chapters-4-and-5/': '/conditions/womens-health/menopause/',
  '/foundations/gi-health/': '/conditions/gastrointestinal-disorders/',
  '/specialties/gi-health/': '/conditions/gastrointestinal-disorders/',
  '/condition/rheumatoid-arthritis/': '/conditions/arthritis/',
  '/special_labs/food-additives-igg-and-iga/': '/conditions/igg-food-intolerance/',
  // Sent to /blog/ although the post lives on under a new name.
  '/treatments_therapies/is-your-cookware-toxic/': '/the-best-cookware-for-non-toxic-cooking/',
  '/treatments_therapies/safe-cleaning-tips-for-your-home/': '/the-dangers-of-common-household-cleaners-and-safe-alternatives/',
  // Missing altogether (old addresses that 404, from the sheet comparison and
  // GA4's top pages).
  '/insurance/': '/insurance-coverage/',
  '/specialties/acne/': '/conditions/acne/',
  '/specialties/skinpen-microneedling/': '/skinpen-microneedling/',
  '/specialties/diabetes-and-prediabetes/': '/conditions/diabetes/',
  '/physicians/laura-Badalamenti/': '/physicians/laura-badalamenti-schwartz/',
  // No TruDOSE page on the new site yet; the IV therapy page is the nearest.
  '/trudose-iv-therapy/trudose/': '/iv-therapy/',
  // The placeholder pages (src/data/stub-routes.json: a title, no copy yet),
  // sent to the live page nearest their subject until each is written. When
  // one gets its copy, delete its line here.
  '/about/naturopathic-medicine/': '/about/',
  '/about/our-mission/': '/about/core-values/',
  '/conditions/chronic-pain/dysmenorrhea/': '/transcranial-direct-current-stimulation/dysmenorrhea/',
  '/conditions/gut-health/': '/conditions/gastrointestinal-disorders/',
  '/conditions/hormonal/': '/hormone-therapy/',
  '/conditions/neurological/': '/brain-regeneration-clinic/',
  '/conditions/rheumatoid-arthritis/': '/conditions/arthritis/',
  '/how-to-feel-amazing-in-menopause-part-1/': '/conditions/womens-health/menopause/',
  '/how-to-feel-amazing-in-menopause-part-2/': '/conditions/womens-health/menopause/',
  '/how-to-feel-amazing-in-menopause-part-3/': '/conditions/womens-health/menopause/',
  '/how-to-feel-amazing-in-menopause-part-4/': '/conditions/womens-health/menopause/',
  '/specialty-labs/food-sensitivity/': '/conditions/igg-food-intolerance/',
  '/specialty-labs/gut-health/': '/specialty-labs/',
  // The FINAL audit workbook's New Sitemap tab (the authority, Nov 2026):
  // where its notes say an old address goes.
  '/depression-and-anxiety/': '/brain-regeneration-clinic/depression-and-anxiety/',
  '/special_labs/salivary-hormone-testing/': '/hormone-therapy/',        // folded into Hormone Therapy
  '/treatments_therapies/high-dose-vitamin-c-kills-cancer/': '/high-dose-vitamin-c-kills-cancer/',   // "turn into blog post"
  '/allergies/': '/conditions/allergies/',                               // "Update URL from /allergies/"
  '/infertility/': '/conditions/infertility/',                           // "Update URL from /infertility/"
  '/conditions/cardiovascular/': '/conditions/heart-care/',             // planned hub, no copy: Natural Heart Care
  // ADD/ADHD: one page from LaDawn's doc ("combine" in the sitemap tab; the
  // Content Clusters tab merges the ADD/ADHD pages and folds in the QbCheck
  // ones as sections, which the doc covers).
  '/addadhd-evaluation/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/add-adhd-affordable-diagnosis/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/addadhd-brain-mapping/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/accurately-diagnose-addadhd/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/alternative-treatments-for-addadhd/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/addadhd-qb-test/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/what-is-a-qbcheck/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/how-is-a-qbcheck-performed/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/how-often-is-a-qbcheck-performed/': '/conditions/childhood-behavioral-disorders/adhd/',
  '/qbcheck-evaluation-treatment-response/': '/conditions/childhood-behavioral-disorders/adhd/',
};

const exists = async (p) => stat(p).then(() => true, () => false);
const fileFor = (url) => {
  const p = decodeURI(url.split(/[?#]/)[0]);
  return p.endsWith('/') ? path.join(DIST, p, 'index.html') : path.join(DIST, p);
};
const head = async (url) => {
  const f = fileFor(url);
  if (!(await exists(f))) return { missing: true };
  if (!f.endsWith('.html')) return {};
  const html = (await readFile(f, 'utf8')).slice(0, 8000);
  const canon = /<link rel="canonical" href="https?:\/\/[^/"]+([^"]*)"/.exec(html)?.[1];
  const robots = /<meta name="robots" content="([^"]*)"/.exec(html)?.[1] ?? '';
  return { canonical: canon, noindex: /noindex/.test(robots) };
};

// --- _redirects --------------------------------------------------------------
const file = path.join(DIST, '_redirects');
const lines = (await readFile(file, 'utf8')).split('\n');
const header = [];
/** @type {{ src: string, dst: string, code: string }[]} */
const rules = [];
for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith('#')) { if (!rules.length) header.push(line); continue; }
  const [src, dst, code = '301'] = t.split(/\s+/);
  rules.push({ src, dst, code });
}
const comments = lines.filter((l) => l.trim().startsWith('#') && !header.includes(l));

const bySrc = new Map(rules.map((r) => [r.src, r]));
let repointed = 0, added = 0;
for (const [src, dst] of Object.entries(OVERRIDES)) {
  const r = bySrc.get(src);
  if (r) { if (r.dst !== dst) { r.dst = dst; repointed++; } }
  else { const n = { src, dst, code: '301' }; rules.push(n); bySrc.set(src, n); added++; }
}

// Chains, then canonicals (a few rounds: a canonical can lead into a chain).
let followed = 0;
for (let round = 0; round < 5; round++) {
  let changed = false;
  for (const r of rules) {
    if (!r.dst.startsWith('/')) continue;
    const next = bySrc.get(r.dst);
    if (next && next !== r && next.dst !== r.dst) { r.dst = next.dst; changed = true; followed++; continue; }
    const h = await head(r.dst);
    if (h.canonical && h.canonical !== r.dst.split(/[?#]/)[0] && (await head(h.canonical)).missing !== true) {
      r.dst = h.canonical; changed = true; followed++;
    }
  }
  if (!changed) break;
}

// Slashless twins.
let twins = 0;
const twinRules = [];
for (const r of rules) {
  if (!r.src.endsWith('/') || r.src === '/' || r.src.includes('*') || r.src.includes(':')) continue;
  const bare = r.src.slice(0, -1);
  if (bySrc.has(bare)) continue;
  if (await exists(path.join(DIST, decodeURI(bare)))) continue;   // a real page or file answers it
  twinRules.push({ src: bare, dst: r.dst, code: r.code });
  twins++;
}

const all = [...rules, ...twinRules];
if (all.length > LIMIT) {
  console.error(`redirects      : ${all.length} rules, over Cloudflare's ${LIMIT}`);
  process.exit(1);
}

// Anything still landing somewhere wrong.
const warn = [];
for (const r of rules) {
  if (!r.dst.startsWith('/') || /\.(pdf|jpe?g|png|webp|docx?)$/i.test(r.dst)) continue;
  const h = await head(r.dst);
  if (h.missing) warn.push(`${r.src} -> ${r.dst} (missing)`);
  else if (h.noindex) warn.push(`${r.src} -> ${r.dst} (noindex)`);
}

const pad = (s, n) => (s.length >= n ? s + ' ' : s.padEnd(n));
const out = [
  ...header.filter((l) => l.trim()),
  `# Finished at build by scripts/redirects-finalize.mjs: ${repointed} repointed and ${added} added by hand,`,
  `# ${followed} sent on to their canonical page or chain end, ${twins} slashless twins.`,
  '',
  ...all.map((r) => `${pad(r.src, 64)} ${pad(r.dst, 46)} ${r.code}`),
  '',
  ...comments,
  '',
].join('\n');
await writeFile(file, out);

// --- sitemap.xml ---------------------------------------------------------------
// Pages built by hand from the team's docs, which the pipeline's sitemap
// doesn't know (Nov 2026). Added when the page exists and is indexable.
const SITEMAP_ADD = ['/conditions/childhood-behavioral-disorders/adhd/'];
const smFile = path.join(DIST, 'sitemap.xml');
const sm = await readFile(smFile, 'utf8');
const dropped = [];
const kept = [];
const listed = new Set([...sm.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1]));
const origin = /<loc>(https?:\/\/[^/<]+)/.exec(sm)?.[1] ?? 'https://www.eastvalleynd.com';
const smAdded = [];
for (const p of SITEMAP_ADD) {
  const h = await head(p);
  if (!listed.has(p) && !h.missing && !h.noindex && (!h.canonical || h.canonical === p)) smAdded.push(p);
}
for (const m of sm.matchAll(/<url>[\s\S]*?<\/url>/g)) {
  const loc = /<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/.exec(m[0])?.[1];
  const h = loc ? await head(loc) : {};
  // A redirect wins over a page at the same address (Cloudflare checks
  // _redirects first), so a redirected address isn't a page any more.
  if (loc && (bySrc.has(loc) || (!h.missing && (h.noindex || (h.canonical && h.canonical !== loc))))) dropped.push(loc);
  else kept.push(m[0]);
}
for (const p of smAdded) kept.push(`<url><loc>${origin}${p}</loc></url>`);
if (dropped.length || smAdded.length) {
  const start = sm.indexOf('<url>');
  const end = sm.lastIndexOf('</url>') + '</url>'.length;
  await writeFile(smFile, sm.slice(0, start) + kept.join('\n  ') + sm.slice(end));
}

console.log(`redirects      : ${all.length} rules (${rules.length} + ${twins} slashless twins); ${repointed} repointed, ${added} added, ${followed} followed to canonical/chain end`);
console.log(`sitemap.xml    : ${dropped.length ? `dropped ${dropped.join(', ')} (noindex, canonical elsewhere, or redirected)` : 'nothing to drop'}${smAdded.length ? `; added ${smAdded.join(', ')}` : ''}`);
for (const w of warn) console.warn(`  REDIRECT     ${w}`);
