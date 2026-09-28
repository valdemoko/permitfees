import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Fort Smith, Arkansas fee rules — REAL DATA.
 *
 * Source: Fort Smith Code of Ordinances, Chapter 6 (Buildings and Building
 *         Regulations):
 *           - Building: Art. II, Sec. 6-30 "Fee schedule"
 *             (Ord. No. 23-99, 1999-04-20; Ord. No. 108-09, 2010-02-01).
 *           - Electrical: Art. III, Sec. 6-75 "Permit fees"
 *             (Ord. No. 23-99, 1999-04-20).
 *           - Plumbing & gas: Art. VI, Sec. 6-242(b) "Inspection fees"
 *             (Ord. No. 23-99, 1999-04-20; Ord. No. 55-02, 2002-09-17).
 *
 * Reading notes recorded in research/arkansas/fort-smith.md §2:
 *   - the residential top band prints "or fraction thereof" and rounds up;
 *     every nonresidential band omits the phrase and prorates;
 *   - the nonresidential bands chain at their first four seams ($67.50 + 8 ×
 *     $4.50 = $103.50, $103.50 + 40 × $3.75 = $253.50, $253.50 + 50 × $3.00 =
 *     $403.50) — verified band by band;
 *   - plan review is 20% of the building permit fee capped at $1,500,
 *     multifamily/commercial/industrial only;
 *   - electrical prices *each active circuit* at its band's rate — a marginal
 *     per-circuit ladder over the `circuits` basis, not a bracket fee;
 *   - plumbing prices fixture outlets, services and appliances, floored at
 *     $24.00 per permit (a permit_minimum shortfall, never a per-rule clamp);
 *   - the nonresidential ladder does NOT chain at its last seam: $403.50 +
 *     900 × $2.25 = $2,428.50 at $1,000,000 where the top band prints
 *     $2,536.50 — a $108.00 jump the schedule itself contains, charged as
 *     printed and asserted from both sides (the Fargo/Detroit pattern).
 *
 * Verified: 2026-09-26.
 */

export const FS_FEE_EFFECTIVE_FROM = "1999-04-20"; // Ord. No. 23-99

export const FS_BUILDING_SOURCE_KEY = "fortsmith-building-fee-schedule";
export const FS_ELECTRICAL_SOURCE_KEY = "fortsmith-electrical-fee-schedule";
export const FS_PLUMBING_SOURCE_KEY = "fortsmith-plumbing-fee-schedule";

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
    effectiveFrom: FS_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

function costBracket(
  lowerCentsExclusive: number,
  upperCentsInclusive: number | null,
): FeeRuleRecord["conditions"] {
  const clauses: unknown[] = [{ field: "valuation", op: "gt", value: lowerCentsExclusive }];
  if (upperCentsInclusive !== null) {
    clauses.push({ field: "valuation", op: "lte", value: upperCentsInclusive });
  }
  return { all: clauses };
}

const RESIDENTIAL = { field: "occupancy", op: "eq", value: "residential" } as const;
const NONRESIDENTIAL = {
  field: "occupancy",
  op: "in",
  value: ["commercial", "industrial", "mixed"],
} as const;

export const FS_BUILDING_RULES: FeeRuleRecord[] = [
  // ---- Residential ladder (single-family and duplex) ----
  // $50–$500: $15.00 flat
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-res-1",
    code: "FS-RES-50-500",
    label: "Residential permit fee ($50 to $500)",
    description: "Sec. 6-30(1): residential construction $50.00 to $500.00, $15.00.",
    feeType: "flat",
    config: { amountCents: 1_500 },
    conditions: {
      all: [RESIDENTIAL, costBracket(0, 50_000)],
    },
  }),
  // $501–$1,000: $22.50
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-res-2",
    code: "FS-RES-501-1000",
    label: "Residential permit fee ($501 to $1,000)",
    description: "Sec. 6-30(1): residential construction $501.00 to $1,000.00, $22.50.",
    feeType: "flat",
    config: { amountCents: 2_250 },
    conditions: { all: [RESIDENTIAL, costBracket(50_000, 100_000)] },
  }),
  // $1,001–$1,500: $30.00
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-res-3",
    code: "FS-RES-1001-1500",
    label: "Residential permit fee ($1,001 to $1,500)",
    description: "Sec. 6-30(1): residential construction $1,001.00 to $1,500.00, $30.00.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { all: [RESIDENTIAL, costBracket(100_000, 150_000)] },
  }),
  // $1,501–$2,000: $37.50
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-res-4",
    code: "FS-RES-1501-2000",
    label: "Residential permit fee ($1,501 to $2,000)",
    description: "Sec. 6-30(1): residential construction $1,501.00 to $2,000.00, $37.50.",
    feeType: "flat",
    config: { amountCents: 3_750 },
    conditions: { all: [RESIDENTIAL, costBracket(150_000, 200_000)] },
  }),
  // $2,001 and over: $37.50 plus $1.50 per additional $1,000 or fraction thereof
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-res-5",
    code: "FS-RES-2001-UP",
    label: "Residential permit fee ($2,001 and over)",
    description:
      "Sec. 6-30(1): residential construction $2,001.00 and over, $37.50 plus $1.50 for each additional $1,000.00 valuation or fraction thereof.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 3_750,
      thresholdCents: 200_000,
      incrementCents: 100_000,
      centsPerThousand: 150,
    },
    conditions: { all: [RESIDENTIAL, costBracket(200_000, null)] },
  }),

  // ---- Nonresidential ladder (multifamily, commercial, industrial, institutional) ----
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-1",
    code: "FS-COM-50-500",
    label: "Nonresidential permit fee ($50 to $500)",
    description: "Sec. 6-30(2): nonresidential construction $50.00 to $500.00, $15.00.",
    feeType: "flat",
    config: { amountCents: 1_500 },
    conditions: { all: [NONRESIDENTIAL, costBracket(0, 50_000)] },
  }),
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-2",
    code: "FS-COM-501-1000",
    label: "Nonresidential permit fee ($501 to $1,000)",
    description: "Sec. 6-30(2): nonresidential construction $501.00 to $1,000.00, $37.50.",
    feeType: "flat",
    config: { amountCents: 3_750 },
    conditions: { all: [NONRESIDENTIAL, costBracket(50_000, 100_000)] },
  }),
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-3",
    code: "FS-COM-1001-1500",
    label: "Nonresidential permit fee ($1,001 to $1,500)",
    description: "Sec. 6-30(2): nonresidential construction $1,001.00 to $1,500.00, $52.50.",
    feeType: "flat",
    config: { amountCents: 5_250 },
    conditions: { all: [NONRESIDENTIAL, costBracket(100_000, 150_000)] },
  }),
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-4",
    code: "FS-COM-1501-2000",
    label: "Nonresidential permit fee ($1,501 to $2,000)",
    description: "Sec. 6-30(2): nonresidential construction $1,501.00 to $2,000.00, $67.50.",
    feeType: "flat",
    config: { amountCents: 6_750 },
    conditions: { all: [NONRESIDENTIAL, costBracket(150_000, 200_000)] },
  }),
  // $2,001–$10,000: $67.50 + $4.50 per additional $1,000 (no fraction phrase → prorates)
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-5",
    code: "FS-COM-2001-10K",
    label: "Nonresidential permit fee ($2,001 to $10,000)",
    description:
      "Sec. 6-30(2): nonresidential construction $2,001.00 to $10,000.00, $67.50 plus $4.50 for each additional $1,000.00 valuation.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 6_750,
      thresholdCents: 200_000,
      centsPerThousand: 450,
    },
    conditions: { all: [NONRESIDENTIAL, costBracket(200_000, 1_000_000)] },
  }),
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-6",
    code: "FS-COM-10K01-50K",
    label: "Nonresidential permit fee ($10,001 to $50,000)",
    description:
      "Sec. 6-30(2): nonresidential construction $10,001.00 to $50,000.00, $103.50 plus $3.75 for each additional $1,000.00 valuation.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 10_350,
      thresholdCents: 1_000_000,
      centsPerThousand: 375,
    },
    conditions: { all: [NONRESIDENTIAL, costBracket(1_000_000, 5_000_000)] },
  }),
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-7",
    code: "FS-COM-50K01-100K",
    label: "Nonresidential permit fee ($50,001 to $100,000)",
    description:
      "Sec. 6-30(2): nonresidential construction $50,001.00 to $100,000.00, $253.50 plus $3.00 for each additional $1,000.00 valuation.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 25_350,
      thresholdCents: 5_000_000,
      centsPerThousand: 300,
    },
    conditions: { all: [NONRESIDENTIAL, costBracket(5_000_000, 10_000_000)] },
  }),
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-8",
    code: "FS-COM-100K01-1M",
    label: "Nonresidential permit fee ($100,001 to $1,000,000)",
    description:
      "Sec. 6-30(2): nonresidential construction $100,001.00 to $1,000,000.00, $403.50 plus $2.25 for each additional $1,000.00 valuation.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 40_350,
      thresholdCents: 10_000_000,
      centsPerThousand: 225,
    },
    conditions: { all: [NONRESIDENTIAL, costBracket(10_000_000, 100_000_000)] },
  }),
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-com-9",
    code: "FS-COM-1M-UP",
    label: "Nonresidential permit fee ($1,000,001 and over)",
    description:
      "Sec. 6-30(2): nonresidential construction $1,000,001.00 and over, $2,536.50 plus $1.50 for each additional $1,000.00 valuation.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 253_650,
      thresholdCents: 100_000_000,
      centsPerThousand: 150,
    },
    conditions: { all: [NONRESIDENTIAL, costBracket(100_000_000, null)] },
  }),

  // Plan review: 20% of the building permit fee, capped at $1,500, MF/comm/ind only
  rule(FS_BUILDING_SOURCE_KEY, {
    id: "fs-bld-plan-review",
    code: "FS-PLAN-REVIEW-20",
    label: "Plan review fee (20% of building permit fee, max $1,500)",
    description:
      "Sec. 6-30(15): for multifamily, commercial and industrial projects, a nonrefundable plan review fee equal to 20 percent of the building permit fee, not to exceed $1,500.00, in addition to the building permit fee.",
    feeType: "percent",
    componentType: "plan_review",
    maximumCents: 150_000,
    priority: 200,
    config: { basis: "permit_fee", rateBps: 2_000 },
    conditions: { all: [NONRESIDENTIAL] },
  }),
];

export const FS_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // Active-circuit ladder: each circuit priced at its band's per-circuit rate
  rule(FS_ELECTRICAL_SOURCE_KEY, {
    id: "fs-elec-circuits",
    code: "ELEC-CIRCUITS",
    label: "Active circuits (band ladder: $5.50 / $5.00 / $4.50 / $4.00 / $3.50 per circuit)",
    description:
      "Sec. 6-75(a): fees based on the number of active circuits installed under one permit — $5.50 per circuit for circuits 1–4, $5.00 for 5–10, $4.50 for 11–20, $4.00 for 21–42, $3.50 for 43 and over. Two- or three-wire single-phase circuits count as two circuits; three- or four-wire three-phase as three.",
    feeType: "tiered_marginal",
    config: {
      basis: "circuits",
      tiers: [
        { upToCents: 4, rateCentsPerUnit: 550 },
        { upToCents: 10, rateCentsPerUnit: 500 },
        { upToCents: 20, rateCentsPerUnit: 450 },
        { upToCents: 42, rateCentsPerUnit: 400 },
        { upToCents: null, rateCentsPerUnit: 350 },
      ],
    },
  }),
  // Minimum inspection fee $30.00
  rule(FS_ELECTRICAL_SOURCE_KEY, {
    id: "fs-elec-minimum",
    code: "ELEC-MINIMUM-30",
    label: "Minimum inspection fee ($30.00)",
    description:
      "Sec. 6-75(a), (l): minimum inspection fee $30.00; where the total fee cannot be determined, a minimum fee of $30.00 is paid. Charged as the shortfall when the computed fee falls below it.",
    feeType: "permit_minimum",
    componentType: "other",
    priority: 800,
    config: { basis: "permit_fee", floorCents: 3_000 },
  }),
  // Panel replacement: $30.00 flat (relocated >5 ft reverts to circuits × rate)
  rule(FS_ELECTRICAL_SOURCE_KEY, {
    id: "fs-elec-panel-replacement",
    code: "ELEC-PANEL-REPLACEMENT",
    label: "Panel replacement ($30.00)",
    description:
      "Sec. 6-75(c): when the work consists only of the replacement of an existing panel, a fee of $30.00. Relocation more than five feet reverts to circuits × the per-circuit charge.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { all: [{ field: "custom.panel_replacement", op: "eq", value: true }] },
  }),
  // Temporary construction service $30.00
  rule(FS_ELECTRICAL_SOURCE_KEY, {
    id: "fs-elec-temp-service",
    code: "ELEC-TEMP-SERVICE",
    label: "Temporary construction service ($30.00)",
    description:
      "Sec. 6-75(d): a temporary service used only during construction is permitted for $30.00.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { all: [{ field: "custom.temporary_service", op: "eq", value: true }] },
  }),
];

export const FS_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(FS_PLUMBING_SOURCE_KEY, {
    id: "fs-plumb-fixtures",
    code: "PL-FIXTURE-OUTLETS",
    label: "Fixture outlets ($5.50 each)",
    description: "Sec. 6-242(b)(1): each fixture outlet, $5.50.",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 550 },
    conditions: { all: [{ field: "fixtures", op: "gte", value: 1 }] },
  }),
  rule(FS_PLUMBING_SOURCE_KEY, {
    id: "fs-plumb-services",
    code: "PL-WATER-SEWER-SERVICE",
    label: "Water or sewer service ($5.50 each)",
    description: "Sec. 6-242(b)(2): water or sewer service, $5.50.",
    feeType: "per_unit",
    config: { unit: "connections", centsPerUnit: 550 },
    conditions: { all: [{ field: "custom.connections", op: "gte", value: 1 }] },
  }),
  rule(FS_PLUMBING_SOURCE_KEY, {
    id: "fs-plumb-appliances",
    code: "PL-APPLIANCES",
    label: "Water heater, disposer, dishwasher or floor drain ($4.00 each)",
    description:
      "Sec. 6-242(b)(3): each water heater, disposer, dishwasher and floor drain, $4.00.",
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 400 },
    conditions: { all: [{ field: "custom.heaters", op: "gte", value: 1 }] },
  }),
  rule(FS_PLUMBING_SOURCE_KEY, {
    id: "fs-plumb-gas-service",
    code: "PL-GAS-SERVICE",
    label: "Gas service with up to five outlets ($5.50)",
    description:
      "Sec. 6-242(b)(4)–(5): gas service with up to five outlets, $5.50; each additional gas outlet, $1.50.",
    feeType: "per_unit",
    config: {
      unit: "outlets",
      centsPerUnit: 150,
      baseCents: 550,
      thresholdUnits: 5,
    },
    conditions: { all: [{ field: "custom.outlets", op: "gte", value: 1 }] },
  }),
  rule(FS_PLUMBING_SOURCE_KEY, {
    id: "fs-plumb-final",
    code: "PL-FINAL-INSPECTION",
    label: "Final inspection ($12.00)",
    description: "Sec. 6-242(b)(6): final inspection, $12.00. Charged when the permit's final inspection is performed.",
    feeType: "flat",
    componentType: "inspection",
    config: { amountCents: 1_200 },
    conditions: { all: [{ field: "custom.final_inspections", op: "gte", value: 1 }] },
  }),
  rule(FS_PLUMBING_SOURCE_KEY, {
    id: "fs-plumb-minimum",
    code: "PL-MINIMUM-24",
    label: "Minimum fee ($24.00)",
    description:
      "Sec. 6-242(b)(7): minimum fee, $24.00. Charged as the shortfall when the computed fees fall below it.",
    feeType: "permit_minimum",
    componentType: "other",
    priority: 800,
    config: { basis: "permit_fee", floorCents: 2_400 },
  }),
];
