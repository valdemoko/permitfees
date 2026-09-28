import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Jersey City, New Jersey fee rules — REAL DATA.
 *
 * Sources (research/new-jersey/jersey-city.md records how each was read):
 *
 *  S1  Jersey City Municipal Code, Chapter 160 "Fees and Charges", §160-1 M —
 *      "Chapter 131, Uniform Construction Code fees established pursuant to N.J.S.A.
 *      52:27D-126a", read in the codifier's consolidation, Supplement No. 52. §160-1 M is
 *      the whole schedule: the building subcode in (1), plumbing in (2), electrical in (3),
 *      fire in (4), elevator in (5) and miscellaneous fees in (6).
 *      https://library.municode.com/nj/jersey_city/codes/code_of_ordinances?nodeId=CH160FECH_S160-1FESCES
 *  S2  Ordinance 26-051, "An Ordinance of the Municipal Council of Jersey City amending
 *      Chapter 160 — Fees and Charges with any Associated Chapters for Fees", adopted on
 *      second reading 15 July 2026, with the amended Chapter 160 as its attachment. Read to
 *      establish that this instrument — a comprehensive revision of Chapter 160 — leaves
 *      §160-1 M's amounts untouched: the attachment prints old and new figures side by side
 *      for every fee the ordinance changes, and the Uniform Construction Code block carries
 *      one figure per row.
 *      https://cityofjerseycity.civicweb.net/document/455677
 *  S3  N.J.A.C. 5:23-4.18 "Standards for municipal fees" and §5:23-4.19 "New Jersey State
 *      permit surcharge fees", from the Department of Community Affairs' consolidated
 *      subchapter. §5:23-4.18(a)1 is why plan review is not charged twice here, and
 *      §5:23-4.19(b) is where the surcharge's amount comes from — Jersey City prints an older
 *      version of it and says in terms that State-set fees are incorporated by reference.
 *      https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_4.pdf
 *
 * **The mechanism, in three sentences.** Jersey City prices new construction on the **volume of
 * the building**: $0.027 a cubic foot for every use group except A-1, A-2, A-4, A-5, F-1, F-2,
 * S-1 and S-2, which pay $0.15 — five and a half times as much, a difference the ordinance
 * makes without comment. Renovations, alterations and repairs are priced on the **estimated cost
 * of the work** at $15 per $1,000, with a $50 floor for a short permit and a $100 floor when a
 * plan is filed. Electrical work is charged in **blocks of receptacles, fixtures and devices**
 * ($25 for the first ten, $25 for each additional twenty-five), and plumbing work at **$10 a
 * fixture** with a long priced menu of individual devices behind it. The State's permit
 * surcharge is added to all of it.
 *
 * **Four readings this module depends on, all of them stated on the pages.**
 *
 *  1. **The alteration bands are a single rate here, unlike Newark's.** Jersey City's §160-1
 *     M(1)(b) publishes one figure — "$15 for each one thousand dollars ($1,000.00) of estimated
 *     cost of work" — and no table, so there is nothing to graduate and no band to read wrongly.
 *  2. **Plan review is a prepayment.** M(1)(o) says "Plan Review Fee shall be 25% of the
 *     estimated cost of permits which is nonrefundable" and does not say what happens to it
 *     afterwards. N.J.A.C. 5:23-4.18(a)1, which is the standard every municipal fee ordinance in
 *     New Jersey has to meet, requires the amount "then [to] be deducted from the amount of the
 *     fee due for a construction permit, when the permit is issued". The City's fee is therefore
 *     a 25% prepayment of the permit fee rather than a 25% surcharge on it, and this payload
 *     charges no plan-review row — the page states the reading and what a permit would cost if
 *     the City meant it the other way.
 *  3. **The State surcharge is charged at the State's amount.** M(1)(g) prints "State of New
 *     Jersey training fee: $0.00265 per cubic foot volume of new construction. $0.00135 of cost
 *     of construction for alterations, renovations, and repairs" — the State's pre-1995 pair, as
 *     §5:23-4.19's own amendment history shows ($0.00265 → $0.00334 → $0.00371 a cubic foot).
 *     The same section of the code says, in terms: "Certain fees described above as charged by
 *     the Office of the Construction Official are set by the State of New Jersey. Any changes in
 *     those fees by the State of New Jersey will be incorporated herein by reference." The State
 *     sets it, the City collects it, and both figures are printed on the page.
 *  4. **The high-rate use-group list is printed with A-2 twice.** M(1)(a) reads "$0.15 per cubic
 *     foot of volume for use groups A-1, A-2, A-2, A-4, A-5, F-1, F-2, S-1 and S-2". A-3 is
 *     absent from a list that otherwise runs through the A series in order, so the duplicate is
 *     very likely A-3 — but the ordinance does not say so, and this site models the list as
 *     printed: an A-3 building is charged the general $0.027 rate, and the page says plainly
 *     that the list prints A-2 twice and that the point should be confirmed with the Construction
 *     Official.
 *
 * **What is deliberately NOT here:**
 *
 *  - **The fire subcode** (M(4)) — sprinkler heads at $75 up to 20, $125 to 100 and $125 plus $1
 *    a head above that; suppression systems and valves at $150 with standpipes at $230 a riser;
 *    alarm devices at $25 for ten and $60 for twenty plus $1 each after that and $100 per 10,000
 *    square feet; pre-engineered systems at $100 and $150; kitchen exhaust at $100 and gas or oil
 *    fired devices at $50; tanks at $100 to $300 by gallonage; a $75 minimum, a $125 Department
 *    of Public Safety connection and $365 for incinerators and crematoriums. Published,
 *    transcribed in the research record, and not attached to a page.
 *  - **The plumbing device menu** in M(2)(b) and M(2)(c) — a water heater at $30, a sewer pump,
 *    interceptor, separator, grease trap, sewer connection, stack, catch basin, dental chair,
 *    cooling unit, fire hydrant, house sewer, soil line connection, sewage ejector, storm sewer,
 *    storm sewer connection, vent line and water riser line at $40, a fire sprinkler main at $60,
 *    water service at $30 and $60 by pipe size, an A.C. unit and ventilating equipment at $30, an
 *    active solar system at $35, a tankless heater at $25, a garbage disposal at $15, a house
 *    drain at $20 and $30 by size, and the $10 list that runs from a closet bend to a yard drain.
 *    Every amount is named on the plumbing page; the model charges the $10 fixture row, which is
 *    the row the schedule calls "Plumbing fixtures" and the one that covers most of the menu's
 *    members.
 *  - **The electrical rating bands** — $10, $45, $85 and $412 for motors, transformers, service
 *    equipment, panel boards and switchboards by horsepower, kilowatt and ampere — which are
 *    priced per device by a rating no input on this site collects. The amounts are named on the
 *    electrical page.
 *  - **The elevator subcode** (M(5)), both tables, from $43 for oil buffers to $497 for an
 *    escalator, plus the annual inspection schedule.
 *  - **Everything in M(1) that is not a construction permit fee**: asbestos removal at $50, lead
 *    paint abatement at $140, exterior hoistways at $260, above- and in-ground pools at $50 to
 *    $150 by size, tents at $92, signs at $1.50 a square foot, prototype filing at 80% for each
 *    additional prototype, and emergency and exit lights at $25 for the first ten and $25 for
 *    each additional twenty-five.
 *  - **The miscellaneous and non-construction fees** in M(6) and M(7): demolition at $200 and
 *    $250, variations at $200, certificates of occupancy at $100 and certificates of continued
 *    occupancy at $200, the annual construction permit at $667 a worker and $232 for each one
 *    over twenty-five, no-certificate letters at $50, a discharge of lis pendens at $100 and a
 *    returned check at $25.
 *
 * **This module is the single definition of Jersey City's fee rules.** The seed writes exactly
 * these records and the tests assert against exactly these records.
 */

/**
 * The date the Uniform Construction Code block was last amended.
 *
 * §160-1 M's own history in the codifier's consolidation carries two amendments inside the block
 * — 4-13-2005 by Ord. 04-154 (the non-construction fees in M(7)) and 9-11-2013 by Ord. 13-081 (the
 * Department of Public Safety connection) — and no later one. Ord. 26-051's comprehensive
 * revision of Chapter 160, adopted 15 July 2026, left these amounts alone. The date recorded here
 * is therefore the last date the block changed, not the date the whole schedule was written; the
 * City's base rates are older than it and the code does not date them row by row.
 */
export const JERSEY_CITY_FEE_EFFECTIVE_FROM = "2013-09-11";

export const JERSEY_CITY_CODE_SOURCE_KEY = "jersey-city-municode-chapter-160-ucc-fees";
export const JERSEY_CITY_ORDINANCE_SOURCE_KEY = "jersey-city-ordinance-26-051";
export const JERSEY_CITY_STATE_UCC_SOURCE_KEY = "nj-ucc-njac-5-23-4";

/** "$.027 per cubic foot of volume for buildings and structures of all use groups". */
export const JERSEY_CITY_PER_CUBIC_FOOT_GENERAL = { numerator: 27, denominator: 10 };
/** "... except that the fee shall be $0.15 per cubic foot of volume for use groups ..." */
export const JERSEY_CITY_PER_CUBIC_FOOT_HIGH = { numerator: 15, denominator: 1 };

/** The use groups the ordinance prints at $0.15 a cubic foot — A-2 listed twice, as printed. */
export const JERSEY_CITY_HIGH_RATE_USE_GROUPS = [
  "A-1",
  "A-2",
  "A-4",
  "A-5",
  "F-1",
  "F-2",
  "S-1",
  "S-2",
] as const;

/** M(1)(b): "$15" per $1,000 of estimated cost of work. */
export const JERSEY_CITY_CENTS_PER_THOUSAND_ALTERATION = 1_500;
/** M(1)(c): "Minimum fee for short permit for renovations, alterations or repairs: $50." */
export const JERSEY_CITY_SHORT_PERMIT_MINIMUM_CENTS = 5_000;
/** M(1)(d): "Minimum fee for plan permit for renovations, alterations and repairs: $100." */
export const JERSEY_CITY_PLAN_PERMIT_MINIMUM_CENTS = 10_000;

/**
 * The State permit surcharge, N.J.A.C. 5:23-4.19(b) — the same amount Newark is charged, because
 * it is the same rule: $0.00371 a cubic foot of new construction and additions, $1.90 per $1,000
 * for all other construction, minimum $1.00.
 */
export const JERSEY_CITY_STATE_SURCHARGE_PER_CUBIC_FOOT = { numerator: 371, denominator: 1_000 };
export const JERSEY_CITY_STATE_SURCHARGE_CENTS_PER_THOUSAND = 190;
export const JERSEY_CITY_STATE_SURCHARGE_MINIMUM_CENTS = 100;

const CODE = JERSEY_CITY_CODE_SOURCE_KEY;
const STATE = JERSEY_CITY_STATE_UCC_SOURCE_KEY;

function jerseyCityRule(
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
    effectiveFrom: JERSEY_CITY_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId: CODE,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Building permits — §160-1 M(1)                                             */
/* -------------------------------------------------------------------------- */

/**
 * New construction, at the rate most use groups pay: $0.027 a cubic foot.
 *
 * The rate is stored as the exact fraction 27/10 cents because $0.027 is not a whole number of
 * cents, and rounding it to three cents before multiplying would move every Jersey City building
 * permit by 11% — a 100,000 cubic foot building would be $3,000.00 instead of $2,700.00.
 */
export const JERSEY_CITY_BUILDING_NEW_GENERAL: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-bld-new-general",
  code: "BLD-NEW-PER-CF-0-027",
  label: "Building permit — new construction, $0.027 per cubic foot",
  description:
    "§160-1 M(1)(a): \"Fees for new construction shall be based upon the volume of the structure. Volume shall be computed in accordance with N.J.A.C. 5:23-2.28. The new construction fee shall be in the amount of $.027 per cubic foot of volume for buildings and structures of all use groups\", except for the use groups listed in the row above at $0.15. Stored as 27/10 cents a cubic foot so the arithmetic is exact.",
  feeType: "percent",
  config: {
    basis: "cubic_footage",
    rate: JERSEY_CITY_PER_CUBIC_FOOT_GENERAL,
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [
      { field: "custom.use_group", op: "exists" },
      { field: "custom.use_group", op: "not_in", value: [...JERSEY_CITY_HIGH_RATE_USE_GROUPS] },
      { not: { field: "custom.building_alteration", op: "eq", value: true } },
    ],
  },
});

/**
 * The exception, which is the expensive one: $0.15 a cubic foot — five and a half times the
 * general rate — for assembly and storage-and-factory groups.
 *
 * The list is printed as "A-1, A-2, A-2, A-4, A-5, F-1, F-2, S-1 and S-2": A-2 twice and A-3
 * absent. The page says so rather than silently reading one of the two A-2s as an A-3, and this
 * rule matches the printed list.
 */
export const JERSEY_CITY_BUILDING_NEW_HIGH: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-bld-new-high",
  code: "BLD-NEW-PER-CF-0-15",
  label: "Building permit — new construction, $0.15 per cubic foot",
  description:
    "§160-1 M(1)(a): \"the fee shall be $0.15 per cubic foot of volume for use groups A-1, A-2, A-2, A-4, A-5, F-1, F-2, S-1 and S-2\". The list prints A-2 twice and does not name A-3; this rule matches the list as printed, so an A-3 building is charged the general $0.027 rate here.",
  feeType: "percent",
  config: {
    basis: "cubic_footage",
    rate: JERSEY_CITY_PER_CUBIC_FOOT_HIGH,
    rateUnit: "currency_per_unit",
  },
  conditions: {
    all: [
      { field: "custom.use_group", op: "in", value: [...JERSEY_CITY_HIGH_RATE_USE_GROUPS] },
      { not: { field: "custom.building_alteration", op: "eq", value: true } },
    ],
  },
});

/** M(1)(b): "For renovations, alterations and repairs, for each one thousand dollars ($1,000.00)
 * of estimated cost of work: $15." One rate, unlike Newark's graduating table. */
export const JERSEY_CITY_BUILDING_ALTERATION: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-bld-alteration",
  code: "BLD-ALTERATION",
  label: "Building permit — renovation, alteration or repair, $15 per $1,000",
  description:
    "§160-1 M(1)(b): \"For renovations, alterations and repairs, for each one thousand dollars ($1,000.00) of estimated cost of work: $15.\" M(1)(e) adds that a permit combining new construction, an addition and alterations is the sum of the fees computed separately.",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: JERSEY_CITY_CENTS_PER_THOUSAND_ALTERATION },
  conditions: { field: "custom.building_alteration", op: "eq", value: true },
});

/**
 * The two published floors on alteration work: $50 for a *short permit* and $100 for a *plan
 * permit*.
 *
 * They are alternatives rather than a ladder, which is how they are modelled: one fact says
 * whether the application is filed with plans, and exactly one of the two floors can apply. Both
 * are measured against the fee the permit has already calculated, so a short permit with $900 of
 * fee pays its $900 and only a small job reaches the floor.
 */
export const JERSEY_CITY_BUILDING_MINIMUMS: FeeRuleRecord[] = [
  jerseyCityRule({
    id: "jersey-city-bld-minimum-short-50",
    code: "BLD-MINIMUM-SHORT-50",
    label: "Minimum fee, short permit for renovations, alterations or repairs, $50.00",
    description:
      "§160-1 M(1)(c): \"Minimum fee for short permit for renovations, alterations or repairs: $50.\" Charged as the shortfall when the permit's own rows come to less, and applies to alteration work only — M(1)(a)'s new-construction fee is not floored by it.",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: JERSEY_CITY_SHORT_PERMIT_MINIMUM_CENTS },
    conditions: {
      all: [
        { field: "custom.building_alteration", op: "eq", value: true },
        { not: { field: "custom.plan_permit", op: "eq", value: true } },
      ],
    },
    priority: 150,
  }),
  jerseyCityRule({
    id: "jersey-city-bld-minimum-plan-100",
    code: "BLD-MINIMUM-PLAN-100",
    label: "Minimum fee, plan permit for renovations, alterations and repairs, $100.00",
    description:
      "§160-1 M(1)(d): \"Minimum fee for plan permit for renovations, alterations and repairs: $100.\" The higher of the two published alteration floors, and the one that applies when a plan is filed with the application.",
    feeType: "permit_minimum",
    config: { basis: "permit_fee", floorCents: JERSEY_CITY_PLAN_PERMIT_MINIMUM_CENTS },
    conditions: {
      all: [
        { field: "custom.building_alteration", op: "eq", value: true },
        { field: "custom.plan_permit", op: "eq", value: true },
      ],
    },
    priority: 150,
  }),
];

/** The State's surcharge on new construction, at the State's current amount. */
export const JERSEY_CITY_STATE_SURCHARGE_NEW: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-bld-state-surcharge-new",
  code: "BLD-STATE-SURCHARGE-NEW",
  label: "New Jersey State permit surcharge, $0.00371 per cubic foot",
  description:
    "N.J.A.C. 5:23-4.19(b): $0.00371 per cubic foot of new buildings and additions, minimum $1.00, collected by the enforcing agency and forwarded to the Division of Codes and Standards. §160-1 M(1)(g) prints the same fee as \"$0.00265 per cubic foot volume of new construction\" — the State's pre-1995 amount — and the code says in terms that \"certain fees ... are set by the State of New Jersey\" and that changes to them \"will be incorporated herein by reference\".",
  componentType: "state_surcharge",
  feeType: "percent",
  config: {
    basis: "cubic_footage",
    rate: JERSEY_CITY_STATE_SURCHARGE_PER_CUBIC_FOOT,
    rateUnit: "currency_per_unit",
  },
  minimumCents: JERSEY_CITY_STATE_SURCHARGE_MINIMUM_CENTS,
  conditions: {
    all: [
      { field: "custom.use_group", op: "exists" },
      { not: { field: "custom.building_alteration", op: "eq", value: true } },
    ],
  },
  sourceId: STATE,
  priority: 900,
});

/** ... and on everything else, which is $1.90 per $1,000 of the value of the work. */
export const JERSEY_CITY_STATE_SURCHARGE_ALTERATION: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-bld-state-surcharge-alteration",
  code: "BLD-STATE-SURCHARGE-ALTERATION",
  label: "New Jersey State permit surcharge, $1.90 per $1,000",
  description:
    "N.J.A.C. 5:23-4.19(b): \"The fee for all other construction shall be $1.90 per $1,000 of value of construction\", minimum $1.00. §160-1 M(1)(g) prints it as \"$0.00135 of cost of construction for alterations, renovations, and repairs\" and the code states that State-set fees are incorporated by reference as the State changes them.",
  componentType: "state_surcharge",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: JERSEY_CITY_STATE_SURCHARGE_CENTS_PER_THOUSAND },
  minimumCents: JERSEY_CITY_STATE_SURCHARGE_MINIMUM_CENTS,
  conditions: { field: "custom.building_alteration", op: "eq", value: true },
  sourceId: STATE,
  priority: 900,
});

export const JERSEY_CITY_BUILDING_BASE_RULES: FeeRuleRecord[] = [
  JERSEY_CITY_BUILDING_NEW_GENERAL,
  JERSEY_CITY_BUILDING_NEW_HIGH,
  JERSEY_CITY_BUILDING_ALTERATION,
  ...JERSEY_CITY_BUILDING_MINIMUMS,
  JERSEY_CITY_STATE_SURCHARGE_NEW,
  JERSEY_CITY_STATE_SURCHARGE_ALTERATION,
];

/* -------------------------------------------------------------------------- */
/* Electrical permits — §160-1 M(3)                                           */
/* -------------------------------------------------------------------------- */

/**
 * "For the first block consisting of one to ten (10) receptacles, fixtures, or devices, the fee
 * shall be twenty-five dollars ($25.00); for each additional block consisting of up to
 * twenty-five (25) receptacles, fixtures, or devices, the fee shall be twenty-five dollars
 * ($25.00)."
 *
 * A block row on both sides of the allowance: the eleventh receptacle buys a whole block of
 * twenty-five at $25.00, so 11 devices cost $50.00 and 35 cost $50.00 and 36 cost $75.00. The
 * rate is stored as 100 cents a device with a block of 25, which is what makes a block $25.00.
 *
 * The list of things counted is unusually long and the schedule prints it: lighting fixtures,
 * wall switches, convenience receptacles, sensors, dimmers, alarm devices, smoke and heat
 * detectors, communications outlets, light standards eight feet or less, emergency lights,
 * electric signs, exit lights, and any similar fixture rated twenty amperes or less including
 * motors under one horsepower or one kilowatt.
 */
export const JERSEY_CITY_ELECTRICAL_BLOCK: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-elec-block",
  code: "ELEC-RECEPTACLES-AND-DEVICES",
  label: "Electrical permit — receptacles, fixtures and devices, in blocks of twenty-five",
  description:
    '§160-1 M(3)(a): "For the first block consisting of one to ten (10) receptacles, fixtures, or devices, the fee shall be twenty-five dollars ($25.00); for each additional block consisting of up to twenty-five (25) receptacles, fixtures, or devices, the fee shall be twenty-five dollars ($25.00)." The counted items include lighting fixtures, wall switches, convenience receptacles, sensors, dimmers, alarm devices, smoke and heat detectors, communications outlets, light standards eight feet or less, emergency and exit lights, and devices rated twenty amperes or less including motors under one horsepower.',
  feeType: "per_unit",
  config: {
    unit: "outlets",
    baseCents: 2_500,
    thresholdUnits: 10,
    centsPerUnit: 100,
    incrementUnits: 25,
  },
});

/** M(3)(f): a permanently installed private swimming pool, spa, hot tub or fountain, flat $46.00. */
export const JERSEY_CITY_ELECTRICAL_POOL: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-elec-pool",
  code: "ELEC-POOL",
  label: "Electrical permit — private swimming pool, spa, hot tub or fountain, $46.00",
  description:
    "§160-1 M(3)(f): \"The fee charged for electrical work for each permanently installed private swimming pool as defined in the building subcode, spa, hot tub or fountain shall be a flat fee of forty-six dollars ($46.00) which shall include any required bonding, and associated equipment such as filter pumps, motors, disconnecting means, switches, required receptacles, and heaters, etc., except panel boards and under-water lighting fixtures.\" A public pool is charged on the device counts instead.",
  feeType: "flat",
  config: { amountCents: 4_600 },
  conditions: { field: "custom.private_pool", op: "eq", value: true },
});

/**
 * M(3)(g): smoke and heat detectors and alarm systems in a one- or two-family dwelling, $23.00 per
 * dwelling unit.
 */
export const JERSEY_CITY_ELECTRICAL_ALARM_PER_DWELLING: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-elec-alarm-per-dwelling",
  code: "ELEC-ALARM-PER-DWELLING",
  label: "Electrical permit — detectors and alarm systems in a one- or two-family dwelling, $23.00 a unit",
  description:
    "§160-1 M(3)(g): \"The fee charged for the installation of single and multiple station smoke or heat detectors and fire, burglar or security alarm systems in any one or two-family dwelling shall be a flat fee of twenty-three dollars ($23.00) per dwelling unit.\" In any other building those devices are counted on the block row instead.",
  feeType: "per_unit",
  config: { unit: "dwelling_units", centsPerUnit: 2_300 },
  conditions: { field: "custom.dwelling_alarm_system", op: "eq", value: true },
});

/** M(3)(m): "Leak detection system shall be charged one hundred dollars ($100.00) per system." */
export const JERSEY_CITY_ELECTRICAL_LEAK_DETECTION: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-elec-leak-detection",
  code: "ELEC-LEAK-DETECTION",
  label: "Electrical permit — leak detection system, $100.00 a system",
  description:
    "§160-1 M(3)(m): \"Leak detection system shall be charged one hundred dollars ($100.00) per system.\" The fire subcode carries its own leak detection row at the same amount.",
  feeType: "flat",
  config: { amountCents: 10_000 },
  conditions: { field: "custom.leak_detection", op: "eq", value: true },
});

/** The State surcharge on electrical work — $1.90 per $1,000 of value, as on every trade. */
export const JERSEY_CITY_ELECTRICAL_STATE_SURCHARGE: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-elec-state-surcharge",
  code: "ELEC-STATE-SURCHARGE",
  label: "New Jersey State permit surcharge, $1.90 per $1,000",
  description:
    "N.J.A.C. 5:23-4.19(b): $1.90 per $1,000 of the value of construction, minimum $1.00, for construction that is not a new building or an addition.",
  componentType: "state_surcharge",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: JERSEY_CITY_STATE_SURCHARGE_CENTS_PER_THOUSAND },
  minimumCents: JERSEY_CITY_STATE_SURCHARGE_MINIMUM_CENTS,
  conditions: { field: "valuation", op: "gt", value: 0 },
  sourceId: STATE,
  priority: 900,
});

export const JERSEY_CITY_ELECTRICAL_BASE_RULES: FeeRuleRecord[] = [
  JERSEY_CITY_ELECTRICAL_BLOCK,
  JERSEY_CITY_ELECTRICAL_POOL,
  JERSEY_CITY_ELECTRICAL_ALARM_PER_DWELLING,
  JERSEY_CITY_ELECTRICAL_LEAK_DETECTION,
  JERSEY_CITY_ELECTRICAL_STATE_SURCHARGE,
];

/* -------------------------------------------------------------------------- */
/* Plumbing permits — §160-1 M(2)                                             */
/* -------------------------------------------------------------------------- */

/**
 * "Plumbing fixtures: $10.00. Included but not limited to: water closet, urinal, bidet, bathtub,
 * lavatory, shower, floor drain, sink, dishwasher, drinking fountain, washing machine hose bib,
 * closet bend, coffee maker, gas appliance, gas service connection, ice maker, rain leader, roof
 * drain, sprinkler head, sump pump, trap prime, washing machine tray, yard drain."
 *
 * One rate, and a list long enough that it is the schedule's answer to most plumbing work. M(2)(c)
 * then names another twenty-odd fittings at the same $10.00, so the row is the ordinary price of
 * plumbing work in Jersey City; the devices with prices of their own are the ones in the menu
 * above it.
 */
export const JERSEY_CITY_PLUMBING_FIXTURES: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-plumb-fixtures",
  code: "PLUMB-FIXTURES",
  label: "Plumbing permit — fixtures and fittings, $10.00 each",
  description:
    "§160-1 M(2)(a): \"Plumbing fixtures: $10.00. Included but not limited to: water closet, urinal, bidet, bathtub, lavatory, shower, floor drain, sink, dishwasher, drinking fountain, washing machine hose bib, closet bend, coffee maker, gas appliance, gas service connection, ice maker, rain leader, roof drain, sprinkler head, sump pump, trap prime, washing machine tray, yard drain.\" M(2)(c) prices a further list of fittings — closet bends, coffee makers, gas appliances, ice makers, rain leaders, roof drains, sprinkler heads, sump pumps, trap primers, washing machine trays and yard drains — at the same $10.00, so one rate covers the ordinary plumbing work and the devices with prices of their own are the menu in M(2)(b) and the second half of M(2)(c).",
  feeType: "per_unit",
  config: { unit: "fixtures", centsPerUnit: 1_000 },
});

/**
 * M(2)(d): the back flow cross connection, $300.00, "which includes 3 external and 1 internal
 * inspection".
 *
 * A device's own charge rather than a permit-level fee, and it sits on top of the fixture count:
 * the domestic back flow preventer is $10.00 on the menu and the cross connection it belongs to
 * is charged here.
 */
export const JERSEY_CITY_PLUMBING_BACKFLOW_CROSS_CONNECTION: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-plumb-backflow-cross-connection",
  code: "PLUMB-BACKFLOW-CROSS-CONNECTION",
  label: "Plumbing permit — back flow cross connection, $300.00",
  description:
    "§160-1 M(2)(d): \"Back flow cross connection: [1] Three hundred dollars ($300.00), which includes 3 external and 1 internal inspection.\" A charge for the cross connection itself rather than for a device count, and it is in addition to the $10.00 the domestic back flow preventer costs on the M(2)(b) menu.",
  feeType: "flat",
  config: { amountCents: 30_000 },
  conditions: { field: "custom.backflow_cross_connection", op: "eq", value: true },
});

/** The State surcharge on plumbing work — $1.90 per $1,000 of value, as on every trade. */
export const JERSEY_CITY_PLUMBING_STATE_SURCHARGE: FeeRuleRecord = jerseyCityRule({
  id: "jersey-city-plumb-state-surcharge",
  code: "PLUMB-STATE-SURCHARGE",
  label: "New Jersey State permit surcharge, $1.90 per $1,000",
  description:
    "N.J.A.C. 5:23-4.19(b): $1.90 per $1,000 of the value of construction, minimum $1.00. Jersey City's §160-1 M(1)(g) prints the same State fee as \"$0.00135 of cost of construction\", the State's pre-1995 rate, and the code says State-set fees are incorporated by reference as they change.",
  componentType: "state_surcharge",
  feeType: "per_thousand",
  config: { basis: "valuation", centsPerThousand: JERSEY_CITY_STATE_SURCHARGE_CENTS_PER_THOUSAND },
  minimumCents: JERSEY_CITY_STATE_SURCHARGE_MINIMUM_CENTS,
  conditions: { field: "valuation", op: "gt", value: 0 },
  sourceId: STATE,
  priority: 900,
});

export const JERSEY_CITY_PLUMBING_BASE_RULES: FeeRuleRecord[] = [
  JERSEY_CITY_PLUMBING_FIXTURES,
  JERSEY_CITY_PLUMBING_BACKFLOW_CROSS_CONNECTION,
  JERSEY_CITY_PLUMBING_STATE_SURCHARGE,
];
