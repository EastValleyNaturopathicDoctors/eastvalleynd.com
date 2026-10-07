/**
 * WordPress shortcodes the migration left behind in encoded form (tracker P6).
 * Some plugins stored a shortcode base64-encoded on top of URL-encoded, so the
 * pipeline's shortcode stripping never saw it and the code reached the page as
 * text: Dr. Nevels' bio ended in "JTVCY3Rj…", an old Constant Contact signup
 * form (`[ctct form="2685"]`). Every such string starts "JTVC" ("%5B", an
 * encoded "["), and it is removed only when it decodes to a whole shortcode,
 * so ordinary words are never touched.
 *
 * The permanent fix belongs in the content pipeline; this keeps the built
 * page right until then.
 */
const ENCODED = /JTVC[A-Za-z0-9+/]+={0,2}/g;

/** The shortcode a string encodes, or null when it is not one. */
function decode(s: string): string | null {
  try {
    const text = decodeURIComponent(Buffer.from(s, 'base64').toString('utf8'));
    return /^\[[a-z][\w-]*(?:\s[^\]]*)?\]$/i.test(text) ? text : null;
  } catch {
    return null;
  }
}

/** The body with every encoded shortcode removed; anything else is left byte for byte. */
export function stripEncodedShortcodes(html: string): string {
  return html.replace(ENCODED, (m) => (decode(m) ? '' : m));
}
