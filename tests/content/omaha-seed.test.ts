import { describe, expect, it } from "vitest";

import { omahaSeed } from "@/content/omaha";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Omaha, Nebraska — the data, and the arithmetic the City publishes.
 *
 * Three checks earn their place here:
 *
 *  1. **Table 43-91 closes at every seam.** Omaha's bands are chained, and unlike
 *     Houston's and Denver's, each band below produces exactly the figure the band
 *     above opens with. That is a property worth pinning, because a transcription
 *     error in one band would break exactly one seam and nothing else in the suite.
 *  2. **The City's own worked example reproduces to the cent.** Omaha publishes
 *     "$126.62 would be charged for a $10,000 deck". Table 43-91 gives $117.24 and the
 *     Planning Department's Technology and Training fee is 8% of it, which is $126.62.
 *     So this single assertion checks the valuation table *and* the surcharge *and*
 *     that the surcharge reads the permit fee rather than some other subtotal.
 *  3. **Every stored rule validates.** The rules are the single definition of the
 *     fees; a rule that does not validate is a rule the engine cannot compute.
 */

const asOf = "2026-09-25";

const money = (cents: number): string =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function rulesFor(permitTypeKey: string) {
  return omahaSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

/** The amount of the rule that actually reads the valuation, before any add-ons. */
function baseFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number | undefined {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).components.find(
    (component) => component.componentType === "base",
  )?.amountCents;
}

describe("Omaha seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(omahaSeed.state).toMatchObject({ code: "NE", slug: "nebraska", fipsCode: "31" });
    expect(omahaSeed.county).toMatchObject({
      key: "douglas-county",
      name: "Douglas County",
      fipsCode: "31055",
    });
    expect(omahaSeed.jurisdiction).toMatchObject({
      key: "omaha",
      slug: "omaha",
      officialName: "City of Omaha",
      timezone: "America/Chicago",
      isActive: true,
    });
    expect(omahaSeed.jurisdictionPermitTypes.map((entry) => entry.permitTypeKey).sort()).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
  });

  it("defines no permit types of its own, so the shared catalogue is not duplicated", () => {
    expect(omahaSeed.permitTypes).toEqual([]);
    expect(omahaSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(omahaSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(omahaSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of omahaSeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(true);
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), `unknown source ${entry.rule.sourceId}`).toBe(true);
      }
      const validation = validateFeeRule(entry.rule);
      expect(validation.ok, `${entry.rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
        true,
      );
    }

    for (const schedule of omahaSeed.feeSchedules) {
      if (schedule.sourceKey !== null) {
        expect(sourceKeys.has(schedule.sourceKey), `schedule cites ${schedule.sourceKey}`).toBe(true);
      }
    }
  });

  it("publishes three pages that each clear the editorial gate", () => {
    const published = omahaSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );
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
        sourceCount: omahaSeed.sources.length,
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

describe("Omaha Table 43-91", () => {
  /**
   * Six handovers. The valuation in each row is a band's own top; the expected figure
   * is what the *next* band opens with. Identical numbers mean the table chains.
   */
  const seams: Array<[number, number]> = [
    [2_000, 4_100],
    [25_000, 26_019],
    [50_000, 42_119],
    [100_000, 58_069],
    [500_000, 169_269],
    [1_000_000, 287_769],
  ];

  it("closes at every band handover", () => {
    for (const [valuation, expectedCents] of seams) {
      const result = calculatePermitFees(
        { asOf, valuationCents: valuation * 100 },
        rulesFor("building"),
      );
      const base = result.components.find((component) => component.componentType === "base");
      expect(base?.amountCents, `$${valuation.toLocaleString("en-US")}`).toBe(expectedCents);
    }
  });

  it("charges a whole additional $1,000 for a fraction of one", () => {
    // The table says "or fraction thereof", so one cent past a boundary buys an
    // increment. At $100,000 the fifth band ends at $580.69; at $100,000.01 the sixth
    // opens there and adds $2.78. Compared on the valuation rule's own amount, so the
    // Technology and Training fee does not obscure the step.
    expect(money(baseFor("building", { valuationCents: 10_000_000 }) ?? 0)).toBe("$580.69");
    expect(money(baseFor("building", { valuationCents: 10_000_001 }) ?? 0)).toBe("$583.47");
  });

  it("reproduces the City's own published deck example to the cent", () => {
    // "a permit fee of $126.62 would be charged for a $10,000 deck" = Table 43-91's
    // $117.24 plus the 8% Technology and Training fee.
    expect(money(totalFor("building", { valuationCents: 1_000_000 }))).toBe("$126.62");
  });

  it("charges plan review at 25% only when plans are reviewed", () => {
    const withReview = calculatePermitFees(
      { asOf, valuationCents: 25_000_000, custom: { plan_review: true } },
      rulesFor("building"),
    );
    const review = withReview.components.find((component) => component.componentType === "plan_review");

    expect(review?.amountCents).toBe(24_942); // 25% of $997.69
    expect(withReview.totalCents).toBe(129_711); // $997.69 + $249.42 + $50.00 tech

    const withoutReview = calculatePermitFees({ asOf, valuationCents: 25_000_000 }, rulesFor("building"));
    expect(
      withoutReview.components.some((component) => component.componentType === "plan_review"),
    ).toBe(false);
  });

  it("caps the Technology and Training fee in its three published bands", () => {
    // A $3,000 valuation is $50.53 of permit fee, so the 8% band applies.
    expect(money(totalFor("building", { valuationCents: 300_000 }))).toBe("$54.57");
    // A $250,000 valuation is $997.69, so the flat $50 band applies.
    expect(money(totalFor("building", { valuationCents: 25_000_000 }))).toBe("$1,047.69");
  });
});

describe("Omaha trade permits", () => {
  it("prices commercial electrical work per circuit and per service", () => {
    const result = calculatePermitFees(
      {
        asOf,
        custom: {
          electrical_scope: "commercial",
          service_type: "new",
          amperage: 200,
          circuits: 30,
          temporary_pole: true,
        },
      },
      rulesFor("electrical"),
    );

    expect(result.totalCents).toBe(11_000); // $25 + 30 x $2 + $25
  });

  it("prices new residential electrical work by area", () => {
    const result = calculatePermitFees(
      { asOf, squareFootage: 2_000, custom: { electrical_scope: "new_residential" } },
      rulesFor("electrical"),
    );

    expect(result.totalCents).toBe(12_000); // 2,000 sq ft x $0.06
  });

  it("charges the electrical minimum only when the subtotal falls below it", () => {
    const small = calculatePermitFees(
      { asOf, custom: { electrical_scope: "commercial", circuits: 1 } },
      rulesFor("electrical"),
    );
    expect(small.totalCents).toBe(2_500); // $2.00 of work, floored at $25.00
  });

  it("prices plumbing per fixture, water heater and backflow device", () => {
    const result = calculatePermitFees(
      { asOf, fixtures: 12, custom: { heaters: 1, backflow_devices: 2 } },
      rulesFor("plumbing"),
    );

    expect(result.totalCents).toBe(12_605); // 12 x $7.95 + $7.95 + 2 x $11.35
  });

  it("floors a small plumbing permit at $22.70", () => {
    expect(totalFor("plumbing", { fixtures: 1 })).toBe(2_270);
  });
});
