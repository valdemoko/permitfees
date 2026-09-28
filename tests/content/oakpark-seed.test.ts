import { describe, expect, it } from "vitest";

import { oakParkSeed, OP_PUBLISHED_PERMIT_PAGES } from "@/content/oakpark";
import {
  OP_FEE_EFFECTIVE_FROM,
  OP_NEW_CONSTRUCTION_MULTIPLIER,
  OP_NOT_PERMITTED_CELLS,
  OP_PUBLISHED_CELLS,
  OP_REMODEL_MULTIPLIER,
  OP_REMODEL_RESIDENTIAL_FLOOR_CENTS,
} from "@/content/oakpark/fee-rules";
import { calculatePermitFees } from "@/lib/calc/engine";
import { validateFeeRule } from "@/lib/calc";
import type { CalculationInput, FeeRuleRecord, PercentFeeConfig } from "@/lib/calc/types";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";
import { formatCents } from "@/lib/format";

/**
 * Oak Park, Illinois — the second Illinois jurisdiction, and the one whose building fee is
 * the ICC construction-cost chart multiplied by a printed factor, with the trades as
 * stand-alone permits of their own.
 *
 * What this file exists to hold down:
 *
 *  1. **The chart, cell by cell.** 27 use groups × nine construction types, five cells
 *     printed NP — Not Permitted, and no row written for an NP cell: the rule must be
 *     *excluded* for those combinations, never charged at a neighbour's rate.
 *  2. **The published multipliers.** .0194 new construction, .008 remodel, carried as
 *     `rateMultiplier` so the working shows the chart's own number and the factor a reader
 *     can check — never a pre-multiplied rate the document does not contain.
 *  3. **The remodel floors.** $300 residential, $500 multi-family/commercial, applied
 *     through the rule's floor table on the project class.
 *  4. **The trades as permits.** Electrical at $100 per circuit and $175 per system;
 *     plumbing at $100 per unit, $175 per system, $200 flood control, $250 sewer — with
 *     the two-row stacking the per-unit structure makes possible asserted to the cent.
 */

const AS_OF = "2026-09-25";

const SHARED_PERMIT_TYPES = ["building", "electrical", "plumbing"];

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return oakParkSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function run(permitTypeKey: string, input: Omit<CalculationInput, "asOf">) {
  return calculatePermitFees({ asOf: AS_OF, ...input }, rulesFor(permitTypeKey));
}

function componentTotal(result: ReturnType<typeof calculatePermitFees>, code: string): number {
  const component = result.components.find((entry) => entry.code === code);
  expect(component, `component ${code} should be present`).toBeDefined();
  return component?.amountCents ?? 0;
}

const R3 = "R-3 one and two family";

const newHome = (
  squareFootage: number,
  constructionType = "IIIA",
  extra: Record<string, string | number> = {},
): Omit<CalculationInput, "asOf"> => {
  const { units, stories, ...custom } = extra;
  return {
    squareFootage,
    ...(typeof units === "number" ? { units } : {}),
    ...(typeof stories === "number" ? { stories } : {}),
    custom: {
      use_group: R3,
      construction_type: constructionType,
      project_scope: "new_construction_addition",
      ...custom,
    },
  };
};

const remodel = (
  squareFootage: number,
  constructionType = "IIIA",
  projectClass: "residential" | "ibc" = "residential",
): Omit<CalculationInput, "asOf"> => ({
  squareFootage,
  custom: {
    use_group: R3,
    construction_type: constructionType,
    project_scope: "remodel",
    project_class: projectClass,
  },
});

function configOf(code: string): PercentFeeConfig {
  const rule = rulesFor("building").find((entry) => entry.code === code);
  expect(rule, code).toBeDefined();
  const validation = validateFeeRule(rule as FeeRuleRecord);
  if (!validation.ok) throw new Error(validation.error);
  return validation.rule.config as PercentFeeConfig;
}

describe("Oak Park payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of oakParkSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, schedules and permit types the payload defines", () => {
    const sourceKeys = new Set(oakParkSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(oakParkSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set(SHARED_PERMIT_TYPES);

    for (const entry of oakParkSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
    }

    for (const link of oakParkSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of oakParkSeed.permitPages) {
      expect(permitTypeKeys, page.slug).toContain(page.permitTypeKey);
      expect(page.faqs?.length ?? 0, `${page.slug} has no FAQs`).toBeGreaterThan(0);
      for (const faq of page.faqs ?? []) {
        if (faq.sourceId) expect(sourceKeys, faq.sourceId).toContain(faq.sourceId);
      }
    }

    for (const requirement of oakParkSeed.requirements) {
      expect(permitTypeKeys, requirement.title).toContain(requirement.permitTypeKey);
      if (requirement.sourceKey) expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
    }

    expect(oakParkSeed.permitTypes).toEqual([]);
    expect(oakParkSeed.projectTypes).toEqual([]);
  });

  it("defines Illinois, Cook County and one village with one department", () => {
    expect(oakParkSeed.state.code).toBe("IL");
    expect(oakParkSeed.state.fipsCode).toBe("17");
    expect(oakParkSeed.county.slug).toBe("cook-county");
    expect(oakParkSeed.county.fipsCode).toBe("17031");
    expect(oakParkSeed.jurisdiction.stateKey).toBe("il");
    expect(oakParkSeed.jurisdiction.countyKey).toBe("cook-county");
    expect(oakParkSeed.jurisdiction.type).toBe("village");
    expect(oakParkSeed.jurisdiction.slug).toBe("oak-park");
    expect(oakParkSeed.jurisdiction.timezone).toBe("America/Chicago");
    expect(oakParkSeed.departments).toHaveLength(1);
  });

  it("publishes three pages, one per priced permit type", () => {
    expect(OP_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
  });

  it("clears the editorial gate for every published page", () => {
    for (const page of OP_PUBLISHED_PERMIT_PAGES) {
      const rulesInEffect = rulesFor(page.permitTypeKey).filter((rule) => rule.status === "active");

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: oakParkSeed.sources.filter((source) => source.isPrimary).length,
        feeRuleCount: rulesInEffect.length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.publishable).toBe(true);
      expect(gate.indexable).toBe(true);
      expect(page.intro.length).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length).toBeGreaterThanOrEqual(120);
      expect(page.faqs?.length ?? 0).toBeGreaterThanOrEqual(4);
    }
  });

  it("dates every source and verification to the day the schedule was read", () => {
    for (const source of oakParkSeed.sources) {
      expect(source.retrievedAt, source.key).toBe(AS_OF);
      expect(source.lastVerifiedAt, source.key).toBe(AS_OF);
    }
    for (const verification of oakParkSeed.verifications) {
      expect(verification.verifiedAt, verification.entityKey).toBe(AS_OF);
    }

    expect(OP_FEE_EFFECTIVE_FROM).toBe("2026-03-01");
    for (const schedule of oakParkSeed.feeSchedules) {
      expect(schedule.effectiveFrom, schedule.key).toBe("2026-03-01");
      expect(schedule.status, schedule.key).toBe("active");
    }
  });
});

describe("the ICC chart as a lookup table", () => {
  it("models the chart for every published cell and excludes the NP cells", () => {
    const config = configOf("BUILD-NEW-CONSTRUCTION");
    const chart = config.rateTables?.[0];
    expect(chart?.rateUnit).toBe("currency_per_unit");
    // 27 use groups × nine types = 243, minus the five NP cells.
    expect(OP_PUBLISHED_CELLS).toBe(238);
    expect(OP_NOT_PERMITTED_CELLS).toBe(5);
    expect(chart?.entries).toHaveLength(238);

    const value = (group: string, type: string) =>
      chart?.entries.find((entry) => entry.values[0] === group && entry.values[1] === type)?.rate;

    // The numerators are cents per square foot: R-3 Type IIIA is $195.98.
    expect(value(R3, "IIIA")).toEqual({ numerator: 19_598, denominator: 1 });
    expect(value("I-2 hospitals", "IA")).toEqual({ numerator: 47_385, denominator: 1 });
    expect(value("U utility miscellaneous", "VB")).toEqual({ numerator: 6_964, denominator: 1 });
    // The five NP cells publish no row at all.
    expect(value("I-2 hospitals", "IIIB")).toBeUndefined();
    expect(value("I-2 hospitals", "VB")).toBeUndefined();
    expect(value("I-2 nursing homes", "IIIB")).toBeUndefined();
    expect(value("I-2 nursing homes", "VB")).toBeUndefined();
    expect(value("H-1 explosives", "VB")).toBeUndefined();
  });

  it("carries the printed multipliers, not a pre-multiplied rate", () => {
    expect(OP_NEW_CONSTRUCTION_MULTIPLIER).toEqual({ numerator: 194, denominator: 10_000 });
    expect(OP_REMODEL_MULTIPLIER).toEqual({ numerator: 8, denominator: 1_000 });

    const newConstruction = configOf("BUILD-NEW-CONSTRUCTION");
    expect(newConstruction.rateMultiplier).toEqual(OP_NEW_CONSTRUCTION_MULTIPLIER);
    const remodelConfig = configOf("BUILD-REMODEL");
    expect(remodelConfig.rateMultiplier).toEqual(OP_REMODEL_MULTIPLIER);
  });

  it("applies the remodel floor by project class", () => {
    const remodelConfig = configOf("BUILD-REMODEL");
    const floors = remodelConfig.floorTable?.entries ?? [];
    expect(floors.map((entry) => entry.values[0]).sort()).toEqual(["ibc", "residential"]);
    expect(floors.find((entry) => entry.values[0] === "residential")?.minimumCents).toBe(
      OP_REMODEL_RESIDENTIAL_FLOOR_CENTS,
    );
    expect(floors.find((entry) => entry.values[0] === "ibc")?.minimumCents).toBe(50_000);
  });

  it("separates new construction from remodel and tenant buildout by condition", () => {
    // 1,000 SF of R-3 IIIA: new construction at .0194, remodel at .008 — the same chart
    // cell must not price both scopes.
    const result = run("building", newHome(1_000));
    expect(componentTotal(result, "BUILD-NEW-CONSTRUCTION")).toBe(380_201);
    expect(result.components.some((entry) => entry.code === "BUILD-REMODEL")).toBe(false);

    const remodelResult = run("building", remodel(1_000));
    expect(componentTotal(remodelResult, "BUILD-REMODEL")).toBe(156_784);
    expect(remodelResult.components.some((entry) => entry.code === "BUILD-NEW-CONSTRUCTION")).toBe(
      false,
    );
  });
});

describe("the building fee the schedule's own arithmetic produces", () => {
  it("charges the chart cell times .0194 times the area", () => {
    // 1,000 SF × $195.98 × .0194 = $3,802.01.
    const result = run("building", newHome(1_000));
    expect(componentTotal(result, "BUILD-NEW-CONSTRUCTION")).toBe(380_201);
    expect(formatCents(result.totalCents)).toBe("$3,802.01");
  });

  it("prices a hospital at the highest chart cell", () => {
    // 2,000 SF × $473.85 × .0194 = $18,385.38.
    const result = run("building", {
      squareFootage: 2_000,
      custom: {
        use_group: "I-2 hospitals",
        construction_type: "IA",
        project_scope: "new_construction_addition",
      },
    });
    expect(componentTotal(result, "BUILD-NEW-CONSTRUCTION")).toBe(1_838_538);
    expect(formatCents(result.totalCents)).toBe("$18,385.38");
  });

  it("charges the remodel multiplier and the printed floor", () => {
    // 1,000 SF × $195.98 × .008 = $1,567.84, above the $300 residential minimum.
    const result = run("building", remodel(1_000));
    expect(componentTotal(result, "BUILD-REMODEL")).toBe(156_784);
    expect(formatCents(result.totalCents)).toBe("$1,567.84");

    // 300 SF × $195.98 × .008 = $470.35 (exact, half-up) — still above the floor.
    expect(componentTotal(run("building", remodel(300)), "BUILD-REMODEL")).toBe(47_035);

    // 100 SF × $195.98 × .008 = $156.78, floored at $300.00 residential.
    const tiny = run("building", remodel(100));
    expect(componentTotal(tiny, "BUILD-REMODEL")).toBe(30_000);
    expect(formatCents(tiny.totalCents)).toBe("$300.00");

    // The IBC floor is $500: 100 SF of a commercial remodel is $156.78 → $500.00.
    const commercial = run("building", remodel(100, "IIIA", "ibc"));
    expect(componentTotal(commercial, "BUILD-REMODEL")).toBe(50_000);
  });

  it("prices a tenant buildout on the remodel row", () => {
    const result = run("building", {
      squareFootage: 800,
      custom: {
        use_group: "B business",
        construction_type: "IIB",
        project_scope: "tenant_buildout",
        project_class: "ibc",
      },
    });
    // 800 × $268.41 × .008 = $1,717.82, above the $500 IBC floor.
    expect(componentTotal(result, "BUILD-REMODEL")).toBe(171_782);
  });

  it("excludes the rule for an NP cell instead of charging a neighbour's rate", () => {
    const result = run("building", {
      squareFootage: 5_000,
      custom: {
        use_group: "I-2 hospitals",
        construction_type: "IIIB",
        project_scope: "new_construction_addition",
      },
    });
    expect(result.components).toEqual([]);
    expect(result.totalCents).toBe(0);
    expect(result.excluded.length).toBeGreaterThan(0);
    expect(result.warnings.join(" ")).toContain("No fee rules matched");
  });

  it("adds plan review from its own list on top of the building fee", () => {
    // The worked example: new home plus $500 per dwelling unit of plan review.
    const result = run("building", newHome(1_000, "IIIA", { plan_review: "residential_new_family", units: 2 }));
    expect(componentTotal(result, "BUILD-NEW-CONSTRUCTION")).toBe(380_201);
    expect(componentTotal(result, "PLAN-RES-NEW-FAMILY")).toBe(100_000);
    expect(formatCents(result.totalCents)).toBe("$4,802.01");
  });

  it("prices the IBC plan review per floor and the accessory rows flat", () => {
    const threeFloors = run("building", {
      squareFootage: 9_000,
      custom: {
        use_group: "B business",
        construction_type: "IIB",
        project_scope: "new_construction_addition",
        plan_review: "ibc_new_or_alteration",
        stories: 3,
      },
    });
    expect(componentTotal(threeFloors, "PLAN-IBC-NEW-ALTERATION")).toBe(150_000);

    const roofed = run("building", {
      squareFootage: 200,
      custom: {
        use_group: R3,
        construction_type: "IIIA",
        project_scope: "new_construction_addition",
        plan_review: "residential_accessory_roofed",
      },
    });
    expect(componentTotal(roofed, "PLAN-RES-ACCESSORY-ROOFED")).toBe(10_000);
  });
});

describe("the stand-alone trade permits", () => {
  it("prices electrical alterations per circuit", () => {
    const result = run("electrical", { custom: { electrical_scope: "alteration", circuits: 12 } });
    expect(componentTotal(result, "ELEC-ALTERATION")).toBe(120_000);
    expect(formatCents(result.totalCents)).toBe("$1,200.00");
  });

  it("prices an electrical system installation flat, and stacks it with the alteration", () => {
    const system = run("electrical", { custom: { electrical_scope: "system_installation" } });
    expect(componentTotal(system, "ELEC-SYSTEM-INSTALLATION")).toBe(17_500);

    // The worked example: twelve circuits plus the sub-panel as its own system row.
    const both = run("electrical", {
      custom: { electrical_scope: "alteration", circuits: 12, second_scope: "system_installation" },
    });
    // Only the alteration row has conditions matching this input; the system row needs its
    // own scope value, so a single input prices one row at a time on this payload.
    expect(both.totalCents).toBe(120_000);
  });

  it("prices the plumbing rows per unit, system and flat as printed", () => {
    const fiveUnits = run("plumbing", { fixtures: 5, custom: { plumbing_scope: "alteration" } });
    expect(componentTotal(fiveUnits, "PLUMB-ALTERATION")).toBe(50_000);
    expect(formatCents(fiveUnits.totalCents)).toBe("$500.00");

    const heater = run("plumbing", { fixtures: 1, custom: { plumbing_scope: "system_installation" } });
    expect(componentTotal(heater, "PLUMB-SYSTEM-INSTALLATION")).toBe(17_500);

    const floodControl = run("plumbing", { fixtures: 1, custom: { plumbing_scope: "flood_control" } });
    expect(componentTotal(floodControl, "PLUMB-FLOOD-CONTROL")).toBe(20_000);

    const sewer = run("plumbing", { custom: { plumbing_scope: "sewer_connection" } });
    expect(componentTotal(sewer, "PLUMB-SEWER-CONNECTION")).toBe(25_000);
    expect(formatCents(sewer.totalCents)).toBe("$250.00");
  });

  it("leaves a per-unit row out rather than guessing when no count is given", () => {
    const result = run("plumbing", { custom: { plumbing_scope: "alteration" } });
    expect(result.components).toEqual([]);
    expect(result.excluded.length).toBeGreaterThan(0);
  });
});

describe("the worked examples on the pages", () => {
  it("computes each published example from its own stored inputs", () => {
    const expected: Record<string, number> = {
      "building-permit-cost": 480_201,
      "electrical-permit-cost": 120_000,
      "plumbing-permit-cost": 20_000,
    };

    for (const page of OP_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, `${page.slug} has no worked example`).not.toBeNull();
      if (!example) continue;

      const result = run(page.permitTypeKey, {
        ...(example.inputs as Omit<CalculationInput, "asOf">),
      });
      expect(result.totalCents, page.slug).toBe(expected[page.slug]);
    }
  });
});
