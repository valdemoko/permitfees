/**
 * Site-wide configuration.
 *
 * Safe to import from both server and client components: it only reads
 * `NEXT_PUBLIC_*` variables, which Next.js inlines at build time. Anything
 * secret belongs in `lib/env.ts`, which is server-only.
 */

/** Maximum length we target for a `<title>`, before the template suffix. */
export const TITLE_TARGET_LENGTH = 60;
export const TITLE_MAX_LENGTH = 65;
export const DESCRIPTION_TARGET_LENGTH = 155;
export const DESCRIPTION_MAX_LENGTH = 165;

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidate = raw && raw.length > 0 ? raw : "http://localhost:3000";
  // Canonical URLs are always built without a trailing slash and appended by
  // `absoluteUrl`, so normalise the configured origin once, here.
  return candidate.replace(/\/+$/, "");
}

export const site = {
  name: "PermitFees",
  shortName: "PermitFees",
  url: resolveSiteUrl(),
  locale: "en-US",
  currency: "USD" as const,

  /**
   * A deployment is `noindex` site-wide unless this is explicitly "true".
   * Preview and staging URLs leaking into the index is one of the most damaging
   * and most avoidable SEO accidents, so the safe default is "do not index".
   */
  isIndexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",

  /** ISR window for data-backed routes. Content is curated, not a live feed. */
  revalidateSeconds: 3_600,

  /**
   * How long a verification stays "fresh". Past this, a page is flagged for
   * re-verification and says so, rather than presenting stale data as current.
   */
  verificationFreshnessDays: 120,

  /** Longest a permit-fee page may go without review before it is flagged. */
  permitPageReviewDays: 180,

  descriptions: {
    home: "Official fee schedules from city and county permit departments, turned into transparent permit cost estimates — with the source and the date we checked it.",
    methodology:
      "How PermitFees sources permit fee data, how the calculations work, and the limits of an estimate.",
    about:
      "Who publishes PermitFees, what it covers, and what it deliberately does not do.",
    contact: "Report an error, suggest a jurisdiction, or ask a question about our data.",
    privacy: "What this site collects, what it does not collect, and how to ask us to remove it.",
    terms: "The terms that apply when you use PermitFees.",
    cookies:
      "What cookies this site uses — today, none — and how cookies are handled if that changes.",
  },

  /** Shown wherever a calculated number appears. */
  disclaimers: {
    notOfficial:
      "PermitFees is an independent reference. It is not affiliated with, endorsed by, or operated by any city, county, state or federal agency.",
    estimate:
      "This is an estimate calculated from the published fee schedule. The permit office’s own calculation is the one that applies.",
    notLegalAdvice:
      "This information is general and is not legal, engineering or design advice for a specific project.",
  },
} as const;

export type SiteConfig = typeof site;
