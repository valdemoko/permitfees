/**
 * Types for the fee calculation engine.
 *
 * This module is PURE: it imports nothing from the database, the environment, or
 * the network. That is what makes the engine testable in isolation and makes a
 * financial regression impossible to hide.
 *
 * See CALCULATION_ENGINE.md for the design rationale.
 */

/* -------------------------------------------------------------------------- */
/* Enumerations                                                               */
/* -------------------------------------------------------------------------- */

export const FEE_TYPES = [
  "flat",
  "percent",
  "per_thousand",
  "tiered_marginal",
  "tiered_table",
  "per_unit",
  "permit_minimum",
] as const;
export type FeeType = (typeof FEE_TYPES)[number];

export const FEE_COMPONENT_TYPES = [
  "base",
  "plan_review",
  "technology",
  "inspection",
  "surcharge",
  "state_surcharge",
  "other",
] as const;
export type FeeComponentType = (typeof FEE_COMPONENT_TYPES)[number];

/**
 * What a fee can be computed from. `valuation` is always in CENTS.
 * The two area bases are in square feet; `units` and `fixtures` are counts.
 *
 * Two of these are not what they look like:
 *
 *   - `covered_square_footage` is a **second area**, not a synonym for the first.
 *     Many US schedules price a building by how much of it is conditioned rather
 *     than by one total: the City of Scottsdale charges $0.94 per sq ft of "livable
 *     area with A/C" **plus** $0.54 per sq ft of "covered area (non A/C)", and plan
 *     review repeats the pair at $0.54 and $0.34. Sharing `square_footage` between
 *     the two would charge one entered number twice, at two different rates.
 *   - `permit_fee` is not an input a reader supplies at all but an amount the
 *     engine has already computed in the same run. It exists because a very common
 *     US pattern is to price one component as a percentage of another — Phoenix
 *     charges plan review as "80% of the permit fee, minimum $195" — and expressing
 *     that as a scaled copy of the permit table would duplicate the rates and let
 *     the two drift apart. See `calculatePermitFees` in `engine.ts` for exactly what
 *     it resolves to and the two rules that keep it from misfiring.
 */
export const FEE_BASES = [
  "valuation",
  "square_footage",
  "covered_square_footage",
  // Building volume in cubic feet. Added for New Jersey, where it is not a local
  // convention but the State's own model: N.J.A.C. 5:23-4.18(c) says "the basic
  // construction fee shall be computed on the basis of the volume of the building or,
  // in the case of alterations, the estimated construction cost", and Newark and
  // Jersey City both price new construction at so many cents a cubic foot ($0.02 to
  // $0.03 in Newark by use group, $0.027 in Jersey City with $0.15 for the high-hazard
  // groups). It is a third measurement next to the two areas rather than a second name
  // for one of them — a reader who knows their square footage does not know their
  // volume, and charging the area rate against an area would be a different fee.
  "cubic_footage",
  "units",
  "fixtures",
  // Amperes of service, for the schedules that price electrical work by the size of
  // the service rather than by the fixtures on it. Added for Florida, where
  // Miami-Dade charges "$7.26 for each 100 amp. or fractional part" of the total
  // service amperage — a rate per hundred amperes, which is a measurement no other
  // basis names.
  "amperage",
  // Active electrical circuits. Added for Fort Smith, Arkansas, whose electrical
  // schedule prices a permit "based on the number of active circuits installed under
  // any one permit" at a per-circuit rate that steps down by band ($5.50 for circuits
  // 1–4 to $3.50 for 43 and over) — a marginal rate over a count, which is a basis
  // shaped like `amperage` (a measurement the applicant supplies) rather than like
  // `per_unit` (a flat amount per item). `circuits` already existed as a per-unit kind
  // for schedules that price each circuit flat; that kind reads `custom.circuits`, so
  // the basis and the kind address one fact with one name.
  "circuits",
  // A run of pipe, wire or leaders, measured in feet. Added for Minneapolis, whose
  // plumbing sheet prices water distribution at "$41.40 per 100 lineal feet or fraction
  // thereof" — a block rate whose per-foot rate is fractional (41.4¢), which neither the
  // per-unit kinds nor a whole-cent rate tier can hold. It reads the same
  // `custom.linear_feet` fact the `linear_feet` per-unit kind reads, so a run is one
  // input however a schedule prices it.
  "linear_feet",
  // Construction factor — Springfield's proxy for valuation. Added for Missouri,
  // where Springfield defines Construction Factor = Gross Area (sq ft) × 85 × Type
  // of Construction Factor (from the 2009 IBC Fee Calculation Data matrix). The
  // permit fee is then a marginal table on that factor: 0.005 / 0.004 / 0.003 /
  // 0.0015 commercial and 0.004 / 0.003 / 0.002 / 0.001 residential.
  "construction_factor",
  "permit_fee",
  "fee_subtotal",
] as const;
export type FeeBasis = (typeof FEE_BASES)[number];

/**
 * Fact key each basis reads from, so conditions and rules address the same
 * namespace.
 *
 * `permit_fee` and `fee_subtotal` read keys the engine injects rather than ones
 * `buildFacts` produces. Both are sums of components computed in this run, and
 * both are only defined once the components they sum have been evaluated:
 *
 *   - `permit_fee` is the sum of this run's **base** components, which is what a
 *     schedule means by "the calculated permit fee";
 *   - `fee_subtotal` is the sum of **every** component computed so far, of any
 *     component type. Chicago's and Seattle's surcharges are written that way —
 *     "a technology fee will be applied in addition to all listed fees ... in the
 *     amount of five percent of all fees or charges required" — and no amount of
 *     adding one percentage per component reproduces a percentage of the total
 *     once a component's own type or order changes.
 */
export const BASIS_FACT_KEYS: Record<FeeBasis, string> = {
  valuation: "valuation",
  square_footage: "square_footage",
  // The second area has no first-class column, so it reads a custom fact — which
  // is also what keeps the two areas from ever being confused for one another.
  covered_square_footage: "custom.covered_square_footage",
  // Volume, like the second area, reads a custom fact: the same choice, for the same
  // reason. `cubic_footage` and `square_footage` are two different measurements of one
  // building and must never be able to address one another.
  cubic_footage: "custom.cubic_footage",
  units: "units",
  fixtures: "fixtures",
  linear_feet: "custom.linear_feet",
  // Amperage has no first-class column either, and it is read and set under the same
  // `custom.amperage` key a condition tests, so a schedule's amperage is one fact with
  // one name wherever it is addressed. Two jurisdictions in this dataset price
  // electrical work by it — Orange County, Florida bands it, and Miami-Dade charges a
  // rate for each hundred amperes — and neither number is the amperage of a fixture.
  amperage: "custom.amperage",
  // Active circuits read the same `custom.circuits` fact the `circuits` per-unit kind
  // reads, for the same one-fact-one-name reason: Fort Smith's ladder charges a rate
  // per circuit in band, while other schedules charge a flat amount per circuit, and
  // both must address the same entered count.
  circuits: "custom.circuits",
  construction_factor: "custom.construction_factor",
  permit_fee: "permit_fee",
  fee_subtotal: "fee_subtotal",
};

/**
 * Countable things a schedule can price.
 *
 * Each kind maps to its own fact key (see `PER_UNIT_FACT_KEYS` in the engine), so
 * two rules can never accidentally read each other's input. That is why "sewer
 * connections" is its own kind rather than reusing "fixtures": a contractor
 * entering 3 fixtures must not be charged for 3 sewer connections.
 *
 * Extending this list is additive and needs no migration, because a rule's
 * `config` is JSONB.
 *
 * Two kinds were added after the first Houston transcription, because sharing an
 * existing kind was wrong in both cases and the error would have surfaced on a
 * published page:
 *
 *   - `outlets`: Houston's electrical outlet row (§118.6.1) was reading
 *     `fixtures`, the plumbing namespace. The amount happened to match, but the
 *     breakdown would have described 40 outlets as 40 fixtures, and an
 *     electrical rule and a plumbing rule were addressing the same input.
 *   - `septic_tanks`: §118.5.4 was reading `openings`, the count §118.5.3 (yard
 *     light or BBQ grill) reads. Neither rule was charged in fact — §118.5.3 was
 *     transcribed but never attached to a permit type — so no reader was billed
 *     twice. The collision was latent: linking §118.5.3, which the plumbing page
 *     already describes, would have charged one count of "1 opening" as both a
 *     yard light and a septic tank.
 */
export const PER_UNIT_KINDS = [
  "dwelling_units",
  "fixtures",
  "circuits",
  "panels",
  "signs",
  "stories",
  "inspections",
  "furnaces",
  "heaters",
  "openings",
  "connections",
  "tons",
  "lighting_fixtures",
  "outlets",
  "septic_tanks",
  /**
   * Trades on a permit. Added for Dallas, whose schedule prices construction
   * trade inspection as a function of *how many trades* the job involves — $125
   * for one, stepping to $1,125 at nine or more — rather than of which trade.
   * `inspections` already existed for Houston's re-inspection row; sharing it
   * would have charged one count as two different fees.
   */
  "trades",
  /**
   * Utility meters. Added for Phoenix, which prices "each additional meter per
   * utility" at $98 once the first meter of each type is included in the permit
   * fee. Its own kind rather than `connections`, which is Houston's sewer
   * connections: a house with three water meters and no new sewer connection must
   * not be charged for three connections.
   */
  "meters",
  /**
   * Backflow prevention devices. Added for Phoenix, which charges $195 for the
   * first and $98 for each one after it — a base-plus-allowance per-unit shape, and
   * a plumbing device with nothing in common with a fixture count. Sharing
   * `fixtures` would have charged six fixtures for six backflow devices.
   */
  "backflow_devices",
  /**
   * Low-voltage points. Added for Clark County, whose electrical table charges
   * "$0.45 — for signals, alarms, or television outlets, control panels, telephones,
   * switchboards, each". Half of that list is not an outlet, so `outlets` — Houston's
   * electrical count — would have described a switchboard as an outlet and made two
   * jurisdictions read one number. `panels` already meant an electrical panel, which
   * is what Clark County's subpanel row charges, so that one is shared.
   */
  "low_voltage_points",
  /**
   * Special plumbing devices. Added for Newark, whose plumbing subcode charges "$75 per
   * special device" for one published list — grease traps, oil separators, refrigeration
   * units, utility service connections, backflow preventers equipped with test ports,
   * steam and hot water boilers, active solar systems, sewer pumps and interceptors. The
   * schedule's own phrase is "special device", and the kind is that phrase: they share a
   * price because the document gives them one, which is the opposite of the reason the
   * other kinds are separate.
   */
  "special_devices",
  /**
   * Bathrooms (and kitchens). Added for Portland, whose plumbing schedule prices a new
   * one- or two-family dwelling by *how many baths it has* — $792 for one bath, $1,187 for
   * two, $1,388 for three and $334 for each additional bath or kitchen — and then prices
   * every individual fixture at $63 for work that is not a new dwelling. Sharing `fixtures`
   * would have charged a two-bath house as two $63 fixtures, which is a different question
   * with a different answer.
   */
  "bathrooms",
  /**
   * Blended electrical permit units. Added for New York City, whose rule prices
   * "each outlet, each fixture, each horsepower … each kilowatt … each kilovolt-ampere
   * … shall be assigned the value of one unit" (1 RCNY §101-03) — six different
   * quantities the schedule itself adds into one count, with the first ten units free
   * and each unit after that at $0.25. Sharing `outlets` would have called a
   * transformer an outlet; six new kinds would have refused the schedule's own sum.
   */
  "electrical_units",
  /**
   * Linear feet. Added for Buffalo, whose plumbing sheet prices underground piping in
   * "per additional 100 linear feet" segments after the first 100 feet. No area basis
   * reads a run of pipe, and charging it as fixtures or connections would bill a
   * 300-foot trench as three plumbing fixtures.
   */
  "linear_feet",
  /**
   * Fire sprinkler heads. Added for Green Bay, whose plumbing schedule prices a fire
   * suppression system at "$2.50 per head ($70.00 minimum, increased per head, up to
   * $200.00)" — the first per-unit row in the dataset that publishes both a floor and a
   * ceiling, which the rule carries as `minimumCents` and `maximumCents`. Heads are not
   * `openings` (Houston's yard lights and septic tank openings) and not `fixtures`: a
   * sprinkler head is a fire-protection device on its own row, and every other kind that
   * could hold the count describes something the schedule does not.
   */
  "sprinkler_heads",
  /**
   * Air conditioning units. Added for Green Bay, whose electrical and mechanical schedules
   * price an "Air conditioning addition" at a flat amount *per unit* — $75.00 in a one- or
   * two-family dwelling, $100.00 in multi-family and commercial — rather than by tonnage.
   * `tons` already meant tons of cooling, which is a different question: a 3-ton and a
   * 5-ton replacement are one unit each here, so sharing `tons` would bill the larger
   * machine as more units than the schedule charges for.
   */
  "ac_units",
  /**
   * Electrical services. Added for Green Bay, whose multi-family electrical section splits
   * its service row in two — "Electrical service — initial $100.00; Electrical service —
   * each additional $50.00" — a base-plus-additional shape over a count of services. No
   * existing kind held it: `amperage` is the size of one service, not how many the
   * application has, and `connections` is Houston's sewer connections.
   */
  "electrical_services",
  /**
   * Water units. Added for Saint Paul, whose plumbing table prices a permit as "$92 initial
   * permit fee" plus three separate per-unit rows: "Per unit - Plumbing $36", "Per unit -
   * Water $6" and "Per unit - Gas $34". The three counts are the schedule's own division of
   * a plumbing job, so each is its own kind: `fixtures` already meant plumbing units, and
   * reading a water heater's count as fixtures would bill the plumbing row twice and the
   * water row not at all.
   */
  "water_units",
  /**
   * Gas units. Added for Saint Paul's plumbing table, beside `water_units` and for the same
   * reason: "Per unit - Gas $34" counts gas appliances, which are neither fixtures nor
   * water units, and the schedule prices all three at once.
   */
  "gas_units",
  /**
   * Hundred-thousand-BTU blocks. Added for Saint Paul, whose plumbing table adds "If unit
   * BTU's greater than 100,000, additional fee for each 100,000 BTU's or fraction thereof
   * $15" — a charge on a *unit's rated capacity*, above an allowance of the first block,
   * rather than on how many units there are. `heaters` counts appliances and would charge
   * one large boiler as several; the row's own unit is the 100,000 BTU block.
   */
  "btu_blocks",
  /**
   * Power devices. Added for Saint Paul, whose electrical page prices capacitors, generators
   * and transformers together: "Per unit installed $54.00" with "$1.00 for KVA or KVAR; or
   * fraction thereof". A generator is not a panel (`panels`), not a service
   * (`electrical_services`) and not a circuit: it is the equipment the row names, and
   * charging one count as another would describe the wrong machine in the breakdown.
   */
  "power_devices",
  /**
   * Kilovolt-amperes. Added for Saint Paul's capacitor/generator/transformer row, whose
   * capacity charge is "$1.00 for KVA or KVAR; or fraction thereof" — a second, independent
   * count on the same permit as the devices themselves. `amperage` is a service's size in
   * amps, a different quantity in a different unit.
   */
  "kilovolt_amperes",
  /**
   * Kilowatts. Added for Saint Paul's solar photovoltaic table, which selects the permit fee
   * from the system's capacity ("0-20 kW System $138.00", "21-40 kW System $332.00") and
   * then charges "$315, plus $3.00 for every kW above 40 kW". `tons` is cooling capacity and
   * no other kind measures a generator's or array's size in kilowatts.
   */
  "kilowatts",
  /**
   * Building drains. Added for Nashville, whose plumbing table prices "Each additional building
   * drain ... $32.00" beside its fixture, connection and septic rows. A building drain is the
   * horizontal run carrying the building's waste to the sewer: not a fixture (`fixtures`), not
   * the sewer connection itself (`connections`) and not a run of pipe measured in feet
   * (`linear_feet`), so it is the row's own count.
   */
  "building_drains",
  /**
   * Water service connections. Added for Nashville, whose plumbing table prices "Water service
   * connection ... $80.00" on the row under "Sewer connection ... $80.00". One price, two
   * counts: a building adds one of each, and sharing `connections` would charge whichever the
   * applicant entered as both a sewer and a water service.
   */
  "water_service_connections",
  /**
   * Horsepower of machinery. Added for South Bend, whose electrical sheet prices motive
   * equipment on the machinery itself rather than on how many machines there are: "Horsepower
   * (machinery): First hp $7.00; Each additional hp $0.25". A horsepower is a capacity, like
   * `kilowatts` and `kilovolt_amperes`, but it is a different quantity in a different unit —
   * a 20 hp motor is neither 20 kW nor 20 kVA — and the row's own first-unit allowance makes
   * it the count the rate is applied to.
   */
  "horsepower",
  /**
   * Temporary electrical services. Added for South Bend, whose electrical sheet prices
   * "Temporary Services (All amperage) $7.00" as a row of its own. A temporary service is a
   * service with no permanent load behind it: charging it on `electrical_services` would
   * describe it in the permanent service's own row, and the two are separate lines on the
   * same sheet precisely so that a job-site service is not priced as the building's.
   */
  "temporary_services",
  /**
   * Reconnections — an electrical service reset, relocation or reconnect, or a gas service
   * reconnection. Added for South Bend, whose two sheets carry the row under the same word:
   * "Reset, Relocation, and Reconnect, each $60.00" on the electrical page and "Gas
   * Reconnection, each $60.00" on the plumbing page. The count is per occurrence rather than
   * per service, per circuit or per appliance: moving a meter a foot is one reconnection on a
   * service that is otherwise unchanged, and the two rows never appear on one permit because
   * the permit type is what separates them.
   */
  "reconnections",
  /**
   * Trailer-park sewer connections. Added for South Bend, whose plumbing table prices
   * "Trailer Park Sewer, each $10.00" beside its building-sewer row. A trailer-park sewer is a
   * sewer connection at a lot pedestal rather than a building sewer (`connections`), and the
   * two rows carry different prices, so sharing the count would charge whichever the applicant
   * entered as both.
   */
  "trailer_park_sewers",
  /**
   * Grease interceptors and other industrial waste pretreatment devices. Added for South Bend,
   * whose plumbing table prices "Industrial waste pretreatment interception, including its trap
   * and vent, excepting kitchen-type grease interceptors functioning as fixture traps, each" —
   * a device that is explicitly *not* a fixture on the same table, and priced on its own row,
   * so charging it as `fixtures` would bill it twice and describe it wrongly.
   */
  "grease_interceptors",
  /**
   * Drywells. Added for South Bend, whose plumbing table prices "Drywells, each $12.00". A
   * drywell is a soakage pit, not a septic tank (`septic_tanks`) and not a drain inside the
   * building (`building_drains`): the sheet lists all three on separate rows.
   */
  "drywells",
  /**
   * Gas tanks and pumps. Added for South Bend, whose plumbing table prices "Gas tanks and
   * pumps $12.00". A tank that stores gas on site is not a gas unit (`gas_units`, a connected
   * appliance) and not a gas outlet (`outlets`): the schedule counts the equipment.
   */
  "gas_tanks",
  /**
   * Additional final inspections — the trips a job owes because a previous final inspection
   * failed. Added for South Bend, whose plumbing table prices it separately from the
   * reinspection above it: "Reinspection $60.00" and "Additional final inspection, each
   * $75.00" are two rows at two prices, so one count of `inspections` cannot carry both without
   * charging every reinspection at one of the two and describing the other wrongly. (The
   * electrical sheet prices its own pair at $60 each, and needs no second kind.)
   */
  "final_inspections",
  /**
   * Appliance circuits at one shared price point. Added for Gulfport, Mississippi,
   * whose electrical sheet's "Major Appliance Circuit" block prices a dozen named
   * appliances (refrigerator, freezer, clothes washer, disposal, compactor, attic
   * fan, self-contained commercial units, grills, fryers) at the same $10.00 each.
   * The schedule itself groups them at one price, so one count holds them all —
   * `outlets` already meant Gulfport's $6.00 group and `heaters` a plumbing count.
   */
  "appliance_circuits",
  /**
   * Lavatories. Added for Gulfport, Mississippi, whose plumbing sheet prices
   * "Lavatories $7.00" on its own row while the generic fixture row is $5.00 —
   * a price point of its own, so the count cannot share `fixtures` without
   * charging $5.00 for a $7.00 item.
   */
  "lavatories",
  /**
   * Floor drains. Added for Gulfport, Mississippi, whose plumbing sheet prices
   * "Floor Drain $7.00" and "Floor Drain with trap primer $10.00" on two rows —
   * two price points over one device, so the primed and unprimed drains are two
   * counts (`primed` drains read the same kind at the $10.00 row's own rate).
   */
  "floor_drains",
  /**
   * Water heaters at the plumbing sheet's own price point. Added for Gulfport,
   * Mississippi, whose plumbing sheet prices "Water Heater/full auto $10.00" and
   * "Water Heater/Instant $10.00" — plumbing work, not the mechanical `heaters`
   * count Fort Smith's plumbing rows use. Keeping the kind separate keeps a
   * Gulfport water heater from being charged as another jurisdiction's appliance.
   */
  "water_heaters",
  /**
   * Space-heating appliances priced per item. Added for Gulfport, Mississippi,
   * whose plumbing sheet groups "Radiant Heater, Floor Furnace, Furnace Hot air,
   * Radiator, Circulating heater" at $10.00 each — one price point over several
   * appliances, which is the schedule's own grouping.
   */
  "heating_appliances",
  /**
   * Gas service lines. Added for Gulfport, Mississippi, whose plumbing sheet
   * prices "Service line (gas lines) $10.00". `water_service_connections` is
   * Gulfport's water row ($50.00) and `connections` is Houston's sewer count:
   * neither describes a gas line.
   */
  "gas_service_lines",
  /**
   * Miscellaneous plumbing connections at their own price point. Added for
   * Gulfport, Mississippi, whose plumbing sheet prices "Other connections
   * $25.00" beside its $5.00 sewer-connection row — the schedule's own catch-all
   * for connection work neither the water ($50.00) nor the sewer ($5.00) rows
   * describe.
   */
  "other_connections",
  /**
   * Piping runs. Added for Gulfport, Mississippi, whose plumbing sheet prices
   * "Piping $5.00" as a row of its own — the work of running pipe, which is
   * neither a fixture nor a connection and would otherwise have no count.
   */
  "piping_runs",
] as const;
export type PerUnitKind = (typeof PER_UNIT_KINDS)[number];

export const FEE_RULE_STATUSES = ["draft", "active", "superseded", "archived"] as const;
export type FeeRuleStatus = (typeof FEE_RULE_STATUSES)[number];

export const OCCUPANCY_CLASSES = [
  "residential",
  "commercial",
  "industrial",
  "mixed",
  "other",
] as const;
export type OccupancyClass = (typeof OCCUPANCY_CLASSES)[number];

export const WORK_TYPES = [
  "new_construction",
  "addition",
  "remodel",
  "alteration",
  "repair",
  "replacement",
  "demolition",
  "other",
] as const;
export type WorkType = (typeof WORK_TYPES)[number];

/* -------------------------------------------------------------------------- */
/* Fee configuration                                                          */
/* -------------------------------------------------------------------------- */

/** A fee dollar amount, expressed in integer cents. */
export type FlatFeeConfig = {
  amountCents: number;
};

/**
 * A rate applied to a basis, plus the schedule's own fixed add factor when it
 * publishes one (`X 0.005095 + $1,100`).
 *
 * The rate is expressed one of two ways and the schema requires exactly one:
 *
 *   - `rateBps` — basis points, so `1.5%` is `150`. The usual case.
 *   - `rate` — an exact fraction, for a rate published with more decimals than
 *     basis points can hold. Dallas publishes `0.027665` (`276.65` bps) and, on the
 *     commercial finish-out table, `0.009285 x 1.33 = 0.01234905` (`1,234.905`
 *     bps). Rounding those to whole basis points would change published money.
 *
 * `rateUnit` says how that fraction is to be read, because the same fraction means
different things against different bases. Against a valuation, `0.027665` is a
percentage of the money. Against square footage it is an amount per square foot:
Dallas's Table A-I reads `square feet x 0.34569 + 300`, where `0.34569` is dollars
per square foot, not 34.569% of a square foot. The arithmetic is identical — the
basis is multiplied by the fraction — so this field changes only how the rate is
*said*: `2.7665%` against valuation, `$0.34569 per sq ft` against square footage.
Default is `"fraction"`.
 *
 * `incrementCents` models "each $1,000 of valuation, or fraction thereof": the
 * basis is rounded UP to the next increment before the rate is applied. Omitting
 * it means the exact basis value is used.
 */
export type ExactRateUnit = "fraction" | "currency_per_unit";

export type ExactRate = {
  numerator: number;
  denominator: number;
};

/**
 * One row of a published lookup table: the combination of fact values it is
 * keyed by, and the rate the schedule publishes for that combination.
 */
export type RateTableEntry = {
  /** One value per key, in the table's key order. */
  values: string[];
  /** The published rate for this combination, as an exact fraction. */
  rate: ExactRate;
};

/**
 * A published matrix of rates selected by facts: the shape of a fee that is a
 * *product of two lookup tables* times a basis.
 *
 * **Why this exists.** Chicago prices a building permit as
 * `CF × RF × A` (§14A-4-412.2.2.1): a construction factor read from one table
 * (occupancy class × construction type), a scope-of-review factor read from
 * another (occupancy × description of work), and the gross floor area. Neither
 * factor is a rule of its own — each depends on a different pair of facts, and
 * the fee is their *product*. Stating that as ordinary rules means one rule per
 * cell of the cross product (Chicago's two tables cross to well over a thousand
 * rows), and every one of them would be listed in the fee-structure table on the
 * page and counted as considered in the breakdown.
 *
 * So the selection lives in the config instead: each table is keyed by facts the
 * reader supplies, exactly one entry matches, and the rule's rate is the product
 * of the matched rates as exact fractions — never a pre-rounded number. A table
 * with no matching entry excludes the rule with `no_published_rate`, which is the
 * honest outcome for a combination the schedule does not publish (Chicago's
 * "Not applicable" rows).
 */
export type RateTable = {
  /** What the schedule calls this table, shown in the working: "Construction factor". */
  label?: string;
  /** Fact keys the rows are selected by, in order. `custom.*` keys are allowed. */
  keys: string[];
  /** How to read this table's own rates in prose. Defaults to `"fraction"`. */
  rateUnit?: ExactRateUnit;
  entries: RateTableEntry[];
};

/** One row of a table of published minimum fees. */
export type FloorTableEntry = {
  /** One value per key, in the table's key order. */
  values: string[];
  /**
   * A flat published minimum for this combination. A schedule that prints a
   * global floor alongside its rows — Chicago's "a minimum fee of $602 applies to
   * all permits" — states that floor here as well when it is the larger of the
   * two, so the row carries its own full literal minimum.
   */
  minimumCents?: number;
  /**
   * A minimum published *per unit* — Chicago's "$900 per story", "$250 per unit
   * served". The floor is `centsPerUnit × the fact's value`; the fact is named
   * explicitly so a per-story floor cannot read a dwelling-unit count. When a row
   * states both this and `minimumCents`, the floor is the **larger** of the two —
   * the same rule the engine applies between a row floor and the rule's own
   * `minimumCents`, because every printed minimum is a minimum.
   */
  perUnit?: { factKey: string; centsPerUnit: number };
};

/**
 * Minimum fees whose amount depends on the inputs, the way a schedule's
 * "Minimum Fee" column does: one floor per row of the same table the rates come
 * from. The floor is combined with the rule's own `minimumCents` by taking the
 * larger, so a schedule's global minimum and its row minimum can both apply.
 */
export type FloorTable = {
  /** What the schedule calls this column, shown in the working. */
  label?: string;
  keys: string[];
  entries: FloorTableEntry[];
};

export type PercentFeeConfig = {
  basis: FeeBasis;
  rateBps?: number;
  /** `rate = numerator / denominator`. Mutually exclusive with `rateBps`. */
  rate?: ExactRate;
  /** How to read `rate`. Defaults to `"fraction"`. */
  rateUnit?: ExactRateUnit;
  /**
   * Only the portion of the basis above this amount is charged. The threshold is
   * measured in the basis's own unit, as it is for `per_thousand`: money in cents
   * where the basis is money, and whole units of the basis where it is an area or a
   * count.
   *
   * **Why this exists.** Portland's electrical schedule prices a residential wiring
   * package as "1,000 square feet or less — $408.00; each additional 500 square feet
   * or portion thereof — $93.00", which is a rate with a threshold and an increment
   * — the shape `per_thousand` already had for money, and which `percent` lacked. The
   * alternative was to invent a compensating add factor ($408.00 less 1,000 square
   * feet at the published rate, which is $222.00 and appears in no document), so the
   * field was added instead and the rule reads as the schedule prints it.
   */
  thresholdCents?: number;
  /** The schedule's published add factor, charged after the rate. */
  baseCents?: number;
  /**
   * Round the chargeable portion up to the next increment ("or fraction thereof"),
   * after the threshold has been subtracted.
   *
   * With no `thresholdCents` the chargeable portion is the whole basis, so this is
   * the rounding a `percent` rule always had.
   */
  incrementCents?: number;
  /**
   * Published lookup tables whose matched rates multiply into the rule's rate.
   * Mutually exclusive with `rateBps` and `rate` — the schema requires exactly one
   * of the three — because a rate stated twice is ambiguous about which one is
   * charged. See `RateTable` for why a rule needs this at all.
   */
  rateTables?: RateTable[];
  /**
   * A published multiplier applied to the matched rates' product.
   *
   * **Why this exists.** Oak Park prices new construction as
   * `Area × CC × .0194`, where CC is read from the ICC square-foot construction cost
   * chart. The `.0194` is printed in the schedule beside the chart rather than as
   * another column of it, so it is neither a lookup nor the rule's whole rate: the
   * fee is the table's rate *times* it. Stating it here keeps the table's own cell —
   * `$218.08 per sq ft` for an R-3 Type IIIA building — visible in the working, where
   * folding the multiplier into every cell would have hidden the published figure and
   * made the schedule's own number unreproducible from the page.
   *
   * Only meaningful with `rateTables`: a constant times nothing is nothing.
   */
  rateMultiplier?: ExactRate;
  /** Published minimum fees selected by the same kind of facts as `rateTables`. */
  floorTable?: FloorTable;
};

export type MarginalTier = {
  /** Upper bound of the band, in the basis unit. `null` = no upper bound (top band). */
  upToCents: number | null;
  /**
   * Marginal rate in **basis points** of the basis, which is the form a band written
   * about money takes: "1.5% of the first $100,000, plus 1.0% of anything above".
   *
   * Mutually exclusive with `rateCentsPerUnit` and `rate`; the schema requires exactly one.
   */
  rateBps?: number;
  /**
   * Marginal rate in **whole cents per unit of the basis**, for a band measured in
   * anything other than money.
   *
   * **Why this exists.** Miami-Dade prices new buildings from area: "New Construction
   * of All Other Occupancies: for the first 100,000 square feet (per square foot)
   * $0.40; for each additional square foot over 100,000 square feet (per square foot)
   * $0.15". That is a marginal tier table — the shape `tiered_marginal` exists for —
   * but its rates are dollars per square foot, and basis points of a square foot are
   * not a unit of money: `bandWidth x rateBps / 10,000` would have multiplied 100,000
   * square feet by 40 basis points and called the answer cents. The alternative was to
   * state the first band's own product, $40,000, as a compensating base amount that
   * appears in no document — the same workaround the Portland pass refused — so the
   * tier carries its rate in the unit the schedule prints instead.
   *
   * Whole cents, because every rate of this shape in this dataset is a whole number of
   * cents per unit: `$0.40`, `$0.15`, `$0.96`, `$0.143`. A schedule that published
   * half a cent per unit would need an exact form, and the schema rejects it rather
   * than rounding it.
   */
  rateCentsPerUnit?: number;
  /**
   * Marginal rate as **cents per unit expressed exactly** — `numerator/denominator`
   * cents for each unit of the basis. For a half-cent rate that is `{1,2}`.
   *
   * **Why this exists.** Springfield, Missouri prices a building permit from a
   * *construction factor* at 0.005 / 0.004 / 0.003 / 0.0015 dollars per unit of that
   * factor (commercial) and 0.004 / 0.003 / 0.002 / 0.001 residential — 0.5, 0.4, 0.3,
   * 0.15 cents per factor. No whole-cent field can hold half a cent, and basis points
   * of a construction factor are not cents: 50 bps of 50,000 factor units is 250 cents
   * rather than 25,000. The exact form reads the rate the schedule prints (half a cent)
   * without folding a compensating factor of 100 into the basis or the threshold.
   */
  rate?: ExactRate;
  /** Optional flat amount charged for this band, added to the marginal rate. */
  bandCents?: number;
};

/**
 * Base amount plus marginal rates per band: the shape of
 * "1.5% of the first $100,000, plus 1.0% of anything above".
 */
export type TieredMarginalConfig = {
  basis: FeeBasis;
  baseCents?: number;
  incrementCents?: number;
  tiers: MarginalTier[];
};

export type TableTier = {
  /** Inclusive upper bound of the bracket. `null` = open-ended top bracket. */
  upToCents: number | null;
  /** Flat fee for any basis value that falls inside this bracket. */
  amountCents: number;
};

/**
 * A fixed amount per bracket: the "valuation range -> fee" table shape.
 * Brackets must be contiguous and strictly ascending.
 */
export type TieredTableConfig = {
  basis: FeeBasis;
  tiers: TableTier[];
};

/**
 * A rate per countable thing: dwelling units, fixtures, circuits, signs.
 *
 * `thresholdUnits` models the very common "base charge for the first N, plus X
 * for each additional unit" shape. Note the allowance is counted in UNITS here,
 * not in the hundredths-of-a-unit convention `per_thousand` uses for money: a
 * fixture is a whole fixture.
 *
 * Discovered while researching Houston: plumbing fixtures (Bldg. Code Sec.
 * 118.5.4) are "$34.24 for 1 to 3 fixtures, plus $11.41 for each additional
 * fixture". Modelling that with `per_thousand` treated the rate as "cents per
 * 1,000 fixtures" and understated a 4-fixture permit by $11.40. See
 * research/texas/houston.md section 5.3.
 */
/**
 * A floor on a whole permit, charged as the difference it makes up.
 *
 * **Why this is a fee type and not a minimum.** Every other minimum in this engine is
 * a floor on one rule's own amount — `minimumCents` on the rule record — which is right
 * when the schedule says so: Miami-Dade's building section states that its $147.00
 * minimum is "applicable to all items in this section", so a $88.55 slab permit is
 * $147.00 and a permit combining two items pays the floor once per item.
 *
 * The same county's two **trade** fee sheets state their floor the other way: "Minimum
 * fee for electrical permits is $227.90", and "Minimum fee for plumbing permits is
 * $227.90" — once per *permit*. None of the sheet's rows carries the floor, and a permit
 * is as many rows as the job has, so the floor has to be measured against the subtotal
 * of whatever else applied:
 *
 *   a 200-ampere service, sixty outlets, one panel board, forty fixtures and five tons
 *   of air conditioning total $222.78; the sheet's minimum says the permit pays $227.90
 *   — not $227.90 for each of the five rows, which is what a per-rule floor would charge.
 *
 * The amount is the **shortfall**, never the floor, so a permit that clears the floor is
 * not charged a second minimum. `$227.90` is `($147.00 + $65.00) x 1.075`, which is the
 * County's own arithmetic: the floor is $147.00, its non-refundable up-front fee is
 * added on top, and the 7.5% RER surcharge is charged on both. That is why the rules
 * that use this type read `permit_fee` — the base subtotal, before the up-front fee and
 * the surcharges — and why they sit between the base rules and the up-front fee in
 * evaluation order.
 *
 * **`basis` and `componentType` have to agree.** The engine evaluates every base
 * component before any add-on fee, so a rule that reads `permit_fee` and is declared as a
 * base component is measured before the add-on fees by construction; a schedule whose
 * floor is instead a floor on *everything charged* says `fee_subtotal` and must be
 * declared as some other component type with a later priority, or it would read a
 * subtotal the fees it is meant to include have not yet reached.
 */
export type PermitMinimumFeeConfig = {
  /** Which subtotal the floor is measured against. */
  basis: "permit_fee" | "fee_subtotal";
  /** The published minimum for the permit, in cents. */
  floorCents: number;
};

export type PerUnitFeeConfig = {
  unit: PerUnitKind;
  centsPerUnit: number;
  /** Flat amount covering the first `thresholdUnits` units. */
  baseCents?: number;
  /** Units included in `baseCents`. Only units above this are charged per unit. */
  thresholdUnits?: number;
  /**
   * The size of a block of units the schedule charges in, when the count above
   * `thresholdUnits` is rounded **up** to a whole number of blocks before the rate
   * is applied.
   *
   * **Why this exists.** New Jersey's schedules, and the State model behind them, price
   * electrical devices in blocks rather than singly. Newark writes "First 50 — $58; Each
   * additional 20 — $12", and Jersey City writes "for the first block consisting of one
   * to ten (10) receptacles, fixtures, or devices, the fee shall be twenty-five dollars
   * ($25.00); for each additional block consisting of up to twenty-five (25) receptacles,
   * fixtures, or devices, the fee shall be twenty-five dollars ($25.00)". In both rows the
   * published price is for a *block*, and a count that spills past one buys the whole next
   * block: 51 of Newark's devices is $70, not $58.60.
   *
   * It is the countable analogue of `percent.incrementCents`, and it is stored in the
   * count's own unit rather than in cents for the same reason: rounding cents and rounding
   * devices are different operations, and only the second reproduces the row.
   *
   * `centsPerUnit` stays the rate per single unit, so a $12 block of 20 is stored as 60
   * cents per unit with `incrementUnits: 20` — the rounding, not the rate, is what makes
   * the block cost $12.00.
   */
  incrementUnits?: number;
};

/**
 * A rate in the unit many US schedules actually publish:
 * "Fee for each additional $1,000 valuation or fraction thereof".
 *
 * `$5.36 per $1,000` is `centsPerThousand: 536`.
 *
 * **Why this primitive exists.** As a percentage, `$5.36 per $1,000` is `0.536%`,
 * which is 53.6 basis points — not an integer, and therefore not representable by
 * the `percent` primitive without rounding, which would make every structural fee
 * calculation in Houston wrong. Storing the published unit verbatim keeps the
 * arithmetic exact and makes the rule read the way the document reads.
 *
 * Discovered while researching Houston; see research/texas/houston.md section 5.
 */
export type PerThousandFeeConfig = {
  basis: FeeBasis;
  /** Cents per $1,000 of basis. `$5.36 per $1,000` -> `536`. */
  centsPerThousand?: number;
  /**
   * The same rate for schedules that publish more precision than a whole cent per
   * $1,000 can hold, stated as an exact fraction OF A CENT per $1,000.
   *
   * `$4.725 per $1,000` is 472.5 cents, so `{ numerator: 945, denominator: 2 }`.
   *
   * **Why this exists.** Clark County, Nevada prices its building permit from a
   * valuation table whose bands read "for the first N, plus X for each additional
   * $1,000 or fraction thereof" — and three of its six bands carry a rate that is
   * not a whole number of cents: `$4.725`, `$3.402` and `$2.934` per $1,000. Basis
   * points cannot hold those either (`47.25`), so both the basis-point and the
   * cents-per-thousand primitives would have to round *before* multiplying, and
   * every Clark County building permit above $25,000 of valuation would be wrong by
   * cents. It is the same problem Dallas created for `percent`, solved the same way,
   * rather than by publishing a rounded rate the schedule does not contain.
   *
   * Mutually exclusive with `centsPerThousand`; the schema requires exactly one.
   */
  rateCentsPerThousand?: ExactRate;
  /** Only the portion of the basis above this amount is charged. */
  thresholdCents?: number;
  /** Round the chargeable portion up to the next increment ("or fraction thereof"). */
  incrementCents?: number;
  /**
   * How the increment rounds. `"up"` (the default) is "or fraction thereof";
   * `"nearest"` answers a schedule that says "to the closest" — Tulsa's building
   * permit fee is computed in "$1,000 increments to the closest One Thousand
   * Dollars", so $40,499 buys forty steps where an always-up reading charges
   * forty-one. Requires `incrementCents`; the schema refuses it without one
   * because a rounding mode with nothing to round would silently do nothing.
   */
  incrementRounding?: "up" | "nearest";
  /** The schedule's published "Base Charge", added after the rate. */
  baseCents?: number;
};

export type FeeRuleConfig =
  | FlatFeeConfig
  | PercentFeeConfig
  | PerThousandFeeConfig
  | TieredMarginalConfig
  | TieredTableConfig
  | PerUnitFeeConfig
  | PermitMinimumFeeConfig;

/* -------------------------------------------------------------------------- */
/* Conditions                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Facts a condition can test. `valuation` is in CENTS.
 * `custom.<key>` carries jurisdiction-specific facts so a local quirk never
 * requires a schema migration.
 */
export type ConditionField =
  | "valuation"
  | "square_footage"
  | "units"
  | "fixtures"
  | "occupancy"
  | "work_type"
  | "construction_type"
  | "is_expedited"
  | "is_owner_builder"
  /**
   * The base permit fee accumulated so far, in cents — the same fact a
   * `permit_fee` basis reads, injected before every rule.
   *
   * **Why a condition needs it.** Miami-Dade's trade fee sheets state a minimum
   * for the permit as a whole: "Minimum fee for electrical permits is
   * $227.90". A floor on a permit cannot be expressed as a minimum on any one
   * rule — applying $147.00 to each of a permit's rows turns a four-row
   * application whose rows total $222.78 into $588.00 — so it is expressed as a
   * `permit_minimum` rule that only applies while the subtotal is below the
   * floor, which is what this field is for.
   */
  | "permit_fee"
  /** Every component charged so far, surcharges included, in cents. */
  | "fee_subtotal"
  /**
   * Active electrical circuits. A count the applicant supplies for schedules that
   * price electrical work by how many circuits a permit covers — Fort Smith, whose
   * per-circuit rate steps down by band, prices its ladder on this basis.
   */
  | "circuits"
  | `custom.${string}`;

export const COMPARISON_OPERATORS = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not_in",
  "exists",
  "absent",
] as const;
export type ComparisonOperator = (typeof COMPARISON_OPERATORS)[number];

export type ConditionScalar = string | number | boolean;

export type ConditionLeaf = {
  field: ConditionField;
  op: ComparisonOperator;
  value?: ConditionScalar | ConditionScalar[];
};

export type FeeCondition =
  | ConditionLeaf
  | { all: FeeCondition[] }
  | { any: FeeCondition[] }
  | { not: FeeCondition };

/* -------------------------------------------------------------------------- */
/* Rule records                                                               */
/* -------------------------------------------------------------------------- */

export type FactValue = string | number | boolean | null;
export type CalculationFacts = Record<string, FactValue>;

/**
 * A fee rule as it arrives from storage.
 *
 * `config` and `conditions` are `unknown` on purpose: they are JSONB columns, so
 * the honest type is "we have not validated this yet". The engine validates them
 * with Zod and reports anything invalid instead of computing a wrong number.
 */
export type FeeRuleRecord = {
  id: string;
  code: string;
  label: string;
  description: string | null;
  componentType: FeeComponentType;
  feeType: FeeType;
  config: unknown;
  conditions: unknown;
  minimumCents: number | null;
  maximumCents: number | null;
  priority: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: FeeRuleStatus;
  sourceId: string | null;
};

type ValidatedRuleBase = Omit<FeeRuleRecord, "config" | "conditions">;

/**
 * A rule whose configuration and conditions have passed validation.
 *
 * Modelled as a discriminated union so the engine's `switch` narrows `config`
 * without casts: a `flat` rule cannot be read with a `percent` config.
 * A `boolean` condition may also be recorded directly on a rule through
 * `conditions` only, never on the rule body.
 */
export type ValidatedFeeRule =
  | (ValidatedRuleBase & { feeType: "flat"; config: FlatFeeConfig; conditions: FeeCondition | null })
  | (ValidatedRuleBase & { feeType: "percent"; config: PercentFeeConfig; conditions: FeeCondition | null })
  | (ValidatedRuleBase & {
      feeType: "per_thousand";
      config: PerThousandFeeConfig;
      conditions: FeeCondition | null;
    })
  | (ValidatedRuleBase & {
      feeType: "tiered_marginal";
      config: TieredMarginalConfig;
      conditions: FeeCondition | null;
    })
  | (ValidatedRuleBase & {
      feeType: "tiered_table";
      config: TieredTableConfig;
      conditions: FeeCondition | null;
    })
  | (ValidatedRuleBase & {
      feeType: "per_unit";
      config: PerUnitFeeConfig;
      conditions: FeeCondition | null;
    })
  | (ValidatedRuleBase & {
      feeType: "permit_minimum";
      config: PermitMinimumFeeConfig;
      conditions: FeeCondition | null;
    });

/* -------------------------------------------------------------------------- */
/* Input and result                                                           */
/* -------------------------------------------------------------------------- */

export type CalculationInput = {
  /**
   * The date the question is being asked for. REQUIRED, because "the current
   * fee" is not a well-defined concept: a fee is only meaningful as of a date.
   */
  asOf: string;
  /** Project valuation in CENTS. */
  valuationCents?: number;
  squareFootage?: number;
  units?: number;
  fixtures?: number;
  occupancy?: OccupancyClass;
  workType?: WorkType;
  constructionType?: string;
  isExpedited?: boolean;
  isOwnerBuilder?: boolean;
  /** Jurisdiction-specific facts, addressed in conditions as `custom.<key>`. */
  custom?: Record<string, ConditionScalar | null | undefined>;
};

export type CalculationStep = {
  label: string;
  value: string;
};

export type CalculationComponent = {
  ruleId: string;
  code: string;
  label: string;
  description: string | null;
  componentType: FeeComponentType;
  amountCents: number;
  /** Human-readable description of the rule that produced this amount. */
  formula: string;
  /** Intermediate values, so a reader can reproduce the number by hand. */
  steps: CalculationStep[];
  sourceId: string | null;
};

export type ExclusionReason =
  | "inactive"
  | "not_effective"
  | "conditions_not_met"
  | "missing_input"
  | "invalid_rule";

export type ExcludedRule = {
  ruleId: string;
  code: string;
  label: string;
  reason: ExclusionReason;
  detail: string;
};

export type CalculationResult = {
  currency: "USD";
  totalCents: number;
  components: CalculationComponent[];
  excluded: ExcludedRule[];
  /** Statements about what the calculation assumed, shown next to the result. */
  assumptions: string[];
  /** Statements about what the calculation may be missing or could not do. */
  warnings: string[];
  appliedRuleIds: string[];
  asOf: string;
};
