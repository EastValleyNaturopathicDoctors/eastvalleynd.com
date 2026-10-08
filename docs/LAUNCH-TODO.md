# Launch to-do list

Tracked here so nothing is lost; none of it is done yet unless ticked. Two
sources:

- **Pre-launch SEO/Astro audit, 2026-10-08.** Four reviewers, each fact-checked;
  56 confirmed findings. Full evidence, file paths and suggested fixes:
  [`docs/audit/2026-10-08-prelaunch-findings.json`](audit/2026-10-08-prelaunch-findings.json).
- **EVND website meeting, 2026-10-08** (Zac with Dr. Porter, Dr. Nevels, Missy and Curtis).

Where a fix touches generated files (`src/content/**`, `src/data/nav.json`,
`public/sitemap.xml`, `public/robots.txt`, `public/_redirects`), make it in the
migration pipeline (`extract/*.py`) or in a hand-kept override, or the next
pipeline run will undo it.

## 1. Launch day: Cloudflare and Google (dashboard work, no code)

- [ ] Confirm the Worker `eastvalleynd-com`. Workers Builds: build command **`npm run build`** (not `astro build`, which skips the search index); deploy `npx wrangler deploy`.
- [ ] Delete the `www` DNS record pointing at WordPress, then add **www.eastvalleynd.com** as the Worker's Custom Domain.
- [ ] Apex `eastvalleynd.com`: proxied record plus a Redirect Rule to `https://www.eastvalleynd.com` (301, keep path and query).
- [ ] SSL/TLS: **Always Use HTTPS** on; HSTS (start with a short max-age).
- [ ] Query-string redirects as Redirect Rules (`_redirects` can't match them): `/?page_id=2919` (69 hits) and `/?p=487`. The list is at the end of `public/_redirects`.
- [ ] If DNS moves to Cloudflare, copy **every** record first, especially MX/SPF/DKIM for patientcare@ email and TXT verifications.
- [ ] Search Console: the new site carries no verification meta tag. If verification was Yoast's tag, verify by DNS **before** launch. Then submit `https://www.eastvalleynd.com/sitemap.xml`.
- [ ] After launch, turn off the `workers.dev` address (`"workers_dev": false` in `wrangler.jsonc`) so it isn't crawled as a duplicate site.

## 2. Fix before launch (rankings the old site already has)

- [ ] **Old URLs without a trailing slash 404.** 587 of 646 redirects match only `/old-page/`. Add the slashless form of each (about 1,233 rules, under the 2,000 limit): in `extract/build_redirects.py`, or in a postbuild step so the pipeline can't undo it.
- [ ] **About 20 to 25 redirects land on placeholder or noindex pages.** Examples: `/long-covid/` and `/long-covid-syndrome/` (should go to `/conditions/long-covid-syndrome/`), the old dr-*-request-appointment pages (should go to the physician page), the `/foundations*/` pages and the menopause audiobook parts. Point each at its final indexable page.
- [ ] **Duplicate pages.** `/allergies/`, `/infertility/` and `/suffering-from-childhood-allergies/` are 96–98% the same as their `/conditions/…` pages; near-duplicate: `/what-causes-vaginal-infections/`. Keep the `/conditions/` pages (they're in the menu). Interim fix: `src/data/duplicate-pages.ts` plus canonical/noindex support in `BlogPost.astro`. Permanent fix: 301 the copies and drop them from the sitemap. Also repoint `/rhinitis/`.
- [ ] **Titles lost their keywords** on 69 pages, e.g. "Cancer — EVND" where WordPress had "Cancer & Hyperbarics", plus "ADHD — EVND" and "FAQ — EVND". Add an SEO-title map (e.g. `src/data/seo-titles.ts`) used for `<title>` only, leaving the visible H1 alone.
- [ ] Take `/dr-porter-request-appointment-page/` and `/dr-schwartz-request-appointment-page/` out of `sitemap.xml` (they point Google elsewhere).

## 3. Fix soon after

- [ ] Images inside page bodies: add `loading="lazy"`, `decoding="async"` and width/height (Chronic Pain scores 78 on mobile, SkinPen 83). Also add width/height to the logo row in `src/lib/logorow.ts`.
- [ ] Video thumbnails at the top of 12 pages are lazy-loaded; load the first one eagerly with high priority (`VideoFacade.astro`).
- [ ] Heading font: switch `@fontsource-variable/bricolage-grotesque/standard` to `opsz` in `Base.astro` (saves about 54 KB per first view).
- [ ] Favicon: add a square icon, `/favicon.ico`, an apple-touch-icon and a manifest. Today the favicon is the 750×300 wordmark.
- [ ] 404 page: `noindex`; fix its canonical (it currently points at `/404/`, which answers 200).
- [ ] Typos Google will show: "Tramautic", "Injures" (fix the title only, keep the URL), "Agressivemeses", "Digestivee", "Rreduce", "Petide", "Garelli" (Galleri), "detected ?", "Dr. Laura. Badalamenti", "how tit can help", "nuerofeedback". Pages with another page's meta description: IBD, Plaquex, Forms & Handouts.
- [ ] Accessibility:
  - [ ] Desktop menu takes 80 Tab presses to get past, and its `aria-expanded` is wrong.
  - [ ] Focus ring is too faint on dark sections.
  - [ ] Pause or stop for the trust-strip marquee and the looping logo (WCAG 2.2.2; both also repaint every frame).
  - [ ] Link names that don't match their visible text: "Read on Google", "Book online".
  - [ ] Mobile menu: Escape focus and focus trap.
  - [ ] Search: focus ring.
  - [ ] Two low-contrast labels on the homepage.
- [ ] The desktop "On this page" rail folds and unfolds while scrolling, causing layout shift.
- [ ] Add a `public/_headers` file: long cache for `/_astro/*`, plus security headers.
- [ ] Homepage scroll-reveal: show everything when printing or saving to PDF (`@media print`).
- [ ] Hero images: correct `sizes`; stop downloading the team photo on phones, where it's hidden.

## 4. Later

- [ ] Structured data: geo, image and sameAs for MedicalClinic; BlogPosting authors typed as Person; BreadcrumbList.
- [ ] Per-page `og:image`; `og:type` set to article on blog posts.
- [ ] `lastmod` in `sitemap.xml`.
- [ ] Redirect the old Yoast sitemap URLs (`/sitemap_index.xml`, `/post-sitemap.xml`, …) to `/sitemap.xml`, and `/feed/` to `/blog/`.
- [ ] Upgrade Astro (two majors behind; 9 build-time npm audit items).
- [ ] Remove the 82 unused original images (19 MB) from `dist/_astro`.
- [ ] Thin pages, pages that repeat most of another's text, and the same FAQ markup on three pages.

## 5. From the EVND meeting

**Decided, to build**
- [ ] **Homepage hero:** replace the team photo ("we cannot go with this picture"). Interim: a stock consultation photo with faces turned away, or no photo. Final: a 15–30 s background video of practitioners with patients (like Rollins & Peterson and Onyx Integrative), optional longer click-to-play version. Write the video spec; set up a shared drive for Micah's footage.
- [ ] Same team photo on About and Core Values: swap for clinic photos until a new team photo exists (some people in it no longer work there).
- [ ] **Services and Conditions:** build **Option 2 (By topic)** with a box around each item (like Option 1's cards); keep the sub-page links (SEO hub). Check mobile. Then remove the tabs and Options 1 and 3.
- [ ] Fix ". Plasmalogens"; replace the icon Zac flagged during the meeting.
- [ ] Dr. Nevels' profile: only her hormonal/menopause video; no parasite or mold videos there (they can stay elsewhere on the site). Needs the YouTube link.
- [ ] Dr. Porter's profile: all YouTube videos he appears in. Needs the links or the channel.
- [ ] New page: **Epstein-Barr virus** (patient resource; may exist in the old chronic fatigue content).
- [ ] Outdated-content AI audit: red-flag, don't rewrite; oldest pages first. Known: amniotic liquid allograft (Chronic Pain, Knee Pain, Plantar Fasciitis), stem cells and exosomes (not offered).
- [ ] Show EVND how editing works on the new site, and how adding a page works.

**Open question**
- [ ] Services menu: alphabetical, or grouped like Option 2? Suggest grouped.

**Waiting on EVND**
- [ ] Uniform bios: send them the template (condition heading plus 2–3 sentences); they return Word docs. Doctors only.
- [ ] Priority order of services within each group.
- [ ] New team photos (their old photographer, Rob) and video footage (Micah).
- [ ] Their review pass, then the go-live date. Second QA reviewer on our side.

## 6. Hand edits the pipeline must carry over

- `src/data/nav.json`: About → Our Core Values; sitemap entries for `/reviews/` and `/about/core-values/`.
- `public/assets/EVND-animated.svg`: N and D green on EVND, fading to black (from `extract/build_logo.py`).
- `src/data/stock-photos.json`: `section:booking` → `unsplash-3yDn67QTpHg.jpg` (desert).
- `src/data/hand-built-pages.ts`: `/patient-portal/` is hand-built from `src/content/pages/patient-portal.md`.
