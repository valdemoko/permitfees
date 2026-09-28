import { describe, expect, it } from "vitest";

import { indianapolisSeed } from "@/content/indianapolis";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Indianapolis, Indiana — the schedule published as a spreadsheet, whose Permits sheet states
 * its own mechanism in its header row: a structural permit is application + review + issuance,
 * and a craft permit is one figure.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The three components stack.** Every structural subtype is $40.00 of application fee
 *     plus a review plus an issuance, and the subtype is what selects the last two.
 *  2. **The subtype changes the price of the same square footage.** 3,000 square feet of new
 *     Class 2 primary structure is $1,215.00 and 3,000 square feet of accessory structure is
 *     $565.00, asserted side by side.
 *  3. **The commercial remodel is bracketed below $2,500 and rate-based above it**, with the
 *     two rules continuous at the seam.
 *  4. **Craft permits are one figure each, and the two block sizes differ.** Electrical new
 *     installation and repair both carry $23.00, but one steps per 1,000 square feet and the
 *     other per 500 — asserted at the same area to show the difference.
 *  5. **The commercial plumbing row prices a block, not a fixture.** $23.00 per additional five
 *     fixtures means eleven fixtures is one block and sixteen is two.
 */

const asOf = "2026-09-26";

function rulesFor(permitTypeKey: string) {
  return indianapolisSeed.feeRules
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

describe("Indianapolis seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(indianapolisSeed.state).toMatchObject({
      code: "IN",
      slug: "indiana",
      fipsCode: "18",
    });
    expect(indianapolisSeed.county).toMatchObject({
      key: "marion-county",
      name: "Marion County",
      fipsCode: "18097",
    });
    expect(indianapolisSeed.jurisdiction).toMatchObject({
      key: "indianapolis",
      slug: "indianapolis",
      officialName: "City of Indianapolis",
      countyKey: "marion-county",
      timezone: "America/Indiana/Indianapolis",
      isActive: true,
    });
  });

  it("shares the Indiana state row and the permit catalogue", () => {
    expect(indianapolisSeed.state.code).toBe("IN");
    expect(indianapolisSeed.permitTypes).toEqual([]);
    expect(indianapolisSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(indianapolisSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(indianapolisSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of indianapolisSeed.feeRules) {
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

  it("references every source a FAQ cites", () => {
    const sourceKeys = new Set(indianapolisSeed.sources.map((source) => source.key));
    for (const page of indianapolisSeed.permitPages) {
      for (const faq of page.faqs ?? []) {
        if (faq.sourceId) {
          expect(sourceKeys.has(faq.sourceId), `${page.slug}: ${faq.sourceId}`).toBe(true);
        }
      }
    }
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = indianapolisSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(indianapolisSeed.permitPages).toHaveLength(3);
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
        sourceCount: indianapolisSeed.sources.length,
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
    const sourceVerifications = indianapolisSeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      indianapolisSeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of indianapolisSeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-26");
      expect(verification.verifiedBy, verification.entityKey).toContain("Indiana");
    }
  });

  it("dates every rule to the schedule's own stamp", () => {
    for (const entry of indianapolisSeed.feeRules) {
      expect(entry.rule.effectiveFrom, entry.rule.code).toBe("2026-01-05");
    }
  });
});

describe("Indianapolis building permits", () => {
  it("stacks the $40 application fee on every structural permit, and only with a subtype", () => {
    expect(
      componentFor("building", "BLD-APPLICATION", {
        squareFootage: 2_000,
        custom: { structural_scope: "residential_primary_new" },
      }),
    ).toBe(4_000);
    // A subtype is what the sheet reads; without one nothing is charged.
    expect(totalFor("building", { squareFootage: 2_000 })).toBe(0);
  });

  it("prices a new Class 2 primary structure in its three printed components", () => {
    const scope = { structural_scope: "residential_primary_new" as const };
    // $175 and $750 up to 2,000 square feet.
    expect(componentFor("building", "BLD-REVIEW-NEW-PRIMARY", { squareFootage: 2_000, custom: scope }))
      .toBe(17_500);
    expect(componentFor("building", "BLD-ISSUE-NEW-PRIMARY", { squareFootage: 2_000, custom: scope }))
      .toBe(75_000);
    expect(totalFor("building", { squareFootage: 2_000, custom: scope })).toBe(96_500);
    // 3,000 square feet is two 500-square-foot blocks above the allowance.
    expect(componentFor("building", "BLD-REVIEW-NEW-PRIMARY", { squareFootage: 3_000, custom: scope }))
      .toBe(22_500);
    expect(componentFor("building", "BLD-ISSUE-NEW-PRIMARY", { squareFootage: 3_000, custom: scope }))
      .toBe(95_000);
    expect(totalFor("building", { squareFootage: 3_000, custom: scope })).toBe(121_500);
  });

  it("makes the subtype change the price of the same square footage", () => {
    const size = 3_000;
    expect(
      totalFor("building", {
        squareFootage: size,
        custom: { structural_scope: "residential_primary_new" },
      }),
    ).toBe(121_500);
    expect(
      totalFor("building", {
        squareFootage: size,
        custom: { structural_scope: "residential_accessory_new" },
      }),
    ).toBe(69_000);
  });

  it("prices the six residential subtypes at their printed figures", () => {
    const at1000 = (scope: string) =>
      totalFor("building", { squareFootage: 1_000, custom: { structural_scope: scope } });
    expect(at1000("residential_primary_addition")).toBe(59_000);
    expect(at1000("residential_accessory_new")).toBe(49_000);
    expect(at1000("residential_accessory_addition")).toBe(39_000);
    expect(at1000("residential_remodel")).toBe(39_000);
    expect(at1000("residential_misc")).toBe(29_000);
    // The 3,000-square-foot remodel: $150 + 4 × $25 of review, $200 + 4 × $50 of issuance.
    expect(
      totalFor("building", {
        squareFootage: 3_000,
        custom: { structural_scope: "residential_remodel" },
      }),
    ).toBe(4_000 + 25_000 + 40_000);
  });

  it("charges all three Class 1 subtypes the flat $200 plan review", () => {
    for (const scope of ["commercial_new", "commercial_remodel", "commercial_misc"]) {
      expect(
        componentFor("building", "BLD-REVIEW-COMM-NEW", {
          squareFootage: 1_500,
          custom: { structural_scope: scope },
        }),
      ).toBe(20_000);
    }
  });

  it("brackets the commercial remodel below $2,500 and rates it above, continuously", () => {
    const scope = { structural_scope: "commercial_remodel" as const };
    expect(componentFor("building", "BLD-ISSUE-COMM-REMODEL-CLOSED", { squareFootage: 999, custom: scope }))
      .toBe(35_000);
    expect(componentFor("building", "BLD-ISSUE-COMM-REMODEL-CLOSED", { squareFootage: 1_000, custom: scope }))
      .toBe(75_000);
    expect(componentFor("building", "BLD-ISSUE-COMM-REMODEL-CLOSED", { squareFootage: 2_500, custom: scope }))
      .toBe(75_000);
    // Above 2,500 the open rate takes over: $750.00 + $150 per additional 1,000.
    expect(componentFor("building", "BLD-ISSUE-COMM-REMODEL-OPEN", { squareFootage: 3_500, custom: scope }))
      .toBe(90_000);
    expect(codesFor("building", { squareFootage: 3_500, custom: scope }, "BLD-ISSUE-COMM")).toEqual([
      "BLD-ISSUE-COMM-REMODEL-OPEN",
    ]);
    expect(codesFor("building", { squareFootage: 2_500, custom: scope }, "BLD-ISSUE-COMM")).toEqual([
      "BLD-ISSUE-COMM-REMODEL-CLOSED",
    ]);
  });

  it("prices the commercial new structure and the two flat rows", () => {
    const scope = { structural_scope: "commercial_new" as const };
    expect(componentFor("building", "BLD-ISSUE-COMM-NEW", { squareFootage: 2_500, custom: scope }))
      .toBe(100_000);
    expect(componentFor("building", "BLD-ISSUE-COMM-NEW", { squareFootage: 4_500, custom: scope }))
      .toBe(130_000);
    expect(totalFor("building", { squareFootage: 4_500, custom: scope })).toBe(154_000);
    expect(
      componentFor("building", "BLD-ISSUE-MISC-COMM", {
        squareFootage: 1_000,
        custom: { structural_scope: "commercial_misc" },
      }),
    ).toBe(17_500);
  });
});

describe("Indianapolis electrical permits", () => {
  it("prices one figure per subtype, with nothing stacked on it", () => {
    expect(
      totalFor("electrical", {
        squareFootage: 2_500,
        custom: { electrical_scope: "installation_new" },
      }),
    ).toBe(20_200);
    expect(
      totalFor("electrical", { custom: { electrical_scope: "reconnection" } }),
    ).toBe(8_900);
    expect(
      totalFor("electrical", { custom: { electrical_scope: "manufactured_home" } }),
    ).toBe(49_800);
    expect(
      totalFor("electrical", { custom: { electrical_scope: "general_service" } }),
    ).toBe(8_900);
    // The self-certification row prints $22 with no unit, so it is charged once under its scope.
    expect(
      totalFor("electrical", { custom: { electrical_scope: "self_certification_tags" } }),
    ).toBe(2_200);
    expect(
      codesFor("electrical", { custom: { electrical_scope: "manufactured_home" } }, "ELEC-"),
    ).toEqual(["ELEC-MANUFACTURED-HOME"]);
  });

  it("keeps the two block sizes apart behind the same $23.00 rate", () => {
    // New installation: 1,000 square feet over a 2,500 allowance is one $23 block.
    expect(
      totalFor("electrical", {
        squareFootage: 3_500,
        custom: { electrical_scope: "installation_new" },
      }),
    ).toBe(22_500);
    // Repair: the same 1,000 square feet is two $23 blocks over a 1,000 allowance.
    expect(
      totalFor("electrical", {
        squareFootage: 2_000,
        custom: { electrical_scope: "repair_residential" },
      }),
    ).toBe(21_500);
    expect(
      totalFor("electrical", {
        squareFootage: 3_500,
        custom: { electrical_scope: "repair_residential" },
      }),
    ).toBe(28_400);
  });

  it("prices the appliance row's three figures and its 10,000-square-foot allowance", () => {
    expect(
      totalFor("electrical", { squareFootage: 10_000, custom: { electrical_scope: "space_heating" } }),
    ).toBe(14_600);
    expect(
      totalFor("electrical", { squareFootage: 12_500, custom: { electrical_scope: "space_heating" } }),
    ).toBe(16_900);
    expect(
      totalFor("electrical", { squareFootage: 10_000, custom: { electrical_scope: "space_cooling" } }),
    ).toBe(14_600);
    // Both installed together is $178.00, not twice $146.00.
    expect(
      totalFor("electrical", {
        squareFootage: 10_000,
        custom: { electrical_scope: "space_heating_cooling" },
      }),
    ).toBe(17_800);
    expect(
      codesFor(
        "electrical",
        { squareFootage: 10_000, custom: { electrical_scope: "space_heating_cooling" } },
        "ELEC-",
      ),
    ).toEqual(["ELEC-SPACE-HEATING-COOLING"]);
  });
});

describe("Indianapolis plumbing permits", () => {
  it("prices the two residential rows with different allowances on the same block", () => {
    expect(
      totalFor("plumbing", {
        squareFootage: 2_500,
        custom: { plumbing_scope: "new_residential" },
      }),
    ).toBe(18_500);
    expect(
      totalFor("plumbing", {
        squareFootage: 3_000,
        custom: { plumbing_scope: "new_residential" },
      }),
    ).toBe(20_800);
    expect(
      totalFor("plumbing", {
        squareFootage: 1_000,
        custom: { plumbing_scope: "repair_residential" },
      }),
    ).toBe(15_300);
    // A 3,000-square-foot remodel is four blocks, $245.00 — more than the new house.
    expect(
      totalFor("plumbing", {
        squareFootage: 3_000,
        custom: { plumbing_scope: "repair_residential" },
      }),
    ).toBe(24_500);
  });

  it("prices the commercial row by the five-fixture block rather than by the fixture", () => {
    const scope = { plumbing_scope: "commercial" as const };
    expect(totalFor("plumbing", { fixtures: 10, custom: scope })).toBe(18_200);
    expect(totalFor("plumbing", { fixtures: 11, custom: scope })).toBe(20_500);
    expect(totalFor("plumbing", { fixtures: 15, custom: scope })).toBe(20_500);
    expect(totalFor("plumbing", { fixtures: 16, custom: scope })).toBe(22_800);
    expect(totalFor("plumbing", { fixtures: 20, custom: scope })).toBe(22_800);
    // One fixture over a block boundary buys the whole block, never a per-fixture charge.
    expect(componentFor("plumbing", "PLUMB-COMMERCIAL", { fixtures: 11, custom: scope })).toBe(
      20_500,
    );
  });

  it("prices the reconnection and the general-service rows", () => {
    expect(
      componentFor("plumbing", "PLUMB-RECONNECTION", {
        custom: { plumbing_scope: "reconnection" },
      }),
    ).toBe(13_400);
    expect(
      componentFor("plumbing", "PLUMB-GENERAL-SERVICE", {
        custom: { plumbing_scope: "general_service" },
      }),
    ).toBe(8_900);
    // The two rows are selected by scope and never stack.
    expect(
      codesFor("plumbing", { custom: { plumbing_scope: "reconnection" } }, "PLUMB-"),
    ).toEqual(["PLUMB-RECONNECTION"]);
  });
});
