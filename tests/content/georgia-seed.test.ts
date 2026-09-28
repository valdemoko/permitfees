import { describe, expect, it } from "vitest";

import { atlantaSeed } from "@/content/atlanta";
import { savannahSeed } from "@/content/savannah";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

/** The active rules a page's worked example computes from, in the engine's own shape. */
function activeRules(seed: typeof atlantaSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof atlantaSeed, permitTypeKey: string) {
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

describe("Georgia Seeds — Atlanta and Savannah", () => {
  describe("Atlanta, GA", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of atlantaSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(atlantaSeed.permitPages).toHaveLength(3);
      for (const page of atlantaSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: atlantaSeed.sources.length,
          feeRuleCount: atlantaSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Georgia with the correct county and official names", () => {
      expect(atlantaSeed.state).toMatchObject({ code: "GA", fipsCode: "13" });
      expect(atlantaSeed.county).toMatchObject({ name: "Fulton County", fipsCode: "13121" });
      expect(atlantaSeed.jurisdiction.officialName).toContain("Office of Buildings");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(atlantaSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("prices the residential building example at $7/$1,000 plus the technology fee", () => {
      // $85,000: $7.00 x 85 = $595.00 permit + $25.00 technology = $620.00.
      const result = computeExample(atlantaSeed, "building");
      expect(result!.totalCents).toBe(62_000);
      expect(result!.components.map((c) => c.code)).toContain("BLD-VALUATION");
      expect(result!.components.map((c) => c.code)).toContain("ATL-TECH-FEE");
    });

    it("prorates the $7 rate because no fraction language is printed", () => {
      const rules = activeRules(atlantaSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 8_510_000, occupancy: "residential" },
        rules,
      );
      const base = result.components.find((c) => c.code === "BLD-VALUATION");
      // 85.1 thousandths x $7.00 = $595.70 (prorated, not rounded up to $596).
      expect(base?.amountCents).toBe(59_570);
    });

    it("enforces the $150 building minimum when the rate falls below it", () => {
      const rules = activeRules(atlantaSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 1_000_000, occupancy: "residential" },
        rules,
      );
      // $10,000: $7.00 x 10 = $70.00 < $150.00, so the shortfall rule raises it.
      const shortfall = result.components.find((c) => c.code === "BLD-MINIMUM-FLOOR");
      expect(shortfall).toBeDefined();
      expect(result.totalCents).toBeGreaterThanOrEqual(15_000 + 2_500); // min + tech fee
    });

    it("charges electrical $150 + $25 tech with no shortfall above the $75 minimum", () => {
      const result = computeExample(atlantaSeed, "electrical");
      expect(result!.totalCents).toBe(17_500); // $150 + $25
      const codes = result!.components.map((c) => c.code);
      expect(codes).not.toContain("ELEC-MINIMUM-FLOOR");
    });

    it("charges plumbing the $175 minimum floor plus the $25 technology fee", () => {
      const result = computeExample(atlantaSeed, "plumbing");
      // Base $150 < $175 minimum -> shortfall $25; total $175 + $25 = $200.
      expect(result!.totalCents).toBe(20_000);
      expect(result!.components.map((c) => c.code)).toContain("PLUMB-MINIMUM-FLOOR");
    });

    it("carries only official primary sources with verification dates", () => {
      expect(atlantaSeed.sources.length).toBeGreaterThan(0);
      for (const source of atlantaSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });

  describe("Savannah, GA", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of savannahSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(savannahSeed.permitPages).toHaveLength(3);
      for (const page of savannahSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: savannahSeed.sources.length,
          feeRuleCount: savannahSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Georgia and Chatham County", () => {
      expect(savannahSeed.state).toMatchObject({ code: "GA", fipsCode: "13" });
      expect(savannahSeed.county).toMatchObject({ name: "Chatham County", fipsCode: "13051" });
      expect(savannahSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(savannahSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the 1,800 sq ft residential building example to the cent", () => {
      // 1,800 sq ft x $80.00 = $144,000 cost of construction.
      // Permit: $8.00 x 144 = $1,152.00. Plan review band $100,001-$500,000 = $200.00.
      // Technology fee $5.00. Total $1,357.00.
      const result = computeExample(savannahSeed, "building");
      expect(result!.totalCents).toBe(135_700);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "BLD-MARGINAL", amountCents: 115_200 });
      expect(components).toContainEqual({ code: "BLD-PLAN-REVIEW", amountCents: 20_000 });
      expect(components).toContainEqual({ code: "SAV-TECH-FEE", amountCents: 500 });
    });

    it("splits the marginal building ladder at the $5M band seam", () => {
      const rules = activeRules(savannahSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 600_000_000, occupancy: "residential" }, // $6,000,000
        rules,
      );
      const base = result.components.find((c) => c.code === "BLD-MARGINAL");
      // $8.00 x 5,000 = $40,000 on the first $5M; $4.00 x 1,000 = $4,000 on the rest.
      expect(base?.amountCents).toBe(4_400_000);
    });

    it("rounds trade work costs up to the whole $1,000 because the fraction phrase is printed", () => {
      const rules = activeRules(savannahSeed, "electrical");
      const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 950_000 }, rules);
      const base = result.components.find((c) => c.code === "ELEC-VALUATION");
      // $9,500 -> ten whole steps x $8.00 = $80.00.
      expect(base?.amountCents).toBe(8_000);
    });

    it("floors small plumbing jobs at the $40 minimum", () => {
      const rules = activeRules(savannahSeed, "plumbing");
      const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 320_000 }, rules);
      // $3,200 -> $8.00 x 4 = $32.00 < $40.00 minimum -> shortfall $8.00.
      const shortfall = result.components.find((c) => c.code === "PLUMB-MINIMUM-FLOOR");
      expect(shortfall).toBeDefined();
      expect(result.totalCents).toBe(4_000 + 500); // $40 minimum + $5 tech fee
    });

    it("carries only official primary sources with verification dates", () => {
      expect(savannahSeed.sources.length).toBeGreaterThan(0);
      for (const source of savannahSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });
});
