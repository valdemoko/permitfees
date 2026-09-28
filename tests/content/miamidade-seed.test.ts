import { describe, expect, it } from "vitest";

import { miamiDadeSeed } from "@/content/miamidade";
import {
  MD_BUILDING_MINIMUM_CENTS,
  MD_BUILDING_RULES,
  MD_BUILDING_SOURCE_KEY,
  MD_CPBC_UPFRONT_FEE_CENTS,
  MD_ELECTRICAL_RULES,
  MD_ELECTRICAL_SHEET_SOURCE_KEY,
  MD_FEE_EFFECTIVE_FROM,
  MD_PLUMBING_RULES,
  MD_PLUMBING_SHEET_SOURCE_KEY,
  MD_RER_SURCHARGE_BPS,
  MD_STATE_SURCHARGE_MINIMUM_CENTS,
  MD_TRADE_MINIMUM_CENTS,
} from "@/content/miamidade/fee-rules";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Miami-Dade County, Florida — a permit priced by area, and trade permits priced from the
 * fee sheet the applicant files.
 *
 * The assertion this file exists for is **$227.90**. Both trade sheets print that figure
 * as their minimum and neither prints the arithmetic behind it; it is the County's $147.00
 * minimum, its $65.00 up-front fee and 7.5% of both. Computing it from the parts proves that
 * this site's rules, its evaluation order and its surcharge bases are arranged the way the
 * County arranged them, which no single rule's own value could show.
 */

const AS_OF = "2026-09-24";

function calculate(input: Omit<CalculationInput, "asOf">, rules: FeeRuleRecord[]) {
  return  calculatePermitFees({ asOf: AS_OF, ...input }, rules);
}

describe("the payload", () => {
  it("carries three published permit pages with worked examples", () => {
    expect(miamiDadeSeed.permitPages).toHaveLength(3);
    expect(miamiDadeSeed.permitPages.map((page) => page.permitTypeKey).sort()).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
    expect(
      miamiDadeSeed.permitPages.every(
        (page) => page.publishStatus === "published" && !page.noindex && page.workedExample,
      ),
    ).toBe(true);
  });

  it("keys each trade page to the fee sheet the applicant actually files", () => {
    const schedules = new Map(
      miamiDadeSeed.feeSchedules.map((schedule) => [schedule.key, schedule.sourceKey]),
    );
    expect(schedules.get(MD_ELECTRICAL_SHEET_SOURCE_KEY)).toBe(MD_ELECTRICAL_SHEET_SOURCE_KEY);
    expect(schedules.get(MD_PLUMBING_SHEET_SOURCE_KEY)).toBe(MD_PLUMBING_SHEET_SOURCE_KEY);

    const sourceKeys = miamiDadeSeed.sources.map((source) => source.key);
    expect(sourceKeys).toEqual([
      MD_BUILDING_SOURCE_KEY,
      MD_ELECTRICAL_SHEET_SOURCE_KEY,
      MD_PLUMBING_SHEET_SOURCE_KEY,
      "miami-dade-mechanical-fee-sheet-2026",
      "miami-dade-building-permit-fees-page",
      "miami-dade-plan-review-page",
    ]);
  });

  it("records the implementing order's effective date and its supersession", () => {
    expect(MD_FEE_EFFECTIVE_FROM).toBe("2026-06-26");
    expect(miamiDadeSeed.sources[0]?.documentDate).toBe("2026-06-16");
    expect(miamiDadeSeed.sources[0]?.notes).toContain("superseding the order of June 26, 2025");
  });
});

describe("the building section", () => {
  it("prices a house by area, and the area is all that matters", () => {
    const result = calculate(
      {
        squareFootage: 2_500,
        occupancy: "residential",
        workType: "new_construction",
        custom: { dwelling_type: "single_family" },
      },
      MD_BUILDING_RULES,
    );

    expect(result.totalCents).toBe(270_988);
    expect(result.components.map((component) => [component.code, component.amountCents])).toEqual([
      ["BUILD-SFD-NEW", 240_000],
      ["BLD-CPBC-UPFRONT", 6_500],
      ["BLD-RER-SURCHARGE", 18_488],
      ["BLD-STATE-SURCHARGE-1PCT", 2_400],
      ["BLD-STATE-SURCHARGE-1_5PCT", 3_600],
    ]);
  });

  it("prices the same house as townhome units at $0.40, which is why the row is gated", () => {
    const result = calculate(
      {
        squareFootage: 2_500,
        occupancy: "residential",
        workType: "new_construction",
        custom: { dwelling_type: "townhome" },
      },
      MD_BUILDING_RULES,
    );
    expect(result.components.find((component) => component.componentType === "base")?.amountCents).toBe(
      100_000,
    );
  });

  it("charges commercial area in two tiers across 100,000 square feet", () => {
    const base = (squareFootage: number) =>
      calculate(
        { squareFootage, occupancy: "commercial", workType: "new_construction" },
        MD_BUILDING_RULES,
      ).components.find((component) => component.componentType === "base")?.amountCents;

    expect(base(30_000)).toBe(1_200_000);
    expect(base(100_000)).toBe(4_000_000);
    // The first 100,000 square feet at $0.40 and the remainder at $0.15.
    expect(base(260_000)).toBe(4_000_000 + 160_000 * 15);
  });

  it("caps a house alteration at the row's published maximum", () => {
    const base = (squareFootage: number) =>
      calculate(
        {
          squareFootage,
          occupancy: "residential",
          workType: "alteration",
          custom: { dwelling_type: "single_family" },
        },
        MD_BUILDING_RULES,
      ).components.find((component) => component.componentType === "base")?.amountCents;

    expect(base(1_200)).toBe(60_000);
    expect(base(2_000)).toBe(84_795);
    expect(base(4_000)).toBe(84_795);
  });

  it("applies the $147.00 minimum to each item, which is what the section says", () => {
    const result = calculate(
      { squareFootage: 900, custom: { schedule_item: "slab" } },
      MD_BUILDING_RULES,
    );
    expect(result.components.find((component) => component.code === "BUILD-SLAB")?.amountCents).toBe(
      MD_BUILDING_MINIMUM_CENTS,
    );
    expect(MD_BUILDING_MINIMUM_CENTS).toBe(14_700);
  });

  it("prices a re-roof by area and takes the tile row when the covering is named", () => {
    const roof = (covering: string | undefined) =>
      calculate(
        { squareFootage: 2_600, custom: { schedule_item: "roofing", roof_covering: covering } },
        MD_BUILDING_RULES,
      ).components.find((component) => component.componentType === "base");

    expect(roof(undefined)?.code).toBe("BUILD-ROOFING-SHINGLE");
    expect(roof("shingle")?.amountCents).toBe(28_600);
    expect(roof("tile")?.code).toBe("BUILD-ROOFING-TILE");
    expect(roof("tile")?.amountCents).toBe(36_400);
  });

  it("charges three surcharges at once, the county's own included", () => {
    const result = calculate(
      {
        squareFootage: 2_500,
        occupancy: "residential",
        workType: "new_construction",
        custom: { dwelling_type: "single_family" },
      },
      MD_BUILDING_RULES,
    );
    const surcharges = result.components.filter((component) =>
      component.componentType === "surcharge" || component.componentType === "state_surcharge",
    );

    expect(surcharges).toHaveLength(3);
    expect(MD_RER_SURCHARGE_BPS).toBe(750);
    // The county's own surcharge reads the whole charged subtotal — the fee and the
    // up-front fee — which is why it is $184.88 on a $2,465.00 subtotal.
    expect(surcharges[0]?.amountCents).toBe(18_488);
  });
});

describe("the trade fee sheets", () => {
  it("reproduces the $227.90 minimum the sheets print, from the parts they print", () => {
    const result = calculate(
      { custom: { electrical_item: "permanent_service", amperage: 400 } },
      MD_ELECTRICAL_RULES,
    );

    // $7.26 per 100 amperes on a 400-ampere service is $29.04; the floor lifts the fee
    // rows to $147.00, the up-front fee adds $65.00, and 7.5% of both is $15.90.
    expect(result.components.map((component) => [component.code, component.amountCents])).toEqual([
      ["ELEC-SERVICE-100A", 2_904],
      ["ELEC-TRADE-MINIMUM", 11_796],
      ["ELEC-CPBC-UPFRONT", MD_CPBC_UPFRONT_FEE_CENTS],
      ["ELEC-RER-SURCHARGE", 1_590],
      ["ELEC-STATE-SURCHARGE-1PCT", MD_STATE_SURCHARGE_MINIMUM_CENTS],
      ["ELEC-STATE-SURCHARGE-1_5PCT", 221],
    ]);

    const publishedMinimum =
      MD_TRADE_MINIMUM_CENTS + MD_CPBC_UPFRONT_FEE_CENTS + 1_590;
    expect(publishedMinimum).toBe(22_790);
    expect(result.totalCents).toBe(23_211);
  });

  it("reaches the same floor from the plumbing sheet's own sentence", () => {
    const result = calculate({ fixtures: 6, custom: {} }, MD_PLUMBING_RULES);

    // Six fixtures at $9.66 is $57.96, and the floor adds the $89.04 that brings the fee
    // rows to $147.00.
    expect(result.components.find((component) => component.code === "PLUMB-ROUGH-AND-FIXTURE")
      ?.amountCents).toBe(5_796);
    expect(result.components.find((component) => component.code === "PLB-TRADE-MINIMUM")
      ?.amountCents).toBe(8_904);
    expect(result.totalCents).toBe(23_211);
  });

  it("charges the floor once for a permit, not once for each of its rows", () => {
    const result = calculate(
      {
        custom: {
          electrical_item: "outlet",
          outlets: 60,
          panels: 1,
          lighting_fixtures: 40,
          tons: 5,
        },
      },
      MD_ELECTRICAL_RULES,
    );

    // Five rows totalling $339.51: above the floor, so no minimum component at all.
    expect(result.appliedRuleIds).not.toContain("md-electrical-trade-minimum");
    expect(result.totalCents).toBe(44_334);
    // Display order: the fee rows in schedule order, then the up-front fee and the
    // three surcharges.
    expect(result.components.map((component) => [component.code, component.amountCents])).toEqual([
      ["ELEC-AIR-CONDITIONING", 4_830],
      ["ELEC-LIGHTING-FIXTURE", 10_360],
      ["ELEC-OUTLET", 15_540],
      ["ELEC-PANEL-BOARD", 3_221],
      ["ELEC-CPBC-UPFRONT", 6_500],
      ["ELEC-RER-SURCHARGE", 3_034],
      ["ELEC-STATE-SURCHARGE-1PCT", 340],
      ["ELEC-STATE-SURCHARGE-1_5PCT", 509],
    ]);
  });

  it("adds the rows a trade permit is made of rather than choosing between them", () => {
    const result = calculate(
      {
        squareFootage: 2_500,
        fixtures: 18,
        occupancy: "residential",
        workType: "new_construction",
        custom: { plumbing_item: "water_service", connections: 1, meters: 1 },
      },
      MD_PLUMBING_RULES,
    );

    expect(result.components.map((component) => [component.code, component.amountCents])).toEqual([
      ["PLUMB-ROUGH-AND-FIXTURE", 17_388],
      ["PLUMB-SEWER-CONNECTION", 4_831],
      ["PLUMB-SFD", 35_750],
      ["PLUMB-WATER-SERVICE", 1_288],
      ["PLB-CPBC-UPFRONT", 6_500],
      ["PLB-RER-SURCHARGE", 4_932],
      ["PLB-STATE-SURCHARGE-1PCT", 593],
      ["PLB-STATE-SURCHARGE-1_5PCT", 889],
    ]);
    expect(result.totalCents).toBe(72_171);
  });

  it("treats the service rows as alternatives and the counts as additions", () => {
    const service = calculate(
      { custom: { electrical_item: "permanent_service", amperage: 200, panels: 1 } },
      MD_ELECTRICAL_RULES,
    );
    expect(service.appliedRuleIds).toContain("md-elec-service");

    const alternative = calculate(
      { custom: { electrical_item: "pool" } },
      MD_ELECTRICAL_RULES,
    );
    expect(alternative.components.map((component) => component.code)).toEqual([
      "ELEC-POOL-RESIDENTIAL",
      "ELEC-TRADE-MINIMUM",
      "ELEC-CPBC-UPFRONT",
      "ELEC-RER-SURCHARGE",
      "ELEC-STATE-SURCHARGE-1PCT",
      "ELEC-STATE-SURCHARGE-1_5PCT",
    ]);
  });

  it("prices a 100-ampere service as a whole hundred and 450 as five", () => {
    const fee = (amperage: number) =>
      calculate(
        { custom: { electrical_item: "permanent_service", amperage } },
        MD_ELECTRICAL_RULES,
      ).components.find((component) => component.code === "ELEC-SERVICE-100A")?.amountCents;

    expect(fee(100)).toBe(726);
    expect(fee(200)).toBe(1_452);
    expect(fee(400)).toBe(2_904);
    expect(fee(450)).toBe(3_630);
  });

  it("names what a permit's own surcharge quotes rather than asserting a rate", () => {
    const rer = MD_ELECTRICAL_RULES.find((rule) => rule.code === "ELEC-RER-SURCHARGE");
    expect(rer?.config).toEqual({ basis: "fee_subtotal", rateBps: MD_RER_SURCHARGE_BPS });
    expect(rer?.description).toContain("except for Enforcement fees listed in Sub-section K");
  });
});
