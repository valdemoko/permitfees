import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Charleston, West Virginia fee rules — REAL DATA.
 *
 * Sources (all primary, city domain charlestonwv.gov):
 *   - Building: "Schedule of Permit Fees", Building Department, 915 Quarrier St
 *     Suite 5, EFFECTIVE: APRIL 14, 2008. The document is an image scan with no
 *     text layer, so the table was read by OCR over a 300-dpi render and each row
 *     re-checked against the printed checkpoints; the ladder's arithmetic closes at
 *     every printed amount (see research/west-virginia/charleston.md).
 *   - Electrical: Electrical Permit application form, REVISED 01-30-2015, whose
 *     two fee columns (Residential / Commercial) are the only published electrical
 *     figures the City prints.
 *
 * The building schedule says in its own closing note that it "DOES NOT APPLY TO
 * ELECTRICAL, HVAC AND PLUMBING PERMITS", so the ladder and the electrical table are
 * two instruments, not one. The City publishes no plumbing fee table at all: plumbing
 * amounts ride the plumbing application form, which the City does not post, so that
 * page states the absence rather than inventing a figure.
 *
 * Verified: 2026-09-27.
 */

export const CH_BUILDING_EFFECTIVE_FROM = "2008-04-14";
export const CH_ELECTRICAL_EFFECTIVE_FROM = "2015-01-30";

export const CH_BUILDING_SOURCE_KEY = "charleston-schedule-of-fees";
export const CH_ELECTRICAL_SOURCE_KEY = "charleston-electrical-app";

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
    effectiveFrom: CH_BUILDING_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building — Schedule of Permit Fees (effective 2008-04-14)                   */
/* -------------------------------------------------------------------------- */

/**
 * The printed ladder and its own closing note, read together:
 *
 *   $0–$1,000 ............. $14.50
 *   $1,001–$1,500 ......... $16.50
 *   $1,501–$2,500 ......... $18.50
 *   $2,501–$30,000 ........ $18.50 + $4.00 per additional $1,000 band
 *   $30,000.01 and up ..... $130.50 + $5.00 per additional $1,000 (the schedule's
 *                           own "Add $5.00 per $1000.00 after $30,000.00")
 *
 * The printed checkpoints confirm each segment: $60,000 = $280.50; $100,000 =
 * $480.50; $500,000 = $2,480.50; $1,000,000 = $4,980.50 — each exactly
 * $130.50 + $5.00 × (the thousands above $30,000).
 */
export const CH_BUILDING_RULES: FeeRuleRecord[] = [
  rule(CH_BUILDING_SOURCE_KEY, {
    id: "ch-bld-waiver",
    code: "CH-BLD-WAIVER",
    label: "Job cost up to $2,500 — building permit fee waived ($0.00)",
    description:
      "Schedule of Permit Fees, closing note: 'BUILDING PERMIT FEES WILL BE WAIVED FOR TOTAL JOB COSTS UP TO $2500.00.' Carried as a published $0.00 fee so the waiver is visible in the working rather than looking like missing data. Demolition is priced by its own line and is not waived.",
    feeType: "flat",
    config: { amountCents: 0 },
    conditions: {
      all: [
        { field: "valuation", op: "lte", value: 250_000 },
        // Stated as a not-all so an application that states no work type is waived
        // too; only a demolition is excluded from the waiver.
        { not: { all: [{ field: "work_type", op: "eq", value: "demolition" }] } },
      ],
    },
  }),

  rule(CH_BUILDING_SOURCE_KEY, {
    id: "ch-bld-ladder",
    code: "CH-BLD-LADDER",
    label: "Valuation ladder to $30,000 ($18.50 + $4.00 per additional $1,000 or fraction)",
    description:
      "Schedule of Permit Fees: $18.50 at $1,501–$2,500, then $4.00 for each additional $1,000 band, reaching the printed $130.50 at $29,500.01–$30,000.00. The three opening printed bands ($14.50, $16.50, $18.50) are inside the same row here because the waiver covers every job cost up to $2,500; the ladder proper opens above it. Demolition of a structure up to $5,000 is priced by its own $30.00 line instead of this ladder.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 1_850,
      thresholdCents: 250_000,
      incrementCents: 100_000,
      centsPerThousand: 400,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 250_000 },
        { field: "valuation", op: "lte", value: 3_000_000 },
        // Every job except a demolition of a structure valued at $5,000 or less,
        // which the schedule prices with its own $30.00 line.
        {
          not: {
            all: [
              { field: "work_type", op: "eq", value: "demolition" },
              { field: "valuation", op: "lte", value: 500_000 },
            ],
          },
        },
      ],
    },
  }),

  rule(CH_BUILDING_SOURCE_KEY, {
    id: "ch-bld-over-30k",
    code: "CH-BLD-30K-UP",
    label: "Above $30,000 ($130.50 + $5.00 per additional $1,000 or fraction)",
    description:
      "Schedule of Permit Fees, printed note: 'Add $5.00 per $1000.00 after $30,000.00', measured from the $130.50 the ladder reaches at $30,000. The schedule's own checkpoints verify it: $60,000 → $280.50, $100,000 → $480.50, $500,000 → $2,480.50, $1,000,000 → $4,980.50.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 13_050,
      thresholdCents: 3_000_000,
      incrementCents: 100_000,
      centsPerThousand: 500,
    },
    conditions: {
      all: [
        { field: "valuation", op: "gt", value: 3_000_000 },
        {
          not: {
            all: [
              { field: "work_type", op: "eq", value: "demolition" },
              { field: "valuation", op: "lte", value: 500_000 },
            ],
          },
        },
      ],
    },
  }),

  rule(CH_BUILDING_SOURCE_KEY, {
    id: "ch-bld-demolition",
    code: "CH-BLD-DEMOLITION",
    label: "Demolition, structure value up to $5,000 ($30.00 flat)",
    description:
      "Schedule of Permit Fees, Demolition Permits: 'All structures up to $5000.00 … $30.00. Over $5000.00 by schedule of fees.' A demolition above $5,000 of structure value is priced by the valuation ladder instead.",
    feeType: "flat",
    config: { amountCents: 3_000 },
    conditions: {
      all: [
        { field: "work_type", op: "eq", value: "demolition" },
        { field: "valuation", op: "lte", value: 500_000 },
      ],
    },
  }),

  rule(CH_BUILDING_SOURCE_KEY, {
    id: "ch-bld-plan-review",
    code: "CH-BLD-PLAN-REVIEW",
    label: "Commercial plan review ($0.00075 of construction, $50,000 and above)",
    description:
      "Schedule of Permit Fees, Plan Review Fee: '.00075 of all Commercial Construction $50,000.00 and above', with the schedule's own examples: $50,000.00 → $37.50 and $100,000.00 → $75.00. Modelled as the exact fraction 3/4000 of valuation, which is what '.00075' means ($0.75 per $1,000).",
    feeType: "percent",
    componentType: "plan_review",
    config: {
      basis: "valuation",
      rate: { numerator: 3, denominator: 4_000 },
      rateUnit: "fraction",
    },
    conditions: {
      all: [
        { field: "valuation", op: "gte", value: 5_000_000 },
        { field: "occupancy", op: "in", value: ["commercial", "industrial", "mixed"] },
      ],
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Electrical — Electrical Permit application (revised 01-30-2015)             */
/* -------------------------------------------------------------------------- */

/** The form's own note, charged on every electrical permit in both columns. */
export const CH_ELECTRICAL_FINAL_INSPECTION: FeeRuleRecord = rule(CH_ELECTRICAL_SOURCE_KEY, {
  id: "ch-elec-final-inspection",
  code: "CH-ELEC-FINAL-INSPECTION",
  label: "Final inspection fee ($15.00, added to all electrical permits)",
  description:
    "Electrical Permit form: 'A FINAL INSPECTION FEE OF $15.00 SHALL BE ADDED TO ALL ELECTRICAL PERMITS.'",
  feeType: "flat",
  componentType: "inspection",
  config: { amountCents: 1_500 },
  effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
});

function residentialFlat(
  id: string,
  code: string,
  label: string,
  description: string,
  factKey: string,
  amountCents: number,
): FeeRuleRecord {
  return rule(CH_ELECTRICAL_SOURCE_KEY, {
    id,
    code,
    label,
    description,
    feeType: "flat",
    config: { amountCents },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: `custom.${factKey}`, op: "eq", value: true },
      ],
    },
  });
}

function commercialFlat(
  id: string,
  code: string,
  label: string,
  description: string,
  factKey: string,
  amountCents: number,
): FeeRuleRecord {
  return rule(CH_ELECTRICAL_SOURCE_KEY, {
    id,
    code,
    label,
    description,
    feeType: "flat",
    config: { amountCents },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: ["commercial", "industrial", "mixed"] },
        { field: `custom.${factKey}`, op: "eq", value: true },
      ],
    },
  });
}

const COMMERCIAL_OCCUPANCY = ["commercial", "industrial", "mixed"] as const;

/** Residential new-service bands, keyed on `custom.amperage`. */
const RES_SERVICE_BANDS: Array<{ lo: number; hi: number; cents: number }> = [
  { lo: 1, hi: 99, cents: 3_000 },
  { lo: 100, hi: 200, cents: 4_000 },
  { lo: 201, hi: Number.MAX_SAFE_INTEGER, cents: 5_000 },
];

/**
 * Commercial new-service bands. The six printed amounts are certain; the boundary
 * between the $65.00 and $75.00 rows is the one reading the scan left ambiguous, so
 * the $65.00 band is drawn wide (100–399 A) and no amperage is left unpriced. The
 * unresolved boundary is recorded in research/west-virginia/charleston.md.
 */
const COMM_SERVICE_BANDS: Array<{ lo: number; hi: number; cents: number }> = [
  { lo: 1, hi: 99, cents: 5_500 },
  { lo: 100, hi: 399, cents: 6_500 },
  { lo: 400, hi: 799, cents: 7_500 },
  { lo: 800, hi: 1_199, cents: 8_500 },
  { lo: 1_200, hi: 1_599, cents: 10_000 },
  { lo: 1_600, hi: Number.MAX_SAFE_INTEGER, cents: 11_000 },
];

function serviceBand(
  prefix: string,
  occupancy: "residential" | "commercial",
  band: { lo: number; hi: number; cents: number },
): FeeRuleRecord {
  const occupancyCondition =
    occupancy === "residential"
      ? ({ field: "occupancy", op: "eq", value: "residential" } as const)
      : ({ field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] } as const);

  const upperLabel = band.hi === Number.MAX_SAFE_INTEGER ? "and up" : `–${band.hi} A`;
  return rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: `${prefix}-svc-${band.lo}`,
    code: `${prefix.toUpperCase()}-SVC-${band.lo}`,
    label: `New service, ${band.lo}${upperLabel} ($${(band.cents / 100).toFixed(2)})`,
    description: `Electrical Permit form, ${occupancy} column, New Service: ${band.lo}${upperLabel}, $${(band.cents / 100).toFixed(2)}.`,
    feeType: "flat",
    config: { amountCents: band.cents },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        occupancyCondition,
        { field: "custom.amperage", op: "gte", value: band.lo },
        { field: "custom.amperage", op: "lte", value: band.hi },
      ],
    },
  });
}

export const CH_ELECTRICAL_RULES: FeeRuleRecord[] = [
  CH_ELECTRICAL_FINAL_INSPECTION,

  /* Residential column */
  residentialFlat(
    "ch-elec-res-temp-pole",
    "CH-ELEC-RES-TEMP-POLE",
    "Temporary service pole ($25.00)",
    "Electrical Permit form, Residential column: Temporary Service Pole, $25.00.",
    "temporary_service",
    2_500,
  ),
  residentialFlat(
    "ch-elec-res-service-upgrade",
    "CH-ELEC-RES-SERVICE-UPGRADE",
    "Service upgrade ($20.00)",
    "Electrical Permit form, Residential column: Service Upgrade, $20.00.",
    "service_upgrade",
    2_000,
  ),
  residentialFlat(
    "ch-elec-res-remodeling",
    "CH-ELEC-RES-REMODELING",
    "Remodeling ($30.00)",
    "Electrical Permit form, Residential column: Remodeling, $30.00.",
    "remodeling",
    3_000,
  ),
  residentialFlat(
    "ch-elec-res-new-construction",
    "CH-ELEC-RES-NEW-CONSTRUCTION",
    "New construction ($30.00)",
    "Electrical Permit form, Residential column: New Construction, $30.00.",
    "new_construction",
    3_000,
  ),
  ...RES_SERVICE_BANDS.map((band) => serviceBand("ch-elec-res", "residential", band)),

  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-res-openings",
    code: "CH-ELEC-RES-OPENINGS",
    label: "Openings, residential ($5.00 each)",
    description:
      "Electrical Permit form, Residential column: 'OPENINGS (EACH CONNECTION TO BOX OR FIXTURE)' at $5.00 per opening.",
    feeType: "per_unit",
    config: { unit: "openings", centsPerUnit: 500 },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "eq", value: "residential" },
        { field: "custom.openings", op: "gte", value: 1 },
      ],
    },
  }),

  residentialFlat(
    "ch-elec-res-emergency-power",
    "CH-ELEC-RES-EMERGENCY-POWER",
    "Emergency power system ($25.00)",
    "Electrical Permit form, Residential column: Emergency Power System, $25.00.",
    "emergency_power",
    2_500,
  ),
  residentialFlat(
    "ch-elec-res-security",
    "CH-ELEC-RES-SECURITY",
    "Security system ($30.00)",
    "Electrical Permit form, Residential column: Security System, $30.00.",
    "security_system",
    3_000,
  ),
  residentialFlat(
    "ch-elec-res-burglar-alarm",
    "CH-ELEC-RES-BURGLAR-ALARM",
    "Burglar alarm ($20.00)",
    "Electrical Permit form, Residential column: Burglar Alarm, $20.00.",
    "burglar_alarm",
    2_000,
  ),
  residentialFlat(
    "ch-elec-res-low-voltage",
    "CH-ELEC-RES-LOW-VOLTAGE",
    "Low voltage ($20.00)",
    "Electrical Permit form, Residential column: Low Voltage, $20.00.",
    "low_voltage",
    2_000,
  ),

  /* Commercial column */
  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-comm-cost-1",
    code: "CH-ELEC-COMM-COST-1500",
    label: "Commercial job cost to $1,500 ($15.00)",
    description: "Electrical Permit form, Commercial column: Cost to $1,500, $15.00.",
    feeType: "flat",
    config: { amountCents: 1_500 },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] },
        { field: "valuation", op: "lte", value: 150_000 },
      ],
    },
  }),
  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-comm-cost-2",
    code: "CH-ELEC-COMM-COST-2500",
    label: "Commercial job cost $1,501–$2,500 ($25.00)",
    description: "Electrical Permit form, Commercial column: Cost $1,501 to $2,500, $25.00.",
    feeType: "flat",
    config: { amountCents: 2_500 },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] },
        { field: "valuation", op: "gt", value: 150_000 },
        { field: "valuation", op: "lte", value: 250_000 },
      ],
    },
  }),
  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-comm-cost-3",
    code: "CH-ELEC-COMM-COST-5000",
    label: "Commercial job cost $2,501–$5,000 ($40.00)",
    description: "Electrical Permit form, Commercial column: Cost $2,501 to $5,000, $40.00.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] },
        { field: "valuation", op: "gt", value: 250_000 },
        { field: "valuation", op: "lte", value: 500_000 },
      ],
    },
  }),
  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-comm-cost-4",
    code: "CH-ELEC-COMM-COST-10K",
    label: "Commercial job cost $5,001–$10,000 ($50.00)",
    description: "Electrical Permit form, Commercial column: Cost $5,001 to $10,000, $50.00.",
    feeType: "flat",
    config: { amountCents: 5_000 },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] },
        { field: "valuation", op: "gt", value: 500_000 },
        { field: "valuation", op: "lte", value: 1_000_000 },
      ],
    },
  }),
  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-comm-cost-up",
    code: "CH-ELEC-COMM-COST-10K-UP",
    label: "Commercial job cost above $10,000 ($60.00 + $1.00 per $1,000 over $10,000)",
    description:
      "Electrical Permit form, Commercial column: 'COST $10,000.00 AND UP (ADD $1 PER $1,000 OVER $10,000)', read as the $60.00 base plus $1.00 for each $1,000 of cost above $10,000.",
    feeType: "per_thousand",
    config: {
      basis: "valuation",
      baseCents: 6_000,
      thresholdCents: 1_000_000,
      incrementCents: 100_000,
      centsPerThousand: 100,
    },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] },
        { field: "valuation", op: "gt", value: 1_000_000 },
      ],
    },
  }),

  ...COMM_SERVICE_BANDS.map((band) => serviceBand("ch-elec-comm", "commercial", band)),

  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-comm-openings",
    code: "CH-ELEC-COMM-OPENINGS",
    label: "Openings, commercial ($0.50 each)",
    description:
      "Electrical Permit form, Commercial column: 'OPENINGS (EACH CONNECTION TO BOX OR FIXTURE)', $0.50 per opening.",
    feeType: "per_unit",
    config: { unit: "openings", centsPerUnit: 50 },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] },
        { field: "custom.openings", op: "gte", value: 1 },
      ],
    },
  }),

  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-comm-fire-alarm-3",
    code: "CH-ELEC-COMM-FIRE-ALARM-3",
    label: "Fire alarm system up to 3 floors ($20.00)",
    description: "Electrical Permit form, Commercial column: Fire Alarm System up to 3 floors, $20.00.",
    feeType: "flat",
    config: { amountCents: 2_000 },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] },
        { field: "custom.fire_alarm_floors", op: "gte", value: 1 },
        { field: "custom.fire_alarm_floors", op: "lte", value: 3 },
      ],
    },
  }),
  rule(CH_ELECTRICAL_SOURCE_KEY, {
    id: "ch-elec-comm-fire-alarm-4",
    code: "CH-ELEC-COMM-FIRE-ALARM-4",
    label: "Fire alarm system 4 floors and up ($40.00)",
    description:
      "Electrical Permit form, Commercial column: Fire Alarm System 4 floors and up, $40.00.",
    feeType: "flat",
    config: { amountCents: 4_000 },
    effectiveFrom: CH_ELECTRICAL_EFFECTIVE_FROM,
    conditions: {
      all: [
        { field: "occupancy", op: "in", value: [...COMMERCIAL_OCCUPANCY] },
        { field: "custom.fire_alarm_floors", op: "gte", value: 4 },
      ],
    },
  }),

  commercialFlat(
    "ch-elec-comm-emergency-power",
    "CH-ELEC-COMM-EMERGENCY-POWER",
    "Emergency power system ($25.00)",
    "Electrical Permit form, Commercial column: Emergency Power System, $25.00.",
    "emergency_power",
    2_500,
  ),
  commercialFlat(
    "ch-elec-comm-temp-pole",
    "CH-ELEC-COMM-TEMP-POLE",
    "Temporary service pole ($30.00)",
    "Electrical Permit form, Commercial column: Temp Service Pole, $30.00.",
    "temporary_service",
    3_000,
  ),
  commercialFlat(
    "ch-elec-comm-low-voltage",
    "CH-ELEC-COMM-LOW-VOLTAGE",
    "Low voltage ($30.00)",
    "Electrical Permit form, Commercial column: Low Voltage, $30.00.",
    "low_voltage",
    3_000,
  ),
  commercialFlat(
    "ch-elec-comm-security",
    "CH-ELEC-COMM-SECURITY",
    "Security alarm ($30.00)",
    "Electrical Permit form, Commercial column: Security Alarm, $30.00.",
    "security_system",
    3_000,
  ),
];
