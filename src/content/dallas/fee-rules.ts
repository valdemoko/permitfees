import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Dallas fee rules — REAL DATA.
 *
 * Sources (research/texas/dallas.md records every one of them, with the retrieval
 * method and the hash of the file that was read):
 *
 *  S1  City of Dallas, "Permit Fee Schedule", effective 1 May 2024, adopted by
 *      Ordinance 32676. Tables A-I, A-II, A-III, B-I, B-II.
 *      https://dallascityhall.com/departments/sustainabledevelopment/DCH%20documents/DSD%20Fees.pdf
 *
 *  S2  City of Dallas, "PDV Fee Estimate Worksheet Examples" — the department's
 *      own estimator, with five worked examples.
 *      https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/DCH%20documents/pdf/PDV_Fee%20Estimate%20Worksheet%20Examples.pdf
 *
 *  S3  Ordinance 25-0638, effective 15 April 2025, amending Chapter 52 Sec. 303.
 *      https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/DCH%20documents/25-0638.pdf
 *
 * **This module is the single definition of Dallas's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records, so a
 * test cannot pass while the published data says something else.
 *
 * What is deliberately NOT here is as important as what is:
 *
 *  - **Table B-I (alterations or repairs)** is not modelled. Ordinance 25-0638
 *    replaced its whole multiplier table on 15 April 2025, and the amended table
 *    multiplies `(valuation x rate + add factor) x 1.33`, then takes the greater
 *    of that and a trade-count minimum. The engine's `percent` primitive cannot
 *    express the outer factor or a maximum of two functions, and folding 1.33 into
 *    the rates would hide it from the reader. Dallas's alteration fees are named on
 *    the page and not estimated. See research/texas/dallas.md section 4.4.
 *
 *  - **The plan review rate is `draft`.** S1 prints "$0.46 per sq. ft. or $577
 *    (whichever is greater)"; S2's own worked examples compute $0.046 a square
 *    foot (180,000 sq ft -> $8,280; 100,000 -> $4,600; 25,000 -> $1,150; 11,500 ->
 *    the $577 minimum), and their totals balance to the cent. The two official
 *    documents disagree by a factor of ten and neither is a misreading. The rule
 *    ships as `draft`, is never added to a total, and the contradiction is stated
 *    on the page. See research/texas/dallas.md section 4.5.
 */

const SCHEDULE_EFFECTIVE_FROM = "2024-05-01";

/**
 * The four highest A-III brackets are not printed in S1, whose commercial table
 * stops at $1,500,000. They are in S2's table, and S2's own example ($6,000,500 ->
 * $31,672.55) exercises the highest of them arithmetically. 2025-10-16 is the
 * earliest capture of that document, so it is the earliest date the rows can be
 * shown to have applied.
 */
const WORKSHEET_EFFECTIVE_FROM = "2025-10-16";

export const DALLAS_FEE_SCHEDULE_SOURCE_KEY = "dallas-permit-fee-schedule";
export const DALLAS_WORKSHEET_SOURCE_KEY = "dallas-fee-worksheet-examples";
export const DALLAS_ORDINANCE_SOURCE_KEY = "dallas-ordinance-25-0638";

const SOURCE = DALLAS_FEE_SCHEDULE_SOURCE_KEY;

function dallasRule(
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
    effectiveFrom: SCHEDULE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/**
 * Dallas's tables are not organised by occupancy — they are organised by what is
 * being built, and the department's own worksheet repeats each table's heading
 * ("RESIDENTIAL PERMIT FEE — NEW CONSTRUCTION OR ADDITION TO EXISTING BUILDING",
 * "NEW COMMERCIAL OFFICE BUILDING"). `project_class` carries that distinction so a
 * rule states its own scope instead of inferring it from an occupancy class that
 * would call a 200-unit apartment block and a duplex the same thing.
 */
export type DallasProjectClass = "one_and_two_family" | "multifamily" | "commercial";

/** The two work types every construction table in S1 and S2 is written for. */
const CONSTRUCTION_WORK_TYPES = ["new_construction", "addition"] as const;

function constructionRule(
  projectClass: DallasProjectClass,
  extra: FeeCondition[] = [],
): FeeCondition {
  return {
    all: [
      { field: "custom.project_class", op: "eq", value: projectClass },
      { field: "work_type", op: "in", value: [...CONSTRUCTION_WORK_TYPES] },
      ...extra,
    ],
  };
}

/** A `(lower, upper]` range on a non-money basis, in whole units. */
function squareFeetBracket(lowerExclusive: number, upperInclusive: number | null): FeeCondition[] {
  const clauses: FeeCondition[] = [
    { field: "square_footage", op: "gt", value: lowerExclusive },
  ];
  if (upperInclusive !== null) {
    clauses.push({ field: "square_footage", op: "lte", value: upperInclusive });
  }
  return clauses;
}

/** A `(lower, upper]` range on valuation, in cents. */
function valuationBracket(lowerExclusiveCents: number, upperInclusiveCents: number | null): FeeCondition[] {
  const clauses: FeeCondition[] = [
    { field: "valuation", op: "gt", value: lowerExclusiveCents },
  ];
  if (upperInclusiveCents !== null) {
    clauses.push({ field: "valuation", op: "lte", value: upperInclusiveCents });
  }
  return clauses;
}

/* -------------------------------------------------------------------------- */
/* Table A-I — new single-family and duplex construction                      */
/* -------------------------------------------------------------------------- */

/**
 * S1, Table A-I. Fee is a function of square footage, and the rate applies to the
 * WHOLE area, not to the part above the bracket floor: 2,500 sq ft pays
 * `2,500 x 0.077 + 800 = $992.50`, which is the figure in S2's own worked example.
 *
 * Rates are held as cents per square foot because that is what they are. `1.07`
 * dollars per square foot is `{ numerator: 107, denominator: 1 }` with
 * `rateUnit: "currency_per_unit"`; the engine multiplies the area by it and the
 * prose reads "$1.07 per sq ft" rather than "107% of project area".
 *
 * The bracket boundaries are published as `0-700`, `701-2,350`, `2,351-10,500`,
 * `10,501+`: contiguous in whole square feet.
 */
export const DALLAS_A1_BRACKETS: FeeRuleRecord[] = [
  dallasRule({
    id: "dal-a1-700",
    code: "A-I-0-700",
    label: "New single-family and duplex construction permit fee",
    description:
      "S1 Table A-I — $1.07 per sq ft for buildings of 0 to 700 sq ft. The rate applies to the whole area.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 107, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: constructionRule("one_and_two_family", squareFeetBracket(0, 700)),
  }),
  dallasRule({
    id: "dal-a1-2350",
    code: "A-I-701-2350",
    label: "New single-family and duplex construction permit fee",
    description:
      "S1 Table A-I — $0.34569 per sq ft plus $300 for buildings of 701 to 2,350 sq ft. The rate applies to the whole area.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 34_569, denominator: 1_000 },
      rateUnit: "currency_per_unit",
      baseCents: 30_000,
    },
    conditions: constructionRule("one_and_two_family", squareFeetBracket(700, 2_350)),
  }),
  dallasRule({
    id: "dal-a1-10500",
    code: "A-I-2351-10500",
    label: "New single-family and duplex construction permit fee",
    description:
      "S1 Table A-I — $0.077 per sq ft plus $800 for buildings of 2,351 to 10,500 sq ft. The rate applies to the whole area.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 77, denominator: 10 },
      rateUnit: "currency_per_unit",
      baseCents: 80_000,
    },
    conditions: constructionRule("one_and_two_family", squareFeetBracket(2_350, 10_500)),
  }),
  dallasRule({
    id: "dal-a1-top",
    code: "A-I-10501-UP",
    label: "New single-family and duplex construction permit fee",
    description:
      "S1 Table A-I — $0.0272 per sq ft plus $1,000 for buildings of 10,501 sq ft or more. The rate applies to the whole area.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 272, denominator: 100 },
      rateUnit: "currency_per_unit",
      baseCents: 100_000,
    },
    conditions: constructionRule("one_and_two_family", squareFeetBracket(10_500, null)),
  }),
];

/* -------------------------------------------------------------------------- */
/* Table A-II — new multi-family construction                                 */
/* -------------------------------------------------------------------------- */

export const DALLAS_A2_RULES: FeeRuleRecord[] = [
  dallasRule({
    id: "dal-a2-unit",
    code: "A-II-652-UNIT",
    label: "New multi-family construction permit fee",
    description:
      "S1 Table A-II — $652 per dwelling unit. S1 adds: \"Does not apply to accessory structures. See Table A-III\", which is why parking garages, gyms and leasing offices are estimated from the commercial table instead.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 65_200 },
    conditions: constructionRule("multifamily"),
  }),
];

/* -------------------------------------------------------------------------- */
/* Table A-III — new commercial construction                                  */
/* -------------------------------------------------------------------------- */

/**
 * S1 prints six brackets, ending at $1,500,000; S2 prints ten, ending at
 * `10,000,001 or greater`, and its example for a $6,000,500 valuation exercises
 * the fifth of the extra rows. The four rows above $1,500,000 come from S2 and
 * carry its effective date, not S1's. The disagreement is real and is recorded in
 * research/texas/dallas.md section 7.3.
 */
export const DALLAS_A3_BRACKETS: FeeRuleRecord[] = [
  dallasRule({
    id: "dal-a3-2000",
    code: "A-III-0-2000",
    label: "New commercial construction permit fee",
    description:
      "S1 Table A-III — flat $75 for work valued from $0.01 to $2,000. The published multiplier for this bracket is 0, so the fee does not move with valuation inside it.",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: constructionRule("commercial", valuationBracket(0, 200_000)),
  }),
  dallasRule({
    id: "dal-a3-25000",
    code: "A-III-2001-25000",
    label: "New commercial construction permit fee",
    description:
      "S1 Table A-III — 0.95% of the value of the work plus $100 for work valued at $2,001 to $25,000.",
    feeType: "percent",
    config: { basis: "valuation", rate: { numerator: 95, denominator: 10_000 }, baseCents: 10_000 },
    conditions: constructionRule("commercial", valuationBracket(200_000, 2_500_000)),
  }),
  dallasRule({
    id: "dal-a3-60000",
    code: "A-III-25001-60000",
    label: "New commercial construction permit fee",
    description:
      "S1 Table A-III — 0.75% of the value of the work plus $100 for work valued at $25,001 to $60,000.",
    feeType: "percent",
    config: { basis: "valuation", rate: { numerator: 75, denominator: 10_000 }, baseCents: 10_000 },
    conditions: constructionRule("commercial", valuationBracket(2_500_000, 6_000_000)),
  }),
  dallasRule({
    id: "dal-a3-200000",
    code: "A-III-60001-200000",
    label: "New commercial construction permit fee",
    description:
      "S1 Table A-III — 2.7665% of the value of the work plus $350 for work valued at $60,001 to $200,000.",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: { numerator: 27_665, denominator: 1_000_000 },
      baseCents: 35_000,
    },
    conditions: constructionRule("commercial", valuationBracket(6_000_000, 20_000_000)),
  }),
  dallasRule({
    id: "dal-a3-900000",
    code: "A-III-200001-900000",
    label: "New commercial construction permit fee",
    description:
      "S1 Table A-III — 0.6325% of the value of the work plus $400 for work valued at $200,001 to $900,000.",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: { numerator: 6_325, denominator: 1_000_000 },
      baseCents: 40_000,
    },
    conditions: constructionRule("commercial", valuationBracket(20_000_000, 90_000_000)),
  }),
  dallasRule({
    id: "dal-a3-1500000",
    code: "A-III-900001-1500000",
    label: "New commercial construction permit fee",
    description:
      "S1 Table A-III — 0.3895% of the value of the work plus $500 for work valued at $900,001 to $1,500,000. This is the last bracket S1 prints.",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: { numerator: 3_895, denominator: 1_000_000 },
      baseCents: 50_000,
    },
    conditions: constructionRule("commercial", valuationBracket(90_000_000, 150_000_000)),
  }),
  dallasRule({
    id: "dal-a3-2500000",
    code: "A-III-1500001-2500000",
    label: "New commercial construction permit fee",
    description:
      "S2 Table \"COMMERCIAL PERMIT FEE\" — 0.3862% of the value of the work plus $700 for work valued at $1,500,001 to $2,500,000. Not printed in S1, whose commercial table stops at $1,500,000.",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: { numerator: 3_862, denominator: 1_000_000 },
      baseCents: 70_000,
    },
    conditions: constructionRule("commercial", valuationBracket(150_000_000, 250_000_000)),
    effectiveFrom: WORKSHEET_EFFECTIVE_FROM,
    sourceId: DALLAS_WORKSHEET_SOURCE_KEY,
  }),
  dallasRule({
    id: "dal-a3-5000000",
    code: "A-III-2500001-5000000",
    label: "New commercial construction permit fee",
    description:
      "S2 Table \"COMMERCIAL PERMIT FEE\" — 0.363% of the value of the work plus $850 for work valued at $2,500,001 to $5,000,000. Not printed in S1.",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: { numerator: 3_630, denominator: 1_000_000 },
      baseCents: 85_000,
    },
    conditions: constructionRule("commercial", valuationBracket(250_000_000, 500_000_000)),
    effectiveFrom: WORKSHEET_EFFECTIVE_FROM,
    sourceId: DALLAS_WORKSHEET_SOURCE_KEY,
  }),
  dallasRule({
    id: "dal-a3-10000000",
    code: "A-III-5000001-10000000",
    label: "New commercial construction permit fee",
    description:
      "S2 Table \"COMMERCIAL PERMIT FEE\" — 0.5095% of the value of the work plus $1,100 for work valued at $5,000,001 to $10,000,000. Not printed in S1. S2's own example computes a $6,000,500 valuation to a $31,672.55 base fee, which this row reproduces exactly.",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: { numerator: 5_095, denominator: 1_000_000 },
      baseCents: 110_000,
    },
    conditions: constructionRule("commercial", valuationBracket(500_000_000, 1_000_000_000)),
    effectiveFrom: WORKSHEET_EFFECTIVE_FROM,
    sourceId: DALLAS_WORKSHEET_SOURCE_KEY,
  }),
  dallasRule({
    id: "dal-a3-top",
    code: "A-III-10000001-UP",
    label: "New commercial construction permit fee",
    description:
      "S2 Table \"COMMERCIAL PERMIT FEE\" — 0.2527% of the value of the work plus $1,300 for work valued at $10,000,001 or more. Not printed in S1.",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: { numerator: 2_527, denominator: 1_000_000 },
      baseCents: 130_000,
    },
    conditions: constructionRule("commercial", valuationBracket(1_000_000_000, null)),
    effectiveFrom: WORKSHEET_EFFECTIVE_FROM,
    sourceId: DALLAS_WORKSHEET_SOURCE_KEY,
  }),
];

/* -------------------------------------------------------------------------- */
/* Minimum inspection fee schedule — the trade table                          */
/* -------------------------------------------------------------------------- */

/**
 * S1 prints this table three times: under Table A-I, under Table A-III, and under
 * Table B-I, where it is qualified "based on # of trades or valuation — whichever
 * is greater".
 *
 * For new construction S2 settles how it combines with the table fee: the
 * worksheet lists "Base Fee Subtotal", then "INSPECTION FEE — Enter Number of
 * Trades", then the technology fee, and adds them. So on the new-construction
 * path it is a component, not a floor, and it is modelled as one.
 *
 * The nine published rows are $125 x trades up to eight, then $1,125 flat for nine
 * or more. `maximumCents` is that ceiling and reproduces all nine rows exactly.
 */
export const DALLAS_INSPECTION_TRADES: FeeRuleRecord = dallasRule({
  id: "dal-insp-trades",
  code: "INSP-TRADES",
  label: "Minimum inspection fee",
  description:
    "S1 Minimum Inspection Fee Schedule — $125 per trade for one to eight trades, $1,125 for nine or more. Charged on the permit alongside the table fee, as S2's worksheets show it.",
  feeType: "per_unit",
  componentType: "inspection",
  config: { unit: "trades", centsPerUnit: 12_500 },
  maximumCents: 112_500,
});

/* -------------------------------------------------------------------------- */
/* Technology permit fee — Chapter 52 Sec. 303.5.29                           */
/* -------------------------------------------------------------------------- */

export const DALLAS_TECHNOLOGY_FEE: FeeRuleRecord = dallasRule({
  id: "dal-tech",
  code: "TECH-303.5.29",
  label: "Technology permit fee",
  description:
    "S1 line item, restated unchanged by S3 Sec. 303.5.29 — $15 for each application, permit, plan or other construction document submitted through the land management system.",
  feeType: "flat",
  componentType: "technology",
  config: { amountCents: 1_500 },
  sourceId: DALLAS_ORDINANCE_SOURCE_KEY,
});

/* -------------------------------------------------------------------------- */
/* Plan review — DISPUTED, never charged                                      */
/* -------------------------------------------------------------------------- */

/**
 * S1: "Commercial Plan Review Fee $0.46 per sq. ft. or $577 (whichever is
 * greater)", and the same line for residential and multi-family.
 *
 * S2: the same three plan review lines, and its worked examples compute
 * `area x 0.046` — 25,000 sq ft -> $1,150; 180,000 -> $8,280; 100,000 -> $4,600;
 * 11,500 -> the $577 minimum; 2,500 -> the $577 minimum. Each of S2's five example
 * totals balances to the cent with 0.046 and none balances with 0.46.
 *
 * So the two documents disagree by a factor of ten and there is no third source to
 * break the tie. Modelled at S2's figure, shipped as `draft` so it can never enter
 * a total, and stated on the page. See research/texas/dallas.md section 4.5.
 */
export const DALLAS_PLAN_REVIEW_DISPUTED: FeeRuleRecord = dallasRule({
  id: "dal-plan-review",
  code: "PLAN-REVIEW-303",
  label: "Plan review fee",
  description:
    "DISPUTED, NOT CHARGED. S1 prints \"$0.46 per sq. ft. or $577 (whichever is greater)\"; S2's worked examples compute $0.046 per sq ft and its totals balance to the cent at that figure. Modelled at the worksheet's rate with the published $577 minimum, held out of every total until one of the two documents is corrected or confirmed.",
  feeType: "percent",
  componentType: "plan_review",
  config: {
    basis: "square_footage",
    rate: { numerator: 46, denominator: 10 },
    rateUnit: "currency_per_unit",
  },
  // The "or $577" half of the printed line, which both documents agree on. It is a
  // clamp on the rule, not a field of the rate: the plan review fee is the greater
  // of the area charge and this figure.
  minimumCents: 57_700,
  status: "draft",
  sourceId: DALLAS_WORKSHEET_SOURCE_KEY,
});
