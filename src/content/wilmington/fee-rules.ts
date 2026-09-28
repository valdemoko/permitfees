import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Wilmington, Delaware fee rules — REAL DATA.
 *
 * Source: City of Wilmington Department of Licenses & Inspections,
 *         "Approved L & I Fee Increases" (Effective June 1, 2014), read from
 *         the City's own URL via its Internet Archive capture of 2026-06-09
 *         (the live host serves HTTP 403 to scripts).
 *
 * - Building: $12.00 per $1,000.00 of cost — one rate at every valuation.
 * - Electrical work: $20.00 flat.
 * - Plumbing: $20.00 flat.
 * - No minimum fee is published anywhere on the page; none is charged.
 *
 * Verified: 2026-09-26.
 */

export const WILMINGTON_FEE_EFFECTIVE_FROM = "2014-06-01";

export const WILMINGTON_LI_KEY = "wilmington-li-fee-increases";

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };

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
    effectiveFrom: WILMINGTON_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const WILMINGTON_BUILDING_RULES: FeeRuleRecord[] = [
  rule(WILMINGTON_LI_KEY, {
    id: "wilmington-bld-per-thousand",
    code: "BLD-PER-1000",
    label: "Permit fee ($12.00 per $1,000.00)",
    description:
      "Department of Licenses & Inspections fee table, 'Permit fees' row (NEW FEE column, effective June 1, 2014): $12.00 per $1,000.00. This is the only row on the schedule expressed as a rate rather than a flat amount, and it applies at every valuation — the table publishes no bands, no minimum and no maximum.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 1_200,
    },
    priority: 100,
  }),
];

export const WILMINGTON_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(WILMINGTON_LI_KEY, {
    id: "wilmington-elec-flat",
    code: "ELEC-FLAT",
    label: "Electrical work permit ($20.00)",
    description:
      "Department of Licenses & Inspections fee table, 'Electrical work' row (NEW FEE column, effective June 1, 2014): $20.00. The row is a flat amount, unlike the valuation-based 'Permit fees' row on the same table, so a panel change and a full commercial fit-out's electrical permit carry the same printed fee. Certificates associated with electrical work are separate rows on the same page (temporary CO residential $100.00, commercial $250.00) and are named rather than modelled.",
    feeType: "flat",
    config: { amountCents: 2_000 },
    priority: 100,
  }),
];

export const WILMINGTON_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(WILMINGTON_LI_KEY, {
    id: "wilmington-plumb-flat",
    code: "PLUMB-FLAT",
    label: "Plumbing permit ($20.00)",
    description:
      "Department of Licenses & Inspections fee table, 'Plumbing' row (NEW FEE column, effective June 1, 2014): $20.00. A flat permit fee, not a per-fixture rate — the schedule publishes no fixture count and no valuation band for plumbing. Heating, air conditioning, mechanical ventilation, fire suppression, alarm and refrigeration rows on the same table carry the identical $20.00, which is why the City's mechanical side reads as one flat trade permit.",
    feeType: "flat",
    config: { amountCents: 2_000 },
    priority: 100,
  }),
];

/** Referenced by tests to assert the residential condition constant is defined once. */
export const WILMINGTON_RESIDENTIAL_CONDITION = RESIDENTIAL;
