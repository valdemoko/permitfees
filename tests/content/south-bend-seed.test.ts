import { describe, expect, it } from "vitest";

import { southBendSeed } from "@/content/southbend";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * South Bend, Indiana — the schedule whose new-construction fee is a percentage of the
 * valuation, whose alteration section is a 100-row ladder with a step **up** at $100,000, and
 * whose electrical and plumbing sections are price lists stacked on one permit under a $60.00
 * floor.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The ladder is one arithmetic.** $60.00 at $1 to $3,000 plus $5.00 per $1,000 band
 *     reproduces all one hundred printed rows, asserted at $3,000, $4,000, $5,000, $10,000,
 *     $10,001 and $100,000, and the three printed bases above it ($550.00, $0.90 and $0.60 per
 *     $1,000) are asserted at their seams.
 *  2. **New construction is a valuation rate, not an area rate.** `CSF × TSF × .00098` is
 *     0.00098 of the construction valuation, with the sheet's own $60.00 floor.
 *  3. **Electrical is a price list with a floor.** Seven panel classes, circuits, horsepower
 *     with its first-unit allowance, generator bands, and a $60.00 `permit_minimum` that
 *     charges the shortfall rather than replacing the arithmetic.
 *  4. **Plumbing is the longest list, and one row is a block rate.** Fixtures, devices,
 *     connections, appliances and heads, with the fire-protection row charged as $0.80 a head
 *     inside a ten-head increment.
 *  5. **The two length rows price independently.** A building sewer and a building water
 *     service each switch at 100 feet, and each defaults to the under-100-foot row when the
 *     length is not entered.
 */

const asOf = "2026-09-26";

function rulesFor(permitTypeKey: string) {
  return southBendSeed.feeRules
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

describe("South Bend seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(southBendSeed.state).toMatchObject({
      code: "IN",
      slug: "indiana",
      fipsCode: "18",
    });
    expect(southBendSeed.county).toMatchObject({
      key: "st-joseph-county",
      name: "St. Joseph County",
      fipsCode: "18141",
    });
    expect(southBendSeed.jurisdiction).toMatchObject({
      key: "south-bend",
      slug: "south-bend",
      officialName: "City of South Bend",
      countyKey: "st-joseph-county",
      timezone: "America/Indiana/Indianapolis",
      isActive: true,
    });
  });

  it("shares the Indiana state row and the permit catalogue", () => {
    expect(southBendSeed.state.code).toBe("IN");
    expect(southBendSeed.permitTypes).toEqual([]);
    expect(southBendSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(southBendSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(southBendSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of southBendSeed.feeRules) {
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

  it("publishes three pages that clear the editorial gate", () => {
    const published = southBendSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(southBendSeed.permitPages).toHaveLength(3);
    expect(published.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
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
        sourceCount: southBendSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("verifies every source, the schedule, the three pages and the profile on the research date", () => {
    const sourceVerifications = southBendSeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      southBendSeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of southBendSeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-26");
      expect(verification.verifiedBy, verification.entityKey).toContain("Indiana");
    }
  });

  it("dates every rule to the schedule's own 2026 edition", () => {
    for (const entry of southBendSeed.feeRules) {
      expect(entry.rule.effectiveFrom, entry.rule.code).toBe("2026-01-01");
    }
  });
});

describe("South Bend building permits", () => {
  it("reproduces the printed alteration ladder with the sheet's own rows", () => {
    const scope = { building_scope: "alteration" };
    // The ladder's own printed rows: $60, $65, $70, $95 and $100.
    expect(componentFor("building", "BLD-ALT-1", { valuationCents: 300_000, custom: scope })).toBe(
      6_000,
    );
    expect(componentFor("building", "BLD-ALT-1", { valuationCents: 400_000, custom: scope })).toBe(
      6_500,
    );
    expect(componentFor("building", "BLD-ALT-1", { valuationCents: 500_000, custom: scope })).toBe(
      7_000,
    );
    expect(componentFor("building", "BLD-ALT-1", { valuationCents: 1_000_000, custom: scope })).toBe(
      9_500,
    );
    expect(
      componentFor("building", "BLD-ALT-1", { valuationCents: 1_000_100, custom: scope }),
    ).toBe(10_000);
    // The ladder's top printed row: "99,001.00 to 100,000.00 ... 545.00".
    expect(
      componentFor("building", "BLD-ALT-1", { valuationCents: 10_000_000, custom: scope }),
    ).toBe(54_500);
    // A band is bought whole: $100,001 crosses into the printed base above it.
    expect(
      componentFor("building", "BLD-ALT-2", { valuationCents: 10_000_100, custom: scope }),
    ).toBe(55_090);
    expect(codesFor("building", { valuationCents: 10_000_100, custom: scope }, "BLD-ALT")).toEqual([
      "BLD-ALT-2",
    ]);
  });

  it("charges the printed bases above $100,000, including the step up at the seam", () => {
    const scope = { building_scope: "alteration" };
    // $550 at the seam against the $545 the closed ladder reaches at $100,000.
    expect(
      componentFor("building", "BLD-ALT-1", { valuationCents: 10_000_000, custom: scope }),
    ).toBe(54_500);
    expect(
      componentFor("building", "BLD-ALT-2", { valuationCents: 10_000_100, custom: scope }),
    ).toBe(55_090);
    // $550.00 + $0.90 per $1,000 to $1,000,000.
    expect(
      componentFor("building", "BLD-ALT-2", { valuationCents: 50_000_000, custom: scope }),
    ).toBe(91_000);
    expect(
      componentFor("building", "BLD-ALT-2", { valuationCents: 100_000_000, custom: scope }),
    ).toBe(136_000);
    // $1,360.00 + $0.60 per $1,000 above $1,000,000.
    expect(
      componentFor("building", "BLD-ALT-3", { valuationCents: 100_000_100, custom: scope }),
    ).toBe(136_060);
    expect(componentFor("building", "BLD-ALT-3", { valuationCents: 100_000_000, custom: scope }))
      .toBeUndefined();
    expect(codesFor("building", { valuationCents: 200_000_000, custom: scope }, "BLD-ALT")).toEqual([
      "BLD-ALT-3",
    ]);
  });

  it("prices new construction as .00098 of the valuation under the $60 minimum", () => {
    const scope = { building_scope: "new_construction" };
    // $200,000 of construction valuation is $196.00.
    expect(componentFor("building", "BLD-NEW", { valuationCents: 20_000_000, custom: scope })).toBe(
      19_600,
    );
    // $500,000 is $490.00, and the rate rounds once, in cents.
    expect(componentFor("building", "BLD-NEW", { valuationCents: 50_000_000, custom: scope })).toBe(
      49_000,
    );
    // The sheet's own "Minimum Fee - $60.00" catches a small building.
    expect(componentFor("building", "BLD-NEW", { valuationCents: 5_000_000, custom: scope })).toBe(
      6_000,
    );
    // The two mechanisms are selected by scope and never stack.
    expect(codesFor("building", { valuationCents: 5_000_000, custom: scope }, "BLD-")).toEqual([
      "BLD-NEW",
    ]);
    expect(totalFor("building", { valuationCents: 5_000_000 })).toBe(0);
  });

  it("charges the overlay design review only when the plan is in the district", () => {
    const base = { building_scope: "alteration" as const };
    expect(
      componentFor("building", "BLD-OVERLAY-REVIEW", {
        valuationCents: 30_000_000,
        custom: { ...base, northeast_overlay: true },
      }),
    ).toBe(16_000);
    expect(
      componentFor("building", "BLD-OVERLAY-REVIEW", { valuationCents: 30_000_000, custom: base }),
    ).toBeUndefined();
    // It stacks rather than substitutes: the ladder still charges. $300,000 of alteration
    // work is $730.00 on the ladder's second band ($550.00 + 200 × $0.90), plus the review.
    expect(
      componentFor("building", "BLD-ALT-2", { valuationCents: 30_000_000, custom: base }),
    ).toBe(73_000);
    expect(
      totalFor("building", {
        valuationCents: 30_000_000,
        custom: { ...base, northeast_overlay: true },
      }),
    ).toBe(73_000 + 16_000);
  });
});

describe("South Bend electrical permits", () => {
  it("prices panel boards by the board's amperage, one class at a time", () => {
    expect(
      componentFor("electrical", "ELEC-PANEL-200", {
        custom: { panel_board_amperage: 200, panels: 1 },
      }),
    ).toBe(1_200);
    expect(
      componentFor("electrical", "ELEC-PANEL-OVER-600", {
        custom: { panel_board_amperage: 1_200, panels: 1 },
      }),
    ).toBe(2_500);
    expect(
      componentFor("electrical", "ELEC-PANEL-OVER-2000", {
        custom: { panel_board_amperage: 3_000, panels: 2 },
      }),
    ).toBe(10_000);
    // Exactly one class answers, and none answers without an amperage.
    expect(
      codesFor("electrical", { custom: { panel_board_amperage: 100, panels: 1 } }, "ELEC-PANEL"),
    ).toEqual(["ELEC-PANEL-100"]);
    expect(codesFor("electrical", { custom: { panels: 1 } }, "ELEC-PANEL")).toEqual([]);
  });

  it("charges the $60 floor as the shortfall rather than replacing the arithmetic", () => {
    // A 200-amp board and four circuits is $32.00 computed and $60.00 charged.
    expect(
      totalFor("electrical", {
        custom: { panel_board_amperage: 200, panels: 1, circuits: 4 },
      }),
    ).toBe(6_000);
    expect(
      componentFor("electrical", "ELEC-MINIMUM", {
        custom: { panel_board_amperage: 200, panels: 1, circuits: 4 },
      }),
    ).toBe(2_800);
    // The page's own first row is below the floor on its own.
    expect(totalFor("electrical", { custom: { temporary_services: 1 } })).toBe(6_000);
    // Twenty circuits clears it and pays as computed.
    expect(
      totalFor("electrical", {
        custom: { panel_board_amperage: 200, panels: 1, circuits: 20 },
      }),
    ).toBe(11_200);
    expect(
      componentFor("electrical", "ELEC-MINIMUM", {
        custom: { panel_board_amperage: 200, panels: 1, circuits: 20 },
      }),
    ).toBe(0);
  });

  it("prices machinery by horsepower with the first horsepower inside the $7.00", () => {
    expect(componentFor("electrical", "ELEC-HORSEPOWER", { custom: { horsepower: 1 } })).toBe(700);
    expect(componentFor("electrical", "ELEC-HORSEPOWER", { custom: { horsepower: 2 } })).toBe(725);
    expect(componentFor("electrical", "ELEC-HORSEPOWER", { custom: { horsepower: 20 } })).toBe(
      1_175,
    );
    // Four 5 hp motors are priced as twenty horsepower, not as four machines.
    expect(componentFor("electrical", "ELEC-HORSEPOWER", { custom: { horsepower: 20 } })).toBe(
      componentFor("electrical", "ELEC-HORSEPOWER", { custom: { horsepower: 20 } }),
    );
  });

  it("prices the generator, the solar array, the EVSE and the trips on their own rows", () => {
    expect(
      componentFor("electrical", "ELEC-GENERATOR-10", { custom: { generator_kilowatts: 8 } }),
    ).toBe(6_000);
    expect(
      componentFor("electrical", "ELEC-GENERATOR-OVER-10", {
        custom: { generator_kilowatts: 25 },
      }),
    ).toBe(7_000);
    expect(
      codesFor("electrical", { custom: { generator_kilowatts: 8 } }, "ELEC-GENERATOR"),
    ).toEqual(["ELEC-GENERATOR-10"]);
    // The solar row is $60.00; the percentage the sheet defers to is not on this instrument.
    expect(componentFor("electrical", "ELEC-SOLAR-ARRAY", { custom: { solar_array: true } })).toBe(
      6_000,
    );
    expect(componentFor("electrical", "ELEC-EVSE", { custom: { ev_charger: true } })).toBe(6_000);
    // Reinspection and additional final inspection are one $60.00 row on this page.
    expect(
      componentFor("electrical", "ELEC-INSPECTION", {
        custom: { reinspection_requested: true, inspections: 1 },
      }),
    ).toBe(6_000);
    expect(
      componentFor("electrical", "ELEC-INSPECTION", {
        custom: { reinspection_requested: true, inspections: 2 },
      }),
    ).toBe(12_000);
  });
});

describe("South Bend plumbing permits", () => {
  it("charges the $60 floor and the small rows that sit under it", () => {
    // Two fixtures and a water heater compute $19.00 and pay $60.00.
    expect(totalFor("plumbing", { fixtures: 2, custom: { heaters: 1 } })).toBe(6_000);
    expect(componentFor("plumbing", "PLUMB-MINIMUM", { fixtures: 2, custom: { heaters: 1 } })).toBe(
      4_100,
    );
    // A permit with no chargeable row computes nothing, and the floor is a floor on a
    // computed fee: `permit_fee` is only defined once a base component has charged, so an
    // empty application reports no fee rather than an invented $60.00. Every real
    // application carries at least one row, and one row under $60.00 pays the floor.
    expect(totalFor("plumbing", {})).toBe(0);
    expect(componentFor("plumbing", "PLUMB-DRYWELL", { custom: { drywells: 1 } })).toBe(1_200);
    expect(totalFor("plumbing", { custom: { drywells: 1 } })).toBe(6_000);
    // Rows above the floor pay as computed.
    expect(componentFor("plumbing", "PLUMB-FIXTURE", { fixtures: 20 })).toBe(12_000);
    expect(componentFor("plumbing", "PLUMB-GAS-OUTLET", { custom: { outlets: 60 } })).toBe(18_000);
    expect(
      totalFor("plumbing", {
        fixtures: 20,
        custom: { backflow_devices: 8, heaters: 4, outlets: 60 },
      }),
    ).toBe(12_000 + 4_800 + 2_800 + 18_000);
  });

  it("charges the fire protection row as $0.80 a head inside a ten-head block", () => {
    expect(componentFor("plumbing", "PLUMB-FIRE-SPRINKLER", { custom: { sprinkler_heads: 1 } }))
      .toBe(6_000);
    expect(componentFor("plumbing", "PLUMB-FIRE-SPRINKLER", { custom: { sprinkler_heads: 30 } }))
      .toBe(6_000);
    expect(componentFor("plumbing", "PLUMB-FIRE-SPRINKLER", { custom: { sprinkler_heads: 31 } }))
      .toBe(6_800);
    expect(componentFor("plumbing", "PLUMB-FIRE-SPRINKLER", { custom: { sprinkler_heads: 40 } }))
      .toBe(6_800);
    expect(componentFor("plumbing", "PLUMB-FIRE-SPRINKLER", { custom: { sprinkler_heads: 41 } }))
      .toBe(7_600);
    expect(componentFor("plumbing", "PLUMB-FIRE-SPRINKLER", { custom: { sprinkler_heads: 50 } }))
      .toBe(7_600);
  });

  it("switches the building sewer and water service at 100 feet, and defaults when unstated", () => {
    // No length given: the under-100-foot row is charged rather than the row being dropped.
    expect(
      componentFor("plumbing", "PLUMB-BUILDING-SEWER", { custom: { connections: 1 } }),
    ).toBe(1_200);
    expect(
      componentFor("plumbing", "PLUMB-BUILDING-SEWER-OVER-100", { custom: { connections: 1 } }),
    ).toBeUndefined();
    expect(
      componentFor("plumbing", "PLUMB-BUILDING-WATER", { custom: { water_service_connections: 1 } }),
    ).toBe(1_200);
    // Exactly 100 feet is the under-100 row ("Under 100'" against "100' or over").
    expect(
      componentFor("plumbing", "PLUMB-BUILDING-SEWER", {
        custom: { connections: 1, building_sewer_length_feet: 100 },
      }),
    ).toBe(1_200);
    // 101 feet switches to $25.00, and the two rows price independently.
    expect(
      componentFor("plumbing", "PLUMB-BUILDING-SEWER-OVER-100", {
        custom: { connections: 1, building_sewer_length_feet: 101 },
      }),
    ).toBe(2_500);
    expect(
      componentFor("plumbing", "PLUMB-BUILDING-WATER-OVER-100", {
        custom: { water_service_connections: 1, building_water_length_feet: 150 },
      }),
    ).toBe(2_500);
    expect(
      codesFor("plumbing", { custom: { connections: 1, building_sewer_length_feet: 150 } }, "PLUMB-BUILDING-SEWER"),
    ).toEqual(["PLUMB-BUILDING-SEWER-OVER-100"]);
  });

  it("prices the lawn sprinkler row with its backflow devices inside the price", () => {
    expect(
      componentFor("plumbing", "PLUMB-LAWN-SPRINKLER", { custom: { meters: 1 } }),
    ).toBe(600);
    // The row's own wording is "including backflow protection devices thereof" — so one
    // meter is $6.00 and the backflow row is not added on top by the model.
    expect(
      totalFor("plumbing", { custom: { meters: 1 } }),
    ).toBe(6_000);
  });

  it("separates the reinspection from the additional final inspection", () => {
    expect(
      componentFor("plumbing", "PLUMB-REINSPECTION", {
        custom: { reinspection_requested: true, inspections: 1 },
      }),
    ).toBe(6_000);
    expect(
      componentFor("plumbing", "PLUMB-EXTRA-FINAL", {
        custom: { extra_final_inspection: true, final_inspections: 1 },
      }),
    ).toBe(7_500);
    expect(
      totalFor("plumbing", {
        custom: {
          reinspection_requested: true,
          inspections: 1,
          extra_final_inspection: true,
          final_inspections: 1,
        },
      }),
    ).toBe(13_500);
  });
});
