import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Anchorage, Alaska fee rules — REAL DATA.
 *
 * Source: Anchorage Municipal Code (AMC) Title 23 (Building Codes),
 *         Chapter 23.10 (Anchorage Administrative Code),
 *         Table 3-A (Building/Structure Permit Fees),
 *         Table 3-B (Plan Review Fees),
 *         Table 3-C, Table 3-D, Table 3-E.
 *
 * Verified: 2026-09-25.
 */

export const ANC_FEE_EFFECTIVE_FROM = "2024-04-23";

export const ANC_BUILDING_SOURCE_KEY = "anchorage-amc-23-10-table-3a";
export const ANC_PLAN_REVIEW_SOURCE_KEY = "anchorage-amc-23-10-table-3b";
export const ANC_TRADE_SOURCE_KEY = "anchorage-amc-23-10-trade-fees";

export const ANC_RESIDENTIAL_MINIMUM_CENTS = 36_000; // $360.00
export const ANC_COMMERCIAL_MINIMUM_CENTS = 52_500; // $525.00
export const ANC_TRADE_INSPECTION_CENTS = 17_500; // $175.00

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
    effectiveFrom: ANC_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const ANC_BUILDING_RULES: FeeRuleRecord[] = [
  // Residential: 0.009 x valuation (90 cents per $100 = $9.00 per $1,000)
  rule(ANC_BUILDING_SOURCE_KEY, {
    id: "anc-bld-res-valuation",
    code: "BLD-RES-VALUATION",
    label: "Residential building permit fee (0.009 × valuation)",
    description:
      "AMC 23.10 Table 3-A: One-, two-, and three-family dwellings (Group R-3, IRC) assessed at 0.009 x valuation ($9.00 per $1,000).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 900,
    },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "residential" }],
    },
    priority: 100,
  }),
  rule(ANC_BUILDING_SOURCE_KEY, {
    id: "anc-bld-res-minimum-floor",
    code: "BLD-RES-MINIMUM-FLOOR",
    label: "Minimum residential building permit fee ($360.00)",
    description:
      "AMC 23.10 Table 3-A: Minimum fee for residential building permits is $360.00.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: ANC_RESIDENTIAL_MINIMUM_CENTS,
    },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "permit_fee", op: "lt", value: ANC_RESIDENTIAL_MINIMUM_CENTS },
      ],
    },
    priority: 500,
  }),
  rule(ANC_PLAN_REVIEW_SOURCE_KEY, {
    id: "anc-bld-res-plan-review",
    code: "BLD-RES-PLAN-REVIEW-50",
    label: "Residential plan review fee (50% of permit fee)",
    description:
      "AMC 23.10 Table 3-B: Plan review fee for IRC residential structures (<= 3 units) is 50% of the building permit fee.",
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: {
      basis: "permit_fee",
      rateBps: 5_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "residential" }],
    },
  }),

  // Commercial: 0.015 x valuation up to $500,000 ($15.00 per $1,000)
  rule(ANC_BUILDING_SOURCE_KEY, {
    id: "anc-bld-comm-valuation-500k",
    code: "BLD-COMM-VALUATION-500K",
    label: "Commercial building permit fee (0.015 × valuation up to $500,000)",
    description:
      "AMC 23.10 Table 3-A: Commercial building construction valued up to $500,000 assessed at 0.015 x valuation ($15.00 per $1,000).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 1_500,
    },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "commercial" },
        { field: "valuation", op: "lte", value: 50_000_000 },
      ],
    },
    priority: 100,
  }),
  rule(ANC_BUILDING_SOURCE_KEY, {
    id: "anc-bld-comm-valuation-1m",
    code: "BLD-COMM-VALUATION-1M",
    label: "Commercial building permit fee ($500,001 to $1,000,000)",
    description:
      "AMC 23.10 Table 3-A: Commercial building construction $500,001 to $1,000,000 assessed at $7,500 + 0.010 x valuation over $500,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 750_000,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      centsPerThousand: 1_000,
    },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "commercial" },
        { field: "valuation", op: "gt", value: 50_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
    priority: 100,
  }),
  rule(ANC_BUILDING_SOURCE_KEY, {
    id: "anc-bld-comm-valuation-5m",
    code: "BLD-COMM-VALUATION-5M",
    label: "Commercial building permit fee ($1,000,001 to $5,000,000)",
    description:
      "AMC 23.10 Table 3-A: Commercial building construction $1,000,001 to $5,000,000 assessed at $12,500 + 0.008 x valuation over $1,000,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 1_250_000,
      thresholdCents: 100_000_000,
      incrementCents: 100_000,
      centsPerThousand: 800,
    },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "commercial" },
        { field: "valuation", op: "gt", value: 100_000_000 },
        { field: "valuation", op: "lte", value: 500_000_000 },
      ],
    },
    priority: 100,
  }),
  rule(ANC_BUILDING_SOURCE_KEY, {
    id: "anc-bld-comm-valuation-over-5m",
    code: "BLD-COMM-VALUATION-OVER-5M",
    label: "Commercial building permit fee ($5,000,001 and up)",
    description:
      "AMC 23.10 Table 3-A: Commercial building construction over $5,000,000 assessed at $44,500 + 0.006 x valuation over $5,000,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 4_450_000,
      thresholdCents: 500_000_000,
      incrementCents: 100_000,
      centsPerThousand: 600,
    },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "commercial" },
        { field: "valuation", op: "gt", value: 500_000_000 },
      ],
    },
    priority: 100,
  }),
  rule(ANC_BUILDING_SOURCE_KEY, {
    id: "anc-bld-comm-minimum-floor",
    code: "BLD-COMM-MINIMUM-FLOOR",
    label: "Minimum commercial building permit fee ($525.00)",
    description:
      "AMC 23.10 Table 3-A: Minimum fee for commercial building permits is $525.00.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: ANC_COMMERCIAL_MINIMUM_CENTS,
    },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "commercial" },
        { field: "permit_fee", op: "lt", value: ANC_COMMERCIAL_MINIMUM_CENTS },
      ],
    },
    priority: 500,
  }),
  rule(ANC_PLAN_REVIEW_SOURCE_KEY, {
    id: "anc-bld-comm-plan-review",
    code: "BLD-COMM-PLAN-REVIEW-65",
    label: "Commercial plan review fee (65% of permit fee)",
    description:
      "AMC 23.10 Table 3-B: Plan review fee for commercial (IBC) construction is 65% of the building permit fee.",
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: {
      basis: "permit_fee",
      rateBps: 6_500,
    },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "commercial" }],
    },
  }),
];

export const ANC_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(ANC_TRADE_SOURCE_KEY, {
    id: "anc-elec-inspection-base",
    code: "ELEC-INSPECTION-BASE",
    label: "Electrical trade inspection permit fee ($175.00)",
    description:
      "AMC 23.10 Table 3-C / Table 3-D: Standard inspection fee for electrical permits charged at the hourly rate ($175.00/hour, 1-hour minimum).",
    feeType: "flat",
    config: {
      amountCents: ANC_TRADE_INSPECTION_CENTS,
    },
    priority: 100,
  }),
];

export const ANC_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(ANC_TRADE_SOURCE_KEY, {
    id: "anc-plumb-inspection-base",
    code: "PLUMB-INSPECTION-BASE",
    label: "Plumbing trade inspection permit fee ($175.00)",
    description:
      "AMC 23.10 Table 3-C / Table 3-E: Standard inspection fee for plumbing permits charged at the hourly rate ($175.00/hour, 1-hour minimum).",
    feeType: "flat",
    config: {
      amountCents: ANC_TRADE_INSPECTION_CENTS,
    },
    priority: 100,
  }),
];
