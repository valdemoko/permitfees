import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Newark, New Jersey fee rules — REAL DATA.
 *
 * Sources (research/new-jersey/newark.md records how each was read):
 *
 *  S1  Newark Municipal Code, Chapter 7:2 "Permits and Fees" — §7A:2-1 (payment and plan
 *      review), §7A:2-2 (how the volume of a structure is computed), §7A:2-3 (the schedule:
 *      building subcode, building renovation and alteration, certificates and other permits,
 *      electrical subcode, fire protection subcode, plumbing subcode, elevators). Section
 *      7A:2-3 is annotated `amended 3-20-2024 by Ord. No. 6PSF-A`, which is the instrument
 *      that set every amount modelled here.
 *      https://ecode360.com/36645711
 *  S2  N.J.A.C. 5:23-4, Subchapter 4 of the Uniform Construction Code — §5:23-4.18 "Standards
 *      for municipal fees" (the fee must be computed on the volume of the building or, for
 *      alterations, the estimated construction cost, and the unit rates are the
 *      municipality's) and §5:23-4.19 "New Jersey State permit surcharge fees" ($0.00371 per
 *      cubic foot of new construction and additions, $1.90 per $1,000 of value for all other
 *      construction, minimum $1.00). Read from the Department of Community Affairs' own
 *      consolidated text of the subchapter, which carries the amendments published through
 *      New Jersey Register Volume 58 No. 16 (August 17, 2026).
 *      https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_4.pdf
 *
 * **The mechanism, in three sentences.** New Jersey does not leave a construction permit's fee
 * to the municipality's judgement: N.J.A.C. 5:23-4.18 fixes the *shape* — volume for new
 * construction, estimated construction cost for alterations, and a unit rate per fixture or
 * device — and each municipality sets the unit rates in its own ordinance. Newark's are in
 * Chapter 7:2: **$0.02 a cubic foot for use groups A, F, I and S and $0.03 for B, E, H, M, R
 * and U**; renovations and alterations at a graduating **$28 / $21 / $17 per $1,000** of
 * estimated construction cost; electrical receptacles in blocks of fifty then twenty; **$14 a
 * plumbing fixture** and **$75 a special device**. Every permit also carries a
 * **non-refundable $58 processing fee** which is "applied against the total permit fee" and
 * is separately published as the **Minimum Building Permit: $58**.
 *
 * **Three readings this module depends on, all of them stated on the pages.**
 *
 *  1. **The alteration bands are graduating, not a flat rate for the band.** Newark prints
 *     them as a table — "Between $0 - $50,000 | $28; $50,001 - $100,000 | 21; Over $100,000 |
 *     17" — and the State model behind it is unambiguous in the municipalities that spell it
 *     out: Northfield's §128-3B(1)(b) reads "For the first $50,000 of estimated cost of work,
 *     the fee shall be $34 per $1,000 ... From $50,001 to and including $100,000, an
 *     **additional** fee in the amount of $26 per $1,000 ... From $100,001 estimated cost, an
 *     **additional** fee of $22 per each $1,000 of estimated cost or fraction thereof of the
 *     work greater than $100,001". So the first $50,000 is charged at the first rate whatever
 *     the job costs, which is what `tiered_marginal` computes and what a flat "the top band's
 *     rate times the whole cost" reading would get wrong by hundreds of dollars.
 *  2. **Plan review is a prepayment, not a charge.** §7A:2-1: "20% of the construction fee
 *     shall be the plan review fee paid at the time of submission of an application for a
 *     permit, the amount of this fee shall then be deducted from the amount of the fee due for
 *     a construction permit when same is issued." N.J.A.C. 5:23-4.18(a)1 says the same thing
 *     in the same words. Adding a 20% row to the permit fee would therefore charge it twice,
 *     so this payload has no plan-review rule at all — the page names it and says why.
 *  3. **The State surcharge is charged at the State's amount, not at the City's older
 *     restatement of it.** Newark prints "State Surcharge $0.016 per cubic feet" in the
 *     new-construction block and "an administrative surcharge for the State of New Jersey,
 *     Department of Community Affairs (DCA) of 0.80 per $1,000 ... added to the building
 *     permit fee **as required by U.C.C. 5:23-4.19(B)**". The regulation it cites sets the
 *     amount itself — $0.00371 per cubic foot and $1.90 per $1,000, minimum $1.00 — and the
 *     City's printed figures are older versions of the two state numbers (its own history of
 *     §5:23-4.19(b) runs $0.0016 → $0.00265 → $0.00334 → $0.00371 a cubic foot and $0.96 →
 *     $1.35 → $1.70 → $1.90 per $1,000). The City collects the fee and forwards it; it does
 *     not set it. Both figures are printed on the page so a filer can see the disagreement.
 *
 * **What is deliberately NOT here:**
 *
 *  - **Every certificate and "other permit" in §7A:2-3** — certificates of occupancy by unit
 *    count and by area, certificates of continued occupancy and of change of use ($138 each),
 *    demolition ($144 under 30 feet and under 5,000 square feet, $403 otherwise), asbestos
 *    abatement ($81 plus a $32 certificate of clearance and the DCA training fee at 80 per
 *    $1,000), lead abatement ($161 plus $32), signs ($1 a square foot one side only, $690
 *    maximum), and the R-3/R-4/R-5 siding and roofing permit at $58. All published, all
 *    transcribed in the research record, none of them a construction permit fee.
 *  - **The fire protection subcode**, which this release transcribes and does not attach to a
 *    page: sprinkler heads in six bands ($75 / $138 / $252 / $683 / $945 / $1,208), smoke and
 *    heat detectors in four ($40 / $55 / $70 / $85), pre-engineered suppression systems at
 *    $106, standpipes at $263, kitchen hood exhaust and gas or oil fired appliances at $58,
 *    incinerators and crematoriums at $420. Newark's three pages are building, electrical and
 *    plumbing; a sprinkler-head table needs a per-unit kind this dataset does not have yet.
 *  - **Motors, electrical devices, transformers and generators** (the $58 / $115 / $575 / $863
 *    ladders), which are priced by horsepower and kilowatts — ratings no input on this site
 *    collects. The amounts are named on the electrical page.
 *  - **The annual construction permit** ($173 plus a $161 State training registration fee),
 *    the restricted-permit registration ($50), the annual electrical repair permit ($150 plus
 *    $140), and the **elevator subcode**, which is priced by N.J.A.C. 5:23-12.5 and 5:23-12.6
 *    with a 40% administrative fee added on top of the third-party vendor's charges.
 *  - **The 20% reduction when plan review is waived** and the **fee waivers** for City-occupied
 *    properties and for non-profit developers of low and moderate income housing.
 *
 * **This module is the single definition of Newark's fee rules.** The seed writes exactly these
 * records and the tests assert against exactly these records.
 */

/** §7A:2-3 was amended 3-20-2024 by Ord. No. 6PSF-A. Every modelled row is in it. */
export const NEWARK_FEE_EFFECTIVE_FROM = "2024-03-20";

export const NEWARK_CODE_SOURCE_KEY = "newark-code-chapter-7-2-permits-and-fees";
export const NEWARK_STATE_UCC_SOURCE_KEY = "nj-ucc-njac-5-23-4";

/** "There shall be a non-refundable processing fee of $58 applied to all permits." */
export const NEWARK_PERMIT_REVIEW_FEE_CENTS = 5_800;
/** "Minimum Building Permit: $58." Also printed as the electrical, fire and plumbing minimum. */
export const NEWARK_MINIMUM_PERMIT_FEE_CENTS = 5_800;

/** Use groups Newark charges at $0.02 a cubic foot. */
export const NEWARK_TWO_CENT_USE_GROUPS = ["A", "F", "I", "S"] as const;
/** ... and the ones it charges at $0.03. */
export const NEWARK_THREE_CENT_USE_GROUPS = ["B", "E", "H", "M", "R", "U"] as const;

/**
 * The State permit surcharge, N.J.A.C. 5:23-4.19(b): "$0.00371 per cubic foot volume of new
 * buildings and additions ... The fee for all other construction shall be $1.90 per $1,000 of
 * value of construction", minimum $1.00.
 *
 * $0.00371 a cubic foot is 0.371 cents, which is not a whole number of cents — the same
 * problem Clark County's $4.725 per $1,000 created, solved the same way: an exact fraction of
 * a cent, so a 30,000 cubic foot building is $111.30 rather than $111.00.
 */
export const NEWARK_STATE_SURCHARGE_PER_CUBIC_FOOT = { numerator: 371, denominator: 1_000 };
export const NEWARK_STATE_SURCHARGE_CENTS_PER_THOUSAND = 190;
export const NEWARK_STATE_SURCHARGE_MINIMUM_CENTS = 100;

const CODE = NEWARK_CODE_SOURCE_KEY;
const STATE = NEWARK_STATE_UCC_SOURCE_KEY;

function newarkRule(
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
    effectiveFrom: NEWARK_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: CODE,
    ...overrides,
  };
}

/**
 * The $58 that attaches to every permit, as a floor rather than as a charge of its own.
 *
 * §7A:2-3 says two things about the same number: "There shall be a non-refundable processing
 * fee of $58 applied to all permits, due at the time of application. This procurement fee will
 * be applied against the total permit fee", and then "Minimum Building Permit: $58" — with the
 * same $58 printed again as the minimum fee of the electrical, fire protection and plumbing
 * subcodes. Applied against the total means credited: a permit whose rows come to $900 is
 * $900, not $958. A floor measured against the calculated fee reproduces both sentences at
 * once, which is what `permit_minimum` is for — it charges the shortfall and nothing else.
 */
function minimumPermit(permitType: string): FeeRuleRecord {
  return newarkRule({
    id: `newark-${permitType}-minimum`,
    code: `${permitType.toUpperCase()}-MINIMUM-PERMIT`,
    label: "Minimum permit fee, $58.00",
    description:
      '§7A:2-3: "There shall be a non-refundable processing fee of $58 applied to all permits, due at the time of application. This procurement fee will be applied against the total permit fee", and separately "Minimum Building Permit: $58". The same $58 is printed as the published minimum of the electrical ("Minimum fee: $58"), fire protection ("Minimum fee: $58") and plumbing ("Minimum fee: $58") subcodes. Charged as the shortfall when the permit\'s own rows come to less, and credited — not added — when they come to more, which is what "applied against the total permit fee" says.',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: NEWARK_MINIMUM_PERMIT_FEE_CENTS },
    conditions: { field: "permit_fee", op: "lt", value: NEWARK_MINIMUM_PERMIT_FEE_CENTS },
    priority: 150,
  });
}

/* -------------------------------------------------------------------------- */
/* Building permits — §7A:2-3, building subcode                               */
/* -------------------------------------------------------------------------- */

/**
 * New construction and additions, by use group: two rates, and which one applies is the only
 * question the row asks. It is worth $0.01 a cubic foot — on a 200,000 cubic foot warehouse
 * that is $2,000.00 — and it turns on the occupancy class of the building rather than on
 * anything about the work.
 */
export const NEWARK_BUILDING_NEW_TWO_CENTS: FeeRuleRecord = newarkRule({
  id: "newark-bld-new-two-cents",
  code: "BLD-NEW-PER-CF-2",
  label: "Building permit — new construction and additions, $0.02 per cubic foot",
  description:
    "§7A:2-3, \"Construction Permit (Building) — New Construction and Addition Fees\": $0.02 per cubic foot for use groups A (Assembly), F (Factory and Industrial), I (Institutional) and S (Storage). The volume is computed under §7A:2-2, which counts enclosed dormers, porches and penthouses and, for a building without a cellar, measures down to 2 1/2 feet below the first floor.",
  feeType: "percent",
  config: {
    basis: "cubic_footage",
    rate: { numerator: 2, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  // Two facts decide which of the three building rules is the permit's: the use group, which
  // picks the rate, and whether the job is an alteration, which takes the volumetric rows out
  // of the calculation entirely. A permit that names both is answered by its own instruction
  // rather than by the sum of the two readings, because the chapter prices new work and
  // alteration work on two different measurements.
  conditions: {
    all: [
      { field: "custom.use_group", op: "in", value: [...NEWARK_TWO_CENT_USE_GROUPS] },
      { not: { field: "custom.building_alteration", op: "eq", value: true } },
    ],
  },
});

export const NEWARK_BUILDING_NEW_THREE_CENTS: FeeRuleRecord = newarkRule({
  id: "newark-bld-new-three-cents",
  code: "BLD-NEW-PER-CF-3",
  label: "Building permit — new construction and additions, $0.03 per cubic foot",
  description:
    "§7A:2-3: $0.03 per cubic foot for use groups B (Business), E (Educational), H (High Hazard), M (Mercantile), R (Residential) and U (Utility and Miscellaneous). An addition is priced the same way as new construction, on the volume of the added portion — which is also what N.J.A.C. 5:23-4.18(c)1iii requires.",
  feeType: "percent",
  config: {
    basis: "cubic_footage",
    rate: { numerator: 3, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [
      { field: "custom.use_group", op: "in", value: [...NEWARK_THREE_CENT_USE_GROUPS] },
      { not: { field: "custom.building_alteration", op: "eq", value: true } },
    ],
  },
});

/**
 * Renovations and alterations, from the estimated cost of construction — a graduating table
 * rather than one rate.
 *
 * $28 per $1,000 on the first $50,000, $21 on the next $50,000, $17 on everything above
 * $100,000. The reading is the State's own, spelled out in the municipalities whose ordinances
 * print the bands as sentences (Northfield: "an additional fee ... From $100,001 estimated
 * cost, an additional fee of $22 per each $1,000 ... of the work greater than $100,001"), and
 * it is the reading that makes the table's own first band meaningful: a $400,000 renovation
 * pays $28 per $1,000 on its first $50,000.
 *
 * All three rates are whole basis points (2.8%, 2.1%, 1.7%), so nothing is rounded before it
 * is multiplied.
 */
export const NEWARK_BUILDING_ALTERATION: FeeRuleRecord = newarkRule({
  id: "newark-bld-alteration",
  code: "BLD-ALTERATION",
  label: "Building permit — renovation and alteration, by estimated cost",
  description:
    "§7A:2-3, \"Building Renovation and Alteration\": $28 per $1,000 of estimated construction cost between $0 and $50,000, $21 per $1,000 from $50,001 to $100,000, and $17 per $1,000 above $100,000. Graduating bands: the first $50,000 is charged at the first rate however large the job is, which is the reading the other New Jersey ordinances that print the same table as sentences make explicit. The estimated cost is the City's own figure — the applicant submits cost data from the architect or engineer of record, a recognised estimating firm or the contractor, and \"the Construction Official shall make the final determination regarding estimated cost of construction\".",
  feeType: "tiered_marginal",
  config: {
    basis: "valuation",
    baseCents: 0,
    tiers: [
      { upToCents: 5_000_000, rateBps: 280 },
      { upToCents: 10_000_000, rateBps: 210 },
      { upToCents: null, rateBps: 170 },
    ],
  },
  conditions: { field: "custom.building_alteration", op: "eq", value: true },
});

/**
 * The State's permit surcharge on new construction and additions, charged per cubic foot.
 *
 * Charged as a component of type `state_surcharge` rather than as part of the permit fee
 * because that is what it is: N.J.A.C. 5:23-4.19(a) requires the enforcing agency to collect it
 * "to provide for the training and certification and technical support programs required by the
 * Act" and to forward it to the Division of Codes and Standards. It gets its own line in the
 * breakdown so a filer can see the part of the bill the City keeps none of.
 */
export const NEWARK_STATE_SURCHARGE_NEW: FeeRuleRecord = newarkRule({
  id: "newark-bld-state-surcharge-new",
  code: "BLD-STATE-SURCHARGE-NEW",
  label: "New Jersey State permit surcharge, $0.00371 per cubic foot",
  description:
    "N.J.A.C. 5:23-4.19(b): \"This fee shall be in the amount of $0.00371 per cubic foot volume of new buildings and additions\", with a minimum of $1.00. Not collected on demolition, asbestos or lead abatement permits, low and moderate income housing, work consequential to a natural disaster, or pre-engineered commercial farm buildings. Newark's own §7A:2-3 prints the line as \"State Surcharge $0.016 per cubic feet\" — an older state figure, which the page names alongside the amount charged here.",
  componentType: "state_surcharge",
  feeType: "percent",
  config: {
    basis: "cubic_footage",
    rate: NEWARK_STATE_SURCHARGE_PER_CUBIC_FOOT,
    rateUnit: "currency_per_unit",
  },
  minimumCents: NEWARK_STATE_SURCHARGE_MINIMUM_CENTS,
  // One surcharge per permit, not two: the volumetric surcharge and the construction-cost
  // surcharge are the same State fee on the two ways a building permit can be priced, and a
  // permit that names both a use group and an alteration is an alteration.
  conditions: {
    all: [
      { field: "custom.use_group", op: "exists" },
      { not: { field: "custom.building_alteration", op: "eq", value: true } },
    ],
  },
  sourceId: STATE,
  priority: 900,
});

/**
 * The same surcharge on construction that is not new — $1.90 per $1,000 of the value of the
 * work, which is the alteration path. Newark prints it as "0.80 per $1,000 ... as required by
 * U.C.C. 5:23-4.19(B)", and §5:23-4.19(b) is where the amount actually comes from.
 */
export const NEWARK_STATE_SURCHARGE_ALTERATION: FeeRuleRecord = newarkRule({
  id: "newark-bld-state-surcharge-alteration",
  code: "BLD-STATE-SURCHARGE-ALTERATION",
  label: "New Jersey State permit surcharge, $1.90 per $1,000",
  description:
    "N.J.A.C. 5:23-4.19(b): \"The fee for all other construction shall be $1.90 per $1,000 of value of construction\", with a minimum of $1.00. Newark's §7A:2-3 prints it as \"An administrative surcharge for the State of New Jersey, Department of Community Affairs (DCA) of 0.80 per $1,000 rounded to the nearest $1 will be added to the building permit fee as required by U.C.C. 5:23-4.19 (B)\" — the same fee at an older rate, named on the page beside the amount charged.",
  componentType: "state_surcharge",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: NEWARK_STATE_SURCHARGE_CENTS_PER_THOUSAND },
  minimumCents: NEWARK_STATE_SURCHARGE_MINIMUM_CENTS,
  conditions: { field: "custom.building_alteration", op: "eq", value: true },
  sourceId: STATE,
  priority: 900,
});

export const NEWARK_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  NEWARK_BUILDING_NEW_TWO_CENTS,
  NEWARK_BUILDING_NEW_THREE_CENTS,
  NEWARK_BUILDING_ALTERATION,
  NEWARK_STATE_SURCHARGE_NEW,
  NEWARK_STATE_SURCHARGE_ALTERATION,
  minimumPermit("building"),
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — §7A:2-3(2)                                           */
/* -------------------------------------------------------------------------- */

/**
 * "Receptacles and Fixtures: First 50 — $58; Each additional 20 — $12."
 *
 * A block row, and the block is the fee: the fifty-first receptacle buys twenty more at $12.00
 * whether the permit has fifty-one or seventy. That is `incrementUnits`, and the rate stored
 * is 60 cents a device because $12.00 spread over a block of twenty is exactly 60 cents —
 * storing the block price per unit and letting the rounding do the work is what keeps the
 * arithmetic exact.
 */
export const NEWARK_ELECTRICAL_RECEPTACLES: FeeRuleRecord = newarkRule({
  id: "newark-elec-receptacles",
  code: "ELEC-RECEPTACLES",
  label: "Electrical permit — receptacles and fixtures, in blocks of twenty",
  description:
    '§7A:2-3(2), electrical subcode fee schedule: "Receptacles and Fixtures: First 50 — $58; Each additional 20 — $12." The row is charged in blocks, so the fifty-first receptacle costs a whole $12.00 rather than sixty cents.',
  feeType: "per_unit",
  config: {
    unit: "outlets",
    baseCents: 5_800,
    thresholdUnits: 50,
    centsPerUnit: 60,
    incrementUnits: 20,
  },
});

/**
 * "Service Panels, Entrances and Subpanels: Up to 200 amps — $81; Up to 1,000 amps — $460;
 * Larger than above — $1,150."
 *
 * Priced per device at the band of the amperage entered, which is the State's model for
 * electrical work: N.J.A.C. 5:23-4.18(c)3 says the fee "shall be a unit rate per fixture or per
 * kilowatt, horsepower or ampere rating of the device or equipment". The three bands are
 * mutually exclusive by construction, so exactly one of them can be charged.
 */
export const NEWARK_ELECTRICAL_PANELS: FeeRuleRecord[] = [
  newarkRule({
    id: "newark-elec-panels-200",
    code: "ELEC-PANELS-TO-200A",
    label: "Electrical permit — service, panel or subpanel up to 200 amps",
    description:
      '§7A:2-3(2): "Service Panels, Entrances and Subpanels: Up to 200 amps — $81." Charged for each service, panel board, entrance or subpanel on the permit, at the amperage entered for the service.',
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 8_100 },
    conditions: {
      all: [
        { field: "custom.amperage", op: "exists" },
        { field: "custom.amperage", op: "lte", value: 200 },
      ],
    },
  }),
  newarkRule({
    id: "newark-elec-panels-1000",
    code: "ELEC-PANELS-TO-1000A",
    label: "Electrical permit — service, panel or subpanel over 200 up to 1,000 amps",
    description:
      '§7A:2-3(2): "Up to 1,000 amps — $460", charged for each device on the permit above 200 amperes and up to 1,000.',
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 46_000 },
    conditions: {
      all: [
        { field: "custom.amperage", op: "gt", value: 200 },
        { field: "custom.amperage", op: "lte", value: 1_000 },
      ],
    },
  }),
  newarkRule({
    id: "newark-elec-panels-over-1000",
    code: "ELEC-PANELS-OVER-1000A",
    label: "Electrical permit — service, panel or subpanel over 1,000 amps",
    description:
      '§7A:2-3(2): "Larger than above — $1,150", charged for each device on the permit rated over 1,000 amperes.',
    feeType: "per_unit",
    config: { unit: "panels", centsPerUnit: 115_000 },
    conditions: { field: "custom.amperage", op: "gt", value: 1_000 },
  }),
];

/**
 * The State surcharge on electrical work, which is "all other construction" under
 * N.J.A.C. 5:23-4.19(b) and therefore $1.90 per $1,000 of the value of the work. Newark's
 * electrical subcode prints the same line as "D.C.A. fee: 1 per $1,000".
 */
export const NEWARK_ELECTRICAL_STATE_SURCHARGE: FeeRuleRecord = newarkRule({
  id: "newark-elec-state-surcharge",
  code: "ELEC-STATE-SURCHARGE",
  label: "New Jersey State permit surcharge, $1.90 per $1,000",
  description:
    "N.J.A.C. 5:23-4.19(b): $1.90 per $1,000 of the value of construction, minimum $1.00, for construction that is not a new building or an addition. Newark's electrical subcode prints the row as \"D.C.A. fee: 1 per $1,000\", an older rate of the same state fee.",
  componentType: "state_surcharge",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: NEWARK_STATE_SURCHARGE_CENTS_PER_THOUSAND },
  minimumCents: NEWARK_STATE_SURCHARGE_MINIMUM_CENTS,
  conditions: { field: "valuation", op: "gt", value: 0 },
  sourceId: STATE,
  priority: 900,
});

export const NEWARK_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  NEWARK_ELECTRICAL_RECEPTACLES,
  ...NEWARK_ELECTRICAL_PANELS,
  NEWARK_ELECTRICAL_STATE_SURCHARGE,
  minimumPermit("electrical"),
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — §7A:2-3(4)(h)                                          */
/* -------------------------------------------------------------------------- */

/**
 * "The fee shall be in the amount of $14 per fixture, piece of equipment or appliance connected
 * to the plumbing system, and for each appliance connected to the gas piping or oil piping
 * system."
 *
 * One rate for everything on the plumbing side, which is unusual in this dataset — most
 * schedules price a water heater differently from a lavatory — and it is what the City
 * publishes.
 */
export const NEWARK_PLUMBING_FIXTURES: FeeRuleRecord = newarkRule({
  id: "newark-plumb-fixtures",
  code: "PLUMB-FIXTURES",
  label: "Plumbing permit — fixtures, equipment and gas appliances, $14.00 each",
  description:
    "§7A:2-3(4)(h): \"The fee shall be in the amount of $14 per fixture, piece of equipment or appliance connected to the plumbing system, and for each appliance connected to the gas piping or oil piping system.\" A water heater, a gas range and a lavatory are all $14.00 on this row; the special devices in the next row are the ones the subcode separates out.",
  feeType: "per_unit",
  config: { unit: "fixtures", centsPerUnit: 1_400 },
});

/**
 * "The fee shall be $75 per special device for the following: Grease traps, oil separators,
 * refrigeration units, utility service connections, backflow preventers equipped with test
 * ports (double check valve assembly, reduced pressure zone and pressure vacuum breaker
 * backflow preventers), steam boilers, hot water boilers (excluding those for domestic water
 * heating), active solar systems, sewer pumps, and interceptors."
 *
 * One published list, one published price, and the schedule's own name for it — "special
 * device" — which is why the per-unit kind carries that name rather than a dozen kinds of its
 * own.
 */
export const NEWARK_PLUMBING_SPECIAL_DEVICES: FeeRuleRecord = newarkRule({
  id: "newark-plumb-special-devices",
  code: "PLUMB-SPECIAL-DEVICES",
  label: "Plumbing permit — special devices, $75.00 each",
  description:
    "§7A:2-3(4)(h): \"The fee shall be $75 per special device for the following: Grease traps, oil separators, refrigeration units, utility service connections, backflow preventers equipped with test ports (double check valve assembly, reduced pressure zone and pressure vacuum breaker backflow preventers), steam boilers, hot water boilers (excluding those for domestic water heating), active solar systems, sewer pumps, and interceptors.\" The $75 is charged instead of the $14 fixture rate for a device on this list.",
  feeType: "per_unit",
  config: { unit: "special_devices", centsPerUnit: 7_500 },
});

/** The State surcharge on plumbing work: $1.90 per $1,000 of value, as on every trade. */
export const NEWARK_PLUMBING_STATE_SURCHARGE: FeeRuleRecord = newarkRule({
  id: "newark-plumb-state-surcharge",
  code: "PLUMB-STATE-SURCHARGE",
  label: "New Jersey State permit surcharge, $1.90 per $1,000",
  description:
    "N.J.A.C. 5:23-4.19(b): $1.90 per $1,000 of the value of construction, minimum $1.00. Newark's plumbing subcode prints the row as \"D.C.A. fee: $1 per $1,000\", an older rate of the same state fee.",
  componentType: "state_surcharge",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: NEWARK_STATE_SURCHARGE_CENTS_PER_THOUSAND },
  minimumCents: NEWARK_STATE_SURCHARGE_MINIMUM_CENTS,
  conditions: { field: "valuation", op: "gt", value: 0 },
  sourceId: STATE,
  priority: 900,
});

export const NEWARK_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  NEWARK_PLUMBING_FIXTURES,
  NEWARK_PLUMBING_SPECIAL_DEVICES,
  NEWARK_PLUMBING_STATE_SURCHARGE,
  minimumPermit("plumbing"),
];
