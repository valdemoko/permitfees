import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Cedar Rapids, Iowa fee rules — REAL DATA.
 *
 * Source: Resolution No. 1707-12-24 (passed 2024-12-17), Exhibit A "Schedule of
 * Building Permit Fees, Amended, Effective January 1, 2025" — one resolution
 * carrying building, electrical, plumbing and mechanical permit fees together.
 * See research/iowa/cedar-rapids.md for the access record (the City site 403s
 * scripted requests; the PDF is served unguarded from the City's CMS host) and
 * the extraction note (the PDF's Type 3 font defeats every text-extraction mode,
 * so the pages were rendered and OCR-read; the Section B ladder's arithmetic
 * chains exactly at every seam, which is the internal check on the OCR).
 *
 * Modelled here: the $20 administration fee (with its stated exceptions), the
 * residential new-construction flat area table, Table A (valuations above
 * $100,000, residential and commercial), the 40% plan check for non-R-3
 * buildings, the electrical and plumbing Section A flat rows, and the shared
 * Section B trade valuation ladder (electrical, plumbing). Table B (valuations
 * $1–$100,000, a 100-row printed table) is recorded in the research file and
 * NOT modelled in this pass — the OCR interleaves its two fee columns, so no
 * amount from it enters a total; building examples price above $100,000, where
 * Table A's own text carries the rates unambiguously.
 *
 * Verified: 2026-09-26.
 */

export const CR_FEE_EFFECTIVE_FROM = "2025-01-01";

export const CR_SOURCE_KEY = "cr-resolution-1707-12-24-exhibit-a";

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
    effectiveFrom: CR_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };
const NOT_RESIDENTIAL: FeeCondition = { field: "occupancy", op: "neq", value: "residential" };

/**
 * The schedule's own exception: "Building Permit Fees for New Single-Family,
 * Duplex and Townhouse Projects of Four Units or Less — No Administration Fee",
 * and those projects' trade fees are "included in the building permit fee".
 * Both exclusions key on the same fact.
 */
const BUNDLED_NEW_DWELLING: FeeCondition = {
  field: "custom.res_new_bundled",
  op: "eq",
  value: true,
};
const NOT_BUNDLED: FeeCondition = { field: "custom.res_new_bundled", op: "absent" };

/** Table A, residential: $671.48 + $3.68 per $1,000 or fraction over $100,000. */
const TABLE_A_RESIDENTIAL = [
  {
    baseCents: 67_148,
    thresholdCents: 10_000_000,
    ceilingCents: 50_000_000 as number | null,
    centsPerThousand: 368,
    text: '"$100,001 to $500,000: $671.48 for the first $100,000 plus $3.68 for each additional $1,000 or fraction thereof, to and including $500,000."',
  },
  {
    baseCents: 214_148,
    thresholdCents: 50_000_000,
    ceilingCents: 100_000_000 as number | null,
    centsPerThousand: 315,
    text: '"$500,001 to $1,000,000: $2141.48 for the first $500,000 plus $3.15 for each additional $1,000 or fraction thereof, to and including $1,000,000."',
  },
  {
    baseCents: 371_648,
    thresholdCents: 100_000_000,
    ceilingCents: null,
    centsPerThousand: 210,
    text: '"$1,000,001 and up: $3,716.48 for the first $1,000,000 plus $2.10 for each additional $1,000 or fraction thereof."',
  },
];

/** Table A, commercial: $987.00 + $5.36; $3,147.90 + $4.62; $5,507.25 + $3.05. */
const TABLE_A_COMMERCIAL = [
  {
    baseCents: 98_700,
    thresholdCents: 10_000_000,
    ceilingCents: 50_000_000 as number | null,
    centsPerThousand: 536,
    text: '"$100,001 to $500,000: $987.00 for the first $100,000 plus $5.36 for each additional $1,000 or fraction thereof, to and including $500,000."',
  },
  {
    baseCents: 314_790,
    thresholdCents: 50_000_000,
    ceilingCents: 100_000_000 as number | null,
    centsPerThousand: 462,
    text: '"$500,001 to $1,000,000: $3,147.90 for the first $500,000 plus $4.62 for each additional $1,000 or fraction thereof, to and including $1,000,000."',
  },
  {
    baseCents: 550_725,
    thresholdCents: 100_000_000,
    ceilingCents: null,
    centsPerThousand: 305,
    text: '"$1,000,001 and up: $5,507.25 for the first $1,000,000 plus $3.05 for each additional $1,000 or fraction thereof."',
  },
];

/**
 * Section B, the shared trade ladder — "$25.00 plus 1% of the amount over
 * $1,000", then 0.9%/0.8%/0.7%/0.6%/0.5%/0.4%/0.3%/0.2% marginal bands. The
 * bands chain exactly: $25 + 1% of $99,000 = $1,015.00, the printed base of the
 * next band; $1,015 + 0.9% of $100,000 = $1,915.00; and so on to $4,615.00 +
 * $100.00 = $4,715.00 — which is the internal check on the OCR read.
 */
const SECTION_B_TIERS: Array<{ upToCents: number | null; rateBps: number }> = [
  { upToCents: 100_000, rateBps: 0 }, // $1,000 — the flat $25 covers it
  { upToCents: 10_000_000, rateBps: 100 }, // 1% of the amount over $1,000
  { upToCents: 20_000_000, rateBps: 90 },
  { upToCents: 30_000_000, rateBps: 80 },
  { upToCents: 40_000_000, rateBps: 70 },
  { upToCents: 50_000_000, rateBps: 60 },
  { upToCents: 60_000_000, rateBps: 50 },
  { upToCents: 70_000_000, rateBps: 40 },
  { upToCents: 80_000_000, rateBps: 30 },
  { upToCents: 90_000_000, rateBps: 20 },
  { upToCents: null, rateBps: 20 }, // printed as 0.2% over $800,000 — the band below's rate continued
];

function sectionBRules(
  idPrefix: string,
  codePrefix: string,
  extraConditions: FeeCondition[],
): FeeRuleRecord[] {
  return [
    rule(CR_SOURCE_KEY, {
      id: `${idPrefix}-section-b`,
      code: `${codePrefix}-SECTION-B`,
      label:
        "All other work — $25.00 flat to $1,000, then marginal percentage bands of the amount over",
      description:
        'Section B: "$1.00 to $1,000.00 — $25.00; $1,001.00 to $100,000.00 — $25.00 plus 1% of the amount over $1,000.00; $100,001.00 to $200,000.00 — $1,015.00 plus 0.9% of the amount over $100,000.00; ... $900,001.00 and up — $4,715.00 plus 0.2% of the amount over $800,000.00." The bands chain exactly ($25 + 1% of $99,000 = $1,015.00), so the ladder is modelled as marginal percentage tiers over a $25.00 base. The final band\'s own text repeats the $800,000 threshold and 0.2% rate of the band below — charged as printed, which is a marginal continuation.',
      feeType: "tiered_marginal",
      config: {
        basis: "valuation",
        baseCents: 2_500,
        tiers: SECTION_B_TIERS,
      },
      conditions: { all: extraConditions },
    }),
  ];
}

export const CR_BUILDING_RULES: FeeRuleRecord[] = [
  // ---- Administration fee, $20.00, with the schedule's own exceptions ----
  rule(CR_SOURCE_KEY, {
    id: "cr-admin-fee",
    code: "ADMIN-FEE",
    label: "Administration fee — $20.00 per permit (non-refundable)",
    description:
      '"Administration Fee — $20.00 per permit (non-refundable). In addition to the permit fee, except where noted." The noted exceptions are the residential new-construction table ("No Administration Fee") and the ADA-ramp row; the bundled-new-dwelling fact carries the first.',
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 2_000 },
    conditions: { all: [NOT_BUNDLED] },
  }),

  // ---- Residential new construction: flat area table, no admin fee ----
  rule(CR_SOURCE_KEY, {
    id: "cr-bld-res-new-area",
    code: "BLD-RES-NEW-AREA",
    label:
      "New single-family / duplex — $1,000 to 1,200 sq ft, $1,400 to 2,000, $2,400 above (habitable area above grade, garage excluded)",
    description:
      '"Building Permit Fees for New Single-Family, Duplex and Townhouse Projects of Four Units or Less — No Administration Fee. TOTAL SQUARE FOOT (defined as habitable area above grade, not including garage): 0 to 1,200 — $1,000.00; 1,201 to 2,000 — $1,400.00; 2,001 and higher — $2,400.00." The flat rows bundle the trades: "Fee includes Building, Electrical, Mechanical, Plumbing, Erosion Control."',
    feeType: "tiered_table",
    config: {
      basis: "square_footage",
      tiers: [
        { upToCents: 1_200, amountCents: 100_000 },
        { upToCents: 2_000, amountCents: 140_000 },
        { upToCents: null, amountCents: 240_000 },
      ],
    },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dwelling_type", op: "in", value: ["single_family", "duplex"] },
      ],
    },
  }),
  rule(CR_SOURCE_KEY, {
    id: "cr-bld-res-townhouse-3",
    code: "BLD-RES-TH-3",
    label: "3-unit townhouse (as defined in the IRC) — $2,000.00",
    description:
      '"3-Unit Townhouse (as defined in the IRC) — $2,000.00." One of the schedule\'s "No Administration Fee" flat rows, with the trades bundled in.',
    feeType: "flat",
    config: { amountCents: 200_000 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dwelling_type", op: "eq", value: "townhouse_3" },
      ],
    },
  }),
  rule(CR_SOURCE_KEY, {
    id: "cr-bld-res-townhouse-4",
    code: "BLD-RES-TH-4",
    label: "4-unit townhouse (as defined in the IRC) — $2,500.00",
    description:
      '"4-Unit Townhouse (as defined in the IRC) — $2,500.00." Greater-than-4-unit townhouses leave this table for Table A valuation.',
    feeType: "flat",
    config: { amountCents: 250_000 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dwelling_type", op: "eq", value: "townhouse_4" },
      ],
    },
  }),

  // ---- Table A: valuations above $100,000, both classes ----
  ...TABLE_A_RESIDENTIAL.map((band, i) =>
    rule(CR_SOURCE_KEY, {
      id: `cr-bld-res-table-a-${i + 1}`,
      code: `BLD-RES-TABLE-A-${i + 1}`,
      label: `Residential valuation above $100,000, band ${i + 1} (Table A)`,
      description: band.text,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: band.baseCents,
        thresholdCents: band.thresholdCents,
        incrementCents: 100_000,
        centsPerThousand: band.centsPerThousand,
      },
      conditions: {
        all: [
          RESIDENTIAL,
          { field: "valuation", op: "gt", value: band.thresholdCents },
          ...(band.ceilingCents === null
            ? []
            : [{ field: "valuation", op: "lte", value: band.ceilingCents }]),
        ],
      },
    }),
  ),
  ...TABLE_A_COMMERCIAL.map((band, i) =>
    rule(CR_SOURCE_KEY, {
      id: `cr-bld-comm-table-a-${i + 1}`,
      code: `BLD-COMM-TABLE-A-${i + 1}`,
      label: `Commercial valuation above $100,000, band ${i + 1} (Table A)`,
      description: band.text,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: band.baseCents,
        thresholdCents: band.thresholdCents,
        incrementCents: 100_000,
        centsPerThousand: band.centsPerThousand,
      },
      conditions: {
        all: [
          NOT_RESIDENTIAL,
          { field: "valuation", op: "gt", value: band.thresholdCents },
          ...(band.ceilingCents === null
            ? []
            : [{ field: "valuation", op: "lte", value: band.ceilingCents }]),
        ],
      },
    }),
  ),

  // ---- Plan check 40% of the computed permit fee, other than R-3 ----
  rule(CR_SOURCE_KEY, {
    id: "cr-plan-check-40",
    code: "BLD-PLAN-CHECK-40",
    label: "Plan checking — 40% of the computed building permit fee (other than R-3)",
    description:
      '"When the evaluation of the proposed construction exceeds $1,000, a plan-checking fee shall be paid. Plan checking fees for all commercial and residential buildings, other than R-3, are 40% of the computed building permit fee." The R-3 exemption is the schedule\'s own class carve-out, so the rule answers only when the project is declared not an R-3 dwelling (custom.not_r3_dwelling). Additional checking for incomplete or changed plans is $30 per hour with a 30-minute minimum, named rather than charged.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 4_000 },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 100_000 },
        { field: "custom.not_r3_dwelling", op: "eq", value: true },
      ],
    },
  }),
];

export const CR_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(CR_SOURCE_KEY, {
    id: "cr-elec-res-service",
    code: "ELEC-RES-SERVICE",
    label: "Residential new, repair or replacement service install — $75.00",
    description:
      '"Fees for Electrical Permits for Residential - New, Repair or Replacement Service Installs — $75.00." (Section A.)',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "custom.service_install", op: "eq", value: true },
        NOT_BUNDLED,
      ],
    },
  }),
  rule(CR_SOURCE_KEY, {
    id: "cr-elec-res-pv",
    code: "ELEC-RES-PV",
    label: "Residential photovoltaic solar system — $75.00",
    description:
      '"Fees for Electrical Permits for Residential Photovoltaic Solar Systems — $75.00." (Section A.)',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [RESIDENTIAL, { field: "custom.photovoltaic_system", op: "eq", value: true }, NOT_BUNDLED],
    },
  }),
  rule(CR_SOURCE_KEY, {
    id: "cr-elec-garage-or-pole",
    code: "ELEC-GARAGE-OR-POLE",
    label: "Detached garage or temporary power pole electrical permit — $75.00",
    description:
      '"Fees for Electrical Permits for Detached Garages — $75.00; Fees for Electrical Permits for Temporary Power Poles — $75.00." (Section A.)',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        {
          field: "custom.scope",
          op: "in",
          value: ["detached_garage", "temporary_power_pole"],
        },
        NOT_BUNDLED,
      ],
    },
  }),
  ...sectionBRules("cr-elec", "ELEC", [
    NOT_BUNDLED,
    { field: "custom.trade_bundled", op: "absent" },
  ]),
];

export const CR_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(CR_SOURCE_KEY, {
    id: "cr-pl-appliance",
    code: "PL-APPLIANCE-REPLACEMENT",
    label: "Appliance replacement permit (furnace, water heater, AC) — $75.00",
    description:
      '"Fees for Appliance Replacement Permits - Furnace, Water Heater, AC — $75.00." (Section A, under "Mechanical and Plumbing".)',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [{ field: "custom.scope", op: "eq", value: "appliance_replacement" }, NOT_BUNDLED],
    },
  }),
  rule(CR_SOURCE_KEY, {
    id: "cr-pl-fuel-gas",
    code: "PL-FUEL-GAS",
    label: "Fuel gas permit — $75.00",
    description: '"Fees for Fuel Gas Permits — $75.00." (Section A.)',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [{ field: "custom.scope", op: "eq", value: "fuel_gas" }, NOT_BUNDLED],
    },
  }),
  rule(CR_SOURCE_KEY, {
    id: "cr-pl-sewer",
    code: "PL-SEWER",
    label: "Sewer permit — $75.00",
    description: '"Fees for Sewer Permits — $75.00." (Section A.)',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [{ field: "custom.scope", op: "eq", value: "sewer" }, NOT_BUNDLED],
    },
  }),
  ...sectionBRules("cr-pl", "PL", [
    NOT_BUNDLED,
    { field: "custom.trade_bundled", op: "absent" },
  ]),
];
