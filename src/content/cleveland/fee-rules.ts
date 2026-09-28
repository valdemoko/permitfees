import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Cleveland fee rules — the ordinance and the department's own recreation of it.
 *
 * Every figure below is transcribed from the two documents named in
 * research/ohio/cleveland.md:
 *
 *  - **Cleveland Code of Ordinances § 3105.25** (Ord. 708-10, eff. 8-20-10) is the
 *    enactment: the four-row valuation ladder with its $1,000,000 tier split, the
 *    misc and demolition rows, the zoning additions, the electrical and plumbing
 *    schedules with their $50 permit minimum — and, the reading this jurisdiction
 *    turns on, the two paragraphs saying OBC-class fees already **include** the
 *    RC 3781.10(E) state surcharge while 1–3 family permit and plan-examination fees
 *    do not: the 1% "shall be calculated on the final cost of each permit issued and
 *    shall be separately itemized".
 *  - The **department's Permit Fee Schedule page** — which calls itself "a user-friendly
 *    recreation", effective January 2, 2014 — is where plan examination, site
 *    development, SWPPP, the certificate of occupancy, the late-fee tiers, special
 *    inspections and the festival trio live. Two of its figures disagree with the
 *    ordinance (a $13 potable-connection row against the ordinance's $50; a
 *    boilerplate "3% OBC surcharge added" against the ordinance's "fees herein
 *    include"). The ordinance governs; every disagreement is recorded, not averaged.
 *
 * Ohio Rev. Code § 3781.10 itself could not be fetched by any path tried (see the
 * record), so the surcharge is modelled exactly as the city's ordinance states it.
 *
 * Selection follows the pattern Buffalo's flat lists established: each standalone
 * row has its own `custom.<fact>` boolean, so a permit can carry several of them at
 * once without a single-slot selector.
 */

/* -------------------------------------------------------------------------- */
/* Source and schedule keys                                                   */
/* -------------------------------------------------------------------------- */

export const CLEVELAND_CODE_SOURCE_KEY = "cleveland-code-3105-25-permit-fees";
export const CLEVELAND_FEE_PAGE_SOURCE_KEY = "cleveland-permit-fee-schedule-page";
export const CLEVELAND_DEPARTMENT_SOURCE_KEY = "cleveland-building-housing-department";

/** § 3105.25: "(Ord. No. 708-10. Passed 8-18-10, eff. 8-20-10)". */
export const CLEVELAND_CODE_EFFECTIVE_FROM = "2010-08-20";
/** The page's own first sentence: "effective January 2, 2014". */
export const CLEVELAND_PAGE_EFFECTIVE_FROM = "2014-01-02";

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function cleRule(
  sourceId: string,
  effectiveFrom: string,
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
    effectiveFrom,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/** The construction-class switch, read from § 3105.25's own scope words. */
const RESIDENTIAL: FeeCondition = { field: "custom.one_two_family", op: "eq", value: true };
function notResidential(): FeeCondition {
  return { field: "custom.one_two_family", op: "neq", value: true };
}

/** The alterations bucket: "Alterations and repairs", (a)(2) and (b)(2). */
const ALTERATION_WORK: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["alteration", "remodel", "repair", "replacement"],
};
const NEW_WORK: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["new_construction", "addition"],
};
const DEMOLITION: FeeCondition = { field: "work_type", op: "eq", value: "demolition" };

/** A standalone schedule row, selected by its own boolean fact. */
function rowFact(fact: string): FeeCondition {
  return { field: `custom.${fact}`, op: "eq", value: true };
}
function planReviewRequired(): FeeCondition {
  return rowFact("plan_review");
}

function all(...conditions: FeeCondition[]): FeeCondition {
  return { all: conditions };
}
function not(condition: FeeCondition): FeeCondition {
  return { not: condition };
}

const CODE = CLEVELAND_CODE_SOURCE_KEY;
const PAGE = CLEVELAND_FEE_PAGE_SOURCE_KEY;
const CODE_EFF = CLEVELAND_CODE_EFFECTIVE_FROM;
const PAGE_EFF = CLEVELAND_PAGE_EFFECTIVE_FROM;

/* -------------------------------------------------------------------------- */
/* Building — § 3105.25 valuation ladder                                      */
/* -------------------------------------------------------------------------- */

/** "$10,000,000" style ceilings are irrelevant; the seam is $1,000,000 = 100_000_000 cents. */
const ONE_MILLION_CENTS = 100_000_000;

/**
 * Residential and OBC ladders, each split at $1,000,000 into two rules so both sides
 * of the seam are explicit — the tier boundary's own "From $1,000,001.00 up" wording.
 * Every row prints "or fraction", so each rule rounds the chargeable valuation up to
 * a whole $1,000 (`incrementCents: 100_000`) before multiplying.
 */
export const CLEVELAND_BUILDING_CODE_RULES: FeeRuleRecord[] = [
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-res-new",
    code: "BLD-RES-NEW",
    label: "1–3 family: new buildings and additions — $10.00 per $1,000 or fraction, $150 minimum",
    description:
      "\"(a) One-Family, Two-Family, or Three-Family Dwelling Houses: (1) New buildings and additions, or parts of same: $10.00 for each $1,000.00 or fraction of estimated cost — $150.00 [minimum]\". The class switch is the schedule's own scope line; \"or fraction\" rounds the valuation up to a whole thousand before multiplying.",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 1_000, incrementCents: 100_000 },
    minimumCents: 15_000,
    conditions: all(RESIDENTIAL, NEW_WORK),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-res-alter",
    code: "BLD-RES-ALTER",
    label: "1–3 family: alterations and repairs — $5.00 per $1,000 or fraction, $30 minimum",
    description:
      "\"(2) Alterations and repairs: $5.00 for each $1,000.00 or fraction of estimated cost — $30.00 [minimum]\".",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 500, incrementCents: 100_000 },
    minimumCents: 3_000,
    conditions: all(RESIDENTIAL, ALTERATION_WORK),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-obc-new-below",
    code: "BLD-OBC-NEW-BELOW",
    label: "OBC new/first tenant build-out under $1,000,000 — $12.00 per $1,000 or fraction, $300 minimum",
    description:
      "\"(b)(1) New buildings or structures, additions … and first tenants' space buildouts in new construction: $12.00 for each $1,000.00 or fraction of estimated cost less than $1,000,000.00 — $300.00 [minimum]\". The lower side of the tier split, gated on the same figure the ordinance prints.",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 1_200, incrementCents: 100_000 },
    minimumCents: 30_000,
    conditions: all(notResidential(), NEW_WORK, {
      field: "valuation",
      op: "lte",
      value: ONE_MILLION_CENTS,
    }),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-obc-new-above",
    code: "BLD-OBC-NEW-ABOVE",
    label: "OBC new/first tenant build-out from $1,000,001 — $12,000 + $7.00 per $1,000 above $1,000,000",
    description:
      "\"From $1,000,001.00 up, $12,000.00 plus $7.00 for each $1,000.00 or fraction of estimated cost above $1,000,000.00\" — a threshold at $1,000,000, a $12,000 base, and the same round-up to whole thousands applied to what sits above it. At exactly $1,000,000 the rule below pays $12,000 and this one pays nothing; at $1,000,001 it pays $12,007.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 700,
      thresholdCents: ONE_MILLION_CENTS,
      incrementCents: 100_000,
      baseCents: 1_200_000,
    },
    conditions: all(notResidential(), NEW_WORK, {
      field: "valuation",
      op: "gt",
      value: ONE_MILLION_CENTS,
    }),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-obc-alter-below",
    code: "BLD-OBC-ALTER-BELOW",
    label: "OBC alterations/repairs under $1,000,000 — $15.00 per $1,000 or fraction, $150 minimum",
    description:
      "\"(2) Alterations or repairs to existing buildings or structures: $15.00 for each $1,000.00 or fraction thereof of estimated cost less than $1,000,000.00 — $150.00 [minimum]\".",
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 1_500, incrementCents: 100_000 },
    minimumCents: 15_000,
    conditions: all(notResidential(), ALTERATION_WORK, {
      field: "valuation",
      op: "lte",
      value: ONE_MILLION_CENTS,
    }),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-obc-alter-above",
    code: "BLD-OBC-ALTER-ABOVE",
    label: "OBC alterations/repairs from $1,000,001 — $15,000 + $11.00 per $1,000 above $1,000,000",
    description:
      "\"From $1,000,001.00 up, $15,000.00 plus $11.00 for each $1,000.00 or fraction of estimated cost above $1,000,000.00\".",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 1_100,
      thresholdCents: ONE_MILLION_CENTS,
      incrementCents: 100_000,
      baseCents: 1_500_000,
    },
    conditions: all(notResidential(), ALTERATION_WORK, {
      field: "valuation",
      op: "gt",
      value: ONE_MILLION_CENTS,
    }),
  }),

  /* ---------------------------------------------------------------------- */
  /* Demolition — priced on floor area, basement excluded                    */
  /* ---------------------------------------------------------------------- */

  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-demo-res",
    code: "BLD-DEMO-RES",
    label: "Demolition, 1–3 family or accessories — $10.00 per 1,000 sq ft or fraction of floor area, $50 minimum",
    description:
      "\"(d)(1) For 1-family, 2-family, or 3-family dwelling houses or accessory structures: $10.00 for each 1,000 square feet or fraction of floor area (excluding basement floor or cellar floor areas) — $50.00 [minimum]\". The area entered is the floor area above the excluded basement.",
    feeType: "per_thousand",
    config: { basis: "square_footage", centsPerThousand: 1_000, incrementCents: 1_000 },
    minimumCents: 5_000,
    conditions: all(RESIDENTIAL, DEMOLITION),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-demo-obc",
    code: "BLD-DEMO-OBC",
    label: "Demolition, OBC buildings — $15.00 per 1,000 sq ft or fraction of floor area, $300 minimum",
    description:
      "\"(d)(2) For buildings and structures as regulated by the Ohio Building Code $15.00 for each 1,000 square feet or fraction of floor area — $300.00 [minimum]\".",
    feeType: "per_thousand",
    config: { basis: "square_footage", centsPerThousand: 1_500, incrementCents: 1_000 },
    minimumCents: 30_000,
    conditions: all(notResidential(), DEMOLITION),
  }),

  /* ---------------------------------------------------------------------- */
  /* Misc, moving, signs, tents — § 3105.25(c), (e), (f), (g), (h)           */
  /* ---------------------------------------------------------------------- */

  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-accessory",
    code: "BLD-MISC-ACCESSORY",
    label: "Private garages, tool sheds, residential antennas and other accessory structures — $50.00",
    description: '"(c)(1) Private garages, tool sheds, residential antennas, and other accessory structures or buildings — $50.00".',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("accessory_structure"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-fence-res",
    code: "BLD-MISC-FENCE-RES",
    label: "Fences, guardrails or barriers for 1, 2 or 3 family — $50.00",
    description: '"(c)(2) Fences, guardrails or barriers for 1, 2 or 3 family — $50.00".',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: all(RESIDENTIAL, rowFact("fence")),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-fence-com",
    code: "BLD-MISC-FENCE-COM",
    label: "Fences, guardrails or barriers, commercial — $15.00 per $1,000 or fraction, $150 minimum",
    description:
      '"(c)(3) Fences, guardrails or barriers for Commercial $15.00 per $1,000.00 or fraction thereof of estimated cost — $150.00 [minimum]".',
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 1_500, incrementCents: 100_000 },
    minimumCents: 15_000,
    conditions: all(notResidential(), rowFact("fence")),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-pool",
    code: "BLD-MISC-POOL",
    label: "Swimming pool (private/residential) — $50.00",
    description: '"(c)(4) Swimming pools (private/residential) — $50.00".',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("pool"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-boarding",
    code: "BLD-MISC-BOARDING",
    label: "Effective boarding pending repairs of rehabilitation — $50.00",
    description: '"(c)(5) Effective boarding pending repairs of rehabilitation — $50.00".',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("boarding"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-moving-res",
    code: "BLD-MOVING-RES",
    label: "Moving a 1, 2 or 3-family dwelling — $300.00",
    description: '"(e)(1) Moving of Building or Structures: 1, 2 or 3-family dwellings — $300.00".',
    feeType: "flat",
    config: { amountCents: 30_000 },
    conditions: all(RESIDENTIAL, rowFact("moving")),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-moving-other",
    code: "BLD-MOVING-OTHER",
    label: "Moving any other building or structure — $600.00",
    description: '"(e)(2) Other than (e)(1) above — $600.00".',
    feeType: "flat",
    config: { amountCents: 60_000 },
    conditions: all(notResidential(), rowFact("moving")),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-sign",
    code: "BLD-SIGN",
    label: "Outdoor signs and display structures — $12.00 per $1,000 or fraction of estimated cost, $50 minimum",
    description:
      '"(f) Outdoor Signs and Display Structures; Other Wall Signs for Which a Permit is Required: $12.00 for each $1,000.00 or fraction of estimated cost — $50.00 [minimum]".',
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 1_200, incrementCents: 100_000 },
    minimumCents: 5_000,
    conditions: rowFact("sign"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-marquee",
    code: "BLD-MARQUEE",
    label: "Marquees, awnings and canopies — $12.00 per $1,000 or fraction of estimated cost, $50 minimum",
    description:
      '"(g) Marquees, Awnings and Canopies: $12.00 for each $1,000.00 or fraction of estimated cost — $50.00 [minimum]".',
    feeType: "per_thousand",
    config: { basis: "valuation", centsPerThousand: 1_200, incrementCents: 100_000 },
    minimumCents: 5_000,
    conditions: rowFact("marquee"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-bld-tent",
    code: "BLD-TENT",
    label: "Temporary tent over 120 sq ft — $75.00",
    description:
      '"(h)(2) Over 120 square feet — $75.00 [each]". Tents of 120 square feet or less are "No charge" under (h)(1), and funeral or religious tents of two weeks or less pay nothing at all — those are absence of fee, so no rule answers for them. The size tested is the tent\'s own area.',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: all(rowFact("tent"), { field: "square_footage", op: "gt", value: 120 }),
  }),
];

/* -------------------------------------------------------------------------- */
/* Building — department page rows (plan exam, zoning, site, CO, late, fest.)  */
/* -------------------------------------------------------------------------- */

export const CLEVELAND_BUILDING_PAGE_RULES: FeeRuleRecord[] = [
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-plan-exam-area",
    code: "BLD-PLAN-EXAM-AREA",
    label: "Plan examination — $20.00 per 1,000 sq ft or fraction, $20 minimum",
    description:
      '"Standard Plan Examination Fee: $20.00 per 1,000 sq ft or fraction thereof (Per area examined)" with "Minimum Plan Examination Fee: $20.00". The page calls the fee "an upfront, non-refundable charge paid upon submission of plans". Charged only when the application says plans are under review; the sibling flat row answers when there is no floor area to divide (parking lots, signs, roofs, fences).',
    componentType: "plan_review",
    feeType: "per_thousand",
    config: { basis: "square_footage", centsPerThousand: 2_000, incrementCents: 1_000 },
    minimumCents: 2_000,
    conditions: all(planReviewRequired(), { field: "square_footage", op: "exists" }),
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-plan-exam-flat",
    code: "BLD-PLAN-EXAM-FLAT",
    label: "Plan examination, no floor area — $20.00",
    description:
      '"Projects under 1,000 sq ft or projects without floor area (e.g., parking lots, signs, roofs, fences)" pay the $20.00 minimum as the fee itself. The area row and this row never answer together: this one is gated on the absence of a floor area.',
    componentType: "plan_review",
    feeType: "flat",
    config: { amountCents: 2_000 },
    conditions: all(planReviewRequired(), not({ field: "square_footage", op: "exists" })),
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-zoning-commercial",
    code: "BLD-ZONING-COMMERCIAL",
    label: "Zoning fee, commercial/multifamily/parking lots — $150.00",
    description:
      '"(i) Zoning Fees (Shall Be Added to Applicable Building Permits as Follows): Commercial and Multi-Family and Parking Lots — $150.00". Added to the permit rather than folded into it, exactly as the ordinance instructs.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 15_000 },
    conditions: rowFact("zoning_commercial"),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-zoning-residential",
    code: "BLD-ZONING-RESIDENTIAL",
    label: "Zoning fee, residential — $20.00 (page only; the ordinance's list omits it)",
    description:
      'The department page lists a fourth zoning row the ordinance does not print: "Residential — Fee: $20.00". Modelled with the page as its source and the omission recorded rather than resolved.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 2_000 },
    conditions: all(RESIDENTIAL, rowFact("zoning_residential")),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-zoning-temporary",
    code: "BLD-ZONING-TEMPORARY",
    label: "Zoning fee, temporary uses — $30.00",
    description: '"(i)(2) Temporary Uses — $30.00", added to the applicable permit.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: rowFact("zoning_temporary"),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-zoning-sign-fence",
    code: "BLD-ZONING-SIGN-FENCE",
    label: "Zoning fee, signs/fences and appurtenant structures — $20.00",
    description: '"(i)(3) Signs, Fences and Appurtenant Structures — $20.00", added to the applicable permit.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 2_000 },
    conditions: rowFact("zoning_sign_fence"),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-site-development",
    code: "BLD-SITE-DEVELOPMENT",
    label: "Site development review — $200.00",
    description: '"Site Development Reviews — Fee $200.00" (department page; not a § 3105.25 row).',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 20_000 },
    conditions: rowFact("site_development"),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-swppp",
    code: "BLD-SWPPP",
    label: "SWPPP review — $500.00",
    description:
      '"SWPPP (Storm Water Pollution Prevention Plan) Reviews (Section: 3116.04) — Fee $500.00". The page separately lists "SWPPP inspection (Monthly fee) … $150.00/month of construction duration" — a per-month charge with no month-count basis in this engine, so the monthly inspection is recorded in the research record and priced by no rule here.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 50_000 },
    conditions: rowFact("swppp_review"),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-certificate-occupancy",
    code: "BLD-CO",
    label: "Certificate of Occupancy — $60.00",
    description: '"Certificate of Occupancy (K): Required for occupancy — Fee: $60.00" (department page).',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: rowFact("certificate_of_occupancy"),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-late-72",
    code: "BLD-LATE-72",
    label: "Work started before permit, notified within 72 hours — $100.00 + 25% of the required permit fee",
    description:
      '"Late Fee (L) - Work started prior to permit issuance, notified WITHIN 72 hours: Minimum fee + percentage of required permit fee — $100.00 + 25% of required permit fee". The 25% reads the required permit fee (the base components), and the late fee itself is held outside the state surcharge\'s base because it is a penalty rather than part of the permit\'s cost.',
    componentType: "surcharge",
    feeType: "percent",
    config: { basis: "permit_fee", rate: { numerator: 25, denominator: 100 }, baseCents: 10_000 },
    conditions: all(
      { field: "custom.work_started", op: "eq", value: "within_72h" },
      { field: "permit_fee", op: "exists" },
    ),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-late-after-72",
    code: "BLD-LATE-AFTER-72",
    label: "Work started before permit, notified after 72 hours — $200.00 + 25% of the required permit fee",
    description:
      '"Late Fee (L) - Work started before permit issuance, notified AFTER 72 hours: Minimum fee + percentage of required permit fee — $200.00 + 25% of required permit fee".',
    componentType: "surcharge",
    feeType: "percent",
    config: { basis: "permit_fee", rate: { numerator: 25, denominator: 100 }, baseCents: 20_000 },
    conditions: all(
      { field: "custom.work_started", op: "eq", value: "after_72h" },
      { field: "permit_fee", op: "exists" },
    ),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-festival-plan",
    code: "BLD-FESTIVAL-PLAN",
    label: "Festival/carnival plan examination — $20.00",
    description:
      '"Festival and Carnival Permit Fees for Charitable Organizations … Plan Examination Fee — $20.00", for events of not more than five consecutive days and not more than two carnivals in any calendar year.',
    componentType: "plan_review",
    feeType: "flat",
    config: { amountCents: 2_000 },
    conditions: rowFact("festival"),
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-festival-use",
    code: "BLD-FESTIVAL-USE",
    label: "Festival/carnival use permit — $20.00",
    description: '"Use Permit — $20.00" (festival/carnival fees for charitable organizations).',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 2_000 },
    conditions: rowFact("festival"),
    priority: 150,
  }),
  cleRule(PAGE, PAGE_EFF, {
    id: "cle-bld-festival-tent",
    code: "BLD-FESTIVAL-TENT",
    label: "Festival/carnival temporary tent — $25.00",
    description:
      '"Permit for Temporary Tents (maximum per fee schedule 3105.25) — $25.00", the festival\'s own tent price under the § 3105.25(h) schedule price. Charged for the first tent; the page prices additional tents by no figure of its own, and § 3105.25 prices tents per tent at the (h) rows.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: rowFact("festival"),
    priority: 150,
  }),
];

/* -------------------------------------------------------------------------- */
/* State surcharge — one rule per permit type, all reading the same two facts  */
/* -------------------------------------------------------------------------- */

function stateSurchargeRes(id: string, code: string): FeeRuleRecord {
  return cleRule(CODE, CODE_EFF, {
    id,
    code,
    label: "State of Ohio surcharge, 1–3 family — 1% of permit and plan examination fees",
    description:
      '"For permit and plan examination fees for work performed on one (1), two (2), or three (3) family dwellings or their accessory structures, the permit fees do not include the required one percent (1%) surcharge. For permits issued for that work, the required surcharge shall be calculated on the final cost of each permit issued and shall be separately itemized" (§ 3105.25). The base is every fee charged before this line — permit and plan examination — and OBC-class fees carry no such line at all because the ordinance says they already include it.',
    componentType: "state_surcharge",
    feeType: "percent",
    config: { basis: "fee_subtotal", rate: { numerator: 1, denominator: 100 } },
    conditions: RESIDENTIAL,
  });
}

export const CLEVELAND_STATE_SURCHARGE_BUILDING = stateSurchargeRes(
  "cle-state-surcharge-bld",
  "BLD-STATE-SURCHARGE-1PCT",
);
export const CLEVELAND_STATE_SURCHARGE_ELECTRICAL = stateSurchargeRes(
  "cle-state-surcharge-elec",
  "ELEC-STATE-SURCHARGE-1PCT",
);
export const CLEVELAND_STATE_SURCHARGE_PLUMBING = stateSurchargeRes(
  "cle-state-surcharge-plumb",
  "PLUMB-STATE-SURCHARGE-1PCT",
);

/* -------------------------------------------------------------------------- */
/* Electrical — § 3105.25(l)                                                   */
/* -------------------------------------------------------------------------- */

/** The schedule says "Use (1) or (2) below to calculate fee" — the two never answer together. */
const ELEC_ITEMS = {
  all: [
    {
      any: [
        rowFact("temp_power"),
        rowFact("elec_repair"),
        rowFact("blanket_permit"),
        { field: "custom.signs", op: "exists" } as FeeCondition,
      ],
    },
  ],
} as FeeCondition;

export const CLEVELAND_ELECTRICAL_RULES: FeeRuleRecord[] = [
  cleRule(CODE, CODE_EFF, {
    id: "cle-elec-area",
    code: "ELEC-AREA",
    label: "New construction, additions, alterations — $50.00 for each 1,000 sq ft or part",
    description:
      '"(l)(1) For new construction additions, alterations to existing buildings: For each 1,000 square feet or part — $50.00". The schedule\'s own instruction is "Use (1) or (2) below to calculate fee", so this row stands down whenever an item row is selected.',
    feeType: "per_thousand",
    config: { basis: "square_footage", centsPerThousand: 5_000, incrementCents: 1_000 },
    conditions: all(
      { field: "work_type", op: "in", value: ["new_construction", "addition", "alteration"] },
      not(ELEC_ITEMS),
    ),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-elec-temp-power",
    code: "ELEC-TEMP-POWER",
    label: "Temporary lighting/power or low-voltage wiring system — $50.00",
    description:
      '"(l)(2)A Temporary lighting and/or power installations, or low voltage wiring systems (CATV cable, fire alarm devices, computer devices, data communication and other similar equipment) — $50.00". The department page narrows the list to building-service equipment (HVAC control wiring, fire alarm); the ordinance\'s broader text is what this row says, and the narrowing is recorded.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("temp_power"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-elec-signs",
    code: "ELEC-SIGNS",
    label: "Electrical signs — $50.00 for the first, $30.00 each additional installed at the same time",
    description:
      '"(l)(2)B For the first electrical sign — $50.00; Add for each additional electric sign installed at the same time — $30.00" — one row with the first sign inside its base.',
    feeType: "per_unit",
    config: { unit: "signs", centsPerUnit: 3_000, baseCents: 5_000, thresholdUnits: 1 },
    conditions: { field: "custom.signs", op: "exists" },
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-elec-repair",
    code: "ELEC-REPAIR",
    label: "Repairs to existing electrical systems — $50.00",
    description: '"(l)(2)D Repairs to existing electrical fixtures and/or systems — $50.00".',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("elec_repair"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-elec-blanket",
    code: "ELEC-BLANKET",
    label: "Blanket electrical permit, each year, each premises — $200.00",
    description: '"(l)(3) Blanket electrical permit for each year for each premises — $200.00".',
    feeType: "flat",
    config: { amountCents: 20_000 },
    conditions: rowFact("blanket_permit"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-elec-minimum",
    code: "ELEC-MIN",
    label: "Minimum fee for any electrical permit — $50.00",
    description:
      '"(l) … the minimum fee for any permit shall be: $50.00" — a floor on the whole permit, charged as the shortfall against everything this page has added.',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 5_000 },
    priority: 200,
  }),
  CLEVELAND_STATE_SURCHARGE_ELECTRICAL,
];

/* -------------------------------------------------------------------------- */
/* Plumbing — § 3105.25(k)                                                     */
/* -------------------------------------------------------------------------- */

/** One row per pipe type: the schedule prices each at $13 per 100 lineal feet or fraction. */
function pipeRow(
  suffix: string,
  fact: string,
  label: string,
  printed: string,
): FeeRuleRecord {
  return cleRule(CODE, CODE_EFF, {
    id: `cle-plumb-pipe-${suffix}`,
    code: `PLUMB-PIPE-${suffix}`,
    label: `${label} — $13.00 per 100 lineal feet or fraction`,
    description: printed,
    feeType: "per_unit",
    config: { unit: "linear_feet", centsPerUnit: 13, incrementUnits: 100 },
    conditions: rowFact(fact),
  });
}

export const CLEVELAND_PLUMBING_RULES: FeeRuleRecord[] = [
  cleRule(CODE, CODE_EFF, {
    id: "cle-plumb-fixtures",
    code: "PLUMB-FIXTURES",
    label: "Each plumbing fixture, appliance or device — $8.00 each",
    description:
      '"(k)(1) For the installation of each plumbing fixture, appliance or device such as water closets, urinals, bathtubs or showers, sinks, drinking fountains, dishwashers, laundry trays, clothes washers, floor drains, roof drains, hot water heating devices, interceptors, sump pumps, air conditioning units, catch basins, area drains, manholes and other similar equipment, or fixtures — $8.00 each". The fixtures counted are the ones the schedule lists.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 800 },
    conditions: { field: "fixtures", op: "exists" },
  }),
  pipeRow(
    "GAS",
    "pipe_gas",
    "Gas piping",
    '"(k)(2)A Gas piping – For each 100 lineal feet or fraction — $13.00". Priced in whole 100-foot segments: the feet entered are rounded up to the next hundred before the rate is applied, which is what "or fraction" charges.',
  ),
  pipeRow(
    "DRAIN",
    "pipe_drain",
    "Drains and waste piping from fixtures",
    '"(k)(2)B Drains, waste piping from plumbing fixtures – for each 100 lineal feet or fraction — $13.00".',
  ),
  pipeRow(
    "STORM",
    "pipe_storm",
    "Storm and/or foundation drains/sewers",
    '"(k)(2)C Storm and/or foundation drains/sewers – for each 100 lineal feet or fraction — $13.00".',
  ),
  pipeRow(
    "SANITARY",
    "pipe_sanitary",
    "Sanitary drains/sewers",
    '"(k)(2)D Sanitary drains/sewers – for each 100 lineal feet or fraction — $13.00".',
  ),
  pipeRow(
    "WATER",
    "pipe_water",
    "Water distribution piping",
    '"(k)(2)E Water distribution piping – for each 100 lineal feet or fraction — $13.00".',
  ),
  cleRule(CODE, CODE_EFF, {
    id: "cle-plumb-potable",
    code: "PLUMB-POTABLE",
    label: "Connection to potable water line for non-potable uses — $50.00 (ordinance)",
    description:
      '"(k)(2)F Connection to potable water line for non-potable uses such as irrigation, fire suppression system, etc. — $50.00". The department page prints $13.00 for this row — apparently copied from the piping rows above it — and the ordinance\'s $50.00 is what this rule charges; the disagreement is recorded in the research record rather than split.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("potable_connection"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-plumb-repair",
    code: "PLUMB-REPAIR",
    label: "Repairs to existing plumbing fixtures and/or systems — $50.00",
    description: '"(k)(3)A Repairs to existing plumbing fixtures and/or systems — $50.00".',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("plumbing_repair"),
  }),
  cleRule(CODE, CODE_EFF, {
    id: "cle-plumb-minimum",
    code: "PLUMB-MIN",
    label: "Minimum fee for any plumbing permit — $50.00",
    description:
      '"(k) … the minimum fee for any permit shall be: $50.00" — a floor on the whole permit, charged as the shortfall after the fixture and piping rows have been read. Six fixtures compute $48.00 and pay $50.00.',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 5_000 },
    priority: 200,
  }),
  CLEVELAND_STATE_SURCHARGE_PLUMBING,
];

/* -------------------------------------------------------------------------- */
/* Building surcharge joins its own schedule group                             */
/* -------------------------------------------------------------------------- */

export const CLEVELAND_BUILDING_SURCHARGE_RULES: FeeRuleRecord[] = [
  CLEVELAND_STATE_SURCHARGE_BUILDING,
];

/** Every rule this jurisdiction publishes, for tests that want the whole set. */
export const CLEVELAND_ALL_RULES: FeeRuleRecord[] = [
  ...CLEVELAND_BUILDING_CODE_RULES,
  ...CLEVELAND_BUILDING_PAGE_RULES,
  ...CLEVELAND_BUILDING_SURCHARGE_RULES,
  ...CLEVELAND_ELECTRICAL_RULES,
  ...CLEVELAND_PLUMBING_RULES,
];
