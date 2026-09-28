import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Kansas City, Missouri fee rules — REAL DATA.
 *
 * Source (research/missouri/kansas-city.md records how it was read):
 *
 *  S1  City Planning and Development Department — Permit Fee Schedule,
 *      Commercial Projects Including Residential Buildings with Three or More
 *      Dwelling Units. 1 page, 68,049 bytes, SHA-256
 *      350051f8f1b081bee9e716bc60050284123aa280c07d2068edb6b7b59b8bda84,
 *      HTTP 200, printed 05/01/2012 from Ord #080766 eff. 05/01/2012.
 *      https://data.kcmo.org/api/file_data/NQBR-PGwgb7p5xa8YAUChBI6ooDAfSBo7ba3tZuL2oQ?filename=Permit+fees+commercial.pdf
 *
 * **The mechanism, in two sentences.** One valuation ladder is charged once per
 * building **per trade** — Building, Mechanical, Plumbing, Electrical, Elevator and
 * Fire Protection, each on that trade's declared valuation — $1–$50,000 as a flat
 * table ($48 to $686 in 50 brackets), then $686 plus $12.50 per $1,000 to $200,000,
 * $2,561 plus $8.30 to $1,000,000, and $9,201 plus $3.60 beyond, each band's printed
 * base chaining to the one below. Plan review is a credited prepayment — half the
 * permit fee paid at submission and credited at issuance — so no rule adds it; five
 * ancillary flats ($50 changes, $77 partial minimum, $50 supplemental minimum,
 * $272 resubmittal cap, $69 express) are named on the page and not summed.
 *
 * **What is deliberately NOT here:** plan review's half (credited, named not charged),
 * the $50/$77/$50/$272/$69 ancillary rows, and any residential one- and two-family
 * ladder (no readable KC schedule for that class was found from this sandbox, so no
 * amount is guessed).
 */

export const KANSAS_CITY_FEE_EFFECTIVE_FROM = "2012-05-01";

export const KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY = "kcmo-commercial-fee-schedule";

function kcRule(
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
    effectiveFrom: KANSAS_CITY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — the valuation ladder                                     */
/* -------------------------------------------------------------------------- */

/**
 * $1–$50,000: 50 flat brackets taken verbatim from the sheet. The sheet prints
 * each $1,000 window; $12.50 is not a rate on the whole valuation and `inc`
 * is not the fraction phrase — it is a table, charged by bracket.
 */
export const KANSAS_CITY_VALUATION_TABLE_TIERS: FeeRuleRecord["config"] extends { tiers: infer T } ? T : never = [] as never;

export const KANSAS_CITY_BUILDING_RULES: FeeRuleRecord[] = [
  kcRule(KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "kcmo-bld-table-1-50000",
    code: "BLD-TABLE-1-50000",
    label: "Building permit — $1 to $50,000: flat table $48.00 to $686.00 (50 brackets)",
    feeType: "tiered_table",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 50_000, amountCents: 4_800 },
        { upToCents: 200_000, amountCents: 8_600 },
        { upToCents: 300_000, amountCents: 9_850 },
        { upToCents: 400_000, amountCents: 11_100 },
        { upToCents: 500_000, amountCents: 12_350 },
        { upToCents: 600_000, amountCents: 13_600 },
        { upToCents: 700_000, amountCents: 14_850 },
        { upToCents: 800_000, amountCents: 16_100 },
        { upToCents: 900_000, amountCents: 17_350 },
        { upToCents: 1_000_000, amountCents: 18_600 },
        { upToCents: 1_100_000, amountCents: 19_850 },
        { upToCents: 1_200_000, amountCents: 21_100 },
        { upToCents: 1_300_000, amountCents: 22_350 },
        { upToCents: 1_400_000, amountCents: 23_600 },
        { upToCents: 1_500_000, amountCents: 24_850 },
        { upToCents: 1_600_000, amountCents: 26_100 },
        { upToCents: 1_700_000, amountCents: 27_350 },
        { upToCents: 1_800_000, amountCents: 28_600 },
        { upToCents: 1_900_000, amountCents: 29_850 },
        { upToCents: 2_000_000, amountCents: 31_100 },
        { upToCents: 2_100_000, amountCents: 32_350 },
        { upToCents: 2_200_000, amountCents: 33_600 },
        { upToCents: 2_300_000, amountCents: 34_850 },
        { upToCents: 2_400_000, amountCents: 36_100 },
        { upToCents: 2_500_000, amountCents: 37_350 },
        { upToCents: 2_600_000, amountCents: 38_600 },
        { upToCents: 2_700_000, amountCents: 39_850 },
        { upToCents: 2_800_000, amountCents: 41_100 },
        { upToCents: 2_900_000, amountCents: 42_350 },
        { upToCents: 3_000_000, amountCents: 43_600 },
        { upToCents: 3_100_000, amountCents: 44_850 },
        { upToCents: 3_200_000, amountCents: 46_100 },
        { upToCents: 3_300_000, amountCents: 47_350 },
        { upToCents: 3_400_000, amountCents: 48_600 },
        { upToCents: 3_500_000, amountCents: 49_850 },
        { upToCents: 3_600_000, amountCents: 51_100 },
        { upToCents: 3_700_000, amountCents: 52_350 },
        { upToCents: 3_800_000, amountCents: 53_600 },
        { upToCents: 3_900_000, amountCents: 54_850 },
        { upToCents: 4_000_000, amountCents: 56_100 },
        { upToCents: 4_100_000, amountCents: 57_350 },
        { upToCents: 4_200_000, amountCents: 58_600 },
        { upToCents: 4_300_000, amountCents: 59_850 },
        { upToCents: 4_400_000, amountCents: 61_100 },
        { upToCents: 4_500_000, amountCents: 62_350 },
        { upToCents: 4_600_000, amountCents: 63_600 },
        { upToCents: 4_700_000, amountCents: 64_850 },
        { upToCents: 4_800_000, amountCents: 66_100 },
        { upToCents: 4_900_000, amountCents: 67_350 },
        { upToCents: 5_000_000, amountCents: 68_600 },
      ],
    },
    conditions: { field: "valuation", op: "lte", value: 5_000_000 },
    description:
      'The sheet\\\'s $1 to $50,000 block, printed as one flat amount per $1,000 window: \"$1–500 $48.00\", \"$501–2,000 $86.00\", \"$2,001–3,000 $98.50\" … \"$49,001–50,000 $686.00\". 50 brackets; the amount for $12,300 of valuation is the $12,001–13,000 row ($223.50), not $12,300 × a rate. The row count matters: at $1,500 of valuation the whole schedule has never left this table.',
  }),
  kcRule(KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "kcmo-bld-band-50k-200k",
    code: "BLD-50K-200K",
    label: "Building permit — $50,001 to $200,000: $686.00 plus $12.50 per $1,000 or fraction above $50,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 68_600,
      thresholdCents: 5_000_000,
      centsPerThousand: 1_250,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 5_000_000 },
        { field: "valuation", op: "lte", value: 20_000_000 },
      ],
    },
    description:
      'The sheet\\\'s \"$686.00 for the first $50,000 plus $12.50 for each additional $1,000 or fraction thereof, to and including $200,000.\" $686.00 at $50,000 inside the table, and $686.00 as the base here — the ladder chains.',
  }),
  kcRule(KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "kcmo-bld-band-200k-1m",
    code: "BLD-200K-1M",
    label: "Building permit — $200,001 to $1,000,000: $2,561.00 plus $8.30 per $1,000 or fraction above $200,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 256_100,
      thresholdCents: 20_000_000,
      centsPerThousand: 830,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 20_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
    description:
      'The sheet\\\'s \"$2,561.00 for the first $200,000 plus $8.30 for each additional $1,000 or fraction thereof, to and including $1,000,000.\" $2,561.00 is $686.00 + 150 × $12.50, so the printed base is the arithmetic of the band below.',
  }),
  kcRule(KANSAS_CITY_FEE_SCHEDULE_SOURCE_KEY, {
    id: "kcmo-bld-band-over-1m",
    code: "BLD-1M-UP",
    label: "Building permit — $1,000,001 and over: $9,201.00 plus $3.60 per $1,000 or fraction above $1,000,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 920_100,
      thresholdCents: 100_000_000,
      centsPerThousand: 360,
      incrementCents: 100_000,
    },
    conditions: { field: "valuation", op: "gt", value: 100_000_000 },
    description:
      'The sheet\\\'s \"$9,201.00 for the first $1,000,000 plus $3.60 for each additional $1,000 or fraction thereof.\" Open-ended. $9,201.00 is $2,561.00 + 800 × $8.30, so the top base is also the chain.',
  }),
];

/**
 * The same four rules for the electrical permit. The sheet's header lists Building,
 * Mechanical, Plumbing, Electrical, Elevator and Fire Protection together with the
 * sentence \"PERMIT FEES SHALL BE CALCULATED SEPARATELY FOR EACH BUILDING\" and
 * \"separate construction valuation shall be provided for each trade\" — one ladder,
 * read against the electrical valuation when the permit is electrical.
 */
export const KANSAS_CITY_ELECTRICAL_RULES: FeeRuleRecord[] = KANSAS_CITY_BUILDING_RULES.map((rule) => ({
  ...rule,
  id: rule.id.replace("kcmo-bld-", "kcmo-elec-"),
  code: rule.code.replace("BLD", "ELEC"),
  label: rule.label.replace("Building permit", "Electrical permit"),
}));

/** Same — the plumbing trade reads the same sheet against the plumbing valuation. */
export const KANSAS_CITY_PLUMBING_RULES: FeeRuleRecord[] = KANSAS_CITY_BUILDING_RULES.map((rule) => ({
  ...rule,
  id: rule.id.replace("kcmo-bld-", "kcmo-plumb-"),
  code: rule.code.replace("BLD", "PLUMB"),
  label: rule.label.replace("Building permit", "Plumbing permit"),
}));

export const KANSAS_CITY_BUILDING_FEE_RULES = KANSAS_CITY_BUILDING_RULES;
