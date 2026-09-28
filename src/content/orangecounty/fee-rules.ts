import type { ConditionLeaf, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Orange County, Florida — **a valuation table the county publishes the inputs for.**
 *
 * The source is the County's own **Fee Directory**, fiscal year 2025-2026, prepared by its
 * Office of Management and Budget and published in the Open Government section of
 * `orangecountyfl.net`, whose Building Safety pages link it as the fee schedule:
 * `https://www.orangecountyfl.net/Portals/0/resource library/Open Government/FeeDirectory.pdf`,
 * sha256 beginning 8eb4eaaec6770373. Its Building Safety section runs from page 26 to page 45,
 * and every page of it is footed "Effective July 2025".
 *
 * **The mechanism is the other Florida county's opposite.** Miami-Dade charges a building
 * permit by area; Orange County charges it by **total valuation**, in marginal bands: "Up to and
 * including $1,000 — $26.00; for each additional $1,000 or fraction thereof, to $2,000,000 —
 * $3.00; for each additional $1,000 or fraction thereof, above $2,000,000 — $1.00" for a one and
 * two family dwelling, and the same shape with $4.00 and $1.00 for commercial new construction.
 *
 * **And it publishes the number the valuation comes from.** Above the bands, the directory prints:
 * "The following minimum schedule of valuations shall be applied to the structure(s) for which a
 * permit is filed. However, should the contract valuation be greater it shall be used… The
 * applicable valuation(s) shall be multiplied by the square footage of the structure(s) for the
 * purpose of charging the inspection fee in accordance with the fee schedule." What follows is a
 * full ICC occupancy-by-construction-type table of **average cost per square foot** — 189.00 for
 * an IA theatre with a stage, 158.00 for a IA business, 124.00 for an IA one-and-two-family
 * dwelling, down to 37.00 for a VB utility building — plus the notes that decide a valuation:
 * "Unfinished basements (all use groups) = $15.00 per sq.ft.", "For shell only buildings deduct
 * 20%", "Private Detached Garages use 'Utility, miscellaneous'". `OC_AVERAGE_COST_PER_SQ_FT`
 * carries the subset this site quotes, and the worked example walks from square footage to a fee
 * using nothing but the County's own figures.
 *
 * **Two counties, one statute, two different answers.** Orange County states the state's two
 * surcharges as one row: "A surcharge will be assessed at the rate of **2.5%** of each permit
 * (building, electrical, mechanical, plumbing, roof, and gas) fee associated with the enforcement
 * of the Florida Building Code as per Florida Statutes section 468.631 and 553.721. The minimum
 * amount collected in accordance with the Florida Statutes mentioned above on any permit issued
 * shall be **$4.00**." Miami-Dade states the same two statutes as two separate rows, each with its
 * own $2.00 minimum. The two are not equivalent below a $200 permit fee: at the section's own
 * $147.00 minimum, Orange County charges $4.00 and Miami-Dade charges $2.00 + $2.21 = $4.21, and
 * that 21 cents is asserted in the tests of both jurisdictions.
 *
 * **Where the review rows live is worth knowing.** The $34.00, $32.00 and $12.00 residential plans
 * review rows are printed in the **Zoning Division** section of the same directory (page 57), not
 * in the Building Safety section; the commercial architectural review with the $10,000 ceiling is
 * in the Building Safety section (page 44); and the County's own FAQ says a new construction
 * permit "can involve review and/or inspection fees by 10 or more different divisions". Three
 * divisions' charges on one project, all in one document, which is what makes this jurisdiction a
 * useful counterweight to the ones where a single schedule is the whole cost.
 *
 * **Not modelled, and named on the pages instead:** the **demolition** row, priced per 25,000 cubic
 * feet with a $25 minimum and a $400 maximum, which needs a volume basis the engine does not have;
 * the **sign** schedule, priced by area from $38.00 up to $69.00 with $11.00 per additional 100
 * square feet; the **mechanical** schedule, whose air-conditioning rows are priced per ton and
 * whose refrigeration rows chain on valuation; the **Plan Submittal Fee** (page 41, $32.00 below
 * $10,000 of valuation to $849.00 above $1,000,000, plus $22.00 per additional $100,000, and "N/C"
 * for a one and two family dwelling) and the re-submittal table beside it, both of which are
 * conditional on a workflow rather than on a project; the **private provider** reduction, which
 * takes the fee to 55% or 10% of the total under F.S. 553.791 but never below the minimum; the
 * **work without a permit** penalty of double the permit fee or $103.00, whichever is greater; the
 * **special after-hours inspection** at a four-hour $212.00 minimum and $51.00 an hour after; the
 * alterations-with-a-service-change rule, whose basis is the *difference* between two amperages;
 * the over-480-volt row, whose rule is "a proportional increase over the cost for 480V" measured
 * by the transformer's available voltage; and the Zoning, Fire Rescue, Planning and Engineering
 * charges on the same project that are other divisions' fees.
 */

/** Every page of the Building Safety section is footed "Effective July 2025". */
export const OC_FEE_EFFECTIVE_FROM = "2025-07-01";

export const OC_BUILDING_SOURCE_KEY = "orange-county-fee-directory-2025";
export const OC_FEE_DIRECTORY_SOURCE_KEY = "orange-county-fee-directory-2025-full";

/** "A surcharge will be assessed at the rate of 2.5% of each permit … minimum … shall be $4.00." */
export const OC_STATE_SURCHARGE_BPS = 250;
export const OC_STATE_SURCHARGE_MINIMUM_CENTS = 400;

/** The flat fees that make up most of the trade schedules. */
export const OC_MINIMUM_TRADE_FEE_CENTS = 3_800;

/** "PHONE: (407) 836-5550", printed at the head of the Building Safety section, page 26. */
export const OC_MAIN_PHONE = "(407) 836-5550";

const ITEM = "custom.schedule_item";
const ELECTRICAL = "custom.electrical_item";
const PLUMBING = "custom.plumbing_item";
const AMPS = "custom.amperage";
const SERVICE = "custom.electrical_service";

const NON_RESIDENTIAL = ["commercial", "industrial", "mixed", "other"] as const;

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
    effectiveFrom: OC_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/**
 * One valuation band of the building schedule: a base for the first $1,000 and a rate for each
 * additional $1,000 or fraction thereof.
 *
 * `$26.00 up to and including $1,000, then $3.00 per additional $1,000 or fraction thereof` is
 * `baseCents: 2_600` on a `per_thousand` rule whose threshold is $1,000 (`100_000` cents) and
 * whose increment is a whole $1,000, which is the same primitive every valuation schedule in
 * this dataset uses. The upper tier is a second rule, because the directory changes the rate at
 * $2,000,000 rather than the increment: $3.00 per $1,000 becomes $1.00.
 */
type ValuationBand = {
  id: string;
  code: string;
  label: string;
  description: string;
  baseCents: number;
  rateCentsPerThousand: number;
  upperCents: number | null;
  /** The rate charged above `upperCents`, for the band that continues past $2,000,000. */
  aboveRateCentsPerThousand?: number;
  /** The tests that select this band, before the valuation ceiling is added. */
  gates: ConditionLeaf[];
};

export function buildingRules(sourceId: string): FeeRuleRecord[] {
  const bands: ValuationBand[] = [
    {
      id: "oc-build-1-2-family",
      code: "BUILD-1-2-FAMILY",
      label: "One and two family dwelling, by total valuation",
      description:
        '"One and Two Family Dwelling Fees — Residential: up to and including $1,000 $26.00; for each additional $1,000 or fraction thereof, to $2,000,000 $3.00; for each additional $1,000 or fraction thereof, above $2,000,000 $1.00". Charged on the total valuation, which the County derives from the average cost per square foot table below the bands when the applicant does not state one.',
      baseCents: 2_600,
      rateCentsPerThousand: 300,
      upperCents: 200_000_000,
      aboveRateCentsPerThousand: 100,
      gates: [{ field: ITEM, op: "absent" }, { field: "occupancy", op: "eq", value: "residential" }],
    },
    {
      id: "oc-build-accessory",
      code: "BUILD-ACCESSORY",
      label: "Accessory structure or use to a one and two family dwelling",
      description:
        '"Accessory Structures and Uses to One and Two Family Dwelling -- Up to and including $1,000 26.00; For each additional $1,000 or fraction thereof 4.00" — a higher rate than the house it stands beside, and no ceiling.',
      baseCents: 2_600,
      rateCentsPerThousand: 400,
      upperCents: null,
      gates: [{ field: ITEM, op: "eq", value: "accessory_structure" }],
    },
    {
      id: "oc-build-commercial-new",
      code: "BUILD-COMMERCIAL-NEW",
      label: "Commercial or multifamily, new construction",
      description:
        '"Commercial/Multifamily Permits — New Construction: up to and including $1,000 $26.00; for each additional $1,000 or fraction thereof, to $2,000,000 $4.00; for each additional $1,000 or fraction thereof, above $2,000,000 $1.00", the row carrying the document\'s own double-asterisk footnote about the Florida Power Plant Siting Act, which values mechanical equipment used in electrical power generation at 25% of its cost — quoted on the page rather than modelled.',
      baseCents: 2_600,
      rateCentsPerThousand: 400,
      upperCents: 200_000_000,
      aboveRateCentsPerThousand: 100,
      gates: [
        { field: ITEM, op: "absent" },
        { field: "occupancy", op: "in", value: [...NON_RESIDENTIAL] },
        { field: "work_type", op: "in", value: ["new_construction", "addition"] },
      ],
    },
    {
      id: "oc-build-commercial-other",
      code: "BUILD-COMMERCIAL-OTHER",
      label: "Commercial or multifamily, other than new construction",
      description:
        '"Other than new construction -- Up to and including $1,000 26.00; For each additional $1,000 or fraction thereof 5.00" — the same measurement at a higher rate, which is why the rule is gated on the kind of work rather than on the occupancy alone.',
      baseCents: 2_600,
      rateCentsPerThousand: 500,
      upperCents: null,
      gates: [
        { field: ITEM, op: "absent" },
        { field: "occupancy", op: "in", value: [...NON_RESIDENTIAL] },
        { field: "work_type", op: "in", value: ["alteration", "repair", "remodel", "replacement"] },
      ],
    },
  ];

  const bandRules = bands.flatMap((band) => {
    const first = rule(sourceId, {
      id: band.id,
      code: band.code,
      label: band.label,
      description: band.description,
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: band.baseCents,
        thresholdCents: 100_000,
        incrementCents: 100_000,
        centsPerThousand: band.rateCentsPerThousand,
      },
      conditions: {
        all: [
          ...band.gates,
          ...(band.upperCents === null
            ? []
            : [{ field: "valuation" as const, op: "lte" as const, value: band.upperCents }]),
        ],
      },
    });

    if (band.upperCents === null || band.aboveRateCentsPerThousand === undefined) return [first];

    // The top tier opens with everything the tiers below it produced at their own ceiling, which
    // is the directory's own arithmetic: $26.00 + 1,999 x $3.00 = $6,023.00 for a house.
    const additionalThousands = (band.upperCents - 100_000) / 100_000;
    const openingCents = band.baseCents + band.rateCentsPerThousand * additionalThousands;

    return [
      first,
      rule(sourceId, {
        id: `${band.id}-above-2m`,
        code: `${band.code}-ABOVE-2M`,
        label: `${band.label}, above $2,000,000`,
        description: `"For each additional $1,000 or fraction thereof, above $2,000,000 $${(band.aboveRateCentsPerThousand / 100).toFixed(2)}" — the tier the band above opens at $${(openingCents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, which is $${(band.baseCents / 100).toFixed(2)} plus 1,999 more thousands at $${(band.rateCentsPerThousand / 100).toFixed(2)}.`,
        feeType: "per_thousand",
        config: {
          basis: "valuation",
          baseCents: openingCents,
          thresholdCents: band.upperCents,
          incrementCents: 100_000,
          centsPerThousand: band.aboveRateCentsPerThousand,
        },
        conditions: {
          all: [...band.gates, { field: "valuation", op: "gt", value: band.upperCents }],
        },
      }),
    ];
  });

  return [
    ...bandRules,

    rule(sourceId, {
      id: "oc-build-res-re-roof",
      code: "BUILD-RES-RE-ROOF",
      label: "Re-roof, one and two family dwelling",
      description:
        '"Residential Fees — Re-roof: up to and including $1,000 $26.00; for each additional $1,000 or fraction thereof $5.00". The higher rate is the point: a re-roof is priced above the general residential rate because of the inspection load.',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 2_600,
        thresholdCents: 100_000,
        incrementCents: 100_000,
        centsPerThousand: 500,
      },
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "re_roof" },
          { field: "occupancy", op: "eq", value: "residential" },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-build-roof-new-dwelling",
      code: "BUILD-ROOF-NEW-DWELLING",
      label: "Roof permit on a new dwelling",
      description:
        '"Roof permit on new dwelling only 38.00" — and the exception printed beside the commercial roof permit: "On new construction, where a licensed general contractor has an active building permit, a separate, no fee roofing permit is required. The name and license number of the roofing contractor shall be supplied on the permit application."',
      feeType: "flat",
      config: { amountCents: 3_800 },
      conditions: { field: ITEM, op: "eq", value: "roof_new_dwelling" },
    }),

    rule(sourceId, {
      id: "oc-build-comm-roof",
      code: "BUILD-COMM-ROOF",
      label: "Roof permit, commercial or multifamily",
      description:
        '"Roof Permit -- Up to and including $1,000 54.00; For each additional $1,000 or fraction thereof 5.00", with the same no-fee exception for a roof on new construction under an active general contractor permit.',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 5_400,
        thresholdCents: 100_000,
        incrementCents: 100_000,
        centsPerThousand: 500,
      },
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "re_roof" },
          { field: "occupancy", op: "in", value: [...NON_RESIDENTIAL] },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-build-comm-re-roof",
      code: "BUILD-COMM-RE-ROOF",
      label: "Commercial re-roof",
      description:
        '"Commercial Fees — Re-roof: up to and including $1,000 $26.00; for each additional $1,000 or fraction thereof $5.00", charged on the valuation of the roofing work alone.',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 2_600,
        thresholdCents: 100_000,
        incrementCents: 100_000,
        centsPerThousand: 500,
      },
      conditions: {
        all: [
          { field: ITEM, op: "eq", value: "re_roof" },
          { field: "occupancy", op: "in", value: [...NON_RESIDENTIAL] },
          { field: "work_type", op: "in", value: ["replacement", "repair"] },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-build-site-work",
      code: "BUILD-SITE-WORK",
      label: "Permit for site work only",
      description: '"Permits For Site Work Only 27.00" — flat, whatever the size of the site.',
      feeType: "flat",
      config: { amountCents: 2_700 },
      conditions: { field: ITEM, op: "eq", value: "site_work_only" },
    }),

    rule(sourceId, {
      id: "oc-build-commercial-plan-review",
      code: "PLAN-REVIEW-COMM-ARCHITECTURAL",
      label: "Commercial plans review, architectural standards and guidelines",
      description:
        '"ARCHITECTURAL STANDARDS AND GUIDELINES FOR COMMERCIAL BUILDINGS AND PROJECTS — New and redevelopment of C-1, C-2, C-3, and PO (Professional Office) buildings and Projects and commercial components of Planned Developments (PD\'s) up to and including $1000 of value $27.00; For each additional $1,000 or fraction thereof 3.00; **Note: Maximum fee of $10,000**". The only ceiling on this page, and the row that makes a valuation schedule behave like a different one: past $3,325,666.67 of valuation the review stops rising, whatever the project costs. It is scoped by **zoning classification** rather than by occupancy — C-1, C-2, C-3 and Professional Office — so the rule reads `custom.zoning_class`, and a commercial project that has not named one is left out of the total with a note, rather than charged a fee that may not apply to it.',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 2_700,
        thresholdCents: 100_000,
        incrementCents: 100_000,
        centsPerThousand: 300,
      },
      maximumCents: 1_000_000,
      componentType: "plan_review",
      priority: 300,
      conditions: {
        all: [
          { field: "occupancy", op: "in", value: [...NON_RESIDENTIAL] },
          { field: "custom.zoning_class", op: "in", value: ["C-1", "C-2", "C-3", "PO"] },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-plan-review-res-new",
      code: "PLAN-REVIEW-RES-NEW",
      label: "Residential plans review, new construction",
      description:
        '"Residential Plans Review - One and Two Family Dwelling — New Construction 34.00". The row is printed in the **Zoning Division** section of the same Fee Directory, page 57, not in the Building Safety section: the County splits one house\'s review across divisions, and this is the row it publishes for a one and two family dwelling.',
      feeType: "flat",
      config: { amountCents: 3_400 },
      componentType: "plan_review",
      priority: 300,
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: "residential" },
          { field: "work_type", op: "in", value: ["new_construction", "addition"] },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-plan-review-res-other",
      code: "PLAN-REVIEW-RES-OTHER",
      label: "Residential plans review, other than new construction",
      description:
        '"Residential Plans Review - One and Two Family Dwelling — Other than new construction 32.00", from the Zoning Division section. Two dollars below the new-construction row, which is the County\'s own statement that the review is nearly the same work either way.',
      feeType: "flat",
      config: { amountCents: 3_200 },
      componentType: "plan_review",
      priority: 300,
      conditions: {
        all: [
          { field: "occupancy", op: "eq", value: "residential" },
          { field: "work_type", op: "in", value: ["alteration", "repair", "remodel", "replacement"] },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-plan-review-res-accessory",
      code: "PLAN-REVIEW-RES-ACCESSORY",
      label: "Residential plans review, accessory structure",
      description:
        '"Accessory Structures 12.00", with the directory\'s own list of what that covers: "utility buildings, swimming pools, spas, pool decks and pool screen enclosures, boat docks/houses, concrete slabs installed after initial construction, air conditioners, and generators". Note that this row and the $26.00-plus-$4.00 accessory **permit** row in the Building Safety section are different charges on the same project, which is why they carry different descriptions here.',
      feeType: "flat",
      config: { amountCents: 1_200 },
      componentType: "plan_review",
      priority: 300,
      conditions: { field: ITEM, op: "eq", value: "accessory_structure" },
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* Electrical permit fees                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Orange County prices an electrical permit from the **size of the service**: a table per phase
 * and voltage, eight amperage bands each, with a rate above 1,000 amperes.
 *
 * Two structural notes.
 *
 *   - **The bands are alternatives, not a chain.** A 300-ampere service is $117.00 under the
 *     1-phase 240-volt table — not $75.00 plus something. Each band is gated on its own range, and
 *     a missing amperage matches nothing rather than falling into the first band.
 *   - **The row above 1,000 amperes is a rate**, "over 1,000 per ea. add'l. 1,000 amp or fraction",
 *     and it is modelled as one: a 1,500-ampere service is one additional thousand, and the page
 *     states both readings of whether the $308.00 band below it is also charged.
 */
export function electricalRules(sourceId: string): FeeRuleRecord[] {
  const services: Array<{
    id: string;
    code: string;
    label: string;
    value: string;
    bands: Array<[number, number | null, number]>;
    overRateCentsPerThousand: number;
  }> = [
    {
      id: "single-phase-240",
      code: "1PH-240V",
      label: "1 phase 240 volt",
      value: "single_phase_240",
      bands: [
        [0, 150, 7_500],
        [150, 200, 9_100],
        [200, 400, 11_700],
        [400, 600, 17_000],
        [600, 800, 25_500],
        [800, 1_000, 30_800],
      ],
      overRateCentsPerThousand: 17_000,
    },
    {
      id: "three-phase-208-240",
      code: "3PH-208-240V",
      label: "3 phase 208 or 240 volt",
      value: "three_phase_208_240",
      bands: [
        [0, 150, 11_700],
        [150, 200, 14_400],
        [200, 400, 18_100],
        [400, 600, 27_100],
        [600, 800, 37_200],
        [800, 1_000, 46_800],
      ],
      overRateCentsPerThousand: 28_100,
    },
    {
      id: "three-phase-480",
      code: "3PH-480V",
      label: "3 phase 480 volt",
      value: "three_phase_480",
      bands: [
        [0, 150, 25_000],
        [150, 200, 31_300],
        [200, 400, 39_900],
        [400, 600, 60_600],
        [600, 800, 79_600],
        [800, 1_000, 98_200],
      ],
      overRateCentsPerThousand: 58_400,
    },
  ];

  const serviceRules = services.flatMap((service) => [
    ...service.bands.map(([lower, upper, cents], index) => {
      const range = `${lower} to ${upper} amperes`;
      return rule(sourceId, {
        id: `oc-elec-${service.id}-${index + 1}`,
        code: `ELEC-${service.code}-${index + 1}`,
        label: `${service.label}, ${range}`,
        description: `"${service.label}: AMPERES — ${range}${lower === 0 ? " (0 to 150)" : ""}: $${(cents / 100).toFixed(2)}". From the electrical schedule's opening paragraph: "Electrical permit fees are based upon the total amperage of the service required to meet the needs of all fixtures, etc., installed. Service is determined by the KVA Load available to the premises".`,
        feeType: "flat",
        config: { amountCents: cents },
        conditions: {
          all: [
            { field: SERVICE, op: "eq", value: service.value },
            // `gt 0` on the band that opens at zero as well: a missing amperage must match nothing
            // rather than be charged the first band's $75.00.
            { field: AMPS, op: "gt", value: lower },
            ...(upper === null ? [] : [{ field: AMPS, op: "lte" as const, value: upper }]),
          ],
        },
      });
    }),

    rule(sourceId, {
      id: `oc-elec-${service.id}-over-1000`,
      code: `ELEC-${service.code}-OVER-1000`,
      label: `${service.label}, over 1,000 amperes`,
      description: `"Over 1,000 per ea. add'l. 1,000 amp or fraction: $${(service.overRateCentsPerThousand / 100).toFixed(2)}" — a rate, not a band, so a 1,500 ampere service is one additional thousand and a 2,000 ampere service is two. Whether the $${(service.bands[service.bands.length - 1]?.[2] ?? 0) / 100} of the 801-1,000 ampere band is charged as well is not stated, and both readings are priced on the page.`,
      feeType: "per_thousand",
      config: {
        basis: "amperage",
        thresholdCents: 1_000,
        incrementCents: 1_000,
        centsPerThousand: service.overRateCentsPerThousand,
      },
      conditions: {
        all: [
          { field: SERVICE, op: "eq", value: service.value },
          { field: AMPS, op: "gt", value: 1_000 },
        ],
      },
    }),
  ]);

  return [
    ...serviceRules,

    rule(sourceId, {
      id: "oc-elec-low-voltage",
      code: "ELEC-LOW-VOLTAGE",
      label: "Low voltage permit",
      description:
        '"5. LOW VOLTAGE PERMIT: up to and including $1,000 valuation 38.00; for each additional $1,000 or fraction thereof 5.00" — the same shape as the building schedule, on the contract value of the low-voltage work.',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 3_800,
        thresholdCents: 100_000,
        incrementCents: 100_000,
        centsPerThousand: 500,
      },
      conditions: { field: ELECTRICAL, op: "eq", value: "low_voltage" },
    }),

    rule(sourceId, {
      id: "oc-elec-alteration-valuation",
      code: "ELEC-ALTERATION-VALUATION",
      label: "Additions, alterations and repairs not requiring a service change",
      description:
        '"(C) Additions, Alterations and Repairs not Requiring a Change in Service, Minimum fee; up to and including $1,000 Valuation 38.00; for each additional $1,000 Valuation or fraction thereof (All valuations based on material and labor costs) 5.00". Subsection (B) — the same work *with* a service change — is priced on the difference between the new and the previous amperage, which this site states rather than models.',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 3_800,
        thresholdCents: 100_000,
        incrementCents: 100_000,
        centsPerThousand: 500,
      },
      conditions: { field: ELECTRICAL, op: "eq", value: "alteration_without_service_change" },
    }),

    rule(sourceId, {
      id: "oc-elec-temporary-construction",
      code: "ELEC-TEMP-CONSTRUCTION",
      label: "Temporary construction service, one and two family dwelling",
      description:
        '"Exception: Temporary construction service for 1 and 2 family dwelling construction sites shall be (Maximum 60 amps/240 volts/single phase) 27.00" — the cheapest row on the schedule, and the only one with a size limit printed in the rate table.',
      feeType: "flat",
      config: { amountCents: 2_700 },
      conditions: { field: ELECTRICAL, op: "eq", value: "temporary_construction" },
    }),

    rule(sourceId, {
      id: "oc-elec-equipment",
      code: "ELEC-EQUIPMENT-INSTALLATION",
      label: "Simple installation of one item of equipment",
      description:
        '"(D) Installation of Equipment: Simple Installation of one item of Equipment Regardless of Amperage 38.00" — the amperage is stated to be irrelevant, so this rule reads no measurement at all.',
      feeType: "flat",
      config: { amountCents: 3_800 },
      conditions: { field: ELECTRICAL, op: "eq", value: "single_equipment_item" },
    }),

    rule(sourceId, {
      id: "oc-elec-pool-wiring",
      code: "ELEC-POOL-WIRING",
      label: "Pool wiring",
      description: '"(H) Pool Wiring 59.00" — flat, and separate from the pool\'s building permit.',
      feeType: "flat",
      config: { amountCents: 5_900 },
      conditions: { field: ELECTRICAL, op: "eq", value: "pool_wiring" },
    }),

    rule(sourceId, {
      id: "oc-elec-tug",
      code: "ELEC-TUG-AGREEMENT",
      label: "T.U.G. agreement (temporary underground)",
      description: '"(I) T.U.G. Agreement (Temporary Under Ground) 106.00".',
      feeType: "flat",
      config: { amountCents: 10_600 },
      conditions: { field: ELECTRICAL, op: "eq", value: "tug_agreement" },
    }),

    rule(sourceId, {
      id: "oc-elec-tent",
      code: "ELEC-TENT",
      label: "Tent, temporary service included",
      description: '"(E) Tent (Temporary service Included) 59.00; for each additional tent 11.00".',
      feeType: "flat",
      config: { amountCents: 5_900 },
      conditions: { field: ELECTRICAL, op: "eq", value: "tent" },
    }),

    rule(sourceId, {
      id: "oc-elec-carnival",
      code: "ELEC-CARNIVAL",
      label: "Carnival safety inspection",
      description:
        '"(F) Carnival, Safety Inspection (If violation noted an electrical contractor will be required to permit at stated fee) 101.00".',
      feeType: "flat",
      config: { amountCents: 10_100 },
      conditions: { field: ELECTRICAL, op: "eq", value: "carnival" },
    }),

    rule(sourceId, {
      id: "oc-elec-meter-reset",
      code: "ELEC-METER-RESET",
      label: "Meter reset",
      description:
        '"(B) Meter Reset 38.00", from the Building Safety division\'s shared **Inspection Fees** section (page 40) rather than from the electrical schedule, which is why one row at one figure appears on this page and the plumbing page both.',
      feeType: "flat",
      config: { amountCents: 3_800 },
      conditions: { field: ELECTRICAL, op: "eq", value: "meter_reset" },
    }),

    rule(sourceId, {
      id: "oc-elec-reinspection",
      code: "ELEC-REINSPECTION",
      label: "Re-inspection",
      description:
        '"(A) Re-inspection Fees — Reinspection fees that remain unpaid longer than sixty days will be assessed a $11.00 collection fee per account in addition to the reinspection fee due) $38.00". The row sits in the division\'s shared **Inspection Fees** section (page 40), next to the meter reset and the special after-hours inspection, so the same $38.00 is what a building, electrical, plumbing or mechanical re-inspection costs. The after-hours row beside it is a four-hour minimum at $212.00 and $51.00 an hour after that, which this page names rather than models.',
      feeType: "per_unit",
      config: { unit: "inspections", centsPerUnit: 3_800 },
      componentType: "inspection",
      conditions: { field: ELECTRICAL, op: "eq", value: "reinspection" },
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* Plumbing and gas permit fees                                               */
/* -------------------------------------------------------------------------- */

/**
 * Orange County's plumbing schedule is the simplest in this dataset: **one permit fee and one
 * per-fixture charge**, and a list of stand-alone jobs that are each the same $38.00.
 *
 * "Permit Fee for New Construction, Addition or Alteration (Commercial or Residential, plus $6 per
 * fixture charge, unless specified otherwise) $75.00", then "Per Plumbing Fixture charge, (added,
 * plugged, moved or future opening) 6.00". A water heater, a solar water heater, a backflow
 * preventer, a water softener, a re-pipe, a spa with permanent connections and a sewer replacement
 * are each $38.00; a swimming pool is $64.00; and an irrigation system steps by how many heads it
 * has — $38.00 to 100, $54.00 to 200, $64.00 above that.
 *
 * **Gas is a valuation schedule of its own** — "(A) Equipment, Ventilation, Combustion Air, Piping,
 * Boilers and any other installation(s) which requires(s) a Gas Permit: valuation based on cost of
 * all equipment supplied by owner or contractor, materials and labor — up to and including the
 * first $1,000 $64.00; for each additional $1,000 or fraction thereof 6.00" — and it is modelled
 * here, attached to the plumbing permit, because the County issues it as its own permit and prices
 * it from a valuation rather than from outlets.
 */
export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  const standaloneItems = [
    "water_heater",
    "solar_water_heater",
    "backflow_preventer",
    "water_softener",
    "sewer_replacement",
    "re_pipe",
    "spa_with_permanent_connections",
    "mobile_home",
    "expired_replacement",
    "second_irrigation_meter",
  ];

  return [
    rule(sourceId, {
      id: "oc-plumb-permit",
      code: "PLUMB-PERMIT",
      label: "Plumbing permit, new construction, addition or alteration",
      description:
        '"Permit Fee for New Construction, Addition or Alteration (Commercial or Residential, plus $6 per fixture charge, unless specified otherwise) $75.00".',
      feeType: "flat",
      config: { amountCents: 7_500 },
      conditions: { field: PLUMBING, op: "in", value: ["new_construction", "addition", "alteration"] },
    }),

    rule(sourceId, {
      id: "oc-plumb-fixture",
      code: "PLUMB-FIXTURE",
      label: "Plumbing fixture, added, plugged, moved or future opening",
      description:
        '"Per Plumbing Fixture charge, (added, plugged, moved or future opening) 6.00" — charged on the same permit as the $75.00 above it, which is what the parenthetical in that row means.',
      feeType: "per_unit",
      config: { unit: "fixtures", centsPerUnit: 600 },
      conditions: {
        all: [
          { field: PLUMBING, op: "in", value: ["new_construction", "addition", "alteration"] },
          { field: "fixtures", op: "gt", value: 0 },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-plumb-standalone",
      code: "PLUMB-STANDALONE",
      label: "Stand-alone plumbing job",
      description:
        'Ten separate rows, each at $38.00: "Minimum Permit Fee, Replacement if expired under 6 months 38.00"; "Mobile Home Plumbing 38.00"; "Water Heater (Stand Alone) 38.00"; "Solar Water Heater (Stand Alone) 38.00"; "Backflow Preventer (Stand Alone) 38.00"; "Water Softener (Stand Alone) 38.00"; "Spa with Permanent Connections 38.00"; "Sewer Replacement 38.00"; "Re-pipe (Residential) 38.00"; "Re-pipe (Commercial, per unit) 38.00"; and "Second Meter for Irrigation 38.00". One rule, gated on which of them the job is, because charging two of them for one job is the only way this row can go wrong.',
      feeType: "flat",
      config: { amountCents: OC_MINIMUM_TRADE_FEE_CENTS },
      conditions: { field: PLUMBING, op: "in", value: standaloneItems },
    }),

    rule(sourceId, {
      id: "oc-plumb-pool",
      code: "PLUMB-POOL",
      label: "Swimming pool permit, plumbing",
      description: '"Swimming Pool Permit 64.00".',
      feeType: "flat",
      config: { amountCents: 6_400 },
      conditions: { field: PLUMBING, op: "eq", value: "swimming_pool" },
    }),

    rule(sourceId, {
      id: "oc-plumb-irrigation-1",
      code: "PLUMB-IRRIGATION-1-100",
      label: "Lawn irrigation system, 1 to 100 heads",
      description:
        '"Lawn Irrigation System: 1 - 100 Heads, Minimum Fee 38.00; 101 - 200 Heads 54.00; 201 and up 64.00". The three rows are alternatives, which is why they are bands rather than a rate per head: one head and 100 heads cost the same $38.00.',
      feeType: "flat",
      config: { amountCents: 3_800 },
      conditions: {
        all: [
          { field: PLUMBING, op: "eq", value: "irrigation_system" },
          { field: "custom.irrigation_heads", op: "lte", value: 100 },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-plumb-irrigation-2",
      code: "PLUMB-IRRIGATION-101-200",
      label: "Lawn irrigation system, 101 to 200 heads",
      description: '"Lawn Irrigation System: 101 - 200 Heads 54.00".',
      feeType: "flat",
      config: { amountCents: 5_400 },
      conditions: {
        all: [
          { field: PLUMBING, op: "eq", value: "irrigation_system" },
          { field: "custom.irrigation_heads", op: "gt", value: 100 },
          { field: "custom.irrigation_heads", op: "lte", value: 200 },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-plumb-irrigation-3",
      code: "PLUMB-IRRIGATION-201-PLUS",
      label: "Lawn irrigation system, 201 heads and up",
      description: '"Lawn Irrigation System: 201 and up 64.00".',
      feeType: "flat",
      config: { amountCents: 6_400 },
      conditions: {
        all: [
          { field: PLUMBING, op: "eq", value: "irrigation_system" },
          { field: "custom.irrigation_heads", op: "gt", value: 200 },
        ],
      },
    }),

    rule(sourceId, {
      id: "oc-gas-permit",
      code: "GAS-PERMIT",
      label: "Gas permit, by valuation",
      description:
        '"Gas Permit Fees — (A) Equipment, Ventilation, Combustion Air, Piping, Boilers and any other installation(s) which requires(s) a Gas Permit: valuation based on cost of all equipment supplied by owner or contractor, materials and labor — up to and including the first $1,000 $64.00; for each additional $1,000 or fraction thereof 6.00".',
      feeType: "per_thousand",
      config: {
        basis: "valuation",
        baseCents: 6_400,
        thresholdCents: 100_000,
        incrementCents: 100_000,
        centsPerThousand: 600,
      },
      conditions: { field: PLUMBING, op: "eq", value: "gas_piping_and_equipment" },
    }),

    rule(sourceId, {
      id: "oc-plumb-reinspection",
      code: "PLUMB-REINSPECTION",
      label: "Re-inspection",
      description:
        'The same $38.00 re-inspection the division charges across its trades, printed on the mechanical schedule\'s last row and in the shared **Inspection Fees** section (page 40). A plumbing permit can be charged more than one of them, which is why the rule is per inspection rather than flat.',
      feeType: "per_unit",
      config: { unit: "inspections", centsPerUnit: 3_800 },
      componentType: "inspection",
      conditions: { field: PLUMBING, op: "eq", value: "reinspection" },
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* The state's surcharge, stated as one row                                    */
/* -------------------------------------------------------------------------- */

/**
 * "NOTE: A surcharge will be assessed at the rate of 2.5% of each permit (building, electrical,
 * mechanical, plumbing, roof, and gas) fee associated with the enforcement of the Florida Building
 * Code as per Florida Statutes section 468.631 and 553.721. The minimum amount collected in
 * accordance with the Florida Statutes mentioned above on any permit issued shall be $4.00."
 *
 * Two statutes, one row, one floor — where Miami-Dade charges the same two statutes as two rows
 * with two $2.00 floors. See the module note for what that costs at the $147.00 minimum fee the
 * two counties share.
 */
export function stateSurchargeRules(permitType: "building" | "electrical" | "plumbing"): FeeRuleRecord[] {
  const prefix = permitType === "building" ? "BLD" : permitType === "electrical" ? "ELEC" : "PLB";

  return [
    rule(OC_BUILDING_SOURCE_KEY, {
      id: `oc-${permitType}-state-surcharge`,
      code: `${prefix}-STATE-SURCHARGE-2_5PCT`,
      label: "Florida Building Code surcharge, 2.5% with a $4.00 minimum",
      description:
        '"NOTE: A surcharge will be assessed at the rate of 2.5% of each permit (building, electrical, mechanical, plumbing, roof, and gas) fee associated with the enforcement of the Florida Building Code as per Florida Statutes section 468.631 and 553.721. The minimum amount collected in accordance with the Florida Statutes mentioned above on any permit issued shall be $4.00." The two statutes are the same 1% and 1.5% Miami-Dade quotes separately; this is the County that adds them up first.',
      feeType: "percent",
      config: { basis: "permit_fee", rateBps: OC_STATE_SURCHARGE_BPS },
      minimumCents: OC_STATE_SURCHARGE_MINIMUM_CENTS,
      componentType: "state_surcharge",
      priority: 900,
    }),
  ];
}

export const OC_BUILDING_RULES: FeeRuleRecord[] = [
  ...buildingRules(OC_BUILDING_SOURCE_KEY),
  ...stateSurchargeRules("building"),
];

export const OC_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...electricalRules(OC_BUILDING_SOURCE_KEY),
  ...stateSurchargeRules("electrical"),
];

export const OC_PLUMBING_RULES: FeeRuleRecord[] = [
  ...plumbingRules(OC_BUILDING_SOURCE_KEY),
  ...stateSurchargeRules("plumbing"),
];

/**
 * The average cost per square foot the County publishes to derive a valuation.
 *
 * "The following minimum schedule of valuations shall be applied to the structure(s) for which a
 * permit is filed. However, should the contract valuation be greater it shall be used for
 * determining the fee… The applicable valuation(s) shall be multiplied by the square footage of
 * the structure(s) for the purpose of charging the inspection fee in accordance with the fee
 * schedule."
 *
 * The directory prints the full ICC occupancy list across nine construction types (IA, IB, IIA,
 * IIB, IIIA, IIIB, IV, VA, VB). These are six of its rows, and the ones an ordinary job lands in —
 * a house, an office, a shop, a restaurant, a warehouse and a utility building. `null` is the
 * document's own "N.P." (not permitted).
 */
export const OC_AVERAGE_COST_PER_SQ_FT: ReadonlyArray<{
  occupancy: string;
  label: string;
  costs: ReadonlyArray<{ constructionType: string; perSqFt: number | null }>;
}> = [
  {
    occupancy: "R-3",
    label: "Residential, one and two-family",
    costs: [
      { constructionType: "IA", perSqFt: 124 },
      { constructionType: "IB", perSqFt: 121 },
      { constructionType: "IIA", perSqFt: 104 },
      { constructionType: "IIB", perSqFt: 101 },
      { constructionType: "IIIA", perSqFt: 111 },
      { constructionType: "IIIB", perSqFt: 107 },
      { constructionType: "IV", perSqFt: 113 },
      { constructionType: "VA", perSqFt: 104 },
      { constructionType: "VB", perSqFt: 97 },
    ],
  },
  {
    occupancy: "B",
    label: "Business",
    costs: [
      { constructionType: "IA", perSqFt: 158 },
      { constructionType: "IB", perSqFt: 153 },
      { constructionType: "IIA", perSqFt: 138 },
      { constructionType: "IIB", perSqFt: 135 },
      { constructionType: "IIIA", perSqFt: 127 },
      { constructionType: "IIIB", perSqFt: 122 },
      { constructionType: "IV", perSqFt: 134 },
      { constructionType: "VA", perSqFt: 111 },
      { constructionType: "VB", perSqFt: 106 },
    ],
  },
  {
    occupancy: "M",
    label: "Mercantile",
    costs: [
      { constructionType: "IA", perSqFt: 109 },
      { constructionType: "IB", perSqFt: 107 },
      { constructionType: "IIA", perSqFt: 83 },
      { constructionType: "IIB", perSqFt: 100 },
      { constructionType: "IIIA", perSqFt: 92 },
      { constructionType: "IIIB", perSqFt: 84 },
      { constructionType: "IV", perSqFt: 92 },
      { constructionType: "VA", perSqFt: 80 },
      { constructionType: "VB", perSqFt: 77 },
    ],
  },
  {
    occupancy: "A-2",
    label: "Assembly, restaurants, bars, banquet halls",
    costs: [
      { constructionType: "IA", perSqFt: 154 },
      { constructionType: "IB", perSqFt: 150 },
      { constructionType: "IIA", perSqFt: 120 },
      { constructionType: "IIB", perSqFt: 115 },
      { constructionType: "IIIA", perSqFt: 131 },
      { constructionType: "IIIB", perSqFt: 129 },
      { constructionType: "IV", perSqFt: 136 },
      { constructionType: "VA", perSqFt: 119 },
      { constructionType: "VB", perSqFt: 115 },
    ],
  },
  {
    occupancy: "S-1",
    label: "Storage, moderate hazard",
    costs: [
      { constructionType: "IA", perSqFt: 71 },
      { constructionType: "IB", perSqFt: 67 },
      { constructionType: "IIA", perSqFt: 46 },
      { constructionType: "IIB", perSqFt: 42 },
      { constructionType: "IIIA", perSqFt: 56 },
      { constructionType: "IIIB", perSqFt: 47 },
      { constructionType: "IV", perSqFt: 58 },
      { constructionType: "VA", perSqFt: 49 },
      { constructionType: "VB", perSqFt: 43 },
    ],
  },
  {
    occupancy: "U",
    label: "Utility, miscellaneous",
    costs: [
      { constructionType: "IA", perSqFt: 59 },
      { constructionType: "IB", perSqFt: 58 },
      { constructionType: "IIA", perSqFt: 58 },
      { constructionType: "IIB", perSqFt: 54 },
      { constructionType: "IIIA", perSqFt: 51 },
      { constructionType: "IIIB", perSqFt: 47 },
      { constructionType: "IV", perSqFt: 54 },
      { constructionType: "VA", perSqFt: 39 },
      { constructionType: "VB", perSqFt: 37 },
    ],
  },
];

/**
 * Two sentences that apply to every row on the page, in the directory's own words.
 *
 * The first is the reason a figure read off this site can drift from the County's without
 * either being wrong; the second is why some of the rows above are charged at all, and why
 * the site names private providers as a cost it does not model.
 */
export const OC_ANNUAL_ADJUSTMENT_NOTE =
  'The directory states, at the end of the Building Safety section: "Fees will be adjusted for private providers according to Florida Statue 553.791. All fees may be adjusted annually for changes in the Consumer Price index or 3%, whichever is less." The rows here are the ones printed, effective July 2025.';

/** The notes that decide a valuation, in the directory's own words. */
export const OC_VALUATION_METHOD_NOTE =
  "The County publishes the average cost per square foot it uses to derive a valuation, by occupancy and construction type, and three notes that decide the figure: \"Unfinished basements (all use groups) = $15.00 per sq.ft.\", \"For shell only buildings deduct 20%\", and \"Private Detached Garages use 'Utility, miscellaneous'\". The higher of that figure and the contract valuation is the one the fee is charged on.";
