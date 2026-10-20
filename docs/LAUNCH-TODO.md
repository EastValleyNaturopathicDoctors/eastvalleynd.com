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

## 5. From the EVND meeting (2026-10-08): action list

Zac joined from his computer; Curtis's microphone picked up the whole room
(Curtis, Dr. Porter, Dr. Nevels, Missy), so the "Curtis" lines in the transcript
are any of them. Two fixes to Gemini's summary:
- The hormonal video goes on **Dr. Nevels'** profile, not Curtis's.
- The "500 loyal patients" and "booked out six months" points came from the doctors.

### Zac: website
- [x] **Homepage hero photo: replace before launch.** *(Done Oct 20: off the hero, which is the moving background alone; About now opens with the clinic entrance, and Core Values uses the treatment room. Still needed: a real replacement.)* "We cannot let it go… I would not want to go with this picture." Short term: a doctors-only photo if one exists ("just you and me and Laura or Casey"), a stock consultation shot with faces turned away, or no photo. The same photo is on About and Core Values; take out the people who've left (AI edit for now).
- [ ] **Homepage background video** when Micah's edit arrives. Spec for them: 15–30 s (no more than 30), at least 1080p (4K source is fine), no audio, seamless loop, a poster frame, a small file. Optional longer click-to-play version below, like Rollins & Peterson (40 s background, 90 s full). References: Rollins & Peterson, Onyx Integrative.
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
- [ ] Ask EVND for raw (vector) logo files, to refine the animation.
- [ ] Share the preview link; get a second QA reviewer; launch when EVND approves (checklist in section 1).
- Approved in the meeting, no action: practitioner videos, reviews on profiles, "Book with" opening the Patient Fusion page, the table of contents on long pages, buttons instead of sidebar forms, the Core Values page ("Love it"), and site speed.

### EVND
- [ ] Review the site and choose a go-live date.
- [ ] Rewrite doctor bios in the new format (Word docs); decide what each doctor wants to feature (e.g. still list migraines?).
- [ ] Rank the services within each group (what should come first).
- [ ] Send Dr. Nevels' hormonal video link.
- [ ] Approve or rewrite the drafted Core Values statements for Precision and Education.
- [ ] New staff photos (their old photographer, Rob), and say who to take out of the current group photo.
- [ ] Micah: create the shared drive of raw footage (check it's high-resolution), then the 15–30 s homepage video: practitioners with patients, smiling faces, quick cuts.

### Curtis: marketing (not website)
- [ ] Schedule the Google Ads follow-up for Gilbert: about $1,700 a month ($750 management plus $1,000 ad spend), 4–5 broad topics (hormones, chronic pain, naturopathic in general). Weigh capacity first: Dr. Porter is booked out six months and they need more doctors.
- [ ] Ideal-patient messaging for the homepage, with the doctors: aim at loyal, long-term patients ("I just need 500 loyal people"), and lead with what patients search for, then guide them to the right care.

## 6. Hand edits the pipeline must carry over

- `src/data/nav.json`: About → Our Core Values; sitemap entries for `/reviews/` and `/about/core-values/`.
- `public/assets/EVND-animated.svg`: N and D green on EVND, fading to black (from `extract/build_logo.py`).
- `src/data/stock-photos.json`: `section:booking` → `unsplash-3yDn67QTpHg.jpg` (desert).
- `src/data/hand-built-pages.ts`: `/patient-portal/` is hand-built from `src/content/pages/patient-portal.md`.
