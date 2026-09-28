import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Richmond, Virginia fee rules — REAL DATA.
 *
 * Source: City of Richmond Fee Schedule, Department of Planning & Development
 *         Review, Bureau of Permits and Inspections, effective 07/01/2024
 *         (revision 07-01-2024).
 *
 * The schedule prices a building, electrical, plumbing and other named permits
 * through one pair of formulas on the value of work (the higher of the
 * contractor estimate or RS Means):
 *
 * - Residential (1 & 2 family): $63.00 for the first $2,000, then $6.07 per
 *   $1,000 or fraction thereof above $2,000.
 * - Commercial (all others): $131.00 for the first $2,000, then $8.50 per
 *   $1,000 or fraction thereof above $2,000.
 * - Every permit: a 2.0% state surcharge "added to the final calculated fee."
 *
 * Verified: 2026-09-26.
 */

export const RVA_FEE_EFFECTIVE_FROM = "2024-07-01";

export const RVA_FEE_SCHEDULE_KEY = "richmond-fee-schedule";
export const RVA_DEPARTMENT_PAGE_KEY = "richmond-permits-inspections-page";

export const RVA_STATE_SURCHARGE_BPS = 200; // 2.0%

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
    effectiveFrom: RVA_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * One valuation ladder row: base for the first $2,000, then the published rate
 * per $1,000 or fraction thereof above it.
 */
function valuationLadder(
  sourceId: string,
  id: string,
  code: string,
  label: string,
  description: string,
  baseCents: number,
  centsPerThousand: number,
  occupancy: FeeCondition,
): FeeRuleRecord {
  return rule(sourceId, {
    id,
    code,
    label,
    description,
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents,
      thresholdCents: 200_000,
      // "or fraction thereof" — the value of work rounds up to the whole $1,000.
      incrementCents: 100_000,
      centsPerThousand,
    },
    conditions: { all: [occupancy] },
    priority: 100,
  });
}

/** The 2% state surcharge the schedule adds to every permit's final calculated fee. */
function stateSurcharge(sourceId: string, id: string): FeeRuleRecord {
  return rule(sourceId, {
    id,
    code: "VA-STATE-SURCHARGE",
    label: "Virginia 2% state surcharge on the final calculated fee",
    description:
      "Fee schedule NOTE: 'For all permits, a 2.0% state surcharge is added to the final calculated fee.'",
    feeType: "percent",
    componentType: "state_surcharge",
    config: {
      basis: "fee_subtotal",
      rateBps: RVA_STATE_SURCHARGE_BPS,
    },
    priority: 800,
  });
}

export const RVA_BUILDING_RULES: FeeRuleRecord[] = [
  valuationLadder(
    RVA_FEE_SCHEDULE_KEY,
    "rva-bld-res",
    "BLD-RES",
    "Residential building permit ($63.00 + $6.07 per $1,000, or fraction)",
    "Fee schedule: 1 & 2 family dwellings pay $63.00 for the first $2,000 of value of work, plus $6.07 per $1,000 or fraction thereof above $2,000.",
    6_300,
    607,
    RESIDENTIAL,
  ),
  valuationLadder(
    RVA_FEE_SCHEDULE_KEY,
    "rva-bld-comm",
    "BLD-COMM",
    "Commercial building permit ($131.00 + $8.50 per $1,000, or fraction)",
    "Fee schedule: all other structures pay $131.00 for the first $2,000 of value of work, plus $8.50 per $1,000 or fraction thereof above $2,000.",
    13_100,
    850,
    COMMERCIAL,
  ),
  stateSurcharge(RVA_FEE_SCHEDULE_KEY, "rva-bld-surcharge"),
];

export const RVA_ELECTRICAL_RULES: FeeRuleRecord[] = [
  valuationLadder(
    RVA_FEE_SCHEDULE_KEY,
    "rva-elec-res",
    "ELEC-RES",
    "Residential electrical permit ($63.00 + $6.07 per $1,000, or fraction)",
    "The schedule's opening paragraph lists electrical permits among those 'calculated as follows' by the same residential formula on the value of work.",
    6_300,
    607,
    RESIDENTIAL,
  ),
  valuationLadder(
    RVA_FEE_SCHEDULE_KEY,
    "rva-elec-comm",
    "ELEC-COMM",
    "Commercial electrical permit ($131.00 + $8.50 per $1,000, or fraction)",
    "The schedule's opening paragraph lists electrical permits among those 'calculated as follows' by the same commercial formula on the value of work.",
    13_100,
    850,
    COMMERCIAL,
  ),
  stateSurcharge(RVA_FEE_SCHEDULE_KEY, "rva-elec-surcharge"),
];

export const RVA_PLUMBING_RULES: FeeRuleRecord[] = [
  valuationLadder(
    RVA_FEE_SCHEDULE_KEY,
    "rva-plumb-res",
    "PLUMB-RES",
    "Residential plumbing permit ($63.00 + $6.07 per $1,000, or fraction)",
    "The schedule's opening paragraph lists plumbing permits among those 'calculated as follows' by the same residential formula on the value of work.",
    6_300,
    607,
    RESIDENTIAL,
  ),
  valuationLadder(
    RVA_FEE_SCHEDULE_KEY,
    "rva-plumb-comm",
    "PLUMB-COMM",
    "Commercial plumbing permit ($131.00 + $8.50 per $1,000, or fraction)",
    "The schedule's opening paragraph lists plumbing permits among those 'calculated as follows' by the same commercial formula on the value of work.",
    13_100,
    850,
    COMMERCIAL,
  ),
  stateSurcharge(RVA_FEE_SCHEDULE_KEY, "rva-plumb-surcharge"),
];
