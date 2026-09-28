import { describe, expect, it } from "vitest";

import { calculatePermitFees, describeFeeRule } from "@/lib/calc/engine";
import { applyCentsPerThousand, roundUpToIncrement } from "@/lib/calc/money";
import { validateFeeRule } from "@/lib/calc/schemas";
import type { FeeRuleRecord } from "@/lib/calc/types";
import { formatCents } from "@/lib/format";

import {
  HOUSTON_ADMINISTRATIVE_FEE,
  HOUSTON_ELECTRICAL_METER_LOOP_UP_TO_50KW,
  HOUSTON_ELECTRICAL_OUTLET,
  HOUSTON_MINIMUM_PERMIT_FEE,
  HOUSTON_PLUMBING_FIXTURE,
  HOUSTON_STRUCTURAL_BRACKETS,
} from "./houston.fixtures";

/**
 * Regression tests against the City of Houston's published fee schedule.
 *
 * Source: https://cohweb.houstontx.gov/fin_feeschedule/default.aspx
 *         Department HPW, `As Of 01/01/2026`, read 2026-09-23.
 *         See research/texas/houston.md.
 *
 * Every expected value below is derived from the city's own published formula
 * `Base Charge + Rate x ceil((valuation - floor) / $1,000)`, so a future change
 * to the engine that breaks a published figure fails here rather than on a page.
 */

const AS_OF = "2026-09-23";

function feeFor(valuationCents: number, rules = HOUSTON_STRUCTURAL_BRACKETS) {
  return calculatePermitFees({ asOf: AS_OF, valuationCents }, rules);
}

function dollars(cents: number): string {
  return formatCents(cents);
}

/**
 * `FeeRuleRecord.config` is `unknown` on purpose — it arrives as JSONB and is
 * only meaningful once validated. These helpers read it for assertions only;
 * every number they read is passed through `validateFeeRule` first.
 */
function flatAmount(rule: FeeRuleRecord | undefined): number {
  const config = rule?.config as { amountCents?: number } | undefined;
  return config?.amountCents ?? -1;
}

function baseCharge(rule: FeeRuleRecord | undefined): number {
  const config = rule?.config as { baseCents?: number } | undefined;
  return config?.baseCents ?? -1;
}

describe("per_thousand primitive (the published unit)", () => {
  it("reproduces '$5.36 per $1,000' exactly", () => {
    // 14_300_000 cents is $143,000 = 143 thousands x $5.36 = $766.48
    expect(applyCentsPerThousand(14_300_000, 536)).toBe(76_648);
    expect(dollars(76_648)).toBe("$766.48");
  });

  it("is exact where a basis-point rate could not be", () => {
    // $5.36 per $1,000 is 53.6 bps. Rounding to 54 bps would give $772.20 here,
    // $5.72 wrong, on a single bracket. This is why the primitive exists.
    expect(applyCentsPerThousand(14_300_000, 536)).toBe(76_648);
    expect(Math.round((14_300_000 * 54) / 10_000)).toBe(77_220);
  });

  it("rounds half up only at the final step", () => {
    // $0.01 of valuation at $1.00 per $1,000 -> 0.001 cents -> 0 cents
    expect(applyCentsPerThousand(1, 100)).toBe(0);
    // $10 of valuation at $1.00 per $1,000 -> exactly 1 cent
    expect(applyCentsPerThousand(1_000, 100)).toBe(1);
  });
});

describe("Houston structural building permit fee — Bldg. Code Sec. 118.2.1", () => {
  it("charges the published flat $47.00 for valuations up to $7,000", () => {
    expect(feeFor(100).totalCents).toBe(4_700); // $1.00
    expect(feeFor(500_000).totalCents).toBe(4_700); // $5,000
    expect(feeFor(700_000).totalCents).toBe(4_700); // exactly $7,000
    expect(dollars(4_700)).toBe("$47.00");
  });

  it("charges $52.36 at $7,001 — one whole $1,000 increment", () => {
    // $47.00 + $5.36 x ceil($1 / $1,000) = $47.00 + $5.36
    expect(feeFor(700_100).totalCents).toBe(5_236);
    expect(dollars(5_236)).toBe("$52.36");
  });

  it("charges $545.48 at $100,000", () => {
    // $47.00 + $5.36 x 93 thousands
    expect(feeFor(10_000_000).totalCents).toBe(54_548);
    expect(dollars(54_548)).toBe("$545.48");
  });

  it("charges $813.48 at $150,000 — the top of the first rate band", () => {
    expect(feeFor(15_000_000).totalCents).toBe(81_348);
    expect(dollars(81_348)).toBe("$813.48");
  });

  it("charges $1,066.57 at $200,000", () => {
    // Bracket 3: $815.07 + $5.03 x 50
    expect(feeFor(20_000_000).totalCents).toBe(106_657);
    expect(dollars(106_657)).toBe("$1,066.57");
  });

  it("charges $1,301.86 at $250,000", () => {
    // Bracket 4: $1,066.86 + $4.70 x 50
    expect(feeFor(25_000_000).totalCents).toBe(130_186);
    expect(dollars(130_186)).toBe("$1,301.86");
  });

  it("charges $4,419.66 at $1,000,000", () => {
    // Bracket 6: $2,409.66 + $4.02 x 500
    expect(feeFor(100_000_000).totalCents).toBe(441_966);
    expect(dollars(441_966)).toBe("$4,419.66");
  });

  it("charges $19,143.87 at $5,000,000", () => {
    // Bracket 7: $4,423.87 + $3.68 x 4,000
    expect(feeFor(500_000_000).totalCents).toBe(1_914_387);
    expect(dollars(1_914_387)).toBe("$19,143.87");
  });

  it("charges $123,234.09 at $60,000,000", () => {
    // Bracket 9: $109,834.09 + $1.34 x 10,000
    expect(feeFor(6_000_000_000).totalCents).toBe(12_323_409);
    expect(dollars(12_323_409)).toBe("$123,234.09");
  });

  it("matches the bracket base charges the document publishes", () => {
    // These are the city's own figures for "Base Charge for first $X". Asserting
    // them proves we transcribed the document correctly rather than re-derived it.
    expect(dollars(baseCharge(HOUSTON_STRUCTURAL_BRACKETS[1]))).toBe("$47.00");
    expect(dollars(baseCharge(HOUSTON_STRUCTURAL_BRACKETS[2]))).toBe("$815.07");
    expect(dollars(baseCharge(HOUSTON_STRUCTURAL_BRACKETS[3]))).toBe("$1,066.86");
    expect(dollars(baseCharge(HOUSTON_STRUCTURAL_BRACKETS[4]))).toBe("$1,536.83");
    expect(dollars(baseCharge(HOUSTON_STRUCTURAL_BRACKETS[5]))).toBe("$2,409.66");
    expect(dollars(baseCharge(HOUSTON_STRUCTURAL_BRACKETS[6]))).toBe("$4,423.87");
    expect(dollars(baseCharge(HOUSTON_STRUCTURAL_BRACKETS[7]))).toBe("$19,194.73");
    expect(dollars(baseCharge(HOUSTON_STRUCTURAL_BRACKETS[8]))).toBe("$109,834.09");
  });
});

describe("Houston — the schedule's internal drift is reproduced, not smoothed", () => {
  /**
   * The city adjusts each bracket independently each year, so its published base
   * charges do not chain arithmetically (research/texas/houston.md, Ambiguity A4).
   *
   * These tests pin the fact that we use the PUBLISHED base charge. If someone
   * later "fixes" the engine or the data to reconcile the brackets, that change
   * would make our numbers disagree with the permit office's invoice, and these
   * tests are what catch it.
   */
  it("$150,000 computes to $813.48 while the next bracket's base is $815.07", () => {
    expect(feeFor(15_000_000).totalCents).toBe(81_348);

    // Bracket 3's published base charge for the first $150,000 is $815.07, i.e.
    // $1.59 more than what bracket 2's own arithmetic produces at its ceiling.
    const publishedBase = baseCharge(HOUSTON_STRUCTURAL_BRACKETS[2]);
    expect(publishedBase - 81_348).toBe(159);
  });

  it("$5,000,000 computes to $19,143.87 while the next bracket's base is $19,194.73", () => {
    expect(feeFor(500_000_000).totalCents).toBe(1_914_387);
    const publishedBase = baseCharge(HOUSTON_STRUCTURAL_BRACKETS[7]);
    expect(publishedBase - 1_914_387).toBe(5_086);
  });
});

describe("Houston — 'or fraction thereof' is not cosmetic", () => {
  it("charges a whole $1,000 increment for one cent over a boundary", () => {
    // $150,000.01 falls into bracket 3 and pays a full $5.03 increment.
    const oneCentOver = feeFor(15_000_001);
    expect(oneCentOver.totalCents).toBe(82_010);
    expect(dollars(82_010)).toBe("$820.10");
  });

  it("rounds a partial increment up", () => {
    // $143,000.01 above the floor is 143.00001 thousands -> 144
    expect(roundUpToIncrement(14_300_001, 100_000)).toBe(14_400_000);
    expect(applyCentsPerThousand(14_400_000, 536)).toBe(77_184);
  });
});

describe("Houston — plumbing fixtures, Bldg. Code Sec. 118.5.4", () => {
  it("charges the base $34.24 for 1 to 3 fixtures", () => {
    for (const count of [1, 2, 3]) {
      expect(calculatePermitFees({ asOf: AS_OF, fixtures: count }, [HOUSTON_PLUMBING_FIXTURE]).totalCents).toBe(
        3_424,
      );
    }
  });

  it("charges $11.41 for each additional fixture over 3", () => {
    // 4 fixtures -> $34.24 + $11.41 x 1
    expect(
      calculatePermitFees({ asOf: AS_OF, fixtures: 4 }, [HOUSTON_PLUMBING_FIXTURE]).totalCents,
    ).toBe(4_565);
    // 10 fixtures -> $34.24 + $11.41 x 7
    expect(
      calculatePermitFees({ asOf: AS_OF, fixtures: 10 }, [HOUSTON_PLUMBING_FIXTURE]).totalCents,
    ).toBe(11_411);
  });
});

describe("Houston — electrical, Bldg. Code Sec. 118.6", () => {
  it("charges $1.34 per outlet", () => {
    // `custom.outlets`, not `fixtures`: the outlet row used to read the plumbing
    // fixture count, which meant the breakdown described outlets as fixtures and
    // two rules in two trades addressed the same input.
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { outlets: 40 } },
      [HOUSTON_ELECTRICAL_OUTLET],
    );
    expect(result.totalCents).toBe(5_360);
    expect(dollars(5_360)).toBe("$53.60");
  });

  it("does not charge for outlets when only a fixture count is given", () => {
    // The two counts are different things. A plumbing fixture count must not
    // price electrical outlets, and the engine says so instead of guessing.
    const result = calculatePermitFees({ asOf: AS_OF, fixtures: 40 }, [
      HOUSTON_ELECTRICAL_OUTLET,
    ]);

    expect(result.totalCents).toBe(0);
    expect(result.excluded.map((rule) => rule.reason)).toEqual(["missing_input"]);
  });

  it("charges $94.00 for a meter loop and service up to 50 kW", () => {
    const result = calculatePermitFees({ asOf: AS_OF }, [HOUSTON_ELECTRICAL_METER_LOOP_UP_TO_50KW]);
    expect(result.totalCents).toBe(9_400);
  });

  it("sums separately-priced electrical components", () => {
    const result = calculatePermitFees({ asOf: AS_OF, custom: { outlets: 12 } }, [
      HOUSTON_ELECTRICAL_METER_LOOP_UP_TO_50KW,
      HOUSTON_ELECTRICAL_OUTLET,
    ]);
    // $94.00 + 12 x $1.34
    expect(result.totalCents).toBe(11_008);
  });
});

describe("Houston — minimum fee interaction is disputed in the source", () => {
  /**
   * Bldg. Code Sec. 118.1.3 publishes a $91.06 minimum permit fee for all permits
   * except plumbing. Bldg. Code Sec. 118.2.1 publishes a $47.00 flat fee for
   * valuations up to $7,000.
   *
   * For a $5,000 valuation, the two published rules give different answers. The
   * schedule does not say which prevails. research/texas/houston.md records this as
   * Ambiguity A8, and the $91.06 rule ships as `draft` so it is never silently
   * added to a published figure. Instead the engine reports it as excluded, with
   * a reason, which is what the page shows the reader.
   */
  const DRAFTED_MINIMUM = { ...HOUSTON_MINIMUM_PERMIT_FEE, status: "draft" as const };

  it("does not add the drafted minimum to the calculated fee", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 500_000 }, [
      ...HOUSTON_STRUCTURAL_BRACKETS,
      DRAFTED_MINIMUM,
    ]);

    expect(result.totalCents).toBe(4_700);
    expect(result.appliedRuleIds).not.toContain(DRAFTED_MINIMUM.id);
  });

  it("reports the minimum as excluded, with the reason, so the page can explain it", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 500_000 }, [
      ...HOUSTON_STRUCTURAL_BRACKETS,
      DRAFTED_MINIMUM,
    ]);

    const excluded = result.excluded.find((rule) => rule.ruleId === DRAFTED_MINIMUM.id);
    expect(excluded?.reason).toBe("inactive");
    expect(excluded?.detail).toContain("draft");
  });

  it("publishes the minimum fee figure itself, because it is a real scheduled amount", () => {
    expect(dollars(flatAmount(HOUSTON_MINIMUM_PERMIT_FEE))).toBe("$91.06");
  });
});

describe("Houston — administrative fee", () => {
  it("is a real scheduled amount, shown separately from the permit fee", () => {
    // Bldg. Code Sec. 118.1.1, and the schedule's own note about Code Sec. 1-14.
    expect(dollars(flatAmount(HOUSTON_ADMINISTRATIVE_FEE))).toBe("$33.56");
  });

  it("stays out of the default total because the schedule says 'may be subject to'", () => {
    const drafted = { ...HOUSTON_ADMINISTRATIVE_FEE, status: "draft" as const };
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 10_000_000 }, [
      ...HOUSTON_STRUCTURAL_BRACKETS,
      drafted,
    ]);
    expect(result.totalCents).toBe(54_548);
  });
});

describe("Houston — every transcribed rule validates", () => {
  const allRules = [
    ...HOUSTON_STRUCTURAL_BRACKETS,
    HOUSTON_MINIMUM_PERMIT_FEE,
    HOUSTON_ADMINISTRATIVE_FEE,
    HOUSTON_PLUMBING_FIXTURE,
    HOUSTON_ELECTRICAL_OUTLET,
    HOUSTON_ELECTRICAL_METER_LOOP_UP_TO_50KW,
  ];

  it("passes validation, so no rule can silently fail to calculate", () => {
    for (const rule of allRules) {
      const result = validateFeeRule(rule);
      expect(result.ok, `${rule.code}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });

  it("describes each rule in a way a reader can check against the document", () => {
    const structural = HOUSTON_STRUCTURAL_BRACKETS[1];
    const validated = structural ? validateFeeRule(structural) : null;
    expect(validated?.ok).toBe(true);
    if (validated?.ok) {
      expect(describeFeeRule(validated.rule)).toBe(
        "$47.00 + $5.36 per $1,000 of project valuation above $7,000, or fraction thereof",
      );
    }
  });

  it("describes the plumbing fixture fee the way the code reads", () => {
    const validated = validateFeeRule(HOUSTON_PLUMBING_FIXTURE);
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      expect(describeFeeRule(validated.rule)).toBe(
        "$34.24 for the first 3 fixtures, plus $11.41 for each additional fixture",
      );
    }
  });

  it("rejects a per-unit base charge with no stated allowance", () => {
    // Without an allowance the base amount and the per-unit rate would both
    // charge the first unit, which is a double charge, not a fee schedule.
    const broken = {
      ...HOUSTON_PLUMBING_FIXTURE,
      config: { unit: "fixtures" as const, centsPerUnit: 1_141, baseCents: 3_424 },
    };
    expect(validateFeeRule(broken).ok).toBe(false);
  });
});
