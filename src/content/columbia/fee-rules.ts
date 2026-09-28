import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Columbia, South Carolina fee rules — REAL DATA.
 *
 * Sources: City of Columbia Planning & Development Services,
 *          "Residential Development Review Fees" and "Commercial Development
 *          Review Fees" fee sheets, plus the commercial permit application.
 *
 * - Residential building: $20.00 at $1–$5,000 of value, then $4.00 per $1,000
 *   or fraction thereof above $5,000. Plan review $25.00 flat.
 * - Commercial building/trades: $50.00 at $1–$5,000, then chained bands:
 *     $50.00 + $9.00 per $1,000 or fraction to $100,000
 *     $905.00 + $4.00 per $1,000 or fraction to $1,000,000
 *     $4,505.00 + $3.00 per $1,000 or fraction to $5,000,000
 *     $16,505.00 + $2.00 per $1,000 or fraction above
 *   Plan review 30% of the building permit fee.
 * - Trade permits (electrical, plumbing, mechanical, gas): individual permits
 *   required; no-cost when filed under the GC's building permit number, the
 *   residential ladder standalone.
 *
 * Verified: 2026-09-26.
 */

export const COL_FEE_EFFECTIVE_FROM = "2014-07-01";

export const COL_RES_SOURCE_KEY = "columbia-residential-fee-schedule";
export const COL_COMM_SOURCE_KEY = "columbia-commercial-fee-schedule";
export const COL_APP_SOURCE_KEY = "columbia-commercial-permit-application";

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };
const COMMERCIAL: FeeCondition = { field: "occupancy", op: "eq", value: "commercial" };

function rule(
  sourceId: string,
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
    effectiveFrom: COL_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const COL_BUILDING_RULES: FeeRuleRecord[] = [
  // Residential: $20 at $1-$5,000; $4.00 per $1,000 or fraction above.
  rule(COL_RES_SOURCE_KEY, {
    id: "col-bld-res",
    code: "BLD-RES",
    label: "Residential building permit ($20.00 to $5,000; $4.00 per $1,000 or fraction above)",
    description:
      "Residential Development Review Fees: building permit $20.00 for $1.00 to $5,000 of value; over $5,000, $4.00 per $1,000 or fraction thereof. Valuation is the total contract price or ICC per-square-foot data (Average $45.00; Good $63.00; Best $70.00; Garage $25.00).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_000,
      thresholdCents: 500_000,
      incrementCents: 100_000,
      centsPerThousand: 400,
    },
    conditions: { all: [RESIDENTIAL] },
    priority: 100,
  }),
  rule(COL_RES_SOURCE_KEY, {
    id: "col-bld-plan-review-res",
    code: "COL-PLAN-REVIEW-RES",
    label: "Residential plan review fee ($25.00)",
    description: "Residential Development Review Fees: plan review $25.00.",
    feeType: "flat",
    componentType: "plan_review",
    config: {
      amountCents: 2_500,
    },
    conditions: { all: [RESIDENTIAL] },
    priority: 200,
  }),
  // Commercial chained ladder.
  rule(COL_COMM_SOURCE_KEY, {
    id: "col-bld-comm-band-100k",
    code: "BLD-COMM-100K",
    label: "Commercial building permit, $5,001–$100,000 ($50.00 + $9.00 per $1,000)",
    description:
      "Commercial Development Review Fees: $50.00 for the first $5,000.00 plus $9.00 per $1,000.00 or fraction thereof, to $100,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_000,
      thresholdCents: 500_000,
      incrementCents: 100_000,
      centsPerThousand: 900,
    },
    conditions: {
      all: [
        COMMERCIAL,
        { field: "valuation", op: "gt", value: 0 },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
    priority: 100,
  }),
  rule(COL_COMM_SOURCE_KEY, {
    id: "col-bld-comm-band-1m",
    code: "BLD-COMM-1M",
    label: "Commercial building permit, $100,001–$1,000,000 ($905.00 + $4.00 per $1,000)",
    description:
      "Commercial Development Review Fees: $905.00 for the first $100,000 plus $4.00 per $1,000.00 or fraction thereof, to $1,000,000. The base is what the band below produces at $100,000 — the ladder chains exactly.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 90_500,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      centsPerThousand: 400,
    },
    conditions: {
      all: [
        COMMERCIAL,
        { field: "valuation", op: "gt", value: 10_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
    priority: 100,
  }),
  rule(COL_COMM_SOURCE_KEY, {
    id: "col-bld-comm-band-5m",
    code: "BLD-COMM-5M",
    label: "Commercial building permit, $1,000,001–$5,000,000 ($4,505.00 + $3.00 per $1,000)",
    description:
      "Commercial Development Review Fees: $4,505.00 for the first $1,000,000 plus $3.00 per $1,000 or fraction thereof, to $5,000,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 450_500,
      thresholdCents: 100_000_000,
      incrementCents: 100_000,
      centsPerThousand: 300,
    },
    conditions: {
      all: [
        COMMERCIAL,
        { field: "valuation", op: "gt", value: 100_000_000 },
        { field: "valuation", op: "lte", value: 500_000_000 },
      ],
    },
    priority: 100,
  }),
  rule(COL_COMM_SOURCE_KEY, {
    id: "col-bld-comm-band-over-5m",
    code: "BLD-COMM-OVER-5M",
    label: "Commercial building permit, over $5,000,000 ($16,505.00 + $2.00 per $1,000)",
    description:
      "Commercial Development Review Fees: $16,505.00 for the first $5,000,000 plus $2.00 for each $1,000 or fraction thereof.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 1_650_500,
      thresholdCents: 500_000_000,
      incrementCents: 100_000,
      centsPerThousand: 200,
    },
    conditions: {
      all: [COMMERCIAL, { field: "valuation", op: "gt", value: 500_000_000 }],
    },
    priority: 100,
  }),
  rule(COL_COMM_SOURCE_KEY, {
    id: "col-bld-plan-review-comm",
    code: "COL-PLAN-REVIEW-COMM",
    label: "Commercial plan review fee (30% of the building permit fee)",
    description:
      "Commercial Development Review Fees: a plan review fee equal to 30% of the building permit fee is due at the time plans are submitted.",
    feeType: "percent",
    componentType: "plan_review",
    config: {
      basis: "permit_fee",
      rateBps: 3_000,
    },
    conditions: { all: [COMMERCIAL] },
    priority: 200,
  }),
];

export const COL_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(COL_RES_SOURCE_KEY, {
    id: "col-elec-res",
    code: "ELEC-RES",
    label: "Residential electrical permit ($20.00 to $5,000; $4.00 per $1,000 or fraction above)",
    description:
      "Standalone one- and two-family residential trade permits price at the residential building rate: $20.00 for the first $1–$5,000 of value, then $4.00 per $1,000 or fraction thereof.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_000,
      thresholdCents: 500_000,
      incrementCents: 100_000,
      centsPerThousand: 400,
    },
    conditions: { all: [RESIDENTIAL] },
    priority: 100,
  }),
  rule(COL_COMM_SOURCE_KEY, {
    id: "col-elec-comm",
    code: "ELEC-COMM",
    label: "Commercial electrical permit ($50.00 + $9.00 per $1,000 to $100,000)",
    description:
      "Commercial Development Review Fees: trade permits share the building ladder — $50.00 for the first $5,000 plus $9.00 per $1,000 or fraction thereof to $100,000, then the chained $4/$3/$2 bands.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_000,
      thresholdCents: 500_000,
      incrementCents: 100_000,
      centsPerThousand: 900,
    },
    conditions: { all: [COMMERCIAL] },
    priority: 100,
  }),
  rule(COL_APP_SOURCE_KEY, {
    id: "col-elec-note",
    code: "COL-ELEC-NOTE",
    label: "No-cost trade permit under a GC building permit",
    description:
      "Commercial permit application NOTE: subcontractors must obtain individual trade permits for electrical, mechanical, plumbing & gas, and must provide the general contractor's permit number for a no-cost permit — otherwise the subcontractor pays the permit fees.",
    feeType: "flat",
    config: {
      amountCents: 0,
    },
    conditions: {
      all: [{ field: "custom.trade_covered_by_master", op: "eq", value: true }],
    },
    priority: 150,
  }),
];

export const COL_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(COL_RES_SOURCE_KEY, {
    id: "col-plumb-res",
    code: "PLUMB-RES",
    label: "Residential plumbing permit ($20.00 to $5,000; $4.00 per $1,000 or fraction above)",
    description:
      "Standalone one- and two-family residential plumbing permits price at $20.00 for the first $1–$5,000 of value, then $4.00 per $1,000 or fraction thereof.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_000,
      thresholdCents: 500_000,
      incrementCents: 100_000,
      centsPerThousand: 400,
    },
    conditions: { all: [RESIDENTIAL] },
    priority: 100,
  }),
  rule(COL_COMM_SOURCE_KEY, {
    id: "col-plumb-comm",
    code: "PLUMB-COMM",
    label: "Commercial plumbing permit ($50.00 + $9.00 per $1,000 to $100,000)",
    description:
      "Commercial Development Review Fees: trade permits share the building ladder — $50.00 for the first $5,000 plus $9.00 per $1,000 or fraction thereof to $100,000, then the chained $4/$3/$2 bands.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_000,
      thresholdCents: 500_000,
      incrementCents: 100_000,
      centsPerThousand: 900,
    },
    conditions: { all: [COMMERCIAL] },
    priority: 100,
  }),
  rule(COL_APP_SOURCE_KEY, {
    id: "col-plumb-note",
    code: "COL-PLUMB-NOTE",
    label: "No-cost trade permit under a GC building permit",
    description:
      "Commercial permit application NOTE: subcontractors must provide the general contractor's permit number for a no-cost permit, otherwise the subcontractor pays the permit fees.",
    feeType: "flat",
    config: {
      amountCents: 0,
    },
    conditions: {
      all: [{ field: "custom.trade_covered_by_master", op: "eq", value: true }],
    },
    priority: 150,
  }),
];
