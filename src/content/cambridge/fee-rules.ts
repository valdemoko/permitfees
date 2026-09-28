import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Cambridge, Massachusetts fee rules — REAL DATA.
 *
 * Sources (research/massachusetts/cambridge.md records how each was read):
 *
 *  S1  Inspectional Services, "Building Fees" — the cost ladder, its Exemption line, the
 *      Moving buildings row and Sheet Metal.
 *      https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/buildingfees
 *  S2  Inspectional Services, "Electrical/Wiring Fees" — the itemised electrical price list.
 *      https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/electricalwiringfees
 *  S3  Inspectional Services, "Plumbing Fees" — the fixture block, the device rows and the
 *      re-inspection fee.
 *      https://www.cambridgema.gov/inspection/buildingelectricplumbingpermits/plumbingfees
 *  S4  DPW, "Changes to Construction Permit Fees Effective January 1, 2024" — the only
 *      dated instrument read, and it names no ISD row.
 *      https://www.cambridgema.gov/Departments/publicworks/news/2023/12/changestoconstructionpermitfeeseffectivejanuary1,2024
 *
 * **The mechanism, in three sentences.** Cambridge prices building work at **$20.00 per
 * $1,000 or fraction thereof of construction cost, $50.00 minimum** — and prints the
 * rounding phrase on every cost row, so a partial thousand buys a whole step, which is the
 * opposite of Boston's sheet three miles east. A second line, labelled "Exemption", charges
 * $15.00 per $1,000 or fraction for three residential dwelling units or less, and Moving
 * buildings is $15.00 per $1,000 rounded up as well, whatever the building is. The trades
 * are a price list rather than a ladder: electrical rows stack item by item (a service at
 * $10.00 per 100 amperes, receptacles by their ampere rating, a meter at $5.00 each), and
 * plumbing is one block — $50.00 for five fixtures, $5.00 for each one after them.
 *
 * **Five readings this module depends on, all of them stated on the pages.**
 *
 *  1. **The rate rounds up, because the phrase is printed.** "or fraction thereof" appears
 *     on every cost row and "rounded up to the next thousand" on Moving buildings, so each
 *     of those rules sets `incrementCents`. Sheet Metal's "$25 per each 100 linear feet" is
 *     a *rate unit* rather than a block — the sheet says "rounded up" where it means a
 *     block — so that row prorates at $0.25 a foot instead.
 *  2. **The $50.00 minimum is the rule's own floor**, asserted where it binds: $2,000 of
 *     cost is 2 × $20.00 = $40.00 charged at $50.00.
 *  3. **One arithmetic, one rule.** "All new construction, Repairs & Alterations",
 *     "Amendments to plans", "Demolition of buildings & structures" and "Preliminary
 *     permits for foundation" print the identical pair of rates, so they are one rule whose
 *     description names all four rows.
 *  4. **Electrical stacks; Boston's branches do not exist here.** The rows carry no
 *     "when…" language — they are line items of a list — so a service and four receptacles
 *     pay both rows, and the ampere rating of a receptacle is a fact (`custom.receptacle_amps`)
 *     over one count, with the schedule's first row (15 amps) as the default.
 *  5. **Plan review is charged nowhere.** The schedule's plan-review cell reads verbatim
 *     "$100 included in building permit fee$50.00" — one cell, two amounts, no legend — so
 *     no plan-review rule exists and the cell is quoted on the page instead.
 *
 * **What is deliberately NOT here:** the triple fee every page prints (a multiplier on a
 * fee), the seven Certificate of Occupancy and Certificate of Inspections rows, signs (priced
 * as a percentage of a *sign cost*, which no basis here reads), building licenses and annual
 * inspections, the electrical rows priced by horsepower, kilowatts, tons or occupancy, and
 * the plumbing device rows — back water valve, hose bib, dedicated systems, water piping per
 * floor, sanitary waste and vent per floor, sprinkler heads and standpipes. Each is
 * transcribed in the research record and named on the page it belongs to. This module is the
 * single definition of Cambridge's fee rules: the seed writes exactly these records and the
 * tests assert against exactly these records.
 */

/**
 * The date the three fee pages were read, used as the schedules' effectiveFrom.
 *
 * The pages print no date of their own. The only dated instrument read — DPW's "Changes to
 * Construction Permit Fees Effective January 1, 2024" — lists sidewalk obstruction permits
 * and the utility inspectors' overtime fee rather than any ISD row, so it cannot date these
 * figures. The read date is what the record carries, exactly as Buffalo's undated sheets do.
 */
export const CAMBRIDGE_FEE_EFFECTIVE_FROM = "2026-09-25";

export const CAMBRIDGE_BUILDING_FEES_SOURCE_KEY = "cambridge-building-fees";
export const CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY = "cambridge-electrical-wiring-fees";
export const CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY = "cambridge-plumbing-fees";
export const CAMBRIDGE_FEE_CHANGES_2024_SOURCE_KEY = "cambridge-permit-fee-changes-2024";

/** The ampere ratings the electrical schedule prices receptacles at, in its own order. */
export const CAMBRIDGE_RECEPTACLE_AMPERAGES = [15, 20, 30, 50, 70] as const;

function cambridgeRule(
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
    effectiveFrom: CAMBRIDGE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — the Building Fees page                                  */
/* -------------------------------------------------------------------------- */

/** The schedule's own Exemption condition: three residential dwelling units or less. */
const THREE_UNITS_OR_LESS = {
  all: [
    { field: "custom.residential_units", op: "exists" },
    { field: "custom.residential_units", op: "lte", value: 3 },
  ],
} as const;

/**
 * The cost ladder: "$20.00 per $1,000.00 or fraction thereof of construction cost, $50.00
 * minimum fee" — printed identically under "All new construction Repairs & Alterations",
 * "Amendments to plans", "Demolition of buildings & structures" and "Preliminary permits
 * for foundation".
 */
export const CAMBRIDGE_COST_PER_THOUSAND_RULE: FeeRuleRecord = cambridgeRule(
  CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
  {
    id: "cambridge-bld-cost-per-thousand",
    code: "BLD-COST-PER-THOUSAND",
    label: "Building permit — $20.00 per $1,000 or fraction of construction cost (minimum $50.00)",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 2_000,
      incrementCents: 100_000,
    },
    minimumCents: 5_000,
    conditions: {
      all: [
        { not: { field: "custom.moving_buildings", op: "eq", value: true } },
        { not: THREE_UNITS_OR_LESS },
      ],
    },
    description:
      'Cambridge\'s Building Fees page prints this one pair of numbers four times — under "All new construction Repairs & Alterations", "Amendments to plans", "Demolition of buildings & structures" and "Preliminary permits for foundation": "$20.00 per $1,000.00 or fraction thereof of construction cost, $50.00 minimum fee". One rule charges all four rows because the arithmetic is identical; the description, not a second rule, carries the row names. The phrase "or fraction thereof" is printed, so a partial thousand is bought as a whole step — $18,750 is nineteen steps of $20.00, or $380.00 — and the $50.00 minimum is the rule\'s own floor, which binds below $2,500 of cost.',
  },
);

/**
 * The Exemption line: "$15.00 per $1,000.00 or fraction thereof of construction cost for
 * three residential dwelling units or less, $50.00 minimum fee."
 *
 * A rate rather than a waiver — the City's own column labels it an exemption, but the row
 * still charges, at $15.00 instead of $20.00.
 */
export const CAMBRIDGE_EXEMPTION_RULE: FeeRuleRecord = cambridgeRule(
  CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
  {
    id: "cambridge-bld-exemption-1to3",
    code: "BLD-EXEMPTION-1TO3",
    label: "Building permit — exempt rate, three residential dwelling units or less, $15.00 per $1,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 1_500,
      incrementCents: 100_000,
    },
    minimumCents: 5_000,
    conditions: {
      all: [{ not: { field: "custom.moving_buildings", op: "eq", value: true } }, THREE_UNITS_OR_LESS],
    },
    description:
      'The schedule\'s own second line, printed beneath each of the four cost rows: "Exemption: $15.00 per $1,000.00 or fraction thereof of construction cost for three residential dwelling units or less, $50.00 minimum fee." It is selected by `custom.residential_units` at three or below, and the standard $20.00 rule above is written as the negation of that condition so a reader who does not state a unit count pays the standard rate rather than nothing. The word is the City\'s, and the row still charges: $18,750 in a two-unit house is nineteen steps of $15.00, or $285.00.',
  },
);

/**
 * Moving buildings: "$15.00 per $1,000 rounded up to the next thousand of the construction
 * cost ($50 minimum fee)" — the exempt rate for any building, whatever its unit count.
 */
export const CAMBRIDGE_MOVING_BUILDINGS_RULE: FeeRuleRecord = cambridgeRule(
  CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
  {
    id: "cambridge-bld-moving-buildings",
    code: "BLD-MOVING-BUILDINGS",
    label: "Building permit — moving buildings, $15.00 per $1,000 rounded up (minimum $50.00)",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 1_500,
      incrementCents: 100_000,
    },
    minimumCents: 5_000,
    conditions: { field: "custom.moving_buildings", op: "eq", value: true },
    description:
      'Cambridge\'s Building Fees page: "Moving buildings — $15.00 per $1,000 rounded up to the next thousand of the construction cost ($50 minimum fee)", printed twice in the table. It charges the Exemption rate without asking about dwelling units, so it is its own rule gated on `custom.moving_buildings` rather than a member of either ladder, and its own words — "rounded up to the next thousand" — are the second place the schedule states the round-up that "or fraction thereof" states four times.',
  },
);

/**
 * Sheet Metal, in the two parts the row prints: "$50 fee plus $25 per each 100 linear
 * feet". The $50.00 primary fee is a flat rule and the rate is $25.00 per hundred feet —
 * 25 cents a foot — charged on the run the reader supplies (`custom.linear_feet`), with no
 * block rounding: the sheet says "rounded up" where it means a block, and this row prints
 * neither phrase.
 */
export const CAMBRIDGE_SHEET_METAL_FEE_RULE: FeeRuleRecord = cambridgeRule(
  CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
  {
    id: "cambridge-bld-sheet-metal-fee",
    code: "BLD-SHEET-METAL-FEE",
    label: "Building permit — sheet metal, $50.00 primary fee",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: { field: "custom.linear_feet", op: "exists" },
    description:
      'Cambridge\'s Building Fees page: "Sheet Metal — $50 fee plus $25 per each 100 linear feet." The row is printed in two parts, so it charges in two rules: this one is the $50.00 primary fee, charged whenever a run is supplied for the rate beside it — the same shape Boston\'s sheet uses for its $20.00 and $50.00 primary fees. An application with no run pays nothing on either part.',
  },
);

export const CAMBRIDGE_SHEET_METAL_RATE_RULE: FeeRuleRecord = cambridgeRule(
  CAMBRIDGE_BUILDING_FEES_SOURCE_KEY,
  {
    id: "cambridge-bld-sheet-metal-rate",
    code: "BLD-SHEET-METAL-RATE",
    label: "Building permit — sheet metal, $25.00 per 100 linear feet",
    feeType: "per_unit",
    config: { unit: "linear_feet", centsPerUnit: 25 },
    conditions: { field: "custom.linear_feet", op: "exists" },
    description:
      'The rate half of the same row: "$25 per each 100 linear feet" is 25 cents for every foot of run, charged exactly on `custom.linear_feet` — 150 feet is $37.50 of rate. The row does not print "or fraction thereof" or "rounded up" — the two phrases this schedule uses elsewhere when it means a block — which is why no whole-hundred rounding is applied here, and why Sheet Metal is the one row on the page that prorates.',
  },
);

export const CAMBRIDGE_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  CAMBRIDGE_COST_PER_THOUSAND_RULE,
  CAMBRIDGE_EXEMPTION_RULE,
  CAMBRIDGE_MOVING_BUILDINGS_RULE,
  CAMBRIDGE_SHEET_METAL_FEE_RULE,
  CAMBRIDGE_SHEET_METAL_RATE_RULE,
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — the Electrical/Wiring Fees page                       */
/* -------------------------------------------------------------------------- */

function cambridgeElectricalRule(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return cambridgeRule(CAMBRIDGE_ELECTRICAL_FEES_SOURCE_KEY, overrides);
}

/**
 * "New Service — Per 100 AMPS — $10.00", and the identical "Service per 100 amps" row.
 *
 * $10.00 per hundred amperes is 10 cents an ampere, stated as an exact rate on the
 * `amperage` basis.
 */
export const CAMBRIDGE_SERVICE_RULE: FeeRuleRecord = cambridgeElectricalRule({
  id: "cambridge-elec-service",
  code: "ELEC-SERVICE",
  label: "Electrical permit — new or existing service, $10.00 per 100 amperes",
  feeType: "percent",
  config: {
    basis: "amperage",
    rate: { numerator: 10, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: { field: "custom.service_change", op: "eq", value: true },
  description:
    'Cambridge\'s Electrical/Wiring Fees page prints the row twice: "New Service — Per 100 AMPS — $10.00" and "Service per 100 amps — $10.00/100 amps". Both are one rate — ten dollars a hundred amperes, or ten cents an ampere — stated as an exact rate on the service\'s amperage, so a 200-ampere service is $20.00 and a 400-ampere one $40.00. The same page prices solar panels at the identical "$10/100 AMPS", which is named here rather than charged as a second service row.',
});

/**
 * The receptacle line: "Receptacles/air conditioners, check amps" — five prices for one
 * count, by the rating the reader supplies.
 *
 * 15 amps ($1.00) is the schedule's first row and the default when no rating is stated;
 * the other four are asked for by `custom.receptacle_amps`, so exactly one can charge.
 */
export const CAMBRIDGE_RECEPTACLE_RULES: FeeRuleRecord[] = [
  { amps: 15, centsPerUnit: 100, printed: "15 amps, each receptacle — $1.00" },
  { amps: 20, centsPerUnit: 400, printed: "20 amps, each receptacle, disposal, dishwasher — $4.00" },
  { amps: 30, centsPerUnit: 500, printed: "30 amps, each dryer — $5.00" },
  { amps: 50, centsPerUnit: 800, printed: "50 amps, each range, hot water heater/tub — $8.00" },
  { amps: 70, centsPerUnit: 1_500, printed: "70 amps, each — $15.00" },
].map((row, index, rows) => {
  const isFirstRow = index === 0;
  const otherRatings = rows.filter((other) => other.amps !== row.amps).map((other) => other.amps);
  return cambridgeElectricalRule({
    id: `cambridge-elec-receptacle-${row.amps}a`,
    code: `ELEC-RECEPTACLE-${row.amps}A`,
    label: `Electrical permit — receptacles at ${row.amps} amps, $${(row.centsPerUnit / 100).toFixed(2)} each`,
    feeType: "per_unit",
    config: { unit: "outlets", centsPerUnit: row.centsPerUnit },
    // The first row is the catch-all: written as not_in the other four ratings, which
    // matches an absent rating, so a reader who counts receptacles without saying what
    // they are is priced on the schedule's first row rather than charged nothing.
    conditions: isFirstRow
      ? { field: "custom.receptacle_amps", op: "not_in", value: otherRatings }
      : { field: "custom.receptacle_amps", op: "eq", value: row.amps },
    description: `Cambridge's Electrical/Wiring Fees page, under the line "Receptacles/air conditioners, check amps": "${row.printed}". The schedule prices one count of receptacles five ways by the rating the applicant states — the custom fact receptacle_amps — so exactly one of the five rows can charge, and the 15-ampere row doubles as the default when no rating is given. The rows also name the appliance each rating typically serves (disposal and dishwasher at 20 amps, dryer at 30, range and hot water heater at 50), which is the schedule's own hint that the rating, not the appliance, is what sets the price.`,
  });
});

/** "Meter, each — $5.00". */
export const CAMBRIDGE_METER_RULE: FeeRuleRecord = cambridgeElectricalRule({
  id: "cambridge-elec-meter",
  code: "ELEC-METER",
  label: "Electrical permit — $5.00 each meter",
  feeType: "per_unit",
  config: { unit: "meters", centsPerUnit: 500 },
  conditions: null,
  description:
    'Cambridge\'s Electrical/Wiring Fees page: "Meter, each — $5.00". The word "each" is on the page, so this is charged per meter on `custom.meters` — two meters are $10.00 — and it is excluded when no count is supplied, because a per-unit rule cannot price an absent count. The same page prices generators and alarm systems with no "each", which is why those rows are flat instead.',
});

/** "Generator — $100.00". */
export const CAMBRIDGE_GENERATOR_RULE: FeeRuleRecord = cambridgeElectricalRule({
  id: "cambridge-elec-generator",
  code: "ELEC-GENERATOR",
  label: "Electrical permit — generator, $100.00",
  feeType: "flat",
  config: { amountCents: 10_000 },
  conditions: { field: "custom.generator", op: "exists" },
  description:
    'Cambridge\'s Electrical/Wiring Fees page: "Generator — $100.00", printed with no "each" where the meter row prints one — so it is charged once for the permit whenever a generator is on it (`custom.generator` present) rather than per unit. Research record open question 4 notes the other reading: if ISD charges a generator per unit, a multi-generator job is undercharged here.',
});

/** "Alarm system (security & fire) — Residential $25.00 / Commercial $75.00". */
export const CAMBRIDGE_ALARM_RULES: FeeRuleRecord[] = [
  cambridgeElectricalRule({
    id: "cambridge-elec-alarm-residential",
    code: "ELEC-ALARM-RESIDENTIAL",
    label: "Electrical permit — alarm system, residential, $25.00",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: {
      all: [
        { field: "custom.alarm_system", op: "eq", value: true },
        { field: "occupancy", op: "eq", value: "residential" },
      ],
    },
    description:
      'Cambridge\'s Electrical/Wiring Fees page: "Alarm system (security & fire) — Residential — $25.00". Charged when the filing says an alarm system is in the scope (`custom.alarm_system`) and the project\'s occupancy is residential. The schedule gives two prices for one row — residential and commercial — so the pair is two rules on one fact.',
  }),
  cambridgeElectricalRule({
    id: "cambridge-elec-alarm-commercial",
    code: "ELEC-ALARM-COMMERCIAL",
    label: "Electrical permit — alarm system, commercial, $75.00",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        { field: "custom.alarm_system", op: "eq", value: true },
        { field: "occupancy", op: "not_in", value: ["residential"] },
      ],
    },
    description:
      'The same schedule row at its second price: "Alarm system (security & fire) — Commercial — $75.00". Written as not residential, which also matches an occupancy the reader has not stated: for a two-price row the schedule\'s larger figure is the honest default, and the $25.00 residential price has to be asked for. Only one of the two can charge, because both read the same two facts.',
  }),
];

/** "Re-inspection of code violation — $50.00". */
export const CAMBRIDGE_ELECTRICAL_REINSPECTION_RULE: FeeRuleRecord = cambridgeElectricalRule({
  id: "cambridge-elec-re-inspection",
  code: "ELEC-RE-INSPECTION",
  label: "Electrical permit — re-inspection of code violation, $50.00",
  feeType: "flat",
  config: { amountCents: 5_000 },
  conditions: { field: "custom.re_inspection", op: "eq", value: true },
  componentType: "inspection",
  priority: 800,
  description:
    'Cambridge\'s Electrical/Wiring Fees page: "Re-inspection of code violation — $50.00". An inspection charge rather than the permit fee, so it is declared as an inspection component with a later priority and gated on `custom.re_inspection` — it is not part of what a first-time permit costs, and the page says so beside the total.',
});

export const CAMBRIDGE_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  CAMBRIDGE_SERVICE_RULE,
  ...CAMBRIDGE_RECEPTACLE_RULES,
  CAMBRIDGE_METER_RULE,
  CAMBRIDGE_GENERATOR_RULE,
  ...CAMBRIDGE_ALARM_RULES,
  CAMBRIDGE_ELECTRICAL_REINSPECTION_RULE,
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — the Plumbing Fees page                                  */
/* -------------------------------------------------------------------------- */

function cambridgePlumbingRule(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return cambridgeRule(CAMBRIDGE_PLUMBING_FEES_SOURCE_KEY, overrides);
}

/**
 * The fixture block: "$50.00 for 5 fixtures, $5.00 for each additional fixture".
 *
 * A five-fixture allowance with a base, not five fixtures at $10: one to five fixtures are
 * $50.00 together and each one after the fifth adds $5.00.
 */
export const CAMBRIDGE_FIXTURE_BLOCK_RULE: FeeRuleRecord = cambridgePlumbingRule({
  id: "cambridge-plumb-fixture-block",
  code: "PLUMB-FIXTURE-BLOCK",
  label: "Plumbing permit — $50.00 for five fixtures, $5.00 for each additional fixture",
  feeType: "per_unit",
  config: { unit: "fixtures", baseCents: 5_000, thresholdUnits: 5, centsPerUnit: 500 },
  conditions: null,
  description:
    'Cambridge\'s Plumbing Fees page defines the count and its price in one cell: the fixture list — "Bathtub, Dishwasher, Drinking Fountain, Floor/Area Drain, Food Disposal, Icemaker, Kitchen Sink, Lavatory, Roof Drain, Mop Sink, Shower Stall, Toilet, Urinal, Washing Machine" — marked "Include in Fixture Count", priced "$50.00 for 5 fixtures, $5.00 for each additional fixture". That is a $50.00 base covering the first five and $5.00 after them: three fixtures are $50.00, five are $50.00, eight are $65.00. It is the opposite shape from Boston\'s straight $5.00-a-fixture row three miles east, and both are asserted in their cities\' tests.',
});

/** Water heaters: "$50.00" for electric, gas and indirect; "$100.00" for tankless. */
export const CAMBRIDGE_WATER_HEATER_RULES: FeeRuleRecord[] = [
  cambridgePlumbingRule({
    id: "cambridge-plumb-water-heater",
    code: "PLUMB-WATER-HEATER",
    label: "Plumbing permit — water heater (electric, gas or indirect), $50.00",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: {
      field: "custom.water_heater",
      op: "in",
      value: ["electric", "gas", "indirect"],
    },
    description:
      'Cambridge\'s Plumbing Fees page prints three rows at one price — "Water Heater (electric) $50.00", "Water Heater (gas) $50.00" and "Water Heater (inderect) $50.00" (the typo is the page\'s) — so one rule charges all three when `custom.water_heater` names one of them. The tankless row prints $100.00 and is its own rule.',
  }),
  cambridgePlumbingRule({
    id: "cambridge-plumb-water-heater-tankless",
    code: "PLUMB-WATER-HEATER-TANKLESS",
    label: "Plumbing permit — tankless water heater, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { field: "custom.water_heater", op: "eq", value: "tankless" },
    description:
      'Cambridge\'s Plumbing Fees page: "Water Heater (tankless) — $100.00" — twice the tanked price, and separate from it, so the two rules are mutually exclusive by the value of `custom.water_heater`.',
  }),
];

/** The plumbing page's own header lines: "Re-Inspection Fee - $50.00". */
export const CAMBRIDGE_PLUMBING_REINSPECTION_RULE: FeeRuleRecord = cambridgePlumbingRule({
  id: "cambridge-plumb-re-inspection",
  code: "PLUMB-RE-INSPECTION",
  label: "Plumbing permit — re-inspection fee, $50.00",
  feeType: "flat",
  config: { amountCents: 5_000 },
  conditions: { field: "custom.re_inspection", op: "eq", value: true },
  componentType: "inspection",
  priority: 800,
  description:
    'The header of Cambridge\'s Plumbing Fees page, beside the triple-fee warning: "Re-Inspection Fee - $50.00", and a second line for failing to call the final inspection — "Failure to call for final inspection within 5 days of completion - $50.00". The two are the same $50.00 on the page, so this rule charges the re-inspection once when `custom.re_inspection` is set, as an inspection component rather than part of the permit fee. The failure-to-call line is a consequence of not calling, and is named rather than charged a second time.',
});

export const CAMBRIDGE_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  CAMBRIDGE_FIXTURE_BLOCK_RULE,
  ...CAMBRIDGE_WATER_HEATER_RULES,
  CAMBRIDGE_PLUMBING_REINSPECTION_RULE,
];
