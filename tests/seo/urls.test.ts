import { describe, expect, it } from "vitest";

import {
  absoluteFileUrl,
  absoluteUrl,
  canonicalUrl,
  ensureLeadingSlash,
  ensureTrailingSlash,
  isSameCanonicalPath,
  jurisdictionPath,
  permitPagePath,
  ROUTES,
  statePath,
} from "@/lib/seo/urls";

describe("path builders", () => {
  it("builds the three URL levels with a single trailing slash", () => {
    expect(statePath("texas")).toBe("/texas/");
    expect(jurisdictionPath("texas", "houston")).toBe("/texas/houston/");
    expect(permitPagePath("texas", "houston", "building-permit-cost")).toBe(
      "/texas/houston/building-permit-cost/",
    );
  });

  it("normalises messy input into exactly one canonical form", () => {
    // Every one of these must collapse to the same URL, or we would be serving
    // duplicate content.
    expect(statePath("Texas")).toBe("/texas/");
    expect(statePath("/texas")).toBe("/texas/");
    expect(statePath("/texas/")).toBe("/texas/");
    expect(statePath("//texas//")).toBe("/texas/");
    expect(permitPagePath("/Texas/", "Houston/", "/Building-Permit-Cost/")).toBe(
      "/texas/houston/building-permit-cost/",
    );
  });

  it("treats the root path as a single slash", () => {
    expect(ensureTrailingSlash("/")).toBe("/");
    expect(ensureTrailingSlash("")).toBe("/");
    expect(absoluteUrl("/")).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/`,
    );
  });

  it("adds a leading slash when one is missing", () => {
    expect(ensureLeadingSlash("texas")).toBe("/texas");
    expect(ensureLeadingSlash("/texas")).toBe("/texas");
  });

  it("keeps every static route canonical", () => {
    for (const route of Object.values(ROUTES)) {
      expect(route).toBe(ensureTrailingSlash(route.toLowerCase()));
    }
  });
});

describe("absoluteUrl", () => {
  it("prefixes the configured origin without doubling slashes", () => {
    expect(absoluteUrl("/texas/")).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/texas/`,
    );
    expect(absoluteUrl("texas")).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/texas/`,
    );
  });

  it("is identical to canonicalUrl, because there is only one canonical form", () => {
    expect(canonicalUrl("/texas/houston/")).toBe(absoluteUrl("/texas/houston/"));
  });
});

describe("absoluteFileUrl", () => {
  it("never adds a trailing slash, because a file is not a page", () => {
    // `/sitemap.xml/` answers 308 and redirects to `/sitemap.xml`, so a sitemap
    // directive built with the page helper sent crawlers to a redirect.
    expect(absoluteFileUrl("/sitemap.xml")).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
    );
    expect(absoluteFileUrl("sitemap.xml")).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
    );
    expect(absoluteFileUrl("/opengraph-image.png")).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/opengraph-image.png`,
    );
  });

  it("collapses doubled slashes without inventing a trailing one", () => {
    expect(absoluteFileUrl("//sitemap.xml")).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
    );
  });

  it("differs from absoluteUrl for exactly the file case", () => {
    expect(absoluteFileUrl("/sitemap.xml")).not.toBe(absoluteUrl("/sitemap.xml"));
    expect(absoluteUrl("/sitemap.xml")).toBe(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml/`);
  });
});

describe("isSameCanonicalPath", () => {
  it("detects paths that would produce a duplicate URL", () => {
    expect(isSameCanonicalPath("/Texas/", "texas")).toBe(true);
    expect(isSameCanonicalPath("/texas/", "/texas/houston/")).toBe(false);
  });
});
