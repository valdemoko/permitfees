import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Fairbanks, Alaska fee rules — REAL DATA.
 *
 * Source: City of Fairbanks Building Department, Administrative Code
 *         Chapter 10, Article II (Ordinance No. 5800 & Ordinance No. 6099 / 6162).
 *         Table 3-A (Building Permit Fees), Table 3B (Electrical Permit Fees),
 *         Table 3D (Plumbing Permit Fees).
 *
 * Verified: 2026-09-25.
 */

export const FB_FEE_EFFECTIVE_FROM = "2020-04-17";

export const FB_BUILDING_SOURCE_KEY = "fairbanks-building-permit-fees";
export const FB_ELECTRICAL_SOURCE_KEY = "fairbanks-electrical-permit-fees";
export const FB_PLUMBING_SOURCE_KEY = "fairbanks-plumbing-permit-fees";

export const FB_ISSUANCE_FEE_CENTS = 3_500; // $35.00

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
    effectiveFrom: FB_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

function valuationBracket(
  lowerCentsExclusive: number,
  upperCentsInclusive: number | null,
): FeeRuleRecord["conditions"] {
  const clauses: unknown[] = [
    { field: "valuation", op: "gt", value: lowerCentsExclusive },
  ];
  if (upperCentsInclusive !== null) {
    clauses.push({ field: "valuation", op: "lte", value: upperCentsInclusive });
  }
  return { all: clauses };
}

export const FB_BUILDING_RULES: FeeRuleRecord[] = [
  // $1.00 to $500.00: $17.00 flat
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b1",
    code: "BLD-VALUATION-1-500",
    label: "Building permit fee ($1.00 to $500.00)",
    description:
      "Table 3-A: Flat fee of $17.00 for construction valuation from $1.00 to $500.00.",
    feeType: "flat",
    config: { amountCents: 1_700 },
    conditions: valuationBracket(0, 50_000),
  }),

  // $500.01 to $2,000.00: $17.00 for first $500 + $2.25 per $100
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b2",
    code: "BLD-VALUATION-501-2000",
    label: "Building permit fee ($500.01 to $2,000.00)",
    description:
      "Table 3-A: $17.00 for the first $500.00 plus $2.25 for each additional $100.00 or fraction thereof up to $2,000.00 ($22.50 per $1,000).",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 1_700,
      thresholdCents: 50_000,
      incrementCents: 10_000,
      centsPerThousand: 2_250,
    },
    conditions: valuationBracket(50_000, 200_000),
  }),

  // $2,000.01 to $25,000.00: $50.00 for first $2,000 + $10.00 per $1,000
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b3",
    code: "BLD-VALUATION-2001-25000",
    label: "Building permit fee ($2,000.01 to $25,000.00)",
    description:
      "Table 3-A: $50.00 for the first $2,000.00 plus $10.00 for each additional $1,000.00 or fraction thereof up to $25,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_000,
      thresholdCents: 200_000,
      incrementCents: 100_000,
      centsPerThousand: 1_000,
    },
    conditions: valuationBracket(200_000, 2_500_000),
  }),

  // $25,000.01 to $50,000.00: $280.00 for first $25,000 + $7.00 per $1,000
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b4",
    code: "BLD-VALUATION-25001-50000",
    label: "Building permit fee ($25,000.01 to $50,000.00)",
    description:
      "Table 3-A: $280.00 for the first $25,000.00 plus $7.00 for each additional $1,000.00 or fraction thereof up to $50,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 28_000,
      thresholdCents: 2_500_000,
      incrementCents: 100_000,
      centsPerThousand: 700,
    },
    conditions: valuationBracket(2_500_000, 5_000_000),
  }),

  // $50,000.01 to $100,000.00: $455.00 for first $50,000 + $5.00 per $1,000
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b5",
    code: "BLD-VALUATION-50001-100000",
    label: "Building permit fee ($50,000.01 to $100,000.00)",
    description:
      "Table 3-A: $455.00 for the first $50,000.00 plus $5.00 for each additional $1,000.00 or fraction thereof up to $100,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 45_500,
      thresholdCents: 5_000_000,
      incrementCents: 100_000,
      centsPerThousand: 500,
    },
    conditions: valuationBracket(5_000_000, 10_000_000),
  }),

  // $100,000.01 to $300,000.00: $705.00 for first $100,000 + $4.50 per $1,000
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b6",
    code: "BLD-VALUATION-100001-300000",
    label: "Building permit fee ($100,000.01 to $300,000.00)",
    description:
      "Table 3-A: $705.00 for the first $100,000.00 plus $4.50 for each additional $1,000.00 or fraction thereof up to $300,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 70_500,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      centsPerThousand: 450,
    },
    conditions: valuationBracket(10_000_000, 30_000_000),
  }),

  // $300,000.01 to $500,000.00: $1,605.00 for first $300,000 + $7.00 per $1,000
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b7",
    code: "BLD-VALUATION-300001-500000",
    label: "Building permit fee ($300,000.01 to $500,000.00)",
    description:
      "Table 3-A: $1,605.00 for the first $300,000.00 plus $7.00 for each additional $1,000.00 or fraction thereof up to $500,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 160_500,
      thresholdCents: 30_000_000,
      incrementCents: 100_000,
      centsPerThousand: 700,
    },
    conditions: valuationBracket(30_000_000, 50_000_000),
  }),

  // $500,000.01 to $1,000,000.00: $3,005.00 for first $500,000 + $4.60 per $1,000
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b8",
    code: "BLD-VALUATION-500001-1000000",
    label: "Building permit fee ($500,000.01 to $1,000,000.00)",
    description:
      "Table 3-A: $3,005.00 for the first $500,000.00 plus $4.60 for each additional $1,000.00 or fraction thereof up to $1,000,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 300_500,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      centsPerThousand: 460,
    },
    conditions: valuationBracket(50_000_000, 100_000_000),
  }),

  // Over $1,000,000.00: $5,305.00 for first $1,000,000 + $4.60 per $1,000
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-b9",
    code: "BLD-VALUATION-OVER-1M",
    label: "Building permit fee ($1,000,000.01 and up)",
    description:
      "Table 3-A: $5,305.00 for the first $1,000,000.00 plus $4.60 for each additional $1,000.00 or fraction thereof.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 530_500,
      thresholdCents: 100_000_000,
      incrementCents: 100_000,
      centsPerThousand: 460,
    },
    conditions: valuationBracket(100_000_000, null),
  }),

  // Plan Check Review Fee: 75% of Building Permit Fee
  rule(FB_BUILDING_SOURCE_KEY, {
    id: "fb-bld-plan-review",
    code: "BLD-PLAN-REVIEW-75",
    label: "Plan check review fee (75% of building permit fee)",
    description:
      "Administrative Code Section 304.2: Building Plan Review fees shall be 75% of the Building Permit Fee.",
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: {
      basis: "permit_fee",
      rateBps: 7_500,
    },
  }),
];

export const FB_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(FB_ELECTRICAL_SOURCE_KEY, {
    id: "fb-elec-issuance",
    code: "ELEC-ISSUANCE-FEE",
    label: "Electrical permit issuance fee ($35.00)",
    description:
      "Table 3B, Item 1: For issuance of each electrical permit: $35.00.",
    feeType: "flat",
    config: { amountCents: FB_ISSUANCE_FEE_CENTS },
    priority: 100,
  }),
  rule(FB_ELECTRICAL_SOURCE_KEY, {
    id: "fb-elec-sfd-base",
    code: "ELEC-SFD-FLAT",
    label: "Single-family dwelling electrical fee ($255.00)",
    description:
      "Table 3B, Unit Fee Schedule Item 1: New single-family dwelling flat fee ($255.00) including all wiring, service equipment, and attached garages.",
    feeType: "flat",
    config: { amountCents: 25_500 },
    conditions: {
      all: [{ field: "occupancy", op: "eq", value: "residential" }],
    },
    priority: 150,
  }),
];

export const FB_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(FB_PLUMBING_SOURCE_KEY, {
    id: "fb-plumb-issuance",
    code: "PLUMB-ISSUANCE-FEE",
    label: "Plumbing permit issuance fee ($35.00)",
    description:
      "Table 3D, Item 1: For the issuance of each plumbing permit: $35.00.",
    feeType: "flat",
    config: { amountCents: FB_ISSUANCE_FEE_CENTS },
    priority: 100,
  }),
  rule(FB_PLUMBING_SOURCE_KEY, {
    id: "fb-plumb-per-fixture",
    code: "PLUMB-PER-FIXTURE",
    label: "Plumbing fixture fee ($15.00 per fixture)",
    description:
      "Table 3D, Unit Fee Schedule Item 1: Each plumbing fixture: $15.00.",
    feeType: "per_unit",
    config: {
      unit: "fixtures",
      centsPerUnit: 1_500,
    },
    priority: 150,
  }),
];
