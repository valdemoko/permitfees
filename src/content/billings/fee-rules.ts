import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Billings, Montana fee rules — REAL DATA.
 *
 * Source: City Council Resolution 26-11315, "Setting Building, Electrical,
 * Plumbing, Mechanical, and Fire System Permit Fees" — adopted February 23,
 * 2026 (APPROVED 11-0), effective on passage by its own § 7, repealing
 * Resolution 11-19068 (2011). The 2026 resolution is a fee reduction
 * (staff-estimated 23–31% across the board) and consolidates the building
 * schedule into ONE ladder for both occupancies. The adopted PDF is an
 * image-only scan whose page 1 was read visually in the browser and matches
 * the Gazette's published draft (a text-layer PDF of the same instrument)
 * word for word; every amount below traces to that text. See
 * research/montana/billings.md for the access record and the seam checks
 * (the building ladder chains exactly at every seam).
 *
 * Mechanisms: one eight-band valuation ladder for residential AND commercial;
 * plan review at 60% of the permit fee, commercial only (the residential
 * plan-review fee was eliminated in the consolidation); electrical as
 * residential flat rows (service-size and multi-family conditions) plus a
 * five-band commercial project-cost ladder with marginal rates; plumbing as a
 * $20.00 issuance plus unit rows (read out of the scanned PDF by word
 * coordinates — see the research file's coordinate dump).
 *
 * Verified: 2026-09-26.
 */

export const BILL_RES_EFFECTIVE_FROM = "2026-02-23";

export const BILL_RES_SOURCE_KEY = "billings-res-26-11315";

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
    effectiveFrom: BILL_RES_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };
const NOT_RESIDENTIAL: FeeCondition = { field: "occupancy", op: "neq", value: "residential" };

function all(...conditions: FeeCondition[]): FeeCondition {
  return { all: conditions };
}

/**
 * § 1's consolidated ladder. The bands chain exactly: $45 + 23 × $8.00 =
 * $229.00; $229 + 25 × $5.00 = $354.00; $354 + 50 × $3.50 = $529.00; $529 +
 * 400 × $2.50 = $1,529.00; $1,529 + 500 × $2.00 = $2,529.00; $2,529 + 4,000 ×
 * $1.75 = $9,529.00 — the internal check on the read.
 */
const BUILDING_BANDS = [
  {
    baseCents: 4_500,
    floorCents: 0,
    ceilingCents: 200_000 as number | null,
    thresholdCents: 0,
    incrementCents: 100_000,
    centsPerThousand: 0, // flat row
    text: '§ 1: "$1 – $2,000 — 45.00." A flat band.',
  },
  {
    baseCents: 4_500,
    floorCents: 200_000,
    ceilingCents: 2_500_000 as number | null,
    thresholdCents: 200_000,
    incrementCents: 100_000,
    centsPerThousand: 800,
    text: '"$2,001 – $25,000 — 45.00 for the first $2,000 plus 8.00 for each additional $1,000 or fraction."',
  },
  {
    baseCents: 22_900,
    floorCents: 2_500_000,
    ceilingCents: 5_000_000 as number | null,
    thresholdCents: 2_500_000,
    incrementCents: 100_000,
    centsPerThousand: 500,
    text: '"$25,001 to $50,000 — 229.00 for the first $25,000 plus 5.00 for each additional $1,000 or fraction." $45 + 23 × $8.00 = $229.00.',
  },
  {
    baseCents: 35_400,
    floorCents: 5_000_000,
    ceilingCents: 10_000_000 as number | null,
    thresholdCents: 5_000_000,
    incrementCents: 100_000,
    centsPerThousand: 350,
    text: '"$50,001 to $100,000 — 354.00 for the first $50,000 plus 3.50 for each additional $1,000 or fraction." $229 + 25 × $5.00 = $354.00.',
  },
  {
    baseCents: 52_900,
    floorCents: 10_000_000,
    ceilingCents: 50_000_000 as number | null,
    thresholdCents: 10_000_000,
    incrementCents: 100_000,
    centsPerThousand: 250,
    text: '"$100,001 to $500,000 — 529.00 for the first $100,000 plus 2.50 for each additional $1,000 or fraction." $354 + 50 × $3.50 = $529.00.',
  },
  {
    baseCents: 152_900,
    floorCents: 50_000_000,
    ceilingCents: 100_000_000 as number | null,
    thresholdCents: 50_000_000,
    incrementCents: 100_000,
    centsPerThousand: 200,
    text: '"$500,001 to $1,000,000 — 1,529.00 for the first $500,000 plus 2.00 for each additional $1,000 or fraction." $529 + 400 × $2.50 = $1,529.00.',
  },
  {
    baseCents: 252_900,
    floorCents: 100_000_000,
    ceilingCents: 500_000_000 as number | null,
    thresholdCents: 100_000_000,
    incrementCents: 100_000,
    centsPerThousand: 175,
    text: '"$1,000,001 to $5,000,000 — 2,529.00 for the first $1,000,000 plus 1.75 for each additional $1,000 or fraction." $1,529 + 500 × $2.00 = $2,529.00.',
  },
  {
    baseCents: 952_900,
    floorCents: 500_000_000,
    ceilingCents: null,
    thresholdCents: 500_000_000,
    incrementCents: 100_000,
    centsPerThousand: 150,
    text: '"$5,000,001 and over — 9,529.00 for the first $5,000,000 plus 1.50 for each additional $1,000 or fraction." $2,529 + 4,000 × $1.75 = $9,529.00.',
  },
];

function bandRules(prefix: string, codePrefix: string): FeeRuleRecord[] {
  return BUILDING_BANDS.map((band, i) =>
    rule(BILL_RES_SOURCE_KEY, {
      id: `${prefix}-band-${i + 1}`,
      code: `${codePrefix}-${i + 1}`,
      label: `Building permit valuation band ${i + 1} (both occupancies)`,
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

export const BILL_BUILDING_RULES: FeeRuleRecord[] = [
  ...bandRules("bill-bld", "BLD"),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-bld-plan-review-60",
    code: "BLD-PLAN-REVIEW-60",
    label: "Commercial plan review — 60% of the permit fee",
    description:
      '§ 1, final line: "COMMERCIAL PLAN REVIEW FEE SHALL BE ASSESSED AT 60% OF THE PERMIT FEE." The 2026 consolidation reduced this from 65% and ELIMINATED the residential plan-review fee entirely — the rule answers only on non-residential occupancy (custom.plan_review). Additional plan review for changed plans prices at § 6\'s $75.00/hr with a half-hour minimum — named, not charged.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 6_000 },
    conditions: {
      all: [
        NOT_RESIDENTIAL,
        { field: "custom.plan_review", op: "eq", value: true },
      ],
    },
  }),
];

export const BILL_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // ---- Residential flat rows (§ 2.A–L) ----
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-sfd-300",
    code: "ELEC-SFD-100-300A",
    label: "Single-family dwelling, 100–300 A service — $130.00",
    description:
      "§ 2.A: Single Family Dwelling (includes garage wired at same time), 100 to 300 amp service — $130.00.",
    feeType: "flat",
    config: { amountCents: 13_000 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dsf", op: "absent" },
        { field: "custom.mf_per_building", op: "absent" },
      ],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-sfd-301",
    code: "ELEC-SFD-301A",
    label: "Single-family dwelling, 301+ A service — $200.00",
    description: "§ 2.A: 301 or more amp service — $200.00.",
    feeType: "flat",
    config: { amountCents: 20_000 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.dsf", op: "eq", value: true },
      ],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-rewire",
    code: "ELEC-REWIRE-OR-ADDITION",
    label: "Interior rewire only or new addition to home — $40.00",
    description: "§ 2.B: Interior Rewire Only or New Addition to Home — $40.00.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "in", value: ["alteration", "remodel", "addition"] },
        { field: "custom.service_change", op: "absent" },
      ],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-service-change",
    code: "ELEC-SERVICE-CHANGE",
    label: "Residential change of service — $25.00",
    description: "§ 2.C: Residential Change of Service — $25.00.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: {
      all: [RESIDENTIAL, { field: "custom.service_change", op: "eq", value: true }],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-mf-building",
    code: "ELEC-MF-BUILDING",
    label: "Multi-family dwellings, per building — $100.00",
    description:
      "§ 2.K: Multi-family Dwellings Per Building — $100.00, plus per unit up to and including 12 units — $40.00. Over 12 units under one roof uses the commercial project-cost ladder (the per-unit row below carries the 12-unit cap).",
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: {
      all: [RESIDENTIAL, { field: "custom.mf_per_building", op: "eq", value: true }],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-mf-unit",
    code: "ELEC-MF-UNIT",
    label: "Multi-family dwellings, per unit (up to 12 units) — $40.00",
    description:
      "§ 2.K's per-unit row: $40.00 per unit up to and including 12 units, reading the units fact with the 12-unit cap as a condition.",
    feeType: "per_unit",
    config: { unit: "dwelling_units", centsPerUnit: 4_000, thresholdUnits: 0 },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "units", op: "gt", value: 0 },
        { field: "units", op: "lte", value: 12 },
        { field: "custom.mf_per_building", op: "eq", value: true },
      ],
    },
  }),

  // ---- Commercial project-cost ladder (§ 2, COMMERCIAL ELECTRICAL PERMIT FEES) ----
  // Each row is "X for the first A plus r% of balance" — algebraically r×v +
  // (X − r×A), so each band models as a single marginal rate over the whole
  // valuation with base (X − r×A), and the bands' conditions keep them
  // mutually exclusive. The seams chain exactly: $30+6%×$500=$60.00; $60+2%×
  // $9,000=$240.00; $240+0.5%×$40,000=$440.00.
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-com-1",
    code: "ELEC-COM-1",
    label: "Commercial electrical, project cost $0–$500 — $30.00",
    description: "§ 2 COMMERCIAL ELECTRICAL PERMIT FEES: $0 – $500 — $30.00.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 0 },
        { field: "valuation", op: "lte", value: 50_000 },
      ],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-com-2",
    code: "ELEC-COM-2",
    label: "Commercial electrical, $501–$1,000 — $30 + 6% of balance",
    description:
      '"$501 – $1,000 — 30.00 for first $500 plus 6% of balance." $30 + 0.06 × $500 = $60.00 at the ceiling.',
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 0, // $30 = 6% of $500, so the row is a pure 6% marginal rate
      tiers: [{ upToCents: 100_000, rateBps: 600 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 50_000 },
        { field: "valuation", op: "lte", value: 100_000 },
      ],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-com-3",
    code: "ELEC-COM-3",
    label: "Commercial electrical, $1,001–$10,000 — $60 + 2% of balance",
    description:
      '"$1,001 – $10,000 — 60.00 for first $1,000 plus 2% of balance." $60 + 0.02 × $9,000 = $240.00 at the ceiling.',
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 4_000, // $60 − 2% × $1,000
      tiers: [{ upToCents: 1_000_000, rateBps: 200 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 100_000 },
        { field: "valuation", op: "lte", value: 1_000_000 },
      ],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-com-4",
    code: "ELEC-COM-4",
    label: "Commercial electrical, $10,001–$50,000 — $240 + 0.5% of balance",
    description:
      '"$10,001 – $50,000 — 240.00 for first $10,000 plus 0.5% of balance." $240 + 0.005 × $40,000 = $440.00 at the ceiling.',
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 19_000, // $240 − 0.5% × $10,000
      tiers: [{ upToCents: 5_000_000, rateBps: 50 }],
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 1_000_000 },
        { field: "valuation", op: "lte", value: 5_000_000 },
      ],
    },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-elec-com-5",
    code: "ELEC-COM-5",
    label: "Commercial electrical, $50,001 or more — $440 + 0.3% of balance",
    description:
      '"$50,001 – or more — 440.00 for first $50,000 plus 0.3% of balance." Open-ended at 0.3% (30 bps).',
    feeType: "tiered_marginal",
    config: {
      basis: "valuation",
      baseCents: 29_000, // $440 − 0.3% × $50,000
      tiers: [{ upToCents: null, rateBps: 30 }],
    },
    conditions: { all: [{ field: "valuation", op: "gt", value: 5_000_000 }] },
  }),
];

export const BILL_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-pl-issuance",
    code: "PL-ISSUANCE",
    label: "Plumbing permit issuance — $20.00",
    description:
      "§ 3: For the issuance of each permit — $20.00. (The section's unit rows stack on this issuance fee.)",
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 2_000 },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-pl-fixtures",
    code: "PL-FIXTURES",
    label: "Each plumbing fixture or trap (incl. water, drainage, backflow) — $15.00",
    description:
      "§ 3.A: For each plumbing fixture or trap or set of fixtures on one trap (including water, drainage piping, and backflow protection) — $15.00.",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 1_500 },
    conditions: { all: [{ field: "fixtures", op: "gt", value: 0 }] },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-pl-building-sewer",
    code: "PL-BUILDING-SEWER",
    label: "Each building sewer or trailer park sewer — $7.00",
    description: "§ 3.B: For each building sewer and each trailer park sewer — $7.00.",
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 700 },
    conditions: { all: [{ field: "custom.connections", op: "gt", value: 0 }] },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-pl-water-heater",
    code: "PL-WATER-HEATER",
    label: "Each water heater and/or vent — $5.00",
    description: "§ 3.F: For each water heater and/or vent — $5.00.",
    feeType: "per_unit",
    config: { unit: "water_heaters", centsPerUnit: 500 },
    conditions: { all: [{ field: "custom.water_heaters", op: "gt", value: 0 }] },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-pl-gas-system",
    code: "PL-GAS-SYSTEM",
    label: "Each gas-piping system of one to five outlets — $1.00",
    description:
      "§ 3.G: For each gas-piping system of one to five outlets — $1.00, with § 3.H at $7.00 per additional outlet (named, not modelled — the additional-outlet count has no distinct engine fact).",
    feeType: "per_unit",
    config: { unit: "gas_service_lines", centsPerUnit: 100 },
    conditions: { all: [{ field: "custom.gas_service_lines", op: "gt", value: 0 }] },
  }),
  rule(BILL_RES_SOURCE_KEY, {
    id: "bill-pl-backflow-small",
    code: "PL-BACKFLOW-SMALL",
    label: "Backflow device, 2 inch and smaller — $7.00",
    description:
      "§ 3.N: For each backflow protective device other than atmospheric-type vacuum breakers, 2 inch diameter and smaller — $7.00 (over 2 inch: $15.00, recorded).",
    feeType: "per_unit",
    config: { unit: "backflow_devices", centsPerUnit: 700 },
    conditions: { all: [{ field: "custom.backflow_devices", op: "gt", value: 0 }] },
  }),
];
