import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Providence, Rhode Island fee rules — REAL DATA.
 *
 * Source: 510-RICR-00-00-21 "State Wide Permitting Fee" (R.I. Gen. Laws
 * § 23-27.3-119), §21.12(A)(28) City of Providence schedule; ACTIVE RULE,
 * amendment effective 2023-12-10. Rhode Island computes municipal building
 * permit fees statewide: §21.6 requires municipalities to assess fees "in
 * accordance with the fee schedules listed in § 21.12".
 *
 * Providence: $23.00 per $1,000 to $10,000; $230 + $21.00 per $1,000
 * exceeding $10k to $50,000; $1,070 + $19.00 per $1,000 exceeding $50k above;
 * $125 minimum fee. Band bases chain exactly.
 *
 * Verified: 2026-09-26.
 */

export const PVD_FEE_EFFECTIVE_FROM = "2023-12-10";

export const PVD_STATEWIDE_REG_KEY = "ri-statewide-permitting-fee";

const MINIMUM_CENTS = 12_500;

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
    effectiveFrom: PVD_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: PVD_STATEWIDE_REG_KEY,
    ...overrides,
  };
}

function ladder(prefix: string, discipline: string): FeeRuleRecord[] {
  return [
    rule({
      id: `pvd-${prefix}-leg1`,
      code: `PVD-${discipline}-LEG1`,
      label: `${discipline} permit, valuation to $10,000 ($23.00 per $1,000)`,
      description:
        "510-RICR-00-00-21 §21.12(A)(28), City of Providence schedule: $23.00 per $1,000 of project valuation to $10,000. Each partial thousand rounds up.",
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 0,
        thresholdCents: 0,
        centsPerThousand: 2_300,
        incrementCents: 100_000,
      },
      conditions: {
        all: [{ field: "valuation", op: "lte", value: 1_000_000 }],
      },
      priority: 100,
    }),
    rule({
      id: `pvd-${prefix}-leg2`,
      code: `PVD-${discipline}-LEG2`,
      label: `${discipline} permit, $10,001-$50,000 ($230 + $21.00 per $1,000)`,
      description:
        "City of Providence schedule, middle band: $230 for the first $10,000 plus $21.00 per $1,000 exceeding $10,000, to $50,000. The printed base chains leg 1 exactly ($23.00 x 10 = $230).",
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 23_000,
        thresholdCents: 1_000_000,
        centsPerThousand: 2_100,
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
      id: `pvd-${prefix}-leg3`,
      code: `PVD-${discipline}-LEG3`,
      label: `${discipline} permit, above $50,000 ($1,070 + $19.00 per $1,000)`,
      description:
        "City of Providence schedule, top band: $1,070 for the first $50,000 plus $19.00 per $1,000 exceeding $50,000, no upper limit. The printed base chains leg 2 exactly ($230 + $21.00 x 40 = $1,070).",
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 107_000,
        thresholdCents: 5_000_000,
        centsPerThousand: 1_900,
        incrementCents: 100_000,
      },
      conditions: {
        all: [{ field: "valuation", op: "gt", value: 5_000_000 }],
      },
      priority: 100,
    }),
    rule({
      id: `pvd-${prefix}-minimum`,
      code: `PVD-${discipline}-MIN`,
      label: `${discipline} permit minimum fee ($125.00)`,
      description:
        "City of Providence schedule note: $125 minimum fee. Charged when the valuation ladder computes below the floor.",
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

export const PVD_BUILDING_RULES: FeeRuleRecord[] = ladder("bld", "BLD");

export const PVD_ELECTRICAL_RULES: FeeRuleRecord[] = ladder("elec", "ELEC");

export const PVD_PLUMBING_RULES: FeeRuleRecord[] = ladder("plumb", "PLUMB");
