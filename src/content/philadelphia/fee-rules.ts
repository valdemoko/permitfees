import type { ExactRate, FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Philadelphia, Pennsylvania fee rules — REAL DATA.
 *
 * Sources (research/pennsylvania/philadelphia.md records how each was read):
 *
 *  S1  Construction Permit Fees, effective January 1, 2025 (PG_012, Rev 2.2026,
 *      released 2026-02-09) — the four-page table L&I publishes, in two columns:
 *      Residential (1 or 2 family) and Other Occupancies. Read 2026-09-25 in both
 *      pdftotext modes, because layout mode mispairs labels with amounts in this
 *      document ("Foundation Only" appears beside "$16.40 per 100 sq. ft.").
 *      https://www.phila.gov/media/20260209092722/PG_012_INF_Summary-of-construction-permit-fees-Eff-1.1.2025-Rev-2.2026.pdf
 *  S2  L&I's fee regulation under Philadelphia Code §§6-301, 9-102 and
 *      4-A-901.15 — "Fees are being increased to an amount equal to or lesser than
 *      the fee as it existed on July 1, 2017, multiplied by the CPI Multiplier
 *      (26.5%) … This new fee schedule shall take effect on January 1, 2025. It
 *      replaces and supersedes the fee schedule promulgated on August 8, 2022."
 *      It pairs each row with its Code citation (A-902.2.1, A-903.2, A-905.3.1…).
 *      https://www.phila.gov/media/20240903113807/li-regs-permit-license-fee-increase-schedule-amendment-2024-09-20.pdf
 *  S5/S6/S7  The City's own service pages — Get a Building / Electrical / Plumbing
 *      Permit — whose Cost blocks publish what the table does not: the filing fee,
 *      the City and State surcharges, record retention and accelerated review.
 *      https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/
 *
 * **The mechanism, in three sentences.** Every Philadelphia permit is a stack of
 * four things: a **filing fee** paid at submission that is nonrefundable *and*
 * credited toward the permit fee — which makes it a floor on that fee rather than
 * a fifth charge — then the **permit fee** from S1's table, then a flat **City
 * surcharge of $3** and **State surcharge of $4.50**. The permit fee itself is
 * priced three different ways by trade: building by **area bands** ("$253 for the
 * first 500 sq. ft.; plus $73 for each additional 100 sq. ft. or fraction
 * thereof"), electrical by **$25 for each $1,000 or fraction of estimated cost**
 * with a published minimum and maximum, and plumbing by **fixture blocks**
 * ("$284 for first 7 fixtures; $25 for each additional fixture"), with one
 * residential column and one column for everything else throughout.
 *
 * **The fact that selects a column** is `custom.single_or_two_family`. S1's two
 * headers are "Residential (1 or 2 family)" and "Other Occupancies" — a building
 * type, not an occupancy class, and no `occupancy` value derives it: a two-family
 * house and a 20-unit apartment building are both "other" only if the reader says
 * so, and the City's own pages call the split "one-or-two-family" throughout.
 * Absent the flag the schedule's other column applies, which charges the larger
 * figure rather than the smaller one.
 *
 * **Two more switches keep regimes apart.** `custom.foundation_only` moves the
 * calculation to the three-tier foundation table and out of every area row;
 * `custom.alteration_by_cost` takes the schedule's published *option* — "Alteration
 * fees may be based on 2% of the cost of construction at request of the applicant
 * (minimum $253)" — and with it the area row is excluded, because the two are
 * alternatives the applicant chooses between, not two charges. On plumbing,
 * `custom.plumbing_activity` names which of the repair rows the job is (only the
 * two rows this module prices: `water_heater` and `fixture_replacement`).
 *
 * **The filing floor is the one rule that is not a row.** L&I prints the filing
 * fee beside the words "nonrefundable and … applied towards the final permit
 * fee", so a $2,000 permit's fee never falls below the $100 already paid. That is
 * a floor on `permit_fee` charged as the shortfall — `feeType: "permit_minimum"`
 * with a `permit_fee < floor` condition, the same construction Manchester uses.
 * It is also what makes Philadelphia's published **$63 electrical minimum**
 * unreachable: the $100 filing floor already exceeds it.
 *
 * **What is deliberately NOT here:**
 *
 *  - **The record retention fee** — "$4 per plan" / "per page larger than 8.5 in.
 *    by 14 in." — which is a count of sheets this calculator does not collect.
 *  - **The development impact tax**, published only as "Fixed values based on
 *    construction and use classification for new construction" and "1% of total
 *    improvement costs for alterations and additions", and only for residential
 *    projects "eligible for a real estate tax abatement". Neither the fixed
 *    values nor the eligibility test is on the page; named, never priced.
 *  - **Accelerated Plan Review** ($2,000 building and foundation, $1,050
 *    electrical and plumbing), an optional service that is explicitly *not*
 *    credited; and **plan review as such**, because L&I publishes no separate
 *    plan review fee — every Cost block lists filing, permit, surcharges, record
 *    retention and the optional acceleration, and nothing else.
 *  - **Zoning permit fees**, which are a separate schedule (PZ_008) and, in the
 *    City's words, are usually bought *before* the building permit.
 *  - **Mechanical and fire suppression**, priced on the same S1 table (2% of
 *    construction value with a $189 minimum; $15.10 a sprinkler head with a $189
 *    minimum). This release's third page is plumbing, so they are transcribed in
 *    the research record and named on the pages.
 *  - **The repair rows that need a count this calculator does not ask for**:
 *    waste/water lines and stacks at "$126 each pipe" ($37 flat for 1-2 family),
 *    house drain/trap/fresh air inlet at $75 ($31), area/roof/storm drains at $75
 *    ($31), and water distribution line replacement at $126. Naming only their
 *    residential halves would publish half a schedule, so all four are named with
 *    their amounts instead.
 *  - **Interior (non-load-bearing) demolition** ($76 for the first 4,000 sq. ft.,
 *    $5 each additional 100) — a different row from complete demolition, selected
 *    by a choice the reader has not stated.
 *  - **The Administrative Services rows** (amended permits, copies, certificates
 *    of occupancy, preliminary review, extensions, reinstatements). S1's layout
 *    and S2's drifting columns do not agree on which amount belongs to which
 *    label, and none of them prices work — so they are recorded, not paired by
 *    guess.
 *  - **Payment surcharges** (credit +2.10%, debit +$3.45), which are payment
 *    methods rather than permit fees.
 *
 * **This module is the single definition of Philadelphia's fee rules.** The seed
 * writes exactly these records and the tests assert against exactly these records.
 */

/** L&I's regulation takes effect January 1, 2025 and supersedes the 2022 schedule. */
export const PHILLY_FEE_EFFECTIVE_FROM = "2025-01-01";

export const PHILLY_FEE_SCHEDULE_SOURCE_KEY = "phila-construction-permit-fees-2025";
export const PHILLY_FEE_SCHEDULE_2026_SOURCE_KEY = "phila-construction-permit-fees-2026-10";
export const PHILLY_FEE_REGULATION_SOURCE_KEY = "phila-li-fee-regulation-2024";
export const PHILLY_FEE_REGULATION_2022_SOURCE_KEY = "phila-li-fee-regulation-2022";
export const PHILLY_BUILDING_PAGE_SOURCE_KEY = "phila-building-permit-page";
export const PHILLY_ELECTRICAL_PAGE_SOURCE_KEY = "phila-electrical-permit-page";
export const PHILLY_PLUMBING_PAGE_SOURCE_KEY = "phila-plumbing-permit-page";
export const PHILLY_FOUNDATION_PAGE_SOURCE_KEY = "phila-foundation-permit-page";
export const PHILLY_FEES_DOCUMENTS_SOURCE_KEY = "phila-li-fees-documents";

/* -------------------------------------------------------------------------- */
/* The published amounts                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The filing fee, from each service page's Cost block: "For one-or-two-family
 * dwellings: $25 / For any other occupancy: $100. This fee is nonrefundable and
 * is applied towards the final permit fee." Electrical and plumbing are both
 * "$100 … nonrefundable and … applied toward the final permit fee".
 */
export const PHILLY_FILING_FEE_1_2_FAMILY_CENTS = 2_500;
export const PHILLY_FILING_FEE_OTHER_CENTS = 10_000;
export const PHILLY_FILING_FEE_TRADE_CENTS = 10_000;

/** Every service page: "City surcharge: $3 per permit." */
export const PHILLY_CITY_SURCHARGE_CENTS = 300;
/** Every service page: "State surcharge: $4.50 per permit." */
export const PHILLY_STATE_SURCHARGE_CENTS = 450;

/** S1: electrical "minimum $63 / maximum $18,975" (§4-A-903.2). */
export const PHILLY_ELECTRICAL_MINIMUM_CENTS = 6_300;
export const PHILLY_ELECTRICAL_MAXIMUM_CENTS = 1_897_500;
/** Electrical page: "Rough-in Permit fee — $150", an optional separate application. */
export const PHILLY_ROUGH_IN_CENTS = 15_000;

/* Area-band building rows: a base plus a rate per 100 sq. ft. or fraction. */
export const PHILLY_AREA_BASE_CENTS = 25_300; // "$253 for the first 500 sq. ft."
export const PHILLY_AREA_THRESHOLD_SQ_FT = 500;
export const PHILLY_AREA_INCREMENT_SQ_FT = 100;

/* Plumbing fixture blocks: a base for the first seven, then a per-fixture rate. */
export const PHILLY_FIXTURE_BLOCK = 7;

/**
 * The alteration-by-cost option: "Alteration fees may be based on 2% of the cost
 * of construction at request of the applicant (minimum $253)."
 */
export const PHILLY_ALTERATION_BY_COST_RATE: ExactRate = { numerator: 2, denominator: 100 };
export const PHILLY_ALTERATION_BY_COST_MINIMUM_CENTS = 25_300;

/* -------------------------------------------------------------------------- */
/* Rates, in cents per unit of the basis                                      */
/* -------------------------------------------------------------------------- */

/** $73 per 100 sq. ft. of band — as a per-square-foot rate, 73 cents. */
const RATE_73_PER_SQ_FT: ExactRate = { numerator: 73, denominator: 1 };
/** $60 per 100 sq. ft. of band. */
const RATE_60_PER_SQ_FT: ExactRate = { numerator: 60, denominator: 1 };
/** $56 per 100 sq. ft. of band. */
const RATE_56_PER_SQ_FT: ExactRate = { numerator: 56, denominator: 1 };
/** $25.30 per 100 sq. ft. — 25.3 cents a square foot, which is why the 10 stays. */
const RATE_25_30_PER_100_SQ_FT: ExactRate = { numerator: 253, denominator: 10 };

/* -------------------------------------------------------------------------- */
/* Conditions — the switches the schedule reads                               */
/* -------------------------------------------------------------------------- */

/** S1's own column header: "Residential (1 or 2 family)". */
const ONE_TWO_FAMILY: FeeCondition = {
  field: "custom.single_or_two_family",
  op: "eq",
  value: true,
};
const NOT_ONE_TWO_FAMILY: FeeCondition = { not: ONE_TWO_FAMILY };

/** The optional foundation-only permit, with its own three-tier table. */
const FOUNDATION_ONLY: FeeCondition = { field: "custom.foundation_only", op: "eq", value: true };
const NOT_FOUNDATION_ONLY: FeeCondition = { not: FOUNDATION_ONLY };

/** The applicant's published option to price an alteration on cost instead of area. */
const ALTERATION_BY_COST: FeeCondition = {
  field: "custom.alteration_by_cost",
  op: "eq",
  value: true,
};
const NOT_ALTERATION_BY_COST: FeeCondition = { not: ALTERATION_BY_COST };

const NEW_CONSTRUCTION: FeeCondition = { field: "work_type", op: "eq", value: "new_construction" };
const ADDITION: FeeCondition = { field: "work_type", op: "eq", value: "addition" };
const NEW_CONSTRUCTION_OR_ADDITION: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["new_construction", "addition"],
};

/**
 * The building page's trigger list: work that "changes the interior or exterior
 * of an existing structure" or "includes major repairs that aren't part of
 * regular maintenance" — alteration, remodel and repair all in one row.
 */
const ALTERATION_LIKE: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["alteration", "remodel", "repair"],
};

/** Plumbing's third category: "Repairs and replacements". */
const REPAIR_OR_REPLACEMENT: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["repair", "replacement"],
};

const DEMOLITION: FeeCondition = { field: "work_type", op: "eq", value: "demolition" };

function plumbingActivity(activity: string): FeeCondition {
  return { field: "custom.plumbing_activity", op: "eq", value: activity };
}

function phillyRule(
  overrides: Pick<
    FeeRuleRecord,
    "id" | "code" | "label" | "description" | "feeType" | "config"
  > &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return {
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: PHILLY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: PHILLY_FEE_SCHEDULE_SOURCE_KEY,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — PG_012 page 1, Philadelphia Code §4-A-902.2             */
/* -------------------------------------------------------------------------- */

/**
 * The other-occupancies column of "Additions and New Construction" — one row for
 * both a new building and an addition, and the row every non-residential project
 * takes. The band is the published structure: a base for the first 500 square
 * feet, then a rate per completed hundred, with the schedule's own "or fraction
 * thereof" on the partial one.
 */
export const PHILLY_BUILDING_NEW_OTHER: FeeRuleRecord = phillyRule({
  id: "philadelphia-bld-new-other",
  code: "BLD-NEW-OTHER",
  label: "Building permit — new construction or addition, other occupancies",
  description:
    "PG_012 (eff. January 1, 2025), Additions and New Construction: \"$253 for the first 500 sq. ft.; plus $73 for each additional 100 sq. ft. or fraction thereof above 500\" under Other Occupancies — the same figure for a new building and for an addition, which is why one row carries both work types. Enacted as Philadelphia Code §4-A-902.2.1 and revised by L&I's fee regulation effective January 1, 2025 (CPI multiplier 26.5% on the July 1, 2017 base: $232 → $253, $67 → $73). The \"or fraction thereof\" is what makes it a band: 1,000 sq ft is $253 + 5 × $73 = $618, and 1,050 sq ft pays the same six steps. Supply square footage; a one-or-two-family dwelling is a different row and is selected by custom.single_or_two_family.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: RATE_73_PER_SQ_FT,
    rateUnit: "currency_per_unit",
    thresholdCents: PHILLY_AREA_THRESHOLD_SQ_FT,
    incrementCents: PHILLY_AREA_INCREMENT_SQ_FT,
    baseCents: PHILLY_AREA_BASE_CENTS,
  },
  conditions: { all: [NEW_CONSTRUCTION_OR_ADDITION, NOT_ONE_TWO_FAMILY, NOT_FOUNDATION_ONLY] },
});

/** The flat residential row: one price for the whole house, whatever its size. */
export const PHILLY_BUILDING_NEW_1_2_FAMILY: FeeRuleRecord = phillyRule({
  id: "philadelphia-bld-new-1-2-family",
  code: "BLD-NEW-1-2-FAMILY",
  label: "Building permit — new one- or two-family dwelling, $1,328 flat",
  description:
    "PG_012, Additions and New Construction: \"If one- or two-family dwelling, then $1,328 flat fee\" for New Construction (§4-A-902.2.1). A flat price rather than the other column's bands — the schedule's single largest concession to residential work, and the reason a 1,600 sq ft house and a 3,600 sq ft house pay the same Philadelphia permit fee. Set custom.single_or_two_family to reach this row; without the flag the $253-plus-$73 bands apply.",
  feeType: "flat",
  config: { amountCents: 132_800 },
  conditions: { all: [NEW_CONSTRUCTION, ONE_TWO_FAMILY, NOT_FOUNDATION_ONLY] },
});

/**
 * An addition to a house is its own row, and it is cheaper per square foot than
 * either a new house ($1,328 flat) or a commercial addition ($253/$73).
 */
export const PHILLY_BUILDING_ADDITION_1_2_FAMILY: FeeRuleRecord = phillyRule({
  id: "philadelphia-bld-addition-1-2-family",
  code: "BLD-ADDITION-1-2-FAMILY",
  label: "Building permit — addition to a one- or two-family dwelling, $75 + $56 per 100 sq. ft.",
  description:
    "PG_012, Additions and New Construction: \"$75 for the first 500 sq. ft.; plus $56 for each additional 100 sq. ft. or fraction thereof above 500\" for a one- or two-family dwelling (§4-A-902.2.1). Note what it is not: a new house is $1,328 flat, an addition to a house is banded like the commercial column at residential rates, and an accessory structure — the schedule lists \"New Accessory Structures or Additions\" on this one row — is priced here too.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: RATE_56_PER_SQ_FT,
    rateUnit: "currency_per_unit",
    thresholdCents: PHILLY_AREA_THRESHOLD_SQ_FT,
    incrementCents: PHILLY_AREA_INCREMENT_SQ_FT,
    baseCents: 7_500,
  },
  conditions: { all: [ADDITION, ONE_TWO_FAMILY, NOT_FOUNDATION_ONLY] },
});

export const PHILLY_BUILDING_ALTER_OTHER: FeeRuleRecord = phillyRule({
  id: "philadelphia-bld-alter-other",
  code: "BLD-ALTER-OTHER",
  label: "Building permit — alteration of an existing building, other occupancies",
  description:
    "PG_012, Alterations and Repairs: \"$253 for the first 500 sq. ft.; plus $60 for each additional 100 sq. ft. over 500\" under Other Occupancies (§4-A-902.2.1). Same shape as the new-construction bands with a smaller rate above the threshold — $60 rather than $73 — because the base is the same $253 and only the increment differs. The applicant may instead elect the 2%-of-cost row (custom.alteration_by_cost), in which case this row does not fire: the two are alternatives, not a stack.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: RATE_60_PER_SQ_FT,
    rateUnit: "currency_per_unit",
    thresholdCents: PHILLY_AREA_THRESHOLD_SQ_FT,
    incrementCents: PHILLY_AREA_INCREMENT_SQ_FT,
    baseCents: PHILLY_AREA_BASE_CENTS,
  },
  conditions: {
    all: [ALTERATION_LIKE, NOT_ONE_TWO_FAMILY, NOT_FOUNDATION_ONLY, NOT_ALTERATION_BY_COST],
  },
});

export const PHILLY_BUILDING_ALTER_1_2_FAMILY: FeeRuleRecord = phillyRule({
  id: "philadelphia-bld-alter-1-2-family",
  code: "BLD-ALTER-1-2-FAMILY",
  label: "Building permit — alteration of a one- or two-family dwelling, $76 + $56 per 100 sq. ft.",
  description:
    "PG_012, Alterations and Repairs: \"$76 for the first 500 sq. ft.; plus $56 for each additional 100 sq. ft. over 500 (includes utility structures)\" for a one- or two-family dwelling (§4-A-902.2.1). The residential alteration row starts $1 higher than the residential addition row ($76 against $75) — two rows that read almost identically and are not the same row, which is why they are separate rules here.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: RATE_56_PER_SQ_FT,
    rateUnit: "currency_per_unit",
    thresholdCents: PHILLY_AREA_THRESHOLD_SQ_FT,
    incrementCents: PHILLY_AREA_INCREMENT_SQ_FT,
    baseCents: 7_600,
  },
  conditions: { all: [ALTERATION_LIKE, ONE_TWO_FAMILY, NOT_FOUNDATION_ONLY, NOT_ALTERATION_BY_COST] },
});

/**
 * The schedule's published election, held behind a flag because it *replaces*
 * the area row rather than adding to it.
 */
export const PHILLY_BUILDING_ALTER_BY_COST: FeeRuleRecord = phillyRule({
  id: "philadelphia-bld-alter-by-cost",
  code: "BLD-ALTER-BY-COST",
  label: "Building permit — alteration priced on 2% of construction cost, at the applicant's request",
  description:
    "PG_012, Alterations and Repairs: \"Alteration fees may be based on 2% of the cost of construction at request of the applicant (minimum $253).\" A published choice, not an add-on: the applicant asks for it and the area row stops applying, which is what custom.alteration_by_cost and the exclusion on the two area rows encode. Supply valuationCents as the cost of construction; below $12,650 the $253 minimum governs, because 2% of $12,650 is $253.",
  feeType: "percent",
  config: {
    basis: "valuation",
    rate: PHILLY_ALTERATION_BY_COST_RATE,
  },
  conditions: { all: [ALTERATION_LIKE, ALTERATION_BY_COST, NOT_FOUNDATION_ONLY] },
  minimumCents: PHILLY_ALTERATION_BY_COST_MINIMUM_CENTS,
});

/**
 * The optional foundation-only permit, as the one bracket table in the schedule:
 * three flat prices by area, stated identically by the table and by the City's
 * service page.
 */
export const PHILLY_BUILDING_FOUNDATION_ONLY: FeeRuleRecord = phillyRule({
  id: "philadelphia-bld-foundation-only",
  code: "BLD-FOUNDATION-ONLY",
  label: "Foundation-only building permit, $253 / $442 / $759 by area",
  description:
    "PG_012, Foundation Only: \"$253 (area up to 500 sq. ft.)\", \"$442 (area between 501 to 2,500 sq. ft.)\", \"$759 (area exceeding 2,500 sq. ft.)\" (§4-A-902.2.4), stated the same way by the City's foundation-only permit page with no occupancy split — \"For foundations 500 sq. ft. or less: $253\" — which is why one table prices both columns. Set custom.foundation_only: this permit lets an owner lay foundations before the building permit exists, and while it is set every area row above is excluded, because they price a different permit.",
  sourceId: PHILLY_FOUNDATION_PAGE_SOURCE_KEY,
  feeType: "tiered_table",
  config: {
    basis: "square_footage",
    tiers: [
      { upToCents: 500, amountCents: 25_300 },
      { upToCents: 2_500, amountCents: 44_200 },
      { upToCents: null, amountCents: 75_900 },
    ],
  },
  conditions: FOUNDATION_ONLY,
});

/**
 * Complete demolition, as a rate per hundred square feet with the published floor
 * and ceiling — the first rule in this dataset whose `maximumCents` is a number
 * the schedule prints.
 */
export const PHILLY_BUILDING_DEMOLITION: FeeRuleRecord = phillyRule({
  id: "philadelphia-bld-demolition",
  code: "BLD-DEMOLITION",
  label: "Building permit — complete demolition, $25.30 per 100 sq. ft.",
  description:
    "PG_012, Demolition: \"General Demolition — $25.30 per 100 sq. ft. or fraction thereof (maximum $50,600; minimum $253)\", one row spanning both columns, with the schedule's own condition printed beside it: \"Separate permit by licensed Demolition Contractor required for complete demolition.\" The \"or fraction thereof\" rounds the area up in hundreds of square feet, the $253 floor binds below 1,000 sq ft, and the $50,600 ceiling binds above 2,000,000 sq ft — a ceiling the schedule states, so it is modelled rather than left open. Interior, non-load-bearing demolition is a different row ($76 for the first 4,000 sq. ft., $5 each additional 100) and is not this one.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: RATE_25_30_PER_100_SQ_FT,
    rateUnit: "currency_per_unit",
    incrementCents: PHILLY_AREA_INCREMENT_SQ_FT,
  },
  conditions: DEMOLITION,
  minimumCents: 25_300,
  maximumCents: 5_060_000,
});

/* -------------------------------------------------------------------------- */
/* Filing-fee floors — the Cost block of each service page                     */
/* -------------------------------------------------------------------------- */

function filingFloorRule(options: {
  permitType: "BLD" | "ELEC" | "PLUMB";
  variant: "1-2" | "OTHER" | "TRADE";
  pageSource: string;
  /** The Cost block's own words, which differ slightly page by page. */
  quote: string;
  /** What the floor is, in the label. */
  floorName: string;
}): FeeRuleRecord {
  const { permitType, variant, pageSource, quote, floorName } = options;
  const floorCents =
    variant === "1-2"
      ? PHILLY_FILING_FEE_1_2_FAMILY_CENTS
      : variant === "OTHER"
        ? PHILLY_FILING_FEE_OTHER_CENTS
        : PHILLY_FILING_FEE_TRADE_CENTS;
  const suffix = variant === "TRADE" ? "" : `-${variant}`;

  return phillyRule({
    id: `philadelphia-${permitType.toLowerCase()}-filing-floor${suffix.toLowerCase()}`,
    code: `${permitType}-FILING-FLOOR${suffix}`,
    label: `Filing fee floor — ${floorName}`,
    description: `The permit page's Cost block: "${quote}" A credit rather than a fifth charge: the money is already inside the permit fee, so this rule charges only the difference when the calculated permit fee comes to less than the filing fee — the shortfall, never the floor a second time. The condition and the amount are one statement in two halves: while the permit fee is below the filing fee the difference is added, and once it is above, the rule does not fire at all.`,
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents },
    conditions: {
      all: [
        { field: "permit_fee", op: "lt", value: floorCents },
        // Only the building page splits the filing fee by occupancy ($25 / $100).
        // The electrical and plumbing pages publish one $100 figure for everyone,
        // so their floor carries no occupancy condition at all.
        ...(variant === "1-2"
          ? [ONE_TWO_FAMILY]
          : variant === "OTHER"
            ? [NOT_ONE_TWO_FAMILY]
            : []),
      ],
    },
    sourceId: pageSource,
    priority: 150,
  });
}

export const PHILLY_BUILDING_FILING_FLOOR_1_2 = filingFloorRule({
  permitType: "BLD",
  variant: "1-2",
  pageSource: PHILLY_BUILDING_PAGE_SOURCE_KEY,
  floorName: "building permit, $25.00 for a one- or two-family dwelling",
  quote:
    "Filing fee — For one-or-two-family dwellings: $25. For any other occupancy: $100. This fee is nonrefundable and is applied towards the final permit fee.",
});
export const PHILLY_BUILDING_FILING_FLOOR_OTHER = filingFloorRule({
  permitType: "BLD",
  variant: "OTHER",
  pageSource: PHILLY_BUILDING_PAGE_SOURCE_KEY,
  floorName: "building permit, $100.00 for any other occupancy",
  quote:
    "Filing fee — For one-or-two-family dwellings: $25. For any other occupancy: $100. This fee is nonrefundable and is applied towards the final permit fee.",
});
export const PHILLY_ELECTRICAL_FILING_FLOOR = filingFloorRule({
  permitType: "ELEC",
  variant: "TRADE",
  pageSource: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
  floorName: "electrical permit, $100.00",
  quote:
    "Filing fee — $100. This fee is nonrefundable. It will be counted toward the final permit fee.",
});
export const PHILLY_PLUMBING_FILING_FLOOR = filingFloorRule({
  permitType: "PLUMB",
  variant: "TRADE",
  pageSource: PHILLY_PLUMBING_PAGE_SOURCE_KEY,
  floorName: "plumbing permit, $100.00",
  quote:
    "Filing fee — $100. This fee is nonrefundable and is applied toward the final permit fee.",
});

/* -------------------------------------------------------------------------- */
/* Surcharges — City $3.00, State $4.50, on every permit                       */
/* -------------------------------------------------------------------------- */

function citySurchargeRule(
  permitType: "BLD" | "ELEC" | "PLUMB",
  pageSource: string,
): FeeRuleRecord {
  return phillyRule({
    id: `philadelphia-${permitType.toLowerCase()}-city-surcharge`,
    code: `${permitType}-CITY-SURCHARGE`,
    label: "City surcharge, $3.00 per permit",
    description:
      "Every L&I service page's Cost block: \"City surcharge: $3 per permit\". Flat, per permit, and outside the permit fee — the City's rough-in standard prints the two surcharges together as \"Surcharges of $7.50 will apply\". It is not in PG_012's table at all, which is why the table's own column totals are $7.50 short of what a filer pays.",
    feeType: "flat",
    config: { amountCents: PHILLY_CITY_SURCHARGE_CENTS },
    componentType: "surcharge",
    sourceId: pageSource,
    priority: 900,
  });
}

function stateSurchargeRule(
  permitType: "BLD" | "ELEC" | "PLUMB",
  pageSource: string,
): FeeRuleRecord {
  return phillyRule({
    id: `philadelphia-${permitType.toLowerCase()}-state-surcharge`,
    code: `${permitType}-STATE-SURCHARGE`,
    label: "State surcharge, $4.50 per permit",
    description:
      "Every L&I service page's Cost block: \"State surcharge: $4.50 per permit\" — a Commonwealth charge the City collects with its own fee, printed beside the City's $3.00 and summed as $7.50 in the rough-in standard. Neither PG_012 nor L&I's fee regulation contains the figure, so the source recorded here is the service page rather than an ordinance this pass could read.",
    feeType: "flat",
    config: { amountCents: PHILLY_STATE_SURCHARGE_CENTS },
    componentType: "state_surcharge",
    sourceId: pageSource,
    priority: 900,
  });
}

/* -------------------------------------------------------------------------- */
/* Electrical permits — PG_012 page 2, Philadelphia Code §4-A-903.2           */
/* -------------------------------------------------------------------------- */

export const PHILLY_ELECTRICAL_PERMIT_FEE: FeeRuleRecord = phillyRule({
  id: "philadelphia-elec-permit-fee",
  code: "ELEC-PERMIT-FEE",
  label: "Electrical permit — $25 per $1,000 or fraction of estimated cost",
  description:
    "§4-A-903.2, as L&I's fee regulation quotes it: \"The permit fee for electrical work shall be $25 for each $1,000 or fraction thereof of estimated electrical construction costs; minimum fee of $63 and maximum fee of $18,975\" — the same three figures the electrical permit page publishes. One row for every occupancy: PG_012 prints the cell spanning both columns, so a house and a warehouse are priced identically here. \"Or fraction thereof\" means $12,400 of cost is thirteen increments and $325.00 of fee, and the published maximum is modelled as the rule's own ceiling: above $759,000 of estimated cost the fee stops at $18,975.",
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    centsPerThousand: 2_500,
    incrementCents: 100_000,
  },
  minimumCents: PHILLY_ELECTRICAL_MINIMUM_CENTS,
  maximumCents: PHILLY_ELECTRICAL_MAXIMUM_CENTS,
});

/**
 * The optional rough-in, held outside `permit_fee` because L&I issues it as its
 * own application ("you must submit a separate application for the rough-in
 * approval").
 */
export const PHILLY_ELECTRICAL_ROUGH_IN: FeeRuleRecord = phillyRule({
  id: "philadelphia-elec-rough-in",
  code: "ELEC-ROUGH-IN",
  label: "Electrical rough-in permit, $150 (optional, separate application)",
  description:
    "PG_012, Electrical Systems: \"Rough-in Permit — $150\", repeated on the electrical permit page as an optional fee type. L&I treats it as its own application rather than a line of the permit: \"You must first submit an application for an Electrical Permit including plans and the associated fees … you must submit a separate application for the rough-in approval\", valid 60 days and only while the work is still visible. Set custom.rough_in to charge it; it is held outside the permit fee so the filing-fee floor measures the permit rather than the two together.",
  feeType: "flat",
  config: { amountCents: PHILLY_ROUGH_IN_CENTS },
  conditions: { field: "custom.rough_in", op: "eq", value: true },
  componentType: "other",
  sourceId: PHILLY_ELECTRICAL_PAGE_SOURCE_KEY,
  priority: 200,
});

/* -------------------------------------------------------------------------- */
/* Plumbing permits — PG_012 pages 3-4, Philadelphia Code §4-A-905.3          */
/* -------------------------------------------------------------------------- */

/**
 * The schedule's general new-work row, which covers a new building of any
 * occupancy. The $50 exception is written for *additions* to one- and two-family
 * homes, not for new ones, so a new house is on this row too.
 */
export const PHILLY_PLUMBING_NEW_CONSTRUCTION: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-new-construction",
  code: "PLUMB-NEW-CONSTRUCTION",
  label: "Plumbing permit — new construction, $284 for seven fixtures then $25 each",
  description:
    "PG_012, Plumbing Systems Installation: \"New Construction — $284 for first 7 fixtures; $25 for each additional fixture above 7\", restated by the plumbing permit page as \"All new construction and additions — $284 for seven fixtures, $25 for each additional fixture\" (§4-A-905.3.1). One row for every occupancy: PG_012 prints it once, spanning the columns. Seven fixtures are inside the base — a new house with ten fixtures is $284 + 3 × $25 = $359 — and the count is the standard `fixtures` input. The residential $50 row applies to additions, not to new construction.",
  feeType: "per_unit",
  config: {
    unit: "fixtures",
    baseCents: 28_400,
    thresholdUnits: PHILLY_FIXTURE_BLOCK,
    centsPerUnit: 2_500,
  },
  conditions: NEW_CONSTRUCTION,
});

export const PHILLY_PLUMBING_ADDITION: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-addition",
  code: "PLUMB-ADDITION",
  label: "Plumbing permit — addition (other occupancies), $284 for seven fixtures then $25 each",
  description:
    "PG_012 and the plumbing permit page both file an addition outside a one- or two-family home under the general row: \"All new construction and additions — $284 for seven fixtures, $25 for each additional fixture\" (§4-A-905.3.1). Identical to the new-construction configuration because the schedule prices them identically; kept as its own rule so the breakdown says which row was read rather than showing a new-construction label on an addition.",
  feeType: "per_unit",
  config: {
    unit: "fixtures",
    baseCents: 28_400,
    thresholdUnits: PHILLY_FIXTURE_BLOCK,
    centsPerUnit: 2_500,
  },
  conditions: { all: [ADDITION, NOT_ONE_TWO_FAMILY] },
});

export const PHILLY_PLUMBING_ADDITION_1_2_FAMILY: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-addition-1-2-family",
  code: "PLUMB-ADDITION-1-2-FAMILY",
  label: "Plumbing permit — addition to a one- or two-family home, $50 for seven fixtures then $22.50",
  description:
    "PG_012: \"$50 for first 7 fixtures associated with additions; $22.50 for each additional fixture above 7\", which the plumbing permit page states as \"Additions to one-or-two-family homes — $50 for seven fixtures, $22.50 for each additional fixture\" (§4-A-905.3.1, Exception 1). The exception exists because a home addition does not carry a whole building's worth of plumbing: five fixtures in an addition is $50 rather than $284.",
  feeType: "per_unit",
  config: {
    unit: "fixtures",
    baseCents: 5_000,
    thresholdUnits: PHILLY_FIXTURE_BLOCK,
    centsPerUnit: 2_250,
  },
  conditions: { all: [ADDITION, ONE_TWO_FAMILY] },
});

export const PHILLY_PLUMBING_ALTERATION: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-alteration",
  code: "PLUMB-ALTERATION",
  label: "Plumbing permit — alteration of an existing building, $189 for seven fixtures then $22.50",
  description:
    "PG_012, Alterations to Existing Buildings: \"$189 for first 7 fixtures; $22.50 for each additional fixture above 7\" under Other Occupancies (§4-A-905.3.2). The plumbing permit page prints this same amount under its Alterations heading — with the row labels of the table above it pasted in by mistake, which is recorded as a needs_review note rather than resolved: the amount is identical in PG_012 and in L&I's fee regulation, so the figure is certain and only the page's label is wrong.",
  feeType: "per_unit",
  config: {
    unit: "fixtures",
    baseCents: 18_900,
    thresholdUnits: PHILLY_FIXTURE_BLOCK,
    centsPerUnit: 2_250,
  },
  conditions: { all: [ALTERATION_LIKE, NOT_ONE_TWO_FAMILY] },
});

export const PHILLY_PLUMBING_ALTERATION_1_2_FAMILY: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-alteration-1-2-family",
  code: "PLUMB-ALTERATION-1-2-FAMILY",
  label: "Plumbing permit — alteration in a one- or two-family home, $50 for seven fixtures then $22.50",
  description:
    "PG_012: \"$50 for first 7 fixtures; $22.50 for each additional fixture above 7\" for a one- or two-family dwelling (§4-A-905.3.2). The same $50 base the addition row carries, so a bathroom remodel and a home addition in a house start at the same figure; only the work type in the input tells them apart, which is the same switch the schedule uses.",
  feeType: "per_unit",
  config: {
    unit: "fixtures",
    baseCents: 5_000,
    thresholdUnits: PHILLY_FIXTURE_BLOCK,
    centsPerUnit: 2_250,
  },
  conditions: { all: [ALTERATION_LIKE, ONE_TWO_FAMILY] },
});

/**
 * The repair rows are one row *per activity*, so `custom.plumbing_activity`
 * names the row and the occupancy column picks the figure.
 */
export const PHILLY_PLUMBING_WATER_HEATER: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-water-heater",
  code: "PLUMB-WATER-HEATER",
  label: "Plumbing permit — water heater replacement, $37 each",
  description:
    "PG_012, Repairs and replacements: \"Water Heater — $37 per water heater\", restated by L&I's fee regulation as \"$37 per water heater; $31 flat fee if one- or two-family dwelling\" (§4-A-905.3.4). Priced by the unit for other occupancies and flat for a house, which is why the residential figure below is a different rule rather than a rate. Set custom.plumbing_activity to \"water_heater\"; the schedule prices each repair activity as its own row, so one calculation names one activity.",
  feeType: "per_unit",
  config: { unit: "heaters", centsPerUnit: 3_700 },
  conditions: { all: [REPAIR_OR_REPLACEMENT, plumbingActivity("water_heater"), NOT_ONE_TWO_FAMILY] },
});

export const PHILLY_PLUMBING_WATER_HEATER_1_2_FAMILY: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-water-heater-1-2-family",
  code: "PLUMB-WATER-HEATER-1-2-FAMILY",
  label: "Plumbing permit — water heater replacement in a one- or two-family home, $31 flat",
  description:
    "L&I's fee regulation: \"$37 per water heater; $31 flat fee if one- or two-family dwelling\" (§4-A-905.3.4), printed in PG_012 as \"$31\" in the residential column. A flat fee rather than a rate — the City's own text says so — so two water heaters in a house are one $31 permit row here, not $62. Set custom.plumbing_activity to \"water_heater\" and custom.single_or_two_family.",
  feeType: "flat",
  config: { amountCents: 3_100 },
  conditions: { all: [REPAIR_OR_REPLACEMENT, plumbingActivity("water_heater"), ONE_TWO_FAMILY] },
});

export const PHILLY_PLUMBING_FIXTURE_REPLACEMENT: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-fixture-replacement",
  code: "PLUMB-FIXTURE-REPLACEMENT",
  label: "Plumbing permit — fixture replacement with no piping, $75 for seven fixtures then $6.30",
  description:
    "PG_012, Repairs and replacements: \"Fixture Replacement (No Piping Work) — $75 for first 7 fixtures; $6.30 for each additional fixture above 7\" under Other Occupancies (§4-A-907.1.1.1 as cited in L&I's regulation, filed with the plumbing rows). A smaller block than the alteration row for the same count, because no piping is being changed: seven swaps are $75, twelve are $106.50. Set custom.plumbing_activity to \"fixture_replacement\"; piping work is an alteration and takes the row above.",
  feeType: "per_unit",
  config: {
    unit: "fixtures",
    baseCents: 7_500,
    thresholdUnits: PHILLY_FIXTURE_BLOCK,
    centsPerUnit: 630,
  },
  conditions: {
    all: [REPAIR_OR_REPLACEMENT, plumbingActivity("fixture_replacement"), NOT_ONE_TWO_FAMILY],
  },
});

export const PHILLY_PLUMBING_FIXTURE_REPLACEMENT_1_2_FAMILY: FeeRuleRecord = phillyRule({
  id: "philadelphia-plumb-fixture-replacement-1-2-family",
  code: "PLUMB-FIXTURE-REPLACEMENT-1-2-FAMILY",
  label: "Plumbing permit — fixture replacement with no piping in a one- or two-family home, $31 flat",
  description:
    "PG_012: \"Fixture Replacement (No Piping Work) — $31\" in the residential column, which L&I's fee regulation prints as \"$75 for first 7 fixtures; $6.30 for each additional fixture; $31 for one- or two-family\" (§4-A-907.1.1.1). The residential figure is flat, not per fixture — \"flat fee\" is the regulation's own phrase on the neighbouring rows of the same block. Set custom.plumbing_activity to \"fixture_replacement\".",
  feeType: "flat",
  config: { amountCents: 3_100 },
  conditions: {
    all: [REPAIR_OR_REPLACEMENT, plumbingActivity("fixture_replacement"), ONE_TWO_FAMILY],
  },
});

/* -------------------------------------------------------------------------- */
/* The three permit pages                                                     */
/* -------------------------------------------------------------------------- */

export const PHILLY_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  PHILLY_BUILDING_NEW_OTHER,
  PHILLY_BUILDING_NEW_1_2_FAMILY,
  PHILLY_BUILDING_ADDITION_1_2_FAMILY,
  PHILLY_BUILDING_ALTER_OTHER,
  PHILLY_BUILDING_ALTER_1_2_FAMILY,
  PHILLY_BUILDING_ALTER_BY_COST,
  PHILLY_BUILDING_FOUNDATION_ONLY,
  PHILLY_BUILDING_DEMOLITION,
  PHILLY_BUILDING_FILING_FLOOR_1_2,
  PHILLY_BUILDING_FILING_FLOOR_OTHER,
  citySurchargeRule("BLD", PHILLY_BUILDING_PAGE_SOURCE_KEY),
  stateSurchargeRule("BLD", PHILLY_BUILDING_PAGE_SOURCE_KEY),
];

export const PHILLY_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  PHILLY_ELECTRICAL_PERMIT_FEE,
  PHILLY_ELECTRICAL_ROUGH_IN,
  PHILLY_ELECTRICAL_FILING_FLOOR,
  citySurchargeRule("ELEC", PHILLY_ELECTRICAL_PAGE_SOURCE_KEY),
  stateSurchargeRule("ELEC", PHILLY_ELECTRICAL_PAGE_SOURCE_KEY),
];

export const PHILLY_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  PHILLY_PLUMBING_NEW_CONSTRUCTION,
  PHILLY_PLUMBING_ADDITION,
  PHILLY_PLUMBING_ADDITION_1_2_FAMILY,
  PHILLY_PLUMBING_ALTERATION,
  PHILLY_PLUMBING_ALTERATION_1_2_FAMILY,
  PHILLY_PLUMBING_WATER_HEATER,
  PHILLY_PLUMBING_WATER_HEATER_1_2_FAMILY,
  PHILLY_PLUMBING_FIXTURE_REPLACEMENT,
  PHILLY_PLUMBING_FIXTURE_REPLACEMENT_1_2_FAMILY,
  PHILLY_PLUMBING_FILING_FLOOR,
  citySurchargeRule("PLUMB", PHILLY_PLUMBING_PAGE_SOURCE_KEY),
  stateSurchargeRule("PLUMB", PHILLY_PLUMBING_PAGE_SOURCE_KEY),
];
