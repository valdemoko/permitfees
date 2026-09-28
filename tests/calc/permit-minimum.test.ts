import { describe, expect, it } from "vitest";

import { calculatePermitFees, describeFeeRule, validateFeeRule } from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * A floor on the whole permit, charged as the shortfall.
 *
 * Every other minimum in this engine floors one rule's own amount — `minimumCents` on the
 * rule record — which is what a schedule means when it says its minimum is "applicable to
 * all items in this section": a $88.55 slab permit is $147.00, and a permit combining two
 * items pays the floor twice.
 *
 * Miami-Dade County's two trade fee sheets say the opposite, in as many words: "Minimum fee
 * for electrical permits is $227.90". The floor is once per *permit*, and a permit is as
 * many rows as the job has — so a permit carrying a service, sixty outlets, a panel, forty
 * fixtures and five tons of cooling is one floor, not five. That is the case this type
 * exists for, and the case a rule-level minimum gets wrong by a factor of five.
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

/** Two small fee rows, so a permit's total can be pushed above or below a floor at will. */
const ROW_A = rule({
  code: "ROW-A",
  feeType: "flat",
  config: { amountCents: 4_000 },
  conditions: { field: "custom.row_a", op: "gt", value: 0 },
});

const ROW_B = rule({
  code: "ROW-B",
  feeType: "flat",
  config: { amountCents: 6_461 },
  conditions: { field: "custom.row_b", op: "gt", value: 0 },
});

const FLOOR = rule({
  code: "TRADE-MINIMUM",
  label: "Minimum fee for the trade permit",
  feeType: "permit_minimum",
  config: { basis: "permit_fee", floorCents: 14_700 },
  conditions: { field: "permit_fee", op: "lt", value: 14_700 },
  priority: 150,
});

/** The up-front fee the floor is measured before, and a surcharge measured after it. */
const UPFRONT = rule({
  code: "UP-FRONT",
  feeType: "flat",
  config: { amountCents: 6_500 },
  componentType: "other",
  priority: 200,
});

const SURCHARGE = rule({
  code: "RER-7.5",
  feeType: "percent",
  config: { basis: "fee_subtotal", rateBps: 750 },
  componentType: "surcharge",
  priority: 700,
});

const RULES = [ROW_A, ROW_B, FLOOR, UPFRONT, SURCHARGE];

describe("a permit minimum", () => {
  it("charges the shortfall when the permit's rows are below the floor", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { row_a: 1 } },
      RULES,
    );

    // $40.00 of rows is $107.00 short of the $147.00 floor.
    expect(result.components.map((component) => [component.code, component.amountCents])).toEqual([
      ["ROW-A", 4_000],
      ["TRADE-MINIMUM", 10_700],
      ["UP-FRONT", 6_500],
      ["RER-7.5", 1_590],
    ]);
  });

  it("charges nothing when the permit's rows already clear the floor", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { row_a: 1, row_b: 1 } },
      RULES,
    );

    // $104.61 of rows is still below $147.00, so this case *does* take the floor; the
    // point of the assertion is that the amount is the shortfall and not the floor.
    expect(result.components.find((component) => component.code === "TRADE-MINIMUM")
      ?.amountCents).toBe(4_239);
  });

  it("is charged once for a permit with several rows, not once for each", () => {
    const perRuleFloor = RULES.map((candidate) =>
      candidate.componentType === "base" ? { ...candidate, minimumCents: 14_700 } : candidate,
    );

    const oncePerPermit = calculatePermitFees({ asOf: AS_OF, custom: { row_a: 1, row_b: 1 } }, RULES);
    const oncePerRule = calculatePermitFees(
      { asOf: AS_OF, custom: { row_a: 1, row_b: 1 } },
      perRuleFloor,
    );

    // Two rows below the floor: the permit pays it once, and a rule-level floor would
    // have charged it twice — which is the whole reason this fee type exists.
    expect(oncePerPermit.totalCents).toBeLessThan(oncePerRule.totalCents);
    expect(
      oncePerRule.components.filter((component) => component.code.startsWith("ROW-")),
    ).toHaveLength(2);
    expect(
      oncePerRule.components
        .filter((component) => component.code.startsWith("ROW-"))
        .map((component) => component.amountCents),
    ).toEqual([14_700, 14_700]);
  });

  it("measures a floor on the permit fee, or on everything charged, as the schedule says", () => {
    // Two arrangements of the same idea, and the engine's evaluation order is what
    // separates them. A `permit_fee` floor has to be a **base** component, because base
    // components are evaluated before the add-on fees and the floor is measured before
    // them — $147.00 against $40.00 of rows. A `fee_subtotal` floor has to be a component
    // that runs *after* those fees, so it is declared as one and given a later priority:
    // $212.00 against the same rows plus a $65.00 up-front fee.
    const afterAddOns = {
      ...FLOOR,
      config: { basis: "fee_subtotal" as const, floorCents: 21_200 },
      componentType: "other" as const,
      priority: 300,
    };

    const charged = (rules: FeeRuleRecord[]) =>
      calculatePermitFees({ asOf: AS_OF, custom: { row_a: 1 } }, rules).components.find(
        (component) => component.code === "TRADE-MINIMUM",
      )?.amountCents;

    expect(charged([ROW_A, UPFRONT, FLOOR])).toBe(10_700);
    expect(charged([ROW_A, UPFRONT, afterAddOns])).toBe(10_700);

    // And the same $212.00 floor does nothing once a row clears it, whichever base it
    // reads.
    const big = rule({
      code: "ROW-BIG",
      feeType: "flat",
      config: { amountCents: 20_000 },
      conditions: { field: "custom.row_big", op: "gt", value: 0 },
    });
    expect(charged([big, UPFRONT, FLOOR])).toBeUndefined();
  });

  it("never applies when no fee rows matched", () => {
    // No rows matched, so there is no `permit_fee` fact at all: the engine injects it only
    // once something has been charged, which is what keeps a floor from inventing a permit
    // out of nothing. The up-front fee and its surcharge still apply, because neither is
    // conditional — which is the shape of a real schedule and the reason this assertion is
    // about the floor rather than about the total.
    const result = calculatePermitFees({ asOf: AS_OF, custom: {} }, RULES);
    expect(result.appliedRuleIds).not.toContain("TRADE-MINIMUM");
    expect(result.components.map((component) => component.code)).toEqual(["UP-FRONT", "RER-7.5"]);
    expect(result.totalCents).toBe(6_988);
  });

  it("describes itself in the schedule's terms", () => {
    const validation = validateFeeRule(FLOOR);
    expect(validation.ok).toBe(true);
    if (!validation.ok) throw new Error(validation.error);

    expect(describeFeeRule(validation.rule)).toContain("the shortfall up to the $147.00 minimum");
  });

  it("refuses a floor of zero, which could never charge anything", () => {
    const invalid = { ...FLOOR, config: { basis: "permit_fee" as const, floorCents: 0 } };
    expect(validateFeeRule(invalid).ok).toBe(false);
  });
});

describe("the condition that keeps a floor out of a permit above it", () => {
  it("reads the subtotal the engine injects before each rule", () => {
    // A row that clears the floor on its own, so the only difference between the two
    // permits below is whether the subtotal the condition reads is above $147.00.
    const big = rule({
      code: "ROW-BIG",
      feeType: "flat",
      config: { amountCents: 20_000 },
      conditions: { field: "custom.row_big", op: "gt", value: 0 },
    });

    const above = calculatePermitFees({ asOf: AS_OF, custom: { row_big: 1 } }, [big, FLOOR]);
    const below = calculatePermitFees({ asOf: AS_OF, custom: { row_a: 1 } }, [ROW_A, FLOOR]);

    expect(above.appliedRuleIds).not.toContain("TRADE-MINIMUM");
    expect(below.appliedRuleIds).toContain("TRADE-MINIMUM");
  });

  it("is validated as a money fact and refused when it is compared to a decimal", () => {
    const decimal = rule({
      code: "BAD",
      feeType: "permit_minimum",
      config: { basis: "permit_fee", floorCents: 14_700 },
      conditions: { field: "permit_fee", op: "lt", value: 147.0 },
    });
    expect(decimal).toBeDefined();
    // `value: 147.0` is a whole number in JavaScript, so it validates; `147.5` does not.
    const fractional = { ...decimal, conditions: { field: "permit_fee" as const, op: "lt" as const, value: 147.5 } };
    const validation = validateFeeRule(fractional as never);
    expect(validation.ok).toBe(false);
  });
});
