/**
 * Search titles (<title> and og:title only; the visible H1 is untouched), for
 * pages whose migrated title lost the words the old WordPress title ranked on
 * (audits 2026-10-08 and 2026-11-02): the HBOT and tDCS child pages had lost
 * the therapy ('Cancer' for 'Cancer & Hyperbarics'), others an acronym or a
 * searched term. Each comment is the old WordPress title. Interim, hand-kept:
 * the permanent home is a seoTitle field from the content pipeline.
 *
 * Base.astro adds ' — EVND' unless the title already carries the clinic's name.
 */
export const seoTitles: Record<string, string> = {
  '/brain-regeneration-clinic/concussion-and-traumatic-brain-injury/': 'Concussion & Traumatic Brain Injury Recovery Program', // Brain Injury and Concussion Recovery Program
  '/brain-regeneration-clinic/depression-and-anxiety/': 'Depression & Anxiety: Brain Regeneration Clinic', // The Naturopathic Approach to Mood Disorders
  '/brain-regeneration-clinic/stroke-injury/': 'Stroke Recovery Program', // Stroke Recovery Program
  '/conditions/allergies/sublingual-immunotherapy/': 'Sublingual Immunotherapy (SeroSlit)', // Sublingual Immunotherapy (SeroSlit)
  '/conditions/arthritis/': 'Arthritis Treatment Program', // Arthritis Treatment Program
  '/conditions/autoimmune/': 'Immune & Autoimmune Disorders', // Immune and Autoimmune Disorders
  '/conditions/cancer-support/': 'Integrative Cancer Support', // Cancer Alternative Treatment and Support
  '/conditions/childhood-behavioral-disorders/autism/': 'Autism Spectrum Disorders', // Autism Spectrum Disorders
  '/conditions/childhood-behavioral-disorders/pandas/': 'PANDAS & PANS', // PANDAS & PANS
  '/conditions/childhood-medical-disorders/': 'Pediatric Care & Childhood Medical Disorders', // Pediatric Care
  '/conditions/chronic-pain/': 'Chronic Pain Clinic', // Chronic Pain Clinic
  '/conditions/chronic-pain/back-pain/': 'Low Back Pain', // Low Back Pain
  '/conditions/chronic-pain/tmj-pain/': 'TMJ Pain', // TMJ Pain
  '/conditions/diabetes/': 'Diabetes, Prediabetes & Metabolic Issues', // Diabetes and Prediabetes
  '/conditions/gastrointestinal-disorders/inflammatory-bowel-disease/': "Inflammatory Bowel Disease: Crohn's & Ulcerative Colitis", // Inflammatory Bowel Disease (IBD/Crohn's/Ulcerative Colitis)
  '/conditions/heart-care/': 'Natural Heart Care', // Natural Heart Care
  '/conditions/heart-care/coronary-artery-disease/': 'Coronary Artery Disease (CAD)', // Coronary Artery Disease (CAD)
  '/conditions/heart-care/peripheral-arterial-disease/': 'Peripheral Arterial Disease (PAD)', // Peripheral Arterial Disease (PAD)
  '/conditions/mcas/': 'MCAS & Histamine Intolerance', // MCAS and Histamine Intolerance
  '/conditions/mental-health/': 'Depression, Anxiety & Mental Health', // Diagnosis of Depression and Anxiety
  '/conditions/mental-health/highly-sensitive-person/': 'Highly Sensitive Person Protocols', // Highly Sensitive Person Protocols
  '/conditions/mthfr/': 'MTHFR & Methylation Pathways', // Methylation Pathways and SNP's (MTHFR)
  '/conditions/osteoporosis/': 'Osteoporosis Treatment & Prevention', // Osteoporosis Treatment & Prevention in Mesa, AZ
  '/conditions/pots/': 'POTS & Dysautonomia', // Dysautonomia/POTS
  '/conditions/womens-health/pcos/': 'PCOS (Polycystic Ovarian Syndrome) & Endometriosis', // Polycystic Ovarian Syndrome
  '/detoxification/': 'Detox Clinic & Programs', // Detox Clinic
  '/detoxification/environmental-detox-program/': 'Environmental Detox Program', // Environmental Detox Program
  '/detoxification/mold-detox-program/': 'Mold Exposure & Detox Program', // Mold Exposure
  '/hyperbaric-oxygen-therapy/anti-aging/': 'Hyperbaric Oxygen Therapy for Anti-Aging', // Anti-Aging & Hyperbarics
  '/hyperbaric-oxygen-therapy/cancer/': 'Hyperbaric Oxygen Therapy for Cancer', // Cancer & Hyperbarics
  '/hyperbaric-oxygen-therapy/cerebral-palsy/': 'Hyperbaric Oxygen Therapy for Cerebral Palsy', // Cerebral Palsy & Hyperbarics
  '/hyperbaric-oxygen-therapy/diabetes/': 'Hyperbaric Oxygen Therapy for Diabetes', // Diabetes & Hyperbarics
  '/hyperbaric-oxygen-therapy/faq/': 'Hyperbaric Oxygen Therapy (HBOT) FAQ', // HBOT FAQ
  '/hyperbaric-oxygen-therapy/inflammation/': 'Hyperbaric Oxygen Therapy for Inflammation', // Inflammation & Hyperbarics
  '/hyperbaric-oxygen-therapy/stem-cells/': 'Hyperbaric Oxygen Therapy & Stem Cells', // Stem Cells & Hyperbarics
  '/hyperbaric-oxygen-therapy/stroke/': 'Hyperbaric Oxygen Therapy for Stroke', // Stroke & Hyperbarics
  '/injection-therapy/vitamin-b12-shot/': 'Vitamin B12 Shots & Injections', // Vitamin B12 Injections
  '/iv-therapy/high-dose-vitamin-c-iv/': 'High Dose Vitamin C IV', // High Dose Vitamin C IV
  '/iv-therapy/hydrogen-peroxide-iv/': 'Hydrogen Peroxide IV Therapy', // Hydrogen Peroxide IV
  '/iv-therapy/myers-cocktail/': 'Myers Cocktail IV', // Super Myers IV
  '/iv-therapy/plaquex/': 'Plaquex IV Therapy', // Plaquex IV Therapy
  '/mens-health/prostate-health/': 'Preventative Prostate Health', // Preventative Prostate Health
  '/save-our-veterans/': 'Save Our Veterans', // Save Our Veterans
  '/specialty-labs/heavy-metals/': 'Heavy Metal Testing & Detox', // Heavy Metal Detox
  '/specialty-labs/microbiome-panel/': 'GI Microbiome Panel', // US Biotek GI Microbiome Panels
  '/specialty-labs/nasal-bacteria-culture-marcons-testing/': 'Nasal Bacteria Culture (MARCoNS Testing)', // Nasal Bacteria Culture (MARCoNS Testing)
  '/specialty-labs/organic-acid-test/': 'Organic Acid Test (OAT)', // Organic Acid Test
  '/transcranial-direct-current-stimulation/adhd/': 'tDCS for ADHD', // tDCS for ADHD
  '/transcranial-direct-current-stimulation/anxiety/': 'tDCS for Anxiety', // tDCS for Anxiety
  '/transcranial-direct-current-stimulation/concussion-and-traumatic-brain-injury/': 'tDCS for Concussion & Traumatic Brain Injury', // tDCS for Concussion & Traumatic Brain Injury
  '/transcranial-direct-current-stimulation/dementia-and-alzheimers/': "tDCS for Dementia & Alzheimer's", // tDCS for Dementia & Alzheimer's
  '/transcranial-direct-current-stimulation/depression/': 'tDCS for Depression', // tDCS for Depression
  '/transcranial-direct-current-stimulation/dysmenorrhea/': 'tDCS for Dysmenorrhea', // tDCS for Dysmenorrhea
  '/': 'Naturopathic Doctors in Mesa, AZ | East Valley Naturopathic Doctors',
};
