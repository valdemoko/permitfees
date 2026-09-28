import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Meridian, Idaho fee rules — REAL DATA.
 *
 * Sources (research/idaho/meridian.md):
 *   - City Fees Schedule portal (apps.meridiancity.org/CITYFEEWEB), Building
 *     sections 1.1-1.4 under Resolution 18-2110 (amended by 20-2230 and
 *     20-2234); retrieved through the browser (the portal blocks plain HTTP
 *     agents) and cross-checked against the city's own fee-calculation
 *     worksheets.
 *   - Residential Fee Calculation Worksheet (6-1-2026) formulas:
 *       building fee = (livable sq ft × $94.06 for new/rebuild, + garage
 *       sq ft × $36.91, + shed/patio sq ft × $16) then ÷1,000 × $5.50 + $50.
 *   - New Commercial Fee Calculation Worksheet (6-1-2026) formulas:
 *       building fee = $50 + 5.5 × (value/1000); commercial plan review =
 *       65% of the building fee; fire plan review = 30%.
 *
 * Engine notes:
 *   - One building formula for everything: $50 base + $5.50 per $1,000 of
 *     project value or fraction thereof — modelled as one per_thousand rule.
 *   - The valuation-per-sq-ft rows ($94.06 living, $72 additions, $36.91
 *     garages, $16 patios/sheds) are valuation guidance, not fees; the page
 *     prose documents them and the calculator takes project value.
 *   - Commercial plan check 65% of the permit fee (portal row + worksheet).
 *
 * Verified: 2026-09-26.
 */

export const MER_FEE_EFFECTIVE_FROM = "2018-11-27"; // Resolution 18-2110 adoption

export const MER_BUILDING_SOURCE_KEY = "meridian-city-fees-schedule";
export const MER_ELECTRICAL_SOURCE_KEY = "meridian-city-fees-schedule";
export const MER_PLUMBING_SOURCE_KEY = "meridian-city-fees-schedule";

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
    effectiveFrom: MER_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building — section 1.1                                                      */
/* -------------------------------------------------------------------------- */

export const MER_BUILDING_RULES: FeeRuleRecord[] = [
  // The Residential/Commercial Permit Fee Calculation Formula.
  rule(MER_BUILDING_SOURCE_KEY, {
    id: "mer-bld-formula",
    code: "MER-BLD-FORMULA",
    label: "Building permit fee ($50.00 base + $5.50 per $1,000 of project value or fraction)",
    description:
      "Residential/Commercial Permit Fee Calculation Formula (Res. 18-2110, sec. 1.1): $50 base fee plus $5.50 additional for each $1,000 of project value or fraction thereof. Project value derives from the schedule's per-square-foot valuation guidance ($94.06/sq ft living area per the BVD table, $72 additions, $36.91 garages, $16 covered patios and storage sheds) or the applicant's stated project value.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_000,
      thresholdCents: 100_000,
      centsPerThousand: 550,
      incrementCents: 100_000,
    },
    conditions: {
      all: [{ field: "valuation", op: "gte", value: 100_000 }],
    },
  }),
  // Schedule rounds any valuation above $1,000 up to the next $1,000 band,
  // including the first band's fraction. The per_thousand base covers the
  // first $1,000, so a $1,001 valuation buys two $5.50 increments ($61) —
  // the extra fractional band is a schedule rounding that the single
  // per_thousand row (threshold $1,000) cannot express alone.
  rule(MER_BUILDING_SOURCE_KEY, {
    id: "mer-bld-formula-extra",
    code: "MER-BLD-FORMULA-EXTRA",
    label: "Building permit fractional band rounding ($5.50)",
    description:
      "Covers the schedule's 'or fraction thereof' rounding for the first $1,000 fraction — a valuation with any remainder above an even $1,000 buys the next band.",
    feeType: "flat",
    config: { amountCents: 550 },
    conditions: { all: [{ field: "valuation", op: "gt", value: 100_000 }] },
  }),

  // Commercial plan check: 65% of the building permit fee.
  rule(MER_BUILDING_SOURCE_KEY, {
    id: "mer-bld-plan-check",
    code: "MER-BLD-PLAN-CHECK",
    label: "Commercial plan check fee (65% of the building permit fee)",
    description:
      "Building Structural Fees, sec. 1.1: Commercial Plan Check fee, 65% of the Building Permit Fee (non-refundable; applied to the permit).",
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

  // Demo fee $50.
  rule(MER_BUILDING_SOURCE_KEY, {
    id: "mer-bld-demo",
    code: "MER-BLD-DEMO-50",
    label: "Demolition permit fee ($50.00)",
    description:
      "Building Structural Fees, sec. 1.1: Demo Fee, residential/commercial accounts, $50.00.",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: {
      all: [
        { field: "work_type", op: "eq", value: "demolition" },
        { field: "valuation", op: "absent" },
      ],
    },
  }),

  // Re-inspection fee $45.
  rule(MER_BUILDING_SOURCE_KEY, {
    id: "mer-bld-reinspect",
    code: "MER-BLD-REINSPECT",
    label: "Re-inspection fee ($45.00)",
    description:
      "Building Structural Fees, sec. 1.1: Re-Inspection Fees, residential/commercial accounts, $45.00.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 4_500 },
    conditions: {
      all: [{ field: "custom.reinspections", op: "gte", value: 1 }],
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical — section 1.2                                                    */
/* -------------------------------------------------------------------------- */

export const MER_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // New residential by service size.
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-new-res-200",
    code: "MER-ELEC-NEW-200",
    label: "New residential, up to and including 200 amp service ($120.00)",
    description:
      "Building Electrical Fees, sec. 1.2, New Residential a: up to and including 200 amp service, single family dwelling (includes everything contained within the residential structure and attached garage, all wired at the same time) — $120.00.",
    feeType: "flat",
    config: { amountCents: 12_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "custom.new_residential_wiring", op: "eq", value: true },
        {
          any: [
            { field: "custom.amperage", op: "absent" },
            { field: "custom.amperage", op: "lte", value: 200 },
          ],
        },
      ],
    },
  }),
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-new-res-400",
    code: "MER-ELEC-NEW-400",
    label: "New residential, 201-400 amp service ($210.00)",
    description:
      "Building Electrical Fees, sec. 1.2, New Residential b: 201 amp service up to 400 amps, single family dwelling — $210.00.",
    feeType: "flat",
    config: { amountCents: 21_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "custom.new_residential_wiring", op: "eq", value: true },
        { field: "custom.amperage", op: "gt", value: 200 },
        { field: "custom.amperage", op: "lte", value: 400 },
      ],
    },
  }),

  // Existing residential: $40 + $10 per branch circuit.
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-existing-base",
    code: "MER-ELEC-EXIST-BASE",
    label: "Existing residential permit fee ($40.00)",
    description:
      "Building Electrical Fees, sec. 1.2, Existing Residential: $40 permit fee plus $10 for each branch circuit.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "custom.existing_residential_wiring", op: "eq", value: true },
        { field: "custom.circuits", op: "gte", value: 1 },
      ],
    },
  }),
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-existing-circuits",
    code: "MER-ELEC-EXIST-CIRC",
    label: "Existing residential branch circuits ($10.00 each)",
    description:
      "Building Electrical Fees, sec. 1.2, Existing Residential: $10 for each branch circuit, added to the $40 permit fee.",
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 1_000 },
    conditions: {
      all: [
        { field: "custom.existing_residential_wiring", op: "eq", value: true },
        { field: "custom.circuits", op: "gte", value: 1 },
      ],
    },
  }),

  // Multi-family: duplex flat; 3+ units $120 per building + $60 per unit.
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-duplex",
    code: "MER-ELEC-DUPLEX",
    label: "Multi-family dwellings — duplexes ($210.00)",
    description:
      "Building Electrical Fees, sec. 1.2, Multi-family Dwellings — Duplexes: $210.00.",
    feeType: "flat",
    config: { amountCents: 21_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "units", op: "eq", value: 2 },
      ],
    },
  }),
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-multifam-building",
    code: "MER-ELEC-MF-BLDG",
    label: "Multi-family, three or more units — per building ($120.00)",
    description:
      "Building Electrical Fees, sec. 1.2, Multi-family Dwellings: three (3) or more multi-family units — $120 per building plus $60 per unit (the per-building row charges once; the companion row charges the units).",
    feeType: "flat",
    config: { amountCents: 12_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "units", op: "gte", value: 3 },
      ],
    },
  }),
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-multifam-units",
    code: "MER-ELEC-MF-UNITS",
    label: "Multi-family, three or more units — per unit ($60.00 each)",
    description:
      "Building Electrical Fees, sec. 1.2: $60 per unit for buildings with three or more multi-family units.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 6_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "units", op: "gte", value: 3 },
      ],
    },
  }),

  // Hot tubs, pools, spas; ground grid.
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-hot-tub",
    code: "MER-ELEC-POOL-40",
    label: "Hot tubs, swimming pools and other spas ($40.00)",
    description:
      "Building Electrical Fees, sec. 1.2: Hot Tubs, Swimming Pools, and other spas — $40.00.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [
        {
          any: [
            { field: "custom.hot_tub", op: "eq", value: true },
            { field: "custom.swimming_pool", op: "eq", value: true },
          ],
        },
      ],
    },
  }),
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-ground-grid",
    code: "MER-ELEC-GRID",
    label: "Ground grid ($40.00)",
    description:
      "Building Electrical Fees, sec. 1.2: Ground Grid — $40.00.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [{ field: "custom.ground_grid", op: "eq", value: true }],
    },
  }),

  // Temporary power pole, residential 200 A or less (Res. 20-2230).
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-temp-pole",
    code: "MER-ELEC-TEMP-POLE",
    label: "Temporary power pole, residential 200 amps or less ($40.00)",
    description:
      "Building Electrical Fees, sec. 1.2 (Res. 20-2230): temporary power poles/construction services, residential 200 amps or less, one location — $40.00. Every temporary power pole must be called in for inspection; Idaho Power will not set the meter until the pole passes city inspection. Residential over 200 amps and all commercial construction price from the commercial fee schedule.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [
        { field: "custom.temporary_service", op: "eq", value: true },
        { field: "occupancy", op: "eq", value: "residential" },
        {
          any: [
            { field: "custom.amperage", op: "absent" },
            { field: "custom.amperage", op: "lte", value: 200 },
          ],
        },
      ],
    },
  }),

  // Commercial/industrial by total wiring cost: three segments.
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-comm-2k",
    code: "MER-ELEC-COMM-2K",
    label: "Commercial wiring cost to $2,000 ($40.00 + 2.5% of total wiring cost)",
    description:
      "Building Electrical Fees, sec. 1.2, Commercial, Industrial, and other permit fees a: wiring costs not exceeding $2,000.00 — $40 plus 2.5% of total wiring cost. Applies to all installations not specifically listed above (lawn sprinklers, limited energy, etc.); total wiring cost is all labor and material to install the wiring system.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 250, baseCents: 4_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "exists" },
        { field: "valuation", op: "lte", value: 200_000 },
      ],
    },
  }),
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-comm-10k",
    code: "MER-ELEC-COMM-10K",
    label: "Commercial wiring cost $2,001-$10,000 ($100.00 + 1% of total wiring cost)",
    description:
      "Building Electrical Fees, sec. 1.2, Commercial, Industrial, and other permit fees b: wiring costs over $2,000 not exceeding $10,000.00 — $100 plus 1% of total wiring cost.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 100, baseCents: 10_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "gt", value: 200_000 },
        { field: "valuation", op: "lte", value: 6_000_000 },
      ],
    },
  }),
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-comm-10kup",
    code: "MER-ELEC-COMM-10KUP",
    label: "Commercial wiring cost over $10,000 ($180.00 + ½ of 1% of the portion over $10,000)",
    description:
      "Building Electrical Fees, sec. 1.2, Commercial, Industrial, and other permit fees c: wiring cost over $10,000.00 — $180 plus ½ of 1% (0.5%) of that portion of the wiring cost over $10,000.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 50, baseCents: 18_000, thresholdCents: 1_000_000 },
    conditions: {
      all: [
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "valuation", op: "gt", value: 6_000_000 },
      ],
    },
  }),

  // Electrical re-inspection $45; double fee for unpermitted work.
  rule(MER_ELECTRICAL_SOURCE_KEY, {
    id: "mer-elec-reinspect",
    code: "MER-ELEC-REINSPECT",
    label: "Electrical re-inspection fee ($45.00)",
    description:
      "Building Electrical Fees, sec. 1.2: Re-Inspection Fee $45.00; work constructed without a permit — double permit fees will be the minimum charge assessed.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 4_500 },
    conditions: {
      all: [{ field: "custom.reinspections", op: "gte", value: 1 }],
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing — section 1.4                                                      */
/* -------------------------------------------------------------------------- */

export const MER_PLUMBING_RULES: FeeRuleRecord[] = [
  // Per-living-unit permit fee.
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-living-unit",
    code: "MER-PL-UNIT-30",
    label: "Plumbing permit per living unit ($30.00 each)",
    description:
      "Building Plumbing Fees, sec. 1.4, Permit fee (each living unit): each single family dwelling, or living unit in an apartment, condominium, townhouse or other multiple unit — $30.00.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 3_000 },
    conditions: {
      all: [{ field: "units", op: "gte", value: 1 }],
    },
  }),

  // Per fixture $8; replacement per fixture $8; backflow device $8.
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-fixtures",
    code: "MER-PL-FIXTURE-8",
    label: "Plumbing fixtures ($8.00 each)",
    description:
      "Building Plumbing Fees, sec. 1.4, Permit fee (each living unit): per fixture $8.00; replacement per fixture $8.00.",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 800 },
    conditions: {
      all: [{ field: "fixtures", op: "gte", value: 1 }],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-backflow",
    code: "MER-PL-BACKFLOW-8",
    label: "Backflow devices ($8.00 each)",
    description:
      "Building Plumbing Fees, sec. 1.4, Permit fee (each living unit): backflow device $8.00.",
    feeType: "per_unit",
    config: { unit: "backflow_devices", centsPerUnit: 800 },
    conditions: {
      all: [{ field: "custom.backflow_devices", op: "gte", value: 1 }],
    },
  }),

  // Flat service rows.
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-water-conditioner",
    code: "MER-PL-COND-30",
    label: "Water conditioner ($30.00, plus $8.00 per additional unit)",
    description:
      "Building Plumbing Fees, sec. 1.4: Water Conditioners $30.00; water conditioner additional per unit fee $8.00.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [{ field: "custom.water_conditioner", op: "eq", value: true }],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-fixture-replacement",
    code: "MER-PL-FIX-REPL",
    label: "Fixture replacement permit ($30.00)",
    description:
      "Building Plumbing Fees, sec. 1.4: fixture replacement permit fee $30.00.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [{ field: "custom.fixture_replacement", op: "eq", value: true }],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-lawn-sprinkler",
    code: "MER-PL-LAWN-30",
    label: "Lawn sprinkler permit ($30.00)",
    description:
      "Building Plumbing Fees, sec. 1.4: lawn sprinkler permit fee $30.00.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [{ field: "custom.lawn_sprinkler", op: "eq", value: true }],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-mobile-home",
    code: "MER-PL-MH-40",
    label: "Mobile home connect or reconnect of water or sewer to existing stub outs ($40.00)",
    description:
      "Building Plumbing Fees, sec. 1.4: mobile home connect or reconnect of water or sewer to existing stub outs — $40.00.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [{ field: "custom.mobile_home_connection", op: "eq", value: true }],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-combo",
    code: "MER-PL-COMBO-50",
    label: "Residential sewer / water combo fee, one inspection ($50.00)",
    description:
      "Building Plumbing Fees, sec. 1.4: residential sewer / water combo fee (one inspection) — $50.00.",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: {
      all: [{ field: "custom.sewer_water_combo", op: "eq", value: true }],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-sewer-line",
    code: "MER-PL-SEWER-38",
    label: "Residential sewer line or replacement ($38.00)",
    description:
      "Building Plumbing Fees, sec. 1.4: residential sewer line or replacement — $38.00.",
    feeType: "flat",
    config: { amountCents: 3_800 },
    conditions: {
      all: [{ field: "custom.sewer_line_only", op: "eq", value: true }],
    },
  }),

  // Project valuation table (commercial-scale plumbing), four segments.
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-value-20k",
    code: "MER-PL-VAL-20K",
    label: "Plumbing project value to $20,000 (3% of job value and $30.00)",
    description:
      "Building Plumbing Fees, sec. 1.4, Project Valuation Table: for projects $20,000 or less — 3% of job value and $30.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 300 },
    conditions: {
      all: [
        { field: "custom.plumbing_by_value", op: "eq", value: true },
        { field: "valuation", op: "exists" },
        { field: "valuation", op: "lte", value: 2_000_000 },
      ],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-value-100k",
    code: "MER-PL-VAL-100K",
    label: "Plumbing project value $20,000-$100,000 ($630.00 + 2% over $20,000)",
    description:
      "Building Plumbing Fees, sec. 1.4, Project Valuation Table: for projects $20,000 through $100,000 — 2% of job value over $20,000 plus $630.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 200, thresholdCents: 2_000_000 },
    conditions: {
      all: [
        { field: "custom.plumbing_by_value", op: "eq", value: true },
        { field: "valuation", op: "gt", value: 2_000_000 },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-value-200k",
    code: "MER-PL-VAL-200K",
    label: "Plumbing project value $100,000-$200,000 ($2,230.00 + 1% over $100,000)",
    description:
      "Building Plumbing Fees, sec. 1.4, Project Valuation Table: for projects $100,000 through $200,000 — 1% of job value over $100,000 plus $2,230.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 100, thresholdCents: 10_000_000 },
    conditions: {
      all: [
        { field: "custom.plumbing_by_value", op: "eq", value: true },
        { field: "valuation", op: "gt", value: 10_000_000 },
        { field: "valuation", op: "lte", value: 20_000_000 },
      ],
    },
  }),
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-value-200kup",
    code: "MER-PL-VAL-200KUP",
    label: "Plumbing project value $200,000 and up ($3,230.00 + ½% over $200,000)",
    description:
      "Building Plumbing Fees, sec. 1.4, Project Valuation Table: for projects $200,000 or more — ½% of job value over $200,000 plus $3,230.00.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 50, thresholdCents: 20_000_000 },
    conditions: {
      all: [
        { field: "custom.plumbing_by_value", op: "eq", value: true },
        { field: "valuation", op: "gt", value: 20_000_000 },
      ],
    },
  }),

  // Re-inspections $45.
  rule(MER_PLUMBING_SOURCE_KEY, {
    id: "mer-plumb-reinspect",
    code: "MER-PL-REINSPECT",
    label: "Plumbing re-inspection ($45.00)",
    description:
      "Building Plumbing Fees, sec. 1.4, Other Plumbing fees: re-inspections $45.00; work commencing without a permit — double permit fees will be the minimum charge assessed.",
    componentType: "inspection",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 4_500 },
    conditions: {
      all: [{ field: "custom.reinspections", op: "gte", value: 1 }],
    },
  }),
];
