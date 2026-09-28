import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Bridgeport, Connecticut fee rules — REAL DATA.
 *
 * Source: "PERMIT FEES - BUILDING DEPARTMENT - Effective 5/18/16",
 * City of Bridgeport (bridgeportct.gov), text layer extracted from the City's
 * own PDF. The schedule's calculation line: "$60.00 for the 1st $1,000 in
 * Value of Work, plus $30.00 per thousand or part of, after first thousand".
 * The printed table is purely linear: $40 to $500, $60 to $1,000, then
 * +$30.00 per $1,000 (checked rows: $50,000 -> $1,530.00, $100,000 ->
 * $3,030.00, $1,490,000 -> $44,820.00).
 *
 * The same Building Department issues electrical and plumbing permits against
 * the same Value-of-Work table (the schedule's own "ELECTRICAL WORK, WATER
 * HEATER ONLY: $40.00" row proves the department prices electrical from it);
 * the PDF publishes no separate trade tables.
 *
 * Verified: 2026-09-26.
 */

export const BPT_FEE_EFFECTIVE_FROM = "2016-05-18";

export const BPT_FEE_SCHEDULE_KEY = "bridgeport-building-dept-fee-schedule";

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
    effectiveFrom: BPT_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: BPT_FEE_SCHEDULE_KEY,
    ...overrides,
  };
}

/** The schedule's formula: $60.00 + $30.00 per $1,000 or part of, above $1,000. */
function valueOfWorkLeg(
  id: string,
  code: string,
  discipline: string,
): FeeRuleRecord {
  return rule({
    id,
    code,
    label: `${discipline} permit ($60.00 for the 1st $1,000 + $30.00 per $1,000 or part of)`,
    description:
      "Building Department fee schedule (effective 5/18/2016): '$60.00 for the 1st $1,000 in Value of Work, plus $30.00 per thousand or part of, after first thousand.' The printed table is linear — $50,000 prices $1,530.00 and $100,000 prices $3,030.00 — and continues to roughly $1.49M of value.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 6_000,
      thresholdCents: 100_000,
      centsPerThousand: 3_000,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 100_000 }],
    },
    priority: 100,
  });
}

export const BPT_BUILDING_RULES: FeeRuleRecord[] = [
  // Printed row 1: $0.00-$500.00 prices a flat $40.00 — the table is more
  // specific than the formula line here, so the row stands as printed.
  rule({
    id: "bpt-bld-row-500",
    code: "BPT-BLD-500",
    label: "Building permit, value to $500 ($40.00)",
    description:
      "Printed table row: value of work $0.00-$500.00 prices $40.00. The flat row is more specific than the schedule's formula line ('$60.00 for the 1st $1,000'), which begins at $1,000.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [{ field: "valuation", op: "lte", value: 50_000 }],
    },
    priority: 100,
  }),

  // Printed row 2: $501.00-$1,000.00 prices $60.00.
  rule({
    id: "bpt-bld-row-1000",
    code: "BPT-BLD-1000",
    label: "Building permit, value $501-$1,000 ($60.00)",
    description:
      "Printed table row: value of work $501.00-$1,000.00 prices $60.00 — the schedule formula's '1st $1,000' amount.",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000 },
        { field: "valuation", op: "lte", value: 100_000 },
      ],
    },
    priority: 100,
  }),

  // The formula, from $1,001 up: $60.00 + $30.00 per $1,000 or part of.
  valueOfWorkLeg("bpt-bld-leg", "BPT-BLD-VOW", "Building"),
];

export const BPT_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // Water-heater-only carve-out, printed as its own row.
  rule({
    id: "bpt-elec-water-heater",
    code: "BPT-ELEC-WH",
    label: "Electrical work, water heater only ($40.00)",
    description:
      "Printed schedule row: 'ELECTRICAL WORK, WATER HEATER ONLY: $40.00.' A discounted flat row for that single scope, read on the same Building Department schedule.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [{ field: "custom.water_heater_only", op: "eq", value: true }],
    },
    priority: 50,
  }),
  // Electrical permits issue from the same Value-of-Work table.
  valueOfWorkLeg("bpt-elec-leg", "BPT-ELEC-VOW", "Electrical"),
];

export const BPT_PLUMBING_RULES: FeeRuleRecord[] = [
  valueOfWorkLeg("bpt-plumb-leg", "BPT-PLUMB-VOW", "Plumbing"),
];
