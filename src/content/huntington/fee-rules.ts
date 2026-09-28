import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Huntington, West Virginia fee rules — REAL DATA.
 *
 * Source: City of Huntington, "Building Permit Fees" page, which hosts the full
 * valuation ladder PDF (cityofhuntington.com/business/building-permit/building-permit-fees/).
 * The document's own header: "The fee schedule is outlined in Section 108.2 of the
 * International Building Code 2000 and requires a fee for each plan examination,
 * building permit, and inspection ... The permit fee is calculated based on the
 * total project cost (labor and materials). An additional $20 application fee is
 * required per building permit."
 *
 * The PDF has a text layer and was read with pdftotext; every printed row is
 * reproduced by the five segments below (see research/west-virginia/huntington.md):
 *
 *   $0–$499 ............... $0.00
 *   $500–$1,100 ........... $20.00 flat
 *   $1,101–$2,000 ......... $20.00 + $1.50 per $100 band
 *   $2,001–$25,000 ........ $32.50 + $6.00 per $1,000 band
 *   $25,001–$30,000 ....... $170.50 + $4.50 per $1,000 band
 *   $30,001–$44,000 ....... $193.00 + $4.50 per $1,000 band
 *   $44,001–$50,000 ....... four printed bands at $4.00/$5.00/$4.00/$5.00/$4.50/$4.50
 *   $50,001–$100,000 ...... $283.00 + $3.00 per $1,000 band
 *   above $100,000 ........ $433.00 + $2.50 per $1,000 and each part thereof
 *
 * The middle of the table is not one arithmetic — its steps move between $4.00 and
 * $5.00 — so the bands that do not chain are carried as the schedule prints them.
 *
 * Verified: 2026-09-27.
 */

export const HU_FEE_EFFECTIVE_FROM = "2026-09-27"; // the schedule is undated; dated honestly at the read date
export const HU_SOURCE_KEY = "huntington-building-fee-schedule";

function rule(
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
    effectiveFrom: HU_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: HU_SOURCE_KEY,
    ...overrides,
  };
}

const LADDER_DESCRIPTION =
  "City of Huntington Building Permit Fee Schedule (IBC 2000 §108.2), read from the PDF's own printed rows. The schedule prices total project cost (labor and materials).";

/**
 * The valuation ladder, built once per permit type so each trade's rules carry their
 * own ids while charging the same published figures. The division's published
 * material is a single combined schedule for "each plan examination, building
 * permit, and inspection" and its inspectors cover building, electrical and
 * plumbing alike; research/west-virginia/huntington.md records that decision — the
 * city publishes no trade-specific table — and the pages say so in prose.
 */
function ladder(prefix: string): FeeRuleRecord[] {
  const p = prefix.toUpperCase();
  return [
    rule({
      id: `${prefix}-zero`,
      code: `${p}-ZERO`,
      label: "Project cost $0–$499 (no fee, $0.00)",
      description: `${LADDER_DESCRIPTION} The table's first row prints $0.00 for $0.00–$499.00.`,
      feeType: "flat",
      config: { amountCents: 0 },
      conditions: { all: [{ field: "valuation", op: "lte", value: 49_999 }] },
    }),
    rule({
      id: `${prefix}-flat-20`,
      code: `${p}-FLAT-20`,
      label: "Project cost $500–$1,100 ($20.00 flat)",
      description: `${LADDER_DESCRIPTION} $500.00–$1,100.00 prints a flat $20.00.`,
      feeType: "flat",
      config: { amountCents: 2_000 },
      conditions: {
        all: [
          { field: "valuation", op: "gte", value: 50_000 },
          { field: "valuation", op: "lte", value: 110_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-1101-2000`,
      code: `${p}-1101-2000`,
      label: "Project cost $1,101–$2,000 ($20.00 + $1.50 per $100 band)",
      description: `${LADDER_DESCRIPTION} Nine printed $100-wide bands rising $1.50 from $20.50 at $1,101 to $32.50 at $2,000.`,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 2_000,
        thresholdCents: 110_000,
        incrementCents: 10_000,
        centsPerThousand: 1_500,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 110_000 },
          { field: "valuation", op: "lte", value: 200_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-2001-25000`,
      code: `${p}-2001-25000`,
      label: "Project cost $2,001–$25,000 ($32.50 + $6.00 per $1,000 band)",
      description: `${LADDER_DESCRIPTION} Twenty-three printed $1,000 bands rising $6.00 from $38.50 at $2,001 to $170.50 at $25,000.`,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 3_250,
        thresholdCents: 200_000,
        incrementCents: 100_000,
        centsPerThousand: 600,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 200_000 },
          { field: "valuation", op: "lte", value: 2_500_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-25001-30000`,
      code: `${p}-25001-30000`,
      label: "Project cost $25,001–$30,000 ($170.50 + $4.50 per $1,000 band)",
      description: `${LADDER_DESCRIPTION} Five printed bands rising $4.50 from $175.00 at $25,001 to $193.00 at $30,000.`,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 17_050,
        thresholdCents: 2_500_000,
        incrementCents: 100_000,
        centsPerThousand: 450,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 2_500_000 },
          { field: "valuation", op: "lte", value: 3_000_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-30001-44000`,
      code: `${p}-30001-44000`,
      label: "Project cost $30,001–$44,000 ($193.00 + $4.50 per $1,000 band)",
      description: `${LADDER_DESCRIPTION} Fourteen printed bands rising $4.50 from $197.50 at $30,001 to $256.00 at $44,000.`,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 19_300,
        thresholdCents: 3_000_000,
        incrementCents: 100_000,
        centsPerThousand: 450,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 3_000_000 },
          { field: "valuation", op: "lte", value: 4_400_000 },
        ],
      },
    }),
    // From here the printed steps change between $4.00, $4.50 and $5.00, so each
    // band is stated at its own printed base rather than derived.
    rule({
      id: `${prefix}-44001-45000`,
      code: `${p}-44001-45000`,
      label: "Project cost $44,001–$45,000 ($260.00 flat band)",
      description: `${LADDER_DESCRIPTION} The printed row for $44,001.00–$45,000.00 is $260.00.`,
      feeType: "flat",
      config: { amountCents: 26_000 },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 4_400_000 },
          { field: "valuation", op: "lte", value: 4_500_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-45001-46000`,
      code: `${p}-45001-46000`,
      label: "Project cost $45,001–$46,000 ($265.00 flat band)",
      description: `${LADDER_DESCRIPTION} The printed row for $45,001.00–$46,000.00 is $265.00.`,
      feeType: "flat",
      config: { amountCents: 26_500 },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 4_500_000 },
          { field: "valuation", op: "lte", value: 4_600_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-46001-47000`,
      code: `${p}-46001-47000`,
      label: "Project cost $46,001–$47,000 ($269.00 flat band)",
      description: `${LADDER_DESCRIPTION} The printed row for $46,001.00–$47,000.00 is $269.00.`,
      feeType: "flat",
      config: { amountCents: 26_900 },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 4_600_000 },
          { field: "valuation", op: "lte", value: 4_700_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-47001-48000`,
      code: `${p}-47001-48000`,
      label: "Project cost $47,001–$48,000 ($274.00 flat band)",
      description: `${LADDER_DESCRIPTION} The printed row for $47,001.00–$48,000.00 is $274.00.`,
      feeType: "flat",
      config: { amountCents: 27_400 },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 4_700_000 },
          { field: "valuation", op: "lte", value: 4_800_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-48001-49000`,
      code: `${p}-48001-49000`,
      label: "Project cost $48,001–$49,000 ($278.50 flat band)",
      description: `${LADDER_DESCRIPTION} The printed row for $48,001.00–$49,000.00 is $278.50.`,
      feeType: "flat",
      config: { amountCents: 27_850 },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 4_800_000 },
          { field: "valuation", op: "lte", value: 4_900_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-49001-50000`,
      code: `${p}-49001-50000`,
      label: "Project cost $49,001–$50,000 ($283.00 flat band)",
      description: `${LADDER_DESCRIPTION} The printed row for $49,001.00–$50,000.00 is $283.00.`,
      feeType: "flat",
      config: { amountCents: 28_300 },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 4_900_000 },
          { field: "valuation", op: "lte", value: 5_000_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-50001-100000`,
      code: `${p}-50001-100000`,
      label: "Project cost $50,001–$100,000 ($283.00 + $3.00 per $1,000 band)",
      description: `${LADDER_DESCRIPTION} Fifty printed bands rising $3.00 from $286.00 at $50,001 to $433.00 at $100,000.`,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 28_300,
        thresholdCents: 5_000_000,
        incrementCents: 100_000,
        centsPerThousand: 300,
      },
      conditions: {
        all: [
          { field: "valuation", op: "gt", value: 5_000_000 },
          { field: "valuation", op: "lte", value: 10_000_000 },
        ],
      },
    }),
    rule({
      id: `${prefix}-over-100000`,
      code: `${p}-OVER-100K`,
      label: "Project cost above $100,000 ($433.00 + $2.50 per $1,000 and each part thereof)",
      description:
        "City of Huntington Building Permit Fee Schedule, closing note: 'Above $100,000.00, add an additional $2.50 per $1,000.00 and each part thereof to the $433.00.'",
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 43_300,
        thresholdCents: 10_000_000,
        incrementCents: 100_000,
        centsPerThousand: 250,
      },
      conditions: { all: [{ field: "valuation", op: "gt", value: 10_000_000 }] },
    }),
  ];
}

/** "$20 application fee is required per building permit" — on every permit. */
function applicationFee(prefix: string): FeeRuleRecord {
  return rule({
    id: `${prefix}-application`,
    code: `${prefix.toUpperCase()}-APP-20`,
    label: "Application fee ($20.00, per permit)",
    description:
      "City of Huntington Building Permit Fees page: 'An additional $20 application fee is required per building permit.'",
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 2_000 },
  });
}

export const HU_BUILDING_RULES: FeeRuleRecord[] = [...ladder("hu-bld"), applicationFee("hu-bld")];
export const HU_ELECTRICAL_RULES: FeeRuleRecord[] = [...ladder("hu-elec"), applicationFee("hu-elec")];
export const HU_PLUMBING_RULES: FeeRuleRecord[] = [...ladder("hu-plumb"), applicationFee("hu-plumb")];
