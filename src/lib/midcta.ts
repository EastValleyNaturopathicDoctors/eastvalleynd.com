/**
 * Where to put a booking prompt inside a long migrated body.
 *
 * Content pages, posts and bios render one HTML blob from WordPress or a
 * Word document, and until now the only booking CTA sat under the footer —
 * 1,900 words away on a page like /conditions/insomnia/. This finds a
 * top-level <h2> far enough in that the reader has committed, but with
 * enough article left that the prompt is not just another footer, and splits
 * the HTML there so the layout can render a component between the halves.
 *
 * Returns null when the body is short (the footer CTA is near enough), when
 * no heading sits at a usable depth, or when the copy already carries its own
 * CTA buttons (`cta-inline`, from the decks' brace directives — see D103).
 */
function words(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

export function splitForCta(
  html: string,
  { minWords = 700, leadWords = 250, tailWords = 200, fallbackAt = 0.4 } = {},
): [string, string] | null {
  if (!html || html.includes('cta-inline')) return null;
  const total = words(html);
  if (total < minWords) return null;

  // Candidate cut points: the start of every top-level block. A heading is the
  // natural seam; a paragraph boundary is the fallback for bodies whose section
  // titles are plain uppercase paragraphs (the migrated insomnia article).
  const seams: { at: number; heading: boolean }[] = [];
  let depth = 0;
  for (const m of html.matchAll(/<(\/?)(h2|h3|p|ul|ol|table|blockquote|div|figure|details|section)\b/gi)) {
    const tag = m[2].toLowerCase();
    if (tag === 'h2' || tag === 'h3' || tag === 'p') {
      if (!m[1] && depth === 0) seams.push({ at: m.index!, heading: tag !== 'p' });
      continue;
    }
    depth += m[1] ? -1 : 1;
  }
  const ok = (s: { at: number }, lead: number) =>
    words(html.slice(0, s.at)) >= lead && words(html.slice(s.at)) >= tailWords;

  const seam =
    seams.find((s) => s.heading && ok(s, leadWords)) ??
    seams.find((s) => !s.heading && ok(s, Math.max(leadWords, total * fallbackAt)));
  return seam ? [html.slice(0, seam.at), html.slice(seam.at)] : null;
}
