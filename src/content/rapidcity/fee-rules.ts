import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Rapid City, South Dakota fee rules — REAL DATA.
 *
 * Sources: the two one-page fee tables Building Services publishes on its
 * Building Permits Fee Information page — Table 100-A ("Building Permits
 * Residential Permit Fees") and Table 100-C ("Building Permits Commercial
 * Permit Fees") — read from the Wayback captures of the city's own URLs after
 * rcgov.org's Cloudflare challenge blocked scripted retrieval, together with
 * RCMC § 15.04.320, which delegates every fee amount to "resolution of the
 * Common Council". See research/south-dakota/rapid-city.md for the access
 * record and the seam checks (every seam above the $1,600 flat band chains
 * exactly on both tables except the residential $2,000 seam, documented as
 * printed).
 *
 * Mechanisms: two eight-band valuation ladders (residential Table 100-A,
 * commercial Table 100-C) as mutually-exclusive per_thousand rules with
 * "or fraction thereof" round-up increments, gated on occupancy; the pair of
 * plan-review percentages printed identically on both tables — 10% for 1–2
 * family dwellings and accessory structures, 50% for everything else — as
 * percent-of-permit_fee rules. The electrical and plumbing pages model the
 * building permit's own price for trade-scale stand-alone work through the
 * same tables (the adopted trade chapters print no fee tables; § 15.04.320's
 * council-resolution mechanism prices the whole project, MEP included, inside
 * the building permit).
 *
 * Verified: 2026-09-26.
 */

export const RC_TABLES_EFFECTIVE_FROM = "2016-01-01";

export const RC_TABLES_SOURCE_KEY = "rapid-city-fee-tables-100a-100c";
export const RC_CODE_SOURCE_KEY = "rapid-city-rcmc-15-04";

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
    effectiveFrom: RC_TABLES_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };
const NOT_RESIDENTIAL: FeeCondition = { field: "occupancy", op: "neq", value: "residential" };

/**
 * Table 100-A's printed bands. Band 1 is a flat $37.00 to $1,600; band 2 is
 * the one-dollar-wide sliver to $2,000 whose $39.00 value at the ceiling does
 * not chain into band 3's $45.00 base — both modelled as printed, the seam
 * documented. Every seam above ($25,000 / $50,000 / $100,000 / $500,000 /
 * $1,000,000) chains exactly: $252.00, $414.50, $639.50, $2,039.50, $3,539.50.
 */
const RESIDENTIAL_BANDS = [
  {
    baseCents: 3_700,
    floorCents: 0,
    ceilingCents: 160_000 as number | null,
    thresholdCents: 0,
    incrementCents: 100_000,
    centsPerThousand: 0, // flat row
    text: 'Table 100-A row 1: "$1.00 to $1,600.00 — $37.00." A flat band.',
  },
  {
    baseCents: 3_700,
    floorCents: 160_000,
    ceilingCents: 200_000 as number | null,
    thresholdCents: 160_000,
    incrementCents: 100_000,
    centsPerThousand: 200,
    text: 'Table 100-A row 2: "$1,601.00 to $2,000.00 — $37.00 for the first $1,600.00 plus $2.00 for each additional $1,000.00 or fraction thereof, to and including $2,000.00." A one-dollar-wide sliver: $39.00 at its ceiling, which does not chain into band 3\'s $45.00 base at $2,001 — modelled as printed and documented in the research file.',
  },
  {
    baseCents: 4_500,
    floorCents: 200_000,
    ceilingCents: 2_500_000 as number | null,
    thresholdCents: 200_000,
    incrementCents: 100_000,
    centsPerThousand: 900,
    text: 'Table 100-A row 3: "$2,001.00 to $25,000.00 — $45.00 for the first $2,000.00 plus $9.00 for each additional $1,000.00 or fraction thereof, to and including $25,000.00." The base is band 2\'s coverage point, not its ceiling value.',
  },
  {
    baseCents: 25_200,
    floorCents: 2_500_000,
    ceilingCents: 5_000_000 as number | null,
    thresholdCents: 2_500_000,
    incrementCents: 100_000,
    centsPerThousand: 650,
    text: 'Table 100-A row 4: "$25,001.00 to $50,000.00 — $252.00 for the first $25,000.00 plus $6.50 for each additional $1,000.00 or fraction thereof, to and including $50,000.00." $45.00 + 23 × $9.00 = $252.00.',
  },
  {
    baseCents: 41_450,
    floorCents: 5_000_000,
    ceilingCents: 10_000_000 as number | null,
    thresholdCents: 5_000_000,
    incrementCents: 100_000,
    centsPerThousand: 450,
    text: 'Table 100-A row 5: "$50,001.00 to $100,000.00 — $414.50 for the first $50,000.00 plus $4.50 for each additional $1,000.00 or fraction thereof, to and including $100,000.00." $252.00 + 25 × $6.50 = $414.50.',
  },
  {
    baseCents: 63_950,
    floorCents: 10_000_000,
    ceilingCents: 50_000_000 as number | null,
    thresholdCents: 10_000_000,
    incrementCents: 100_000,
    centsPerThousand: 350,
    text: 'Table 100-A row 6: "$100,001.00 to $500,000.00 — $639.50 for the first $100,000.00 plus $3.50 for each additional $1,000.00 or fraction thereof, to and including $500,000.00." $414.50 + 50 × $4.50 = $639.50.',
  },
  {
    baseCents: 203_950,
    floorCents: 50_000_000,
    ceilingCents: 100_000_000 as number | null,
    thresholdCents: 50_000_000,
    incrementCents: 100_000,
    centsPerThousand: 300,
    text: 'Table 100-A row 7: "$500,001.00 to $1,000,000.00 — $2,039.50 for the first $500,000.00 plus $3.00 for each additional $1,000.00 or fraction thereof, to and including $1,000,000.00." The PDF prints "$500,00.00" (missing a zero) — read as $500,001.00, the band above ending at $500,000. $639.50 + 400 × $3.50 = $2,039.50.',
  },
  {
    baseCents: 353_950,
    floorCents: 100_000_000,
    ceilingCents: null,
    thresholdCents: 100_000_000,
    incrementCents: 100_000,
    centsPerThousand: 200,
    text: 'Table 100-A row 8: "$1,000,001.00 and up — $3,539.50 for the first $1,000,000.00 plus $2.00 for each additional $1,000.00 or fraction thereof." $2,039.50 + 500 × $3.00 = $3,539.50 — the internal check on the read.',
  },
];

/**
 * Table 100-C's printed bands. The $2,000 seam chains here: $69.25 + 23 ×
 * $14.00 = $391.25; $391.25 + 25 × $10.10 = $643.75; $643.75 + 50 × $7.00 =
 * $993.75; $993.75 + 400 × $5.60 = $3,233.75; $3,233.75 + 500 × $4.75 =
 * $5,608.75.
 */
const COMMERCIAL_BANDS = [
  {
    baseCents: 3_700,
    floorCents: 0,
    ceilingCents: 160_000 as number | null,
    thresholdCents: 0,
    incrementCents: 100_000,
    centsPerThousand: 0, // flat row
    text: 'Table 100-C row 1: "$1.00 to $1,600.00 — $37.00." A flat band.',
  },
  {
    baseCents: 6_925,
    floorCents: 160_000,
    ceilingCents: 200_000 as number | null,
    thresholdCents: 160_000,
    incrementCents: 100_000,
    centsPerThousand: 0, // flat row as printed
    text: 'Table 100-C row 2: "$1,601.00 to $2,000.00 — $69.25." A flat row: the printed $32.25 jump from the $37.00 band below is the one non-chaining seam on this table.',
  },
  {
    baseCents: 6_925,
    floorCents: 200_000,
    ceilingCents: 2_500_000 as number | null,
    thresholdCents: 200_000,
    incrementCents: 100_000,
    centsPerThousand: 1_400,
    text: 'Table 100-C row 3: "$2,001.00 to $25,000.00 — $69.25 for the first $2,000.00 plus $14.00 for each additional $1,000.00 or fraction thereof, to and including $25,000.00."',
  },
  {
    baseCents: 39_125,
    floorCents: 2_500_000,
    ceilingCents: 5_000_000 as number | null,
    thresholdCents: 2_500_000,
    incrementCents: 100_000,
    centsPerThousand: 1_010,
    text: 'Table 100-C row 4: "$25,001.00 to $50,000.00 — $391.25 for the first $25,000.00 plus $10.10 for each additional $1,000.00 or fraction thereof, to and including $50,000.00." $69.25 + 23 × $14.00 = $391.25.',
  },
  {
    baseCents: 64_375,
    floorCents: 5_000_000,
    ceilingCents: 10_000_000 as number | null,
    thresholdCents: 5_000_000,
    incrementCents: 100_000,
    centsPerThousand: 700,
    text: 'Table 100-C row 5: "$50,001.00 to $100,000.00 — $643.75 for the first $50,000.00 plus $7.00 for each additional $1,000.00 or fraction thereof, to and including $100,000.00." $391.25 + 25 × $10.10 = $643.75.',
  },
  {
    baseCents: 99_375,
    floorCents: 10_000_000,
    ceilingCents: 50_000_000 as number | null,
    thresholdCents: 10_000_000,
    incrementCents: 100_000,
    centsPerThousand: 560,
    text: 'Table 100-C row 6: "$100,001.00 to $500,000.00 — $993.75 for the first $100,000.00 plus $5.60 for each additional $1,000.00 or fraction thereof, to and including $500,000.00." $643.75 + 50 × $7.00 = $993.75.',
  },
  {
    baseCents: 323_375,
    floorCents: 50_000_000,
    ceilingCents: 100_000_000 as number | null,
    thresholdCents: 50_000_000,
    incrementCents: 100_000,
    centsPerThousand: 475,
    text: 'Table 100-C row 7: "$500,001.00 to $1,000,000.00 — $3,233.75 for the first $500,000.00 plus $4.75 for each additional $1,000.00 or fraction thereof, to and including $1,000,000.00." $993.75 + 400 × $5.60 = $3,233.75.',
  },
  {
    baseCents: 560_875,
    floorCents: 100_000_000,
    ceilingCents: null,
    thresholdCents: 100_000_000,
    incrementCents: 100_000,
    centsPerThousand: 315,
    text: 'Table 100-C row 8: "$1,000,001.00 and up — $5,608.75 for the first $1,000,000.00 plus $3.15 for each additional $1,000.00 or fraction thereof." $3,233.75 + 500 × $4.75 = $5,608.75.',
  },
];

function bandRules(
  bands: typeof RESIDENTIAL_BANDS,
  opts: { prefix: string; codePrefix: string; occupancy: FeeCondition | null },
): FeeRuleRecord[] {
  return bands.map((band, i) =>
    rule(RC_TABLES_SOURCE_KEY, {
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

export const RC_BUILDING_RULES: FeeRuleRecord[] = [
  ...bandRules(RESIDENTIAL_BANDS, {
    prefix: "rc-bld-res",
    codePrefix: "BLD-RES",
    occupancy: RESIDENTIAL,
  }),
  ...bandRules(COMMERCIAL_BANDS, {
    prefix: "rc-bld-com",
    codePrefix: "BLD-COM",
    occupancy: NOT_RESIDENTIAL,
  }),
  rule(RC_TABLES_SOURCE_KEY, {
    id: "rc-bld-plan-review-res",
    code: "BLD-PLAN-REVIEW-RES-10",
    label: "Plan review — 10% of the building permit fee (1–2 family dwellings)",
    description:
      'Table 100-A row 6: "Plan review fees for 1 and 2 family dwellings and accessory structures shall be 10% of the building permit fee." Modelled on the building page so a project\'s plan review is charged exactly once; the commercial table prints the mirror row at 50%.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 1_000 },
    conditions: { all: [RESIDENTIAL, { field: "valuation", op: "gt", value: 0 }] },
  }),
  rule(RC_TABLES_SOURCE_KEY, {
    id: "rc-bld-plan-review-com",
    code: "BLD-PLAN-REVIEW-COM-50",
    label: "Plan review — 50% of the building permit fee (all other occupancies)",
    description:
      'Table 100-C row 7: "Plan review fees for all occupancies except 1 and 2 family dwellings shall be 50% of the building permit fee." Additional plan review for changed plans prices at the table\'s hourly event rows ($47.00/hr commercial, $42.00/hr residential) — named, not charged.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 5_000 },
    conditions: { all: [NOT_RESIDENTIAL, { field: "valuation", op: "gt", value: 0 }] },
  }),
];

/**
 * The trade pages model the building permit's own price for trade-scale
 * stand-alone work. RCMC Chapters 15.16 (electrical), 15.24 (plumbing) and
 * their mechanical/gas siblings print no fee tables — each defers to
 * § 15.04.320's council-resolution mechanism, and the two published Table PDFs
 * are the residential and commercial *building* ladders only. A stand-alone
 * trade job on an existing building is still a building-permit application
 * priced by declared valuation; the commercial table is the one that applies
 * ("all occupancies except 1 and 2 family dwellings" — a trade fit-out is not
 * a dwelling), so these rule sets carry Table 100-C without the plan-review
 * rows, which attach to building-permit submittals.
 */
function tradeBandRules(prefix: string, codePrefix: string): FeeRuleRecord[] {
  return COMMERCIAL_BANDS.map((band, i) =>
    rule(RC_TABLES_SOURCE_KEY, {
      id: `${prefix}-band-${i + 1}`,
      code: `${codePrefix}-${i + 1}`,
      label: `Trade-scale permit valuation band ${i + 1} (Table 100-C)`,
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

export const RC_ELECTRICAL_RULES: FeeRuleRecord[] = tradeBandRules("rc-elec", "ELEC-RC");

export const RC_PLUMBING_RULES: FeeRuleRecord[] = tradeBandRules("rc-pl", "PL-RC");
