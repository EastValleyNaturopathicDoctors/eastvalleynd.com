/**
 * Cloudflare Turnstile, the widget "eastvalleynd.com forms" (Nov 2026; Managed
 * mode; hostnames eastvalleynd.com, www., and the workers.dev production and
 * preview hosts). The site key is public by design; the secret is the
 * TURNSTILE_SECRET Worker secret, checked in worker/index.js.
 *
 * PUBLIC_TURNSTILE_SITEKEY overrides it for a local test build (Cloudflare's
 * always-passing test key is 1x00000000000000000000AA).
 */
export const turnstileSiteKey: string = import.meta.env.PUBLIC_TURNSTILE_SITEKEY || '0x4AAAAAAF0FIwRmuzjKQJc7';
