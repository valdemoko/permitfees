import type { MetadataRoute } from "next";

import { listSitemapEntries } from "@/lib/db/queries";
import { absoluteUrl, ROUTES } from "@/lib/seo/urls";
import { site } from "@/lib/site";

/**
 * Sitemap.
 *
 * Two rules it follows strictly:
 *
 * 1. **Only pages that pass the indexability gate.** The query enforces the same
 *    conditions the routes do, so the sitemap cannot advertise a `404` or a
 *    `noindex` page.
 * 2. **`lastModified` comes from review and verification dates**, never from the
 *    build. A sitemap where every entry says "modified now" on every deploy
 *    teaches crawlers to ignore the field, and it is dishonest about what changed.
 *
 * `changeFrequency` and `priority` are intentionally omitted: search engines have
 * ignored both for years, and leaving them out is more accurate than guessing.
 */

export const revalidate = 3_600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!site.isIndexable) {
    // Nothing is indexable, so advertising URLs would contradict robots.txt.
    return [];
  }

  const staticPaths: Array<{ path: string; changeFrequency: "weekly" | "monthly" }> = [
    { path: ROUTES.home, changeFrequency: "weekly" },
    { path: ROUTES.states, changeFrequency: "weekly" },
    // The calculator is one indexable URL. Its query-parameter prefill states
    // are deliberately absent: they are the same page and would be duplicates.
    { path: ROUTES.calculator, changeFrequency: "monthly" },
    { path: ROUTES.methodology, changeFrequency: "monthly" },
    { path: ROUTES.about, changeFrequency: "monthly" },
    { path: ROUTES.author, changeFrequency: "monthly" },
    { path: ROUTES.contact, changeFrequency: "monthly" },
    { path: ROUTES.privacy, changeFrequency: "monthly" },
    { path: ROUTES.terms, changeFrequency: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((entry) => ({
    url: absoluteUrl(entry.path),
    changeFrequency: entry.changeFrequency,
  }));

  const dataEntries = await listSitemapEntries();

  const dataSitemapEntries: MetadataRoute.Sitemap = dataEntries.map((entry) => ({
    url: absoluteUrl(entry.path),
    changeFrequency: "monthly",
    ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
  }));

  return [...staticEntries, ...dataSitemapEntries];
}
