import { isWithinEffectiveWindow, normalizeIsoDate } from "@/lib/dates";
import {
  formatBps,
  formatCents,
  formatMultiplier,
  formatNumber,
  formatRateFraction,
  formatUnitRate,
} from "@/lib/format";

import { evaluateCondition } from "./conditions";
import { CalculationError } from "./errors";
import {
  PER_THOUSAND_COUNT_DENOMINATOR,
  PER_THOUSAND_DENOMINATOR,
  applyCentsPerThousand,
  applyExactCentsPerThousand,
  applyExactRate,
  applyMinMax,
  applyRateBps,
  roundToNearestIncrement,
  roundUpToIncrement,
} from "./money";
import { validateFeeRule } from "./schemas";
import {
  BASIS_FACT_KEYS,
  FEE_BASES,
  PER_UNIT_KINDS,
  type CalculationComponent,
  type CalculationFacts,
  type CalculationInput,
  type CalculationResult,
  type CalculationStep,
  type ConditionLeaf,
  type ExcludedRule,
  type FeeBasis,
  type FeeComponentType,
  type FeeCondition,
  type FeeRuleRecord,
  type ExactRate,
  type ExactRateUnit,
  type FloorTable,
  type MarginalTier,
  type PerThousandFeeConfig,
  type PerUnitKind,
  type PercentFeeConfig,
  type RateTable,
  type ValidatedFeeRule,
} from "./types";


/**
 * The fee engine.
 *
 * Pure function: rules in, breakdown out. No clock, no database, no network.
 * The date is an explicit input because "the current fee" is not a well-defined
 * concept — a fee only means something as of a date.
 */

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

export const BASIS_LABELS: Record<FeeBasis, string> = {
  linear_feet: "Linear feet",
  construction_factor: "Construction factor",
  valuation: "Project valuation",
  square_footage: "Project area",
  covered_square_footage: "Covered area",
  /**
   * The enclosed volume of the building, in cubic feet, read as "Building volume".
   * Both New Jersey jurisdictions in this dataset price a new building on it, and the
   * State's rule is where the phrase comes from: N.J.A.C. 5:23-4.18(c) computes the
   * basic construction fee "on the basis of the volume of the building", with the
   * volume itself computed under N.J.A.C. 5:23-2.28.
   */
  cubic_footage: "Building volume",
  units: "Dwelling units",
  fixtures: "Fixtures",
  /**
   * The size of the electrical service, in amperes. "Service amperage" is the
   * schedule's own phrase: Miami-Dade's electrical section opens with "(The following
   * fee shall be charged for total amperage of service)".
   */
  amperage: "Service amperage",
  /**
   * Active electrical circuits on a permit. "Number of active circuits installed under
   * any one permit" is the schedule's own phrase: Fort Smith prices its electrical
   * permit on that count at a per-circuit rate that steps down by band.
   */
  circuits: "Active circuits",
  /**
   * Read as "the calculated permit fee", because that is how schedules that use
   * it say it. It is the sum of this run's `base` components — the fee before the
   * component being computed. See `calculatePermitFees`.
   */
  permit_fee: "Calculated permit fee",
  /**
   * Read as "all fees charged", because that is how the schedules that use it say
   * it. It is the sum of every component computed before the one being evaluated,
   * whatever its component type — see `calculatePermitFees`.
   */
  fee_subtotal: "Fees charged",
};

export const PER_UNIT_LABELS: Record<PerUnitKind, string> = {
  dwelling_units: "dwelling unit",
  fixtures: "fixture",
  circuits: "circuit",
  panels: "electrical panel",
  signs: "sign",
  stories: "story",
  inspections: "inspection",
  furnaces: "furnace",
  heaters: "heater",
  openings: "opening",
  connections: "connection",
  tons: "ton of cooling",
  lighting_fixtures: "lighting fixture",
  outlets: "outlet",
  septic_tanks: "septic tank",
  trades: "trade",
  meters: "meter",
  backflow_devices: "backflow device",
  low_voltage_points: "low-voltage point",
  special_devices: "special device",
  bathrooms: "bathroom or kitchen",
  electrical_units: "electrical unit",
  linear_feet: "linear foot",
  sprinkler_heads: "sprinkler head",
  ac_units: "air conditioning unit",
  electrical_services: "electrical service",
  water_units: "water unit",
  gas_units: "gas unit",
  btu_blocks: "100,000 BTU block",
  power_devices: "power device",
  kilovolt_amperes: "kilovolt-ampere",
  kilowatts: "kilowatt",
  building_drains: "building drain",
  water_service_connections: "water service connection",
  horsepower: "horsepower",
  temporary_services: "temporary service",
  reconnections: "reconnection",
  trailer_park_sewers: "trailer park sewer",
  grease_interceptors: "pretreatment interceptor",
  drywells: "drywell",
  gas_tanks: "gas tank or pump",
  final_inspections: "additional final inspection",
  appliance_circuits: "appliance circuit",
  lavatories: "lavatory",
  floor_drains: "floor drain",
  water_heaters: "water heater",
  heating_appliances: "heating appliance",
  gas_service_lines: "gas service line",
  other_connections: "other connection",
  piping_runs: "piping run",
};

/**
 * The plural of each per-unit noun, for "Number of …".
 *
 * Not `${singular}s`: "story" is not "storys", and "ton of cooling" pluralises its
 * head noun rather than its last word. Kept beside the singulars so a new per-unit
 * kind cannot be added with only one of the two.
 */
export const PER_UNIT_PLURALS: Record<PerUnitKind, string> = {
  dwelling_units: "dwelling units",
  fixtures: "fixtures",
  circuits: "circuits",
  panels: "electrical panels",
  signs: "signs",
  stories: "stories",
  inspections: "inspections",
  furnaces: "furnaces",
  heaters: "heaters",
  openings: "openings",
  connections: "connections",
  tons: "tons of cooling",
  lighting_fixtures: "lighting fixtures",
  outlets: "outlets",
  septic_tanks: "septic tanks",
  trades: "trades",
  meters: "meters",
  backflow_devices: "backflow devices",
  low_voltage_points: "low-voltage points",
  special_devices: "special devices",
  bathrooms: "bathrooms or kitchens",
  electrical_units: "electrical units",
  linear_feet: "linear feet",
  sprinkler_heads: "sprinkler heads",
  ac_units: "air conditioning units",
  electrical_services: "electrical services",
  water_units: "water units",
  gas_units: "gas units",
  btu_blocks: "100,000 BTU blocks",
  power_devices: "power devices",
  kilovolt_amperes: "kilovolt-amperes",
  kilowatts: "kilowatts",
  building_drains: "building drains",
  water_service_connections: "water service connections",
  horsepower: "horsepower",
  temporary_services: "temporary services",
  reconnections: "reconnections",
  trailer_park_sewers: "trailer park sewers",
  grease_interceptors: "pretreatment interceptors",
  drywells: "drywells",
  gas_tanks: "gas tanks or pumps",
  final_inspections: "additional final inspections",
  appliance_circuits: "appliance circuits",
  lavatories: "lavatories",
  floor_drains: "floor drains",
  water_heaters: "water heaters",
  heating_appliances: "heating appliances",
  gas_service_lines: "gas service lines",
  other_connections: "other connections",
  piping_runs: "piping runs",
};

/**
 * Where each kind reads its count from.
 *
 * Only `units` and `fixtures` have first-class columns on `CalculationInput`;
 * everything else lives in the `custom.*` namespace, which is how a local quirk
 * gets an input without a schema change. Each kind has a distinct key so no two
 * rules can read the same input by accident.
 */
const PER_UNIT_FACT_KEYS: Record<PerUnitKind, string> = {
  dwelling_units: "units",
  fixtures: "fixtures",
  circuits: "custom.circuits",
  panels: "custom.panels",
  signs: "custom.signs",
  stories: "custom.stories",
  inspections: "custom.inspections",
  furnaces: "custom.furnaces",
  heaters: "custom.heaters",
  openings: "custom.openings",
  connections: "custom.connections",
  tons: "custom.tons",
  lighting_fixtures: "custom.lighting_fixtures",
  outlets: "custom.outlets",
  septic_tanks: "custom.septic_tanks",
  trades: "custom.trades",
  meters: "custom.meters",
  backflow_devices: "custom.backflow_devices",
  low_voltage_points: "custom.low_voltage_points",
  special_devices: "custom.special_devices",
  bathrooms: "custom.bathrooms",
  electrical_units: "custom.electrical_units",
  linear_feet: "custom.linear_feet",
  sprinkler_heads: "custom.sprinkler_heads",
  ac_units: "custom.ac_units",
  electrical_services: "custom.electrical_services",
  water_units: "custom.water_units",
  gas_units: "custom.gas_units",
  btu_blocks: "custom.btu_blocks",
  power_devices: "custom.power_devices",
  kilovolt_amperes: "custom.kilovolt_amperes",
  kilowatts: "custom.kilowatts",
  building_drains: "custom.building_drains",
  water_service_connections: "custom.water_service_connections",
  horsepower: "custom.horsepower",
  temporary_services: "custom.temporary_services",
  reconnections: "custom.reconnections",
  trailer_park_sewers: "custom.trailer_park_sewers",
  grease_interceptors: "custom.grease_interceptors",
  drywells: "custom.drywells",
  gas_tanks: "custom.gas_tanks",
  final_inspections: "custom.final_inspections",
  appliance_circuits: "custom.appliance_circuits",
  lavatories: "custom.lavatories",
  floor_drains: "custom.floor_drains",
  water_heaters: "custom.water_heaters",
  heating_appliances: "custom.heating_appliances",
  gas_service_lines: "custom.gas_service_lines",
  other_connections: "custom.other_connections",
  piping_runs: "custom.piping_runs",
};

export const COMPONENT_TYPE_LABELS: Record<FeeComponentType, string> = {
  base: "Permit fee",
  plan_review: "Plan review",
  technology: "Technology fee",
  inspection: "Inspection fee",
  surcharge: "Surcharge",
  state_surcharge: "State surcharge",
  other: "Other fee",
};

/** Display order for components, so the breakdown reads like a real invoice. */
const COMPONENT_ORDER: FeeComponentType[] = [
  "base",
  "plan_review",
  "technology",
  "inspection",
  "surcharge",
  "state_surcharge",
  "other",
];

/* -------------------------------------------------------------------------- */
/* Facts                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Flatten the input into the fact namespace that conditions address.
 * Keys are snake_case because they are persisted verbatim inside rule JSON.
 */
export function buildFacts(input: CalculationInput): CalculationFacts {
  const facts: CalculationFacts = {
    valuation: input.valuationCents ?? null,
    square_footage: input.squareFootage ?? null,
    units: input.units ?? null,
    fixtures: input.fixtures ?? null,
    occupancy: input.occupancy ?? null,
    work_type: input.workType ?? null,
    construction_type: input.constructionType ?? null,
    is_expedited: input.isExpedited ?? null,
    is_owner_builder: input.isOwnerBuilder ?? null,
  };

  if (input.custom) {
    for (const [key, value] of Object.entries(input.custom)) {
      facts[`custom.${key}`] = value ?? null;
    }
  }

  return facts;
}

/** `new_construction` -> `New construction`. */
function humanise(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Whole dollars stay whole; anything with cents shows them. */
function formatMoney(cents: number): string {
  return formatCents(cents, { showCents: cents % 100 !== 0 });
}

/**
 * What a condition fact is called when a reader sees it.
 *
 * Condition field names are the machine vocabulary (`square_footage`,
 * `is_owner_builder`) and appear verbatim in logs, rule files and tests. A
 * published page needs the human noun instead.
 */
const CONDITION_FIELD_LABELS: Record<string, string> = {
  valuation: "Project valuation",
  square_footage: "Project area",
  units: "Dwelling units",
  fixtures: "Fixtures",
  occupancy: "Occupancy",
  work_type: "Work type",
  construction_type: "Construction type",
  is_expedited: "Expedited review",
  is_owner_builder: "Owner-builder",
};

/** Fields whose value is money in cents, so a reader is shown dollars. */
const CONDITION_MONEY_FIELDS = new Set<string>(["valuation"]);

/**
 * A lower bound of `> 0` on a money field: true of every project that has one, so
 * it adds nothing to a sentence. Dropped when rendering for a reader, which is
 * what turned "valuation gt 0 AND valuation lte 700000" into "Project valuation
 * up to $7,000" instead of "over $0 and up to $7,000".
 *
 * The condition still governs the calculation. Only the description omits it.
 */
function isTrivialPositiveBound(condition: FeeCondition): boolean {
  return (
    "field" in condition &&
    CONDITION_MONEY_FIELDS.has(condition.field) &&
    (condition.op === "gt" || condition.op === "gte") &&
    condition.value === 0
  );
}

/** The human noun for a condition fact. `custom.<key>` loses its prefix. */
function subjectFor(field: string): string {
  const base = field.replace(/^custom\./, "").replace(/_/g, " ");
  return CONDITION_FIELD_LABELS[field] ?? base;
}

/** A value as a reader expects to see it: dollars for money, words for enums. */
function formatConditionValue(field: string, value: unknown): string {
  if (CONDITION_MONEY_FIELDS.has(field) && typeof value === "number") return formatMoney(value);
  return String(value).replace(/_/g, " ");
}

/**
 * A leaf's predicate, without its subject: "over $7,000", "is residential".
 *
 * Kept separate from the full sentence so that two bounds on the same fact can
 * share one subject, which is how a bracket is actually written.
 */
function describeLeafPredicate(leaf: ConditionLeaf): string {
  const value = formatConditionValue(leaf.field, leaf.value);
  const list = (): string =>
    (leaf.value as unknown[])
      .map((candidate) => formatConditionValue(leaf.field, candidate))
      .join(", ");

  switch (leaf.op) {
    case "exists":
      return "is provided";
    case "absent":
      return "is not provided";
    case "in":
      return `is one of ${list()}`;
    case "not_in":
      return `is none of ${list()}`;
    case "eq":
      return `is ${value}`;
    case "neq":
      return `is not ${value}`;
    case "gt":
      return `over ${value}`;
    case "gte":
      return `at least ${value}`;
    case "lt":
      return `under ${value}`;
    case "lte":
      return `up to ${value}`;
    default:
      return `${leaf.op} ${value}`;
  }
}

function describeLeafForReader(leaf: ConditionLeaf): string {
  return `${subjectFor(leaf.field)} ${describeLeafPredicate(leaf)}`;
}

/**
 * A condition in words, for a reader.
 *
 * `describeCondition` in `conditions.ts` is the debug rendering —
 * `valuation gt 700000` — which is the right output for a log line and the wrong
 * output for a published page: it exposes the cents representation and an
 * operator vocabulary no visitor asked to learn.
 *
 * Found by looking at the rendered Houston page, where the "Applies when" column
 * read `valuation gt 0 AND valuation lte 700000`.
 */
export function describeConditionForReader(condition: FeeCondition): string {
  if (isTrivialPositiveBound(condition)) return "any project valuation";

  if ("not" in condition) return `not (${describeConditionForReader(condition.not)})`;

  if ("any" in condition) {
    const parts = condition.any.map(describeConditionForReader);
    return parts.length === 0 ? "never" : parts.join(" or ");
  }

  if ("all" in condition) {
    const meaningful = condition.all.filter((child) => !isTrivialPositiveBound(child));
    if (meaningful.length === 0) return "any project valuation";

    // A bracket is two bounds on the same fact. Naming the subject for each one
    // produced "Project valuation over $7,000 and Project valuation up to
    // $150,000"; hoisting it produces the sentence a schedule prints.
    const leaves = meaningful.filter((child): child is ConditionLeaf => "field" in child);
    const fields = new Set(leaves.map((leaf) => leaf.field));
    const comparable = leaves.every((leaf) => leaf.op !== "exists" && leaf.op !== "absent");

    if (comparable && leaves.length === meaningful.length && fields.size === 1) {
      const [field] = [...fields];
      const predicates = leaves.map(describeLeafPredicate).join(" and ");
      return `${subjectFor(field ?? "")} ${predicates}`;
    }

    return meaningful.map(describeConditionForReader).join(" and ");
  }

  return describeLeafForReader(condition);
}

/**
 * When a rule applies, in a sentence a reader can act on.
 *
 * The fallback matters as much as the conditions. Saying "Always applies" of a
 * per-item row is false: Houston's electrical outlet fee applies to each outlet on
 * the permit, and a permit with no outlets does not incur it. The engine knows
 * which fact a rule reads, so it says that instead of claiming universality.
 */
export function describeApplicability(rule: ValidatedFeeRule): string {
  const tableKeys =
    rule.feeType === "percent" && rule.config.rateTables !== undefined
      ? [...new Set(rule.config.rateTables.flatMap((table) => table.keys))]
      : null;
  const tableSentence =
    tableKeys !== null && tableKeys.length > 0
      ? joinForReading(tableKeys.map(labelForFactKey))
      : null;

  if (rule.conditions) {
    const base = describeConditionForReader(rule.conditions);
    return tableSentence !== null
      ? `${base}, and where the schedule publishes a rate for ${tableSentence}`
      : base;
  }

  if (tableSentence !== null) {
    // A rule whose rate comes from lookup tables has no conditions to read: the
    // tables are what make it apply. Saying "Every permit of this type" would be
    // false for a combination the schedule does not publish.
    return `Where the schedule publishes a rate for ${tableSentence}`;
  }

  if (rule.feeType === "per_unit") {
    return `Each ${PER_UNIT_LABELS[rule.config.unit]} on the permit`;
  }

  return "Every permit of this type";
}

/** `A`, `A and B`, `A, B and C` — how a list of subjects is said in one sentence. */
function joinForReading(labels: string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/**
 * What any fact key is called in prose, in exactly the words the calculation uses.
 *
 * A basis first and a per-unit kind second, so a table keyed by a fact the engine
 * already names ("Covered area", "Number of outlets") is named the same way here;
 * a `custom.*` fact falls back to the humanised key, which is what
 * `describeCalculationInput` shows a reader for an input with no dedicated label.
 */
function labelForFactKey(factKey: string): string {
  const basis = basisForFactKey(factKey);
  if (basis) return BASIS_LABELS[basis];
  const kind = perUnitKindForFactKey(factKey);
  if (kind) return `Number of ${PER_UNIT_PLURALS[kind]}`;
  if (factKey.startsWith("custom.")) return humanise(factKey.slice("custom.".length));
  return humanise(factKey);
}

/** The per-unit kind that reads a given fact key, if any. */
function perUnitKindForFactKey(factKey: string): PerUnitKind | null {
  for (const kind of PER_UNIT_KINDS) {
    if (PER_UNIT_FACT_KEYS[kind] === factKey) return kind;
  }
  return null;
}

/**
 * The basis that reads a given fact key, if any.
 *
 * Needed because a basis may itself read a `custom.*` fact — the second area does
 * — and the input list has to name that fact the same way the calculation does.
 * Without this, a reader sees "Covered square footage" in the inputs table and
 * "Covered area" in the breakdown beside it.
 */
function basisForFactKey(factKey: string): FeeBasis | null {
  for (const basis of FEE_BASES) {
    if (BASIS_FACT_KEYS[basis] === factKey) return basis;
  }
  return null;
}

/**
 * A calculation's inputs, in display form.
 *
 * This exists so a reader can see which facts produced a figure. It is derived
 * from the same maps the engine computes with, so an input cannot be described
 * using a word the calculation does not use.
 *
 * `asOf` is deliberately absent from the parameter type, not just from the output:
 * it is the reader's "today", shown once next to the result rather than listed as
 * a project input.
 */
export function describeCalculationInput(
  input: Omit<CalculationInput, "asOf">,
): CalculationStep[] {
  const rows: CalculationStep[] = [];

  if (input.valuationCents !== undefined) {
    rows.push({ label: BASIS_LABELS.valuation, value: formatMoney(input.valuationCents) });
  }
  if (input.squareFootage !== undefined) {
    rows.push({
      label: BASIS_LABELS.square_footage,
      value: `${formatNumber(input.squareFootage)} sq ft`,
    });
  }
  if (input.units !== undefined) {
    rows.push({ label: BASIS_LABELS.units, value: formatNumber(input.units) });
  }
  if (input.fixtures !== undefined) {
    rows.push({ label: BASIS_LABELS.fixtures, value: formatNumber(input.fixtures) });
  }
  if (input.occupancy !== undefined) {
    rows.push({ label: "Occupancy class", value: humanise(input.occupancy) });
  }
  if (input.workType !== undefined) {
    rows.push({ label: "Type of work", value: humanise(input.workType) });
  }
  if (input.constructionType !== undefined) {
    rows.push({ label: "Construction type", value: input.constructionType });
  }
  if (input.isExpedited !== undefined) {
    rows.push({ label: "Expedited review", value: input.isExpedited ? "Yes" : "No" });
  }
  if (input.isOwnerBuilder !== undefined) {
    rows.push({ label: "Owner-builder", value: input.isOwnerBuilder ? "Yes" : "No" });
  }

  for (const [key, value] of Object.entries(input.custom ?? {})) {
    if (value === undefined || value === null) continue;

    const factKey = `custom.${key}`;
    const kind = perUnitKindForFactKey(factKey);
    const basis = basisForFactKey(factKey);

    // A basis first, so a fact the calculation calls "Covered area" is not called
    // "Covered square footage" in the inputs table above the breakdown.
    const label = basis
      ? BASIS_LABELS[basis]
      : kind
        ? `Number of ${PER_UNIT_PLURALS[kind]}`
        : humanise(key);

    rows.push({
      label,
      value:
        typeof value === "number"
          ? `${formatNumber(value)}${basis ? (BASIS_SUFFIXES[basis] ?? "") : ""}`
          : typeof value === "boolean"
            ? (value ? "Yes" : "No")
            : value,
    });
  }

  return rows;
}

/* -------------------------------------------------------------------------- */
/* Basis reading                                                              */
/* -------------------------------------------------------------------------- */

type BasisReading =
  | {
      ok: true;
      value: number;
      factKey: string;
      label: string;
      isCents: boolean;
      suffix: string;
    }
  | { ok: false; factKey: string; label: string };

function readBasis(facts: CalculationFacts, basis: FeeBasis): BasisReading {
  const factKey = BASIS_FACT_KEYS[basis];
  const raw = facts[factKey];

  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return { ok: false, factKey, label: BASIS_LABELS[basis] };
  }
  return {
    ok: true,
    value: raw,
    factKey,
    label: BASIS_LABELS[basis],
    isCents: isMoneyBasis(basis),
    suffix: BASIS_SUFFIXES[basis] ?? "",
  };
}

/**
 * Whether a basis is an amount of money.
 *
 * Three bases are, and getting the list wrong is not cosmetic: the reading decides
 * whether a value is printed as dollars or as a bare count. `permit_fee` and
 * `fee_subtotal` were each added later than `valuation`, and `fee_subtotal` was left
 * out of this test when it was introduced — so Seattle's 5% technology fee showed its
 * subject in the breakdown as `149840` rather than as `$1,498.40`, on a published page.
 * Grouped in one predicate so the next money basis cannot be forgotten in one place and
 * remembered in another.
 */
function isMoneyBasis(basis: FeeBasis): boolean {
  return basis === "valuation" || basis === "permit_fee" || basis === "fee_subtotal";
}

/**
 * An amount measured in the basis's own unit: dollars for money, a count with its unit
 * for an area.
 *
 * Used for the thresholds and increments in a rule's description. `formatCents` alone
 * would say "$10" for a 1,000-square-foot threshold, which is how the two area-based
 * rules in this dataset would have been misdescribed.
 */
function formatBasisAmount(basis: FeeBasis, value: number): string {
  if (basis === "construction_factor") return formatNumber(value);
  const suffix = BASIS_SUFFIXES[basis];
  return suffix ? `${formatNumber(value)}${suffix}` : formatCents(value, { showCents: false });
}

function formatBasisValue(reading: {
  value: number;
  isCents: boolean;
  suffix?: string | undefined;
}): string {
  const value = reading.isCents
    ? formatCents(reading.value, { showCents: false })
    : `${formatNumber(reading.value)}${reading.suffix ?? ""}`;
  return value;
}

/* -------------------------------------------------------------------------- */
/* Formula descriptions                                                       */
/* -------------------------------------------------------------------------- */

/**
 * One band's charge: money bases by basis points, every other basis by cents per unit.
 *
 * The two are the same idea in different units, and keeping them in one place means a
 * band cannot be charged one way and described the other.
 */
function applyMarginalRate(bandWidth: number, tier: MarginalTier): number {
  if (tier.rate !== undefined) return applyExactRate(bandWidth, tier.rate.numerator, tier.rate.denominator);
  if (tier.rateCentsPerUnit !== undefined) return bandWidth * tier.rateCentsPerUnit;
  return applyRateBps(bandWidth, tier.rateBps ?? 0);
}

/** A band's rate, said in the basis's own unit: "2.5%" or "$0.40 per sq ft" or "$0.005 per construction factor". */
function describeTierRate(basis: FeeBasis, tier: MarginalTier): string {
  if (tier.rate !== undefined) {
    // rate is cents per unit, so the dollar figure is numerator/(denominator*100).
    return `${formatUnitRate(tier.rate.numerator, tier.rate.denominator * 100)} per ${BASIS_UNIT_NOUNS[basis]}`;
  }
  if (tier.rateCentsPerUnit !== undefined) {
    return `${formatCents(tier.rateCentsPerUnit)} per ${BASIS_UNIT_NOUNS[basis]}`;
  }
  return formatBps(tier.rateBps ?? 0);
}

function describeMarginalBands(tiers: MarginalTier[], basis: FeeBasis): string {
  const parts: string[] = [];
  const basisLabel = BASIS_LABELS[basis];
  let previousUpper = 0;

  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    if (!tier) continue;

    // A zero-rate band is not nothing: it is a band a schedule defines and charges
    // nothing for, usually because a base amount covers it. Printed as "0% of the
    // first $1,000" it reads like a mistake, so it is said in words.
    const isFree =
      tier.rateCentsPerUnit === undefined && tier.rate === undefined && (tier.rateBps ?? 0) === 0;
    const rate = describeTierRate(basis, tier);

    if (tier.upToCents === null) {
      const upper = formatBasisAmount(basis, previousUpper);
      parts.push(
        index === 0
          ? isFree
            ? "no charge"
            : `${rate} of ${basisLabel.toLowerCase()}`
          : isFree
            ? `no charge above ${upper}`
            : `${rate} above ${upper}`,
      );
    } else if (index === 0) {
      const upper = formatBasisAmount(basis, tier.upToCents);
      parts.push(isFree ? `no charge on the first ${upper}` : `${rate} of the first ${upper}`);
      previousUpper = tier.upToCents;
    } else {
      const upper = formatBasisAmount(basis, previousUpper);
      parts.push(isFree ? `no charge above ${upper}` : `${rate} above ${upper}`);
      previousUpper = tier.upToCents;
    }
  }

  return parts.join(", plus ");
}

function describeBracket(upperCents: number | null, lowerCents: number): string {
  if (upperCents === null) {
    return `above ${formatCents(lowerCents, { showCents: false })}`;
  }
  if (lowerCents === 0) {
    return `up to ${formatCents(upperCents, { showCents: false })}`;
  }
  return `from ${formatCents(lowerCents, { showCents: false })} to ${formatCents(upperCents, { showCents: false })}`;
}

/**
 * Past this many brackets a `tiered_table` description stops listing the table and
 * states its shape instead. See the `tiered_table` case in `describeFeeRule`.
 */
const LARGE_TABLE_BRACKETS = 12;

/**
 * Describe a rule's formula without evaluating it.
 *
 * Used by the fee-structure table on a permit page (which has no project inputs
 * yet) and, later, by the admin rule editor. A pass through the same helpers the
 * evaluator uses keeps the description and the calculation from disagreeing.
 */
export function describeFeeRule(rule: ValidatedFeeRule): string {
  switch (rule.feeType) {
    case "flat":
      return `${formatCents(rule.config.amountCents)} flat fee`;

    case "percent": {
      const note =
        rule.config.incrementCents && rule.config.incrementCents > 0
          ? ` (per ${formatBasisAmount(rule.config.basis, rule.config.incrementCents)} or fraction thereof)`
          : "";
      const above =
        rule.config.thresholdCents && rule.config.thresholdCents > 0
          ? ` above the first ${formatBasisAmount(rule.config.basis, rule.config.thresholdCents)}`
          : "";
      const addFactor =
        rule.config.baseCents && rule.config.baseCents > 0
          ? ` + ${formatCents(rule.config.baseCents)}`
          : "";

      // A rule whose rate comes from lookup tables has no single number to print:
      // the fee-structure table shows the tables that produce it instead, and the
      // numbers themselves appear in the worked example's working, one row per
      // factor. Printing "an unpublished rate" here would be false, and printing
      // any one table's rate would be a lie about which combination it is.
      if (rule.config.rateTables !== undefined) {
        // Only the first factor keeps its printed capitalisation; the ones
        // joined after it are read as part of one phrase ("Construction factor ×
        // scope of review factor"), not as separate sentences.
        const labels = rule.config.rateTables
          .map((table, index) => {
            const label = table.label ?? "the published rate";
            return index === 0 ? label : label.charAt(0).toLowerCase() + label.slice(1);
          })
          .join(" × ");
        const multiplier =
          rule.config.rateMultiplier !== undefined
            ? ` × ${formatMultiplier(
                rule.config.rateMultiplier.numerator,
                rule.config.rateMultiplier.denominator,
              )}`
            : "";
        const per =
          rule.config.rateUnit === "currency_per_unit"
            ? ` per ${BASIS_UNIT_NOUNS[rule.config.basis]}`
            : "";
        const minimum = rule.config.floorTable
          ? "; minimum fee from the schedule's own row"
          : "";
        return `${labels}${multiplier}${per}${above}${note}${addFactor}${minimum}`;
      }

      const rate = resolvePercentRate(rule.config);
      return `${rate === null ? "an unpublished rate" : ratePhrase(rate, rule.config)}${above}${note}${addFactor}`;
    }

    case "per_thousand": {
      const parts: string[] = [];
      if (rule.config.baseCents && rule.config.baseCents > 0) {
        parts.push(formatCents(rule.config.baseCents));
      }
      const threshold =
        rule.config.thresholdCents && rule.config.thresholdCents > 0
          ? ` above ${formatBasisAmount(rule.config.basis, rule.config.thresholdCents)}`
          : "";
      const fractionNote = !rule.config.incrementCents
        ? ""
        : rule.config.incrementRounding === "nearest"
          ? `, calculated to the closest ${formatBasisAmount(rule.config.basis, rule.config.incrementCents)}`
          : ", or fraction thereof";
      parts.push(
        `${describePerThousandRate(rule.config)} of ${BASIS_LABELS[rule.config.basis].toLowerCase()}${threshold}${fractionNote}`,
      );
      return parts.join(" + ");
    }

    case "tiered_marginal": {
      const parts: string[] = [];
      if (rule.config.baseCents && rule.config.baseCents > 0) {
        parts.push(formatCents(rule.config.baseCents));
      }
      parts.push(describeMarginalBands(rule.config.tiers, rule.config.basis));
      // The rounding is not decoration: a schedule that bands by "$12 for each
      // additional $1,000, or fraction thereof" charges a whole increment for one
      // cent over a boundary. Omitting it from the description would understate the
      // rule, so it is stated wherever the bands are.
      const roundingNote =
        rule.config.incrementCents && rule.config.incrementCents > 0
          ? ` (basis rounded up to the next ${formatBasisAmount(rule.config.basis, rule.config.incrementCents)} or fraction thereof)`
          : "";
      return `${parts.join(" + ")}${roundingNote}`;
    }

    case "tiered_table": {
      const tiers = rule.config.tiers;
      const first = tiers[0];
      const last = tiers[tiers.length - 1];

      // Listing every bracket is right for the schedules this engine was built on —
      // six bands in Clark County, three in Phoenix — and wrong as a sentence past
      // that. Sacramento's Table A is a bracket per $1,000 of valuation: 100 rows and
      // 3,295 characters, which the fee-structure table renders as a single
      // nowrap chip inside a cell 25,798px wide, pushing the Range column past the
      // viewport where no scroll can reach it. A table that large states its own
      // shape instead — how many brackets it has, and where it starts and ends —
      // and the exact bracket a valuation falls in is still in the component's
      // `steps`, which is where a reader reproducing a number needs it.
      if (tiers.length > LARGE_TABLE_BRACKETS && first && last) {
        const lastLower = tiers[tiers.length - 2]?.upToCents ?? 0;
        return (
          `${BASIS_LABELS[rule.config.basis]} — ${tiers.length} brackets: ` +
          `${formatCents(first.amountCents)} ${describeBracket(first.upToCents, 0)}, ` +
          `… ${formatCents(last.amountCents)} ${describeBracket(last.upToCents, lastLower)}`
        );
      }

      let lowerBound = 0;
      const bands = tiers.map((tier) => {
        const band = `${formatCents(tier.amountCents)} ${describeBracket(tier.upToCents, lowerBound)}`;
        if (tier.upToCents !== null) lowerBound = tier.upToCents;
        return band;
      });
      return `${BASIS_LABELS[rule.config.basis]} — ${bands.join("; ")}`;
    }

    case "per_unit":
      return describePerUnit(rule.config);

    case "permit_minimum":
      return `the shortfall up to the ${formatCents(rule.config.floorCents)} minimum on ${BASIS_LABELS[rule.config.basis].toLowerCase()}`;

    default: {
      const unreachable: never = rule;
      throw new Error(`Unhandled fee type: ${JSON.stringify(unreachable)}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Evaluation                                                                 */
/* -------------------------------------------------------------------------- */

type Evaluation =
  | {
      ok: true;
      amountCents: number;
      formula: string;
      steps: CalculationStep[];
      warnings: string[];
      /**
       * A published minimum resolved from the rule's `floorTable`, before the
       * rule's own `minimumCents` is considered. The main loop applies the larger
       * of the two, so a schedule's global floor and its row floor both hold.
       */
      floorCents?: number;
    }
  | {
      ok: false;
      factKey: string;
      label: string;
      /**
       * Why the rule could not be evaluated. Unset means `missing_input` — the
       * default, and the reason every evaluator has always returned. See
       * `no_published_rate` for the lookup-table case: the inputs were given and
       * the schedule simply publishes nothing for that combination, which is not
       * a missing input and must not be reported as one.
       */
      reason?: "missing_input" | "no_published_rate";
    };

/** A table row selected by facts: the matched index and the values that matched. */
type TableMatch =
  | { ok: true; index: number; values: string[] }
  | { ok: false; reason: "missing"; factKey: string; label: string }
  | { ok: false; reason: "no_match" };

/**
 * Find the row of a published table whose keyed facts match the calculation.
 *
 * A fact the reader did not give is a *missing input* (the rule can be evaluated
 * once it arrives); facts that are all present with no row for their combination
 * are *no match* — the schedule does not publish that combination, and the caller
 * reports each differently.
 */
function matchTable(
  keys: string[],
  entries: Array<{ values: string[] }>,
  facts: CalculationFacts,
): TableMatch {
  const values: string[] = [];
  for (const key of keys) {
    const raw = facts[key];
    if (raw === undefined || raw === null) {
      return { ok: false, reason: "missing", factKey: key, label: labelForFactKey(key) };
    }
    values.push(String(raw));
  }

  const index = entries.findIndex(
    (entry) =>
      entry.values.length === values.length &&
      entry.values.every((value, position) => value === values[position]),
  );
  return index === -1 ? { ok: false, reason: "no_match" } : { ok: true, index, values };
}

/** The greatest common divisor of two positive integers, for reducing a product. */
function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }
  return x === 0 ? 1 : x;
}

/**
 * One table's rate, said in that table's own unit: `$0.78 per sq ft` for a table
 * of construction factors, `0.75` for a table of dimensionless multipliers. The
 * unit is the *table's* (`RateTable.rateUnit`), not the rule's: in a product, the
 * factors are printed the way the schedule prints each one.
 */
function tableRatePhrase(rate: ExactRate, unit: ExactRateUnit | undefined, basis: FeeBasis): string {
  return unit === "currency_per_unit"
    ? `${formatUnitRate(rate.numerator, rate.denominator)} per ${BASIS_UNIT_NOUNS[basis]}`
    : formatMultiplier(rate.numerator, rate.denominator);
}

/* -------------------------------------------------------------------------- */
/* Primitive evaluators                                                       */
/* -------------------------------------------------------------------------- */

function evalFlat(config: { amountCents: number }): Evaluation {
  return {
    ok: true,
    amountCents: config.amountCents,
    formula: `${formatCents(config.amountCents)} flat fee`,
    steps: [{ label: "Flat fee", value: formatCents(config.amountCents) }],
    warnings: [],
  };
}

/**
 * The two ways a percent rule can state its rate.
 *
 * Kept as a resolved value rather than read inline because three call sites need
 * it — the evaluator, the formula description and the fee-structure table — and
 * they must all read the same rate out of the same config.
 */
type PercentRate =
  | { readonly kind: "bps"; readonly bps: number }
  | { readonly kind: "exact"; readonly numerator: number; readonly denominator: number };

function resolvePercentRate(config: PercentFeeConfig): PercentRate | null {
  if (config.rate !== undefined) {
    return { kind: "exact", numerator: config.rate.numerator, denominator: config.rate.denominator };
  }
  if (config.rateBps !== undefined) {
    return { kind: "bps", bps: config.rateBps };
  }
  return null;
}

function formatPercentRate(rate: PercentRate, unit: ExactRateUnit | undefined): string {
  if (rate.kind === "bps") return formatBps(rate.bps);
  return unit === "currency_per_unit"
    ? formatUnitRate(rate.numerator, rate.denominator)
    : formatRateFraction(rate.numerator, rate.denominator);
}

/**
 * The rate said the way the schedule says it: `$0.34569 per sq ft` against an
 * area, `2.7665% of project valuation` against money. `rateUnit` on the config
 * decides which; see `PercentFeeConfig`.
 */
function ratePhrase(
  rate: PercentRate,
  config: PercentFeeConfig,
): string {
  if (rate.kind === "exact" && config.rateUnit === "currency_per_unit") {
    return `${formatUnitRate(rate.numerator, rate.denominator)} per ${BASIS_UNIT_NOUNS[config.basis]}`;
  }
  return `${formatPercentRate(rate, config.rateUnit)} of ${BASIS_LABELS[config.basis].toLowerCase()}`;
}

/** The thing a per-unit rate is charged against, for prose. */
const BASIS_UNIT_NOUNS: Record<FeeBasis, string> = {
  construction_factor: "construction factor",
  valuation: "$1 of valuation",
  square_footage: "sq ft",
  covered_square_footage: "sq ft",
  cubic_footage: "cubic foot",
  units: "dwelling unit",
  fixtures: "fixture",
  amperage: "ampere",
  circuits: "circuit",
  linear_feet: "linear foot",
  permit_fee: "permit fee",
  fee_subtotal: "fees charged",
};

/**
 * What a "per thousand" rate is charged per, in the basis's own words.
 *
 * A rate of this shape is published against money far more often than against
 * anything else — "$5.36 per additional $1,000 of valuation" — which is why the field
 * is named `centsPerThousand`. Miami-Dade's electrical schedule is the first in this
 * dataset to publish one against a count: "for each 100 amp. or fractional part, $7.26"
 * is $72.60 per 1,000 amperes, and saying "per $1,000" about amperes is how a rendered
 * formula ends up telling a reader something the document does not.
 */
const BASIS_THOUSAND_NOUNS: Record<FeeBasis, string> = {
  construction_factor: "1,000 of construction factor",
  valuation: "$1,000",
  permit_fee: "$1,000",
  fee_subtotal: "$1,000",
  square_footage: "1,000 sq ft",
  covered_square_footage: "1,000 sq ft",
  cubic_footage: "1,000 cu ft",
  linear_feet: "100 linear feet",
  units: "1,000 dwelling units",
  fixtures: "1,000 fixtures",
  amperage: "1,000 amperes",
  circuits: "1,000 circuits",
};

/**
 * The unit a basis is measured in, appended to a bare number when it is shown.
 * Money is formatted as money rather than suffixed; only areas carry a unit.
 */
const BASIS_SUFFIXES: Partial<Record<FeeBasis, string>> = {
  square_footage: " sq ft",
  covered_square_footage: " sq ft",
  cubic_footage: " cu ft",
  amperage: " A",
};

function evalPercent(config: PercentFeeConfig, facts: CalculationFacts): Evaluation {
  /**
   * The rate, either stated in the config or selected by the config's lookup
   * tables (see `RateTable`), plus the rows that produced it — a reader who is to
   * reproduce the product needs to see each factor, not only its result.
   */
  let rate: PercentRate;
  const tableSteps: CalculationStep[] = [];
  const warnings: string[] = [];

  if (config.rateTables !== undefined) {
    const allKeys = [...new Set(config.rateTables.flatMap((table) => table.keys))];
    let numerator = 1;
    let denominator = 1;

    for (const table of config.rateTables) {
      const match = matchTable(table.keys, table.entries, facts);
      if (!match.ok) {
        if (match.reason === "missing") {
          return { ok: false, factKey: match.factKey, label: match.label };
        }
        return {
          ok: false,
          factKey: allKeys.join(","),
          label: allKeys.map(labelForFactKey).join(", "),
          reason: "no_published_rate",
        };
      }
      const entry = table.entries[match.index];
      if (entry === undefined) continue; // unreachable: matchTable found it
      numerator *= entry.rate.numerator;
      denominator *= entry.rate.denominator;
      tableSteps.push({
        label: table.label ?? "Published rate",
        value: `${tableRatePhrase(entry.rate, table.rateUnit, config.basis)} (${match.values.join(", ")})`,
      });
    }

    // A published multiplier scales the matched rates: Oak Park prints the ICC
    // square-foot construction cost chart and the `.0194` its fee is charged at
    // beside it, so the cell stays the schedule's own number and the multiplier is
    // its own line in the working.
    if (config.rateMultiplier !== undefined) {
      numerator *= config.rateMultiplier.numerator;
      denominator *= config.rateMultiplier.denominator;
      tableSteps.push({
        label: "Published multiplier",
        value: formatMultiplier(
          config.rateMultiplier.numerator,
          config.rateMultiplier.denominator,
        ),
      });
    }

    // Reduced so the product of two already-reduced fractions stays inside exact
    // integer precision; each factor is bounded by the schema, and a schedule's
    // factors are small, but a silent overflow would be a wrong number rather than
    // an error, which is the failure mode this engine exists to prevent.
    const divisor = greatestCommonDivisor(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
      throw new CalculationError(
        "invalid_input",
        "The product of the rule's lookup tables is beyond exact integer precision",
        { numerator, denominator },
      );
    }
    rate = { kind: "exact", numerator, denominator };
  } else {
    const stated = resolvePercentRate(config);
    // Unreachable through the schema, which requires exactly one rate form. It is
    // still an error rather than a default, because treating a missing rate as zero
    // would publish a free permit.
    if (stated === null) {
      throw new CalculationError("invalid_input", "A percent rule states no rate.", {
        basis: config.basis,
      });
    }
    rate = stated;
  }

  const reading = readBasis(facts, config.basis);
  if (!reading.ok) return reading;

  const steps: CalculationStep[] = [];

  /**
   * The portion the rate is charged on: the basis, less the schedule's first band.
   *
   * Subtracting before rounding is what makes "the first 1,000 square feet, plus $93
   * for each additional 500 square feet or portion thereof" work: the increment belongs
   * to the additional area, not to the whole of it. With no threshold this is the basis
   * value unchanged, which is what a percent rule has always been charged on.
   */
  const threshold = config.thresholdCents ?? 0;
  let appliedValue = Math.max(0, reading.value - threshold);

  if (threshold > 0) {
    steps.push({
      label: `Amount above the first ${formatBasisAmount(config.basis, threshold)}`,
      value: formatBasisValue({ ...reading, value: appliedValue }),
    });
  }

  if (config.incrementCents && config.incrementCents > 0) {
    const rounded = roundUpToIncrement(appliedValue, config.incrementCents);
    if (rounded !== appliedValue) {
      steps.push({
        label: `Rounded up to the next ${formatBasisAmount(config.basis, config.incrementCents)} or fraction thereof`,
        value: formatBasisValue({ ...reading, value: rounded }),
      });
    }
    appliedValue = rounded;
  }

  const ratedCents =
    rate.kind === "bps"
      ? applyRateBps(appliedValue, rate.bps)
      : applyExactRate(appliedValue, rate.numerator, rate.denominator);

  const baseCents = config.baseCents ?? 0;
  const amountCents = ratedCents + baseCents;

  steps.unshift({
    label: reading.label,
    value: formatBasisValue({ ...reading, value: appliedValue }),
  });
  steps.push(...tableSteps);
  steps.push({ label: "Rate applied", value: ratePhrase(rate, config) });
  if (baseCents > 0) {
    steps.push({ label: "Add factor", value: formatCents(baseCents) });
  }

  // The row's own published minimum, where the schedule states one for these
  // inputs. It is returned rather than applied so the main loop can take the
  // larger of it and the rule's own `minimumCents` — a schedule can publish a
  // per-row floor *and* a floor for every permit, and both must hold.
  let floorCents: number | undefined;
  if (config.floorTable !== undefined) {
    const match = matchTable(config.floorTable.keys, config.floorTable.entries, facts);
    if (!match.ok && match.reason === "missing") {
      warnings.push(
        `${match.label} is needed for this schedule row's minimum fee and was not provided, so the row's minimum was not applied.`,
      );
    } else if (match.ok) {
      const row = config.floorTable.entries[match.index];
      let rowFloor = row?.minimumCents ?? 0;
      if (row?.perUnit) {
        const value = facts[row.perUnit.factKey];
        if (typeof value === "number" && Number.isFinite(value)) {
          // Both published floors are minimums, so the row's floor is the larger
          // — a per-unit minimum beside a schedule-wide flat one, printed on the
          // same row.
          rowFloor = Math.max(rowFloor, value * row.perUnit.centsPerUnit);
        } else {
          warnings.push(
            `${labelForFactKey(row.perUnit.factKey)} is needed for this schedule row's per-unit minimum fee and was not provided${
              rowFloor > 0 ? "; the row's flat minimum was applied instead" : ", so the row's minimum was not applied"
            }.`,
          );
        }
      }
      if (rowFloor > 0) {
        floorCents = rowFloor;
        steps.push({
          label: config.floorTable.label ?? "Minimum fee for this row",
          value: formatCents(rowFloor),
        });
      }
    }
  }

  steps.push({ label: "Component total", value: formatCents(amountCents) });

  const aboveNote =
    threshold > 0 ? ` above the first ${formatBasisAmount(config.basis, threshold)}` : "";
  const incrementNote =
    config.incrementCents && config.incrementCents > 0
      ? `, or fraction thereof, rounded up in ${formatBasisAmount(config.basis, config.incrementCents)} steps`
      : "";
  const addFactorNote = baseCents > 0 ? ` + ${formatCents(baseCents)}` : "";

  return {
    ok: true,
    amountCents,
    formula: `${ratePhrase(rate, config)}${aboveNote}${incrementNote}${addFactorNote}`,
    steps,
    warnings,
    ...(floorCents !== undefined ? { floorCents } : {}),
  };
}

/**
 * A rate in the published unit: "per additional $1,000 of valuation, or fraction
 * thereof, above a threshold", plus the schedule's Base Charge.
 *
 * This is the shape of the City of Houston structural building permit fee
 * (Bldg. Code Sec. 118.2.1) and of a large number of other US schedules.
 */
/**
 * A "per $1,000" rate in either published form.
 *
 * Two forms because US schedules publish more than one precision: most read
 * "$5.36 per $1,000" (whole cents, `centsPerThousand`), and some read "$4.725 per
 * $1,000" (a fraction of a cent, `rateCentsPerThousand`). Reading the rate in one
 * place means the arithmetic and the sentence a reader sees cannot disagree about
 * which form is in play.
 */
type PerThousandRate = Pick<PerThousandFeeConfig, "basis"> & {
  centsPerThousand?: number;
  rateCentsPerThousand?: { numerator: number; denominator: number };
};

/**
 * The divisor a per-thousand rate needs, which depends on what the basis measures.
 *
 * A "$5.36 per $1,000" rate on a valuation needs cents-to-thousands (100,000); a
 * "$7.26 per 100 amps" or "$11.13 per 100 sq ft" rate on a count basis needs the plain
 * thousands of that unit (1,000). See `PER_THOUSAND_COUNT_DENOMINATOR`.
 */
function perThousandDenominator(basis: FeeBasis): number {
  return isMoneyBasis(basis) ? PER_THOUSAND_DENOMINATOR : PER_THOUSAND_COUNT_DENOMINATOR;
}

function applyPerThousandRate(chargeable: number, config: PerThousandRate): number {
  const denominator = perThousandDenominator(config.basis);
  const exact = config.rateCentsPerThousand;
  if (exact) {
    return applyExactCentsPerThousand(chargeable, exact.numerator, exact.denominator, denominator);
  }
  return applyCentsPerThousand(chargeable, config.centsPerThousand ?? 0, denominator);
}

function describePerThousandRate(config: PerThousandRate): string {
  const per = BASIS_THOUSAND_NOUNS[config.basis];
  const exact = config.rateCentsPerThousand;
  if (exact) return `${formatExactDollarsPerThousand(exact)} per ${per}`;
  return `${formatCents(config.centsPerThousand ?? 0)} per ${per}`;
}

/**
 * Print a fractional cents-per-$1,000 rate as the schedule writes it.
 *
 * `{ numerator: 945, denominator: 2 }` is 472.5 cents per $1,000, which the
 * document prints as `$4.725`. Long division in integers rather than a float, so a
 * rate with several decimals cannot come out as `$4.7249999` in front of a reader.
 */
function formatExactDollarsPerThousand(rate: {
  numerator: number;
  denominator: number;
}): string {
  const microDollars = (BigInt(rate.numerator) * 1_000_000n) / BigInt(rate.denominator * 100);
  const whole = microDollars / 1_000_000n;
  const fraction = (microDollars % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return `$${whole.toString()}${fraction.length > 0 ? `.${fraction}` : ""}`;
}

/**
 * A floor on the whole permit, charged as the difference it makes up.
 *
 * The subtotal is read from the same fact a `permit_fee` or `fee_subtotal` basis reads,
 * which the engine injects before every rule. `permit_fee` is the base permit fee and
 * `fee_subtotal` everything charged so far including surcharges, so a rule of this type
 * placed before the add-on fees reads the fee items and one placed after them reads the
 * bill. Nothing reconciles a unit mismatch here: the fact is in cents and so is the
 * floor, and `validateCond`, the schema and `describeFeeRule` all state which of the two
 * subtotals is meant.
 *
 * The amount is the shortfall, never the floor, so a permit that clears the floor is not
 * charged a second minimum. A rule that is excluded by "while the subtotal is below the
 * floor" can therefore never produce a zero line either — the condition and the amount
 * are two halves of the same statement, and both are needed. Passing a permit that is
 * below the floor because nothing matched at all is excluded upstream: the engine only
 * injects the subtotal fact once there is a subtotal.
 */
function evalPermitMinimum(
  config: { basis: "permit_fee" | "fee_subtotal"; floorCents: number },
  facts: CalculationFacts,
): Evaluation {
  const reading = readBasis(facts, config.basis);
  if (!reading.ok) return reading;

  const shortfall = Math.max(0, config.floorCents - reading.value);

  return {
    ok: true,
    amountCents: shortfall,
    formula: `${formatCents(config.floorCents)} minimum on ${BASIS_LABELS[config.basis].toLowerCase()}, less the ${formatCents(reading.value)} calculated`,
    steps: [
      { label: reading.label, value: formatCents(reading.value) },
      { label: "Minimum fee", value: formatCents(config.floorCents) },
      { label: "Shortfall charged", value: formatCents(shortfall) },
    ],
    warnings: [],
  };
}

function evalPerThousand(
  config: {
    basis: FeeBasis;
    centsPerThousand?: number;
    rateCentsPerThousand?: { numerator: number; denominator: number };
    thresholdCents?: number;
    incrementCents?: number;
    incrementRounding?: "up" | "nearest";
    baseCents?: number;
  },
  facts: CalculationFacts,
): Evaluation {
  const reading = readBasis(facts, config.basis);
  if (!reading.ok) return reading;

  const threshold = config.thresholdCents ?? 0;
  const baseCents = config.baseCents ?? 0;
  const steps: CalculationStep[] = [
    { label: reading.label, value: formatBasisValue(reading) },
  ];

  let chargeable = Math.max(0, reading.value - threshold);

  // The threshold and the increment are measured in the basis's own unit, so they are
  // described in it: "above the first $100,000" for money and "the next 100 A or
  // fraction thereof" for a service size. `formatCents` alone would have printed
  // Miami-Dade's increment as "$100", which is a dollar figure the schedule does not
  // contain.
  if (threshold > 0) {
    steps.push({
      label: `Amount above the first ${formatBasisAmount(config.basis, threshold)}`,
      value: formatBasisValue({ value: chargeable, isCents: reading.isCents, suffix: reading.suffix }),
    });
  }

  // "or fraction thereof" rounds every partial increment up; "to the closest"
  // (Tulsa's wording) rounds a fraction at the half instead, and the schedule's
  // own phrase is what selects between them — see `incrementRounding`.
  if (config.incrementCents && config.incrementCents > 0) {
    const nearest = config.incrementRounding === "nearest";
    const rounded = nearest
      ? roundToNearestIncrement(chargeable, config.incrementCents)
      : roundUpToIncrement(chargeable, config.incrementCents);
    if (rounded !== chargeable) {
      steps.push({
        label: nearest
          ? `Rounded to the closest ${formatBasisAmount(config.basis, config.incrementCents)}`
          : `Rounded up to the next ${formatBasisAmount(config.basis, config.incrementCents)} or fraction thereof`,
        value: formatBasisValue({ value: rounded, isCents: reading.isCents, suffix: reading.suffix }),
      });
    }
    chargeable = rounded;
  }

  const rateAmount = applyPerThousandRate(chargeable, config);
  steps.push({
    label: `At ${describePerThousandRate(config)}`,
    value: formatCents(rateAmount),
  });

  const total = baseCents + rateAmount;

  if (baseCents > 0) {
    steps.push({ label: "Base charge", value: formatCents(baseCents) });
  }
  steps.push({ label: "Component total", value: formatCents(total) });

  const thresholdNote =
    threshold > 0 ? ` above ${formatBasisAmount(config.basis, threshold)}` : "";
  const incrementNote =
    config.incrementCents && config.incrementCents > 0
      ? config.incrementRounding === "nearest"
        ? `, calculated to the closest ${formatBasisAmount(config.basis, config.incrementCents)}`
        : `, or fraction thereof, in ${formatBasisAmount(config.basis, config.incrementCents)} steps`
      : "";

  return {
    ok: true,
    amountCents: total,
    formula:
      `${baseCents > 0 ? `${formatCents(baseCents)} + ` : ""}` +
      `${describePerThousandRate(config)} of ${reading.label.toLowerCase()}${thresholdNote}${incrementNote}`,
    steps,
    warnings: [],
  };
}

function evalTieredMarginal(
  config: {
    basis: FeeBasis;
    baseCents?: number;
    incrementCents?: number;
    tiers: MarginalTier[];
  },
  facts: CalculationFacts,
): Evaluation {
  const reading = readBasis(facts, config.basis);
  if (!reading.ok) return reading;

  const steps: CalculationStep[] = [];
  const baseCents = config.baseCents ?? 0;

  let appliedValue = reading.value;
  if (config.incrementCents && config.incrementCents > 0) {
    const rounded = roundUpToIncrement(reading.value, config.incrementCents);
    if (rounded !== reading.value) {
      steps.push({
        label: `Value rounded up (per ${formatBasisAmount(config.basis, config.incrementCents)} or fraction thereof)`,
        value: formatBasisValue({ ...reading, value: rounded }),
      });
    }
    appliedValue = rounded;
  }

  steps.unshift({ label: reading.label, value: formatBasisValue({ ...reading, value: appliedValue }) });

  let total = baseCents;
  if (baseCents > 0) {
    steps.push({ label: "Base amount", value: formatCents(baseCents) });
  }

  let lowerBound = 0;
  const bandDetails: string[] = [];

  for (let index = 0; index < config.tiers.length; index += 1) {
    const tier = config.tiers[index];
    if (!tier) continue;

    const upperBound = tier.upToCents;
    const bandTop = upperBound === null ? appliedValue : Math.min(appliedValue, upperBound);
    const bandWidth = bandTop - lowerBound;

    if (bandWidth > 0) {
      const bandAmount = applyMarginalRate(bandWidth, tier) + (tier.bandCents ?? 0);
      total += bandAmount;
      steps.push({
        label: `${formatBasisValue({
          value: bandWidth,
          isCents: reading.isCents,
          suffix: reading.suffix,
        })} at ${describeTierRate(config.basis, tier)}`,
        value: formatCents(bandAmount),
      });
      bandDetails.push(formatCents(bandAmount));
    }

    if (upperBound === null) break;
    lowerBound = upperBound;
    if (appliedValue <= upperBound) break;
  }

  steps.push({ label: "Component total", value: formatCents(total) });

  const formulaParts: string[] = [];
  if (baseCents > 0) formulaParts.push(formatCents(baseCents));
  formulaParts.push(describeMarginalBands(config.tiers, config.basis));

  return {
    ok: true,
    amountCents: total,
    formula: formulaParts.join(" + "),
    steps,
    warnings: [],
  };
}

function evalTieredTable(
  config: { basis: FeeBasis; tiers: Array<{ upToCents: number | null; amountCents: number }> },
  facts: CalculationFacts,
): Evaluation {
  const reading = readBasis(facts, config.basis);
  if (!reading.ok) return reading;

  const warnings: string[] = [];
  let lowerBound = 0;
  let chosen: { upToCents: number | null; amountCents: number } | null = null;
  let chosenLower = 0;

  for (const tier of config.tiers) {
    if (tier.upToCents === null || reading.value <= tier.upToCents) {
      chosen = tier;
      chosenLower = lowerBound;
      break;
    }
    lowerBound = tier.upToCents;
  }

  if (chosen === null) {
    // Every bracket is bounded and the value is above all of them. Rather than
    // silently computing nothing, use the highest published bracket and say so.
    const last = config.tiers[config.tiers.length - 1];
    if (!last) {
      return { ok: false, factKey: reading.factKey, label: reading.label };
    }
    chosen = last;
    chosenLower = lowerBound;
    warnings.push(
      `${reading.label} exceeds the highest published bracket, so the top bracket was applied.`,
    );
  }

  const steps: CalculationStep[] = [
    { label: reading.label, value: formatBasisValue(reading) },
    {
      label: "Bracket applied",
      value: describeBracket(chosen.upToCents, chosenLower),
    },
    { label: "Component total", value: formatCents(chosen.amountCents) },
  ];

  return {
    ok: true,
    amountCents: chosen.amountCents,
    formula: `${formatCents(chosen.amountCents)} for ${reading.label.toLowerCase()} ${describeBracket(chosen.upToCents, chosenLower)}`,
    steps,
    warnings,
  };
}

/**
 * A rate per countable thing, in words: the one place both the formula description and
 * the evaluated component's formula are built.
 *
 * Two shapes, and the distinction is not cosmetic. A rule with a base charge says
 * "$195.00 for the first backflow device, plus $98.00 for each additional backflow
 * device". A rule with an allowance and no base charge is a different statement — the
 * thing itself is already paid for by the permit fee — and saying it as "$0.00 for the
 * first 1 meters" is both ungrammatical and wrong about what happened.
 *
 * Found by reading Phoenix's meter row on the rendered page: `$98 each` once the first
 * meter is included in the permit fee had been transcribed into a formula that appeared
 * to charge nothing for the first meter rather than to include it.
 */
function describePerUnit(config: {
  unit: PerUnitKind;
  centsPerUnit: number;
  baseCents?: number;
  thresholdUnits?: number;
  incrementUnits?: number;
}): string {
  const label = PER_UNIT_LABELS[config.unit];
  const baseCents = config.baseCents ?? 0;

  /**
   * A rate charged in blocks says so, in the block's own words.
   *
   * Newark's "First 50 — $58; Each additional 20 — $12" is 60 cents per device with
   * `incrementUnits: 20`, and printing the stored rate would describe the row as "$0.60 for
   * each additional outlet" — true of the arithmetic and false of the document, which
   * charges the whole next block of twenty as soon as the fifty-first outlet is on the
   * permit. The block price is the rate times the block, which is the only sentence that
   * reproduces what a filer is billed.
   */
  const increment = config.incrementUnits;
  const blockPlural = increment
    ? `${formatNumber(increment)} ${PER_UNIT_PLURALS[config.unit]}`
    : null;
  const additional = blockPlural
    ? `${formatCents(config.centsPerUnit * (increment ?? 1))} for each additional ${blockPlural} or part thereof`
    : `${formatCents(config.centsPerUnit)} for each additional ${label}`;

  if (config.thresholdUnits === undefined) {
    return blockPlural
      ? `${formatCents(config.centsPerUnit)} per ${label}, charged in blocks of ${blockPlural}`
      : `${formatCents(config.centsPerUnit)} per ${label}`;
  }

  const count = config.thresholdUnits;

  /**
   * A zero allowance is not an allowance of zero units, it is the absence of one.
   *
   * This case rendered as "the first 0 fixtures is included in the permit fee, then
   * $27.00 for each additional fixture" — a sentence that is both ungrammatical and
   * wrong about the arithmetic, because a base charge with no allowance is charged in
   * *addition* to every unit: King County's plumbing permit is $137.00 and then $27.00
   * for each fixture, so one fixture is $164.00. Found on the Oregon electrical and
   * plumbing rows, which are the same shape, and it was on the two Washington plumbing
   * pages already.
   */
  if (count === 0) {
    return baseCents > 0
      ? `${formatCents(baseCents)} plus ${formatCents(config.centsPerUnit)} per ${label}`
      : `${formatCents(config.centsPerUnit)} per ${label}`;
  }

  const included =
    count === 1
      ? `the first ${label}`
      : `the first ${formatNumber(count)} ${PER_UNIT_PLURALS[config.unit]}`;

  if (baseCents === 0) {
    return `${included} is included in the permit fee, then ${additional}`;
  }

  return `${formatCents(baseCents)} for ${included}, plus ${additional}`;
}

function evalPerUnit(
  config: {
    unit: PerUnitKind;
    centsPerUnit: number;
    baseCents?: number;
    thresholdUnits?: number;
    incrementUnits?: number;
  },
  facts: CalculationFacts,
): Evaluation {
  const factKey = PER_UNIT_FACT_KEYS[config.unit];
  const raw = facts[factKey];
  const label = PER_UNIT_LABELS[config.unit];

  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return { ok: false, factKey, label: `${PER_UNIT_LABELS[config.unit]} count` };
  }

  const baseCents = config.baseCents ?? 0;
  const allowance = config.thresholdUnits;
  let chargeableUnits = allowance === undefined ? raw : Math.max(0, raw - allowance);

  const steps: CalculationStep[] = [
    { label: `Number of ${PER_UNIT_PLURALS[config.unit]}`, value: formatNumber(raw) },
  ];

  if (allowance !== undefined) {
    steps.push({
      label: `Included in the base charge (first ${formatNumber(allowance)})`,
      value: formatNumber(Math.min(raw, allowance)),
    });
  }

  // "Each additional 20 or fraction thereof": the excess is bought in whole blocks
  // before the rate is applied, exactly as `incrementCents` rounds money above a
  // threshold. The step is recorded only when it changed the number, so a row that
  // lands on a block boundary does not show a rounding line that rounds nothing.
  if (config.incrementUnits !== undefined && config.incrementUnits > 1) {
    const rounded = roundUpToIncrement(chargeableUnits, config.incrementUnits);
    if (rounded !== chargeableUnits) {
      steps.push({
        label: `Rounded up to the next ${formatNumber(config.incrementUnits)} ${PER_UNIT_PLURALS[config.unit]} or part thereof`,
        value: formatNumber(rounded),
      });
    }
    chargeableUnits = rounded;
  }

  if (allowance !== undefined || config.incrementUnits !== undefined) {
    steps.push({
      label: `Charged per ${label}`,
      value: formatNumber(chargeableUnits),
    });
  }

  const amountCents = baseCents + config.centsPerUnit * chargeableUnits;

  if (baseCents > 0) {
    steps.push({ label: "Base charge", value: formatCents(baseCents) });
  }
  steps.push({ label: "Rate per unit", value: formatCents(config.centsPerUnit) });
  steps.push({ label: "Component total", value: formatCents(amountCents) });

  return {
    ok: true,
    amountCents,
    formula: describePerUnit(config),
    steps,
    warnings: [],
  };
}

function evaluateRule(rule: ValidatedFeeRule, facts: CalculationFacts): Evaluation {
  switch (rule.feeType) {
    case "flat":
      return evalFlat(rule.config);
    case "percent":
      return evalPercent(rule.config, facts);
    case "per_thousand":
      return evalPerThousand(rule.config, facts);
    case "tiered_marginal":
      return evalTieredMarginal(rule.config, facts);
    case "tiered_table":
      return evalTieredTable(rule.config, facts);
    case "per_unit":
      return evalPerUnit(rule.config, facts);
    case "permit_minimum":
      return evalPermitMinimum(rule.config, facts);
    default: {
      const unreachable: never = rule;
      throw new Error(`Unhandled fee type: ${JSON.stringify(unreachable)}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Ordering                                                                   */
/* -------------------------------------------------------------------------- */

function compareRules(a: FeeRuleRecord, b: FeeRuleRecord): number {
  if (a.priority !== b.priority) return a.priority - b.priority;
  const componentA = COMPONENT_ORDER.indexOf(a.componentType);
  const componentB = COMPONENT_ORDER.indexOf(b.componentType);
  if (componentA !== componentB) return componentA - componentB;
  return a.code.localeCompare(b.code);
}

/* -------------------------------------------------------------------------- */
/* Public entry point                                                         */
/* -------------------------------------------------------------------------- */

export function calculatePermitFees(
  input: CalculationInput,
  rules: FeeRuleRecord[],
): CalculationResult {
  const asOf = normalizeIsoDate(input.asOf);
  const facts = buildFacts(input);

  const components: CalculationComponent[] = [];
  const excluded: ExcludedRule[] = [];
  const warnings: string[] = [];
  const missingFacts = new Map<string, string>();

  const ordered = [...rules].sort(compareRules);

  /**
   * Evaluation order, which is deliberately not display order.
   *
   * A rule priced against `permit_fee` — the City of Phoenix charges plan review
   * as "80% of the permit fee, minimum $195" — has to run after the base fee it is
   * a percentage of, or it would read zero. Rather than rely on every jurisdiction
   * assigning priorities that happen to order its rules correctly, base components
   * are evaluated first and the result is put back into schedule order before it is
   * returned. A component's own amount never depends on evaluation order; only a
   * `permit_fee` rule's does, and this is what guarantees it.
   */
  const evaluationOrder = [...ordered].sort(
    (a, b) => (a.componentType === "base" ? 0 : 1) - (b.componentType === "base" ? 0 : 1),
  );

  /** The base fee accumulated so far. This is what a `permit_fee` rule reads. */
  let baseSubtotalCents = 0;

  /**
   * Every component accumulated so far, whatever its type. This is what a
   * `fee_subtotal` rule reads — a surcharge on the whole bill rather than on one
   * part of it. It grows by every amount charged, in evaluation order, so a rule
   * that must not be inside the subtotal it reads has to be ordered after the rule
   * that reads it (see the priority comment on `compareRules`).
   */
  let chargedSubtotalCents = 0;

  for (const record of evaluationOrder) {
    // Injected before every rule. By the time any non-base rule runs, every base
    // component has run, so this is the whole base subtotal where it matters.
    //
    // Only set once there IS a subtotal. A rule priced against the permit fee that
    // runs before any base fee applied is a configuration error, and leaving the
    // fact absent makes it surface as a missing input — an excluded component and a
    // warning — rather than as a confident 0% of nothing.
    if (baseSubtotalCents > 0) {
      facts[BASIS_FACT_KEYS.permit_fee] = baseSubtotalCents;
    }

    // Injected on the same principle, and for the same reason: a surcharge on the
    // whole bill is only defined once there IS a bill to surcharge.
    if (chargedSubtotalCents > 0) {
      facts[BASIS_FACT_KEYS.fee_subtotal] = chargedSubtotalCents;
    }

    if (record.status !== "active") {
      excluded.push({
        ruleId: record.id,
        code: record.code,
        label: record.label,
        reason: "inactive",
        detail: `Rule status is "${record.status}".`,
      });
      continue;
    }

    if (!isWithinEffectiveWindow(asOf, record.effectiveFrom, record.effectiveTo)) {
      excluded.push({
        ruleId: record.id,
        code: record.code,
        label: record.label,
        reason: "not_effective",
        detail:
          record.effectiveTo === null
            ? `Not in effect on ${asOf} (starts ${record.effectiveFrom}).`
            : `Not in effect on ${asOf} (applied ${record.effectiveFrom} to ${record.effectiveTo}).`,
      });
      continue;
    }

    const validation = validateFeeRule(record);
    if (!validation.ok) {
      excluded.push({
        ruleId: record.id,
        code: record.code,
        label: record.label,
        reason: "invalid_rule",
        detail: validation.error,
      });
      warnings.push(
        `A fee rule (${record.code}) could not be read and was left out of this estimate.`,
      );
      continue;
    }

    const rule = validation.rule;

    if (!evaluateCondition(rule.conditions, facts)) {
      excluded.push({
        ruleId: rule.id,
        code: rule.code,
        label: rule.label,
        reason: "conditions_not_met",
        detail: "This fee does not apply to the inputs provided.",
      });
      continue;
    }

    // A rule that passes schema validation can still fail to evaluate, so the
    // failure is contained to that one rule: excluding it and saying so beats
    // either throwing away every other component or reporting a wrong number.
    let evaluation: Evaluation;
    try {
      evaluation = evaluateRule(rule, facts);
    } catch {
      excluded.push({
        ruleId: rule.id,
        code: rule.code,
        label: rule.label,
        reason: "invalid_rule",
        detail: "This rule could not be read and was left out of the estimate.",
      });
      warnings.push(
        `A fee rule (${rule.code}) could not be read and was left out of this estimate.`,
      );
      continue;
    }

    if (!evaluation.ok) {
      // The inputs were given and the schedule publishes nothing for them: the
      // honest report is that this fee does not apply here, not that something
      // the reader forgot to type is missing. Same exclusion family as a failed
      // condition, so the breakdown lists it among "fees that do not apply here".
      if (evaluation.reason === "no_published_rate") {
        excluded.push({
          ruleId: rule.id,
          code: rule.code,
          label: rule.label,
          reason: "conditions_not_met",
          detail: `The schedule publishes no rate for ${evaluation.label}.`,
        });
        continue;
      }

      excluded.push({
        ruleId: rule.id,
        code: rule.code,
        label: rule.label,
        reason: "missing_input",
        detail: `${evaluation.label} was not provided, so this component could not be calculated.`,
      });
      missingFacts.set(evaluation.factKey, evaluation.label);
      continue;
    }

    for (const warning of evaluation.warnings) {
      warnings.push(`${rule.label}: ${warning}`);
    }

    // The larger floor wins: a schedule can publish a floor for every permit
    // (`minimumCents`) and a different floor for the row the inputs select
    // (`floorTable`), and both are minimums rather than alternatives.
    const floor = Math.max(rule.minimumCents ?? 0, evaluation.floorCents ?? 0);
    const { amountCents, appliedMinimum, appliedMaximum } = applyMinMax(
      evaluation.amountCents,
      floor > 0 ? floor : null,
      rule.maximumCents,
    );

    const steps = [...evaluation.steps];
    if (appliedMinimum) {
      steps.push({
        label: "Minimum fee applied",
        value: formatCents(amountCents),
      });
    }
    if (appliedMaximum) {
      steps.push({
        label: "Maximum fee applied",
        value: formatCents(amountCents),
      });
    }

    components.push({
      ruleId: rule.id,
      code: rule.code,
      label: rule.label,
      description: rule.description,
      componentType: rule.componentType,
      amountCents,
      formula: evaluation.formula,
      steps,
      sourceId: rule.sourceId,
    });

    chargedSubtotalCents += amountCents;

    if (rule.componentType === "base") {
      baseSubtotalCents += amountCents;
    }
  }

  // Display order, restored: the breakdown reads in the schedule's own order
  // whatever order the two passes evaluated it in.
  const scheduleIndex = new Map(ordered.map((record, index) => [record.id, index]));
  const byScheduleOrder = (a: { ruleId: string }, b: { ruleId: string }): number =>
    (scheduleIndex.get(a.ruleId) ?? 0) - (scheduleIndex.get(b.ruleId) ?? 0);
  components.sort(byScheduleOrder);
  excluded.sort(byScheduleOrder);

  const totalCents = components.reduce((sum, component) => sum + component.amountCents, 0);

  const assumptions: string[] = [
    `Calculated from ${components.length} fee rule${components.length === 1 ? "" : "s"} in effect on ${asOf}.`,
    "Amounts are rounded to the nearest cent, once, at the end of each component.",
  ];

  if (components.length === 0) {
    warnings.push(
      "No fee rules matched this combination of jurisdiction, permit type and inputs, so no amount could be calculated.",
    );
  }

  for (const [factKey, label] of missingFacts) {
    warnings.push(
      `${label} is required by at least one fee rule and was not provided (input "${factKey}").`,
    );
  }

  return {
    currency: "USD",
    totalCents,
    components,
    excluded,
    assumptions,
    warnings,
    appliedRuleIds: components.map((component) => component.ruleId),
    asOf,
  };
}
