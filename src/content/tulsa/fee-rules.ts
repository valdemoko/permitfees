import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Tulsa fee rules — Title 49 of the Tulsa Revised Ordinances, read through the
 * codifier on 2026-09-26 beside the City Clerk's own packet for Ordinance 25794
 * (research/oklahoma/tulsa.md records both).
 *
 * Two structural facts shape every rule here:
 *
 *  - **Chapter 1 is a stack, not a page.** § 102 applies its fees "to each
 *    permit … governed by this Title 49, unless specifically provided otherwise",
 *    and each trade chapter repeats the instruction. Every permit therefore
 *    carries five lines the trade schedules never mention: the state's $4.00
 *    (§ 100.A), the City's retained $0.50 (§ 100.D), § 117's "$5.50 plus eight
 *    percent of the permit fee", § 103's $5.00 processing surcharge, and § 107's
 *    global $80 floor — evaluated in exactly that order, because the floor has to
 *    read the whole bill and § 117's 8% must read only the chapter's fee.
 *  - **§ 302 is read three ways and charged one.** The bands round "to the
 *    closest One Thousand Dollars" — a real nearest rounding this engine added
 *    for this schedule (`incrementRounding: "nearest"`) — and the over-$150,000
 *    band states only an *additional* fee, so it is charged as B's own ceiling
 *    ($927.00) plus $3.09 per closest thousand of the excess, with the
 *    full-valuation reading recorded as the alternative under a `needs_review`
 *    verification. § 301's application fee is credited against § 302 and never
 *    changes the total, so it is named as a prepayment and never summed.
 *
 * The storm-shelter carve-out is the schedule's own exclusivity instruction
 * (§ 306): a shelter permit charges its flat "with no other administrative,
 * zoning, or watershed fees applicable with the exception of Section 100" — so
 * the bands, § 117, § 103 and the $80 floor all stand down while a shelter fact
 * is set, and the two shelter flats are the only base rules that answer.
 *
 * Figures are FY2027: §§ 301/302 date from Ord. 25794 (adopted 5-13-26 with an
 * emergency clause), the rest from Ord. 25351 (7-17-24), which rewrote almost
 * the entire title.
 */

/* -------------------------------------------------------------------------- */
/* Source and schedule keys                                                   */
/* -------------------------------------------------------------------------- */

export const TULSA_CH1_SOURCE_KEY = "tulsa-code-t49-ch1-admin-fees";
export const TULSA_CH3_SOURCE_KEY = "tulsa-code-t49-ch3-building-permit-fees";
export const TULSA_CH4_SOURCE_KEY = "tulsa-code-t49-ch4-electrical-permit-fees";
export const TULSA_CH8_SOURCE_KEY = "tulsa-code-t49-ch8-plumbing-permit-fees";
export const TULSA_ORD_25794_SOURCE_KEY = "tulsa-ordinance-25794-fy2027";
export const TULSA_PLANS_PAGE_SOURCE_KEY = "tulsa-plans-review-page";

/** Ord. No. 25351, adopted 7-17-24 — rewrote almost all of Title 49. */
export const TULSA_ORD_25351_DATE = "2024-07-17";
/** Ord. No. 25794, adopted 5-13-26 with an emergency clause — the FY2027 figures. */
export const TULSA_ORD_25794_DATE = "2026-05-13";

/* -------------------------------------------------------------------------- */
/* Rule helper                                                                */
/* -------------------------------------------------------------------------- */

function tulsaRule(
  sourceId: string,
  effectiveFrom: string,
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> & Partial<FeeRuleRecord>,
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

/* Conditions --------------------------------------------------------------- */

function rowFact(fact: string): FeeCondition {
  return { field: `custom.${fact}`, op: "eq", value: true };
}
function all(...conditions: FeeCondition[]): FeeCondition {
  return { all: conditions };
}
function any(...conditions: FeeCondition[]): FeeCondition {
  return { any: conditions };
}
function not(condition: FeeCondition): FeeCondition {
  return { not: condition };
}

/**
 * § 306's carve-out, as the two facts it prices: "Storm shelter permit fee
 * shall be a flat fee with no other administrative, zoning, or watershed fees
 * applicable with the exception of Section 100".
 */
const SHELTER: FeeCondition = any(
  rowFact("storm_shelter_indoor"),
  rowFact("storm_shelter_outdoor"),
);
const NOT_SHELTER: FeeCondition = not(SHELTER);

/** The building bands' scope: construction work, and not the schedule's other flats. */
const CONSTRUCTION_WORK: FeeCondition = {
  field: "work_type",
  op: "in",
  value: ["new_construction", "addition", "alteration", "remodel", "repair", "replacement"],
};

const BANDS_SCOPE: FeeCondition = all(CONSTRUCTION_WORK, NOT_SHELTER, not(rowFact("carport")));

/* The four § 302 bands, each a rule so both sides of every seam are explicit.  */
const VAL_LTE_5K: FeeCondition = { field: "valuation", op: "lte", value: 500_000 };
const VAL_5K_TO_40K: FeeCondition = all(
  { field: "valuation", op: "gt", value: 500_000 },
  { field: "valuation", op: "lte", value: 4_000_000 },
);
const VAL_40K_TO_150K: FeeCondition = all(
  { field: "valuation", op: "gt", value: 4_000_000 },
  { field: "valuation", op: "lte", value: 15_000_000 },
);
const VAL_OVER_150K: FeeCondition = { field: "valuation", op: "gt", value: 15_000_000 };

const CH1 = TULSA_CH1_SOURCE_KEY;
const CH3 = TULSA_CH3_SOURCE_KEY;
const CH4 = TULSA_CH4_SOURCE_KEY;
const CH8 = TULSA_CH8_SOURCE_KEY;
const EFF_25351 = TULSA_ORD_25351_DATE;
const EFF_25794 = TULSA_ORD_25794_DATE;

/* -------------------------------------------------------------------------- */
/* The Chapter 1 stack — attached to every page                                */
/* -------------------------------------------------------------------------- */

/**
 * § 100.A, § 100.D, § 117, § 103 and § 107, in the order the schedule means them:
 *
 *  1. the chapter's base rows run first (evaluation order guarantees it);
 *  2. § 117's `$5.50 plus eight percent of the … permit fee` runs while the
 *     subtotal is still just the chapter's fee, and the schedule's own words —
 *     "in addition to any … fee, or minimum fee" — keep it outside the floor's
 *     arithmetic rather than exempt from it;
 *  3. the state's $4.00 and the City's $0.50 (both § 100, the one section a
 *     storm-shelter permit keeps);
 *  4. § 103's $5.00 processing surcharge;
 *  5. § 107's $80 floor last of all, reading the whole bill as a shortfall —
 *     priority 200 inside the `other` component so nothing charges after it.
 *
 * The prefix (`tul-bld`, `tul-elec`, `tul-pl`) keeps each permit type's rule
 * codes unique while the text stays identical, because the five lines are one
 * section applied to every permit in the title.
 */
export function tulsaChapterOneStack(prefix: string): FeeRuleRecord[] {
  return [
    tulsaRule(CH1, EFF_25351, {
      id: `${prefix}-stack-100a`,
      code: `${prefix.toUpperCase()}-100A`,
      label: "State building permit fee (OUBCC) — $4.00 per permit",
      description:
        '"Administrative Collection Fee under the Oklahoma Uniform Building Code Commission ... Building/construction permits (collected under 59 O.S. § 1000.25): Four and 00/100 Dollars ($4.00)" (§ 100.A) — collected and remitted monthly to the State. The one section a storm-shelter permit keeps, by § 306\'s own exception.',
      feeType: "flat",
      config: { amountCents: 400 },
      componentType: "state_surcharge",
      conditions: null,
    }),
    tulsaRule(CH1, EFF_25351, {
      id: `${prefix}-stack-100d`,
      code: `${prefix.toUpperCase()}-100D`,
      label: "Administrative fee retained by the City — $0.50 per permit",
      description:
        '"Administrative fee retained by the City under 59 O.S. § 1000.25 ... $0.50" (§ 100.D) — the City\'s half of the same statute, alongside the State\'s $4.00 above.',
      feeType: "flat",
      config: { amountCents: 50 },
      componentType: "other",
      conditions: null,
    }),
    tulsaRule(CH1, EFF_25351, {
      id: `${prefix}-stack-117`,
      code: `${prefix.toUpperCase()}-117`,
      label: "Administrative fee — $5.50 plus 8% of the permit fee",
      description:
        '"Five and 50/100 Dollars ($5.50) plus eight percent (8%) of the … permit fee", "in addition to any … fee, or minimum fee" (§ 117). One rule carrying both pieces: the $5.50 base and the 8% of the chapter\'s permit fee, evaluated directly after the base rows so the percentage reads the trade schedule\'s figure and nothing else — the state and maintenance lines have not charged yet when it runs.',
      feeType: "percent",
      componentType: "surcharge",
      config: { basis: "fee_subtotal", rate: { numerator: 8, denominator: 100 }, baseCents: 550 },
      conditions: NOT_SHELTER,
    }),
    tulsaRule(CH1, EFF_25351, {
      id: `${prefix}-stack-103`,
      code: `${prefix.toUpperCase()}-103`,
      label: "Permit processing surcharge — $5.00 per permit",
      description:
        '"A surcharge of Five Dollars ($5.00) shall be imposed on each permit … processed" (§ 103) — charged after the state lines, before the floor reads the bill.',
      feeType: "flat",
      config: { amountCents: 500 },
      componentType: "other",
      conditions: NOT_SHELTER,
    }),
    tulsaRule(CH1, EFF_25351, {
      id: `${prefix}-stack-107`,
      code: `${prefix.toUpperCase()}-107`,
      label: "Minimum fee — $80.00 on any permit",
      description:
        '"A minimum fee of Eighty Dollars ($80.00) shall apply to any permit" (§ 107) — a floor on the whole bill rather than on any row, charged as the shortfall after every other line: a $35 water-heater permit computes $52.80 with the stack and pays $80.00. Priority 200 inside the other component, so nothing charges after it; § 306 stands it down for storm shelters, whose only exception is Section 100.',
      feeType: "permit_minimum",
      componentType: "other",
      config: { basis: "fee_subtotal", floorCents: 8_000 },
      priority: 200,
      conditions: NOT_SHELTER,
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* Building — Chapter 3                                                       */
/* -------------------------------------------------------------------------- */

export const TULSA_BUILDING_RULES: FeeRuleRecord[] = [
  /* § 302 — the permit fee itself, in its four published bands. */
  tulsaRule(CH3, EFF_25794, {
    id: "tul-bld-302-a",
    code: "BLD-302-A",
    label: "Building permit, valuation up to $5,000 — $137.00",
    description:
      '"$0 – $5,000.00 ..... $137.00" (§ 302, first band, FY2027 figures from Ord. 25794). The floor band is a fixed sum however small the job is — a $500 valuation pays $137.00 — and the § 107 stack\'s $80 floor sits under it, never binding at this level.',
    feeType: "flat",
    config: { amountCents: 13_700 },
    conditions: all(BANDS_SCOPE, VAL_LTE_5K),
  }),
  tulsaRule(CH3, EFF_25794, {
    id: "tul-bld-302-b",
    code: "BLD-302-B",
    label: "Building permit, valuation $5,000.01–$40,000 — $219.00",
    description:
      '"$5,000.01 – $40,000.00 ..... $219.00" (§ 302, second band). A fixed sum again: one dollar over $5,000 jumps the fee from $137.00 to $219.00 and it stays there until $40,000.01.',
    feeType: "flat",
    config: { amountCents: 21_900 },
    conditions: all(BANDS_SCOPE, VAL_5K_TO_40K),
  }),
  tulsaRule(CH3, EFF_25794, {
    id: "tul-bld-302-c",
    code: "BLD-302-C",
    label: "Building permit, valuation $40,000.01–$150,000 — $6.18 per closest $1,000",
    description:
      '"Over $40,000.00 to $150,000.00 ..... $6.18 per thousand of the estimated valuation", and every rate band here is "calculated in One Thousand Dollar increments to the closest One Thousand Dollars" (§ 302). The nearest rounding is the schedule\'s own phrase, not a transcription of "or fraction": $40,499 buys forty steps — $247.20 — not forty-one, and ties round half up. Google\'s index of the City\'s own 2021 Title 49 PDF shows the same "closest" wording five years before the FY2027 adjustment, so the phrase predates it.',
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 618,
      incrementCents: 100_000,
      incrementRounding: "nearest",
    },
    conditions: all(BANDS_SCOPE, VAL_40K_TO_150K),
  }),
  tulsaRule(CH3, EFF_25794, {
    id: "tul-bld-302-d",
    code: "BLD-302-D",
    label: "Building permit, valuation over $150,000 — $927.00 plus $3.09 per closest $1,000 above $150,000",
    description:
      '"The additional fee shall be $3.09 per thousand of the estimated valuation above $150,000.00" (§ 302, fourth band), still "to the closest One Thousand Dollars". The reading charged here: subsection B is explicitly capped at $150,000, so the base this is additional to is B\'s own computation at its ceiling — $6.18 × 150 = $927.00 — plus $3.09 per closest thousand of the excess. The seam is continuous: exactly $150,000 pays $927.00 from the band above, one dollar more pays $927.00 and nothing else. The alternative reading — B\'s rate continuing on the full valuation with the excess layer stacked on it, a $9.27 marginal rate above the seam — requires applying B outside the scope its own cap states, and is recorded as the alternative with a needs_review verification. The drafter\'s pattern supports the charged reading: where § 301 means a replacement formula it prints one, and a schedule that prints fixed sums when it means fixed sums would have printed "$927.00 plus …" if that base were meant to be literal.',
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      centsPerThousand: 309,
      thresholdCents: 15_000_000,
      incrementCents: 100_000,
      incrementRounding: "nearest",
      baseCents: 92_700,
    },
    conditions: all(BANDS_SCOPE, VAL_OVER_150K),
  }),

  /* The chapter's other priced rows. */
  tulsaRule(CH3, EFF_25351, {
    id: "tul-bld-demo",
    code: "BLD-314-DEMO",
    label: "Demolition permit — $133.00",
    description:
      '"Demolition permit fee ..... $133.00" (§ 314) — a flat for the work type rather than a valuation band, so a demolition does not read a declared cost. The sewer plug permit the same section mentions is Chapter 13\'s and is named, not charged.',
    feeType: "flat",
    config: { amountCents: 13_300 },
    conditions: { field: "work_type", op: "eq", value: "demolition" },
  }),
  tulsaRule(CH3, EFF_25351, {
    id: "tul-bld-carport",
    code: "BLD-304-CARPORT",
    label: "Carport permit — $98.00",
    description:
      '"Carport permit fee ..... $98.00" (§ 304) — its own section and its own flat, which is why the valuation bands stand down while the fact is set: the schedule prices this job as a flat, not as a percentage of anything.',
    feeType: "flat",
    config: { amountCents: 9_800 },
    conditions: all(rowFact("carport"), NOT_SHELTER),
  }),
  tulsaRule(CH3, EFF_25351, {
    id: "tul-bld-shelter-indoor",
    code: "BLD-306-SHELTER-INDOOR",
    label: "Storm shelter permit, indoor — $88.00",
    description:
      '"Storm shelter permit fee ... Indoor ..... $88.00" (§ 306) — and the section\'s own exclusivity instruction decides everything else: "Storm shelter permit fee shall be a flat fee with no other administrative, zoning, or watershed fees applicable with the exception of Section 100." So this flat charges with the state\'s $4.50 and nothing else — the valuation bands, § 117\'s 8%, § 103\'s $5.00 and the $80 floor all stand down.',
    feeType: "flat",
    config: { amountCents: 8_800 },
    conditions: rowFact("storm_shelter_indoor"),
  }),
  tulsaRule(CH3, EFF_25351, {
    id: "tul-bld-shelter-outdoor",
    code: "BLD-306-SHELTER-OUTDOOR",
    label: "Storm shelter permit, outdoor — $132.00",
    description:
      '"Storm shelter permit fee ... Outdoor ..... $132.00" (§ 306), under the same carve-out as the indoor row: its flat plus Section 100\'s $4.50, and no other line of the stack.',
    feeType: "flat",
    config: { amountCents: 13_200 },
    conditions: rowFact("storm_shelter_outdoor"),
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical — Chapter 4                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The chapter's four regimes. § 401 is residential one-/two-family new
 * construction and additions; § 402 is commercial/industrial new construction
 * (A) and additions plus major remodels (B), with the note under (B) sending
 * remodels of less than half the space to § 404; § 403 is the low-density
 * shadow that stands against § 402 when its fact is set; § 404 is the
 * catch-all the chapter itself points to — and the source of the electric
 * service fee every covered regime says its total includes.
 */
const ONE_TWO_FAMILY: FeeCondition = { field: "custom.one_two_family", op: "eq", value: true };
const NOT_ONE_TWO_FAMILY: FeeCondition = { field: "custom.one_two_family", op: "neq", value: true };

const RES_NEW_401: FeeCondition = all(
  ONE_TWO_FAMILY,
  { field: "work_type", op: "in", value: ["new_construction", "addition"] },
);
const LOW_DENSITY_403: FeeCondition = rowFact("low_density_project");
const COMM_NEW_402A: FeeCondition = all(
  NOT_ONE_TWO_FAMILY,
  { field: "work_type", op: "eq", value: "new_construction" },
  not(LOW_DENSITY_403),
);
const COMM_ADD_402B: FeeCondition = all(
  NOT_ONE_TWO_FAMILY,
  not(LOW_DENSITY_403),
  any(
    { field: "work_type", op: "eq", value: "addition" },
    all(
      { field: "work_type", op: "in", value: ["alteration", "remodel"] },
      rowFact("major_remodel"),
    ),
  ),
);
const COVERED_401_TO_403: FeeCondition = any(RES_NEW_401, COMM_NEW_402A, COMM_ADD_402B, LOW_DENSITY_403);
const NOT_COVERED: FeeCondition = not(COVERED_401_TO_403);

function area(minExclusive: number | null, max: number | null): FeeCondition[] {
  const parts: FeeCondition[] = [];
  if (minExclusive !== null) parts.push({ field: "square_footage", op: "gt", value: minExclusive });
  if (max !== null) parts.push({ field: "square_footage", op: "lte", value: max });
  return parts;
}

/** The over-100,000 continuation all three sections print identically. */
function overHundredThousand(prefix: string, baseCents: number, section: string): FeeRuleRecord {
  return tulsaRule(CH4, EFF_25351, {
    id: `${prefix}-over-100k`,
    code: `ELEC-${prefix.toUpperCase()}-OVER-100K`,
    label: `${section} over 100,000 sq ft — $64.00 per each additional 5,000 sq ft`,
    description:
      '"Each additional 5,000 sq. ft. ..... $64.00" (§ ' +
      section +
      ') — the continuation row the section prints after its six bands. The line prints no "or fraction thereof", so the additional square feet prorate: 101,000 sq ft is one-fifth of a step, $12.80, on top of the band\'s ceiling. Stated as a rate of 1.28 cents per square foot above 100,000, with the sixth band\'s figure as the base so the seam does not skip.',
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 6_400, denominator: 5_000 },
      rateUnit: "currency_per_unit",
      thresholdCents: 100_000,
      baseCents,
    },
    conditions: [{ field: "square_footage", op: "gt", value: 100_000 }],
  });
}

export const TULSA_ELECTRICAL_RULES: FeeRuleRecord[] = [
  /* § 401 — residential one-/two-family, new construction and additions */
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-401-small",
    code: "ELEC-401-SMALL",
    label: "Residential 1–2 family, 1–2,000 sq ft — $230.00",
    description:
      '"1—2,000 sq. ft. ..... $230.00" (§ 401.A) — the base fee only; the section says the permit "shall be a total of the electric service fee, as determined in Subsection 404.A, plus a base fee", so the service rule below rides on top whenever an amperage is given.',
    feeType: "flat",
    config: { amountCents: 23_000 },
    conditions: all(RES_NEW_401, ...area(null, 2_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-401-mid",
    code: "ELEC-401-MID",
    label: "Residential 1–2 family, 2,001–6,000 sq ft — $293.00",
    description: '"2,001—6,000 sq. ft. ..... $293.00" (§ 401.A) — the second band, still the base fee alone.',
    feeType: "flat",
    config: { amountCents: 29_300 },
    conditions: all(RES_NEW_401, ...area(2_000, 6_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-401-over",
    code: "ELEC-401-OVER",
    label: "Residential 1–2 family over 6,000 sq ft — $293.00 plus $58.00 per 1,000 sq ft",
    description:
      '"Each additional 1,000 sq. ft. ..... $58.00" (§ 401.A) — the continuation of the second band. The line prints no "or fraction thereof", so the additional square feet prorate rather than round: 6,500 sq ft is half a thousand, $29.00 above the $293.00 base, stated as 5.8 cents per square foot over 6,000.',
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 58, denominator: 10 },
      rateUnit: "currency_per_unit",
      thresholdCents: 6_000,
      baseCents: 29_300,
    },
    conditions: all(RES_NEW_401, { field: "square_footage", op: "gt", value: 6_000 }),
  }),

  /* § 402(A) — commercial or industrial, new construction */
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402a-1",
    code: "ELEC-402A-1",
    label: "Commercial new construction, 1–2,500 sq ft — $293.00",
    description: '"1—2,500 sq. ft. ..... $293.00" (§ 402.A) — first of six published bands, base fee alone with the § 404.A service fee on top.',
    feeType: "flat",
    config: { amountCents: 29_300 },
    conditions: all(COMM_NEW_402A, ...area(null, 2_500)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402a-2",
    code: "ELEC-402A-2",
    label: "Commercial new construction, 2,501–10,000 sq ft — $344.00",
    description: '"2,501—10,000 sq. ft. ..... $344.00" (§ 402.A).',
    feeType: "flat",
    config: { amountCents: 34_400 },
    conditions: all(COMM_NEW_402A, ...area(2_500, 10_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402a-3",
    code: "ELEC-402A-3",
    label: "Commercial new construction, 10,001–25,000 sq ft — $562.00",
    description: '"10,001—25,000 sq. ft. ..... $562.00" (§ 402.A).',
    feeType: "flat",
    config: { amountCents: 56_200 },
    conditions: all(COMM_NEW_402A, ...area(10_000, 25_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402a-4",
    code: "ELEC-402A-4",
    label: "Commercial new construction, 25,001–50,000 sq ft — $779.00",
    description: '"25,001—50,000 sq. ft. ..... $779.00" (§ 402.A).',
    feeType: "flat",
    config: { amountCents: 77_900 },
    conditions: all(COMM_NEW_402A, ...area(25_000, 50_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402a-5",
    code: "ELEC-402A-5",
    label: "Commercial new construction, 50,001–75,000 sq ft — $997.00",
    description: '"50,001—75,000 sq. ft. ..... $997.00" (§ 402.A).',
    feeType: "flat",
    config: { amountCents: 99_700 },
    conditions: all(COMM_NEW_402A, ...area(50_000, 75_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402a-6",
    code: "ELEC-402A-6",
    label: "Commercial new construction, 75,001–100,000 sq ft — $1,179.00",
    description: '"75,001—100,000 sq. ft. ..... $1,179.00" (§ 402.A) — the sixth band and the base for the continuation row below.',
    feeType: "flat",
    config: { amountCents: 117_900 },
    conditions: all(COMM_NEW_402A, ...area(75_000, 100_000)),
  }),
  { ...overHundredThousand("402a", 117_900, "402.A"), conditions: all(COMM_NEW_402A, { field: "square_footage", op: "gt", value: 100_000 }) },

  /* § 402(B) — commercial additions and major remodels */
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402b-1",
    code: "ELEC-402B-1",
    label: "Commercial addition or major remodel, 1–2,500 sq ft — $189.00",
    description: '"1—2,500 sq. ft. ..... $189.00" (§ 402.B) — the additions-and-remodels table, priced below the new-construction table at every band. The note under it is a gate: "On remodel projects having less than fifty percent (50%) of the space in the area involved, the fees shall be as provided in Section 404" — so a remodel under half the space falls to the catch-all, and custom.major_remodel is the fact that marks the ≥50% job.',
    feeType: "flat",
    config: { amountCents: 18_900 },
    conditions: all(COMM_ADD_402B, ...area(null, 2_500)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402b-2",
    code: "ELEC-402B-2",
    label: "Commercial addition or major remodel, 2,501–10,000 sq ft — $207.00",
    description: '"2,501—10,000 sq. ft. ..... $207.00" (§ 402.B).',
    feeType: "flat",
    config: { amountCents: 20_700 },
    conditions: all(COMM_ADD_402B, ...area(2_500, 10_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402b-3",
    code: "ELEC-402B-3",
    label: "Commercial addition or major remodel, 10,001–25,000 sq ft — $344.00",
    description: '"10,001—25,000 sq. ft. ..... $344.00" (§ 402.B).',
    feeType: "flat",
    config: { amountCents: 34_400 },
    conditions: all(COMM_ADD_402B, ...area(10_000, 25_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402b-4",
    code: "ELEC-402B-4",
    label: "Commercial addition or major remodel, 25,001–50,000 sq ft — $476.00",
    description: '"25,001—50,000 sq. ft. ..... $476.00" (§ 402.B).',
    feeType: "flat",
    config: { amountCents: 47_600 },
    conditions: all(COMM_ADD_402B, ...area(25_000, 50_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402b-5",
    code: "ELEC-402B-5",
    label: "Commercial addition or major remodel, 50,001–75,000 sq ft — $607.00",
    description: '"50,001—75,000 sq. ft. ..... $607.00" (§ 402.B).',
    feeType: "flat",
    config: { amountCents: 60_700 },
    conditions: all(COMM_ADD_402B, ...area(50_000, 75_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-402b-6",
    code: "ELEC-402B-6",
    label: "Commercial addition or major remodel, 75,001–100,000 sq ft — $745.00",
    description: '"75,001—100,000 sq. ft. ..... $745.00" (§ 402.B) — the sixth band and the base for this section\'s continuation row.',
    feeType: "flat",
    config: { amountCents: 74_500 },
    conditions: all(COMM_ADD_402B, ...area(75_000, 100_000)),
  }),
  { ...overHundredThousand("402b", 74_500, "402.B"), conditions: all(COMM_ADD_402B, { field: "square_footage", op: "gt", value: 100_000 }) },

  /* § 403 — low density: parking garages, shell buildings, warehouses */
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-403-1",
    code: "ELEC-403-1",
    label: "Low-density project, 1–2,500 sq ft — $144.00",
    description:
      '"1—2,500 sq. ft. ..... $144.00" (§ 403) — the low-density table for "parking garages, shell buildings, and warehouses", which prices by land use rather than occupancy, so custom.low_density_project is the fact that selects it. The section stands against § 402: while its fact is set, the commercial tables stand down.',
    feeType: "flat",
    config: { amountCents: 14_400 },
    conditions: all(LOW_DENSITY_403, ...area(null, 2_500)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-403-2",
    code: "ELEC-403-2",
    label: "Low-density project, 2,501–10,000 sq ft — $161.00",
    description: '"2,501—10,000 sq. ft. ..... $161.00" (§ 403).',
    feeType: "flat",
    config: { amountCents: 16_100 },
    conditions: all(LOW_DENSITY_403, ...area(2_500, 10_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-403-3",
    code: "ELEC-403-3",
    label: "Low-density project, 10,001–25,000 sq ft — $305.00",
    description: '"10,001—25,000 sq. ft. ..... $305.00" (§ 403).',
    feeType: "flat",
    config: { amountCents: 30_500 },
    conditions: all(LOW_DENSITY_403, ...area(10_000, 25_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-403-4",
    code: "ELEC-403-4",
    label: "Low-density project, 25,001–50,000 sq ft — $453.00",
    description: '"25,001—50,000 sq. ft. ..... $453.00" (§ 403).',
    feeType: "flat",
    config: { amountCents: 45_300 },
    conditions: all(LOW_DENSITY_403, ...area(25_000, 50_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-403-5",
    code: "ELEC-403-5",
    label: "Low-density project, 50,001–75,000 sq ft — $593.00",
    description: '"50,001—75,000 sq. ft. ..... $593.00" (§ 403).',
    feeType: "flat",
    config: { amountCents: 59_300 },
    conditions: all(LOW_DENSITY_403, ...area(50_000, 75_000)),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-403-6",
    code: "ELEC-403-6",
    label: "Low-density project, 75,001–100,000 sq ft — $739.00",
    description: '"75,001—100,000 sq. ft. ..... $739.00" (§ 403) — the sixth band and the base for this section\'s continuation row.',
    feeType: "flat",
    config: { amountCents: 73_900 },
    conditions: all(LOW_DENSITY_403, ...area(75_000, 100_000)),
  }),
  { ...overHundredThousand("403", 73_900, "403"), conditions: all(LOW_DENSITY_403, { field: "square_footage", op: "gt", value: 100_000 }) },

  /* § 404.A — the electric service fee, on covered work and on service work */
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-service",
    code: "ELEC-404A-SERVICE",
    label: "Electric service — $98.00 first 100 amps, $18.00 per additional 100 or portion",
    description:
      '"Electrical service (first 100 amps) ..... $98.00 / Each additional 100 amps, or portion thereof ..... $18.00" (§ 404.A). The covered regimes say their totals *include* this fee — § 401: "shall be a total of the electric service fee, as determined in Subsection 404.A … plus a base fee" — so it answers on 401 and 402(A) work automatically, and elsewhere only when the application says a service is involved (402(B) and 403 print "(when required)"). The add-on rounds the excess above 100 up to whole hundreds at eighteen cents per amp: 250 amps is two additional hundreds, $36.00, and the $98.00 base covers the first 100 — which is why a filing with no amperage stated is charged none of this line rather than a guessed service size.',
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 18, denominator: 1 },
      rateUnit: "currency_per_unit",
      thresholdCents: 100,
      incrementCents: 100,
      baseCents: 9_800,
    },
    conditions: any(RES_NEW_401, COMM_NEW_402A, rowFact("electrical_service")),
  }),

  /* § 404 B–I — the catch-all rows, for work not covered in 401–403 */
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-404-pool",
    code: "ELEC-404B-POOL",
    label: "Swimming pool (catch-all) — $235.00",
    description:
      '"Swimming pools ..... $235.00" (§ 404.B), inside the section that applies to "residential, commercial, or industrial work not covered in Sections 401 through 403" — so the branch tables stand down while this row answers.',
    feeType: "flat",
    config: { amountCents: 23_500 },
    conditions: all(NOT_COVERED, rowFact("swimming_pool")),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-404-generator",
    code: "ELEC-404C-GENERATOR",
    label: "Generator (catch-all) — $235.00",
    description:
      '"Generator ..... $235.00 / Each additional ..... $118.00" (§ 404.C). The first unit is charged here; the "each additional" count is a generator count the inputs do not carry, recorded beside this row rather than priced.',
    feeType: "flat",
    config: { amountCents: 23_500 },
    conditions: all(NOT_COVERED, rowFact("generator")),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-404-hvac",
    code: "ELEC-404D-HVAC",
    label: "HVAC unit (catch-all) — $81.00",
    description: '"HVAC unit ..... $81.00" (§ 404.D) — first unit; the "each additional $11.89" count is recorded beside it.',
    feeType: "flat",
    config: { amountCents: 8_100 },
    conditions: all(NOT_COVERED, rowFact("hvac_unit")),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-404-transformer",
    code: "ELEC-404E-TRANSFORMER",
    label: "Transformer (catch-all) — $81.00",
    description: '"Transformer ..... $81.00" (§ 404.E) — first unit; "each additional $11.89" recorded.',
    feeType: "flat",
    config: { amountCents: 8_100 },
    conditions: all(NOT_COVERED, rowFact("transformer")),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-404-motor",
    code: "ELEC-404F-MOTOR",
    label: "Motor (catch-all) — $81.00",
    description: '"Motor ..... $81.00" (§ 404.F) — first unit; "each additional $11.89" recorded.',
    feeType: "flat",
    config: { amountCents: 8_100 },
    conditions: all(NOT_COVERED, rowFact("motor")),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-404-elevator",
    code: "ELEC-404G-ELEVATOR",
    label: "Elevator/escalator (catch-all) — $81.00",
    description: '"Elevator/escalator ..... $81.00" (§ 404.G) — first unit; "each additional $11.89" recorded.',
    feeType: "flat",
    config: { amountCents: 8_100 },
    conditions: all(NOT_COVERED, rowFact("elevator")),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-404-equipment",
    code: "ELEC-404H-EQUIPMENT",
    label: "Electrical equipment, 1–25 units (catch-all) — $81.00",
    description: '"Electrical equipment: 1—25 ..... $81.00 / Each additional ..... $2.68" (§ 404.H) — the 1–25 band\'s $81.00; the per-unit continuation is recorded beside it.',
    feeType: "flat",
    config: { amountCents: 8_100 },
    conditions: all(NOT_COVERED, rowFact("electrical_equipment")),
  }),
  tulsaRule(CH4, EFF_25351, {
    id: "tul-elec-404-reconnect",
    code: "ELEC-404I-RECONNECT",
    label: "Reconnect fee (catch-all) — $81.00",
    description: '"Reconnect fee ..... $81.00" (§ 404.I).',
    feeType: "flat",
    config: { amountCents: 8_100 },
    conditions: all(NOT_COVERED, rowFact("reconnect")),
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing — Chapter 8                                                       */
/* -------------------------------------------------------------------------- */

/**
 * § 801 in six rows, every one a count the inputs already carry — so a permit
 * charges exactly the rows its job touches, with no scope switch at all:
 * meters, backflow assemblies, interceptors, heaters, water service
 * connections and fixtures. The one figure this title cannot read is § 801.A's
 * "Plus, per opening .....$2.6887.00" — two decimal points in one amount, in
 * the codified text exactly as the 2021 printing had it — which is quoted on
 * the page and charged nowhere (Toledo's garbled-row precedent: a figure that
 * cannot be read is named, never guessed).
 */
export const TULSA_PLUMBING_RULES: FeeRuleRecord[] = [
  tulsaRule(CH8, EFF_25351, {
    id: "tul-pl-gas-meter",
    code: "PL-801A-GAS",
    label: "Gas piping — $41.00 per meter",
    description:
      '"Gas piping ... $41.00 per meter" (§ 801.A). The meter is the count, so a job with three meters pays three rows; the section\'s "Plus, per opening .....$2.6887.00" line is quoted verbatim on the page and charged nowhere — two decimal points in one amount, in the codified text as the 2021 printing had it, and $2.68, $87.00 and $2.6887 are all defensible splits of the same characters with no arithmetic to check them against.',
    feeType: "per_unit",
    config: { unit: "meters", centsPerUnit: 4_100 },
    conditions: { field: "custom.meters", op: "gt", value: 0 },
  }),
  tulsaRule(CH8, EFF_25351, {
    id: "tul-pl-backflow",
    code: "PL-801-BACKFLOW",
    label: "Backflow prevention assembly — $79.00",
    description: '"Backflow prevention assembly ..... $79.00" (§ 801) — priced per assembly on custom.backflow_devices, a plumbing device with nothing in common with the fixture count.',
    feeType: "per_unit",
    config: { unit: "backflow_devices", centsPerUnit: 7_900 },
    conditions: { field: "custom.backflow_devices", op: "gt", value: 0 },
  }),
  tulsaRule(CH8, EFF_25351, {
    id: "tul-pl-interceptor",
    code: "PL-801-INTERCEPTOR",
    label: "Interceptor/separator — $150.00",
    description: '"Interceptor/separator ..... $150.00" (§ 801) — per device, on custom.grease_interceptors.',
    feeType: "per_unit",
    config: { unit: "grease_interceptors", centsPerUnit: 15_000 },
    conditions: { field: "custom.grease_interceptors", op: "gt", value: 0 },
  }),
  tulsaRule(CH8, EFF_25351, {
    id: "tul-pl-water-heater",
    code: "PL-801-HEATER",
    label: "Water heater — $35.00",
    description: '"Water heater ..... $35.00" (§ 801) — per heater. A single water-heater permit is the smallest job this title can price, and it is the worked example that lands on the stack\'s $80 floor.',
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 3_500 },
    conditions: { field: "custom.heaters", op: "gt", value: 0 },
  }),
  tulsaRule(CH8, EFF_25351, {
    id: "tul-pl-water-service",
    code: "PL-801-WATER-SERVICE",
    label: "Water service — $35.00",
    description: '"Water service ..... $35.00" (§ 801) — per connection, on custom.water_service_connections.',
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 3_500 },
    conditions: { field: "custom.water_service_connections", op: "gt", value: 0 },
  }),
  tulsaRule(CH8, EFF_25351, {
    id: "tul-pl-fixtures",
    code: "PL-801-FIXTURES",
    label: "Plumbing fixtures — $81.00 base including the first, $3.31 each additional",
    description:
      '"Fixtures base (including the first fixture) ..... $81.00 / Plus, each additional fixture ..... $3.31" (§ 801) — one row with the first fixture inside its base: the base covers one, every fixture after it counts at $3.31, so four fixtures are $81.00 + 3 × $3.31 = $90.93 before the Chapter 1 stack.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 331, baseCents: 8_100, thresholdUnits: 1 },
    conditions: { field: "fixtures", op: "gt", value: 0 },
  }),
];
