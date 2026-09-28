import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Clark County, Nevada fee rules — REAL DATA.
 *
 * Sources (research/nevada/clark-county.md records every one of them, with the
 * retrieval method and the hash of the file that was read):
 *
 *  S1  Clark County, "2018 Clark County Building Administrative Code" — a
 *      County-published compilation of Clark County Code Chapter 22.02, printed
 *      October 2022. Tables 3-A, 3-B, 3-C and 3-D are on pages 67-69.
 *      https://www.clarkcountynv.gov/adobe/assets/urn:aaid:aem:d43c9c5d-c4bc-46a5-8ca1-6f3bd9a5b921/original/as/administrative-code-2nd-proof-final-08-18-22-printed-10-2022.pdf
 *
 *  S2  Clark County Department of Building & Fire Prevention, "Fees Calculator" —
 *      the department's own fee page, which publishes the impact fees charged on
 *      top of a permit and routes to S1 for the table. Its calculator is
 *      client-rendered and carries no readable rate.
 *      https://www.clarkcountynv.gov/government/departments/building___fire_prevention/permit_issuance/fees
 *
 * **Why this jurisdiction is not a copy of any of the four before it.** Table 3-A is
 * a valuation table, like Phoenix's — and its arithmetic is the *opposite* of
 * Houston's bracket table, which is the single most useful thing this jurisdiction
 * has taught the engine so far:
 *
 *  - **Houston's brackets deliberately do not chain.** Each row is a fee for a
 *    valuation falling in that row, and a test pins that reading.
 *
 *  - **Clark County's bands do chain, and four of the five seams close to the cent.**
 *    Every band is written as "for the first N, plus X for each additional $1,000
 *    or fraction thereof", so each band's opening figure is what the band below it
 *    produces at its top: $54.00 at $500, $248.82 at $25,000, $366.95 at $50,000
 *    and $537.05 at $100,000 — the last three only after the half-cent increments
 *    are rounded, which is why the seams are asserted by running the engine rather
 *    than by multiplying on paper.
 *
 *    **One seam does not close, and it is the schedule's, not the site's.** The band
 *    covering $501 to $2,000 charges $54.00 plus $1.683 per additional $100, which
 *    gives $79.245 — $79.25 rounded — at $2,000, while the band above it opens at
 *    $79.29. Four cents apart, both printed. It is asserted rather than smoothed
 *    away. See `TABLE-3A-2001-25000` below.
 *
 *  - **The rates are finer than a cent per thousand.** `$4.725`, `$3.402` and
 *    `$2.934` per $1,000 are 472.5, 340.2 and 293.4 cents — and 47.25, 34.02 and
 *    29.34 basis points. Neither existing primitive can hold them, so `per_thousand`
 *    gained an exact fraction, exactly as `percent` did for Dallas. Rounding them
 *    first would make every Clark County building permit above $25,000 of valuation
 *    wrong by cents.
 *
 *  - **The trades have their own tables** (3-B, 3-C, 3-D), and a published fallback
 *    in terms: "Fees for projects not specified in this schedule shall be determined
 *    by the Building Official by applying the total value of the scope of work being
 *    performed to Table 3-A of this chapter." That sentence is why the electrical and
 *    plumbing pages reuse the Table 3-A bands rather than showing only the flat rows:
 *    without it a page could state a fee for a water heater and omit the permit that
 *    carries it.
 *
 * **The one reading this file makes, stated plainly.** Each trade table opens with a
 * "Permit Issuance — for issuing permit — $54.00" row, and Table 3-A's own first row
 * is also $54.00 (for a valuation of $1 to $500). Those are the same floor. So the
 * $54 is treated as the value table's minimum rather than as a second charge on top
 * of it, and a general trade permit costs Table 3-A applied to the value of the
 * trade work. Charging both would bill the same $54 twice for one permit. If the
 * County means the issuance fee to be additional, a general electrical or plumbing
 * permit here is $54 more than this site shows, and both trade pages say so.
 *
 * What is deliberately NOT here:
 *
 *  - **Tables 3-E and 3-F (grading), 3-G (amusement and transportation systems),
 *    3-H (administrative and investigative), 3-I (plans examination, inspections and
 *    miscellaneous), 3-J (signs) and 3-L (storm sewer).** All seven are published and
 *    none is modelled: they price reviews, inspections and event-triggered fees rather
 *    than the construction permits this site answers for. The grading tables in
 *    particular are charged per cubic yard of excavation and fill, which is a real
 *    fee and a different question.
 *
 *  - **The impact fees the department's own page lists** — transportation tax,
 *    residential park fee, MSHCP mitigation and administrative fees, public facility
 *    needs assessment, traffic mitigation, state water impact fee. The County states
 *    that some or all apply to some projects and not others, and publishes no rate;
 *    they are named on every page and charged by nobody here.
 *
 * **This module is the single definition of Clark County's fee rules.** The seed
 * writes exactly these records and the tests assert against exactly these records, so
 * a test cannot pass while the published data says something else.
 */

/**
 * Ordinance 4917 amended sections 22.02.395, 400 and 405 — the electrical,
 * mechanical and plumbing tables — with effect from 1 March 2022.
 */
export const CLARK_TRADE_FEE_EFFECTIVE_FROM = "2022-03-01";

/**
 * Section 22.02.390, Table 3-A, was last amended by Ordinance 4663, effective
 * 6 February 2019. Recorded separately rather than flattened into one date, because
 * the document's own amendment history is the only place the difference is visible.
 */
export const CLARK_VALUATION_TABLE_EFFECTIVE_FROM = "2019-02-06";

/** The compilation is Chapter 22.02; this is the latest amendment it records. */
export const CLARK_FEE_EFFECTIVE_FROM = CLARK_TRADE_FEE_EFFECTIVE_FROM;

export const CLARK_ADMIN_CODE_SOURCE_KEY = "clark-admin-code";
export const CLARK_FEES_PAGE_SOURCE_KEY = "clark-fees-calculator";

const SOURCE = CLARK_ADMIN_CODE_SOURCE_KEY;

function clarkRule(
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
    effectiveFrom: CLARK_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/**
 * The bands are mutually exclusive on valuation, and each one carries a second
 * condition that looks like an implementation detail and is not: a project that has
 * selected a specific published trade item — a panel replacement, a water heater —
 * is priced by that item, because the trade tables call Table 3-A the fee for work
 * those tables do not specify. Without this condition a selected water heater would
 * be charged twice: once as a flat row of Table 3-D and once through Table 3-A.
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
 * Table 3-A, section 22.02.390 — Permit Fees Based on Valuation.
 *
 * Read twice: `pdftotext -layout` and `pdftotext -table` agree row for row, label
 * against amount. "or fraction thereof" is modelled with `incrementCents`, because
 * it changes the answer: one cent into a band is a whole additional thousand.
 *
 * The band boundaries are asserted in tests/calc/per-thousand-exact.test.ts and in
 * tests/content/clarkcounty-seed.test.ts, including the one seam that does not close
 * (bands 2 and 3) and the four that do.
 */
export const CLARK_VALUATION_TABLE_RULES: FeeRuleRecord[] = [
  clarkRule({
    id: "clark-t3a-1-500",
    code: "TABLE-3A-1-500",
    label: "Building permit fee, valuation up to $500",
    description:
      "Table 3-A, first row: \"$1 to $500 — $54.00\". The plainest fee in the table, and the same $54 that opens every trade table in the chapter.",
    feeType: "flat",
    effectiveFrom: CLARK_VALUATION_TABLE_EFFECTIVE_FROM,
    config: { amountCents: 5_400 },
    conditions: bandConditions(null, 50_000),
  }),
  clarkRule({
    id: "clark-t3a-501-2000",
    code: "TABLE-3A-501-2000",
    label: "Building permit fee, $501 to $2,000 of valuation",
    description:
      "Table 3-A: \"$54.00 for the first $500.00 plus $1.683 for each additional $100.00 or fraction thereof, to and including $2,000.00\". The only band whose step is $100 rather than $1,000, which is why the rate is stored as $16.83 per $1,000 with a $100 increment.",
    feeType: "per_thousand",
    effectiveFrom: CLARK_VALUATION_TABLE_EFFECTIVE_FROM,
    config: {
      basis: "valuation",
      baseCents: 5_400,
      thresholdCents: 50_000,
      incrementCents: 10_000,
      centsPerThousand: 1_683,
    },
    conditions: bandConditions(50_000, 200_000),
  }),
  clarkRule({
    id: "clark-t3a-2001-25000",
    code: "TABLE-3A-2001-25000",
    label: "Building permit fee, $2,001 to $25,000 of valuation",
    description:
      "Table 3-A: \"$79.29 for the first $2,000.00 plus $7.371 for each additional $1,000.00 or fraction thereof\". $7.371 per $1,000 is 737.1 cents — not a whole cent, so it is stored as the fraction 7,371/10. This is also the one seam that does not close: the band below's own rate gives $79.245, $79.25 rounded, at $2,000, and this row opens at $79.29. Four cents apart, both figures published; the page states the discrepancy rather than picking one silently.",
    feeType: "per_thousand",
    effectiveFrom: CLARK_VALUATION_TABLE_EFFECTIVE_FROM,
    config: {
      basis: "valuation",
      baseCents: 7_929,
      thresholdCents: 200_000,
      incrementCents: 100_000,
      rateCentsPerThousand: { numerator: 7_371, denominator: 10 },
    },
    conditions: bandConditions(200_000, 2_500_000),
  }),
  clarkRule({
    id: "clark-t3a-25001-50000",
    code: "TABLE-3A-25001-50000",
    label: "Building permit fee, $25,001 to $50,000 of valuation",
    description:
      "Table 3-A: \"$248.82 for the first $25,000.00 plus $4.725 for each additional $1,000.00 or fraction thereof\". $4.725 is 472.5 cents per $1,000 — not a whole cent, and 47.25 basis points — so the rate is carried as the exact fraction 945/2.",
    feeType: "per_thousand",
    effectiveFrom: CLARK_VALUATION_TABLE_EFFECTIVE_FROM,
    config: {
      basis: "valuation",
      baseCents: 24_882,
      thresholdCents: 2_500_000,
      incrementCents: 100_000,
      rateCentsPerThousand: { numerator: 945, denominator: 2 },
    },
    conditions: bandConditions(2_500_000, 5_000_000),
  }),
  clarkRule({
    id: "clark-t3a-50001-100000",
    code: "TABLE-3A-50001-100000",
    label: "Building permit fee, $50,001 to $100,000 of valuation",
    description:
      "Table 3-A: \"$366.95 for the first $50,000.00 plus $3.402 for each additional $1,000.00 or fraction thereof\". $3.402 per $1,000 is 340.2 cents, carried as 3402/10. This band's opening figure is exactly what band 4 produces at $50,000 once its own half-cent increment is rounded — $366.945 becomes $366.95 — which is asserted by running the engine rather than shown on paper.",
    feeType: "per_thousand",
    effectiveFrom: CLARK_VALUATION_TABLE_EFFECTIVE_FROM,
    config: {
      basis: "valuation",
      baseCents: 36_695,
      thresholdCents: 5_000_000,
      incrementCents: 100_000,
      rateCentsPerThousand: { numerator: 3_402, denominator: 10 },
    },
    conditions: bandConditions(5_000_000, 10_000_000),
  }),
  clarkRule({
    id: "clark-t3a-100001-up",
    code: "TABLE-3A-100001-UP",
    label: "Building permit fee, $100,001 of valuation and above",
    description:
      "Table 3-A, final row: \"$537.05 for the first $100,000.00 plus $2.934 for each additional $1,000.00 or fraction thereof.\" Open-ended, and the only band a large project can be in.",
    feeType: "per_thousand",
    effectiveFrom: CLARK_VALUATION_TABLE_EFFECTIVE_FROM,
    config: {
      basis: "valuation",
      baseCents: 53_705,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      rateCentsPerThousand: { numerator: 2_934, denominator: 10 },
    },
    conditions: bandConditions(10_000_000, null),
  }),
];

/** Table 3-B, section 22.02.395 — Electrical Permit Fees. */
export const CLARK_ELECTRICAL_ITEM_RULES: FeeRuleRecord[] = [
  clarkRule({
    id: "clark-t3b-retag",
    code: "TABLE-3B-RETAG",
    label: "Electric re-tag only",
    description:
      "Table 3-B, Online Electrical Simple Permit Fees: \"Electric Re-Tag Only — $61.88\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 6_188 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "electric_retag" },
  }),
  clarkRule({
    id: "clark-t3b-panel-200",
    code: "TABLE-3B-PANEL-200",
    label: "Same-size panel replacement, up to 200 A",
    description:
      "Table 3-B: \"Electrical Same Size Panel Replacement up to 200amp — $61.88\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 6_188 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "panel_200" },
  }),
  clarkRule({
    id: "clark-t3b-panel-600",
    code: "TABLE-3B-PANEL-600",
    label: "Same-size panel replacement, up to 600 A",
    description:
      "Table 3-B: \"Electrical Same Size Panel Replacement up to 600amp — $70.56\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 7_056 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "panel_600" },
  }),
  clarkRule({
    id: "clark-t3b-panel-2000",
    code: "TABLE-3B-PANEL-2000",
    label: "Same-size panel replacement, up to 2000 A",
    description:
      "Table 3-B: \"Electrical Same Size Panel Replacement up to 2000amp — $86.80\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 8_680 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "panel_2000" },
  }),
  clarkRule({
    id: "clark-t3b-panel-over-2000",
    code: "TABLE-3B-PANEL-OVER-2000",
    label: "Same-size panel replacement, over 2000 A",
    description:
      "Table 3-B: \"Electrical Same Size Panel Replacement over 2000amp — $119.16\". The last published step, and open-ended above it.",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 11_916 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "panel_over_2000" },
  }),
  clarkRule({
    id: "clark-t3b-subpanel",
    code: "TABLE-3B-SUBPANEL",
    label: "Each subpanel or distribution board",
    description:
      "Table 3-B, Services: \"For each subpanel or distribution board — $4.35\". Charged per device on any electrical permit, including one priced from the value table.",
    feeType: "per_unit",
    componentType: "other",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { unit: "panels", centsPerUnit: 435 },
  }),
  clarkRule({
    id: "clark-t3b-low-voltage",
    code: "TABLE-3B-LOW-VOLTAGE",
    label: "Each low-voltage point",
    description:
      "Table 3-B, Power Limited: \"$0.45 — for signals, alarms, or television outlets, control panels, telephones, switchboards, each\". A per-device charge, and the reason the engine gained a `low_voltage_points` count: a switchboard is not an outlet, and reading Clark's switchboards as Houston's outlets would be two jurisdictions charged from one number.",
    feeType: "per_unit",
    componentType: "other",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { unit: "low_voltage_points", centsPerUnit: 45 },
  }),
];

/** Table 3-D, section 22.02.405 — Plumbing Permit Fees. */
export const CLARK_PLUMBING_ITEM_RULES: FeeRuleRecord[] = [
  clarkRule({
    id: "clark-t3d-gas-retag",
    code: "TABLE-3D-GAS-RETAG",
    label: "Gas re-tag only",
    description: "Table 3-D, Online Plumbing Simple Permit Fees: \"Gas Retag ONLY — $61.88\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 6_188 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "gas_retag" },
  }),
  clarkRule({
    id: "clark-t3d-repipe",
    code: "TABLE-3D-REPIPE",
    label: "Plumbing re-pipe",
    description: "Table 3-D, Online Plumbing Simple Permit Fees: \"Plumbing Re-Pipe — $56.57\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 5_657 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "repipe" },
  }),
  clarkRule({
    id: "clark-t3d-reverse-osmosis",
    code: "TABLE-3D-REVERSE-OSMOSIS",
    label: "Reverse osmosis system",
    description: "Table 3-D, Online Plumbing Simple Permit Fees: \"Reverse Osmosis — $56.57\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 5_657 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "reverse_osmosis" },
  }),
  clarkRule({
    id: "clark-t3d-water-heater",
    code: "TABLE-3D-WATER-HEATER",
    label: "Water heater",
    description: "Table 3-D, Online Plumbing Simple Permit Fees: \"Water Heater — $56.57\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 5_657 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "water_heater" },
  }),
  clarkRule({
    id: "clark-t3d-water-softener",
    code: "TABLE-3D-WATER-SOFTENER",
    label: "Water softener",
    description: "Table 3-D, Online Plumbing Simple Permit Fees: \"Water Softener — $56.57\".",
    feeType: "flat",
    effectiveFrom: CLARK_TRADE_FEE_EFFECTIVE_FROM,
    config: { amountCents: 5_657 },
    conditions: { field: "custom.schedule_item", op: "eq", value: "water_softener" },
  }),
];

/** Every rule this jurisdiction defines, in one list for the seed and the tests. */
export const CLARK_FEE_RULES: FeeRuleRecord[] = [
  ...CLARK_VALUATION_TABLE_RULES,
  ...CLARK_ELECTRICAL_ITEM_RULES,
  ...CLARK_PLUMBING_ITEM_RULES,
];

/**
 * What each permit page computes.
 *
 * Building and the two trades all begin from Table 3-A, and that is the schedule's
 * own instruction rather than a simplification: 3-B and 3-D both end with the same
 * sentence routing unspecified work to Table 3-A. The trade sets add the flat rows
 * that table prices separately.
 */
export const CLARK_BUILDING_RULES = [...CLARK_VALUATION_TABLE_RULES];

export const CLARK_ELECTRICAL_RULES = [
  ...CLARK_VALUATION_TABLE_RULES,
  ...CLARK_ELECTRICAL_ITEM_RULES,
];

export const CLARK_PLUMBING_RULES = [
  ...CLARK_VALUATION_TABLE_RULES,
  ...CLARK_PLUMBING_ITEM_RULES,
];

/** The schedule item a reader can select on the electrical page. */
export const CLARK_ELECTRICAL_ITEMS = [
  { value: "electric_retag", label: "Electric re-tag only", amountCents: 6_188 },
  { value: "panel_200", label: "Same-size panel replacement, up to 200 A", amountCents: 6_188 },
  { value: "panel_600", label: "Same-size panel replacement, up to 600 A", amountCents: 7_056 },
  { value: "panel_2000", label: "Same-size panel replacement, up to 2000 A", amountCents: 8_680 },
  {
    value: "panel_over_2000",
    label: "Same-size panel replacement, over 2000 A",
    amountCents: 11_916,
  },
] as const;

/** The same, for plumbing. */
export const CLARK_PLUMBING_ITEMS = [
  { value: "gas_retag", label: "Gas re-tag only", amountCents: 6_188 },
  { value: "repipe", label: "Plumbing re-pipe", amountCents: 5_657 },
  { value: "reverse_osmosis", label: "Reverse osmosis system", amountCents: 5_657 },
  { value: "water_heater", label: "Water heater", amountCents: 5_657 },
  { value: "water_softener", label: "Water softener", amountCents: 5_657 },
] as const;
