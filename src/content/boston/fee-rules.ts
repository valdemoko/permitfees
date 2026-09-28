import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Boston, Massachusetts fee rules — REAL DATA.
 *
 * Sources (research/massachusetts/boston.md records how each was read):
 *
 *  S1  ISD's Building Division Permit Fees sheet, two pages, "Rev. 2021" — every amount
 *      below is printed on it.
 *      https://www.boston.gov/sites/default/files/file/2021/10/Building%20Division%20Fees.pdf
 *  S2  boston.gov Short-Form Permit — "$20, plus $10 per $1,000 of estimated cost".
 *      https://www.boston.gov/permitting/permits/short-form-permit
 *  S3  boston.gov Long-Form Permit — "$50, plus $10 per $1,000 of estimated work cost".
 *      https://www.boston.gov/permitting/permits/long-form-permit
 *  S4  boston.gov Plumbing Permit — "$20, plus $5 per fixture".
 *      https://www.boston.gov/permitting/permits/plumbing-permit
 *  S5  boston.gov Electrical Permit — "$20 + usage-based rate", with the three branches
 *      spelled out in the City's own web words.
 *      https://www.boston.gov/permitting/permits/electrical-permit
 *
 * **The mechanism, in three sentences.** Boston prices a building application from the
 * *estimated cost of the work* on one of five rows of a single two-page fee sheet: the
 * Short Form (minor alteration) at $20.00 plus $10.00 per $1,000, the Long Form (major
 * alteration) at $50.00 plus the same $10.00, an Amendment at $20.00 plus the same $10.00,
 * a Change of Occupancy at $20.00 or $50.00 flat, and the Nominal Fee at $300.00 plus its
 * $50.00 application fee. Plumbing is $20.00 plus $5.00 a fixture. Electrical is a branched
 * schedule — by amperage when the service changes, by device count when it does not, by
 * cost when neither applies — with Fire Alarm and Low Voltage as their own $20.00 +
 * $10.00-per-$1,000 rows.
 *
 * **Six readings this module depends on, all of them stated on the pages.**
 *
 *  1. **The rate prorates.** The sheet prints "$10.00 per $1,000.00 of the estimated cost"
 * *or fraction thereof*, so no `incrementCents` is set: $47,500 of cost pays
 *     $475.00 of rate, not the $480.00 a rounded-up schedule would charge. Cambridge, 3
 *     miles west, prints the phrase and rounds up — the contrast is asserted in both
 *     cities' tests.
 *  2. **One application pays one building row**, selected by `custom.form_type`. The sheet
 *     lists rows as types of application and the City's Long-Form page confirms the
 *     taxonomy ("Amendment: Only for changes to existing Long-Form permit applications").
 *     The Short Form is the catch-all, written as `not_in` the other four so a reader who
 *     supplies only a cost still gets a number.
 *  3. **The service-voltage discrepancy resolves as the union of two texts.** The PDF reads
 *     "$.75 amp up to 480 Volts" in a numbered two-tier list; the live page reads
 *     "$0.75/amp over 480 volts". Together they give two bands — 240 V or less at $0.25 an
 *     ampere, above 240 V at $0.75 — which is what these rules charge, and both wordings
 *     are quoted on the page.
 *  4. **"$5.00 all meters approved" is charged once.** The sentence prints "each" for
 *     fixtures, plugs and outlets and no "each" for meters, so the meter row is flat and
 *     gated on meters being on the application.
 *  5. **The three electrical branches are mutually exclusive**, and the application fee is
 *     its own $20.00 row so no branch can charge it twice — a branch adds its own rate to
 *     it. Temporary Service replaces it with the sheet's $25.00.
 *  6. **No percentage exists anywhere in this jurisdiction.** No plan review, no technology
 *     fee, no state surcharge appears on the sheet or on any of the four permit pages, so
 *     every rule here is a `base` component.
 *
 * **What is deliberately NOT here:** the DOUBLE FEE for work started without a permit or
 * undervalued (a multiplier on a fee, which no rule type expresses), Temporary Service's
 * $10.00 a month for six months (priced in months, a unit no per-unit kind counts), the
 * Off Hour application and inspection, the Board of Appeal rows, Microfilming, Use of
 * Premises, Trench, Subdivision, Sheet Metal, Electrical Yearly Maintenance, Sprinkler and
 * Gasfitting. Each is named on the page it belongs to. This module is the single
 * definition of Boston's fee rules: the seed writes exactly these records and the tests
 * assert against exactly these records.
 */

/** The date of the ISD sheet's own revision stamp — the only date it prints. */
export const BOSTON_FEE_EFFECTIVE_FROM = "2021-10-01";

export const BOSTON_ISD_FEES_SOURCE_KEY = "boston-isd-building-division-fees";
export const BOSTON_SHORT_FORM_SOURCE_KEY = "boston-short-form-permit";
export const BOSTON_LONG_FORM_SOURCE_KEY = "boston-long-form-permit";
export const BOSTON_PLUMBING_PERMIT_SOURCE_KEY = "boston-plumbing-permit";
export const BOSTON_ELECTRICAL_PERMIT_SOURCE_KEY = "boston-electrical-permit";
export const BOSTON_PERMITTING_HUB_SOURCE_KEY = "boston-permitting-hub";
export const BOSTON_ISD_DEPARTMENT_SOURCE_KEY = "boston-inspectional-services-department";

const ISD_SHEET = BOSTON_ISD_FEES_SOURCE_KEY;

/**
 * The sheet's five building application rows, as `custom.form_type` values.
 *
 * `short_form` is absent from no list and present in the catch-all: the Short Form is what
 * the City's own page presents as the default route for work that changes nothing
 * structural, so a reader who supplies only a cost is priced on it.
 */
export const BOSTON_FORM_TYPES = [
  "short_form",
  "long_form",
  "amendment",
  "change_of_occupancy",
  "nominal_fee",
] as const;

/** The three building categories the Changes of Occupancy row names. */
export const BOSTON_BUILDING_CATEGORIES = [
  "one_two_three_family",
  "four_family_or_more",
  "commercial",
] as const;

/** The sheet's electrical application types beyond the three cost branches. */
export const BOSTON_ELECTRICAL_SCOPES = ["fire_alarm", "low_voltage", "temporary_service"] as const;

/* -------------------------------------------------------------------------- */
/* Building permits — the Building Division Permit Fees sheet                  */
/* -------------------------------------------------------------------------- */

function bostonRule(
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
    effectiveFrom: BOSTON_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: ISD_SHEET,
    ...overrides,
  };
}

/** The condition that keeps every other building row off an application of this type. */
const NOT_ANOTHER_FORM_TYPE = {
  field: "custom.form_type",
  op: "not_in",
  value: ["long_form", "amendment", "change_of_occupancy", "nominal_fee"],
} as const;

/**
 * Short Form Building (Minor Alteration): "$20.00 primary fee plus $10.00 per $1,000.00 of
 * the estimated cost of work."
 *
 * Confirmed on boston.gov in the City's own words: "$20, plus $10 per $1,000 of estimated
 * cost" and "There is a $20 application fee and $10 per every $1,000 of the work estimate."
 * No "or fraction thereof" is printed anywhere on the sheet, so the rate is charged on the
 * exact cost — a partial thousand costs a partial rate.
 */
export const BOSTON_SHORT_FORM_RULE: FeeRuleRecord = bostonRule({
  id: "boston-bld-short-form",
  code: "BLD-SHORT-FORM",
  label: "Building permit — Short Form (minor alteration), $20.00 plus $10.00 per $1,000 of estimated cost",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 1_000, baseCents: 2_000 },
  conditions: NOT_ANOTHER_FORM_TYPE,
  description:
    'ISD\'s Building Division Permit Fees sheet, Rev. 2021: "Short Form Building: (Minor Alteration) — $20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work". boston.gov restates it as "$20, plus $10 per $1,000 of estimated cost". This row is the schedule\'s catch-all: it applies whenever the application is not a Long Form, an Amendment, a Change of Occupancy or a Nominal Fee, which is also what the City means by "minor alterations that don\'t change a building\'s structure or use". The rate carries no "or fraction thereof", so $47,500 of cost pays $475.00 of rate rather than $480.00 — see research/massachusetts/boston.md, reading (b).',
});

/**
 * Long Form Building (1-3 family) (Major Alteration): "$50.00 primary fee plus $10.00 per
 * $1,000.00 of the estimated cost of work" — the City's page says "$50, plus $10 per
 * $1,000 of estimated work cost" and defines the permit as covering "major alterations or
 * renovations that change a building's structure or use".
 */
export const BOSTON_LONG_FORM_RULE: FeeRuleRecord = bostonRule({
  id: "boston-bld-long-form",
  code: "BLD-LONG-FORM",
  label: "Building permit — Long Form (major alteration), $50.00 plus $10.00 per $1,000 of estimated cost",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 1_000, baseCents: 5_000 },
  conditions: { field: "custom.form_type", op: "eq", value: "long_form" },
  description:
    'ISD\'s sheet: "Long Form Building: (1-3 family) (Major Alteration) — $50.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work". boston.gov: "A Long-Form Permit covers major alterations or renovations that change a building\'s structure or use" and "$50 application fee / Plus $10 for every $1,000 of the estimated cost of work". The rate is the Short Form\'s rate; only the primary fee differs, which is why the two rows share a description of the ladder and differ by $30.00 at any cost.',
});

/**
 * Amendment: "$20.00 Primary fee plus $10.00 per $1,000.00 of the estimated cost of work" —
 * the Short Form's arithmetic on a filing the Long-Form page defines as "Only for changes
 * to existing Long-Form permit applications."
 */
export const BOSTON_AMENDMENT_RULE: FeeRuleRecord = bostonRule({
  id: "boston-bld-amendment",
  code: "BLD-AMENDMENT",
  label: "Building permit — Amendment to an existing application, $20.00 plus $10.00 per $1,000",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 1_000, baseCents: 2_000 },
  conditions: { field: "custom.form_type", op: "eq", value: "amendment" },
  description:
    'ISD\'s sheet: "Amendment: $20.00 Primary fee plus $10.00 per $1,000.00 of the estimated cost of work." The City\'s Long-Form page scopes the row: "Amendment: Only for changes to existing Long-Form permit applications." Same ladder as the Short Form, chosen by `custom.form_type` rather than by cost — an amendment is a new application against an existing one, and exactly one row of the sheet prices it.',
});

/** Changes of Occupancy, 3 Family and under: $20.00 flat. */
export const BOSTON_CHANGE_OF_OCCUPANCY_1_TO_3_RULE: FeeRuleRecord = bostonRule({
  id: "boston-bld-change-of-occupancy-1to3",
  code: "BLD-CHANGE-OF-OCCUPANCY-1TO3",
  label: "Building permit — change of occupancy, three dwellings or fewer, $20.00",
  feeType: "flat",
  config: { amountCents: 2_000 },
  conditions: {
    all: [
      { field: "custom.form_type", op: "eq", value: "change_of_occupancy" },
      { field: "custom.building_category", op: "eq", value: "one_two_three_family" },
    ],
  },
  description:
    'ISD\'s sheet: "Changes of Occupancy: 3 Family and under $20.00". A flat row — no cost ladder — charged when the application is a change of occupancy in a building of three dwelling units or fewer. The building\'s category is `custom.building_category`, because the row turns on how many dwellings the building has, not on what the work costs.',
});

/** Changes of Occupancy, 4 Family and up or Commercial: $50.00 flat. */
export const BOSTON_CHANGE_OF_OCCUPANCY_OTHER_RULE: FeeRuleRecord = bostonRule({
  id: "boston-bld-change-of-occupancy-other",
  code: "BLD-CHANGE-OF-OCCUPANCY-OTHER",
  label: "Building permit — change of occupancy, four dwellings or more or commercial, $50.00",
  feeType: "flat",
  config: { amountCents: 5_000 },
  conditions: {
    all: [
      { field: "custom.form_type", op: "eq", value: "change_of_occupancy" },
      {
        field: "custom.building_category",
        op: "not_in",
        value: ["one_two_three_family"],
      },
    ],
  },
  description:
    'ISD\'s sheet: "Changes of Occupancy: 4 Family and up $50.00 / Commercial $50.00". Both categories are one amount, so both are one rule — written as `not_in` the three-or-fewer category, which also matches a reader who has not said what the building is: for a change of occupancy the schedule\'s larger figure is the honest default, and the $20.00 row still has to be asked for by category.',
});

/** Nominal Fee: "$300.00 (Nominal fee)". */
export const BOSTON_NOMINAL_FEE_RULE: FeeRuleRecord = bostonRule({
  id: "boston-bld-nominal-fee",
  code: "BLD-NOMINAL-FEE",
  label: "Building permit — Nominal Fee, $300.00",
  feeType: "flat",
  config: { amountCents: 30_000 },
  conditions: { field: "custom.form_type", op: "eq", value: "nominal_fee" },
  description:
    'ISD\'s sheet: "Nominal Fee: $300.00 (Nominal fee)(plus $50.00 application fee, plus $50.00 change of occupancy fee)". The $300.00 is the nominal fee itself; the sheet prints the application fee and the change-of-occupancy fee as additions in the same cell, so this rule charges the $300.00 and BLD-NOMINAL-APPLICATION charges the $50.00 that follows it. A nominal fee is the route the City offers where the work does not follow the intended zoning: both permit pages list "A nominal fee letter if your work does not follow the intended Zoning of the property and you know you\'re going to engage the Zoning Board of Appeal" among the attachments.',
});

/** The sheet's "plus $50.00 application fee" on a Nominal Fee application. */
export const BOSTON_NOMINAL_APPLICATION_RULE: FeeRuleRecord = bostonRule({
  id: "boston-bld-nominal-application",
  code: "BLD-NOMINAL-APPLICATION",
  label: "Building permit — Nominal Fee application fee, $50.00",
  feeType: "flat",
  config: { amountCents: 5_000 },
  conditions: { field: "custom.form_type", op: "eq", value: "nominal_fee" },
  description:
    'The same cell of ISD\'s sheet, read as its own line: "(plus $50.00 application fee…)". Charged with BLD-NOMINAL-FEE, so a nominal filing is $350.00 in all. The cell also prints "plus $50.00 change of occupancy fee", which is the schedule\'s own Changes of Occupancy row priced by BLD-CHANGE-OF-OCCUPANCY-*; it is not charged a second time here.',
});

export const BOSTON_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  BOSTON_SHORT_FORM_RULE,
  BOSTON_LONG_FORM_RULE,
  BOSTON_AMENDMENT_RULE,
  BOSTON_CHANGE_OF_OCCUPANCY_1_TO_3_RULE,
  BOSTON_CHANGE_OF_OCCUPANCY_OTHER_RULE,
  BOSTON_NOMINAL_FEE_RULE,
  BOSTON_NOMINAL_APPLICATION_RULE,
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — the sheet's branched schedule                         */
/* -------------------------------------------------------------------------- */

/**
 * The $20.00 application fee every electrical branch prints, charged once.
 *
 * Four of the five electrical rows on the sheet open with "$20.00 Application fee" (the
 * fifth, Temporary Service, opens with $25.00 — see BOSTON_TEMPORARY_SERVICE_RULE), so the
 * fee is its own rule and each branch below charges only its own rate. That is what keeps
 * a service-change application from paying the $20.00 twice.
 */
export const BOSTON_ELECTRICAL_APPLICATION_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-application",
  code: "ELEC-APPLICATION",
  label: "Electrical permit — application fee, $20.00",
  feeType: "flat",
  config: { amountCents: 2_000 },
  conditions: {
    not: { field: "custom.electrical_scope", op: "eq", value: "temporary_service" },
  },
  description:
    'ISD\'s sheet: "$20.00 Application fee" opens the service branch, the no-service-change branch, the fallback branch, the Fire Alarm row and the Low Voltage row alike; boston.gov heads the page "$20 + usage-based rate". Charged once for the application, and not charged where the sheet replaces it with Temporary Service\'s $25.00 primary fee.',
});

/** Temporary Service: "$25.00 primary fee; $10.00 for each month up to six months". */
export const BOSTON_TEMPORARY_SERVICE_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-temporary-service",
  code: "ELEC-TEMPORARY-SERVICE",
  label: "Electrical permit — temporary service, $25.00",
  feeType: "flat",
  config: { amountCents: 2_500 },
  conditions: { field: "custom.electrical_scope", op: "eq", value: "temporary_service" },
  description:
    'ISD\'s sheet: "Electrical Temporary Service: $25.00 primary fee; $10.00 for each month up to six months then apply again." The $25.00 replaces the ordinary $20.00 application fee rather than adding to it — both are gated on the same fact, so exactly one charges. The $10.00 monthly element is priced in months, a unit no per-unit kind in this engine counts, so it is named here rather than charged; a six-month temporary service costs $25.00 on this page and ISD prices the months at the counter.',
});

/**
 * Service branch, 240 volts or less: "$20.00 Application fee plus $.25 amp".
 *
 * The rate is an exact `currency_per_unit` of the `amperage` basis — 25 cents per ampere —
 * and the band is gated on `custom.service_voltage` *not* exceeding 240, which matches an
 * absent voltage: the common residential service is 120/240 volts, and a reader who gives
 * amperage without a voltage is priced at the schedule's first tier rather than charged
 * nothing.
 */
export const BOSTON_SERVICE_240V_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-service-240v",
  code: "ELEC-SERVICE-240V",
  label: "Electrical permit — new or upgraded service at 240 volts or less, $0.25 per ampere",
  feeType: "percent",
  config: {
    basis: "amperage",
    rate: { numerator: 25, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [
      { field: "custom.service_change", op: "eq", value: true },
      { not: { field: "custom.service_voltage", op: "gt", value: 240 } },
    ],
  },
  description:
    'ISD\'s sheet, first branch: "When upgrading service or installing new service; 1) $20.00 Application fee plus $.25 amp up to 240 Volts". The $20.00 is ELEC-APPLICATION, charged once for the application; this rule is the $.25 an ampere above it, stated as an exact rate on the service\'s amperage (`custom.amperage`), so a 200-ampere service is $50.00 of rate and $70.00 in all. The band also matches a reader who gives amperage but no voltage.',
});

/**
 * Service branch, above 240 volts: "$20.00 Application fee plus $.75 amp".
 *
 * The PDF reads "$.75 amp up to 480 Volts" and the live page reads "$0.75/amp over 480
 * volts"; the union of the two texts is one band above 240 V, which is what this rule
 * charges. See research/massachusetts/boston.md, reading (d).
 */
export const BOSTON_SERVICE_OVER_240V_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-service-over-240v",
  code: "ELEC-SERVICE-OVER-240V",
  label: "Electrical permit — new or upgraded service above 240 volts, $0.75 per ampere",
  feeType: "percent",
  config: {
    basis: "amperage",
    rate: { numerator: 75, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [
      { field: "custom.service_change", op: "eq", value: true },
      { field: "custom.service_voltage", op: "gt", value: 240 },
    ],
  },
  description:
    'ISD\'s sheet, first branch, second tier: "2) $20.00 Application fee plus $.75 amp up to 480 Volts". boston.gov prints the same figure for the band above the first: "or $0.75/amp over 480 volts". The two texts disagree about where the band ends — the PDF\'s numbered list ends it at 480, the web page starts it there — and both are quoted on the page; the model charges $.75 an ampere for anything above 240 volts, which is the union of the two readings and leaves no voltage unpriced. A 480-volt 400-ampere service is $300.00 of rate and $320.00 in all.',
});

/**
 * No-service-change branch: "$1.00 each fixture, plug or outlet".
 *
 * A blended count — the schedule itself adds fixtures, plugs and outlets into one list at
 * one price — so it reads the engine's blended electrical kind rather than calling a
 * fixture an outlet.
 */
export const BOSTON_ELECTRICAL_DEVICES_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-devices",
  code: "ELEC-DEVICES",
  label: "Electrical permit — fixtures, plugs and outlets at $1.00 each (no service change)",
  feeType: "per_unit",
  config: { unit: "electrical_units", centsPerUnit: 100 },
  conditions: {
    all: [
      { not: { field: "custom.service_change", op: "eq", value: true } },
      {
        field: "custom.electrical_scope",
        op: "not_in",
        value: ["fire_alarm", "low_voltage", "temporary_service"],
      },
    ],
  },
  description:
    'ISD\'s sheet, second branch: "When there is no change in service; $20.00 Application fee plus $1.00 each fixture, plug or outlet, $5.00 all meters approved"; boston.gov: "$20 application fee, plus $1 for each fixture, plug, or outlet". The three device types are one price on one line, so they are one count — the engine\'s blended electrical unit rather than the plumbing `fixtures` namespace, which would have described an outlet as a fixture. It cannot charge alongside the service branch: the branches are the sheet\'s own words, and this rule is gated off a service change.',
});

/**
 * The same branch's "$5.00 all meters approved" — flat, because the sentence prints no
 * "each" for meters where it prints one for the devices.
 */
export const BOSTON_ELECTRICAL_METERS_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-meters",
  code: "ELEC-METERS",
  label: "Electrical permit — meters approved, $5.00",
  feeType: "flat",
  config: { amountCents: 500 },
  conditions: {
    all: [
      { not: { field: "custom.service_change", op: "eq", value: true } },
      {
        field: "custom.electrical_scope",
        op: "not_in",
        value: ["fire_alarm", "low_voltage", "temporary_service"],
      },
      { field: "custom.meters", op: "exists" },
    ],
  },
  description:
    'ISD\'s sheet: "$5.00 all meters approved", the tail of the no-service-change branch. The sentence prices devices with an explicit "each" and meters without one, so this is charged once when meters are on the application rather than per meter — the reading recorded in research/massachusetts/boston.md, reading (e), with Cambridge\'s "Meter, each $5.00" as the contrast in the next city\'s tests. Gated on `custom.meters` being present, so an application that approves no meters pays nothing here.',
});

/**
 * The fallback branch: "$20.00 application fee plus $10.00 per $1,000.00 of the estimated
 * cost" — for an application with no service change and no device count, where "none of the
 * above apply".
 */
export const BOSTON_ELECTRICAL_COST_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-cost",
  code: "ELEC-COST-FALLBACK",
  label: "Electrical permit — priced on cost where no branch above applies, $10.00 per $1,000",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 1_000 },
  conditions: {
    all: [
      { not: { field: "custom.service_change", op: "eq", value: true } },
      { not: { field: "custom.electrical_units", op: "exists" } },
      {
        field: "custom.electrical_scope",
        op: "not_in",
        value: ["fire_alarm", "low_voltage", "temporary_service"],
      },
    ],
  },
  description:
    'ISD\'s sheet, third branch: "When none of the above apply; $20.00 application fee plus $10.00 per $1,000.00 of the estimated cost" — the sentence that also covers "All state buildings". It is the schedule\'s own fallback, so it is gated on the two branches above not applying: no service change, and no device count to price. A reader who gives a cost and nothing else is priced here, and a reader who gives devices is priced by them instead — exactly one branch fires, which the tests assert. No "or fraction thereof" is printed, so the rate is charged on the exact cost.',
});

/** Electrical Fire Alarm: "$20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost." */
export const BOSTON_FIRE_ALARM_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-fire-alarm",
  code: "ELEC-FIRE-ALARM",
  label: "Electrical permit — fire alarm, $20.00 plus $10.00 per $1,000 of estimated cost",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 1_000 },
  conditions: {
    all: [
      { field: "custom.electrical_scope", op: "eq", value: "fire_alarm" },
      { not: { field: "custom.service_change", op: "eq", value: true } },
    ],
  },
  description:
    'ISD\'s sheet: "Electrical Fire Alarm: $20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work." A row of its own rather than a branch of the three, selected by `custom.electrical_scope = "fire_alarm"`; the $20.00 is the shared application fee and the $10.00 rate is the building ladder\'s rate, which is why the row reads like the Short Form with the fire-alarm label on it. The sheet\'s third branch is kept off this application so exactly one rate charges.',
});

/** Electrical Low Voltage: same arithmetic, its own row. */
export const BOSTON_LOW_VOLTAGE_RULE: FeeRuleRecord = bostonRule({
  id: "boston-elec-low-voltage",
  code: "ELEC-LOW-VOLTAGE",
  label: "Electrical permit — low voltage, $20.00 plus $10.00 per $1,000 of estimated cost",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 1_000 },
  conditions: {
    all: [
      { field: "custom.electrical_scope", op: "eq", value: "low_voltage" },
      { not: { field: "custom.service_change", op: "eq", value: true } },
    ],
  },
  description:
    'ISD\'s sheet: "Electrical Low Voltage: $20.00 primary fee plus $10.00 per $1,000.00 of the estimated cost of work." The same shape as the fire-alarm row and the same shared $20.00 application fee, selected by `custom.electrical_scope = "low_voltage"`. Like every other row on the sheet it prints no "or fraction thereof", so the rate is charged on the exact cost.',
});

export const BOSTON_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  BOSTON_ELECTRICAL_APPLICATION_RULE,
  BOSTON_TEMPORARY_SERVICE_RULE,
  BOSTON_SERVICE_240V_RULE,
  BOSTON_SERVICE_OVER_240V_RULE,
  BOSTON_ELECTRICAL_DEVICES_RULE,
  BOSTON_ELECTRICAL_METERS_RULE,
  BOSTON_ELECTRICAL_COST_RULE,
  BOSTON_FIRE_ALARM_RULE,
  BOSTON_LOW_VOLTAGE_RULE,
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — the sheet's Plumbing row                                */
/* -------------------------------------------------------------------------- */

/** Plumbing: "$20.00 primary fee". */
export const BOSTON_PLUMBING_APPLICATION_RULE: FeeRuleRecord = bostonRule({
  id: "boston-plumb-application",
  code: "PLUMB-APPLICATION",
  label: "Plumbing permit — application fee, $20.00",
  feeType: "flat",
  config: { amountCents: 2_000 },
  conditions: null,
  description:
    'ISD\'s sheet: "Plumbing: $20.00 primary fee plus $5.00 each fixture." boston.gov: "There is a $20 application fee plus $5 for each fixture, such as toilets and sinks." This is the primary fee, charged for every plumbing permit including one whose fixture count the reader has not supplied; the fixture row is charged beside it.',
});

/** Plumbing: "$5.00 each fixture". */
export const BOSTON_PLUMBING_FIXTURES_RULE: FeeRuleRecord = bostonRule({
  id: "boston-plumb-fixtures",
  code: "PLUMB-FIXTURES",
  label: "Plumbing permit — $5.00 per fixture",
  feeType: "per_unit",
  config: { unit: "fixtures", centsPerUnit: 500 },
  conditions: null,
  description:
    'ISD\'s sheet, and the City\'s page: "$5.00 each fixture" / "$5 for each fixture, such as toilets and sinks". Charged on the fixture count with no allowance and no ceiling, so five fixtures are $25.00 beside the $20.00 application fee and eight are $40.00. The count is the plumbing namespace\'s own `fixtures`, so an electrical device count on the same calculator cannot be billed as a fixture here.',
});

export const BOSTON_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  BOSTON_PLUMBING_APPLICATION_RULE,
  BOSTON_PLUMBING_FIXTURES_RULE,
];
