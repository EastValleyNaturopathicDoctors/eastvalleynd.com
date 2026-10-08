/**
 * Hand-kept: everyday words a visitor might type into the Services or
 * Conditions filter box (SectionIndex.astro) that a page's name doesn't
 * contain — "gut" for Gastrointestinal Disorders. Keyed by the page's href;
 * matched like its name. Words only, no claims: a word belongs here when the
 * page is about it.
 */
export const sectionKeywords: Record<string, string> = {
  // Conditions
  '/conditions/gastrointestinal-disorders/': 'gut stomach digestion digestive GI bloating IBS',
  '/conditions/heart-care/': 'cardio cardiovascular blood pressure cholesterol',
  '/conditions/mental-health/': 'anxiety depression mood stress',
  '/conditions/womens-health/': 'women hormones menopause period',
  '/mens-health/': 'men testosterone prostate',
  '/conditions/adrenal-fatigue/': 'tired fatigue energy stress cortisol',
  '/conditions/chronic-fatigue/': 'tired energy CFS ME',
  '/conditions/autoimmune/': 'thyroid immune',
  '/conditions/allergies-eczema-asthma-mcas/': 'allergy skin breathing histamine',
  '/conditions/childhood-behavioral-disorders/': 'kids children ADHD autism behavior',
  '/conditions/childhood-medical-disorders/': 'kids children pediatric',
  '/conditions/skin-conditions/': 'skin dermatology acne',
  '/conditions/insomnia/': 'sleep',
  '/conditions/chronic-pain/': 'joints muscles injury',
  '/conditions/diabetes/': 'blood sugar insulin metabolic',
  '/conditions/infertility/': 'fertility pregnancy conceive',
  '/conditions/lyme-disease/': 'tick infection',
  // Services
  '/iv-therapy/': 'infusion drip vitamins',
  '/injection-therapy/': 'shots injections vitamins B12',
  '/hyperbaric-oxygen-therapy/': 'HBOT oxygen chamber',
  '/brain-regeneration-clinic/': 'brain memory dementia concussion',
  '/neurofeedback/': 'brain ADHD anxiety',
  '/transcranial-direct-current-stimulation/': 'tDCS brain stimulation',
  '/exomind-tms/': 'TMS brain depression',
  '/photobiomodulation/': 'brain light',
  '/qeeg-brain-mapping/': 'brain map EEG',
  '/specialty-labs/': 'tests testing lab bloodwork',
  '/hormone-therapy/': 'hormones testosterone estrogen menopause',
  '/weight-loss/': 'weight semaglutide tirzepatide GLP-1',
  '/prp-and-prolotherapy/': 'injections joints regenerative pain',
  '/detoxification/': 'detox mold metals toxins',
  '/skinpen-microneedling/': 'skin aesthetics',
  '/acupuncture/': 'needles pain',
  '/save-our-veterans/': 'military PTSD',
};
