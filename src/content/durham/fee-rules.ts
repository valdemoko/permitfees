import type { FeeRuleRecord, ConditionField, ConditionLeaf } from "@/lib/calc/types";

/**
 * Durham City-County Building & Safety Department — **the jurisdiction that prices one
 * permit four different ways in one document, and folds the technology surcharge into
 * every amount instead of charging it.**
 *
 * Four schedules, one per trade, each headed `(Effective 7/1/18--Includes Technology
 * Surcharge)` and each published from the City's own Fee Schedules page:
 *
 *   D1  **Building Permit Fee Schedule** — Schedule A prices a new one- and two-family
 *       dwelling by *gross area* in eight flat brackets; B prices multi-family *per
 *       dwelling unit*; C is flat by footing; D is flat by construction contract value;
 *       E prices nonresidential work by contract value with a per-thousand increment and
 *       five printed plan review amounts; F is eleven named flats. Every schedule row
 *       that carries a plan review column is charged for that column as well, because
 *       "The Plan Review Fee must be paid at time of plan submittal".
 *   D2  **Electrical Permit Fee Schedule** — house service by ampacity, outlets and
 *       fixtures as "1 – 10 … $21.00, each additional $0.83", service equipment by
 *       ampacity, three permit-level floors and a $5.00 paper surcharge.
 *   D3  **Plumbing Permit Fee Schedule** — six scopes: a flat $170.00 for a new dwelling,
 *       per-fixture rates with two different minima, additions as separate lines,
 *       replacement brackets and four miscellany flats.
 *   D4  **Mechanical Permit Fee Schedule** — read and cited, never priced: no page of
 *       this site prices mechanical work in any jurisdiction.
 *
 * **Why no rule in this file carries a surcharge.** Durham's header says the amounts
 * *include* the technology surcharge; Raleigh prints a 4% surcharge as its own row and
 * charges it last against the fees. Both are North Carolina; adding one to Durham would
 * double-charge every figure on these pages. See `research/north-carolina/durham.md` §2.3.
 */

/** The date on the face of all four schedules: `(Effective 7/1/18…)` — read, not inferred. */
export const DUR_FEE_EFFECTIVE_FROM = "2018-07-01";

export const DUR_BUILDING_SOURCE_KEY = "durham-building-permit-fee-schedule";
export const DUR_ELECTRICAL_SOURCE_KEY = "durham-electrical-permit-fee-schedule";
export const DUR_PLUMBING_SOURCE_KEY = "durham-plumbing-permit-fee-schedule";
export const DUR_MECHANICAL_SOURCE_KEY = "durham-mechanical-permit-fee-schedule";
export const DUR_FEE_INDEX_SOURCE_KEY = "durham-fee-schedules-index";

/** Which building schedule the Department places the project in. */
export const DUR_BUILDING_SCHEDULES = [
  "new_dwelling",
  "multifamily",
  "accessory",
  "renovation_addition",
  "nonresidential",
] as const;

/** Which plumbing scope the application is filed under — the schedule's own three Type Application options, plus multi-family and nonresidential. */
export const DUR_PLUMBING_SCOPES = [
  "new_dwelling",
  "multifamily",
  "nonresidential",
  "addition",
  "replacement",
] as const;

/**
 * Schedule A — "New Residential Dwellings (One and Two Family, Including Townhouse Unit
 * Ownership)". Gross area in square feet, flat permit fee, flat $146.00 plan review.
 */
export const DUR_SCHEDULE_A_BANDS = [
  { key: "up-to-1200", label: "Up to 1,200 sq ft", upTo: 1_200, permitCents: 14_600 },
  { key: "1201-1800", label: "1,201 to 1,800 sq ft", upTo: 1_800, permitCents: 32_500 },
  { key: "1801-2400", label: "1,801 to 2,400 sq ft", upTo: 2_400, permitCents: 40_000 },
  { key: "2401-3000", label: "2,401 to 3,000 sq ft", upTo: 3_000, permitCents: 45_600 },
  { key: "3001-3600", label: "3,001 to 3,600 sq ft", upTo: 3_600, permitCents: 53_700 },
  { key: "3601-4200", label: "3,601 to 4,200 sq ft", upTo: 4_200, permitCents: 65_000 },
  { key: "4201-5000", label: "4,201 to 5,000 sq ft", upTo: 5_000, permitCents: 74_000 },
  { key: "5001-and-over", label: "5,001 sq ft and over", upTo: null, permitCents: 81_000 },
] as const;

/** The plan review column of Schedule A is $146.00 in every bracket. */
export const DUR_SCHEDULE_A_PLAN_REVIEW_CENTS = 14_600;

/**
 * Schedule E — "Nonresidential Buildings - Cost will be based on construction contracts
 * unless a reason is identified to base cost on other information".
 *
 * Each band prints a permit amount, a plan review amount and, on the four bands that
 * have one, a per-thousand increment **on the permit column only**. The layout pass is
 * what settled that: with the increment on plan review too, the $50,001–$100,000 band
 * would collect $560 of plan review at $100,000 and the next band would print $400 — a
 * step backwards — while the permit column meets its next band exactly
 * ($456 + 50 × $6.60 = $786).
 *
 * Bands are closed at one cent below the next band's printed opening, as the schedule
 * prints them in whole dollars.
 */
export const DUR_SCHEDULE_E_BANDS = [
  {
    key: "up-to-5000",
    label: "$0 to $5,000",
    minCents: null,
    maxCents: 500_000,
    permitCents: 10_400,
    planReviewCents: 10_400,
    increment: null,
  },
  {
    key: "5001-50000",
    label: "$5,001 to $50,000",
    minCents: 500_100,
    maxCents: 5_000_000,
    permitCents: null,
    planReviewCents: 10_400,
    increment: { centsPerThousand: 780, thresholdCents: 500_000, baseCents: 10_400 },
  },
  {
    key: "50001-100000",
    label: "$50,001 to $100,000",
    minCents: 5_000_100,
    maxCents: 10_000_000,
    permitCents: null,
    planReviewCents: 23_000,
    increment: { centsPerThousand: 660, thresholdCents: 5_000_000, baseCents: 45_600 },
  },
  {
    key: "100001-500000",
    label: "$100,001 to $500,000",
    minCents: 10_000_100,
    maxCents: 50_000_000,
    permitCents: null,
    planReviewCents: 40_000,
    increment: { centsPerThousand: 432, thresholdCents: 10_000_000, baseCents: 78_600 },
  },
  {
    key: "over-500000",
    label: "Over $500,000",
    minCents: 50_000_100,
    maxCents: null,
    permitCents: null,
    planReviewCents: 130_000,
    increment: { centsPerThousand: 125, thresholdCents: 50_000_000, baseCents: 251_300 },
  },
] as const;

/** Schedule A/B plumbing and electrical floors, as published. */
export const DUR_ELECTRICAL_MINIMUM_PERMIT_CENTS = 6_500;
export const DUR_ELECTRICAL_MINIMUM_ROUGH_IN_RESIDENTIAL_CENTS = 10_000;
export const DUR_ELECTRICAL_MINIMUM_ROUGH_IN_COMMERCIAL_CENTS = 15_000;

/** "A $5.00 surcharge will be added to the total for each plumbing, electrical, or mechanical application that is submitted manually (paper submittal)…" */
export const DUR_PAPER_APPLICATION_SURCHARGE_CENTS = 500;

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
    effectiveFrom: DUR_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

const SCHEDULE = "custom.building_schedule";
const PLUMBING_SCOPE = "custom.plumbing_schedule";

/** Which building schedule the application falls in. */
function scheduleIs(value: string): ConditionLeaf {
  return { field: SCHEDULE, op: "eq", value };
}

/** Which named item on Schedule F is being permitted. */
function buildingItemIs(value: string): ConditionLeaf {
  return { field: "custom.building_item", op: "eq", value };
}

function plumbingScopeIs(value: string): ConditionLeaf {
  return { field: PLUMBING_SCOPE, op: "eq", value };
}

/** A valuation band, closed at one cent below the next band's opening as printed. */
function valuationBand(minCents: number | null, maxCents: number | null): ConditionLeaf[] {
  const all: ConditionLeaf[] = [];
  if (minCents !== null) all.push({ field: "valuation", op: "gte", value: minCents });
  if (maxCents !== null) all.push({ field: "valuation", op: "lte", value: maxCents });
  return all;
}

function all(...conditions: ConditionLeaf[]): { all: ConditionLeaf[] } {
  return { all: conditions };
}

function countBand(field: ConditionField, min: number | null, max: number | null): ConditionLeaf[] {
  const all: ConditionLeaf[] = [{ field, op: "exists" }];
  if (min !== null) all.push({ field, op: "gte", value: min });
  if (max !== null) all.push({ field, op: "lte", value: max });
  return all;
}

/* -------------------------------------------------------------------------- */
/* Building                                                                   */
/* -------------------------------------------------------------------------- */

export function buildingRules(sourceId: string): FeeRuleRecord[] {
  const planReview = (id: string, code: string, amountCents: number, label: string, conditions: { all: ConditionLeaf[] }) =>
    rule(sourceId, {
      id,
      code,
      label,
      description: `${label}. Durham's building schedule publishes plan review as a second column beside every fee row and states "The Plan Review Fee must be paid at time of plan submittal with credit card, check or cash", so it is charged with the permit it belongs to. The amounts already include the technology surcharge.`,
      feeType: "flat",
      config: { amountCents },
      conditions,
      componentType: "plan_review",
      priority: 200,
    });

  /* Schedule A ---------------------------------------------------------------- */

  const scheduleA = rule(sourceId, {
    id: "dur-build-a",
    code: "BUILD-A-NEW-DWELLING",
    label: "Schedule A, new one- or two-family dwelling, by gross area",
    description:
      'Building Permit Fee Schedule, Schedule A: "New Residential Dwellings (One and Two Family, Including Townhouse Unit Ownership)" — eight brackets from "Up to 1200 sq. ft. (gross area) $146.00" to "5001 sq. ft. and over $810.00". The bracket a house falls in is decided by its gross area, not by its valuation, which is the first thing a reader coming from a valuation-priced city has to know.',
    feeType: "tiered_table",
    config: {
      basis: "square_footage",
      tiers: DUR_SCHEDULE_A_BANDS.map((band) => ({
        upToCents: band.upTo,
        amountCents: band.permitCents,
      })),
    },
    conditions: all(scheduleIs("new_dwelling")),
  });

  const scheduleAPlan = planReview(
    "dur-build-a-plan",
    "BUILD-A-PLAN-REVIEW",
    DUR_SCHEDULE_A_PLAN_REVIEW_CENTS,
    "Schedule A plan review, $146.00 in every bracket",
    all(scheduleIs("new_dwelling")),
  );

  /* Schedule B ---------------------------------------------------------------- */

  const scheduleB = rule(sourceId, {
    id: "dur-build-b",
    code: "BUILD-B-MULTIFAMILY",
    label: "Schedule B, multi-family, per dwelling unit",
    description:
      'Schedule B: "New Multi-family Residential Buildings (Apartments, Condominiums, Triplex and Fourplex) — First unit $300.00; Each additional unit, per building $150.00." One base charge covers the first unit and the per-unit rate starts with the second, which is what "first unit / each additional unit" means.',
    feeType: "per_unit",
    config: {
      unit: "dwelling_units",
      baseCents: 30_000,
      thresholdUnits: 1,
      centsPerUnit: 15_000,
    },
    conditions: all(scheduleIs("multifamily")),
  });

  const scheduleBPlan = planReview(
    "dur-build-b-plan",
    "BUILD-B-PLAN-REVIEW",
    45_000,
    "Schedule B plan review, $450.00 for the first unit with no additional fee",
    all(scheduleIs("multifamily")),
  );

  /* Schedule C ---------------------------------------------------------------- */

  const scheduleC = rule(sourceId, {
    id: "dur-build-c",
    code: "BUILD-C-ACCESSORY",
    label: "Schedule C, accessory building with no footing",
    description:
      'Schedule C, "Accessory Buildings": "No footing $50.00 / Footing $100.00". The $50.00 footing difference is charged by the rule below when the applicant says a footing is required, so a reader who has not decided yet is not charged for it.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: all(scheduleIs("accessory")),
  });

  const scheduleCFooting = rule(sourceId, {
    id: "dur-build-c-footing",
    code: "BUILD-C-FOOTING",
    label: "Schedule C footing, $50.00 when a footing is required",
    description: 'Schedule C: "Footing … $100.00", which is the $50.00 no-footing fee plus this $50.00 difference.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: all(scheduleIs("accessory"), { field: "custom.footing", op: "eq", value: true }),
  });

  const scheduleCPlan = planReview(
    "dur-build-c-plan",
    "BUILD-C-PLAN-REVIEW",
    5_000,
    "Schedule C plan review, $50.00",
    all(scheduleIs("accessory")),
  );

  /* Schedule D ---------------------------------------------------------------- */

  const scheduleD = rule(sourceId, {
    id: "dur-build-d",
    code: "BUILD-D-RENOVATION",
    label: "Schedule D, renovation or addition, by construction contract value",
    description:
      'Schedule D, "Residential Renovations and Additions": "0 to $10,000.00 — no footing $125.00" and "$10,001.00 and over — no footing $250.00", "(add $50.00 if footing required)" under both. Priced from the construction contract value, which the schedule states is the basis unless a reason is identified to use other information.',
    feeType: "tiered_table",
    config: {
      basis: "valuation",
      tiers: [
        { upToCents: 1_000_000, amountCents: 12_500 },
        { upToCents: null, amountCents: 25_000 },
      ],
    },
    conditions: all(scheduleIs("renovation_addition")),
  });

  const scheduleDFooting = rule(sourceId, {
    id: "dur-build-d-footing",
    code: "BUILD-D-FOOTING",
    label: "Schedule D footing, $50.00 when a footing is required",
    description: 'Schedule D: "(add $50.00 if footing required)" — printed under both value bands.',
    feeType: "flat",
    config: { amountCents: 5_000 },
    conditions: all(scheduleIs("renovation_addition"), { field: "custom.footing", op: "eq", value: true }),
  });

  const scheduleDPlan = planReview(
    "dur-build-d-plan",
    "BUILD-D-PLAN-REVIEW",
    12_500,
    "Schedule D plan review, $125.00 in both value bands",
    all(scheduleIs("renovation_addition")),
  );

  /* Schedule E ---------------------------------------------------------------- */

  const scheduleE = DUR_SCHEDULE_E_BANDS.map((band) => {
    const conditions = all(scheduleIs("nonresidential"), ...valuationBand(band.minCents, band.maxCents));

    if (band.increment === null) {
      return rule(sourceId, {
        id: `dur-build-e-${band.key}`,
        code: `BUILD-E-${band.key.toUpperCase()}`,
        label: `Schedule E, nonresidential ${band.label}, permit fee`,
        description: `Schedule E, "Nonresidential Buildings": "${band.label}" — $104.00, with plan review $104.00. Cost is based on construction contracts unless a reason is identified to base it on other information.`,
        feeType: "flat",
        config: { amountCents: band.permitCents ?? 10_400 },
        conditions,
      });
    }

    const { centsPerThousand, thresholdCents, baseCents } = band.increment;
    return rule(sourceId, {
      id: `dur-build-e-${band.key}`,
      code: `BUILD-E-${band.key.toUpperCase()}`,
      label: `Schedule E, nonresidential ${band.label}, permit fee`,
      description: `Schedule E: "${band.label}" — a base fee of $${(baseCents / 100).toFixed(2)} plus $${(centsPerThousand / 100).toFixed(2)} per $1,000 of construction contract value over $${(thresholdCents / 100).toFixed(0)}, or fraction thereof. The increment is printed on the permit column only: the plan review column beside it is a flat amount.`,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        centsPerThousand,
        thresholdCents,
        incrementCents: 100_000,
        baseCents,
      },
      conditions,
    });
  });

  const scheduleEPlan = DUR_SCHEDULE_E_BANDS.map((band) =>
    planReview(
      `dur-build-e-plan-${band.key}`,
      `BUILD-E-PLAN-${band.key.toUpperCase()}`,
      band.planReviewCents,
      `Schedule E plan review, ${band.label}: $${(band.planReviewCents / 100).toFixed(2)}`,
      all(scheduleIs("nonresidential"), ...valuationBand(band.minCents, band.maxCents)),
    ),
  );

  /* Schedule F ---------------------------------------------------------------- */

  const scheduleFItems: Array<{
    item: string;
    code: string;
    label: string;
    cents: number;
    quote: string;
    extra?: ConditionLeaf;
  }> = [
    {
      item: "mobile_home",
      code: "BUILD-F-MOBILE-HOME",
      label: "Mobile home, unit installation and foundation",
      cents: 15_000,
      quote: "Mobile Home (unit installation and foundation) — $150.00",
    },
    {
      item: "modular_unit",
      code: "BUILD-F-MODULAR-UNIT",
      label: "Modular unit, unit installation and foundation",
      cents: 20_000,
      quote: "Modular Units (unit installation and foundation) — $200.00",
    },
    {
      item: "moving",
      code: "BUILD-F-MOVING",
      label: "Moving permit, including new foundation",
      cents: 12_500,
      quote: "Moving Permit (including new foundation) — $125.00",
    },
    {
      item: "demolition",
      code: "BUILD-F-DEMOLITION-UP-TO-5000",
      label: "Demolition permit, up to 5,000 sq ft",
      cents: 7_500,
      quote: "Demolition Permit: Up to 5,000 s.f. — $75.00",
      extra: { field: "square_footage", op: "lte", value: 5_000 },
    },
    {
      item: "demolition",
      code: "BUILD-F-DEMOLITION-OVER-5000",
      label: "Demolition permit, over 5,000 sq ft",
      cents: 15_000,
      quote: "Demolition Permit: Over 5,000 s.f. — $150.00",
      extra: { field: "square_footage", op: "gt", value: 5_000 },
    },
    {
      item: "demolition_with_permit",
      code: "BUILD-F-DEMOLITION-WITH-PERMIT",
      label: "Demolition associated with a forthcoming permit",
      cents: 7_500,
      quote: "Demolition associated with a forthcoming permit — $75.00",
    },
    {
      item: "reroofing",
      code: "BUILD-F-REROOFING",
      label: "Residential reroofing, addition",
      cents: 7_500,
      quote: "Residential Reroofing (addition) — $75.00",
    },
    {
      item: "deck",
      code: "BUILD-F-DECK",
      label: "Residential deck, single and two-family",
      cents: 10_000,
      quote: "Residential decks (single and two-family) — $100.00",
    },
    {
      item: "change_of_occupancy",
      code: "BUILD-F-CHANGE-OF-OCCUPANCY",
      label: "Change of occupancy permit, no other building permit required",
      cents: 5_000,
      quote: "Change of Occupancy Permit (if no building permit is otherwise required/no construction necessary) — $50.00",
    },
    {
      item: "roofing_commercial",
      code: "BUILD-F-ROOFING-COMMERCIAL-UP-TO-20000",
      label: "Commercial roofing or reroofing, $0 to $20,000",
      cents: 10_000,
      quote: "Commercial Roofing/Reroofing $0-$20,000 — $100.00",
      extra: { field: "valuation", op: "lte", value: 2_000_000 },
    },
    {
      item: "roofing_commercial",
      code: "BUILD-F-ROOFING-COMMERCIAL-OVER-20000",
      label: "Commercial roofing or reroofing, over $20,000",
      cents: 15_000,
      quote: "Commercial Roofing/Reroofing Over $20,000 — $150.00",
      extra: { field: "valuation", op: "gt", value: 2_000_000 },
    },
  ];

  const scheduleF = scheduleFItems.map((item) =>
    rule(sourceId, {
      id: `dur-build-f-${item.item}-${item.code.toLowerCase()}`,
      code: item.code,
      label: item.label,
      description: `Building Permit Fee Schedule, Schedule F (Miscellaneous): "${item.quote}".`,
      feeType: "flat",
      config: { amountCents: item.cents },
      conditions: item.extra
        ? all(buildingItemIs(item.item), item.extra)
        : all(buildingItemIs(item.item)),
    }),
  );

  return [
    scheduleA,
    scheduleAPlan,
    scheduleB,
    scheduleBPlan,
    scheduleC,
    scheduleCFooting,
    scheduleCPlan,
    scheduleD,
    scheduleDFooting,
    scheduleDPlan,
    ...scheduleE,
    ...scheduleEPlan,
    ...scheduleF,
  ];
}

/* -------------------------------------------------------------------------- */
/* Electrical                                                                 */
/* -------------------------------------------------------------------------- */

export function electricalRules(sourceId: string): FeeRuleRecord[] {
  const service = rule(sourceId, {
    id: "dur-elec-service-100-200",
    code: "ELEC-SERVICE-100-200",
    label: "House service, 100 to 200 amperes",
    description:
      'Electrical Permit Fee Schedule, Schedule A: "100 amp to 200 amp service $156.00", for new residential dwellings and multi-family — "For house service of Multi-Family projects, a separate Electrical Permit is required for each house meter."',
    feeType: "flat",
    config: { amountCents: 15_600 },
    conditions: { all: [{ field: "custom.electrical_service", op: "eq", value: "service_100_200" }] },
  });

  const service400 = rule(sourceId, {
    id: "dur-elec-service-400",
    code: "ELEC-SERVICE-400",
    label: "House service, 400 amperes",
    description: 'Electrical Permit Fee Schedule, Schedule A: "400 amp service $187.00".',
    feeType: "flat",
    config: { amountCents: 18_700 },
    conditions: { all: [{ field: "custom.electrical_service", op: "eq", value: "service_400" }] },
  });

  const outlets = rule(sourceId, {
    id: "dur-elec-outlets",
    code: "ELEC-OUTLETS",
    label: "Outlets for lights, receptacles and switches",
    description:
      'Schedule B: "1 - 10 outlets $21.00 / Each additional outlet $0.83", for outlets on general-purpose branch circuits with two or more outlets. The flat charge covers the first ten together, so eleven outlets are $21.83 and not $21.00 plus eleven rates.',
    feeType: "per_unit",
    config: { unit: "outlets", baseCents: 2_100, thresholdUnits: 10, centsPerUnit: 83 },
    conditions: { all: [{ field: "custom.outlets", op: "exists" }] },
  });

  const fixtures = rule(sourceId, {
    id: "dur-elec-fixtures",
    code: "ELEC-FIXTURES",
    label: "Electrical fixtures",
    description:
      'Schedule C, "Fixtures": "1 to 10 fixtures $21.00 / Each additional fixture $0.83" — the same shape as the outlet row, priced as its own line item.',
    feeType: "per_unit",
    config: { unit: "fixtures", baseCents: 2_100, thresholdUnits: 10, centsPerUnit: 83 },
    conditions: { all: [{ field: "fixtures", op: "exists" }] },
  });

  const waterHeaters = rule(sourceId, {
    id: "dur-elec-water-heaters",
    code: "ELEC-WATER-HEATERS",
    label: "Electric water heaters or boilers",
    description:
      'Schedule E, "Branch Circuits Supplying Appliances, Devices or Equipment": "Electric water heaters or boilers $10.90" each.',
    feeType: "per_unit",
    config: { unit: "heaters", centsPerUnit: 1_090 },
    conditions: { all: [{ field: "custom.heaters", op: "exists" }] },
  });

  const signCircuits = rule(sourceId, {
    id: "dur-elec-sign-circuits",
    code: "ELEC-SIGN-CIRCUITS",
    label: "Electric signs and outline lighting, by circuit",
    description:
      'Schedule E: "Electric signs and outline lighting: First circuit $10.90 / Each additional circuit for same sign $3.22".',
    feeType: "per_unit",
    config: { unit: "circuits", baseCents: 1_090, thresholdUnits: 1, centsPerUnit: 322 },
    conditions: { all: [{ field: "custom.circuits", op: "exists" }] },
  });

  const serviceEquipment = rule(sourceId, {
    id: "dur-elec-service-equipment",
    code: "ELEC-SERVICE-EQUIPMENT",
    label: "Service equipment by ampacity of the buses",
    description:
      'Schedule F, "Miscellaneous Wiring Not Covered in Schedules A,B,C,D or E": "Service equipment as determined by ampacity of buses in equipment: Up to 100 amperes $34.00 / Each additional 100 amperes or fraction thereof $6.97". Priced from the amperage the applicant gives, and excluded when Schedule A house service has been selected, because the two rows are alternatives.',
    feeType: "per_thousand",
    config: {
      basis: "amperage",
      centsPerThousand: 6_970,
      thresholdCents: 100,
      incrementCents: 100,
      baseCents: 3_400,
    },
    conditions: {
      all: [
        { field: "custom.electrical_service", op: "absent" },
        { field: "custom.amperage", op: "exists" },
      ],
    },
  });

  const solarResidential = rule(sourceId, {
    id: "dur-elec-solar-residential",
    code: "ELEC-SOLAR-RESIDENTIAL",
    label: "Solar photovoltaic panel inspection, residential",
    description: 'Schedule G, "Miscellaneous": "Solar panel inspections — Residential $100.00".',
    feeType: "flat",
    config: { amountCents: 10_000 },
    conditions: { all: [{ field: "custom.electrical_item", op: "eq", value: "solar_residential" }] },
  });

  const solarCommercial = rule(sourceId, {
    id: "dur-elec-solar-commercial",
    code: "ELEC-SOLAR-COMMERCIAL",
    label: "Solar photovoltaic panel inspection, commercial",
    description:
      'Schedule G, "Miscellaneous": "Solar panel inspections — Commercial roof top $150.00 / Commercial ground mounted $150.00".',
    feeType: "flat",
    config: { amountCents: 15_000 },
    conditions: { all: [{ field: "custom.electrical_item", op: "eq", value: "solar_commercial" }] },
  });

  const mobileHome = rule(sourceId, {
    id: "dur-elec-mobile-home",
    code: "ELEC-MOBILE-HOME",
    label: "Mobile home, one inspection only",
    description: 'Schedule G, "Miscellaneous": "Mobile Home: One inspection only $65.00".',
    feeType: "flat",
    config: { amountCents: 6_500 },
    conditions: { all: [{ field: "custom.electrical_item", op: "eq", value: "mobile_home" }] },
  });

  const modularUnit = rule(sourceId, {
    id: "dur-elec-modular-unit",
    code: "ELEC-MODULAR-UNIT",
    label: "Modular unit",
    description: 'Schedule G, "Miscellaneous": "Modular Unit $69.00".',
    feeType: "flat",
    config: { amountCents: 6_900 },
    conditions: { all: [{ field: "custom.electrical_item", op: "eq", value: "modular_unit" }] },
  });

  const paperSurcharge = rule(sourceId, {
    id: "dur-elec-paper-surcharge",
    code: "ELEC-PAPER-SURCHARGE",
    label: "Paper application surcharge",
    description:
      '**SURCHARGE FOR PAPER APPLICATION** — A $5.00 surcharge will be added to the total for each plumbing, electrical, or mechanical application that is submitted manually (paper submittal) as opposed to an electronic submittal (paperless submittal).',
    feeType: "flat",
    config: { amountCents: DUR_PAPER_APPLICATION_SURCHARGE_CENTS },
    conditions: { all: [{ field: "custom.paper_application", op: "eq", value: true }] },
    componentType: "surcharge",
    priority: 800,
  });

  /**
   * Three floors on one permit, charged in ascending order so that only the shortfall
   * the schedule actually asks for is added: the $65.00 minimum brings the subtotal to
   * $65.00, and a rough-in floor then measures the *raised* subtotal and tops it up to
   * $100.00 or $150.00. `permit_fee` is re-injected before every rule, so the second
   * floor reads what the first one charged.
   */
  const minimumPermit = rule(sourceId, {
    id: "dur-elec-minimum-permit",
    code: "ELEC-MINIMUM-PERMIT",
    label: "Minimum electrical permit fee, $65.00",
    description:
      'Schedule G: "Minimum electrical permit fee $65.00". A floor on the permit rather than on any one row, so it is measured against everything else charged on this permit — and only while that subtotal is below the floor.',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: DUR_ELECTRICAL_MINIMUM_PERMIT_CENTS },
    conditions: { all: [{ field: "permit_fee", op: "lt", value: DUR_ELECTRICAL_MINIMUM_PERMIT_CENTS }] },
    priority: 500,
  });

  const minimumRoughInResidential = rule(sourceId, {
    id: "dur-elec-minimum-rough-in-residential",
    code: "ELEC-MINIMUM-ROUGH-IN-RESIDENTIAL",
    label: "Minimum fee for a residential permit requiring a rough-in inspection, $100.00",
    description:
      'Schedule G: "Minimum fee for any permit requiring a rough-in inspection: Commercial $150.00 / Residential $100.00". Assessed per permit, measured against what the permit already charges, and reached after the $65.00 minimum has been applied.',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: DUR_ELECTRICAL_MINIMUM_ROUGH_IN_RESIDENTIAL_CENTS },
    conditions: {
      all: [
        { field: "custom.rough_in", op: "eq", value: true },
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "permit_fee", op: "lt", value: DUR_ELECTRICAL_MINIMUM_ROUGH_IN_RESIDENTIAL_CENTS },
      ],
    },
    priority: 510,
  });

  const minimumRoughInCommercial = rule(sourceId, {
    id: "dur-elec-minimum-rough-in-commercial",
    code: "ELEC-MINIMUM-ROUGH-IN-COMMERCIAL",
    label: "Minimum fee for a commercial permit requiring a rough-in inspection, $150.00",
    description: 'Schedule G: "Minimum fee for any permit requiring a rough-in inspection … Commercial $150.00".',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: DUR_ELECTRICAL_MINIMUM_ROUGH_IN_COMMERCIAL_CENTS },
    conditions: {
      all: [
        { field: "custom.rough_in", op: "eq", value: true },
        { field: "occupancy", op: "neq", value: "residential" },
        { field: "permit_fee", op: "lt", value: DUR_ELECTRICAL_MINIMUM_ROUGH_IN_COMMERCIAL_CENTS },
      ],
    },
    priority: 510,
  });

  return [
    service,
    service400,
    outlets,
    fixtures,
    waterHeaters,
    signCircuits,
    serviceEquipment,
    solarResidential,
    solarCommercial,
    mobileHome,
    modularUnit,
    paperSurcharge,
    minimumPermit,
    minimumRoughInResidential,
    minimumRoughInCommercial,
  ];
}

/* -------------------------------------------------------------------------- */
/* Plumbing                                                                   */
/* -------------------------------------------------------------------------- */

export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  const dwelling = rule(sourceId, {
    id: "dur-plumb-a",
    code: "PLUMB-A-NEW-DWELLING",
    label: "Schedule A, new dwelling, all fixtures and building water and sewer",
    description:
      'Plumbing Permit Fee Schedule, Schedule A: "New Residential Construction; One and Two Family and Townhouse Unit Ownership; Installation of New Plumbing Fixtures; Building Water and Sewer Service: All dwellings $170.00". One flat fee covers the dwelling.',
    feeType: "flat",
    config: { amountCents: 17_000 },
    conditions: { all: [plumbingScopeIs("new_dwelling")] },
  });

  const multifamily = rule(sourceId, {
    id: "dur-plumb-b",
    code: "PLUMB-B-MULTIFAMILY",
    label: "Schedule B, multi-family, per fixture with a $127.00 minimum",
    description:
      'Schedule B: "New Multifamily Construction (Three and Four Family, Apartments); Installation of New Plumbing Fixtures; Building Water and Sewer: Per Fixture $6.24 / Minimum $127.00". The minimum sits beside the per-fixture rate in the schedule, so it is a floor on this row rather than on the whole permit.',
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 624 },
    minimumCents: 12_700,
    conditions: { all: [plumbingScopeIs("multifamily"), { field: "fixtures", op: "exists" }] },
  });

  const nonresidential = (id: string, code: string, minimumCents: number, withWaterSewer: boolean) =>
    rule(sourceId, {
      id,
      code,
      label: `Schedule C, nonresidential, per fixture with a $${(minimumCents / 100).toFixed(2)} minimum${withWaterSewer ? " (with water and sewer)" : " (without water and sewer)"}`,
      description: withWaterSewer
        ? 'Schedule C: "New Nonresidential … Per Fixture $7.90 / Minimum (with water & sewer) $265.00".'
        : 'Schedule C: "New Nonresidential: Installation of New Plumbing Fixtures; Building Water and Sewer: Per Fixture $7.90 / Minimum (without water & sewer) $187.00". The schedule publishes two minima for this one row, selected by whether the job includes the building water and sewer connection, so they are two rules rather than one guessing.',
      feeType: "per_unit",
      config: { unit: "fixtures", centsPerUnit: 790 },
      minimumCents,
      conditions: {
        all: [
          plumbingScopeIs("nonresidential"),
          { field: "fixtures", op: "exists" },
          withWaterSewer
            ? { field: "custom.water_sewer", op: "eq", value: true }
            : {
                any: [
                  { field: "custom.water_sewer", op: "absent" },
                  { field: "custom.water_sewer", op: "eq", value: false },
                ],
              },
        ],
      },
    });

  const addition = [
    rule(sourceId, {
      id: "dur-plumb-d-sewer-water",
      code: "PLUMB-D-SEWER-WATER",
      label: "Schedule D, building sewer and water",
      description:
        'Schedule D, "Additions, Residential and Nonresidential; Installation of New Plumbing Fixtures; Building Water and Sewer": the schedule lists "Building sewer and water $65.00" as its own line above the fixture rows, so it is charged as its own line when the job includes building sewer or water work, and not otherwise.',
      feeType: "flat",
      config: { amountCents: 6_500 },
      conditions: { all: [plumbingScopeIs("addition"), { field: "custom.sewer_water", op: "eq", value: true }] },
    }),
    rule(sourceId, {
      id: "dur-plumb-d-fixtures-1-7",
      code: "PLUMB-D-FIXTURES-1-7",
      label: "Schedule D, 1 to 7 fixtures",
      description: 'Schedule D: "1 -7 fixtures $94.00".',
      feeType: "flat",
      config: { amountCents: 9_400 },
      conditions: { all: [plumbingScopeIs("addition"), ...countBand("fixtures", 1, 7)] },
    }),
    rule(sourceId, {
      id: "dur-plumb-d-fixtures-8-15",
      code: "PLUMB-D-FIXTURES-8-15",
      label: "Schedule D, 8 to 15 fixtures",
      description: 'Schedule D: "8-15 fixtures $119.00".',
      feeType: "flat",
      config: { amountCents: 11_900 },
      conditions: { all: [plumbingScopeIs("addition"), ...countBand("fixtures", 8, 15)] },
    }),
    rule(sourceId, {
      id: "dur-plumb-d-fixtures-over-15",
      code: "PLUMB-D-FIXTURES-OVER-15",
      label: "Schedule D, over 15 fixtures, per fixture",
      description: 'Schedule D: "Over 15 fixtures (per fixture) $7.90".',
      feeType: "per_unit",
      config: { unit: "fixtures", centsPerUnit: 790 },
      conditions: { all: [plumbingScopeIs("addition"), ...countBand("fixtures", 16, null)] },
    }),
  ];

  const replacement = [
    rule(sourceId, {
      id: "dur-plumb-e-1-4",
      code: "PLUMB-E-REPLACEMENT-1-4",
      label: "Schedule E, fixture replacement, 1 to 4 fixtures",
      description:
        'Schedule E, "Fixture Replacement; No Change to Rough-in": "1-4 fixtures $65.00".',
      feeType: "flat",
      config: { amountCents: 6_500 },
      conditions: { all: [plumbingScopeIs("replacement"), ...countBand("fixtures", 1, 4)] },
    }),
    rule(sourceId, {
      id: "dur-plumb-e-5-plus",
      code: "PLUMB-E-REPLACEMENT-5-PLUS",
      label: "Schedule E, fixture replacement, 5 fixtures and over, per fixture",
      description: 'Schedule E: "5 fixtures and over: Per fixture $6.86".',
      feeType: "per_unit",
      config: { unit: "fixtures", centsPerUnit: 686 },
      conditions: { all: [plumbingScopeIs("replacement"), ...countBand("fixtures", 5, null)] },
    }),
    rule(sourceId, {
      id: "dur-plumb-e-water-heater",
      code: "PLUMB-E-WATER-HEATER",
      label: "Electric water heater permit",
      description:
        'Schedule E: "Electric water heater (permit required) $65.00" — a permit of its own, charged when the applicant is installing one.',
      feeType: "flat",
      config: { amountCents: 6_500 },
      conditions: { all: [{ field: "custom.water_heater", op: "eq", value: true }] },
    }),
  ];

  const miscItems: Array<{ item: string; code: string; label: string; cents: number; quote: string }> = [
    {
      item: "residential_sprinkler",
      code: "PLUMB-F-SPRINKLER",
      label: "Residential sprinkler permit",
      cents: 17_000,
      quote: "Residential sprinkler permit $170.00",
    },
    {
      item: "mobile_unit",
      code: "PLUMB-F-MOBILE-UNIT",
      label: "Mobile unit",
      cents: 6_500,
      quote: "Mobile units $65.00",
    },
    {
      item: "modular_unit",
      code: "PLUMB-F-MODULAR-UNIT",
      label: "Modular unit",
      cents: 7_800,
      quote: "Modular units $78.00",
    },
    {
      item: "other_water_sewer",
      code: "PLUMB-F-OTHER-WATER-SEWER",
      label: "Work not listed, with a water or sewer connection",
      cents: 6_500,
      quote: "Not listed above but has water or sewer connection $65.00",
    },
  ];

  const miscellany = miscItems.map((item) =>
    rule(sourceId, {
      id: `dur-plumb-f-${item.item}`,
      code: item.code,
      label: item.label,
      description: `Plumbing Permit Fee Schedule, Schedule F (Miscellaneous): "${item.quote}".`,
      feeType: "flat",
      config: { amountCents: item.cents },
      conditions: { all: [{ field: "custom.plumbing_item", op: "eq", value: item.item }] },
    }),
  );

  const paperSurcharge = rule(sourceId, {
    id: "dur-plumb-paper-surcharge",
    code: "PLUMB-PAPER-SURCHARGE",
    label: "Paper application surcharge",
    description:
      '**SURCHARGE FOR PAPER APPLICATION** — A $5.00 surcharge will be added to the total for each plumbing, electrical, or mechanical application that is submitted manually (paper submittal) as opposed to an electronic submittal (paperless submittal).',
    feeType: "flat",
    config: { amountCents: DUR_PAPER_APPLICATION_SURCHARGE_CENTS },
    conditions: { all: [{ field: "custom.paper_application", op: "eq", value: true }] },
    componentType: "surcharge",
    priority: 800,
  });

  return [dwelling, multifamily, ...addition, ...replacement, ...miscellany, paperSurcharge,
    nonresidential("dur-plumb-c", "PLUMB-C-NONRESIDENTIAL", 18_700, false),
    nonresidential("dur-plumb-c-water-sewer", "PLUMB-C-NONRESIDENTIAL-WATER-SEWER", 26_500, true),
  ];
}

export const DUR_BUILDING_RULES: FeeRuleRecord[] = buildingRules(DUR_BUILDING_SOURCE_KEY);
export const DUR_ELECTRICAL_RULES: FeeRuleRecord[] = electricalRules(DUR_ELECTRICAL_SOURCE_KEY);
export const DUR_PLUMBING_RULES: FeeRuleRecord[] = plumbingRules(DUR_PLUMBING_SOURCE_KEY);
