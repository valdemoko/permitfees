import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Burlington, Vermont fee rules — REAL DATA.
 *
 * Source: Burlington Code of Ordinances (BCO) Chapter 8-28(a) Fees, quoted on
 * the City's Permit Applications and Forms page: "Fees are based on the
 * Estimated Cost of Construction (design/labor/material costs) at the rate of
 * $8.50 per $1,000.00 with a minimum permit fee of thirty ($30.00) dollars."
 * The City's Permit Fees page confirms the arithmetic with its COA Level II
 * example: a $50,000 deck carries a $440 Construction Permit Fee — "$8.50 per
 * $1,000 of construction cost plus $15 recording fee" ($425 + $15).
 *
 * The City publishes no stand-alone trade fee schedule online; the Building &
 * Trades Division issues separate electrical, plumbing and mechanical permits
 * and prices them at application.
 *
 * Verified: 2026-09-26.
 */

export const BTV_FEE_EFFECTIVE_FROM = "2020-07-01";

export const BTV_FEE_SCHEDULE_KEY = "btv-building-permit-fees";

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
    effectiveFrom: BTV_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: BTV_FEE_SCHEDULE_KEY,
    ...overrides,
  };
}

export const BTV_BUILDING_RULES: FeeRuleRecord[] = [
  rule({
    id: "btv-bld-rate",
    code: "BTV-BLD-RATE",
    label: "Building permit fee ($8.50 per $1,000 of estimated cost, $30 minimum)",
    description:
      "BCO Chapter 8-28(a): fees based on the Estimated Cost of Construction at $8.50 per $1,000.00, with a minimum permit fee of $30.00. The City's own example prices a $50,000 deck at $8.50 x 50 = $425.00 before the recording fee.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      centsPerThousand: 850,
      incrementCents: 100_000,
    },
    minimumCents: 30_00,
    priority: 100,
  }),
  rule({
    id: "btv-bld-recording",
    code: "BTV-BLD-RECORDING",
    label: "Recording fee ($15.00)",
    description:
      "The City's Permit Fees page prices the Construction Permit Fee 'plus $15 recording fee' — a $50,000 deck totals $440.00 ($425.00 at the per-$1,000 rate plus the $15.00 recording fee).",
    componentType: "surcharge",
    feeType: "flat",
    config: { amountCents: 1_500 },
    priority: 300,
  }),
];
