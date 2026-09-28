import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * City of San Diego, California — **the first jurisdiction whose building permit is
 * priced as plan check plus inspection.**
 *
 * Two bulletins carry the whole schedule, and both are web pages the City publishes
 * with the same text as their PDF:
 *
 *  S1  **Information Bulletin 501**, *Fee Schedule for Construction Permits-Structures*,
 *      August 2026. Its Table 501A prints a base rate that covers a stated number of
 *      square feet and an increment per square foot above it, **separately for plan check
 *      and for inspection** — a 5,000 sq ft house pays the base rates plus 2,000 sq ft at
 *      two different increments. Its PDF has no text layer (it is a rendered image), so the
 *      bulletin page is the source; see `research/california/san-diego.md` §0.
 *  S2  **Information Bulletin 103**, *Fee Schedule for Mechanical, Electrical,
 *      Plumbing/Gas Permits*, May 2026. Table 2 is the electrical schedule and Tables 3A
 *      and 3B the plumbing one, each printing a **First Unit** and an **Each Add'l Unit**
 *      amount.
 *
 * **The mechanism is new, and that is why California was chosen.** Every other building
 * schedule in this dataset prices a permit from a valuation band or from an area rate.
 * San Diego prices it from area *in one direction only* — the base rate is charged
 * whatever the size, and the increment only above a threshold. That is the shape the
 * `percent` primitive already carried for Portland (`thresholdCents` + `baseCents`), read
 * against `square_footage`; no new primitive was needed, and the rules read the way the
 * table prints.
 *
 * **What is not modelled, and named on the pages instead** — the circuit bands of Table 2
 * (which price a *group* of circuits rather than one), Table 501B partial permits, the
 * Table 501C miscellaneous items, the mechanical permit, and the hourly/express services.
 * See `research/california/san-diego.md` §4.
 */

/** S1 header: "INFORMATION BULLETIN 501 August 2026"; the previous version's last day is 2026-08-06. */
export const SD_FEE_EFFECTIVE_FROM = "2026-08-07";
/** S2 header: "INFORMATION BULLETIN 103 May 2026"; the previous version's last day is 2026-05-03. */
export const SD_MEP_FEE_EFFECTIVE_FROM = "2026-05-04";

export const SD_BUILDING_SOURCE_KEY = "san-diego-ib-501-construction-permits-2026-08";
export const SD_MEP_SOURCE_KEY = "san-diego-ib-103-mep-permits-2026-05";
export const SD_VALUATION_SOURCE_KEY = "san-diego-ib-101-building-valuation-schedule";

/** S1 §V: "A $17.11 fee is charged for fees collected by DSD or other departments/agencies". */
export const SD_FEE_COLLECTION_CENTS = 1_711;
/** S1 §I: "General Plan Maintenance Fee $737.00 … collected at the time of application". */
export const SD_GENERAL_PLAN_CENTS = 73_700;
/** S1 §III: "Lead Hazard Prevention Fee $58.00". */
export const SD_LEAD_HAZARD_CENTS = 5_800;
/** S1 §III: "Mapping Fee $12.16". */
export const SD_MAPPING_CENTS = 1_216;
/** S1 §III: "assessed at 13 cents per $1,000 estimated valuation … one or two stories high". */
export const SD_SEISMIC_RESIDENTIAL_CENTS_PER_THOUSAND = 13;
/** S1 §III: "28 cents per $1,000 … for multifamily construction three stories or higher and for permits on nonresidential construction". */
export const SD_SEISMIC_NONRESIDENTIAL_CENTS_PER_THOUSAND = 28;
/** S1 §III: "four dollars ($4) per one hundred thousand dollars ($100,000) in valuation … not less than one dollar ($1.00)". */
export const SD_BUILDING_STANDARDS_NUMERATOR = 4;
export const SD_BUILDING_STANDARDS_DENOMINATOR = 100_000;
/** S1 §III: "appropriate fractions thereof" is "$1.00 per every twenty-five thousand ($25,000)". */
export const SD_BUILDING_STANDARDS_INCREMENT_CENTS = 2_500_000;
/** S1 §III: "not less than one dollar ($1.00)". */
export const SD_BUILDING_STANDARDS_MINIMUM_CENTS = 100;

/** Which Table 501A project type applies. */
const PT = "custom.project_type";
/** Which Table 2 electrical row applies. */
const ELEC = "custom.electrical_item";
/** Which Table 3A/3B plumbing row applies. */
const PLUMB = "custom.plumbing_item";
/** How many storeys the structure has, for the State/Seismic fee's two rates. */
const STORIES = "custom.stories";

const RESIDENTIAL = "residential";

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
    effectiveFrom: SD_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* S1 — building permit: plan check and inspection                             */
/* -------------------------------------------------------------------------- */

/**
 * One row of Table 501A. Every amount is the City's own, and the two increments are
 * **cents per square foot**, which is what `rateUnit: "currency_per_unit"` says.
 */
type Table501ARow = {
  key: string;
  label: string;
  /** "Base Sq. Ft." — the area the base rates already cover. */
  baseSqFt: number;
  planCheckBaseCents: number;
  planCheckIncrementCentsPerSqFt: number;
  inspectionBaseCents: number;
  inspectionIncrementCentsPerSqFt: number;
};

/**
 * Table 501A, transcribed. The base rates are charged at any size; the increment is
 * charged only on area above the row's base square footage. That is why every one of
 * these rules carries `thresholdCents` **and** `baseCents` together: without the
 * threshold the increment would be charged from zero, and without the base the floor
 * the City prints would be missing.
 */
export const SD_TABLE_501A: Table501ARow[] = [
  {
    key: "new_commercial",
    label: "New Commercial",
    baseSqFt: 3_000,
    planCheckBaseCents: 456_631,
    planCheckIncrementCentsPerSqFt: 157,
    inspectionBaseCents: 157_080,
    inspectionIncrementCentsPerSqFt: 48,
  },
  {
    key: "high_rise",
    label: "High Rise",
    baseSqFt: 50_000,
    planCheckBaseCents: 1_156_782,
    planCheckIncrementCentsPerSqFt: 24,
    inspectionBaseCents: 1_035_016,
    inspectionIncrementCentsPerSqFt: 24,
  },
  {
    key: "new_mdu",
    label: "New Multi Dwelling Unit",
    baseSqFt: 5_000,
    planCheckBaseCents: 462_713,
    planCheckIncrementCentsPerSqFt: 97,
    inspectionBaseCents: 213_097,
    inspectionIncrementCentsPerSqFt: 48,
  },
  {
    key: "res_mdu_and_nonres_addition",
    label: "Residential MDU and Non-Residential Addition",
    baseSqFt: 500,
    planCheckBaseCents: 119_936,
    planCheckIncrementCentsPerSqFt: 241,
    inspectionBaseCents: 85_850,
    inspectionIncrementCentsPerSqFt: 168,
  },
  {
    key: "sdu_duplex",
    label: "Single Dwelling Unit / Duplex (new, detached ADU over 500 sq ft)",
    baseSqFt: 3_000,
    planCheckBaseCents: 808_526,
    planCheckIncrementCentsPerSqFt: 410,
    inspectionBaseCents: 840_190,
    inspectionIncrementCentsPerSqFt: 421,
  },
  {
    key: "sdu_duplex_add_remodel",
    label: "Residential Single Dwelling Unit / Duplex Addition or Remodel",
    baseSqFt: 500,
    planCheckBaseCents: 351_292,
    planCheckIncrementCentsPerSqFt: 698,
    inspectionBaseCents: 222_829,
    inspectionIncrementCentsPerSqFt: 446,
  },
  {
    key: "tenant_improvement",
    label: "Tenant Improvement / Remodel (all occupancies excluding R-3)",
    baseSqFt: 2_000,
    planCheckBaseCents: 253_277,
    planCheckIncrementCentsPerSqFt: 133,
    inspectionBaseCents: 131_510,
    inspectionIncrementCentsPerSqFt: 60,
  },
  {
    key: "attached_townhomes",
    label: "Attached Townhomes",
    baseSqFt: 6_000,
    planCheckBaseCents: 1_410_060,
    planCheckIncrementCentsPerSqFt: 241,
    inspectionBaseCents: 1_205_489,
    inspectionIncrementCentsPerSqFt: 205,
  },
  {
    key: "parking_garage",
    label: "Standalone Parking Garage",
    baseSqFt: 10_000,
    planCheckBaseCents: 633_187,
    planCheckIncrementCentsPerSqFt: 60,
    inspectionBaseCents: 243_534,
    inspectionIncrementCentsPerSqFt: 24,
  },
  {
    key: "warehouse",
    label: "Warehouse / Self-Storage",
    baseSqFt: 20_000,
    planCheckBaseCents: 1_120_253,
    planCheckIncrementCentsPerSqFt: 60,
    inspectionBaseCents: 706_247,
    inspectionIncrementCentsPerSqFt: 36,
  },
];

/**
 * Table 501A as fee rules: a plan check charge and an inspection charge per project
 * type, both reading the project's area.
 *
 * The increment is expressed as an exact fraction of a dollar per square foot —
 * `$4.10` is `{ numerator: 410, denominator: 100 }` — with `rateUnit:
 * "currency_per_unit"`, so the fraction is read as money per square foot rather than
 * as a percentage.
 */
export function buildingAreaRules(sourceId: string): FeeRuleRecord[] {
  return SD_TABLE_501A.flatMap((row) => [
    rule(sourceId, {
      id: `sd-build-plan-check-${row.key}`,
      code: `BUILD-PLAN-CHECK-${row.key.toUpperCase().replace(/_/g, "-")}`,
      label: `${row.label} — plan check`,
      description: `Table 501A: "${row.label}" plan check, base rate $${(row.planCheckBaseCents / 100).toFixed(2)} covering the first ${row.baseSqFt.toLocaleString("en-US")} square feet, plus $${(row.planCheckIncrementCentsPerSqFt / 100).toFixed(2)} per square foot above it.`,
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: row.planCheckIncrementCentsPerSqFt, denominator: 1 },
        rateUnit: "currency_per_unit",
        thresholdCents: row.baseSqFt,
        baseCents: row.planCheckBaseCents,
      },
      conditions: { field: PT, op: "eq", value: row.key },
      componentType: "plan_review",
      priority: 110,
    }),

    rule(sourceId, {
      id: `sd-build-inspection-${row.key}`,
      code: `BUILD-INSPECTION-${row.key.toUpperCase().replace(/_/g, "-")}`,
      label: `${row.label} — inspection`,
      description: `Table 501A: "${row.label}" inspection, base rate $${(row.inspectionBaseCents / 100).toFixed(2)} covering the first ${row.baseSqFt.toLocaleString("en-US")} square feet, plus $${(row.inspectionIncrementCentsPerSqFt / 100).toFixed(2)} per square foot above it.`,
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: row.inspectionIncrementCentsPerSqFt, denominator: 1 },
        rateUnit: "currency_per_unit",
        thresholdCents: row.baseSqFt,
        baseCents: row.inspectionBaseCents,
      },
      conditions: { field: PT, op: "eq", value: row.key },
      componentType: "inspection",
      priority: 120,
    }),
  ]);
}

/**
 * The state's two fees and the City's four flat add-ons, all of them charged with a
 * building permit.
 *
 * The State/Seismic fee is the one row in the bulletin with **two rates for one
 * charge**, and the reading is height-and-occupancy rather than size: 13¢ per $1,000
 * for a single-family or multifamily structure one or two storeys high, 28¢ for
 * multifamily three storeys or higher and for non-residential work. Both readings are
 * modelled as their own rule so exactly one of them applies to a permit, and a
 * residential permit that names no height is charged the lower one — which is what the
 * bulletin's own sentence covers.
 */
export function buildingStateAndFlatRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "sd-build-state-seismic-residential",
      code: "BUILD-STATE-SEISMIC-RESIDENTIAL",
      label: "California State/Seismic fee, 13 cents per $1,000 (one or two storeys)",
      description:
        '"State of California State/Seismic Fee — Public Resources Code Section 2705 … The fee is assessed at 13 cents per $1,000 estimated valuation on all permits for construction of single or multifamily structures one or two stories high."',
      feeType: "per_thousand",
      config: { basis: "valuation", centsPerThousand: SD_SEISMIC_RESIDENTIAL_CENTS_PER_THOUSAND },
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
          { not: { field: STORIES, op: "gte", value: 3 } },
        ],
      },
      componentType: "state_surcharge",
      priority: 800,
    }),

    rule(sourceId, {
      id: "sd-build-state-seismic-nonresidential",
      code: "BUILD-STATE-SEISMIC-NONRESIDENTIAL",
      label: "California State/Seismic fee, 28 cents per $1,000 (three storeys or non-residential)",
      description:
        '"The charge is 28 cents per $1,000 estimated valuation for multifamily construction three stories or higher and for permits on nonresidential construction. For valuation determination, see Information Bulletin 101, Building Valuation Schedule."',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        centsPerThousand: SD_SEISMIC_NONRESIDENTIAL_CENTS_PER_THOUSAND,
      },
      conditions: {
        any: [
          { field: "occupancy", op: "neq", value: RESIDENTIAL },
          { field: STORIES, op: "gte", value: 3 },
        ],
      },
      componentType: "state_surcharge",
      priority: 810,
    }),

    rule(sourceId, {
      id: "sd-build-building-standards",
      code: "BUILD-BUILDING-STANDARDS",
      label: "California Building Standards fee, $4 per $100,000 of valuation",
      description:
        '"Building Standards Fee — Health & Safety Code Section 18931.6 … assessed at the rate of four dollars ($4) per one hundred thousand dollars ($100,000) in valuation, with appropriate fractions thereof, but not less than one dollar ($1.00). \\"Appropriate fractions thereof\\" is interpreted to be $1.00 per every twenty-five thousand ($25,000) in valuation."',
      feeType: "percent",
      config: {
        basis: "valuation",
        rate: {
          numerator: SD_BUILDING_STANDARDS_NUMERATOR,
          denominator: SD_BUILDING_STANDARDS_DENOMINATOR,
        },
        incrementCents: SD_BUILDING_STANDARDS_INCREMENT_CENTS,
      },
      minimumCents: SD_BUILDING_STANDARDS_MINIMUM_CENTS,
      componentType: "state_surcharge",
      priority: 820,
    }),

    rule(sourceId, {
      id: "sd-build-general-plan",
      code: "BUILD-GENERAL-PLAN",
      label: "General Plan Maintenance Fee",
      description:
        '"General Plan Maintenance Fee — This fee provides funding for the maintenance of the City\'s General Plan and is collected on behalf of the Planning Department. It is non-refundable and is collected once per project at the time of application. Projects that do not require plan review are not subject to the fee. General Plan Maintenance Fee $737.00."',
      feeType: "flat",
      config: { amountCents: SD_GENERAL_PLAN_CENTS },
      componentType: "other",
      priority: 200,
    }),

    rule(sourceId, {
      id: "sd-build-mapping",
      code: "BUILD-MAPPING",
      label: "Mapping Fee",
      description:
        '"Mapping Fee — This fee is collected to fund automation efforts and online GIS data and mapping for Development Services … Mapping Fee $12.16."',
      feeType: "flat",
      config: { amountCents: SD_MAPPING_CENTS },
      componentType: "technology",
      priority: 210,
    }),

    rule(sourceId, {
      id: "sd-build-lead-hazard",
      code: "BUILD-LEAD-HAZARD",
      label: "Lead Hazard Prevention Fee",
      description:
        '"Lead Hazard Prevention & Control — This fee is collected on behalf of the ESD for all Building Permits and Demolition Permits for structures built before 1978 … Lead Hazard Prevention Fee $58.00."',
      feeType: "flat",
      config: { amountCents: SD_LEAD_HAZARD_CENTS },
      componentType: "other",
      priority: 220,
    }),

    rule(sourceId, {
      id: "sd-build-fee-collection",
      code: "BUILD-FEE-COLLECTION",
      label: "Fee collection for other agencies",
      description:
        '"Fee Collection - Other Agencies / Departments — A $17.11 fee is charged for fees collected by DSD or other departments/agencies (e.g., water/sewer fees, Affordable Housing In-lieu, construction debris recycling, State fees, lead hazard fee). The fee is charged at permit issuance, and once per project."',
      feeType: "flat",
      config: { amountCents: SD_FEE_COLLECTION_CENTS },
      componentType: "other",
      priority: 230,
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* S2 — electrical (Table 2)                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Table 2's rows that price **one** thing rather than a group of circuits, plus the
 * new-MDU service charge. The circuit bands (15–45 A, 50–200 A, 225–400 A, 450–1,000
 * A and 1,200 A or larger) each price a *group* — "Each 3 Circuits $353.13" — and are
 * named on the page rather than modelled; see `research/california/san-diego.md` §4.
 */
export function electricalRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "sd-elec-mdu-service",
      code: "ELEC-MDU-SERVICE",
      label: "Electrical service, new MDU",
      description:
        '"TABLE 2: ELECTRICAL FEE SCHEDULE (PER BUILDING) — Electrical Service New MDU, 1 Dwelling Unit, First Unit $1,412.54, Each Add\'l Unit $87.68."',
      feeType: "per_unit",
      config: { unit: "dwelling_units", centsPerUnit: 8_768, baseCents: 141_254, thresholdUnits: 1 },
      conditions: { field: ELEC, op: "eq", value: "mdu_service" },
    }),

    rule(sourceId, {
      id: "sd-elec-panel-upgrade",
      code: "ELEC-PANEL-UPGRADE",
      label: "Panel replace or upgrade, up to 200 A",
      description: '"Table 2: Panel Replace/Upgrade up to 200 amp — Each $176.57."',
      feeType: "flat",
      config: { amountCents: 17_657 },
      conditions: { field: ELEC, op: "eq", value: "panel_upgrade" },
    }),

    rule(sourceId, {
      id: "sd-elec-conduit-jbox",
      code: "ELEC-CONDUIT-JBOX",
      label: "Conduit and junction box only",
      description: '"Table 2: Conduit and J Box Only — Each $176.57."',
      feeType: "flat",
      config: { amountCents: 17_657 },
      conditions: { field: ELEC, op: "eq", value: "conduit_jbox" },
    }),

    rule(sourceId, {
      id: "sd-elec-generator",
      code: "ELEC-GENERATOR",
      label: "Generator only",
      description:
        '"Table 2: Generator Only — Each $176.57." (Photovoltaic and electric-vehicle charging have their own bulletins, IB-301 and IB-187.)',
      feeType: "flat",
      config: { amountCents: 17_657 },
      conditions: { field: ELEC, op: "eq", value: "generator" },
    }),

    rule(sourceId, {
      id: "sd-elec-temp-pole",
      code: "ELEC-TEMP-POLE",
      label: "Temporary construction power pole",
      description:
        '"Table 2: Temp Pole (Construction Power) — Each $176.57. Temporary power qualifies for Simple Permits up to 400 amps. Services over 400 amps must be submitted with plans."',
      feeType: "flat",
      config: { amountCents: 17_657 },
      conditions: { field: ELEC, op: "eq", value: "temp_pole" },
    }),

    rule(sourceId, {
      id: "sd-elec-specialized-occupancy",
      code: "ELEC-SPECIALIZED-OCCUPANCY",
      label: "Specialised occupancy",
      description:
        '"Table 2: Specialized Occupancy (e.g., healthcare, hazardous location) — Each $529.71 … required for specialized occupancies as identified in Chapter 5 of the California Electrical Code."',
      feeType: "flat",
      config: { amountCents: 52_971 },
      conditions: { field: ELEC, op: "eq", value: "specialized" },
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* S2 — plumbing (Tables 3A and 3B)                                            */
/* -------------------------------------------------------------------------- */

/**
 * The plumbing rows that price **one** thing — a dwelling unit, a water heater, a
 * device — plus the new and remodel MDU charges by dwelling unit. The five-fixture
 * groups of Table 3A (restrooms, kitchens, laboratories) price a *group* and are named
 * on the page rather than modelled, for the same reason the electrical circuit bands
 * are.
 */
export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "sd-plumb-mdu-new",
      code: "PLUMB-MDU-NEW",
      label: "New plumbing, multiple dwelling unit building",
      description:
        '"TABLE 3A: PLUMBING FEE SCHEDULE (PER BUILDING USE) — Multiple Dwelling Unit Building (MDU - New), Each Dwelling Unit, First Unit $264.25, Each Add\'l Unit $176.57."',
      feeType: "per_unit",
      config: { unit: "dwelling_units", centsPerUnit: 17_657, baseCents: 26_425, thresholdUnits: 1 },
      conditions: { field: PLUMB, op: "eq", value: "mdu_new" },
    }),

    rule(sourceId, {
      id: "sd-plumb-mdu-remodel",
      code: "PLUMB-MDU-REMODEL",
      label: "Plumbing remodel, multiple dwelling unit building",
      description:
        "\"Table 3A: MDU Building - Remodel, Each Dwelling Unit, First Unit $264.25, Each Add'l Unit $52.39.\"",
      feeType: "per_unit",
      config: { unit: "dwelling_units", centsPerUnit: 5_239, baseCents: 26_425, thresholdUnits: 1 },
      conditions: { field: PLUMB, op: "eq", value: "mdu_remodel" },
    }),

    rule(sourceId, {
      id: "sd-plumb-water-heater",
      code: "PLUMB-WATER-HEATER",
      label: "Water heater",
      description:
        '"Table 3B: Water Heater — Each $122.97." (For non-residential or MDU buildings, replacing a water heater with a tankless water heater requires plans and plan review.)',
      feeType: "flat",
      config: { amountCents: 12_297 },
      conditions: { field: PLUMB, op: "eq", value: "water_heater" },
    }),

    rule(sourceId, {
      id: "sd-plumb-water-softener",
      code: "PLUMB-WATER-SOFTENER",
      label: "Water softener",
      description: "\"Table 3B: Water Softener — Each $87.68, Each Add'l Unit $52.39.\"",
      feeType: "per_unit",
      config: { unit: "connections", centsPerUnit: 5_239, baseCents: 8_768, thresholdUnits: 1 },
      conditions: { field: PLUMB, op: "eq", value: "water_softener" },
    }),

    rule(sourceId, {
      id: "sd-plumb-backflow",
      code: "PLUMB-BACKFLOW",
      label: "Domestic backflow preventer",
      description: "\"Table 3B: Backflow Preventer-Domestic — Each $87.68, Each Add'l Unit $52.39.\"",
      feeType: "per_unit",
      config: { unit: "backflow_devices", centsPerUnit: 5_239, baseCents: 8_768, thresholdUnits: 1 },
      conditions: { field: PLUMB, op: "eq", value: "backflow" },
    }),

    rule(sourceId, {
      id: "sd-plumb-sewage-ejector",
      code: "PLUMB-SEWAGE-EJECTOR",
      label: "Sewage ejector",
      description: "\"Table 3B: Sewage Ejector — Each $264.25, Each Add'l Unit $87.68.\"",
      feeType: "flat",
      config: { amountCents: 26_425 },
      conditions: { field: PLUMB, op: "eq", value: "sewage_ejector" },
    }),

    rule(sourceId, {
      id: "sd-plumb-gas-system",
      code: "PLUMB-GAS-SYSTEM",
      label: "Gas system or meter, per five outlets",
      description: "\"Table 3B: Gas System/Meter — Each 5 Outlets $264.25, Each Add'l Unit $87.68.\"",
      feeType: "flat",
      config: { amountCents: 26_425 },
      conditions: { field: PLUMB, op: "eq", value: "gas_system" },
    }),

    rule(sourceId, {
      id: "sd-plumb-pipe-repair-residential",
      code: "PLUMB-PIPE-REPAIR-RESIDENTIAL",
      label: "Water or waste pipe repair or replacement, residential",
      description: '"Table 3B: Water/Waste Pipe Repair/Replacement - Residential — Per Dwelling Unit $264.25, Each Add\'l Unit $87.68."',
      feeType: "per_unit",
      config: { unit: "dwelling_units", centsPerUnit: 8_768, baseCents: 26_425, thresholdUnits: 1 },
      conditions: { field: PLUMB, op: "eq", value: "pipe_repair_residential" },
    }),
  ];
}

export const SD_BUILDING_RULES: FeeRuleRecord[] = [
  ...buildingAreaRules(SD_BUILDING_SOURCE_KEY),
  ...buildingStateAndFlatRules(SD_BUILDING_SOURCE_KEY),
];

export const SD_ELECTRICAL_RULES: FeeRuleRecord[] = electricalRules(SD_MEP_SOURCE_KEY);

export const SD_PLUMBING_RULES: FeeRuleRecord[] = plumbingRules(SD_MEP_SOURCE_KEY);
