/**
 * Moves a migrated body's pictures and videos to the sections they illustrate,
 * as listed in src/data/media-moves.ts. A picture becomes an inset beside the
 * section's first paragraph (the same .cpage-inset as a page's small featured
 * image), the pair kept together so the float never runs into the next
 * heading; a video follows that paragraph.
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
    const piece = 'video' in m
      ? new RegExp(`<figure class="wp-video" data-video="${esc(m.video)}">\\s*</figure>\\s*`)
      : new RegExp(`<p>\\s*(<img [^>]*src="[^"]*/${esc(m.file)}"[^>]*>)\\s*</p>\\s*`);
    const found = out.match(piece);
    // A section heading, then the paragraph right after it.
    const target = [...out.replace(piece, '').matchAll(/(<(h[2-4])(?:\s[^>]*)?>([\s\S]*?)<\/\2>\s*)(<p\b[\s\S]*?<\/p>)/gi)]
      .find((h) => key(h[3]) === key(m.to));
    // A body reworded upstream would silently keep its pile; say so in the build log.
    if (!found || !target) {
      console.warn(`[mediamoves] ${route}: ${'video' in m ? m.video : m.file} -> "${m.to}" not found`);
      continue;
    }
    out = out.replace(piece, '');
    const [whole, head, , , para] = target;
    let moved: string;
    if ('video' in m) {
      moved = `${head}${para}\n${found[0].trim()}\n`;
    } else {
      const img = m.alt ? found[1].replace(/\salt="[^"]*"/, '').replace(/^<img /, `<img alt="${m.alt}" `) : found[1];
      moved = `${head}<div class="cpage-pair"><figure class="cpage-inset">${img}</figure>${para}</div>\n`;
    }
    out = out.replace(whole, moved);
  }
  return out;
}
