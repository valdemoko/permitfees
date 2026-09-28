import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Birmingham, Alabama fee rules — REAL DATA.
 *
 * Source: City of Birmingham Department of Planning, Engineering & Permits (PEP)
 *         and Code of Alabama 1975 Title 41 (Craft Training Fund).
 *
 * Verified: 2026-09-25.
 */

export const BHM_FEE_EFFECTIVE_FROM = "2026-01-01";

export const BHM_BUILDING_SOURCE_KEY = "birmingham-pep-fee-schedule";
export const BHM_CRAFT_TRAINING_SOURCE_KEY = "alabama-craft-training-fund";
export const BHM_TRADE_SOURCE_KEY = "birmingham-trade-permit-fees";

export const BHM_BUILDING_MINIMUM_CENTS = 12_500; // $125.00
export const BHM_TRADE_MINIMUM_CENTS = 10_000; // $100.00

function rule(
  sourceId: string,
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
    effectiveFrom: BHM_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const BHM_BUILDING_RULES: FeeRuleRecord[] = [
  rule(BHM_BUILDING_SOURCE_KEY, {
    id: "bhm-bld-base-valuation",
    code: "BLD-BASE-VALUATION",
    label: "Building permit base fee ($9.50 per $1,000 valuation)",
    description:
      'City of Birmingham Department of Planning, Engineering & Permits fee schedule: $9.50 per $1,000 of construction valuation.',
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 950,
    },
    priority: 100,
  }),
  rule(BHM_BUILDING_SOURCE_KEY, {
    id: "bhm-bld-plan-review",
    code: "BLD-PLAN-REVIEW-50",
    label: "Plan review fee (50% of permit fee)",
    description:
      "Plan examination fee assessed on projects requiring architectural or engineering review, charged as 50% of the building permit fee.",
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: {
      basis: "permit_fee",
      rateBps: 5_000,
    },
  }),
  rule(BHM_BUILDING_SOURCE_KEY, {
    id: "bhm-bld-minimum-floor",
    code: "BLD-MINIMUM-FLOOR",
    label: "Minimum building permit fee ($125.00)",
    description:
      "The minimum fee assessed on any building permit issued by the City of Birmingham.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: BHM_BUILDING_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: BHM_BUILDING_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
  rule(BHM_CRAFT_TRAINING_SOURCE_KEY, {
    id: "bhm-bld-craft-training",
    code: "AL-CRAFT-TRAINING",
    label: "Alabama Craft Training Fund ($1.00 per $1,000 valuation, nonresidential)",
    description:
      "Mandated under Alabama state law (Code of Alabama 1975) for nonresidential construction, remitted to the Alabama Department of Finance.",
    feeType: "per_thousand",
    componentType: "state_surcharge",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 100,
    },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "commercial" }],
    },
    priority: 300,
  }),
];

export const BHM_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(BHM_TRADE_SOURCE_KEY, {
    id: "bhm-elec-base-valuation",
    code: "ELEC-BASE-VALUATION",
    label: "Electrical permit fee ($10.00 per $1,000 valuation)",
    description:
      "City of Birmingham electrical permit fee calculated on the valuation of electrical installation work.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 1_000,
    },
    priority: 100,
  }),
  rule(BHM_TRADE_SOURCE_KEY, {
    id: "bhm-elec-minimum-floor",
    code: "ELEC-MINIMUM-FLOOR",
    label: "Minimum electrical permit fee ($100.00)",
    description: "City of Birmingham minimum fee for standalone electrical permits.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: BHM_TRADE_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: BHM_TRADE_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
];

export const BHM_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(BHM_TRADE_SOURCE_KEY, {
    id: "bhm-plumb-base-valuation",
    code: "PLUMB-BASE-VALUATION",
    label: "Plumbing permit fee ($10.00 per $1,000 valuation)",
    description:
      "City of Birmingham plumbing permit fee calculated on the valuation of plumbing fixtures, piping, and water service.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 1_000,
    },
    priority: 100,
  }),
  rule(BHM_TRADE_SOURCE_KEY, {
    id: "bhm-plumb-minimum-floor",
    code: "PLUMB-MINIMUM-FLOOR",
    label: "Minimum plumbing permit fee ($100.00)",
    description: "City of Birmingham minimum fee for standalone plumbing permits.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: BHM_TRADE_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: BHM_TRADE_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
];
