import { describe, expect, it } from "vitest";

import { jerseyCitySeed } from "@/content/jerseycity";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Jersey City, New Jersey — the data, and the arithmetic the ordinance prints itself.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The use-group exception is 5.5 times the general rate on the same volume.** $0.027 and
 *     $0.15 a cubic foot are asserted on one building, and the printed list is asserted to be the
 *     one that is matched — A-2 twice and no A-3 — because reading the duplicate as an A-3 would
 *     charge an A-3 project $0.15 without the ordinance saying so.
 *  2. **$0.027 is stored exactly.** Two point seven cents is not a whole number of cents;
 *     rounding it to three would put a 100,000 cubic foot building $300 too high, so the boundary
 *     assertion is what protects the rate.
 *  3. **The blocks are whole.** $25 covers the first ten devices and buys twenty-five more, so 10
 *     pays $25, 11 and 35 pay $50, and 36 pays $75.
 *  4. **One floor, never two.** A short permit is floored at $50 and a plan permit at $100, and a
 *     permit can only be one of them.
 *  5. **The State surcharge is the State's** — $0.00371 a cubic foot or $1.90 per $1,000, from the
 *     regulation the code incorporates by reference.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return jerseyCitySeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

describe("Jersey City seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(jerseyCitySeed.state).toMatchObject({
      code: "NJ",
      slug: "new-jersey",
      fipsCode: "34",
    });
    expect(jerseyCitySeed.county).toMatchObject({
      key: "hudson-county",
      fipsCode: "34017",
    });
    expect(jerseyCitySeed.jurisdiction).toMatchObject({
      key: "jersey-city",
      slug: "jersey-city",
      officialName: "City of Jersey City",
      countyKey: "hudson-county",
      timezone: "America/New_York",
      isActive: true,
    });
  });

  it("shares the New Jersey state row and the permit catalogue", () => {
    expect(jerseyCitySeed.state.code).toBe("NJ");
    expect(jerseyCitySeed.permitTypes).toEqual([]);
    expect(jerseyCitySeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(jerseyCitySeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(jerseyCitySeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of jerseyCitySeed.feeRules) {
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
    const published = jerseyCitySeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(jerseyCitySeed.permitPages).toHaveLength(3);
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
        sourceCount: jerseyCitySeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });
});

describe("Jersey City building permits", () => {
  it("charges $0.027 a cubic foot exactly, and not three cents", () => {
    // 100,000 cubic feet at $0.027 is $2,700.00. Rounding the rate to three cents before
    // multiplying would give $3,000.00, and rounding it down would give $2,000.00 — which is
    // why the rate is stored as the exact fraction 27/10.
    const result = calculatePermitFees(
      { asOf, custom: { use_group: "R", cubic_footage: 100_000 } },
      rulesFor("building"),
    );

    expect(result.totalCents).toBe(270_000 + 37_100); // the fee plus the State surcharge
  });

  it("charges the $0.15 exception for the use groups the ordinance lists", () => {
    for (const useGroup of ["A-1", "A-2", "A-4", "A-5", "F-1", "F-2", "S-1", "S-2"]) {
      const result = calculatePermitFees(
        { asOf, custom: { use_group: useGroup, cubic_footage: 10_000 } },
        rulesFor("building"),
      );
      const fee = result.components.find((component) => component.code === "BLD-NEW-PER-CF-0-15");

      expect(fee?.amountCents, useGroup).toBe(150_000); // 10,000 x $0.15
    }
  });

  it("charges A-3 the general rate, because the printed list does not name it", () => {
    // The ordinance's list reads "A-1, A-2, A-2, A-4, A-5, F-1, F-2, S-1 and S-2". The page
    // states that the duplicate is very likely an A-3 and that the model follows the printed
    // list anyway; this assertion is what keeps that decision visible.
    const result = calculatePermitFees(
      { asOf, custom: { use_group: "A-3", cubic_footage: 10_000 } },
      rulesFor("building"),
    );

    expect(result.components.some((component) => component.code === "BLD-NEW-PER-CF-0-15")).toBe(
      false,
    );
    expect(result.components.find((component) => component.code === "BLD-NEW-PER-CF-0-027")?.amountCents).toBe(
      27_000,
    );
  });

  it("charges alterations $15 per $1,000 of estimated cost, with no bands", () => {
    const result = calculatePermitFees(
      { asOf, valuationCents: 40_000_000, custom: { building_alteration: true } },
      rulesFor("building"),
    );

    expect(result.components.find((component) => component.code === "BLD-ALTERATION")?.amountCents).toBe(
      600_000,
    ); // $400,000 x $15/$1,000
    expect(result.totalCents).toBe(600_000 + 76_000); // plus 400 x $1.90
  });

  it("applies exactly one of the two alteration floors, and only below it", () => {
    // A short permit with $6,000 of estimated cost is $90.00, which is above the $50 floor, so
    // no floor is charged.
    const above = calculatePermitFees(
      { asOf, valuationCents: 600_000, custom: { building_alteration: true } },
      rulesFor("building"),
    );
    expect(above.appliedRuleIds).not.toContain("BLD-MINIMUM-SHORT-50");

    // A short permit with $2,000 of cost is $30.00, so the $50 floor is charged — and the
    // $100 plan floor is not, because this application is not filed with plans.
    const below = calculatePermitFees(
      { asOf, valuationCents: 200_000, custom: { building_alteration: true } },
      rulesFor("building"),
    );
    expect(below.totalCents).toBe(5_000 + 380); // $50.00 floor + $3.80 of State surcharge

    const withPlans = calculatePermitFees(
      { asOf, valuationCents: 200_000, custom: { building_alteration: true, plan_permit: true } },
      rulesFor("building"),
    );
    expect(withPlans.totalCents).toBe(10_000 + 380); // $100.00 floor
    expect(
      withPlans.components.filter((component) => component.componentType !== "state_surcharge"),
    ).toHaveLength(2); // the alteration row and one floor, not two
  });

  it("sums a volumetric row and a cost row only when the work is both", () => {
    // M(1)(e): a combination is the sum of the fees computed separately. The building subcode
    // picks one of the two by the alteration flag, so this asserts the flag's reach rather than
    // a mixed calculation.
    const volumetric = calculatePermitFees(
      { asOf, valuationCents: 40_000_000, custom: { use_group: "R", cubic_footage: 40_000 } },
      rulesFor("building"),
    );

    expect(volumetric.components.map((component) => component.code).sort()).toEqual([
      "BLD-NEW-PER-CF-0-027",
      "BLD-STATE-SURCHARGE-NEW",
    ]);
    expect(volumetric.totalCents).toBe(108_000 + 14_840);
  });

  it("charges no volumetric fee for an alteration, even where a volume is given", () => {
    const alteration = calculatePermitFees(
      {
        asOf,
        valuationCents: 5_000_000,
        custom: { building_alteration: true, use_group: "R", cubic_footage: 50_000 },
      },
      rulesFor("building"),
    );

    expect(
      alteration.components.some((component) => component.code.startsWith("BLD-NEW-PER-CF")),
    ).toBe(false);
    expect(alteration.totalCents).toBe(75_000 + 9_500); // $750.00 + $95.00
  });
});

describe("Jersey City electrical permits", () => {
  it("charges the device blocks in whole blocks of twenty-five", () => {
    const price = (outlets: number): number => totalFor("electrical", { custom: { outlets } });

    expect(price(1)).toBe(2_500);
    expect(price(10)).toBe(2_500);
    expect(price(11)).toBe(5_000); // a second whole block
    expect(price(35)).toBe(5_000);
    expect(price(36)).toBe(7_500);
    expect(price(60)).toBe(7_500); // ten included, then two blocks
  });

  it("describes the row the way the ordinance prints it", () => {
    const [component] = calculatePermitFees(
      { asOf, custom: { outlets: 40 } },
      rulesFor("electrical"),
    ).components;

    expect(component?.formula).toBe(
      "$25.00 for the first 10 outlets, plus $25.00 for each additional 25 outlets or part thereof",
    );
  });

  it("charges a private pool and a leak detection system as their own flat amounts", () => {
    expect(totalFor("electrical", { custom: { private_pool: true } })).toBe(4_600);
    expect(totalFor("electrical", { custom: { leak_detection: true } })).toBe(10_000);
  });

  it("charges residential alarms by the dwelling unit rather than by device", () => {
    const threeUnits = calculatePermitFees(
      { asOf, units: 3, custom: { dwelling_alarm_system: true } },
      rulesFor("electrical"),
    );

    expect(threeUnits.totalCents).toBe(6_900); // 3 x $23.00
    expect(
      threeUnits.components.some((component) => component.code === "ELEC-RECEPTACLES-AND-DEVICES"),
    ).toBe(false);
  });

  it("adds the State surcharge on the value of the work", () => {
    const result = calculatePermitFees(
      { asOf, valuationCents: 1_200_000, custom: { outlets: 40 } },
      rulesFor("electrical"),
    );

    expect(result.totalCents).toBe(7_500 + 2_280); // $75.00 + 12 x $1.90
  });
});

describe("Jersey City plumbing permits", () => {
  it("charges $10 a fixture and nothing else", () => {
    expect(totalFor("plumbing", { fixtures: 14 })).toBe(14_000);
    expect(totalFor("plumbing", { fixtures: 1 })).toBe(1_000);
  });

  it("charges the back flow cross connection as a flat amount on top", () => {
    const result = calculatePermitFees(
      { asOf, fixtures: 4, custom: { backflow_cross_connection: true } },
      rulesFor("plumbing"),
    );

    expect(result.totalCents).toBe(4_000 + 30_000);
  });

  it("adds the State surcharge on the value of the work", () => {
    expect(totalFor("plumbing", { valuationCents: 750_000, fixtures: 14 })).toBe(14_000 + 1_425);
  });

  it("has no published minimum, so a one-fixture permit is $10.00", () => {
    const result = calculatePermitFees({ asOf, fixtures: 1 }, rulesFor("plumbing"));

    expect(result.totalCents).toBe(1_000);
    expect(result.appliedRuleIds.some((id) => id.includes("MINIMUM"))).toBe(false);
  });
});

describe("Jersey City's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    // Inputs and prose only, as everywhere: these totals are the arithmetic the page performs
    // when it renders, asserted against the amounts its own notes state.
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 108_000 + 14_840], // $1,080.00 + $148.40
      ["electrical-permit-cost", "electrical", 7_500 + 2_280], // $75.00 + $22.80
      ["plumbing-permit-cost", "plumbing", 14_000 + 1_425], // $140.00 + $14.25
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = jerseyCitySeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
