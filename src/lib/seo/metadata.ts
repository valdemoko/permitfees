import type { Metadata } from "next";

import { truncate } from "@/lib/format";
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_TARGET_LENGTH,
  TITLE_MAX_LENGTH,
  site,
} from "@/lib/site";

import { absoluteFileUrl, absoluteUrl } from "./urls";

/**
 * Metadata construction.
 *
 * Titles and descriptions are generated from real page fields, so a description
 * can never claim something the page does not contain — which is both an SEO
 * requirement and a trust requirement for a site about money.
 *
 * Deliberately absent: `keywords`. It has been ignored by search engines for
 * years, and including it would misrepresent how the pages work.
 */

const TITLE_SUFFIX = ` | ${site.shortName}`;

/** The site-wide default social-share card, served from `public/og.png`. */
const DEFAULT_OG_IMAGE_PATH = "/og.png";

/**
 * Build a complete `<title>`.
 *
 * The page supplies the primary part; the site name is appended and the whole
 * thing is bounded, so we never emit a title Google truncates mid-word.
 */
export function composeTitle(primary: string, options?: { withSiteName?: boolean }): string {
  const withSiteName = options?.withSiteName ?? true;
  if (!withSiteName) return truncate(primary, TITLE_MAX_LENGTH);

  const budget = TITLE_MAX_LENGTH - TITLE_SUFFIX.length;
  return `${truncate(primary, budget)}${TITLE_SUFFIX}`;
}

/**
 * Strip Markdown emphasis markers before a string can become metadata.
 *
 * Several stored `seoDescription`/`summary` fields are editorial prose that uses
 * `**…**` for emphasis. That reads correctly on the page (the body renders
 * Markdown), but a meta description is a plain-text field: `**103-row valuation
 * table**` would be emitted literally into `<meta>` and into the SERP snippet.
 * Only the markers are removed — the words are the writer's and stay untouched.
 */
export function stripMarkdownEmphasis(text: string): string {
  return text.replace(/\*\*/g, "");
}

/** Build a description bounded to a length search results actually display. */
export function composeDescription(text: string): string {
  const collapsed = stripMarkdownEmphasis(text).replace(/\s+/g, " ").trim();
  return truncate(collapsed, DESCRIPTION_MAX_LENGTH);
}

/**
 * Normalise a stored SEO description to what a SERP snippet displays.
 *
 * The stored `seoDescription` fields are editorial prose, and many run past the
 * ~160 characters Google shows before truncating. Rather than lengthen the
 * truncation limit (which would trade SERP completeness for a bigger budget),
 * the stored text is collapsed, stripped of Markdown emphasis and cut to the
 * display budget here, so every published page ships a snippet that renders
 * whole. The stored field is left untouched: it remains the editorial source,
 * and the page body still shows it in full where it is used.
 */
export function normalizeSeoDescription(text: string): string {
  const collapsed = stripMarkdownEmphasis(text).replace(/\s+/g, " ").trim();
  if (collapsed.length <= DESCRIPTION_TARGET_LENGTH) return collapsed;
  return truncate(collapsed, DESCRIPTION_TARGET_LENGTH);
}

/**
 * Normalise a stored SEO title to what a SERP result line displays.
 *
 * The same policy as `normalizeSeoDescription`, at the title budget: long stored
 * titles are cut on whole words rather than mid-word by the search engine.
 */
export function normalizeSeoTitle(text: string): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= TITLE_MAX_LENGTH) return collapsed;
  return truncate(collapsed, TITLE_MAX_LENGTH);
}

export type PageMetadataInput = {
  /** The complete title. Use `composeTitle` to build it. */
  title: string;
  description: string;
  /** Root-relative path. `absoluteUrl` handles slash and origin normalisation. */
  path: string;
  /**
   * Kept out of the index while remaining crawlable. Used for pages that have a
   * real purpose but do not yet meet the quality bar for search.
   */
  noindex?: boolean;
  /** `article` for editorial pieces, `website` for everything else. */
  type?: "website" | "article";
  /** ISO date from verification or review records, never the build date. */
  publishedTime?: string | null;
  modifiedTime?: string | null;
  /** Root-relative path to a social image. A file, so it is not slash-suffixed. */
  imagePath?: string;
};

export function buildMetadata(input: PageMetadataInput): Metadata {
  const url = absoluteUrl(input.path);

  // A deployment that is not marked indexable is `noindex` site-wide. Preview and
  // staging URLs must never reach the index; this is the safety rail.
  const indexable = site.isIndexable && input.noindex !== true;

  // A file, not a page: `absoluteUrl` would turn `/og.png` into `/og.png/`,
  // which resolves to nothing.
  //
  // The site-wide default is the brand OG card (`/og.png`): social shares and
  // search rich results for every page previously rendered with no image at
  // all. A page can still override it by passing its own `imagePath`.
  const images = [
    { url: absoluteFileUrl(input.imagePath ?? DEFAULT_OG_IMAGE_PATH), width: 1200, height: 630, alt: site.name },
  ];

  return {
    title: input.title,
    description: composeDescription(input.description),
    alternates: { canonical: url },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        }
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
    openGraph: {
      type: input.type ?? "website",
      title: input.title,
      description: composeDescription(input.description),
      url,
      siteName: site.name,
      locale: site.locale,
      ...(images ? { images } : {}),
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: composeDescription(input.description),
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}

/**
 * Metadata for a page that must not exist yet.
 *
 * Routes call `notFound()` in this situation, so this is the belt to that
 * braces: if a page is ever rendered without data, it is explicitly not
 * indexable rather than silently indexed as an empty shell.
 */
export function noindexMetadata(title: string, path: string): Metadata {
  return buildMetadata({
    title,
    description: "This page is not available.",
    path,
    noindex: true,
  });
}
