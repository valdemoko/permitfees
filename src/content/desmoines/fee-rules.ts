import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Des Moines, Iowa fee rules — REAL DATA.
 *
 * Source: City of Des Moines Permit and Development Center (PDC) Permit Fee
 * Schedule, "New Fees 2-1-25" (effective 2025-02-01), plus the Building Division
 * Permit Fee Schedule effective 2025-01-02 (DMMC 14.01.090). The PDC document is
 * the newer consolidated instrument; see research/iowa/des-moines.md §3 for the
 * discrepancy between the two and why the PDC figures are charged.
 *
 * Mechanisms: residential building is priced by FLAT finished-floor-area and
 * scope rows; commercial building by a six-band valuation ladder that rounds the
 * excess up to whole $1,000 ("or fraction thereof"); plan check 65% of the
 * commercial permit fee; energy review 2% with a $21 minimum; residential trade
 * permits flat; commercial trade permits base-plus-unit-fee price lists.
 *
 * Verified: 2026-09-26.
 */

export const DSM_FEE_EFFECTIVE_FROM = "2025-02-01";

export const DSM_PDC_SOURCE_KEY = "dsm-pdc-permit-fee-schedule-2025";
export const DSM_BLDG_SOURCE_KEY = "dsm-building-division-fee-schedule-2025";

/** $64.38, $271.88, $465.00, $786.88, $2,331.25 — printed band bases. */
const COMM_BAND_BASES_CENTS = [6_438, 27_188, 46_500, 78_688, 233_125];
/** Band floors in cents: $2,000 / $25,000 / $50,000 / $100,000 / $500,000. */
const COMM_BAND_FLOORS_CENTS = [200_000, 2_500_000, 5_000_000, 10_000_000, 50_000_000];
/** Band ceilings in cents; the last band is open-ended. */
const COMM_BAND_CEILINGS_CENTS = [2_500_000, 5_000_000, 10_000_000, 50_000_000, null];
/** Rates per $1,000 or fraction thereof. */
const COMM_BAND_RATES = [906, 775, 644, 388, 263];

/** The printed band texts, in band order. */
const BAND_DESCRIPTIONS: string[] = [
  '"More than $2,000 but no more than $25,000: $64.38 for the first $2,000 plus $9.06 for each additional $1,000 or fraction thereof."',
  '"More than $25,000 but no more than $50,000: $271.88 for the first $25,000 plus $7.75 for each additional $1,000 or fraction thereof."',
  '"More than $50,000 but no more than $100,000: $465 for the first $50,000 plus $6.44 for each additional $1,000 or fraction thereof."',
  '"More than $100,000 but no more than $500,000: $786.88 for the first $100,000 plus $3.88 for each additional $1,000 or fraction thereof."',
  '"More than $500,000: $2331.25 for the first $500,000 plus $2.63 for each additional $1,000 or fraction thereof."',
];

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
    effectiveFrom: DSM_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

const DWELLING_WORK: FeeCondition = {
  field: "occupancy",
  op: "eq",
  value: "residential",
};
const NOT_DWELLING: FeeCondition = {
  field: "occupancy",
  op: "neq",
  value: "residential",
};

export const DSM_BUILDING_RULES: FeeRuleRecord[] = [
  // ---- Residential flat rows (PDC schedule, "Building Permit Fees for
  // Townhouses, Single-Family Dwellings, Two-Family Dwellings and Buildings
  // Accessory Thereto" and "Other Building Permits") --------------------
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-bld-res-new-small",
    code: "BLD-RES-NEW-SMALL",
    label: "New single-family dwelling, finished floor area 1,200 sq ft or less — $1,050.00",
    description:
      '"Total finished floor area of 1,200 square feet or less. Basement and garage areas do not contribute to this calculation. Building Permit Fee Amount: $1,050.00."',
    feeType: "flat",
    config: { amountCents: 105_000 },
    conditions: {
      all: [
        DWELLING_WORK,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dwelling_type", op: "eq", value: "single_family" },
        { field: "square_footage", op: "lte", value: 1_200 },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-bld-res-new-mid",
    code: "BLD-RES-NEW-MID",
    label: "New single-family dwelling, 1,201–2,000 sq ft — $1,350.00",
    description:
      '"Total finished floor area of 1,201 to 2,000 square feet ... $1,350.00." Basement and garage excluded from the area.',
    feeType: "flat",
    config: { amountCents: 135_000 },
    conditions: {
      all: [
        DWELLING_WORK,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dwelling_type", op: "eq", value: "single_family" },
        { field: "square_footage", op: "gt", value: 1_200 },
        { field: "square_footage", op: "lte", value: 2_000 },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-bld-res-new-large",
    code: "BLD-RES-NEW-LARGE",
    label: "New single-family dwelling, greater than 2,000 sq ft — $1,750.00",
    description:
      '"Total finished floor area greater than 2,000 square feet ... $1,750.00."',
    feeType: "flat",
    config: { amountCents: 175_000 },
    conditions: {
      all: [
        DWELLING_WORK,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dwelling_type", op: "eq", value: "single_family" },
        { field: "square_footage", op: "gt", value: 2_000 },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-bld-res-addition",
    code: "BLD-RES-ADDITION",
    label: "Additions to dwellings — $250.00",
    description: '"Additions to dwellings: ... $250.00" (Other Building Permits).',
    feeType: "flat",
    config: { amountCents: 25_000 },
    conditions: {
      all: [
        DWELLING_WORK,
        { field: "work_type", op: "eq", value: "addition" },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-bld-res-renovation",
    code: "BLD-RES-RENOVATION",
    label: "Renovations to dwellings — $150.00",
    description: '"Renovations to dwellings: ... $150.00" (Other Building Permits).',
    feeType: "flat",
    config: { amountCents: 15_000 },
    conditions: {
      all: [
        DWELLING_WORK,
        { field: "work_type", op: "in", value: ["remodel", "alteration", "repair"] },
      ],
    },
  }),

  // ---- Commercial valuation ladder (PDC schedule, "Commercial Building
  // Permit Fees"). Every band prints "or fraction thereof" — round up. ----
  ...COMM_BAND_BASES_CENTS.map((baseCents, i) =>
    rule(DSM_PDC_SOURCE_KEY, {
      id: `dsm-bld-comm-band-${i + 1}`,
      code: `BLD-COMM-BAND-${i + 1}`,
      label: `Commercial building permit, valuation band ${i + 1}`,
      description: BAND_DESCRIPTIONS[i]!,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents,
        thresholdCents: COMM_BAND_FLOORS_CENTS[i]!,
        incrementCents: 100_000,
        centsPerThousand: COMM_BAND_RATES[i]!,
      },
      conditions: {
        all: [
          NOT_DWELLING,
          { field: "valuation", op: "gt", value: COMM_BAND_FLOORS_CENTS[i]! },
          ...(COMM_BAND_CEILINGS_CENTS[i] === null
            ? []
            : [{ field: "valuation", op: "lte", value: COMM_BAND_CEILINGS_CENTS[i]! }]),
        ],
      },
    }),
  ),
  // Band 1 answers the sub-$2,000 row as well (fee $64.38 = its own base).
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-bld-comm-under-2k",
    code: "BLD-COMM-UNDER-2K",
    label: "Commercial building permit, valuation under $2,000 — $64.38",
    description: '"Less than $2,000: $64.38."',
    feeType: "flat",
    config: { amountCents: 6_438 },
    conditions: {
      all: [
        NOT_DWELLING,
        { field: "valuation", op: "lte", value: 200_000 },
      ],
    },
  }),

  // ---- Plan check 65% of building permit fee, value > $1,000 ----
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-bld-plan-check",
    code: "BLD-PLAN-CHECK-65",
    label: "Plan checking fee — 65% of building permit fee",
    description:
      '"Plan Checking Fee for buildings with value greater than $1,000.00: 65% of building permit fee." The line sits in the commercial block of the schedule; the residential flat-fee rows carry no plan-check percentage, so the rule answers commercial permits only.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 6_500 },
    conditions: {
      all: [
        NOT_DWELLING,
        { field: "valuation", op: "gt", value: 100_000 },
      ],
    },
  }),

  // ---- Energy review 2% with $21 minimum ----
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-bld-energy-review",
    code: "BLD-ENERGY-REVIEW",
    label: "Energy review fee — 2% of building permit fee, $21.00 minimum",
    description:
      '"Energy Review Fee for buildings containing enclosed space that is heated or cooled: 2% of building permit fee with a $21.00 minimum."',
    feeType: "percent",
    componentType: "other",
    priority: 300,
    minimumCents: 2_100,
    config: { basis: "permit_fee", rateBps: 200 },
    conditions: { field: "custom.energy_reviewed", op: "eq", value: true },
  }),
];

export const DSM_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-elec-res-new",
    code: "ELEC-RES-NEW",
    label: "Electrical permit, new dwellings (incl. temporary power pole) — $225.00",
    description:
      '"Electrical permit for electrical installations associated with the construction of new dwellings (including temporary power pole): $225.00."',
    feeType: "flat",
    config: { amountCents: 22_500 },
    conditions: {
      all: [
        DWELLING_WORK,
        { field: "work_type", op: "eq", value: "new_construction" },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-elec-res-alter",
    code: "ELEC-RES-ALTER",
    label: "Electrical permit, alterations and additions to existing dwellings — $75.00",
    description:
      '"Electrical permit for electrical installations associated with alterations and additions to existing dwellings and accessory structures: $75.00."',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        DWELLING_WORK,
        {
          field: "work_type",
          op: "in",
          value: ["addition", "alteration", "remodel", "repair", "replacement"],
        },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-elec-comm-base",
    code: "ELEC-COMM-BASE",
    label: "Commercial electrical permit base fee — $75.00",
    description:
      '"Electrical permit base fee for other than townhouses, single-family dwellings, two-family dwellings and buildings accessory thereto (Electrical Permit requires base fee plus any unit fees listed below): $75.00."',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: { all: [NOT_DWELLING] },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-elec-comm-circuits",
    code: "ELEC-COMM-CIRCUITS",
    label: "Commercial circuits, ten or fewer — $4.00 each (incl. feeders)",
    description:
      '"Circuits; First ten circuits, including feeders, each — $4.00." A permit with ten or fewer circuits pays $4.00 per circuit; beyond ten the first ten are charged as a $40.00 block by ELEC-COMM-CIRCUITS-BLOCK and the excess at $2.00.',
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 400 },
    conditions: {
      all: [
        NOT_DWELLING,
        { field: "custom.circuits", op: "gt", value: 0 },
        { field: "custom.circuits", op: "lte", value: 10 },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-elec-comm-circuits-block",
    code: "ELEC-COMM-CIRCUITS-BLOCK",
    label: "Commercial circuits — the first ten as a $40.00 block",
    description:
      '"Circuits; First ten circuits, including feeders, each — $4.00." With more than ten circuits the first ten are still $4.00 each — a $40.00 block — and the excess prices on ELEC-COMM-CIRCUITS-2.',
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [NOT_DWELLING, { field: "custom.circuits", op: "gt", value: 10 }],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-elec-comm-circuits-2",
    code: "ELEC-COMM-CIRCUITS-2",
    label: "Commercial circuits 11–100 — $2.00 each",
    description:
      '"Circuits; Eleventh through 100 circuits, each — $2.00." Each circuit beyond the first ten pays $2.00.',
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 200, thresholdUnits: 10 },
    conditions: {
      all: [NOT_DWELLING, { field: "custom.circuits", op: "gt", value: 10 }],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-elec-comm-openings",
    code: "ELEC-COMM-OPENINGS",
    label: "Openings added to existing circuits — $1.20 each",
    description:
      '"Each opening added to existing circuits (includes switches, receptacles and outlets) — $1.20." The openings count is the same fact the per-unit engine keys as openings.',
    feeType: "per_unit",
    config: { unit: "openings", centsPerUnit: 120 },
    conditions: {
      all: [NOT_DWELLING, { field: "custom.openings", op: "gt", value: 0 }],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-elec-comm-appliances",
    code: "ELEC-COMM-APPLIANCES",
    label: "Fixed appliances (includes electrical signs) — $6.50 each",
    description: '"Each fixed appliance (includes electrical signs) — $6.50." The count reads the special-device fact the engine keys, this schedule\'s nearest unit for a named appliance list.',
    feeType: "per_unit",
    config: { unit: "special_devices", centsPerUnit: 650 },
    conditions: {
      all: [NOT_DWELLING, { field: "custom.special_devices", op: "gt", value: 0 }],
    },
  }),
];

export const DSM_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-res-new",
    code: "PL-RES-NEW",
    label: "Plumbing permit, new dwellings — $200.00",
    description:
      '"Plumbing permit for plumbing installations associated with the construction of new dwellings: $200.00."',
    feeType: "flat",
    config: { amountCents: 20_000 },
    conditions: {
      all: [
        DWELLING_WORK,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.services_only", op: "absent" },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-res-services-only",
    code: "PL-RES-SERVICES-ONLY",
    label: "Plumbing permit, sewer and water services only for new dwellings — $75.00",
    description:
      '"Plumbing permit for installation of sewer and water services only for new dwellings: $75.00."',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        DWELLING_WORK,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.services_only", op: "eq", value: true },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-res-alter",
    code: "PL-RES-ALTER",
    label: "Plumbing permit, alterations and additions to existing dwellings — $75.00",
    description:
      '"Plumbing permit for plumbing installations associated with alterations and additions to existing dwellings and accessory structures: $75.00."',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        DWELLING_WORK,
        {
          field: "work_type",
          op: "in",
          value: ["addition", "alteration", "remodel", "repair", "replacement"],
        },
      ],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-comm-base",
    code: "PL-COMM-BASE",
    label: "Commercial plumbing permit base fee — $75.00",
    description:
      '"Plumbing permit base fee for other than townhouses, single-family dwellings, two-family dwellings and buildings accessory thereto (Plumbing permit requires base fee plus any unit fees listed below): $75.00."',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: { all: [NOT_DWELLING] },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-comm-fixtures",
    code: "PL-COMM-FIXTURES",
    label: "Commercial plumbing fixtures — $7.50 each",
    description:
      '"Each plumbing fixture, including but not limited to: sink, tub, urinal, drain, water closet, lavatory, dishwasher, vacuum breaker, condensate drain, ice machine, automatic water heater, ... grease trap, ... indirect waste line — $7.50."',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 750 },
    conditions: {
      all: [NOT_DWELLING, { field: "fixtures", op: "gt", value: 0 }],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-comm-sewer",
    code: "PL-COMM-SEWER",
    label: "Building sewer service installation, change or repair — $7.50 each",
    description:
      '"Each building sewer service installation, change or repair — $7.50."',
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 750 },
    conditions: {
      all: [NOT_DWELLING, { field: "custom.connections", op: "gt", value: 0 }],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-comm-water-service",
    code: "PL-COMM-WATER-SERVICE",
    label: "Water service (domestic) installation, change or repair — $7.50 each",
    description:
      '"Each water service (domestic) installation, change or repair — $7.50."',
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 750 },
    conditions: {
      all: [NOT_DWELLING, { field: "custom.water_service_connections", op: "gt", value: 0 }],
    },
  }),
  /* NOTE: water_service_connections fact key is custom.water_service_connections. */
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-comm-grease",
    code: "PL-COMM-GREASE",
    label: "Grease interceptor — $20.00 each",
    description: '"Each grease interceptor — $20.00."',
    feeType: "per_unit",
    config: { unit: "grease_interceptors", centsPerUnit: 2_000 },
    conditions: {
      all: [NOT_DWELLING, { field: "custom.grease_interceptors", op: "gt", value: 0 }],
    },
  }),
  rule(DSM_PDC_SOURCE_KEY, {
    id: "dsm-pl-comm-private-sewer",
    code: "PL-COMM-PRIVATE-SEWER",
    label: "Private sewers (sanitary and storm) — $10.00 per 100 lineal feet or fraction",
    description:
      '"Private sewers constructed under the plumbing code (sanitary and storm), per 100 lineal feet or fraction thereof — $10.00." The 100-foot run rounds up to a whole block.',
    feeType: "per_unit",
    config: { unit: "linear_feet", centsPerUnit: 10, incrementUnits: 100 },
    conditions: {
      all: [NOT_DWELLING, { field: "custom.linear_feet", op: "gt", value: 0 }],
    },
  }),
];
