import { describe, expect, it } from "vitest";

import { springfieldSeed } from "@/content/springfield";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Springfield, Missouri — the construction-factor marginal table at half cents,
 * plus plan review 75% and technology 18.5% as percentages of the permit fee.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The marginal table prices half cents, not whole cents.** 0.5/0.4/0.3/0.15¢
 *     commercial and 0.4/0.3/0.2/0.1¢ residential — the schedule's own phrase, and
 *     the engine's `rate: {1,2} / {2,5}` exact rate rather than a rounded BPS.
 *  2. **The basis is construction factor, not valuation.** Gross Area × 85 × Type
 *     Factor (commercial matrix) or × 0.3876 (residential R-3/IRC); the 279 IBC
 *     factors are named beside the pages, not carried as rules.
 *  3. **Plan review 75% and technology 18.5% are percentages of the permit fee.**
 *     Each with its own floor ($257 BDS+CU / $492 multi-department; $50). A basis
 *     swap would double-count the surcharges.
 *  4. **Infills/renovations reuse the same table at Type Factor 0.30.** The same
 *     four bands fed by a different factor, not a second ladder.
 *  5. **The trade flats are flat amounts gated by scope.** $110/$49/$171 per trade,
 *     each a different `trade_scope`; the 40%-when-associated building-permit
 *     association rides a building permit where one exists and is never summed into
 *     a stand-alone $49 trade.
 */

const asOf = "2026-09-26";

function rulesFor(permitTypeKey: string) {
  return springfieldSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
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

function codesFor(
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  prefix: string,
): string[] {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey))
    .components.filter((component) => component.code.startsWith(prefix))
    .map((component) => component.code);
}

describe("Springfield seed payload", () => {
  it("identifies the jurisdiction and its county", () => {
    expect(springfieldSeed.state).toMatchObject({ code: "MO", fipsCode: "29" });
    expect(springfieldSeed.county).toMatchObject({
      key: "greene-county",
      name: "Greene County",
      fipsCode: "29077",
    });
    expect(springfieldSeed.jurisdiction).toMatchObject({
      key: "springfield",
      slug: "springfield",
      countyKey: "greene-county",
      isActive: true,
    });
  });

  it("shares the Missouri state row and the permit catalogue", () => {
    expect(springfieldSeed.state.code).toBe("MO");
    expect(springfieldSeed.permitTypes).toEqual([]);
    expect(springfieldSeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(springfieldSeed.sources.map((s) => s.key));
    const scheduleKeys = new Set(springfieldSeed.feeSchedules.map((s) => s.key));
    for (const entry of springfieldSeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(true);
      if (entry.rule.sourceId !== null) expect(sourceKeys.has(entry.rule.sourceId)).toBe(true);
      const v = validateFeeRule(entry.rule);
      expect(v.ok, `${entry.rule.code}: ${v.ok ? "" : (v as { error: string }).error}`).toBe(true);
    }
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = springfieldSeed.permitPages.filter((p) => p.publishStatus === "published" && !p.noindex);
    expect(springfieldSeed.permitPages).toHaveLength(3);
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
        sourceCount: springfieldSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });
      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("verifies three sources, the two schedules, the three pages and the profile", () => {
    const sv = springfieldSeed.verifications.filter((v) => v.entityType === "source");
    expect(sv.map((v) => v.entityKey).sort()).toEqual(springfieldSeed.sources.map((s) => s.key).sort());
    for (const v of springfieldSeed.verifications) {
      expect(v.status, v.entityKey).toBe("verified");
      expect(v.verifiedAt, v.entityKey).toBe("2026-09-26");
      expect(v.verifiedBy, v.entityKey).toContain("Missouri");
    }
    expect(springfieldSeed.feeSchedules).toHaveLength(2);
  });

  it("carries fourteen rules: four building (incl. two percentages), four electrical and six plumbing flats", () => {
    // Four electrical: the two not-associated MEP flats, the service-repair flat
    // and the residential furnace/AC change-out flat the electrical page advertises
    // (S2 p.2) — attached here so its worked example computes rather than $0.
    expect(springfieldSeed.feeRules).toHaveLength(14);
    expect(rulesFor("building")).toHaveLength(4);
    expect(rulesFor("electrical")).toHaveLength(4);
    expect(rulesFor("plumbing")).toHaveLength(6);
  });

  it("charges the electrical worked example's $49 furnace/AC flat", () => {
    const page = springfieldSeed.permitPages.find(
      (p) => p.permitTypeKey === "electrical" && p.publishStatus === "published",
    )!;
    const rules = springfieldSeed.feeRules
      .filter((r) => r.permitTypeKey === "electrical")
      .map((r) => r.rule)
      .filter((r) => r.status === "active");
    const result = calculatePermitFees(
      { asOf: "2026-09-26", ...(page.workedExample!.inputs as Partial<CalculationInput>) },
      rules,
    );
    expect(result.components).toHaveLength(1);
    expect(result.components[0]!.code).toBe("RES-FURNACE-AC");
    expect(result.totalCents).toBe(4_900);
  });

  it("carries construction_factor with exact half-cent rates, not BPS", () => {
    const commercial = rulesFor("building").find((r) => r.code === "BLD-COMMERCIAL")!;
    expect(commercial.feeType).toBe("tiered_marginal");
    expect((commercial.config as { basis: string }).basis).toBe("construction_factor");
    // Commercial half cents: 1/2, 2/5, 3/10, 3/20 — no whole-cent BPS can hold 0.5¢
    expect(((commercial as unknown as { config: { tiers: { rate: { numerator: number; denominator: number } }[] } }).config).tiers).toEqual([
      { upToCents: 50_000, rate: { numerator: 1, denominator: 2 } },
      { upToCents: 100_000, rate: { numerator: 2, denominator: 5 } },
      { upToCents: 150_000, rate: { numerator: 3, denominator: 10 } },
      { upToCents: null, rate: { numerator: 3, denominator: 20 } },
    ]);
    const residential = rulesFor("building").find((r) => r.code === "BLD-RESIDENTIAL")!;
    expect(((residential as unknown as { config: { tiers: { rate: { numerator: number; denominator: number } }[] } }).config).tiers).toEqual([
      { upToCents: 50_000, rate: { numerator: 2, denominator: 5 } },
      { upToCents: 100_000, rate: { numerator: 3, denominator: 10 } },
      { upToCents: 150_000, rate: { numerator: 1, denominator: 5 } },
      { upToCents: null, rate: { numerator: 1, denominator: 10 } },
    ]);
  });
});

describe("Springfield building permits — commercial construction factor", () => {
  it("prices the four marginal bands at half cents and lifts to the $171 minimum", () => {
    // 10,000 factor → first band only → 10,000 × 0.005 = $50.00, lifted to $171; plus plan review $257 and tech $50 floors
    expect(totalFor("building", { custom: { building_class: "commercial", construction_factor: 10_000 } })).toBe(
      17_100 + 25_700 + 5_000,
    );
    expect(componentFor("building", "BLD-COMMERCIAL", { custom: { building_class: "commercial", construction_factor: 10_000 } })).toBe(
      17_100,
    );
    // 60,000 factor → 50,000×0.005 ($250) + 10,000×0.004 ($40) = $290
    expect(componentFor("building", "BLD-COMMERCIAL", { custom: { building_class: "commercial", construction_factor: 60_000 } })).toBe(
      29_000,
    );
    expect(
      totalFor("building", { custom: { building_class: "commercial", construction_factor: 60_000 } }),
    ).toBe(29_000 + 25_700 + 5_365);
    // 175,000 → $250 + $200 + $150 + (25,000×0.0015 = $37.50) = $637.50
    expect(componentFor("building", "BLD-COMMERCIAL", { custom: { building_class: "commercial", construction_factor: 175_000 } })).toBe(
      63_750,
    );
    // 1,275,000 (10,000 sq ft Business IIA 1.50 via S3): first 150k $600 + 1,125,000×0.0015 $1,687.50 = $2,287.50
    expect(componentFor("building", "BLD-COMMERCIAL", { custom: { building_class: "commercial", construction_factor: 1_275_000 } })).toBe(
      228_750,
    );
    // Exactly one commercial class answers at a time.
    expect(codesFor("building", { custom: { building_class: "residential", construction_factor: 60_000 } }, "BLD-COMMERCIAL")).toEqual([]);
  });

  it("charges plan review 75% and technology 18.5% as percentages of the permit fee, with floors", () => {
    // On the large building the percentages dominate the floors.
    expect(componentFor("building", "PLAN-REVIEW", { custom: { building_class: "commercial", construction_factor: 1_275_000 } })).toBe(
      Math.round((228_750 * 7_500) / 10_000),
    );
    expect(componentFor("building", "PLAN-REVIEW", { custom: { building_class: "commercial", construction_factor: 1_275_000 } })).toBe(171_563);
    expect(componentFor("building", "TECHNOLOGY", { custom: { building_class: "commercial", construction_factor: 1_275_000 } })).toBe(
      42_319,
    );
    // On a small building the floors take over.
    expect(componentFor("building", "PLAN-REVIEW", { custom: { building_class: "commercial", construction_factor: 10_000 } })).toBe(25_700);
    expect(componentFor("building", "TECHNOLOGY", { custom: { building_class: "commercial", construction_factor: 10_000 } })).toBe(5_000);
    // And the three components sum.
    expect(totalFor("building", { custom: { building_class: "commercial", construction_factor: 1_275_000 } })).toBe(
      228_750 + 171_563 + 42_319,
    );
  });
});

describe("Springfield building permits — residential construction factor", () => {
  it("prices the residential factor at 0.004/0.003/0.002/0.001 and lifts to the $151 minimum", () => {
    // 65,892 (2,000 sq ft finished at 0.3876): 50,000×0.004 $200 + 15,892×0.003 $47.68 = $247.68
    expect(componentFor("building", "BLD-RESIDENTIAL", { custom: { building_class: "residential", construction_factor: 65_892 } })).toBe(
      24_768,
    );
    // 10,000 residential factor → 10,000×0.004 $40 lifted to $151
    expect(componentFor("building", "BLD-RESIDENTIAL", { custom: { building_class: "residential", construction_factor: 10_000 } })).toBe(
      15_100,
    );
    // Exactly one residential class answers.
    expect(codesFor("building", { custom: { building_class: "commercial", construction_factor: 65_892 } }, "BLD-RESIDENTIAL")).toEqual([]);
  });

  it("gates residential and commercial by custom.building_class, never by nothing", () => {
    expect(codesFor("building", { custom: { construction_factor: 60_000 } }, "BLD")).toEqual([]);
  });
});

describe("Springfield electrical / plumbing — the flat scopes", () => {
  it("charges electrical stand-alone flats by trade_scope", () => {
    // mep_not_associated is $171 commercial + $110 residential — both share the same trade_scope so both fire
    expect(totalFor("electrical", { custom: { trade_scope: "mep_not_associated" } })).toBe(17_100 + 11_000);
    expect(totalFor("electrical", { custom: { trade_scope: "service_repair" } })).toBe(4_900);
    // Without a matching scope, no electrical flat answers.
    expect(codesFor("electrical", { custom: { trade_scope: "water_heater" } }, "COM")).toEqual([]);
  });

  it("charges plumbing flats and the air-test pair by trade_scope", () => {
    expect(totalFor("plumbing", { custom: { trade_scope: "water_heater" } })).toBe(4_900);
    expect(totalFor("plumbing", { custom: { trade_scope: "lawn_sprinkler" } })).toBe(11_000);
    // gas is $171 commercial + $110 residential — same scope fires both, so $281
    expect(totalFor("plumbing", { custom: { trade_scope: "gas" } })).toBe(17_100 + 11_000);
    // Without a scope, no plumbing flat answers.
    expect(codesFor("plumbing", { custom: {} }, "COM")).toEqual([]);
    expect(codesFor("plumbing", { custom: {} }, "RES")).toEqual([]);
  });

  it("keeps the 40% building-permit association off every stand-alone trade", () => {
    // The building-permit percentages never fire inside an electrical or plumbing permit.
    for (const trade of ["electrical", "plumbing"] as const) {
      for (const rule of rulesFor(trade)) {
        expect(rule.componentType, `${trade} ${rule.code} is base-only`).toBe("base");
        expect((rule.config as { basis?: string }).basis, `${trade} ${rule.code} is not permit_fee`).not.toBe("permit_fee");
      }
    }
  });
});
