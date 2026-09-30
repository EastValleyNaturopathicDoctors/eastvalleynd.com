# eastvalleynd.com

The website for **East Valley Naturopathic Doctors**, Mesa, AZ, built with [Astro](https://astro.build) 5.
A static site: `npm run build` writes plain HTML, CSS and assets to `dist/`, and `dist/` is the only
thing that gets deployed.

## Commands

```bash
npm ci            # install exactly what package-lock.json pins
npm run dev       # local dev server at http://localhost:4321
npm run build     # production build into dist/ (also compresses inline images and builds search)
npm run preview   # serve dist/ at http://localhost:4322
npm run check     # type-check
```

`npm run build` runs two extra steps around Astro:

- **before:** `scripts/optimize-inline-images.mjs` compresses the images embedded in page and blog
  bodies. `.image-cache.json` records which files are already done, so it never compresses an image
  twice. It is committed on purpose; don't delete it.
- **after:** `scripts/search-index.mjs` builds the site search (Pagefind) and **fails the build**
  unless the indexed pages exactly match `public/sitemap.xml` minus the homepage.

## Where things are

| Path | What |
|---|---|
| `src/pages/` | Hand-written pages; `[...slug].astro` renders every content page |
| `src/content/` | Page, blog and practitioner content, **generated** from the old WordPress site |
| `src/components/`, `src/layouts/` | The design; each component carries its own CSS |
| `src/data/` | Site-wide data: contact details and hours (`site.ts`), navigation, forms, stock-photo manifest |
| `public/` | Served as-is: logo, redirects (`_redirects`, `.htaccess`), `sitemap.xml`, `robots.txt`, patient PDFs at their original WordPress URLs |

## Things to know before editing

- **Nothing on this site is invented.** No made-up copy, statistics, testimonials, hours or prices.
  Anything unconfirmed is a question for the clinic, not a placeholder.
- **Content in `src/content/` and several files in `public/` and `src/data/` are generated** by the
  migration pipeline, which is kept outside this repository with the WordPress backup. Edits made
  here by hand to those files are overwritten the next time the pipeline runs.
- **Hosting:** Cloudflare Workers, serving `dist/` as static files (`wrangler.jsonc`). Cloudflare
  builds and deploys on every push to `main`.
- **Redirects:** `public/_redirects` (Cloudflare) and `public/.htaccess` (Apache) hold the ~650
  rules from the old site. Cloudflare can't match `?query` URLs in `_redirects`; the two that need
  it are listed at the end of the file and belong in Cloudflare Redirect Rules. www and https
  redirects belong in the host's settings.
- **Indexing:** `src/data/preview.json` switches the whole site to `noindex`. It is off.
