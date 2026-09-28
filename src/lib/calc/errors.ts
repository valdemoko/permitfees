/**
 * Errors raised by the calculation engine.
 *
 * These are never swallowed silently inside the engine: a rule the engine cannot
 * evaluate is reported in the calculation result so the page can say what it
 * could not include, instead of quietly returning a smaller number.
 */

export type CalculationErrorCode =
  | "invalid_input"
  | "invalid_rule"
  | "missing_fact"
  | "non_finite_value"
  | "unsupported_fee_type";

export class CalculationError extends Error {
  readonly code: CalculationErrorCode;
  readonly details: Record<string, unknown>;

  constructor(
    code: CalculationErrorCode,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "CalculationError";
    this.code = code;
    this.details = details;
  }
}
