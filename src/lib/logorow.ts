/**
 * Gathers a body's partner logos, listed in src/data/logo-rows.ts, into one row
 * of equal tiles where the first of them stood. Runs on the rendered body in
 * ContentPage.astro, with the media moves (src/lib/mediamoves.ts).
 */
import { logoRows } from '@/data/logo-rows';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** `top`: the page's own top image, when the row takes it first. */
export function logoRow(html: string, route: string, top?: { src: string }): string {
  const row = logoRows[route];
  if (!html || !row) return html;
  let out = html;
  let at = -1;
  const tiles: string[] = [];
  if (row.top && top) tiles.push(`<li><img src="${attr(top.src)}" alt="${attr(row.top)}" loading="lazy" decoding="async"></li>`);
  for (const [file, name] of Object.entries(row.logos)) {
    const re = new RegExp(`<p>\\s*<img [^>]*src="([^"]*/${esc(file)})"[^>]*>\\s*</p>\\s*`);
    const m = out.match(re);
    // A body reworded upstream would keep its stack; say so in the build log.
    if (!m || m.index === undefined) { console.warn(`[logorow] ${route}: ${file} not found`); continue; }
    if (at < 0 || m.index < at) at = m.index;
    tiles.push(`<li><img src="${attr(m[1])}" alt="${attr(name)}" loading="lazy" decoding="async"></li>`);
    out = out.replace(m[0], m.index === at ? '\u0000' : '');
  }
  if (at < 0) return html;
  const figure = `<figure class="cpage-logos"><figcaption>${row.label}</figcaption><ul>${tiles.join('')}</ul></figure>\n`;
  return out.replace('\u0000', figure).replace(/\u0000/g, '');
}
