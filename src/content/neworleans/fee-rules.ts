import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * New Orleans, Louisiana fee rules — REAL DATA.
 *
 * Two authorities set these fees, and the City says so:
 *   - Building and electrical: City of New Orleans, Department of Safety & Permits
 *     (Building Permit Fee Schedule PDF + Guide to Building Permits + Electrical
 *     Permit page). Building: $60 base + $5 per $1,000 of construction value; plan
 *     review $1 per $1,000, minimum $60; 50% historic-district surcharge on the
 *     permit fee; demolition $95 base + $5 per $1,000.
 *   - Plumbing: the Sewerage & Water Board of New Orleans (SWBNO), a separate
 *     political corporation. Its Licensed Master Plumbers file through the City's
 *     One Stop portal, where the permit record shows a $50.00 "SWB Filing Fee".
 *     SWBNO publishes no complete public schedule of its inspection fees — that
 *     absence is a finding recorded on the page, never filled in.
 *
 * Reading notes recorded in research/louisiana/new-orleans.md §2–4:
 *   - every per-$1,000 rate here prints no "or fraction thereof" and the City's own
 *     formula ("job value x .005 + $60") multiplies straight through, so the rates
 *     prorate exactly;
 *   - the fee-schedule PDF's plan-review minimum ($60) is charged; the estimator
 *     page's "$120" figure is named on the page as the conflict it is;
 *   - the historic surcharge is charged on the permit fee (both City sources agree)
 *     and the PDF's wider scope (plan review, demolition, sign) is recorded;
 *   - the unpermitted-work penalty is 200% of all fees — named, not modelled.
 *
 * Verified: 2026-09-26.
 */

export const NOLA_FEE_EFFECTIVE_FROM = "2026-01-22"; // Guide page's "Last updated" date

export const NOLA_BUILDING_SOURCE_KEY = "nola-building-fee-schedule";
export const NOLA_ELECTRICAL_SOURCE_KEY = "nola-electrical-permit";
export const NOLA_PLUMBING_SOURCE_KEY = "swbno-plumbing-info";

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
    effectiveFrom: NOLA_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const NOLA_BUILDING_RULES: FeeRuleRecord[] = [
  // Building permit: $60 base + $5 per $1,000 of construction value
  rule(NOLA_BUILDING_SOURCE_KEY, {
    id: "nola-bld-permit",
    code: "NOLA-BLD-PERMIT",
    label: "Building permit fee ($60 + $5 per $1,000 of construction value)",
    description:
      "Building Permit Fee Schedule: fees for building permits (not including demolition) are $60 base fee + $5 per $1,000 of construction value (the guide's formula: job value × .005 + $60).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 6_000,
      centsPerThousand: 500,
    },
  }),

  // Plan review: $1 per $1,000, minimum $60, when plans are required
  rule(NOLA_BUILDING_SOURCE_KEY, {
    id: "nola-bld-plan-review",
    code: "NOLA-BLD-PLAN-REVIEW",
    label: "Plan review fee ($1 per $1,000, minimum $60)",
    description:
      "Building Permit Fee Schedule: if a project requires plan review, an additional $1 per $1,000 of construction value is assessed; the minimum plan review fee is $60. (The Building Permit Fee Estimator page prints '$120 or $1 per $1,000' — the schedule's $60 minimum is charged and the estimator's figure is recorded as a conflict.)",
    feeType: "per_thousand",
    componentType: "plan_review",
    minimumCents: 6_000,
    priority: 200,
    config: {
      basis: "valuation",
      centsPerThousand: 100,
    },
  }),

  // Historic-district surcharge: 50% of the permit fee (HDLC / VCC jurisdiction)
  rule(NOLA_BUILDING_SOURCE_KEY, {
    id: "nola-bld-historic",
    code: "NOLA-BLD-HISTORIC-50",
    label: "Historic district surcharge (50% of the building permit fee)",
    description:
      "Building Permit Fee Schedule: for work in locations under the jurisdiction of the Historic District Landmarks Commission or the Vieux Carré Commission, a surcharge of 50% is assessed on building permit, plan review, demolition permit and sign permit fees. This rule charges the share both City sources agree on — the permit fee; the schedule's wider scope (plan review, demolition, sign) is recorded.",
    feeType: "percent",
    componentType: "surcharge",
    priority: 300,
    config: {
      basis: "permit_fee",
      rateBps: 5_000,
    },
    conditions: {
      all: [{ field: "custom.historic_district", op: "eq", value: true }],
    },
  }),

  // Demolition: $95 base + $5 per $1,000 of demolition cost
  rule(NOLA_BUILDING_SOURCE_KEY, {
    id: "nola-bld-demo",
    code: "NOLA-BLD-DEMO",
    label: "Demolition permit fee ($95 + $5 per $1,000 of demolition cost)",
    description:
      "Building Permit Fee Schedule: fees for demolition permits are $95 base fee + $5 per $1,000 of demolition cost. Properties in the Neighborhood Conservation District also pay a $250 (residential) or $500 (commercial) application fee.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 9_500,
      centsPerThousand: 500,
    },
    conditions: {
      all: [{ field: "work_type", op: "eq", value: "demolition" }],
    },
  }),
];

export const NOLA_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // $40 application fee
  rule(NOLA_ELECTRICAL_SOURCE_KEY, {
    id: "nola-elec-application",
    code: "NOLA-ELEC-APPLICATION",
    label: "Electrical permit application fee ($40.00)",
    description:
      "Electrical Permit page: $40 application fee plus per-circuit and per-ampere charges.",
    feeType: "flat",
    config: { amountCents: 4_000 },
  }),
  // $3 per new circuit
  rule(NOLA_ELECTRICAL_SOURCE_KEY, {
    id: "nola-elec-circuits",
    code: "NOLA-ELEC-CIRCUITS",
    label: "New circuits ($3.00 each)",
    description:
      "Electrical Permit page: $3 per new circuit. Fees are based on Service Amperage, New Service Connections, and Number of Circuits.",
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 300 },
  }),
  // $0.30 per service amperage
  rule(NOLA_ELECTRICAL_SOURCE_KEY, {
    id: "nola-elec-amperage",
    code: "NOLA-ELEC-AMPERAGE",
    label: "Service amperage ($0.30 per ampere)",
    description:
      "Electrical Permit page: $0.30 per service amperage — a rate per ampere of the total service, charged on the size of the service the permit covers.",
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 30, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
  }),
  // $40 per construction loop
  rule(NOLA_ELECTRICAL_SOURCE_KEY, {
    id: "nola-elec-loops",
    code: "NOLA-ELEC-LOOPS",
    label: "Construction loops ($40.00 each)",
    description: "Electrical Permit page: $40 per construction loop.",
    feeType: "per_unit",
    config: { unit: "openings", centsPerUnit: 4_000 },
    conditions: { all: [{ field: "custom.construction_loops", op: "gte", value: 1 }] },
  }),
];

export const NOLA_PLUMBING_RULES: FeeRuleRecord[] = [
  // SWB filing fee, from the City's One Stop permit records
  rule(NOLA_PLUMBING_SOURCE_KEY, {
    id: "nola-plumb-swb-filing",
    code: "NOLA-PLUMB-SWB-FILING",
    label: "SWB plumbing filing fee ($50.00)",
    description:
      "Sewerage & Water Board of New Orleans, via the City's One Stop permit records (line item 'SWB Filing Fee'): $50.00, filed by a Licensed Master Plumber registered with the Board. The Board's Plumbing Department permits and inspects the work under the S&WB Plumbing Code; the Board publishes no complete public schedule of its inspection fees, so no further amount is modelled or guessed.",
    feeType: "flat",
    config: { amountCents: 5_000 },
  }),
];
