// Global site data: identity, nav, contact. Sourced from the Claude Design
// Template plus the real clinic details in extract/export/data/site.json.

export const site = {
  name: 'East Valley Naturopathic Doctors',
  short: 'EVND',
  tagline: 'Whole-person naturopathic medicine in Mesa, Arizona.',
  /**
   * Verified against the WordPress export, not the design template. The
   * template used (480) 508-8126, which appears on ZERO records in the
   * database; (480) 985-0000 appears on 18, including pages edited in
   * August 2026. See docs/DECISIONS.md D26.
   */
  phone: '(480) 985-0000',
  phoneHref: 'tel:4809850000',
  fax: '(480) 985-0029',
  /** From the clinic's own SMS privacy policy and terms (published 2026-08-03). */
  email: 'patientcare@eastvalleynd.com',
  address: { street: '5416 E. Southern Ave, Ste 110', city: 'Mesa', state: 'AZ', zip: '85206' },
  /** From the live /contact/ page (last edited 2025-05-26). */
  hours: [
    { days: 'Monday', time: '9:00 am – 5:00 pm' },
    { days: 'Tuesday', time: '9:00 am – 3:00 pm' },
    { days: 'Wednesday', time: '9:00 am – 5:00 pm' },
    { days: 'Thursday', time: '9:00 am – 3:00 pm' },
    { days: 'Friday', time: '9:00 am – 5:00 pm' },
  ],
  lunch: 'Closed for lunch 12:00 – 1:00 pm daily',
  since: 2008,
  status: 'Accepting new patients — May 2026',

  /**
   * YouTube id for the hero background. Set to null to run poster-only.
   * (The id that shipped with the design template, bI7cEIT5gJQ, was dead.)
   * The poster always renders underneath: it covers the iframe's load gap and
   * is the sole background for reduced-motion users, who never get the video.
   * The poster itself is imported by Hero.astro from src/images/site/ so it
   * goes through the image pipeline — a path string here could not.
   */
  heroVideoId: '7LQsiJHvqmg' as string | null,
};

/** The street address as a Google Maps query — the map embed and every directions link share it. */
export const mapQuery = encodeURIComponent(
  `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`);
/** Google's documented Maps URL: opens the Maps app on a phone, turn-by-turn from wherever the visitor is. */
export const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

/**
 * Primary navigation now lives in src/data/nav.json, generated from the audit's
 * New Sitemap by extract/build_pages.py. Editing nav means editing the sheet
 * and re-running that script — not hand-maintaining a list here.
 */

/**
 * The utility row. 'Schedule' used to sit here as well; it came out when
 * Schedule Appointment became the single header CTA, and /contact/ took its
 * place — Contact left the main nav for the same reason and still needs to be
 * one click from every page.
 */
export const topBarLinks = [
  { label: 'Contact', href: '/contact/' },
  { label: 'Patient Portal', href: '/patient-portal/' },
  { label: 'Forms & Handouts', href: '/forms-and-handouts/' },
  { label: 'Insurance', href: '/insurance-coverage/' },
  { label: 'Blog', href: '/blog/' },
];

/**
 * Footer columns. Every href here is a route that exists in the audit's New
 * Sitemap — no invented pages. Legal pages (privacy, accessibility, good-faith
 * estimate) are deliberately absent: the sitemap does not include them, and
 * inventing routes for them would put dead links in the footer of every page.
 * See docs/OPEN-QUESTIONS.md Q20.
 */
export const footerCols = [
  { h: 'Care', links: [
    { label: 'Conditions We Treat', href: '/conditions/' },
    { label: 'Chronic Pain', href: '/conditions/chronic-pain/' },
    { label: "Women's Health", href: '/conditions/womens-health/' },
    { label: "Men's Health", href: '/mens-health/' },
    { label: 'Heart Care', href: '/conditions/heart-care/' },
  ]},
  { h: 'Services', links: [
    { label: 'All Services', href: '/services/' },
    { label: 'IV Therapy', href: '/iv-therapy/' },
    { label: 'Injection Therapy', href: '/injection-therapy/' },
    { label: 'Neurofeedback Therapy', href: '/neurofeedback/' },
    { label: 'Hyperbaric Oxygen Therapy', href: '/hyperbaric-oxygen-therapy/' },
    { label: 'Specialty Labs', href: '/specialty-labs/' },
  ]},
  { h: 'Patients', links: [
    { label: 'Appointment Request', href: '/new-patient-appointment-request/' },
    { label: 'Forms & Handouts', href: '/forms-and-handouts/' },
    { label: 'Patient Portal', href: '/patient-portal/' },
    { label: 'Insurance Coverage', href: '/insurance-coverage/' },
    { label: 'Schedule Appointment', href: '/schedule-appointment/' },
  ]},
  { h: 'Clinic', links: [
    { label: 'About EVND', href: '/about/' },
    { label: 'Our Physicians', href: '/physicians/' },
    { label: 'Our Mission', href: '/about/our-mission/' },
    { label: 'Naturopathic Medicine', href: '/about/naturopathic-medicine/' },
    { label: 'Webinars', href: '/webinars/' },
    { label: 'Blog', href: '/blog/' },
  ]},
];

/** The clinic's Google Business listing, by its stable CID (checked 2026-09-23:
 *  "East Valley Naturopathic Doctors", 5416 E Southern Ave #110, 4.9 stars). */
export const googleReviewsUrl = 'https://maps.google.com/?cid=9077796893388264113';

/** The policy pages (D121). /privacy/, /terms-conditions/ and /messaging-terms/
 *  keep the old site's URLs — the SMS program's registration points at two. */
export const footerLegal: { label: string; href: string }[] = [
  { label: 'Privacy Policy', href: '/privacy/' },
  { label: 'Terms of Use', href: '/terms-conditions/' },
  { label: 'SMS Terms', href: '/messaging-terms/' },
  { label: 'Good Faith Estimate', href: '/good-faith-estimate/' },
  { label: 'Accessibility', href: '/accessibility/' },
];
