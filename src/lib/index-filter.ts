/**
 * The filter box on the section indexes (SectionIndex.astro, IndexOptions.astro),
 * run in the browser. Every element with `data-find` is a match target: an
 * outermost one is a card, any inside it are that card's pages. Each word typed
 * must start a word in the target's text, so "iv" finds IV Therapy, not
 * "hyperactivity". A card whose own name matches keeps all its pages;
 * otherwise it shows only the pages that match. A `data-find-group` (a band or
 * topic and its heading) hides when none of its cards is left.
 */
export const words = (s: string): string[] =>
  s.toLowerCase().replace(/&/g, ' and ').split(/[^a-z0-9]+/).filter(Boolean);

const hits = (q: string[], text: string): boolean => {
  const w = words(text);
  return q.every((t) => w.some((x) => x.startsWith(t)));
};

/** Applies the query to everything under `scope`; returns the pages shown. */
export function applyFilter(scope: HTMLElement, q: string[]): number {
  let shown = 0;
  const cards = [...scope.querySelectorAll<HTMLElement>('[data-find]')]
    .filter((el) => !el.parentElement?.closest('[data-find]'));
  for (const card of cards) {
    const self = !q.length || hits(q, card.dataset.find || '');
    let kids = 0;
    for (const k of card.querySelectorAll<HTMLElement>('[data-find]')) {
      const on = self || hits(q, k.dataset.find || '');
      k.hidden = !on;
      if (on) kids += 1;
    }
    card.hidden = !(self || kids);
    // Count pages, not cards: the card's own page when its name matched,
    // plus each of its pages left showing.
    if (!card.hidden) shown += (self ? 1 : 0) + kids;
  }
  for (const g of scope.querySelectorAll<HTMLElement>('[data-find-group]')) {
    g.hidden = q.length > 0 && !g.querySelector('[data-find]:not([hidden])');
  }
  return shown;
}

/** The count line under the box. */
export const countText = (q: string[], shown: number): string =>
  q.length && shown ? `${shown} ${shown === 1 ? 'match' : 'matches'}` : '';
