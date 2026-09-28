import { describe, expect, it } from "vitest";

import { calculatePermitFees } from "@/lib/calc";
import {
  PER_THOUSAND_COUNT_DENOMINATOR,
  PER_THOUSAND_DENOMINATOR,
  applyCentsPerThousand,
  applyExactCentsPerThousand,
} from "@/lib/calc/money";
import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * A "per $1,000" rate is not the only per-thousand rate a schedule publishes.
 *
 * Miami-Dade prices a permanent electrical service at "$7.26 per 100 amps" and a screen
 * enclosure at "$11.13 per 100 square feet"; Orange County prices a service above 1,000
 * amperes at a flat rate "per ea. add'l. 1,000 amp or fraction". Those are rates per
 * 1,000 of the measured thing, and the basis arrives in its own unit — amperes, square
 * feet — not in cents.
 *
 * The engine divided every per-thousand rate by 100,000, which is cents-to-thousands and
 * therefore only correct for money. On a count basis that is a silent factor of 100:
 * Orange County's 1,500-ampere service came out at **$2.81** instead of $281.00, and every
 * Miami-Dade per-100-ampere row at a cent in the dollar. Nothing in the data could have
 * shown it — the rate in each rule was the schedule's own figure, and the rate's *noun*
 * was already basis-aware. Only the divisor was not.
 *
 * These tests pin the divisor to the two published cases that exposed it, and pin the money
 * side at the same time so the fix cannot drift into the schedules that were already right.
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

describe("the divisor a per-thousand rate is measured in", () => {
  it("counts cents in $1,000 of a money basis", () => {
    expect(PER_THOUSAND_DENOMINATOR).toBe(100_000);
    // $30,000 of basis at $5.36 per $1,000 is 30 x 536 cents.
    expect(applyCentsPerThousand(3_000_000, 536)).toBe(16_080);
  });

  it("counts whole units in 1,000 of a count basis", () => {
    expect(PER_THOUSAND_COUNT_DENOMINATOR).toBe(1_000);
    // 1,000 amperes at $7.26 per 1,000 amperes is $7.26, not 7.26 cents.
    expect(applyCentsPerThousand(200, 7_260, PER_THOUSAND_COUNT_DENOMINATOR)).toBe(1_452);
  });

  it("regresses the money divisor applied to a count: 15 cents where the schedule says $14.52", () => {
    // The old behaviour, pinned on purpose: dividing amperes by the cents-to-thousands
    // divisor reads a $14.52 service as 15 cents. This is the assertion that would have
    // failed before the fix, and it is kept so the two divisors cannot be merged again.
    expect(applyCentsPerThousand(200, 7_260)).toBe(15);
    expect(applyCentsPerThousand(200, 7_260, PER_THOUSAND_COUNT_DENOMINATOR)).toBe(1_452);
  });

  it("carries the exact-fraction form through the same divisor", () => {
    // $4.725 per 1,000 of the basis is 472.5 cents, i.e. 945/2 of a cent.
    //
    // One thousand amperes at that rate is 472.5 cents, rounded half-up to 473.
    expect(applyExactCentsPerThousand(1_000, 945, 2, PER_THOUSAND_COUNT_DENOMINATOR)).toBe(473);
    // The same rate on money: $30,000 is 3,000,000 cents, i.e. 30 thousands, at $4.725.
    expect(applyExactCentsPerThousand(3_000_000, 945, 2)).toBe(14_175);
  });

  it("refuses a non-positive divisor rather than dividing by it", () => {
    expect(() => applyCentsPerThousand(100, 100, 0)).toThrow(/denominator/);
    expect(() => applyExactCentsPerThousand(100, 1, 1, 0)).toThrow(/thousandDenominator/);
  });
});

describe("Miami-Dade's per-100-ampere rows, as the fee sheet prints them", () => {
  const permanentService = rule({
    code: "ELEC-SERVICE-100A",
    feeType: "per_thousand",
    config: { basis: "amperage", centsPerThousand: 7_260, incrementCents: 100 },
    conditions: {
      all: [
        { field: "custom.amperage", op: "gt", value: 0 },
        { field: "custom.electrical_item", op: "eq", value: "permanent_service" },
      ],
    },
  });

  /**
   * "For each 100 amp. or fractional part 7.26" — so 200 A is two hundreds, and 450 A is
   * four and a fractional part, i.e. five.
   */
  it.each([
    [100, 726],
    [200, 1_452],
    [400, 2_904],
    [450, 3_630],
  ])("charges %i amperes as %i cents", (amperage, expected) => {
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { electrical_item: "permanent_service", amperage } },
      [permanentService],
    );
    expect(result.components[0]?.amountCents).toBe(expected);
  });
});

describe("Miami-Dade's per-100-square-foot rows", () => {
  const screenEnclosure = rule({
    code: "BUILD-SCREEN-ENCLOSURE",
    feeType: "per_thousand",
    config: { basis: "square_footage", centsPerThousand: 11_130, incrementCents: 100 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "screen_enclosure" },
  });

  /** "Screen enclosures, per 100 square feet 11.13" — 1,200 sq ft is twelve hundreds. */
  it("charges 1,200 square feet as twelve hundreds at $11.13", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, squareFootage: 1_200, custom: { schedule_item: "screen_enclosure" } },
      [screenEnclosure],
    );
    expect(result.components[0]?.amountCents).toBe(13_356);
  });
});

describe("Orange County's rate above 1,000 amperes", () => {
  const overOneThousand = rule({
    code: "ELEC-3PH-208-240V-OVER-1000",
    feeType: "per_thousand",
    config: {
      basis: "amperage",
      thresholdCents: 1_000,
      incrementCents: 1_000,
      centsPerThousand: 28_100,
    },
    conditions: {
      all: [
        { field: "custom.electrical_service", op: "eq", value: "three_phase_208_240" },
        { field: "custom.amperage", op: "gt", value: 1_000 },
      ],
    },
  });

  /**
   * "Over 1,000 per ea. add'l. 1,000 amp or fraction: 281.00" — and the threshold is in
   * amperes, because that is what the basis measures. A 1,500-ampere service is half of an
   * additional thousand, and the fraction thereof is charged.
   */
  it.each([
    [1_001, 28_100],
    [1_500, 28_100],
    [2_000, 28_100],
    [2_001, 56_200],
    [3_000, 56_200],
  ])("charges %i amperes as %i cents", (amperage, expected) => {
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { electrical_service: "three_phase_208_240", amperage } },
      [overOneThousand],
    );
    expect(result.components[0]?.amountCents).toBe(expected);
  });
});
