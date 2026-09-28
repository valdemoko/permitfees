import { describe, expect, it } from "vitest";

import { calculatePermitFees, describeFeeRule, validateFeeRule } from "@/lib/calc";
import { roundToNearestIncrement } from "@/lib/calc/money";
import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * The other rounding a schedule can print.
 *
 * Almost every schedule in the dataset says "or fraction thereof" and rounds up;
 * Tulsa's building permit fee says the opposite: each band is "calculated in One
 * Thousand Dollar ($1,000.00) increments **to the closest** One Thousand Dollars".
 * At $40,499 that is forty steps, not forty-one — and an always-up reading would
 * charge $6.18 too much on the band and $3.09 too much on every dollar of the
 * excess band above $150,000.
 *
 * Added with the Oklahoma pass (research/oklahoma/tulsa.md). The mode lives on
 * `per_thousand` because that is where Tulsa needs it, and it is refused without
 * an increment: a rounding mode with nothing to round would silently do nothing.
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
    effectiveFrom: "2021-08-25",
    effectiveTo: null,
    status: "active",
    sourceId: null,
    ...overrides,
  };
}

/** Tulsa § 302.B: $6.18 per $1,000 of valuation, to the closest $1,000. */
const TULSA_BAND_B = rule({
  code: "TULSA-302-B",
  label: "Building permit fee, over $40,000 to $150,000 of valuation",
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    centsPerThousand: 618,
    incrementCents: 100_000,
    incrementRounding: "nearest",
  },
});

/** Tulsa § 302.C (reading charged): $927 at the cap plus $3.09 per $1,000 above $150,000. */
const TULSA_BAND_C = rule({
  code: "TULSA-302-C",
  label: "Building permit fee, above $150,000 of valuation",
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    centsPerThousand: 309,
    thresholdCents: 15_000_000,
    incrementCents: 100_000,
    incrementRounding: "nearest",
    baseCents: 92_700,
  },
});

describe("roundToNearestIncrement", () => {
  it("rounds halves upward and floors the rest", () => {
    expect(roundToNearestIncrement(4_049_900, 100_000)).toBe(4_000_000);
    expect(roundToNearestIncrement(4_050_000, 100_000)).toBe(4_100_000);
    expect(roundToNearestIncrement(4_050_001, 100_000)).toBe(4_100_000);
    expect(roundToNearestIncrement(0, 100_000)).toBe(0);
  });

  it("refuses values and increments the same way the always-up rounding does", () => {
    expect(() => roundToNearestIncrement(-1, 100_000)).toThrow();
    expect(() => roundToNearestIncrement(100, 0)).toThrow();
  });
});

describe("a per-$1,000 rate rounded to the closest increment", () => {
  it("charges forty steps at $40,499 where an always-up reading charges forty-one", () => {
    // $40,499 -> closest thousand $40,000 -> 40 x $6.18 = $247.20.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 4_049_900 }, [TULSA_BAND_B]);
    expect(result.totalCents).toBe(24_720);
    // The same rule written the ordinary way would round to $41,000 = $253.38,
    // which is what the schedule's own phrase forbids.
    const alwaysUp = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 4_049_900 },
      [rule({ ...TULSA_BAND_B, config: { basis: "valuation", centsPerThousand: 618, incrementCents: 100_000 } })],
    );
    expect(alwaysUp.totalCents).toBe(25_338);
  });

  it("rounds an exact half-thousand up, and shows the rounding line", () => {
    // $40,500 -> closest thousand $41,000 -> 41 x $6.18 = $253.38.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 4_050_000 }, [TULSA_BAND_B]);
    expect(result.totalCents).toBe(25_338);
    expect(result.components[0]?.steps.some((step) => step.label.includes("closest $1,000"))).toBe(true);
  });

  it("rounds the excess band's own thousands to the closest", () => {
    // $150,499: excess $499 -> closest thousand $0 -> just the $927.00 cap.
    const belowHalf = calculatePermitFees({ asOf: AS_OF, valuationCents: 15_049_900 }, [TULSA_BAND_C]);
    expect(belowHalf.totalCents).toBe(92_700);

    // $151,500: excess $1,500 -> closest thousand $2,000 -> 927.00 + 2 x 3.09.
    const aboveHalf = calculatePermitFees({ asOf: AS_OF, valuationCents: 15_150_000 }, [TULSA_BAND_C]);
    expect(aboveHalf.totalCents).toBe(93_318);
  });

  it("describes the mode the way the schedule words it", () => {
    const validation = validateFeeRule(TULSA_BAND_B);
    expect(validation.ok).toBe(true);
    if (validation.ok) {
      expect(describeFeeRule(validation.rule)).toContain("calculated to the closest $1,000");
    }
  });

  it("is refused without an increment to round", () => {
    const orphaned = rule({
      code: "TULSA-ORPHANED-ROUNDING",
      label: "Rounding with no increment",
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        centsPerThousand: 618,
        incrementRounding: "nearest",
      },
    });
    const validation = validateFeeRule(orphaned);
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.error).toContain("incrementRounding requires incrementCents");
    }
  });
});
