/**
 * A migrated page title or menu label with its paste damage removed: stray
 * leading punctuation and runs of spaces (WordPress gave one page the title
 * ".       Plasmalogens"). Applied where both are loaded, the content schema
 * (src/content.config.ts) and the menu (src/lib/nav.ts), so a regenerated
 * file can't bring it back. The pipeline should still clean its source.
 */
export const tidyLabel = (s: string): string =>
  s.replace(/^[\s.,;:·•\-–—]+/, '').replace(/\s{2,}/g, ' ').trim();
