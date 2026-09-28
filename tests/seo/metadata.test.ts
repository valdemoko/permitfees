import { afterEach, describe, expect, it, vi } from "vitest";

import {
  breadcrumbJsonLd,
  faqJsonLd,
  serializeJsonLd,
  webPageJsonLd,
} from "@/lib/seo/jsonld";
import { buildMetadata, composeDescription, composeTitle, normalizeSeoDescription, normalizeSeoTitle } from "@/lib/seo/metadata";
import { ALL_PUBLISHED_PERMIT_PAGES } from "@/content";
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, site } from "@/lib/site";

describe("composeTitle", () => {
  it("appends the site name", () => {
    expect(composeTitle("Building permit cost in Houston, TX")).toBe(
      "Building permit cost in Houston, TX | PermitFees",
    );
  });

  it("never exceeds the title budget, even for a long subject", () => {
    const title = composeTitle("A".repeat(200));
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
  });

  it("omits the site name when asked, for pages that carry their own", () => {
    expect(composeTitle("Construction permit costs from official fee schedules", {
      withSiteName: false,
    })).toBe("Construction permit costs from official fee schedules");
  });
});

describe("composeDescription", () => {
  it("collapses whitespace", () => {
    expect(composeDescription("  one   two \n three  ")).toBe("one two three");
  });

  it("bounds the length", () => {
    expect(composeDescription("word ".repeat(200)).length).toBeLessThanOrEqual(
      DESCRIPTION_MAX_LENGTH,
    );
  });
});

describe("normalizeSeoDescription", () => {
  it("passes a stored description through unchanged when it fits the display budget", () => {
    const stored = "Houston building permit fees are set by project valuation across nine brackets. See the official source.";
    expect(normalizeSeoDescription(stored)).toBe(stored);
  });

  it("cuts a long stored description to the display budget on whole words", () => {
    const stored = "word ".repeat(60).trim();
    const normalised = normalizeSeoDescription(stored);
    expect(normalised.length).toBeLessThanOrEqual(155);
    expect(normalised.endsWith("…")).toBe(true);
  });

  it("collapses stored multi-paragraph prose into one line", () => {
    expect(normalizeSeoDescription("one\n\ntwo  three")).toBe("one two three");
  });

  it("keeps every published seed description inside the display budget", () => {
    for (const { seed, page } of ALL_PUBLISHED_PERMIT_PAGES) {
      if (!page.seoDescription) continue;
      const normalised = normalizeSeoDescription(page.seoDescription);
      expect(
        normalised.length,
        `${seed.jurisdiction.slug}/${page.slug} seoDescription`,
      ).toBeLessThanOrEqual(155);
    }
  });
});

describe("normalizeSeoTitle", () => {
  it("passes a stored title through unchanged when it fits", () => {
    const stored = "Houston building permit cost";
    expect(normalizeSeoTitle(stored)).toBe(stored);
  });

  it("cuts a long stored title on whole words", () => {
    const normalised = normalizeSeoTitle("A".repeat(30) + " " + "B".repeat(200));
    expect(normalised.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
  });

  it("keeps every published seed title inside the title budget", () => {
    for (const { seed, page } of ALL_PUBLISHED_PERMIT_PAGES) {
      if (!page.seoTitle) continue;
      const normalised = normalizeSeoTitle(page.seoTitle);
      expect(normalised.length, `${seed.jurisdiction.slug}/${page.slug} seoTitle`).toBeLessThanOrEqual(
        TITLE_MAX_LENGTH,
      );
    }
  });
});

describe("buildMetadata", () => {
  const metadata = buildMetadata({
    title: "Building permit cost in Houston, TX | PermitFees",
    description: "A description.",
    path: "/texas/houston/building-permit-cost/",
  });

  it("sets an absolute canonical URL with a trailing slash", () => {
    expect(metadata.alternates?.canonical).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/texas/houston/building-permit-cost/`,
    );
  });

  it("normalises a path given without a trailing slash", () => {
    const normalized = buildMetadata({
      title: "T",
      description: "D",
      path: "/texas/houston",
    });
    expect(normalized.alternates?.canonical).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/texas/houston/`,
    );
  });

  it("marks the page noindex when the deployment is not indexable", async () => {
    // The default (no env var) is "not indexable", which is the production-safe
    // default we want to assert: a build without the flag must not be indexed.
    delete process.env.NEXT_PUBLIC_SITE_INDEXABLE;
    vi.resetModules();
    // Re-evaluate the site module so it picks up the unset env var and the
    // production-safe false default is what we assert. Rebuild the metadata from
    // the fresh site, because the module-level `metadata` was computed against
    // the indexable deployment and would not reflect this case.
    const { site: freshSite } = await import("@/lib/site");
    expect(freshSite.isIndexable).toBe(false);
    const { buildMetadata } = await import("@/lib/seo/metadata");
    const freshMetadata = buildMetadata({
      title: "Building permit cost in Houston, TX | PermitFees",
      description: "A description.",
      path: "/texas/houston/building-permit-cost/",
    });
    expect(freshMetadata.robots).toMatchObject({ index: false });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_INDEXABLE;
    vi.resetModules();
  });

  it("keeps a page crawlable even when it is not indexable", () => {
    expect(metadata.robots).toMatchObject({ follow: true });
  });

  it("carries Open Graph and Twitter data", () => {
    expect(metadata.openGraph).toMatchObject({
      title: "Building permit cost in Houston, TX | PermitFees",
      siteName: site.name,
      locale: site.locale,
    });
    // Every page carries the site-wide default OG card, so shares always have
    // a large image and the Twitter card is always the large variant.
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("falls back to the default OG card rather than linking to nothing", () => {
    expect(metadata.openGraph).toHaveProperty("images");
    const images = metadata.openGraph?.images as Array<{ url: string }> | undefined;
    expect(images?.[0]?.url).toContain("/og.png");
  });
});

describe("structured data", () => {
  it("numbers breadcrumb items from one, in order", () => {
    const jsonLd = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Texas", path: "/texas/" },
      { name: "Houston", path: "/texas/houston/" },
    ]);

    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd["itemListElement"]).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Texas",
        item: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/texas/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Houston",
        item: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/texas/houston/`,
      },
    ]);
  });

  it("returns null for FAQ markup when there are no FAQs", () => {
    // An empty FAQPage declares structure the page does not have.
    expect(faqJsonLd([])).toBeNull();
    expect(faqJsonLd([{ question: "  ", answer: "answer" }])).toBeNull();
  });

  it("builds FAQ markup from real entries", () => {
    const jsonLd = faqJsonLd([{ question: "Do I need one?", answer: "Usually." }]);
    expect(jsonLd?.["@type"]).toBe("FAQPage");
    expect(jsonLd?.["mainEntity"]).toEqual([
      {
        "@type": "Question",
        name: "Do I need one?",
        acceptedAnswer: { "@type": "Answer", text: "Usually." },
      },
    ]);
  });

  it("omits optional dates rather than sending null", () => {
    const jsonLd = webPageJsonLd({ title: "T", description: "D", path: "/texas/" });
    expect(jsonLd).not.toHaveProperty("dateModified");
    expect(jsonLd).not.toHaveProperty("datePublished");
  });

  it("includes a date only when a real review date exists", () => {
    const jsonLd = webPageJsonLd({
      title: "T",
      description: "D",
      path: "/texas/",
      dateModified: "2026-09-01",
    });
    expect(jsonLd["dateModified"]).toBe("2026-09-01");
  });

  it("escapes markup so a value cannot break out of the script tag", () => {
    const serialized = serializeJsonLd(
      webPageJsonLd({
        title: "Closing </script><script>alert(1)</script>",
        description: "D",
        path: "/texas/",
      }),
    );
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c");
  });
});
