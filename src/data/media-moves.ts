/**
 * Hand-kept (not generated): pictures and videos a migrated body piles up in
 * one place, each moved to the section it illustrates (src/lib/mediamoves.ts).
 *
 * The Chronic Pain page opened with four full-width photos and a video before
 * a word of text; on the old site they sat in a column beside it. Each entry
 * names the file (or YouTube id) and the heading of the section it belongs to;
 * a picture sits beside that section's first paragraph, a video after it.
 * `alt` replaces a missing or wrong description.
 *
 * The permanent fix belongs in the content pipeline; an entry here can go once
 * the generated body places the picture itself.
 */
export type MediaMove =
  | { file: string; to: string; alt?: string }
  | { video: string; to: string };

export const mediaMoves: Record<string, MediaMove[]> = {
  '/conditions/chronic-pain/': [
    { file: '2008-09-middle-aged-asian-woman-suffers-from-shoulder-join-2023-04-29-02-40-08-utc-scaled.jpg', to: 'Shoulder Pain' },
    // Its old description said "Frequency Specific Microcurrent Therapy".
    { file: '2019-10-hold-copy-space-massage-tendon-outside-physical-shoes-hands-joint-run-body-leg-problem-injury-runner_t20_rRV8kX-1-e1570815666934.jpg',
      to: 'Knee Pain', alt: 'A runner crouching on a road, holding a sore knee' },
    { file: '2021-03-Still1.jpg', to: 'Hyperbaric Oxygen Therapy',
      alt: 'A clinician closing a hyperbaric chamber in a treatment room' },
    { file: '2022-02-DSC01399-scaled.jpg', to: 'Frequency Specific Microcurrent Therapy',
      alt: 'Microcurrent units wired to a patient lying on a treatment table' },
    { video: 'ZHyeEH4GA88', to: 'Platelet Rich Plasma (PRP) and Prolotherapy' },
  ],
};
