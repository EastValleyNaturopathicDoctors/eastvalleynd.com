import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.eastvalleynd.com',
  // The WordPress site used /%postname%/ — every inbound link and all 449
  // existing redirects assume a trailing slash. See docs/DECISIONS.md D5.
  trailingSlash: 'always',
  /**
   * The stylesheet is inlined into every page. It is 11 KB gzipped, and as a
   * separate file it was the only render-blocking request left — 548 ms of
   * LCP on Slow 4G, almost all of it the round trip rather than the bytes.
   * Inlining costs each page that 11 KB and removes the round trip. Repeat
   * views lose the cached-CSS benefit, but first views are what Core Web
   * Vitals and search measure.
   */
  build: { format: 'directory', inlineStylesheets: 'always' },

  /**
   * `astro dev` on 4321, `astro preview` (the production build) on 4322, so
   * both can run at once and a Lighthouse run is never accidentally taken
   * against the unminified dev server. Set here because the root package.json
   * proxies `npm run preview` into site/, which swallows CLI flags.
   */
  server: ({ command }) =>
    command === 'preview' ? { port: 4322, host: '127.0.0.1' } : { port: 4321 },
  /**
   * The content collections hold migrated HTML, not markdown — 212 of 212
   * bodies use no markdown syntax. GFM's autolink-literals rule was turning a
   * bare URL that sat *inside* an existing anchor into a second anchor, leaving
   * an empty `<a></a>` beside it on 9 pages (the citation lists). Nothing here
   * needs GFM, so it is off.
   */
  markdown: { gfm: false, smartypants: false },

  /**
   * Prefetch a page when the pointer rests on its link. On a 244-page site
   * where every page carries a mega menu and a section index, this turns most
   * navigations into an instant paint. `hover` is the default strategy, so
   * nothing is fetched until the visitor shows intent — no bandwidth is spent
   * on the 51 links in the Conditions menu just because it opened.
   */
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  /**
   * Emit a srcset for every <Image>. Without this each image ships at one
   * size, so a phone downloads the desktop asset. `constrained` matches how the
   * CSS already behaves — images scale down to their container but never past
   * their intrinsic width.
   */
  image: { responsiveStyles: true, layout: 'constrained' },
});
