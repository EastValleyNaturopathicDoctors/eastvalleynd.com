/**
 * Icons: Material Symbols, rounded, filled (D111).
 *
 * One icon system for the whole site, read at build time from the
 * `@material-symbols/svg-400` package (Apache-2.0, ~3,900 symbols) and
 * inlined as SVG. Nothing is drawn by hand and nothing loads at runtime.
 *
 * `ALIASES` keeps the short names the components have always used
 * ("phone", "leaf", "arrow-right"); any Material Symbols name works directly
 * ("neurology", "vital_signs"). The tile grids the content pipeline emits
 * (`data-icon="…"`, see extract/wpclean.py) are resolved the same way.
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const DIR = path.join(path.dirname(require.resolve('@material-symbols/svg-400/package.json')), 'rounded');

export const ALIASES: Record<string, string> = {
  'arrow-right': 'arrow_forward',
  'arrow-up-right': 'arrow_outward',
  'chevron-down': 'keyboard_arrow_down',
  leaf: 'eco',
  drop: 'water_drop',
  vial: 'science',
  syringe: 'syringe',
  sun: 'sunny',
  brain: 'neurology',
  oxygen: 'air',
  wave: 'airwave',
  hand: 'waving_hand',
  flask: 'experiment',
  spark: 'flare',
  infinity: 'all_inclusive',
  bolt: 'bolt',
  scale: 'balance',
  sparkle: 'star_shine',
  phone: 'call',
  calendar: 'calendar_month',
  search: 'search',
  menu: 'menu',
  close: 'close',
  plus: 'add',
  minus: 'remove',
  play: 'play_arrow',
  check: 'check',
  stetho: 'stethoscope',
  heart: 'favorite',
  ai: 'network_intelligence',
  send: 'send',
  map: 'map',
  pin: 'location_on',
  message: 'chat_bubble',
  clock: 'schedule',
};

const cache = new Map<string, string | null>();

/** The symbol's drawing (its <path>s) in the 960-unit Material box, or null. */
export function symbolBody(name: string): string | null {
  const symbol = ALIASES[name] ?? name;
  if (cache.has(symbol)) return cache.get(symbol)!;
  const file = path.join(DIR, `${symbol}-fill.svg`);
  let body: string | null = null;
  if (existsSync(file)) {
    const svg = readFileSync(file, 'utf8');
    body = svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>')).trim();
  }
  cache.set(symbol, body);
  return body;
}

export function iconSvg(name: string, size = 24, cls = ''): string {
  const body = symbolBody(name);
  if (!body) return '';
  return `<svg${cls ? ` class="${cls}"` : ''} width="${size}" height="${size}" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" focusable="false">${body}</svg>`;
}

/**
 * Turn the pipeline's tile links (`<a href data-icon="x">Label</a>` inside
 * `ul.wp-tilegrid`) into icon + label. The grid is navigation, so it is fenced
 * from the search index like the layout's own card grids.
 */
export function injectTileIcons(html: string): string {
  if (!html.includes('wp-tilegrid')) return html;
  return html
    .replace(/<ul class="wp-tilegrid">/g, '<ul class="wp-tilegrid" data-pagefind-ignore>')
    .replace(/<a href="([^"]+)" data-icon="([a-z0-9_]+)">([^<]*)<\/a>/g, (_m, href, icon, label) =>
      `<a href="${href}"><span class="wp-tile-icon">${iconSvg(icon, 22)}</span><span class="wp-tile-label">${label}</span></a>`);
}
