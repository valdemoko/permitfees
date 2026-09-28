import { describe, expect, it } from "vitest";

import {
  calculatePermitFees,
  describeApplicability,
  describeFeeRule,
  validateFeeRule,
} from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * A rate published as a *product of two lookup tables*, and minimum fees
 * published per row of the same tables.
 *
 * Chicago prices a building permit `CF × RF × A` (§14A-4-412.2.2.1): a
 * construction factor read from one matrix (occupancy class × construction
 * type), a scope-of-review factor read from another (occupancy × description of
 * work), multiplied together and charged against the gross floor area. Neither
 * factor is a rule of its own, and stating the fee as ordinary rules would mean
 * one rule per cell of the cross product — over a thousand rows, each listed in
 * the fee-structure table on the page. The selection lives in the config
 * instead, and this file is the contract: the product is exact, the rows the
 * schedule does not publish exclude the rule rather than inventing a number, and
 * the printed minimums floor the result the way the schedule prints them.
 *
 * The fixtures below are the real shape of that schedule at the real factors,
 * so an assertion here is also an assertion that the mechanism can carry a
 * published schedule end to end.
 */

const AS_OF = "2026-09-25";

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
    effectiveFrom: "2026-01-06",
    effectiveTo: null,
    status: "active",
    sourceId: null,
    ...overrides,
  };
}

/** Table 14A-12-1204.3(1): dollars per square foot, occupancy class × construction type. */
const CONSTRUCTION_FACTOR = {
  label: "Construction factor",
  keys: ["custom.occupancy_group", "custom.construction_type"],
  rateUnit: "currency_per_unit" as const,
  entries: [
    { values: ["B", "II"], rate: { numerator: 78, denominator: 1 } },
    { values: ["A", "I"], rate: { numerator: 97, denominator: 1 } },
    { values: ["R-2", "III"], rate: { numerator: 78, denominator: 1 } },
  ],
};

/** Table 14A-12-1204.3(3)/(4): the scope factor, occupancy × description of work. */
const SCOPE_FACTOR = {
  label: "Scope of review factor",
  keys: ["custom.occupancy_group", "custom.scope"],
  entries: [
    { values: ["B", "new_construction"], rate: { numerator: 1, denominator: 1 } },
    { values: ["B", "level1_alteration"], rate: { numerator: 1, denominator: 4 } },
    { values: ["A", "new_construction"], rate: { numerator: 1, denominator: 1 } },
    { values: ["R-2", "residential_1_3_units"], rate: { numerator: 3, denominator: 4 } },
  ],
};

/**
 * The Minimum Fee column, with the schedule's global floor ($602 for all
 * permits) written into each row where it is the larger — except the row where
 * the schedule prints a *per-unit* floor beside it, which carries both and lets
 * the engine take the larger at calculation time.
 */
const MINIMUM_FEES = {
  label: "Minimum fee",
  keys: ["custom.occupancy_group", "custom.scope"],
  entries: [
    { values: ["B", "new_construction"], minimumCents: 365_000 },
    { values: ["B", "level1_alteration"], minimumCents: 60_200 },
    { values: ["A", "new_construction"], minimumCents: 365_000 },
    {
      values: ["R-2", "residential_1_3_units"],
      minimumCents: 60_200,
      perUnit: { factKey: "units", centsPerUnit: 25_000 },
    },
  ],
};

const BUILDING = rule({
  code: "BLDG-FACTOR",
  label: "Construction factor × scope of review factor",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rateUnit: "currency_per_unit",
    rateTables: [CONSTRUCTION_FACTOR, SCOPE_FACTOR],
    floorTable: MINIMUM_FEES,
  },
});

const project = (
  custom: Record<string, string | number>,
  squareFootage: number,
): { asOf: string; squareFootage: number; custom: Record<string, string | number> } => ({
  asOf: AS_OF,
  squareFootage,
  custom,
});

const component = (result: ReturnType<typeof calculatePermitFees>, code: string) =>
  result.components.find((entry) => entry.code === code);

describe("a rate published as the product of lookup tables", () => {
  it("multiplies the two matched rates and charges them against the basis", () => {
    // 0.97 × 1 × 42,000 sq ft = $40,740.00 — Group A, Type I, all new construction.
    const result = calculatePermitFees(
      project(
        { occupancy_group: "A", construction_type: "I", scope: "new_construction" },
        42_000,
      ),
      [BUILDING],
    );

    expect(component(result, "BLDG-FACTOR")?.amountCents).toBe(4_074_000);
    expect(result.totalCents).toBe(4_074_000);
    expect(result.excluded).toEqual([]);
  });

  it("keeps the product exact where a rounded factor would drift", () => {
    // 0.78 × 0.25 = 0.195, charged on 10,000 sq ft: $1,950.00 exactly. Rounding
    // 0.195 to basis points (195 bps is exact, but a factor such as 0.78 × 0.33
    // is not) or computing the two factors in sequence would risk a cent either
    // way, so the product is formed as one exact fraction.
    const result = calculatePermitFees(
      project(
        { occupancy_group: "B", construction_type: "II", scope: "level1_alteration" },
        10_000,
      ),
      [BUILDING],
    );

    expect(component(result, "BLDG-FACTOR")?.amountCents).toBe(195_000);
  });

  it("carries each matched row into the working, one line per table", () => {
    const result = calculatePermitFees(
      project(
        { occupancy_group: "R-2", construction_type: "III", scope: "residential_1_3_units" },
        1_000,
      ),
      [BUILDING],
    );

    // 0.78 × 0.75 × 1,000 = $585.00, below the row's floor of
    // max($602.00, 1 × $250.00) — so the floor is what is charged, and the
    // working shows both factors and the floor that replaced them.
    const entry = component(result, "BLDG-FACTOR");
    expect(entry?.amountCents).toBe(60_200);

    const steps = entry?.steps ?? [];
    expect(steps.find((step) => step.label === "Construction factor")?.value).toContain(
      "$0.78 per sq ft (R-2, III)",
    );
    expect(steps.find((step) => step.label === "Scope of review factor")?.value).toBe(
      "0.75 (R-2, residential_1_3_units)",
    );
    expect(steps.find((step) => step.label === "Minimum fee")).toBeDefined();
    expect(steps.find((step) => step.label === "Minimum fee applied")).toBeDefined();
  });
});

describe("minimum fees published per row of the table", () => {
  it("floors the calculation at the row's published minimum", () => {
    // 0.78 × 1 × 1,000 sq ft = $780.00 against a printed $3,650 minimum.
    const result = calculatePermitFees(
      project(
        { occupancy_group: "B", construction_type: "II", scope: "new_construction" },
        1_000,
      ),
      [BUILDING],
    );

    expect(component(result, "BLDG-FACTOR")?.amountCents).toBe(365_000);
  });

  it("takes the larger of a per-unit floor and the flat floor printed on the same row", () => {
    const below = calculatePermitFees(
      project(
        { occupancy_group: "R-2", construction_type: "III", scope: "residential_1_3_units" },
        600,
      ),
      [BUILDING],
    );
    const above = calculatePermitFees(
      {
        asOf: AS_OF,
        squareFootage: 600,
        units: 5,
        custom: {
          occupancy_group: "R-2",
          construction_type: "III",
          scope: "residential_1_3_units",
        },
      },
      [BUILDING],
    );

    // One unit: max(1 × $250, $602) = $602. Five units: max(5 × $250, $602) =
    // $1,250 — the per-unit minimum once the count makes it the larger.
    expect(component(below, "BLDG-FACTOR")?.amountCents).toBe(60_200);
    expect(component(above, "BLDG-FACTOR")?.amountCents).toBe(125_000);
  });

  it("says so when the count a per-unit minimum reads was not provided", () => {
    const result = calculatePermitFees(
      project(
        { occupancy_group: "R-2", construction_type: "III", scope: "residential_1_3_units" },
        600,
      ),
      [BUILDING],
    );

    expect(component(result, "BLDG-FACTOR")?.amountCents).toBe(60_200);
    expect(result.warnings.join(" ")).toContain("Dwelling units");
    expect(result.warnings.join(" ")).toContain("flat minimum was applied instead");
  });

  it("takes the larger of the row floor and the rule's own floor", () => {
    // A rule-level minimum is also a minimum: where the schedule prints a global
    // floor for every permit and a smaller floor for one row, the larger is what
    // the schedule collects.
    const globalFloor = { ...BUILDING, minimumCents: 70_000 };
    const result = calculatePermitFees(
      project(
        { occupancy_group: "B", construction_type: "II", scope: "level1_alteration" },
        50,
      ),
      [globalFloor],
    );

    // Computed: 0.78 × 0.25 × 50 = $9.75. Row floor $602.00, rule floor $700.00.
    expect(component(result, "BLDG-FACTOR")?.amountCents).toBe(70_000);
  });
});

describe("combinations the schedule does not publish", () => {
  it("excludes the rule and says the schedule publishes no rate, rather than guessing", () => {
    const result = calculatePermitFees(
      project({ occupancy_group: "B", construction_type: "II", scope: "exterior_wall" }, 1_000),
      [BUILDING],
    );

    expect(result.components).toEqual([]);
    expect(result.totalCents).toBe(0);
    expect(result.excluded).toHaveLength(1);
    expect(result.excluded[0]?.reason).toBe("conditions_not_met");
    expect(result.excluded[0]?.detail).toBe(
      "The schedule publishes no rate for Occupancy group, Construction type, Scope.",
    );
    // Not a missing input: the reader gave everything, the schedule simply has
    // no row for it. The generic "nothing matched" warning still fires — the
    // same honesty rule the other schedules use — but nothing reports a missing
    // input.
    expect(result.warnings.join(" ")).toContain("No fee rules matched");
    expect(result.warnings.join(" ")).not.toContain("was not provided");
    expect(result.warnings.join(" ")).not.toContain("is required");
  });

  it("reports a fact the reader did not give as a missing input, as any other rule would", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, squareFootage: 1_000, custom: { scope: "new_construction" } },
      [BUILDING],
    );

    expect(result.components).toEqual([]);
    expect(result.excluded[0]?.reason).toBe("missing_input");
    expect(result.excluded[0]?.detail).toContain("Occupancy group was not provided");
    expect(result.warnings.join(" ")).toContain("Occupancy group is required");
  });
});

describe("what the tables say about themselves", () => {
  it("describes the formula as the tables that produce it, never as one number", () => {
    const validation = validateFeeRule(BUILDING);
    expect(validation.ok).toBe(true);
    if (!validation.ok) throw new Error(validation.error);

    const description = describeFeeRule(validation.rule);
    expect(description).toBe(
      "Construction factor × scope of review factor per sq ft; minimum fee from the schedule's own row",
    );
    // No rate to print: the fee-structure table must not show a single factor as
    // though it were the whole formula.
    expect(description).not.toContain("$0.78");
  });

  it("says where the rule applies by the facts the tables are keyed by", () => {
    const validation = validateFeeRule(BUILDING);
    if (!validation.ok) throw new Error(validation.error);

    expect(describeApplicability(validation.rule)).toBe(
      "Where the schedule publishes a rate for Occupancy group, Construction type and Scope",
    );
  });
});

/* -------------------------------------------------------------------------- */
/* A table cell times a published multiplier                                  */
/* -------------------------------------------------------------------------- */

/**
 * Oak Park prices new construction as `Area × CC × .0194`, where CC is read from the
 * ICC square-foot construction cost chart and the `.0194` is printed beside it rather
 * than as a column of it. The cell stays the chart's own number — `$218.08 per sq ft`
 * — so the working can still be reproduced against the document.
 */
const ICC_CHART = {
  label: "Construction cost",
  keys: ["custom.use_group", "custom.construction_type"],
  rateUnit: "currency_per_unit" as const,
  entries: [
    { values: ["R-3", "IIIA"], rate: { numerator: 21808, denominator: 1 } },
    { values: ["B", "IIA"], rate: { numerator: 28027, denominator: 1 } },
  ],
};

const OAK_PARK_NEW_CONSTRUCTION = rule({
  code: "BUILD-AREA-CC-MULT",
  label: "Construction area × construction cost × .0194",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rateUnit: "currency_per_unit",
    rateTables: [ICC_CHART],
    rateMultiplier: { numerator: 194, denominator: 10_000 },
  },
});

describe("a table cell multiplied by a published factor", () => {
  it("charges the cell's rate times the multiplier against the basis", () => {
    // 2,000 sq ft × $218.08 × .0194 = $8,461.504, rounded once to $8,461.50.
    const result = calculatePermitFees(
      project({ use_group: "R-3", construction_type: "IIIA" }, 2_000),
      [OAK_PARK_NEW_CONSTRUCTION],
    );

    expect(component(result, "BUILD-AREA-CC-MULT")?.amountCents).toBe(846_150);
  });

  it("keeps the cell and the multiplier visible in the working", () => {
    const result = calculatePermitFees(
      project({ use_group: "B", construction_type: "IIA" }, 10_000),
      [OAK_PARK_NEW_CONSTRUCTION],
    );

    const steps = component(result, "BUILD-AREA-CC-MULT")?.steps ?? [];
    // The chart's own figure, not the product of it.
    expect(steps.find((step) => step.label === "Construction cost")?.value).toBe(
      "$280.27 per sq ft (B, IIA)",
    );
    expect(steps.find((step) => step.label === "Published multiplier")?.value).toBe("0.0194");
    expect(steps.find((step) => step.label === "Rate applied")?.value).toBe("$5.437238 per sq ft");
  });

  it("describes the fee as the table and the multiplier, not as one number", () => {
    const validation = validateFeeRule(OAK_PARK_NEW_CONSTRUCTION);
    if (!validation.ok) throw new Error(validation.error);

    expect(describeFeeRule(validation.rule)).toBe(
      "Construction cost × 0.0194 per sq ft",
    );
  });

  it("rejects a multiplier with no table to multiply", () => {
    const orphan = rule({
      code: "NO-TABLE",
      feeType: "percent",
      config: {
        basis: "square_footage",
        rateUnit: "currency_per_unit",
        rateMultiplier: { numerator: 194, denominator: 10_000 },
      },
    });
    expect(validateFeeRule(orphan).ok).toBe(false);
  });
});

describe("the schema that keeps a lookup table honest", () => {
  const withConfig = (config: unknown) => ({ ...BUILDING, config });

  it("rejects a rate stated both in the config and in tables", () => {
    const ambiguous = withConfig({
      basis: "square_footage",
      rateUnit: "currency_per_unit",
      rateBps: 195,
      rateTables: [CONSTRUCTION_FACTOR],
    });
    expect(validateFeeRule(ambiguous as never).ok).toBe(false);
  });

  it("rejects a row that states the wrong number of values", () => {
    const short = withConfig({
      basis: "square_footage",
      rateTables: [
        {
          ...CONSTRUCTION_FACTOR,
          entries: [{ values: ["B"], rate: { numerator: 78, denominator: 100 } }],
        },
      ],
    });
    expect(validateFeeRule(short as never).ok).toBe(false);
  });

  it("rejects two rows for the same combination, which would make the match order-dependent", () => {
    const duplicate = withConfig({
      basis: "square_footage",
      rateTables: [
        {
          ...CONSTRUCTION_FACTOR,
          entries: [
            ...CONSTRUCTION_FACTOR.entries,
            { values: ["B", "II"], rate: { numerator: 80, denominator: 100 } },
          ],
        },
      ],
    });
    expect(validateFeeRule(duplicate as never).ok).toBe(false);
  });

  it("rejects a minimum-fee row that states no minimum", () => {
    const empty = withConfig({
      basis: "square_footage",
      rateTables: [CONSTRUCTION_FACTOR],
      floorTable: {
        ...MINIMUM_FEES,
        entries: [{ values: ["B", "new_construction"] }],
      },
    });
    expect(validateFeeRule(empty as never).ok).toBe(false);
  });

  it("accepts a row that states both a flat and a per-unit minimum, because both are printed", () => {
    const validation = validateFeeRule(BUILDING);
    expect(validation.ok).toBe(true);
  });
});
