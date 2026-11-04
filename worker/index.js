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
 * /api/ebook  The menopause e-book form (Resources.astro): adds the address to
 *             the Brevo list BREVO_LIST_ID with the BREVO_API_KEY secret (set
 *             in the Cloudflare dashboard, Restricted to Contacts). Email
 *             address only: Brevo signs no HIPAA BAA, so nothing about a
 *             patient's health goes through it.
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

/** The weekly call that keeps the key in use (see the top of this file). @param {Env} env */
export async function keepAlive(env) {
  const list = Number(env.BREVO_LIST_ID);
  if (!env.BREVO_API_KEY || !list) {
    console.error('keepAlive: BREVO_API_KEY or BREVO_LIST_ID is not set');
    return;
  }
  const res = await fetch(`${brevo(env)}/contacts/lists/${list}`, {
    headers: { 'api-key': env.BREVO_API_KEY, Accept: 'application/json' },
  });
  if (res.ok) console.log(`keepAlive: Brevo list ${list} reachable`);
  else console.error(`keepAlive: Brevo answered ${res.status}`);
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
