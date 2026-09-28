import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Manchester, New Hampshire fee rules — REAL DATA.
 *
 * Sources (research/new-hampshire/manchester.md records how each was read):
 *
 *  S1  Building Code of the City of Manchester, adopted July 6, 2021 — Section 109
 *      "Fees", including the Fee Schedule at IBC Sec. 109.8 (building permits, plan
 *      review, demolition, signs, storage tanks, heating equipment, gas piping,
 *      electrical wiring, plumbing, elevators), Sec. 109.5 (reinspection, penalty for
 *      work without a permit, appeal fee) and Sec. 109.6 (refunds). This is the
 *      operative ordinance and the source of every modelled amount.
 *      https://www.manchesternh.gov/pcd/Regulations/BuildingCode.pdf
 *  S2  Building Fees, the department's own page — read as corroboration of S1's
 *      building rows, which it restates in the same shape (estimated cost × .006 for a
 *      new one- or two-family dwelling, × .01 for everything else).
 *      https://www.manchesternh.gov/Departments/Planning-and-Comm-Dev/Building/Fees
 *  S3  Application for Electrical Permit (form effective 09/02/14), whose own arithmetic
 *      column corroborates S1 item 11 and whose printed footer states the $30 minimum
 *      plus $25 application fee as $55.00.
 *      https://www.manchesternh.gov/pcd/Forms/ElectricalPermit.pdf
 *  S4  Application for Plumbing Permit (form effective 09/02/14) — "ESTIMATED COST OF JOB
 *      × .015", corroborating S1 item 9(B).
 *      https://www.manchesternh.gov/pcd/Forms/PlumbingPermit.pdf
 *  S5  Application for Heating Permit (form effective 09/02/14), whose rows agree item for
 *      item with S1 item 8, including the two that read oddly until the code is open
 *      beside the form: $30.00 for a gas or oil burner replacement on its own and $15.00
 *      for ventilation ductwork up to 400 CFM.
 *      https://www.manchesternh.gov/pcd/Forms/HeatingPermit.pdf
 *
 * **The mechanism, in three sentences.** Manchester prices a permit two ways and both are
 * in the same schedule: the building, electrical and plumbing trades are a *rate on the
 * certified estimated cost of the work* (.006 for a new one- or two-family dwelling, .010
 * for other building work, .010 for residential electrical work, .015 for commercial
 * electrical and for all other plumbing), while individual pieces of equipment, gas
 * piping, low-voltage wiring and demolition are fixed amounts with their own published
 * bands. Every permit also carries a **$25.00 non-refundable application fee**, and every
 * permit requiring inspections is subject to a **$30.00 minimum permit fee**. Since 2021
 * the Building Code is the State Building Code (RSA 155-A) with local amendments, and
 * Sec. 151.10.4 says plainly that "fees for any and all permits issued under the Building
 * Code are defined in the Fee Table inserted as an amendment to the International Building
 * Code at Section 109.8" — which is why the fees live in a code PDF rather than in a
 * separate schedule document.
 *
 * **One thing the schedule is careful about, and this module follows it.** The application
 * fee is *not* inside the minimum. Manchester's own forms print the line as
 * "$30 MINIMUM FEE + $25 APPLICATION FEE: $55.00", so the floor is measured against the
 * calculated fee alone and the application fee is added after it. That is why the
 * application fee is a component of type `other` rather than `base`: the engine reads a
 * `permit_minimum` against the base subtotal, so a $2 of calculated plumbing fee reaches
 * $30 + $25 = $55.00 exactly as the City's plumbing form says.
 *
 * **What is deliberately NOT here:**
 *
 *  - **Everything in Section 109.8 that this site has no basis for.** Sign fees (item 5:
 *    $50.00 up to 50 sq ft plus $1.50 per square foot over), foundation permits issued in
 *    advance (item 3: $75.00 / $300.00), yard sales ($5.00), storage tanks (item 7), the
 *    whole elevator, escalator, dumbwaiter and amusement-device table (item 12), the
 *    $300.00 appeal fee, the $35.00 retention on a refund under Sec. 109.6, the 100%
 *    surcharge for work started without a permit, and the affordability deferral in
 *    Sec. 109.9.
 *  - **The electrical form's sign row ($10.00 each),** which is not in the 2021 code. The
 *    code prices signs on the building side instead, and that is where the site names it.
 *  - **The water-tank rows on the 2014 heating form** ($10.00 / $30.00 / $60.00 / $100.00 by
 *    gallonage). They are in the form and not in the current code, and the form is
 *    corroboration here rather than authority.
 *  - **Heating, ventilation and gas piping fees**, which are published and transcribed in
 *    the research file but are not attached to a page: Manchester's third page is plumbing,
 *    and the schedule's heating rows are neither a plumbing fee nor a general mechanical
 *    one. What is charged is documented rather than guessed at.
 *
 * **This module is the single definition of Manchester's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records.
 */

/** The Building Code of the City of Manchester was adopted July 6, 2021. */
export const MANCHESTER_FEE_EFFECTIVE_FROM = "2021-07-06";

/** The trade forms in S3–S5 print "Effective: 09/02/14". */
export const MANCHESTER_FORM_EFFECTIVE_FROM = "2014-09-02";

export const MANCHESTER_BUILDING_CODE_SOURCE_KEY = "manchester-building-code-1098";
export const MANCHESTER_FEES_PAGE_SOURCE_KEY = "manchester-building-fees-page";
export const MANCHESTER_PERMIT_APPS_SOURCE_KEY = "manchester-permit-applications";
export const MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY = "manchester-electrical-permit-form";
export const MANCHESTER_PLUMBING_FORM_SOURCE_KEY = "manchester-plumbing-permit-form";
export const MANCHESTER_HEATING_FORM_SOURCE_KEY = "manchester-heating-permit-form";

/** "There shall be a $25.00 non-refundable application fee for all permits." */
export const MANCHESTER_APPLICATION_FEE_CENTS = 2_500;
/** "... and a minimum permit fee of $30.00 for all permits requiring inspections." */
export const MANCHESTER_MINIMUM_PERMIT_FEE_CENTS = 3_000;
/** Sec. 109.5(A): "The fee shall be a minimum of $30.00." */
export const MANCHESTER_REINSPECTION_FEE_CENTS = 3_000;

export const MANCHESTER_ELECTRICAL_NEW_UNIT_CENTS = 10_000;
export const MANCHESTER_ELECTRICAL_ADDITIONAL_UNIT_CENTS = 7_500;
export const MANCHESTER_PLUMBING_NEW_UNIT_CENTS = 15_000;
export const MANCHESTER_PLUMBING_ADDITIONAL_UNIT_CENTS = 10_000;

const CODE = MANCHESTER_BUILDING_CODE_SOURCE_KEY;

function manchesterRule(
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
    effectiveFrom: MANCHESTER_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: CODE,
    ...overrides,
  };
}

/**
 * The $25.00 application fee, as a component of type `other` rather than `base`.
 *
 * This is the one structural decision in the module. The engine reads `permit_minimum`
 * against the base subtotal, and Manchester's forms print the floor and the application fee
 * as two separate numbers that add ("$30 MINIMUM FEE + $25 APPLICATION FEE: $55.00").
 * Making the application fee a base component would have folded it into the subtotal the
 * floor is measured against, so a $5 permit fee would have reached $25 + $5 and stopped —
 * never $55.00, which is the figure the City prints twice.
 */
function applicationFee(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "sourceId"> & Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return manchesterRule({
    description:
      'Sec. 109.8: "There shall be a $25.00 non-refundable application fee for all permits except yard sale permits". Charged on every permit, and charged in addition to the $30.00 minimum permit fee.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: MANCHESTER_APPLICATION_FEE_CENTS },
    priority: 50,
    ...overrides,
  });
}

/** Sec. 109.8: "a minimum permit fee of $30.00 for all permits requiring inspections". */
function minimumPermit(permitType: string): FeeRuleRecord {
  return manchesterRule({
    id: `manchester-${permitType}-minimum`,
    code: `${permitType.toUpperCase()}-MINIMUM-PERMIT`,
    label: "Minimum permit fee, $30.00",
    description:
      "Sec. 109.8: \"a minimum permit fee of $30.00 for all permits requiring inspections\". Measured against what the permit has already calculated, and charged as the shortfall — a permit whose own rows already exceed $30.00 pays nothing here. The $25.00 application fee is not counted toward it, because the City's forms add the two figures instead of netting them.",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: MANCHESTER_MINIMUM_PERMIT_FEE_CENTS },
    conditions: { field: "permit_fee", op: "lt", value: MANCHESTER_MINIMUM_PERMIT_FEE_CENTS },
    priority: 150,
  });
}

/** Sec. 109.5(A): a re-inspection fee, minimum $30.00. */
function reinspection(permitType: string): FeeRuleRecord {
  return manchesterRule({
    id: `manchester-${permitType}-reinspection`,
    code: `${permitType.toUpperCase()}-REINSPECTION`,
    label: "Re-inspection fee, $30.00 minimum",
    description:
      'Sec. 109.5(A): "The building official may charge a re-inspection fee when, in his/her opinion, more inspections than normal were required. The fee shall be a minimum of $30.00." Modelled at the published minimum.',
    componentType: "inspection",
    feeType: "flat",
    config: { amountCents: MANCHESTER_REINSPECTION_FEE_CENTS },
    conditions: { field: "custom.reinspection", op: "eq", value: true },
    priority: 800,
  });
}

/* -------------------------------------------------------------------------- */
/* Building permits — Sec. 109.8, items 1, 2, 4                               */
/* -------------------------------------------------------------------------- */

/**
 * One fact decides which of Manchester's two building rates applies: whether the job is a
 * new one- or two-family dwelling. Every rule below restates it rather than sharing a
 * constant, so that a reader of any single rule can see the whole condition it carries.
 */

/**
 * Item 1(A): "For new 1&2 family dwellings, the permit fee shall be the estimated cost of
 * the work multiplied by .006." One of only two building rates, and the difference between
 * them is $0.40 per $100 of cost.
 */
export const MANCHESTER_BUILDING_NEW_ONE_TWO_FAMILY: FeeRuleRecord = manchesterRule({
  id: "manchester-bld-new-1-2-family",
  code: "BLD-NEW-1-2-FAMILY",
  label: "Building permit — new one- or two-family dwelling",
  description:
    "Sec. 109.8 item 1(A) — the estimated cost of the work multiplied by .006 for new one- and two-family dwellings.",
  feeType: "percent",
  config: { basis: "valuation", rateBps: 60 },
  conditions: { field: "custom.new_one_two_family", op: "eq", value: true },
});

/**
 * Items 1(B) and 1(C) charge the same rate, so they are one rule here rather than two that
 * would be indistinguishable in the breakdown: every other new building or structure, every
 * addition, and every alteration, renovation or repair to an existing building is the
 * estimated cost multiplied by .010.
 */
export const MANCHESTER_BUILDING_OTHER_WORK: FeeRuleRecord = manchesterRule({
  id: "manchester-bld-other-work",
  code: "BLD-OTHER-WORK",
  label: "Building permit — other new work, additions, alterations and repairs",
  description:
    "Sec. 109.8 items 1(B) and 1(C) — for all other new buildings and structures, additions to existing buildings and structures, and alterations, renovations or repairs, the permit fee is the estimated cost of the work multiplied by .010. The City's own fees page restates both as \"estimated cost of the work multiplied by .01\".",
  feeType: "percent",
  config: { basis: "valuation", rateBps: 100 },
  conditions: {
    all: [
      { not: { field: "custom.new_one_two_family", op: "eq", value: true } },
      { not: { field: "custom.demolition", op: "eq", value: true } },
    ],
  },
});

/**
 * Item 2: "For all buildings and structures covered under item 1 above, other than 1 & 2
 * family dwellings and accessory structures, there shall be a plan review fee of $.02 per
 * square foot."
 *
 * The two exclusions are conditions rather than footnotes: a new one- or two-family
 * dwelling pays no plan review, and neither does an accessory structure, which would
 * otherwise be captured by the second building rate.
 */
export const MANCHESTER_PLAN_REVIEW: FeeRuleRecord = manchesterRule({
  id: "manchester-bld-plan-review",
  code: "BLD-PLAN-REVIEW",
  label: "Plan review fee, $0.02 per square foot",
  description:
    "Sec. 109.8 item 2 — $0.02 per square foot for all buildings and structures other than one- and two-family dwellings and accessory structures. A separate fee in the same schedule rather than a step in the permit fee, and it is not counted toward the $30.00 minimum.",
  componentType: "plan_review",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: { numerator: 2, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [
      { not: { field: "custom.new_one_two_family", op: "eq", value: true } },
      { not: { field: "custom.accessory_structure", op: "eq", value: true } },
      // Item 2 applies to "all buildings and structures covered under item 1 above".
      // Demolition is item 4, not item 1, so it is not plan-reviewed — and a demolition
      // permit carries no valuation for a review fee to be measured against.
      { not: { field: "custom.demolition", op: "eq", value: true } },
    ],
  },
  priority: 200,
});

/**
 * Item 4: demolition, in three published bands — up to 1,000 sq ft $20.00, over 1,000 up to
 * 5,000 sq ft $75.00, over 5,000 sq ft $150.00. A band ladder rather than a rate, which is
 * what `tiered_table` is for.
 */
export const MANCHESTER_DEMOLITION: FeeRuleRecord = manchesterRule({
  id: "manchester-bld-demolition",
  code: "BLD-DEMOLITION",
  label: "Demolition permit, by aggregate floor area",
  description:
    "Sec. 109.8 item 4 — interior or exterior demolition or removal of buildings or structures: up to 1,000 square feet $20.00; over 1,000 up to 5,000 square feet $75.00; over 5,000 square feet $150.00.",
  feeType: "tiered_table",
  config: {
    basis: "square_footage",
    tiers: [
      { upToCents: 1_000, amountCents: 2_000 },
      { upToCents: 5_000, amountCents: 7_500 },
      { upToCents: null, amountCents: 15_000 },
    ],
  },
  conditions: { field: "custom.demolition", op: "eq", value: true },
});

/* -------------------------------------------------------------------------- */
/* Electrical permits — Sec. 109.8, item 11                                   */
/* -------------------------------------------------------------------------- */

/**
 * Item 11(A), second half: residential additions, renovations, alterations, repairs or
 * replacements are the calculated cost of the work multiplied by 0.01 — half the rate
 * commercial work pays, and the reason a rewire and a shop fit-out of the same cost are
 * not the same permit fee.
 */
export const MANCHESTER_ELECTRICAL_RESIDENTIAL_ALTERATION: FeeRuleRecord = manchesterRule({
  id: "manchester-elec-res-alteration",
  code: "ELEC-RES-ALTERATION",
  label: "Electrical permit — residential alterations, renovations and repairs",
  description:
    "Sec. 109.8 item 11(A)(2) — for residential additions, renovations, alterations, repairs or replacements, the permit fee is the calculated cost of the work multiplied by 0.01.",
  feeType: "percent",
  config: { basis: "valuation", rateBps: 100 },
  conditions: { field: "custom.residential_alteration", op: "eq", value: true },
});

/** Item 11(B): commercial work is 0.015 of the calculated cost, except low-voltage wiring. */
export const MANCHESTER_ELECTRICAL_COMMERCIAL: FeeRuleRecord = manchesterRule({
  id: "manchester-elec-commercial",
  code: "ELEC-COMMERCIAL",
  label: "Electrical permit — commercial work",
  description:
    "Sec. 109.8 item 11(B) — for all other new commercial buildings, and their additions, renovations, alterations, repairs or replacements, except low voltage and control wiring, the permit fee is the calculated cost of the work multiplied by 0.015.",
  feeType: "percent",
  config: { basis: "valuation", rateBps: 150 },
  conditions: { field: "custom.commercial_work", op: "eq", value: true },
});

/**
 * Item 11(A)(1): a brand-new residential installation is priced by the dwelling unit —
 * $100.00 for the first and $75.00 for each additional one — not by cost. A base with an
 * allowance, which is the same form Phoenix's backflow row needed.
 */
export const MANCHESTER_ELECTRICAL_NEW_RESIDENTIAL: FeeRuleRecord = manchesterRule({
  id: "manchester-elec-new-residential",
  code: "ELEC-NEW-RESIDENTIAL",
  label: "Electrical permit — new residential dwellings, by unit",
  description:
    "Sec. 109.8 item 11(A) — $100.00 for a new residential dwelling of one unit, and $75.00 for each additional unit over one.",
  feeType: "per_unit",
  config: {
    unit: "dwelling_units",
    baseCents: MANCHESTER_ELECTRICAL_NEW_UNIT_CENTS,
    thresholdUnits: 1,
    centsPerUnit: MANCHESTER_ELECTRICAL_ADDITIONAL_UNIT_CENTS,
  },
  conditions: { field: "custom.new_residential_dwelling", op: "eq", value: true },
});

/**
 * Item 11(C): low voltage and control wiring — phone, TV, data, alarm — is priced in three
 * bands rather than by the flat rate, which is what makes a data cabling job cheap: $10.00
 * up to $2,000 of calculated cost, $75.00 from there to $25,000, and 0.005 of the cost
 * above that. The three rules below are one published ladder; they are separate rules only
 * because the top band is a rate and the two below it are amounts.
 */
export const MANCHESTER_ELECTRICAL_LOW_VOLTAGE: FeeRuleRecord[] = [
  manchesterRule({
    id: "manchester-elec-lv-2000",
    code: "ELEC-LV-2000",
    label: "Electrical permit — low-voltage wiring up to $2,000 of cost",
    description:
      "Sec. 109.8 item 11(C)(1) — up to $2,000 of calculated cost for low voltage and control wiring is $10.00.",
    feeType: "flat",
    config: { amountCents: 1_000 },
    conditions: {
      all: [
        { field: "custom.low_voltage", op: "eq", value: true },
        { field: "valuation", op: "lte", value: 200_000 },
      ],
    },
  }),
  manchesterRule({
    id: "manchester-elec-lv-25000",
    code: "ELEC-LV-25000",
    label: "Electrical permit — low-voltage wiring $2,001 to $25,000 of cost",
    description:
      "Sec. 109.8 item 11(C)(2) — over $2,000 to $25,000 of calculated cost for low voltage and control wiring is $75.00.",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        { field: "custom.low_voltage", op: "eq", value: true },
        { field: "valuation", op: "gt", value: 200_000 },
        { field: "valuation", op: "lte", value: 2_500_000 },
      ],
    },
  }),
  manchesterRule({
    id: "manchester-elec-lv-over-25000",
    code: "ELEC-LV-OVER-25000",
    label: "Electrical permit — low-voltage wiring above $25,000 of cost",
    description:
      "Sec. 109.8 item 11(C)(3) — calculated cost above $25,000 shall be multiplied by .005 for low voltage and control wiring.",
    feeType: "percent",
    config: { basis: "valuation", rateBps: 50 },
    conditions: {
      all: [
        { field: "custom.low_voltage", op: "eq", value: true },
        { field: "valuation", op: "gt", value: 2_500_000 },
      ],
    },
  }),
];

export const MANCHESTER_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  applicationFee({
    id: "manchester-elec-application",
    code: "ELEC-APPLICATION-FEE",
    label: "Electrical permit application fee, $25.00",
    sourceId: MANCHESTER_ELECTRICAL_FORM_SOURCE_KEY,
  }),
  MANCHESTER_ELECTRICAL_NEW_RESIDENTIAL,
  MANCHESTER_ELECTRICAL_RESIDENTIAL_ALTERATION,
  MANCHESTER_ELECTRICAL_COMMERCIAL,
  ...MANCHESTER_ELECTRICAL_LOW_VOLTAGE,
  minimumPermit("electrical"),
  reinspection("electrical"),
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — Sec. 109.8, item 9                                      */
/* -------------------------------------------------------------------------- */

/**
 * Item 9(A): a new one-unit residential dwelling is a flat $150.00, and each additional
 * unit $100.00. Manchester prices a new house's plumbing by the unit where it prices its
 * electrical by cost — the two trades are not symmetric, and a reader comparing the pages
 * should see that rather than a derivation that hides it.
 */
export const MANCHESTER_PLUMBING_NEW_RESIDENTIAL: FeeRuleRecord = manchesterRule({
  id: "manchester-plumb-new-residential",
  code: "PLUMB-NEW-RESIDENTIAL",
  label: "Plumbing permit — new residential dwellings, by unit",
  description:
    "Sec. 109.8 item 9(A) — for new residential dwellings of one unit, $150.00; for each additional unit over one, $100.00.",
  feeType: "per_unit",
  config: {
    unit: "dwelling_units",
    baseCents: MANCHESTER_PLUMBING_NEW_UNIT_CENTS,
    thresholdUnits: 1,
    centsPerUnit: MANCHESTER_PLUMBING_ADDITIONAL_UNIT_CENTS,
  },
  conditions: { field: "custom.new_residential_dwelling", op: "eq", value: true },
});

/**
 * Item 9(B): everything else — other new buildings and every addition, renovation,
 * alteration, repair or replacement — is the calculated cost multiplied by 0.015. The
 * plumbing form prints the same statement above its itemised column: "ESTIMATED COST OF JOB
 * × .015", and charges $25.00 for the application and $30.00 as a minimum, for the $55.00
 * total the form prints.
 */
export const MANCHESTER_PLUMBING_OTHER_WORK: FeeRuleRecord = manchesterRule({
  id: "manchester-plumb-other-work",
  code: "PLUMB-OTHER-WORK",
  label: "Plumbing permit — other work, by calculated cost",
  description:
    "Sec. 109.8 item 9(B) — for all other new buildings, additions, renovations, alterations, repairs or replacements, the permit fee is the calculated cost of the work multiplied by 0.015.",
  feeType: "percent",
  config: { basis: "valuation", rateBps: 150 },
  conditions: { not: { field: "custom.new_residential_dwelling", op: "eq", value: true } },
});

export const MANCHESTER_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  applicationFee({
    id: "manchester-plumb-application",
    code: "PLUMB-APPLICATION-FEE",
    label: "Plumbing permit application fee, $25.00",
    sourceId: MANCHESTER_PLUMBING_FORM_SOURCE_KEY,
  }),
  MANCHESTER_PLUMBING_NEW_RESIDENTIAL,
  MANCHESTER_PLUMBING_OTHER_WORK,
  minimumPermit("plumbing"),
  reinspection("plumbing"),
];

export const MANCHESTER_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  applicationFee({
    id: "manchester-bld-application",
    code: "BLD-APPLICATION-FEE",
    label: "Building permit application fee, $25.00",
    sourceId: MANCHESTER_FEES_PAGE_SOURCE_KEY,
  }),
  MANCHESTER_BUILDING_NEW_ONE_TWO_FAMILY,
  MANCHESTER_BUILDING_OTHER_WORK,
  MANCHESTER_PLAN_REVIEW,
  MANCHESTER_DEMOLITION,
  minimumPermit("building"),
  reinspection("building"),
];
