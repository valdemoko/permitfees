import { describe, expect, it } from "vitest";

import { calculatePermitFees } from "@/lib/calc";
import { BASIS_FACT_KEYS, FEE_BASES, validateFeeRule } from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Two things New Jersey's schedules need that the engine did not have, and both of them
 * come from the same state model rather than from one city's habit.
 *
 * **Volume.** N.J.A.C. 5:23-4.18(c) computes the basic construction fee "on the basis of the
 * volume of the building or, in the case of alterations, the estimated construction cost",
 * and both of the New Jersey jurisdictions in this dataset price a new building at so many
 * cents a cubic foot — Newark from $0.02 to $0.03 by use group, Jersey City $0.027 with
 * $0.15 for the high-hazard groups. Until this pass the engine had two *areas* and no volume,
 * so neither row was expressible at all. `cubic_footage` is a third measurement, and it reads
 * a `custom.*` fact like the second area does, which is what keeps a volume from ever being
 * charged against an area.
 *
 * **Blocks of countable things.** Newark writes "First 50 — $58; Each additional 20 — $12",
 * and Jersey City writes "for the first block consisting of one to ten (10) receptacles,
 * fixtures, or devices, the fee shall be twenty-five dollars ($25.00); for each additional
 * block consisting of up to twenty-five (25) receptacles, fixtures, or devices, the fee shall
 * be twenty-five dollars". A `per_unit` rate alone reads both rows as a straight multiple:
 * Newark's fifty-first device would cost 60 cents instead of the $12.00 the row charges, and
 * Jersey City's eleventh receptacle $1.00 instead of $25.00. `incrementUnits` is the
 * countable analogue of `incrementCents` on `percent`: the excess is bought in whole blocks
 * *before* the rate is applied.
 *
 * Both additions are asserted at the boundary, because that is where the shape lives: 50
 * devices and 51 devices are the two figures the row is written to distinguish.
 */

const AS_OF = "2026-09-25";

function rule(
  overrides: Partial<FeeRuleRecord> & Pick<FeeRuleRecord, "code" | "feeType" | "config">,
): FeeRuleRecord {
  return {
    id: overrides.code,
    label: overrides.code,
    description: null,
    componentType: "base",
    conditions: null,
    minimumCents: null,
    maximumCents: null,
    priority: 100,
    effectiveFrom: "2024-03-20",
    effectiveTo: null,
    status: "active",
    sourceId: null,
    ...overrides,
  };
}

/** Newark's use-group rate for R, B, E, H, M and U occupancies: three cents a cubic foot. */
const NEWARK_THREE_CENTS = rule({
  code: "BLD-NEW-THREE-CENTS",
  feeType: "percent",
  config: {
    basis: "cubic_footage",
    rate: { numerator: 3, denominator: 1 },
    rateUnit: "currency_per_unit",
  },
});

/** Jersey City's general new-construction rate: two point seven cents a cubic foot. */
const JERSEY_CITY_27 = rule({
  code: "BLD-NEW-0-027",
  feeType: "percent",
  config: {
    basis: "cubic_footage",
    rate: { numerator: 27, denominator: 10 },
    rateUnit: "currency_per_unit",
  },
});

describe("the volume basis", () => {
  it("is a third measurement, and reads a fact of its own", () => {
    expect(FEE_BASES).toContain("cubic_footage");
    expect(BASIS_FACT_KEYS.cubic_footage).toBe("custom.cubic_footage");

    const keys = [
      BASIS_FACT_KEYS.square_footage,
      BASIS_FACT_KEYS.covered_square_footage,
      BASIS_FACT_KEYS.cubic_footage,
    ];
    expect(new Set(keys).size).toBe(3);
  });

  it("charges three cents a cubic foot, as Newark's residential use groups are priced", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { cubic_footage: 30_000 } },
      [NEWARK_THREE_CENTS],
    );

    expect(result.totalCents).toBe(90_000); // 30,000 cu ft x $0.03
    expect(result.components[0]?.formula).toBe("$0.03 per cubic foot");
    // The basis is not a synonym for the square footage: its reading is the volume, and
    // it says so in the working and in the inputs table.
    expect(result.components[0]?.steps[0]).toEqual({
      label: "Building volume",
      value: "30,000 cu ft",
    });
  });

  it("carries the exact fraction a published rate needs", () => {
    // $0.027 a cubic foot is 2.7 cents: not a whole number of cents, and not a whole
    // number of basis points of anything. Stored as 27/10 cents, so a 30,000 cubic foot
    // building is $810.00 rather than $900.00 or $780.00.
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { cubic_footage: 30_000 } },
      [JERSEY_CITY_27],
    );

    expect(result.totalCents).toBe(81_000);
    expect(result.components[0]?.formula).toBe("$0.027 per cubic foot");
  });

  it("does not treat an area as a volume, or a missing volume as free", () => {
    // A permit with square footage and no volume is an *unanswered* question, not a
    // zero-dollar permit: the row is reported as needing an input.
    const result = calculatePermitFees({ asOf: AS_OF, squareFootage: 3_000 }, [
      NEWARK_THREE_CENTS,
    ]);

    expect(result.totalCents).toBe(0);
    expect(result.excluded).toEqual([
      expect.objectContaining({ code: "BLD-NEW-THREE-CENTS", reason: "missing_input" }),
    ]);
    expect(result.warnings.join(" ")).toContain("Building volume");
  });

  it("validates as a fee rule like any other basis", () => {
    expect(validateFeeRule(NEWARK_THREE_CENTS).ok).toBe(true);
    expect(validateFeeRule(JERSEY_CITY_27).ok).toBe(true);
  });
});

describe("per-unit rates charged in blocks", () => {
  /** Newark's electrical row: first 50 devices $58.00, then $12.00 per 20 or part thereof. */
  const NEWARK_DEVICES = rule({
    code: "ELEC-RECEPTACLES",
    feeType: "per_unit",
    config: {
      unit: "outlets",
      baseCents: 5_800,
      thresholdUnits: 50,
      centsPerUnit: 60,
      incrementUnits: 20,
    },
  });

  /** Jersey City's emergency and exit lights: 1-10 $25.00, each additional 25 $25.00. */
  const JERSEY_CITY_LIGHTS = rule({
    code: "ELEC-EMERGENCY-LIGHTS",
    feeType: "per_unit",
    config: {
      unit: "lighting_fixtures",
      baseCents: 2_500,
      thresholdUnits: 10,
      centsPerUnit: 100,
      incrementUnits: 25,
    },
  });

  it("buys the whole next block on the unit past the allowance", () => {
    const price = (count: number): number =>
      calculatePermitFees({ asOf: AS_OF, custom: { outlets: count } }, [NEWARK_DEVICES])
        .totalCents;

    expect(price(1)).toBe(5_800); // the first block, one device or fifty
    expect(price(50)).toBe(5_800);
    expect(price(51)).toBe(7_000); // $58 + a whole $12 block
    expect(price(70)).toBe(7_000);
    expect(price(71)).toBe(8_200); // two blocks
    expect(price(150)).toBe(11_800); // $58 + five blocks of $12
  });

  it("says the block price rather than the stored rate", () => {
    const [component] = calculatePermitFees(
      { asOf: AS_OF, custom: { outlets: 60 } },
      [NEWARK_DEVICES],
    ).components;

    // The stored rate is 60 cents a device and the printed row is $12 per 20. A description
    // that printed the stored rate would be arithmetically true and wrong about the document.
    expect(component?.formula).toBe(
      "$58.00 for the first 50 outlets, plus $12.00 for each additional 20 outlets or part thereof",
    );
    expect(component?.steps).toContainEqual({
      label: "Rounded up to the next 20 outlets or part thereof",
      value: "20",
    });
  });

  it("reproduces Jersey City's block without an allowance of one", () => {
    const price = (count: number): number =>
      calculatePermitFees(
        { asOf: AS_OF, custom: { lighting_fixtures: count } },
        [JERSEY_CITY_LIGHTS],
      ).totalCents;

    expect(price(10)).toBe(2_500);
    expect(price(11)).toBe(5_000); // a second whole block
    expect(price(35)).toBe(5_000);
    expect(price(36)).toBe(7_500);
  });

  it("leaves a straight per-unit rate exactly as it was", () => {
    // Houston's pinned sentence, re-asserted here: a rule with no `incrementUnits` must not
    // acquire a block description, which is why the branch is written rather than the
    // sentence being templated.
    const houston = rule({
      code: "PLUMB-FIXTURES",
      feeType: "per_unit",
      config: { unit: "fixtures", baseCents: 3_424, thresholdUnits: 3, centsPerUnit: 1_141 },
    });

    const [component] = calculatePermitFees(
      { asOf: AS_OF, fixtures: 6 },
      [houston],
    ).components;

    expect(component?.formula).toBe(
      "$34.24 for the first 3 fixtures, plus $11.41 for each additional fixture",
    );
    expect(component?.amountCents).toBe(6_847); // $34.24 + 3 x $11.41
  });
});
