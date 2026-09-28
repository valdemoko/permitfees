import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Cheyenne, Wyoming fee rules — REAL DATA.
 *
 * Source (research/wyoming/cheyenne.md):
 *   - City of Cheyenne Schedule of Fees, Building and Construction Permit
 *     Fees section (Ordinance 4254), City Treasurer's Office. The city web
 *     server 403s non-browser agents; the Ordinance 4254 valuation table was
 *     taken band-by-band with its per-band arithmetic from corroborating
 *     readers of the live PDF and checked for seam continuity (every band
 *     base equals the prior band's product at its seam).
 *
 * Shape: ONE valuation ladder serves building AND trade permits — Cheyenne
 * runs a home-rule electrical/plumbing/mechanical program (Municode Ch. 15.20
 * NEC 2023) and prices trade scope on the same table. Plan review is 65% of
 * the building permit fee when submittal documents are required.
 *
 * Verified: 2026-09-26.
 */

export const CHE_FEE_EFFECTIVE_FROM = "2017-01-01"; // Ordinance 4254 adoption

export const CHE_BUILDING_SOURCE_KEY = "cheyenne-schedule-of-fees";
export const CHE_ELECTRICAL_SOURCE_KEY = "cheyenne-schedule-of-fees";
export const CHE_PLUMBING_SOURCE_KEY = "cheyenne-schedule-of-fees";

function rule(
  sourceId: string,
  prefix: string,
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
    effectiveFrom: CHE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
    code: `${prefix}-${overrides.code}`,
  };
}

/**
 * The eight-band Ordinance 4254 ladder, re-declared per permit type with the
 * trade prefix (the schedule applies one table to building, electrical,
 * plumbing and mechanical scope).
 */
function cheyenneLadder(
  sourceId: string,
  prefix: string,
): FeeRuleRecord[] {
  const band = (
    id: string,
    code: string,
    label: string,
    description: string,
    baseCents: number,
    thresholdCents: number,
    centsPerThousand: number,
    incrementCents: number,
    op: "lte" | "gt",
    boundCents: number,
  ): FeeRuleRecord =>
    rule(sourceId, prefix, {
      id,
      code,
      label,
      description,
      feeType: "per_thousand",
      config: { basis: "valuation", baseCents, thresholdCents, centsPerThousand, incrementCents },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: thresholdCents },
          { field: "valuation", op, value: boundCents },
        ],
      },
    });

  return [
    band(
      "chey-ladder-500",
      "BAND-500",
      "Valuation $1-$500 ($23.50)",
      "Ordinance 4254: $1 to $500 valuation — $23.50.",
      0,
      0,
      0,
      0,
      "lte",
      50_000,
    ),
    band(
      "chey-ladder-2k",
      "BAND-2K",
      "Valuation $501-$2,000 ($23.50 first $500 + $3.05 per additional $100 or fraction)",
      "Ordinance 4254: $501 to $2,000 — $23.50 for the first $500 plus $3.05 for each additional $100 or fraction thereof, to and including $2,000.",
      2_350,
      50_000,
      305,
      10_000,
      "lte",
      200_000,
    ),
    band(
      "chey-ladder-25k",
      "BAND-25K",
      "Valuation $2,001-$25,000 ($69.25 first $2,000 + $14.00 per additional $1,000 or fraction)",
      "Ordinance 4254: $2,001 to $25,000 — $69.25 for the first $2,000 plus $14.00 for each additional $1,000 or fraction thereof.",
      6_925,
      200_000,
      1_400,
      100_000,
      "lte",
      2_500_000,
    ),
    band(
      "chey-ladder-50k",
      "BAND-50K",
      "Valuation $25,001-$50,000 ($391.75 first $25,000 + $10.10 per additional $1,000 or fraction)",
      "Ordinance 4254: $25,001 to $50,000 — $391.75 for the first $25,000 plus $10.10 for each additional $1,000 or fraction thereof.",
      39_175,
      2_500_000,
      1_010,
      100_000,
      "lte",
      5_000_000,
    ),
    band(
      "chey-ladder-100k",
      "BAND-100K",
      "Valuation $50,001-$100,000 ($643.75 first $50,000 + $7.00 per additional $1,000 or fraction)",
      "Ordinance 4254: $50,001 to $100,000 — $643.75 for the first $50,000 plus $7.00 for each additional $1,000 or fraction thereof.",
      64_375,
      5_000_000,
      700,
      100_000,
      "lte",
      10_000_000,
    ),
    band(
      "chey-ladder-500k",
      "BAND-500K",
      "Valuation $100,001-$500,000 ($993.75 first $100,000 + $5.60 per additional $1,000 or fraction)",
      "Ordinance 4254: $100,001 to $500,000 — $993.75 for the first $100,000 plus $5.60 for each additional $1,000 or fraction thereof.",
      99_375,
      10_000_000,
      560,
      100_000,
      "lte",
      50_000_000,
    ),
    band(
      "chey-ladder-1m",
      "BAND-1M",
      "Valuation $500,001-$1,000,000 ($3,233.75 first $500,000 + $4.75 per additional $1,000 or fraction)",
      "Ordinance 4254: $500,001 to $1,000,000 — $3,233.75 for the first $500,000 plus $4.75 for each additional $1,000 or fraction thereof.",
      323_375,
      50_000_000,
      475,
      100_000,
      "lte",
      100_000_000,
    ),
    band(
      "chey-ladder-open",
      "BAND-1MUP",
      "Valuation $1,000,001 and up ($5,608.75 first $1,000,000 + $3.65 per additional $1,000 or fraction)",
      "Ordinance 4254: $1,000,001 and up — $5,608.75 for the first $1,000,000 plus $3.65 for each additional $1,000 or fraction thereof.",
      560_875,
      100_000_000,
      365,
      100_000,
      "gt",
      100_000_000,
    ),
  ];
}

export const CHE_BUILDING_RULES: FeeRuleRecord[] = [
  ...cheyenneLadder(CHE_BUILDING_SOURCE_KEY, "BLD"),

  // Plan review: 65% of the building permit fee when submittal documents
  // are required.
  rule(CHE_BUILDING_SOURCE_KEY, "BLD", {
    id: "chey-bld-plan-review",
    code: "PLAN-REVIEW-65",
    label: "Plan review fee (65% of the building permit fee)",
    description:
      "Ordinance 4254: the plan review fee, when submittal documents are required, is 65% of the building permit fee. Additional plan review for plan changes or revisions bills at $47.00 per hour with a half-hour minimum.",
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 6_500 },
    priority: 200,
    conditions: {
      all: [
        { field: "valuation", op: "exists" },
        { field: "custom.plan_review", op: "eq", value: true },
      ],
    },
  }),

  // The Planning and Development building-permit review fee (Res. 6213).
  rule(CHE_BUILDING_SOURCE_KEY, "BLD", {
    id: "chey-bld-planning-review",
    code: "PLANNING-REVIEW-50",
    label: "Planning and Development building permit review fee ($50.00)",
    description:
      "Schedule of Fees, Planning section (Resolution 6213): the Planning and Development building permit review fee of $50.00 applies to building permits per Planning/Development review.",
    componentType: "plan_review",
    feeType: "flat",
    config: { amountCents: 5_000 },
    priority: 210,
    conditions: {
      all: [{ field: "custom.plan_review", op: "eq", value: true }],
    },
  }),
];

export const CHE_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...cheyenneLadder(CHE_ELECTRICAL_SOURCE_KEY, "ELEC"),
];

export const CHE_PLUMBING_RULES: FeeRuleRecord[] = [
  ...cheyenneLadder(CHE_PLUMBING_SOURCE_KEY, "PLUMB"),
];
