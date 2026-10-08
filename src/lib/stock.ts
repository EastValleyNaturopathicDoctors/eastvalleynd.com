/**
 * Unsplash stock photos (D118, D119) — see src/data/stock-photos.json.
 * The manifest was curated as objects and scenes only; the clinic has since
 * said photos of people are fine (Oct 2026). A page's or post's own image
 * wins, unless src/data/hero-overrides.ts picks a photo for that page; these
 * fill the gaps, and the template's photo slots (homepage condition cards,
 * section images) are self-hosted from the same manifest.
 */
import stock from '@/data/stock-photos.json';
import { heroOverrides } from '@/data/hero-overrides';

export type StockPhoto = { file: string; alt: string };

/** The stock photo for a page or post route, if it has one. A hand-kept
 *  override (src/data/hero-overrides.ts) goes first (tracker I4). */
export function stockFor(route: string): StockPhoto | undefined {
  const override = heroOverrides[route];
  if (override === 'panel' || override === 'needs-photo') return undefined;
  return override ?? (stock.photos as Record<string, StockPhoto>)[route];
}

/** A template slot's photo: `card:<condition slug>`, `section:optimization`, … */
export const stockSlot = (slot: string): StockPhoto | undefined =>
  (stock.components as Record<string, StockPhoto>)[slot];

