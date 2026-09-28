import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Boulder City, Nevada fee rules — REAL DATA.
 *
 * Sources (research/nevada/boulder-city.md records the retrieval method and the
 * hash of the file that was read):
 *
 *  S1  City of Boulder City, "Permit Fee Schedule and Valuation Table", Building and
 *      Safety Division, effective 3 August 2020. Two pages; the Valuation Table is
 *      on page 2.
 *      https://www.bcnv.org/DocumentCenter/View/68/2020-Fee-Schedule-PDF
 *
 *  S2  City of Boulder City, "Building Permit Guidelines and Forms" — the Building
 *      and Safety Division's own landing page, which publishes S1 as the current
 *      schedule.
 *      http://bcnv.org/171/Building-Permit-Guidelines-and-Forms
 *
 * **Why Boulder City is the second Nevada jurisdiction.** It is not the second
 * largest city in the state — Las Vegas, Henderson and North Las Vegas all are, and
 * all three publish their figures through client-rendered calculators or a code host
 * that renders in the browser, so none of them can be read from here. Boulder City
 * publishes a two-page PDF with a working text layer, which the project's own order
 * of precedence puts ahead of any amount of market size. See
 * `research/index.md` for the three that are blocked and on what.
 *
 * **The mechanism.** The Valuation Table is a bracket table: a fixed amount for any
 * project whose valuation falls in a $1,000 range. Unlike Clark County's — its
 * neighbour, and the county Boulder City sits inside — this one chains to the cent:
 * the last step of the low table ($414.50 at $50,000) is *exactly* what the
 * published rate then produces at $50,001, and $639.50 at $100,000 is exactly what
 * the next band produces. Two schedules in one state, both valuation tables, one
 * that chains and one with a four-and-a-half-cent seam. That is why the model states
 * its convention rather than inheriting the last jurisdiction's.
 *
 * The table is stored as the 51 published ranges plus the two published chained bands
 * above $50,000, and the ranges are written in the dollars the document prints rather
 * than pre-multiplied into cents, so a reviewer can check them against page 2 line by
 * line.
 *
 * **The one reading this file makes, stated plainly.** The schedule opens with
 * "Unless indicated a $40 Issuance Fee will be applied to every permit", and each
 * trade block indicates the opposite in print — "Price Includes Issuance Fee". The
 * Valuation Table does not, so a building permit is modelled as the table's amount
 * plus $40. If the City means the table's figure to include it, every building figure
 * on this site is $40 high, and the building page says so.
 *
 * What is deliberately NOT here:
 *
 *  - **Plan review.** The schedule publishes a *deposit* — "Equal to full plan review
 *    fees for the project, based on project valuation. This can be calculated using the
 *    Valuation Table on page 2" — and hourly revision reviews at $45 and $90 per half
 *    hour. A deposit that equals the review fee, computed from the same table, would
 *    double every published figure if it were added unconditionally, and the document
 *    does not say the review fee is charged on the same basis as the permit. Named on
 *    the page, not modelled. This is the same call Houston's disputed plan review and
 *    Phoenix's water-heater minimum got.
 *
 *  - **Privilege tax and transportation** ($1.00 per square foot of commercial
 *    development, $1,000 per house residential, plus a separate $1,000 per house
 *    residential tax). Real, published, and charged by the City on development rather
 *    than on a permit, so they are named on every page and in no total.
 *
 *  - **Meter installation and connection fees** (water $7,450 to $74,088, sewer
 *    $1,800 to $15,000, electric $2,500 to $7,500 by amperage and $6.25 per amp above
 *    1,200). These are utility connections under Resolution 6570, not permit fees, and
 *    the per-amp tail would need an amperage count the schedule publishes nowhere else.
 *
 *  - **Inspection and event fees**: re-inspection $90 an hour, same-day and after-hours
 *    $90 an hour, overtime $180 with a two-hour minimum, expedited revision review $90
 *    per half hour. They attach to events, not to permits.
 *
 *  - **Demolition** ($85 up to 1,000 square feet, $115 above), move structure ($200),
 *    parking modular building ($90 plus $50 per additional building). Published, priced
 *    per structure or per square foot of demolition, and not among the three pages this
 *    jurisdiction earns. Named, not modelled — the same treatment Phoenix's demolition
 *    fee got.
 *
 * **This module is the single definition of Boulder City's fee rules.** The seed
 * writes exactly these records and the tests assert against exactly these records.
 */

/** The schedule is "Effective as of August 3, 2020". */
export const BOULDER_FEE_EFFECTIVE_FROM = "2020-08-03";

export const BOULDER_FEE_SCHEDULE_SOURCE_KEY = "boulder-fee-schedule";
export const BOULDER_PERMIT_PAGE_SOURCE_KEY = "boulder-permit-guidelines";

const SOURCE = BOULDER_FEE_SCHEDULE_SOURCE_KEY;

function boulderRule(
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
    effectiveFrom: BOULDER_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/**
 * Page 2 of the schedule, in the document's own order: "[upper bound, base fee]",
 * both in dollars as printed.
 *
 * Transcribed from a `pdftotext -table` read after the `-layout` read mis-paired the
 * labels and the amounts — the two columns of the table are interleaved in the layout
 * of the original, so `-layout` printed the fee column one row out of step with the
 * range column. The project's rule that every table is read two ways is the only
 * reason the mis-pairing was caught before it became a published rate.
 */
const VALUATION_STEPS: Array<[number, number]> = [
  [500, 27],
  [1_000, 36],
  [2_000, 45],
  [3_000, 54],
  [4_000, 63],
  [5_000, 72],
  [6_000, 81],
  [7_000, 90],
  [8_000, 99],
  [9_000, 108],
  [10_000, 117],
  [11_000, 126],
  [12_000, 135],
  [13_000, 144],
  [14_000, 153],
  [15_000, 162],
  [16_000, 171],
  [17_000, 180],
  [18_000, 189],
  [19_000, 198],
  [20_000, 207],
  [21_000, 216],
  [22_000, 225],
  [23_000, 234],
  [24_000, 243],
  [25_000, 252],
  [26_000, 258.5],
  [27_000, 265],
  [28_000, 271.5],
  [29_000, 278],
  [30_000, 284.5],
  [31_000, 291],
  [32_000, 297.5],
  [33_000, 304],
  [34_000, 310.5],
  [35_000, 317],
  [36_000, 323.5],
  [37_000, 330],
  [38_000, 336.5],
  [39_000, 343],
  [40_000, 349.5],
  [41_000, 356],
  [42_000, 362.5],
  [43_000, 369],
  [44_000, 375.5],
  [45_000, 382],
  [46_000, 388.5],
  [47_000, 395],
  [48_000, 401.5],
  [49_000, 408],
  [50_000, 414.5],
];

const VALUATION_TABLE_LIMIT_CENTS = 5_000_000; // $50,000

const dollarsToCents = (dollars: number): number => Math.round(dollars * 100);

/**
 * The Valuation Table, and the two bands above it.
 *
 * The table itself is capped at $50,000 by a condition rather than by an open-ended
 * final bracket, because two published rows continue above that figure at a rate —
 * "$414.50 for the first $50,000 + $4.50 for each additional $1,000", then "$639.50
 * for the first $100,000 + $3.50" — and those are `per_thousand` rows. Without the
 * cap, a $200,000 project would be charged the table's last bracket *and* the rate
 * that supersedes it.
 */
export const BOULDER_VALUATION_TABLE_RULES: FeeRuleRecord[] = [
  boulderRule({
    id: "boulder-valuation-table",
    code: "VALUATION-TABLE-1-50000",
    label: "Building permit fee, valuation up to $50,000",
    description:
      "Page 2, Valuation Table: a fixed base fee for any valuation falling in the range. From $1,001 to $25,000 the step is $9 per $1,000; from $25,001 to $50,000 it is $6.50. The schedule prices the work, not the occupancy — a $300,000 house and a $300,000 warehouse of the same declared valuation pay by the same table.",
    feeType: "tiered_table",
    config: {
      basis: "valuation",
      tiers: VALUATION_STEPS.map(([upToDollars, amountDollars]) => ({
        upToCents: dollarsToCents(upToDollars),
        amountCents: dollarsToCents(amountDollars),
      })),
    },
    conditions: { field: "valuation", op: "lte", value: VALUATION_TABLE_LIMIT_CENTS },
  }),
  boulderRule({
    id: "boulder-valuation-50001-100000",
    code: "VALUATION-50001-100000",
    label: "Building permit fee, $50,001 to $100,000 of valuation",
    description:
      "Valuation Table, first row beyond $50,000: \"$414.50 for the first $50,000 + $4.50 for each additional $1,000 or fraction thereof\". $414.50 is exactly what the table below produces at $50,000, and $639.50 at $100,000 is exactly what this row produces — the schedule chains without a seam.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 41_450,
      thresholdCents: VALUATION_TABLE_LIMIT_CENTS,
      incrementCents: 100_000,
      centsPerThousand: 450,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: VALUATION_TABLE_LIMIT_CENTS },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
  }),
  boulderRule({
    id: "boulder-valuation-100001-up",
    code: "VALUATION-100001-UP",
    label: "Building permit fee, $100,001 of valuation and above",
    description:
      "Valuation Table, final row: \"$639.50 for the first $100,000 + $3.50 for each additional $1,000 or fraction thereof\". Open-ended, and the only row a large project can be in.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 63_950,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      centsPerThousand: 350,
    },
    conditions: { field: "valuation", op: "gt", value: 10_000_000 },
  }),
];

/**
 * The $40 issuance fee, on the building permit only.
 *
 * Every trade block on page 1 prints "Price Includes Issuance Fee" beneath its
 * heading; the Valuation Table does not, and the note that introduces the whole
 * schedule is "Unless indicated a $40 Issuance Fee will be applied to every permit".
 * The reading taken here is the document's own words. See the module note above.
 */
export const BOULDER_ISSUANCE_RULE: FeeRuleRecord = boulderRule({
  id: "boulder-issuance",
  code: "ISSUANCE-40",
  label: "Permit issuance fee",
  description:
    "Page 1: \"Unless indicated a $40 Issuance Fee will be applied to every permit.\" The trade blocks on the same page indicate that their prices include it; the Valuation Table on page 2 does not, so it is charged on a building permit.",
  feeType: "flat",
  config: { amountCents: 4_000 },
});

/** Page 1, ELECTRICAL — "Price Includes Issuance Fee". */
export const BOULDER_ELECTRICAL_ITEM_RULES: FeeRuleRecord[] = [
  boulderRule({
    id: "boulder-elec-service-200",
    code: "ELEC-SERVICE-UP-TO-200",
    label: "Service change, up to 200 A",
    description: "Page 1, ELECTRICAL: \"Service Change (Up to 200 AMP) — $80.00\".",
    feeType: "flat",
    config: { amountCents: 8_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "service_change_200" },
  }),
  boulderRule({
    id: "boulder-elec-service-1000",
    code: "ELEC-SERVICE-200-1000",
    label: "Service change, 200 to 1,000 A",
    description: "Page 1, ELECTRICAL: \"Service Change (200 - 1,000 AMP) — $100.00\".",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "service_change_1000" },
  }),
  boulderRule({
    id: "boulder-elec-service-over-1000",
    code: "ELEC-SERVICE-OVER-1000",
    label: "Service change, over 1,000 A",
    description:
      "Page 1, ELECTRICAL: \"Service Change (Over 1,000 AMP) — $125.00\". The last published step, and open-ended above it.",
    feeType: "flat",
    config: { amountCents: 12_500 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "service_change_over_1000" },
  }),
  boulderRule({
    id: "boulder-elec-temporary-power",
    code: "ELEC-TEMPORARY-POWER",
    label: "Temporary power",
    description:
      "Page 1, ELECTRICAL: \"Temporary Power — $290.00\". A permit of its own rather than an addition to another electrical permit.",
    feeType: "flat",
    config: { amountCents: 29_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "temporary_power" },
  }),
];

/** Page 1, PLUMBING — "Price Includes Issuance Fee". */
export const BOULDER_PLUMBING_ITEM_RULES: FeeRuleRecord[] = [
  boulderRule({
    id: "boulder-plumb-gas-line",
    code: "PLUMB-GAS-LINE-TEST",
    label: "Gas line or pressure test",
    description: "Page 1, PLUMBING: \"Gas Line / Pressure Test — $70.00\".",
    feeType: "flat",
    config: { amountCents: 7_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "gas_line_test" },
  }),
  boulderRule({
    id: "boulder-plumb-water-heater",
    code: "PLUMB-WATER-HEATER",
    label: "Water heater, each",
    description:
      "Page 1, PLUMBING: \"Water Heater — $50.00 (Replacement only, per each unit/tank)\". Charged per unit, which is the reason it is a per-unit rule and not a flat one: two tanks on one permit is $100.00, and the schedule says so in the row itself.",
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 5_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "water_heater" },
  }),
];

/** Every rule this jurisdiction defines, for the seed and the tests. */
export const BOULDER_FEE_RULES: FeeRuleRecord[] = [
  ...BOULDER_VALUATION_TABLE_RULES,
  BOULDER_ISSUANCE_RULE,
  ...BOULDER_ELECTRICAL_ITEM_RULES,
  ...BOULDER_PLUMBING_ITEM_RULES,
];

/** What each permit page computes. */
export const BOULDER_BUILDING_RULES = [...BOULDER_VALUATION_TABLE_RULES, BOULDER_ISSUANCE_RULE];

export const BOULDER_ELECTRICAL_RULES = [...BOULDER_ELECTRICAL_ITEM_RULES];

export const BOULDER_PLUMBING_RULES = [...BOULDER_PLUMBING_ITEM_RULES];

/** The electrical work a reader can select. */
export const BOULDER_ELECTRICAL_ITEMS = [
  { value: "service_change_200", label: "Service change, up to 200 A", amountCents: 8_000 },
  { value: "service_change_1000", label: "Service change, 200 to 1,000 A", amountCents: 10_000 },
  {
    value: "service_change_over_1000",
    label: "Service change, over 1,000 A",
    amountCents: 12_500,
  },
  { value: "temporary_power", label: "Temporary power", amountCents: 29_000 },
] as const;

/** The plumbing work a reader can select. */
export const BOULDER_PLUMBING_ITEMS = [
  { value: "gas_line_test", label: "Gas line or pressure test", amountCents: 7_000 },
  { value: "water_heater", label: "Water heater, each", amountCents: 5_000 },
] as const;
