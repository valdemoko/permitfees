import { describe, expect, it } from "vitest";

import { newarkSeed } from "@/content/newark";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Newark, New Jersey — the data, and the arithmetic the chapter prints itself.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **Volume, not area.** The building fee is charged on cubic feet at $0.02 or $0.03 by use
 *     group, which is the first thing this dataset needed a `cubic_footage` basis for. The two
 *     rates are asserted against each other on one volume, and against the same building priced
 *     as an alteration, so a rule reading the wrong basis cannot pass.
 *  2. **The alteration bands graduate.** $28 per $1,000 on the first $50,000, $21 on the next,
 *     $17 above — so $50,000 is $1,400.00, $100,000 is $2,450.00 and $400,000 is $7,550.00. A
 *     flat "top rate times the whole cost" reading would give $3,400.00 and $6,800.00 for the
 *     last two, and the boundary assertions are what separate the two readings.
 *  3. **The blocks are whole.** $58 covers the first fifty receptacles and $12 buys twenty more,
 *     so 50 pays $58, 51 and 70 both pay $70, and 71 pays $82.
 *  4. **$58 is a floor and not an addition.** A permit with no rows at all pays $58.00, and a
 *     permit whose rows exceed it pays its rows.
 *  5. **The State surcharge is the State's.** $0.00371 a cubic foot and $1.90 per $1,000, on its
 *     own component, from the regulation the City's chapter cites for it.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return newarkSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

describe("Newark seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(newarkSeed.state).toMatchObject({
      code: "NJ",
      slug: "new-jersey",
      fipsCode: "34",
    });
    expect(newarkSeed.county).toMatchObject({
      key: "essex-county",
      fipsCode: "34013",
    });
    expect(newarkSeed.jurisdiction).toMatchObject({
      key: "newark",
      slug: "newark",
      officialName: "City of Newark",
      countyKey: "essex-county",
      timezone: "America/New_York",
      isActive: true,
    });
  });

  it("shares the New Jersey state row rather than defining its own permit types", () => {
    expect(newarkSeed.state.code).toBe("NJ");
    expect(newarkSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(newarkSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(newarkSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of newarkSeed.feeRules) {
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
    const published = newarkSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(newarkSeed.permitPages).toHaveLength(3);
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
        sourceCount: newarkSeed.sources.length,
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

describe("Newark building permits", () => {
  it("charges three cents a cubic foot where the use group is on that side of the table", () => {
    // 60,000 cubic feet at $0.03 is $1,800.00, plus the State surcharge of $0.00371 a cubic
    // foot, which is $222.60. The $58 minimum is irrelevant at this size.
    const result = calculatePermitFees(
      { asOf, custom: { use_group: "R", cubic_footage: 60_000 } },
      rulesFor("building"),
    );

    expect(result.totalCents).toBe(202_260);
    expect(result.components.map((component) => component.componentType).sort()).toEqual([
      "base",
      "state_surcharge",
    ]);
  });

  it("charges two cents a cubic foot for the other side, on the same volume", () => {
    expect(totalFor("building", { custom: { use_group: "S", cubic_footage: 60_000 } })).toBe(
      142_260,
    );
    expect(totalFor("building", { custom: { use_group: "A", cubic_footage: 60_000 } })).toBe(
      142_260,
    );
  });

  it("charges exactly one volumetric rate, and none at all without a use group", () => {
    const residential = calculatePermitFees(
      { asOf, custom: { use_group: "R", cubic_footage: 60_000 } },
      rulesFor("building"),
    );
    expect(
      residential.components.filter((component) => component.code.startsWith("BLD-NEW-PER-CF")),
    ).toHaveLength(1);

    // No use group is not a reason to charge the cheaper rate: the volumetric rules ask for a
    // fact that was not given, so the volume goes unpriced and the permit falls to the $58
    // floor.
    const unnamed = calculatePermitFees(
      { asOf, custom: { cubic_footage: 60_000 } },
      rulesFor("building"),
    );

    expect(unnamed.components).toEqual([]);
    expect(
      unnamed.excluded.find((rule) => rule.code === "BLD-NEW-PER-CF-3")?.reason,
    ).toBe("conditions_not_met");
    // And the floor does not rescue it: a permit whose work has not been described has not
    // been quoted a fee, so this is $0.00 with the reason stated rather than $58.00.
  });

  it("graduates the alteration bands instead of charging the top rate on everything", () => {
    // $28 then $21 then $17 per $1,000, so the first $50,000 is charged at the first rate
    // whatever the job costs. A flat reading of the top band would charge a $400,000
    // alteration $6,800.00 and a $100,000 one $1,700.00; the published table produces
    // $7,550.00 and $2,450.00.
    const cases: Array<[number, number]> = [
      // valuation in cents, building fee only
      [5_000_000, 140_000], // $50,000 x 2.8%
      [10_000_000, 245_000], // $1,400 + $1,050
      [40_000_000, 755_000], // $1,400 + $1,050 + $5,100
    ];

    for (const [valuationCents, expected] of cases) {
      const result = calculatePermitFees(
        { asOf, valuationCents, custom: { building_alteration: true } },
        rulesFor("building"),
      );
      const base = result.components.find((component) => component.code === "BLD-ALTERATION");

      expect(base?.amountCents, `$${valuationCents / 100} of estimated cost`).toBe(expected);
    }
  });

  it("adds the State surcharge to an alteration at $1.90 per $1,000", () => {
    const result = calculatePermitFees(
      { asOf, valuationCents: 40_000_000, custom: { building_alteration: true } },
      rulesFor("building"),
    );
    const surcharge = result.components.find(
      (component) => component.componentType === "state_surcharge",
    );

    expect(surcharge?.amountCents).toBe(76_000); // 400 x $1.90
    expect(result.totalCents).toBe(831_000); // $7,550 + $760
  });

  it("charges no volumetric fee for an alteration, and no alteration fee for new work", () => {
    const alteration = calculatePermitFees(
      {
        asOf,
        valuationCents: 5_000_000,
        custom: { building_alteration: true, use_group: "R", cubic_footage: 30_000 },
      },
      rulesFor("building"),
    );

    // The chapter prices the two kinds of work on different measurements, so choosing the
    // alteration path must not leave a volumetric row charged as well.
    expect(alteration.components.some((component) => component.code === "BLD-NEW-PER-CF-3")).toBe(
      false,
    );
    expect(alteration.totalCents).toBe(149_500); // $1,400 + $95
  });
});

describe("Newark's $58", () => {
  it("is charged as the shortfall when a permit's own rows come to less", () => {
    // 500 cubic feet at $0.03 is $15.00, which is below the floor, so the floor is charged —
    // $30.00 of shortfall, not $58.00 on top of the $15.00. The State surcharge is not counted
    // toward the floor, because the floor is measured against the permit fee rather than
    // against the whole bill, and it is charged on its own line.
    const result = calculatePermitFees(
      { asOf, custom: { use_group: "R", cubic_footage: 500 } },
      rulesFor("building"),
    );

    expect(
      result.components.find((component) => component.code === "BUILDING-MINIMUM-PERMIT")
        ?.amountCents,
    ).toBe(4_300);
    expect(result.totalCents).toBe(5_800 + 186); // $58.00 floor + $1.86 of State surcharge
  });

  it("is not charged at all when there is no fee for it to floor", () => {
    // A permit with no facts is not a $58 permit on this site: `permit_minimum` reads the
    // base subtotal, the engine injects that fact only once a base component has been
    // computed, and the floor is reported as excluded rather than charged. This is the same
    // treatment Miami-Dade's permit-wide minimum gets, and it is the honest answer — a reader
    // who has not said what the work is has not been quoted a fee.
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const result = calculatePermitFees({ asOf }, rulesFor(permitTypeKey));

      expect(result.totalCents, permitTypeKey).toBe(0);
      expect(result.appliedRuleIds, permitTypeKey).not.toContain(
        `${permitTypeKey.toUpperCase()}-MINIMUM-PERMIT`,
      );
      expect(
        result.excluded.find((rule) => rule.code === `${permitTypeKey.toUpperCase()}-MINIMUM-PERMIT`),
        permitTypeKey,
      ).toBeDefined();
    }
  });

  it("is credited rather than added once the permit's own rows exceed it", () => {
    const result = calculatePermitFees({ asOf, fixtures: 2 }, rulesFor("plumbing"));

    // Two fixtures at $14.00 is $28.00, below the floor, so the floor is charged — and the
    // charge is the shortfall of $30.00, not the floor plus the rows, which would be $86.00.
    expect(result.totalCents).toBe(5_800);
    expect(result.components.find((component) => component.code === "PLUMBING-MINIMUM-PERMIT")?.amountCents).toBe(
      3_000,
    );

    const over = calculatePermitFees({ asOf, fixtures: 12 }, rulesFor("plumbing"));
    expect(over.appliedRuleIds).not.toContain("PLUMBING-MINIMUM-PERMIT");
    expect(over.totalCents).toBe(16_800); // 12 x $14.00
  });
});

describe("Newark electrical permits", () => {
  it("charges the block row in whole blocks of twenty", () => {
    const price = (outlets: number): number =>
      totalFor("electrical", { custom: { outlets } });

    expect(price(1)).toBe(5_800); // the first block, raised to nothing: $58 is the floor too
    expect(price(50)).toBe(5_800);
    expect(price(51)).toBe(7_000); // $58 + one $12 block
    expect(price(70)).toBe(7_000);
    expect(price(71)).toBe(8_200); // two blocks
    expect(price(150)).toBe(11_800); // $58 + five blocks
  });

  it("describes the row the way the chapter prints it", () => {
    const [component] = calculatePermitFees(
      { asOf, custom: { outlets: 60 } },
      rulesFor("electrical"),
    ).components;

    expect(component?.formula).toBe(
      "$58.00 for the first 50 outlets, plus $12.00 for each additional 20 outlets or part thereof",
    );
  });

  it("prices a service, panel or subpanel by amperage, in exactly one band", () => {
    const cases: Array<[number, number]> = [
      [100, 8_100],
      [200, 8_100],
      [400, 46_000],
      [1_000, 46_000],
      [1_500, 115_000],
    ];

    for (const [amperage, expected] of cases) {
      const result = calculatePermitFees(
        { asOf, custom: { amperage, panels: 1 } },
        rulesFor("electrical"),
      );

      expect(result.totalCents, `${amperage} amps`).toBe(expected);
      expect(
        result.components.filter((component) => component.code.startsWith("ELEC-PANELS")),
        `${amperage} amps charges one band`,
      ).toHaveLength(1);
    }
  });

  it("charges each device on a multi-device permit", () => {
    expect(totalFor("electrical", { custom: { amperage: 200, panels: 3 } })).toBe(24_300); // 3 x $81
  });

  it("adds the State surcharge to electrical work at $1.90 per $1,000 of value", () => {
    const result = calculatePermitFees(
      { asOf, valuationCents: 850_000, custom: { outlets: 60 } },
      rulesFor("electrical"),
    );

    // $70.00 of block fee, which is above the $58 floor, plus 8.5 x $1.90 = $16.15.
    expect(result.totalCents).toBe(8_615);
  });
});

describe("Newark plumbing permits", () => {
  it("charges $14 a fixture and $75 a special device, separately", () => {
    const result = calculatePermitFees(
      { asOf, fixtures: 12, custom: { special_devices: 2 } },
      rulesFor("plumbing"),
    );

    expect(result.components.find((component) => component.code === "PLUMB-FIXTURES")?.amountCents).toBe(
      16_800,
    );
    expect(
      result.components.find((component) => component.code === "PLUMB-SPECIAL-DEVICES")?.amountCents,
    ).toBe(15_000);
    expect(result.totalCents).toBe(31_800);
  });

  it("reads two different counts, so a fixture is not charged as a device", () => {
    // Two counts, two facts, and the failure mode is a double charge rather than a missing
    // figure: six fixtures and no special devices must pay the fixture row and nothing else.
    const fixturesOnly = calculatePermitFees({ asOf, fixtures: 6 }, rulesFor("plumbing"));
    expect(fixturesOnly.totalCents).toBe(8_400); // 6 x $14.00
    expect(
      fixturesOnly.components.some((component) => component.code === "PLUMB-SPECIAL-DEVICES"),
    ).toBe(false);
  });
});

describe("Newark's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    // The examples carry no amounts — only inputs and prose — so this is the arithmetic the
    // page performs at render time, asserted against the schedules it cites. The expected
    // totals are the ones each example's notes state in words.
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 202_260], // $1,800.00 + $222.60
      ["electrical-permit-cost", "electrical", 16_715], // $70.00 + $81.00 + $16.15
      ["plumbing-permit-cost", "plumbing", 33_510], // $168.00 + $150.00 + $17.10
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = newarkSeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
