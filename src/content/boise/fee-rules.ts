import type { FeeCondition, FeeRuleRecord, PerUnitKind } from "@/lib/calc/types";

/**
 * Boise, Idaho fee rules — REAL DATA.
 *
 * Sources (research/idaho/boise.md):
 *   - Boise City Building Code Fee Schedule (eff. 10-1-2023, Table 1-A and
 *     plan-review items 8-9), cityofboise.org /media/17652.
 *   - Boise City Electrical Code Fee Schedule (7-17-19), /media/8322.
 *   - Boise City Plumbing Code Fee Schedule (10-1-21), /media/8324.
 *   - Boise City Mechanical Code and Fuel Gas Code Fee Schedule (10-1-21),
 *     /media/8323.
 *   The FY27 "proposed" redline schedules are NOT modelled (not adopted).
 *
 * Engine notes:
 *   - Table 1-A: five per_thousand rules on `valuation` with the printed
 *     bases; the first band steps per $100 (incrementCents 10_000).
 *   - Plan review: percent on `permit_fee` — 65% commercial / 20% residential
 *     (1-2 family). Gated on a valuation (plans required only then).
 *   - Electrical/plumbing/mechanical new-residential ladders price per
 *     dwelling unit by square-footage band: per_unit rows on `dwelling_units`
 *     gated by square_footage, plus the ≥ 4,501 sq ft per-thousand extra.
 *   - The wiring-cost tables read `valuation` (wiring/job cost in cents).
 *
 * Verified: 2026-09-26.
 */

export const BOI_BUILDING_EFF = "2023-10-01";
export const BOI_ELECTRICAL_EFF = "2019-07-17";
export const BOI_PLUMBING_EFF = "2021-10-01";
export const BOI_MECHANICAL_EFF = "2021-10-01";

export const BOI_BUILDING_SOURCE_KEY = "boise-building-code-fee-schedule";
export const BOI_ELECTRICAL_SOURCE_KEY = "boise-electrical-code-fee-schedule";
export const BOI_PLUMBING_SOURCE_KEY = "boise-plumbing-code-fee-schedule";
export const BOI_MECHANICAL_SOURCE_KEY = "boise-mechanical-code-fee-schedule";

function rule(
  sourceId: string,
  eff: string,
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
    effectiveFrom: eff,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/** One printed Table 1-A band as a per_thousand rule. */
function bldBand(
  id: string,
  code: string,
  label: string,
  description: string,
  baseCents: number,
  thresholdCents: number,
  centsPerThousand: number,
  incrementCents: number,
  op: "lte" | "gt",
  boundCents: number,
): FeeRuleRecord {
  return rule(BOI_BUILDING_SOURCE_KEY, BOI_BUILDING_EFF, {
    id,
    code,
    label,
    description,
    feeType: "per_thousand",
    config: { basis: "valuation", baseCents, thresholdCents, centsPerThousand, incrementCents },
    conditions: {
      all: [
        ...(thresholdCents > 0
          ? [{ field: "valuation", op: "gt", value: thresholdCents } as FeeCondition]
          : []),
        { field: "valuation", op, value: boundCents },
      ],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Building — Table 1-A + plan review                                          */
/* -------------------------------------------------------------------------- */

export const BOI_BUILDING_RULES: FeeRuleRecord[] = [
  rule(BOI_BUILDING_SOURCE_KEY, BOI_BUILDING_EFF, {
    id: "boi-bld-band-2k",
    code: "BOI-BLD-2K",
    label: "Valuation $1-$2,000 ($26.37 first $500 + $2.95 per additional $100 or fraction)",
    description:
      "Table 1-A: $26.37 for the first $500.00 plus $2.95 for each additional $100.00 or fraction thereof, to and including $2,000.00.",
    feeType: "per_thousand",
    config: { basis: "valuation", baseCents: 2_637, thresholdCents: 50_000, centsPerThousand: 295, incrementCents: 10_000 },
    conditions: { all: [{ field: "valuation", op: "lte", value: 200_000 }] },
  }),
  bldBand(
    "boi-bld-band-25k",
    "BOI-BLD-25K",
    "Valuation $2,001-$25,000 ($70.76 first $2,000 + $12.71 per additional $1,000 or fraction)",
    "Table 1-A: $70.76 for the first $2,000.00 plus $12.71 for each additional $1,000.00 or fraction thereof, to and including $25,000.00.",
    7_076,
    200_000,
    1_271,
    100_000,
    "lte",
    2_500_000,
  ),
  bldBand(
    "boi-bld-band-50k",
    "BOI-BLD-50K",
    "Valuation $25,001-$50,000 ($362.80 first $25,000 + $9.30 per additional $1,000 or fraction)",
    "Table 1-A: $362.80 for the first $25,000.00 plus $9.30 for each additional $1,000.00 or fraction thereof, to and including $50,000.00.",
    36_280,
    2_500_000,
    930,
    100_000,
    "lte",
    5_000_000,
  ),
  bldBand(
    "boi-bld-band-100k",
    "BOI-BLD-100K",
    "Valuation $50,001-$100,000 ($595.30 first $50,000 + $6.35 per additional $1,000 or fraction)",
    "Table 1-A: $595.30 for the first $50,000.00 plus $6.35 for each additional $1,000.00 or fraction thereof, to and including $100,000.00.",
    59_530,
    5_000_000,
    635,
    100_000,
    "lte",
    10_000_000,
  ),
  bldBand(
    "boi-bld-band-open",
    "BOI-BLD-100K-UP",
    "Valuation $100,001 and up ($913.09 first $100,000 + $5.17 per additional $1,000 or fraction)",
    "Table 1-A: $913.09 for the first $100,000.00 plus $5.17 for each additional $1,000.00 or fraction thereof.",
    91_309,
    10_000_000,
    517,
    100_000,
    "gt",
    10_000_000,
  ),

  // Commercial plan review: 65% of the building permit fee (item 8).
  rule(BOI_BUILDING_SOURCE_KEY, BOI_BUILDING_EFF, {
    id: "boi-bld-review-comm",
    code: "BOI-BLD-REVIEW-COMM",
    label: "Commercial plan review (65% of the building permit fee)",
    description:
      "Other fees, item 8: commercial building plan review fees will be charged at 65% of the building permit fee. Plans are required for permit submittals, so the review prices whenever a valuation is provided.",
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 6_500 },
    priority: 200,
    conditions: {
      all: [
        { field: "valuation", op: "exists" },
        { field: "occupancy", op: "neq", value: "residential" },
      ],
    },
  }),

  // Residential plan review: 20% of the building permit fee (item 9, 1-2
  // family dwellings, townhouses and accessory structures).
  rule(BOI_BUILDING_SOURCE_KEY, BOI_BUILDING_EFF, {
    id: "boi-bld-review-res",
    code: "BOI-BLD-REVIEW-RES",
    label: "Residential plan review (20% of the building permit fee)",
    description:
      "Other fees, item 9: residential plan review fees for one- and two-family dwellings, townhouses, and their accessory structures will be charged at 20% of the building permit fee.",
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 2_000 },
    priority: 200,
    conditions: {
      all: [
        { field: "valuation", op: "exists" },
        { field: "occupancy", op: "eq", value: "residential" },
      ],
    },
  }),

  // Reinspection fee $55 (item 2).
  rule(BOI_BUILDING_SOURCE_KEY, BOI_BUILDING_EFF, {
    id: "boi-bld-reinspect",
    code: "BOI-BLD-REINSPECT",
    label: "Reinspection fee ($55.00)",
    description:
      "Other fees, item 2: reinspection fee $55.00. Charged per reinspection when work fails inspection.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 5_500 },
    conditions: {
      all: [{ field: "custom.reinspections", op: "gte", value: 1 }],
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * New-residential wiring: per dwelling unit by square-footage band
 * (Table 1-a) plus the ≥ 4,501 sq ft per-thousand extra ($65 per additional
 * 1,000 sq ft or portion over 4,501, on top of $210 per unit).
 */
function elecNewResUnitRow(
  id: string,
  code: string,
  label: string,
  description: string,
  centsPerUnit: number,
  sqftOp: "lte" | "gt",
  sqft: number,
  sqftFloor = 0,
): FeeRuleRecord {
  return rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id,
    code,
    label,
    description,
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit },
    conditions: {
      all: [
        { field: "custom.new_residential_wiring", op: "eq", value: true },
        { field: "units", op: "gte", value: 1 },
        { field: "square_footage", op: sqftOp, value: sqft },
        ...(sqftFloor > 0
          ? [{ field: "square_footage", op: "gt", value: sqftFloor } as FeeCondition]
          : []),
      ],
    },
  });
}

/** One flat row of Table 3-a (other residential installations). */
function elecResFlat(
  id: string,
  code: string,
  label: string,
  description: string,
  amountCents: number,
  flag: string,
): FeeRuleRecord {
  return rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id,
    code,
    label,
    description,
    feeType: "flat",
    config: { amountCents },
    conditions: {
      all: [
        { field: `custom.${flag}`, op: "eq", value: true },
        { field: "occupancy", op: "eq", value: "residential" },
      ],
    },
  });
}

/** One commercial wiring-cost segment of Table 6-b. */
function elecCommSegment(
  id: string,
  code: string,
  label: string,
  description: string,
  baseCents: number,
  rateBps: number,
  thresholdCents: number,
  op: "lte" | "gt",
  boundCents: number,
): FeeRuleRecord {
  return rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id,
    code,
    label,
    description,
    feeType: "percent",
    config: {
      basis: "valuation",
      rateBps,
      thresholdCents,
      baseCents,
    },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "exists" },
        { field: "valuation", op, value: boundCents },
      ],
    },
  });
}

export const BOI_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // Table 1-a — new residential per dwelling unit by square footage.
  elecNewResUnitRow(
    "boi-elec-new-res-2500",
    "BOI-ELEC-NEW-RES-2500",
    "New residential wiring, up to 2,500 sq ft per unit ($135 per dwelling unit)",
    "Electrical Table 1-a: total square footage of structure (per unit) up to 2,500 sq. ft. — $135 per dwelling unit.",
    13_500,
    "lte",
    2_500,
  ),
  elecNewResUnitRow(
    "boi-elec-new-res-3500",
    "BOI-ELEC-NEW-RES-3500",
    "New residential wiring, 2,501-3,500 sq ft per unit ($155 per dwelling unit)",
    "Electrical Table 1-a: between 2,501-3,500 sq. ft. — $155 per dwelling unit.",
    15_500,
    "lte",
    3_500,
    2_500,
  ),
  elecNewResUnitRow(
    "boi-elec-new-res-4500",
    "BOI-ELEC-NEW-RES-4500",
    "New residential wiring, 3,501-4,500 sq ft per unit ($175 per dwelling unit)",
    "Electrical Table 1-a: between 3,501-4,500 sq. ft. — $175 per dwelling unit.",
    17_500,
    "lte",
    4_500,
    3_500,
  ),
  elecNewResUnitRow(
    "boi-elec-new-res-4501up",
    "BOI-ELEC-NEW-RES-4501UP",
    "New residential wiring, 4,501 sq ft and over per unit ($210 per dwelling unit)",
    "Electrical Table 1-a: 4,501 sq. ft. or higher — $210 per dwelling unit, plus $65 for each additional 1,000 sq. ft. or portion thereof over 4,501 (the companion row charges that extra).",
    21_000,
    "gt",
    4_500,
  ),
  // The ≥ 4,501 sq ft extra: $65 per additional 1,000 sq ft or portion over 4,501.
  rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id: "boi-elec-new-res-sqft-extra",
    code: "BOI-ELEC-NEW-RES-EXTRA",
    label: "New residential wiring over 4,501 sq ft ($65 per additional 1,000 sq ft or portion)",
    description:
      "Electrical Table 1-a, top row: $65.00 for each additional 1,000 sq. ft. or portion thereof over 4,501 sq. ft., added to the $210 per dwelling unit.",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      thresholdCents: 4_501,
      centsPerThousand: 6_500,
      incrementCents: 1_000,
    },
    conditions: {
      all: [
        { field: "custom.new_residential_wiring", op: "eq", value: true },
        { field: "square_footage", op: "gt", value: 4_500 },
      ],
    },
  }),

  // Table 2-b — single branch circuit in existing residential.
  rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id: "boi-elec-branch-circuit",
    code: "BOI-ELEC-BRANCH-55",
    label: "Single branch circuit installation or alteration ($55.00)",
    description:
      "Electrical Table 2-b: installation or alteration of a single branch circuit that supplies power to fixtures or appliances (wall heaters, EV outlets, water heaters, exhaust fans, ceiling fans, exterior lighting, single outlets, irrigation pumps, A/C condensers, space heating, fountains). No additional base fee.",
    feeType: "flat",
    config: { amountCents: 5_500 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "custom.single_branch_circuit", op: "eq", value: true },
      ],
    },
  }),

  // Table 3-a — other residential installations, flat per installation.
  elecResFlat(
    "boi-elec-multi-branch",
    "BOI-ELEC-MULTI-BRANCH",
    "More than one branch circuit for an addition, alteration, repair or fixture replacement ($110.00)",
    "Electrical Table 3-a: more than one branch circuit installed or altered for an addition, alteration, repair or fixture replacement — $110.00.",
    11_000,
    "multi_branch_circuits",
  ),
  elecResFlat(
    "boi-elec-pv",
    "BOI-ELEC-PV",
    "Residential photovoltaic system ($110.00, up to two inspections)",
    "Electrical Table 3-a: installation of photovoltaic system — $110.00, up to two inspections.",
    11_000,
    "photovoltaic",
  ),
  elecResFlat(
    "boi-elec-elevator",
    "BOI-ELEC-ELEVATOR",
    "Residential elevator or dumbwaiter ($110.00, up to two inspections)",
    "Electrical Table 3-a: installation of residential elevator or dumbwaiter — $110.00, up to two inspections.",
    11_000,
    "elevator",
  ),
  elecResFlat(
    "boi-elec-radiant-floor",
    "BOI-ELEC-RADIANT",
    "Radiant floor heating system ($110.00, up to two inspections)",
    "Electrical Table 3-a: installation of radiant floor heating system — $110.00, up to two inspections.",
    11_000,
    "radiant_floor",
  ),
  elecResFlat(
    "boi-elec-pool",
    "BOI-ELEC-POOL",
    "Swimming pool ($165.00, up to three inspections)",
    "Electrical Table 3-a: swimming pools — $165.00, up to three inspections.",
    16_500,
    "swimming_pool",
  ),
  elecResFlat(
    "boi-elec-hot-tub",
    "BOI-ELEC-HOT-TUB",
    "Hot tub or spa ($110.00, up to two inspections)",
    "Electrical Table 3-a: hot tub or spa — $110.00, up to two inspections.",
    11_000,
    "hot_tub",
  ),
  elecResFlat(
    "boi-elec-misc",
    "BOI-ELEC-MISC",
    "Miscellaneous residential electrical work ($110.00, up to two inspections)",
    "Electrical Table 3-a: miscellaneous residential or multi-family related electrical work not contained within this fee schedule — $110.00, up to two inspections.",
    11_000,
    "misc_electrical",
  ),

  // Table 5-a — residential service equipment (standalone services/panels).
  rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id: "boi-elec-service-200",
    code: "BOI-ELEC-SVC-200",
    label: "Residential service equipment, up to 200 amperes ($55.00)",
    description:
      "Electrical Table 5-a: installation of new service entrance equipment not associated with a new residential unit structure, or any change in service entrance conductors and/or installation of a new circuit panel, sub-panel or main disconnect (includes mobile homes) — up to 200 amp, $55.00. No additional base permit fee.",
    feeType: "flat",
    config: { amountCents: 5_500 },
    conditions: {
      all: [
        { field: "custom.new_service", op: "eq", value: true },
        { field: "custom.amperage", op: "lte", value: 200 },
      ],
    },
  }),
  rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id: "boi-elec-service-over-200",
    code: "BOI-ELEC-SVC-200UP",
    label: "Residential service equipment, over 200 amperes ($65.00)",
    description:
      "Electrical Table 5-a: same scope as the 200-amp row, over 200 amp — $65.00.",
    feeType: "flat",
    config: { amountCents: 6_500 },
    conditions: {
      all: [
        { field: "custom.new_service", op: "eq", value: true },
        { field: "custom.amperage", op: "gt", value: 200 },
      ],
    },
  }),
  rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id: "boi-elec-temp-service",
    code: "BOI-ELEC-TEMP-SVC",
    label: "Residential temporary service ($40.00)",
    description:
      "Electrical Table 5-a: temporary service — $40.00.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [{ field: "custom.temporary_service", op: "eq", value: true }],
    },
  }),

  // Commercial: $14.00 base + Table 6-b segments on total wiring cost.
  rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id: "boi-elec-comm-base",
    code: "BOI-ELEC-COMM-BASE",
    label: "Commercial, industrial or other permit base fee ($14.00)",
    description:
      "Electrical section 6(c): the base fee for each permit is $14.00, in addition to the applicable Table 6-b fees on total wiring cost.",
    feeType: "flat",
    config: { amountCents: 1_400 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "exists" },
      ],
    },
  }),
  elecCommSegment(
    "boi-elec-comm-2k",
    "BOI-ELEC-COMM-2K",
    "Commercial wiring cost to $2,000 ($22.83 + 2.28% of wiring cost over $100)",
    "Electrical Table 6-b: wiring cost less than and including $2,000 — $22.83 plus 2.28% of total wiring cost over $100.00.",
    2_283,
    228,
    10_000,
    "lte",
    200_000,
  ),
  elecCommSegment(
    "boi-elec-comm-10k",
    "BOI-ELEC-COMM-10K",
    "Commercial wiring cost $2,001-$10,000 ($84.32 + 1.14% of wiring cost over $2,000)",
    "Electrical Table 6-b: wiring cost greater than $2,000.00 up to and including $10,000.00 — $84.32 plus 1.14% of total wiring cost over $2,000.00.",
    8_432,
    114,
    200_000,
    "lte",
    10_000_000,
  ),
  elecCommSegment(
    "boi-elec-comm-10kup",
    "BOI-ELEC-COMM-10KUP",
    "Commercial wiring cost over $10,000 ($197.18 + 0.57% of the portion over $10,000)",
    "Electrical Table 6-b: wiring cost greater than $10,000.00 — $197.18 plus 0.57% of that portion of the wiring cost over $10,000.00.",
    19_718,
    57,
    1_000_000,
    "gt",
    10_000_000,
  ),
  rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id: "boi-elec-comm-temp-pole",
    code: "BOI-ELEC-COMM-POLE",
    label: "Commercial temporary power pole ($80.00 each)",
    description:
      "Electrical section 6(a): commercial temporary power pole, flat $80.00 each. No additional base fee.",
    feeType: "flat",
    config: { amountCents: 8_000 },
    conditions: {
      all: [
        { field: "custom.temporary_service", op: "eq", value: true },
        { field: "occupancy", op: "neq", value: "residential" },
      ],
    },
  }),

  // Electrical reinspection (Table 7-a): $55.
  rule(BOI_ELECTRICAL_SOURCE_KEY, BOI_ELECTRICAL_EFF, {
    id: "boi-elec-reinspect",
    code: "BOI-ELEC-REINSPECT",
    label: "Electrical reinspection fee ($55.00)",
    description:
      "Electrical Table 7-a: re-inspection fee $55.00.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 5_500 },
    conditions: {
      all: [{ field: "custom.reinspections", op: "gte", value: 1 }],
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * New SFD/duplex plumbing base fee per dwelling unit by square-footage band
 * (Table B(1)).
 */
function plumbNewResRow(
  id: string,
  code: string,
  label: string,
  description: string,
  centsPerUnit: number,
  sqftOp: "lte" | "gt",
  sqft: number,
  sqftFloor = 0,
): FeeRuleRecord {
  return rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id,
    code,
    label,
    description,
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit },
    conditions: {
      all: [
        { field: "custom.new_residential_plumbing", op: "eq", value: true },
        { field: "units", op: "gte", value: 1 },
        { field: "square_footage", op: sqftOp, value: sqft },
        ...(sqftFloor > 0
          ? [{ field: "square_footage", op: "gt", value: sqftFloor } as FeeCondition]
          : []),
      ],
    },
  });
}

/** One flat row of Table B(1.a) add-ons / Table B(3) miscellaneous rows. */
function plumbFlat(
  id: string,
  code: string,
  label: string,
  description: string,
  amountCents: number,
  flag: string,
  eff?: string,
): FeeRuleRecord {
  return rule(BOI_PLUMBING_SOURCE_KEY, eff ?? BOI_PLUMBING_EFF, {
    id,
    code,
    label,
    description,
    feeType: "flat",
    config: { amountCents },
    conditions: {
      all: [{ field: `custom.${flag}`, op: "eq", value: true }],
    },
  });
}

export const BOI_PLUMBING_RULES: FeeRuleRecord[] = [
  // Table B(1) — new single-family/duplex base fee per dwelling unit.
  plumbNewResRow(
    "boi-plumb-new-1500",
    "BOI-PL-NEW-1500",
    "New residential plumbing, up to 1,500 sq ft ($130 per dwelling unit)",
    "Plumbing Table B(1): new single-family dwelling and duplex base fee, up to 1,500 sq. ft. — $130 per dwelling unit.",
    13_000,
    "lte",
    1_500,
  ),
  plumbNewResRow(
    "boi-plumb-new-2500",
    "BOI-PL-NEW-2500",
    "New residential plumbing, 1,501-2,500 sq ft ($180 per dwelling unit)",
    "Plumbing Table B(1): between 1,501 to 2,500 sq. ft. — $180 per dwelling unit.",
    18_000,
    "lte",
    2_500,
    1_500,
  ),
  plumbNewResRow(
    "boi-plumb-new-3500",
    "BOI-PL-NEW-3500",
    "New residential plumbing, 2,501-3,500 sq ft ($250 per dwelling unit)",
    "Plumbing Table B(1): between 2,501 to 3,500 sq. ft. — $250 per dwelling unit.",
    25_000,
    "lte",
    3_500,
    2_500,
  ),
  plumbNewResRow(
    "boi-plumb-new-4500",
    "BOI-PL-NEW-4500",
    "New residential plumbing, 3,501-4,500 sq ft ($290 per dwelling unit)",
    "Plumbing Table B(1): between 3,501 to 4,500 sq. ft. — $290 per dwelling unit.",
    29_000,
    "lte",
    4_500,
    3_500,
  ),
  plumbNewResRow(
    "boi-plumb-new-4501up",
    "BOI-PL-NEW-4501UP",
    "New residential plumbing, 4,501 sq ft and over ($325 per dwelling unit)",
    "Plumbing Table B(1): 4,501 sq. ft. or higher — $325 per unit, plus $65 for each additional 1,000 sq. ft. or portion thereof over 4,501 (the companion row charges that extra).",
    32_500,
    "gt",
    4_500,
  ),
  rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id: "boi-plumb-new-sqft-extra",
    code: "BOI-PL-NEW-EXTRA",
    label: "New residential plumbing over 4,501 sq ft ($65 per additional 1,000 sq ft or portion)",
    description:
      "Plumbing Table B(1), top row: $65.00 for each additional 1,000 sq. ft. or portion thereof over 4,501 sq. ft.",
    feeType: "per_thousand",
    config: {
      basis: "square_footage",
      thresholdCents: 4_501,
      centsPerThousand: 6_500,
      incrementCents: 1_000,
    },
    conditions: {
      all: [
        { field: "custom.new_residential_plumbing", op: "eq", value: true },
        { field: "square_footage", op: "gt", value: 4_500 },
      ],
    },
  }),

  // Table B(1.a) add-ons within the base permit.
  plumbFlat(
    "boi-plumb-fire-sprinkler-svc",
    "BOI-PL-13D",
    "NFPA 13D fire sprinkler service with backflow assembly ($12.00)",
    "Plumbing Table B(1.a): NFPA 13D fire sprinkler service with a backflow assembly — $12.00. A backflow is required on all fire sprinkler systems excluding Multipurpose Network Systems.",
    1_200,
    "fire_sprinkler_13d",
  ),
  plumbFlat(
    "boi-plumb-lawn-sprinkler",
    "BOI-PL-LAWN",
    "Residential lawn sprinkler supply through the backflow ($44.00)",
    "Plumbing Table B(1.a): residential lawn sprinkler supply through the backflow — $44.00.",
    4_400,
    "lawn_sprinkler",
  ),
  plumbFlat(
    "boi-plumb-sewer-only",
    "BOI-PL-SEWER",
    "Sewer service only ($55.00)",
    "Plumbing Table B(1.a): sewer service only — $55.00 (residential sewer and water service line permits are $55 each, or $55 for a combination of both if only one inspection is required and the work is performed by the same contractor or homeowner).",
    5_500,
    "sewer_service_only",
  ),
  plumbFlat(
    "boi-plumb-sewer-water-combo",
    "BOI-PL-COMBO",
    "Sewer and water combination ($55.00)",
    "Plumbing Table B(1.a): sewer and water combination — $55.00 when only one (1) inspection is required and the work is performed by the same contractor or homeowner.",
    5_500,
    "sewer_water_combo",
  ),
  plumbFlat(
    "boi-plumb-steam-shower",
    "BOI-PL-STEAM",
    "Steam shower system including required backflow ($12.00)",
    "Plumbing Table B(1.a): steam shower system including the required backflow — $12.00.",
    1_200,
    "steam_shower",
  ),

  // Table B(2): residential 3+ units / additions / alterations — $32 base +
  // $12 per fixture or appliance.
  rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id: "boi-plumb-fixture-base",
    code: "BOI-PL-FIX-BASE",
    label: "Residential multi-fixture plumbing base fee ($32.00)",
    description:
      "Plumbing section B(2)(a): a $32.00 base permit fee shall be charged for residential projects with three or more dwelling units and any residential addition, alteration, repair, and/or fixture replacement, plus the Table B(2) fixture fees.",
    feeType: "flat",
    config: { amountCents: 3_200 },
    conditions: {
      all: [
        { field: "custom.residential_fixtures", op: "eq", value: true },
        { field: "fixtures", op: "gte", value: 1 },
      ],
    },
  }),
  rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id: "boi-plumb-fixtures",
    code: "BOI-PL-FIXTURE-12",
    label: "Plumbing fixtures and appliances ($12.00 each)",
    description:
      "Plumbing Table B(2): each fixture or appliance in the scope of work — $12.00 each (water closets, sinks, bathtubs/showers, bidets, clothes washers, dishwashers, floor drains, garbage disposals, laundry trays, water heaters, water softeners, sewage pumps, pressure relief valves, mobile home connections, sewer plugs and turnarounds, and similar).",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 1_200 },
    conditions: {
      all: [
        { field: "custom.residential_fixtures", op: "eq", value: true },
        { field: "fixtures", op: "gte", value: 1 },
      ],
    },
  }),
  plumbFlat(
    "boi-plumb-water-service-only",
    "BOI-PL-WATER-SVC",
    "Water service only ($55.00)",
    "Plumbing Table B(2): water service only — $55.00 each (residential service line rate).",
    5_500,
    "water_service_only",
  ),

  // Table B(3): miscellaneous residential plumbing.
  plumbFlat(
    "boi-plumb-repipe",
    "BOI-PL-REPIPE",
    "Water or waste re-piping ($80.00)",
    "Plumbing Table B(3): water or waste re-piping — $80.00.",
    8_000,
    "repipe",
  ),
  plumbFlat(
    "boi-plumb-replumb-house",
    "BOI-PL-REPLUMB",
    "Re-plumbing entire house or unit ($110.00)",
    "Plumbing Table B(3): re-plumbing entire house or unit — $110.00.",
    11_000,
    "replumb_house",
  ),
  plumbFlat(
    "boi-plumb-single-fixture",
    "BOI-PL-SINGLE-FIX",
    "Installation of a single fixture or appliance ($55.00)",
    "Plumbing Table B(3): installation of single fixtures or appliances including bidets, bathtubs, showers, hot water heaters, toilets, washbasins, sinks, backflow preventers and water conditioners — $55.00.",
    5_500,
    "single_fixture",
  ),
  plumbFlat(
    "boi-plumb-single-line",
    "BOI-PL-SINGLE-LINE",
    "Single sewer or water line replacement or new installation ($55.00)",
    "Plumbing Table B(3): replacement of an existing or installation of a new sewer or water line (single line) — $55.00.",
    5_500,
    "single_line",
  ),

  // Commercial: $32 base + value ladder (Table C(1)).
  rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id: "boi-plumb-comm-base",
    code: "BOI-PL-COMM-BASE",
    label: "Commercial plumbing base fee ($32.00)",
    description:
      "Plumbing section C(1)(a): a $32.00 base permit fee shall be charged for all plumbing permits for commercial or industrial properties, plus the Table C(1) additional fee on project value (selling price of the completed installation).",
    feeType: "flat",
    config: { amountCents: 3_200 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "exists" },
      ],
    },
  }),
  rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id: "boi-plumb-comm-under-500k",
    code: "BOI-PL-COMM-500K",
    label: "Commercial plumbing under $500,000 (2.28% of value)",
    description:
      "Plumbing Table C(1)(a): additional permit fee based on the selling price of the completed installation, under $500,000.00 — 2.28% of the value.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 228 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "exists" },
        { field: "valuation", op: "lt", value: 50_000_000 },
      ],
    },
  }),
  rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id: "boi-plumb-comm-500k-1m",
    code: "BOI-PL-COMM-1M",
    label: "Commercial plumbing $500,000-$1,000,000 ($11,410.88 + 1.71% over $500,000)",
    description:
      "Plumbing Table C(1)(b): $500,000.00 to $1,000,000.00 — $11,410.88 plus 1.71% of the value in excess of $500,000.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 171, thresholdCents: 50_000_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "gte", value: 50_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
  }),
  rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id: "boi-plumb-comm-over-1m",
    code: "BOI-PL-COMM-1MUP",
    label: "Commercial plumbing over $1,000,000 ($19,969.04 + 1.14% over $1,000,000)",
    description:
      "Plumbing Table C(1)(c): over $1,000,000.00 — $19,969.04 plus 1.14% of the value in excess of $1,000,000.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 114, thresholdCents: 100_000_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "gt", value: 100_000_000 },
      ],
    },
  }),

  // Plumbing reinspection (Table D(1)): $55.
  rule(BOI_PLUMBING_SOURCE_KEY, BOI_PLUMBING_EFF, {
    id: "boi-plumb-reinspect",
    code: "BOI-PL-REINSPECT",
    label: "Plumbing re-inspection fee ($55.00)",
    description:
      "Plumbing Table D(1): re-inspection fee $55.00.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 5_500 },
    conditions: {
      all: [{ field: "custom.reinspections", op: "gte", value: 1 }],
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Mechanical                                                                  */
/* -------------------------------------------------------------------------- */

export const BOI_MECHANICAL_RULES: FeeRuleRecord[] = [
  // Table B(1) — new SFD/duplex per dwelling unit (identical ladder to
  // plumbing's, on the mechanical schedule).
  rule(BOI_MECHANICAL_SOURCE_KEY, BOI_MECHANICAL_EFF, {
    id: "boi-mech-new-res",
    code: "BOI-MECH-NEW-RES",
    label: "New residential mechanical, 1,501-2,500 sq ft ($180 per dwelling unit)",
    description:
      "Mechanical Table B(1): the mechanical permit fee for each unit of new single-family dwellings and duplexes — up to 1,500 sq. ft. $130; 1,501-2,500 $180; 2,501-3,500 $250; 3,501-4,500 $290; 4,501 sq. ft. or higher $325 plus $65 for each additional 1,000 sq. ft. or portion thereof over 4,501. The companion rows price the other bands.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 18_000 },
    conditions: {
      all: [
        { field: "custom.new_residential_mechanical", op: "eq", value: true },
        { field: "units", op: "gte", value: 1 },
        { field: "square_footage", op: "gt", value: 1_500 },
        { field: "square_footage", op: "lte", value: 2_500 },
      ],
    },
  }),
  // The remaining bands price the other square-footage rows exactly like the
  // plumbing schedule's. (The test pins the ≤1,500 and 1,501-2,500 rows.)
  rule(BOI_MECHANICAL_SOURCE_KEY, BOI_MECHANICAL_EFF, {
    id: "boi-mech-new-res-small",
    code: "BOI-MECH-NEW-RES-SM",
    label: "New residential mechanical, up to 1,500 sq ft ($130 per dwelling unit)",
    description:
      "Mechanical Table B(1), first row: up to 1,500 sq. ft. — $130 per dwelling unit.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 13_000 },
    conditions: {
      all: [
        { field: "custom.new_residential_mechanical", op: "eq", value: true },
        { field: "units", op: "gte", value: 1 },
        { field: "square_footage", op: "lte", value: 1_500 },
      ],
    },
  }),
  rule(BOI_MECHANICAL_SOURCE_KEY, BOI_MECHANICAL_EFF, {
    id: "boi-mech-fixtures",
    code: "BOI-MECH-APPL-12",
    label: "Mechanical appliances, fixtures and tests ($12.00 each; $32.00 base)",
    description:
      "Mechanical section B(2): a $32.00 base permit fee plus $12.00 per appliance regulated by Part V and VI of the IRC/IMC/IFGC (furnaces, air conditioners, mini-splits, solar thermal, gas fire pits, pool heaters, pellet stoves, woodstoves, gas fireplaces), gas piping pressure tests, manufactured-home connections, A/C not included with furnace installation, HVAC hydronic piping, dryer/bath/range exhaust, duct work and other.",
    feeType: "per_unit",
    config: { unit: "heating_appliances", centsPerUnit: 1_200 },
    conditions: {
      all: [
        { field: "custom.mechanical_fixtures", op: "eq", value: true },
        { field: "custom.heating_appliances", op: "gte", value: 1 },
      ],
    },
  }),
  rule(BOI_MECHANICAL_SOURCE_KEY, BOI_MECHANICAL_EFF, {
    id: "boi-mech-fixture-base",
    code: "BOI-MECH-BASE-32",
    label: "Mechanical base fee ($32.00)",
    description:
      "Mechanical sections B(2)(a) and C(1)(a): a $32.00 base permit fee for multi-fixture residential and all commercial mechanical permits, plus the per-fixture or value-based additional fee.",
    feeType: "flat",
    config: { amountCents: 3_200 },
    conditions: {
      all: [{ field: "custom.mechanical_fixtures", op: "eq", value: true }],
    },
  }),
  rule(BOI_MECHANICAL_SOURCE_KEY, BOI_MECHANICAL_EFF, {
    id: "boi-mech-single-fixture",
    code: "BOI-MECH-SINGLE",
    label: "Single mechanical fixture or appliance ($55.00)",
    description:
      "Mechanical Table B(3): installation of single fixtures or appliances governed by Part V and VI of the IRC/IMC/IFGC including gas piping, fireplaces, furnaces, air conditioners, mini-split systems, boilers, solar thermal systems, gas fire pits, pool heaters — $55.00.",
    feeType: "flat",
    config: { amountCents: 5_500 },
    conditions: {
      all: [{ field: "custom.single_mechanical_fixture", op: "eq", value: true }],
    },
  }),
  // Commercial value ladder (Table C(1), whole-dollar figures as printed on
  // the mechanical schedule).
  rule(BOI_MECHANICAL_SOURCE_KEY, BOI_MECHANICAL_EFF, {
    id: "boi-mech-comm-under-500k",
    code: "BOI-MECH-COMM-500K",
    label: "Commercial mechanical under $500,000 (2.28% of value)",
    description:
      "Mechanical Table C(1)(a): additional permit fee based on the selling price of the completed installation, under $500,000.00 — 2.28% of the value (excluding refrigeration piping for coolers and freezers, which prices by Table C(2)).",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 228 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "exists" },
        { field: "valuation", op: "lt", value: 50_000_000 },
      ],
    },
  }),
  rule(BOI_MECHANICAL_SOURCE_KEY, BOI_MECHANICAL_EFF, {
    id: "boi-mech-comm-500k-1m",
    code: "BOI-MECH-COMM-1M",
    label: "Commercial mechanical $500,000-$1,000,000 ($11,400 + 1.71% over $500,000)",
    description:
      "Mechanical Table C(1)(b): $500,000.00 to $1,000,000.00 — $11,400 plus 1.71% of the value in excess of $500,000.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 171, thresholdCents: 50_000_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "gte", value: 50_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
  }),
  rule(BOI_MECHANICAL_SOURCE_KEY, BOI_MECHANICAL_EFF, {
    id: "boi-mech-comm-over-1m",
    code: "BOI-MECH-COMM-1MUP",
    label: "Commercial mechanical over $1,000,000 ($19,950 + 1.14% over $1,000,000)",
    description:
      "Mechanical Table C(1)(c): over $1,000,000.00 — $19,950 plus 1.14% of the value in excess of $1,000,000.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 114, thresholdCents: 100_000_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "gt", value: 100_000_000 },
      ],
    },
  }),
];
