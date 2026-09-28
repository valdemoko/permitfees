import { describe, expect, it } from "vitest";

import { birminghamSeed } from "@/content/birmingham";
import { huntsvilleSeed } from "@/content/huntsville";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-25";

describe("Alabama Seeds — Birmingham and Huntsville", () => {
  describe("Birmingham, AL", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of birminghamSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing editorial gate", () => {
      expect(birminghamSeed.permitPages).toHaveLength(3);
      for (const page of birminghamSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: birminghamSeed.sources.length,
          feeRuleCount: birminghamSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("calculates residential building permit with 50% plan review", () => {
      const buildingRules = birminghamSeed.feeRules
        .filter((r) => r.permitTypeKey === "building")
        .map((r) => r.rule);

      const input: CalculationInput = {
        asOf: AS_OF,
        valuationCents: 8_500_000, // $85,000
        occupancy: "residential",
      };

      const result = calculatePermitFees(input, buildingRules);
      // Base: 85 * $9.50 = $807.50 (80750 cents)
      // Plan review: 50% of 80750 = $403.75 (40375 cents)
      // Total: 121125 cents ($1,211.25)
      expect(result.totalCents).toBe(121_125);
    });

    it("enforces $125 minimum building permit fee", () => {
      const buildingRules = birminghamSeed.feeRules
        .filter((r) => r.permitTypeKey === "building")
        .map((r) => r.rule);

      const input: CalculationInput = {
        asOf: AS_OF,
        valuationCents: 500_000, // $5,000 valuation -> $47.50 base
        occupancy: "residential",
      };

      const result = calculatePermitFees(input, buildingRules);
      expect(result.totalCents).toBeGreaterThanOrEqual(12_500);
    });

    it("charges Craft Training Fund on commercial projects", () => {
      const buildingRules = birminghamSeed.feeRules
        .filter((r) => r.permitTypeKey === "building")
        .map((r) => r.rule);

      const input: CalculationInput = {
        asOf: AS_OF,
        valuationCents: 10_000_000, // $100,000
        occupancy: "commercial",
      };

      const result = calculatePermitFees(input, buildingRules);
      const craftTraining = result.components.find((c) => c.code === "AL-CRAFT-TRAINING");
      expect(craftTraining).toBeDefined();
      expect(craftTraining?.amountCents).toBe(10_000); // 100 * $1.00 = $100.00
    });
  });

  describe("Huntsville, AL", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of huntsvilleSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing editorial gate", () => {
      expect(huntsvilleSeed.permitPages).toHaveLength(3);
      for (const page of huntsvilleSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: huntsvilleSeed.sources.length,
          feeRuleCount: huntsvilleSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("computes commercial valuation multiplier 0.0055 correctly", () => {
      const buildingRules = huntsvilleSeed.feeRules
        .filter((r) => r.permitTypeKey === "building")
        .map((r) => r.rule);

      const input: CalculationInput = {
        asOf: AS_OF,
        valuationCents: 10_000_000, // $100,000
        occupancy: "commercial",
      };

      const result = calculatePermitFees(input, buildingRules);
      // 100,000 * 0.0055 = $550.00
      expect(result.totalCents).toBe(55_000);
    });

    it("enforces $50 minimum permit fee in Huntsville", () => {
      const electricalRules = huntsvilleSeed.feeRules
        .filter((r) => r.permitTypeKey === "electrical")
        .map((r) => r.rule);

      const input: CalculationInput = {
        asOf: AS_OF,
        valuationCents: 200_000, // $2,000 -> 2,000 * 0.0055 = $11.00
      };

      const result = calculatePermitFees(input, electricalRules);
      expect(result.totalCents).toBe(5_000); // Floored to $50.00
    });
  });
});
