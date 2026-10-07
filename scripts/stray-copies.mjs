/**
 * Catch the " 2" / " 3" copies that iCloud sync makes of files in this folder.
 *
 * The repo lives in iCloud-synced Documents, and iCloud keeps a conflicting
 * file by saving a second copy beside it as "name 2.ext" (or "name 3", or a
 * folder "name 2"). Astro empties dist/ at the start of every build, yet after
 * a build dist/ has held 1,506 of them — old pages such as /privacy/index 2.html,
 * "sitemap 2.xml", "robots 2.txt" — which `npx wrangler deploy` would publish
 * (tracker R3).
 *
 * Runs from `npm run build` via the `postbuild` script, before the search
 * index, so Pagefind never sees a stray page:
 *   - src/ and public/ are source: a copy there is a real mistake (a stale
 *     component, a second page, a file copied into dist/) that a person must
 *     look at, so the build fails and lists it. Nothing is deleted.
 *   - dist/ is build output: copies there are deleted.
 *
 * iCloud can still add copies to dist/ after this runs, so public/.assetsignore
 * carries the same patterns and keeps them out of the deploy regardless.
 */
import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';

/** "index 2.html", "sitemap 3.xml", "plaquex 2" — a space and a number at the end of the name. */
const STRAY = / \d+(\.[^ ]+)?$/;

/** Every stray copy under `dir`; a stray folder is reported, not walked. */
async function* strays(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (STRAY.test(e.name)) yield p;
    else if (e.isDirectory()) yield* strays(p);
  }
}

const inSource = [];
for (const dir of ['src', 'public']) for await (const p of strays(dir)) inSource.push(p);

let removed = 0;
for await (const p of strays('dist')) {
  await rm(p, { recursive: true, force: true });
  removed++;
}
console.log(`stray copies   : ${removed} removed from dist/`);

if (inSource.length) {
  for (const p of inSource.sort()) console.error(`  STRAY    ${p}`);
  console.error(`${inSource.length} " 2"-style copies in src/ or public/ (iCloud sync) — compare each with its original, delete it, then rebuild`);
  process.exit(1);
}
console.log('stray copies   : none in src/ or public/');
