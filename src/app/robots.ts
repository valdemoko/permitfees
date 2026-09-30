import type { MetadataRoute } from "next";

import { absoluteFileUrl } from "@/lib/seo/urls";
import { site } from "@/lib/site";

/**
 * `robots.txt`.
 *
 * On a non-indexable deployment this disallows everything. A staging site that
 * blocks crawlers with `Disallow: /` is safe; one that relies on a `noindex` tag
 * still leaks URLs into the index through links. Both layers are in place: this
 * file and the per-page `robots` metadata.
 *
 * `/admin/` and `/api/` are excluded from crawling rather than relied upon to
 * secure themselves. Crawl rules are a hygiene measure, never an access control.
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.isIndexable) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    // A file, so no trailing slash: `/sitemap.xml/` redirects, and a sitemap
    // directive must point at the sitemap.
    // No `Host:` directive: ignored by Google and retired by Yandex.
    sitemap: absoluteFileUrl("/sitemap.xml"),
  };
}
