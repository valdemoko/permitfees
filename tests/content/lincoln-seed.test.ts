import { describe, expect, it } from "vitest";

import { lincolnSeed } from "@/content/lincoln";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Lincoln, Nebraska — the data, the arithmetic, and the table that made a third page possible.
 *
 * The checks that matter:
 *
 *  1. **Table 1A closes at both handovers.** $127.00 at $10,000 and $202.00 at $25,000
 *     are each what the row below produces at its own top.
 *  2. **Plan review is 65% with a $100 floor and is not charged to a house.** Sec.
 *     109.2.1 applies it to commercial buildings, accessory buildings and apartments,
 *     and makes the floor a floor on the review fee rather than on the permit.
 *  3. **The fuel-gas table is a base with an allowance, not a per-outlet rate.** Sec.
 *     24.05.380 charges $25.00 for the first five outlets and $1.00 each after that, so
 *     eight outlets is $28.00. Reading it as $1.00 per outlet would charge $33.00.
 *  4. **The four gas rows are alternatives.** A work type and an outlet count together
 *     must produce one component, not two.
 *  5. **The unpriced fees stay unpriced.** Lincoln publishes no plumbing fee and no HVAC
 *     mechanical fee, and a test that pins that keeps a later reader from "fixing" the
 *     absence by inventing an amount. The mechanical page prices the gas rows and says
 *     which half of its subject the code does not price.
 */

const asOf = "2026-09-25";

const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

function rulesFor(permitTypeKey: string) {
  return lincolnSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

function baseFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number | undefined {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).components.find(
    (component) => component.componentType === "base",
  )?.amountCents;
}

describe("Lincoln seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(lincolnSeed.state).toMatchObject({ code: "NE", slug: "nebraska", fipsCode: "31" });
    expect(lincolnSeed.county).toMatchObject({
      key: "lancaster-county",
      name: "Lancaster County",
      fipsCode: "31109",
    });
    expect(lincolnSeed.jurisdiction).toMatchObject({
      key: "lincoln",
      slug: "lincoln",
      officialName: "City of Lincoln",
      timezone: "America/Chicago",
      isActive: true,
    });
  });

  it("shares the Nebraska state row with Omaha rather than defining its own", () => {
    expect(lincolnSeed.state.code).toBe("NE");
    expect(lincolnSeed.state.slug).toBe("nebraska");
    expect(lincolnSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(lincolnSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(lincolnSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of lincolnSeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(true);
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), `unknown source ${entry.rule.sourceId}`).toBe(true);
      }
      const validation = validateFeeRule(entry.rule);
      expect(validation.ok, `${entry.rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
        true,
      );
    }
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = lincolnSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(lincolnSeed.permitPages).toHaveLength(3);
    expect(published.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "mechanical-permit-cost",
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
        sourceCount: lincolnSeed.sources.length,
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

describe("Lincoln Table 1A", () => {
  it("closes at both handovers", () => {
    expect(money(baseFor("building", { valuationCents: 1_000_000 }) ?? 0)).toBe("$127.00");
    expect(money(baseFor("building", { valuationCents: 2_500_000 }) ?? 0)).toBe("$202.00");
  });

  it("charges a flat $55.00 up to $1,000 of valuation", () => {
    expect(totalFor("building", { valuationCents: 100_000 })).toBe(5_500);
  });

  it("charges a fraction of a thousand as a whole one", () => {
    // $10,000.01 leaves the second row for the third, which opens at $127.00 and adds
    // $5.00 for the fraction of a thousand.
    expect(totalFor("building", { valuationCents: 1_000_001 })).toBe(13_200);
  });
});

describe("Lincoln plan review", () => {
  it("is 65% of the permit fee when that is more than $100", () => {
    const result = calculatePermitFees(
      { asOf, valuationCents: 25_000_000, custom: { plan_review: true } },
      rulesFor("building"),
    );
    const review = result.components.find((component) => component.componentType === "plan_review");

    expect(review?.amountCents).toBe(42_380); // 65% of $652.00
    expect(result.totalCents).toBe(107_580);
  });

  it("floors the review fee at $100 even when 65% of the permit fee is smaller", () => {
    const result = calculatePermitFees(
      { asOf, valuationCents: 500_000, custom: { plan_review: true } },
      rulesFor("building"),
    );
    const review = result.components.find((component) => component.componentType === "plan_review");

    expect(review?.amountCents).toBe(10_000);
  });

  it("is not charged unless plans are reviewed", () => {
    const result = calculatePermitFees({ asOf, valuationCents: 25_000_000 }, rulesFor("building"));
    expect(result.components.some((component) => component.componentType === "plan_review")).toBe(
      false,
    );
  });
});

describe("Lincoln fuel-gas permits — Sec. 24.05.380", () => {
  it("charges $25.00 for one to five outlets, not a dollar an outlet", () => {
    expect(totalFor("mechanical", { custom: { outlets: 1 } })).toBe(2_500);
    expect(totalFor("mechanical", { custom: { outlets: 5 } })).toBe(2_500);
  });

  it("charges $1.00 for each outlet after the fifth", () => {
    expect(totalFor("mechanical", { custom: { outlets: 6 } })).toBe(2_600);
    expect(totalFor("mechanical", { custom: { outlets: 8 } })).toBe(2_800);
  });

  it("prices the replacement rows and the alteration as the table prints them", () => {
    expect(
      totalFor("mechanical", { custom: { gas_work: "replacement_with_other_permit" } }),
    ).toBe(600);
    expect(totalFor("mechanical", { custom: { gas_work: "replacement_alone" } })).toBe(3_500);
    expect(totalFor("mechanical", { custom: { gas_work: "gas_piping_alteration" } })).toBe(1_500);
  });

  it("charges one row, not two, when a work type accompanies an outlet count", () => {
    const result = calculatePermitFees(
      { asOf, custom: { gas_work: "replacement_alone", outlets: 8 } },
      rulesFor("mechanical"),
    );
    expect(result.totalCents).toBe(3_500);
    expect(result.components).toHaveLength(1);
  });

  it("charges nothing for an HVAC job, because Lincoln publishes no such fee", () => {
    // The outlet row is selected but has no count to price, so nothing is charged. The
    // page says so in prose rather than letting a reader assume the gas table is a
    // mechanical schedule.
    const result = calculatePermitFees({ asOf, custom: {} }, rulesFor("mechanical"));
    expect(result.totalCents).toBe(0);
  });
});

describe("Lincoln electrical permits", () => {
  it("adds the base fee to every other row rather than crediting the first circuit", () => {
    const result = calculatePermitFees(
      { asOf, custom: { circuits: 1 } },
      rulesFor("electrical"),
    );
    expect(result.totalCents).toBe(3_600); // $30.00 base + $6.00, not $6.00
  });

  it("prices a commercial permit from the base, the circuits and the service band", () => {
    const result = calculatePermitFees(
      { asOf, custom: { service_work: true, amperage: 200, circuits: 30 } },
      rulesFor("electrical"),
    );
    expect(result.totalCents).toBe(24_000); // $30 + 30 x $6 + $30
  });

  it("selects one service band only", () => {
    const bands: Array<[number, number]> = [
      [200, 3_000],
      [400, 4_500],
      [800, 9_000],
      [2_000, 20_000],
      [2_001, 40_000],
    ];
    for (const [amperage, expected] of bands) {
      const result = calculatePermitFees(
        { asOf, custom: { service_work: true, amperage } },
        rulesFor("electrical"),
      );
      const service = result.components.find((component) => component.code.startsWith("ELEC-SERVICE"));
      expect(service?.amountCents, `${amperage} A`).toBe(expected);
    }
  });
});
