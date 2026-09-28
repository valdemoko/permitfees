import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Memphis / Shelby County, Tennessee fee rules — REAL DATA.
 *
 * Sources (research/tennessee/memphis.md records how each was read):
 *
 *  S1  Shelby County Office of Construction Code Enforcement 2022 Building Fee Schedule
 *      (PDF, 9 pages, 357,947 bytes, HTTP 200) — the county's commercial sign/plan-review,
 *      building, elevator, mechanical, electrical, plumbing and gas tables in one instrument.
 *      https://www.shelbycountytn.gov/DocumentCenter/View/39428/2022-BUILDING-FEE-SCHEDULE
 *  S2  Shelby County OCCE 2019 New Fee Schedule (6 pages, 179,040 bytes) — the predecessor,
 *      read to confirm the commercial building bands and plan-review tiers were stable.
 *      https://www.shelbycountytn.gov/DocumentCenter/View/33930/New-Fee-Schedule-2019
 *  S3  Develop 901 Fee Information hub — the Memphis-Shelby joint portal that links the fee
 *      schedules and describes the joint jurisdiction.
 *      https://www.develop901.com/fee-information
 *
 * **The mechanism, in three sentences.** Every Shelby County permit is the trade fee
 * **plus $4.00 data processing and a $1 (residential) or $5 (commercial) surcharge** —
 * the cover sheet says so before any number. A commercial building is a
 * valuation ladder — $5.00 per $1,000 to $25,000; $125 plus $3.50 a thousand to
 * $1,000,000; $3,537.50 plus $2.25 to $25,000,000; $57,537.50 plus $1.75 beyond —
 * with a **plan review tiered table** (nine flat bands from $80 to $3,000) charged
 * beside it. Residential is area, not valuation — $0.07 a square foot for new
 * construction with a $125 floor, $5.00 per $1,000 for alterations clamped $50–$325 —
 * while electrical and plumbing are price lists gated by amperage, circuit count and
 * KVA, and by fixture, sewer and water-service counts.
 *
 * **Three readings this module depends on, all stated on the instrument.**
 *
 *  1. **The $4 + $1/$5 ride every permit.** The cover line is
 *     \"ALL FEES BELOW DO NOT INCLUDE AN ADMINISTRATIVE CHARGE OF $4.00 AND A SURCHARGE
 *     OF $1.00 FOR RESIDENTIAL OR $5.00 FOR COMMERCIAL (ADD $5 TO RESIDENTIAL TOTAL AND
 *     $9 TO COMMERCIAL TOTAL)\". The arithmetic is $4 + $1 = $5 residential, $4 + $5 = $9
 *     commercial, and the two surcharges are carried as `other` components so they are
 *     not part of the base the technology math would otherwise tax.
 *  2. **The commercial building bands are marginal per $1,000, no fraction phrase.**
 *     Each row writes \"$5.00/1,000\", \"$3.50/1,000\" etc. with no \"or fraction thereof\",
 *     so the rate is charged on the exact valuation rather than rounding up to whole
 *     thousands — the opposite of Nashville's ladder one county east, kept distinct.
 *  3. **The plan review is its own tiered table, not a percentage of the permit.**
 *     Nine flat bands ($80 / $160 / $325 / $650 / $875 / $1,200 / $1,600 / $2,000 /
 *     $3,000) keyed by valuation, charged as `plan_review` rather than derived from
 *     the building fee.
 *
 * **What is deliberately NOT here:** the sign-erection rows ($1.25 per sq ft),
 * elevator/escalator/amusement tables, mechanical Section M (valuation at
 * $15/$8/$3 per $1,000), gas Section G, the moving/house-move, demolition
 * ($9 per 25,000 cu ft, $70–$560), roofing, temporary office, curb-cut and
 * fence flat rows — all transcribed in the research record and named on the
 * pages. This module is the single definition of Memphis/Shelby's fee rules
 * for the three published permits: the seed writes exactly these records and
 * the tests assert against exactly these records.
 */

/** The 2022 schedule is the dated instrument this module charges. */
export const MEMPHIS_FEE_EFFECTIVE_FROM = "2022-01-01";

export const MEMPHIS_FEE_SCHEDULE_SOURCE_KEY = "memphis-shelby-fee-schedule-2022";
export const MEMPHIS_FEE_SCHEDULE_2019_SOURCE_KEY = "memphis-shelby-fee-schedule-2019";
export const MEMPHIS_DEVELOP901_SOURCE_KEY = "memphis-develop901-fee-information";

function MEMRule(
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
    effectiveFrom: MEMPHIS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — commercial (valuation ladder + plan review)              */
/* -------------------------------------------------------------------------- */

export const MEMPHIS_BUILDING_COMMERCIAL_RULES: FeeRuleRecord[] = [
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-commercial-1",
    code: "BLD-COMM-1",
    label: "Building permit — commercial new construction, $0 to $25,000: $5.00 per $1,000",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 500 },
    conditions: {
      all: [
        { field: "custom.building_class", op: "eq", value: "commercial" },
        { field: "valuation", op: "lte", value: 2_500_000 },
      ],
    },
    description:
      'The schedule\'s \"$0 - $25,000 $5.00/1,000\" row for NEW CONSTRUCTION/ ADDITIONS/ ACCESSORY BUILDINGS COMMERCIAL. No base, no \"or fraction thereof\" — the rate is charged on the exact valuation, prorated: $10,000 is $50.00, $10,500 is $52.50.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-commercial-2",
    code: "BLD-COMM-2",
    label: "Building permit — commercial, $25,001 to $1,000,000: $125 plus $3.50 per $1,000 above $25,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 12_500,
      thresholdCents: 2_500_000,
      centsPerThousand: 350,
    },
    conditions: {
      all: [
        { field: "custom.building_class", op: "eq", value: "commercial" },
        { field: "valuation", op: "gt", value: 2_500_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
    description:
      'The schedule\'s \"$25,001 - $1,000,000 $125 + $3.50/1,000\" row. The $125 is the published add factor; the $3.50 is charged on the amount above $25,000.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-commercial-3",
    code: "BLD-COMM-3",
    label: "Building permit — commercial, $1,000,001 to $25,000,000: $3,537.50 plus $2.25 per $1,000 above $1,000,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 353_750,
      thresholdCents: 100_000_000,
      centsPerThousand: 225,
    },
    conditions: {
      all: [
        { field: "custom.building_class", op: "eq", value: "commercial" },
        { field: "valuation", op: "gt", value: 100_000_000 },
        { field: "valuation", op: "lte", value: 2_500_000_000 },
      ],
    },
    description:
      'The schedule\'s \"$1,000,001 - $25,000,000 $3537.50 + $2.25/1,000\" row. The printed base $3,537.50 is exactly $125 + 975 × $3.50, so this ladder *chains* — the opposite of Nashville\'s three seams — and the base is derivable rather than printed over it.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-commercial-4",
    code: "BLD-COMM-4",
    label: "Building permit — commercial, $25,000,001 and up: $57,537.50 plus $1.75 per $1,000 above $25,000,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_753_750,
      thresholdCents: 2_500_000_000,
      centsPerThousand: 175,
    },
    conditions: {
      all: [
        { field: "custom.building_class", op: "eq", value: "commercial" },
        { field: "valuation", op: "gt", value: 2_500_000_000 },
      ],
    },
    description:
      'The schedule\'s \"$25,000,001 AND UP $57,537.50 + 1.75/1,000\" top band. $57,537.50 is $3,537.50 + 24,000 × $2.25, so the top base is also chained.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-commercial-minimum",
    code: "BLD-COMM-MINIMUM",
    label: "Building permit — commercial, $75.00 minimum",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 7_500 },
    componentType: "base",
    priority: 200,
    conditions: { field: "custom.building_class", op: "eq", value: "commercial" },
    description:
      'The commercial section\'s own \"MINIMUM FEE $75.00\" row, carried as the shortfall on the permit fee. A $5,000 job at $5.00 per $1,000 computes $25.00 and pays $75.00.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-plan-review",
    code: "BLD-PLAN-REVIEW",
    label: "Plan review — tiered by valuation, $80 to $3,000 (nine bands)",
    feeType: "tiered_table",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 2_500_000, amountCents: 8_000 },
        { upToCents: 5_000_000, amountCents: 16_000 },
        { upToCents: 10_000_000, amountCents: 32_500 },
        { upToCents: 20_000_000, amountCents: 65_000 },
        { upToCents: 50_000_000, amountCents: 87_500 },
        { upToCents: 100_000_000, amountCents: 120_000 },
        { upToCents: 200_000_000, amountCents: 160_000 },
        { upToCents: 500_000_000, amountCents: 200_000 },
        { upToCents: null, amountCents: 300_000 },
      ],
    },
    componentType: "plan_review",
    priority: 300,
    conditions: { field: "custom.building_class", op: "eq", value: "commercial" },
    description:
      'The \"PLAN REVIEW FEE\" table on the building page: $0–$25,000 $80; $25,001–$50,000 $160; $50,001–$100,000 $325; $100,001–$200,000 $650; $200,001–$500,000 $875; $500,001–$1,000,000 $1,200; $1,000,001–$2,000,000 $1,600; $2,000,001–$5,000,000 $2,000; $5,000,001 AND UP $3,000. One flat amount per valuation bracket.',
  }),
];

export const MEMPHIS_BUILDING_RESIDENTIAL_RULES: FeeRuleRecord[] = [
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-res-new",
    code: "BLD-RES-NEW",
    label: "Building permit — one- and two-family dwellings, new construction or addition, $0.07 per square foot ($125 minimum)",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 7, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    minimumCents: 12_500,
    conditions: { field: "custom.building_class", op: "eq", value: "residential" },
    description:
      'The residential section\'s \"NEW CONSTRUCTION OR ADDITION PER SQ. FT. $0.07\" with the \"MINIMUM FEE FOR NEW SFR OR DUP $125.00\" below it. Seven cents a foot, charged exactly on square footage, with the floor as the rule\'s own minimumCents: 1,000 sq ft is $70.00 charged at $125.00, 2,000 sq ft is $140.00.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-res-alteration",
    code: "BLD-RES-ALTERATION",
    label: "Building permit — one- and two-family dwellings, alteration/repair, $5.00 per $1,000 ($50 min, $325 max)",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 500 },
    minimumCents: 5_000,
    maximumCents: 32_500,
    conditions: {
      all: [
        { field: "custom.building_class", op: "eq", value: "residential" },
        { field: "custom.residential_scope", op: "eq", value: "alteration" },
      ],
    },
    description:
      'The schedule\'s \"ALTERATION/REPAIR ($5.00/1,000 VALUATION) $50.00 MIN / $325.00 MAX\" row. $5.00 per $1,000 clamped to at least $50.00 and at most $325.00 — a 10 × $5 = $50 and 65 × $5 = $325 band, carried as the rule\'s own floor and ceiling.',
  }),
];

export const MEMPHIS_BUILDING_FEE_RULES: FeeRuleRecord[] = [
  ...MEMPHIS_BUILDING_COMMERCIAL_RULES,
  ...MEMPHIS_BUILDING_RESIDENTIAL_RULES,
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-admin",
    code: "BLD-ADMIN",
    label: "Administrative charge — $4.00 per permit",
    feeType: "flat",
    config: { amountCents: 400 },
    componentType: "other",
    priority: 50,
    description:
      'The cover sheet\'s \"ADMINISTRATIVE CHARGE OF $4.00\" carried on every permit as an `other` component, outside the base the minimum measures.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-surcharge-res",
    code: "BLD-SURCHARGE-RES",
    label: "Surcharge — residential, $1.00 per permit",
    feeType: "flat",
    config: { amountCents: 100 },
    componentType: "other",
    priority: 51,
    conditions: { field: "custom.building_class", op: "eq", value: "residential" },
    description:
      'The cover sheet\'s \"SURCHARGE OF $1.00 FOR RESIDENTIAL\" — so a residential permit totals $5.00 of `other` ($4 + $1).',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-bld-surcharge-com",
    code: "BLD-SURCHARGE-COM",
    label: "Surcharge — commercial, $5.00 per permit",
    feeType: "flat",
    config: { amountCents: 500 },
    componentType: "other",
    priority: 51,
    conditions: { field: "custom.building_class", op: "eq", value: "commercial" },
    description:
      'The cover sheet\'s \"SURCHARGE OF $5.00 FOR COMMERCIAL\" — so a commercial permit totals $9.00 of `other` ($4 + $5).',
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — issuance, two residential branches, commercial KVA     */
/* -------------------------------------------------------------------------- */

export const MEMPHIS_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-issuance",
    code: "ELEC-ISSUANCE",
    label: "Electrical permit — issuance cost, $20.00 per permit",
    feeType: "flat",
    config: { amountCents: 2_000 },
    description:
      'Section E-0: \"FEE ISSUANCE COST PER PERMIT EXCEPT FOR METER PUT BACKS (E-5.2) $20.00\" — the permit\'s opening charge, beside the $15.00 minimum (E-3.1) which is the same figure as the refund minimum and the residential issuance on the plumbing page.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-minimum",
    code: "ELEC-MINIMUM",
    label: "Electrical permit — $15.00 minimum fee",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 1_500 },
    componentType: "base",
    priority: 200,
    description:
      'Section E-3.1 \"MINIMUM FEE $15.00\" carried as the shortfall on the permit fee. A permit that computes $10.00 pays $15.00.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-new-multifamily-0-150",
    code: "ELEC-MF-NEW-0-150",
    label: "Electrical permit — new multi-family residential, main overcurrent 0–150A, $70.00",
    feeType: "flat",
    config: { amountCents: 7_000 },
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "new_multifamily" },
        { field: "custom.amperage", op: "lte", value: 150 },
      ],
    },
    description:
      'Section E-6.1\'s first band: \"0 – 150 AMPS $70.00\" for NEW MULTIFAMILY RESIDENTIAL, plus \"$1.00 MAIN OVERCURRENT DEVICES PER TENANT\" on the line above it — the device count is that $1.00, modelled as a separate per-tenant row.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-new-multifamily-151-400",
    code: "ELEC-MF-NEW-151-400",
    label: "Electrical permit — new multi-family residential, main overcurrent 151–400A, $125.00",
    feeType: "flat",
    config: { amountCents: 12_500 },
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "new_multifamily" },
        { field: "custom.amperage", op: "gt", value: 150 },
        { field: "custom.amperage", op: "lte", value: 400 },
      ],
    },
    description: 'Section E-6.1\'s second band: \"151 – 400 AMPS $125.00\".',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-new-multifamily-over-400",
    code: "ELEC-MF-NEW-OVER-400",
    label: "Electrical permit — new multi-family residential, main overcurrent over 400A, $250.00",
    feeType: "flat",
    config: { amountCents: 25_000 },
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "new_multifamily" },
        { field: "custom.amperage", op: "gt", value: 400 },
      ],
    },
    description: 'Section E-6.1\'s third band: \"OVER 400 AMPS $250.00\".',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-new-multifamily-per-tenant",
    code: "ELEC-MF-NEW-PER-TENANT",
    label: "Electrical permit — new multi-family residential, $1.00 per tenant (main overcurrent devices per tenant)",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 100 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "new_multifamily" },
    description:
      'Section E-6.1\'s line above the amperage bands: \"MAIN OVERCURRENT DEVICES PER TENANT $1.00\" — one device per tenant, charged alongside whichever amperage band applies.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-existing-1-5",
    code: "ELEC-EXISTING-1-5",
    label: "Electrical permit — existing residential, 1 to 5 circuits, $30.00",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "existing_residential" },
        { field: "custom.circuits", op: "lte", value: 5 },
      ],
    },
    description:
      'Section E-6.2 for EXISTING RESIDENTIAL 1 & 2 FAMILY and MULTIFAMILY alike: \"1 TO 5 CIRCUITS $30.00\". The scope is existing residential regardless of occupancy, gated on the scope rather than the class.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-existing-over-5",
    code: "ELEC-EXISTING-OVER-5",
    label: "Electrical permit — existing residential, over 5 circuits, $45.00",
    feeType: "flat",
    config: { amountCents: 4_500 },
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "existing_residential" },
        { field: "custom.circuits", op: "gt", value: 5 },
      ],
    },
    description: 'Section E-6.2\'s second row: \"OVER 5 CIRCUITS $45.00\".',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-service-replacement",
    code: "ELEC-SERVICE-REPLACEMENT",
    label: "Electrical permit — service, feeder or panel replacement, $50.00",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "service_replacement" },
    description: 'Section E6.3 \"SERVICE, FEEDER, OR PANEL REPLACEMENT $50.00\". One inspection.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-pool",
    code: "ELEC-POOL",
    label: "Electrical permit — in-ground residential swimming pool, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "pool" },
    description: 'Section E6.4 \"IN GROUND RESIDENTIAL SWIMMING POOL $100\" — two inspections.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-low-voltage",
    code: "ELEC-LOW-VOLTAGE",
    label: "Electrical permit — residential low voltage, $30.00",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "low_voltage" },
    description: 'Section E6.5 \"RESIDENTIAL LOW VOLTAGE $30.00\" (and MULTIFAMILY LOW VOLTAGE the same).',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-commercial-120-240",
    code: "ELEC-COM-120-240",
    label: "Electrical permit — commercial, new service 120/240V single phase, $1.00 per amp",
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 100, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "commercial_new_service" },
        { field: "custom.electrical_voltage", op: "eq", value: "120_240" },
      ],
    },
    description:
      'Section E7.1.1/E8.1.1 \"120/240 VOLT SINGLE PHASE $1.00\" — one dollar per ampere of service, new or increased, the same figure in both sections.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-commercial-kva-first-10k",
    code: "ELEC-COM-KVA-1",
    label: "Electrical permit — commercial, excess of 480V, first 10,000 KVA at $1.50 per KVA",
    feeType: "per_unit",
    config: { unit: "kilovolt_amperes", centsPerUnit: 150 },
    maximumCents: 1_500_000,
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "commercial_new_service" },
        { field: "custom.electrical_voltage", op: "eq", value: "over_480" },
      ],
    },
    description:
      'Section E7.1.4/E8.1.4 \"FIRST 10,000 KVA $1.50\" — the first block of the excess-480V KVA ladder. The \"BETWENN 10,001 AND UP TO 50,000 KVA $0.50\" and \"GREATER THAN 50,000 KVA $0.25\" steps are registered as `needs_review` rather than guessed as marginal tiers on a count that is not a money basis.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-reinspection",
    code: "ELEC-REINSPECTION",
    label: "Electrical permit — reinspection fee, $50.00",
    feeType: "flat",
    config: { amountCents: 5_000 },
    componentType: "inspection",
    priority: 600,
    conditions: { field: "custom.reinspection", op: "eq", value: true },
    description:
      'Section E5.1.1 \"RE-INSPECTION FEE $50.00\" — charged when an inspection is repeated, as an `inspection` component.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-admin",
    code: "ELEC-ADMIN",
    label: "Administrative charge — $4.00 per electrical permit",
    feeType: "flat",
    config: { amountCents: 400 },
    componentType: "other",
    priority: 50,
    description: 'The same $4.00 data processing charge, on the electrical permit.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-elec-surcharge",
    code: "ELEC-SURCHARGE-COM",
    label: "Surcharge — electrical commercial/new-service permits, $5.00",
    feeType: "flat",
    config: { amountCents: 500 },
    componentType: "other",
    priority: 51,
    conditions: { field: "custom.electrical_scope", op: "eq", value: "commercial_new_service" },
    description:
      'The $5.00 commercial surcharge on the electrical permit, gated to the commercial scope; residential electrical permits pay the $1.00 residential surcharge where that scope is stated.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — issuance + unit fees + valuation-based rows              */
/* -------------------------------------------------------------------------- */

export const MEMPHIS_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-issuance",
    code: "PLUMB-ISSUANCE",
    label: "Plumbing permit — permit issuance $20.00",
    feeType: "flat",
    config: { amountCents: 2_000 },
    description:
      'The plumbing header: \"PERMIT ISSUANCE $20.00\" — the $4.00 data processing is the same admin line measured separately on the building cover and carried as PLUMB-ADMIN, so issuance and admin together are $24.00 before any unit fee.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-fixture",
    code: "PLUMB-FIXTURE",
    label: "Plumbing permit — $7.50 per plumbing fixture or trap",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 750 },
    description:
      'Section P-1.1 \"EACH PLUMBING FIXTURE OR TRAP OR SET OF FIXTURES ON ONE TRAP (INCLUDING WATER & DRAINAGE PIPING) $7.50\" — the same figure the sheet charges for roof drains, electric water heaters (each and replacement), interceptors and backflow preventers.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-res-sewer",
    code: "PLUMB-RES-SEWER",
    label: "Plumbing permit — residential sewer connection, $30.00",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { field: "custom.sewer_scope", op: "eq", value: "residential_connection" },
    description:
      'Section P-1.2 \"RESIDENTIAL SEWER CONNECTION $30.00\" (and P-1.2.1 \"RESIDENTIAL SEWER REPAIR OR SEWER REPLACEMENT $30.00\" and private sewage disposal $30.00).',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-com-sewer",
    code: "PLUMB-COM-SEWER",
    label: "Plumbing permit — commercial sewer, $8.00 per $1,000 of valuation ($100 minimum)",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 800 },
    minimumCents: 10_000,
    conditions: { field: "custom.sewer_scope", op: "eq", value: "commercial" },
    description:
      'Section P-1.3 \"COMMERCIAL SEWER FEE - $8.00 PER $1000 OF VALUATION MINIMUM $100.00\" — the same rate and floor the sheet charges for repair/replacement of commercial sewer, commercial water service 2.5\"+ ($200 min instead), fire protection ($100 min) and medical gas ($100 min).',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-water-1in",
    code: "PLUMB-WATER-1IN",
    label: "Plumbing permit — water service 1 inch, $20.00",
    feeType: "flat",
    config: { amountCents: 2_000 },
    conditions: { field: "custom.water_service_size", op: "eq", value: "1in" },
    description: 'Section P-1.4 \"WATER SERVICE 1\" $20.00\".',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-water-1-1-4-to-2in",
    code: "PLUMB-WATER-1-1-4-TO-2IN",
    label: "Plumbing permit — water service 1-1/4 inch through 2 inch, $30.00",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { field: "custom.water_service_size", op: "eq", value: "1_1_4_to_2in" },
    description: 'Section P-1.4 \"WATER SERVICE 1-1/4\" THROUGH 2\" $30.00\".',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-com-water-large",
    code: "PLUMB-COM-WATER-LARGE",
    label: "Plumbing permit — commercial water service 2-1/2 inch and larger, $8.00 per $1,000 ($200 minimum)",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 800 },
    minimumCents: 20_000,
    conditions: { field: "custom.water_service_size", op: "eq", value: "over_2_1_2in" },
    description:
      'Section P-1.4 \"COMMERCIAL WATER SERVICE FEE 2 1/2 INCH AND LARGER $8.00 PER $1,000.00 OF VALUATION MINIMUM $200.00\" — the same $8.00 rate as commercial sewer, with a $200 floor.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-fire",
    code: "PLUMB-FIRE",
    label: "Plumbing permit — fire protection, $8.00 per $1,000 ($100 minimum)",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 800 },
    minimumCents: 10_000,
    conditions: { field: "custom.plumbing_scope", op: "eq", value: "fire_protection" },
    description:
      'Section P-1.5 \"FIRE PROTECTION $8.00 PER $1000 MINIMUM $100.00\" — and the same line for medical gas (P-1.6), which is the plumbing page\'s medical system.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-reinspection",
    code: "PLUMB-REINSPECTION",
    label: "Plumbing permit — reinspection (second trip), $50.00",
    feeType: "flat",
    config: { amountCents: 5_000 },
    componentType: "inspection",
    priority: 600,
    conditions: { field: "custom.reinspection", op: "eq", value: true },
    description:
      'Plumbing re-inspection: \"SECOND RE-INSPECTION TRIP $50.00 / EACH TRIP THEREAFTER $50.00\" — the first reinspection is free on the sheet\'s building page, but plumbing charges from the second trip.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-admin",
    code: "PLUMB-ADMIN",
    label: "Administrative charge — $4.00 per plumbing permit",
    feeType: "flat",
    config: { amountCents: 400 },
    componentType: "other",
    priority: 50,
    description: 'The same $4.00 processing charge, on the plumbing permit.',
  }),
  MEMRule(MEMPHIS_FEE_SCHEDULE_SOURCE_KEY, {
    id: "memphis-plumb-surcharge-res",
    code: "PLUMB-SURCHARGE-RES",
    label: "Surcharge — residential plumbing, $1.00",
    feeType: "flat",
    config: { amountCents: 100 },
    componentType: "other",
    priority: 51,
    conditions: { field: "custom.plumbing_scope", op: "eq", value: "residential" },
    description: 'The $1.00 residential surcharge on the plumbing permit.',
  }),
];
