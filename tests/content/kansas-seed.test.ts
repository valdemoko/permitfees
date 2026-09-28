import { describe, expect, it } from "vitest";

import { overlandParkSeed } from "@/content/overlandpark";
import { wichitaSeed } from "@/content/wichita";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

/** The active rules a page's worked example computes from, in the engine's shape. */
function activeRules(seed: typeof wichitaSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof wichitaSeed, permitTypeKey: string) {
  const page = seed.permitPages.find(
    (p) => p.publishStatus === "published" && p.permitTypeKey === permitTypeKey,
  );
  if (!page || !page.workedExample) return null;
  const input: CalculationInput = {
    asOf: AS_OF,
    ...(page.workedExample.inputs as Partial<CalculationInput>),
  };
  return calculatePermitFees(input, activeRules(seed, permitTypeKey));
}

describe("Kansas Seeds — Wichita and Overland Park", () => {
  describe("Wichita, KS (MABCD)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of wichitaSeed.feeRules) {
        const validation = validateFeeRule(entry.rule);
        expect(
          validation.ok,
          `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
        ).toBe(true);
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(wichitaSeed.permitPages).toHaveLength(3);
      for (const page of wichitaSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: wichitaSeed.sources.length,
          feeRuleCount: activeRules(wichitaSeed, page.permitTypeKey).length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable, `${page.slug}: ${evalResult.failures.join("; ")}`).toBe(
          true,
        );
      }
    });

    it("is tied to Kansas with Sedgwick County, and cites both the tables and the code", () => {
      expect(wichitaSeed.state).toMatchObject({ code: "KS", fipsCode: "20" });
      expect(wichitaSeed.county).toMatchObject({ name: "Sedgwick County", fipsCode: "20173" });
      expect(wichitaSeed.jurisdiction.officialName).toContain("MABCD");
      expect(wichitaSeed.sources.map((s) => s.key)).toEqual([
        "mabcd-fee-tables-2019",
        "wichita-ubtc-ordinance-52-564",
      ]);
      for (const source of wichitaSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(wichitaSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the commercial worked example — Table B band 6 plus the 60% plan review", () => {
      const result = computeExample(wichitaSeed, "building");
      // $650,000: band 6 base $3,828.00 + 150 × $5.00 = $4,578.00; plan review 60% = $2,746.80.
      expect(result!.totalCents).toBe(732_480);
      expect(result!.components.find((c) => c.code === "BLD-TABLE-B-6")?.amountCents).toBe(
        457_800,
      );
      expect(result!.components.find((c) => c.code === "BLD-PLAN-REVIEW-60")?.amountCents).toBe(
        274_680,
      );
    });

    it("keeps the Table B bands mutually exclusive and chained at the seams", () => {
      const rules = activeRules(wichitaSeed, "building");
      const atSeam = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 2_500_000, occupancy: "commercial" },
        rules,
      );
      // $25,000 exactly: band 3 base $70.00 + 23 whole $1,000 steps × $11.00 = $323.00.
      expect(atSeam.components.find((c) => c.code === "BLD-TABLE-B-3")?.amountCents).toBe(
        7_000 + 23 * 1_100,
      );
      expect(atSeam.components.find((c) => c.code === "BLD-TABLE-B-4")).toBeUndefined();

      const pastSeam = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 2_500_001, occupancy: "commercial" },
        rules,
      );
      // One cent of valuation above $25,000 stays in band 3 — the ladder's "or
      // fraction thereof" rounds that cent up to a whole $11.00 step.
      expect(pastSeam.components.find((c) => c.code === "BLD-TABLE-B-4")).toBeUndefined();
      expect(pastSeam.components.find((c) => c.code === "BLD-TABLE-B-3")?.amountCents).toBe(
        7_000 + 24 * 1_100,
      );

      // The band 3 → band 4 handoff: at $40,000.00 exactly the fee is $70.00 +
      // 38 × $11.00 = $488.00, which is exactly band 4's printed base; one cent
      // more crosses into band 4 and pays $488.00 + $9.00.
      const atCeiling = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 4_000_000, occupancy: "commercial" },
        rules,
      );
      expect(atCeiling.components.find((c) => c.code === "BLD-TABLE-B-3")?.amountCents).toBe(
        48_800,
      );
      const pastCeiling = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 4_000_001, occupancy: "commercial" },
        rules,
      );
      expect(pastCeiling.components.find((c) => c.code === "BLD-TABLE-B-3")).toBeUndefined();
      expect(pastCeiling.components.find((c) => c.code === "BLD-TABLE-B-4")?.amountCents).toBe(
        48_800 + 900,
      );

      // The smallest band carries the $1–$1,000 flat row: $40.00.
      const tiny = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 50_000, occupancy: "commercial" },
        rules,
      );
      expect(tiny.totalCents).toBe(4_000);
    });

    it("prices residential new build by two areas at two rates", () => {
      const rules = activeRules(wichitaSeed, "building");
      const house = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          squareFootage: 2_000,
          custom: { covered_square_footage: 800 },
        },
        rules,
      );
      // 2,000 × $0.38 = $760.00 finished + 800 × $0.30 = $240.00 unfinished = $1,000.00.
      expect(house.totalCents).toBe(100_000);
      expect(house.components.find((c) => c.code === "BLD-RES-FINISHED")?.amountCents).toBe(
        76_000,
      );
      expect(house.components.find((c) => c.code === "BLD-RES-UNFINISHED")?.amountCents).toBe(
        24_000,
      );
      // The ladder never answers a residential new build.
      expect(house.components.find((c) => c.code?.startsWith("BLD-TABLE-B"))).toBeUndefined();

      // Without an unfinished area, only the finished row answers.
      const slab = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          squareFootage: 1_000,
        },
        rules,
      );
      expect(slab.totalCents).toBe(38_000);
    });

    it("prices the electrical worked example from the Table I item rows plus the issuance fee", () => {
      const result = computeExample(wichitaSeed, "electrical");
      // 25 circuits × $2 + 40 outlets × $0.75 + 60 fixtures × $0.75 + 2 meters × $11 + $25.
      expect(result!.totalCents).toBe(17_200);
      expect(result!.components.find((c) => c.code === "ELEC-CIRCUITS")?.amountCents).toBe(5_000);
      expect(result!.components.find((c) => c.code === "ELEC-OUTLETS-ADDED")?.amountCents).toBe(
        3_000,
      );
      expect(result!.components.find((c) => c.code === "ELEC-FIXTURES")?.amountCents).toBe(4_500);
      expect(result!.components.find((c) => c.code === "ELEC-METERS")?.amountCents).toBe(2_200);
      expect(result!.components.find((c) => c.code === "ELEC-ISSUANCE")?.amountCents).toBe(2_500);
    });

    it("prices the plumbing worked example and carries the $25 issuance fee as the permit floor", () => {
      const result = computeExample(wichitaSeed, "plumbing");
      // 12 openings × $4.50 + 2 water services × $5 + 3 water heaters × $9 + 2 backflow × $5 + $25.
      expect(result!.totalCents).toBe(12_600);

      // The cheapest possible permit: one waste opening — $4.50 + $25.00 issuance.
      const minimal = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", custom: { openings: 1 } },
        activeRules(wichitaSeed, "plumbing"),
      );
      expect(minimal.totalCents).toBe(2_950);
    });

    it("stands the trade tables down on bundled one/two-family dwelling work", () => {
      const bundled = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          custom: { trade_bundled: true, circuits: 12 },
        },
        activeRules(wichitaSeed, "electrical"),
      );
      expect(bundled.totalCents).toBe(0);
    });
  });

  describe("Overland Park, KS (Planning and Development Services)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of overlandParkSeed.feeRules) {
        const validation = validateFeeRule(entry.rule);
        expect(
          validation.ok,
          `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
        ).toBe(true);
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(overlandParkSeed.permitPages).toHaveLength(3);
      for (const page of overlandParkSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: overlandParkSeed.sources.length,
          feeRuleCount: activeRules(overlandParkSeed, page.permitTypeKey).length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable, `${page.slug}: ${evalResult.failures.join("; ")}`).toBe(
          true,
        );
      }
    });

    it("is tied to Kansas and Johnson County, and cites the 2025 schedule as its primary source", () => {
      expect(overlandParkSeed.state).toMatchObject({ code: "KS", fipsCode: "20" });
      expect(overlandParkSeed.county).toMatchObject({ name: "Johnson County", fipsCode: "20091" });
      const source = overlandParkSeed.sources[0]!;
      expect(source.isPrimary).toBe(true);
      expect(source.effectiveFrom).toBe("2025-08-01");
      expect(source.title).toContain("Development Approval and Permit Fees");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(overlandParkSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("applies 0.0035 to the ICC path and 0.0050 to the submitted path, never both", () => {
      const rules = activeRules(overlandParkSeed, "building");
      const icc = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 40_000_000, occupancy: "commercial", custom: { valuation_source: "icc" } },
        rules,
      );
      // 0.0035 × $400,000 = $1,400.00 — the worked example's whole-dollar fee.
      expect(icc.totalCents).toBe(140_000);
      expect(icc.components.map((c) => c.code)).toEqual(["BLD-ICC-0035"]);

      const portfolio = calculatePermitFees(
        {
          asOf: AS_OF,
          valuationCents: 40_000_000,
          occupancy: "residential",
          custom: { valuation_source: "icc", portfolio_home: true },
        },
        rules,
      );
      expect(portfolio.components.map((c) => c.code)).toEqual(["BLD-PORTFOLIO-0035"]);
      expect(portfolio.totalCents).toBe(140_000);

      const submitted = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 4_000_000, custom: { valuation_source: "submitted" } },
        rules,
      );
      // $40,000 sits above the $19,000 seam: 0.0050 × $40,000 = $200.00, flats silent.
      expect(submitted.components.map((c) => c.code)).toEqual(["BLD-SUBMITTED-0050"]);
      expect(submitted.totalCents).toBe(20_000);

      // The $19,000 seam itself: flats still cover "$19,000 or less" — $50 + $30 = $80.00 —
      // and one cent above crosses to the multiplier (0.0050 × $19,000.01 = $95.00).
      const atSeam = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 1_900_000 },
        rules,
      );
      expect(atSeam.components.map((c) => c.code)).toEqual(["BLD-FLAT-2", "PLAN-REVIEW-FLAT"]);
      expect(atSeam.totalCents).toBe(8_000);

      const pastSeam = calculatePermitFees(
        {
          asOf: AS_OF,
          valuationCents: 1_900_001,
          custom: { valuation_source: "submitted" },
        },
        rules,
      );
      expect(pastSeam.components.map((c) => c.code)).toEqual(["BLD-SUBMITTED-0050"]);
      expect(pastSeam.totalCents).toBe(9_500);
    });

    it("prices the flat tiers with the $30 plan review, printed totals $60 and $80", () => {
      const rules = activeRules(overlandParkSeed, "building");
      const small = calculatePermitFees({ asOf: AS_OF, valuationCents: 350_000 }, rules);
      expect(small.components.map((c) => c.code)).toEqual(["BLD-FLAT-1", "PLAN-REVIEW-FLAT"]);
      expect(small.totalCents).toBe(6_000);

      const mid = calculatePermitFees({ asOf: AS_OF, valuationCents: 1_200_000 }, rules);
      expect(mid.components.map((c) => c.code)).toEqual(["BLD-FLAT-2", "PLAN-REVIEW-FLAT"]);
      expect(mid.totalCents).toBe(8_000);
    });

    it("models the trade pages as the stand-alone small-project regime, stood down when bundled", () => {
      const electrical = computeExample(overlandParkSeed, "electrical");
      // $12,000 stand-alone: $50 flat + $30 flat plan review = $80.00 — the printed total.
      expect(electrical!.totalCents).toBe(8_000);
      expect(electrical!.components.map((c) => c.code)).toEqual([
        "ELEC-FLAT-2",
        "ELEC-PLAN-REVIEW-FLAT",
      ]);

      const plumbing = computeExample(overlandParkSeed, "plumbing");
      // $3,500 stand-alone: $30 flat + $30 flat plan review = $60.00 — the printed total.
      expect(plumbing!.totalCents).toBe(6_000);
      expect(plumbing!.components.map((c) => c.code)).toEqual([
        "PL-FLAT-1",
        "PL-PLAN-REVIEW-FLAT",
      ]);

      // Bundled trade work rides the building permit: nothing here.
      const bundled = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 1_200_000, custom: { trade_bundled: true } },
        activeRules(overlandParkSeed, "electrical"),
      );
      expect(bundled.totalCents).toBe(0);
    });

    it("carries only official primary sources with verification dates", () => {
      for (const source of overlandParkSeed.sources) {
        expect(source.lastVerifiedAt).not.toBeNull();
        expect(source.url).toMatch(/^https:/);
      }
    });
  });
});
