/**
 * Hand-kept: two alternative ways to organise the Services and Conditions
 * indexes, shown beside the current one as "Option 2" and "Option 3" tabs so
 * the clinic can compare them on the live pages (Oct 2026). Once it picks one,
 * the other two and this preview go (src/components/IndexOptions.astro).
 *
 * Every entry is a page's href from the section's menu (src/data/nav.json). A
 * page that isn't listed here still shows, under "More", and the build log
 * says so; a page listed twice shows twice.
 *
 *   two:   By topic. Groups by kind of care, each with a line saying what's in it.
 *   three: Guided. Photo cards ask what the visitor needs; picking one narrows
 *          the list to that group. Conditions adds a "who it's for" row.
 *
 * Group lines describe what is in the group, never what it treats or achieves.
 * Photos are decorative (alt=""): the card's title says what it is.
 */
export type IndexGroup = {
  title: string;
  blurb: string;
  items: string[];
  /** Option 3's card photo: a file in src/images/stock or src/images/pages. */
  photo?: { set: 'stock' | 'pages'; file: string };
};

export type IndexOptions = {
  /** What one item is called on the cards: [singular, plural]. */
  noun: [string, string];
  two: IndexGroup[];
  three: { prompt: string; rows: { label?: string; groups: IndexGroup[] }[] };
};

export const indexOptions: Record<string, IndexOptions> = {
  '/services/': {
    noun: ['service', 'services'],
    two: [
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
    three: {
      prompt: 'What would you like help with?',
      rows: [{
        groups: [
          { title: 'Find the root cause', blurb: 'Specialty labs and QEEG brain mapping.',
            items: ['/specialty-labs/', '/qeeg-brain-mapping/'],
            photo: { set: 'stock', file: 'unsplash-0jE8ynV4mis.jpg' } },
          { title: 'Brain health', blurb: 'Neurofeedback, brain stimulation and the Brain Regeneration Clinic.',
            items: ['/brain-regeneration-clinic/', '/neurofeedback/', '/transcranial-direct-current-stimulation/', '/exomind-tms/',
              '/photobiomodulation/', '/alpha-stim-treatment/', '/heart-rate-variability-training/'],
            photo: { set: 'stock', file: 'unsplash-JkAxfH5ktpw.jpg' } },
          { title: 'Pain & injury', blurb: 'PRP, prolotherapy, microcurrent, hyperbaric oxygen and acupuncture.',
            items: ['/prp-and-prolotherapy/', '/frequency-specific-microcurrent-therapy/', '/hyperbaric-oxygen-therapy/', '/acupuncture/'],
            photo: { set: 'pages', file: 'frequency-specific-microcurrent-therapy.jpg' } },
          { title: 'IV, injections & detox', blurb: 'IV therapy, injections, ozone and detox programs.',
            items: ['/iv-therapy/', '/injection-therapy/', '/ozone-therapy/', '/detoxification/'],
            photo: { set: 'stock', file: 'unsplash-RXVfrhCswCQ.jpg' } },
          { title: 'Hormones, weight & skin', blurb: 'Hormone therapy, weight loss and SkinPen microneedling.',
            items: ['/hormone-therapy/', '/weight-loss/', '/skinpen-microneedling/'],
            photo: { set: 'stock', file: 'unsplash-2c1orP6z2eo.jpg' } },
          { title: 'Veterans', blurb: 'Our program for veterans.',
            items: ['/save-our-veterans/'],
            photo: { set: 'stock', file: 'unsplash-1MkR9ehe9Fg.jpg' } },
        ],
      }],
    },
  },

  '/conditions/': {
    noun: ['area of care', 'areas of care'],
    two: [
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
    three: {
      prompt: "What's going on?",
      rows: [
        {
          label: "By what you're dealing with",
          groups: [
            { title: 'Pain, joints & bones', blurb: 'Chronic pain, arthritis and osteoporosis.',
              items: ['/conditions/chronic-pain/', '/conditions/arthritis/', '/conditions/osteoporosis/'],
              photo: { set: 'pages', file: 'conditions-chronic-pain.jpg' } },
            { title: 'Fatigue, Lyme & long COVID', blurb: 'Chronic fatigue, Lyme disease, long COVID, POTS and adrenal fatigue.',
              items: ['/conditions/chronic-fatigue/', '/conditions/lyme-disease/', '/conditions/long-covid-syndrome/',
                '/conditions/pots/', '/conditions/adrenal-fatigue/'],
              photo: { set: 'stock', file: 'unsplash-NSDC6XTcF3M.jpg' } },
            { title: 'Gut, immune & skin', blurb: 'Digestive, autoimmune, allergic and skin conditions.',
              items: ['/conditions/gastrointestinal-disorders/', '/conditions/allergies-eczema-asthma-mcas/',
                '/conditions/autoimmune/', '/conditions/skin-conditions/'],
              photo: { set: 'stock', file: 'unsplash-jUPOXXRNdcA.jpg' } },
            { title: 'Mood & sleep', blurb: 'Mental health and insomnia.',
              items: ['/conditions/mental-health/', '/conditions/insomnia/'],
              photo: { set: 'stock', file: 'unsplash-_TSHXXo52hA.jpg' } },
            { title: 'Heart & metabolism', blurb: 'Heart care, blood sugar and MTHFR.',
              items: ['/conditions/heart-care/', '/conditions/diabetes/', '/conditions/mthfr/'],
              photo: { set: 'stock', file: 'unsplash-Q3J1wmn7_8w.jpg' } },
            { title: 'Cancer support', blurb: 'Support for patients with cancer.',
              items: ['/conditions/cancer-support/'],
              photo: { set: 'stock', file: 'unsplash-FsjdtF_6I5k.jpg' } },
          ],
        },
        {
          label: "By who it's for",
          groups: [
            { title: 'Women', blurb: "Women's health and fertility.",
              items: ['/conditions/womens-health/', '/conditions/infertility/'],
              photo: { set: 'stock', file: 'unsplash-GhzYsSaqdjo.jpg' } },
            { title: 'Men', blurb: "Men's health.",
              items: ['/mens-health/'],
              photo: { set: 'stock', file: 'unsplash-20jX9b35r_M.jpg' } },
            { title: 'Children', blurb: 'Behavioral and medical conditions in children.',
              items: ['/conditions/childhood-behavioral-disorders/', '/conditions/childhood-medical-disorders/'],
              photo: { set: 'stock', file: 'unsplash-Rd01U0tPmQI.jpg' } },
          ],
        },
      ],
    },
  },
};
