import { describe, expect, it } from "vitest";

import { memphisSeed } from "@/content/memphis";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Memphis / Shelby County, Tennessee — the county OCCE's one schedule for six cities,
 * a commercial valuation ladder that chains, nine flat plan-review bands, and two
 * residential branches by area and valuation.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The commercial ladder prorates.** Shelby County writes \"$5.00/1,000\" with no
 *     \"or fraction thereof\" — a $25,000.01 valuation buys pennies of the next band's
 *     rate, not a whole $3.50 — the opposite of Nashville's ladder, asserted adjacent.
 *  2. **The commercial ladder chains.** $3,537.50 is $125 + 975 × $3.50 and $57,537.50
 *     is $3,537.50 + 24,000 × $2.25 — the bases are derivable rather than printed over
 *     a seam, the second finding this branch tests.
 *  3. **Residential is area, not valuation — except alteration is valuation again.**
 *     $0.07 a foot with a $125 floor, and alteration $5.00 per $1,000 clamped $50–$325,
 *     two residential rules gated by scope rather than by building class alone.
 *  4. **The plan review is nine flat valuations, not half the permit fee.** $80–$3,000
 *     by valuation, one flat amount per bracket.
 *  5. **The cover line is the surcharge.** $4 admin + $1/$5 on every permit as `other`.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return memphisSeed.feeRules
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

describe("Memphis seed payload", () => {
  it("identifies the jurisdiction and its county", () => {
    expect(memphisSeed.state).toMatchObject({ code: "TN", fipsCode: "47" });
    expect(memphisSeed.county).toMatchObject({
      key: "shelby-county",
      name: "Shelby County",
      fipsCode: "47157",
    });
    expect(memphisSeed.jurisdiction).toMatchObject({
      key: "memphis",
      slug: "memphis",
      countyKey: "shelby-county",
      isActive: true,
    });
  });

  it("shares the Tennessee state row and the permit catalogue", () => {
    expect(memphisSeed.state.code).toBe("TN");
    expect(memphisSeed.permitTypes).toEqual([]);
    expect(memphisSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(memphisSeed.sources.map((s) => s.key));
    const scheduleKeys = new Set(memphisSeed.feeSchedules.map((s) => s.key));
    for (const entry of memphisSeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(true);
      if (entry.rule.sourceId !== null) expect(sourceKeys.has(entry.rule.sourceId)).toBe(true);
      const v = validateFeeRule(entry.rule);
      expect(v.ok, `${entry.rule.code}: ${v.ok ? "" : (v as { error: string }).error}`).toBe(true);
    }
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = memphisSeed.permitPages.filter((p) => p.publishStatus === "published" && !p.noindex);
    expect(memphisSeed.permitPages).toHaveLength(3);
    expect(published.map((p) => p.slug).sort()).toEqual([
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
        sourceCount: memphisSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });
      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("verifies every source, the schedule, the three pages and the profile", () => {
    const sv = memphisSeed.verifications.filter((v) => v.entityType === "source");
    expect(sv.map((v) => v.entityKey).sort()).toEqual(memphisSeed.sources.map((s) => s.key).sort());
    for (const v of memphisSeed.verifications) {
      expect(v.status, v.entityKey).toBe("verified");
      expect(v.verifiedAt, v.entityKey).toBe("2026-09-25");
      expect(v.verifiedBy, v.entityKey).toContain("Tennessee");
    }
  });
});

describe("Memphis building permits", () => {
  it("walks the commercial ladder and proves it prorates", () => {
    // Band 1: $5.00 per $1,000, no base. $25,000 is $125. $5,000 computes $25 and is lifted by the $75 minimum.
    expect(componentFor("building", "BLD-COMM-1", { valuationCents: 2_500_000, custom: commercial })).toBe(12_500);
    expect(componentFor("building", "BLD-COMM-1", { valuationCents: 1_000_000, custom: commercial })).toBe(5_000);
    expect(componentFor("building", "BLD-COMM-MINIMUM", { valuationCents: 500_000, custom: commercial })).toBe(5_000);
    expect(totalFor("building", { valuationCents: 500_000, custom: commercial })).toBe(7_500 + 8_000 + 900);
    // Proration: one cent of valuation above $25,000 buys pennies of the next band's $3.50, not a whole $3.50.
    expect(
      componentFor("building", "BLD-COMM-2", { valuationCents: 2_500_100, custom: commercial }),
    ).toBe(12_500);
    expect(totalFor("building", { valuationCents: 2_500_100, custom: commercial })).toBe(
      12_500 + 16_000 + 900,
    );
    // Seam arithmetic: $3,537.50 is derivable (no printed-seam finding), and the same for $57,537.50.
    expect(componentFor("building", "BLD-COMM-2", { valuationCents: 100_000_000, custom: commercial })).toBe(
      353_750,
    );
    expect(componentFor("building", "BLD-COMM-3", { valuationCents: 100_000_100, custom: commercial })).toBe(
      353_750,
    );
    expect(componentFor("building", "BLD-COMM-3", { valuationCents: 2_500_000_000, custom: commercial })).toBe(
      5_753_750,
    );
    expect(componentFor("building", "BLD-COMM-4", { valuationCents: 2_500_000_100, custom: commercial })).toBe(
      5_753_750,
    );
    // Exactly one commercial band charges at a time (the permit_minimum rides at 0 above the floor and is not a band).
    expect(
      codesFor("building", { valuationCents: 75_000_000, custom: commercial }, "BLD-COMM").filter(
        (code) => !code.endsWith("MINIMUM"),
      ),
    ).toEqual(["BLD-COMM-2"]);
  });

  it("prices residential new construction by area and alterations by valuation", () => {
    // New construction: $0.07 a foot, $125 floor. 1,000 sq ft is $70 lifted to $125; 2,000 is $140.
    expect(totalFor("building", { squareFootage: 1_000, custom: { building_class: "residential" } })).toBe(
      12_500 + 500,
    );
    expect(totalFor("building", { squareFootage: 2_000, custom: { building_class: "residential" } })).toBe(
      14_000 + 500,
    );
    // Alteration/repair: $5.00/1,000 clamped $50–$325.
    expect(
      componentFor("building", "BLD-RES-ALTERATION", {
        valuationCents: 400_000,
        custom: { building_class: "residential", residential_scope: "alteration" },
      }),
    ).toBe(5_000);
    expect(
      componentFor("building", "BLD-RES-ALTERATION", {
        valuationCents: 3_000_000,
        custom: { building_class: "residential", residential_scope: "alteration" },
      }),
    ).toBe(15_000);
    expect(
      componentFor("building", "BLD-RES-ALTERATION", {
        valuationCents: 10_000_000,
        custom: { building_class: "residential", residential_scope: "alteration" },
      }),
    ).toBe(32_500);
    // Without the alteration scope, no alteration row charges.
    expect(
      codesFor(
        "building",
        { valuationCents: 4_000_000, custom: { building_class: "residential" } },
        "BLD-RES-ALTERATION",
      ),
    ).toEqual([]);
  });

  it("charges the nine-band plan review and the $4 + $5 commercial / $4 + $1 residential other charges", () => {
    expect(
      componentFor("building", "BLD-PLAN-REVIEW", { valuationCents: 2_000_000, custom: commercial }),
    ).toBe(8_000);
    expect(
      componentFor("building", "BLD-PLAN-REVIEW", { valuationCents: 75_000_000, custom: commercial }),
    ).toBe(120_000);
    expect(
      componentFor("building", "BLD-PLAN-REVIEW", { valuationCents: 600_000_000, custom: commercial }),
    ).toBe(300_000);
    // The worked example: $750,000 commercial addition is $266,250 valuation fee + $120,000 plan review + $900 other.
    expect(totalFor("building", { valuationCents: 75_000_000, custom: commercial })).toBe(
      266_250 + 120_000 + 900,
    );
    // Residential $5 other vs commercial $9 (residential new construction is area-gated: 1,000 sq ft → $125 floor + $5 other).
    expect(totalFor("building", { squareFootage: 1_000, custom: { building_class: "residential" } })).toBe(
      12_500 + 500,
    );
  });
});

describe("Memphis electrical permits", () => {
  it("branches new multi-family by amperage and adds $1 per tenant", () => {
    expect(
      componentFor("electrical", "ELEC-MF-NEW-0-150", {
        units: 10,
        custom: { electrical_scope: "new_multifamily", amperage: 100 },
      }),
    ).toBe(7_000);
    expect(
      componentFor("electrical", "ELEC-MF-NEW-151-400", {
        custom: { electrical_scope: "new_multifamily", amperage: 300 },
      }),
    ).toBe(12_500);
    expect(
      componentFor("electrical", "ELEC-MF-NEW-PER-TENANT", {
        units: 12,
        custom: { electrical_scope: "new_multifamily" },
      }),
    ).toBe(1_200);
  });

  it("branches existing residential by circuit count", () => {
    expect(
      componentFor("electrical", "ELEC-EXISTING-1-5", {
        custom: { electrical_scope: "existing_residential", circuits: 4 },
      }),
    ).toBe(3_000);
    expect(
      componentFor("electrical", "ELEC-EXISTING-OVER-5", {
        custom: { electrical_scope: "existing_residential", circuits: 9 },
      }),
    ).toBe(4_500);
    expect(
      codesFor("electrical", { custom: { electrical_scope: "existing_residential", circuits: 5 } }, "ELEC-EXISTING"),
    ).toEqual(["ELEC-EXISTING-1-5"]);
  });

  it("prices commercial amperage and KVA as currency-per-unit", () => {
    expect(
      componentFor("electrical", "ELEC-COM-120-240", {
        custom: { electrical_scope: "commercial_new_service", electrical_voltage: "120_240", amperage: 200 },
      }),
    ).toBe(20_000);
  });
});

describe("Memphis plumbing permits", () => {
  it("prices $7.50 fixtures and $30 residential sewer", () => {
    expect(componentFor("plumbing", "PLUMB-FIXTURE", { fixtures: 2 })).toBe(1_500);
    expect(
      componentFor("plumbing", "PLUMB-RES-SEWER", {
        custom: { sewer_scope: "residential_connection" },
      }),
    ).toBe(3_000);
    expect(totalFor("plumbing", { fixtures: 5 })).toBe(3_750 + 2_400);
  });

  it("prices commercial sewer/fire at $8.00 per $1,000 with $100 floor", () => {
    expect(
      componentFor("plumbing", "PLUMB-COM-SEWER", {
        valuationCents: 500_000,
        custom: { sewer_scope: "commercial" },
      }),
    ).toBe(10_000);
    expect(
      componentFor("plumbing", "PLUMB-COM-SEWER", {
        valuationCents: 5_000_000,
        custom: { sewer_scope: "commercial" },
      }),
    ).toBe(40_000);
    expect(
      totalFor("plumbing", {
        valuationCents: 5_000_000,
        fixtures: 2,
        custom: { sewer_scope: "commercial" },
      }),
    ).toBe(1_500 + 40_000 + 2_400);
  });

  it("tiers water service and large commercial water / fire protection correctly", () => {
    expect(componentFor("plumbing", "PLUMB-WATER-1IN", { custom: { water_service_size: "1in" } })).toBe(2_000);
    expect(
      componentFor("plumbing", "PLUMB-COM-WATER-LARGE", {
        valuationCents: 500_000,
        custom: { water_service_size: "over_2_1_2in" },
      }),
    ).toBe(20_000);
    expect(
      componentFor("plumbing", "PLUMB-FIRE", {
        valuationCents: 5_000_000,
        custom: { plumbing_scope: "fire_protection" },
      }),
    ).toBe(40_000);
  });
});
