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
 * A name is a copy only when its original sits beside it: "index 2.html" next
 * to "index.html", "plaquex 2" next to "plaquex". A real upload such as
 * "Intake Form 2.pdf", with no "Intake Form.pdf", is left alone (tracker K11).
 *
 * iCloud can still add copies to dist/ after this runs, so public/.assetsignore
 * keeps copies of the names the build writes, and every folder copy, out of
 * the deploy regardless. Its folder patterns hide any folder whose name ends
 * in a space and one or two digits, so such a folder in public/ — which would
 * silently never deploy — fails the build too.
 */
import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';

/** "index 2.html", "sitemap 3.xml", "plaquex 2": the original's name and a
 *  space and a number, before the extension if there is one. */
const COPY = /^(.+) \d+(\.[^ ]+)?$/;
/** The folder patterns in public/.assetsignore: "* [0-9]/", "* [0-9][0-9]/". */
const HIDDEN_FOLDER = / \d{1,2}$/;

/** Every stray copy under `dir`, each folder read once; a stray folder is
 *  reported, not walked. */
async function* strays(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const names = new Set(entries.map((e) => e.name));
  for (const e of entries) {
    const p = path.join(dir, e.name);
    const m = COPY.exec(e.name);
    if (m && names.has(m[1] + (m[2] ?? ''))) yield p;
    else if (e.isDirectory()) yield* strays(p);
  }
}

/** Every folder under `dir` that public/.assetsignore would keep from deploying. */
async function* hiddenFolders(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (HIDDEN_FOLDER.test(e.name)) yield p;
    else yield* hiddenFolders(p);
  }
}

const inSource = [];
for (const dir of ['src', 'public']) for await (const p of strays(dir)) inSource.push(p);
const hidden = [];
for await (const p of hiddenFolders('public')) if (!inSource.includes(p)) hidden.push(p);

let removed = 0;
for await (const p of strays('dist')) {
  await rm(p, { recursive: true, force: true });
  removed++;
}
console.log(`stray copies   : ${removed} removed from dist/`);

if (inSource.length || hidden.length) {
  for (const p of inSource.sort()) console.error(`  STRAY    ${p}`);
  if (inSource.length) console.error(`${inSource.length} " 2"-style copies in src/ or public/ (iCloud sync) — compare each with its original, delete it, then rebuild`);
  for (const p of hidden.sort()) console.error(`  HIDDEN   ${p}`);
  if (hidden.length) console.error(`${hidden.length} folders in public/ end in a space and a number, which public/.assetsignore keeps from deploying — rename each`);
  process.exit(1);
}
console.log('stray copies   : none in src/ or public/');
