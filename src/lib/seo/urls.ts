import { site } from "@/lib/site";

/**
 * Canonical URL construction.
 *
 * Every URL on the site is built here, and every **page** URL this module returns
 * has exactly one form: lowercase, one trailing slash, no query string.
 * Centralising this is what makes "never serve the same content on two URLs"
 * enforceable rather than aspirational.
 *
 * Files are the exception, and they have their own function: see
 * `absoluteFileUrl`.
 */

/** Static routes. Kept as a single object so nothing is ever hand-typed twice. */
export const ROUTES = {
  home: "/",
  states: "/states/",
  calculator: "/permit-fee-calculator/",
  methodology: "/methodology/",
  about: "/about/",
  author: "/author/",
  contact: "/contact/",
  privacy: "/privacy/",
  terms: "/terms/",
  cookies: "/cookies/",
} as const;

/** Adds a trailing slash if missing, leaving the root path alone. */
export function ensureTrailingSlash(path: string): string {
  if (path === "/" || path === "") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

/** Adds a leading slash if missing. */
export function ensureLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function normalizePath(path: string): string {
  const withLeading = ensureLeadingSlash(path.trim());
  const collapsed = withLeading.replace(/\/{2,}/g, "/");
  return ensureTrailingSlash(collapsed.toLowerCase());
}

/** A state hub: `/texas/` */
export function statePath(stateSlug: string): string {
  return normalizePath(stateSlug);
}

/** A jurisdiction hub: `/texas/houston/` */
export function jurisdictionPath(stateSlug: string, jurisdictionSlug: string): string {
  return normalizePath(`${stateSlug}/${jurisdictionSlug}`);
}

/** A permit or project cost page: `/texas/houston/building-permit-cost/` */
export function permitPagePath(
  stateSlug: string,
  jurisdictionSlug: string,
  pageSlug: string,
): string {
  return normalizePath(`${stateSlug}/${jurisdictionSlug}/${pageSlug}`);
}

/**
 * Absolute URL for canonical tags, Open Graph and the sitemap.
 * `site.url` is already normalised without a trailing slash.
 */
export function absoluteUrl(path: string): string {
  const normalized = normalizePath(path);
  return `${site.url}${normalized}`;
}

/** The canonical URL, which is the absolute URL by definition here. */
export function canonicalUrl(path: string): string {
  return absoluteUrl(path);
}

/**
 * Absolute URL for a **file**, not a page: the sitemap, a social image, a favicon.
 *
 * `absoluteUrl` guarantees a trailing slash because every page on this site has
 * one, and that guarantee is what keeps a single canonical form per page. A file
 * must not take one: `/sitemap.xml/` answers `308` and redirects to
 * `/sitemap.xml`, so a `Sitemap:` directive built with the page helper pointed
 * crawlers at a redirect instead of the sitemap itself.
 *
 * Discovered while verifying Houston end to end; the same mistake was latent on
 * the Open Graph image path, which had simply never been used yet.
 *
 * Paths are lowercased here as well, matching `absoluteUrl`: the origin is
 * normalised once in `site.ts` and everything after it is ASCII by construction.
 */
export function absoluteFileUrl(path: string): string {
  const withLeading = ensureLeadingSlash(path.trim());
  const collapsed = withLeading.replace(/\/{2,}/g, "/");
  return `${site.url}${collapsed.toLowerCase()}`;
}

/**
 * Whether two paths resolve to the same canonical URL.
 * Used by tests and by the redirect map to catch accidental duplicates.
 */
export function isSameCanonicalPath(left: string, right: string): boolean {
  return normalizePath(left) === normalizePath(right);
}
