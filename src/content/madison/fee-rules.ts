import type {
  ExactRate,
  FeeCondition,
  FeeRuleRecord,
  PercentFeeConfig,
  RateTable,
} from "@/lib/calc/types";

/**
 * Madison, Wisconsin fee rules — REAL DATA.
 *
 * Sources (research/wisconsin/madison.md records how each was read):
 *
 *  S1  Building Inspection Fees — the division's own page, the schedule a filer
 *      actually reads. Read 2026-09-25. Restates all three ordinances as one
 *      four-column table (Building / Electricity / Plumbing / HVAC) with a Total
 *      column, and adds the MGO 28.206 zoning review fee and the State charges.
 *      https://www.cityofmadison.com/development-services-center/fees/building-inspection-fees
 *  S2  MGO Ch. 29 "Building Code", repealed and recreated by ORD-21-00024,
 *      passed 2021-03-16, effective 2021-03-27 — §29.09 FEE SCHEDULE, the
 *      operative building fee: the three use groups, Group IV alterations,
 *      §29.09(2)(b)'s measurement rule, §29.09(2)(c)'s cap, and the plan review
 *      table at §29.09(3)(b).
 *      https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074843/pdf
 *  S3  MGO Ch. 18 "Plumbing Code", ORD-21-00025, same dates — §18.09 PLUMBING
 *      PERMIT FEE SCHEDULE, plus §18.06 (plumber's licence), §18.07(3)(b) (plan
 *      examination by SPS 302.64) and §18.08 (application).
 *      https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074844/pdf
 *  S4  MGO Ch. 19 "Electrical Code", ORD-21-00026, same dates — §19.11 ELECTRIC
 *      PERMIT FEE SCHEDULE, plus §19.08 (licence required) and §19.09 (permit
 *      required, and what counts as minor repair work).
 *      https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/50000/1074846/pdf
 *
 * **The mechanism, in three sentences.** Madison prices a *new building or
 * addition* from the building's square footage three times over — once for the
 * building permit, once for the electrical permit and once for the plumbing
 * permit — with the rate chosen by a use group the three codes define
 * identically: $.10 / $.18 / $.12 for the building, $.09 / $.11 / $.06 for
 * electrical, $.09 / $.10 / $.06 for plumbing, each with a $25.00 minimum. Work
 * that is *not* new construction falls out of the groups into Group IV and is
 * priced by what the work is: $11.00 for each $1,000 of value or fraction of it
 * for alterations to an existing structure, $25.00 for the first ten electrical
 * openings plus $1.00 each one after, and $8.00 a plumbing fixture. Plan review
 * is a fourth charge on top, from its own table, and it carries the State's
 * money with it — the DSPS State Seal fee and the SPS tables, neither of which
 * is readable from this environment and neither of which is modelled.
 *
 * **The one fact the whole schedule turns on** is `custom.fee_group`. The groups
 * cross occupancy — Group I holds one- and two-family houses *and* R-2/R-3/R-4
 * apartment space, Group II holds hotels as well as offices — so no `occupancy`
 * fact derives them. A calculation that supplies it is new construction and
 * prices from area; a calculation that does not, and whose `work_type` is an
 * alteration, remodel, repair or replacement, prices from Group IV. The two
 * regimes can never both fire, which is the same switch the ordinances use when
 * they define the groups as "new construction and any additions" against "all
 * alterations and repairs to existing structures".
 *
 * **What is deliberately NOT here:**
 *
 *  - **The State's money.** MGO 29.09(3)(b) collects, beside the City's plan
 *    review fee, the "State Seal fee as charged by Department of Safety and
 *    Special Services (DSPS)" and "plan review fees as prescribed by SPS
 *    302.31(1)(g) in Table 302.31-3"; MGO 18.07(3)(b) sends plumbing plan
 *    examination to "SPS 302.64, Table 302.64-1". `docs.legis.wisconsin.gov`
 *    answered no request from this environment on 2026-09-25, so no figure from
 *    those tables appears anywhere in this module. The City's own fee page
 *    prints the first citation corrupted, as "SPS 3031(1)(g) in Table 3031-3";
 *    the ordinance prints it correctly and is what the pages quote.
 *  - **The HVAC column** ($.09 / $.11 / $.06 a square foot on new work,
 *    replacement heating equipment $25 / $50 / $75 by BTU, an air-conditioning
 *    unit $25.00, a ductless split or wall pack $25.00), and every other Group IV
 *    row MGO 29.09(3)(a) publishes: accessory buildings at $.06 a square foot,
 *    awnings, tents, pools, moving a structure, the four razing rows, solar
 *    panels, certificates of occupancy, mobile homes and the erosion control fee.
 *    Madison's third page here is plumbing, so those are documented rather than
 *    modelled — and named in the profile's `notIncluded` rather than left out.
 *  - **The alteration cap.** MGO 29.09(2)(c): "In no case shall the fee exceed
 *    those as calculated for new buildings as listed in Section 29.09(3)(a),
 *    MGO, Groups I, II and III." A cap that is a function of a fee this
 *    calculation has not run cannot be a fixed `maximumCents`, so a very large
 *    alteration is *overstated* here, and every page that can produce one says
 *    so.
 *  - **The round-up.** Every Madison table says "Round up all fees to the next
 *    highest dollar". The engine rounds each component once, to the cent, and
 *    the difference is always under one dollar per fee. Named on the pages.
 *  - **Priority Review (double the plan review fee) and Early Start**, the
 *    penalty for work without a permit (double the fees plus $100.00 a day), and
 *    the permit-extension fee of half the original inspection fee.
 *
 * **This module is the single definition of Madison's fee rules.** The seed
 * writes exactly these records and the tests assert against exactly these
 * records.
 */

/** MGO Chapters 18, 19 and 29 were recreated together and took effect together. */
export const MADISON_FEE_EFFECTIVE_FROM = "2021-03-27";

export const MADISON_FEES_PAGE_SOURCE_KEY = "madison-building-inspection-fees-page";
export const MADISON_MGO_29_09_SOURCE_KEY = "madison-mgo-29-09-building-fee-schedule";
export const MADISON_MGO_18_09_SOURCE_KEY = "madison-mgo-18-09-plumbing-fee-schedule";
export const MADISON_MGO_19_11_SOURCE_KEY = "madison-mgo-19-11-electric-fee-schedule";
export const MADISON_PERMITS_PAGE_SOURCE_KEY = "madison-dsc-permits-chart";
export const MADISON_ONLINE_PERMITS_SOURCE_KEY = "madison-online-permits";
export const MADISON_ONE_TWO_FAMILY_SOURCE_KEY = "madison-one-two-family-residential";
export const MADISON_CONTACT_SOURCE_KEY = "madison-building-inspection-contact";

/**
 * "Minimum Fee $25.00" — printed beside every group row of all three
 * inspection-fee tables, and stated once in the City's fee page as a row of its
 * own. It is a floor on each permit, not a shared deductible.
 */
export const MADISON_MINIMUM_FEE_CENTS = 2_500;

/** MGO 29.09(3)(b): "New single family or two family residential buildings — $100.00". */
export const MADISON_PLAN_REVIEW_NEW_1_2_FAMILY_CENTS = 10_000;
/** MGO 29.09(3)(b): "Alteration or Remodel of single family or two family residential buildings — $25.00". */
export const MADISON_PLAN_REVIEW_ALTER_1_2_FAMILY_CENTS = 2_500;
/** MGO 29.09(3)(b): commercial plan review is $.04 per sq. ft., "Minimum Fee $100.00". */
export const MADISON_PLAN_REVIEW_COMMERCIAL_MINIMUM_CENTS = 10_000;

/** The City's fee page: MGO 28.206's zoning review fee is $.03 per sq. ft., minimum $25.00. */
export const MADISON_ZONING_REVIEW_MINIMUM_CENTS = 2_500;

/** MGO 29.09(3)(a) Group IV: "$11.00 for each $1,000 value or fraction thereof". */
export const MADISON_ALTERATION_CENTS_PER_THOUSAND = 1_100;
/** ... which is an increment of $1,000 of valuation, in cents. */
export const MADISON_ALTERATION_INCREMENT_CENTS = 100_000;

/** MGO 19.11 Group IV: "$25.00 first ten (10) openings". */
export const MADISON_ELECTRICAL_OPENING_BASE_CENTS = 2_500;
/** MGO 19.11 Group IV: "$1.00 each additional opening". */
export const MADISON_ELECTRICAL_OPENING_CENTS = 100;
/** MGO 19.11: "Electric Service Replacement — $50.00 per service panel". */
export const MADISON_ELECTRICAL_SERVICE_PANEL_CENTS = 5_000;

/** MGO 18.09 Group IV: "$8.00 per fixture", with its own "Minimum Fee $25.00". */
export const MADISON_PLUMBING_FIXTURE_CENTS = 800;

/* -------------------------------------------------------------------------- */
/* The published rates, as exact fractions                                    */
/* -------------------------------------------------------------------------- */

//
// A `currency_per_unit` rate is stated in **cents** per unit of the basis —
// `formatUnitRate` divides the numerator by 100 to print dollars — so Madison's
// published $.10 a square foot is { 10, 1 }, not { 1, 10 }. Storing the
// schedule's figure as a fraction of a dollar would charge a tenth of a cent a
// square foot and fall through to the $25.00 minimum on every permit.
//
const RATE_0_10: ExactRate = { numerator: 10, denominator: 1 };
const RATE_0_18: ExactRate = { numerator: 18, denominator: 1 };
const RATE_0_12: ExactRate = { numerator: 12, denominator: 1 };
const RATE_0_11: ExactRate = { numerator: 11, denominator: 1 };
const RATE_0_09: ExactRate = { numerator: 9, denominator: 1 };
const RATE_0_06: ExactRate = { numerator: 6, denominator: 1 };
/** The shell and interior rows read "50% of the total fee for that fee group". */
const HALF: ExactRate = { numerator: 1, denominator: 2 };

/* -------------------------------------------------------------------------- */
/* Shared shapes                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The three use groups, as the schedule publishes them: one row per group, read
 * from `custom.fee_group`.
 *
 * Stated as a table rather than as three rules because the table *is* the
 * published structure — it appears identically in MGO 29.09, 18.09 and 19.11
 * with only the amounts changing, and the breakdown then shows the reader which
 * group their building fell into instead of showing a rate they cannot trace.
 *
 * `rateUnit` is set on both the rule and the table: the table's is what the
 * working prints ("$0.10 per sq ft (1)"), the rule's is what the fee-structure
 * prose prints, and a `currency_per_unit` rate read as a fraction would say
 * "10% of square footage".
 */
function feeGroupTable(
  label: string,
  group1: ExactRate,
  group2: ExactRate,
  group3: ExactRate,
): RateTable {
  return {
    label,
    keys: ["custom.fee_group"],
    rateUnit: "currency_per_unit",
    entries: [
      { values: ["1"], rate: group1 },
      { values: ["2"], rate: group2 },
      { values: ["3"], rate: group3 },
    ],
  };
}

function feeGroupConfig(table: RateTable, rateMultiplier?: ExactRate): PercentFeeConfig {
  return {
    basis: "square_footage",
    rateUnit: "currency_per_unit",
    rateTables: [table],
    ...(rateMultiplier === undefined ? {} : { rateMultiplier }),
  };
}

/** A permit that states a fee group is new construction or an addition. */
const NEW_WORK: FeeCondition = { field: "custom.fee_group", op: "exists" };

const SHELL_ONLY: FeeCondition = { field: "custom.shell_only", op: "eq", value: true };
const INTERIOR_BUILD_OUT: FeeCondition = {
  field: "custom.interior_build_out",
  op: "eq",
  value: true,
};

/**
 * Full rate: a fee group, and neither of the two reductions the schedule
 * publishes. Absent facts are false here, so a calculation that simply does not
 * mention a shell or an interior fit-out pays the group rate.
 */
const FULL_SCOPE: FeeCondition = {
  all: [NEW_WORK, { not: { any: [SHELL_ONLY, INTERIOR_BUILD_OUT] } }],
};

/**
 * "When an application is submitted for a property where only the shell of the
 * property is to be completed, the fee will be calculated at 50% of the total
 * fee for that particular fee group" — and the identical sentence in all three
 * chapters for interior work in a shell already permitted.
 */
const HALF_SCOPE: FeeCondition = { all: [NEW_WORK, { any: [SHELL_ONLY, INTERIOR_BUILD_OUT] }] };

/**
 * Group IV: "The use group shall include all alterations and repairs to
 * existing structures."
 *
 * Both halves matter. Without the `work_type` half, a calculation that supplies
 * a fee group and an alteration would be charged twice, once by each regime;
 * without the `fee_group` half, a reader who described a new building but
 * forgot the group would silently be priced as an alteration.
 */
const EXISTING_WORK: FeeCondition = {
  all: [
    { field: "work_type", op: "in", value: ["alteration", "remodel", "repair", "replacement"] },
    { field: "custom.fee_group", op: "absent" },
  ],
};

const NEW_OR_ADDITION: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["new_construction", "addition"],
};

const ALTERATION_OR_REPAIR: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["alteration", "remodel", "repair", "replacement"],
};

/**
 * Plan review's flat rows say "single family or two family residential
 * buildings", and a twelve-unit apartment building is not one — the City's own
 * 1 & 2 Family page defines it as "any building with three or more attached
 * units ... follows the commercial building code". Absent the flag the
 * commercial `$.04 per sq. ft.` row applies, which is the conservative reading
 * of an input the reader has not given.
 */
const ONE_TWO_FAMILY: FeeCondition = {
  field: "custom.single_or_two_family",
  op: "eq",
  value: true,
};

const NOT_ONE_TWO_FAMILY: FeeCondition = {
  not: { field: "custom.single_or_two_family", op: "eq", value: true },
};

function madisonRule(
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
    effectiveFrom: MADISON_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: MADISON_MGO_29_09_SOURCE_KEY,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — MGO 29.09                                               */
/* -------------------------------------------------------------------------- */

/**
 * The building column of the City's table, which is MGO 29.09(3)(a) itself:
 * Group I $.10, Group II $.18, Group III $.12 a square foot, each subject to a
 * $25.00 minimum fee.
 */
export const MADISON_BUILDING_NEW_GROUP: FeeRuleRecord = madisonRule({
  id: "madison-bld-new-group",
  code: "BLD-NEW-GROUP",
  label: "Building permit — new construction or addition, by fee group",
  description:
    "MGO 29.09(3)(a), Inspection Fees, whose header says \"Round up all fees to the next highest dollar\": Group I \"New Residential\" $.10 per sq. ft., Group II \"New Commercial Non Residential\" $.18 per sq. ft., Group III \"New Industrial\" $.12 per sq. ft., each with a Minimum Fee of $25.00. The area is the building's total square footage — the City's page says \"all floor levels, attached garages, porches, balconies and decks\" and MGO 29.09(2)(b) says measurements are \"taken from outside of building at each floor level, including basement\". The group is a use group, not a building type: Group I is one- and two-family housing and R-2/R-3/R-4 space, Group II is A-1 to A-5, B, E, H-1 to H-5, I-1 to I-4, M and R-1, Group III is F-1, F-2, S-1, S-2, U and anything not in Groups I, II and IV. Supply fee_group as 1, 2 or 3.",
  feeType: "percent",
  config: feeGroupConfig(feeGroupTable("Fee group", RATE_0_10, RATE_0_18, RATE_0_12)),
  conditions: FULL_SCOPE,
  minimumCents: MADISON_MINIMUM_FEE_CENTS,
});

/**
 * The shell reduction, on the same table at one half. The ordinance states it
 * as a multiplier on "the total fee for that particular fee group", so it is a
 * multiplier on the published table rather than a second table of halved
 * amounts — the group's own figure stays visible in the working.
 */
export const MADISON_BUILDING_NEW_GROUP_SHELL: FeeRuleRecord = madisonRule({
  id: "madison-bld-new-group-shell",
  code: "BLD-NEW-GROUP-SHELL",
  label: "Building permit — shell-only or interior build-out, half the group fee",
  description:
    "MGO 29.09(3)(a), note to Groups I, II and III: \"When an application is submitted for a property where only the shell of the property is to be completed, the fee will be calculated at 50% of the total fee for that particular fee group. When an application is submitted for construction of the interior of a building where the shell of the building has been previously granted a permit, the fees shall be based on the square footage of that space as a percentage of the entire square footage of the subject building and that fee shall be calculated at 50% of the total fee for that particular fee group.\" Set shell_only or interior_build_out to true. The $25.00 minimum is stated beside the group rate rather than beside the reduction, so half of a small permit still floors at $25.00.",
  feeType: "percent",
  config: feeGroupConfig(
    feeGroupTable("Fee group", RATE_0_10, RATE_0_18, RATE_0_12),
    HALF,
  ),
  conditions: HALF_SCOPE,
  minimumCents: MADISON_MINIMUM_FEE_CENTS,
});

/**
 * Group IV's building row, and the only valuation-based fee in the whole
 * schedule: $11.00 for each $1,000 of value "or fraction thereof", which is what
 * `incrementCents` is for — a $12,400 alteration is thirteen increments, not
 * twelve and a half.
 */
export const MADISON_BUILDING_EXISTING_ALTERATIONS: FeeRuleRecord = madisonRule({
  id: "madison-bld-existing-alterations",
  code: "BLD-EXISTING-ALTERATIONS",
  label: "Building permit — alterations and repairs to existing structures",
  description:
    "MGO 29.09(3)(a) Group IV: \"Alterations and repairs to existing structures — $11.00 for each $1,000 value or fraction thereof, Minimum Fee $25.00.\" The value is the one MGO 29.09(2)(c) defines: \"the actual cost for alterations and repairs to existing buildings, including all labor and material less the cost of real estate and installation of electrical, heating, and plumbing equipment and services\". The same subsection caps the result — \"In no case shall the fee exceed those as calculated for new buildings as listed in Section 29.09(3)(a), MGO, Groups I, II and III\" — and that cap compares this fee against a fee this calculation has not run, so it is not modelled and a very large alteration is overstated here.",
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    centsPerThousand: MADISON_ALTERATION_CENTS_PER_THOUSAND,
    incrementCents: MADISON_ALTERATION_INCREMENT_CENTS,
  },
  conditions: EXISTING_WORK,
  minimumCents: MADISON_MINIMUM_FEE_CENTS,
});

/* -------------------------------------------------------------------------- */
/* Plan review and zoning review — MGO 29.09(3)(b), MGO 28.206               */
/* -------------------------------------------------------------------------- */

export const MADISON_PLAN_REVIEW_NEW_1_2_FAMILY: FeeRuleRecord = madisonRule({
  id: "madison-bld-plan-review-res-new",
  code: "BLD-PLAN-REVIEW-RES-NEW",
  label: "Plan review — new single family or two family residential building, $100.00",
  description:
    "MGO 29.09(3)(b), Plan Review Fees: \"New single family or two family residential buildings — $100.00.\" A flat fee rather than a rate on area, and a separate charge from the permit fee: it is collected when the plans are examined, not when the permit is issued. It is a fee in its own row of the table, so it is not counted toward the $25.00 minimum on the permit.",
  componentType: "plan_review",
  feeType: "flat",
  config: { amountCents: MADISON_PLAN_REVIEW_NEW_1_2_FAMILY_CENTS },
  conditions: { all: [ONE_TWO_FAMILY, NEW_OR_ADDITION] },
  priority: 200,
});

export const MADISON_PLAN_REVIEW_ALTER_1_2_FAMILY: FeeRuleRecord = madisonRule({
  id: "madison-bld-plan-review-res-alter",
  code: "BLD-PLAN-REVIEW-RES-ALTER",
  label: "Plan review — alteration or remodel of a single family or two family building, $25.00",
  description:
    "MGO 29.09(3)(b), Plan Review Fees: \"Alteration or Remodel of single family or two family residential buildings — $25.00.\" A quarter of the new-construction figure, and the same flat charge whether the remodel is a bathroom or a second storey.",
  componentType: "plan_review",
  feeType: "flat",
  config: { amountCents: MADISON_PLAN_REVIEW_ALTER_1_2_FAMILY_CENTS },
  conditions: { all: [ONE_TWO_FAMILY, ALTERATION_OR_REPAIR] },
  priority: 200,
});

export const MADISON_PLAN_REVIEW_NEW: FeeRuleRecord = madisonRule({
  id: "madison-bld-plan-review-new",
  code: "BLD-PLAN-REVIEW-NEW",
  label: "Plan review — commercial building, new, $0.04 per square foot",
  description:
    "MGO 29.09(3)(b), Plan Review Fees: \"Commercial Building New — $.04 per sq. ft., Minimum Fee $100.00\", where the \"Project area includes all spaces bound by outside surfaces of enclosing walls. Fee includes footings and structural, if submitted with the plans.\" This is the row an apartment building takes as well as an office block: the flat $100.00 row is only for single family or two family buildings, and the City's own 1 & 2 Family page puts anything with three or more attached units on the commercial side. The table's header also says \"Round up all fees to the next highest dollar\", which this engine does not do — it rounds to the cent, and the difference is always under a dollar.",
  componentType: "plan_review",
  feeType: "percent",
  config: {
    basis: "square_footage",
    // Cents per square foot: $.04 is { 4, 1 } in this unit.
    rate: { numerator: 4, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: { all: [NOT_ONE_TWO_FAMILY, NEW_OR_ADDITION] },
  minimumCents: MADISON_PLAN_REVIEW_COMMERCIAL_MINIMUM_CENTS,
  priority: 200,
});

export const MADISON_PLAN_REVIEW_ALTER: FeeRuleRecord = madisonRule({
  id: "madison-bld-plan-review-alter",
  code: "BLD-PLAN-REVIEW-ALTER",
  label: "Plan review — commercial alteration or remodeling, $0.04 per square foot",
  description:
    "MGO 29.09(3)(b), Plan Review Fees: \"Commercial Building Alterations & Remodeling — $.04 per sq. ft., Minimum Fee $100.00\", where \"Area includes floor, roof and exterior wall area being altered or remodeled\" — a different area from the permit fee's, and one this site reads from the same square-footage input because the schedule gives it no second measurement to read.",
  componentType: "plan_review",
  feeType: "percent",
  config: {
    basis: "square_footage",
    // Cents per square foot: $.04 is { 4, 1 } in this unit.
    rate: { numerator: 4, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: { all: [NOT_ONE_TWO_FAMILY, ALTERATION_OR_REPAIR] },
  minimumCents: MADISON_PLAN_REVIEW_COMMERCIAL_MINIMUM_CENTS,
  priority: 200,
});

/**
 * The zoning review fee. MGO 28.206 is cited by the City's fee page rather than
 * quoted by it — "requires a review fee of $0.03 /sq. ft. be collected at the
 * time the building permit is issued. Minimum fee of $25.00" — and neither that
 * sentence nor the section names the area it measures, so it is charged against
 * the building's square footage and the assumption is stated here rather than
 * left in the code.
 */
export const MADISON_ZONING_REVIEW: FeeRuleRecord = madisonRule({
  id: "madison-bld-zoning-review",
  code: "BLD-ZONING-REVIEW",
  label: "Zoning review fee, $0.03 per square foot",
  description:
    "The City's Building Inspection fee page: \"Madison General Ordinance 28.206 requires a review fee of $0.03 /sq. ft. be collected at the time the building permit is issued. Minimum fee of $25.00.\" Charged on every building permit, as a fee of its own rather than part of the permit — the page places it after the inspection fees and before the existing-building rows, and the Early Start permit's own note says it \"Includes Zoning fee\", which only reads as a separate charge if it is one. The page does not say which area the $0.03 is measured against; this site charges it against the building's square footage, the area every other per-square-foot row here uses.",
  componentType: "other",
  feeType: "percent",
  // The section itself is quoted by the City's fee page rather than by the
  // ordinance text this pass could reach, so the page is this rule's source.
  sourceId: MADISON_FEES_PAGE_SOURCE_KEY,
  config: {
    basis: "square_footage",
    // Cents per square foot: $.03 is { 3, 1 } in this unit.
    rate: { numerator: 3, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  minimumCents: MADISON_ZONING_REVIEW_MINIMUM_CENTS,
  priority: 300,
});

/* -------------------------------------------------------------------------- */
/* Electrical permits — MGO 19.11                                             */
/* -------------------------------------------------------------------------- */

export const MADISON_ELECTRICAL_NEW_GROUP: FeeRuleRecord = madisonRule({
  id: "madison-elec-new-group",
  code: "ELEC-NEW-GROUP",
  label: "Electrical permit — new construction or addition, by fee group",
  description:
    "MGO 19.11, Electric Permit Fee Schedule: Group I $.09 per sq. ft., Group II $.11 per sq. ft., Group III $.06 per sq. ft., each with a Minimum Fee of $25.00, charged on the same square footage and the same three use groups as the building permit. A new building's electrical permit is therefore an area fee, not a count of devices — Madison does not price new wiring by the outlet.",
  sourceId: MADISON_MGO_19_11_SOURCE_KEY,
  feeType: "percent",
  config: feeGroupConfig(feeGroupTable("Fee group", RATE_0_09, RATE_0_11, RATE_0_06)),
  conditions: FULL_SCOPE,
  minimumCents: MADISON_MINIMUM_FEE_CENTS,
});

export const MADISON_ELECTRICAL_NEW_GROUP_SHELL: FeeRuleRecord = madisonRule({
  id: "madison-elec-new-group-shell",
  code: "ELEC-NEW-GROUP-SHELL",
  label: "Electrical permit — shell-only or interior build-out, half the group fee",
  description:
    "MGO 19.11 carries the same note as MGO 29.09(3)(a): a permit for a property where only the shell is completed, or for interior work in a shell already permitted, \"will be calculated at 50% of the total fee for that particular fee group\". Set shell_only or interior_build_out to true.",
  sourceId: MADISON_MGO_19_11_SOURCE_KEY,
  feeType: "percent",
  config: feeGroupConfig(
    feeGroupTable("Fee group", RATE_0_09, RATE_0_11, RATE_0_06),
    HALF,
  ),
  conditions: HALF_SCOPE,
  minimumCents: MADISON_MINIMUM_FEE_CENTS,
});

/**
 * Group IV's electrical row, and the ordinance's own definition of what is
 * being counted: "Openings include switches, convenience outlets, fixtures, and
 * fixed appliance connections."
 */
export const MADISON_ELECTRICAL_OPENINGS: FeeRuleRecord = madisonRule({
  id: "madison-elec-openings",
  code: "ELEC-OPENINGS",
  label: "Electrical permit — alterations, $25.00 for the first ten openings and $1.00 each after",
  description:
    "MGO 19.11 Group IV, Alterations And Special Fees: \"$25.00 first ten (10) openings, $1.00 each additional opening\", and the same section says what an opening is — \"switches, convenience outlets, fixtures, and fixed appliance connections.\" The first ten are a block rather than ten separate dollars: fifteen openings is $25.00 plus five at $1.00, which is $30.00, and five openings is still $25.00 because it is the block that is priced. The count is supplied as custom.openings.",
  sourceId: MADISON_MGO_19_11_SOURCE_KEY,
  feeType: "per_unit",
  config: {
    unit: "openings",
    baseCents: MADISON_ELECTRICAL_OPENING_BASE_CENTS,
    thresholdUnits: 10,
    centsPerUnit: MADISON_ELECTRICAL_OPENING_CENTS,
  },
  conditions: EXISTING_WORK,
});

export const MADISON_ELECTRICAL_SERVICE_REPLACEMENT: FeeRuleRecord = madisonRule({
  id: "madison-elec-service-replacement",
  code: "ELEC-SERVICE-REPLACEMENT",
  label: "Electric service replacement, $50.00 per service panel",
  description:
    "MGO 19.11: \"Electric Service Replacement — $50.00 per service panel. The fees for a change of location or replacement of equipment on the same premises shall be the same as that for a new installation.\" Priced by the panel rather than by the work around it, and only when the calculation states a panel count: custom.panels is the number of service panels replaced or relocated, and a permit that gives none does not touch the service and must not carry the row.",
  sourceId: MADISON_MGO_19_11_SOURCE_KEY,
  feeType: "per_unit",
  config: { unit: "panels", centsPerUnit: MADISON_ELECTRICAL_SERVICE_PANEL_CENTS },
  conditions: {
    all: [EXISTING_WORK, { field: "custom.panels", op: "gt", value: 0 }],
  },
});

/* -------------------------------------------------------------------------- */
/* Plumbing permits — MGO 18.09                                               */
/* -------------------------------------------------------------------------- */

/**
 * The one cell where the two City sources disagree, charged at the enacted
 * figure.
 *
 * MGO 18.09 prints `$.10 per sq. ft.` for Group II. The Building Inspection fee
 * page prints `$.11/sq. ft.` in the same cell, and its Total column (.51) is
 * built from .11 — while every other cell of that table matches its ordinance
 * exactly, including electrical Group II at .11 next door. No amending file for
 * §18.09 was reachable on 2026-09-25, so the ordinance is the most recent text
 * of the section this pass could read, and a fee has to be fixed by ordinance to
 * be chargeable. The page's figure is named in the rule, in the research record
 * and in an FAQ on the plumbing page rather than resolved by preference.
 */
export const MADISON_PLUMBING_NEW_GROUP: FeeRuleRecord = madisonRule({
  id: "madison-plumb-new-group",
  code: "PLUMB-NEW-GROUP",
  label: "Plumbing permit — new construction or addition, by fee group",
  description:
    "MGO 18.09, Plumbing Permit Fee Schedule: Group I $.09 per sq. ft., Group II $.10 per sq. ft., Group III $.06 per sq. ft., each with a Minimum Fee of $25.00, on the same square footage and the same three use groups as the other two permits. Note the Group II figure: the ordinance enacts $.10 and the City's Building Inspection fee page currently prints $.11 for that cell, with a Total column built from .11. This site charges the enacted $.10 and names the page's $.11 beside it — one call to (608) 266-4551 would settle which the division charges, and until then the disagreement is printed rather than smoothed over.",
  sourceId: MADISON_MGO_18_09_SOURCE_KEY,
  feeType: "percent",
  config: feeGroupConfig(feeGroupTable("Fee group", RATE_0_09, RATE_0_10, RATE_0_06)),
  conditions: FULL_SCOPE,
  minimumCents: MADISON_MINIMUM_FEE_CENTS,
});

export const MADISON_PLUMBING_NEW_GROUP_SHELL: FeeRuleRecord = madisonRule({
  id: "madison-plumb-new-group-shell",
  code: "PLUMB-NEW-GROUP-SHELL",
  label: "Plumbing permit — shell-only or interior build-out, half the group fee",
  description:
    "MGO 18.09 prints the same shell note as the other two chapters: a shell-only permit, or interior work in a shell already permitted, is \"50% of the total fee for that particular fee group\". Set shell_only or interior_build_out to true.",
  sourceId: MADISON_MGO_18_09_SOURCE_KEY,
  feeType: "percent",
  config: feeGroupConfig(
    feeGroupTable("Fee group", RATE_0_09, RATE_0_10, RATE_0_06),
    HALF,
  ),
  conditions: HALF_SCOPE,
  minimumCents: MADISON_MINIMUM_FEE_CENTS,
});

/**
 * Group IV's plumbing row, with the ordinance's own note on what counts as one
 * fixture — a note that is doing real work, because it folds water heaters,
 * softeners, capped future openings and every altered drain run into the same
 * count as a toilet.
 */
export const MADISON_PLUMBING_FIXTURES: FeeRuleRecord = madisonRule({
  id: "madison-plumb-fixtures",
  code: "PLUMB-FIXTURES",
  label: "Plumbing permit — alterations, $8.00 per fixture",
  description:
    "MGO 18.09 Group IV: \"$8.00 per fixture, Minimum Fee $25.00\", for \"all alterations and repairs to existing structures\". The chapter's own note is what makes the count readable: a two-bowl laundry tray, two-bowl kitchen sink, multi-bowl soda fountain or bar fixture \"shall be considered a single fixture\", and so is \"each replacement or alteration to a fixture or appliances ... including ... the replacement of water heaters, water softeners, each plugged or capped openings left for future installation of fixtures, each altered or repaired building sewer, building drain, soil, waste or vent pipes within an existing building\". Three fixtures is $24.00 of fee and pays the $25.00 minimum instead; four is $32.00. Supply the count as fixtures.",
  sourceId: MADISON_MGO_18_09_SOURCE_KEY,
  feeType: "per_unit",
  config: { unit: "fixtures", centsPerUnit: MADISON_PLUMBING_FIXTURE_CENTS },
  conditions: EXISTING_WORK,
  minimumCents: MADISON_MINIMUM_FEE_CENTS,
});

/* -------------------------------------------------------------------------- */
/* The three permit pages                                                     */
/* -------------------------------------------------------------------------- */

export const MADISON_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  MADISON_BUILDING_NEW_GROUP,
  MADISON_BUILDING_NEW_GROUP_SHELL,
  MADISON_BUILDING_EXISTING_ALTERATIONS,
  MADISON_PLAN_REVIEW_NEW_1_2_FAMILY,
  MADISON_PLAN_REVIEW_ALTER_1_2_FAMILY,
  MADISON_PLAN_REVIEW_NEW,
  MADISON_PLAN_REVIEW_ALTER,
  MADISON_ZONING_REVIEW,
];

export const MADISON_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  MADISON_ELECTRICAL_NEW_GROUP,
  MADISON_ELECTRICAL_NEW_GROUP_SHELL,
  MADISON_ELECTRICAL_OPENINGS,
  MADISON_ELECTRICAL_SERVICE_REPLACEMENT,
];

export const MADISON_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  MADISON_PLUMBING_NEW_GROUP,
  MADISON_PLUMBING_NEW_GROUP_SHELL,
  MADISON_PLUMBING_FIXTURES,
];
