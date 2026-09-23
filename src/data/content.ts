// Content for the marketing pages.
//
// PROVENANCE — read before editing:
//   * conditions / therapies / optimization / process / faqs
//       Names and copy from the Claude Design Template. `href` on the condition
//       and therapy cards is hand-mapped to real routes from the audit's New
//       Sitemap (extract/export/data/card-links.json) — fuzzy matching produced
//       wrong targets, and a wrong link on a medical site is worse than none.
//   * practitioners
//       names + titles from the design; PHOTOS are the real 2023 clinic
//       headshots pulled from extract/export/media/. Any practitioner with
//       img: '' has no photo on file yet and renders initials.
//   * optimization `href`
//       hand-mapped to the closest real route (D106). The descriptions are
//       still the template's — see OPEN-QUESTIONS Q53.

export const conditions = [
  {
    "name": "Autism, ADHD, PANS/PANDAS",
    "img": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80&auto=format&fit=crop",
    "tag": "Neurodevelopmental",
    "slug": "autism-adhd-pans-pandas",
    "href": "/conditions/childhood-behavioral-disorders/"
  },
  {
    "name": "Women's Health",
    "img": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80&auto=format&fit=crop",
    "tag": "Hormonal",
    "slug": "women-s-health",
    "href": "/conditions/womens-health/"
  },
  {
    "name": "Men's Health",
    "img": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80&auto=format&fit=crop",
    "tag": "Hormonal",
    "slug": "men-s-health",
    "href": "/mens-health/"
  },
  {
    "name": "Chronic Fatigue (ME/CFS)",
    "img": "https://images.unsplash.com/photo-1517502166878-35c93a0072f0?w=900&q=80&auto=format&fit=crop",
    "tag": "Complex Chronic",
    "slug": "chronic-fatigue-me-cfs",
    "href": "/conditions/chronic-fatigue/"
  },
  {
    "name": "Mold Exposure",
    "img": "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=900&q=80&auto=format&fit=crop",
    "tag": "Environmental",
    "slug": "mold-exposure",
    "href": "/detoxification/mold-detox-program/"
  },
  {
    "name": "Lyme Disease",
    "img": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900&q=80&auto=format&fit=crop",
    "tag": "Infectious",
    "slug": "lyme-disease",
    "href": "/conditions/lyme-disease/"
  },
  {
    "name": "Gastrointestinal Disorders",
    "img": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&q=80&auto=format&fit=crop",
    "tag": "Gut Health",
    "slug": "gastrointestinal-disorders",
    "href": "/conditions/gastrointestinal-disorders/"
  },
  {
    "name": "Anxiety & Depression",
    "img": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=900&q=80&auto=format&fit=crop",
    "tag": "Mental Health",
    "slug": "anxiety-depression",
    "href": "/conditions/mental-health/"
  },
  {
    "name": "Joint, Muscle & Neuropathic Pain",
    "img": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop",
    "tag": "Pain",
    "slug": "joint-muscle-neuropathic-pain",
    "href": "/conditions/chronic-pain/"
  },
  {
    "name": "Concussion & Traumatic Brain Injury",
    "img": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&q=80&auto=format&fit=crop",
    "tag": "Neurological",
    "slug": "concussion-traumatic-brain-injury",
    "href": "/brain-regeneration-clinic/concussion-and-traumatic-brain-injury/"
  },
  {
    "name": "Stroke Recovery",
    "img": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&q=80&auto=format&fit=crop",
    "tag": "Neurological",
    "slug": "stroke-recovery",
    "href": "/brain-regeneration-clinic/stroke-injury/"
  },
  {
    "name": "Dementia & Alzheimer's",
    "img": "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=900&q=80&auto=format&fit=crop",
    "tag": "Neurological",
    "slug": "dementia-alzheimer-s",
    "href": "/brain-regeneration-clinic/alzheimers-and-dementia/"
  },
  {
    "name": "Natural Heart Care",
    "img": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80&auto=format&fit=crop",
    "tag": "Cardiovascular",
    "slug": "natural-heart-care",
    "href": "/conditions/heart-care/"
  },
  {
    "name": "Autoimmune Conditions",
    "img": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&q=80&auto=format&fit=crop",
    "tag": "Immunological",
    "slug": "autoimmune-conditions",
    "href": "/conditions/autoimmune/"
  }
] as const;

export const therapies = [
  {
    "name": "Stem Cell & PRP Injections",
    "icon": "drop",
    "category": "Regenerative",
    "slug": "stem-cell-prp-injections",
    "href": "/prp-and-prolotherapy/"
  },
  {
    "name": "IV Nutrient & Ozone Therapy",
    "icon": "vial",
    "category": "IV / Infusion",
    "slug": "iv-nutrient-ozone-therapy",
    "href": "/iv-therapy/"
  },
  {
    "name": "Nutrient Injection Therapy",
    "icon": "syringe",
    "category": "IV / Infusion",
    "slug": "nutrient-injection-therapy",
    "href": "/injection-therapy/"
  },
  {
    "name": "Infrared Sauna Detox",
    "icon": "sun",
    "category": "Detox",
    "slug": "infrared-sauna-detox",
    "href": "/detoxification/"
  },
  {
    "name": "Neurofeedback Brain Training",
    "icon": "brain",
    "category": "Cognitive",
    "slug": "neurofeedback-brain-training",
    "href": "/neurofeedback/"
  },
  {
    "name": "Hyperbaric Oxygen (HBOT)",
    "icon": "oxygen",
    "category": "Recovery",
    "slug": "hyperbaric-oxygen-hbot",
    "href": "/hyperbaric-oxygen-therapy/"
  },
  {
    "name": "Frequency Specific Microcurrent",
    "icon": "wave",
    "category": "Pain",
    "slug": "frequency-specific-microcurrent",
    "href": "/frequency-specific-microcurrent-therapy/"
  },
  {
    "name": "Massage & Myopractic Therapy",
    "icon": "hand",
    "category": "Bodywork",
    "slug": "massage-myopractic-therapy",
    "href": "/physicians/jean-sutliff-stanley/"
  },
  {
    "name": "TruDOSE™ Platelet IV Therapy",
    "icon": "drop",
    "category": "Regenerative",
    "slug": "trudose-platelet-iv-therapy",
    "href": "/iv-therapy/"
  },
  {
    "name": "Specialty Labs & Functional Testing",
    "icon": "flask",
    "category": "Diagnostic",
    "slug": "specialty-labs-functional-testing",
    "href": "/specialty-labs/"
  }
] as const;

export const optimization = [
  {
    "name": "Hormone & Peptide Optimization",
    "desc": "Bio-identical hormones, peptide therapies (BPC-157, CJC/Ipamorelin, Semaglutide).",
    "icon": "spark",
    "href": "/hormone-therapy/"
  },
  {
    "name": "Longevity & Anti-Aging",
    "desc": "NAD+ infusions, mitochondrial support, biological age testing and trending.",
    "icon": "infinity",
    "href": "/brain-regeneration-clinic/anti-aging/"
  },
  {
    "name": "Athletic Performance",
    "desc": "PRP, regenerative joint care, VO₂ work, and recovery protocols for active patients.",
    "icon": "bolt",
    "href": "/prp-and-prolotherapy/"
  },
  {
    "name": "Metabolic & Weight Health",
    "desc": "GLP-1 (Semaglutide) programs, insulin-resistance reversal, body composition.",
    "icon": "scale",
    "href": "/weight-loss/"
  },
  {
    "name": "Cognitive Performance",
    "desc": "Neurofeedback brain training, nootropic stacking, sleep architecture work.",
    "icon": "brain",
    "href": "/neurofeedback/"
  },
  {
    "name": "Aesthetic & Skin Health",
    "desc": "Microneedling, exosomes, IV glow protocols, hair restoration with PRP.",
    "icon": "sparkle",
    "href": "/skinpen-microneedling/"
  }
] as const;

export const practitioners = [
  {
    "name": "Dr. Jason Porter",
    "title": "NMD, BCN",
    "focus": "Brain Regeneration · Neurology",
    "img": "/images/team/Porter.jpg",
    "years": 18,
    "slug": "dr-jason-porter"
  },
  {
    "name": "Dr. Jennifer Nevels",
    "title": "NMD",
    "focus": "Women's Health · Hormone Therapy",
    "img": "/images/team/Dr-Nevels.jpg",
    "years": 14,
    "slug": "dr-jennifer-nevels"
  },
  {
    "name": "Dr. Laura Badalamenti",
    "title": "NMD",
    "focus": "Complex Chronic · Lyme · Mold",
    "img": "/images/team/Dr-Badalamenti.jpg",
    "years": 11,
    "slug": "dr-laura-badalamenti"
  },
  {
    "name": "Dr. Casey Seenauth",
    "title": "NMD",
    "focus": "Regenerative Injection · Pain",
    "img": "/images/team/Dr-Seenauth.jpg",
    "years": 9,
    "slug": "dr-casey-seenauth"
  },
  {
    "name": "Jean Sutliff-Stanley",
    "title": "LMT, CM",
    "focus": "Myopractic Therapy · Bodywork",
    "img": "/images/team/Dr-Sutliff-Stanley.jpg",
    "years": 22,
    "slug": "jean-sutliff-stanley"
  },
  {
    "name": "Shelly Sandhu",
    "title": "Nutritionist",
    "focus": "Functional Nutrition · GI",
    "img": "",
    "years": 12,
    "slug": "shelly-sandhu"
  }
] as const;

// The design mock's four testimonials were invented and are gone (D122);
// src/components/Testimonials.astro renders the clinic's real, published ones.

export const faqs = [
  {
    "q": "Are naturopathic doctors real doctors?",
    "a": "In Arizona, Naturopathic Medical Doctors (NMDs) are licensed primary-care physicians who complete a four-year accredited medical program plus board examinations. EVND's NMDs can order labs and imaging, perform minor procedures, and prescribe both pharmaceutical and natural medicines."
  },
  {
    "q": "Do you accept insurance?",
    "a": "We accept several major insurance plans for office visits and labs. Many of our therapies (IV, PRP, HBOT, peptides) are out-of-network or self-pay. We provide superbills and HSA/FSA-compatible receipts. See our Insurance page or call (480) 985-0000 for benefits verification."
  },
  {
    "q": "What should I expect at my first visit?",
    "a": "New-patient intakes are 60–90 minutes. You'll review your timeline with your NMD, leave with initial labs ordered, and a working plan. Most patients begin treatment at visit two, once results are in."
  },
  {
    "q": "Can I do both conventional and naturopathic care?",
    "a": "Yes — most of our patients do. We coordinate with your existing oncologist, cardiologist, PCP, or specialist. EVND is integrative, not replacement medicine."
  },
  {
    "q": "How long until I feel better?",
    "a": "It depends on the condition. Acute issues often respond in 2–4 weeks. Complex chronic cases (Lyme, mold, ME/CFS) follow a 6–18 month arc with clear phase markers along the way."
  },
  {
    "q": "Do you treat patients out of state?",
    "a": "Established patients can do telehealth follow-ups across most US states. Initial visits and any in-office therapies must be in person at our Mesa, AZ clinic."
  }
] as const;

export const process = [
  {
    "step": "01",
    "title": "Tell us your story",
    "body": "A 90-minute intake with one of our NMDs — the kind of conversation you have not had with a doctor before."
  },
  {
    "step": "02",
    "title": "Targeted testing",
    "body": "Functional labs, imaging where warranted, and conventional workups. We measure before we treat."
  },
  {
    "step": "03",
    "title": "A plan, written for you",
    "body": "Your NMD builds a phased plan with clear milestones — diet, supplements, therapies, prescriptions."
  },
  {
    "step": "04",
    "title": "Ongoing partnership",
    "body": "We re-test, re-tune, and stay with you. Patients average 4.2 visits per year once stable."
  }
] as const;

