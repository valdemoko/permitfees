import { describe, expect, it } from "vitest";

import { sacramentoSeed } from "@/content/sacramento";
import {
  SC_BUILDING_RULES,
  SC_ELECTRICAL_RULES,
  SC_FEE_EFFECTIVE_FROM,
  SC_FEE_LISTING_SOURCE_KEY,
  SC_PLUMBING_RULES,
  SC_TABLE_A_SOURCE_KEY,
} from "@/content/sacramento/fee-rules";
import { calculatePermitFees } from "@/lib/calc/engine";
import { validateFeeRule } from "@/lib/calc/schemas";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";

/**
 * City of Sacramento, California — the first jurisdiction whose building permit is a
 * hundred-bracket valuation ladder that hands over to a printed formula above $100,000.
 *
 * The assertions this file exists for are **$8,788.45**, **$3,453.45**, **$577.00** and
 * **$105.00**. The first is the worked example; the second is Table A's first formula and
 * proves the ladder and the formula meet at $1,000,000 cents of valuation rather than
 * overlapping or leaving a gap. The third is one of the two rows where Table A's
 * Residential column prints a different amount from its Commercial column — the row the
 * first extraction of this PDF got wrong by one line, and the reason it was re-read in a
 * second mode. The fourth is the flat trade permit that makes Sacramento the opposite of
 * San Diego on the trade side as well.
 */

const AS_OF = "2026-09-24";

function calculate(input: Omit<CalculationInput, "asOf">, rules: FeeRuleRecord[]) {
  return calculatePermitFees({ asOf: AS_OF, ...input }, rules);
}

function componentTotal(result: ReturnType<typeof calculatePermitFees>, code: string): number {
  const component = result.components.find((entry) => entry.code === code);
  expect(component, `component ${code} should be present`).toBeDefined();
  return component?.amountCents ?? 0;
}

function permitFeeOnly(input: Omit<CalculationInput, "asOf">): number {
  const result = calculate(input, SC_BUILDING_RULES);
  return result.components
    .filter((component) => /^BUILD-(PERMIT|FLAT)/.test(component.code))
    .reduce((sum, component) => sum + component.amountCents, 0);
}

describe("the payload", () => {
  it("carries three published permit pages with worked examples", () => {
    expect(sacramentoSeed.permitPages).toHaveLength(3);
    for (const page of sacramentoSeed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);
      expect(page.workedExample).not.toBeNull();
    }
  });

  it("names the pages building, electrical and plumbing", () => {
    expect(sacramentoSeed.permitPages.map((page) => page.permitTypeKey).sort()).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
  });

  it("clears the editorial gate on every page", () => {
    for (const page of sacramentoSeed.permitPages) {
      expect(page.intro.length).toBeGreaterThanOrEqual(240);
      expect(page.localSummary.length).toBeGreaterThanOrEqual(120);
      expect(page.seoTitle.length).toBeGreaterThan(0);
      expect(page.seoDescription.length).toBeGreaterThan(0);
    }
  });

  it("reuses the shared permit types rather than defining its own", () => {
    expect(sacramentoSeed.permitTypes).toEqual([]);
    expect(sacramentoSeed.projectTypes).toEqual([]);
  });

  it("records the date the fee sheet and Table B.1 were revised", () => {
    expect(SC_FEE_EFFECTIVE_FROM).toBe("2025-07-19");
    expect(SC_TABLE_A_SOURCE_KEY).toBe(
      "sacramento-tables-a-and-b1-building-permit-fees-2025-07",
    );
    expect(SC_FEE_LISTING_SOURCE_KEY).toBe("sacramento-fees-and-charges-listing-2026-07");
  });

  it("charges the City's add-ons from the fee listing and the permit from the fee sheet", () => {
    const addOns = SC_BUILDING_RULES.filter(
      (rule) => rule.code === "BUILD-GENERAL-PLAN" || rule.code === "BUILD-CONSTRUCTION-EXCISE",
    );
    for (const rule of addOns) expect(rule.sourceId).toBe(SC_FEE_LISTING_SOURCE_KEY);
    expect(
      SC_BUILDING_RULES.find((rule) => rule.code === "BUILD-PERMIT-RESIDENTIAL")?.sourceId,
    ).toBe(SC_TABLE_A_SOURCE_KEY);
  });
});

describe("every rule validates", () => {
  const all = [...SC_BUILDING_RULES, ...SC_ELECTRICAL_RULES, ...SC_PLUMBING_RULES];

  it("passes the engine's own schema", () => {
    for (const rule of all) {
      const result = validateFeeRule(rule);
      expect(result.ok, `${rule.code}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });

  it("gives every rule a unique code within its permit type", () => {
    for (const rules of [SC_BUILDING_RULES, SC_ELECTRICAL_RULES, SC_PLUMBING_RULES]) {
      const codes = rules.map((rule) => rule.code);
      expect(new Set(codes).size).toBe(codes.length);
    }
  });
});

describe("Table A's ladder", () => {
  it("charges the first bracket to anything at or below $999 of valuation", () => {
    expect(permitFeeOnly({ valuationCents: 99_900, occupancy: "residential" })).toBe(7_500);
    expect(permitFeeOnly({ valuationCents: 12_000, occupancy: "residential" })).toBe(7_500);
  });

  it("charges the bracket the valuation falls in", () => {
    // $40,000 falls in the $40,999 bracket: Table A prints $622.
    expect(permitFeeOnly({ valuationCents: 4_000_000, occupancy: "residential" })).toBe(62_200);
    // $9,999 falls in the $9,999 bracket: Table A prints $308.
    expect(permitFeeOnly({ valuationCents: 999_900, occupancy: "residential" })).toBe(30_800);
  });

  it("prints the last bracket at $99,999", () => {
    expect(permitFeeOnly({ valuationCents: 9_999_900, occupancy: "residential" })).toBe(107_800);
  });

  it("charges the Commercial column to non-residential work", () => {
    expect(permitFeeOnly({ valuationCents: 3_399_900, occupancy: "commercial" })).toBe(55_700);
  });

  it("charges the two rows where the Residential column differs from the Commercial one", () => {
    // $33,999: Residential prints $577, Commercial prints $557.
    expect(permitFeeOnly({ valuationCents: 3_399_900, occupancy: "residential" })).toBe(57_700);
    // $36,999: Residential prints $586, Commercial prints $585.
    expect(permitFeeOnly({ valuationCents: 3_699_900, occupancy: "residential" })).toBe(58_600);
    expect(permitFeeOnly({ valuationCents: 3_699_900, occupancy: "commercial" })).toBe(58_500);
  });

  it("does not apply the ladder to a Table B.1 flat scope", () => {
    const result = calculate(
      { valuationCents: 4_000_000, occupancy: "residential", custom: { project_type: "kitchen_remodel" } },
      SC_BUILDING_RULES,
    );
    expect(componentTotal(result, "BUILD-FLAT-KITCHEN-REMODEL")).toBe(42_500);
    expect(result.components.some((component) => /^BUILD-PERMIT/.test(component.code))).toBe(false);
  });
});

describe("the formulas the ladder hands over to", () => {
  it("meets the ladder exactly at $100,000", () => {
    expect(permitFeeOnly({ valuationCents: 10_000_000, occupancy: "commercial" })).toBe(107_800);
    expect(permitFeeOnly({ valuationCents: 10_000_100, occupancy: "commercial" })).toBe(107_801);
  });

  it("charges the first band, not a percentage of the whole valuation", () => {
    // $1,078 + 350,000 x $0.006787 on a $450,000 house.
    expect(permitFeeOnly({ valuationCents: 45_000_000, occupancy: "residential" })).toBe(345_345);
  });

  it("meets the second band at $3,000,000", () => {
    expect(permitFeeOnly({ valuationCents: 299_999_999, occupancy: "commercial" })).toBe(2_076_030);
    expect(permitFeeOnly({ valuationCents: 300_000_000, occupancy: "commercial" })).toBe(2_076_100);
    expect(permitFeeOnly({ valuationCents: 400_000_000, occupancy: "commercial" })).toBe(2_589_400);
  });

  it("meets the third band at $10,000,000", () => {
    expect(permitFeeOnly({ valuationCents: 1_000_000_000, occupancy: "commercial" })).toBe(
      5_669_200,
    );
    expect(permitFeeOnly({ valuationCents: 1_200_000_000, occupancy: "commercial" })).toBe(
      6_593_200,
    );
  });
});

describe("the four City add-ons", () => {
  const base = {
    valuationCents: 45_000_000,
    occupancy: "residential" as const,
    workType: "new_construction" as const,
    units: 1,
    custom: { bedrooms: 4 },
  };

  it("charges the General Plan Maintenance Fee at $2.60 per $1,000", () => {
    const result = calculate(base, SC_BUILDING_RULES);
    expect(componentTotal(result, "BUILD-GENERAL-PLAN")).toBe(117_000);
  });

  it("holds the General Plan Maintenance Fee at its published $38,200 ceiling", () => {
    const result = calculate({ ...base, valuationCents: 2_000_000_000 }, SC_BUILDING_RULES);
    expect(componentTotal(result, "BUILD-GENERAL-PLAN")).toBe(3_820_000);
  });

  it("charges the Construction Excise Tax at 0.008 of the valuation", () => {
    const result = calculate(base, SC_BUILDING_RULES);
    expect(componentTotal(result, "BUILD-CONSTRUCTION-EXCISE")).toBe(360_000);
  });

  it("charges the City Business Operations Tax to a contractor and not to an owner-builder", () => {
    expect(componentTotal(calculate(base, SC_BUILDING_RULES), "BUILD-BUSINESS-OPERATIONS-TAX")).toBe(
      18_000,
    );
    const ownerBuilder = calculate({ ...base, isOwnerBuilder: true }, SC_BUILDING_RULES);
    expect(
      ownerBuilder.components.some(
        (component) => component.code === "BUILD-BUSINESS-OPERATIONS-TAX",
      ),
    ).toBe(false);
    expect(ownerBuilder.totalCents).toBe(860_845);
  });

  it("holds the City Business Operations Tax at its published $5,000 ceiling", () => {
    const result = calculate({ ...base, valuationCents: 2_000_000_000 }, SC_BUILDING_RULES);
    expect(componentTotal(result, "BUILD-BUSINESS-OPERATIONS-TAX")).toBe(500_000);
  });

  it("charges the Residential Construction Tax per unit and by bedroom count", () => {
    const one = calculate(base, SC_BUILDING_RULES);
    expect(componentTotal(one, "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-3BR")).toBe(38_500);

    const twoBedrooms = calculate({ ...base, custom: { bedrooms: 2 } }, SC_BUILDING_RULES);
    expect(componentTotal(twoBedrooms, "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-2BR")).toBe(31_500);

    const oneBedroom = calculate({ ...base, custom: { bedrooms: 1 } }, SC_BUILDING_RULES);
    expect(componentTotal(oneBedroom, "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-1BR")).toBe(25_000);

    const twoUnits = calculate({ ...base, units: 2, custom: { bedrooms: 2 } }, SC_BUILDING_RULES);
    expect(componentTotal(twoUnits, "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-2BR")).toBe(63_000);
  });
});

describe("the worked example", () => {
  it("totals $8,788.45 for a $450,000 four-bedroom house built by a contractor", () => {
    const result = calculate(
      {
        valuationCents: 45_000_000,
        occupancy: "residential",
        workType: "new_construction",
        units: 1,
        custom: { bedrooms: 4 },
      },
      SC_BUILDING_RULES,
    );
    expect(result.totalCents).toBe(878_845);
    expect(componentTotal(result, "BUILD-PERMIT-BAND-100K-TO-3M")).toBe(345_345);
    expect(componentTotal(result, "BUILD-GENERAL-PLAN")).toBe(117_000);
    expect(componentTotal(result, "BUILD-CONSTRUCTION-EXCISE")).toBe(360_000);
    expect(componentTotal(result, "BUILD-BUSINESS-OPERATIONS-TAX")).toBe(18_000);
    expect(componentTotal(result, "BUILD-RESIDENTIAL-CONSTRUCTION-TAX-3BR")).toBe(38_500);
  });

  it("totals $4,846.05 for a $250,000 commercial building", () => {
    const result = calculate(
      { valuationCents: 25_000_000, occupancy: "commercial", workType: "new_construction" },
      SC_BUILDING_RULES,
    );
    expect(result.totalCents).toBe(484_605);
    expect(componentTotal(result, "BUILD-PERMIT-BAND-100K-TO-3M")).toBe(209_605);
  });
});

describe("the trade permits are flat scopes", () => {
  it("charges one $105 permit for the residential electrical scope", () => {
    const result = calculate(
      { occupancy: "residential", custom: { electrical_item: "minor_residential" } },
      SC_ELECTRICAL_RULES,
    );
    expect(result.totalCents).toBe(10_500);
    expect(result.components).toHaveLength(1);
  });

  it("charges the safety inspection and the sign electrical fee", () => {
    expect(
      calculate({ custom: { electrical_item: "safety_inspection" } }, SC_ELECTRICAL_RULES)
        .totalCents,
    ).toBe(10_700);
    expect(calculate({ custom: { electrical_item: "sign" } }, SC_ELECTRICAL_RULES).totalCents).toBe(
      21_600,
    );
  });

  it("charges one $105 permit for the residential plumbing scope and $75 for a water heater", () => {
    expect(
      calculate({ custom: { plumbing_item: "minor_residential" } }, SC_PLUMBING_RULES).totalCents,
    ).toBe(10_500);
    expect(
      calculate({ custom: { plumbing_item: "water_heater" } }, SC_PLUMBING_RULES).totalCents,
    ).toBe(7_500);
  });

  it("lets a reader put both plumbing scopes on one calculation", () => {
    const result = calculate(
      { custom: { plumbing_item: "minor_residential" } },
      SC_PLUMBING_RULES,
    );
    expect(result.totalCents).toBe(10_500);
  });
});
