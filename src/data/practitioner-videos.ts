/**
 * Hand-kept: the clinic's YouTube videos that feature a practitioner, shown on
 * their profile under the bio (src/pages/physicians/[slug].astro). Ids are
 * keys of src/data/videos.json, which holds each title and poster.
 */
export const practitionerVideos: Record<string, string[]> = {
  // All the videos he is in (his call at the Oct 8, 2026 meeting). Still to
  // add once their titles and posters can be fetched: 9MeHjXcp6dc, Iigo8XbqjW4.
  // Not rs6uwl5iJQA (brain injury): its title card names Casey Seenauth, ND.
  'jason-porter': [
    'fZ2ebWfznls', // Alzheimer's Brain Mapping with iSYNC
    'IyuKpDZu148', // Candida: The Alien Invader
    '_M2tJR2FCTk', // Understanding Post Covid Syndrome (with Dr. Seenauth)
  ],
};
