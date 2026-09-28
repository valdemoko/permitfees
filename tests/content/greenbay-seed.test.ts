import { describe, expect, it } from "vitest";

import { greenBaySeed } from "@/content/greenbay";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Green Bay, Wisconsin — the matrix jurisdiction, and two dataset firsts.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The property class is asked, and the residential rate is the catch-all.** The same
 *     2,000 square feet is $20.00 in a house, $280.00 in multi-family, $140.00 in commercial
 *     group 1 — and an application that states no class is priced residentially rather than
 *     charged nothing, which is the default a homeowner filing alone actually needs.
 *  2. **The sprinkler row is the dataset's first per-unit fee with both a floor and a
 *     ceiling.** $2.50 a head, $70.00 minimum, $200.00 maximum — the schedule's own
 *     parenthetical, charged as the rule's own bounds and asserted from both sides.
 *  3. **The commercial electrical ladder replaces the area rates.** Priced from value it
 *     charges alone; priced from area the area rates charge alone; the two never stack.
 *  4. **The exact-area reading holds everywhere.** No area row prints a minimum, a rounding
 *     rule or a band, so 1,500 sq ft at $0.05 is $75.00 and not a stepped table.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return greenBaySeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

function codesFor(
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  prefix: string,
): string[] {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey))
    .components.filter((component) => component.code.startsWith(prefix))
    .map((component) => component.code);
}

function componentFor(
  permitTypeKey: string,
  code: string,
  input: Omit<CalculationInput, "asOf">,
): number | undefined {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).components.find(
    (component) => component.code === code,
  )?.amountCents;
}

describe("Green Bay seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(greenBaySeed.state).toMatchObject({
      code: "WI",
      slug: "wisconsin",
      fipsCode: "55",
    });
    expect(greenBaySeed.county).toMatchObject({
      key: "brown-county",
      fipsCode: "55009",
    });
    expect(greenBaySeed.jurisdiction).toMatchObject({
      key: "green-bay",
      slug: "green-bay",
      officialName: "City of Green Bay",
      countyKey: "brown-county",
      timezone: "America/Chicago",
      isActive: true,
    });
  });

  it("shares the Wisconsin state row and the permit catalogue", () => {
    expect(greenBaySeed.state.code).toBe("WI");
    expect(greenBaySeed.permitTypes).toEqual([]);
    expect(greenBaySeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(greenBaySeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(greenBaySeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of greenBaySeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(
        true,
      );
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), `unknown source ${entry.rule.sourceId}`).toBe(
          true,
        );
      }
      const validation = validateFeeRule(entry.rule);
      expect(validation.ok, `${entry.rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
        true,
      );
    }
  });

  it("dates every rule to the schedule's own 2026-01-01 effective date", () => {
    for (const entry of greenBaySeed.feeRules) {
      expect(entry.rule.effectiveFrom, entry.rule.code).toBe("2026-01-01");
    }
    expect(greenBaySeed.feeSchedules[0]?.effectiveFrom).toBe("2026-01-01");
  });

  it("publishes four pages that clear the editorial gate, mechanical included", () => {
    const published = greenBaySeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(greenBaySeed.permitPages).toHaveLength(4);
    expect(published.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "mechanical-permit-cost",
      "plumbing-permit-cost",
    ]);

    for (const page of published) {
      expect(page.intro.length, `${page.slug} intro`).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length, `${page.slug} localSummary`).toBeGreaterThanOrEqual(
        MIN_LOCAL_SUMMARY_LENGTH,
      );
      expect(page.faqs?.length ?? 0, `${page.slug} faqs`).toBeGreaterThanOrEqual(4);

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: greenBaySeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("declares the mechanical permit and gives its ten transcribed rules a page", () => {
    // §8-478 was transcribed, seeded and cited in the electrical page's own FAQ
    // while the permit type was never linked and no page existed: ten rules the
    // engine could compute priced nothing a reader could reach.
    expect(greenBaySeed.jurisdictionPermitTypes.map((link) => link.permitTypeKey).sort()).toEqual([
      "building",
      "electrical",
      "mechanical",
      "plumbing",
    ]);
    expect(rulesFor("mechanical")).toHaveLength(10);

    const page = greenBaySeed.permitPages.find(
      (candidate) => candidate.permitTypeKey === "mechanical",
    );
    expect(page, "no mechanical permit page").toBeDefined();
    expect(page?.publishStatus).toBe("published");
    expect(page?.noindex).toBe(false);
  });

  it("verifies every source, the schedule, the four pages and the profile on the research date", () => {
    const sourceVerifications = greenBaySeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      greenBaySeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of greenBaySeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-25");
      expect(verification.verifiedBy, verification.entityKey).toContain("Wisconsin");
    }
  });
});

describe("Green Bay building permits", () => {
  it("prices the same area differently by property class, with residential as the catch-all", () => {
    const area = { squareFootage: 2000 };

    // A house: $0.01/sq ft = $20.00. An absent class is priced residentially.
    expect(totalFor("building", area)).toBe(2_000);
    expect(
      totalFor("building", { ...area, custom: { property_class: "one_two_family" } }),
    ).toBe(2_000);
    // Multi-family: $0.14/sq ft = $280.00 — fourteen times the house rate.
    expect(totalFor("building", { ...area, custom: { property_class: "multi_family" } })).toBe(
      28_000,
    );
    // Commercial group 1: $0.07/sq ft = $140.00.
    expect(
      totalFor("building", {
        ...area,
        custom: { property_class: "commercial", building_group: 1 },
      }),
    ).toBe(14_000);
    // Commercial group 2: $0.14/sq ft = $280.00.
    expect(
      totalFor("building", {
        ...area,
        custom: { property_class: "commercial", building_group: 2 },
      }),
    ).toBe(28_000);
    // A commercial application that states no group charges nothing on either row —
    // inventing a default would guess at the Division's determination.
    expect(codesFor("building", { ...area, custom: { property_class: "commercial" } }, "BLD-")).toEqual(
      [],
    );
  });

  it("charges the exact area, with no minimum and no rounding", () => {
    // 1,500 sq ft at $0.05 would be electrical; building at $0.01 is exact too.
    expect(componentFor("building", "BLD-SF-NEW", { squareFootage: 1500 })).toBe(1_500);
    expect(componentFor("building", "BLD-SF-NEW", { squareFootage: 1 })).toBe(1);
  });

  it("prices the flat rows by class and scope", () => {
    expect(
      totalFor("building", { custom: { property_class: "one_two_family", building_item: "raze" } }),
    ).toBe(7_500);
    expect(
      totalFor("building", { custom: { property_class: "multi_family", building_item: "raze" } }),
    ).toBe(10_000);
    expect(
      totalFor("building", { custom: { property_class: "commercial", building_item: "raze" } }),
    ).toBe(10_000);
    // Windows/doors exists only in the residential section.
    expect(
      codesFor(
        "building",
        { custom: { property_class: "multi_family", building_item: "windows_doors" } },
        "BLD-",
      ),
    ).toEqual([]);
  });
});

describe("Green Bay electrical permits", () => {
  it("prices the general system by area and class", () => {
    // 1,500 sq ft at $0.05 = $75.00, residentially and by default.
    expect(componentFor("electrical", "ELEC-SF-SYSTEM", { squareFootage: 1500 })).toBe(7_500);
    // Multi-family: $0.09/sq ft.
    expect(
      componentFor("electrical", "ELEC-MF-SYSTEM", {
        squareFootage: 1500,
        custom: { property_class: "multi_family" },
      }),
    ).toBe(13_500);
  });

  it("prices the commercial ladder from value, and it replaces the area rates", () => {
    const base = {
      squareFootage: 5000,
      custom: { property_class: "commercial", building_group: 1 },
    };

    // By area, group 1: 5,000 × $0.05 = $250.00.
    expect(componentFor("electrical", "ELEC-C-GROUP-1", base)).toBe(25_000);
    // The ladder never charges beside the area rates.
    expect(codesFor("electrical", base, "ELEC-COST")).toEqual([]);
    // $8,000 of value: $100.00 — the ladder's first band.
    expect(
      componentFor("electrical", "ELEC-COST-LADDER", {
        ...base,
        valuationCents: 800_000,
        custom: { ...base.custom, electrical_fee_basis: "project_cost" },
      }),
    ).toBe(10_000);
    // $40,000: the second band, $240.00.
    expect(
      componentFor("electrical", "ELEC-COST-LADDER", {
        ...base,
        valuationCents: 4_000_000,
        custom: { ...base.custom, electrical_fee_basis: "project_cost" },
      }),
    ).toBe(24_000);
    // $600,000: the open top band, $600.00, plus $300.00 of step — $100.00 per
    // $100,000 above $300,000, prorated because the line prints no "or fraction
    // thereof" (the Bismarck reading: no fraction phrase, no round-up).
    expect(
      totalFor("electrical", {
        ...base,
        valuationCents: 60_000_000,
        custom: { ...base.custom, electrical_fee_basis: "project_cost" },
      }),
    ).toBe(90_000);
    // $350,000: the top band plus half a step — $600.00 + $50.00.
    expect(
      totalFor("electrical", {
        ...base,
        valuationCents: 35_000_000,
        custom: { ...base.custom, electrical_fee_basis: "project_cost" },
      }),
    ).toBe(65_000);
    // $340,000: $600.00 + $40.00 — the proration in one number.
    expect(
      componentFor("electrical", "ELEC-COST-LADDER-ADDITIONAL", {
        ...base,
        valuationCents: 34_000_000,
        custom: { ...base.custom, electrical_fee_basis: "project_cost" },
      }),
    ).toBe(4_000);
  });

  it("prices services by class: flat residential, base-plus-additional multi-family", () => {
    expect(componentFor("electrical", "ELEC-SF-SERVICE", {})).toBe(5_000);
    // Multi-family: $100.00 initial + $50.00 each additional; three services are $200.00.
    expect(
      totalFor("electrical", { custom: { property_class: "multi_family", electrical_services: 3 } }),
    ).toBe(20_000);
    expect(
      componentFor("electrical", "ELEC-MF-SERVICE-ADDITIONAL", {
        custom: { property_class: "multi_family", electrical_services: 3 },
      }),
    ).toBe(10_000);
  });

  it("prices air conditioning per unit, not per ton", () => {
    expect(
      componentFor("electrical", "ELEC-AC-ADDITION-RESIDENTIAL", { custom: { ac_units: 2 } }),
    ).toBe(15_000);
    expect(
      componentFor("electrical", "ELEC-AC-ADDITION", {
        custom: { property_class: "multi_family", ac_units: 2 },
      }),
    ).toBe(20_000);
    // A 3-ton and a 5-ton unit are one unit each: the count is of machines.
    expect(
      componentFor("electrical", "ELEC-AC-ADDITION-RESIDENTIAL", { custom: { ac_units: 1 } }),
    ).toBe(7_500);
  });

  it("charges the generator from the City's own application form", () => {
    expect(componentFor("electrical", "ELEC-GENERATOR", { custom: { generator: true } })).toBe(
      15_000,
    );
  });

  it("charges the reinspection as an inspection component", () => {
    expect(
      componentFor("electrical", "ELEC-REINSPECTION", { custom: { re_inspection: true } }),
    ).toBe(7_500);
  });
});

describe("Green Bay plumbing permits", () => {
  it("charges per fixture by class, from the first, with no allowance", () => {
    expect(componentFor("plumbing", "PLUMB-SF-FIXTURES", { fixtures: 5 })).toBe(3_500);
    expect(componentFor("plumbing", "PLUMB-SF-FIXTURES", { fixtures: 8 })).toBe(5_600);
    expect(
      componentFor("plumbing", "PLUMB-MF-FIXTURES", {
        fixtures: 5,
        custom: { property_class: "multi_family" },
      }),
    ).toBe(4_000);
    expect(
      componentFor("plumbing", "PLUMB-C-FIXTURES", {
        fixtures: 5,
        custom: { property_class: "commercial" },
      }),
    ).toBe(4_000);
  });

  it("clamps the sprinkler row between the schedule's own floor and ceiling", () => {
    const heads = (n: number) => ({ custom: { sprinkler_heads: n } });

    // Ten heads: $25.00 of rate charged at the $70.00 floor.
    expect(componentFor("plumbing", "PLUMB-SPRINKLER", heads(10))).toBe(7_000);
    // The floor binds until 28 heads ($70.00 exactly).
    expect(componentFor("plumbing", "PLUMB-SPRINKLER", heads(28))).toBe(7_000);
    // Thirty-two heads: $80.00, inside the bounds.
    expect(componentFor("plumbing", "PLUMB-SPRINKLER", heads(32))).toBe(8_000);
    // Eighty heads: $200.00 of rate charged at the $200.00 ceiling.
    expect(componentFor("plumbing", "PLUMB-SPRINKLER", heads(80))).toBe(20_000);
    // Eighty-one heads would exceed it: still $200.00.
    expect(componentFor("plumbing", "PLUMB-SPRINKLER", heads(81))).toBe(20_000);
  });

  it("prices the water heater by class beside the fixture count", () => {
    expect(
      totalFor("plumbing", { fixtures: 6, custom: { property_class: "one_two_family", water_heater: true } }),
    ).toBe(9_200);
    expect(
      totalFor("plumbing", { fixtures: 6, custom: { property_class: "commercial", water_heater: true } }),
    ).toBe(14_800);
  });
});

describe("Green Bay mechanical permits", () => {
  it("prices the general system by area, with the commercial split by system kind", () => {
    expect(componentFor("mechanical", "HVAC-SF-SYSTEM", { squareFootage: 1500 })).toBe(7_500);
    expect(
      componentFor("mechanical", "HVAC-C-DUCTED", {
        squareFootage: 1500,
        custom: { property_class: "commercial", hvac_system: "ducted" },
      }),
    ).toBe(13_500);
    expect(
      componentFor("mechanical", "HVAC-C-DUCTLESS", {
        squareFootage: 1500,
        custom: { property_class: "commercial", hvac_system: "ductless" },
      }),
    ).toBe(7_500);
  });

  it("prices heating replacements and A/C additions by class", () => {
    expect(
      totalFor("mechanical", { custom: { property_class: "one_two_family", heating_units: 1 } }),
    ).toBe(7_500);
    expect(
      totalFor("mechanical", { custom: { property_class: "commercial", heating_units: 1 } }),
    ).toBe(10_000);
    expect(
      componentFor("mechanical", "HVAC-SF-AC", { custom: { ac_units: 2 } }),
    ).toBe(15_000);
  });
});
