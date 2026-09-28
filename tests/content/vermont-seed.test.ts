import { describe, expect, it } from "vitest";

import { burlingtonSeed } from "@/content/burlington";
import { montpelierSeed } from "@/content/montpelier";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, CalculationResult, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof montpelierSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof montpelierSeed, permitTypeKey: string) {
  const page = seed.permitPages.find(
    (p) => p.publishStatus === "published" && p.permitTypeKey === permitTypeKey,
  );
  if (!page || !page.workedExample) return null;
  const input: CalculationInput = {
    asOf: AS_OF,
    ...(page.workedExample.inputs as Partial<CalculationInput>),
  };
  // Burlington publishes no trade fee schedule: its electrical and plumbing
  // pages' worked examples price the building permit the trade permit rides
  // on, so fall back to the building rules where the permit type has none.
  const rules =
    activeRules(seed, permitTypeKey).length > 0
      ? activeRules(seed, permitTypeKey)
      : activeRules(seed, "building");
  return calculatePermitFees(input, rules);
}

/** Sum of the base components, excluding surcharges such as recording fees. */
function baseSum(result: CalculationResult): number {
  return result.components
    .filter((c) => c.componentType === "base")
    .reduce((sum, c) => sum + c.amountCents, 0);
}

function surchargeSum(result: CalculationResult): number {
  return result.components
    .filter((c) => c.componentType === "surcharge")
    .reduce((sum, c) => sum + c.amountCents, 0);
}

function editorialSuite(seed: typeof montpelierSeed, name: string) {
  it(`${name}: validates all fee rules through engine schema`, () => {
    for (const entry of seed.feeRules) {
      expect(() => validateFeeRule(entry.rule)).not.toThrow();
    }
  });

  it(`${name}: has 3 published permit pages passing the editorial gate`, () => {
    expect(seed.permitPages).toHaveLength(3);
    for (const page of seed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);
      const evalResult = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: seed.sources.length,
        feeRuleCount: seed.feeRules.length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });
      expect(evalResult.publishable).toBe(true);
    }
  });

  it(`${name}: computes every published worked example above zero with no invalid exclusions`, () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const result = computeExample(seed, permitTypeKey);
      expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
      expect(result!.components.length).toBeGreaterThan(0);
      expect(result!.totalCents).toBeGreaterThan(0);
      for (const excluded of result!.excluded) {
        expect(excluded.reason).toBe("conditions_not_met");
      }
    }
  });

  it(`${name}: carries only official primary sources with verification dates`, () => {
    expect(seed.sources.length).toBeGreaterThan(0);
    for (const source of seed.sources) {
      expect(source.isPrimary).toBe(true);
      expect(source.lastVerifiedAt).not.toBeNull();
    }
  });
}

describe("Vermont Seeds — Burlington and Montpelier", () => {
  editorialSuite(burlingtonSeed, "Burlington");
  editorialSuite(montpelierSeed, "Montpelier");

  describe("Burlington arithmetic", () => {
    it("reproduces the City's $50,000-deck example exactly: $440.00", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 5_000_000 },
        activeRules(burlingtonSeed, "building"),
      );
      // $8.50 x 50 = $425.00 + $15.00 recording fee.
      expect(baseSum(result)).toBe(42_500);
      expect(surchargeSum(result)).toBe(1_500);
      expect(result.totalCents).toBe(44_000);
    });

    it("prices a $12,000 project at $117.00 including recording", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 1_200_000 },
        activeRules(burlingtonSeed, "building"),
      );
      // $8.50 x 12 = $102.00 + $15.00.
      expect(result.totalCents).toBe(11_700);
    });

    it("binds the $30.00 minimum on a $1,500 deck (City's Level I example)", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 150_000 },
        activeRules(burlingtonSeed, "building"),
      );
      // The rate computes $12.75; the ordinance's $30.00 minimum governs the
      // permit fee. The recording fee rides on top of whichever is larger.
      expect(baseSum(result)).toBeGreaterThanOrEqual(30_00);
    });

    it("rounds partial thousands up", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 1_000_001 },
        activeRules(burlingtonSeed, "building"),
      );
      // $10,000.01 of cost -> 11 increments -> $93.50 + $15.00.
      expect(result.totalCents).toBe(10_850);
    });
  });

  describe("Montpelier arithmetic", () => {
    it("prices a $50,000 single-family addition at $205.00 with recording", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 5_000_000 },
        activeRules(montpelierSeed, "building"),
      );
      // 50 x $3.50 = $175.00 + $30.00 recording.
      expect(baseSum(result)).toBe(17_500);
      expect(surchargeSum(result)).toBe(30_00);
      expect(result.totalCents).toBe(20_500);
    });

    it("prices a $50,000 commercial fit-out at $430.00 with recording", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", valuationCents: 5_000_000 },
        activeRules(montpelierSeed, "building"),
      );
      // 50 x $8.00 = $400.00 + $30.00 recording.
      expect(result.totalCents).toBe(43_000);
    });

    it("binds the $30.00 residential minimum on small projects", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 500_000 },
        activeRules(montpelierSeed, "building"),
      );
      // 5 x $3.50 = $17.50 < $30.00 minimum.
      expect(baseSum(result)).toBe(30_00);
      expect(result.totalCents).toBe(60_00);
    });

    it("binds the $50.00 commercial minimum on small projects", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", valuationCents: 400_000 },
        activeRules(montpelierSeed, "building"),
      );
      // 4 x $8.00 = $32.00 < $50.00 minimum.
      expect(baseSum(result)).toBe(50_00);
      expect(result.totalCents).toBe(80_00);
    });

    it("rounds partial thousands up on both rows", () => {
      const res = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 1_000_001 },
        activeRules(montpelierSeed, "building"),
      );
      // 11 partials x $3.50 = $38.50 + $30.00.
      expect(res.totalCents).toBe(68_50);

      const comm = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", valuationCents: 1_000_001 },
        activeRules(montpelierSeed, "building"),
      );
      // 11 partials x $8.00 = $88.00 + $30.00.
      expect(comm.totalCents).toBe(118_00);
    });

    it("prices electrical scope through the building rows", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", valuationCents: 800_000 },
        activeRules(montpelierSeed, "electrical"),
      );
      // 8 x $8.00 = $64.00 + $30.00 recording.
      expect(result.totalCents).toBe(94_00);
    });
  });
});
