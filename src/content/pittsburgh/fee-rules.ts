import type { FeeCondition, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Pittsburgh, Pennsylvania fee rules — REAL DATA.
 *
 * Sources (research/pennsylvania/pittsburgh.md records how each was read):
 *
 *  S1  2026 Fee Schedule, PLI, effective 1/1/2026 — the four-page schedule the
 *      PLI Fees page links as current. Read 2026-09-25 in both pdftotext modes,
 *      then diffed line for line against S2 so the year's changes are recorded
 *      rather than assumed (the commercial ceiling moved $80,000 → $95,000; the
 *      residential rows did not move at all).
 *      https://www.pittsburghpa.gov/files/assets/city/v/1/pli/documents/fees/2026-fee-schedule-final-2.pdf
 *  S2  2025 Fee Schedule (superseded), effective 1/1/2025.
 *      https://www.pittsburghpa.gov/files/assets/city/v/1/pli/documents/fees/pli-fee-schedule-1-1-2025.pdf
 *  S4  PLI's own Permit Fee Calculator — an HTML app whose source carries the
 *      City's arithmetic as code: rate variables `.006` / `.007`, the min-max
 *      clamps, the technology brackets keyed on the adjusted base fee, the TPA
 *      discount's scope, the 40% application fee. It is what settles the two
 *      readings the schedule leaves open (see below).
 *
 * **The mechanism, in one paragraph.** Pittsburgh prices every construction
 * permit — building, electrical, mechanical — off **one number**: the total
 * construction value of the project, multiplied by a rate and clamped between a
 * published minimum and maximum ($6.00 per $1,000 residential, $130–$8,000;
 * $7.00 per $1,000 commercial, $605–$95,000). No work type, no occupancy class,
 * no fixture count touches it: the reader declares a **structure type** and
 * gives a value. Three add-ons ride every permit — a **technology fee** whose
 * four brackets are selected by the size of the base fee itself ($2 / $5 / $15
 * / $25), the State's **code-official training fund** at $4.50 (Act 37 of 2017,
 * printed on the City's fees page), and a **digital record retention fee** of
 * $5.00 — and one published figure *reduces* the total: the **15% Third Party
 * Agency discount** on commercial electrical permits, which PLI requires
 * ("TPA Inspection of commercial electrical permits"), folded into that row's
 * rate as $5.95 per $1,000 with the minimum and maximum scaled to match,
 * because the engine has no negative component.
 *
 * **Two readings the schedule does not settle and the calculator does.** First,
 * "per $1,000" prints **no "or fraction thereof"**, and the calculator's code
 * multiplies straight through (`value × .006`) — so $25,100 of construction
 * value is $150.60, not the $156 a round-up would charge. Modelled prorated:
 * no `incrementCents`, which is this engine's way of saying the basis was not
 * rounded. Second, the clamp applies to the multiplied figure *before* the TPA
 * discount, which is why the discounted row's minimum is $514.25 (=$605 × .85)
 * rather than $605 — clamp and discount commute under a positive scale, so
 * scaling the rate and the clamp together reproduces the City's arithmetic
 * exactly.
 *
 * **What is deliberately NOT here:**
 *
 *  - **The 40% application split** — "40% of Base Fee (Non-Refundable) Due at
 *    Application; Remainder of Base Fee Due at Issuance", printed once per base
 *    row. A payment schedule and a forfeiture risk, not an extra charge: the
 *    total the permit costs does not change. Named on every page, never added.
 *  - **Zoning fees.** The Building and Development Application bundles zoning
 *    *approval* since June 2024; the zoning *fee* is City Planning's separate
 *    schedule ("Zoning Fees may apply. Please consult the Zoning Fee
 *    Schedule."). The calculator's internal estimate (0.1% / 0.3% of value,
 *    $50 / $100 minimums, $40,000 cap) is recorded in the research file, not
 *    published as a rate — the zoning schedule itself was not read.
 *  - **Accelerated Plan Review** (1.5% / 1.0% with their own floors and caps,
 *    and currently offered only for fire alarm and fire suppression), the
 *    **pre-application plan review meeting** (0.25% of project value,
 *    $125–$7,000), and the **complex-project path** — a Building & Development
 *    permit of 50,000+ sq ft, 100+ new dwelling units or more than $20,000,000
 *    must go to a mandatory pre-application meeting first, where "All other
 *    fees and requirements will be assessed following the pre-application
 *    meeting", so a total for such a project is not final here.
 *  - **The reconnect flat rows** ($75 residential / $150 commercial), which
 *    exist only in the calculator and print nowhere on the schedule — named on
 *    the electrical page, not modelled.
 *  - **Every other row on the same schedule**: sign and stormwater base rows,
 *    demolition, land operations, occupancy-only and placard permits, fire
 *    alarm / suppression with their $100 maintenance fee, certificates of
 *    occupancy, floodplain review, overtime inspections, boards, trade and
 *    business licenses, registrations, permit amendments (same rates on the
 *    *change* in value) and the $50 license-holder change, and payment
 *    processing fees.
 *  - **Plumbing**, which Pittsburgh does not issue: "all plumbing not
 *    associated with sprinkler systems in the City of Pittsburgh is regulated
 *    by Allegheny County Health Department, not the City."
 *
 * **This module is the single definition of Pittsburgh's fee rules.** The seed
 * writes exactly these records and the tests assert against exactly these
 * records.
 */

/** The schedule's own header: "2026 FEE SCHEDULE — EFFECTIVE 1/1/2026". */
export const PITT_FEE_EFFECTIVE_FROM = "2026-01-01";

export const PITT_FEE_SCHEDULE_SOURCE_KEY = "pittsburgh-pli-fee-schedule-2026";
export const PITT_FEE_SCHEDULE_2025_SOURCE_KEY = "pittsburgh-pli-fee-schedule-2025";
export const PITT_FEES_PAGE_SOURCE_KEY = "pittsburgh-pli-fees-page";
export const PITT_FEE_CALCULATOR_SOURCE_KEY = "pittsburgh-permit-fee-calculator";
export const PITT_FEE_CALCULATOR_PAGE_SOURCE_KEY = "pittsburgh-fee-calculator-page";
export const PITT_PERMITTING_SOURCE_KEY = "pittsburgh-permitting";
export const PITT_ELECTRICAL_PAGE_SOURCE_KEY = "pittsburgh-electrical-permit-page";
export const PITT_MECHANICAL_PAGE_SOURCE_KEY = "pittsburgh-mechanical-permit-page";
export const PITT_TPA_SOURCE_KEY = "pittsburgh-tpa";
export const PITT_WORK_NOT_REQUIRING_SOURCE_KEY = "pittsburgh-work-not-requiring-permit";

/* -------------------------------------------------------------------------- */
/* The published amounts                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The base rows, from S1's first block ("ALL CONSTRUCTION PERMIT TYPES"):
 * rates in cents per $1,000 of construction value, clamps in cents.
 */
export const PITT_RESIDENTIAL_RATE_PER_THOUSAND = 600; // $6.00 per $1,000
export const PITT_COMMERCIAL_RATE_PER_THOUSAND = 700; // $7.00 per $1,000
/** The commercial electrical rate after the required TPA discount: $7.00 × 0.85. */
export const PITT_COMMERCIAL_TPA_RATE_PER_THOUSAND = 595;

export const PITT_RESIDENTIAL_MINIMUM_CENTS = 13_000; // $130
export const PITT_RESIDENTIAL_MAXIMUM_CENTS = 800_000; // $8,000
export const PITT_COMMERCIAL_MINIMUM_CENTS = 60_500; // $605
export const PITT_COMMERCIAL_MAXIMUM_CENTS = 9_500_000; // $95,000 (2026; was $80,000)
/** The clamp, scaled by the discount: $605 × .85 and $95,000 × .85. */
export const PITT_COMMERCIAL_TPA_MINIMUM_CENTS = 51_425; // $514.25
export const PITT_COMMERCIAL_TPA_MAXIMUM_CENTS = 8_075_000; // $80,750

/** S1: "State Education & Training Fund (SETF) — Per permit $4.50". */
export const PITT_SETF_CENTS = 450;
/** S1: "Digital Record Retention Fee — Per permit $5.00". */
export const PITT_DIGITAL_RETENTION_CENTS = 500;
/** S1: "Third Party Agency Discount — 15% of Base Fee on applicable permit types". */
export const PITT_TPA_DISCOUNT = { numerator: 15, denominator: 100 } as const;

/* -------------------------------------------------------------------------- */
/* Conditions — the one fact the schedule turns on                             */
/* -------------------------------------------------------------------------- */

/**
 * The reader's declared structure type, in the City's own two values (the
 * calculator's dropdown offers exactly "Residential" and "Commercial").
 * Absent the flag the commercial row applies — the larger figure, which is the
 * default this site uses for column splits everywhere.
 */
const RESIDENTIAL_STRUCTURE: FeeCondition = {
  field: "custom.structure_type",
  op: "eq",
  value: "residential",
};
const NOT_RESIDENTIAL_STRUCTURE: FeeCondition = { not: RESIDENTIAL_STRUCTURE };

/* -------------------------------------------------------------------------- */
/* Rule helpers                                                               */
/* -------------------------------------------------------------------------- */

function pittRule(
  overrides: Pick<
    FeeRuleRecord,
    "id" | "code" | "label" | "description" | "feeType" | "config"
  > &
    Partial<FeeRuleRecord>,
): FeeRuleRecord {
  return {
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: PITT_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: PITT_FEE_SCHEDULE_SOURCE_KEY,
    ...overrides,
  };
}

type PermitPrefix = "BLD" | "ELEC" | "MECH";

const SLUG: Record<PermitPrefix, string> = {
  BLD: "bld",
  ELEC: "elec",
  MECH: "mech",
};

/** A base-fee row: one rate per $1,000 of construction value, clamped, prorated. */
function baseFeeRule(options: {
  permitType: PermitPrefix;
  structure: "RESIDENTIAL" | "COMMERCIAL";
  ratePerThousand: number;
  minimumCents: number;
  maximumCents: number;
  conditions: FeeCondition;
  label: string;
  description: string;
  sourceId?: string;
}): FeeRuleRecord {
  return pittRule({
    id: `pittsburgh-${SLUG[options.permitType]}-base-${options.structure.toLowerCase()}`,
    code: `${options.permitType}-BASE-${options.structure}`,
    label: options.label,
    description: options.description,
    feeType: "per_thousand",
    // No incrementCents: the schedule prints no "or fraction thereof" and the
    // City's calculator multiplies straight through, so the value is prorated.
    config: { basis: "valuation", centsPerThousand: options.ratePerThousand },
    minimumCents: options.minimumCents,
    maximumCents: options.maximumCents,
    conditions: options.conditions,
    ...(options.sourceId ? { sourceId: options.sourceId } : {}),
  });
}

/**
 * The technology fee: four flat brackets selected by the size of the base fee
 * itself, which the calculator reads off the adjusted (clamped) base fee — so
 * on the `permit_fee` basis, in cents, inclusive at each ceiling.
 */
function technologyFeeRule(permitType: PermitPrefix, description: string): FeeRuleRecord {
  return pittRule({
    id: `pittsburgh-${SLUG[permitType]}-tech-fee`,
    code: `${permitType}-TECH-FEE`,
    label: "Technology fee, $2 / $5 / $15 / $25 by base-fee range",
    description,
    feeType: "tiered_table",
    config: {
      basis: "permit_fee",
      tiers: [
        { upToCents: 20_000, amountCents: 200 }, // $0 – $200
        { upToCents: 100_000, amountCents: 500 }, // $201 – $1,000
        { upToCents: 1_000_000, amountCents: 1_500 }, // $1,001 – $10,000
        { upToCents: null, amountCents: 2_500 }, // $10,001 +
      ],
    },
    componentType: "technology",
    priority: 500,
  });
}

/** The State's code-official training fund, $4.50 on every permit. */
function setfRule(permitType: PermitPrefix): FeeRuleRecord {
  return pittRule({
    id: `pittsburgh-${SLUG[permitType]}-setf`,
    code: `${permitType}-SETF`,
    label: "State Education & Training Fund (SETF), $4.50 per permit",
    description:
      "S1: \"State Education & Training Fund (SETF) — Per permit $4.50\", one of the two \"ADDITIONAL PERMIT FEES AND DISCOUNTS\" rows. The City's fees page supplies the statute the schedule does not: \"Effective October 25, 2017, the fees collected for the Pennsylvania code official training fund (SEFT [sic] fees) have increased from $4.00 to $4.50. Governor Wolf signed Act 37 of 2017 authorizing the increase of fees collected by municipalities administering and enforcing construction or building permits in accordance with the Pennsylvania Construction Code Act.\" Charged on every permit of this type. The City's calculator waives it for floodplain permits and for the complex-project path, where every fee is deferred to after the mandatory pre-application meeting anyway.",
    feeType: "flat",
    config: { amountCents: PITT_SETF_CENTS },
    componentType: "state_surcharge",
    priority: 900,
  });
}

/** The digital record retention fee, $5.00 on every permit. */
function digitalRetentionRule(permitType: PermitPrefix): FeeRuleRecord {
  return pittRule({
    id: `pittsburgh-${SLUG[permitType]}-digital-retention`,
    code: `${permitType}-DIGITAL-RETENTION`,
    label: "Digital record retention fee, $5.00 per permit",
    description:
      "S1's second additional row: \"Digital Record Retention Fee — Per permit $5.00\", charged with every permit of this type. The City's calculator carries a second, dormant value — `$document_retention_fee = 3` — that its own total never reads; only the $5.00 reaches a filer's bill, so only the $5.00 is here.",
    feeType: "flat",
    config: { amountCents: PITT_DIGITAL_RETENTION_CENTS },
    componentType: "other",
    priority: 600,
  });
}

const TECHNOLOGY_FEE_TEXT =
  "S1: \"Technology Fee: Fees are assessed based on range of Base Permit Fee — $0 - $200: $2.00; $201 - $1,000: $5.00; $1,001 - $10,000: $15.00; $10,001 +: $25.00.\" A fee whose bracket is chosen by the size of another fee, which the calculator keys on the adjusted base fee (`adj_base_fee_calc`, the clamped base) — so it is a four-bracket table read on this permit's own base fee, inclusive at each ceiling and open at the top. It exists whether the base fee hit its minimum or its maximum: a $130 minimum permit still pays the $2.00 bracket, because $130 sits in the $0-$200 range.";

/* -------------------------------------------------------------------------- */
/* Building permits — S1 page 1, via the Building and Development Application  */
/* -------------------------------------------------------------------------- */

export const PITT_BUILDING_BASE_RESIDENTIAL: FeeRuleRecord = baseFeeRule({
  permitType: "BLD",
  structure: "RESIDENTIAL",
  ratePerThousand: PITT_RESIDENTIAL_RATE_PER_THOUSAND,
  minimumCents: PITT_RESIDENTIAL_MINIMUM_CENTS,
  maximumCents: PITT_RESIDENTIAL_MAXIMUM_CENTS,
  conditions: RESIDENTIAL_STRUCTURE,
  label: "Building permit — residential, $6.00 per $1,000 of construction value",
  description:
    "S1, under \"ALL CONSTRUCTION PERMIT TYPES\": \"Base Permit Fee (Residential) — $6.00 per $1,000 of Construction Value (Minimum: $130 – Maximum: $8,000)\". One row for every construction permit type, building included. The rate prints no \"or fraction thereof\", and PLI's own Fee Calculator multiplies straight through — `con_value × .006` — so $25,100 of construction value is $150.60 of fee rather than the $156 a per-thousand round-up would charge; the multiplication is prorated here for exactly that reason, and the calculator's \"PLI Minimum Fee Applies\" / \"PLI Maximum Fee Applies\" outputs are the clamp on that multiplied figure. Which column a job takes is declared, not derived: the Permitting page defines a Residential structure as a detached single-family dwelling or townhouse three stories or less under the IRC (or a detached two-family dwelling on the same terms) with its accessory structures, and the trade pages compress it to \"Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit.\" Set custom.structure_type to \"residential\"; without the flag the commercial row applies.",
});

export const PITT_BUILDING_BASE_COMMERCIAL: FeeRuleRecord = baseFeeRule({
  permitType: "BLD",
  structure: "COMMERCIAL",
  ratePerThousand: PITT_COMMERCIAL_RATE_PER_THOUSAND,
  minimumCents: PITT_COMMERCIAL_MINIMUM_CENTS,
  maximumCents: PITT_COMMERCIAL_MAXIMUM_CENTS,
  conditions: NOT_RESIDENTIAL_STRUCTURE,
  label: "Building permit — commercial, $7.00 per $1,000 of construction value",
  description:
    "S1: \"Base Permit Fee (Commercial) — $7.00 per $1,000 of Construction Value (Minimum: $605 – Maximum: $95,000)\", and the row this permit takes whenever custom.structure_type is absent or anything other than \"residential\". The Permitting page's \"Commercial – all other uses\" is everything the IRC definition is not: structures regulated by the International Building Code, attached single- and two-family dwellings and their accessories, detached ones over three stories, mixed-use buildings and non-residential uses — a three-storey apartment building is commercial while a three-storey townhouse is not, because the split is the building type rather than the occupancy. Prorated like the residential row (no \"or fraction thereof\" anywhere in the block), clamped on the multiplied figure. The $95,000 ceiling is the 2026 schedule's: the 2025 predecessor printed $80,000, and the two were diffed on 2026-09-25 to be sure which was in force.",
});

export const PITT_BUILDING_TECH_FEE: FeeRuleRecord = technologyFeeRule(
  "BLD",
  `${TECHNOLOGY_FEE_TEXT} On this page it reads the building base fee — residential or commercial, minimum or maximum — because those are this permit's only base components.`,
);

export const PITT_BUILDING_DIGITAL_RETENTION: FeeRuleRecord = digitalRetentionRule("BLD");

export const PITT_BUILDING_SETF: FeeRuleRecord = setfRule("BLD");

/* -------------------------------------------------------------------------- */
/* Electrical permits — same formula, plus the required-TPA discount           */
/* -------------------------------------------------------------------------- */

export const PITT_ELECTRICAL_BASE_RESIDENTIAL: FeeRuleRecord = baseFeeRule({
  permitType: "ELEC",
  structure: "RESIDENTIAL",
  ratePerThousand: PITT_RESIDENTIAL_RATE_PER_THOUSAND,
  minimumCents: PITT_RESIDENTIAL_MINIMUM_CENTS,
  maximumCents: PITT_RESIDENTIAL_MAXIMUM_CENTS,
  conditions: RESIDENTIAL_STRUCTURE,
  label: "Electrical permit — residential, $6.00 per $1,000 of construction value",
  description:
    "Electrical permits have no schedule of their own: S1's block heads \"ALL CONSTRUCTION PERMIT TYPES\", and the electrical permit page states the column split in one sentence — \"Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit.\" So the row is the building page's residential row verbatim: $6.00 per $1,000 of construction value, minimum $130, maximum $8,000, prorated rather than rounded to whole thousands. No TPA discount here: PLI's third-party-inspection list covers commercial electrical permits and pre-2021 residential ones, not current residential work.",
});

export const PITT_ELECTRICAL_BASE_COMMERCIAL: FeeRuleRecord = baseFeeRule({
  permitType: "ELEC",
  structure: "COMMERCIAL",
  ratePerThousand: PITT_COMMERCIAL_TPA_RATE_PER_THOUSAND,
  minimumCents: PITT_COMMERCIAL_TPA_MINIMUM_CENTS,
  maximumCents: PITT_COMMERCIAL_TPA_MAXIMUM_CENTS,
  conditions: NOT_RESIDENTIAL_STRUCTURE,
  label: "Electrical permit — commercial, $5.95 per $1,000 after the required TPA discount",
  description:
    "S1's commercial row ($7.00 per $1,000, minimum $605, maximum $95,000) with the schedule's own \"Third Party Agency Discount — 15% of Base Fee on applicable permit types\" applied, because \"applicable\" is resolvable and this row is one of the cases: PLI's Third Party Agencies page lists \"TPA Inspection of commercial electrical permits\" among the services PLI *requires*, and says \"A TPA discount per PLI's Current Fee Schedule is applicable to permits that require TPA services.\" The City's calculator applies it unconditionally to commercial electrical permits — `tpa_discount = adj_base_fee_calc * .15`, subtracted from the total. The engine has no negative component, so the discount is folded into the row's own rate instead: $7.00 × 0.85 = $5.95 per $1,000, minimum $605 × 0.85 = $514.25, maximum $95,000 × 0.85 = $80,750 — algebraically the City's clamp-then-discount for every input, since scaling and clamping commute for a positive scale. The calculator's flat reconnect row ($150, no discount, printed nowhere on the schedule) is a different work scope and is not this row.",
  sourceId: PITT_TPA_SOURCE_KEY,
});

export const PITT_ELECTRICAL_TECH_FEE: FeeRuleRecord = technologyFeeRule(
  "ELEC",
  `${TECHNOLOGY_FEE_TEXT} On this page there is one known nuance, recorded rather than smoothed over: the City's calculator brackets on the base fee *before* the TPA discount, while this page's commercial base row already carries the discount, so a pre-discount base fee in ($200, $235.29], ($1,000, $1,176.47] or ($10,000, $11,764.71] is charged one band lower here than the calculator shows — a difference of $3 to $10, and a needs_review record against this rule in the seed.`,
);

export const PITT_ELECTRICAL_DIGITAL_RETENTION: FeeRuleRecord = digitalRetentionRule("ELEC");

export const PITT_ELECTRICAL_SETF: FeeRuleRecord = setfRule("ELEC");

/* -------------------------------------------------------------------------- */
/* Mechanical permits — the same two rows, no TPA discount                     */
/* -------------------------------------------------------------------------- */

export const PITT_MECHANICAL_BASE_RESIDENTIAL: FeeRuleRecord = baseFeeRule({
  permitType: "MECH",
  structure: "RESIDENTIAL",
  ratePerThousand: PITT_RESIDENTIAL_RATE_PER_THOUSAND,
  minimumCents: PITT_RESIDENTIAL_MINIMUM_CENTS,
  maximumCents: PITT_RESIDENTIAL_MAXIMUM_CENTS,
  conditions: RESIDENTIAL_STRUCTURE,
  label: "Mechanical permit — residential, $6.00 per $1,000 of construction value",
  description:
    "Mechanical and fuel-gas work takes the same block every construction permit type takes: S1's \"Base Permit Fee (Residential) — $6.00 per $1,000 of Construction Value (Minimum: $130 – Maximum: $8,000)\", with the mechanical permit page printing the identical column rule as the electrical page — \"Work on single and two-family homes and structures accessory to them requires a Residential permit, while all other work requires a Commercial permit.\" Prorated, clamped, and undiscounted: mechanical permits are not on PLI's third-party-inspection list, so the schedule's 15% TPA discount never reaches this page.",
});

export const PITT_MECHANICAL_BASE_COMMERCIAL: FeeRuleRecord = baseFeeRule({
  permitType: "MECH",
  structure: "COMMERCIAL",
  ratePerThousand: PITT_COMMERCIAL_RATE_PER_THOUSAND,
  minimumCents: PITT_COMMERCIAL_MINIMUM_CENTS,
  maximumCents: PITT_COMMERCIAL_MAXIMUM_CENTS,
  conditions: NOT_RESIDENTIAL_STRUCTURE,
  label: "Mechanical permit — commercial, $7.00 per $1,000 of construction value",
  description:
    "S1: \"Base Permit Fee (Commercial) — $7.00 per $1,000 of Construction Value (Minimum: $605 – Maximum: $95,000)\" — the same undiscounted commercial row the building permit takes, because the TPA discount reaches electrical and stormwater permits only. The mechanical permit page's \"Commercial\" is the Permitting page's \"all other uses\", and commercial new-construction mechanical work \"requires the submission of stamped drawings\" — a submission requirement that changes no figure on this page. Prorated, clamped, $95,000 ceiling per the 2026 schedule.",
});

export const PITT_MECHANICAL_TECH_FEE: FeeRuleRecord = technologyFeeRule(
  "MECH",
  `${TECHNOLOGY_FEE_TEXT} On this page it reads the mechanical base fee — residential or commercial — because those are this permit's only base components.`,
);

export const PITT_MECHANICAL_DIGITAL_RETENTION: FeeRuleRecord = digitalRetentionRule("MECH");

export const PITT_MECHANICAL_SETF: FeeRuleRecord = setfRule("MECH");

/* -------------------------------------------------------------------------- */
/* The three permit pages                                                     */
/* -------------------------------------------------------------------------- */

export const PITT_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  PITT_BUILDING_BASE_RESIDENTIAL,
  PITT_BUILDING_BASE_COMMERCIAL,
  PITT_BUILDING_TECH_FEE,
  PITT_BUILDING_DIGITAL_RETENTION,
  PITT_BUILDING_SETF,
];

export const PITT_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  PITT_ELECTRICAL_BASE_RESIDENTIAL,
  PITT_ELECTRICAL_BASE_COMMERCIAL,
  PITT_ELECTRICAL_TECH_FEE,
  PITT_ELECTRICAL_DIGITAL_RETENTION,
  PITT_ELECTRICAL_SETF,
];

export const PITT_MECHANICAL_BASE_RULES: FeeRuleRecord[] = [
  PITT_MECHANICAL_BASE_RESIDENTIAL,
  PITT_MECHANICAL_BASE_COMMERCIAL,
  PITT_MECHANICAL_TECH_FEE,
  PITT_MECHANICAL_DIGITAL_RETENTION,
  PITT_MECHANICAL_SETF,
];
