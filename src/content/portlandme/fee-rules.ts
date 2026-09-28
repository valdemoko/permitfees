import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Portland, Maine fee rules — REAL DATA.
 *
 * Source: the City's own permit documents (Building or Use Permit form and
 * the sign-permit application, both on the City's parcels/permit archive),
 * which print the permit-fee formula: "$10 PER $1,000 + $30 FOR THE FIRST
 * $1,000" of cost of work — the same formula in clean type on the 2013 sign
 * form ("$30 for the first $1,000 of cost of work; $10 per $1,000" above).
 *
 * Verified: 2026-09-26.
 */

export const PME_FEE_EFFECTIVE_FROM = "2013-01-01";

export const PME_PERMIT_KEY = "portland-me-permit-formula";

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
    effectiveFrom: PME_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: PME_PERMIT_KEY,
    ...overrides,
  };
}

function costOfWorkLadder(
  id: string,
  code: string,
  discipline: string,
): FeeRuleRecord {
  return rule({
    id,
    code,
    label: `${discipline} permit ($30.00 for the first $1,000 + $10.00 per additional $1,000)`,
    description:
      "City of Portland, Maine permit documents: '$10 PER $1,000 + $30 FOR THE FIRST $1,000' of cost of work — the same formula in clean type on the City's sign-permit application ('$30 for the first $1,000 of cost of work; $10 per $1,000'). Partial thousands round up.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 3_000,
      thresholdCents: 100_000,
      centsPerThousand: 1_000,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 100_000 }],
    },
    priority: 100,
  });
}

function firstThousandRow(
  id: string,
  code: string,
  discipline: string,
): FeeRuleRecord {
  return rule({
    id,
    code,
    label: `${discipline} permit, cost of work to $1,000 ($30.00)`,
    description:
      "The formula's first-$1,000 amount: $30.00 for cost of work at or below $1,000.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [{ field: "valuation", op: "lte", value: 100_000 }],
    },
    priority: 100,
  });
}

export const PME_BUILDING_RULES: FeeRuleRecord[] = [
  firstThousandRow("pme-bld-first-1k", "PME-BLD-1K", "Building"),
  costOfWorkLadder("pme-bld-leg", "PME-BLD-VOW", "Building"),
];

export const PME_ELECTRICAL_RULES: FeeRuleRecord[] = [
  firstThousandRow("pme-elec-first-1k", "PME-ELEC-1K", "Electrical"),
  costOfWorkLadder("pme-elec-leg", "PME-ELEC-VOW", "Electrical"),
];

export const PME_PLUMBING_RULES: FeeRuleRecord[] = [
  firstThousandRow("pme-plumb-first-1k", "PME-PLUMB-1K", "Plumbing"),
  costOfWorkLadder("pme-plumb-leg", "PME-PLUMB-VOW", "Plumbing"),
];
