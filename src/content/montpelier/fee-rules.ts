import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Montpelier, Vermont fee rules — REAL DATA.
 *
 * Source: "Zoning and Building Fee Schedule", set by City Council and linked
 * from the City's Apply-for-a-Permit page (DocumentCenter/View/12541, read
 * 2026-09-26 as an Excel workbook, HTTP 200, transcribed in full):
 *
 *   BUILDING PERMIT FEES
 *   - Single Family, single unit: $3.50 per $1000 (round up), $30 min.
 *   - Commercial or Multi-Family: $8.00 per $1000 (round up), $50 min.
 *
 *   RECORDING
 *   - Permit Recording Fee — per permit (building, river, zoning): $30
 *
 * Verified: 2026-09-26.
 */

export const MPB_FEE_EFFECTIVE_FROM = "2024-01-01";

export const MPB_FEE_SCHEDULE_KEY = "montpelier-building-fee-schedule";

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
    effectiveFrom: MPB_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: MPB_FEE_SCHEDULE_KEY,
    ...overrides,
  };
}

/** The schedule's two building rows, parameterised by occupancy. */
function buildingRow(
  id: string,
  code: string,
  label: string,
  description: string,
  occupancy: "residential" | "nonresidential",
  centsPerThousand: number,
  minimumCents: number,
): FeeRuleRecord {
  return rule({
    id,
    code,
    label,
    description,
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      centsPerThousand,
      incrementCents: 100_000,
    },
    minimumCents,
    conditions: {
      all: [
        occupancy === "residential"
          ? { field: "occupancy", op: "eq", value: "residential" }
          : { field: "occupancy", op: "neq", value: "residential" },
      ],
    },
    priority: 100,
  });
}

export const MPB_BUILDING_RULES: FeeRuleRecord[] = [
  buildingRow(
    "mpb-bld-res",
    "MPB-BLD-RES",
    "Building permit, single family ($3.50 per $1,000, $30 minimum)",
    "Zoning and Building Fee Schedule, BUILDING PERMIT FEES: 'Single Family, single unit — $3.50 per $1000 (round up) ($30 min.)'. Each partial $1,000 rounds up.",
    "residential",
    350,
    30_00,
  ),
  buildingRow(
    "mpb-bld-comm",
    "MPB-BLD-COMM",
    "Building permit, commercial or multi-family ($8.00 per $1,000, $50 minimum)",
    "Zoning and Building Fee Schedule, BUILDING PERMIT FEES: 'Commercial or Multi-Family — $8.00 per $1000 (round up) ($50 min.)'. Each partial $1,000 rounds up.",
    "nonresidential",
    800,
    50_00,
  ),
];

export const MPB_RECORDING_RULE: FeeRuleRecord = rule({
  id: "mpb-recording",
  code: "MPB-RECORDING",
  label: "Permit recording fee ($30.00)",
  description:
    "Zoning and Building Fee Schedule, RECORDING block: 'Permit Recording Fee — per permit: building, river, zoning — $30.' Charged on every permit the schedule covers.",
  componentType: "surcharge",
  feeType: "flat",
  config: { amountCents: 30_00 },
  priority: 300,
});
