import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Denver, Colorado fee rules — REAL DATA.
 *
 * Sources (research/colorado/denver.md records the retrieval method and hashes):
 *
 *  S1  City & County of Denver, Community Planning & Development,
 *      "Building Permit Policy — Building and Related Fees", ADMIN 125 and 138,
 *      revision date 21 May 2024, 6 pages. Table No. 1 is the valuation table;
 *      Table No. 2 is ICC valuation data and quick-permit square-foot prices;
 *      Table No. 3 is contractor licence fees, which are not permits.
 *      https://www.denvergov.org/files/assets/public/v/9/community-planning-and-development/documents/ds/building-codes/policies/admin_138.pdf
 *
 *  S2  The same policy as served by the City's plan-review page, which is how it was
 *      found and which records its effective date as a supersession: it "replaces
 *      policy dated Feb. 1, 2024".
 *
 * **Why Denver is the first Colorado jurisdiction.** It is the state's largest permit
 * authority, and its fee policy is a single official PDF with a real text layer, a
 * stated revision date and its tables inside it — the same bar every jurisdiction on
 * this site has had to clear. Two jurisdictions in this project were chosen *against*
 * market size because their schedules were not readable; Denver needed no such
 * compromise.
 *
 * **What is new here, mechanically.** Plan review is a **column of the valuation
 * table**, not a separate schedule: 50% of the permit fee, shown beside every band
 * above $2,000 and shown as `0` for the two bands below it. So the review fee is
 * defined as a percentage of another component, which is the `permit_fee` basis
 * Phoenix produced — and the rate is applied by *reading the same table*, which is
 * why the two fees can never disagree. The policy also prices three review *modes*
 * that replace the 50% figure rather than adding to it (express at 20% with a $100
 * floor, type-approved at 10%, master plans at 50%), which is the mutual-exclusion
 * pattern Scottsdale produced, applied to reviews instead of to items.
 *
 * **The table's arithmetic, checked at every seam rather than assumed.** Five of the
 * six handovers close exactly: $35 at $2,000, $420 at $50,000, $770 at $100,000,
 * $3,010 at $500,000 and $5,385 at $1,000,000 are each what the band below produces
 * at its own top. The sixth does not: the band covering $2,001 to $25,000 charges
 * $35.00 plus $8.00 per additional $1,000, which gives **$219.00** at $25,000, while
 * the band above opens at **$220.00**. One dollar apart, both printed. The pages state
 * it; the tests assert it.
 *
 * **What is deliberately NOT here:**
 *
 *  - **Multi-phase construction surcharges.** "Two Phase Construction Permits — Fee
 *    plus 25%", "Three or More Phase — Fee plus 50%", applied by the policy to *both*
 *    the permit and the plan review fee. Modelling it would mean charging a percentage
 *    of two components from one rule, and the policy does not say whether the 25% on
 *    the review fee is taken before or after the 25% on the permit fee. Rather than
 *    pick one, it is named on the building page and charged on none.
 *  - **The affordable-housing reduction** (up to $6,500 or $10,000 per income
 *    restricted unit, capped at 50% of the construction permit fee) and the
 *    **Affordable Housing Linkage Fee**: both are agreements and ordinances rather
 *    than fee rows, and both are named.
 *  - **Table No. 3's contractor licences** ($250 / $60 / $40 every three years) — a
 *    licence, not a permit.
 *  - **Every hourly and event fee**: re-inspection and after-hours inspection at
 *    $100/hour, additional plan review at $125/hour for incomplete, deferred or
 *    modified drawings.
 *
 * **This module is the single definition of Denver's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records.
 */

/** The policy's own revision date: 21 May 2024. */
export const DENVER_FEE_EFFECTIVE_FROM = "2024-05-21";

export const DENVER_POLICY_SOURCE_KEY = "denver-admin-138";
export const DENVER_FEES_PAGE_SOURCE_KEY = "denver-development-fees";

/** Denver's plan review is half the permit fee, and the table prints it that way. */
export const DENVER_STANDARD_REVIEW_BPS = 5_000;
/** "Express ... charged at a rate of 20% of the permit fee with a minimum charge of $100." */
export const DENVER_EXPRESS_REVIEW_BPS = 2_000;
export const DENVER_EXPRESS_REVIEW_MINIMUM_CENTS = 10_000;
/** "Plan review fees for non-master, type approved (\"TA\") permits ... 10% of the Permit Fee." */
export const DENVER_TYPE_APPROVED_REVIEW_BPS = 1_000;

const SOURCE = DENVER_POLICY_SOURCE_KEY;

function denverRule(
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
    effectiveFrom: DENVER_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/**
 * Table No. 1 — the valuation table, section 100.
 *
 * Read in three pdftotext modes. `-layout` interleaves this table's three columns, so
 * the range, the permit fee and the review percentage arrive out of step; `-table`
 * pairs them, and `-raw` was read to confirm the order of the rows. Both readings
 * agree once the columns are paired, which is the check the project's two-mode rule
 * exists for.
 *
 * The bands chain — each row is written as an amount "for the first N ... plus X for
 * each additional $1,000 or fraction thereof" — with one seam one dollar short of
 * its neighbour, described in the module note above.
 */
export const DENVER_VALUATION_TABLE_RULES: FeeRuleRecord[] = [
  denverRule({
    id: "denver-t1-1-500",
    code: "TABLE1-1-500",
    label: "Building permit fee, valuation $1 to $500",
    description: "Table No. 1, first row: \"$1 to $500 — $20.00\". Plan review is $0 here.",
    feeType: "flat",
    config: { amountCents: 2_000 },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 0 },
        { field: "valuation", op: "lte", value: 50_000 },
      ],
    },
  }),
  denverRule({
    id: "denver-t1-501-2000",
    code: "TABLE1-501-2000",
    label: "Building permit fee, valuation $501 to $2,000",
    description:
      "Table No. 1: \"$501 to $2,000 — $35.00\". A flat figure, and the same $35 that opens the band above it at $2,000. Plan review is $0 here.",
    feeType: "flat",
    config: { amountCents: 3_500 },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000 },
        { field: "valuation", op: "lte", value: 200_000 },
      ],
    },
  }),
  denverRule({
    id: "denver-t1-2001-25000",
    code: "TABLE1-2001-25000",
    label: "Building permit fee, valuation $2,001 to $25,000",
    description:
      "Table No. 1: \"$35.00 for the first $2,000 plus $8.00 for each additional $1,000 or fraction thereof, to and including $25,000\". At $25,000 this produces $219.00 while the band above opens at $220.00 — the table's one seam that is off, by a dollar.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 3_500,
      thresholdCents: 200_000,
      incrementCents: 100_000,
      centsPerThousand: 800,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 200_000 },
        { field: "valuation", op: "lte", value: 2_500_000 },
      ],
    },
  }),
  denverRule({
    id: "denver-t1-25001-50000",
    code: "TABLE1-25001-50000",
    label: "Building permit fee, valuation $25,001 to $50,000",
    description:
      "Table No. 1: \"$220.00 for the first $25,000 plus $8.00 for each additional $1,000 or fraction thereof, to and including $50,000\". At $50,000 this produces exactly the $420.00 the band above opens with.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 22_000,
      thresholdCents: 2_500_000,
      incrementCents: 100_000,
      centsPerThousand: 800,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 2_500_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
  }),
  denverRule({
    id: "denver-t1-50001-100000",
    code: "TABLE1-50001-100000",
    label: "Building permit fee, valuation $50,001 to $100,000",
    description:
      "Table No. 1: \"$420.00 for the first $50,000 plus $7.00 for each additional $1,000 or fraction thereof, to and including $100,000\".",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 42_000,
      thresholdCents: 5_000_000,
      incrementCents: 100_000,
      centsPerThousand: 700,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 5_000_000 },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
  }),
  denverRule({
    id: "denver-t1-100001-500000",
    code: "TABLE1-100001-500000",
    label: "Building permit fee, valuation $100,001 to $500,000",
    description:
      "Table No. 1: \"$770.00 for the first $100,000 plus $5.60 for each additional $1,000 or fraction thereof, to and including $500,000\".",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 77_000,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      centsPerThousand: 560,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 10_000_000 },
        { field: "valuation", op: "lte", value: 50_000_000 },
      ],
    },
  }),
  denverRule({
    id: "denver-t1-500001-1000000",
    code: "TABLE1-500001-1000000",
    label: "Building permit fee, valuation $500,001 to $1,000,000",
    description:
      "Table No. 1: \"$3,010.00 for the first $500,000 plus $4.75 for each additional $1,000 or fraction thereof to and including $1,000,000\".",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 301_000,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      centsPerThousand: 475,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
  }),
  denverRule({
    id: "denver-t1-1000001-up",
    code: "TABLE1-1000001-UP",
    label: "Building permit fee, valuation $1,000,001 and over",
    description:
      "Table No. 1, final row: \"$5,385.00 for the first $1,000,000 plus $3.65 for each additional $1,000 or fraction thereof.\" Open-ended.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 538_500,
      thresholdCents: 100_000_000,
      incrementCents: 100_000,
      centsPerThousand: 365,
    },
    conditions: { field: "valuation", op: "gt", value: 100_000_000 },
  }),
];

/**
 * Plan review, section 200 — the third column of Table No. 1.
 *
 * Four rows exist in the document and the model keeps them mutually exclusive, because
 * they are four *modes* of review rather than four charges:
 *
 *   - the table's column: 50% of the permit fee, and only from $2,000 of valuation up,
 *     because the two bands below print `0`;
 *   - express: 20% of the permit fee, minimum $100;
 *   - type-approved: 10% of the permit fee;
 *   - master plans: 50% of the valuation of the master, "which is equal to 50% of the
 *     calculated permit fee" — the same arithmetic as the standard column, so it is the
 *     same rule.
 *
 * The base is `permit_fee`, the primitive Phoenix produced: the review fee is a
 * percentage of the permit fee this run computed, so the two can never drift apart.
 *
 * Quick permits — hot water heaters, light fixtures, roof coverings and the like — take
 * no review at all: "A review is not performed and there are no plan review fees
 * associated with quick permits." That is expressed as a condition on the review rules
 * rather than as a rule of its own, so a quick permit cannot be charged one.
 */
const reviewConditions = (mode: "standard" | "express" | "type_approved"): FeeRuleRecord["conditions"] => {
  const modeCondition =
    mode === "standard"
      ? { field: "custom.review_type", op: "absent" as const }
      : { field: "custom.review_type", op: "eq" as const, value: mode };

  return {
    all: [
      { field: "valuation", op: "gt", value: 200_000 },
      { field: "custom.permit_kind", op: "absent" },
      modeCondition,
    ],
  };
};

export const DENVER_PLAN_REVIEW_RULES: FeeRuleRecord[] = [
  denverRule({
    id: "denver-review-standard",
    code: "PLAN-REVIEW-50",
    label: "Plan review fee, 50% of the permit fee",
    description:
      "Table No. 1, third column: \"50%\" beside every band from $2,000 of valuation up, and \"0\" for the two below it. Section 200: the plan review fee \"is a percentage of the building permit fee as shown in Table No. 1\" and is \"separate from and in addition to the permit fee\".",
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: DENVER_STANDARD_REVIEW_BPS },
    conditions: reviewConditions("standard"),
  }),
  denverRule({
    id: "denver-review-express",
    code: "PLAN-REVIEW-EXPRESS-20",
    label: "Express plan review fee, 20% of the permit fee",
    description:
      "Section 200: express reviews with a valuation over $2,000 \"are charged at a rate of 20% of the permit fee with a minimum charge of $100\". Replaces the 50% column rather than adding to it, so the two cannot both apply.",
    feeType: "percent",
    componentType: "plan_review",
    priority: 190,
    config: { basis: "permit_fee", rateBps: DENVER_EXPRESS_REVIEW_BPS },
    minimumCents: DENVER_EXPRESS_REVIEW_MINIMUM_CENTS,
    conditions: reviewConditions("express"),
  }),
  denverRule({
    id: "denver-review-type-approved",
    code: "PLAN-REVIEW-TA-10",
    label: "Type-approved plan review fee, 10% of the permit fee",
    description:
      "Section 200: plan review fees for non-master, type approved (\"TA\") permits \"shall be charged at a rate of 10% of the Permit Fee\", on a permit fee based on 100% of the valuation for each unit.",
    feeType: "percent",
    componentType: "plan_review",
    priority: 190,
    config: { basis: "permit_fee", rateBps: DENVER_TYPE_APPROVED_REVIEW_BPS },
    conditions: reviewConditions("type_approved"),
  }),
];

/**
 * What a stand-alone trade permit costs: the same table, on that trade's valuation.
 *
 * The policy's own words: *"Once released, separate permits are required for each
 * discipline, and the permit fee is based on the valuation of the work for that
 * specific trade permitted under that specific permit."* So Denver's electrical and
 * plumbing pages are Table No. 1 applied to the electrical or plumbing contract value,
 * which is the same mechanism Clark County publishes as a fallback sentence and there
 * expressed as policy prose.
 *
 * One reading is taken and stated: whether the review column applies to a *stand-alone*
 * trade permit. The commercial plan review team is described as reviewing
 * "architectural, structural, mechanical, plumbing, and electrical" disciplines, which
 * is a review of the building's drawings rather than a separate trade review, and the
 * policy's plan review section is written about the building permit. No plan review
 * figure is charged on the trade pages here, and both pages say so.
 */
export const DENVER_BUILDING_RULES = [...DENVER_VALUATION_TABLE_RULES, ...DENVER_PLAN_REVIEW_RULES];

export const DENVER_ELECTRICAL_RULES = [...DENVER_VALUATION_TABLE_RULES];

export const DENVER_PLUMBING_RULES = [...DENVER_VALUATION_TABLE_RULES];

/** Every rule this jurisdiction defines, for the seed and the tests. */
export const DENVER_FEE_RULES: FeeRuleRecord[] = [
  ...DENVER_VALUATION_TABLE_RULES,
  ...DENVER_PLAN_REVIEW_RULES,
];

/**
 * The review modes a reader can select, and what each does to the review fee.
 *
 * Kept here rather than in the page so the three names exist once: the payload's rules
 * match these values in conditions, and the page states which one is being shown.
 */
export const DENVER_REVIEW_MODES = [
  { value: "express", label: "Express review (20% of the permit fee, $100 minimum)" },
  { value: "type_approved", label: "Type-approved permit (10% of the permit fee)" },
] as const;

/** Table No. 2 prices, which are valuation data rather than fees. */
export const DENVER_VALUATION_DATA = {
  residentialShingleRoofPerSqFtCents: 525,
  commercialLowSlopeRoofPerSqFtCents: 725,
  finishedBasementWithFacilityPerSqFtCents: 3_500,
  finishedBasementWithoutFacilityPerSqFtCents: 3_100,
  interiorRenovationPerSqFtCents: 6_000,
  popTopPerSqFtCents: 10_500,
} as const;
