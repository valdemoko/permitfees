import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Scottsdale fee rules — REAL DATA.
 *
 * Sources (research/arizona/scottsdale.md records every document, with the URL,
 * the retrieval method and the hash of each file):
 *
 *  S1  City of Scottsdale, "Permit Fee Schedule — Residential" and "— Commercial",
 *      Exhibit A, effective 1 July 2026, adopted by Resolution No. 13661.
 *      https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/planning---develpment/fees-fy26-27/permit-fee-schedule---residential.pdf?sfvrsn=3330d226_1
 *      https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/planning---develpment/fees-fy26-27/permit-fee-schedule---commercial.pdf?sfvrsn=913d3970_1
 *
 *  S2  City of Scottsdale, "Plan Review Fee Schedule — Residential" and "—
 *      Commercial", Exhibit A, effective 1 July 2026, same resolution.
 *      https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/planning---develpment/fees-fy26-27/plan-review-fee-schedule---residential.pdf?sfvrsn=6e283610_1
 *      https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/planning---develpment/fees-fy26-27/plan-review-fee-schedule---commercial.pdf?sfvrsn=111251c6_1
 *
 *  S3  City of Scottsdale, "Permit Fee Schedule — Miscellaneous", Exhibit A, same
 *      resolution — cited for the fees this module names and does not model.
 *      https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/planning---develpment/fees-fy26-27/permit-fee-schedule---miscellaneous.pdf?sfvrsn=bcebac04_1
 *
 * Scottsdale's mechanism is a third distinct shape, and a simpler one than either
 * Texas city's: **a flat base fee plus a rate on each of two different areas.**
 *
 *   Permit fee  : $237 + $0.94/sq ft of area with A/C + $0.54/sq ft of covered area
 *   Plan review :        $0.54/sq ft of area with A/C + $0.34/sq ft of covered area
 *
 * The two-area structure is why the engine gained a second area basis, and the
 * reason is not cosmetic. A building is charged once for the part that is
 * air-conditioned and again, at a different rate, for the part that is roofed but
 * not air-conditioned. Sharing one `square_footage` input between the two would
 * charge a single entered number twice, at two rates — exactly the class of mistake
 * this engine exists to make impossible. See `FEE_BASES` in `@/lib/calc/types`.
 *
 * **Residential and commercial publish the same rates.** The residential schedule
 * says "Livable area with A/C $0.94 sq. ft." and the commercial one says "Area with
 * A/C $0.94 sq. ft."; the area pairs behind both permit schedules and both plan
 * review schedules are identical in every row modelled here. So there is deliberately
 * no occupancy condition anywhere in this module: one rule set describes both, which
 * is what the City publishes.
 *
 * THE TWO SHAPES MODELLED
 *
 *   1. **New work and additions** (residential "Single Family Custom" and
 *      "Single Family Addition"; commercial "Commercial Building Permit" and
 *      "Commercial Addition") — the full area rates.
 *   2. **Remodels and tenant improvements** — the same $237 base and the same
 *      covered-area rate, but the area-with-A/C rate is multiplied by the percentage
 *      the schedule prints beside it: `$0.94 sq. ft. x 30%`, which is `$0.282` a
 *      square foot. Plan review repeats the pattern at `$0.54 sq. ft. x 30%`, which
 *      is `$0.162`, and — this is the part worth noticing — the residential and
 *      commercial remodel rows both price **only the area with A/C** in plan review,
 *      with no covered-area line at all. That asymmetry is the City's, not an
 *      omission here: a remodel pays plan review on its conditioned area only.
 *
 *      30% is the same figure in every remodel row the City publishes: single family
 *      remodel, commercial remodel (existing), commercial T.I. (new) and multi-family
 *      build out, and commercial vanilla shell T.I. So one pair of rules covers all
 *      of them without an occupancy condition.
 *
 * SCOPE — what is deliberately NOT modelled, and why:
 *
 *  - **The 70% roof-modification remodel, the 95% shell-only row, the 25% foundation
 *    row and the <500 sq ft addition row.** Each scales the same two rates by a
 *    percentage the schedule prints — `$0.94 sq. ft. x 70%` — and each is a separate
 *    roof of work with its own base treatment. Modelling them is a separate piece of
 *    work rather than a line in this one, and the page names every one of them and
 *    states that they are not estimated. The 95% shell row is priced off "Area with
 *    A/C" even though the building has none, so its input is the area with A/C by the
 *    schedule's own wording, not the covered area.
 *  - Because of that, a rule here never fires on work it does not describe: a
 *    roof-modification or shell-only project entered against these rules produces no
 *    area fee at all and the engine says why, rather than quietly charging the
 *    new-construction rate on work the schedule prices differently.
 *  - **Everything charged alongside a building permit**, all of it published in the
 *    same Exhibit A: certificate of occupancy and certificate of shell $195, GIS fee
 *    $379, lowest floor certificate review $363, standard-plan administrative site
 *    review 15% of the square-footage fee, pools and attached spas $0.61 a square foot
 *    plus the $237 base and a $195 planning inspection fee, stand-alone spas $142,
 *    demolition $379 ($121 for a pool), plan review extension $379,
 *    after-the-third-review review at 50% of the original fee, engineering review per
 *    sheet at $1,057 and $363, and miscellaneous reviews at $121 an hour. None is
 *    modelled, and none is estimated.
 *
 * THE TRADE RULES AT THE BOTTOM OF THIS FILE
 *
 * The same Exhibit A prices a handful of trade permits flat, in the Miscellaneous
 * schedule, and those are what Scottsdale's electrical and plumbing pages are built
 * on: water heaters $63 (solar ones $90), residential solar $168, a temporary power
 * pole $121, a re-inspection $121, and the $121 minimum for a permit covering a single
 * discipline. They are modelled below as **alternatives to one another and never as a
 * sum**, because the schedule lists them as separate permit fees and does not say how
 * they combine — the reasoning is at `SCOTTSDALE_TRADE_MINIMUM` and in
 * research/arizona/scottsdale.md § 5.5.
 *
 * Two figures are still deliberately absent from the arithmetic. The **$237 base fee**
 * and the **area rates** do not belong to a stand-alone trade permit: they price
 * construction. And the **$379 combination minimum** is not computed here, because it
 * is a floor on the permit that covers every discipline — which is the building permit,
 * whose fee is published in full in another schedule and computed on the building page.
 */

/** Resolution No. 13661; the FY 26/27 schedules took effect 1 July 2026. */
export const SCOTTSDALE_FEE_EFFECTIVE_FROM = "2026-07-01";

/**
 * Source keys, and they name individual DOCUMENTS rather than categories.
 *
 * The City publishes four permit schedules and four plan review schedules for the
 * same year, so "the Scottsdale fee schedule" does not identify a file. Each key
 * below is one PDF, and `./index.ts` keys its source rows the same way, which is
 * what lets a rule's `sourceId` resolve to the document the figure was read from.
 * The residential and commercial documents publish the same rates; a rule cites one
 * and the other is cited by a requirement, so both appear on the page.
 */
export const SCOTTSDALE_PERMIT_SOURCE_KEY = "scottsdale-permit-fee-schedule-residential";
export const SCOTTSDALE_PLAN_REVIEW_SOURCE_KEY =
  "scottsdale-plan-review-fee-schedule-residential";
export const SCOTTSDALE_MISC_SOURCE_KEY = "scottsdale-misc-fee-schedule";

const SOURCE = SCOTTSDALE_PERMIT_SOURCE_KEY;

function scottsdaleRule(
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
    effectiveFrom: SCOTTSDALE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

const NEW_WORK: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["new_construction", "addition"],
};

const REMODEL: FeeCondition = { field: "work_type", op: "eq", value: "remodel" };

/**
 * A rate published as an amount per square foot of one of the two areas.
 *
 * `currency_per_unit` is what makes the rule read as `$0.94 per sq ft` rather than
 * as `94% of a square foot`; see `ExactRateUnit` in `@/lib/calc/types`.
 *
 * The basis is a required argument rather than a default, and that is deliberate.
 * A default would have let the five covered-area rules read the area with A/C while
 * looking correct, which changes the fee: 400 square feet of covered patio would
 * have been charged 1,200 square feet of conditioned floor area at $0.54 in the
 * remodel case. The type system cannot tell the two areas apart — both are square
 * feet — so the test that asserts which basis each rule reads is the guard.
 */
function perSquareFoot(
  basis: "square_footage" | "covered_square_footage",
  cents: number,
  denominator = 1,
): Pick<FeeRuleRecord, "feeType" | "config"> {
  return {
    feeType: "percent",
    config: {
      basis,
      rate: { numerator: cents, denominator },
      rateUnit: "currency_per_unit",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Permit fee                                                                  */
/* -------------------------------------------------------------------------- */

export const SCOTTSDALE_PERMIT_BASE: FeeRuleRecord = scottsdaleRule({
  id: "sc-permit-base",
  code: "PERMIT-BASE",
  label: "Building permit base fee",
  description:
    'Permit Fee Schedule, Exhibit A — "Base fee $237", charged once on the permit before either area rate. It is the same base under the remodel and tenant-improvement rows as under new construction.',
  feeType: "flat",
  config: { amountCents: 23_700 },
  conditions: {
    field: "work_type",
    op: "in",
    value: ["new_construction", "addition", "remodel"],
  },
  priority: 100,
});

export const SCOTTSDALE_PERMIT_AREA_WITH_AC: FeeRuleRecord = scottsdaleRule({
  id: "sc-permit-ac",
  code: "PERMIT-AC-AREA",
  label: "Building permit — area with A/C",
  description:
    'Permit Fee Schedule — "$0.94 sq. ft." against the area with A/C, which the residential schedule calls "livable area with A/C" and the commercial one calls "area with A/C". The rate applies to the whole area, not to a band of it.',
  ...perSquareFoot("square_footage", 94),
  conditions: { all: [NEW_WORK, { field: "square_footage", op: "exists" }] },
  priority: 110,
});

export const SCOTTSDALE_PERMIT_AREA_WITH_AC_REMODEL: FeeRuleRecord = scottsdaleRule({
  id: "sc-permit-ac-remodel",
  code: "PERMIT-AC-REMODEL",
  label: "Building permit — area with A/C, remodel or tenant improvement",
  description:
    'Permit Fee Schedule — "$0.94 sq. ft. x 30%", which is $0.282 a square foot. The same 30% is printed beside every remodel and tenant-improvement row in both the residential and the commercial schedule, and the base fee beside it is unchanged at $237.',
  ...perSquareFoot("square_footage", 282, 10),
  conditions: { all: [REMODEL, { field: "square_footage", op: "exists" }] },
  priority: 115,
});

export const SCOTTSDALE_PERMIT_COVERED_AREA: FeeRuleRecord = scottsdaleRule({
  id: "sc-permit-covered",
  code: "PERMIT-COVERED-AREA",
  label: "Building permit — covered area without A/C",
  description:
    'Permit Fee Schedule — "$0.54 sq. ft." against the covered area that is not air-conditioned. It is a second area charged on its own, not a discount on the first. The remodel rows print this rate unscaled, which is why the rule applies to remodels too.',
  ...perSquareFoot("covered_square_footage", 54),
  conditions: {
    all: [
      { field: "work_type", op: "in", value: ["new_construction", "addition", "remodel"] },
      { field: "custom.covered_square_footage", op: "exists" },
    ],
  },
  priority: 120,
});

/* -------------------------------------------------------------------------- */
/* Plan review                                                                 */
/* -------------------------------------------------------------------------- */

export const SCOTTSDALE_PLAN_REVIEW_AREA_WITH_AC: FeeRuleRecord = scottsdaleRule({
  id: "sc-plan-review-ac",
  code: "REVIEW-AC-AREA",
  label: "Plan review — area with A/C",
  description:
    'Plan Review Fee Schedule — "$0.54 sq. ft." against the area with A/C, published identically for single family custom homes, single family additions, commercial, commercial additions and apartments/condos.',
  componentType: "plan_review",
  sourceId: SCOTTSDALE_PLAN_REVIEW_SOURCE_KEY,
  ...perSquareFoot("square_footage", 54),
  conditions: { all: [NEW_WORK, { field: "square_footage", op: "exists" }] },
  priority: 200,
});

export const SCOTTSDALE_PLAN_REVIEW_AREA_WITH_AC_REMODEL: FeeRuleRecord = scottsdaleRule({
  id: "sc-plan-review-ac-remodel",
  code: "REVIEW-AC-REMODEL",
  label: "Plan review — area with A/C, remodel or tenant improvement",
  description:
    'Plan Review Fee Schedule — "$0.54 sq. ft. x 30%", which is $0.162 a square foot, under both "Single Family Remodel" and "Commercial Remodel / Tenant Improvement". Neither row prices a covered area, so a remodel is reviewed on its conditioned area only.',
  componentType: "plan_review",
  sourceId: SCOTTSDALE_PLAN_REVIEW_SOURCE_KEY,
  ...perSquareFoot("square_footage", 162, 10),
  conditions: { all: [REMODEL, { field: "square_footage", op: "exists" }] },
  priority: 205,
});

export const SCOTTSDALE_PLAN_REVIEW_COVERED_AREA: FeeRuleRecord = scottsdaleRule({
  id: "sc-plan-review-covered",
  code: "REVIEW-COVERED-AREA",
  label: "Plan review — covered area without A/C",
  description:
    'Plan Review Fee Schedule — "$0.34 sq. ft." against the covered area that is not air-conditioned, below the $0.54 charged for the area with A/C.',
  componentType: "plan_review",
  sourceId: SCOTTSDALE_PLAN_REVIEW_SOURCE_KEY,
  ...perSquareFoot("covered_square_footage", 34),
  conditions: {
    all: [NEW_WORK, { field: "custom.covered_square_footage", op: "exists" }],
  },
  priority: 210,
});

/** The whole building-permit rule set, in the order the schedules print it. */
export const SCOTTSDALE_BUILDING_RULES: FeeRuleRecord[] = [
  SCOTTSDALE_PERMIT_BASE,
  SCOTTSDALE_PERMIT_AREA_WITH_AC,
  SCOTTSDALE_PERMIT_AREA_WITH_AC_REMODEL,
  SCOTTSDALE_PERMIT_COVERED_AREA,
  SCOTTSDALE_PLAN_REVIEW_AREA_WITH_AC,
  SCOTTSDALE_PLAN_REVIEW_AREA_WITH_AC_REMODEL,
  SCOTTSDALE_PLAN_REVIEW_COVERED_AREA,
];

/* -------------------------------------------------------------------------- */
/* Trade permits — the Miscellaneous schedule                                   */
/* -------------------------------------------------------------------------- */

/**
 * Appendix A.2, "Miscellaneous Permit Fees": "Minimum Permit (one discipline) $121"
 * and "Minimum Combination (all disciplines) $379".
 *
 * This is the one figure any document in this project publishes about a permit taken
 * out for a single trade, and it is a **minimum**, which is the hard part. A minimum is
 * a floor on a fee this module cannot compute: the City prices work by area, and these
 * schedules never say what area rate a one-discipline permit uses. Charging the floor
 * as though it were the fee would understate every permit above it, and inventing an
 * area rate for a trade permit would be a guess.
 *
 * So the rules below price the permits the City *does* publish a flat fee for, and this
 * rule prices the case where none of them applies — a permit covering one discipline,
 * charged at the published $121 minimum. The condition says exactly that, and the page
 * says exactly that in words a reader can act on: $121 is what the City publishes as a
 * floor, not an estimate of the fee for a given job.
 *
 * The $379 combination minimum is deliberately **not** modelled here, and not because
 * it was overlooked. It is a floor on a permit covering every discipline, which is the
 * building permit — and the building permit's fee is published in full, in another
 * schedule, and is already computed on the building page. Presenting a floor beside a
 * computed figure would invite a reader to add them. `SCOTTSDALE_TRADE_MINIMUM` is
 * therefore scoped to a one-discipline permit, and the combination minimum is named on
 * the pages without being computed. See research/arizona/scottsdale.md § 5.5.
 */
export const SCOTTSDALE_TRADE_MINIMUM: FeeRuleRecord = scottsdaleRule({
  id: "sc-trade-minimum",
  code: "TRADE-MINIMUM-ONE-DISCIPLINE",
  label: "Stand-alone permit, one discipline",
  description:
    'Miscellaneous Permit Fees — "Minimum Permit (one discipline) $121". The City publishes it as a minimum for a permit covering a single discipline, not as a rate: where one of the flat fees below prices the permit, that figure applies instead, and the $379 minimum for a permit covering all disciplines is not computed on this site.',
  sourceId: SCOTTSDALE_MISC_SOURCE_KEY,
  feeType: "flat",
  config: { amountCents: 12_100 },
  conditions: { field: "custom.schedule_item", op: "absent" },
  priority: 100,
});

/**
 * Appendix A.2, "Miscellaneous Permit Fees": "Temporary Power Pole $121" — one of the
 * few things in the whole of Exhibit A that the City prices flat rather than by area,
 * and the only one of them that is electrical.
 *
 * `custom.schedule_item` exists to keep these mutually exclusive rather than additive.
 * The schedule lists them as separate permit fees, and it does not say whether a
 * temporary power pole permit is also the one-discipline permit carrying a $121
 * minimum. Adding them would decide a question the City left open, and would charge $242
 * for a permit the schedule prices at $121.
 */
export const SCOTTSDALE_TEMP_POWER_POLE: FeeRuleRecord = scottsdaleRule({
  id: "sc-temp-power-pole",
  code: "TEMP-POWER-POLE",
  label: "Temporary power pole permit",
  description:
    'Miscellaneous Permit Fees — "Temporary Power Pole $121". A flat fee for a permit of its own; the schedule does not say whether it also attracts the one-discipline minimum, so the two are alternatives here rather than a sum.',
  sourceId: SCOTTSDALE_MISC_SOURCE_KEY,
  feeType: "flat",
  config: { amountCents: 12_100 },
  conditions: { field: "custom.schedule_item", op: "eq", value: "temporary_power_pole" },
  priority: 110,
});

/**
 * Appendix A.2, "Miscellaneous Permit Fees": "Solar Residential $168" — the
 * electrified side of residential solar. (The thermal side, a solar water heater, is a
 * plumbing permit priced at $90; and a non-standard residential photovoltaic system is
 * not in this provincial schedule at all — see research/arizona/scottsdale.md § 8.)
 */
export const SCOTTSDALE_RESIDENTIAL_SOLAR: FeeRuleRecord = scottsdaleRule({
  id: "sc-solar-residential",
  code: "SOLAR-RESIDENTIAL",
  label: "Residential solar permit",
  description:
    'Miscellaneous Permit Fees — "Solar Residential $168", against "Solar Commercial $331" for the same work on a commercial building. A flat fee that replaces the area-rate permit fee rather than adding to it.',
  sourceId: SCOTTSDALE_MISC_SOURCE_KEY,
  feeType: "flat",
  config: { amountCents: 16_800 },
  conditions: { field: "custom.schedule_item", op: "eq", value: "residential_solar" },
  priority: 110,
});

/**
 * Appendix A.2, "Miscellaneous Permit Fees": "Water Heaters (except solar) $63".
 *
 * The clearest single plumbing fee in the schedule, and the one plumbing figure the
 * City prices flat. "Except solar" is the City's own carve-out and is why the solar
 * water heater below is a separate rule at a different price rather than a condition
 * on this one.
 */
export const SCOTTSDALE_WATER_HEATER: FeeRuleRecord = scottsdaleRule({
  id: "sc-water-heater",
  code: "WATER-HEATER",
  label: "Water heater permit",
  description:
    'Miscellaneous Permit Fees — "Water Heaters (except solar) $63". The City prices this one plumbing item flat, in a schedule that otherwise prices plumbing work by area.',
  sourceId: SCOTTSDALE_MISC_SOURCE_KEY,
  feeType: "flat",
  config: { amountCents: 6_300 },
  conditions: { field: "custom.schedule_item", op: "eq", value: "water_heater" },
  priority: 110,
});

/** Appendix A.2, "Miscellaneous Permit Fees": "Solar Water Heaters $90". */
export const SCOTTSDALE_SOLAR_WATER_HEATER: FeeRuleRecord = scottsdaleRule({
  id: "sc-solar-water-heater",
  code: "SOLAR-WATER-HEATER",
  label: "Solar water heater permit",
  description:
    'Miscellaneous Permit Fees — "Solar Water Heaters $90", priced separately from the $63 an ordinary water heater costs.',
  sourceId: SCOTTSDALE_MISC_SOURCE_KEY,
  feeType: "flat",
  config: { amountCents: 9_000 },
  conditions: { field: "custom.schedule_item", op: "eq", value: "solar_water_heater" },
  priority: 110,
});

/**
 * Appendix A.2, "Miscellaneous Permit Fees": "Reinspection $121".
 *
 * On both trade pages and in no worked example: it is a fee for an event rather than
 * for a permit, and an estimate that added $121 to every job would be wrong for every
 * job that passes its inspections.
 */
export const SCOTTSDALE_REINSPECTION: FeeRuleRecord = scottsdaleRule({
  id: "sc-reinspection",
  code: "REINSPECTION",
  label: "Re-inspection",
  description:
    'Miscellaneous Permit Fees — "Reinspection $121". A fee for an event rather than for a permit, which is why it is charged only where a re-inspection is selected.',
  componentType: "inspection",
  sourceId: SCOTTSDALE_MISC_SOURCE_KEY,
  feeType: "flat",
  config: { amountCents: 12_100 },
  conditions: { field: "custom.reinspection", op: "eq", value: true },
  priority: 400,
});

/**
 * The electrical rule set.
 *
 * **The area rates are absent on purpose.** A stand-alone electrical permit is not
 * priced by the area schedules, which price construction; what the City publishes for
 * electrical work on its own is the one-discipline minimum and the flat item fees.
 * Where electrical work is part of a building project, it is that project's building
 * permit that is charged, by area — and that is computed on the building page, to which
 * this page links rather than repeating.
 */
export const SCOTTSDALE_ELECTRICAL_RULES: FeeRuleRecord[] = [
  SCOTTSDALE_TEMP_POWER_POLE,
  SCOTTSDALE_RESIDENTIAL_SOLAR,
  SCOTTSDALE_TRADE_MINIMUM,
  SCOTTSDALE_REINSPECTION,
];

/** The plumbing rule set: the same minimum, plus the two water-heating fees. */
export const SCOTTSDALE_PLUMBING_RULES: FeeRuleRecord[] = [
  SCOTTSDALE_WATER_HEATER,
  SCOTTSDALE_SOLAR_WATER_HEATER,
  SCOTTSDALE_TRADE_MINIMUM,
  SCOTTSDALE_REINSPECTION,
];
