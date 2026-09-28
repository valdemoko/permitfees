import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Charleston, SOUTH CAROLINA fee rules — REAL DATA (reconstruction).
 *
 * Sources (research/south-carolina/charleston.md):
 *   - "City of Charleston, SC — Building and Trade Permit Fee Schedule",
 *     approved by Ordinance Nos. 2017-131, 2019-064 & 2019-072, effective
 *     October 1, 2019 (7-page PDF, charleston-sc.gov DocumentCenter 39116;
 *     no text layer — read page-by-page from the rendered document).
 *
 * Structure (the import contract `charleston/index.ts` relies on):
 *   - CHAS_FEE_EFFECTIVE_FROM and CHAS_BUILDING_SOURCE_KEY (the latter doubles
 *     as the fee-schedule key and the one source key), plus one rules array
 *     per permit type: CHAS_BUILDING_RULES / CHAS_ELECTRICAL_RULES /
 *     CHAS_PLUMBING_RULES.
 *
 * Fee shape (pinned by tests/content/south-carolina-seed.test.ts):
 *   - Building ladder, one `per_thousand` rule per printed band, each gated to
 *     its valuation range with the schedule's own printed base:
 *       $1,001–$50,000:    $35.00  + $5.50 per $1,000 or fraction
 *       $50,001–$100,000:  $290.00 + $4.64 per $1,000 or fraction
 *       $100,001–$500,000: $522.00 + $3.00 per $1,000 or fraction
 *       $500,001 and up:   $1,600.00 + $2.00 per $1,000 or fraction
 *     The test pins $209,070 → $522.00 + 110 × $3.00 = $852.00 and the seam
 *     behaviour at $50,000/$50,010.
 *   - Plan review: 50% of the building permit fee (basis `permit_fee`,
 *     rateBps 5_000), charged when a valuation above $1,000 is present —
 *     the worked example pins 50% of $852.00 = $426.00.
 *   - Application fee: $40.00 flat on every building and trade permit.
 *   - Electrical / plumbing trade permits: flat $75.00 (the schedule prices
 *     trade permits from the same valuation shape; the seed's pages pin the
 *     trade row at $75.00) plus the $40 application fee. Worked examples pin
 *     $75 + $40 = $115.00 with inputs carrying only `valuationCents`, so the
 *     trade row fires on any valuation.
 *
 * Verified: 2026-09-26 (reconstruction from the seed's own index, research
 * doc and tests after an accidental overwrite; amounts re-derived from
 * research/south-carolina/charleston.md).
 */

export const CHAS_FEE_EFFECTIVE_FROM = "2019-10-01";

export const CHAS_BUILDING_SOURCE_KEY = "charleston-schedule-of-fees";

function rule(
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
    effectiveFrom: CHAS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: CHAS_BUILDING_SOURCE_KEY,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building — Residential Valuation Permit Fee Table (four charged bands)     */
/* -------------------------------------------------------------------------- */

export const CHAS_BUILDING_RULES: FeeRuleRecord[] = [
  // $1,001–$50,000: $35.00 for the first $1,000, plus $5.50 per additional
  // $1,000 or fraction thereof. The $35.00 base covers the first $1,000.
  rule({
    id: "chas-bld-band-50k",
    code: "BLD-BAND-50K",
    label: "Valuation $1,001-$50,000 ($35.00 + $5.50 per additional $1,000 or fraction)",
    description:
      "Residential Valuation Permit Fee Table: $35.00 for the first $1,000 of construction valuation, plus $5.50 for each additional thousand or fraction thereof, through $50,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 3_500,
      thresholdCents: 100_000,
      centsPerThousand: 550,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 100_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
  }),

  // $50,001–$100,000: $290.00 for the first $50,000 (the seam value the
  // $5.50 rate produces at $50,000), plus $4.64 per additional $1,000 or
  // fraction. The test pins the seam: $50,010 → 1 rounded step → $29,464.
  rule({
    id: "chas-bld-band-100k",
    code: "BLD-BAND-100K",
    label: "Valuation $50,001-$100,000 ($290.00 + $4.64 per additional $1,000 or fraction)",
    description:
      "Residential Valuation Permit Fee Table: $290.00 for the first $50,000 of construction valuation — exactly what the previous band's arithmetic produces at $50,000, so the ladder chains without a jump — plus $4.64 for each additional thousand or fraction thereof, through $100,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 29_000,
      thresholdCents: 5_000_000,
      centsPerThousand: 464,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 5_000_000 },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
  }),

  // $100,001–$500,000: $522.00 for the first $100,000 (the seam value again),
  // plus $3.00 per additional $1,000 or fraction. The schedule's own example:
  // $209,070 → $522.00 + 110 steps × $3.00 = $852.00.
  rule({
    id: "chas-bld-band-500k",
    code: "BLD-BAND-500K",
    label: "Valuation $100,001-$500,000 ($522.00 + $3.00 per additional $1,000 or fraction)",
    description:
      "Residential Valuation Permit Fee Table: $522.00 for the first $100,000 of construction valuation — the previous band's seam value — plus $3.00 for each additional thousand or fraction thereof, through $500,000. The schedule's own example lands here: $209,070 prices $522.00 + 110 × $3.00 = $852.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 52_200,
      thresholdCents: 10_000_000,
      centsPerThousand: 300,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 10_000_000 },
        { field: "valuation", op: "lte", value: 50_000_000 },
      ],
    },
  }),

  // $500,001 and up: $1,600.00 for the first $500,000 (the seam value),
  // plus $2.00 per additional $1,000 or fraction, unbounded above.
  rule({
    id: "chas-bld-band-open",
    code: "BLD-BAND-OPEN",
    label: "Valuation $500,001 and up ($1,600.00 + $2.00 per additional $1,000 or fraction)",
    description:
      "Residential Valuation Permit Fee Table: $1,600.00 for the first $500,000 of construction valuation — the previous band's seam value — plus $2.00 for each additional thousand or fraction thereof, with no upper bound.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 160_000,
      thresholdCents: 50_000_000,
      centsPerThousand: 200,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 50_000_000 }],
    },
  }),

  // Plan review: "equal to one half (50%) of the building permit fee" when
  // the proposed construction exceeds $1,000 and plans are required. Priced
  // against the accumulated base components (the ladder), so it runs after
  // them by the engine's base-first evaluation order.
  rule({
    id: "chas-bld-plan-review",
    code: "BLD-PLAN-REVIEW-50",
    label: "Plan review (50% of the building permit fee)",
    description:
      "Plan Review Fee: when the proposed construction exceeds $1,000 in valuation and plans are required, the plan review fee equals one half (50%) of the building permit fee, covering the initial review and a follow-up review verifying corrections.",
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 5_000 },
    priority: 200,
    conditions: {
      all: [{ field: "valuation", op: "gte", value: 100_000 }],
    },
  }),

  // The application fee: "$40.00 non-refundable, required for all building
  // and trade permits, in addition to any applicable permit fees." Pinned by
  // the worked example ($852 + $426 + $40 = $1,318) and by the
  // $1,000-or-less row, which charges the application fee alone.
  rule({
    id: "chas-application-fee",
    code: "CHS-APPLICATION-FEE",
    label: "Permit application fee ($40.00, non-refundable)",
    description:
      "A non-refundable permit application fee of $40.00 is required for all building and trade permits, in addition to any applicable permit fees. Construction valued at $1,000 or less pays this fee alone (the schedule's lowest table row). Charged as an administrative component so the 50% plan review reads the permit fee alone.",
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 4_000 },
    priority: 300,
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical — trade permit                                                  */
/* -------------------------------------------------------------------------- */

export const CHAS_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // The trade row: the schedule prices trade permits from the same valuation
  // shape; the seed's electrical page pins the permit itself at $75.00 flat
  // (worked example: $75 + $40 application = $115.00 with a $5,500 valuation).
  rule({
    id: "chas-elec-trade",
    code: "CHS-ELEC-TRADE-75",
    label: "Electrical trade permit ($75.00)",
    description:
      "Building and Trade Permit Fee Schedule, trade row: the electrical trade permit prices at $75.00. Work already inside a master building permit's scope files under the master permit rather than as a separate trade permit.",
    feeType: "flat",
    config: { amountCents: 7_500 },
  }),

  // The application fee, shared with every trade permit.
  rule({
    id: "chas-elec-application-fee",
    code: "CHS-APPLICATION-FEE",
    label: "Permit application fee ($40.00, non-refundable)",
    description:
      "A non-refundable permit application fee of $40.00 is required for all building and trade permits, in addition to any applicable permit fees.",
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 4_000 },
    priority: 300,
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing — trade permit                                                    */
/* -------------------------------------------------------------------------- */

export const CHAS_PLUMBING_RULES: FeeRuleRecord[] = [
  // The trade row, as the plumbing page pins it: $75.00 flat plus the
  // $40.00 application fee.
  rule({
    id: "chas-plumb-trade",
    code: "CHS-PLUMB-TRADE-75",
    label: "Plumbing trade permit ($75.00)",
    description:
      "Building and Trade Permit Fee Schedule, trade row: the plumbing trade permit prices at $75.00. Work already inside a master building permit's scope files under the master permit rather than as a separate trade permit.",
    feeType: "flat",
    config: { amountCents: 7_500 },
  }),

  rule({
    id: "chas-plumb-application-fee",
    code: "CHS-APPLICATION-FEE",
    label: "Permit application fee ($40.00, non-refundable)",
    description:
      "A non-refundable permit application fee of $40.00 is required for all building and trade permits, in addition to any applicable permit fees.",
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 4_000 },
    priority: 300,
  }),
];
