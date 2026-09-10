/**
 * The navigation tree, and the handful of operations every consumer needs.
 *
 * `nav.json` is generated from the audit's New Sitemap by
 * `extract/build_pages.py` and is read by the header, the section indexes,
 * breadcrumbs on every content page, `/services/`, `/conditions/` and `/404/`.
 * Before this module each of them declared its own `NavNode` type and its own
 * `norm()`, and walked the tree by hand — six copies of the same three ideas.
 */
import navJson from '@/data/nav.json';

export type NavNode = {
  label: string;
  href: string;
  inMenu: boolean;
  children: NavNode[];
};

export const nav = navJson as NavNode[];

/**
 * Compare hrefs without tripping over the trailing slash. The site runs
 * `trailingSlash: 'always'`, but `Astro.url.pathname` is not guaranteed to
 * carry one, so every comparison has to normalise both sides.
 */
export const norm = (href: string): string => href.replace(/\/+$/, '') || '/';

export const isSame = (a: string, b: string): boolean => norm(a) === norm(b);

/** Depth-first walk over the whole tree. */
export function* walk(nodes: NavNode[] = nav): Generator<NavNode> {
  for (const node of nodes) {
    yield node;
    yield* walk(node.children);
  }
}

/** The node for a path, or undefined. */
export function find(path: string, nodes: NavNode[] = nav): NavNode | undefined {
  for (const node of walk(nodes)) {
    if (isSame(node.href, path)) return node;
  }
  return undefined;
}

/**
 * The path from the top of the tree down to `path`, inclusive — the breadcrumb.
 * Empty when the path is not in the tree, which is the normal case for a blog
 * post or a hand-written page.
 */
export function trail(path: string, nodes: NavNode[] = nav): NavNode[] {
  const search = (level: NavNode[], acc: NavNode[]): NavNode[] | null => {
    for (const node of level) {
      const next = [...acc, node];
      if (isSame(node.href, path)) return next;
      const deeper = search(node.children, next);
      if (deeper) return deeper;
    }
    return null;
  };
  return search(nodes, []) ?? [];
}

/** Is `path` this node, or anywhere beneath it? Drives the active nav state. */
export function contains(node: NavNode, path: string): boolean {
  return isSame(node.href, path) || node.children.some((c) => contains(c, path));
}

/** The children of a section, for the index cards and the mega menu. */
export function childrenOf(path: string): NavNode[] {
  return find(path)?.children ?? [];
}
