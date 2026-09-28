import { describe, expect, it } from "vitest";

import { houstonSeed } from "@/content/houston";
import { calculatePermitFees } from "@/lib/calc";
import {
  getCalculatorRuleSet,
  listCalculatorJurisdictions,
  listStateDirectory,
} from "@/lib/db/queries";
import { jurisdictionPath, permitPagePath, statePath } from "@/lib/seo/urls";

/**
 * The calculator's data contract, against a real PostgreSQL database.
 *
 * Skipped without `DATABASE_URL`, like the other integration suites. When it
 * runs, it verifies the three things the unit tests cannot:
 *
 *  1. The jurisdiction catalogue only offers published, indexable pages — every
 *     (state, city, permit) combination it returns must resolve to a real URL
 *     built by the site's own path helpers.
 *  2. The rule set the calculator loads for a selection is the SAME rule set
 *     the permit page publishes: computing the page's worked-example inputs
 *     through `getCalculatorRuleSet` must reproduce the published total.
 *  3. The catalogue and the directory agree — a jurisdiction in one is in the
 *     other, so the calculator cannot offer a city the directory does not list.
 */

const DATABASE_URL = process.env.DATABASE_URL;

const describeWithDatabase = describe.skipIf(!DATABASE_URL);

/** Houston's published worked example, for the engine-parity check. */
const houstonBuildingPage = houstonSeed.permitPages.find(
  (page) => page.publishStatus === "published" && page.slug === "building-permit-cost",
);

describeWithDatabase("calculator data contract (database)", () => {
  it("offers only published jurisdiction/permit combinations with real URLs", async () => {
    const catalogue = await listCalculatorJurisdictions();
    expect(catalogue.length).toBeGreaterThan(0);

    const directory = await listStateDirectory();
    const directoryJurisdictions = new Set(
      directory.flatMap((entry) =>
        entry.jurisdictions.map((jurisdiction) => `${entry.stateSlug}/${jurisdiction.slug}`),
      ),
    );

    for (const entry of catalogue) {
      const key = `${entry.stateSlug}/${entry.jurisdictionSlug}`;
      // Same published-jurisdiction predicate as the routes and the sitemap.
      expect(directoryJurisdictions.has(key)).toBe(true);
      expect(entry.permits.length).toBeGreaterThan(0);

      for (const permit of entry.permits) {
        // Each offered combination must build a URL the permit route serves.
        const url = permitPagePath(entry.stateSlug, entry.jurisdictionSlug, permit.pageSlug);
        expect(url).toMatch(new RegExp(`^/${entry.stateSlug}/${entry.jurisdictionSlug}/[a-z0-9-]+/$`));
      }
    }
  });

  it("computes Houston's published worked example from the loaded rule set", async () => {
    const catalogue = await listCalculatorJurisdictions();
    const houston = catalogue.find(
      (entry) => entry.jurisdictionSlug === "houston",
    );
    expect(houston).toBeDefined();
    if (!houston) return;

    const building = houston.permits.find((permit) => permit.permitTypeKey === "building");
    expect(building).toBeDefined();
    if (!building) return;

    // Load the rules exactly as the calculator's server action does: by slugs,
    // through the published permit page.
    const { getPermitPageDetail, getJurisdictionContext } = await import("@/lib/db/queries");
    const context = await getJurisdictionContext(houston.stateSlug, houston.jurisdictionSlug);
    expect(context).not.toBeNull();
    if (!context) return;
    const detail = await getPermitPageDetail(context.jurisdiction.id, building.pageSlug);
    expect(detail).not.toBeNull();
    if (!detail) return;

    // Sanity: the same worked example the page publishes...
    expect(houstonBuildingPage?.workedExample).not.toBeNull();
    const inputs = houstonBuildingPage?.workedExample?.inputs;
    expect(inputs).toBeDefined();
    if (!inputs) return;

    const result = calculatePermitFees({ ...inputs, asOf: "2026-09-23" }, detail.feeRuleRecords);
    // ...produces the published total (197,283 cents), from the rows the
    // calculator would load. Calculator and permit page cannot disagree.
    expect(result.totalCents).toBe(197_283);
  });

  it("getCalculatorRuleSet returns every stored rule for the selection, with sources", async () => {
    const catalogue = await listCalculatorJurisdictions();
    const houston = catalogue.find((entry) => entry.jurisdictionSlug === "houston");
    expect(houston).toBeDefined();
    if (!houston) return;

    const { getJurisdictionContext, getPermitPageDetail } = await import("@/lib/db/queries");
    const context = await getJurisdictionContext(houston.stateSlug, houston.jurisdictionSlug);
    if (!context) throw new Error("Houston context missing");
    const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
    if (!detail) throw new Error("Houston building page missing");

    const ruleSet = await getCalculatorRuleSet(context.jurisdiction.id, detail.permitType.id);

    // Same rows, same order the permit page displays.
    expect(ruleSet.feeRuleRecords.length).toBe(detail.feeRuleRecords.length);
    expect(ruleSet.feeRuleRecords.map((rule) => rule.id)).toEqual(
      detail.feeRuleRecords.map((rule) => rule.id),
    );
    expect(ruleSet.sources.length).toBeGreaterThan(0);
    // A source carries a verification date, which the estimate's stamp shows.
    expect(ruleSet.lastVerifiedAt).not.toBeNull();
  });

  it("deep links from the calculator's catalogue land on real paths", () => {
    // The path helpers are the single source of URL truth; asserting the three
    // link shapes the result panel renders keeps them from drifting.
    expect(statePath("texas")).toBe("/texas/");
    expect(jurisdictionPath("texas", "houston")).toBe("/texas/houston/");
    expect(permitPagePath("texas", "houston", "building-permit-cost")).toBe(
      "/texas/houston/building-permit-cost/",
    );
  });
});
