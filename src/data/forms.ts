/**
 * Form configuration.
 *
 * Forms are hosted on Tally (DECISIONS D30). The old site's Gravity Forms
 * definitions are migrated into `forms.json` by extract/build_forms.py — that
 * file is the *specification* for what to build in Tally, not a runtime form.
 * `docs/data/tally-form-spec.md` is the same thing in readable form.
 *
 * To go live: create the form in Tally, copy the id out of its share URL
 * (https://tally.so/r/<id>), and paste it below. Nothing else changes.
 */
import formSpec from './forms.json';

export type TallyKey = 'appointment' | 'appointment-request' | 'contact';

/** Tally form ids. `null` = not built yet; the page falls back to phone + booking. */
export const tallyForms: Record<TallyKey, string | null> = {
  appointment: null,
  'appointment-request': null,
  contact: null,
};

/**
 * Embed options, appended to https://tally.so/embed/<id>.
 * `hideTitle` because the page already carries an <h1>; `transparentBackground`
 * so the embed sits on our own card; `dynamicHeight` so it resizes as the
 * respondent moves through it.
 */
export const tallyEmbedOptions = 'alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

/**
 * Hidden fields to create in every Tally form, so the clinic keeps the
 * attribution trail the Gravity forms had (Source / Medium / Campaign /
 * Submission Page).
 *
 * Tally's embed script forwards the host page's path and its query string to
 * hidden fields with matching names, so these need no JavaScript of ours:
 *   originPage   — the page the form was submitted from (Tally fills this)
 *   utm_source   ┐
 *   utm_medium   ├ forwarded from the page URL when the inbound link is tagged
 *   utm_campaign ┘
 * The old Gravity fields were plain Source/Medium/Campaign; using the utm_*
 * names instead means real tagged traffic populates them with no plugin.
 */
export const tallyHiddenFields = ['originPage', 'utm_source', 'utm_medium', 'utm_campaign'];

export { formSpec };

/**
 * The appointment and contact forms on the site (AppointmentRequestForm.astro,
 * ContactForm.astro) are sent by the site's Worker to patientcare@ through
 * Brevo: an interim route (Nov 2026) until the clinic's Paubox Forms are set
 * up. Neither Cloudflare nor Brevo signs a HIPAA BAA, so while this route is
 * in use the appointment form leaves out the patient's date of birth and
 * chief complaint, and the front desk asks for them on the call back. To put
 * them back (only if the clinic accepts that), set this true AND set
 * FORMS_HEALTH_FIELDS to "on" in wrangler.jsonc: the Worker drops them
 * otherwise.
 */
// On again from Nov 6, 2026, at the clinic's request ("it used to have date
// of birth and reason for reaching out/chief complaint"), knowing the route
// has no BAA. Off again: set this false and FORMS_HEALTH_FIELDS "off".
export const healthFields = true;
