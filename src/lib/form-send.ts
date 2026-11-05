/**
 * Sends the appointment and contact forms to the site's Worker
 * (worker/index.js: /api/appointment, /api/contact), which emails
 * patientcare@. The form names its endpoint, its Turnstile action and the
 * site key in data attributes.
 *
 * A submission is never dropped quietly: on success the form gives way to its
 * thank-you note; on any failure (no network, a refused Turnstile, the mail
 * service down) everything typed stays in place and an error under the
 * button gives the phone number.
 */
import { widget } from './turnstile-client';
import { attribution } from './attribution';
import { track } from './datalayer';
import { site } from '@/data/site';

const FAIL = `We couldn’t send that just now. Please try again, or call ${site.phone}.`;
const FAIL_FIELDS = 'Please check the highlighted field and try again.';

export function attach(form: HTMLFormElement) {
  const { endpoint, action, sitekey } = form.dataset;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = button?.querySelector<HTMLElement>('.btn-label') ?? null;
  const error = form.querySelector<HTMLElement>('.req-error');
  const slot = form.querySelector<HTMLElement>('.req-turnstile');
  const done = form.parentElement?.querySelector<HTMLElement>(`.req-done[data-for="${form.id}"]`);
  if (!endpoint || !action || !sitekey || !button || !error || !slot || !done) return;

  const human = widget(slot, sitekey, action);
  button.removeAttribute('disabled');
  const idle = label?.textContent ?? '';

  const busy = (on: boolean) => {
    button.disabled = on;
    if (label) label.textContent = on ? 'Sending…' : idle;
  };
  const fail = (msg: string, field?: string) => {
    error.textContent = msg;
    error.hidden = false;
    const el = field ? form.querySelector<HTMLElement>(`[name="${field}"]`) : null;
    el?.setAttribute('aria-invalid', 'true');
    (el ?? error).focus?.();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    busy(true);
    const t = await human;
    const data: Record<string, string> = {};
    new FormData(form).forEach((v, k) => { if (typeof v === 'string') data[k] = v; });
    if (data.dob_year || data.dob_month || data.dob_day) {
      data.dob = [data.dob_month, data.dob_day, data.dob_year].filter(Boolean).join('/');
    }
    data.turnstile = await t.token();
    const how = attribution();   // UTM tags and landing page (lib/attribution.ts)
    let answer: { ok?: boolean; error?: string; field?: string } = {};
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.keys(how).length ? { ...data, attribution: how } : data),
        signal: AbortSignal.timeout(20_000),
      });
      answer = await res.json().catch(() => ({}));
    } catch {
      answer = {};
    }
    t.reset();
    busy(false);
    if (answer.ok) {
      track('generate_lead', { form_name: action });   // for GTM (lib/datalayer.ts)
      form.hidden = true;
      done.hidden = false;
      done.focus();
      return;
    }
    fail(answer.error === 'field' ? FAIL_FIELDS : FAIL, answer.error === 'field' ? answer.field : undefined);
  });
}
