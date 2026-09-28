import { describe, expect, it } from "vitest";

import { doverSeed } from "@/content/dover";
import { wilmingtonSeed } from "@/content/wilmington";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof wilmingtonSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof wilmingtonSeed, permitTypeKey: string) {
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

describe("Delaware Seeds — Wilmington and Dover", () => {
  describe("Wilmington, DE", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of wilmingtonSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(wilmingtonSeed.permitPages).toHaveLength(3);
      for (const page of wilmingtonSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: wilmingtonSeed.sources.length,
          feeRuleCount: wilmingtonSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Delaware and New Castle County", () => {
      expect(wilmingtonSeed.county).toMatchObject({ name: "New Castle County", fipsCode: "10003" });
      expect(wilmingtonSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(wilmingtonSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("prices a $60,000 project at $12.00 per $1,000 = $720.00 plus two $20.00 trade permits", () => {
      const result = computeExample(wilmingtonSeed, "building");
      expect(result!.totalCents).toBe(72_000);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "BLD-PER-1000", amountCents: 72_000 });
      // The trade permits price on their own pages at the flat $20.00 each.
      expect(computeExample(wilmingtonSeed, "electrical")!.totalCents).toBe(2_000);
      expect(computeExample(wilmingtonSeed, "plumbing")!.totalCents).toBe(2_000);
    });

    it("charges the single rate at every valuation with no minimum floor", () => {
      const rules = activeRules(wilmingtonSeed, "building");
      for (const [valueCents, expected] of [
        [5_000_000, 60_000], // $50,000 -> 50 thousands x $12.00 = $600.00
        [10_000_000, 120_000], // $100,000 -> $1,200.00
        [1_000_000_000, 12_000_000], // $10,000,000 -> $120,000.00
      ] as const) {
        const result = calculatePermitFees(
          { asOf: AS_OF, valuationCents: valueCents, occupancy: "residential" },
          rules,
        );
        const base = result.components.find((c) => c.code === "BLD-PER-1000");
        expect(base?.amountCents, `valuation ${valueCents}`).toBe(expected);
      }
    });

    it("prices both trade permits flat regardless of scale", () => {
      const elecRules = activeRules(wilmingtonSeed, "electrical");
      const plumbRules = activeRules(wilmingtonSeed, "plumbing");
      const elec = calculatePermitFees({ asOf: AS_OF, occupancy: "residential" }, elecRules);
      const plumb = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", fixtures: 12 },
        plumbRules,
      );
      expect(elec.totalCents).toBe(2_000);
      expect(plumb.totalCents).toBe(2_000);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(wilmingtonSeed.sources.length).toBeGreaterThan(0);
      for (const source of wilmingtonSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });

  describe("Dover, DE", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of doverSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate (building, mechanical, plumbing)", () => {
      expect(doverSeed.permitPages).toHaveLength(3);
      const pageTypes = doverSeed.permitPages.map((p) => p.permitTypeKey).sort();
      expect(pageTypes).toEqual(["building", "mechanical", "plumbing"]);
      for (const page of doverSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: doverSeed.sources.length,
          feeRuleCount: doverSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("documents the free-by-ordinance electrical permit instead of publishing a $0 page", () => {
      const electricalRow = doverSeed.jurisdictionPermitTypes.find(
        (row) => row.permitTypeKey === "electrical",
      );
      expect(electricalRow?.isAvailable).toBe(false);
      expect(electricalRow?.notes).toContain("22-109");
      // No electrical fee rules or pages exist for Dover.
      expect(doverSeed.feeRules.filter((entry) => entry.permitTypeKey === "electrical")).toHaveLength(0);
      expect(doverSeed.permitPages.filter((p) => p.permitTypeKey === "electrical")).toHaveLength(0);
    });

    it("is tied to Delaware and Kent County", () => {
      expect(doverSeed.county).toMatchObject({ name: "Kent County", fipsCode: "10001" });
      expect(doverSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "mechanical", "plumbing"]) {
        const result = computeExample(doverSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("prices a $50,000 dwelling at $25.00 + 49 x $8.00 = $417.00", () => {
      const result = computeExample(doverSeed, "building");
      expect(result!.totalCents).toBe(41_700);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "BLD-LEG-1", amountCents: 41_700 });
    });

    it("applies only the first leg up to $10M and hands off to the marginal legs above", () => {
      const rules = activeRules(doverSeed, "building");
      // $10,000,000 exactly: first leg alone -> $25.00 + 9,999 x $8.00 = $80,017.00.
      const atTenM = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 1_000_000_000, occupancy: "residential" },
        rules,
      );
      expect(atTenM.components.map((c) => c.code)).toContain("BLD-LEG-1");
      expect(atTenM.components.map((c) => c.code)).not.toContain("BLD-LEG-2");
      expect(atTenM.totalCents).toBe(8_001_700);

      // $12,000,000: the second leg takes over, carrying the first leg's $80,017.00
      // product at $10M as its base plus 2,000 thousands x $6.00 = $12,000.00.
      const atTwelveM = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 1_200_000_000, occupancy: "residential" },
        rules,
      );
      // The bands are gated: above $10M the first leg hands off entirely to the second.
      expect(atTwelveM.components.map((c) => c.code)).not.toContain("BLD-LEG-1");
      const leg2 = atTwelveM.components.find((c) => c.code === "BLD-LEG-2");
      expect(leg2?.amountCents).toBe(9_201_700);
      expect(atTwelveM.totalCents).toBe(9_201_700);
    });

    it("rounds each partial thousand up ('or multiples thereof')", () => {
      const rules = activeRules(doverSeed, "building");
      // $50,500: excess $49,500 rounds up to 50 thousands -> $25.00 + 50 x $8.00 = $425.00.
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_050_000, occupancy: "residential" },
        rules,
      );
      const base = result.components.find((c) => c.code === "BLD-LEG-1");
      expect(base?.amountCents).toBe(42_500);
    });

    it("adds the $20.00 nonresidential plan review only for commercial occupancy", () => {
      const rules = activeRules(doverSeed, "building");
      const commercial = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "commercial" },
        rules,
      );
      const review = commercial.components.find((c) => c.code === "BLD-PLAN-REVIEW");
      expect(review?.amountCents).toBe(2_000);
      expect(commercial.totalCents).toBe(43_700);

      const residential = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "residential" },
        rules,
      );
      expect(residential.components.map((c) => c.code)).not.toContain("BLD-PLAN-REVIEW");
    });

    it("prices a 10-ton AC permit at $200.00 + 5 x $7.00 = $235.00", () => {
      const result = computeExample(doverSeed, "mechanical");
      expect(result!.totalCents).toBe(23_500);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "MECH-AC", amountCents: 23_500 });
    });

    it("keeps the first five tons at $40.00 each and rounds partial tons up", () => {
      const rules = activeRules(doverSeed, "mechanical");
      // 5-ton system: exactly the $200.00 base block.
      const five = calculatePermitFees({ asOf: AS_OF, occupancy: "commercial", custom: { tons: 5 } }, rules);
      expect(five.components.find((c) => c.code === "MECH-AC")?.amountCents).toBe(20_000);
      // 7-ton system: five tons in the block + 2 x $7.00 above.
      const seven = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", custom: { tons: 7 } },
        rules,
      );
      expect(seven.components.find((c) => c.code === "MECH-AC")?.amountCents).toBe(21_400);
      // Furnace-only job: the $40.00 heating row.
      const heat = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", custom: { furnaces: 1 } },
        rules,
      );
      expect(heat.components.map((c) => c.code)).toContain("MECH-HEAT");
      expect(heat.components.find((c) => c.code === "MECH-HEAT")?.amountCents).toBe(4_000);
    });

    it("prices 8 fixtures plus a 300-foot underground inspection at $44.00 + $41.25 = $85.25", () => {
      const result = computeExample(doverSeed, "plumbing");
      expect(result!.totalCents).toBe(8_525);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "PLUMB-FIXTURES", amountCents: 4_400 });
      expect(components).toContainEqual({ code: "PLUMB-UNDERGROUND", amountCents: 4_125 });
    });

    it("covers five fixtures in the $35.00 base and rounds partial ten-foot blocks up", () => {
      const rules = activeRules(doverSeed, "plumbing");
      // 5 fixtures: exactly the $35.00 base; 12 fixtures: $35.00 + 7 x $3.00 = $56.00.
      const five = calculatePermitFees({ asOf: AS_OF, occupancy: "residential", fixtures: 5 }, rules);
      expect(five.components.find((c) => c.code === "PLUMB-FIXTURES")?.amountCents).toBe(3_500);
      const twelve = calculatePermitFees({ asOf: AS_OF, occupancy: "residential", fixtures: 12 }, rules);
      expect(twelve.components.find((c) => c.code === "PLUMB-FIXTURES")?.amountCents).toBe(5_600);
      // 155 feet: 5 feet above 150 rounds up to one ten-foot block -> $30.00 + $0.75 = $30.75.
      const underground = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", custom: { linear_feet: 155 } },
        rules,
      );
      expect(underground.components.find((c) => c.code === "PLUMB-UNDERGROUND")?.amountCents).toBe(3_075);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(doverSeed.sources.length).toBeGreaterThan(0);
      for (const source of doverSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });
});
