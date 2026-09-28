import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Little Rock, Arkansas fee rules — REAL DATA.
 *
 * Source: Little Rock City Code, Chapter 8, Article III (Building Code),
 *         Sec. 8-31 "Building permits and permit fees" — the permit fee
 *         schedules for building, electrical, plumbing, mechanical and other
 *         related work in the City of Little Rock.
 *
 * Reading notes recorded in research/arkansas/little-rock.md §2:
 *   - every building band prints "or fraction thereof" → incrementCents rounds up;
 *   - the $501–$50,000 band's $30.00 covers "the first $500 up to $2,000", so the
 *     per-thousand rate starts above $2,000 (thresholdCents: 200_000);
 *   - the commercial plan-checking fee is one-half of the building permit fee,
 *     minimum $50.00, charged on plan-reviewed (commercial) work only;
 *   - the data processing fee is a flat $3/$4/$6/$8 by valuation band;
 *   - the $0.08/sq ft dwelling rates are stored as 8 cents per unit (a
 *     `currency_per_unit` rate is CENTS per unit of the basis — the Madison
 *     lesson);
 *   - the over-200-amp load-center row is a `percent` rule with a threshold and
 *     increment on the amperage basis, the Portland square-foot-package shape:
 *     $5.00 per whole 100 amps or fraction over the first 200;
 *   - the $30.00 minimum is the schedule's own floor for every permit.
 *
 * Verified: 2026-09-26.
 */

export const LR_FEE_EFFECTIVE_FROM = "2005-11-06"; // Ord. No. 2005-153 establishes the schedules

export const LR_BUILDING_SOURCE_KEY = "littlerock-building-code-fees";
export const LR_ELECTRICAL_SOURCE_KEY = "littlerock-building-code-fees";
export const LR_PLUMBING_SOURCE_KEY = "littlerock-building-code-fees";

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
    effectiveFrom: LR_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

function valuationBracket(
  lowerCentsExclusive: number,
  upperCentsInclusive: number | null,
): FeeRuleRecord["conditions"] {
  const clauses: unknown[] = [{ field: "valuation", op: "gt", value: lowerCentsExclusive }];
  if (upperCentsInclusive !== null) {
    clauses.push({ field: "valuation", op: "lte", value: upperCentsInclusive });
  }
  return { all: clauses };
}

export const LR_BUILDING_RULES: FeeRuleRecord[] = [
  // $501 to $50,000: $30.00 for the first $500 up to $2,000 + $3.50 per additional $1,000 or fraction
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-a2",
    code: "BLD-VAL-501-50K",
    label: "Building permit fee ($501 to $50,000)",
    description:
      "Sec. 8-31(c)(I) Table: $30.00 for the first $500 up to $2,000, plus $3.50 for each additional $1,000 or fraction thereof, to and including $50,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 3_000,
      thresholdCents: 200_000,
      incrementCents: 100_000,
      centsPerThousand: 350,
    },
    conditions: valuationBracket(50_000, 5_000_000),
  }),

  // $50,001 to $100,000: $198.00 + $2.40 per additional $1,000 or fraction
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-a3",
    code: "BLD-VAL-50K01-100K",
    label: "Building permit fee ($50,001 to $100,000)",
    description:
      "Sec. 8-31(c)(I) Table: $198.00 for the first $50,000 plus $2.40 for each additional $1,000 or fraction thereof, to and including $100,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 19_800,
      thresholdCents: 5_000_000,
      incrementCents: 100_000,
      centsPerThousand: 240,
    },
    conditions: valuationBracket(5_000_000, 10_000_000),
  }),

  // $100,001 to $500,000: $318.00 + $2.10 per additional $1,000 or fraction
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-a4",
    code: "BLD-VAL-100K01-500K",
    label: "Building permit fee ($100,001 to $500,000)",
    description:
      "Sec. 8-31(c)(I) Table: $318.00 for the first $100,000 plus $2.10 for each additional $1,000 or fraction thereof, to and including $500,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 31_800,
      thresholdCents: 10_000_000,
      incrementCents: 100_000,
      centsPerThousand: 210,
    },
    conditions: valuationBracket(10_000_000, 50_000_000),
  }),

  // $500,001 and up: $1,158.00 + $1.60 per additional $1,000 or fraction
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-a5",
    code: "BLD-VAL-500K01-UP",
    label: "Building permit fee ($500,001 and up)",
    description:
      "Sec. 8-31(c)(I) Table: $1,158.00 for the first $500,000 plus $1.60 for each additional $1,000 or fraction thereof.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 115_800,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      centsPerThousand: 160,
    },
    conditions: valuationBracket(50_000_000, null),
  }),

  // Commercial plan-checking fee: one-half of the building permit fee, minimum $50
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-plan-check",
    code: "BLD-PLAN-CHECK-50",
    label: "Commercial plan-checking fee (50% of the building permit fee)",
    description:
      "Sec. 8-31(c)(I)(C): when valuation exceeds $500 and plans are required, a plan-checking fee equal to one-half of the building permit fee; minimum $50.00 for new construction, repairs, remodels and miscellaneous permits requiring plan review.",
    feeType: "percent",
    componentType: "plan_review",
    minimumCents: 5_000,
    priority: 200,
    config: {
      basis: "permit_fee",
      rateBps: 5_000,
    },
    conditions: {
      all: [{ field: "occupancy", op: "in", value: ["commercial", "industrial", "mixed"] }],
    },
  }),

  // Data processing fee: $3 / $4 / $6 / $8 by valuation band
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-data-3",
    code: "LR-DATA-3",
    label: "Data processing fee ($3.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $3.00 for permit valuations of $501.00 to $50,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 300 },
    conditions: valuationBracket(50_000, 5_000_000),
  }),
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-data-4",
    code: "LR-DATA-4",
    label: "Data processing fee ($4.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $4.00 for permit valuations of $50,001.00 to $100,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 400 },
    conditions: valuationBracket(5_000_000, 10_000_000),
  }),
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-data-6",
    code: "LR-DATA-6",
    label: "Data processing fee ($6.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $6.00 for permit valuations of $100,001.00 to $500,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 600 },
    conditions: valuationBracket(10_000_000, 50_000_000),
  }),
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-data-8",
    code: "LR-DATA-8",
    label: "Data processing fee ($8.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $8.00 for permit valuations of $500,000.00 and up. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 800 },
    conditions: valuationBracket(50_000_000, null),
  }),

  // $30.00 minimum for any permit
  rule(LR_BUILDING_SOURCE_KEY, {
    id: "lr-bld-minimum",
    code: "LR-MINIMUM",
    label: "Minimum permit fee floor ($30.00)",
    description:
      "Sec. 8-31(c)(I)(B): the minimum fee for any permit shall be $30.00. Charged as the shortfall when the computed fees fall below it.",
    feeType: "permit_minimum",
    componentType: "other",
    priority: 800,
    config: { basis: "permit_fee", floorCents: 3_000 },
  }),
];

export const LR_ELECTRICAL_RULES: FeeRuleRecord[] = [
  // New one- and two-family dwelling: $0.08/sq ft under roof
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-new-dwelling",
    code: "ELEC-NEW-DWELLING",
    label: "New one- and two-family dwelling electrical fee ($0.08/sq ft under roof)",
    description:
      "Sec. 8-31(c)(II)(A)(1): one- and two-family dwelling, $0.08 per square foot under roof.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 8, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "work_type", op: "eq", value: "new_construction" },
      ],
    },
  }),

  // Load centers, regardless of voltage — ladder by service amperage
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-loadcenter-60",
    code: "ELEC-LC-60",
    label: "Load center up to 60 amps ($8.00)",
    description: "Sec. 8-31(c)(II)(C)(2): load centers regardless of voltage, up to 60 amps, $8.00.",
    feeType: "flat",
    config: { amountCents: 800 },
    conditions: {
      all: [{ field: "custom.amperage", op: "lte", value: 60 }],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-loadcenter-100",
    code: "ELEC-LC-100",
    label: "Load center up to 100 amps ($16.00)",
    description:
      "Sec. 8-31(c)(II)(C)(2): load centers regardless of voltage, up to 100 amps, $16.00.",
    feeType: "flat",
    config: { amountCents: 1_600 },
    conditions: {
      all: [
        { field: "custom.amperage", op: "gt", value: 60 },
        { field: "custom.amperage", op: "lte", value: 100 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-loadcenter-150",
    code: "ELEC-LC-150",
    label: "Load center up to 150 amps ($24.00)",
    description:
      "Sec. 8-31(c)(II)(C)(2): load centers regardless of voltage, up to 150 amps, $24.00.",
    feeType: "flat",
    config: { amountCents: 2_400 },
    conditions: {
      all: [
        { field: "custom.amperage", op: "gt", value: 100 },
        { field: "custom.amperage", op: "lte", value: 150 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-loadcenter-200",
    code: "ELEC-LC-200",
    label: "Load center up to 200 amps ($33.00)",
    description:
      "Sec. 8-31(c)(II)(C)(2): load centers regardless of voltage, up to 200 amps, $33.00.",
    feeType: "flat",
    config: { amountCents: 3_300 },
    conditions: {
      all: [
        { field: "custom.amperage", op: "gt", value: 150 },
        { field: "custom.amperage", op: "lte", value: 200 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-loadcenter-over",
    code: "ELEC-LC-OVER-200",
    label: "Load center over 200 amps ($5.00 per 100 amps over)",
    description:
      "Sec. 8-31(c)(II)(C)(2): over 200 amps, $5.00 per 100 amps or fraction thereof over 200 amps.",
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 5, denominator: 1 },
      rateUnit: "currency_per_unit",
      thresholdCents: 200,
      incrementCents: 100,
    },
    conditions: {
      all: [{ field: "custom.amperage", op: "gt", value: 200 }],
    },
  }),

  // Openings ladder (outlets/devices)
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-openings-1-20",
    code: "ELEC-OPEN-1-20",
    label: "Openings, 1 to 20 ($10.00)",
    description: "Sec. 8-31(c)(II)(C)(3): openings 1 to 20, $10.00.",
    feeType: "flat",
    config: { amountCents: 1_000 },
    conditions: {
      all: [
        { field: "custom.openings", op: "gte", value: 1 },
        { field: "custom.openings", op: "lte", value: 20 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-openings-21-60",
    code: "ELEC-OPEN-21-60",
    label: "Openings, 21 to 60 ($25.00)",
    description: "Sec. 8-31(c)(II)(C)(3): openings 21 to 60, $25.00.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: {
      all: [
        { field: "custom.openings", op: "gt", value: 20 },
        { field: "custom.openings", op: "lte", value: 60 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-openings-61-100",
    code: "ELEC-OPEN-61-100",
    label: "Openings, 61 to 100 ($30.00)",
    description: "Sec. 8-31(c)(II)(C)(3): openings 61 to 100, $30.00.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [
        { field: "custom.openings", op: "gt", value: 60 },
        { field: "custom.openings", op: "lte", value: 100 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-openings-101-200",
    code: "ELEC-OPEN-101-200",
    label: "Openings, 101 to 200 ($50.00)",
    description: "Sec. 8-31(c)(II)(C)(3): openings 101 to 200, $50.00.",
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: {
      all: [
        { field: "custom.openings", op: "gt", value: 100 },
        { field: "custom.openings", op: "lte", value: 200 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-openings-201-300",
    code: "ELEC-OPEN-201-300",
    label: "Openings, 201 to 300 ($65.00)",
    description: "Sec. 8-31(c)(II)(C)(3): openings 201 to 300, $65.00.",
    feeType: "flat",
    config: { amountCents: 6_500 },
    conditions: {
      all: [
        { field: "custom.openings", op: "gt", value: 200 },
        { field: "custom.openings", op: "lte", value: 300 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-openings-301-400",
    code: "ELEC-OPEN-301-400",
    label: "Openings, 301 to 400 ($80.00)",
    description: "Sec. 8-31(c)(II)(C)(3): openings 301 to 400, $80.00.",
    feeType: "flat",
    config: { amountCents: 8_000 },
    conditions: {
      all: [
        { field: "custom.openings", op: "gt", value: 300 },
        { field: "custom.openings", op: "lte", value: 400 },
      ],
    },
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-openings-over-400",
    code: "ELEC-OPEN-OVER-400",
    label: "Openings over 400 ($5.00 per 25 openings)",
    description:
      "Sec. 8-31(c)(II)(C)(3): openings over 400, $5.00 for each 25 openings (or fraction thereof) over 400.",
    feeType: "per_unit",
    config: {
      unit: "openings",
      centsPerUnit: 20, // $5.00 per 25 openings = 20¢ per opening
      baseCents: 8_000, // $80.00 for the first 400
      thresholdUnits: 400,
      incrementUnits: 25,
    },
    conditions: {
      all: [{ field: "custom.openings", op: "gt", value: 400 }],
    },
  }),

  // Data processing fee and $30 minimum (Sec. 8-31(c)(II)(G), (I)(D))
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-data-3",
    code: "LR-DATA-3",
    label: "Data processing fee ($3.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $3.00 for permit valuations of $501.00 to $50,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 300 },
    conditions: valuationBracket(50_000, 5_000_000),
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-data-4",
    code: "LR-DATA-4",
    label: "Data processing fee ($4.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $4.00 for permit valuations of $50,001.00 to $100,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 400 },
    conditions: valuationBracket(5_000_000, 10_000_000),
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-data-6",
    code: "LR-DATA-6",
    label: "Data processing fee ($6.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $6.00 for permit valuations of $100,001.00 to $500,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 600 },
    conditions: valuationBracket(10_000_000, 50_000_000),
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-data-8",
    code: "LR-DATA-8",
    label: "Data processing fee ($8.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $8.00 for permit valuations of $500,000.00 and up. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 800 },
    conditions: valuationBracket(50_000_000, null),
  }),
  rule(LR_ELECTRICAL_SOURCE_KEY, {
    id: "lr-elec-minimum",
    code: "LR-MINIMUM",
    label: "Minimum permit fee floor ($30.00)",
    description:
      "Sec. 8-31(c)(II)(G): the minimum electrical permit shall be $30.00. Charged as the shortfall when the computed fees fall below it.",
    feeType: "permit_minimum",
    componentType: "other",
    priority: 800,
    config: { basis: "permit_fee", floorCents: 3_000 },
  }),
];

export const LR_PLUMBING_RULES: FeeRuleRecord[] = [
  // New one- and two-family dwellings: $0.08/sq ft under roof
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-new-dwelling",
    code: "PLUMB-NEW-DWELLING",
    label: "New one- and two-family dwelling plumbing fee ($0.08/sq ft under roof)",
    description:
      "Sec. 8-31(c)(III)(A)(1): one- and two-family dwellings, $0.08 per square foot under roof.",
    feeType: "percent",
    config: {
      basis: "square_footage",
      rate: { numerator: 8, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "work_type", op: "eq", value: "new_construction" },
      ],
    },
  }),

  // Unit costs: each plumbing fixture outlet or appliance $5.00
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-fixture-outlets",
    code: "PLUMB-FIXTURE-OUTLETS",
    label: "Plumbing fixture outlets or appliances ($5.00 each)",
    description:
      "Sec. 8-31(c)(III)(B)(1): each plumbing fixture outlet or appliance, $5.00 — each water closet, urinal, sink, lavatory, bath tub, shower, floor drain, etc.",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 500 },
  }),

  // Water service $25.00; gas housepiping $25.00; water heater $15.00
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-water-service",
    code: "PLUMB-WATER-SERVICE",
    label: "Water service ($25.00)",
    description: "Sec. 8-31(c)(III)(B)(2): water service, $25.00.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: { all: [{ field: "custom.water_service", op: "eq", value: true }] },
  }),
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-water-heater",
    code: "PLUMB-WATER-HEATER",
    label: "Water heater ($15.00)",
    description: "Sec. 8-31(c)(III)(B)(17): water heater, $15.00.",
    feeType: "flat",
    config: { amountCents: 1_500 },
    conditions: { all: [{ field: "custom.water_heaters", op: "gte", value: 1 }] },
  }),
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-gas-housepiping",
    code: "PLUMB-GAS-HOUSEPIPING",
    label: "Gas housepiping ($25.00)",
    description: "Sec. 8-31(c)(III)(B)(10): gas housepiping, $25.00.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    conditions: { all: [{ field: "custom.gas_housepiping", op: "eq", value: true }] },
  }),

  // Data processing fee and $30 minimum (Sec. 8-31(c)(III)(E), (I)(D))
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-data-3",
    code: "LR-DATA-3",
    label: "Data processing fee ($3.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $3.00 for permit valuations of $501.00 to $50,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 300 },
    conditions: valuationBracket(50_000, 5_000_000),
  }),
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-data-4",
    code: "LR-DATA-4",
    label: "Data processing fee ($4.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $4.00 for permit valuations of $50,001.00 to $100,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 400 },
    conditions: valuationBracket(5_000_000, 10_000_000),
  }),
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-data-6",
    code: "LR-DATA-6",
    label: "Data processing fee ($6.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $6.00 for permit valuations of $100,001.00 to $500,000.00. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 600 },
    conditions: valuationBracket(10_000_000, 50_000_000),
  }),
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-data-8",
    code: "LR-DATA-8",
    label: "Data processing fee ($8.00)",
    description:
      "Sec. 8-31(c)(I)(D): data processing fee, $8.00 for permit valuations of $500,000.00 and up. Charged on every trade.",
    feeType: "flat",
    componentType: "technology",
    config: { amountCents: 800 },
    conditions: valuationBracket(50_000_000, null),
  }),
  rule(LR_PLUMBING_SOURCE_KEY, {
    id: "lr-plumb-minimum",
    code: "LR-MINIMUM",
    label: "Minimum permit fee floor ($30.00)",
    description:
      "Sec. 8-31(c)(III)(E): the minimum fee for any plumbing permit shall be $30.00. Charged as the shortfall when the computed fees fall below it.",
    feeType: "permit_minimum",
    componentType: "other",
    priority: 800,
    config: { basis: "permit_fee", floorCents: 3_000 },
  }),
];
