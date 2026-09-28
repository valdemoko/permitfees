import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Baltimore, Maryland fee rules — REAL DATA.
 *
 * Source: Baltimore City Building Code, Article 27, §109 "Fees", maintained by
 *         the City's Law Library (codes.baltimorecity.gov).
 *
 * - Building (new/additions): $10 per 1,000 cu ft or fraction (1-2 family),
 *   $20 per 1,000 cu ft or fraction (all others, adjusted volume); minimums
 *   $150/$75 residential and $250/$150 other.
 * - Alterations/repairs: $0.30/sq ft (residential, min $50), $0.35/sq ft
 *   (other, min $150).
 * - Application fee: $25-$150 by plan review and occupancy.
 * - Electrical: service by amperage band, $6 per circuit, fixtures 1-25 at
 *   $25 plus $5 per additional 25 or fraction.
 * - Plumbing: $5 per fixture; water/sanitary/storm service $25 residential /
 *   $50 other; backflow devices $25 (<2") / $100 (2"+).
 *
 * Verified: 2026-09-26.
 */

export const BALTIMORE_FEE_EFFECTIVE_FROM = "2021-01-01";

export const BALTIMORE_CODE_109_KEY = "baltimore-building-code-109";
export const BALTIMORE_PERMIT_CENTER_KEY = "baltimore-permit-center";

export const BALTIMORE_DEFAULT_MINIMUM_CENTS = 2_500; // §109.3 $25 default

const DWELLING: FeeCondition = { field: "occupancy", op: "eq", value: "residential" };
const NON_DWELLING: FeeCondition = { field: "occupancy", op: "eq", value: "commercial" };
const NEW_CONSTRUCTION: FeeCondition = { field: "work_type", op: "eq", value: "new_construction" };
const ADDITION: FeeCondition = { field: "work_type", op: "eq", value: "addition" };
const ALTERATION: FeeCondition = { field: "work_type", op: "in", value: ["alteration", "repair", "remodel"] };

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
    effectiveFrom: BALTIMORE_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

export const BALTIMORE_BUILDING_RULES: FeeRuleRecord[] = [
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-bld-new-res",
    code: "BLD-NEW-RES",
    label: "New building or addition, 1-2 family ($10.00 per 1,000 cu ft or fraction)",
    description:
      "§109.6.1(a)1: \"1- and 2-family dwellings — $10 for each 1,000 cubic feet or fraction of 1,000 cubic feet of gross volume, including all basements and cellars. Minimums — New building $150; Additions $75.\" The fraction clause rounds each partial thousand up, which the percent rule's increment does: the volume is rounded up to the next 1,000 cubic feet before the $0.01 per cubic foot rate ({1,1} cents per unit) is applied.",
    feeType: "percent",
    config: {
      basis: "cubic_footage",
      rate: { numerator: 1, denominator: 1 },
      rateUnit: "currency_per_unit",
      incrementCents: 1_000,
    },
    conditions: {
      all: [DWELLING, { any: [NEW_CONSTRUCTION, ADDITION] }],
    },
    minimumCents: 15_000,
    priority: 100,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-bld-new-other",
    code: "BLD-NEW-OTHER",
    label: "New building or addition, all others ($20.00 per 1,000 cu ft or fraction)",
    description:
      "§109.6.1(a)2: \"All others — $20 for each 1,000 cubic feet or fraction of 1,000 cubic feet of adjusted gross volume\" (each story's volume more than 20 feet above its floor excluded). Minimums — New building $250; Additions $150. The volume is rounded up to the next 1,000 cubic feet before the $0.02 per cubic foot rate ({1,50} cents per unit) is applied; the 20-foot adjustment is applied before the volume is entered.",
    feeType: "percent",
    config: {
      basis: "cubic_footage",
      rate: { numerator: 1, denominator: 50 },
      rateUnit: "currency_per_unit",
      incrementCents: 1_000,
    },
    conditions: {
      all: [NON_DWELLING, { any: [NEW_CONSTRUCTION, ADDITION] }],
    },
    minimumCents: 25_000,
    priority: 100,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-bld-alt-res",
    code: "BLD-ALT-RES",
    label: "Alterations and repairs, 1-2 family ($0.30 per sq ft, min $50.00)",
    description:
      "§109.6.1(c)1: \"$0.30 per square foot or fraction of a square foot of affected gross floor area. Minimum $50.\" Exterior-only or interior-door-only work is instead $10 per $1,000 of estimated cost (named here, not folded in).",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 30, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: { all: [DWELLING, ALTERATION] },
    minimumCents: 5_000,
    priority: 100,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-bld-alt-other",
    code: "BLD-ALT-OTHER",
    label: "Alterations and repairs, all others ($0.35 per sq ft, min $150.00)",
    description:
      "§109.6.1(c)2: \"$0.35 per square foot or fraction of a square foot of affected gross floor area. Minimum $150.\" Exterior-only, interior-door-only, demising-wall and shell work is instead $12 per $1,000 of estimated cost (named here, not folded in).",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 35, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: { all: [NON_DWELLING, ALTERATION] },
    minimumCents: 15_000,
    priority: 100,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-bld-application",
    code: "BLD-APPLICATION",
    label: "Application fee ($125.00, 1-2 family with plan review)",
    description:
      "§109.5.7: before an application is processed, a nonrefundable application fee — $25 (1-2 family) or $50 (all others) without construction documents for plan review; $125 (1-2 family) or $150 (all others) with them. The calculator charges the $125.00 plan-review application for a dwelling; a commercial application carries $150.00 under the same section.",
    feeType: "flat",
    componentType: "other",
    config: { amountCents: 12_500 },
    conditions: { all: [DWELLING] },
    priority: 300,
  }),
];

export const BALTIMORE_ELECTRICAL_RULES: FeeRuleRecord[] = [
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-elec-service",
    code: "ELEC-SERVICE",
    label: "Electrical service wiring (by ampere rating, $25.00-$200.00)",
    description:
      "§109.6.2(a)1: service wiring and equipment, installed, replaced or relocated, including meter connection — 0-100 A $25; over 100-200 $30; over 200-400 $40; over 400-800 $60; over 800-1,000 $100; over 1,000-2,000 $150; over 2,000 $200. Services over 600 volts add $100. The calculator models the 200-ampere dwelling service at the $30.00 row; other ratings are named in the schedule.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { field: "custom.amperage", op: "exists" },
    priority: 100,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-elec-circuits",
    code: "ELEC-CIRCUITS",
    label: "New branch circuits, feeders and extensions ($6.00 each)",
    description:
      "§109.6.2(b): \"For each circuit $6.\" A 3-wire or 4-wire branch circuit serving single-phase loads counts as 2 or 3 branch circuits respectively; a 3-wire branch serving only three-phase loads or a single appliance counts as 1.",
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 600 },
    priority: 100,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-elec-fixtures",
    code: "ELEC-FIXTURES",
    label: "Electrical fixtures or devices only ($25.00 first 25, $5.00 per additional 25)",
    description:
      "§109.6.2(c): installing fixtures or devices only — 1 to 25 fixtures $25; $5 for each additional 25 or fraction of 25 fixtures or devices. The calculator models the first-25 block and charges it only when the permit is entered as a fixtures-or-devices-only job (`custom.elec_fixtures_only`), so a service or circuit permit is never double-charged the fixture row.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: { field: "custom.elec_fixtures_only", op: "eq", value: true },
    priority: 110,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-elec-minimum",
    code: "ELEC-MINIMUM",
    label: "Minimum fee floor ($25.00)",
    description:
      "§109.3: \"Unless otherwise specified, the minimum fee or service charge is $25.\" Applied as the floor on the electrical permit subtotal.",
    feeType: "permit_minimum",
    componentType: "other",
    config: { basis: "permit_fee", floorCents: BALTIMORE_DEFAULT_MINIMUM_CENTS },
    priority: 400,
  }),
];

export const BALTIMORE_PLUMBING_RULES: FeeRuleRecord[] = [
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-plumb-fixtures",
    code: "PLUMB-FIXTURES",
    label: "Plumbing fixtures ($5.00 each)",
    description:
      "§109.6.3(j): \"Install, replace, or reconstruct plumbing fixtures — $5 each.\" Removing fixtures only is $20; electric water heaters new or replacement $20 each (named, not folded in).",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 500 },
    priority: 100,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-plumb-water-service",
    code: "PLUMB-WATER-SVC",
    label: "Water service pipe, new or replacement ($25.00, 1-2 family)",
    description:
      "§109.6.3(j): water service pipe, new or replacement — $25 in 1- and 2-family dwellings, $50 for all other work. The calculator charges the dwelling row; commercial service is $50.00 under the same row.",
    feeType: "flat",
    conditions: null,
    config: { amountCents: 2_500 },
    priority: 110,
  }),
  rule(BALTIMORE_CODE_109_KEY, {
    id: "balt-plumb-minimum",
    code: "PLUMB-MINIMUM",
    label: "Minimum fee floor ($25.00)",
    description:
      "§109.3: \"Unless otherwise specified, the minimum fee or service charge is $25.\" Applied as the floor on the plumbing permit subtotal.",
    feeType: "permit_minimum",
    componentType: "other",
    config: { basis: "permit_fee", floorCents: BALTIMORE_DEFAULT_MINIMUM_CENTS },
    priority: 400,
  }),
];
