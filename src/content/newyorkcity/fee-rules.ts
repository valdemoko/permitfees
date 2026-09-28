import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * New York City, New York fee rules — REAL DATA.
 *
 * Sources (research/new-york/new-york-city.md records how each was read):
 *
 *  S1  NYC Administrative Code §28-112.2 and Table 28-112.2 — the schedule of permit
 *      fees — read in the City's codifier (American Legal Publishing) with its
 *      amendment history: L.L. 2016/056, L.L. 2021/126, L.L. 2023/077 and L.L. 2024/128.
 *      https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCadmin/0-0-0-156650
 *  S2  Local Law 77 of 2023, the law that printed every alteration and new-building
 *      figure below, as the City publishes it.
 *      https://www.nyc.gov/assets/buildings/local_laws/ll77of2023.pdf
 *  S3  Local Law 128 of 2024, which added row 15.1 (electrical, "as provided by
 *      department rules") and rewrote §§28-112.2.1 and 28-112.2.2 without moving a
 *      single amount.      https://www.nyc.gov/assets/buildings/local_laws/ll128of2024.pdf
 *  S4  1 RCNY §101-03 "Fees Payable to the Department of Buildings" — the electrical
 *      schedule and the records management fee.
 *      https://codelibrary.amlegal.com/codes/newyorkcity/latest/NYCrules/0-0-0-2246
 *  S5  DOB's LAA Fee and Penalties Charts, which reprint two rows of Table 28-112.2 as
 *      a price list. https://www.nyc.gov/site/buildings/industry/laa-fee-charts.page
 *
 * **The mechanism, in three sentences.** New York City prices a *building* on the cost of
 * the work: a minimum filing fee that covers the first $5,000 (or $3,000) of cost, plus
 * $2.60, $10.30 or $17.75 for each further $1,000 or fraction of it, with the base set by
 * the Alteration Type the applicant files and the rate set by how big the building is. A
 * new building that keeps no existing elements is priced on floor area instead — $0.06,
 * $0.26 or $0.45 a square foot, each with its own per-structure minimum. Electrical work
 * is priced by a rule rather than the table: $40 to file, $0 for the first ten units and
 * $0.25 for each one after, and $8 to $375 for a service switch by its ampere band.
 *
 * **Five readings this module depends on, all of them stated on the pages.**
 *
 *  1. **The base charge is the Alteration Type's own minimum.** Row 11 prints four
 *     "Minimum Filing Fee" figures and then one formula; this model charges the type's
 *     minimum as the base for the first $5,000 rather than as a floor under a $130 base.
 *     DOB's own LAA charts settle it for the two types they cover — $130.00 to $5,000 then
 *     $2.60 a step in a house, $195.00 to $3,000 then $10.30 a step elsewhere — because
 *     those are exactly an LAA's minimum, threshold and rate.
 *  2. **The row is chosen by two facts.** `custom.building_category` selects rows 11, 12
 *     and 14/15 by building size; `custom.alteration_type` selects the base inside the
 *     row; `custom.affordable_r2` picks row 13 out of rows 14 and 15, and the two are
 *     mutually exclusive by construction.
 *  3. **Plumbing has no schedule of its own.** §28-112.2 charges plumbing permits per
 *     Table 28-112.2, and a plumbing job is filed as an alteration — or, for the minor
 *     work a Licensed Master Plumber files without plans, as a Limited Alteration
 *     Application, whose DOB charts reproduce rows 11 and 12. The ten alteration rows are
 *     therefore attached to the plumbing permit type as well, with their own ids.
 *  4. **A missing Alteration Type falls into the group whose base it shares.** The
 *     default group of each row is written as `not_in`, which matches an absent fact, so
 *     a reader who supplies a cost and a category still gets a number.
 *  5. **The records management fee is applied to alteration applications.** 1 RCNY
 *     §101-03 authorises $45 for one-, two- or three-family dwellings and $165 otherwise
 *     for "applications for new buildings and alterations"; an LAA is an alteration
 *     application, so the building and plumbing pages carry it and the electrical page
 *     does not.
 *
 * **What is deliberately NOT here:** row 16's service-equipment permits ("as for the
 * respective building alteration"), the renewal at $130 per work type, amendments,
 * reinstatement, the garage, demolition, earthwork, curb cut, sign, sidewalk shed,
 * scaffold, fence and temporary-structure rows; 1 RCNY's parts fees for service entrance
 * cables, panels, signs, elevators and boiler controls, each priced per item by a rating
 * no input here collects; the $5,000 aggregate cap on electrical parts fees, which an
 * aggregate cap cannot be expressed as a per-rule maximum; and every fee FDNY, DEP, DOT
 * and Finance charge beside DOB's. Each amount is named on the page it belongs to.
 *
 * **This module is the single definition of New York City's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records.
 */

/** The date Table 28-112.2's current figures took effect — L.L. 2023/077, as the codifier prints it. */
export const NEW_YORK_CITY_FEE_EFFECTIVE_FROM = "2023-06-11";

/**
 * The date 1 RCNY §101-03's electrical and records figures took effect.
 *
 * The promulgation details for the section print every amendment newest first and then the
 * original rule; the $40, the $0.25 over ten units, the $5,000 cap, the $15 minor-work
 * permit and the $45/$165 records fee appear only in the original text. The section itself
 * was last amended effective 2026-08-13 — for sidewalk sheds — which is why the schedule's
 * notes carry both dates: the section is new, the figures are 2008's.
 */
export const NEW_YORK_CITY_ELECTRICAL_EFFECTIVE_FROM = "2008-07-01";

export const NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY = "nyc-admin-code-28-112-2";
export const NEW_YORK_CITY_LOCAL_LAW_77_SOURCE_KEY = "nyc-local-law-77-2023";
export const NEW_YORK_CITY_LOCAL_LAW_128_SOURCE_KEY = "nyc-local-law-128-2024";
export const NEW_YORK_CITY_RCNY_SOURCE_KEY = "nyc-1-rcny-101-03";
export const NEW_YORK_CITY_LAA_CHARTS_SOURCE_KEY = "nyc-dob-laa-fee-charts";
export const NEW_YORK_CITY_LAA_SOURCE_KEY = "nyc-dob-limited-alteration-application";
export const NEW_YORK_CITY_ELECTRICAL_FAQ_SOURCE_KEY = "nyc-dob-electrical-filings-faq";

const ADMIN_CODE = NEW_YORK_CITY_ADMIN_CODE_SOURCE_KEY;
const RCNY = NEW_YORK_CITY_RCNY_SOURCE_KEY;

/* -------------------------------------------------------------------------- */
/* Table 28-112.2, as printed                                                 */
/* -------------------------------------------------------------------------- */

/** The three building sizes the table's rows turn on. */
export const NEW_YORK_CITY_BUILDING_CATEGORIES = [
  "one_two_three_family",
  "other",
  "large",
] as const;

/** Row 11: one-, two- or three-family dwellings — first $5,000, then $2.60 per $1,000. */
export const NEW_YORK_CITY_ROW_11_THRESHOLD_CENTS = 500_000;
export const NEW_YORK_CITY_ROW_11_CENTS_PER_THOUSAND = 260;
/** Rows 12, 13 and 15: first $3,000, then $10.30 per $1,000. */
export const NEW_YORK_CITY_STANDARD_THRESHOLD_CENTS = 300_000;
export const NEW_YORK_CITY_STANDARD_CENTS_PER_THOUSAND = 1_030;
/** Rows 10 and 14: first $3,000, then $17.75 per $1,000. */
export const NEW_YORK_CITY_LARGE_ALTERATION_CENTS_PER_THOUSAND = 1_775;

/** New-building rates, in cents per square foot, with their per-structure minimums. */
export const NEW_YORK_CITY_NEW_BUILDING_SQ_FT = [
  { category: "one_two_three_family", rate: { numerator: 6, denominator: 1 }, minimumCents: 13_000 },
  { category: "other", rate: { numerator: 26, denominator: 1 }, minimumCents: 28_000 },
  { category: "large", rate: { numerator: 45, denominator: 1 }, minimumCents: 29_000 },
] as const;

/** 1 RCNY §101-03: "$45 for one-, two- or three-family dwellings, $165 for all other types of buildings". */
export const NEW_YORK_CITY_RECORDS_FEE_1_TO_3_CENTS = 4_500;
export const NEW_YORK_CITY_RECORDS_FEE_OTHER_CENTS = 16_500;

/** 1 RCNY §101-03's electrical figures. */
export const NEW_YORK_CITY_ELECTRICAL_INITIAL_APPLICATION_CENTS = 4_000;
export const NEW_YORK_CITY_ELECTRICAL_MINOR_WORK_CENTS = 1_500;
export const NEW_YORK_CITY_ELECTRICAL_FREE_UNITS = 10;
export const NEW_YORK_CITY_ELECTRICAL_CENTS_PER_UNIT = 25;
export const NEW_YORK_CITY_SERVICE_SWITCH_BANDS = [
  { upToAmperes: 100, amountCents: 800, label: "0–100 Amperes" },
  { upToAmperes: 200, amountCents: 3_000, label: "101–200 Amperes" },
  { upToAmperes: 600, amountCents: 10_500, label: "201–600 Amperes" },
  { upToAmperes: 1_200, amountCents: 22_500, label: "601–1,200 Amperes" },
  { upToAmperes: null, amountCents: 37_500, label: "Over 1,200 Amperes" },
] as const;

/**
 * The alteration table: five rows, each with the base its Alteration Types publish.
 *
 * Read straight out of Table 28-112.2 as amended by L.L. 2023/077 — the row number, the
 * threshold the schedule measures from, the rate for each further $1,000 or fraction, and
 * one base per group of Alteration Types that share a "Minimum Filing Fee". Everything the
 * rules below charge is a product of this table, so a transcription error would have to be
 * here to survive, and here it is quoted from the local law.
 */
export const NEW_YORK_CITY_ALTERATION_ROWS = [
  {
    row: 11,
    category: "one_two_three_family" as const,
    thresholdCents: NEW_YORK_CITY_ROW_11_THRESHOLD_CENTS,
    centsPerThousand: NEW_YORK_CITY_ROW_11_CENTS_PER_THOUSAND,
    affordableR2: false,
    printed:
      "Minimum filing fee for the first $5,000, or fraction thereof, of the cost of alteration; plus $2.60 for each $1,000, or fraction thereof, of cost of alterations in excess of $5,000",
    groups: [
      { suffix: "1TO3-ALT1", types: ["ALT1"], baseCents: 17_000, baseLabel: "$170.00" },
      { suffix: "1TO3", types: ["ALT2", "ALT3", "LAA"], baseCents: 13_000, baseLabel: "$130.00" },
    ],
  },
  {
    row: 12,
    category: "other" as const,
    thresholdCents: NEW_YORK_CITY_STANDARD_THRESHOLD_CENTS,
    centsPerThousand: NEW_YORK_CITY_STANDARD_CENTS_PER_THOUSAND,
    affordableR2: false,
    printed:
      "Minimum filing fee for the first $3,000, or fraction thereof, of the cost of alteration; plus $10.30 for each $1,000, or fraction thereof, of the alteration cost in excess of $3,000",
    groups: [
      { suffix: "OTHER-ALT1", types: ["ALT1"], baseCents: 28_000, baseLabel: "$280.00" },
      { suffix: "OTHER-ALT2", types: ["ALT2"], baseCents: 22_500, baseLabel: "$225.00" },
      { suffix: "OTHER", types: ["ALT3", "LAA"], baseCents: 19_500, baseLabel: "$195.00" },
    ],
  },
  {
    row: 13,
    category: "large" as const,
    thresholdCents: NEW_YORK_CITY_STANDARD_THRESHOLD_CENTS,
    centsPerThousand: NEW_YORK_CITY_STANDARD_CENTS_PER_THOUSAND,
    affordableR2: true,
    printed:
      "Minimum filing fee for the first $3,000, or fraction thereof, of the cost of alteration; plus $10.30 for each $1,000, or fraction thereof, of the alteration cost in excess of $3,000",
    groups: [
      {
        suffix: "LARGE-AFFORDABLE-ALT1-ALT2",
        types: ["ALT1", "ALT2"],
        baseCents: 28_000,
        baseLabel: "$280.00",
      },
      {
        suffix: "LARGE-AFFORDABLE",
        types: ["ALT3", "LAA"],
        baseCents: 19_500,
        baseLabel: "$195.00",
      },
    ],
  },
  {
    row: 14,
    category: "large" as const,
    thresholdCents: NEW_YORK_CITY_STANDARD_THRESHOLD_CENTS,
    centsPerThousand: NEW_YORK_CITY_LARGE_ALTERATION_CENTS_PER_THOUSAND,
    affordableR2: false,
    printed:
      "Minimum filing fee for the first $3,000, or fraction thereof, of the cost of alteration; plus $17.75 for each $1,000, or fraction thereof, of the alteration cost in excess of $3,000",
    groups: [{ suffix: "LARGE-ALT1", types: ["ALT1"], baseCents: 29_000, baseLabel: "$290.00" }],
  },
  {
    row: 15,
    category: "large" as const,
    thresholdCents: NEW_YORK_CITY_STANDARD_THRESHOLD_CENTS,
    centsPerThousand: NEW_YORK_CITY_STANDARD_CENTS_PER_THOUSAND,
    affordableR2: false,
    printed:
      "Minimum filing fee for the first $3,000, or fraction thereof, of the cost of alteration; plus $10.30 for each $1,000, or fraction thereof, of the alteration cost in excess of $3,000",
    groups: [
      { suffix: "LARGE-ALT2", types: ["ALT2"], baseCents: 22_500, baseLabel: "$225.00" },
      { suffix: "LARGE", types: ["ALT3", "LAA"], baseCents: 19_500, baseLabel: "$195.00" },
    ],
  },
] as const;

function newYorkCityRule(
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
    effectiveFrom: NEW_YORK_CITY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: ADMIN_CODE,
    ...overrides,
  };
}

/** The condition that selects one row's group of Alteration Types. */
function alterationTypeCondition(types: readonly string[]): Record<string, unknown> {
  if (types.length === 1) {
    return { field: "custom.alteration_type", op: "eq", value: types[0] };
  }
  // The group that contains ALT3 is the row's catch-all — every type it does not name
  // explicitly shares its base — so it is written as a negation and matches an absent
  // Alteration Type rather than silently charging nothing.
  if (types.includes("ALT3")) {
    const others = ["ALT1", "ALT2"].filter((type) => !types.includes(type));
    return { field: "custom.alteration_type", op: "not_in", value: others };
  }
  return { field: "custom.alteration_type", op: "in", value: [...types] };
}

/**
 * Every alteration rule for one permit type.
 *
 * The same ten rows are attached to the building permit (a building alteration) and to the
 * plumbing permit (a plumbing alteration — §28-112.2 charges plumbing permits per this
 * table), each set with its own ids so the two pages can be read apart.
 */
export function newYorkCityAlterationRules(
  scope: "building" | "plumbing",
): FeeRuleRecord[] {
  const isBuilding = scope === "building";
  const prefix = isBuilding ? "BLD-ALTER-" : "PLUMB-ALTER-";
  const idPrefix = isBuilding ? "nyc-bld-alt-" : "nyc-plumb-alt-";
  const noun = isBuilding ? "Building permit" : "Plumbing permit";

  return NEW_YORK_CITY_ALTERATION_ROWS.flatMap((tableRow) =>
    tableRow.groups.map((group) => {
      const affordability = tableRow.affordableR2
        ? [{ field: "custom.affordable_r2", op: "eq", value: true }]
        : tableRow.category === "large"
          ? [{ not: { field: "custom.affordable_r2", op: "eq", value: true } }]
          : [];

      return newYorkCityRule({
        id: `${idPrefix}${group.suffix.toLowerCase()}`,
        code: `${prefix}${group.suffix}`,
        label: `${noun} — alteration, ${tableRow.category.replace(/_/g, " ")}, at the ${group.baseLabel} base plus $${(
          tableRow.centsPerThousand / 100
        ).toFixed(2)} per $1,000 above $${tableRow.thresholdCents / 100_000},000`,
        feeType: "per_thousand",
        config: {
          basis: "valuation",
          centsPerThousand: tableRow.centsPerThousand,
          thresholdCents: tableRow.thresholdCents,
          incrementCents: 100_000,
          baseCents: group.baseCents,
        },
        conditions: {
          all: [
            { field: "custom.alteration", op: "eq", value: true },
            { field: "custom.building_category", op: "eq", value: tableRow.category },
            alterationTypeCondition(group.types),
            ...affordability,
          ],
        },
        description: `Table 28-112.2, row ${tableRow.row}: "${tableRow.printed}". Charged with the ${group.baseLabel} minimum filing fee of this row's ${
          group.types.join(" / ") || "Alteration Type"
        } as the base for the first ${
          tableRow.thresholdCents === 500_000 ? "$5,000" : "$3,000"
        } of cost, so an application costs ${group.baseLabel} on its own and rises in whole $1,000 steps after that threshold.${
          tableRow.affordableR2
            ? " Row 13 is the affordable-housing variant of the large-building rows: an R-2 building of seven stories or more, or 100,000 square feet or more, where at least half the units are affordable at 165 percent of area median income and are City or HDC financed."
            : ""
        }`,
      });
    }),
  );
}

export const NEW_YORK_CITY_BUILDING_ALTERATION_RULES = newYorkCityAlterationRules("building");
export const NEW_YORK_CITY_PLUMBING_ALTERATION_RULES = newYorkCityAlterationRules("plumbing");

/* -------------------------------------------------------------------------- */
/* New buildings — Table 28-112.2 rows 1, 4, 8 and 2, 5, 10                  */
/* -------------------------------------------------------------------------- */

/**
 * A new building that keeps no existing element is priced on floor area.
 *
 * Row 1: ""$0.06 for each square foot, or fraction thereof, of the total floor area of the
 * new building, but not less than $130 for each structure"", rows 4 and 8 the same sentence
 * at $0.26 and $0.45 with $280 and $290 minimums. The rate is stored as whole cents a square
 * foot because that is how the table publishes it, and the per-structure minimum is the
 * rule's own `minimumCents`, so a 1,000 square foot house is charged $130.00 rather than
 * $60.00.
 */
export const NEW_YORK_CITY_NEW_BUILDING_AREA_RULES: FeeRuleRecord[] = NEW_YORK_CITY_NEW_BUILDING_SQ_FT.map(
  (scheduleRow, index) => {
    const categoryLabel = scheduleRow.category.replace(/_/g, " ");
    const rowNumber = [1, 4, 8][index] ?? 1;
    return newYorkCityRule({
      id: `nyc-bld-nb-${scheduleRow.category}`,
      code: `BLD-NB-${scheduleRow.category.toUpperCase().replace(/_/g, "-")}-PER-SQFT`,
      label: `Building permit — new building, ${categoryLabel}, ${(
        scheduleRow.rate.numerator / scheduleRow.rate.denominator
      ).toFixed(2)} per square foot (minimum $${scheduleRow.minimumCents / 100})`,
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: scheduleRow.rate.numerator, denominator: scheduleRow.rate.denominator },
        rateUnit: "currency_per_unit",
      },
      minimumCents: scheduleRow.minimumCents,
      conditions: {
        all: [
          { not: { field: "custom.alteration", op: "eq", value: true } },
          { field: "custom.building_category", op: "eq", value: scheduleRow.category },
          { not: { field: "custom.existing_elements_retained", op: "eq", value: true } },
        ],
      },
      description: `Table 28-112.2, row ${rowNumber}: "${(
        scheduleRow.rate.numerator / scheduleRow.rate.denominator
      ).toFixed(2)} for each square foot, or fraction thereof, of the total floor area of the new building, but not less than $${
        scheduleRow.minimumCents / 100
      } for each structure" — charged on the square footage entered, floored at the per-structure minimum the row publishes. The row applies where no existing building elements are to be retained in place; "building elements" means any portion of an existing building or structure, including party walls, foundations, footings, piles and slabs on grade.`,
    });
  },
);

/**
 * The same three categories priced on cost instead of area, for a new building that *does*
 * keep existing elements (rows 2, 5 and 10).
 *
 * Row 2's base is $130 for the first $5,000 with $2.60 above it; rows 5 and 10 take $280 and
 * $290 for the first $3,000 with $10.30 and $17.75 above. The shape is the alteration row's
 * own, and the table prints it there because a building that keeps its shell is priced like
 * the alteration it partly is.
 */
export const NEW_YORK_CITY_NEW_BUILDING_RETAINED_RULES: FeeRuleRecord[] = [
  {
    category: "one_two_three_family",
    row: 2,
    thresholdCents: NEW_YORK_CITY_ROW_11_THRESHOLD_CENTS,
    centsPerThousand: NEW_YORK_CITY_ROW_11_CENTS_PER_THOUSAND,
    baseCents: 13_000,
  },
  {
    category: "other",
    row: 5,
    thresholdCents: NEW_YORK_CITY_STANDARD_THRESHOLD_CENTS,
    centsPerThousand: NEW_YORK_CITY_STANDARD_CENTS_PER_THOUSAND,
    baseCents: 28_000,
  },
  {
    category: "large",
    row: 10,
    thresholdCents: NEW_YORK_CITY_STANDARD_THRESHOLD_CENTS,
    centsPerThousand: NEW_YORK_CITY_LARGE_ALTERATION_CENTS_PER_THOUSAND,
    baseCents: 29_000,
  },
].map((scheduleRow) => {
  const categoryLabel = scheduleRow.category.replace(/_/g, " ");
  const thresholdLabel = scheduleRow.thresholdCents === 500_000 ? "$5,000" : "$3,000";
  return newYorkCityRule({
    id: `nyc-bld-nb-retained-${scheduleRow.category}`,
    code: `BLD-NB-RETAINED-${scheduleRow.category.toUpperCase().replace(/_/g, "-")}`,
    label: `Building permit — new building keeping existing elements, ${categoryLabel}, $${(
      scheduleRow.baseCents / 100
    ).toFixed(2)} plus $${(scheduleRow.centsPerThousand / 100).toFixed(2)} per $1,000 above ${thresholdLabel}`,
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: scheduleRow.centsPerThousand,
      thresholdCents: scheduleRow.thresholdCents,
      incrementCents: 100_000,
      baseCents: scheduleRow.baseCents,
    },
    conditions: {
      all: [
        { not: { field: "custom.alteration", op: "eq", value: true } },
        { field: "custom.building_category", op: "eq", value: scheduleRow.category },
        { field: "custom.existing_elements_retained", op: "eq", value: true },
      ],
    },
    description: `Table 28-112.2, row ${scheduleRow.row}: "Minimum Filing Fee - $${
      scheduleRow.baseCents / 100
    }" and "Minimum filing fee for the first ${thresholdLabel}, or fraction thereof, of the cost of alteration; plus $${(
      scheduleRow.centsPerThousand / 100
    ).toFixed(2)} for each $1,000, or fraction thereof, of the alteration cost in excess of ${thresholdLabel}". This is the new-building row for a building that keeps existing elements in place — any portion of an existing building or structure, including party walls, foundations, footings, piles and slabs on grade — which is why it is priced on cost like an alteration rather than on floor area.`,
  });
});

/* -------------------------------------------------------------------------- */
/* Records management fee — 1 RCNY §101-03                                   */
/* -------------------------------------------------------------------------- */

/**
 * "Records management fee for applications for new buildings and alterations and
 * associated documentation: $45 for one-, two- or three-family dwellings, $165 for all
 * other types of buildings."
 *
 * Charged per application, so it is attached to the building and plumbing pages — both are
 * alteration or new-building applications — and not to the electrical page. The rule says
 * the Department "shall be authorized to charge" these fees rather than that it does, and
 * both pages say where the figure comes from.
 *
 * Generated per permit type because a fee rule's id is its primary key: the same amount on
 * two pages is two rows with two ids, the way Jersey City's State surcharge is.
 */
export function newYorkCityRecordsFeeRules(scope: "building" | "plumbing"): FeeRuleRecord[] {
  const isBuilding = scope === "building";
  const prefix = isBuilding ? "BLD-" : "PLUMB-";
  const idPrefix = isBuilding ? "nyc-bld-" : "nyc-plumb-";

  return [
    {
      code: `${prefix}RECORDS-MGMT-1TO3`,
      amountCents: NEW_YORK_CITY_RECORDS_FEE_1_TO_3_CENTS,
      label: "records management fee, one-, two- or three-family dwelling, $45.00",
      conditions: {
        all: [
          { field: "custom.building_category", op: "eq", value: "one_two_three_family" },
          { field: "custom.alteration", op: "exists" },
        ],
      },
      description:
        '1 RCNY §101-03: "Records management fee for applications for new buildings and alterations and associated documentation — $45 for one-, two- or three-family dwellings". Charged once for the application rather than per trade or per row, and applied here to every alteration and new-building application, including a Limited Alteration Application, which is an application for alterations. The rule states that the Department is authorized to charge it; no DOB chart read for this pass prints it as a line. The exemptions in §28-112.1 — religious, charitable and educational owners, and emergency work for a City agency — are not modelled as a fact.',
    },
    {
      code: `${prefix}RECORDS-MGMT-OTHER`,
      amountCents: NEW_YORK_CITY_RECORDS_FEE_OTHER_CENTS,
      label: "records management fee, all other buildings, $165.00",
      conditions: {
        all: [
          { field: "custom.building_category", op: "exists" },
          { field: "custom.building_category", op: "not_in", value: ["one_two_three_family"] },
          { field: "custom.alteration", op: "exists" },
        ],
      },
      description:
        '1 RCNY §101-03: "Records management fee for applications for new buildings and alterations and associated documentation — $165 for all other types of buildings". The same per-application fee as the $45.00 row, at the rate every building that is not a one-, two- or three-family dwelling pays. The rule states that the Department is authorized to charge it rather than that it does, and the pages say so.',
    },
  ].map((entry) =>
    newYorkCityRule({
      id: `${idPrefix}records-${entry.code.endsWith("1TO3") ? "1to3" : "other"}`,
      code: entry.code,
      label: `${isBuilding ? "Building" : "Plumbing"} permit — ${entry.label}`,
      feeType: "flat",
      config: { amountCents: entry.amountCents },
      conditions: entry.conditions,
      description: entry.description,
      componentType: "other",
      priority: 800,
      sourceId: RCNY,
      effectiveFrom: NEW_YORK_CITY_ELECTRICAL_EFFECTIVE_FROM,
    }),
  );
}

export const NEW_YORK_CITY_RECORDS_FEE_RULES: FeeRuleRecord[] =
  newYorkCityRecordsFeeRules("building");

export const NEW_YORK_CITY_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  ...NEW_YORK_CITY_BUILDING_ALTERATION_RULES,
  ...NEW_YORK_CITY_NEW_BUILDING_AREA_RULES,
  ...NEW_YORK_CITY_NEW_BUILDING_RETAINED_RULES,
  ...newYorkCityRecordsFeeRules("building"),
];

export const NEW_YORK_CITY_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  ...NEW_YORK_CITY_PLUMBING_ALTERATION_RULES,
  ...newYorkCityRecordsFeeRules("plumbing"),
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — 1 RCNY §101-03, under §28-112.2.2                    */
/* -------------------------------------------------------------------------- */

/**
 * Every electrical rule reads this section rather than the table: §28-112.2.2 sends fees
 * for electrical work "in accordance with department rules", and this is the rule.
 */
function newYorkCityElectricalRule(
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
    effectiveFrom: NEW_YORK_CITY_ELECTRICAL_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: RCNY,
    ...overrides,
  };
}

/** 1 RCNY §101-03: "Electrical permit initial application (excluding minor work): $40". */
export const NEW_YORK_CITY_ELECTRICAL_INITIAL_APPLICATION: FeeRuleRecord =
  newYorkCityElectricalRule({
    id: "nyc-elec-initial-application",
    code: "ELEC-INITIAL-APPLICATION",
    label: "Electrical permit — initial application, $40.00",
    feeType: "flat",
    config: { amountCents: NEW_YORK_CITY_ELECTRICAL_INITIAL_APPLICATION_CENTS },
    conditions: { not: { field: "custom.minor_work", op: "eq", value: true } },
    description:
      '1 RCNY §101-03: "Electrical permit initial application (excluding minor work): $40". Charged once for the application, before any parts fee, and not charged on a minor work permit — which is a permit of its own at $15.00. Local Law 128 of 2024 repealed the chapter of Title 27 the rule cross-references for minor work, so that cross-reference now points at nothing; the fee itself is unchanged.',
  });

/**
 * The parts-fee row: "$0 for the first ten units, $0.25 over ten units".
 *
 * A unit is what the rule says it is — each outlet, each fixture, each horsepower or
 * fraction of a motor or generator, each kilowatt or fraction of a heater, each horsepower
 * of an air conditioner and each kilovolt-ampere of a transformer installed, altered or
 * repaired. The first ten cost nothing and every one after them costs a quarter, which is
 * the allowance shape `per_unit` already has: `thresholdUnits: 10` with no base charge.
 */
export const NEW_YORK_CITY_ELECTRICAL_UNITS: FeeRuleRecord = newYorkCityElectricalRule({
  id: "nyc-elec-units",
  code: "ELEC-UNITS",
  label: "Electrical permit — outlets, fixtures, motors, heaters and transformers, $0.25 each over ten",
  feeType: "per_unit",
  config: {
    unit: "electrical_units",
    thresholdUnits: NEW_YORK_CITY_ELECTRICAL_FREE_UNITS,
    centsPerUnit: NEW_YORK_CITY_ELECTRICAL_CENTS_PER_UNIT,
  },
  conditions: { not: { field: "custom.minor_work", op: "eq", value: true } },
  description:
    '1 RCNY §101-03: "Each outlet, each fixture, each horsepower or fraction thereof of a motor or generator, each kilowatt or fraction thereof of a heater, each horsepower or fraction thereof of an air conditioner, each kilovolt-ampere or fraction thereof of a transformer installed, altered or repaired shall be assigned the value of one unit: 1 – 10 units, $0; Over 10 units, $.25." The rule notes that the total additional fee is the sum of the units; this page prices the unit row only, and names the rest of the parts fees.',
});

/** 1 RCNY §101-03: "Electrical permit (minor work ...): $15". */
export const NEW_YORK_CITY_ELECTRICAL_MINOR_WORK: FeeRuleRecord = newYorkCityElectricalRule({
  id: "nyc-elec-minor-work",
  code: "ELEC-MINOR-WORK",
  label: "Electrical permit — minor work, $15.00",
  feeType: "flat",
  config: { amountCents: NEW_YORK_CITY_ELECTRICAL_MINOR_WORK_CENTS },
  conditions: { field: "custom.minor_work", op: "eq", value: true },
  description:
    '1 RCNY §101-03: "Electrical permit (minor work ...): $15". The permit a licensed electrician files for work that needs no construction documents, and it replaces — rather than adds to — the $40.00 initial application and the parts fees.',
});

/**
 * "For each service switch installed, altered or repaired" — five ampere bands.
 *
 * `$8.00` up to 100 amperes, `$30.00` to 200, `$105.00` to 600, `$225.00` to 1,200 and
 * `$375.00` above that. Each band is its own flat rule gated on the service's amperage, so
 * exactly one can apply, and each prices **one** switch: the schedule charges every switch
 * on the permit, and a job with more than one pays this row for each of them, which the
 * electrical page states rather than quietly charging once.
 */
export const NEW_YORK_CITY_SERVICE_SWITCH_RULES: FeeRuleRecord[] =
  NEW_YORK_CITY_SERVICE_SWITCH_BANDS.map((band, index) => {
    const previous = index > 0 ? NEW_YORK_CITY_SERVICE_SWITCH_BANDS[index - 1] : undefined;
    const bandConditions: Array<Record<string, unknown>> =
      band.upToAmperes === null
        ? [
            {
              field: "custom.service_switch_amperage",
              op: "gt",
              value: previous && previous.upToAmperes !== null ? previous.upToAmperes : 0,
            },
          ]
        : [
            ...(previous && previous.upToAmperes !== null
              ? [
                  {
                    field: "custom.service_switch_amperage",
                    op: "gt",
                    value: previous.upToAmperes,
                  },
                ]
              : []),
            { field: "custom.service_switch_amperage", op: "lte", value: band.upToAmperes },
          ];

    return newYorkCityElectricalRule({
      id: `nyc-elec-service-switch-${band.upToAmperes ?? "over-1200"}`,
      code: `ELEC-SERVICE-SWITCH-${band.upToAmperes ?? "OVER-1200"}`,
      label: `Electrical permit — service switch, ${band.label}, $${(band.amountCents / 100).toFixed(2)}`,
      feeType: "flat",
      config: { amountCents: band.amountCents },
      conditions: {
        all: [
          { field: "custom.service_switch_amperage", op: "exists" },
          ...bandConditions,
        ],
      },
      description: `1 RCNY §101-03: "For each service switch installed, altered or repaired: 0-100 Amperes $8.00; 101-200 Amperes $30.00; 201-600 Amperes $105.00; 601-1,200 Amperes $225.00; Over 1,200 Amperes $375.00." This is the ${band.label} band, and it is charged for one switch — the schedule charges each switch on the permit.`,
    });
  });

export const NEW_YORK_CITY_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  NEW_YORK_CITY_ELECTRICAL_INITIAL_APPLICATION,
  NEW_YORK_CITY_ELECTRICAL_UNITS,
  NEW_YORK_CITY_ELECTRICAL_MINOR_WORK,
  ...NEW_YORK_CITY_SERVICE_SWITCH_RULES,
];
