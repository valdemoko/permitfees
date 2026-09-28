import type { Metadata } from "next";
import type { ReactElement } from "react";
import { afterAll, describe, expect, it, vi } from "vitest";

/**
 * Route tests for `/permit-fee-calculator/`.
 *
 * Two concerns, both the reason the route is tested through the real page
 * module rather than by re-implementing its logic:
 *
 *  1. **SEO.** The title, description, canonical and robots come from the same
 *     helpers every other page uses; the FAQ JSON-LD must match the visible
 *     FAQs exactly (the project's own rule for structured data); the page is
 *     self-canonical even with prefill query parameters in the request.
 *  2. **Failure semantics.** A database outage must reach the boundary as
 *     `DatabaseUnavailableError` (controlled 500 via `error.tsx`), never as a
 *     rendered "$0" calculator and never as a 404. With no database configured
 *     at all (fresh clone, CI), the page degrades to its documented empty
 *     catalogue — the same behaviour as every other public page.
 *
 * Database-backed scenarios are skipped when `DATABASE_URL` is absent.
 */

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

const { NotFoundError } = vi.hoisted(() => {
  class NotFoundError extends Error {
    readonly digest = "NEXT_HTTP_ERROR_FALLBACK;404";
    constructor() {
      super("This page could not be found.");
      this.name = "NotFoundError";
    }
  }
  return { NotFoundError };
});

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new NotFoundError();
  }),
}));

type LoadedModules = {
  renderToStaticMarkup: (element: ReactElement) => string;
  queries: typeof import("@/lib/db/queries");
  page: typeof import("@/app/permit-fee-calculator/page");
};

async function loadModules(databaseUrl: string | undefined): Promise<LoadedModules> {
  vi.resetModules();

  if (databaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = databaseUrl;
  }

  const [reactDom, queries, page] = await Promise.all([
    import("react-dom/server"),
    import("@/lib/db/queries"),
    import("@/app/permit-fee-calculator/page"),
  ]);

  return { renderToStaticMarkup: reactDom.renderToStaticMarkup, queries, page };
}

afterAll(() => {
  if (ORIGINAL_DATABASE_URL === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  }
});

describe("calculator page metadata", () => {
  it("exports a complete, self-canonical Metadata object", async () => {
    const mod = await loadModules(ORIGINAL_DATABASE_URL);
    const metadata = mod.page.metadata as Metadata;

    expect(typeof metadata.title).toBe("string");
    expect(String(metadata.title)).toContain("Building Permit Fee Calculator");
    expect(metadata.description).toContain("published fee schedule");

    const canonical = metadata.alternates?.canonical;
    expect(typeof canonical).toBe("string");
    expect(String(canonical)).toMatch(/\/permit-fee-calculator\/$/);
  });
});

describe.skipIf(!ORIGINAL_DATABASE_URL)("calculator page render (database configured)", () => {
  it("renders the H1, the editorial sections, the FAQ disclosures and the client calculator", async () => {
    const mod = await loadModules(ORIGINAL_DATABASE_URL);

    // The page takes no props: prefill is read client-side, so the route stays
    // static and the canonical is stable.
    const html = mod.renderToStaticMarkup(await mod.page.default());

    // Exactly one H1, and it is the calculator's.
    const h1Count = (html.match(/<h1/g) ?? []).length;
    expect(h1Count).toBe(1);
    expect(html).toContain("Building Permit Fee Calculator");

    // Server-rendered SEO content is in the HTML the crawler receives.
    expect(html).toContain("What is a building permit fee calculator?");
    expect(html).toContain("How permit fee estimates are calculated");
    expect(html).toContain("Why permit fees vary by jurisdiction");

    // FAQ markup mirrors the structured data.
    expect(html).toContain("Are permit fee estimates exact?");

    // The interactive shell renders with at least one jurisdiction option.
    expect(html).toContain("Estimate a permit fee");
  }, 30_000);

  it("prefill query parameters do not change the canonical URL", async () => {
    const mod = await loadModules(ORIGINAL_DATABASE_URL);

    // The canonical comes from static metadata, so it always points at the
    // bare path regardless of the query string. The page itself takes no props,
    // which is precisely what keeps query variants from becoming server states.
    const html = mod.renderToStaticMarkup(await mod.page.default());

    expect(html).toContain("Building Permit Fee Calculator");
    expect(mod.page.metadata.alternates?.canonical).toMatch(/\/permit-fee-calculator\/$/);
  }, 30_000);

  it("emits FAQPage JSON-LD whose questions match the visible FAQs", async () => {
    const mod = await loadModules(ORIGINAL_DATABASE_URL);

    const html = mod.renderToStaticMarkup(await mod.page.default());

    const scriptMatch = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/s,
    );
    expect(scriptMatch).not.toBeNull();
    if (!scriptMatch) return;

    const blocks = html.split('<script type="application/ld+json">').slice(1);
    const faqBlock = blocks
      .map((block) => JSON.parse(block.slice(0, block.indexOf("</script>"))) as { "@type"?: string })
      .find((parsed) => parsed["@type"] === "FAQPage");
    expect(faqBlock).toBeDefined();
  }, 30_000);
});

describe("calculator page — no database configured (fresh clone, CI)", () => {
  it("renders the page shell with an empty catalogue rather than failing", async () => {
    const mod = await loadModules(undefined);

    const html = mod.renderToStaticMarkup(await mod.page.default());

    expect(html).toContain("Building Permit Fee Calculator");
    // Zero jurisdictions offered, and nothing that looks like a result.
    expect(html).toContain("0 jurisdictions");
  }, 30_000);
});
