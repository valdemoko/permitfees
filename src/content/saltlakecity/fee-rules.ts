import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Salt Lake City, Utah fee rules — REAL DATA.
 *
 * Source: Salt Lake City Consolidated Fee Schedule, amended 06/16/2026 by
 * Ord. 2026-29 (official viewer: tools.slc.gov/feeschedule). Building permit
 * fees per SLC Code 18.32.035, quoted as "total project valuation" bands with
 * "or fraction thereof" rounding; plan review at 18.32.035 (65% of the
 * building permit fee); electrical base fee at 18.36.100; plumbing base fee
 * at 18.56.040.
 *
 * The eight building bands chain exactly:
 *   $55.97 + 15 x $4.00  = $115.97
 *   $115.97 + 23 x $20.00 = $575.97
 *   $575.97 + 25 x $14.00 = $925.97
 *   $925.97 + 50 x $10.00 = $1,425.97
 *   $1,425.97 + 400 x $8.00 = $4,625.97
 *   $4,625.97 + 500 x $7.00 = $8,125.97
 *
 * Verified: 2026-09-26.
 */

export const SLC_FEE_EFFECTIVE_FROM = "2026-06-16";

export const SLC_FEE_SCHEDULE_KEY = "slc-consolidated-fee-schedule";

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
    effectiveFrom: SLC_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SLC_FEE_SCHEDULE_KEY,
    ...overrides,
  };
}

export const SLC_BUILDING_RULES: FeeRuleRecord[] = [
  rule({
    id: "slc-bld-500",
    code: "SLC-BLD-500",
    label: "Building permit, valuation to $500 ($55.97 flat)",
    description:
      "Consolidated Fee Schedule 18.32.035, first row: total project valuation $0.01-$500.00 carries a flat $55.97.",
    feeType: "flat",
    config: { amountCents: 5_597 },
    conditions: {
      all: [{ field: "valuation", op: "lte", value: 50_000 }],
    },
    priority: 100,
  }),
  rule({
    id: "slc-bld-2k",
    code: "SLC-BLD-2K",
    label: "Building permit, $500.01-$2,000 ($55.97 + $4.00 per $100)",
    description:
      "18.32.035 second row: $55.97 for the first $500 plus $4.00 for each additional $100 or fraction thereof, to and including $2,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_597,
      thresholdCents: 50_000,
      centsPerThousand: 4_000,
      incrementCents: 10_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000 },
        { field: "valuation", op: "lte", value: 200_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "slc-bld-25k",
    code: "SLC-BLD-25K",
    label: "Building permit, $2,000.01-$25,000 ($115.97 + $20.00 per $1,000)",
    description:
      "18.32.035 third row: $115.97 for the first $2,000 plus $20.00 for each additional $1,000 or fraction thereof, to and including $25,000. The printed base chains the second row exactly ($55.97 + 15 x $4.00 = $115.97).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 11_597,
      thresholdCents: 200_000,
      centsPerThousand: 2_000,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 200_000 },
        { field: "valuation", op: "lte", value: 2_500_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "slc-bld-50k",
    code: "SLC-BLD-50K",
    label: "Building permit, $25,000.01-$50,000 ($575.97 + $14.00 per $1,000)",
    description:
      "18.32.035 fourth row: $575.97 for the first $25,000 plus $14.00 for each additional $1,000 or fraction thereof, to and including $50,000. Chains the third row exactly ($115.97 + 23 x $20.00 = $575.97).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 57_597,
      thresholdCents: 2_500_000,
      centsPerThousand: 1_400,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 2_500_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "slc-bld-100k",
    code: "SLC-BLD-100K",
    label: "Building permit, $50,000.01-$100,000 ($925.97 + $10.00 per $1,000)",
    description:
      "18.32.035 fifth row: $925.97 for the first $50,000 plus $10.00 for each additional $1,000 or fraction thereof, to and including $100,000. Chains the fourth row exactly ($575.97 + 25 x $14.00 = $925.97).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 92_597,
      thresholdCents: 5_000_000,
      centsPerThousand: 1_000,
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
  rule({
    id: "slc-bld-500k",
    code: "SLC-BLD-500K",
    label: "Building permit, $100,000.01-$500,000 ($1,425.97 + $8.00 per $1,000)",
    description:
      "18.32.035 sixth row: $1,425.97 for the first $100,000 plus $8.00 for each additional $1,000 or fraction thereof, to and including $500,000. Chains the fifth row exactly ($925.97 + 50 x $10.00 = $1,425.97).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 142_597,
      thresholdCents: 10_000_000,
      centsPerThousand: 800,
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
  rule({
    id: "slc-bld-1m",
    code: "SLC-BLD-1M",
    label: "Building permit, $500,000.01-$1,000,000 ($4,625.97 + $7.00 per $1,000)",
    description:
      "18.32.035 seventh row: $4,625.97 for the first $500,000 plus $7.00 for each additional $1,000 or fraction thereof, to and including $1,000,000. Chains the sixth row exactly ($1,425.97 + 400 x $8.00 = $4,625.97).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 462_597,
      thresholdCents: 50_000_000,
      centsPerThousand: 700,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
    priority: 100,
  }),
  rule({
    id: "slc-bld-up",
    code: "SLC-BLD-UP",
    label: "Building permit, above $1,000,000 ($8,125.97 + $5.00 per $1,000)",
    description:
      "18.32.035 eighth row: $8,125.97 for the first $1,000,000 plus $5.00 for each additional $1,000 or fraction thereof, above. Chains the seventh row exactly ($4,625.97 + 500 x $7.00 = $8,125.97).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 812_597,
      thresholdCents: 100_000_000,
      centsPerThousand: 500,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 100_000_000 }],
    },
    priority: 100,
  }),

  // 18.32.035: "Plan review fee — 65% of building permit fee." Hourly plan
  // review is $146 for deferred items and non-building permits; expedited
  // review is twice the standard fee (18.20.050).
  rule({
    id: "slc-plan-review",
    code: "SLC-PLAN-REVIEW-65",
    label: "Plan review fee (65% of the building permit fee)",
    description:
      "Consolidated Fee Schedule 18.32.035: plan review fee is 65% of the building permit fee. Hourly plan review ($146) applies to deferred items, post-issuance changes and non-building permits; expedited review is twice the standard fee (18.20.050).",
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 6_500 },
    priority: 200,
  }),
];

export const SLC_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule({
    id: "slc-elec-base",
    code: "SLC-ELEC-BASE",
    label: "Electrical permit base fee ($59.00)",
    description:
      "Consolidated Fee Schedule 18.36.100: base fee $59 for electrical permits, commercial and residential alike. The commercial minimum for work up to $1,600 is $40 (18.36.120); minor remodel, additional circuits and service changes are $40 rows; the homeowner electrical remodel permit is $48.",
    feeType: "flat",
    config: { amountCents: 5_900 },
    priority: 100,
  }),
];

export const SLC_PLUMBING_RULES: FeeRuleRecord[] = [
  rule({
    id: "slc-plumb-base",
    code: "SLC-PLUMB-BASE",
    label: "Plumbing permit base fee ($59.00)",
    description:
      "Consolidated Fee Schedule 18.56.040 (Plumbing Permits): base fee $59. Individual fixture and appliance rows price on top of the base under 18.56.040's itemized list.",
    feeType: "flat",
    config: { amountCents: 5_900 },
    priority: 100,
  }),
];
