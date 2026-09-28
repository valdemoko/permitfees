import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Fargo fee rules — the Inspections Department's own fee schedules.
 *
 * Every figure below is transcribed from the documents named in
 * research/north-dakota/fargo.md:
 *
 *  - The **residential** sheet (Effective January 1, 2026) prices one- and two-family
 *    dwellings on a three-band valuation ladder whose every step prints "or fraction
 *    thereof" — so each band rounds the chargeable cost up to a whole $1,000.
 *  - The **commercial** sheet (same date) is a seven-band ladder with its own numbers,
 *    the same round-up phrase, a 20% plan review with a $50 floor, and one seam where
 *    the printed base sits 25¢ above what the band below computes — kept as printed.
 *  - The **plumbing** schedule (Effective January 1, 2025) is itemized, not a ladder:
 *    fixture allowances, sewer lines, sprinklers, and a doubled fee for work begun
 *    without a permit.
 *  - **Electrical has no city schedule at all.** The City's own fee-schedule index
 *    proves it, and the self-wire page says where the money goes: the North Dakota
 *    State Electrical Board bills the installer. NDSEB's job-cost bands (Effective
 *    July 1, 2024) are the only published dollars for electrical work, so they are
 *    modelled as the state fees they are.
 */

/* -------------------------------------------------------------------------- */
/* Source and schedule keys                                                   */
/* -------------------------------------------------------------------------- */

export const FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY = "fargo-residential-permit-fees";
export const FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY = "fargo-commercial-permit-fees";
export const FARGO_PLUMBING_SCHEDULE_SOURCE_KEY = "fargo-plumbing-permit-fees";
export const FARGO_RESIDENTIAL_PAGE_SOURCE_KEY = "fargo-residential-permits-page";
export const FARGO_COMMERCIAL_PAGE_SOURCE_KEY = "fargo-commercial-permits-page";
export const FARGO_PLUMBING_PAGE_SOURCE_KEY = "fargo-plumbing-page";
export const FARGO_ELECTRICAL_PAGE_SOURCE_KEY = "fargo-electrical-self-wire";
export const FARGO_FEE_INDEX_SOURCE_KEY = "fargo-fee-schedule-index";
export const FARGO_NDSEB_SOURCE_KEY = "fargo-ndseb-inspection-fees";

/** Both building sheets print this on their faces. */
export const FARGO_BUILDING_EFFECTIVE_FROM = "2026-01-01";
export const FARGO_PLUMBING_EFFECTIVE_FROM = "2025-01-01";
/** NDSEB's Inspection Fees page: "Effective July 1, 2024". */
export const FARGO_NDSEB_EFFECTIVE_FROM = "2024-07-01";

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function fargoRule(
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

/** The construction-class switch: the residential sheet's own scope line (reading a). */
const RESIDENTIAL: FeeCondition = { field: "custom.one_two_family", op: "eq", value: true };
function notResidential(): FeeCondition {
  return { not: { field: "custom.one_two_family", op: "eq", value: true } };
}

const RES = FARGO_RESIDENTIAL_SCHEDULE_SOURCE_KEY;
const COM = FARGO_COMMERCIAL_SCHEDULE_SOURCE_KEY;
const PLUMB = FARGO_PLUMBING_SCHEDULE_SOURCE_KEY;
const NDSEB = FARGO_NDSEB_SOURCE_KEY;
const BUILD_EFF = FARGO_BUILDING_EFFECTIVE_FROM;
const PLUMB_EFF = FARGO_PLUMBING_EFFECTIVE_FROM;
const NDSEB_EFF = FARGO_NDSEB_EFFECTIVE_FROM;

/** The ladder bands as the sheets print them: base, per-$1,000 rate, and range. */
type FargoBand = {
  code: string;
  baseCents: number;
  centsPerThousand: number;
  lowExclusive: number;
  highInclusive: number | null;
  printed: string;
  sheet: "residential" | "commercial";
};

const FARGO_RESIDENTIAL_BANDS: FargoBand[] = [
  {
    code: "FARGO-RES-UP-TO-1000",
    baseCents: 5_000,
    centsPerThousand: 0,
    lowExclusive: 0,
    highInclusive: 100_000,
    printed: "Up to and including $1,000.00 — $50.00",
    sheet: "residential",
  },
  {
    code: "FARGO-RES-1001-100000",
    baseCents: 5_000,
    centsPerThousand: 556,
    lowExclusive: 100_000,
    highInclusive: 10_000_000,
    printed:
      "$1,001.00 to $100,000.00 — $50.00 for the first $1,000.00 plus $5.56 for each additional $1,000.00, or fraction thereof, to and including $100,000.00",
    sheet: "residential",
  },
  {
    code: "FARGO-RES-100001-AND-UP",
    baseCents: 60_044,
    centsPerThousand: 306,
    lowExclusive: 10_000_000,
    highInclusive: null,
    printed:
      "$100,001.00 and up — $600.44 for the first $100,000.00 plus $3.06 for each additional $1,000.00 or fraction thereof.",
    sheet: "residential",
  },
];

const FARGO_COMMERCIAL_BANDS: FargoBand[] = [
  {
    code: "FARGO-COM-UP-TO-1000",
    baseCents: 5_500,
    centsPerThousand: 0,
    lowExclusive: 0,
    highInclusive: 100_000,
    printed: "Up to and including $1,000.00 — $55.00",
    sheet: "commercial",
  },
  {
    code: "FARGO-COM-1001-25000",
    baseCents: 5_500,
    centsPerThousand: 1_275,
    lowExclusive: 100_000,
    highInclusive: 2_500_000,
    printed:
      "$1,001.00 to $25,000.00 — $55.00 for the first $1,000.00 plus $12.75 for each additional $1,000.00, or fraction thereof, to and including $25,000.00",
    sheet: "commercial",
  },
  {
    code: "FARGO-COM-25001-50000",
    baseCents: 36_100,
    centsPerThousand: 870,
    lowExclusive: 2_500_000,
    highInclusive: 5_000_000,
    printed:
      "$25,001.00 to $50,000.00 — $361.00 for the first $25,000.00 plus $8.70 for each additional $1,000.00, or fraction thereof, to and including $50,000.00",
    sheet: "commercial",
  },
  {
    code: "FARGO-COM-50001-100000",
    baseCents: 57_875,
    centsPerThousand: 614,
    lowExclusive: 5_000_000,
    highInclusive: 10_000_000,
    printed:
      "$50,001.00 to $100,000.00 — $578.75 for the first $50,000.00 plus $6.14 for each additional $1,000.00, or fraction thereof, to and including $100,000.00",
    sheet: "commercial",
  },
  {
    code: "FARGO-COM-100001-500000",
    baseCents: 88_575,
    centsPerThousand: 499,
    lowExclusive: 10_000_000,
    highInclusive: 50_000_000,
    printed:
      "$100,001.00 to $500,000.00 — $885.75 for the first $100,000.00 plus $4.99 for each additional $1,000.00 or fraction thereof, to and including $500,000.00",
    sheet: "commercial",
  },
  {
    code: "FARGO-COM-500001-1000000",
    baseCents: 288_175,
    centsPerThousand: 487,
    lowExclusive: 50_000_000,
    highInclusive: 100_000_000,
    printed:
      "$500,001.00 to $1,000,000.00 — $2,881.75 for the first $500,000.00 plus $4.87 for each additional $1,000.00 or fraction thereof to and including $1,000,000.00",
    sheet: "commercial",
  },
  {
    code: "FARGO-COM-1000001-AND-UP",
    baseCents: 531_675,
    centsPerThousand: 464,
    lowExclusive: 100_000_000,
    highInclusive: null,
    printed:
      "$1,000,001.00 and up — $5,316.75 for the first $1,000,000.00 plus $4.64 for each additional $1,000.00 or fraction thereof",
    sheet: "commercial",
  },
];

/**
 * One band of one sheet's ladder, as a rule.
 *
 * Every band after the first carries `incrementCents: 100_000` because every one of
 * them prints "or fraction thereof" — the phrase that decides round-up over proration
 * across this dataset (reading b). The band gates add `not(work_type eq demolition)` so
 * the sheet's flat demolition rows never answer beside the ladder for the same job.
 */
function fargoBandRule(band: FargoBand): FeeRuleRecord {
  const isResidential = band.sheet === "residential";
  const sourceId = isResidential ? RES : COM;
  const classGate: FeeCondition = isResidential ? RESIDENTIAL : notResidential();
  const range: FeeCondition[] = [];
  if (band.lowExclusive > 0) {
    range.push({ field: "valuation", op: "gt", value: band.lowExclusive });
  }
  if (band.highInclusive !== null) {
    range.push({ field: "valuation", op: "lte", value: band.highInclusive });
  }

  const notDemolition: FeeCondition = {
    not: { field: "work_type", op: "eq", value: "demolition" },
  };

  if (band.centsPerThousand === 0) {
    return fargoRule(sourceId, BUILD_EFF, {
      id: `fargo-${band.code.toLowerCase()}`,
      code: band.code,
      label: `${isResidential ? "Residential" : "Commercial"} building permit — ${band.printed.split(" — ")[0]} ($${(band.baseCents / 100).toFixed(2)})`,
      feeType: "flat",
      config: { amountCents: band.baseCents },
      conditions: { all: [classGate, notDemolition, ...range] },
      description: `${isResidential ? "Residential" : "Commercial"} sheet (Effective January 1, 2026): "${band.printed}". A flat fee for the valuation range the sheet names — the ladder's floor, charged on its own for the smallest jobs.`,
    });
  }

  return fargoRule(sourceId, BUILD_EFF, {
    id: `fargo-${band.code.toLowerCase()}`,
    code: band.code,
    label: `${isResidential ? "Residential" : "Commercial"} building permit — ${band.printed.split(" — ")[0]}`,
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: band.centsPerThousand,
      thresholdCents: band.lowExclusive,
      incrementCents: 100_000,
      baseCents: band.baseCents,
    },
    conditions: { all: [classGate, notDemolition, ...range] },
    description: `${isResidential ? "Residential" : "Commercial"} sheet (Effective January 1, 2026): "${band.printed}". The "or fraction thereof" the sheet prints in every band after the first is the round-up phrase, so the cost above the threshold is charged in whole $1,000 steps — $1,500 of residential valuation pays one step of $5.56, not $500's fraction of it. The seam above this band is where the sheet's own arithmetic shows: ${band.code === "FARGO-COM-25001-50000" ? "this band computes $578.50 at $50,000 while the band above prints its base as $578.75 — a 25-cent jump the sheet itself contains, asserted from both sides rather than reconciled" : "each band's endpoint is the printed base of the band above it"}.`,
  });
}

/* -------------------------------------------------------------------------- */
/* Building rules                                                             */
/* -------------------------------------------------------------------------- */

export const FARGO_RESIDENTIAL_BUILDING_RULES: FeeRuleRecord[] =
  FARGO_RESIDENTIAL_BANDS.map(fargoBandRule);

export const FARGO_COMMERCIAL_BUILDING_RULES: FeeRuleRecord[] =
  FARGO_COMMERCIAL_BANDS.map(fargoBandRule);

/**
 * "Plan Review: All projects when a plan review is required. Twenty (20) percent of
 * the attributable building permit fee. Minimum fee $50."
 *
 * Commercial sheet only — the residential sheet prints no plan review line, and that
 * absence is kept as an absence (reading e). Gated on the plan-review fact because the
 * sheet conditions it ("when a plan review is required"), unlike Bismarck's
 * unconditional review fee.
 */
export const FARGO_COMMERCIAL_PLAN_REVIEW = fargoRule(COM, BUILD_EFF, {
  id: "fargo-bld-com-plan-review",
  code: "FARGO-COM-PLAN-REVIEW",
  label: "Commercial building permit — plan review, 20% of the permit fee ($50 minimum)",
  feeType: "percent",
  componentType: "plan_review",
  priority: 200,
  config: { basis: "permit_fee", rateBps: 2_000 },
  minimumCents: 5_000,
  conditions: { all: [notResidential(), { field: "custom.plan_review", op: "eq", value: true }] },
  description:
    'Commercial sheet (Effective January 1, 2026): "Plan Review: All projects when a plan review is required. Twenty (20) percent of the attributable building permit fee. Minimum fee $50." Charged only when plans are required — the sheet\'s own condition — and read against the permit fee, so the percentage measures the ladder\'s output; the $50 floor binds below a $250 permit fee. The residential sheet prints no such line, and no residential rule charges one.',
});

/**
 * The flat rows both building sheets print — demolition, house moving, board of
 * appeals — modelled once because both sheets print identical amounts (the same
 * reasoning as Bismarck's shared ladder, in reverse: identical numbers, one rule
 * set). The reduced $50 rows read the sheet's two conditions as one fact.
 */
export const FARGO_SHARED_FLAT_RULES: FeeRuleRecord[] = [
  {
    id: "fargo-bld-demolition",
    code: "FARGO-DEMOLITION",
    label: "Building permit — demolition, $100.00",
    amountCents: 10_000,
    conditions: {
      all: [
        { field: "work_type", op: "eq", value: "demolition" },
        { not: { field: "custom.demo_reduced", op: "eq", value: true } },
      ],
    },
    description:
      'Both sheets: "Demolition Permit: $100.00 / $50.00 for buildings under 400 SF and buildings without utility services." The standard price, with the reduced price its own rule beside it — the slash pairs them and the sentence states both conditions of the reduction, read as one fact (reading h).',
  },
  {
    id: "fargo-bld-demolition-reduced",
    code: "FARGO-DEMOLITION-REDUCED",
    label: "Building permit — demolition, reduced, $50.00",
    amountCents: 5_000,
    conditions: {
      all: [
        { field: "work_type", op: "eq", value: "demolition" },
        { field: "custom.demo_reduced", op: "eq", value: true },
      ],
    },
    description:
      'Both sheets: "$50.00 for buildings under 400 SF and buildings without utility services" — the reduced demolition price, which the sheet requires both conditions for (under 400 SF **and** without utility services); the single fact stands for the pair, and the page states both.',
  },
  {
    id: "fargo-bld-moving",
    code: "FARGO-MOVING",
    label: "Building permit — house moving, $300.00",
    amountCents: 30_000,
    conditions: {
      all: [
        { field: "custom.house_moving", op: "eq", value: true },
        { not: { field: "custom.demo_reduced", op: "eq", value: true } },
        { not: { field: "custom.extraterritorial", op: "eq", value: true } },
      ],
    },
    description:
      'Both sheets: "House Moving Permit: $300.00 / $50.00 for buildings under 400 SF and buildings without utility services. $150.00 / $50.00 for moves within extraterritorial area." The standard in-city move at its standard price; the reduced and extraterritorial prices are their own rules.',
  },
  {
    id: "fargo-bld-moving-extraterritorial",
    code: "FARGO-MOVING-EXTRATERRITORIAL",
    label: "Building permit — house moving, extraterritorial area, $150.00",
    amountCents: 15_000,
    conditions: {
      all: [
        { field: "custom.house_moving", op: "eq", value: true },
        { field: "custom.extraterritorial", op: "eq", value: true },
        { not: { field: "custom.demo_reduced", op: "eq", value: true } },
      ],
    },
    description:
      'Both sheets: "$150.00 / $50.00 for moves within extraterritorial area" — the extraterritorial move at its standard price, the reduced price shared with the in-city row.',
  },
  {
    id: "fargo-bld-moving-reduced",
    code: "FARGO-MOVING-REDUCED",
    label: "Building permit — house moving, reduced, $50.00",
    amountCents: 5_000,
    conditions: {
      all: [
        { field: "custom.house_moving", op: "eq", value: true },
        { field: "custom.demo_reduced", op: "eq", value: true },
      ],
    },
    description:
      'Both sheets: "$50.00 for buildings under 400 SF and buildings without utility services" — the reduced moving price, the same two-condition discount the demolition row prints, and the same single fact standing for the pair.',
  },
  {
    id: "fargo-bld-board-of-appeals",
    code: "FARGO-BOARD-OF-APPEALS",
    label: "Building permit — Board of Appeals filing fee, $150.00",
    amountCents: 15_000,
    conditions: { field: "custom.board_of_appeals", op: "eq", value: true },
    description:
      'Both sheets: "Board of Appeals $150.00" — a filing fee for an appeal rather than a permit on construction, charged on its own fact beside the ladder (the commercial sheet adds "filing fee" to the same figure).',
  },
].map((entry) =>
  fargoRule(RES, BUILD_EFF, {
    id: entry.id,
    code: entry.code,
    label: entry.label,
    feeType: "flat",
    config: { amountCents: entry.amountCents },
    conditions: entry.conditions,
    description: entry.description,
  }),
);

/**
 * "Should work begin prior the issuance of necessary permits, the following fees will
 * apply" — three valuation bands, four floors.
 *
 * The doubled band is one rule for both sheets (the sentence is identical); the 50%
 * and 25% bands print different minimums on each sheet ($550/$2,000 residential,
 * $980/$2,500 commercial), so each is its own rule with its own floor (reading g). The
 * repeat-offence lines need a violation history this site does not collect and are
 * quoted on the page instead.
 */
type FargoUnpermittedEntry = {
  id: string;
  code: string;
  label: string;
  rateBps: number;
  minimumCents: number | null;
  rateConditions: FeeCondition;
  printed: string;
  sheetNote: string;
  /** Which sheet prints this row's floor — the doubled band is identical on both. */
  sheet: "shared" | "residential" | "commercial";
};

const FARGO_UNPERMITTED_ENTRIES: FargoUnpermittedEntry[] = [
  {
    id: "fargo-bld-unpermitted-doubled",
    code: "FARGO-UNPERMITTED-DOUBLED",
    label: "Building permit — work begun without a permit, permit fee doubled",
    rateBps: 10_000,
    minimumCents: null,
    rateConditions: { field: "valuation", op: "lte", value: 5_000_000 },
    printed:
      "$0-$50,000 — Permit fee is doubled. Second offence within 180 days - $200 minimum; $100 for each additional violation subsequent",
    sheetNote: "Both sheets print this band identically.",
    sheet: "shared",
  },
  {
    id: "fargo-bld-unpermitted-50-res",
    code: "FARGO-UNPERMITTED-50-RES",
    label: "Building permit — work begun without a permit, 50% of the permit fee ($550 minimum)",
    rateBps: 5_000,
    minimumCents: 55_000,
    rateConditions: {
      all: [
        RESIDENTIAL,
        { field: "valuation", op: "gt", value: 5_000_000 },
        { field: "valuation", op: "lte", value: 50_000_000 },
      ],
    },
    printed: "$50,001-$500,000 — 50% of permit fee (Minimum fee of $550)",
    sheetNote: "The residential sheet's floor.",
    sheet: "residential",
  },
  {
    id: "fargo-bld-unpermitted-50-com",
    code: "FARGO-UNPERMITTED-50-COM",
    label: "Building permit — work begun without a permit, 50% of the permit fee ($980 minimum)",
    rateBps: 5_000,
    minimumCents: 98_000,
    rateConditions: {
      all: [
        notResidential(),
        { field: "valuation", op: "gt", value: 5_000_000 },
        { field: "valuation", op: "lte", value: 50_000_000 },
      ],
    },
    printed: "$50,001-$500,000 — 50% of permit fee (Minimum fee of $980)",
    sheetNote: "The commercial sheet's floor.",
    sheet: "commercial",
  },
  {
    id: "fargo-bld-unpermitted-25-res",
    code: "FARGO-UNPERMITTED-25-RES",
    label: "Building permit — work begun without a permit, 25% of the permit fee ($2,000 minimum)",
    rateBps: 2_500,
    minimumCents: 200_000,
    rateConditions: { all: [RESIDENTIAL, { field: "valuation", op: "gt", value: 50_000_000 }] },
    printed: "Over $500,000 — 25% of the permit fee (Minimum fee of $2,000)",
    sheetNote: "The residential sheet's floor.",
    sheet: "residential",
  },
  {
    id: "fargo-bld-unpermitted-25-com",
    code: "FARGO-UNPERMITTED-25-COM",
    label: "Building permit — work begun without a permit, 25% of the permit fee ($2,500 minimum)",
    rateBps: 2_500,
    minimumCents: 250_000,
    rateConditions: { all: [notResidential(), { field: "valuation", op: "gt", value: 50_000_000 }] },
    printed: "Over $500,000 — 25% of the permit fee (Minimum fee of $2,500)",
    sheetNote: "The commercial sheet's floor.",
    sheet: "commercial",
  },
];

function fargoUnpermittedRule(entry: FargoUnpermittedEntry): FeeRuleRecord {
  return fargoRule(entry.sheet === "commercial" ? COM : RES, BUILD_EFF, {
    id: entry.id,
    code: entry.code,
    label: entry.label,
    feeType: "percent",
    componentType: "surcharge",
    priority: 500,
    config: { basis: "permit_fee", rateBps: entry.rateBps },
    minimumCents: entry.minimumCents,
    conditions: { all: [{ field: "custom.unpermitted_work", op: "eq", value: true }, entry.rateConditions] },
    description: `Both sheets' unpermitted-work table (the residential sheet's copy and the commercial sheet's copy are the same table with different floors): "${entry.printed}". ${entry.sheetNote} Charged as a share of the permit fee the ladder computed — a surcharge on top of it, because the table states the fee that "will apply" for work begun early rather than replacing the permit fee. The "Second offence within 180 days - $200 minimum / $100 for each additional violation subsequent" lines are printed on the same row and need a violation history this site does not collect; the page quotes them.`,
  });
}

/** The doubled band — printed identically on both sheets, so one rule with no class gate. */
export const FARGO_UNPERMITTED_SHARED_RULES = FARGO_UNPERMITTED_ENTRIES.filter(
  (entry) => entry.sheet === "shared",
).map(fargoUnpermittedRule);

/** The 50% and 25% rows with the residential sheet's floors ($550 / $2,000). */
export const FARGO_UNPERMITTED_RESIDENTIAL_RULES = FARGO_UNPERMITTED_ENTRIES.filter(
  (entry) => entry.sheet === "residential",
).map(fargoUnpermittedRule);

/** The 50% and 25% rows with the commercial sheet's floors ($980 / $2,500). */
export const FARGO_UNPERMITTED_COMMERCIAL_RULES = FARGO_UNPERMITTED_ENTRIES.filter(
  (entry) => entry.sheet === "commercial",
).map(fargoUnpermittedRule);

/** All five, for the combined building list and for count assertions. */
export const FARGO_UNPERMITTED_RULES = FARGO_UNPERMITTED_ENTRIES.map(fargoUnpermittedRule);

export const FARGO_BUILDING_RULES: FeeRuleRecord[] = [
  ...FARGO_RESIDENTIAL_BUILDING_RULES,
  ...FARGO_COMMERCIAL_BUILDING_RULES,
  FARGO_COMMERCIAL_PLAN_REVIEW,
  ...FARGO_SHARED_FLAT_RULES,
  ...FARGO_UNPERMITTED_RULES,
];

/* -------------------------------------------------------------------------- */
/* Electrical rules — the state board's fees, because the City publishes none  */
/* -------------------------------------------------------------------------- */

/**
 * NDSEB's two job-cost bands (Effective July 1, 2024).
 *
 * The first band is written as `not(valuation gt $20,000)` rather than `lte` so that a
 * calculation with no valuation still reaches it — the rule then fails on the missing
 * basis and asks for the input, where `lte` on a missing fact would have excluded it
 * silently (reading i).
 */
export const FARGO_NDSEB_BAND_RULES: FeeRuleRecord[] = [
  {
    id: "fargo-elec-ndseb-to-20000",
    code: "ELEC-NDSEB-UP-TO-20000",
    label: "Electrical — NDSEB inspection fee, job cost to $20,000 ($50 minimum, 2% of the balance over $500)",
    config: { basis: "valuation", thresholdCents: 50_000, rateBps: 200, baseCents: 5_000 },
    conditions: { not: { field: "valuation", op: "gt", value: 2_000_000 } },
    printed:
      "Up to $500.00 — $50.00 (minimum fee); $500.00 to $20,000.00 — $50.00 for the first $500.00 plus 2% on balance up to $20,000.00",
    description:
      'NDSEB Inspection Fees, effective July 1, 2024: "Up to $500.00 — $50.00 (minimum fee)" and "$500.00 to $20,000.00 — $50.00 for the first $500.00 plus 2% on balance up to $20,000.00". One rule holds both printed rows: the $50 base *is* the minimum fee below $500 (the threshold charges nothing there), and 2% runs on the balance above $500 up to $20,000, where $50 + 2% of $19,500 closes at exactly $440.00 — the base of the band above. Prorated: the table prints no round-up phrase. "The inspection fee shall be based on the total amount of the contract or total cost to the owner, including extras", less the four exclusions the page names (appliances, HVAC units, electric motors/PLC/generators, industrial machines).',
  },
  {
    id: "fargo-elec-ndseb-over-20000",
    code: "ELEC-NDSEB-OVER-20000",
    label: "Electrical — NDSEB inspection fee, job cost over $20,000 ($440 for the first $20,000, 1/10 of 1% after)",
    config: { basis: "valuation", thresholdCents: 2_000_000, rateBps: 10, baseCents: 44_000 },
    conditions: { field: "valuation", op: "gt", value: 2_000_000 },
    printed:
      "Over $20,000.00 — $440.00 for the first $20,000.00 plus 1/10 of 1% on balance over $20,000.00",
    description:
      'NDSEB Inspection Fees, effective July 1, 2024: "Over $20,000.00 — $440.00 for the first $20,000.00 plus 1/10 of 1% on balance over $20,000.00" — a tenth of a percent (rateBps 10) on the balance, prorated, with the $440.00 closing the band below it exactly. The board\'s page prints the superseded table beneath this one; the July 1, 2024 figures are the ones charged.',
  },
].map((entry) =>
  fargoRule(NDSEB, NDSEB_EFF, {
    id: entry.id,
    code: entry.code,
    label: entry.label,
    feeType: "percent",
    componentType: "state_surcharge",
    conditions: entry.conditions,
    config: entry.config,
    description: entry.description,
  }),
);

/** "the normal inspection fee … is increased in the amount of fifty dollars" (late certificate). */
export const FARGO_NDSEB_LATE_CERTIFICATE = fargoRule(NDSEB, NDSEB_EFF, {
  id: "fargo-elec-ndseb-late-certificate",
  code: "ELEC-NDSEB-LATE-CERTIFICATE",
  label: "Electrical — NDSEB late wiring certificate, $50.00",
  feeType: "flat",
  componentType: "state_surcharge",
  priority: 500,
  config: { amountCents: 5_000 },
  conditions: { field: "custom.late_certificate", op: "eq", value: true },
  description:
    'NDSEB Inspection Fees: "Whenever an electrical installation … is commenced or in use without submitting an electrical wiring certificate the certificate may be considered late and the normal inspection fee, as required under this section, is increased in the amount of fifty dollars." Charged when the filing is late — a state board increase, and the page says whose it is.',
});

export const FARGO_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...FARGO_NDSEB_BAND_RULES,
  FARGO_NDSEB_LATE_CERTIFICATE,
];

/* -------------------------------------------------------------------------- */
/* Plumbing rules — the itemized schedule                                     */
/* -------------------------------------------------------------------------- */

const FARGO_PLUMBING_FLAT_RULES: FeeRuleRecord[] = [
  {
    code: "PLUMB-WATER-HEATING",
    amountCents: 3_500,
    fact: "water_heating",
    row: "Water Heating Permits",
    printed: "$35.00",
  },
  {
    code: "PLUMB-SEWER-ORIGINAL",
    amountCents: 12_500,
    fact: "sewer_original",
    row: "Original Sanitary or Storm Sewer Line into each building",
    printed: "$125.00",
  },
  {
    code: "PLUMB-SEWER-DISCONNECT",
    amountCents: 7_000,
    fact: "sewer_disconnect",
    row: "Disconnect Sanitary or Storm Sewer Line",
    printed: "$70.00",
  },
  {
    code: "PLUMB-SEWER-ADDITIONAL",
    amountCents: 3_000,
    fact: "sewer_additional",
    row: "Additional Sanitary or Storm Sewer Line into each building or to a manhole or Catch Basin",
    printed: "$30.00",
  },
  {
    code: "PLUMB-SEWER-REPAIR",
    amountCents: 7_500,
    fact: "sewer_repair",
    row: "Repair or Replacement of Sanitary or Storm Sewer",
    printed: "$75.00",
  },
  {
    code: "PLUMB-LAWN-SPRINKLER",
    amountCents: 4_000,
    fact: "lawn_sprinkler",
    row: "Lawn Sprinkler System",
    printed: "$40.00",
  },
].map((entry) =>
  fargoRule(PLUMB, PLUMB_EFF, {
    id: `fargo-plumb-${entry.code.toLowerCase()}`,
    code: entry.code,
    label: `Plumbing permit — ${entry.row.toLowerCase()} (${entry.printed})`,
    feeType: "flat",
    config: { amountCents: entry.amountCents },
    conditions: { field: `custom.${entry.fact}`, op: "eq", value: true },
    description: `Plumbing schedule (Effective January 1, 2025): "${entry.row} — ${entry.printed}". An itemized price from a schedule that prices lines rather than valuations: the row answers its own fact, and the total is the sum of the rows the job triggers ("the Total Permit Fee is the sum of all applicable fees" is this page's shape in spirit — Fargo's schedule simply lists them).`,
  }),
);

/**
 * "Inside Plumbing Permits — Minimum Fee $50.00 (includes up to 5 fixtures or traps)
 * (each fixture or trap over 5 is $10.00 each)" — one rule, because the allowance
 * shape is exactly what `per_unit` with a base and a threshold means (reading j).
 */
export const FARGO_PLUMBING_INSIDE = fargoRule(PLUMB, PLUMB_EFF, {
  id: "fargo-plumb-inside",
  code: "PLUMB-INSIDE",
  label: "Plumbing permit — inside plumbing, $50.00 including 5 fixtures, $10.00 each after",
  feeType: "per_unit",
  config: { unit: "fixtures", baseCents: 5_000, thresholdUnits: 5, centsPerUnit: 1_000 },
  conditions: { field: "custom.inside_plumbing", op: "eq", value: true },
  description:
    'Plumbing schedule (Effective January 1, 2025): "Inside Plumbing Permits — Minimum Fee $50.00 (includes up to 5 fixtures or traps) (each fixture or trap over 5 is $10.00 each)". The $50 is a base that already carries the first five fixtures — so five fixtures cost $50.00, six cost $60.00, and the schedule\'s own word for the five is "includes", which is the allowance, not a waiver after the fact.',
});

/** "Double fees for all work commenced without a permit." — the plumbing sheet's own line. */
export const FARGO_PLUMBING_UNPERMITTED = fargoRule(PLUMB, PLUMB_EFF, {
  id: "fargo-plumb-unpermitted",
  code: "PLUMB-UNPERMITTED-DOUBLE",
  label: "Plumbing permit — work commenced without a permit, permit fee doubled",
  feeType: "percent",
  componentType: "surcharge",
  priority: 500,
  config: { basis: "permit_fee", rate: { numerator: 1, denominator: 1 }, rateUnit: "fraction" },
  conditions: { field: "custom.unpermitted_work", op: "eq", value: true },
  description:
    'Plumbing schedule (Effective January 1, 2025): "Double fees for all work commenced without a permit. In case of an emergency, a permit must be taken out within 48 hours after commencement of work." A doubling read the way Las Cruces\'s tripling was read: the schedule doubles the *permit fee*, so the surcharge is 100% of the plumbing fees this page computed — and the 48-hour emergency rule is a deadline rather than a charge, quoted on the page.',
});

export const FARGO_PLUMBING_RULES: FeeRuleRecord[] = [
  FARGO_PLUMBING_INSIDE,
  ...FARGO_PLUMBING_FLAT_RULES,
  FARGO_PLUMBING_UNPERMITTED,
];
