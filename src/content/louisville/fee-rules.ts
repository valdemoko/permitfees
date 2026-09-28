import type { FeeCondition, FeeRuleRecord, PerUnitKind } from "@/lib/calc/types";

/**
 * Louisville Metro, Kentucky fee rules — REAL DATA.
 *
 * Sources (research/kentucky/louisville.md):
 *   - LMCO Chapter 150.096 Promulgated Fees & Regulations, Construction Permits
 *     and Inspection Fees — the department's promulgated schedule PDF, revised
 *     2/6/2024, linked from louisvilleky.gov Construction Review pages:
 *     /sites/default/files/2025-05/promulgated-permit-fees-february-20240pdf.pdf
 *   - 815 KAR 20:050 (Kentucky state plumbing permit fees, Division of
 *     Plumbing) — Kentucky licenses and inspects plumbing at the state level;
 *     Louisville's promulgated schedule has no plumbing section, so the local
 *     plumbing page prices the state permit that applies inside Louisville.
 *
 * Reading notes:
 *   - Building permits for new construction price by KBC occupancy type at a
 *     rate per square foot (Assembly $.16 ... Residential 1 & 2 Family $.105
 *     ... Utility/misc $.13); "No building permit fee calculated under this
 *     section shall be less than $75" (item 10) — the $75 minimum is modelled
 *     as a permit_minimum on the permit fee.
 *   - Work where square footage cannot be calculated: "$50 plus $2.50 per
 *     $1,000 of estimated cost" (item 3) — the alteration ladder.
 *   - Electrical amperage rows charge $.25 per ampere up to and including 600
 *     "and $.50 for each ampere over 600" — two complementary rate segments on
 *     the same amperage fact; the rate fraction is CENTS per ampere.
 *   - The $75/$100 work-cost rows read the job's work cost from
 *     `custom.work_cost_cents` (money in cents), the same convention the
 *     engine uses for `valuation`.
 *   - Plan review (min $30 or 1/3 the permit fee) applies to applications
 *     reviewed WITHOUT issuance of a building permit (item 5); an
 *     issuance-bound calculator that charged it would double-charge every
 *     permitted job, so the rule set names it and leaves it out.
 *
 * Verified: 2026-09-26.
 */

/** Promulgated schedule revision date (2/6/2024). */
export const LOU_FEE_EFFECTIVE_FROM = "2024-02-06";
/** 815 KAR 20:050 amendment effective date (48 Ky.R. 629; eff. 3-1-2022). */
export const KY_STATE_PLUMBING_EFFECTIVE_FROM = "2022-03-01";

export const LOU_BUILDING_SOURCE_KEY = "louisville-promulgated-fees";
export const LOU_ELECTRICAL_SOURCE_KEY = "louisville-promulgated-fees";
export const LOU_PLUMBING_SOURCE_KEY = "ky-division-plumbing-fees";

export const LOU_MINIMUM_PERMIT = 7_500; // item 10: no building permit fee below $75

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
    effectiveFrom: LOU_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/** The item-10 floor: charge the shortfall up to $75 on the permit fee. */
const louPermitMinimum = (sourceId: string, prefix: string): FeeRuleRecord =>
  rule(sourceId, {
    id: `${prefix}-minimum`,
    code: `${prefix.toUpperCase()}-MINIMUM-75`,
    label: "Permit minimum ($75.00)",
    description:
      "Promulgated fees, item 10: 'No building permit fee calculated under this section shall be less than $75.' Charged only when the permit's own fees fall short of $75.00 (the news release moving the minimum from $50.00 to $75.00 took effect 2018-07-01; the 2024 revision carries it).",
    componentType: "surcharge",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: LOU_MINIMUM_PERMIT },
    priority: 500,
  });

/** Per-square-foot rate row for one Kentucky Building Code occupancy type.
 *
 * Each row matches either the schedule's own occupancy phrase on
 * `custom.building_use`, or — when the reader gave no building use — a safe
 * default mapped from the occupancy class. The rate groups with no single
 * safe default (Educational, Restaurant, Storage, Utility and the other
 * $0.13-$0.16 uses) match only through `building_use`, because defaulting
 * them would guess between four printed rates.
 */
function sqFtRule(
  id: string,
  code: string,
  label: string,
  description: string,
  numerator: number,
  denominator: number,
  uses: string[],
  defaults: { occupancy: "residential" | "commercial" | "industrial"; extra?: object } | null,
): FeeRuleRecord {
  const branches: FeeCondition[] = [
    { field: "custom.building_use", op: "in", value: uses },
  ];
  if (defaults) {
    branches.push({
      all: [
        { field: "custom.building_use", op: "absent" },
        { field: "occupancy", op: "eq", value: defaults.occupancy },
        ...(defaults.extra ? [defaults.extra as FeeCondition] : []),
      ],
    });
  }
  return rule(LOU_BUILDING_SOURCE_KEY, {
    id,
    code,
    label,
    description,
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator, denominator },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [{ field: "square_footage", op: "gte", value: 1 }, { any: branches }],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Building & Tent                                                            */
/* -------------------------------------------------------------------------- */

export const LOU_BUILDING_RULES: FeeRuleRecord[] = [
  louPermitMinimum(LOU_BUILDING_SOURCE_KEY, "lou-bld"),

  // Item 1 table — fee per square foot by KBC occupancy type. Rate fractions
  // are CENTS per square foot: $0.105 = 105/100 cents.
  sqFtRule(
    "lou-bld-assembly",
    "LOU-BLD-ASSEMBLY",
    "Assembly ($0.16 per sq ft)",
    "Promulgated fees, item 1: Assembly occupancy, $.16 per square foot.",
    16,
    1,
    ["assembly"],
    null,
  ),
  sqFtRule(
    "lou-bld-high-hazard",
    "LOU-BLD-HIGH-HAZARD",
    "High hazard ($0.16 per sq ft)",
    "Promulgated fees, item 1: High hazard occupancy, $.16 per square foot.",
    16,
    1,
    ["high_hazard"],
    null,
  ),
  sqFtRule(
    "lou-bld-business",
    "LOU-BLD-BUSINESS",
    "Business or mercantile ($0.15 per sq ft)",
    "Promulgated fees, item 1: Business and Mercantile occupancies, $.15 per square foot each. This is the default commercial rate when no building use is named.",
    15,
    1,
    ["business", "mercantile"],
    { occupancy: "commercial" },
  ),
  sqFtRule(
    "lou-bld-factory",
    "LOU-BLD-FACTORY",
    "Factory ($0.15 per sq ft)",
    "Promulgated fees, item 1: Factory occupancy, $.15 per square foot. This is the default industrial rate when no building use is named.",
    15,
    1,
    ["factory"],
    { occupancy: "industrial" },
  ),
  sqFtRule(
    "lou-bld-institutional",
    "LOU-BLD-INSTITUTIONAL",
    "Institutional ($0.15 per sq ft)",
    "Promulgated fees, item 1: Institutional occupancy, $.15 per square foot.",
    15,
    1,
    ["institutional"],
    null,
  ),
  sqFtRule(
    "lou-bld-res-12",
    "LOU-BLD-RES-12FAM",
    "Residential 1 & 2 family ($0.105 per sq ft)",
    "Promulgated fees, item 1: Residential — 1 & 2 Family, $.105 per square foot. This is the default residential rate when no building use is named and the structure holds fewer than three dwelling units.",
    105,
    10,
    ["residential_12_family"],
    {
      occupancy: "residential",
      extra: {
        any: [
          { field: "units", op: "absent" },
          { field: "units", op: "lte", value: 2 },
        ],
      },
    },
  ),
  sqFtRule(
    "lou-bld-res-other",
    "LOU-BLD-RES-OTHER",
    "Residential — other, multi-family ($0.15 per sq ft)",
    "Promulgated fees, item 1: Residential — other, $.15 per square foot. Applied on the named use, or by default to a residential structure of three or more dwelling units.",
    15,
    1,
    ["residential_other", "apartments", "condominium"],
    {
      occupancy: "residential",
      extra: { field: "units", op: "gte", value: 3 },
    },
  ),
  sqFtRule(
    "lou-bld-storage",
    "LOU-BLD-STORAGE",
    "Storage ($0.14 per sq ft)",
    "Promulgated fees, item 1: Storage occupancy, $.14 per square foot.",
    14,
    1,
    ["storage"],
    null,
  ),
  sqFtRule(
    "lou-bld-utility",
    "LOU-BLD-UTILITY",
    "Utility; miscellaneous ($0.13 per sq ft)",
    "Promulgated fees, item 1: Utility; miscellaneous, $.13 per square foot.",
    13,
    1,
    ["utility"],
    null,
  ),

  // Item 3 — estimated-cost ladder for work without a calculable area.
  rule(LOU_BUILDING_SOURCE_KEY, {
    id: "lou-bld-est-cost-ladder",
    code: "LOU-BLD-ESTCOST",
    label: "Estimated-cost ladder ($50 + $2.50 per $1,000 of estimated cost)",
    description:
      "Promulgated fees, item 3: for partial alterations, structures other than buildings, or any work whose square feet cannot be calculated, the fee is $50 plus $2.50 per $1,000 of the estimated cost (verified by the Department). Applies when no square footage is given and an estimated cost is.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_000,
      thresholdCents: 100_000,
      centsPerThousand: 250,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "square_footage", op: "absent" },
        { field: "valuation", op: "exists" },
      ],
    },
  }),

  // Item 7 — foundation-only permits.
  rule(LOU_BUILDING_SOURCE_KEY, {
    id: "lou-bld-foundation-sfr",
    code: "LOU-BLD-FOUNDATION-SFR",
    label: "Foundation-only permit, single family dwellings and accessory structures ($75.00)",
    description:
      "Promulgated fees, item 7: foundation-only permit, $75.00 for single family dwellings and their accessory structures (fast-track elective).",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        { field: "custom.foundation_only", op: "eq", value: true },
        { field: "occupancy", op: "eq", value: "residential" },
      ],
    },
  }),
  rule(LOU_BUILDING_SOURCE_KEY, {
    id: "lou-bld-foundation-other",
    code: "LOU-BLD-FOUNDATION-OTHER",
    label: "Foundation-only permit, all other uses ($125.00)",
    description:
      "Promulgated fees, item 7: foundation-only permit, $125.00 for all uses other than single family dwellings and their accessory structures (fast-track elective).",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 12_500 },
    conditions: {
      all: [
        { field: "custom.foundation_only", op: "eq", value: true },
        { field: "occupancy", op: "neq", value: "residential" },
      ],
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical                                                                 */
/* -------------------------------------------------------------------------- */

/** $.50 per ampere over 600 A (threshold does the arithmetic). */
const AMPS_OVER_600: FeeRuleRecord["config"] = {
  basis: "amperage",
  rate: { numerator: 50, denominator: 1 },
  rateUnit: "currency_per_unit",
  thresholdCents: 600,
};

/**
 * The three-segment amperage family for one permit class: $.25 per ampere to
 * 600 (a rate with no threshold, gated on the service being at or under 600),
 * the first 600 amperes' own product ($150.00 = 600 × $.25, flat, over 600),
 * and $.50 per ampere over 600 (threshold 600). Together they charge exactly
 * what the schedule prints for any service size.
 */
function ampFamily(
  idPrefix: string,
  codePrefix: string,
  labelPrefix: string,
  itemRef: string,
  extraConditions: FeeCondition[],
): FeeRuleRecord[] {
  const gate = (op: "lte" | "gt", value: number): FeeCondition => ({
    all: [
      { field: "custom.amperage", op, value },
      ...extraConditions,
    ],
  });
  return [
    rule(LOU_ELECTRICAL_SOURCE_KEY, {
      id: `${idPrefix}-amps`,
      code: `${codePrefix}-AMPS`,
      label: `${labelPrefix} — service amperes, 600 A or less ($.25 per ampere)`,
      description: `${itemRef}: additionally $.25 for each ampere at the service entrance up to and including 600 amperes.`,
      componentType: "base",
      feeType: "percent",
      config: {
        basis: "amperage",
        rate: { numerator: 25, denominator: 1 },
        rateUnit: "currency_per_unit",
      },
      conditions: gate("lte", 600),
    }),
    rule(LOU_ELECTRICAL_SOURCE_KEY, {
      id: `${idPrefix}-amps-first600`,
      code: `${codePrefix}-AMPS-FIRST600`,
      label: `${labelPrefix} — the first 600 service amperes ($150.00 flat)`,
      description: `${itemRef}: the first 600 amperes price at $.25 each — $150.00 — when the service exceeds 600 amperes (the amperes over 600 price at $.50 on the companion row).`,
      componentType: "base",
      feeType: "flat",
      config: { amountCents: 15_000 },
      conditions: gate("gt", 600),
    }),
    rule(LOU_ELECTRICAL_SOURCE_KEY, {
      id: `${idPrefix}-amps-over`,
      code: `${codePrefix}-AMPS-OVER`,
      label: `${labelPrefix} — service amperes over 600 ($.50 per ampere)`,
      description: `${itemRef}: $.50 for each ampere over 600 amperes, charged on the amperes above the first 600.`,
      componentType: "base",
      feeType: "percent",
      config: AMPS_OVER_600,
      conditions: gate("gt", 600),
    }),
  ];
}

export const LOU_ELECTRICAL_RULES: FeeRuleRecord[] = [
  louPermitMinimum(LOU_ELECTRICAL_SOURCE_KEY, "lou-elec"),

  // Item 1 — initial installation, 1-2 family residence (new wiring).
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-init-sfr",
    code: "LOU-ELEC-INIT-SFR",
    label: "Initial installation, one- or two-family residence ($200.00)",
    description:
      "Promulgated fees, Electrical item 1: initial installation of electrical wiring in a one- or two-family residence, $200.00, including three inspections. Applies to new construction; service upgrades and repairs price on items 3 and 5.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 20_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.condo_or_patio", op: "absent" },
      ],
    },
  }),

  // Item 2 — condo / patio home: $150 base + amperage.
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-condo-base",
    code: "LOU-ELEC-CONDO-BASE",
    label: "Condominium or patio home base permit ($150.00)",
    description:
      "Promulgated fees, Electrical item 2: initial installation in a condominium or patio home residence/unit, $150.00 base, including three inspections.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 15_000 },
    conditions: {
      all: [
        { field: "custom.condo_or_patio", op: "eq", value: true },
        { field: "work_type", op: "eq", value: "new_construction" },
      ],
    },
  }),
  ...ampFamily(
    "lou-elec-condo",
    "LOU-ELEC-CONDO",
    "Condominium or patio home",
    "Promulgated fees, Electrical item 2",
    [{ field: "custom.condo_or_patio", op: "eq", value: true }],
  ),

  // Item 3 — service upgrade / repairs, residence classes, by work cost.
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-res-upgrade-small",
    code: "LOU-ELEC-UPGRADE-750",
    label: "Service upgrade, new service, repairs or additional wiring, work costing $750 or less ($75.00)",
    description:
      "Promulgated fees, Electrical item 3: service upgrade, new service, repairs or additional wiring in a one/two-family, condominium or patio home residence, $75.00 for work costing $750 or less, including one inspection.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        { field: "custom.work_cost_cents", op: "exists" },
        { field: "custom.work_cost_cents", op: "lte", value: 75_000 },
      ],
    },
  }),
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-res-upgrade-large",
    code: "LOU-ELEC-UPGRADE-750UP",
    label: "Service upgrade, new service, repairs or additional wiring, work costing over $750 ($100.00)",
    description:
      "Promulgated fees, Electrical item 3: same scope as the $75.00 row, $100.00 for work costing over $750, including one inspection.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: {
      all: [
        { field: "custom.work_cost_cents", op: "exists" },
        { field: "custom.work_cost_cents", op: "gt", value: 75_000 },
      ],
    },
  }),

  // Item 4 — other-than-residence new wiring: $100 base + $25/subpanel +
  // $25/dwelling unit + amperage.
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-comm-base",
    code: "LOU-ELEC-COMM-BASE",
    label: "New wiring other than a residence, base permit ($100.00)",
    description:
      "Promulgated fees, Electrical item 4: installation of new electrical wiring other than in a one/two-family, condominium or patio home residence, $100.00 base, including two inspections.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "custom.condo_or_patio", op: "absent" },
        { field: "custom.work_cost_cents", op: "absent" },
      ],
    },
  }),
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-comm-subpanels",
    code: "LOU-ELEC-COMM-SUBPANELS",
    label: "Subpanels on other-than-residence new wiring ($25.00 each)",
    description:
      "Promulgated fees, Electrical item 4: additionally $25.00 for each subpanel.",
    componentType: "base",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 2_500 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "custom.panels", op: "gte", value: 1 },
      ],
    },
  }),
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-comm-units",
    code: "LOU-ELEC-COMM-UNITS",
    label: "Dwelling units in a residential structure other than 1-2 family ($25.00 each)",
    description:
      "Promulgated fees, Electrical item 4: additionally $25.00 for each dwelling unit in a residential structure other than one- or two-family residences (multi-family wiring).",
    componentType: "base",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 2_500 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "units", op: "gte", value: 1 },
      ],
    },
  }),
  ...ampFamily(
    "lou-elec-comm",
    "LOU-ELEC-COMM",
    "Other-than-residence new wiring",
    "Promulgated fees, Electrical item 4",
    [
      { field: "occupancy", op: "neq", value: "residential" },
      { field: "custom.condo_or_patio", op: "absent" },
    ],
  ),

  // Item 6 — temporary pole.
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-temp-pole",
    code: "LOU-ELEC-TEMP-POLE",
    label: "Temporary pole ($85.00)",
    description:
      "Promulgated fees, Electrical item 6: installation of a temporary pole, $85.00, including one inspection.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 8_500 },
    conditions: { all: [{ field: "custom.temporary_service", op: "eq", value: true }] },
  }),

  // Item 7 — additional inspections.
  rule(LOU_ELECTRICAL_SOURCE_KEY, {
    id: "lou-elec-addl-inspection",
    code: "LOU-ELEC-ADDL-INSP",
    label: "Additional inspection beyond those included ($50.00 each)",
    description:
      "Promulgated fees, Electrical item 7: any additional inspections not covered by the initial permit fee, $50.00 each.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 5_000 },
    conditions: {
      all: [
        { field: "custom.additional_inspections", op: "gte", value: 1 },
      ],
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing — the STATE permit (815 KAR 20:050), which applies in Louisville  */
/* -------------------------------------------------------------------------- */

/** $14 per opening (residential 1-2 family) / $20 per opening (all others). */
function openingRule(
  id: string,
  code: string,
  label: string,
  description: string,
  centsPerUnit: number,
  unit: PerUnitKind,
  occupancyOp: "eq" | "neq",
): FeeRuleRecord {
  return rule(LOU_PLUMBING_SOURCE_KEY, {
    id,
    code,
    label,
    description,
    feeType: "per_unit",
    config: { unit, centsPerUnit },
    effectiveFrom: KY_STATE_PLUMBING_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "custom.openings", op: "gte", value: 1 },
        { field: "custom.water_heater_only", op: "absent" },
        { field: "occupancy", op: occupancyOp, value: "residential" },
      ],
    },
  });
}

export const LOU_PLUMBING_RULES: FeeRuleRecord[] = [
  // Section 4(1)/(2) — $50 base either way.
  rule(LOU_PLUMBING_SOURCE_KEY, {
    id: "lou-plumb-state-base",
    code: "KY-PL-BASE-50",
    label: "State plumbing permit base fee ($50.00)",
    description:
      "815 KAR 20:050 Section 4(1) and (2): the base fee for each plumbing permit is fifty dollars ($50.00) — residential one- and two-family units and all other buildings alike. Kentucky's Division of Plumbing (Department of Housing, Buildings and Construction) issues the permit; Louisville's own promulgated schedule has no plumbing section.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 5_000 },
    effectiveFrom: KY_STATE_PLUMBING_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "custom.water_heater_only", op: "absent" },
        { field: "custom.openings", op: "exists" },
      ],
    },
  }),

  // Section 3(a) — a single water heater replaced: the only fee is $50.
  rule(LOU_PLUMBING_SOURCE_KEY, {
    id: "lou-plumb-wh-only",
    code: "KY-PL-WH-ONLY",
    label: "Single water heater installed or replaced in a building ($50.00, the only fee)",
    description:
      "815 KAR 20:050 Section 3(a)/4(3)(a): if only one new domestic water heater is installed or replaced within a single building, the only fee for the plumbing permit is fifty dollars ($50.00) — no per-opening charges. When the flag is set the base rule and this row charge the same $50.00 once (this row is the documented basis; the base rule is excluded by its condition).",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 5_000 },
    effectiveFrom: KY_STATE_PLUMBING_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "custom.water_heater_only", op: "eq", value: true },
      ],
    },
  }),

  // Section 4(1) — $14 per opening, residential 1-2 family.
  openingRule(
    "lou-plumb-openings-res",
    "KY-PL-OPENING-RES-14",
    "Residential openings ($14.00 each: fixtures, appliances, openings, water heaters, extra meters)",
    "815 KAR 20:050 Section 4(1): fifty dollars plus fourteen dollars ($14.00) for each plumbing fixture, appliance, or opening left for a fixture or appliance in the soil or waste pipe system, each domestic water heater, and each separately metered water and sewer service beyond the first — residential one- and two-family units.",
    1_400,
    "openings",
    "eq",
  ),

  // Section 4(2) — $20 per opening, all other buildings.
  openingRule(
    "lou-plumb-openings-comm",
    "KY-PL-OPENING-COMM-20",
    "Commercial openings ($20.00 each: fixtures, appliances, openings, water heaters, conductors, extra meters)",
    "815 KAR 20:050 Section 4(2): fifty dollars plus twenty dollars ($20.00) for each plumbing fixture, appliance, or opening left for a fixture or appliance, each domestic water heater, each conductor opening, and each separately metered water and sewer service beyond the first — buildings other than residential one- and two-family units.",
    2_000,
    "openings",
    "neq",
  ),

  // Section 5(2) — additional inspection $50 (not charged when the permit fee
  // exceeds $250; the exclusion is priced into the reader guidance, the rule
  // models the printed row).
  rule(LOU_PLUMBING_SOURCE_KEY, {
    id: "lou-plumb-addl-inspection",
    code: "KY-PL-ADDL-INSP-50",
    label: "Additional state plumbing inspection ($50.00 each)",
    description:
      "815 KAR 20:050 Section 5(2): the fee for an additional inspection beyond the five included is fifty dollars ($50.00), paid before the final inspection. Section 5(3): additional inspection fees do not apply if the cost of the plumbing permit exceeds $250.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 5_000 },
    effectiveFrom: KY_STATE_PLUMBING_EFFECTIVE_FROM,
    conditions: { all: [{ field: "custom.additional_inspections", op: "gte", value: 1 }] },
  }),
];
