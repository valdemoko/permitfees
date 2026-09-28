import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Saint Paul, Minnesota fee rules — REAL DATA.
 *
 * Sources (research/minnesota/saint-paul.md records how each was read):
 *
 *  S1  DSI Building Permit Fee Schedule — the City's own three-page PDF, "Effective:
 *      2/25/2023", linked from the Building Permits & Inspections page.
 *      https://www.stpaul.gov/sites/default/files/2023-02/DSI.BldgPermitFeeSchedule.2023_0_3.pdf
 *  S2  The electrical fee pages — the trade hub and its subpages, each with its own table
 *      (service/circuits, air conditioner/furnace/boiler, capacitor/generator/transformer,
 *      low voltage, fire alarm, solar PV).
 *      https://www.stpaul.gov/departments/safety-inspections/building-and-construction/construction-permits-and-inspections/electrical-permits-inspections
 *  S3  Plumbing application and inspection fees — the plumbing trade's own fee table,
 *      "Initial permit fee $92" plus four per-unit and per-block rows.
 *      https://www.stpaul.gov/departments/safety-inspections/building-and-construction/construction-permits-and-inspections/plumbing-gas/plumbing-application-inspection-fees
 *  S4  Minnesota Statutes § 326B.148 — the state surcharge the building schedule names and
 *      defers to above $1,000,000 of valuation.
 *      https://www.revisor.mn.gov/statutes/cite/326B.148
 *
 * **The mechanism, in three sentences.** The building permit is a valuation table — $36 at
 * the bottom, a continuous arithmetic of "$X for the first $Y plus $Z for each additional
 * $1,000 or fraction thereof" through $1,522 at $100,000, then three printed open bands —
 * with a plan check of 65% of the permit fee and the state surcharge on top. Plumbing is
 * the simplest permit in the dataset: a $92 base plus $36 per plumbing unit, $6 per water
 * unit, $34 per gas unit and $15 for each 100,000 BTU a unit is rated above 100,000. And
 * electrical is the City's own — DSI's Electrical Inspection Department prices each
 * sub-permit on its own page: services at $85 and circuits at $15, equipment at $15 a unit,
 * low-voltage at $85 a panel and $2 a device, fire alarm at $78 and $1.88, power equipment
 * at $54 a unit and $1 a KVA, and solar by kilowatts.
 *
 * **Five readings this module depends on, all stated on the instruments.**
 *
 *  1. **The building table is one continuous arithmetic, not 103 published brackets.** Every
 *     row from $501 to $100,000 is the same shape with three rates: $36.00 plus $5.00 per
 *     $100 (or fraction) from $501 to $2,000, $106.00 plus $21.00 per $1,000 from $2,001 to
 *     $25,000, $591.00 plus $15.00 per $1,000 from $25,001 to $50,000, and $972.00 plus
 *     $11.00 per $1,000 from $50,001 to $100,000. Each segment's base is the value the
 *     schedule's own rows reach at that segment's floor, so the model reproduces 100 of the
 *     103 printed rows exactly. The three it does not are named in the research record: the
 *     sheet drops its $81,001–$82,000 and $83,001–$84,000 rows entirely, and prints $1,369
 *     for $85,001–$86,000 where its own arithmetic gives $1,368. The calculator charges the
 *     arithmetic, which is what every other row of the table states.
 *  2. **Above $100,000 the sheet prints its own bases, and they step down.** "$1,499 for the
 *     first $100,000 plus $8 for each additional $1,000", "$4,899 for the first $500,000 plus
 *     $7", "$8,463 for the first $1,000,000 plus $5". The $1,499 is *below* the $1,522 the
 *     closed table reaches at $100,000 — a seam the document contains, charged as printed,
 *     exactly as Minneapolis's two-cent seam is.
 *  3. **The plan check is 65% of the permit fee, and only above $1,000 of valuation.** The
 *     sheet's own two rows: "Valuations ≤ $1,000 = no fee; Valuations > $1,000 = 65% of permit
 *     fee from table above". Same relationship Minneapolis's formula states, read off a
 *     different instrument.
 *  4. **The surcharge is the statute's, and the schedule defers to it.** "Value $1.00-$1,000
 *     = $0.50", "$1,000,000 = 0.0005 x Job Value", "> $1,000,000 = see statute" — and
 *     § 326B.148 subd. 1 is the statute: one-half mill of the valuation to $1,000,000, then
 *     $500 plus two-fifths mill to $2,000,000, and so on in four more bands. The model states
 *     those bands as marginal rates, which is what the statute's own escalating structure is;
 *     the $0.50 floor is the schedule's first row.
 *  5. **Saint Paul prices electrical itself.** Unlike Minneapolis, where the State's Electrical
 *     Act gives the permit to DLI, Saint Paul's DSI Electrical Inspection Department publishes
 *     its own fee table per sub-permit — the same trade priced by the City on both sides of
 *     the river. Each table carries its own minimum ($85 for services, equipment, low voltage
 *     and power equipment; $78 for fire alarm) and the same "$1.00 minimum state surcharge".
 *
 * **What is deliberately NOT here:** the demolition table (cubic feet of structure), the fence
 * table (lineal feet), the stucco/plaster 1%-of-cost row, the grading and site-plan rows, the
 * Fire Engineering permit's own fire-alarm table (a Fire Department permit priced beside the
 * electrical one), the elevator and warm-air schedules, and the plumbing plan review's
 * requirement rules (a when-it-is-required document with no fee in it). This module is the
 * single definition of Saint Paul's fee rules: the seed writes exactly these records and the
 * tests assert against exactly these records.
 */

/** The building schedule prints its own date: "Effective: 2/25/2023". */
export const SAINT_PAUL_BUILDING_FEE_EFFECTIVE_FROM = "2023-02-25";

/**
 * The City pages that carry the electrical and plumbing tables print no date of their own.
 * The date carried is the PAULIE platform's launch — 2025-09-17 — because it is the date the
 * fee pages were rewritten into the platform they now describe, and no later fee-change
 * notice appears on any of them. A Legislative Code § 33.04 amendment date would replace it.
 */
export const SAINT_PAUL_TRADE_FEE_EFFECTIVE_FROM = "2025-09-17";

export const SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY = "saint-paul-building-fee-schedule";
export const SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY = "saint-paul-electrical-fee-pages";
export const SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY = "saint-paul-plumbing-fee-page";
export const MINNESOTA_326B148_SOURCE_KEY = "minnesota-statute-326b148";

/** The plan check's share of the permit fee, printed on the schedule. */
export const SAINT_PAUL_PLAN_CHECK_SHARE = { numerator: 13, denominator: 20 };

/** The State's surcharge rate below $1,000,000 of valuation: one-half mill. */
export const SAINT_PAUL_SURCHARGE_RATE = { numerator: 1, denominator: 2_000 };

function spRule(
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
    effectiveFrom: SAINT_PAUL_BUILDING_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

function spTradeRule(
  sourceId: string,
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return spRule(sourceId, { effectiveFrom: SAINT_PAUL_TRADE_FEE_EFFECTIVE_FROM, ...overrides });
}

/* -------------------------------------------------------------------------- */
/* Building permits — the valuation table, the plan check, the state surcharge */
/* -------------------------------------------------------------------------- */

/** The scopes the electrical sub-permit tables are selected by. */
export type SaintPaulElectricalScope =
  | "service_circuit"
  | "ac_furnace_boiler"
  | "low_voltage"
  | "fire_alarm"
  | "power_equipment"
  | "solar_pv";

export const SAINT_PAUL_ELECTRICAL_SCOPES: SaintPaulElectricalScope[] = [
  "service_circuit",
  "ac_furnace_boiler",
  "low_voltage",
  "fire_alarm",
  "power_equipment",
  "solar_pv",
];

/** Every electrical table except fire alarm carries an $85 minimum; fire alarm carries $78. */
const MINIMUM_SCOPES: SaintPaulElectricalScope[] = [
  "service_circuit",
  "ac_furnace_boiler",
  "low_voltage",
  "power_equipment",
];

export const SAINT_PAUL_BUILDING_BAND_RULES: FeeRuleRecord[] = [
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-bld-band-1",
    code: "BLD-BAND-1",
    label: "Building permit — $36.00 for the first $500, plus $5.00 per additional $100 or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 3_600,
      thresholdCents: 50_000,
      centsPerThousand: 5_000,
      incrementCents: 10_000,
    },
    conditions: { field: "valuation", op: "lte", value: 200_000 },
    description:
      'The printed table\'s first seventeen rows, as one arithmetic: "0 to 500 = 36", then $41 at $501–$600, $46 at $601–$700 and so on to $111 at $1,901–$2,000 — $36.00 plus $5.00 per $100 of value above $500, with the fraction phrase implied by every $100-wide row. The schedule writes the step as a row rather than as a rate, which is why the increment is $100 here and $1,000 everywhere above $2,000.',
  }),
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-bld-band-2",
    code: "BLD-BAND-2",
    label: "Building permit — $2,001 to $25,000: $106.00 plus $21.00 per $1,000 or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 10_600,
      thresholdCents: 200_000,
      centsPerThousand: 2_100,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 200_000 }, { field: "valuation", op: "lte", value: 2_500_000 }],
    },
    description:
      'The table\'s rows from "$2,001 to $3,000 = 127" to "24,001 to 25,000 = 589", one rate: $21.00 per $1,000. The base is $106.00, not the $111.00 the table prints at $2,000 — the sheet\'s own seam, where the $5-per-$100 arithmetic of the band below and the $21-per-$1,000 arithmetic of this one meet and the two rows differ by $16. Every row from $2,001 up is reproduced exactly; $2,000 itself belongs to band 1 and pays its printed $111.00.',
  }),
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-bld-band-3",
    code: "BLD-BAND-3",
    label: "Building permit — $25,001 to $50,000: $591.00 plus $15.00 per $1,000 or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 59_100,
      thresholdCents: 2_500_000,
      centsPerThousand: 1_500,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 2_500_000 }, { field: "valuation", op: "lte", value: 5_000_000 }],
    },
    description:
      'The table\'s rows from "25,001 to 26,000 = 606" to "49,001 to 50,000 = 966" — $15.00 per $1,000 over a $591.00 base, which is the value the band below reaches at $25,000 ($106.00 + 23 × $21.00 = $589.00 printed as $589, and the sheet\'s rows from 25,001 up are 606 = 591 + 15). The base is the band\'s own arithmetic at its floor, which is what keeps every printed row exact.',
  }),
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-bld-band-4",
    code: "BLD-BAND-4",
    label: "Building permit — $50,001 to $100,000: $972.00 plus $11.00 per $1,000 or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 97_200,
      thresholdCents: 5_000_000,
      centsPerThousand: 1_100,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 5_000_000 }, { field: "valuation", op: "lte", value: 10_000_000 }],
    },
    description:
      'The table\'s rows from "50,001 to 51,000 = 983" to "99,001 to 100,000 = 1,522" — $11.00 per $1,000 over a $972.00 base. Three of the table\'s rows are not what the arithmetic says and are named rather than smoothed: the sheet omits $81,001–$82,000 and $83,001–$84,000 entirely (the arithmetic gives $1,324 and $1,346), and prints $1,369 for $85,001–$86,000 where every neighbouring row gives $1,368. The calculator charges the arithmetic, because the table states one rate here and three rows is transcription noise rather than a printed base.',
  }),
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-bld-band-5",
    code: "BLD-BAND-5",
    label: "Building permit — $100,001 to $500,000: $1,499.00 plus $8.00 per $1,000 or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 149_900,
      thresholdCents: 10_000_000,
      centsPerThousand: 800,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 10_000_000 }, { field: "valuation", op: "lte", value: 50_000_000 }],
    },
    description:
      'The sheet\'s printed open band, in full: "$100,001 TO $500,000 $1,499 for the first $100,000 plus $8 for each additional $1,000 or fraction thereof". The $1,499 is $23 below the $1,522 the closed table reaches at $100,000 — the document\'s own step down at the seam, charged as printed.',
  }),
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-bld-band-6",
    code: "BLD-BAND-6",
    label: "Building permit — $500,001 to $1,000,000: $4,899.00 plus $7.00 per $1,000 or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 489_900,
      thresholdCents: 50_000_000,
      centsPerThousand: 700,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 50_000_000 }, { field: "valuation", op: "lte", value: 100_000_000 }],
    },
    description:
      'The sheet\'s second open band: "$500,001 - $1,000,000 $4,899 for the first $500,000 plus $7 for each additional $1,000 or fraction thereof". At $1,000,000 it reaches $8,399.00.',
  }),
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-bld-band-7",
    code: "BLD-BAND-7",
    label: "Building permit — $1,000,000 and up: $8,463.00 plus $5.00 per $1,000 or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 846_300,
      thresholdCents: 100_000_000,
      centsPerThousand: 500,
      incrementCents: 100_000,
    },
    conditions: { field: "valuation", op: "gt", value: 100_000_000 },
    description:
      'The sheet\'s top open band: "$1,000,000 & Up $8,463 for the first $1,000,000 plus $5 for each additional $1,000 or fraction thereof" — the only band with no upper seam, and the rate the surcharge statute stops scaling at.',
  }),
];

export const SAINT_PAUL_BUILDING_SURCHARGE_RULES: FeeRuleRecord[] = [
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-bld-plan-check",
    code: "BLD-PLAN-CHECK",
    label: "Plan check — 65% of the building permit fee, on valuations above $1,000",
    feeType: "percent",
    config: {
      basis: "permit_fee",
      rate: SAINT_PAUL_PLAN_CHECK_SHARE,
      rateUnit: "fraction",
    },
    componentType: "plan_review",
    priority: 300,
    conditions: { field: "valuation", op: "gt", value: 100_000 },
    description:
      'The schedule\'s plan check block, read across its rows: "PLAN CHECK FEE: Valuations ≤ $1,000 = no fee; Valuations > $1,000 = 65% of permit fee from table above". Two things are stated there and both are modelled: the share is 65% of the permit fee rather than of the job, and a $1,000-or-less valuation is not charged a plan check at all — so the rule is gated on the valuation the table reads.',
  }),
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-mn-surcharge",
    code: "MN-SURCHARGE",
    label: "Minnesota state surcharge — one-half mill of the valuation, banded per M.S. 326B.148",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 100_000_000, rateBps: 5 },
        { upToCents: 200_000_000, rateBps: 4 },
        { upToCents: 300_000_000, rateBps: 3 },
        { upToCents: 400_000_000, rateBps: 2 },
        { upToCents: 500_000_000, rateBps: 1 },
      ],
    },
    minimumCents: 50,
    componentType: "state_surcharge",
    priority: 700,
    description:
      'The schedule\'s surcharge block names the statute and defers to it above $1,000,000: "Value $1.00 - $1,000 = $0.50", "$1,000,000 = 0.0005 x Job Value", "> $1,000,000 = see statute", under the heading "Minnesota Statute 326B.148". The statute\'s bands are marginal and the marginal rates reproduce it exactly without a compensating base: one-half mill to $1,000,000 gives $500 at the seam, then two-fifths mill to $2,000,000 adds $400 for the $900 the statute prints at $2,000,000, and so on through three-tenths, one-fifth and one-tenth mill. The $0.50 is the schedule\'s own first row, the minimum the statute would otherwise let fall to a fraction of a cent.',
  }),
  spRule(SAINT_PAUL_BUILDING_SCHEDULE_SOURCE_KEY, {
    id: "saint-paul-mn-surcharge-over-5m",
    code: "MN-SURCHARGE-OVER-5M",
    label: "Minnesota state surcharge — one-twentieth mill above $5,000,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      thresholdCents: 500_000_000,
      centsPerThousand: 5,
    },
    conditions: { field: "valuation", op: "gt", value: 500_000_000 },
    componentType: "state_surcharge",
    priority: 710,
    description:
      'The statute\'s last band, "if the valuation exceeds $5,000,000, the surcharge is $1,500 plus one-twentieth mill (.00005) of the value that exceeds $5,000,000" — and the $1,500 is what the banded rule above already charges at $5,000,000, so this rule carries only the excess: $0.05 per $1,000 above the seam, no base of its own. One-twentieth mill is half a basis point, which the basis-point form cannot state as a whole number; as five cents per $1,000 it is exact.',
  }),
];

export const SAINT_PAUL_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  ...SAINT_PAUL_BUILDING_BAND_RULES,
  ...SAINT_PAUL_BUILDING_SURCHARGE_RULES,
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — the $92 base and four count rows                        */
/* -------------------------------------------------------------------------- */

export const SAINT_PAUL_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  spTradeRule(SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY, {
    id: "saint-paul-plumb-base",
    code: "PLUMB-BASE",
    label: "Plumbing permit — initial permit fee, $92.00",
    feeType: "flat",
    config: { amountCents: 9_200 },
    description:
      'The plumbing fee table\'s first row: "Initial permit fee | $92". It is a base rather than a minimum — the table prints no minimum row of its own, and the four count rows below it are additions to this figure, so a plumbing permit pricing at the base alone is $92.00 plus the $1.00 state surcharge. Saint Paul\'s plumbing table is the shortest permit price in the dataset: one base and four counts.',
  }),
  spTradeRule(SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY, {
    id: "saint-paul-plumb-unit",
    code: "PLUMB-UNIT",
    label: "Plumbing permit — $36.00 per plumbing unit",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 3_600 },
    description:
      'The table\'s second row: "Per unit - Plumbing | $36". The sheet\'s own noun is "unit"; the count is the plumbing fixtures and fixture groups on the application, and the fact is the dataset\'s `fixtures` count for the same reason Minneapolis\'s is — it is the plumbing trade\'s own unit count, and water and gas are counted separately beside it.',
  }),
  spTradeRule(SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY, {
    id: "saint-paul-plumb-water-unit",
    code: "PLUMB-WATER-UNIT",
    label: "Plumbing permit — $6.00 per water unit",
    feeType: "per_unit",
    config: { unit: "water_units", centsPerUnit: 600 },
    description:
      'The table\'s third row: "Per unit - Water | $6". The schedule divides a plumbing job three ways — plumbing, water, gas — and prices each count separately, so the water units are their own fact: a permit\'s water heaters and water-distribution appliances are not fixtures on this table, and sharing the count would bill the plumbing row twice.',
  }),
  spTradeRule(SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY, {
    id: "saint-paul-plumb-gas-unit",
    code: "PLUMB-GAS-UNIT",
    label: "Plumbing permit — $34.00 per gas unit",
    feeType: "per_unit",
    config: { unit: "gas_units", centsPerUnit: 3_400 },
    description:
      'The table\'s fourth row: "Per unit - Gas | $34". Gas fitting is a permit category of its own in PAULIE, and the plumbing table prices gas units as a row of the plumbing permit; the count is a fact of its own, for the same reason the water count is.',
  }),
  spTradeRule(SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY, {
    id: "saint-paul-plumb-btu",
    code: "PLUMB-BTU",
    label: "Plumbing permit — $15.00 for each 100,000 BTU above the first, per unit",
    feeType: "per_unit",
    config: { unit: "btu_blocks", centsPerUnit: 1_500, thresholdUnits: 1 },
    description:
      'The table\'s fifth row, in full: "If unit BTU\'s greater than 100,000, additional fee for each 100,000 BTU\'s or fraction thereof | $15". The row charges on a unit\'s rated capacity rather than on how many units there are, so the count is blocks of 100,000 BTU with the first block included — the threshold is the "greater than 100,000" the row states, and a 250,000 BTU boiler is three blocks, two of them chargeable, $30.00.',
  }),
  spTradeRule(SAINT_PAUL_PLUMBING_PAGES_SOURCE_KEY, {
    id: "saint-paul-mn-plumb-surcharge",
    code: "MN-PLUMB-SURCHARGE",
    label: "Minnesota state surcharge — $1.00 per plumbing permit",
    feeType: "flat",
    config: { amountCents: 100 },
    componentType: "state_surcharge",
    priority: 700,
    description:
      'The table\'s last row: "State Surcharge | $1". The City prints it as a flat dollar rather than the "minimum" the electrical pages print, so it is charged as printed — a flat $1.00 on every plumbing permit, above the $92 base and every count row.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — the City's own, one table per sub-permit              */
/* -------------------------------------------------------------------------- */

export const SAINT_PAUL_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-service",
    code: "ELEC-SERVICE",
    label: "Electrical permit — $85.00 per service, new, altered or repaired",
    feeType: "per_unit",
    config: { unit: "electrical_services", centsPerUnit: 8_500 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "service_circuit" },
    description:
      'The service and circuit table\'s first row: "Per Service; New, Altered, or Repaired | $85.00". Saint Paul prices a service as a flat amount per service rather than by amperage or by circuit count, which is where it parts company with Minneapolis\'s state worksheets — the same permit, priced by count on one side of the river and by amperage on the other.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-circuit",
    code: "ELEC-CIRCUIT",
    label: "Electrical permit — $15.00 per circuit, new, altered or repaired",
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 1_500 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "service_circuit" },
    description:
      'The table\'s second row: "Per Circuit; New, Altered, or Repaired | $15.00". The count is the circuits on the application, and the row stacks with the service row on one permit: a service with four circuits is $85.00 + $60.00.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-ac-unit",
    code: "ELEC-AC-UNIT",
    label: "Electrical permit — air conditioning unit installed, $15.00 per unit",
    feeType: "per_unit",
    config: { unit: "ac_units", centsPerUnit: 1_500 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "ac_furnace_boiler" },
    description:
      'The air conditioner, furnace and boiler table\'s first row: "Per Unit Installed, Per Circuit | $15". The table is its own permit — an appliance installed with its own circuit — and the row prices it per unit installed. The table\'s second row, "Per Unit Installed, With Other Electrical Work, No New Circuit | $0", is why this rule is scoped: an appliance installed under another electrical permit already covers its circuit, and charging the unit row beside a service and circuit permit would bill the same circuit twice.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-furnace-unit",
    code: "ELEC-FURNACE-UNIT",
    label: "Electrical permit — furnace installed, $15.00 per unit",
    feeType: "per_unit",
    config: { unit: "furnaces", centsPerUnit: 1_500 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "ac_furnace_boiler" },
    description:
      'The same table, read for the second appliance it names: a furnace installed on its own circuit is $15.00. One table, one price, three appliances — so the price is stated once per appliance the applicant actually has, and a job with both an air conditioner and a furnace pays both rows.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-boiler-unit",
    code: "ELEC-BOILER-UNIT",
    label: "Electrical permit — boiler installed, $15.00 per unit",
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 1_500 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "ac_furnace_boiler" },
    description:
      'The third appliance on the same table: a boiler installed on its own circuit is $15.00. The schedule prints one row for all three — "Per Unit Installed, Per Circuit $15" — and the model states it once per appliance so the breakdown says which machine was charged.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-low-voltage-panel",
    code: "ELEC-LV-PANEL",
    label: "Electrical permit — low voltage control panel, $85.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 8_500 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "low_voltage" },
    description:
      'The low voltage table\'s first row: "Per Control Panel | $85.00" — per panel, and one panel costs exactly the table\'s own minimum, which is why the two rows look like one. The count is the dataset\'s electrical panel fact, shared with the fire alarm table below and separated from it by scope, so one system\'s panels can never be charged on both.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-low-voltage-device",
    code: "ELEC-LV-DEVICE",
    label: "Electrical permit — low voltage devices, $2.00 each",
    feeType: "per_unit",
    config: { unit: "low_voltage_points", centsPerUnit: 200 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "low_voltage" },
    description:
      'The table\'s second row: "Per Device | $2.00". The devices are the low-voltage points the table prices — speakers, sensors, door stations and the like — and the count is the dataset\'s low-voltage point fact, the kind Clark County\'s signals-and-alarms row reads.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-fire-alarm-panel",
    code: "ELEC-FIRE-ALARM-PANEL",
    label: "Electrical permit — fire alarm control panel, $78.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 7_800 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "fire_alarm" },
    description:
      'The fire alarm page\'s electrical permit table, first row: "Per Control Panel | $78.00", against a "Minimum Fee | $78.00" of its own — the one electrical table in Saint Paul whose floor is not $85. The scope selects it: the page carries two fire alarm tables (the electrical permit\'s and the Fire Engineering permit\'s), and the electrical permit is the one the trade page prices.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-fire-alarm-device",
    code: "ELEC-FIRE-ALARM-DEVICE",
    label: "Electrical permit — fire alarm devices, $1.88 each",
    feeType: "per_unit",
    config: { unit: "low_voltage_points", centsPerUnit: 188 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "fire_alarm" },
    description:
      'The table\'s second row: "Per Device (Horn, Strobe, Pull Station, Etc.) | $1.88". The devices are the same low-voltage point fact the low-voltage table reads, separated from it by scope: a horn on a fire alarm system is a device on both tables, and only one of them may charge it.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-power-device",
    code: "ELEC-POWER-DEVICE",
    label: "Electrical permit — capacitor, generator or transformer, $54.00 per unit installed",
    feeType: "per_unit",
    config: { unit: "power_devices", centsPerUnit: 5_400 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "power_equipment" },
    description:
      'The capacitor, generator and transformer table, first row: "Per unit installed | $54.00". One price for three machines, charged per machine installed, with the table\'s own $85.00 minimum beneath it.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-kva",
    code: "ELEC-KVA",
    label: "Electrical permit — $1.00 per KVA or KVAR, or fraction thereof",
    feeType: "per_unit",
    config: { unit: "kilovolt_amperes", centsPerUnit: 100 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "power_equipment" },
    description:
      'The table\'s second row: "For KVA or KVAR; or fraction thereof | $1.00". The capacity of the equipment is a second charge beside the count of machines, in its own unit — the count is entered in whole KVA, so the row\'s "or fraction thereof" is the applicant\'s own rounding up of a fractional rating.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-solar-small",
    code: "ELEC-SOLAR-0-20",
    label: "Electrical permit — solar PV system, 0 to 20 kW, $138.00",
    feeType: "flat",
    config: { amountCents: 13_800 },
    conditions: {
      all: [
        { field: "custom.kilowatts", op: "exists" },
        { field: "custom.kilowatts", op: "lte", value: 20 },
      ],
    },
    description:
      'The solar PV table\'s first band: "0-20 kW (kilowatt) System | $138.00". The table prices a system by its capacity rather than by panels or circuits, and this band is a flat fee for the whole range — the fee does not step inside it.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-solar-medium",
    code: "ELEC-SOLAR-21-40",
    label: "Electrical permit — solar PV system, 21 to 40 kW, $332.00",
    feeType: "flat",
    config: { amountCents: 33_200 },
    conditions: {
      all: [
        { field: "custom.kilowatts", op: "gt", value: 20 },
        { field: "custom.kilowatts", op: "lte", value: 40 },
      ],
    },
    description:
      'The table\'s second band: "21-40 kW System | $332.00" — again a flat fee across the whole band, and the band that makes Saint Paul\'s solar table worth reading twice: the fee more than doubles between 20 kW and 21 kW, then the band above it starts lower than either.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-solar-large",
    code: "ELEC-SOLAR-ABOVE-40",
    label: "Electrical permit — solar PV system above 40 kW, $315.00 plus $3.00 per kW above 40",
    feeType: "per_unit",
    config: { unit: "kilowatts", baseCents: 31_500, thresholdUnits: 40, centsPerUnit: 300 },
    conditions: { field: "custom.kilowatts", op: "gt", value: 40 },
    description:
      'The table\'s third band, in full: "Above 40 kW | $315, plus $3.00 for every kW above 40 kW". The base covers the first forty kilowatts and the rate steps above them — $315.00 is $17.00 below the $332.00 the band beneath charges at 40 kW, the same step-down shape the building table\'s open bands show at their seams, charged as printed.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-minimum",
    code: "ELEC-MINIMUM",
    label: "Electrical permit — $85.00 minimum fee",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 8_500 },
    conditions: {
      field: "custom.electrical_scope",
      op: "in",
      value: [...MINIMUM_SCOPES],
    },
    componentType: "base",
    priority: 200,
    description:
      'Four of the electrical tables print the same floor — "Minimum Fee | $85.00" on the service and circuit table and on the appliance, low-voltage and power-equipment tables — so one rule carries them, selected by the scope those tables are priced under. It is a floor on the permit fee, charged as the shortfall: one circuit alone computes $15.00 and pays $85.00. The solar table prints no minimum (its lowest band is $138.00) and the fire alarm table prints $78.00, which has its own rule.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-elec-fire-alarm-minimum",
    code: "ELEC-FIRE-ALARM-MINIMUM",
    label: "Electrical permit — fire alarm minimum fee, $78.00",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 7_800 },
    conditions: { field: "custom.electrical_scope", op: "eq", value: "fire_alarm" },
    componentType: "base",
    priority: 200,
    description:
      'The fire alarm table\'s own floor: "Minimum Fee | $78.00", the same figure as its control panel row, so a fire alarm permit with devices and no panel still pays $78.00. Kept apart from the $85.00 minimum because the page prints two different floors, and a rule that carried both would be stating one of them wrongly.',
  }),
  spTradeRule(SAINT_PAUL_ELECTRICAL_PAGES_SOURCE_KEY, {
    id: "saint-paul-mn-elec-surcharge",
    code: "MN-ELEC-SURCHARGE",
    label: "Minnesota state surcharge — one-half mill of the permit fee, $1.00 minimum",
    feeType: "percent",
    config: {
      basis: "permit_fee",
      rate: SAINT_PAUL_SURCHARGE_RATE,
      rateUnit: "fraction",
    },
    minimumCents: 100,
    componentType: "state_surcharge",
    priority: 700,
    description:
      'Every electrical table ends with the same row, and the word in it is the point: "Minimum State Surcharge | $1.00" on four tables, "State Surcharge (Minimum) | $1.00" on the fifth, "State Surcharge (minimum) | $1.00" on the solar table. A minimum on a surcharge is § 326B.148\'s own shape — one-half mill of the fee or $1, whichever is greater — so the rule charges 0.0005 of the permit fee with a $1.00 floor rather than a flat dollar, which is what the electrical pages say and what the plumbing page, printing a plain "$1", does not.',
  }),
];
