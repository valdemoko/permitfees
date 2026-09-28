import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Nashville / Davidson County, Tennessee fee rules — REAL DATA.
 *
 * Sources (research/tennessee/nashville.md records how each was read):
 *
 *  S1  Metro Nashville Codes Fee Schedule (PDF) — the Metro Code's own fee text, sections
 *      16.28.110 (building), 16.12.220 (plumbing), 16.16.400 (gas/mechanical) and 16.20.250
 *      (electrical), followed by the ICC Building Valuation Data (February 2025).
 *      https://www.nashville.gov/sites/default/files/2025-12/Building-Permit-Fee-Scheudle-2025.pdf
 *  S2  Codes publications list — the Metro Codes page that links the schedule and the other
 *      permit publications.
 *      https://www.nashville.gov/departments/codes/construction-and-permits/publications-list
 *  S3  BL2022-1215 — the ordinance that adopted the current fee schedule (cited on the
 *      schedule itself, with its Legistar link).
 *  S4  BL2022-1254 — the ordinance that adopted the Codes Tech Fee (cited on the schedule).
 *
 * **The mechanism, in three sentences.** A Nashville building permit is *four* fees added
 * together, and the schedule says so in its first four lines: "Zoning Examination Fee of $25 /
 * Building Valuation Fee: see below / Codes Tech Fee: 10% of the Building Valuation Fee /
 * Building Plan Review Fee: see below". The valuation fee is the only one that reads the job —
 * $5.00 per $1,000 for one- and two-family dwellings and townhouses, and a four-band ladder for
 * everything else whose printed bases are not its own arithmetic — while the plan review is
 * *half the permit fee* up to $275,000 and then a printed ladder of its own. Plumbing and
 * electrical are price lists: a $75 minimum on each with fixtures at $11, connections at $80,
 * and an electrical table priced per outlet, per meter, per service riser and per sign.
 *
 * **Four readings this module depends on, all stated on the instrument.**
 *
 *  1. **The building fee is four components, not one.** The schedule's own first block names
 *     them in order, and the plan review is one of them — "the fee for building permits shall
 *     be determined as set forth in this section" is section A, while the plans examination fee
 *     is subsection G of the same section, "in addition to the building permit fee".
 *  2. **The commercial ladder's printed bases are not the arithmetic.** Band 2's printed base
 *     is $372.71 where band 1's own rate lands at $372.55; band 3's is $651.38 where band 2's
 *     lands at $651.21; band 4's is $2,326.84 where band 3's lands at $2,327.38. Three seams in
 *     four bands, each charged as printed — the same rule Minneapolis's and Saint Paul's
 *     schedules required, at three more places in the same document.
 *  3. **The plan review turns over at $275,000, and its second band starts far above half.**
 *     Below the seam the fee is one-half of the building permit fee, which at $275,000 of work
 *     is about $692; at $275,000.01 it is $1,338.54 plus $0.18 a thousand. That is a 93% step
 *     up for one dollar of valuation, and it is what the ordinance prints.
 *  4. **Residential is priced separately and by a different measure.** One- and two-family
 *     dwellings and townhouses pay $5.00 per $1,000 of valuation — a single rate, no bands, and
 *     no plan review at all, because subsection G.2 exempts "one- and two-family dwelling
 *     building permits" and "townhouse building permits" from plans examination.
 *
 * **What is deliberately NOT here:** the class-based electrical rows (motors and generators by
 * horsepower, ranges and water heaters by occupancy, electric heat by kilowatts, the panel
 * ladder by amperage class, the catch-all wiring row), the gas/mechanical permit's appliance and
 * Btuh rows (a different permit type), the moving, sign, trailer, use-and-occupancy, cellar and
 * re-inspection rows — all transcribed in the research record and named on the pages. This module
 * is the single definition of Nashville's fee rules: the seed writes exactly these records and the
 * tests assert against exactly these records.
 */

/**
 * The schedule carries no effective date of its own; the file was published to the City's own
 * December 2025 folder (`/sites/default/files/2025-12/`), and the valuation data it reprints is
 * ICC's February 2025 edition. The ordinance behind it — BL2022-1215 — is cited on the sheet.
 */
export const NASHVILLE_FEE_EFFECTIVE_FROM = "2025-12-03";

export const NASHVILLE_FEE_SCHEDULE_SOURCE_KEY = "nashville-codes-fee-schedule";
export const NASHVILLE_PUBLICATIONS_SOURCE_KEY = "nashville-codes-publications";
export const NASHVILLE_FEE_ORDINANCE_SOURCE_KEY = "nashville-bl2022-1215";
export const NASHVILLE_TECH_FEE_ORDINANCE_SOURCE_KEY = "nashville-bl2022-1254";

/** The Codes Tech Fee's share of the building valuation fee, printed on the schedule. */
export const NASHVILLE_TECH_FEE_SHARE = { numerator: 1, denominator: 10 };

/** The plan review's share of the building permit fee below $275,000. */
export const NASHVILLE_PLAN_REVIEW_SHARE = { numerator: 1, denominator: 2 };

/** The two classes the building section prices separately. */
export type NashvilleBuildingClass = "one_and_two_family" | "townhouse" | "commercial";

export const NASHVILLE_RESIDENTIAL_CLASSES: NashvilleBuildingClass[] = [
  "one_and_two_family",
  "townhouse",
];

function nsvRule(
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
    effectiveFrom: NASHVILLE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

const COMMERCIAL = { field: "custom.building_class", op: "eq", value: "commercial" } as const;
const RESIDENTIAL = {
  field: "custom.building_class",
  op: "in",
  value: [...NASHVILLE_RESIDENTIAL_CLASSES],
} as const;

/* -------------------------------------------------------------------------- */
/* Building permits — the schedule's four components                          */
/* -------------------------------------------------------------------------- */

/**
 * The commercial valuation ladder, band by band. Each band's printed base is the schedule's own
 * number and the rate inside it steps per $1,000 "or fraction thereof".
 */
export const NASHVILLE_BUILDING_LADDER_RULES: FeeRuleRecord[] = [
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-commercial-1",
    code: "BLD-COMM-1",
    label: "Building permit — commercial, $0 to $2,000 of valuation: $40.39",
    feeType: "flat",
    config: { amountCents: 4_039 },
    conditions: {
      all: [COMMERCIAL, { field: "valuation", op: "lte", value: 200_000 }],
    },
    description:
      'The commercial table\'s first row: "$0.00 to $2,000.00 | $40.39". Commercial construction is "all other Construction other than one family and two-family residential construction and townhouses", so this row carries every occupancy except those two, including multifamily — which the residential row explicitly does not reach.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-commercial-2",
    code: "BLD-COMM-2",
    label: "Building permit — commercial, $2,000.01 to $50,000: $40.39 plus $6.92 per $1,000 or fraction",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 4_039,
      thresholdCents: 200_000,
      centsPerThousand: 692,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        COMMERCIAL,
        { field: "valuation", op: "gt", value: 200_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
    description:
      'The schedule\'s "$2000.01 to $50,000.00 $40.39 for the first $2,000.00 plus $6.92 for each additional thousand or fraction thereof, to and including $50,000.00". The band\'s own arithmetic at $50,000 is $372.55; the band above prints a base of $372.71, sixteen cents higher, and the printed base is the one charged.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-commercial-3",
    code: "BLD-COMM-3",
    label: "Building permit — commercial, $50,000.01 to $100,000: $372.71 plus $5.57 per $1,000 or fraction",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 37_271,
      thresholdCents: 5_000_000,
      centsPerThousand: 557,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        COMMERCIAL,
        { field: "valuation", op: "gt", value: 5_000_000 },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
    description:
      'The schedule\'s "$50,000.01 to $100,000.00 $372.71 for the first $50,000.00 plus $5.57 for each additional thousand or fraction thereof, to and including $100,000.00" — the second printed base that sits above its predecessor\'s arithmetic (which lands at $651.21 against the $651.38 printed in the next band).',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-commercial-4",
    code: "BLD-COMM-4",
    label: "Building permit — commercial, $100,000.01 to $500,000: $651.38 plus $4.19 per $1,000 or fraction",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 65_138,
      thresholdCents: 10_000_000,
      centsPerThousand: 419,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        COMMERCIAL,
        { field: "valuation", op: "gt", value: 10_000_000 },
        { field: "valuation", op: "lte", value: 50_000_000 },
      ],
    },
    description:
      'The schedule\'s "$100,000.01 to $500,000.00 $651.38 for the first $100,000.00 plus $4.19 for each additional thousand or fraction thereof, to and including $500,000.00". This band\'s arithmetic at $500,000 is $2,327.38 and the top band prints $2,326.84 — the third seam, and the only one that steps down (.54 cents a thousand\'s worth of it).',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-commercial-5",
    code: "BLD-COMM-5",
    label: "Building permit — commercial, $500,000.01 and up: $2,326.84 plus $2.79 per $1,000 or fraction",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 232_684,
      thresholdCents: 50_000_000,
      centsPerThousand: 279,
      incrementCents: 100_000,
    },
    conditions: {
      all: [COMMERCIAL, { field: "valuation", op: "gt", value: 50_000_000 }],
    },
    description:
      'The schedule\'s top commercial row: "$500,000.01 and up $2,326.84 for the first $500,000.00 plus $2.79 for each additional thousand or fraction thereof" — open-ended, no "to and including" clause, and the only commercial band without one.',
  }),
];

export const NASHVILLE_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  ...NASHVILLE_BUILDING_LADDER_RULES,
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-residential",
    code: "BLD-RESIDENTIAL",
    label: "Building permit — one- and two-family dwellings and townhouses, $5.00 per $1,000 of valuation",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 500 },
    conditions: RESIDENTIAL,
    description:
      'Subsection A.1, in full: "Building Permit Fees for Residential Construction based on valuation. Residential construction includes one-family and two-family residential construction and townhouses as defined by the 2018 Edition of the International Residential Code, but not multi-family construction shall be $5.00 per $1,000 total valuation." One rate, no bands, no minimum — and because subsection G.2 exempts one- and two-family and townhouse permits from plans examination, no plan review charges beside it.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-zoning-examination",
    code: "ZONING-EXAMINATION",
    label: "Zoning examination fee — $25 per building permit",
    feeType: "flat",
    config: { amountCents: 2_500 },
    componentType: "other",
    priority: 50,
    description:
      'The schedule\'s own first line: "The total permit cost for a building permit includes: Zoning Examination Fee of $25". It is charged on every building permit, residential and commercial alike, and it is not part of the building valuation fee — so the 10% codes tech fee, which is "10% of the Building Valuation Fee", is not charged on it. Declared as an `other` component for exactly that reason.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-codes-tech-fee",
    code: "CODES-TECH-FEE",
    label: "Codes tech fee — 10% of the building valuation fee",
    feeType: "percent",
    config: {
      basis: "permit_fee",
      rate: NASHVILLE_TECH_FEE_SHARE,
      rateUnit: "fraction",
    },
    componentType: "technology",
    priority: 400,
    conditions: { field: "valuation", op: "gt", value: 0 },
    description:
      'The schedule\'s own third line: "Codes Tech Fee: 10% of the Building Valuation Fee". Its base is the valuation fee — the ladder\'s output — and not the whole permit bill, which is why the zoning examination fee is an `other` component rather than a base one: a base component would be inside the subtotal this 10% reads. The ordinance behind it, BL2022-1254, is cited on the sheet.',
  }),
];

export const NASHVILLE_BUILDING_PLAN_REVIEW_RULES: FeeRuleRecord[] = [
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-plan-review-half",
    code: "BLD-PLAN-REVIEW-HALF",
    label: "Plans examination — one-half of the building permit fee, to $275,000 of valuation",
    feeType: "percent",
    config: {
      basis: "permit_fee",
      rate: NASHVILLE_PLAN_REVIEW_SHARE,
      rateUnit: "fraction",
    },
    componentType: "plan_review",
    priority: 300,
    conditions: {
      all: [COMMERCIAL, { field: "valuation", op: "lte", value: 27_500_000 }],
    },
    description:
      'Subsection G.1\'s first row: "$0.00 to $275,000.00 one-half of the building permit fee as set forth in subsection A of this section" — half of the ladder\'s output, not of the job. Gated to commercial work because G.2 excepts "one- and two-family dwelling building permits" and "townhouse building permits" from plans examination entirely.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-plan-review-2",
    code: "BLD-PLAN-REVIEW-2",
    label: "Plans examination — $275,000.01 to $5,000,000: $1,338.54 plus $0.18 per $1,000 or fraction",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 133_854,
      thresholdCents: 27_500_000,
      centsPerThousand: 18,
      incrementCents: 100_000,
    },
    componentType: "plan_review",
    priority: 300,
    conditions: {
      all: [
        COMMERCIAL,
        { field: "valuation", op: "gt", value: 27_500_000 },
        { field: "valuation", op: "lte", value: 500_000_000 },
      ],
    },
    description:
      'Subsection G.1\'s second row: "$275,000.01 to $5,000,000.00 $1.338.54 for the first $275,000.00 plus $0.18 per thousand for each additional thousand or fraction thereof, to and including $5,000,000.00" — the sheet prints the base as "$1.338.54", a decimal point where a comma belongs, read as $1,338.54. The seam is the sharpest in the dataset: at $275,000 of work the plan review is half the permit fee, about $692.32, and one dollar later this row charges $1,338.72.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-bld-plan-review-3",
    code: "BLD-PLAN-REVIEW-3",
    label: "Plans examination — $5,000,000.01 and up: $2,181.82 plus $0.07 per $1,000 or fraction",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 218_182,
      thresholdCents: 500_000_000,
      centsPerThousand: 7,
      incrementCents: 100_000,
    },
    componentType: "plan_review",
    priority: 300,
    conditions: {
      all: [COMMERCIAL, { field: "valuation", op: "gt", value: 500_000_000 }],
    },
    description:
      'Subsection G.1\'s third row: "$5,000,000.01 and above $2,181.82 for the first $5,000,000.00 plus $0.07 per thousand for each additional thousand or fraction thereof". The band below reaches $2,189.04 at $5,000,000 and this base is $7.22 lower — the plan review\'s own printed seam, charged as printed, and "in no case shall this be refunded even if there is not a subsequent building permit issued".',
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — the price list with its $75 minimum                      */
/* -------------------------------------------------------------------------- */

export const NASHVILLE_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-plumb-minimum",
    code: "PLUMB-MINIMUM",
    label: "Plumbing permit — $75.00 minimum fee",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 7_500 },
    componentType: "base",
    priority: 200,
    description:
      'The plumbing fee table\'s own first row: "Minimum fee (each permit) ... $75.00". Charged as the shortfall on the permit fee, so a permit that computes less — a single hot water heater at $43, say — pays $75.00, and a permit whose rows exceed it pays its own arithmetic.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-plumb-fixture",
    code: "PLUMB-FIXTURE",
    label: "Plumbing permit — $11.00 per plumbing fixture",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 1_100 },
    description:
      'The table\'s "$11.00 each fixture" row, under its own footnote: "Each fixture outlet shall be counted as one fixture in figuring the total permit fee, whether or not the fixture is actually set at the time the plumbing system is installed." Subsection C then lists what counts as one fixture — thirty-two kinds, from area drains and backflow preventers to water closets and water tanks, including "solar panels when connected to plumbing system" and "swimming pools" — all at one fixture each.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-plumb-building-drain",
    code: "PLUMB-BUILDING-DRAIN",
    label: "Plumbing permit — $32.00 per additional building drain",
    feeType: "per_unit",
    config: { unit: "building_drains", centsPerUnit: 3_200 },
    description:
      'The table\'s "Each additional building drain ... $32.00" row. A building drain is not a fixture and not a connection: it is the horizontal run that carries the building\'s waste to the sewer, counted per additional drain, and the dataset counts it separately for that reason.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-plumb-sewer-connection",
    code: "PLUMB-SEWER-CONNECTION",
    label: "Plumbing permit — $80.00 per sewer connection",
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 8_000 },
    description:
      'The table\'s "Sewer connection ... $80.00" row. The count is the dataset\'s existing connection kind — Houston\'s sewer connections are the same measurement — and Nashville prices a water service connection at the same $80 on the row beside it, which is its own kind because a water service is not a sewer.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-plumb-water-service",
    code: "PLUMB-WATER-SERVICE",
    label: "Plumbing permit — $80.00 per water service connection",
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 8_000 },
    description:
      'The table\'s "Water service connection ... $80.00" row, priced at the same $80 as the sewer connection beside it and counted separately: a building adds one water service and one sewer, and sharing a count would charge whichever the applicant entered twice.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-plumb-septic",
    code: "PLUMB-SEPTIC",
    label: "Plumbing permit — $80.00 per septic tank and disposal field",
    feeType: "per_unit",
    config: { unit: "septic_tanks", centsPerUnit: 8_000 },
    description:
      'The table\'s "Septic tank and disposal field ... $80.00" row — one price for the tank and its field together, counted per system.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-plumb-water-heater",
    code: "PLUMB-WATER-HEATER",
    label: "Plumbing permit — $43.00 per hot water heater",
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 4_300 },
    description:
      'The table\'s "Hot water heater ... $43.00" row. A water heater is its own line on this table and not a fixture, even though the schedule\'s fixture classification list would not otherwise catch it: the row exists because a water heater replacement is the most common plumbing permit there is, and it is priced alone. The gas/mechanical table prices the same appliance at $21.00 — a different permit.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-plumb-reinspection",
    code: "PLUMB-REINSPECTION",
    label: "Plumbing permit — $50.00 reinspection fee",
    feeType: "flat",
    config: { amountCents: 5_000 },
    componentType: "inspection",
    priority: 600,
    conditions: { field: "custom.reinspection", op: "eq", value: true },
    description:
      'The table\'s "Reinspection fee (each) ... $50.00" row. It is not part of a permit\'s price — it is charged when a failed inspection has to be repeated — so it is gated on the fact that says an inspection failed, and carried as an `inspection` component rather than a base one.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — the City's own price list                              */
/* -------------------------------------------------------------------------- */

export const NASHVILLE_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-elec-minimum",
    code: "ELEC-MINIMUM",
    label: "Electrical permit — $75.00 minimum fee",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 7_500 },
    componentType: "base",
    priority: 200,
    description:
      'Subsection C.11: "Minimum fee (each permit) ... $75.00 (Including permit for the installation of any electrical system or part thereof, including but not limited to the installation of both new electrical systems and additions, alterations and repairs to existing electrical systems, the installation of electrical fixtures, equipment and devices and appurtenances thereto, temporary services, etc.)" — a floor that catches a one-outlet permit at $75.00 rather than $6.00.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-elec-outlets",
    code: "ELEC-OUTLETS",
    label: "Electrical permit — lighting circuits and outlets: $6.00 for 10 or fewer, $1.00 each over 10",
    feeType: "per_unit",
    config: { unit: "outlets", baseCents: 600, thresholdUnits: 10, centsPerUnit: 100 },
    description:
      'Subsection C.1 in full: "Lighting circuits or any circuit where outlets are intended to be installed for low-voltage holding devices or lamp-holding devices and receptacles for the attachment of small, portable electrical devices and appliances; 130 volts or less: a. For the installation of 10 or fewer such outlets ... $6.00; b. For additional outlets over 10, each ... $1.00". A base charge with a ten-outlet allowance and a dollar for each outlet past it — the base-plus-allowance shape the engine\'s per-unit form carries exactly: ten outlets are $6.00, eleven are $7.00.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-elec-service-meter",
    code: "ELEC-SERVICE-METER",
    label: "Electrical permit — service, new, increased or relocated, $12.00 per meter",
    feeType: "per_unit",
    config: { unit: "meters", centsPerUnit: 1_200 },
    description:
      'Subsection C.8: "Service, new installation, increasing size, or relocation, per meter ... $12.00". The unit is the meter, not the service — a service with two meters is $24.00 — which is why this row reads the dataset\'s meter count rather than its service count.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-elec-service-release-residential",
    code: "ELEC-SERVICE-RELEASE-RES",
    label: "Electrical permit — service release, residential, $75.00 per riser",
    feeType: "per_unit",
    config: { unit: "electrical_services", centsPerUnit: 7_500 },
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "service_release" },
        {
          field: "custom.customer_class",
          op: "in",
          value: ["one_and_two_family", "multifamily_condominium"],
        },
      ],
    },
    description:
      'Subsection C.13\'s first two rows, which share one price: "Service releases: Residential, one-family or two-family, except condominium units, each service riser ... $75.00; Residential, more than two-family, and condominium units, each service riser ... $75.00". Two residential classes, one rate, so one rule carries them and the class only has to say "residential"; the commercial row beside it is $102.00.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-elec-service-release-commercial",
    code: "ELEC-SERVICE-RELEASE-COM",
    label: "Electrical permit — service release, commercial or industrial, $102.00 per riser",
    feeType: "per_unit",
    config: { unit: "electrical_services", centsPerUnit: 10_200 },
    conditions: {
      all: [
        { field: "custom.electrical_scope", op: "eq", value: "service_release" },
        { field: "custom.customer_class", op: "in", value: ["commercial", "industrial"] },
      ],
    },
    description:
      'Subsection C.13\'s third row: "Commercial or industrial, each service riser ... $102.00". A service release is a permit issued when an existing service is re-energised or released rather than installed, and Nashville prices it by occupancy class — $75 residential, $102 commercial — on the same count.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-elec-emergency-reconnect",
    code: "ELEC-EMERGENCY-RECONNECT",
    label: "Electrical permit — emergency re-connection of service, $102.00 each",
    feeType: "per_unit",
    config: { unit: "electrical_services", centsPerUnit: 10_200 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "emergency_reconnect" },
    description:
      'Subsection C.14: "Emergency re-connection of service, each ... $102.00". It is priced per service like the service releases above it and reads the same count, which is why both are gated on the permit\'s own scope: one service can be released or reconnected, never both on one permit, and neither rule may charge the other\'s count.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-elec-signs",
    code: "ELEC-SIGNS",
    label: "Electrical permit — electric signs, $20.00 each (service excluded)",
    feeType: "per_unit",
    config: { unit: "signs", centsPerUnit: 2_000 },
    description:
      'Subsection C.7: "Electric signs (excluding service), each ... $20.00". The parenthetical is the scope: a sign whose service is installed under this permit is charged the sign row, not the service row; a sign illuminated from an existing service is charged this row alone.',
  }),
  nsvRule(NASHVILLE_FEE_SCHEDULE_SOURCE_KEY, {
    id: "nashville-elec-reinspection",
    code: "ELEC-REINSPECTION",
    label: "Electrical permit — $50.00 reinspection fee",
    feeType: "flat",
    config: { amountCents: 5_000 },
    componentType: "inspection",
    priority: 600,
    conditions: { field: "custom.reinspection", op: "eq", value: true },
    description:
      'Subsection C.12: "Reinspection fee (each) ... $50.00". Charged when an inspection is repeated rather than as part of a permit\'s price, and carried as an `inspection` component. Subsection B sits beside it as the schedule\'s penalty for unpermitted work: "the permit fees shall be tripled" — a multiplier on whatever was owed, named on the page rather than modelled.',
  }),
];
