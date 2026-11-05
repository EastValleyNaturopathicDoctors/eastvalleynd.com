# Launch to-do list

Tracked here so nothing is lost; none of it is done yet unless ticked.
Last brought up to date 2026-11-05. Two
sources:

- **Pre-launch SEO/Astro audit, 2026-10-08.** Four reviewers, each fact-checked;
  56 confirmed findings. Full evidence, file paths and suggested fixes:
  [`docs/audit/2026-10-08-prelaunch-findings.json`](audit/2026-10-08-prelaunch-findings.json).
- **EVND website meeting, 2026-10-08** (Zac with Dr. Porter, Dr. Nevels, Missy and Curtis).

Where a fix touches generated files (`src/content/**`, `src/data/nav.json`,
`public/sitemap.xml`, `public/robots.txt`, `public/_redirects`), make it in the
migration pipeline (`extract/*.py`) or in a hand-kept override, or the next
pipeline run will undo it.

## 0. What blocks launch (audit of 2026-11-02)

Four areas, each fact-checked; 57 confirmed findings. Full evidence:
[`docs/audit/2026-11-02-launch-readiness-findings.json`](audit/2026-11-02-launch-readiness-findings.json).

**Blockers**
- [x] **The appointment request and contact forms send nothing and tell the patient nothing.** *(Done Nov 5, interim: both send to patientcare@ through the Worker and Brevo, behind Turnstile, with a thank-you note and a phone-number error, never silent. No BAA on this route, so the date of birth and chief complaint are left out for now (`src/data/forms.ts`). Permanent: Paubox Forms (patientcare@ is Google Workspace with Paubox); needs the clinic's Paubox admin.)*
- [ ] **Treatments the owners said they don't offer are still presented as offered** (Nov 5: 28 built pages mention stem cells, exosomes or amniotic allograft; the eczema page has "Peptide Therapy"): stem cells, exosomes and amniotic allograft on 15 pages plus a PDF; the blog post "…Here are 3 types that we offer"; Veterans' "Exosomes, Stem Cells". The clinic approves the removals; they're generated content (pipeline or hand-kept override).
- [ ] **Treatment timelines the owners said to remove,** on 15 pages, e.g. "Most patients notice a difference within 2 to 4 weeks" (a new docx page), "95% of our patients… within just a few days". Also the stroke pages' "begin treatment within 36 hours", which contradicts the 2-week to 6-month wait.
- [ ] **Cutover not done yet (section 1).** Nov 5: the domain's DNS is at GoDaddy (ns61/62.domaincontrol.com), so the zone must move to Cloudflare for the Custom Domain; copy every record first (Google Workspace MX; SPF with Google and Paubox; Brevo DKIM brevo1/brevo2; google-site-verification and Microsoft TXT; DMARC). www Custom Domain, apex and http to https www 301s, query-string redirects, build command `npm run build`. Plus a DNS and email plan: export the current zone, find who hosts patientcare@ mail, lower TTLs, keep the WordPress host for rollback.

**Fix before launch**
- [x] Pick a hero option and remove the visible "Option 1 / 2 / 3" switcher. *(Done Nov 4: the clinic's video replaced all three, and the switcher is gone.)*
- [ ] Credentials: Marie Ybarra's meta description said "Dr. Marie Ybarra, NMD" *(fixed Nov 5, `src/data/meta-descriptions.ts`)*; still open: "licensed… nutrition" and "Seven licensed clinicians" (Shelly is a holistic nutrition practitioner); "Our Physicians (7)" covers non-physicians.
- [ ] Cure, "100%" and cancer claims in the clinic's own voice on 33 pages. Worst: /conditions/cancer-support/ ("reduced 80–100%", "cancer eradication"). The doctors review the list.
- [x] TruDOSE spotlight: outcome copy from the design template that no clinic page supports, and its button goes to /iv-therapy/, which never mentions TruDOSE. *(Done Nov 5: only "your own platelets, by IV, in our Mesa IV suite"; the button opens the contact form. There is no TruDOSE page: when the clinic writes one, point the button there.)*
- [ ] Hand-picked reviews on profiles and the homepage that promise outcomes ("cured in 3 months", "100% gone"): swap them.
- [ ] "Book online" and "Book a new patient visit" open the request form, not a scheduler; on 26 pages two "Book online" buttons go to different places.
- [ ] Search Console: verify by DNS before the switch (a google-site-verification TXT is already in the zone: keep it in the move). Analytics: decide (GA4?), and update the privacy page, which says there's no analytics.
- [x] Still open from Oct 8 (section 2): 587 old URLs 404 without the trailing slash; 25 redirects land on placeholder or noindex pages; 69 titles lost their keywords; 3 duplicate page pairs; no square favicon. *(Done Nov 5; see section 2.)*
- [ ] Clinic sign-off on developer-written copy (Core Values Precision and Education, group lines, hero copy).

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

- [x] *(Done Nov 5: `scripts/redirects-finalize.mjs` adds the slashless twins at build, 1,245 rules.)* **Old URLs without a trailing slash 404.** 587 of 646 redirects match only `/old-page/`. Add the slashless form of each (about 1,233 rules, under the 2,000 limit): in `extract/build_redirects.py`, or in a postbuild step so the pipeline can't undo it.
- [x] *(Done Nov 5: 21 repointed in `scripts/redirects-finalize.mjs`, canonicals and chains followed automatically; the build warns about any new one.)* **About 20 to 25 redirects land on placeholder or noindex pages.** Examples: `/long-covid/` and `/long-covid-syndrome/` (should go to `/conditions/long-covid-syndrome/`), the old dr-*-request-appointment pages (should go to the physician page), the `/foundations*/` pages and the menopause audiobook parts. Point each at its final indexable page.
- [x] *(Done Nov 5, interim: the four blog copies carry a canonical to the /conditions/ page, no noindex, and leave the sitemap. Permanent: 301 in the pipeline.)* **Duplicate pages.** `/allergies/`, `/infertility/` and `/suffering-from-childhood-allergies/` are 96–98% the same as their `/conditions/…` pages; near-duplicate: `/what-causes-vaginal-infections/`. Keep the `/conditions/` pages (they're in the menu). Interim fix: `src/data/duplicate-pages.ts` plus canonical/noindex support in `BlogPost.astro`. Permanent fix: 301 the copies and drop them from the sitemap. Also repoint `/rhinitis/`.
- [x] *(Done Nov 5: `src/data/seo-titles.ts`, 54 pages plus the homepage; the harmless 15 left.)* **Titles lost their keywords** on 69 pages, e.g. "Cancer — EVND" where WordPress had "Cancer & Hyperbarics", plus "ADHD — EVND" and "FAQ — EVND". Add an SEO-title map (e.g. `src/data/seo-titles.ts`) used for `<title>` only, leaving the visible H1 alone.
- [x] Take `/dr-porter-request-appointment-page/` and `/dr-schwartz-request-appointment-page/` out of `sitemap.xml` (they point Google elsewhere). *(Done Nov 5: the build drops noindex and canonical-elsewhere pages.)*

## 3. Fix soon after

- [ ] Images inside page bodies: add `loading="lazy"`, `decoding="async"` and width/height (Chronic Pain scores 78 on mobile, SkinPen 83). Also add width/height to the logo row in `src/lib/logorow.ts`.
- [ ] Video thumbnails at the top of 12 pages are lazy-loaded; load the first one eagerly with high priority (`VideoFacade.astro`).
- [x] ~~Heading font: switch Bricolage to `opsz`.~~ *(Moot Nov 5: the site is Roboto and Roboto Condensed.)*
- [x] Favicon: add a square icon, `/favicon.ico`, an apple-touch-icon and a manifest. *(Done Nov 4: the logo's leaf, SVG + .ico + apple-touch-icon; no manifest yet.)*
- [x] 404 page: `noindex`; fix its canonical (it currently points at `/404/`, which answers 200). *(Done Nov 5.)*
- [x] *(Done Nov 5: `fixText` in `src/lib/tidy-label.ts` and `src/data/meta-descriptions.ts`.)* Typos Google will show: "Tramautic", "Injures" (fix the title only, keep the URL), "Agressivemeses", "Digestivee", "Rreduce", "Petide", "Garelli" (Galleri), "detected ?", "Dr. Laura. Badalamenti", "how tit can help", "nuerofeedback". Pages with another page's meta description: IBD, Plaquex, Forms & Handouts.
- [x] Accessibility *(all done Nov 5, keyboard-tested)*:
  - [x] Desktop menu takes 80 Tab presses to get past, and its `aria-expanded` is wrong. *(Now 20.)*
  - [x] Focus ring is too faint on dark sections.
  - [x] Pause or stop for the trust-strip marquee and the looping logo (WCAG 2.2.2; both also repaint every frame). *(Strip: pause button + hover/focus pause; logo: plays twice, then holds.)*
  - [x] Link names that don't match their visible text: "Read on Google", "Book online".
  - [x] Mobile menu: Escape focus and focus trap.
  - [x] Search: focus ring.
  - [x] Two low-contrast labels on the homepage.
- [ ] The desktop "On this page" rail folds and unfolds while scrolling, causing layout shift.
- [x] Add a `public/_headers` file: long cache for `/_astro/*`, plus security headers. *(Done Nov 5; no CSP yet, HSTS at launch in the dashboard.)*
- [ ] Homepage scroll-reveal: show everything when printing or saving to PDF (`@media print`).
- [x] ~~Hero images: correct `sizes`; stop downloading the team photo on phones.~~ *(Moot: the hero is the video now.)*

## 4. Later

- [ ] Structured data: geo, image and sameAs for MedicalClinic; BlogPosting authors typed as Person; BreadcrumbList.
- [ ] Per-page `og:image`; `og:type` set to article on blog posts.
- [ ] `lastmod` in `sitemap.xml`.
- [ ] Redirect the old Yoast sitemap URLs (`/sitemap_index.xml`, `/post-sitemap.xml`, …) to `/sitemap.xml`, and `/feed/` to `/blog/`.
- [ ] Upgrade Astro (two majors behind; 9 build-time npm audit items).
- [ ] Remove the 82 unused original images (19 MB) from `dist/_astro`.
- [ ] Thin pages, pages that repeat most of another's text, and the same FAQ markup on three pages.

## 5. From the EVND meeting (2026-10-08): action list

Zac joined from his computer; Curtis's microphone picked up the whole room
(Curtis, Dr. Porter, Dr. Nevels, Missy), so the "Curtis" lines in the transcript
are any of them. Two fixes to Gemini's summary:
- The hormonal video goes on **Dr. Nevels'** profile, not Curtis's.
- The "500 loyal patients" and "booked out six months" points came from the doctors.

### Zac: website
- [x] **Homepage hero photo: replace before launch.** *(Done Oct 20: off the hero, which is the moving background alone; About now opens with the clinic entrance, and Core Values uses the treatment room. Still needed: a real replacement.)* "We cannot let it go… I would not want to go with this picture." Short term: a doctors-only photo if one exists ("just you and me and Laura or Casey"), a stock consultation shot with faces turned away, or no photo. The same photo is on About and Core Values; take out the people who've left (AI edit for now).
- [x] *(Done Nov 4: the clinic's 42 s cut; see the EVND list.)* **Homepage background video** when Micah's edit arrives. Spec for them: 15–30 s (no more than 30), at least 1080p (4K source is fine), no audio, seamless loop, a poster frame, a small file. Optional longer click-to-play version below, like Rollins & Peterson (40 s background, 90 s full). References: Rollins & Peterson, Onyx Integrative.
- [x] **Services and Conditions: build Option 2 (By topic) on both pages.** *(Done Oct 20: `TopicIndex.astro` with groups in `src/data/index-groups.ts`; tabs and Options 1 and 3 removed.)* Add a box around each item, like Option 1's cards. Keep the sub-page links: they're the SEO hub, and the room agreed people who want depth can use them. Check mobile ("it looks pretty clean on the mobile"). Then remove the tabs and Options 1 and 3.
- [x] Fix the stray period (". Plasmalogens"). *(Done Oct 20: tidied where titles and menu labels load, `src/lib/tidy-label.ts`; the pipeline should still clean its source.)* Replace the icon Zac said "needs a new icon" (on the Conditions Option 1 view; confirm which).
- [ ] **Dr. Nevels' profile:** her hormonal (menopause) video only; no parasite or mold videos there (they can stay elsewhere). She also pointed to her menopause e-book; consider linking it from her page. Needs the video link.
- [ ] **Dr. Porter's profile:** every YouTube video he's in ("I'm not afraid of any of them"). *(Oct 20: Alzheimer's, Candida and post-COVID are on it. Still to add: `9MeHjXcp6dc` and `Iigo8XbqjW4` (YouTube is blocked in the build environment, so their titles and posters are needed). `rs6uwl5iJQA` (brain injury) was left off: its title card names Dr. Seenauth.)*
- [ ] **Bio template:** send EVND the format (condition headings, 2–3 sentences each, links allowed), doctors only; then put in the Word docs they send.
- [ ] **Image audit,** page by page; swap stock for real practice photos as they come in.
- [ ] **Outdated-content AI audit:** a red-flag list, not rewrites, oldest pages first, for the doctors to review. Known: amniotic liquid allograft; stem cells and exosomes. Their own example of a page that's up to date: cardiovascular (written two years ago).
- [ ] **New page: Epstein-Barr virus,** a patient resource ("I like to use it as a resource for patients"). Check the old chronic fatigue content.
- [ ] **Editing:** set up the page editor, share the link, and show EVND how to edit and add a page.
- [ ] Services menu: alphabetical, or grouped like Option 2? Raised but not answered; suggest grouped.
- [x] Ask EVND for raw (vector) logo files, to refine the animation. *(Done Nov 4–5: the Roboto SemiBold EVND, `public/assets/EVND-logo.svg`; animation rebuilt by `scripts/build-animated-logo.py`.)*
- [ ] Share the preview link; get a second QA reviewer; launch when EVND approves (checklist in section 1).
- Approved in the meeting, no action: practitioner videos, reviews on profiles, "Book with" opening the Patient Fusion page, the table of contents on long pages, buttons instead of sidebar forms, the Core Values page ("Love it"), and site speed.

### EVND
- [ ] Review the site and choose a go-live date.
- [ ] Rewrite doctor bios in the new format (Word docs); decide what each doctor wants to feature (e.g. still list migraines?).
- [ ] Rank the services within each group (what should come first).
- [ ] Send Dr. Nevels' hormonal video link.
- [ ] Approve or rewrite the drafted Core Values statements for Precision and Education.
- [ ] New staff photos (their old photographer, Rob), and say who to take out of the current group photo.
- [x] Micah: create the shared drive of raw footage (check it's high-resolution), then the 15–30 s homepage video: practitioners with patients, smiling faces, quick cuts. *(Done Nov 4: a 42 s cut is in the hero, `public/videos/hero-2026-11-*`; HDR converted to standard colour, 2.4–5.8 MB per file, from 43 MB. `worker/index.js` serves it in byte ranges for Safari. A new cut: re-encode with the same settings, give it a new date in the name, and update `V` in `Hero.astro`.)*

### Curtis: marketing (not website)
- [ ] Schedule the Google Ads follow-up for Gilbert: about $1,700 a month ($750 management plus $1,000 ad spend), 4–5 broad topics (hormones, chronic pain, naturopathic in general). Weigh capacity first: Dr. Porter is booked out six months and they need more doctors.
- [ ] Ideal-patient messaging for the homepage, with the doctors: aim at loyal, long-term patients ("I just need 500 loyal people"), and lead with what patients search for, then guide them to the right care.

## 6. Hand edits the pipeline must carry over

- `src/data/nav.json`: About → Our Core Values; sitemap entries for `/reviews/` and `/about/core-values/`.
- `public/assets/EVND-animated.svg` is now built by `scripts/build-animated-logo.py` from `public/assets/EVND-logo.svg` (Nov 2026), not `extract/build_logo.py`: retire the pipeline's logo step.
- `public/_redirects` and `public/sitemap.xml` are finished at build by `scripts/redirects-finalize.mjs` (slashless twins, hand-kept OVERRIDES, canonical/chain follow, sitemap drops): carry the OVERRIDES into `extract/build_redirects.py` when convenient.
- `src/data/seo-titles.ts`, `src/data/meta-descriptions.ts` and `fixText` (`src/lib/tidy-label.ts`): titles, descriptions and typos the pipeline should fix at source.
- `src/data/stock-photos.json`: `section:booking` → `unsplash-3yDn67QTpHg.jpg` (desert).
- `src/data/hand-built-pages.ts`: `/patient-portal/` is hand-built from `src/content/pages/patient-portal.md`.
