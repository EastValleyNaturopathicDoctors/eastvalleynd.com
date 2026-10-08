/**
 * Moves a migrated body's pictures and videos to the sections they illustrate,
 * as listed in src/data/media-moves.ts. A picture becomes an inset beside the
 * section's first paragraph (the same .cpage-inset as a page's small featured
 * image), the pair kept together so the float never runs into the next
 * heading; a video follows that paragraph, or goes just before a heading.
 * A video can also be added where the body has none.
 *
 * Runs on the rendered body before anything else in ContentPage.astro, so the
 * hero lede, contents list and mid-body prompt all see the moved layout.
 */
import { mediaMoves } from '@/data/media-moves';

/** A heading reduced to its letters and digits, as in src/lib/hublinks.ts. */
const key = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&[#\w]+;/g, '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function moveMedia(html: string, route: string): string {
  const moves = mediaMoves[route];
  if (!html || !moves) return html;
  let out = html;
  for (const m of moves) {
    const isVideo = 'video' in m;
    const add = isVideo && m.add;
    const piece = isVideo
      ? new RegExp(`<figure class="wp-video" data-video="${esc(m.video)}">\\s*</figure>\\s*`)
      : new RegExp(`<p>\\s*(<img [^>]*src="[^"]*/${esc(m.file)}"[^>]*>)\\s*</p>\\s*`);
    const found = add ? null : out.match(piece);
    const rest = add ? out : out.replace(piece, '');
    const name = isVideo ? m.video : m.file;
    // A section heading, then the paragraph right after it; or, for `before`,
    // the heading alone.
    const target = 'before' in m
      ? [...rest.matchAll(/<(h[2-4])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].find((h) => key(h[2]) === key(m.before))
      : [...rest.matchAll(/(<(h[2-4])(?:\s[^>]*)?>([\s\S]*?)<\/\2>\s*)(<p\b[\s\S]*?<\/p>)/gi)]
          .find((h) => key(h[3]) === key(m.to));
    // A body reworded upstream would silently keep its pile; say so in the build log.
    if ((!add && !found) || !target) {
      console.warn(`[mediamoves] ${route}: ${name} -> "${'before' in m ? m.before : m.to}" not found`);
      continue;
    }
    out = rest;
    if (isVideo) {
      const figure = `<figure class="wp-video" data-video="${m.video}"${m.start ? ` data-start="${m.start}"` : ''}></figure>`;
      if ('before' in m) {
        out = out.replace(target[0], `${figure}\n${target[0]}`);
      } else {
        const [whole, head, , , para] = target;
        out = out.replace(whole, `${head}${para}\n${figure}\n`);
      }
    } else {
      const [whole, head, , , para] = target;
      const img = m.alt ? found![1].replace(/\salt="[^"]*"/, '').replace(/^<img /, `<img alt="${m.alt}" `) : found![1];
      out = out.replace(whole, `${head}<div class="cpage-pair"><figure class="cpage-inset">${img}</figure>${para}</div>\n`);
    }
  }
  return out;
}
