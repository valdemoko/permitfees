import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Detroit, Michigan fee rules — REAL DATA.
 *
 * Sources (research/michigan/detroit.md records how each was read):
 *
 *  S1  BSEED Fee Schedule, "EFFECTIVE, JANUARY 1, 2024", modified 7/18/2025 —
 *      the 51-page document Detroit's Building Permit Fees page links as the
 *      current download. Read 2026-09-25 in three pdftotext modes: -layout and
 *      plain both mis-pair labels with amounts in this document, -table pairs
 *      them, and every figure in this file is the -table pairing.
 *      https://detroitmi.gov/sites/detroitmi.localhost/files/2025-12/Fee%20Schedule.Effective_January_1_2024_Modified%20July%2018%2C%202025.pdf
 *  S2  Building Permit Fees document page — the page that links S1 as the
 *      current download (https://detroitmi.gov/document/building-permit-fees),
 *      which is how the document in force was told from the older schedules
 *      still on the domain.
 *  S3–S8  The BSEED service pages (building permits, trade permits,
 *      construction submittals, plan review, construction inspection, the
 *      department page): process, licences, portal and phone numbers. No
 *      amount in this file comes from them.
 *
 * **The mechanism, in one paragraph.** Detroit prints three different
 * schedules inside one document, and this module takes exactly one shape from
 * each. **Building** is a nine-band ladder on project cost — "the project cost
 * (design and construction cost)" — where every band carries its own printed
 * Base for the first N dollars and its own rate per $1,000 "or fraction
 * thereof" above the threshold: $271.43 flat at $2,000 or less, up to
 * $271,433.32 + $1.81 per $1,000 over $50,000,000. The phrase "or fraction
 * thereof" is printed on every rate row, so the amount above each threshold
 * rounds UP to a whole $1,000 — the opposite reading from Pittsburgh's block,
 * which omits the phrase and prorates: same engine, two interpretations, each
 * sourced. **Electrical** opens PART A with a flat $66 base fee and then
 * prices work by count and by service size: $20 per circuit, $1.17 / $1.46
 * per fixture (residential / commercial), and eight service bands keyed on
 * custom.amperage and custom.over_1000_volts (six at 1,000 volts or less, two
 * above) so that exactly one can fire. **Plumbing** charges a $73 application
 * fee that is non-refundable and credited nowhere, then $44 per listed item,
 * $146 per building drain or sewer, and $176 per re-inspection.
 *
 * **Five readings the schedule does not settle** — each recorded in
 * research/michigan/detroit.md §6 and none of them charged here: where the
 * "square foot cost table" the City estimates project cost from lives (it is
 * named as "attached" and appears in no page of the PDF, and no page read on
 * 2026-09-25 links it); whether the 7% plan-review percentages are read from
 * the building permit fee or from the trade's own permit fee (the unit column
 * prints "% of Bldg. Permit Fee" under "As part of Building Permit
 * Processing"); the deposit described as "35% of the building permit fee" and,
 * two sentences later, "The deposit of 30% Building Permit fee is adjustable
 * towards the full fee"; the $53 "Manhole, Catch Basin" row sitting under a
 * $146 row that already lists manhole and catch basin; and whether the $66
 * base fee is per permit or per application — modelled per permit, because
 * "Base fee" with no unit means that everywhere else in this document.
 *
 * **What is deliberately NOT here:**
 *
 *  - **Plan review**, all three of its published forms: 7% "of Bldg. Permit
 *    Fee" per trade (electrical, mechanical, plumbing — prepaid), the 35%
 *    building/structural/zoning deposit with its contradictory 30% credit
 *    sentence, and the $158 + $53-per-sheet per-discipline fee. A cross-permit
 *    percentage whose base is unresolved, a deposit whose credit is stated
 *    two ways, and a sheet count this site does not collect.
 *  - **Refunds and their deductions** — 35% of the building permit fee, and
 *    25% of any permit capped at $100 — money that moves after the fact.
 *  - **Demolition and wrecking**, priced on cubic volume in its own section
 *    ("Not exceeding 30,000 cu. Ft. — without basement: $143 / with basement:
 *    $249", the Detroit Demolition Wrecking Fee's ladder, $8,858 with
 *    explosives). Every building band here excludes work_type = demolition
 *    rather than pricing a wrecking job from a construction valuation.
 *  - **The rest of the electrical section**: A2 rough inspections ($59 for
 *    one- and two-family dwellings), A4 units by nameplate HP/kW/kVA in seven
 *    bands ($29–$254), A6 interruptible service, A7 panel boards and transfer
 *    switches by amperage, A8 hardwired cooking equipment, A9 feeders, A10
 *    underfloor headers, A11–A14, and all of Part B — $176/hour general
 *    repairs and special inspections, service reconnects, fire alarm systems,
 *    EV charging, telecommunications cabling, renewable energy — which is also
 *    what the base fee's own note carves out: "Base Fee does not apply to a
 *    permit containing only Part B items."
 *  - **The rest of the plumbing section**: the $53 manhole row (its
 *    relationship to the $146 row is not stated), medical gas ($176/hour),
 *    water distribution ($66) and water service ($88), and the hourly
 *    inspection and survey rows.
 *  - **The whole mechanical block** — unfired pressure vessels, power and
 *    process piping, hazardous gases, boilers, gas-fired equipment, fire
 *    suppression, refrigeration. This jurisdiction's third page is plumbing
 *    because the plumbing schedule is the one that publishes clean per-item
 *    rates.
 *  - **Change of Use** ($249), revised permits ($187 minimum plus the
 *    difference between the new and old fee), sign permits, zoning and site
 *    plan review ($210 / $466), certificates of occupancy ($147), temporary
 *    certificates ($520), permit extensions ($227), "fail to obtain permit"
 *    and "fail to gain access" charges ($176 each), property maintenance,
 *    dangerous buildings, vacant property, and Parts A–C of the schedule (the
 *    licence and examination catalogue).
 *  - **Water and sewer permits** (Water & Sewerage Department) and
 *    **right-of-way permits** (Department of Public Works) — other
 *    authorities' charges, named on the pages that mention them.
 *  - **Payment charges**: the 10% delinquent service charge and the $35
 *    returned-check fee.
 *
 * **This module is the single definition of Detroit's fee rules.** The seed
 * writes exactly these records and the tests assert against exactly these
 * records.
 */

/** The schedule's own header: "EFFECTIVE, JANUARY 1, 2024", modified 7/18/2025. */
export const DET_FEE_EFFECTIVE_FROM = "2024-01-01";

export const DET_FEE_SCHEDULE_SOURCE_KEY = "detroit-bseed-fee-schedule";
export const DET_FEES_DOC_PAGE_SOURCE_KEY = "detroit-building-permit-fees-doc";
export const DET_BUILDING_PERMITS_SOURCE_KEY = "detroit-building-permits";
export const DET_TRADE_PERMITS_SOURCE_KEY = "detroit-trade-permits";
export const DET_CONSTRUCTION_SOURCE_KEY = "detroit-construction";
export const DET_PLAN_REVIEW_SOURCE_KEY = "detroit-permits-plan-review";
export const DET_INSPECTION_SOURCE_KEY = "detroit-construction-inspection";
export const DET_BSEED_DEPT_SOURCE_KEY = "detroit-bseed-dept";

/* -------------------------------------------------------------------------- */
/* Conditions — the facts this schedule turns on                              */
/* -------------------------------------------------------------------------- */

/**
 * Demolition is priced by cubic volume on its own page of the schedule, not by
 * construction cost, so the building ladder refuses it. Written as NOT(eq)
 * rather than `neq` on purpose: a comparison against a fact we do not have is
 * not a match, so `work_type neq demolition` would switch the whole ladder off
 * for a reader who never declared a work type — while NOT(eq) lets the ladder
 * apply whenever demolition is not what was asked for.
 */
const NOT_DEMOLITION: FeeCondition = {
  not: { field: "work_type", op: "eq", value: "demolition" },
};

/**
 * The fixture split is a fee row, not an occupancy class the schedule defines.
 * Absent the flag the commercial figure applies — the larger figure, which is
 * the default this site uses for column splits everywhere.
 */
const RESIDENTIAL_FIXTURE: FeeCondition = {
  field: "occupancy",
  op: "eq",
  value: "residential",
};
const NOT_RESIDENTIAL_FIXTURE: FeeCondition = { not: RESIDENTIAL_FIXTURE };

/** Voltage class of the service, from custom.over_1000_volts (true / false / absent). */
const OVER_1000_VOLTS: FeeCondition = {
  field: "custom.over_1000_volts",
  op: "eq",
  value: true,
};
const NOT_OVER_1000_VOLTS: FeeCondition = { not: OVER_1000_VOLTS };

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function detRule(
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
    effectiveFrom: DET_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: DET_FEE_SCHEDULE_SOURCE_KEY,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building — the nine-band ladder on project cost (S1 page 7)                */
/* -------------------------------------------------------------------------- */

type BuildingBand = {
  band: number;
  /** Lower bound in whole dollars, exclusive. null = the floor band. */
  fromDollars: number | null;
  /** Upper bound in whole dollars, inclusive. null = the open top band. */
  toDollars: number | null;
  /** The band's printed Base, in cents (the floor band's whole charge). */
  baseCents: number;
  /** Printed rate in cents per $1,000 over the threshold. null = flat band. */
  ratePerThousand: number | null;
  /** The schedule's own printed lines for this band, quoted on the rule. */
  printed: string;
  label: string;
};

const BAND_SEAM_NOTE =
  "Each band is modelled with its own printed Base and its own printed rate, never chained: the schedule's figures do not meet exactly at the seams ($271.43 + 23 × $34.09 = $1,055.50 against the printed $1,055.57 — a 7¢ seam that grows to $26.67 at $50,000,000), and chaining would charge amounts the document does not print.";

const DEMOLITION_NOTE =
  "Demolition is excluded from this ladder: the schedule prices wrecking by cubic volume in its own section, so a wrecking job is not priced from a construction valuation here.";

const BUILDING_BANDS: BuildingBand[] = [
  {
    band: 1,
    fromDollars: null,
    toDollars: 2_000,
    baseCents: 27_143,
    ratePerThousand: null,
    printed: "$2,000 or less — Flat — $271.43",
    label: "Building permit — project cost $2,000 or less, $271.43 flat",
  },
  {
    band: 2,
    fromDollars: 2_000,
    toDollars: 25_000,
    baseCents: 27_143,
    ratePerThousand: 3_409,
    printed:
      "Over $2,000 but not over $25,000 — First $2,000 Base $271.43; Per $1,000 or fraction thereof over $2,000 $34.09",
    label:
      "Building permit — project cost over $2,000 to $25,000, $271.43 + $34.09 per $1,000 or fraction thereof",
  },
  {
    band: 3,
    fromDollars: 25_000,
    toDollars: 100_000,
    baseCents: 105_557,
    ratePerThousand: 2_453,
    printed:
      "Over $25,000 but not over $100,000 — First $25,000 Base $1,055.57; Per $1,000 or fraction thereof over $25,000 $24.53",
    label:
      "Building permit — project cost over $25,000 to $100,000, $1,055.57 + $24.53 per $1,000 or fraction thereof",
  },
  {
    band: 4,
    fromDollars: 100_000,
    toDollars: 500_000,
    baseCents: 289_529,
    ratePerThousand: 2_782,
    printed:
      "Over $100,000 but not over $500,000 — First $100,000 Base $2,895.29; Per $1,000 or fraction thereof over $100,000 $27.82",
    label:
      "Building permit — project cost over $100,000 to $500,000, $2,895.29 + $27.82 per $1,000 or fraction thereof",
  },
  {
    band: 5,
    fromDollars: 500_000,
    toDollars: 1_000_000,
    baseCents: 1_402_405,
    ratePerThousand: 2_624,
    printed:
      "Over $500,000 but not over $1,000,000 — First $500,000 Base $14,024.05; Per $1,000 or fraction thereof over $500,000 $26.24",
    label:
      "Building permit — project cost over $500,000 to $1,000,000, $14,024.05 + $26.24 per $1,000 or fraction thereof",
  },
  {
    band: 6,
    fromDollars: 1_000_000,
    toDollars: 5_000_000,
    baseCents: 2_714_333,
    ratePerThousand: 1_154,
    printed:
      "Over $1,000,000 but not over $5,000,000 — First $1,000,000 Base $27,143.33; Per $1,000 or fraction thereof over $1,000,000 $11.54",
    label:
      "Building permit — project cost over $1,000,000 to $5,000,000, $27,143.33 + $11.54 per $1,000 or fraction thereof",
  },
  {
    band: 7,
    fromDollars: 5_000_000,
    toDollars: 20_000_000,
    baseCents: 7_328_700,
    ratePerThousand: 597,
    printed:
      "Over $5,000,000 but not over $20,000,000 — First $5,000,000 Base $73,287.00; Per $1,000 or fraction thereof over $5,000,000 $5.97",
    label:
      "Building permit — project cost over $5,000,000 to $20,000,000, $73,287.00 + $5.97 per $1,000 or fraction thereof",
  },
  {
    band: 8,
    fromDollars: 20_000_000,
    toDollars: 50_000_000,
    baseCents: 16_285_999,
    ratePerThousand: 362,
    printed:
      "Over $20,000,000 but not over $50,000,000 — First $20,000,000 Base $162,859.99; Per $1,000 or fraction thereof over $20,000,000 $3.62",
    label:
      "Building permit — project cost over $20,000,000 to $50,000,000, $162,859.99 + $3.62 per $1,000 or fraction thereof",
  },
  {
    band: 9,
    fromDollars: 50_000_000,
    toDollars: null,
    baseCents: 27_143_332,
    ratePerThousand: 181,
    printed:
      "Over $50,000,000 — First $50,000,000 Base $271,433.32; Per $1,000 or fraction thereof over $50,000,000 $1.81",
    label:
      "Building permit — project cost over $50,000,000, $271,433.32 + $1.81 per $1,000 or fraction thereof",
  },
];

function buildingBandRule(band: BuildingBand): FeeRuleRecord {
  const all: FeeCondition[] = [];
  if (band.fromDollars !== null) {
    all.push({ field: "valuation", op: "gt", value: band.fromDollars * 100 });
  }
  if (band.toDollars !== null) {
    all.push({ field: "valuation", op: "lte", value: band.toDollars * 100 });
  }
  all.push(NOT_DEMOLITION);

  const isFloor = band.ratePerThousand === null;
  const floorNote = isFloor
    ? " This band is the ladder's minimum stated as a row: a $500 repair permit is $271.43, modelled as the schedule writes it rather than as a minimum on the other rows."
    : " The amount above the threshold rounds up to a whole $1,000, because the rate row prints \"or fraction thereof\".";

  return detRule({
    id: `detroit-building-band-${band.band}`,
    code: `DET-BLD-BAND-${band.band}`,
    label: band.label,
    description: `S1 page 7, "A: BUILDING and RESIDENTIAL PERMITS / New Buildings, Alterations, Repairs, And Additions": "${band.printed}". The schedule states the basis above the table — "The following general building permit fees are based on the project cost (design and construction cost) estimated using the square foot cost table copy attached" — so the reader's valuation is that project cost, and the band is selected by it.${floorNote} ${DEMOLITION_NOTE} ${BAND_SEAM_NOTE} The square-foot cost table the City estimates from is named as attached and appears in no page of the PDF, nor on any City page read on 2026-09-25 (research §6): the basis is unambiguous, the City's own estimator is unpublished.`,
    feeType: isFloor ? "flat" : "per_thousand",
    config: isFloor
      ? { amountCents: band.baseCents }
      : {
          basis: "valuation",
          centsPerThousand: band.ratePerThousand,
          thresholdCents: band.fromDollars! * 100,
          incrementCents: 100_000,
          baseCents: band.baseCents,
        },
    conditions: { all },
  });
}

export const DET_BUILDING_RULES: FeeRuleRecord[] = BUILDING_BANDS.map(buildingBandRule);

/* -------------------------------------------------------------------------- */
/* Electrical — PART A base fee, circuits, fixtures, service bands (S1 p.19)  */
/* -------------------------------------------------------------------------- */

const ELECTRICAL_BASE_NOTE =
  'S1 page 19 opens the ELECTRICAL section with "PART A / Base fee / Base / $66", and the section carries its own note: "NOTE: Base Fee does not apply to a permit containing only Part B items." Modelled as one charge per permit — the schedule never says "per year" or "per application", and "Base fee" with no unit means one charge everywhere else in this document (research §6 records the question rather than assuming the answer) — and applied to every estimate here, because the exception it prints describes Part B work, which this page names and does not model.';

const SERVICE_BAND_NOTE =
  "The band is chosen by custom.amperage (whole amperes of the service) and the voltage class by custom.over_1000_volts, so exactly one of the eight service rows can fire: the six low-voltage rows each require the flag to be absent or false, the two high-voltage rows require it true.";

const SERVICE_ROWS: Array<{
  band: string;
  amountCents: number;
  priority: number;
  conditions: FeeCondition;
  label: string;
  printed: string;
}> = [
  {
    band: "LE100",
    amountCents: 5_900,
    priority: 131,
    label: "1,000 V or less, 100 A or less",
    conditions: { all: [NOT_OVER_1000_VOLTS, { field: "custom.amperage", op: "lte", value: 100 }] },
    printed: "1,000 Volts or Less / 100 or less amperes — Each — $59",
  },
  {
    band: "100-200",
    amountCents: 11_700,
    priority: 132,
    label: "1,000 V or less, over 100 to 200 A",
    conditions: {
      all: [
        NOT_OVER_1000_VOLTS,
        { field: "custom.amperage", op: "gt", value: 100 },
        { field: "custom.amperage", op: "lte", value: 200 },
      ],
    },
    printed: "1,000 Volts or Less / Over 100 to 200 amperes — Each — $117",
  },
  {
    band: "200-400",
    amountCents: 17_600,
    priority: 133,
    label: "1,000 V or less, over 200 to 400 A",
    conditions: {
      all: [
        NOT_OVER_1000_VOLTS,
        { field: "custom.amperage", op: "gt", value: 200 },
        { field: "custom.amperage", op: "lte", value: 400 },
      ],
    },
    printed: "1,000 Volts or Less / Over 200 to 400 amperes — Each — $176",
  },
  {
    band: "400-800",
    amountCents: 29_300,
    priority: 134,
    label: "1,000 V or less, over 400 to 800 A",
    conditions: {
      all: [
        NOT_OVER_1000_VOLTS,
        { field: "custom.amperage", op: "gt", value: 400 },
        { field: "custom.amperage", op: "lte", value: 800 },
      ],
    },
    printed: "1,000 Volts or Less / Over 400 to 800 amperes — Each — $293",
  },
  {
    band: "800-1200",
    amountCents: 52_700,
    priority: 135,
    label: "1,000 V or less, over 800 to 1,200 A",
    conditions: {
      all: [
        NOT_OVER_1000_VOLTS,
        { field: "custom.amperage", op: "gt", value: 800 },
        { field: "custom.amperage", op: "lte", value: 1_200 },
      ],
    },
    printed: "1,000 Volts or Less / Over 800 to 1,200 amperes — Each — $527",
  },
  {
    band: "GT1200",
    amountCents: 82_000,
    priority: 136,
    label: "1,000 V or less, over 1,200 A",
    conditions: {
      all: [NOT_OVER_1000_VOLTS, { field: "custom.amperage", op: "gt", value: 1_200 }],
    },
    printed: "1,000 Volts or Less / Over 1,200 amperes — Each — $820",
  },
  {
    band: "HV-LE200",
    amountCents: 28_100,
    priority: 137,
    label: "over 1,000 V, 200 A or less",
    conditions: {
      all: [OVER_1000_VOLTS, { field: "custom.amperage", op: "lte", value: 200 }],
    },
    printed: "Over 1,000 Volts / 200 amperes or less — Each — $281",
  },
  {
    band: "HV-GT200",
    amountCents: 42_200,
    priority: 138,
    label: "over 1,000 V, over 200 A",
    conditions: {
      all: [OVER_1000_VOLTS, { field: "custom.amperage", op: "gt", value: 200 }],
    },
    printed: "Over 1,000 Volts / Over 200 amperes — Each — $422",
  },
];

const SERVICE_RULES: FeeRuleRecord[] = SERVICE_ROWS.map((row) =>
  detRule({
    id: `detroit-elec-service-${row.band.toLowerCase()}`,
    code: `DET-ELEC-SVC-${row.band}`,
    label: `Electrical service — ${row.label}, $${(row.amountCents / 100).toFixed(2)}`,
    description: `S1 page 21, "A5: SERVICE": "${row.printed}". ${SERVICE_BAND_NOTE} The row is a flat charge per service — the schedule's unit column reads "Each" — and a permit whose service size has not been declared fires none of the eight, so an estimate without custom.amperage says the input is missing rather than inventing a band.`,
    feeType: "flat",
    config: { amountCents: row.amountCents },
    conditions: row.conditions,
    priority: row.priority,
  }),
);

export const DET_ELECTRICAL_RULES: FeeRuleRecord[] = [
  detRule({
    id: "detroit-elec-base",
    code: "DET-ELEC-BASE",
    label: "Electrical permit Part A base fee, $66",
    description: ELECTRICAL_BASE_NOTE,
    feeType: "flat",
    config: { amountCents: 6_600 },
    priority: 100,
  }),
  detRule({
    id: "detroit-elec-circuit",
    code: "DET-ELEC-CIRCUIT",
    label: "Electrical — each circuit, $20",
    description:
      'S1 page 19, "A1: CIRCUITS — Each circuit (New or Extended, Altered or Removed) — Each — $20". Read from custom.circuits: one count prices new, extended, altered and removed circuits alike, because the schedule gives them one price. No condition and no default — a reader who has not declared a circuit count is told the input is missing rather than quoted a fee for zero circuits.',
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 2_000 },
    priority: 110,
  }),
  detRule({
    id: "detroit-elec-fixture-res",
    code: "DET-ELEC-FIXTURE-RES",
    label: "Electrical — fixture, residential, $1.17 each",
    description:
      'S1 page 20, "A3: FIXTURES - RESIDENTIAL — Per Fixture — Per fixture — $1.17", with the schedule\'s own redirect beneath it: "Floodlights or lamps of 1,000 watts or more is under the category of A4-Electrical Units" — A4 is named on this site\'s page and not modelled. Fires when occupancy is "residential"; the schedule splits the fixture row residential/commercial without defining either term on this page, so the site reads the reader\'s occupancy and defaults to the commercial figure when it is absent.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 117 },
    conditions: RESIDENTIAL_FIXTURE,
    priority: 120,
  }),
  detRule({
    id: "detroit-elec-fixture-com",
    code: "DET-ELEC-FIXTURE-COM",
    label: "Electrical — fixture, commercial, $1.46 each",
    description:
      'S1 page 20, "A3: FIXTURES - COMMERCIAL (Luminaires) — Per Fixture — Per fixture — $1.46". This is the row every permit takes when occupancy is not "residential" — including a permit that declares no occupancy at all — because the larger figure is the default this site uses wherever a schedule splits a row without defining the split.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 146 },
    conditions: NOT_RESIDENTIAL_FIXTURE,
    priority: 121,
  }),
  ...SERVICE_RULES,
];

/* -------------------------------------------------------------------------- */
/* Plumbing — application fee, per-item rows, drain/sewer, re-inspection       */
/* -------------------------------------------------------------------------- */

export const DET_PLUMBING_RULES: FeeRuleRecord[] = [
  detRule({
    id: "detroit-plumb-application",
    code: "DET-PLUMB-APPLICATION",
    label: "Plumbing permit application fee, $73 (non-refundable)",
    description:
      'S1 page 28, "PLUMBING / INSTALLATION PERMITS — Application Fee (Non-Refundable) — Flat — $73". Charged as its own line rather than as a floor, because the schedule credits it nowhere — the opposite of Philadelphia\'s filing fee, whose page says the fee is "applied toward the final permit fee". Non-refundable means the amount is at risk if the application is abandoned; it does not change what the permit costs. Unconditional: every plumbing installation permit pays it.',
    feeType: "flat",
    config: { amountCents: 7_300 },
    priority: 100,
  }),
  detRule({
    id: "detroit-plumb-item",
    code: "DET-PLUMB-ITEM",
    label: "Plumbing — each listed item, $44",
    description:
      'S1 page 28: "Each: Stack, Stack Alteration (soil, waste, vent, conductor), Sump, Interceptor, Pump, Device, Plumbing Fixtures, Plumbing Appliance, Plumbing Appurtenance, Plus Any Other Fixture, Drain, Water Connected Appliance or Appurtenance Not specifically Listed — Each — $44". The row is the schedule\'s own catch-all — eight things named and then everything else of the kind — so one fixtures count prices all of them, which is exactly what the row means. No condition: a reader with no item count is told the input is missing rather than quoted $0.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 4_400 },
    priority: 110,
  }),
  detRule({
    id: "detroit-plumb-drain",
    code: "DET-PLUMB-DRAIN",
    label: "Plumbing — building drain or sewer, $146 each",
    description:
      'S1 page 28: "Building Drain, Building Sewer (sanitary, storm, manhole, catch basin, combined) each one — Each — $146", read from custom.connections so a drain count and a fixture count can never charge each other. The very next line prices "Manhole, Catch Basin, each one" at $53 under this row, and the schedule never states whether that is a separate scope or a partial list (research §6) — so only the unambiguous $146 row is modelled.',
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 14_600 },
    priority: 120,
  }),
  detRule({
    id: "detroit-plumb-reinspection",
    code: "DET-PLUMB-REINSPECTION",
    label: "Plumbing — re-inspection, $176",
    description:
      'S1 page 28, "SPECIAL INSPECTION FEES — Re-inspection Fee (Work not ready, no access, etc.) — Per re-inspection — $176". Charged only when custom.re_inspection is true, because it is a charge for a second visit rather than a price of the permit: it fires for the attempt that failed, not for the work.',
    feeType: "flat",
    config: { amountCents: 17_600 },
    conditions: { field: "custom.re_inspection", op: "eq", value: true },
    componentType: "inspection",
    priority: 500,
  }),
];
