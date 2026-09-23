import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Physician bios. Entries are GENERATED — do not hand-edit them.
 * Source: extract/export/ (the Aug 25 WordPress database backup).
 * Regenerate with: python3 extract/build_physicians.py
 */
const physicians = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/physicians' }),
  schema: z.object({
    name: z.string(),
    credentials: z.string().default(''),
    slug: z.string(),
    order: z.number().default(99),
    /** Filename in src/images/team — resolved by TeamPhoto.astro, so Astro
     *  optimises it at build time rather than shipping the original. */
    imageFile: z.string().default(''),
    summary: z.string().default(''),
    metaDescription: z.string().default(''),
    /** Provenance, so a page can always be traced back to its WordPress record. */
    sourceId: z.number().optional(),
    sourceUrl: z.string().optional(),
    wordpressPath: z.string().optional(),
    /** Booking links recovered from the page's embedded scheduling widgets
     *  (Patient Fusion iframes and Acuity buttons). */
    booking: z.array(z.object({
      label: z.string().default('Book online'),
      url: z.string(),
    })).default([]),
    /** Real patient reviews carried over from the WordPress page. */
    testimonials: z.array(z.object({
      name: z.string().default(''),
      stars: z.string().default(''),
      quote: z.string(),
    })).default([]),
  }),
});

/**
 * Blog posts. GENERATED — regenerate with extract/build_blog.py.
 * Post set comes from the "keep, kill, combine, update" sheet; bodies and
 * featured images come from the WordPress export.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    updated: z.string().default(''),
    author: z.string().default(''),
    excerpt: z.string().default(''),
    metaDescription: z.string().default(''),
    /** Filename in src/images/blog — resolved by BlogImage.astro. */
    imageFile: z.string().default(''),
    imageAlt: z.string().default(''),
    /** Intrinsic width of that file; the layout shows a small one at its own
     *  size rather than stretching it across the page (D116). 0 = unknown. */
    imageWidth: z.number().default(0),
    wordCount: z.number().default(0),
    /** Keep / Update / no-decision, from the blog sheet. */
    decision: z.string().default(''),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    sourceId: z.number().optional(),
    sourceUrl: z.string().optional(),
  }),
});

/**
 * Interior content pages. GENERATED — regenerate with
 * extract/build_content_pages.py. Bodies come from the WordPress export, mapped
 * onto the new sitemap routes.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    route: z.string(),
    slug: z.string(),
    wpTitle: z.string().default(''),
    metaDescription: z.string().default(''),
    imageFile: z.string().default(''),
    imageAlt: z.string().default(''),
    /** Intrinsic width of the hero file (D116). 0 = unknown. */
    imageWidth: z.number().default(0),
    /** Service-specific online booking recovered from the WordPress page's
     *  Acuity buttons (D115), shown in the page's booking card. */
    booking: z.array(z.object({ label: z.string().default('Book online'), url: z.string() })).default([]),
    wordCount: z.number().default(0),
    /** Set when two sitemap rows deliberately render the same record — the
     *  page still exists, but points search engines at the primary one. */
    canonical: z.string().default(''),
    /** True when the route is still awaiting new copy and is meanwhile serving
     *  the page published at that same URL on the live site. Real content, not
     *  a stub — but the commissioned document has not arrived. */
    interim: z.boolean().default(false),
    sourceId: z.number().optional(),
    sourceUrl: z.string().optional(),
  }),
});

export const collections = { physicians, blog, pages };
