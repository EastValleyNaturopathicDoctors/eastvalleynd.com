/**
 * The page's main button, taken out of the body (tracker P2). For a route in
 * src/data/primary-actions.ts this finds the body's button (`.cta-inline-btn`)
 * with those words and returns the body without it, plus the link to draw in
 * the hero. The empty paragraphs WordPress left around the button go with it.
 */
import { primaryActions } from '@/data/primary-actions';

export interface PrimaryAction { href: string; label: string; newTab: boolean }

const decode = (s: string) => s.replace(/&#x26;|&amp;/gi, '&');

/** The body without the route's main button, and that button; the body untouched when there is none. */
export function takePrimaryAction(html: string, route: string): { html: string; action?: PrimaryAction } {
  const label = primaryActions[route];
  if (!html || !label) return { html };
  const re = /(?:<p>\s*<\/p>\s*)?<p class="cta-inline-btn">\s*<a\b([^>]*)>([\s\S]*?)<\/a>\s*<\/p>(?:\s*<p>\s*<\/p>)?/gi;
  for (const m of html.matchAll(re)) {
    if (m[2].replace(/<[^>]+>/g, '').trim() !== label) continue;
    const href = m[1].match(/\bhref="([^"]*)"/)?.[1];
    if (!href) continue;
    return {
      html: html.slice(0, m.index) + html.slice(m.index! + m[0].length),
      action: { href: decode(href), label, newTab: /\btarget="_blank"/.test(m[1]) },
    };
  }
  return { html };
}
