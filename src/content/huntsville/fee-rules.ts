import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Huntsville, Alabama fee rules — REAL DATA.
 *
 * Source: City of Huntsville Inspection Department (Building License & Permits)
 *         https://www.huntsvilleal.gov/development/building-construction/building-license-permits/
 *
 * Formulas published by the city:
 * 1. New Single-Family Dwellings:
 *    ((Heated square footage × $15.00) + (Unheated square footage × $7.50)) × 0.0055
 * 2. All other building permits:
 *    Total valuation × 0.0055 ($5.50 per $1,000 of valuation)
 * 3. Minimum permit fee: $50.00
 *
 * Verified: 2026-09-25.
 */

export const HSV_FEE_EFFECTIVE_FROM = "2026-01-01";

export const HSV_BUILDING_SOURCE_KEY = "huntsville-inspection-fee-schedule";
export const HSV_TRADE_SOURCE_KEY = "huntsville-trade-permits-schedule";

export const HSV_MINIMUM_PERMIT_CENTS = 5_000; // $50.00

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
    effectiveFrom: HSV_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * The new-single-family-dwelling formula, stated as the city states it:
 *
 *   ((heated sq ft × $15.00) + (unheated sq ft × $7.50)) × 0.0055
 *     = (heated sq ft × $0.0825) + (unheated sq ft × $0.04125)
 *
 * Two area rates, on the engine's **two area bases**: the heated area is the
 * first-class `square_footage` input and the unheated area is the second area,
 * `custom.covered_square_footage` — the same pair Scottsdale's schedule produced,
 * and the reason the engine has two area bases at all rather than one.
 *
 * Notes on this rewrite (a sibling payload's rule, corrected rather than
 * re-authored — the formula, the rates and the $50.00 floor are all unchanged):
 *
 *   - The previous config read `feeType: "per_unit"` with `basis` and
 *     `unitCostCents`, and its condition tested a fact named `sq_ft_conditioned`.
 *     Neither is part of the engine's schema, so the rule failed validation and the
 *     shared seed could not run at all.
 *   - The rate is stated as an exact fraction of a cent per square foot rather than
 *     rounded. $15.00 × 0.0055 is $0.0825 exactly, and $7.50 × 0.0055 is $0.04125
 *     exactly; the old comment's "rounded to 8 cents" would have made a 2,400 sq ft
 *     house a dollar short.
 *   - The valuation row below is gated on the absence of a square-foot figure, so a
 *     new home is priced by the square-foot formula *or* by valuation and never by
 *     both — which is what the city's two formulas mean and what this page's worked
 *     example now shows.
 */
export const HSV_BUILDING_RULES: FeeRuleRecord[] = [
  rule(HSV_BUILDING_SOURCE_KEY, {
    id: "hsv-bld-new-single-family-heated",
    code: "BLD-NEW-SFD-HEATED",
    label: "New single-family home heated area fee ($15/sq ft × 0.0055)",
    description:
      "City of Huntsville formula for new single-family dwellings: heated square footage assessed at $15.00/sq ft with a 0.0055 multiplier, which is $0.0825 per square foot of heated area.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      // 8.25 cents per square foot of heated area, held as an exact rate (an exact
      // rate against a basis is read in cents per unit of it).
      rate: { numerator: 825, denominator: 100 },
      rateUnit: "currency_per_unit",
    },
    conditions: { field: "square_footage", op: "exists" },
    priority: 100,
  }),
  rule(HSV_BUILDING_SOURCE_KEY, {
    id: "hsv-bld-new-single-family-unheated",
    code: "BLD-NEW-SFD-UNHEATED",
    label: "New single-family home unheated area fee ($7.50/sq ft × 0.0055)",
    description:
      "City of Huntsville formula for new single-family dwellings: unheated square footage assessed at $7.50/sq ft with a 0.0055 multiplier, which is $0.04125 per square foot of unheated area. Supplied as the second area input, so a permit that states no unheated area pays nothing for it.",
    feeType: "percent",
    config: {
      basis: "covered_square_footage",
      // 4.125 cents per square foot of unheated area.
      rate: { numerator: 4_125, denominator: 1_000 },
      rateUnit: "currency_per_unit",
    },
    conditions: { field: "custom.covered_square_footage", op: "exists" },
    priority: 105,
  }),
  rule(HSV_BUILDING_SOURCE_KEY, {
    id: "hsv-bld-general-valuation",
    code: "BLD-GENERAL-VALUATION",
    label: "Building permit valuation fee (0.0055 multiplier / $5.50 per $1,000)",
    description:
      "City of Huntsville standard building permit fee for alterations, additions, and commercial work: valuation multiplied by 0.0055. It applies where the application does not price the work by area, so a new home is never charged both formulas.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 550,
    },
    conditions: { field: "square_footage", op: "absent" },
    priority: 110,
  }),
  rule(HSV_BUILDING_SOURCE_KEY, {
    id: "hsv-bld-minimum-floor",
    code: "BLD-MINIMUM-FLOOR",
    label: "Minimum building permit fee ($50.00)",
    description:
      "City of Huntsville minimum permit fee applied to any approved building permit application.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: HSV_MINIMUM_PERMIT_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: HSV_MINIMUM_PERMIT_CENTS }],
    },
    priority: 500,
  }),
];

export const HSV_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(HSV_TRADE_SOURCE_KEY, {
    id: "hsv-elec-valuation",
    code: "ELEC-VALUATION-FEE",
    label: "Electrical permit valuation fee (0.0055 multiplier / $5.50 per $1,000)",
    description:
      "City of Huntsville electrical permit rate: electrical subcontract value multiplied by 0.0055.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 550,
    },
    priority: 100,
  }),
  rule(HSV_TRADE_SOURCE_KEY, {
    id: "hsv-elec-minimum-floor",
    code: "ELEC-MINIMUM-FLOOR",
    label: "Minimum electrical permit fee ($50.00)",
    description: "City of Huntsville minimum standalone electrical permit fee.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: HSV_MINIMUM_PERMIT_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: HSV_MINIMUM_PERMIT_CENTS }],
    },
    priority: 500,
  }),
];

export const HSV_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(HSV_TRADE_SOURCE_KEY, {
    id: "hsv-plumb-valuation",
    code: "PLUMB-VALUATION-FEE",
    label: "Plumbing permit valuation fee (0.0055 multiplier / $5.50 per $1,000)",
    description:
      "City of Huntsville plumbing permit rate: plumbing subcontract value multiplied by 0.0055.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 0,
      thresholdCents: 0,
      incrementCents: 100_000,
      centsPerThousand: 550,
    },
    priority: 100,
  }),
  rule(HSV_TRADE_SOURCE_KEY, {
    id: "hsv-plumb-minimum-floor",
    code: "PLUMB-MINIMUM-FLOOR",
    label: "Minimum plumbing permit fee ($50.00)",
    description: "City of Huntsville minimum standalone plumbing permit fee.",
    feeType: "permit_minimum",
    config: {
      basis: "permit_fee",
      floorCents: HSV_MINIMUM_PERMIT_CENTS,
    },
    conditions: {
      all: [{ field: "permit_fee", op: "lt", value: HSV_MINIMUM_PERMIT_CENTS }],
    },
    priority: 500,
  }),
];
