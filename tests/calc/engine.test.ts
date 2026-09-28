import { describe, expect, it } from "vitest";

import { calculatePermitFees } from "@/lib/calc/engine";
import { AS_OF, syntheticRule } from "./fixtures";

describe("calculatePermitFees — fee primitives", () => {
  it("computes a flat fee", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF },
      [syntheticRule({ feeType: "flat", config: { amountCents: 15_000 }, label: "Base permit fee" })],
    );

    expect(result.totalCents).toBe(15_000);
    expect(result.components).toHaveLength(1);
    expect(result.components[0]?.formula).toBe("$150.00 flat fee");
    expect(result.appliedRuleIds).toHaveLength(1);
  });

  it("computes a percentage of valuation", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 10_000_000 },
      [syntheticRule({ feeType: "percent", config: { basis: "valuation", rateBps: 150 } })],
    );

    // $100,000 at 1.5% = $1,500.00
    expect(result.totalCents).toBe(150_000);
    expect(result.components[0]?.formula).toBe("1.5% of project valuation");
  });

  it("computes a base amount plus marginal rates", () => {
    const rule = syntheticRule({
      feeType: "tiered_marginal",
      config: {
        basis: "valuation",
        baseCents: 0,
        tiers: [
          { upToCents: 10_000_000, rateBps: 150 },
          { upToCents: null, rateBps: 100 },
        ],
      },
    });

    const atBoundary = calculatePermitFees({ asOf: AS_OF, valuationCents: 10_000_000 }, [rule]);
    // Exactly $100,000: only the first band applies.
    expect(atBoundary.totalCents).toBe(150_000);

    const above = calculatePermitFees({ asOf: AS_OF, valuationCents: 20_000_000 }, [rule]);
    // $100,000 at 1.5% ($1,500) + $100,000 at 1% ($1,000)
    expect(above.totalCents).toBe(250_000);
    expect(above.components[0]?.formula).toBe(
      "1.5% of the first $100,000, plus 1% above $100,000",
    );
  });

  it("adds the base amount of a marginal schedule", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 1_000_000 },
      [
        syntheticRule({
          feeType: "tiered_marginal",
          config: { basis: "valuation", baseCents: 5_000, tiers: [{ upToCents: null, rateBps: 100 }] },
        }),
      ],
    );

    // $50 base + 1% of $10,000 = $150
    expect(result.totalCents).toBe(50_00 + 100_00);
  });

  it("selects the correct bracket in a fee table", () => {
    const rule = syntheticRule({
      feeType: "tiered_table",
      config: {
        basis: "valuation",
        tiers: [
          { upToCents: 500_000, amountCents: 5_000 },
          { upToCents: 2_000_000, amountCents: 12_500 },
          { upToCents: null, amountCents: 24_000 },
        ],
      },
    });

    expect(calculatePermitFees({ asOf: AS_OF, valuationCents: 500_000 }, [rule]).totalCents).toBe(5_000);
    expect(calculatePermitFees({ asOf: AS_OF, valuationCents: 500_001 }, [rule]).totalCents).toBe(12_500);
    expect(calculatePermitFees({ asOf: AS_OF, valuationCents: 2_000_000 }, [rule]).totalCents).toBe(12_500);
    expect(calculatePermitFees({ asOf: AS_OF, valuationCents: 2_000_001 }, [rule]).totalCents).toBe(24_000);
  });

  it("warns instead of guessing when a value exceeds every bounded bracket", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 99_000_000 },
      [
        syntheticRule({
          feeType: "tiered_table",
          config: {
            basis: "valuation",
            tiers: [
              { upToCents: 500_000, amountCents: 5_000 },
              { upToCents: 2_000_000, amountCents: 12_500 },
            ],
          },
        }),
      ],
    );

    expect(result.totalCents).toBe(12_500);
    expect(result.warnings.join(" ")).toContain("highest published bracket");
  });

  it("computes a per-unit fee", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, units: 4 },
      [syntheticRule({ feeType: "per_unit", config: { unit: "dwelling_units", centsPerUnit: 3_500 } })],
    );

    expect(result.totalCents).toBe(14_000);
    expect(result.components[0]?.formula).toBe("$35.00 per dwelling unit");
  });

  it("honours the 'or fraction thereof' increment rule", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 25_010_000 },
      [
        syntheticRule({
          feeType: "percent",
          config: { basis: "valuation", rateBps: 90, incrementCents: 100_000 },
        }),
      ],
    );

    // $250,100 rounds up to $251,000 at $9 per $1,000 = $2,259.00
    expect(result.totalCents).toBe(225_900);
  });
});

describe("calculatePermitFees — modifiers, conditions and lifecycle", () => {
  it("applies a minimum fee", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 100_000 },
      [
        syntheticRule({
          feeType: "percent",
          config: { basis: "valuation", rateBps: 100 },
          minimumCents: 5_000,
        }),
      ],
    );

    expect(result.totalCents).toBe(5_000);
    expect(result.components[0]?.steps.some((step) => step.label === "Minimum fee applied")).toBe(true);
  });

  it("applies a maximum fee", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 100_000_000 },
      [
        syntheticRule({
          feeType: "percent",
          config: { basis: "valuation", rateBps: 150 },
          maximumCents: 500_000,
        }),
      ],
    );

    expect(result.totalCents).toBe(500_000);
    expect(result.components[0]?.steps.some((step) => step.label === "Maximum fee applied")).toBe(true);
  });

  it("excludes a rule whose conditions do not match, and says why", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, occupancy: "residential", valuationCents: 10_000_000 },
      [
        syntheticRule({
          id: "commercial-only",
          code: "PLAN-COMM",
          label: "Commercial plan review",
          conditions: { field: "occupancy", op: "eq", value: "commercial" },
          feeType: "flat",
          config: { amountCents: 50_000 },
        }),
      ],
    );

    expect(result.totalCents).toBe(0);
    expect(result.excluded).toEqual([
      {
        ruleId: "commercial-only",
        code: "PLAN-COMM",
        label: "Commercial plan review",
        reason: "conditions_not_met",
        detail: "This fee does not apply to the inputs provided.",
      },
    ]);
  });

  it("reports a missing input rather than computing an incomplete total", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF },
      [syntheticRule({ feeType: "percent", config: { basis: "valuation", rateBps: 150 } })],
    );

    expect(result.components).toHaveLength(0);
    expect(result.excluded[0]?.reason).toBe("missing_input");
    expect(result.warnings.join(" ")).toContain("Project valuation is required");
  });

  it("excludes rules that are not in effect on the requested date", () => {
    const rules = [
      syntheticRule({
        id: "old",
        label: "Old schedule",
        effectiveFrom: "2024-01-01",
        effectiveTo: "2026-06-30",
        config: { amountCents: 10_000 },
      }),
      syntheticRule({
        id: "new",
        label: "Current schedule",
        effectiveFrom: "2026-07-01",
        effectiveTo: null,
        config: { amountCents: 12_000 },
      }),
    ];

    const beforeChange = calculatePermitFees({ asOf: "2026-06-29" }, rules);
    expect(beforeChange.totalCents).toBe(10_000);

    // The window is half-open: on 2026-07-01 only the new rule applies.
    const onChangeDay = calculatePermitFees({ asOf: "2026-07-01" }, rules);
    expect(onChangeDay.totalCents).toBe(12_000);
    expect(onChangeDay.excluded.map((rule) => rule.ruleId)).toEqual(["old"]);
    expect(onChangeDay.excluded[0]?.reason).toBe("not_effective");
  });

  it("excludes non-active rules", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF },
      [syntheticRule({ status: "draft", config: { amountCents: 10_000 } })],
    );

    expect(result.totalCents).toBe(0);
    expect(result.excluded[0]?.reason).toBe("inactive");
  });

  it("reports an unreadable rule as a warning instead of throwing", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF },
      [syntheticRule({ code: "BROKEN", feeType: "flat", config: { amountCents: -1 } })],
    );

    expect(result.totalCents).toBe(0);
    expect(result.excluded[0]?.reason).toBe("invalid_rule");
    expect(result.warnings.join(" ")).toContain("BROKEN");
  });

  it("rejects a rule whose minimum exceeds its maximum", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF },
      [syntheticRule({ minimumCents: 20_000, maximumCents: 10_000 })],
    );

    expect(result.excluded[0]?.reason).toBe("invalid_rule");
  });
});

describe("calculatePermitFees — composition and determinism", () => {
  const rules = [
    syntheticRule({
      id: "base",
      code: "BASE",
      label: "Building permit fee",
      componentType: "base",
      priority: 10,
      feeType: "percent",
      config: { basis: "valuation", rateBps: 150 },
    }),
    syntheticRule({
      id: "plan-review",
      code: "PLAN",
      label: "Plan review fee",
      componentType: "plan_review",
      priority: 20,
      feeType: "flat",
      config: { amountCents: 7_500 },
    }),
    syntheticRule({
      id: "technology",
      code: "TECH",
      label: "Technology fee",
      componentType: "technology",
      priority: 30,
      feeType: "flat",
      config: { amountCents: 1_200 },
    }),
    syntheticRule({
      id: "state",
      code: "STATE",
      label: "State surcharge",
      componentType: "state_surcharge",
      priority: 40,
      feeType: "per_unit",
      config: { unit: "dwelling_units", centsPerUnit: 400 },
    }),
  ];

  it("sums components and orders them like an invoice", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 10_000_000, units: 2 },
      rules,
    );

    // $1,500 + $75 + $12 + $8
    expect(result.totalCents).toBe(150_000 + 7_500 + 1_200 + 800);
    expect(result.components.map((component) => component.code)).toEqual([
      "BASE",
      "PLAN",
      "TECH",
      "STATE",
    ]);
    expect(result.components.map((component) => component.componentType)).toEqual([
      "base",
      "plan_review",
      "technology",
      "state_surcharge",
    ]);
  });

  it("is deterministic: identical inputs produce identical output", () => {
    const input = { asOf: AS_OF, valuationCents: 12_345_678, units: 3 };
    const first = calculatePermitFees(input, rules);
    const second = calculatePermitFees(input, rules);
    expect(second).toEqual(first);
  });

  it("does not mutate the rule records it is given", () => {
    const snapshot = JSON.stringify(rules);
    calculatePermitFees({ asOf: AS_OF, valuationCents: 1_000_000, units: 1 }, rules);
    expect(JSON.stringify(rules)).toBe(snapshot);
  });

  it("records its assumptions for display next to the result", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 1_000_000, units: 1 }, rules);
    expect(result.assumptions[0]).toContain("in effect on 2026-09-23");
    expect(result.assumptions.length).toBeGreaterThanOrEqual(2);
  });

  it("warns clearly when nothing matched", () => {
    const result = calculatePermitFees({ asOf: AS_OF }, []);
    expect(result.totalCents).toBe(0);
    expect(result.warnings[0]).toContain("No fee rules matched");
  });

  it("accepts a full timestamp as asOf and normalizes it to a date", () => {
    const result = calculatePermitFees({ asOf: "2026-09-23T14:31:00.000Z" }, rules);
    expect(result.asOf).toBe("2026-09-23");
  });

  it("rejects an unparseable asOf instead of silently using today", () => {
    expect(() => calculatePermitFees({ asOf: "not-a-date" }, rules)).toThrow(TypeError);
  });
});
