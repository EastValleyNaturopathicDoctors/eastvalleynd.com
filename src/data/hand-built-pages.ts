/**
 * Hand-kept: routes the content pipeline generates a page for that now have a
 * hand-built page of their own in src/pages, which wins. The catch-all route
 * (src/pages/[...slug].astro) skips them, so Astro never sees the same path
 * twice. The generated file stays as the source of the page's words: rebuild
 * the hand-built page from it when the clinic changes them.
 */
export const handBuiltPages: string[] = [
  '/patient-portal/', // src/pages/patient-portal.astro, from src/content/pages/patient-portal.md
];
