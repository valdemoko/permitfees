import { describe, expect, it } from "vitest";

import { calculatePermitFees, describeFeeRule, validateFeeRule } from "@/lib/calc";
import { applyExactCentsPerThousand } from "@/lib/calc/money";
import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * The per-$1,000 rate published with more precision than a whole cent can hold.
 *
 * Added while modelling Clark County, Nevada, whose building permit table reads
 * "for the first N, plus X for each additional $1,000 or fraction thereof" with
 * X = $1.683, $7.371, $4.725, $3.402 and $2.934. Three of those are not whole cents
 * per $1,000, and none of them is a whole number of basis points either ($4.725 per
 * $1,000 is 47.25 bps), so both existing primitives would have rounded *before*
 * multiplying and every permit above $25,000 of valuation would have been wrong.
 *
 * This is the same failure Dallas exposed in `percent`, in a different primitive.
 * The fix is deliberately the same shape so there is one idea to learn: a rate
 * published as an exact fraction is carried as an exact fraction.
 */

const AS_OF = "2026-09-24";

function rule(
  overrides: Partial<FeeRuleRecord> & Pick<FeeRuleRecord, "code" | "feeType" | "config">,
): FeeRuleRecord {
  return {
    id: overrides.code,
    label: overrides.code,
    description: null,
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: "2022-03-01",
    effectiveTo: null,
    status: "active",
    sourceId: null,
    ...overrides,
  };
}

/** $4.725 per $1,000 is 472.5 cents, i.e. 945/2 of a cent. */
const CLARK_BAND_4 = rule({
  code: "TABLE-3A-25001-50000",
  label: "Building permit fee, $25,001 to $50,000 of valuation",
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    baseCents: 24_882,
    thresholdCents: 2_500_000,
    incrementCents: 100_000,
    rateCentsPerThousand: { numerator: 945, denominator: 2 },
  },
});

describe("a per-$1,000 rate carried as an exact fraction", () => {
  it("is exact in the money layer", () => {
    // $30,000 chargeable at $4.725 per $1,000: 472.5 x 30 = 14,175 cents.
    expect(applyExactCentsPerThousand(3_000_000, 945, 2)).toBe(14_175);
    // The whole-cent form and the exact form must agree where both can express it.
    expect(applyExactCentsPerThousand(3_000_000, 94_500, 200)).toBe(14_175);
  });

  it("reproduces the band's own worked arithmetic to the cent", () => {
    // $248.82 for the first $25,000, plus $4.725 for each additional $1,000.
    // A $40,000 valuation is 15 additional thousands: 248.82 + 70.875 = $319.695.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 4_000_000 }, [CLARK_BAND_4]);
    expect(result.totalCents).toBe(31_970);
    expect(result.components[0]?.amountCents).toBe(31_970);
  });

  it("rounds up to the next whole $1,000 for a partial thousand", () => {
    // $25,001 is one cent into the band, and the schedule says "or fraction
    // thereof", so a whole additional thousand is charged: 248.82 + 4.725 = $253.545.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 2_500_100 }, [CLARK_BAND_4]);
    expect(result.totalCents).toBe(25_355);
    expect(result.components[0]?.steps.map((step) => step.label)).toContain(
      "Rounded up to the next $1,000 or fraction thereof",
    );
  });

  it("charges only the base at the floor of the band", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 2_500_000 }, [CLARK_BAND_4]);
    expect(result.totalCents).toBe(24_882);
  });

  it("prints the rate the way the document prints it", () => {
    const validation = validateFeeRule(CLARK_BAND_4);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    // "$4.725", not "$4.73" and not "47.25 bps": the printed rate is the published
    // one, which is the whole point of carrying it as a fraction.
    expect(describeFeeRule(validation.rule)).toBe(
      "$248.82 + $4.725 per $1,000 of project valuation above $25,000, or fraction thereof",
    );
  });

  it("stays exact where a basis-point rate would drift", () => {
    // The same rate read as 47.25 bps has to become 47 or 48 before multiplying, and
    // a $10,000,000 valuation then differs by thousands of dollars.
    const exact = calculatePermitFees({ asOf: AS_OF, valuationCents: 1_000_000_000 }, [
      { ...CLARK_BAND_4, config: { basis: "valuation", rateCentsPerThousand: { numerator: 945, denominator: 2 } } },
    ]);
    const rounded = calculatePermitFees({ asOf: AS_OF, valuationCents: 1_000_000_000 }, [
      { ...CLARK_BAND_4, config: { basis: "valuation", rateBps: 0 } },
    ]);

    // 1,000,000,000 cents x 945 / 200,000 = 4,725,000 cents.
    expect(exact.totalCents).toBe(4_725_000);
    expect(rounded.totalCents).not.toBe(exact.totalCents);
  });

  it("rejects a rule that states both rate forms, and one that states neither", () => {
    const both = validateFeeRule(
      rule({
        code: "both",
        feeType: "per_thousand",
        config: { basis: "valuation", centsPerThousand: 536, rateCentsPerThousand: { numerator: 1, denominator: 2 } },
      }),
    );
    expect(both.ok).toBe(false);

    const neither = validateFeeRule(
      rule({ code: "neither", feeType: "per_thousand", config: { basis: "valuation" } }),
    );
    expect(neither.ok).toBe(false);
    if (!neither.ok) expect(neither.error).toContain("exactly one");
  });

  it("still reads a whole-cent rate unchanged", () => {
    const wholeCents = validateFeeRule(
      rule({
        code: "whole",
        feeType: "per_thousand",
        config: { basis: "valuation", centsPerThousand: 450, thresholdCents: 5_000_000, incrementCents: 100_000, baseCents: 41_450 },
      }),
    );
    expect(wholeCents.ok).toBe(true);
    if (!wholeCents.ok) return;

    expect(describeFeeRule(wholeCents.rule)).toBe(
      "$414.50 + $4.50 per $1,000 of project valuation above $50,000, or fraction thereof",
    );
    // Boulder City's band: $414.50 for the first $50,000, then $4.50 per $1,000.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 10_000_000 }, [
      wholeCents.rule,
    ]);
    expect(result.totalCents).toBe(63_950);
  });
});
