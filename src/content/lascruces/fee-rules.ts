import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Las Cruces, New Mexico fee rules — REAL DATA.
 *
 * Source (research/new-mexico/las-cruces.md records the reading):
 *
 *  S1  City of Las Cruces Resolution 21-019, "A resolution repealing Resolution No.s 90-235,
 *      00-360, 03-361, 03-009, 11-221, 14-026, and 19-131 containing building permit fee
 *      schedules, and replacing with a unified Community Development fee schedule to be
 *      effective September 1, 2020" — adopted August 17, 2020, Exhibit "A"
 *      (2020_Schedule_of_Fees-final_version).
 *      https://lascruces.civicweb.net/document/7542/
 *
 * The resolution is the whole fee schedule: administrative fees, the building fee table with
 * its scope and local-area modifiers, the ICC-derived valuation tables, the electrical,
 * mechanical, plumbing, roofing and demolition fees, site and grading fees, signs, fire
 * systems, inspections, right-of-way, land use review and the unpermitted-work fees, all in
 * one document.
 *
 * **The mechanism.** The schedule has three money paths for a building permit:
 *
 *  1. **New single-family dwellings, townhouses and duplexes** — "$0.20 per square ft of
 *     gross floor area measured to the outside walls", with "Remodels and additions follow
 *     the commercial process" as the sentence that draws the line.
 *  2. **Everything else** — the Fee Table, a seven-band valuation ladder ("Total Project
 *     Valuation (without land cost)"): $50 under $2,000; $50 for the first $2,000 plus $10
 *     for each additional $1,000 to $25,000; $280 + $8 to $50,000; $480 + $7 to $100,000;
 *     $830 + $6 to $500,000; $3,330 + $5 to $1,000,000; $5,830 + $4 above.
 *  3. **Trades** — electrical by enclosed living area (residential) or amperage
 *     (commercial); plumbing by bathroom/dwelling-unit counts (new residential) or by the
 *     plumbing valuation; mechanical by material value.
 *
 * Plus, on every permit: a **technology fee** ($20 residential building, the greater of
 * $100 or 5% for commercial building, $10 per trade permit), a **plan check fee of "the
 * first 25% of the building permit fee"** due at application, an **expedited option** at
 * the greater of $1,000 or an additional permit fee, and the schedule's standing rule that
 * fees are "tripled on permits for work started or completed without an approved permit".
 *
 * **Three readings this module depends on, all of them stated on the pages.**
 *
 *  1. **The fee table prorates; the trade ladders round up.** The fee table's bands say
 *     "$10 for each additional $1000" with no "or fraction thereof", while the mechanical
 *     and plumbing ladders in the same document say "$5.00 for each additional $1,000.00
 *     or fraction thereof" and the electrical area row says "$5.00 per 100 sf over 2,000
 *     sf" the same way. A document that knows how to write the round-up phrase and writes
 *     it twice and omits it once is read as meaning what it wrote: partial steps are
 *     prorated in the fee table and on the electrical rows, and rounded up where the words
 *     say so (`incrementCents` is set on exactly those rules). The seam figures this
 *     produces — $280 at $25,000, $480 at $50,000, $830 at $100,000, $5,830 at $1,000,000 —
 *     match every band's own printed base, which is the check that the reading and the
 *     table agree where they are both explicit.
 *  2. **The valuation entered is the value of the work the permit covers, after the
 *     schedule's modifiers.** The schedule's commercial fee "is based on the value of the
 *     work covered by the permit" and is "determined using the City of Las Cruces Valuation
 *     Table ... as adjusted by the scope modifier and the local area modifier" — and the
 *     valuation table's own footnote says "*Local area modifier and scope modifier will be
 *     applied to the table values above." Those modifiers (scope: 100% for new and
 *     additions, 75% shell, 50% remodel/repair/tenant work; local area: 88%) are how a
 *     square-foot construction cost becomes a valuation; the fee table is then charged on
 *     that determined valuation. This site takes the determined valuation as its input and
 *     does not re-apply the modifiers — a second application would be charging the
 *     schedule's own arithmetic twice — and the pages state how the entered figure is
 *     built. The one figure that never sees the table is the residential new rate, which
 *     the schedule states as a completed price per square foot.
 *  3. **Plan check is part of the fee, not a charge on top.** "Plan check fee is the first
 *     25% of the building permit fee" — the first quarter of the money, due at application
 *     and non-refundable, with the rest at issuance. Like Newark's 20%, this site does not
 *     add it to any total; unlike Newark's, the schedule never says it is deducted at
 *     issuance either, because it was never outside the fee. The page shows the 25%/75%
 *     split as the payment schedule it is.
 *
 * **What is deliberately NOT here:**
 *
 *  - **Mechanical** (its own page candidate: $50 / $100 / $100 + $5 per $1,000 or fraction
 *    on material value), **roofing** (the building schedule applies "per the applicant's
 *    valuation"), **demolition** ($0 with the building permit, $50 interior non-load
 *    bearing, $175 all other), **grading** ($100 / $250 / $250 + $25 an acre / $425 + $10
 *    an acre), **signs** ($45–$250 by type), **fire systems** (head-count ladders), the
 *    **mobile home installation** permit ($75), **right-of-way** (5% of construction
 *    value), **floodplain review** ($150), **rock walls** (5% of construction value for
 *    retaining walls), the **site cleanup fee** ($1,000 + cost), **change of occupancy**
 *    ($45 / $100), **reinstatement** (25% of the building permit fee), **temporary and
 *    same-day certificates of occupancy** ($100 each), and every land-use and
 *    administrative review application fee. Published, transcribed in the research record,
 *    and named on the pages rather than priced — none of them is a building, electrical or
 *    plumbing permit.
 *  - **The commercial "Service Change" row**, which the electrical schedule prints as
 *    "Service Change (Calculated service capacity using cost X 75%)" with **no amount
 *    beside it** — the document publishes the row and not its price. Quoted on the page,
 *    charged by nothing.
 *  - **Inspection charges other than reinspection**: after-hours at $60/hour (two-hour
 *    minimum), partial inspections at $45, and the $150 charged for a "second or more
 *    reinspection fee on same team" — the last two share the $45 that is modelled and the
 *    first is hourly with no countable quantity.
 *  - **The revision/addendum fee** ($45 per reviewer) and the **unapproved or
 *    non-permitted variance fees** ($100–$2,000), which are charges for a hearing rather
 *    than for a permit.
 *
 * **This module is the single definition of Las Cruces's fee rules.**
 */

/** Resolution 21-019: "to be effective September 1, 2020" (adopted August 17, 2020). */
export const LC_FEE_EFFECTIVE_FROM = "2020-09-01";

export const LC_RESOLUTION_SOURCE_KEY = "las-cruces-resolution-21-019";

/** INSPECTION FEES: "Reinspection Fee — $45.00 per occurrence." */
export const LC_REINSPECTION_CENTS = 4_500;
/** Administrative Fees: "Trade Permit (Electrical, Plumbing, Mechanical & Rock Wall) — $10 per permit". */
export const LC_TRADE_TECHNOLOGY_FEE_CENTS = 1_000;
/** Administrative Fees: "Residential New, Alteration, and Addition — $20 per permit". */
export const LC_RESIDENTIAL_TECHNOLOGY_FEE_CENTS = 2_000;
/** Administrative Fees: "Commercial New, Alteration and Addition — $100 or 5% of permit fee, whichever is greater". */
export const LC_COMMERCIAL_TECHNOLOGY_MINIMUM_CENTS = 10_000;
export const LC_COMMERCIAL_TECHNOLOGY_RATE = { numerator: 5, denominator: 100 } as const;
/** EXPEDITED PERMITTING: "the greater of $1000 or an additional payment of the permit fee, whichever is greater". */
export const LC_EXPEDITED_MINIMUM_CENTS = 100_000;
/**
 * The standing rule printed above every schedule: fees are "tripled on permits for work
 * started or completed without an approved permit" — the permit fee times three, so the
 * surcharge the rule adds is twice the fee.
 */
export const LC_UNPERMITTED_RATE = { numerator: 2, denominator: 1 } as const;

function lcRule(
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
    effectiveFrom: LC_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: LC_RESOLUTION_SOURCE_KEY,
    ...overrides,
  };
}

/**
 * The residential-new path: a one- or two-family dwelling, townhouse or duplex being built.
 * "New single-family dwellings, townhouses, and duplexes: $0.20 per square ft ... Remodels
 * and additions follow the commercial process." The work type is part of the condition for
 * the same reason the construction class is: an addition is a commercial-process job on a
 * residential building, and nothing else about the facts would say so.
 */
const RES_NEW_BUILDING = {
  all: [
    { field: "custom.one_two_family", op: "eq" as const, value: true },
    { field: "work_type", op: "eq" as const, value: "new_construction" },
  ],
};

/* -------------------------------------------------------------------------- */
/* Building permits — the $0.20 residential path and the Fee Table            */
/* -------------------------------------------------------------------------- */

export const LC_BUILDING_RES_NEW: FeeRuleRecord = lcRule({
  id: "lc-bldg-res-new-sf",
  code: "BLD-RES-NEW-SF",
  label: "New single-family dwelling, townhouse or duplex — $0.20 per square foot",
  description:
    'Resolution 21-019, Residential Building Permit Fee: "New single-family dwellings, townhouses, and duplexes: $0.20 per square ft of gross floor area measured to the outside walls." The schedule adds, one line below, "Remodels and additions follow the commercial process" — so this rate is for building the dwelling, and the same house altered or added to is priced on the Fee Table below. The rate was set by Resolution 19-131, which the schedule\'s own background note records as raising the residential valuation "from $0.14 per square foot to $0.20 per square foot".',
  feeType: "percent",
  config: {
    basis: "square_footage",
    rate: { numerator: 20, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: RES_NEW_BUILDING,
});

function lcFeeTableRule(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<Pick<FeeRuleRecord, "conditions" | "description">>,
): FeeRuleRecord {
  const { conditions, ...rest } = overrides;
  return lcRule({
    ...rest,
    conditions: {
      all: [{ not: RES_NEW_BUILDING }, ...(conditions ? [conditions] : [])],
    },
  });
}

export const LC_FEE_TABLE_UNDER_2000: FeeRuleRecord = lcFeeTableRule({
  id: "lc-bldg-table-under-2000",
  code: "BLD-TABLE-UNDER-2000",
  label: "Fee table, valuation under $2,000 — $50",
  description:
    'Resolution 21-019, Fee Table: "Under $2000 — $50". A flat $50 for the smallest valuations, on the total project valuation without land cost, for every permit that is not a new one- to two-family dwelling, townhouse or duplex.',
  feeType: "flat",
  config: { amountCents: 5_000 },
  conditions: { field: "valuation", op: "lte", value: 200_000 },
});

export const LC_FEE_TABLE_2001_25000: FeeRuleRecord = lcFeeTableRule({
  id: "lc-bldg-table-2001-25000",
  code: "BLD-TABLE-2001-25000",
  label: "Fee table, $2,001–$25,000 — $50 plus $10 per $1,000",
  description:
    'Resolution 21-019, Fee Table: "$2,001 through $25,000 — $50 for the first $2,000 plus $10 for each additional $1000". The phrase "or fraction thereof" appears three times in this document — on the mechanical ladder, on the plumbing ladder and nowhere on this table — so the additional $1,000s are prorated here: the band closes at exactly the $280 the next band opens with. A schedule that writes the round-up phrase where it means it and omits it where it does not is read as meaning what it wrote.',
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    baseCents: 5_000,
    thresholdCents: 200_000,
    centsPerThousand: 1_000,
  },
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 200_000 },
      { field: "valuation", op: "lte", value: 2_500_000 },
    ],
  },
});

export const LC_FEE_TABLE_25001_50000: FeeRuleRecord = lcFeeTableRule({
  id: "lc-bldg-table-25001-50000",
  code: "BLD-TABLE-25001-50000",
  label: "Fee table, $25,001–$50,000 — $280 plus $8 per $1,000",
  description:
    'Resolution 21-019, Fee Table: "$25,001 through $50,000 — $280 for the first $25,000 plus $8 for each additional $1000". $280 is what the band below computes at $25,000 ($50 + 23 × $10), and $480 is what this band computes at $50,000 — the printed bases are each band\'s own opening figure, which is how the table is read as continuous.',
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    baseCents: 28_000,
    thresholdCents: 2_500_000,
    centsPerThousand: 800,
  },
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 2_500_000 },
      { field: "valuation", op: "lte", value: 5_000_000 },
    ],
  },
});

export const LC_FEE_TABLE_50001_100000: FeeRuleRecord = lcFeeTableRule({
  id: "lc-bldg-table-50001-100000",
  code: "BLD-TABLE-50001-100000",
  label: "Fee table, $50,001–$100,000 — $480 plus $7 per $1,000",
  description:
    'Resolution 21-019, Fee Table: "$50,001 through $100,000 — $480 for the first 50,000 plus $7 for each additional $1000". The band opens at exactly what the band below computes at $50,000, and closes at exactly the $830 the band above $100,000 opens with.',
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    baseCents: 48_000,
    thresholdCents: 5_000_000,
    centsPerThousand: 700,
  },
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 5_000_000 },
      { field: "valuation", op: "lte", value: 10_000_000 },
    ],
  },
});

export const LC_FEE_TABLE_100001_500000: FeeRuleRecord = lcFeeTableRule({
  id: "lc-bldg-table-100001-500000",
  code: "BLD-TABLE-100001-500000",
  label: "Fee table, $100,001–$500,000 — $830 plus $6 per $1,000",
  description:
    'Resolution 21-019, Fee Table: "$101,001 through $500,000 — $830 for the first $100,000 plus $6 for each additional $1000". The band\'s opening value is "$101,001" in the printed table while its base is "the first $100,000" and the band below ends at $100,000 — a one-thousand-dollar gap in the range labels and no gap in the arithmetic. The range is read as $100,001 to $500,000, matching the base the same row states, and the typo is printed on the page rather than quietly smoothed.',
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    baseCents: 83_000,
    thresholdCents: 10_000_000,
    centsPerThousand: 600,
  },
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 10_000_000 },
      { field: "valuation", op: "lte", value: 50_000_000 },
    ],
  },
});

export const LC_FEE_TABLE_500001_1000000: FeeRuleRecord = lcFeeTableRule({
  id: "lc-bldg-table-500001-1000000",
  code: "BLD-TABLE-500001-1000000",
  label: "Fee table, $500,001–$1,000,000 — $3,330 plus $5 per $1,000",
  description:
    'Resolution 21-019, Fee Table: "$500,001 through $1,000,000 — $3330 for the first $500,000 plus $5 for each additional $1000". This band opens $100 higher than the band below computes at $500,000 ($830 + 400 × $6 = $3,230 against the printed $3,330) — the table\'s own discontinuity, reproduced rather than reconciled, and visible in the test at both sides of the boundary. Above it the table closes at exactly $5,830, which is the last band\'s printed base.',
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    baseCents: 333_000,
    thresholdCents: 50_000_000,
    centsPerThousand: 500,
  },
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 50_000_000 },
      { field: "valuation", op: "lte", value: 100_000_000 },
    ],
  },
});

export const LC_FEE_TABLE_OVER_1000000: FeeRuleRecord = lcFeeTableRule({
  id: "lc-bldg-table-over-1000000",
  code: "BLD-TABLE-OVER-1000000",
  label: "Fee table, $1,000,001 or more — $5,830 plus $4 per $1,000",
  description:
    'Resolution 21-019, Fee Table: "$1,000,001 or more — $5830 for the first $1,000,000 plus $4 for each additional $1000". The last band, unbounded, opening at exactly what the band below computes at $1,000,000 ($3,330 + 500 × $5).',
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    baseCents: 583_000,
    thresholdCents: 100_000_000,
    centsPerThousand: 400,
  },
  conditions: { field: "valuation", op: "gt", value: 100_000_000 },
});

/** Administrative Fees: "Residential New, Alteration, and Addition — $20 per permit". */
export const LC_TECHNOLOGY_FEE_RESIDENTIAL: FeeRuleRecord = lcRule({
  id: "lc-bldg-tech-residential",
  code: "BLD-TECHNOLOGY-RESIDENTIAL",
  label: "Technology fee, residential — $20 per permit",
  description:
    'Resolution 21-019, Administrative Fees: "These are fees that apply to all permits and activities of the One Stop Shop ... Residential New, Alteration, and Addition — $20 per permit." A flat twenty dollars on a residential building permit, charged with the permit rather than computed from it. The same table\'s "Other Permits — $10 per permit" row governs permits outside the residential and commercial classes — roofing, demolition, the certificates — and is named on the page rather than charged here, because those permits have no page of their own on this site.',
  feeType: "flat",
  config: { amountCents: LC_RESIDENTIAL_TECHNOLOGY_FEE_CENTS },
  conditions: { field: "occupancy", op: "eq", value: "residential" },
  componentType: "other",
  priority: 200,
});

/** Administrative Fees: "Commercial New, Alteration and Addition — $100 or 5% of permit fee, whichever is greater". */
export const LC_TECHNOLOGY_FEE_COMMERCIAL: FeeRuleRecord = lcRule({
  id: "lc-bldg-tech-commercial",
  code: "BLD-TECHNOLOGY-COMMERCIAL",
  label: "Technology fee, commercial — the greater of $100 or 5% of the permit fee",
  description:
    'Resolution 21-019, Administrative Fees: "Commercial New, Alteration and Addition — $100 or 5% of permit fee, whichever is greater." Five percent of the calculated permit fee with a one-hundred-dollar floor, which is what makes the floor bind on small commercial jobs: a $130 permit fee owes $100 of technology fee rather than $6.50. Charged on the permit fee — the fee table\'s own figure — and not on the bill.',
  feeType: "percent",
  config: {
    basis: "permit_fee",
    rate: LC_COMMERCIAL_TECHNOLOGY_RATE,
  },
  minimumCents: LC_COMMERCIAL_TECHNOLOGY_MINIMUM_CENTS,
  conditions: { field: "occupancy", op: "neq", value: "residential" },
  componentType: "other",
  priority: 200,
});

/** EXPEDITED PERMITTING: "the greater of $1000 or an additional payment of the permit fee, whichever is greater". */
export const LC_EXPEDITED_PERMITTING: FeeRuleRecord = lcRule({
  id: "lc-bldg-expedited",
  code: "BLD-EXPEDITED",
  label: "Expedited permitting — the greater of $1,000 or an additional permit fee",
  description:
    'Resolution 21-019, Expedited Permitting: "Expedited permitting is available on request. The fee is the greater of $1000 or an additional payment of the permit fee, whichever is greater." The Administrative Fees table states the same option as "Expedited Review — $1000 or double permit fee, whichever is greater": either way the total becomes the permit fee plus the greater of $1,000 and the permit fee again. Charged only when expedited review is requested.',
  feeType: "percent",
  config: { basis: "permit_fee", rate: { numerator: 1, denominator: 1 } },
  minimumCents: LC_EXPEDITED_MINIMUM_CENTS,
  conditions: { field: "is_expedited", op: "eq", value: true },
  componentType: "other",
  priority: 800,
});

/**
 * The standing rule, printed under each schedule: "This fee ... is tripled on permits for
 * work started or completed without an approved permit." The rule adds twice the permit
 * fee to it, which is what tripling the permit fee means; the technology fee and the plan
 * check are not the permit fee and are not tripled with it.
 */
export const LC_UNPERMITTED_WORK: FeeRuleRecord = lcRule({
  id: "lc-bldg-unpermitted",
  code: "BLD-UNPERMITTED-WORK",
  label: "Work without a permit — the permit fee tripled",
  description:
    'The standing sentence above the building, electrical, mechanical, plumbing, roofing, demolition, grading, sign and right-of-way schedules: "This fee is tripled on permits for work started or completed without an approved permit." The schedule triples the permit fee, so this rule adds a surcharge equal to twice the permit fee — the permit fee once, and twice more for the work having started without it. The separate "UNAPPROVED OR NON-PERMITTED FEES" table ($100 to $2,000 by valuation) is the variance-processing charge and is not a permit fee; it is named on the page rather than charged.',
  feeType: "percent",
  config: { basis: "permit_fee", rate: LC_UNPERMITTED_RATE },
  conditions: { field: "custom.unpermitted_work", op: "eq", value: true },
  componentType: "surcharge",
  priority: 900,
});

/** INSPECTION FEES: "Reinspection Fee — $45.00 per occurrence." */
export const LC_REINSPECTION: FeeRuleRecord = lcRule({
  id: "lc-bldg-reinspection",
  code: "BLD-REINSPECTION",
  label: "Reinspection, $45.00 per occurrence",
  description:
    'Resolution 21-019, INSPECTION FEES: "Inspection fees apply to all inspections of any type ... Reinspection Fee — $45.00 per occurrence", with "Reinspection Fees are due before any other inspections may be performed" and a "$150.00 per occurrence" charge for a "Second or more reinspection fee on same team". The $45 row is modelled; the $150 repeat and the "$45.00 per occurrence" partial inspection share the same counter and are named on the page rather than charged as their own rules.',
  feeType: "flat",
  config: { amountCents: LC_REINSPECTION_CENTS },
  conditions: { field: "custom.reinspection", op: "eq", value: true },
  componentType: "inspection",
  priority: 300,
});

export const LC_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  LC_BUILDING_RES_NEW,
  LC_FEE_TABLE_UNDER_2000,
  LC_FEE_TABLE_2001_25000,
  LC_FEE_TABLE_25001_50000,
  LC_FEE_TABLE_50001_100000,
  LC_FEE_TABLE_100001_500000,
  LC_FEE_TABLE_500001_1000000,
  LC_FEE_TABLE_OVER_1000000,
  LC_TECHNOLOGY_FEE_RESIDENTIAL,
  LC_TECHNOLOGY_FEE_COMMERCIAL,
  LC_EXPEDITED_PERMITTING,
  LC_UNPERMITTED_WORK,
  LC_REINSPECTION,
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — Table of residential areas and commercial amperages   */
/* -------------------------------------------------------------------------- */

/**
 * "Fee is based on the enclosed living area of new, remodels, and additions to one-and
 * two-unit dwellings and townhomes." The dwelling type and the work type are both part of
 * the sentence, and the solar exclusion is here because the residential solar row is a
 * bundled fee — "including plan review, building inspection, and electrical inspection" —
 * which an area rule would have charged a second time.
 */
const RES_ELECTRICAL_AREA = {
  all: [
    { field: "custom.one_two_family", op: "eq" as const, value: true },
    {
      field: "work_type",
      op: "in" as const,
      value: ["new_construction", "addition", "remodel", "alteration"],
    },
    { not: { field: "custom.solar_pv", op: "eq" as const, value: true } },
  ],
};

/**
 * The commercial side, which is priced by amperage. A rule here needs the permit to have
 * answered that it is *not* a one-and-two-family dwelling — by the dwelling type or by a
 * non-residential occupancy — because "Commercial Electrical Permit Fees" is where the
 * schedule puts every service priced in amps, and a residential service upgrade has no row
 * of its own. An unanswered permit is unpriced rather than priced as commercial.
 */
const COMMERCIAL_ELECTRICAL = {
  any: [
    { field: "custom.one_two_family", op: "neq" as const, value: true },
    { field: "occupancy", op: "neq" as const, value: "residential" },
  ],
};

export const LC_ELEC_RES_AREA_UNDER_1000: FeeRuleRecord = lcRule({
  id: "lc-elec-res-area-under-1000",
  code: "ELEC-RES-AREA-UNDER-1000",
  label: "Residential electrical, under 1,000 sq ft enclosed living area — $35.00",
  description:
    'Resolution 21-019, Residential Electrical Permit Fees: "Fee is based on the enclosed living area of new, remodels, and additions to one-and two-unit dwellings and townhomes. New, Additions, and Remodels — Less than 1000 sf: $35.00."',
  feeType: "flat",
  config: { amountCents: 3_500 },
  conditions: { all: [...RES_ELECTRICAL_AREA.all, { field: "square_footage", op: "lt", value: 1_000 }] },
});

export const LC_ELEC_RES_AREA_1000_1499: FeeRuleRecord = lcRule({
  id: "lc-elec-res-area-1000-1499",
  code: "ELEC-RES-AREA-1000-1499",
  label: "Residential electrical, 1,000–1,499 sq ft — $65.00",
  description:
    'Resolution 21-019, Residential Electrical Permit Fees: "1,000 sf through 1,499 sf — $65.00."',
  feeType: "flat",
  config: { amountCents: 6_500 },
  conditions: {
    all: [
      ...RES_ELECTRICAL_AREA.all,
      { field: "square_footage", op: "gte", value: 1_000 },
      { field: "square_footage", op: "lt", value: 1_500 },
    ],
  },
});

export const LC_ELEC_RES_AREA_1500_2000: FeeRuleRecord = lcRule({
  id: "lc-elec-res-area-1500-2000",
  code: "ELEC-RES-AREA-1500-2000",
  label: "Residential electrical, 1,500–2,000 sq ft — $110.00",
  description:
    'Resolution 21-019, Residential Electrical Permit Fees: "1,500 sf or more — $110.00 plus $5.00 per 100 sf over 2,000 sf." Through 2,000 square feet the $5.00-per-100 addition has nothing to charge on, so the row is $110.00 flat in that range and starts adding above it.',
  feeType: "flat",
  config: { amountCents: 11_000 },
  conditions: {
    all: [
      ...RES_ELECTRICAL_AREA.all,
      { field: "square_footage", op: "gte", value: 1_500 },
      { field: "square_footage", op: "lte", value: 2_000 },
    ],
  },
});

export const LC_ELEC_RES_AREA_OVER_2000: FeeRuleRecord = lcRule({
  id: "lc-elec-res-area-over-2000",
  code: "ELEC-RES-AREA-OVER-2000",
  label: "Residential electrical, over 2,000 sq ft — $110.00 plus $5.00 per 100 sq ft",
  description:
    'Resolution 21-019, Residential Electrical Permit Fees: "1,500 sf or more — $110.00 plus $5.00 per 100 sf over 2,000 sf." The rate has no "or fraction thereof" beside it, so the hundreds of square feet are prorated rather than rounded up — 2,050 square feet adds $2.50, not $5.00, and the page says so because the same document rounds the mechanical and plumbing ladders up where it means to.',
  feeType: "percent",
  config: {
    basis: "square_footage",
    baseCents: 11_000,
    thresholdCents: 2_000,
    rate: { numerator: 5, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [...RES_ELECTRICAL_AREA.all, { field: "square_footage", op: "gt", value: 2_000 }],
  },
});

export const LC_ELEC_COMM_AMPS_UPTO_150: FeeRuleRecord = lcRule({
  id: "lc-elec-comm-amps-upto-150",
  code: "ELEC-COMM-AMPS-UPTO-150",
  label: "Commercial electrical service, up to 150 amps — $130.00",
  description:
    'Resolution 21-019, Commercial Electrical Permit Fees, "New (in Amps)": "Up thru 150 — $130.00." The commercial table prices a new service by its amperage, in four rows; this is the lowest.',
  feeType: "flat",
  config: { amountCents: 13_000 },
  conditions: {
    all: [COMMERCIAL_ELECTRICAL, { field: "custom.amperage", op: "lte", value: 150 }],
  },
});

export const LC_ELEC_COMM_AMPS_151_200: FeeRuleRecord = lcRule({
  id: "lc-elec-comm-amps-151-200",
  code: "ELEC-COMM-AMPS-151-200",
  label: "Commercial electrical service, 151–200 amps — $200.00",
  description:
    'Resolution 21-019, Commercial Electrical Permit Fees: "151 thru 200 — $200.00."',
  feeType: "flat",
  config: { amountCents: 20_000 },
  conditions: {
    all: [
      COMMERCIAL_ELECTRICAL,
      { field: "custom.amperage", op: "gte", value: 151 },
      { field: "custom.amperage", op: "lte", value: 200 },
    ],
  },
});

export const LC_ELEC_COMM_AMPS_201_400: FeeRuleRecord = lcRule({
  id: "lc-elec-comm-amps-201-400",
  code: "ELEC-COMM-AMPS-201-400",
  label: "Commercial electrical service, 201–400 amps — $300.00",
  description:
    'Resolution 21-019, Commercial Electrical Permit Fees: "201 thru 400 — $300.00."',
  feeType: "flat",
  config: { amountCents: 30_000 },
  conditions: {
    all: [
      COMMERCIAL_ELECTRICAL,
      { field: "custom.amperage", op: "gte", value: 201 },
      { field: "custom.amperage", op: "lte", value: 400 },
    ],
  },
});

export const LC_ELEC_COMM_AMPS_OVER_400: FeeRuleRecord = lcRule({
  id: "lc-elec-comm-amps-over-400",
  code: "ELEC-COMM-AMPS-OVER-400",
  label: "Commercial electrical service, 401 or more amps — $300.00 plus $50.00 per 100 amps",
  description:
    'Resolution 21-019, Commercial Electrical Permit Fees: "401 or more — $300.00 plus $50.00 per 100 amps over 401 amps." Like the fee table, this row prints no "or fraction thereof", so the hundreds of amperes are prorated: 451 amps is $300.00 plus $25.00, not $350.00. The row opens at exactly what the 201–400 row charges — $300.00 — so 401 amps and 400 amps cost the same.',
  feeType: "percent",
  config: {
    basis: "amperage",
    baseCents: 30_000,
    thresholdCents: 401,
    rate: { numerator: 50, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [COMMERCIAL_ELECTRICAL, { field: "custom.amperage", op: "gte", value: 401 }],
  },
});

export const LC_ELEC_PLAN_REVIEW: FeeRuleRecord = lcRule({
  id: "lc-elec-plan-review",
  code: "ELEC-PLAN-REVIEW",
  label: "Electrical plan review, $45.00 unless part of the building permit",
  description:
    'Resolution 21-019, Commercial Electrical Permit Fees: "Plan Review (unless part of bldg. permit) — $45.00." The row is in the commercial section and is charged when the electrical plans are reviewed on their own — the schedule\'s own parenthesis is the condition, so this rule is asked for rather than assumed. The separate BUILDING PLAN CHECK of 25% of the building permit fee is a different fee for a different review and is not added by this rule.',
  feeType: "flat",
  config: { amountCents: 4_500 },
  conditions: { field: "custom.plan_review", op: "eq", value: true },
  componentType: "plan_review",
});

export const LC_ELEC_TEMP_SERVICE: FeeRuleRecord = lcRule({
  id: "lc-elec-temp-service",
  code: "ELEC-TEMP-SERVICE",
  label: "Temporary service or system, $45.00",
  description:
    'Resolution 21-019, Miscellaneous Inspection Work — both sections: "Temporary Service/System — $45.00." The same price in the residential and commercial lists, so one rule serves both.',
  feeType: "flat",
  config: { amountCents: 4_500 },
  conditions: { field: "custom.temp_service", op: "eq", value: true },
});

export const LC_ELEC_POOL_RESIDENTIAL: FeeRuleRecord = lcRule({
  id: "lc-elec-pool-residential",
  code: "ELEC-POOL-RESIDENTIAL",
  label: "Swimming pool, residential — $90.00",
  description:
    'Resolution 21-019, Residential Miscellaneous Inspection Work: "Swimming Pools — $90.00." Charged for a pool permit on a one- or two-family dwelling, townhouse or duplex; the commercial list prices the same work at $180.00.',
  feeType: "flat",
  config: { amountCents: 9_000 },
  conditions: {
    all: [
      { field: "custom.swimming_pool", op: "eq", value: true },
      { field: "custom.one_two_family", op: "eq", value: true },
    ],
  },
});

export const LC_ELEC_POOL_COMMERCIAL: FeeRuleRecord = lcRule({
  id: "lc-elec-pool-commercial",
  code: "ELEC-POOL-COMMERCIAL",
  label: "Swimming pool, commercial — $180.00",
  description:
    'Resolution 21-019, Commercial Miscellaneous Inspection Work: "Swimming Pools — $180.00." Charged when the pool permit is not on a one-and-two-family dwelling; a dwelling type left unanswered leaves the pool unpriced rather than defaulting to either published rate.',
  feeType: "flat",
  config: { amountCents: 18_000 },
  conditions: {
    all: [
      { field: "custom.swimming_pool", op: "eq", value: true },
      { field: "custom.one_two_family", op: "neq", value: true },
    ],
  },
});

export const LC_ELEC_MOBILE_HOME_SERVICE: FeeRuleRecord = lcRule({
  id: "lc-elec-mobile-home-service",
  code: "ELEC-MOBILE-HOME-SERVICE",
  label: "Mobile home service, $45.00",
  description:
    'Resolution 21-019, Residential Miscellaneous Inspection Work: "Mobile Home Service — $45.00." The row sits in the residential list, so it is charged on a residential permit; the separate MOBILE HOME INSTALLATION PERMIT ($75.00, "zoning and flood plain management") is a different permit and is named on the page rather than charged.',
  feeType: "flat",
  config: { amountCents: 4_500 },
  conditions: {
    all: [
      { field: "custom.mobile_home_service", op: "eq", value: true },
      { field: "occupancy", op: "eq", value: "residential" },
    ],
  },
});

export const LC_ELEC_ALT_ENERGY: FeeRuleRecord = lcRule({
  id: "lc-elec-alt-energy",
  code: "ELEC-ALT-ENERGY",
  label: "Alternative energy systems, $45.00",
  description:
    'Resolution 21-019, Residential Miscellaneous Inspection Work: "Alternative Energy Systems (does not include solar photo voltaic) — $45.00." The parenthesis is the schedule\'s own and it is what keeps this row and the $250.00 residential solar permit apart: a photovoltaic system is the solar row, everything else in this family is this row.',
  feeType: "flat",
  config: { amountCents: 4_500 },
  conditions: {
    all: [
      { field: "custom.alt_energy", op: "eq", value: true },
      { field: "occupancy", op: "eq", value: "residential" },
    ],
  },
});

export const LC_ELEC_LOW_VOLTAGE: FeeRuleRecord = lcRule({
  id: "lc-elec-low-voltage",
  code: "ELEC-LOW-VOLTAGE",
  label: "Low voltage, $45.00",
  description:
    'Resolution 21-019, Miscellaneous Inspection Work: "Low Voltage — $45.00", printed in the residential list and again in the commercial list at the same price.',
  feeType: "flat",
  config: { amountCents: 4_500 },
  conditions: { field: "custom.low_voltage", op: "eq", value: true },
});

export const LC_ELEC_SOLAR_PV_RESIDENTIAL: FeeRuleRecord = lcRule({
  id: "lc-elec-solar-pv-residential",
  code: "ELEC-SOLAR-PV-RESIDENTIAL",
  label: "Residential solar photovoltaic system — $250.00, inspections included",
  description:
    'Resolution 21-019, Solar Photo Voltaic System Permit Fee: "Residential solar photo voltaic system (including plan review, building inspection, and electrical inspection): $250.00." A bundled fee — the three reviews it names are inside it — which is why the residential area rows are excluded when this one applies rather than charged alongside it. "Commercial solar photo voltaic system fees are calculated using the commercial building process", so a commercial array is not an electrical-permit figure at all.',
  feeType: "flat",
  config: { amountCents: 25_000 },
  conditions: {
    all: [
      { field: "custom.solar_pv", op: "eq", value: true },
      { field: "occupancy", op: "eq", value: "residential" },
    ],
  },
});

function lcTradeTechnologyFee(id: string, code: string): FeeRuleRecord {
  return lcRule({
    id,
    code,
    label: "Technology fee, trade permit — $10.00",
    description:
      'Resolution 21-019, Administrative Fees: "Technology Fee — Trade Permit (Electrical, Plumbing, Mechanical & Rock Wall): $10 per permit." The trade row of the technology table, flat, on every trade permit.',
    feeType: "flat",
    config: { amountCents: LC_TRADE_TECHNOLOGY_FEE_CENTS },
    componentType: "other",
    priority: 200,
  });
}

export const LC_ELEC_TECHNOLOGY_FEE = lcTradeTechnologyFee(
  "lc-elec-tech-fee",
  "ELEC-TECHNOLOGY-FEE",
);

export const LC_ELEC_UNPERMITTED: FeeRuleRecord = lcRule({
  id: "lc-elec-unpermitted",
  code: "ELEC-UNPERMITTED-WORK",
  label: "Work without a permit — the permit fee tripled",
  description:
    'Resolution 21-019, Electrical Permit Fees: "Fee is due at the time of permit issuance and is tripled on permits for work started or completed without an approved permit." Twice the permit fee again, on top of the once the permit itself costs.',
  feeType: "percent",
  config: { basis: "permit_fee", rate: LC_UNPERMITTED_RATE },
  conditions: { field: "custom.unpermitted_work", op: "eq", value: true },
  componentType: "surcharge",
  priority: 900,
});

export const LC_ELEC_REINSPECTION: FeeRuleRecord = lcRule({
  id: "lc-elec-reinspection",
  code: "ELEC-REINSPECTION",
  label: "Reinspection, $45.00 per occurrence",
  description:
    'Resolution 21-019, INSPECTION FEES: "Reinspection Fee — $45.00 per occurrence", applying to all inspections of any type, electrical among them.',
  feeType: "flat",
  config: { amountCents: LC_REINSPECTION_CENTS },
  conditions: { field: "custom.reinspection", op: "eq", value: true },
  componentType: "inspection",
  priority: 300,
});

export const LC_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  LC_ELEC_RES_AREA_UNDER_1000,
  LC_ELEC_RES_AREA_1000_1499,
  LC_ELEC_RES_AREA_1500_2000,
  LC_ELEC_RES_AREA_OVER_2000,
  LC_ELEC_COMM_AMPS_UPTO_150,
  LC_ELEC_COMM_AMPS_151_200,
  LC_ELEC_COMM_AMPS_201_400,
  LC_ELEC_COMM_AMPS_OVER_400,
  LC_ELEC_PLAN_REVIEW,
  LC_ELEC_TEMP_SERVICE,
  LC_ELEC_POOL_RESIDENTIAL,
  LC_ELEC_POOL_COMMERCIAL,
  LC_ELEC_MOBILE_HOME_SERVICE,
  LC_ELEC_ALT_ENERGY,
  LC_ELEC_LOW_VOLTAGE,
  LC_ELEC_SOLAR_PV_RESIDENTIAL,
  LC_ELEC_TECHNOLOGY_FEE,
  LC_ELEC_UNPERMITTED,
  LC_ELEC_REINSPECTION,
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — bathroom counts for new dwellings, valuation otherwise  */
/* -------------------------------------------------------------------------- */

/**
 * "For new construction, the fee is based on the number of bathrooms and/or dwelling
 * units." The gate is the same residential-new sentence the building path uses; the
 * bathroom count is then read per rule, because the schedule's three bands are by *pairs*
 * of facts — units and baths — and a project that answers one without the other is
 * unpriced rather than guessed.
 */
const RES_NEW_PLUMBING = RES_NEW_BUILDING;

export const LC_PLUMB_NEW_1DU: FeeRuleRecord = lcRule({
  id: "lc-plumb-new-1du",
  code: "PLUMB-NEW-1DU",
  label: "New one-dwelling-unit structure, 1½ baths or less — $100.00",
  description:
    'Resolution 21-019, Residential Plumbing Permit Fees: "For new construction, the fee is based on the number of bathrooms and/or dwelling units. Please note that a roughed-in bathroom constitutes a bathroom. One dwelling unit structures (1½ baths or less) — $100.00." A rough-in counts, which is what the parenthetical note is there to settle.',
  feeType: "flat",
  config: { amountCents: 10_000 },
  conditions: {
    all: [
      RES_NEW_PLUMBING,
      { field: "units", op: "eq", value: 1 },
      { field: "custom.bathrooms", op: "lte", value: 1.5 },
    ],
  },
});

export const LC_PLUMB_NEW_1OR2DU_MID: FeeRuleRecord = lcRule({
  id: "lc-plumb-new-1or2du-mid",
  code: "PLUMB-NEW-1OR2DU-MID",
  label: "New one- or two-dwelling-unit structure, 2–3½ baths — $150.00",
  description:
    'Resolution 21-019, Residential Plumbing Permit Fees: "One or two dwelling unit structures (2 to 3½ baths) — $150.00." The band runs from just above 1½ baths to 3½, on a one- or two-unit structure; a bathroom count between 3½ and 4 is not in any printed band and is left unpriced rather than moved into one.',
  feeType: "flat",
  config: { amountCents: 15_000 },
  conditions: {
    all: [
      RES_NEW_PLUMBING,
      { field: "units", op: "in", value: [1, 2] },
      { field: "custom.bathrooms", op: "gt", value: 1.5 },
      { field: "custom.bathrooms", op: "lte", value: 3.5 },
    ],
  },
});

export const LC_PLUMB_NEW_1OR2DU_4PLUS: FeeRuleRecord = lcRule({
  id: "lc-plumb-new-1or2du-4plus",
  code: "PLUMB-NEW-1OR2DU-4PLUS",
  label: "New one- or two-dwelling-unit structure, 4 or more baths — $200.00",
  description:
    'Resolution 21-019, Residential Plumbing Permit Fees: "One or two dwelling unit structures (4 or more baths) — $200.00." The same $200 the multi-unit row opens with, reached by bathrooms rather than by units.',
  feeType: "flat",
  config: { amountCents: 20_000 },
  conditions: {
    all: [
      RES_NEW_PLUMBING,
      { field: "units", op: "in", value: [1, 2] },
      { field: "custom.bathrooms", op: "gte", value: 4 },
    ],
  },
});

export const LC_PLUMB_NEW_OVER_2DU: FeeRuleRecord = lcRule({
  id: "lc-plumb-new-over-2du",
  code: "PLUMB-NEW-OVER-2DU",
  label: "New structure over two dwelling units — $200.00 plus $30.00 per unit above two",
  description:
    'Resolution 21-019, Residential Plumbing Permit Fees: "Structures containing more than two dwelling units — $200.00 plus 30.00 per unit over two units." Charged per dwelling unit past the first two, on the units fact rather than on a count entered twice.',
  feeType: "per_unit",
  config: {
    unit: "dwelling_units",
    baseCents: 20_000,
    thresholdUnits: 2,
    centsPerUnit: 3_000,
  },
  conditions: {
    all: [RES_NEW_PLUMBING, { field: "units", op: "gt", value: 2 }],
  },
});

function lcPlumbingValuationRule(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<Pick<FeeRuleRecord, "conditions" | "description">>,
): FeeRuleRecord {
  const { conditions, ...rest } = overrides;
  return lcRule({
    ...rest,
    conditions: {
      all: [{ not: RES_NEW_PLUMBING }, ...(conditions ? [conditions] : [])],
    },
  });
}

export const LC_PLUMB_VAL_LE_500: FeeRuleRecord = lcPlumbingValuationRule({
  id: "lc-plumb-val-le-500",
  code: "PLUMB-VAL-LE-500",
  label: "Plumbing valuation $500 or less — $50.00",
  description:
    'Resolution 21-019, Commercial Plumbing Permit Fees: "Fees shall be computed based on the total dollar value of the complete plumbing installation including materials, fixtures, and all installation costs. $500.00 or less — $50.00." This is the table the residential rows point at for anything that is not new construction — "Remodel and/or Addition: Based on plumbing valuation (see commercial)" — so a remodel of a house and a job in a business are priced by the same three rows.',
  feeType: "flat",
  config: { amountCents: 5_000 },
  conditions: { field: "valuation", op: "lte", value: 50_000 },
});

export const LC_PLUMB_VAL_501_1000: FeeRuleRecord = lcPlumbingValuationRule({
  id: "lc-plumb-val-501-1000",
  code: "PLUMB-VAL-501-1000",
  label: "Plumbing valuation $500.01–$1,000 — $100.00",
  description:
    'Resolution 21-019, Commercial Plumbing Permit Fees: "$500.01 through $1000.00 — $100.00."',
  feeType: "flat",
  config: { amountCents: 10_000 },
  conditions: {
    all: [
      { field: "valuation", op: "gt", value: 50_000 },
      { field: "valuation", op: "lte", value: 100_000 },
    ],
  },
});

export const LC_PLUMB_VAL_OVER_1000: FeeRuleRecord = lcPlumbingValuationRule({
  id: "lc-plumb-val-over-1000",
  code: "PLUMB-VAL-OVER-1000",
  label: "Plumbing valuation above $1,000 — $100.00 plus $5.00 per $1,000 or fraction",
  description:
    'Resolution 21-019, Commercial Plumbing Permit Fees: "$1000.01 and above — $100.00 for the first $1000.00 plus 5.00 for each additional $1000.00 or fraction thereof." This is one of the three rows that does print "or fraction thereof", so the additional thousands are rounded up — a $1,100 plumbing valuation pays for two thousands, not one and a tenth. The mechanical ladder in the same document is worded identically and is modelled the same way; the fee table, which omits the phrase, is not.',
  feeType: "per_thousand",
  config: {
    basis: "valuation",
    baseCents: 10_000,
    thresholdCents: 100_000,
    centsPerThousand: 500,
    incrementCents: 100_000,
  },
  conditions: { field: "valuation", op: "gt", value: 100_000 },
});

export const LC_PLUMB_TECHNOLOGY_FEE = lcTradeTechnologyFee(
  "lc-plumb-tech-fee",
  "PLUMB-TECHNOLOGY-FEE",
);

export const LC_PLUMB_UNPERMITTED: FeeRuleRecord = lcRule({
  id: "lc-plumb-unpermitted",
  code: "PLUMB-UNPERMITTED-WORK",
  label: "Work without a permit — the permit fee tripled",
  description:
    'Resolution 21-019, Plumbing Permit Fee: "This fee is tripled on permits for work started or completed without an approved permit." Twice the permit fee again — and the same sentence stands above the mechanical, roofing, demolition, grading, sign and right-of-way schedules.',
  feeType: "percent",
  config: { basis: "permit_fee", rate: LC_UNPERMITTED_RATE },
  conditions: { field: "custom.unpermitted_work", op: "eq", value: true },
  componentType: "surcharge",
  priority: 900,
});

export const LC_PLUMB_REINSPECTION: FeeRuleRecord = lcRule({
  id: "lc-plumb-reinspection",
  code: "PLUMB-REINSPECTION",
  label: "Reinspection, $45.00 per occurrence",
  description:
    'Resolution 21-019, INSPECTION FEES: "Reinspection Fee — $45.00 per occurrence ... Reinspection Fees are due before any other inspections may be performed."',
  feeType: "flat",
  config: { amountCents: LC_REINSPECTION_CENTS },
  conditions: { field: "custom.reinspection", op: "eq", value: true },
  componentType: "inspection",
  priority: 300,
});

export const LC_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  LC_PLUMB_NEW_1DU,
  LC_PLUMB_NEW_1OR2DU_MID,
  LC_PLUMB_NEW_1OR2DU_4PLUS,
  LC_PLUMB_NEW_OVER_2DU,
  LC_PLUMB_VAL_LE_500,
  LC_PLUMB_VAL_501_1000,
  LC_PLUMB_VAL_OVER_1000,
  LC_PLUMB_TECHNOLOGY_FEE,
  LC_PLUMB_UNPERMITTED,
  LC_PLUMB_REINSPECTION,
];
