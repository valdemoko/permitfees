import { describe, expect, it } from "vitest";

import { calculatePermitFees, describeFeeRule, validateFeeRule, type FeeRuleRecord } from "@/lib/calc";

/**
 * `fee_subtotal` — a surcharge on the whole bill.
 *
 * The City of Seattle applies one: "A technology fee will be applied in addition to
 * all listed fees in Chapters 22.900B, 22.900C, 22.900D, 22.900E, 22.900F and
 * 22.900H in the amount of five percent of all fees or charges required under the
 * above chapters" (SMC 22.900A.100). That is a percentage of the *total*, which the
 * existing `percent` basis could not express: `permit_fee` sums only the base
 * components, so a 5% rule on it would take 5% of the permit fee and miss the plan
 * review and every trade fee charged beside it.
 *
 * Two properties matter and both are asserted here: the subtotal includes components
 * of every type, and it includes only what has been computed *before* the rule that
 * reads it — which is how a state surcharge that must not itself carry the technology
 * fee stays outside it.
 */

const AS_OF = "2026-01-01";

function rule(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return {
    description: null,
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: "2020-01-01",
    effectiveTo: null,
    status: "active",
    sourceId: null,
    ...overrides,
  };
}

const permitFee = rule({
  id: "fixture-permit",
  code: "FIXTURE-PERMIT",
  label: "Permit fee",
  feeType: "flat",
  config: { amountCents: 100_000 },
});

const planReview = rule({
  id: "fixture-review",
  code: "FIXTURE-REVIEW",
  label: "Plan review fee, 50% of the permit fee",
  feeType: "percent",
  componentType: "plan_review",
  priority: 200,
  config: { basis: "permit_fee", rateBps: 5_000 },
});

const technology = rule({
  id: "fixture-technology",
  code: "FIXTURE-TECHNOLOGY",
  label: "Technology fee, 5% of all fees",
  feeType: "percent",
  componentType: "technology",
  priority: 900,
  config: { basis: "fee_subtotal", rateBps: 500 },
});

const stateSurcharge = rule({
  id: "fixture-state",
  code: "FIXTURE-STATE",
  label: "State surcharge",
  feeType: "flat",
  componentType: "state_surcharge",
  priority: 999,
  config: { amountCents: 2_500 },
});

const amountOf = (result: ReturnType<typeof calculatePermitFees>, code: string): number =>
  result.components.find((component) => component.code === code)?.amountCents ?? 0;

describe("fee_subtotal — a percentage of everything charged so far", () => {
  it("is accepted as a basis by the rule schema", () => {
    expect(validateFeeRule(technology).ok).toBe(true);
  });

  it("sums components of every type, not just the base ones", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 0 }, [
      permitFee,
      planReview,
      technology,
    ]);
    // $1,000 permit fee plus $500 of plan review is $1,500, and 5% of that is $75 —
    // not the $50 a percentage of the permit fee alone would have produced.
    expect(amountOf(result, "FIXTURE-TECHNOLOGY")).toBe(7_500);
    expect(result.totalCents).toBe(157_500);
  });

  it("excludes a component ordered after it, so a surcharge cannot surcharge itself", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 0 }, [
      permitFee,
      planReview,
      technology,
      stateSurcharge,
    ]);
    expect(amountOf(result, "FIXTURE-TECHNOLOGY")).toBe(7_500);
    expect(amountOf(result, "FIXTURE-STATE")).toBe(2_500);
    expect(result.totalCents).toBe(160_000);
  });

  it("reads the subtotal in display order too, not in the order the passes ran", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 0 }, [
      permitFee,
      planReview,
      technology,
      stateSurcharge,
    ]);
    // Display order is the schedule's order: permit fee, review, technology, state.
    expect(result.components.map((component) => component.code)).toEqual([
      "FIXTURE-PERMIT",
      "FIXTURE-REVIEW",
      "FIXTURE-TECHNOLOGY",
      "FIXTURE-STATE",
    ]);
  });

  it("is a missing input rather than a confident zero when nothing has been charged", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 0 }, [technology]);
    expect(result.totalCents).toBe(0);
    const excluded = result.excluded.find((entry) => entry.code === "FIXTURE-TECHNOLOGY");
    expect(excluded, "the rule is excluded rather than charged 5% of nothing").toBeDefined();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("describes the basis in the words the schedules use", () => {
    const validated = validateFeeRule(technology);
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;
    const described = describeFeeRule(validated.rule);
    expect(described).toContain("5%");
    expect(described.toLowerCase()).toContain("fees charged");
  });
});
