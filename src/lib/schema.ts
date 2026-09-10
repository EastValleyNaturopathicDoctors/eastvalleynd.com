/**
 * Serialise structured data for a `<script type="application/ld+json">` block.
 *
 * `JSON.stringify` alone is not safe there. It leaves `<` and `>` intact, so a
 * value containing `</script>` closes the block early and everything after it
 * is parsed as HTML — the classic JSON-in-script injection. The values here
 * come from migrated WordPress titles, descriptions and author names, which is
 * exactly the kind of content that eventually contains a stray tag.
 *
 * Escaping the three characters as `\uXXXX` keeps the JSON semantically
 * identical — a parser decodes them back — while making it impossible for a
 * value to break out of the element.
 */
const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  // U+2028/U+2029 are valid inside a JSON string but terminate a line in a
  // JavaScript parser, which breaks the block just as surely.
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => ESCAPES[c]!);
}
