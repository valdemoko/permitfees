import { describe, expect, it } from "vitest";

import {
  applyMinMax,
  applyRateBps,
  dollarsToCents,
  roundHalfUpCents,
  roundUpToIncrement,
} from "@/lib/calc/money";
import { CalculationError } from "@/lib/calc/errors";

describe("applyRateBps", () => {
  it("applies basis points exactly on round numbers", () => {
    // $100,000.00 at 1.5%
    expect(applyRateBps(10_000_000, 150)).toBe(150_000);
  });

  it("applies whole-number rates without drift", () => {
    // $2,500,000.00 at 0.5% is exactly $12,500.00
    expect(applyRateBps(250_000_000, 50)).toBe(1_250_000);
  });

  it("rounds half up only at the final step", () => {
    // 333 cents at 1.5% = 4.995 cents -> 5 cents
    expect(applyRateBps(333, 150)).toBe(5);
    // 33 cents at 1.5% = 0.495 cents -> 0 cents
    expect(applyRateBps(33, 150)).toBe(0);
    // 100 cents at 1.5% = 1.5 cents -> 2 cents
    expect(applyRateBps(100, 150)).toBe(2);
  });

  it("models 'per $1,000 or fraction thereof' via increment rounding", () => {
    // $9 per $1,000 is 90 bps. $250,100 rounds up to $251,000 first.
    const valuation = 25_010_000;
    const rounded = roundUpToIncrement(valuation, 100_000);
    expect(rounded).toBe(25_100_000);
    expect(applyRateBps(rounded, 90)).toBe(225_900);
  });

  it("rejects non-integer and negative inputs instead of guessing", () => {
    expect(() => applyRateBps(100.5, 150)).toThrow(CalculationError);
    expect(() => applyRateBps(-100, 150)).toThrow(CalculationError);
    expect(() => applyRateBps(100, -5)).toThrow(CalculationError);
  });
});

describe("roundUpToIncrement", () => {
  it("leaves an exact multiple untouched", () => {
    expect(roundUpToIncrement(200_000, 100_000)).toBe(200_000);
  });

  it("rounds any remainder up to the next whole increment", () => {
    expect(roundUpToIncrement(200_001, 100_000)).toBe(300_000);
    expect(roundUpToIncrement(1, 100_000)).toBe(100_000);
  });

  it("rejects a non-positive increment", () => {
    expect(() => roundUpToIncrement(100, 0)).toThrow(CalculationError);
  });
});

describe("applyMinMax", () => {
  it("applies the minimum before the maximum", () => {
    expect(applyMinMax(5_000, 10_000, 50_000)).toEqual({
      amountCents: 10_000,
      appliedMinimum: true,
      appliedMaximum: false,
    });
  });

  it("applies the maximum when the computed amount exceeds it", () => {
    expect(applyMinMax(90_000, 10_000, 50_000)).toEqual({
      amountCents: 50_000,
      appliedMinimum: false,
      appliedMaximum: true,
    });
  });

  it("leaves an amount inside the range alone", () => {
    expect(applyMinMax(30_000, 10_000, 50_000)).toEqual({
      amountCents: 30_000,
      appliedMinimum: false,
      appliedMaximum: false,
    });
  });

  it("lets the cap win when a minimum exceeds the maximum", () => {
    // A minimum above a maximum is a data error, and `validateFeeRule` rejects
    // it. This test pins the raw behaviour of the primitive so that the order of
    // operations can never change unnoticed.
    expect(applyMinMax(5_000, 90_000, 50_000)).toEqual({
      amountCents: 50_000,
      appliedMinimum: true,
      appliedMaximum: true,
    });
  });
});

describe("roundHalfUpCents / dollarsToCents", () => {
  it("converts dollars to cents without float drift", () => {
    expect(dollarsToCents(150)).toBe(15_000);
    expect(dollarsToCents(0.1)).toBe(10);
    expect(dollarsToCents(1234.56)).toBe(123_456);
  });

  it("rounds half up", () => {
    expect(roundHalfUpCents(0.5)).toBe(1);
    expect(roundHalfUpCents(1.4999)).toBe(1);
  });
});
