/**
 * A migrated page title or menu label with its paste damage removed: stray
 * leading punctuation and runs of spaces (WordPress gave one page the title
 * ".       Plasmalogens"). Applied where both are loaded, the content schema
 * (src/content.config.ts) and the menu (src/lib/nav.ts), so a regenerated
 * file can't bring it back. The pipeline should still clean its source.
 */
export const tidyLabel = (s: string): string =>
  fixText(s.replace(/^[\s.,;:·•\-–—]+/, '').replace(/\s{2,}/g, ' ').trim());

/**
 * Typos in migrated text that show in Google (audit 2026-11-02), fixed where
 * text loads: titles and menu labels (tidyLabel), meta descriptions (the
 * content schema) and page and post bodies (tidyProse in src/lib/prose.ts).
 * Exact, case-sensitive replacements, so an address such as
 * /how-neurofeedback-can-help-with-traumatic-brain-injures/ is left alone.
 * The pipeline should still fix its source.
 */
const TEXT_FIXES: [string, string][] = [
  ['Tramautic', 'Traumatic'],
  ['Brain Injures', 'Brain Injuries'],
  ['Reduce Tremor Agressivemeses', 'Reduce Tumor Aggressiveness'],
  ['Digestivee', 'Digestive'],
  ['Rreduce', 'Reduce'],
  ['Petide Therapy', 'Peptide Therapy'],
  ['Garelli', 'Galleri'],
  ['detected ?', 'detected?'],
  ['Dr. Laura. Badalamenti', 'Dr. Laura Badalamenti'],
  ['how tit can', 'how it can'],
  ['nuerofeedback', 'neurofeedback'],
];
export const fixText = (s: string): string => TEXT_FIXES.reduce((t, [from, to]) => t.split(from).join(to), s);
