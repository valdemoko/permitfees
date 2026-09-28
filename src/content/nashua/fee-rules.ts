import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Nashua, New Hampshire fee rules — REAL DATA.
 *
 * Sources (research/new-hampshire/nashua.md records how each was read):
 *
 *  S1  Nashua Revised Ordinances, Chapter 105 "Building Construction", Article VIII
 *      "Fees" — §105-27 Permits and fees and §105-28 Fee Schedule, in its current
 *      consolidation (code date 2026-02-10). §105-28 carries four schedules: A building,
 *      B mechanical, C electrical, D plumbing. This is the operative source for every
 *      modelled amount, and the amendments are printed against each subsection — most
 *      recently 3-9-2021 by Ord. No. O-21-045.
 *      https://ecode360.com/8729813
 *  S2  Ordinance O-21-045, "Amending the building construction ordinances and increasing
 *      the Building Department fees", as archived by the City Clerk — the ordinance the
 *      code's amendment notes point to, including the sentence that adopted these rates.
 *      https://www.nashuanh.gov/Archive.aspx?ADID=6680
 *  S3  Building Safety Department — Permits, which links every trade application form and
 *      both fee documents, and states that the new fees are "listed under Ordinance
 *      0-21-045".
 *      https://www.nashuanh.gov/278/Permits
 *  S4  Permits Required & Cost, the department's own plain-language page: fees are
 *      "determined by the square footage of the project", "there is an additional $35
 *      filing fee for each permit", "an additional $25 fee for Land Use review", and "a
 *      building permit only includes the structural portion. Separate permits are required
 *      for plumbing, electrical or mechanical work".
 *      https://www.nashuanh.gov/281/Permits-Required-Cost
 *  S5  Residential Electrical Permit application, and the four sibling forms linked beside
 *      it (commercial electrical, residential and commercial mechanical, residential and
 *      commercial plumbing). Each prints the schedule's own rows as an itemised table with
 *      a $50.00 application fee line, and the surcharge footnotes.
 *      https://www.nashuanh.gov/DocumentCenter/View/18496
 *  S6  Residential Plumbing Permit application — the fixture-count table this module's
 *      per-fixture rows are transcribed from.
 *      https://www.nashuanh.gov/DocumentCenter/View/18500
 *
 * **The mechanism.** Nashua does not price a permit from the value of the work. It prices it
 * from **measurements**: $0.18 per square foot for new residential area and $0.28 for
 * commercial, $9.50 for each residential plumbing fixture and $12.00 for each commercial
 * one, $1.00 for an outlet, $0.50 for each ampere of commercial service, $0.080 per square
 * foot of habitable area for a new dwelling's electrical system. On top of that every
 * application carries a **non-refundable application processing and review fee of $50.00** —
 * the same $50 across all four schedules, which is unusually simple — and every permit is
 * subject to a **$75.00 re-inspection fee** and to a **surcharge of 100% of the applicable
 * fee, capped at $275 residential and $750 commercial, where work began without a permit**.
 *
 * **Two things the schedules do that this module is careful to reproduce.**
 *
 *  - **The area rate applies to the area affected, not to the building.** §105-28A(2) says
 *    so in the words of the schedule: "New buildings, additions, alterations, mobile homes,
 *    in-ground swimming pools, basements, connecting structures, future expansion areas and
 *    areas capable of being used as living or occupiable space shall be included to
 *    calculate aggregate floor area". A 400 square foot addition to a 3,000 square foot
 *    house is charged on 400 square feet.
 *  - **Residential and commercial are separate tables, not one table with two columns.**
 *    The electrical schedule prices a commercial outlet at $1.00 and has no residential
 *    equivalent, because a residential electrical permit is priced from habitable area
 *    instead. Where a row like temporary service appears in both tables at the same $50.00,
 *    it is one rule here; where the same *name* appears at two prices, the row is gated to
 *    the occupancy the table it came from covers.
 *
 * **What is deliberately NOT here:**
 *
 *  - **The per-100-foot pipe rows.** Residential and commercial plumbing both price water
 *    pipes, drain/waste/vent pipes and storm drainage at $18.00 "per 100 feet or part
 *    thereof", and commercial plumbing prices roof drain and storm drainage piping at the
 *    same rate. The fee engine has no linear-measure basis, and adding one for a single
 *    city's pipe rows is not a change this dataset should make on its own; the rows are
 *    documented on the plumbing page and priced nowhere in this module. See
 *    PER_UNIT_KINDS/FEE_BASES in @/lib/calc/types for the additive way a future pass could
 *    do it.
 *  - **Demolition.** §105-28A(7) prices it at $40.00 up to 1,000 square feet and "$3.15 for
 *    each additional 100 square feet **or part thereof**". The round-up is the fee: a job
 *    1,001 square feet over the line pays $3.15 and a job 1,100 square feet pays $3.15,
 *    where a plain per-square-foot rate would charge 3 cents and 32 cents. There is no
 *    honest integer rate for it, so it is named rather than modelled.
 *  - **The discretionary minimums.** "Minimum fee for miscellaneous equipment (each) ...
 *    Residential: $30 / Commercial: $50" (§105-28A(11)) and its trade equivalents at
 *    $40.00, $45.00 and $50.00 exist where the Building Official judges them appropriate and
 *    are not attached to a scope of work, so they cannot be reached by a rule.
 *  - **The LEED reductions** in §105-28A(3): 5%, 10%, 15% and 20% off the building permit
 *    fee for certified, silver, gold and platinum. They are reductions conditional on a
 *    certification document rather than on a measurement, and modelling them would put a
 *    discount on a page whose reader has not proved the certification.
 *  - **Everything else in §105-28A**: moving a building from lot to lot ($200), the
 *    certificate of occupancy ($50), work not related to floor area (construction cost
 *    × $0.65 per $100), retaining walls ($0.15 or $0.30 per linear foot against a $25/$50
 *    minimum), phased construction (a 25% surcharge per upgrade phase) and the expedite
 *    service fee ($80 per hour per staff member, minimum $250 for weekends).
 *  - **Fire protection permits**, which are the Fire Marshal's under a different schedule
 *    (O-22-023) and are not Building Safety fees at all.
 *
 * **This module is the single definition of Nashua's fee rules.** The seed writes exactly
 * these records and the tests assert against exactly these records.
 */

/** §105-28's subsections A, B, C and D were last amended 3-9-2021 by Ord. No. O-21-045. */
export const NASHUA_FEE_EFFECTIVE_FROM = "2021-03-09";

export const NASHUA_CODE_FEES_SOURCE_KEY = "nashua-code-105-28";
export const NASHUA_ORDINANCE_SOURCE_KEY = "nashua-o-21-045";
export const NASHUA_PERMITS_PAGE_SOURCE_KEY = "nashua-permits-page";
export const NASHUA_COSTS_PAGE_SOURCE_KEY = "nashua-permits-required-cost";
export const NASHUA_ELECTRICAL_FORM_SOURCE_KEY = "nashua-electrical-permit-form";
export const NASHUA_PLUMBING_FORM_SOURCE_KEY = "nashua-plumbing-permit-form";

/** "A nonrefundable application processing and review fee shall be paid at the time of filing." */
export const NASHUA_APPLICATION_FEE_CENTS = 5_000;
/** "Reinspection of the same work ... : $75." */
export const NASHUA_REINSPECTION_FEE_CENTS = 7_500;
/** "Surcharge for permits issued after construction started without a permit." */
export const NASHUA_SURCHARGE_BPS = 10_000;
export const NASHUA_SURCHARGE_CAP_RESIDENTIAL_CENTS = 27_500;
export const NASHUA_SURCHARGE_CAP_COMMERCIAL_CENTS = 75_000;

export const NASHUA_BUILDING_NEW_RESIDENTIAL_CENTS_PER_SQ_FT = 18;
export const NASHUA_BUILDING_NEW_COMMERCIAL_CENTS_PER_SQ_FT = 28;
export const NASHUA_BUILDING_ALTERATION_RESIDENTIAL_CENTS_PER_SQ_FT = 13;
export const NASHUA_BUILDING_ALTERATION_COMMERCIAL_CENTS_PER_SQ_FT = 18;
export const NASHUA_PLAN_REVIEW_RESIDENTIAL_CENTS_PER_SQ_FT = 10;
export const NASHUA_PLAN_REVIEW_COMMERCIAL_CENTS_PER_SQ_FT = 15;
export const NASHUA_ELECTRICAL_AREA_CENTS_PER_SQ_FT = 8;
export const NASHUA_PLUMBING_RESIDENTIAL_FIXTURE_CENTS = 950;
export const NASHUA_PLUMBING_COMMERCIAL_FIXTURE_CENTS = 1_200;

const CODE = NASHUA_CODE_FEES_SOURCE_KEY;

function nashuaRule(
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
    effectiveFrom: NASHUA_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: CODE,
    ...overrides,
  };
}

/** Residential means a one- or two-family dwelling or a townhouse, as the schedule defines it. */
const RESIDENTIAL = { field: "occupancy", op: "eq", value: "residential" } as const;
/** Everything else is the commercial table, which the schedule says includes multifamily. */
const NON_RESIDENTIAL = { field: "occupancy", op: "neq", value: "residential" } as const;
/** §105-28A(4): alterations, repairs and fire damage are their own reduced rate. */
const ALTERATION = { field: "custom.building_alteration", op: "eq", value: true } as const;

/** The $50.00 application fee, charged on every application in all four schedules. */
function applicationFee(
  id: string,
  code: string,
  label: string,
  description: string,
): FeeRuleRecord {
  return nashuaRule({
    id,
    code,
    label,
    description,
    componentType: "other",
    feeType: "flat",
    config: { amountCents: NASHUA_APPLICATION_FEE_CENTS },
    priority: 50,
  });
}

/** Re-inspection at $75.00, identical in all four schedules. */
function reinspection(permitType: string): FeeRuleRecord {
  return nashuaRule({
    id: `nashua-${permitType}-reinspection`,
    code: `${permitType.toUpperCase()}-REINSPECTION`,
    label: "Re-inspection fee, $75.00",
    description:
      '§105-28: "Reinspection of the same work due to the failure to pass an initial inspection or the unavailability of the premises at the time of initial inspection: $75." The same figure in all four schedules.',
    componentType: "inspection",
    feeType: "flat",
    config: { amountCents: NASHUA_REINSPECTION_FEE_CENTS },
    conditions: { field: "custom.reinspection", op: "eq", value: true },
    priority: 800,
  });
}

/**
 * The surcharge for work started without a permit: 100% of the applicable fee, capped at
 * $275.00 residential and $750.00 commercial.
 *
 * It is priced against `fee_subtotal` — everything already charged on this permit, in
 * evaluation order — rather than against the base fee alone, because the schedule says
 * "100% of applicable fee" and a later-priority rule is what makes "already charged" mean
 * all of it. The cap is the rule's own `maximumCents`, which is the same mechanism Dallas
 * and Clark County use for a ceiling.
 */
function unpermittedSurcharge(
  suffix: string,
  label: string,
  capCents: number,
  occupancy: FeeRuleRecord["conditions"],
): FeeRuleRecord {
  return nashuaRule({
    id: `nashua-surcharge-${suffix}`,
    code: `SURCHARGE-UNPERMITTED-${suffix.toUpperCase()}`,
    label,
    description: `§105-28: "Surcharge for permits issued after construction started without a permit: 100% of applicable fee, but not to exceed $${(capCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}." Charged on what the permit has already been charged, and capped at the published ceiling.`,
    componentType: "surcharge",
    feeType: "percent",
    config: { basis: "fee_subtotal", rateBps: NASHUA_SURCHARGE_BPS },
    conditions: {
      all: [{ field: "custom.worked_without_permit", op: "eq", value: true }, occupancy],
    },
    maximumCents: capCents,
    priority: 900,
  });
}

/* -------------------------------------------------------------------------- */
/* A. Building permit fee schedule — §105-28A                                 */
/* -------------------------------------------------------------------------- */

/**
 * §105-28A(2)(a): "Residential, one- and two-family and townhouses (per square foot of
 * area affected): $0.18."
 *
 * "Area affected" is the phrase that matters. §105-28A(2) lists what counts — new
 * buildings, additions, alterations, mobile homes, in-ground swimming pools, basements,
 * connecting structures, future expansion areas and areas capable of being used as living
 * or occupiable space — and the rate is charged on that area, not on the whole building.
 */
export const NASHUA_BUILDING_NEW_RESIDENTIAL: FeeRuleRecord = nashuaRule({
  id: "nashua-bld-new-residential",
  code: "BLD-NEW-RESIDENTIAL",
  label: "Building permit — new residential area, $0.18 per sq ft",
  description:
    "§105-28A(2)(a) — residential, one- and two-family and townhouses, per square foot of area affected: $0.18. This is the rate for new work; alterations and repairs take the $0.13 rate in §105-28A(4)(a) instead.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: { numerator: NASHUA_BUILDING_NEW_RESIDENTIAL_CENTS_PER_SQ_FT, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: { all: [RESIDENTIAL, { not: ALTERATION }] },
});

/** §105-28A(2)(b): "Commercial, including multifamily (per square foot of area affected): $0.28." */
export const NASHUA_BUILDING_NEW_COMMERCIAL: FeeRuleRecord = nashuaRule({
  id: "nashua-bld-new-commercial",
  code: "BLD-NEW-COMMERCIAL",
  label: "Building permit — new commercial area, $0.28 per sq ft",
  description:
    "§105-28A(2)(b) — commercial, including multifamily, per square foot of area affected: $0.28. Multifamily being in this row rather than the residential one is the schedule's own choice and is stated on the page.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: { numerator: NASHUA_BUILDING_NEW_COMMERCIAL_CENTS_PER_SQ_FT, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: { all: [NON_RESIDENTIAL, { not: ALTERATION }] },
});

/** §105-28A(4)(a): "Residential (per square foot of area affected): $0.13." */
export const NASHUA_BUILDING_ALTERATION_RESIDENTIAL: FeeRuleRecord = nashuaRule({
  id: "nashua-bld-alteration-residential",
  code: "BLD-ALTERATION-RESIDENTIAL",
  label: "Building permit — residential alterations and repairs, $0.13 per sq ft",
  description:
    "§105-28A(4)(a) — alterations, repairs and fire damage, residential, per square foot of area affected: $0.13. Five cents a foot less than new residential work.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: {
      numerator: NASHUA_BUILDING_ALTERATION_RESIDENTIAL_CENTS_PER_SQ_FT,
      denominator: 1,
    },
    rateUnit: "currency_per_unit",
  },
  conditions: { all: [RESIDENTIAL, ALTERATION] },
});

/** §105-28A(4)(b): "Commercial (per square foot of area affected): $0.18." */
export const NASHUA_BUILDING_ALTERATION_COMMERCIAL: FeeRuleRecord = nashuaRule({
  id: "nashua-bld-alteration-commercial",
  code: "BLD-ALTERATION-COMMERCIAL",
  label: "Building permit — commercial alterations and repairs, $0.18 per sq ft",
  description:
    "§105-28A(4)(b) — alterations, repairs and fire damage, commercial, per square foot of area affected: $0.18.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: {
      numerator: NASHUA_BUILDING_ALTERATION_COMMERCIAL_CENTS_PER_SQ_FT,
      denominator: 1,
    },
    rateUnit: "currency_per_unit",
  },
  conditions: { all: [NON_RESIDENTIAL, ALTERATION] },
});

/**
 * §105-28A(5): "Additional plan review for minor modifications of previously approved
 * drawings, including commercial tenant fit-up" — $0.10 residential, $0.15 commercial, per
 * square foot of area affected.
 *
 * Kept apart from the permit rate rather than added into it: the schedule charges it as
 * additional plan review, and a permit that has already been reviewed once and comes back
 * with changes pays this and not the permit rate again.
 */
const ADDITIONAL_PLAN_REVIEW = {
  field: "custom.additional_plan_review",
  op: "eq",
  value: true,
} as const;

export const NASHUA_ADDITIONAL_PLAN_REVIEW: FeeRuleRecord[] = [
  nashuaRule({
    id: "nashua-bld-additional-plan-review-residential",
    code: "BLD-ADDITIONAL-PLAN-REVIEW-RES",
    label: "Additional plan review for minor modifications, residential",
    description:
      "§105-28A(5)(a) — additional plan review for minor modifications of previously approved drawings, including commercial tenant fit-up: residential, $0.10 per square foot of area affected.",
    componentType: "plan_review",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: NASHUA_PLAN_REVIEW_RESIDENTIAL_CENTS_PER_SQ_FT, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: { all: [RESIDENTIAL, ADDITIONAL_PLAN_REVIEW] },
    priority: 200,
  }),
  nashuaRule({
    id: "nashua-bld-additional-plan-review-commercial",
    code: "BLD-ADDITIONAL-PLAN-REVIEW-COM",
    label: "Additional plan review for minor modifications, commercial",
    description:
      "§105-28A(5)(b) — additional plan review for minor modifications of previously approved drawings, including commercial tenant fit-up: commercial, $0.15 per square foot of area affected.",
    componentType: "plan_review",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: NASHUA_PLAN_REVIEW_COMMERCIAL_CENTS_PER_SQ_FT, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: { all: [NON_RESIDENTIAL, ADDITIONAL_PLAN_REVIEW] },
    priority: 200,
  }),
];

export const NASHUA_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  applicationFee(
    "nashua-bld-application",
    "BLD-APPLICATION-FEE",
    "Building permit application fee, $50.00",
    "§105-28A(1)(a) — a nonrefundable application processing and review fee shall be paid at the time of filing of any application: building permit, $50.00.",
  ),
  NASHUA_BUILDING_NEW_RESIDENTIAL,
  NASHUA_BUILDING_NEW_COMMERCIAL,
  NASHUA_BUILDING_ALTERATION_RESIDENTIAL,
  NASHUA_BUILDING_ALTERATION_COMMERCIAL,
  ...NASHUA_ADDITIONAL_PLAN_REVIEW,
  reinspection("building"),
  unpermittedSurcharge(
    "residential",
    "Surcharge for work started without a permit, residential (100%, capped at $275.00)",
    NASHUA_SURCHARGE_CAP_RESIDENTIAL_CENTS,
    RESIDENTIAL,
  ),
  unpermittedSurcharge(
    "commercial",
    "Surcharge for work started without a permit, commercial (100%, capped at $750.00)",
    NASHUA_SURCHARGE_CAP_COMMERCIAL_CENTS,
    NON_RESIDENTIAL,
  ),
];

/* -------------------------------------------------------------------------- */
/* C. Electrical permit fee schedule — §105-28C                               */
/* -------------------------------------------------------------------------- */

/**
 * §105-28C(1)(b): "New construction, additions, renovations (per square feet of habitable
 * area): $0.080."
 *
 * The residential electrical schedule is priced by habitable area where the residential
 * *building* schedule is priced by area affected — two different measurements of the same
 * house on two permits, at $0.18 and $0.080.
 */
export const NASHUA_ELECTRICAL_RESIDENTIAL_AREA: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-residential-area",
  code: "ELEC-RES-AREA",
  label: "Electrical permit — new residential construction, $0.080 per sq ft",
  description:
    "§105-28C(1)(b) — new construction, additions and renovations, per square foot of habitable area: $0.080. Charged on the habitable area rather than on the area affected, which is the building schedule's measurement.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: { numerator: NASHUA_ELECTRICAL_AREA_CENTS_PER_SQ_FT, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [RESIDENTIAL, { field: "custom.electrical_new_construction", op: "eq", value: true }],
  },
});

/** §105-28C(1)(j): "Low-voltage wiring (per square feet of work area): $0.080." */
export const NASHUA_ELECTRICAL_LOW_VOLTAGE: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-low-voltage",
  code: "ELEC-LOW-VOLTAGE",
  label: "Electrical permit — low-voltage wiring, $0.080 per sq ft",
  description:
    "§105-28C(1)(j) — low-voltage wiring, per square foot of work area: $0.080. Residential only, and priced on the work area rather than on the habitable area the new-construction row uses.",
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: { numerator: NASHUA_ELECTRICAL_AREA_CENTS_PER_SQ_FT, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [RESIDENTIAL, { field: "custom.low_voltage", op: "eq", value: true }],
  },
});

/** §105-28C(1)(c): "House meter: $55." */
export const NASHUA_ELECTRICAL_HOUSE_METER: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-house-meter",
  code: "ELEC-HOUSE-METER",
  label: "Electrical permit — house meter, $55.00",
  description:
    "§105-28C(1)(c) — house meter: $55.00. The form asks for an Eversource work order number beside the row.",
  feeType: "flat",
  config: { amountCents: 5_500 },
  conditions: {
    all: [RESIDENTIAL, { field: "custom.house_meter", op: "eq", value: true }],
  },
});

/** §105-28C(1)(f): "Adding or relocating meter(s): $55." */
export const NASHUA_ELECTRICAL_METER_WORK: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-meter-work",
  code: "ELEC-METER-WORK",
  label: "Electrical permit — adding or relocating a meter, $55.00",
  description: "§105-28C(1)(f) — adding or relocating meter(s): $55.00.",
  feeType: "flat",
  config: { amountCents: 5_500 },
  conditions: {
    all: [RESIDENTIAL, { field: "custom.meter_work", op: "eq", value: true }],
  },
});

/** §105-28C(1)(g): "Pools (in-ground): $60." */
export const NASHUA_ELECTRICAL_POOL: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-pool",
  code: "ELEC-POOL",
  label: "Electrical permit — in-ground pool, $60.00",
  description:
    "§105-28C(1)(g) — pools (in-ground): $60.00. The building schedule also counts a pool's area as area affected, so a new pool carries both permits.",
  feeType: "flat",
  config: { amountCents: 6_000 },
  conditions: { all: [RESIDENTIAL, { field: "custom.pool", op: "eq", value: true }] },
});

/**
 * §105-28C(1)(d): "Service change: up to two units $55.00, each additional unit $20.00."
 * A base with an allowance again — and the allowance is two units, not one.
 */
export const NASHUA_ELECTRICAL_SERVICE_CHANGE: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-service-change",
  code: "ELEC-SERVICE-CHANGE",
  label: "Electrical permit — service change, by dwelling unit",
  description:
    "§105-28C(1)(d) — service change: up to two units $55.00, each additional unit $20.00. Modelled as a base covering the first two units plus a per-unit rate above them, so a four-unit building is $95.00 rather than $110.00.",
  feeType: "per_unit",
  config: { unit: "dwelling_units", baseCents: 5_500, thresholdUnits: 2, centsPerUnit: 2_000 },
  conditions: {
    all: [RESIDENTIAL, { field: "custom.service_change", op: "eq", value: true }],
  },
});

/** §105-28C(1)(e): "Adding subpanel(s) (each): $30." */
export const NASHUA_ELECTRICAL_SUBPANEL: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-subpanel",
  code: "ELEC-SUBPANEL",
  label: "Electrical permit — subpanel, $30.00 each",
  description: "§105-28C(1)(e) — adding subpanel(s), each: $30.00.",
  feeType: "per_unit",
  config: { unit: "panels", centsPerUnit: 3_000 },
  conditions: { all: [RESIDENTIAL, { field: "custom.panels", op: "exists" }] },
});

/** §105-28C(1)(h) and §105-28C(2)(c): "Temporary service (each): $50." in both tables. */
export const NASHUA_ELECTRICAL_TEMPORARY_SERVICE: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-temporary-service",
  code: "ELEC-TEMPORARY-SERVICE",
  label: "Electrical permit — temporary service, $50.00",
  description:
    "§105-28C(1)(h) and §105-28C(2)(c) — temporary service, each: $50.00. The one row that appears at the same price in both the residential and the commercial table, so it carries no occupancy condition.",
  feeType: "flat",
  config: { amountCents: 5_000 },
  conditions: { field: "custom.temporary_service", op: "eq", value: true },
});

/**
 * §105-28C(1)(b)[1]: "Service entrance (new dwelling only): $35." — and the commercial
 * equivalent, §105-28C(2)(b), is a rate: "Electrical service entrance and service change
 * (per amp): $0.50."
 *
 * The two are the clearest illustration of how the two tables differ. A new 200-ampere
 * service on a house is $35.00; the same 200 amperes on a commercial building is $100.00.
 */
export const NASHUA_ELECTRICAL_SERVICE_ENTRANCE: FeeRuleRecord[] = [
  nashuaRule({
    id: "nashua-elec-res-service-entrance",
    code: "ELEC-RES-SERVICE-ENTRANCE",
    label: "Electrical permit — residential service entrance, $35.00",
    description: "§105-28C(1)(b)[1] — service entrance, new dwelling only: $35.00.",
    feeType: "flat",
    config: { amountCents: 3_500 },
    conditions: {
      all: [RESIDENTIAL, { field: "custom.service_entrance", op: "eq", value: true }],
    },
  }),
  nashuaRule({
    id: "nashua-elec-com-service-entrance",
    code: "ELEC-COM-SERVICE-ENTRANCE",
    label: "Electrical permit — commercial service entrance, $0.50 per ampere",
    description:
      "§105-28C(2)(b) — electrical service entrance and service change, per amp: $0.50. Priced on the amperage of the service rather than on the cost of the work, which is what makes a commercial service upgrade cheap against a commercial fit-out.",
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 50, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [NON_RESIDENTIAL, { field: "custom.service_entrance", op: "eq", value: true }],
    },
  }),
];

/** §105-28C(2)(d): "Panels and subpanels (each): $30." */
export const NASHUA_ELECTRICAL_COMMERCIAL_PANELS: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-com-panels",
  code: "ELEC-COM-PANELS",
  label: "Electrical permit — commercial panels and subpanels, $30.00 each",
  description: "§105-28C(2)(d) — panels and subpanels, each: $30.00.",
  feeType: "per_unit",
  config: { unit: "panels", centsPerUnit: 3_000 },
  conditions: { all: [NON_RESIDENTIAL, { field: "custom.panels", op: "exists" }] },
});

/**
 * §105-28C(2)(e)[1] and [2]: "For switches, receptacles, and fire and smoke detectors (each):
 * $1" and "For lighting and lighting fixtures ... (each): $1".
 *
 * Two rows at the same rate, and they are kept apart because they count different things —
 * an outlet and a fixture are different units, and the low-voltage points Clark County
 * needed are a third. The counts are separate custom facts for exactly that reason.
 */
export const NASHUA_ELECTRICAL_COMMERCIAL_POINTS: FeeRuleRecord[] = [
  nashuaRule({
    id: "nashua-elec-com-outlets",
    code: "ELEC-COM-OUTLETS",
    label: "Electrical permit — commercial outlets, $1.00 each",
    description:
      "§105-28C(2)(e)[1] — for switches, receptacles, and fire and smoke detectors, each: $1.00.",
    feeType: "per_unit",
    config: { unit: "outlets", centsPerUnit: 100 },
    conditions: { all: [NON_RESIDENTIAL, { field: "custom.outlets", op: "exists" }] },
  }),
  nashuaRule({
    id: "nashua-elec-com-lighting",
    code: "ELEC-COM-LIGHTING",
    label: "Electrical permit — commercial lighting fixtures, $1.00 each",
    description:
      "§105-28C(2)(e)[2] — for lighting and lighting fixtures, each: $1.00, where \"each four feet of continuous fluorescent lighting shall be deemed a separate lighting fixture\". The conversion is the filer's to make; the site charges the fixture count it is given.",
    feeType: "per_unit",
    config: { unit: "lighting_fixtures", centsPerUnit: 100 },
    conditions: {
      all: [NON_RESIDENTIAL, { field: "custom.lighting_fixtures", op: "exists" }],
    },
  }),
];

/** §105-28C(2)(i) and (n): "Water heaters (each): $15" and "Signs (each): $35". */
export const NASHUA_ELECTRICAL_COMMERCIAL_EQUIPMENT: FeeRuleRecord[] = [
  nashuaRule({
    id: "nashua-elec-com-water-heaters",
    code: "ELEC-COM-WATER-HEATERS",
    label: "Electrical permit — commercial electric water heaters, $15.00 each",
    description:
      "§105-28C(2)(i) — water heaters, each: $15.00. The electrical row, which is separate from the plumbing schedule's own electric water heater row at $25.00 commercial: an electric water heater carries both permits.",
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 1_500 },
    conditions: { all: [NON_RESIDENTIAL, { field: "custom.heaters", op: "exists" }] },
  }),
  nashuaRule({
    id: "nashua-elec-com-signs",
    code: "ELEC-COM-SIGNS",
    label: "Electrical permit — illuminated signs, $35.00 each",
    description:
      "§105-28C(2)(n) — signs, each: $35.00. The City's permits page notes that \"internally and externally illuminated signs also require an Electrical Permit\", so this is the second permit an illuminated sign carries.",
    feeType: "per_unit",
    config: { unit: "signs", centsPerUnit: 3_500 },
    conditions: { all: [NON_RESIDENTIAL, { field: "custom.signs", op: "exists" }] },
  }),
];

/**
 * §105-28C(2)(r): "Annual permit fee: $300.00."
 *
 * In lieu of an individual permit for each alteration to an approved electrical
 * installation, for a firm regularly employing one or more certified electricians on
 * premises it owns or operates. It is the only fee in the schedule that replaces others
 * rather than adding to them, so it is a rule of its own and unconditional on any count.
 */
export const NASHUA_ELECTRICAL_ANNUAL_PERMIT: FeeRuleRecord = nashuaRule({
  id: "nashua-elec-annual-permit",
  code: "ELEC-ANNUAL-PERMIT",
  label: "Electrical permit — annual permit, $300.00",
  description:
    '§105-28C(2)(r) — annual permit fee: $300.00, issued "in lieu of an individual permit for each alteration to an already approved electrical installation" to a firm regularly employing one or more certified electricians on premises it owns or operates, against a detailed record of every alteration kept for the Code Official.',
  feeType: "flat",
  config: { amountCents: 30_000 },
  conditions: {
    all: [NON_RESIDENTIAL, { field: "custom.annual_permit", op: "eq", value: true }],
  },
});

export const NASHUA_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  applicationFee(
    "nashua-elec-application",
    "ELEC-APPLICATION-FEE",
    "Electrical permit application fee, $50.00",
    "§105-28C(1)(a) and §105-28C(2)(a) — a nonrefundable application processing and review fee, $50.00, in both the residential and the commercial table.",
  ),
  NASHUA_ELECTRICAL_RESIDENTIAL_AREA,
  NASHUA_ELECTRICAL_LOW_VOLTAGE,
  NASHUA_ELECTRICAL_HOUSE_METER,
  NASHUA_ELECTRICAL_METER_WORK,
  NASHUA_ELECTRICAL_POOL,
  NASHUA_ELECTRICAL_SERVICE_CHANGE,
  NASHUA_ELECTRICAL_SUBPANEL,
  NASHUA_ELECTRICAL_TEMPORARY_SERVICE,
  ...NASHUA_ELECTRICAL_SERVICE_ENTRANCE,
  NASHUA_ELECTRICAL_COMMERCIAL_PANELS,
  ...NASHUA_ELECTRICAL_COMMERCIAL_POINTS,
  ...NASHUA_ELECTRICAL_COMMERCIAL_EQUIPMENT,
  NASHUA_ELECTRICAL_ANNUAL_PERMIT,
  reinspection("electrical"),
  unpermittedSurcharge(
    "electrical-residential",
    "Surcharge for work started without a permit, residential (100%, capped at $275.00)",
    NASHUA_SURCHARGE_CAP_RESIDENTIAL_CENTS,
    RESIDENTIAL,
  ),
  unpermittedSurcharge(
    "electrical-commercial",
    "Surcharge for work started without a permit, commercial (100%, capped at $750.00)",
    NASHUA_SURCHARGE_CAP_COMMERCIAL_CENTS,
    NON_RESIDENTIAL,
  ),
];

/* -------------------------------------------------------------------------- */
/* D. Plumbing permit fee schedule — §105-28D                                 */
/* -------------------------------------------------------------------------- */

/**
 * §105-28D(1)(b): "Per fixture or fixture connection (tub, shower, sink, water closet,
 * lavatory, dishwasher, outside faucet, clothes-washing machine, backflow preventer, etc.):
 * $9.50" — and §105-28D(2)(b), the commercial table, at $12.00.
 *
 * This is the row a Nashua plumbing permit is mostly made of, and the two rates are the
 * reason a reader has to know which table their job is in before multiplying anything.
 */
export const NASHUA_PLUMBING_RESIDENTIAL_FIXTURES: FeeRuleRecord = nashuaRule({
  id: "nashua-plumb-res-fixtures",
  code: "PLUMB-RES-FIXTURES",
  label: "Plumbing permit — residential fixtures, $9.50 each",
  description:
    "§105-28D(1)(b) — per fixture or fixture connection (tub, shower, sink, water closet, lavatory, dishwasher, outside faucet, clothes-washing machine, backflow preventer, etc.): $9.50. Charged per fixture, which is what makes this schedule's plumbing permit grow with the number of fixtures rather than with the cost of the work.",
  feeType: "per_unit",
  config: { unit: "fixtures", centsPerUnit: NASHUA_PLUMBING_RESIDENTIAL_FIXTURE_CENTS },
  // `fixtures` is an engine fact of its own rather than a `custom.*` key, because a fixture
  // count is shared vocabulary across every jurisdiction in the dataset; it is read and
  // conditioned on top-level.
  conditions: { all: [RESIDENTIAL, { field: "fixtures", op: "exists" }] },
});

export const NASHUA_PLUMBING_COMMERCIAL_FIXTURES: FeeRuleRecord = nashuaRule({
  id: "nashua-plumb-com-fixtures",
  code: "PLUMB-COM-FIXTURES",
  label: "Plumbing permit — commercial fixtures, $12.00 each",
  description:
    "§105-28D(2)(b) — per fixture (tub, shower, sink, water closet, lavatory, floor drain, drinking fountain, urinal, dishwasher, garbage grinder, outside faucet, clothes-washing machine, washdown station, etc.): $12.00. The commercial list is longer than the residential one and includes floor drains and washdown stations.",
  feeType: "per_unit",
  config: { unit: "fixtures", centsPerUnit: NASHUA_PLUMBING_COMMERCIAL_FIXTURE_CENTS },
  conditions: { all: [NON_RESIDENTIAL, { field: "fixtures", op: "exists" }] },
});

/** §105-28D(1)(d) and §105-28D(2)(e): electric water heaters, $18.00 residential and $25.00 commercial. */
export const NASHUA_PLUMBING_WATER_HEATERS: FeeRuleRecord[] = [
  nashuaRule({
    id: "nashua-plumb-res-water-heaters",
    code: "PLUMB-RES-WATER-HEATERS",
    label: "Plumbing permit — electric water heaters, $18.00 each",
    description:
      "§105-28D(1)(d) — electric water heaters, each: $18.00. The form says \"Electric Only\" against the row.",
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 1_800 },
    conditions: { all: [RESIDENTIAL, { field: "custom.heaters", op: "exists" }] },
  }),
  nashuaRule({
    id: "nashua-plumb-com-water-heaters",
    code: "PLUMB-COM-WATER-HEATERS",
    label: "Plumbing permit — commercial electric water heaters, $25.00 each",
    description: "§105-28D(2)(e) — electric water heaters, each: $25.00.",
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 2_500 },
    conditions: { all: [NON_RESIDENTIAL, { field: "custom.heaters", op: "exists" }] },
  }),
];

/** §105-28D(1)(f): "Sanitary sewer connection or repair: $35." */
export const NASHUA_PLUMBING_RESIDENTIAL_SEWER: FeeRuleRecord = nashuaRule({
  id: "nashua-plumb-res-sewer",
  code: "PLUMB-RES-SEWER-CONNECTION",
  label: "Plumbing permit — sanitary sewer connection or repair, $35.00",
  description:
    "§105-28D(1)(f) — sanitary sewer connection or repair: $35.00, residential. The commercial table prices the same work at $18.00, and the difference is the schedule's rather than a transcription error.",
  feeType: "flat",
  config: { amountCents: 3_500 },
  conditions: {
    all: [RESIDENTIAL, { field: "custom.sewer_connection", op: "eq", value: true }],
  },
});

/** §105-28D(2)(d): "Grease interceptor: $30." */
export const NASHUA_PLUMBING_COMMERCIAL_GREASE: FeeRuleRecord = nashuaRule({
  id: "nashua-plumb-com-grease-interceptor",
  code: "PLUMB-COM-GREASE-INTERCEPTOR",
  label: "Plumbing permit — grease interceptor, $30.00",
  description:
    "§105-28D(2)(d) — grease interceptor: $30.00. A commercial row with no residential equivalent, which is what a restaurant fit-out pays that a house does not.",
  feeType: "flat",
  config: { amountCents: 3_000 },
  conditions: {
    all: [NON_RESIDENTIAL, { field: "custom.grease_interceptor", op: "eq", value: true }],
  },
});

/** §105-28D(2)(f): "Irrigation system (includes backflow preventer): $20." */
export const NASHUA_PLUMBING_COMMERCIAL_IRRIGATION: FeeRuleRecord = nashuaRule({
  id: "nashua-plumb-com-irrigation",
  code: "PLUMB-COM-IRRIGATION",
  label: "Plumbing permit — irrigation system, $20.00",
  description:
    "§105-28D(2)(f) — irrigation system (includes backflow preventer): $20.00. The parenthetical is the point: the backflow preventer is inside this fee rather than charged again under (g).",
  feeType: "flat",
  config: { amountCents: 2_000 },
  conditions: {
    all: [NON_RESIDENTIAL, { field: "custom.irrigation_system", op: "eq", value: true }],
  },
});

/**
 * §105-28D(2)(g): a backflow preventer, $16.00 each, for all four kinds the schedule names —
 * atmospheric vacuum breakers, pressure vacuum breakers, dual check valves and
 * reduced-pressure principle assemblies. One rate, four devices.
 */
export const NASHUA_PLUMBING_COMMERCIAL_BACKFLOW: FeeRuleRecord = nashuaRule({
  id: "nashua-plumb-com-backflow",
  code: "PLUMB-COM-BACKFLOW-PREVENTER",
  label: "Plumbing permit — backflow preventer, $16.00 each",
  description:
    "§105-28D(2)(g) — backflow preventer, each: atmospheric vacuum breakers $16.00, pressure vacuum breakers $16.00, dual check valve $16.00, reduced-pressure principle $16.00. Four named devices at one rate, counted as one kind.",
  feeType: "per_unit",
  config: { unit: "backflow_devices", centsPerUnit: 1_600 },
  conditions: {
    all: [NON_RESIDENTIAL, { field: "custom.backflow_devices", op: "exists" }],
  },
});

export const NASHUA_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  applicationFee(
    "nashua-plumb-application",
    "PLUMB-APPLICATION-FEE",
    "Plumbing permit application fee, $50.00",
    "§105-28D(1)(a) and §105-28D(2)(a) — a nonrefundable application processing and review fee, $50.00, in both the residential and the commercial table. Every trade form in Nashua prints it as the first line.",
  ),
  NASHUA_PLUMBING_RESIDENTIAL_FIXTURES,
  NASHUA_PLUMBING_COMMERCIAL_FIXTURES,
  ...NASHUA_PLUMBING_WATER_HEATERS,
  NASHUA_PLUMBING_RESIDENTIAL_SEWER,
  NASHUA_PLUMBING_COMMERCIAL_GREASE,
  NASHUA_PLUMBING_COMMERCIAL_IRRIGATION,
  NASHUA_PLUMBING_COMMERCIAL_BACKFLOW,
  reinspection("plumbing"),
  unpermittedSurcharge(
    "plumbing-residential",
    "Surcharge for work started without a permit, residential (100%, capped at $275.00)",
    NASHUA_SURCHARGE_CAP_RESIDENTIAL_CENTS,
    RESIDENTIAL,
  ),
  unpermittedSurcharge(
    "plumbing-commercial",
    "Surcharge for work started without a permit, commercial (100%, capped at $750.00)",
    NASHUA_SURCHARGE_CAP_COMMERCIAL_CENTS,
    NON_RESIDENTIAL,
  ),
];
