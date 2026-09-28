import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Honolulu, Hawaii fee rules — REAL DATA.
 *
 * Source: Revised Ordinances of Honolulu, Chapter 18, Table No. 18-A and
 * §§ 18-6.1/18-6.2 (American Legal Publishing code host; read through a real
 * browser session). The table prices the fee from the TOTAL estimated
 * valuation of work: each band's rate reads the whole valuation, with the
 * printed dollar amount as the band's floor. Reading the rates as marginal
 * (on the excess) is arithmetically impossible — the fee would drop $336 at
 * the $50,000 seam — while the total reading is monotonic at every seam.
 *
 * § 18-6.2(b) includes electrical, plumbing, heating and air-conditioning
 * work in the single consolidated building permit's valuation; Chapter 18
 * publishes no separate trade fee tables, so the trades ride the building
 * permit.
 *
 * § 18-6.1: plan review is 20% of the tentative permit fee, capped at
 * $25,000, required when plans are submitted (§ 18-4.2).
 *
 * Verified: 2026-09-26.
 */

export const HNL_FEE_EFFECTIVE_FROM = "2020-07-02";

export const HNL_ROH_KEY = "honolulu-roh-table-18a";

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
    effectiveFrom: HNL_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: HNL_ROH_KEY,
    ...overrides,
  };
}

export const HNL_BUILDING_RULES: FeeRuleRecord[] = [
  // Band 1: $0.01-$500 — flat $20.
  rule({
    id: "hnl-bld-band-500",
    code: "HNL-BLD-B1",
    label: "Building permit, valuation to $500 ($20.00)",
    description:
      "Table No. 18-A, band 1: 'From $0.01 to $500 — $20.' A flat fee for the smallest jobs.",
    feeType: "flat",
    config: { amountCents: 2_000 },
    conditions: {
      all: [{ field: "valuation", op: "lte", value: 50_000 }],
    },
    priority: 100,
  }),

  // Band 2: $500.01-$1,000 — $8 + $2.50 per $100 or fraction of the TOTAL.
  // centsPerThousand 25_000 = $25.00 per $1,000 = $2.50 per $100; the
  // incrementCents 10_000 buys a whole $100 block for any fraction.
  rule({
    id: "hnl-bld-band-1k",
    code: "HNL-BLD-B2",
    label: "Building permit, $500.01-$1,000 ($8 + $2.50 per $100)",
    description:
      "Table No. 18-A, band 2: '$8 + $2.50 per $100 or fraction thereof of the total estimated valuation of work.' The rate reads the whole valuation, not the excess — the total reading is the only monotone one.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 800,
      thresholdCents: 0,
      centsPerThousand: 2_500,
      incrementCents: 10_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000 },
        { field: "valuation", op: "lte", value: 100_000 },
      ],
    },
    priority: 100,
  }),

  // Band 3: $1,000.01-$20,000 — $12 + $2.20 per $100 of the TOTAL.
  rule({
    id: "hnl-bld-band-20k",
    code: "HNL-BLD-B3",
    label: "Building permit, $1,000.01-$20,000 ($12 + $2.20 per $100)",
    description:
      "Table No. 18-A, band 3: '$12 + $2.20 per $100 or fraction thereof of the total estimated valuation of work.' $10,000 of work prices $232.00; $20,000 prices $452.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 1_200,
      thresholdCents: 0,
      centsPerThousand: 2_200,
      incrementCents: 10_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 100_000 },
        { field: "valuation", op: "lte", value: 2_000_000 },
      ],
    },
    priority: 100,
  }),

  // Band 4: $20,000.01-$50,000 — $82 + $18 per $1,000 of the TOTAL.
  rule({
    id: "hnl-bld-band-50k",
    code: "HNL-BLD-B4",
    label: "Building permit, $20,000.01-$50,000 ($82 + $18 per $1,000)",
    description:
      "Table No. 18-A, band 4: '$82 + $18 per $1,000 or fraction thereof of the total estimated valuation of work.' $50,000 of work prices $982.00 — which is why the rate must read the total valuation: a marginal reading would drop the fee to $286 at the next seam.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 8_200,
      thresholdCents: 0,
      centsPerThousand: 1_800,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 2_000_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
    priority: 100,
  }),

  // Band 5: $50,000.01-$100,000 — $286 + $14 per $1,000 of the TOTAL.
  rule({
    id: "hnl-bld-band-100k",
    code: "HNL-BLD-B5",
    label: "Building permit, $50,000.01-$100,000 ($286 + $14 per $1,000)",
    description:
      "Table No. 18-A, band 5: '$286 + $14 per $1,000 or fraction thereof of the total estimated valuation of work.' $100,000 of work prices $1,686.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 28_600,
      thresholdCents: 0,
      centsPerThousand: 1_400,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 5_000_000 },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
    priority: 100,
  }),

  // Band 6: $100,000.01-$500,000 — $700 + $10 per $1,000 of the TOTAL.
  rule({
    id: "hnl-bld-band-500k",
    code: "HNL-BLD-B6",
    label: "Building permit, $100,000.01-$500,000 ($700 + $10 per $1,000)",
    description:
      "Table No. 18-A, band 6: '$700 + $10 per $1,000 or fraction thereof of the total estimated valuation of work.' $500,000 of work prices $5,700.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 70_000,
      thresholdCents: 0,
      centsPerThousand: 1_000,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 10_000_000 },
        { field: "valuation", op: "lte", value: 50_000_000 },
      ],
    },
    priority: 100,
  }),

  // Band 7: $500,000.01-$2,000,000 — $3,200 + $5 per $1,000 of the TOTAL.
  rule({
    id: "hnl-bld-band-2m",
    code: "HNL-BLD-B7",
    label: "Building permit, $500,000.01-$2,000,000 ($3,200 + $5 per $1,000)",
    description:
      "Table No. 18-A, band 7: '$3,200 + $5 per $1,000 or fraction thereof of the total estimated valuation of work.' $2,000,000 of work prices $13,200.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 320_000,
      thresholdCents: 0,
      centsPerThousand: 500,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000_000 },
        { field: "valuation", op: "lte", value: 200_000_000 },
      ],
    },
    priority: 100,
  }),

  // Band 8: above $2,000,000 — $4,300 + $4.50 per $1,000 of the TOTAL.
  rule({
    id: "hnl-bld-band-up",
    code: "HNL-BLD-B8",
    label: "Building permit, above $2,000,000 ($4,300 + $4.50 per $1,000)",
    description:
      "Table No. 18-A, band 8: '$4,300 + $4.50 per $1,000 or fraction thereof of the total estimated valuation of work.'",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 430_000,
      thresholdCents: 0,
      centsPerThousand: 450,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 200_000_000 }],
    },
    priority: 100,
  }),

  // § 18-6.1: plan review is 20% of the tentative permit fee, capped at
  // $25,000. The ordinance's own maximumCents.
  rule({
    id: "hnl-plan-review",
    code: "HNL-PLAN-REVIEW-20",
    label: "Plan review fee (20% of the permit fee, max $25,000)",
    description:
      "ROH § 18-6.1(a): 'The plan review fee is 20 percent of the tentative building permit fee as set forth in Table No. 18-A ... but not greater than $25,000.' Required when plans are submitted under § 18-4.2; not required for fences, retaining walls, pools, driveways and similar city-agency work.",
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 2_000 },
    maximumCents: 2_500_000,
    priority: 200,
  }),
];
