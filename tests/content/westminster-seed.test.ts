import { describe, expect, it } from "vitest";

import { houstonSeed } from "@/content/houston";
import {
  WESTMINSTER_LAST_VERIFIED,
  WESTMINSTER_PUBLISHED_PERMIT_PAGES,
  westminsterSeed,
} from "@/content/westminster";
import { WESTMINSTER_VALUATION_RULES } from "@/content/westminster/fee-rules";
import { calculatePermitFees, validateFeeRule, type CalculationInput } from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Westminster's content, checked against the document it came from — without a database.
 *
 * Two properties here are worth more than the rest of the file.
 *
 *  1. **Every seam closes.** This is the first schedule on the site whose bands chain
 *     exactly at all seven handovers, and that is a finding about the document rather
 *     than a convenience. Each opening figure is asserted against what the band below
 *     produces at its own top — $19.50, $59.25, $332.95, $546.70, $844.20, $2,684.20
 *     and $4,659.20 — because "the table agrees with itself" is exactly the kind of
 *     claim that is easy to write and rare to verify.
 *  2. **A trade is an addition, and it cannot be charged twice.** The 15% trade rules
 *     are conditioned on `custom.schedule_item absent`, so a flat single-family row
 *     (where the row's own flat figure *is* the permit) cannot also be charged a
 *     project trade fee. Without that test, an air-conditioner replacement would show
 *     $92.00 on one page and $104.00 on another for the same job.
 */

const AS_OF = "2026-01-01";

const rulesFor = (permitTypeKey: string): FeeRuleRecord[] =>
  westminsterSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);

const feeAt = (permitTypeKey: string, input: Partial<CalculationInput> = {}) =>
  calculatePermitFees(
    { asOf: AS_OF, valuationCents: 0, ...input },
    rulesFor(permitTypeKey),
  );

const totalAt = (permitTypeKey: string, input: Partial<CalculationInput> = {}) =>
  feeAt(permitTypeKey, input).totalCents;

/** The valuation table alone, so a seam is measured without review, tax or trades. */
const bandAt = (valuationCents: number) =>
  calculatePermitFees({ asOf: AS_OF, valuationCents }, WESTMINSTER_VALUATION_RULES)
    .totalCents;

const componentTotal = (
  permitTypeKey: string,
  componentType: string,
  input: Partial<CalculationInput> = {},
) =>
  feeAt(permitTypeKey, input)
    .components.filter((component) => component.componentType === componentType)
    .reduce((sum, component) => sum + component.amountCents, 0);

describe("Westminster payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of westminsterSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(westminsterSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(westminsterSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...westminsterSeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of westminsterSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const link of westminsterSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of westminsterSeed.permitPages) {
      expect(permitTypeKeys, page.permitTypeKey).toContain(page.permitTypeKey);
    }
  });

  it("defines Colorado and its own second city, with no new permit type", () => {
    expect(westminsterSeed.state.code).toBe("CO");
    expect(westminsterSeed.state.slug).toBe("colorado");
    expect(westminsterSeed.jurisdiction.slug).toBe("westminster");
    expect(westminsterSeed.jurisdiction.type).toBe("city");
    expect(westminsterSeed.permitTypes).toEqual([]);
    expect(westminsterSeed.projectTypes).toEqual([]);
  });

  it("publishes three pages: building, electrical and plumbing", () => {
    expect(WESTMINSTER_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(westminsterSeed.permitPages.every((page) => page.publishStatus === "published")).toBe(
      true,
    );
    expect(westminsterSeed.permitPages.every((page) => page.noindex === false)).toBe(true);
  });

  it("clears the editorial gate on every page, with an intro of substance", () => {
    for (const page of WESTMINSTER_PUBLISHED_PERMIT_PAGES) {
      expect(page.intro.length, page.slug).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      const verdict = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: westminsterSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: WESTMINSTER_LAST_VERIFIED,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });
      expect(verdict.publishable, `${page.slug}: ${verdict.failures.join("; ")}`).toBe(true);
    }
  });

  it("has no page for mechanical, which is priced but not yet written up", () => {
    const links = westminsterSeed.jurisdictionPermitTypes.map((link) => link.permitTypeKey);
    expect(links).toContain("mechanical");
    expect(westminsterSeed.permitPages.map((page) => page.permitTypeKey)).not.toContain(
      "mechanical",
    );
  });
});

describe("Westminster valuation table — every seam closes", () => {
  it("charges the flat $19.50 below $500", () => {
    expect(bandAt(1)).toBe(1_950);
    expect(bandAt(50_000)).toBe(1_950);
  });

  it("counts the second band in hundreds: $2.65 per additional $100", () => {
    // $501 rounds up to $600: $19.50 + $2.65.
    expect(bandAt(50_001)).toBe(2_215);
    // $2,000 is fifteen hundreds above $500.
    expect(bandAt(200_000)).toBe(5_925);
  });

  it("opens each band with exactly what the band below produces", () => {
    // The property no other jurisdiction on this site has: all seven seams close.
    expect(bandAt(50_000)).toBe(1_950); // $19.50 → the band above opens at $19.50
    expect(bandAt(200_000)).toBe(5_925); // $59.25
    expect(bandAt(2_500_000)).toBe(33_295); // $332.95
    expect(bandAt(5_000_000)).toBe(54_670); // $546.70
    expect(bandAt(10_000_000)).toBe(84_420); // $844.20
    expect(bandAt(50_000_000)).toBe(268_420); // $2,684.20
    expect(bandAt(100_000_000)).toBe(465_920); // $4,659.20
  });

  it("steps by whole thousands of increment above $1,000,000 of valuation", () => {
    // $1,000,001 rounds up to $1,001,000: $4,659.20 + $2.65.
    expect(bandAt(100_000_001)).toBe(466_185);
  });

  it("charges one band only, never two", () => {
    expect(
      calculatePermitFees({ asOf: AS_OF, valuationCents: 2_500_000 }, WESTMINSTER_VALUATION_RULES)
        .components,
    ).toHaveLength(1);
  });
});

describe("Westminster plan review and use tax — percentages of other figures", () => {
  it("charges 65% of the permit fee at every size of job", () => {
    // $250,000: permit fee $1,534.20, review $997.23.
    expect(componentTotal("building", "plan_review", { valuationCents: 25_000_000 })).toBe(99_723);
  });

  it("has no threshold, unlike Denver's review column", () => {
    // A $1 valuation still pays a review fee: 65% of $19.50.
    expect(componentTotal("building", "plan_review", { valuationCents: 100 })).toBe(1_268);
    expect(totalAt("building", { valuationCents: 100 })).toBe(3_220);
  });

  it("charges use tax as 4.25% of half the valuation, exactly", () => {
    // 17/800 of $250,000 is $5,312.50 — not representable in whole basis points.
    expect(componentTotal("building", "surcharge", { valuationCents: 25_000_000 })).toBe(531_250);
    expect(componentTotal("building", "surcharge", { valuationCents: 6_000_000 })).toBe(127_500);
  });

  it("keeps the use tax out of the base the review and trades read", () => {
    const result = feeAt("building", { valuationCents: 6_000_000 });
    const base = result.components
      .filter((component) => component.componentType === "base")
      .reduce((sum, component) => sum + component.amountCents, 0);
    // Review is 65% of the permit fee alone, not of the permit fee plus the tax.
    expect(componentTotal("building", "plan_review", { valuationCents: 6_000_000 })).toBe(
      Math.round((base * 6_500) / 10_000),
    );
  });
});

describe("Westminster trades — additions, not permits of their own", () => {
  it("adds 15% of the permit fee plus 15% of the review fee for each trade", () => {
    // $60,000: permit fee $606.20, so the trade fee is $90.93 and its review share $59.10.
    expect(
      componentTotal("electrical", "other", {
        valuationCents: 6_000_000,
        custom: { electrical_trade: true },
      }),
    ).toBe(9_093 + 5_910);
  });

  it("charges each trade separately, and three trades three times", () => {
    const one = totalAt("building", {
      valuationCents: 25_000_000,
      custom: { plumbing_trade: true },
    });
    const three = totalAt("building", {
      valuationCents: 25_000_000,
      custom: { mechanical_trade: true, plumbing_trade: true, electrical_trade: true },
    });
    const none = totalAt("building", { valuationCents: 25_000_000 });
    expect(none).toBe(784_393); // $7,843.93
    expect(one).toBe(none + (230_13 + 14_958));
    expect(three).toBe(none + 3 * (230_13 + 14_958));
    expect(three).toBe(898_306); // $8,983.06
  });

  it("never charges a project trade fee on a job priced by a flat row", () => {
    // The property that stops an air-conditioner permit being billed twice: flat row
    // $80.00 plus its electrical note $12.00, and no 15% project trade on top.
    const both = totalAt("electrical", {
      custom: { schedule_item: "air_conditioner", electrical_trade: true },
    });
    expect(both).toBe(9_200);
    expect(both).toBe(totalAt("electrical", { custom: { schedule_item: "air_conditioner" } }));
  });

  it("applies the trade fee to the permit fee, not to the review fee or the tax", () => {
    const input = { valuationCents: 25_000_000, custom: { electrical_trade: true } };
    expect(componentTotal("electrical", "other", input)).toBe(23_013 + 14_958);
    expect(componentTotal("electrical", "base", input)).toBe(153_420);
  });
});

describe("Westminster flat items — named jobs priced by the schedule", () => {
  it("prices a water heater replacement at $40.00 with nothing added", () => {
    expect(totalAt("plumbing", { custom: { schedule_item: "water_heater" } })).toBe(4_000);
    expect(feeAt("plumbing", { custom: { schedule_item: "water_heater" } }).components).toHaveLength(1);
  });

  it("prices an air conditioner at $80.00 plus a $12.00 electrical permit fee", () => {
    const result = feeAt("electrical", { custom: { schedule_item: "air_conditioner" } });
    expect(result.totalCents).toBe(9_200);
    expect(result.components.map((component) => component.amountCents)).toEqual([8_000, 1_200]);
  });

  it("adds the same 15% to the other three asterisked rows", () => {
    const expected: Array<[string, number]> = [
      ["furnace", 6_000 + 900],
      ["evaporative_cooler", 6_000 + 900],
      ["spa", 8_000 + 1_200],
    ];
    for (const [item, total] of expected) {
      expect(totalAt("electrical", { custom: { schedule_item: item } }), item).toBe(total);
    }
  });

  it("charges no review and no use tax on a flat row", () => {
    const result = feeAt("plumbing", { custom: { schedule_item: "water_heater" } });
    expect(result.components.some((c) => c.componentType === "plan_review")).toBe(false);
    expect(result.components.some((c) => c.componentType === "surcharge")).toBe(false);
  });

  it("carries the miscellaneous flat permits too", () => {
    expect(totalAt("building", { custom: { schedule_item: "solar_systems" } })).toBe(30_000);
    expect(totalAt("building", { custom: { schedule_item: "demolition" } })).toBe(2_500);
    expect(totalAt("building", { custom: { schedule_item: "detached_storage_shed" } })).toBe(8_000);
  });

  it("defines fifteen flat items, each one mutually exclusive", () => {
    const flatItems = westminsterSeed.feeRules.filter((entry) =>
      entry.rule.id.startsWith("wmk-item-"),
    );
    const items = [...new Set(flatItems.map((entry) => entry.rule.id))];
    expect(items).toHaveLength(15);
    // The single-family and miscellaneous lists are carried by all three permit types:
    // a reader of the plumbing page can still see the fence and the shed, and each flat
    // row is conditioned on one selection, so carrying them changes no total.
    expect(flatItems).toHaveLength(45);

    // Any two items at once would charge two permits for one job; the engine is given
    // one selection, so a payload with two conditions matching is only reachable if a
    // future edit adds a second rule on the same value. This pins the intended shape.
    const selected = new Set<string>();
    for (const entry of westminsterSeed.feeRules) {
      const condition = entry.rule.conditions as { field?: string; value?: unknown } | null;
      if (condition?.field === "custom.schedule_item" && typeof condition.value === "string") {
        selected.add(condition.value);
      }
    }
    expect([...selected].sort()).toEqual(
      [
        "above_ground_pool",
        "air_conditioner",
        "construction_trailer",
        "demolition",
        "detached_storage_shed",
        "evaporative_cooler",
        "fence",
        "furnace",
        "gas_log",
        "lawn_sprinkler",
        "mobile_home_setup",
        "re_roofing",
        "solar_systems",
        "spa",
        "water_heater",
      ].sort(),
    );
  });

  it("falls back to the valuation table when no item is selected", () => {
    const withItem = totalAt("plumbing", { custom: { schedule_item: "water_heater" } });
    const without = totalAt("plumbing", { valuationCents: 100 });
    expect(withItem).toBe(4_000);
    expect(without).toBeGreaterThan(1_950);
  });
});

describe("Westminster worked examples — the payload against its own prose", () => {
  const expected: Record<string, number> = {
    "building-permit-cost": 898_306, // $8,983.06
    "electrical-permit-cost": 9_200, // $92.00
    "plumbing-permit-cost": 4_000, // $40.00
  };

  it("computes the figure each page's notes describe", () => {
    for (const page of WESTMINSTER_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      const result = calculatePermitFees(
        { asOf: AS_OF, ...example!.inputs },
        rulesFor(page.permitTypeKey),
      );
      expect(result.totalCents, page.slug).toBe(expected[page.slug]);
    }
  });

  it("keeps the building example's four lines at the figures its notes name", () => {
    const page = WESTMINSTER_PUBLISHED_PERMIT_PAGES.find(
      (candidate) => candidate.slug === "building-permit-cost",
    )!;
    const result = calculatePermitFees(
      { asOf: AS_OF, ...page.workedExample!.inputs },
      rulesFor(page.permitTypeKey),
    );
    const sums = (type: string) =>
      result.components
        .filter((component) => component.componentType === type)
        .reduce((sum, component) => sum + component.amountCents, 0);
    expect(sums("base")).toBe(153_420); // $1,534.20
    expect(sums("plan_review")).toBe(99_723); // $997.23
    expect(sums("surcharge")).toBe(531_250); // $5,312.50
    expect(sums("other")).toBe(3 * (23_013 + 14_958)); // $1,139.13 across three trades
  });
});
