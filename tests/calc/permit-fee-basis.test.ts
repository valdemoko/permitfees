import { describe, expect, it } from "vitest";

import { calculatePermitFees, describeFeeRule, validateFeeRule } from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * A component priced as a percentage of the permit fee it belongs to.
 *
 * This is the capability the City of Phoenix needed. Its building permit fee is a
 * marginal valuation table (Table A), and plan review on top of it is published as
 * "100% of the permit fee, minimum $195" up to $50,000 of valuation and "80% of the
 * permit fee, minimum $195" above it.
 *
 * The alternative was to model plan review as a second copy of Table A with every
 * rate multiplied by 0.8. That is arithmetically identical for any one valuation —
 * but it duplicates eight numbers that would then have to be re-derived by hand
 * every time Phoenix changes a rate, and a drifted copy of a fee schedule is
 * exactly the failure this project exists to avoid. The rule now reads as the City
 * writes it.
 *
 * The rules below are built here rather than imported from the content module, so
 * this file tests the engine primitive on its own. The Phoenix payload is checked
 * separately, against the City's own worked example.
 */

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
    effectiveFrom: "2026-01-20",
    effectiveTo: null,
    status: "active",
    sourceId: null,
    ...overrides,
  };
}

/** Phoenix Table A, exactly as the content module defines it. */
const tableA = rule({
  code: "TABLE-A",
  feeType: "tiered_marginal",
  config: {
    basis: "valuation",
    baseCents: 19_500,
    incrementCents: 100_000,
    tiers: [
      { upToCents: 100_000, rateBps: 0 },
      { upToCents: 1_000_000, rateBps: 120 },
      { upToCents: 5_000_000, rateBps: 100 },
      { upToCents: 20_000_000, rateBps: 90 },
      { upToCents: 100_000_000, rateBps: 90 },
      { upToCents: 1_000_000_000, rateBps: 50 },
      { upToCents: null, rateBps: 50 },
    ],
  },
});

const planReview80 = rule({
  code: "PLAN-REVIEW-80",
  componentType: "plan_review",
  feeType: "percent",
  config: { basis: "permit_fee", rateBps: 8_000 },
  minimumCents: 19_500,
  conditions: { field: "valuation", op: "gt", value: 5_000_000 },
  priority: 200,
});

const planReview100 = rule({
  code: "PLAN-REVIEW-100",
  componentType: "plan_review",
  feeType: "percent",
  config: { basis: "permit_fee", rateBps: 10_000 },
  minimumCents: 19_500,
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 500_000 },
      { field: "valuation", op: "lte", value: 5_000_000 },
    ],
  },
  priority: 200,
});

const AS_OF = "2026-09-24";

describe("Phoenix Table A read as a marginal valuation table", () => {
  // Every figure below is a row of the published table, or a valuation the row's
  // own wording decides ($1,001 is "one additional $1,000, or fraction thereof").
  const cases: Array<{ valuation: number; cents: number; row: string }> = [
    { valuation: 500, cents: 19_500, row: "$195 Base fee only" },
    { valuation: 1_000, cents: 19_500, row: "$195 Base fee only" },
    { valuation: 1_001, cents: 20_700, row: "$195 + $12 x 1" },
    { valuation: 10_000, cents: 30_300, row: "$303 on first $10,000" },
    { valuation: 50_000, cents: 70_300, row: "$703 on first $50,000" },
    { valuation: 200_000, cents: 205_300, row: "$2,053 on first $200,000" },
    { valuation: 1_000_000, cents: 925_300, row: "$9,253 on first $1,000,000" },
    { valuation: 10_000_000, cents: 5_425_300, row: "$54,253 on first $10,000,000" },
    { valuation: 10_000_001, cents: 5_425_800, row: "$54,253 + $5 x 1" },
  ];

  for (const { valuation, cents, row } of cases) {
    it(`charges $${cents / 100} at $${valuation.toLocaleString("en-US")} (${row})`, () => {
      const result = calculatePermitFees({ asOf: AS_OF, valuationCents: valuation * 100 }, [
        tableA,
      ]);
      expect(result.totalCents).toBe(cents);
    });
  }

  it("rounds the valuation up to the next whole $1,000 before applying the bands", () => {
    // $1,000.01 is in the second row: "plus $12 for each additional $1,000, or
    // fraction thereof". A fractional reading would charge $12.00012.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 100_001 }, [tableA]);
    expect(result.totalCents).toBe(20_700);
  });

  it("reproduces the City's own worked example — $250,500 pays a $2,512 permit fee", () => {
    // S1: "The following is an example of a permit fee calculation assuming a total
    // project valuation of $250,500: $2,053 base fee plus $459 (51 x $9) on the
    // project valuation = Total permit fee cost of $2,512".
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 25_050_000 }, [tableA]);
    expect(result.totalCents).toBe(251_200);
  });

  it("says the rounding out loud, because it changes the amount", () => {
    const validated = validateFeeRule(tableA);
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;

    const described = describeFeeRule(validated.rule);
    expect(described).toContain("no charge on the first $1,000");
    expect(described).toContain("1.2% above $1,000");
    expect(described).toContain("$195");
    expect(described).toContain("rounded up to the next $1,000");
  });
});

describe("a rule priced against `permit_fee`", () => {
  it("charges plan review as a percentage of the permit fee it is added to", () => {
    // $250,500 -> permit fee $2,512, plan review 80% of it = $2,009.60.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 25_050_000 }, [
      tableA,
      planReview80,
    ]);

    expect(result.totalCents).toBe(452_160);
    const [base, review] = result.components;
    expect(base?.amountCents).toBe(251_200);
    expect(review?.amountCents).toBe(200_960);
    expect(review?.formula).toBe("80% of calculated permit fee");
  });

  it("charges 100% at or below $50,000 and 80% above it", () => {
    const below = calculatePermitFees({ asOf: AS_OF, valuationCents: 4_000_000 }, [
      tableA,
      planReview100,
      planReview80,
    ]);
    // $40,000 -> permit fee $603 ($303 + $10 x 30), plan review 100% = $603.
    expect(below.totalCents).toBe(120_600);

    const above = calculatePermitFees({ asOf: AS_OF, valuationCents: 6_000_000 }, [
      tableA,
      planReview100,
      planReview80,
    ]);
    // $60,000 -> permit fee $793 ($703 + $9 x 10), plan review 80% = $634.40.
    expect(above.totalCents).toBe(142_740);
    expect(above.components.map((component) => component.code)).toEqual([
      "TABLE-A",
      "PLAN-REVIEW-80",
    ]);
  });

  it("applies the published minimum when the percentage falls below it", () => {
    // A synthetic case: the real Phoenix thresholds never let the $195 floor bind
    // (100% of the cheapest permit a plan review can be charged on is $255), so the
    // floor is exercised against a deliberately tiny base fee instead.
    const tinyBase = rule({
      code: "TINY",
      feeType: "flat",
      config: { amountCents: 5_000 },
    });
    const review = rule({
      code: "REVIEW",
      componentType: "plan_review",
      feeType: "percent",
      config: { basis: "permit_fee", rateBps: 8_000 },
      minimumCents: 19_500,
      priority: 200,
    });

    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 10_000_000 }, [
      tinyBase,
      review,
    ]);

    // 80% of $50 is $40, below the published $195 minimum.
    expect(result.components[1]?.amountCents).toBe(19_500);
    expect(result.totalCents).toBe(24_500);
  });

  it("reads the whole base subtotal even when the base rules sort last", () => {
    // Priorities put the plan review rule first in schedule order, which is what the
    // breakdown must show. The percentage must still be taken from the base fee, so
    // evaluation order and display order are deliberately different.
    const lateBase = { ...tableA, id: "late-base", priority: 900 };
    const earlyReview = { ...planReview80, id: "early-review", priority: 10 };

    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 25_050_000 }, [
      earlyReview,
      lateBase,
    ]);

    const review = result.components.find((component) => component.code === "PLAN-REVIEW-80");
    expect(review?.amountCents).toBe(200_960);
    // Display order still follows the schedule's own sort, not the evaluation order.
    expect(result.components.map((component) => component.code)).toEqual([
      "PLAN-REVIEW-80",
      "TABLE-A",
    ]);
  });

  it("reports the component as excluded when no base fee was computed", () => {
    // No base rule at all: there is nothing to take a percentage of. The rule is
    // excluded and the result warns, rather than charging a confident 0% — or the
    // $195 minimum — for a fee that has no base.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 25_050_000 }, [
      planReview80,
    ]);

    expect(result.totalCents).toBe(0);
    expect(result.components).toHaveLength(0);
    expect(result.excluded[0]?.reason).toBe("missing_input");
    expect(result.warnings.join(" ")).toContain("Calculated permit fee");
  });
});
