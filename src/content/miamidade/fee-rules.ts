import { formatCents } from "@/lib/format";

import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Miami-Dade County, Florida — **one implementing order, four trades, three surcharges.**
 *
 * The sources are two documents that price the same work:
 *
 *  S1  **Implementing Order No. 4-63**, "Fee Schedule for Regulatory and Economic Resources
 *      Department (Building and Neighborhood Compliance)", *Ordered June 16, 2026, Effective
 *      June 26, 2026*, superseding the order of June 26, 2025. Thirty pages of fees with a
 *      table of contents; sha256 beginning 7f23cd971ade46be. It is an implementing order
 *      rather than an ordinance, which is why it can be re-ordered inside a year.
 *  S2  The County's own **trade fee sheets** — "Electrical Fee Sheet" (form 123_01-57/26) and
 *      "Plumbing and Gas Fee Sheet" (form 123_01-708/26) — the forms an applicant fills in,
 *      which print the same rates **with a fee code per row** (`G034`, `P001`, `P051`). Every
 *      trade rule here quotes its code, and the two documents agree on every rate they share.
 *  S3  Florida Statutes: § 553.721 (the 1% Building Construction Standards surcharge) and
 *      § 468.631 (the 1.5% Building Code Administrators and Inspectors surcharge), both quoted
 *      verbatim in A.20 and A.21 of S1.
 *
 * **Three surcharges, and one of them is the County's own.**
 *
 *   - **A.15 RER surcharge: 7.5%** "on all Building Permitting fees listed in Section I except
 *     for Enforcement fees listed in Sub-section K". It funds the department's own permitting
 *     cost, so it is charged *besides* the state's two.
 *   - **A.20: 1%** and **A.21: 1.5%**, both "of the permit fees associated with enforcement of
 *     the Florida Building Code", each with a **$2.00 minimum per permit**.
 *
 * The order's own fee sheet settles a question the schedule leaves open. The electrical and
 * plumbing fee sheets state "Minimum fee for electrical permits is **$227.90**", and $227.90 is
 * exactly `($147.00 + $65.00) x 1.075` — the section's $147.00 minimum, the A.8 non-refundable
 * up-front fee, and the 7.5% surcharge **on both** of them. That is why the 7.5% rule here reads
 * `fee_subtotal` (everything charged so far) rather than `permit_fee`: the County's own form
 * prices its floor on the wider base, and the $227.90 is asserted in the tests.
 *
 * **What is deliberately not modelled, and named on the pages instead:** the per-lineal-foot rows
 * (building sewer line, water and gas mains, sanitary and storm collectors, repairs to water
 * piping — all priced per 50 feet, and the engine has no length basis), gas outlets and
 * appliances (priced per outlet and per appliance, which are counts no other rule in this
 * dataset uses), the per-zone irrigation row, the pool-piping rows, the per-KW and per-ton
 * mechanical rows, the master-model and owner-builder programmes, and the hourly plan-review,
 * overtime-inspection and concierge rates.
 *
 * **One conflict between the two documents is recorded rather than resolved.** The order prices a
 * commercial pool or spa at $225.41 and a commercial *combination* pool/spa at $305.92 (D.19);
 * the fee sheet prices "New pool or spa (commercial)" at $305.92 (`G059`). Neither row is
 * modelled, and the disagreement is stated on the electrical page and in
 * `research/florida/miami-dade-county.md`.
 */

/** "Ordered: June 16, 2026 Effective: June 26, 2026". */
export const MD_FEE_EFFECTIVE_FROM = "2026-06-26";

export const MD_BUILDING_SOURCE_KEY = "miami-dade-implementing-order-4-63-2026";
export const MD_ELECTRICAL_SHEET_SOURCE_KEY = "miami-dade-electrical-fee-sheet-2026";
export const MD_PLUMBING_SHEET_SOURCE_KEY = "miami-dade-plumbing-gas-fee-sheet-2026";

/** A.15: "A Building Permitting surcharge of seven and one half (7.5%) percent on all Building Permitting fees listed in Section I". */
export const MD_RER_SURCHARGE_BPS = 750;
/** A.20 / § 553.721: "assessed at the rate of 1 percent of the permit fees … minimum amount collected on any permit issued shall be $2". */
export const MD_STATE_SURCHARGE_553_BPS = 100;
/** A.21 / § 468.631: "at the rate of 1.5 percent of all permit fees … minimum … shall be $2". */
export const MD_STATE_SURCHARGE_468_BPS = 150;
/** Both state surcharges carry the same floor. */
export const MD_STATE_SURCHARGE_MINIMUM_CENTS = 200;
/** A.8: "A non-refundable up-front fee … for applications accepted through CPBC for Unincorporated Municipal Service Area jurisdiction applications". */
export const MD_CPBC_UPFRONT_FEE_CENTS = 6_500;
/** B.2: "The minimum fee for all residential dwelling building permits … applicable to all items in this section … $147.00". */
export const MD_BUILDING_MINIMUM_CENTS = 14_700;
/** C.1 / D.1: the same $147.00 as a floor on the whole trade permit — see the module note. */
export const MD_TRADE_MINIMUM_CENTS = 14_700;

/** Where a building row other than the general area-based rows is being priced. */
const ITEM = "custom.schedule_item";
/** Detached single family and duplex, or a townhome: Miami-Dade prices the two differently. */
const DWELLING = "custom.dwelling_type";
/** Which electrical row of the fee sheet applies. */
const ELECTRICAL = "custom.electrical_item";
/** Which plumbing row of the fee sheet applies. */
const PLUMBING = "custom.plumbing_item";
/** The service size, in amperes. Read by the `amperage` basis and by every band condition. */
const AMPS = "custom.amperage";

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
    effectiveFrom: MD_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permit fees — Section I.B                                          */
/* -------------------------------------------------------------------------- */

/**
 * "B. BUILDING PERMIT FEES … Fees listed in Sub-section (B) include only building permit fees
 * and do not include fees for plumbing, electrical, and mechanical fees."
 *
 * Miami-Dade prices a building permit by **area**, not by valuation — the opposite of almost
 * every other jurisdiction in this dataset, and the reason the two Florida counties are
 * published together. The general rows are the area-based ones; every other row in the section
 * is a named item, gated on `custom.schedule_item`, so two of them can never be charged for one
 * job.
 *
 * The $147.00 minimum is applied to every rule here because of the section's own sentence:
 * "The minimum fee for all residential dwelling building permits (single family, duplex) is
 * applicable to all items in this section, except as otherwise specified. 147.00" — and "the
 * minimum fee for all other uses 147.00". Read item by item, a $88.55 slab permit is $147.00,
 * and a permit that combines two items pays the minimum once per item. The second half of that
 * reading is the one to know about, and it is stated on the page and asserted in the tests.
 */
export function buildingRules(sourceId: string): FeeRuleRecord[] {
  const minimum = MD_BUILDING_MINIMUM_CENTS;

  const general = (
    overrides: Pick<FeeRuleRecord, "id" | "code" | "label" | "feeType" | "config"> &
      Partial<FeeRuleRecord>,
  ) =>
    rule(sourceId, {
      minimumCents: minimum,
      conditions: { field: ITEM, op: "absent" },
      ...overrides,
    });

  return [
    general({
      id: "md-build-sfd-new",
      code: "BUILD-SFD-NEW",
      label: "One and two family dwelling, new construction or addition",
      description:
        '"New Construction of Detached Single Family and Duplex (per square feet): 0.96" and "Single Family and Duplex - Additions (per square foot): 0.96". Charged on the square footage of the structure, with the section\'s $147.00 minimum.',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 96, denominator: 1 },
        rateUnit: "currency_per_unit",
      },
      conditions: {
        all: [
          { field: ITEM, op: "absent" },
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
          { field: "work_type", op: "in", value: ["new_construction", "addition"] },
          { field: DWELLING, op: "neq", value: "townhome" },
        ],
      },
    }),

    general({
      id: "md-build-townhome-new",
      code: "BUILD-TOWNHOME-NEW",
      label: "Multi-unit single family townhomes, new construction",
      description:
        '"New Construction of Multi-unit Single Family Townhomes: 0.40" per square foot — less than half the detached-house rate, which is the row that makes the schedule\'s area basis worth reading twice.',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 40, denominator: 1 },
        rateUnit: "currency_per_unit",
      },
      conditions: {
        all: [
          { field: ITEM, op: "absent" },
          { field: DWELLING, op: "eq", value: "townhome" },
        ],
      },
    }),

    general({
      id: "md-build-sfd-alteration",
      code: "BUILD-SFD-ALTERATION",
      label: "One and two family dwelling, alterations or repairs",
      description:
        '"Alterations or repairs to Single Family Residence or Duplex (per total square footage of the structure): 0.500 — Maximum Fee 847.95". The maximum is the schedule\'s own cap on the row: it is reached at 1,695.9 square feet, so a 2,500-square-foot house pays $847.95 rather than $1,250.00.',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 50, denominator: 1 },
        rateUnit: "currency_per_unit",
      },
      maximumCents: 84_795,
      conditions: {
        all: [
          { field: ITEM, op: "absent" },
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
          { field: "work_type", op: "in", value: ["alteration", "repair", "remodel"] },
        ],
      },
    }),

    general({
      id: "md-build-other-new",
      code: "BUILD-OTHER-NEW",
      label: "All other occupancy groups, new construction and additions",
      description:
        '"New Construction of All Other Occupancies: for the first 100,000 square feet (per square foot) 0.40; for each additional square foot over 100,000 square feet (per square foot) 0.15", with the schedule\'s own note that "(Total permit fee is achieved by adding each separate tier fee)" — the clearest statement of a marginal tier table in this dataset.',
      feeType: "tiered_marginal",
      config: {
        basis: "square_footage",
        tiers: [
          { upToCents: 100_000, rateCentsPerUnit: 40 },
          { upToCents: null, rateCentsPerUnit: 15 },
        ],
      },
      conditions: {
        all: [
          { field: ITEM, op: "absent" },
          { field: "occupancy", op: "in", value: ["commercial", "industrial", "mixed", "other"] },
          { field: "work_type", op: "in", value: ["new_construction", "addition"] },
        ],
      },
    }),

    general({
      id: "md-build-other-alteration",
      code: "BUILD-OTHER-ALTERATION",
      label: "Alterations and repairs to buildings other than one and two family dwellings",
      description:
        '"5. ALTERATIONS AND REPAIRS TO BUILDINGS AND OTHER STRUCTURES [except Single Family Residence and Duplex] — Per total Square Foot: for the first 100,000 square feet (per sq. foot) 0.400; for each additional square foot over 100,000 square feet (per square foot) 0.150. Minimum Fee 254.40" — the schedule\'s "except as otherwise specified", which is why this row carries $254.40 rather than the section\'s $147.00.',
      feeType: "tiered_marginal",
      config: {
        basis: "square_footage",
        tiers: [
          { upToCents: 100_000, rateCentsPerUnit: 40 },
          { upToCents: null, rateCentsPerUnit: 15 },
        ],
      },
      minimumCents: 25_440,
      conditions: {
        all: [
          { field: ITEM, op: "absent" },
          { field: "occupancy", op: "in", value: ["commercial", "industrial", "mixed", "other"] },
          { field: "work_type", op: "in", value: ["alteration", "repair", "remodel", "replacement"] },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-build-roofing-shingle",
      code: "BUILD-ROOFING-SHINGLE",
      label: "Roofing, shingle and other roof types",
      description:
        '"8. ROOFING (INCLUDING RE-ROOFING) a. Roofing shingle and other roof types not listed: per square foot of roof coverage including overhangs 0.11". The row names itself as the residual category — "and other roof types not listed" — so a re-roof whose covering has not been named is priced here rather than dropped, which is the `absent` arm of its condition. The tile row below it is the one row that takes precedence when the covering *is* named.',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 11, denominator: 1 },
        rateUnit: "currency_per_unit",
      },
      minimumCents: minimum,
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "roofing" },
          {
            any: [
              { field: "custom.roof_covering", op: "absent" },
              { field: "custom.roof_covering", op: "neq", value: "tile" },
            ],
          },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-build-roofing-tile",
      code: "BUILD-ROOFING-TILE",
      label: "Roofing, clay and concrete tile",
      description:
        '"b. Roofing tile: per square foot of roof coverage including overhangs 0.140" — a different rate for the same measurement, so the rule is gated on the covering rather than on the work.',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 14, denominator: 1 },
        rateUnit: "currency_per_unit",
      },
      minimumCents: minimum,
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "roofing" },
          { field: "custom.roof_covering", op: "eq", value: "tile" },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-build-pool-new",
      code: "BUILD-POOL-NEW",
      label: "Swimming pool or spa, installation",
      description:
        '"10. SWIMMING POOLS, SPAS, AND HOT TUBS a. Installation of Swimming Pool/Spa (Residential) 640.00 / (Commercial) 1,280.00" — a flat fee by occupancy, not by size.',
      feeType: "flat",
      config: { amountCents: 64_000 },
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "pool_new" },
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-build-pool-new-commercial",
      code: "BUILD-POOL-NEW-COMMERCIAL",
      label: "Swimming pool or spa, installation, commercial",
      description: '"Installation of Swimming Pool/Spa (Commercial) 1,280.00".',
      feeType: "flat",
      config: { amountCents: 128_000 },
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "pool_new" },
          { field: "occupancy", op: "in", value: ["commercial", "industrial", "mixed", "other"] },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-build-pool-repair",
      code: "BUILD-POOL-REPAIR",
      label: "Swimming pool or spa, repair",
      description:
        '"b. Repair of Swimming Pool/Spa (Residential) 169.00 / (Commercial) 370.00" — priced as residential because that is the common case, with the commercial figure on the page.',
      feeType: "flat",
      config: { amountCents: 16_900 },
      conditions: { field: ITEM, op: "eq", value: "pool_repair" },
    }),

    rule(sourceId, {
      id: "md-build-demolition",
      code: "BUILD-DEMOLITION",
      label: "Demolition of a building or structure",
      description:
        '"12. DEMOLITION OF BUILDINGS — For each structure 340.00". Per structure, so a site with three buildings pays three of them.',
      feeType: "flat",
      config: { amountCents: 34_000 },
      conditions: { field: ITEM, op: "eq", value: "demolition" },
    }),

    rule(sourceId, {
      id: "md-build-moving",
      code: "BUILD-MOVING",
      label: "Moving a building or other structure",
      description:
        '"6. MOVING BUILDINGS OR OTHER STRUCTURES — For each 100 square feet or fractional part thereof (does not include cost of new foundation or repairs to building or structure) 11.28". Charged on the area of the building being moved, rounded up to whole hundreds of square feet.',
      feeType: "per_thousand",
      config: {
        basis: "square_footage",
        centsPerThousand: 11_280,
        incrementCents: 100,
      },
      minimumCents: minimum,
      conditions: { field: ITEM, op: "eq", value: "moving" },
    }),

    rule(sourceId, {
      id: "md-build-slab",
      code: "BUILD-SLAB",
      label: "Unreinforced slab on grade",
      description: '"7. SLABS (Unreinforced slabs on grade) Residential 88.55 / Commercial 88.55".',
      feeType: "flat",
      config: { amountCents: 8_855 },
      minimumCents: minimum,
      conditions: { field: ITEM, op: "eq", value: "slab" },
    }),

    rule(sourceId, {
      id: "md-build-windows-residential",
      code: "BUILD-WINDOWS-RESIDENTIAL",
      label: "Window and exterior door installation or replacement, residential",
      description:
        '"14. INSTALLATION/REPLACEMENT OF WINDOWS OR DOORS — Residential (single family residence only, not an exact change out of existing) 147.00" — flat for a house, where the commercial row is priced by the area installed.',
      feeType: "flat",
      config: { amountCents: 14_700 },
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "windows_doors" },
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-build-windows-commercial",
      code: "BUILD-WINDOWS-COMMERCIAL",
      label: "Window, storefront and curtain wall area, commercial",
      description:
        '"Commercial (per square foot of window or door area) 0.160" — $0.16 for each square foot of glass and door, which is why a commercial glazing job is priced from the same input the house is not.',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 16, denominator: 1 },
        rateUnit: "currency_per_unit",
      },
      minimumCents: minimum,
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "windows_doors" },
          { field: "occupancy", op: "in", value: ["commercial", "industrial", "mixed", "other"] },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-build-screen-enclosure",
      code: "BUILD-SCREEN-ENCLOSURE",
      label: "Screen enclosure",
      description:
        '"15. SCREEN ENCLOSURES, CANOPIES & AWNINGS a) Screen enclosures, per 100 square feet 11.13" — charged per 100 square feet or fraction thereof.',
      feeType: "per_thousand",
      config: {
        basis: "square_footage",
        centsPerThousand: 11_130,
        incrementCents: 100,
      },
      minimumCents: minimum,
      conditions: { field: ITEM, op: "eq", value: "screen_enclosure" },
    }),

    rule(sourceId, {
      id: "md-build-sign",
      code: "BUILD-SIGN",
      label: "Non-illuminated sign",
      description:
        '"17. SIGN PERMIT FEES — Signs non-illuminated (per square foot) (illuminated signs under electrical permits) 1.61".',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 161, denominator: 1 },
        rateUnit: "currency_per_unit",
      },
      minimumCents: minimum,
      conditions: { field: ITEM, op: "eq", value: "sign" },
    }),

    rule(sourceId, {
      id: "md-build-shed",
      code: "BUILD-SHED",
      label: "Prefabricated utility shed with slab over 100 square feet",
      description:
        '"Prefabricated utility sheds with slab (Over 100 square feet of floor area) (per unit) 147.00" — one of the few rows in the section that is already the section\'s minimum.',
      feeType: "flat",
      config: { amountCents: 14_700 },
      conditions: { field: ITEM, op: "eq", value: "prefab_shed" },
    }),

    rule(sourceId, {
      id: "md-build-temporary-platform",
      code: "BUILD-TEMPORARY-PLATFORM",
      label: "Temporary platform or bleachers for public assembly",
      description:
        '"11. TEMPORARY PLATFORMS AND TEMPORARY BLEACHERS TO BE USED FOR PUBLIC ASSEMBLY — For each 100 square feet or fractional part of platform area 6.68".',
      feeType: "per_thousand",
      config: {
        basis: "square_footage",
        centsPerThousand: 6_680,
        incrementCents: 100,
      },
      minimumCents: minimum,
      conditions: { field: ITEM, op: "eq", value: "temporary_platform" },
    }),

    rule(sourceId, {
      id: "md-build-tie-down",
      code: "BUILD-TIE-DOWN",
      label: "Trailer tie down",
      description:
        '"16. TIE DOWN — Trailer Tie Down: 95.00 (This does not include installation of meter mounts and service equipment. Separate mechanical, plumbing, and related electrical permits are required.)"',
      feeType: "flat",
      config: { amountCents: 9_500 },
      minimumCents: minimum,
      conditions: { field: ITEM, op: "eq", value: "tie_down" },
    }),

    rule(sourceId, {
      id: "md-build-short-term-event",
      code: "BUILD-SHORT-TERM-EVENT",
      label: "Short term event",
      description: '"19. Short Term Event 216.75".',
      feeType: "flat",
      config: { amountCents: 21_675 },
      minimumCents: minimum,
      conditions: { field: ITEM, op: "eq", value: "short_term_event" },
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* Electrical permit fees — Section I.D and the Electrical Fee Sheet           */
/* -------------------------------------------------------------------------- */

/**
 * Miami-Dade's electrical permit is priced **per item on one application**: a service, its
 * feeders, the outlets, the fixtures, the air conditioning, and so on, each at its own rate.
 * The fee code in each description is the County's own (`G034` for a permanent service), which
 * is how a reader can check the row on the form the applicant actually submits.
 */
export function electricalRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "md-elec-service",
      code: "ELEC-SERVICE-100A",
      label: "Permanent service to a building, per 100 amperes",
      description:
        'Fee sheet `G034` "Permanent service to building — $7.26 per 100 Amps", and Section I.D.2: "PERMANENT SERVICE TO BUILDINGS — New work only — (The following fee shall be charged for total amperage of service) — For each 100 amp. or fractional part 7.26". The same rate prices a repair or upgrade of an existing service (`G067`) and a safety check for re-energizing one (`G079`), which is why those items are alternatives here rather than three charges.',
      feeType: "per_thousand",
      config: {
        basis: "amperage",
        centsPerThousand: 7_260,
        incrementCents: 100,
      },
      conditions: {
        all: [
          { field: ELECTRICAL,
            op: "in",
            value: ["permanent_service", "service_repair_or_upgrade", "safety_check_reenergize"],
          },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-elec-feeder",
      code: "ELEC-FEEDER",
      label: "Electrical feeder",
      description:
        'Fee sheet `G033` "Electrical feeders (new or replacement of a single or a three phase set conductors) — $19.33 per Feeder", and Section I.D.3: "FEEDERS — Includes feeders to panels, M.C.C., switchboards, generators, automatic transfer switches, etc. Each feeder 19.33".',
      feeType: "per_unit",
      config: { unit: "circuits", centsPerUnit: 1_933 },
      // Gated on the count rather than on the selector, because a permit carries as many
      // of the sheet's lines as the job has: a 200-ampere service with sixty outlets and a
      // panel is three rows on one application, and `custom.circuits` is the only fact in
      // the catalogue that no other electrical row reads.
      conditions:      { field: AMPS, op: "gt", value: 0 },
    }),

    rule(sourceId, {
      id: "md-elec-outlet",
      code: "ELEC-OUTLET",
      label: "General wiring outlet or box",
      description:
        'Fee sheet `G005` "General wiring outlet box (including outlet boxes in an empty conduit run) — $2.59 per Outlet".',
      feeType: "per_unit",
      config: { unit: "outlets", centsPerUnit: 259 },
      conditions: { field: ELECTRICAL, op: "eq", value: "outlet" },
    }),

    rule(sourceId, {
      id: "md-elec-special-outlet",
      code: "ELEC-SPECIAL-OUTLET",
      label: "Special outlet or permanently connected appliance",
      description:
        'Fee sheet `G082` "Special outlets (any outlet feeding a fix appliance or equipment 30 amp or greater) — $11.28 per Outlet" — four times the general outlet row, on a count of its own, which is why it is a separate item and not another outlet.',
      feeType: "per_unit",
      config: { unit: "outlets", centsPerUnit: 1_128 },
      conditions: { field: ELECTRICAL, op: "eq", value: "special_outlet" },
    }),

    rule(sourceId, {
      id: "md-elec-residential-wiring",
      code: "ELEC-RESIDENTIAL-WIRING",
      label: "Residential wiring, per square foot of floor area",
      description:
        'Section I.D.9: "RESIDENTIAL WIRING (New construction of Single Family Residence, Duplex and living units of Group H (SFBC) or R-1 (FBC) …) — For new construction, additions, alterations or repairs for each square foot of floor area 0.113". The electrical fee sheet prints the same row as `G080` at "0.11x per Sq ft"; the implementing order\'s three-decimal rate is what is charged here.',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 113, denominator: 10 },
        rateUnit: "currency_per_unit",
      },
      conditions: { field: ELECTRICAL, op: "eq", value: "residential_wiring" },
    }),

    rule(sourceId, {
      id: "md-elec-air-conditioning",
      code: "ELEC-AIR-CONDITIONING",
      label: "Air conditioning or refrigeration system, per ton",
      description:
        'Fee sheet `G008` "Air-condition units, refrigeration units, or cooler system/structure — $9.66 per Ton" and Section I.D.10(e): "Air conditioning and refrigeration system (new work). Applies to commercial, residential, agricultural, and industrial… Per ton 9.66".',
      feeType: "per_unit",
      config: { unit: "tons", centsPerUnit: 966 },
      // The fee sheet prices air conditioning on the electrical form as well as the
      // mechanical one — `G008`, "$9.66 per Ton" — so this row answers to the tonnage
      // whatever else the permit carries.
      conditions: { field: "custom.tons", op: "gt", value: 0 },
    }),

    rule(sourceId, {
      id: "md-elec-lighting-fixture",
      code: "ELEC-LIGHTING-FIXTURE",
      label: "Lighting fixture",
      description:
        'Fee sheet `G009` "Fixture/luminers — $2.59 per Fixture" and Section I.D.11(a): "Floodlights, spotlights, parking lights, tennis court lights, fluorescent and incandescent fixtures, etc. Per fixture 2.59".',
      feeType: "per_unit",
      config: { unit: "lighting_fixtures", centsPerUnit: 259 },
      conditions: { field: "custom.lighting_fixtures", op: "gt", value: 0 },
    }),

    rule(sourceId, {
      id: "md-elec-panel-board",
      code: "ELEC-PANEL-BOARD",
      label: "Panel board, switchboard or control panel",
      description:
        'Fee sheet `G045` "Electrical: panel board, switchboard, control panel (fire alarm panel, access control panel), motor board controller, scada system — $32.21 per Board".',
      feeType: "per_unit",
      config: { unit: "panels", centsPerUnit: 3_221 },
      conditions: { field: "custom.panels", op: "gt", value: 0 },
    }),

    rule(sourceId, {
      id: "md-elec-fire-alarm",
      code: "ELEC-FIRE-ALARM",
      label: "Fire alarm system, new or upgrade, per floor",
      description:
        'Fee sheet `G087` "New systems and upgrades — $201.26 per Floor", Category 04 "FIRE ALARM AND ACCESS CONTROL (needs processing)". Section I.D.14 prices the same work per system at the same figure.',
      feeType: "per_unit",
      config: { unit: "stories", centsPerUnit: 20_126 },
      conditions: { field: "custom.stories", op: "gt", value: 0 },
    }),

    rule(sourceId, {
      id: "md-elec-temporary-construction",
      code: "ELEC-TEMPORARY-CONSTRUCTION",
      label: "Temporary service for construction",
      description:
        'Fee sheet `G002` "Temp for construction — $147.00 per Service", Category 14 "(must list master bldg. permit #) (must have separate application)"; Section I.D.5 prices the same row at $147.00.',
      feeType: "flat",
      config: { amountCents: 14_700 },
      conditions: { field: ELECTRICAL, op: "eq", value: "temporary_service" },
    }),

    rule(sourceId, {
      id: "md-elec-solar-roof",
      code: "ELEC-SOLAR-PV-ROOF",
      label: "Solar photovoltaic system, roof mounted",
      description:
        'Fee sheet `G127` "Roof mounted — $365.63 per System", Category 34 "SOLAR PHOTOVOLTAIC (must be processed if no building permit)".',
      feeType: "flat",
      config: { amountCents: 36_563 },
      conditions: {
        all: [
          { field: ELECTRICAL, op: "eq", value: "solar_pv" },
          { field: "custom.solar_mount", op: "neq", value: "ground" },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-elec-solar-ground",
      code: "ELEC-SOLAR-PV-GROUND",
      label: "Solar photovoltaic system, ground mounted",
      description:
        'Fee sheet `G126` "Ground mounted — $325.00 per System". The same category also prices a County-prescribed system at $250.00 (`G137`), which is quoted on the page rather than modelled.',
      feeType: "flat",
      config: { amountCents: 32_500 },
      conditions: {
        all: [
          { field: ELECTRICAL, op: "eq", value: "solar_pv" },
          { field: "custom.solar_mount", op: "eq", value: "ground" },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-elec-pool-residential",
      code: "ELEC-POOL-RESIDENTIAL",
      label: "Swimming pool or spa, residential electrical",
      description:
        'Fee sheet `G026` "Pool or spa (residential) — $144.91 per Pool or Spa", Category 23 "(must be tied to building permit except for repairs of electrical only)"; Section I.D.19(a) prices the same row at $144.91.',
      feeType: "flat",
      config: { amountCents: 14_491 },
      conditions: { field: ELECTRICAL, op: "eq", value: "pool" },
    }),

    rule(sourceId, {
      id: "md-elec-burglar-alarm",
      code: "ELEC-BURGLAR-ALARM",
      label: "Burglar security system",
      description:
        'Fee sheet `G130` "Burglar security system — $40.00 per System", Category 02, where "(single family residences, townhouses and duplexes are exempt from permit requirements including any wireless alarm systems) (must be on separate application)".',
      feeType: "flat",
      config: { amountCents: 4_000 },
      conditions: { field: ELECTRICAL, op: "eq", value: "burglar_alarm" },
    }),

    rule(sourceId, {
      id: "md-elec-demolition",
      code: "ELEC-DEMOLITION",
      label: "Electrical demolition",
      description:
        'Fee sheet `G122` "Demolition — $64.61 per Structure/Equipment", and Section I.D.1 notes that the electrical minimum "does not apply to add-on electrical permits issued as supplementary to current outstanding permits for the same job and demolition work".',
      feeType: "flat",
      config: { amountCents: 6_461 },
      conditions: { field: ELECTRICAL, op: "eq", value: "demolition" },
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* Plumbing permit fees — Section I.C and the Plumbing and Gas Fee Sheet       */
/* -------------------------------------------------------------------------- */

/**
 * A new one- or two-family dwelling is priced from its **area** ($0.143 per square foot), and
 * every other plumbing permit from its **items**: $9.66 for each roughing-in or plugged outlet
 * and each fixture, $48.31 for a sewer connection, $12.88 for a water service connection.
 *
 * The rows the engine has no count for are stated on the page rather than approximated — see the
 * module note: gas outlets and appliances, irrigation zones, linear feet, and the pool-piping
 * rows.
 */
export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "md-plumb-residential",
      code: "PLUMB-SFD",
      label: "New, addition, alteration or repair, one and two family dwelling",
      description:
        'Section I.C.2: "RESIDENTIAL PLUMBING (Single Family Residence or Duplex) — New, Single Family Residence or Duplex, Addition, Alterations or repairs to Single Family Residence or Duplex per square foot 0.143", with the note that three existing fees "are being grouped into one fee adjusted by the CPI". The plumbing fee sheet prints the same row as `P051`/`P052` at "0.14x per Sq ft".',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 143, denominator: 10 },
        rateUnit: "currency_per_unit",
      },
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: RESIDENTIAL },
          {
            field: "work_type",
            op: "in",
            value: ["new_construction", "addition", "alteration", "repair", "remodel"],
          },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-plumb-rough-and-fixture",
      code: "PLUMB-ROUGH-AND-FIXTURE",
      label: "Roughing-in, plugged outlet or fixture",
      description:
        'Section I.C.3 lists the fixtures it counts — "bathtubs, closets, doctors, dentists, hospital sterilizers, autoclaves, autopsy tables and other fixtures, appurtenances, drinking fountains, fixtures discharging into traps or safe waste pipes, floor drains, laundry tubs, lavatories, showers, sinks, urinals, and heaters" — at "For each roughing-in or plugged outlet 9.66" and "Each fixture 9.66". Fee sheet `P001` and `P032` price the same two rows at $9.66 per outlet and per fixture.',
      feeType: "per_unit",
      config: { unit: "fixtures", centsPerUnit: 966 },
      // A count, not a row selector: the sheet prices roughing in at $9.66 per outlet
      // (`P001`) and setting a fixture at $9.66 per fixture (`P032`), the same figure twice,
      // and a permit carries as many of them as the job has.
      conditions: { field: "fixtures", op: "gt", value: 0 },
    }),

    rule(sourceId, {
      id: "md-plumb-sewer-connection",
      code: "PLUMB-SEWER-CONNECTION",
      label: "Sewer connection",
      description:
        'Section I.C.5: "SEWER (ALL GROUPS) — Each building storm sewer and each building sewer where connection is made to a septic tank, or a collector line or to an existing sewer or to a city sewer or soakage pit or to a building drain outside a building. 48.31". Fee sheet `P003` "Sewer connection to public system" and `P044` "Sewer connection to private system" are both $48.31 per sewer.',
      feeType: "per_unit",
      config: { unit: "connections", centsPerUnit: 4_831 },
      // `P003` and `P044` are the same $48.31 for a connection to a public or a private
      // system, so the count is the row and there is nothing for a selector to decide.
      conditions: { field: "custom.connections", op: "gt", value: 0 },
    }),

    rule(sourceId, {
      id: "md-plumb-water-service",
      code: "PLUMB-WATER-SERVICE",
      label: "Water service connection, for each meter on each lot",
      description:
        'Section I.C.7: "Water service connection to a municipal or private water supply system (for each meter on each lot) 12.88"; fee sheet `P010` "Water service connection or repair — $12.88 per Meter".',
      feeType: "per_unit",
      config: { unit: "meters", centsPerUnit: 1_288 },
      // A selector rather than a count, and deliberately: the gas section of the same
      // fee sheet has its own meter row (`P020`, "$6.45 per Meter") which this site does not
      // model, and both would read the same `meters` fact. Naming the row removes the
      // ambiguity in favour of the one this page prices.
      conditions: { field: PLUMBING, op: "eq", value: "water_service" },
    }),

    rule(sourceId, {
      id: "md-plumb-backflow-small",
      code: "PLUMB-BACKFLOW-SMALL",
      label: 'Water service backflow assembly, 2" or less',
      description:
        'Section I.C.7: "2\\" or less water service backflow assembly 56.36"; fee sheet `P033` prices it per assembly.',
      feeType: "per_unit",
      config: { unit: "backflow_devices", centsPerUnit: 5_636 },
      conditions: {
        all: [
          { field: PLUMBING, op: "eq", value: "backflow_assembly" },
          { field: "custom.backflow_size", op: "neq", value: "two_and_a_half_inch_or_larger" },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-plumb-backflow-large",
      code: "PLUMB-BACKFLOW-LARGE",
      label: 'Water service backflow assembly, 2 1/2" or larger',
      description:
        'Section I.C.7: "2 1/2\\" or larger water service backflow assembly 88.55"; fee sheet `P034`. Twice the small size and the same measurement, so the rule is gated on the pipe size.',
      feeType: "per_unit",
      config: { unit: "backflow_devices", centsPerUnit: 8_855 },
      conditions: {
        all: [
          { field: PLUMBING, op: "eq", value: "backflow_assembly" },
          { field: "custom.backflow_size", op: "eq", value: "two_and_a_half_inch_or_larger" },
        ],
      },
    }),

    rule(sourceId, {
      id: "md-plumb-solar-water-heater",
      code: "PLUMB-SOLAR-WATER-HEATER",
      label: "Solar water heater",
      description:
        'Section I.C.7: "Solar water heater installation, equipment replacement or repair 144.91"; fee sheet `P081`/`P082` price roof and ground mounted installations at the same $144.91.',
      feeType: "flat",
      config: { amountCents: 14_491 },
      conditions: { field: PLUMBING, op: "eq", value: "solar_water_heater" },
    }),

    rule(sourceId, {
      id: "md-plumb-water-treatment",
      code: "PLUMB-WATER-TREATMENT-PLANT",
      label: "Water treatment plant, interior plant piping",
      description:
        'Section I.C.10: "Water treatment plant (interior plant piping) 338.11". Fee sheet `P024` prices it per plant, Category 15 "SITE UTILITIES (must have building permit, if not, send for processing)".',
      feeType: "flat",
      config: { amountCents: 33_811 },
      conditions: { field: PLUMBING, op: "eq", value: "water_treatment_plant" },
    }),

    rule(sourceId, {
      id: "md-plumb-sewage-treatment-plant",
      code: "PLUMB-SEWAGE-TREATMENT-PLANT",
      label: "Sewage treatment plant, interior plant piping",
      description: 'Section I.C.10: "Sewage treatment plant (interior plant piping) 241.52".',
      feeType: "flat",
      config: { amountCents: 24_152 },
      conditions: { field: PLUMBING, op: "eq", value: "sewage_treatment_plant" },
    }),

    rule(sourceId, {
      id: "md-plumb-lift-station",
      code: "PLUMB-LIFT-STATION",
      label: "Lift station, interior station piping",
      description:
        'Section I.C.10: "Lift station (interior station piping) 386.42"; fee sheet `P026` is the same figure per station.',
      feeType: "flat",
      config: { amountCents: 38_642 },
      conditions: { field: PLUMBING, op: "eq", value: "lift_station" },
    }),

    rule(sourceId, {
      id: "md-plumb-grease-trap",
      code: "PLUMB-GREASE-TRAP",
      label: "Settling tank, grease trap or interceptor",
      description:
        'Section I.C.4: "SETTLING TANKS, GAS AND OIL INTERCEPTORS, AND GREASE TRAPS (Including drain tile and relay for same) 50.73" — $50.73 whichever of the three it is, for residential and commercial alike.',
      feeType: "flat",
      config: { amountCents: 5_073 },
      conditions: { field: PLUMBING, op: "eq", value: "grease_trap_or_interceptor" },
    }),

    rule(sourceId, {
      id: "md-plumb-temporary-toilet",
      code: "PLUMB-TEMPORARY-TOILET",
      label: "Temporary toilet, first one",
      description:
        'Section I.C.13: "TEMPORARY TOILETS — WATERBORNE OR CHEMICAL — Temporary Toilets 147.00; For each additional toilet 13.29"; fee sheet `P031`/`P036` price the same two rows.',
      feeType: "flat",
      config: { amountCents: 14_700 },
      conditions: { field: PLUMBING, op: "eq", value: "temporary_toilet" },
    }),

    rule(sourceId, {
      id: "md-plumb-mobile-home",
      code: "PLUMB-MOBILE-HOME-CONNECTION",
      label: "Mobile home connection",
      description:
        'Section I.C.15: "MOBILE HOME CONNECTIONS — Each unit 96.62"; fee sheet `P039` "Trailer or mfg. home connections — $96.62 per Connection".',
      feeType: "flat",
      config: { amountCents: 9_662 },
      conditions: { field: PLUMBING, op: "eq", value: "mobile_home" },
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* The charges that sit on top of every permit                                 */
/* -------------------------------------------------------------------------- */

/**
 * Four rules, and the only ones attached to all three permit types.
 *
 * The County's own fee sheet is what pins the order of the first two: its stated electrical and
 * plumbing minimum of **$227.90** is `($147.00 + $65.00) x 1.075`, so the 7.5% is charged on the
 * up-front fee as well as on the permit fee — which is why it reads `fee_subtotal` here and not
 * `permit_fee`. The two state surcharges read the permit fee itself, because that is what the
 * statutes quoted in A.20 and A.21 say they are assessed on; the alternative reading and its
 * cost are stated on the pages.
 */
export function feeCharges(permitType: "building" | "electrical" | "plumbing"): FeeRuleRecord[] {
  const prefix = permitType === "building" ? "BLD" : permitType === "electrical" ? "ELEC" : "PLB";

  return [
    rule(MD_BUILDING_SOURCE_KEY, {
      id: `md-${permitType}-cpbc-upfront`,
      code: `${prefix}-CPBC-UPFRONT`,
      label: "Non-refundable up-front permit support fee",
      description:
        '"A.8 UP-FRONT FEE FOR PERMIT SUPPORT FUNCTIONS PERFORMED BY CONSTRUCTION, PERMITTING, AND BUILDING CODE (CPBC) — A non-refundable up-front fee will be assessed for permit support functions, including acceptance of applications, distribution of plans, document storage, and technology support for applications accepted through CPBC for Unincorporated Municipal Service Area jurisdiction applications. 65.00" — with a second row at $70.00 for municipal applications, which is not this jurisdiction\'s. The schedule places it in Section I, so the County\'s 7.5% surcharge reaches it; the fee sheet\'s $227.90 minimum is the proof.',
      feeType: "flat",
      config: { amountCents: MD_CPBC_UPFRONT_FEE_CENTS },
      componentType: "other",
      priority: 200,
    }),

    rule(MD_BUILDING_SOURCE_KEY, {
      id: `md-${permitType}-rer-surcharge`,
      code: `${prefix}-RER-SURCHARGE`,
      label: "Miami-Dade RER building permitting surcharge, 7.5%",
      description:
        '"A.15 RER SURCHARGE — A Building Permitting surcharge of seven and one half (7.5%) percent on all Building Permitting fees listed in Section I except for Enforcement fees listed in Sub-section K. This surcharge is to be used to fund incremental direct costs and reasonable indirect costs associated with the Building Permitting activity that are directly related to enforcing the Florida Building Code." It is the County\'s own charge, on top of the two the state imposes.',
      feeType: "percent",
      config: { basis: "fee_subtotal", rateBps: MD_RER_SURCHARGE_BPS },
      componentType: "surcharge",
      priority: 700,
    }),

    rule(MD_BUILDING_SOURCE_KEY, {
      id: `md-${permitType}-state-surcharge-553`,
      code: `${prefix}-STATE-SURCHARGE-1PCT`,
      label: "Florida Building Construction Standards surcharge, 1%",
      description:
        '"A.20 STATE MANDATED SURCHARGE — Building Construction Standards: \\"…there is created a surcharge assessed at the rate of 1 percent of the permit fees associated with enforcement of the Florida Building Code … The minimum amount collected on any permit issued shall be $2…\\" (§ 553.72, Florida Statutes.) Surcharge rates may be subject to change as set by State Statute."',
      feeType: "percent",
      config: { basis: "permit_fee", rateBps: MD_STATE_SURCHARGE_553_BPS },
      minimumCents: MD_STATE_SURCHARGE_MINIMUM_CENTS,
      componentType: "state_surcharge",
      priority: 900,
    }),

    rule(MD_BUILDING_SOURCE_KEY, {
      id: `md-${permitType}-state-surcharge-468`,
      code: `${prefix}-STATE-SURCHARGE-1_5PCT`,
      label: "Florida Building Code Administrators and Inspectors surcharge, 1.5%",
      description:
        '"A.21 STATE MANDATED SURCHARGE — Building Code Administrators and Inspectors: \\"(1) This part shall be funded through a surcharge … at the rate of 1.5 percent of all permit fees associated with enforcement of the Florida Building Code … The minimum amount collected on any permit issued shall be $2…\\" (§ 468.631, Florida Statutes.)" Both state surcharges are collected by the County and remitted to the state quarterly, with 10% retained for building department training.',
      feeType: "percent",
      config: { basis: "permit_fee", rateBps: MD_STATE_SURCHARGE_468_BPS },
      minimumCents: MD_STATE_SURCHARGE_MINIMUM_CENTS,
      componentType: "state_surcharge",
      priority: 910,
    }),
  ];
}

export const MD_BUILDING_RULES: FeeRuleRecord[] = [
  ...buildingRules(MD_BUILDING_SOURCE_KEY),
  ...feeCharges("building"),
];

/**
 * The fee sheet's floor, stated once for the permit rather than once for each row.
 *
 * Both trade sheets print it at the top of the form in their own words: "Minimum fee for
 * electrical permits is $227.90" and "Minimum fee for plumbing permits is $227.90". That
 * figure is `($147.00 + $65.00) x 1.075` — the section's $147.00 minimum, the A.8
 * non-refundable up-front fee, and the 7.5% RER surcharge on both of them — which fixes
 * three things about this rule: the floor is **$147.00**; it is measured on the **fee
 * items alone**, before the up-front fee; and it is charged **once per permit** rather
 * than once per row, which is the difference between a floor and a minimum on a rule.
 *
 * **Why not the building section's approach.** B.2 says its $147.00 minimum is
 * "applicable to all items in this section", so a rule-level `minimumCents` is right
 * there — every item is charged at least the floor. These two sheets say the opposite,
 * and the difference is visible on a real application: a permit carrying a 200-ampere
 * service, sixty outlets, a panel board, forty fixtures and five tons of air conditioning
 * is five rows totalling $222.78, and a rule-level floor would charge $227.90 five times.
 * Hence `feeType: "permit_minimum"`, which charges the shortfall up to the floor and
 * nothing once the permit has cleared it.
 *
 * The condition and the amount are two halves of one statement and both are needed: the
 * condition means the rule never contributes a zero line to a permit that is already above
 * the floor, and the amount is what a permit below it is charged.
 */
function tradeMinimumRule(permitType: "building" | "electrical" | "plumbing"): FeeRuleRecord {
  const prefix = permitType === "building" ? "BLD" : permitType === "electrical" ? "ELEC" : "PLB";

  return rule(MD_BUILDING_SOURCE_KEY, {
    id: `md-${permitType}-trade-minimum`,
    code: `${prefix}-TRADE-MINIMUM`,
    label: "Minimum fee for the trade permit",
    description:
      'The fee sheet\'s own sentence, printed at the top of the form: "Minimum fee for electrical permits is $227.90" and, on the plumbing and gas sheet, "Minimum fee for plumbing permits is $227.90". That number is the County\'s own arithmetic rather than a round figure — $147.00 of fee items, the $65.00 up-front fee the same section charges, and 7.5% of both — so the floor this rule applies is $147.00 on the fee items, and the up-front fee and the surcharge follow it exactly as the sheet computes them. Charged once per permit, as the shortfall: a permit whose rows already exceed $147.00 pays nothing here.',
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: MD_TRADE_MINIMUM_CENTS },
    conditions: { field: "permit_fee", op: "lt", value: MD_TRADE_MINIMUM_CENTS },
    componentType: "base",
    priority: 150,
  });
}

export const MD_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...electricalRules(MD_ELECTRICAL_SHEET_SOURCE_KEY),
  tradeMinimumRule("electrical"),
  ...feeCharges("electrical"),
];

export const MD_PLUMBING_RULES: FeeRuleRecord[] = [
  ...plumbingRules(MD_PLUMBING_SHEET_SOURCE_KEY),
  tradeMinimumRule("plumbing"),
  ...feeCharges("plumbing"),
];

/**
 * The valuation note, for the pages.
 *
 * Miami-Dade is the Florida county that **does not** price a building permit from a valuation:
 * its building fees are chargeable per square foot of area, per structure, or per named item,
 * and the notes in its implementing order that mention valuation are the *statutory* ones about
 * surcharges and about the Florida Power Plant Siting Act. The county that does is Orange
 * County, which publishes the average cost per square foot table used to derive a valuation.
 */
export const MD_PRICING_METHOD_NOTE =
  "Miami-Dade prices a building permit by area, not by valuation: the square footage of the structure or the named item on the application. The implementing order contains no building valuation table, and its only references to valuation are the statutory surcharges and the Power Plant Siting Act rule about equipment used in electrical power generation.";
