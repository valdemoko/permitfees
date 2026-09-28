import type { FeeRuleRecord, PerUnitKind } from "@/lib/calc/types";

/**
 * Gulfport, Mississippi fee rules — REAL DATA.
 *
 * Source: City of Gulfport, Urban Development — Building Code Services
 *         (1410 24th Avenue, Gulfport, MS 39501; 228-868-5790), official PDFs
 *         under gulfport-ms.gov/Documents/Departments/Urban Development/
 *         Building Code Services/:
 *           - Building: "BUILDING-PERMIT-FEES.pdf" (undated).
 *           - Electrical: "ElecPermitFeeSchedule2002.pdf" (FY 2002 column).
 *           - Plumbing: "PlumbingPermitFeeSchedule2002.pdf" (FY 2002 column).
 *
 * Reading notes recorded in research/mississippi/gulfport.md:
 *   - every schedule charges a **$30.00 base permit fee** for issuing the
 *     permit, plus the rows below;
 *   - the building ladder's own prose states "$24.00 for the first one thousand
 *     dollars plus $4.00 for each additional thousand **or fraction thereof**
 *     up to and including five hundred thousand and one dollars ($500,001.00)":
 *     the ~100 printed rows are this arithmetic at $4.00 per row, so the rule
 *     charges the ladder (threshold $1,000, increment $1,000, round up) and the
 *     test asserts printed rows against it;
 *   - the top band ($500,002 and up) prints its own base — $2,020.00 for the
 *     first $500,000 — plus $3.20 per additional thousand or fraction;
 *   - the Distribution/Sub-Panel bands print dollar RANGES that are the same
 *     25¢ per ampere expressed as endpoints ($31.25-$50.00 = 125 × .25 to
 *     200 × .25), so the row charges 25¢ per ampere across its whole span;
 *   - the FY 2002 trade schedules are dated honestly (see the source records'
 *     documentDate and the page prose); the department's own page links them
 *     as its fee schedules today.
 *
 * Verified: 2026-09-26.
 */

export const GP_FEE_EFFECTIVE_FROM = "2002-10-01"; // FY 2002 trade schedules; building schedule undated

export const GP_BUILDING_SOURCE_KEY = "gulfport-building-fee-schedule";
export const GP_ELECTRICAL_SOURCE_KEY = "gulfport-electrical-fee-schedule";
export const GP_PLUMBING_SOURCE_KEY = "gulfport-plumbing-fee-schedule";

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
    effectiveFrom: GP_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/** Every schedule opens with a $30.00 base permit fee for issuing the permit. */
export const GP_BASE_FEE_RULE = (sourceId: string, prefix: string): FeeRuleRecord =>
  rule(sourceId, {
    id: `${prefix}-base`,
    code: `${prefix.toUpperCase()}-BASE-30`,
    label: "Base permit fee ($30.00)",
    description:
      "Each schedule states a base permit fee of $30.00 for issuing each permit, charged before the schedule's own rows.",
    feeType: "flat",
    config: { amountCents: 3_000 },
  });

/** A per-unit row priced from its own `custom.<key>` count, at `cents` per item. */
function customUnit(
  id: string,
  code: string,
  label: string,
  description: string,
  customKey: string,
  kind: PerUnitKind,
  cents: number,
): FeeRuleRecord {
  return rule(GP_PLUMBING_SOURCE_KEY, {
    id,
    code,
    label,
    description,
    feeType: "per_unit",
    config: { unit: kind, centsPerUnit: cents },
    conditions: { all: [{ field: `custom.${customKey}`, op: "gte", value: 1 }] },
  });
}

/* -------------------------------------------------------------------------- */
/* Building                                                                   */
/* -------------------------------------------------------------------------- */

export const GP_BUILDING_RULES: FeeRuleRecord[] = [
  GP_BASE_FEE_RULE(GP_BUILDING_SOURCE_KEY, "gp-bld"),

  // Ladder to $500,001: $24 for the first $1,000, +$4 per additional $1,000 or fraction
  rule(GP_BUILDING_SOURCE_KEY, {
    id: "gp-bld-ladder",
    code: "GP-BLD-LADDER",
    label: "Valuation ladder to $500,001 ($24 first $1,000 + $4 per additional $1,000 or fraction)",
    description:
      "Building Permit Fee Schedule: $24.00 for the first one thousand dollars plus $4.00 for each additional thousand or fraction thereof, up to and including $500,001.00. The printed ~100-row table is this arithmetic at $4.00 per row; the schedule's closing prose states the rule.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 2_400,
      thresholdCents: 100_000,
      incrementCents: 100_000,
      centsPerThousand: 400,
    },
    conditions: { all: [{ field: "valuation", op: "lte", value: 50_000_100 }] },
  }),

  // Top band: $2,020 for the first $500,000 + $3.20 per additional $1,000 or fraction
  rule(GP_BUILDING_SOURCE_KEY, {
    id: "gp-bld-top",
    code: "GP-BLD-500K-UP",
    label: "Valuation ladder above $500,001 ($2,020 first $500,000 + $3.20 per additional $1,000 or fraction)",
    description:
      "Building Permit Fee Schedule: $2,020.00 for the first five hundred thousand dollars plus $3.20 for each additional thousand or fraction thereof.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 202_000,
      thresholdCents: 50_000_000,
      incrementCents: 100_000,
      centsPerThousand: 320,
    },
    conditions: { all: [{ field: "valuation", op: "gt", value: 50_000_100 }] },
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical (FY 2002 schedule)                                              */
/* -------------------------------------------------------------------------- */

const SERVICE_AMP_BANDS: Array<{ label: string; lo: number; hi: number; cents: number }> = [
  { label: "100 amp or less", lo: 1, hi: 100, cents: 1_000 },
  { label: "125-200 amp", lo: 101, hi: 200, cents: 2_000 },
  { label: "225-400 amp", lo: 201, hi: 400, cents: 3_000 },
  { label: "450-600 amp", lo: 401, hi: 600, cents: 4_000 },
  { label: "700-800 amp", lo: 601, hi: 800, cents: 5_000 },
];

const FEEDER_AMP_BANDS: Array<{ label: string; lo: number; hi: number; cents: number }> = [
  { label: "60 amp or less", lo: 1, hi: 60, cents: 600 },
  { label: "70-100 amp", lo: 61, hi: 100, cents: 800 },
  { label: "125-200 amp", lo: 101, hi: 200, cents: 1_500 },
  { label: "225-400 amp", lo: 201, hi: 400, cents: 2_000 },
  { label: "450-600 amp", lo: 401, hi: 600, cents: 2_500 },
  { label: "700-800 amp", lo: 601, hi: 800, cents: 3_000 },
  { label: "800-1000 amp", lo: 801, hi: 1_000, cents: 3_500 },
];

function ampBandRule(
  id: string,
  code: string,
  label: string,
  description: string,
  lo: number,
  hi: number,
  cents: number,
  factKey: "custom.amperage" | "custom.feeder_amperage",
): FeeRuleRecord {
  return rule(GP_ELECTRICAL_SOURCE_KEY, {
    id,
    code,
    label,
    description,
    feeType: "flat",
    config: { amountCents: cents },
    conditions: {
      all: [
        { field: factKey, op: "gte", value: lo },
        { field: factKey, op: "lte", value: hi },
      ],
    },
  });
}

export const GP_ELECTRICAL_RULES: FeeRuleRecord[] = [
  GP_BASE_FEE_RULE(GP_ELECTRICAL_SOURCE_KEY, "gp-elec"),

  // Service entrance / switch gear ladder
  ...SERVICE_AMP_BANDS.map((band, index) =>
    ampBandRule(
      `gp-elec-service-${index + 1}`,
      `GP-ELEC-SVC-${band.hi}`,
      `Service entrance or switch gear, ${band.label} ($${(band.cents / 100).toFixed(2)})`,
      `ElecPermitFeeSchedule2002, Service Entrance or Switch Gear: ${band.label}, $${(band.cents / 100).toFixed(2)}.`,
      band.lo,
      band.hi,
      band.cents,
      "custom.amperage",
    ),
  ),
  // 1000A and up: $2.00 per additional amp capacity (charged on amps above 800)
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-service-over",
    code: "GP-ELEC-SVC-1000UP",
    label: "Service entrance above 800 amps ($2.00 per additional ampere)",
    description:
      "ElecPermitFeeSchedule2002, Service Entrance or Switch Gear: 1000 amp and up, $2.00 per additional capacity. Charged on the amperes above the 800-amp band top — $2.00 is 200 cents per ampere, which is the rate fraction the engine reads.",
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 200, denominator: 1 },
      rateUnit: "currency_per_unit",
      thresholdCents: 800,
    },
    conditions: { all: [{ field: "custom.amperage", op: "gt", value: 800 }] },
  }),

  // Feeder circuits ladder
  ...FEEDER_AMP_BANDS.map((band, index) =>
    ampBandRule(
      `gp-elec-feeder-${index + 1}`,
      `GP-ELEC-FDR-${band.hi}`,
      `Feeder circuit, ${band.label} ($${(band.cents / 100).toFixed(2)})`,
      `ElecPermitFeeSchedule2002, Feeder Circuits: ${band.label}, $${(band.cents / 100).toFixed(2)}.`,
      band.lo,
      band.hi,
      band.cents,
      "custom.feeder_amperage",
    ),
  ),

  // Distribution / sub-panel: $0.25 per amp across the whole span. Gated on the
  // job actually including a distribution/sub-panel row — the schedule prices it
  // as its own line, not on every amperage-bearing permit.
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-subpanel",
    code: "GP-ELEC-SUBPANEL",
    label: "Distribution or sub-panel ($0.25 per ampere)",
    description:
      "ElecPermitFeeSchedule2002, Distribution/Sub Panel: $0.25 per amp (60 amp or less), then printed ranges that are the same 25¢ per ampere — $15.00-$25.00 at 70-100 A, $31.25-$50.00 at 125-200 A, $56.25-$100.00 at 225-400 A, $112.50-$150.00 at 450-600 A — and $0.25 per additional amp above 600 A.",
    feeType: "percent",
    config: {
      basis: "amperage",
      rate: { numerator: 25, denominator: 1 },
      rateUnit: "currency_per_unit",
    },
    conditions: {
      all: [
        { field: "custom.subpanel", op: "eq", value: true },
        { field: "custom.amperage", op: "gte", value: 1 },
      ],
    },
  }),

  // Branch circuit, $6.00 per circuit
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-branch",
    code: "GP-ELEC-BRANCH",
    label: "Branch circuit ($6.00 per circuit)",
    description:
      "ElecPermitFeeSchedule2002: branch circuit, per circuit, $6.00.",
    feeType: "per_unit",
    config: { unit: "circuits", centsPerUnit: 600 },
    conditions: { all: [{ field: "custom.circuits", op: "gte", value: 1 }] },
  }),

  // $6 appliance circuits (count priced per unit)
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-appl-6",
    code: "GP-ELEC-APP-6",
    label: "Appliance circuit at $6.00 (range, oven, dryer, dishwasher, electric water heater, bathroom space heater)",
    description:
      "ElecPermitFeeSchedule2002, Major Appliance Circuit: Range Top, Wall Oven, Electronic Oven, Range, Clothes Dryer, Dish Washer, Electric Water Heater and Bathroom Space Heater, $6.00 each. One count covers whichever $6.00 appliances the job adds.",
    feeType: "per_unit",
    config: { unit: "outlets", centsPerUnit: 600 },
    conditions: { all: [{ field: "custom.outlets", op: "gte", value: 1 }] },
  }),

  // $10 appliance circuits
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-appl-10",
    code: "GP-ELEC-APP-10",
    label: "Appliance circuit at $10.00 (refrigerator, freezer, washer, disposal, compactor, attic fan and commercial units)",
    description:
      "ElecPermitFeeSchedule2002, Major Appliance Circuit and Commercial Major Appliances: Refrigerator, Freezer, Clothes Washer, Disposal, Compactor, Vacuum Pump, Attic Fan, self-contained refrigerators/freezers/ice makers, electric warmers, drink dispensers, electric grills and fryers, $10.00 each. One count covers whichever $10.00 appliances the job adds.",
    feeType: "per_unit",
    config: { unit: "appliance_circuits", centsPerUnit: 1_000 },
    conditions: { all: [{ field: "custom.appliance_circuits", op: "gte", value: 1 }] },
  }),

  // Window A/C $12
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-window-ac",
    code: "GP-ELEC-WINDOWAC",
    label: "Window air conditioner ($12.00 each)",
    description:
      "ElecPermitFeeSchedule2002, Major Appliance Circuit: Window A/C, $12.00. (Central A/C units price under the motor-installation rows, which this copy of the schedule names without printing a ladder.)",
    feeType: "per_unit",
    config: { unit: "ac_units", centsPerUnit: 1_200 },
    conditions: { all: [{ field: "custom.ac_units", op: "gte", value: 1 }] },
  }),

  // Commercial electric water heater $8
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-comm-wh",
    code: "GP-ELEC-COMM-WH",
    label: "Commercial electric water heater ($8.00 each)",
    description:
      "ElecPermitFeeSchedule2002, Major Appliance Circuit: Electric water heater (commercial), $8.00.",
    feeType: "per_unit",
    config: { unit: "water_units", centsPerUnit: 800 },
    conditions: { all: [{ field: "custom.water_units", op: "gte", value: 1 }] },
  }),

  // Gasoline dispensers $10 (computerized and regular rows both $10)
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-dispenser",
    code: "GP-ELEC-DISPENSER",
    label: "Gasoline dispenser ($10.00 each)",
    description:
      "ElecPermitFeeSchedule2002: computerized and regular gasoline dispensers, $10.00 each.",
    feeType: "per_unit",
    config: { unit: "power_devices", centsPerUnit: 1_000 },
    conditions: { all: [{ field: "custom.power_devices", op: "gte", value: 1 }] },
  }),

  // Signs and outline lighting: $10 per light, $10 per transformer or ballast
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-sign-lights",
    code: "GP-ELEC-SIGN-LIGHTS",
    label: "Sign and outline lighting ($10.00 per light)",
    description:
      "ElecPermitFeeSchedule2002, Signs and outline lighting: first 10 lights, $10.00 per light; each additional 10 lights or fraction, $10.00 per light.",
    feeType: "per_unit",
    config: { unit: "lighting_fixtures", centsPerUnit: 1_000 },
    conditions: { all: [{ field: "custom.lighting_fixtures", op: "gte", value: 1 }] },
  }),
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-sign-xfmr",
    code: "GP-ELEC-SIGN-XFMR",
    label: "Sign transformers or ballasts ($10.00 each)",
    description:
      "ElecPermitFeeSchedule2002, Signs and outline lighting: first transformer or ballast, and each additional, $10.00 per transformer or ballast.",
    feeType: "per_unit",
    config: { unit: "signs", centsPerUnit: 1_000 },
    conditions: { all: [{ field: "custom.signs", op: "gte", value: 1 }] },
  }),

  // Miscellaneous $30 rows (temporary service, correct wiring for occupancy,
  // X-ray equipment per system, transformer-type welders)
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-temp-service",
    code: "GP-ELEC-TEMP-SVC",
    label: "Temporary service or power pole ($30.00)",
    description:
      "ElecPermitFeeSchedule2002, Miscellaneous Charges: temporary service or temporary power pole, $30.00.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { all: [{ field: "custom.temporary_service", op: "eq", value: true }] },
  }),
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-misc",
    code: "GP-ELEC-MISC-30",
    label: "Miscellaneous charge ($30.00: correct wiring for occupancy, X-ray equipment, transformer-type welder)",
    description:
      "ElecPermitFeeSchedule2002, Miscellaneous Charges: correct wiring for occupancy, X-ray equipment per system and transformer type welders, $30.00 each.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { all: [{ field: "custom.misc_charge", op: "eq", value: true }] },
  }),

  // Mobile home / travel trailer $30
  rule(GP_ELECTRICAL_SOURCE_KEY, {
    id: "gp-elec-mobile-home",
    code: "GP-ELEC-MOBILE-HOME",
    label: "Mobile home or travel trailer ($30.00)",
    description:
      "ElecPermitFeeSchedule2002: mobile home and travel trailer, $30.00 (in addition to the schedule's major-appliance charges).",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: { all: [{ field: "custom.mobile_home", op: "eq", value: true }] },
  }),
];

/* -------------------------------------------------------------------------- */
/* Plumbing (FY 2002 schedule)                                                */
/* -------------------------------------------------------------------------- */

export const GP_PLUMBING_RULES: FeeRuleRecord[] = [
  GP_BASE_FEE_RULE(GP_PLUMBING_SOURCE_KEY, "gp-plumb"),

  // Fixtures $5 each — the schedule's generic count
  rule(GP_PLUMBING_SOURCE_KEY, {
    id: "gp-plumb-fixtures",
    code: "GP-PL-FIXTURES-5",
    label: "Fixtures ($5.00 each)",
    description:
      "PlumbingPermitFeeSchedule2002: Fixtures, Water Closet, Sink, Bath Tub, Grease Trap, Urinal, Laundry Tub, Sewer Connection, Shower, Water Fountain, Dishwasher, Disposal, Washing Machine, Swimming Pool, Kitchen Range, Hot Plate and Boilers, $5.00 each. One count covers the $5.00 items on the job.",
    feeType: "per_unit",
    config: { unit: "fixtures", centsPerUnit: 500 },
    conditions: { all: [{ field: "fixtures", op: "gte", value: 1 }] },
  }),

  // $7 rows
  customUnit(
    "gp-plumb-lavatories",
    "GP-PL-LAVATORIES",
    "Lavatories ($7.00 each)",
    "PlumbingPermitFeeSchedule2002: Lavatories, $7.00 each.",
    "lavatories",
    "lavatories",
    700,
  ),
  customUnit(
    "gp-plumb-floor-drains",
    "GP-PL-FLOOR-DRAINS",
    "Floor drains ($7.00 each; $10.00 with trap primer)",
    "PlumbingPermitFeeSchedule2002: Floor Drain, $7.00; Floor Drain with trap primer, $10.00. Count primed drains separately in the trap-primed row — the unprimed ones price at $7.00 here.",
    "floor_drains",
    "floor_drains",
    700,
  ),
  customUnit(
    "gp-plumb-primed-drains",
    "GP-PL-PRIMED-DRAINS",
    "Floor drains with trap primer ($10.00 each)",
    "PlumbingPermitFeeSchedule2002: Floor Drain with trap primer, $10.00 each.",
    "primed_floor_drains",
    "floor_drains",
    1_000,
  ),

  // Water heaters at $10
  customUnit(
    "gp-plumb-water-heaters",
    "GP-PL-WATER-HEATERS",
    "Water heaters ($10.00 each)",
    "PlumbingPermitFeeSchedule2002: Water Heater/full auto and Water Heater/Instant, $10.00 each.",
    "water_heaters",
    "water_heaters",
    1_000,
  ),

  // Heating appliances at $10
  customUnit(
    "gp-plumb-heating",
    "GP-PL-HEATING",
    "Radiant heaters, floor furnaces, hot-air furnaces, radiators and circulating heaters ($10.00 each)",
    "PlumbingPermitFeeSchedule2002: Radiant Heater, Floor Furnace, Furnace Hot air, Radiator (gas/steam/vent), Radiator/non vented and Circulating heater, $10.00 each.",
    "heating_appliances",
    "heating_appliances",
    1_000,
  ),

  // Gas service line $10
  customUnit(
    "gp-plumb-gas-line",
    "GP-PL-GAS-LINE",
    "Gas service line ($10.00 each)",
    "PlumbingPermitFeeSchedule2002: Service line (gas lines), $10.00 each.",
    "gas_service_lines",
    "gas_service_lines",
    1_000,
  ),

  // Sprinkler heads: $10 for 1-5, $2 each additional
  rule(GP_PLUMBING_SOURCE_KEY, {
    id: "gp-plumb-sprinklers",
    code: "GP-PL-SPRINKLERS",
    label: "Sprinkler heads ($10.00 for 1-5, $2.00 each additional)",
    description:
      "PlumbingPermitFeeSchedule2002: Sprinkler Heads 1-5, $10.00, $2.00 for each additional sprinkler head.",
    feeType: "per_unit",
    config: {
      unit: "sprinkler_heads",
      centsPerUnit: 200,
      baseCents: 1_000,
      thresholdUnits: 5,
    },
    conditions: { all: [{ field: "custom.sprinkler_heads", op: "gte", value: 1 }] },
  }),

  // Water connection $50 — the schedule's largest plumbing row
  customUnit(
    "gp-plumb-water-connection",
    "GP-PL-WATER-CONN",
    "Water connection ($50.00 each)",
    "PlumbingPermitFeeSchedule2002: Water Connection, $50.00.",
    "water_service_connections",
    "water_service_connections",
    5_000,
  ),

  // Other connections $25; piping $5; backflow preventer $15
  customUnit(
    "gp-plumb-other-connections",
    "GP-PL-OTHER-CONN",
    "Other connections ($25.00 each)",
    "PlumbingPermitFeeSchedule2002: Other connections, $25.00 each.",
    "other_connections",
    "other_connections",
    2_500,
  ),
  customUnit(
    "gp-plumb-piping",
    "GP-PL-PIPING",
    "Piping ($5.00 each)",
    "PlumbingPermitFeeSchedule2002: Piping, $5.00.",
    "piping_runs",
    "piping_runs",
    500,
  ),
  customUnit(
    "gp-plumb-backflow",
    "GP-PL-BACKFLOW",
    "Backflow preventer ($15.00 each)",
    "PlumbingPermitFeeSchedule2002: Back Flow Preventer, $15.00 each.",
    "backflow_devices",
    "backflow_devices",
    1_500,
  ),
];
