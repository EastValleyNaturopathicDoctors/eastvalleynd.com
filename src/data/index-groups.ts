/**
 * Hand-kept: how the Services and Conditions indexes group their pages
 * (src/components/TopicIndex.astro), by kind of care, each group with a line
 * saying what's in it. The clinic chose this layout (Option 2, "By topic") at
 * the Oct 8, 2026 meeting, over the original panels and a guided photo picker.
 *
 * Every entry is a page's href from the section's menu (src/data/nav.json). A
 * page that isn't listed here still shows, under "More", and the build log
 * says so. Group lines describe what is in the group, never what it treats or
 * achieves. The order within a group is the clinic's to set.
 */
export type IndexGroup = { title: string; blurb: string; items: string[] };

export type IndexGroups = {
  /** What one item is called on the cards: [singular, plural]. */
  noun: [string, string];
  groups: IndexGroup[];
};

export const indexGroups: Record<string, IndexGroups> = {
  '/services/': {
    noun: ['service', 'services'],
    groups: [
      { title: 'Brain & nervous system', blurb: 'Brain mapping, neurofeedback, brain stimulation and the Brain Regeneration Clinic.',
        items: ['/brain-regeneration-clinic/', '/neurofeedback/', '/qeeg-brain-mapping/', '/transcranial-direct-current-stimulation/',
          '/exomind-tms/', '/photobiomodulation/', '/alpha-stim-treatment/', '/heart-rate-variability-training/'] },
      { title: 'IV & injections', blurb: 'Nutrients and therapies given by IV drip or by injection.',
        items: ['/iv-therapy/', '/injection-therapy/', '/ozone-therapy/'] },
      { title: 'Regenerative & pain', blurb: 'Therapies for pain, injury and tissue repair.',
        items: ['/prp-and-prolotherapy/', '/hyperbaric-oxygen-therapy/', '/frequency-specific-microcurrent-therapy/', '/acupuncture/'] },
      { title: 'Hormones, metabolism & detox', blurb: 'Hormone therapy, weight loss and detox programs.',
        items: ['/hormone-therapy/', '/weight-loss/', '/detoxification/'] },
      { title: 'Testing', blurb: 'Specialty lab testing.',
        items: ['/specialty-labs/'] },
      { title: 'Aesthetics', blurb: 'Skin treatments.',
        items: ['/skinpen-microneedling/'] },
      { title: 'Programs', blurb: 'Care for veterans.',
        items: ['/save-our-veterans/'] },
    ],
  },
  '/conditions/': {
    noun: ['area of care', 'areas of care'],
    groups: [
      { title: 'Pain & joints', blurb: 'Chronic pain, arthritis and bone health.',
        items: ['/conditions/chronic-pain/', '/conditions/arthritis/', '/conditions/osteoporosis/'] },
      { title: 'Brain, mood & sleep', blurb: 'Mental health, sleep, long COVID and POTS.',
        items: ['/conditions/mental-health/', '/conditions/insomnia/', '/conditions/long-covid-syndrome/', '/conditions/pots/'] },
      { title: 'Gut, immune & allergy', blurb: 'Digestive, immune, allergic and chronic infectious conditions.',
        items: ['/conditions/gastrointestinal-disorders/', '/conditions/allergies-eczema-asthma-mcas/', '/conditions/autoimmune/',
          '/conditions/lyme-disease/', '/conditions/chronic-fatigue/'] },
      { title: 'Hormones & metabolism', blurb: "Women's and men's health, fertility, adrenal, blood sugar and MTHFR.",
        items: ['/conditions/womens-health/', '/mens-health/', '/conditions/adrenal-fatigue/', '/conditions/diabetes/',
          '/conditions/infertility/', '/conditions/mthfr/'] },
      { title: 'Heart', blurb: 'Cardiovascular care and testing.',
        items: ['/conditions/heart-care/'] },
      { title: 'Children', blurb: 'Behavioral and medical conditions in children.',
        items: ['/conditions/childhood-behavioral-disorders/', '/conditions/childhood-medical-disorders/'] },
      { title: 'Skin & cancer support', blurb: 'Skin conditions, and support for patients with cancer.',
        items: ['/conditions/skin-conditions/', '/conditions/cancer-support/'] },
    ],
  },
};
