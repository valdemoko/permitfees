import { describe, expect, it } from "vitest";

import { sanDiegoSeed } from "@/content/sandiego";
import {
  SD_BUILDING_RULES,
  SD_ELECTRICAL_RULES,
  SD_MEP_FEE_EFFECTIVE_FROM,
  SD_PLUMBING_RULES,
  SD_TABLE_501A,
  SD_FEE_EFFECTIVE_FROM,
} from "@/content/sandiego/fee-rules";
import { calculatePermitFees } from "@/lib/calc/engine";
import { validateFeeRule } from "@/lib/calc/schemas";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";

/**
 * City of San Diego, California — the first jurisdiction whose building permit is priced
 * as plan check plus inspection from area, and whose trade permits are priced per unit of
 * work.
 *
 * The assertions this file exists for are **$34,135.43**, **$2,026.30** and **$2,206.52**.
 * The first is a plan-check/inspection pair built from a base rate, a 3,000-square-foot
 * threshold and a per-square-foot increment, plus two State of California fees and four
 * City charges; computing it proves the engine reads the base, the threshold and the
 * increment in the order Table 501A prints them. The second and third prove the
 * First-Unit/Each-Additional-Unit shape on the trade tables.
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

describe("the payload", () => {
  it("carries three published permit pages with worked examples", () => {
    expect(sanDiegoSeed.permitPages).toHaveLength(3);
    for (const page of sanDiegoSeed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);
      expect(page.workedExample).not.toBeNull();
    }
  });

  it("names the pages building, electrical and plumbing", () => {
    expect(sanDiegoSeed.permitPages.map((page) => page.permitTypeKey).sort()).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
  });

  it("clears the editorial gate on every page", () => {
    for (const page of sanDiegoSeed.permitPages) {
      expect(page.intro.length).toBeGreaterThanOrEqual(240);
      expect(page.localSummary.length).toBeGreaterThanOrEqual(120);
      expect(page.seoTitle.length).toBeGreaterThan(0);
      expect(page.seoDescription.length).toBeGreaterThan(0);
    }
  });

  it("reuses the shared permit types rather than defining its own", () => {
    expect(sanDiegoSeed.permitTypes).toEqual([]);
    expect(sanDiegoSeed.projectTypes).toEqual([]);
  });

  it("records the two effective dates the bulletins print", () => {
    expect(SD_FEE_EFFECTIVE_FROM).toBe("2026-08-07");
    expect(SD_MEP_FEE_EFFECTIVE_FROM).toBe("2026-05-04");
  });
});

describe("every rule validates", () => {
  const all = [...SD_BUILDING_RULES, ...SD_ELECTRICAL_RULES, ...SD_PLUMBING_RULES];

  it("passes the engine's own schema", () => {
    for (const rule of all) {
      const result = validateFeeRule(rule);
      expect(result.ok, `${rule.code}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });

  it("gives every rule a unique code within its permit type", () => {
    for (const rules of [SD_BUILDING_RULES, SD_ELECTRICAL_RULES, SD_PLUMBING_RULES]) {
      const codes = rules.map((rule) => rule.code);
      expect(new Set(codes).size).toBe(codes.length);
    }
  });
});

describe("the building permit: plan check plus inspection", () => {
  const inputs = {
    squareFootage: 5_000,
    valuationCents: 120_000_000,
    occupancy: "residential" as const,
    workType: "new_construction" as const,
    custom: { project_type: "sdu_duplex", stories: 2 },
  };

  it("charges the base rate plus the increment above the base square footage", () => {
    const result = calculate(inputs, SD_BUILDING_RULES);
    // $8,085.26 + 2,000 x $4.10 and $8,401.90 + 2,000 x $4.21
    expect(componentTotal(result, "BUILD-PLAN-CHECK-SDU-DUPLEX")).toBe(1_628_526);
    expect(componentTotal(result, "BUILD-INSPECTION-SDU-DUPLEX")).toBe(1_682_190);
  });

  it("charges the base rate alone when the building is under the threshold", () => {
    const result = calculate({ ...inputs, squareFootage: 2_500 }, SD_BUILDING_RULES);
    expect(componentTotal(result, "BUILD-PLAN-CHECK-SDU-DUPLEX")).toBe(808_526);
    expect(componentTotal(result, "BUILD-INSPECTION-SDU-DUPLEX")).toBe(840_190);
  });

  it("charges the 13-cent State/Seismic rate to a two-storey house", () => {
    const result = calculate(inputs, SD_BUILDING_RULES);
    expect(componentTotal(result, "BUILD-STATE-SEISMIC-RESIDENTIAL")).toBe(15_600);
    expect(result.components.some((c) => c.code === "BUILD-STATE-SEISMIC-NONRESIDENTIAL")).toBe(
      false,
    );
  });

  it("charges the 28-cent State/Seismic rate to non-residential work", () => {
    const result = calculate(
      { ...inputs, occupancy: "commercial", custom: { project_type: "new_commercial", stories: 1 } },
      SD_BUILDING_RULES,
    );
    expect(componentTotal(result, "BUILD-STATE-SEISMIC-NONRESIDENTIAL")).toBe(33_600);
    expect(result.components.some((c) => c.code === "BUILD-STATE-SEISMIC-RESIDENTIAL")).toBe(false);
  });

  it("charges the Building Standards fee at $1 per $25,000, rounded up", () => {
    // $1,200,000 is exactly 48 lots of $25,000, so $48.00.
    expect(componentTotal(calculate(inputs, SD_BUILDING_RULES), "BUILD-BUILDING-STANDARDS")).toBe(
      4_800,
    );
    // $30,000 rounds up to two lots, so $2.00.
    expect(
      componentTotal(
        calculate({ ...inputs, valuationCents: 3_000_000 }, SD_BUILDING_RULES),
        "BUILD-BUILDING-STANDARDS",
      ),
    ).toBe(200);
    // $10,000 would be $1.00 by the rate anyway; the minimum keeps it there.
    expect(
      componentTotal(
        calculate({ ...inputs, valuationCents: 1_000_000 }, SD_BUILDING_RULES),
        "BUILD-BUILDING-STANDARDS",
      ),
    ).toBe(100);
  });

  it("adds the City's four flat charges", () => {
    const result = calculate(inputs, SD_BUILDING_RULES);
    expect(componentTotal(result, "BUILD-GENERAL-PLAN")).toBe(73_700);
    expect(componentTotal(result, "BUILD-MAPPING")).toBe(1_216);
    expect(componentTotal(result, "BUILD-LEAD-HAZARD")).toBe(5_800);
    expect(componentTotal(result, "BUILD-FEE-COLLECTION")).toBe(1_711);
  });

  it("computes the worked example's total", () => {
    const result = calculate(inputs, SD_BUILDING_RULES);
    expect(result.totalCents).toBe(3_413_543);
  });

  it("drops the plan-check and inspection pair for a project type that is not modelled", () => {
    const result = calculate(
      { ...inputs, custom: { project_type: "master_plan_mdu", stories: 1 } },
      SD_BUILDING_RULES,
    );
    expect(result.components.some((c) => c.code.startsWith("BUILD-PLAN-CHECK-"))).toBe(false);
    expect(result.components.some((c) => c.code.startsWith("BUILD-INSPECTION-"))).toBe(false);
  });

  it("transcribes ten project types with distinct base and increment pairs", () => {
    expect(SD_TABLE_501A).toHaveLength(10);
    for (const row of SD_TABLE_501A) {
      expect(row.baseSqFt).toBeGreaterThan(0);
      expect(row.planCheckIncrementCentsPerSqFt).toBeGreaterThan(0);
      expect(row.inspectionIncrementCentsPerSqFt).toBeGreaterThan(0);
    }
  });
});

describe("the electrical permit", () => {
  it("charges the first dwelling unit's base and each additional unit after it", () => {
    const result = calculate(
      { units: 8, occupancy: "residential", custom: { electrical_item: "mdu_service" } },
      SD_ELECTRICAL_RULES,
    );
    // $1,412.54 + 7 x $87.68
    expect(result.totalCents).toBe(202_630);
  });

  it("charges one dwelling unit the base alone", () => {
    const result = calculate(
      { units: 1, occupancy: "residential", custom: { electrical_item: "mdu_service" } },
      SD_ELECTRICAL_RULES,
    );
    expect(result.totalCents).toBe(141_254);
  });

  it("charges the flat per-item permits", () => {
    const panel = calculate({ custom: { electrical_item: "panel_upgrade" } }, SD_ELECTRICAL_RULES);
    expect(panel.totalCents).toBe(17_657);

    const specialized = calculate(
      { custom: { electrical_item: "specialized" } },
      SD_ELECTRICAL_RULES,
    );
    expect(specialized.totalCents).toBe(52_971);
  });

  it("charges nothing when no electrical item is named", () => {
    const result = calculate({ units: 4, occupancy: "residential" }, SD_ELECTRICAL_RULES);
    expect(result.totalCents).toBe(0);
  });
});

describe("the plumbing permit", () => {
  it("charges the first dwelling unit's base and each additional unit after it", () => {
    const result = calculate(
      { units: 12, occupancy: "residential", custom: { plumbing_item: "mdu_new" } },
      SD_PLUMBING_RULES,
    );
    // $264.25 + 11 x $176.57
    expect(result.totalCents).toBe(220_652);
  });

  it("prices a remodel on its own row, at a lower additional-unit amount", () => {
    const result = calculate(
      { units: 12, occupancy: "residential", custom: { plumbing_item: "mdu_remodel" } },
      SD_PLUMBING_RULES,
    );
    // $264.25 + 11 x $52.39
    expect(result.totalCents).toBe(84_054);
  });

  it("charges the flat per-item rows", () => {
    const heater = calculate({ custom: { plumbing_item: "water_heater" } }, SD_PLUMBING_RULES);
    expect(heater.totalCents).toBe(12_297);

    const gas = calculate({ custom: { plumbing_item: "gas_system" } }, SD_PLUMBING_RULES);
    expect(gas.totalCents).toBe(26_425);
  });

  it("charges the backflow row its base and then each additional device", () => {
    const one = calculate(
      { custom: { plumbing_item: "backflow", backflow_devices: 1 } },
      SD_PLUMBING_RULES,
    );
    const three = calculate(
      { custom: { plumbing_item: "backflow", backflow_devices: 3 } },
      SD_PLUMBING_RULES,
    );
    expect(one.totalCents).toBe(8_768);
    expect(three.totalCents).toBe(8_768 + 2 * 5_239);
  });
});
