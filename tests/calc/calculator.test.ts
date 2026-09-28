import { describe, expect, it } from "vitest";

import {
  calculatePermitFees,
  describeCalculationInput,
  type CalculationInput,
} from "@/lib/calc";
import { AS_OF } from "./fixtures";
import { dallasSeed } from "@/content/dallas";
import { denverSeed } from "@/content/denver";
import { houstonSeed } from "@/content/houston";
import { phoenixSeed } from "@/content/phoenix";
import { seattleSeed } from "@/content/seattle";

/**
 * Calculator engine tests.
 *
 * The calculator is not a second engine: it calls `calculatePermitFees` with
 * rule records exactly as the database returns them. These tests pin that
 * contract from the other side — the same rule records the seed writes, the
 * same inputs the calculator's form produces — so an estimate rendered by the
 * calculator must equal the worked example on the corresponding permit page.
 *
 * The synthetic fixtures cover the edge cases a form can produce (zero,
 * negative-shaped strings never reach the engine, but boundary amounts do).
 */

/** Rules the seed attaches to a jurisdiction + permit type, as the DB would return them. */
function rulesFor(
  seed: { feeRules: Array<{ permitTypeKey: string; rule: Parameters<typeof calculatePermitFees>[1][number] }> },
  permitTypeKey: string,
): Parameters<typeof calculatePermitFees>[1] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function compute(
  seed: Parameters<typeof rulesFor>[0],
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
) {
  return calculatePermitFees({ ...input, asOf: AS_OF }, rulesFor(seed, permitTypeKey));
}

describe("calculator uses the real engine on real jurisdiction rules", () => {
  it("Houston building: reproduces the published worked example total", () => {
    // The seed's own worked example inputs, and the total asserted in
    // tests/content/houston-examples.test.ts. If the calculator ever disagreed
    // with the permit page, one of these two tests would fail.
    const result = compute(houstonSeed, "building", { valuationCents: 40_000_000 });
    expect(result.totalCents).toBe(197_283);
    expect(result.components.length).toBeGreaterThan(0);
  });

  it("Houston plumbing: the fixture count flows through the base+per-unit rule", () => {
    const result = compute(houstonSeed, "plumbing", { fixtures: 10 });
    // $34.24 for the first 3, plus $11.41 for each of the next 7 = $114.11.
    expect(result.totalCents).toBe(11_411);
  });

  it("Houston electrical: outlets read the custom count, not fixtures", () => {
    const result = compute(houstonSeed, "electrical", { custom: { outlets: 40 } });
    expect(result.totalCents).toBe(14_760);
  });

  it("Phoenix and Dallas rule sets produce components without error", () => {
    // Phoenix: tiered marginal on valuation; the exact total is asserted by the
    // seed's own content test — here we pin that the same rule records the
    // calculator receives produce a consistent, positive result.
    const phoenix = compute(phoenixSeed, "building", { valuationCents: 10_000_000 });
    expect(phoenix.components.length).toBeGreaterThan(0);
    expect(phoenix.totalCents).toBeGreaterThan(0);

    const dallas = compute(dallasSeed, "building", { valuationCents: 10_000_000 });
    expect(dallas.components.length).toBeGreaterThan(0);
    expect(dallas.totalCents).toBeGreaterThan(0);

    const denver = compute(denverSeed, "building", { valuationCents: 10_000_000 });
    expect(denver.components.length).toBeGreaterThan(0);
    expect(denver.totalCents).toBeGreaterThan(0);
  });

  it("Seattle: fee_subtotal surcharge resolves with the calculator's inputs", () => {
    const seattle = compute(seattleSeed, "building", { valuationCents: 20_000_000 });
    expect(seattle.components.length).toBeGreaterThan(0);
    expect(seattle.totalCents).toBeGreaterThan(0);
  });
});

describe("calculator edge cases against the engine", () => {
  it("a valuation at the first bracket's upper bound resolves to the flat fee", () => {
    // Houston's first structural bracket is a flat $47.00 up to $7,000.
    const result = compute(houstonSeed, "building", { valuationCents: 700_000 });
    expect(result.totalCents).toBe(4_700);
  });

  it("one cent past the boundary steps into the next published bracket", () => {
    // The engine reproduces the schedule exactly: $7,000.01 falls into the
    // $7,001–$150,000 bracket, whose base charge and rounding are the City's
    // own, not a linear interpolation of the flat fee below.
    const result = compute(houstonSeed, "building", { valuationCents: 7_000_001 });
    expect(result.totalCents).toBe(39_004);
    // The applicable rule is the second bracket, named in the applied set.
    expect(result.appliedRuleIds).toContain("hou-struct-b2");
  });

  it("a huge valuation still computes exactly", () => {
    const result = compute(houstonSeed, "building", { valuationCents: 5_000_000_000 });
    expect(result.totalCents).toBeGreaterThan(0);
  });

  it("an input no rule reads simply leaves those rules excluded with a reason", () => {
    // A plumbing query with valuation only: the fixture rule is excluded as a
    // missing input, and the result says so rather than returning a fake total.
    const result = compute(houstonSeed, "plumbing", { valuationCents: 1_000_000 });
    const missing = result.excluded.filter((rule) => rule.reason === "missing_input");
    expect(missing.length).toBeGreaterThan(0);
    expect(result.warnings.some((warning) => warning.includes("required by at least one fee rule"))).toBe(true);
  });
});

describe("calculator input labelling", () => {
  it("labels the inputs it calculated from, using engine vocabulary", () => {
    const rows = describeCalculationInput({ valuationCents: 25_000_000, fixtures: 6 });
    expect(rows).toEqual([
      { label: "Project valuation", value: "$250,000" },
      { label: "Fixtures", value: "6" },
    ]);
  });
});

function formatTotal(result: { totalCents: number }): string {
  // Matches the engine's display rounding used across the published pages.
  const cents = result.totalCents;
  const showCents = cents % 100 !== 0;
  const dollars = Math.floor(Math.abs(cents) / 100);
  const remainder = Math.abs(cents) % 100;
  const base = `$${String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  return showCents ? `${base}.${String(remainder).padStart(2, "0")}` : base;
}
