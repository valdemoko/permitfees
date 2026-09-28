/**
 * Slug rules.
 *
 * The URL architecture puts the state segment at the root (`/texas/`), which is
 * the shortest and most keyword-relevant form but means a root-level dynamic
 * segment could in principle swallow a content route. Two guards prevent that:
 *
 *   1. Next.js gives static routes precedence over dynamic segments, so
 *      `/methodology` can never be captured by `[state]`.
 *   2. This reserved-word list is enforced against every slug we ever write, so
 *      a future editor cannot create a `/states/` state by accident.
 *
 * See SEO.md section 1 for the full evaluation of URL options.
 */

/**
 * Paths that already exist at the root, plus paths reserved for future use.
 * A slug in this list must never be used for a state, jurisdiction or page.
 */
export const RESERVED_ROOT_SLUGS: readonly string[] = [
  // Live routes
  "about",
  "author",
  "contact",
  "cookies",
  "methodology",
  "permit-fee-calculator",
  "privacy",
  "states",
  "terms",
  // Operational paths any deployment will need
  "admin",
  "api",
  "health",
  "login",
  "logout",
  "search",
  // Static assets served from the root
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  // Reserved for content classes we have deliberately not built yet
  "blog",
  "guides",
  "glossary",
  "calculators",
  "sources",
  "changelog",
  "help",
  "support",
];

const RESERVED_ROOT_SLUG_SET = new Set(RESERVED_ROOT_SLUGS);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isReservedSlug(slug: string): boolean {
  return RESERVED_ROOT_SLUG_SET.has(slug);
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

/**
 * Normalize arbitrary text into a URL slug.
 *
 * Handles the accents that appear in real US place names (no apostrophes in our
 * set, but plenty of "ñ" and "é"). `normalize("NFKD")` plus stripping combining
 * marks is the correct primitive; a hand-written replace table would miss cases.
 */
export function normalizeSlug(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export type SlugCheck =
  | { ok: true; slug: string }
  | { ok: false; reason: string };

/**
 * Validate a slug before it is written to the database.
 *
 * Called from the importer and (later) the admin surface, not from the read
 * path: a bad slug must be impossible to store, not merely handled at render.
 */
export function checkSlug(slug: string, options?: { allowReserved?: boolean }): SlugCheck {
  if (slug.length === 0) {
    return { ok: false, reason: "Slug is empty." };
  }
  if (slug.length > 96) {
    return { ok: false, reason: "Slug must be 96 characters or fewer." };
  }
  if (!isValidSlug(slug)) {
    return {
      ok: false,
      reason:
        "Slug must be lowercase letters, digits and single hyphens, with no leading or trailing hyphen.",
    };
  }
  if (!options?.allowReserved && isReservedSlug(slug)) {
    return {
      ok: false,
      reason: `"${slug}" is reserved for a route or a static asset and cannot be used as a slug.`,
    };
  }
  return { ok: true, slug };
}
