import { formatCents } from "@/lib/format";

import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Oregon fee rules — the state's schedules, as two jurisdictions publish them.
 *
 * **This module is a factory, not a list, and that is the finding of this state.** Portland
 * Permitting & Development issues permits for the City of Portland **and** for
 * unincorporated Multnomah County, and it publishes a separate fee schedule for each. The
 * two documents are not two versions of one rate table: the building permit fee table is
 * **identical in both**, the electrical and plumbing schedules are identical, the state
 * surcharge is the same statute — and the City charges a second table on the same valuation
 * that the county does not, plus $334 more to demolish a commercial building.
 *
 * So the rules are built by functions that take a source key, and each payload calls them
 * with the key of the document it actually read. A test asserts that the two jurisdictions'
 * rule *configs* are identical wherever the published amounts are identical, which is what
 * makes "the same fee in two places" a claim the code can check rather than a sentence in
 * prose.
 *
 *  S1  City of Portland, Portland Permitting & Development, **Building and Other Permits Fee
 *      Schedule**, effective July 10, 2026, sha256 beginning 1f61bb394035119e.
 *  S2  Multnomah County, **Building and Other Permits Fee Schedule**, effective July 10,
 *      2026, sha256 beginning 4211463f0eac9f3e.
 *  S3  City of Portland, **Electrical Permit Fee Schedule**, effective July 10, 2026,
 *      sha256 beginning 934b553c3f27.
 *  S4  City of Portland, **Plumbing Permit Fee Schedule**, effective July 10, 2026,
 *      sha256 beginning 7388a9804250.
 *  S5  Multnomah County, **Electrical Permit Fee Schedule** and **Plumbing Permit Fee
 *      Schedule**, the same amounts under the county's own title pages, sha256 beginning
 *      ab23308d3994 and a42ebd9f8969.
 *  S6  Oregon Building Codes Division, **State of Oregon Permit Surcharge Fee** backgrounder.
 *      "A state surcharge fee of 12% is applied to all building permit types issued in the
 *      State of Oregon… Surcharge fees are calculated by using the total permit fee: Total
 *      permit fee × 0.12 (12%)."
 *
 * **Three mechanisms here are new to this dataset.**
 *
 * 1. **The valuation is mandated by the state.** Both building schedules print the same
 *    paragraph: the method "is mandated by the State of Oregon in OAR 918-050-0100", a
 *    structural permit fee for new construction "shall be calculated using the ICC Building
 *    Valuation Data Table current as of April 1 of each year… multiplied by the square
 *    footage of the structure", and — the sentence no other jurisdiction here publishes —
 *    "**The valuation used will be the greater of either the above calculated value or the
 *    value as stated by the applicant.**"
 * 2. **A 12% state surcharge on every permit type**, imposed by ORS 455.210(4) and collected
 *    by the local department: 4% for state administrative costs, 2% for state inspection
 *    costs, up to 1% for administering the state building code and 4% for the electronic
 *    building codes information system. It is read on `permit_fee` — the figure the permit
 *    fee table produces — and **not** on plan review, which is itself derived from that
 *    figure, so including it would compound it. The alternative reading and its size are
 *    stated on the pages.
 * 3. **Two different review percentages in one jurisdiction.** A building plan review is 65%
 *    of the permit fee; an electrical plan review is 25% of the electrical permit fee, and the
 *    plumbing schedule prints the same 25% row.
 *
 * **Not modelled, and named on the pages instead:** the sewer, storm and water line charges
 * priced per 100 linear feet, the per-square-foot wall-washing row, the per-kVA solar row
 * above 25 kVA, the deferred-submittal percentage, the demolition, EQUIP, master-permit and
 * field-issuance-remodel programs, the hourly review rates, and the two construction excise
 * taxes (Metro's and the Affordable Housing tax at 1% of permit valuation), which are taxes
 * imposed by other bodies rather than permit fees.
 */

/** The schedules' own words: "Effective Date: July 10, 2026". */
export const OREGON_FEE_EFFECTIVE_FROM = "2026-07-10";

export const PORTLAND_BUILDING_SOURCE_KEY = "portland-building-fee-schedule-2026";
export const PORTLAND_ELECTRICAL_SOURCE_KEY = "portland-electrical-fee-schedule-2026";
export const PORTLAND_PLUMBING_SOURCE_KEY = "portland-plumbing-fee-schedule-2026";
export const MULTNOMAH_BUILDING_SOURCE_KEY = "multnomah-building-fee-schedule-2026";
export const MULTNOMAH_ELECTRICAL_SOURCE_KEY = "multnomah-electrical-fee-schedule-2026";
export const MULTNOMAH_PLUMBING_SOURCE_KEY = "multnomah-plumbing-fee-schedule-2026";
export const OREGON_SURCHARGE_SOURCE_KEY = "oregon-bcd-surcharge-backgrounder";
export const OREGON_VALUATION_SOURCE_KEY = "oregon-oar-918-050-0100";

/** Both schedules: "Plan Review 65% of the permit fee". */
export const OREGON_BUILDING_REVIEW_BPS = 6_500;
/** Both trade schedules: "25% of total electrical permit fee - Maximum number of allowable checksheets: 2". */
export const OREGON_TRADE_REVIEW_BPS = 2_500;
/** ORS 455.210(4) as the Building Codes Division applies it: 4 + 2 + 1 + 4, charged at 12%. */
export const OREGON_STATE_SURCHARGE_BPS = 1_200;

/** The fixture and item fee, charged for every named fixture on the plumbing schedule. */
export const OREGON_PLUMBING_FIXTURE_CENTS = 6_300;

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
    effectiveFrom: OREGON_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

type Band = readonly [
  lowerExclusiveCents: number,
  upperInclusiveCents: number | null,
  baseCents: number,
  thresholdCents: number,
  incrementCents: number,
  centsPerThousand: number,
];

/**
 * "Building Permit Fee" — one table, printed identically in both schedules.
 *
 * Five bands, chained on whole steps and with every seam closing: the figure each band
 * produces at its top is exactly the opening figure of the band above it — $220.85 at
 * $2,000, $540.78 at $25,000, $797.28 at $50,000 and $1,137.78 at $100,000. The first band
 * counts in **hundreds** rather than thousands ($3.59 per additional $100 = $35.90 per
 * $1,000), which is what makes a $2,000 valuation land exactly on the next band's base.
 */
export function buildingPermitFeeRules(sourceId: string): FeeRuleRecord[] {
  const bands: readonly Band[] = [
    [0, 200_000, 16_700, 50_000, 10_000, 3_590],
    [200_000, 2_500_000, 22_085, 200_000, 100_000, 1_391],
    [2_500_000, 5_000_000, 54_078, 2_500_000, 100_000, 1_026],
    [5_000_000, 10_000_000, 79_728, 5_000_000, 100_000, 681],
    [10_000_000, null, 113_778, 10_000_000, 100_000, 563],
  ];

  return bands.map(([lower, upper, base, threshold, increment, rate], index) =>
    rule(sourceId, {
      id: `or-build-fee-${index + 1}`,
      code: `BUILD-FEE-${index + 1}`,
      label:
        index === 0
          ? "Building permit fee, $1 to $2,000"
          : upper === null
            ? "Building permit fee, $100,001 and up"
            : `Building permit fee, ${formatCents(lower + 1, { showCents: false })} to ${formatCents(upper, { showCents: false })}`,
      description: `"Building Permit Fee", band ${index + 1} of 5: "Fee for the first ${formatCents(threshold, { showCents: false })} — ${formatCents(base)}, plus ${formatCents(rate)} for each additional ${formatCents(increment, { showCents: false })} or fraction thereof". ${index === 0 ? "The minimum fee on the first row is what a valuation of $500 or less pays." : "The fee the band below produces at its top is exactly this band's opening figure."}`,
      feeType: "per_thousand",
      componentType: "base",
      config: {
        basis: "valuation",
        baseCents: base,
        thresholdCents: threshold,
        incrementCents: increment,
        centsPerThousand: rate,
      },
      conditions:
        upper === null
          ? { field: "valuation", op: "gt", value: lower }
          : {
              all: [
                { field: "valuation", op: "gt", value: lower },
                { field: "valuation", op: "lte", value: upper },
              ],
            },
    }),
  );
}

/** "Plan Review 65% of the permit fee" — the building page's review, read off the permit fee. */
export function buildingReviewRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "or-build-plan-review",
      code: "PLAN-REVIEW-65",
      label: "Plan review fee, 65% of the permit fee",
      description:
        'The schedules print one line for it: "Plan Review 65% of the permit fee". Read on the `permit_fee` basis, so it is computed from the permit fee this run produced rather than from the valuation. The schedules also print a "For value-added revisions: 65% of the additional building permit fee (based on the additional valuation)", which is the same percentage applied to a change order rather than to the project.',
      feeType: "percent",
      componentType: "plan_review",
      priority: 500,
      config: { basis: "permit_fee", rateBps: OREGON_BUILDING_REVIEW_BPS },
    }),
  ];
}

/** The 12% state surcharge, on every permit type the schedules price. */
export function stateSurchargeRules(sourceId: string): FeeRuleRecord[] {
  return [
    rule(sourceId, {
      id: "or-state-surcharge",
      code: "STATE-SURCHARGE-12",
      label: "State of Oregon surcharge, 12% of the permit fee",
      description:
        'The Building Codes Division\'s own backgrounder: "A state surcharge fee of 12% is applied to all building permit types issued in the State of Oregon" and "Surcharge fees are calculated by using the total permit fee: Total permit fee × 0.12 (12%)", for building, mechanical, plumbing (including fixtures), electrical (including services) and structural permits. It implements ORS 455.210(4), which imposes four surcharges on "the total permit fees": 4% for state administrative costs, 2% for state inspection costs, up to 1% for administering and enforcing the state building code, and 4% for the electronic building codes information system. Read on `permit_fee` — the figure the permit fee table produces — and not on plan review, which is itself a percentage of that figure; the alternative reading is stated on the pages with its size.',
      feeType: "percent",
      componentType: "state_surcharge",
      priority: 900,
      config: { basis: "permit_fee", rateBps: OREGON_STATE_SURCHARGE_BPS },
      conditions: null,
    }),
  ];
}

/**
 * The City's "Development Services Fee", in its two published versions.
 *
 * This is the table the county does **not** charge, and it is the reason the two
 * jurisdictions' totals differ on an identical valuation. Both versions apply, in the
 * schedule's own words, "to all Building Permits, Site Development Permits (except where
 * work involves only clearing) and Zoning Permits", so which one applies is a question about
 * the project rather than about the permit: the residential table is used for a
 * one- or two-family dwelling and the commercial table for everything else.
 *
 * **The commercial version does not close at its own first seam.** Band 1 at $2,000 produces
 * $26.49 plus fifteen steps of $1.16 — $43.89 — while band 2 opens at **$44.79**, ninety
 * cents higher. The residential version's seam closes exactly ($21.19 + 15 × $0.97 =
 * $35.74, which is what its band 2 opens with), so the same document disagrees with itself in
 * one table and not the other. Both figures are asserted in the tests, and the pages state
 * the ninety cents rather than smoothing it.
 */
export function developmentServicesRules(sourceId: string): FeeRuleRecord[] {
  const commercial: readonly Band[] = [
    [0, 200_000, 2_649, 50_000, 10_000, 1_160],
    [200_000, 2_500_000, 4_479, 200_000, 100_000, 469],
    [2_500_000, 5_000_000, 15_266, 2_500_000, 100_000, 349],
    [5_000_000, 10_000_000, 23_991, 5_000_000, 100_000, 234],
    [10_000_000, null, 35_691, 10_000_000, 100_000, 196],
  ];
  const residential: readonly Band[] = [
    [0, 200_000, 2_119, 50_000, 10_000, 970],
    [200_000, 2_500_000, 3_574, 200_000, 100_000, 374],
    [2_500_000, 5_000_000, 12_176, 2_500_000, 100_000, 281],
    [5_000_000, 10_000_000, 19_201, 5_000_000, 100_000, 188],
    [10_000_000, null, 28_601, 10_000_000, 100_000, 158],
  ];

  const build = (label: string, bands: readonly Band[], residentialOnly: boolean) =>
    bands.map(([lower, upper, base, threshold, increment, rate], index) =>
      rule(sourceId, {
        id: `or-dev-services-${residentialOnly ? "res" : "com"}-${index + 1}`,
        code: `DEV-SERVICES-${residentialOnly ? "RESIDENTIAL" : "COMMERCIAL"}-${index + 1}`,
        label: `${label}, band ${index + 1}`,
        description: `"${label}": "Fee for the first ${formatCents(threshold, { showCents: false })} — ${formatCents(base)}, plus ${formatCents(rate)} for each additional ${formatCents(increment, { showCents: false })} or fraction thereof". Charged on the same valuation as the building permit fee and, in the schedule's own words, "Applies to all Building Permits, Site Development Permits (except where work involves only clearing) and Zoning Permits".`,
        feeType: "per_thousand",
        componentType: "other",
        priority: 200,
        config: {
          basis: "valuation",
          baseCents: base,
          thresholdCents: threshold,
          incrementCents: increment,
          centsPerThousand: rate,
        },
        conditions: {
          all: [
            ...(upper === null
              ? [{ field: "valuation" as const, op: "gt" as const, value: lower }]
              : [
                  { field: "valuation" as const, op: "gt" as const, value: lower },
                  { field: "valuation" as const, op: "lte" as const, value: upper },
                ]),
            residentialOnly
              ? { field: "custom.building_class", op: "in" as const, value: ["residential", "single_family"] }
              : { field: "custom.building_class", op: "not_in" as const, value: ["residential", "single_family"] },
          ],
        },
      }),
    );

  return [
    ...build("Development Services Fee - Commercial", commercial, false),
    ...build("Development Services Fee - Residential", residential, true),
  ];
}

/**
 * "Electrical Permit Fee Schedule" — printed identically by the City and the County.
 *
 * The rows follow the structure the state's own rules impose (OAR 918-309-0030 and
 * -0060), and two of them are shaped in a way no other electrical page in this dataset is.
 *
 *   - A **branch circuit costs $21.00 if a service or feeder fee was also paid, and $174.00
 *     for the first one if it was not**, then $21.00 each after that. So the fee for the same
 *     work depends on what else is on the permit, which is why the rules are gated on the
 *     item selected rather than on the circuit count alone.
 *   - A **plan review is 25% of the electrical permit fee** — a different percentage from the
 *     65% the building schedule prints, in the same jurisdiction.
 */
export function electricalRules(sourceId: string): FeeRuleRecord[] {
  const amp = (
    id: string,
    code: string,
    label: string,
    description: string,
    item: string,
    lower: number,
    upper: number | null,
    cents: number,
  ) =>
    rule(sourceId, {
      id,
      code,
      label,
      description,
      feeType: "flat",
      sourceId,
      config: { amountCents: cents },
      conditions: {
        all: [
          { field: "custom.electrical_item", op: "eq", value: item },
          { field: "custom.service_amps", op: "gt", value: lower },
          ...(upper === null
            ? []
            : [{ field: "custom.service_amps", op: "lte" as const, value: upper }]),
        ],
      },
    });

  return [
    amp(
      "or-elec-service-200",
      "ELEC-SERVICE-200A",
      "Service or feeder, 200 amps",
      '"Services or Feeders: Installation, alteration or relocation — 200 amps — $212.00". The row has no lower bound, so it is the band a service or feeder falls in unless a larger one is selected.',
      "service",
      0,
      200,
      21_200,
    ),
    amp(
      "or-elec-service-400",
      "ELEC-SERVICE-201-400A",
      "Service or feeder, 201 to 400 amps",
      '"Services or Feeders" — "201 to 400 amps — $298.00".',
      "service",
      200,
      400,
      29_800,
    ),
    amp(
      "or-elec-service-600",
      "ELEC-SERVICE-401-600A",
      "Service or feeder, 401 to 600 amps",
      '"Services or Feeders" — "401 to 600 amps — $391.00".',
      "service",
      400,
      600,
      39_100,
    ),
    amp(
      "or-elec-service-1000",
      "ELEC-SERVICE-601-1000A",
      "Service or feeder, 601 to 1,000 amps",
      '"Services or Feeders" — "601 to 1,000 amps — $588.00".',
      "service",
      600,
      1_000,
      58_800,
    ),
    amp(
      "or-elec-service-over-1000",
      "ELEC-SERVICE-OVER-1000A",
      "Service or feeder, over 1,000 amps or volts",
      '"Services or Feeders" — "Over 1,000 amps or volts — $1,077.00", the open band.',
      "service",
      1_000,
      null,
      107_700,
    ),
    rule(sourceId, {
      id: "or-elec-reconnect",
      code: "ELEC-RECONNECT-ONLY",
      label: "Reconnect only",
      description: '"Services or Feeders" — "Reconnect only — $190.00".',
      feeType: "flat",
      sourceId,
      config: { amountCents: 19_000 },
      conditions: { field: "custom.electrical_item", op: "eq", value: "reconnect" },
    }),
    amp(
      "or-elec-temp-200",
      "ELEC-TEMP-200A",
      "Temporary service or feeder, 200 amps or less",
      '"Temporary Services or Feeders: Installation, alteration or relocation — 200 amps or less — $187.00".',
      "temporary_service",
      0,
      200,
      18_700,
    ),
    amp(
      "or-elec-temp-400",
      "ELEC-TEMP-201-400A",
      "Temporary service or feeder, 201 to 400 amps",
      '"Temporary Services or Feeders" — "201 to 400 amps — $283.00".',
      "temporary_service",
      200,
      400,
      28_300,
    ),
    amp(
      "or-elec-temp-600",
      "ELEC-TEMP-401-600A",
      "Temporary service or feeder, 401 to 600 amps",
      '"Temporary Services or Feeders" — "401 to 600 amps — $356.00". Above 600 amps the schedule sends the applicant to the service and feeder rows: "Over 600 amps or 1,000 volts - (see above)".',
      "temporary_service",
      400,
      600,
      35_600,
    ),
    rule(sourceId, {
      id: "or-elec-circuits-with-service",
      code: "ELEC-CIRCUITS-WITH-SERVICE",
      label: "Branch circuits bought with a service or feeder, $21.00 each",
      description:
        '"Branch Circuits: New, alteration or extension per panel — a. The fee for branch circuits with the purchase of service or feeder fee — $21.00". Charged per circuit, on a permit that already carries a service or feeder fee.',
      feeType: "per_unit",
      sourceId,
      config: { unit: "circuits", baseCents: 0, thresholdUnits: 0, centsPerUnit: 2_100 },
      conditions: {
        all: [
          { field: "custom.electrical_item", op: "eq", value: "service" },
          { field: "custom.circuits", op: "gt", value: 0 },
        ],
      },
    }),
    rule(sourceId, {
      id: "or-elec-circuits-without-service",
      code: "ELEC-CIRCUITS-WITHOUT-SERVICE",
      label: "Branch circuits without a service fee, $174.00 for the first and $21.00 each after",
      description:
        '"Branch Circuits: New, alteration or extension per panel — b. The fee for branch circuits without the purchase of service or feeder fee: First branch circuit — $174.00; Each additional branch circuit — $21.00". The first circuit costs eight times what the second does, which is the row that makes this schedule different from every other electrical schedule on this site.',
      feeType: "per_unit",
      sourceId,
      config: { unit: "circuits", baseCents: 17_400, thresholdUnits: 1, centsPerUnit: 2_100 },
      conditions: {
        all: [
          { field: "custom.electrical_item", op: "eq", value: "circuits" },
          { field: "custom.circuits", op: "gt", value: 0 },
        ],
      },
    }),
    rule(sourceId, {
      id: "or-elec-signs",
      code: "ELEC-SIGNS",
      label: "Each sign or outline lighting, $161.00",
      description:
        '"Miscellaneous (Service or feeder not included) — Each sign or outline lighting — $161.00". The same section prices "each pump or irrigation circle" and "signal circuit(s) or a limited energy panel, alteration or extension" at $161.00.',
      feeType: "per_unit",
      sourceId,
      config: { unit: "signs", baseCents: 0, thresholdUnits: 0, centsPerUnit: 16_100 },
      conditions: { field: "custom.signs", op: "gt", value: 0 },
    }),
    rule(sourceId, {
      id: "or-elec-signal-circuit",
      code: "ELEC-SIGNAL-CIRCUIT",
      label: "Signal circuits or a limited energy panel, $161.00",
      description:
        '"Miscellaneous (Service or feeder not included) — Signal circuit(s) or a limited energy panel, alteration or extension — $161.00".',
      feeType: "flat",
      sourceId,
      config: { amountCents: 16_100 },
      conditions: { field: "custom.electrical_item", op: "eq", value: "signal" },
    }),
    rule(sourceId, {
      id: "or-elec-renewable-small",
      code: "ELEC-RENEWABLE-5KVA",
      label: "Renewable energy, 5 kVA or less",
      description:
        '"Renewable Energy: Installation, alteration or relocation — 5 kva or less — $212.00".',
      feeType: "flat",
      sourceId,
      config: { amountCents: 21_200 },
      conditions: {
        all: [
          { field: "custom.electrical_item", op: "eq", value: "renewable" },
          { field: "custom.kva", op: "gt", value: 0 },
          { field: "custom.kva", op: "lte", value: 5 },
        ],
      },
    }),
    rule(sourceId, {
      id: "or-elec-renewable-15",
      code: "ELEC-RENEWABLE-5-15KVA",
      label: "Renewable energy, 5.01 to 15 kVA",
      description: '"Renewable Energy" — "5.01 to 15 kva — $298.00".',
      feeType: "flat",
      sourceId,
      config: { amountCents: 29_800 },
      conditions: {
        all: [
          { field: "custom.electrical_item", op: "eq", value: "renewable" },
          { field: "custom.kva", op: "gt", value: 5 },
          { field: "custom.kva", op: "lte", value: 15 },
        ],
      },
    }),
    rule(sourceId, {
      id: "or-elec-renewable-25",
      code: "ELEC-RENEWABLE-15-25KVA",
      label: "Renewable energy, 15.01 to 25 kVA",
      description:
        '"Renewable Energy" — "15.01 to 25 kva — $391.00". Above 25 kVA the schedule changes method and charges $15.52 for each kVA over 25.01 up to 100, which is a marginal per-kVA rate and is stated on the page rather than modelled.',
      feeType: "flat",
      sourceId,
      config: { amountCents: 39_100 },
      conditions: {
        all: [
          { field: "custom.electrical_item", op: "eq", value: "renewable" },
          { field: "custom.kva", op: "gt", value: 15 },
          { field: "custom.kva", op: "lte", value: 25 },
        ],
      },
    }),
    rule(sourceId, {
      id: "or-elec-residential-package",
      code: "ELEC-RESIDENTIAL-SQFT-PACKAGE",
      label: "Residential square foot wiring package, $408.00 for the first 1,000 sq ft and $93.00 each 500 after",
      description:
        '"Residential Square Foot Wiring Packages for New and Remodels: Single or multi-family, per dwelling unit. Include garage. Service included. — 1,000 square feet or less — $408.00; Each additional 500 square feet or portion thereof — $93.00". The schedule adds that for a building of three or more apartments the fee is computed on the largest apartment and each additional apartment pays half the first unit fee. Modelled on the area, so a package price is charged per dwelling unit entered.\n\n$93.00 per 500 square feet is $0.186 a square foot, so the row is carried as that rate above the published first 1,000 square feet, with the $408.00 the document prints as a base charge and its 500-square-foot step as the rounding increment. Both figures are the schedule\'s own: the rate is the published row restated in the unit the engine charges in, exactly as the 30% remodel rate is carried as $0.282 on Scottsdale\'s page. A 1,700-square-foot unit is $408.00 + two steps of $93.00 = $594.00.',
      feeType: "percent",
      config: {
        basis: "square_footage",
        rate: { numerator: 186, denominator: 10 },
        rateUnit: "currency_per_unit",
        thresholdCents: 1_000,
        incrementCents: 500,
        baseCents: 40_800,
      },
      conditions: {
        all: [
          { field: "custom.electrical_item", op: "eq", value: "residential_package" },
          { field: "square_footage", op: "gt", value: 0 },
        ],
      },
    }),
    rule(sourceId, {
      id: "or-elec-plan-review",
      code: "ELEC-PLAN-REVIEW-25",
      label: "Electrical plan review fee, 25% of the permit fee",
      description:
        '"Plan Review Fee — 25% of total electrical permit fee - Maximum number of allowable checksheets: 2", with an additional checksheet fee of $324.00 and an additional-review row at $228.00 per hour above the first half hour. Read on the `permit_fee` basis, so it is computed from the electrical permit fee this run produced. The building permit\'s review is 65% of its permit fee, so the two percentages are different in the same jurisdiction.',
      feeType: "percent",
      componentType: "plan_review",
      priority: 500,
      sourceId,
      config: { basis: "permit_fee", rateBps: OREGON_TRADE_REVIEW_BPS },
    }),
  ];
}

/**
 * "Plumbing Permit Fee Schedule" — printed identically by the City and the County.
 *
 * Two routes, and the guard that keeps them apart:
 *
 *   - **A new one- or two-family dwelling is priced by how many baths it has** — $792.00 for
 *     one, $1,187.00 for two, $1,388.00 for three and $334.00 for each additional bath or
 *     kitchen — and the row says it "Includes 100 feet for each utility connection".
 *   - **Everything else is priced per fixture at $63.00**, and the list of named items is long
 *     enough to be useful in its own right: a water heater, a water closet, a tub, a hose
 *     bibb, a dishwasher, a garbage disposal and a backflow preventer are all $63.00, and so
 *     are thirty other rows.
 *
 * The two routes are gated on `custom.dwelling_scope`, because a new two-bath house priced by
 * the dwelling row and then charged again for its fixtures would be billed twice for the same
 * permit — the same class of guard Westminster's trade rules needed.
 *
 * **The plumbing schedule's plan review row says "25% of total mechanical permit fee".** It is
 * a copy-and-paste slip in the City's own document: the row sits under the plumbing schedule's
 * "Plan Review Fee" heading, which the paragraph above it scopes to plumbing — "For commercial
 * and multi-family structures with new outside installations and/or complex systems as defined
 * by OAR 918-780-0040 or for medical gas systems". Modelled as 25% of the plumbing permit fee,
 * which is the only reading that makes it a plumbing fee, and recorded as a reading in the
 * research file.
 */
export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  const dwelling = (baths: number) =>
    rule(sourceId, {
      id: `or-plumb-dwelling-${baths}bath`,
      code: `PLUMB-DWELLING-${baths}BATH`,
      label: `New one- or two-family dwelling, ${baths} bath`,
      description: `"New 1 & 2 Family Dwellings Only - Includes 100 feet for each utility connection — Single Family Residence (${baths}) bath — $${baths === 1 ? "792.00" : baths === 2 ? "1,187.00" : "1,388.00"}". The row is the whole plumbing permit for that dwelling, which is why the per-fixture rules are excluded when it applies.`,
      feeType: "flat",
      sourceId,
      config: { amountCents: baths === 1 ? 79_200 : baths === 2 ? 118_700 : 138_800 },
      conditions: {
        all: [
          { field: "custom.dwelling_scope", op: "eq", value: "new_1_2_family" },
          { field: "custom.bathrooms", op: "eq", value: baths },
        ],
      },
    });

  return [
    dwelling(1),
    dwelling(2),
    dwelling(3),
    rule(sourceId, {
      id: "or-plumb-dwelling-additional",
      code: "PLUMB-DWELLING-ADDITIONAL-BATH",
      label: "New dwelling, each additional bath or kitchen, $334.00",
      description:
        '"New 1 & 2 Family Dwellings Only — Each additional bath/kitchen — $334.00", charged on top of the three-bath figure for a dwelling with more than three.',
      feeType: "per_unit",
      sourceId,
      config: { unit: "bathrooms", baseCents: 138_800, thresholdUnits: 3, centsPerUnit: 33_400 },
      conditions: {
        all: [
          { field: "custom.dwelling_scope", op: "eq", value: "new_1_2_family" },
          { field: "custom.bathrooms", op: "gt", value: 3 },
        ],
      },
    }),
    rule(sourceId, {
      id: "or-plumb-fixture",
      code: "PLUMB-FIXTURE-EACH",
      label: "Each fixture or item, $63.00",
      description:
        'The schedule\'s own fixture list, one rate for every row on it: "Water heater $63.00", "Water closet $63.00", "Tubs/shower/shower pan $63.00", "Back flow preventer $63.00", "Dishwasher $63.00", "Garbage disposal $63.00", "Hose bibb $63.00", "Basins/Lavatory $63.00", "Drinking fountains $63.00", "Ejectors/Sump $63.00", "Expansion tank $63.00", "Ice maker $63.00", "Interceptor/Grease trap $63.00", "Sink(s) Basins(s) Lav(s) $63.00", "Urinal $63.00", "Floor drains/Floor sinks/Hub $63.00" and "Other $63.00".',
      feeType: "per_unit",
      sourceId,
      config: { unit: "fixtures", baseCents: 0, thresholdUnits: 0, centsPerUnit: OREGON_PLUMBING_FIXTURE_CENTS },
      conditions: { field: "custom.dwelling_scope", op: "absent" },
    }),
    rule(sourceId, {
      id: "or-plumb-water-lines-residential",
      code: "PLUMB-WATER-LINES-RESIDENTIAL",
      label: "Replacing in-building water supply lines, residential, $128.00 first floor and $52.00 each after",
      description:
        '"Replacing in-building water supply lines: Residential: First floor — $128.00; Each additional floor — $52.00". The commercial route beside it is priced per branch rather than per floor — "First 5 branches — $128.00; Each fixture branch over five — $31.00" — and is stated on the page rather than modelled, because it counts branches of piping rather than fixtures or floors.',
      feeType: "per_unit",
      sourceId,
      config: { unit: "stories", baseCents: 12_800, thresholdUnits: 1, centsPerUnit: 5_200 },
      conditions: {
        all: [
          { field: "custom.plumbing_item", op: "eq", value: "water_lines_residential" },
          { field: "custom.stories", op: "gt", value: 0 },
        ],
      },
    }),
    rule(sourceId, {
      id: "or-plumb-plan-review",
      code: "PLUMB-PLAN-REVIEW-25",
      label: "Plumbing plan review fee, 25% of the permit fee",
      description:
        'The schedule\'s plan review row prints "25% of total mechanical permit fee - Maximum number of allowable checksheets: 2" — the word "mechanical" is a slip in the City\'s own document, since the heading above it is "Plan Review Fee" and the paragraph above that scopes the fee to plumbing and medical gas systems under OAR 918-780-0040. Read as 25% of the plumbing permit fee, on the `permit_fee` basis, and recorded as a reading.',
      feeType: "percent",
      componentType: "plan_review",
      priority: 500,
      sourceId,
      config: { basis: "permit_fee", rateBps: OREGON_TRADE_REVIEW_BPS },
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/* The City of Portland's own rule sets                                       */
/* -------------------------------------------------------------------------- */

const CITY_BUILDING = PORTLAND_BUILDING_SOURCE_KEY;

/**
 * The schedules' own words for what the state mandate does, quoted once here so every page
 * can cite the same sentence rather than paraphrase it: the method "is mandated by the State
 * of Oregon in OAR 918-050-0100" and "The valuation used will be the greater of either the
 * above calculated value or the value as stated by the applicant."
 */
export const OREGON_VALUATION_METHOD_NOTE =
  "The permit valuation method is mandated by the State of Oregon in OAR 918-050-0100: a structural permit fee for new construction and additions \"shall be calculated using the ICC Building Valuation Data Table current as of April 1 of each year, using the occupancy and construction type as determined by the building official, multiplied by the square footage of the structure\", and \"the valuation used will be the greater of either the above calculated value or the value as stated by the applicant\".";

export const PORTLAND_BUILDING_RULES: FeeRuleRecord[] = [
  ...buildingPermitFeeRules(CITY_BUILDING),
  ...buildingReviewRules(CITY_BUILDING),
  ...developmentServicesRules(CITY_BUILDING),
  ...stateSurchargeRules(OREGON_SURCHARGE_SOURCE_KEY),
];

export const PORTLAND_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...electricalRules(PORTLAND_ELECTRICAL_SOURCE_KEY),
  ...stateSurchargeRules(OREGON_SURCHARGE_SOURCE_KEY),
];

export const PORTLAND_PLUMBING_RULES: FeeRuleRecord[] = [
  ...plumbingRules(PORTLAND_PLUMBING_SOURCE_KEY),
  ...stateSurchargeRules(OREGON_SURCHARGE_SOURCE_KEY),
];

/* -------------------------------------------------------------------------- */
/* Unincorporated Multnomah County's own rule sets                            */
/* -------------------------------------------------------------------------- */

export const MULTNOMAH_BUILDING_RULES: FeeRuleRecord[] = [
  ...buildingPermitFeeRules(MULTNOMAH_BUILDING_SOURCE_KEY),
  ...buildingReviewRules(MULTNOMAH_BUILDING_SOURCE_KEY),
  ...stateSurchargeRules(OREGON_SURCHARGE_SOURCE_KEY),
];

export const MULTNOMAH_ELECTRICAL_RULES: FeeRuleRecord[] = [
  ...electricalRules(MULTNOMAH_ELECTRICAL_SOURCE_KEY),
  ...stateSurchargeRules(OREGON_SURCHARGE_SOURCE_KEY),
];

export const MULTNOMAH_PLUMBING_RULES: FeeRuleRecord[] = [
  ...plumbingRules(MULTNOMAH_PLUMBING_SOURCE_KEY),
  ...stateSurchargeRules(OREGON_SURCHARGE_SOURCE_KEY),
];
