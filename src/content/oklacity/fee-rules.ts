import type { ExactRate, FeeCondition, FeeRuleRecord, PercentFeeConfig, RateTable } from "@/lib/calc/types";

/**
 * Oklahoma City fee rules — Chapter 60 of the City's Code of Ordinances, read
 * through the codifier on 2026-09-26, plus the City's Development Impact Fees
 * page (research/oklahoma/oklahoma-city.md records both).
 *
 * Two structural facts shape every rule here:
 *
 *  - **Ord. 27978 (11-18-25) printed two columns** — `Fee effective July 1, 2025
 *    through June 30, 2026` and `Fee effective July 1, 2026 and thereafter`. The
 *    2026 column is in force on this pass's date, so rows from those sections
 *    carry `effectiveFrom: 2026-07-01` and the FY2025-26 figures are recorded in
 *    the research record, charged nowhere. Sections printing a single amount
 *    carry the ordinance date itself (2025-11-18).
 *  - **Plan review is a credit, not a charge** (§ 60-12-6(b): 50% of the total
 *    building permit fee, "credited towards the total permit fee"), so it is
 *    named on the page and never summed — Pittsburgh's 40% share exactly. The
 *    optional pre-application and pre-construction services are recorded too.
 *
 * The one line every permit of every trade carries is § 60-12-1's Administrative
 * Collection Fee: `$0.50` for the Oklahoma Uniform Building Code Commission,
 * repeated per trade at §§ 60-18-27, 60-42-11 (and 60-29-25, mechanical, no page
 * here). The 2.7% card service fee is a property of the payment channel and is
 * named instead of charged.
 *
 * Selection follows the pattern Buffalo's flat lists established: each standalone
 * row has its own `custom.<fact>` boolean, so a permit can carry several of them
 * at once without a single-slot selector.
 */

/* -------------------------------------------------------------------------- */
/* Source and schedule keys                                                   */
/* -------------------------------------------------------------------------- */

export const OKC_T12_SOURCE_KEY = "okc-code-ch60-title-12-building";
export const OKC_T18_SOURCE_KEY = "okc-code-ch60-title-18-electrical";
export const OKC_T42_SOURCE_KEY = "okc-code-ch60-title-42-plumbing";
export const OKC_PERMIT_PAGE_SOURCE_KEY = "okc-permit-fees-hub-page";
export const OKC_IMPACT_SOURCE_KEY = "okc-development-impact-fees-page";

/** Ord. No. 27978, adopted 11-18-25 — single-amount sections. */
export const OKC_ORD_27978_DATE = "2025-11-18";
/** The later column of Ord. 27978's two-column tables: "July 1, 2026 and thereafter". */
export const OKC_FY2026_DATE = "2026-07-01";
/** The impact-fee page: "went into effect in January 2017". */
export const OKC_IMPACT_EFFECTIVE_FROM = "2017-01-01";

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function okcRule(
  sourceId: string,
  effectiveFrom: string,
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> & Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return {
    description: null,
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* Conditions --------------------------------------------------------------- */

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };
const NOT_RESIDENTIAL: FeeCondition = { field: "occupancy", op: "neq", value: "residential" };

const ALTERATION_WORK: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["alteration", "remodel", "repair", "replacement"],
};
const NEW_WORK: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["new_construction", "addition"],
};
const DEMOLITION: FeeCondition = { field: "work_type", op: "eq", value: "demolition" };

/** A standalone schedule row, selected by its own boolean fact. */
function rowFact(fact: string): FeeCondition {
  return { field: `custom.${fact}`, op: "eq", value: true };
}
function all(...conditions: FeeCondition[]): FeeCondition {
  return { all: conditions };
}
function not(condition: FeeCondition): FeeCondition {
  return { not: condition };
}

/**
 * § 60-18-12's "Five outlets or less, unrelated to building permits and
 * requiring no change in service" is a standalone permit: its own scope words
 * make it exclusive with the branch regimes, which stand down while it is set.
 */
const NOT_STANDALONE: FeeCondition = not(rowFact("five_outlets_standalone"));

/** The 4,000 sq ft seam of §§ 60-18-20/22 and § 60-18-24(c). */
const UNDER_4000: FeeCondition = not({ field: "square_footage", op: "gte", value: 4_000 });
const OVER_4000: FeeCondition = { field: "square_footage", op: "gte", value: 4_000 };

const T12 = OKC_T12_SOURCE_KEY;
const T18 = OKC_T18_SOURCE_KEY;
const T42 = OKC_T42_SOURCE_KEY;
const ORD = OKC_ORD_27978_DATE;
const FY26 = OKC_FY2026_DATE;

/* -------------------------------------------------------------------------- */
/* Building — Title 12                                                        */
/* -------------------------------------------------------------------------- */

/**
 * § 60-12-9's five class rates, as the published lookup that the schedule's
 * own scope asks for: "the permit asks which class the building is" —
 * `custom.building_class`, because "commercial" alone does not say whether the
 * building is a warehouse or an office. Both commercial words the schedule
 * prints ($0.28 for commercial buildings, office buildings and office space)
 * map to the same rate; withholding the fact produces no charge and a clean
 * exclusion, which is the honest answer when the class is unknown.
 */
const BUILDING_CLASS_TABLE: RateTable = {
  label: "§ 60-12-9(b) — class rate, per square foot",
  keys: ["custom.building_class"],
  rateUnit: "currency_per_unit",
  entries: [
    { values: ["warehouse"], rate: { numerator: 19, denominator: 1 } },
    { values: ["commercial"], rate: { numerator: 28, denominator: 1 } },
    { values: ["office"], rate: { numerator: 28, denominator: 1 } },
    { values: ["industrial"], rate: { numerator: 28, denominator: 1 } },
    { values: ["residential"], rate: { numerator: 16, denominator: 1 } },
    { values: ["agricultural_accessory"], rate: { numerator: 5, denominator: 1 } },
  ],
};

const BUILDING_CLASS_CONFIG: PercentFeeConfig = {
  basis: "square_footage",
  rateUnit: "currency_per_unit",
  rateTables: [BUILDING_CLASS_TABLE],
};

export const OKC_BUILDING_RULES: FeeRuleRecord[] = [
  okcRule(T12, ORD, {
    id: "okc-bld-alt",
    code: "BLD-ALTER",
    label: "Alterations, removal, repair — $6.00 per $1,000 of valuation, $75 minimum",
    description:
      '"Alterations, removal, repair ... $6.00 per $1,000.00 of valuation ... Minimum fee $75.00" (§ 60-12-7). The rate prints no "or fraction thereof", so the per-thousand amount prorates — the Bismarck reading: $1,500 of valuation is $9.00, floored to the $75.00 minimum. The $75 is a floor on this rule, charged as its own shortfall.',
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 600 },
    minimumCents: 7_500,
    conditions: ALTERATION_WORK,
  }),
  okcRule(T12, ORD, {
    id: "okc-bld-new-class",
    code: "BLD-NEW-CLASS",
    label: "New construction — class rate per square foot, $75 minimum",
    description:
      '"New construction ... Warehouse buildings $0.19; commercial buildings, office buildings and office space $0.28; industrial buildings $0.28; residential buildings, including accessory buildings $0.16; accessory buildings to agricultural uses with electrical connection only $0.05 — per square foot ... Minimum fee $75.00" (§ 60-12-9). The class is supplied as custom.building_class (warehouse, commercial, office, industrial, residential, agricultural_accessory) because the schedule’s class is finer than the occupancy labels; with no class supplied the rule answers nothing rather than guessing one.',
    feeType: "percent",
    config: BUILDING_CLASS_CONFIG,
    minimumCents: 7_500,
    conditions: all(NEW_WORK, { field: "custom.building_class", op: "exists" }),
  }),
  okcRule(T12, FY26, {
    id: "okc-bld-demo",
    code: "BLD-DEMO",
    label: "Demolition — first story $78.00, each additional story $12.00",
    description:
      '"Demolition of a building or structure: first story $78.00; each additional story $12.00" (§ 60-12-8, 2026 column; the FY2025-26 column said $74.00 for the first story). Priced on a count of stories, which is the schedule’s own unit — not on valuation and not on area. custom.stories is the count the rule reads, with the first story inside the base.',
    feeType: "per_unit",
    config: { unit: "stories", centsPerUnit: 1_200, baseCents: 7_800, thresholdUnits: 1 },
    conditions: DEMOLITION,
  }),
  okcRule(T12, ORD, {
    id: "okc-bld-oucc",
    code: "BLD-OUCC",
    label: "Oklahoma Uniform Building Code Commission collection fee — $0.50 per permit",
    description:
      '"Administrative Collection Fee, per permit ..... $0.50" — collected "for the collection and remittance of fees to the Oklahoma Uniform Building Code Commission as established by 59 O.S. § 1000.25" (§ 60-12-1). Fifty cents, on every permit of every trade; §§ 60-18-27 and 60-42-11 repeat the same line for the electrical and plumbing schedules.',
    feeType: "flat",
    config: { amountCents: 50 },
    componentType: "state_surcharge",
    conditions: null,
  }),

  /* Standalone building rows, each behind its own boolean fact. */
  okcRule(T12, ORD, {
    id: "okc-bld-pool",
    code: "BLD-POOL",
    label: "Swimming pool or hot tub permit — $75.00",
    description:
      "§ 60-12-1's misc list: \"Swimming pool or hot tub permit ... $75.00\". Its own boolean row, so a permit can carry it beside the ladder.",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: rowFact("swimming_pool"),
  }),
  okcRule(T12, ORD, {
    id: "okc-bld-co",
    code: "BLD-CO",
    label: "Certificate of occupancy — $25.00",
    description:
      "§ 60-12-1's misc list: \"Occupancy certificate ... $25.00\". A certificate priced on the same schedule as the permit rows, selected by its own fact.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: rowFact("occupancy_certificate"),
  }),
  okcRule(T12, FY26, {
    id: "okc-bld-pv",
    code: "BLD-PV",
    label: "Photovoltaic system permit — $96.00",
    description:
      "§ 60-12-1's misc list, 2026 column: \"Photovoltaic system ... $96.00\" (the FY2025-26 column said $86.40 for this row family).",
    feeType: "flat",
    config: { amountCents: 9_600 },
    conditions: rowFact("photovoltaic_system"),
  }),
  okcRule(T12, FY26, {
    id: "okc-bld-shelter",
    code: "BLD-SHELTER",
    label: "Pre-manufactured in-ground fallout or tornado shelter — $78.00",
    description:
      "§ 60-12-1's misc list, 2026 column: \"Pre-manufactured in-ground fallout or tornado shelter ... $78.00\". Above-ground shelters are not this row — § 60-12-24 prices them through § 60-12-9's class rates instead.",
    feeType: "flat",
    config: { amountCents: 7_800 },
    conditions: rowFact("fallout_shelter"),
  }),
  okcRule(T12, ORD, {
    id: "okc-bld-roof",
    code: "BLD-ROOF",
    label: "Roof replacement or repair over 500 sq ft — $90.00",
    description:
      "§ 60-12-1's misc list: roof replacement or repair \"over 500 square feet ... $90.00\". The scope's own threshold is a condition — the row answers only when the job's area passes 500 square feet.",
    feeType: "flat",
    config: { amountCents: 9_000 },
    conditions: all(rowFact("roof_replacement"), { field: "square_footage", op: "gt", value: 500 }),
  }),
  okcRule(T12, ORD, {
    id: "okc-bld-insulation",
    code: "BLD-INSULATION",
    label: "Residential insulation installation — $0.03 per square foot",
    description:
      "§ 60-12-1's misc list: \"Residential insulation installation ... $0.03 per square foot\". Area, not valuation — and residential in the schedule's own word, so a commercial job does not pick this row up.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 3, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: all(rowFact("insulation_installation"), RESIDENTIAL),
  }),
  okcRule(T12, FY26, {
    id: "okc-bld-mhp",
    code: "BLD-MOBILE-HOME-PARK",
    label: "Mobile home park — $478.00 minimum plus $5.00 per lot being created",
    description:
      "§ 60-12-1's misc list, 2026 column: \"Mobile home park ... minimum $478.00 plus $5.00 per lot being created\" (the FY2025-26 column said $434.00). One rule with the minimum as its base and every lot — including the first — at $5.00, because the schedule says minimum PLUS per lot: 100 lots is $978.00. custom.units is the count of lots.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 500, baseCents: 47_800, thresholdUnits: 0 },
    conditions: rowFact("mobile_home_park"),
  }),
];

/* -------------------------------------------------------------------------- */
/* Development impact fees — streets and parks                                */
/* -------------------------------------------------------------------------- */

/**
 * The streets table exactly as the City publishes it: six land-use rows by four
 * assessment areas, dollars per square foot of development (excluding porches
 * and garages). Stored as the schedule's own `rateTables` product — land use ×
 * assessment area — the same shape Buffalo's Schedule B established. Both facts
 * must be present for the lookup to answer; without them no impact fee is
 * charged, which is the honest answer when the category is unknown.
 */
const STREETS_TABLE: RateTable = {
  label: "Streets fee table — land use × streets assessment area, per square foot",
  keys: ["custom.land_use_category", "custom.streets_assessment_area"],
  rateUnit: "currency_per_unit",
  entries: [
    { values: ["Residential", "Rural"], rate: { numerator: 47, denominator: 1 } },
    { values: ["Residential", "New Growth"], rate: { numerator: 47, denominator: 1 } },
    { values: ["Residential", "Infill"], rate: { numerator: 40, denominator: 1 } },
    { values: ["Residential", "Core"], rate: { numerator: 34, denominator: 1 } },
    { values: ["Industrial", "Rural"], rate: { numerator: 77, denominator: 1 } },
    { values: ["Industrial", "New Growth"], rate: { numerator: 51, denominator: 1 } },
    { values: ["Industrial", "Infill"], rate: { numerator: 43, denominator: 1 } },
    { values: ["Industrial", "Core"], rate: { numerator: 37, denominator: 1 } },
    { values: ["Office/Institutional/Lodging", "Rural"], rate: { numerator: 156, denominator: 1 } },
    { values: ["Office/Institutional/Lodging", "New Growth"], rate: { numerator: 146, denominator: 1 } },
    { values: ["Office/Institutional/Lodging", "Infill"], rate: { numerator: 124, denominator: 1 } },
    { values: ["Office/Institutional/Lodging", "Core"], rate: { numerator: 108, denominator: 1 } },
    { values: ["Customer-Oriented Low", "Rural"], rate: { numerator: 131, denominator: 1 } },
    { values: ["Customer-Oriented Low", "New Growth"], rate: { numerator: 131, denominator: 1 } },
    { values: ["Customer-Oriented Low", "Infill"], rate: { numerator: 111, denominator: 1 } },
    { values: ["Customer-Oriented Low", "Core"], rate: { numerator: 97, denominator: 1 } },
    { values: ["Customer-Oriented Moderate", "Rural"], rate: { numerator: 182, denominator: 1 } },
    { values: ["Customer-Oriented Moderate", "New Growth"], rate: { numerator: 182, denominator: 1 } },
    { values: ["Customer-Oriented Moderate", "Infill"], rate: { numerator: 153, denominator: 1 } },
    { values: ["Customer-Oriented Moderate", "Core"], rate: { numerator: 133, denominator: 1 } },
    { values: ["Customer-Oriented High", "Rural"], rate: { numerator: 312, denominator: 1 } },
    { values: ["Customer-Oriented High", "New Growth"], rate: { numerator: 312, denominator: 1 } },
    { values: ["Customer-Oriented High", "Infill"], rate: { numerator: 264, denominator: 1 } },
    { values: ["Customer-Oriented High", "Core"], rate: { numerator: 230, denominator: 1 } },
  ],
};

export const OKC_IMPACT_RULES: FeeRuleRecord[] = [
  okcRule(OKC_IMPACT_SOURCE_KEY, OKC_IMPACT_EFFECTIVE_FROM, {
    id: "okc-impact-streets",
    code: "IMPACT-STREETS",
    label: "Streets development fee — land-use rate per square foot, by assessment area",
    description:
      '"The fee is determined by multiplying the total building square footage (excluding porches and garages) by the appropriate per-square-foot fee from the table" — six land-use categories by four streets assessment areas (Rural, New Growth, Infill, Core), collected when a building permit is issued. The rate is the published table itself: both custom.land_use_category and custom.streets_assessment_area must be supplied, and the City directs applicants to the Plan Review Office to confirm the category.',
    feeType: "percent",
    componentType: "other",
    config: {
      basis: "square_footage",
      rateUnit: "currency_per_unit",
      rateTables: [STREETS_TABLE],
    },
    conditions: all(
      { field: "custom.land_use_category", op: "exists" },
      { field: "custom.streets_assessment_area", op: "exists" },
    ),
  }),
  okcRule(OKC_IMPACT_SOURCE_KEY, OKC_IMPACT_EFFECTIVE_FROM, {
    id: "okc-impact-parks",
    code: "IMPACT-PARKS",
    label: "Parks development fee — $0.53 per square foot, residential development only",
    description:
      '"Parks development fees are only charged for residential development like single-family homes, apartments and assisted living centers. The fee is determined by multiplying the total building square footage (excluding porches, garages and patios) by 53 cents." Residential in the schedule\'s own word, so the rule reads the same land-use category the streets table does and answers only for its Residential row; the 38% local-park waiver and the private-park exemption are credits with their own application process and are named, not modelled.',
    feeType: "percent",
    componentType: "other",
    config: {
      basis: "square_footage",
      rate: { numerator: 53, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: { field: "custom.land_use_category", op: "eq", value: "Residential" },
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical — Title 18                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The four branch regimes and the catch-all, gated by the schedule's own scope
 * words. The amperage add-ons all measure from 200 — the base fee's own
 * parenthetical — and round the excess up to whole hundreds, "or portion
 * thereof". Rough and final are schedule lines for the inspections the permit
 * requires, so they are inspection components rather than base.
 */
const ELEC_RES_NEW = all(RESIDENTIAL, NEW_WORK, NOT_STANDALONE);
const ELEC_COMM_NEW = all(NOT_RESIDENTIAL, { field: "work_type", op: "eq", value: "new_construction" }, NOT_STANDALONE);

export const OKC_ELECTRICAL_RULES: FeeRuleRecord[] = [
  /* § 60-18-14 — residential new construction */
  okcRule(T18, FY26, {
    id: "okc-elec-res-new-base",
    code: "ELEC-RES-NEW-BASE",
    label: "Residential new construction — base $175.00 (service up to 200 amps, 240V single phase)",
    description:
      '"Residential new construction ... $175.00" (2026 column; the FY2025-26 column said $164.90) — the base covering a 240-volt single-phase service up to 200 amps, which is where the add-on row measures from. The inspection pair rides with it, below.',
    feeType: "flat",
    config: { amountCents: 17_500 },
    conditions: ELEC_RES_NEW,
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-res-new-amps",
    code: "ELEC-RES-NEW-AMPS",
    label: "Residential new construction — $50.00 per each additional 100 amps over 200, or portion",
    description:
      '"plus $50.00 for each additional 100 amps or portion thereof" over the 200 amps the base covers. The excess is rounded up to whole hundreds — 350 amps is two additional hundreds, $100.00 — at fifty cents per ampere.',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 50, denominator: 1 },
      rateUnit: "currency_per_unit",
      thresholdCents: 200,
      incrementCents: 100,
    },
    conditions: ELEC_RES_NEW,
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-res-new-rough",
    code: "ELEC-RES-NEW-ROUGH",
    label: "Residential new construction — rough inspection $50.00",
    description: '"plus, for required inspection: rough $50.00" (§ 60-18-14) — a schedule line for an inspection the permit requires, charged with the permit.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    componentType: "inspection",
    conditions: ELEC_RES_NEW,
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-res-new-final",
    code: "ELEC-RES-NEW-FINAL",
    label: "Residential new construction — final inspection $50.00",
    description: '"plus, for required inspection: final $50.00" (§ 60-18-14). The partial-rough row ("slab, wall, service, etc.") is conditional on a stage the input does not know and is named rather than charged.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    componentType: "inspection",
    conditions: ELEC_RES_NEW,
  }),

  /* § 60-18-16 — residential add-on / remodel / service */
  okcRule(T18, FY26, {
    id: "okc-elec-res-addon",
    code: "ELEC-RES-ADDON",
    label: "Residential add-on or remodel, no service change — $100.00",
    description:
      '"Add-on with no service change ... $100.00" (2026 column; the FY2025-26 column is recorded in the research record and charged nowhere). The scope\'s own "no service change" is a condition: select the service row instead when the service changes.',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: all(RESIDENTIAL, rowFact("electrical_add_on"), not(rowFact("service_change")), NOT_STANDALONE),
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-res-service",
    code: "ELEC-RES-SERVICE",
    label: "Residential service change — $100.00 up to 200 amps",
    description: '"Service charge up to 200 amps ... $100.00" (§ 60-18-16, 2026 column) — the base; the add-on row below prices what sits above 200.',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: all(RESIDENTIAL, rowFact("service_change"), NOT_STANDALONE),
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-res-service-amps",
    code: "ELEC-RES-SERVICE-AMPS",
    label: "Residential service change — $50.00 per each additional 100 amps over 200, or portion",
    description: '"+ $50.00 per additional 100 amps or portion" over 200 — the same round-up to whole hundreds as the new-construction row, fifty cents per ampere.',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 50, denominator: 1 },
      rateUnit: "currency_per_unit",
      thresholdCents: 200,
      incrementCents: 100,
    },
    conditions: all(RESIDENTIAL, rowFact("service_change"), NOT_STANDALONE),
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-res-temp",
    code: "ELEC-RES-TEMP-SERVICE",
    label: "Residential temporary construction service — $75.00",
    description: '"Temporary construction service ... $75.00" (§ 60-18-16, 2026 column).',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: all(RESIDENTIAL, rowFact("temp_construction_service"), NOT_STANDALONE),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-res-meter-base",
    code: "ELEC-RES-METER-BASE",
    label: "Residential meter base inspection — $50.00",
    description: '"Meter base inspection $50.00" (§ 60-18-16).',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: all(RESIDENTIAL, rowFact("meter_base"), NOT_STANDALONE),
  }),

  /* §§ 60-18-20 / 60-18-22 — commercial new construction, split at 4,000 sq ft */
  okcRule(T18, ORD, {
    id: "okc-elec-comm-new-small-base",
    code: "ELEC-COMM-NEW-SMALL-BASE",
    label: "Commercial new construction under 4,000 sq ft — base $67.00",
    description: '"Commercial new construction ... under 4,000 square feet ... $67.00" (§ 60-18-20). The 4,000 sq ft seam is a condition on the project\'s own area; a project whose area is not stated falls to this side so the base is never silently free.',
    feeType: "flat",
    config: { amountCents: 6_700 },
    conditions: all(ELEC_COMM_NEW, UNDER_4000),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-new-small-amps",
    code: "ELEC-COMM-NEW-SMALL-AMPS",
    label: "Commercial new construction under 4,000 sq ft — $40.50 per each additional 100 amperes over 200, or portion",
    description: '"+ $40.50 per 100 amperes or portion over 200" — forty and a half cents per ampere, rounded up to whole hundreds above 200.',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 81, denominator: 2 },
      rateUnit: "currency_per_unit",
      thresholdCents: 200,
      incrementCents: 100,
    },
    conditions: all(ELEC_COMM_NEW, UNDER_4000),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-new-small-rough",
    code: "ELEC-COMM-NEW-SMALL-ROUGH",
    label: "Commercial new construction under 4,000 sq ft — rough $20.50",
    description: '"rough $20.50" (§ 60-18-20\'s inspection pair).',
    feeType: "flat",
    config: { amountCents: 2_050 },
    componentType: "inspection",
    conditions: all(ELEC_COMM_NEW, UNDER_4000),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-new-small-final",
    code: "ELEC-COMM-NEW-SMALL-FINAL",
    label: "Commercial new construction under 4,000 sq ft — final $27.00",
    description: '"final $27.00" (§ 60-18-20\'s inspection pair).',
    feeType: "flat",
    config: { amountCents: 2_700 },
    componentType: "inspection",
    conditions: all(ELEC_COMM_NEW, UNDER_4000),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-new-large-base",
    code: "ELEC-COMM-NEW-LARGE-BASE",
    label: "Commercial new construction 4,000 sq ft or more — base $221.00",
    description: '"4,000 square feet or more ... $221.00" (§ 60-18-22).',
    feeType: "flat",
    config: { amountCents: 22_100 },
    conditions: all(ELEC_COMM_NEW, OVER_4000),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-new-large-amps",
    code: "ELEC-COMM-NEW-LARGE-AMPS",
    label: "Commercial new construction 4,000 sq ft or more — $103.50 per each additional 100 amperes over 200, or portion",
    description: '"+ $103.50 per 100 amperes or portion over 200" — a dollar and three cents per ampere, rounded up to whole hundreds above 200: 400 amps is two additional hundreds, $207.00.',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 207, denominator: 2 },
      rateUnit: "currency_per_unit",
      thresholdCents: 200,
      incrementCents: 100,
    },
    conditions: all(ELEC_COMM_NEW, OVER_4000),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-new-large-rough",
    code: "ELEC-COMM-NEW-LARGE-ROUGH",
    label: "Commercial new construction 4,000 sq ft or more — rough $22.50",
    description: '"rough $22.50" (§ 60-18-22\'s inspection pair).',
    feeType: "flat",
    config: { amountCents: 2_250 },
    componentType: "inspection",
    conditions: all(ELEC_COMM_NEW, OVER_4000),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-new-large-final",
    code: "ELEC-COMM-NEW-LARGE-FINAL",
    label: "Commercial new construction 4,000 sq ft or more — final $25.50",
    description: '"final $25.50" (§ 60-18-22\'s inspection pair).',
    feeType: "flat",
    config: { amountCents: 2_550 },
    componentType: "inspection",
    conditions: all(ELEC_COMM_NEW, OVER_4000),
  }),

  /* § 60-18-24 — commercial add-on / service change */
  okcRule(T18, ORD, {
    id: "okc-elec-comm-addon-small",
    code: "ELEC-COMM-ADDON-SMALL",
    label: "Commercial add-on under 4,000 sq ft — $93.00",
    description: '"Add-on ... under 4,000 square feet ... $93.00" (§ 60-18-24(a)). The area seam answers the same way it does on new construction; an unstated area falls to this side.',
    feeType: "flat",
    config: { amountCents: 9_300 },
    conditions: all(NOT_RESIDENTIAL, rowFact("electrical_add_on"), UNDER_4000, NOT_STANDALONE),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-addon-large",
    code: "ELEC-COMM-ADDON-LARGE",
    label: "Commercial add-on 4,000 sq ft or more — $201.00",
    description: '"Add-on ... over 4,000 square feet ... $201.00" (§ 60-18-24(a)).',
    feeType: "flat",
    config: { amountCents: 20_100 },
    conditions: all(NOT_RESIDENTIAL, rowFact("electrical_add_on"), OVER_4000, NOT_STANDALONE),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-service",
    code: "ELEC-COMM-SERVICE",
    label: "Commercial service change — $100.00",
    description: '"Service change ... $100.00" (§ 60-18-24(b)). The per-100-amp add-on in (c) prices "service size" — the size added — which is not an input this engine has, so that piece is named rather than priced against total amperage.',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: all(NOT_RESIDENTIAL, rowFact("service_change"), NOT_STANDALONE),
  }),
  okcRule(T18, ORD, {
    id: "okc-elec-comm-temp",
    code: "ELEC-COMM-TEMP-SERVICE",
    label: "Commercial temporary construction service — $75.00",
    description: '"Temporary construction service ... $75.00" (§ 60-18-24(c), 2026 column).',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: all(NOT_RESIDENTIAL, rowFact("temp_construction_service"), NOT_STANDALONE),
  }),

  /* § 60-18-26 — miscellaneous rows (all 2026 column) */
  okcRule(T18, FY26, {
    id: "okc-elec-pool-wiring",
    code: "ELEC-POOL-WIRING",
    label: "Pool wiring — $93.00",
    description: '"Pool wiring ... $93.00" (§ 60-18-26, 2026 column).',
    feeType: "flat",
    config: { amountCents: 9_300 },
    conditions: rowFact("pool_wiring"),
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-generator",
    code: "ELEC-GENERATOR",
    label: "Generator — $93.00",
    description: '"Generator ... $93.00" (§ 60-18-26, 2026 column).',
    feeType: "flat",
    config: { amountCents: 9_300 },
    conditions: rowFact("generator"),
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-pv",
    code: "ELEC-PV",
    label: "Photovoltaic installation — $120.00",
    description: '"Photovoltaic installations ... $120.00" (§ 60-18-26, 2026 column).',
    feeType: "flat",
    config: { amountCents: 12_000 },
    conditions: rowFact("photovoltaic_system"),
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-low-voltage",
    code: "ELEC-LOW-VOLTAGE",
    label: "Commercial low-voltage — $93.00",
    description: '"Commercial low-voltage ... $93.00" (§ 60-18-26, 2026 column).',
    feeType: "flat",
    config: { amountCents: 9_300 },
    conditions: rowFact("commercial_low_voltage"),
  }),
  okcRule(T18, FY26, {
    id: "okc-elec-sign-service",
    code: "ELEC-SIGN-SERVICE",
    label: "Service for sign — $93.00",
    description: '"Service for sign ... $93.00" (§ 60-18-26, 2026 column). Water-well service, temporary heat, carnival service, booth spaces, after-hours inspection and consultation are named in the research record rather than charged — no input carries their trigger.',
    feeType: "flat",
    config: { amountCents: 9_300 },
    conditions: rowFact("sign_service"),
  }),

  /* § 60-18-12 — the standalone five-outlet permit */
  okcRule(T18, ORD, {
    id: "okc-elec-five-outlets",
    code: "ELEC-FIVE-OUTLETS",
    label: "Five outlets or less, no service change — $100.00",
    description:
      '"Five outlets or less, unrelated to building permits and requiring no change in service ... $100.00" (§ 60-18-12) — both occupancy classes print the same 2026 figure. Its own scope words ("unrelated to building permits") make it exclusive: while it is set, the branch regimes above stand down.',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: rowFact("five_outlets_standalone"),
  }),

  /* § 60-18-27 — the state line for this trade */
  okcRule(T18, ORD, {
    id: "okc-elec-oucc",
    code: "ELEC-OUCC",
    label: "Oklahoma Uniform Building Code Commission collection fee — $0.50 per permit",
    description:
      '"Administrative Collection Fee, per permit ..... $0.50" (§ 60-18-27) — the same 59 O.S. § 1000.25 line as Title 12, repeated for the electrical schedule. The 2.7 percent card service fee the same section imposes is a property of the payment channel and is named, not charged.',
    feeType: "flat",
    config: { amountCents: 50 },
    componentType: "state_surcharge",
    conditions: null,
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing — Title 42                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Three schedules split by the sections' own scope words. The
 * one-/two-family switch is `custom.one_two_family`, the fact Cleveland's
 * ladder established: § 60-42-6's scope is one- and two-family dwellings and
 * condominiums, § 60-42-9 excludes exactly that class — so the exclusion
 * defines the other side, and multifamily prices in the commercial section.
 */
const ONE_TWO_FAMILY: FeeCondition = { field: "custom.one_two_family", op: "eq", value: true };
const NOT_ONE_TWO_FAMILY: FeeCondition = { field: "custom.one_two_family", op: "neq", value: true };

const PL_RES_NEW = all(ONE_TWO_FAMILY, NEW_WORK);
const PL_RES_ALTER = all(
  ONE_TWO_FAMILY,
  { field: "work_type", op: "in", value: ["alteration", "remodel", "repair", "replacement", "addition"] },
);
const PL_COMM = all(
  NOT_ONE_TWO_FAMILY,
  {
    field: "work_type",
    op: "in",
    value: ["new_construction", "addition", "alteration", "remodel", "repair", "replacement"],
  },
);

export const OKC_PLUMBING_RULES: FeeRuleRecord[] = [
  /* § 60-42-6 — residential new construction */
  okcRule(T42, ORD, {
    id: "okc-pl-res-new-base",
    code: "PL-RES-NEW-BASE",
    label: "1–2 family new construction — base $83.00 (all fixtures integral to the structure)",
    description:
      '"Residential new construction ... $83.00" — "all fixtures integral to the structure" are inside this base (§ 60-42-6), which is why the fixture rows below exist only on the other two schedules.',
    feeType: "flat",
    config: { amountCents: 8_300 },
    conditions: PL_RES_NEW,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-res-new-bathrooms",
    code: "PL-RES-NEW-BATHROOMS",
    label: "1–2 family new construction — $28.50 for each bathroom more than one",
    description:
      '"+ $28.50 for each bathroom more than one (or part thereof)" — the first bathroom is inside the base, every bathroom after the first counts at $28.50. custom.bathrooms is the count the rule reads.',
    feeType: "per_unit",
    config: { unit: "bathrooms", centsPerUnit: 2_850, thresholdUnits: 1 },
    conditions: PL_RES_NEW,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-res-new-water",
    code: "PL-RES-NEW-WATER",
    label: "1–2 family new construction — $15.00 per water service",
    description: '"+ $15 per water and sewer service" (§ 60-42-6) — the water half of the pair, on custom.water_service_connections.',
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 1_500 },
    conditions: PL_RES_NEW,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-res-new-sewer",
    code: "PL-RES-NEW-SEWER",
    label: "1–2 family new construction — $15.00 per sewer service",
    description: '"$15 per water and sewer service" (§ 60-42-6) — the sewer half, on custom.connections. A house with both laterals therefore pays the pair, $30.00.',
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 1_500 },
    conditions: PL_RES_NEW,
  }),

  /* § 60-42-7 — residential addition or replacement */
  okcRule(T42, FY26, {
    id: "okc-pl-res-alter-base",
    code: "PL-RES-ALTER-BASE",
    label: "1–2 family alteration or addition — base $84.00",
    description:
      '"Alteration base $84.00" (2026 column; the FY2025-26 column said $78.40) — "required when alteration or addition is sufficient to require a building permit" (§ 60-42-7), so the base exists whenever the job has a building permit at all.',
    feeType: "flat",
    config: { amountCents: 8_400 },
    conditions: PL_RES_ALTER,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-res-alter-fixtures",
    code: "PL-RES-ALTER-FIXTURES",
    label: "1–2 family alteration — $7.00 per appliance or fixture requiring connection",
    description: '"+ $7.00 per appliance or fixture requiring connection" (§ 60-42-7).',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 700 },
    conditions: PL_RES_ALTER,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-res-alter-water",
    code: "PL-RES-ALTER-WATER",
    label: "1–2 family alteration — $25.50 per water connection",
    description: '"+ $25.50 per water or sewer connection" (§ 60-42-7) — the water half.',
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 2_550 },
    conditions: PL_RES_ALTER,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-res-alter-sewer",
    code: "PL-RES-ALTER-SEWER",
    label: "1–2 family alteration — $25.50 per sewer connection",
    description: '"$25.50 per water or sewer connection" (§ 60-42-7) — the sewer half. Line extensions over ten feet are $100 each (2026 column) — a count of lines this engine has no kind for, recorded rather than flattened.',
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 2_550 },
    conditions: PL_RES_ALTER,
  }),

  /* § 60-42-9 — everything except one- and two-family dwellings and condominiums */
  okcRule(T42, FY26, {
    id: "okc-pl-comm-base",
    code: "PL-COMM-BASE",
    label: "Commercial, multifamily, addition or replacement — base $120.00",
    description:
      '"Commercial new construction, addition, or replacement ... $120.00" (2026 column) — scoped "all structures except one-and-two-family dwellings and condominiums" (§ 60-42-9), so the section\'s own exclusion is what makes multifamily price here instead of under § 60-42-6.',
    feeType: "flat",
    config: { amountCents: 12_000 },
    conditions: PL_COMM,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-comm-fixtures",
    code: "PL-COMM-FIXTURES",
    label: "Commercial — $7.00 per fixture",
    description: '"+ $7 per fixture" (§ 60-42-9).',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 700 },
    conditions: PL_COMM,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-comm-water",
    code: "PL-COMM-WATER",
    label: "Commercial — $25.50 per water service connection",
    description: '"+ $25.50 per service connection" (§ 60-42-9) — the water half.',
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 2_550 },
    conditions: PL_COMM,
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-comm-sewer",
    code: "PL-COMM-SEWER",
    label: "Commercial — $25.50 per sewer service connection",
    description: '"$25.50 per service connection" (§ 60-42-9) — the sewer half, so a job with both laterals pays the pair.',
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 2_550 },
    conditions: PL_COMM,
  }),

  /* § 60-42-10 — special plumbing fees */
  okcRule(T42, ORD, {
    id: "okc-pl-dishwasher",
    code: "PL-DISHWASHER",
    label: "Commercial dishwasher — $15.00",
    description: '"Commercial dishwasher ... $15.00" (§ 60-42-10).',
    feeType: "flat",
    config: { amountCents: 1_500 },
    conditions: rowFact("commercial_dishwasher"),
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-interceptor",
    code: "PL-INTERCEPTOR",
    label: "Garage grit or grease interceptor — $15.00 each",
    description: '"Garage grit or grease interceptor ... $15.00 each" (§ 60-42-10) — a count of devices, priced per interceptor.',
    feeType: "per_unit",
    config: { unit: "grease_interceptors", centsPerUnit: 1_500 },
    conditions: { field: "custom.grease_interceptors", op: "gt", value: 0 },
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-garbage-disposal",
    code: "PL-GARBAGE-DISPOSAL",
    label: "Commercial garbage disposal — $15.00",
    description: '"Commercial garbage disposal ... $15.00" (§ 60-42-10).',
    feeType: "flat",
    config: { amountCents: 1_500 },
    conditions: rowFact("commercial_garbage_disposal"),
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-sprinkler",
    code: "PL-YARD-SPRINKLER",
    label: "Yard sprinkler system — $30.00",
    description: '"Yard sprinkler system ... $30.00" (§ 60-42-10).',
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: rowFact("yard_sprinkler"),
  }),
  okcRule(T42, ORD, {
    id: "okc-pl-fire-yard-line",
    code: "PL-FIRE-YARD-LINE",
    label: "Fire protection yard line — $100.00",
    description:
      '"Fire protection yard line ... $100.00" (§ 60-42-10). The washing-machine tiers, carwash, slaughterhouse traps, building-move alteration, consultation and after-hours inspection are named in the research record rather than charged — no input carries their trigger.',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: rowFact("fire_protection_yard_line"),
  }),

  /* § 60-42-11 — the state line for this trade */
  okcRule(T42, ORD, {
    id: "okc-pl-oucc",
    code: "PL-OUCC",
    label: "Oklahoma Uniform Building Code Commission collection fee — $0.50 per permit",
    description:
      '"Administrative Collection Fee, per permit ..... $0.50" (§ 60-42-11) — the same 59 O.S. § 1000.25 line as Titles 12 and 18. Contractor registration ($100/yr) and the outside-of-city travel fee are licensing and event rows, recorded in the research record.',
    feeType: "flat",
    config: { amountCents: 50 },
    componentType: "state_surcharge",
    conditions: null,
  }),
];
