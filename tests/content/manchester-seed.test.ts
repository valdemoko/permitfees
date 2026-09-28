import { describe, expect, it } from "vitest";

import { manchesterSeed } from "@/content/manchester";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Manchester, New Hampshire — the data, and the arithmetic the City prints itself.
 *
 * The checks that matter:
 *
 *  1. **The minimum and the application fee add, and the sum is the City's own figure.**
 *     Sec. 109.8 charges a $25.00 non-refundable application fee and a $30.00 minimum permit
 *     fee, and Manchester's electrical and plumbing forms print the line as
 *     "$30 MINIMUM FEE + $25 APPLICATION FEE: $55.00". A plumbing permit for $15.00 of
 *     calculated work is asserted to total exactly $55.00 — which is a test of the
 *     component types as much as of the arithmetic.
 *  2. **Two building rates, selected by one fact.** .006 for a new one- or two-family
 *     dwelling and .010 for everything else, on the same valuation.
 *  3. **Plan review is $0.02 per square foot and skips houses and accessory structures.**
 *  4. **The low-voltage ladder is three bands of one published row,** gated so exactly one
 *     of them can apply to any valuation.
 */

const asOf = "2026-09-25";

const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

function rulesFor(permitTypeKey: string) {
  return manchesterSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

describe("Manchester seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(manchesterSeed.state).toMatchObject({
      code: "NH",
      slug: "new-hampshire",
      fipsCode: "33",
    });
    expect(manchesterSeed.county).toMatchObject({
      key: "hillsborough-county",
      fipsCode: "33011",
    });
    expect(manchesterSeed.jurisdiction).toMatchObject({
      key: "manchester",
      slug: "manchester",
      officialName: "City of Manchester",
      timezone: "America/New_York",
      isActive: true,
    });
  });

  it("shares the New Hampshire state row with Nashua rather than defining its own", () => {
    expect(manchesterSeed.state.code).toBe("NH");
    expect(manchesterSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(manchesterSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(manchesterSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of manchesterSeed.feeRules) {
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
    const published = manchesterSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(manchesterSeed.permitPages).toHaveLength(3);
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
        sourceCount: manchesterSeed.sources.length,
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

describe("Manchester building permits", () => {
  it("charges .006 for a new one- or two-family dwelling", () => {
    // $250,000 × 0.006 = $1,500.00, plus the $25.00 application fee. No plan review: the
    // item 2 exclusions take one- and two-family dwellings out of it.
    const result = calculatePermitFees(
      { asOf, valuationCents: 25_000_000, custom: { new_one_two_family: true } },
      rulesFor("building"),
    );

    expect(result.components.some((component) => component.componentType === "plan_review")).toBe(
      false,
    );
    expect(result.totalCents).toBe(152_500);
  });

  it("charges .010 for everything else, including the same valuation", () => {
    expect(totalFor("building", { valuationCents: 25_000_000 })).toBe(252_500);
  });

  it("adds plan review at $0.02 per square foot to work that is not a house", () => {
    const result = calculatePermitFees(
      { asOf, valuationCents: 75_000_000, squareFootage: 20_000 },
      rulesFor("building"),
    );
    const review = result.components.find(
      (component) => component.componentType === "plan_review",
    );

    expect(review?.amountCents).toBe(40_000); // 20,000 sq ft × $0.02
    expect(result.totalCents).toBe(792_500); // $7,500 + $400 + $25
  });

  it("skips plan review for an accessory structure", () => {
    expect(
      totalFor("building", {
        valuationCents: 2_000_000,
        squareFootage: 400,
        custom: { accessory_structure: true },
      }),
    ).toBe(22_500); // $200 + $25, no review
  });

  it("prices demolition from the published band ladder, and does not plan-review it", () => {
    // The bands are $20.00 / $75.00 / $150.00, and item 2's plan review applies to "all
    // buildings and structures covered under item 1 above" — item 1 is new work and
    // alterations, so a demolition permit pays its band and no review, and the first band
    // is raised to the $30.00 minimum because a demolition permit is inspected.
    for (const [squareFootage, expected] of [
      [800, 5_500],
      [3_000, 10_000],
      [9_000, 17_500],
    ] as Array<[number, number]>) {
      const result = calculatePermitFees(
        { asOf, squareFootage, custom: { demolition: true } },
        rulesFor("building"),
      );
      expect(result.totalCents, `${squareFootage} sq ft`).toBe(expected);
      expect(
        result.components.some((component) => component.componentType === "plan_review"),
        `${squareFootage} sq ft has no plan review`,
      ).toBe(false);
    }
  });
});

describe("Manchester minimum permit fee", () => {
  it("is charged as the shortfall and composes with the application fee", () => {
    // $1,000 of residential plumbing work at .015 is $15.00 — below the $30.00 floor — so
    // the floor is charged in full. With the $25.00 application fee added, the total is
    // $55.00, which is the figure the City's own plumbing form prints.
    const result = calculatePermitFees(
      { asOf, valuationCents: 100_000, custom: {} },
      rulesFor("plumbing"),
    );

    expect(result.totalCents).toBe(5_500);
    expect(money(result.totalCents)).toBe("$55.00");
  });

  it("is not charged once the permit fee clears it", () => {
    const result = calculatePermitFees(
      { asOf, valuationCents: 100_000, units: 1, custom: { new_residential_dwelling: true } },
      rulesFor("plumbing"),
    );

    expect(result.appliedRuleIds).not.toContain("PLUMB-MINIMUM-PERMIT");
    expect(result.totalCents).toBe(17_500); // $150 + $25
  });
});

describe("Manchester electrical permits", () => {
  it("prices a new residential installation by the dwelling unit", () => {
    // $100 for the first unit and $75 for each one after it, so three units are $250
    // rather than $300 — a base with an allowance, not a flat rate per unit.
    expect(
      totalFor("electrical", { units: 3, custom: { new_residential_dwelling: true } }),
    ).toBe(27_500);
  });

  it("prices residential alterations at .01 and commercial work at .015", () => {
    expect(
      totalFor("electrical", { valuationCents: 3_000_000, custom: { residential_alteration: true } }),
    ).toBe(32_500); // $300 + $25
    expect(totalFor("electrical", { valuationCents: 3_000_000, custom: { commercial_work: true } })).toBe(
      47_500,
    ); // $450 + $25
  });

  it("prices low voltage in the three published bands", () => {
    const bands: Array<[number, number]> = [
      // $1,500 of cost is the $10.00 band, but $10.00 is below the $30.00 minimum permit
      // fee, so the permit is $30.00 + $25.00 = $55.00 — the figure the City's own form
      // prints as its floor.
      [150_000, 5_500],
      [1_000_000, 10_000], // $10,000 of cost → $75 + $25
      [4_000_000, 22_500], // $40,000 of cost → 0.005 × 40,000 = $200 + $25
    ];

    for (const [valuationCents, expected] of bands) {
      expect(
        totalFor("electrical", { valuationCents, custom: { low_voltage: true } }),
        `$${valuationCents / 100} of cost`,
      ).toBe(expected);
    }
  });

  it("charges exactly one low-voltage band, and only for low-voltage work", () => {
    const lv = calculatePermitFees(
      { asOf, valuationCents: 4_000_000, custom: { low_voltage: true } },
      rulesFor("electrical"),
    );
    const lvComponents = lv.components.filter((component) => component.code.startsWith("ELEC-LV"));

    expect(lvComponents).toHaveLength(1);

    const commercial = calculatePermitFees(
      { asOf, valuationCents: 4_000_000, custom: { commercial_work: true } },
      rulesFor("electrical"),
    );
    expect(commercial.components.some((component) => component.code.startsWith("ELEC-LV"))).toBe(
      false,
    );
  });
});

describe("Manchester plumbing permits", () => {
  it("charges $150 for a new one-unit dwelling and $100 for each additional unit", () => {
    // The unit count is the engine's `units` fact, not a jurisdiction-specific one, so it
    // is supplied top-level — and the cost in the same input changes nothing, which is the
    // point of a flat residential row.
    expect(
      totalFor("plumbing", { valuationCents: 3_500_000, units: 1, custom: { new_residential_dwelling: true } }),
    ).toBe(17_500);

    expect(
      totalFor("plumbing", { valuationCents: 3_500_000, units: 3, custom: { new_residential_dwelling: true } }),
    ).toBe(37_500); // $150 + 2 × $100 + $25
  });

  it("charges .015 of calculated cost for everything else", () => {
    expect(totalFor("plumbing", { valuationCents: 3_500_000 })).toBe(55_000); // $525 + $25
  });
});
