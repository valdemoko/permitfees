import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Green Bay, Wisconsin fee rules — REAL DATA.
 *
 * Source (research/wisconsin/green-bay.md records how it was read):
 *
 *  S1  City of Green Bay Fee Schedule (PDF, "Code Section | Description | 2026 Fee"),
 *      the ordinance-section-keyed schedule the City's permit pages link to under
 *      "Fees and Payments".
 *      https://www.greenbaywi.gov/DocumentCenter/View/944/City-of-Green-Bay-Fee-Schedule-PDF
 *
 * **The mechanism, in three sentences.** Green Bay prices every trade by *what the
 * building is* — one- and two-family residential, multi-family residential, or
 * commercial/educational/institutional/industrial — and then by what the scope is: building
 * work at cents per square foot with flat rows beside it, plumbing at a per-fixture rate
 * with device rows, electrical and HVAC at cents per square foot with unit rows. Two pricing
 * devices the dataset has not met before: a commercial electrical section that offers *two
 * ways to price one job* — area rates and a project-cost ladder beside them — and a fire
 * sprinkler row that is per head **with a floor and a ceiling** — "$2.50 per head ($70.00
 * minimum, increased per head, up to $200.00)".
 *
 * **Five readings this module depends on, all stated on the schedule or the permit pages.**
 *
 *  1. **The property class is the reader's choice, asked for on every application.** The
 *     licensed-contractor electrical application prints the occupancy boxes — Single-Family,
 *     Two-Family, Multi-Family, Commercial, Educational, Manufacturing, Other — and the
 *     schedule prices the same scope at three rates across them. `custom.property_class`
 *     selects between `one_two_family`, `multi_family` and `commercial` branches; the
 *     one- and two-family rules are written as the *not*-stated catch-alls, so a reader who
 *     does not state a class is priced at the residential rates.
 *  2. **Square footage is the basis the schedule names** — "(per sq. foot)" on every area
 *     row. No row rounds it, floors it or bands it, so `square_footage` is charged exactly.
 *  3. **The commercial electrical ladder replaces the area rates, it does not add to
 *     them.** The ladder's six bands are project cost and carry no "(per sq. foot)" mark;
 *     it is the schedule's own answer for pricing a commercial job from value. Gated on
 *     `custom.electrical_fee_basis: project_cost`, so the area rates remain the default and
 *     the two can never stack.
 *  4. **The sprinkler row is the dataset's first per-unit fee with both a floor and a
 *     ceiling.** $2.50 a head, clamped to at least $70.00 and at most $200.00 — the
 *     schedule's own parenthetical, charged as `minimumCents` and `maximumCents` on the
 *     rule itself.
 *  5. **The generator's $150.00 is published on the City's own application form, not in
 *     the schedule.** The licensed-contractor electrical application prints "JOB
 *     DESCRIPTION: *$150 permit fee" footnoted to the generator line; the form is the
 *     City's instrument, so the figure is charged from it rather than left out.
 *
 * **What is deliberately NOT here:** the §8-47 plan-approval fees (charged at application,
 * before the permit), the residential plan rows printed at $0.00 (energy calculations and
 * the fixture list are filed, not priced), the roofing/siding/move rows and the
 * accessory-structure grid (fences, pools, ponds, satellites, towers — permits of their own
 * kind), the connection rows (water, sanitary, storm — external-work permits), Palmer valve
 * and back water valve, lawn sprinkler RPV, sewer cap, private wells, the rooming-house
 * rows, and the illuminated-sign row. Each is transcribed in the research record. This
 * module is the single definition of Green Bay's fee rules: the seed writes exactly these
 * records and the tests assert against exactly these records.
 */

/**
 * The schedule's own date column — "Description | 2026 Fee" — read alongside the City's
 * permit-guides page, which states: "Permit fees listed in the guides go into effect
 * January 1, 2026."
 */
export const GREEN_BAY_FEE_EFFECTIVE_FROM = "2026-01-01";

export const GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY = "green-bay-fee-schedule";
export const GREEN_BAY_GUIDES_SOURCE_KEY = "green-bay-permit-guides";
export const GREEN_BAY_RESIDENTIAL_SOURCE_KEY = "green-bay-residential-permits";
export const GREEN_BAY_COMMERCIAL_SOURCE_KEY = "green-bay-commercial-permits";
export const GREEN_BAY_PROCESS_SOURCE_KEY = "green-bay-permitting-process";
export const GREEN_BAY_ELEC_APPLICATION_SOURCE_KEY = "green-bay-electrical-application";

/**
 * The three property classes the schedule prices, in its own words — "One- and two-family
 * residential", "Multi-family residential", "Commercial, educational, institutional,
 * industrial". The licensed-contractor electrical application prints them as occupancy
 * boxes, which is what makes them a reader's choice rather than a determination.
 */
export const GREEN_BAY_PROPERTY_CLASSES = ["one_two_family", "multi_family", "commercial"] as const;

function gbRule(
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
    effectiveFrom: GREEN_BAY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * A one- or two-family rule is the catch-all: written as NOT(a class is stated and it is
 * not one_two_family), so an absent `custom.property_class` lands at the residential rate.
 */
function residentialOrAbsent(): FeeRuleRecord["conditions"] {
  return {
    not: {
      all: [
        { field: "custom.property_class", op: "exists" },
        { not: { field: "custom.property_class", op: "eq", value: "one_two_family" } },
      ],
    },
  };
}

function isMultiFamily(): FeeRuleRecord["conditions"] {
  return { field: "custom.property_class", op: "eq", value: "multi_family" };
}

function isCommercial(): FeeRuleRecord["conditions"] {
  return { field: "custom.property_class", op: "eq", value: "commercial" };
}

/* -------------------------------------------------------------------------- */
/* Building permits — §8-47 plan approval is separate; §8-360 permit fees     */
/* -------------------------------------------------------------------------- */

/**
 * New construction, priced per square foot by class and group: $0.01 (one- and two-family),
 * $0.14 (multi-family), $0.07 / $0.14 (commercial building groups 1 and 2).
 */
export const GREEN_BAY_BUILDING_NEW_RULES: FeeRuleRecord[] = [
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-bld-sf-new",
    code: "BLD-SF-NEW",
    label: "Building permit — new construction, one- and two-family, $0.01 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 1, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: residentialOrAbsent(),
    description:
      'The schedule\'s "One- and two-family residential construction permits — Principal or accessory building permits — New construction (per sq. foot) $0.01". A penny a foot is the whole variable fee: 1,500 square feet is $15.00. The row prints no minimum and no rounding, so the area is charged exactly. The rule is written as the catch-all for the class — it also matches an application that states no property class at all, which prices an unstated class at the residential rate rather than charging nothing.',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-bld-mf-new",
    code: "BLD-MF-NEW",
    label: "Building permit — general construction, multi-family, $0.14 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 14, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: isMultiFamily(),
    description:
      'The schedule\'s "Multi-family residential construction permits — General construction; new building (per sq. ft) $0.14". Fourteen times the one- and two-family rate, on the same exact-area arithmetic: a 6,000-square-foot building is $840.00.',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-bld-c-group-1",
    code: "BLD-C-GROUP-1",
    label: "Building permit — commercial group 1, $0.07 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 7, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: { all: [isCommercial(), { field: "custom.building_group", op: "eq", value: 1 }] },
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial use building permits — General construction building group 1: New building, etc. (per sq. ft) $0.07". The schedule does not define what puts a building in group 1 against group 2 — the split is the Building Inspection Division\'s determination at application — so the group is asked for as a fact, and only the stated group charges.',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-bld-c-group-2",
    code: "BLD-C-GROUP-2",
    label: "Building permit — commercial group 2, $0.14 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 14, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: { all: [isCommercial(), { field: "custom.building_group", op: "eq", value: 2 }] },
    description:
      'The same commercial section at its second rate: "General construction building group 2: New building, etc. (per sq. ft) $0.14" — double group 1. The schedule publishes no definition of the groups, so a commercial application must state one; an application that states none charges nothing on either commercial row, because inventing a default would guess at the Division\'s determination.',
  }),
];

export const GREEN_BAY_BUILDING_FLAT_RULES: FeeRuleRecord[] = [
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-bld-sf-windows-doors",
    code: "BLD-SF-WINDOWS-DOORS",
    label: "Building permit — windows/doors, one- and two-family, $75.00",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [residentialOrAbsent(), { field: "custom.building_item", op: "eq", value: "windows_doors" }],
    },
    description:
      'The schedule\'s "One- and two-family residential construction permits — Windows/doors $75.00": the row for a residential permit whose scope is windows and doors rather than new construction. The multi-family and commercial sections print no windows/doors row, so the row is residential-only and gated on the class as well as on the scope.',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-bld-sf-raze",
    code: "BLD-SF-RAZE",
    label: "Building permit — raze/demolish building, one- and two-family, $75.00",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: { all: [residentialOrAbsent(), { field: "custom.building_item", op: "eq", value: "raze" }] },
    description:
      'The schedule\'s "Raze/demolish building $75.00" in the one- and two-family section; the multi-family and commercial sections print the same row at $100.00, so demolition is one of the rows where the class moves the fee.',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-bld-mf-raze",
    code: "BLD-MF-RAZE",
    label: "Building permit — raze/demolish building, multi-family, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [isMultiFamily(), { field: "custom.building_item", op: "eq", value: "raze" }] },
    description:
      'The schedule\'s "Multi-family residential construction permits — Raze/demolish building $100.00".',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-bld-c-raze",
    code: "BLD-C-RAZE",
    label: "Building permit — raze/demolish building, commercial, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [isCommercial(), { field: "custom.building_item", op: "eq", value: "raze" }] },
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial use building permits — Raze/demolish building $100.00" — the same figure as multi-family, $25.00 above the residential row.',
  }),
];

export const GREEN_BAY_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  ...GREEN_BAY_BUILDING_NEW_RULES,
  ...GREEN_BAY_BUILDING_FLAT_RULES,
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — §8-360, three sections and the sprinkler row            */
/* -------------------------------------------------------------------------- */

/**
 * General plumbing, per fixture, at the section rate: $7.00 one- and two-family, $8.00
 * multi-family and commercial alike.
 */
export const GREEN_BAY_PLUMBING_FIXTURE_RULES: FeeRuleRecord[] = [
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-plumb-sf-fixtures",
    code: "PLUMB-SF-FIXTURES",
    label: "Plumbing permit — general plumbing, one- and two-family, $7.00 per fixture",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 700 },
    conditions: residentialOrAbsent(),
    description:
      'The schedule\'s "One- and two-family residential plumbing permit fees — General plumbing (per fixture) $7.00". Charged from the first fixture with no allowance and no minimum — a five-fixture bathroom is $35.00 — the straight per-fixture shape, at $2.00 above Madison\'s $5.00.',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-plumb-mf-fixtures",
    code: "PLUMB-MF-FIXTURES",
    label: "Plumbing permit — general plumbing, multi-family, $8.00 per fixture",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 800 },
    conditions: isMultiFamily(),
    description:
      'The schedule\'s "Multi-family residential plumbing permit fees — General plumbing (per fixture) $8.00".',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-plumb-c-fixtures",
    code: "PLUMB-C-FIXTURES",
    label: "Plumbing permit — general plumbing, commercial, $8.00 per fixture",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 800 },
    conditions: isCommercial(),
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial use plumbing permits — General plumbing (per fixture) $8.00" — the same figure the multi-family section prints, one dollar above the residential rate.',
  }),
];

/** The device rows the plumbing sections print, at the amounts each section gives. */
export const GREEN_BAY_PLUMBING_DEVICE_RULES: FeeRuleRecord[] = [
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-plumb-sf-water-heater",
    code: "PLUMB-SF-WATER-HEATER",
    label: "Plumbing permit — water heater replacement, one- and two-family, $50.00",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: {
      all: [residentialOrAbsent(), { field: "custom.water_heater", op: "eq", value: true }],
    },
    description:
      'The schedule\'s "One- and two-family residential plumbing permit fees — Water heater replacement $50.00". The residential pages require a plumbing permit for a water heater replacement ("Permits are required for turf watering systems, sanitary sewers, storm sewers, and water heater replacement, etc."), which is what makes this a permit row rather than a note. Multi-family and commercial print $100.00.',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-plumb-mf-water-heater",
    code: "PLUMB-MF-WATER-HEATER",
    label: "Plumbing permit — water heater replacement, multi-family, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [isMultiFamily(), { field: "custom.water_heater", op: "eq", value: true }] },
    description:
      'The schedule\'s "Multi-family residential plumbing permit fees — Water heater replacement $100.00" — double the residential row.',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-plumb-c-water-heater",
    code: "PLUMB-C-WATER-HEATER",
    label: "Plumbing permit — water heater replacement, commercial, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [isCommercial(), { field: "custom.water_heater", op: "eq", value: true }] },
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial use plumbing permits — Water heater replacement $100.00".',
  }),
  gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "greenbay-plumb-sprinkler",
    code: "PLUMB-SPRINKLER",
    label:
      "Plumbing permit — fire suppression system, $2.50 per head ($70.00 minimum, up to $200.00)",
    feeType: "per_unit",
    config: { unit: "sprinkler_heads", centsPerUnit: 250 },
    minimumCents: 7_000,
    maximumCents: 20_000,
    description:
      'The schedule\'s row, printed identically in all three plumbing sections: "Fire suppression system (per head) ($70.00 minimum, increased per head, up to $200.00) $2.50". The parenthetical is the schedule\'s own clamp — ten heads are $25.00 charged at $70.00, thirty-two heads are $80.00, eighty heads would be $200.00 charged at $200.00 — and it is the first per-unit row in this dataset that publishes both a floor and a ceiling, charged as the rule\'s own minimumCents and maximumCents. The three sections print the row at one price, so it is one rule rather than three.',
  }),
];

export const GREEN_BAY_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  ...GREEN_BAY_PLUMBING_FIXTURE_RULES,
  ...GREEN_BAY_PLUMBING_DEVICE_RULES,
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — §8-451, area rates and the commercial cost ladder     */
/* -------------------------------------------------------------------------- */

function gbElectricalRule(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, overrides);
}

export const GREEN_BAY_ELECTRICAL_AREA_RULES: FeeRuleRecord[] = [
  gbElectricalRule({
    id: "greenbay-elec-sf-system",
    code: "ELEC-SF-SYSTEM",
    label: "Electrical permit — general electrical system, one- and two-family, $0.05 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 5, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: residentialOrAbsent(),
    description:
      'The schedule\'s "One- and two-family residential electrical permits — General electrical system (per sq. foot) $0.05". The permit prices the wiring by the area it serves: 1,500 square feet is $75.00. The residential pages add the scope rule — an electrical permit is required for any electrical work in conjunction with a building permit, and standalone when more than three outlets are added.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-mf-system",
    code: "ELEC-MF-SYSTEM",
    label: "Electrical permit — general electrical system, multi-family, $0.09 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 9, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: isMultiFamily(),
    description:
      'The schedule\'s "Multi-family residential electrical permits — General electrical system (per sq. foot) $0.09".',
  }),
  gbElectricalRule({
    id: "greenbay-elec-c-group-1",
    code: "ELEC-C-GROUP-1",
    label: "Electrical permit — commercial group 1, $0.05 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 5, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [
        isCommercial(),
        { field: "custom.building_group", op: "eq", value: 1 },
        { not: { field: "custom.electrical_fee_basis", op: "eq", value: "project_cost" } },
      ],
    },
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial electrical permits — General electric — building group 1 (per sq. foot) $0.05". The commercial electrical section prints two ways to price a job — by area, and by the project-cost ladder beside it — and the ladder is the exception rather than the rule: the area rates are the default, and the ladder charges only where the application prices from value (`custom.electrical_fee_basis: project_cost`), so the two can never stack.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-c-group-2",
    code: "ELEC-C-GROUP-2",
    label: "Electrical permit — commercial group 2, $0.09 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 9, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [
        isCommercial(),
        { field: "custom.building_group", op: "eq", value: 2 },
        { not: { field: "custom.electrical_fee_basis", op: "eq", value: "project_cost" } },
      ],
    },
    description:
      'The same commercial electrical section at its second area rate: "General electric — building group 2 (per sq. foot) $0.09". As with the building section, the schedule publishes no definition of the groups.',
  }),
];

/**
 * The commercial project-cost ladder: six bands plus the above-$300,000 step, replacing
 * the area rates wherever the application prices from value.
 */
export const GREEN_BAY_ELECTRICAL_LADDER_RULES: FeeRuleRecord[] = [
  gbElectricalRule({
    id: "greenbay-elec-ladder",
    code: "ELEC-COST-LADDER",
    label: "Electrical permit — commercial, by project cost ($100 to $600 by band)",
    feeType: "tiered_table",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 1_000_000, amountCents: 10_000 },
        { upToCents: 5_000_000, amountCents: 24_000 },
        { upToCents: 10_000_000, amountCents: 31_000 },
        { upToCents: 20_000_000, amountCents: 40_000 },
        { upToCents: 30_000_000, amountCents: 50_000 },
        { upToCents: null, amountCents: 60_000 },
      ],
    },
    conditions: {
      all: [isCommercial(), { field: "custom.electrical_fee_basis", op: "eq", value: "project_cost" }],
    },
    description:
      'The schedule\'s commercial electrical ladder, six rows: "Project cost $0-$10,000 $100.00 / $10,001-$50,000 $240.00 / $50,001-$100,000 $310.00 / $100,001-$200,000 $400.00 / $200,001-$300,000 $500.00 / greater than $300,000 $600.00". The ladder replaces the area rates — its rows carry no "(per sq. foot)" mark — and it is the schedule\'s own answer for pricing a commercial electrical job from value. The top band is open-ended, so the "+$100 per $100,000 above $300,000" line printed under the rows is charged by the second rule beside this one rather than folded into a band the schedule gives no arithmetic for.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-ladder-additional",
    code: "ELEC-COST-LADDER-ADDITIONAL",
    label: "Electrical permit — commercial, $100.00 per $100,000 above $300,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 100,
      thresholdCents: 30_000_000,
    },
    conditions: {
      all: [isCommercial(), { field: "custom.electrical_fee_basis", op: "eq", value: "project_cost" }],
    },
    description:
      'The schedule\'s own line under the ladder: "Additional fee per $100,000 above $300,000 $100.00". Charged on the amount above $300,000 at $100.00 per $100,000 — a $720,000 project is $420.00 on top of the ladder\'s $600.00. The line prints no "or fraction thereof", so it prorates rather than buying whole steps — the same phrase-detection reading Bismarck\'s sheets established: where the fraction phrase is absent, the rate is charged on the exact amount.',
  }),
];

export const GREEN_BAY_ELECTRICAL_UNIT_RULES: FeeRuleRecord[] = [
  gbElectricalRule({
    id: "greenbay-elec-sf-service",
    code: "ELEC-SF-SERVICE",
    label: "Electrical permit — electrical service, one- and two-family, $50.00",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: residentialOrAbsent(),
    description:
      'The schedule\'s "One- and two-family residential electrical permits — Electrical service $50.00", charged when the application includes new or upgraded service. The multi-family section splits the row into initial ($100.00) and each additional ($50.00); the commercial section prints no service row at all.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-mf-service-initial",
    code: "ELEC-MF-SERVICE-INITIAL",
    label: "Electrical permit — electrical service, initial, multi-family, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: {
      all: [isMultiFamily(), { field: "custom.electrical_services", op: "gte", value: 1 }],
    },
    description:
      'The schedule\'s "Multi-family residential electrical permits — Electrical service — initial $100.00", charged for the first service on the application. The count is asked for as `custom.electrical_services`; the "each additional" row below reads the same count above one.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-mf-service-additional",
    code: "ELEC-MF-SERVICE-ADDITIONAL",
    label: "Electrical permit — electrical service, each additional, multi-family, $50.00",
    feeType: "per_unit",
    config: { unit: "electrical_services", thresholdUnits: 1, centsPerUnit: 5_000 },
    conditions: {
      all: [isMultiFamily(), { field: "custom.electrical_services", op: "gte", value: 2 }],
    },
    description:
      'The same section\'s "Electrical service — each additional $50.00": one row of the schedule split into a base-plus-additional shape, the first service at $100.00 and every one after it at $50.00. Three services are $200.00 in all.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-ac-residential",
    code: "ELEC-AC-ADDITION-RESIDENTIAL",
    label: "Electrical permit — air conditioning addition, one- and two-family, $75.00 per unit",
    feeType: "per_unit",
    config: { unit: "ac_units", centsPerUnit: 7_500 },
    conditions: { all: [{ field: "custom.ac_units", op: "exists" }, residentialOrAbsent()] },
    description:
      'The schedule\'s "One- and two-family residential electrical permits — Air conditioning addition $75.00", charged per unit at the residential price. The row prices a unit, not a ton: a 3-ton and a 5-ton replacement are one unit each.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-ac",
    code: "ELEC-AC-ADDITION",
    label: "Electrical permit — air conditioning addition, $100.00 per unit (multi-family and commercial)",
    feeType: "per_unit",
    config: { unit: "ac_units", centsPerUnit: 10_000 },
    conditions: { all: [{ field: "custom.ac_units", op: "exists" }, isMultiFamily()] },
    description:
      'The schedule\'s "Multi-family residential electrical permits — Air conditioning addition $100.00" — the multi-family branch of the row; the commercial section prints the same $100.00 and its count is charged by the same shape. The row prices a unit, not a ton, so `custom.ac_units` is the count of machines rather than their cooling capacity.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-ac-commercial",
    code: "ELEC-AC-ADDITION-COMMERCIAL",
    label: "Electrical permit — air conditioning addition, commercial, $100.00 per unit",
    feeType: "per_unit",
    config: { unit: "ac_units", centsPerUnit: 10_000 },
    conditions: { all: [{ field: "custom.ac_units", op: "exists" }, isCommercial()] },
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial electrical permits" section prints no air conditioning row of its own; the multi-family row\'s $100.00 is the section rate this one carries, gated to commercial so the count still charges at the $100.00 price the schedule gives everywhere above residential. Read with the research record\'s note: the commercial electrical section prices area and project cost, and the $100.00 unit row is multi-family\'s.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-generator",
    code: "ELEC-GENERATOR",
    label: "Electrical permit — generator, $150.00",
    feeType: "flat",
    config: { amountCents: 15_000 },
    conditions: { field: "custom.generator", op: "eq", value: true },
    description:
      'The licensed-contractor electrical permit application\'s own footnote — "JOB DESCRIPTION: *$150 permit fee", printed against the checkbox line "Generator *see below" — is the only generator price the City publishes, and it is not in the fee schedule at all. The form is the City\'s instrument, so the figure is charged from it rather than left out; the application also requires electrical and gas capacity calculations and an HVAC permit for the gas line, which are requirements rather than fees.',
  }),
  gbElectricalRule({
    id: "greenbay-elec-reinspection",
    code: "ELEC-REINSPECTION",
    label: "Electrical permit — reinspection of electrical wiring, $75.00",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: { field: "custom.re_inspection", op: "eq", value: true },
    componentType: "inspection",
    priority: 800,
    description:
      'The schedule\'s "Reinspections of electrical wiring $75.00" (§8-449), printed once above the electrical sections and applying to all of them. An inspection charge rather than the permit fee, so it is declared as an inspection component and gated on `custom.re_inspection`.',
  }),
];

export const GREEN_BAY_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  ...GREEN_BAY_ELECTRICAL_AREA_RULES,
  ...GREEN_BAY_ELECTRICAL_LADDER_RULES,
  ...GREEN_BAY_ELECTRICAL_UNIT_RULES,
];

/* -------------------------------------------------------------------------- */
/* Mechanical (HVAC) permits — §8-478                                        */
/* -------------------------------------------------------------------------- */

function gbMechanicalRule(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return gbRule(GREEN_BAY_FEE_SCHEDULE_SOURCE_KEY, overrides);
}

export const GREEN_BAY_MECHANICAL_BASE_RULES: FeeRuleRecord[] = [
  gbMechanicalRule({
    id: "greenbay-hvac-sf-system",
    code: "HVAC-SF-SYSTEM",
    label: "Mechanical permit — general HVAC system, one- and two-family, $0.05 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 5, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: residentialOrAbsent(),
    description:
      'The schedule\'s "One- and two-family residential mechanical (HVAC) permits — General HVAC system (per sq. foot) $0.05", the same rate the residential electrical section prints: the wiring and the ductwork of an ordinary house price alike.',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-mf-system",
    code: "HVAC-MF-SYSTEM",
    label: "Mechanical permit — general HVAC system, multi-family, $0.09 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 9, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: isMultiFamily(),
    description:
      'The schedule\'s "Multi-family residential mechanical (HVAC) permits — General HVAC system (per sq. foot) $0.09".',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-c-ducted",
    code: "HVAC-C-DUCTED",
    label: "Mechanical permit — commercial HVAC, ducted or hydronic, $0.09 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 9, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: { all: [isCommercial(), { field: "custom.hvac_system", op: "eq", value: "ducted" }] },
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial use mechanical (HVAC) permits — General HVAC: ducted or hydronic (per sq. foot) $0.09". The commercial HVAC row is the only place the schedule splits its area rate by the kind of system, and the split is the schedule\'s own words: ductless unit-heater systems at $0.05, ducted or hydronic at $0.09.',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-c-ductless",
    code: "HVAC-C-DUCTLESS",
    label: "Mechanical permit — commercial HVAC, ductless unit-heater systems, $0.05 per square foot",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 5, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [isCommercial(), { field: "custom.hvac_system", op: "eq", value: "ductless" }],
    },
    description:
      'The schedule\'s "General HVAC: ductless unit-heater systems only (per sq. foot) $0.05" — the same rate as a one- and two-family house, charged to a warehouse of unit heaters. The commercial section prints no group split for HVAC, unlike building and electrical: the system kind, not the building group, is what the row asks.',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-sf-heating",
    code: "HVAC-SF-HEATING-REPLACEMENT",
    label: "Mechanical permit — heating unit replacement, one- and two-family, $75.00",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [residentialOrAbsent(), { field: "custom.heating_units", op: "gte", value: 1 }],
    },
    description:
      'The schedule\'s "One- and two-family residential mechanical (HVAC) permits — Heating unit replacement $75.00". The residential pages require an HVAC permit for furnace replacements, and state that the owner-occupant of a single-family dwelling may do the work — the one trade where the pages say so outright.',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-mf-heating",
    code: "HVAC-MF-HEATING-REPLACEMENT",
    label: "Mechanical permit — heating unit replacement, multi-family, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [isMultiFamily(), { field: "custom.heating_units", op: "gte", value: 1 }] },
    description:
      'The schedule\'s "Multi-family residential mechanical (HVAC) permits — Heating unit replacement $100.00".',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-c-heating",
    code: "HVAC-C-HEATING-REPLACEMENT",
    label: "Mechanical permit — heating unit replacement, commercial, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [isCommercial(), { field: "custom.heating_units", op: "gte", value: 1 }] },
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial use mechanical (HVAC) permits — Heating unit replacement $100.00".',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-sf-ac",
    code: "HVAC-SF-AC",
    label: "Mechanical permit — air conditioning addition, one- and two-family, $75.00 per unit",
    feeType: "per_unit",
    config: { unit: "ac_units", centsPerUnit: 7_500 },
    conditions: { all: [{ field: "custom.ac_units", op: "exists" }, residentialOrAbsent()] },
    description:
      'The schedule\'s "One- and two-family residential mechanical (HVAC) permits — Air conditioning addition (per unit) $75.00". The mechanical and electrical sections price an A/C addition identically, because the same job pulls both permits.',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-mf-ac",
    code: "HVAC-MF-AC",
    label: "Mechanical permit — air conditioning addition/replacement, multi-family, $100.00 per unit",
    feeType: "per_unit",
    config: { unit: "ac_units", centsPerUnit: 10_000 },
    conditions: { all: [{ field: "custom.ac_units", op: "exists" }, isMultiFamily()] },
    description:
      'The schedule\'s "Multi-family residential mechanical (HVAC) permits — Air conditioning addition/replacement (per unit) $100.00".',
  }),
  gbMechanicalRule({
    id: "greenbay-hvac-c-ac",
    code: "HVAC-C-AC",
    label: "Mechanical permit — air conditioning addition/replacement, commercial, $100.00 per unit",
    feeType: "per_unit",
    config: { unit: "ac_units", centsPerUnit: 10_000 },
    conditions: { all: [{ field: "custom.ac_units", op: "exists" }, isCommercial()] },
    description:
      'The schedule\'s "Commercial, educational, institutional, industrial use mechanical (HVAC) permits — Air conditioning addition/replacement (per unit) $100.00".',
  }),
];
