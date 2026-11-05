/**
 * Events for Google Tag Manager (GTM-KX2F2PN, loaded in layouts/Base.astro).
 * The site's forms send without reloading the page, so GTM's built-in
 * "Form Submission" trigger never fires for them; these events mark a
 * successful send instead. Use them as Custom Event triggers in GTM:
 *   generate_lead  form_name: "appointment" | "contact"
 *   sign_up        form_name: "ebook"
 * Never anything the visitor typed: no names, emails, phone numbers or
 * comments go to Google.
 */
type Layer = { dataLayer?: Record<string, unknown>[] };

export function track(event: string, params: Record<string, string> = {}) {
  const w = window as unknown as Layer;
  (w.dataLayer = w.dataLayer || []).push({ event, ...params });
}
