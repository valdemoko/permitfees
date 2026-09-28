import { describe, expect, it } from "vitest";

import { describeCondition, evaluateCondition, validateCondition } from "@/lib/calc/conditions";
import type { CalculationFacts } from "@/lib/calc/types";

const facts: CalculationFacts = {
  valuation: 20_000_000, // $200,000.00
  square_footage: 2_400,
  units: 4,
  fixtures: null,
  occupancy: "residential",
  work_type: "new_construction",
  construction_type: null,
  is_expedited: false,
  is_owner_builder: null,
  "custom.flood_zone": true,
};

describe("validateCondition", () => {
  it("accepts a well-formed leaf", () => {
    const result = validateCondition({ field: "occupancy", op: "eq", value: "residential" });
    expect(result.ok).toBe(true);
  });

  it("rejects an unknown fact", () => {
    const result = validateCondition({ field: "roof_pitch", op: "eq", value: 4 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("not a known fact");
  });

  it("rejects a valuation condition expressed in decimals, because cents are integers", () => {
    const result = validateCondition({ field: "valuation", op: "gte", value: 100_000.5 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("whole number");
  });

  it("rejects a missing value for a comparison operator", () => {
    const result = validateCondition({ field: "units", op: "gte" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("required");
  });

  it("rejects a value on exists/absent", () => {
    const result = validateCondition({ field: "fixtures", op: "exists", value: 1 });
    expect(result.ok).toBe(false);
  });

  it("rejects a non-array value for in/not_in", () => {
    const result = validateCondition({ field: "occupancy", op: "in", value: "residential" });
    expect(result.ok).toBe(false);
  });

  it("rejects mixing a combinator with other keys", () => {
    const result = validateCondition({ all: [], field: "units", op: "eq", value: 1 });
    expect(result.ok).toBe(false);
  });

  it("accepts nested groups", () => {
    const result = validateCondition({
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { any: [{ field: "units", op: "gte", value: 2 }, { field: "fixtures", op: "gte", value: 1 }] },
        { not: { field: "work_type", op: "eq", value: "demolition" } },
      ],
    });
    expect(result.ok).toBe(true);
  });
});

describe("evaluateCondition", () => {
  it("treats a null condition as always applicable", () => {
    expect(evaluateCondition(null, facts)).toBe(true);
  });

  it("compares numbers and strings", () => {
    expect(evaluateCondition({ field: "valuation", op: "gte", value: 10_000_000 }, facts)).toBe(true);
    expect(evaluateCondition({ field: "valuation", op: "lt", value: 10_000_000 }, facts)).toBe(false);
    expect(evaluateCondition({ field: "occupancy", op: "eq", value: "residential" }, facts)).toBe(true);
    expect(evaluateCondition({ field: "occupancy", op: "neq", value: "commercial" }, facts)).toBe(true);
  });

  it("ignores case and surrounding whitespace in text facts", () => {
    expect(evaluateCondition({ field: "occupancy", op: "eq", value: " Residential " }, facts)).toBe(true);
  });

  it("handles in/not_in", () => {
    expect(evaluateCondition({ field: "occupancy", op: "in", value: ["residential", "mixed"] }, facts)).toBe(true);
    expect(evaluateCondition({ field: "occupancy", op: "not_in", value: ["commercial"] }, facts)).toBe(true);
    expect(evaluateCondition({ field: "occupancy", op: "in", value: ["commercial"] }, facts)).toBe(false);
  });

  it("distinguishes absent from falsy", () => {
    expect(evaluateCondition({ field: "fixtures", op: "absent" }, facts)).toBe(true);
    expect(evaluateCondition({ field: "fixtures", op: "exists" }, facts)).toBe(false);
    expect(evaluateCondition({ field: "is_expedited", op: "exists" }, facts)).toBe(true);
    expect(evaluateCondition({ field: "is_expedited", op: "eq", value: false }, facts)).toBe(true);
  });

  it("does not match a numeric comparison against a missing fact", () => {
    expect(evaluateCondition({ field: "fixtures", op: "gte", value: 1 }, facts)).toBe(false);
  });

  it("evaluates all/any/not correctly", () => {
    expect(
      evaluateCondition(
        {
          all: [
            { field: "occupancy", op: "eq", value: "residential" },
            { field: "units", op: "gte", value: 2 },
          ],
        },
        facts,
      ),
    ).toBe(true);

    expect(
      evaluateCondition(
        {
          all: [
            { field: "occupancy", op: "eq", value: "commercial" },
            { field: "units", op: "gte", value: 2 },
          ],
        },
        facts,
      ),
    ).toBe(false);

    expect(
      evaluateCondition(
        {
          any: [
            { field: "occupancy", op: "eq", value: "commercial" },
            { field: "units", op: "gte", value: 4 },
          ],
        },
        facts,
      ),
    ).toBe(true);

    expect(evaluateCondition({ not: { field: "occupancy", op: "eq", value: "commercial" } }, facts)).toBe(true);
  });

  it("reads jurisdiction-specific custom facts", () => {
    expect(evaluateCondition({ field: "custom.flood_zone", op: "eq", value: true }, facts)).toBe(true);
  });
});

describe("describeCondition", () => {
  it("renders nested groups readably", () => {
    const rendered = describeCondition({
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { any: [{ field: "units", op: "gte", value: 2 }] },
      ],
    });
    expect(rendered).toBe("occupancy eq residential AND units gte 2");
  });
});
