import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Provo, Utah fee rules — REAL DATA.
 *
 * Source: Provo City Consolidated Fee Schedule, Inspection Fees section
 * (provo.municipal.codes/Code/FS_Inspection): "Building permit — Based on the
 * 1997 UBC Fee Chart. Plan review — 65% of the Building Permit Fee." The
 * provo.gov FAQ (QID 91) confirms the 1997 UBC table, the 65% plan check and
 * the 1% state fee sent to the state. The unamended 1997 UBC Table 1-A ladder
 * is transcribed from an adopting municipal code (Northglenn CO §10-2-5(g)).
 *
 * The eight bands chain exactly:
 *   $23.50 + 15 x $3.05 = $69.25
 *   $69.25 + 23 x $14.00 = $391.25
 *   $391.25 + 25 x $10.10 = $643.75
 *   $643.75 + 50 x $7.00 = $993.75
 *   $993.75 + 400 x $5.60 = $3,233.75
 *   $3,233.75 + 500 x $4.75 = $5,608.75
 *
 * Note: for residential structures with not more than 4 units the building
 * permit fee includes the plumbing, electrical and mechanical permit fees;
 * the trade pages here price stand-alone permits.
 *
 * Verified: 2026-09-26.
 */

export const PRV_FEE_EFFECTIVE_FROM = "2021-07-01";

export const PRV_FEE_SCHEDULE_KEY = "provo-consolidated-fee-schedule";

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
    effectiveFrom: PRV_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: PRV_FEE_SCHEDULE_KEY,
    ...overrides,
  };
}

export const PRV_BUILDING_RULES: FeeRuleRecord[] = [
  rule({
    id: "prv-bld-500",
    code: "PRV-BLD-500",
    label: "Building permit, valuation to $500 ($23.50 flat)",
    description:
      "1997 UBC Table 1-A, first row (adopted by reference in the Provo Consolidated Fee Schedule): total valuation $1.00-$500.00 carries $23.50.",
    feeType: "flat",
    config: { amountCents: 2_350 },
    conditions: {
      all: [{ field: "valuation", op: "lte", value: 50_000 }],
    },
    priority: 100,
  }),
  rule({
    id: "prv-bld-2k",
    code: "PRV-BLD-2K",
    label: "Building permit, $500.01-$2,000 ($23.50 + $3.05 per $100)",
    description:
      "1997 UBC Table 1-A second row: $23.50 for the first $500 plus $3.05 for each additional $100 or fraction thereof, to $2,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_350,
      thresholdCents: 50_000,
      centsPerThousand: 3_050,
      incrementCents: 10_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000 },
        { field: "valuation", op: "lte", value: 200_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "prv-bld-25k",
    code: "PRV-BLD-25K",
    label: "Building permit, $2,000.01-$25,000 ($69.25 + $14.00 per $1,000)",
    description:
      "1997 UBC Table 1-A third row: $69.25 for the first $2,000 plus $14.00 for each additional $1,000 or fraction thereof, to $25,000. Chains the second row exactly ($23.50 + 15 x $3.05 = $69.25).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 6_925,
      thresholdCents: 200_000,
      centsPerThousand: 1_400,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 200_000 },
        { field: "valuation", op: "lte", value: 2_500_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "prv-bld-50k",
    code: "PRV-BLD-50K",
    label: "Building permit, $25,000.01-$50,000 ($391.25 + $10.10 per $1,000)",
    description:
      "1997 UBC Table 1-A fourth row: $391.25 for the first $25,000 plus $10.10 for each additional $1,000 or fraction thereof, to $50,000. Chains the third row exactly ($69.25 + 23 x $14.00 = $391.25).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 39_125,
      thresholdCents: 2_500_000,
      centsPerThousand: 1_010,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 2_500_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "prv-bld-100k",
    code: "PRV-BLD-100K",
    label: "Building permit, $50,000.01-$100,000 ($643.75 + $7.00 per $1,000)",
    description:
      "1997 UBC Table 1-A fifth row: $643.75 for the first $50,000 plus $7.00 for each additional $1,000 or fraction thereof, to $100,000. Chains the fourth row exactly ($391.25 + 25 x $10.10 = $643.75).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 64_375,
      thresholdCents: 5_000_000,
      centsPerThousand: 700,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 5_000_000 },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "prv-bld-500k",
    code: "PRV-BLD-500K",
    label: "Building permit, $100,000.01-$500,000 ($993.75 + $5.60 per $1,000)",
    description:
      "1997 UBC Table 1-A sixth row: $993.75 for the first $100,000 plus $5.60 for each additional $1,000 or fraction thereof, to $500,000. Chains the fifth row exactly ($643.75 + 50 x $7.00 = $993.75).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 99_375,
      thresholdCents: 10_000_000,
      centsPerThousand: 560,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 10_000_000 },
        { field: "valuation", op: "lte", value: 50_000_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "prv-bld-1m",
    code: "PRV-BLD-1M",
    label: "Building permit, $500,000.01-$1,000,000 ($3,233.75 + $4.75 per $1,000)",
    description:
      "1997 UBC Table 1-A seventh row: $3,233.75 for the first $500,000 plus $4.75 for each additional $1,000 or fraction thereof, to $1,000,000. Chains the sixth row exactly ($993.75 + 400 x $5.60 = $3,233.75).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 323_375,
      thresholdCents: 50_000_000,
      centsPerThousand: 475,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "prv-bld-up",
    code: "PRV-BLD-UP",
    label: "Building permit, above $1,000,000 ($5,608.75 + $3.15 per $1,000)",
    description:
      "1997 UBC Table 1-A eighth row: $5,608.75 for the first $1,000,000 plus $3.15 for each additional $1,000 or fraction thereof, above. Chains the seventh row exactly ($3,233.75 + 500 x $4.75 = $5,608.75).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 560_875,
      thresholdCents: 100_000_000,
      centsPerThousand: 315,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 100_000_000 }],
    },
    priority: 100,
  }),

  // "Plan review — 65% of the Building Permit Fee" (Consolidated Fee
  // Schedule, Inspection Fees; the provo.gov FAQ repeats it and adds the 1%
  // state fee).
  rule({
    id: "prv-plan-review",
    code: "PRV-PLAN-REVIEW-65",
    label: "Plan review fee (65% of the building permit fee)",
    description:
      "Provo Consolidated Fee Schedule, Inspection Fees: plan review is 65% of the building permit fee. The provo.gov FAQ also documents a 1% state fee on the building permit fee, sent to the state for inspector and contractor training.",
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 6_500 },
    priority: 200,
  }),
];

export const PRV_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule({
    id: "prv-elec-min",
    code: "PRV-ELEC-MIN",
    label: "Electrical permit minimum fee ($75.00)",
    description:
      "Provo Consolidated Fee Schedule, Inspection Fees: Electrical Inspection $75.00, with a $75.00 service-charge minimum ($0.02/sq ft inspection fee, $75 minimum). Commercial Electrical permits are $175.00.",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "residential" }],
    },
    priority: 100,
  }),
  rule({
    id: "prv-elec-comm",
    code: "PRV-ELEC-COMM",
    label: "Commercial electrical permit ($175.00)",
    description:
      "Provo Consolidated Fee Schedule, Inspection Fees: Commercial Electrical $175.00.",
    feeType: "flat",
    config: { amountCents: 17_500 },
    conditions: {
      all: [{ field: "occupancy", op: "neq", value: "residential" }],
    },
    priority: 100,
  }),
];

export const PRV_PLUMBING_RULES: FeeRuleRecord[] = [
  rule({
    id: "prv-plumb-min",
    code: "PRV-PLUMB-MIN",
    label: "Plumbing permit minimum fee ($75.00)",
    description:
      "Provo Consolidated Fee Schedule, Inspection Fees: Plumbing Inspection minimum fee, including issuance of permit, $75.00; first fixture $20.00, each additional fixture $6.00, each water heater $6.00. Residential structures with not more than 4 units bundle plumbing into the building permit fee.",
    feeType: "flat",
    config: { amountCents: 7_500 },
    priority: 100,
  }),
];
