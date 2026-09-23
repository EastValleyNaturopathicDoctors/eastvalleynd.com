/**
 * How to show a migrated page's featured image, by its intrinsic width (D116).
 *
 * Many WordPress featured images are thumbnails — 100px, 150px, 218px — and a
 * set of IV graphics are 600px. Drawn into the 1200px 16:9 hero slot they were
 * upscaled up to twelve times and blurry, and the crop cut the IV graphics'
 * lettering. Each now gets the treatment its pixels can carry:
 *
 *   wide       ≥ 1000px, or unknown  → the full hero, as before
 *   contained  480–999px             → centred at its own width, uncropped
 *   inset      200–479px             → a small figure floated beside the text
 *   none       < 200px               → an icon-sized thumbnail; not shown
 */
export type HeroMode = 'wide' | 'contained' | 'inset' | 'none';

export function heroMode(width: number): HeroMode {
  if (!width || width >= 1000) return 'wide';
  if (width >= 480) return 'contained';
  if (width >= 200) return 'inset';
  return 'none';
}
