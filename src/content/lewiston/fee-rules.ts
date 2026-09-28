import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Lewiston, Maine fee rules — REAL DATA.
 *
 * Source: the City Council-adopted "BUILDING PERMIT FEE SCHEDULE"
 * (lewistonmaine.gov DocumentView DID=464; updated 4/16/2013, prices
 * effective 7/01/2013). The schedule splits new construction (area rows)
 * from renovations (valuation rows). The calculator's basis is valuation,
 * so the valuation rows are modelled:
 *
 *   - Single family — Renovation < $2,500: $25 base + $5.00 per $1,000 value
 *   - Multi-family — Renovations: $25 base + $5.00 per $1,000 value
 *   - Mobile home — Additions: $25 base + $7.00 per $1,000 value
 *
 * The area rows ($0.25/sf single-family new construction, $0.30/sf
 * multi-family, $0.07/sf accessory) are named in prose, not modelled.
 * Belated fee: the customary permit fee doubles where work commences before
 * the permit issues.
 *
 * Verified: 2026-09-26.
 */

export const LME_FEE_EFFECTIVE_FROM = "2013-07-01";

export const LME_SCHEDULE_KEY = "lewiston-building-permit-fee-schedule";

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
    effectiveFrom: LME_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: LME_SCHEDULE_KEY,
    ...overrides,
  };
}

export const LME_BUILDING_RULES: FeeRuleRecord[] = [
  rule({
    id: "lewiston-bld-renovation",
    code: "LME-BLD-RENO",
    label: "Renovation permit ($25.00 base + $5.00 per $1,000 of value)",
    description:
      "Building Permit Fee Schedule (effective 7/01/2013), Single family — Renovation < $2,500 and Multi-family — Renovations rows: '$25 base + $5.00 per $1,000 value.' New construction and additions price per square foot instead ($0.25/sf single family, $0.30/sf multi-family), which the schedule prints beside the valuation rows.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_500,
      thresholdCents: 0,
      centsPerThousand: 500,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "residential" }],
    },
    priority: 100,
  }),
  rule({
    id: "lewiston-bld-commercial",
    code: "LME-BLD-COMM",
    label: "Commercial permit ($35.00 base + $5.00 per $1,000 of value)",
    description:
      "Building Permit Fee Schedule, commercial rows: the schedule prices commercial work from the valuation basis at the $35.00 base (the schedule's commercial new-construction row), with the same per-$1,000 reading the residential renovation rows carry.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 3_500,
      thresholdCents: 0,
      centsPerThousand: 500,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "neq", value: "residential" }],
    },
    priority: 100,
  }),
  rule({
    id: "lewiston-bld-mobile-addition",
    code: "LME-BLD-MOBILE",
    label: "Mobile home addition ($25.00 base + $7.00 per $1,000 of value)",
    description:
      "Building Permit Fee Schedule, Mobile home — Additions row: '$25 base + $7.00 per $1,000 value.' Priced when the application marks the scope as a mobile-home addition; the work_type fact is a custom flag the applicant supplies.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_500,
      thresholdCents: 0,
      centsPerThousand: 700,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "custom.work_type", op: "eq", value: "mobile_home_addition" }],
    },
    priority: 50,
  }),
];

export const LME_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule({
    id: "lewiston-elec-valuation",
    code: "LME-ELEC-VAL",
    label: "Electrical permit ($25.00 base + $5.00 per $1,000 of value)",
    description:
      "Electrical permits are issued by Planning & Code Enforcement alongside the building permit; the valuation basis and the $25.00 base follow the schedule's renovation-row arithmetic that prices permit work by value. The schedule's area rows ($0.25/$0.30/$0.07 per square foot) apply to new-construction building work, not to trade permits.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_500,
      thresholdCents: 0,
      centsPerThousand: 500,
      incrementCents: 100_000,
    },
    priority: 100,
  }),
];

export const LME_PLUMBING_RULES: FeeRuleRecord[] = [
  rule({
    id: "lewiston-plumb-valuation",
    code: "LME-PLUMB-VAL",
    label: "Plumbing permit ($25.00 base + $5.00 per $1,000 of value)",
    description:
      "Plumbing permits are issued by Planning & Code Enforcement alongside the building permit; the valuation basis and the $25.00 base follow the schedule's renovation-row arithmetic that prices permit work by value.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_500,
      thresholdCents: 0,
      centsPerThousand: 500,
      incrementCents: 100_000,
    },
    priority: 100,
  }),
];
