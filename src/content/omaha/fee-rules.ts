import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Omaha, Nebraska fee rules — REAL DATA.
 *
 * Sources (research/nebraska/omaha.md records how each was read):
 *
 *  S1  Omaha Municipal Code, Chapter 43 (Building), Article I, Division 7 — Fees:
 *      Sec. 43-91 "Permit fees" and its Table 43-91, and Sec. 43-92 "Plan review fees".
 *      https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH43BU_ARTIADEN_DIV7FE_S43-91PEFE
 *  S2  Omaha Municipal Code, Chapter 44 (Electricity), Article IV — Permits and Inspections:
 *      Sec. 44-130 "Fee schedule".
 *      https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH44EL_ARTIVPEIN
 *  S3  Omaha Municipal Code, Chapter 49 (Plumbing), Article III, Division 1 —
 *      Sec. 49-304 "Permit fees" and its Table 49-304.
 *      https://library.municode.com/ne/omaha/codes/code_of_ordinances?nodeId=OMMUCOCHGEORVOII_CH49PL_ARTIIIPEINFE_DIV1PE_S49-304PEFE
 *  S4  City of Omaha Planning Department, "Application Fees" — the Technology and
 *      Training Fee Schedule (Ordinance #39121).
 *      https://planning.omaha.gov/application-fees/
 *
 * **The mechanism.** Omaha prices a building permit from a valuation table, exactly
 * as Houston and Denver do — but this table is a clean chain. Every one of the six
 * handovers closes to the cent: the band below produces, at its own top, precisely the
 * figure the band above opens with ($41 at $2,000; $260.19 at $25,000; $421.19 at
 * $50,000; $580.69 at $100,000; $1,692.69 at $500,000; $2,877.69 at $1,000,000). That
 * is worth stating because it is *not* how Houston's or Denver's tables behave, and a
 * reader comparing the three cities should know which seams are worth checking.
 *
 * **Plan review is its own section, not a column.** Sec. 43-92 charges plan review at
 * "25 percent of the building permit fee as shown in table 43-91" — the same
 * percentage-of-another-component shape Denver's review column has, expressed here as
 * a `permit_fee` rule. It is modelled behind a `custom.plan_review` fact because a deck
 * or a shed is reviewed by inspection rather than at a desk, and the City's own
 * published example (a $10,000 deck) carries no review fee.
 *
 * **The Technology and Training fee is real and the City's own example proves it.**
 * The Planning Department adds a fee under Ordinance #39121 to every fee it collects:
 * 8% of the underlying fee up to $624.99, then a flat $50 up to $2,499.99, then a flat
 * $100 above that. The City's own worked example — "a permit fee of $126.62 would be
 * charged for a $10,000 deck" — is $117.24 (Table 43-91 at $10,000) times 1.08 exactly,
 * which is how this site knows the surcharge applies to the permit fee and not to some
 * other total. It is modelled as a `technology` component so the breakdown names it.
 *
 * **What is deliberately NOT here:**
 *
 *  - The per-item flat rows of Sec. 44-130 (pre-connect, re-connect, low-voltage,
 *    outage, temporary pole/service) beyond the temporary pole, which is modelled.
 *    They are named on the electrical page rather than guessed at.
 *  - The plumbing rows of Table 49-304 that share a count namespace with the ones
 *    modelled here — water service, sewer connections, solar collectors, interceptors.
 *    The three per-item rows modelled are the ones a residential permit touches.
 *  - Sec. 43-91's shoring, insulation, after-hours inspection, duplicate-plan,
 *    building-analysis and certificate-of-occupancy fees, and the quadruple fee for
 *    work begun without a permit. All are named in the exclusions.
 *
 * **This module is the single definition of Omaha's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records.
 */

/**
 * The date these figures are recorded as published under.
 *
 * Omaha has no single effective date for the schedule: each section carries the
 * ordinance that last amended it. The Municipal Code this site read was published as
 * version August 31, 2026, and that is the date recorded — not an invented one — so a
 * reader can see which version of the code the numbers came from. The building table
 * was additionally amended in 2025 by Ord. No. 44525, published by the City Clerk.
 */
export const OMAHA_FEE_EFFECTIVE_FROM = "2026-08-31";

export const OMAHA_BUILDING_CODE_SOURCE_KEY = "omaha-municode-ch43-fees";
export const OMAHA_ELECTRICAL_CODE_SOURCE_KEY = "omaha-municode-ch44-electrical";
export const OMAHA_PLUMBING_CODE_SOURCE_KEY = "omaha-municode-ch49-plumbing";
export const OMAHA_PLANNING_FEES_SOURCE_KEY = "omaha-planning-application-fees";

/** Plan review is a quarter of the building permit fee: "25 percent ... as shown in table 43-91." */
export const OMAHA_PLAN_REVIEW_BPS = 2_500;

/** Ordinance #39121: 8% of the underlying fee, then capped at $50 and $100. */
export const OMAHA_TECHNOLOGY_FEE_BPS = 800;
export const OMAHA_TECHNOLOGY_FEE_CAP_MID_CENTS = 5_000;
export const OMAHA_TECHNOLOGY_FEE_CAP_HIGH_CENTS = 10_000;
/** Boundary of the 8% band: "$0.00-$624.99 | 8% of underlying fees". */
export const OMAHA_TECHNOLOGY_FEE_FIRST_BAND_TOP_CENTS = 62_499;
/** Boundary of the flat $50 band: "$625.00-$2,499.99 | $50.00". */
export const OMAHA_TECHNOLOGY_FEE_SECOND_BAND_TOP_CENTS = 249_999;

function omahaRule(
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
    effectiveFrom: OMAHA_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: OMAHA_BUILDING_CODE_SOURCE_KEY,
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
/* Structural building permit fee — Sec. 43-91, Table 43-91                  */
/* -------------------------------------------------------------------------- */

/**
 * Seven published brackets, chained exactly. Each row is written as *"$X for the
 * first $N plus $Y for each additional $1,000 or fraction thereof"*, so the rate is
 * charged per whole or partial thousand and the published Base Charge is reproduced
 * verbatim rather than re-derived.
 */
export const OMAHA_STRUCTURAL_BRACKETS: FeeRuleRecord[] = [
  omahaRule({
    id: "omaha-t4391-b1",
    code: "T4391-B1",
    label: "Building permit fee, valuation $1.00 to $2,000.00",
    description: "Sec. 43-91, Table 43-91 — flat $41.00 for valuations of $1.00 to $2,000.00.",
    feeType: "flat",
    config: { amountCents: 4_100 },
    conditions: valuationBracket(0, 200_000),
  }),
  omahaRule({
    id: "omaha-t4391-b2",
    code: "T4391-B2",
    label: "Building permit fee, valuation $2,000.01 to $25,000.00",
    description:
      "Sec. 43-91, Table 43-91 — $41.00 for the first $2,000.00 plus $9.53 for each additional $1,000.00 or fraction thereof, to and including $25,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 4_100,
      thresholdCents: 200_000,
      incrementCents: 100_000,
      centsPerThousand: 953,
    },
    conditions: valuationBracket(200_000, 2_500_000),
  }),
  omahaRule({
    id: "omaha-t4391-b3",
    code: "T4391-B3",
    label: "Building permit fee, valuation $25,000.01 to $50,000.00",
    description:
      "Sec. 43-91, Table 43-91 — $260.19 for the first $25,000.00 plus $6.44 for each additional $1,000.00 or fraction thereof, to and including $50,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 26_019,
      thresholdCents: 2_500_000,
      incrementCents: 100_000,
      centsPerThousand: 644,
    },
    conditions: valuationBracket(2_500_000, 5_000_000),
  }),
  omahaRule({
    id: "omaha-t4391-b4",
    code: "T4391-B4",
    label: "Building permit fee, valuation $50,000.01 to $100,000.00",
    description:
      "Sec. 43-91, Table 43-91 — $421.19 for the first $50,000.00 plus $3.19 for each additional $1,000.00 or fraction thereof, to and including $100,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 42_119,
      thresholdCents: 5_000_000,
      incrementCents: 100_000,
      centsPerThousand: 319,
    },
    conditions: valuationBracket(5_000_000, 10_000_000),
  }),
  omahaRule({
    id: "omaha-t4391-b5",
    code: "T4391-B5",
    label: "Building permit fee, valuation $100,000.01 to $500,000.00",
    description:
      "Sec. 43-91, Table 43-91 — $580.69 for the first $100,000.00 plus $2.78 for each additional $1,000.00 or fraction thereof, to and including $500,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 58_069,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      centsPerThousand: 278,
    },
    conditions: valuationBracket(10_000_000, 50_000_000),
  }),
  omahaRule({
    id: "omaha-t4391-b6",
    code: "T4391-B6",
    label: "Building permit fee, valuation $500,000.01 to $1,000,000.00",
    description:
      "Sec. 43-91, Table 43-91 — $1,692.69 for the first $500,000.00 plus $2.37 for each additional $1,000.00 or fraction thereof, to and including $1,000,000.00.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 169_269,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      centsPerThousand: 237,
    },
    conditions: valuationBracket(50_000_000, 100_000_000),
  }),
  omahaRule({
    id: "omaha-t4391-b7",
    code: "T4391-B7",
    label: "Building permit fee, valuation $1,000,000.01 and up",
    description:
      "Sec. 43-91, Table 43-91 — $2,877.69 for the first $1,000,000.00 plus $1.96 for each additional $1,000.00 or fraction thereof.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 287_769,
      thresholdCents: 100_000_000,
      incrementCents: 100_000,
      centsPerThousand: 196,
    },
    conditions: valuationBracket(100_000_000, null),
  }),
];

/* -------------------------------------------------------------------------- */
/* Plan review — Sec. 43-92                                                  */
/* -------------------------------------------------------------------------- */

/**
 * "The plan review fee shall be 25 percent of the building permit fee as shown in
 * table 43-91."
 *
 * Modelled on the `permit_fee` basis — the base subtotal this run computed — rather
 * than as a second valuation table, so the two fees can never disagree. Gated on
 * `custom.plan_review` because Omaha inspects small replacement work in the field
 * instead of reviewing plans at a desk.
 */
export const OMAHA_PLAN_REVIEW: FeeRuleRecord = omahaRule({
  id: "omaha-4392-plan-review",
  code: "PLAN-REVIEW-25",
  label: "Plan review fee",
  description:
    "Sec. 43-92 — plan review is 25 percent of the building permit fee shown in Table 43-91.",
  componentType: "plan_review",
  feeType: "percent",
  config: { basis: "permit_fee", rateBps: OMAHA_PLAN_REVIEW_BPS },
  conditions: { field: "custom.plan_review", op: "eq", value: true },
  priority: 500,
});

/* -------------------------------------------------------------------------- */
/* Technology and Training fee — Ordinance #39121 (Planning Department)      */
/* -------------------------------------------------------------------------- */

/**
 * Three published rows, selected by the size of the underlying permit fee:
 *
 *   | Underlying fee charged for permit | Maximum Technology and Training Fee |
 *   | $0.00-$624.99                     | 8% of underlying fees              |
 *   | $625.00-$2,499.99                 | $50.00                             |
 *   | $2,500 and above                  | $100.00                            |
 *
 * The City's own published example is the check that this belongs on the building
 * permit: "$126.62 would be charged for a $10,000 deck", and Table 43-91 gives $117.24
 * at $10,000 — $126.62 is that plus 8%. So the percentage row reads the permit fee.
 */
export const OMAHA_TECHNOLOGY_FEE_ROWS: FeeRuleRecord[] = [
  omahaRule({
    id: "omaha-tech-8pct",
    code: "TECH-8PCT",
    label: "Technology and Training fee — 8% band",
    description:
      "Ordinance #39121 — 8% of the underlying fee charged for a permit, for underlying fees of $0.00 to $624.99.",
    componentType: "technology",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: OMAHA_TECHNOLOGY_FEE_BPS },
    conditions: {
      field: "permit_fee",
      op: "lte",
      value: OMAHA_TECHNOLOGY_FEE_FIRST_BAND_TOP_CENTS,
    },
    priority: 600,
    sourceId: OMAHA_PLANNING_FEES_SOURCE_KEY,
  }),
  omahaRule({
    id: "omaha-tech-cap-50",
    code: "TECH-CAP-50",
    label: "Technology and Training fee — $50 band",
    description:
      "Ordinance #39121 — a flat $50.00 technology and training fee for underlying fees of $625.00 to $2,499.99.",
    componentType: "technology",
    feeType: "flat",
    config: { amountCents: OMAHA_TECHNOLOGY_FEE_CAP_MID_CENTS },
    conditions: {
      all: [
        { field: "permit_fee", op: "gt", value: OMAHA_TECHNOLOGY_FEE_FIRST_BAND_TOP_CENTS },
        { field: "permit_fee", op: "lte", value: OMAHA_TECHNOLOGY_FEE_SECOND_BAND_TOP_CENTS },
      ],
    },
    priority: 600,
    sourceId: OMAHA_PLANNING_FEES_SOURCE_KEY,
  }),
  omahaRule({
    id: "omaha-tech-cap-100",
    code: "TECH-CAP-100",
    label: "Technology and Training fee — $100 band",
    description:
      "Ordinance #39121 — a flat $100.00 technology and training fee for underlying fees of $2,500.00 and above.",
    componentType: "technology",
    feeType: "flat",
    config: { amountCents: OMAHA_TECHNOLOGY_FEE_CAP_HIGH_CENTS },
    conditions: {
      field: "permit_fee",
      op: "gt",
      value: OMAHA_TECHNOLOGY_FEE_SECOND_BAND_TOP_CENTS,
    },
    priority: 600,
    sourceId: OMAHA_PLANNING_FEES_SOURCE_KEY,
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical permit fees — Sec. 44-130                                      */
/* -------------------------------------------------------------------------- */

/** "The minimum fee on all electrical work shall be $25.00." */
export const OMAHA_ELECTRICAL_MINIMUM: FeeRuleRecord = omahaRule({
  id: "omaha-44130-min",
  code: "ELEC-MIN-44130",
  label: "Minimum electrical permit fee",
  description:
    "Sec. 44-130 — the minimum fee on all electrical work is $25.00, charged as the shortfall against the permit subtotal.",
  feeType: "permit_minimum",
  config: { basis: "permit_fee", floorCents: 2_500 },
  priority: 900,
  sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
});

/**
 * "New residential: ... Square foot, each .....00.06" — six cents per square foot,
 * covering all wiring, the service, major appliances and electric heat. Rounded to
 * a fraction of a cent per square foot, so it is stated as an exact rate.
 */
export const OMAHA_ELECTRICAL_RESIDENTIAL_SQFT: FeeRuleRecord = omahaRule({
  id: "omaha-44130-res-sqft",
  code: "ELEC-RES-SQFT",
  label: "Electrical permit, new residential — per square foot",
  description:
    "Sec. 44-130(a)(3) — $0.06 per square foot for new single-family, two-family and town home electrical work, which covers all wiring, the service, major appliances and electric heat.",
  feeType: "percent",
  // Six cents per square foot is `{ numerator: 6, denominator: 1 }`: an exact rate
  // against a basis is read in cents per unit of that basis, which is how Dallas's
  // `$0.34569 per sq ft` is stored too.
  config: {
    basis: "square_footage",
    rate: { numerator: 6, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: { field: "custom.electrical_scope", op: "eq", value: "new_residential" },
  sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
});

/** "Branch circuits and feeders, each .....2.00" — commercial and everything else. */
export const OMAHA_ELECTRICAL_BRANCH_CIRCUITS: FeeRuleRecord = omahaRule({
  id: "omaha-44130-circuits",
  code: "ELEC-BRANCH-CIRCUITS",
  label: "Electrical permit — branch circuits and feeders",
  description:
    "Sec. 44-130(b)(1) — $2.00 each for branch circuits and feeders, new or extended, on commercial work, apartments, existing residential and all other permits.",
  feeType: "per_unit",
  config: { unit: "circuits", centsPerUnit: 200 },
  conditions: { field: "custom.electrical_scope", op: "eq", value: "commercial" },
  sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
});

/** "Existing electrical service .....20.00". */
export const OMAHA_ELECTRICAL_EXISTING_SERVICE: FeeRuleRecord = omahaRule({
  id: "omaha-44130-existing-service",
  code: "ELEC-SERVICE-EXISTING",
  label: "Electrical permit — existing service",
  description:
    "Sec. 44-130(b)(2) — $20.00 for repairs to or work on an existing electrical service.",
  feeType: "flat",
  config: { amountCents: 2_000 },
  conditions: { field: "custom.service_type", op: "eq", value: "existing" },
  sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
});

/**
 * "New service: 1—100 ampere .....25.00; 101—200 ampere .....25.00; 201—400 ampere
 * .....65.00; 401—600 ampere .....105.00; 601—800 ampere .....145.00; 801—1,000
 * ampere .....185.00".
 *
 * The first two bands publish the same $25.00, so they are one rule bounded by 200 A.
 */
export const OMAHA_ELECTRICAL_NEW_SERVICE_ROWS: FeeRuleRecord[] = [
  omahaRule({
    id: "omaha-44130-service-200",
    code: "ELEC-SERVICE-200",
    label: "Electrical permit — new service up to 200 amperes",
    description:
      "Sec. 44-130(b)(3) — $25.00 for a new service of 1 to 100 amperes and, at the same published figure, 101 to 200 amperes.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: {
      all: [
        { field: "custom.service_type", op: "eq", value: "new" },
        { field: "custom.amperage", op: "lte", value: 200 },
      ],
    },
    sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
  }),
  omahaRule({
    id: "omaha-44130-service-400",
    code: "ELEC-SERVICE-400",
    label: "Electrical permit — new service 201 to 400 amperes",
    description: "Sec. 44-130(b)(3) — $65.00 for a new service of 201 to 400 amperes.",
    feeType: "flat",
    config: { amountCents: 6_500 },
    conditions: {
      all: [
        { field: "custom.service_type", op: "eq", value: "new" },
        { field: "custom.amperage", op: "gt", value: 200 },
        { field: "custom.amperage", op: "lte", value: 400 },
      ],
    },
    sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
  }),
  omahaRule({
    id: "omaha-44130-service-600",
    code: "ELEC-SERVICE-600",
    label: "Electrical permit — new service 401 to 600 amperes",
    description: "Sec. 44-130(b)(3) — $105.00 for a new service of 401 to 600 amperes.",
    feeType: "flat",
    config: { amountCents: 10_500 },
    conditions: {
      all: [
        { field: "custom.service_type", op: "eq", value: "new" },
        { field: "custom.amperage", op: "gt", value: 400 },
        { field: "custom.amperage", op: "lte", value: 600 },
      ],
    },
    sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
  }),
  omahaRule({
    id: "omaha-44130-service-800",
    code: "ELEC-SERVICE-800",
    label: "Electrical permit — new service 601 to 800 amperes",
    description: "Sec. 44-130(b)(3) — $145.00 for a new service of 601 to 800 amperes.",
    feeType: "flat",
    config: { amountCents: 14_500 },
    conditions: {
      all: [
        { field: "custom.service_type", op: "eq", value: "new" },
        { field: "custom.amperage", op: "gt", value: 600 },
        { field: "custom.amperage", op: "lte", value: 800 },
      ],
    },
    sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
  }),
  omahaRule({
    id: "omaha-44130-service-1000",
    code: "ELEC-SERVICE-1000",
    label: "Electrical permit — new service 801 to 1,000 amperes",
    description: "Sec. 44-130(b)(3) — $185.00 for a new service of 801 to 1,000 amperes.",
    feeType: "flat",
    config: { amountCents: 18_500 },
    conditions: {
      all: [
        { field: "custom.service_type", op: "eq", value: "new" },
        { field: "custom.amperage", op: "gt", value: 800 },
        { field: "custom.amperage", op: "lte", value: 1_000 },
      ],
    },
    sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
  }),
  omahaRule({
    id: "omaha-44130-service-over-1000",
    code: "ELEC-SERVICE-OVER-1000",
    label: "Electrical permit — new service larger than 1,000 amperes",
    description:
      "Sec. 44-130(b)(3) — services larger than 1,000 amperes: $185.00 for the first 1,000 amperes plus $20.00 for each additional 100 amperes.",
    feeType: "percent",
    config: {
      basis: "amperage",
      // $20.00 for each additional 100 amperes is 20 cents per ampere.
      rate: { numerator: 20, denominator: 1 },
      rateUnit: "currency_per_unit",
      thresholdCents: 1_000,
      incrementCents: 100,
      baseCents: 18_500,
    },
    conditions: {
      all: [
        { field: "custom.service_type", op: "eq", value: "new" },
        { field: "custom.amperage", op: "gt", value: 1_000 },
      ],
    },
    sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
  }),
];

/** "Temporary pole/service, each .....25.00". */
export const OMAHA_ELECTRICAL_TEMPORARY_POLE: FeeRuleRecord = omahaRule({
  id: "omaha-44130-temp-pole",
  code: "ELEC-TEMP-POLE",
  label: "Electrical permit — temporary pole or service",
  description: "Sec. 44-130(b)(7) — $25.00 for each temporary pole or temporary service.",
  feeType: "flat",
  config: { amountCents: 2_500 },
  conditions: { field: "custom.temporary_pole", op: "eq", value: true },
  sourceId: OMAHA_ELECTRICAL_CODE_SOURCE_KEY,
});

/* -------------------------------------------------------------------------- */
/* Plumbing permit fees — Sec. 49-304, Table 49-304                          */
/* -------------------------------------------------------------------------- */

/** "The minimum permit fee shall be $22.70 payable to the city prior to issuance." */
export const OMAHA_PLUMBING_MINIMUM: FeeRuleRecord = omahaRule({
  id: "omaha-49304-min",
  code: "PLUMB-MIN-49304",
  label: "Minimum plumbing permit fee",
  description:
    "Sec. 49-304 — the minimum permit fee is $22.70, charged as the shortfall against the permit subtotal.",
  feeType: "permit_minimum",
  config: { basis: "permit_fee", floorCents: 2_270 },
  priority: 900,
  sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
});

/** Table 49-304(a) — "Each fixture, roughed-in opening or roof drain .....$ 7.95". */
export const OMAHA_PLUMBING_FIXTURE: FeeRuleRecord = omahaRule({
  id: "omaha-49304-fixture",
  code: "PLUMB-FIXTURE",
  label: "Plumbing permit — fixture, roughed-in opening or roof drain",
  description:
    "Sec. 49-304(a) — $7.95 for each fixture, roughed-in opening or roof drain.",
  feeType: "per_unit",
  config: { unit: "fixtures", centsPerUnit: 795 },
  sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
});

/** Table 49-304(i) — "Each residential water heater .....7.95". */
export const OMAHA_PLUMBING_WATER_HEATER_RESIDENTIAL: FeeRuleRecord = omahaRule({
  id: "omaha-49304-water-heater-res",
  code: "PLUMB-WH-RES",
  label: "Plumbing permit — residential water heater",
  description: "Sec. 49-304(i) — $7.95 for each residential water heater.",
  feeType: "per_unit",
  config: { unit: "heaters", centsPerUnit: 795 },
  sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
});

/**
 * Table 49-304(e)(2) — "Pressure vacuum breakers assembly .....11.35".
 *
 * The section prices three backflow devices separately: an atmospheric vacuum
 * breaker at $7.95, a pressure vacuum breaker assembly at $11.35, and a reduced
 * pressure principle or double check valve assembly at $28.85. Only the middle row is
 * modelled, because all three read one count and modelling them as three rules would
 * charge one device three times.
 */
export const OMAHA_PLUMBING_BACKFLOW_PVB: FeeRuleRecord = omahaRule({
  id: "omaha-49304-backflow-pvb",
  code: "PLUMB-BACKFLOW-PVB",
  label: "Plumbing permit — pressure vacuum breaker assembly",
  description:
    "Sec. 49-304(e)(2) — $11.35 for each pressure vacuum breaker assembly. The section's atmospheric vacuum breaker ($7.95) and reduced pressure principle / double check valve assembly ($28.85) rows are stated on the page and not modelled.",
  feeType: "per_unit",
  config: { unit: "backflow_devices", centsPerUnit: 1_135 },
  sourceId: OMAHA_PLUMBING_CODE_SOURCE_KEY,
});
