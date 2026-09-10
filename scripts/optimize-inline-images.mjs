/**
 * Compress the images that are embedded inside migrated page and blog bodies.
 *
 * Everything else on this site — hero, logo, team photos, blog featured images —
 * goes through Astro's <Image>, which resizes, converts to WebP and fingerprints
 * it. These cannot: they live as raw <img> tags inside HTML in the markdown
 * bodies, and Astro's markdown pipeline optimises images it *imports*, not
 * <img> tags in raw HTML. So they shipped exactly as WordPress stored them —
 * 6.4 MB across 22 files, one of them a 2.3 MB screenshot on a blog post.
 *
 * Filenames and formats are deliberately unchanged, so no URL moves and the
 * generated markdown does not need to know this step ran.
 *
 * Safe to re-run. `npm run build` can be run without the Python builders having
 * re-copied the originals first, so "the input is always an original" is not a
 * safe assumption — the first version of this quietly re-compressed its own
 * output and took another 7% off. A manifest records the hash of every file this
 * script wrote; a file whose current hash is one of those is already done and is
 * skipped. Replace the original and the hash changes, so it gets processed again.
 *
 * Runs from `npm run build` via the `prebuild` script.
 */
import sharp from 'sharp';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const MANIFEST = '.image-cache.json';   // outside public/, so it is not deployed
const hash = (buf) => createHash('sha1').update(buf).digest('hex');

let done = new Set();
try {
  done = new Set(JSON.parse(await readFile(MANIFEST, 'utf8')));
} catch {
  /* first run */
}

const DIRS = ['public/images/page-inline', 'public/images/blog-inline'];

/** Nothing in a body column is displayed wider than this. */
const MAX_WIDTH = 1400;
const QUALITY = 80;

const kb = (n) => `${Math.round(n / 1024)} KB`;

let before = 0;
let after = 0;
let count = 0;

for (const dir of DIRS) {
  let names;
  try {
    names = await readdir(dir);
  } catch {
    continue;                       // builder has not run yet; nothing to do
  }

  for (const name of names) {
    const file = path.join(dir, name);
    const ext = path.extname(name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const current = await readFile(file);
    if (done.has(hash(current))) continue;      // already this script's output

    const original = current.length;
    const pipeline = sharp(file).resize({ width: MAX_WIDTH, withoutEnlargement: true });
    const out = await (ext === '.png'
      ? pipeline.png({ quality: QUALITY, compressionLevel: 9, palette: true })
      : pipeline.jpeg({ quality: QUALITY, mozjpeg: true })
    ).toBuffer();

    // Only keep the result if it actually helped. A small, already-optimised
    // PNG can come back bigger, and shipping that would be worse than leaving
    // it alone.
    if (out.length >= original) continue;

    await writeFile(file, out);
    done.add(hash(out));
    before += original;
    after += out.length;
    count += 1;
  }
}

await writeFile(MANIFEST, JSON.stringify([...done], null, 0));

if (count === 0) {
  console.log('inline images: nothing to compress (already optimised)');
} else {
  const saved = before - after;
  console.log(
    `inline images: ${count} compressed, ${kb(before)} -> ${kb(after)} ` +
    `(${Math.round((saved / before) * 100)}% smaller)`
  );
}
