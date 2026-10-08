/**
 * Hand-kept: the clinic's YouTube videos that feature a practitioner, shown on
 * their profile under the bio (src/pages/physicians/[slug].astro). Ids are
 * keys of src/data/videos.json, which holds each title and poster.
 */
export const practitionerVideos: Record<string, string[]> = {
  'jason-porter': [
    'fZ2ebWfznls', // Alzheimer's Brain Mapping with iSYNC
    'IyuKpDZu148', // Candida: The Alien Invader
  ],
};
