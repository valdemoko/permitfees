import { sql, type SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { ALL_SEEDS } from "@/content";
import { phoenixSeed } from "@/content/phoenix";
import { scottsdaleSeed } from "@/content/scottsdale";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import { isWithinEffectiveWindow } from "@/lib/dates";
import { getDb } from "@/lib/db/client";
import {
  getJurisdictionContext,
  getPermitPageDetail,
  listPermitPages,
  listSitemapEntries,
} from "@/lib/db/queries";
import { evaluatePublishability } from "@/lib/editorial";
import { currentIsoDate } from "@/lib/time";

/**
 * Phoenix, end to end, against a real PostgreSQL database.
 *
 * Skipped unless `DATABASE_URL` is set. When it runs it answers what a fixture
 * cannot: whether the first jurisdiction *outside Texas* resolves through the same
 * query layer, whether it introduced a state and a county without duplicating the
 * permit catalogue, and — the check worth the file — whether the engine, reading
 * the *stored* rules, reproduces Table A's seven published rows and the City's own
 * worked example, including the plan review percentage that depends on its own
 * permit fee.
 */

const DATABASE_URL = process.env.DATABASE_URL;
const db = getDb();

const describeWithDatabase = describe.skipIf(!DATABASE_URL);

async function rawRows<T>(query: SQL): Promise<T[]> {
  if (!db) return [];
  const result: unknown = await db.execute(query);
  if (Array.isArray(result)) return result as T[];
  const envelope = result as { rows?: unknown };
  return Array.isArray(envelope.rows) ? (envelope.rows as T[]) : [];
}

const asOf = currentIsoDate();
const cents = (value: number): string => `$${(value / 100).toFixed(2)}`;

describeWithDatabase("Phoenix — database", () => {
  it("resolves the first non-Texas jurisdiction through the query layer", async () => {
    const context = await getJurisdictionContext("arizona", "phoenix");

    expect(context).not.toBeNull();
    expect(context?.state.code).toBe("AZ");
    expect(context?.jurisdiction.slug).toBe("phoenix");
    expect(context?.jurisdiction.officialName).toBe("City of Phoenix");
    expect(context?.sources.length).toBe(phoenixSeed.sources.length);
    expect(context?.profile?.lastReviewedAt).toBe(phoenixSeed.profile.lastReviewedAt);
    expect(context?.profile?.headline).toContain("Phoenix");
  });

  it("adds Arizona and Maricopa County without duplicating the permit catalogue", async () => {
    const states = await rawRows<{ code: string; n: number }>(
      sql`select s.code, count(j.id)::int as n
          from states s left join jurisdictions j on j.state_id = s.id
          group by 1 order by 1`,
    );
    expect(states.map((row) => row.code).sort()).toEqual(
      [...new Set(ALL_SEEDS.map((seed) => seed.state.code))].sort(),
    );
    // Derived from the payloads rather than fixed: Phoenix opened Arizona and
    // Scottsdale is the second city in it, so the count belongs to whoever else
    // lands in the state rather than to this test.
    const arizonaCities = new Set(
      [phoenixSeed, scottsdaleSeed].map((seed) => seed.jurisdiction.key),
    ).size;
    expect(states.find((row) => row.code === "AZ")?.n).toBe(arizonaCities);

    const permitTypes = await rawRows<{ key: string; n: number }>(
      sql`select key, count(*)::int as n from permit_types group by 1 order by 1`,
    );
    for (const row of permitTypes) {
      expect(row.n, `permit type ${row.key} exists more than once`).toBe(1);
    }
    // Phoenix defines no permit types of its own; these are Houston's five.
    expect(permitTypes.map((row) => row.key).sort()).toEqual([
      "building",
      "demolition",
      "electrical",
      "mechanical",
      "plumbing",
    ]);
  });

  describe("published pages", () => {
    it("serves exactly the three pages the payload publishes", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      expect(context).not.toBeNull();
      if (!context) return;

      const pages = await listPermitPages(context.jurisdiction.id);
      expect(pages.map((page) => page.slug).sort()).toEqual([
        "building-permit-cost",
        "electrical-permit-cost",
        "plumbing-permit-cost",
      ]);
    });

    it("404s every page Phoenix does not publish", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      expect(context).not.toBeNull();
      if (!context) return;

      // Mechanical is the one trade Phoenix prices nothing for beyond periodic
      // inspections, so it has no page and must not resolve.
      for (const slug of [
        "mechanical-permit-cost",
        "demolition-permit-cost",
        "solar-permit-cost",
      ]) {
        const detail = await getPermitPageDetail(context.jurisdiction.id, slug);
        expect(detail, `${slug} resolved but should not`).toBeNull();
      }
    });

    it("passes the editorial gate on the data PostgreSQL actually returned", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      expect(context).not.toBeNull();
      if (!context) return;

      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      expect(detail).not.toBeNull();
      if (!detail) return;

      const active = detail.feeRuleRecords.filter(
        (rule) =>
          rule.status === "active" && isWithinEffectiveWindow(asOf, rule.effectiveFrom, rule.effectiveTo),
      );

      const gate = evaluatePublishability({
        publishStatus: detail.page.publishStatus,
        noindex: detail.page.noindex,
        intro: detail.page.intro,
        localSummary: detail.page.localSummary,
        sourceCount: detail.sources.length,
        feeRuleCount: active.length,
        lastVerifiedAt: detail.lastVerifiedAt,
        faqCount: Array.isArray(detail.page.faqs) ? detail.page.faqs.length : 0,
        asOf,
      });

      expect(gate.failures, gate.failures.join("; ")).toEqual([]);
      expect(gate.indexable).toBe(true);
      expect(active.length).toBeGreaterThan(0);
    });
  });

  describe("the arithmetic, from the stored rules", () => {
    it("stores rules the engine can compute", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      expect(context).not.toBeNull();
      if (!context) return;

      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      expect(detail).not.toBeNull();
      if (!detail) return;

      // Counted per permit type: Table A is shared with the two trade permit types, so
      // the payload's row count is not the building page's rule count.
      const buildingRules = phoenixSeed.feeRules.filter(
        (entry) => entry.permitTypeKey === "building",
      );
      expect(detail.feeRuleRecords.length).toBe(buildingRules.length);
      for (const rule of detail.feeRuleRecords) {
        const validation = validateFeeRule(rule);
        expect(validation.ok, `${rule.code}: ${validation.ok ? "" : validation.error}`).toBe(true);
      }
    });

    it("stores the trade rules, and they compute", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      if (!context) return;

      for (const [slug, expectedCodes] of [
        ["electrical-permit-cost", ["TABLE-A", "METER-ELECTRIC-ADDITIONAL", "TEMPORARY-POWER", "REINSPECTION"]],
        ["plumbing-permit-cost", ["TABLE-A", "METER-GAS-WATER-ADDITIONAL", "BACKFLOW-DEVICES", "REINSPECTION"]],
      ] as const) {
        const detail = await getPermitPageDetail(context.jurisdiction.id, slug);
        expect(detail, slug).not.toBeNull();
        if (!detail) continue;

        expect(detail.feeRuleRecords.map((rule) => rule.code).sort(), slug).toEqual(
          [...expectedCodes].sort(),
        );
        for (const rule of detail.feeRuleRecords) {
          const validation = validateFeeRule(rule);
          expect(validation.ok, `${rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
            true,
          );
        }
      }
    });

    it("computes the two trade worked examples from the stored rules", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      if (!context) return;

      const electrical = await getPermitPageDetail(
        context.jurisdiction.id,
        "electrical-permit-cost",
      );
      if (!electrical) return;
      expect(
        calculatePermitFees(
          {
            asOf,
            valuationCents: 1_800_000,
            workType: "new_construction",
            occupancy: "commercial",
            custom: { meters: 3, temporary_power: true },
          },
          electrical.feeRuleRecords,
        ).totalCents,
      ).toBe(77_400); // $383 + $196 + $195

      const plumbing = await getPermitPageDetail(
        context.jurisdiction.id,
        "plumbing-permit-cost",
      );
      if (!plumbing) return;
      expect(
        calculatePermitFees(
          {
            asOf,
            valuationCents: 4_000_000,
            workType: "new_construction",
            occupancy: "commercial",
            custom: { meters: 3, backflow_devices: 3 },
          },
          plumbing.feeRuleRecords,
        ).totalCents,
      ).toBe(119_000); // $603 + $196 + $391
    });

    it("includes one meter of each type, from the rules PostgreSQL returned", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "electrical-permit-cost");
      if (!detail) return;

      const meterFee = (count: number) =>
        calculatePermitFees({ asOf, custom: { meters: count } }, detail.feeRuleRecords).totalCents;

      expect(meterFee(1)).toBe(0);
      expect(meterFee(3)).toBe(19_600);
    });

    it("reproduces Table A's published rows", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      if (!detail) return;

      const rows: Array<[number, number]> = [
        [1_000, 19_500],
        [10_000, 30_300],
        [50_000, 70_300],
        [200_000, 205_300],
        [1_000_000, 925_300],
        [10_000_000, 5_425_300],
      ];

      for (const [valuation, expected] of rows) {
        const result = calculatePermitFees(
          { asOf, valuationCents: valuation * 100 },
          detail.feeRuleRecords,
        );
        const base = result.components.find((component) => component.code === "TABLE-A");
        expect(base?.amountCents, `$${valuation.toLocaleString("en-US")}`).toBe(expected);
      }
    });

    it("reproduces the City's own worked example to the cent", async () => {
      const context = await getJurisdictionContext("arizona", "phoenix");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      if (!detail) return;

      // "assuming a total project valuation of $250,500: $2,053 base fee plus $459
      // (51 x $9) ... Total permit fee cost of $2,512".
      const result = calculatePermitFees(
        { asOf, valuationCents: 25_050_000, workType: "new_construction" },
        detail.feeRuleRecords,
      );

      const base = result.components.find((component) => component.code === "TABLE-A");
      const review = result.components.find((component) => component.code === "PLAN-REVIEW-80");

      expect(base?.amountCents).toBe(251_200);
      expect(cents(base?.amountCents ?? 0)).toBe("$2512.00");
      expect(review?.amountCents).toBe(200_960);
      expect(result.totalCents).toBe(452_160);
    });

    it("computes every published worked example from its own stored inputs", async () => {
      // The stored example carries inputs only; the amount is produced here, so a
      // figure on the page cannot outlive the rule that made it.
      const context = await getJurisdictionContext("arizona", "phoenix");
      if (!context) return;

      for (const page of phoenixSeed.permitPages) {
        if (!page.workedExample) continue;
        const detail = await getPermitPageDetail(context.jurisdiction.id, page.slug);
        expect(detail).not.toBeNull();
        if (!detail) continue;

        const result = calculatePermitFees(
          { ...page.workedExample.inputs, asOf },
          detail.feeRuleRecords,
        );
        expect(result.components.length, page.slug).toBeGreaterThan(0);
        expect(result.totalCents, page.slug).toBeGreaterThan(0);
      }
    });
  });

  it("lists Arizona's pages in the sitemap and none it does not publish", async () => {
    const entries = await listSitemapEntries();
    const paths = entries.map((entry) => entry.path);

    expect(paths).toContain("/arizona/");
    expect(paths).toContain("/arizona/phoenix/");
    expect(paths).toContain("/arizona/phoenix/building-permit-cost/");

    expect(paths).toContain("/arizona/phoenix/electrical-permit-cost/");
    expect(paths).toContain("/arizona/phoenix/plumbing-permit-cost/");

    for (const absent of ["/arizona/phoenix/mechanical-permit-cost/"]) {
      expect(paths, `${absent} should not be advertised`).not.toContain(absent);
    }
  });
});
