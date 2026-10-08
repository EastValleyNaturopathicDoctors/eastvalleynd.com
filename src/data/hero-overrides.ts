/**
 * Hand-kept (not generated): corrections to a page's stock photo from
 * src/data/stock-photos.json (tracker I4). `'panel'` shows the branded icon
 * panel instead, for a photo that shows a product's branding; a photo swaps in
 * another file in src/images/stock, and also replaces the page's own WordPress
 * image when it has one (the clinic picks some of these). People are fine in
 * these photos (Oct 2026); the manifest's objects-and-scenes rule (D118) no
 * longer applies. Read by stockFor() and stockPlaceholders (src/lib/stock.ts)
 * and ContentPage.astro.
 *
 * The permanent fix is upstream: extract/fetch_stock_photos.py picking new
 * photos for these routes (or listing them as placeholders). An entry here can
 * be deleted once the manifest no longer carries the photo it replaces.
 */
import type { StockPhoto } from '@/lib/stock';

export const heroOverrides: Record<string, 'panel' | StockPhoto> = {
  // Gloved hands and a surgical gown beside the instrument tray.
  '/conditions/minor-dermatological-surgeries/': 'panel',
  // A cosmetics mock-up carrying a studio's "Cosmetic Mockup" branding.
  '/conditions/acne/': 'panel',
  // Branded products that could read as endorsements.
  '/conditions/asthma/': 'panel',
  '/conditions/eczema/': 'panel',
  // The "clipboards" are cocktail menus. The page shows a compact band
  // already (src/data/compact-heroes.ts); this keeps the photo off if not.
  '/forms-and-handouts/': 'panel',
  // Running shoes cut out on white; the anatomical foot shows the sole the
  // page is about. Also the arthritis page's photo.
  '/conditions/chronic-pain/plantar-fasciitis/': {
    file: 'unsplash-_W94Eb1iNYc.jpg',
    alt: 'An anatomical model of a foot showing its bones and joints',
  },
};
