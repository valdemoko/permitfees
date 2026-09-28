import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Warwick, Rhode Island fee rules — REAL DATA.
 *
 * Source: 510-RICR-00-00-21 "State Wide Permitting Fee" (R.I. Gen. Laws
 * § 23-27.3-119), §21.12(A)(35) City of Warwick schedule; ACTIVE RULE,
 * amendment effective 2023-12-10.
 *
 * Warwick: $10.00 per $1,000 to $10,000; $100 + $8.00 per $1,000 exceeding
 * $10k to $50,000; $420 + $6.00 per $1,000 exceeding $50k above; $75 minimum
 * fee. Band bases chain exactly.
 *
 * Verified: 2026-09-26.
 */

export const WWK_FEE_EFFECTIVE_FROM = "2023-12-10";

export const WWK_STATEWIDE_REG_KEY = "ri-statewide-permitting-fee";

const MINIMUM_CENTS = 7_500;

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
    effectiveFrom: WWK_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: WWK_STATEWIDE_REG_KEY,
    ...overrides,
  };
}

function ladder(prefix: string, discipline: string): FeeRuleRecord[] {
  return [
    rule({
      id: `wwk-${prefix}-leg1`,
      code: `WWK-${discipline}-LEG1`,
      label: `${discipline} permit, valuation to $10,000 ($10.00 per $1,000)`,
      description:
        "510-RICR-00-00-21 §21.12(A)(35), City of Warwick schedule: $10.00 per $1,000 of project valuation to $10,000. Each partial thousand rounds up.",
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 0,
        thresholdCents: 0,
        centsPerThousand: 1_000,
        incrementCents: 100_000,
      },
      conditions: {
        all: [{ field: "valuation", op: "lte", value: 1_000_000 }],
      },
      priority: 100,
    }),
    rule({
      id: `wwk-${prefix}-leg2`,
      code: `WWK-${discipline}-LEG2`,
      label: `${discipline} permit, $10,001-$50,000 ($100 + $8.00 per $1,000)`,
      description:
        "City of Warwick schedule, middle band: $100 for the first $10,000 plus $8.00 per $1,000 exceeding $10,000, to $50,000. The printed base chains leg 1 exactly ($10.00 x 10 = $100).",
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 10_000,
        thresholdCents: 1_000_000,
        centsPerThousand: 800,
        incrementCents: 100_000,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 1_000_000 },
          { field: "valuation", op: "lte", value: 5_000_000 },
        ],
      },
      priority: 100,
    }),
    rule({
      id: `wwk-${prefix}-leg3`,
      code: `WWK-${discipline}-LEG3`,
      label: `${discipline} permit, above $50,000 ($420 + $6.00 per $1,000)`,
      description:
        "City of Warwick schedule, top band: $420 for the first $50,000 plus $6.00 per $1,000 exceeding $50,000, no upper limit. The printed base chains leg 2 exactly ($100 + $8.00 x 40 = $420).",
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 42_000,
        thresholdCents: 5_000_000,
        centsPerThousand: 600,
        incrementCents: 100_000,
      },
      conditions: {
        all: [{ field: "valuation", op: "gt", value: 5_000_000 }],
      },
      priority: 100,
    }),
    rule({
      id: `wwk-${prefix}-minimum`,
      code: `WWK-${discipline}-MIN`,
      label: `${discipline} permit minimum fee ($75.00)`,
      description:
        "City of Warwick schedule note: $75 minimum fee. Charged when the valuation ladder computes below the floor.",
      componentType: "surcharge",
      feeType: "permit_minimum",
      config: { basis: "permit_fee", floorCents: MINIMUM_CENTS },
      conditions: {
        all: [{ field: "permit_fee", op: "lt", value: MINIMUM_CENTS }],
      },
      priority: 500,
    }),
  ];
}

export const WWK_BUILDING_RULES: FeeRuleRecord[] = ladder("bld", "BLD");

export const WWK_ELECTRICAL_RULES: FeeRuleRecord[] = ladder("elec", "ELEC");

export const WWK_PLUMBING_RULES: FeeRuleRecord[] = ladder("plumb", "PLUMB");
