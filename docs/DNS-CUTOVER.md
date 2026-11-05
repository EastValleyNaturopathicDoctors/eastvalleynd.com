# Moving www.eastvalleynd.com to the new site

Nov 5, 2026. The domain's DNS is at GoDaddy (ns61/ns62.domaincontrol.com) and
www points at the WordPress host (35.212.93.82). A Worker can only answer on
www.eastvalleynd.com once the domain is a zone in the same Cloudflare account
as the Worker ("Eastvalleynd@gmail.com's Account").

## Records that must exist in Cloudflare before the nameserver switch

Read from public DNS on Nov 5. Cloudflare's import scan usually finds the
apex records but can miss the `_domainkey` ones, so check every line. Mail and
DKIM records are **DNS only** (grey cloud).

| Name | Type | Value | Proxy |
|---|---|---|---|
| `@` | MX 1 | `aspmx.l.google.com` | DNS only |
| `@` | MX 5 | `alt1.aspmx.l.google.com` | DNS only |
| `@` | MX 5 | `alt2.aspmx.l.google.com` | DNS only |
| `@` | MX 10 | `alt3.aspmx.l.google.com` | DNS only |
| `@` | MX 10 | `alt4.aspmx.l.google.com` | DNS only |
| `@` | TXT | `v=spf1 include:_spf.google.com include:_spf.paubox.com -all` | |
| `@` | TXT | `google-site-verification=d6glHaXgL6djqKYf4xk4q4vKLSCa-2j4s8XTyPmcHt4` | |
| `@` | TXT | `brevo-code:bffdbcb96917120312dc1cba41621300` | |
| `@` | TXT | `NETORGFT13245968.onmicrosoft.com` | |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com,mailto:patientcare@eastvalleynd.com` | |
| `google._domainkey` | TXT | Google Workspace DKIM key (`v=DKIM1; k=rsa; p=MIIBIjAN…`, copy from GoDaddy) | |
| `paubox._domainkey` | TXT | Paubox DKIM key (`v=DKIM1; k=rsa; p=MIIBIjAN…`, copy from GoDaddy) | |
| `brevo1._domainkey` | CNAME | `b1.eastvalleynd-com.dkim.brevo.com` | DNS only |
| `brevo2._domainkey` | CNAME | `b2.eastvalleynd-com.dkim.brevo.com` | DNS only |
| `@` | A | `35.212.93.82` (WordPress; keep until launch, for rollback) | |
| `www` | CNAME | `eastvalleynd.com` (replaced by the Worker at launch) | |
| `ftp` | CNAME | `eastvalleynd.com` (WordPress host; drop after launch if unused) | |

GoDaddy's `_domainconnect` record isn't needed at Cloudflare.

## Order

1. Cloudflare: **Add a domain** → `eastvalleynd.com`, Free plan, in the
   Eastvalleynd@gmail.com account. Check the imported records against the
   table above; add anything missing.
2. GoDaddy: change the nameservers to the two Cloudflare gives you. Email and
   the old site keep working, because the records are the same.
3. Wait for Cloudflare to show the zone **Active** (minutes to a few hours).
4. Launch: Worker `eastvalleynd-com` → Settings → Domains & Routes → add
   Custom Domain `www.eastvalleynd.com` (this replaces the www record).
5. Apex: Rules → Redirect Rules → template "Redirect from root to WWW"
   (301, keep path and query). The apex record must be proxied (orange).
6. SSL/TLS → Edge Certificates: Always Use HTTPS on; HSTS later.
7. Turnstile → widget "eastvalleynd.com forms" → Hostnames: make sure
   `www.eastvalleynd.com` and `eastvalleynd.com` are listed, or the forms fail.
8. Query-string redirects as Redirect Rules (`/?page_id=2919`, `/?p=487`; the
   list is at the end of `public/_redirects`).
9. Search Console: submit `https://www.eastvalleynd.com/sitemap.xml`
   (DNS verification is already in the zone).
10. After a few days: `"workers_dev": false` in `wrangler.jsonc`.
