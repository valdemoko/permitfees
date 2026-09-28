import type {
  ConditionField,
  ConditionLeaf,
  ExactRate,
  FeeRuleRecord,
  FloorTableEntry,
  RateTableEntry,
} from "@/lib/calc/types";

/**
 * Oak Park, Illinois — **the jurisdiction that multiplies the ICC construction cost chart by
 * a published factor, and prices electrical and plumbing as separate permits of their own.**
 *
 * The Village's *2026 Construction Fees*, adopted by the Annual Fee Ordinance (§7-8-1,
 * reference §7-8-2 for administration) and effective 2026-03-01, prices new construction and
 * additions as
 *
 *   permit fee = Area (SF) × Construction Cost (CC) × .0194
 *     CC = the International Code Council's square-foot construction cost, read from the
 *          chart the schedule reproduces (use group × construction type)
 *
 * and remodeling work as `SF × CC × .008` with a published floor ($300 residential, $500
 * multi-family/commercial/institutional). The chart is 27 use groups across nine
 * construction types, with five cells printed **NP — Not Permitted**, which is the
 * schedule's way of saying it publishes no cost for that combination at all.
 *
 * **Why the chart is a lookup table with a multiplier rather than one rate.** The `.0194` is
 * printed beside the chart, not as a column of it, so a rule whose rate was pre-multiplied
 * would print an amount the document never contains ($4.230752 per square foot) and hide the
 * figure a reader can check ($218.08, for an R-3 Type IIIA building). The cell therefore
 * stays the chart's own number and `rateMultiplier` carries the published factor, which is
 * also why the engine's working shows both.
 *
 * **Why the trades are permits of their own.** The Village's Building Permits page says it in
 * as many words: "A separate permit from a general construction permit is necessary because
 * electrical work requires specialized skills and knowledge", and the same for plumbing.
 * The schedule prices them per unit of what is installed — electrical at $100 per circuit or
 * $175 per system, plumbing at $100 per unit of alteration or $175 per system installation —
 * so a trade permit here is a small page with a real rate, not a share of the building fee.
 *
 * Deliberately **not** modelled, and named on the pages instead: the rows the schedule
 * charges *per system* or *per type of work* where the count is not one of this calculator's
 * facts (fire alarm and fire sprinkler at $200 each, the two "Alteration – General" rows at
 * $150 or $250 per type of work), and the two rows with a per-unit-or-per-square-foot
 * alternative that needs the greater of two products (interior demolition at $300 per unit or
 * $0.35/SF, demolition of a structure at $5,000 or $0.35/SF). See
 * `research/illinois/oak-park.md` §6.
 */

/** Construction fees effective 2026-03-01; the PDF is updated 2026-01-26. */
export const OP_FEE_EFFECTIVE_FROM = "2026-03-01";

export const OP_FEE_SCHEDULE_SOURCE_KEY = "oak-park-2026-construction-fees";
export const OP_PERMITS_PAGE_SOURCE_KEY = "oak-park-building-permits-page";

/** The two published multipliers: `.0194` for new construction, `.008` for remodeling. */
export const OP_NEW_CONSTRUCTION_MULTIPLIER: ExactRate = { numerator: 194, denominator: 10_000 };
export const OP_REMODEL_MULTIPLIER: ExactRate = { numerator: 8, denominator: 1_000 };

/** `SF × CC × .008`, floored: $300.00 residential, $500.00 multi-family and commercial. */
export const OP_REMODEL_RESIDENTIAL_FLOOR_CENTS = 30_000;
export const OP_REMODEL_IBC_FLOOR_CENTS = 50_000;

export const OP_CONSTRUCTION_TYPES = [
  "IA",
  "IB",
  "IIA",
  "IIB",
  "IIIA",
  "IIIB",
  "IV",
  "VA",
  "VB",
] as const;

/**
 * The ICC square-foot construction cost chart, in dollars per square foot, use group (row) ×
 * construction type (column). `null` is a cell the chart prints **NP — Not Permitted**: the
 * schedule publishes no cost for that combination, so no table row is written and the rule is
 * excluded for publishing no rate rather than charged at a neighbour's rate.
 *
 * Transcribed from the 2026 Construction Fees PDF, whose footnote says the chart and its
 * footnotes come from *Building Valuation Data — August 2025* (ICC). Footnote 1: private
 * garages use Utility, miscellaneous; shell-only buildings deduct 20%. Footnote 2: R-3
 * unfinished basements are $31.50 per square foot.
 */
const ICC_CHART_ROWS: Array<[useGroup: string, perType: Array<number | null>]> = [
  ["A-1 with stage", [340.83, 328.7, 319.0, 306.43, 286.33, 278.03, 295.95, 266.82, 256.61]],
  ["A-1 without stage", [312.91, 300.78, 291.08, 278.51, 258.66, 250.36, 268.03, 239.14, 228.94]],
  ["A-2 nightclubs", [272.09, 264.11, 255.82, 246.06, 230.47, 224.21, 237.62, 209.58, 201.63]],
  ["A-2 restaurants", [271.09, 263.11, 253.82, 245.06, 228.47, 223.21, 236.62, 207.58, 200.63]],
  ["A-3 churches", [317.6, 305.47, 295.77, 283.2, 263.47, 255.18, 272.73, 243.96, 233.75]],
  ["A-3 general", [266.72, 254.59, 243.89, 232.31, 211.46, 204.17, 221.84, 191.95, 182.74]],
  ["A-4 arenas", [311.91, 299.78, 289.08, 277.51, 256.66, 249.36, 267.03, 237.14, 227.94]],
  ["B business", [301.4, 290.7, 280.27, 268.41, 245.13, 236.39, 258.1, 219.07, 209.02]],
  ["E educational", [290.11, 279.78, 270.34, 258.97, 240.45, 228.2, 250.06, 210.46, 203.65]],
  ["F-1 moderate hazard", [165.82, 157.82, 147.89, 142.31, 126.72, 120.56, 135.68, 105.08, 97.84]],
  ["F-2 low hazard", [164.82, 156.82, 147.89, 141.31, 126.72, 119.56, 134.68, 105.08, 96.84]],
  ["H-1 explosives", [154.69, 146.69, 137.76, 131.18, 116.91, 109.75, 124.55, 95.27, null]],
  ["H234 high hazard", [154.69, 146.69, 137.76, 131.18, 116.91, 109.75, 124.55, 95.27, 87.03]],
  ["H-5 HPM", [301.4, 290.7, 280.27, 268.41, 245.13, 236.39, 258.1, 219.07, 209.02]],
  ["I-1 supervised environment", [277.74, 267.79, 258.23, 248.47, 227.43, 221.32, 247.95, 204.83, 197.52]],
  ["I-2 hospitals", [473.85, 463.15, 452.71, 440.86, 415.54, null, 430.54, 389.49, null]],
  ["I-2 nursing homes", [326.9, 316.19, 305.76, 293.9, 272.12, null, 283.59, 246.07, null]],
  ["I-3 restrained", [318.07, 307.36, 296.93, 285.07, 264.31, 254.57, 274.76, 258.1, 226.2]],
  ["I-4 day care", [277.74, 267.79, 258.23, 248.47, 227.43, 221.32, 247.95, 204.83, 197.52]],
  ["M mercantile", [203.08, 195.1, 185.8, 177.05, 161.11, 155.85, 168.6, 140.22, 133.27]],
  ["R-1 hotels", [280.94, 270.99, 261.43, 251.67, 230.13, 224.02, 251.15, 207.53, 200.22]],
  ["R-2 multiple family", [234.59, 224.64, 215.08, 205.32, 185.03, 178.92, 204.8, 162.43, 155.12]],
  ["R-3 one and two family", [218.08, 212.28, 207.18, 202.76, 195.98, 189.0, 206.85, 182.23, 170.8]],
  ["R-4 care and assisted living", [277.74, 267.79, 258.23, 248.47, 227.43, 221.32, 247.95, 204.83, 197.52]],
  ["S-1 moderate hazard", [153.69, 145.69, 135.76, 130.18, 114.91, 108.75, 123.55, 93.27, 86.03]],
  ["S-2 low hazard", [152.69, 144.69, 135.76, 129.18, 114.91, 107.75, 122.55, 93.27, 85.03]],
  ["U utility miscellaneous", [122.65, 115.66, 107.12, 102.79, 91.57, 85.78, 97.87, 72.88, 69.64]],
];

/**
 * The chart as table rows: one per published cell, in dollars per square foot held as cents.
 * `Math.round(dollars * 100)` is exact for every published figure, all of which have two
 * decimals — `340.83` is `34083` cents and not a floating-point approximation of it.
 */
const ICC_CHART_ENTRIES: RateTableEntry[] = ICC_CHART_ROWS.flatMap(([useGroup, perType]) =>
  perType.flatMap((dollars, index) =>
    dollars === null
      ? []
      : [
          {
            values: [useGroup, OP_CONSTRUCTION_TYPES[index] as string],
            rate: { numerator: Math.round(dollars * 100), denominator: 1 },
          },
        ],
  ),
);

const ICC_KEYS = ["custom.use_group", "custom.construction_type"];

/** Every (use group, type) combination the chart publishes a cost for. */
export const OP_PUBLISHED_CELLS = ICC_CHART_ENTRIES.length;
/** Cells the chart prints NP — Not Permitted. */
export const OP_NOT_PERMITTED_CELLS = ICC_CHART_ROWS.length * OP_CONSTRUCTION_TYPES.length - OP_PUBLISHED_CELLS;

/** Which of the schedule's two construction rows the work falls in. */
export const OP_PROJECT_SCOPES = ["new_construction_addition", "remodel", "tenant_buildout"] as const;

/** Which plan review row the application falls in — the schedule prints twelve of them. */
export const OP_PLAN_REVIEW_SCOPES = [
  "residential_new_family",
  "residential_interior",
  "residential_accessory_unroofed",
  "residential_accessory_roofed",
  "ibc_new_or_alteration",
  "ibc_accessory_unroofed",
  "ibc_accessory_roofed",
] as const;

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
    effectiveFrom: OP_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

function customIs(field: ConditionField, value: string): ConditionLeaf {
  return { field, op: "eq", value };
}

function customIsOneOf(field: ConditionField, values: readonly string[]): ConditionLeaf[] {
  return [{ field, op: "in", value: [...values] }];
}

/* -------------------------------------------------------------------------- */
/* Building                                                                   */
/* -------------------------------------------------------------------------- */

/** The plan review rows, as the schedule prints them. */
const PLAN_REVIEW_ROWS: Array<{
  scope: string;
  code: string;
  label: string;
  quote: string;
  perUnit?: { unit: "dwelling_units" | "stories"; cents: number };
  flatCents?: number;
}> = [
  {
    scope: "residential_new_family",
    code: "PLAN-RES-NEW-FAMILY",
    label: "Plan review, new one- and two-family dwelling unit or addition",
    quote: '"New one (1) and two (2) family dwelling units/additions $500.00 per unit"',
    perUnit: { unit: "dwelling_units", cents: 50_000 },
  },
  {
    scope: "residential_interior",
    code: "PLAN-RES-INTERIOR",
    label: "Plan review, residential interior alterations",
    quote: '"Interior alterations $150.00 per floor"',
    perUnit: { unit: "stories", cents: 15_000 },
  },
  {
    scope: "residential_accessory_unroofed",
    code: "PLAN-RES-ACCESSORY-UNROOFED",
    label: "Plan review, non-roofed accessory structure (one and two family)",
    quote: '"Non-roofed accessory structures $50.00"',
    flatCents: 5_000,
  },
  {
    scope: "residential_accessory_roofed",
    code: "PLAN-RES-ACCESSORY-ROOFED",
    label: "Plan review, roofed accessory structure (one and two family)",
    quote: '"Roofed accessory structures $100.00"',
    flatCents: 10_000,
  },
  {
    scope: "ibc_new_or_alteration",
    code: "PLAN-IBC-NEW-ALTERATION",
    label: "Plan review, multifamily, commercial or institutional new structures, additions and alterations",
    quote: '"New structure/additions/alterations $500.00 per floor"',
    perUnit: { unit: "stories", cents: 50_000 },
  },
  {
    scope: "ibc_accessory_unroofed",
    code: "PLAN-IBC-ACCESSORY-UNROOFED",
    label: "Plan review, non-roofed accessory structure (multifamily, commercial, institutional)",
    quote: '"Non-roofed accessory structures $150.00"',
    flatCents: 15_000,
  },
  {
    scope: "ibc_accessory_roofed",
    code: "PLAN-IBC-ACCESSORY-ROOFED",
    label: "Plan review, roofed accessory structure (multifamily, commercial, institutional)",
    quote: '"Roofed accessory structures $200.00"',
    flatCents: 20_000,
  },
];

/** The building alteration rows that are a single published flat amount. */
const ALTERATION_ROWS: Array<{ scope: string; code: string; label: string; quote: string; cents: number }> = [
  {
    scope: "fencing",
    code: "ALT-FENCING",
    label: "Fencing",
    quote: 'Building Alterations – IRC (Residential): "Fencing $50.00"',
    cents: 5_000,
  },
  {
    scope: "structural_only",
    code: "ALT-STRUCTURAL-ONLY",
    label: "Structural only — building, repair or alteration",
    quote: 'Building Alterations – IRC (Residential): "Structural ONLY (building or repair or alteration) $200.00"',
    cents: 20_000,
  },
  {
    scope: "fire_alarm",
    code: "ALT-FIRE-ALARM",
    label: "Fire alarm system, new or altered",
    quote: 'Building Alterations – IRC (Residential): "Fire alarm system (new or altered) $200.00 each"',
    cents: 20_000,
  },
  {
    scope: "fire_sprinkler",
    code: "ALT-FIRE-SPRINKLER",
    label: "Fire sprinkler system, new or altered",
    quote: 'Building Alterations – IRC (Residential): "Fire sprinkler system (new or altered) $200.00 each"',
    cents: 20_000,
  },
  {
    scope: "parking_lot",
    code: "ALT-PARKING-LOT",
    label: "Parking lot, flatwork, grading or site development",
    quote:
      'Building Alterations – IBC: "Parking lot/flatwork/grading/site development (new or resurfacing) $250.00"',
    cents: 25_000,
  },
  {
    scope: "exterior_hardscape",
    code: "ALT-EXTERIOR-HARDSCAPE-RESIDENTIAL",
    label: "Exterior hardscape, residential — steps, stoops, driveways, sidewalks",
    quote:
      'Building Alterations – IRC (Residential): "Exterior Hardscape: steps, stoops, flatwork/concrete, driveways, sidewalks and similar $150.00 per alteration"',
    cents: 15_000,
  },
];

export function buildingRules(sourceId: string): FeeRuleRecord[] {
  const iccTable = {
    label: "Construction cost",
    keys: ICC_KEYS,
    rateUnit: "currency_per_unit" as const,
    entries: ICC_CHART_ENTRIES,
  };

  const newConstruction = rule(sourceId, {
    id: "op-build-new",
    code: "BUILD-NEW-CONSTRUCTION",
    label: "New construction and additions: area × construction cost × .0194",
    description:
      'New Construction and Additions: "Area (SF) x Construction Cost (CC) x .0194", where CC is the square-foot construction cost read from the ICC chart the schedule reproduces — 27 use groups across nine construction types. The Village prices from **area and type, with no valuation field at all**: the chart supplies the cost per square foot, and the .0194 printed beside it is the multiplier. The five cells the chart prints "NP — Not Permitted" publish no cost, and this page excludes the rule for them rather than charging a neighbouring use group\'s rate. The schedule notes the fee "does not include any exterior work or other required fees for Water Service, Sprinklers, Alarms, Electric Service, Demolition, Plan Review Fees".',
    feeType: "percent",
    config: {
      basis: "square_footage",
      rateUnit: "currency_per_unit",
      rateTables: [iccTable],
      rateMultiplier: OP_NEW_CONSTRUCTION_MULTIPLIER,
    },
    conditions: { all: [customIs("custom.project_scope", "new_construction_addition")] },
  });

  const remodel = rule(sourceId, {
    id: "op-build-remodel",
    code: "BUILD-REMODEL",
    label: "Remodel and tenant buildout: area × construction cost × .008",
    description:
      'Remodel – General: "SF x CC x .008 (min $300)" for residential work and "(min $500)" for multi-family, commercial and institutional work, the same chart and the same area basis as new construction at a smaller multiplier. A non-residential **tenant buildout** is the same row and the same floor: "Tenant buildout of non-residential, mixed use, commercial, and institutional structures — SF x CC x .008 (min $500)". The floor the schedule prints is charged when the product is smaller, and both figures are shown in the working.',
    feeType: "percent",
    config: {
      basis: "square_footage",
      rateUnit: "currency_per_unit",
      rateTables: [iccTable],
      rateMultiplier: OP_REMODEL_MULTIPLIER,
      floorTable: {
        label: "Minimum fee for this row",
        keys: ["custom.project_class"],
        entries: [
          { values: ["residential"], minimumCents: OP_REMODEL_RESIDENTIAL_FLOOR_CENTS },
          { values: ["ibc"], minimumCents: OP_REMODEL_IBC_FLOOR_CENTS },
        ] satisfies FloorTableEntry[],
      },
    },
    conditions: {
      all: customIsOneOf("custom.project_scope", ["remodel", "tenant_buildout"]),
    },
  });

  const planReview = PLAN_REVIEW_ROWS.map((row) =>
    rule(sourceId, {
      id: `op-plan-${row.scope.replace(/_/g, "-")}`,
      code: row.code,
      label: row.label,
      description: `Certificate of Occupancy / Plan Review & Other Fees: ${row.quote}. The schedule states that third-party plan review, "when required", is billed at the Village's cost plus these base fees, and that plan review fees are non-refundable (§7-8-2.A), so the amount is charged with the permit it belongs to.`,
      feeType: row.perUnit ? "per_unit" : "flat",
      config: row.perUnit
        ? { unit: row.perUnit.unit, centsPerUnit: row.perUnit.cents }
        : { amountCents: row.flatCents ?? 0 },
      componentType: "plan_review",
      priority: 200,
      conditions: { all: [customIs("custom.plan_review", row.scope)] },
    }),
  );

  const alterations = ALTERATION_ROWS.map((row) =>
    rule(sourceId, {
      id: `op-alt-${row.scope.replace(/_/g, "-")}`,
      code: row.code,
      label: row.label,
      description: `${row.quote}. Priced as one item of that kind; where the schedule charges the amount "each" or "per type of work" and the application covers several, each is charged separately — see the note on this page about the amounts it does not multiply.`,
      feeType: "flat",
      config: { amountCents: row.cents },
      conditions: { all: [customIs("custom.building_alteration", row.scope)] },
    }),
  );

  return [newConstruction, remodel, ...planReview, ...alterations];
}

/* -------------------------------------------------------------------------- */
/* Electrical                                                                 */
/* -------------------------------------------------------------------------- */

export function electricalRules(sourceId: string): FeeRuleRecord[] {
  const alteration = rule(sourceId, {
    id: "op-elec-alteration",
    code: "ELEC-ALTERATION",
    label: "Electrical alterations: $100.00 per circuit",
    description:
      'ELECTRICAL — "Miscellaneous (standalone) electrical alterations - replacements and improvements (wiring, outlets, lighting, fixtures, low voltage, exit signs)" at **$100.00 per circuit**. The unit is the circuit, not the outlet or the fixture, so a job that replaces twenty devices on six circuits is six circuits. The Village requires this as a permit separate from a general construction permit: "A separate permit from a general construction permit is necessary because electrical work requires specialized skills and knowledge."',
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 10_000 },
    conditions: {
      all: [
        customIs("custom.electrical_scope", "alteration"),
        { field: "custom.circuits", op: "exists" },
      ],
    },
  });

  const system = rule(sourceId, {
    id: "op-elec-system",
    code: "ELEC-SYSTEM-INSTALLATION",
    label: "Electrical system installations: $175.00 per system or unit",
    description:
      'ELECTRICAL — "Electrical system installation(s) (new or replacement of a system, unit and/or device includes, but is not limited to; services, feeders, alarm systems, panels, sub panels, generators, transformers, low-voltage systems, wind turbine, solar panel, EV Charger, ESS, and other applicable work)" at **$175.00 per system / unit**. One system — a service, a generator, a solar array — is the common case and is what this page charges; the schedule charges $175.00 for each, which the page states rather than multiplying, because the number of systems is not one of the facts this calculator asks for.',
    feeType: "flat",
    config: { amountCents: 17_500 },
    conditions: { all: [customIs("custom.electrical_scope", "system_installation")] },
  });

  return [alteration, system];
}

/* -------------------------------------------------------------------------- */
/* Plumbing                                                                   */
/* -------------------------------------------------------------------------- */

export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  /** A plumbing row priced per unit of what is installed. */
  const perUnit = (row: {
    scope: string;
    code: string;
    label: string;
    quote: string;
    cents: number;
  }) =>
    rule(sourceId, {
      id: `op-plumb-${row.scope.replace(/_/g, "-")}`,
      code: row.code,
      label: row.label,
      description: `${row.quote}. The unit is the fixture, device or unit of work the job touches, and the Village requires this as a permit separate from a general construction permit: "A permit separate from a general construction permit is required because plumbing requires specialized skills and knowledge."`,
      feeType: "percent",
      config: {
        basis: "fixtures",
        rateUnit: "currency_per_unit",
        rate: { numerator: row.cents, denominator: 1 },
      },
      conditions: {
        all: [customIs("custom.plumbing_scope", row.scope), { field: "fixtures", op: "exists" }],
      },
    });

  return [
    perUnit({
      scope: "alteration",
      code: "PLUMB-ALTERATION",
      label: "Plumbing alterations: $100.00 per unit",
      quote:
        'PLUMBING — "Miscellaneous (standalone) plumbing alteration(s) repair, replacement and improvement (piping, fixtures, and other applicable work)" at $100.00 per unit',
      cents: 10_000,
    }),
    perUnit({
      scope: "system_installation",
      code: "PLUMB-SYSTEM-INSTALLATION",
      label: "Plumbing system installations: $175.00 per system or unit",
      quote:
        'PLUMBING — "Plumbing system installation(s) (new or replacement of a system, unit and/or device includes, but is not limited to; water heater, water softener, lawn irrigation, grease interceptor, triple basin, sewer system, drain tile, cross connection control / RPZ device)" at $175.00 per system / unit',
      cents: 17_500,
    }),
    perUnit({
      scope: "flood_control",
      code: "PLUMB-FLOOD-CONTROL",
      label: "Flood control and sewer backup control: $200.00 per system or unit",
      quote:
        'PLUMBING — "Flood control/sewer backup control (interior overhead modification, exterior backwater-valve and other applicable work)" at $200.00 per system/unit',
      cents: 20_000,
    }),
    rule(sourceId, {
      id: "op-plumb-sewer-connection",
      code: "PLUMB-SEWER-CONNECTION",
      label: "Sanitary or storm sewer connection or repair",
      description:
        'PLUMBING — "Sanitary or storm sewer new service connection or repair and other applicable work (includes ROW opening permission)" at **$250.00**, plus a $1,000.00 restoration deposit if applicable. The deposit is refundable and is not part of the fee, so it is named here rather than charged. Repairing or replacing an existing water service and a new water service connection are priced by the Village\'s separate *Schedule of Water Service Cost and Fees* rather than by this schedule.',
      feeType: "flat",
      config: { amountCents: 25_000 },
      conditions: { all: [customIs("custom.plumbing_scope", "sewer_connection")] },
    }),
  ];
}

export const OP_BUILDING_RULES: FeeRuleRecord[] = buildingRules(OP_FEE_SCHEDULE_SOURCE_KEY);
export const OP_ELECTRICAL_RULES: FeeRuleRecord[] = electricalRules(OP_FEE_SCHEDULE_SOURCE_KEY);
export const OP_PLUMBING_RULES: FeeRuleRecord[] = plumbingRules(OP_FEE_SCHEDULE_SOURCE_KEY);
