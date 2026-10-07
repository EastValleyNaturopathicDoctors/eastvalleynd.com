/**
 * A blog image's intrinsic size, for layout decisions BlogImage.astro cannot
 * make for its parent (tracker I5). Kept out of the layout's frontmatter:
 * Vite hoists an eager glob above the layout's own imports, which moved the
 * page CSS ahead of global.css and let `.container` override it.
 */
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/images/blog/*.{jpg,jpeg,png,webp,avif,gif}', { eager: true }
);

export const blogImageMeta = (file: string): ImageMetadata | undefined =>
  images[`/src/images/blog/${file}`]?.default;
