import type { FeeCondition, FeeRuleRecord, PerUnitKind } from "@/lib/calc/types";

/**
 * Lexington-Fayette Urban County Government, Kentucky fee rules — REAL DATA.
 *
 * Sources (research/kentucky/lexington.md):
 *   - LFUCG Division of Building Inspection "2021 Fee Schedule" PDF (revised
 *     10/27/21; fees EFFECTIVE JULY 1, 2019 per the document header):
 *     content.lexingtonky.gov/sites/default/files/2024-11/2021%20Fee%20Schedule.pdf
 *     Commercial and Residential Sections, Other Services, HVAC/Mechanical,
 *     Fire Detection and Sprinklers. The plumbing and electrical trade fees
 *     are NOT in the schedule: plumbing is permitted by Kentucky's state
 *     Division of Plumbing (the commercial-construction page routes it to the
 *     State Inspector), and electrical permits cost "$10 each" per the
 *     electrical-permits page.
 *   - 815 KAR 20:050 (Kentucky state plumbing permit fees) — the state permit
 *     that applies inside Lexington.
 *
 * Reading notes:
 *   - Rates printed "090 X Sq. Ft." and ".062" are DOLLARS per square foot
 *     without the decimal point: Educational $.090, Office $.062, and so on.
 *     The rate fraction is CENTS per square foot ($0.62 = {62, 1}).
 *   - "Min." applies to the per-square-foot portion, BEFORE the printed adder
 *     ($.175 Office, $180 residential single-family, $100/unit multi-family):
 *     each base rate row carries its own rule-level minimumCents and the
 *     adders are separate rules.
 *   - Residential remodel, additions and accessory buildings all print
 *     ".10 X Sq. Ft. (Min. $150)", the same rate as new single-family work,
 *     so one residential rate rule covers every work type.
 *   - Plan review is a schedule line charged at submittal (commercial $.06 per
 *     sq ft min $50; residential $25 flat) — included, unlike Louisville's
 *     review-without-issuance fee, because Lexington's schedule states it as
 *     a fee that is always charged.
 *
 * Verified: 2026-09-26.
 */

export const LEX_FEE_EFFECTIVE_FROM = "2019-07-01";
/** 815 KAR 20:050 amendment effective date (48 Ky.R. 629; eff. 3-1-2022). */
export const KY_STATE_PLUMBING_EFFECTIVE_FROM = "2022-03-01";
/** Electrical permit page (the $10 fee lives there, not in the schedule PDF). */
export const LEX_ELEC_EFFECTIVE_FROM = "2019-07-01";

export const LEX_BUILDING_SOURCE_KEY = "lexington-fee-schedule";
export const LEX_ELECTRICAL_SOURCE_KEY = "lexington-electrical-page";
export const LEX_PLUMBING_SOURCE_KEY = "ky-division-plumbing-fees";

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
    effectiveFrom: LEX_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/** Per-square-foot rate row keyed on the schedule's own occupancy phrase. */
function sqFtRule(
  id: string,
  code: string,
  label: string,
  description: string,
  numerator: number,
  denominator: number,
  minimumCents: number | null,
  uses: string[],
  defaults: { occupancy: "residential" | "commercial" | "industrial"; extra?: FeeCondition } | null,
  workTypes?: string[],
): FeeRuleRecord {
  const branches: FeeCondition[] = [
    { field: "custom.building_use", op: "in", value: uses },
  ];
  if (defaults) {
    branches.push({
      all: [
        { field: "custom.building_use", op: "absent" },
        { field: "occupancy", op: "eq", value: defaults.occupancy },
        ...(defaults.extra ? [defaults.extra] : []),
      ],
    });
  }
  return rule(LEX_BUILDING_SOURCE_KEY, {
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
    minimumCents,
    conditions: {
      all: [
        { field: "square_footage", op: "gte", value: 1 },
        { any: branches },
        ...(workTypes ? [{ field: "work_type", op: "in", value: workTypes } as FeeCondition] : []),
      ],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Building — Residential Section then Commercial Section                      */
/* -------------------------------------------------------------------------- */

export const LEX_BUILDING_RULES: FeeRuleRecord[] = [
  // Residential rate: SFR, Duplex/Townhouse, Apartments/Condos, Remodeling,
  // Additions and Accessory Buildings all print ".10 X Sq. Ft. (Min. $150)".
  sqFtRule(
    "lex-bld-res-rate",
    "LEX-BLD-RES-10",
    "Residential construction ($.10 per sq ft, $150 minimum)",
    "Fee Schedule, Residential Section: Single Family Residence, Duplex/Townhouse, Apartments/Condos, Remodeling (includes finishing basements), Additions (attached garages, decks, dormers) and Accessory Buildings (detached garages, sheds) are each $.10 per square foot with a $150.00 minimum on the area portion. The new-dwelling adder ($180.00 flat, or $100.00 per unit) prices separately.",
    10,
    1,
    15_000,
    ["residential_12_family", "residential_other", "apartments", "condominium", "duplex", "townhouse"],
    { occupancy: "residential" },
  ),

  // New-dwelling adders: $180 flat for a single residence; $100 per unit for
  // Duplex/Townhouse and Apartments/Condos ("+ $100/Unit").
  rule(LEX_BUILDING_SOURCE_KEY, {
    id: "lex-bld-res-adder-flat",
    code: "LEX-BLD-RES-ADDER-180",
    label: "Single Family Residence adder ($180.00)",
    description:
      "Fee Schedule, Residential Section: Single Family Residence is '.10 X Sq. Ft. (Min. $150) + $180'. Applied when no dwelling-unit count is given (a single residence).",
    feeType: "flat",
    config: { amountCents: 18_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "square_footage", op: "gte", value: 1 },
        { field: "units", op: "absent" },
      ],
    },
  }),
  rule(LEX_BUILDING_SOURCE_KEY, {
    id: "lex-bld-res-adder-unit",
    code: "LEX-BLD-RES-ADDER-UNIT",
    label: "Duplex, townhouse, apartment or condo adder ($100.00 per dwelling unit)",
    description:
      "Fee Schedule, Residential Section: Duplex/Townhouse and Apartments/Condos are '.10 X Sq. Ft. (Min. $150) + $100/Unit'.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 10_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "units", op: "gte", value: 1 },
      ],
    },
  }),

  // Commercial Section — new buildings and additions, by use. The residential
  // defaults cover the merged rows; commercial rows keyed by building use,
  // with "All Other Commercial" as the default when no use is named.
  sqFtRule(
    "lex-bld-comm-educational",
    "LEX-BLD-EDU",
    "Educational facility ($.90 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: Educational Facility, .090 X Sq. Ft. (Min. $250).",
    90,
    1,
    25_000,
    ["educational"],
    null,
    ["new_construction", "addition"],
  ),
  sqFtRule(
    "lex-bld-comm-restaurant",
    "LEX-BLD-RESTAURANT",
    "Restaurant ($.90 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: Restaurant, .090 X Sq. Ft. (Min. $250) + .252 X Sq. Ft. (the adder prices on the companion row).",
    90,
    1,
    25_000,
    ["restaurant"],
    null,
    ["new_construction", "addition"],
  ),
  sqFtRule(
    "lex-bld-comm-office",
    "LEX-BLD-OFFICE",
    "Office building ($.62 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: Office Building, .062 X Sq. Ft. (Min. $250) + .175 X Sq. Ft. (the adder prices on the companion row).",
    62,
    1,
    25_000,
    ["office"],
    null,
    ["new_construction", "addition"],
  ),
  sqFtRule(
    "lex-bld-comm-retail",
    "LEX-BLD-RETAIL",
    "Retail sales ($.42 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: Retail Sales, .042 X Sq. Ft. (Min. $250) + .119 X Sq. Ft. (the adder prices on the companion row).",
    42,
    1,
    25_000,
    ["retail"],
    null,
    ["new_construction", "addition"],
  ),
  sqFtRule(
    "lex-bld-comm-warehouse",
    "LEX-BLD-WAREHOUSE",
    "Warehouse ($.28 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: Warehouse, .028 X Sq. Ft. (Min. $250) + .077 X Sq. Ft. (the adder prices on the companion row). The default industrial rate when no building use is named.",
    28,
    1,
    25_000,
    ["warehouse"],
    { occupancy: "industrial" },
    ["new_construction", "addition"],
  ),
  sqFtRule(
    "lex-bld-comm-hotel",
    "LEX-BLD-HOTEL",
    "Hotel or motel ($.68 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: Hotel/Motel, .068 X Sq. Ft. (Min. $250) + .189 X Sq. Ft. (the adder prices on the companion row).",
    68,
    1,
    25_000,
    ["hotel", "motel"],
    null,
    ["new_construction", "addition"],
  ),
  sqFtRule(
    "lex-bld-comm-canopies",
    "LEX-BLD-CANOPIES",
    "Canopies ($.42 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: Canopies, .042 X Sq. Ft. (Min. $250) + .119 X Sq. Ft. (the adder prices on the companion row).",
    42,
    1,
    25_000,
    ["canopies"],
    null,
    ["new_construction", "addition"],
  ),
  sqFtRule(
    "lex-bld-comm-all-other",
    "LEX-BLD-ALL-OTHER",
    "All other commercial, including churches and nursing homes ($.42 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: All Other Commercial (Including Churches & Nursing Homes), .042 X Sq. Ft. (Min. $250) + .119 X Sq. Ft. (the adder prices on the companion row). The default commercial rate when no building use is named.",
    42,
    1,
    25_000,
    ["business", "mercantile", "office_other", "church", "nursing_home", "all_other"],
    { occupancy: "commercial" },
    ["new_construction", "addition"],
  ),

  // The printed second adders ("+ .119 X Sq. Ft." etc.) as their own rules.
  adderSqFtRule(
    "lex-bld-adder-restaurant",
    "LEX-BLD-ADD-RESTAURANT",
    "Restaurant additional-cost adder ($.252 per sq ft)",
    "Fee Schedule, Commercial Section, Restaurant: '+ .252 X Sq. Ft.' — the additional-cost portion charged on top of the base restaurant rate.",
    252,
    10,
    ["restaurant"],
  ),
  adderSqFtRule(
    "lex-bld-adder-office",
    "LEX-BLD-ADD-OFFICE",
    "Office building additional-cost adder ($.175 per sq ft)",
    "Fee Schedule, Commercial Section, Office Building: '+ .175 X Sq. Ft.' — the additional-cost portion charged on top of the base office rate.",
    175,
    10,
    ["office"],
  ),
  adderSqFtRule(
    "lex-bld-adder-retail",
    "LEX-BLD-ADD-RETAIL",
    "Retail sales additional-cost adder ($.119 per sq ft)",
    "Fee Schedule, Commercial Section, Retail Sales: '+ .119 X Sq. Ft.' — the additional-cost portion charged on top of the base retail rate.",
    119,
    10,
    ["retail"],
  ),
  adderSqFtRule(
    "lex-bld-adder-warehouse",
    "LEX-BLD-ADD-WAREHOUSE",
    "Warehouse additional-cost adder ($.077 per sq ft)",
    "Fee Schedule, Commercial Section, Warehouse: '+ .077 X Sq. Ft.' — the additional-cost portion charged on top of the base warehouse rate.",
    77,
    10,
    ["warehouse"],
  ),
  adderSqFtRule(
    "lex-bld-adder-hotel",
    "LEX-BLD-ADD-HOTEL",
    "Hotel/motel additional-cost adder ($.189 per sq ft)",
    "Fee Schedule, Commercial Section, Hotel/Motel: '+ .189 X Sq. Ft.' — the additional-cost portion charged on top of the base hotel/motel rate.",
    189,
    10,
    ["hotel", "motel"],
  ),
  adderSqFtRule(
    "lex-bld-adder-all-other",
    "LEX-BLD-ADD-ALL-OTHER",
    "All other commercial additional-cost adder ($.119 per sq ft)",
    "Fee Schedule, Commercial Section, All Other Commercial: '+ .119 X Sq. Ft.' — the additional-cost portion charged on top of the base rate.",
    119,
    10,
    ["business", "mercantile", "office_other", "church", "nursing_home", "all_other"],
  ),

  // Commercial remodeling is its own row: $.10 per sq ft, min $250.
  sqFtRule(
    "lex-bld-comm-remodel",
    "LEX-BLD-COMM-REMODEL",
    "Commercial remodeling ($.10 per sq ft, $250 minimum)",
    "Fee Schedule, Commercial Section: Remodeling, Commercial, .10 X Sq. Ft. (Min. $250). Applies to remodels and alterations of commercial space.",
    10,
    1,
    25_000,
    ["business", "mercantile", "office", "retail", "warehouse", "restaurant", "hotel", "motel", "educational", "canopies", "church", "nursing_home", "all_other"],
    { occupancy: "commercial" },
    ["remodel", "alteration", "other"],
  ),

  // Plan review — a schedule line charged at submittal.
  rule(LEX_BUILDING_SOURCE_KEY, {
    id: "lex-bld-plan-review-comm",
    code: "LEX-BLD-PR-COMM",
    label: "Commercial plan review ($.06 per sq ft, $50 minimum)",
    description:
      "Fee Schedule, Commercial Section: 'Commercial Plan Review Fee — 06 X Sq. Ft. (Min. $50)', charged on reviewed commercial applications.",
    componentType: "plan_review",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 6, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    minimumCents: 5_000,
    conditions: {
      all: [
        { field: "square_footage", op: "gte", value: 1 },
        { field: "occupancy", op: "neq", value: "residential" },
      ],
    },
    priority: 200,
  }),
  rule(LEX_BUILDING_SOURCE_KEY, {
    id: "lex-bld-plan-review-res",
    code: "LEX-BLD-PR-RES",
    label: "Residential plan review ($25.00, required at plan submittal)",
    description:
      "Fee Schedule, Residential Section: 'Residential Plan Review Fee (Required at time of plan submittal) — $25'.",
    componentType: "plan_review",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: { all: [{ field: "occupancy", op: "eq", value: "residential" }] },
    priority: 200,
  }),
];

/** A printed "+ rate X Sq. Ft." adder keyed to the same uses as its base row. */
function adderSqFtRule(
  id: string,
  code: string,
  label: string,
  description: string,
  numerator: number,
  denominator: number,
  uses: string[],
): FeeRuleRecord {
  return rule(LEX_BUILDING_SOURCE_KEY, {
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
      all: [
        { field: "square_footage", op: "gte", value: 1 },
        { field: "custom.building_use", op: "in", value: uses },
      ],
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Electrical — LFUCG permit $10 flat (page-sourced)                           */
/* -------------------------------------------------------------------------- */

export const LEX_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(LEX_ELECTRICAL_SOURCE_KEY, {
    id: "lex-elec-permit",
    code: "LEX-ELEC-PERMIT-10",
    label: "Electrical permit ($10.00 each)",
    description:
      "lexingtonky.gov — Electrical permits, licensing and inspections: 'Electrical permits cost $10 each.' Issued by LFUCG Building Inspection to state-licensed master electricians (or their employers) with an LFUCG business license; homeowners may pull a permit for their own residence. Inspections are performed and priced separately by the Commonwealth Inspection Bureau.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 1_000 },
    effectiveFrom: LEX_ELEC_EFFECTIVE_FROM,
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing — the STATE permit (815 KAR 20:050), which applies in Lexington   */
/* -------------------------------------------------------------------------- */

export const LEX_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(LEX_PLUMBING_SOURCE_KEY, {
    id: "lex-plumb-state-base",
    code: "KY-PL-BASE-50",
    label: "State plumbing permit base fee ($50.00)",
    description:
      "815 KAR 20:050 Section 4(1) and (2): the base fee for each plumbing permit is fifty dollars ($50.00). Kentucky's Division of Plumbing (Department of Housing, Buildings and Construction) issues the permit — LFUCG's fee schedule has no plumbing section, and the commercial-construction page routes plumbing permits to the State Inspector.",
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

  rule(LEX_PLUMBING_SOURCE_KEY, {
    id: "lex-plumb-wh-only",
    code: "KY-PL-WH-ONLY",
    label: "Single water heater installed or replaced in a building ($50.00, the only fee)",
    description:
      "815 KAR 20:050 Section 4(3)(a): if only one new domestic water heater is installed or replaced within a single building, the only fee for the plumbing permit is fifty dollars ($50.00) — no per-opening charges.",
    componentType: "base",
    feeType: "flat",
    config: { amountCents: 5_000 },
    effectiveFrom: KY_STATE_PLUMBING_EFFECTIVE_FROM,
    conditions: { all: [{ field: "custom.water_heater_only", op: "eq", value: true }] },
  }),

  // Section 4(1) — $14 per opening, residential 1-2 family.
  openingRule(
    "lex-plumb-openings-res",
    "KY-PL-OPENING-RES-14",
    "Residential openings ($14.00 each: fixtures, appliances, openings, water heaters, extra meters)",
    "815 KAR 20:050 Section 4(1): fifty dollars plus fourteen dollars ($14.00) for each plumbing fixture, appliance, or opening left for a fixture or appliance in the soil or waste pipe system, each domestic water heater, and each separately metered water and sewer service beyond the first — residential one- and two-family units.",
    1_400,
    "openings",
    "eq",
  ),

  // Section 4(2) — $20 per opening, all other buildings.
  openingRule(
    "lex-plumb-openings-comm",
    "KY-PL-OPENING-COMM-20",
    "Commercial openings ($20.00 each: fixtures, appliances, openings, water heaters, conductors, extra meters)",
    "815 KAR 20:050 Section 4(2): fifty dollars plus twenty dollars ($20.00) for each plumbing fixture, appliance, or opening left for a fixture or appliance, each domestic water heater, each conductor opening, and each separately metered water and sewer service beyond the first — buildings other than residential one- and two-family units.",
    2_000,
    "openings",
    "neq",
  ),

  rule(LEX_PLUMBING_SOURCE_KEY, {
    id: "lex-plumb-addl-inspection",
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

function openingRule(
  id: string,
  code: string,
  label: string,
  description: string,
  centsPerUnit: number,
  unit: PerUnitKind,
  occupancyOp: "eq" | "neq",
): FeeRuleRecord {
  return rule(LEX_PLUMBING_SOURCE_KEY, {
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
