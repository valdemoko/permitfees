import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Toledo fee rules — Chapter 1307 of the Toledo Municipal Code, read against the
 * City's own application worksheet and permit pages.
 *
 * Every figure below is transcribed from the documents named in
 * research/ohio/toledo.md:
 *
 *  - **TMC Chapter 1307 — Fees** (Ord. 476-18, passed 12-4-18): § 1307.02's area-based
 *    building fees ($60/$75 base plus $0.20 per gross square foot, 100 sq ft minimum),
 *    the cubic-feet demolition bands, § 1307.03's plan examination ($50/$75 plus $0.03
 *    per square foot) and the Early Start Phased Permit, § 1307.04's electrical rows
 *    under a $75 permit minimum, § 1307.05's plumbing rows under the same $75, and
 *    § 1307.13's state surcharge — 1% residential, 3% commercial, "in addition to the
 *    fees stated in this chapter".
 *  - The **building permit application** carries the valuation definition ("Exclude
 *    cost of mechanical and electrical work for which separate permits are required")
 *    and the commercial non-structural exterior rate ($95 beside the residential $60
 *    the code also prints) — the one figure here that is the form's rather than the
 *    chapter's.
 *  - The **Commercial Building Alteration page** supplies no rate this module charges,
 *    but its worked example settles what "3% of total" means (plan review $225 +
 *    permit $1,075 = $1,300, surcharge $39, certificate of occupancy outside it), and
 *    its fee prose carries the swap this jurisdiction documents: it prints plan review
 *    at "$75 + $.20" and the building permit at "$75 + $.03" while its own table, the
 *    code and the application form all say the reverse.
 *
 * Rows the chapter prints but this engine cannot charge are named rather than faked:
 * motors by horsepower, generators by kilowatt, hydronic rows by BTU, and the
 * additional-tent/-tank counts have no per-unit kind to charge them on.
 */

/* -------------------------------------------------------------------------- */
/* Source and schedule keys                                                   */
/* -------------------------------------------------------------------------- */

export const TOLEDO_CODE_SOURCE_KEY = "toledo-code-1307-fees";
export const TOLEDO_APPLICATION_SOURCE_KEY = "toledo-building-permit-application";
export const TOLEDO_ALTERATION_PAGE_SOURCE_KEY = "toledo-commercial-building-alteration-page";
export const TOLEDO_DEPARTMENT_SOURCE_KEY = "toledo-building-inspection-department";

/** Every Chapter 1307 section carries "(Ord. 476-18. Passed 12-4-18.)". */
export const TOLEDO_CODE_EFFECTIVE_FROM = "2018-12-04";
/** The application form prints no date; it is effective from the day it was read. */
export const TOLEDO_APPLICATION_EFFECTIVE_FROM = "2026-09-25";

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function toledoRule(
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

/** § 1307.13's split: (a) residential 1%, (b) everything else 3%. Both strict. */
const RESIDENTIAL: FeeCondition = { field: "custom.one_two_family", op: "eq", value: true };
function notResidential(): FeeCondition {
  return { field: "custom.one_two_family", op: "neq", value: true };
}

/** Rows selected by their own boolean fact, so several can answer one permit. */
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

const CODE = TOLEDO_CODE_SOURCE_KEY;
const FORM = TOLEDO_APPLICATION_SOURCE_KEY;
const CODE_EFF = TOLEDO_CODE_EFFECTIVE_FROM;
const FORM_EFF = TOLEDO_APPLICATION_EFFECTIVE_FROM;

/** The schedule's own floor mechanism: base always charged, then at least 100 sq ft priced. */
const PLAN_MIN_RES = 5_300; // $50 base + $0.03 × 100
const PLAN_MIN_OBC = 7_800; // $75 base + $0.03 × 100
const BUILD_MIN_RES = 8_000; // $60 base + $0.20 × 100
const BUILD_MIN_OBC = 9_500; // $75 base + $0.20 × 100

const ALTERATION_OR_NEW: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["new_construction", "addition", "alteration", "remodel", "replacement"],
};

/* -------------------------------------------------------------------------- */
/* Building — § 1307.02, § 1307.03, application form                           */
/* -------------------------------------------------------------------------- */

export const TOLEDO_BUILDING_RULES: FeeRuleRecord[] = [
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-res-base",
    code: "BLD-RES-BASE",
    label: "Residential 1–3 family new/addition/alteration and accessories — $60 base + $0.20 per gross sq ft (100 sq ft minimum)",
    description:
      '"(a) Residential 1, 2, or 3 family dwellings — 1. New construction, additions, alterations (interior or exterior), & their accessory structures. Base fee $60.00; Additional fee of $0.20 per gross square foot (100 sq. ft. minimum per alteration)". The floor is the rule\'s own minimum: $60 + $0.20 × 100 = $80. Work the schedule calls non-structural exterior takes the flat per-alteration row instead — this one stands down for it.',
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 20, denominator: 1 },
      rateUnit: "currency_per_unit",
      baseCents: 6_000,
    },
    minimumCents: BUILD_MIN_RES,
    conditions: all(RESIDENTIAL, not(rowFact("non_structural_exterior")), ALTERATION_OR_NEW),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-res-exterior",
    code: "BLD-RES-EXTERIOR",
    label: "Residential non-structural exterior alteration (roof, siding, doors, windows) — $60.00 per alteration",
    description:
      '"(a)(2) Residential non-structural exterior alterations. $60.00 per alteration (roofs, siding, doors, windows)" — the flat row for exterior work the code separates from the base-plus-area row, which stands down when this one is selected.',
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: all(RESIDENTIAL, rowFact("non_structural_exterior")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-comm-base",
    code: "BLD-COMM-BASE",
    label: "Commercial and 4-family-or-larger new/addition/alteration — $75 base + $0.20 per gross sq ft (100 sq ft minimum)",
    description:
      '"(b) Commercial buildings and 4 family or larger residential buildings - new construction, additions or alterations (interior or exterior). Base fee $75.00; Additional fee of $0.20 per gross sq. ft. (100 sq. ft. minimum per alteration)" — floor $75 + $0.20 × 100 = $95.',
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 20, denominator: 1 },
      rateUnit: "currency_per_unit",
      baseCents: 7_500,
    },
    minimumCents: BUILD_MIN_OBC,
    conditions: all(notResidential(), not(rowFact("non_structural_exterior")), ALTERATION_OR_NEW),
  }),
  toledoRule(FORM, FORM_EFF, {
    id: "tol-bld-comm-exterior",
    code: "BLD-COMM-EXTERIOR",
    label: "Commercial non-structural exterior alteration — $95.00 per alteration (application form; the chapter prints no commercial row)",
    description:
      'The application form\'s exterior row: "($60 Residential $95 Commercial each)" against Roof Replacement, Windows, Doors, Siding. The chapter\'s (a)(2) prints only the residential $60; the $95 commercial figure exists nowhere in Chapter 1307, so the form is its source and the extension is recorded.',
    feeType: "flat",
    config: { amountCents: 9_500 },
    conditions: all(notResidential(), rowFact("non_structural_exterior")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-plan-res",
    code: "BLD-PLAN-RES",
    label: "Residential plan examination (RCO plans) — $50 base + $0.03 per sq ft (100 sq ft minimum)",
    description:
      '"(b) Plans submitted for examination under the Residential Code of Ohio. 1. Residential plan examination: $50.00 base fee; plus $.03 (cents) per square foot (100 sf min.)" — floor $50 + $0.03 × 100 = $53. Charged when the application says plans are under review; the City\'s own worked table (plan review at $0.03, permit at $0.20) and the application form both confirm which rate belongs to which line, against the website prose that prints them swapped.',
    componentType: "plan_review",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 3, denominator: 1 },
      rateUnit: "currency_per_unit",
      baseCents: 5_000,
    },
    minimumCents: PLAN_MIN_RES,
    conditions: all(planReviewRequired(), RESIDENTIAL),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-plan-obc",
    code: "BLD-PLAN-OBC",
    label: "OBC plan examination — $75 base + $0.03 per sq ft (100 sq ft minimum)",
    description:
      '"(a) Plans submitted for examination under the Ohio Building Code… 1. Plan Examination: $75.00 base fee; plus $.03 (cents) per square foot (100 sf min.)" — floor $75 + $0.03 × 100 = $78. The fee "includes one (1) initial plan review and one (1) resubmission plan review"; after the first resubmission the chapter prices $150 and $300, and those counts are recorded rather than charged (no resubmission-count basis). The chapter\'s cross-reference to "section 1307.08(a)" for this sentence points at the refund clause and is a code error, recorded as such.',
    componentType: "plan_review",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 3, denominator: 1 },
      rateUnit: "currency_per_unit",
      baseCents: 7_500,
    },
    minimumCents: PLAN_MIN_OBC,
    conditions: all(planReviewRequired(), notResidential()),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-amend-obc",
    code: "BLD-AMEND-OBC",
    label: "Amended construction documents after initial approval (OBC) — $100.00 per submission",
    description:
      '"(a)(3) Amended construction documents, after initial plan approval: $100.00 per submission". The alteration page prints "$103 Amendment fee" for the same act — the code\'s $100 is charged and the page\'s extra $3 (apparently the 3% folded in) is recorded as a conflict.',
    componentType: "plan_review",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: all(rowFact("amended_documents"), notResidential()),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-amend-res",
    code: "BLD-AMEND-RES",
    label: "Amended construction documents after initial approval (RCO) — $50.00 per submission",
    description: '"(b)(3) Amended construction documents: $50.00 per submission."',
    componentType: "plan_review",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: all(rowFact("amended_documents"), RESIDENTIAL),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-espp",
    code: "BLD-ESPP",
    label: "Early Start Phased Permit, building — 0.5% of the building permit valuation, $100 minimum",
    description:
      '"(c)(4)a Early Start Phased Permit (ESPP) fees: Building permits - one half of one percent (.005) of the building permit valuation (minimum $100.00)" — the fee that lets interior alterations start at the rough-in stage while plans are still under review, expiring on permit issuance or after ninety days. Eligibility in the chapter is interior alterations without structural changes, so the row is gated on that work type as well as the ESPP flag.',
    feeType: "percent",
    config: { basis: "valuation", rateBps: 50 },
    minimumCents: 10_000,
    conditions: all(rowFact("early_start"), {
      field: "work_type",
      op: "eq",
      value: "alteration",
    }),
  }),

  /* ---------------------------------------------------------------------- */
  /* Removal and demolition — § 1307.02(d), priced on volume                 */
  /* ---------------------------------------------------------------------- */

  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-demo-small",
    code: "BLD-DEMO-SMALL",
    label: "Removal/demolition, buildings not exceeding 6,000 cu ft — $75.00",
    description:
      '"(d) Removal and demolition. Buildings not exceeding 6,000 cu. ft. $75.00". The band trigger is the building\'s own volume; the fee schedules say nothing about which quantity the third band\'s rate multiplies, and that reading is recorded in the research record.',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: all(
      { field: "work_type", op: "eq", value: "demolition" },
      { field: "custom.cubic_footage", op: "lte", value: 6_000 },
    ),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-demo-mid",
    code: "BLD-DEMO-MID",
    label: "Removal/demolition, 6,000–50,000 cu ft — $100.00",
    description: '"(d) Buildings 6,000 to 50,000 cu. ft. $100.00."',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: all(
      { field: "work_type", op: "eq", value: "demolition" },
      { field: "custom.cubic_footage", op: "gt", value: 6_000 },
      { field: "custom.cubic_footage", op: "lte", value: 50_000 },
    ),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-demo-large",
    code: "BLD-DEMO-LARGE",
    label: "Removal/demolition, over 50,000 cu ft — $100.00 plus $3.00 per 1,000 cu ft or fraction",
    description:
      '"(d) Buildings in excess of 50,000 cu. ft. $100.00 plus $3.00/1,000 cu. ft. or fraction thereof". The rate is read on the building\'s whole volume — the amount line states no base to subtract from, and the same chapter writes "above $1,000,000.00"-style excess bases elsewhere when it means one (Cleveland\'s ordinance does the same). The consequence is the schedule\'s own: 50,000 cu ft pays the flat $100 band and 50,001 pays $100 + 51 × $3 = $253. The alternative reading (rate on volume above 50,000, $103 at the seam) is recorded unresolved in the research record — no worked example, application line or website text settles it.',
    feeType: "per_thousand",
    config: {
      basis: "cubic_footage",
      centsPerThousand: 300,
      incrementCents: 1_000,
      baseCents: 10_000,
    },
    conditions: all(
      { field: "work_type", op: "eq", value: "demolition" },
      { field: "custom.cubic_footage", op: "gt", value: 50_000 },
    ),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-tanks",
    code: "BLD-TANKS",
    label: "Removal of in-ground tanks — $75.00 for the first tank",
    description:
      '"(d) Removal of in-ground tanks $75.00 for first tank, plus $25.00 for each additional tank". The first tank is charged; the $25 additional-tank count has no per-unit kind in this engine and is recorded rather than flattened into a per-tank flat fee.',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: rowFact("in_ground_tank"),
  }),

  /* ---------------------------------------------------------------------- */
  /* The chapter's flat permits — § 1307.02(e)–(k)                           */
  /* ---------------------------------------------------------------------- */

  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-zoning-appeal",
    code: "BLD-ZONING-APPEAL",
    label: "Zoning appeal — $200.00",
    description: '"(e) Zoning appeals. $200.00."',
    feeType: "flat",
    config: { amountCents: 20_000 },
    conditions: rowFact("zoning_appeal"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-co",
    code: "BLD-CO",
    label: "Certificate of Occupancy or Partial Certificate — $75.00 each",
    description:
      '"(g) Occupancy permits. Certificate of Occupancy $75.00; Partial Certificate of Occupancy $75.00". The application worksheet puts this line AFTER the state surcharge, and the alteration page\'s worked example does the same ($75 listed after the $39) — so the certificate sits outside the surcharge\'s base here, exactly as its component order runs.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: rowFact("certificate_of_occupancy"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-flood-res",
    code: "BLD-FLOOD-RES",
    label: "Floodplain development permit, 1–3 family — $60.00",
    description: '"(h)(1)a Floodplain Development permit, each application. 1, 2, or 3 family dwellings $60.00."',
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: all(RESIDENTIAL, rowFact("floodplain")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-flood-other",
    code: "BLD-FLOOD-OTHER",
    label: "Floodplain development permit, all other occupancies — $100.00",
    description: '"(h)(1)b All other occupancies $100.00."',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: all(notResidential(), rowFact("floodplain")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-flood-ack",
    code: "BLD-FLOOD-ACK",
    label: "Community Acknowledgement form — $50.00",
    description: '"(h)(2) Community Acknowledgement form, each application for all occupancies. $50.00."',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("floodplain_ack"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-parking",
    code: "BLD-PARKING",
    label: "Parking lot over five spaces (construct/pave/resurface) — $75.00",
    description: '"(i) Parking lots. Constructing new, paving/re-paving and/or resurfacing, more than five spaces $75.00."',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: rowFact("parking_lot"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-manufactured",
    code: "BLD-MANUFACTURED",
    label: "Manufactured homes — $250.00 per unit",
    description: '"(j) Manufactured Homes, per unit $250.00."',
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 25_000 },
    conditions: rowFact("manufactured_home"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-czc",
    code: "BLD-CZC",
    label: "Certificate of Zoning Compliance — $50.00",
    description:
      '"(k) Certificate of Zoning Compliance $50.00". § 1307.02 requires a Certificate of Zoning Compliance for new construction and additions regulated by the OBC or RCO, for all residential and commercial accessory structures, ramps, decks regardless of size, fences regardless of height, and pools deeper than 24 inches — charged as its own certificate line, outside the state surcharge base.',
    componentType: "other",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: rowFact("czc"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-bld-festival",
    code: "BLD-FESTIVAL",
    label: "Festival and/or tent, first tent — $75.00",
    description:
      '"(c) Festivals and/or tents. First Tent $75.00 + $25.00 for each additional tent" — the first tent charged here; the $25 additional-tent count has no per-unit kind in this engine and is recorded rather than faked.',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: rowFact("festival"),
  }),
];

/* -------------------------------------------------------------------------- */
/* State surcharge — § 1307.13, on plan review + permit, before the CO line    */
/* -------------------------------------------------------------------------- */

function stateSurcharge(id: string, code: string, residential: boolean): FeeRuleRecord {
  return toledoRule(CODE, CODE_EFF, {
    id,
    code,
    label: residential
      ? "State of Ohio surcharge, residential (1–3 family and accessories) — 1% of total"
      : "State of Ohio surcharge, commercial (all other permits) — 3% of total",
    description:
      '"In addition to the fees stated in this chapter, when a permit is subject to Ohio Building Code or the Residential Code of Ohio requirements, each permit applicant shall also be charged an additional surcharge fee imposed by the State of Ohio. (a) Residential (all permits for 1, 2, or 3 family dwellings & accessory structures) plus 1% of total; (b) Commercial (all permits other than residential) plus 3% of total" (§ 1307.13). What "total" means is settled by the City\'s own worked example: plan review $225 + permit $1,075 = $1,300, 3% = $39 — with the certificate of occupancy listed after the surcharge, outside it. The engine\'s component order runs the same way: base, then plan review, then this line, and "other" fees (the certificate, the zoning certificate) come after.',
    componentType: "state_surcharge",
    feeType: "percent",
    config: {
      basis: "fee_subtotal",
      rate: residential
        ? { numerator: 1, denominator: 100 }
        : { numerator: 3, denominator: 100 },
    },
    conditions: residential ? RESIDENTIAL : notResidential(),
  });
}

export const TOLEDO_SURCHARGE_RES_BUILDING = stateSurcharge(
  "tol-state-surcharge-bld-res",
  "BLD-STATE-SURCHARGE-1PCT",
  true,
);
export const TOLEDO_SURCHARGE_COMM_BUILDING = stateSurcharge(
  "tol-state-surcharge-bld-comm",
  "BLD-STATE-SURCHARGE-3PCT",
  false,
);
export const TOLEDO_SURCHARGE_RES_ELECTRICAL = stateSurcharge(
  "tol-state-surcharge-elec-res",
  "ELEC-STATE-SURCHARGE-1PCT",
  true,
);
export const TOLEDO_SURCHARGE_COMM_ELECTRICAL = stateSurcharge(
  "tol-state-surcharge-elec-comm",
  "ELEC-STATE-SURCHARGE-3PCT",
  false,
);
export const TOLEDO_SURCHARGE_RES_PLUMBING = stateSurcharge(
  "tol-state-surcharge-plumb-res",
  "PLUMB-STATE-SURCHARGE-1PCT",
  true,
);
export const TOLEDO_SURCHARGE_COMM_PLUMBING = stateSurcharge(
  "tol-state-surcharge-plumb-comm",
  "PLUMB-STATE-SURCHARGE-3PCT",
  false,
);

/* -------------------------------------------------------------------------- */
/* Electrical — § 1307.04                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Row 7 prices electrical services at $0.50 per amp "in all occupancies", and rows
 * 5, 6 and 10 carry their own $0.50-per-amp components — so this row stands down
 * when one of those selections is on the filing rather than charging the amperage
 * twice. A negation over absent facts is true, so an unselected permit still takes
 * the row.
 */
const NOT_A_SELFSERVICE_ROW: FeeCondition = {
  not: {
    any: [rowFact("temp_pole"), rowFact("service_release"), rowFact("mobile_home")],
  },
};

export const TOLEDO_ELECTRICAL_RULES: FeeRuleRecord[] = [
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-res-new",
    code: "ELEC-RES-NEW",
    label: "New residential 1–3 family dwelling — $90.00 per unit",
    description:
      '"(c) Electrical Permit fees… 1. New residential 1, 2, or 3 family dwellings $90.00 per unit (Additional fees for items #7, 9, & 11)" — the additions being the service amperage row (0.50/amp), generators (unmodellable by kilowatt) and pool bonding. The $75 permit minimum rides under the whole page.',
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 9_000 },
    conditions: all(RESIDENTIAL, {
      field: "work_type",
      op: "eq",
      value: "new_construction",
    }),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-res-existing",
    code: "ELEC-RES-EXISTING",
    label: "Existing residential 1–3 family, alteration or addition — $60.00 base per unit",
    description:
      '"(c) 2. Existing residential 1, 2, or 3 family dwellings, alteration or addition. Base fee per unit $60.00 (Additional fees for items #7, 9, & 11)".',
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 6_000 },
    conditions: all(RESIDENTIAL, {
      field: "work_type",
      op: "in",
      value: ["alteration", "addition", "remodel"],
    }),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-comm-base",
    code: "ELEC-COMM-BASE",
    label: "Commercial new/alteration/replacement/addition — $100.00 base per unit",
    description:
      '"(c) 3. Commercial - new, alterations, replacements, or additions. Base fee per unit $100.00 (Additional fees for items #4, 7, 8, 9, 10, & 11)" — the additions this engine can charge are the fixture/circuit row, service amperage, mobile-home amperage and pool bonding; motors by horsepower and generators by kilowatt are recorded unmodelled.',
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 10_000 },
    conditions: all(notResidential(), ALTERATION_OR_NEW),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-circuits",
    code: "ELEC-CIRCUITS",
    label: "Commercial/industrial fixtures and circuits, each — $2.00",
    description:
      '"(c) 4. Commercial and industrial fixtures & circuits (includes new or replacement.) each additional circuit and/or fixture $2.00" — with the schedule\'s own counting note: "Each drop-cord pendant is to be considered a single fixture. Fixtures as supplied by manufacturer, regardless of number of tubes or lamps, whether installed individually or as assemblies, are considered a single fixture." The word "additional" carries no stated allowance in the chapter, so each counted circuit or fixture is charged the $2.00 and the ambiguity is recorded.',
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 200 },
    conditions: all(notResidential(), { field: "custom.circuits", op: "exists" }),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-service-amps",
    code: "ELEC-SERVICE-AMPS",
    label: "Electrical services (incl. solar arrays, PV modules, wind turbines), all occupancies — $0.50 per amp",
    description:
      '"(c) 7. Electrical services, including packaged: connected solar arrays, photovoltaic modules, and wind turbines in all occupancies, per amp. $0.50 per amp" with the note "Fees for multi-residential occupancy shall be based on total amp capacity per unit." The service size is entered as the filing\'s amperage fact; the row stands down when a temporary pole, service release or mobile-home row is selected, because those rows carry their own $0.50-per-amp components.',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 50, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: NOT_A_SELFSERVICE_ROW,
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-temp-pole-res",
    code: "ELEC-TEMP-POLE-RES",
    label: "Temporary pole, residential — $75.00",
    description: '"(c) 5. Temporary pole. Residential $75.00."',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: all(RESIDENTIAL, rowFact("temp_pole")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-temp-pole-comm",
    code: "ELEC-TEMP-POLE-COMM",
    label: "Temporary pole, commercial — $75.00",
    description: '"(c) 5. Temporary pole. Commercial $75.00 plus $0.50 per amp" — the flat part; the amperage part is the row below.',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: all(notResidential(), rowFact("temp_pole")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-temp-pole-amps",
    code: "ELEC-TEMP-POLE-AMPS",
    label: "Temporary pole, commercial — $0.50 per amp",
    description: '"(c) 5. Temporary pole. Commercial $75.00 plus $0.50 per amp" — the amperage part, split from the flat part so a filing without an amperage still pays the $75.',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 50, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: all(notResidential(), rowFact("temp_pole")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-release-res",
    code: "ELEC-RELEASE-RES",
    label: "Release of electrical services, residential — $50.00 per unit",
    description: '"(c) 6. Release of electrical services. Residential $50.00 per unit."',
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 5_000 },
    conditions: all(RESIDENTIAL, rowFact("service_release")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-release-comm",
    code: "ELEC-RELEASE-COMM",
    label: "Release of electrical services, commercial — $75.00 per unit",
    description: '"(c) 6. Release of electrical services. Commercial $75.00 per unit plus $0.50 per amp" — the flat part.',
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 7_500 },
    conditions: all(notResidential(), rowFact("service_release")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-release-amps",
    code: "ELEC-RELEASE-AMPS",
    label: "Release of electrical services, commercial — $0.50 per amp",
    description: '"(c) 6. Release of electrical services. Commercial $75.00 per unit plus $0.50 per amp" — the amperage part.',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 50, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: all(notResidential(), rowFact("service_release")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-mobile-amps",
    code: "ELEC-MOBILE-AMPS",
    label: "Mobile or manufactured homes (or pedestal only) — $0.50 per amp",
    description:
      '"(c) 10. Mobile or manufactured homes $0.50 per amp. Installation inspection and/or alteration and/or conversion inspection. Mobile home pedestal only (no hookup to mobile home) $0.50 per amp."',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 50, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: all(notResidential(), rowFact("mobile_home")),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-pool-bond",
    code: "ELEC-POOL-BOND",
    label: "Swimming pool bonding — $75.00",
    description: '"(c) 11. Swimming pool bonding $75.00" — one of the three additions the chapter lists beside its residential base rows.',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: rowFact("pool_bonding"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-espp",
    code: "ELEC-ESPP",
    label: "Early Start Phased Permit, electrical — $100.00",
    description:
      '"(c)(4)b Electrical, Plumbing, HVAC, Hydronic, or Refrigeration & pressure piping permits; $100.00 each" — the ESPP fee for a trade permit, letting work start at rough-in while plans review. Expires with the real permit or after ninety days.',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: rowFact("early_start"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-elec-minimum",
    code: "ELEC-MIN",
    label: "Minimum fee for any electrical permit — $75.00",
    description:
      '"(c) The cost of all permits will be on the basis of fees listed except when the total is less than the established minimum fee of seventy-five dollars ($75.00) for any permit" — a floor on the whole permit, charged as the shortfall after every row has been read.',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 7_500 },
    priority: 200,
  }),
  TOLEDO_SURCHARGE_RES_ELECTRICAL,
  TOLEDO_SURCHARGE_COMM_ELECTRICAL,
];

/* -------------------------------------------------------------------------- */
/* Plumbing — § 1307.05                                                        */
/* -------------------------------------------------------------------------- */

export const TOLEDO_PLUMBING_RULES: FeeRuleRecord[] = [
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-comm-base",
    code: "PLUMB-COMM-BASE",
    label: "Commercial plumbing new/alteration/replacement/addition — $100.00 base",
    description:
      '"(c) 1. Commercial plumbing fees. A. New, alterations, replacements, or additions. Base fee $100.00 plus $6.00 each fixture" — the base half; the fixture half is the row below. The schedule\'s fixture definition: "Plumbing fixtures, all occupancies (new or replacement) includes all plumbing fixtures, water heater, water line, water service, sanitary pipe, backflow protection device, interceptors, floor drains, tempering valves, etc."',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: notResidential(),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-comm-fixtures",
    code: "PLUMB-COMM-FIXTURES",
    label: "Commercial plumbing fixtures — $6.00 each fixture",
    description:
      '"(c) 1.A … plus $6.00 each fixture" — every fixture counted, with no allowance, because this row says "each fixture" where the residential rows say "each additional fixture".',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 600 },
    conditions: all(notResidential(), { field: "fixtures", op: "exists" }),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-res-new-base",
    code: "PLUMB-RES-NEW-BASE",
    label: "Residential 1–3 family plumbing, new construction — $90.00 base",
    description:
      '"(c) 2. Residential plumbing fees, 1, 2, or 3 family dwellings. A. New construction, $90.00 base fee plus $6.00 each additional fixture" — the base half, on the new-construction side of the residential split.',
    feeType: "flat",
    config: { amountCents: 9_000 },
    conditions: all(RESIDENTIAL, {
      field: "work_type",
      op: "eq",
      value: "new_construction",
    }),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-res-new-extra",
    code: "PLUMB-RES-NEW-EXTRA",
    label: "Residential plumbing, new construction — $6.00 each additional fixture (first included in the $90)",
    description:
      '"(c) 2.A … plus $6.00 each additional fixture" — the first fixture sits inside the $90 base, so this row charges from the second one on. Eight fixtures are $90 + 7 × $6 = $132.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 600, thresholdUnits: 1 },
    conditions: all(RESIDENTIAL, {
      field: "work_type",
      op: "eq",
      value: "new_construction",
    }),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-res-existing-base",
    code: "PLUMB-RES-EXIST-BASE",
    label: "Residential 1–3 family plumbing, existing dwelling — $65.00 base",
    description:
      '"(c) 2.B Existing Residential $65.00 base fee plus $6.00 each additional fixture" — the existing-dwelling side of the split, answering whenever the work is not new construction.',
    feeType: "flat",
    config: { amountCents: 6_500 },
    conditions: all(RESIDENTIAL, {
      field: "work_type",
      op: "neq",
      value: "new_construction",
    }),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-res-existing-extra",
    code: "PLUMB-RES-EXIST-EXTRA",
    label: "Residential plumbing, existing dwelling — $6.00 each additional fixture (first included in the $65)",
    description:
      '"(c) 2.B … plus $6.00 each additional fixture" — first fixture inside the $65 base.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 600, thresholdUnits: 1 },
    conditions: all(RESIDENTIAL, {
      field: "work_type",
      op: "neq",
      value: "new_construction",
    }),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-backflow-i",
    code: "PLUMB-BACKFLOW-I",
    label: "Water distribution system backflow survey, Category I (high hazard) — $100.00 annual fee",
    description:
      '"(c) 1.B Water distribution system backflow and cross-connection control building survey. Category I - high hazard occupancy (annual fee) $100.00" — selected with the survey flag and the category fact together.',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: all(
      rowFact("backflow_survey"),
      { field: "custom.backflow_category", op: "eq", value: "I" },
    ),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-backflow-ii",
    code: "PLUMB-BACKFLOW-II",
    label: "Water distribution system backflow survey, Category II (intermediate/low hazard) — $75.00 every two years",
    description:
      '"Category II - intermediate or low hazard occupancy (fee for two years) $75.00" — the chapter\'s own period is quoted rather than annualised.',
    feeType: "flat",
    config: { amountCents: 7_500 },
    conditions: all(
      rowFact("backflow_survey"),
      { field: "custom.backflow_category", op: "eq", value: "II" },
    ),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-espp",
    code: "PLUMB-ESPP",
    label: "Early Start Phased Permit, plumbing — $100.00",
    description:
      '"(c)(4)b Electrical, Plumbing, HVAC, Hydronic, or Refrigeration & pressure piping permits; $100.00 each" — the trade ESPP fee.',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: rowFact("early_start"),
  }),
  toledoRule(CODE, CODE_EFF, {
    id: "tol-plumb-minimum",
    code: "PLUMB-MIN",
    label: "Minimum fee for any plumbing permit — $75.00",
    description:
      '"(c) The cost of all permits will be on the basis of fees listed except when the total is less than the established minimum fee of seventy-five dollars ($75.00) for any permit" — a floor on the whole permit, charged as the shortfall after the rows. Three fixtures in an existing dwelling compute $65 + $12 = $77 and pass it; one fixture computes $71 and pays $75.',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 7_500 },
    priority: 200,
  }),
  TOLEDO_SURCHARGE_RES_PLUMBING,
  TOLEDO_SURCHARGE_COMM_PLUMBING,
];

/** Building-page surcharge pair joins the building group. */
export const TOLEDO_BUILDING_SURCHARGE_RULES: FeeRuleRecord[] = [
  TOLEDO_SURCHARGE_RES_BUILDING,
  TOLEDO_SURCHARGE_COMM_BUILDING,
];

/** Every rule this jurisdiction publishes, for tests that want the whole set. */
export const TOLEDO_ALL_RULES: FeeRuleRecord[] = [
  ...TOLEDO_BUILDING_RULES,
  ...TOLEDO_BUILDING_SURCHARGE_RULES,
  ...TOLEDO_ELECTRICAL_RULES,
  ...TOLEDO_PLUMBING_RULES,
];
