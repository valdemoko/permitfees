import { describe, expect, it } from "vitest";

import { provoSeed } from "@/content/provo";
import { saltLakeCitySeed } from "@/content/saltlakecity";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, CalculationResult, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof provoSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof provoSeed, permitTypeKey: string) {
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

/** The building permit's own charge, before the 65% plan review is added. */
function baseComponent(result: CalculationResult): number {
  const base = result.components.filter((c) => c.componentType === "base");
  expect(base).toHaveLength(1);
  return base[0]!.amountCents;
}

function editorialSuite(seed: typeof provoSeed, name: string) {
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

describe("Utah Seeds — Salt Lake City and Provo", () => {
  editorialSuite(saltLakeCitySeed, "Salt Lake City");
  editorialSuite(provoSeed, "Provo");

  describe("Salt Lake City arithmetic", () => {
    it("prices a $150,000 building project at $1,825.97 plus 65% plan review", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", valuationCents: 15_000_000 },
        activeRules(saltLakeCitySeed, "building"),
      );
      // $1,425.97 for the first $100,000 + 50 x $8.00.
      expect(baseComponent(result)).toBe(182_597);
      const planReview = result.components.find((c) => c.componentType === "plan_review");
      expect(planReview).toBeDefined();
      // 65% of $1,825.97 = $1,186.88 (rounded to the cent).
      expect(planReview!.amountCents).toBe(Math.round(182_597 * 0.65));
      expect(result.totalCents).toBe(182_597 + planReview!.amountCents);
    });

    it("prices a $12,000 project at $315.97 (third band)", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 1_200_000 },
        activeRules(saltLakeCitySeed, "building"),
      );
      // $115.97 for the first $2,000 + 10 x $20.00.
      expect(baseComponent(result)).toBe(31_597);
    });

    it("charges the $55.97 flat floor at $500 and round-ups in the second band", () => {
      const flat = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 50_000 },
        activeRules(saltLakeCitySeed, "building"),
      );
      expect(baseComponent(flat)).toBe(5_597);

      const second = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 125_001 },
        activeRules(saltLakeCitySeed, "building"),
      );
      // $55.97 + $4.00 per $100 or fraction: chargeable $75,001 above $500
      // rounds to 8 x $100 -> $32.00 + $55.97.
      expect(baseComponent(second)).toBe(8_797);
    });

    it("prices the $500,000 seam at the seventh band's printed base $4,625.97", () => {
      const atSeam = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", valuationCents: 50_000_000 },
        activeRules(saltLakeCitySeed, "building"),
      );
      expect(baseComponent(atSeam)).toBe(462_597);
    });

    it("prices electrical and plumbing permits at the $59 base fee", () => {
      const elec = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential" },
        activeRules(saltLakeCitySeed, "electrical"),
      );
      expect(elec.totalCents).toBe(5_900);
      const plumb = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential" },
        activeRules(saltLakeCitySeed, "plumbing"),
      );
      expect(plumb.totalCents).toBe(5_900);
    });
  });

  describe("Provo arithmetic", () => {
    it("prices a $150,000 building project at $1,273.75 plus 65% plan review", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", valuationCents: 15_000_000 },
        activeRules(provoSeed, "building"),
      );
      // $993.75 for the first $100,000 + 50 x $5.60.
      expect(baseComponent(result)).toBe(127_375);
      const planReview = result.components.find((c) => c.componentType === "plan_review");
      expect(planReview).toBeDefined();
      expect(planReview!.amountCents).toBe(Math.round(127_375 * 0.65));
      expect(result.totalCents).toBe(127_375 + planReview!.amountCents);
    });

    it("prices a $12,000 project at $209.25 (third band)", () => {
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 1_200_000 },
        activeRules(provoSeed, "building"),
      );
      // $69.25 for the first $2,000 + 10 x $14.00.
      expect(baseComponent(result)).toBe(20_925);
    });

    it("charges the $23.50 flat floor at $500", () => {
      const flat = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 50_000 },
        activeRules(provoSeed, "building"),
      );
      expect(baseComponent(flat)).toBe(2_350);
    });

    it("prices the $500,000 seam at the seventh band's printed base $3,233.75", () => {
      const atSeam = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", valuationCents: 50_000_000 },
        activeRules(provoSeed, "building"),
      );
      expect(baseComponent(atSeam)).toBe(323_375);
    });

    it("prices commercial electrical at $175 and plumbing minimum at $75", () => {
      const elec = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial" },
        activeRules(provoSeed, "electrical"),
      );
      expect(elec.totalCents).toBe(17_500);
      const plumb = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial" },
        activeRules(provoSeed, "plumbing"),
      );
      expect(plumb.totalCents).toBe(7_500);
    });

    it("prices residential electrical at the $75 inspection minimum", () => {
      const elec = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential" },
        activeRules(provoSeed, "electrical"),
      );
      expect(elec.totalCents).toBe(7_500);
    });
  });

  describe("band-base chaining", () => {
    it("SLC ladder chains exactly at every printed seam", () => {
      // $55.97 + 15 x $4.00 = $115.97
      const at2k = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 200_000 },
        activeRules(saltLakeCitySeed, "building"),
      );
      expect(baseComponent(at2k)).toBe(11_597);
      // $115.97 + 23 x $20.00 = $575.97
      const at25k = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 2_500_000 },
        activeRules(saltLakeCitySeed, "building"),
      );
      expect(baseComponent(at25k)).toBe(57_597);
      // $575.97 + 25 x $14.00 = $925.97
      const at50k = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 5_000_000 },
        activeRules(saltLakeCitySeed, "building"),
      );
      expect(baseComponent(at50k)).toBe(92_597);
      // $925.97 + 50 x $10.00 = $1,425.97
      const at100k = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 10_000_000 },
        activeRules(saltLakeCitySeed, "building"),
      );
      expect(baseComponent(at100k)).toBe(142_597);
    });

    it("Provo ladder chains exactly at every printed seam", () => {
      // $23.50 + 15 x $3.05 = $69.25
      const at2k = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 200_000 },
        activeRules(provoSeed, "building"),
      );
      expect(baseComponent(at2k)).toBe(6_925);
      // $69.25 + 23 x $14.00 = $391.25
      const at25k = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 2_500_000 },
        activeRules(provoSeed, "building"),
      );
      expect(baseComponent(at25k)).toBe(39_125);
      // $391.25 + 25 x $10.10 = $643.75
      const at50k = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 5_000_000 },
        activeRules(provoSeed, "building"),
      );
      expect(baseComponent(at50k)).toBe(64_375);
      // $643.75 + 50 x $7.00 = $993.75
      const at100k = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 10_000_000 },
        activeRules(provoSeed, "building"),
      );
      expect(baseComponent(at100k)).toBe(99_375);
    });
  });
});
