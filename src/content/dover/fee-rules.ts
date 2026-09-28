import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Dover, Delaware fee rules — REAL DATA.
 *
 * Source: City of Dover Code of Ordinances Chapter 22 "Buildings and Building
 *         Regulations" and Appendix F "Fees and Fines", read in full from the
 *         City's June 24, 2024 Regular City Council packet, which contains the
 *         adopted texts of Proposed Ordinance #2024-15 (Chapter 22) and
 *         Proposed Ordinance #2024-19 (Appendix F, with Staff Amendment #1).
 *
 * - Building (§22-65): $25.00 for the first $1,000 of costs, $8.00 per
 *   additional $1,000 (or multiple thereof) up to $10M, $6.00 per additional
 *   $1,000 up to $20M, $5.00 per additional $1,000 above $20M — three
 *   marginal legs, each excess rounded up to whole thousands.
 * - Plumbing (§22-185): $35.00 first five fixtures, $3.00 each additional;
 *   underground gas/water/sewer inspection $30.00 first 150 ft + $0.75 per
 *   additional ten feet or multiple thereof.
 * - Mechanical (§22-145): air conditioning $40.00 per ton for the first five
 *   tons + $7.00 per ton over five (tons rounded up); heating $40.00 first
 *   10,000 BTU + $7.00 per additional 10,000.
 * - ELECTRICAL (§22-109(a)): "No fee. There shall be no fee for permits or
 *   renewals thereof" — Dover's electrical permits are free by ordinance, so
 *   this seed publishes mechanical as its third category and documents the
 *   finding instead of shipping a page that charges $0.00.
 *
 * Verified: 2026-09-26.
 */

export const DOVER_FEE_EFFECTIVE_FROM = "2024-07-08";

export const DOVER_APPENDIX_F_KEY = "dover-appendix-f-2024";

const ALWAYS_RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };

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
    effectiveFrom: DOVER_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * One marginal leg of the §22-65 building ladder, on the Fargo band pattern:
 * `baseCents` is the amount every lower leg produces at its ceiling (the ladder
 * chains exactly), `thresholdCents` is the leg's floor, and the excess above it
 * rounds up to whole thousands ("or multiples thereof") via `incrementCents`
 * before the `centsPerThousand` rate applies.
 */
function ladderLeg(
  id: string,
  code: string,
  label: string,
  description: string,
  baseCents: number,
  centsPerThousand: number,
  rateThresholdCents: number,
  floorCents: number,
  ceilingCents: number | null,
): FeeRuleRecord {
  const conditions: FeeCondition[] = [];
  if (floorCents > 0) {
    conditions.push({ field: "valuation", op: "gt", value: floorCents });
  }
  if (ceilingCents !== null) {
    conditions.push({ field: "valuation", op: "lte", value: ceilingCents });
  }
  return rule(DOVER_APPENDIX_F_KEY, {
    id,
    code,
    label,
    description,
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand,
      thresholdCents: rateThresholdCents,
      incrementCents: 100_000,
      baseCents,
    },
    conditions: { all: conditions },
    priority: 100,
  });
}

export const DOVER_BUILDING_RULES: FeeRuleRecord[] = [
  ladderLeg(
    "dover-bld-first-10m",
    "BLD-LEG-1",
    "Building permit, first leg ($25.00 first $1,000 + $8.00 per additional $1,000, to $10,000,000)",
    'Appendix F, Chapter 22, Article III, §22-65(a) Building permits: "$25.00 for first $1,000.00 of costs and $8.00 for each additional $1,000.00 of costs or multiples thereof up to $10,000,000.00 of costs." The excess above the first $1,000 is rounded up to whole thousands (\'or multiples thereof\') before the $8.00 rate is applied. This rule charges the first leg only; the two legs above $10M are separate rules.',
    2_500,
    800,
    100_000,
    0,
    1_000_000_000,
  ),
  ladderLeg(
    "dover-bld-10m-to-20m",
    "BLD-LEG-2",
    "Building permit, second leg ($6.00 per $1,000 from $10,000,000 to $20,000,000)",
    'Appendix F §22-65(a), second leg: "$6.00 for each additional $1,000.00 of costs or multiple thereof up to $20,000,000.00." Applies to the portion of costs between $10,000,000 and $20,000,000, rounded up to whole thousands, on top of the first leg\'s product at $10M ($80,017.00), which is this rule\'s base.',
    8_001_700,
    600,
    1_000_000_000,
    1_000_000_000,
    2_000_000_000,
  ),
  ladderLeg(
    "dover-bld-over-20m",
    "BLD-LEG-3",
    "Building permit, third leg ($5.00 per $1,000 above $20,000,000)",
    'Appendix F §22-65(a), third leg: "$5.00 for each additional $1,000.00 of costs or multiple thereof above $20,000,000.00." Applies to the portion of costs above $20,000,000, rounded up to whole thousands, stacked on the legs below — their product at $20M ($140,017.00) is this rule\'s base.',
    14_001_700,
    500,
    2_000_000_000,
    2_000_000_000,
    null,
  ),
  rule(DOVER_APPENDIX_F_KEY, {
    id: "dover-bld-plan-review",
    code: "BLD-PLAN-REVIEW",
    label: "Construction plan review, nonresidential ($20.00 per set of plans)",
    description:
      'Appendix F §22-65(a): "Construction plan reviews, nonresidential (Not subject to doubling) — $20.00 per set of plans." A flat per-set charge, and the one row the schedule expressly marks as exempt from the doubling penalty for work started without a permit.',
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 2_000 },
    conditions: {
      all: [{ not: { ...ALWAYS_RESIDENTIAL } }],
    },
    priority: 300,
  }),
];

export const DOVER_MECHANICAL_RULES: FeeRuleRecord[] = [
  rule(DOVER_APPENDIX_F_KEY, {
    id: "dover-mech-ac",
    code: "MECH-AC",
    label: "Air conditioning permit ($40.00 per ton, first five tons + $7.00 per ton over five)",
    description:
      'Appendix F, Chapter 22, Article V, §22-145(a) Air conditioning permit: "$40.00 per ton for the first five tons and $7.00 per ton over five tons or multiple thereof." The first five tons price at $200.00 in total ($40.00 x 5); each ton above five is rounded up to a whole ton (\'or multiple thereof\') before the $7.00 rate is applied. Heating and heat-pump permits carry the same structure on BTUs: $40.00 first 10,000 BTU and $7.00 per additional 10,000 BTU or multiple thereof.',
    feeType: "per_unit",
    config: { unit: "tons", baseCents: 20_000, thresholdUnits: 5, centsPerUnit: 700 },
    conditions: { field: "custom.tons", op: "exists" },
    priority: 100,
  }),
  rule(DOVER_APPENDIX_F_KEY, {
    id: "dover-mech-heating",
    code: "MECH-HEAT",
    label: "Heating permit ($40.00 first 10,000 BTU + $7.00 per additional 10,000 BTU)",
    description:
      'Appendix F §22-145(a) Heating permit: "$40.00 first 10,000 BTUs and $7.00 each additional 10,000 BTUs or multiple thereof." Modelled on the furnace count the calculator holds: one furnace entry reads as the $40.00 base row. The BTU-scaled add for larger equipment is named in this text rather than charged, because the schedule\'s BTU figure is not a count the calculator publishes.',
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: { field: "custom.furnaces", op: "exists" },
    priority: 110,
  }),
];

export const DOVER_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(DOVER_APPENDIX_F_KEY, {
    id: "dover-plumb-fixtures",
    code: "PLUMB-FIXTURES",
    label: "Plumbing fixtures ($35.00 first five + $3.00 each additional)",
    description:
      'Appendix F, Chapter 22, Article VI, §22-185(a) Fixtures: "$35.00 first five fixtures and $3.00 for each additional fixture." The base covers up to five fixtures; each fixture beyond the fifth adds $3.00. A 5-fixture permit is $35.00; 8 fixtures are $35.00 + 3 x $3.00 = $44.00.',
    feeType: "per_unit",
    config: { unit: "fixtures", baseCents: 3_500, thresholdUnits: 5, centsPerUnit: 300 },
    priority: 100,
  }),
  rule(DOVER_APPENDIX_F_KEY, {
    id: "dover-plumb-underground",
    code: "PLUMB-UNDERGROUND",
    label:
      "Gas, water and sewer inspection underground ($30.00 first 150 ft + $0.75 per additional 10 ft)",
    description:
      'Appendix F §22-185(a): "Gas, water, and sewer inspection underground — $30.00 for first 150 feet and $0.75 for each additional ten feet or multiple thereof." The first 150 feet price at the $30.00 base; each ten feet beyond is rounded up to a whole ten (\'or multiple thereof\') before the $0.75 rate is applied. The $0.75-per-ten-feet rate is $75.00 per 1,000 feet, the count-basis per-thousand form Minneapolis\'s "per 100 lineal feet" rows use, so one rule holds the base block, the threshold and the block rounding together.',
    feeType: "per_thousand",
    config: {
      basis: "linear_feet",
      centsPerThousand: 7_500,
      thresholdCents: 150,
      incrementCents: 10,
      baseCents: 3_000,
    },
    conditions: { field: "custom.linear_feet", op: "exists" },
    priority: 110,
  }),
];
