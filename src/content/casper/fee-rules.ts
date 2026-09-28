import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Casper, Wyoming fee rules — REAL DATA.
 *
 * Source (research/wyoming/casper.md):
 *   - City of Casper "Combined Building, Electrical, Plumbing and Mechanical
 *     Permit Fee Schedule", Community Development Department handout (2026
 *     edition, printed September 11, 2026; the casperwy.gov server 403s
 *     non-browser agents, so the handout was captured from the document copy
 *     published with the Title 15 ordinance packet). The CURRENT edition is
 *     modelled: $60/$65 opening rows, +$5 per $100 band to $2,000, +$10 per
 *     $1,000 band to $100,000, then the printed tail "$1,090.00 for the first
 *     $100,000.00, plus $5.60 for each additional $1,000.00, or fraction
 *     thereof." The superseded edition in the same packet ($70 opening,
 *     65% plan check, $280 flat residential review) was rejected.
 *
 * Shape: ONE valuation table serves building, electrical, plumbing and
 * mechanical permits ("PERMIT FEE (Building, Plumbing, Mechanical, and
 * Electrical)"); plan check 25% residential / 35% multi-family-commercial-
 * industrial over $25,000 valuation.
 *
 * Verified: 2026-09-26.
 */

export const CAS_FEE_EFFECTIVE_FROM = "2026-09-11"; // current handout edition

export const CAS_BUILDING_SOURCE_KEY = "casper-community-development-fee-schedule";
export const CAS_ELECTRICAL_SOURCE_KEY = "casper-community-development-fee-schedule";
export const CAS_PLUMBING_SOURCE_KEY = "casper-community-development-fee-schedule";

function rule(
  sourceId: string,
  prefix: string,
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
    effectiveFrom: CAS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
    code: `${prefix}-${overrides.code}`,
  };
}

/**
 * The combined schedule's valuation ladder, re-declared per permit type with
 * the trade prefix.
 */
function casperLadder(sourceId: string, prefix: string): FeeRuleRecord[] {
  const band = (
    id: string,
    code: string,
    label: string,
    description: string,
    baseCents: number,
    thresholdCents: number,
    centsPerThousand: number,
    incrementCents: number,
    op: "lte" | "gt",
    boundCents: number,
  ): FeeRuleRecord =>
    rule(sourceId, prefix, {
      id,
      code,
      label,
      description,
      feeType: "per_thousand",
      config: { basis: "valuation", baseCents, thresholdCents, centsPerThousand, incrementCents },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: thresholdCents },
          { field: "valuation", op, value: boundCents },
        ],
      },
    });

  return [
    band(
      "cas-ladder-500",
      "BAND-500",
      "Valuation $1-$500 ($60.00)",
      "Combined schedule: $1 to $500 valuation — $60.00.",
      0,
      0,
      0,
      0,
      "lte",
      50_000,
    ),
    band(
      "cas-ladder-1k",
      "BAND-1K",
      "Valuation $501-$1,000 ($65.00)",
      "Combined schedule: $501 to $1,000 valuation — $65.00.",
      6_500,
      50_000,
      0,
      0,
      "lte",
      100_000,
    ),
    band(
      "cas-ladder-2k",
      "BAND-2K",
      "Valuation $1,001-$2,000 ($70.00 first $1,000 + $5.00 per additional $100 or fraction)",
      "Combined schedule: from $1,001 the ladder rises $5.00 per $100 band or fraction, printing $70.00 at $1,001-$1,100 through $150.00 at the $2,000 seam.",
      6_500,
      100_000,
      500,
      10_000,
      "lte",
      200_000,
    ),
    band(
      "cas-ladder-100k",
      "BAND-100K",
      "Valuation $2,001-$100,000 ($150.00 first $2,000 + $10.00 per additional $1,000 or fraction)",
      "Combined schedule: from $2,001 the ladder rises $10.00 per $1,000 band or fraction, printing $1,090.00 at the $100,000 seam ($150.00 + 94 × $10.00).",
      15_000,
      200_000,
      1_000,
      100_000,
      "lte",
      10_000_000,
    ),
    band(
      "cas-ladder-open",
      "BAND-100KUP",
      "Valuation over $100,000 ($1,090.00 first $100,000 + $5.60 per additional $1,000 or fraction)",
      "Combined schedule, printed tail: 'For valuations exceeding $100,000.00, the building permit fee shall be $1,090.00 for the first $100,000.00, plus $5.60 for each additional $1,000.00, or fraction thereof.'",
      109_000,
      10_000_000,
      560,
      100_000,
      "gt",
      10_000_000,
    ),
  ];
}

function planChecks(sourceId: string, prefix: string): FeeRuleRecord[] {
  return [
    rule(sourceId, prefix, {
      id: "cas-plan-check-res",
      code: "PLAN-CHECK-RES-25",
      label: "Residential plan check fee (25% of the building permit fee, valuation over $25,000)",
      description:
        "Combined schedule: a plan check fee of 25% of the building permit fee is assessed on all residential building permits whose valuations exceed $25,000.00.",
      componentType: "plan_review",
      feeType: "percent",
      config: { basis: "permit_fee", rateBps: 2_500 },
      priority: 200,
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: "residential" },
          { field: "valuation", op: "gt", value: 2_500_000 },
        ],
      },
    }),
    rule(sourceId, prefix, {
      id: "cas-plan-check-comm",
      code: "PLAN-CHECK-COMM-35",
      label:
        "Multi-family, commercial and industrial plan check fee (35% of the permit fee, valuation over $25,000)",
      description:
        "Combined schedule: a plan check fee of 35% of the building permit fee is assessed on all building permits for multi-family, commercial, and industrial projects whose valuations exceed $25,000.00.",
      componentType: "plan_review",
      feeType: "percent",
      config: { basis: "permit_fee", rateBps: 3_500 },
      priority: 200,
      conditions: {
        all: [
          { field: "occupancy", op: "neq", value: "residential" },
          { field: "valuation", op: "gt", value: 2_500_000 },
        ],
      },
    }),
    rule(sourceId, prefix, {
      id: "cas-plan-check-solar",
      code: "PLAN-CHECK-SOLAR-50",
      label: "Residential solar plan check fee ($50.00)",
      description:
        "Combined schedule: a plan check fee of $50.00 is assessed on all residential solar permits; commercial solar pays 35% of the solar permit fee.",
      componentType: "plan_review",
      feeType: "flat",
      config: { amountCents: 5_000 },
      priority: 210,
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: "residential" },
          { field: "custom.solar", op: "eq", value: true },
        ],
      },
    }),
  ];
}

function replacementRows(sourceId: string, prefix: string): FeeRuleRecord[] {
  return [
    rule(sourceId, prefix, {
      id: "cas-water-heater-replacement",
      code: "WH-REPLACE-40",
      label: "Residential tank-style water heater replacement permit ($40.00)",
      description:
        "Combined schedule, additional permit rows: residential tank-style water heater replacement permit — $40.00.",
      feeType: "flat",
      config: { amountCents: 4_000 },
      conditions: {
        all: [{ field: "custom.water_heater_replacement", op: "eq", value: true }],
      },
    }),
    rule(sourceId, prefix, {
      id: "cas-furnace-replacement",
      code: "FURNACE-REPLACE-40",
      label: "Residential furnace replacement permit ($40.00)",
      description:
        "Combined schedule, additional permit rows: residential furnace replacement permit — $40.00.",
      feeType: "flat",
      config: { amountCents: 4_000 },
      conditions: {
        all: [{ field: "custom.furnace_replacement", op: "eq", value: true }],
      },
    }),
  ];
}

export const CAS_BUILDING_RULES: FeeRuleRecord[] = [
  ...casperLadder(CAS_BUILDING_SOURCE_KEY, "BLD"),
  ...planChecks(CAS_BUILDING_SOURCE_KEY, "BLD"),
  ...replacementRows(CAS_BUILDING_SOURCE_KEY, "BLD"),

  // Demolitions.
  rule(CAS_BUILDING_SOURCE_KEY, "BLD", {
    id: "cas-demo-res",
    code: "DEMO-RES-200",
    label: "Residential demolition permit ($200.00)",
    description:
      "Combined schedule: residential demolition permit $200.00, plus an Erosion Control Permit if applicable.",
    feeType: "flat",
    config: { amountCents: 20_000 },
    conditions: {
      all: [
        { field: "work_type", op: "eq", value: "demolition" },
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "valuation", op: "absent" },
      ],
    },
  }),
  rule(CAS_BUILDING_SOURCE_KEY, "BLD", {
    id: "cas-demo-comm",
    code: "DEMO-COMM-300",
    label: "Commercial demolition permit ($300.00)",
    description:
      "Combined schedule: commercial demolition permit $300.00, plus an Erosion Control Permit if applicable.",
    feeType: "flat",
    config: { amountCents: 30_000 },
    conditions: {
      all: [
        { field: "work_type", op: "eq", value: "demolition" },
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "absent" },
      ],
    },
  }),

  // Mobile home set permit.
  rule(CAS_BUILDING_SOURCE_KEY, "BLD", {
    id: "cas-mobile-home-set",
    code: "MH-SET-70",
    label: "Mobile home set permit ($70.00)",
    description:
      "Combined schedule, additional permit rows: mobile home set permit — $70.00.",
    feeType: "flat",
    config: { amountCents: 7_000 },
    conditions: {
      all: [{ field: "custom.mobile_home_set", op: "eq", value: true }],
    },
  }),

  // Re-inspections: $75 per re-inspection beyond the second for the same
  // inspection (the schedule's "More than 2 inspections for the same
  // inspection" row), with the $75 residential / $150 commercial compliance
  // inspection rows alongside.
  rule(CAS_BUILDING_SOURCE_KEY, "BLD", {
    id: "cas-reinspection",
    code: "REINSPECT-75",
    label: "Re-inspection fee ($75.00 per re-inspection)",
    description:
      "Combined schedule: re-inspections — $75.00 per re-inspection (more than two inspections for the same inspection). Code compliance inspection $75.00 residential / $150.00 commercial; permit and code research $50.00 per hour.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 7_500 },
    conditions: {
      all: [{ field: "custom.reinspections", op: "gte", value: 1 }],
    },
  }),
];

export const CAS_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...casperLadder(CAS_ELECTRICAL_SOURCE_KEY, "ELEC"),
  ...planChecks(CAS_ELECTRICAL_SOURCE_KEY, "ELEC"),
  ...replacementRows(CAS_ELECTRICAL_SOURCE_KEY, "ELEC"),
];

export const CAS_PLUMBING_RULES: FeeRuleRecord[] = [
  ...casperLadder(CAS_PLUMBING_SOURCE_KEY, "PLUMB"),
  ...planChecks(CAS_PLUMBING_SOURCE_KEY, "PLUMB"),
  ...replacementRows(CAS_PLUMBING_SOURCE_KEY, "PLUMB"),
];
