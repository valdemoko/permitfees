import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Hilo (County of Hawai'i) fee rules — REAL DATA.
 *
 * Source: Hawai'i County Code, Chapter 5, § 5-7-3 "Permit" building permit
 * fee schedule, read verbatim from two agreeing transcriptions — the County's
 * own residential-PV guideline (records.hawaiicounty.gov edoc 76875) and the
 * Grassroot Institute's October 2024 report (Table 6, sourced to the code).
 * Every band base chains exactly ($10 + 15 x $1.50 = $32.50; $32.50 + 23 x
 * $7.50 = $205.00; $205 + 25 x $6.00 = $355.00), confirming the marginal
 * "plus ... for each additional" reading with "or fraction thereof" in every
 * band.
 *
 * Plan review: 20% of the permit fee with a minimum, per the County's own
 * fee documents (council committee record COM 0734.001).
 *
 * Verified: 2026-09-26.
 */

export const HILO_FEE_EFFECTIVE_FROM = "2024-10-01";

export const HILO_HCC_KEY = "hawaii-county-hcc-5-7-3";

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
    effectiveFrom: HILO_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: HILO_HCC_KEY,
    ...overrides,
  };
}

export const HILO_BUILDING_RULES: FeeRuleRecord[] = [
  // Band 1: $1-$500 — flat $10.
  rule({
    id: "hilo-bld-band-500",
    code: "HILO-BLD-B1",
    label: "Building permit, valuation to $500 ($10.00)",
    description:
      "HCC § 5-7-3, band 1: '$1 to $500 — $10.' The ladder's floor.",
    feeType: "flat",
    config: { amountCents: 1_000 },
    conditions: {
      all: [{ field: "valuation", op: "lte", value: 50_000 }],
    },
    priority: 100,
  }),

  // Band 2: $501-$2,000 — $10 for the first $500 plus $1.50 per additional
  // $100 or fraction.
  rule({
    id: "hilo-bld-band-2k",
    code: "HILO-BLD-B2",
    label: "Building permit, $501-$2,000 ($10 + $1.50 per $100)",
    description:
      "HCC § 5-7-3, band 2: '$10 for the first $500 plus $1.50 for each additional $100 or fraction thereof, to and including $2,000.' Marginal reading confirmed by the chained base: $10 + 15 x $1.50 = $32.50 at $2,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 1_000,
      thresholdCents: 50_000,
      centsPerThousand: 1_500,
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

  // Band 3: $2,001-$25,000 — $32.50 for the first $2,000 plus $7.50 per
  // additional $1,000 or fraction.
  rule({
    id: "hilo-bld-band-25k",
    code: "HILO-BLD-B3",
    label: "Building permit, $2,001-$25,000 ($32.50 + $7.50 per $1,000)",
    description:
      "HCC § 5-7-3, band 3: '$32.50 for the first $2,000 plus $7.50 for each additional $1,000 or fraction thereof, to and including $25,000.' The chained base closes exactly: $32.50 + 23 x $7.50 = $205.00 at $25,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 3_250,
      thresholdCents: 200_000,
      centsPerThousand: 750,
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

  // Band 4: $25,001-$50,000 — $205 for the first $25,000 plus $6 per
  // additional $1,000 or fraction.
  rule({
    id: "hilo-bld-band-50k",
    code: "HILO-BLD-B4",
    label: "Building permit, $25,001-$50,000 ($205 + $6 per $1,000)",
    description:
      "HCC § 5-7-3, band 4: '$205 for the first $25,000 plus $6 for each additional $1,000 or fraction thereof, to and including $50,000.' The chained base closes exactly: $205 + 25 x $6.00 = $355.00 at $50,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 20_500,
      thresholdCents: 2_500_000,
      centsPerThousand: 600,
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

  // Band 5: above $50,000 — $355 for the first $50,000 plus $3 per
  // additional $1,000 or fraction.
  rule({
    id: "hilo-bld-band-up",
    code: "HILO-BLD-B5",
    label: "Building permit, above $50,000 ($355 + $3 per $1,000)",
    description:
      "HCC § 5-7-3, band 5: '$355 for the first $50,000 plus $3 for each additional $1,000 or fraction thereof.'",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 35_500,
      thresholdCents: 5_000_000,
      centsPerThousand: 300,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 5_000_000 }],
    },
    priority: 100,
  }),

  // County fee documents print plan review at 20% of the permit fee with a
  // minimum (committee record COM 0734.001).
  rule({
    id: "hilo-plan-review",
    code: "HILO-PLAN-REVIEW-20",
    label: "Plan review fee (20% of the permit fee)",
    description:
      "County fee documents (council committee record COM 0734.001, 2024-2026): 'Building Permits: Plan Review Fees 20% of Permit Fee with a min.'",
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 2_000 },
    priority: 200,
  }),
];
