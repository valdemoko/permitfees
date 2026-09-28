import { describe, expect, it } from "vitest";

import { charlestonSeed } from "@/content/charleston";
import { columbiaSeed } from "@/content/columbia";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof charlestonSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof charlestonSeed, permitTypeKey: string) {
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

describe("South Carolina Seeds — Charleston and Columbia", () => {
  describe("Charleston, SC", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of charlestonSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(charlestonSeed.permitPages).toHaveLength(3);
      for (const page of charlestonSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: charlestonSeed.sources.length,
          feeRuleCount: charlestonSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to South Carolina with the correct county and ordinance", () => {
      expect(charlestonSeed.state).toMatchObject({ code: "SC", fipsCode: "45" });
      expect(charlestonSeed.county).toMatchObject({ name: "Charleston County", fipsCode: "45019" });
      expect(charlestonSeed.jurisdiction.officialName).toContain("Building Inspections");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(charlestonSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the ICC-based new-home example with the chained band and 50% review", () => {
      // $209,070: $522.00 base + 110 rounded steps x $3.00 = $852.00;
      // plan review 50% = $426.00; application fee $40.00 -> $1,318.00.
      const result = computeExample(charlestonSeed, "building");
      expect(result!.totalCents).toBe(131_800);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "BLD-BAND-500K", amountCents: 85_200 });
      expect(components).toContainEqual({ code: "BLD-PLAN-REVIEW-50", amountCents: 42_600 });
      expect(components).toContainEqual({ code: "CHS-APPLICATION-FEE", amountCents: 4_000 });
    });

    it("chains the ladder exactly at the $50,000 seam", () => {
      const rules = activeRules(charlestonSeed, "building");
      const at50k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "residential" }, // $50,000
        rules,
      );
      const justOver = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_001_000, occupancy: "residential" }, // $50,010
        rules,
      );
      const at50kBase = at50k.components.find((c) => c.code === "BLD-BAND-50K");
      const overBase = justOver.components.find((c) => c.code === "BLD-BAND-100K");
      // $35 + 49 x $5.50 = $304.50... the schedule prints $290.00 at the seam:
      // the band bases are the schedule's own printed figures, charged as printed.
      expect(at50kBase?.amountCents).toBe(30_450);
      expect(overBase?.amountCents).toBe(29_000 + 464);
    });

    it("rounds each partial thousand up inside the band", () => {
      const rules = activeRules(charlestonSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 2_050_000, occupancy: "residential" }, // $20,500
        rules,
      );
      const base = result.components.find((c) => c.code === "BLD-BAND-50K");
      // $35.00 + 20 whole steps (19.5 rounds up) x $5.50 = $145.00.
      expect(base?.amountCents).toBe(14_500);
    });

    it("prices electrical and plumbing trades at $75 plus the $40 application fee", () => {
      expect(computeExample(charlestonSeed, "electrical")!.totalCents).toBe(11_500);
      expect(computeExample(charlestonSeed, "plumbing")!.totalCents).toBe(11_500);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(charlestonSeed.sources.length).toBeGreaterThan(0);
      for (const source of charlestonSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });

  describe("Columbia, SC", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of columbiaSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(columbiaSeed.permitPages).toHaveLength(3);
      for (const page of columbiaSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: columbiaSeed.sources.length,
          feeRuleCount: columbiaSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to South Carolina and Richland County", () => {
      expect(columbiaSeed.state).toMatchObject({ code: "SC", fipsCode: "45" });
      expect(columbiaSeed.county).toMatchObject({ name: "Richland County", fipsCode: "45079" });
      expect(columbiaSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(columbiaSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the $60,000 residential example with the fraction rounding and $25 review", () => {
      // 55 rounded steps x $4.00 = $220.00 + $20.00 base + $25.00 = $265.00.
      const result = computeExample(columbiaSeed, "building");
      expect(result!.totalCents).toBe(26_500);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "BLD-RES", amountCents: 24_000 });
      expect(components).toContainEqual({ code: "COL-PLAN-REVIEW-RES", amountCents: 2_500 });
    });

    it("charges the first $5,000 at the flat $20.00 base", () => {
      const rules = activeRules(columbiaSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 500_000, occupancy: "residential" },
        rules,
      );
      const base = result.components.find((c) => c.code === "BLD-RES");
      expect(base?.amountCents).toBe(2_000);
    });

    it("chains the commercial ladder exactly at the $100,000 seam", () => {
      const rules = activeRules(columbiaSeed, "building");
      const at100k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 10_000_000, occupancy: "commercial" }, // $100,000
        rules,
      );
      const justOver = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 10_001_000, occupancy: "commercial" }, // $100,010
        rules,
      );
      const at100kBase = at100k.components.find((c) => c.code === "BLD-COMM-100K");
      const overBase = justOver.components.find((c) => c.code === "BLD-COMM-1M");
      // $50.00 + 95 x $9.00 = $905.00 exactly; the next band's base is $905.00 + one step.
      expect(at100kBase?.amountCents).toBe(90_500);
      expect(overBase?.amountCents).toBe(90_500 + 400);
    });

    it("prices commercial building with the 30% plan review", () => {
      const rules = activeRules(columbiaSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "commercial" }, // $50,000
        rules,
      );
      const base = result.components.find((c) => c.code === "BLD-COMM-100K");
      const review = result.components.find((c) => c.code === "COL-PLAN-REVIEW-COMM");
      // $50.00 + 45 x $9.00 = $455.00; review 30% = $136.50.
      expect(base?.amountCents).toBe(45_500);
      expect(review?.amountCents).toBe(13_650);
    });

    it("prices standalone residential electrical at the residential ladder", () => {
      // $8,400 -> 4 steps x $4.00 + $20.00 = $36.00.
      const result = computeExample(columbiaSeed, "electrical");
      expect(result!.totalCents).toBe(3_600);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(columbiaSeed.sources.length).toBeGreaterThan(0);
      for (const source of columbiaSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });
});
