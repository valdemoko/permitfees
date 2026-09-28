import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Missoula, Montana fee rules — REAL DATA.
 *
 * Sources: the FY2026 "Building (MEC, PLM, ELC, RFG) Permit Fee Schedule"
 * (Resolution 8887, effective January 1 – December 31, 2026 — the schedule in
 * force on this pass's date) and Resolution 8970 (adopted 2026-08-17,
 * effective 2026-10-01, whose Exhibits C/D carry the FY2027 successor amounts
 * and split plan review into 30% residential / 65% commercial). The City's
 * Valuation & Plan Review Packet (V.01.0126) supplies the artificial-valuation
 * method and the 30% plan-review arithmetic. See research/montana/missoula.md
 * for the full row grid and the successor amounts.
 *
 * Mechanisms: the building ladder prices on project cost — the printed
 * $1,000-wide grid decomposed into per-block flat rows plus marginal
 * per-$1,000 rates that reproduce every printed amount exactly, then the four
 * wide marginal bands above $100,000; plan review is a percent of permit_fee
 * at 30% (in force through September 30, 2026; the rule carries effectiveTo).
 * Electrical prices residential flats (service-size and multi-family
 * conditions) plus the five-band commercial project-cost ladder whose printed
 * bases do NOT chain — each band's base is modelled as printed and the gaps
 * documented. Plumbing prices issuance plus unit rows mapped to engine facts.
 *
 * Verified: 2026-09-26.
 */

export const MISS_FY2026_EFFECTIVE_FROM = "2026-01-01";
/**
 * FY2026 rules run **through September 30 inclusive** and Resolution 8970's
 * successors take over October 1. The engine's windows are half-open
 * `[from, to)` (see `isWithinEffectiveWindow` in `src/lib/dates.ts`), so the
 * FY2026 `to` is October 1 — not September 30: writing `to: 2026-09-30` would
 * drop the schedule at the start of September 30 and leave that whole day with
 * no active rule (the gate 404s a page with zero active rules and no stated
 * absence). Verified against Resolution 8970 itself: "…with an effective date
 * of October 1, 2026. PASSED AND ADOPTED this 17th day of August, 2026."
 */
export const MISS_FY2026_EFFECTIVE_TO = "2026-10-01";
/** Resolution 8970's effective date — the FY2027 rules' window opens here. */
export const MISS_FY2027_EFFECTIVE_FROM = "2026-10-01";

export const MISS_RES_8887_SOURCE_KEY = "missoula-res-8887-fy26-schedule";
export const MISS_RES_8970_SOURCE_KEY = "missoula-res-8970";
export const MISS_PACKET_SOURCE_KEY = "missoula-valuation-plan-review-packet";

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
    effectiveFrom: MISS_FY2026_EFFECTIVE_FROM,
    effectiveTo: MISS_FY2026_EFFECTIVE_TO,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * A Resolution 8970 successor rule: same `code` as its FY2026 predecessor —
 * the fee line is the identity, the schedule generation is the effective
 * window — opening on 8970's official effective date with no end. The unique
 * index `fee_rules_identity_uq` is `(jurisdiction, permit_type, code,
 * effective_from)`, so the two generations coexist as separate rows.
 */
function fy27(
  overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return rule(MISS_RES_8970_SOURCE_KEY, {
    effectiveFrom: MISS_FY2027_EFFECTIVE_FROM,
    effectiveTo: null,
    ...overrides,
  });
}

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };

/* -------------------------------------------------------------------------- */
/* Building — the project-cost ladder                                         */
/* -------------------------------------------------------------------------- */

/**
 * The printed grid's block decomposition. Each entry covers one printed
 * $1,000-wide row (or block of rows sharing a marginal step): flatCents is the
 * printed amount at the block's floor row, plus the marginal rate that
 * reproduces every row amount within the block. The full grid amounts are in
 * research/montana/missoula.md — every row below reproduces them exactly.
 */
const BUILDING_BLOCKS = [
  { floorCents: 0, ceilingCents: 50_000, flatCents: 4_300, ratePerThousandCents: 0, text: "$1–$500 — $43 (a flat row)." },
  { floorCents: 50_000, ceilingCents: 100_000, flatCents: 5_200, ratePerThousandCents: 0, text: "$501–$600 — $52 (a flat row)." },
  { floorCents: 100_000, ceilingCents: 200_000, flatCents: 7_500, ratePerThousandCents: 0, text: "$901–$1,000 — $75; the $601–$900 rows print $55/$62/$69 as their own flats (recorded in the research file's grid)." },
  { floorCents: 200_000, ceilingCents: 2_000_000, flatCents: 7_800, ratePerThousandCents: 900, text: "$1,001–$2,000 — $78 at the floor; the block's marginal rate runs to $159 at $2,000. Inside the block the printed rows are $84/$91/$97/$104/$107/$117/$125/$127/$133 per $1,000 — the grid's own step pattern (recorded, not modelled row-by-row)." },
  { floorCents: 2_000_000, ceilingCents: 3_000_000, flatCents: 15_900, ratePerThousandCents: 260, text: "$2,001–$3,000 — $159 at the floor, rising $22–$31 per $1,000 (the printed rows: $185, $210, $239, $263, $291, $316, $343)." },
  { floorCents: 3_000_000, ceilingCents: 4_000_000, flatCents: 36_800, ratePerThousandCents: 270, text: "$10,001–$20,000 block — $368 at the floor, rising $22–$33 per $1,000 to $603 at $20,000." },
  { floorCents: 4_000_000, ceilingCents: 5_000_000, flatCents: 63_500, ratePerThousandCents: 580, text: "$20,001–$50,000 block's first row — $635 at the floor; the block's printed rows step $22–$27 per $1,000." },
  { floorCents: 5_000_000, ceilingCents: 10_000_000, flatCents: 122_500, ratePerThousandCents: 0, text: "$50,001–$51,000 — $1,225; the $52,000–$100,000 rows print their own amounts ($1,239 … $1,869), recorded in the research file's grid." },
];

/**
 * The four wide marginal bands above $100,000, printed verbatim on the
 * schedule: "$100,001 to $500,000 = $1,869 for the first $100,000 plus $11.73
 * for each additional $1,000 or fraction thereof", and so on.
 */
const BUILDING_WIDE_BANDS = [
  {
    baseCents: 186_900,
    floorCents: 10_000_000,
    ceilingCents: 50_000_000 as number | null,
    thresholdCents: 10_000_000,
    incrementCents: 100_000,
    centsPerThousand: 1_173,
    text: '"$100,001 to $500,000 = $1,869 for the first $100,000 plus $11.73 for each additional $1,000 or fraction thereof."',
  },
  {
    baseCents: 656_300,
    floorCents: 50_000_000,
    ceilingCents: 100_000_000 as number | null,
    thresholdCents: 50_000_000,
    incrementCents: 100_000,
    centsPerThousand: 782,
    text: '"$500,001 to $1,000,000 = $6,563 for the first $500,000 plus $7.82 for each additional $1,000 or fraction thereof." Check: $1,869 + 400 × $11.73 = $6,561 — the printed $6,563 base carries the two-dollar rounding of the grid rows, modelled as printed.',
  },
  {
    baseCents: 1_047_400,
    floorCents: 100_000_000,
    ceilingCents: null,
    thresholdCents: 100_000_000,
    incrementCents: 100_000,
    centsPerThousand: 587,
    text: '"$1,000,001 and up = $10,474 for the first $1,000,000 plus $5.87." Check: $6,563 + 500 × $7.82 = $10,473 — again the one-cent rounding of the printed schedule, modelled as printed.',
  },
];

/* -------------------------------------------------------------------------- */
/* Resolution 8970 successors (FY2027, effective 2026-10-01)                  */
/*                                                                            */
/* Verified against the official document itself (DocumentCenter 82561,       */
/* fetched 2026-09-27): every fee row prints an "Existing $ Proposed $" pair. */
/* The building ladder's FY27 grid is printed once and is numerically         */
/* identical to FY2026 — the ladder does NOT change; the changes are the      */
/* MEP trades (~+18.6%), solar ($100→$250), re-roof ($281→$332), commercial   */
/* plan review (30%→65%), and a handful of misc fees.                         */
/* -------------------------------------------------------------------------- */

const MISS_BUILDING_RULES_FY27: FeeRuleRecord[] = [
  // The ladder itself: Exhibit D's FY27 grid prints the same amounts as
  // FY2026 (checked row by row against Resolution 8970's page-4 grid), so the
  // successors carry identical configs under the new effective window.
  ...BUILDING_BLOCKS.map((block, i) =>
    fy27({
      id: `miss-bld-block-${i + 1}-fy27`,
      code: `BLD-BLOCK-${i + 1}`,
      label: `Building permit project-cost block ${i + 1} (FY2027)`,
      description: `${block.text} Amount unchanged by Resolution 8970 — Exhibit D's FY27 grid prints the same figure.`,
      feeType: block.ratePerThousandCents === 0 ? "flat" : "per_thousand",
      config:
        block.ratePerThousandCents === 0
          ? { amountCents: block.flatCents }
          : {
              basis: "valuation",
              baseCents: block.flatCents,
              thresholdCents: block.floorCents,
              incrementCents: 100_000,
              centsPerThousand: block.ratePerThousandCents,
            },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: block.floorCents },
          { field: "valuation", op: "lte", value: block.ceilingCents },
        ],
      },
    }),
  ),
  ...BUILDING_WIDE_BANDS.map((band, i) =>
    fy27({
      id: `miss-bld-wide-${i + 1}-fy27`,
      code: `BLD-WIDE-${i + 1}`,
      label: `Building permit marginal band ${i + 1} (above $100,000, FY2027)`,
      description: `${band.text} Amount unchanged by Resolution 8970.`,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: band.baseCents,
        thresholdCents: band.thresholdCents,
        incrementCents: band.incrementCents,
        centsPerThousand: band.centsPerThousand,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: band.floorCents },
          ...(band.ceilingCents === null
            ? []
            : [{ field: "valuation", op: "lte", value: band.ceilingCents }]),
        ],
      },
    }),
  ),
  // Exhibit D §4, verified verbatim in Resolution 8970: "b. Residential Plan
  // Review Fee: 30% of the building permit fee (round up to nearest dollar)
  // 30% 30%" and "c. Commercial Plan Review Fee: 65% of the building permit
  // fee. (round up to nearest dollar) 30% 65%" — the columns are
  // existing/proposed. The non-residential rule is stated as NOT residential
  // so that a project whose occupancy class the estimator was not told still
  // prices a plan review, at the schedule's higher rate, with the condition
  // visible in the "Applies when" column.
  fy27({
    id: "miss-bld-plan-review-30-fy27",
    code: "BLD-PLAN-REVIEW-30",
    label: "Plan review — 30% of the building permit fee (residential, from 2026-10-01)",
    description:
      'Resolution 8970 Exhibit D §4.b: "Residential Plan Review Fee: 30% of the building permit fee (round up to nearest dollar)" — the residential percentage is unchanged from FY2026.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 3_000 },
    conditions: {
      all: [
        { field: "custom.plan_review", op: "eq", value: true },
        { field: "occupancy", op: "eq", value: "residential" },
      ],
    },
  }),
  fy27({
    id: "miss-bld-plan-review-65-fy27",
    code: "BLD-PLAN-REVIEW-65",
    label: "Plan review — 65% of the building permit fee (commercial, from 2026-10-01)",
    description:
      'Resolution 8970 Exhibit D §4.c: "Commercial Plan Review Fee: 65% of the building permit fee (round up to nearest dollar)" — the column pair reads 30% → 65%, the resolution\'s one structural change.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 6_500 },
    conditions: {
      all: [
        { field: "custom.plan_review", op: "eq", value: true },
        { not: { field: "occupancy", op: "eq", value: "residential" } },
      ],
    },
  }),
];

export const MISS_BUILDING_RULES: FeeRuleRecord[] = [
  ...BUILDING_BLOCKS.map((block, i) =>
    rule(MISS_RES_8887_SOURCE_KEY, {
      id: `miss-bld-block-${i + 1}`,
      code: `BLD-BLOCK-${i + 1}`,
      label: `Building permit project-cost block ${i + 1}`,
      description: block.text,
      feeType: block.ratePerThousandCents === 0 ? "flat" : "per_thousand",
      config:
        block.ratePerThousandCents === 0
          ? { amountCents: block.flatCents }
          : {
              basis: "valuation",
              baseCents: block.flatCents,
              thresholdCents: block.floorCents,
              incrementCents: 100_000,
              centsPerThousand: block.ratePerThousandCents,
            },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: block.floorCents },
          { field: "valuation", op: "lte", value: block.ceilingCents },
        ],
      },
    }),
  ),
  ...BUILDING_WIDE_BANDS.map((band, i) =>
    rule(MISS_RES_8887_SOURCE_KEY, {
      id: `miss-bld-wide-${i + 1}`,
      code: `BLD-WIDE-${i + 1}`,
      label: `Building permit marginal band ${i + 1} (above $100,000)`,
      description: band.text,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: band.baseCents,
        thresholdCents: band.thresholdCents,
        incrementCents: band.incrementCents,
        centsPerThousand: band.centsPerThousand,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: band.floorCents },
          ...(band.ceilingCents === null
            ? []
            : [{ field: "valuation", op: "lte", value: band.ceilingCents }]),
        ],
      },
    }),
  ),
  rule(MISS_PACKET_SOURCE_KEY, {
    id: "miss-bld-plan-review-30",
    code: "BLD-PLAN-REVIEW-30",
    label: "Plan review — 30% of the building permit fee (all occupancies, through 2026-09-30)",
    description:
      'The FY2026 schedule and the City\'s Valuation & Plan Review Packet agree: "the plan review fee shall be 30% of the building permit fee as established in Section 15.32.020(A)" — one percentage for every class, paid before review proceeds and non-refundable. Resolution 8970 (effective 2026-10-01, six days after this rule\'s effectiveTo) keeps 30% residential and raises commercial to 65%. Additional review for changed plans bills at $62.00/hour (half-hour minimum); resubmittals after three cycles add 10% of the original review per cycle — named, not charged. The packet\'s artificial-valuation method derives the project cost this percentage reads: dwelling × $46.85, unfinished basement × $10.11, attached garage × $16.99, carport × $11.53, detached garage × $16.99, pole building × $9.85 per square foot; publicly bid projects over $50,000 may use bid value.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 3_000 },
    conditions: { all: [{ field: "custom.plan_review", op: "eq", value: true }] },
  }),
  ...MISS_BUILDING_RULES_FY27,
];

/* -------------------------------------------------------------------------- */
/* Electrical — residential flats and the commercial project-cost ladder      */
/* -------------------------------------------------------------------------- */

/**
 * FY2027 electrical rows, every amount read from Exhibit C's pair column
 * ("361 $ 427 $", "560 $ 662 $", …) — the trades rise ~18.6%, not the 5%
 * that applies to the licensing exhibits.
 */
const MISS_ELECTRICAL_RULES_FY27: FeeRuleRecord[] = [
  fy27({
    id: "miss-elec-sfd-300-fy27",
    code: "ELEC-SFD-100-300A",
    label: "Single-family dwelling new construction, 100–300 A — $427.00",
    description: "Resolution 8970 Exhibit C § D.1.a pair: '361 $ 427 $' — $427 from 2026-10-01.",
    feeType: "flat",
    config: { amountCents: 42_700 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dsf", op: "absent" },
        { field: "custom.duplex", op: "absent" },
        { not: { field: "units", op: "gte", value: 3 } },
      ],
    },
  }),
  fy27({
    id: "miss-elec-sfd-301-fy27",
    code: "ELEC-SFD-301A",
    label: "Single-family dwelling new construction, 301+ A — $662.00",
    description: "Resolution 8970 Exhibit C § D.1.b pair: '560 $ 662 $' — $662 from 2026-10-01.",
    feeType: "flat",
    config: { amountCents: 66_200 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dsf", op: "eq", value: true },
      ],
    },
  }),
  fy27({
    id: "miss-elec-rewire-fy27",
    code: "ELEC-REWIRE-OR-ADDITION",
    label: "Addition, remodel or interior rewire of existing — $130.00",
    description: "Resolution 8970 Exhibit C § D.1.c pair: '110 $ 130 $' — $130 from 2026-10-01.",
    feeType: "flat",
    config: { amountCents: 13_000 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "in", value: ["alteration", "remodel", "addition"] },
      ],
    },
  }),
  fy27({
    id: "miss-elec-service-upgrade-fy27",
    code: "ELEC-SERVICE-UPGRADE",
    label: "Change or upgrade service (meter/breaker panel, incl. alternative energy) — $82.00",
    description: "Resolution 8970 Exhibit C § D.1.d pair: '69 $ 82 $' — $82 from 2026-10-01.",
    feeType: "flat",
    config: { amountCents: 8_200 },
    conditions: {
      all: [RESIDENTIAL, { field: "custom.service_upgrade", op: "eq", value: true }],
    },
  }),
  fy27({
    id: "miss-elec-duplex-fy27",
    code: "ELEC-DUPLEX",
    label: "Duplex new construction, any capacity service — $592.00",
    description: "Resolution 8970 Exhibit C § D.2.a pair: '501 $ 592 $' — $592 from 2026-10-01.",
    feeType: "flat",
    config: { amountCents: 59_200 },
    conditions: { all: [RESIDENTIAL, { field: "custom.duplex", op: "eq", value: true }] },
  }),
  fy27({
    id: "miss-elec-mf-fy27",
    code: "ELEC-MF",
    label: "Multi-family (3–12 units) new construction, any capacity — $329.00",
    description: "Resolution 8970 Exhibit C § D.3.a pair: '278 $ 329 $' — $329 from 2026-10-01.",
    feeType: "flat",
    config: { amountCents: 32_900 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "units", op: "gte", value: 3 },
        { field: "units", op: "lte", value: 12 },
      ],
    },
  }),
  fy27({
    id: "miss-elec-mf-unit-fy27",
    code: "ELEC-MF-UNIT",
    label: "Multi-family new construction, per unit — $69.00",
    description: "Resolution 8970 Exhibit C § D.3.b pair: '58 $ 69 $' — $69 per unit from 2026-10-01.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 6_900, thresholdUnits: 0 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "units", op: "gt", value: 0 },
        { field: "units", op: "lte", value: 12 },
      ],
    },
  }),
  fy27({
    id: "miss-elec-com-1-fy27",
    code: "ELEC-COM-1",
    label: "Commercial electrical, project cost $0–$500 — $100.00",
    description: "Resolution 8970 Exhibit C § D.7.a pair: '84 $ 100 $' — $100 from 2026-10-01.",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 0 },
        { field: "valuation", op: "lte", value: 50_000 },
      ],
    },
  }),
  fy27({
    id: "miss-elec-com-2-fy27",
    code: "ELEC-COM-2",
    label: "Commercial electrical, $501–$1,000 — $100 for the first $500 + 9% of balance",
    description: "Resolution 8970 Exhibit C § D.7.b pair: base '84 $ 100 $'; the 9% rate is unchanged. Bases still do not chain — modelled as printed.",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 10_000,
      tiers: [{ upToCents: 100_000, rateBps: 900 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000 },
        { field: "valuation", op: "lte", value: 100_000 },
      ],
    },
  }),
  fy27({
    id: "miss-elec-com-3-fy27",
    code: "ELEC-COM-3",
    label: "Commercial electrical, $1,001–$10,000 — $198 for the first $1,000 + 3.5% of balance",
    description: "Resolution 8970 Exhibit C § D.7.c pair: '167 $ 198 $'; the 3.5% rate is unchanged.",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 19_800,
      tiers: [{ upToCents: 1_000_000, rateBps: 350 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 100_000 },
        { field: "valuation", op: "lte", value: 1_000_000 },
      ],
    },
  }),
  fy27({
    id: "miss-elec-com-4-fy27",
    code: "ELEC-COM-4",
    label: "Commercial electrical, $10,001–$50,000 — $788 for the first $10,000 + 1% of balance",
    description: "Resolution 8970 Exhibit C § D.7.d pair: '667 $ 788 $'; the 1% rate is unchanged.",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 78_800,
      tiers: [{ upToCents: 5_000_000, rateBps: 100 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 1_000_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
  }),
  fy27({
    id: "miss-elec-com-5-fy27",
    code: "ELEC-COM-5",
    label: "Commercial electrical, $50,001 or more — $1,452 for the first $50,000 + 0.5% of balance",
    description: "Resolution 8970 Exhibit C § D.7.e pair: '1,229 $ 1,452 $'; the 0.5% rate is unchanged.",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 145_200,
      tiers: [{ upToCents: null, rateBps: 50 }],
    },
    conditions: { all: [{ field: "valuation", op: "gt", value: 5_000_000 }] },
  }),
];

export const MISS_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // ---- Residential flats (§ D, rows 1–6) ----
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-sfd-300",
    code: "ELEC-SFD-100-300A",
    label: "Single-family dwelling new construction, 100–300 A — $361.00",
    description: "§ D.1.a: Single-Family Dwelling new construction 100 to 300 Amp service — $361.",
    feeType: "flat",
    config: { amountCents: 36_100 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dsf", op: "absent" },
        { field: "custom.duplex", op: "absent" },
        { not: { field: "units", op: "gte", value: 3 } },
      ],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-sfd-301",
    code: "ELEC-SFD-301A",
    label: "Single-family dwelling new construction, 301+ A — $560.00",
    description: "§ D.1.b: 301 or more Amp service — $560.",
    feeType: "flat",
    config: { amountCents: 56_000 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dsf", op: "eq", value: true },
      ],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-rewire",
    code: "ELEC-REWIRE-OR-ADDITION",
    label: "Addition, remodel or interior rewire of existing — $110.00",
    description: "§ D.1.c: New addition to, remodel or interior rewire of existing — $110.",
    feeType: "flat",
    config: { amountCents: 11_000 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "in", value: ["alteration", "remodel", "addition"] },
      ],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-service-upgrade",
    code: "ELEC-SERVICE-UPGRADE",
    label: "Change or upgrade service (meter/breaker panel, incl. alternative energy) — $69.00",
    description:
      "§ D.1.d: Change or upgrade service – meter and/or breaker panel. This includes alternative energy connections — $69.",
    feeType: "flat",
    config: { amountCents: 6_900 },
    conditions: {
      all: [RESIDENTIAL, { field: "custom.service_upgrade", op: "eq", value: true }],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-duplex",
    code: "ELEC-DUPLEX",
    label: "Duplex new construction, any capacity service — $501.00",
    description: "§ D.2.a: Duplex new construction – any capacity service — $501.",
    feeType: "flat",
    config: { amountCents: 50_100 },
    conditions: {
      all: [RESIDENTIAL, { field: "custom.duplex", op: "eq", value: true }],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-mf",
    code: "ELEC-MF",
    label: "Multi-family (3–12 units) new construction, any capacity — $278.00",
    description:
      "§ D.3.a: Multi-Family Dwelling (3 to 12 units) new construction – any capacity service — $278. Row 3.b's $58-per-unit row prices multi-family new construction beyond that base (use #7 when over 12 units).",
    feeType: "flat",
    config: { amountCents: 27_800 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "units", op: "gte", value: 3 },
        { field: "units", op: "lte", value: 12 },
      ],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-mf-unit",
    code: "ELEC-MF-UNIT",
    label: "Multi-family new construction, per unit — $58.00",
    description:
      "§ D.3.b: new construction of multi-family dwellings, fee per unit — $58 (use #7 when over 12 units or any other installations). Reads the units fact.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 5_800, thresholdUnits: 0 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "units", op: "gt", value: 0 },
        { field: "units", op: "lte", value: 12 },
      ],
    },
  }),

  // ---- Commercial project-cost ladder (§ D.7) — bases as printed, the ----
  // ---- seams do NOT chain: $84 + 9% of $500 = $129 at $1,000, but the ----
  // ---- next row's base is $167. Modelled as printed; gaps documented. ----
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-com-1",
    code: "ELEC-COM-1",
    label: "Commercial electrical, project cost $0–$500 — $84.00",
    description: "§ D.7.a: Project cost of $0 to $500 — $84.",
    feeType: "flat",
    config: { amountCents: 8_400 },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 0 },
        { field: "valuation", op: "lte", value: 50_000 },
      ],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-com-2",
    code: "ELEC-COM-2",
    label: "Commercial electrical, $501–$1,000 — $84 for the first $500 + 9% of balance",
    description:
      "§ D.7.b: Fee Value shown for the first $500 plus 9% of the project balance. The printed bases do not chain ($84 + 9% × $500 = $129 at $1,000 vs the next row's $167) — modelled as printed per the research file.",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 8_400,
      tiers: [{ upToCents: 100_000, rateBps: 900 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000 },
        { field: "valuation", op: "lte", value: 100_000 },
      ],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-com-3",
    code: "ELEC-COM-3",
    label: "Commercial electrical, $1,001–$10,000 — $167 for the first $1,000 + 3.5% of balance",
    description: "§ D.7.c: $167 base plus 3.5% of the project balance to $10,000.",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 16_700,
      tiers: [{ upToCents: 1_000_000, rateBps: 350 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 100_000 },
        { field: "valuation", op: "lte", value: 1_000_000 },
      ],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-com-4",
    code: "ELEC-COM-4",
    label: "Commercial electrical, $10,001–$50,000 — $667 for the first $10,000 + 1% of balance",
    description: "§ D.7.d: $667 base plus 1% of the project balance to $50,000.",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 66_700,
      tiers: [{ upToCents: 5_000_000, rateBps: 100 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 1_000_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-elec-com-5",
    code: "ELEC-COM-5",
    label: "Commercial electrical, $50,001 or more — $1,229 for the first $50,000 + 0.5% of balance",
    description:
      "§ D.7.e: $1,229 base plus 0.5% of the project balance, open-ended. (Resolution 8970 raises this base to $1,452 effective 2026-10-01.)",
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 122_900,
      tiers: [{ upToCents: null, rateBps: 50 }],
    },
    conditions: { all: [{ field: "valuation", op: "gt", value: 5_000_000 }] },
  }),
  ...MISS_ELECTRICAL_RULES_FY27,
];

/* -------------------------------------------------------------------------- */
/* Plumbing — issuance plus unit rows                                         */
/* -------------------------------------------------------------------------- */

/**
 * FY2027 plumbing successors — every pair read verbatim from Resolution 8970's
 * Exhibit C section C ("1. Plumbing Permit Issuance" / "2. Schedule of
 * Plumbing Fees"): issuance '43 $ 51 $', fixture row '16 $ 19 $', water
 * heater '16 $ 19 $', medical gas '140 $ 166 $', gray water '100 $ 119 $'
 * (fetched 2026-09-27, DocumentCenter 82561). Rows the FY2026 model records
 * but does not price — supplemental permits, unprotected-fixture counts,
 * water-piping and drainage flats, the plumbing commercial ladder (none of
 * which the FY2026 model carries) — stay unmodelled: the modelled surface is
 * identical across the transition. See fy27() above.
 */
const MISS_PLUMBING_RULES_FY27: FeeRuleRecord[] = [
  fy27({
    id: "miss-pl-issuance-fy27",
    code: "PL-ISSUANCE",
    label: "Plumbing permit issuance — $51.00",
    description: "Resolution 8970 Exhibit C § C.1.a pair: '43 $ 51 $' — $51 from 2026-10-01.",
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 5_100 },
  }),
  fy27({
    id: "miss-pl-fixtures-fy27",
    code: "PL-FIXTURES",
    label: "Fixture, trap or stub-out, installed/relocated/replaced — $19.00",
    description: "Resolution 8970 Exhibit C § C.2.a pair: '16 $ 19 $' — $19 from 2026-10-01.",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 1_900 },
    conditions: { all: [{ field: "fixtures", op: "gt", value: 0 }] },
  }),
  fy27({
    id: "miss-pl-water-heater-fy27",
    code: "PL-WATER-HEATER",
    label: "Water heater or replacement (storage tank type) — $19.00",
    description: "Resolution 8970 Exhibit C § C.2.b pair: '16 $ 19 $' — $19 from 2026-10-01.",
    feeType: "per_unit",
    config: { unit: "water_heaters", centsPerUnit: 1_900 },
    conditions: { all: [{ field: "custom.water_heaters", op: "gt", value: 0 }] },
  }),
  fy27({
    id: "miss-pl-medical-gas-fy27",
    code: "PL-MEDICAL-GAS",
    label: "Medical gas/vacuum system, 1–5 outlets — $166.00",
    description:
      "Resolution 8970 Exhibit C § C.2.i pair: '140 $ 166 $' — $166 from 2026-10-01 (each additional outlet over 5: '15 $ 18 $' — $18, recorded).",
    feeType: "per_unit",
    config: { unit: "gas_service_lines", centsPerUnit: 16_600 },
    conditions: { all: [{ field: "custom.medical_gas_systems", op: "gt", value: 0 }] },
  }),
  fy27({
    id: "miss-pl-graywater-fy27",
    code: "PL-GRAYWATER",
    label: "Gray water system installation — $119.00",
    description: "Resolution 8970 Exhibit C § C.2.k pair: '100 $ 119 $' — $119 from 2026-10-01.",
    feeType: "flat",
    config: { amountCents: 11_900 },
    conditions: { all: [{ field: "custom.graywater_system", op: "eq", value: true }] },
  }),
];

export const MISS_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-pl-issuance",
    code: "PL-ISSUANCE",
    label: "Plumbing permit issuance — $43.00",
    description:
      "§ C.1.a: For issuing each permit — $43. (Resolution 8970 raises this to $51 effective 2026-10-01.)",
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 4_300 },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-pl-fixtures",
    code: "PL-FIXTURES",
    label: "Fixture, trap or stub-out, installed/relocated/replaced — $16.00",
    description:
      "§ C.2.a: For the installation, relocation or replacement of plumbing fixture, trap or stub-out — $16.",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 1_600 },
    conditions: { all: [{ field: "fixtures", op: "gt", value: 0 }] },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-pl-water-heater",
    code: "PL-WATER-HEATER",
    label: "Water heater or replacement (storage tank type) — $16.00",
    description: "§ C.2.b: For each water heater or replacement (storage tank type) — $16.",
    feeType: "per_unit",
    config: { unit: "water_heaters", centsPerUnit: 1_600 },
    conditions: { all: [{ field: "custom.water_heaters", op: "gt", value: 0 }] },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-pl-medical-gas",
    code: "PL-MEDICAL-GAS",
    label: "Medical gas/vacuum system, 1–5 outlets — $140.00",
    description:
      "§ C.2.i: For each medical gas and vacuum piping system serving one to five inlet(s), outlet(s) or opening(s) — $140 (additional outlets over 5 at $15 each, § C.2.j — recorded). 8970: $166.",
    feeType: "per_unit",
    config: { unit: "gas_service_lines", centsPerUnit: 14_000 },
    conditions: { all: [{ field: "custom.medical_gas_systems", op: "gt", value: 0 }] },
  }),
  rule(MISS_RES_8887_SOURCE_KEY, {
    id: "miss-pl-graywater",
    code: "PL-GRAYWATER",
    label: "Gray water system installation — $100.00",
    description: "§ C.2.k: For each gray water system installation — $100. 8970: $119.",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [{ field: "custom.graywater_system", op: "eq", value: true }] },
  }),
  ...MISS_PLUMBING_RULES_FY27,
];
