/**
 * How to show a migrated page's featured image, by its intrinsic width (D116).
 *
 * Many WordPress featured images are thumbnails — 100px, 150px, 218px — and a
 * set of IV graphics are 600px. Drawn into the 1200px 16:9 hero slot they were
 * upscaled up to twelve times and blurry, and the crop cut the IV graphics'
 * lettering. Each now gets the treatment its pixels can carry:
 *
 *   wide       ≥ 1000px, or unknown  → the full hero, as before
 *   contained  480–999px             → centred at its own width, uncropped,
 *                                       in a tinted frame (tracker I5)
 *   inset      400–479px             → a small figure floated beside the text
 *   hidden     200–399px             → too soft to float beside the text; not
 *                                       shown, and no stock photo either (I5)
 *   none       < 200px               → an icon-sized thumbnail; not shown
 */
export type HeroMode = 'wide' | 'contained' | 'inset' | 'hidden' | 'none';

export function heroMode(width: number): HeroMode {
  if (!width || width >= 1000) return 'wide';
  if (width >= 480) return 'contained';
  if (width >= 400) return 'inset';
  if (width >= 200) return 'hidden';
  return 'none';
}

/** The IV drips' cyan circle graphics keep the plain contained treatment, not
 *  the frame: tracker I6 settles their size and style. */
export const isIvGraphic = (route: string): boolean =>
  route.startsWith('/iv-therapy/') && route !== '/iv-therapy/';

/**
 * Whether a body opens with its own video or picture, allowing one heading
 * first ("Long COVID Syndrome", then the video). Such a page skips the stock
 * photo or icon panel: the clinic's own media is the top image (tracker I5).
 */
export const opensWithMedia = (html: string): boolean =>
  /^\s*(?:<p>\s*(?:&nbsp;)?\s*<\/p>\s*)*(?:<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>\s*)?(?:<p[^>]*>\s*)?(?:<a [^>]*>\s*)?<(?:(?:img|video|iframe)\b|figure class="wp-video")/
    .test(html);

/**
 * Whether a wide image is clearly not 16:9 — more than 5% off, like the
 * 1200×628 social cards whose lettering the crop cut. Those show whole
 * (tracker I5); near-16:9 photos keep the full-bleed crop.
 */
export const isOff169 = (width: number, height: number): boolean =>
  !!width && !!height && Math.abs(width / height / (16 / 9) - 1) > 0.05;
