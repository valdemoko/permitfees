import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Springfield, Missouri fee rules — REAL DATA.
 *
 * Sources (research/missouri/springfield.md records how each was read):
 *
 *  S1  Building Development Services — Commercial Construction fee schedule
 *      (Effective 07/01/2025), docx 29,975 bytes, SHA-256
 *      db5512282d15cdfdae65564a4d72e6be2ee55b9fef726bd1e63319e2aed070cb.
 *      https://www.springfieldmo.gov/DocumentCenter/View/910
 *  S2  Building Development Services — Residential Construction fee schedule
 *      (Effective 07/01/2025), docx 23,556 bytes, SHA-256
 *      4965997b259f86f666ac9f8ee0c0c3de8942836ec6db4bd1bcb77132f447cba0.
 *      https://www.springfieldmo.gov/DocumentCenter/View/926
 *  S3  2009 IBC Fee Calculation Data (Effective July 1, 2009), PDF 25,597 bytes,
 *      SHA-256 9763689a735154ef4f99a1086eeb573e962c8d9f5479cc824c8b3ac99fa37b0a.
 *      https://www.springfieldmo.gov/DocumentCenter/View/902
 *
 * **The mechanism.** Both schedules build a *construction factor*:
 * `Gross Area (sq ft) × 85 × Type of Construction Factor`. The Type Factor is
 * S3's matrix (31 use groups × 9 construction types, 279 published multipliers,
 * e.g. Business IIA 1.50, S-1 IIA 0.81). The permit fee is then a four-band
 * **marginal table on that factor**:
 * commercial 0.005 / 0.004 / 0.003 / 0.0015 dollars per factor (0.5 / 0.4 / 0.3 / 0.15
 * cents per factor, minimum $171); residential 0.004 / 0.003 / 0.002 / 0.001 at the
 * single R-3/IRC factor 0.3876 (1.02 × 0.38), minimum $151. Infills/renovations use
 * Type Factor 0.30 with the same commercial table. Shell buildings use the S-1-like
 * Business Open-Shell factor.
 *
 * Two dependent components ride the commercial building fee: plan review **75% of
 * permit fee** (floor $257 BDS+CU / $492 multi-department) and technology **18.5%**
 * (floor $50, n/a if plan review n/a); residential MEP is **40% ($110 floor)** and
 * the eleven commercial / four residential trade flats are $171 / $110 / $49 as the
 * schedules print them.
 *
 * **What is deliberately NOT here:** the 279-cell IBC matrix itself (named, not
 * carried as 279 rateTables — see research record), the 30% provisional phase-approval
 * fee (a second payment schedule), every sign/pool/tower/wrecking/fence, cooler/hood,
 * fire-sprinkler calcs vs no-calcs, stormwater, certificates, re-inspections,
 * re-submittals and the ×2 + $200 no-permit penalty — all transcribed and named.
 */

export const SPRINGFIELD_COMMERCIAL_EFFECTIVE_FROM = "2025-07-01";
export const SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM = "2025-07-01";
export const SPRINGFIELD_IBC_EFFECTIVE_FROM = "2009-07-01";

export const SPRINGFIELD_COMMERCIAL_SOURCE_KEY = "springfield-commercial-fee-schedule";
export const SPRINGFIELD_RESIDENTIAL_SOURCE_KEY = "springfield-residential-fee-schedule";
export const SPRINGFIELD_IBC_SOURCE_KEY = "springfield-ibc-fee-calculation-data";

function spRule(
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
    effectiveFrom: SPRINGFIELD_COMMERCIAL_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — the two construction-factor marginal tables               */
/* -------------------------------------------------------------------------- */

export const SPRINGFIELD_COMMERCIAL_BUILDING_RULE: FeeRuleRecord = spRule(
  SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
  {
    id: "springfield-bld-commercial",
    code: "BLD-COMMERCIAL",
    label: "Building permit — commercial new building, addition, infill/renovation or shell, construction factor at 0.005 / 0.004 / 0.003 / 0.0015 ($171 minimum)",
    feeType: "tiered_marginal",
    config: {
      basis: "construction_factor",
      tiers: [
        { upToCents: 50_000, rate: { numerator: 1, denominator: 2 } },
        { upToCents: 100_000, rate: { numerator: 2, denominator: 5 } },
        { upToCents: 150_000, rate: { numerator: 3, denominator: 10 } },
        { upToCents: null, rate: { numerator: 3, denominator: 20 } },
      ],
    },
    minimumCents: 17_100,
    conditions: { field: "custom.building_class", op: "eq", value: "commercial" },
    description:
      'S1 p.1: \"1st 50,000 of Construction Factor × 0.005 = Permit Fee A + 2nd 50,000 × 0.004 = B + 3rd 50,000 × 0.003 = C + Remaining × 0.0015 = D; Total A+B+C+D = Building Permit Fee (minimum $171.00)\" — a marginal table on construction factor at half cents and 0.15 cents per factor. Construction Factor = Gross Area × 85 × Type Factor (S3 matrix; infill/renovation Type Factor 0.30; shell ~S-1).',
  },
);

export const SPRINGFIELD_RESIDENTIAL_BUILDING_RULE: FeeRuleRecord = spRule(
  SPRINGFIELD_RESIDENTIAL_SOURCE_KEY,
  {
    id: "springfield-bld-residential",
    code: "BLD-RESIDENTIAL",
    label: "Building permit — residential new building, garage or home addition, construction factor at 0.004 / 0.003 / 0.002 / 0.001 ($151 minimum)",
    feeType: "tiered_marginal",
    config: {
      basis: "construction_factor",
      tiers: [
        { upToCents: 50_000, rate: { numerator: 2, denominator: 5 } },
        { upToCents: 100_000, rate: { numerator: 3, denominator: 10 } },
        { upToCents: 150_000, rate: { numerator: 1, denominator: 5 } },
        { upToCents: null, rate: { numerator: 1, denominator: 10 } },
      ],
    },
    minimumCents: 15_100,
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.building_class", op: "eq", value: "residential" },
    description:
      'S2 p.1: \"1st 50,000 × 0.004 = A + 2nd × 0.003 = B + 3rd × 0.002 = C + Remaining × 0.001 = D; Total of A+B+C+D = Building Permit Fee (minimum $151.00)\" — same shape at different rates. Type Factor is fixed at 1.02 × 0.38 = 0.3876 (R-3/IRC), so Construction Factor = Finished Living Area × 85 × 0.3876 (garage/accessory the same).',
  },
);

/* -------------------------------------------------------------------------- */
/* Dependent components — commercial plan review and technology                 */
/* -------------------------------------------------------------------------- */

export const SPRINGFIELD_PLAN_REVIEW_RULE: FeeRuleRecord = spRule(
  SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
  {
    id: "springfield-plan-review",
    code: "PLAN-REVIEW",
    label: "Plan review — 75% of building permit fee ($257 minimum; $492 multi-department)",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 7_500 },
    componentType: "plan_review",
    minimumCents: 25_700,
    conditions: { field: "custom.building_class", op: "eq", value: "commercial" },
    description:
      'S1 p.2: \"COMMERCIAL PLAN REVIEW FEE 75% of Building Permit Fee, or minimum of $492.00 for Projects which Require Review by Multiple City Departments. Minimum $257.00 for Projects which require review by BDS and City Utilities only.\" No plan review for work minor under §36.1234. The $257 row is the rule\\\'s floor; the $492 figure is the multi-department minimum named beside it. Non-refundable.',
  },
);

export const SPRINGFIELD_TECHNOLOGY_RULE: FeeRuleRecord = spRule(
  SPRINGFIELD_COMMERCIAL_SOURCE_KEY,
  {
    id: "springfield-technology",
    code: "TECHNOLOGY",
    label: "Technology fee — 18.5% of building permit fee ($50 minimum)",
    feeType: "percent",
    config: { basis: "permit_fee", rateBps: 1_850 },
    componentType: "technology",
    minimumCents: 5_000,
    conditions: { field: "custom.building_class", op: "eq", value: "commercial" },
    description:
      'S1 p.2: \"TECHNOLOGY FEE 18.5% of the calculated Building Permit Fee, or minimum of $50.00, whichever is greater. (Not applicable if Plan Review is not Applicable).\" Non-refundable, charged on the base building fee.',
  },
);

/* -------------------------------------------------------------------------- */
/* Flat trade rows                                                             */
/* -------------------------------------------------------------------------- */

export const SPRINGFIELD_COMMERCIAL_TRADE_FLATS: FeeRuleRecord[] = [
  spRule(SPRINGFIELD_COMMERCIAL_SOURCE_KEY, {
    id: "springfield-com-gas",
    code: "COM-GAS",
    label: "Commercial gas permit — $171.00",
    feeType: "flat",
    config: { amountCents: 17_100 },
    componentType: "base",
    priority: 100,
    conditions: { field: "custom.trade_scope", op: "eq", value: "gas" },
    description: 'S1 p.3: \"COMMERCIAL GAS PERMIT FEE $171.00\" — the flat gas row.',
  }),
  spRule(SPRINGFIELD_COMMERCIAL_SOURCE_KEY, {
    id: "springfield-com-mep-not-associated",
    code: "COM-MEP-NOT-ASSOCIATED",
    label: "Commercial MEP not associated with a building permit — $171.00",
    feeType: "flat",
    config: { amountCents: 17_100 },
    componentType: "base",
    priority: 100,
    conditions: { field: "custom.trade_scope", op: "eq", value: "mep_not_associated" },
    description:
      'S1 p.3: \"COMMERCIAL MECHANICAL, ELECTRICAL AND PLUMBING PERMIT FEES WHICH ARE NOT ASSOCIATED WITH A BUILDING PERMIT: PERMIT FEE $171.00\" — the flat stand-alone MEP row; the 40%-when-associated row is the same sheet\\\'s percentage (40% of building permit fee, $171 floor) and is named on the pages rather than charged inside a self-issuing trade permit.',
  }),
  spRule(SPRINGFIELD_COMMERCIAL_SOURCE_KEY, {
    id: "springfield-com-fis-overhead-new",
    code: "COM-FIS-OVERHEAD-NEW",
    label: "Commercial fire sprinkler — new overhead FIS — $171.00",
    feeType: "flat",
    config: { amountCents: 17_100 },
    componentType: "base",
    priority: 100,
    conditions: { field: "custom.trade_scope", op: "eq", value: "fis_overhead_new" },
    description:
      'S1 p.3–4: \"NEW OVERHEAD FIRE SPRINKLER SYSTEM FIS PERMIT FEE $171.00\" — plus plan review $257 and tech $50 when not associated with a building permit (the surcharges are named, not modelled as extra rules on this flat).',
  }),
  spRule(SPRINGFIELD_COMMERCIAL_SOURCE_KEY, {
    id: "springfield-com-sign-detached",
    code: "COM-SIGN-DETACHED",
    label: "Commercial sign — detached — $249.00",
    feeType: "flat",
    config: { amountCents: 24_900 },
    componentType: "base",
    priority: 100,
    conditions: { field: "custom.trade_scope", op: "eq", value: "sign_detached" },
    description: 'S1 p.4: \"PERMIT FEE (DETACHED) $249.00 (New installation or alteration of any kind)\" — plan $100 + tech $46 beside it.',
  }),
  spRule(SPRINGFIELD_COMMERCIAL_SOURCE_KEY, {
    id: "springfield-com-sign-wall",
    code: "COM-SIGN-WALL",
    label: "Commercial sign — wall — $69.00",
    feeType: "flat",
    config: { amountCents: 6_900 },
    componentType: "base",
    priority: 100,
    conditions: { field: "custom.trade_scope", op: "eq", value: "sign_wall" },
    description: 'S1 p.4: \"PERMIT FEE (WALL) $69.00\" — plan $50 + tech $13 beside it.',
  }),
];

export const SPRINGFIELD_RESIDENTIAL_TRADE_FLATS: FeeRuleRecord[] = [
  spRule(SPRINGFIELD_RESIDENTIAL_SOURCE_KEY, {
    id: "springfield-res-gas",
    code: "RES-GAS",
    label: "Residential gas permit — $110.00",
    feeType: "flat",
    config: { amountCents: 11_000 },
    componentType: "base",
    priority: 100,
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.trade_scope", op: "eq", value: "gas" },
    description: 'S2 p.2: \"RESIDENTIAL GAS PERMIT FEE $110.00\" — residential counterpart of the $171 commercial row.',
  }),
  spRule(SPRINGFIELD_RESIDENTIAL_SOURCE_KEY, {
    id: "springfield-res-mep-not-associated",
    code: "RES-MEP-NOT-ASSOCIATED",
    label: "Residential MEP not associated with a building permit — $110.00",
    feeType: "flat",
    config: { amountCents: 11_000 },
    componentType: "base",
    priority: 100,
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.trade_scope", op: "eq", value: "mep_not_associated" },
    description: 'S2 p.2: \"RESIDENTIAL MECHANICAL, ELECTRICAL, AND PLUMBING PERMIT FEES WHICH ARE NOT ASSOCIATED WITH A BUILDING PERMIT $110.00\"',
  }),
  spRule(SPRINGFIELD_RESIDENTIAL_SOURCE_KEY, {
    id: "springfield-res-furnace-ac",
    code: "RES-FURNACE-AC",
    label: "Residential furnace and/or air conditioner change-out — $49.00",
    feeType: "flat",
    config: { amountCents: 4_900 },
    componentType: "base",
    priority: 100,
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.trade_scope", op: "eq", value: "furnace_ac" },
    description: 'S2 p.2: \"RESIDENTIAL MECHANICAL FURNACE AND / OR AIR CONDITIONER CHANGE OUTS: $49.00\"',
  }),
  spRule(SPRINGFIELD_RESIDENTIAL_SOURCE_KEY, {
    id: "springfield-res-water-heater",
    code: "RES-WATER-HEATER",
    label: "Residential plumbing — water heater change-out — $49.00",
    feeType: "flat",
    config: { amountCents: 4_900 },
    componentType: "base",
    priority: 100,
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.trade_scope", op: "eq", value: "water_heater" },
    description: 'S2 p.2: \"RESIDENTIAL PLUMBING WATER HEATER CHANGE OUTS: $49.00\"',
  }),
  spRule(SPRINGFIELD_RESIDENTIAL_SOURCE_KEY, {
    id: "springfield-res-lawn-sprinkler",
    code: "RES-LAWN-SPRINKLER",
    label: "Residential lawn sprinkler / backflow preventer plumbing — $110.00",
    feeType: "flat",
    config: { amountCents: 11_000 },
    componentType: "base",
    priority: 100,
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.trade_scope", op: "eq", value: "lawn_sprinkler" },
    description: 'S2 p.2: \"RESIDENTIAL LAWN SPRINKLER SYSTEM, BACKFLOW PREVENTER INSTALLATION PLUMBING PERMIT FEE $110.00\"',
  }),
  spRule(SPRINGFIELD_RESIDENTIAL_SOURCE_KEY, {
    id: "springfield-res-wrecking",
    code: "RES-WRECKING",
    label: "Residential wrecking — $151.00",
    feeType: "flat",
    config: { amountCents: 15_100 },
    componentType: "base",
    priority: 100,
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.trade_scope", op: "eq", value: "wrecking" },
    description: 'S2 p.2: \"WRECKING PERMIT FEE $151.00\"',
  }),
];

/* Aggregates wiring — every Springfield fee the seed writes is one of these. */

export const SPRINGFIELD_BUILDING_FEE_RULES: FeeRuleRecord[] = [
  SPRINGFIELD_COMMERCIAL_BUILDING_RULE,
  SPRINGFIELD_RESIDENTIAL_BUILDING_RULE,
  SPRINGFIELD_PLAN_REVIEW_RULE,
  SPRINGFIELD_TECHNOLOGY_RULE,
];

export const SPRINGFIELD_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  // Electrical flats — not-associated MEP plus the same commercial/residential splits the sheet prints
  SPRINGFIELD_COMMERCIAL_TRADE_FLATS[1]!,
  SPRINGFIELD_RESIDENTIAL_TRADE_FLATS[1]!,
  spRule(SPRINGFIELD_RESIDENTIAL_SOURCE_KEY, {
    id: "springfield-elec-service-repair",
    code: "ELEC-SERVICE-REPAIR",
    label: "Residential electrical service repair — $49.00",
    feeType: "flat",
    config: { amountCents: 4_900 },
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.trade_scope", op: "eq", value: "service_repair" },
    description: 'S2 p.2: \"RESIDENTIAL ELECTRICAL SERVICE REPAIRS PERMIT FEE: $49.00\"',
  }),
];

export const SPRINGFIELD_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  SPRINGFIELD_RESIDENTIAL_TRADE_FLATS[3]!,
  SPRINGFIELD_RESIDENTIAL_TRADE_FLATS[4]!,
  SPRINGFIELD_COMMERCIAL_TRADE_FLATS[0]!,
  SPRINGFIELD_RESIDENTIAL_TRADE_FLATS[0]!,
  spRule(SPRINGFIELD_COMMERCIAL_SOURCE_KEY, {
    id: "springfield-plumb-air-test",
    code: "PLUMB-AIR-TEST",
    label: "Commercial air-test-only gas — $171.00",
    feeType: "flat",
    config: { amountCents: 17_100 },
    conditions: { field: "custom.trade_scope", op: "eq", value: "air_test" },
    description: 'S1 p.3: \"COMMERCIAL AIR TEST ONLY PERMIT FEE $171.00\"',
  }),
  spRule(SPRINGFIELD_RESIDENTIAL_SOURCE_KEY, {
    id: "springfield-res-air-test",
    code: "RES-AIR-TEST",
    label: "Residential air-test-only gas — $49.00",
    feeType: "flat",
    config: { amountCents: 4_900 },
    effectiveFrom: SPRINGFIELD_RESIDENTIAL_EFFECTIVE_FROM,
    conditions: { field: "custom.trade_scope", op: "eq", value: "air_test" },
    description: 'S2 p.2: \"RESIDENTIAL AIR TEST ONLY GAS PERMIT FEE $49.00\"',
  }),
];
