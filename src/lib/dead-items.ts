/**
 * Document library entries whose file was dropped (Nov 2026). The PDFs
 * keep/kill sheet ("EVND PDFs- keep, kill, use copy for landing page") marked
 * these files Kill, so the migration removed the files and their links and
 * 301'd the old PDF addresses to the page, but left each name behind as plain
 * text, which read as broken links. Each name goes when it appears unlinked,
 * as a list item or a paragraph, matched exactly; a list, or a section, left
 * with nothing in it goes too, heading and all, so the page's jump links
 * (built from its headings afterwards) don't point at an empty section.
 *
 * To bring one back: get the clinic's current PDF into public/, link it in
 * the page, and take its name off this list.
 */
const DEAD: Record<string, string[]> = {
  '/forms-and-handouts/': [
    // Chronic Disease Questionnaires
    'Horowitz Lyme Symptom Checklist',
    'BII Symptom Checklist',
    'Mold Exposure Questionnaire',
    'Parasite Questionnaire',
    'How Toxic is Your Body?',
    'Highly Sensitive Person Questionnaire',
    'Brain Injury Questionnaire',
    // EVND Diet, Detox, and Cleanse Handouts
    'Autism Diet',
    'IgG Food Intolerance',
    'Whole Body Detoxification',
    '10 Day Cleanse Diet',
    // EVND Fasting Handouts and Guides
    'Intermittent and Multi-Day Fasting Guide',
    'Pro Fasting Plan',
    'Master Fasting Plan',
    // EVND Treatment Plans
    'Exercise Program Design',
    'Autism Treatment Plan',
    'Testosterone Replacement Therapy',
    'Stem Cell, PRP and Prolotherapy Injections',
    // Consent Forms
    'QEEG & Neurofeedback Consent Form',
    'Hyperbaric Oxygen Therapy Consent Form(Child or Adult)',
    'FSM Consent Form',
  ],
};

const text = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&#x26;|&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ').trim();

/** The page body without its dead entries (see above). Other pages pass through. */
export function dropDeadItems(html: string, route: string): string {
  const dead = DEAD[route];
  if (!dead) return html;
  const names = new Set(dead);
  // Unlinked entries, as list items or paragraphs.
  let out = html.replace(/<(li|p)\b[^>]*>([\s\S]*?)<\/\1>\s*/g, (whole, _tag, inner: string) =>
    !/<a\b/i.test(inner) && names.has(text(inner)) ? '' : whole);
  // Lists left empty.
  out = out.replace(/<(ul|ol)\b[^>]*>\s*<\/\1>\s*/g, '');
  // Sections left empty: a heading followed straight by another heading of
  // the same or a higher level, or by the end of the body.
  // The heading's text can't run past its own closing tag ((?!<\/h) below):
  // a lazy [\s\S]*? let a match stretch over the next section to reach a
  // following heading, and took a live section with the empty one.
  out = out.replace(/<h([2-4])\b[^>]*>(?:(?!<\/h[1-6]>)[\s\S])*<\/h\1>\s*(?=<h([2-4])\b|$)/g, (whole, level: string, next?: string) =>
    !next || Number(next) <= Number(level) ? '' : whole);
  return out;
}
