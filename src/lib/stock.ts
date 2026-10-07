/**
 * Unsplash stock photos (D118, D119) — see src/data/stock-photos.json.
 * Objects and scenes only, never people. A page's or post's own image always
 * wins; these fill the gaps, and the template's photo slots (homepage
 * condition cards, section images) are self-hosted from the same manifest.
 */
import stock from '@/data/stock-photos.json';
import { heroOverrides } from '@/data/hero-overrides';

export type StockPhoto = { file: string; alt: string };

/** The stock photo for a page or post route, if it has one. A hand-kept
 *  override (src/data/hero-overrides.ts) goes first (tracker I4). */
export function stockFor(route: string): StockPhoto | undefined {
  const override = heroOverrides[route];
  if (override === 'panel') return undefined;
  return override ?? (stock.photos as Record<string, StockPhoto>)[route];
}

/** A template slot's photo: `card:<condition slug>`, `section:optimization`, … */
export const stockSlot = (slot: string): StockPhoto | undefined =>
  (stock.components as Record<string, StockPhoto>)[slot];

/** Routes that show the branded icon panel: the manifest's, plus the photos
 *  an override took away (tracker I4). */
export const stockPlaceholders: string[] = [
  ...stock.placeholders,
  ...Object.keys(heroOverrides).filter((r) => heroOverrides[r] === 'panel'),
];
