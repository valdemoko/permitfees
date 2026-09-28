import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * King County, Washington fee rules — REAL DATA.
 *
 * Three documents, from three different authorities, price the three permits this
 * jurisdiction publishes. That is the finding this jurisdiction contributes, and it is
 * not a filing convention: in unincorporated King County the county sets the building
 * fee, **the state** sets the electrical fee, and the **county's public health
 * department** sets the plumbing fee.
 *
 *  S1  King County Department of Local Services, Permitting Division,
 *      **2026 Fee Guide 04 — Commercial or Multifamily Residential Building
 *      Construction** (December 2025), sha256 beginning 72ef257d6aab25d1.
 *      Two valuation tables, "Building or Mechanical Plan Review Fee" and "Building or
 *      Mechanical Inspection Fee", plus the state surcharge row.
 *
 *  S2  King County Department of Local Services, Permitting Division,
 *      **2026 Fee Guide 02 — Single Family Residential Construction** (December 2025).
 *      The same two tables are not repeated here; what this guide adds is the residential
 *      state surcharge row, which is **$6.50 rather than the commercial guide's $25**.
 *      It also states the split of authorities in its own margin: "Electrical permits are
 *      issued by the WA State Department of Labor & Industries. On-site septic design and
 *      installation, plumbing, and gas-piping permits are issued by Seattle-King County
 *      Public Health."
 *
 *  S3  Public Health — Seattle & King County, **Plumbing and Gas Piping Program
 *      service fees, effective January 1, 2026**, sha256 beginning 8c320351a45027d9.
 *      The same program that prices plumbing permits in Seattle, because the City's own
 *      subtitle says so: SMC 22.900G.030 directs plumbing fees to "the Director of King
 *      County Public Health".
 *
 *  S4  Washington State Department of Labor & Industries, **WAC 296-46B-906,
 *      "Inspection fees"**, as published by the Washington State Legislature. Outside
 *      Seattle, Tacoma and Tacoma Power's service area, electrical permits are the
 *      state's: "All other jobsites in Washington are permitted and inspected by L&I."
 *
 * **The building fee is two tables, not one.** The guide's own method section: the
 * County's valuation "is then applied to the fee tables below to determine the required
 * plan review and inspection fees." The plan review table is what an applicant pays at
 * application and the inspection table is what they pay at permit issuance, and **both
 * close at every one of their six seams** — $788, $1,303, $1,988, $6,548, $10,548 and
 * $37,948 for plan review, and $1,298, $2,068, $3,153, $9,993, $16,843 and $58,043 for
 * inspection. No jurisdiction published before this one splits its fee into two
 * valuation tables, which is why the pages here show two figures where every other
 * jurisdiction's page shows one.
 *
 * **What this module does not model:** the guides' flat minimum fees for named
 * structures (change of use, antenna, tower, sign, demolition, generator, tank, alarm
 * and sprinkler systems, with their per-device and per-head rows), the occupancy and
 * operating permit fees, and the single-family guide's review and inspection rows, which
 * are priced by square foot or by named job. They are quoted on the pages with their
 * published figures rather than charged. Also not modelled: the state's annual electrical
 * permits, its per-square-foot residential new-construction rows and its hourly charges.
 */

export const KING_COUNTY_FEE_EFFECTIVE_FROM = "2026-01-01";

export const KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY = "king-county-fee-guide-04-2026";
export const KING_COUNTY_SFR_GUIDE_SOURCE_KEY = "king-county-fee-guide-02-2026";
export const KING_COUNTY_PLUMBING_SOURCE_KEY = "king-county-plumbing-gas-fees-2026";
export const WA_LNI_ELECTRICAL_SOURCE_KEY = "wa-wac-296-46b-906";

/** Guide 04: "$25 minimum fee per building permit". Guide 02: "$6.50". */
export const KING_COUNTY_SURCHARGE_COMMERCIAL_CENTS = 2_500;
export const KING_COUNTY_SURCHARGE_RESIDENTIAL_CENTS = 650;
/** Both guides and RCW 19.27.085(3): "$2.00 for each residential unit after the first". */
export const KING_COUNTY_SURCHARGE_UNIT_CENTS = 200;

/**
 * The fact a caller sets to name the occupancy the surcharge depends on.
 *
 * "residential" and "single_family" both read as residential, matching the wording of
 * the statute the charge implements; anything else — including nothing — is priced as the
 * commercial row of Guide 04, because that is the guide these pages quote.
 */
export const KING_COUNTY_BUILDING_CLASS_FACT = "custom.building_class";
const RESIDENTIAL_CLASSES = ["residential", "single_family"] as const;

const SOURCE = KING_COUNTY_BUILDING_GUIDE_SOURCE_KEY;

function countyRule(
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
    effectiveFrom: KING_COUNTY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: SOURCE,
    ...overrides,
  };
}

/**
 * One band: [lowerExclusive, upperInclusive | null, base, threshold, rate per $1,000].
 *
 * **There is no rounding increment, and that is a reading of the document rather than an
 * omission.** These guides write "$103, plus $27.40 per $1,000 of Value" and never add
 * the words "or fraction thereof" — the phrase appears **zero** times in both guides,
 * where Boulder City's table, Clark County's table and Denver's table all print it where
 * they mean a valuation is rounded up to the next step. Modelled as printed, the rate is
 * therefore charged on the exact number of thousands: a $12,500 valuation pays for 12.5
 * of them, $445.50, rather than being rounded up to 13 and paying $459.20. The
 * consequence is stated on the building page as a reading, with the alternative and its
 * size, because the guide is silent rather than explicit.
 */
type Band = readonly [
  lowerExclusiveCents: number,
  upperInclusiveCents: number | null,
  baseCents: number,
  thresholdCents: number,
  centsPerThousand: number,
];

/** "Building or Mechanical Plan Review Fee" — Guide 04's first valuation table. */
const PLAN_REVIEW_BANDS: readonly Band[] = [
  [0, 2_500_000, 10_300, 0, 2_740],
  [2_500_000, 5_000_000, 78_800, 2_500_000, 2_060],
  [5_000_000, 10_000_000, 130_300, 5_000_000, 1_370],
  [10_000_000, 50_000_000, 198_800, 10_000_000, 1_140],
  [50_000_000, 100_000_000, 654_800, 50_000_000, 800],
  [100_000_000, 500_000_000, 1_054_800, 100_000_000, 685],
  [500_000_000, null, 3_794_800, 500_000_000, 570],
];

/** "Building or Mechanical Inspection Fee" — Guide 04's second valuation table. */
const INSPECTION_BANDS: readonly Band[] = [
  [0, 2_500_000, 18_300, 0, 4_460],
  [2_500_000, 5_000_000, 129_800, 2_500_000, 3_080],
  [5_000_000, 10_000_000, 206_800, 5_000_000, 2_170],
  [10_000_000, 50_000_000, 315_300, 10_000_000, 1_710],
  [50_000_000, 100_000_000, 999_300, 50_000_000, 1_370],
  [100_000_000, 500_000_000, 1_684_300, 100_000_000, 1_030],
  [500_000_000, null, 5_804_300, 500_000_000, 740],
];

/** The guide's band headings are printed with two decimal places; these reproduce them. */
function money(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function bandRules(
  prefix: "pr" | "insp",
  label: string,
  quotedFrom: string,
  bands: readonly Band[],
  componentType: "plan_review" | "inspection",
): FeeRuleRecord[] {
  return bands.map(([lower, upper, base, threshold, rate], index) => {
    // The guide prints its bands as "$1 - $25,000.00" and "$25,000.01 - $50,000.00",
    // so the opening figure is the stored lower bound plus one cent.
    const opening = lower === 0 ? 100 : lower + 1;
    const range = upper === null ? `Over ${money(lower)}` : `${money(opening)} to ${money(upper)}`;
    const rest =
      threshold > 0
        ? `${money(base)}, plus ${money(rate)} per $1,000 of Value > ${money(threshold)}`
        : `${money(base)}, plus ${money(rate)} per $1,000 of Value`;
    return countyRule({
      id: `king-${prefix}-${index + 1}`,
      code: `${prefix.toUpperCase()}-${index + 1}`,
      label: `${label}, ${range}`,
      description: `"${quotedFrom}": "${range} — ${rest}".`,
      feeType: "per_thousand",
      componentType,
      config: {
        basis: "valuation",
        baseCents: base,
        thresholdCents: threshold,
        centsPerThousand: rate,
      },
      conditions:
        upper === null
          ? { field: "valuation", op: "gt", value: lower }
          : {
              all: [
                { field: "valuation", op: "gt", value: lower },
                { field: "valuation", op: "lte", value: upper },
              ],
            },
    });
  });
}

export const KING_COUNTY_PLAN_REVIEW_RULES: FeeRuleRecord[] = bandRules(
  "pr",
  "Plan review fee",
  "Building or Mechanical Plan Review Fee",
  PLAN_REVIEW_BANDS,
  "plan_review",
);

export const KING_COUNTY_INSPECTION_RULES: FeeRuleRecord[] = bandRules(
  "insp",
  "Inspection fee",
  "Building or Mechanical Inspection Fee",
  INSPECTION_BANDS,
  "inspection",
);

/**
 * The state surcharge, under RCW 19.27.085, as **both** county guides print it.
 *
 * Guide 04, for commercial and multifamily work: "State building code surcharge: minimum
 * fee per building permit $25.00; fee per additional dwelling unit permitted $2.00".
 * Guide 02, for single-family work: "State building code surcharge (b) $6.50", with the
 * footnote "the State surcharge is not applicable to mechanical, sprinkler system, or
 * tank permits".
 *
 * Two rows for one statutory charge, because the County's own documents disagree about
 * the amount and each is right for the occupancy it covers — which is also what the
 * statute says: $6.50 on each residential building permit and $25.00 on each commercial
 * one. A caller that names nothing is priced as commercial, because that is the guide a
 * commercial project is filed under and the one whose row this site's pages quote.
 */
export const KING_COUNTY_STATE_SURCHARGE_RULES: FeeRuleRecord[] = [
  countyRule({
    id: "king-surcharge-commercial",
    code: "STATE-SURCHARGE-COMMERCIAL",
    label: "State building code surcharge, commercial or multifamily",
    description:
      'Guide 04: "State building code surcharge: minimum fee per building permit $25.00". RCW 19.27.085(2) sets $25.00 on a commercial building permit. Charged unless the permit is named a single-family one.',
    feeType: "flat",
    componentType: "state_surcharge",
    priority: 900,
    config: { amountCents: KING_COUNTY_SURCHARGE_COMMERCIAL_CENTS },
    conditions: {
      field: KING_COUNTY_BUILDING_CLASS_FACT,
      op: "not_in",
      value: [...RESIDENTIAL_CLASSES],
    },
  }),
  countyRule({
    id: "king-surcharge-residential",
    code: "STATE-SURCHARGE-RESIDENTIAL",
    label: "State building code surcharge, single-family residential",
    description:
      'Guide 02: "State building code surcharge (b) $6.50", and RCW 19.27.085(2) sets $6.50 on each residential building permit. Applied when the permit is named a single-family one, and not to a mechanical, sprinkler or tank permit, per the same footnote.',
    feeType: "flat",
    componentType: "state_surcharge",
    priority: 900,
    sourceId: KING_COUNTY_SFR_GUIDE_SOURCE_KEY,
    config: { amountCents: KING_COUNTY_SURCHARGE_RESIDENTIAL_CENTS },
    conditions: {
      field: KING_COUNTY_BUILDING_CLASS_FACT,
      op: "in",
      value: [...RESIDENTIAL_CLASSES],
    },
  }),
  countyRule({
    id: "king-surcharge-additional-units",
    code: "STATE-SURCHARGE-ADDITIONAL-UNITS",
    label: "State building code surcharge, each additional dwelling unit",
    description:
      'Guide 04: "fee per additional dwelling unit permitted $2.00", which is RCW 19.27.085(3)\'s "additional surcharge of two dollars for each residential unit, but not including the first unit". Charged per unit after the first.',
    feeType: "per_unit",
    componentType: "state_surcharge",
    priority: 900,
    config: {
      unit: "dwelling_units",
      baseCents: 0,
      thresholdUnits: 1,
      centsPerUnit: KING_COUNTY_SURCHARGE_UNIT_CENTS,
    },
    conditions: { field: "units", op: "gt", value: 1 },
  }),
];

/** A building permit: both valuation tables plus the state surcharge. */
export const KING_COUNTY_BUILDING_RULES: FeeRuleRecord[] = [
  ...KING_COUNTY_PLAN_REVIEW_RULES,
  ...KING_COUNTY_INSPECTION_RULES,
  ...KING_COUNTY_STATE_SURCHARGE_RULES,
];

/**
 * A mechanical permit: the same two tables, and no state surcharge.
 *
 * The tables are published as "Building **or Mechanical** Plan Review Fee" and
 * "Building **or Mechanical** Inspection Fee" — one pair of tables for both — so a
 * mechanical permit is priced by the same arithmetic and differs in exactly one line.
 * The guides' footnotes are what remove it: "the State surcharge is not applicable to
 * mechanical, sprinkler system, or tank permits."
 */
export const KING_COUNTY_MECHANICAL_RULES: FeeRuleRecord[] = [
  ...KING_COUNTY_PLAN_REVIEW_RULES,
  ...KING_COUNTY_INSPECTION_RULES,
];

/**
 * Plumbing and gas piping, priced by Public Health — Seattle & King County.
 *
 * "Plumbing/Backflow Permit — $137 plus $27 per Fixture", "Gas Piping/Medical Gas
 * Permit — $137 plus $27 per Outlet", plan review at $273/hour, a $137 re-inspection and
 * a $41 administrative fee. The base is charged once and each fixture after that, so the
 * allowance is zero: the $137 is a base charge, not a first fixture, and a one-fixture
 * permit pays $164.00.
 *
 * This module is the single definition of these rules, and **Seattle's payload imports
 * them**, because the City's own fee subtitle says the county's health department
 * collects them (SMC 22.900G.030).
 */
export const KING_COUNTY_PLUMBING_RULES: FeeRuleRecord[] = [
  countyRule({
    id: "king-plumbing-per-fixture",
    code: "PLUMBING-PER-FIXTURE",
    label: "Plumbing or backflow permit, $137.00 plus $27.00 per fixture",
    description:
      'Plumbing and Gas Piping Program fees: "Plumbing/Backflow Permit — $137 plus $27 per Fixture", effective January 1, 2026. The $137 is a base charge rather than a first fixture, which is why the allowance is zero and a one-fixture permit pays $164.00.',
    feeType: "per_unit",
    sourceId: KING_COUNTY_PLUMBING_SOURCE_KEY,
    config: {
      unit: "fixtures",
      baseCents: 13_700,
      thresholdUnits: 0,
      centsPerUnit: 2_700,
    },
    conditions: { field: "custom.permit_kind", op: "absent" },
  }),
  countyRule({
    id: "king-plumbing-reinspection",
    code: "PLUMBING-REINSPECTION",
    label: "Re-inspection",
    description:
      'The same schedule: "Re-inspection — $137". A charge for a second visit, not part of the permit.',
    feeType: "flat",
    sourceId: KING_COUNTY_PLUMBING_SOURCE_KEY,
    config: { amountCents: 13_700 },
    conditions: { field: "custom.reinspection", op: "eq", value: true },
  }),
  countyRule({
    id: "king-plumbing-abc",
    code: "PLUMBING-ALREADY-BUILT",
    label: "Already Built Construction permit, $273.00 plus $55.00 per fixture",
    description:
      'The same schedule: "Already Built Construction (ABC) Permit — $273 plus $55 per Fixture/Outlet", for work "done without having paid any permit fees", with the schedule\'s own note that fees already paid are subtracted from it.',
    feeType: "per_unit",
    sourceId: KING_COUNTY_PLUMBING_SOURCE_KEY,
    config: {
      unit: "fixtures",
      baseCents: 27_300,
      thresholdUnits: 0,
      centsPerUnit: 5_500,
    },
    conditions: { field: "custom.permit_kind", op: "eq", value: "already_built" },
  }),
];

/**
 * Electrical, priced by the state.
 *
 * WAC 296-46B-906 says how the fee is calculated in one sentence: "To calculate
 * inspection fees, the amperage is based on the conductor ampacity or the overcurrent
 * device rating." The rows here are the ones an ordinary job lands in, with the
 * amperage bands exactly as the section prints them.
 *
 * Three structural notes, because they are what a reader gets wrong:
 *
 *   - The section opens with **two tracks, residential and commercial**, that price the
 *     same amperage differently: a 200 A altered service is $109.90 under (1)(c) and
 *     $129.40 under (2)(b). The pages here take the residential band unless the caller
 *     names a commercial job, because an altered service in an existing home is what the
 *     section's first subsection exists for.
 *   - The residential circuits row carries the section's own cap, in its note: "Total
 *     cost of the alterations in an individual panel should not exceed the cost of a
 *     complete altered service or feeder of the same rating." The rule is capped at the
 *     $109.90 of a 0–200 A altered service, which is the common residential case.
 *   - **Plan review is 35% of the electrical permit fee** under subsection (9)(a). It is
 *     quoted on the page rather than modelled, because it applies only where plans are
 *     submitted.
 *
 * Not modelled and named instead: the residential new-construction rows, which are
 * charged per square foot ($119.90 for the first 1,300 sq ft and $38.20 for each
 * additional 500 sq ft); the low-voltage row, which is charged per 2,500 sq ft; every
 * hourly and portal-to-portal rate; and the annual permit fees.
 */
const AMPS = "custom.service_amps";
const ITEM = "custom.schedule_item";

/** Amperage bands as the section prints them: [lowerExclusive, upperInclusive | null, feeCents]. */
type AmpBand = readonly [lower: number, upper: number | null, cents: number];

function ampRules(
  idPrefix: string,
  codePrefix: string,
  label: string,
  quoted: string,
  itemValue: string,
  bands: readonly AmpBand[],
): FeeRuleRecord[] {
  return bands.map(([lower, upper, cents], index) => {
    const range = upper === null ? `${lower} amperes and over` : `${lower} to ${upper} amperes`;
    return countyRule({
      id: `${idPrefix}-${index + 1}`,
      code: `${codePrefix}-${index + 1}`,
      label: `${label}, ${range}`,
      description: `${quoted}: "${range} — ${money(cents)}".`,
      feeType: "flat",
      sourceId: WA_LNI_ELECTRICAL_SOURCE_KEY,
      config: { amountCents: cents },
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: itemValue },
          // `gt 0` even on the band that opens at zero: a missing amperage fact would
          // otherwise match the first band and charge it, which is the one outcome this
          // dataset treats as a defect rather than a default.
          { field: AMPS, op: "gt", value: lower },
          ...(upper === null ? [] : [{ field: AMPS, op: "lte" as const, value: upper }]),
        ],
      },
    });
  });
}

export const WA_LNI_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...ampRules(
    "wa-elec-altered-service",
    "LNI-ALTERED-SERVICE",
    "Altered residential service or feeder",
    "WAC 296-46B-906(1)(c)(i), single or multifamily altered services or feeders including circuits",
    "altered_service",
    [
      [0, 200, 10_990],
      [200, 600, 16_100],
      [600, null, 24_270],
    ],
  ),
  ...ampRules(
    "wa-elec-commercial-altered",
    "LNI-COMMERCIAL-ALTERED",
    "Altered commercial service or feeder, circuits excluded",
    "WAC 296-46B-906(2)(b)(i), commercial or industrial altered services and feeders, no circuits",
    "commercial_altered_service",
    [
      [0, 200, 12_940],
      [200, 600, 30_360],
      [600, 1_000, 45_790],
      [1_000, null, 50_860],
    ],
  ),
  ...ampRules(
    "wa-elec-temporary-service",
    "LNI-TEMPORARY-SERVICE",
    "Temporary service",
    "WAC 296-46B-906(3), temporary services, temporary stage or concert productions",
    "temporary_service",
    [
      [0, 60, 6_910],
      [60, 100, 7_880],
      [100, 200, 10_050],
      [200, 400, 11_990],
      [400, 600, 16_100],
      [600, null, 18_260],
    ],
  ),
  countyRule({
    id: "wa-elec-circuits-residential",
    code: "LNI-CIRCUITS-RESIDENTIAL",
    label: "Residential circuits only, $78.80 for the first four and $8.20 each after",
    description:
      'WAC 296-46B-906(1)(d), "Single or multifamily residential circuits only (no service inspection)": "1 to 4 circuits — $78.80", "Each additional circuit — $8.20". The section\'s own note caps it: "Total cost of the alterations in an individual panel should not exceed the cost of a complete altered service or feeder of the same rating" — so this rule carries the $109.90 ceiling of a 0–200 A altered service, which is the common residential case.',
    feeType: "per_unit",
    sourceId: WA_LNI_ELECTRICAL_SOURCE_KEY,
    config: {
      unit: "circuits",
      baseCents: 7_880,
      thresholdUnits: 4,
      centsPerUnit: 820,
    },
    maximumCents: 10_990,
    conditions: {
      all: [
        { field: "custom.circuits", op: "gt", value: 0 },
        { field: ITEM, op: "absent" },
      ],
    },
  }),
  countyRule({
    id: "wa-elec-circuits-commercial",
    code: "LNI-CIRCUITS-COMMERCIAL",
    label: "Commercial circuits, $100.50 for the first five and $8.20 each after",
    description:
      'WAC 296-46B-906(2)(c), "Circuits only": "First 5 circuits per branch circuit panel — $100.50", "Each additional circuit per branch circuit panel — $8.20", with the note that altered and added circuit fees "are calculated per panelboard". The row is charged *per branch-circuit panel*, so this rule prices one panel\'s circuits and the page says so; the cap in the same note refers to "the cost of a new feeder (or feeders) of the same rating", which varies with the rating and is therefore stated rather than modelled.',
    feeType: "per_unit",
    sourceId: WA_LNI_ELECTRICAL_SOURCE_KEY,
    config: {
      unit: "circuits",
      baseCents: 10_050,
      thresholdUnits: 5,
      centsPerUnit: 820,
    },
    conditions: { field: ITEM, op: "eq", value: "commercial_circuits" },
  }),
  countyRule({
    id: "wa-elec-generator",
    code: "LNI-GENERATOR-TRANSFER",
    label: "Transfer equipment for a portable generator",
    description:
      'WAC 296-46B-906(5)(g): "Portable generators: Permanently installed transfer equipment for portable generators — $109.90". The note above it sends a permanently installed generator to the service and feeder rows instead. A boolean rather than a named job, because a transfer switch is added to a service change rather than replacing it, and the section charges both.',
    feeType: "flat",
    sourceId: WA_LNI_ELECTRICAL_SOURCE_KEY,
    config: { amountCents: 10_990 },
    conditions: { field: "custom.generator_transfer", op: "eq", value: true },
  }),
  countyRule({
    id: "wa-elec-low-voltage",
    code: "LNI-LOW-VOLTAGE-FIRST-2500",
    label: "Low-voltage and telecommunications system, first 2,500 square feet",
    description:
      'WAC 296-46B-906(5)(b)(i): "First 2500 sq. ft. or less — $69.10", with "each additional 2500 sq. ft. or portion thereof — $18.30". The additional-area row is not modelled, because the section charges it by area and the row is stated in prose.',
    feeType: "flat",
    sourceId: WA_LNI_ELECTRICAL_SOURCE_KEY,
    config: { amountCents: 6_910 },
    conditions: { field: ITEM, op: "eq", value: "low_voltage" },
  }),
  countyRule({
    id: "wa-elec-signs",
    code: "LNI-SIGNS",
    label: "Signs and outline lighting, $59.50 for the first and $27.90 each after",
    description:
      'WAC 296-46B-906(5)(c): "First sign (no service included) — $59.50", "Each additional sign inspected at the same time on the same building or structure — $27.90".',
    feeType: "per_unit",
    sourceId: WA_LNI_ELECTRICAL_SOURCE_KEY,
    config: {
      unit: "signs",
      baseCents: 5_950,
      thresholdUnits: 1,
      centsPerUnit: 2_790,
    },
    conditions: { field: "custom.signs", op: "gt", value: 0 },
  }),
  countyRule({
    id: "wa-elec-over-600-volts",
    code: "LNI-OVER-600-VOLTS",
    label: "Over 600 volts surcharge, per permit",
    description:
      'WAC 296-46B-906(2)(d): "Over 600 volts surcharge per permit — $100.50". A surcharge on a permit rather than a permit of its own.',
    feeType: "flat",
    componentType: "surcharge",
    priority: 800,
    sourceId: WA_LNI_ELECTRICAL_SOURCE_KEY,
    config: { amountCents: 10_050 },
    conditions: { field: "custom.over_600_volts", op: "eq", value: true },
  }),
];
