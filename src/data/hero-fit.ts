/**
 * Hand-kept: how a page's own picture sits in the split hero's 4:3 frame
 * (ContentPage.astro). By default it fills the frame, cropped at the edges —
 * the clinic's call (Oct 2026): no white around a photo. These pictures lose
 * something to that crop, so they are shown whole instead:
 *
 *   mounted   on the white mount: product cut-outs on a white background,
 *             whose ends the crop would chop (the IV drips' circle graphics
 *             are mounted too, by route, in ContentPage.astro)
 *   backdrop  over a blurred copy of itself: graphics with lettering, whose
 *             words the crop would cut, on a coloured ground white would break
 */
export const heroFit: Record<string, 'mounted' | 'backdrop'> = {
  // The Quamvis chamber, cut out on white.
  '/hyperbaric-oxygen-therapy/': 'mounted',
  '/hyperbaric-oxygen-therapy/cancer/': 'mounted',
  // The ExoMind chair and console, cut out on white.
  '/exomind-tms/': 'mounted',
  // "Introducing our new take-home neurofeedback system", lettered to the right edge.
  '/transcranial-direct-current-stimulation/': 'backdrop',
  '/neurofeedback/': 'backdrop',
};
