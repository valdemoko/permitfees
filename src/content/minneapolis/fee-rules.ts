import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Minneapolis, Minnesota fee rules — REAL DATA.
 *
 * Sources (research/minnesota/minneapolis.md records how each was read):
 *
 *  S1  Minneapolis Building Permit Fee Schedule — the City's published Smartsheet,
 *      embedded on the Building permit fees page and served as static HTML.
 *      https://publish.smartsheet.com/5bac769dc10f49f7a65d69b39243a54f
 *  S2  Minneapolis Plumbing Fee Schedule — the City's published Smartsheet, embedded
 *      on the Plumbing permit fees page.
 *      https://publish.smartsheet.com/2fef8aaf1a294ca2a7b815ec6c2bf33b
 *  S3  Building permit fees / Plumbing permit fees pages — the City pages that embed
 *      the schedules ("Fees are updated upon City Council directive (or action)") and
 *      carry the department contact block.
 *      https://www.minneapolismn.gov/business-services/licenses-permits-inspections/construction-permits/permits-overview/fees/building/
 *  S4  DLI — "Electrical permits - contractors" and the statutory fee worksheets
 *      (ele-fee-new.pdf, ele-fee-exist.pdf, ele-fee-non.pdf, ele-fee-multi-*.pdf,
 *      REV 6.2025, "Fees are determined by Minnesota Statute 326B.37").
 *      https://www.dli.mn.gov/business/electrical-contractors/electrical-permits-contractors
 *
 * **The mechanism, in three sentences.** The building permit is a *formula printed on
 * the schedule itself* — "Building Permit Fee + Plan Review Fee (65% x building permit
 * fee) + MN State Surcharge (Value of Work x 0.0005) = Total Permit Fee" — where the
 * building permit fee is a nine-band ladder of "first $X plus $Y each additional $1,000
 * and fraction thereof", the plan review is 65% of the first component, and the state
 * surcharge is 0.0005 of the *work*. Plumbing is a price list of $41.40 rows with an
 * $85.20 minimum. And the electrical permit is not the City's at all: Minnesota's
 * Electrical Act (326B.37) gives the inspection to the state or its contract inspectors,
 * so the electrical page prices the permit with the statute's own worksheets.
 *
 * **Five readings this module depends on, all stated on the instruments.**
 *
 *  1. **The ladder is marginal, not cumulative-bracket, and rounds up per $1,000.**
 *     Every band after the first reads "first $X plus $Y each additional $1,000 and
 *     fraction thereof" — the marginal shape `tiered_marginal` exists for, with the
 *     fraction phrase per band. Minneapolis's own example anchors it: $104.20 at $2,001
 *     of value, which is the first $2,000 plus one whole $20.60 step for the $1 fraction.
 *  2. **The plan review is 65% of the permit fee, and both are of the same ladder.** The
 *     schedule's own sentence defines the relationship; no separate plan-review table
 *     exists on the sheet.
 *  3. **The state surcharge has two forms on the sheet.** The building formula reads
 *     "Value of Work x 0.0005" — 5 cents per $1,000 of work; the plumbing sheet prints
 *     "$1.00 per permit application". Each is charged as its schedule states it, as a
 *     state surcharge component.
 *  4. **The plumbing minimum includes the $1.00 surcharge; the building minimum does
 *     not.** "$85.20 (Includes $1.00 State Surcharge)" against "$84.20 (does not include
 *     State Surcharge)" — the sheets' own parentheses, read literally.
 *  5. **Electrical is a state permit under 326B.37** — inspection trips at $55, services
 *     and circuits by the statute's bands, dwelling minimums of $200/$400 plus the $25
 *     required permit fee and $1 surcharge. The City is not the authority for this trade;
 *     the electrical page is built from the state's own worksheets, as Fargo's was from
 *     NDSEB's.
 *
 * **What is deliberately NOT here:** the detached-garage schedule (a fee schedule of its
 * own, named by the sheet), the gas burner and gas-piping rows (gas permits, not the
 * plumbing permit this page prices — though the sheet prints them and the research
 * record transcribes them), parkland dedication, signs, code compliance and refunds
 * pages, and the worksheet's estimated-fee disclaimer ("Any fee discrepancies will be
 * reviewed by the inspector, and you will be billed for the difference" — a trueing rule
 * on the estimate, named on the page rather than modelled). This module is the single
 * definition of Minneapolis's fee rules: the seed writes exactly these records and the
 * tests assert against exactly these records.
 */

/**
 * The schedules print no date of their own; the City pages embedding them are stamped
 * "Last updated on February 27, 2026", which is the date the record carries. The DLI
 * worksheets print "REV 6.2025".
 */
export const MINNEAPOLIS_FEE_EFFECTIVE_FROM = "2026-02-27";

export const MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY = "minneapolis-building-fee-schedule";
export const MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY = "minneapolis-plumbing-fee-schedule";
export const MINNEAPOLIS_FEE_PAGES_SOURCE_KEY = "minneapolis-permit-fee-pages";
export const MINNESOTA_DLI_SOURCE_KEY = "minnesota-dli-electrical";

/** The building formula's plan-review share, printed on the schedule. */
export const MINNEAPOLIS_PLAN_REVIEW_SHARE = { numerator: 13, denominator: 20 };

function mspRule(
  sourceId: string,
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
    effectiveFrom: MINNEAPOLIS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — the schedule's own three-component formula              */
/* -------------------------------------------------------------------------- */

/**
 * The nine-band ladder, as printed. Each band after the first is "first $X plus $Y each
 * additional $1,000 and fraction thereof" — one rule per band so the band's own printed
 * base is the base, and the fraction phrase is the rule's increment.
 */
export const MINNEAPOLIS_BUILDING_LADDER_RULES: FeeRuleRecord[] = [
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-band-1",
    code: "BLD-BAND-1",
    label: "Building permit — $36.70 on work up to $500 (minimum fee applies)",
    feeType: "flat",
    config: { amountCents: 3_670 },
    minimumCents: 8_420,
    conditions: { field: "valuation", op: "lte", value: 50_000 },
    description:
      'The schedule\'s first two rows: "Minimum Fee-Residential or Commercial $84.20 (does not include State Surcharge)" and "$1.00-$500.00 $36.70 (Minimum Fee Applies)". The minimum is the rule\'s own floor and belongs to the permit fee alone — the sheet says so, and the formula adds the surcharge on top of everything. A job valued at $500 or less pays the $84.20 minimum here and the 65% plan review beside it.',
  }),
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-band-2",
    code: "BLD-BAND-2",
    label: "Building permit — $501 to $2,000: $36.70 plus $4.50 each additional $100 and fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 4_500,
      thresholdCents: 50_000,
      incrementCents: 10_000,
      baseCents: 3_670,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 50_000 }, { field: "valuation", op: "lte", value: 200_000 }],
    },
    description:
      'The schedule\'s "$501.00-$2,000.00 $36.70 - first $500 plus $4.50 each add\'l $100 and fraction thereof including $2,000". This band\'s ladder is denominated in $100 steps — the only one of the nine — so it is a per-thousand row over $100,000 cents with its increment set to $100. $2,000 of work: $36.70 + (20 × $4.50) = $126.70.',
  }),
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-band-3",
    code: "BLD-BAND-3",
    label: "Building permit — $2,001 to $25,000: $104.20 plus $20.60 each additional $1,000 and fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 2_060,
      thresholdCents: 200_000,
      incrementCents: 100_000,
      baseCents: 10_420,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 200_000 }, { field: "valuation", op: "lte", value: 2_500_000 }],
    },
    description:
      'The schedule\'s "$2,001.00-$25,000.00 $104.20 - first $2,000 plus $20.60 each add\'l $1000 and fraction thereof including $25,000". The sheet\'s own anchor: $2,001 of value is $104.20 — the printed base plus one whole $20.60 step for the single-dollar fraction, which is how "and fraction thereof" reads.',
  }),
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-band-4",
    code: "BLD-BAND-4",
    label: "Building permit — $25,001 to $50,000: $578.00 plus $14.90 each additional $1,000 and fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 1_490,
      thresholdCents: 2_500_000,
      incrementCents: 100_000,
      baseCents: 57_800,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 2_500_000 }, { field: "valuation", op: "lte", value: 5_000_000 }],
    },
    description:
      'The schedule\'s "$25,001.00-$50,000.00 $578.00 - first $25,000 plus $14.90 each add\'l $1000 and fraction thereof including $50,000". The band\'s base is the prior band\'s whole arithmetic at its seam: $104.20 + 23 × $20.60 = $578.20 printed as $578.00 — a two-cent rounding the schedule itself contains, charged as printed.',
  }),
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-band-5",
    code: "BLD-BAND-5",
    label: "Building permit — $50,001 to $100,000: $950.50 plus $10.60 each additional $1,000 and fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 1_060,
      thresholdCents: 5_000_000,
      incrementCents: 100_000,
      baseCents: 95_050,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 5_000_000 }, { field: "valuation", op: "lte", value: 10_000_000 }],
    },
    description:
      'The schedule\'s "$50,001.00-$100,000.00 $950.50 - first $50,000 plus $10.60 each add\'l $1000 and fraction thereof including $100,000".',
  }),
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-band-6",
    code: "BLD-BAND-6",
    label: "Building permit — $100,001 to $500,000: $1,480.50 plus $8.40 each additional $1,000 and fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 840,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      baseCents: 148_050,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 10_000_000 }, { field: "valuation", op: "lte", value: 50_000_000 }],
    },
    description:
      'The schedule\'s "$100,001.00-$500,000.00 $1,480.50 - first $100,000 plus $8.40 each add\'l $1000 and fraction thereof including $500,000".',
  }),
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-band-7",
    code: "BLD-BAND-7",
    label: "Building permit — $500,001 to $1,000,000: $4,840.50 plus $6.90 each additional $1,000 and fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 690,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      baseCents: 484_050,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 50_000_000 }, { field: "valuation", op: "lte", value: 100_000_000 }],
    },
    description:
      'The schedule\'s "$500,001.00-$1,000,000.00 $4,840.50 - first $500,000 plus $6.90 each add\'l $1000 and fraction thereof including $1,000,000".',
  }),
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-band-8",
    code: "BLD-BAND-8",
    label: "Building permit — $1,000,001 and up: $8,290.50 plus $5.60 each additional $1,000 and fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 560,
      thresholdCents: 100_000_000,
      incrementCents: 100_000,
      baseCents: 829_050,
    },
    conditions: { field: "valuation", op: "gt", value: 100_000_000 },
    description:
      'The schedule\'s "$1,000,001.00 and up $8,290.50 - first $1,000,000 plus $5.60 each add\'l $1000 and fraction thereof" — the open top band, no upper seam to include.',
  }),
];

export const MINNEAPOLIS_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  ...MINNEAPOLIS_BUILDING_LADDER_RULES,
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-plan-review",
    code: "BLD-PLAN-REVIEW",
    label: "Plan review — 65% of the building permit fee",
    feeType: "percent",
    config: {
      basis: "permit_fee",
      rate: { numerator: 13, denominator: 20 },
      rateUnit: "fraction",
    },
    componentType: "plan_review",
    priority: 300,
    description:
      'The schedule\'s own formula, in its first row: "Building Permit Fee + Plan Review Fee (65% x building permit fee) + MN State Surcharge (Value of Work x 0.0005) = Total Permit Fee". The plan review is 65% of whatever the ladder computed — the same sheet defines the relationship, so no separate plan-review table exists. Declared as a plan-review component reading `permit_fee`, the engine\'s base subtotal, so the 65% is of the permit fee alone and not of the surcharge.',
  }),
  mspRule(MINNEAPOLIS_BUILDING_SHEET_SOURCE_KEY, {
    id: "minneapolis-bld-state-surcharge",
    code: "MN-SURCHARGE",
    label: "Minnesota state surcharge — Value of Work × 0.0005",
    feeType: "percent",
    config: {
      basis: "valuation",
      rate: { numerator: 1, denominator: 2_000 },
      rateUnit: "fraction",
    },
    componentType: "state_surcharge",
    priority: 700,
    description:
      'The schedule\'s formula term: "MN State Surcharge (Value of Work x 0.0005)". Five cents for each $1,000 of the work\'s value — a factor of 0.0005, stated on the sheet and charged on the work rather than on the fee. The plumbing sheet\'s own surcharge is different — $1.00 per application — and is charged there as its schedule states it.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — the $41.40 price list with its $85.20 minimum           */
/* -------------------------------------------------------------------------- */

const PLUMB_BASE = 4_140;

export const MINNEAPOLIS_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  mspRule(MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY, {
    id: "minneapolis-plumb-fixtures",
    code: "PLUMB-FIXTURES",
    label: "Plumbing permit — full fixture, fixture set or waste and vent, $41.40",
    feeType: "flat",
    config: { amountCents: PLUMB_BASE },
    conditions: {
      field: "custom.plumbing_scope",
      op: "in",
      value: ["full_fixture", "fixture_set", "waste_and_vent"],
    },
    description:
      'Three rows at one price: "Full Fixture - All Occupancies $41.40", "Fixture Set Only - All Occupancies $41.40" and "Waste and Vent Only - All Occupancies $41.40". One arithmetic prices all three, so one rule carries them, selected by the scope the applicant states. The minimum below binds a single-row permit: $41.40 charged at $85.20.',
  }),
  mspRule(MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY, {
    id: "minneapolis-plumb-rainwater",
    code: "PLUMB-RAINWATER",
    label: "Plumbing permit — rainwater leader, $41.40 per 10 stories or fraction thereof",
    feeType: "per_unit",
    config: { unit: "stories", centsPerUnit: 414, incrementUnits: 10 },
    conditions: { field: "custom.stories", op: "exists" },
    description:
      'The schedule\'s "Rainwater Leader, for 10 stories or fraction thereof $41.40": $41.40 for every ten-story block, and a partial block buys a whole one. Stated as $4.14 per story rounded up to whole ten-story blocks — the same arithmetic the $41.40-per-block row prints, and the shape the engine\'s block rounding exists for. Twenty-five stories are three blocks, $124.20.',
  }),
  mspRule(MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY, {
    id: "minneapolis-plumb-water-distribution",
    code: "PLUMB-WATER-DISTRIBUTION",
    label: "Plumbing permit — water distribution piping, $41.40 per 100 lineal feet or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "linear_feet",
      centsPerThousand: 41_400,
      incrementCents: 100,
    },
    conditions: { field: "custom.linear_feet", op: "exists" },
    description:
      'The schedule\'s "Replacing or extending water distribution piping, each 100 lineal feet or fraction thereof $41.40" — a block rate, the mirror of Buffalo\'s: 150 feet is two blocks, $82.80, because the fraction phrase is printed. Gated on the run the applicant supplies.',
  }),
  mspRule(MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY, {
    id: "minneapolis-plumb-alterations",
    code: "PLUMB-ALTERATIONS",
    label: "Plumbing permit — alterations, $41.40 per $500 or fraction thereof",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 8_280,
      incrementCents: 50_000,
    },
    conditions: { field: "custom.plumbing_scope", op: "eq", value: "alterations" },
    description:
      'The schedule\'s "Alterations - each $500 or fraction thereof $41.40": $41.40 for each $500 of the alteration\'s value, and a partial $500 buys a whole block — $82.80 per $1,000, charged on the value rounded up to whole $500s. Selected by scope, because a $2,000 alteration and a $41.40 fixture are different questions the sheet prices differently.',
  }),
  mspRule(MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY, {
    id: "minneapolis-plumb-minimum",
    code: "PLUMB-MINIMUM",
    label: "Plumbing permit — $85.20 minimum (includes the $1.00 state surcharge)",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 8_420 },
    conditions: null,
    componentType: "base",
    priority: 200,
    description:
      'The sheet\'s own minimum row: "Minimum Fee - Residential & Commercial $85.20 (Includes $1.00 State Surcharge)". The parenthetical is the schedule speaking: the $85.20 total includes the $1.00 surcharge that charges beside the rows, so the floor on the permit-fee subtotal is $84.20 — the printed minimum less the $1.00 — and a one-fixture permit ($41.40 of rows + $1.00 of surcharge) pays $85.20 in all while a ten-fixture permit ($414.00 + $1.00) pays its own arithmetic with the floor charging nothing.',
  }),
  mspRule(MINNEAPOLIS_PLUMBING_SHEET_SOURCE_KEY, {
    id: "minneapolis-plumb-state-surcharge",
    code: "MN-PLUMB-SURCHARGE",
    label: "Minnesota state surcharge — $1.00 per permit application",
    feeType: "flat",
    config: { amountCents: 100 },
    conditions: null,
    componentType: "state_surcharge",
    priority: 700,
    description:
      'The plumbing sheet\'s surcharge, stated twice: "MN State Surcharge fee of $1.00 is required for each permit application" and, beside the gas rows, "should be added to the total permit fee (except minimum as shown)". It is the sheet\'s own $1.00 — different from the building formula\'s 0.0005 factor — and it always charges: the minimum above is set to the printed $85.20 plus this $1.00, so the "(includes surcharge)" parenthetical holds at the floor while the sheet\'s "except minimum" note keeps the two from double-counting.',
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — the state's own, under 326B.37                        */
/* -------------------------------------------------------------------------- */

export const MINNEAPOLIS_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  mspRule(MINNESOTA_DLI_SOURCE_KEY, {
    id: "minneapolis-elec-inspection-trips",
    code: "ELEC-INSPECTION-TRIPS",
    label: "State electrical inspection — $55 per inspection trip",
    feeType: "per_unit",
    config: { unit: "inspections", centsPerUnit: 5_500 },
    conditions: { field: "custom.inspections", op: "exists" },
    description:
      'The worksheet\'s line 1, on every one of the state\'s five fee worksheets: "Number of inspection trip(s) $55/inspection trip", with "The minimum fee for each separate inspection is $55" above it. The inspection count is what a simple job is priced from — the worksheets say the fee "is determined by the number of inspections in line 1 above OR by lines 2 through [N] below", one method or the other.',
  }),
  mspRule(MINNESOTA_DLI_SOURCE_KEY, {
    id: "minneapolis-elec-power-sources",
    code: "ELEC-POWER-SOURCES",
    label: "State electrical inspection — power sources, $35/$60/$100 by amperage (600 V)",
    feeType: "flat",
    config: { amountCents: 3_500 },
    conditions: { all: [{ field: "custom.power_source_amperage", op: "exists" }, { field: "custom.power_source_amperage", op: "lte", value: 400 }] },
    description:
      'The worksheets\' service rows: "0 to 400 Amps Power Source $35/source", "401-800 Amps $60/source", "Over 800 Amps $100/source" — the rates for services, generators, other power sources and feeder or branch circuits to separate structures at 600 volts or less. Over 600 volts the statute prices $70/$120/$200; those three rows are transcribed in the research record and named here, charged when the custom fact carries the higher-voltage rate. This rule charges the 0-to-400-ampere price per source; the bands above it are the two rules beside it.',
  }),
  mspRule(MINNESOTA_DLI_SOURCE_KEY, {
    id: "minneapolis-elec-power-sources-800",
    code: "ELEC-POWER-SOURCES-800",
    label: "State electrical inspection — power source, 401-800 amperes, $60.00",
    feeType: "flat",
    config: { amountCents: 6_000 },
    conditions: { all: [{ field: "custom.power_source_amperage", op: "exists" }, { field: "custom.power_source_amperage", op: "gt", value: 400 }, { field: "custom.power_source_amperage", op: "lte", value: 800 }] },
    description:
      'The middle service band: "401 - 800 Amps Power Source $60/source" — one flat amount for the source, selected by the amperage the applicant states.',
  }),
  mspRule(MINNESOTA_DLI_SOURCE_KEY, {
    id: "minneapolis-elec-power-sources-over-800",
    code: "ELEC-POWER-SOURCES-OVER-800",
    label: "State electrical inspection — power source, over 800 amperes, $100.00",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [{ field: "custom.power_source_amperage", op: "exists" }, { field: "custom.power_source_amperage", op: "gt", value: 800 }] },
    description:
      'The top service band: "Over 800 Amps Power Source $100/source". The three bands are mutually exclusive by the stated amperage, and exactly one charges per source; multiple sources are charged by the count rules the worksheets carry as duplicate lines.',
  }),
  mspRule(MINNESOTA_DLI_SOURCE_KEY, {
    id: "minneapolis-elec-dwelling-circuits",
    code: "ELEC-DWELLING-UNIT",
    label: "State electrical inspection — new dwelling unit, $165 (up to 30 circuits and/or feeders)",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 16_500 },
    conditions: { field: "units", op: "gt", value: 0 },
    description:
      'The new-dwelling worksheet\'s lines 5 and 6: "New Dwelling Unit 1/2 (up to 30 circuits and/or feeders per unit) $165/dwelling unit". The $165 covers a dwelling\'s first thirty circuits; the excess rows price $12 each beyond. The fee carries the service up to 400 A and up to four inspections, which is what the worksheet\'s line 14 minimum says.',
  }),
  mspRule(MINNESOTA_DLI_SOURCE_KEY, {
    id: "minneapolis-elec-dwelling-minimum",
    code: "ELEC-DWELLING-MINIMUM",
    label: "State electrical inspection — new dwelling minimum, $200 one-family / $400 two-family",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: 20_000 },
    conditions: { field: "custom.elec_dwelling_minimum", op: "eq", value: true },
    componentType: "base",
    priority: 200,
    description:
      'The worksheet\'s line 14, printed in full: "The Minimum fee for a new one-family dwelling is $200, and a two-family dwelling is $400 (for each separate dwelling unit, this includes the service up to 400 A, up to 30 circuits, and a maximum of 4 inspections)". Charged as the $200 one-family figure; the two-family minimum is the same figure twice, which the $165-per-unit rows and this rule\'s minimum together approach. When this minimum governs, the line-12 subtotal is not used — the worksheet says to enter "the largest amount from line 13 or 14".',
  }),
  mspRule(MINNESOTA_DLI_SOURCE_KEY, {
    id: "minneapolis-elec-permit-fee",
    code: "ELEC-PERMIT-FEE",
    label: "State electrical permit — required permit fee, $25.00",
    feeType: "flat",
    config: { amountCents: 2_500 },
    description:
      'The worksheet\'s line 16: "Required permit fee $25.00" — added to the inspection total on every state electrical permit, beside the $1.00 surcharge on line 17.',
  }),
  mspRule(MINNESOTA_DLI_SOURCE_KEY, {
    id: "minneapolis-elec-state-surcharge",
    code: "MN-ELEC-SURCHARGE",
    label: "Minnesota state surcharge — $1.00 per electrical permit",
    feeType: "flat",
    config: { amountCents: 100 },
    componentType: "state_surcharge",
    priority: 700,
    description:
      'The worksheet\'s line 17: "Required permit surcharge $1.00" — the same $1.00 the City\'s plumbing sheet charges, here on the state\'s own form, summed into the worksheet\'s GRAND TOTAL.',
  }),
];
