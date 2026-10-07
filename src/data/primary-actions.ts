/**
 * Hand-kept (not generated). A page whose body opens with the one button most
 * visitors came for (tracker P2): route -> that button's words. The button is
 * lifted out of the body into the page hero, under the title, as the page's
 * dark main button — the same link and words, just higher and stronger.
 *
 * Applied by src/lib/primaryaction.ts in ContentPage.astro. A route whose body
 * no longer carries a button with these words simply keeps its body as it is.
 *
 * The permanent fix is upstream: the pipeline could mark the button as the
 * page's main action (src/content/pages/patient-portal.md, from
 * extract/build_pages.py) instead of emitting it as a ghost button in the body.
 */
export const primaryActions: Record<string, string> = {
  '/patient-portal/': 'Go To Patient Portal',
};
