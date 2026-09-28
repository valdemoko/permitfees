import { describe, expect, it } from "vitest";

import { nashuaSeed } from "@/content/nashua";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Nashua, New Hampshire — the data, and the measurements the fee is made of.
 *
 * The checks that matter:
 *
 *  1. **The building fee is area affected, and there are four rates.** $0.18 and $0.28 for
 *     new work, $0.13 and $0.18 for alterations, chosen by occupancy and by whether the work
 *     is an alteration.
 *  2. **The residential and commercial tables are separate, not one table with two
 *     columns.** Four fixtures are $38.00 in a house and $48.00 in a commercial building;
 *     a residential electrical permit has no per-outlet row at all, and a commercial one has
 *     no area rate for new construction.
 *  3. **The surcharge is capped, and it is charged on everything already charged.** The
 *     commercial cap is $750.00 where 100% of the fee would be more, and the residential
 *     cap is $275.00.
 *  4. **Every published example reproduces its own stated total.**
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return nashuaSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

describe("Nashua seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(nashuaSeed.state).toMatchObject({ code: "NH", slug: "new-hampshire", fipsCode: "33" });
    expect(nashuaSeed.county).toMatchObject({
      key: "hillsborough-county",
      name: "Hillsborough County",
      fipsCode: "33011",
    });
    expect(nashuaSeed.jurisdiction).toMatchObject({
      key: "nashua",
      slug: "nashua",
      officialName: "City of Nashua",
      timezone: "America/New_York",
      isActive: true,
    });
  });

  it("shares the New Hampshire state row with Manchester rather than defining its own", () => {
    expect(nashuaSeed.state.code).toBe("NH");
    expect(nashuaSeed.state.slug).toBe("new-hampshire");
    expect(nashuaSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(nashuaSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(nashuaSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of nashuaSeed.feeRules) {
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
    const published = nashuaSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(nashuaSeed.permitPages).toHaveLength(3);
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
        sourceCount: nashuaSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("charges every published example what its own notes say it charges", () => {
    const expected: Record<string, number> = {
      "building-permit-cost": 59_000,
      "electrical-permit-cost": 43_000,
      "plumbing-permit-cost": 10_600,
    };

    for (const page of nashuaSeed.permitPages) {
      const inputs = page.workedExample?.inputs;
      expect(inputs, `${page.slug} has a worked example`).toBeTruthy();
      if (!inputs) continue;

      const result = calculatePermitFees(
        { ...(inputs as Omit<CalculationInput, "asOf">), asOf },
        rulesFor(page.permitTypeKey),
      );
      expect(result.totalCents, `${page.slug} example total`).toBe(expected[page.slug]);
    }
  });
});

describe("Nashua building permits", () => {
  it("charges $0.18 per square foot of area affected for new residential work", () => {
    expect(totalFor("building", { squareFootage: 3_000, occupancy: "residential" })).toBe(59_000);
  });

  it("charges $0.28 per square foot for new commercial work", () => {
    expect(totalFor("building", { squareFootage: 3_000, occupancy: "commercial" })).toBe(89_000);
  });

  it("charges the reduced alteration rates for alterations regardless of the work", () => {
    expect(
      totalFor("building", {
        squareFootage: 400,
        occupancy: "residential",
        custom: { building_alteration: true },
      }),
    ).toBe(10_200); // 400 × $0.13 + $50

    expect(
      totalFor("building", {
        squareFootage: 2_500,
        occupancy: "commercial",
        custom: { building_alteration: true },
      }),
    ).toBe(50_000); // 2,500 × $0.18 + $50
  });

  it("charges additional plan review by occupancy, on top of the permit fee", () => {
    const result = calculatePermitFees(
      {
        asOf,
        squareFootage: 1_000,
        occupancy: "residential",
        custom: { additional_plan_review: true },
      },
      rulesFor("building"),
    );
    const review = result.components.find((component) => component.componentType === "plan_review");

    expect(review?.amountCents).toBe(10_000); // 1,000 sq ft × $0.10
    // "Additional" plan review is additional: the permit fee itself still applies, so the
    // total is 1,000 sq ft × $0.18 of building fee, the $100.00 of review, and the $50.00
    // application fee.
    expect(result.totalCents).toBe(33_000);
  });
});

describe("Nashua unpermitted-work surcharge", () => {
  it("charges 100% of what the permit already charges, capped at $750 commercial", () => {
    const result = calculatePermitFees(
      {
        asOf,
        squareFootage: 5_000,
        occupancy: "commercial",
        custom: { worked_without_permit: true },
      },
      rulesFor("building"),
    );
    const surcharge = result.components.find(
      (component) => component.componentType === "surcharge",
    );

    // $1,400 of area charge + $50 application fee = $1,450, doubled is $2,900, capped at
    // $750 — so the total is $1,450 + $750 rather than double.
    expect(surcharge?.amountCents).toBe(75_000);
    expect(result.totalCents).toBe(220_000);
  });

  it("charges the uncapped 100% where the fee is under the residential cap", () => {
    const result = calculatePermitFees(
      {
        asOf,
        squareFootage: 400,
        occupancy: "residential",
        custom: { building_alteration: true, worked_without_permit: true },
      },
      rulesFor("building"),
    );
    const surcharge = result.components.find(
      (component) => component.componentType === "surcharge",
    );

    expect(surcharge?.amountCents).toBe(10_200); // $52 + $50, doubled
    expect(result.totalCents).toBe(20_400);
  });
});

describe("Nashua electrical permits", () => {
  it("prices a commercial service entrance per ampere and a residential one flat", () => {
    expect(
      totalFor("electrical", {
        occupancy: "commercial",
        custom: { service_entrance: true, amperage: 400 },
      }),
    ).toBe(25_000); // 400 A × $0.50 + $50

    expect(
      totalFor("electrical", {
        occupancy: "residential",
        custom: { service_entrance: true, amperage: 400 },
      }),
    ).toBe(8_500); // $35.00 flat + $50 — the amperage changes nothing here
  });

  it("counts outlets and lighting fixtures at $1.00 each, commercial only", () => {
    expect(
      totalFor("electrical", {
        occupancy: "commercial",
        custom: { outlets: 120, lighting_fixtures: 60 },
      }),
    ).toBe(23_000);

    // A house's electrical permit has no outlet row: the $1.00 count does not apply.
    const residential = calculatePermitFees(
      { asOf, occupancy: "residential", custom: { outlets: 120 } },
      rulesFor("electrical"),
    );
    expect(residential.totalCents).toBe(5_000); // the application fee alone
    expect(residential.components.some((component) => component.code === "ELEC-COM-OUTLETS")).toBe(
      false,
    );
  });

  it("covers the first two units in a residential service change", () => {
    expect(
      totalFor("electrical", {
        occupancy: "residential",
        units: 4,
        custom: { service_change: true },
      }),
    ).toBe(14_500); // $55 + 2 × $20 + $50
  });

  it("prices residential low-voltage wiring by the square foot of work area", () => {
    expect(
      totalFor("electrical", {
        occupancy: "residential",
        squareFootage: 2_000,
        custom: { low_voltage: true },
      }),
    ).toBe(21_000); // 2,000 × $0.080 + $50
  });

  it("offers the annual permit, which is one fee rather than many", () => {
    const result = calculatePermitFees(
      { asOf, occupancy: "commercial", custom: { annual_permit: true } },
      rulesFor("electrical"),
    );
    expect(result.totalCents).toBe(35_000); // $300 + $50
  });
});

describe("Nashua plumbing permits", () => {
  it("charges $9.50 a fixture residential and $12.00 commercial", () => {
    expect(totalFor("plumbing", { occupancy: "residential", fixtures: 4 })).toBe(8_800);
    expect(totalFor("plumbing", { occupancy: "commercial", fixtures: 4 })).toBe(9_800);
  });

  it("charges $18.00 residential and $25.00 commercial for an electric water heater", () => {
    expect(
      totalFor("plumbing", { occupancy: "residential", custom: { heaters: 1 } }),
    ).toBe(6_800);
    expect(totalFor("plumbing", { occupancy: "commercial", custom: { heaters: 1 } })).toBe(7_500);
  });

  it("counts commercial rows a house does not have", () => {
    const result = calculatePermitFees(
      {
        asOf,
        occupancy: "commercial",
        fixtures: 12,
        custom: { grease_interceptor: true, irrigation_system: true, backflow_devices: 2 },
      },
      rulesFor("plumbing"),
    );

    // 12 × $12 + $30 grease interceptor + $20 irrigation (which includes its backflow
    // preventer) + 2 × $16 backflow + $50 application fee.
    expect(result.totalCents).toBe(27_600);
  });

  it("charges $75.00 for a re-inspection on every schedule", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const result = calculatePermitFees(
        {
          asOf,
          occupancy: "residential",
          squareFootage: 1_000,
          fixtures: 2,
          custom: { reinspection: true },
        },
        rulesFor(permitTypeKey),
      );
      const inspection = result.components.find(
        (component) => component.componentType === "inspection",
      );
      expect(inspection?.amountCents, `${permitTypeKey} re-inspection`).toBe(7_500);
    }
  });
});
