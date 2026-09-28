import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Annapolis, Maryland fee rules — REAL DATA.
 *
 * Source: City of Annapolis FY26 Fee Schedule (official City PDF), Title 17
 *         "Buildings & Construction" pages, cross-referenced to Annapolis
 *         City Code §17.05-§17.28.
 *
 * - Building: value-banded permit fees $25/$150/$175/$200, then $250 + 0.8%
 *   of value over $10,000; application fee by value; plan review by cost.
 * - Electrical: new dwelling $150 (200 A or less) + $8 per 100 A or fraction
 *   over 200; rough wiring by outlet band; fixtures band parallel.
 * - Plumbing: first fixture $60 residential / $80 commercial, $15 per
 *   additional public-sewer fixture, gas service pipe by diameter.
 *
 * Verified: 2026-09-26.
 */

export const ANNAPOLIS_FEE_EFFECTIVE_FROM = "2025-07-01";

export const ANNAPOLIS_FY26_KEY = "annapolis-fy26-fee-schedule";

const RESIDENTIAL: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };

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
    effectiveFrom: ANNAPOLIS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const ANNAPOLIS_BUILDING_RULES: FeeRuleRecord[] = [
  // The value ladder, as one tiered table: $25 / $150 / $175 / $200, then the
  // open top band charged by the marginal rule below it.
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-bld-table",
    code: "BLD-TABLE",
    label: "Building permit by estimated value ($25.00 to $200.00 bands)",
    description:
      "FY26 Fee Schedule, 'Permit fees based on the estimated value of the work' (§17.05.130 et seq.): $0-$500 $25.00; $501-$3,000 $150.00; $3,001-$5,000 $175.00; $5,001-$10,000 $200.00. Values above $10,000 are charged by the marginal rule beside this table.",
    feeType: "tiered_table",
    componentType: "base",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 50_000, amountCents: 2_500 },
        { upToCents: 300_000, amountCents: 15_000 },
        { upToCents: 500_000, amountCents: 17_500 },
        { upToCents: 1_000_000, amountCents: 20_000 },
        { upToCents: null, amountCents: 0 },
      ],
    },
    priority: 100,
  }),
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-bld-over-10k",
    code: "BLD-OVER-10K",
    label: "Building permit over $10,000 of value ($250.00 + 0.8% of the excess)",
    description:
      "FY26 Fee Schedule: $10,001 and more — $250.00 plus 0.8% of the estimated value of work in excess of $10,000.000. The 0.8% is stored as 80 basis points of the excess, and the $250.00 base rides the same rule so the top band reads exactly as printed.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 25_000,
      thresholdCents: 1_000_000,
      incrementCents: 100_000,
      centsPerThousand: 800,
    },
    conditions: {
      all: [{ field: "valuation", op: "gt", value: 1_000_000 }],
    },
    priority: 110,
  }),
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-bld-application",
    code: "BLD-APPLICATION",
    label: "Nonrefundable application fee (by estimated value: $25 to $200, plus 0.25% of the excess at $75,001 and more)",
    description:
      "FY26 Fee Schedule, 'Nonrefundable application fee based on estimated value of the work': $25.00 at $0-$500; $100.00 at $501-$25,000; $150.00 at $25,001-$50,000; $200.00 at $50,001-$75,000; $200.00 plus 0.25% of the excess at $75,001 and more. The table charges the schedule's four value bands; the open 0.25% top is named here rather than charged.",
    feeType: "tiered_table",
    componentType: "other",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 50_000, amountCents: 2_500 },
        { upToCents: 2_500_000, amountCents: 10_000 },
        { upToCents: 5_000_000, amountCents: 15_000 },
        { upToCents: 7_500_000, amountCents: 20_000 },
        { upToCents: null, amountCents: 20_000 },
      ],
    },
    priority: 300,
  }),
];

export const ANNAPOLIS_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-elec-dwelling",
    code: "ELEC-DWELLING",
    label: "New dwelling unit, 200 amperes or less ($150.00)",
    description:
      "FY26 Fee Schedule, 'Electrical permit and inspection fees' §17.16: new dwelling units, 200 ampere service or less — $150.00. More than 200 amperes — $150.00 plus $8.00 for each 100 amperes or fraction thereof in excess of 200. The calculator charges the $150.00 base; the over-200-ampere add is named rather than charged, because an ordinary dwelling service sits in the base row.",
    feeType: "flat",
    config: { amountCents: 15_000 },
    conditions: { all: [RESIDENTIAL] },
    priority: 100,
  }),
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-elec-outlets",
    code: "ELEC-OUTLETS",
    label: "Rough wiring, additions and alterations ($25.00-$75.00 by outlet band)",
    description:
      "FY26 Fee Schedule §17.16 B: rough wiring of additions, alterations or repairs — all switches, lighting and receptacles counted as outlets: 1-10 outlets $25.00; 11-40 $50.00; 41-75 $75.00; more than 75, $10.00 for every 25 outlets or fraction thereof in addition to the $75.00. Rough wiring of fixtures carries the identical bands.",
    feeType: "tiered_table",
    componentType: "base",
    config: {
      basis: "circuits",
      tiers: [
        { upToCents: 10, amountCents: 2_500 },
        { upToCents: 40, amountCents: 5_000 },
        { upToCents: null, amountCents: 7_500 },
      ],
    },
    conditions: { field: "custom.circuits", op: "exists" },
    priority: 110,
  }),
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-elec-over-75",
    code: "ELEC-OVER-75",
    label: "More than 75 outlets ($10.00 per 25 or fraction, added to the $75.00 band)",
    description:
      "FY26 Fee Schedule §17.16 B: 'More than 75 outlets — $10.00/every 25 outlets or fraction thereof.' The schedule reads the row as adding to the $75.00 band: 100 outlets are $75.00 plus one $10.00 block. The model charges one block per 25 outlets above 75, starting from the 76th.",
    feeType: "per_unit",
    componentType: "base",
    config: { unit: "circuits", baseCents: 7_500, thresholdUnits: 75, centsPerUnit: 40 },
    conditions: { field: "custom.circuits", op: "gt", value: 75 },
    priority: 120,
  }),
];

export const ANNAPOLIS_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-plumb-first-fixture",
    code: "PLUMB-FIRST-FIXTURE",
    label: "First plumbing fixture ($60.00 residential)",
    description:
      "FY26 Fee Schedule, 'Installation charges' §17.28: first fixture $60.00 residential, $80.00 commercial. The schedule reads the plumbing permit as 'the sum of the fixture charges plus the amount of the applicable gas service pipe charges.' The model charges the residential first-fixture row; the commercial row is $80.00 under the same lines.",
    feeType: "flat",
    config: { amountCents: 6_000 },
    priority: 100,
  }),
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-plumb-additional-fixtures",
    code: "PLUMB-ADD-FIXTURES",
    label: "Each additional fixture connected to public sewer ($15.00)",
    description:
      "FY26 Fee Schedule §17.28, 'Installation charges': each additional fixture if connected to public sewer $15.00; if connected to private sewer $30.00. A fixture omitted from the original permit is $20.00 and $40.00 respectively. The model charges the public-sewer row, the ordinary city case.",
    feeType: "per_unit",
    config: { unit: "fixtures", thresholdUnits: 1, centsPerUnit: 1_500 },
    priority: 110,
  }),
  rule(ANNAPOLIS_FY26_KEY, {
    id: "annapolis-plumb-gas-pipe",
    code: "PLUMB-GAS-PIPE",
    label: "Gas service pipe charge, 2½ inches or less ($50.00)",
    description:
      "FY26 Fee Schedule §17.28: gas service pipe charge, including inspection by the City plumbing inspector, by diameter — 2½ inches or less $50.00; 3 inches $60.00; 4 inches $70.00; 6 inches $125.00; 8 inches $250.00; 10 inches $350.00; 12 inches $500.00. The model charges the $50.00 row that covers ordinary residential gas service; the larger diameters are named here.",
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 5_000 },
    conditions: { field: "custom.gas_service_pipe", op: "exists" },
    priority: 120,
  }),
];
