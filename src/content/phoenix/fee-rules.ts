import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Phoenix fee rules — REAL DATA.
 *
 * Sources (research/arizona/phoenix.md records every one of them, with the
 * retrieval method and the hash of the file that was read):
 *
 *  S1  City of Phoenix, "PDD Fee Schedule", approved 12 December 2025, effective
 *      20 January 2026, adopted by Ordinance G-7465. Phoenix City Code, Chapter 9,
 *      Appendix A.2.
 *      https://www.phoenix.gov/content/dam/phoenix/pddsite/documents/impact-fees/fee-schedule.pdf
 *
 *  S2  City of Phoenix, "Fees, Valuations and Assurances" — the Planning &
 *      Development Department's own fee landing page, which publishes S1 as the
 *      current schedule and dates it 20 January 2026.
 *      https://www.phoenix.gov/administration/departments/pdd/tools-resources/fees.html
 *
 * Phoenix's mechanism is deliberately unlike Houston's or Dallas's, and that is the
 * reason this module is not a copy of either:
 *
 *  - **The permit fee is a single valuation table (Table A).** It is not organised
 *    by what is being built and it publishes no square-footage or per-unit rates.
 *    One table, applied to the valuation of the work, for every occupancy type.
 *
 *  - **The table is marginal, in $1,000 steps, rounded up per band.** Row 2 is
 *    "$195 on first $1,000, plus $12 for each additional $1,000, or fraction
 *    thereof, to and including $10,000". Modelled as a `tiered_marginal` rule whose
 *    bands are the published rows with `incrementCents` set, which reproduces the
 *    City's own worked example to the dollar — see the `TABLE-A` rule below.
 *
 *  - **Plan review is a percentage of the permit fee.** "100% of the permit fee,
 *    minimum $195" for valuations of $50,000 or less, "80% of the permit fee,
 *    minimum $195" above that. That is the reason the engine gained a `permit_fee`
 *    basis: modelling it as a second copy of Table A with scaled rates would have
 *    duplicated every rate and let the two drift apart. See `FEE_BASES` in
 *    `@/lib/calc/types`.
 *
 * What is deliberately NOT here:
 *
 *  - **The $98 water-heater and fence minimum** that Table A prints in its first
 *    row ("$98 Minimum for Residential Water Heaters and Fences"). Whether it
 *    replaces or floors the $195 base charge is not stated, and modelling it as an
 *    additive rule alongside the unconditional Table A rule would double-charge.
 *    It is named on the page and in research/arizona/phoenix.md, not estimated.
 *
 *  - **The swimming pool minimum ($234) and the $30 aquatics program surcharge**
 *    (Ordinance G-3114). Both are published; neither is modelled, for the same
 *    reason — the schedule does not say whether the $234 replaces the Table A fee.
 *
 *  - **Every other hourly and event fee** in the Building Safety section
 *    (after-hours inspection $195 an hour, temporary certificate of occupancy $780,
 *    elevator and refrigeration periodic inspections, and so on). They attach to
 *    events or to equipment rather than to construction permits.
 *
 * **This module is the single definition of Phoenix's fee rules.** The seed writes
 * exactly these records and the tests assert against exactly these records, so a
 * test cannot pass while the published data says something else.
 *
 * THE TRADE RULES AT THE BOTTOM OF THIS FILE
 *
 * Phoenix's schedule contains **no electrical, plumbing or mechanical permit fee**.
 * Across all fifty pages there is not one per-outlet, per-fixture, per-circuit,
 * per-ton or per-trade rate, and no "electrical permit" line at all. Read as an
 * absence that is the end of the story, and it was for Phoenix's first release: the
 * building permit got a page and the trades did not.
 *
 * It is not the whole story. The Building Safety section *does* publish four fees
 * that belong to a trade and to nothing else, and they are what the electrical and
 * plumbing pages are built on:
 *
 *   1. **Additional utility meters**, $98 each, once the first meter of each type is
 *      included in the permit fee. Electric meters are electrical; gas and water
 *      meters are plumbing.
 *   2. **Temporary power**, inspection fee $195.
 *   3. **Backflow prevention devices**, $195 for the first and $98 for each one after
 *      it.
 *   4. **Re-inspection of any construction permit**, $195 each.
 *
 * And the section states, under both Temporary Power and Refrigeration System
 * Periodic Inspections, that installation, repair or replacement work is priced from
 * Table A. Its own words, twice: "For installation, repair, or replacement work, see
 * Permit Fee Table A." That sentence is why the trade pages reuse `TABLE-A` rather
 * than showing only the meter and inspection fees: without it a page could state a
 * fee for a meter and leave out the permit that carries it, which is a wrong total
 * rather than an incomplete one.
 *
 * The two omissions above are unchanged by any of this, and are still deliberate: the
 * $98 residential **water heater** minimum and the $234 **pool** minimum are
 * published and still not modelled, because the schedule does not say whether either
 * replaces the Table A fee or floors it, and an unconditional Table A rule would
 * double-charge. Both are named on the plumbing page.
 */

/** Ordinance G-7465 took effect 20 January 2026. */
export const PHOENIX_FEE_EFFECTIVE_FROM = "2026-01-20";

export const PHOENIX_FEE_SCHEDULE_SOURCE_KEY = "phoenix-pdd-fee-schedule";
export const PHOENIX_VALUATION_TABLE_SOURCE_KEY = "phoenix-building-valuation-table";
export const PHOENIX_FEES_PAGE_SOURCE_KEY = "phoenix-pdd-fees-page";

const SOURCE = PHOENIX_FEE_SCHEDULE_SOURCE_KEY;

function phoenixRule(
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
    effectiveFrom: PHOENIX_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Table A — the valuation-based permit fee                                    */
/* -------------------------------------------------------------------------- */

/**
 * Appendix A.2, "BUILDING SAFETY PERMIT FEES", item 1 and Table A.
 *
 * The published table has seven rows. Read as a marginal schedule they are one
 * rule, because each row's base amount is exactly what the rows below it produce:
 *
 *   $303 on the first $10,000  = $195 + $12 x 9
 *   $703 on the first $50,000  = $303 + $10 x 40
 *   $2,053 on the first $200,000 = $703 + $9 x 150
 *   $9,253 on the first $1,000,000 = $2,053 + $9 x 800
 *   $54,253 on the first $10,000,000 = $9,253 + $5 x 9,000
 *
 * That chaining is what Houston's brackets famously do **not** do, and it is what
 * lets one marginal rule stand in for the whole table. The rates are whole basis
 * points because $12 per $1,000 is exactly 1.2%, $10 is 1%, $9 is 0.9% and $5 is
 * 0.5% — no precision is lost by expressing them that way.
 *
 * The first band carries a zero rate because the $195 base amount covers the first
 * $1,000: a valuation of $500 pays $195, which is the row that prints "$195 Base
 * fee only".
 *
 * `incrementCents: 100000` is the schedule's "or fraction thereof". It rounds the
 * valuation up to the next whole $1,000 before the bands are applied, and because
 * every band boundary is itself a whole $1,000 this is arithmetically identical to
 * rounding each band's own excess — which is how the table is written. The City's
 * own example, a $250,500 valuation, comes out at $2,512 here and in the document.
 */
export const PHOENIX_TABLE_A_PERMIT_FEE: FeeRuleRecord = phoenixRule({
  id: "phx-table-a",
  code: "TABLE-A",
  label: "Building safety permit fee",
  description:
    "Appendix A.2, Table A — the valuation-based permit fee for new construction, additions and remodels. Bands are marginal and the valuation is rounded up to the next whole $1,000 before they are applied.",
  feeType: "tiered_marginal",
  config: {
    basis: "valuation",
    baseCents: 19_500,
    incrementCents: 100_000,
    tiers: [
      { upToCents: 100_000, rateBps: 0 },
      { upToCents: 1_000_000, rateBps: 120 },
      { upToCents: 5_000_000, rateBps: 100 },
      { upToCents: 20_000_000, rateBps: 90 },
      { upToCents: 100_000_000, rateBps: 90 },
      { upToCents: 1_000_000_000, rateBps: 50 },
      { upToCents: null, rateBps: 50 },
    ],
  },
  priority: 100,
});

/* -------------------------------------------------------------------------- */
/* Plan review — a percentage of the permit fee                                */
/* -------------------------------------------------------------------------- */

/**
 * Appendix A.2, "BUILDING SAFETY PLAN REVIEW FEES", item 1.a.1 and 1.a.4.
 *
 * The schedule states one rule across four rows — residential and commercial,
 * at or below $50,000 and above it — and the four rows say only two things:
 * 100% of the permit fee at or below $50,000, 80% above it, minimum $195 either
 * way. Occupancy does not change it, so there is no occupancy condition here.
 *
 * The `valuation gt $5,000` bound is the schedule's own scope: item 1.b gives no
 * plan review fee where the valuation is under $5,000 and the counter review takes
 * 15 minutes or less, and the paragraph under item 1.a says the fee "applies to all
 * permits ... where valuation exceeds $5,000 and a plan review is required".
 *
 * **The $195 minimum is published but inert here, and it is modelled anyway.** At
 * the schedule's own thresholds a plan review is never charged below $255 (100% of
 * the cheapest permit fee above $5,000), so the floor cannot bind. It is kept
 * because it is in the document and because removing it would be a silent edit to
 * a published rule; research/arizona/phoenix.md records the arithmetic.
 */
export const PHOENIX_PLAN_REVIEW_AT_OR_BELOW_50K: FeeRuleRecord = phoenixRule({
  id: "phx-plan-review-100",
  code: "PLAN-REVIEW-100",
  label: "Plan review",
  description:
    "Appendix A.2, Building Safety Plan Review Fees 1.a.1 and 1.a.3 — 100% of the permit fee for valuations of $50,000 or less, minimum $195. Applies where the valuation exceeds $5,000.",
  componentType: "plan_review",
  feeType: "percent",
  config: { basis: "permit_fee", rateBps: 10_000 },
  minimumCents: 19_500,
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 500_000 },
      { field: "valuation", op: "lte", value: 5_000_000 },
    ],
  },
  priority: 200,
});

export const PHOENIX_PLAN_REVIEW_ABOVE_50K: FeeRuleRecord = phoenixRule({
  id: "phx-plan-review-80",
  code: "PLAN-REVIEW-80",
  label: "Plan review",
  description:
    "Appendix A.2, Building Safety Plan Review Fees 1.a.2 and 1.a.4 — 80% of the permit fee for valuations over $50,000, minimum $195.",
  componentType: "plan_review",
  feeType: "percent",
  config: { basis: "permit_fee", rateBps: 8_000 },
  minimumCents: 19_500,
  conditions: { field: "valuation", op: "gt", value: 5_000_000 },
  priority: 200,
});

/** Both plan review rules, in the order the schedule prints them. */
export const PHOENIX_PLAN_REVIEW_RULES: FeeRuleRecord[] = [
  PHOENIX_PLAN_REVIEW_AT_OR_BELOW_50K,
  PHOENIX_PLAN_REVIEW_ABOVE_50K,
];

/**
 * The whole building-permit rule set, in evaluation order: the permit fee first,
 * then the two plan review rules. Order is documented rather than relied on — the
 * engine evaluates base components first regardless — but a reader of this list
 * should see the same sequence the schedule uses.
 */
export const PHOENIX_BUILDING_RULES: FeeRuleRecord[] = [
  PHOENIX_TABLE_A_PERMIT_FEE,
  ...PHOENIX_PLAN_REVIEW_RULES,
];

/* -------------------------------------------------------------------------- */
/* Trade permits — the fees Phoenix does publish for a trade on its own         */
/* -------------------------------------------------------------------------- */

/**
 * Appendix A.2, Building Safety permit fees, item 3 "Additional Utility Meter
 * Fees": "First Gas, Electric, or Water Meter — No additional fee (included with the
 * permit fee for one meter of each type); Each Additional Meter per Utility — $98".
 *
 * The allowance is modelled rather than assumed away, and this is the one place the
 * arithmetic could quietly double-charge: the schedule includes **one meter of each
 * type** in the permit fee, so a project whose meter count is 3 owes $98 twice. A rule
 * with no allowance would charge three times, which is why `thresholdUnits: 1` is
 * stated explicitly and why the reader supplies the total count rather than a count of
 * additional meters. The engine's breakdown names the included meter so the number is
 * checkable by hand.
 *
 * Two rules rather than one, because the schedule names the utilities and a reader of
 * either page should see their own: electric on the electrical page, gas and water on
 * the plumbing one. They are given the same kind deliberately — the fact a reader
 * supplies is "how many additional meters", and the two rules never appear on the
 * same permit type, so no count can be read by both.
 */
export const PHOENIX_ADDITIONAL_ELECTRIC_METERS: FeeRuleRecord = phoenixRule({
  id: "phx-meter-electric-additional",
  code: "METER-ELECTRIC-ADDITIONAL",
  label: "Each additional electric meter",
  description:
    'Appendix A.2, Building Safety permit fees item 3: "Each Additional Meter per Utility ..... $98 each". The first electric meter carries no additional fee, because one meter of each type is included in the permit fee.',
  feeType: "per_unit",
  config: { unit: "meters", thresholdUnits: 1, centsPerUnit: 9_800 },
  priority: 300,
});

/**
 * The same published row on the plumbing side: a gas meter and a water meter are the
 * other two utilities the schedule names.
 *
 * The schedule charges $98 per additional meter *per utility*, and the extension, gas
 * and water are all plumbing-adjacent services. Three meters — one new gas service and
 * two water — are therefore charged as three, which is what "per utility" means and
 * what the rule does; the page says so rather than implying a single allowance.
 */
export const PHOENIX_ADDITIONAL_GAS_WATER_METERS: FeeRuleRecord = phoenixRule({
  id: "phx-meter-gas-water-additional",
  code: "METER-GAS-WATER-ADDITIONAL",
  label: "Each additional gas or water meter",
  description:
    'Appendix A.2, Building Safety permit fees item 3: "Each Additional Meter per Utility ..... $98 each". One gas meter and one water meter are each included in the permit fee; every meter after that is $98.',
  feeType: "per_unit",
  config: { unit: "meters", thresholdUnits: 1, centsPerUnit: 9_800 },
  priority: 300,
});

/**
 * Appendix A.2, "BUILDING SAFETY INSPECTION FEES", item 4 "Temporary Power":
 * "InspectionFee ..... $195 each".
 *
 * Conditional, because it is a fee for an inspection that a project either asks for
 * or does not. A temporary power inspection on a site with no temporary power is not
 * a fee anyone owes, so an unconditional rule would add $195 to every electrical
 * estimate on this site.
 */
export const PHOENIX_TEMPORARY_POWER_INSPECTION: FeeRuleRecord = phoenixRule({
  id: "phx-temporary-power",
  code: "TEMPORARY-POWER",
  label: "Temporary power inspection",
  description:
    'Appendix A.2, Building Safety inspection fees item 4 "Temporary Power" — $195 for the inspection of a temporary power installation. The schedule adds, in the same item, that installation, repair or replacement work is priced from Permit Fee Table A.',
  componentType: "inspection",
  feeType: "flat",
  config: { amountCents: 19_500 },
  conditions: { field: "custom.temporary_power", op: "eq", value: true },
  priority: 400,
});

/**
 * Appendix A.2, "BUILDING SAFETY INSPECTION FEES", item 6 "Miscellaneous Inspection
 * Services", paragraph c: "Backflow Prevention Devices ..... $195 for the 1st backflow
 * device and $98 for each additional backflow device".
 *
 * A base amount plus an allowance, which is the shape `per_unit` already had from
 * Houston's plumbing fixtures: $195 covers the first device, and every device after it
 * is $98. Backflow devices are not fixtures, and this rule must not be read by a
 * fixture count — hence a kind of their own in `PER_UNIT_KINDS`.
 */
export const PHOENIX_BACKFLOW_DEVICES: FeeRuleRecord = phoenixRule({
  id: "phx-backflow-devices",
  code: "BACKFLOW-DEVICES",
  label: "Backflow prevention devices",
  description:
    'Appendix A.2, Building Safety inspection fees item 6.c — "$195 for the 1st backflow device and $98 for each additional backflow device". A plumbing fee with no electrical or mechanical equivalent.',
  componentType: "inspection",
  feeType: "per_unit",
  config: { unit: "backflow_devices", baseCents: 19_500, thresholdUnits: 1, centsPerUnit: 9_800 },
  priority: 400,
});

/**
 * Appendix A.2, "BUILDING SAFETY INSPECTION FEES", item 1 "Re-inspection Fee for All
 * Construction Permits": $195 for each re-inspection — one called before the work was
 * ready, one that could not be made through no access, and each failure to correct
 * deficiencies. The initial inspection and the first correction visit are included in
 * the permit fee by the same item, which is why this rule is conditional and is not
 * part of any worked example.
 *
 * It is on both trade pages because the schedule puts it on every construction
 * permit, and on neither as a default.
 */
export const PHOENIX_REINSPECTION: FeeRuleRecord = phoenixRule({
  id: "phx-reinspection",
  code: "REINSPECTION",
  label: "Re-inspection",
  description:
    'Appendix A.2, Building Safety inspection fees item 1 — $195 for each re-inspection, whether it was called before the work was ready, could not be made for lack of access, or followed a failure to correct deficiencies. The initial inspection and the first correction visit are included in the permit fee.',
  componentType: "inspection",
  feeType: "flat",
  config: { amountCents: 19_500 },
  conditions: { field: "custom.reinspection", op: "eq", value: true },
  priority: 500,
});

/**
 * The electrical rule set: the same construction permit fee (Table A), plus the fees
 * the schedule publishes for electrical work on its own.
 *
 * **Plan review is deliberately absent, and that is a scope decision worth stating.**
 * Phoenix's plan review rules are published under "BUILDING SAFETY PLAN REVIEW FEES"
 * item 1.a, whose own scope paragraph limits it to new construction, additions and
 * remodels of a **building**. Whether that percentage is charged on a permit taken out
 * for electrical work alone is not stated anywhere in the schedule, and a plan review
 * is a percentage of a permit fee — so attaching it here would multiply an inference.
 * The page says instead that electrical work inside a building project carries that
 * project's plan review, and links to the building permit page where it is computed.
 */
export const PHOENIX_ELECTRICAL_RULES: FeeRuleRecord[] = [
  PHOENIX_TABLE_A_PERMIT_FEE,
  PHOENIX_ADDITIONAL_ELECTRIC_METERS,
  PHOENIX_TEMPORARY_POWER_INSPECTION,
  PHOENIX_REINSPECTION,
];

/**
 * The plumbing rule set. Same Table A fee, then the fees the schedule publishes for
 * plumbing work on its own: meters, backflow prevention devices, re-inspection.
 *
 * Plan review is absent for the reason given above, and the $98 residential water
 * heater minimum is absent for the reason given at the top of this file.
 */
export const PHOENIX_PLUMBING_RULES: FeeRuleRecord[] = [
  PHOENIX_TABLE_A_PERMIT_FEE,
  PHOENIX_ADDITIONAL_GAS_WATER_METERS,
  PHOENIX_BACKFLOW_DEVICES,
  PHOENIX_REINSPECTION,
];
