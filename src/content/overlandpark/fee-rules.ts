import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Overland Park, Kansas fee rules — REAL DATA.
 *
 * Source: the City of Overland Park "Development Approval and Permit Fees"
 * schedule, effective 08/01/2025 (one consolidated PDF carrying planning fees,
 * sign permits and the "Construction Plan Review, Permits and Inspection
 * Fees" block), beside the "Common Permit Fees" explainer page. See
 * research/kansas/overland-park.md for the access record (the fee PDF is
 * served unguarded from content.civicplus.com; the explainer page renders in
 * a browser) and for the structural fact that drives this seed's shape:
 *
 * Overland Park publishes NO separate electrical or plumbing permit fee. The
 * valuation definition includes electrical, plumbing, heating and a/c, and
 * the schedule's construction block names building, land disturbance, site
 * development, public improvement, floodplain and moving permits — no trade
 * permits. The electrical and plumbing seeds therefore model the schedule's
 * own price for SMALL stand-alone trade-scale projects — the $30/$50 flat
 * building-permit tiers plus the $30 flat plan review — which is what a
 * $1–$19,000 remodelling job pays regardless of trade, and stand those rows
 * down (custom.trade_bundled) when the trade work rides a building permit.
 *
 * Verified: 2026-09-26.
 */

export const OP_FEE_EFFECTIVE_FROM = "2025-08-01";

export const OP_SOURCE_KEY = "op-development-approval-permit-fees-2025";

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
    effectiveFrom: OP_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * "Building Permit, Work Value for new construction square footage based upon
 * ICC Building Valuation Data Tables" — the new-construction path, whose
 * valuation the ICC tables derive and whose multiplier is 0.0035.
 */
const ICC_PATH: FeeCondition = {
  field: "custom.valuation_source",
  op: "eq",
  value: "icc",
};
/** The applicant-submitted-value path, multiplier 0.0050 at $19,000 and above. */
const SUBMITTED_PATH: FeeCondition = {
  field: "custom.valuation_source",
  op: "eq",
  value: "submitted",
};
/** Table I/H-style: the trade work rides a building permit. */
const NOT_BUNDLED: FeeCondition = { field: "custom.trade_bundled", op: "absent" };

export const OP_BUILDING_RULES: FeeRuleRecord[] = [
  rule(OP_SOURCE_KEY, {
    id: "op-bld-icc-0035",
    code: "BLD-ICC-0035",
    label: "Building permit, new construction (ICC valuation path) — 0.0035 × valuation",
    description:
      '"Building Permit — Work Value for new construction square footage based upon ICC Building Valuation Data Tables. \'Permit Fee Multiplier\' is: 0.0035. Fee = Valuation × Permit Fee Multiplier." The valuation is derived from the annually-adopted ICC Building Valuation Data Tables (square footage × the per-square-foot figure for the construction type and occupancy); the permit application supplies that derived valuation and the rule multiplies it.',
    feeType: "percent",
    config: { basis: "valuation", rateBps: 35 },
    conditions: {
      all: [ICC_PATH, { field: "custom.portfolio_home", op: "absent" }],
    },
  }),
  rule(OP_SOURCE_KEY, {
    id: "op-bld-portfolio-0035",
    code: "BLD-PORTFOLIO-0035",
    label: "Portfolio Homes building permit — 0.0035 × valuation, plan review waived",
    description:
      '"Portfolio Homes Building Permit — \'Permit Fee Multiplier\' is: 0.0035. Plan Review: Waived." The city\'s production-builder program pays the same multiplier with the plan-review step waived — modelled as its own rule so the waiver is visible in the working (no plan-review percentage is due on this path).',
    feeType: "percent",
    config: { basis: "valuation", rateBps: 35 },
    conditions: {
      all: [ICC_PATH, { field: "custom.portfolio_home", op: "eq", value: true }],
    },
  }),
  rule(OP_SOURCE_KEY, {
    id: "op-bld-submitted-0050",
    code: "BLD-SUBMITTED-0050",
    label: "Building permit, applicant-submitted value $19,000 and above — 0.0050 × valuation",
    description:
      '"Building Permit — Work Value based upon applicant submitted value $19,000. \'Permit Fee Multiplier\' is: 0.0050. Fee = Valuation × Permit Fee Multiplier." Valuation is "the total value of all construction work for which the Building Permit is issued, e.g., building cost, all finish work, painting, paving, electrical, plumbing, heating, a/c, elevators, fire protection equipment, and other pertinent work or equipment." When a project is taken over by a different contractor, the fee recalculates on the remaining work.',
    feeType: "percent",
    config: { basis: "valuation", rateBps: 50 },
    conditions: {
      // The multiplier takes over above the $19,000 seam; the flats cover
      // "$19,000 or less" (the Common Permit Fees page: "Projects valued more
      // than $19,001 — city staff calculates permit fees … based on the
      // project valuation").
      all: [SUBMITTED_PATH, { field: "valuation", op: "gt", value: 1_900_000 }],
    },
  }),

  // ---- Small projects and remodels: the flat tiers, $19,000 or less ----
  rule(OP_SOURCE_KEY, {
    id: "op-bld-flat-1",
    code: "BLD-FLAT-1",
    label: "Building permit, work value $1–$5,000 — $30.00 flat",
    description:
      '"Building Permit, Work Value is $19,000 or less — Valuation of Work $1 - $5,000: Flat Building Permit Fee $30." The Common Permit Fees page restates it for the remodel/repair path: "Projects valued less than $5,000 — permits for these projects are $30."',
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [{ field: "valuation", op: "lte", value: 500_000 }],
    },
  }),
  rule(OP_SOURCE_KEY, {
    id: "op-bld-flat-2",
    code: "BLD-FLAT-2",
    label: "Building permit, work value $5,001–$19,000 — $50.00 flat",
    description:
      '"Building Permit, Work Value is $19,000 or less — Valuation of Work $5,001 - $19,000: Flat Building Permit Fee $50." The Common Permit Fees page: "Projects valued between $5,000 and $19,000 — permits for these projects are $50."',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 500_000 },
        { field: "valuation", op: "lte", value: 1_900_000 },
      ],
    },
  }),
  rule(OP_SOURCE_KEY, {
    id: "op-bld-plan-review-flat",
    code: "PLAN-REVIEW-FLAT",
    label: "Flat plan review fee — $30.00 (projects valued $19,000 or less)",
    description:
      '"Flat Plan Review Fee $30. The Flat Building Permit Fee shall be paid in addition to the Flat Plan Review Fee, for a Total Plan Review and Permit Fee of $60 for work valued at $1 - $5,000 and $80 for work valued at $5,001 - $19,000. The Plan Review Fee is due at the time of the application." This $30 is a real additional fee — unlike larger projects\' plan review, which is a 50%-at-submission payment split of the permit fee itself, not a charge on top.',
    feeType: "flat",
    componentType: "plan_review",
    priority: 200,
    config: { amountCents: 3_000 },
    conditions: {
      all: [{ field: "valuation", op: "lte", value: 1_900_000 }],
    },
  }),
];

/**
 * The electrical page: Overland Park has no separate electrical permit. What
 * a stand-alone trade-scale project pays is the small-project regime — the
 * flat building-permit tier plus the flat plan review — and what a bundled
 * trade pays is nothing here, its cost inside the building permit that
 * carried it. Both facts are the schedule's own.
 */
export const OP_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(OP_SOURCE_KEY, {
    id: "op-elec-flat-1",
    code: "ELEC-FLAT-1",
    label: "Stand-alone electrical-scale project, work value $1–$5,000 — $30.00 permit + $30.00 plan review",
    description:
      'The schedule publishes no separate electrical permit: valuation includes "electrical, plumbing, heating" and the construction block names no trade permits. A stand-alone electrical-scale job therefore pays the building-permit flat tier ($30 for $1–$5,000 of work value) plus the $30 flat plan review — the schedule\'s printed $60 total.',
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [NOT_BUNDLED, { field: "valuation", op: "lte", value: 500_000 }],
    },
  }),
  rule(OP_SOURCE_KEY, {
    id: "op-elec-flat-2",
    code: "ELEC-FLAT-2",
    label: "Stand-alone electrical-scale project, work value $5,001–$19,000 — $50.00 permit",
    description:
      'The same regime one tier up: "$50" for $5,001–$19,000 of work value, with the $30 flat plan review on top — the printed $80 total. Trade work riding a building permit pays nothing here.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: {
      all: [
        NOT_BUNDLED,
        { field: "valuation", op: "gt", value: 500_000 },
        { field: "valuation", op: "lte", value: 1_900_000 },
      ],
    },
  }),
  rule(OP_SOURCE_KEY, {
    id: "op-elec-plan-review-flat",
    code: "ELEC-PLAN-REVIEW-FLAT",
    label: "Flat plan review fee — $30.00 (stand-alone projects valued $19,000 or less)",
    description:
      '"Flat Plan Review Fee $30 … The Plan Review Fee is due at the time of the application." Charged beside the flat permit tier; larger projects\' plan review is a payment split, not this fee.',
    feeType: "flat",
    componentType: "plan_review",
    priority: 200,
    config: { amountCents: 3_000 },
    conditions: {
      all: [NOT_BUNDLED, { field: "valuation", op: "lte", value: 1_900_000 }],
    },
  }),
];

/** The plumbing page: the same stand-alone regime as the electrical page. */
export const OP_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(OP_SOURCE_KEY, {
    id: "op-pl-flat-1",
    code: "PL-FLAT-1",
    label: "Stand-alone plumbing-scale project, work value $1–$5,000 — $30.00 permit + $30.00 plan review",
    description:
      'The schedule publishes no separate plumbing permit: the same valuation definition and construction block cover plumbing. A stand-alone plumbing-scale job pays the building-permit flat tier plus the $30 flat plan review — the printed $60 total.',
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [NOT_BUNDLED, { field: "valuation", op: "lte", value: 500_000 }],
    },
  }),
  rule(OP_SOURCE_KEY, {
    id: "op-pl-flat-2",
    code: "PL-FLAT-2",
    label: "Stand-alone plumbing-scale project, work value $5,001–$19,000 — $50.00 permit",
    description:
      'The $50 tier for $5,001–$19,000 of work value, with the $30 flat plan review on top — the printed $80 total.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: {
      all: [
        NOT_BUNDLED,
        { field: "valuation", op: "gt", value: 500_000 },
        { field: "valuation", op: "lte", value: 1_900_000 },
      ],
    },
  }),
  rule(OP_SOURCE_KEY, {
    id: "op-pl-plan-review-flat",
    code: "PL-PLAN-REVIEW-FLAT",
    label: "Flat plan review fee — $30.00 (stand-alone projects valued $19,000 or less)",
    description:
      '"Flat Plan Review Fee $30 … The Plan Review Fee is due at the time of the application."',
    feeType: "flat",
    componentType: "plan_review",
    priority: 200,
    config: { amountCents: 3_000 },
    conditions: {
      all: [NOT_BUNDLED, { field: "valuation", op: "lte", value: 1_900_000 }],
    },
  }),
];
