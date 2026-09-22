/**
 * Icons for the section index tiles and panels (D114): route -> Material
 * Symbols name (see lib/icons.ts). A route with no entry gets the section's
 * default. Purely presentational — nothing here is a claim about the clinic.
 */
export const sectionIcons: Record<string, string> = {
  // Services
  '/acupuncture/': 'acupuncture',
  '/alpa-stim-treatment/': 'electric_bolt',
  '/photobiomodulation/': 'light_mode',
  '/brain-regeneration-clinic/': 'neurology',
  '/detoxification/': 'eco',
  '/exomind-tms/': 'psychology',
  '/frequency-specific-microcurrent-therapy/': 'airwave',
  '/heart-rate-variability-training/': 'ecg_heart',
  '/hormone-therapy/': 'endocrinology',
  '/hyperbaric-oxygen-therapy/': 'air',
  '/injection-therapy/': 'syringe',
  '/iv-therapy/': 'water_drop',
  '/skinpen-microneedling/': 'face',
  '/neurofeedback/': 'cognition',
  '/ozone-therapy/': 'bubble_chart',
  '/prp-and-prolotherapy/': 'healing',
  '/qeeg-brain-mapping/': 'vital_signs',
  '/transcranial-direct-current-stimulation/': 'bolt',
  '/specialty-labs/': 'labs',
  '/save-our-veterans/': 'military_tech',
  '/weight-loss/': 'monitor_weight',
  // Conditions
  '/conditions/adrenal-fatigue/': 'battery_alert',
  '/conditions/allergies-eczema-asthma-mcas/': 'allergies',
  '/conditions/arthiritis/': 'rheumatology',
  '/conditions/autoimmune/': 'immunology',
  '/conditions/cancer-support/': 'oncology',
  '/conditions/childhood-behavioral-disorders/': 'child_care',
  '/conditions/childhood-medical-disorders/': 'pediatrics',
  '/conditions/chronic-fatigue/': 'battery_low',
  '/conditions/chronic-pain/': 'personal_injury',
  '/conditions/diabetes/': 'glucose',
  '/conditions/gastrointestinal-disorders/': 'gastroenterology',
  '/conditions/gut-health/': 'nutrition',
  '/conditions/heart-care/': 'cardiology',
  '/conditions/hormonal/': 'endocrinology',
  '/conditions/infertility/': 'pregnancy',
  '/conditions/insomnia/': 'bedtime',
  '/conditions/long-covid-syndrome/': 'coronavirus',
  '/conditions/lyme-disease/': 'pest_control',
  '/mens-health/': 'man',
  '/conditions/mental-health/': 'psychology_alt',
  '/conditions/mthfr/': 'genetics',
  '/conditions/neurological/': 'neurology',
  '/conditions/osteoporosis/': 'orthopedics',
  '/conditions/pots/': 'monitor_heart',
  '/conditions/skin-conditions/': 'dermatology',
  '/conditions/womens-health/': 'woman',
  // About
  '/physicians/': 'stethoscope',
  '/about/our-mission/': 'flag',
  '/about/naturopathic-medicine/': 'eco',
  // Resources
  '/new-patient-appointment-request/': 'calendar_month',
  '/blog/': 'article',
  '/insurance-coverage/': 'verified_user',
  '/patient-portal/': 'account_circle',
  '/forms-and-handouts/': 'description',
  '/webinars/': 'play_circle',
};

export const sectionIconDefault: Record<string, string> = {
  '/services/': 'medical_services',
  '/conditions/': 'health_and_safety',
};
