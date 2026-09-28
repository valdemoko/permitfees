import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * City of Sacramento, California — **the first jurisdiction whose building permit is a
 * valuation ladder that turns into a marginal formula.**
 *
 * Two of the City's own documents carry the schedule, and they are different kinds of
 * document, which is the first thing about this jurisdiction worth knowing:
 *
 *  S1  **Tables A and B.1**, the Building Division's fee detail sheet, revised
 *      2025-07-19. **Table A** is a hundred-bracket ladder — $999 of valuation or less
 *      pays $75, $1,999 pays $108, and so on every $1,000 to $99,999 — and then, instead
 *      of a hundred-and-first bracket, it prints three **formulas**: `$1,078 +
 *      $0.006787 each $1 > $100,000`, `$20,761 + $0.005133 each $1 > $3 mil`, and
 *      `$56,692 + $0.004620 each $1 > $10 mil`. **Table B.1** is the flat-fee list: a
 *      residential bathroom remodel is $320, a non-structural kitchen remodel $425, a
 *      minor electrical or minor plumbing permit $105, a water heater $75.
 *  S2  **The City's searchable fee listing**, which is where the add-ons live rather
 *      than in the fee sheet: the General Plan Maintenance Fee at "$2.60 per $1,000 of
 *      building valuation, not-to-exceed $38,200", the Technology Surcharge at "10% of
 *      the Plan Review Fee (if applicable) and Building Permit Fee", the Construction
 *      Excise Tax at ".008 x of the 2002 ICBO Valuation", the City Business Operations
 *      Tax at "$0.40 per $1,000 of project valuation (Maximum limit of $5,000.00 per
 *      calendar year per contractor)" and the Residential Construction Tax at $250,
 *      $315 or $385 per unit by bedroom count.
 *
 * **Why the ladder turns into a formula.** A valuation schedule that ran to a hundred
 * brackets and stopped would have no answer for a $400,000 building, which is the
 * common case in Sacramento. The City prints the three formulas for exactly that reason,
 * and they are continuous with the ladder where they meet it: $1,078 at $100,000,
 * $20,761 at $3,000,000, $56,692 at $10,000,000. Modelling them separately, each gated on
 * the valuation band it covers, is what keeps the ladder from being extrapolated and the
 * formula from being applied to a $40,000 job.
 *
 * **The two columns, and the two rows where they disagree.** Table A prints a Commercial
 * and a Residential column. They are identical on 98 of 100 rows. On the other two —
 * $33,999 and $36,999 — the Residential column prints $577 and $586 where the Commercial
 * column prints $557 and $585. That is not a transcription error here: it is what the
 * row-by-row read of the PDF says, and the two values are carried as overrides rather
 * than smoothed away, because publishing $557 to a homeowner would be publishing a
 * number the City does not print on the row that applies to them.
 *
 * Research record: research/california/sacramento.md.
 */

/** S1 header: "TABLE A — Effective July 20, 2020*" / "Revised July 19, 2025"; Table B.1 is effective 2025-07-19. */
export const SC_FEE_EFFECTIVE_FROM = "2025-07-19";

export const SC_TABLE_A_SOURCE_KEY = "sacramento-tables-a-and-b1-building-permit-fees-2025-07";
export const SC_FEE_LISTING_SOURCE_KEY = "sacramento-fees-and-charges-listing-2026-07";

/**
 * Table A's ladder, in cents of valuation, as the upper bound of each bracket.
 *
 * The City prints it as "$999, $1,999, $2,999, … $99,999" — a $1,000 step — so it is
 * generated rather than transcribed a hundred times, and the first bracket is inclusive
 * of anything at or below $999, which is where the $75 minimum lives.
 */
export const SC_TABLE_A_FIRST_LIMIT_CENTS = 99_900;
export const SC_TABLE_A_STEP_CENTS = 100_000;

/**
 * Table A's Commercial column, in cents, bracket for bracket from $999 upwards.
 *
 * The Residential column is this array with two entries replaced; see
 * `SC_TABLE_A_RESIDENTIAL_OVERRIDES`. Taken from the PDF's row-by-row read.
 */
export const SC_TABLE_A_FEE_CENTS: number[] = [
  7_500, 10_800, 14_700, 17_900, 20_600, 23_000, 25_200, 27_200, 29_100, 30_800, 32_500,
  34_000, 35_500, 36_900, 38_300, 39_200, 40_100, 41_000, 42_000, 42_900, 43_800, 44_700,
  45_600, 46_600, 47_500, 48_400, 49_300, 50_200, 51_100, 52_100, 53_000, 53_900, 54_800,
  55_700, 56_700, 57_600, 58_500, 59_400, 60_300, 61_200, 62_200, 63_100, 64_000, 64_900,
  65_800, 66_800, 67_700, 68_600, 69_500, 70_400, 71_200, 72_000, 72_700, 73_400, 74_200,
  74_900, 75_700, 76_400, 77_200, 77_900, 78_600, 79_400, 80_100, 80_900, 81_600, 82_400,
  83_100, 83_900, 84_600, 85_400, 86_100, 86_900, 87_600, 88_400, 89_100, 89_900, 90_600,
  91_300, 92_100, 92_800, 93_600, 94_300, 95_100, 95_800, 96_600, 97_300, 98_100, 98_800,
  99_600, 100_300, 101_100, 101_800, 102_600, 103_300, 104_000, 104_800, 105_500, 106_300,
  107_000, 107_800,
];

/**
 * The two bracket positions where Table A's Residential column prints a different amount
 * from its Commercial column, keyed by bracket index.
 *
 * Index 33 is the "$33,999" row and index 36 the "$36,999" row. Both were read twice, in
 * two different `pdftotext` modes, because the first pass through this PDF mis-paired the
 * two columns by one row and produced a schedule in which the residential column ran
 * ahead of the commercial one for the rest of the page. The row-by-row read is the one
 * that reproduces the document's own arithmetic: each $1,000 of valuation adds a few
 * dollars to the bracket below it, and no bracket is ever lower than the one beneath it.
 */
export const SC_TABLE_A_RESIDENTIAL_OVERRIDES: Record<number, number> = {
  33: 57_700,
  36: 58_600,
};

/** Table A, band one: "$1078 + $0.006787 each $1 > $100,000", up to $2,999,999.99. */
export const SC_TABLE_A_BAND_1_BASE_CENTS = 107_800;
export const SC_TABLE_A_BAND_1_RATE = { numerator: 6_787, denominator: 1_000_000 } as const;
export const SC_TABLE_A_BAND_1_THRESHOLD_CENTS = 10_000_000;
export const SC_TABLE_A_BAND_1_CEILING_CENTS = 299_999_999;

/** Table A, band two: "$20,761 + $0.005133 each $1 >$3 mil", from $3,000,000. */
export const SC_TABLE_A_BAND_2_BASE_CENTS = 2_076_100;
export const SC_TABLE_A_BAND_2_RATE = { numerator: 5_133, denominator: 1_000_000 } as const;
export const SC_TABLE_A_BAND_2_THRESHOLD_CENTS = 300_000_000;
export const SC_TABLE_A_BAND_2_CEILING_CENTS = 999_999_999;

/** Table A, band three: "$56,692 + $0.004620 each $1 >$10 mil", from $10,000,000. */
export const SC_TABLE_A_BAND_3_BASE_CENTS = 5_669_200;
export const SC_TABLE_A_BAND_3_RATE = { numerator: 4_620, denominator: 1_000_000 } as const;
export const SC_TABLE_A_BAND_3_THRESHOLD_CENTS = 1_000_000_000;

/** Table B.1, Residential: "Bathroom Remodel Non-Structural — $320". */
export const SC_FLAT_BATHROOM_REMODEL_CENTS = 32_000;
/** Table B.1, Residential: "Kitchen Remodel Non-Structural — $425". */
export const SC_FLAT_KITCHEN_REMODEL_CENTS = 42_500;
/** Table B.1, Residential: "Site Built Patio cover — $288". */
export const SC_FLAT_PATIO_SITE_BUILT_CENTS = 28_800;
/** Table B.1, Residential: "Pre-Engineered Patio Cover — $250". */
export const SC_FLAT_PATIO_PRE_ENGINEERED_CENTS = 25_000;
/** Table B.1, Residential: "Residential Minor Electrical Work … — $105", one permit for one or more of its scopes. */
export const SC_FLAT_MINOR_ELECTRICAL_CENTS = 10_500;
/** Table B.1, Residential: "Safety Inspection — $107", an electrical or gas piping inspection only. */
export const SC_FLAT_SAFETY_INSPECTION_CENTS = 10_700;
/** S2: "Sign - Electrical Fee (Building) — $216". */
export const SC_FLAT_SIGN_ELECTRICAL_CENTS = 21_600;
/** Table B.1, Residential: "Residential Minor Plumbing Repair or Replacement Work … — $105". */
export const SC_FLAT_MINOR_PLUMBING_CENTS = 10_500;
/** Table B.1: "Water heater (new installation, replacement or move) — $75"; commercial like-for-like is the same $75. */
export const SC_FLAT_WATER_HEATER_CENTS = 7_500;

/** S2: "General Plan Maintenance Fee — $2.60 per $1,000 of building valuation, not-to-exceed $38,200". */
export const SC_GENERAL_PLAN_CENTS_PER_THOUSAND = 260;
export const SC_GENERAL_PLAN_MAX_CENTS = 3_820_000;

/** S2: "Construction Excise Tax — .008 x of the 2002 ICBO Valuation". */
export const SC_EXCISE_NUMERATOR = 8;
export const SC_EXCISE_DENOMINATOR = 1_000;

/** S2: "City Business Operations Tax — $0.40 per $1,000 of project valuation (Maximum limit of $5,000.00 per calendar year per contractor)". */
export const SC_BUSINESS_OPS_CENTS_PER_THOUSAND = 40;
export const SC_BUSINESS_OPS_MAX_CENTS = 500_000;

/** S2: "Residential Construction Tax (Building) — Mobile home lot constructed or one bedroom unit $250; Two bedroom units $315; 3+ bedroom units $385". */
export const SC_RCT_ONE_BEDROOM_CENTS = 25_000;
export const SC_RCT_TWO_BEDROOM_CENTS = 31_500;
export const SC_RCT_THREE_OR_MORE_CENTS = 38_500;

/** Which project type applies, where the fee is a flat scope rather than a valuation. */
const PT = "custom.project_type";
/** Which electrical scope is being permitted. */
const ELEC = "custom.electrical_item";
/** Which plumbing scope is being permitted. */
const PLUMB = "custom.plumbing_item";
/** Bedrooms, which the Residential Construction Tax is charged by. */
const BEDROOMS = "custom.bedrooms";

const RESIDENTIAL = "residential";

/** The Table B.1 flat scopes, which replace the Table A ladder rather than adding to it. */
const FLAT_SCOPE_PROJECT_TYPES = [
  "bathroom_remodel",
  "kitchen_remodel",
  "patio_cover_site_built",
  "patio_cover_pre_engineered",
];

function rule(
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
    effectiveFrom: SC_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * Table A's ladder as a `tiered_table`, one column at a time.
 *
 * The final bracket's upper bound is $100,000 rather than the $99,999 the City's row
 * prints, and the two are the same charge. Table A's last row is "$99,999 $1,078" and the
 * formula above it starts with the same $1,078 "each $1 > $100,000", so the cent between
 * them belongs to the $1,078 either way. Capping the bracket at $100,000 does two things
 * at once: it lets the rule's condition (`valuation <= $100,000`) reach its own top value
 * without the engine reporting a value "above the highest published bracket" and attaching
 * a warning to a figure that is right, and it keeps the description saying `from $98,999
 * to $100,000` instead of an unbounded `above $98,999`, which would understate where the
 * ladder hands over.
 */
function tableALadderTiers(column: "commercial" | "residential") {
  return SC_TABLE_A_FEE_CENTS.map((cents, index) => {
    const isLast = index === SC_TABLE_A_FEE_CENTS.length - 1;
    const amountCents =
      column === "residential" ? (SC_TABLE_A_RESIDENTIAL_OVERRIDES[index] ?? cents) : cents;
    return {
      upToCents: isLast
        ? SC_TABLE_A_BAND_1_THRESHOLD_CENTS
        : SC_TABLE_A_FIRST_LIMIT_CENTS + index * SC_TABLE_A_STEP_CENTS,
      amountCents,
    };
  });
}

/** Table A's ladder, one rule per printed column, each gated to the valuations it covers. */
function buildingValuationLadderRules(sourceId: string): FeeRuleRecord[] {
  const ladderConditions = (occupancy: "commercial" | "residential") => ({
    all: [
      { field: "valuation", op: "lte" as const, value: SC_TABLE_A_BAND_1_THRESHOLD_CENTS },
      { not: { field: PT, op: "in" as const, value: FLAT_SCOPE_PROJECT_TYPES } },
      occupancy === "residential"
        ? { field: "occupancy", op: "eq" as const, value: RESIDENTIAL }
        : { field: "occupancy", op: "neq" as const, value: RESIDENTIAL },
    ],
  });

  return [
    rule(sourceId, {
      id: "sc-build-permit-commercial-ladder",
      code: "BUILD-PERMIT-COMMERCIAL",
      label: "Building permit fee, Commercial column ($999 to $99,999 of valuation)",
      description:
        "Table A, Commercial column: \"$999 $75 … $49,999 $704 … $99,999 $1,078\", a hundred brackets of $1,000 of valuation each. Estimated project valuation determines the bracket, and the bracket's amount is the permit fee.",
      feeType: "tiered_table",
      config: { basis: "valuation", tiers: tableALadderTiers("commercial") },
      conditions: ladderConditions("commercial"),
    }),

    rule(sourceId, {
      id: "sc-build-permit-residential-ladder",
      code: "BUILD-PERMIT-RESIDENTIAL",
      label: "Building permit fee, Residential column ($999 to $99,999 of valuation)",
      description:
        "Table A, Residential column. It prints the same amount as the Commercial column on every bracket except the $33,999 row ($577 against $557) and the $36,999 row ($586 against $585), which are carried as they stand.",
      feeType: "tiered_table",
      config: { basis: "valuation", tiers: tableALadderTiers("residential") },
      conditions: ladderConditions("residential"),
    }),
  ];
}

/** Table A's three printed formulas: the marginal bands a valuation over $100,000 falls in. */
function buildingValuationBandRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "sc-build-permit-band-100k-to-3m",
      code: "BUILD-PERMIT-BAND-100K-TO-3M",
      label: "Building permit fee, $100,000 to $2,999,999.99 of valuation",
      description:
        'Table A: "$1078 + $0.006787 each $1 > $100,000". The $1,078 is the last bracket of the ladder, so the formula and the ladder meet exactly at $100,000.',
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: SC_TABLE_A_BAND_1_RATE,
        thresholdCents: SC_TABLE_A_BAND_1_THRESHOLD_CENTS,
        baseCents: SC_TABLE_A_BAND_1_BASE_CENTS,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: SC_TABLE_A_BAND_1_THRESHOLD_CENTS },
          { field: "valuation", op: "lte", value: SC_TABLE_A_BAND_1_CEILING_CENTS },
        ],
      },
    }),

    rule(sourceId, {
      id: "sc-build-permit-band-3m-to-10m",
      code: "BUILD-PERMIT-BAND-3M-TO-10M",
      label: "Building permit fee, $3,000,000 to $9,999,999.99 of valuation",
      description:
        'Table A: "$20,761 + $0.005133 each $1 >$3 mil". The band opens at the amount band one reaches at $3,000,000 — $1,078 + 2,900,000 × $0.006787 = $20,760.30, printed as $20,761.',
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: SC_TABLE_A_BAND_2_RATE,
        thresholdCents: SC_TABLE_A_BAND_2_THRESHOLD_CENTS,
        baseCents: SC_TABLE_A_BAND_2_BASE_CENTS,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gte", value: SC_TABLE_A_BAND_2_THRESHOLD_CENTS },
          { field: "valuation", op: "lte", value: SC_TABLE_A_BAND_2_CEILING_CENTS },
        ],
      },
    }),

    rule(sourceId, {
      id: "sc-build-permit-band-10m-up",
      code: "BUILD-PERMIT-BAND-10M-UP",
      label: "Building permit fee, $10,000,000 of valuation and above",
      description:
        'Table A: "$56,692 + $0.004620 each $1 >$10 mil". The row continues to the end of the schedule and is the only band with no ceiling.',
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: SC_TABLE_A_BAND_3_RATE,
        thresholdCents: SC_TABLE_A_BAND_3_THRESHOLD_CENTS,
        baseCents: SC_TABLE_A_BAND_3_BASE_CENTS,
      },
      conditions: { field: "valuation", op: "gte", value: SC_TABLE_A_BAND_3_THRESHOLD_CENTS },
    }),
  ];
}

/** Table B.1's flat scopes, which are the whole fee for the permits they cover. */
function buildingFlatScopeRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "sc-build-flat-bathroom-remodel",
      code: "BUILD-FLAT-BATHROOM-REMODEL",
      label: "Non-structural bathroom remodel",
      description:
        'Table B.1: "Bathroom Remodel Non-Structural — $320". Intended for "the non-structural renovation of a residential bathroom", and not for repair work limited to a single bathroom fixture, which the sheet sends to the Residential Minor Plumbing Work section.',
      feeType: "flat",
      config: { amountCents: SC_FLAT_BATHROOM_REMODEL_CENTS },
      conditions: { field: PT, op: "eq", value: "bathroom_remodel" },
    }),

    rule(sourceId, {
      id: "sc-build-flat-kitchen-remodel",
      code: "BUILD-FLAT-KITCHEN-REMODEL",
      label: "Non-structural kitchen remodel",
      description:
        'Table B.1: "Kitchen Remodel Non-Structural — $425", for "the non-structural renovation of a residential kitchen". Scopes involving more than one item but not a full remodel are calculated from project value instead.',
      feeType: "flat",
      config: { amountCents: SC_FLAT_KITCHEN_REMODEL_CENTS },
      conditions: { field: PT, op: "eq", value: "kitchen_remodel" },
    }),

    rule(sourceId, {
      id: "sc-build-flat-patio-site-built",
      code: "BUILD-FLAT-PATIO-SITE-BUILT",
      label: "Site built patio cover",
      description:
        'Table B.1: "Site Built Patio cover — $288", for "Patio Covers custom designed using standard off the shelf materials as opposed to a pre-manufactured assembly". Its Plan Review Fee column prints $164.',
      feeType: "flat",
      config: { amountCents: SC_FLAT_PATIO_SITE_BUILT_CENTS },
      conditions: { field: PT, op: "eq", value: "patio_cover_site_built" },
    }),

    rule(sourceId, {
      id: "sc-build-flat-patio-pre-engineered",
      code: "BUILD-FLAT-PATIO-PRE-ENGINEERED",
      label: "Pre-engineered patio cover",
      description:
        'Table B.1: "Pre-Engineered Patio Cover — $250", for "pre-manufactured, aluminum patio cover assembles, utilizing engineer stamped, table driven drawings". Its Plan Review Fee column prints N/A.',
      feeType: "flat",
      config: { amountCents: SC_FLAT_PATIO_PRE_ENGINEERED_CENTS },
      conditions: { field: PT, op: "eq", value: "patio_cover_pre_engineered" },
    }),
  ];
}

/**
 * The four charges the City's fee listing adds to a building permit.
 *
 * Three of them are a rate on the valuation and one is per dwelling unit. None is part of
 * Table A, which is why they are separate rules with their own priorities rather than
 * amounts folded into the ladder: a reader comparing this site's ladder to the City's
 * sheet should find the same numbers, and a reader comparing the total should find the
 * add-ons separately named.
 */
function buildingAddOnRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "sc-build-general-plan",
      code: "BUILD-GENERAL-PLAN",
      label: "General Plan Maintenance Fee",
      description:
        '"General Plan Maintenance Fee — $2.60 per $1,000 of building valuation, not-to-exceed $38,200 on permits with a valuation over $14.85 million."',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        centsPerThousand: SC_GENERAL_PLAN_CENTS_PER_THOUSAND,
      },
      maximumCents: SC_GENERAL_PLAN_MAX_CENTS,
      componentType: "other",
      priority: 300,
    }),

    rule(sourceId, {
      id: "sc-build-construction-excise",
      code: "BUILD-CONSTRUCTION-EXCISE",
      label: "Construction Excise Tax",
      description:
        '"Construction Excise Tax — .008 x of the 2002 ICBO Valuation." The tax is charged on "all new square footage constructed in the city", and patio covers are the sheet\'s own stated exception.',
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: { numerator: SC_EXCISE_NUMERATOR, denominator: SC_EXCISE_DENOMINATOR },
      },
      componentType: "other",
      priority: 310,
    }),

    rule(sourceId, {
      id: "sc-build-business-operations-tax",
      code: "BUILD-BUSINESS-OPERATIONS-TAX",
      label: "City Business Operations Tax",
      description:
        '"City Business Operations Tax — $0.40 per $1,000 of project valuation (Maximum limit of $5,000.00 per calendar year per contractor)." The sheet marks it "Only charged if a California licensed contractor is the permit holder", so it is not charged to an owner-builder permit.',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        centsPerThousand: SC_BUSINESS_OPS_CENTS_PER_THOUSAND,
      },
      maximumCents: SC_BUSINESS_OPS_MAX_CENTS,
      conditions: { not: { field: "is_owner_builder", op: "eq", value: true } },
      componentType: "other",
      priority: 320,
    }),

    rule(sourceId, {
      id: "sc-build-residential-construction-tax-1br",
      code: "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-1BR",
      label: "Residential Construction Tax, one bedroom or a mobile home lot",
      description:
        '"Residential Construction Tax (Building) — Per unit as applicable: Mobile home lot constructed or one bedroom unit $250".',
      feeType: "per_unit",
      config: { unit: "dwelling_units", centsPerUnit: SC_RCT_ONE_BEDROOM_CENTS },
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
          { field: BEDROOMS, op: "lte", value: 1 },
        ],
      },
      componentType: "other",
      priority: 330,
    }),

    rule(sourceId, {
      id: "sc-build-residential-construction-tax-2br",
      code: "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-2BR",
      label: "Residential Construction Tax, two bedrooms",
      description: '"Residential Construction Tax (Building) — Two bedroom units $315", per unit.',
      feeType: "per_unit",
      config: { unit: "dwelling_units", centsPerUnit: SC_RCT_TWO_BEDROOM_CENTS },
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
          { field: BEDROOMS, op: "eq", value: 2 },
        ],
      },
      componentType: "other",
      priority: 331,
    }),

    rule(sourceId, {
      id: "sc-build-residential-construction-tax-3br",
      code: "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-3BR",
      label: "Residential Construction Tax, three or more bedrooms",
      description: '"Residential Construction Tax (Building) — 3+ bedroom units $385", per unit.',
      feeType: "per_unit",
      config: { unit: "dwelling_units", centsPerUnit: SC_RCT_THREE_OR_MORE_CENTS },
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
          { field: BEDROOMS, op: "gte", value: 3 },
        ],
      },
      componentType: "other",
      priority: 332,
    }),
  ];
}

/**
 * The electrical permits Sacramento prices: flat scopes from Table B.1 plus the sign fee.
 *
 * There is no per-circuit, per-outlet or per-ampere electrical table here. Sacramento's
 * Building Division prices residential electrical work as named scopes — one $105 permit
 * covers a main panel change-out, a whole-or-partial re-wire **or** new branch circuits —
 * which is the reason this jurisdiction is in the dataset: it is the opposite shape from
 * San Diego's Table 2, where nearly every row is a per-unit rate.
 */
export function electricalRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "sc-elec-minor-residential",
      code: "ELEC-MINOR-RESIDENTIAL",
      label: "Residential minor electrical work",
      description:
        'Table B.1: "Residential Minor Electrical Work — $105". The sheet says a permit under this category "may authorize one or more of these scopes of work under one permit: replacement of a main electrical panel, installation of a new or replacement subpanel or both, and/or re-wiring of an entire house or accessory structure or a portion of a house or accessory structure, and/or installation of new branch circuits, reconfiguration of existing branch wiring or both."',
      feeType: "flat",
      config: { amountCents: SC_FLAT_MINOR_ELECTRICAL_CENTS },
      conditions: { field: ELEC, op: "eq", value: "minor_residential" },
    }),

    rule(sourceId, {
      id: "sc-elec-safety-inspection",
      code: "ELEC-SAFETY-INSPECTION",
      label: "Safety inspection of an electrical or gas piping system",
      description:
        'Table B.1: "Safety Inspection — $107", for an "inspection of an electrical system or gas piping system for compliance with California Building code prior to reactivation of SMUD connection or PG&E gas supply. Authorizes no work only inspection." The same $107 row appears in the sheet\'s list of electrical scopes, which is why it is priced on the electrical page rather than as a plumbing permit.',
      feeType: "flat",
      config: { amountCents: SC_FLAT_SAFETY_INSPECTION_CENTS },
      conditions: { field: ELEC, op: "eq", value: "safety_inspection" },
    }),

    rule(sourceId, {
      id: "sc-elec-sign",
      code: "ELEC-SIGN",
      label: "Sign — electrical fee (building)",
      description:
        'Fee listing: "Sign - Electrical Fee (Building) — $216". A flat charge for the electrical work in a sign, separate from the sign permit fee itself, which the listing prices "based on the valuation of the sign".',
      feeType: "flat",
      config: { amountCents: SC_FLAT_SIGN_ELECTRICAL_CENTS },
      conditions: { field: ELEC, op: "eq", value: "sign" },
    }),
  ];
}

/**
 * The plumbing permits Sacramento prices: the minor plumbing scope and the water heater.
 *
 * The minor plumbing permit is one $105 charge for any one of a long list of scopes, and
 * the sheet is explicit that more than one of them — beyond a toilet added to another
 * bathroom fixture — moves the job to the remodel section or to a valuation. That is the
 * fact a reader most often gets wrong, so it is on the page rather than only in the rule.
 */
export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "sc-plumb-minor-residential",
      code: "PLUMB-MINOR-RESIDENTIAL",
      label: "Residential minor plumbing repair or replacement work",
      description:
        'Table B.1: "Residential Minor Plumbing Repair or Replacement Work — $105", covering one or more of "sewer service, water service, drain line, water supply, gas service, kitchen — single fixture, bathroom — single fixture, toilet replacement". The sheet adds: "If more than one bathroom or one kitchen appliance or fixture repair is needed, use the kitchen or bathroom remodel section above, or calculate based on value. The only exception is that one or more toilets may be replaced in addition to another bathroom fixture."',
      feeType: "flat",
      config: { amountCents: SC_FLAT_MINOR_PLUMBING_CENTS },
      conditions: { field: PLUMB, op: "eq", value: "minor_residential" },
    }),

    rule(sourceId, {
      id: "sc-plumb-water-heater",
      code: "PLUMB-WATER-HEATER",
      label: "Water heater, new installation, replacement or move",
      description:
        'Table B.1, Residential: "Water heater (new installation, replacement or move) — $75". The Commercial column prices "Water Heater like for like replacement" at the same $75; the sheet sends a commercial solar water heater to "a standard commercial remodel permit" instead.',
      feeType: "flat",
      config: { amountCents: SC_FLAT_WATER_HEATER_CENTS },
      conditions: { field: PLUMB, op: "eq", value: "water_heater" },
    }),
  ];
}

export const SC_BUILDING_RULES: FeeRuleRecord[] = [
  ...buildingValuationLadderRules(SC_TABLE_A_SOURCE_KEY),
  ...buildingValuationBandRules(SC_TABLE_A_SOURCE_KEY),
  ...buildingFlatScopeRules(SC_TABLE_A_SOURCE_KEY),
  ...buildingAddOnRules(SC_FEE_LISTING_SOURCE_KEY),
];

export const SC_ELECTRICAL_RULES: FeeRuleRecord[] = electricalRules(SC_TABLE_A_SOURCE_KEY);

export const SC_PLUMBING_RULES: FeeRuleRecord[] = plumbingRules(SC_TABLE_A_SOURCE_KEY);
