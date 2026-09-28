import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Atlanta, Georgia fee rules — REAL DATA.
 *
 * Source: City of Atlanta Department of City Planning, Office of Buildings
 *         fee tables ("Getting started with our Zoning, Development, and
 *         Permitting Services"), read from the City's archived official page
 *         (live host 403s to scripts; snapshot 2025-11-05), confirmed by
 *         ATL311 knowledge article KB0012509 (modified 2026-08-20).
 *
 * - Building permit: $7 per $1,000 of Cost of Construction, $150 minimum.
 * - Technology fee: $25 per permit ("applied to each of the permit base fees").
 * - Electrical permit: $150 base fee / $75 minimum fee.
 * - Plumbing permit: $150 base fee / $175 minimum fee.
 * - Legal source: Code of Ordinances Ch. 20 Art. IV, Appendix B Table 100.
 *
 * Verified: 2026-09-26.
 */

export const ATL_FEE_EFFECTIVE_FROM = "2017-10-01";

export const ATL_BUILDING_SOURCE_KEY = "atlanta-dcp-fee-tables";
export const ATL_ATL311_SOURCE_KEY = "atl311-residential-permits";

export const ATL_BUILDING_MINIMUM_CENTS = 15_000; // $150.00
export const ATL_TECH_FEE_CENTS = 2_500; // $25.00
export const ATL_ELECTRICAL_MINIMUM_CENTS = 7_500; // $75.00
export const ATL_PLUMBING_MINIMUM_CENTS = 17_500; // $175.00

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
    effectiveFrom: ATL_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const ATL_BUILDING_RULES: FeeRuleRecord[] = [
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-bld-valuation",
    code: "BLD-VALUATION",
    label: "Building permit fee ($7 per $1,000 of cost of construction)",
    description:
      "City of Atlanta Department of City Planning fee table: Building Permit assessed at $7 per $1,000 of Cost of Construction, with a $150 minimum fee. Valuation is the sworn cost of construction checked against Appendix B Table 100.",
    // No "or fraction thereof" is printed, so the rate prorates (no incrementCents).
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      centsPerThousand: 700,
    },
    priority: 100,
  }),
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-bld-minimum-floor",
    code: "BLD-MINIMUM-FLOOR",
    label: "Minimum building permit fee ($150.00)",
    description:
      "City of Atlanta fee table: MIN FEE AMT column for the building permit row is $150.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: ATL_BUILDING_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: ATL_BUILDING_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-bld-tech-fee",
    code: "ATL-TECH-FEE",
    label: "Technology fee ($25.00 per permit)",
    description:
      'City of Atlanta fee table footnote: "A $25 Technology fee is applied to each of the permit base fees."',
    feeType: "flat",
    componentType: "technology",
    config: {
      amountCents: ATL_TECH_FEE_CENTS,
    },
    priority: 300,
  }),
];

export const ATL_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-elec-base",
    code: "ELEC-BASE",
    label: "Electrical permit fee ($150.00)",
    description:
      "City of Atlanta fee table, MECHANICAL, ELECTRICAL & PLUMBING PERMIT FEES: Electrical Permit base fee $150.",
    feeType: "flat",
    config: {
      amountCents: 15_000,
    },
    priority: 100,
  }),
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-elec-minimum-floor",
    code: "ELEC-MINIMUM-FLOOR",
    label: "Minimum electrical permit fee ($75.00)",
    description:
      "City of Atlanta fee table: MIN FEE AMT column for the Electrical Permit row is $75.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: ATL_ELECTRICAL_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: ATL_ELECTRICAL_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-elec-tech-fee",
    code: "ATL-ELEC-TECH-FEE",
    label: "Technology fee ($25.00 per permit)",
    description:
      'City of Atlanta fee table footnote: "A $25 Technology fee is applied to each of the permit base fees."',
    feeType: "flat",
    componentType: "technology",
    config: {
      amountCents: ATL_TECH_FEE_CENTS,
    },
    priority: 300,
  }),
];

export const ATL_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-plumb-base",
    code: "PLUMB-BASE",
    label: "Plumbing permit fee ($150.00)",
    description:
      "City of Atlanta fee table, MECHANICAL, ELECTRICAL & PLUMBING PERMIT FEES: Plumbing Permit base fee $150.",
    feeType: "flat",
    config: {
      amountCents: 15_000,
    },
    priority: 100,
  }),
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-plumb-minimum-floor",
    code: "PLUMB-MINIMUM-FLOOR",
    label: "Minimum plumbing permit fee ($175.00)",
    description:
      "City of Atlanta fee table: MIN FEE AMT column for the Plumbing Permit row is $175.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: ATL_PLUMBING_MINIMUM_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: ATL_PLUMBING_MINIMUM_CENTS }],
    },
    priority: 500,
  }),
  rule(ATL_BUILDING_SOURCE_KEY, {
    id: "atl-plumb-tech-fee",
    code: "ATL-PLUMB-TECH-FEE",
    label: "Technology fee ($25.00 per permit)",
    description:
      'City of Atlanta fee table footnote: "A $25 Technology fee is applied to each of the permit base fees."',
    feeType: "flat",
    componentType: "technology",
    config: {
      amountCents: ATL_TECH_FEE_CENTS,
    },
    priority: 300,
  }),
];
