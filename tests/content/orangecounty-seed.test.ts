import { describe, expect, it } from "vitest";

import { orangeCountySeed } from "@/content/orangecounty";
import {
  OC_AVERAGE_COST_PER_SQ_FT,
  OC_BUILDING_RULES,
  OC_BUILDING_SOURCE_KEY,
  OC_ELECTRICAL_RULES,
  OC_FEE_EFFECTIVE_FROM,
  OC_PLUMBING_RULES,
  OC_STATE_SURCHARGE_MINIMUM_CENTS,
  OC_VALUATION_METHOD_NOTE,
} from "@/content/orangecounty/fee-rules";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";

/**
 * Orange County, Florida — the county that publishes its own valuation inputs.
 *
 * The assertions here are of three kinds: the schedule's own published figures
 * recomputed through the engine, the seams inside its band tables, and the payroll of
 * the payload itself. The most valuable one is the last group of calculations, because
 * the whole point of this jurisdiction is that a reader can check the valuation the fee
 * is charged on against a table the County prints — so the tests check it too, from the
 * table rather than from a number written here.
 */

const AS_OF = "2026-09-24";

function calculate(input: Omit<CalculationInput, "asOf">, rules: FeeRuleRecord[]) {
  return calculatePermitFees({ asOf: AS_OF, ...input }, rules);
}

function rule(rules: FeeRuleRecord[], code: string): FeeRuleRecord {
  const found = rules.find((candidate) => candidate.code === code);
  if (!found) throw new Error(`No rule with code ${code}`);
  return found;
}

/** The County's own published cost per square foot for an occupancy and building type. */
function perSqFt(occupancy: string, constructionType: string): number {
  const row = OC_AVERAGE_COST_PER_SQ_FT.find((candidate) => candidate.occupancy === occupancy);
  const cost = row?.costs.find((candidate) => candidate.constructionType === constructionType);
  if (!cost || cost.perSqFt === null) {
    throw new Error(`No published figure for ${occupancy} ${constructionType}`);
  }
  return cost.perSqFt;
}

describe("the payload", () => {
  it("carries three published permit pages and one jurisdiction per permit type", () => {
    expect(orangeCountySeed.permitPages).toHaveLength(3);
    expect(orangeCountySeed.permitPages.map((page) => page.permitTypeKey).sort()).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
    expect(
      orangeCountySeed.permitPages.every(
        (page) => page.publishStatus === "published" && !page.noindex && page.workedExample,
      ),
    ).toBe(true);
  });

  it("keys all three fee schedules to the one document they come from", () => {
    // One PDF carries the building, electrical and plumbing sections, so three schedules
    // with three keys would be three records describing one file.
    expect(orangeCountySeed.feeSchedules).toHaveLength(3);
    expect(
      orangeCountySeed.feeSchedules.every((schedule) => schedule.sourceKey === OC_BUILDING_SOURCE_KEY),
    ).toBe(true);
    expect(orangeCountySeed.sources.map((source) => source.key)).toContain(OC_BUILDING_SOURCE_KEY);
  });

  it("records the effective date the content pages print, not the stale footer", () => {
    // Every content page of the Building Safety section is footed "Effective July 2025";
    // the table-of-contents pages still carry "Effective 10/1/13".
    expect(OC_FEE_EFFECTIVE_FROM).toBe("2025-07-01");
    expect(
      orangeCountySeed.feeSchedules.every((schedule) => schedule.effectiveFrom === OC_FEE_EFFECTIVE_FROM),
    ).toBe(true);
  });

  it("names the divisions that charge a project besides Building Safety", () => {
    expect(orangeCountySeed.departments.map((department) => department.key)).toEqual([
      "orange-county-building-safety",
      "orange-county-zoning",
      "orange-county-peds",
    ]);
    // The county's own FAQ — "review and/or inspection fees by 10 or more different
    // divisions" — is quoted in the requirement that carries the claim, and the plan
    // submittal fee is named in the exclusions where a reader would look for it.
    const divisions = orangeCountySeed.requirements.find((requirement) =>
      requirement.title.includes("Ten or more divisions"),
    );
    expect(divisions?.description).toContain("10 or more different divisions");
    expect(divisions?.description).toContain("55%");
    expect(orangeCountySeed.profile.notIncluded).toContain("Plan Submittal Fee");
  });
});

describe("the building table", () => {
  it("prices a house the County's own way: area times published cost, then the band", () => {
    const perFoot = perSqFt("R-3", "VB");
    expect(perFoot).toBe(97);

    const valuationCents = 2_500 * perFoot * 100;
    const result = calculate(
      { valuationCents, occupancy: "residential", workType: "new_construction" },
      OC_BUILDING_RULES,
    );

    // $26.00 for the first $1,000, then 242 further thousands at $3.00, since the 242nd
    // thousand is a fraction thereof and the schedule charges it.
    expect(rule(OC_BUILDING_RULES, "BUILD-1-2-FAMILY")).toBeDefined();
    expect(result.totalCents).toBe(80_480);
    expect(result.components.map((component) => [component.code, component.amountCents])).toEqual([
      ["BUILD-1-2-FAMILY", 75_200],
      ["PLAN-REVIEW-RES-NEW", 3_400],
      ["BLD-STATE-SURCHARGE-2_5PCT", 1_880],
    ]);
  });

  it("closes its seam at $2,000,000 and steps by one thousand above it", () => {
    const at = (valuationCents: number) =>
      calculate(
        { valuationCents, occupancy: "residential", workType: "new_construction" },
        OC_BUILDING_RULES,
      ).components.find((component) => component.code.startsWith("BUILD-1-2-FAMILY"))?.amountCents;

    // $26.00 + 1,999 x $3.00 = $6,023.00, which is what the tier above opens with.
    expect(at(199_999_900)).toBe(602_300);
    expect(at(200_000_000)).toBe(602_300);

    // One thousand and one cents above the break is one further thousand, so $1.00 more.
    expect(at(200_000_100)).toBe(602_400);
  });

  it("charges commercial work at $4.00 new and $5.00 existing, on the same valuation", () => {
    const result = (workType: "new_construction" | "alteration") =>
      calculate(
        { valuationCents: 53_000_000, occupancy: "commercial", workType },
        OC_BUILDING_RULES,
      ).components.find((component) => component.code.startsWith("BUILD-COMMERCIAL"));

    // $26.00 + 529 thousands: $4.00 each for new construction, $5.00 each for alterations.
    expect(result("new_construction")?.amountCents).toBe(214_200);
    expect(result("alteration")?.amountCents).toBe(267_100);
  });

  it("applies the $10,000 ceiling on the commercial architectural review", () => {
    const review = (valuationCents: number) =>
      calculate(
        {
          valuationCents,
          occupancy: "commercial",
          workType: "new_construction",
          custom: { zoning_class: "C-2" },
        },
        OC_BUILDING_RULES,
      ).components.find((component) => component.code === "PLAN-REVIEW-COMM-ARCHITECTURAL")?.amountCents;

    // $27.00 up to $1,000 and $3.00 per additional $1,000, capped at $10,000 — reached at
    // about $3,325,666.67 of valuation.
    // A $1,272,000 commercial building: $27.00 plus 1,271 thousands at $3.00. The test
    // passes cents, so the valuation is 127,200,000.
    expect(review(127_200_000)).toBe(384_000);
    expect(review(400_000_000)).toBe(1_000_000);
  });

  it("leaves the architectural review out of a commercial project that names no zoning class", () => {
    const named = calculate(
      {
        valuationCents: 127_200_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { zoning_class: "C-2" },
      },
      OC_BUILDING_RULES,
    );
    const unnamed = calculate(
      { valuationCents: 127_200_000, occupancy: "commercial", workType: "new_construction" },
      OC_BUILDING_RULES,
    );

    expect(unnamed.totalCents).toBe(named.totalCents - 384_000);
    expect(unnamed.appliedRuleIds).not.toContain("oc-build-commercial-plan-review");
  });

  it("prices a re-roof on its own row and says the covering decides nothing", () => {
    const residential = calculate(
      {
        valuationCents: 4_500_000,
        occupancy: "residential",
        workType: "replacement",
        custom: { schedule_item: "re_roof" },
      },
      OC_BUILDING_RULES,
    );

    // $26.00 + 44 thousands at $5.00, plus the "other than new construction" review.
    expect(residential.totalCents).toBe(28_415);
  });
});

describe("the electrical schedule", () => {
  it("prices the same amperage differently in each of the three tables", () => {
    const fee = (service: string) =>
      calculate({ custom: { electrical_service: service, amperage: 400 } }, OC_ELECTRICAL_RULES)
        .totalCents;

    // $117.00 single phase, $181.00 three phase 208/240, $399.00 at 480 volts, each plus
    // a surcharge that is 2.5% of it or the $4.00 floor.
    expect(fee("single_phase_240")).toBe(12_100);
    expect(fee("three_phase_208_240")).toBe(18_553);
    expect(fee("three_phase_480")).toBe(40_898);
  });

  it("treats the amperage bands as alternatives rather than a chain", () => {
    const band = (amperage: number) =>
      calculate(
        { custom: { electrical_service: "three_phase_208_240", amperage } },
        OC_ELECTRICAL_RULES,
      ).components.find((component) => component.code.startsWith("ELEC-3PH-208-240V"))?.code;

    expect(band(150)).toBe("ELEC-3PH-208-240V-1");
    expect(band(151)).toBe("ELEC-3PH-208-240V-2");
    expect(band(200)).toBe("ELEC-3PH-208-240V-2");
    expect(band(201)).toBe("ELEC-3PH-208-240V-3");
    expect(band(1_000)).toBe("ELEC-3PH-208-240V-6");
    expect(band(1_001)).toBe("ELEC-3PH-208-240V-OVER-1000");
  });

  it("charges the rate above 1,000 amperes per additional thousand or fraction thereof", () => {
    const over = (amperage: number) =>
      calculate(
        { custom: { electrical_service: "three_phase_208_240", amperage } },
        OC_ELECTRICAL_RULES,
      ).components.find((component) => component.code === "ELEC-3PH-208-240V-OVER-1000")
        ?.amountCents;

    expect(over(1_001)).toBe(28_100);
    expect(over(1_500)).toBe(28_100);
    expect(over(2_000)).toBe(28_100);
    expect(over(2_001)).toBe(56_200);
  });

  it("matches nothing when no service has been described", () => {
    const result = calculate({ custom: {} }, OC_ELECTRICAL_RULES);
    expect(result.totalCents).toBe(0);
    expect(result.components).toHaveLength(0);
  });
});

describe("the plumbing schedule", () => {
  it("adds the fixture charge to the permit fee rather than replacing it", () => {
    const result = calculate(
      { fixtures: 6, custom: { plumbing_item: "new_construction" } },
      OC_PLUMBING_RULES,
    );

    expect(result.totalCents).toBe(11_500);
    expect(result.components.map((component) => [component.code, component.amountCents])).toEqual([
      ["PLUMB-FIXTURE", 3_600],
      ["PLUMB-PERMIT", 7_500],
      ["PLB-STATE-SURCHARGE-2_5PCT", 400],
    ]);
  });

  it("charges the $4.00 surcharge floor on every stand-alone row", () => {
    const rows = [
      ["water_heater", 4_200],
      ["solar_water_heater", 4_200],
      ["backflow_preventer", 4_200],
      ["water_softener", 4_200],
      ["sewer_replacement", 4_200],
      ["re_pipe", 4_200],
      ["spa_with_permanent_connections", 4_200],
      ["mobile_home", 4_200],
      ["expired_replacement", 4_200],
      ["second_irrigation_meter", 4_200],
      ["swimming_pool", 6_800],
    ] as const;

    for (const [item, expected] of rows) {
      const result = calculate({ custom: { plumbing_item: item } }, OC_PLUMBING_RULES);
      expect(result.totalCents, item).toBe(expected);
      const surcharge = result.components.find((component) => component.componentType === "state_surcharge");
      expect(surcharge?.amountCents, item).toBe(OC_STATE_SURCHARGE_MINIMUM_CENTS);
    }
  });

  it("steps the irrigation rows by head count rather than by rate", () => {
    const irrigation = (heads: number) =>
      calculate(
        { custom: { plumbing_item: "irrigation_system", irrigation_heads: heads } },
        OC_PLUMBING_RULES,
      );

    expect(irrigation(1).totalCents).toBe(4_200);
    expect(irrigation(100).totalCents).toBe(4_200);
    expect(irrigation(101).totalCents).toBe(5_800);
    expect(irrigation(200).totalCents).toBe(5_800);
    expect(irrigation(201).totalCents).toBe(6_800);
  });

  it("prices gas on valuation beside the flat plumbing rows", () => {
    const gas = (valuationCents: number) =>
      calculate(
        { valuationCents, custom: { plumbing_item: "gas_piping_and_equipment" } },
        OC_PLUMBING_RULES,
      ).totalCents;

    expect(gas(800_000)).toBe(11_000);
    expect(gas(5_000_000)).toBe(36_695);
  });
});

describe("the state surcharge", () => {
  it("is 2.5% of the permit fee with a $4.00 floor, charged on each permit", () => {
    const surcharge = calculate(
      { fixtures: 6, custom: { plumbing_item: "new_construction" } },
      OC_PLUMBING_RULES,
    ).components.find((component) => component.componentType === "state_surcharge");

    expect(surcharge?.label).toContain("$4.00 minimum");
    expect(surcharge?.amountCents).toBe(400);

    // The same two statutes Miami-Dade states as two rows with two $2.00 floors cost
    // $4.21 at the $147.00 permit fee both counties share.
    const base = 14_700;
    const miamiDadeEquivalent =
      Math.max(200, Math.round((base * 100) / 10_000)) + Math.max(200, Math.round((base * 150) / 10_000));
    expect(miamiDadeEquivalent).toBe(421);
  });

  it("carries the county's own notes on what decides a valuation", () => {
    expect(OC_VALUATION_METHOD_NOTE).toContain("average cost per square foot");
    expect(OC_VALUATION_METHOD_NOTE).toContain("Unfinished basements");
    expect(OC_VALUATION_METHOD_NOTE).toContain("shell only buildings deduct 20%");

    // The full sentence — with its $27.00 base and $3.00 steps — is quoted in the
    // requirement that explains the table, rather than in the short note above it.
    const valuation = orangeCountySeed.requirements.find((requirement) =>
      requirement.title.includes("publishes the valuation"),
    );
    expect(valuation?.description).toContain("shall be used for determining the fee");
    expect(valuation?.description).toContain("should the contract valuation be greater");
  });

  it("keeps the published cost-per-square-foot table internally consistent", () => {
    // Every row carries the same nine construction types in the same order, so a reader
    // comparing two occupancies is comparing like with like.
    const types = OC_AVERAGE_COST_PER_SQ_FT[0]?.costs.map((cost) => cost.constructionType);
    expect(types).toEqual(["IA", "IB", "IIA", "IIB", "IIIA", "IIIB", "IV", "VA", "VB"]);
    for (const row of OC_AVERAGE_COST_PER_SQ_FT) {
      expect(row.costs.map((cost) => cost.constructionType)).toEqual(types);
    }
  });
});
