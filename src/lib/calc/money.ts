import { CalculationError } from "./errors";

/**
 * Money arithmetic for the fee engine.
 *
 * Two rules make this module the reason the engine is trustworthy:
 *
 *   1. Money is an integer number of CENTS. `$150.00` is `15000`. Never a float,
 *      never a Decimal string.
 *   2. Rates are integer BASIS POINTS. `1.5%` is `150`, `0.075%` is `7.5` -> 8.
 *
 * The only place a fractional value is allowed to exist is the final rounding
 * step, which is half-up. Keeping the arithmetic in integers until that point is
 * what makes a calculation reproducible against an official fee schedule.
 */

export const CENTS_PER_DOLLAR = 100;
export const BPS_DENOMINATOR = 10_000;

/**
 * Largest product we consider safe in a JS number.
 * 2^53 - 1 is the exact-integer limit; we stay well inside it and fail loudly
 * rather than silently losing precision on absurd inputs.
 */
const MAX_EXACT_PRODUCT = Number.MAX_SAFE_INTEGER;

export function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
}

export function assertInteger(value: number, label: string): void {
  if (!isInteger(value)) {
    throw new CalculationError(
      "invalid_input",
      `${label} must be an integer, received ${String(value)}`,
      { label, value },
    );
  }
}

export function assertNonNegativeCents(value: number, label: string): void {
  assertInteger(value, label);
  if (value < 0) {
    throw new CalculationError("invalid_input", `${label} must not be negative`, {
      label,
      value,
    });
  }
}

/**
 * Round half up to the nearest whole cent.
 * Only used at the very end of a component calculation.
 */
export function roundHalfUpCents(value: number): number {
  if (!Number.isFinite(value)) {
    throw new CalculationError("non_finite_value", "Cannot round a non-finite value", {
      value,
    });
  }
  return Math.floor(value + 0.5);
}

/**
 * Apply a basis-point rate to an integer cent amount, exactly.
 *
 * `amountCents * rateBps` is computed as an integer product and divided once, so
 * the only rounding that ever happens is the deliberate half-up at the end.
 * Doing this as `amountCents * (rateBps / 10_000)` would introduce a float error
 * on every single call.
 */
export function applyRateBps(amountCents: number, rateBps: number): number {
  assertNonNegativeCents(amountCents, "amountCents");
  assertNonNegativeCents(rateBps, "rateBps");

  const product = amountCents * rateBps;
  if (product > MAX_EXACT_PRODUCT) {
    throw new CalculationError(
      "invalid_input",
      "Rate application would exceed exact integer precision",
      { amountCents, rateBps },
    );
  }

  // + half the denominator implements round-half-up with integer arithmetic.
  return Math.floor((product + BPS_DENOMINATOR / 2) / BPS_DENOMINATOR);
}

/**
 * Denominator for a "per $1,000" rate.
 *
 * The basis is in cents and the rate is in cents per *$1,000*, so converting the
 * chargeable portion into thousands of dollars takes two steps:
 *   1 / 100   to turn cents into dollars
 *   1 / 1,000 to turn dollars into thousands of dollars
 * giving 100 x 1,000 = 100,000.
 */
export const PER_THOUSAND_DENOMINATOR = 100_000;

/**
 * The same denominator for a rate quoted per 1,000 of a basis that is **not money**.
 *
 * Miami-Dade prices a screen enclosure at "$11.13 per 100 square feet" and a permanent
 * electrical service at "$7.26 per 100 amps"; Orange County prices a service of more
 * than 1,000 amperes at a flat rate "per ea. add'l. 1,000 amp or fraction". Those are
 * "per 1,000 of the measured thing" rates, not "per $1,000" ones, and the basis arrives
 * in its own unit — square feet, amperes — rather than in cents. One conversion, not
 * two: 1,000 amperes x 7,260 cents per 1,000 amperes / 1,000 = 7,260 cents.
 *
 * **Why this is a separate constant.** The engine divided every per-thousand rate by
 * 100,000, which is only correct when the basis is money. On a count basis that is a
 * silent factor of 100 — Orange County's 1,500-ampere service came out at $2.81 instead
 * of $281.00, and Miami-Dade's own per-100-ampere rows at a cent in the dollar. The
 * rate's *noun* was already basis-aware (`BASIS_THOUSAND_NOUNS`: "1,000 amperes"), so the
 * divisor had to be too.
 */
export const PER_THOUSAND_COUNT_DENOMINATOR = 1_000;

/**
 * Apply a rate the schedule publishes as an exact fraction:
 * `amount x numerator / denominator`.
 *
 * **Why this exists.** Dallas publishes rates such as `0.027665`, and on its
 * commercial finish-out table a rate the city has already multiplied by 1.33
 * (`0.009285 x 1.33 = 0.01234905`). As basis points those are `276.65` and
 * `1,234.905` — not integers — so the basis-point primitive would have to round
 * *before* multiplying, and every commercial permit fee in Dallas would be wrong by
 * cents or more. Carried as a fraction, the published figure is reproduced exactly
 * and the only rounding is the deliberate half-up cent at the end.
 *
 * BigInt rather than Number, and this is the one place in the engine where that
 * matters: `$100,000,000` of valuation is 10^10 cents, and a denominator of 10^8
 * pushes the product past 2^53, where a double starts silently losing digits.
 */
export function applyExactRate(
  amount: number,
  numerator: number,
  denominator: number,
): number {
  assertInteger(amount, "amount");
  assertInteger(numerator, "numerator");
  assertInteger(denominator, "denominator");

  if (amount < 0) {
    throw new CalculationError("invalid_input", "amount must not be negative", { amount });
  }
  if (numerator < 0) {
    throw new CalculationError("invalid_input", "numerator must not be negative", { numerator });
  }
  if (denominator <= 0) {
    throw new CalculationError("invalid_input", "denominator must be positive", { denominator });
  }

  const product = BigInt(amount) * BigInt(numerator);
  // + half the denominator implements round-half-up with integer arithmetic.
  const rounded = (product + BigInt(Math.floor(denominator / 2))) / BigInt(denominator);
  const result = Number(rounded);

  if (!Number.isSafeInteger(result)) {
    throw new CalculationError(
      "invalid_input",
      "Exact rate application produced a value beyond exact integer precision",
      { amount, numerator, denominator },
    );
  }

  return result;
}

/**
 * Apply a "per $1,000 of basis" rate exactly.
 *
 * `$5.36 per $1,000` on a chargeable basis of $143,000:
 *   14_300_000 cents x 536 / 100_000 = 76_648 cents = $766.48
 *
 * This is a distinct primitive rather than a basis-point rate because 536 cents
 * per $1,000 is 53.6 basis points, which integers cannot represent. See
 * CALCULATION_ENGINE.md and research/texas/houston.md section 5.
 */
export function applyCentsPerThousand(
  amount: number,
  centsPerThousand: number,
  /** `PER_THOUSAND_DENOMINATOR` for money, `PER_THOUSAND_COUNT_DENOMINATOR` otherwise. */
  denominator: number = PER_THOUSAND_DENOMINATOR,
): number {
  assertNonNegativeCents(amount, "amount");
  assertNonNegativeCents(centsPerThousand, "centsPerThousand");
  assertInteger(denominator, "denominator");
  if (denominator <= 0) {
    throw new CalculationError("invalid_input", "denominator must be positive", { denominator });
  }

  const product = amount * centsPerThousand;
  if (product > MAX_EXACT_PRODUCT) {
    throw new CalculationError(
      "invalid_input",
      "Per-thousand rate would exceed exact integer precision",
      { amount, centsPerThousand, denominator },
    );
  }

  return Math.floor((product + denominator / 2) / denominator);
}

/**
 * Apply a "per $1,000 of basis" rate that the schedule publishes with more
 * precision than a whole cent per $1,000 can hold.
 *
 * The numerator is a fraction OF A CENT per $1,000, so the denominator carries the
 * same 100,000 the integer form uses:
 *
 *   `$4.725 per $1,000` on a chargeable basis of $30,000
 *   3_000_000 cents x 945 / (2 x 100_000) = 14_175 cents = $141.75
 *
 * BigInt internally, for the reason `applyExactRate` documents: a valuation of
 * $100,000,000 is 10^10 cents and a denominator of 2 x 100,000 pushes the product
 * past 2^53, where a double starts losing digits silently.
 */
export function applyExactCentsPerThousand(
  amount: number,
  numerator: number,
  /** A fraction OF A CENT per 1,000 of the basis, so `{numerator: 945, denominator: 2}` is `$4.725`. */
  denominator: number,
  /** `PER_THOUSAND_DENOMINATOR` for money, `PER_THOUSAND_COUNT_DENOMINATOR` otherwise. */
  thousandDenominator: number = PER_THOUSAND_DENOMINATOR,
): number {
  assertInteger(denominator, "denominator");
  if (denominator <= 0) {
    throw new CalculationError("invalid_input", "denominator must be positive", {
      denominator,
    });
  }
  assertInteger(thousandDenominator, "thousandDenominator");
  if (thousandDenominator <= 0) {
    throw new CalculationError("invalid_input", "thousandDenominator must be positive", {
      thousandDenominator,
    });
  }
  return applyExactRate(amount, numerator, denominator * thousandDenominator);
}

/**
 * Round a value UP to the next multiple of `increment`.
 *
 * Many official schedules price "each $1,000 of valuation, or fraction thereof".
 * That `or fraction thereof` is not cosmetic: it changes the answer, so it is
 * modelled explicitly rather than being rounded away.
 */
export function roundUpToIncrement(value: number, increment: number): number {
  assertInteger(value, "value");
  assertInteger(increment, "increment");
  if (value < 0) {
    throw new CalculationError("invalid_input", "value must not be negative", { value });
  }
  if (increment <= 0) {
    throw new CalculationError("invalid_input", "increment must be positive", {
      increment,
    });
  }
  return Math.ceil(value / increment) * increment;
}

/**
 * Round a value to the NEAREST multiple of `increment`, halves upward.
 *
 * Most schedules say "or fraction thereof" and round up; a few say "to the
 * closest" — Tulsa's building permit fee is computed in "$1,000 increments to
 * the closest One Thousand Dollars", where a $40,499 valuation buys forty steps
 * and not forty-one. The half-up tie matches the money rounding this module
 * already performs (`roundHalfUpCents`).
 */
export function roundToNearestIncrement(value: number, increment: number): number {
  assertInteger(value, "value");
  assertInteger(increment, "increment");
  if (value < 0) {
    throw new CalculationError("invalid_input", "value must not be negative", { value });
  }
  if (increment <= 0) {
    throw new CalculationError("invalid_input", "increment must be positive", { increment });
  }
  return Math.floor((value + increment / 2) / increment) * increment;
}

/** Convert a dollar amount (as typed by a human) into integer cents. */
export function dollarsToCents(dollars: number): number {
  if (!Number.isFinite(dollars)) {
    throw new CalculationError("invalid_input", "Dollar amount must be finite", {
      dollars,
    });
  }
  return roundHalfUpCents(dollars * CENTS_PER_DOLLAR);
}

/** Clamp a component between its schedule minimum and maximum, in that order. */
export function applyMinMax(
  amountCents: number,
  minimumCents: number | null,
  maximumCents: number | null,
): { amountCents: number; appliedMinimum: boolean; appliedMaximum: boolean } {
  let amount = amountCents;
  let appliedMinimum = false;
  let appliedMaximum = false;

  if (minimumCents !== null && amount < minimumCents) {
    amount = minimumCents;
    appliedMinimum = true;
  }
  if (maximumCents !== null && amount > maximumCents) {
    amount = maximumCents;
    appliedMaximum = true;
  }

  return { amountCents: amount, appliedMinimum, appliedMaximum };
}
