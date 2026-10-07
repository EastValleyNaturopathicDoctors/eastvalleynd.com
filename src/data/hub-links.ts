/**
 * Hand-kept (not generated). A hub page whose body lists its conditions and
 * therapies, each entry an h3 and a paragraph ending in "Learn More" — words
 * that were buttons on the old site and lost their links in migration
 * (tracker P1). Hub route -> entry heading -> the page the entry is about.
 *
 * Applied by src/lib/hublinks.ts, which links the heading and the entry's
 * "Learn more" words; no words are added or changed. Headings are matched on
 * their letters and digits only, so punctuation, ™ and entities do not matter.
 * Targets go through the link clean-up in src/lib/links.ts like any body
 * link, so a duplicate or placeholder target still lands on the page kept.
 *
 * The permanent fix is upstream: the links belong in the generated body
 * (src/content/pages/brain-regeneration-clinic.md, from extract/build_pages.py).
 * Once it carries them, the hub's entry here does nothing and can be deleted.
 */
export const hubLinks: Record<string, Record<string, string>> = {
  '/brain-regeneration-clinic/': {
    // Conditions We Treat: the clinic's own sub-pages first.
    "Dementia and Alzheimer's Disease": '/brain-regeneration-clinic/alzheimers-and-dementia/',
    'Concussion and Traumatic Brain Injury': '/brain-regeneration-clinic/concussion-and-traumatic-brain-injury/',
    'Long COVID Syndrome': '/brain-regeneration-clinic/long-covid-syndrome/',
    'Stroke Injury': '/brain-regeneration-clinic/stroke-injury/',
    'Depression and Anxiety': '/brain-regeneration-clinic/depression-and-anxiety/',
    'Insomnia': '/brain-regeneration-clinic/insomnia/',
    'Chronic Stress': '/brain-regeneration-clinic/chronic-stress/',
    'Anti-Aging': '/brain-regeneration-clinic/anti-aging/',
    // No sub-page under the clinic: the Conditions pages and the post on topic.
    'Autism': '/conditions/childhood-behavioral-disorders/autism/',
    'ADHD': '/conditions/childhood-behavioral-disorders/',
    'PANDAS and PANS': '/conditions/childhood-behavioral-disorders/pandas/',
    'Learning Disorders': '/how-neurofeedback-helps-wth-reading-and-learning-disorders/',
    // Brain Therapies: each one's service page.
    'ExoMind™ Transcranial Magnetic Stimulation (TMS)': '/exomind-tms/',
    'Hyperbaric Oxygen Therapy': '/hyperbaric-oxygen-therapy/',
    'Neurofeedback Therapy': '/neurofeedback/',
    'Frequency Specific Microcurrent': '/frequency-specific-microcurrent-therapy/',
    'Heart Rate Variability Training (HRV)': '/heart-rate-variability-training/',
    'Brain Photobiomodulation': '/photobiomodulation/',
    'Transcranial Direct Current Stimulation': '/transcranial-direct-current-stimulation/',
    'Alpha Stim': '/alpha-stim-treatment/',
    'Infrared Sauna Therapy for Detoxification': '/detoxification/',
  },
};
