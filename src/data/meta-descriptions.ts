/**
 * Meta descriptions that were wrong in migration (audit 2026-11-02): pages
 * carrying another page's description, and one that gave a practitioner the
 * wrong title. Each is written from the page's own text. Base.astro uses
 * these in place of the page's description. Hand-kept; the pipeline should
 * fix its source.
 */
export const metaDescriptions: Record<string, string> = {
  // Was BoneScore's description.
  '/conditions/gastrointestinal-disorders/inflammatory-bowel-disease/':
    "Naturopathic treatment for inflammatory bowel disease (IBD), including Crohn's and ulcerative colitis, at East Valley Naturopathic Doctors in Mesa, AZ.",
  // Was the Immune Booster IV's description.
  '/iv-therapy/plaquex/':
    'Plaquex IV therapy at East Valley Naturopathic Doctors in Mesa, AZ: an integrative approach to supporting heart and vascular health.',
  // Was "Hyperbaric Oxygen Therapy Consent Form(Child or Adult)".
  '/forms-and-handouts/':
    'Forms and handouts from East Valley Naturopathic Doctors in Mesa, AZ: how to prepare for your visit, diet and detox handouts, and consent forms.',
  // Called her "Dr. Marie Ybarra, NMD" with another clinician's specialties;
  // she is a licensed aesthetician (her bio).
  '/physicians/marie-ybarra/':
    'Marie Ybarra is a licensed aesthetician at East Valley Naturopathic Doctors in Mesa, AZ, with over 15 years in skincare, including SkinPen microneedling.',
};
