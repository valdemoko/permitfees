import { describe, expect, it } from "vitest";

import { cambridgeSeed } from "@/content/cambridge";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Cambridge, Massachusetts — a schedule that rounds up, an Exemption rate that charges,
 * an electrical price list that stacks and a plumbing block with an allowance.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The rate rounds up, because the phrase is printed.** "$20.00 per $1,000.00 or
 *     fraction thereof" sets `incrementCents`, so $18,750 buys nineteen whole steps. This
 *     is the opposite of Boston's prorating sheet three miles east, and the contrast is
 *     asserted in both cities' tests.
 *  2. **The Exemption is a rate, not a waiver** — $15.00 at three residential units or
 *     less — and the standard rate charges wherever the unit count is absent or above it.
 *  3. **Electrical stacks; nothing branches.** A service and four receptacles pay both
 *     rows, where Boston's sheet lets exactly one branch answer.
 *  4. **The plumbing block has an allowance**: one to five fixtures are $50.00 together
 *     and each one after the fifth is $5.00.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return cambridgeSeed.feeRules
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

describe("Cambridge seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(cambridgeSeed.state).toMatchObject({
      code: "MA",
      slug: "massachusetts",
      fipsCode: "25",
    });
    expect(cambridgeSeed.county).toMatchObject({
      key: "middlesex-county",
      fipsCode: "25017",
    });
    expect(cambridgeSeed.jurisdiction).toMatchObject({
      key: "cambridge",
      slug: "cambridge",
      officialName: "City of Cambridge",
      countyKey: "middlesex-county",
      timezone: "America/New_York",
      isActive: true,
    });
  });

  it("shares the Massachusetts state row and the permit catalogue", () => {
    expect(cambridgeSeed.state.code).toBe("MA");
    expect(cambridgeSeed.permitTypes).toEqual([]);
    expect(cambridgeSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(cambridgeSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(cambridgeSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of cambridgeSeed.feeRules) {
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
    const published = cambridgeSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(cambridgeSeed.permitPages).toHaveLength(3);
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
        sourceCount: cambridgeSeed.sources.length,
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
    const sourceVerifications = cambridgeSeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      cambridgeSeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of cambridgeSeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-25");
      expect(verification.verifiedBy, verification.entityKey).toContain("Massachusetts");
    }
  });
});

describe("Cambridge building permits", () => {
  it("rounds up to the next thousand, because the phrase is printed", () => {
    // $18,750 of cost is nineteen steps of $20.00 — a whole step per fraction — or $380.00.
    // Boston's sheet, printing no "or fraction thereof", would charge $375.00 of rate.
    expect(componentFor("building", "BLD-COST-PER-THOUSAND", { valuationCents: 1_875_000 })).toBe(
      38_000,
    );
    // A boundary value buys exactly its step: $19,000 is nineteen steps too.
    expect(componentFor("building", "BLD-COST-PER-THOUSAND", { valuationCents: 1_900_000 })).toBe(
      38_000,
    );
  });

  it("charges the $50.00 minimum as the rule's own floor", () => {
    // $2,000 of cost is two steps of $20.00, $40.00 — charged at $50.00.
    expect(componentFor("building", "BLD-COST-PER-THOUSAND", { valuationCents: 200_000 })).toBe(
      5_000,
    );
    // The floor binds below $2,500 of cost and not at it: at $2,500 the ladder itself
    // pays three steps of $20.00, $60.00, which is above the floor.
    expect(componentFor("building", "BLD-COST-PER-THOUSAND", { valuationCents: 250_000 })).toBe(
      6_000,
    );
  });

  it("prices the Exemption line as a rate selected by the building, not a waiver", () => {
    // A two-unit building: $18,750 is nineteen steps of $15.00, or $285.00.
    expect(
      totalFor("building", { valuationCents: 1_875_000, custom: { residential_units: 2 } }),
    ).toBe(28_500);
    // The same job in a four-unit building pays the standard rate.
    expect(
      totalFor("building", { valuationCents: 1_875_000, custom: { residential_units: 4 } }),
    ).toBe(38_000);
    // A reader who does not state a unit count pays the standard rate rather than nothing.
    expect(totalFor("building", { valuationCents: 1_875_000 })).toBe(38_000);
    // Exactly one of the two ladder rules answers, whichever way the fact goes.
    expect(
      codesFor("building", { valuationCents: 1_875_000, custom: { residential_units: 2 } }, "BLD-"),
    ).toEqual(["BLD-EXEMPTION-1TO3"]);
    expect(
      codesFor("building", { valuationCents: 1_875_000, custom: { residential_units: 4 } }, "BLD-"),
    ).toEqual(["BLD-COST-PER-THOUSAND"]);
  });

  it("charges Moving buildings at the exempt rate whatever the building", () => {
    expect(
      componentFor(
        "building",
        "BLD-MOVING-BUILDINGS",
        { valuationCents: 1_875_000, custom: { moving_buildings: true } },
      ),
    ).toBe(28_500);
    // Whatever the unit count: the row does not ask.
    expect(
      codesFor(
        "building",
        {
          valuationCents: 1_875_000,
          custom: { moving_buildings: true, residential_units: 2 },
        },
        "BLD-",
      ),
    ).toEqual(["BLD-MOVING-BUILDINGS"]);
  });

  it("prices Sheet Metal on the exact run, with no block rounding", () => {
    // $50.00 primary fee plus 150 feet at $0.25 a foot = $87.50. No "or fraction thereof"
    // on this row — a hundred feet is a rate unit here, not a block.
    expect(
      totalFor("building", { custom: { linear_feet: 150 } }),
    ).toBe(8_750);
    // A run of exactly 100 feet: $25.00 of rate plus the $50.00 fee.
    expect(totalFor("building", { custom: { linear_feet: 100 } })).toBe(7_500);
    // No run supplied, no charge on either part — the ladder still prices the job.
    expect(codesFor("building", { valuationCents: 1_000_000 }, "BLD-SHEET-METAL")).toEqual([]);
  });
});

describe("Cambridge electrical permits", () => {
  it("prices the service at $10.00 per 100 amperes", () => {
    expect(
      componentFor("electrical", "ELEC-SERVICE", {
        custom: { service_change: true, amperage: 200 },
      }),
    ).toBe(2_000);
    expect(
      componentFor("electrical", "ELEC-SERVICE", {
        custom: { service_change: true, amperage: 400 },
      }),
    ).toBe(4_000);
  });

  it("prices receptacles five ways by rating, with the first row as the default", () => {
    const at = (amps: number | undefined, outlets = 4) =>
      componentFor("electrical", `ELEC-RECEPTACLE-${amps ?? 15}A`, {
        custom: amps === undefined ? { outlets } : { receptacle_amps: amps, outlets },
      });

    expect(at(15)).toBe(400);
    expect(at(20)).toBe(1_600);
    expect(at(30)).toBe(2_000);
    expect(at(50)).toBe(3_200);
    expect(at(70)).toBe(6_000);
    // No rating stated: the schedule's first row prices the count.
    expect(at(undefined)).toBe(400);

    // Exactly one receptacle row charges, whichever way the rating goes.
    expect(
      codesFor("electrical", { custom: { receptacle_amps: 30, outlets: 4 } }, "ELEC-RECEPTACLE"),
    ).toEqual(["ELEC-RECEPTACLE-30A"]);
    expect(
      codesFor("electrical", { custom: { outlets: 4 } }, "ELEC-RECEPTACLE"),
    ).toEqual(["ELEC-RECEPTACLE-15A"]);
  });

  it("stacks the rows instead of branching, with the meter charged per item", () => {
    // The worked example: 200-ampere service ($20.00) + four 20-amp receptacles ($16.00)
    // + one meter ($5.00) = $41.00 — every row charging where Boston's sheet would let
    // exactly one branch answer.
    expect(
      totalFor("electrical", {
        custom: { service_change: true, amperage: 200, receptacle_amps: 20, outlets: 4, meters: 1 },
      }),
    ).toBe(4_100);
  });

  it("charges the generator and the alarm once per permit, by occupancy", () => {
    expect(
      componentFor("electrical", "ELEC-GENERATOR", { custom: { generator: true } }),
    ).toBe(10_000);
    expect(
      totalFor("electrical", { occupancy: "residential", custom: { alarm_system: true } }),
    ).toBe(2_500);
    expect(
      totalFor("electrical", { occupancy: "commercial", custom: { alarm_system: true } }),
    ).toBe(7_500);
    // An unstated occupancy lands on the schedule's larger figure.
    expect(totalFor("electrical", { custom: { alarm_system: true } })).toBe(7_500);
  });

  it("charges the re-inspection as an inspection component, not part of the permit", () => {
    expect(
      componentFor("electrical", "ELEC-RE-INSPECTION", { custom: { re_inspection: true } }),
    ).toBe(5_000);
    expect(codesFor("electrical", {}, "ELEC-")).toEqual([]);
  });
});

describe("Cambridge plumbing permits", () => {
  it("charges the block with its five-fixture allowance", () => {
    // One to five fixtures are $50.00 together.
    expect(componentFor("plumbing", "PLUMB-FIXTURE-BLOCK", { fixtures: 1 })).toBe(5_000);
    expect(componentFor("plumbing", "PLUMB-FIXTURE-BLOCK", { fixtures: 5 })).toBe(5_000);
    // Each one after the fifth adds $5.00: six are $55.00, eight $65.00, twelve $85.00.
    expect(componentFor("plumbing", "PLUMB-FIXTURE-BLOCK", { fixtures: 6 })).toBe(5_500);
    expect(componentFor("plumbing", "PLUMB-FIXTURE-BLOCK", { fixtures: 8 })).toBe(6_500);
    expect(componentFor("plumbing", "PLUMB-FIXTURE-BLOCK", { fixtures: 12 })).toBe(8_500);
  });

  it("contrasts with Boston's straight per-fixture row", () => {
    // Boston charges $20.00 + 5 × $5.00 = $45.00 for five fixtures against Cambridge's
    // $50.00, and $60.00 for eight against $65.00 — asserted in both cities' tests.
    expect(totalFor("plumbing", { fixtures: 5 })).toBe(5_000);
    expect(totalFor("plumbing", { fixtures: 8 })).toBe(6_500);
  });

  it("prices the water heaters beside the block", () => {
    expect(
      totalFor("plumbing", { fixtures: 6, custom: { water_heater: "electric" } }),
    ).toBe(10_500);
    expect(
      totalFor("plumbing", { fixtures: 6, custom: { water_heater: "tankless" } }),
    ).toBe(15_500);
    // Exactly one water heater row answers, and neither charges when none is named.
    expect(
      codesFor("plumbing", { fixtures: 6, custom: { water_heater: "gas" } }, "PLUMB-WATER"),
    ).toEqual(["PLUMB-WATER-HEATER"]);
    expect(codesFor("plumbing", { fixtures: 6 }, "PLUMB-WATER")).toEqual([]);
  });

  it("charges the plumbing re-inspection as an inspection component", () => {
    expect(
      componentFor("plumbing", "PLUMB-RE-INSPECTION", { custom: { re_inspection: true } }),
    ).toBe(5_000);
    expect(totalFor("plumbing", { fixtures: 5 })).toBe(5_000);
  });
});
