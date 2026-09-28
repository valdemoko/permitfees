import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * New Haven, Connecticut fee rules — REAL DATA.
 *
 * Source: City of New Haven Building Department "Building Department
 * Applications" page, which prices "Building, Sign, Electrical, Plumbing,
 * HVAC Permit Fees" from two printed fee-schedule PDFs (read through a real
 * browser session; the live host 403s scripts, PDFs downloaded through it):
 *
 *   - 1&2 Family (Residential) Fee Schedule: a linear table, $50.26 at
 *     $1,000 rising exactly $27.26 per additional $1,000 to $4,384.60 at
 *     $160,000.
 *   - 3+ Family, Commercial, Mixed-Use Fee Schedule: $55.26 at $1,000 rising
 *     exactly $35.26 per additional $1,000 to $5,309.00 at $150,000.
 *
 * The .26 endings carry Connecticut's state code-education surcharge
 * ($0.26 per $1,000); the printed totals already include it, so the seed
 * prices the printed rows and adds no separate surcharge component.
 *
 * Trade permits (electrical, plumbing, HVAC) are named on the same fee
 * schedule line, so they price from the same cost tables; the City's
 * "Minimum Acceptable Cost" sheets (electrical rev. current, plumbing &
 * heating rev. 09/06/2024) fix the cost *estimate* the tables read.
 *
 * Verified: 2026-09-26.
 */

export const NHV_FEE_EFFECTIVE_FROM = "2020-09-29";

export const NHV_FEE_SCHEDULE_KEY = "new-haven-building-dept-fee-schedule";

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
    effectiveFrom: NHV_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: NHV_FEE_SCHEDULE_KEY,
    ...overrides,
  };
}

export const NHV_BUILDING_RULES: FeeRuleRecord[] = [
  rule({
    id: "nhv-bld-res",
    code: "NHV-BLD-RES",
    label: "Residential permit ($50.26 for the first $1,000 + $27.26 per additional $1,000)",
    description:
      "1&2 Family (Residential) Fee Schedule: $50.26 at $1,000 of construction cost rising exactly $27.26 per additional $1,000 (checked: $10,000 -> $295.60, $50,000 -> $1,386.00, $160,000 -> $4,384.60). The .26 endings carry the state code-education surcharge. Partial thousands read up to the table's next completed thousand.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_026,
      thresholdCents: 100_000,
      centsPerThousand: 2_726,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "residential" }],
    },
    priority: 100,
  }),

  rule({
    id: "nhv-bld-comm",
    code: "NHV-BLD-COMM",
    label: "Commercial permit ($55.26 for the first $1,000 + $35.26 per additional $1,000)",
    description:
      "3+ Family, Commercial, Mixed-Use Fee Schedule: $55.26 at $1,000 of construction cost rising exactly $35.26 per additional $1,000 (checked: $10,000 -> $372.60, $50,000 -> $1,783.00, $150,000 -> $5,309.00). Partial thousands read up to the table's next completed thousand.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_526,
      thresholdCents: 100_000,
      centsPerThousand: 3_526,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "neq", value: "residential" }],
    },
    priority: 100,
  }),
];

export const NHV_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule({
    id: "nhv-elec-res",
    code: "NHV-ELEC-RES",
    label: "Electrical permit, residential ($50.26 + $27.26 per additional $1,000)",
    description:
      "The Building Department Applications page prices Building, Sign, Electrical, Plumbing and HVAC permit fees from the same two fee schedules; electrical permits on 1&2-family work read the residential table. The City's Electrical Minimum Acceptable Costs sheet fixes the cost estimate the table reads (100 A service $1,900; 200 A $3,000; single-family 200 A $12,000; solar $4/watt).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_026,
      thresholdCents: 100_000,
      centsPerThousand: 2_726,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "residential" }],
    },
    priority: 100,
  }),
  rule({
    id: "nhv-elec-comm",
    code: "NHV-ELEC-COMM",
    label: "Electrical permit, commercial ($55.26 + $35.26 per additional $1,000)",
    description:
      "Electrical permits on 3+ family, commercial and mixed-use work read the commercial table of the same fee-schedule pair.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_526,
      thresholdCents: 100_000,
      centsPerThousand: 3_526,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "neq", value: "residential" }],
    },
    priority: 100,
  }),
];

export const NHV_PLUMBING_RULES: FeeRuleRecord[] = [
  rule({
    id: "nhv-plumb-res",
    code: "NHV-PLUMB-RES",
    label: "Plumbing permit, residential ($50.26 + $27.26 per additional $1,000)",
    description:
      "Plumbing permits are named on the same fee-schedule line as building permits; on 1&2-family work they read the residential table. The City's Plumbing & Heating Minimum Acceptable Costs sheet (revision date 09/06/2024) fixes the estimate floors: full bath $5,000, water heater $1,100, per fixture $800, new house $9,500.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_026,
      thresholdCents: 100_000,
      centsPerThousand: 2_726,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "residential" }],
    },
    priority: 100,
  }),
  rule({
    id: "nhv-plumb-comm",
    code: "NHV-PLUMB-COMM",
    label: "Plumbing permit, commercial ($55.26 + $35.26 per additional $1,000)",
    description:
      "Plumbing permits on 3+ family, commercial and mixed-use work read the commercial table of the same fee-schedule pair.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_526,
      thresholdCents: 100_000,
      centsPerThousand: 3_526,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "neq", value: "residential" }],
    },
    priority: 100,
  }),
];
