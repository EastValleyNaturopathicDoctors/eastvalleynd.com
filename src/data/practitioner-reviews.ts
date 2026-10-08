/**
 * Hand-kept: the Google reviews shown on each practitioner's page (ids from
 * src/data/google-reviews.json, five-star only). Chosen Oct 2026 from the
 * clinic's Google export, then checked review by review:
 *
 *   named  reviews that name this practitioner (nickname or misspelling
 *          included), up to ten, covering the range of what they treat
 *   more   only where fewer than five name them: reviews that name no
 *          practitioner, about their kind of work where one exists, else the
 *          clinic in general. Shown under their own heading, never as if they
 *          were about this practitioner; each appears on one page only.
 */
export const practitionerReviews: Record<string, { named: string[]; more: string[] }> = {
  'jason-porter': {
    named: ['6b86c57337', '3824f1e717', 'e27d284516', '9b7614d7e7', '882ed7af85', '1691981f0f', '643f285c98', 'eb4a490384', 'd2ead7eaac', '5292be6eb0'],
    more: [],
  },
  'jennifer-nevels': {
    named: ['59206a3942', 'a0f1a2aebc', 'e9a55d8664', '15dd1c3b51', 'a353a3179e', 'b0083a9e71', '9c2a118786', 'e8161c2175', '1eef4f3d18', '2b06cc74dc'],
    more: [],
  },
  'laura-badalamenti-schwartz': {
    named: ['37073a409b', 'c0716ac41c', 'e9e1bf92ba', '8e677cf631', '2a37f05988', '0a02eaf866', 'bcb6cdcf1e', '1344934f20', 'b57f048272', '1d4e09b7d5'],
    more: [],
  },
  'casey-seenauth': {
    named: ['4e4f50b301', '820f657f88', 'cf1760bf8b', '38300aeae0', '70eecfd845', 'e186cb25c6', '8942e75c6d', '6efb6de452', '08fe2d58d1', 'b1048afdac'],
    more: [],
  },
  'jean-sutliff-stanley': {
    named: ['d7f98744a6'],
    more: ['fefc97af25', '683762dc39', 'a63cdae759', '809b23aaab', '87b5652bc6', '9826e8dab3'],
  },
  'shelly-sandhu': {
    named: [],
    more: ['ac49bbb89a', 'd6f9c2cbdf', '22b7c83f77', '75653a1acb', '230dc4fcc0', 'aa861e81f5', '2ab2af5d93', '47d78ff83e'],
  },
  'marie-ybarra': {
    named: [],
    more: ['8c76ee34d3', '35e4b22dc2', '0b585d9dc1', '229e57d47f', '62d42eccbb', '1c3ddede5f', '7048aebd0d'],
  },
};
