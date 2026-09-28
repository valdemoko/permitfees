import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * City of Raleigh, North Carolina — **the jurisdiction whose trade permits are a
 * percentage of the building permit fee.**
 *
 * One document carries the whole schedule: the City's *Development Fee Guide* for the
 * fiscal year **July 1, 2026 – June 30, 2027**, which prints two cost columns on every
 * row — Prior Year Cost and FY27 Cost — and both were read, because taking the left one
 * would publish last year's schedule throughout.
 *
 *   S1  **Development Fee Guide**, "Comprehensive Guide for Raleigh Development Fees".
 *       Its Building and Safety table gives the residential building permit as 0.38% of
 *       calculated construction value and the commercial one as three bands (0.21%; then
 *       $1,050 base + 0.06%; then $7,250 base + 0.01%), and then prices the *trades off
 *       that number*: the new-residential electrical permit is **49% of the calculated
 *       building permit**, new commercial electrical is **100%**, plumbing is **34%** and
 *       **56%**. The same table carries a per-trade floor, "Minimum Trade Permit Fee …
 *       $124.00", and a Technology Fee Reference Guide restating every fee as `Fee` and
 *       `Fee Total = Fee + Surcharge` for **"A 4% technology surcharge … applied to the
 *       following development fees"**.
 *
 * **Why the percentage is carried as a product rather than read from `permit_fee`.** The
 * City's wording is "49% of the calculated building permit", and a `permit_fee` basis is
 * how this engine expresses a percentage of another component — but attaching the
 * building permit to the *electrical* page so that it could be read would make that
 * page's total 149% of the building permit, which is not what an electrical permit costs.
 * So each trade rate is the exact product of the two rates the City publishes — 49% ×
 * 0.38% — formed in code from two named constants, so neither figure can move without the
 * other following, and the rule's description states the City's own wording. The
 * composition is exact because both rates are printed as single flat percentages for new
 * construction.
 *
 * **What is not modelled, and named on the pages instead** — the alteration levels
 * (28% / 50% / 75% of the calculated building permit), because the guide prints the share
 * but never prints a building permit fee for an alteration to apply it to; the mechanical
 * permit at 28% and 76%; the special projects fee; and the fire, water, stormwater and
 * transportation departments' fees. See `research/north-carolina/raleigh.md` §4.
 */

/** S1 cover page: "Development Fee Guide — July 1, 2026 - June 30, 2027". */
export const RLY_FEE_EFFECTIVE_FROM = "2026-07-01";

export const RLY_FEE_SOURCE_KEY = "raleigh-development-fee-guide-fy27";

/** S1: "New Residential Construction Building Permit Fee — 0.35% prior, 0.38% FY27, % Of Calculated Construction Value". */
export const RLY_BUILDING_RESIDENTIAL_NUMERATOR = 38;
export const RLY_BUILDING_RESIDENTIAL_DENOMINATOR = 10_000;

/** S1: commercial tier 1 is "0.21% % of Calculated Construction Value" for "$0 - $500,000". */
export const RLY_COMMERCIAL_TIER_1_RATE = { numerator: 21, denominator: 10_000 } as const;
/** S1: "New Commercial Building Permit $500,001-$10,000,000 Tier 2 — $1,050.00 Base Fee" plus 0.06%. */
export const RLY_COMMERCIAL_TIER_2_BASE_CENTS = 105_000;
export const RLY_COMMERCIAL_TIER_2_RATE = { numerator: 6, denominator: 10_000 } as const;
/** S1: "New Commercial Building Permit $10,000,001 and up Tier 3 — $7,250.00 Base Fee" plus 0.01%. */
export const RLY_COMMERCIAL_TIER_3_BASE_CENTS = 725_000;
export const RLY_COMMERCIAL_TIER_3_RATE = { numerator: 1, denominator: 10_000 } as const;

/**
 * The commercial bands, in cents of valuation.
 *
 * The guide states each band in whole dollars and starts the next at a whole dollar —
 * "$0 - $500,000", "$500,001 - $10,000,000", "$10,000,001 and up" — so each band is
 * closed at one cent below the next band's printed opening. Reading them as the guide
 * prints them leaves no valuation unpriced, which a strict reading of the dollar figures
 * would: $500,000.50 falls between "$500,000" and "$500,001".
 */
export const RLY_COMMERCIAL_BANDS = [
  {
    key: "tier_1",
    label: "Tier 1, $0 to $500,000",
    minCents: null,
    maxCents: 50_000_099,
    rate: RLY_COMMERCIAL_TIER_1_RATE,
    baseCents: 0,
  },
  {
    key: "tier_2",
    label: "Tier 2, $500,001 to $10,000,000",
    minCents: 50_000_100,
    maxCents: 1_000_000_099,
    rate: RLY_COMMERCIAL_TIER_2_RATE,
    baseCents: RLY_COMMERCIAL_TIER_2_BASE_CENTS,
  },
  {
    key: "tier_3",
    label: "Tier 3, $10,000,001 and above",
    minCents: 1_000_000_100,
    maxCents: null,
    rate: RLY_COMMERCIAL_TIER_3_RATE,
    baseCents: RLY_COMMERCIAL_TIER_3_BASE_CENTS,
  },
] as const;

/** S1: "New Residential Electrical Permit — 54.00% prior, 49.00% FY27, % Of Calculated Building Permit". */
export const RLY_ELECTRICAL_SHARE_RESIDENTIAL = { numerator: 49, denominator: 100 } as const;
/** S1: "New Commercial Electrical Permit — 100% % Of Calculated Building Permit". */
export const RLY_ELECTRICAL_SHARE_COMMERCIAL = { numerator: 100, denominator: 100 } as const;

/** S1: "New Residential Plumbing Permit — 34.00% % Of Calculated Building Permit". */
export const RLY_PLUMBING_SHARE_RESIDENTIAL = { numerator: 34, denominator: 100 } as const;
/** S1: "New Commercial Plumbing Permit — 56.00% % Of Calculated Building Permit". */
export const RLY_PLUMBING_SHARE_COMMERCIAL = { numerator: 56, denominator: 100 } as const;

/** S1: "New Commercial Plan Review Fee — 65%" / "New Residential Plan Review Fee — 57%". */
export const RLY_PLAN_REVIEW_RESIDENTIAL_BPS = 5_700;
export const RLY_PLAN_REVIEW_COMMERCIAL_BPS = 6_500;

/** S1: "Minimum Trade Permit Fee … $124.00", assessed per trade per review. */
export const RLY_MINIMUM_TRADE_PERMIT_CENTS = 12_400;

/** S1: "A 4% technology surcharge is applied to the following development fees". */
export const RLY_TECHNOLOGY_SURCHARGE_BPS = 400;

/** S1: "Generators (Electrical only) - Commercial — $396.00". */
export const RLY_ELEC_GENERATOR_CENTS = 39_600;
/** S1: "Parking Lot Lighting — $320.00". */
export const RLY_ELEC_PARKING_LOT_LIGHTING_CENTS = 32_000;
/** S1: "UPS System — $340.00". */
export const RLY_ELEC_UPS_CENTS = 34_000;
/** S1: "Co-locate on a Building (Building only) — $300.00". */
export const RLY_ELEC_COLOCATE_CENTS = 30_000;

/** S1: "Fixture Replacement/Retro-fit: 26-50 Fixtures - Commercial — $236.00". */
export const RLY_PLUMB_FIXTURES_26_50_CENTS = 23_600;
/** S1: "Fixture Replacement/Retro-fit: 51-100 Fixtures - Commercial — $297.00". */
export const RLY_PLUMB_FIXTURES_51_100_CENTS = 29_700;
/** S1: "Fixture Replacement/Retro-fit: Over 100 Fixtures - Commercial — $325.00". */
export const RLY_PLUMB_FIXTURES_OVER_100_CENTS = 32_500;
/** S1: "Plumbing Utility Inspection — $133.00". */
export const RLY_PLUMB_UTILITY_INSPECTION_CENTS = 13_300;

/** Which stand-alone permit is being applied for. */
const ELEC = "custom.electrical_item";
const PLUMB = "custom.plumbing_item";

const RESIDENTIAL = "residential";

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
    effectiveFrom: RLY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * A trade's permit fee, as the product of its share and the building permit rate it is a
 * share of.
 *
 * `share` is the City's published percentage ("49% of Calculated Building Permit") and
 * `buildingRate` is the rate the guide publishes for the building permit that percentage
 * is taken against. Both are kept as their own named constants above, so a City rate
 * change is one edit; the product is formed here rather than typed in.
 */
function tradeRate(
  share: { numerator: number; denominator: number },
  building: { numerator: number; denominator: number },
) {
  return {
    numerator: share.numerator * building.numerator,
    denominator: share.denominator * building.denominator,
  };
}

const RESIDENTIAL_BUILDING_RATE = {
  numerator: RLY_BUILDING_RESIDENTIAL_NUMERATOR,
  denominator: RLY_BUILDING_RESIDENTIAL_DENOMINATOR,
};

/** New-construction only: every building row in the guide is headed "New …". */
function isNewConstruction() {
  return { field: "work_type", op: "eq" as const, value: "new_construction" };
}

function isResidential() {
  return { field: "occupancy", op: "eq" as const, value: RESIDENTIAL };
}

function isCommercial() {
  return { field: "occupancy", op: "neq" as const, value: RESIDENTIAL };
}

/** The valuation band a commercial row covers, or nothing when it covers all valuations. */
function bandConditions(band: { minCents: number | null; maxCents: number | null }) {
  const all = [];
  if (band.minCents !== null) all.push({ field: "valuation", op: "gte" as const, value: band.minCents });
  if (band.maxCents !== null) all.push({ field: "valuation", op: "lte" as const, value: band.maxCents });
  return all;
}

/* -------------------------------------------------------------------------- */
/* Building permit                                                            */
/* -------------------------------------------------------------------------- */

export function buildingRules(sourceId: string): FeeRuleRecord[] {
  const residential = rule(sourceId, {
    id: "rly-build-residential",
    code: "BUILD-RESIDENTIAL",
    label: "New residential building permit, 0.38% of calculated construction value",
    description:
      'Development Fee Guide FY27: "New Residential Building Permit / New Residential Construction Building Permit Fee — 0.35% prior, 0.38% FY27, % Of Calculated Construction Value." The City derives the value itself: it applies the ICC Building Valuation Data and then "reduces the national average by 12.4%" for a regional cost adjustment, so the figure a permit is priced from is the City\'s valuation rather than a declaration.',
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: {
        numerator: RLY_BUILDING_RESIDENTIAL_NUMERATOR,
        denominator: RLY_BUILDING_RESIDENTIAL_DENOMINATOR,
      },
    },
    conditions: { all: [isResidential(), isNewConstruction()] },
  });

  const commercial = RLY_COMMERCIAL_BANDS.map((band) =>
    rule(sourceId, {
      id: `rly-build-commercial-${band.key}`,
      code: `BUILD-COMMERCIAL-${band.key.toUpperCase().replace(/_/g, "-")}`,
      label: `New commercial building permit, ${band.label}`,
      description:
        band.baseCents === 0
          ? `Development Fee Guide FY27: "New Commercial Building Permit $0 - $500,000 Tier 1 — 0.20% prior, 0.21% FY27, % of Calculated Construction Value."`
          : `Development Fee Guide FY27: ${band.label} — a base fee of $${(band.baseCents / 100).toFixed(2)} plus ${(band.rate.numerator / band.rate.denominator * 100).toFixed(2)}% of calculated construction value.`,
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: band.rate,
        ...(band.baseCents > 0 ? { baseCents: band.baseCents } : {}),
      },
      conditions: { all: [isCommercial(), isNewConstruction(), ...bandConditions(band)] },
    }),
  );

  const planReview = [
    rule(sourceId, {
      id: "rly-plan-review-residential",
      code: "PLAN-REVIEW-RESIDENTIAL",
      label: "Plan review, 57% of the calculated building permit fee (new residential)",
      description:
        'Development Fee Guide FY27: "New Residential Plan Review Fee / New Residential Construction Plans Review Fee — 57.00% % Of Calculated Building Permit." It is a share of the building permit fee computed in the same run, which is why it reads the permit fee rather than the valuation a second time.',
      feeType: "percent",
      config: { basis: "permit_fee", rateBps: RLY_PLAN_REVIEW_RESIDENTIAL_BPS },
      conditions: { all: [isResidential(), isNewConstruction()] },
      componentType: "plan_review",
      priority: 200,
    }),
    rule(sourceId, {
      id: "rly-plan-review-commercial",
      code: "PLAN-REVIEW-COMMERCIAL",
      label: "Plan review, 65% of the calculated building permit fee (new commercial)",
      description:
        'Development Fee Guide FY27: "New Commercial Plan Review Fee / New Construction Plans Review Fee — 65.00% % Of Calculated Building Permit."',
      feeType: "percent",
      config: { basis: "permit_fee", rateBps: RLY_PLAN_REVIEW_COMMERCIAL_BPS },
      conditions: { all: [isCommercial(), isNewConstruction()] },
      componentType: "plan_review",
      priority: 210,
    }),
  ];

  return [residential, ...commercial, ...planReview];
}

/* -------------------------------------------------------------------------- */
/* Electrical and plumbing                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The electrical permit: a share of the building permit fee, floored at the per-trade
 * minimum, plus the stand-alone permits the guide enumerates.
 *
 * The share and the building rate are multiplied rather than nested, and the flat rows
 * are gated on the item being permitted so that a generator permit cannot also be priced
 * as a share of a building that does not exist in the same calculation.
 */
export function electricalRules(sourceId: string): FeeRuleRecord[] {
  const shareRules = [
    rule(sourceId, {
      id: "rly-elec-residential",
      code: "ELEC-RESIDENTIAL",
      label: "New residential electrical permit, 49% of the calculated building permit fee",
      description:
        'Development Fee Guide FY27: "New Residential Electrical Permit — 54.00% prior, 49.00% FY27, % Of Calculated Building Permit." The building permit fee for new residential construction is 0.38% of calculated construction value, so this rule charges the two published rates composed — 49% of 0.38% — and floors the result at the guide\'s "Minimum Trade Permit Fee … $124.00".',
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: tradeRate(RLY_ELECTRICAL_SHARE_RESIDENTIAL, RESIDENTIAL_BUILDING_RATE),
      },
      conditions: {
        all: [isResidential(), isNewConstruction(), { field: ELEC, op: "absent" }],
      },
      minimumCents: RLY_MINIMUM_TRADE_PERMIT_CENTS,
    }),
    ...RLY_COMMERCIAL_BANDS.map((band) =>
      rule(sourceId, {
        id: `rly-elec-commercial-${band.key}`,
        code: `ELEC-COMMERCIAL-${band.key.toUpperCase().replace(/_/g, "-")}`,
        label: `New commercial electrical permit, 100% of the calculated building permit fee — ${band.label}`,
        description: `Development Fee Guide FY27: "New Commercial Electrical Permit — 100% % Of Calculated Building Permit", and the building permit for ${band.label} is a base fee of $${(band.baseCents / 100).toFixed(2)} plus ${(band.rate.numerator / band.rate.denominator * 100).toFixed(2)}% of calculated construction value. A 100% share is the building permit fee itself, which is why these rates are the guide's own. Floored at the $124.00 per-trade minimum.`,
        feeType: "percent",
        config: {
          basis: "valuation",
          rate: band.rate,
          ...(band.baseCents > 0 ? { baseCents: band.baseCents } : {}),
        },
        conditions: {
          all: [isCommercial(), isNewConstruction(), ...bandConditions(band), { field: ELEC, op: "absent" }],
        },
        minimumCents: RLY_MINIMUM_TRADE_PERMIT_CENTS,
      }),
    ),
  ];

  const flatRules = [
    {
      key: "generator",
      id: "rly-elec-generator",
      code: "ELEC-GENERATOR",
      label: "Commercial electric generator",
      cents: RLY_ELEC_GENERATOR_CENTS,
      quote: "Generators (Electrical only) - Commercial — $396.00 Per Permit",
    },
    {
      key: "parking_lot_lighting",
      id: "rly-elec-parking-lot-lighting",
      code: "ELEC-PARKING-LOT-LIGHTING",
      label: "Parking lot lighting",
      cents: RLY_ELEC_PARKING_LOT_LIGHTING_CENTS,
      quote: "Parking Lot Lighting — $320.00 Per Permit",
    },
    {
      key: "ups",
      id: "rly-elec-ups",
      code: "ELEC-UPS",
      label: "UPS system",
      cents: RLY_ELEC_UPS_CENTS,
      quote: "UPS System — $340.00 Per Permit",
    },
    {
      key: "colocate",
      id: "rly-elec-colocate",
      code: "ELEC-COLOCATE",
      label: "Co-locate a cell on a building",
      cents: RLY_ELEC_COLOCATE_CENTS,
      quote: "Co-locate on a Building (Building only) — $300.00 Per Permit",
    },
  ].map((item) =>
    rule(sourceId, {
      id: item.id,
      code: item.code,
      label: item.label,
      description: `Development Fee Guide FY27, Stand Alone Trade Permits: "${item.quote}".`,
      feeType: "flat",
      config: { amountCents: item.cents },
      conditions: { field: ELEC, op: "eq", value: item.key },
      minimumCents: RLY_MINIMUM_TRADE_PERMIT_CENTS,
      priority: 150,
    }),
  );

  return [...shareRules, ...flatRules];
}

export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  const shareRules = [
    rule(sourceId, {
      id: "rly-plumb-residential",
      code: "PLUMB-RESIDENTIAL",
      label: "New residential plumbing permit, 34% of the calculated building permit fee",
      description:
        'Development Fee Guide FY27: "New Residential Plumbing Permit — 34.00% % Of Calculated Building Permit." The building permit fee for new residential construction is 0.38% of calculated construction value, so this rule charges 34% of 0.38% composed, floored at the guide\'s "Minimum Trade Permit Fee … $124.00".',
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: tradeRate(RLY_PLUMBING_SHARE_RESIDENTIAL, RESIDENTIAL_BUILDING_RATE),
      },
      conditions: {
        all: [isResidential(), isNewConstruction(), { field: PLUMB, op: "absent" }],
      },
      minimumCents: RLY_MINIMUM_TRADE_PERMIT_CENTS,
    }),
    ...RLY_COMMERCIAL_BANDS.map((band) => {
      const share = RLY_PLUMBING_SHARE_COMMERCIAL;
      const baseCents = Math.round((band.baseCents * share.numerator) / share.denominator);
      return rule(sourceId, {
        id: `rly-plumb-commercial-${band.key}`,
        code: `PLUMB-COMMERCIAL-${band.key.toUpperCase().replace(/_/g, "-")}`,
        label: `New commercial plumbing permit, 56% of the calculated building permit fee — ${band.label}`,
        description: `Development Fee Guide FY27: "New Commercial Plumbing Permit — 56.00% % Of Calculated Building Permit", and the building permit for ${band.label} is a base fee of $${(band.baseCents / 100).toFixed(2)} plus ${(band.rate.numerator / band.rate.denominator * 100).toFixed(2)}% of calculated construction value. Charged as 56% of that, floored at the $124.00 per-trade minimum.`,
        feeType: "percent",
        config: {
          basis: "valuation",
          rate: tradeRate(share, band.rate),
          ...(baseCents > 0 ? { baseCents } : {}),
        },
        conditions: {
          all: [isCommercial(), isNewConstruction(), ...bandConditions(band), { field: PLUMB, op: "absent" }],
        },
        minimumCents: RLY_MINIMUM_TRADE_PERMIT_CENTS,
      });
    }),
  ];

  const flatRules = [
    {
      key: "fixtures_26_50",
      id: "rly-plumb-fixtures-26-50",
      code: "PLUMB-FIXTURES-26-50",
      label: "Fixture replacement or retro-fit, 26 to 50 fixtures",
      cents: RLY_PLUMB_FIXTURES_26_50_CENTS,
      quote: "Fixture Replacement/Retro-fit: 26-50 Fixtures - Commercial — $236.00 Per Permit",
    },
    {
      key: "fixtures_51_100",
      id: "rly-plumb-fixtures-51-100",
      code: "PLUMB-FIXTURES-51-100",
      label: "Fixture replacement or retro-fit, 51 to 100 fixtures",
      cents: RLY_PLUMB_FIXTURES_51_100_CENTS,
      quote: "Fixture Replacement/Retro-fit: 51-100 Fixtures - Commercial — $297.00 Per Permit",
    },
    {
      key: "fixtures_over_100",
      id: "rly-plumb-fixtures-over-100",
      code: "PLUMB-FIXTURES-OVER-100",
      label: "Fixture replacement or retro-fit, over 100 fixtures",
      cents: RLY_PLUMB_FIXTURES_OVER_100_CENTS,
      quote: "Fixture Replacement/Retro-fit: Over 100 Fixtures - Commercial — $325.00 Per Permit",
    },
    {
      key: "utility_inspection",
      id: "rly-plumb-utility-inspection",
      code: "PLUMB-UTILITY-INSPECTION",
      label: "Plumbing utility inspection",
      cents: RLY_PLUMB_UTILITY_INSPECTION_CENTS,
      quote: "Plumbing Utility Inspection — $133.00 Per Permit",
    },
  ].map((item) =>
    rule(sourceId, {
      id: item.id,
      code: item.code,
      label: item.label,
      description: `Development Fee Guide FY27, Stand Alone Trade Permits: "${item.quote}".`,
      feeType: "flat",
      config: { amountCents: item.cents },
      conditions: { field: PLUMB, op: "eq", value: item.key },
      minimumCents: RLY_MINIMUM_TRADE_PERMIT_CENTS,
      priority: 150,
    }),
  );

  return [...shareRules, ...flatRules];
}

/**
 * The 4% technology surcharge, read against everything charged so far.
 *
 * The guide is explicit that it is a surcharge on the fees rather than a fee of its own
 * — "A 4% technology surcharge is applied to the following development fees" — and its
 * Technology Fee Reference Guide prints every fee twice, once bare and once with the
 * surcharge, which is what makes `fee_subtotal` the right basis: a percentage of the
 * components charged so far, ordered last so that nothing it reads comes after it.
 */
export function technologySurchargeRule(sourceId: string): FeeRuleRecord {
  return rule(sourceId, {
    id: "rly-technology-surcharge",
    code: "TECHNOLOGY-SURCHARGE",
    label: "Technology surcharge, 4%",
    description:
      'Development Fee Guide FY27, Technology Fee Reference Guide: "A 4% technology surcharge is applied to the following development fees to support the technology resources that allow for permitting in the City of Raleigh. This guide will help you determine the total cost of your fee with the surcharge." The guide then restates each Building and Safety fee as "Fee" and "Fee Total = Fee + Surcharge" — $150.00 becomes $156.00, $124.00 becomes $129.00.',
    feeType: "percent",
    config: { basis: "fee_subtotal", rateBps: RLY_TECHNOLOGY_SURCHARGE_BPS },
    componentType: "technology",
    priority: 900,
  });
}

export const RLY_BUILDING_RULES: FeeRuleRecord[] = [
  ...buildingRules(RLY_FEE_SOURCE_KEY),
  technologySurchargeRule(RLY_FEE_SOURCE_KEY),
];

export const RLY_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...electricalRules(RLY_FEE_SOURCE_KEY),
  technologySurchargeRule(RLY_FEE_SOURCE_KEY),
];

export const RLY_PLUMBING_RULES: FeeRuleRecord[] = [
  ...plumbingRules(RLY_FEE_SOURCE_KEY),
  technologySurchargeRule(RLY_FEE_SOURCE_KEY),
];
