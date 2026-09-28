import { describe, expect, it } from "vitest";

import { anchorageSeed } from "@/content/anchorage";
import { fairbanksSeed } from "@/content/fairbanks";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

/** The active rules a page's worked example computes from, in the engine's own shape. */
function activeRules(seed: typeof anchorageSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof anchorageSeed, permitTypeKey: string) {
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

describe("Alaska Seeds — Anchorage and Fairbanks", () => {
  describe("Anchorage, AK (Municipality)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of anchorageSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(anchorageSeed.permitPages).toHaveLength(3);
      for (const page of anchorageSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: anchorageSeed.sources.length,
          feeRuleCount: anchorageSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Alaska with the correct county and official names", () => {
      expect(anchorageSeed.state).toMatchObject({ code: "AK", fipsCode: "02" });
      expect(anchorageSeed.county).toMatchObject({ name: "Municipality of Anchorage", fipsCode: "02020" });
      expect(anchorageSeed.jurisdiction).toMatchObject({
        officialName: "Municipality of Anchorage — Development Services Division",
      });
    });

    /**
     * Exclusions are legitimate when a rule is scoped out by its own conditions —
     * the commercial ladder answers only when the residential one does not. What
     * must never happen is a rule dropped for being invalid or for missing input,
     * which would mean the seed and the engine disagree about the schedule.
     */
    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(anchorageSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the residential building example the page announces", () => {
      // AMC 23.10 Table 3-A: 0.009 × $90,000 = $810.00 permit fee;
      // Table 3-B: 50% plan review = $405.00. Total $1,215.00.
      const result = computeExample(anchorageSeed, "building");
      expect(result!.totalCents).toBe(121_500);
      const components = result!.components.map((c) => ({
        code: c.code,
        amountCents: c.amountCents,
      }));
      expect(components).toContainEqual({ code: "BLD-RES-VALUATION", amountCents: 81_000 });
      expect(components).toContainEqual({ code: "BLD-RES-PLAN-REVIEW-50", amountCents: 40_500 });
    });

    it("enforces the $360 residential minimum when the rate falls below it", () => {
      const rules = activeRules(anchorageSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 2_000_000, occupancy: "residential" },
        rules,
      );
      // 0.009 × $20,000 = $180 < $360 floor, so the permit_minimum rule charges the shortfall.
      const base = result.components.find((c) => c.code === "BLD-RES-VALUATION");
      const floor = result.components.find((c) => c.code === "BLD-RES-MINIMUM-FLOOR");
      expect(base).toBeDefined();
      expect(floor).toBeDefined();
      expect(result.totalCents).toBeGreaterThanOrEqual(36_000);
    });

    it("charges commercial at 0.015 with the $525 minimum in force", () => {
      const rules = activeRules(anchorageSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 10_000_000, occupancy: "commercial" },
        rules,
      );
      expect(result.components.some((c) => c.code === "BLD-COMM-VALUATION-500K")).toBe(true);
      expect(result.totalCents).toBe(150_000 + 97_500); // $1,500 permit + 65% plan review
    });

    it("prices electrical and plumbing trades at the $175 inspection rate", () => {
      const electrical = computeExample(anchorageSeed, "electrical");
      expect(electrical!.totalCents).toBe(17_500);
      const plumbing = computeExample(anchorageSeed, "plumbing");
      expect(plumbing!.totalCents).toBe(17_500);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(anchorageSeed.sources.length).toBeGreaterThan(0);
      for (const source of anchorageSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });

  describe("Fairbanks, AK", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of fairbanksSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(fairbanksSeed.permitPages).toHaveLength(3);
      for (const page of fairbanksSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: fairbanksSeed.sources.length,
          feeRuleCount: fairbanksSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Alaska and Fairbanks North Star Borough", () => {
      expect(fairbanksSeed.state).toMatchObject({ code: "AK", fipsCode: "02" });
      expect(fairbanksSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(fairbanksSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("carries only official primary sources with verification dates", () => {
      expect(fairbanksSeed.sources.length).toBeGreaterThan(0);
      for (const source of fairbanksSeed.sources) {
        expect(new URL(source.url).protocol).toBe("https:");
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });
});
