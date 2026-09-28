import { describe, expect, it } from "vitest";

import { describeApplicability, describeConditionForReader } from "@/lib/calc/engine";
import type { ConditionLeaf, FeeCondition, ValidatedFeeRule } from "@/lib/calc/types";

/**
 * The reader-facing condition rendering.
 *
 * The Houston page rendered its "Applies when" column with `describeCondition`,
 * the debug formatter, so a published page read:
 *
 *     valuation gt 0 AND valuation lte 700000
 *
 * Cents, an operator vocabulary, and a bound of `$0` that is true of every
 * project. These tests fix the rendering that replaced it.
 */

const rule = (conditions: FeeCondition | null, extra?: Partial<ValidatedFeeRule>): ValidatedFeeRule =>
  ({
    id: "rule",
    code: "STRUCT-118.2.1-B1",
    label: "Structural building permit fee",
    description: null,
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 4_700 },
    conditions,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    status: "active",
    sourceId: null,
    ...extra,
  }) as ValidatedFeeRule;

describe("describeConditionForReader", () => {
  it("renders Houston's first bracket without cents or operators", () => {
    expect(
      describeConditionForReader({
        all: [
          { field: "valuation", op: "gt", value: 0 },
          { field: "valuation", op: "lte", value: 700_000 },
        ],
      }),
    ).toBe("Project valuation up to $7,000");
  });

  it("renders an upper band as a range in dollars", () => {
    expect(
      describeConditionForReader({
        all: [
          { field: "valuation", op: "gt", value: 700_000 },
          { field: "valuation", op: "lte", value: 15_000_000 },
        ],
      }),
    ).toBe("Project valuation over $7,000 and up to $150,000");
  });

  it("drops a > $0 bound that says nothing on its own", () => {
    expect(describeConditionForReader({ field: "valuation", op: "gt", value: 0 })).toBe(
      "any project valuation",
    );
  });

  it("keeps a bound that carries information", () => {
    expect(describeConditionForReader({ field: "valuation", op: "gt", value: 5_000_000 })).toBe(
      "Project valuation over $50,000",
    );
  });

  it("never leaves a raw operator in the output", () => {
    const conditions: FeeCondition[] = [
      { field: "valuation", op: "gte", value: 1_000_00 },
      { field: "square_footage", op: "lt", value: 2_000 },
      { field: "occupancy", op: "eq", value: "residential" },
      { field: "work_type", op: "in", value: ["new_construction", "addition"] },
      { field: "is_owner_builder", op: "exists" },
      { field: "is_expedited", op: "absent" },
      { field: "custom.inspection_count", op: "gt", value: 3 },
      { all: [{ field: "valuation", op: "gt", value: 0 }] },
      { any: [{ field: "fixtures", op: "eq", value: 1 }, { field: "fixtures", op: "eq", value: 2 }] },
      { not: { field: "occupancy", op: "eq", value: "industrial" } },
    ];

    for (const condition of conditions) {
      const text = describeConditionForReader(condition);
      expect(text, `raw operator leaked for ${JSON.stringify(condition)}`).not.toMatch(
        /\b(gt|gte|lt|lte|eq|neq|in|not_in)\b/,
      );
    }
  });

  it("shows money in dollars, never in cents", () => {
    const text = describeConditionForReader({
      all: [
        { field: "valuation", op: "gt", value: 700_000 },
        { field: "valuation", op: "lte", value: 15_000_000 },
      ],
    });

    expect(text).toContain("$7,000");
    expect(text).toContain("$150,000");
    expect(text).not.toContain("700000");
    expect(text).not.toContain("15000000");
  });

  it("renders a value list and a negation", () => {
    const workTypes: ConditionLeaf = {
      field: "work_type",
      op: "in",
      value: ["new_construction", "addition"],
    };
    expect(describeConditionForReader(workTypes)).toBe("Work type is one of new construction, addition");
    expect(describeConditionForReader({ not: workTypes })).toBe(
      "not (Work type is one of new construction, addition)",
    );
  });
});

describe("describeApplicability", () => {
  it("uses the reader rendering for a conditional rule", () => {
    expect(
      describeApplicability(
        rule({
          all: [
            { field: "valuation", op: "gt", value: 0 },
            { field: "valuation", op: "lte", value: 700_000 },
          ],
        }),
      ),
    ).toBe("Project valuation up to $7,000");
  });

  it("still names the per-item basis when a rule has no conditions", () => {
    // "Always applies" would be false of a per-item row: a permit with no outlets
    // does not incur the outlet fee.
    expect(
      describeApplicability(
        rule(null, {
          code: "ELEC-118.6.1-OUTLET",
          feeType: "per_unit",
          config: { unit: "outlets", centsPerUnit: 134 },
        } as Partial<ValidatedFeeRule>),
      ),
    ).toBe("Each outlet on the permit");
  });

  it("falls back to the permit itself for an unconditional flat rule", () => {
    expect(describeApplicability(rule(null))).toBe("Every permit of this type");
  });
});
