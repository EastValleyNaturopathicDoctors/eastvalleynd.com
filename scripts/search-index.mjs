/**
 * Build the site-search index, then prove it contains exactly the public pages.
 *
 * Runs from `npm run build` via the `postbuild` script, against `dist/`.
 * Pagefind reads the built HTML and writes a static index to `dist/pagefind/`
 * — no server, no API key, nothing leaves the site (D110).
 *
 * What gets indexed is decided in the markup, not here: Base.astro puts
 * `data-pagefind-body` on <main> for a page that is in sitemap.xml and marks
 * everything else — stubs, the 404, the duplicate body that canonicals away,
 * the homepage — as not searchable. When any page carries that attribute,
 * Pagefind drops every page that does not. Chrome inside <main> (booking
 * prompts, breadcrumbs, card grids, the template's testimonials) is fenced off
 * with `data-pagefind-ignore`.
 *
 * The check at the end is the guarantee the client asked for: the set of URLs
 * in the index must equal the set in sitemap.xml, minus the homepage, which is
 * excluded on purpose (its sections are template copy still under client
 * question 36, and nobody searches for the homepage). Any drift — a stub
 * leaking in, a PDF, a page that lost its body attribute — fails the build.
 * The one other exception is read from the built pages themselves: a page
 * still in sitemap.xml whose canonical link names another page (one on its
 * way out, tracker R4) is not its own search entry. Those are listed on every
 * build until the sitemap drops them.
 */
import * as pagefind from 'pagefind';
import { readdir, readFile, rm } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';

const DIST = path.resolve('dist');
const OUT = path.join(DIST, 'pagefind');

/** Pages in sitemap.xml that are deliberately not searchable. */
const NOT_SEARCHED = new Set(['/']);

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (p !== OUT) yield* htmlFiles(p); }
    else if (e.name.endsWith('.html')) yield p;
  }
}

const { index, errors: createErrors } = await pagefind.createIndex({ verbose: false });
if (createErrors?.length) { console.error(createErrors.join('\n')); process.exit(1); }

let added = 0;
/** Built pages whose canonical link names a different URL. */
const canonicalAway = new Set();
for await (const file of htmlFiles(DIST)) {
  const sourcePath = path.relative(DIST, file);
  const content = await readFile(file, 'utf8');
  const own = '/' + sourcePath.split(path.sep).join('/').replace(/(^|\/)index\.html$/, '$1');
  const canon = content.match(/<link rel="canonical" href="https?:\/\/[^/]+([^"]*)"/)?.[1];
  if (canon && canon !== own) canonicalAway.add(own);
  const { errors } = await index.addHTMLFile({ sourcePath, content });
  if (errors?.length) { console.error(sourcePath, errors.join('\n')); process.exit(1); }
  added++;
}

const { errors: writeErrors } = await index.writeFiles({ outputPath: OUT });
if (writeErrors?.length) { console.error(writeErrors.join('\n')); process.exit(1); }
await pagefind.close();

// Pagefind also writes its three stock UIs and a highlighter. The site has its
// own dialog (SearchDialog.astro) on top of the bare loader, so those files
// would only be dead weight in the deploy.
for (const name of await readdir(OUT)) {
  if (/^pagefind-(ui|modular-ui|component-ui|highlight)\./.test(name)) await rm(path.join(OUT, name));
}

// --- Audit: index == sitemap ------------------------------------------------
// Every indexed page is one gzipped JSON fragment under dist/pagefind/fragment/,
// carrying the URL the result will link to. That file set is the truth of
// what a visitor can find, so it is what gets checked — not what was fed in.
const indexed = new Set();
const fragDir = path.join(OUT, 'fragment');
for (const name of await readdir(fragDir)) {
  // Each fragment is gzip, and the decompressed bytes start with a 12-byte
  // "pagefind_dcd" marker ahead of the JSON.
  const text = gunzipSync(await readFile(path.join(fragDir, name))).toString('utf8');
  const frag = JSON.parse(text.slice(text.indexOf('{')));
  indexed.add(frag.url);
}

const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
const listed = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
    .filter((u) => !NOT_SEARCHED.has(u)),
);
const away = [...listed].filter((u) => canonicalAway.has(u)).sort();
for (const u of away) listed.delete(u);

const leaked = [...indexed].filter((u) => !listed.has(u)).sort();
const missing = [...listed].filter((u) => !indexed.has(u)).sort();

console.log(`search index   : ${indexed.size} pages indexed of ${added} HTML files scanned`);
console.log(`sitemap.xml    : ${listed.size} searchable urls (${NOT_SEARCHED.size} excluded on purpose: ${[...NOT_SEARCHED].join(', ')})`);
for (const u of away) console.warn(`  CANONICAL ${u}  — in sitemap.xml but canonical to another page; the sitemap should drop it`);
if (leaked.length || missing.length) {
  for (const u of leaked) console.error(`  LEAKED   ${u}  — indexed but not in sitemap.xml`);
  for (const u of missing) console.error(`  MISSING  ${u}  — in sitemap.xml but not indexed`);
  console.error('search index does not match sitemap.xml — build failed');
  process.exit(1);
}
console.log('search index   : matches sitemap.xml exactly');
