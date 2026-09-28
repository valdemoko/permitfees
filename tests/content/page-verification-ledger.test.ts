import { describe, expect, it } from "vitest";

import { ALL_SEEDS } from "@/content";

/**
 * The permit-page verification ledger, pinned across the whole dataset.
 *
 * The route gate reads a page's `lastVerifiedAt` exclusively from
 * `verification_records` rows of type `permit_page`. A published page without
 * one is a page that exists in the sitemap and 404s at runtime — the exact
 * defect this test exists to prevent from recurring. (Nine jurisdictions were
 * seeded without these rows in the first release; the gate only surfaces the
 * gap at request time, so the dataset has to enforce it here.)
 *
 * The seeder resolves a `permit_page` verification by `permitTypeKey`, not by
 * `entityKey` — so the completeness check binds on `permitTypeKey`, matching
 * what the pipeline actually does. The `entityKey` itself is informational and
 * appears in two conventions across the dataset: the bare page slug
 * (`building-permit-cost`) and a composite (`<jurisdiction>:<type>:<slug>`),
 * so the reference check accepts either.
 */

describe("permit page verification ledger", () => {
  it("every published, indexable page has a permit_page verification", () => {
    for (const seed of ALL_SEEDS) {
      const verifiedTypes = new Set(
        seed.verifications
          .filter((verification) => verification.entityType === "permit_page")
          .map((verification) => verification.permitTypeKey),
      );
      for (const page of seed.permitPages) {
        if (page.publishStatus !== "published" || page.noindex) continue;
        expect(
          verifiedTypes.has(page.permitTypeKey),
          `${seed.jurisdiction.key}/${page.slug} (type ${page.permitTypeKey}) is published but has no permit_page verification — the route gate will 404 it`,
        ).toBe(true);
      }
    }
  });

  it("every permit_page verification binds to a real page and names it consistently", () => {
    for (const seed of ALL_SEEDS) {
      const byType = new Map(
        seed.permitPages.map((page) => [page.permitTypeKey, page]),
      );
      for (const verification of seed.verifications) {
        if (verification.entityType !== "permit_page") continue;
        const page = verification.permitTypeKey
          ? byType.get(verification.permitTypeKey)
          : undefined;
        expect(
          page,
          `${seed.jurisdiction.key} verification cites unknown permit type "${verification.permitTypeKey}"`,
        ).toBeDefined();
        if (!page) continue;
        // Either the bare slug or the composite "<jur>:<type>:<slug>".
        const consistent =
          verification.entityKey === page.slug ||
          verification.entityKey.endsWith(`:${page.slug}`);
        expect(
          consistent,
          `${seed.jurisdiction.key} verification entityKey "${verification.entityKey}" does not name page "${page.slug}"`,
        ).toBe(true);
      }
    }
  });
});
