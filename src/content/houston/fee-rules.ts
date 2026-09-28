import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Houston fee rules — REAL DATA.
 *
 * Source: City of Houston, City-Wide Fee Schedule
 *         https://cohweb.houstontx.gov/fin_feeschedule/default.aspx
 *         Department: HPW. Statutory authority cited per rule.
 *         Every amount below shows `As Of 01/01/2026` in the schedule.
 *         Read and transcribed 2026-09-23.
 *
 * Research record: research/texas/houston.md sections 4.1 to 4.6.
 *
 * **This module is the single definition of Houston's fee rules.** The database
 * seed writes exactly these records, and the regression tests assert against
 * exactly these records. There is no second copy, so a test can never pass while
 * the published data says something else. If the schedule changes, this file
 * changes once, citing the new `As Of` date, and both the seed and the tests move
 * with it.
 *
 * Every rule carries its code section in `description` so a reader can find it in
 * the city's own schedule.
 */

const EFFECTIVE_FROM = "2026-01-01";

/**
 * Key of the source these rules cite.
 *
 * Exported and imported by the seed payload rather than written twice, because a
 * mismatch between this key and the source key in the payload is not a cosmetic
 * problem: the seed refuses to write a rule that cites an unknown source, so the
 * whole Houston seed would fail. A test asserts the two agree.
 */
export const HOUSTON_FEE_SCHEDULE_SOURCE_KEY = "houston-city-wide-fee-schedule";

const SOURCE = HOUSTON_FEE_SCHEDULE_SOURCE_KEY;

function houstonRule(
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
    effectiveFrom: EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/** A valuation bracket selection condition: `(lower, upper]` in cents. */
function valuationBracket(
  lowerCentsExclusive: number,
  upperCentsInclusive: number | null,
): FeeRuleRecord["conditions"] {
  const clauses: unknown[] = [
    { field: "valuation", op: "gt", value: lowerCentsExclusive },
  ];
  if (upperCentsInclusive !== null) {
    clauses.push({ field: "valuation", op: "lte", value: upperCentsInclusive });
  }
  return { all: clauses };
}

/* -------------------------------------------------------------------------- */
/* Structural building permit fee — Bldg. Code Sec. 118.2.1                   */
/* -------------------------------------------------------------------------- */

/**
 * Nine published brackets. Each carries the schedule's own Base Charge and its
 * own rate, verbatim.
 *
 * NOTE: the base charges are NOT arithmetically consistent with each other — see
 * research/texas/houston.md "Ambiguity A4". Houston adjusts each bracket independently
 * each year, so chaining one bracket's arithmetic into the next does not
 * reproduce the published base charge. We reproduce the published figures rather
 * than reconciling them, because those are the numbers the permit office will
 * charge.
 */
export const HOUSTON_STRUCTURAL_BRACKETS: FeeRuleRecord[] = [
  houstonRule({
    id: "hou-struct-b1",
    code: "STRUCT-118.2.1-B1",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — flat fee for valuations from $0.01 to $7,000.",
    feeType: "flat",
    config: { amountCents: 4_700 },
    conditions: valuationBracket(0, 700_000),
  }),
  houstonRule({
    id: "hou-struct-b2",
    code: "STRUCT-118.2.1-B2",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — base charge for the first $7,000 plus $5.36 per additional $1,000 (or fraction) above $7,000, for valuations of $7,001 to $150,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 4_700,
      thresholdCents: 700_000,
      incrementCents: 100_000,
      centsPerThousand: 536,
    },
    conditions: valuationBracket(700_000, 15_000_000),
  }),
  houstonRule({
    id: "hou-struct-b3",
    code: "STRUCT-118.2.1-B3",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — base charge for the first $150,000 plus $5.03 per additional $1,000 (or fraction) above $150,000, for valuations of $150,001 to $200,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 81_507,
      thresholdCents: 15_000_000,
      incrementCents: 100_000,
      centsPerThousand: 503,
    },
    conditions: valuationBracket(15_000_000, 20_000_000),
  }),
  houstonRule({
    id: "hou-struct-b4",
    code: "STRUCT-118.2.1-B4",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — base charge for the first $200,000 plus $4.70 per additional $1,000 (or fraction) above $200,000, for valuations of $200,001 to $300,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 106_686,
      thresholdCents: 20_000_000,
      incrementCents: 100_000,
      centsPerThousand: 470,
    },
    conditions: valuationBracket(20_000_000, 30_000_000),
  }),
  houstonRule({
    id: "hou-struct-b5",
    code: "STRUCT-118.2.1-B5",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — base charge for the first $300,000 plus $4.36 per additional $1,000 (or fraction) above $300,000, for valuations of $300,001 to $500,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 153_683,
      thresholdCents: 30_000_000,
      incrementCents: 100_000,
      centsPerThousand: 436,
    },
    conditions: valuationBracket(30_000_000, 50_000_000),
  }),
  houstonRule({
    id: "hou-struct-b6",
    code: "STRUCT-118.2.1-B6",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — base charge for the first $500,000 plus $4.02 per additional $1,000 (or fraction) above $500,000, for valuations of $500,001 to $1,000,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 240_966,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      centsPerThousand: 402,
    },
    conditions: valuationBracket(50_000_000, 100_000_000),
  }),
  houstonRule({
    id: "hou-struct-b7",
    code: "STRUCT-118.2.1-B7",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — base charge for the first $1,000,000 plus $3.68 per additional $1,000 (or fraction) above $1,000,000, for valuations of $1,000,001 to $5,000,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 442_387,
      thresholdCents: 100_000_000,
      incrementCents: 100_000,
      centsPerThousand: 368,
    },
    conditions: valuationBracket(100_000_000, 500_000_000),
  }),
  houstonRule({
    id: "hou-struct-b8",
    code: "STRUCT-118.2.1-B8",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — base charge for the first $5,000,000 plus $2.00 per additional $1,000 (or fraction) above $5,000,000, for valuations of $5,000,001 to $50,000,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 1_919_473,
      thresholdCents: 500_000_000,
      incrementCents: 100_000,
      centsPerThousand: 200,
    },
    conditions: valuationBracket(500_000_000, 5_000_000_000),
  }),
  houstonRule({
    id: "hou-struct-b9",
    code: "STRUCT-118.2.1-B9",
    label: "Structural building permit fee",
    description:
      "Bldg. Code Sec. 118.2.1 — base charge for the first $50,000,000 plus $1.34 per additional $1,000 (or fraction) above $50,000,000, for valuations of $50,000,001 and up.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 10_983_409,
      thresholdCents: 5_000_000_000,
      incrementCents: 100_000,
      centsPerThousand: 134,
    },
    conditions: valuationBracket(5_000_000_000, null),
  }),
];

/* -------------------------------------------------------------------------- */
/* Minimum, administrative and inspection fees — Bldg. Code Sec. 118.1        */
/* -------------------------------------------------------------------------- */

export const HOUSTON_MINIMUM_PERMIT_FEE: FeeRuleRecord = houstonRule({
  id: "hou-min-118.1.3",
  code: "MIN-118.1.3",
  label: "Minimum permit fee",
  description:
    "Bldg. Code Sec. 118.1.3 — minimum permit fee for all permits except plumbing.",
  componentType: "base",
  feeType: "flat",
  config: { amountCents: 9_106 },
  priority: 900,
});

export const HOUSTON_PLUMBING_MINIMUM_FEE: FeeRuleRecord = houstonRule({
  id: "hou-min-plumbing-118.1.3",
  code: "MIN-PLUMB-118.1.3",
  label: "Minimum permit fee (plumbing)",
  description: "Bldg. Code Sec. 118.1.3 — plumbing minimum permit fee.",
  feeType: "flat",
  config: { amountCents: 9_756 },
  priority: 900,
});

export const HOUSTON_ADMINISTRATIVE_FEE: FeeRuleRecord = houstonRule({
  id: "hou-admin-118.1.1",
  code: "ADMIN-118.1.1",
  label: "Permit or license administrative fee",
  description:
    "Bldg. Code Sec. 118.1.1 — permit or license administrative fee. The City-Wide Fee Schedule also notes that fees may be subject to an administrative fee per Code Section 1-14; the schedule does not state which transactions attract it.",
  componentType: "surcharge",
  feeType: "flat",
  config: { amountCents: 3_356 },
  priority: 900,
});

export const HOUSTON_PLUMBING_FIXTURE: FeeRuleRecord = houstonRule({
  id: "hou-plumb-fixture-118.5.4",
  code: "PLUMB-118.5.4",
  label: "Plumbing fixture fee",
  description:
    "Bldg. Code Sec. 118.5.4 — base charge for 1 to 3 fixtures, plus $11.41 for each additional fixture over 3 on the same permit.",
  feeType: "per_unit",
  config: {
    unit: "fixtures",
    baseCents: 3_424,
    thresholdUnits: 3,
    centsPerUnit: 1_141,
  },
});

export const HOUSTON_ELECTRICAL_OUTLET: FeeRuleRecord = houstonRule({
  id: "hou-elec-outlet-118.6.1",
  code: "ELEC-118.6.1-OUTLET",
  label: "Electrical outlet",
  description: "Bldg. Code Sec. 118.6.1 — fee per electrical outlet.",
  feeType: "per_unit",
  // `outlets`, not `fixtures`. The rate is the same as the plumbing fixture row,
  // but the two are different line items on different permits, and sharing a
  // count would describe 40 outlets as 40 plumbing fixtures in the breakdown.
  config: { unit: "outlets", centsPerUnit: 134 },
});

export const HOUSTON_ELECTRICAL_METER_LOOP_UP_TO_50KW: FeeRuleRecord = houstonRule({
  id: "hou-elec-meter-118.6.1-50",
  code: "ELEC-118.6.1-METER-50",
  label: "Electrical meter loop and service up to 50 kW",
  description: "Bldg. Code Sec. 118.6.1 — meter loop and service, up to 50 kW.",
  feeType: "flat",
  config: { amountCents: 9_400 },
});

/**
 * §118.6.1 — "Electrical Panel with 8 or more circuits, each: $9.39".
 * Only panels with 8 or more circuits are charged; the rule fires per panel.
 */
export const HOUSTON_ELECTRICAL_PANEL: FeeRuleRecord = houstonRule({
  id: "hou-elec-panel-118.6.1",
  code: "ELEC-118.6.1-PANEL",
  label: "Electrical panel with 8 or more circuits",
  description:
    "Bldg. Code Sec. 118.6.1 — electrical panel with 8 or more circuits, charged per panel. Panels with fewer than 8 circuits are not charged under this row.",
  feeType: "per_unit",
  config: { unit: "panels", centsPerUnit: 939 },
});

/**
 * §118.6.2 — "Lighting or appliance — per fixture: $1.34".
 * Sits alongside the §118.6.1 outlet row at the same rate but is a different
 * line in the schedule, and the two must not be added together for one item.
 */
export const HOUSTON_ELECTRICAL_LIGHTING_FIXTURE: FeeRuleRecord = houstonRule({
  id: "hou-elec-lighting-118.6.2",
  code: "ELEC-118.6.2-LIGHTING",
  label: "Lighting or appliance fixture",
  description: "Bldg. Code Sec. 118.6.2 — lighting or appliance fixture, per fixture.",
  feeType: "per_unit",
  config: { unit: "lighting_fixtures", centsPerUnit: 134 },
});

/* -------------------------------------------------------------------------- */
/* Mechanical / HVAC permit fee — Bldg. Code Sec. 118.3                    */
/* -------------------------------------------------------------------------- */

/**
 * §118.3.1 — "HVAC Permit Fee Base Charge: $94.00".
 *
 * IMPORTANT: the same section also publishes "Base Charge plus 2% of Unit
 * Valuation" with an Amount of `Calculation`. That percentage component is NOT
 * modelled, because "unit valuation" is defined only in the Building Code text
 * (source S2 in research/texas/houston.md), which has not been read. The mechanical
 * page states this limit rather than estimating it. See Ambiguity A6.
 */
export const HOUSTON_HVAC_BASE_CHARGE: FeeRuleRecord = houstonRule({
  id: "hou-hvac-118.3.1",
  code: "HVAC-118.3.1",
  label: "HVAC permit fee base charge",
  description:
    "Bldg. Code Sec. 118.3.1 — HVAC permit fee base charge. The percentage-of-unit-valuation component published in the same section is not modelled.",
  feeType: "flat",
  config: { amountCents: 9_400 },
});

/** §118.3.3 — local vents, central vacuum, ventilation fans up to 2,000 cfm. */
export const HOUSTON_HVAC_VENTILATION_FANS: FeeRuleRecord = houstonRule({
  id: "hou-hvac-118.3.3",
  code: "HVAC-118.3.3",
  label: "Local vents, central vacuum and ventilation fans",
  description:
    "Bldg. Code Sec. 118.3.3 — permits for local vents, central vacuum systems and ventilation fans up to 2,000 cfm.",
  feeType: "flat",
  config: { amountCents: 9_400 },
});

/**
 * §118.3.4 — self-contained A/C unit: $47.00 base, plus $11.41 per ton or HP of
 * all units combined, or the minimum permit fee, whichever is greater.
 *
 * That last clause is a floor on the whole component, so it is expressed with
 * `minimumCents` rather than as a bracket. See Ambiguity A7.
 */
export const HOUSTON_HVAC_SELF_CONTAINED: FeeRuleRecord = houstonRule({
  id: "hou-hvac-118.3.4",
  code: "HVAC-118.3.4",
  label: "Self-contained A/C unit",
  description:
    "Bldg. Code Sec. 118.3.4 — base charge for a self-contained A/C unit, plus $11.41 per ton or HP of all units combined, or the minimum permit fee, whichever is greater.",
  feeType: "per_unit",
  config: { unit: "tons", centsPerUnit: 1_141 },
  minimumCents: 9_106,
});

/* -------------------------------------------------------------------------- */
/* Demolition — Bldg. Code Sec. 118.2.1                                    */
/* -------------------------------------------------------------------------- */

/**
 * §118.2.1 — "Building Demolition — Base Charge for first story: $94.00".
 * Charged per story, so it is modelled per unit with a single unit of storage.
 */
export const HOUSTON_DEMOLITION_FIRST_STORY: FeeRuleRecord = houstonRule({
  id: "hou-demo-118.2.1-STORY1",
  code: "DEMO-118.2.1-STORY1",
  label: "Building demolition — first story",
  description: "Bldg. Code Sec. 118.2.1 — building demolition, base charge for the first story.",
  feeType: "flat",
  config: { amountCents: 9_400 },
});

/** §118.2.1 — "each additional story above the first: $47.00". */
export const HOUSTON_DEMOLITION_ADDITIONAL_STORY: FeeRuleRecord = houstonRule({
  id: "hou-demo-118.2.1-STORY-N",
  code: "DEMO-118.2.1-STORY",
  label: "Building demolition — each additional story",
  description:
    "Bldg. Code Sec. 118.2.1 — building demolition, each story above the first, charged per story.",
  feeType: "per_unit",
  config: { unit: "stories", centsPerUnit: 4_700 },
});

/* -------------------------------------------------------------------------- */
/* Plumbing — additional Bldg. Code Sec. 118.5 rows                         */
/* -------------------------------------------------------------------------- */

/** §118.5.2 — furnace installation (non-duct): $34.24 first furnace, +$11.41 each. */
export const HOUSTON_PLUMBING_FURNACE: FeeRuleRecord = houstonRule({
  id: "hou-plumb-furnace-118.5.2",
  code: "PLUMB-118.5.2",
  label: "Furnace installation (non-duct)",
  description:
    "Bldg. Code Sec. 118.5.2 — base charge for the first furnace, plus $11.41 for each additional furnace on the same permit.",
  feeType: "per_unit",
  config: { unit: "furnaces", baseCents: 3_424, thresholdUnits: 1, centsPerUnit: 1_141 },
});

/** §118.5.3 — yard light or BBQ grill: $34.24 first opening, +$11.41 each. */
export const HOUSTON_PLUMBING_YARD_LIGHT: FeeRuleRecord = houstonRule({
  id: "hou-plumb-yardlight-118.5.3",
  code: "PLUMB-118.5.3",
  label: "Yard light or BBQ grill",
  description:
    "Bldg. Code Sec. 118.5.3 — base charge for the first opening, plus $11.41 for each additional opening above one.",
  feeType: "per_unit",
  config: { unit: "openings", baseCents: 3_424, thresholdUnits: 1, centsPerUnit: 1_141 },
});

/** §118.5.4 — wall heater: $34.24 first heater, +$11.41 each above one. */
export const HOUSTON_PLUMBING_WALL_HEATER: FeeRuleRecord = houstonRule({
  id: "hou-plumb-wallheater-118.5.4",
  code: "PLUMB-118.5.4-HEATER",
  label: "Wall heater",
  description:
    "Bldg. Code Sec. 118.5.4 — base charge for one wall heater, plus $11.41 for each additional heater above one on the same permit.",
  feeType: "per_unit",
  config: { unit: "heaters", baseCents: 3_424, thresholdUnits: 1, centsPerUnit: 1_141 },
});

/** §118.5.4 — sewer connection, each: $53.71. */
export const HOUSTON_PLUMBING_SEWER_CONNECTION: FeeRuleRecord = houstonRule({
  id: "hou-plumb-sewer-118.5.4",
  code: "PLUMB-118.5.4-SEWER",
  label: "Sewer connection",
  description: "Bldg. Code Sec. 118.5.4 — sewer connection, each.",
  feeType: "per_unit",
  config: { unit: "connections", centsPerUnit: 5_371 },
});

/** §118.5.4 — septic tank or individual sewage treatment plant, each: $53.71. */
export const HOUSTON_PLUMBING_SEPTIC: FeeRuleRecord = houstonRule({
  id: "hou-plumb-septic-118.5.4",
  code: "PLUMB-118.5.4-SEPTIC",
  label: "Septic tank or individual sewage treatment plant",
  description: "Bldg. Code Sec. 118.5.4 — septic tank or individual sewage treatment plant, each.",
  feeType: "per_unit",
  // `septic_tanks`, not `openings`. §118.5.3 (yard light or BBQ grill) reads
  // `openings`, and a septic tank is not an opening. No reader was billed twice
  // — §118.5.3 was not attached to a permit type at the time — but attaching it,
  // which the plumbing page describes, would have charged one count twice.
  config: { unit: "septic_tanks", centsPerUnit: 5_371 },
});

/** §118.1.5 — re-inspection fee: $94.00. */
export const HOUSTON_RE_INSPECTION_FEE: FeeRuleRecord = houstonRule({
  id: "hou-inspect-118.1.5",
  code: "INSPECT-118.1.5",
  label: "Re-inspection fee",
  description:
    "Bldg. Code Sec. 118.1.5 — re-inspection fee, charged when a re-inspection is required.",
  componentType: "inspection",
  feeType: "flat",
  config: { amountCents: 9_400 },
});
