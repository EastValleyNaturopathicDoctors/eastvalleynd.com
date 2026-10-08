/**
 * Hand-kept: one sentence under a subpage's card in a landing page's
 * "Explore …" band (ContentPage.astro), so a visitor knows what each one is
 * before clicking. Each is drawn from that subpage's own copy; nothing here
 * goes further than the page it describes. Keyed by the card's href.
 */
export const cardBlurbs: Record<string, string> = {
  // IV Therapy
  '/iv-therapy/detox-defender/': 'Vitamins and minerals with glutathione and M.I.C. (methionine, inositol and choline), to support the liver’s detox process.',
  '/iv-therapy/the-energizer-iv/': 'Vitamins, minerals and the amino acids taurine and carnitine, intended to boost energy.',
  '/iv-therapy/high-dose-vitamin-c-iv/': 'Vitamin C by IV, at doses that raise blood levels far beyond what vitamin C by mouth can reach.',
  '/iv-therapy/hydration-iv/': 'Fluids, electrolytes and vitamins for dehydration from illness, heat, hard exercise or pregnancy.',
  '/iv-therapy/hydrogen-peroxide-iv/': 'A dose of hydrogen peroxide delivered directly into circulation to stimulate the immune system.',
  '/iv-therapy/myers-cocktail/': 'One of our most popular IVs: B vitamins, vitamin C, calcium, magnesium, zinc and selenium, for fatigue, immune function and energy.',
  '/iv-therapy/nad-mitochondrial-iv/': 'NAD, a coenzyme every cell uses for energy production and DNA repair, with vitamins B5 and B6.',
  '/iv-therapy/ozone-iv-therapy/': 'A small amount of your own blood, mixed with medical-grade ozone and returned, to stimulate the immune system.',
  '/iv-therapy/plaquex/': 'Intravenous phosphatidylcholine, to support circulation and heart and vascular health.',
};
