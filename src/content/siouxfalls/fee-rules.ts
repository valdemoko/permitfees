import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Sioux Falls, South Dakota fee rules — REAL DATA.
 *
 * Sources: the City's annual Building Permit Valuation/Fee Schedule (the 2026
 * edition, retrieved at siouxfalls.gov as "2025-fee-schedule.pdf" and
 * "2026-fee-schedule-01012026.pdf") and the Code of Ordinances Chapter 150 —
 * § 150.017 Tables 1-A/1-B (building ladders, identical to the schedule's) and
 * Table 1-C row 11 (plan review 25% of the Table 1-B fee). The electrical,
 * mechanical and plumbing trades have shared the same eight-band valuation
 * ladder since January 1, 2022 (§ 150.213 as amended; the City's 2026 MEP
 * Permit Fees one-pager publishes it as one common table). See
 * research/south-dakota/sioux-falls.md for the access record, the seam checks
 * (every ladder above its flat band chains exactly), and the Table 104.5
 * plumbing-base divergence the common ladder resolves.
 *
 * Mechanisms: two building ladders (residential Table 1-A, commercial
 * Table 1-B) as mutually-exclusive per_thousand bands with "or fraction
 * thereof" round-up increments; plan review as a percent of permit_fee at
 * 2,500 bps for any valuation above the $2,000 flat-band seam; and the MEP
 * ladder reading the trade's own declared valuation on the electrical and
 * plumbing pages. The residential band-1/band-2 seam ($40 flat to $4,000;
 * band 2's base written from $2,000) is modelled as printed and documented —
 * every other seam chains to the cent.
 *
 * Verified: 2026-09-26.
 */

export const SFS_SCHEDULE_EFFECTIVE_FROM = "2026-01-01";
export const SFS_MEP_EFFECTIVE_FROM = "2022-01-01";

export const SFS_FEE_SCHEDULE_SOURCE_KEY = "sioux-falls-fee-schedule-2026";
export const SFS_CODE_CH150_SOURCE_KEY = "sioux-falls-code-ch150";
export const SFS_MEP_SOURCE_KEY = "sioux-falls-mep-permit-fees-2026";

function rule(
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

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };
const NOT_RESIDENTIAL: FeeCondition = { field: "occupancy", op: "neq", value: "residential" };

/* -------------------------------------------------------------------------- */
/* Building — Table 1-A (residential) and Table 1-B (commercial) ladders      */
/* -------------------------------------------------------------------------- */

/**
 * The residential ladder's printed bands. Band 1 is a flat $40.00 to $4,000;
 * band 2's base is written "for the first $2,000" even though the flat band
 * holds to $4,000, so the base's coverage point ($2,000) is the step
 * threshold and the $4,001 seam jumps to the ladder's continuous value —
 * the one seam on this ladder that does not chain, documented as printed.
 * Every seam above ($25,000 / $50,000 / $100,000) chains exactly.
 */
const RESIDENTIAL_BANDS = [
  {
    baseCents: 4_000,
    floorCents: 0,
    ceilingCents: 400_000 as number | null,
    thresholdCents: 0,
    incrementCents: 100_000,
    centsPerThousand: 0, // flat row
    text: 'Table 1-A row 1: "$1.00 to $4,000.00 — $40.00." A flat band; the $40 floor covers re-shingles, residing, pool fences, razing and window sashes as named scope rows.',
  },
  {
    baseCents: 3_250,
    floorCents: 400_000,
    ceilingCents: 2_500_000 as number | null,
    thresholdCents: 200_000,
    incrementCents: 100_000,
    centsPerThousand: 600,
    text: 'Table 1-A row 2: "$4,001 to $25,000 — $32.50 for the first $2,000 plus $6.00 for each additional $1,000 or fraction thereof, to $25,000." The base\'s coverage point is $2,000, so the step excess reads from there; at the $4,001 seam the printed ladder jumps to its continuous value ($32.50 + 3 × $6.00 = $50.50) — the one seam that does not chain from the $40 flat.',
  },
  {
    baseCents: 17_050,
    floorCents: 2_500_000,
    ceilingCents: 5_000_000 as number | null,
    thresholdCents: 2_500_000,
    incrementCents: 100_000,
    centsPerThousand: 450,
    text: 'Table 1-A row 3: "$25,001 to $50,000 — $170.50 for the first $25,000 plus $4.50 for each additional $1,000 or fraction thereof, to $50,000." The base is band 2 run to its ceiling: $32.50 + 23 × $6.00 = $170.50.',
  },
  {
    baseCents: 28_300,
    floorCents: 5_000_000,
    ceilingCents: 10_000_000 as number | null,
    thresholdCents: 5_000_000,
    incrementCents: 100_000,
    centsPerThousand: 300,
    text: 'Table 1-A row 4: "$50,001 to $100,000 — $283.00 for the first $50,000 plus $3.00 for each additional $1,000 or fraction thereof, to $100,000." $170.50 + 25 × $4.50 = $283.00.',
  },
  {
    baseCents: 43_300,
    floorCents: 10_000_000,
    ceilingCents: null,
    thresholdCents: 10_000_000,
    incrementCents: 100_000,
    centsPerThousand: 250,
    text: 'Table 1-A row 5: "$100,001 and up — $433.00 for the first $100,000 plus $2.50 for each additional $1,000 or fraction thereof." $283.00 + 50 × $3.00 = $433.00.',
  },
];

/**
 * The commercial ladder (Table 1-B). The $40 flat band ends at $2,000 and
 * every seam above chains exactly: $45 + 23 × $9.00 = $252.00; $252.00 +
 * 25 × $6.50 = $414.50; $414.50 + 50 × $4.50 = $639.50; $639.50 + 400 ×
 * $3.50 = $2,039.50.
 */
const COMMERCIAL_BANDS = [
  {
    baseCents: 4_000,
    floorCents: 0,
    ceilingCents: 200_000 as number | null,
    thresholdCents: 0,
    incrementCents: 100_000,
    centsPerThousand: 0, // flat row
    text: 'Table 1-B row 1: "$1.00 to $2,000.00 — $40.00." A flat band.',
  },
  {
    baseCents: 4_500,
    floorCents: 200_000,
    ceilingCents: 2_500_000 as number | null,
    thresholdCents: 200_000,
    incrementCents: 100_000,
    centsPerThousand: 900,
    text: 'Table 1-B row 2: "$2,001 to $25,000 — $45.00 for the first $2,000 plus $9.00 for each additional $1,000 or fraction thereof, to $25,000."',
  },
  {
    baseCents: 25_200,
    floorCents: 2_500_000,
    ceilingCents: 5_000_000 as number | null,
    thresholdCents: 2_500_000,
    incrementCents: 100_000,
    centsPerThousand: 650,
    text: 'Table 1-B row 3: "$25,001 to $50,000 — $252.00 for the first $25,000 plus $6.50 for each additional $1,000 or fraction thereof, to $50,000." $45.00 + 23 × $9.00 = $252.00.',
  },
  {
    baseCents: 41_450,
    floorCents: 5_000_000,
    ceilingCents: 10_000_000 as number | null,
    thresholdCents: 5_000_000,
    incrementCents: 100_000,
    centsPerThousand: 450,
    text: 'Table 1-B row 4: "$50,001 to $100,000 — $414.50 for the first $50,000 plus $4.50 for each additional $1,000 or fraction thereof, to $100,000." $252.00 + 25 × $6.50 = $414.50.',
  },
  {
    baseCents: 63_950,
    floorCents: 10_000_000,
    ceilingCents: 50_000_000 as number | null,
    thresholdCents: 10_000_000,
    incrementCents: 100_000,
    centsPerThousand: 350,
    text: 'Table 1-B row 5: "$100,001 to $500,000 — $639.50 for the first $100,000 plus $3.50 for each additional $1,000 or fraction thereof, to $500,000." $414.50 + 50 × $4.50 = $639.50.',
  },
  {
    baseCents: 203_950,
    floorCents: 50_000_000,
    ceilingCents: null,
    thresholdCents: 50_000_000,
    incrementCents: 100_000,
    centsPerThousand: 300,
    text: 'Table 1-B row 6: "$500,001 and up — $2,039.50 for the first $500,000 plus $3.00 for each additional $1,000 or fraction thereof." $639.50 + 400 × $3.50 = $2,039.50.',
  },
];

function bandRules(
  bands: typeof RESIDENTIAL_BANDS,
  opts: { prefix: string; codePrefix: string; occupancy: FeeCondition | null },
): FeeRuleRecord[] {
  return bands.map((band, i) =>
    rule(SFS_FEE_SCHEDULE_SOURCE_KEY, SFS_SCHEDULE_EFFECTIVE_FROM, {
      id: `${opts.prefix}-band-${i + 1}`,
      code: `${opts.codePrefix}-${i + 1}`,
      label: `Building permit valuation band ${i + 1}`,
      description: band.text,
      feeType: band.centsPerThousand === 0 ? "flat" : "per_thousand",
      config:
        band.centsPerThousand === 0
          ? { amountCents: band.baseCents }
          : {
              basis: "valuation",
              baseCents: band.baseCents,
              thresholdCents: band.thresholdCents,
              incrementCents: band.incrementCents,
              centsPerThousand: band.centsPerThousand,
            },
      conditions: {
        all: [
          ...(opts.occupancy ? [opts.occupancy] : []),
          { field: "valuation", op: "gt", value: band.floorCents },
          ...(band.ceilingCents === null
            ? []
            : [{ field: "valuation", op: "lte", value: band.ceilingCents }]),
        ],
      },
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* The shared MEP ladder (electrical, mechanical and plumbing since 2022)     */
/* -------------------------------------------------------------------------- */

/**
 * The common trade ladder, priced on the trade's own declared valuation
 * ("Electrical/Mechanical/Plumbing Valuation" — the Total Project Valuation
 * is used instead only when a building permit covers the same work, which a
 * stand-alone trade permit never has). Every seam above the $40 flat band
 * chains exactly: $40 + 20 × $6.00 = $160.00; $160.00 + 25 × $5.25 =
 * $291.25; $291.25 + 50 × $4.50 = $516.25; $516.25 + 150 × $4.25 =
 * $1,153.75; $1,153.75 + 250 × $4.00 = $2,153.75; $2,153.75 + 500 × $3.50 =
 * $3,903.75.
 */
const MEP_BANDS = [
  {
    baseCents: 4_000,
    floorCents: 0,
    ceilingCents: 500_000 as number | null,
    thresholdCents: 0,
    incrementCents: 100_000,
    centsPerThousand: 0, // flat row
    text: '"$0.01 to $5,000.00 — $40.00." A flat band.',
  },
  {
    baseCents: 4_000,
    floorCents: 500_000,
    ceilingCents: 2_500_000 as number | null,
    thresholdCents: 500_000,
    incrementCents: 100_000,
    centsPerThousand: 600,
    text: '"$5,000.01 to $25,000 — $40 for the first $5,000 plus $6 per additional $1,000 or fraction thereof, to $25,000."',
  },
  {
    baseCents: 16_000,
    floorCents: 2_500_000,
    ceilingCents: 5_000_000 as number | null,
    thresholdCents: 2_500_000,
    incrementCents: 100_000,
    centsPerThousand: 525,
    text: '"$25,000.01 to $50,000 — $160 for the first $25,000 plus $5.25 per additional $1,000 or fraction thereof, to $50,000." $40 + 20 × $6.00 = $160.00.',
  },
  {
    baseCents: 29_125,
    floorCents: 5_000_000,
    ceilingCents: 10_000_000 as number | null,
    thresholdCents: 5_000_000,
    incrementCents: 100_000,
    centsPerThousand: 450,
    text: '"$50,000.01 to $100,000 — $291.25 for the first $50,000 plus $4.50 per additional $1,000 or fraction thereof, to $100,000." $160.00 + 25 × $5.25 = $291.25.',
  },
  {
    baseCents: 51_625,
    floorCents: 10_000_000,
    ceilingCents: 25_000_000 as number | null,
    thresholdCents: 10_000_000,
    incrementCents: 100_000,
    centsPerThousand: 425,
    text: '"$100,000.01 to $250,000 — $516.25 for the first $100,000 plus $4.25 per additional $1,000 or fraction thereof, to $250,000." $291.25 + 50 × $4.50 = $516.25.',
  },
  {
    baseCents: 115_375,
    floorCents: 25_000_000,
    ceilingCents: 50_000_000 as number | null,
    thresholdCents: 25_000_000,
    incrementCents: 100_000,
    centsPerThousand: 400,
    text: '"$250,000.01 to $500,000 — $1,153.75 for the first $250,000 plus $4.00 per additional $1,000 or fraction thereof, to $500,000." $516.25 + 150 × $4.25 = $1,153.75.',
  },
  {
    baseCents: 215_375,
    floorCents: 50_000_000,
    ceilingCents: 100_000_000 as number | null,
    thresholdCents: 50_000_000,
    incrementCents: 100_000,
    centsPerThousand: 350,
    text: '"$500,000.01 to $1,000,000 — $2,153.75 for the first $500,000 plus $3.50 per additional $1,000 or fraction thereof, to $1,000,000." $1,153.75 + 250 × $4.00 = $2,153.75.',
  },
  {
    baseCents: 390_375,
    floorCents: 100_000_000,
    ceilingCents: null,
    thresholdCents: 100_000_000,
    incrementCents: 100_000,
    centsPerThousand: 300,
    text: '"$1,000,000.01 and up — $3,903.75 for the first $1,000,000 plus $3.00 per additional $1,000 or fraction thereof." $2,153.75 + 500 × $3.50 = $3,903.75.',
  },
];

function mepBandRules(prefix: string, codePrefix: string): FeeRuleRecord[] {
  return MEP_BANDS.map((band, i) =>
    rule(SFS_MEP_SOURCE_KEY, SFS_MEP_EFFECTIVE_FROM, {
      id: `${prefix}-band-${i + 1}`,
      code: `${codePrefix}-${i + 1}`,
      label: `Trade permit valuation band ${i + 1}`,
      description: band.text,
      feeType: band.centsPerThousand === 0 ? "flat" : "per_thousand",
      config:
        band.centsPerThousand === 0
          ? { amountCents: band.baseCents }
          : {
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
  );
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export const SFS_BUILDING_RULES: FeeRuleRecord[] = [
  ...bandRules(RESIDENTIAL_BANDS, {
    prefix: "sfs-bld-res",
    codePrefix: "BLD-RES",
    occupancy: RESIDENTIAL,
  }),
  ...bandRules(COMMERCIAL_BANDS, {
    prefix: "sfs-bld-com",
    codePrefix: "BLD-COM",
    occupancy: NOT_RESIDENTIAL,
  }),
  rule(SFS_CODE_CH150_SOURCE_KEY, SFS_SCHEDULE_EFFECTIVE_FROM, {
    id: "sfs-bld-plan-review-25",
    code: "BLD-PLAN-REVIEW-25",
    label: "Plan review — 25% of the building permit fee",
    description:
      '§ 150.017, Table 1-C row 11: "said plan review fee shall be 25 percent of the building permit fee as specified on Table 1-B … in addition to the building permit fee." The rule answers whenever the valuation clears the $40 flat band\'s $2,000 seam — the flat band is a permit-only tier — and the model charges the review exactly once here rather than again on the trade pages (each trade code\'s "25% of the [trade] portion" phrasing points at the same Table 1-B amount). Additional review for changed plans is another 25% — named, not charged.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 2_500 },
    conditions: { all: [{ field: "valuation", op: "gt", value: 200_000 }] },
  }),
];

export const SFS_ELECTRICAL_RULES: FeeRuleRecord[] = mepBandRules("sfs-elec", "ELEC-MEP");

export const SFS_PLUMBING_RULES: FeeRuleRecord[] = mepBandRules("sfs-pl", "PL-MEP");
