import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * South Bend, Indiana (St. Joseph County) fee rules — REAL DATA.
 *
 * Sources (research/indiana/south-bend.md records how each was read):
 *
 *  S1  "ST. JOSEPH COUNTY / CITY OF SOUTH BEND BUILDING DEPARTMENT PERMIT FEE SCHEDULE
 *      2026" — the department's own seventeen-page PDF, published January 2026 and linked
 *      from the Building Department page.
 *      https://southbendin.gov/wp-content/uploads/2026/01/FeeSchedule-2026-1.pdf
 *  S2  The Building Department page that publishes it, which states the jurisdiction the
 *      schedule is issued for.
 *      https://www.southbendin.gov/departments/building
 *
 * **The mechanism, in three sentences.** Building is two instruments in one section: new
 * construction and additions are priced as a straight percentage of the construction
 * valuation — "Cost per Square Foot (CSF) times the Total Square Footage (TSF) times the
 * Local Variable Factor (LVF) of $.00098", with a $60.00 minimum — while remodeling,
 * alterations and repairs over $500, fences, in-ground pools, communication towers and
 * utilities run down a printed banded table that starts at $60.00 and steps $5.00 per
 * $1,000 to $545.00 at $100,000, then prints its own bases of $550.00, $0.90 per $1,000 to
 * $1,000,000 and $0.60 per $1,000 above it. Electrical and plumbing are the opposite shape
 * entirely: a price list of item rows stacked on one permit — "with a minimum permit fee
 * being $60.00" — where a circuit is $5.00, a panel board is priced by its amperage, a
 * plumbing fixture is $6.00 and a fire protection system is $60.00 for its first 30 heads
 * plus $8.00 for each additional 10.
 *
 * **Six readings this module depends on, all stated on the instrument.**
 *
 *  1. **New construction is a percentage of the valuation, and the valuation is the ICC
 *     table's.** The sheet writes the fee as `CSF × TSF × .00098` and then defines CSF:
 *     "Cost per Square Foot (CSF) shall be determined by the International Code Council
 *     Building Valuation Table in effect in January of each year", with three occupancy
 *     groupings amended onto it (F-1/F-2/H-1..H-4/M read as A-3; I-4/R-2/R-4 as I-1;
 *     S-1/S-2/U as R-3). `CSF × TSF` is the building's construction valuation, so the rate
 *     the calculator applies is 0.00098 of the valuation — stated as the exact fraction
 *     98/100,000 rather than a rounded decimal — under the sheet's own published
 *     "Minimum Fee - $60.00".
 *  2. **The alteration table is one arithmetic with three printed seams.** $1.00–$3,000.00
 *     is $60.00 and every $1,000 band after it adds $5.00, which reproduces all 100 of the
 *     printed rows to "$99,001.00 to 100,000.00 = 545.00" exactly. The sheet then prints
 *     "100,000 and up = $550.00" and two rates: "$0.90 per thousand ... up to $1,000,000
 *     total estimated construction cost" and "$0.60 per one thousand ... thereafter". The
 *     $550.00 is $5.00 *above* what the closed table reaches at $100,000 — a seam that steps
 *     up rather than down, charged as printed.
 *  3. **The two inspection rows at the foot of the building section are not fee rows of a
 *     permit.** "Each reinspection for commercial and industrial projects $60.00" and "Each
 *     additional final inspection necessitated by the failure to pass previous final
 *     inspection $80.00" are trips, charged when they happen, and the calculator carries them
 *     as their own rules rather than folding them into a permit's arithmetic.
 *  4. **Electrical is a stacked price list, and its own minimum is $60.00.** Every row is an
 *     addition — "Temporary Services (All Amperage) $7.00", panel boards by amperage, "Circuits,
 *     each (new or replaced) $5.00", "Horsepower (machinery): First hp $7.00; Each additional hp
 *     $0.25", back-up generators, pool bonding, wiring repair, reconnects, solar, EVSE — and the
 *     page states the floor in its opening line, so the minimum is a `permit_minimum` over the
 *     whole permit rather than a floor on any one row.
 *  5. **The panel board row is priced by the board's amperage, one row per class.** "Switchboards
 *     and Panel Boards each (new and replaced)" carries seven printed rows — 60 amp $7.00, 100
 *     amp $9.00, 200 amp $12.00, 400 amp $15.00, 600 amp $20.00, "Over 600 to 2,000 amp" $25.00 and
 *     "Over 2,000 amp" $50.00. The count is the number of boards (`panels`) and the amperage is
 *     the class the row is selected by: a permit prices its boards at the amperage entered, which
 *     is exact for the ordinary one-board service change and is named as a limitation on the page
 *     for a permit that carries boards of several different amperages.
 *  6. **The fire protection row is a block rate, and the block is 10 heads.** "Up to 30 heads
 *     $60.00; Plus each additional 10 heads thereafter $8.00" is $60.00 for the first thirty heads
 *     and $8.00 for each whole or partial ten above them, which the calculator states as a
 *     per-head rate of $0.80 inside a ten-head increment — 31 heads is one block and $68.00, 41
 *     heads is two blocks and $76.00.
 *
 * **What is deliberately NOT here:** the Fire Department commercial plan review table (the sheet
 * heads it "CITY PROJECTS ONLY", so it prices the City's own projects rather than a permit), the
 * percent of construction cost the electrical sheet's solar row defers to ("Solar Array $60.00
 * plus percentage of the construction cost as established by the Departments fee schedule" —
 * the percentage is on an instrument the page does not publish), the licensing and registration
 * fees, the moving, wrecking, sign, tent and document-processing rows, and the heating, ventilating
 * and air-conditioning schedule (a fourth trade this module does not carry). This module is the
 * single definition of South Bend's fee rules: the seed writes exactly these records and the tests
 * assert against exactly these records.
 */

/** The schedule's own title year, and the month it was published. */
export const SOUTH_BEND_FEE_EFFECTIVE_FROM = "2026-01-01";

export const SOUTH_BEND_SCHEDULE_SOURCE_KEY = "south-bend-building-department-fee-schedule-2026";
export const SOUTH_BEND_DEPARTMENT_PAGE_SOURCE_KEY = "south-bend-building-department";

/** The sheet's own "Minimum Fee - $60.00", stated in each trade's opening line as well. */
export const SOUTH_BEND_MINIMUM_CENTS = 6_000;

/** "times the Local Variable Factor (LVF) of $.00098", as an exact fraction of the valuation. */
export const SOUTH_BEND_NEW_CONSTRUCTION_RATE = { numerator: 98, denominator: 100_000 };

/** The two mechanisms the building section publishes: new construction, and the table. */
export const SOUTH_BEND_BUILDING_SCOPES = ["new_construction", "alteration"] as const;
export type SouthBendBuildingScope = (typeof SOUTH_BEND_BUILDING_SCOPES)[number];

/** The seven printed panel-board classes, in the sheet's own order. */
export const SOUTH_BEND_PANEL_CLASSES = [60, 100, 200, 400, 600] as const;

function sbRule(
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
    effectiveFrom: SOUTH_BEND_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — the valuation rate and the printed alteration table      */
/* -------------------------------------------------------------------------- */

export const SOUTH_BEND_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-bld-new",
    code: "BLD-NEW",
    label:
      "Building permit — new construction and additions: cost per square foot × total square footage × .00098 ($60.00 minimum)",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: SOUTH_BEND_NEW_CONSTRUCTION_RATE,
      rateUnit: "fraction",
    },
    minimumCents: SOUTH_BEND_MINIMUM_CENTS,
    conditions: { field: "custom.building_scope", op: "eq", value: "new_construction" },
    description:
      'The sheet\'s own formula, in full: "The fee for permits issued for residential and commercial new construction and building additions shall be based upon the following: a. Cost per Square Foot (CSF) times the Total Square Footage (TSF) times the Local Variable Factor (LVF) of $.00098. b. Cost per Square Foot (CSF) shall be determined by the International Code Council Building Valuation Table in effect in January of each year." `CSF × TSF` is the construction valuation the ICC table produces for the occupancy, so the calculator reads the valuation and multiplies it by the local variable factor — 0.00098, stated as the exact fraction 98/100,000 so the arithmetic rounds once, in cents. Paragraph (c) amends three occupancy groupings onto the ICC table (F-1, F-2, H-1 through H-4 and M read at A-3\'s rate; I-4, R-2 and R-4 at I-1\'s; S-1, S-2 and U at R-3\'s), which is a rule about the table rather than about the rate, and "d. Minimum Fee - $60.00" is the floor this rule carries.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-bld-alt-1",
    code: "BLD-ALT-1",
    label:
      "Building permit — remodeling, alterations and repairs: $60.00 plus $5.00 per $1,000 up to $100,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 6_000,
      thresholdCents: 300_000,
      centsPerThousand: 500,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "custom.building_scope", op: "eq", value: "alteration" },
        { field: "valuation", op: "lte", value: 10_000_000 },
      ],
    },
    description:
      'The section headed "Remodeling, Alterations, and Repairs over $500.00, fence installations, in-ground pool Installation, communication towers, and utilities", read as one arithmetic: "$1.00 to 3,000.00 ... 60.00" at the foot of a $1,000-wide ladder to "$9,001.00 to 10,000.00 ... 95.00", and the same $5.00 step on every one of the ninety printed rows above it to "$99,001.00 to 100,000.00 ... 545.00". $60.00 plus $5.00 per $1,000 above $3,000, each band bought whole, reproduces all 100 rows exactly. The schedule prints the table as 100 rows rather than as a rate, which is why the base is $60.00 at $3,000 and the increment is the table\'s own width.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-bld-alt-2",
    code: "BLD-ALT-2",
    label:
      "Building permit — remodeling, alterations and repairs: $550.00 plus $0.90 per $1,000 from $100,000 to $1,000,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 55_000,
      thresholdCents: 10_000_000,
      centsPerThousand: 90,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "custom.building_scope", op: "eq", value: "alteration" },
        { field: "valuation", op: "gt", value: 10_000_000 },
        { field: "valuation", op: "lte", value: 100_000_000 },
      ],
    },
    description:
      'Two of the sheet\'s printed rows, in full: "100,000 and up ... $550.00*" and "* PLUS per thousand dollars ($1000.00) of estimated construction cost thereafter, up to $1,000,000.00 total estimated construction cost ... $0.90". The $550.00 sits $5.00 *above* the $545.00 the closed table reaches at $100,000 — the opposite of the step-down seam Minneapolis and Saint Paul both print — and it is charged as printed, because the sheet states it as its own base.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-bld-alt-3",
    code: "BLD-ALT-3",
    label:
      "Building permit — remodeling, alterations and repairs above $1,000,000: $1,360.00 plus $0.60 per $1,000",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 136_000,
      thresholdCents: 100_000_000,
      centsPerThousand: 60,
      incrementCents: 100_000,
    },
    conditions: {
      all: [
        { field: "custom.building_scope", op: "eq", value: "alteration" },
        { field: "valuation", op: "gt", value: 100_000_000 },
      ],
    },
    description:
      'The sheet\'s second rate row: "* PLUS per one thousand dollars ($1000.00) of estimated construction cost thereafter ... $0.60". The base is not printed — the sheet prints only the rate above the $1,000,000 it names — so it is the $1,360.00 the band beneath it reaches at that seam ($550.00 plus 900 × $0.90), which is what keeps the two printed rules continuous. The document states the rate and this rule states the base only because both are needed to charge the row as one figure.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-bld-neighborhood-review",
    code: "BLD-OVERLAY-REVIEW",
    label: "Northeast Neighborhood Development Area design review — $160.00, in addition to any other permit",
    feeType: "flat",
    config: { amountCents: 16_000 },
    componentType: "other",
    priority: 500,
    conditions: { field: "custom.northeast_overlay", op: "exists" },
    description:
      'The sheet\'s own block: "NORTHEAST NEIGHBORHOOD DEVELOPMENT AREA DESIGN REVIEW FEES: All stand-alone residential or commercial new construction, in addition to and separate from any other permit, processing, or review fee ... $160.00*". It is a design review in one overlay district rather than a permit fee, so it is an `other` component gated on the plan being in the district — "in addition to and separate from any other permit" is the sheet stating that it stacks rather than substitutes.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-bld-reinspection",
    code: "BLD-REINSPECTION",
    label: "Building reinspection — $60.00 each, commercial and industrial projects",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 6_000 },
    componentType: "inspection",
    priority: 600,
    conditions: { field: "custom.reinspection_requested", op: "exists" },
    description:
      '"Each reinspection for commercial and industrial projects ... $60.00" — a trip charged when it is made, not a row of the permit\'s arithmetic. The count is the inspections fact, and the rule is gated on the reinspection actually being requested so a permit that passes first time carries nothing for it.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-bld-extra-final",
    code: "BLD-EXTRA-FINAL",
    label: "Building additional final inspection — $80.00 each, where a previous final inspection failed",
    feeType: "per_unit",
    config: { unit: "final_inspections", centsPerUnit: 8_000 },
    componentType: "inspection",
    priority: 610,
    conditions: { field: "custom.extra_final_inspection", op: "exists" },
    description:
      '"Each additional final inspection necessitated by the failure to pass previous final inspection ... $80.00". The sheet prices it above the building section\'s own reinspection row and below the Fire Department block, and it is the reason the dataset counts final inspections separately from reinspections: a reinspection is a trip on work in progress, and this is a second closing trip after a failure, at two different prices on the same section.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — the stacked price list with a $60.00 floor            */
/* -------------------------------------------------------------------------- */

export const SOUTH_BEND_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-temporary-service",
    code: "ELEC-TEMP-SERVICE",
    label: "Electrical permit — temporary services, all amperages, $7.00 each",
    feeType: "per_unit",
    config: { unit: "temporary_services", centsPerUnit: 700 },
    description:
      'The electrical page\'s first row: "Temporary Services (All amperage) ... $ 7.00". "All amperage" is the sheet saying the row is not banded the way the panel board rows beneath it are — a job-site service is priced by the count and not by its size — and it is a count of its own rather than the permanent service\'s, because a temporary service is removed when the building\'s own service is energized.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-panel-60",
    code: "ELEC-PANEL-60",
    label: "Electrical permit — switchboards and panel boards, 60 amp, $7.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 700 },
    conditions: { field: "custom.panel_board_amperage", op: "eq", value: 60 },
    description:
      'The first of the seven printed classes under "Switchboards and Panel Boards each (new and replaced)": "60 amp ... $ 7.00". One rule per class, selected by the amperage entered: the sheet prices a board by its rating and counts boards, so the only way to state the row without inventing a rate is to state each printed line.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-panel-100",
    code: "ELEC-PANEL-100",
    label: "Electrical permit — switchboards and panel boards, 100 amp, $9.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 900 },
    conditions: { field: "custom.panel_board_amperage", op: "eq", value: 100 },
    description:
      'The table\'s own row: "100 amp ... $ 9.00".',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-panel-200",
    code: "ELEC-PANEL-200",
    label: "Electrical permit — switchboards and panel boards, 200 amp, $12.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 1_200 },
    conditions: { field: "custom.panel_board_amperage", op: "eq", value: 200 },
    description:
      'The table\'s own row: "200 amp ... $12.00" — the ordinary residential service size in this jurisdiction, and the class most permits will select.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-panel-400",
    code: "ELEC-PANEL-400",
    label: "Electrical permit — switchboards and panel boards, 400 amp, $15.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 1_500 },
    conditions: { field: "custom.panel_board_amperage", op: "eq", value: 400 },
    description: "The table's own row: \"400 amp ... $15.00\".",
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-panel-600",
    code: "ELEC-PANEL-600",
    label: "Electrical permit — switchboards and panel boards, 600 amp, $20.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 2_000 },
    conditions: { field: "custom.panel_board_amperage", op: "eq", value: 600 },
    description: "The table's own row: \"600 amp ... $20.00\".",
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-panel-over-600",
    code: "ELEC-PANEL-OVER-600",
    label: "Electrical permit — switchboards and panel boards, over 600 to 2,000 amp, $25.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 2_500 },
    conditions: {
      all: [
        { field: "custom.panel_board_amperage", op: "gt", value: 600 },
        { field: "custom.panel_board_amperage", op: "lte", value: 2_000 },
      ],
    },
    description:
      'The table\'s own row: "Over 600 to 2,000 amp ... $25.00" — the first of the two rows the sheet states as a range rather than a size.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-panel-over-2000",
    code: "ELEC-PANEL-OVER-2000",
    label: "Electrical permit — switchboards and panel boards, over 2,000 amp, $50.00 each",
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 5_000 },
    conditions: { field: "custom.panel_board_amperage", op: "gt", value: 2_000 },
    description:
      'The table\'s last row: "Over 2,000 amp ... $50.00". Together the seven classes are $7.00, $9.00, $12.00, $15.00, $20.00, $25.00 and $50.00 — the sheet\'s jump at the top of the table is the largest step in its electrical section.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-circuit",
    code: "ELEC-CIRCUIT",
    label: "Electrical permit — circuits, each (new or replaced), $5.00",
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 500 },
    description:
      '"Circuits, each (new or replaced) ... $ 5.00". The page\'s closing note keeps the count from being over-stated at application: "If the exact number of circuits or horsepower is unknown at the time of application for a permit, a permit may be taken for the minimum amount known with new permits issued as the intent of the work known."',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-horsepower",
    code: "ELEC-HORSEPOWER",
    label: "Electrical permit — machinery: $7.00 for the first horsepower, $0.25 for each additional",
    feeType: "per_unit",
    config: { unit: "horsepower", baseCents: 700, thresholdUnits: 1, centsPerUnit: 25 },
    description:
      '"Horsepower (machinery): First hp ... $ 7.00; Each additional hp ... $ 0.25" — the row prices motive equipment by its rated horsepower rather than by how many machines there are, so a single 20 hp motor is $11.75 and four 5 hp motors are $11.75 as well. The first horsepower is included in the $7.00 and the rest are charged by the horsepower, which is the same allowance-and-rate shape Saint Paul\'s BTU row has.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-generator-small",
    code: "ELEC-GENERATOR-10",
    label: "Electrical permit — back-up generator, 10 kW or less, $60.00",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: {
      all: [
        { field: "custom.generator_kilowatts", op: "exists" },
        { field: "custom.generator_kilowatts", op: "lte", value: 10 },
      ],
    },
    description:
      'The generator block\'s first row: "Back-up generator: a. 10 Kw or less ... $60.00". The band is priced flat rather than by capacity, so the rule reads the generator\'s kilowatts only to select the row.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-generator-large",
    code: "ELEC-GENERATOR-OVER-10",
    label: "Electrical permit — back-up generator, over 10 kW, $70.00",
    feeType: "flat",
    config: { amountCents: 7_000 },
    conditions: { field: "custom.generator_kilowatts", op: "gt", value: 10 },
    description:
      'The block\'s second row: "b. Over 10 Kw ... $70.00". Two rows, one threshold, $10.00 between them — and the same two rows appear on the plumbing sheet for a generator\'s gas line, at the same two prices.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-pool",
    code: "ELEC-POOL-BONDING",
    label: "Electrical permit — pool wiring and/or bonding, $60.00",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { field: "custom.pool_wiring", op: "exists" },
    description:
      '"Pool wiring and/or bonding ... $60.00" — one price for the pool\'s circuit and its equipotential bonding grid, gated on the work being on the permit.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-wiring-repair",
    code: "ELEC-WIRING-REPAIR",
    label: "Electrical permit — repair, extension and/or maintenance of wiring, $60.00",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { field: "custom.wiring_repair", op: "exists" },
    description:
      '"Repair, extension, and/or maintenance of wiring ... $60.00" — a flat price for the work rather than a price per circuit or per foot, and the row that catches the permits a count-based table would otherwise miss.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-reconnect",
    code: "ELEC-RECONNECT",
    label: "Electrical permit — reset, relocation and reconnect, $60.00 each",
    feeType: "per_unit",
    config: { unit: "reconnections", centsPerUnit: 6_000 },
    description:
      '"Reset, Relocation, and Reconnect, each ... $60.00". Per occurrence rather than per service: a meter moved a foot is one, a service re-energised after a fire is another.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-solar-array",
    code: "ELEC-SOLAR-ARRAY",
    label: "Electrical permit — solar array, $60.00 plus a percentage of construction cost",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { field: "custom.solar_array", op: "exists" },
    description:
      'The row in full: "Solar Array ... $60.00 plus percentage of the construction cost as established by the Departments fee schedule." The $60.00 is on this sheet and is charged; the percentage is not — the row points at another instrument for it, and that instrument is not the one the department publishes. The percentage is named as unmodelled on the page rather than guessed at.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-ev-device",
    code: "ELEC-EVSE",
    label: "Electrical permit — electric vehicle device, $60.00",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { field: "custom.ev_charger", op: "exists" },
    description:
      '"Electrical Vehicle Device ... $60.00" — the schedule\'s last price row, filed under the 2026 edition exactly as the 2026 National Electrical Code\'s EVSE requirements begin to bite. One price for the device, gated on the work being on the permit.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-inspection",
    code: "ELEC-INSPECTION",
    label: "Electrical permit — reinspection or additional final inspection, $60.00 each",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 6_000 },
    componentType: "inspection",
    priority: 600,
    conditions: { field: "custom.reinspection_requested", op: "exists" },
    description:
      'Two printed rows at one price: "Reinspection fee, each ... $60.00" and "Additional final inspection, each ... $60.00". The electrical page prices both at $60.00, so one rule carries them; the plumbing page prices the same pair at $60.00 and $75.00 and needs two, which is the kind of difference that makes the two sheets worth reading separately.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-elec-minimum",
    code: "ELEC-MINIMUM",
    label: "Electrical permit — $60.00 minimum permit fee",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: SOUTH_BEND_MINIMUM_CENTS },
    componentType: "base",
    priority: 200,
    description:
      'The electrical page opens by stating the floor: "Electrical permits issued and obtained prior to commencement of the work for which such permit is required, the following fees shall be levied, with a minimum permit fee being $60.00." It is a floor on the permit and not on a row, so it is a `permit_minimum` over the base fee: one temporary service computes $7.00 and pays $60.00, and the shortfall is what the rule emits.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — the longest price list in the two sheets                 */
/* -------------------------------------------------------------------------- */

export const SOUTH_BEND_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-fixture",
    code: "PLUMB-FIXTURE",
    label: "Plumbing permit — each plumbing fixture, trap, or set of fixtures on one trap, $6.00",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 600 },
    description:
      'The plumbing table\'s first row, in full: "Each plumbing fixture or trap or set of fixtures on one trap, including water and drainage piping therefor ... $ 6.00". The sheet\'s noun is the fixture *or trap*, and the count is the dataset\'s fixture count for the same reason Saint Paul\'s is: it is the plumbing trade\'s own unit, and every other row beneath it counts something else.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-backflow",
    code: "PLUMB-BACKFLOW",
    label: "Plumbing permit — backflow protection, $6.00 each",
    feeType: "per_unit",
    config: { unit: "backflow_devices", centsPerUnit: 600 },
    description:
      '"Backflow Protection, each ... $ 6.00" — the second row, priced exactly as a fixture is and counted separately from it, because a device that protects the supply is not a fixture the supply serves.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-building-sewer",
    code: "PLUMB-BUILDING-SEWER",
    label: "Plumbing permit — building sewer under 100 feet, $12.00 each",
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 1_200 },
    conditions: { not: { field: "custom.building_sewer_length_feet", op: "gt", value: 100 } },
    description:
      'The building-sewer block\'s first row: "Building Sewer, each: Under 100\' ... $12.00". The row is one price per sewer with a length band above it, and the condition is written as a negation so that a sewer whose length is not entered is priced at the under-100-foot row rather than dropped — the ordinary case on an application that states a sewer and no measurement.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-building-sewer-long",
    code: "PLUMB-BUILDING-SEWER-OVER-100",
    label: "Plumbing permit — building sewer 100 feet or over, $25.00 each",
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 2_500 },
    conditions: { field: "custom.building_sewer_length_feet", op: "gt", value: 100 },
    description:
      'The same block\'s second row: "100\' or over ... $25.00". One length fact selects between the two rows, and exactly one of them fires: the under-100 rule is written as the negation of this one\'s condition.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-building-water",
    code: "PLUMB-BUILDING-WATER",
    label: "Plumbing permit — building water service under 100 feet, $12.00 each",
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 1_200 },
    conditions: { not: { field: "custom.building_water_length_feet", op: "gt", value: 100 } },
    description:
      'The water block\'s first row: "Building Water, each: Under 100\' ... $12.00". Read with a second extraction mode because the page\'s `-layout` pass mis-pairs this block with the softener and trailer rows beneath it — the two readings are recorded in the research file, and the plain-mode text is the one the schedule prints.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-building-water-long",
    code: "PLUMB-BUILDING-WATER-OVER-100",
    label: "Plumbing permit — building water service 100 feet or over, $25.00 each",
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 2_500 },
    conditions: { field: "custom.building_water_length_feet", op: "gt", value: 100 },
    description:
      'The water block\'s second row: "100\' or over ... $25.00" — the same two-band shape as the sewer above it, on its own length fact so a long sewer and a short water service are priced independently.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-water-softener",
    code: "PLUMB-WATER-SOFTENER",
    label: "Plumbing permit — water softener, $7.00 each",
    feeType: "per_unit",
    config: { unit: "water_units", centsPerUnit: 700 },
    description:
      '"Water softener, each ... $ 7.00". The count is the dataset\'s water-unit fact — the appliances on the water side of the system rather than the fixtures — which is the division Saint Paul\'s plumbing table makes with its "Per unit - Water" row and which keeps a softener from being billed as a fixture.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-trailer-park-sewer",
    code: "PLUMB-TRAILER-PARK-SEWER",
    label: "Plumbing permit — trailer park sewer, $10.00 each",
    feeType: "per_unit",
    config: { unit: "trailer_park_sewers", centsPerUnit: 1_000 },
    description:
      '"Trailer Park Sewer, each ... $10.00" — a sewer connection at a lot pedestal rather than a building sewer, on its own row between the building water block and the rainwater drain, and counted separately from the building sewer above it.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-rainwater-drain",
    code: "PLUMB-RAINWATER-DRAIN",
    label: "Plumbing permit — drain within a building for rainwater systems, $6.00 each",
    feeType: "per_unit",
    config: { unit: "building_drains", centsPerUnit: 600 },
    description:
      '"Drain within building for rainwater systems, each ... $ 6.00". The count is the building-drain fact added for Nashville, whose plumbing table prices "Each additional building drain" on its own row: a drain is neither a fixture nor a connection, and both sheets count it separately for the same reason.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-water-heater",
    code: "PLUMB-WATER-HEATER",
    label: "Plumbing permit — water heater and/or vent, $7.00 each",
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 700 },
    description:
      '"Water heater and/or vent, each ... $ 7.00" — one price covering the heater and its vent, counted as a heater. It sits beside the softener row at the same $7.00 and is a separate count: an appliance that heats is not an appliance that treats.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-gas-reconnect",
    code: "PLUMB-GAS-RECONNECT",
    label: "Plumbing permit — gas reconnection, $60.00 each",
    feeType: "per_unit",
    config: { unit: "reconnections", centsPerUnit: 6_000 },
    description:
      '"Gas Reconnection, each ... $60.00" — the plumbing table\'s own reconnect row, at the same price as the electrical page\'s "Reset, Relocation, and Reconnect" and counted on the same kind, because a reconnection is what both rows name and the permit type is what keeps them apart.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-gas-outlet",
    code: "PLUMB-GAS-OUTLET",
    label: "Plumbing permit — each gas piping system, per outlet, $3.00",
    feeType: "per_unit",
    config: { unit: "outlets", centsPerUnit: 300 },
    description:
      '"Each gas piping system, per outlet ... $ 3.00" — the row prices the outlets a gas piping system serves rather than the systems, and the count is the dataset\'s outlet fact, the same one Nashville\'s "Each additional gas outlet" row reads.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-pretreatment",
    code: "PLUMB-PRETREATMENT",
    label: "Plumbing permit — industrial waste pretreatment interception, $8.00 each",
    feeType: "per_unit",
    config: { unit: "grease_interceptors", centsPerUnit: 800 },
    description:
      'The row in full: "Industrial waste pretreatment interception, including its trap and vent, excepting kitchen-type grease interceptors functioning as fixture traps, each ... $ 8.00". The exception is the point of the count: the sheet says such an interceptor is *not* charged here when it is functioning as a fixture trap, so it is a fact of its own rather than a fixture, and a kitchen interceptor already counted as a fixture trap is not billed twice.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-water-piping",
    code: "PLUMB-WATER-PIPING",
    label: "Plumbing permit — installation, alteration or repair of water piping and/or water treating equipment, $6.00",
    feeType: "flat",
    config: { amountCents: 600 },
    conditions: { field: "custom.water_piping_work", op: "exists" },
    description:
      '"Installation, alteration or repair of water piping and/or water treating equipment. $ 6.00" — a flat price for the work rather than a price per foot or per appliance, which is what the row is: the sheet already counts the appliances on the rows above it.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-drain-vent-repair",
    code: "PLUMB-DRAIN-VENT-REPAIR",
    label: "Plumbing permit — repair or alteration of drainage or vent piping, $6.00",
    feeType: "flat",
    config: { amountCents: 600 },
    conditions: { field: "custom.drain_vent_repair", op: "exists" },
    description:
      '"Repair or alteration of drainage or vent piping ... $ 6.00" — the drain-side twin of the water-piping row above it, at the same price and on its own fact, because the two are different systems on the same application.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-drywell",
    code: "PLUMB-DRYWELL",
    label: "Plumbing permit — drywells, $12.00 each",
    feeType: "per_unit",
    config: { unit: "drywells", centsPerUnit: 1_200 },
    description:
      '"Drywells, each ... $12.00". A soakage pit is not a septic tank and not a drain inside the building, and the sheet prints all three on separate rows at different prices — which is why the dataset counts it as its own kind.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-lawn-sprinkler",
    code: "PLUMB-LAWN-SPRINKLER",
    label: "Plumbing permit — lawn sprinkler system on any one meter, $6.00 each",
    feeType: "per_unit",
    config: { unit: "meters", centsPerUnit: 600 },
    description:
      '"Lawn sprinkler system on any one meter, including backflow protection devices thereof, each ... $ 6.00". The row is priced per *meter* — one system on one meter is one charge, and the backflow devices it includes are explicitly inside the price rather than added on the backflow row above. The two extraction modes disagree on this figure ($6.00 against the mis-paired $60.00 of the `-layout` pass); the plain mode is the one the sheet prints, and the research file records both readings.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-fire-sprinkler",
    code: "PLUMB-FIRE-SPRINKLER",
    label:
      "Plumbing permit — fire protection sprinkler system: $60.00 up to 30 heads, plus $8.00 for each additional 10 heads",
    feeType: "per_unit",
    config: {
      unit: "sprinkler_heads",
      baseCents: 6_000,
      thresholdUnits: 30,
      incrementUnits: 10,
      centsPerUnit: 80,
    },
    description:
      'The block in full: "Fire protection sprinkler system: Up to 30 heads ... $60.00; Plus each additional 10 heads thereafter ... $ 8.00". The first thirty heads are inside the $60.00 and the rest are bought in ten-head blocks, so the rate is stated per head ($0.80) inside a ten-head increment: 30 heads is $60.00, 31 heads rounds up to one block and $68.00, 41 heads to two and $76.00. The kind is the sprinkler-head count added for Green Bay, whose fire-suppression row is the other place in the dataset where a schedule prices a system by how many heads it has.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-gas-tank",
    code: "PLUMB-GAS-TANK",
    label: "Plumbing permit — gas tanks and pumps, $12.00",
    feeType: "per_unit",
    config: { unit: "gas_tanks", centsPerUnit: 1_200 },
    description:
      '"Gas tanks and pumps ... $12.00" — the equipment that stores or moves gas on site, as distinct from the appliances the gas piping feeds. The row prints no "each" and is counted as equipment: one tank is $12.00, and two tanks is what the row\'s own plural says the count holds.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-generator-gas-small",
    code: "PLUMB-GENERATOR-GAS-10",
    label: "Plumbing permit — back-up generator gas line, 10 kW or less, $60.00",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: {
      all: [
        { field: "custom.generator_kilowatts", op: "exists" },
        { field: "custom.generator_kilowatts", op: "lte", value: 10 },
      ],
    },
    description:
      '"Back-up generator -gas line: a. 10 Kw or less ... $60.00" — the generator gas connection, priced on the same two rows the electrical page prices the generator itself on, at the same two prices. A generator is one machine with two permits and, here, the same threshold.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-generator-gas-large",
    code: "PLUMB-GENERATOR-GAS-OVER-10",
    label: "Plumbing permit — back-up generator gas line, over 10 kW, $70.00",
    feeType: "flat",
    config: { amountCents: 7_000 },
    conditions: { field: "custom.generator_kilowatts", op: "gt", value: 10 },
    description:
      'The block\'s second row: "b. Over 10 Kw ... $70.00" — the same $10.00 step the electrical sheet prints for the same machine.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-reinspection",
    code: "PLUMB-REINSPECTION",
    label: "Plumbing permit — reinspection, $60.00 each",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 6_000 },
    componentType: "inspection",
    priority: 600,
    conditions: { field: "custom.reinspection_requested", op: "exists" },
    description:
      '"Reinspection ... $60.00" — the plumbing table\'s own trip row, priced as the electrical page prices its two and as the building section prices its commercial reinspection.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-extra-final",
    code: "PLUMB-EXTRA-FINAL",
    label: "Plumbing permit — additional final inspection, $75.00 each",
    feeType: "per_unit",
    config: { unit: "final_inspections", centsPerUnit: 7_500 },
    componentType: "inspection",
    priority: 610,
    conditions: { field: "custom.extra_final_inspection", op: "exists" },
    description:
      '"Additional final inspection, each ... $75.00". It is the last row of the plumbing table and the reason the dataset counts final inspections apart from reinspections: on this sheet the two are $60.00 and $75.00, and on the electrical sheet beside it both are $60.00. One price on a count would have to be wrong on one of the two trades.',
  }),
  sbRule(SOUTH_BEND_SCHEDULE_SOURCE_KEY, {
    id: "south-bend-plumb-minimum",
    code: "PLUMB-MINIMUM",
    label: "Plumbing permit — $60.00 minimum permit fee",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: SOUTH_BEND_MINIMUM_CENTS },
    componentType: "base",
    priority: 200,
    description:
      'The plumbing page opens exactly as the electrical page does: "... the following fees shall be levied, with a minimum permit fee being $60.00." One fixture computes $6.00 and pays $60.00, and the minimum emits the $54.00 shortfall.',
  }),
];
