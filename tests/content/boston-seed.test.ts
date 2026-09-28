import { describe, expect, it } from "vitest";

import { bostonSeed } from "@/content/boston";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Boston, Massachusetts — one sheet, five building rows, three electrical branches.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **Exactly one building row prices an application.** The sheet lists rows as types of
 *     filing, so the model selects one by `custom.form_type` with the Short Form as the
 *     catch-all — asserted across every row rather than sampled.
 *  2. **The rate prorates.** The sheet never prints "or fraction thereof", so $47,550 pays
 *     $475.50 of rate rather than a whole $480.00 step. Cambridge, the next city in this
 *     state, prints the phrase and rounds up; that contrast is asserted in both tests.
 *  3. **The electrical branches are exclusive and priced from the right fact.** Amperage
 *     with a voltage band, devices when the service is untouched, cost when neither
 *     applies — and the $20.00 application fee charges once across all of them.
 *  4. **No percentage exists anywhere in this jurisdiction.** Every rule is a `base`
 *     component: no plan review, no technology fee, no state surcharge.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return bostonSeed.feeRules
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

describe("Boston seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(bostonSeed.state).toMatchObject({
      code: "MA",
      slug: "massachusetts",
      fipsCode: "25",
    });
    expect(bostonSeed.county).toMatchObject({
      key: "suffolk-county",
      fipsCode: "25025",
    });
    expect(bostonSeed.jurisdiction).toMatchObject({
      key: "boston",
      slug: "boston",
      officialName: "City of Boston",
      countyKey: "suffolk-county",
      timezone: "America/New_York",
      isActive: true,
    });
  });

  it("shares the Massachusetts state row and the permit catalogue", () => {
    expect(bostonSeed.state.code).toBe("MA");
    expect(bostonSeed.permitTypes).toEqual([]);
    expect(bostonSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(bostonSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(bostonSeed.feeSchedules.map((schedule) => schedule.key));

    for (const entry of bostonSeed.feeRules) {
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

  it("charges only flat, per-unit, per-$1,000 and per-ampere components — Boston publishes no percentage", () => {
    const componentTypes = new Set(
      bostonSeed.feeRules.map((entry) => entry.rule.componentType),
    );
    expect([...componentTypes].sort()).toEqual(["base"]);

    const feeTypes = new Set(bostonSeed.feeRules.map((entry) => entry.rule.feeType));
    expect([...feeTypes].sort()).toEqual(["flat", "per_thousand", "per_unit", "percent"]);
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = bostonSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(bostonSeed.permitPages).toHaveLength(3);
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
        sourceCount: bostonSeed.sources.length,
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
    const sourceVerifications = bostonSeed.verifications.filter(
      (verification) => verification.entityType === "source",
    );
    expect(sourceVerifications.map((verification) => verification.entityKey).sort()).toEqual(
      bostonSeed.sources.map((source) => source.key).sort(),
    );

    for (const verification of bostonSeed.verifications) {
      expect(verification.status, verification.entityKey).toBe("verified");
      expect(verification.verifiedAt, verification.entityKey).toBe("2026-09-25");
      expect(verification.verifiedBy, verification.entityKey).toContain("Massachusetts");
    }
  });
});

describe("Boston building permits", () => {
  it("prices one row per application, with the Short Form as the catch-all", () => {
    // The sheet lists rows as types of filing, so exactly one must answer. The Short Form
    // is written as `not_in` the other four, which is what lets an absent form type still
    // produce a number.
    const cost = { valuationCents: 4_750_000 };

    expect(codesFor("building", cost, "BLD-")).toEqual(["BLD-SHORT-FORM"]);
    expect(
      codesFor("building", { ...cost, custom: { form_type: "long_form" } }, "BLD-"),
    ).toEqual(["BLD-LONG-FORM"]);
    expect(
      codesFor("building", { ...cost, custom: { form_type: "amendment" } }, "BLD-"),
    ).toEqual(["BLD-AMENDMENT"]);
    expect(
      codesFor(
        "building",
        { ...cost, custom: { form_type: "change_of_occupancy", building_category: "one_two_three_family" } },
        "BLD-",
      ),
    ).toEqual(["BLD-CHANGE-OF-OCCUPANCY-1TO3"]);
    expect(
      codesFor(
        "building",
        { ...cost, custom: { form_type: "change_of_occupancy", building_category: "four_family_or_more" } },
        "BLD-",
      ),
    ).toEqual(["BLD-CHANGE-OF-OCCUPANCY-OTHER"]);
    // Nominal is one row printed as two lines: the $300.00 fee and its $50.00 application.
    expect(
      codesFor("building", { ...cost, custom: { form_type: "nominal_fee" } }, "BLD-"),
    ).toEqual(["BLD-NOMINAL-APPLICATION", "BLD-NOMINAL-FEE"]);
  });

  it("charges the worked example as its notes state", () => {
    // $47,500 Short Form: $20.00 + 47.5 × $10.00 = $495.00. The half thousand is charged
    // as half a rate because the sheet prints no "or fraction thereof".
    expect(totalFor("building", { valuationCents: 4_750_000, custom: { form_type: "short_form" } })).toBe(
      49_500,
    );
    expect(totalFor("building", { valuationCents: 4_750_000, custom: { form_type: "long_form" } })).toBe(
      52_500,
    );
    expect(totalFor("building", { valuationCents: 4_750_000, custom: { form_type: "amendment" } })).toBe(
      49_500,
    );
  });

  it("prorates instead of rounding up to the next thousand", () => {
    // $47,550 → 47.55 × $10.00 = $475.50 of rate, $495.50 in all. A rounded-up schedule
    // would charge $480.00 of rate here; Cambridge's is asserted in its own test.
    const amount = componentFor("building", "BLD-SHORT-FORM", {
      valuationCents: 4_755_000,
      custom: { form_type: "short_form" },
    });
    expect(amount).toBe(49_550);

    // A partial thousand is a partial rate too: $500 of cost is $5.00 of rate at the
    // sheet's $10.00 per $1,000, so the Short Form is $25.00 in all.
    expect(componentFor("building", "BLD-SHORT-FORM", { valuationCents: 50_000 })).toBe(2_500);
  });

  it("charges the flat rows without reading a cost at all", () => {
    expect(
      totalFor("building", {
        custom: { form_type: "change_of_occupancy", building_category: "one_two_three_family" },
      }),
    ).toBe(2_000);
    expect(
      totalFor("building", {
        custom: { form_type: "change_of_occupancy", building_category: "commercial" },
      }),
    ).toBe(5_000);
    // An unstated category lands on the schedule's larger figure rather than charging nothing.
    expect(
      totalFor("building", { custom: { form_type: "change_of_occupancy" } }),
    ).toBe(5_000);
    // Nominal: $300.00 fee plus the $50.00 application fee printed in the same cell.
    expect(totalFor("building", { custom: { form_type: "nominal_fee" } })).toBe(35_000);
  });
});

describe("Boston electrical permits", () => {
  it("prices a service change by amperage, with the voltage picking the band", () => {
    const service = { custom: { service_change: true, amperage: 200 } };

    // 200 A at 240 V: $20.00 application + 200 × $0.25 = $70.00.
    expect(totalFor("electrical", { ...service, custom: { ...service.custom, service_voltage: 240 } })).toBe(
      7_000,
    );
    // An unstated voltage lands in the 240-volt band — the common residential service.
    expect(totalFor("electrical", service)).toBe(7_000);
    // Above 240 V: $20.00 + 200 × $0.75 = $170.00.
    expect(
      totalFor("electrical", { custom: { service_change: true, amperage: 200, service_voltage: 480 } }),
    ).toBe(17_000);
    // 400 A above 240 V: $20.00 + $300.00 = $320.00 — the figure the page prints.
    expect(
      totalFor("electrical", { custom: { service_change: true, amperage: 400, service_voltage: 480 } }),
    ).toBe(32_000);

    // Exactly one branch answers a service change.
    expect(
      codesFor("electrical", { custom: { service_change: true, amperage: 200, service_voltage: 480 } }, "ELEC-"),
    ).toEqual(["ELEC-APPLICATION", "ELEC-SERVICE-OVER-240V"]);
  });

  it("prices devices and meters when the service does not change", () => {
    // $20.00 application + 12 devices at $1.00 + two approved meters at $5.00 = $37.00.
    expect(totalFor("electrical", { custom: { electrical_units: 12, meters: 2 } })).toBe(3_700);
    // A cost is present too, but the device branch is the one that answers.
    expect(
      codesFor("electrical", { valuationCents: 300_000, custom: { electrical_units: 12 } }, "ELEC-"),
    ).toEqual(["ELEC-APPLICATION", "ELEC-DEVICES"]);
  });

  it("falls back to cost only when neither branch above applies", () => {
    // $3,000 of cost: $20.00 application + $30.00 of rate = $50.00.
    expect(totalFor("electrical", { valuationCents: 300_000 })).toBe(5_000);
    expect(
      codesFor("electrical", { valuationCents: 300_000, custom: { service_change: true, amperage: 200 } }, "ELEC-"),
    ).not.toContain("ELEC-COST-FALLBACK");
  });

  it("prices the rows with their own rates, and the temporary service swap", () => {
    // Fire Alarm: $20.00 + $10.00 per $1,000 of a $5,000 estimate = $70.00.
    expect(
      totalFor("electrical", { valuationCents: 500_000, custom: { electrical_scope: "fire_alarm" } }),
    ).toBe(7_000);
    expect(
      totalFor("electrical", { valuationCents: 500_000, custom: { electrical_scope: "low_voltage" } }),
    ).toBe(7_000);
    // Temporary Service replaces the $20.00 application with its own $25.00, and adds nothing.
    expect(totalFor("electrical", { custom: { electrical_scope: "temporary_service" } })).toBe(2_500);
    expect(codesFor("electrical", { custom: { electrical_scope: "temporary_service" } }, "ELEC-")).toEqual([
      "ELEC-TEMPORARY-SERVICE",
    ]);
  });
});

describe("Boston plumbing permits", () => {
  it("charges the application fee with or without a fixture count", () => {
    expect(totalFor("plumbing", {})).toBe(2_000);
    expect(totalFor("plumbing", { fixtures: 5 })).toBe(4_500);
    expect(totalFor("plumbing", { fixtures: 8 })).toBe(6_000);
    expect(componentFor("plumbing", "PLUMB-FIXTURES", { fixtures: 5 })).toBe(2_500);
  });
});
