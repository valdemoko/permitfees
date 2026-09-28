import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Grand Rapids, Michigan fee rules — REAL DATA.
 *
 * Sources (research/michigan/grand-rapids.md records how each was read):
 *
 *  S1  PLANNING, DESIGN, and DEVELOPMENT FEE SCHEDULE, FY 2027 — every page
 *      headed "CONSTRUCTION CODE ADMINISTRATION FEES - EFFECTIVE JULY 1, 2026",
 *      read 2026-09-25 in three pdftotext modes because -layout mispairs rows
 *      in this document (it drops the "$4.00" of Alternative Power and shifts
 *      every electrical row below it, ending in orphan amounts with no label).
 *      -table and -raw agree on every disputed row; their pairing is the one
 *      charged here. The BUILDING PERMIT FEE CHART's 500 rows were extracted
 *      programmatically and checked against four formulas — every row matches
 *      every formula.
 *      https://media-002-us.cdn.govstack.com/grandrapidsmi-us/media/4lzl0erl/planning-design-and-development-fee-schedule-fy2027.pdf
 *  S2  The Building Permit Fee Calculator page, which links S1 and carries the
 *      City's own arithmetic as inline JavaScript: the four result lines, the
 *      constants (revMin 50, zoneMin 25, zoneMax 290, residentialZoneCap 25),
 *      units = floor((value − 1000)/1000), baselinePermitFee = units * 6.8,
 *      floor(0.68 * units) for zoning and plan review, and the three
 *      project-type branches. It also defines the occupancy split and
 *      disclaims trade fees.
 *      https://www.grandrapidsmi.gov/grow-and-thrive/development-center/building-permit-fees/
 *  S3–S5  The permits, trade permits and residential building permits pages:
 *      the permit taxonomy, the Accela portal link, the "property owner or
 *      licensed contractor" filing rule and the LUDS trigger. No amount in
 *      this file comes from them.
 *
 * **The mechanism, in one paragraph.** Grand Rapids prices a building permit as
 * a stack of four published components rather than one rate, and two of the
 * four are percentages of the fee itself turned into whole dollars or cents by
 * a floor and a cap. The **application fee** is $54 (the schedule's "Base
 * Fee" — "charged for first $1,000 of construction cost"). The **permit fee**
 * is $6.80 for "each additional $1,000 of construction/contract cost", which
 * this engine reads the way the chart's own rows read it: a $1,000 threshold
 * and a $1,000 round-up, so the partial thousand is charged as a whole step.
 * **Plan review** is commercial only and is the chart's own column:
 * max($50, floor(units × $0.68)) in whole dollars, published as 501 printed
 * tiers from $1–$1,000 to $500,001–$501,000 with no row above that. The
 * **zoning fee** is $25 flat on residential projects and, on commercial ones,
 * 10% of the application-plus-permit subtotal clamped between $25 and $290 —
 * footnote 6's sliding scale, "so as not to be more than 10% of the Building
 * Permit fee". The chart's two Total columns are exactly these sums:
 * residential never includes plan review; commercial always does.
 *
 * **Where the City's calculator and the chart disagree, the chart wins.** The
 * calculator rounds the partial thousand *down* (`floor((value − 1000)/1000)`,
 * where the chart's rows charge the row's units and therefore round up:
 * $150,001 is the $1,020.00 row, not $1,013.20) and computes zoning as
 * `floor(0.68 * units)` — omitting the $5.40 that is 10% of the $54
 * application fee and flooring to whole dollars where the chart prints cents
 * ($101.00 against the chart's $106.72 at 149 units). The calculator calls
 * itself an estimate; the chart is the schedule with its Chapter 131 authority
 * printed beside it. On plan review the two agree to the cent, which is the
 * independent confirmation of that column.
 *
 * **What is deliberately NOT here:**
 *
 *  - **The calculator's project-type branches** — residential roof/siding and
 *    deck/pool at $66 with the application and plan review waived, commercial
 *    roof/siding at $220 — which contradict the schedule's own flat rows
 *    (Residential Deck $22, Pool $15, Re-siding $5, Re-roofing with no amount
 *    printed) and a code comment that says "capped at $24" beside a constant
 *    of 25. Three disagreements between two City surfaces; named on the pages,
 *    modelled nowhere.
 *  - **Above $501,000**, where the chart's rows stop: the top published row is
 *    applied with the engine's warning, and the calculator's unbounded
 *    formulas are recorded rather than adopted.
 *  - **Mechanical in full** (Chapter 134) — this pass publishes plumbing as
 *    the third page — and every electrical and plumbing row outside the
 *    modelled ones: Additional Inspection $42, Admin Fee $173, Written Report
 *    and Special Inspection $63, New Single Family Home $210 (its relationship
 *    to the itemised rows is not stated), Conduit/Grounding $47, Hazardous
 *    Locations "2x Permit Fee", fire alarm, branch circuits, the $10 appliance
 *    rows, motors, feeders, medical gas zones $52, gas piping $5 an opening.
 *  - **Change of Use ($220), demolition ($220 residential + zoning / $250
 *    commercial + $70 sewer / $331 explosives), the incomplete application
 *    ($551 + $70 sewer), Re-Review of Plans ($88 a page), Large Format
 *    Scanning ("10% permit fee $50.00 min"), the hourly and administrative
 *    rates, the inspection and construction-code enforcement schedules.**
 *  - **The Planning Division's schedule** — zoning map amendments ($3,610–
 *    $5,560), special land use, site plan review, board of zoning appeals,
 *    signs, historic preservation — a different division's money.
 *  - **Right-of-way and LUDS permits** (the LUDS program combines "review and
 *    permit fee for one simple payment"), and **water/sewer connection**
 *    permits, which are their own application.
 *
 * **This module is the single definition of Grand Rapids's fee rules.** The
 * seed writes exactly these records and the tests assert against exactly these
 * records.
 */

/** S1's own header: "CONSTRUCTION CODE ADMINISTRATION FEES - EFFECTIVE JULY 1, 2026" (FY 2027). */
export const GR_FEE_EFFECTIVE_FROM = "2026-07-01";

export const GR_FEE_SCHEDULE_SOURCE_KEY = "grandrapids-fy2027-fee-schedule";
export const GR_CALCULATOR_SOURCE_KEY = "grandrapids-building-permit-fees";
export const GR_PERMITS_SOURCE_KEY = "grandrapids-permits";
export const GR_TRADE_PERMITS_SOURCE_KEY = "grandrapids-trade-permits";
export const GR_RESIDENTIAL_PERMITS_SOURCE_KEY = "grandrapids-residential-building-permits";

/* -------------------------------------------------------------------------- */
/* Conditions — the facts this schedule turns on                              */
/* -------------------------------------------------------------------------- */

/**
 * The calculator page defines the split the chart's two Total columns use:
 * "Residential projects include only single-family homes or duplexes. For
 * projects with three or more residential units, please select commercial."
 * Absent the flag the commercial path applies — the larger figure, and the one
 * that carries plan review.
 */
const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };
const NOT_RESIDENTIAL: FeeCondition = { not: RESIDENTIAL };

/**
 * Demolition is priced on its own rows of the schedule — $220 residential plus
 * the zoning fee, $250 commercial plus a $70 sewer inspection fee, $331 with
 * explosives — so the construction-cost ladder refuses it rather than pricing
 * a wrecking job from a valuation. Written as NOT(eq) so an absent work type
 * still lets the ladder apply: a comparison against a fact we do not have is
 * not a match.
 */
const NOT_DEMOLITION: FeeCondition = {
  not: { field: "work_type", op: "eq", value: "demolition" },
};

const DEMOLITION_NOTE =
  "Demolition is excluded: the schedule prices wrecking on its own rows ($220 residential plus the zoning fee, $250 commercial plus a $70 sewer inspection fee, $331 with explosives), so a wrecking job is not priced from a construction valuation here.";

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function grRule(
  overrides: Pick<
    FeeRuleRecord,
    "id" | "code" | "label" | "description" | "feeType" | "config"
  > & Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return {
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: GR_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: GR_FEE_SCHEDULE_SOURCE_KEY,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building — the four-component stack (S1's block + its fee chart)           */
/* -------------------------------------------------------------------------- */

/**
 * The chart's "Com Plan Review" column, as printed: one tier per published
 * $1,000 value range, from "$1 – $1,000" to "$500,001 – $501,000".
 *
 * `max($50, floor(units × $0.68))` in whole dollars — verified against all
 * 500 printed rows, and confirmed independently by the City's calculator,
 * which computes the same expression (`Math.floor(0.68 * units)` with
 * `revMin = 50`). No tier is open-ended: the chart publishes no row above
 * $501,000, and a value beyond it takes the top printed row with the engine's
 * warning rather than an amount no document prints.
 */
const PLAN_REVIEW_TIERS = Array.from({ length: 501 }, (_, units) => ({
  upToCents: (units + 1) * 100_000,
  amountCents: Math.max(5_000, Math.floor((68 * units) / 100) * 100),
}));

export const GR_BUILDING_RULES: FeeRuleRecord[] = [
  grRule({
    id: "grandrapids-bld-application",
    code: "GR-BLD-APP",
    label: "Building permit application fee (base fee), $54",
    description:
      'S1, BUILDING PERMITS: "Building Permit, Base Fee — City Code, Chapter 131 — $54.00 plus Zoning Permit fee", with the footnote that defines the whole ladder: "Base fee charged for first $1,000 of construction cost; incremental fee charged for each additional $1,000 of construction/contract cost." The fee chart prints it as the "App Fee" column — $54.00 on every one of its 500 rows — and the City\'s calculator initialises `buildingAppFee = 54.00` before anything else. Unconditional for every standard building permit, and the calculator waives it only on its two project-type branches, which contradict the schedule\'s own flat rows and are not modelled (research §6). ' + DEMOLITION_NOTE,
    feeType: "flat",
    config: { amountCents: 5_400 },
    conditions: { all: [NOT_DEMOLITION] },
    priority: 100,
  }),
  grRule({
    id: "grandrapids-bld-plan-review",
    code: "GR-BLD-PLAN-REVIEW",
    label: "Commercial plan review — $50 minimum, then 68¢ per $1,000 of value, whole dollars",
    description:
      'S1\'s BUILDING PERMIT FEE CHART, the "Com Plan Review" column: max($50, floor(units × $0.68)) in whole dollars, where units counts the whole $1,000s — $50 flat through the $74,001 row (floor(0.68 × 74) = 50), $51 from $75,001, $101 at $149,001, $340 at the chart\'s last row. Modelled as the chart\'s own 501 printed tiers rather than as a percentage, because the column floors to whole dollars and no rate in the engine can express that — every printed tier is charged as printed. Commercial only: the residential Total column never includes it, and the calculator sets `planReviewFee = 0, "N/A"` for residential. The two City surfaces agree on this column to the cent, which is the check that the chart\'s zoning column (which they do not agree on) is the schedule\'s rather than the calculator\'s. ' + DEMOLITION_NOTE,
    feeType: "tiered_table",
    config: { basis: "valuation", tiers: PLAN_REVIEW_TIERS },
    componentType: "plan_review",
    conditions: { all: [NOT_RESIDENTIAL, NOT_DEMOLITION] },
    priority: 150,
  }),
  grRule({
    id: "grandrapids-bld-incremental",
    code: "GR-BLD-INCREMENTAL",
    label: "Building permit incremental fee, $6.80 per each additional $1,000",
    description:
      'S1: "Building Permit, Incremental Fee — City Code, Chapter 131 — $6.80", with footnote 1 — "incremental fee charged for each additional $1,000 of construction/contract cost" — and the chart\'s "Permit Fee" column, which is $6.80 × units on every row (the $1–$1,000 row prints "-", then 6.80, 13.60, 20.40 …). Modelled with a $1,000 threshold and a $1,000 round-up, which is what the chart\'s rows do: any value in the "$150,001 – $151,000" row pays the row\'s 150 steps ($1,020.00), so the partial thousand is charged as a whole step. The City\'s calculator rounds that remainder down instead — `Math.floor((value - 1000) / 1000)` gives 149 units for $150,001 — and the chart, being the schedule with its authority printed beside each row, is what is charged (research §6 records the calculator\'s reading rather than smoothing it over). ' + DEMOLITION_NOTE,
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 680,
      thresholdCents: 100_000,
      incrementCents: 100_000,
    },
    conditions: { all: [NOT_DEMOLITION] },
    priority: 200,
  }),
  grRule({
    id: "grandrapids-bld-zoning-residential",
    code: "GR-BLD-ZONING-RES",
    label: "Zoning permit fee — residential, $25",
    description:
      'S1\'s footnote 6: "For 1-2 family residential projects, a $25 Zoning Permit fee typically is added to the Building Permit fee" — and the chart\'s "Zoning / Residential" column prints $25.00 on every one of its 500 rows, without exception. The calculator agrees: `residentialZoneCap = 25`, and `Math.min(baselineZoningFee, 25)` can only ever be 25, because the baseline itself floors at 25. Fires when occupancy is "residential" — single-family homes and duplexes, in the calculator page\'s own definition — and never carries plan review. ' + DEMOLITION_NOTE,
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: { all: [RESIDENTIAL, NOT_DEMOLITION] },
    priority: 300,
  }),
  grRule({
    id: "grandrapids-bld-zoning-commercial",
    code: "GR-BLD-ZONING-COM",
    label: "Zoning permit fee — commercial, 10% of application + permit, $25 floor, $290 cap",
    description:
      'S1\'s footnote 6: "For all other projects, a maximum $290 Zoning Permit fee typically is added; this fee is implemented on a sliding scale so as not to be more than 10% of the Building Permit fee." The chart\'s "Zoning / Commercial" column is exactly that read with the application fee inside it: 10% of ($54 + $6.80 × units) in exact cents — $25.12 at 29 units (the first value above the floor), $106.72 at 149 units, clamped to $290 from 419 units where 10% first reaches $290.32 — verified on all 500 rows, and modelled as a percentage of the permit fee on the rule\'s own `permit_fee` basis with the chart\'s $25 floor and $290 cap, which is the same arithmetic stated as the engine reads it. The City\'s calculator computes a different expression — `Math.floor(0.68 * units)` clamped [25, 290], which omits the application fee\'s $5.40 and floors to whole dollars ($101.00 where the chart says $106.72). The chart is the schedule; the calculator is labelled an estimate; the chart is charged and this rule carries the payload\'s needs_review flag so the disagreement stays visible. Gated on the valuation being present, because both parts of the subtotal it reads are built from it. ' + DEMOLITION_NOTE,
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 1000 },
    minimumCents: 2_500,
    maximumCents: 29_000,
    conditions: { all: [NOT_RESIDENTIAL, { field: "valuation", op: "exists" }, NOT_DEMOLITION] },
    priority: 300,
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical — application fee plus four amperage bands (Chapter 133)        */
/* -------------------------------------------------------------------------- */

const SERVICE_BAND_NOTE =
  "The band is chosen by custom.amperage (whole amperes of the service), so at most one fires and a permit whose service size has not been declared fires none — the schedule publishes no default band. The section's own head row, \"Application (Includes 1 inspection) $52.00\", is what makes this permit a fee and an inspection rather than a fee alone.";

export const GR_ELECTRICAL_RULES: FeeRuleRecord[] = [
  grRule({
    id: "grandrapids-elec-application",
    code: "GR-ELEC-APP",
    label: "Electrical permit application fee, $52 (includes one inspection)",
    description:
      'S1, ELECTRCIAL [sic] PERMIT FEES: "Application (Includes 1 inspection) — City Code, Chapter 133 — $52.00". The head row of the electrical section and the price of the permit itself; the inspection that comes with it is part of that price, and each additional inspection is $42 (named, not modelled). Unconditional — the schedule prices the application once, whatever the job on it — while the rows below price what the job is.',
    feeType: "flat",
    config: { amountCents: 5_200 },
    priority: 100,
  }),
  grRule({
    id: "grandrapids-elec-service-200",
    code: "GR-ELEC-SVC-200",
    label: "Electrical service — up to 200 amps, $17",
    description: `S1, Chapter 133: "Up to 200 Amp Service — $17.00". ${SERVICE_BAND_NOTE}`,
    feeType: "flat",
    config: { amountCents: 1_700 },
    conditions: { field: "custom.amperage", op: "lte", value: 200 },
    priority: 200,
  }),
  grRule({
    id: "grandrapids-elec-service-600",
    code: "GR-ELEC-SVC-600",
    label: "Electrical service — 201 to 600 amps, $31",
    description: `S1, Chapter 133: "201-600 Amp Service — $31.00". ${SERVICE_BAND_NOTE}`,
    feeType: "flat",
    config: { amountCents: 3_100 },
    conditions: {
      all: [
        { field: "custom.amperage", op: "gt", value: 200 },
        { field: "custom.amperage", op: "lte", value: 600 },
      ],
    },
    priority: 201,
  }),
  grRule({
    id: "grandrapids-elec-service-1000",
    code: "GR-ELEC-SVC-1000",
    label: "Electrical service — 601 to 1,000 amps, $63",
    description: `S1, Chapter 133: "601-1,000 Amp Service — $63.00". ${SERVICE_BAND_NOTE}`,
    feeType: "flat",
    config: { amountCents: 6_300 },
    conditions: {
      all: [
        { field: "custom.amperage", op: "gt", value: 600 },
        { field: "custom.amperage", op: "lte", value: 1_000 },
      ],
    },
    priority: 202,
  }),
  grRule({
    id: "grandrapids-elec-service-over-1000",
    code: "GR-ELEC-SVC-OVER1000",
    label: "Electrical service — over 1,000 amps (and GFPE), $105",
    description: `S1, Chapter 133: "Over 1,000 Amp Service & GFPE — $105.00", the open top band. ${SERVICE_BAND_NOTE} The "& GFPE" sits in the schedule's own row name — a ground-fault protected equipment service takes this band too.`,
    feeType: "flat",
    config: { amountCents: 10_500 },
    conditions: { field: "custom.amperage", op: "gt", value: 1_000 },
    priority: 203,
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing — application fee, the $5 list, water heater, distribution sizes  */
/* -------------------------------------------------------------------------- */

const DISTRIBUTION_NOTE =
  "The six rows are keyed on custom.water_distribution — \"3/4\", \"1\", \"1-1/4\", \"1-1/2\", \"2\" or \"over-2\" — so exactly one can fire and an undeclared size fires none. The schedule's column header says \"Fee per Unit\" without saying what the unit beyond the size itself is; modelled as one declared distribution size per permit (research §6).";

export const GR_PLUMBING_RULES: FeeRuleRecord[] = [
  grRule({
    id: "grandrapids-plumb-application",
    code: "GR-PLUMB-APP",
    label: "Plumbing permit application fee, $52 (includes one inspection)",
    description:
      'S1, PLUMBING PERMIT FEES: "Application (Includes 1 inspection) — City Code, Chapter 132 — $52.00". The head row of the plumbing section, identical in amount to the electrical and mechanical application rows because the schedule prices the three trades\' applications the same way. Unconditional; each additional inspection is $42 (named, not modelled).',
    feeType: "flat",
    config: { amountCents: 5_200 },
    priority: 100,
  }),
  grRule({
    id: "grandrapids-plumb-item",
    code: "GR-PLUMB-ITEM",
    label: "Plumbing — each listed fixture or device, $5",
    description:
      'S1, Chapter 132: twenty-eight named items at "$5.00" each — backflow preventer, backwater valve, bath tub-shower, catch basin/sump/roof drain, dishwashing machine, drinking fountain, floor drain/floor sink/trench drain, garbage disposal, grease trap/oil separator, laundry tray/stand pipes, lavatory, lawn sprinkler, water connected appliance, three-compartment pot and pan, kitchen sink, sink other than family use, slop or service sink, stacks (soil, waste, vent), urinal, water closet/toilet, foot bath/pedicure bath/shampoo, clinical sink, eye wash/emergency shower and bidet. The list is closed — unlike Detroit\'s catch-all row this schedule says "plus any other" nowhere — so the row is what it is: each listed item on the `fixtures` count, no default and no catch-all. A water heater is on the same page at $21 and is priced by its own row below.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 500 },
    priority: 200,
  }),
  grRule({
    id: "grandrapids-plumb-water-heater",
    code: "GR-PLUMB-WATER-HEATER",
    label: "Plumbing — water heater, $21",
    description:
      'S1, Chapter 132: "Water Heater — $21.00", sitting among the $5 rows at its own price. Charged when custom.water_heater is true — the schedule gives it a price but no quantity column, so it is modelled as a declared item on the permit rather than multiplied by a count, and it stays off an estimate that does not declare one.',
    feeType: "flat",
    config: { amountCents: 2_100 },
    conditions: { field: "custom.water_heater", op: "eq", value: true },
    priority: 300,
  }),
  ...[
    { suffix: "075", value: "3/4", cents: 600, printed: 'Water Distribution 3/4" — $6.00' },
    { suffix: "1", value: "1", cents: 1_000, printed: 'Water Distribution 1" — $10.00' },
    { suffix: "125", value: "1-1/4", cents: 2_100, printed: 'Water Distribution 1-1/4" — $21.00' },
    { suffix: "150", value: "1-1/2", cents: 2_600, printed: 'Water Distribution 1-1/2" — $26.00' },
    { suffix: "2", value: "2", cents: 3_100, printed: 'Water Distribution System 2" Water — $31.00' },
    { suffix: "over2", value: "over-2", cents: 3_600, printed: 'Distribution System Over 2" — $36.00' },
  ].map((row, index) =>
    grRule({
      id: `grandrapids-plumb-distribution-${row.suffix}`,
      code: `GR-PLUMB-DIST-${row.suffix.toUpperCase()}`,
      label: `Plumbing — water distribution ${row.value.replace("over-2", "over 2 inches")}, $${(row.cents / 100).toFixed(2)}`,
      description: `S1, Chapter 132: "${row.printed}". ${DISTRIBUTION_NOTE}`,
      feeType: "flat",
      config: { amountCents: row.cents },
      conditions: { field: "custom.water_distribution", op: "eq", value: row.value },
      priority: 400 + index,
    }),
  ),
];
