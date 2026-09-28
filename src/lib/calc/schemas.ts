import { z } from "zod";

import { validateCondition } from "./conditions";
import {
  FEE_BASES,
  PER_UNIT_KINDS,
  type FeeRuleRecord,
  type ValidatedFeeRule,
} from "./types";

/**
 * Validation boundary for fee rules.
 *
 * `config` and `conditions` arrive as JSONB, which means they are untrusted
 * input even though we wrote them. Every rule is validated before it can affect
 * a number, and anything invalid is reported in the calculation result rather
 * than silently ignored.
 *
 * Every config object is **strict**, and that is load-bearing. Zod strips unknown
 * keys by default, so a rule whose `minimumCents` was written inside `config`
 * instead of beside it would validate, lose the field, and compute a fee without
 * its published floor — no error anywhere, just a number that is wrong by $462 on
 * Dallas's plan review. With strict objects that mistake fails validation, the seed
 * refuses to write the rule, and the difference between the two is a loud failure
 * instead of a quiet one.
 */

const MAX_CENTS = 100_000_000_000; // $1,000,000,000 — beyond any real permit fee
const MAX_RATE_BPS = 1_000_000; // 10,000% — rejected only to catch unit mistakes

const centsSchema = z.number().int().min(0).max(MAX_CENTS);
const rateBpsSchema = z.number().int().min(0).max(MAX_RATE_BPS);
const basisSchema = z.enum(FEE_BASES);
const perUnitKindSchema = z.enum(PER_UNIT_KINDS);

const flatConfigSchema = z.strictObject({
  amountCents: centsSchema,
});

/**
 * An exact rate, for schedules that publish more precision than basis points can
 * hold. `0.027665` is `{ numerator: 27665, denominator: 1_000_000 }`.
 *
 * The denominator is bounded so a typo cannot turn a rate into an absurd scale,
 * and the numerator carries the same ceiling as a basis-point rate would.
 */
const exactRateSchema = z.strictObject({
  numerator: z.number().int().min(0).max(1_000_000_000),
  denominator: z.number().int().min(1).max(1_000_000_000),
});

/**
 * A lookup table of published rates, keyed by facts.
 *
 * The shape checks that carry weight: every entry states one value per key, and
 * no two entries state the same combination — a duplicate would make the match
 * depend on row order, and a short row would silently never match anything.
 */
const rateTableSchema = z
  .strictObject({
    label: z.string().min(1).optional(),
    keys: z.array(z.string().min(1)).min(1),
    rateUnit: z.enum(["fraction", "currency_per_unit"]).optional(),
    entries: z
      .array(
        z.strictObject({
          values: z.array(z.string().min(1)).min(1),
          rate: exactRateSchema,
        }),
      )
      .min(1),
  })
  .superRefine((table, ctx) => {
    const seen = new Set<string>();
    table.entries.forEach((entry, index) => {
      if (entry.values.length !== table.keys.length) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "values"],
          message: `This row states ${entry.values.length} value(s) for ${table.keys.length} key(s).`,
        });
        return;
      }
      const signature = entry.values.join("\u0000");
      if (seen.has(signature)) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "values"],
          message: `Duplicate row for ${entry.values.join(" / ")} — a combination may appear once.`,
        });
      }
      seen.add(signature);
    });
  });

/** A lookup table of published minimum fees: one floor per keyed combination. */
const floorTableSchema = z
  .strictObject({
    label: z.string().min(1).optional(),
    keys: z.array(z.string().min(1)).min(1),
    entries: z
      .array(
        z.strictObject({
          values: z.array(z.string().min(1)).min(1),
          minimumCents: centsSchema.optional(),
          perUnit: z
            .strictObject({
              factKey: z.string().min(1),
              centsPerUnit: centsSchema,
            })
            .optional(),
        }),
      )
      .min(1),
  })
  .superRefine((table, ctx) => {
    const seen = new Set<string>();
    table.entries.forEach((entry, index) => {
      if (entry.values.length !== table.keys.length) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "values"],
          message: `This row states ${entry.values.length} value(s) for ${table.keys.length} key(s).`,
        });
        return;
      }
      const forms = [entry.minimumCents !== undefined, entry.perUnit !== undefined].filter(
        Boolean,
      ).length;
      if (forms === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index],
          message: "A minimum-fee row needs minimumCents, perUnit, or both.",
        });
      }
      const signature = entry.values.join("\u0000");
      if (seen.has(signature)) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "values"],
          message: `Duplicate row for ${entry.values.join(" / ")} — a combination may appear once.`,
        });
      }
      seen.add(signature);
    });
  });

const percentConfigSchema = z
  .strictObject({
    basis: basisSchema,
    rateBps: rateBpsSchema.optional(),
    rate: exactRateSchema.optional(),
    rateUnit: z.enum(["fraction", "currency_per_unit"]).optional(),
    thresholdCents: centsSchema.optional(),
    baseCents: centsSchema.optional(),
    incrementCents: centsSchema.optional(),
    rateTables: z.array(rateTableSchema).min(1).optional(),
    rateMultiplier: exactRateSchema.optional(),
    floorTable: floorTableSchema.optional(),
  })
  .superRefine((value, ctx) => {
    // Exactly one rate form. Two would be ambiguous about which one is charged,
    // and none would let the engine read an undefined rate as zero — a silently
    // wrong amount, which is the one outcome this module exists to prevent.
    // `rateTables` is the third form: a rate selected by facts rather than stated
    // in the config, which is how a fee that is a product of two published lookup
    // tables stays one rule instead of one rule per cell (see `RateTable`).
    const forms = [
      value.rateBps !== undefined,
      value.rate !== undefined,
      value.rateTables !== undefined,
    ].filter(Boolean).length;
    if (forms !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["rate"],
        message:
          "A percent rule needs exactly one of rateBps, rate (an exact fraction), or rateTables (published lookup tables).",
      });
    }

    // `rateUnit` describes how to read an exact fraction — whether it is a share
    // of the basis or an amount per unit of it. Where the rate is a whole number of
    // basis points the fraction reading is the only one that makes sense, and
    // `currency_per_unit` would label it wrongly in prose. A `rateTables` rule has
    // a fractional product, so it may state the unit.
    if (value.rateUnit !== undefined && value.rate === undefined && value.rateTables === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["rateUnit"],
        message: "rateUnit only applies to a rate stated as an exact fraction or as rateTables.",
      });
    }

    // A multiplier scales the product of the tables, so there has to be a product
    // to scale. Refused rather than ignored: a config that states a published
    // multiplier and silently drops it is a fee smaller than the schedule's.
    if (value.rateMultiplier !== undefined && value.rateTables === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["rateMultiplier"],
        message: "rateMultiplier only applies to a rate selected by rateTables.",
      });
    }
  });

const marginalTierSchema = z
  .strictObject({
    upToCents: centsSchema.nullable(),
    rateBps: rateBpsSchema.optional(),
    rateCentsPerUnit: centsSchema.optional(),
    rate: exactRateSchema.optional(),
    bandCents: centsSchema.optional(),
  })
  .superRefine((value, ctx) => {
    // Exactly one rate form, for the reason `percent` states: two would be ambiguous
    // about which one is charged, and none would let the engine read a missing rate as
    // zero — a band that silently costs nothing.
    // `rate` is Springfield's half-cent case: `{1,2}` cents per unit of construction factor, so `rateCentsPerUnit`
    // cannot hold it without hiding a factor of 100.
    const forms = [
      value.rateBps !== undefined,
      value.rateCentsPerUnit !== undefined,
      value.rate !== undefined,
    ].filter(Boolean).length;
    if (forms !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["rateBps"],
        message:
          "A marginal band needs exactly one of rateBps (a share of a money basis), rateCentsPerUnit (cents per unit of any basis), or rate (exact cents per unit, for fractional rates like 0.15–0.5 cents).",
      });
    }
  });

const tieredMarginalConfigSchema = z
  .strictObject({
    basis: basisSchema,
    baseCents: centsSchema.optional(),
    incrementCents: centsSchema.optional(),
    tiers: z.array(marginalTierSchema).min(1),
  })
  .superRefine((value, ctx) => {
    checkTierOrdering(
      value.tiers,
      (index, message) => ctx.addIssue({ code: "custom", path: [index, "upToCents"], message }),
      "tiered_marginal",
    );
  });

const tableTierSchema = z.strictObject({
  upToCents: centsSchema.nullable(),
  amountCents: centsSchema,
});

const tieredTableConfigSchema = z
  .strictObject({
    basis: basisSchema,
    tiers: z.array(tableTierSchema).min(1),
  })
  .superRefine((value, ctx) => {
    checkTierOrdering(
      value.tiers,
      (index, message) => ctx.addIssue({ code: "custom", path: [index, "upToCents"], message }),
      "tiered_table",
    );
  });

const perUnitConfigSchema = z
  .strictObject({
    unit: perUnitKindSchema,
    centsPerUnit: centsSchema,
    baseCents: centsSchema.optional(),
    thresholdUnits: z.number().int().min(0).max(1_000_000).optional(),
    incrementUnits: z.number().int().min(1).max(1_000_000).optional(),
  })
  .superRefine((value, ctx) => {
    // A base charge with no allowance would silently double-charge the first
    // unit: the base amount and the per-unit rate would both cover it.
    if (value.baseCents !== undefined && value.thresholdUnits === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["thresholdUnits"],
        message: "thresholdUnits is required when baseCents is set.",
      });
    }
  });

/**
 * A floor on the whole permit, measured against a subtotal and charged as the shortfall.
 *
 * The floor must be positive: a minimum of zero is not a minimum, and a rule that says
 * one is a rule that could never charge anything, which is exactly the kind of rule that
 * looks as though it does something.
 */
const permitMinimumConfigSchema = z.strictObject({
  basis: z.enum(["permit_fee", "fee_subtotal"]),
  floorCents: centsSchema.refine((value) => value > 0, {
    message: "floorCents must be greater than zero; a permit minimum of zero is not a minimum.",
  }),
});

/**
 * `$5.36 per $1,000 of valuation` is `centsPerThousand: 536`.
 * The upper bound is generous but still catches a rate entered in dollars
 * (e.g. `5.36` for a whole-thousand rate) rather than cents.
 */
const perThousandConfigSchema = z
  .strictObject({
    basis: basisSchema,
    centsPerThousand: z.number().int().min(0).max(1_000_000).optional(),
    rateCentsPerThousand: exactRateSchema.optional(),
    thresholdCents: centsSchema.optional(),
    incrementCents: centsSchema.optional(),
    incrementRounding: z.enum(["up", "nearest"]).optional(),
    baseCents: centsSchema.optional(),
  })
  .superRefine((value, ctx) => {
    // A rounding mode with no increment to round to would be read as decided
    // policy and then applied to nothing — Tulsa's "to the closest $1,000" entered
    // without the $1,000 would charge the unrounded valuation and say it rounded.
    if (value.incrementRounding !== undefined && !(value.incrementCents && value.incrementCents > 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["incrementRounding"],
        message: "incrementRounding requires incrementCents; there is nothing to round without an increment.",
      });
    }
    // Exactly one rate form, for the same reason `percent` requires it: two would be
    // ambiguous about which one is charged, and none would let a missing rate read as
    // zero — a silently wrong amount, which is the one outcome this module exists to
    // prevent.
    const forms = [
      value.centsPerThousand !== undefined,
      value.rateCentsPerThousand !== undefined,
    ].filter(Boolean).length;
    if (forms !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["rateCentsPerThousand"],
        message:
          "A per_thousand rule needs exactly one of centsPerThousand or rateCentsPerThousand (an exact fraction of a cent per $1,000).",
      });
    }
  });

/**
 * Brackets must be contiguous and strictly ascending, and only the final bracket
 * may be open-ended. Otherwise a basis value could fall between two brackets
 * with no defined fee, which would produce a silently wrong answer.
 */
function checkTierOrdering(
  tiers: Array<{ upToCents: number | null }>,
  addIssue: (index: number, message: string) => void,
  label: string,
): void {
  let previousUpper: number | null = null;

  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    if (!tier) continue;
    const isLast = index === tiers.length - 1;

    if (tier.upToCents === null) {
      if (!isLast) {
        addIssue(index, `${label}: only the final bracket may be open-ended.`);
      }
      continue;
    }

    if (previousUpper !== null && tier.upToCents <= previousUpper) {
      addIssue(
        index,
        `${label}: brackets must be strictly ascending (${tier.upToCents} follows ${previousUpper}).`,
      );
    }
    previousUpper = tier.upToCents;
  }
}

export type FeeRuleValidation =
  | { ok: true; rule: ValidatedFeeRule }
  | { ok: false; error: string };

function describeIssues(error: z.ZodError, label: string): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.map((segment) => String(segment)).join(".");
      return path ? `${label}.config.${path}: ${issue.message}` : `${label}.config: ${issue.message}`;
    })
    .join("; ");
}

/**
 * Validate one stored rule.
 *
 * Returns a discriminated rule whose `config` type is tied to its `feeType`, so
 * the engine can switch on `feeType` and read the matching config without casts.
 */
export function validateFeeRule(rule: FeeRuleRecord): FeeRuleValidation {
  const conditionsResult =
    rule.conditions === null || rule.conditions === undefined
      ? ({ ok: true, condition: null } as const)
      : validateCondition(rule.conditions, `${rule.code}.conditions`);

  if (!conditionsResult.ok) {
    return { ok: false, error: conditionsResult.error };
  }
  const conditions = conditionsResult.condition;

  if (
    rule.minimumCents !== null &&
    rule.maximumCents !== null &&
    rule.minimumCents > rule.maximumCents
  ) {
    return {
      ok: false,
      error: `${rule.code}: minimumCents (${rule.minimumCents}) exceeds maximumCents (${rule.maximumCents}).`,
    };
  }

  const { config: _config, conditions: _conditions, ...base } = rule;

  switch (rule.feeType) {
    case "flat": {
      const parsed = flatConfigSchema.safeParse(rule.config);
      if (!parsed.success) return { ok: false, error: describeIssues(parsed.error, rule.code) };
      return { ok: true, rule: { ...base, feeType: "flat", config: parsed.data, conditions } };
    }
    case "percent": {
      const parsed = percentConfigSchema.safeParse(rule.config);
      if (!parsed.success) return { ok: false, error: describeIssues(parsed.error, rule.code) };
      return { ok: true, rule: { ...base, feeType: "percent", config: parsed.data, conditions } };
    }
    case "per_thousand": {
      const parsed = perThousandConfigSchema.safeParse(rule.config);
      if (!parsed.success) return { ok: false, error: describeIssues(parsed.error, rule.code) };
      return {
        ok: true,
        rule: { ...base, feeType: "per_thousand", config: parsed.data, conditions },
      };
    }
    case "tiered_marginal": {
      const parsed = tieredMarginalConfigSchema.safeParse(rule.config);
      if (!parsed.success) return { ok: false, error: describeIssues(parsed.error, rule.code) };
      return {
        ok: true,
        rule: { ...base, feeType: "tiered_marginal", config: parsed.data, conditions },
      };
    }
    case "tiered_table": {
      const parsed = tieredTableConfigSchema.safeParse(rule.config);
      if (!parsed.success) return { ok: false, error: describeIssues(parsed.error, rule.code) };
      return {
        ok: true,
        rule: { ...base, feeType: "tiered_table", config: parsed.data, conditions },
      };
    }
    case "per_unit": {
      const parsed = perUnitConfigSchema.safeParse(rule.config);
      if (!parsed.success) return { ok: false, error: describeIssues(parsed.error, rule.code) };
      return { ok: true, rule: { ...base, feeType: "per_unit", config: parsed.data, conditions } };
    }
    case "permit_minimum": {
      const parsed = permitMinimumConfigSchema.safeParse(rule.config);
      if (!parsed.success) return { ok: false, error: describeIssues(parsed.error, rule.code) };
      return {
        ok: true,
        rule: { ...base, feeType: "permit_minimum", config: parsed.data, conditions },
      };
    }
    default: {
      // Exhaustiveness: adding a FeeType without a case here is a compile error.
      const unreachable: never = rule.feeType;
      return { ok: false, error: `Unsupported fee type "${String(unreachable)}".` };
    }
  }
}
