import { describe, expect, it } from "vitest";

import { nashvilleSeed } from "@/content/nashville";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Nashville / Davidson County, Tennessee — the dataset's first four-component building permit,
 * a commercial ladder with three printed seams, a plan review that turns over at $275,000, and
 * two price lists with a $75 floor.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The four components read four different things, and only one of them is the job.** The
 *     valuation fee reads the valuation, the zoning fee is charged unconditionally, the tech fee
 *     is 10% of the valuation fee, and the plan review is half the permit fee — so the test pins
 *     each to its own base and proves the $25 zoning fee is outside the 10%.
 *  2. **The ladder's printed bases win at all three seams** — $372.71 against $372.55, $651.38
 *     against $651.21, $2,326.84 against $2,327.38.
 *  3. **Residential is a different branch.** $5.00 per $1,000, no bands, and no plan review at
 *     all, because subsection G.2 exempts dwelling and townhouse permits from plans examination.
 *  4. **The plan review turns over at $275,000** — half the permit fee, then $1,338.54 plus $0.18
 *     a thousand — and its top band's base is $7.22 below the band beneath it.
 *  5. **Every $75 floor is a shortfall, never a base.** Ten outlets compute $6.00 and pay $75.00;
 *     a hot water heater computes $43.00 and pays $75.00.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return nashvilleSeed.feeRules
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

const commercial = { building_class: "commercial" } as const;

describe("Nashville seed payload", () => {
  it("identifies the jurisdiction, its state and its consolidated county", () => {
    expect(nashvilleSeed.state).toMatchObject({
      code: "TN",
      slug: "tennessee",
      fipsCode: "47",
    });
    expect(nashvilleSeed.county).toMatchObject({
      key: "davidson-county",
      name: "Davidson County",
      fipsCode: "47037",
    });
    expect(nashvilleSeed.jurisdiction).toMatchObject({
      key: "nashville",
      slug: "nashville",
      officialName: "Metropolitan Government of Nashville and Davidson County",
      countyKey: "davidson-county",
      timezone: "America/Chicago",
      isActive: true,
    });
  });

  it("shares the Tennessee state row and the permit catalogue", () => {
    expect(nashvilleSeed.state.code).toBe("TN");
    expect(nashvilleSeed.permitTypes).toEqual([]);
    expect(nashvilleSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(nashvilleSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(nashvilleSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of nashvilleSeed.feeRules) {
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
    const published = nashvilleSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(nashvilleSeed.permitPages).toHaveLength(3);
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
        sourceCount: nashvilleSeed.sources.length,
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
    const sourceVerifications = nashvilleSeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      nashvilleSeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of nashvilleSeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-25");
      expect(verification.verifiedBy, verification.entityKey).toContain("Tennessee");
    }
  });
});

describe("Nashville building permits", () => {
  it("walks the commercial ladder's printed seams", () => {
    // Band 1: $40.39 up to $2,000.
    expect(componentFor("building", "BLD-COMM-1", { valuationCents: 200_000, custom: commercial })).toBe(
      4_039,
    );
    // Band 2: $40.39 plus $6.92 a thousand, rounding up to whole thousands.
    expect(componentFor("building", "BLD-COMM-2", { valuationCents: 200_100, custom: commercial })).toBe(
      4_039 + 692,
    );
    expect(componentFor("building", "BLD-COMM-2", { valuationCents: 5_000_000, custom: commercial })).toBe(
      37_255,
    );
    // Band 3's printed base is $372.71 — sixteen cents above band 2's arithmetic at the seam.
    expect(componentFor("building", "BLD-COMM-3", { valuationCents: 5_000_100, custom: commercial })).toBe(
      37_271 + 557,
    );
    expect(componentFor("building", "BLD-COMM-3", { valuationCents: 10_000_000, custom: commercial })).toBe(
      65_121,
    );
    // Band 4's printed base is $651.38 — seventeen cents above band 3's arithmetic.
    expect(componentFor("building", "BLD-COMM-4", { valuationCents: 10_000_100, custom: commercial })).toBe(
      65_138 + 419,
    );
    expect(componentFor("building", "BLD-COMM-4", { valuationCents: 15_000_000, custom: commercial })).toBe(
      86_088,
    );
    expect(componentFor("building", "BLD-COMM-4", { valuationCents: 50_000_000, custom: commercial })).toBe(
      232_738,
    );
    // Band 5's printed base is $2,326.84 — fifty-four cents BELOW band 4's arithmetic.
    expect(componentFor("building", "BLD-COMM-5", { valuationCents: 50_000_100, custom: commercial })).toBe(
      232_684 + 279,
    );
    expect(componentFor("building", "BLD-COMM-5", { valuationCents: 100_000_000, custom: commercial })).toBe(
      372_184,
    );
    // Exactly one band charges at a time.
    expect(codesFor("building", { valuationCents: 15_000_000, custom: commercial }, "BLD-COMM")).toEqual([
      "BLD-COMM-4",
    ]);
  });

  it("prices one- and two-family dwellings and townhouses at $5.00 per $1,000", () => {
    expect(
      componentFor("building", "BLD-RESIDENTIAL", {
        valuationCents: 15_000_000,
        custom: { building_class: "one_and_two_family" },
      }),
    ).toBe(75_000);
    expect(
      componentFor("building", "BLD-RESIDENTIAL", {
        valuationCents: 15_000_000,
        custom: { building_class: "townhouse" },
      }),
    ).toBe(75_000);
    // No rate at all for the class residential explicitly excludes — multifamily.
    expect(
      componentFor("building", "BLD-RESIDENTIAL", {
        valuationCents: 15_000_000,
        custom: { building_class: "commercial" },
      }),
    ).toBeUndefined();
    expect(
      codesFor("building", { valuationCents: 15_000_000, custom: commercial }, "BLD-RESIDENTIAL"),
    ).toEqual([]);
  });

  it("charges each of the four components on its own base", () => {
    // The valuation fee: band 4 at $150,000.
    expect(componentFor("building", "BLD-COMM-4", { valuationCents: 15_000_000, custom: commercial })).toBe(
      86_088,
    );
    // The zoning examination fee: $25 on every building permit, residential included.
    expect(componentFor("building", "ZONING-EXAMINATION", { valuationCents: 15_000_000, custom: commercial })).toBe(
      2_500,
    );
    expect(
      componentFor("building", "ZONING-EXAMINATION", {
        valuationCents: 15_000_000,
        custom: { building_class: "one_and_two_family" },
      }),
    ).toBe(2_500);
    // The codes tech fee: 10% of the valuation fee, and NOT of the valuation fee plus $25 —
    // which is what making the zoning fee an `other` component guarantees.
    expect(componentFor("building", "CODES-TECH-FEE", { valuationCents: 15_000_000, custom: commercial })).toBe(
      8_609,
    );
    expect(componentFor("building", "CODES-TECH-FEE", { valuationCents: 15_000_000, custom: commercial })).toBe(
      Math.round(86_088 / 10),
    );
    // The plan review: half of the permit fee.
    expect(
      componentFor("building", "BLD-PLAN-REVIEW-HALF", { valuationCents: 15_000_000, custom: commercial }),
    ).toBe(43_044);
    // Total: the four components added.
    expect(totalFor("building", { valuationCents: 15_000_000, custom: commercial })).toBe(
      86_088 + 2_500 + 8_609 + 43_044,
    );
  });

  it("turns the plan review over at $275,000 and steps its top band down", () => {
    // At the seam the plan review is half of the permit fee: $138,463 / 2.
    expect(
      componentFor("building", "BLD-COMM-4", { valuationCents: 27_500_000, custom: commercial }),
    ).toBe(138_463);
    expect(
      componentFor("building", "BLD-PLAN-REVIEW-HALF", { valuationCents: 27_500_000, custom: commercial }),
    ).toBe(69_232);
    // One dollar of valuation later the printed band charges $1,338.54 plus one $0.18 step.
    expect(
      componentFor("building", "BLD-PLAN-REVIEW-2", { valuationCents: 27_500_100, custom: commercial }),
    ).toBe(133_854 + 18);
    expect(
      componentFor("building", "BLD-PLAN-REVIEW-HALF", { valuationCents: 27_500_100, custom: commercial }),
    ).toBeUndefined();
    // Band 2's arithmetic at $5,000,000 is $2,189.04 and band 3 prints $2,181.82.
    expect(
      componentFor("building", "BLD-PLAN-REVIEW-2", { valuationCents: 500_000_000, custom: commercial }),
    ).toBe(218_904);
    expect(
      componentFor("building", "BLD-PLAN-REVIEW-3", { valuationCents: 500_000_100, custom: commercial }),
    ).toBe(218_182 + 7);
    // And no plans examination fee ever lands on a dwelling or a townhouse (subsection G.2).
    for (const buildingClass of ["one_and_two_family", "townhouse"]) {
      expect(
        codesFor(
          "building",
          { valuationCents: 15_000_000, custom: { building_class: buildingClass } },
          "BLD-PLAN-REVIEW",
        ),
      ).toEqual([]);
    }
  });
});

describe("Nashville plumbing permits", () => {
  it("charges the $75 minimum as a shortfall, never as a base", () => {
    // A hot water heater alone: $43.00 computed, $32.00 of shortfall.
    expect(
      componentFor("plumbing", "PLUMB-WATER-HEATER", { custom: { heaters: 1 } }),
    ).toBe(4_300);
    expect(componentFor("plumbing", "PLUMB-MINIMUM", { custom: { heaters: 1 } })).toBe(3_200);
    expect(totalFor("plumbing", { custom: { heaters: 1 } })).toBe(7_500);
    // Three fixtures plus a water heater clear the floor and pay their own arithmetic.
    expect(componentFor("plumbing", "PLUMB-FIXTURE", { fixtures: 3 })).toBe(3_300);
    expect(componentFor("plumbing", "PLUMB-MINIMUM", { fixtures: 3, custom: { heaters: 1 } })).toBe(0);
    expect(totalFor("plumbing", { fixtures: 3, custom: { heaters: 1 } })).toBe(7_600);
    // No counts at all: nothing charges, not even the floor.
    expect(totalFor("plumbing", {})).toBe(0);
  });

  it("prices each infrastructure row on its own count", () => {
    expect(componentFor("plumbing", "PLUMB-BUILDING-DRAIN", { custom: { building_drains: 1 } })).toBe(
      3_200,
    );
    expect(componentFor("plumbing", "PLUMB-SEWER-CONNECTION", { custom: { connections: 1 } })).toBe(
      8_000,
    );
    expect(
      componentFor("plumbing", "PLUMB-WATER-SERVICE", {
        custom: { water_service_connections: 1 },
      }),
    ).toBe(8_000);
    expect(componentFor("plumbing", "PLUMB-SEPTIC", { custom: { septic_tanks: 1 } })).toBe(8_000);
    // Four rows, four counts: a sewer connection is never charged as a water service.
    expect(
      totalFor("plumbing", {
        custom: {
          connections: 1,
          water_service_connections: 1,
          building_drains: 1,
          septic_tanks: 1,
        },
      }),
    ).toBe(8_000 + 8_000 + 3_200 + 8_000);
  });

  it("charges the reinspection only where it is stated", () => {
    expect(codesFor("plumbing", { fixtures: 3 }, "PLUMB-REINSPECTION")).toEqual([]);
    expect(codesFor("plumbing", { fixtures: 3, custom: { reinspection: true } }, "PLUMB-REINSPECTION")).toEqual(
      ["PLUMB-REINSPECTION"],
    );
  });
});

describe("Nashville electrical permits", () => {
  it("prices ten outlets for $6.00 and each one beyond for $1.00", () => {
    expect(componentFor("electrical", "ELEC-OUTLETS", { custom: { outlets: 10 } })).toBe(600);
    expect(componentFor("electrical", "ELEC-OUTLETS", { custom: { outlets: 11 } })).toBe(700);
    expect(componentFor("electrical", "ELEC-OUTLETS", { custom: { outlets: 12 } })).toBe(800);
    // The ten-outlet allowance is included, not charged twice.
    expect(componentFor("electrical", "ELEC-OUTLETS", { custom: { outlets: 5 } })).toBe(600);
  });

  it("charges the $75 minimum as a shortfall on every small permit", () => {
    // Twelve outlets and a meter compute $20.00 and pay $75.00.
    expect(totalFor("electrical", { custom: { outlets: 12, meters: 1 } })).toBe(7_500);
    expect(componentFor("electrical", "ELEC-MINIMUM", { custom: { outlets: 12, meters: 1 } })).toBe(
      5_500,
    );
    expect(componentFor("electrical", "ELEC-SERVICE-METER", { custom: { meters: 2 } })).toBe(2_400);
    // Seventy-nine outlets compute $75.00 and the floor stops charging.
    expect(componentFor("electrical", "ELEC-MINIMUM", { custom: { outlets: 79 } })).toBe(0);
    expect(totalFor("electrical", { custom: { outlets: 79 } })).toBe(7_500);
  });

  it("prices a service release by occupancy and a reconnection on its own scope", () => {
    expect(
      componentFor("electrical", "ELEC-SERVICE-RELEASE-RES", {
        custom: {
          electrical_scope: "service_release",
          customer_class: "one_and_two_family",
          electrical_services: 1,
        },
      }),
    ).toBe(7_500);
    expect(
      componentFor("electrical", "ELEC-SERVICE-RELEASE-COM", {
        custom: {
          electrical_scope: "service_release",
          customer_class: "commercial",
          electrical_services: 1,
        },
      }),
    ).toBe(10_200);
    // One scope, one rule: the residential rule never charges a commercial release.
    expect(
      codesFor(
        "electrical",
        {
          custom: {
            electrical_scope: "service_release",
            customer_class: "commercial",
            electrical_services: 2,
          },
        },
        "ELEC-SERVICE-RELEASE",
      ),
    ).toEqual(["ELEC-SERVICE-RELEASE-COM"]);
    // An emergency reconnection reads the same count under a different scope.
    expect(
      componentFor("electrical", "ELEC-EMERGENCY-RECONNECT", {
        custom: { electrical_scope: "emergency_reconnect", electrical_services: 1 },
      }),
    ).toBe(10_200);
    expect(
      codesFor(
        "electrical",
        { custom: { electrical_scope: "emergency_reconnect", electrical_services: 1 } },
        "ELEC-SERVICE-RELEASE",
      ),
    ).toEqual([]);
  });

  it("prices signs at $20.00 each and charges no reinspection unless one happened", () => {
    expect(componentFor("electrical", "ELEC-SIGNS", { custom: { signs: 2 } })).toBe(4_000);
    expect(codesFor("electrical", { custom: { signs: 2 } }, "ELEC-REINSPECTION")).toEqual([]);
    expect(
      codesFor("electrical", { custom: { signs: 2, reinspection: true } }, "ELEC-REINSPECTION"),
    ).toEqual(["ELEC-REINSPECTION"]);
  });
});
