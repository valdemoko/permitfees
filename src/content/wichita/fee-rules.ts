import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Wichita, Kansas fee rules — REAL DATA.
 *
 * Source: the MABCD fee tables — "Fee Table B" (Building Permit Fees, Rev.
 * 5/8/2019), "Fee Table I" (Uniform Electrical Code Fees, Rev. 5/9/2019) and
 * "Fee Table H" (Uniform Plumbing Code Fees, Rev. 5/9/2019), published on the
 * MABCD Fees page and carried into code by the Wichita-Sedgwick County Unified
 * Building and Trade Code (UBTC), whose §109.5.1 sets the plan review at 60% of
 * the building permit fee (Ordinance No. 52-564 amendment text). See
 * research/kansas/wichita.md for the access record (sedgwickcounty.org times
 * out plain scripted requests; every document retrieved intact via reader
 * proxy) and the seam check on the Table B ladder, which chains exactly.
 *
 * Mechanisms: residential new construction prices by area ($0.38/finished sq
 * ft + $0.30/unfinished sq ft); everything else on the eight-band Table B §2
 * valuation ladder that rounds the excess up to the band's own increment ("or
 * fraction thereof"); plan review 60% of the permit fee in the plan-review
 * path; both trades are item price lists (each row a count × price) plus a
 * $25.00 permit issuance fee, with Table I/H's own one/two-family bundling
 * note standing the trade permit down on bundled dwellings. Only the item
 * rows whose counts map to engine per-unit facts one-to-one are modelled (the
 * engine gives every kind its own fact, so two rows cannot share one count);
 * the rest of Tables I and H are priced in the research file.
 *
 * Verified: 2026-09-26.
 */

export const ICT_FEE_EFFECTIVE_FROM = "2019-05-09";

export const ICT_SOURCE_KEY = "mabcd-fee-tables-2019";
export const ICT_UBTC_SOURCE_KEY = "wichita-ubtc-ordinance-52-564";

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
    effectiveFrom: ICT_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };

/**
 * Table I / Table H, each: "electrical/plumbing work done in conjunction with
 * a building project covered by a building permit for a one- or two-family
 * dwelling new construction, repair, remodel or addition is covered and
 * permitted under the authority granted by the building permit and does not
 * require a separate … permit."
 */
const NOT_BUNDLED: FeeCondition = { field: "custom.trade_bundled", op: "absent" };

/**
 * Table B §2's printed bands: base, floor, ceiling, and the increment each
 * band's excess rounds up to ("or fraction thereof"). The bands chain exactly
 * — $40 + 10×$3 = $70; $70 + 38×$11 = $488; $488 + 60×$9 = $1,028; $1,028 +
 * 400×$7 = $3,828; $3,828 + 500×$5 = $6,328; $6,328 + 4,000×$3 = $18,328 —
 * which is the internal check on the read.
 */
const TABLE_B_BANDS = [
  {
    baseCents: 4_000,
    floorCents: 0,
    ceilingCents: 100_000 as number | null,
    incrementCents: 10_000,
    centsPerThousand: 0, // the printed row is a flat $40.00 to $1,000 — no steps inside it
    text: '"$1.00 to $1,000.00 — $40.00." A flat row; the $100 steps begin at $1,000.01.',
  },
  {
    baseCents: 4_000,
    floorCents: 100_000,
    ceilingCents: 200_000 as number | null,
    incrementCents: 10_000,
    centsPerThousand: 300,
    text: '"$1,000.01 to $2,000.00 — $40.00 for the first $1,000.00 plus $3.00 for each additional $100.00, or fraction thereof, to and including $2,000.00."',
  },
  {
    baseCents: 7_000,
    floorCents: 200_000,
    ceilingCents: 4_000_000 as number | null,
    incrementCents: 100_000,
    centsPerThousand: 1_100,
    text: '"$2,000.01 to $40,000.00 — $70.00 for the first $2,000.00 plus $11.00 for each additional $1,000.00, or fraction thereof, to and including $40,000.00."',
  },
  {
    baseCents: 48_800,
    floorCents: 4_000_000,
    ceilingCents: 10_000_000 as number | null,
    incrementCents: 100_000,
    centsPerThousand: 900,
    text: '"$40,000.01 to $100,000.00 — $488.00 for the first $40,000.00 plus $9.00 for each additional $1,000.00, or fraction thereof, to and including $100,000.00."',
  },
  {
    baseCents: 102_800,
    floorCents: 10_000_000,
    ceilingCents: 50_000_000 as number | null,
    incrementCents: 100_000,
    centsPerThousand: 700,
    text: '"$100,000.01 to $500,000.00 — $1,028.00 for the first $100,000.00 plus $7.00 for each additional $1,000.00, or fraction thereof, to and including $500,000.00."',
  },
  {
    baseCents: 382_800,
    floorCents: 50_000_000,
    ceilingCents: 100_000_000 as number | null,
    incrementCents: 100_000,
    centsPerThousand: 500,
    text: '"$500,000.01 to $1,000,000.00 — $3,828.00 for the first $500,000.00 plus $5.00 for each additional $1,000.00, or fraction thereof, to and including $1,000,000.00."',
  },
  {
    baseCents: 632_800,
    floorCents: 100_000_000,
    ceilingCents: 500_000_000 as number | null,
    incrementCents: 100_000,
    centsPerThousand: 300,
    text: '"$1,000,000.01 to $5,000,000.00 — $6,328.00 for the first $1,000,000.00 plus $3.00 for each additional $1,000.00, or fraction thereof, to and including $5,000,000.00."',
  },
  {
    baseCents: 1_832_800,
    floorCents: 500_000_000,
    ceilingCents: null,
    incrementCents: 100_000,
    centsPerThousand: 225,
    text: '"$5,000,000.01 and up — $18,328.00 for the first $5,000,000.00 plus $2.25 for each additional $1,000.00, or fraction thereof."',
  },
];

export const ICT_BUILDING_RULES: FeeRuleRecord[] = [
  // ---- Residential new build: Table B §1, per-square-foot ----
  rule(ICT_SOURCE_KEY, {
    id: "ict-bld-res-new-finished",
    code: "BLD-RES-FINISHED",
    label: "Residential new build — $0.38 per finished square foot",
    description:
      'Table B §1: "On Residential New Build, the building permit shall be 38 cents for each square foot of finished space and 30 cents for each square foot of unfinished space." The MABCD Permits page restates: "$0.38 per finished square foot of area." Basement and garage areas are the unfinished space of the second row, not double-counted here.',
    feeType: "percent",
    config: {
      basis: "square_footage",
      // $0.38 per square foot: the fraction multiplies the raw area and the
      // product is cents, so 38¢ lands in the numerator as 3,800/100.
      rate: { numerator: 3_800, denominator: 100 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "square_footage", op: "gt", value: 0 },
      ],
    },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-bld-res-new-unfinished",
    code: "BLD-RES-UNFINISHED",
    label: "Residential new build — $0.30 per unfinished square foot",
    description:
      'Table B §1: "30 cents for each square foot of unfinished space." The MABCD Permits page names what the unfinished space is: "unfinished basements, attached garages, covered porches, and decks." Its area reads the covered-area basis — the engine\'s second area — so the two areas of one dwelling are never one number.',
    feeType: "percent",
    config: {
      basis: "covered_square_footage",
      // $0.30 per square foot — same cents-in-numerator reading as the finished row.
      rate: { numerator: 3_000, denominator: 100 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [
        RESIDENTIAL,
        { field: "work_type", op: "eq", value: "new_construction" },
        { field: "custom.covered_square_footage", op: "gt", value: 0 },
      ],
    },
  }),

  // ---- Table B §2: the valuation ladder, carrying commercial new build and
  // every remodel or rebuild of either class (Table B §3 sends remodels
  // here by its own words). Not occupancy-gated: the residential-new rows
  // above are keyed on work_type, so a remodel cannot answer them. ----
  ...TABLE_B_BANDS.map((band, i) =>
    rule(ICT_SOURCE_KEY, {
      id: `ict-bld-table-b-${i + 1}`,
      code: `BLD-TABLE-B-${i + 1}`,
      label: `Building permit, Table B valuation band ${i + 1}`,
      description: band.text,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: band.baseCents,
        thresholdCents: band.floorCents,
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

  // ---- Plan review, 60% of the building permit fee (UBTC §109.5.1) ----
  rule(ICT_UBTC_SOURCE_KEY, {
    id: "ict-bld-plan-review-60",
    code: "BLD-PLAN-REVIEW-60",
    label: "Plan review — 60% of the building permit fee",
    description:
      'UBTC §109.5.1 (Ordinance No. 52-564 amendment): "said plan review fee shall be 60 percent of the building permit fee as shown in Tables B and C … in addition to the building permit fees." MABCD sequences commercial work through a Plan Review Application first, so the rule answers when the project is declared in the plan-review path (custom.plan_review). Additional plan review for incomplete or changed plans prices at Table D\'s hourly rate — named, not charged.',
    feeType: "percent",
    componentType: "plan_review",
    priority: 200,
    config: { basis: "permit_fee", rateBps: 6_000 },
    conditions: {
      all: [
        { field: "custom.plan_review", op: "eq", value: true },
        { field: "valuation", op: "gt", value: 100_000 },
      ],
    },
  }),
];

export const ICT_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(ICT_SOURCE_KEY, {
    id: "ict-elec-issuance",
    code: "ELEC-ISSUANCE",
    label: "Electrical permit issuance fee — $25.00",
    description: 'Table I: "Permit Issuance Fee — $25.00."',
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 2_500 },
    conditions: { all: [NOT_BUNDLED] },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-elec-circuits",
    code: "ELEC-CIRCUITS",
    label: "Circuits (120 V or 277 V) — $2.00 each",
    description:
      'Table I items 1–2: "120 volt Circuit — $2.00; 277 volt Circuit — $2.00." One price for either class, so one count.',
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 200 },
    conditions: {
      all: [NOT_BUNDLED, { field: "custom.circuits", op: "gt", value: 0 }],
    },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-elec-outlets-added",
    code: "ELEC-OUTLETS-ADDED",
    label: "Outlets added to existing circuits — $0.75 each",
    description:
      'Table I item 11: "Outlets Added to Existing Circuit — $0.75." The count reads the outlets fact the engine keys.',
    feeType: "per_unit",
    config: { unit: "outlets", centsPerUnit: 75 },
    conditions: {
      all: [NOT_BUNDLED, { field: "custom.outlets", op: "gt", value: 0 }],
    },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-elec-fixtures",
    code: "ELEC-FIXTURES",
    label: "Light fixtures or lampholding devices (incl. retrofits) — $0.75 each",
    description:
      'Table I item 13: "Light Fixture or Lampholding Device (also retrofits of fixtures) — $0.75."',
    feeType: "per_unit",
    config: { unit: "lighting_fixtures", centsPerUnit: 75 },
    conditions: {
      all: [NOT_BUNDLED, { field: "custom.lighting_fixtures", op: "gt", value: 0 }],
    },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-elec-meters",
    code: "ELEC-METERS",
    label: "Service, 480 V or less (100 A or less), per meter — $11.00",
    description:
      'Table I item 17a: "480 volts or less, Per Meter (100 Amps or less) — $11.00." Each additional amp above the meter\'s first 100 is item 17b at $0.06 — named, not charged (it prices a meter upgrade, not a permit row).',
    feeType: "per_unit",
    config: { unit: "meters", centsPerUnit: 1_100 },
    conditions: {
      all: [NOT_BUNDLED, { field: "custom.meters", op: "gt", value: 0 }],
    },
  }),
];

export const ICT_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(ICT_SOURCE_KEY, {
    id: "ict-pl-issuance",
    code: "PL-ISSUANCE",
    label: "Plumbing permit issuance fee — $25.00",
    description: 'Table H: "Permit Issuance Fee — $25.00."',
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 2_500 },
    conditions: { all: [NOT_BUNDLED] },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-pl-waste-openings",
    code: "PL-WASTE-OPENINGS",
    label: "Waste openings — $4.50 each",
    description: 'Table H item 1: "Waste Openings — $4.50."',
    feeType: "per_unit",
    config: { unit: "openings", centsPerUnit: 450 },
    conditions: {
      all: [NOT_BUNDLED, { field: "custom.openings", op: "gt", value: 0 }],
    },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-pl-water-services",
    code: "PL-WATER-SERVICES",
    label: "Water service, new or replacement — $5.00 each",
    description: 'Table H item 7: "Water Service New or Replacement — $5.00."',
    feeType: "per_unit",
    config: { unit: "water_service_connections", centsPerUnit: 500 },
    conditions: {
      all: [NOT_BUNDLED, { field: "custom.water_service_connections", op: "gt", value: 0 }],
    },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-pl-water-heaters",
    code: "PL-WATER-HEATERS",
    label: "Water heaters, new or replacement — $9.00 each",
    description:
      'Table H item 9: "Water Heater New or Replacement — $9.00." The count reads the special-device fact the engine keys — this table\'s named-appliance row and its nearest unit.',
    feeType: "per_unit",
    config: { unit: "special_devices", centsPerUnit: 900 },
    conditions: {
      all: [NOT_BUNDLED, { field: "custom.special_devices", op: "gt", value: 0 }],
    },
  }),
  rule(ICT_SOURCE_KEY, {
    id: "ict-pl-backflow",
    code: "PL-BACKFLOW",
    label: "Backflow devices — $5.00 each",
    description: 'Table H item 10: "Backflow Device — $5.00."',
    feeType: "per_unit",
    config: { unit: "backflow_devices", centsPerUnit: 500 },
    conditions: {
      all: [NOT_BUNDLED, { field: "custom.backflow_devices", op: "gt", value: 0 }],
    },
  }),
];
