import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Savannah, Georgia fee rules — REAL DATA.
 *
 * Source: City of Savannah Revenue Ordinance, Article P (Inspection Fees),
 *         Sections 1 (Building), 2 (Electrical), 4 (Plumbing), 19 (Technology
 *         fee). Official codification PDF (EncodePlus), 2022 Revenue
 *         Ordinance; Article P figures unchanged from the 2021-11-23 edition.
 *
 * - Building: $8.00 per $1,000 of Cost of Construction up to $5M, plus $4.00
 *   per $1,000 between $5M and $10M, plus $2.00 per $1,000 above $10M;
 *   $40.00 minimum. Cost of construction = floor area x $80/sq ft residential
 *   or $125/sq ft commercial. Plan review is a flat valuation-banded table.
 * - Electrical: $8.00 per $1,000 "and any fraction thereof", $40.00 minimum.
 * - Plumbing: $8.00 per $1,000 "and any fraction thereof", $40.00 minimum.
 * - Technology fee: $5.00 per permit on all-inclusive building permits and
 *   standalone trade permits.
 *
 * Verified: 2026-09-26.
 */

export const SAV_FEE_EFFECTIVE_FROM = "2022-01-01";

export const SAV_REVENUE_ORDINANCE_KEY = "savannah-revenue-ordinance";
export const SAV_CODE_KEY = "savannah-code-ordinances";

export const SAV_MINIMUM_CENTS = 4_000; // $40.00
export const SAV_TECH_FEE_CENTS = 500; // $5.00

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
    effectiveFrom: SAV_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const SAV_BUILDING_RULES: FeeRuleRecord[] = [
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-bld-marginal",
    code: "BLD-MARGINAL",
    label: "All-inclusive building permit fee ($8 / $4 / $2 per $1,000 marginal)",
    description:
      "Revenue Ordinance Art. P §1(A): $8.00 per $1,000 of Cost of Construction up to $5,000,000, plus $4.00 per $1,000 between $5,000,000 and $10,000,000, plus $2.00 per $1,000 in excess of $10,000,000. Cost of construction = floor area x $80/sq ft residential or $125/sq ft commercial.",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 500_000_000, rateBps: 80 },
        { upToCents: 1_000_000_000, rateBps: 40 },
        { upToCents: null, rateBps: 20 },
      ],
    },
    priority: 100,
  }),
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-bld-plan-review",
    code: "BLD-PLAN-REVIEW",
    label: "Plan review fee (valuation-banded flat table)",
    description:
      "Revenue Ordinance Art. P §1(B)(1): $40 at $0–6,000; $50 at $6,001–25,000; $100 at $25,001–50,000; $150 at $50,001–100,000; $200 at $100,001–500,000; $300 at $500,001–1,000,000; $500 at $1,000,001–5,000,000; $1,000 at $5,000,001–10,000,000; $2,000 over $10,000,000.",
    feeType: "tiered_table",
    componentType: "plan_review",
    priority: 200,
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 600_000, amountCents: 4_000 },
        { upToCents: 2_500_000, amountCents: 5_000 },
        { upToCents: 5_000_000, amountCents: 10_000 },
        { upToCents: 10_000_000, amountCents: 15_000 },
        { upToCents: 50_000_000, amountCents: 20_000 },
        { upToCents: 100_000_000, amountCents: 30_000 },
        { upToCents: 500_000_000, amountCents: 50_000 },
        { upToCents: 1_000_000_000, amountCents: 100_000 },
        { upToCents: null, amountCents: 200_000 },
      ],
    },
  }),
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-bld-minimum-floor",
    code: "BLD-MINIMUM-FLOOR",
    label: "Minimum all-inclusive building permit fee ($40.00)",
    description: "Revenue Ordinance Art. P §1(A): 'The minimum all-inclusive fee shall be $40.00.'",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: SAV_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: SAV_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-bld-tech-fee",
    code: "SAV-TECH-FEE",
    label: "Technology fee ($5.00 per permit)",
    description:
      "Revenue Ordinance Art. P §19: a $5.00 technology fee is added to all All-Inclusive Building permits, Standalone Trade permits, and similar permits issued by Development Services.",
    feeType: "flat",
    componentType: "technology",
    config: {
      amountCents: SAV_TECH_FEE_CENTS,
    },
    priority: 300,
  }),
];

export const SAV_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-elec-valuation",
    code: "ELEC-VALUATION",
    label: "Electrical permit fee ($8.00 per $1,000, any fraction thereof)",
    description:
      "Revenue Ordinance Art. P §2: for work not covered by a building permit, $8.00 per $1,000, and any fraction thereof, of total work cost. Standalone trade permits only — no electrical fee is charged for work inside a building permit's scope.",
    // "and any fraction thereof" rounds the work cost up to the whole $1,000.
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 800,
    },
    priority: 100,
  }),
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-elec-minimum-floor",
    code: "ELEC-MINIMUM-FLOOR",
    label: "Minimum electrical permit fee ($40.00)",
    description: "Revenue Ordinance Art. P §2: 'The minimum fee shall be $40.00.'",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: SAV_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: SAV_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-elec-tech-fee",
    code: "SAV-ELEC-TECH-FEE",
    label: "Technology fee ($5.00 per permit)",
    description:
      "Revenue Ordinance Art. P §19: a $5.00 technology fee is added to all standalone trade permits.",
    feeType: "flat",
    componentType: "technology",
    config: {
      amountCents: SAV_TECH_FEE_CENTS,
    },
    priority: 300,
  }),
];

export const SAV_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-plumb-valuation",
    code: "PLUMB-VALUATION",
    label: "Plumbing permit fee ($8.00 per $1,000, any fraction thereof)",
    description:
      "Revenue Ordinance Art. P §4: for work not covered by a building permit, $8.00 per $1,000, and any fraction thereof, of total work cost. Standalone trade permits only — no plumbing fee is charged for work inside a building permit's scope.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 800,
    },
    priority: 100,
  }),
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-plumb-minimum-floor",
    code: "PLUMB-MINIMUM-FLOOR",
    label: "Minimum plumbing permit fee ($40.00)",
    description: "Revenue Ordinance Art. P §4: 'The minimum fee is $40.00.'",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: SAV_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: SAV_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
  rule(SAV_REVENUE_ORDINANCE_KEY, {
    id: "sav-plumb-tech-fee",
    code: "SAV-PLUMB-TECH-FEE",
    label: "Technology fee ($5.00 per permit)",
    description:
      "Revenue Ordinance Art. P §19: a $5.00 technology fee is added to all standalone trade permits.",
    feeType: "flat",
    componentType: "technology",
    config: {
      amountCents: SAV_TECH_FEE_CENTS,
    },
    priority: 300,
  }),
];
