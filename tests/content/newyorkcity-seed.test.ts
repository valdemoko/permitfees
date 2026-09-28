import { describe, expect, it } from "vitest";

import { newYorkCitySeed } from "@/content/newyorkcity";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * New York City, New York — the data, and the arithmetic the City publishes twice.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **DOB's own LAA charts are asserted line for line.** The Department prints rows 11
 *     and 12 of Table 28-112.2 as a price list — $130.00 to $5,000 then $2.60 a step in a
 *     house, $195.00 to $3,000 then $10.30 a step elsewhere — and four printed lines of
 *     each chart are asserted against the model's own output. This is the strongest check
 *     any jurisdiction in this dataset has: the Department and the code agreeing in public.
 *  2. **The row is chosen by two facts, not one.** Building size picks rows 11/12 and
 *     13/14/15, affordability picks 13 out of them, and the Alteration Type picks the base
 *     inside the row — each asserted on the same $100,000 so only the row moves.
 *  3. **The hub's two printed figures are pinned.** The profile states $377.00 for a row
 *     house ALT2 and $2,011.75 for a ten-storey ALT1 at $100,000; prose that states an
 *     amount is prose the tests keep honest.
 *  4. **Electrical is the rule, not the table.** $40 to file, ten free units, a quarter
 *     each after, five service switch bands, $15 minor work — and nothing anywhere from
 *     the fee table's ladder.
 *  5. **No percentage exists anywhere in this jurisdiction.** Every rule the seed carries
 *     is a flat or per-unit component of its own; there is no plan review, technology fee
 *     or surcharge row to find.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return newYorkCitySeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
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

/** Every alteration component charged for these inputs — there must be exactly one. */
function alterationCodes(input: Omit<CalculationInput, "asOf">): string[] {
  return calculatePermitFees({ asOf, ...input }, rulesFor("building"))
    .components.filter((component) => component.code.startsWith("BLD-ALTER-"))
    .map((component) => component.code);
}

describe("New York City seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(newYorkCitySeed.state).toMatchObject({
      code: "NY",
      slug: "new-york",
      fipsCode: "36",
    });
    expect(newYorkCitySeed.county).toMatchObject({
      key: "new-york-county",
      fipsCode: "36061",
    });
    expect(newYorkCitySeed.jurisdiction).toMatchObject({
      key: "new-york-city",
      slug: "new-york-city",
      officialName: "City of New York",
      countyKey: "new-york-county",
      timezone: "America/New_York",
      isActive: true,
    });
  });

  it("shares the New York state row and the permit catalogue", () => {
    expect(newYorkCitySeed.state.code).toBe("NY");
    expect(newYorkCitySeed.permitTypes).toEqual([]);
    expect(newYorkCitySeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(newYorkCitySeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(newYorkCitySeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of newYorkCitySeed.feeRules) {
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

  it("charges only flat, per-unit and per-$1,000 components — the City publishes no percentage", () => {
    // The profile's most unusual claim, asserted against every rule rather than against a
    // sample: no plan review, no technology fee, no state or county surcharge exists in
    // this jurisdiction's model, because none exists in the City's text.
    const componentTypes = new Set(
      newYorkCitySeed.feeRules.map((entry) => entry.rule.componentType),
    );
    expect([...componentTypes].sort()).toEqual(["base", "other"]);

    const feeTypes = new Set(newYorkCitySeed.feeRules.map((entry) => entry.rule.feeType));
    expect([...feeTypes].sort()).toEqual(["flat", "per_thousand", "per_unit", "percent"]);
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = newYorkCitySeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(newYorkCitySeed.permitPages).toHaveLength(3);
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
        sourceCount: newYorkCitySeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("verifies every source, the three pages and the profile on the research date", () => {
    const sourceVerifications = newYorkCitySeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      newYorkCitySeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of newYorkCitySeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-25");
      expect(verification.verifiedBy, verification.entityKey).toContain("New York");
    }
  });
});

describe("New York City building permits", () => {
  it("reproduces DOB's 1, 2, 3 Family LAA chart line for line", () => {
    // The chart's own rows, June 2018 stamp: $130.00 through the first $5,000, then a
    // step of $2.60 for each $1,000 or fraction. Each line below is printed on
    // laa_fee_chart_1-2-3_family.pdf and is asserted against the engine's own output.
    const chart: Array<[number, number]> = [
      [100_000, 13_000], // $0–$1,000       → $130.00
      [500_000, 13_000], // $4,000–$5,000   → $130.00 (still inside the threshold)
      [550_000, 13_260], // $5,001–$6,000   → $132.60
      [750_000, 13_780], // $7,001–$8,000   → $137.80
      [950_000, 14_300], // $9,001–$10,000  → $143.00
    ];

    for (const [valuationCents, expected] of chart) {
      const amount = componentFor("building", "BLD-ALTER-1TO3", {
        valuationCents,
        custom: {
          alteration: true,
          building_category: "one_two_three_family",
          alteration_type: "LAA",
        },
      });
      expect(amount, `valuation ${valuationCents}`).toBe(expected);
    }
  });

  it("reproduces DOB's all-other-buildings LAA chart line for line", () => {
    // laa_fee_chart_other.pdf: $195.00 through the first $3,000, then $10.30 a step.
    const chart: Array<[number, number]> = [
      [100_000, 19_500], // $0–$1,000       → $195.00 (the threshold is $3,000 here)
      [350_000, 20_530], // $3,001–$4,000   → $205.30
      [500_000, 21_560], // $4,000–$5,000   → $215.60
      [750_000, 24_650], // $7,001–$8,000   → $246.50
      [950_000, 26_710], // $9,001–$10,000  → $267.10
    ];

    for (const [valuationCents, expected] of chart) {
      const amount = componentFor("building", "BLD-ALTER-OTHER", {
        valuationCents,
        custom: { alteration: true, building_category: "other", alteration_type: "LAA" },
      });
      expect(amount, `valuation ${valuationCents}`).toBe(expected);
    }
  });

  it("charges the worked example as its notes state", () => {
    // $40,000 ALT2 in a house: $130.00 + 35 steps × $2.60 = $221.00, plus the $45.00
    // records management fee — $266.00 in all.
    const result = calculatePermitFees(
      {
        asOf,
        valuationCents: 4_000_000,
        custom: {
          alteration: true,
          building_category: "one_two_three_family",
          alteration_type: "ALT2",
        },
      },
      rulesFor("building"),
    );

    expect(result.components.find((component) => component.code === "BLD-ALTER-1TO3")?.amountCents).toBe(
      22_100,
    );
    expect(
      result.components.find((component) => component.code === "BLD-RECORDS-MGMT-1TO3")?.amountCents,
    ).toBe(4_500);
    expect(result.totalCents).toBe(26_600);
  });

  it("pins the two figures the hub profile prints", () => {
    // The profile states these amounts in prose; the prose is only allowed to stand
    // while the engine computes it.
    const rowHouse = componentFor("building", "BLD-ALTER-1TO3", {
      valuationCents: 10_000_000,
      custom: {
        alteration: true,
        building_category: "one_two_three_family",
        alteration_type: "ALT2",
      },
    });
    expect(rowHouse).toBe(37_700); // $377.00

    const tenStorey = componentFor("building", "BLD-ALTER-LARGE-ALT1", {
      valuationCents: 10_000_000,
      custom: { alteration: true, building_category: "large", alteration_type: "ALT1" },
    });
    expect(tenStorey).toBe(201_175); // $2,011.75
  });

  it("selects exactly one row by building size and affordability", () => {
    const base = {
      valuationCents: 10_000_000,
      custom: { alteration: true, building_category: "large", alteration_type: "ALT2" },
    };

    // No affordability fact: row 15, $225.00 base, $10.30 steps.
    expect(alterationCodes(base)).toEqual(["BLD-ALTER-LARGE-ALT2"]);
    expect(componentFor("building", "BLD-ALTER-LARGE-ALT2", base)).toBe(122_410);

    // An affordable R-2: row 13, $280.00 base at the same $10.30 steps.
    const affordable = {
      ...base,
      custom: { ...base.custom, affordable_r2: true },
    };
    expect(alterationCodes(affordable)).toEqual(["BLD-ALTER-LARGE-AFFORDABLE-ALT1-ALT2"]);
    expect(componentFor("building", "BLD-ALTER-LARGE-AFFORDABLE-ALT1-ALT2", affordable)).toBe(
      127_910,
    );

    // ALT1 in the same building: row 14, the table's $17.75 steps.
    const alt1 = {
      valuationCents: 10_000_000,
      custom: { alteration: true, building_category: "large", alteration_type: "ALT1" },
    };
    expect(alterationCodes(alt1)).toEqual(["BLD-ALTER-LARGE-ALT1"]);
    expect(componentFor("building", "BLD-ALTER-LARGE-ALT1", alt1)).toBe(201_175);
  });

  it("prices a new building on floor area, floored at the per-structure minimum", () => {
    const house = (squareFootage: number) => ({
      squareFootage,
      custom: {
        alteration: false,
        building_category: "one_two_three_family",
        existing_elements_retained: false,
      },
    });

    // 1,000 sq ft × $0.06 = $60.00, floored at row 1's $130.00 per structure.
    expect(
      componentFor("building", "BLD-NB-ONE-TWO-THREE-FAMILY-PER-SQFT", house(1_000)),
    ).toBe(13_000);

    // Above the floor the rate decides: 20,000 × $0.06 = $1,200.00.
    expect(
      componentFor("building", "BLD-NB-ONE-TWO-THREE-FAMILY-PER-SQFT", house(20_000)),
    ).toBe(120_000);

    // The other two rows: $0.26 and $0.45 a square foot, floors of $280 and $290.
    expect(
      componentFor("building", "BLD-NB-OTHER-PER-SQFT", {
        squareFootage: 10_000,
        custom: {
          alteration: false,
          building_category: "other",
          existing_elements_retained: false,
        },
      }),
    ).toBe(260_000);
    expect(
      componentFor("building", "BLD-NB-LARGE-PER-SQFT", {
        squareFootage: 10_000,
        custom: {
          alteration: false,
          building_category: "large",
          existing_elements_retained: false,
        },
      }),
    ).toBe(450_000);
  });

  it("prices a new building that keeps existing elements on cost, by rows 2, 5 and 10", () => {
    const amount = componentFor("building", "BLD-NB-RETAINED-OTHER", {
      valuationCents: 4_000_000,
      custom: {
        alteration: false,
        building_category: "other",
        existing_elements_retained: true,
      },
    });
    expect(amount).toBe(66_110); // $280.00 + 37 × $10.30 = $661.10
  });

  it("never charges an area rate for an alteration, or a cost ladder when nothing is kept", () => {
    const alteration = calculatePermitFees(
      {
        asOf,
        valuationCents: 4_000_000,
        squareFootage: 2_000,
        custom: {
          alteration: true,
          building_category: "one_two_three_family",
          alteration_type: "ALT2",
        },
      },
      rulesFor("building"),
    );
    expect(alteration.components.some((component) => component.code.startsWith("BLD-NB-"))).toBe(
      false,
    );

    const newBuilding = calculatePermitFees(
      {
        asOf,
        squareFootage: 2_000,
        custom: {
          alteration: false,
          building_category: "one_two_three_family",
          existing_elements_retained: false,
        },
      },
      rulesFor("building"),
    );
    expect(
      newBuilding.components.some((component) => component.code.startsWith("BLD-ALTER-")),
    ).toBe(false);
  });
});

describe("New York City electrical permits", () => {
  it("charges $40 to file and nothing for the first ten units", () => {
    expect(totalFor("electrical", { custom: { electrical_units: 10 } })).toBe(4_000);
    expect(totalFor("electrical", { custom: { electrical_units: 11 } })).toBe(4_025); // one quarter
    expect(totalFor("electrical", { custom: { electrical_units: 30 } })).toBe(4_500);
    expect(totalFor("electrical", { custom: { electrical_units: 100 } })).toBe(6_250); // 90 × $0.25
  });

  it("prices the service switch in exactly one of its five bands", () => {
    const bands: Array<[number, string, number]> = [
      [100, "ELEC-SERVICE-SWITCH-100", 800],
      [200, "ELEC-SERVICE-SWITCH-200", 3_000],
      [600, "ELEC-SERVICE-SWITCH-600", 10_500],
      [1_200, "ELEC-SERVICE-SWITCH-1200", 22_500],
      [1_500, "ELEC-SERVICE-SWITCH-OVER-1200", 37_500],
    ];

    for (const [service_switch_amperage, code, expected] of bands) {
      const result = calculatePermitFees(
        { asOf, custom: { electrical_units: 0, service_switch_amperage } },
        rulesFor("electrical"),
      );
      const switchCodes = result.components
        .filter((component) => component.code.startsWith("ELEC-SERVICE-SWITCH-"))
        .map((component) => component.code);

      expect(switchCodes, `${service_switch_amperage} A`).toEqual([code]);
      expect(
        result.components.find((component) => component.code === code)?.amountCents,
        `${service_switch_amperage} A`,
      ).toBe(expected);
    }
  });

  it("replaces the application and the units with $15.00 of minor work", () => {
    const result = calculatePermitFees(
      { asOf, custom: { minor_work: true, electrical_units: 30 } },
      rulesFor("electrical"),
    );

    expect(result.totalCents).toBe(1_500);
    expect(result.appliedRuleIds).not.toContain("nyc-elec-initial-application");
    expect(result.appliedRuleIds).not.toContain("nyc-elec-units");
  });

  it("sums the worked example: application, units and switch", () => {
    expect(totalFor("electrical", { custom: { electrical_units: 30, service_switch_amperage: 200 } })).toBe(
      7_500,
    ); // $40.00 + $5.00 + $30.00
  });
});

describe("New York City plumbing permits", () => {
  it("charges the alteration rows with plumbing ids — §28-112.2 has no plumbing schedule", () => {
    // The worked example: a $7,500 LAA in a house is $130.00 + 3 × $2.60 = $137.80,
    // plus the $45.00 records fee — $182.80.
    const result = calculatePermitFees(
      {
        asOf,
        valuationCents: 750_000,
        custom: {
          alteration: true,
          building_category: "one_two_three_family",
          alteration_type: "LAA",
        },
      },
      rulesFor("plumbing"),
    );

    expect(
      result.components.find((component) => component.code === "PLUMB-ALTER-1TO3")?.amountCents,
    ).toBe(13_780);
    expect(
      result.components.find((component) => component.code === "PLUMB-RECORDS-MGMT-1TO3")
        ?.amountCents,
    ).toBe(4_500);
    expect(result.totalCents).toBe(18_280);
  });

  it("floors a small job at the base rather than charging a fraction of a step", () => {
    expect(
      totalFor("plumbing", {
        valuationCents: 300_000,
        custom: {
          alteration: true,
          building_category: "one_two_three_family",
          alteration_type: "LAA",
        },
      }),
    ).toBe(13_000 + 4_500); // $130.00 base + records, no steps below the threshold
  });

  it("charges the records fee once per application, at the building's own rate", () => {
    const house = totalFor("plumbing", {
      valuationCents: 750_000,
      custom: {
        alteration: true,
        building_category: "one_two_three_family",
        alteration_type: "LAA",
      },
    });
    const other = totalFor("plumbing", {
      valuationCents: 750_000,
      custom: { alteration: true, building_category: "other", alteration_type: "LAA" },
    });

    expect(house - 13_780).toBe(4_500); // $45.00 in a 1, 2, 3 Family dwelling
    expect(other - 24_650).toBe(16_500); // $165.00 everywhere else
  });
});

describe("New York City's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    // Inputs and prose only, as everywhere: these totals are the arithmetic the page
    // performs when it renders, asserted against the amounts its own notes state.
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 26_600], // $221.00 + $45.00
      ["electrical-permit-cost", "electrical", 7_500], // $40.00 + $5.00 + $30.00
      ["plumbing-permit-cost", "plumbing", 18_280], // $137.80 + $45.00
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = newYorkCitySeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
