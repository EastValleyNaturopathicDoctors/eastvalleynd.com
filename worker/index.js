/**
 * The site is static (dist/, served by Cloudflare's static assets). This
 * Worker runs only for /videos/* (wrangler.jsonc, assets.run_worker_first),
 * because static assets answer a `Range` request with the whole file and a
 * 200, and Safari won't play a video that isn't served in byte ranges (206
 * Partial Content). Cloudflare's own fix:
 * https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/#range-requests
 *
 * The videos are a few MB, so reading one into memory to slice it is fine.
 * File names carry a version (hero-2026-11.…), so they can be cached for a
 * year; a new video gets a new name.
 */
const YEAR = 'public, max-age=31536000, immutable';

export default {
  /** @param {Request} request @param {{ ASSETS: { fetch: typeof fetch } }} env */
  async fetch(request, env) {
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
  },
};

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
