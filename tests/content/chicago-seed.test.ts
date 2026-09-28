import { describe, expect, it } from "vitest";

import { chicagoSeed, CHI_PUBLISHED_PERMIT_PAGES } from "@/content/chicago";
import {
  CHI_FEE_EFFECTIVE_FROM,
  CHI_GLOBAL_MINIMUM_CENTS,
  CHI_NEW_CONSTRUCTION_SCOPES,
  CHI_REHABILITATION_SCOPES,
  CHI_TEMPORARY_MINIMUM_CENTS,
} from "@/content/chicago/fee-rules";
import { describeFeeRule, validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord, PercentFeeConfig } from "@/lib/calc/types";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";
import { formatCents } from "@/lib/format";

/**
 * Chicago, Illinois — the first jurisdiction on this site whose fee is the **product of two
 * published lookup tables**, and the first whose building permit involves **no valuation at
 * all**.
 *
 * What this file exists to hold down:
 *
 *  1. **The formula, cell by cell.** `CF × RF × A` needs the construction-factor matrix to
 *     be complete (fourteen classifications × five construction types) and the two
 *     scope-of-review tables to be disjoint — a slug in both would silently charge a
 *     building twice, which no amount of prose on the page would reveal.
 *  2. **The published figures.** The four building amounts the schedule's own arithmetic
 *     produces ($7,800.00, $40,740.00, $2,450.00 at a floor, $602.00 at the city-wide
 *     floor), the flat demolition fees, and the trade examples that only add up if the
 *     stand-alone fees **stack** the way §14A-4-412.1 says.
 *  3. **The floors, read as printed.** Every row's Minimum Fee column and footnote c's
 *     city-wide $602 are both minimums, so the larger applies — including the $302 the
 *     footnote gives a temporary structure instead.
 *  4. **What is deliberately not priced**: exterior wall rehabilitation, whose construction
 *     factor table is printed `[Reserved]`, and phased permitting, whose first row prints no
 *     factor at all. Both are named on the page rather than guessed at.
 */

const AS_OF = "2026-09-25";

const SHARED_PERMIT_TYPES = ["building", "electrical", "plumbing"];

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return chicagoSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function run(permitTypeKey: string, input: Omit<CalculationInput, "asOf">) {
  return calculatePermitFees({ asOf: AS_OF, ...input }, rulesFor(permitTypeKey));
}

function componentTotal(
  result: ReturnType<typeof calculatePermitFees>,
  code: string,
): number {
  const component = result.components.find((entry) => entry.code === code);
  expect(component, `component ${code} should be present`).toBeDefined();
  return component?.amountCents ?? 0;
}

const BUILDING_RULE = "BUILD-CF-RF-NEW";
const REHAB_RULE = "BUILD-CF-RF-REHAB";

/**
 * A project as the schedule's own calculator asks for it: group, type, scope, area.
 *
 * `units` is hoisted out of `extra` because it is a first-class input rather than a
 * `custom.*` fact — the per-unit minimum of the Group R rows reads it — while `stories`
 * belongs in `custom` because that is where the engine looks for it.
 */
const project = (
  occupancy_group: string,
  construction_type: string,
  scope: string,
  squareFootage: number,
  extra: Record<string, string | number | boolean> = {},
): Omit<CalculationInput, "asOf"> => {
  const { units, ...custom } = extra;
  return {
    squareFootage,
    ...(typeof units === "number" ? { units } : {}),
    custom: { occupancy_group, construction_type, scope, ...custom },
  };
};

function configOf(code: string): PercentFeeConfig {
  const rule = rulesFor("building").find((entry) => entry.code === code);
  expect(rule, code).toBeDefined();
  const validation = validateFeeRule(rule as FeeRuleRecord);
  if (!validation.ok) throw new Error(validation.error);
  return validation.rule.config as PercentFeeConfig;
}

describe("Chicago payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of chicagoSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, schedules and permit types the payload defines", () => {
    const sourceKeys = new Set(chicagoSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(chicagoSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set(SHARED_PERMIT_TYPES);

    for (const entry of chicagoSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
    }

    for (const link of chicagoSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of chicagoSeed.permitPages) {
      expect(permitTypeKeys, page.slug).toContain(page.permitTypeKey);
      expect(page.faqs?.length ?? 0, `${page.slug} has no FAQs`).toBeGreaterThan(0);
      for (const faq of page.faqs ?? []) {
        if (faq.sourceId) expect(sourceKeys, faq.sourceId).toContain(faq.sourceId);
      }
    }

    for (const requirement of chicagoSeed.requirements) {
      expect(permitTypeKeys, requirement.title).toContain(requirement.permitTypeKey);
      if (requirement.sourceKey) expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
    }

    for (const verification of chicagoSeed.verifications) {
      if (verification.sourceKey) expect(sourceKeys, verification.sourceKey).toContain(verification.sourceKey);
    }

    expect(chicagoSeed.permitTypes).toEqual([]);
    expect(chicagoSeed.projectTypes).toEqual([]);
  });

  it("defines Illinois, Cook County and one city with one department", () => {
    expect(chicagoSeed.state.code).toBe("IL");
    expect(chicagoSeed.state.fipsCode).toBe("17");
    expect(chicagoSeed.county.slug).toBe("cook-county");
    expect(chicagoSeed.county.fipsCode).toBe("17031");
    expect(chicagoSeed.jurisdiction.stateKey).toBe("il");
    expect(chicagoSeed.jurisdiction.countyKey).toBe("cook-county");
    expect(chicagoSeed.jurisdiction.type).toBe("city");
    expect(chicagoSeed.jurisdiction.timezone).toBe("America/Chicago");
    expect(chicagoSeed.departments).toHaveLength(1);
    expect(chicagoSeed.departments[0]?.email).toBe("dob-info@cityofchicago.org");
  });

  it("publishes three pages, one per priced permit type", () => {
    expect(CHI_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
  });

  it("clears the editorial gate for every published page", () => {
    for (const page of CHI_PUBLISHED_PERMIT_PAGES) {
      const rulesInEffect = rulesFor(page.permitTypeKey).filter((rule) => rule.status === "active");

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: chicagoSeed.sources.filter((source) => source.isPrimary).length,
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

  it("gives every published page a unique title and description", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const page of CHI_PUBLISHED_PERMIT_PAGES) {
      expect(titles.has(page.seoTitle), page.seoTitle).toBe(false);
      expect(descriptions.has(page.seoDescription), page.seoDescription).toBe(false);
      titles.add(page.seoTitle);
      descriptions.add(page.seoDescription);
    }
  });

  it("dates every source and verification to the day the tables were read", () => {
    for (const source of chicagoSeed.sources) {
      expect(source.retrievedAt, source.key).toBe(AS_OF);
      expect(source.lastVerifiedAt, source.key).toBe(AS_OF);
    }
    for (const verification of chicagoSeed.verifications) {
      expect(verification.verifiedAt, verification.entityKey).toBe(AS_OF);
    }

    // The effective date is the one the Department published for the 2026 tables, ten
    // days after the ordinance passed, not the day the ordinance passed.
    expect(CHI_FEE_EFFECTIVE_FROM).toBe("2026-01-06");
    for (const schedule of chicagoSeed.feeSchedules) {
      expect(schedule.effectiveFrom, schedule.key).toBe("2026-01-06");
      expect(schedule.status, schedule.key).toBe("active");
    }
  });
});

describe("the building formula as two lookup tables", () => {
  it("models the construction-factor matrix for every classification and type", () => {
    const config = configOf(BUILDING_RULE);
    const constructionFactor = config.rateTables?.[0];
    expect(constructionFactor?.rateUnit).toBe("currency_per_unit");
    // Fourteen classifications (R-1 to R-5 each their own row) × five construction types.
    expect(constructionFactor?.entries).toHaveLength(70);

    const value = (group: string, type: string) =>
      constructionFactor?.entries.find(
        (entry) => entry.values[0] === group && entry.values[1] === type,
      )?.rate;

    // The numerators are cents per square foot, not dollars: Group A Type I is $0.97.
    expect(value("A", "I")).toEqual({ numerator: 97, denominator: 1 });
    expect(value("U", "V")).toEqual({ numerator: 23, denominator: 1 });
    expect(value("B", "II")).toEqual({ numerator: 78, denominator: 1 });
    // R-1, R-2 and R-3 share one published row; R-4 and R-5 share the other.
    expect(value("R-2", "III")).toEqual(value("R-1", "III"));
    expect(value("R-2", "III")).toEqual(value("R-3", "III"));
    expect(value("R-4", "III")).toEqual(value("R-5", "III"));
    expect(value("R-4", "III")).not.toEqual(value("R-2", "III"));
  });

  it("keeps the two scope-of-review tables disjoint, so no scope is charged twice", () => {
    const overlap = CHI_NEW_CONSTRUCTION_SCOPES.filter((scope) =>
      CHI_REHABILITATION_SCOPES.includes(scope),
    );
    expect(overlap).toEqual([]);
    expect(CHI_NEW_CONSTRUCTION_SCOPES.length).toBeGreaterThan(10);
    expect(CHI_REHABILITATION_SCOPES.length).toBeGreaterThan(30);
  });

  it("expands Table (4)'s all-occupancy block and the shared Group R row", () => {
    const config = configOf(REHAB_RULE);
    const rateTable = config.rateTables?.[1];
    // Nine all-occupancy rows across fourteen classifications, plus the per-group rows,
    // with Group R's single printed row expanded to R-1 through R-5.
    expect(rateTable?.entries).toHaveLength(246);

    const values = (group: string, scope: string) =>
      rateTable?.entries.find(
        (entry) => entry.values[0] === group && entry.values[1] === scope,
      );

    // The all-occupancy row is present for every classification, including each R class.
    for (const group of ["A", "B", "E", "F", "H", "I", "M", "R-1", "R-3", "S", "U"]) {
      expect(values(group, "rehab_level1"), `rehab_level1 for ${group}`).toBeDefined();
    }
    // Group R's own row is present for each of the five residential classifications.
    for (const group of ["R-1", "R-2", "R-3", "R-4", "R-5"]) {
      expect(values(group, "rehab_porch_balcony"), `porch row for ${group}`).toBeDefined();
    }
    expect(values("A", "rehab_porch_balcony")).toBeUndefined();
  });

  it("states a floor row for every rate row, and no more", () => {
    for (const code of [BUILDING_RULE, REHAB_RULE]) {
      const config = configOf(code);
      const rates = config.rateTables?.[1]?.entries ?? [];
      const floors = config.floorTable?.entries ?? [];
      const key = (values: string[]) => values.join("\u0000");

      expect(new Set(rates.map((entry) => key(entry.values))).size, code).toBe(rates.length);
      expect(floors.map((entry) => key(entry.values)).sort(), code).toEqual(
        rates.map((entry) => key(entry.values)).sort(),
      );
      for (const floor of floors) {
        expect(floor.minimumCents ?? 0, `${code} ${floor.values.join("/")}`).toBeGreaterThan(0);
      }
    }
  });

  it("never prints one factor as though it were the whole formula", () => {
    for (const code of [BUILDING_RULE, REHAB_RULE]) {
      const rule = rulesFor("building").find((entry) => entry.code === code);
      const validation = validateFeeRule(rule as FeeRuleRecord);
      if (!validation.ok) throw new Error(validation.error);

      const description = describeFeeRule(validation.rule);
      expect(description).toBe(
        "Construction factor × scope of review factor per sq ft; minimum fee from the schedule's own row",
      );
      expect(description).not.toContain("$0.78");
      expect(description).not.toContain("$0.97");
    }
  });
});

describe("the building fee the schedule's own arithmetic produces", () => {
  it("charges the product of the two factors against the area", () => {
    // Group B, Type II, construction of a multi-story building: 0.78 × 1 × 10,000.
    const result = run("building", project("B", "II", "new_multi_story", 10_000));
    expect(componentTotal(result, BUILDING_RULE)).toBe(780_000);
    expect(result.totalCents).toBe(780_000);
    expect(formatCents(result.totalCents)).toBe("$7,800.00");
  });

  it("charges a large Group A building by the matrix rate", () => {
    // Group A, Type I, all new construction: 0.97 × 1 × 42,000.
    const result = run("building", project("A", "I", "new_all", 42_000));
    expect(componentTotal(result, BUILDING_RULE)).toBe(4_074_000);
    expect(formatCents(result.totalCents)).toBe("$40,740.00");
  });

  it("applies the row's printed minimum when it is the larger", () => {
    // Group R-2, Type III, residential up to four stories and three units:
    // 0.78 × 0.75 × 2,400 = $1,404.00 against the row's $2,450.00 minimum.
    const result = run(
      "building",
      project("R-2", "III", "new_small_residential", 2_400, { units: 3 }),
    );
    expect(componentTotal(result, BUILDING_RULE)).toBe(245_000);
    expect(formatCents(result.totalCents)).toBe("$2,450.00");
  });

  it("applies the city-wide $602 floor where the row prints less", () => {
    // Group B, Type II, Level 1 alteration: 0.78 × 0.25 × 1,500 = $292.50, against the
    // row's printed $600 and footnote c's $602 — the larger of the two is $602.00.
    const result = run("building", project("B", "II", "rehab_level1", 1_500));
    expect(componentTotal(result, REHAB_RULE)).toBe(CHI_GLOBAL_MINIMUM_CENTS);
    expect(formatCents(result.totalCents)).toBe("$602.00");
  });

  it("floors a per-story row at the schedule's per-story minimum", () => {
    // Group B initial tenant buildout: 0.5 factor with an $900-per-story minimum.
    const twoStories = run(
      "building",
      project("B", "II", "new_tenant_buildout", 500, { stories: 2 }),
    );
    expect(componentTotal(twoStories, BUILDING_RULE)).toBe(180_000);

    const oneStory = run(
      "building",
      project("B", "II", "new_tenant_buildout", 500, { stories: 1 }),
    );
    // max($602, 1 × $900) = $900.
    expect(componentTotal(oneStory, BUILDING_RULE)).toBe(90_000);
  });

  it("floors a residential row at the larger of its unit minimum and the floor", () => {
    const fiveUnits = run(
      "building",
      project("R-2", "III", "rehab_porch_balcony", 500, { units: 5 }),
    );
    expect(componentTotal(fiveUnits, REHAB_RULE)).toBe(125_000);

    const twoUnits = run(
      "building",
      project("R-2", "III", "rehab_porch_balcony", 500, { units: 2 }),
    );
    // max($602, 2 × $250) = $602.
    expect(componentTotal(twoUnits, REHAB_RULE)).toBe(CHI_GLOBAL_MINIMUM_CENTS);
  });

  it("prices demolition flat, outside the formula", () => {
    const ordinary = run("building", {
      custom: { occupancy_group: "B", construction_type: "II", scope: "demolition_ordinary" },
    });
    expect(componentTotal(ordinary, "BUILD-DEMOLITION-ORDINARY")).toBe(CHI_GLOBAL_MINIMUM_CENTS);
    expect(formatCents(ordinary.totalCents)).toBe("$602.00");

    const complex = run("building", {
      custom: { occupancy_group: "B", construction_type: "II", scope: "demolition_complex" },
    });
    expect(componentTotal(complex, "BUILD-DEMOLITION-COMPLEX")).toBe(245_000);
    expect(formatCents(complex.totalCents)).toBe("$2,450.00");
  });

  it("gives a temporary structure the $302 floor footnote c prints for it", () => {
    const result = run(
      "building",
      project("U", "V", "new_temporary_structure", 800, { stories: 2 }),
    );
    expect(componentTotal(result, BUILDING_RULE)).toBe(CHI_TEMPORARY_MINIMUM_CENTS);
    expect(formatCents(result.totalCents)).toBe("$302.00");
  });

  it("charges nothing, and says why, for a scope the schedule does not publish", () => {
    const result = run(
      "building",
      project("B", "II", "exterior_wall_tuckpointing", 1_000),
    );
    expect(result.components).toEqual([]);
    expect(result.totalCents).toBe(0);
    expect(result.excluded.length).toBeGreaterThan(0);
    expect(result.warnings.join(" ")).toContain("No fee rules matched");
  });

  it("takes the construction factor from the group the reader gives, not a default", () => {
    // Both Type V and above every row minimum: 0.74 × 100,000 against 0.23 × 100,000.
    const groupU = run("building", project("U", "V", "new_tall_structure", 100_000));
    const groupA = run("building", project("A", "V", "new_all", 100_000));
    expect(componentTotal(groupA, BUILDING_RULE)).toBeGreaterThan(
      componentTotal(groupU, BUILDING_RULE) * 3,
    );
  });
});

describe("the stand-alone trade fees", () => {
  it("stacks each listed scope a permit covers, as §14A-4-412.1 says", () => {
    const service = run("electrical", {
      custom: { service_amperage: 200 },
    });
    expect(componentTotal(service, "ELEC-SERVICE-UNDER-400")).toBe(7_500);

    const circuits = run("electrical", { custom: { new_circuits: 18 } });
    expect(componentTotal(circuits, "ELEC-CIRCUITS-11-20")).toBe(30_000);

    const both = run("electrical", { custom: { service_amperage: 200, new_circuits: 18 } });
    expect(both.totalCents).toBe(37_500);
    expect(formatCents(both.totalCents)).toBe("$375.00");

    const withGenerator = run("electrical", {
      custom: {
        service_amperage: 200,
        new_circuits: 18,
        electrical_item: "residential_generator",
      },
    });
    expect(withGenerator.totalCents).toBe(45_000);
    expect(formatCents(withGenerator.totalCents)).toBe("$450.00");
  });

  it("charges the band the count falls in rather than a rate per unit", () => {
    const ten = run("electrical", { custom: { new_circuits: 10 } });
    const eleven = run("electrical", { custom: { new_circuits: 11 } });
    const eightyOne = run("electrical", { custom: { new_circuits: 81 } });
    expect(componentTotal(ten, "ELEC-CIRCUITS-1-10")).toBe(15_000);
    expect(componentTotal(eleven, "ELEC-CIRCUITS-11-20")).toBe(30_000);
    expect(componentTotal(eightyOne, "ELEC-CIRCUITS-81-PLUS")).toBe(225_000);
  });

  it("bands the service by amperage at the published break points", () => {
    expect(componentTotal(run("electrical", { custom: { service_amperage: 399 } }), "ELEC-SERVICE-UNDER-400")).toBe(7_500);
    expect(componentTotal(run("electrical", { custom: { service_amperage: 400 } }), "ELEC-SERVICE-400-999")).toBe(30_000);
    expect(componentTotal(run("electrical", { custom: { service_amperage: 999 } }), "ELEC-SERVICE-400-999")).toBe(30_000);
    expect(componentTotal(run("electrical", { custom: { service_amperage: 1_000 } }), "ELEC-SERVICE-1000-PLUS")).toBe(75_000);
  });

  it("prices the plumbing rows per dwelling unit, and the pool flat", () => {
    const sixUnits = run("plumbing", {
      units: 6,
      custom: { plumbing_scope: "water_heater_or_fixtures" },
    });
    expect(componentTotal(sixUnits, "PLUMB-HEATER-FIXTURES")).toBe(45_000);
    expect(formatCents(sixUnits.totalCents)).toBe("$450.00");

    const withPool = run("plumbing", {
      units: 6,
      custom: { plumbing_scope: "water_heater_or_fixtures", pool_install: true },
    });
    expect(withPool.totalCents).toBe(85_000);
    expect(formatCents(withPool.totalCents)).toBe("$850.00");

    const piping = run("plumbing", {
      units: 6,
      custom: { plumbing_scope: "piping" },
    });
    expect(formatCents(piping.totalCents)).toBe("$900.00");
  });

  it("leaves a per-unit row out rather than guessing when no unit count is given", () => {
    const result = run("plumbing", { custom: { plumbing_scope: "water_heater_or_fixtures" } });
    expect(result.components).toEqual([]);
    expect(result.totalCents).toBe(0);
    // The row is conditional on a unit count, so it is excluded as not applying rather
    // than evaluated as zero.
    expect(result.excluded.length).toBeGreaterThan(0);
    expect(result.warnings.join(" ")).toContain("No fee rules matched");
  });
});

describe("the worked examples on the pages", () => {
  it("computes each published example from its own stored inputs", () => {
    const expected: Record<string, number> = {
      "building-permit-cost": 780_000,
      "electrical-permit-cost": 37_500,
      "plumbing-permit-cost": 85_000,
    };

    for (const page of CHI_PUBLISHED_PERMIT_PAGES) {
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
