import type {
  ConditionLeaf,
  ExactRate,
  FeeRuleRecord,
  FloorTableEntry,
  RateTableEntry,
} from "@/lib/calc/types";

/**
 * Chicago, Illinois — **the jurisdiction that prices a building permit from area and a
 * pair of published factor tables, with no valuation anywhere in the formula.**
 *
 * §14A-4-412.2.2.1 of the Chicago Construction Codes Administrative Provisions states:
 *
 *   permit fee = CF × RF × A
 *     CF = construction factor, Table 14A-12-1204.3(1)  (occupancy class × construction type)
 *     RF = scope of review factor, Table 14A-12-1204.3(3) new construction
 *                                 Table 14A-12-1204.3(4) rehabilitation
 *     A  = gross floor area of all construction work, in square feet
 *
 * The trade permits come from a different mechanism entirely: Table 14A-12-1204.2 lists
 * **stand-alone fees** for permits that cover only the scopes named there, and §14A-4-412.1
 * says a permit that covers more than one listed scope pays **each applicable fee** — the
 * rows stack. Every electrical and plumbing row below is one such stand-alone fee, and the
 * rules stack the way the code says they do.
 *
 * **Why the building fee is two lookup tables and not a rule per cell.** Neither factor is
 * a fee of its own: CF depends on occupancy class and construction type, RF on occupancy
 * class and description of work, and the fee is their product times the area. Written as
 * ordinary rules that is one rule per cell of a 14 × 5 × 30 cross product — over a thousand
 * rules, each of which would be listed in the fee-structure table on the page. The
 * selection therefore lives in the rule's `rateTables`, and the product is taken as exact
 * fractions so `0.78 × 0.75 × 2,400` does not drift a cent.
 *
 * **The global minimum, read as printed.** Footnote c of the 2026 tables states "A minimum
 * fee of $602 applies to all permits" (raised from $302 by SO2025-0021719; $302 for a
 * temporary structure). The Minimum Fee column of the same tables prints $600 and $300 on
 * some rows — amounts that were themselves last year's global floor. Both are minimums, so
 * the engine applies the larger, exactly as `FloorTableEntry` documents: each row here
 * carries its full literal minimum, already the larger of its printed column and the global
 * floor. A $600 row therefore floors at $602.00, and a temporary structure at $302.00.
 * See `research/illinois/chicago.md` §3 and §7.3.
 *
 * **Demolition is not the formula.** Footnote d of Table 14A-12-1204.3(4) says demolition
 * permits under §14A-4-407 "are not subject to the area- and construction-factor-based fee
 * formula and are only subject to the minimum fees in this table" — a flat $600 for ordinary
 * demolition and $2,450 for complex demolition, charged here as flats with the $602 floor on
 * the ordinary one.
 */

/** The date DOB published the 2026 tables as effective: SO2025-0021719 plus ten days. */
export const CHI_FEE_EFFECTIVE_FROM = "2026-01-06";

export const CHI_BUILDING_SOURCE_KEY = "chicago-2026-permit-fee-tables";
export const CHI_ORDINANCE_SOURCE_KEY = "chicago-so2025-0021719";
export const CHI_CODE_EXCERPTS_SOURCE_KEY = "chicago-permit-fee-excerpts-2022";
export const CHI_CALCULATOR_SOURCE_KEY = "chicago-permit-fee-calculator";
export const CHI_EXPRESS_PERMIT_SOURCE_KEY = "chicago-express-permit-program";

/** Footnote c, 2026 tables (4)/(5)/(6): "A minimum fee of $602 applies to all permits". */
export const CHI_GLOBAL_MINIMUM_CENTS = 60_200;
/** Footnote c, Table (3): "$302 for temporary structures, $602 for all other permits". */
export const CHI_TEMPORARY_MINIMUM_CENTS = 30_200;

/** Footnote d, Table (4): the two flat demolition fees of §14A-4-407. */
export const CHI_DEMOLITION_ORDINARY_CENTS = 60_000;
export const CHI_DEMOLITION_COMPLEX_CENTS = 245_000;

/** The occupancy classifications Table 14A-12-1204.3(1) prints a column of factors for. */
export const CHI_OCCUPANCY_GROUPS = [
  "A",
  "B",
  "E",
  "F",
  "H",
  "I",
  "M",
  "R-1",
  "R-2",
  "R-3",
  "R-4",
  "R-5",
  "S",
  "U",
] as const;

export const CHI_CONSTRUCTION_TYPES = ["I", "II", "III", "IV", "V"] as const;

/** The value `custom.scope` takes when the work is a demolition permit. */
export const CHI_SCOPE_DEMOLITION_ORDINARY = "demolition_ordinary";
export const CHI_SCOPE_DEMOLITION_COMPLEX = "demolition_complex";

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
    effectiveFrom: CHI_FEE_EFFECTIVE_FROM,
    effectiveTo: null,
    status: "active",
    sourceId,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Table 14A-12-1204.3(1) — the construction factor                           */
/* -------------------------------------------------------------------------- */

/**
 * Table 14A-12-1204.3(1), dollars per square foot, occupancy class (row) × construction
 * type I–V (column). R-1, R-2 and R-3 share one printed row, as do R-4 and R-5; the values
 * are repeated per classification here so a reader enters their actual group and neither
 * table has to know about a wildcard.
 */
const CONSTRUCTION_FACTOR_ROWS: Array<[group: string, perType: number[]]> = [
  ["A", [97, 90, 86, 83, 74]],
  ["B", [84, 78, 74, 69, 61]],
  ["E", [87, 80, 79, 73, 64]],
  ["F", [57, 45, 42, 39, 32]],
  ["H", [84, 78, 74, 69, 61]],
  ["I", [106, 98, 97, 86, 78]],
  ["M", [61, 56, 52, 50, 42]],
  ["R-1", [84, 78, 78, 70, 63]],
  ["R-2", [84, 78, 78, 70, 63]],
  ["R-3", [84, 78, 78, 70, 63]],
  ["R-4", [52, 50, 49, 47, 44]],
  ["R-5", [52, 50, 49, 47, 44]],
  ["S", [53, 41, 39, 35, 28]],
  ["U", [35, 30, 29, 27, 23]],
];

const CONSTRUCTION_FACTOR_ENTRIES: RateTableEntry[] = CONSTRUCTION_FACTOR_ROWS.flatMap(
  ([group, perType]) =>
    perType.map((cents, index) => ({
      values: [group, CHI_CONSTRUCTION_TYPES[index] as string],
      // The numerator is **cents per square foot**, which is how `currency_per_unit`
      // reads it: `97` is `$0.97 per sq ft`, not `0.97`.
      rate: { numerator: cents, denominator: 1 },
    })),
);

/* -------------------------------------------------------------------------- */
/* Tables 14A-12-1204.3(3)/(4) — the scope of review factor                   */
/* -------------------------------------------------------------------------- */

/**
 * One row of a scope-of-review table: the occupancy group it is printed under, the
 * description of work it corresponds to, the factor, and the Minimum Fee column.
 *
 * `min` is the printed flat minimum in cents; `perStory` and `perUnit` are the two
 * per-unit minimums the schedule prints ("$900 per story", "$250 per unit served",
 * "$300 per unit"). A row whose group is `"*"` is from Table (4)'s "All occupancies"
 * block and is expanded across every classification, because the schedule prints it
 * once for all of them.
 */
type ScopeRow = {
  group: string;
  scope: string;
  factor: ExactRate;
  min?: number;
  perStory?: number;
  perUnit?: number;
  /** A temporary structure: footnote c gives it the $302 floor rather than $602. */
  temporary?: boolean;
};

/** Groups whose single printed row the schedule means for every R classification. */
const GROUP_EXPANSIONS: Record<string, readonly string[]> = {
  R: ["R-1", "R-2", "R-3", "R-4", "R-5"],
};

function expandGroups(row: ScopeRow): string[] {
  if (row.group === "*") return [...CHI_OCCUPANCY_GROUPS];
  return [...(GROUP_EXPANSIONS[row.group] ?? [row.group])];
}

/** Table 14A-12-1204.3(3) — scope of review factor, new construction. */
const NEW_CONSTRUCTION_ROWS: ScopeRow[] = [
  { group: "A", scope: "new_all", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "B", scope: "new_tenant_buildout", factor: { numerator: 1, denominator: 2 }, perStory: 90_000 },
  { group: "B", scope: "new_single_story", factor: { numerator: 3, denominator: 4 }, min: 365_000 },
  { group: "B", scope: "new_telecom_area", factor: { numerator: 3, denominator: 4 }, min: 245_000 },
  { group: "B", scope: "new_ambulatory_care", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "B", scope: "new_multi_story", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "E", scope: "new_tenant_buildout", factor: { numerator: 1, denominator: 2 }, perStory: 90_000 },
  { group: "E", scope: "new_all", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "F", scope: "new_single_story_unregulated", factor: { numerator: 3, denominator: 4 }, min: 245_000 },
  { group: "F", scope: "new_multi_story_unregulated", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "F", scope: "new_regulated_equipment", factor: { numerator: 5, denominator: 4 }, min: 365_000 },
  { group: "H", scope: "new_unregulated", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "H", scope: "new_regulated_equipment", factor: { numerator: 5, denominator: 4 }, min: 365_000 },
  { group: "I", scope: "new_unregulated", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "I", scope: "new_regulated_equipment", factor: { numerator: 5, denominator: 4 }, min: 365_000 },
  { group: "M", scope: "new_tenant_buildout", factor: { numerator: 1, denominator: 2 }, perStory: 90_000 },
  { group: "M", scope: "new_single_story", factor: { numerator: 3, denominator: 4 }, min: 365_000 },
  { group: "M", scope: "new_multi_story", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "R", scope: "new_detached_garage", factor: { numerator: 1, denominator: 2 }, min: 60_000 },
  { group: "R", scope: "new_small_residential", factor: { numerator: 3, denominator: 4 }, min: 245_000 },
  { group: "R", scope: "new_large_residential", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "R", scope: "new_sleeping_units", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "S", scope: "new_single_story_unregulated", factor: { numerator: 3, denominator: 4 }, min: 245_000 },
  { group: "S", scope: "new_multi_story_unregulated", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "S", scope: "new_regulated_equipment", factor: { numerator: 5, denominator: 4 }, min: 365_000 },
  { group: "U", scope: "new_detached_garage", factor: { numerator: 1, denominator: 2 }, min: 60_000 },
  {
    group: "U",
    scope: "new_temporary_structure",
    factor: { numerator: 1, denominator: 2 },
    min: 30_000,
    temporary: true,
  },
  { group: "U", scope: "new_low_structure", factor: { numerator: 3, denominator: 4 }, min: 30_000 },
  { group: "U", scope: "new_tall_structure", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
];

/** Table 14A-12-1204.3(4) — scope of review factor, rehabilitation. */
const REHABILITATION_ROWS: ScopeRow[] = [
  // The "All occupancies" block, printed once and applying to every classification.
  { group: "*", scope: "rehab_repair_nonstructural", factor: { numerator: 1, denominator: 4 }, min: 60_000 },
  { group: "*", scope: "rehab_single_mep", factor: { numerator: 1, denominator: 4 }, min: 60_000 },
  { group: "*", scope: "rehab_level1", factor: { numerator: 1, denominator: 4 }, min: 60_000 },
  { group: "*", scope: "rehab_roof_structural", factor: { numerator: 1, denominator: 4 }, min: 90_000 },
  { group: "*", scope: "rehab_structural_repair", factor: { numerator: 1, denominator: 2 }, min: 90_000 },
  { group: "*", scope: "rehab_relocated_building", factor: { numerator: 1, denominator: 2 }, min: 180_000 },
  { group: "*", scope: "rehab_change_occupancy_no_hazard", factor: { numerator: 3, denominator: 4 }, min: 245_000 },
  { group: "*", scope: "rehab_change_occupancy_food", factor: { numerator: 1, denominator: 1 }, min: 180_000 },
  { group: "*", scope: "rehab_change_occupancy_hazard", factor: { numerator: 1, denominator: 1 }, min: 365_000 },

  { group: "A", scope: "rehab_multi_mep", factor: { numerator: 1, denominator: 2 }, min: 180_000 },
  { group: "A", scope: "rehab_level2_3_under_300", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "A", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "A", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "A", scope: "rehab_level2_3_300_plus", factor: { numerator: 1, denominator: 1 }, min: 365_000 },

  { group: "B", scope: "rehab_level2_3_single_tenant", factor: { numerator: 1, denominator: 2 }, min: 90_000 },
  { group: "B", scope: "rehab_level2_3_common_single_story", factor: { numerator: 1, denominator: 2 }, min: 90_000 },
  { group: "B", scope: "rehab_multi_mep", factor: { numerator: 1, denominator: 2 }, min: 90_000 },
  { group: "B", scope: "rehab_level2_3_common_multi_story", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "B", scope: "rehab_level2_3_multi_tenant", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "B", scope: "rehab_level2_3_food", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "B", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "B", scope: "rehab_telecom_new", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "B", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 365_000 },

  { group: "E", scope: "rehab_multi_mep", factor: { numerator: 1, denominator: 2 }, min: 180_000 },
  { group: "E", scope: "rehab_level2_3", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "E", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "E", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 365_000 },

  { group: "F", scope: "rehab_multi_mep", factor: { numerator: 1, denominator: 2 }, min: 180_000 },
  { group: "F", scope: "rehab_level2_3_single_story", factor: { numerator: 3, denominator: 4 }, min: 90_000 },
  { group: "F", scope: "rehab_level2_3_multi_story", factor: { numerator: 1, denominator: 1 }, min: 180_000 },
  { group: "F", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "F", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "F", scope: "rehab_regulated_equipment", factor: { numerator: 5, denominator: 4 }, min: 180_000 },

  { group: "H", scope: "rehab_multi_mep", factor: { numerator: 1, denominator: 2 }, min: 180_000 },
  { group: "H", scope: "rehab_level2_3_single_story", factor: { numerator: 3, denominator: 4 }, min: 245_000 },
  { group: "H", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "H", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "H", scope: "rehab_level2_3_multi_story", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "H", scope: "rehab_regulated_equipment", factor: { numerator: 5, denominator: 4 }, min: 180_000 },

  { group: "I", scope: "rehab_multi_mep", factor: { numerator: 1, denominator: 2 }, min: 180_000 },
  { group: "I", scope: "rehab_level2_3_single_story", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "I", scope: "rehab_machine_room", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "I", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "I", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "I", scope: "rehab_level2_3_multi_story", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "I", scope: "rehab_regulated_equipment", factor: { numerator: 5, denominator: 4 }, min: 180_000 },

  { group: "M", scope: "rehab_level2_3_single_tenant", factor: { numerator: 1, denominator: 2 }, min: 90_000 },
  { group: "M", scope: "rehab_level2_3_common_single_story", factor: { numerator: 1, denominator: 2 }, min: 90_000 },
  { group: "M", scope: "rehab_multi_mep", factor: { numerator: 1, denominator: 2 }, min: 90_000 },
  { group: "M", scope: "rehab_level2_3_structural", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "M", scope: "rehab_level2_3_common_multi_story", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "M", scope: "rehab_level2_3_multi_tenant", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "M", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "M", scope: "rehab_telecom_new", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "M", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 245_000 },

  { group: "R", scope: "rehab_structural_repair_small", factor: { numerator: 1, denominator: 4 }, min: 60_000 },
  { group: "R", scope: "rehab_porch_balcony", factor: { numerator: 1, denominator: 2 }, perUnit: 25_000 },
  { group: "R", scope: "rehab_level2_3_small", factor: { numerator: 1, denominator: 2 }, min: 60_000 },
  { group: "R", scope: "rehab_level2_3_single_unit", factor: { numerator: 1, denominator: 2 }, min: 60_000 },
  { group: "R", scope: "rehab_multi_shared_mep", factor: { numerator: 1, denominator: 2 }, min: 180_000 },
  { group: "R", scope: "rehab_level2_3_4_29_units", factor: { numerator: 3, denominator: 4 }, perUnit: 30_000 },
  { group: "R", scope: "rehab_addition_small", factor: { numerator: 3, denominator: 4 }, min: 90_000 },
  { group: "R", scope: "rehab_level2_common_large", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "R", scope: "rehab_level2_3_30_plus_units", factor: { numerator: 1, denominator: 1 }, perUnit: 30_000 },
  { group: "R", scope: "rehab_units_decrease", factor: { numerator: 1, denominator: 1 }, min: 180_000 },
  { group: "R", scope: "rehab_units_increase", factor: { numerator: 1, denominator: 1 }, min: 180_000 },
  { group: "R", scope: "rehab_addition_large", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "R", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 245_000 },

  { group: "S", scope: "rehab_multi_mep", factor: { numerator: 1, denominator: 2 }, min: 180_000 },
  { group: "S", scope: "rehab_level2_3_single_story", factor: { numerator: 3, denominator: 4 }, min: 90_000 },
  { group: "S", scope: "rehab_level2_3_multi_story", factor: { numerator: 3, denominator: 4 }, min: 180_000 },
  { group: "S", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 245_000 },
  { group: "S", scope: "rehab_mixed_separations", factor: { numerator: 1, denominator: 1 }, min: 365_000 },
  { group: "S", scope: "rehab_regulated_equipment", factor: { numerator: 5, denominator: 4 }, min: 180_000 },

  { group: "U", scope: "rehab_level2_3_single_story", factor: { numerator: 3, denominator: 4 }, min: 30_000 },
  { group: "U", scope: "rehab_level2_3_multi_story", factor: { numerator: 1, denominator: 1 }, min: 60_000 },
  { group: "U", scope: "rehab_addition", factor: { numerator: 1, denominator: 1 }, min: 60_000 },
];

function rateEntries(rows: ScopeRow[]): RateTableEntry[] {
  return rows.flatMap((row) =>
    expandGroups(row).map((group) => ({
      values: [group, row.scope],
      rate: row.factor,
    })),
  );
}

/**
 * The Minimum Fee column, with footnote c's global floor folded in.
 *
 * A row's floor is `max(this row's printed minimum, the global minimum the same footnote
 * applies to all permits)` — the larger of two minimums, which is what the engine would
 * compute anyway if the global floor were stated as the rule's own `minimumCents`. Folding
 * it into the row is what lets Table (3)'s temporary-structure row keep its own $302 global
 * floor without the rule's $602 overriding it.
 */
function floorEntries(rows: ScopeRow[]): FloorTableEntry[] {
  return rows.flatMap((row) =>
    expandGroups(row).map((group) => {
      const global = row.temporary === true ? CHI_TEMPORARY_MINIMUM_CENTS : CHI_GLOBAL_MINIMUM_CENTS;
      const entry: FloorTableEntry = {
        values: [group, row.scope],
        minimumCents: Math.max(row.min ?? 0, global),
      };
      if (row.perStory !== undefined) {
        entry.perUnit = { factKey: "custom.stories", centsPerUnit: row.perStory };
      } else if (row.perUnit !== undefined) {
        entry.perUnit = { factKey: "units", centsPerUnit: row.perUnit };
      }
      return entry;
    }),
  );
}

const SCOPE_KEYS = ["custom.occupancy_group", "custom.scope"];

/**
 * Every scope slug the two factor tables publish, in the order the schedule prints them.
 *
 * The two sets are **disjoint**, and that is what makes the pair of formula rules safe: a
 * scope belongs to either Table (3) or Table (4) and never both, so exactly one of the two
 * rules matches any project and the other is excluded for publishing no rate rather than
 * charged as well. `tests/content/chicago-seed.test.ts` asserts the disjointness, because a
 * duplicated slug would silently double a building fee.
 */
export const CHI_NEW_CONSTRUCTION_SCOPES = [
  ...new Set(NEW_CONSTRUCTION_ROWS.map((row) => row.scope)),
];
export const CHI_REHABILITATION_SCOPES = [...new Set(REHABILITATION_ROWS.map((row) => row.scope))];

/* -------------------------------------------------------------------------- */
/* Electrical and plumbing — Table 14A-12-1204.2 stand-alone fees             */
/* -------------------------------------------------------------------------- */

const ELECTRICAL_SERVICE_BANDS: Array<{
  key: string;
  label: string;
  cents: number;
  conditions: ConditionLeaf[];
}> = [
  {
    key: "UNDER-400",
    label: "Installation of electrical service only, less than 400 amperes",
    cents: 7_500,
    conditions: [
      { field: "custom.service_amperage", op: "exists" },
      { field: "custom.service_amperage", op: "lt", value: 400 },
    ],
  },
  {
    key: "400-999",
    label: "Installation of electrical service only, 400 to less than 1,000 amperes",
    cents: 30_000,
    conditions: [
      { field: "custom.service_amperage", op: "gte", value: 400 },
      { field: "custom.service_amperage", op: "lt", value: 1_000 },
    ],
  },
  {
    key: "1000-PLUS",
    label: "Installation of electrical service only, 1,000 amperes or more",
    cents: 75_000,
    conditions: [
      { field: "custom.service_amperage", op: "gte", value: 1_000 },
    ],
  },
];

const ELECTRICAL_CIRCUIT_BANDS: Array<{
  key: string;
  label: string;
  cents: number;
  min: number;
  max: number | null;
}> = [
  { key: "1-10", label: "up to 10 new circuits on a single service", cents: 15_000, min: 1, max: 10 },
  { key: "11-20", label: "11 to 20 new circuits on a single service", cents: 30_000, min: 11, max: 20 },
  { key: "21-40", label: "21 to 40 new circuits on a single service", cents: 60_000, min: 21, max: 40 },
  { key: "41-80", label: "41 to 80 new circuits on a single service", cents: 150_000, min: 41, max: 80 },
  { key: "81-PLUS", label: "81 new circuits or more on a single service", cents: 225_000, min: 81, max: null },
];

const ELECTRICAL_ITEMS: Array<{ item: string; code: string; label: string; cents: number }> = [
  {
    item: "emergency_lighting",
    code: "ELEC-EMERGENCY-LIGHTING",
    label: "Installation of emergency lighting system",
    cents: 12_500,
  },
  {
    item: "permanent_generator",
    code: "ELEC-GENERATOR-PERMANENT",
    label: "Installation of permanent power generator, whether required or discretionary",
    cents: 75_000,
  },
  {
    item: "residential_generator",
    code: "ELEC-GENERATOR-RESIDENTIAL",
    label: "Permanent power generator for a residential building with 3 or fewer dwelling units",
    cents: 7_500,
  },
  {
    item: "repair_devices",
    code: "ELEC-REPAIR-DEVICES",
    label: "Repair or alteration of devices on existing electrical circuits, per service",
    cents: 7_500,
  },
  {
    item: "solar_small",
    code: "ELEC-SOLAR-SMALL",
    label: "Solar panel installation of less than 13.44 kW",
    cents: 22_500,
  },
  {
    item: "temporary_service",
    code: "ELEC-TEMPORARY-SERVICE",
    label: "Temporary electrical service",
    cents: 15_000,
  },
  {
    item: "maintenance",
    code: "ELEC-MAINTENANCE",
    label: "Electrical maintenance permit, per building, per 30 days",
    cents: 7_500,
  },
];

const PLUMBING_SCOPES: Array<{
  scope: string;
  code: string;
  label: string;
  centsPerUnit?: number;
  unit?: "dwelling_units";
  flatCents?: number;
}> = [
  {
    scope: "water_heater_or_fixtures",
    code: "PLUMB-HEATER-FIXTURES",
    label: "Repair or in-kind replacement of a hot water heater or plumbing fixtures",
    centsPerUnit: 7_500,
    unit: "dwelling_units",
  },
  {
    scope: "piping",
    code: "PLUMB-PIPING",
    label: "Repair or in-kind replacement of plumbing piping",
    centsPerUnit: 15_000,
    unit: "dwelling_units",
  },
  {
    scope: "riser",
    code: "PLUMB-RISER",
    label: "Repair or in-kind replacement of a plumbing riser within an existing chase",
    centsPerUnit: 15_000,
    unit: "dwelling_units",
  },
  {
    scope: "water_heater_multi",
    code: "PLUMB-HEATER-MULTI",
    label: "Hot water heater serving more than one dwelling unit or tenant space",
    flatCents: 15_000,
  },
  {
    scope: "maintenance",
    code: "PLUMB-MAINTENANCE",
    label: "Plumbing maintenance permit, per building, per 30 days",
    flatCents: 7_500,
  },
];

/* -------------------------------------------------------------------------- */
/* The rule sets                                                              */
/* -------------------------------------------------------------------------- */

export function buildingRules(sourceId: string): FeeRuleRecord[] {
  const newConstruction = rule(sourceId, {
    id: "chi-build-new",
    code: "BUILD-CF-RF-NEW",
    label: "New construction: construction factor × scope of review factor × area",
    description:
      '§14A-4-412.2.2.1: "permit fee = CF × RF × A", where CF is the construction factor of Table 14A-12-1204.3(1) (occupancy class × construction type), RF the scope-of-review factor of Table 14A-12-1204.3(3) for new construction, and A the gross floor area of all construction work in square feet. No valuation appears anywhere in the building permit: CF is a dollar rate per square foot, printed between $0.23 and $1.06, multiplied by the scope factor and the area. Both factors are shown in the working because neither is the formula on its own, and the row minimum is the one the schedule prints beside the scope factor, raised to the city-wide $602 floor where that is larger.',
    feeType: "percent",
    config: {
      basis: "square_footage",
      rateUnit: "currency_per_unit",
      rateTables: [
        {
          label: "Construction factor",
          keys: ["custom.occupancy_group", "custom.construction_type"],
          rateUnit: "currency_per_unit",
          entries: CONSTRUCTION_FACTOR_ENTRIES,
        },
        {
          label: "Scope of review factor",
          keys: SCOPE_KEYS,
          entries: rateEntries(NEW_CONSTRUCTION_ROWS),
        },
      ],
      floorTable: {
        label: "Minimum fee",
        keys: SCOPE_KEYS,
        entries: floorEntries(NEW_CONSTRUCTION_ROWS),
      },
    },
  });

  const rehabilitation = rule(sourceId, {
    id: "chi-build-rehab",
    code: "BUILD-CF-RF-REHAB",
    label: "Rehabilitation: construction factor × scope of review factor × area",
    description:
      '§14A-4-412.2.2.1 with RF taken from Table 14A-12-1204.3(4), the rehabilitation table. Its first block applies to **all occupancies** — ordinary repairs, a single MEP system in kind, a Level 1 alteration, a roof replacement with structural repair, a relocated building, a change of occupancy — and the blocks below it name the scopes that are specific to one occupancy class, such as "Level 2 or Level 3 alteration to a single tenant space on a single story" for Group B. Where more than one scope factor applies, footnote b says the **highest** applicable multiplier applies to all areas, so a mixed-scope project pays the higher factor rather than a blend.',
    feeType: "percent",
    config: {
      basis: "square_footage",
      rateUnit: "currency_per_unit",
      rateTables: [
        {
          label: "Construction factor",
          keys: ["custom.occupancy_group", "custom.construction_type"],
          rateUnit: "currency_per_unit",
          entries: CONSTRUCTION_FACTOR_ENTRIES,
        },
        {
          label: "Scope of review factor",
          keys: SCOPE_KEYS,
          entries: rateEntries(REHABILITATION_ROWS),
        },
      ],
      floorTable: {
        label: "Minimum fee",
        keys: SCOPE_KEYS,
        entries: floorEntries(REHABILITATION_ROWS),
      },
    },
  });

  const demolitionOrdinary = rule(sourceId, {
    id: "chi-build-demolition-ordinary",
    code: "BUILD-DEMOLITION-ORDINARY",
    label: "Ordinary demolition",
    description:
      'Footnote d of Table 14A-12-1204.3(4): demolition permits under §14A-4-407 "are not subject to the area- and construction-factor-based fee formula and are only subject to the minimum fees in this table and inspection fees per §14A-5-503". Ordinary demolition is therefore a flat $600.00 rather than CF × RF × A, and the city-wide $602 minimum of footnote c raises it to $602.00 — the same reading of two minimums the building rows carry.',
    feeType: "flat",
    config: { amountCents: CHI_DEMOLITION_ORDINARY_CENTS },
    minimumCents: CHI_GLOBAL_MINIMUM_CENTS,
    conditions: { all: [{ field: "custom.scope", op: "eq", value: CHI_SCOPE_DEMOLITION_ORDINARY }] },
  });

  const demolitionComplex = rule(sourceId, {
    id: "chi-build-demolition-complex",
    code: "BUILD-DEMOLITION-COMPLEX",
    label: "Complex demolition",
    description:
      'Footnote d of Table 14A-12-1204.3(4): complex demolition under §14A-4-407 is $2,450.00 flat, outside the area-and-factor formula for the same reason as ordinary demolition. The schedule does not define "complex" beyond the section reference, so the choice is the applicant\'s and the building official\'s rather than this calculator\'s.',
    feeType: "flat",
    config: { amountCents: CHI_DEMOLITION_COMPLEX_CENTS },
    conditions: { all: [{ field: "custom.scope", op: "eq", value: CHI_SCOPE_DEMOLITION_COMPLEX }] },
  });

  return [newConstruction, rehabilitation, demolitionOrdinary, demolitionComplex];
}

export function electricalRules(sourceId: string): FeeRuleRecord[] {
  const services = ELECTRICAL_SERVICE_BANDS.map((band) =>
    rule(sourceId, {
      id: `chi-elec-service-${band.key.toLowerCase()}`,
      code: `ELEC-SERVICE-${band.key}`,
      label: band.label,
      description: `Table 14A-12-1204.2: "${band.label}" — $${(band.cents / 100).toFixed(2)}. A stand-alone fee under §14A-4-412.1, charged when the permit covers this scope, and stacked with any other listed scope the permit covers.`,
      feeType: "flat",
      config: { amountCents: band.cents },
      conditions: { all: band.conditions },
    }),
  );

  const circuits = ELECTRICAL_CIRCUIT_BANDS.map((band) => {
    const conditions: ConditionLeaf[] = [{ field: "custom.new_circuits", op: "exists" }];
    if (band.min > 1) conditions.push({ field: "custom.new_circuits", op: "gte", value: band.min });
    if (band.max !== null) conditions.push({ field: "custom.new_circuits", op: "lte", value: band.max });
    return rule(sourceId, {
      id: `chi-elec-circuits-${band.key.toLowerCase()}`,
      code: `ELEC-CIRCUITS-${band.key}`,
      label: `Installation of ${band.label}`,
      description: `Table 14A-12-1204.2: "Installation of ${band.label}" — $${(band.cents / 100).toFixed(2)}. The band the count falls in decides the whole amount, so eleven circuits cost the 11-to-20 fee and not the first band plus a rate.`,
      feeType: "flat",
      config: { amountCents: band.cents },
      conditions: { all: conditions },
    });
  });

  const lowVoltage = rule(sourceId, {
    id: "chi-elec-low-voltage",
    code: "ELEC-LOW-VOLTAGE",
    label: "Installation of low-voltage electrical system",
    description:
      'Table 14A-12-1204.2: "Installation of low-voltage electrical system" — $75 per system per floor, with footnote f naming telephone, security, cable and media as each a separate system; a system within or serving a single dwelling unit is also $75 per system. Both dimensions become one count: give the number of **system installations** (each system on each floor it serves), and each is $75.',
    feeType: "per_unit",
    config: { unit: "low_voltage_points", centsPerUnit: 7_500 },
    conditions: { all: [{ field: "custom.low_voltage_points", op: "exists" }] },
  });

  const items = ELECTRICAL_ITEMS.map((item) =>
    rule(sourceId, {
      id: `chi-elec-${item.item.replace(/_/g, "-")}`,
      code: item.code,
      label: item.label,
      description: `Table 14A-12-1204.2: "${item.label}" — $${(item.cents / 100).toFixed(2)}. A stand-alone fee under §14A-4-412.1, and where footnote c marks the row, in addition to a permit fee calculated under §14A-12-1204.3.`,
      feeType: "flat",
      config: { amountCents: item.cents },
      conditions: { all: [{ field: "custom.electrical_item", op: "eq", value: item.item }] },
    }),
  );

  return [...services, ...circuits, lowVoltage, ...items];
}

export function plumbingRules(sourceId: string): FeeRuleRecord[] {
  const pool = rule(sourceId, {
    id: "chi-plumb-pool",
    code: "PLUMB-POOL",
    label: "Install private swimming pool or hot tub",
    description:
      'Table 14A-12-1204.2: "Install private swimming pool or hot tub (electrical work as a separate permit)" — $400.00. The schedule says in the row itself that the electrical work is a separate permit, so the electrical page prices it separately.',
    feeType: "flat",
    config: { amountCents: 40_000 },
    conditions: { all: [{ field: "custom.pool_install", op: "eq", value: true }] },
  });

  const scopes = PLUMBING_SCOPES.map((scope) => {
    const base = {
      id: `chi-plumb-${scope.scope.replace(/_/g, "-")}`,
      code: scope.code,
      label: scope.label,
    };
    if (scope.centsPerUnit !== undefined) {
      return rule(sourceId, {
        ...base,
        description: `Table 14A-12-1204.2: "${scope.label}" — $${(scope.centsPerUnit / 100).toFixed(2)} per dwelling unit, toilet room or tenant space. The count is the basis: a job touching six dwelling units is six times the rate, and a job touching one is the rate once.`,
        feeType: "per_unit",
        config: { unit: "dwelling_units", centsPerUnit: scope.centsPerUnit },
        conditions: {
          all: [
            { field: "custom.plumbing_scope", op: "eq", value: scope.scope },
            { field: "units", op: "exists" },
          ],
        },
      });
    }
    return rule(sourceId, {
      ...base,
      description: `Table 14A-12-1204.2: "${scope.label}" — $${((scope.flatCents ?? 0) / 100).toFixed(2)}.`,
      feeType: "flat",
      config: { amountCents: scope.flatCents ?? 0 },
      conditions: { all: [{ field: "custom.plumbing_scope", op: "eq", value: scope.scope }] },
    });
  });

  return [pool, ...scopes];
}

export const CHI_BUILDING_RULES: FeeRuleRecord[] = buildingRules(CHI_BUILDING_SOURCE_KEY);
export const CHI_ELECTRICAL_RULES: FeeRuleRecord[] = electricalRules(CHI_CODE_EXCERPTS_SOURCE_KEY);
export const CHI_PLUMBING_RULES: FeeRuleRecord[] = plumbingRules(CHI_CODE_EXCERPTS_SOURCE_KEY);
