import type {
  CalculationFacts,
  ConditionField,
  ConditionLeaf,
  ConditionScalar,
  FeeCondition,
} from "./types";
import { COMPARISON_OPERATORS, type ComparisonOperator } from "./types";

/**
 * Conditions are the mechanism that keeps jurisdiction-specific rules out of the
 * codebase. They are a small declarative language, stored as JSONB, validated
 * here, and evaluated against the calculation facts.
 *
 * Hand-written rather than generated from a schema library: the language is
 * tiny, and the error messages need to be good enough for a non-engineer to fix
 * a rule in the admin surface later.
 */

const KNOWN_FIELDS = new Set<string>([
  "valuation",
  "square_footage",
  "units",
  "fixtures",
  "occupancy",
  "work_type",
  "construction_type",
  "is_expedited",
  "is_owner_builder",
  // Subtotals of the calculation in progress, injected before every rule. Only a
  // `permit_minimum` rule should normally read them, and it has to: a floor on the
  // whole permit applies only while the permit's own subtotal is below it.
  "permit_fee",
  "fee_subtotal",
]);

const NUMERIC_FIELDS = new Set<string>([
  "valuation",
  "square_footage",
  "units",
  "fixtures",
  "permit_fee",
  "fee_subtotal",
]);

const BOOLEAN_FIELDS = new Set<string>(["is_expedited", "is_owner_builder"]);

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export type ConditionValidation =
  | { ok: true; condition: FeeCondition }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScalar(value: unknown): value is ConditionScalar {
  return (
    typeof value === "string" || typeof value === "number" || typeof value === "boolean"
  );
}

function isKnownField(field: string): field is ConditionField {
  if (field.startsWith("custom.") && field.length > "custom.".length) return true;
  return KNOWN_FIELDS.has(field);
}

function validateLeaf(raw: Record<string, unknown>, path: string): ConditionValidation {
  const { field, op, value } = raw;

  if (typeof field !== "string" || field.length === 0) {
    return { ok: false, error: `${path}.field must be a non-empty string.` };
  }
  if (!isKnownField(field)) {
    return {
      ok: false,
      error: `${path}.field "${field}" is not a known fact. Use a listed field or "custom.<key>".`,
    };
  }
  if (typeof op !== "string" || !COMPARISON_OPERATORS.includes(op as ComparisonOperator)) {
    return {
      ok: false,
      error: `${path}.op must be one of: ${COMPARISON_OPERATORS.join(", ")}.`,
    };
  }

  const operator = op as ComparisonOperator;
  const expectsValue = operator !== "exists" && operator !== "absent";

  if (expectsValue && value === undefined) {
    return { ok: false, error: `${path}.value is required for operator "${operator}".` };
  }
  if (!expectsValue && value !== undefined) {
    return { ok: false, error: `${path}.value must be omitted for operator "${operator}".` };
  }

  if (operator === "in" || operator === "not_in") {
    if (!Array.isArray(value) || value.length === 0) {
      return {
        ok: false,
        error: `${path}.value must be a non-empty array for operator "${operator}".`,
      };
    }
    if (!value.every(isScalar)) {
      return {
        ok: false,
        error: `${path}.value must contain only strings, numbers or booleans.`,
      };
    }
  } else if (expectsValue && !isScalar(value)) {
    return {
      ok: false,
      error: `${path}.value must be a string, number or boolean for operator "${operator}".`,
    };
  }

  // Unit guards. A valuation compared against a dollar figure instead of cents
  // is the single most expensive class of mistake in this domain, because it
  // produces a plausible-looking wrong answer.
  const values: ConditionScalar[] = Array.isArray(value)
    ? value
    : value === undefined
      ? []
      : [value];

  if (NUMERIC_FIELDS.has(field)) {
    for (const candidate of values) {
      if (typeof candidate !== "number" || !Number.isInteger(candidate)) {
        return {
          ok: false,
          error: `${path}.value must be a whole number when comparing "${field}" (money facts are in cents).`,
        };
      }
    }
  }
  if (BOOLEAN_FIELDS.has(field)) {
    for (const candidate of values) {
      if (typeof candidate !== "boolean") {
        return {
          ok: false,
          error: `${path}.value must be true or false when comparing "${field}".`,
        };
      }
    }
  }
  if (
    (operator === "gt" || operator === "gte" || operator === "lt" || operator === "lte") &&
    typeof value !== "number"
  ) {
    return {
      ok: false,
      error: `${path}.value must be a number for operator "${operator}".`,
    };
  }

  const leaf: ConditionLeaf = { field: field as ConditionField, op: operator };
  if (value !== undefined) {
    leaf.value = Array.isArray(value)
      ? (value as ConditionScalar[])
      : (value as ConditionScalar);
  }
  return { ok: true, condition: leaf };
}

const COMBINATORS = ["all", "any", "not"] as const;

export function validateCondition(raw: unknown, path = "conditions"): ConditionValidation {
  if (raw === null || raw === undefined) {
    return { ok: false, error: `${path} is missing.` };
  }
  if (!isPlainObject(raw)) {
    return { ok: false, error: `${path} must be an object.` };
  }

  const present = COMBINATORS.filter((key) => key in raw);

  if (present.length > 0) {
    if (present.length > 1 || Object.keys(raw).length !== 1) {
      return {
        ok: false,
        error: `${path} must contain exactly one of "all", "any" or "not".`,
      };
    }

    const combinator = present[0] as (typeof COMBINATORS)[number];

    if (combinator === "not") {
      const inner = validateCondition(raw["not"], `${path}.not`);
      if (!inner.ok) return inner;
      return { ok: true, condition: { not: inner.condition } };
    }

    const children = raw[combinator];
    if (!Array.isArray(children) || children.length === 0) {
      return { ok: false, error: `${path}.${combinator} must be a non-empty array.` };
    }

    const validated: FeeCondition[] = [];
    for (let index = 0; index < children.length; index += 1) {
      const child = validateCondition(children[index], `${path}.${combinator}[${index}]`);
      if (!child.ok) return child;
      validated.push(child.condition);
    }

    return combinator === "all"
      ? { ok: true, condition: { all: validated } }
      : { ok: true, condition: { any: validated } };
  }

  if (!("field" in raw) || !("op" in raw)) {
    return {
      ok: false,
      error: `${path} must be a condition with "field" and "op", or an "all"/"any"/"not" group.`,
    };
  }

  return validateLeaf(raw, path);
}

/* -------------------------------------------------------------------------- */
/* Evaluation                                                                 */
/* -------------------------------------------------------------------------- */

function readFact(facts: CalculationFacts, field: ConditionField): unknown {
  const value = facts[field];
  return value === undefined ? null : value;
}

function valuesEqual(left: unknown, right: ConditionScalar): boolean {
  if (typeof left === "number" && typeof right === "number") return left === right;
  if (typeof left === "boolean" || typeof right === "boolean") return left === right;
  if (left === null || left === undefined) return false;
  // Textual facts are compared case-insensitively so that data-entry variance
  // ("Residential" vs "residential") cannot silently disable a rule.
  return String(left).trim().toLowerCase() === String(right).trim().toLowerCase();
}

function evaluateLeaf(leaf: ConditionLeaf, facts: CalculationFacts): boolean {
  const actual = readFact(facts, leaf.field);

  switch (leaf.op) {
    case "exists":
      return actual !== null;
    case "absent":
      return actual === null;
    case "in": {
      const candidates = Array.isArray(leaf.value) ? leaf.value : [];
      return candidates.some((candidate) => valuesEqual(actual, candidate));
    }
    case "not_in": {
      const candidates = Array.isArray(leaf.value) ? leaf.value : [];
      return !candidates.some((candidate) => valuesEqual(actual, candidate));
    }
    default:
      break;
  }

  if (actual === null) {
    // A comparison against a fact we do not have is not a match. The engine
    // reports the missing fact separately so the page can explain the omission.
    return false;
  }

  const expected = leaf.value;
  if (expected === undefined || Array.isArray(expected)) return false;

  switch (leaf.op) {
    case "eq":
      return valuesEqual(actual, expected);
    case "neq":
      return !valuesEqual(actual, expected);
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      if (typeof actual !== "number" || typeof expected !== "number") return false;
      if (leaf.op === "gt") return actual > expected;
      if (leaf.op === "gte") return actual >= expected;
      if (leaf.op === "lt") return actual < expected;
      return actual <= expected;
    }
    default:
      return false;
  }
}

export function evaluateCondition(
  condition: FeeCondition | null,
  facts: CalculationFacts,
): boolean {
  if (condition === null) return true;

  if ("all" in condition) return condition.all.every((child) => evaluateCondition(child, facts));
  if ("any" in condition) return condition.any.some((child) => evaluateCondition(child, facts));
  if ("not" in condition) return !evaluateCondition(condition.not, facts);

  return evaluateLeaf(condition, facts);
}

/** Human-readable rendering of a condition, used in the admin surface and tests. */
export function describeCondition(condition: FeeCondition): string {
  if ("all" in condition) {
    return condition.all.map(describeCondition).join(" AND ");
  }
  if ("any" in condition) {
    return condition.any.map(describeCondition).join(" OR ");
  }
  if ("not" in condition) {
    return `NOT (${describeCondition(condition.not)})`;
  }

  const value = Array.isArray(condition.value)
    ? condition.value.join(" | ")
    : condition.value === undefined
      ? ""
      : String(condition.value);

  return value === ""
    ? `${condition.field} ${condition.op}`
    : `${condition.field} ${condition.op} ${value}`;
}
