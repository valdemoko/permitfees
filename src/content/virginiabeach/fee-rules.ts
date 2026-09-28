import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Virginia Beach, Virginia fee rules — REAL DATA.
 *
 * Sources: City of Virginia Beach Permits & Inspections fee sheets,
 *          "Residential Building Permit Fees" and "Commercial Building Permit
 *          Fees", both rev. Jul-2025, plus the City's Trades Permits page.
 *
 * - Residential heated new/additions: $50.00 + $7.00 per 100 sq ft, or fraction.
 * - Residential plan review $100.00; commercial plan review $200.00.
 * - Electrical new service: $50.00 + $20.00 per 50 amps (single phase).
 * - Electrical circuits: $50.00 + $5.00 per circuit; $50.00 each named scope.
 * - Plumbing: $50.00 + $6.00 per fixture/drain.
 * - Every permit: 2% state levy on the permit fees + $10.00 technology fee.
 *
 * Verified: 2026-09-26.
 */

export const VB_FEE_EFFECTIVE_FROM = "2025-07-01";

export const VB_RES_SOURCE_KEY = "vb-residential-permit-fees";
export const VB_COMM_SOURCE_KEY = "vb-commercial-permit-fees";
export const VB_TRADE_SOURCE_KEY = "vb-trades-permits-page";

export const VB_TECH_FEE_CENTS = 1_000; // $10.00
export const VB_STATE_LEVY_BPS = 200; // 2.0%

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
    effectiveFrom: VB_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/** The 2% state levy + $10 technology fee pair every Virginia Beach permit carries. */
function sharedAddOns(
  sourceId: string,
  prefix: string,
): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: `${prefix}-state-levy`,
      code: "VA-STATE-LEVY",
      label: "Virginia 2% state levy on permit fees",
      description:
        "Both Virginia Beach fee sheets state: 'A 2% State Levy will be assessed on the permit fees listed above.'",
      feeType: "percent",
      componentType: "state_surcharge",
      config: {
        basis: "fee_subtotal",
        rateBps: VB_STATE_LEVY_BPS,
      },
      // Evaluated before the technology fee so the levy reads only the permit
      // fees "listed above" — the sheets print the levy line before the
      // technology-fee line, and 2% of the $10 fee would charge the rider
      // twice.
      priority: 600,
    }),
    rule(sourceId, {
      id: `${prefix}-tech-fee`,
      code: "VB-TECH-FEE",
      label: "Technology fee ($10.00 per permit)",
      description:
        "Both Virginia Beach fee sheets state: 'A $10.00 Technology Fee is assessed on all permits.'",
      feeType: "flat",
      componentType: "technology",
      config: {
        amountCents: VB_TECH_FEE_CENTS,
      },
      priority: 650,
    }),
  ];
}

export const VB_BUILDING_RULES: FeeRuleRecord[] = [
  // $7.00 per 100 sq ft of heated area, or fraction thereof: stored as an exact
  // fraction of a cent per square foot (700/100) so the rate reads as printed.
  rule(VB_RES_SOURCE_KEY, {
    id: "vb-bld-res-area",
    code: "BLD-RES-AREA",
    label: "Residential building permit fee ($7.00 per 100 sq ft, or fraction)",
    description:
      "Residential Building Permit Fees sheet (rev. Jul-2025): heated living area new and additions are $50.00 plus $7.00 per 100 square feet of area or fraction thereof.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      // 700 cents per 100 sq ft = 7 cents per sq ft, with a 100-sq-ft increment
      // that rounds up ("or fraction thereof").
      rate: { numerator: 700, denominator: 100 },
      incrementCents: 100,
    },
    conditions: { all: [RESIDENTIAL] },
    priority: 100,
  }),
  rule(VB_RES_SOURCE_KEY, {
    id: "vb-bld-res-base",
    code: "BLD-RES-BASE",
    label: "Residential building permit base fee ($50.00)",
    description:
      "Residential Building Permit Fees sheet: the area rate rides a $50.00 base ('The $50.00 plus $7.00 per 100 square feet' formula).",
    feeType: "flat",
    config: {
      amountCents: 5_000,
    },
    conditions: { all: [RESIDENTIAL] },
    priority: 110,
  }),
  rule(VB_COMM_SOURCE_KEY, {
    id: "vb-bld-comm-area",
    code: "BLD-COMM-AREA",
    label: "Commercial building permit fee ($8.00 per 100 sq ft, or fraction)",
    description:
      "Commercial Building Permit Fees sheet (rev. Jul-2025): commercial new and additions are $50.00 plus $8.00 per 100 square feet of area or fraction thereof.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 800, denominator: 100 },
      incrementCents: 100,
    },
    conditions: { all: [COMMERCIAL] },
    priority: 100,
  }),
  rule(VB_COMM_SOURCE_KEY, {
    id: "vb-bld-comm-base",
    code: "BLD-COMM-BASE",
    label: "Commercial building permit base fee ($50.00)",
    description:
      "Commercial Building Permit Fees sheet: the area rate rides a $50.00 base.",
    feeType: "flat",
    config: {
      amountCents: 5_000,
    },
    conditions: { all: [COMMERCIAL] },
    priority: 110,
  }),
  rule(VB_RES_SOURCE_KEY, {
    id: "vb-bld-plan-review",
    code: "BLD-PLAN-REVIEW",
    label: "Plan review fee ($100.00 residential / $200.00 commercial)",
    description:
      "Residential sheet: 'Residential Plan Review Fee $100.00.' Commercial sheet: 'Commercial Plan Review Fee $200.00.'",
    feeType: "tiered_table",
    componentType: "plan_review",
    priority: 200,
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: null, amountCents: 10_000 },
      ],
    },
    conditions: { all: [RESIDENTIAL] },
  }),
  rule(VB_COMM_SOURCE_KEY, {
    id: "vb-bld-plan-review-comm",
    code: "BLD-PLAN-REVIEW-COMM",
    label: "Commercial plan review fee ($200.00)",
    description: "Commercial sheet: 'Commercial Plan Review Fee $200.00.'",
    feeType: "tiered_table",
    componentType: "plan_review",
    priority: 200,
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: null, amountCents: 20_000 },
      ],
    },
    conditions: { all: [COMMERCIAL] },
  }),
  ...sharedAddOns(VB_RES_SOURCE_KEY, "vb-bld"),
];

export const VB_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(VB_TRADE_SOURCE_KEY, {
    id: "vb-elec-service-base",
    code: "ELEC-SERVICE-BASE",
    label: "New electrical service, single phase ($50.00 + $20.00 per 50 amps)",
    description:
      "Trades Permits page: 'New Service Single Phase: $50.00 plus $20.00 per 50 amps' — 50 A $70; 100 A $90; 150 A $110; 200 A $130; 300 A $170; 400 A $210.",
    // "per 50 amps" with the page's own printed ladder showing each 50-amp
    // step charged whole: 2,000 cents / 50 amperes = 40 cents per ampere,
    // with a 50-ampere increment that rounds up (the sheet's steps are whole).
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 2_000, denominator: 50 },
      incrementCents: 50,
    },
    conditions: {
      all: [{ field: "custom.amperage", op: "exists" }],
    },
    priority: 100,
  }),
  rule(VB_TRADE_SOURCE_KEY, {
    id: "vb-elec-service-base-fee",
    code: "ELEC-SERVICE-BASE-FEE",
    label: "New electrical service base fee ($50.00)",
    description:
      "Trades Permits page: 'New Service Single Phase: $50.00 plus $20.00 per 50 amps' — the amperage rate rides a $50.00 base.",
    feeType: "flat",
    config: {
      amountCents: 5_000,
    },
    conditions: {
      all: [{ field: "custom.amperage", op: "exists" }],
    },
    priority: 110,
  }),
  rule(VB_TRADE_SOURCE_KEY, {
    id: "vb-elec-circuits",
    code: "ELEC-CIRCUITS",
    label: "Electrical additions or repairs ($50.00 + $5.00 per circuit)",
    description:
      "Trades Permits page: 'Additions or Repairs: For each piece of equipment connected and for each circuit or feeder installed, extended, relocated or repaired, the fee shall be $50.00 plus $5.00 per circuit.'",
    feeType: "per_unit",
    config: {
      unit: "circuits",
      centsPerUnit: 500,
      baseCents: 5_000,
      thresholdUnits: 0,
    },
    conditions: {
      all: [
        { field: "custom.circuits", op: "exists" },
        { field: "custom.amperage", op: "absent" },
      ],
    },
    priority: 100,
  }),
  ...sharedAddOns(VB_TRADE_SOURCE_KEY, "vb-elec"),
];

export const VB_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(VB_TRADE_SOURCE_KEY, {
    id: "vb-plumb-fixtures",
    code: "PLUMB-FIXTURES",
    label: "Plumbing permit ($50.00 + $6.00 per fixture/drain)",
    description:
      "Trades Permits page: 'Plumbing permit: $50 plus $6 per fixture/drain.' Line conversions/replacements are $50.00 flat; on-site collector or distribution lines are $80.00 for one building or $50.00 plus $50.00 per additional building.",
    feeType: "per_unit",
    config: {
      unit: "fixtures",
      centsPerUnit: 600,
      baseCents: 5_000,
      thresholdUnits: 0,
    },
    priority: 100,
  }),
  ...sharedAddOns(VB_TRADE_SOURCE_KEY, "vb-plumb"),
];
