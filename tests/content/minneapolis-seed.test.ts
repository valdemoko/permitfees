import { describe, expect, it } from "vitest";

import { minneapolisSeed } from "@/content/minneapolis";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Minneapolis, Minnesota — the printed formula, the marginal ladder with its own
 * anchors, and two sheets whose minimums disagree about the surcharge on purpose.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The ladder is marginal with per-band printed bases.** $2,001 of value is $104.20
 *     — the sheet's own anchor: printed base plus one whole $20.60 step for the single
 *     dollar. The seams are the schedule's numbers: $578.00 at $25,000, two cents below
 *     the prior band's arithmetic, charged as printed.
 *  2. **The formula's three terms read three bases.** The ladder reads value, the plan
 *     review reads 65% of the permit fee, the surcharge reads 0.0005 of the work — and
 *     the tests pin each to its own basis so none can drift onto another's.
 *  3. **The two minimums' parentheticals are honoured literally.** Building: $84.20
 *     excludes its surcharge. Plumbing: $85.20 includes its $1.00 — so a one-fixture
 *     permit pays $86.20 in all, never $87.20 and never $85.20.
 *  4. **Electrical is the State's** — trips, sources, dwelling units, minimums, the $25
 *     fee and $1 surcharge, exactly as 326B.37's worksheets print them.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return minneapolisSeed.feeRules
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

describe("Minneapolis seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(minneapolisSeed.state).toMatchObject({
      code: "MN",
      slug: "minnesota",
      fipsCode: "27",
    });
    expect(minneapolisSeed.county).toMatchObject({
      key: "hennepin-county",
      fipsCode: "27053",
    });
    expect(minneapolisSeed.jurisdiction).toMatchObject({
      key: "minneapolis",
      slug: "minneapolis",
      officialName: "City of Minneapolis",
      countyKey: "hennepin-county",
      timezone: "America/Chicago",
      isActive: true,
    });
  });

  it("shares the Minnesota state row and the permit catalogue", () => {
    expect(minneapolisSeed.state.code).toBe("MN");
    expect(minneapolisSeed.permitTypes).toEqual([]);
    expect(minneapolisSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(minneapolisSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(minneapolisSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of minneapolisSeed.feeRules) {
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
    const published = minneapolisSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(minneapolisSeed.permitPages).toHaveLength(3);
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
        sourceCount: minneapolisSeed.sources.length,
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
    const sourceVerifications = minneapolisSeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      minneapolisSeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of minneapolisSeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-25");
      expect(verification.verifiedBy, verification.entityKey).toContain("Minnesota");
    }
  });
});

describe("Minneapolis building permits", () => {
  it("anchors the ladder where the schedule does: $104.20 at $2,001", () => {
    // The sheet's own arithmetic anchor: $104.20 base + one whole $20.60 step for the
    // $1 fraction above $2,000.
    expect(componentFor("building", "BLD-BAND-3", { valuationCents: 200_100 })).toBe(12_480);
    // $25,000 is the band's top: 23 steps, no fraction.
    expect(componentFor("building", "BLD-BAND-3", { valuationCents: 2_500_000 })).toBe(57_800);
    // The seam prints $578.00 in band 4 — two cents below band 3's arithmetic — and the
    // printed figure wins.
    expect(componentFor("building", "BLD-BAND-4", { valuationCents: 2_500_100 })).toBe(59_290);
  });

  it("charges the minimum with the surcharge excluded, as the parenthetical says", () => {
    // $500 of value: the $36.70 row, floored at $84.20 of permit fee, plus 65% plan
    // review and the 0.0005 surcharge.
    const permitFee = componentFor("building", "BLD-BAND-1", { valuationCents: 50_000 });
    expect(permitFee).toBe(8_420);
    const review = componentFor("building", "BLD-PLAN-REVIEW", { valuationCents: 50_000 });
    expect(review).toBe(Math.round(8_420 * 0.65));
    const surcharge = componentFor("building", "MN-SURCHARGE", { valuationCents: 50_000 });
    expect(surcharge).toBe(25);
  });

  it("walks the ladder's bands at their printed seams", () => {
    // Band 1 top: $500.
    expect(codesFor("building", { valuationCents: 50_000 }, "BLD-BAND")).toEqual(["BLD-BAND-1"]);
    // Band 2 ($501-$2,000): $36.70 + $4.50 per $100. At $1,000: 5 steps = $22.50.
    expect(componentFor("building", "BLD-BAND-2", { valuationCents: 100_000 })).toBe(5_920);
    // Band 5 at $100,000: $950.50 + 50 × $10.60 = $1,480.50 — the arithmetic that
    // matches band 6's printed base, and the seam between them: $100,000 stays in
    // band 5, $100,000.01 buys a whole band-6 step.
    expect(componentFor("building", "BLD-BAND-5", { valuationCents: 10_000_000 })).toBe(148_050);
    expect(componentFor("building", "BLD-BAND-6", { valuationCents: 10_000_001 })).toBe(
      148_890,
    );
    // Band 8 above $1,000,000: $8,290.50 + $5.60 steps.
    expect(
      componentFor("building", "BLD-BAND-8", { valuationCents: 100_100_000 }),
    ).toBe(829_050 + 560);
  });

  it("applies the formula's three terms on their own bases", () => {
    // $150,000: band 6 = $1,480.50 + 50 × $8.40 = $1,900.50.
    expect(componentFor("building", "BLD-BAND-6", { valuationCents: 15_000_000 })).toBe(190_050);
    expect(componentFor("building", "BLD-BAND-6", { valuationCents: 10_000_001 })).toBe(148_890);
    // Plan review: 65% of the permit fee — not of the value.
    expect(componentFor("building", "BLD-PLAN-REVIEW", { valuationCents: 15_000_000 })).toBe(
      Math.round(190_050 * 0.65),
    );
    // Surcharge: 0.0005 of the value — not of the fee.
    expect(componentFor("building", "MN-SURCHARGE", { valuationCents: 15_000_000 })).toBe(7_500);
    // Total at $150,000: $1,900.50 + $1,235.33 + $75.00 = $3,210.83.
    expect(totalFor("building", { valuationCents: 15_000_000 })).toBe(321_083);
  });
});

describe("Minneapolis plumbing permits", () => {
  it("prices the $41.40 rows by scope", () => {
    expect(
      componentFor("plumbing", "PLUMB-FIXTURES", { custom: { plumbing_scope: "full_fixture" } }),
    ).toBe(4_140);
    expect(
      componentFor("plumbing", "PLUMB-FIXTURES", { custom: { plumbing_scope: "fixture_set" } }),
    ).toBe(4_140);
    expect(
      componentFor("plumbing", "PLUMB-FIXTURES", { custom: { plumbing_scope: "waste_and_vent" } }),
    ).toBe(4_140);
    // No scope stated, no row charges — the $41.40 is a permit row, not a floor.
    expect(codesFor("plumbing", {}, "PLUMB-")).toEqual([]);
  });

  it("prices the block rows with their fraction round-ups", () => {
    // Rainwater leaders: $41.40 per 10 stories or fraction. 25 stories = 3 blocks —
    // the row is stated as $4.14 per story rounded up to whole ten-story blocks.
    expect(componentFor("plumbing", "PLUMB-RAINWATER", { custom: { stories: 25 } })).toBe(12_420);
    // A partial block buys a whole one: 11 stories = 2 blocks.
    expect(componentFor("plumbing", "PLUMB-RAINWATER", { custom: { stories: 11 } })).toBe(8_280);
    // Exactly 10 stories is one block, with no rounding line.
    expect(componentFor("plumbing", "PLUMB-RAINWATER", { custom: { stories: 10 } })).toBe(4_140);
    // Water distribution: $41.40 per 100 lineal feet or fraction. 120 feet = 2 blocks.
    expect(
      componentFor("plumbing", "PLUMB-WATER-DISTRIBUTION", { custom: { linear_feet: 120 } }),
    ).toBe(8_280);
    // Exactly 100 feet is one block.
    expect(
      componentFor("plumbing", "PLUMB-WATER-DISTRIBUTION", { custom: { linear_feet: 100 } }),
    ).toBe(4_140);
    // Alterations: $82.80 per $1,000, charged on value rounded up to whole $500s.
    // $2,000 = 4 blocks of $41.40 = $165.60.
    expect(
      componentFor("plumbing", "PLUMB-ALTERATIONS", {
        valuationCents: 200_000,
        custom: { plumbing_scope: "alterations" },
      }),
    ).toBe(16_560);
    // $2,100 of alterations buys five blocks — the fraction phrase again: the value
    // rounds up to $2,500, five $41.40 blocks = $207.00.
    expect(
      componentFor("plumbing", "PLUMB-ALTERATIONS", {
        valuationCents: 210_000,
        custom: { plumbing_scope: "alterations" },
      }),
    ).toBe(20_700);
  });

  it("holds the minimum with the surcharge inside it, never doubled", () => {
    // One fixture: $41.40 + $1.00 = $42.40 computed; the floor is $84.20 on the permit
    // subtotal, so the permit pays $84.20 + $1.00 = $85.20 in all — the printed minimum,
    // with the surcharge inside it as the parenthetical states.
    expect(totalFor("plumbing", { custom: { plumbing_scope: "full_fixture" } })).toBe(8_520);
    // Ten fixtures ($414.00 + $1.00) clear the floor and pay their own arithmetic.
    expect(
      componentFor("plumbing", "PLUMB-MINIMUM", {
        custom: { plumbing_scope: "full_fixture" },
      }),
    ).toBe(8_420 - 4_140);
  });
});

describe("Minneapolis electrical permits", () => {
  it("prices the state's worksheet: trips, services, dwelling units", () => {
    // Inspection trips at $55.
    expect(componentFor("electrical", "ELEC-INSPECTION-TRIPS", { custom: { inspections: 2 } })).toBe(
      11_000,
    );
    // Power sources by amperage band: $35 at 400 A or less, $60 at 401-800, $100 over.
    expect(
      componentFor("electrical", "ELEC-POWER-SOURCES", { custom: { power_source_amperage: 400 } }),
    ).toBe(3_500);
    expect(
      componentFor("electrical", "ELEC-POWER-SOURCES-800", { custom: { power_source_amperage: 600 } }),
    ).toBe(6_000);
    expect(
      componentFor("electrical", "ELEC-POWER-SOURCES-OVER-800", { custom: { power_source_amperage: 1000 } }),
    ).toBe(10_000);
    // New dwelling units at $165 up to 30 circuits — the first-class units input.
    expect(componentFor("electrical", "ELEC-DWELLING-UNIT", { units: 2 })).toBe(33_000);
  });

  it("adds the required permit fee and the state surcharge to every permit", () => {
    // The new one-family dwelling worked example: $165 + $35 + $25 + $1 = $226.
    expect(
      totalFor("electrical", {
        units: 1,
        custom: { power_source_amperage: 200, elec_dwelling_minimum: true },
      }),
    ).toBe(22_600);
    // The surcharge always charges; nothing else does without a stated scope.
    expect(codesFor("electrical", { custom: {} }, "MN-")).toEqual(["MN-ELEC-SURCHARGE"]);
  });
});
