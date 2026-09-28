import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Baton Rouge, Louisiana fee rules — REAL DATA.
 *
 * Source: City of Baton Rouge & Parish of East Baton Rouge (consolidated
 *         city-parish), Department of Development — Inspection & Permits,
 *         "Permit & Inspection Fees" page (brla.gov/2694), read in full.
 *
 * Reading notes recorded in research/louisiana/baton-rouge.md §2:
 *   - residential is priced by AREA ($0.80/sq ft + $125; $125 minimum new,
 *     $250 minimum remodel/addition/accessory, trade permits excluded);
 *   - commercial is priced by VALUATION on three bands that chain exactly
 *     (100 × $5 = $500; 500 + 400 × $4 = $2,100);
 *   - commercial plan review is a second valuation table (≤$500k: $3/$1,000;
 *     above: $1,500 + $0.50/$1,000, chaining at the seam) with a $100 minimum;
 *   - commercial MEP trades (mechanical, electrical, plumbing) are flat by
 *     valuation band: $125 / $300 / $400 / $600;
 *   - NO "or fraction thereof" prints anywhere — every per-thousand rate
 *     prorates exactly;
 *   - the $25 technology fee rides every permit; the $100 minimum applies to
 *     the two commercial valuation tables.
 *
 * Verified: 2026-09-26.
 */

export const BRLA_FEE_EFFECTIVE_FROM = "2026-09-26"; // read date; the page prints no effective date

export const BRLA_BUILDING_SOURCE_KEY = "brla-permit-fees";
export const BRLA_ELECTRICAL_SOURCE_KEY = "brla-permit-fees";
export const BRLA_PLUMBING_SOURCE_KEY = "brla-permit-fees";

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
    effectiveFrom: BRLA_FEE_EFFECTIVE_FROM,
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
  const clauses: unknown[] = [{ field: "valuation", op: "gt", value: lowerCentsExclusive }];
  if (upperCentsInclusive !== null) {
    clauses.push({ field: "valuation", op: "lte", value: upperCentsInclusive });
  }
  return { all: clauses };
}

const RESIDENTIAL = { field: "occupancy", op: "eq", value: "residential" } as const;
const NONRESIDENTIAL = {
  field: "occupancy",
  op: "in",
  value: ["commercial", "industrial", "mixed"],
} as const;

export const BRLA_BUILDING_RULES: FeeRuleRecord[] = [
  // Technology fee: $25 on every permit
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-tech",
    code: "BRLA-TECH-FEE",
    label: "Technology fee ($25.00)",
    description:
      "Permit & Inspection Fees, All Permits: Technology Fee $25.00, charged on every permit the Department issues.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 2_500 },
  }),

  // ---- Residential: area-priced ----
  // New building: $0.80/sq ft + $125, $125 minimum
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-res-new",
    code: "BRLA-RES-NEW",
    label: "Residential new building ($0.80/sq ft + $125, $125 minimum)",
    description:
      "Permit & Inspection Fees, Residential: Residential New Building $0.80 per square foot ($125 minimum). The +$125 is the permit's base amount and the $125 is the row's minimum.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 80, denominator: 1 },
      rateUnit: "currency_per_unit",
      baseCents: 12_500,
    },
    minimumCents: 12_500,
    conditions: { all: [RESIDENTIAL, { field: "work_type", op: "eq", value: "new_construction" }] },
  }),
  // Remodel: $0.80/sq ft + $125, $250 minimum (the page prints "$.0.80" — read as $0.80)
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-res-remodel",
    code: "BRLA-RES-REMODEL",
    label: "Residential remodel ($0.80/sq ft + $125, $250 minimum)",
    description:
      "Permit & Inspection Fees, Residential: Residential Remodel $0.80 per square foot + $125 ($250 minimum; EMP trade permits not included). The page prints '$.0.80' — read as $0.80, confirmed by the other rows.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 80, denominator: 1 },
      rateUnit: "currency_per_unit",
      baseCents: 12_500,
    },
    minimumCents: 25_000,
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "in", value: ["remodel", "alteration", "repair"] },
      ],
    },
  }),
  // Addition: $0.80/sq ft + $125, $250 minimum
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-res-addition",
    code: "BRLA-RES-ADDITION",
    label: "Residential addition ($0.80/sq ft + $125, $250 minimum)",
    description:
      "Permit & Inspection Fees, Residential: Residential Addition $0.80 per square foot + $125 ($250 minimum; EMP trade permits not included).",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 80, denominator: 1 },
      rateUnit: "currency_per_unit",
      baseCents: 12_500,
    },
    minimumCents: 25_000,
    conditions: { all: [RESIDENTIAL, { field: "work_type", op: "eq", value: "addition" }] },
  }),

  // ---- Commercial: valuation-priced, three chained bands, all prorating ----
  // ≤ $100,000: $5 per thousand
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-com-1",
    code: "BRLA-COM-100K",
    label: "Commercial permit fee (up to $100,000: $5 per $1,000)",
    description:
      "Permit & Inspection Fees, Commercial Permit Fees: for valuations less than or equal to $100,000, the fee shall be $5 per thousand dollars. Minimum fee is $100.",
    feeType: "per_thousand",
    minimumCents: 10_000,
    config: {
      basis: "valuation",
      centsPerThousand: 500,
    },
    conditions: { all: [NONRESIDENTIAL, valuationBracket(0, 10_000_000)] },
  }),
  // $100,001–$500,000: $500 + $4 per thousand above $100,000
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-com-2",
    code: "BRLA-COM-100K-500K",
    label: "Commercial permit fee ($100,001–$500,000: $500 + $4 per $1,000)",
    description:
      "Permit & Inspection Fees, Commercial Permit Fees: for valuations greater than $100,000 through $500,000, the fee shall be $500 plus $4 per thousand above $100,000. The base chains: 100 × $5 = $500.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 50_000,
      thresholdCents: 10_000_000,
      centsPerThousand: 400,
    },
    conditions: { all: [NONRESIDENTIAL, valuationBracket(10_000_000, 50_000_000)] },
  }),
  // > $500,000: $2,100 + $1.50 per thousand above $500,000
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-com-3",
    code: "BRLA-COM-500K-UP",
    label: "Commercial permit fee (over $500,000: $2,100 + $1.50 per $1,000)",
    description:
      "Permit & Inspection Fees, Commercial Permit Fees: for valuations greater than $500,000, the fee shall be $2,100 plus $1.50 per thousand above $500,000. The base chains: $500 + 400 × $4 = $2,100.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 210_000,
      thresholdCents: 50_000_000,
      centsPerThousand: 150,
    },
    conditions: { all: [NONRESIDENTIAL, valuationBracket(50_000_000, null)] },
  }),

  // ---- Commercial plan review: a second valuation table ----
  // ≤ $500,000: $3 per thousand
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-plan-1",
    code: "BRLA-PLAN-500K",
    label: "Commercial plan review (up to $500,000: $3 per $1,000)",
    description:
      "Permit & Inspection Fees, Commercial Plan Review Fees: for valuations less than or equal to $500,000, the fee shall be $3 per thousand dollars. Minimum fee is $100. Charged in addition to the permit fee.",
    feeType: "per_thousand",
    componentType: "plan_review",
    minimumCents: 10_000,
    priority: 200,
    config: {
      basis: "valuation",
      centsPerThousand: 300,
    },
    conditions: { all: [NONRESIDENTIAL, valuationBracket(0, 50_000_000)] },
  }),
  // > $500,000: $1,500 + $0.50 per thousand above $500,000
  rule(BRLA_BUILDING_SOURCE_KEY, {
    id: "brla-bld-plan-2",
    code: "BRLA-PLAN-500K-UP",
    label: "Commercial plan review (over $500,000: $1,500 + $0.50 per $1,000)",
    description:
      "Permit & Inspection Fees, Commercial Plan Review Fees: for valuations greater than $500,000, the fee shall be $1,500 plus $0.50 per thousand above $500,000. The base chains: 500 × $3 = $1,500.",
    feeType: "per_thousand",
    componentType: "plan_review",
    priority: 200,
    config: {
      basis: "valuation",
      baseCents: 150_000,
      thresholdCents: 50_000_000,
      centsPerThousand: 50,
    },
    conditions: { all: [NONRESIDENTIAL, valuationBracket(50_000_000, null)] },
  }),
];

export const BRLA_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // Commercial MEP trade permit: flat by valuation band
  rule(BRLA_ELECTRICAL_SOURCE_KEY, {
    id: "brla-elec-com",
    code: "BRLA-ELEC-COM",
    label: "Commercial electrical trade permit (flat by valuation: $125/$300/$400/$600)",
    description:
      "Permit & Inspection Fees, Commercial MEP Trade Permit Fees (based on construction valuation): ≤$100,000 — $125; $100,001–$500,000 — $300; $500,001–$2,000,000 — $400; over $2,000,000 — $600.",
    feeType: "tiered_table",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 10_000_000, amountCents: 12_500 },
        { upToCents: 50_000_000, amountCents: 30_000 },
        { upToCents: 200_000_000, amountCents: 40_000 },
        { upToCents: null, amountCents: 60_000 },
      ],
    },
    conditions: { all: [NONRESIDENTIAL] },
  }),
  // Residential trade permit: $125 flat
  rule(BRLA_ELECTRICAL_SOURCE_KEY, {
    id: "brla-elec-res",
    code: "BRLA-ELEC-RES",
    label: "Residential electrical trade permit ($125.00)",
    description:
      "Permit & Inspection Fees, Residential: Residential Mechanical, Electrical or Plumbing, Gas Trade Permits — $125.00 each.",
    feeType: "flat",
    config: { amountCents: 12_500 },
    conditions: { all: [RESIDENTIAL] },
  }),
  // Technology fee
  rule(BRLA_ELECTRICAL_SOURCE_KEY, {
    id: "brla-elec-tech",
    code: "BRLA-TECH-FEE",
    label: "Technology fee ($25.00)",
    description:
      "Permit & Inspection Fees, All Permits: Technology Fee $25.00, charged on every permit the Department issues.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 2_500 },
  }),
];

export const BRLA_PLUMBING_RULES: FeeRuleRecord[] = [
  // Commercial MEP trade permit: flat by valuation band
  rule(BRLA_PLUMBING_SOURCE_KEY, {
    id: "brla-plumb-com",
    code: "BRLA-PLUMB-COM",
    label: "Commercial plumbing trade permit (flat by valuation: $125/$300/$400/$600)",
    description:
      "Permit & Inspection Fees, Commercial MEP Trade Permit Fees (based on construction valuation): ≤$100,000 — $125; $100,001–$500,000 — $300; $500,001–$2,000,000 — $400; over $2,000,000 — $600.",
    feeType: "tiered_table",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 10_000_000, amountCents: 12_500 },
        { upToCents: 50_000_000, amountCents: 30_000 },
        { upToCents: 200_000_000, amountCents: 40_000 },
        { upToCents: null, amountCents: 60_000 },
      ],
    },
    conditions: { all: [NONRESIDENTIAL] },
  }),
  // Residential trade permit: $125 flat
  rule(BRLA_PLUMBING_SOURCE_KEY, {
    id: "brla-plumb-res",
    code: "BRLA-PLUMB-RES",
    label: "Residential plumbing trade permit ($125.00)",
    description:
      "Permit & Inspection Fees, Residential: Residential Mechanical, Electrical or Plumbing, Gas Trade Permits — $125.00 each.",
    feeType: "flat",
    config: { amountCents: 12_500 },
    conditions: { all: [RESIDENTIAL] },
  }),
  // Technology fee
  rule(BRLA_PLUMBING_SOURCE_KEY, {
    id: "brla-plumb-tech",
    code: "BRLA-TECH-FEE",
    label: "Technology fee ($25.00)",
    description:
      "Permit & Inspection Fees, All Permits: Technology Fee $25.00, charged on every permit the Department issues.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 2_500 },
  }),
];
