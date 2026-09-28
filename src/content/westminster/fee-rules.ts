import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Westminster, Colorado fee rules — REAL DATA.
 *
 * Source (research/colorado/westminster.md records the retrieval method and hash):
 *
 *  S1  City of Westminster, Building Division Fee Schedule,
 *      "Effective January 1, 2026", one page.
 *      https://www.westminsterco.gov/DocumentCenter/View/6284/Fee-Schedule-V3-2026
 *
 * **Why Westminster is Colorado's second jurisdiction.** Denver and Westminster are
 * twenty minutes apart and answer the same question in two incompatible ways, which
 * is the most useful thing a second jurisdiction in a state can be:
 *
 *  - **Denver prices a trade permit as its own permit**, from Table No. 1 applied to
 *    the value of that trade's work.
 *  - **Westminster prices a trade as a percentage of the building permit**: "Permit
 *    trade fees — An additional 15% of the permit fee for each of the following;
 *    mechanical, plumbing, electric", and a further "15% of the plan review fee" for
 *    each of them. A trade permit here is not a fee of its own at all; it is a
 *    surcharge, and it can only be computed once the building permit fee is known.
 *
 * **The table is internally exact, which no jurisdiction before it has been.** Every
 * band is written as "$X for the first $N plus $Y for each additional $1,000, or
 * fraction thereof", and **all seven seams close**: the band below produces precisely
 * the figure the band above opens with at $500, $2,000, $25,000, $50,000, $100,000,
 * $500,000 and $1,000,000 — $19.50, $59.25, $332.95, $546.70, $844.20, $2,684.20 and
 * $4,659.20. Denver, one seam short of that; Clark County, two; Houston's brackets do
 * not chain at all. It is asserted band by band rather than assumed, because a table
 * that closes is a different finding from a table that nearly closes.
 *
 *  - **The second band counts in hundreds, not thousands**: "$19.50 for the first $500
 *    plus $2.65 for each additional $100, or fraction thereof". The engine reads a rate
 *    per $1,000 of a stated increment, so the increment is 10,000 cents and the rate is
 *    carried as $26.50 per $1,000 — the same rate, stated in the unit the engine
 *    publishes. $59.25 at $2,000 is the test of that.
 *
 * **Use tax is a percentage of a percentage.** "Estimated Use Tax — 4.25% of 50% of
 * Total Valuation (effective 1/1/2026)". That is 2.125%, which is not a whole number
 * of basis points, so it is carried as the exact fraction 17/800 — the same extension
 * Dallas forced on `percent` for $0.046 per $1,000, and the reason it was worth making
 * general. The City's own Fees page prints the 4.25% figure this replaced (3.85%) as a
 * superseded rate, which is what makes the reading certain rather than inferred.
 *
 * **What is a reading rather than a printed figure.** The schedule prices no stand-alone
 * electrical permit. It prices the electrical *scope of a project* at 15% of that
 * project's permit fee, and it marks four of its flat single-family rows with an
 * asterisk: "* May also require an electrical permit fee." Applying the schedule's own
 * 15% to the flat fee of one of those rows is this site's reading, stated on the page
 * with its consequence: an air-conditioner permit of $80.00 carries an electrical permit
 * fee of $12.00. The alternative — refusing a figure because the City did not print one —
 * would leave the reader with nothing, and the mechanism the City did print is the one
 * used. It is recorded as an open question in the research record.
 *
 * **What is deliberately NOT here:**
 *
 *  - **The other inspections and fees block**: inspections outside normal business hours
 *    at $50.00 per hour with a two-hour minimum, re-inspection at $50.00, a temporary
 *    certificate of occupancy at 5% of the building permit fee with a $100 floor,
 *    additional plan review at $50.00 per hour, copies and letters of code compliance.
 *    These are charged by event or by hour, not by valuation, and none is a permit.
 *  - **Sign permits** (monument and wall/building signs are "per fee schedule", and the
 *    wall sign is specifically no-use-tax), banners and bus benches, and fire
 *    department operational permits. The two readings of this document disagree about
 *    which line the $100.00 belongs to — `-table` pairs it with operational permits, and
 *    `-raw` shifts it one row up onto fire department fees — so no figure from that
 *    block is used at all rather than the wrong one being published.
 *  - **The stop-work order penalties** (double the permit fee with a $250 floor for a
 *    first offence, triple with a $500 floor for a second): a penalty is not a fee.
 *
 * **This module is the single definition of Westminster's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records.
 */

/** The schedule's own words: "Effective January 1, 2026". */
export const WESTMINSTER_FEE_EFFECTIVE_FROM = "2026-01-01";

export const WESTMINSTER_SCHEDULE_SOURCE_KEY = "westminster-fee-schedule-2026";
export const WESTMINSTER_FEES_PAGE_SOURCE_KEY = "westminster-building-fees";

/** "Plan Review Fee — 65% of Building Permit Fee". */
export const WESTMINSTER_PLAN_REVIEW_BPS = 6_500;

/** "An additional 15% of the permit fee for each of the following; mechanical, plumbing, electric". */
export const WESTMINSTER_TRADE_FEE_BPS = 1_500;

/**
 * "An additional 15% of the plan review fee for each of the following…" — and the review
 * fee is 65% of the permit fee, so a trade's review share is 15% x 65% of the permit fee,
 * which is 9.75%. Carried in the same unit the review rule is written in, so the two can
 * be read against each other.
 */
export const WESTMINSTER_TRADE_REVIEW_BPS = 975;

/** "Estimated Use Tax — 4.25% of 50% of Total Valuation": 4.25% of a half, exactly 17/800. */
export const WESTMINSTER_USE_TAX_RATE = { numerator: 17, denominator: 800 } as const;

const SOURCE = WESTMINSTER_SCHEDULE_SOURCE_KEY;

function westminsterRule(
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
    effectiveFrom: WESTMINSTER_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/**
 * The valuation table's bands apply to a construction valuation, and the flat rows below
 * apply to one named single-family job instead. Both cannot be charged, so each band
 * carries the same `custom.schedule_item absent` condition the flat rows test the other
 * way round — the mutual-exclusion pattern Scottsdale produced and Clark County and
 * Denver both reuse.
 */
function bandConditions(
  lowerExclusiveCents: number | null,
  upperInclusiveCents: number | null,
): FeeRuleRecord["conditions"] {
  const within: NonNullable<FeeRuleRecord["conditions"]>[] = [
    { field: "custom.schedule_item", op: "absent" },
  ];
  if (lowerExclusiveCents !== null) {
    within.push({ field: "valuation", op: "gt", value: lowerExclusiveCents });
  }
  if (upperInclusiveCents !== null) {
    within.push({ field: "valuation", op: "lte", value: upperInclusiveCents });
  }
  return { all: within };
}

/**
 * The valuation table, in eight bands. Read in two pdftotext modes that disagree by one
 * row until the shift is accounted for: `-raw` puts each value on the line above its
 * label, `-table` pairs them. Both agree once that is allowed for, and the figures below
 * are the paired reading — which is also the reading that closes at every seam.
 */
export const WESTMINSTER_VALUATION_RULES: FeeRuleRecord[] = [
  westminsterRule({
    id: "wmk-band-1-500",
    code: "VALUATION-1-500",
    label: "Building permit fee, valuation $1 to $500",
    description:
      "Valuation table, first row: \"$1 to $500 — $19.50\". The same $19.50 opens the band above it, so the seam at $500 closes.",
    feeType: "flat",
    config: { amountCents: 1_950 },
    conditions: bandConditions(0, 50_000),
  }),
  westminsterRule({
    id: "wmk-band-501-2000",
    code: "VALUATION-501-2000",
    label: "Building permit fee, valuation $501 to $2,000",
    description:
      "Valuation table: \"$19.50 for the first $500 plus $2.65 for each additional $100, or fraction thereof, to and including $2,000\". The only band in this table that counts in hundreds: $2.65 per $100 is $26.50 per $1,000, which is how the rate is carried, against an increment of 10,000 cents. It produces $59.25 at $2,000, exactly what the band above opens with.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 1_950,
      thresholdCents: 50_000,
      incrementCents: 10_000,
      centsPerThousand: 2_650,
    },
    conditions: bandConditions(50_000, 200_000),
  }),
  westminsterRule({
    id: "wmk-band-2001-25000",
    code: "VALUATION-2001-25000",
    label: "Building permit fee, valuation $2,001 to $25,000",
    description:
      "Valuation table: \"$59.25 for the first $2,000 plus $11.90 for each additional $1,000, or fraction thereof, to and including $25,000\". Produces $332.95 at its top, exactly what the band above opens with.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_925,
      thresholdCents: 200_000,
      incrementCents: 100_000,
      centsPerThousand: 1_190,
    },
    conditions: bandConditions(200_000, 2_500_000),
  }),
  westminsterRule({
    id: "wmk-band-25001-50000",
    code: "VALUATION-25001-50000",
    label: "Building permit fee, valuation $25,001 to $50,000",
    description:
      "Valuation table: \"$332.95 for the first $25,000 plus $8.55 for each additional $1,000, or fraction thereof, to and including $50,000\". Produces $546.70 at its top, exactly what the band above opens with.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 33_295,
      thresholdCents: 2_500_000,
      incrementCents: 100_000,
      centsPerThousand: 855,
    },
    conditions: bandConditions(2_500_000, 5_000_000),
  }),
  westminsterRule({
    id: "wmk-band-50001-100000",
    code: "VALUATION-50001-100000",
    label: "Building permit fee, valuation $50,001 to $100,000",
    description:
      "Valuation table: \"$546.70 for the first $50,000 plus $5.95 for each additional $1,000, or fraction thereof, to and including $100,000\". Produces $844.20 at its top, exactly what the band above opens with.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 54_670,
      thresholdCents: 5_000_000,
      incrementCents: 100_000,
      centsPerThousand: 595,
    },
    conditions: bandConditions(5_000_000, 10_000_000),
  }),
  westminsterRule({
    id: "wmk-band-100001-500000",
    code: "VALUATION-100001-500000",
    label: "Building permit fee, valuation $100,001 to $500,000",
    description:
      "Valuation table: \"$844.20 for the first $100,000 plus $4.60 for each additional $1,000, or fraction thereof, to and including $500,000\". Produces $2,684.20 at its top, exactly what the band above opens with.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 84_420,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      centsPerThousand: 460,
    },
    conditions: bandConditions(10_000_000, 50_000_000),
  }),
  westminsterRule({
    id: "wmk-band-500001-1000000",
    code: "VALUATION-500001-1000000",
    label: "Building permit fee, valuation $500,001 to $1,000,000",
    description:
      "Valuation table: \"$2,684.20 for the first $500,000 plus $3.95 for each additional $1,000, or fraction thereof, to and including $1,000,000\". Produces $4,659.20 at its top, exactly what the band above opens with.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 268_420,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      centsPerThousand: 395,
    },
    conditions: bandConditions(50_000_000, 100_000_000),
  }),
  westminsterRule({
    id: "wmk-band-1000001-up",
    code: "VALUATION-1000001-UP",
    label: "Building permit fee, valuation $1,000,001 and over",
    description:
      "Valuation table, final row: \"$4,659.20 for the first $1,000,000 plus $2.65 for each additional $1,000 or fraction thereof\". The document prints the range's lower bound as \"$1,000,0001\", a typographical slip for $1,000,001; the arithmetic of the band above it ends at $1,000,000, so that is the boundary modelled. Open-ended above.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 465_920,
      thresholdCents: 100_000_000,
      incrementCents: 100_000,
      centsPerThousand: 265,
    },
    conditions: bandConditions(100_000_000, null),
  }),
];

/**
 * Plan review and the use tax, both of which the schedule defines in terms of something
 * else: the review is 65% of the building permit fee, and the use tax is 4.25% of half
 * the valuation. Neither is a table of its own.
 */
export const WESTMINSTER_REVIEW_AND_TAX_RULES: FeeRuleRecord[] = [
  westminsterRule({
    id: "wmk-plan-review",
    code: "PLAN-REVIEW-65",
    label: "Plan review fee, 65% of the building permit fee",
    description:
      "The schedule's own row: \"Plan Review Fee — 65% of Building Permit Fee\". Priced on the `permit_fee` basis, so it is computed from the permit fee this run produced and the two can never drift apart.",
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: WESTMINSTER_PLAN_REVIEW_BPS },
    conditions: { field: "custom.schedule_item", op: "absent" },
  }),
  westminsterRule({
    id: "wmk-use-tax",
    code: "USE-TAX-4.25-OF-HALF",
    label: "Estimated use tax, 4.25% of half the valuation",
    description:
      "The schedule's own row: \"Estimated Use Tax — 4.25% of 50% of Total Valuation (effective 1/1/2026)\". That is 2.125% of the valuation, carried as the exact fraction 17/800 rather than rounded to basis points, because 2.125% is 212.5 of them.",
    feeType: "percent",
    componentType: "surcharge",
    priority: 150,
    config: { basis: "valuation", rate: WESTMINSTER_USE_TAX_RATE },
    conditions: { field: "custom.schedule_item", op: "absent" },
  }),
];

export type WestminsterTrade = "mechanical" | "plumbing" | "electrical";

const TRADE_LABELS: Record<WestminsterTrade, string> = {
  mechanical: "mechanical",
  plumbing: "plumbing",
  electrical: "electrical",
};

/**
 * A trade scope on a project, priced the way the schedule prices it: an addition to the
 * building permit rather than a permit of its own.
 *
 * Both rules are `other` components, which is what keeps the arithmetic honest: the
 * `permit_fee` a percentage rule reads is the sum of the *base* components only, so the
 * review fee stays 65% of the building permit fee rather than 65% of the permit fee plus
 * a trade surcharge. And the trade's own review share is 15% of the review fee, which is
 * 15% x 65% of the permit fee — hence 975 basis points against the same base.
 */
export function westminsterTradeRules(trade: WestminsterTrade): FeeRuleRecord[] {
  /*
    Two conditions, and the second one matters: a trade scope belongs to a project priced
    by valuation, and a flat single-family row already *is* the permit for its job. Without
    `schedule_item absent` an air-conditioner replacement could be charged both the flat
    $80.00 plus 15% (the electrical note rule) and 15% of the permit fee again as a trade —
    the same electrical permit billed twice, which is exactly the kind of double charge the
    mutual-exclusion pattern exists to prevent.
  */
  const condition = {
    all: [
      { field: `custom.${trade}_trade`, op: "eq" as const, value: true },
      { field: "custom.schedule_item", op: "absent" as const },
    ],
  };
  return [
    westminsterRule({
      id: `wmk-trade-${trade}`,
      code: `TRADE-${trade.toUpperCase()}-15PCT`,
      label: `Additional permit trade fee, ${TRADE_LABELS[trade]} — 15% of the permit fee`,
      description:
        "The schedule's own row: \"Permit trade fees — An additional 15% of the permit fee for each of the following; mechanical, plumbing, electric\". An addition to the building permit fee, not a permit priced on its own, so it is only computable once the building permit fee is known.",
      feeType: "percent",
      componentType: "other",
      priority: 300,
      config: { basis: "permit_fee", rateBps: WESTMINSTER_TRADE_FEE_BPS },
      conditions: condition,
    }),
    westminsterRule({
      id: `wmk-trade-review-${trade}`,
      code: `TRADE-REVIEW-${trade.toUpperCase()}-15PCT`,
      label: `Plan review fee for the ${TRADE_LABELS[trade]} trade — 15% of the plan review fee`,
      description:
        "The schedule's own row: \"Plan review trade fees — An additional 15% of the plan review fee for each of the following; mechanical, plumbing, electric\". The review fee is 65% of the permit fee, so this is 15% of 65% of the permit fee, charged on the same base as the permit fee itself.",
      feeType: "percent",
      componentType: "other",
      priority: 310,
      config: { basis: "permit_fee", rateBps: WESTMINSTER_TRADE_REVIEW_BPS },
      conditions: condition,
    }),
  ];
}

/**
 * The two flat lists at the foot of the schedule, which are permits rather than add-ons:
 * a named single-family job is priced at a flat figure instead of by valuation.
 *
 * The schedule's own heading for them is "Miscellaneous SFD Residential Permit Fees" —
 * single-family dwelling, the first time this project has met a schedule that prices
 * *jobs* rather than work, and the reason a water heater replacement has a published
 * figure here where Denver prices the same job from a valuation.
 */
export const WESTMINSTER_FLAT_ITEM_RULES: FeeRuleRecord[] = [
  westminsterRule({
    id: "wmk-item-water-heater",
    code: "SFD-WATER-HEATER",
    label: "Water heater replacement",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Water Heater Replacement — $40.00\". A flat permit fee for the job, not a valuation-based one.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "water_heater" },
  }),
  westminsterRule({
    id: "wmk-item-air-conditioner",
    code: "SFD-AIR-CONDITIONER",
    label: "Air conditioner",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Air Conditioner — $80.00\", marked \"* May also require an electrical permit fee\".",
    feeType: "flat",
    config: { amountCents: 8_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "air_conditioner" },
  }),
  westminsterRule({
    id: "wmk-item-furnace",
    code: "SFD-FURNACE",
    label: "Furnace replacement",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Furnace Replacement — $60.00\", marked \"* May also require an electrical permit fee\".",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "furnace" },
  }),
  westminsterRule({
    id: "wmk-item-evaporative-cooler",
    code: "SFD-EVAPORATIVE-COOLER",
    label: "Evaporative cooler",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Evaporative Cooler — $60.00\", marked \"* May also require an electrical permit fee\".",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "evaporative_cooler" },
  }),
  westminsterRule({
    id: "wmk-item-spa",
    code: "SFD-SPA",
    label: "Spa / hot tub",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Spas/Hot Tub — $80.00\", marked \"* May also require an electrical permit fee\".",
    feeType: "flat",
    config: { amountCents: 8_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "spa" },
  }),
  westminsterRule({
    id: "wmk-item-re-roofing",
    code: "SFD-RE-ROOFING",
    label: "Re-roofing",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Re-Roofing — $100.00\". Not marked as carrying an electrical permit fee.",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "re_roofing" },
  }),
  westminsterRule({
    id: "wmk-item-lawn-sprinkler",
    code: "SFD-LAWN-SPRINKLER",
    label: "Lawn irrigation sprinkler",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Lawn Irrigation Sprinkler — $60.00\".",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "lawn_sprinkler" },
  }),
  westminsterRule({
    id: "wmk-item-gas-log",
    code: "SFD-GAS-LOG",
    label: "Gas log",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Gas Log — $60.00\", carrying the document's own double-asterisk footnote referring to WMC Section 11-9-3(E) 2 for exceptions. The exception is a code section, not a fee row, and no figure in it is applied here.",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "gas_log" },
  }),
  westminsterRule({
    id: "wmk-item-above-ground-pool",
    code: "SFD-ABOVE-GROUND-POOL",
    label: "Above-ground pool",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Above Ground Pool — $50.00\".",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "above_ground_pool" },
  }),
  westminsterRule({
    id: "wmk-item-fence",
    code: "SFD-FENCE",
    label: "Fence",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Fence — $50.00\".",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "fence" },
  }),
  westminsterRule({
    id: "wmk-item-detached-storage-shed",
    code: "SFD-STORAGE-SHED",
    label: "Detached storage shed",
    description:
      "Miscellaneous SFD Residential Permit Fees: \"Detached Storage Shed — $80.00\".",
    feeType: "flat",
    config: { amountCents: 8_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "detached_storage_shed" },
  }),
  westminsterRule({
    id: "wmk-item-solar",
    code: "MISC-SOLAR",
    label: "Solar systems",
    description:
      "Miscellaneous Permit Fees: \"Solar Systems — $300.00\". A flat permit fee for the installation, on the same list as demolition and mobile home set-ups rather than on the valuation table.",
    feeType: "flat",
    config: { amountCents: 30_000 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "solar_systems" },
  }),
  westminsterRule({
    id: "wmk-item-mobile-home",
    code: "MISC-MOBILE-HOME",
    label: "Mobile home set-up with electrical",
    description:
      "Miscellaneous Permit Fees: \"Mobile Home Set-up w/elec — $125.00\".",
    feeType: "flat",
    config: { amountCents: 12_500 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "mobile_home_setup" },
  }),
  westminsterRule({
    id: "wmk-item-construction-trailer",
    code: "MISC-CONSTRUCTION-TRAILER",
    label: "Construction trailer with electrical",
    description:
      "Miscellaneous Permit Fees: \"Construction trailer w/elec — $125.00\".",
    feeType: "flat",
    config: { amountCents: 12_500 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "construction_trailer" },
  }),
  westminsterRule({
    id: "wmk-item-demolition",
    code: "MISC-DEMOLITION",
    label: "Demolition permit",
    description:
      "Miscellaneous Permit Fees: \"Demolition permit — $25.00\". A permit of its own rather than a line on the building permit.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "demolition" },
  }),
];

/**
 * The electrical permit fee on a flat single-family row.
 *
 * Four rows carry the schedule's asterisk — air conditioner, furnace, evaporative cooler
 * and spa/hot tub — and it says the work "may also require an electrical permit fee".
 * The only electrical fee this schedule publishes anywhere is 15% of the permit fee, so
 * that is the rate applied to the row's own flat fee. **This is a reading**, stated on
 * the page with its result, and the alternative reading (the same 15% of the permit fee
 * for the whole job) gives the same figure here because the flat row *is* the permit fee.
 * What is genuinely not published is a stand-alone electrical permit fee for work that is
 * not attached to a building permit, and no page here pretends otherwise.
 */
export const WESTMINSTER_ELECTRICAL_NOTE_RULES: FeeRuleRecord[] = [
  "air_conditioner",
  "furnace",
  "evaporative_cooler",
  "spa",
].map((item) =>
  westminsterRule({
    id: `wmk-electrical-note-${item}`,
    code: `ELEC-NOTE-${item.toUpperCase()}-15PCT`,
    label: "Electrical permit fee on the flat permit, 15% of that fee",
    description:
      "The flat row for this job is marked \"* May also require an electrical permit fee\", and the schedule's electrical rate is \"an additional 15% of the permit fee\". Applied to the row's own flat fee, that is 15% of the figure above it.",
    feeType: "percent",
    componentType: "other",
    priority: 320,
    config: { basis: "permit_fee", rateBps: WESTMINSTER_TRADE_FEE_BPS },
    conditions: { field: "custom.schedule_item", op: "eq", value: item },
  }),
);

/** Everything a building permit can carry: the table, the review, the tax and any trade. */
export const WESTMINSTER_BUILDING_RULES: FeeRuleRecord[] = [
  ...WESTMINSTER_VALUATION_RULES,
  ...WESTMINSTER_REVIEW_AND_TAX_RULES,
  ...westminsterTradeRules("mechanical"),
  ...westminsterTradeRules("plumbing"),
  ...westminsterTradeRules("electrical"),
  ...WESTMINSTER_ELECTRICAL_NOTE_RULES,
  ...WESTMINSTER_FLAT_ITEM_RULES,
];

/** The electrical page's rule set: the same permit, with the electrical scope selected. */
export const WESTMINSTER_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...WESTMINSTER_VALUATION_RULES,
  ...WESTMINSTER_REVIEW_AND_TAX_RULES,
  ...westminsterTradeRules("electrical"),
  ...WESTMINSTER_ELECTRICAL_NOTE_RULES,
  ...WESTMINSTER_FLAT_ITEM_RULES,
];

/** The plumbing page's rule set, with the plumbing scope selected. */
export const WESTMINSTER_PLUMBING_RULES: FeeRuleRecord[] = [
  ...WESTMINSTER_VALUATION_RULES,
  ...WESTMINSTER_REVIEW_AND_TAX_RULES,
  ...westminsterTradeRules("plumbing"),
  ...WESTMINSTER_FLAT_ITEM_RULES,
];
