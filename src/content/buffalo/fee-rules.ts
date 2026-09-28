import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Buffalo fee rules — the Department of Permit & Inspection Services' own fee sheets.
 *
 * Every figure below is transcribed from the four documents named in
 * research/new-york/buffalo.md:
 *
 *  - The **residential** sheet (EFFECTIVE 7/1/2025) prices detached 1- and 2-family
 *    dwellings: a $25 application, 20% plan review, new dwellings by flat area bands,
 *    alterations by cost at $5 per $1,000, and a list of flat fees that are added
 *    together.
 *  - The **commercial** sheet (also EFFECTIVE 7/1/2025) prices everything else off mean
 *    construction cost: $50 application, $0.75 per $1,000 plan review and $8 per $1,000
 *    permit — both of which round the cost up to a whole $1,000, in the sheet's own words
 *    and in its own worked examples, which this module reproduces cent for cent.
 *  - The **electrical** schedule has two regimes: flat fees when no plans are required,
 *    and — when they are — Schedule A's "greater of $50 or rate × SF × multiplier" rows
 *    with Schedule B's occupancy multipliers, which this module stores as the published
 *    lookup table it is.
 *  - The **plumbing** page is a plain-text price list: $50 application, $100 plan review,
 *    fixtures at $12 (or $50 first + $20 additional), underground piping in 100-foot
 *    segments, $75 reinspections.
 *
 * The City Code itself is not readable from this environment (ecode360 answers 403), so
 * these sheets — the documents an applicant actually pays against — are the sources, and
 * each rule's description quotes its own row.
 */

/* -------------------------------------------------------------------------- */
/* Source and schedule keys                                                   */
/* -------------------------------------------------------------------------- */

export const BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY = "buffalo-residential-permit-fee-schedule";
export const BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY = "buffalo-commercial-permit-fee-schedule";
export const BUFFALO_PLUMBING_SOURCE_KEY = "buffalo-plumbing-permit-fees";
export const BUFFALO_ELECTRICAL_SOURCE_KEY = "buffalo-electric-permit-types-and-fees";
export const BUFFALO_FEE_HUB_SOURCE_KEY = "buffalo-fee-schedule-hub";
export const BUFFALO_DEPARTMENT_SOURCE_KEY = "buffalo-permit-inspection-services";
export const BUFFALO_ICC_BVD_SOURCE_KEY = "buffalo-icc-building-valuation-data";

/** Both building sheets print this on the foot of every page. */
export const BUFFALO_BUILDING_EFFECTIVE_FROM = "2025-07-01";
/** The electrical schedule is undated; its document metadata reads 2017-05-31. */
export const BUFFALO_ELECTRICAL_EFFECTIVE_FROM = "2017-05-31";
/** The plumbing page prints no date, so it is effective from the day it was read. */
export const BUFFALO_PLUMBING_EFFECTIVE_FROM = "2026-09-25";

/* -------------------------------------------------------------------------- */
/* Shared amounts                                                             */
/* -------------------------------------------------------------------------- */

/** "Application Fee — $25" (residential sheet) / "$50" (commercial sheet, both trade schedules). */
const BUF_RES_APPLICATION_CENTS = 2_500;
const BUF_COMM_APPLICATION_CENTS = 5_000;
/** "Plan Review Fee … 20% of permit fee; $25 minimum" (residential sheet). */
const BUF_RES_PLAN_REVIEW_MINIMUM_CENTS = 2_500;
/** "Plan Review Fee (if work requires plans) $0.75 per $1,000 of mean construction cost or portion thereof; $75 minimum." */
const BUF_COMM_PLAN_REVIEW_MINIMUM_CENTS = 7_500;
/** "$8 per $1,000 of cost; $100 minimum." */
const BUF_COMM_PERMIT_MINIMUM_CENTS = 10_000;
/** "$5 per $1,000; $50 minimum" (residential cost row). */
const BUF_RES_COST_MINIMUM_CENTS = 5_000;
/** "Reinspection Fee: $75.00 per reinspection" (plumbing page). */
const BUF_PLUMBING_REINSPECTION_CENTS = 7_500;
/** "Plan Review Fee: $100.00 (only required if plans are required)" (plumbing page). */
const BUF_PLUMBING_PLAN_REVIEW_CENTS = 10_000;

/* -------------------------------------------------------------------------- */
/* Residential building sheet — flat fees, by type of work                    */
/* -------------------------------------------------------------------------- */

/** Each row of the residential sheet's "Flat Fees (fees for each type of work done are added)" list. */
const BUF_RESIDENTIAL_FLAT_FEES = [
  {
    code: "CHIMNEY",
    amountCents: 2_500,
    fact: "chimney",
    row: "Chimney work",
    printed: "$25",
  },
  {
    code: "POOL-OVERGROUND",
    amountCents: 5_000,
    fact: "pool_overground",
    row: "Aboveground pool, spa, over two feet deep",
    printed: "$50",
  },
  {
    code: "POOL-IN-GROUND",
    amountCents: 15_000,
    fact: "pool_in_ground",
    row: "In-ground pool, spa, pond, over two feet deep",
    printed: "$150",
  },
  {
    code: "FENCE",
    amountCents: 2_500,
    fact: "fence",
    row: "Fence requiring a permit (over height, etc.)",
    printed: "$25",
  },
  {
    code: "DRIVEWAY",
    amountCents: 2_500,
    fact: "driveway",
    row: "New or expanded parking area and/or driveway",
    printed: "$25",
  },
  {
    code: "ALTERNATIVE-ENERGY",
    amountCents: 7_500,
    fact: "alternative_energy",
    row: "Alternative energy systems",
    printed: "$75",
  },
  {
    code: "SHED-GARAGE",
    amountCents: 7_500,
    fact: "shed_garage",
    row: "Sheds and garages (over 144 square feet and under 600 square feet)",
    printed: "$75",
  },
  {
    code: "INTERIOR-TEAR-OUT",
    amountCents: 2_500,
    fact: "interior_tear_out",
    row: "Interior tear-out",
    printed: "$25",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Commercial building sheet — flat fees                                      */
/* -------------------------------------------------------------------------- */

/** Each row of the commercial sheet's "Flat Fees (specific for small types of work)" list. */
const BUF_COMMERCIAL_FLAT_FEES = [
  { code: "AWNING", amountCents: 7_500, fact: "awning", row: "Awnings (without signage)", printed: "$75" },
  { code: "SIGN-WALL", amountCents: 5_000, fact: "sign_wall", row: "Flat wall signs", printed: "$50" },
  {
    code: "SIGN-PROJECTING",
    amountCents: 7_500,
    fact: "sign_projecting",
    row: "Projecting wall signs & awning signs",
    printed: "$75",
  },
  {
    code: "SIGN-FREESTANDING",
    amountCents: 5_000,
    fact: "sign_freestanding",
    row: "Freestanding signs (under 6' in height)",
    printed: "$50",
  },
  {
    code: "SIGN-FACE-REPLACEMENT",
    amountCents: 2_500,
    fact: "sign_face_replacement",
    row: "Sign face replacement, existing signs (except L.E.D. faces)",
    printed: "$25",
  },
  { code: "SIGN-PORTABLE", amountCents: 2_500, fact: "sign_portable", row: "Portable signs", printed: "$25" },
  { code: "TANK", amountCents: 30_000, fact: "tank", row: "Tank installation or removal", printed: "$300" },
  {
    code: "ANTENNA",
    amountCents: 10_000,
    fact: "antenna",
    row: "Communication antennas and dishes, co-location",
    printed: "$100",
  },
  {
    code: "FENCE",
    amountCents: 5_000,
    fact: "fence",
    row: "Fence requiring a permit (over height, etc.)",
    printed: "$50",
  },
  {
    code: "TRAILER",
    amountCents: 20_000,
    fact: "trailer",
    row: "Temporary trailer (over 10 days, up to 1 year)",
    printed: "$200",
  },
  {
    code: "STORAGE-POD",
    amountCents: 5_000,
    fact: "storage_pod",
    row: "Storage pod, up to 4 months (with use variance approval)",
    printed: "$50",
  },
  {
    code: "SHED-GARAGE",
    amountCents: 10_000,
    fact: "shed_garage",
    row: "Sheds & garages 600 square feet and under",
    printed: "$100",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Electrical — Schedule B, the occupancy multiplier table                    */
/* -------------------------------------------------------------------------- */

/**
 * Schedule B, exactly as printed: each class/use group with its multiplier.
 *
 * The blanks are real — I-2, I-3 and I-4 print no multiplier (the I-2 row of the City's
 * document stops mid-sentence) — so they have no entry here, and an application that
 * names one of them gets no rate rather than an invented one.
 */
const BUF_SCHEDULE_B_MULTIPLIERS: Array<{ values: string[]; rate: { numerator: number; denominator: number } }> = (
  [
    { codes: ["A-1", "A-2", "A-3", "A-4", "A-5"], rate: { numerator: 3, denominator: 2 } },
    { codes: ["B"], rate: { numerator: 1, denominator: 1 } },
    { codes: ["E"], rate: { numerator: 3, denominator: 2 } },
    { codes: ["F-1", "F-2", "F"], rate: { numerator: 1, denominator: 1 } },
    { codes: ["H-1", "H-2", "H-3", "H-4", "H-5"], rate: { numerator: 9, denominator: 4 } },
    { codes: ["I-1"], rate: { numerator: 7, denominator: 4 } },
    { codes: ["M"], rate: { numerator: 1, denominator: 1 } },
    { codes: ["R-1"], rate: { numerator: 32, denominator: 25 } },
    { codes: ["R-2"], rate: { numerator: 32, denominator: 25 } },
    { codes: ["R-3"], rate: { numerator: 1, denominator: 2 } },
    { codes: ["R-4"], rate: { numerator: 67, denominator: 50 } },
    { codes: ["S-1", "S-2"], rate: { numerator: 7, denominator: 10 } },
    { codes: ["U"], rate: { numerator: 17, denominator: 20 } },
  ] satisfies Array<{ codes: string[]; rate: { numerator: number; denominator: number } }>
).flatMap(({ codes, rate }) => codes.map((code) => ({ values: [code], rate })));

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function buffaloRule(
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

/** The construction-class switch both building sheets are gated on (reading a). */
const RESIDENTIAL: FeeCondition = { field: "custom.one_two_family", op: "eq", value: true };
function notResidential(): FeeCondition {
  return { not: { field: "custom.one_two_family", op: "eq", value: true } };
}

const RES = BUFFALO_RESIDENTIAL_SCHEDULE_SOURCE_KEY;
const COM = BUFFALO_COMMERCIAL_SCHEDULE_SOURCE_KEY;
const ELEC = BUFFALO_ELECTRICAL_SOURCE_KEY;
const PLUMB = BUFFALO_PLUMBING_SOURCE_KEY;
const RES_EFF = BUFFALO_BUILDING_EFFECTIVE_FROM;
const ELEC_EFF = BUFFALO_ELECTRICAL_EFFECTIVE_FROM;
const PLUMB_EFF = BUFFALO_PLUMBING_EFFECTIVE_FROM;

/* -------------------------------------------------------------------------- */
/* Residential building rules — the sheet for detached 1- & 2-family dwellings */
/* -------------------------------------------------------------------------- */

/**
 * "Application Fee — $25", as a component of type `other` rather than `base`.
 *
 * The sheet's own total adds the application fee to the permit fee, and the plan review
 * is 20% "of permit fee" — which means the permit fee line alone. Folding the $25 into
 * the base subtotal would have charged 20% on the application as well, a figure the sheet
 * never prints.
 */
const BUF_RES_APPLICATION = buffaloRule(RES, RES_EFF, {
  id: "buf-bld-res-application",
  code: "BLD-RES-APPLICATION",
  label: "Building permit — residential application fee, $25.00",
  feeType: "flat",
  config: { amountCents: BUF_RES_APPLICATION_CENTS },
  componentType: "other",
  priority: 50,
  conditions: RESIDENTIAL,
  description:
    'Residential sheet, Application Fee: "$25". Charged on every residential building application — the first line of the sheet\'s own total: "Total fees cost is Application Fee, plus Plan Review Fee (as necessary), plus Use Permit Fee (as necessary), plus Flat Fee(s) (as necessary), plus Permit Fee". Held out of the base subtotal so the plan review percentage measures the permit fee alone.',
});

/** "Plan Review Fee (if work requires plans) (includes M/E/P plan review fees) — 20% of permit fee; $25 minimum." */
const BUF_RES_PLAN_REVIEW = buffaloRule(RES, RES_EFF, {
  id: "buf-bld-res-plan-review",
  code: "BLD-RES-PLAN-REVIEW",
  label: "Building permit — residential plan review, 20% of the permit fee ($25 minimum)",
  feeType: "percent",
  componentType: "plan_review",
  priority: 200,
  config: { basis: "permit_fee", rateBps: 2_000 },
  minimumCents: BUF_RES_PLAN_REVIEW_MINIMUM_CENTS,
  conditions: { all: [RESIDENTIAL, { field: "custom.plan_review", op: "eq", value: true }] },
  description:
    'Residential sheet, Plan Review Fee: "20% of permit fee; $25 minimum", charged only "(if work requires plans)". The percentage reads the permit fee — the base subtotal — so the $25 application fee is not part of its basis, and the $25 floor binds on a small permit. The sheet notes the line "includes M/E/P plan review fees", so the heating, electrical and plumbing reviews are not added again on their own pages.',
});

/**
 * New dwellings, by area created — the sheet's four one-family bands, the two-family
 * flat, and the townhouse per-unit rate.
 *
 * The class gates are written so exactly one answers: a townhouse is claimed by
 * `custom.townhouse`, a two-family by `units` of 2, and everything else in the class is a
 * one-family priced on its floor area. The `not(units eq 2)` wrapper is deliberate — an
 * applicant who has not answered `units` still gets the one-family bands, because the
 * sheet prices a detached 1- or 2-family dwelling and the floor area is the fact the row
 * asks for.
 */
const BUF_RESIDENTIAL_NEW_DWELLING_RULES: FeeRuleRecord[] = (
  [
    {
      code: "BLD-RES-NEW-1F-1000",
      amountCents: 50_000,
      band: "1,000 sq. ft. or less of floor area",
      conditions: { field: "square_footage", op: "lte", value: 1_000 },
    },
    {
      code: "BLD-RES-NEW-1F-1001-3000",
      amountCents: 60_000,
      band: "1,001 to 3,000 sq. ft. of floor area",
      conditions: {
        all: [
          { field: "square_footage", op: "gt", value: 1_000 },
          { field: "square_footage", op: "lte", value: 3_000 },
        ],
      },
    },
    {
      code: "BLD-RES-NEW-1F-3001-5000",
      amountCents: 75_000,
      band: "3,001 to 5,000 sq. ft. of floor area",
      conditions: {
        all: [
          { field: "square_footage", op: "gt", value: 3_000 },
          { field: "square_footage", op: "lte", value: 5_000 },
        ],
      },
    },
    {
      code: "BLD-RES-NEW-1F-OVER-5000",
      amountCents: 90_000,
      band: "5,001 sq. ft. of floor area and over",
      conditions: { field: "square_footage", op: "gt", value: 5_000 },
    },
  ] satisfies Array<{ code: string; amountCents: number; band: string; conditions: FeeCondition }>
).map((band) =>
  buffaloRule(RES, RES_EFF, {
    id: `buf-bld-${band.code.toLowerCase()}`,
    code: band.code,
    label: `Building permit — new one-family dwelling, ${band.band} ($${(band.amountCents / 100).toFixed(2)})`,
    feeType: "flat",
    config: { amountCents: band.amountCents },
    conditions: {
      all: [
        RESIDENTIAL,
        { not: { field: "custom.townhouse", op: "eq", value: true } },
        { not: { field: "units", op: "eq", value: 2 } },
        { field: "work_type", op: "eq", value: "new_construction" },
        band.conditions,
      ],
    },
    description: `Residential sheet, New Residential Buildings: "${band.band} — $${(
      band.amountCents / 100
    ).toFixed(0)}", a flat fee determined by area created rather than by cost. One of the sheet's four one-family bands; a two-family dwelling is $1,000 flat and a townhouse is $500 per unit, and exactly one of the three answers a given new dwelling.`,
  }),
);

/** "2-family dwellings — $1,000". */
const BUF_RES_NEW_TWO_FAMILY = buffaloRule(RES, RES_EFF, {
  id: "buf-bld-res-new-2f",
  code: "BLD-RES-NEW-2F",
  label: "Building permit — new two-family dwelling, $1,000.00",
  feeType: "flat",
  config: { amountCents: 100_000 },
  conditions: {
    all: [
      RESIDENTIAL,
      { not: { field: "custom.townhouse", op: "eq", value: true } },
      { field: "units", op: "eq", value: 2 },
      { field: "work_type", op: "eq", value: "new_construction" },
    ],
  },
  description:
    'Residential sheet, New Residential Buildings: "2-family dwellings — $1,000". One flat fee for the whole building, priced on the fact that it has two units rather than on floor area; the sheet does not band a two-family by size.',
});

/** "Townhouses — $500 per unit". */
const BUF_RES_NEW_TOWNHOUSE = buffaloRule(RES, RES_EFF, {
  id: "buf-bld-res-new-townhouse",
  code: "BLD-RES-NEW-TOWNHOUSE",
  label: "Building permit — new townhouse, $500.00 per unit",
  feeType: "per_unit",
  config: { unit: "dwelling_units", centsPerUnit: 50_000 },
  conditions: {
    all: [RESIDENTIAL, { field: "custom.townhouse", op: "eq", value: true }, { field: "work_type", op: "eq", value: "new_construction" }],
  },
  description:
    'Residential sheet, New Residential Buildings: "Townhouses — $500 per unit". Charged per unit on the dwelling count, so a four-unit townhouse row is $2,000.00 — the only residential row that scales with the number of units.',
});

/**
 * "Additions, alterations, and repairs to residential structures (fees determined by cost
 * of work) — Cost per $1,000 of construction cost: $5 per $1,000; $50 minimum."
 *
 * No round-up phrase appears anywhere on the residential sheet, so the fraction of a
 * $1,000 is charged as the fraction it is (reading b): $2,001 of cost is $10.01, and the
 * $50 floor binds below $10,000.
 */
const BUF_RES_COST = buffaloRule(RES, RES_EFF, {
  id: "buf-bld-res-cost",
  code: "BLD-RES-COST",
  label: "Building permit — residential addition, alteration or repair, $5.00 per $1,000 of cost ($50 minimum)",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 500 },
  minimumCents: BUF_RES_COST_MINIMUM_CENTS,
  conditions: {
    all: [
      RESIDENTIAL,
      {
        field: "work_type",
        op: "in",
        value: ["addition", "alteration", "repair", "remodel", "replacement"],
      },
    ],
  },
  description:
    'Residential sheet, Additions, alterations, and repairs: "$5 per $1,000; $50 minimum". The sheet prints no "or fraction thereof" — the phrase three other rows in this dataset use to round up — so this row prorates: $12,001 of cost is $60.01, where a whole-$1,000 reading would be $60.00. The $50 floor binds at $10,000 of cost and below.',
});

/** The residential sheet's demolition rows, by unit. */
const BUF_RESIDENTIAL_DEMOLITION_RULES: FeeRuleRecord[] = (
  [
    {
      code: "BLD-RES-DEMO-DWELLING",
      amountCents: 30_000,
      row: "Demolition of a 1- or 2-family dwelling",
      printed: "$300",
      extra: { not: { field: "custom.accessory_structure", op: "eq", value: true } },
    },
    {
      code: "BLD-RES-DEMO-ACCESSORY",
      amountCents: 7_500,
      row: "Demolition of a detached accessory structure over 144 sq. ft.",
      printed: "$75",
      extra: { field: "custom.accessory_structure", op: "eq", value: true },
    },
  ] satisfies Array<{
    code: string;
    amountCents: number;
    row: string;
    printed: string;
    extra: FeeCondition;
  }>
).map((entry) =>
  buffaloRule(RES, RES_EFF, {
    id: `buf-bld-${entry.code.toLowerCase()}`,
    code: entry.code,
    label: `Building permit — ${entry.row} ($${(entry.amountCents / 100).toFixed(2)})`,
    feeType: "flat",
    config: { amountCents: entry.amountCents },
    conditions: {
      all: [RESIDENTIAL, { field: "work_type", op: "eq", value: "demolition" }, entry.extra],
    },
    description: `Residential sheet, Demolitions (fees determined by unit): "${entry.row} — ${entry.printed}". One fee per unit demolished, not a rate on area or cost; the accessory row covers only structures over 144 sq. ft., which is the same size floor at which the sheet starts charging for sheds.`,
  }),
);

/** The residential sheet's use permits — three $25 rows, each its own fact. */
const BUF_RESIDENTIAL_USE_PERMIT_RULES: FeeRuleRecord[] = [
  { code: "BLD-RES-USE-CHANGE", fact: "change_of_use", row: "With change of use" },
  { code: "BLD-RES-USE-HOME-OCCUPATION", fact: "home_occupation", row: "Add or remove incidental home occupation" },
  { code: "BLD-RES-USE-STORAGE-POD", fact: "storage_pod", row: "Use temporary storage pod(s) for up to 4 months" },
].map((entry) =>
  buffaloRule(RES, RES_EFF, {
    id: `buf-bld-${entry.code.toLowerCase()}`,
    code: entry.code,
    label: `Building permit — use permit, ${entry.row.toLowerCase()} ($25.00)`,
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: { all: [RESIDENTIAL, { field: `custom.${entry.fact}`, op: "eq", value: true }] },
    description: `Residential sheet, Use Permit Fee: "${entry.row} — $25". Charged in addition to the permit fee ("plus Use Permit Fee (as necessary)"), and three such rows exist; each answers its own fact so a job that changes use and stores a pod pays both.`,
  }),
);

/* -------------------------------------------------------------------------- */
/* Commercial building rules — the sheet for everything else                  */
/* -------------------------------------------------------------------------- */

/** "Application Fee — $50" (commercial sheet). */
const BUF_COM_APPLICATION = buffaloRule(COM, RES_EFF, {
  id: "buf-bld-com-application",
  code: "BLD-COM-APPLICATION",
  label: "Building permit — commercial application fee, $50.00",
  feeType: "flat",
  config: { amountCents: BUF_COMM_APPLICATION_CENTS },
  componentType: "other",
  priority: 50,
  conditions: notResidential(),
  description:
    'Commercial sheet, Application Fee: "$50". The commercial counterpart of the residential sheet\'s $25 — and, like it, held out of the base subtotal so nothing measures a percentage against the application fee. The commercial sheet covers every job the residential sheet does not: it opens by requiring permits for all work not exempt under Charter §103-2.3, and its header keeps the trades out — "Heating, Electrical, and Plumbing (M/E/P) permits and fees are separate."',
});

/**
 * "Plan Review Fee (if work requires plans) — $0.75 per $1,000 of mean construction cost
 * or portion thereof; $75 minimum", with the mean cost determined from the ICC Building
 * Valuation Data Table printed on page 2 of the same PDF.
 *
 * "or portion thereof" is the round-up phrase, so the cost itself is charged in whole
 * $1,000s — the sheet's own Example 1 rounds $3,741,600 to $3,742,000 before multiplying,
 * and this rule reproduces that $2,806.50 to the cent (reading b).
 */
const BUF_COM_PLAN_REVIEW = buffaloRule(COM, RES_EFF, {
  id: "buf-bld-com-plan-review",
  code: "BLD-COM-PLAN-REVIEW",
  label: "Building permit — commercial plan review, $0.75 per $1,000 of mean cost ($75 minimum)",
  feeType: "per_thousand",
  componentType: "plan_review",
  priority: 200,
  config: { basis: "valuation", centsPerThousand: 75, incrementCents: 100_000 },
  minimumCents: BUF_COMM_PLAN_REVIEW_MINIMUM_CENTS,
  conditions: { all: [notResidential(), { field: "custom.plan_review", op: "eq", value: true }] },
  description:
    'Commercial sheet: "Plan Review Fee (if work requires plans) $0.75 per $1,000 of mean construction cost or portion thereof; $75 minimum. Use the Building Valuation Data Table (page 2) to determine the mean construction cost." The "or portion thereof" charges any part of a $1,000 as a whole one — the sheet\'s Example 1 computes $3,741,600 as $3,742,000 — so this rule rounds the cost up before multiplying. The $75 floor binds below $100,000 of mean cost.',
});

/**
 * "New construction, additions, change of use, or alterations — $8 per $1,000 of cost;
 * $100 minimum."
 *
 * The examples state the row as "$8.00 per $1,000. of mean construction cost or portion
 * thereof", so this row rounds up as the plan review does. Demolitions are excluded — the
 * sheet prices them in their own section — and for repairs the paragraph above the row
 * says to use the contract amount instead of a mean cost, which is the same basis this
 * rule reads.
 */
const BUF_COM_PERMIT = buffaloRule(COM, RES_EFF, {
  id: "buf-bld-com-permit",
  code: "BLD-COM-PERMIT",
  label: "Building permit — commercial construction permit, $8.00 per $1,000 of cost ($100 minimum)",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: 800, incrementCents: 100_000 },
  minimumCents: BUF_COMM_PERMIT_MINIMUM_CENTS,
  conditions: { all: [notResidential(), { not: { field: "work_type", op: "eq", value: "demolition" } }] },
  description:
    'Commercial sheet: "Permit Fee — Use the Building Valuation Data Table (page 2) to calculate mean construction cost for new construction, additions, change of use, and alterations. For repairs and for work on elements that are not part of the building, use the contract amount instead. New construction, additions, change of use, or alterations — $8 per $1,000 of cost; $100 minimum." Both worked examples on the sheet multiply in whole $1,000s of cost ("or portion thereof"), so this rule rounds up before multiplying: $3,741,600 of mean cost is $29,936.00. Demolition has its own rows below and does not answer here.',
});

/** The commercial sheet's demolition rows. */
const BUF_COMMERCIAL_DEMOLITION_RULES: FeeRuleRecord[] = (
  [
    {
      id: "buf-bld-com-demo-area",
    code: "BLD-COM-DEMO-AREA",
    label: "Building permit — commercial demolition, $0.12 per sq. ft. ($500 minimum)",
    feeType: "percent" as const,
    config: { basis: "square_footage", rate: { numerator: 12, denominator: 1 }, rateUnit: "currency_per_unit" as const },
    minimumCents: 50_000,
    conditions: {
      all: [
        notResidential(),
        { field: "work_type", op: "eq", value: "demolition" },
        { not: { field: "custom.accessory_structure", op: "eq", value: true } },
        { not: { field: "custom.interior_tear_out", op: "eq", value: true } },
      ],
    },
    description:
      'Commercial sheet, Demolitions: "Demolition of a commercial structure — $0.12 per sq. ft.; $500 minimum." Charged on the area demolished at twelve cents a square foot, with the $500 floor binding below about 4,167 sq. ft. The accessory-structure and interior tear-out rows are separate prices and are excluded here so exactly one demolition row answers.',
  },
  {
    id: "buf-bld-com-demo-accessory",
    code: "BLD-COM-DEMO-ACCESSORY",
    label: "Building permit — commercial accessory-structure demolition, $75.00",
    feeType: "flat" as const,
    config: { amountCents: 7_500 },
    conditions: {
      all: [
        notResidential(),
        { field: "work_type", op: "eq", value: "demolition" },
        { field: "custom.accessory_structure", op: "eq", value: true },
      ],
    },
    description:
      'Commercial sheet, Demolitions: "Demolition of a detached accessory structure over 144 sq. ft. and up to 1,000 sq. ft. — $75". A flat fee for the structure, between the size floors the sheet names; a structure over 1,000 sq. ft. is priced by the commercial structure row instead.',
  },
  {
    id: "buf-bld-com-demo-tear-out",
    code: "BLD-COM-DEMO-TEAR-OUT",
    label: "Building permit — commercial interior tear-out, $200.00",
    feeType: "flat" as const,
    config: { amountCents: 20_000 },
    conditions: {
      all: [
        notResidential(),
        { field: "work_type", op: "eq", value: "demolition" },
        { field: "custom.interior_tear_out", op: "eq", value: true },
        { not: { field: "custom.accessory_structure", op: "eq", value: true } },
      ],
    },
    description:
      'Commercial sheet, Demolitions: "Interior tear-out — $200". Gutting the inside of a standing commercial building, priced flat rather than by area; the residential sheet charges the same job $25 under its Flat Fees, and the two sheets never answer the same input.',
    },
  ] satisfies Array<
    Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config" | "conditions" | "description"> &
      Partial<Pick<FeeRuleRecord, "minimumCents">>
  >
).map((entry) => buffaloRule(COM, RES_EFF, entry));

/** "Any demolition that takes place without a proper permit shall be assessed a penalty — $1,500." */
const BUF_COM_DEMO_PENALTY = buffaloRule(COM, RES_EFF, {
  id: "buf-bld-com-demo-no-permit",
  code: "BLD-COM-DEMO-NO-PERMIT",
  label: "Building permit — demolition without a permit, $1,500.00 penalty",
  feeType: "flat",
  config: { amountCents: 150_000 },
  componentType: "surcharge",
  priority: 500,
  conditions: {
    all: [
      notResidential(),
      { field: "work_type", op: "eq", value: "demolition" },
      { field: "custom.unpermitted_work", op: "eq", value: true },
    ],
  },
  description:
    'Commercial sheet, Demolitions: "Any demolition that takes place without a proper permit shall be assessed a penalty — $1,500". A penalty rather than a fee, so it is charged as a surcharge on top of whatever the permitted demolition would have cost, and only when the input says the work happened without a permit. The residential sheet prints no such penalty.',
});

/** "Use Permit Fee (with occupancy/use class change) — $50" (commercial sheet). */
const BUF_COM_USE_PERMIT = buffaloRule(COM, RES_EFF, {
  id: "buf-bld-com-use-permit",
  code: "BLD-COM-USE-PERMIT",
  label: "Building permit — commercial use permit, $50.00",
  feeType: "flat",
  config: { amountCents: 5_000 },
  conditions: { all: [notResidential(), { field: "custom.change_of_use", op: "eq", value: true }] },
  description:
    'Commercial sheet, Use Permit Fee: "With occupancy/use class change — $50". The commercial counterpart of the residential sheet\'s $25 use permit, at the commercial rate, and the same fact drives both — the construction class decides which one answers.',
});

/* -------------------------------------------------------------------------- */
/* Electrical rules — the flat schedule and Schedules A and B                 */
/* -------------------------------------------------------------------------- */

/**
 * "APPLICATION FEE of $50" — the one charge both electrical regimes share.
 *
 * The flat schedule says "$50 PLUS one of the following"; Schedule A lists
 * "Application fee $50" as its first of three charges. One rule answers both, as a
 * component of type `other` so the area regime's own three-charge structure (application,
 * plan review, permit & inspection) still reads base-plus-review in the breakdown.
 */
const BUF_ELEC_APPLICATION = buffaloRule(ELEC, ELEC_EFF, {
  id: "buf-elec-application",
  code: "ELEC-APPLICATION",
  label: "Electrical permit — application fee, $50.00",
  feeType: "flat",
  config: { amountCents: 5_000 },
  componentType: "other",
  priority: 50,
  description:
    'Flat schedule: "APPLICATION FEE of $50 PLUS one of the following." Schedule A: "Application fee $50". The same non-refundable application fee answers both regimes — it is the plus-one of the flat schedule and the first of the area schedule\'s three charges — so exactly one of it is charged however the job is priced.',
});

/** The flat schedule's five rows: "$50 PLUS one of the following." */
const BUF_ELECTRICAL_FLAT_RULES: FeeRuleRecord[] = [
  {
    code: "ELEC-FLAT-ONE-FAMILY",
    amountCents: 5_000,
    fact: "elec_one_family",
    row: "For any new electrical work at a one-family dwelling or at one (1) apartment of a two-family dwelling, including Service, Lights/receptacles, Equipment, Low Voltage applications",
    printed: "$50",
  },
  {
    code: "ELEC-FLAT-TWO-FAMILY-BOTH",
    amountCents: 7_500,
    fact: "elec_two_family_both",
    row: "For any new electrical work at both apartments of a two-family residential dwelling, including Service, Lights/receptacles, Equipment, Low Voltage applications",
    printed: "$75",
  },
  {
    code: "ELEC-FLAT-METER-RELEASE",
    amountCents: 5_000,
    fact: "meter_release",
    row: "Meter releases for residential, commercial or industrial for first meter",
    printed: "$50",
  },
  {
    code: "ELEC-FLAT-LOW-VOLTAGE",
    amountCents: 7_500,
    fact: "low_voltage_system",
    row: "For low Voltage applications for all systems installed by individual contractor/installer: Telephone; Data Cabling; Security; CCTV; Thermostats; Sound Systems, Intercom Energy Management Systems — Per system PLUS $5.00 per termination",
    printed: "$75",
  },
  {
    code: "ELEC-FLAT-SITE-WORK",
    amountCents: 7_500,
    fact: "elec_site_work",
    row: "For electrical site work (e.g. lighting & control gates, etc.) not in conjunction with a building or structure project",
    printed: "$75",
  },
].map((entry) =>
  buffaloRule(ELEC, ELEC_EFF, {
    id: `buf-${entry.code.toLowerCase()}`,
    code: entry.code,
    label: `Electrical permit — flat fee, ${entry.row.slice(0, 60).toLowerCase()} (${entry.printed})`,
    feeType: "flat",
    config: { amountCents: entry.amountCents },
    conditions: {
      all: [
        { not: { field: "custom.plans_required", op: "eq", value: true } },
        { field: `custom.${entry.fact}`, op: "eq", value: true },
      ],
    },
    description: `Flat fee schedule: "${entry.row} — ${entry.printed}". "All Electrical Flat Fee work is only when NO drawings or plans are required by the Building Code of New York State", so this row and Schedule A's area rows never answer the same job; "${entry.printed}" is one of the schedule's "one of the following", charged once the application fee is added.`,
  }),
);

/**
 * "$75 Per system PLUS $5.00 per termination" — the terminations of the low-voltage row.
 *
 * The schedule states the $75 and the per-termination charge in one line; the $75 is the
 * row above and this is the plus, priced per termination with no allowance.
 */
const BUF_ELEC_LOW_VOLTAGE_TERMINATIONS = buffaloRule(ELEC, ELEC_EFF, {
  id: "buf-elec-flat-low-voltage-terminations",
  code: "ELEC-FLAT-LOW-VOLTAGE-TERMINATIONS",
  label: "Electrical permit — low-voltage terminations, $5.00 each",
  feeType: "per_unit",
  config: { unit: "low_voltage_points", centsPerUnit: 500 },
  conditions: {
    all: [
      { not: { field: "custom.plans_required", op: "eq", value: true } },
      { field: "custom.low_voltage_system", op: "eq", value: true },
      { field: "custom.low_voltage_points", op: "gt", value: 0 },
    ],
  },
  description:
    'Flat fee schedule, low-voltage row: "Per system PLUS $5.00 per termination." The $75 is the flat row; this is the plus — every termination of a telephone, data, security, CCTV, thermostat, sound, intercom or energy-management system at $5.00, with no free allowance printed.',
});

/**
 * Schedule A's two "whichever is greater" charges, as two rules over one published table.
 *
 * Each rule is Schedule A's own row — "plan review fee $50 or $0.0025 x SF x multiplier
 * (whichever is greater)" and "permit & inspection fee $50 or $0.0275 x SF x multiplier
 * (whichever is greater)" — where the $50 is the rule's floor, the constant is the rule's
 * `rateMultiplier` in cents per square foot ($0.0025 is 1/4 of a cent, $0.0275 is 11/4),
 * and the multiplier is Schedule B itself, stored as the lookup table it is printed as.
 * Schedule B's blank I-2, I-3 and I-4 rows are absent from the table, so those
 * occupancies get no rate rather than an invented one (readings e and f).
 */
function bufAreaRule(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label"> & {
    rateMultiplier: { numerator: number; denominator: number };
    componentType?: FeeRuleRecord["componentType"];
    priority?: number;
    description: string;
  },
): FeeRuleRecord {
  return buffaloRule(ELEC, ELEC_EFF, {
    id: overrides.id,
    code: overrides.code,
    label: overrides.label,
    feeType: "percent",
    componentType: overrides.componentType ?? "base",
    priority: overrides.priority ?? 100,
    minimumCents: 5_000,
    conditions: { field: "custom.plans_required", op: "eq", value: true },
    config: {
      basis: "square_footage",
      rateUnit: "currency_per_unit",
      rateMultiplier: overrides.rateMultiplier,
      rateTables: [
        {
          label: "Schedule B — occupancy/use multiplier",
          keys: ["custom.elec_occupancy"],
          rateUnit: "fraction",
          entries: BUF_SCHEDULE_B_MULTIPLIERS,
        },
      ],
    },
    description: overrides.description,
  });
}

const BUF_ELEC_AREA_PLAN_REVIEW = bufAreaRule({
  id: "buf-elec-area-plan-review",
  code: "ELEC-AREA-PLAN-REVIEW",
  label: "Electrical permit — area plan review, $50 or $0.0025 × SF × multiplier, whichever is greater",
  rateMultiplier: { numerator: 1, denominator: 4 },
  componentType: "plan_review",
  priority: 200,
  description:
    'Schedule A: "PLUS plan review fee $50 or $0.0025 x SF x multiplier (whichever is greater)". The $50 is this rule\'s floor; the constant is a quarter of a cent per square foot; the multiplier is Schedule B\'s row for the occupancy named on the application (A and E are 1.5, R-2 is 1.28, R-3 is 0.5, and so on). The schedule calls the whole thing "whichever is greater", which is a floor on a rate rather than a fixed charge: 5,000 sq ft of R-2 computes $16.00 and pays the $50.00 floor; 50,000 sq ft of the same occupancy computes $160.00 and pays that.',
});

const BUF_ELEC_AREA_PERMIT = bufAreaRule({
  id: "buf-elec-area-permit-inspection",
  code: "ELEC-AREA-PERMIT-INSPECTION",
  label: "Electrical permit — area permit & inspection, $50 or $0.0275 × SF × multiplier, whichever is greater",
  rateMultiplier: { numerator: 11, denominator: 4 },
  description:
    'Schedule A: "PLUS permit & inspection fee $50 or $0.0275 x SF x multiplier (whichever is greater)". The charge for the permit and its inspections as one line, because the schedule prints them as one line: 2.75 cents per square foot times Schedule B\'s occupancy multiplier, floored at $50.00. 5,000 sq ft of R-2 is 5,000 × 2.75 × 1.28 = $176.00.',
});

/** Schedule A: "PLUS each electric meter to be installed $25." */
const BUF_ELEC_AREA_METER = buffaloRule(ELEC, ELEC_EFF, {
  id: "buf-elec-area-meter",
  code: "ELEC-AREA-METER",
  label: "Electrical permit — each electric meter, $25.00",
  feeType: "per_unit",
  config: { unit: "meters", centsPerUnit: 2_500 },
  conditions: {
    all: [
      { field: "custom.plans_required", op: "eq", value: true },
      { field: "custom.meters", op: "gt", value: 0 },
    ],
  },
  description:
    'Schedule A, Buildings & Structures: "PLUS each electric meter to be installed $25". Charged per meter on an area-calculated permit — the flat schedule prices a first meter release at $50 instead, and the two never answer the same job.',
});

/** Schedule A's commercial-solar block: the same two rows plus "per solar panel $3.00". */
const BUF_ELEC_AREA_SOLAR_PANEL = buffaloRule(ELEC, ELEC_EFF, {
  id: "buf-elec-area-solar-panel",
  code: "ELEC-AREA-SOLAR-PANEL",
  label: "Electrical permit — commercial solar panel, $3.00 each",
  feeType: "per_unit",
  config: { unit: "panels", centsPerUnit: 300 },
  conditions: {
    all: [
      { field: "custom.plans_required", op: "eq", value: true },
      { field: "custom.commercial_solar", op: "eq", value: true },
      { field: "custom.panels", op: "gt", value: 0 },
    ],
  },
  description:
    'Schedule A, COMMERCIAL SOLAR INSTALLATIONS: "PLUS per solar panel $3.00". Charged per panel beside the same plan review and permit rows the ordinary block charges — the solar block repeats those two rows rather than replacing them, so they are not duplicated here.',
});

/* -------------------------------------------------------------------------- */
/* Plumbing rules — the plain-text price list                                 */
/* -------------------------------------------------------------------------- */

/** "Application Fee: $50.00 (flat fee, required for all applications)". */
const BUF_PLUMB_APPLICATION = buffaloRule(PLUMB, PLUMB_EFF, {
  id: "buf-plumb-application",
  code: "PLUMB-APPLICATION",
  label: "Plumbing permit — application fee, $50.00",
  feeType: "flat",
  config: { amountCents: 5_000 },
  componentType: "other",
  priority: 50,
  description:
    'Plumbing page, General Fees: "Application Fee: $50.00 (flat fee, required for all applications)". The first line of the page\'s own total ("Total Permit Fee … Application fee, Plan review fee (if required), Fixture fees, Underground piping fees, Reinspection fees (if applicable)"), and the only plumbing charge that answers every job.',
});

/** "Plan Review Fee: $100.00 (only required if plans are required)". */
const BUF_PLUMB_PLAN_REVIEW = buffaloRule(PLUMB, PLUMB_EFF, {
  id: "buf-plumb-plan-review",
  code: "PLUMB-PLAN-REVIEW",
  label: "Plumbing permit — plan review, $100.00 when plans are required",
  feeType: "flat",
  componentType: "plan_review",
  priority: 200,
  config: { amountCents: BUF_PLUMBING_PLAN_REVIEW_CENTS },
  conditions: { field: "custom.plan_review", op: "eq", value: true },
  description:
    'Plumbing page, General Fees: "Plan Review Fee: $100.00 (only required if plans are required)". A flat charge rather than a percentage — the page publishes no rate for it — and it is in addition to the application and fixture fees, per the page\'s own total.',
});

/** The fixture rows: $12 each in a 1- or 2-family home, $50 first + $20 each after elsewhere. */
const BUF_PLUMBING_FIXTURE_RULES: FeeRuleRecord[] = (
  [
    {
      id: "buf-plumb-fixtures-residential",
      code: "PLUMB-FIXTURES-RESIDENTIAL",
      label: "Plumbing permit — fixtures, $12.00 each (1- or 2-family residential)",
    config: { unit: "fixtures", centsPerUnit: 1_200 },
    conditions: { all: [RESIDENTIAL, { field: "fixtures", op: "gt", value: 0 }] },
    description:
      'Plumbing page, Fixture Fees, "1‑ or 2‑Family Residential": "Fixture Fee: $12.00 per fixture", where the fixture list is the page\'s own — toilet, urinal, basin, bathtub, shower, sink, water heater, sump pump, floor drain, backflow device, drinking fountain, laundry connection, catch basin, manhole, other. No first-fixture break and no cap: each fixture is twelve dollars.',
  },
  {
    id: "buf-plumb-fixtures-commercial",
    code: "PLUMB-FIXTURES-COMMERCIAL",
    label: "Plumbing permit — fixtures, $50.00 first and $20.00 each additional (commercial / other)",
    config: { unit: "fixtures", centsPerUnit: 2_000, baseCents: 5_000, thresholdUnits: 1 },
    conditions: { all: [notResidential(), { field: "fixtures", op: "gt", value: 0 }] },
    description:
      'Plumbing page, Fixture Fees, "Commercial / Other (Not one or two family homes)": "First Fixture: $50.00, Each Additional Fixture: $20.00 per fixture". The same fixture list, priced as a first fixture that carries the break — one fixture is $50.00, four are $50.00 plus three at $20.00, or $110.00. "Applicants must include the total number of fixtures/devices being installed."',
    },
  ] satisfies Array<{
    id: string;
    code: string;
    label: string;
    config: FeeRuleRecord["config"];
    conditions: FeeCondition;
    description: string;
  }>
).map((entry) =>
  buffaloRule(PLUMB, PLUMB_EFF, {
    id: entry.id,
    code: entry.code,
    label: entry.label,
    feeType: "per_unit",
    config: entry.config,
    conditions: entry.conditions,
    description: entry.description,
  }),
);

/** "First 100 linear feet (any pipe size): $60.00". */
const BUF_PLUMB_UG_FIRST_100 = buffaloRule(PLUMB, PLUMB_EFF, {
  id: "buf-plumb-ug-first-100",
  code: "PLUMB-UG-FIRST-100",
  label: "Plumbing permit — underground piping, first 100 linear feet, $60.00",
  feeType: "flat",
  config: { amountCents: 6_000 },
  conditions: { field: "custom.linear_feet", op: "gt", value: 0 },
  description:
    'Plumbing page, Underground (UG) Piping Fees: "First 100 linear feet (any pipe size): $60.00". One flat charge for the first hundred feet of any diameter — the size split only starts beyond it — and it answers whenever the application reports a run of underground pipe, because "Total linear footage must be reported on the application."',
});

/**
 * "Additional underground piping beyond the first 100 feet" — the two size rows, in
 * 100-foot segments.
 *
 * The per-foot rate is the segment price divided out: $20 per additional 100 linear feet
 * is $0.20 a foot (20 cents), $55 is $0.55 (55 cents). The first 100 feet are the flat
 * row's own and are never charged twice, and a fraction of a segment buys the whole
 * segment, the way the sheet's "per additional 100 linear feet" is worded.
 */
const BUF_PLUMBING_UG_SEGMENT_RULES: FeeRuleRecord[] = (
  [
    {
      code: "PLUMB-UG-PIPE-6IN-AND-UNDER",
      centsPerUnit: 20,
      sizeGate: { not: { field: "custom.ug_over_6in", op: "eq", value: true } },
      row: "Piping 6 inches in diameter or under: $20.00 per additional 100 linear feet",
      printed: "$20.00",
    },
    {
      code: "PLUMB-UG-PIPE-OVER-6IN",
      centsPerUnit: 55,
      sizeGate: { field: "custom.ug_over_6in", op: "eq", value: true },
      row: "Piping over 6 inches in diameter: $55.00 per additional 100 linear feet",
      printed: "$55.00",
    },
  ] satisfies Array<{
    code: string;
    centsPerUnit: number;
    sizeGate: FeeCondition;
    row: string;
    printed: string;
  }>
).map((entry) =>
  buffaloRule(PLUMB, PLUMB_EFF, {
    id: `buf-${entry.code.toLowerCase()}`,
    code: entry.code,
    label: `Plumbing permit — underground piping over 100 ft, ${entry.printed} per 100 ft`,
    feeType: "per_unit",
    config: {
      unit: "linear_feet",
      centsPerUnit: entry.centsPerUnit,
      thresholdUnits: 100,
      incrementUnits: 100,
    },
    conditions: {
      all: [{ field: "custom.linear_feet", op: "gt", value: 100 }, entry.sizeGate],
    },
    description: `Plumbing page, Underground (UG) Piping Fees: "${entry.row}". The first 100 feet are the flat line above; everything after them is bought in whole 100-foot segments, so 250 feet is two segments — $40.00 at the 6-inch-or-under rate — beside the $60.00 first line. The size flag is the page's own split, and the application must report the footage either way.`,
  }),
);

/** "Reinspection Fee: $75.00 per reinspection". */
const BUF_PLUMB_REINSPECTION = buffaloRule(PLUMB, PLUMB_EFF, {
  id: "buf-plumb-reinspection",
  code: "PLUMB-REINSPECTION",
  label: "Plumbing permit — reinspection, $75.00",
  feeType: "flat",
  config: { amountCents: BUF_PLUMBING_REINSPECTION_CENTS },
  componentType: "inspection",
  priority: 600,
  conditions: { field: "custom.reinspection", op: "eq", value: true },
  description:
    'Plumbing page, General Fees: "Reinspection Fee: $75.00 per reinspection", charged for "failure to pass inspection, or work not ready at the agreed-on inspection time" — for which the page adds that "a separate permit, with application fee, will be required". This rule charges the reinspection itself; the separate permit\'s application fee is the page\'s, not computed here.',
});

/* -------------------------------------------------------------------------- */
/* Assembled per-permit-type rule sets                                        */
/* -------------------------------------------------------------------------- */

export const BUFFALO_RESIDENTIAL_BUILDING_RULES: FeeRuleRecord[] = [
  BUF_RES_APPLICATION,
  BUF_RES_PLAN_REVIEW,
  ...BUF_RESIDENTIAL_NEW_DWELLING_RULES,
  BUF_RES_NEW_TWO_FAMILY,
  BUF_RES_NEW_TOWNHOUSE,
  BUF_RES_COST,
  ...BUF_RESIDENTIAL_FLAT_FEES.map((entry) =>
    buffaloRule(RES, RES_EFF, {
      id: `buf-bld-res-${entry.code.toLowerCase()}`,
      code: `BLD-RES-${entry.code}`,
      label: `Building permit — ${entry.row.toLowerCase()} (${entry.printed})`,
      feeType: "flat",
      config: { amountCents: entry.amountCents },
      conditions: { all: [RESIDENTIAL, { field: `custom.${entry.fact}`, op: "eq", value: true }] },
      description: `Residential sheet, Flat Fees (fees determined by each type of work — fees are added together): "${entry.row} — ${entry.printed}". Added to the permit fee rather than folded into it, so a job that is also an addition or alteration pays this line beside the cost-based permit fee, exactly as the sheet's total adds them.`,
    }),
  ),
  ...BUF_RESIDENTIAL_DEMOLITION_RULES,
  ...BUF_RESIDENTIAL_USE_PERMIT_RULES,
];

export const BUFFALO_COMMERCIAL_BUILDING_RULES: FeeRuleRecord[] = [
  BUF_COM_APPLICATION,
  BUF_COM_PLAN_REVIEW,
  BUF_COM_PERMIT,
  ...BUF_COMMERCIAL_FLAT_FEES.map((entry) =>
    buffaloRule(COM, RES_EFF, {
      id: `buf-bld-com-${entry.code.toLowerCase()}`,
      code: `BLD-COM-${entry.code}`,
      label: `Building permit — ${entry.row.toLowerCase()} (${entry.printed})`,
      feeType: "flat",
      config: { amountCents: entry.amountCents },
      conditions: { all: [notResidential(), { field: `custom.${entry.fact}`, op: "eq", value: true }] },
      description: `Commercial sheet, Flat Fees (specific for small types of work; fees for each type of work done are added): "${entry.row} — ${entry.printed}". A small-work price that answers beside the application fee; the $8-per-$1,000 permit fee has no cost to measure here unless the applicant supplies one, and the sheet's total adds whatever applies.`,
    }),
  ),
  ...BUF_COMMERCIAL_DEMOLITION_RULES,
  BUF_COM_DEMO_PENALTY,
  BUF_COM_USE_PERMIT,
];

export const BUFFALO_ELECTRICAL_RULES: FeeRuleRecord[] = [
  BUF_ELEC_APPLICATION,
  ...BUF_ELECTRICAL_FLAT_RULES,
  BUF_ELEC_LOW_VOLTAGE_TERMINATIONS,
  BUF_ELEC_AREA_PLAN_REVIEW,
  BUF_ELEC_AREA_PERMIT,
  BUF_ELEC_AREA_METER,
  BUF_ELEC_AREA_SOLAR_PANEL,
];

export const BUFFALO_PLUMBING_RULES: FeeRuleRecord[] = [
  BUF_PLUMB_APPLICATION,
  BUF_PLUMB_PLAN_REVIEW,
  ...BUF_PLUMBING_FIXTURE_RULES,
  BUF_PLUMB_UG_FIRST_100,
  ...BUF_PLUMBING_UG_SEGMENT_RULES,
  BUF_PLUMB_REINSPECTION,
];
