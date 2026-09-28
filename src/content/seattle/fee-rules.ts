import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Seattle, Washington fee rules — REAL DATA.
 *
 * Source: City of Seattle, Department of Construction and Inspections, **2026 Fee
 * Subtitle** (Seattle Municipal Code Chapter 22.900), "including changes becoming
 * effective January 1, 2026", adopted as Ordinance 119255 and amended by a list of
 * later ordinances, sha256 beginning d7c6bc15590c7052.
 * https://www.seattle.gov/documents/Departments/SDCI/Codes/FeeSubtitleFinal.pdf
 *
 * **Why this jurisdiction is not a copy of any of the eight before it.** Seattle does
 * not publish a table of permit fees. It publishes a table of **index values** and then
 * a table of **percentages of that index**:
 *
 *   - Table D-1 for 22.900D.010, "Calculation of the Development Fee Index", is a
 *     26-band valuation table and the only place a dollar figure comes from.
 *   - Table D-2 for 22.900D.010 then says a building permit fee is **100% of the
 *     Development Fee Index** and the plan review fee is **100% of the same index** —
 *     so a project pays the table twice — while a subject-to-field-inspection (STFI)
 *     project pays 100% for the permit and **40%** for the review.
 *
 * That separation is the interesting part: the fee is a *reading* of an index, so the
 * permit fee and the review fee can never disagree about which band a valuation fell
 * in, and a second review mode is a percentage change rather than a second table.
 *
 * **Three more rows sit on top, and none of them is part of the index:**
 *
 *   - **The technology fee**, 5% of "all fees or charges required" under the fee
 *     chapters (SMC 22.900A.100). This is the first surcharge on this site that is a
 *     percentage of the *whole bill* rather than of one component, which is why the
 *     `fee_subtotal` basis exists — see `src/lib/calc/types.ts`. It runs after every
 *     fee and before the state surcharge, which is imposed by a statute outside the
 *     chapters it applies to.
 *   - **The Washington State Building Code Council fee** (RCW 19.27.085): **$6.50 on
 *     each residential building permit, $25.00 on each commercial building permit, plus
 *     $2.00 for each residential unit after the first.** A state charge that the city
 *     collects and remits, and the first figure on this site set by a state statute
 *     rather than by a local ordinance.
 *   - **The SDCI base fee and hourly rate**, both $292, which apply to work charged by
 *     the hour rather than by value.
 *
 * **The trades stand on three different footings, and one of them is not Seattle's:**
 *
 *   - **Electrical** has two schedules of its own: Table D-15 for work where plans are
 *     not required (the ordinary case) and Table D-14 for work where they are. This
 *     module models D-15 and names D-14.
 *   - **Plumbing is not Seattle's to price.** SMC 22.900G.030: "Fees for plumbing,
 *     medical or dental gas, lab gas, and fuel gas piping shall be collected by the
 *     Director of King County Public Health in accordance with the fee schedule as set
 *     forth in Seattle Municipal Code Section 504." The plumbing rules are therefore
 *     imported from King County's module rather than restated here, because a figure
 *     quoted as Seattle's would come from a document that does not exist.
 *   - **Mechanical** is 100% of its own index when filed separately (Table D-2 item 4b)
 *     plus per-equipment fees in Table D-8. No mechanical page is published in this
 *     release.
 *
 * **What this module deliberately does not model:** Table D-14's valuation-based
 * electrical fees and its "plan review only" service class; every hourly charge; the
 * tenant-alteration per-100-square-foot and blanket-permit rows; and the elevator
 * (D-13), refrigeration (D-10) and boiler (D-12) equipment permits, which are not
 * building, electrical or plumbing permits.
 *
 * **This module is the single definition of Seattle's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records.
 */

/** The subtitle's own words: "including changes becoming effective January 1, 2026". */
export const SEATTLE_FEE_EFFECTIVE_FROM = "2026-01-01";

export const SEATTLE_SUBTITLE_SOURCE_KEY = "seattle-2026-fee-subtitle";
export const SEATTLE_ELECTRICAL_SOURCE_KEY = "seattle-fee-subtitle-electrical";
export const SEATTLE_BCC_SOURCE_KEY = "wa-bcc-permit-fee-statute";
export const KING_COUNTY_PLUMBING_SOURCE_KEY = "king-county-plumbing-gas-fees-2026";

/** Table D-2, item 1: a building permit fee is "100% of DFI", and so is its review. */
export const SEATTLE_BUILDING_FEE_BPS = 10_000;
/** Table D-2, item 2: an STFI project pays "40% of DFI" for plan review. */
export const SEATTLE_STFI_REVIEW_BPS = 4_000;
/** SMC 22.900A.100: "in the amount of five percent of all fees or charges required". */
export const SEATTLE_TECHNOLOGY_FEE_BPS = 500;
/** RCW 19.27.085(3): $6.50 residential, $25.00 commercial, $2.00 per extra unit. */
export const SEATTLE_BCC_RESIDENTIAL_CENTS = 650;
export const SEATTLE_BCC_COMMERCIAL_CENTS = 2_500;
export const SEATTLE_BCC_ADDITIONAL_UNIT_CENTS = 200;

const SOURCE = SEATTLE_SUBTITLE_SOURCE_KEY;

function seattleRule(
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
    effectiveFrom: SEATTLE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/**
 * Table D-1 — the Development Fee Index.
 *
 * Each row is `[lower exclusive, upper inclusive, base, threshold, increment, rate per
 * $1,000, quoted row]` in cents, exactly as the table prints it. Two increment shapes
 * appear and both are the same arithmetic: every band up to $100,000 counts in **$100**
 * steps, and every band above counts in **$1,000**.
 *
 * **All 25 seams close.** The base of each row is exactly what the row below produces
 * at its own top: $325 at $1,000, $709 at $25,000, $1,096.50 at $50,000, $1,471.50 at
 * $75,000, $1,821.50 at $100,000, $2,402.75 at $175,000, $2,984 at $250,000, $4,859 at
 * $500,000, $6,609 at $750,000, $8,359 at $1,000,000, $11,734 at $1,500,000, $14,984 at
 * $2,000,000, $17,984 at $2,500,000, $20,984 at $3,000,000, $23,609 at $3,500,000,
 * $26,109 at $4,000,000, $28,359 at $4,500,000, $30,609 at $5,000,000, $50,609 at
 * $10,000,000, $110,609 at $25,000,000, $191,859 at $50,000,000, $260,609 at
 * $75,000,000, $329,359 at $100,000,000, $441,859 at $150,000,000 and $554,359 at
 * $200,000,000. Every one is asserted in `tests/content/seattle-seed.test.ts` and
 * recomputed from PostgreSQL by `npm run db:verify`.
 */
type IndexBand = readonly [
  lowerExclusiveCents: number,
  upperInclusiveCents: number | null,
  baseCents: number,
  thresholdCents: number,
  incrementCents: number,
  centsPerThousand: number,
  quoted: string,
];

const INDEX_BANDS: readonly IndexBand[] = [
  [
    100_000,
    2_500_000,
    32_500,
    100_000,
    10_000,
    1_600,
    "$1,001 to $25,000 — $325 for the first $1,000 of value plus $1.60 for each additional $100 of value or fraction thereof",
  ],
  [
    2_500_000,
    5_000_000,
    70_900,
    2_500_000,
    10_000,
    1_550,
    "$25,001 to $50,000 — $709 for the first $25,000 of value plus $1.55 for each additional $100 of value or fraction thereof",
  ],
  [
    5_000_000,
    7_500_000,
    109_650,
    5_000_000,
    10_000,
    1_500,
    "$50,001 to $75,000 — $1,096.50 for the first $50,000 of value plus $1.50 for each additional $100 of value or fraction thereof",
  ],
  [
    7_500_000,
    10_000_000,
    147_150,
    7_500_000,
    10_000,
    1_400,
    "$75,001 to $100,000 — $1,471.50 for the first $75,000 of value plus $1.40 for each additional $100 of value or fraction thereof",
  ],
  [
    10_000_000,
    17_500_000,
    182_150,
    10_000_000,
    100_000,
    775,
    "$100,001 to $175,000 — $1,821.50 for the first $100,000 of value plus $7.75 for each additional $1,000 of value or fraction thereof",
  ],
  [
    17_500_000,
    25_000_000,
    240_275,
    17_500_000,
    100_000,
    775,
    "$175,001 to $250,000 — $2,402.75 for the first $175,000 of value plus $7.75 for each additional $1,000 of value or fraction thereof",
  ],
  [
    25_000_000,
    50_000_000,
    298_400,
    25_000_000,
    100_000,
    750,
    "$250,001 to $500,000 — $2,984 for the first $250,000 of value plus $7.50 for each additional $1,000 of value or fraction thereof",
  ],
  [
    50_000_000,
    75_000_000,
    485_900,
    50_000_000,
    100_000,
    700,
    "$500,001 to $750,000 — $4,859 for the first $500,000 of value plus $7 for each additional $1,000 of value or fraction thereof",
  ],
  [
    75_000_000,
    100_000_000,
    660_900,
    75_000_000,
    100_000,
    700,
    "$750,001 to $1,000,000 — $6,609 for the first $750,000 of value plus $7 for each additional $1,000 of value or fraction thereof",
  ],
  [
    100_000_000,
    150_000_000,
    835_900,
    100_000_000,
    100_000,
    675,
    "$1,000,001 to $1,500,000 — $8,359 for the first $1,000,000 of value plus $6.75 for each additional $1,000 of value or fraction thereof",
  ],
  [
    150_000_000,
    200_000_000,
    1_173_400,
    150_000_000,
    100_000,
    650,
    "$1,500,001 to $2,000,000 — $11,734 for the first $1,500,000 of value plus $6.50 for each additional $1,000 of value or fraction thereof",
  ],
  [
    200_000_000,
    250_000_000,
    1_498_400,
    200_000_000,
    100_000,
    600,
    "$2,000,001 to $2,500,000 — $14,984 for the first $2,000,000 of value plus $6 for each additional $1,000 of value or fraction thereof",
  ],
  [
    250_000_000,
    300_000_000,
    1_798_400,
    250_000_000,
    100_000,
    600,
    "$2,500,001 to $3,000,000 — $17,984 for the first $2,500,000 of value plus $6 for each additional $1,000 of value or fraction thereof",
  ],
  [
    300_000_000,
    350_000_000,
    2_098_400,
    300_000_000,
    100_000,
    525,
    "$3,000,001 to $3,500,000 — $20,984 for the first $3,000,000 of value plus $5.25 for each additional $1,000 of value or fraction thereof",
  ],
  [
    350_000_000,
    400_000_000,
    2_360_900,
    350_000_000,
    100_000,
    500,
    "$3,500,001 to $4,000,000 — $23,609 for the first $3,500,000 of value plus $5 for each additional $1,000 of value or fraction thereof",
  ],
  [
    400_000_000,
    450_000_000,
    2_610_900,
    400_000_000,
    100_000,
    450,
    "$4,000,001 to $4,500,000 — $26,109 for the first $4,000,000 of value plus $4.50 for each additional $1,000 of value or fraction thereof",
  ],
  [
    450_000_000,
    500_000_000,
    2_835_900,
    450_000_000,
    100_000,
    450,
    "$4,500,001 to $5,000,000 — $28,359 for the first $4,500,000 of value plus $4.50 for each additional $1,000 of value or fraction thereof",
  ],
  [
    500_000_000,
    1_000_000_000,
    3_060_900,
    500_000_000,
    100_000,
    400,
    "$5,000,001 to $10,000,000 — $30,609 for the first $5,000,000 of value plus $4 for each additional $1,000 of value or fraction thereof",
  ],
  [
    1_000_000_000,
    2_500_000_000,
    5_060_900,
    1_000_000_000,
    100_000,
    400,
    "$10,000,001 to $25,000,000 — $50,609 for the first $10,000,000 of value plus $4 for each additional $1,000 of value or fraction thereof",
  ],
  [
    2_500_000_000,
    5_000_000_000,
    11_060_900,
    2_500_000_000,
    100_000,
    325,
    "$25,000,001 to $50,000,000 — $110,609 for the first $25,000,000 of value plus $3.25 for each additional $1,000 of value or fraction thereof",
  ],
  [
    5_000_000_000,
    7_500_000_000,
    19_185_900,
    5_000_000_000,
    100_000,
    275,
    "$50,000,001 to $75,000,000 — $191,859 for the first $50,000,000 of value plus $2.75 for each additional $1,000 of value or fraction thereof",
  ],
  [
    7_500_000_000,
    10_000_000_000,
    26_060_900,
    7_500_000_000,
    100_000,
    275,
    "$75,000,001 to $100,000,000 — $260,609 for the first $75,000,000 of value plus $2.75 for each additional $1,000 of value or fraction thereof",
  ],
  [
    10_000_000_000,
    15_000_000_000,
    32_935_900,
    10_000_000_000,
    100_000,
    225,
    "$100,000,001 to $150,000,000 — $329,359 for the first $100,000,000 of value plus $2.25 for each additional $1,000 of value or fraction thereof",
  ],
  [
    15_000_000_000,
    20_000_000_000,
    44_185_900,
    15_000_000_000,
    100_000,
    225,
    "$150,000,001 to $200,000,000 — $441,859 for the first $150,000,000 of value plus $2.25 for each additional $1,000 of value or fraction thereof",
  ],
  [
    20_000_000_000,
    null,
    55_435_900,
    20_000_000_000,
    100_000,
    200,
    "$200,000,001 and up — $554,359 for the first $200,000,000 of value plus $2 for each additional $1,000",
  ],
];

/** The index's first row is a flat charge, so it is written as one. */
export const SEATTLE_INDEX_FIRST_BAND_RULE: FeeRuleRecord = seattleRule({
  id: "seattle-dfi-1",
  code: "DFI-1",
  label: "Development Fee Index, $0 to $1,000",
  description:
    'Table D-1, first row: "$0 to $1,000 — $325 for the first $1,000 of value or fraction thereof". A flat figure, and the same $325 that opens the band above it at $1,000.',
  feeType: "flat",
  config: { amountCents: 32_500 },
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 0 },
      { field: "valuation", op: "lte", value: 100_000 },
    ],
  },
});

/** Table D-1, rows 2 to 26. */
export const SEATTLE_INDEX_BAND_RULES: FeeRuleRecord[] = INDEX_BANDS.map(
  ([lower, upper, base, threshold, increment, rate, quoted], index) =>
    seattleRule({
      id: `seattle-dfi-${index + 2}`,
      code: `DFI-${index + 2}`,
      label: `Development Fee Index, ${quoted.split(" — ")[0]}`,
      description: upper === null ? `Table D-1, final row: "${quoted}"` : `Table D-1: "${quoted}"`,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: base,
        thresholdCents: threshold,
        incrementCents: increment,
        centsPerThousand: rate,
      },
      conditions:
        upper === null
          ? { field: "valuation", op: "gt", value: lower }
          : {
              all: [
                { field: "valuation", op: "gt", value: lower },
                { field: "valuation", op: "lte", value: upper },
              ],
            },
    }),
);

export const SEATTLE_INDEX_RULES: FeeRuleRecord[] = [
  SEATTLE_INDEX_FIRST_BAND_RULE,
  ...SEATTLE_INDEX_BAND_RULES,
];

/**
 * Table D-2 — the percentages. The permit fee *is* the index, so the only rule that
 * needs writing is plan review, which is the index again at the standard rate and 40%
 * of it for a project subject to field inspection.
 */
export const SEATTLE_PLAN_REVIEW_RULES: FeeRuleRecord[] = [
  seattleRule({
    id: "seattle-review-standard",
    code: "PLAN-REVIEW-100",
    label: "Plan review fee, 100% of the Development Fee Index",
    description:
      'Table D-2 for 22.900D.010, item 1 — "Building, with or without mechanical, with or without use": permit fee "100% of DFI", plan review fee "100% of DFI". The review is charged on the `permit_fee` basis — the index this run computed — so the two can never disagree about which band the valuation fell in.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: SEATTLE_BUILDING_FEE_BPS },
    conditions: { field: "custom.review_type", op: "absent" },
  }),
  seattleRule({
    id: "seattle-review-stfi",
    code: "PLAN-REVIEW-STFI-40",
    label: "Plan review fee, 40% of the Development Fee Index (subject to field inspection)",
    description:
      'Table D-2, item 2 — "STFI (subject to field inspection — building and/or mechanical)": permit fee "100% of DFI", plan review fee "40% of DFI". Replaces the 100% column rather than adding to it, so no project is charged both reviews.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: SEATTLE_STFI_REVIEW_BPS },
    conditions: { field: "custom.review_type", op: "eq", value: "stfi" },
  }),
];

const RESIDENTIAL_OR_UNSPECIFIED = {
  any: [
    { field: "custom.building_class", op: "absent" as const },
    { field: "custom.building_class", op: "eq" as const, value: "residential" },
  ],
};

/**
 * The surcharges. The technology fee reads `fee_subtotal`: every component charged
 * before it, of every type.
 */
export const SEATTLE_SURCHARGE_RULES: FeeRuleRecord[] = [
  seattleRule({
    id: "seattle-technology-fee",
    code: "TECHNOLOGY-FEE-5",
    label: "Technology fee, 5% of all fees charged",
    description:
      'SMC 22.900A.100: "A technology fee will be applied in addition to all listed fees in Chapters 22.900B, 22.900C, 22.900D, 22.900E, 22.900F and 22.900H in the amount of five percent of all fees or charges required under the above chapters." Read on the `fee_subtotal` basis, because a percentage of each component separately is not a percentage of the total.',
    feeType: "percent",
    componentType: "technology",
    priority: 900,
    config: { basis: "fee_subtotal", rateBps: SEATTLE_TECHNOLOGY_FEE_BPS },
  }),
  seattleRule({
    id: "seattle-bcc-residential",
    code: "BCC-FEE-RESIDENTIAL",
    label: "Washington State Building Code Council fee, residential",
    description:
      'RCW 19.27.085(3): "There is imposed a fee of six dollars and fifty cents on each residential building permit and a fee of twenty-five dollars for each commercial building permit, issued by a county or a city." Collected by the city and remitted to the state, and outside the fee chapters the technology fee applies to. Charged when `custom.building_class` is absent or "residential".',
    feeType: "flat",
    componentType: "state_surcharge",
    priority: 999,
    config: { amountCents: SEATTLE_BCC_RESIDENTIAL_CENTS },
    conditions: RESIDENTIAL_OR_UNSPECIFIED,
  }),
  seattleRule({
    id: "seattle-bcc-commercial",
    code: "BCC-FEE-COMMERCIAL",
    label: "Washington State Building Code Council fee, commercial",
    description:
      "RCW 19.27.085(3), the same subsection: $25.00 for each commercial building permit. Charged when `custom.building_class` is \"commercial\".",
    feeType: "flat",
    componentType: "state_surcharge",
    priority: 999,
    config: { amountCents: SEATTLE_BCC_COMMERCIAL_CENTS },
    conditions: { field: "custom.building_class", op: "eq", value: "commercial" },
  }),
  seattleRule({
    id: "seattle-bcc-additional-units",
    code: "BCC-FEE-ADDITIONAL-UNITS",
    label: "State surcharge, $2.00 for each residential unit after the first",
    description:
      'RCW 19.27.085(3): "plus an additional surcharge of two dollars for each residential unit, but not including the first unit, on each building containing more than one residential unit". Charged per additional unit, so the first is an allowance rather than a charge.',
    feeType: "per_unit",
    componentType: "state_surcharge",
    priority: 999,
    config: {
      unit: "dwelling_units",
      baseCents: 0,
      thresholdUnits: 1,
      centsPerUnit: SEATTLE_BCC_ADDITIONAL_UNIT_CENTS,
    },
    conditions: RESIDENTIAL_OR_UNSPECIFIED,
  }),
];

/**
 * Table D-15 for 22.900D.150 — electrical permit fees when plans are not required.
 *
 * The rows that decide an ordinary job: the administrative fee charged in addition to
 * every item except the City Light safety inspection, the per-service-size fees, the
 * per-ampacity branch-circuit rows, and the per-unit low-voltage and communications fees.
 *
 * The table's $105.12 minimum applies to a standard Online Trade-Construction self-issued
 * permit, which is a *channel* rather than a kind of work, so it is stated in the prose
 * rather than modelled — and it is not a formality: a single 20-ampere branch circuit at
 * $26.28 plus the $55.48 administrative fee comes to $85.85, below the minimum, so the
 * minimum is what a permit bought that way costs.
 *
 * Every rule here is gated on `custom.electrical_item`, because the table's rows overlap
 * by design: a 200-ampere service and a 200-ampere feeder are different items at
 * different prices ($292.00 and $146.00), so an amperage alone cannot choose between
 * them.
 */
const SERVICE_AMPS = "custom.service_amps";
const ITEM = "custom.electrical_item";

/** The subtitle prints every amount with two decimals; quotes here reproduce that. */
function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** [lowerInclusive, upperInclusive | null, feeCents] for Table D-15 item 7. */
const BRANCH_CIRCUIT_BANDS: ReadonlyArray<readonly [number, number | null, number]> = [
  [0, 25, 2_628],
  [25, 50, 4_380],
  [50, 200, 14_600],
  [200, 350, 29_200],
];

export const SEATTLE_ELECTRICAL_RULES: FeeRuleRecord[] = [
  seattleRule({
    id: "seattle-elec-service-125",
    code: "ELEC-SERVICE-UP-TO-125A",
    label: "New or altered electrical service, up to 125 amperes",
    description: 'Table D-15 for 22.900D.150, item 6: "Up to 125 amperes — $146.00".',
    feeType: "flat",
    config: { amountCents: 14_600 },
    conditions: {
      all: [
        { field: ITEM, op: "eq", value: "service" },
        { field: SERVICE_AMPS, op: "gt", value: 0 },
        { field: SERVICE_AMPS, op: "lte", value: 125 },
      ],
    },
  }),
  seattleRule({
    id: "seattle-elec-service-200",
    code: "ELEC-SERVICE-150-200A",
    label: "New or altered electrical service, 150 to 200 amperes",
    description:
      'Table D-15, item 6: "150 to 200 amperes — $292.00". The published band begins at 150 A, so 126 to 149 A is not a published figure and none is invented for it here.',
    feeType: "flat",
    config: { amountCents: 29_200 },
    conditions: {
      all: [
        { field: ITEM, op: "eq", value: "service" },
        { field: SERVICE_AMPS, op: "gte", value: 150 },
        { field: SERVICE_AMPS, op: "lte", value: 200 },
      ],
    },
  }),
  ...BRANCH_CIRCUIT_BANDS.map(([lower, upper, cents], index) => {
    const range =
      upper === null
        ? "225 to 350 amperes"
        : lower === 0
          ? "up to 25 amperes"
          : `${lower + 1} to ${upper} amperes`;
    return seattleRule({
      id: `seattle-elec-branch-circuit-${index + 1}`,
      code: `ELEC-BRANCH-CIRCUIT-${index + 1}`,
      label: `Branch circuit or feeder, ${range}, each`,
      description:
        `Table D-15, item 7: branch circuit and/or feeder "(new or altered - defined as the replacement, installation or modification of receptacles, switches, luminaires, or wiring on a branch circuit or feeder)", "${range} — ${money(cents)} each". Charged per circuit, which is why the rule counts circuits and bands them by the amperage of the circuit rather than of the service.\n\nTable D-15 item 7's highest band is $292.00 at 225 to 350 amperes. A 400-ampere feeder is under "Plan Review Only" in item 6 and is not published as a flat branch-circuit figure.`,
      feeType: "per_unit",
      config: {
        unit: "circuits",
        baseCents: 0,
        thresholdUnits: 0,
        centsPerUnit: cents,
      },
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "branch_circuit" },
          { field: "custom.circuits", op: "gt", value: 0 },
          { field: SERVICE_AMPS, op: "gt", value: lower },
          ...(upper === null
            ? []
            : [{ field: SERVICE_AMPS, op: "lte" as const, value: upper }]),
        ],
      },
    });
  }),
  seattleRule({
    id: "seattle-elec-service-350",
    code: "ELEC-SERVICE-225-350A",
    label: "New or altered electrical service, 225 to 350 amperes",
    description:
      'Table D-15, item 6: "225 to 350 amperes — $365.00". Above 350 A the table says "400 amperes or more — Plan Review Only", which is reviewed at the hourly rate rather than charged a flat fee, so nothing is modelled there.',
    feeType: "flat",
    config: { amountCents: 36_500 },
    conditions: {
      all: [
        { field: ITEM, op: "eq", value: "service" },
        { field: SERVICE_AMPS, op: "gte", value: 225 },
        { field: SERVICE_AMPS, op: "lte", value: 350 },
      ],
    },
  }),
  seattleRule({
    id: "seattle-elec-administrative",
    code: "ELEC-ADMIN-FEE",
    label: "Electrical permit administrative fee",
    description:
      'Table D-15, item 1a: "An administrative fee of $55.48 will be charged in addition to the other fees specified in this table for all items except subsection 3.f of this Table D-15 for 22.900D.150." Subsection 3.f is the City Light safety inspection, which carries no administrative fee; that is why this rule is written for a service or a low-voltage system and not for that item.',
    feeType: "flat",
    componentType: "other",
    priority: 150,
    config: { amountCents: 5_548 },
    conditions: {
      any: [
        { field: ITEM, op: "eq", value: "service" },
        { field: ITEM, op: "eq", value: "branch_circuit" },
        { field: ITEM, op: "eq", value: "low_voltage" },
      ],
    },
  }),
  seattleRule({
    id: "seattle-elec-low-voltage",
    code: "ELEC-LOW-VOLTAGE-CONTROL-UNIT",
    label: "Low-voltage or communications system, per control unit",
    description:
      'Table D-15, item 5: low-voltage systems "Requires separate permit for each system", "$17.52 each" per control unit, with $2.92 for each device or outlet and a maximum of $636.56 on communications systems. Modelled for a single control unit; the per-device charge is its own rule below.',
    feeType: "flat",
    config: { amountCents: 1_752 },
    conditions: { field: ITEM, op: "eq", value: "low_voltage" },
  }),
  seattleRule({
    id: "seattle-elec-low-voltage-devices",
    code: "ELEC-LOW-VOLTAGE-DEVICES",
    label: "Low-voltage devices or communications outlets, $2.92 each",
    description:
      'Table D-15, item 5: "$2.92 each" for each device (activating, horn, alarm and similar) and for each communications outlet. The table caps communications systems at $636.56; that cap is stated in the prose rather than modelled, because it applies to one of the two systems the row covers.',
    feeType: "per_unit",
    config: {
      unit: "connections",
      baseCents: 0,
      thresholdUnits: 0,
      centsPerUnit: 292,
    },
    conditions: { field: ITEM, op: "eq", value: "low_voltage" },
  }),
  seattleRule({
    id: "seattle-elec-technology-fee",
    code: "TECHNOLOGY-FEE-5-ELEC",
    label: "Technology fee, 5% of all fees charged",
    description:
      "SMC 22.900A.100 applies to Chapter 22.900D, where the electrical permit fees are set, so the same 5% surcharge follows an electrical permit. Read on the `fee_subtotal` basis.",
    feeType: "percent",
    componentType: "technology",
    priority: 900,
    config: { basis: "fee_subtotal", rateBps: SEATTLE_TECHNOLOGY_FEE_BPS },
  }),
];

/** A building permit: the index, the review, then the surcharges on top. */
export const SEATTLE_BUILDING_RULES: FeeRuleRecord[] = [
  ...SEATTLE_INDEX_RULES,
  ...SEATTLE_PLAN_REVIEW_RULES,
  ...SEATTLE_SURCHARGE_RULES,
];
