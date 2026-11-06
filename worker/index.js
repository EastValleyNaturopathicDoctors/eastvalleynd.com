/**
 * The site is static (dist/, served by Cloudflare's static assets). This
 * Worker runs only for the paths in wrangler.jsonc's assets.run_worker_first:
 *
 * /videos/*   Static assets answer a `Range` request with the whole file and a
 *             200, and Safari won't play a video that isn't served in byte
 *             ranges (206 Partial Content). Cloudflare's own fix:
 *             https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/#range-requests
 *             The videos are a few MB, so reading one into memory to slice it
 *             is fine. File names carry a version (hero-2026-11.…), so they
 *             can be cached for a year; a new video gets a new name.
 *
 * /api/ebook  The menopause e-book form (Resources.astro): checks the visitor's
 *             Turnstile token (TURNSTILE_SECRET, widget "eastvalleynd.com
 *             forms"), then adds the address to the Brevo list BREVO_LIST_ID
 *             with the BREVO_API_KEY secret (set in the Cloudflare dashboard,
 *             Restricted to Contacts). Email address only: Brevo signs no
 *             HIPAA BAA, so nothing about a patient's health goes through it.
 *
 * /api/appointment, /api/contact
 *             The appointment request and contact forms: Turnstile, then an
 *             email to FORMS_TO (patientcare@) through Brevo's transactional
 *             API (the BREVO_FORMS_API_KEY secret, Transactional email only),
 *             with Reply-To set to the sender. AN INTERIM ROUTE (Nov 2026)
 *             until the clinic's Paubox Forms are set up: neither Cloudflare
 *             nor Brevo signs a HIPAA BAA, so the appointment form's date of
 *             birth and chief complaint stay off (FORMS_HEALTH_FIELDS "off",
 *             and src/data/forms.ts) and the front desk asks on the call back.
 *             Nothing is stored here; nothing a sender typed is logged.
 *
 * And on a schedule (wrangler.jsonc triggers.crons), a read-only call to Brevo
 * once a week: Brevo deletes a key after 90 days in a row without use, and
 * the form alone might go that long without a signup.
 */
const YEAR = 'public, max-age=31536000, immutable';

export default {
  /** @param {Request} request @param {Env} env */
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/ebook') return ebook(request, env);
    if (FORMS[pathname]) return form(request, env, FORMS[pathname]);
    if (pathname.startsWith('/videos/')) return video(request, env);
    return env.ASSETS.fetch(request);
  },

  /** @param {unknown} _event @param {Env} env @param {{ waitUntil(p: Promise<unknown>): void }} ctx */
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(keepAlive(env));
  },
};

/**
 * @typedef {{
 *   ASSETS: { fetch: typeof fetch },
 *   BREVO_API_KEY?: string,
 *   BREVO_LIST_ID?: string,
 *   BREVO_API_BASE?: string,
 *   TURNSTILE_SECRET?: string,
 *   TURNSTILE_VERIFY_URL?: string,
 *   BREVO_FORMS_API_KEY?: string,
 *   FORMS_TO?: string,
 *   FORMS_FROM?: string,
 *   FORMS_HEALTH_FIELDS?: string,
 * }} Env
 */

// --- The e-book form -------------------------------------------------------

const brevo = (env) => (env.BREVO_API_BASE || 'https://api.brevo.com/v3').replace(/\/$/, '');
const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

/** @param {Request} request @param {Env} env */
export async function ebook(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' }, { Allow: 'POST' });

  // Only the site's own pages may post here: the Origin must be this host
  // (eastvalleynd.com, or the workers.dev and preview hosts before cutover).
  // ("null", sent by some privacy settings, isn't a URL: refused too.)
  let sameSite = false;
  try {
    sameSite = new URL(request.headers.get('Origin') || '').host === new URL(request.url).host;
  } catch {}
  if (!sameSite) return json(403, { ok: false, error: 'origin' });

  if (Number(request.headers.get('Content-Length') || 0) > 2048) return json(413, { ok: false, error: 'size' });
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'body' });
  }
  // The hidden "website" field: people never see it, form-filling bots do.
  // Say yes and do nothing, so a bot learns nothing.
  if (body && typeof body.website === 'string' && body.website.trim()) return json(200, { ok: true });

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (email.length > 254 || !EMAIL.test(email)) return json(400, { ok: false, error: 'email' });

  const human = await turnstile(request, env, body?.turnstile, 'ebook');
  if (human !== true) return human;

  const list = Number(env.BREVO_LIST_ID);
  if (!env.BREVO_API_KEY || !list) {
    console.error('ebook: BREVO_API_KEY or BREVO_LIST_ID is not set');
    return json(503, { ok: false, error: 'unavailable' });
  }

  // updateEnabled: someone already in Brevo is added to the list, not refused.
  const res = await fetch(`${brevo(env)}/contacts`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, listIds: [list], updateEnabled: true }),
  });
  if (res.status === 201 || res.status === 204) return json(200, { ok: true });
  // Log Brevo's status and code, never the address.
  const detail = await res.json().catch(() => ({}));
  console.error(`ebook: Brevo answered ${res.status} ${detail.code ?? ''}`.trim());
  return json(502, { ok: false, error: 'upstream' });
}

// --- The appointment and contact forms -------------------------------------

/**
 * @typedef {{ name: string, label: string, required?: boolean, max?: number,
 *   kind?: 'text' | 'long' | 'email' | 'phone' | 'choice', choices?: Record<string, string>,
 *   health?: boolean }} Field
 * @typedef {{ action: string, subject: string, title: string, fields: Field[], note?: string }} FormSpec
 */
/** @type {Record<string, FormSpec>} */
export const FORMS = {
  '/api/appointment': {
    action: 'appointment',
    subject: 'Website: new patient appointment request',
    title: 'New patient appointment request (website)',
    fields: [
      { name: 'first_name', label: 'First name', max: 80 },
      { name: 'last_name', label: 'Last name', max: 80 },
      { name: 'email', label: 'Email', required: true, kind: 'email' },
      { name: 'phone', label: 'Phone', required: true, kind: 'phone' },
      { name: 'current_patient', label: 'Current patient', required: true, kind: 'choice', choices: { no: 'No', yes: 'Yes' } },
      { name: 'dob', label: "Patient's date of birth", max: 10, health: true },
      { name: 'reason', label: 'Main reason / chief complaint', kind: 'long', max: 4000, health: true },
      { name: 'comments', label: 'Comments', kind: 'long', max: 4000 },
    ],
    note: 'Date of birth and reason for the visit are not collected online for now: please ask when you call back.',
  },
  '/api/contact': {
    action: 'contact',
    subject: 'Website: contact form message',
    title: 'Contact form message (website)',
    fields: [
      { name: 'name', label: 'Name', required: true, max: 120 },
      { name: 'email', label: 'Email', required: true, kind: 'email' },
      { name: 'phone', label: 'Phone', kind: 'phone' },
      { name: 'comments', label: 'Comments', kind: 'long', max: 4000 },
    ],
  },
};

/**
 * How the sender found the site, as the browser recorded it (src/lib/attribution.ts):
 * the UTM tags of the visit that brought them (e.g. the Google Business
 * Profile link's utm_source=google, utm_medium=organic, utm_campaign=gmb,
 * utm_term=mesa-website), where they landed and the site that sent them.
 * Optional, and never a reason to refuse a submission.
 */
export const ATTRIBUTION = [
  ['utm_source', 'Source'],
  ['utm_medium', 'Medium'],
  ['utm_campaign', 'Campaign'],
  ['utm_term', 'Term'],
  ['utm_content', 'Content'],
  ['gclid', 'Google Ads click ID'],
  ['landing_page', 'Landing page'],
  ['referrer', 'Referred by'],
  ['first_seen', 'First visit'],
];

/** Trims, drops control characters (keeping line breaks in long fields), caps length. */
const clean = (v, long, max) =>
  typeof v !== 'string' ? '' : v.replace(long ? /[^\S\n]+/g : /\s+/g, ' ').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim().slice(0, max);

/** @param {Request} request @param {Env} env @param {FormSpec} spec */
export async function form(request, env, spec) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' }, { Allow: 'POST' });
  let sameSite = false;
  try {
    sameSite = new URL(request.headers.get('Origin') || '').host === new URL(request.url).host;
  } catch {}
  if (!sameSite) return json(403, { ok: false, error: 'origin' });
  if (Number(request.headers.get('Content-Length') || 0) > 16384) return json(413, { ok: false, error: 'size' });
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'body' });
  }
  if (!body || typeof body !== 'object') return json(400, { ok: false, error: 'body' });
  if (typeof body.website === 'string' && body.website.trim()) return json(200, { ok: true });

  const health = env.FORMS_HEALTH_FIELDS === 'on';
  /** @type {[string, string][]} */
  const lines = [];
  let replyTo = '';
  let replyName = '';
  for (const f of spec.fields) {
    if (f.health && !health) continue;
    let v = clean(body[f.name], f.kind === 'long', f.max ?? (f.kind === 'email' ? 254 : 200));
    if (f.kind === 'email' && v && !EMAIL.test(v)) return json(400, { ok: false, error: 'field', field: f.name });
    if (f.kind === 'phone' && v && (v.replace(/\D/g, '').length < 7 || v.length > 40)) return json(400, { ok: false, error: 'field', field: f.name });
    if (f.kind === 'choice') v = f.choices?.[v] ?? '';
    if (f.required && !v) return json(400, { ok: false, error: 'field', field: f.name });
    if (f.kind === 'email') replyTo = v;
    if (f.name === 'name') replyName = v;
    if (v) lines.push([f.label, v]);
  }
  if (!replyName) replyName = [clean(body.first_name, false, 80), clean(body.last_name, false, 80)].filter(Boolean).join(' ');

  const human = await turnstile(request, env, body.turnstile, spec.action);
  if (human !== true) return human;

  if (!env.BREVO_FORMS_API_KEY || !env.FORMS_TO || !env.FORMS_FROM) {
    console.error(`${spec.action}: BREVO_FORMS_API_KEY, FORMS_TO or FORMS_FROM is not set`);
    return json(503, { ok: false, error: 'unavailable' });
  }

  // Which page it came from (the appointment form is on two).
  // The form names its page; the Referer header is the fallback (some
  // browsers and privacy settings strip it).
  const origin = new URL(request.url).origin;
  const named = clean(body.page, false, 300);
  let page = /^\/[^\s]*$/.test(named) ? origin + named : '';
  if (!page) try {
    const ref = new URL(request.headers.get('Referer') || '');
    if (ref.origin === origin) page = ref.origin + ref.pathname;
  } catch {}
  const a = body.attribution && typeof body.attribution === 'object' ? body.attribution : {};
  const found = ATTRIBUTION.map(([k, label]) => [label, clean(a[k], false, 200)]).filter(([, v]) => v);
  const when = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Phoenix', dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
  const text = [
    spec.title,
    `Submitted from: ${page || 'unknown page'}`,
    '',
    ...lines.map(([k, v]) => (v.includes('\n') ? `${k}:\n${v}` : `${k}: ${v}`)),
    '',
    ...(spec.note && !health ? [spec.note, ''] : []),
    'How they found the site',
    ...(found.length ? found.map(([k, v]) => `${k}: ${v}`) : ['No campaign tags (a direct visit, or the browser blocked storage).']),
    '',
    `Sent ${when} (Arizona time).`,
    'Reply to this email to answer the sender directly.',
  ].join('\n');

  const res = await fetch(`${brevo(env)}/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_FORMS_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'EVND website', email: env.FORMS_FROM },
      to: [{ email: env.FORMS_TO, name: 'EVND Patient Care' }],
      replyTo: { email: replyTo, ...(replyName ? { name: replyName } : {}) },
      subject: spec.subject,
      textContent: text,
      tags: ['website-form', spec.action],
    }),
  });
  if (res.status === 201 || res.status === 202) return json(200, { ok: true });
  const detail = await res.json().catch(() => ({}));
  console.error(`${spec.action}: Brevo answered ${res.status} ${detail.code ?? ''}`.trim());
  return json(502, { ok: false, error: 'upstream' });
}

/**
 * Cloudflare Turnstile: true when the token is real, unused, issued for this
 * form (`action`) on this host; otherwise the response to send back. Without
 * the secret it refuses rather than letting everything through.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * @param {Request} request @param {Env} env @param {unknown} token @param {string} action
 * @returns {Promise<true | Response>}
 */
export async function turnstile(request, env, token, action) {
  if (!env.TURNSTILE_SECRET) {
    console.error('turnstile: TURNSTILE_SECRET is not set');
    return json(503, { ok: false, error: 'unavailable' });
  }
  if (typeof token !== 'string' || !token || token.length > 2048) return json(403, { ok: false, error: 'turnstile' });
  let result;
  try {
    const res = await fetch(env.TURNSTILE_VERIFY_URL || 'https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: request.headers.get('CF-Connecting-IP') ?? '' }),
    });
    if (!res.ok) throw new Error(`siteverify ${res.status}`);
    result = await res.json();
  } catch (err) {
    console.error(`turnstile: ${err instanceof Error ? err.message : 'siteverify failed'}`);
    return json(502, { ok: false, error: 'turnstile-unreachable' });
  }
  const host = new URL(request.url).hostname;
  if (!result.success || result.action !== action || result.hostname !== host) {
    console.error(`turnstile: refused (${(result['error-codes'] || []).join(',') || 'action/hostname'})`);
    return json(403, { ok: false, error: 'turnstile' });
  }
  return true;
}

/**
 * The weekly calls that keep both Brevo keys in use (see the top of this
 * file): read-only, one per key. The contacts key reads the e-book list; the
 * forms key (Transactional email only) reads a day of sending statistics.
 * Neither sends anything.
 * @param {Env} env
 */
export async function keepAlive(env) {
  const list = Number(env.BREVO_LIST_ID);
  const checks = [
    ['contacts key', env.BREVO_API_KEY, list ? `/contacts/lists/${list}` : ''],
    ['forms key', env.BREVO_FORMS_API_KEY, '/smtp/statistics/aggregatedReport?days=1'],
  ];
  await Promise.all(checks.map(async ([name, key, path]) => {
    if (!key || !path) return console.error(`keepAlive: ${name} is not set`);
    try {
      const res = await fetch(`${brevo(env)}${path}`, { headers: { 'api-key': key, Accept: 'application/json' } });
      if (res.ok) console.log(`keepAlive: ${name} OK`);
      else console.error(`keepAlive: ${name}: Brevo answered ${res.status}`);
    } catch {
      console.error(`keepAlive: ${name}: Brevo unreachable`);
    }
  }));
}

// --- Videos, in byte ranges ------------------------------------------------

/** @param {Request} request @param {Env} env */
async function video(request, env) {
  const range = request.headers.get('Range');
  // Ask the assets for the whole file; conditional headers pass through, so
  // a 304 comes back as one.
  const plain = new Request(request);
  plain.headers.delete('Range');
  const res = await env.ASSETS.fetch(plain);
  if (res.status !== 200) return res;

  const headers = new Headers(res.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', YEAR);
  if (!range) return new Response(res.body, { status: 200, headers });

  const body = await res.arrayBuffer();
  const size = body.byteLength;
  const span = parseRange(range, size);
  if (!span) {
    headers.set('Content-Range', `bytes */${size}`);
    headers.delete('Content-Length');
    return new Response(null, { status: 416, headers });
  }
  const [start, end] = span;
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  const part = request.method === 'HEAD' ? null : body.slice(start, end + 1);
  return new Response(part, { status: 206, headers });
}

/**
 * One range only ("bytes=0-", "bytes=100-199", "bytes=-500"), which is all a
 * video element asks for. Returns [start, end] inclusive, or null when the
 * range can't be met.
 * @param {string} header @param {number} size
 * @returns {[number, number] | null}
 */
export function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '') || size === 0) return null;
  let start, end;
  if (m[1] === '') {
    // The last N bytes.
    const n = Number(m[2]);
    if (n === 0) return null;
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) return null;
  return [start, end];
}
