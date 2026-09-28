import { describe, expect, it } from "vitest";

import { richmondSeed } from "@/content/richmond";
import { virginiaBeachSeed } from "@/content/virginiabeach";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof virginiaBeachSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof virginiaBeachSeed, permitTypeKey: string) {
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

describe("Virginia Seeds — Virginia Beach and Richmond", () => {
  describe("Virginia Beach, VA", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of virginiaBeachSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(virginiaBeachSeed.permitPages).toHaveLength(3);
      for (const page of virginiaBeachSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: virginiaBeachSeed.sources.length,
          feeRuleCount: virginiaBeachSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Virginia with the independent-city county row", () => {
      expect(virginiaBeachSeed.state).toMatchObject({ code: "VA", fipsCode: "51" });
      expect(virginiaBeachSeed.county).toMatchObject({
        name: "City of Virginia Beach",
        fipsCode: "51810",
      });
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(virginiaBeachSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the 2,400 sq ft residential building example to the cent", () => {
      // 24 steps x $7.00 = $168.00 + $50.00 base + $100 plan review
      // + 2% levy on $318.00 ($6.36) + $10 tech fee = $334.36.
      const result = computeExample(virginiaBeachSeed, "building");
      expect(result!.totalCents).toBe(33_436);
    });

    it("rounds area up to the whole 100 sq ft because the fraction phrase is printed", () => {
      const rules = activeRules(virginiaBeachSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, squareFootage: 1050, occupancy: "residential" },
        rules,
      );
      const area = result.components.find((c) => c.code === "BLD-RES-AREA");
      // 1,050 sq ft -> eleven whole 100-sq-ft steps x $7.00 = $77.00.
      expect(area?.amountCents).toBe(7_700);
    });

    it("charges commercial building at $8.00 per 100 sq ft with the $200 plan review", () => {
      const rules = activeRules(virginiaBeachSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, squareFootage: 2000, valuationCents: 30_000_000, occupancy: "commercial" },
        rules,
      );
      const area = result.components.find((c) => c.code === "BLD-COMM-AREA");
      const review = result.components.find((c) => c.code === "BLD-PLAN-REVIEW-COMM");
      expect(area?.amountCents).toBe(16_000); // 20 steps x $8.00
      expect(review?.amountCents).toBe(20_000);
    });

    it("prices a 200-amp electrical service at $130.00 plus the riders", () => {
      const result = computeExample(virginiaBeachSeed, "electrical");
      // $50 base + 4 x $20.00 = $130.00; levy $2.60; tech $10.00 -> $142.60.
      expect(result!.totalCents).toBe(14_260);
    });

    it("prices plumbing at $6.00 per fixture over the $50 base with the riders", () => {
      const result = computeExample(virginiaBeachSeed, "plumbing");
      // $50 + 3 x $6.00 = $68.00; levy $1.36; tech $10.00 -> $79.36.
      expect(result!.totalCents).toBe(7_936);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(virginiaBeachSeed.sources.length).toBeGreaterThan(0);
      for (const source of virginiaBeachSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });

  describe("Richmond, VA", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of richmondSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(richmondSeed.permitPages).toHaveLength(3);
      for (const page of richmondSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: richmondSeed.sources.length,
          feeRuleCount: richmondSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Virginia as an independent city", () => {
      expect(richmondSeed.state).toMatchObject({ code: "VA", fipsCode: "51" });
      expect(richmondSeed.county).toMatchObject({ name: "City of Richmond", fipsCode: "51760" });
      expect(richmondSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(richmondSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the $12,300 residential example with the fraction rounding", () => {
      // $10,300 above $2,000 rounds up to 11 steps x $6.07 = $66.77 + $63.00 base
      // = $129.77 + 2% surcharge $2.60 = $132.37.
      const result = computeExample(richmondSeed, "building");
      expect(result!.totalCents).toBe(13_237);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "BLD-RES", amountCents: 12_977 });
      expect(components).toContainEqual({ code: "VA-STATE-SURCHARGE", amountCents: 260 });
    });

    it("charges the first $2,000 at the flat base with no per-thousand rate", () => {
      const rules = activeRules(richmondSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 200_000, occupancy: "residential" }, // $2,000
        rules,
      );
      const base = result.components.find((c) => c.code === "BLD-RES");
      expect(base?.amountCents).toBe(6_300);
    });

    it("prices commercial plumbing at $131.00 + $8.50 per rounded step", () => {
      const result = computeExample(richmondSeed, "plumbing");
      // $4,800 above $2,000 -> 5 steps x $8.50 = $42.50 + $131.00 = $173.50
      // + 2% surcharge $3.47 = $176.97.
      expect(result!.totalCents).toBe(17_697);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(richmondSeed.sources.length).toBeGreaterThan(0);
      for (const source of richmondSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });
});
