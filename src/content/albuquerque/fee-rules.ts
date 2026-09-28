import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Albuquerque, New Mexico fee rules — REAL DATA.
 *
 * Sources (research/new-mexico/albuquerque.md records how each was read):
 *
 *  S1  2024 City of Albuquerque Uniform Administrative Code, Section 112 "Fees" —
 *      §112.2 (Tables 112-A through 112-H), §112.2.1 (building permit valuations and the
 *      Albuquerque regional modifiers), §112.3 (plan review fees), §112.4 (investigation
 *      fees for work without a permit); Table 112-A (building permit fees), Table 112-B
 *      (electrical permit fees) and Table 112-D (plumbing permit fees).
 *      https://www.cabq.gov/planning/documents/2024-uac-adopted.pdf
 *  S2  City of Albuquerque, "Plan Review and Building Permit Fees (Revised April 2010)" —
 *      the seven-page handout the Building Safety Division publishes, whose four columns
 *      are Table 112-A already multiplied out.
 *      https://www.cabq.gov/planning/documents/FeeSchedule.pdf
 *  S3  City of Albuquerque Building Safety Division, "Frequently Asked Questions" —
 *      "Plan review fees are paid at the time of submittal. They are 65% of the permit fee,
 *      plus zoning and hydrology fees."
 *      https://www.cabq.gov/planning/building-safety-division/building-safety-faqs
 *
 * **The mechanism, in three sentences.** The UAC prints the raw schedule once, in Table 112-A:
 * a piecewise ladder of six bands ($23.50 for the first $500, then $3.05 per additional $100
 * or fraction to $2,000; $69.25 plus $14.00 per $1,000 to $25,000; $391.75 plus $10.10 to
 * $50,000; $643.75 plus $7.00 to $100,000; then $993.75 for the first $100,000 plus $5.60
 * for each additional $1,000 or fraction, unbounded). §112.2.1 then applies the
 * **Albuquerque regional modifier**: .67 for apartments, public and commercial construction
 * and .50 for one- and two-family dwelling and townhouse construction, "Minimum fee shall be
 * $23.50". Tables 112-B (electrical) and 112-D (plumbing) carry modifiers of 1.0, so their
 * printed rates are charged as written. Plan review is 65% of the building permit fee and
 * 25% of the trade permit fee, and §112.3 says those fees "are separate fees from the permit
 * fees ... and are in addition to the permit fees".
 *
 * **Why the building rules are generated rather than transcribed.** The published handout
 * prints the four multiplied columns in 335 rows; every one of them is the raw ladder times
 * its modifier, rounded half up and floored at $23.50 — a computation this pass checked
 * against all 335 rows of the handout before writing a line of code, and which matched every
 * one. The module therefore stores the raw schedule as a function and the two modifiers as
 * column generators, so the table above $321,000 (where the handout stops and the UAC's
 * unbounded sixth band continues) is produced by the City's own formula rather than by an
 * invented extension. The generated table runs to a $10,000,000 valuation; above that the
 * highest bracket is applied with the engine's own warning, and the page says so.
 *
 * **Three readings this module depends on, all of them stated on the pages.**
 *
 *  1. **The minimum is applied after the modifier, not before.** §112.2.1 prints the $23.50
 *     minimum beside each modifier. A $600 valuation raw at $26.55 computes to $17.79 at .67
 *     and $13.28 at .50, and the handout's columns print $23.50 for both — so the floor is
 *     taken against the multiplied figure. Both columns of the handout cross the floor at
 *     different valuations because of it (commercial at $801, residential at $1,201), which
 *     is the fingerprint of a post-modifier minimum and the check the columns were read by.
 *  2. **Plan review is a separate charge and is charged on this site.** §112.3 says the plan
 *     review fees "are separate fees from the permit fees ... and are in addition to the
 *     permit fees", and the FAQ says the same thing from the counter's side: paid at
 *     submittal, 65% of the permit fee. Unlike Newark's prepayment, this one is on top, so
 *     it is a component here — gated behind `custom.plan_review` because §112.3 charges it
 *     when plans are required to be submitted under §§110.2 and 110.3.
 *  3. **The plan review percentage is taken from the rounded permit fee, and the handout's
 *     own column sometimes disagrees by a cent.** The UAC states the rule as a percentage;
 *     the 2010 handout prints a computed column whose rows sometimes come from an unrounded
 *     intermediate (row 1: $23.50 × 65% = $15.275, printed as $15.27 in the commercial
 *     column and $15.28 in the residential column of the same table). This module charges
 *     the rule the code states — 65% of the permit fee, rounded half up — and the research
 *     record names the rows where the handout's arithmetic rounds the other way.
 *
 * **What is deliberately NOT here:**
 *
 *  - **The zoning and hydrology fees** the handout prints under every page of its table
 *    ("Zoning: $25 < 4000sqft or $45 > 4000sqft", "Hydrology: $50"). Real charges on a
 *    plan-reviewed permit, but the schedule never says what the 4,000 square feet is
 *    measured on — lot, floor area or review area — and that ambiguity is the whole fee.
 *    Named on the page, charged on none.
 *  - **The mechanical (Table 112-C), sign (112-E), wall (112-F) and re-roof (112-G)
 *    schedules**, all published in the same section. Newark's three pages are building,
 *    electrical and plumbing, and this release follows that.
 *  - **The demolition fee** ($47.00 up to and including 1,500 square feet plus $10.00 for
 *    each additional 500 square feet or fraction), the temporary certificate of occupancy
 *    ($50.00), the certificate of occupancy ($100.00), the after-hours and re-inspection
 *    charges other than the $47.00 re-inspection modelled here, and the **FasTrax** expedited
 *    plan review at three times the standard plan review fee.
 *  - **The investigation fee's interaction with double charges for work started without a
 *    permit outside §112.4** — §112.4.2 sets the investigation fee at the amount of the
 *    permit fee, which is what the surcharge rule models; any citation or penalty is the
 *    Hearing Department's.
 *  - **Motor-operated equipment, evaporative coolers, transformers, space heating,
 *    communication and signal systems, pre-final inspections and swimming pools** in Table
 *    112-B, and the gas line tests, temporary gas, water distribution, utility service
 *    lines, fire hydrant inspections and interceptors in Table 112-D: published, transcribed
 *    in the research record, and either priced by a rating this site does not collect
 *    (horsepower, B.T.U., square feet of panel) or named on the page without a rate row.
 *
 * **This module is the single definition of Albuquerque's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records.
 */

/** The 2024 UAC's technical codes carry an effective date of January 1, 2025 (Exhibit A). */
export const ABQ_FEE_EFFECTIVE_FROM = "2025-01-01";

export const ABQ_UAC_SOURCE_KEY = "albuquerque-uac-2024-fee-section-112";
export const ABQ_FEE_SCHEDULE_SOURCE_KEY = "albuquerque-plan-review-building-permit-fees";
export const ABQ_FAQ_SOURCE_KEY = "albuquerque-building-safety-faqs";

/** §112.2.1: "The Albuquerque Regional Modifier for Table 112-A ... shall be (.67)". */
export const ABQ_COMMERCIAL_MODIFIER = { numerator: 67, denominator: 100 } as const;
/** §112.2.1: "shall be (.50) for one- and two-family dwelling and town-house construction". */
export const ABQ_RESIDENTIAL_MODIFIER = { numerator: 1, denominator: 2 } as const;
/** §112.2.1: "(Minimum fee shall be $23.50.)" — applied after the modifier. */
export const ABQ_MINIMUM_FEE_CENTS = 2_350;
/** Table 112-A "Other Inspections and Fees": re-inspection under §113.5.8 is $47.00 each. */
export const ABQ_REINSPECTION_CENTS = 4_700;
/** Table 112-B item 1 / Table 112-D item 1: administrative charge on every application. */
export const ABQ_ADMINISTRATIVE_CHARGE_CENTS = 4_700;
/** §112.4.2: "An investigation fee, in addition to the permit fee, ... the amount of the permit fee". */
export const ABQ_INVESTIGATION_RATE = { numerator: 1, denominator: 1 } as const;
/** §112.3: building plan review "65 percent of the building or sign permit fee". */
export const ABQ_BUILDING_PLAN_REVIEW = { numerator: 65, denominator: 100 } as const;
/** §112.3: "plan review fees for electrical, mechanical, and plumbing ... 25 percent of the total permit fee". */
export const ABQ_TRADE_PLAN_REVIEW = { numerator: 25, denominator: 100 } as const;

/**
 * Where the generated table stops. Table 112-A's sixth band is unbounded; the handout stops
 * at $321,000 because its typesetting did, not because the fee does. Ten million dollars of
 * valuation is where this module stops printing brackets; above it the engine applies the
 * top bracket and warns, and the pages say so in words.
 */
export const ABQ_TABLE_CEILING_DOLLARS = 10_000_000;

/* -------------------------------------------------------------------------- */
/* Building permits — Table 112-A and §112.2.1                                */
/* -------------------------------------------------------------------------- */

/**
 * Table 112-A's raw ladder, in cents, at a valuation in dollars.
 *
 * The table's own six sentences: $23.50 for the first $500 plus $3.05 for each additional
 * $100 or fraction, to and including $2,000; then $69.25 plus $14.00 per $1,000 to $25,000;
 * $391.75 plus $10.10 to $50,000; $643.75 plus $7.00 to
 * $100,000; $993.75 plus $5.60 per $1,000 above that. The two discontinuities in the
 * printed bases ($391.75 against the $391.25 the third band computes at $25,000, and
 * $643.75 against the $644.25 the fourth computes at $50,000) are the table's own: each
 * band's stated base is what the next band starts from, which is also what the published
 * handout's columns show at both seams.
 */
export function abqRawScheduleCents(valuationDollars: number): number {
  const ceilDiv = (value: number, step: number) => Math.ceil(value / step);
  if (valuationDollars <= 500) return 2_350;
  if (valuationDollars <= 2_000) return 2_350 + 305 * ceilDiv(valuationDollars - 500, 100);
  if (valuationDollars <= 25_000) return 6_925 + 1_400 * ceilDiv(valuationDollars - 2_000, 1_000);
  if (valuationDollars <= 50_000) return 39_175 + 1_010 * ceilDiv(valuationDollars - 25_000, 1_000);
  if (valuationDollars <= 100_000) return 64_375 + 700 * ceilDiv(valuationDollars - 50_000, 1_000);
  return 99_375 + 560 * ceilDiv(valuationDollars - 100_000, 1_000);
}

/** Round a non-negative fraction half up — the rounding the handout's columns use. */
function roundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

/**
 * One published column of the schedule, as lookup brackets.
 *
 * The row tops are the handout's own: $100 steps to $2,000 (Table 112-A's second band
 * prices in $100 increments) and $1,000 steps above it. The amount is the raw ladder at
 * the top of the row times the column's modifier, rounded half up, floored at $23.50 —
 * the computation that reproduces all 335 published rows exactly.
 */
export function abqBuildingTiers(
  modifier: { numerator: number; denominator: number },
): Array<{ upToCents: number; amountCents: number }> {
  const rowTops: number[] = [500];
  for (let dollars = 600; dollars <= 2_000; dollars += 100) rowTops.push(dollars);
  for (let dollars = 3_000; dollars <= ABQ_TABLE_CEILING_DOLLARS; dollars += 1_000) {
    rowTops.push(dollars);
  }

  return rowTops.map((dollars) => {
    const raw = abqRawScheduleCents(dollars);
    const fee = roundHalfUp(modifier.numerator * raw, modifier.denominator);
    return { upToCents: dollars * 100, amountCents: Math.max(ABQ_MINIMUM_FEE_CENTS, fee) };
  });
}

function abqRule(
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
    effectiveFrom: ABQ_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: ABQ_UAC_SOURCE_KEY,
    ...overrides,
  };
}

/**
 * The fee table's own column split: apartments, public and commercial on one side,
 * one- and two-family dwellings and townhouses on the other. §112.2.1 writes the split as
 * a construction class rather than an occupancy, so it is asked for directly — a three-unit
 * apartment building is occupancy "residential" and modifier ".67", and nothing about the
 * occupancy fact can be trusted to know that. An applicant who does not answer is not
 * quoted either rate; both columns state the conditions and the page says why.
 */
const ONE_TWO_FAMILY_TRUE = { field: "custom.one_two_family", op: "eq" as const, value: true };
const ONE_TWO_FAMILY_FALSE = { field: "custom.one_two_family", op: "eq" as const, value: false };

export const ABQ_BUILDING_COMMERCIAL_TABLE: FeeRuleRecord = abqRule({
  id: "abq-bldg-commercial-table",
  code: "BLD-COMMERCIAL-TABLE",
  label: "Building permit and plan review — apartments, public and commercial (regional modifier .67)",
  description:
    "UAC §112.2 Table 112-A with the §112.2.1 regional modifier of .67 for apartments, public and commercial construction, minimum fee $23.50. The raw ladder is $23.50 for the first $500 and $3.05 per additional $100 or fraction to $2,000, $69.25 plus $14.00 per $1,000 to $25,000, $391.75 plus $10.10 to $50,000, $643.75 plus $7.00 to $100,000, and $993.75 for the first $100,000 plus $5.60 for each additional $1,000 or fraction thereof above that — each band multiplied by .67 and rounded, floored at the $23.50 minimum printed with the modifier. The same computation, row by row, is what the City's own 'Plan Review and Building Permit Fees' handout prints in its commercial columns.",
  feeType: "tiered_table",
  config: { basis: "valuation", tiers: abqBuildingTiers(ABQ_COMMERCIAL_MODIFIER) },
  conditions: ONE_TWO_FAMILY_FALSE,
});

export const ABQ_BUILDING_RESIDENTIAL_TABLE: FeeRuleRecord = abqRule({
  id: "abq-bldg-residential-table",
  code: "BLD-RESIDENTIAL-TABLE",
  label: "Building permit and plan review — one- and two-family dwellings and townhouses (regional modifier .50)",
  description:
    "UAC §112.2 Table 112-A with the §112.2.1 regional modifier of .50 for one- and two-family dwelling and town-house construction, including renovations, alterations and additions, minimum fee $23.50. The same six-band raw ladder as the commercial column, multiplied by .50 and floored at $23.50 — which is why the residential column crosses the minimum at a lower valuation than the commercial one ($1,201 against $801 in the handout's own rows).",
  feeType: "tiered_table",
  config: { basis: "valuation", tiers: abqBuildingTiers(ABQ_RESIDENTIAL_MODIFIER) },
  conditions: ONE_TWO_FAMILY_TRUE,
});

/** §112.3: "a plan review fee shall be ... 65 percent of the building or sign permit fee." */
export const ABQ_BUILDING_PLAN_REVIEW_RULE: FeeRuleRecord = abqRule({
  id: "abq-bldg-plan-review",
  code: "BLD-PLAN-REVIEW",
  label: "Plan review fee, 65% of the building permit fee",
  description:
    'UAC §112.3: "a plan review fee shall be paid at the time of submitting plans and specifications for review. Said plan review fee for buildings, signs, or structures shall be 65 percent of the building or sign permit fee as set forth in Tables 112-A and 112-E." §112.3 adds that this fee "is a separate fee from the permit fee ... and in addition to the permit fee", so it is charged on top — gated behind the plan-review input because §112.3 charges it where §§110.2 and 110.3 require plans to be submitted. The Building Safety FAQ says the same from the counter: "Plan review fees are paid at the time of submittal. They are 65% of the permit fee, plus zoning and hydrology fees."',
  componentType: "plan_review",
  feeType: "percent",
  config: { basis: "permit_fee", rate: ABQ_BUILDING_PLAN_REVIEW },
  conditions: { field: "custom.plan_review", op: "eq", value: true },
  priority: 200,
});

/**
 * §112.4.2: "An investigation fee, in addition to the permit fee, shall be collected
 * whether or not a permit is then or subsequently issued. The investigation fee shall be
 * equal to the amount of the permit fee required by this Code."
 *
 * Charged on `permit_fee` — the base subtotal this run computed — so the surcharge is the
 * permit fee once more and the plan review is not doubled with it: the investigation fee
 * is defined against the permit fee, not against the bill.
 */
export const ABQ_BUILDING_INVESTIGATION: FeeRuleRecord = abqRule({
  id: "abq-bldg-investigation",
  code: "BLD-INVESTIGATION-FEE",
  label: "Investigation fee for work without a permit, equal to the permit fee",
  description:
    'UAC §112.4.2: "An investigation fee, in addition to the permit fee, shall be collected whether or not a permit is then or subsequently issued. The investigation fee shall be equal to the amount of the permit fee required by this Code. The minimum investigation fee shall be the same as the minimum fee set forth in Tables 112-A through 112-H." Charged when the permit is for work started without one, as a copy of the permit fee on its own line.',
  componentType: "surcharge",
  feeType: "percent",
  config: { basis: "permit_fee", rate: ABQ_INVESTIGATION_RATE },
  conditions: { field: "custom.unpermitted_work", op: "eq", value: true },
  priority: 900,
});

/** Table 112-A, Other Inspections and Fees, item 2: "$47.00 each" under §113.5.8. */
export const ABQ_BUILDING_REINSPECTION: FeeRuleRecord = abqRule({
  id: "abq-bldg-reinspection",
  code: "BLD-REINSPECTION",
  label: "Re-inspection fee, $47.00 each",
  description:
    'UAC Table 112-A, "Other Inspections and Fees": "Re-inspection fee assessed under provisions of Section 113.5.8 — $47.00 each." Charged when a re-inspection is needed, which is when §113.5.8 lets the Building Official require one.',
  componentType: "inspection",
  feeType: "flat",
  config: { amountCents: ABQ_REINSPECTION_CENTS },
  conditions: { field: "custom.reinspection", op: "eq", value: true },
  priority: 300,
});

export const ABQ_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  ABQ_BUILDING_COMMERCIAL_TABLE,
  ABQ_BUILDING_RESIDENTIAL_TABLE,
  ABQ_BUILDING_PLAN_REVIEW_RULE,
  ABQ_BUILDING_INVESTIGATION,
  ABQ_BUILDING_REINSPECTION,
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — Table 112-B                                           */
/* -------------------------------------------------------------------------- */

/** §112.3: electrical plan review is 25 percent of the total permit fee. */
function abqTradePlanReview(code: string, id: string, label: string): FeeRuleRecord {
  return abqRule({
    id,
    code,
    label,
    description:
      'UAC §112.3: "The plan review fees for electrical, mechanical, and plumbing, shall be equal to 25 percent of the total permit fee as set forth in Tables 112-B, 112-C, and 112-D." §112.3 adds that this fee "is separate from the permit fee ... and in addition to it", and charges it where §§110.2 and 110.3 require plans — so it is gated behind the plan-review input.',
    componentType: "plan_review",
    feeType: "percent",
    config: { basis: "permit_fee", rate: ABQ_TRADE_PLAN_REVIEW },
    conditions: { field: "custom.plan_review", op: "eq", value: true },
    priority: 200,
  });
}

/** §112.4.2's investigation fee, on the trade permit's own permit fee. */
function abqTradeInvestigation(id: string, code: string): FeeRuleRecord {
  return abqRule({
    id,
    code,
    label: "Investigation fee for work without a permit, equal to the permit fee",
    description:
      'UAC §112.4.2: "An investigation fee, in addition to the permit fee, shall be collected ... The investigation fee shall be equal to the amount of the permit fee required by this Code." The trade tables carry the same fee under the same section.',
    componentType: "surcharge",
    feeType: "percent",
    config: { basis: "permit_fee", rate: ABQ_INVESTIGATION_RATE },
    conditions: { field: "custom.unpermitted_work", op: "eq", value: true },
    priority: 900,
  });
}

/**
 * Table 112-B item 1: "Administrative charge applicable to all applications and additions
 * to permits — $47.00 each. EXCEPTION: re-inspection fee."
 *
 * Unconditional, because the table makes it so: it is on every electrical application, and
 * it is part of the permit fee that §112.3's 25 percent is measured against.
 */
export const ABQ_ELECTRICAL_ADMIN: FeeRuleRecord = abqRule({
  id: "abq-elec-admin",
  code: "ELEC-ADMINISTRATIVE-CHARGE",
  label: "Administrative charge, $47.00 each application",
  description:
    'UAC Table 112-B item 1: "Administrative charge applicable to all applications and additions to permits — $47.00 each. EXCEPTION: re-inspection fee." Charged with every electrical permit application, and inside the permit fee that the 25 percent plan review is measured against.',
  feeType: "flat",
  config: { amountCents: ABQ_ADMINISTRATIVE_CHARGE_CENTS },
});

/** Table 112-B item 2: "Meter loop — $40.00 each." */
export const ABQ_ELECTRICAL_METER_LOOP: FeeRuleRecord = abqRule({
  id: "abq-elec-meter-loop",
  code: "ELEC-METER-LOOP",
  label: "Meter loop, $40.00 each",
  description:
    'UAC Table 112-B item 2: "Meter loop — $40.00 each", with temporary meters at $40.00 on a separate permit and ganged meters at $60.00 per gang. Charged per meter loop entered; a permit with no meter loop work carries no meter loops and pays nothing here. Temporary meters and gangs are named on the page rather than charged, because the schedule prices them as their own permits.',
  feeType: "per_unit",
  config: { unit: "meters", centsPerUnit: 4_000 },
});

/**
 * Table 112-B item 3: "Outlets (Communication and signal, fixtures, switches, and
 * receptacles): (a) First 20 — $1.50 each; (b) All over 20 — $0.90 each."
 *
 * Two rules rather than one, because the first twenty are priced at $1.50 each — not as a
 * flat $30.00 — and `per_unit` cannot change its rate partway up a count. Twenty outlets
 * are $30.00 and twenty-one are $30.90, which is what the pair charges and what the table says.
 */
export const ABQ_ELECTRICAL_OUTLETS_FIRST_20: FeeRuleRecord = abqRule({
  id: "abq-elec-outlets-first-20",
  code: "ELEC-OUTLETS-FIRST-20",
  label: "Outlets, receptacles, switches, fixtures and signal points — first 20, $1.50 each",
  description:
    'UAC Table 112-B item 3: "Outlets (Communication and signal, fixtures, switches, and receptacles): (a) First 20 — $1.50 each." Charged on the count up to twenty; the over-twenty row takes over above that, so a permit with twenty outlets pays exactly $30.00 on this row.',
  feeType: "per_unit",
  config: { unit: "outlets", centsPerUnit: 150 },
  conditions: {
    all: [
      { field: "custom.outlets", op: "exists" },
      { field: "custom.outlets", op: "lte", value: 20 },
    ],
  },
});

export const ABQ_ELECTRICAL_OUTLETS_OVER_20: FeeRuleRecord = abqRule({
  id: "abq-elec-outlets-over-20",
  code: "ELEC-OUTLETS-OVER-20",
  label: "Outlets, receptacles, switches, fixtures and signal points — over 20, $0.90 each",
  description:
    'UAC Table 112-B item 3(b): "All over 20 — $0.90 each." The first twenty are charged at $1.50 each by the row above; this row charges the remainder, so forty outlets are $30.00 plus twenty at $0.90 — $48.00.',
  feeType: "per_unit",
  config: { unit: "outlets", baseCents: 3_000, thresholdUnits: 20, centsPerUnit: 90 },
  conditions: {
    all: [
      { field: "custom.outlets", op: "exists" },
      { field: "custom.outlets", op: "gt", value: 20 },
    ],
  },
});

/** Table 112-B item 4: commercial lighting fixtures, $1.50 each for the first 20. */
export const ABQ_ELECTRICAL_LIGHTING_FIRST_20: FeeRuleRecord = abqRule({
  id: "abq-elec-lighting-first-20",
  code: "ELEC-LIGHTING-FIRST-20",
  label: "Commercial lighting fixtures — first 20, $1.50 each",
  description:
    'UAC Table 112-B item 4: "Installation of commercial lighting fixtures: (a) First 20 — $1.50 each", with the note that "When fluorescent lighting is installed in continuous rows, each unit shall be considered a separate fixture. (The term fixture shall be interpreted to mean the lighting device at any outlet.)"',
  feeType: "per_unit",
  config: { unit: "lighting_fixtures", centsPerUnit: 150 },
  conditions: {
    all: [
      { field: "custom.lighting_fixtures", op: "exists" },
      { field: "custom.lighting_fixtures", op: "lte", value: 20 },
    ],
  },
});

/** Table 112-B item 4(b): "All over 20 — $1.00 each" — a different rate from the outlets row. */
export const ABQ_ELECTRICAL_LIGHTING_OVER_20: FeeRuleRecord = abqRule({
  id: "abq-elec-lighting-over-20",
  code: "ELEC-LIGHTING-OVER-20",
  label: "Commercial lighting fixtures — over 20, $1.00 each",
  description:
    'UAC Table 112-B item 4(b): "All over 20 — $1.00 each", where the outlets row above drops to $0.90. The two rates are the schedule\'s, not a transcription slip: a lighting fixture is a different row with a different over-twenty price.',
  feeType: "per_unit",
  config: { unit: "lighting_fixtures", baseCents: 3_000, thresholdUnits: 20, centsPerUnit: 100 },
  conditions: {
    all: [
      { field: "custom.lighting_fixtures", op: "exists" },
      { field: "custom.lighting_fixtures", op: "gt", value: 20 },
    ],
  },
});

/** Table 112-B item 7: "Panels — $8.00 each." */
export const ABQ_ELECTRICAL_PANELS: FeeRuleRecord = abqRule({
  id: "abq-elec-panels",
  code: "ELEC-PANELS",
  label: "Electrical panels, $8.00 each",
  description: 'UAC Table 112-B item 7: "Panels — $8.00 each."',
  feeType: "per_unit",
  config: { unit: "panels", centsPerUnit: 800 },
});

/** Table 112-B item 9: "Sign Connections — $40.00 each." */
export const ABQ_ELECTRICAL_SIGNS: FeeRuleRecord = abqRule({
  id: "abq-elec-sign-connections",
  code: "ELEC-SIGN-CONNECTIONS",
  label: "Sign connections, $40.00 each",
  description:
    'UAC Table 112-B item 9: "Sign Connections — $40.00 each." The sign permit itself is a separate schedule (Table 112-E); this row is the electrical connection.',
  feeType: "per_unit",
  config: { unit: "signs", centsPerUnit: 4_000 },
});

export const ABQ_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  ABQ_ELECTRICAL_ADMIN,
  ABQ_ELECTRICAL_METER_LOOP,
  ABQ_ELECTRICAL_OUTLETS_FIRST_20,
  ABQ_ELECTRICAL_OUTLETS_OVER_20,
  ABQ_ELECTRICAL_LIGHTING_FIRST_20,
  ABQ_ELECTRICAL_LIGHTING_OVER_20,
  ABQ_ELECTRICAL_PANELS,
  ABQ_ELECTRICAL_SIGNS,
  abqTradePlanReview("ELEC-PLAN-REVIEW", "abq-elec-plan-review", "Plan review fee, 25% of the permit fee"),
  abqTradeInvestigation("abq-elec-investigation", "ELEC-INVESTIGATION-FEE"),
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — Table 112-D                                             */
/* -------------------------------------------------------------------------- */

/** Table 112-D item 1: administrative charge, $47.00 each application. */
export const ABQ_PLUMBING_ADMIN: FeeRuleRecord = abqRule({
  id: "abq-plumb-admin",
  code: "PLUMB-ADMINISTRATIVE-CHARGE",
  label: "Administrative charge, $47.00 each application",
  description:
    'UAC Table 112-D item 1: "Administrative charge applicable to all applications and additions to permit — $47.00 each. EXCEPTION: re-inspection fee."',
  feeType: "flat",
  config: { amountCents: ABQ_ADMINISTRATIVE_CHARGE_CENTS },
});

/** Table 112-D item 6: "Plumbing fixture includes drain and vent — $10.00 each." */
export const ABQ_PLUMBING_FIXTURES: FeeRuleRecord = abqRule({
  id: "abq-plumb-fixtures",
  code: "PLUMB-FIXTURES",
  label: "Plumbing fixtures, $10.00 each",
  description:
    'UAC Table 112-D item 6: "Plumbing fixture includes drain and vent — $10.00 each." One rate for the fixture and the drain and vent it carries.',
  feeType: "per_unit",
  config: { unit: "fixtures", centsPerUnit: 1_000 },
});

/** Table 112-D item 11: "Lawn sprinkler system on any one meter including back-flow protection devices thereof — $18.00." */
export const ABQ_PLUMBING_SPRINKLERS: FeeRuleRecord = abqRule({
  id: "abq-plumb-lawn-sprinklers",
  code: "PLUMB-LAWN-SPRINKLER",
  label: "Lawn sprinkler system per meter, $18.00",
  description:
    'UAC Table 112-D item 11: "Lawn sprinkler system on any one meter including back-flow protection devices thereof — $18.00." The backflow protection rides with the meter, so it is not charged again on the backflow rows below.',
  feeType: "per_unit",
  config: { unit: "meters", centsPerUnit: 1_800 },
});

/**
 * Table 112-D item 13: "For each backflow protective device other than atmospheric-type
 * vacuum breakers: (ALSO FOR REPAIR) 2 inches and smaller — $15.00; over 2 inches — $30.00."
 *
 * The size is a fact of the device rather than of the permit, so it is asked for directly;
 * a device not marked over two inches is charged the $15.00 row, which is the schedule's
 * default and the row its own label leads with.
 */
export const ABQ_PLUMBING_BACKFLOW_SMALL: FeeRuleRecord = abqRule({
  id: "abq-plumb-backflow-small",
  code: "PLUMB-BACKFLOW-TO-2IN",
  label: "Backflow protective device, 2 inches and smaller, $15.00 each",
  description:
    'UAC Table 112-D item 13: "For each backflow protective device other than atmospheric-type vacuum breakers: (ALSO FOR REPAIR) 2 inches and smaller — $15.00." Atmospheric-type vacuum breakers are priced by item 12 instead ($15.00 for one through five, $3.00 each above five), and that row is named on the page rather than charged, because the schedule splits the two families by a device type this site asks for only one bit of.',
  feeType: "per_unit",
  config: { unit: "backflow_devices", centsPerUnit: 1_500 },
  conditions: { not: { field: "custom.backflow_over_2in", op: "eq", value: true } },
});

export const ABQ_PLUMBING_BACKFLOW_LARGE: FeeRuleRecord = abqRule({
  id: "abq-plumb-backflow-large",
  code: "PLUMB-BACKFLOW-OVER-2IN",
  label: "Backflow protective device, over 2 inches, $30.00 each",
  description:
    'UAC Table 112-D item 13: "over 2 inches — $30.00", charged per device and equally for a repair of one.',
  feeType: "per_unit",
  config: { unit: "backflow_devices", centsPerUnit: 3_000 },
  conditions: { field: "custom.backflow_over_2in", op: "eq", value: true },
});

/** Table 112-D item 5: "Gas outlet — $6.00 each." */
export const ABQ_PLUMBING_GAS_OUTLET: FeeRuleRecord = abqRule({
  id: "abq-plumb-gas-outlet",
  code: "PLUMB-GAS-OUTLET",
  label: "Gas outlets, $6.00 each",
  description:
    'UAC Table 112-D item 5: "Gas outlet — $6.00 each." Gas work is in the plumbing table because the Lincoln-era fuel gas jurisdiction sits with the plumbing inspector; the mechanical table\'s appliance rows are the ones this row does not cover.',
  feeType: "per_unit",
  config: { unit: "openings", centsPerUnit: 600 },
});

/** Table 112-D item 8: "Water service (from property line to house or building) — $14.00." */
export const ABQ_PLUMBING_WATER_SERVICE: FeeRuleRecord = abqRule({
  id: "abq-plumb-water-service",
  code: "PLUMB-WATER-SERVICE",
  label: "Water service from the property line, $14.00",
  description:
    'UAC Table 112-D item 8: "Water service (from property line to house or building) — $14.00." Charged when the permit includes a new water service, which the page asks for directly.',
  feeType: "flat",
  config: { amountCents: 1_400 },
  conditions: { field: "custom.water_service", op: "eq", value: true },
});

/** Table 112-D item 9: sewer tap, $18.00 each. */
export const ABQ_PLUMBING_SEWER_TAP: FeeRuleRecord = abqRule({
  id: "abq-plumb-sewer-tap",
  code: "PLUMB-SEWER-TAP",
  label: "New storm or sanitary sewer tap, $18.00 each",
  description:
    'UAC Table 112-D item 9: "For new storm sewer or sanitary sewer tap inspection (connection to public storm or sanitary sewer) — $18.00 each."',
  feeType: "flat",
  config: { amountCents: 1_800 },
  conditions: { field: "custom.sewer_tap", op: "eq", value: true },
});

/** Table 112-D item 10: house or building sewer including 2-way cleanout, $28.00 each. */
export const ABQ_PLUMBING_HOUSE_SEWER: FeeRuleRecord = abqRule({
  id: "abq-plumb-house-sewer",
  code: "PLUMB-HOUSE-SEWER",
  label: "House or building sewer with 2-way cleanout, $28.00 each",
  description:
    'UAC Table 112-D item 10: "House or building sewer (from property line to house or building) including 2-way cleanout — $28.00 each."',
  feeType: "flat",
  config: { amountCents: 2_800 },
  conditions: { field: "custom.house_sewer", op: "eq", value: true },
});

/** Table 112-D item 16: "Septic tank or cesspool — $80.00 each." */
export const ABQ_PLUMBING_SEPTIC: FeeRuleRecord = abqRule({
  id: "abq-plumb-septic",
  code: "PLUMB-SEPTIC-TANK",
  label: "Septic tank or cesspool, $80.00 each",
  description: 'UAC Table 112-D item 16: "Septic tank or cesspool — $80.00 each."',
  feeType: "per_unit",
  config: { unit: "septic_tanks", centsPerUnit: 8_000 },
});

export const ABQ_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  ABQ_PLUMBING_ADMIN,
  ABQ_PLUMBING_FIXTURES,
  ABQ_PLUMBING_SPRINKLERS,
  ABQ_PLUMBING_BACKFLOW_SMALL,
  ABQ_PLUMBING_BACKFLOW_LARGE,
  ABQ_PLUMBING_GAS_OUTLET,
  ABQ_PLUMBING_WATER_SERVICE,
  ABQ_PLUMBING_SEWER_TAP,
  ABQ_PLUMBING_HOUSE_SEWER,
  ABQ_PLUMBING_SEPTIC,
  abqTradePlanReview("PLUMB-PLAN-REVIEW", "abq-plumb-plan-review", "Plan review fee, 25% of the permit fee"),
  abqTradeInvestigation("abq-plumb-investigation", "PLUMB-INVESTIGATION-FEE"),
];
