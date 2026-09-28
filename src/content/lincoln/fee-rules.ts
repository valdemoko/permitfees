import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Lincoln, Nebraska fee rules — REAL DATA.
 *
 * Sources (research/nebraska/lincoln.md records how each was read):
 *
 *  S1  Lincoln Municipal Code, Title 20 (Building Code), Ch. 20.06 — Sec. 109.2
 *      "Schedule of Permit Fees" (20.06.130), comprising Table 1A (building permit
 *      fees) and Table 1B (miscellaneous fees), together with Sec. 109.2.1
 *      (plan review) and Sec. 109.3 (building permit valuations).
 *      https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10138
 *  S2  Lincoln Municipal Code, Title 23 (Electricity), Ch. 23.10 — Sec. 23.10.520
 *      "Permit Fees" and its Electrical Contractor Fee Schedule.
 *      https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10608
 *  S3  Lincoln Municipal Code, Title 24 (Plumbing and Sewers), Sec. 24.12.095 —
 *      amendment of Uniform Plumbing Code Sec. 104.5.
 *      https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10745
 *  S4  Lincoln Municipal Code, Title 25 (Heating), Sec. 25.06.090 — amendment of the
 *      Mechanical Code's fee section. Cited for the statement that the general
 *      mechanical fee is set by the City Council and provided by the Code Official,
 *      which is why the mechanical page publishes the fuel-gas rows below and says
 *      plainly that the HVAC rows are not published.
 *  S5  Lincoln Municipal Code, Title 24 (Plumbing and Sewers), Ch. 24.05 — the Lincoln
 *      Gas Piping Systems Code, whose Sec. 24.05.380 is the one trade-permit fee table
 *      in the whole code: permit fees for fuel-gas piping by outlet count, plus three
 *      flat rows for a replacement or an alteration.
 *      https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=10712
 *  S6  Lincoln Municipal Code, Title 25, Sec. 25.12.180 — "Chapter 4 of the
 *      International Fuel Gas Code is hereby deleted. Gas piping installations are
 *      governed by the Lincoln Fuel Gas Code." This is the bridge that makes S5 the
 *      operative fee table for gas piping rather than a superseded one.
 *      https://online.encodeplus.com/regs/lincoln-ne/doc-view.aspx?ajax=0&secid=11082
 *
 * **The mechanism.** Lincoln prices a building permit from a valuation table — Table 1A
 * — written in the same *"$X for the first $N plus $Y for each additional $1,000 or
 * fraction thereof"* shape as Omaha's and Houston's. Like Omaha's, and unlike Houston's,
 * it chains: the row ending at $10,000 produces exactly $127.00, which is what the next
 * row opens with, and the row ending at $25,000 produces exactly $202.00.
 *
 * **Plan review is a separate section at 65% of the permit fee, floor $100.** Sec.
 * 109.2.1 sets it and says it is "separate from and in addition to the permit fees ...
 * and shall not be credited to the total building permit fee if such permit is issued".
 * It applies "for commercial buildings, accessory buildings, and apartments", so it is
 * modelled behind a `custom.plan_review` fact; a one- or two-family house is not
 * charged it.
 *
 * **The one trade fee table Lincoln does publish.** Ch. 24.05 — the Lincoln Gas Piping
 * Systems Code — prices a fuel-gas permit itself, and Sec. 24.05.380 is the only place in
 * Titles 20 through 25 where a trade permit carries an amount instead of a delegation to
 * a Council schedule: $25.00 for new construction of one to five outlets with $1.00 for
 * each one after that, $6.00 to replace an appliance under another permit, $35.00 to
 * replace one on its own, and $15.00 for a gas piping alteration. Sec. 25.12.180 makes
 * that table operative rather than historical by deleting the International Fuel Gas
 * Code's own Chapter 4 and sending gas piping installations to the Lincoln Fuel Gas Code.
 *
 * The outlet row is a base-with-allowance shape — `$25.00` covering the first five
 * outlets, then `$1.00` each — which is exactly the `per_unit` primitive's
 * `baseCents`/`thresholdUnits`/`centsPerUnit` form that Phoenix's backflow row produced.
 *
 * **What is deliberately NOT here:**
 *
 *  - **The plumbing permit fee, and the general mechanical fee** for HVAC equipment.
 *    Lincoln's code does not publish either. Sec. 24.12.095 amends the Uniform Plumbing
 *    Code to say the plumbing fee "shall be set by the City Council and shall be provided
 *    to the applicant by the Authority Having Jurisdiction", and Sec. 25.06.090 says the
 *    same of the mechanical fee. There is no published figure to transcribe, so neither is
 *    modelled and no plumbing page is published — while the mechanical page is, on the
 *    fuel-gas rows that *are* published, with the absence stated on the page.
 *    That is a fact about Lincoln's code, not a gap in this dataset.
 *  - **Table 1B's other rows**: demolition ($200 residential, $250 plus $0.01 per sq ft
 *    commercial, $30 garages), the $100 fire- and building-damage investigation fees, the
 *    expedited-review rate (100% of the plan-review fee, min $300, max $6,000), the 10%
 *    application-extension fee and the 100% reinstatement fee. Named, not modelled.
 *  - **The development-permit and flood-plain rows** that follow Table 1B, and the
 *    doubling of a fee where work starts before a permit is issued.
 *  - **The electrical fee schedule's own per-item rows** beyond the ones modelled: the
 *    dormant-service inspection and the flat re-inspection fee are the two closest.
 *
 * **This module is the single definition of Lincoln's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records.
 */

/** Sec. 20.06.130 was last amended by Ord. 21786 §42, September 29, 2025. */
export const LINCOLN_BUILDING_FEE_EFFECTIVE_FROM = "2025-09-29";

/** Sec. 23.10.520 was last amended by Ord. 21875 §1, June 01, 2026. */
export const LINCOLN_ELECTRICAL_FEE_EFFECTIVE_FROM = "2026-06-01";

export const LINCOLN_BUILDING_SOURCE_KEY = "lincoln-municode-2006-130";
export const LINCOLN_ELECTRICAL_SOURCE_KEY = "lincoln-municode-2310-520";
export const LINCOLN_PLUMBING_SOURCE_KEY = "lincoln-municode-2412-095";
export const LINCOLN_MECHANICAL_SOURCE_KEY = "lincoln-municode-2506-090";
export const LINCOLN_GAS_PIPING_FEE_SOURCE_KEY = "lincoln-municode-2405-380";
export const LINCOLN_GAS_PIPING_SCOPE_SOURCE_KEY = "lincoln-municode-2512-180";
export const LINCOLN_GAS_PIPING_REGISTRATION_SOURCE_KEY = "lincoln-municode-2405-220";
export const LINCOLN_GAS_PIPING_APPLICATION_SOURCE_KEY = "lincoln-municode-2405-030";

/**
 * Sec. 24.05.380 was last amended by Ord. 19822 §4, January 28, 2013, and the table's
 * amounts have not changed since. The date is the schedule's own effective date, not an
 * estimate of when it was last read.
 */
export const LINCOLN_GAS_PIPING_FEE_EFFECTIVE_FROM = "2013-01-28";

/** Sec. 109.2.1: "an amount equal to 65% of the building permit fee". */
export const LINCOLN_PLAN_REVIEW_BPS = 6_500;
/** "... or $100.00 whichever is greater". */
export const LINCOLN_PLAN_REVIEW_MINIMUM_CENTS = 10_000;

const BUILDING_SOURCE = LINCOLN_BUILDING_SOURCE_KEY;

function lincolnRule(
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
    effectiveFrom: LINCOLN_BUILDING_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: BUILDING_SOURCE,
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
/* Structural building permit fee — Sec. 109.2, Table 1A                      */
/* -------------------------------------------------------------------------- */

/**
 * Four published rows. Table 1A's own arithmetic closes at both handovers:
 * $127.00 at $10,000 and $202.00 at $25,000 are each what the row below produces at
 * its top, which is asserted in tests/content/lincoln-seed.test.ts.
 */
export const LINCOLN_STRUCTURAL_BRACKETS: FeeRuleRecord[] = [
  lincolnRule({
    id: "lincoln-t1a-1000",
    code: "T1A-1000",
    label: "Building permit fee, valuation $0 to $1,000",
    description: "Table 1A — flat $55.00 for total valuations of $0 to and including $1,000.",
    feeType: "flat",
    config: { amountCents: 5_500 },
    conditions: valuationBracket(0, 100_000),
  }),
  lincolnRule({
    id: "lincoln-t1a-10000",
    code: "T1A-10000",
    label: "Building permit fee, valuation $1,001 to $10,000",
    description:
      "Table 1A — $55.00 for the first $1,000, plus $8.00 for each additional $1,000 value and fraction thereof, to and including $10,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 5_500,
      thresholdCents: 100_000,
      incrementCents: 100_000,
      centsPerThousand: 800,
    },
    conditions: valuationBracket(100_000, 1_000_000),
  }),
  lincolnRule({
    id: "lincoln-t1a-25000",
    code: "T1A-25000",
    label: "Building permit fee, valuation $10,001 to $25,000",
    description:
      "Table 1A — $127.00 for the first $10,000, plus $5.00 for each $1,000 value and fraction thereof, to and including $25,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 12_700,
      thresholdCents: 1_000_000,
      incrementCents: 100_000,
      centsPerThousand: 500,
    },
    conditions: valuationBracket(1_000_000, 2_500_000),
  }),
  lincolnRule({
    id: "lincoln-t1a-over-25000",
    code: "T1A-OVER-25000",
    label: "Building permit fee, valuation over $25,000",
    description:
      "Table 1A — $202.00 for the first $25,000, plus $2.00 for each $1,000 value and fraction thereof over $25,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 20_200,
      thresholdCents: 2_500_000,
      incrementCents: 100_000,
      centsPerThousand: 200,
    },
    conditions: valuationBracket(2_500_000, null),
  }),
];

/** Table 1A's reinspection fee: "Reinspection fee ... $55.00". */
export const LINCOLN_REINSPECTION_FEE: FeeRuleRecord = lincolnRule({
  id: "lincoln-t1a-reinspection",
  code: "T1A-REINSPECTION",
  label: "Reinspection fee",
  description:
    "Table 1A — $55.00 reinspection fee for a wrong address, work that does not pass inspection, or work that is not complete.",
  componentType: "inspection",
  feeType: "flat",
  config: { amountCents: 5_500 },
  conditions: { field: "custom.reinspection", op: "eq", value: true },
  priority: 800,
});

/* -------------------------------------------------------------------------- */
/* Plan review — Sec. 109.2.1                                                 */
/* -------------------------------------------------------------------------- */

/**
 * "Said plan review fee shall be an amount equal to 65% of the building permit fee as
 * shown in Table 1A above, or $100.00 whichever is greater, for commercial buildings,
 * accessory buildings, and apartments." It is "separate from and in addition to the
 * permit fees", which is the `permit_fee` basis: the fee is computed from this run's
 * base subtotal, with the $100 floor expressed as the rule's own `minimumCents`.
 */
export const LINCOLN_PLAN_REVIEW: FeeRuleRecord = lincolnRule({
  id: "lincoln-plan-review",
  code: "PLAN-REVIEW-65",
  label: "Plan review fee",
  description:
    "Sec. 109.2.1 — 65% of the building permit fee shown in Table 1A, or $100.00 whichever is greater, for commercial buildings, accessory buildings and apartments.",
  componentType: "plan_review",
  feeType: "percent",
  config: { basis: "permit_fee", rateBps: LINCOLN_PLAN_REVIEW_BPS },
  conditions: { field: "custom.plan_review", op: "eq", value: true },
  minimumCents: LINCOLN_PLAN_REVIEW_MINIMUM_CENTS,
  priority: 500,
});

/* -------------------------------------------------------------------------- */
/* Electrical permit fees — Sec. 23.10.520                                    */
/* -------------------------------------------------------------------------- */

function electricalRule(
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
    effectiveFrom: LINCOLN_ELECTRICAL_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: LINCOLN_ELECTRICAL_SOURCE_KEY,
    ...overrides,
  };
}

/**
 * "Base Permit Fee (To be added to all other fees that apply to the application.) $30.00".
 *
 * The allowance for the first circuit is deliberately **not** modelled: the schedule
 * charges the base fee *and* every branch circuit, so subtracting one would understate
 * a one-circuit permit by $6.00.
 */
export const LINCOLN_ELECTRICAL_BASE_FEE: FeeRuleRecord = electricalRule({
  id: "lincoln-2310-base",
  code: "ELEC-BASE",
  label: "Electrical base permit fee",
  description:
    "Sec. 23.10.520 — $30.00 base permit fee, added to all other fees that apply to the application.",
  feeType: "flat",
  config: { amountCents: 3_000 },
});

/** "Branch circuit(s) and/or feeder(s) $6.00 each". */
export const LINCOLN_ELECTRICAL_BRANCH_CIRCUIT: FeeRuleRecord = electricalRule({
  id: "lincoln-2310-circuit",
  code: "ELEC-BRANCH-CIRCUIT",
  label: "Electrical permit — branch circuit or feeder",
  description: "Sec. 23.10.520 — $6.00 for each branch circuit and/or feeder.",
  feeType: "per_unit",
  config: { unit: "circuits", centsPerUnit: 600 },
});

/**
 * Service equipment, new or replacement, priced by amperage:
 *
 *   | 0-200 A    | $30.00  |
 *   | 201-400 A  | $45.00  |
 *   | 401-800 A  | $90.00  |
 *   | 801-2000 A | $200.00 |
 *   | over 2000 A| $400.00 |
 */
export const LINCOLN_ELECTRICAL_SERVICE_ROWS: FeeRuleRecord[] = [
  electricalRule({
    id: "lincoln-2310-service-200",
    code: "ELEC-SERVICE-200",
    label: "Electrical permit — service equipment 0 to 200 amperes",
    description: "Sec. 23.10.520 — $30.00 for new or replacement service equipment of 0 to 200 amperes.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [
        { field: "custom.service_work", op: "eq", value: true },
        { field: "custom.amperage", op: "lte", value: 200 },
      ],
    },
  }),
  electricalRule({
    id: "lincoln-2310-service-400",
    code: "ELEC-SERVICE-400",
    label: "Electrical permit — service equipment 201 to 400 amperes",
    description: "Sec. 23.10.520 — $45.00 for new or replacement service equipment of 201 to 400 amperes.",
    feeType: "flat",
    config: { amountCents: 4_500 },
    conditions: {
      all: [
        { field: "custom.service_work", op: "eq", value: true },
        { field: "custom.amperage", op: "gt", value: 200 },
        { field: "custom.amperage", op: "lte", value: 400 },
      ],
    },
  }),
  electricalRule({
    id: "lincoln-2310-service-800",
    code: "ELEC-SERVICE-800",
    label: "Electrical permit — service equipment 401 to 800 amperes",
    description: "Sec. 23.10.520 — $90.00 for new or replacement service equipment of 401 to 800 amperes.",
    feeType: "flat",
    config: { amountCents: 9_000 },
    conditions: {
      all: [
        { field: "custom.service_work", op: "eq", value: true },
        { field: "custom.amperage", op: "gt", value: 400 },
        { field: "custom.amperage", op: "lte", value: 800 },
      ],
    },
  }),
  electricalRule({
    id: "lincoln-2310-service-2000",
    code: "ELEC-SERVICE-2000",
    label: "Electrical permit — service equipment 801 to 2,000 amperes",
    description:
      "Sec. 23.10.520 — $200.00 for new or replacement service equipment of 801 to 2,000 amperes.",
    feeType: "flat",
    config: { amountCents: 20_000 },
    conditions: {
      all: [
        { field: "custom.service_work", op: "eq", value: true },
        { field: "custom.amperage", op: "gt", value: 800 },
        { field: "custom.amperage", op: "lte", value: 2_000 },
      ],
    },
  }),
  electricalRule({
    id: "lincoln-2310-service-over-2000",
    code: "ELEC-SERVICE-OVER-2000",
    label: "Electrical permit — service equipment over 2,000 amperes",
    description: "Sec. 23.10.520 — $400.00 for new or replacement service equipment over 2,000 amperes.",
    feeType: "flat",
    config: { amountCents: 40_000 },
    conditions: {
      all: [
        { field: "custom.service_work", op: "eq", value: true },
        { field: "custom.amperage", op: "gt", value: 2_000 },
      ],
    },
  }),
];

/** "Fee for inspection of dormant services for the purpose of restoring power $30.00". */
export const LINCOLN_ELECTRICAL_DORMANT_SERVICE: FeeRuleRecord = electricalRule({
  id: "lincoln-2310-dormant",
  code: "ELEC-DORMANT-SERVICE",
  label: "Electrical permit — dormant service inspection",
  description:
    "Sec. 23.10.520 — $30.00 for the inspection of a dormant service for the purpose of restoring power.",
  componentType: "inspection",
  feeType: "flat",
  config: { amountCents: 3_000 },
  conditions: { field: "custom.dormant_service", op: "eq", value: true },
  priority: 800,
});

/** "Re-Inspection fee $50.00 each". */
export const LINCOLN_ELECTRICAL_REINSPECTION: FeeRuleRecord = electricalRule({
  id: "lincoln-2310-reinspection",
  code: "ELEC-REINSPECTION",
  label: "Electrical permit — re-inspection fee",
  description: "Sec. 23.10.520 — $50.00 for each re-inspection.",
  componentType: "inspection",
  feeType: "per_unit",
  config: { unit: "inspections", centsPerUnit: 5_000 },
  conditions: { field: "custom.reinspections", op: "exists" },
  priority: 800,
});

/* -------------------------------------------------------------------------- */
/* Mechanical and fuel-gas permit fees — Sec. 24.05.380                       */
/* -------------------------------------------------------------------------- */

/**
 * The four rows of Sec. 24.05.380, verbatim:
 *
 *   New construction (1-5 outlets)                          $25.00
 *   Each additional outlet                                   $1.00
 *   Replacement with another permit (heating or plumbing)     $6.00
 *   Replacement alone (with no other permit)                 $35.00
 *   Gas piping alteration                                    $15.00
 *
 * They are alternatives, not additions — the table reads "the permit fees charged in
 * this chapter", and a replacement cannot also be new construction. `custom.gas_work`
 * carries the choice, the way `custom.schedule_item` does for Scottsdale, and the outlet
 * row is the one that applies when nothing is chosen: an outlet count with no stated work
 * type is new gas piping.
 */
export const LINCOLN_GAS_WORK = {
  newConstruction: "new_construction",
  replacementWithOtherPermit: "replacement_with_other_permit",
  replacementAlone: "replacement_alone",
  alteration: "gas_piping_alteration",
} as const;

export type LincolnGasWork = (typeof LINCOLN_GAS_WORK)[keyof typeof LINCOLN_GAS_WORK];

function gasRule(
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
    effectiveFrom: LINCOLN_GAS_PIPING_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: LINCOLN_GAS_PIPING_FEE_SOURCE_KEY,
    ...overrides,
  };
}

/**
 * "New construction (1-5 outlets) $25.00" with "Each additional outlet $1.00".
 *
 * A base with an allowance: $25.00 covers the first five outlets and each one after
 * that is a dollar. Eight outlets are $28.00, not $33.00 — the difference between
 * reading the row as a rate per outlet and reading it as the table writes it.
 */
export const LINCOLN_GAS_NEW_CONSTRUCTION: FeeRuleRecord = gasRule({
  id: "lincoln-2405-new-construction",
  code: "GAS-NEW-CONSTRUCTION",
  label: "Fuel-gas permit — new construction, first five outlets",
  description:
    "Sec. 24.05.380 — $25.00 for new construction of one to five outlets, then $1.00 for each additional outlet.",
  feeType: "per_unit",
  config: { unit: "outlets", baseCents: 2_500, thresholdUnits: 5, centsPerUnit: 100 },
  conditions: { field: "custom.gas_work", op: "absent" },
  priority: 100,
});

/** "Replacement with another permit (heating or plumbing) $6.00". */
export const LINCOLN_GAS_REPLACEMENT_WITH_OTHER_PERMIT: FeeRuleRecord = gasRule({
  id: "lincoln-2405-replacement-with-permit",
  code: "GAS-REPLACEMENT-WITH-PERMIT",
  label: "Fuel-gas permit — appliance replacement under another permit",
  description:
    "Sec. 24.05.380 — $6.00 to replace an appliance where a heating or plumbing permit is being taken out for the same job.",
  feeType: "flat",
  config: { amountCents: 600 },
  conditions: {
    field: "custom.gas_work",
    op: "eq",
    value: LINCOLN_GAS_WORK.replacementWithOtherPermit,
  },
  priority: 110,
});

/** "Replacement alone (with no other permit) $35.00". */
export const LINCOLN_GAS_REPLACEMENT_ALONE: FeeRuleRecord = gasRule({
  id: "lincoln-2405-replacement-alone",
  code: "GAS-REPLACEMENT-ALONE",
  label: "Fuel-gas permit — appliance replacement on its own",
  description:
    "Sec. 24.05.380 — $35.00 to replace an appliance where no other permit is being taken out for the job.",
  feeType: "flat",
  config: { amountCents: 3_500 },
  conditions: { field: "custom.gas_work", op: "eq", value: LINCOLN_GAS_WORK.replacementAlone },
  priority: 110,
});

/** "Gas piping alteration $15.00". */
export const LINCOLN_GAS_ALTERATION: FeeRuleRecord = gasRule({
  id: "lincoln-2405-alteration",
  code: "GAS-ALTERATION",
  label: "Fuel-gas permit — piping alteration",
  description: "Sec. 24.05.380 — $15.00 for an alteration to existing gas piping.",
  feeType: "flat",
  config: { amountCents: 1_500 },
  conditions: { field: "custom.gas_work", op: "eq", value: LINCOLN_GAS_WORK.alteration },
  priority: 110,
});

/** The four rows of Sec. 24.05.380, in the order the table prints them. */
export const LINCOLN_GAS_PIPING_RULES: FeeRuleRecord[] = [
  LINCOLN_GAS_NEW_CONSTRUCTION,
  LINCOLN_GAS_REPLACEMENT_WITH_OTHER_PERMIT,
  LINCOLN_GAS_REPLACEMENT_ALONE,
  LINCOLN_GAS_ALTERATION,
];
