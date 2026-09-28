import { describe, expect, it } from "vitest";

import { calculatePermitFees, describeFeeRule, validateFeeRule } from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * The two capabilities Dallas needed, and the guard that keeps a mis-placed field
 * from silently changing a published fee.
 *
 * Both were added while modelling Dallas — a schedule whose rates have more
 * decimals than basis points can hold, whose construction tables charge a rate on
 * the *whole* basis from inside a bracket, and whose trade inspection fee is a
 * count with a ceiling. None of the three needed a new fee type: they needed the
 * existing `percent` primitive to carry an exact fraction and to say what unit that
 * fraction is in, and `per_unit` to have a `trades` count to read.
 */

function rule(overrides: Partial<FeeRuleRecord> & Pick<FeeRuleRecord, "code" | "feeType" | "config">): FeeRuleRecord {
  return {
    id: overrides.code,
    label: overrides.code,
    description: null,
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: "2024-05-01",
    effectiveTo: null,
    status: "active",
    sourceId: null,
    ...overrides,
  };
}

const AS_OF = "2026-09-24";

describe("percent rules published with more precision than basis points", () => {
  it("reproduces the City of Dallas's own worked example to the cent", () => {
    // S2's commercial example: $6,000,500 of valuation in the 5,000,001-10,000,000
    // bracket, which is `x 0.005095 + $1,100`. The published rate is 509.5 basis
    // points — not an integer — so as basis points it would have been rounded
    // before multiplying and the example would not come out.
    const commercial = rule({
      code: "A-III-5000001-10000000",
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: { numerator: 5_095, denominator: 1_000_000 },
        baseCents: 110_000,
      },
    });

    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 600_050_000 }, [commercial]);

    // 600,050,000 x 0.005095 = 3,057,254.75 -> 3,057,255 cents, plus the $1,100.
    expect(result.totalCents).toBe(3_167_255);
    expect(result.components[0]?.amountCents).toBe(3_167_255);
  });

  it("keeps a rate exact when rounding it first would change the money", () => {
    // The same rate as whole basis points (510) would compound over the brackets.
    // 0.5095% against $6,000,500 is $30,572.55; 0.51% is $30,602.55 — $30 apart
    // from a rounding decision made before the multiplication.
    const exact = rule({
      code: "exact",
      feeType: "percent",
      config: { basis: "valuation", rate: { numerator: 5_095, denominator: 1_000_000 } },
    });
    // 0.5095% is 50.95 basis points, so a basis-point rate has to round to 51.
    const rounded = rule({
      code: "rounded",
      feeType: "percent",
      config: { basis: "valuation", rateBps: 51 },
    });

    const exactResult = calculatePermitFees({ asOf: AS_OF, valuationCents: 600_050_000 }, [exact]);
    const roundedResult = calculatePermitFees({ asOf: AS_OF, valuationCents: 600_050_000 }, [
      rounded,
    ]);

    expect(exactResult.totalCents).toBe(3_057_255);
    expect(roundedResult.totalCents).toBe(3_060_255);
    expect(exactResult.totalCents).not.toBe(roundedResult.totalCents);
  });

  it("says a per-unit rate as an amount, not as a percentage", () => {
    // Dallas Table A-I is `square feet x 0.34569 + 300`, where 0.34569 is dollars
    // per square foot. Read as a fraction it is 3456.9% of the project area, which
    // is arithmetically the same number and useless to a reader. `rateUnit` decides
    // which way it is said.
    const perSquareFoot = validateFeeRule(
      rule({
        code: "A-I-701-2350",
        feeType: "percent",
        label: "New single-family and duplex construction permit fee",
        config: {
          basis: "square_footage",
          rate: { numerator: 34_569, denominator: 1_000 },
          rateUnit: "currency_per_unit",
          baseCents: 30_000,
        },
      }),
    );
    expect(perSquareFoot.ok).toBe(true);
    if (!perSquareFoot.ok) return;

    expect(describeFeeRule(perSquareFoot.rule)).toBe("$0.34569 per sq ft + $300.00");

    const result = calculatePermitFees({ asOf: AS_OF, squareFootage: 2_500 }, [perSquareFoot.rule]);
    // 2,500 x $0.34569 = $864.23, plus $300 = $1,164.23.
    expect(result.totalCents).toBe(116_423);
  });

  it("still says a valuation rate as a percentage", () => {
    const validation = validateFeeRule(
      rule({
        code: "A-III-60001-200000",
        feeType: "percent",
        config: {
          basis: "valuation",
          rate: { numerator: 27_665, denominator: 1_000_000 },
          baseCents: 35_000,
        },
      }),
    );
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    // Six decimals, not three: 2.7665% would have printed as 2.767%, a different
    // rate from the one in the schedule.
    expect(describeFeeRule(validation.rule)).toBe("2.7665% of project valuation + $350.00");
  });
});

describe("whichever is greater: a rate with a published floor", () => {
  const planReview = rule({
    code: "PLAN-REVIEW-303",
    feeType: "percent",
    componentType: "plan_review",
    status: "draft",
    config: {
      basis: "square_footage",
      rate: { numerator: 46, denominator: 10 },
      rateUnit: "currency_per_unit",
    },
    minimumCents: 57_700,
  });

  it("charges the area rate when it exceeds the minimum", () => {
    const result = calculatePermitFees({ asOf: AS_OF, squareFootage: 25_000 }, [
      { ...planReview, status: "active" },
    ]);
    // 25,000 x $0.046 = $1,150, which is above the $577 floor, so no clamp applies.
    expect(result.totalCents).toBe(115_000);
    expect(result.components[0]?.steps.map((step) => step.label)).not.toContain(
      "Minimum fee applied",
    );
  });

  it("clamps up to the published minimum below it", () => {
    const result = calculatePermitFees({ asOf: AS_OF, squareFootage: 2_500 }, [
      { ...planReview, status: "active" },
    ]);
    // 2,500 x $0.046 = $115, so the $577 minimum applies — which is what the
    // City's own worksheet shows for a 2,500 sq ft house.
    expect(result.totalCents).toBe(57_700);
    expect(result.components[0]?.steps).toContainEqual({
      label: "Minimum fee applied",
      value: "$577.00",
    });
  });

  it("is excluded from a total while it is a draft", () => {
    const result = calculatePermitFees({ asOf: AS_OF, squareFootage: 2_500 }, [planReview]);
    expect(result.totalCents).toBe(0);
    expect(result.excluded[0]?.reason).toBe("inactive");
  });
});

describe("the trade-count inspection fee", () => {
  const inspections = rule({
    code: "INSP-TRADES",
    feeType: "per_unit",
    componentType: "inspection",
    config: { unit: "trades", centsPerUnit: 12_500 },
    maximumCents: 112_500,
  });

  it("reproduces all nine published rows", () => {
    const published: Array<[number, number]> = [
      [1, 12_500],
      [2, 25_000],
      [3, 37_500],
      [4, 50_000],
      [5, 62_500],
      [6, 75_000],
      [7, 87_500],
      [8, 100_000],
      [9, 112_500],
    ];

    for (const [trades, expected] of published) {
      const result = calculatePermitFees({ asOf: AS_OF, custom: { trades } }, [inspections]);
      expect(result.totalCents, `${trades} trades`).toBe(expected);
    }
  });

  it("holds the ceiling above nine trades", () => {
    // The schedule's last row is "9 or more", so 20 trades is still $1,125.
    const result = calculatePermitFees({ asOf: AS_OF, custom: { trades: 20 } }, [inspections]);
    expect(result.totalCents).toBe(112_500);
    expect(result.components[0]?.steps.map((step) => step.label)).toContain("Maximum fee applied");
  });

  it("does not charge when the count is absent, and says why", () => {
    const result = calculatePermitFees({ asOf: AS_OF }, [inspections]);
    expect(result.totalCents).toBe(0);
    expect(result.excluded[0]?.reason).toBe("missing_input");
  });
});

describe("a config field in the wrong place fails loudly", () => {
  /**
   * The mistake that motivated making every config object strict. Zod strips
   * unknown keys by default, so a rule whose `minimumCents` was written inside
   * `config` instead of beside it validated, lost the field, and published a plan
   * review fee of $115 where the schedule says the floor is $577.
   */
  it("rejects a rule whose floor was written inside config", () => {
    const validation = validateFeeRule(
      rule({
        code: "PLAN-REVIEW-303",
        feeType: "percent",
        config: {
          basis: "square_footage",
          rate: { numerator: 46, denominator: 10 },
          minimumCents: 57_700,
        },
      }),
    );

    expect(validation.ok).toBe(false);
    if (validation.ok) return;
    expect(validation.error).toContain("minimumCents");
  });

  it("rejects an unknown key at any depth", () => {
    const flat = validateFeeRule(
      rule({ code: "flat", feeType: "flat", config: { amountCents: 1_500, currency: "USD" } }),
    );
    expect(flat.ok).toBe(false);

    const tier = validateFeeRule(
      rule({
        code: "tier",
        feeType: "tiered_marginal",
        config: {
          basis: "valuation",
          tiers: [{ upToCents: null, rateBps: 100, baseCents: 5_000 }],
        },
      }),
    );
    expect(tier.ok).toBe(false);
  });

  it("rejects a rateUnit with no exact rate to describe", () => {
    const validation = validateFeeRule(
      rule({
        code: "bps-with-unit",
        feeType: "percent",
        config: { basis: "valuation", rateBps: 150, rateUnit: "currency_per_unit" },
      }),
    );
    expect(validation.ok).toBe(false);
  });
});
